import { toolkit, type Answer, type CopilotState } from '../engine';
import type { Dataset, WellData } from '../data';
import type { QueryPlan } from '../plan';

// Cold-weather (freeze protection) rule from the operations SOP, OPS-5, checked against inspections and maintenance.
// Threshold, season, required job and allowed days are all parsed from the SOP text.

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const FULL_MONTH = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b(?:,?\s+(20\d{2}))?/i;

type Ops5 = { section: string; heading: string; threshold: number; days: number; job: string; fromMonth: number; fromDay: number; toMonth: number; toDay: number };

function monthIndex(name: string) { return MONTHS.findIndex(v => name.toLowerCase().startsWith(v)); }

function parseOps5(text: string): Ops5 | undefined {
  const { clean } = toolkit;
  const idx = text.search(/##\s*OPS-5\b/);
  if (idx < 0) return undefined;
  const rest = text.slice(idx);
  const end = rest.slice(5).search(/\n##\s+/);
  const section = end >= 0 ? rest.slice(0, end + 5) : rest;
  const body = clean(section.replace(/\*/g, ''));
  const heading = clean(section.split(/\r?\n/)[0].replace(/^#+\s*/, ''));
  const thr = body.match(/at or below\s*([−–-]?)\s*(\d+(?:\.\d+)?)\s*°?\s*C/i);
  const days = body.match(/within\s+(\d+)\s+days?/i);
  const job = body.match(/contains\s+["“]([^"”]+)["”]/i);
  const season = heading.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s*[–—-]\s*(\d{1,2})\s+([A-Za-z]{3,9})/) ?? body.match(/From\s+(\d{1,2})\s+([A-Za-z]{3,9})\s+to\s+(\d{1,2})\s+([A-Za-z]{3,9})/i);
  if (!thr || !days || !job || !season) return undefined;
  return {
    section: body, heading,
    threshold: (thr[1] ? -1 : 1) * Number(thr[2]),
    days: Number(days[1]), job: job[1],
    fromDay: Number(season[1]), fromMonth: monthIndex(season[2]),
    toDay: Number(season[3]), toMonth: monthIndex(season[4]),
  };
}

function inSeason(dateStr: string, r: Ops5): boolean {
  const md = Number(dateStr.slice(5, 7)) * 100 + Number(dateStr.slice(8, 10));
  const a = (r.fromMonth + 1) * 100 + r.fromDay, b = (r.toMonth + 1) * 100 + r.toDay;
  return a <= b ? md >= a && md <= b : md >= a || md <= b;
}

function dateIn(text: string, today: string): string | undefined {
  const v = toolkit.parseDate(text, today);
  if (!v) return undefined;
  if (!/\b20\d{2}\b/.test(text) && v > today) return (Number(v.slice(0, 4)) - 1) + v.slice(4);
  return v;
}

function scopeRange(d: Dataset, q: string, p: QueryPlan): { from?: string; to?: string; label: string } {
  const { today, dateLabel } = toolkit;
  const now = today(d);
  if (p.date) return { from: p.date, to: p.date, label: 'on ' + dateLabel(p.date) };
  if (p.from || p.to) return { from: p.from, to: p.to, label: (p.from ? 'from ' + dateLabel(p.from) : '') + (p.to ? ' to ' + dateLabel(p.to) : '') };
  const since = q.match(/\bsince\s+(.{3,30})/i);
  if (since) { const v = dateIn(since[1], now); if (v) return { from: v, to: now, label: 'since ' + dateLabel(v) }; }
  const m = q.match(FULL_MONTH);
  if (m) {
    const mon = monthIndex(m[1]);
    let year = m[2] ? Number(m[2]) : Number(now.slice(0, 4));
    if (!m[2] && `${year}-${String(mon + 1).padStart(2, '0')}-01` > now) year -= 1;
    const mm = String(mon + 1).padStart(2, '0');
    const last = new Date(Date.UTC(year, mon + 1, 0)).getUTCDate();
    return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${String(last).padStart(2, '0')}`, label: 'in ' + m[1][0].toUpperCase() + m[1].slice(1).toLowerCase() + ' ' + year };
  }
  const exact = dateIn(q, now);
  if (exact && /\b\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3}|[A-Za-z]{3,9}\s+\d{1,2}\b|\b20\d{2}-\d{2}-\d{2}\b/.test(q)) return { from: exact, to: exact, label: 'on ' + dateLabel(exact) };
  return { label: 'in the recorded history up to ' + dateLabel(now) };
}

const stamp = (v: string) => v.slice(0, 16).replace('T', ' ') + 'Z';

export function coldWeather(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  void userId;
  const { answer, citation, cite, today, ms, day, dateLabel, scopeFor, production, clean } = toolkit;
  const now = today(d), nowMs = ms(now + 'T23:59:59Z');
  const sopDoc = d.documents.find(doc => doc.type === 'SOP' && /\bOPS-5\b/.test(doc.content));
  if (!sopDoc) return answer('The operations SOP (OPS-5 freeze protection) is not loaded in this dataset, so the cold-weather rule cannot be stated or checked. Load the operations SOP to assess it.');
  const rule = parseOps5(sopDoc.content);
  if (!rule) return answer('OPS-5 is present in ' + sopDoc.title + ' but its threshold, season or required job could not be read, so the cold-weather rule cannot be applied.', undefined, [citation(sopDoc, undefined, /OPS-5/)]);

  const range = scopeRange(d, q, p);
  const wells = scopeFor(d, p);
  const areaName = (w: WellData) => d.areas.find(a => a.area_id === w.metadata.area_id)?.name ?? w.metadata.area_id;
  const jobRe = new RegExp(rule.job.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  type Row = { w: WellData; ins: Record<string, any>; air: number; head: number | undefined; dueMs: number; job?: Record<string, any>; status: string };
  const all: Row[] = [];
  let notProducing = 0, unknown = 0;
  for (const w of wells) for (const raw of w.inspections) {
    if (day(raw.inspected_at) > now || !inSeason(day(raw.inspected_at), rule)) continue;
    if (range.from && day(raw.inspected_at) < range.from) continue;
    if (range.to && day(raw.inspected_at) > range.to) continue;
    const pr = production(d, s, w, raw);
    const air = pr.item.ambient_temp_c;
    if (typeof air !== 'number' || !Number.isFinite(air) || air > rule.threshold) continue;
    if (pr.producing === undefined) { unknown++; continue; }
    if (!pr.producing) { notProducing++; continue; }
    const t = ms(raw.inspected_at), dueMs = t + rule.days * 86400000;
    const job = w.maintenance.filter(m => jobRe.test(String(m.issue ?? '')) && ms(m.started_at) >= t && ms(m.started_at) <= dueMs).sort((a, b) => ms(a.started_at) - ms(b.started_at))[0];
    const status = job ? 'Met' : dueMs > nowMs ? 'Pending' : 'Missed';
    all.push({ w, ins: pr.item, air, head: pr.item.wellhead_temp_c, dueMs, job, status });
  }
  all.sort((a, b) => ms(a.ins.inspected_at) - ms(b.ins.inspected_at) || String(a.w.metadata.asset_id).localeCompare(String(b.w.metadata.asset_id)));

  const sources: any[] = [citation(sopDoc, undefined, /OPS-5/)];
  const missed = all.filter(r => r.status === 'Missed');
  const rows = all.map(r => {
    sources.push(cite(d, r.ins.inspection_id, 'inspection'));
    if (r.job) sources.push(cite(d, r.job.maintenance_id, 'repair'));
    return [
      r.w.metadata.asset_id, areaName(r.w),
      r.ins.inspection_id + ', ' + stamp(r.ins.inspected_at) + ', air ' + r.air + ' C' + (typeof r.head === 'number' ? ', wellhead ' + r.head + ' C' : ''),
      dateLabel(new Date(r.dueMs).toISOString()) + ' ' + new Date(r.dueMs).toISOString().slice(11, 16) + 'Z',
      r.job ? r.job.maintenance_id + ' (' + stamp(r.job.started_at) + ')' : 'none',
      r.status,
    ];
  });
  // Misses first, then the rest, keeping date order inside each group.
  const order = (x: any[]) => (x[5] === 'Missed' ? 0 : x[5] === 'Pending' ? 1 : 2);
  const sortedRows = rows.map((r, i) => ({ r, i })).sort((a, b) => order(a.r) - order(b.r) || a.i - b.i).map(x => x.r);

  const seasonText = rule.heading.match(/\(([^)]+)\)/)?.[1] ?? (rule.fromDay + ' ' + MONTHS[rule.fromMonth] + ' to ' + rule.toDay + ' ' + MONTHS[rule.toMonth]);
  const quote = clean(sopDoc.content.slice(sopDoc.content.search(/##\s*OPS-5\b/)).split(/\r?\n##\s+/)[0].replace(/^##[^\n]*\n/, '').replace(/\*/g, ''));
  const ruleText = rule.heading + ': ' + quote;
  const summary = 'Rule in short: during ' + seasonText + ', an inspection with air temperature at or below ' + rule.threshold + ' C on a well that is producing oil at that reading needs a maintenance job whose issue contains "' + rule.job + '" starting within ' + rule.days + ' days after the inspection. Cold readings on wells not producing oil need no check.';

  const scopeText = range.label + (p.areaId ? ' in ' + (d.areas.find(a => a.area_id === p.areaId)?.name ?? p.areaId) : '') + (p.wellIds?.length ? ' for ' + p.wellIds.join(', ') : '');
  const ids = Array.from(new Set(all.map(r => r.w.metadata.asset_id)));
  const missedIds = Array.from(new Set(missed.map(r => r.w.metadata.asset_id)));
  const pending = all.filter(r => r.status === 'Pending').length;
  const notes = [notProducing ? notProducing + ' cold reading' + (notProducing === 1 ? '' : 's') + ' on wells not producing oil needed no check' : '', unknown ? unknown + ' cold reading' + (unknown === 1 ? '' : 's') + ' could not be judged (no well-type threshold or temperature)' : '', pending ? pending + ' check' + (pending === 1 ? ' is' : 's are') + ' still within the ' + rule.days + '-day window' : ''].filter(Boolean).join('; ');
  const text = ruleText + '\n\n' + summary + '\n\nChecked ' + scopeText + ': ' + all.length + ' cold reading' + (all.length === 1 ? '' : 's') + ' on producing wells needed a check; ' + (all.length - missed.length - pending) + ' Met, ' + missed.length + ' Missed' + (missedIds.length ? ' (' + missedIds.join(', ') + ')' : '') + '.' + (notes ? ' ' + notes + '.' : '');

  return answer(text, { type: 'table', title: 'OPS-5 heat trace checks after cold readings (' + range.label + ')', columns: ['Well', 'Area', 'Cold reading (inspection, date, air temp)', 'Required check by', 'Check job', 'Met / Missed'], rows: sortedRows }, sources.slice(0, 150), [], ids.length ? ids : []);
}
