import { toolkit, type Answer, type Citation, type CopilotState } from '../engine';
import type { Dataset, WellData } from '../data';
import type { QueryPlan } from '../plan';
import { gasResponse } from './gas-response';
import { recalledPumps } from './recalled-pumps';
import { coldWeather } from './cold-weather';
import { noteRisk } from './note-risk';

// Conversation triage: which of the wells discussed in this conversation should be dealt with first?
// Every flag comes from an existing deterministic tool or the toolkit; nothing is hard-coded per well.

type Rec = Record<string, any>;
type Flags = {
  w: WellData; id: string;
  safety: { noteId: string; at: string; status: string; response: string }[];
  compliance: { text: string; at: string; ids: string[] }[];
  production: { state: 'producing' | 'down-explained' | 'down-unexplained' | 'unknown'; text: string; ids: string[]; at: string };
  equipment: { text: string; ids: string[] }[];
  tier: number; count: number; recency: number;
};

const HIERARCHY = 'SAFETY > COMPLIANCE > unexplained PRODUCTION loss > EQUIPMENT risk; ties broken by number of flags, then most recent evidence';
const SHUT_IN = /shut[- ]?in|shut[- ]?down|shutdown|taken offline|\boffline\b|not (?:producing|running)|pulled the (?:pump|rods)/i;

function chunks<T>(list: T[], n: number): T[][] { const out: T[][] = []; for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n)); return out; }
const idsIn = (text: string) => Array.from(new Set((String(text ?? '').match(/\bWELL-\d+\b/gi) ?? []).map(v => v.toUpperCase())));
const areaName = (d: Dataset, w: WellData) => d.areas.find(a => a.area_id === w.metadata.area_id)?.name ?? String(w.metadata.area_id ?? 'Unknown area');

/** Candidate wells: explicit plan wells, else the wells discussed on the reference day (or the last 10 turns). */
function candidates(d: Dataset, s: CopilotState, userId: string, p: QueryPlan) {
  const { day, today, wellById } = toolkit;
  const source = new Map<string, string>();
  const note = (id: string, why: string) => { const w = wellById(d, id); if (w && !source.has(w.metadata.asset_id)) source.set(w.metadata.asset_id, why); };
  if (p.wellIds?.length) { for (const id of p.wellIds) note(id, 'named in the request'); return { ids: Array.from(source.keys()), turns: 0, source }; }
  const hist = s.history?.[userId] ?? [];
  let used = hist.filter(h => day(h.createdAt) === today(d));
  if (!used.length) used = hist.slice(-10);
  used.forEach((h, i) => {
    const label = 'turn ' + (i + 1);
    for (const id of h.wellIds ?? []) note(id, label);
    for (const id of idsIn(h.userText)) note(id, label);
    for (const id of idsIn(h.answer)) note(id, label);
  });
  return { ids: Array.from(source.keys()), turns: used.length, source };
}

export function triage(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  const T = toolkit;
  const now = T.today(d);
  const { ids, turns } = candidates(d, s, userId, p);
  if (!ids.length) {
    return T.answer('There are no wells in this conversation yet to prioritise. Name some wells or ask about an area first, then ask again which one to deal with first.', undefined, [], [], []);
  }
  const wells = ids.map(id => T.wellById(d, id)!).filter(Boolean);
  const flags = new Map<string, Flags>();
  for (const w of wells) flags.set(w.metadata.asset_id, { w, id: w.metadata.asset_id, safety: [], compliance: [], production: { state: 'unknown', text: 'no usable inspection', ids: [], at: '' }, equipment: [], tier: 0, count: 0, recency: 0 });
  const subCitations: Citation[] = [];
  const pl = (extra: Partial<QueryPlan>): QueryPlan => ({ ...p, ...extra, date: undefined, from: undefined, to: undefined, areaId: undefined, wellType: undefined, topK: undefined });

  // SAFETY: OPS-1 gas / H2S responses, no date filter.
  let gasOpsMissing = false;
  {
    const a = gasResponse(d, s, userId, '', pl({ operation: 'gas_response', wellIds: ids }));
    subCitations.push(...a.citations);
    if (/not loaded in this dataset|no response deadline could be read/i.test(a.answer)) gasOpsMissing = true;
    for (const r of a.visualization?.rows ?? []) {
      const f = flags.get(String(r[0])); if (!f) continue;
      const status = String(r[6]), response = String(r[3]);
      const noteId = String(r[2]).match(/\(([^)]+)\)\s*$/)?.[1] ?? String(r[2]);
      const at = String(r[2]).slice(0, 10);
      // Still open (no qualifying response at all) is a live safety gap; a response that came too late is a closed compliance breach.
      if (response === 'none' && (status === 'Missed' || status === 'Pending')) f.safety.push({ noteId, at, status, response });
      else if (status === 'Missed') f.compliance.push({ text: 'OPS-1 gas/H2S response late for ' + noteId + ' (' + String(r[4]) + ' h vs ' + String(r[5]) + ', answered by ' + response.split(' ')[0] + ')', at, ids: [noteId, response.split(' ')[0]] });
    }
  }

  // COMPLIANCE (1): OPS-5 cold-weather checks missed.
  {
    const a = coldWeather(d, s, userId, '', pl({ operation: 'cold_weather', wellIds: ids }));
    subCitations.push(...a.citations);
    for (const r of a.visualization?.rows ?? []) {
      const f = flags.get(String(r[0])); if (!f || String(r[5]) !== 'Missed') continue;
      const insId = String(r[2]).split(',')[0];
      const at = String(r[2]).match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '';
      f.compliance.push({ text: 'OPS-5 heat-trace check missed after cold reading ' + insId + ' (due ' + String(r[3]) + ', no check job)', at, ids: [insId] });
    }
  }

  // COMPLIANCE (2) + EQUIPMENT: recalled pumps still in the ground, with the recall deadline.
  {
    const a = recalledPumps(d, s, userId, '', pl({ operation: 'recalled_pumps', wellIds: ids }));
    subCitations.push(...a.citations);
    const deadlineText = a.answer.match(/replacement deadline was ([^.]+?)\./i)?.[1];
    const deadline = deadlineText ? T.parseDate(deadlineText, now) : undefined;
    const late = !!deadline && deadline < now;
    for (const r of a.visualization?.rows ?? []) {
      const f = flags.get(String(r[0])); if (!f) continue;
      const job = String(r[3]).split(' ')[0];
      const pump = String(r[2]);
      f.equipment.push({ text: 'recalled pump in the ground (' + pump + ', installed ' + job + ')', ids: [job] });
      if (late) f.compliance.push({ text: 'recall replacement deadline ' + deadline + ' missed (recalled pump from ' + job + ' still installed)', at: deadline!, ids: [job] });
    }
  }

  // EQUIPMENT: operator-note risk signals (also carries the T500 ESP 14-day check as a compliance item).
  for (const part of chunks(wells.map(w => w.metadata.asset_id as string), 50)) {
    const a = noteRisk(d, s, userId, '', pl({ operation: 'note_risk', wellIds: part, topK: 50 }));
    subCitations.push(...a.citations);
    const cols = a.visualization?.columns ?? [];
    const signCol = cols.findIndex(c => /warning signs/i.test(c));
    for (const r of a.visualization?.rows ?? []) {
      const f = flags.get(String(r[1])); if (!f) continue;
      const signs = T.clean(signCol >= 0 ? r[signCol] : '');
      const evidence = T.clean(r[3] ?? '');
      const noteIds = Array.from(evidence.matchAll(/\b(NOTE-[\w-]+|N-[\w-]+)/g)).map(m => m[1]);
      const esp = signs.match(/ESP check overdue since (\d{4}-\d{2}-\d{2})/i);
      if (esp) f.compliance.push({ text: 'T500 ESP 14-day check overdue since ' + esp[1] + ' (manual s.5 early warning)', at: esp[1], ids: [] });
      const summary = signs.replace(/\s*\[score[^\]]*\]/, '').replace(/(?:^|;\s*)not producing now[^;]*(?:;|$)/i, '').replace(/^;\s*|;\s*$/g, '').trim();
      const text = 'operator-note risk (' + (summary || 'abnormal-sound notes').slice(0, 110) + ')';
      if (!f.equipment.some(e => e.text === text)) f.equipment.push({ text, ids: noteIds.slice(-2) });
    }
  }

  // PRODUCTION: latest inspection against the well-type threshold, and whether anything explains a stop.
  for (const f of flags.values()) {
    const w = f.w;
    const retired = /plugged|abandon/i.test(String(w.metadata.status ?? '') + String(w.metadata.recorded_status ?? ''));
    const insp = T.latest(d, w);
    if (!insp || retired) { f.production = { state: 'unknown', text: retired ? 'plugged / abandoned' : 'no inspection on record', ids: [], at: '' }; continue; }
    const pr = T.production(d, s, w, insp);
    const at = T.day(insp.inspected_at);
    if (pr.producing === undefined) { f.production = { state: 'unknown', text: 'cannot be judged (' + insp.inspection_id + ')', ids: [insp.inspection_id], at }; continue; }
    const reading = insp.inspection_id + ' ' + at + ': ' + T.round(pr.delta, 1) + ' C above air vs ' + pr.limit + ' C needed';
    if (pr.producing) { f.production = { state: 'producing', text: 'producing (' + reading + ')', ids: [insp.inspection_id], at }; continue; }
    const jobs = w.maintenance.filter(m => T.day(m.started_at) <= now && (!m.completed_at || T.day(m.completed_at) >= now));
    const shut = w.context.filter(n => (n.note_type === 'operator_note' || n.note_type === 'shut_in' || !n.note_type) && SHUT_IN.test(String(n.text)) && !/\bno shut|not shut|back (?:online|in production)|restart/i.test(String(n.text)) && T.day(n.created_at) <= now && (!n.valid_to || T.day(n.valid_to) >= now) && T.day(n.created_at) >= T.day(new Date(T.ms(insp.inspected_at) - 14 * 86400000).toISOString()));
    const shutFacts = s.sharedFacts.filter(x => x.assetId === w.metadata.asset_id && SHUT_IN.test(x.text));
    if (jobs.length || shut.length || shutFacts.length) {
      const why = [...jobs.map(m => m.maintenance_id + ' in progress to ' + T.day(m.completed_at)), ...shut.map(n => 'note ' + n.note_id), ...shutFacts.map(x => 'shared note ' + x.id)];
      f.production = { state: 'down-explained', text: 'not producing (' + reading + '), explained by ' + why.join(', '), ids: [insp.inspection_id, ...jobs.map(m => m.maintenance_id), ...shut.map(n => n.note_id)], at };
    } else {
      f.production = { state: 'down-unexplained', text: 'not producing (' + reading + ') and no in-progress job or shut-in note explains it', ids: [insp.inspection_id], at };
    }
  }

  // Rank.
  const list = Array.from(flags.values());
  for (const f of list) {
    const prodFlag = f.production.state === 'down-unexplained' || f.production.state === 'down-explained';
    f.tier = f.safety.length ? 4 : f.compliance.length ? 3 : f.production.state === 'down-unexplained' ? 2 : f.equipment.length ? 1 : 0;
    f.count = (f.safety.length ? 1 : 0) + (f.compliance.length ? 1 : 0) + (prodFlag ? 1 : 0) + (f.equipment.length ? 1 : 0);
    f.recency = Math.max(0, ...[...f.safety.map(x => T.ms(x.at)), ...f.compliance.map(x => T.ms(x.at)), T.ms(f.production.at)].filter(Number.isFinite));
  }
  list.sort((a, b) => b.tier - a.tier || b.count - a.count || b.recency - a.recency || a.id.localeCompare(b.id));
  const flagged = list.filter(f => f.tier > 0 || f.production.state === 'down-explained');

  const tierName = (f: Flags) => ['no flags', 'EQUIPMENT risk', 'unexplained PRODUCTION loss', 'COMPLIANCE', 'SAFETY'][f.tier];
  const uniq = (x: string[]) => Array.from(new Set(x));
  const whyOf = (f: Flags) => {
    const parts: string[] = [];
    if (f.safety.length) parts.push('SAFETY: gas/H2S report ' + uniq(f.safety.map(x => x.noteId)).join(', ') + (f.safety.some(x => x.response === 'none') ? ' has no qualifying OPS-1 response' : ' got no timely OPS-1 response'));
    for (const c of f.compliance.slice(0, 3)) parts.push('COMPLIANCE: ' + c.text);
    if (f.production.state === 'down-unexplained' || f.production.state === 'down-explained') parts.push('PRODUCTION: ' + f.production.text);
    for (const e of f.equipment.slice(0, 2)) parts.push('EQUIPMENT: ' + e.text);
    return parts.join('; ') || 'no flags';
  };

  const top = list[0];
  const runners = list.slice(1, 3).filter(f => f.count > 0 || f.tier > 0);
  const capNote = ids.length > 200 ? ' The conversation covers ' + ids.length + ' wells (more than 200); all of them were checked.' : '';

  if (!top || top.tier === 0) {
    const cands = ids.length;
    return T.answer('I checked all ' + cands + ' wells from this conversation (' + (p.wellIds?.length ? 'named in the request' : turns + ' earlier turn' + (turns === 1 ? '' : 's')) + ') against gas/H2S response, cold-weather and recall compliance, production status and equipment signals and none carries a flag, so nothing needs to jump the queue. Priority order used: ' + HIERARCHY + '.' + capNote, undefined, [], [], []);
  }

  // Detail on the first pick: does its gas report have an H2S reading?
  let readingSentence = '';
  if (top.safety.length) {
    const g = gasResponse(d, s, userId, 'what was the H2S reading', { operation: 'gas_response', wellIds: [top.id] });
    subCitations.push(...g.citations);
    if (/^No H2S or gas reading is recorded/i.test(g.answer)) readingSentence = ' No H2S reading was taken or recorded for it.';
    else if (/^Measured value/i.test(g.answer)) readingSentence = ' ' + g.answer.split('. ')[0] + '.';
  }

  const fieldSop = d.documents.find(x => x.type === 'SOP' && /\bWS-03\b/.test(x.content) && /H2S/i.test(x.content));
  const sopCite = fieldSop ? T.citation(fieldSop, undefined, /\*\*WS-03\*\*/) : undefined;

  const action = (() => {
    const bits: string[] = [];
    if (top.safety.length) bits.push('send a manual inspection with a personal H2S monitor' + (fieldSop ? ' per the field-work SOP (' + fieldSop.title + ' WS-03: bump-tested monitor, stop work at 10 ppm)' : '') + ', record the reading, and check why the well stopped');
    if (top.compliance.length && !top.safety.length) bits.push('close the overdue mandated check (' + top.compliance[0].text + ')');
    else if (top.compliance.length) bits.push('then clear the overdue compliance item (' + top.compliance[0].text + ')');
    if (top.production.state === 'down-unexplained' && !top.safety.length) bits.push('find out why the well is not producing');
    if (top.equipment.some(e => /recalled pump/.test(e.text)) && !top.safety.length) bits.push('swap the recalled pump, ideally in the existing shut-in/job window');
    if (!bits.length) bits.push('inspect the equipment signals listed');
    return bits.join('; ');
  })();

  const refText = (f: Flags) => f.id + ' (' + areaName(d, f.w) + '; ' + tierName(f) + '): ' + whyOf(f);
  const text = 'Dealing with ' + top.id + ' (' + areaName(d, top.w) + ') first, out of ' + ids.length + ' well' + (ids.length === 1 ? '' : 's') + ' from this conversation. Priority order: ' + HIERARCHY + '.' +
    ' Why: ' + whyOf(top) + '.' + readingSentence +
    ' Recommended action: ' + action + '.' +
    (runners.length ? ' Next: ' + runners.map((f, i) => (i + 2) + '. ' + refText(f)).join(' ') : '') +
    capNote + (gasOpsMissing ? ' The OPS-1 gas rule could not be read, so safety flags were not assessed.' : '');

  // Table of the leading wells.
  const maxRows = 15;
  const prodCell = (f: Flags) => ({ 'producing': 'Producing', 'down-explained': 'Down, explained', 'down-unexplained': 'Down, unexplained', unknown: 'Unknown' }[f.production.state]);
  const rows = list.slice(0, maxRows).map((f, i) => [
    i + 1, f.id, areaName(d, f.w),
    f.safety.length ? 'Yes: ' + uniq(f.safety.map(x => x.noteId)).join(', ') : 'No',
    f.compliance.length ? 'Yes (' + f.compliance.length + '): ' + f.compliance.slice(0, 2).map(c => c.text.split(' (')[0]).join('; ') : 'No',
    prodCell(f),
    f.equipment.length ? 'Yes: ' + f.equipment.map(e => e.text.split(' (')[0]).join('; ') : 'No',
    whyOf(f),
  ]);
  const visualization = { type: 'table', title: 'Triage of wells discussed (' + HIERARCHY + ')' + (list.length > maxRows ? ' - top ' + maxRows + ' of ' + list.length : ''), columns: ['Rank', 'Well', 'Area', 'Safety', 'Compliance', 'Production', 'Equipment', 'Why'], rows };

  // Citations: the evidence records of the first three wells plus the governing SOPs.
  const wanted = new Set<string>();
  for (const f of [top, ...runners]) {
    for (const x of f.safety) wanted.add(x.noteId);
    for (const x of f.compliance) x.ids.forEach(i => wanted.add(i));
    f.production.ids.forEach(i => wanted.add(i));
    for (const x of f.equipment) x.ids.forEach(i => wanted.add(i));
  }
  const cites = subCitations.filter(c => wanted.has(c.id) || c.type === 'SOP');
  const direct = [...wanted].flatMap(id => [T.cite(d, id, 'note'), T.cite(d, id, 'inspection'), T.cite(d, id, 'repair'), T.cite(d, id, 'repair report')]);
  const out = T.answer(text, visualization, [sopCite, ...cites, ...direct].slice(0, 150), [], [top.id, ...runners.map(f => f.id)]);
  return out;
}
