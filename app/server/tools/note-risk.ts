import { toolkit, type Answer, type Citation, type CopilotState } from '../engine';
import type { Dataset, WellData } from '../data';
import type { QueryPlan } from '../plan';

// Deterministic tool: operator notes in the last month that describe abnormal sound or behaviour,
// on wells with no corrective (non-spill) repair started after the note, ranked by a transparent score.

type Rec = Record<string, any>;
type Sev = { word: string; points: number; kinds: string[] };

// keyword list: [pattern, label, severity points, equipment kinds the symptom points at]
const LIFT = ['pump_jack', 'rod_string', 'downhole_pump', 'esp_pump'];
const KEYWORDS: [RegExp, string, number, string[]][] = [
  [/knock/i, 'knocking', 3, LIFT],
  [/grind/i, 'grinding', 3, ['pump_jack', 'esp_pump']],
  [/\bbang|clunk/i, 'banging', 3, LIFT],
  [/vibrat/i, 'vibration', 3, LIFT],
  [/ground fault|overheat|arcing|burning smell/i, 'electrical/overheating', 3, ['esp_pump']],
  [/tagging bottom/i, 'tagging bottom', 3, ['downhole_pump', 'rod_string']],
  [/squeal|squeak|screech/i, 'squeal', 2, ['rod_string', 'pump_jack']],
  [/rattl|chatter/i, 'rattling', 2, ['pump_jack']],
  [/fluid pound/i, 'fluid pound', 2, ['downhole_pump', 'rod_string']],
  [/amps? hunting|hunting/i, 'amps hunting', 2, ['esp_pump']],
  [/tripping|tripped/i, 'drive tripping', 2, ['esp_pump']],
  [/surging|jerk|stalling|erratic/i, 'erratic running', 2, LIFT],
  [/whin|hum(?:ming)?\b/i, 'whine/hum', 1, LIFT],
  [/noise|noisy|unusual sound|strange sound|abnormal/i, 'abnormal noise', 1, LIFT]
];
const NEGATED = /\b(?:no|nothing|without|not)\s+(?:\w+\s+){0,2}(?:noise|knock|squeal|vibrat|rattl|grind|unusual)/i;
const SPILL = /spill|clean-?up/i;
const isSpillJob = (m: Rec) => SPILL.test(String(m.issue ?? '') + ' ' + String(m.action_taken ?? ''));
const stamp = (iso: any) => String(iso ?? '').slice(0, 10);

function classifyNote(text: string): Sev | undefined {
  const t = toolkit.clean(text);
  if (NEGATED.test(t)) return undefined;
  let best: Sev | undefined;
  for (const [re, word, points, kinds] of KEYWORDS) if (re.test(t) && (!best || points > best.points)) best = { word, points, kinds };
  return best;
}
function typeAt(w: WellData, iso: string): string {
  const d = toolkit.day(iso);
  const hist = Array.isArray(w.metadata.type_history) ? w.metadata.type_history : [];
  return hist.find((h: any) => h?.well_type && (!h.from || toolkit.day(h.from) <= d) && (!h.to || d <= toolkit.day(h.to)))?.well_type ?? w.metadata.well_type;
}
function limitFor(d: Dataset, w: WellData, type: string): number | undefined {
  const text = toolkit.clean(d.manuals[type]?.content).replace(/\*/g, '');
  const v = text.match(/at least\s+(\d+(?:\.\d+)?)\s*°?\s*C\s+above\s+(?:the\s+)?ambient/i)?.[1];
  return v !== undefined ? Number(v) : type === w.metadata.well_type ? toolkit.threshold(d, w) : undefined;
}
function reading(d: Dataset, s: CopilotState, w: WellData, raw: Rec) {
  const patched: Rec = { ...raw };
  for (const n of w.context.filter(n => n.note_type === 'data_correction' && n.inspection_id === raw.inspection_id && n.field).sort((a, b) => toolkit.ms(a.created_at) - toolkit.ms(b.created_at))) patched[n.field] = n.corrected_value;
  const item = toolkit.effective(s, w, patched), type = typeAt(w, raw.inspected_at), limit = limitFor(d, w, type);
  const delta = typeof item.wellhead_temp_c === 'number' && typeof item.ambient_temp_c === 'number' ? item.wellhead_temp_c - item.ambient_temp_c : NaN;
  return { item, type, limit, delta, producing: Number.isFinite(delta) && limit !== undefined ? delta >= limit - 1e-9 : undefined };
}
const addDays = (iso: string, n: number) => new Date(toolkit.ms(iso) + n * 86400000).toISOString().slice(0, 10);

// Recall notice: recalled lots + replacement deadline, parsed from the SOP/notice document.
function recallInfo(d: Dataset) {
  const doc = d.documents.find(x => x.type === 'SOP' && /recall/i.test(x.content) && /LOT-\d/i.test(x.content));
  if (!doc) return undefined;
  const text = doc.content;
  const cut = text.search(/all other lots|are not affected/i);
  const recalledPart = cut > 0 ? text.slice(0, cut) : text;
  const lots = new Set((recalledPart.match(/LOT-[A-Z0-9-]+/gi) ?? []).map(v => v.toUpperCase()));
  const deadlineText = text.match(/\(by\s+([^)]+)\)|\bby\s+(\d{1,2}\s+[A-Za-z]{3,9}\s+20\d{2})/i);
  const deadline = deadlineText ? toolkit.parseDate(deadlineText[1] ?? deadlineText[2], d.today) : undefined;
  return { doc, lots, deadline };
}
const reportIndex = new WeakMap<Dataset, Map<string, any>>();
function reportOf(d: Dataset, id: string) {
  let m = reportIndex.get(d);
  if (!m || m.size === 0) { m = new Map(); for (const doc of d.documents) if (doc.type === 'repair report') m.set(doc.id, doc); reportIndex.set(d, m); }
  return m.get(id) as { content: string } | undefined;
}
function currentPump(d: Dataset, w: WellData) {
  // latest "Parts installed" line for the downhole pump (only the pump in the well today counts)
  const jobs = [...w.maintenance].sort((a, b) => toolkit.ms(b.started_at) - toolkit.ms(a.started_at));
  for (const m of jobs) {
    const rep = reportOf(d, m.maintenance_id);
    const line = rep?.content.split(/\r?\n/).find(l => /\*\*Parts installed:?\*\*/i.test(l) && /pump/i.test(l));
    if (line) return { job: m, line: toolkit.clean(line.replace(/\*\*/g, '').replace(/^Parts installed:\s*/i, '')), lot: line.match(/LOT-[A-Z0-9-]+/i)?.[0]?.toUpperCase() };
  }
  return undefined;
}
function overdueFollowUps(d: Dataset, w: WellData, now: string) {
  const out: { job: Rec; text: string; due: string; spillish: boolean }[] = [];
  for (const m of w.maintenance) {
    const rep = reportOf(d, m.maintenance_id);
    const line = rep?.content.split(/\r?\n/).find(l => /\*\*Follow-up:?\*\*/i.test(l));
    if (!line) continue;
    const days = Number(line.match(/within\s+(\d+)\s+days?/i)?.[1] ?? 14);
    const due = addDays(m.completed_at ?? m.started_at, days);
    const done = w.maintenance.some(x => x.maintenance_id !== m.maintenance_id && toolkit.ms(x.started_at) > toolkit.ms(m.started_at) && new RegExp('follow-?up to\\s+' + m.maintenance_id, 'i').test(String(x.issue ?? '') + ' ' + String(x.action_taken ?? '')));
    if (!done && due < now) out.push({ job: m, text: toolkit.clean(line.replace(/\*\*/g, '').replace(/^Follow-up:\s*/i, '')), due, spillish: /soil|spill|remediat/i.test(line) });
  }
  return out;
}
// Mandated early-warning check, parsed from the well-type manual text (no hard-coded days):
// "lower than at the inspection before, N inspections in a row ... fallen by X C or more ... check within D days of the third drop".
const NUM_WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
function earlyWarningRule(d: Dataset, type: string) {
  const raw = String(d.manuals[type]?.content ?? '');
  const text = toolkit.clean(raw).replace(/\*/g, '');
  const m = text.match(/lower than at the inspection before,?\s*(\w+)\s+inspections in a row[\s\S]{0,240}?fallen by\s+(\d+(?:\.\d+)?)\s*°?\s*C or more[\s\S]{0,240}?schedule\s+(?:an?\s+)?([A-Za-z][A-Za-z /-]{2,60}?)\s+within\s+(\d+)\s+days\s+of\s+the\s+(\w+)\s+drop/i);
  if (!m) return undefined;
  const drops = NUM_WORDS[m[1].toLowerCase()] ?? Number(m[1]);
  if (!Number.isFinite(drops) || drops < 1) return undefined;
  const idx = raw.search(/lower than at the inspection before/i);
  const sec = [...raw.slice(0, idx).matchAll(/^#+\s*(\d+)\./gm)].at(-1)?.[1];
  return { drops, fall: Number(m[2]), days: Number(m[4]), what: toolkit.clean(m[3]).replace(/^(?:an?|the)\s+/i, ''), esp: /\bESP\b/i.test(m[3]), label: `${type} manual${sec ? ' s.' + sec : ''}` };
}
function rcaTrigger(d: Dataset, w: WellData, kind: string): number {
  const text = toolkit.clean(d.manuals[w.metadata.well_type]?.content).replace(/\*/g, '');
  const words: Record<string, number> = { two: 2, three: 3, four: 4, '2': 2, '3': 3, '4': 4 };
  const m = text.match(/\b(two|three|four|\d)\s+(?:or more\s+)?(?:corrective\s+)?(?:\w+\s+){0,3}(?:repairs?|events?|jobs?|failures?)/i);
  const v = m ? words[m[1].toLowerCase()] : undefined;
  return kind === 'esp_pump' ? (v ?? 2) : (v ?? 3);
}

export function noteRisk(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  const now = toolkit.today(d);
  const hasPeriod = !!(p.from || p.to || p.date || p.year) || /(?:last|past)\s+\d+\s+(?:day|week|month|year)s?/i.test(q);
  let from: string, to = now;
  if (hasPeriod) { const r = toolkit.rangeFor(d, q, p); from = r.from; to = r.to; }
  else { const t = new Date(now + 'T00:00:00Z'); const dom = t.getUTCDate(); t.setUTCDate(1); t.setUTCMonth(t.getUTCMonth() - 1); t.setUTCDate(Math.min(dom, new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate())); from = t.toISOString().slice(0, 10); }
  const topK = Math.max(1, Math.min(p.topK ?? (/\b(?:crew|send|dispatch)\b/i.test(q) ? 3 : 10), 50));
  const crew = /\b(?:crew|send|dispatch)\b/i.test(q) || p.topK === 3;
  const areaName = (id: string) => d.areas.find(a => a.area_id === id)?.name ?? id;
  const recall = recallInfo(d);
  const yearAgo = addDays(now, -365);

  type Cand = {
    w: WellData; notes: { n: Rec; sev: Sev }[]; score: number; parts: string[]; flags: string[]; why: string[];
    lastRepair: string; pickNote?: string; ambiguous?: string; nonProducing: boolean; cites: (Citation | undefined)[];
  };
  const cands: Cand[] = [];
  const dropped: string[] = [];
  let pool = 0, plugged = 0, underway = 0;

  for (const w of toolkit.scopeFor(d, p)) {
    if (w.metadata.status === 'plugged_and_abandoned' || w.metadata.recorded_status === 'plugged' || (w.metadata.decommissioned_on && toolkit.day(w.metadata.decommissioned_on) <= now)) { plugged++; continue; }
    const notes = w.context
      .filter(n => n.note_type === 'operator_note' && toolkit.day(n.created_at) >= from && toolkit.day(n.created_at) <= to)
      .map(n => ({ n, sev: classifyNote(n.text) }))
      .filter((x): x is { n: Rec; sev: Sev } => !!x.sev)
      .sort((a, b) => toolkit.ms(a.n.created_at) - toolkit.ms(b.n.created_at));
    if (!notes.length) continue;
    pool++;
    const lastNote = notes.at(-1)!.n;
    const corrective = w.maintenance.filter(m => m.maintenance_type === 'corrective' && !isSpillJob(m));
    const after = corrective.filter(m => toolkit.ms(m.started_at) > toolkit.ms(lastNote.created_at) && toolkit.day(m.started_at) <= now);
    if (after.length) { dropped.push(w.metadata.asset_id + ' (' + after.map(m => m.maintenance_id).join(', ') + ')'); continue; }

    const parts: string[] = [], flags: string[] = [], why: string[] = [], cites: (Citation | undefined)[] = [];
    let score = 0;
    const add = (pts: number, label: string, flag?: string, whyText?: string) => { score += pts; parts.push(label + ' +' + toolkit.round(pts, 1)); if (flag) flags.push(flag); if (whyText) why.push(whyText); };
    // 1. severity words + repeats
    const maxSev = Math.max(...notes.map(x => x.sev.points));
    const kinds = new Set(notes.map(x => x.sev.word));
    add(maxSev, 'severity (' + [...kinds].join('/') + ')');
    if (notes.length > 1) add(Math.min(notes.length - 1, 3) * 1.5, notes.length + ' notes', notes.length + ' notes in the window', 'repeat notes (' + notes.map(x => x.n.note_id).join(', ') + ')');
    if (kinds.size > 1) add(1, 'escalating variety', 'different symptoms reported (' + [...kinds].join(', ') + ')');
    const symptomKinds = new Set(notes.flatMap(x => x.sev.kinds));

    // 2. latest reading, temperature trend
    const readings = w.inspections.filter(i => toolkit.day(i.inspected_at) <= now).sort((a, b) => toolkit.ms(a.inspected_at) - toolkit.ms(b.inspected_at)).map(i => ({ i, r: reading(d, s, w, i) })).filter(x => Number.isFinite(x.r.delta));
    const lastR = readings.at(-1);
    let nonProducing = false;
    if (lastR) {
      cites.push(toolkit.cite(d, lastR.i.inspection_id, 'inspection'));
      if (lastR.r.producing === false) { nonProducing = true; add(3, 'not producing now', `not producing now (${stamp(lastR.i.inspected_at)}: ${toolkit.round(lastR.r.delta, 1)} °C vs ${lastR.r.limit} °C limit${lastR.i.notes ? ', "' + toolkit.clean(lastR.i.notes) + '"' : ''})`, `already not producing (${lastR.i.inspection_id}: ${toolkit.round(lastR.r.delta, 1)} °C above air vs ${lastR.r.limit} °C)`); }
      const dl = readings.map(x => x.r.delta);
      const own = earlyWarningRule(d, lastR.r.type) ?? earlyWarningRule(d, w.metadata.well_type);
      const rule = own ?? Object.keys(d.manuals).map(k => earlyWarningRule(d, k)).find(Boolean);
      const need = rule?.drops ?? 3, minFall = rule?.fall ?? 3;
      let start = dl.length - 1; while (start > 0 && dl[start - 1] > dl[start]) start--;
      const drops = dl.length - 1 - start;
      let trigger = -1;
      for (let k = start + need; k < dl.length; k++) if (dl[k - need] - dl[k] >= minFall) { trigger = k; break; }
      if (drops >= need && trigger >= 0) {
        const fall = toolkit.round(dl[start] - dl[dl.length - 1], 1);
        const trigIns = readings[trigger].i, trigDate = stamp(trigIns.inspected_at);
        const trend = `wellhead-minus-air fell ${drops} inspections in a row, ${toolkit.round(dl[start], 1)} to ${toolkit.round(dl[dl.length - 1], 1)} (-${fall} °C)`;
        // magnitude and length: more consecutive drops and a bigger total fall weigh more (fall counted up to 7.5 °C)
        const mandated = !!own;
        const trendPts = (Math.min(2, 0.25 * drops) + Math.min(3, 0.4 * fall)) * (mandated ? 1 : 0.6);
        add(trendPts, mandated ? 'decline trend' : 'temperature trend', `${trend} [${rule!.label} early warning, rule met at ${trigIns.inspection_id}]`, `steady decline: ${drops} drops, -${fall} °C (${trigIns.inspection_id})`);
        if (mandated) {
          const due = addDays(trigDate, own!.days);
          const checked = w.maintenance.some(m => toolkit.ms(m.started_at) >= toolkit.ms(trigIns.inspected_at) && (own!.esp ? m.equipment_kind === 'esp_pump' : m.equipment_kind !== 'flowline'));
          if (!checked && due < now) {
            const late = Math.round((toolkit.ms(now) - toolkit.ms(due)) / 86400000);
            add(7 + Math.min(2, late / 7), 'mandated check OVERDUE', `${own!.what} due ${due} (${own!.days} days after the drop on ${trigIns.inspection_id}, ${own!.label}), no check job since - ${late} days overdue: a failure precursor and a compliance breach`, `${own!.label} mandated ${own!.what} OVERDUE since ${due} (${late} days; drop ${trigIns.inspection_id}), no check job on record`);
          } else if (!checked) add(2, 'mandated check due', `${own!.what} due ${due} (${own!.label}), not yet overdue`, `${own!.label} ${own!.what} triggered, due ${due} (not yet overdue; ${trigIns.inspection_id})`);
          if (d.manuals[lastR.r.type]) cites.push(toolkit.citation(d.manuals[lastR.r.type], undefined, /falls steadily|lower than at the inspection before/i));
        }
      }
      if (lastR.r.producing && lastR.r.limit !== undefined && lastR.r.delta - lastR.r.limit <= 8) add(1, 'near producing limit', `only ${toolkit.round(lastR.r.delta - lastR.r.limit, 1)} °C above the ${lastR.r.limit} °C producing limit`);
    }

    // 3. recalled pump currently in the well
    if (recall) {
      const pump = currentPump(d, w);
      if (pump?.lot && recall.lots.has(pump.lot)) {
        const late = recall.deadline && recall.deadline < now;
        add(late ? 9 : 6, 'recalled pump in well', `recalled pump still in the well: ${pump.line} (installed ${pump.job.maintenance_id}, ${stamp(pump.job.started_at)})${late ? ', replacement deadline ' + recall.deadline + ' missed' : ''}`, `recalled pump ${pump.lot} (${pump.job.maintenance_id})${late ? ' past the ' + recall.deadline + ' deadline' : ''}`);
        cites.push(toolkit.cite(d, pump.job.maintenance_id, 'repair report'), toolkit.citation(recall.doc, undefined, /LOT-/));
      }
    }
    // 4. overdue follow-ups
    for (const f of overdueFollowUps(d, w, now)) {
      add(f.spillish ? 2 : 5, 'overdue follow-up ' + f.job.maintenance_id, `overdue follow-up from ${f.job.maintenance_id} (due ${f.due}, no later "Follow-up to" job): "${f.text}"`, `follow-up from ${f.job.maintenance_id} never done (due ${f.due})`);
      cites.push(toolkit.cite(d, f.job.maintenance_id, 'repair report'));
    }
    // 5. recent corrective repairs on the same equipment
    const recent = corrective.filter(m => toolkit.day(m.started_at) >= yearAgo && toolkit.day(m.started_at) <= now);
    const same = recent.filter(m => symptomKinds.has(m.equipment_kind));
    if (same.length) {
      const byKind = new Map<string, Rec[]>();
      for (const m of same) byKind.set(m.equipment_kind, [...(byKind.get(m.equipment_kind) ?? []), m]);
      let rca = false;
      for (const [k, list] of byKind) if (list.length >= rcaTrigger(d, w, k)) rca = true;
      add(Math.min(same.length, 3) * 2 + (rca ? 2 : 0), same.length + ' recent corrective repair(s) on the same equipment', `${same.length} corrective repair(s) on the same equipment in 12 months (${same.map(m => m.maintenance_id + ' ' + String(m.issue ?? '').toLowerCase()).join('; ')})${rca ? ', root-cause-analysis trigger reached' : ''}`, `${same.length} repairs on the same equipment in 12 months (${same.map(m => m.maintenance_id).join(', ')})${rca ? ' - RCA threshold' : ''}`);
      cites.push(...same.map(m => toolkit.cite(d, m.maintenance_id, 'repair')));
    }
    // 6. repair already under way on the lift equipment (not flowline) lowers the need for a new crew
    const open = corrective.filter(m => toolkit.day(m.started_at) <= now && toolkit.day(m.completed_at) > now && m.equipment_kind !== 'flowline');
    let ambiguous: string | undefined;
    if (open.length) { underway++; add(-6, 'repair already under way', `repair already under way: ${open.map(m => m.maintenance_id + ' ' + String(m.issue ?? '').toLowerCase() + ' planned finish ' + toolkit.day(m.completed_at)).join('; ')}`); cites.push(...open.map(m => toolkit.cite(d, m.maintenance_id, 'repair'))); }
    const overlap = corrective.filter(m => m.equipment_kind !== 'flowline' && toolkit.ms(m.started_at) <= toolkit.ms(notes[0].n.created_at) && toolkit.day(m.completed_at) >= toolkit.day(notes[0].n.created_at) && !open.includes(m));
    if (overlap.length) add(-3, 'repair finished during the notes'); 
    if (overlap.length) ambiguous = `${w.metadata.asset_id}: ${overlap.map(m => m.maintenance_id).join(', ')} started before the first note but finished after it, so it may already address these notes.`;

    // last repair: latest non-spill corrective job; mention a later spill/open job separately
    const sorted = [...corrective].sort((a, b) => toolkit.ms(b.started_at) - toolkit.ms(a.started_at));
    const lastJob = sorted[0];
    const fmt = (m: Rec) => `${m.maintenance_id} ${String(m.issue ?? m.maintenance_type).toLowerCase()}, ${stamp(m.started_at)} to ${stamp(m.completed_at)}${toolkit.day(m.completed_at) > now ? ' (in progress)' : ''}`;
    const laterOther = w.maintenance.filter(m => (!lastJob || toolkit.ms(m.started_at) > toolkit.ms(lastJob.started_at)) && m.maintenance_type === 'corrective' && m !== lastJob);
    const lastRepair = lastJob ? fmt(lastJob) + (laterOther.length ? '; later: ' + laterOther.map(fmt).join('; ') : '') : (laterOther.length ? 'only ' + laterOther.map(fmt).join('; ') : 'no corrective repair on record');
    cites.push(...(lastJob ? [toolkit.cite(d, lastJob.maintenance_id, 'repair')] : []), ...notes.map(x => toolkit.cite(d, x.n.note_id, 'note')));
    cands.push({ w, notes, score: toolkit.round(score, 1), parts, flags, why, lastRepair, ambiguous, nonProducing, cites });
  }

  cands.sort((a, b) => b.score - a.score || b.notes.length - a.notes.length || toolkit.ms(b.notes.at(-1)!.n.created_at) - toolkit.ms(a.notes.at(-1)!.n.created_at) || String(a.w.metadata.asset_id).localeCompare(String(b.w.metadata.asset_id)));
  // Crew dispatch: expected risk reduction with trip logistics. Start from the top-ranked well, then prefer a high-risk well
  // (within 20% of the best remaining score) in the same area as an already-chosen well, since one trip covers both.
  let top = cands.slice(0, topK);
  if (crew && cands.length) {
    const chosen = [cands[0]], rest = cands.slice(1);
    while (chosen.length < topK && rest.length) {
      const next = rest[0], areas = new Map(chosen.map(c => [c.w.metadata.area_id, c.w.metadata.asset_id]));
      const mate = rest.find(c => areas.has(c.w.metadata.area_id) && c.score >= 0.8 * next.score);
      const pick = mate ?? next;
      if (mate) mate.pickNote = (mate === next ? '' : `picked ahead of ${next.w.metadata.asset_id} (score ${next.score}) because its score ${mate.score} is within 20% of it and `) + `it is in the same area (${areaName(mate.w.metadata.area_id)}) as ${areas.get(mate.w.metadata.area_id)}, so one crew trip covers both`;
      chosen.push(pick); rest.splice(rest.indexOf(pick), 1);
    }
    top = chosen;
  }
  const crewWhy = (c: Cand) => [c.pickNote, ...(c.why.length ? c.why : ['repeated abnormal-sound notes']), 'notes ' + c.notes.map(x => x.n.note_id).join(', ')].filter(Boolean).join('; ');
  const quote = (c: Cand) => c.notes.slice(-4).map(x => `${x.n.note_id}, ${stamp(x.n.created_at)}: "${toolkit.clean(x.n.text)}"`).join(' | ');

  const rows = top.map((c, i) => crew
    ? [i + 1, c.w.metadata.asset_id, areaName(c.w.metadata.area_id), crewWhy(c) + ' (score ' + c.score + ')', quote(c), c.lastRepair]
    : [i + 1, c.w.metadata.asset_id, areaName(c.w.metadata.area_id), quote(c), (c.flags.length ? c.flags.join('; ') : 'none beyond the notes') + ' [score ' + c.score + ': ' + c.parts.join(', ') + ']', c.lastRepair]);
  const columns = crew
    ? ['Rank', 'Well', 'Area', 'Why send a crew first', 'Operator-note evidence', 'Last repair']
    : ['Rank', 'Well', 'Area', 'Operator-note evidence (date, quote)', 'Other warning signs', 'Last repair'];

  const areaCount = new Map<string, string[]>();
  for (const c of top) areaCount.set(areaName(c.w.metadata.area_id), [...(areaCount.get(areaName(c.w.metadata.area_id)) ?? []), c.w.metadata.asset_id]);
  const clusters = [...areaCount].filter(([, v]) => v.length > 1).map(([a, v]) => `${v.join(' and ')} are both in ${a}${crew ? ', so one crew trip can cover them' : ''}`);

  const scopeText = p.areaId ? ' in ' + areaName(p.areaId) : '';
  const head = `${pool} well(s)${scopeText} have operator notes from ${from} to ${to} describing abnormal sound or behaviour (keywords: knocking, grinding, banging, vibration, squeal, rattling, tagging bottom, fluid pound, amps hunting, drive tripping, and similar). ${dropped.length} of them already had a corrective (non-spill) repair start after the latest such note and are excluded${dropped.length ? ' (' + dropped.slice(0, 15).join('; ') + (dropped.length > 15 ? '; ...' : '') + ')' : ''}, leaving ${cands.length} candidates. Spill clean-up jobs are not counted as repairs. Plugged wells excluded: ${plugged}.`;
  const method = `Score = worst symptom (1 to 3) + 1.5 per repeat note (max 3) + 1 for differing symptoms + 3 not producing now + decline trend (rule read from the well-type manual, e.g. T500 s.5: N consecutive drops totalling X °C or more; 0.25 per drop up to 2 plus 0.4 per °C of total fall up to 3, times 0.6 on wells whose own manual has no mandated check) + mandated check from that rule (days read from the manual): 7 plus up to 2 more by weeks late when its due date has PASSED with no check job (failure precursor and compliance breach), only 2 when triggered but not yet due + recalled pump still in the well (recall notice lots, only the latest installed pump counts): 9 once the replacement deadline has passed, else 6 + 5 overdue repair follow-up with no later "Follow-up to" job + repeat-failure history 2 per same-equipment corrective repair in 12 months (max 3) plus 2 at the RCA trigger - 6 if a repair on the lift equipment is already under way, - 3 if one finished during the notes.`;
  const body = !top.length ? 'No qualifying wells to rank.' : crew
    ? `Send a crew first to: ${top.map((c, i) => `${i + 1}. ${c.w.metadata.asset_id} (${areaName(c.w.metadata.area_id)}, score ${c.score}) - ${crewWhy(c)}.`).join(' ')}${clusters.length ? ' Trip logistics: ' + clusters.join('; ') + '.' : ' The picks are in different areas, so they need separate trips.'} Picks start from the top-ranked well, then prefer a high-risk well (within 20% of the next candidate's score) in the same area as one already chosen.`
    : `Top ${top.length} most likely to need a repair in the next 90 days: ${top.map((c, i) => `${i + 1}. ${c.w.metadata.asset_id} (score ${c.score})`).join(', ')}.${clusters.length ? ' Area clustering: ' + clusters.join('; ') + '.' : ''}${cands.length > top.length ? ' Next in line: ' + cands.slice(top.length, top.length + 5).map(c => c.w.metadata.asset_id + ' (' + c.score + ')').join(', ') + '.' : ''}`;
  const text = [head, body, method].join(' ');
  const conflicts = top.map(c => c.ambiguous).filter((x): x is string => !!x);
  if (recall && !recall.deadline) conflicts.push('The recall notice replacement deadline could not be read; recalled pumps were flagged without a deadline check.');

  const cites: (Citation | undefined)[] = [];
  for (const c of top) cites.push(...c.cites);
  if (recall) cites.push(toolkit.citation(recall.doc, undefined, /LOT-/));
  const out = toolkit.answer(text, { type: 'table', title: crew ? 'Where to send a crew first' : 'Operator-note risk ranking', columns, rows }, cites, conflicts, top.map(c => c.w.metadata.asset_id));
  out.citations = out.citations.slice(0, 150);
  if (process.env.NOTE_RISK_DEBUG) (out as any).meta = { pool, dropped: dropped.length, candidates: cands.length, ranking: cands.slice(0, 30).map(c => [c.w.metadata.asset_id, c.score]) };
  return out;
}
