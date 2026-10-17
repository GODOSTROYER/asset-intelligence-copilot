import { toolkit, type Answer, type CopilotState } from '../engine';
import type { Dataset, EvidenceDoc, WellData } from '../data';
import type { QueryPlan } from '../plan';

type Moc = { id: string; doc: EvidenceDoc; wells: Set<string>; effective?: string; expires?: string; extends?: string };
type Interval = { well: WellData; inNote: any; outNote?: any; from: string; to?: string };

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
const human = (iso?: string) => (iso ? Number(iso.slice(8, 10)) + ' ' + MONTH_NAMES[Number(iso.slice(5, 7)) - 1] + ' ' + iso.slice(0, 4) : 'n/a');
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);

function parseMocs(d: Dataset): Moc[] {
  const out: Moc[] = [];
  for (const doc of d.documents) {
    if (doc.type !== 'SOP') continue;
    const text = doc.content ?? '';
    const heading = text.match(/^#.*?\b(MOC-\d{4}-\d+)\b/im) ?? (/management of change|\bMOC\b/i.test(text.slice(0, 300)) ? text.match(/\b(MOC-\d{4}-\d+)\b/) : null);
    if (!heading) continue;
    const id = heading[1].toUpperCase();
    const wells = new Set((text.match(/\bWELL-\d+\b/gi) ?? []).map(v => v.toUpperCase()));
    const eff = text.match(/effective\s+(?:from\s+)?([^\n.;]+)/i);
    const exp = text.match(/expires?\s+(?:on\s+)?([^\n;]+)/i);
    const ext = text.match(/\bextends?\s+(?:MOC\s+)?(MOC-\d{4}-\d+)/i);
    out.push({ id, doc, wells, effective: isoOf(eff?.[1]), expires: isoOf(exp?.[1]), extends: ext?.[1].toUpperCase() });
  }
  return out;
}

/** Effective expiry of a base memo for a well, applying later extensions that replace the expiry date. */
function chainFor(mocs: Moc[], base: Moc, wellId: string) {
  let expires = base.expires;
  const used: Moc[] = [];
  const visit = (parent: Moc) => {
    for (const m of mocs) {
      if (m.extends !== parent.id || m === parent) continue;
      if (m.wells.size && !m.wells.has(wellId)) continue;
      if (m.expires && (!expires || m.expires > expires)) expires = m.expires;
      used.push(m);
      visit(m);
    }
  };
  visit(base);
  return { expires, extensions: used };
}

const IN_RE = /bypass\s+(?:installed|in place|fitted|put in|is in)|(?:put|had|installed|fitted|placed)\b[^.]*\bbypass\b[^.]*\b(?:in|installed|fitted)\b|(?:installed|fitted|put in)\s+(?:a\s+|the\s+)?(?:temporary\s+)?bypass/i;
const OUT_RE = /(?:took|taken|take|pulled|pull|removed|remove|lifted)\b[^.]*\bbypass\b[^.]*\b(?:out|off|removed|pulled)\b|bypass\s+(?:was\s+)?(?:removed|pulled|taken out|lifted)|(?:remov|pull|tak)\w*\s+(?:out\s+)?(?:the\s+)?bypass/i;

function intervalsFor(w: WellData): Interval[] {
  const notes = w.context
    .filter(n => /bypass/i.test(String(n.text)))
    .map(n => ({ n, day: toolkit.day(n.valid_from ?? n.created_at), at: String(n.created_at ?? '') }))
    .sort((a, b) => a.day.localeCompare(b.day) || a.at.localeCompare(b.at));
  const result: Interval[] = [];
  let open: Interval | undefined;
  for (const { n, day } of notes) {
    const text = String(n.text);
    const isOut = OUT_RE.test(text);
    const isIn = !isOut && IN_RE.test(text);
    if (isIn) {
      if (!open) { open = { well: w, inNote: n, from: day }; result.push(open); }
    } else if (isOut && open) {
      open.outNote = n; open.to = day; open = undefined;
    }
  }
  return result;
}

export function bypassCompliance(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  const today = toolkit.today(d);
  const mocs = parseMocs(d);
  const wells = toolkit.scopeFor(d, p);
  const areaName = (w: WellData) => d.areas.find(a => a.area_id === w.metadata.area_id)?.name ?? String(w.metadata.area_id ?? '');
  const rows: { w: WellData; iv: Interval; memo: string; until?: string; status: string; remark: string; current: boolean; violation: boolean; docs: Moc[] }[] = [];

  for (const w of wells) {
    const wid = String(w.metadata.asset_id).toUpperCase();
    for (const iv of intervalsFor(w)) {
      const end = iv.to ?? today;
      // Candidate approvals: base memos (not extensions of another memo) naming the well, effective by the bypass-in date.
      const candidates = mocs.filter(m => !m.extends && m.wells.has(wid)).map(m => ({ m, ...chainFor(mocs, m, wid) }));
      const started = candidates.filter(c => !c.m.effective || c.m.effective <= iv.from);
      const pool = started.length ? started : candidates;
      pool.sort((a, b) => (b.expires ?? '').localeCompare(a.expires ?? ''));
      const best = pool[0];
      let status: string, memo = 'none', until: string | undefined, remark = '';
      const docs: Moc[] = [];
      if (!best) { status = 'Not approved'; remark = 'well is named in no MOC memo'; }
      else {
        docs.push(best.m, ...best.extensions);
        memo = best.m.id + (best.extensions.length ? ', extended by ' + best.extensions.map(e => e.id).join(', ') : '');
        until = best.expires;
        if (best.m.effective && iv.from < best.m.effective) { status = 'Not approved'; remark = 'bypass put in before ' + best.m.id + ' took effect (' + human(best.m.effective) + ')'; }
        else if (!until) { status = 'Allowed'; remark = 'no expiry stated'; }
        else if (end <= until) { status = 'Allowed'; remark = iv.to ? 'removed ' + daysBetween(iv.to, until) + ' days before expiry' : 'expires in ' + daysBetween(today, until) + ' days'; }
        else { status = 'Expired'; remark = (iv.to ? 'stayed in ' : 'still in place ') + daysBetween(until, end) + ' days past expiry' + (best.m.expires !== until ? '' : ' (not extended)'); }
      }
      rows.push({ w, iv, memo, until, status, remark, current: !iv.to, violation: status !== 'Allowed', docs });
    }
  }

  rows.sort((a, b) => Number(b.current) - Number(a.current) || Number(b.violation) - Number(a.violation) || String(a.iv.from).localeCompare(b.iv.from));
  const current = rows.filter(r => r.current), pastBad = rows.filter(r => !r.current && r.violation), pastOk = rows.filter(r => !r.current && !r.violation);
  const list = (rs: typeof rows) => rs.map(r => r.w.metadata.asset_id + ' (' + areaName(r.w) + ', ' + r.status + (r.until ? ', valid until ' + human(r.until) : '') + (r.remark ? '; ' + r.remark : '') + ')').join('; ');

  const lines: string[] = [];
  if (!rows.length) {
    lines.push('No temporary flowline bypass is recorded in the operator notes' + (p.wellIds?.length ? ' for the selected wells' : '') + '.');
    if (!mocs.length) lines.push('No MOC memos were found in the SOP documents either.');
  } else {
    lines.push(rows.length + ' temporary flowline bypass' + (rows.length === 1 ? '' : 'es') + ' found in the operator notes (' + current.length + ' in place now on ' + today + ', ' + (rows.length - current.length) + ' removed).');
    lines.push(current.length ? 'In place now: ' + list(current) + '. ' + current.filter(r => r.violation).length + ' of these ' + current.length + ' are violations (' + (current.filter(r => r.violation).map(r => r.w.metadata.asset_id + ' ' + r.status.toLowerCase()).join(', ') || 'none') + ').' : 'No bypass is in place now.');
    lines.push(pastBad.length ? 'Past violations (removed, but overstayed their approval or were never approved): ' + list(pastBad) + '.' : 'No past bypass overstayed its approval or ran without one.');
    lines.push(pastOk.length ? 'Past bypasses that stayed within their approval: ' + pastOk.map(r => r.w.metadata.asset_id).join(', ') + '.' : '');
    const total = current.filter(r => r.violation).length + pastBad.length;
    lines.push('Total violations: ' + total + ' of ' + rows.length + '. Rule: a bypass needs a non-expired MOC naming the well; an extension memo replaces the expiry of the memo it extends, and expiry is the end of that day.');
  }

  const cites: any[] = [];
  const seen = new Set<string>();
  const add = (c: any) => { if (c && !seen.has(c.type + c.id + c.path) && cites.length < 150) { seen.add(c.type + c.id + c.path); cites.push(c); } };
  const note = (r: typeof rows[number], n: any, when: string) => toolkit.cite(d, n.note_id, 'note') ?? toolkit.citation(undefined, { id: n.note_id, title: 'Operator note ' + n.note_id, type: 'context note', path: 'assets/' + r.w.metadata.asset_id + '/context.jsonl', excerpt: when + ' · ' + n.text, assetId: r.w.metadata.asset_id });
  for (const r of rows) {
    add(note(r, r.iv.inNote, r.iv.from));
    if (r.iv.outNote) add(note(r, r.iv.outNote, r.iv.to ?? ''));
    for (const m of r.docs) add(toolkit.citation(m.doc, undefined, /expires|effective/i));
  }
  for (const doc of d.documents) if (doc.type === 'SOP' && /OPS-2/.test(doc.content) && /bypass/i.test(doc.content)) add(toolkit.citation(doc, undefined, /OPS-2/));

  const columns = ['Well', 'Area', 'Bypass in', 'Bypass out', 'Approval', 'Approval valid until', 'Status'];
  const table = rows.map(r => [r.w.metadata.asset_id, areaName(r.w), r.iv.from, r.iv.to ?? 'still in', r.memo, r.until ? human(r.until) : 'n/a', r.status + (r.current ? ' (in place now)' : r.violation ? ' (past violation)' : '')]);
  return toolkit.answer(lines.filter(Boolean).join('\n'), { type: 'table', title: 'Temporary flowline bypasses and MOC approval', columns, rows: table }, cites, [], rows.map(r => String(r.w.metadata.asset_id)));
}
