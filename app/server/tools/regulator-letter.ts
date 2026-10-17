import { toolkit, type Answer, type CopilotState } from '../engine';
import type { Dataset, EvidenceDoc, WellData } from '../data';
import type { QueryPlan } from '../plan';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function isoOf(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return iso[0];
  const dmy = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+(20\d{2})\b/i);
  if (dmy) return dmy[3] + '-' + String(MONTHS.indexOf(dmy[2].toLowerCase()) + 1).padStart(2, '0') + '-' + dmy[1].padStart(2, '0');
  const mdy = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\b/i);
  if (mdy) return mdy[3] + '-' + String(MONTHS.indexOf(mdy[1].toLowerCase()) + 1).padStart(2, '0') + '-' + mdy[2].padStart(2, '0');
  return undefined;
}
const human = (iso?: string) => (iso ? Number(iso.slice(8, 10)) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(iso.slice(5, 7)) - 1] + ' ' + iso.slice(0, 4) : 'n/a');
const norm = (v: string) => toolkit.clean(String(v).replace(/[*_`"“”]/g, '')).toLowerCase();
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b.slice(0, 10) + 'T00:00:00Z') - Date.parse(a.slice(0, 10) + 'T00:00:00Z')) / 86400000);

function findLetters(d: Dataset): EvidenceDoc[] {
  return d.documents.filter(doc => doc.type === 'SOP' && (/letter/i.test(doc.id + ' ' + doc.path) || /^#\s*(?:letter|notice)\b/im.test(doc.content)) && /\*\*(?:from|to|subject)/i.test(doc.content));
}

function pickLetter(letters: EvidenceDoc[], q: string): EvidenceDoc | undefined {
  if (letters.length <= 1) return letters[0];
  const text = q.toLowerCase();
  const score = (doc: EvidenceDoc) => {
    let sc = 0;
    const from = doc.content.match(/\*\*from:?\*\*:?\s*([^\n]+)/i)?.[1] ?? '';
    for (const w of from.toLowerCase().split(/[^a-z&]+/).filter(x => x.length > 3 && !['office', 'district', 'state'].includes(x))) if (text.includes(w)) sc += 2;
    const date = isoOf(doc.content.match(/\*\*date:?\*\*:?\s*([^\n]+)/i)?.[1]) ?? isoOf(doc.id);
    if (date) {
      const mon = MONTHS[Number(date.slice(5, 7)) - 1];
      if (new RegExp('\\b' + mon + '[a-z]*\\b', 'i').test(q)) sc += 2;
      if (q.includes(date.slice(0, 4)) && sc) sc += 1;
    }
    return sc;
  };
  return [...letters].sort((a, b) => score(b) - score(a))[0];
}

function teamAt(w: WellData, date: string): string | undefined {
  const hist = Array.isArray(w.metadata.team_history) ? w.metadata.team_history : [];
  const hit = hist.find((h: any) => (!h.from || date >= String(h.from)) && (!h.to || date <= String(h.to)));
  return hit?.team_id ?? w.metadata.team_id;
}

export function regulatorLetter(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  const today = toolkit.today(d);
  const letters = findLetters(d);
  const letter = pickLetter(letters, q);
  if (!letter) return toolkit.answer('No regulator letter was found in the SOP documents, so there is no letter scope to check spills against.', undefined, [], [], []);

  const text = letter.content;
  // --- scope -----------------------------------------------------------
  const paragraphs = text.split(/\n\s*\n/);
  const scopePara = paragraphs.find(para => /since\s+\d|since\s+[A-Z][a-z]+\s+\d|reportable/i.test(para) && /spill/i.test(para) && /must|shall|require/i.test(para)) ?? paragraphs.find(para => /reportable|spill/i.test(para)) ?? '';
  const scopeText = toolkit.clean(scopePara);
  const areaMatch = (src: string) => d.areas.filter(a => a.name && new RegExp('(?:^|[^A-Za-z0-9])' + String(a.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![0-9])', 'i').test(src));
  let areas = areaMatch(scopeText);
  if (!areas.length) areas = areaMatch(text);
  const toLine = text.match(/\*\*to:?\*\*:?\s*([^\n]+)/i)?.[1] ?? '';
  const addresseeTeam = toLine.match(/\bTEAM-[A-Z0-9]+\b/)?.[0];
  if (!areas.length && addresseeTeam) areas = d.areas.filter(a => a.team_id === addresseeTeam);
  const areaIds = new Set(areas.map(a => a.area_id));

  const since = isoOf(scopeText.match(/since\s+([^,;.]+(?:\s+20\d{2})?)/i)?.[1]) ?? isoOf(scopeText.match(/since\s+(.{0,30})/i)?.[1]);
  const deadline = isoOf(scopeText.match(/(?:submitted|due|received)\s+by\s+(.{0,30})/i)?.[1]) ?? isoOf(text.match(/\bby\s+(\d{1,2}\s+[A-Za-z]{3,9}\s+20\d{2})/)?.[1]);
  const spillSop = d.documents.find(doc => doc.type === 'SOP' && /\bSR-01\b/.test(doc.content) && /Reportable/i.test(doc.content));
  const volMatch = text.match(/(\d+(?:\.\d+)?)\s*bbl\s+or\s+more/i) ?? spillSop?.content.match(/\|\s*Reportable\s*\|\s*(\d+(?:\.\d+)?)\s*bbl/i);
  const minBbl = volMatch ? Number(volMatch[1]) : 5;

  // --- required wording (HSE rule) ---------------------------------------
  const quoted = (src: string) => src.match(/(?:contains?|include[s]?|states?|says?)\s+the\s+sentence\s*[:\s]*["“]([^"”]{8,120})["”]/i)?.[1];
  let phrase = quoted(text);
  let ruleDoc: EvidenceDoc | undefined = phrase ? letter : undefined;
  if (!phrase) for (const doc of d.documents) { if (doc.type !== 'SOP') continue; const ph = quoted(doc.content); if (ph && /lab/i.test(ph)) { phrase = ph; ruleDoc = doc; break; } }
  let ruleNote: any;
  if (!phrase) for (const w of d.wells) for (const n of w.context) { const ph = quoted(String(n.text)); if (ph && /lab/i.test(ph)) { phrase = ph; ruleNote = n; break; } }
  if (!phrase) phrase = 'Soil samples sent to the lab.';
  const phraseNorm = norm(phrase).replace(/[.]+$/, '');

  // --- whose spills -------------------------------------------------------
  const user = d.users.find(u => u.user_id === userId);
  const userTeam: string | undefined = user?.team_id;
  const teamOwnsWells = !!userTeam && d.wells.some(w => w.metadata.team_id === userTeam || (Array.isArray(w.metadata.team_history) && w.metadata.team_history.some((h: any) => h.team_id === userTeam)));
  const ours = teamOwnsWells ? userTeam : undefined;

  // --- SOP limits ----------------------------------------------------------
  const sr01Row = spillSop?.content.split(/\r?\n/).find(l => /\*\*SR-01\*\*/.test(l)) ?? '';
  const sr01 = sr01Row.match(/within\s+\*{0,2}(\d+)\s+hours\*{0,2}\s+of\s+discovery\s*\((\d+)\s+hours\s+for\s+spills\s+discovered\s+before\s+([^)]+?)\)/i);
  const sr01New = sr01 ? Number(sr01[1]) : undefined, sr01Old = sr01 ? Number(sr01[2]) : undefined, sr01Cut = sr01 ? isoOf(sr01[3]) : undefined;
  const sr01Plain = sr01Row.match(/within\s+\*{0,2}(\d+)\s+hours/i);
  const sr02Row = spillSop?.content.split(/\r?\n/).find(l => /\*\*SR-02\*\*/.test(l)) ?? '';
  const sr02Limit = Number(sr02Row.match(/within\s+\*{0,2}(\d+(?:\.\d+)?)\s+hours/i)?.[1] ?? NaN);
  const sr03Days = Number(spillSop?.content.match(/verified\s+within\s+\*{0,2}(\d+)\s+days/i)?.[1] ?? NaN);

  type Row = { w: WellData; area: string; ins: any; vol: number; repair?: any; report?: EvidenceDoc; ok: boolean; reason: string; notes: string[] };
  const rows: Row[] = [];
  for (const w of d.wells) {
    if (areaIds.size && !areaIds.has(w.metadata.area_id)) continue;
    if (p.wellIds?.length && !p.wellIds.includes(w.metadata.asset_id)) continue;
    for (const raw of w.inspections) {
      const day = toolkit.day(raw.inspected_at);
      if (day > today || (since && day < since)) continue;
      const item = toolkit.effective(s, w, raw);
      const vol = typeof item.spill_est_volume_bbl === 'number' ? item.spill_est_volume_bbl : NaN;
      if (item.spill_detected !== true || !(vol >= minBbl)) continue;
      if (ours && teamAt(w, day) !== ours) continue;
      const repair = w.maintenance.find(m => m.triggered_by_inspection_id === raw.inspection_id);
      const report = repair ? toolkit.docFor(d, repair.maintenance_id, 'repair report') : undefined;
      let ok = false, reason: string;
      if (!repair) reason = 'no clean-up job found for this inspection';
      else if (!report) reason = 'no clean-up report available for ' + repair.maintenance_id;
      else if (norm(report.content).includes(phraseNorm)) { ok = true; reason = 'report says "' + phrase + '"'; }
      else {
        const field = report.content.match(/(\d+)\s+soil samples?[^\n]*?(\d+(?:\.\d+)?)\s*%\s*TPH/i);
        reason = 'no "' + phrase + '" sentence in the clean-up report' + (field ? ' (only ' + field[1] + ' field soil samples, ' + field[2] + '% TPH)' : '');
      }
      // SOP timing checks (extra notes)
      const notes: string[] = [];
      const events = w.regulatoryEvents.filter(e => e.related_inspection_id === raw.inspection_id);
      const filed = events.find(e => e.protocol_id === 'SR-01' && typeof e.hours_to_report === 'number' && /spill_report/i.test(String(e.event_type)));
      if (filed) {
        const limit = sr01 ? (sr01Cut && day < sr01Cut ? sr01Old : sr01New) : sr01Plain ? Number(sr01Plain[1]) : undefined;
        if (limit !== undefined && filed.hours_to_report > limit) {
          const nov = events.find(e => /violation/i.test(String(e.event_type)));
          notes.push('SR-01 missed: written notice ' + filed.hours_to_report + ' h vs ' + limit + ' h (' + filed.event_id + (nov ? '; NOV ' + nov.event_id + ' ' + toolkit.day(nov.date) + ', ' + toolkit.usd(nov.fine_usd ?? 0) + ', ' + nov.status : '; no NOV yet') + ')');
        }
      }
      const hrs = report ? Number(report.content.match(/contain(?:ed|ment)[^.\n]*?(\d+(?:\.\d+)?)\s*(?:hours?|h)\b/i)?.[1] ?? NaN) : NaN;
      if (Number.isFinite(hrs) && Number.isFinite(sr02Limit) && hrs > sr02Limit) notes.push('SR-02 missed: contained ' + hrs + ' h vs ' + sr02Limit + ' h');
      const ver = events.find(e => e.protocol_id === 'SR-03' && /site_inspection/i.test(String(e.event_type)) && /verif/i.test(String(e.detail)));
      if (ver && Number.isFinite(sr03Days) && daysBetween(day, ver.date) > sr03Days) notes.push('SR-03 verification came ' + daysBetween(day, ver.date) + ' days after discovery vs ' + sr03Days + ' days (' + ver.event_id + ')');
      rows.push({ w, area: d.areas.find(a => a.area_id === w.metadata.area_id)?.name ?? String(w.metadata.area_id), ins: raw, vol, repair, report, ok, reason, notes });
    }
  }
  rows.sort((a, b) => String(a.w.metadata.asset_id).localeCompare(String(b.w.metadata.asset_id)) || toolkit.day(a.ins.inspected_at).localeCompare(toolkit.day(b.ins.inspected_at)));

  // --- text -----------------------------------------------------------------
  const lines: string[] = [];
  const scopeDesc = 'reportable spills (' + minBbl + ' bbl or more) in ' + (areas.map(a => a.name).join(' or ') || 'the areas named in the letter') + (since ? ' discovered since ' + human(since) : '') + ', excluding detections later confirmed not to be crude oil';
  const letterDate = isoOf(text.match(/\*\*date:?\*\*:?\s*(.+)/i)?.[1]);
  const letterFrom = toolkit.clean((text.match(/\*\*from:?\*\*:?\s*(.+)/i)?.[1] ?? '').split(',')[0]);
  const letterName = 'letter from ' + (letterFrom || 'the regulator') + (letterDate ? ' dated ' + human(letterDate) : '');
  lines.push('The ' + letterName + ' covers ' + scopeDesc + '.' + (deadline ? ' Soil results are due ' + human(deadline) + (deadline <= today ? ' (' + (deadline === today ? 'today' : 'now past') + ')' : '') + '.' : ''));
  if (ours) lines.push('Scope narrowed to your team (' + ours + ' wells at the time of the spill).');
  else if (userTeam) lines.push('Your team (' + userTeam + ') owns no production wells, so the full letter scope is shown.');
  const bad = rows.filter(r => !r.ok), good = rows.filter(r => r.ok);
  if (!rows.length) lines.push('No spill in the data meets that scope.');
  else {
    lines.push(rows.length + ' spill' + (rows.length === 1 ? ' is' : 's are') + ' covered. Compliance test (HSE note in the letter): the clean-up report must contain the sentence "' + phrase + '"; field soil readings do not count.');
    lines.push('Compliant (' + good.length + '): ' + (good.map(r => r.w.metadata.asset_id).join(', ') || 'none') + '. Not compliant (' + bad.length + '): ' + (bad.map(r => r.w.metadata.asset_id + ' (' + r.reason + ')').join('; ') || 'none') + '.');
    const timing = rows.filter(r => r.notes.length);
    if (timing.length) lines.push('Separate Spill Response SOP timing findings (not part of the letter test): ' + timing.map(r => r.w.metadata.asset_id + ' - ' + r.notes.join('; ')).join(' | ') + '.');
  }

  const cites: any[] = [];
  const seen = new Set<string>();
  const add = (c: any) => { if (c && !seen.has(c.type + c.id + c.path) && cites.length < 150) { seen.add(c.type + c.id + c.path); cites.push(c); } };
  add(toolkit.citation(letter, undefined, /since\s+\d|reportable/i));
  if (ruleDoc) add(toolkit.citation(ruleDoc, undefined, /sentence/i));
  if (ruleNote) add(toolkit.cite(d, ruleNote.note_id, 'note'));
  if (spillSop) add(toolkit.citation(spillSop, undefined, /SR-01/));
  for (const r of rows) {
    add(toolkit.cite(d, r.ins.inspection_id, 'inspection'));
    if (r.repair) add(toolkit.cite(d, r.repair.maintenance_id, 'repair'));
    add(toolkit.citation(r.report, undefined, r.ok ? new RegExp(phraseNorm.slice(0, 20), 'i') : /Spill clean-up/i));
    for (const e of r.w.regulatoryEvents.filter(e => e.related_inspection_id === r.ins.inspection_id && r.notes.length)) add(toolkit.cite(d, e.event_id, 'regulator'));
  }

  const columns = ['Well', 'Area', 'Inspection', 'Volume (bbl)', 'Clean-up job', 'Compliant?'];
  const table = rows.map(r => [
    r.w.metadata.asset_id, r.area, r.ins.inspection_id + ', ' + toolkit.day(r.ins.inspected_at), toolkit.round(r.vol, 1),
    r.repair ? r.repair.maintenance_id + ' (' + r.repair.equipment_kind + ', ' + toolkit.day(r.repair.started_at) + ')' : 'none found',
    (r.ok ? 'Yes - ' : 'No - ') + r.reason + (r.notes.length ? '. Also: ' + r.notes.join('; ') : ''),
  ]);
  return toolkit.answer(lines.join('\n'), { type: 'table', title: 'Spills covered by ' + letter.title + ' and soil-sample compliance', columns, rows: table }, cites, [], rows.map(r => String(r.w.metadata.asset_id)));
}
