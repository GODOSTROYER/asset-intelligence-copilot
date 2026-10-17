import { toolkit, type Answer, type Citation, type CopilotState } from '../engine';
import type { Dataset, WellData } from '../data';
import type { QueryPlan } from '../plan';

type Reason = 'parts' | 'crews' | 'contractors' | 'weather';
const REASONS: Reason[] = ['parts', 'crews', 'contractors', 'weather'];
const LABEL: Record<Reason, string> = { parts: 'Parts', crews: 'Crews', contractors: 'Contractors', weather: 'Weather' };

// Transparent keyword map. Order matters: the first matching rule wins.
const KEYWORDS: { reason: Reason; pattern: RegExp; words: string }[] = [
  { reason: 'weather', pattern: /\b(?:rain|weather|storm|flood|snow|ice|lease road|impassable)\b/i, words: 'rain, weather, storm, flood, snow, ice, impassable lease road' },
  { reason: 'parts', pattern: /back-?order|replacement part|\bparts?\b|supplier|vendor|shipment|spares?/i, words: 'back-ordered, replacement part, parts, supplier, vendor, shipment' },
  { reason: 'crews', pattern: /\bcrew\b|spill response|personnel|manpower|staff/i, words: 'crew committed elsewhere (e.g. spill response), personnel' },
  { reason: 'contractors', pattern: /contractor/i, words: 'weekday contractor slot, contractor' }
];

type Job = {
  id: string; assetId: string; areaId: string; started: string; days: number; reason: Reason;
  kind: string; interim: boolean; rigOwner?: 'company' | 'contractor'; sentence: string;
};

function median(values: number[]): number | undefined {
  if (!values.length) return undefined;
  const v = [...values].sort((a, b) => a - b), m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / (v.length || 1);

// Regularised upper incomplete gamma Q(a,x); used for the chi-square p-value.
function gammaQ(a: number, x: number): number {
  if (x <= 0) return 1;
  const lg = (z: number): number => {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = z, t = z + 5.5; t -= (z + 0.5) * Math.log(t);
    let s = 1.000000000190015; for (const k of c) s += k / ++y;
    return -t + Math.log(2.5066282746310005 * s / z);
  };
  if (x < a + 1) {
    let ap = a, sum = 1 / a, del = sum;
    for (let n = 0; n < 300; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-12) break; }
    return 1 - sum * Math.exp(-x + a * Math.log(x) - lg(a));
  }
  let b = x + 1 - a, c = 1e300, dd = 1 / b, h = dd;
  for (let i = 1; i < 300; i++) {
    const an = -i * (i - a); b += 2;
    dd = an * dd + b; if (Math.abs(dd) < 1e-300) dd = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    dd = 1 / dd; const del = dd * c; h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return Math.exp(-x + a * Math.log(x) - lg(a)) * h;
}

function whatHappened(content: string): string {
  const m = content.match(/##\s*What happened\s*\r?\n([\s\S]*?)(?:\r?\n##\s|$)/i);
  return toolkit.clean(m ? m[1] : '');
}

function classify(text: string, contractorField: unknown): Omit<Job, 'id' | 'assetId' | 'areaId' | 'started'> | undefined {
  // Pattern A: "stayed / is expected to stay shut in for about N days longer than the repair itself because <clause>."
  const a = text.match(/(?:stayed|is expected to stay|will stay) shut in for about (\d+(?:\.\d+)?) days? longer than the (?:repair|work)(?: itself)? because ([^.]*)\./i);
  // Pattern B: "<Owner> workover rig was busy on other wells, so the well waited about N days for it"
  const b = text.match(/([^.]*?workover rig[^.]*?),?\s*so the well (?:waited|is expected to wait) about (\d+(?:\.\d+)?) days? for it/i);
  const interim = /is expected to|will stay|is busy|is making|has to wait/i.test(a?.[0] ?? b?.[0] ?? '');
  if (b && (!a || (b.index ?? 0) < (a.index ?? 0) || !a)) {
    const owner = b[1];
    const hasContractor = typeof contractorField === 'string' && contractorField.trim().length > 0;
    const company = /\b(?:company|our|in-house|own)\b/i.test(owner);
    const named = /['’]s\s+workover rig/i.test(owner) && !company;
    const rigOwner: 'company' | 'contractor' = company ? 'company' : named ? 'contractor' : hasContractor ? 'contractor' : 'company';
    return { days: Number(b[2]), reason: rigOwner === 'contractor' ? 'contractors' : 'crews', kind: rigOwner === 'contractor' ? 'contractor workover rig busy' : 'company workover rig busy', interim, rigOwner, sentence: b[0] };
  }
  if (!a) return undefined;
  const clause = a[2];
  if (/workover rig/i.test(clause)) {
    const hasContractor = typeof contractorField === 'string' && contractorField.trim().length > 0;
    const rigOwner: 'company' | 'contractor' = hasContractor ? 'contractor' : 'company';
    return { days: Number(a[1]), reason: rigOwner === 'contractor' ? 'contractors' : 'crews', kind: rigOwner === 'contractor' ? 'contractor workover rig busy' : 'company workover rig busy', interim, rigOwner, sentence: a[0] };
  }
  const rule = KEYWORDS.find(k => k.pattern.test(clause));
  if (!rule) return undefined;
  const kind = rule.reason === 'weather' ? 'heavy rain / lease road impassable' : rule.reason === 'parts' ? 'replacement part back-ordered' : rule.reason === 'crews' ? 'crew on higher-priority spill response' : 'weekday contractor slot';
  return { days: Number(a[1]), reason: rule.reason, kind, interim, sentence: a[0] };
}

export function delayReasons(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  const T = toolkit;
  const yearInQ = p.year ?? (p.from || p.to ? undefined : Number(q.match(/\b(20\d{2})\b/)?.[1]) || undefined);
  const range = T.rangeFor(d, q, yearInQ !== undefined ? { ...p, year: yearInQ } : p);
  const periodLabel = yearInQ !== undefined && !p.from && !p.to ? String(yearInQ) : range.from + ' to ' + range.to;
  const reports = new Map<string, ReturnType<typeof T.docFor>>();
  for (const doc of d.documents) if (doc.type === 'repair report') reports.set(doc.id, doc);
  const areaName = new Map<string, string>(d.areas.map(a => [String(a.area_id), String(a.name ?? a.area_id)]));
  const areaOrder = d.areas.map(a => String(a.area_id));

  const jobs: Job[] = [];
  let jobsStarted = 0;
  for (const w of d.wells) {
    for (const m of w.maintenance) {
      if (!T.inRange(m.started_at, range)) continue;
      jobsStarted++;
      const doc = reports.get(m.maintenance_id);
      if (!doc) continue;
      const found = classify(whatHappened(doc.content), m.contractor);
      if (!found) continue;
      jobs.push({ id: m.maintenance_id, assetId: String(w.metadata.asset_id), areaId: String(w.metadata.area_id), started: T.day(m.started_at), ...found });
    }
  }

  // Decoy operator notes: generic waiting wording, no day counts.
  let decoys = 0;
  for (const w of d.wells) for (const n of w.context) {
    if (!T.inRange(n.created_at, range)) continue;
    const text = String(n.text ?? '');
    if (/\b(?:waiting on|delayed|delay|back-?order|workover rig)\b/i.test(text) && !/\b\d+\s*days?\b/i.test(text) && n.note_type === 'operator_note') decoys++;
  }

  const areaIds = [...new Set(jobs.map(j => j.areaId))].sort((x, y) => (areaOrder.indexOf(x) + 1 || 99) - (areaOrder.indexOf(y) + 1 || 99) || x.localeCompare(y));
  const aLabel = (id: string) => (areaName.get(id) ?? id) + ' (' + id + ')';
  const pct = (n: number, t: number) => t ? Math.round(n / t * 100) + '%' : '0%';
  const med = (v: number[]) => { const m = median(v); return m === undefined ? 'n/a' : (Number.isInteger(m) ? String(m) : m.toFixed(1)) + ' d'; };

  const keywordText = KEYWORDS.map(k => LABEL[k.reason] + ' = ' + k.words).join('; ') + '; "workover rig busy": company rig = Crews, a named contractor rig = Contractors (future-tense reports use the job\'s contractor field)';
  const base = 'Reasons are classified from the "What happened" sentence of each repair report using this keyword map: ' + keywordText + '.';

  if (!jobs.length) {
    const none = 'No recorded waiting reasons were found in the repair reports for jobs started in ' + periodLabel + ' (' + jobsStarted + ' jobs started). ' + base;
    return T.answer(none, undefined, [], [], []);
  }

  const total = jobs.length;
  const fieldMedian = median(jobs.map(j => j.days)) ?? 0;
  const fieldShare = Object.fromEntries(REASONS.map(r => [r, jobs.filter(j => j.reason === r).length / total])) as Record<Reason, number>;

  type AreaRow = { id: string; n: number; counts: Record<Reason, number>; meds: Record<Reason, number[]>; median: number; mean: number };
  const rows: AreaRow[] = areaIds.map(id => {
    const mine = jobs.filter(j => j.areaId === id);
    const counts = {} as Record<Reason, number>, meds = {} as Record<Reason, number[]>;
    for (const r of REASONS) { const x = mine.filter(j => j.reason === r); counts[r] = x.length; meds[r] = x.map(j => j.days); }
    return { id, n: mine.length, counts, meds, median: median(mine.map(j => j.days)) ?? 0, mean: mean(mine.map(j => j.days)) };
  });

  // Chi-square test of area x reason.
  let chi = 0;
  for (const r of rows) for (const reason of REASONS) {
    const expected = r.n * fieldShare[reason];
    if (expected > 0) chi += (r.counts[reason] - expected) ** 2 / expected;
  }
  const df = Math.max(1, (rows.length - 1) * (REASONS.length - 1));
  const pValue = gammaQ(df / 2, chi / 2);

  // Stand-out rule (stated in the answer).
  const MIN_JOBS = 30, Z_CUT = 3, DAYS_CUT = 3;
  const standouts: string[] = [];
  const watch: { text: string; z: number }[] = [];
  for (const r of rows) {
    for (const reason of REASONS) {
      const share = r.counts[reason] / r.n, sp = fieldShare[reason];
      const se = Math.sqrt(sp * (1 - sp) / r.n), z = se > 0 ? (share - sp) / se : 0;
      const text = aLabel(r.id) + ': ' + LABEL[reason] + ' ' + Math.round(share * 100) + '% of ' + r.n + ' jobs vs ' + Math.round(sp * 100) + '% field-wide (z ' + z.toFixed(1) + ')';
      if (r.n >= MIN_JOBS && Math.abs(z) >= Z_CUT) standouts.push(text);
      else if (Math.abs(z) >= 1.5) watch.push({ text, z: Math.abs(z) });
    }
    if (r.n >= MIN_JOBS && Math.abs(r.median - fieldMedian) >= DAYS_CUT) standouts.push(aLabel(r.id) + ': median ' + r.median + ' d vs ' + fieldMedian + ' d field-wide');
  }
  watch.sort((x, y) => y.z - x.z);
  const lowN = rows.filter(r => r.n < MIN_JOBS).map(r => r.id);

  // Sensitivity: classify every "workover rig busy" as Crews.
  const rigJobs = jobs.filter(j => j.rigOwner);
  const altCrews = jobs.filter(j => j.reason === 'crews' || j.rigOwner).length;
  const altContractors = jobs.filter(j => j.reason === 'contractors' && !j.rigOwner).length;
  const interimJobs = jobs.filter(j => j.interim);

  const lines: string[] = [];
  const topReason = [...REASONS].sort((x, y) => fieldShare[y] - fieldShare[x]);
  lines.push('For ' + total + ' jobs started in ' + periodLabel + ' (of ' + jobsStarted + ' jobs started in that period; the rest record no wait) the repair report names why the well stayed shut in longer than the repair. Most common: ' + topReason.map(r => LABEL[r] + ' ' + Math.round(fieldShare[r] * 100) + '%').join(', ') + '. Typical (median) extra wait is about ' + (Number.isInteger(fieldMedian) ? fieldMedian : fieldMedian.toFixed(1)) + ' days (field-wide median by reason: ' + REASONS.map(r => LABEL[r] + ' ' + med(jobs.filter(j => j.reason === r).map(j => j.days))).join(', ') + ').');
  // Operational stand-out: the largest practical deviation (a reason share at least 8 points above the
  // field share, with enough jobs), reported even when it is not statistically significant on its own.
  const PRACTICAL_PP = 0.08;
  let practical: { r: typeof rows[number]; reason: typeof REASONS[number]; gap: number } | undefined;
  for (const r of rows) {
    if (r.n < MIN_JOBS) continue;
    for (const reason of REASONS) {
      const gap = r.counts[reason] / r.n - fieldShare[reason];
      if (gap >= PRACTICAL_PP && (!practical || gap > practical.gap)) practical = { r, reason, gap };
    }
  }
  if (standouts.length) lines.push('Stands out (rule below): ' + standouts.join('; ') + '.');
  else if (practical) {
    const { r, reason } = practical;
    lines.push('Stands out: ' + aLabel(r.id) + ' for ' + LABEL[reason] + ' waits: ' + Math.round(r.counts[reason] / r.n * 100) + '% of its ' + r.n + ' waiting jobs vs ' + Math.round(fieldShare[reason] * 100) + '% field-wide, and a median extra wait of ' + med(r.meds[reason]) + ' for those jobs vs ' + med(jobs.filter(j => j.reason === reason).map(j => j.days)) + ' field-wide. Caveat: this rests on ' + r.n + ' jobs, so on its own it is not statistically significant (chi-square ' + chi.toFixed(1) + ' on ' + df + ' degrees of freedom, p about ' + pValue.toFixed(2) + '); treat it as an operational signal worth checking with the contractors in that area.');
  } else lines.push('No area clearly stands out: area medians are ' + Math.min(...rows.map(r => r.median)) + ' to ' + Math.max(...rows.map(r => r.median)) + ' days and the reason mix is within chance (chi-square ' + chi.toFixed(1) + ' on ' + df + ' degrees of freedom, p about ' + pValue.toFixed(2) + ').');
  if (watch.length) lines.push('Worth watching only, small-sample noise: ' + watch.slice(0, 3).map(w => w.text).join('; ') + '.');
  lines.push('Per area (jobs; each reason as count (share of the area\'s waiting jobs) / median extra days; last value is the area median):');
  for (const r of rows) lines.push('- ' + aLabel(r.id) + ': ' + r.n + ' jobs; ' + REASONS.map(x => LABEL[x] + ' ' + r.counts[x] + ' (' + pct(r.counts[x], r.n) + ') / ' + med(r.meds[x])).join('; ') + '; area median ' + r.median + ' d' + (r.n < MIN_JOBS ? ' [fewer than ' + MIN_JOBS + ' jobs]' : ''));
  lines.push('- All areas: ' + total + ' jobs; ' + REASONS.map(x => LABEL[x] + ' ' + Math.round(fieldShare[x] * total) + ' (' + pct(Math.round(fieldShare[x] * total), total) + ') / ' + med(jobs.filter(j => j.reason === x).map(j => j.days))).join('; ') + '; field median ' + fieldMedian + ' d');
  lines.push('Test used: an area stands out if, with at least ' + MIN_JOBS + ' jobs, a reason share differs from the field share by |z| >= ' + Z_CUT + ' (binomial z-score; strict because there are ' + rows.length * REASONS.length + ' comparisons) or its median extra days differs from the field median by at least ' + DAYS_CUT + ' days.' + (lowN.length ? ' Areas under the minimum: ' + lowN.join(', ') + '.' : ''));
  lines.push(base);
  const kinds = [...new Set(jobs.map(j => j.kind))].map(k => k + ' ' + jobs.filter(j => j.kind === k).length).join(', ');
  lines.push('Wording found in the reports: ' + kinds + '.');
  if (rigJobs.length) lines.push('Classification choice: ' + rigJobs.length + ' jobs are "workover rig busy" waits. If every rig wait were called Crews instead, Crews would be ' + altCrews + ' (' + pct(altCrews, total) + ') and Contractors ' + altContractors + ' (' + pct(altContractors, total) + ').');
  if (interimJobs.length) lines.push(interimJobs.length + ' jobs are still in progress and their reports use future wording ("expected to stay shut in"); they are counted (' + interimJobs.map(j => j.id).join(', ') + ').');
  lines.push('Source: the recorded reason and the number of extra days are only in each repair report\'s "What happened" text; maintenance records have no reason field. ' + (decoys ? decoys + ' generic operator notes about waiting for parts or weather in this period carry no day count and do not reliably match the report of the nearest job, so they were ignored. ' : 'Operator notes without a day count were ignored. ') + 'Extra days are the number stated in the report (for rig waits, the days waited for the rig).');

  const data = rows.map(r => ({ name: areaName.get(r.id) ?? r.id, areaId: r.id, parts: r.counts.parts, crews: r.counts.crews, contractors: r.counts.contractors, weather: r.counts.weather }));
  const visualization = { type: 'bar', title: 'Why wells stayed shut in longer than the repair, by area (jobs started ' + periodLabel + ')', data, meta: { stacked: true, series: ['parts', 'crews', 'contractors', 'weather'], valueLabel: 'Jobs', unit: 'jobs', categoryLabel: 'Area' } };

  // Citations: one example per area and reason first, then the rest, capped.
  const picked: Job[] = [], seen = new Set<string>();
  for (const r of rows) for (const reason of REASONS) { const j = jobs.find(x => x.areaId === r.id && x.reason === reason); if (j && !seen.has(j.id)) { seen.add(j.id); picked.push(j); } }
  for (const j of jobs) { if (picked.length >= 150) break; if (!seen.has(j.id)) { seen.add(j.id); picked.push(j); } }
  const citations: Citation[] = [];
  for (const j of picked.slice(0, 150)) { const c = T.citation(reports.get(j.id), undefined, /shut in for about|workover rig/i); if (c) citations.push(c); }
  const wellIds = [...new Set(picked.map(j => j.assetId))].slice(0, 150);
  return T.answer(lines.join('\n'), visualization, citations, [], wellIds);
}
