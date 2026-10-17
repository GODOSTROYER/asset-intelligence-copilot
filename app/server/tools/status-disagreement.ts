import { toolkit, type Answer, type Citation, type CopilotState } from '../engine';
import type { Dataset, WellData } from '../data';
import type { QueryPlan } from '../plan';

// Deterministic tool: wells where the latest inspection and the latest operator
// note that states shut-in / restart status disagree about production.
// Rule: operations SOP OPS-3 (status evidence precedence) - the more recent evidence wins.

type Kind = 'shut_in' | 'restart';
type StatusNote = { note: Record<string, any>; kind: Kind };

const SHUT_RE = /shut[\s-]*in\b|shut(?:ting)?\s+(?:the\s+)?(?:well\s+)?in\b|stays?\s+shut|shut\s+down\b|shut\s+the\s+well\s+in/gi;
const RESTART_RE = /\brestarted\b|put\s+back\s+on\s+production|back\s+on\s+production|brought\b[^.]{0,40}\bback\s+(?:online|on\s*line|on\s+production)|returned\s+to\s+(?:production|service)|back\s+online|back\s+in\s+service/gi;
const NEGATED = /\b(?:not|never|n't|no\s+need\s+to|do\s+not|don't)\s+(?:\w+\s+){0,2}(?:shut|restart)/i;

function lastIndexOfMatch(text: string, re: RegExp): number {
  re.lastIndex = 0;
  let idx = -1, m: RegExpExecArray | null;
  while ((m = re.exec(text))) { idx = m.index; if (m[0].length === 0) re.lastIndex++; }
  return idx;
}
function classify(text: string): Kind | undefined {
  const t = toolkit.clean(text);
  if (NEGATED.test(t)) return undefined;
  const s = lastIndexOfMatch(t, SHUT_RE), r = lastIndexOfMatch(t, RESTART_RE);
  if (s < 0 && r < 0) return undefined;
  if (s >= 0 && r >= 0) return r > s ? 'restart' : 'shut_in';
  return s >= 0 ? 'shut_in' : 'restart';
}
function typeAt(w: WellData, iso: string): string {
  const d = toolkit.day(iso);
  const hist = Array.isArray(w.metadata.type_history) ? w.metadata.type_history : [];
  const hit = hist.find((h: any) => h?.well_type && (!h.from || toolkit.day(h.from) <= d) && (!h.to || d <= toolkit.day(h.to)));
  return hit?.well_type ?? w.metadata.well_type;
}
function limitFor(d: Dataset, w: WellData, type: string): number | undefined {
  const text = toolkit.clean(d.manuals[type]?.content).replace(/\*/g, '');
  const v = text.match(/at least\s+(\d+(?:\.\d+)?)\s*°?\s*C\s+above\s+(?:the\s+)?ambient/i)?.[1];
  if (v !== undefined) return Number(v);
  return type === w.metadata.well_type ? toolkit.threshold(d, w) : undefined;
}
function reading(d: Dataset, s: CopilotState, w: WellData, raw: Record<string, any>) {
  // data_correction notes override inspection fields (OPS-3: "after any data_correction note")
  const patched: Record<string, any> = { ...raw };
  const fixes = w.context
    .filter(n => n.note_type === 'data_correction' && n.inspection_id === raw.inspection_id && n.field)
    .sort((a, b) => toolkit.ms(a.created_at) - toolkit.ms(b.created_at));
  for (const n of fixes) patched[n.field] = n.corrected_value;
  const item = toolkit.effective(s, w, patched);
  const type = typeAt(w, raw.inspected_at), limit = limitFor(d, w, type);
  const head = item.wellhead_temp_c, air = item.ambient_temp_c;
  const delta = typeof head === 'number' && typeof air === 'number' && Number.isFinite(head) && Number.isFinite(air) ? head - air : NaN;
  const producing = Number.isFinite(delta) && limit !== undefined ? delta >= limit - 1e-9 : undefined;
  return { item, type, limit, delta, producing, fixes };
}
const stamp = (iso: any) => String(iso ?? '').slice(0, 10) + ' ' + String(iso ?? '').slice(11, 16) + ' UTC';
const isPlugged = (w: WellData, now: string) =>
  w.metadata.status === 'plugged_and_abandoned' || w.metadata.recorded_status === 'plugged' || w.metadata.recorded_status === 'abandoned' ||
  (!!w.metadata.decommissioned_on && toolkit.day(w.metadata.decommissioned_on) <= now);

export function statusDisagreement(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  const now = toolkit.today(d), endOfToday = Date.parse(now + 'T23:59:59Z');
  const areaName = (id: string) => d.areas.find(a => a.area_id === id)?.name ?? id;
  const sop = d.documents.find(x => x.type === 'SOP' && /OPS-3/.test(x.content));
  const sopRule = sop ? 'OPS-3' : 'the operations SOP precedence rule';
  const core: any[][] = [], second: any[][] = [], ids: string[] = [], sources: (Citation | undefined)[] = [], conflicts: string[] = [];
  const secondSources: (Citation | undefined)[] = [];
  const coreIds: string[] = [], secondIds: string[] = [];
  const manualsUsed = new Set<string>();
  let considered = 0, skippedPlugged = 0, noInspection = 0, unknown = 0, staleAgreeing = 0;

  for (const w of toolkit.scopeFor(d, p)) {
    if (isPlugged(w, now)) { skippedPlugged++; continue; }
    const insp = toolkit.latest(d, w); // latest by inspected_at, late-entered (-B) records included
    if (!insp) { noInspection++; continue; }
    considered++;
    const r = reading(d, s, w, insp);
    if (r.producing === undefined) { unknown++; continue; }
    const notes: StatusNote[] = w.context
      .filter(n => (n.note_type === 'operator_note' || n.note_type === undefined) && Number.isFinite(toolkit.ms(n.created_at)) && toolkit.ms(n.created_at) <= endOfToday)
      .map(n => ({ note: n, kind: classify(n.text) as Kind }))
      .filter(x => x.kind)
      .sort((a, b) => toolkit.ms(a.note.created_at) - toolkit.ms(b.note.created_at));
    const last = notes.at(-1);
    if (!last) continue;
    const newer = toolkit.ms(last.note.created_at) > toolkit.ms(insp.inspected_at);
    const hours = toolkit.round(Math.abs(toolkit.ms(last.note.created_at) - toolkit.ms(insp.inspected_at)) / 3600000, 1);
    let status: string, disagree = false, group: 'core' | 'second' = 'core', why = '';
    const inspShows = `${r.item.wellhead_temp_c} - ${r.item.ambient_temp_c} = ${toolkit.round(r.delta, 1)} °C vs ${r.limit} °C limit (${r.type}) = ${r.producing ? 'producing' : 'not producing'}`;
    if (newer) {
      if (last.kind === 'shut_in') {
        status = 'Not producing (shut in)'; disagree = r.producing === true;
        why = `Shut-in note is ${hours} h newer than the inspection that read producing; ${sopRule}: the more recent evidence wins.`;
      } else {
        status = 'Producing (unconfirmed)'; disagree = r.producing === false;
        why = `Restart note is ${hours} h newer than the inspection that read not producing; ${sopRule}: producing, but unconfirmed until an inspection confirms it.`;
      }
    } else {
      group = 'second';
      status = r.producing ? 'Producing' : 'Not producing';
      // Older restart note vs a newer inspection that still reads not producing: the inspection wins.
      disagree = last.kind === 'restart' && r.producing === false;
      if (!disagree) { if (last.kind === 'shut_in' && r.producing) staleAgreeing++; continue; }
      why = `Restart note is older than the latest inspection, which still reads not producing; ${sopRule}: the inspection is the more recent evidence, so the well is not producing and the restart did not hold.`;
    }
    if (!disagree) continue;
    const open = w.maintenance
      .filter(m => toolkit.day(m.started_at) <= now && toolkit.day(m.completed_at) > now)
      .sort((a, b) => toolkit.ms(b.started_at) - toolkit.ms(a.started_at));
    const caveat: string[] = [];
    if (last.kind === 'restart') {
      for (const m of open) caveat.push(`${m.maintenance_id} (${String(m.issue ?? m.maintenance_type).toLowerCase()}, started ${toolkit.day(m.started_at)}) is still in progress, planned finish ${toolkit.day(m.completed_at)}`);
      if (newer && open.length) why += ' Caveat: the restart note implies the repair finished, but ' + caveat.join('; ') + '.';
      else if (open.length) why += ' Open job: ' + caveat.join('; ') + '.';
      if (newer && !open.length) {
        const lastJob = [...w.maintenance].sort((a, b) => toolkit.ms(b.started_at) - toolkit.ms(a.started_at))[0];
        if (lastJob && /pump change|repair crew|after the repair/i.test(last.note.text) && lastJob.maintenance_type !== 'corrective')
          why += ` Caveat: the note refers to a repair but the latest job on file is ${lastJob.maintenance_id} (${lastJob.maintenance_type}, ${String(lastJob.issue ?? '').toLowerCase()}).`;
      }
    }
    if (r.fixes.length) why += ' The inspection reading includes data correction ' + r.fixes.map(f => f.note_id).join(', ') + '.';
    const row = [
      w.metadata.asset_id,
      areaName(w.metadata.area_id),
      `${insp.inspection_id}, ${stamp(insp.inspected_at)}: ${inspShows}${insp.notes ? ` ("${toolkit.clean(insp.notes)}")` : ''}`,
      `${last.note.note_id}, ${stamp(last.note.created_at)}: "${toolkit.clean(last.note.text)}"`,
      status,
      why
    ];
    (group === 'core' ? core : second).push(row);
    (group === 'core' ? coreIds : secondIds).push(w.metadata.asset_id);
    manualsUsed.add(r.type);
    const bucket = group === 'core' ? sources : secondSources;
    bucket.push(toolkit.cite(d, insp.inspection_id, 'inspection'), toolkit.cite(d, last.note.note_id, 'note'),
      ...r.fixes.map(f => toolkit.cite(d, f.note_id, 'note')),
      ...(last.kind === 'restart' ? open.map(m => toolkit.cite(d, m.maintenance_id, 'repair')) : []));
    if (last.kind === 'restart' && open.length && newer) conflicts.push(`${w.metadata.asset_id}: restart note ${last.note.note_id} says the well is back on production, but ${caveat.join('; ')}.`);
  }

  const byWell = (a: any[], b: any[]) => String(a[0]).localeCompare(String(b[0]));
  const rank = (a: any[], b: any[]) => (a[4].startsWith('Not') === b[4].startsWith('Not') ? byWell(a, b) : a[4].startsWith('Not') ? -1 : 1);
  core.sort(rank);
  second.sort(byWell);
  const rows = [...core, ...second];
  ids.push(...coreIds, ...secondIds);
  const shut = core.filter(r => r[4].startsWith('Not')).length, restart = core.length - shut;
  const scopeText = p.areaId ? 'in ' + areaName(p.areaId) : p.wellIds?.length ? 'for the named wells' : 'across the whole field';
  const text = rows.length
    ? [
      `${core.length} well(s) ${scopeText} have an inspection and an operator note that disagree, where the note is newer: ${shut} shut-in after a producing reading (now not producing) and ${restart} restart after a not-producing reading (now producing, unconfirmed). Rule: ${sopRule} - current status comes from the more recent of the latest inspection (after any data correction, judged by the well-type manual threshold in force on that date) and the latest operator note that says the well was shut in or restarted.`,
      second.length ? `A further ${second.length} well(s) carry an older restart note but their later inspection still reads not producing; the inspection wins and they are listed as not producing.` : '',
      `Excluded: ${skippedPlugged} plugged/abandoned well(s); notes older than the latest inspection that agree with it (${staleAgreeing} older shut-in notes before a producing reading); gas odor, bypass and equipment remarks, which do not set status.`,
      unknown ? `${unknown} well(s) had no usable temperature reading or threshold and were skipped.` : ''
    ].filter(Boolean).join(' ')
    : `No disagreement found ${scopeText}: for every well checked (${considered}), the latest inspection and the latest shut-in/restart operator note agree or the note is older and superseded. Rule: ${sopRule}.`;

  const manualSources = [...manualsUsed].map(t => d.manuals[t] ? toolkit.citation(d.manuals[t], undefined, /at least\s+\*?\*?\d+/i) : undefined);
  const all = [sop ? toolkit.citation(sop, undefined, /OPS-3/) : undefined, ...sources, ...secondSources, ...manualSources];
  const out = toolkit.answer(
    text,
    { type: 'table', title: 'Inspection vs operator note: status disagreements', columns: ['Well', 'Area', 'Latest inspection (ID, date, shows)', 'Latest operator note (date and time, quote)', 'Status now', 'Why'], rows },
    all, conflicts, ids
  );
  out.citations = out.citations.slice(0, 150);
  return out;
}
