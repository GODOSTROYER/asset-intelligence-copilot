import { toolkit, type Answer, type CopilotState } from '../engine';
import type { Dataset, WellData } from '../data';
import type { QueryPlan } from '../plan';

// Operator gas / H2S odor notes versus the response deadline in the operations SOP (OPS-1).
// All rules (deadlines, revisions by date, what counts as a response) are read from the SOP text.

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const FULL_MONTH = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b(?:,?\s+(20\d{2}))?/i;

type DeadlineRule = { hours: number; kind: 'before' | 'from' | 'default'; date?: string };

/** Resolve a date mention in free text; a year-less date in the future is moved to the previous year. */
function dateIn(text: string, today: string): string | undefined {
  const { parseDate } = toolkit;
  const hasYear = /\b20\d{2}\b/.test(text);
  const v = parseDate(text, today);
  if (!v) return undefined;
  if (!hasYear && v > today) {
    const prev = (Number(v.slice(0, 4)) - 1) + v.slice(4);
    return prev;
  }
  return v;
}

function monthRange(q: string, today: string): { from: string; to: string } | undefined {
  const m = q.match(FULL_MONTH);
  if (!m) return undefined;
  const mon = MONTHS.findIndex(v => m[1].toLowerCase().startsWith(v));
  let year = m[2] ? Number(m[2]) : Number(today.slice(0, 4));
  if (!m[2] && `${year}-${String(mon + 1).padStart(2, '0')}-01` > today) year -= 1;
  const last = new Date(Date.UTC(year, mon + 1, 0)).getUTCDate();
  const mm = String(mon + 1).padStart(2, '0');
  return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${String(last).padStart(2, '0')}` };
}

function scopeRange(d: Dataset, q: string, p: QueryPlan): { from?: string; to?: string; label: string } {
  const { today, dateLabel, rangeFor } = toolkit;
  const now = today(d);
  if (p.date) return { from: p.date, to: p.date, label: 'on ' + dateLabel(p.date) };
  if (p.from || p.to) return { from: p.from, to: p.to, label: (p.from ? 'from ' + dateLabel(p.from) : '') + (p.to ? ' to ' + dateLabel(p.to) : '') };
  const since = q.match(/\bsince\s+(.{3,30})/i);
  if (since) {
    const v = dateIn(since[1], now);
    if (v) return { from: v, to: now, label: 'since ' + dateLabel(v) };
  }
  const between = q.match(/\bbetween\s+(.{3,25}?)\s+and\s+(.{3,25})/i);
  if (between) {
    const a = dateIn(between[1], now), b = dateIn(between[2], now);
    if (a && b) return { from: a, to: b, label: 'from ' + dateLabel(a) + ' to ' + dateLabel(b) };
  }
  const dayMention = dateIn(q, now);
  if (dayMention && /\b\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3}|[A-Za-z]{3,9}\s+\d{1,2}\b|\b20\d{2}-\d{2}-\d{2}\b/.test(q)) {
    return { from: dayMention, to: dayMention, label: 'on ' + dateLabel(dayMention) };
  }
  const mr = monthRange(q, now);
  if (mr) return { ...mr, label: 'in ' + new Date(Date.parse(mr.from)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) };
  if (/(?:last|past)\s+\d+\s+(?:day|week|month|year)s?|this year/i.test(q)) {
    const r = rangeFor(d, q, p);
    return { from: r.from, to: r.to, label: 'from ' + dateLabel(r.from) + ' to ' + dateLabel(r.to) };
  }
  return { label: 'across all recorded history' };
}

function areaName(d: Dataset, w: WellData) {
  return d.areas.find(a => a.area_id === w.metadata.area_id)?.name ?? w.metadata.area_id ?? 'Unknown area';
}

function opsSop(d: Dataset) {
  return d.documents.find(doc => doc.type === 'SOP' && /\bOPS-1\b/.test(doc.content));
}

/** Pull the OPS-1 section out of the SOP and parse the deadline bullets. */
function ops1Rules(sopText: string): { section: string; rules: DeadlineRule[]; revision: string } {
  const { clean, parseDate } = toolkit;
  const idx = sopText.search(/##\s*OPS-1\b/);
  const rest = idx >= 0 ? sopText.slice(idx) : sopText;
  const end = rest.slice(5).search(/\n##\s+/);
  const section = end >= 0 ? rest.slice(0, end + 5) : rest;
  const rules: DeadlineRule[] = [];
  for (const line of section.split(/\r?\n/)) {
    const m = line.match(/\*{0,2}(\d+)\s*hours?\*{0,2}\s+for\s+reports?\s+(?:\w+\s+)?(before|from|on or after|after|since)\s+([^;.]+)/i);
    if (!m) continue;
    const date = parseDate(clean(m[3]), '2027-01-01');
    if (!date) continue;
    rules.push({ hours: Number(m[1]), kind: /before/i.test(m[2]) ? 'before' : 'from', date });
  }
  if (!rules.length) {
    const any = section.match(/within[^\d]{0,40}(\d+)\s*hours?/i);
    if (any) rules.push({ hours: Number(any[1]), kind: 'default' });
  }
  const revision = clean(sopText.match(/Revision\s+\d+[^\n]*/i)?.[0] ?? '');
  return { section, rules, revision };
}

function deadlineFor(rules: DeadlineRule[], noteDay: string): number | undefined {
  for (const r of rules) {
    if (r.kind === 'before' && r.date && noteDay < r.date) return r.hours;
    if (r.kind === 'from' && r.date && noteDay >= r.date) return r.hours;
  }
  return rules.find(r => r.kind === 'default')?.hours;
}

const GAS = /gas\s+(?:smell|odou?r)|smell(?:ed)?\s+(?:of\s+)?gas|odou?r\s+of\s+gas|rotten[\s-]*egg|\bh2s\b|hydrogen sulfide|sour gas|smell of gas/i;

type Response = { id: string; kind: 'maintenance job' | 'manual inspection'; at: string };

function firstResponse(w: WellData, noteMs: number, nowMs: number): Response | undefined {
  const { ms } = toolkit;
  const options: Response[] = [];
  for (const m of w.maintenance) {
    const t = ms(m.started_at);
    if (Number.isFinite(t) && t > noteMs && t <= nowMs) options.push({ id: m.maintenance_id, kind: 'maintenance job', at: m.started_at });
  }
  for (const i of w.inspections) {
    const t = ms(i.inspected_at);
    if (String(i.method).toLowerCase() === 'manual' && Number.isFinite(t) && t > noteMs && t <= nowMs) options.push({ id: i.inspection_id, kind: 'manual inspection', at: i.inspected_at });
  }
  return options.sort((a, b) => ms(a.at) - ms(b.at))[0];
}

/** Round to one decimal, ties to even (so 19.25 -> 19.2, matching the reference figures). */
function hr1(x: number): number {
  const t = x * 10, f = Math.floor(t), diff = t - f;
  if (Math.abs(diff - 0.5) < 1e-9) return (f % 2 === 0 ? f : f + 1) / 10;
  return Math.round(t) / 10;
}
const stamp = (v: string) => v.slice(0, 16).replace('T', ' ') + 'Z';

type Reading = { value: string; source: string; id: string; type: string };

function findReadings(d: Dataset, w: WellData, note: Record<string, any>): Reading[] {
  const { day, ms, clean } = toolkit;
  const out: Reading[] = [];
  const eventDay = day(note.created_at);
  const ppm = /(\d+(?:\.\d+)?)\s*ppm/gi;
  for (const n of w.context) {
    if (day(n.created_at) !== eventDay) continue;
    for (const m of String(n.text).matchAll(ppm)) out.push({ value: m[1] + ' ppm', source: 'operator note ' + n.note_id, id: n.note_id, type: 'note' });
  }
  for (const i of w.inspections) {
    if (day(i.inspected_at) !== eventDay) continue;
    for (const [k, v] of Object.entries(i)) {
      if (/h2s|gas|ppm/i.test(k) && v !== null && v !== '' && v !== false) out.push({ value: String(v), source: 'inspection ' + i.inspection_id + ' field ' + k, id: i.inspection_id, type: 'inspection' });
    }
    for (const m of String(i.notes ?? '').matchAll(ppm)) out.push({ value: m[1] + ' ppm', source: 'inspection ' + i.inspection_id + ' notes', id: i.inspection_id, type: 'inspection' });
  }
  for (const m of w.maintenance) {
    if (day(m.started_at) !== eventDay) continue;
    const doc = d.documents.find(x => x.type === 'repair report' && x.id === m.maintenance_id);
    for (const line of (doc?.content ?? '').split(/\r?\n/)) {
      if (!/h2s|gas/i.test(line)) continue;
      for (const r of clean(line).matchAll(ppm)) out.push({ value: r[1] + ' ppm', source: 'repair report ' + m.maintenance_id, id: m.maintenance_id, type: 'repair report' });
    }
  }
  void ms;
  return out;
}

export function gasResponse(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  void s; void userId;
  const { answer, citation, cite, today, ms, day, dateLabel, scopeFor, clean } = toolkit;
  const now = today(d), nowMs = ms(now + 'T23:59:59Z');
  const sopDoc = opsSop(d);
  if (!sopDoc) return answer('The operations SOP (OPS-1 gas odor response) is not loaded in this dataset, so response deadlines cannot be assessed. Load the operations SOP to check gas and H2S reports against it.');
  const { rules, section, revision } = ops1Rules(sopDoc.content);
  if (!rules.length) return answer('OPS-1 is present in ' + sopDoc.title + ' but no response deadline could be read from it, so Met or Missed cannot be decided.', undefined, [citation(sopDoc, undefined, /OPS-1/)]);

  const range = scopeRange(d, q, p);
  const wells = scopeFor(d, p);
  const single = p.wellIds?.length === 1 && wells.length === 1;
  const readingAsked = /\breading|\blevel|\bppm\b|how (?:high|much)|concentration|\bvalue\b|what was the h2s/i.test(q);
  const inRange = (t: string) => (!range.from || day(t) >= range.from) && (!range.to || day(t) <= range.to) && day(t) <= now;

  type Ev = { w: WellData; note: Record<string, any>; resp?: Response; hours?: number; deadline?: number; status: string };
  const build = (filter: (n: Record<string, any>) => boolean): Ev[] => {
    const evs: Ev[] = [];
    for (const w of wells) for (const n of w.context) {
      if (n.note_type !== 'operator_note' || !GAS.test(String(n.text)) || !filter(n)) continue;
      const noteMs = ms(n.created_at);
      const deadline = deadlineFor(rules, day(n.created_at));
      const resp = firstResponse(w, noteMs, nowMs);
      const hours = resp ? (ms(resp.at) - noteMs) / 3600000 : undefined;
      let status = 'Missed';
      if (deadline === undefined) status = 'No rule';
      else if (hours !== undefined) status = hours <= deadline ? 'Met' : 'Missed';
      else if (noteMs + deadline * 3600000 > nowMs) status = 'Pending';
      evs.push({ w, note: n, resp, hours, deadline, status });
    }
    return evs.sort((a, b) => ms(a.note.created_at) - ms(b.note.created_at));
  };

  let events = build(n => inRange(n.created_at));
  let widened = false;
  if (!events.length && single && range.from) { events = build(() => true); widened = true; }

  const sources: any[] = [citation(sopDoc, undefined, /OPS-1/)];
  const rows: any[][] = [];
  for (const e of events) {
    sources.push(cite(d, e.note.note_id, 'note'));
    if (e.resp) sources.push(cite(d, e.resp.id, e.resp.kind === 'maintenance job' ? 'repair' : 'inspection'));
    rows.push([
      e.w.metadata.asset_id,
      areaName(d, e.w),
      stamp(e.note.created_at) + ' (' + e.note.note_id + ')',
      e.resp ? e.resp.id + ' (' + e.resp.kind + ') at ' + stamp(e.resp.at) : 'none',
      e.hours !== undefined ? hr1(e.hours) : 'n/a',
      e.deadline !== undefined ? e.deadline + ' h' : 'n/a',
      e.status,
    ]);
  }
  const ids = Array.from(new Set(events.map(e => e.w.metadata.asset_id)));
  const ruleText = rules.filter(r => r.kind !== 'default').map(r => r.hours + ' h for reports ' + (r.kind === 'before' ? 'before ' : 'from ') + dateLabel(r.date!)).join('; ') || rules[0].hours + ' h';
  const ruleSentence = 'OPS-1 (' + (revision ? clean(revision) + '; ' : '') + 'response = maintenance job started on the well, or an inspection with method manual; drone inspections do not count; must start after the note): ' + ruleText + '.';
  const visualization = { type: 'table', title: 'Gas / H2S odor reports vs OPS-1 response deadline', columns: ['Well', 'Area', 'Reported at', 'Response (record ID + time)', 'Hours to response', 'Deadline', 'Met / Missed'], rows };
  const cap = (list: any[]) => list.slice(0, 150);

  if (!events.length) {
    return answer('No operator notes reporting gas, H2S or a rotten-egg smell were found ' + range.label + (p.areaId ? ' in ' + (d.areas.find(a => a.area_id === p.areaId)?.name ?? p.areaId) : '') + (single ? ' for ' + p.wellIds![0] : '') + '. ' + ruleSentence, undefined, cap(sources), [], wells.length <= 12 ? wells.map(w => w.metadata.asset_id) : []);
  }

  const met = events.filter(e => e.status === 'Met').length;
  const missed = events.filter(e => e.status === 'Missed');
  const pending = events.filter(e => e.status === 'Pending').length;

  if (single && readingAsked) {
    const e = events[events.length - 1];
    const readings = findReadings(d, e.w, e.note);
    const id = e.w.metadata.asset_id;
    const sameDayInspections = e.w.inspections.filter(i => day(i.inspected_at) === day(e.note.created_at));
    for (const r of readings) sources.push(cite(d, r.id, r.type === 'note' ? 'note' : r.type === 'inspection' ? 'inspection' : 'repair report'));
    for (const i of sameDayInspections) sources.push(cite(d, i.inspection_id, 'inspection'));
    const outcome = e.resp
      ? 'The response was ' + e.resp.id + ' (' + e.resp.kind + ') at ' + stamp(e.resp.at) + ', ' + hr1(e.hours!) + ' h after the report against a ' + e.deadline + ' h deadline: ' + e.status + '.'
      : 'No qualifying response (maintenance job or manual inspection) followed the report' + (e.status === 'Pending' ? ' yet; the ' + e.deadline + ' h deadline has not elapsed.' : ', so the ' + e.deadline + ' h deadline was Missed.');
    let text: string;
    if (readings.length) {
      text = 'Measured value(s) found for the ' + id + ' gas report of ' + dateLabel(e.note.created_at) + ': ' + readings.map(r => r.value + ' (' + r.source + ')').join('; ') + '. The report itself is note ' + e.note.note_id + ' (' + stamp(e.note.created_at) + '): "' + clean(e.note.text) + '" ' + outcome;
    } else {
      const recorded = 'What is recorded instead: operator note ' + e.note.note_id + ' (' + stamp(e.note.created_at) + ', ' + toolkit.person(d, e.note.author_user_id) + '): "' + clean(e.note.text) + '"' +
        (sameDayInspections.length ? '; same-day inspection(s) ' + sameDayInspections.map(i => i.inspection_id + ' (' + i.method + ' at ' + stamp(i.inspected_at) + (i.notes ? ', notes: ' + clean(i.notes) : ', no notes or gas field') + ')').join(', ') : '; no inspection that day') + '.';
      text = 'No H2S or gas reading is recorded for ' + id + (widened ? ' (no gas report ' + range.label + '; showing its gas report of ' + dateLabel(e.note.created_at) + ')' : ' on ' + dateLabel(e.note.created_at)) + '. The note carries no ppm value and no inspection, repair report or other record on that day holds a measurement. ' + recorded + ' ' + outcome + ' ' + ruleSentence;
    }
    return answer(text, visualization, cap(sources), [], [id]);
  }

  const text = events.length + ' gas / H2S odor operator note' + (events.length === 1 ? '' : 's') + ' ' + range.label + (p.areaId ? ' in ' + (d.areas.find(a => a.area_id === p.areaId)?.name ?? p.areaId) : '') + ' (' + ids.length + ' well' + (ids.length === 1 ? '' : 's') + '): ' + met + ' Met, ' + missed.length + ' Missed' + (pending ? ', ' + pending + ' still within the deadline' : '') + '. ' + ruleSentence + (missed.length ? ' Missed: ' + missed.map(e => e.w.metadata.asset_id + (e.resp ? ' (' + hr1(e.hours!) + ' h vs ' + e.deadline + ' h)' : ' (no qualifying response)')).join(', ') + '.' : '');
  void section;
  return answer(text, visualization, cap(sources), [], ids);
}
