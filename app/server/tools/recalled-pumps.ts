import { toolkit, type Answer, type CopilotState, type Citation } from '../engine';
import type { Dataset, WellData, EvidenceDoc } from '../data';
import type { QueryPlan } from '../plan';

type Recall = { doc: EvidenceDoc; ref: string; model: string; lots: string[] };
type Pump = { model: string; serial: string; lot: string; jobId: string; started: string; completed: string; cost?: number; report?: EvidenceDoc };

// Parse every supplier recall notice (SOP-type doc): the recalled model and the recalled lots only.
function recallsIn(d: Dataset): Recall[] {
  const result: Recall[] = [];
  for (const doc of d.documents) {
    if (doc.type !== 'SOP') continue;
    const text = doc.content;
    if (!/recall/i.test(text.slice(0, 600)) || !/\bLOT-[\w-]+/i.test(text)) continue;
    const start = text.search(/^#{1,4}\s*what is recalled/im);
    let section = start >= 0 ? text.slice(start).replace(/^#{1,4}[^\n]*\n/, '') : text;
    const next = section.search(/^#{1,4}\s/m);
    if (next >= 0) section = section.slice(0, next);
    // Lots named after "all other lots" / "not affected" are explicitly NOT recalled.
    const cut = section.search(/\b(?:all\s+)?other\s+lots\b|\bnot\s+(?:affected|recalled)\b/i);
    const affected = cut >= 0 ? section.slice(0, cut) : section;
    const lots = Array.from(new Set((affected.match(/\bLOT-[A-Z0-9-]+/gi) ?? []).map(v => v.toUpperCase())));
    const model = affected.match(/\b([A-Z][A-Za-z]+\s+[A-Z]{1,6}-\d+[A-Za-z0-9-]*)\b/)?.[1];
    if (!lots.length || !model) continue;
    const ref = text.match(/\*\*Reference:\*\*\s*([^\n]+)/i)?.[1]?.trim() ?? doc.id;
    result.push({ doc, ref, model, lots });
  }
  return result;
}

function parsePump(content: string): Omit<Pump, 'jobId' | 'started' | 'completed'> | undefined {
  const at = content.search(/\*\*Parts installed:?\*\*/i);
  if (at < 0) return undefined;
  const after = content.slice(at).replace(/^\*\*Parts installed:?\*\*:?/i, '');
  const block = after.split(/\r?\n\s*\r?\n|\r?\n#/)[0];
  const lot = block.match(/\blot(?:\s+(?:number|no\.?))?\s*[:#]?\s*(LOT-[A-Z0-9-]+|[A-Z0-9][A-Z0-9-]+)/i)?.[1]?.toUpperCase();
  if (!lot) return undefined;
  const serial = block.match(/\bserial(?:\s+(?:number|no\.?))?\s*[:#]?\s*([A-Z0-9][A-Z0-9-]+)/i)?.[1] ?? 'unknown';
  const model = toolkit.clean(block.split(/,\s*serial\b|,\s*lot\b|;/i)[0]).replace(/\s+pump$/i, '') || 'unknown';
  return { model, serial, lot };
}

const sameModel = (a: string, b: string) => {
  const x = a.toLowerCase().replace(/\s+/g, ' '), y = b.toLowerCase().replace(/\s+/g, ' ');
  return x.includes(y) || y.includes(x);
};

function pumpHistory(d: Dataset): Map<string, Pump[]> {
  const jobs = new Map<string, { w: WellData; job: any }>();
  for (const w of d.wells) for (const job of w.maintenance) jobs.set(w.metadata.asset_id + ':' + job.maintenance_id, { w, job });
  const out = new Map<string, Pump[]>();
  for (const doc of d.documents) {
    if (doc.type !== 'repair report' || !doc.assetId) continue;
    const parsed = parsePump(doc.content);
    if (!parsed) continue;
    const found = jobs.get(doc.assetId + ':' + doc.id);
    if (!found) continue;
    const list = out.get(doc.assetId) ?? [];
    list.push({ ...parsed, jobId: doc.id, started: String(found.job.started_at), completed: String(found.job.completed_at ?? ''), cost: found.job.cost_usd?.total, report: doc });
    out.set(doc.assetId, list);
  }
  return out;
}

// Team in charge of a well as of a date: team_history entry covering the date, else the well's team_id, else the area's team.
export function teamOn(d: Dataset, w: WellData, date: string): string | undefined {
  const hist = (Array.isArray(w.metadata.team_history) ? w.metadata.team_history : []).find((h: any) => h?.team_id && String(h.from ?? '0000') <= date && (!h.to || String(h.to) >= date));
  if (hist) return hist.team_id;
  return w.metadata.team_id ?? d.areas.find(a => a.area_id === w.metadata.area_id)?.team_id;
}
const retired = (w: WellData, date: string) => (/plugged|abandon/i.test(String(w.metadata.status ?? '')) || /plugged|abandon/i.test(String(w.metadata.recorded_status ?? ''))) && (!w.metadata.decommissioned_on || String(w.metadata.decommissioned_on) <= date);

const usdK = (v: number) => '$' + (v / 1000).toFixed(1) + 'k';

export function recalledPumps(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  const T = toolkit, today = T.today(d);
  const recalls = recallsIn(d);
  if (!recalls.length) return T.answer('No supplier recall notice was found in the loaded SOP documents, so I cannot tell which pumps are recalled.', undefined, [], [], []);

  // Preferences are private: only the asking user's own are read.
  const prefs = (s.preferences?.[userId] ?? []).map(x => x.text).join(' ; ');
  const wantK = /thousand|\bin\s*k\b|\b\d\s*k\b|\$\s*k\b|\bk\s*(?:usd|dollars)/i.test(prefs);
  const wantSort = /sort.*\barea\b.*(?:then|and).*well|area\s*(?:then|and)\s*well/i.test(prefs);
  const money = (v?: number) => v === undefined ? 'n/a' : wantK ? usdK(v) : T.usd(v);

  // Scope
  const user = d.users.find(u => u.user_id === userId);
  const mine = /\bmy\s+(?:area|team|patch|wells?)\b|\bour\s+(?:area|team)\b/i.test(q);
  const areaInQ = d.areas.find(a => q.toLowerCase().includes(String(a.name).toLowerCase()) || new RegExp('\\b' + String(a.area_id).replace(/[-]/g, '[-\\s]?') + '\\b', 'i').test(q));
  let pool = d.wells.filter(w => !retired(w, today));
  let scopeNote = '';
  const areaId = p.areaId ?? (mine ? undefined : areaInQ?.area_id);
  if (p.wellIds?.length) pool = pool.filter(w => p.wellIds!.includes(w.metadata.asset_id));
  if (areaId) { pool = pool.filter(w => w.metadata.area_id === areaId); scopeNote = ' in ' + (d.areas.find(a => a.area_id === areaId)?.name ?? areaId); }
  else if (mine && user?.team_id) {
    const teamWells = pool.filter(w => teamOn(d, w, today) === user.team_id);
    if (teamWells.length) { pool = teamWells; scopeNote = ' in your team’s area (' + [...new Set(teamWells.map(w => d.areas.find(a => a.area_id === w.metadata.area_id)?.name ?? w.metadata.area_id))].join(', ') + ')'; }
    else scopeNote = ' (your team, ' + user.team_id + ', runs no wells, so this covers the whole fleet)';
  }
  const onlyDown = /not\s+producing|non[- ]?producing|not\s+running|shut[- ]?in|isn'?t producing|aren'?t producing/i.test(q);

  // Currently installed pump = latest "Parts installed" by job start date (not in the future).
  const history = pumpHistory(d);
  const rows: { w: WellData; pump: Pump; recall: Recall; producing: boolean | undefined; claims: typeof s.claims }[] = [];
  for (const w of pool) {
    const list = (history.get(w.metadata.asset_id) ?? []).filter(x => T.day(x.started) <= today).sort((a, b) => T.ms(b.started) - T.ms(a.started));
    const pump = list[0];
    if (!pump) continue;
    const recall = recalls.find(r => sameModel(pump.model, r.model) && r.lots.includes(pump.lot.toUpperCase()));
    if (!recall) continue;
    const insp = T.latest(d, w);
    const producing = insp ? T.production(d, s, w, insp).producing : undefined;
    rows.push({ w, pump, recall, producing, claims: [] });
  }

  // Claims never remove a well; they annotate it.
  const swapRe = /\b(?:swap(?:ped)?|replac(?:e|ed|ing|ement)|chang(?:e|ed|ing)|pulled|new\s+pump)\b/i;
  const secondRe = /\b(?:told\s+me|tells?\s+me|said|says|heard|according\s+to|relay(?:ed|ing)?|mentioned)\b/i;
  const listedIds = new Set(rows.map(r => r.w.metadata.asset_id));
  for (const c of s.claims) if (listedIds.has(c.assetId) && swapRe.test(c.text)) rows.find(r => r.w.metadata.asset_id === c.assetId)!.claims.push(c);

  const afterDown = onlyDown ? rows.filter(r => r.producing === false) : rows;
  const shown = [...afterDown].sort((a, b) => areaName(d, a.w).localeCompare(areaName(d, b.w)) || a.w.metadata.asset_id.localeCompare(b.w.metadata.asset_id));
  void wantSort; // default order already equals "area, then well ID"

  const conflicts: string[] = [];
  const claimNotes = new Map<string, string>();
  const citations: (Citation | undefined)[] = [];
  const claimTexts: string[] = [];
  for (const r of shown) {
    const id = r.w.metadata.asset_id;
    for (const c of r.claims) {
      const author = T.person(d, c.authorUserId), when = T.dateLabel(c.createdAt);
      const named = d.users.filter(u => u.user_id !== c.authorUserId && (new RegExp('\\b' + String(u.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(c.text) || new RegExp('\\b' + String(u.name).split(' ')[0] + '\\b').test(c.text)));
      const second = secondRe.test(c.text) && named.length > 0;
      const inCharge = r.w.metadata.in_charge_user_id === c.authorUserId ? ' (in charge of this well)' : r.w.metadata.in_charge_user_id ? ' (not the person in charge of this well, ' + T.person(d, r.w.metadata.in_charge_user_id) + ' is)' : '';
      let note = 'Reported replaced by ' + author + ' on ' + when + ', unconfirmed: no work order on record';
      if (second) note = 'Second-hand: ' + author + ' relayed that ' + named.map(u => u.name).join(' / ') + ' said the pump was replaced (' + when + '), unconfirmed: no work order on record';
      claimNotes.set(id, (claimNotes.get(id) ? claimNotes.get(id) + ' | ' : '') + note);
      claimTexts.push(id + ' ' + (second ? 'second-hand report from ' + author + ' (via ' + named.map(u => u.name).join(', ') + ')' : 'report by ' + author));
      conflicts.push(second
        ? id + ': ' + author + ' says ' + named.map(u => u.name).join(' / ') + ' told them the recalled pump was swapped. This is second-hand and unconfirmed. The records still show recalled ' + r.pump.lot + ' (' + r.pump.jobId + ') installed and no later pump job, so the well stays on the list.'
        : id + ': ' + author + inCharge + ' reported on ' + when + ' that the recalled pump was replaced, but the records show recalled ' + r.pump.lot + ' (' + r.pump.jobId + ') still installed and no work order or Parts-installed report for a replacement. Kept on the list as unconfirmed.');
      citations.push(T.feedbackCitation(d, c));
    }
  }

  // Last repair per well
  const tableRows = shown.map(r => {
    const w = r.w, id = w.metadata.asset_id;
    const jobs = w.maintenance.filter(m => T.day(m.started_at) <= today);
    const done = jobs.filter(m => m.maintenance_type === 'corrective' && T.day(m.completed_at) <= today).sort((a, b) => T.ms(b.started_at) - T.ms(a.started_at))[0];
    const open = jobs.filter(m => T.day(m.completed_at) > today).sort((a, b) => T.ms(b.started_at) - T.ms(a.started_at));
    let last = done ? T.dateLabel(done.started_at) + ' (' + done.maintenance_id + ', ' + String(done.issue).slice(0, 60) + ')' : 'No completed corrective job';
    if (open.length) last += '; in progress: ' + open.map(m => m.maintenance_id + ' started ' + T.dateLabel(m.started_at)).join(', ');
    const status = r.producing === undefined ? 'Unknown' : r.producing ? 'Producing' : 'Not producing';
    citations.push(T.cite(d, r.pump.jobId, 'repair'), r.pump.report ? T.citation(r.pump.report, undefined, /Parts installed/i) : undefined);
    if (done) citations.push(T.cite(d, done.maintenance_id, 'repair'));
    for (const m of open) citations.push(T.cite(d, m.maintenance_id, 'repair'));
    const row: any[] = [id, areaName(d, w), r.pump.model + ', ' + r.pump.serial + ', ' + r.pump.lot, r.pump.jobId + ' (' + T.dateLabel(r.pump.started) + ')', money(r.pump.cost), status, last, r.recall.ref + '; ' + r.pump.jobId + ' report'];
    if (claimNotes.size) row.push(claimNotes.get(id) ?? '');
    return row;
  });
  if (claimNotes.size === 0) { /* no Notes column */ }
  citations.unshift(...recalls.map(r => T.citation(r.doc, undefined, /recalled|LOT-/i)));

  // Counts
  const counts = new Map<string, number>();
  for (const r of shown) counts.set(areaName(d, r.w), (counts.get(areaName(d, r.w)) ?? 0) + 1);
  const countText = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([a, n]) => a + ' = ' + n).join(', ');
  const total = shown.reduce((n, r) => n + (r.pump.cost ?? 0), 0);
  const overdue = recalls.map(r => r.doc.content.match(/by\s+(\d{1,2}\s+\w{3}\s+20\d{2})/i)?.[1]).find(Boolean);
  const unconfirmed = shown.filter(r => r.claims.length).length;

  const parts: string[] = [];
  parts.push(shown.length
    ? shown.length + ' well' + (shown.length === 1 ? ' has' : 's have') + ' a recalled pump in the ground' + (onlyDown ? ' and ' + (shown.length === 1 ? 'is' : 'are') + ' not producing' : '') + scopeNote + ' (' + recalls.map(r => r.model + ' ' + r.lots.join('/') + ', notice ' + r.ref).join('; ') + '). By area: ' + countText + '.'
    : 'No wells' + scopeNote + ' have a recalled pump in the ground' + (onlyDown ? ' that is not producing' : '') + ' (' + recalls.map(r => r.model + ' ' + r.lots.join('/')).join('; ') + ').');
  if (shown.length) {
    parts.push('The installed pump is the latest "Parts installed" line by job start date, so a later non-recalled pump removes the well from the list. Total install cost of the listed jobs: ' + money(total) + (wantK ? '.' : '.') + (overdue ? ' The replacement deadline was ' + overdue + '.' : ''));
    parts.push('Status uses the latest inspection against the well-type threshold; "last repair" is the latest completed corrective job start date plus any job still in progress today.');
  }
  if (wantK) parts.push('Costs are shown in thousands of dollars per your saved preference.');
  if (wantK || wantSort) parts.push('Sorted by area, then well ID' + (wantSort ? ' per your saved preference' : '') + '.');
  if (unconfirmed) parts.push(unconfirmed + ' well' + (unconfirmed === 1 ? ' carries' : 's carry') + ' an unconfirmed replacement report (' + claimTexts.join('; ') + '). Reports alone do not remove a well: ' + shown.length + ' per the records, ' + (shown.length - unconfirmed) + ' if those reports are confirmed by a work order.');

  const columns = ['Well', 'Area', 'Pump (model, serial, lot)', 'Installed by', 'Install cost', 'Status now', 'Last repair', 'Source'];
  if (claimNotes.size) columns.push('Notes');
  return T.answer(parts.join(' '), { type: 'table', title: 'Recalled pumps still in the ground' + scopeNote, columns, rows: tableRows }, citations.filter(Boolean).slice(0, 150), conflicts, shown.map(r => r.w.metadata.asset_id));
}

function areaName(d: Dataset, w: WellData) { return d.areas.find(a => a.area_id === w.metadata.area_id)?.name ?? String(w.metadata.area_id ?? 'Unknown area'); }
