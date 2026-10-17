import { toolkit, type Answer, type Citation, type CopilotState } from '../engine';
import type { Dataset, WellData } from '../data';
import type { QueryPlan } from '../plan';

type Metric = 'pressure' | 'production' | 'flow';

const METRICS: Record<Metric, { label: string; field: RegExp; text: RegExp }> = {
  pressure: { label: 'reservoir / tubing / wellhead pressure', field: /press|psi|\bbhp\b|\bwhp\b|\bthp\b|\bchp\b/i, text: /pressure|\bpsi\b|\bkpa\b|\bmpa\b/i },
  production: { label: 'oil production volume (barrels produced)', field: /prod|barrel|\bbbl|\boil\b|volume|\bbpd\b|meter|tank|allocation|yield/i, text: /barrels? (?:of oil )?produced|production (?:volume|rate)|bbl\/d|\bbpd\b|barrels per day|allocation|tank gauge|meter(?:ed)? (?:volume|reading)/i },
  flow: { label: 'flow rate', field: /flow|rate|\bbpd\b|throughput|\bgpm\b/i, text: /flow ?rate|bbl\/d|\bbpd\b|barrels per day|\bgpm\b|throughput|\bmcf\b/i }
};

function detect(q: string): Metric {
  if (/\b(?:flow\s*rate|flowrate|bpd|barrels per day|bbl\/d|throughput|rate of flow)\b/i.test(q)) return 'flow';
  if (/pressure|\bpsi\b|\bbhp\b|\bwhp\b|\bthp\b|tubing|casing/i.test(q)) return 'pressure';
  return 'production';
}

function typeOn(w: WellData, date: string): string {
  const history = Array.isArray(w.metadata.type_history) ? w.metadata.type_history : [];
  for (const h of history) if (h?.well_type && (!h.from || date >= h.from) && (!h.to || date <= h.to)) return String(h.well_type);
  return String(w.metadata.well_type);
}
const keysOf = (rows: Record<string, any>[]) => [...new Set(rows.flatMap(r => Object.keys(r)))];
const fmtRange = (v: number[]) => v.length ? Math.min(...v) + ' to ' + Math.max(...v) : 'n/a';

export function dataAvailability(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  const T = toolkit;
  const metric = detect(q), spec = METRICS[metric];

  // 1. Field names across every record type.
  const sources: [string, Record<string, any>[]][] = [
    ['inspection', d.wells.flatMap(w => w.inspections)],
    ['repair (maintenance)', d.wells.flatMap(w => w.maintenance)],
    ['operator note / context', d.wells.flatMap(w => w.context)],
    ['regulatory event', d.wells.flatMap(w => w.regulatoryEvents)],
    ['well metadata', d.wells.map(w => w.metadata)]
  ];
  const fieldNames = new Map<string, string[]>();
  for (const [name, rows] of sources) fieldNames.set(name, keysOf(rows));
  const matched: { source: string; field: string }[] = [];
  for (const [name, keys] of fieldNames) for (const k of keys) if (spec.field.test(k)) matched.push({ source: name, field: k });
  const spillFields = matched.filter(m => /spill/i.test(m.field)), downtimeFields = matched.filter(m => /downtime|cost/i.test(m.field));
  const real = matched.filter(m => !spillFields.includes(m) && !downtimeFields.includes(m));
  const allFields = [...fieldNames.values()].flat();

  const lines: string[] = [];
  const citations: Citation[] = [];
  const wellIds: string[] = [];
  let visualization: Answer['visualization'];
  const reports = d.documents.filter(x => x.type === 'repair report');

  if (metric === 'pressure') {
    const testRe = /Pressure-tested the repaired section at (\d+(?:\.\d+)?) psi \([^)]*?maximum operating pressure of (\d+(?:\.\d+)?) psi\)/i;
    const tests: number[] = [], mops: number[] = [], wellSet = new Set<string>();
    let example: typeof reports[number] | undefined, qualitative = 0;
    for (const r of reports) {
      const m = r.content.match(testRe);
      if (m) { tests.push(Number(m[1])); mops.push(Number(m[2])); if (r.assetId) wellSet.add(r.assetId); example ??= r; }
      else if (/pressure[- ]test|pressure bled|bled off/i.test(r.content)) qualitative++;
    }
    const alarmNotes = d.wells.flatMap(w => w.context.filter(n => /pressure/i.test(String(n.text ?? '')) && /alarm/i.test(String(n.text ?? ''))));
    const noteDocs = d.documents.filter(x => x.type === 'note' && /pressure/i.test(x.content) && /alarm/i.test(x.content));
    const ratings: string[] = [];
    for (const [t, man] of Object.entries(d.manuals)) {
      const text = T.clean(man.content).replace(/\*/g, ''), hit = text.match(/Maximum allowable wellhead working pressure:\s*[\d,]+\s*psi/i) ?? text.match(/[A-Za-z ]{0,40}[\d,]{4,6}\s*psi/i);
      if (hit) ratings.push(t + ': "' + hit[0].trim().slice(0, 140) + '"');
    }
    const reservoirMentions = Object.values(d.manuals).filter(m => /reservoir/i.test(m.content)).map(m => m.id);
    lines.push('The data cannot answer this. It contains no reservoir pressure, and no tubing, casing, bottom-hole or live wellhead pressure measurements, for any well, so a pressure map or ranking cannot be drawn and I have not estimated one (for example from temperature, well type or production state).');
    lines.push('What I scanned: field names in ' + sources.map(([n]) => n).join(', ') + ' records (' + allFields.length + ' field names in all) and the text of ' + d.documents.length.toLocaleString('en-US') + ' documents. Pressure-like field names found: ' + (real.length ? real.map(m => m.field + ' (' + m.source + ')').join(', ') : 'none') + '. Reservoir/pool/formation fields in well metadata: ' + (fieldNames.get('well metadata')!.some(k => /reservoir|pool|formation/i.test(k)) ? 'present' : 'none') + '.');
    lines.push('Pressure-related facts that do exist, none of which is reservoir pressure:');
    lines.push('- Flowline pressure tests in repair reports: ' + tests.length.toLocaleString('en-US') + ' reports on ' + wellSet.size + ' wells state a one-off test of a repaired flowline section (test pressure ' + fmtRange(tests) + ' psi, flowline maximum operating pressure ' + fmtRange(mops) + ' psi, held 4 hours). These are integrity tests of a repaired section, per job, not a field or reservoir reading.');
    lines.push('- Separator alarm notes: ' + (alarmNotes.length ? alarmNotes.length + ' operator note(s) record a high pressure alarm on the separator (' + alarmNotes.map(n => n.note_id + ' on ' + n.asset_id + ' ' + T.day(n.created_at)).join('; ') + '), with no pressure value.' : 'none found.') + ' An alarm is an event, not a measurement.');
    lines.push('- Equipment ratings in the well-type manuals' + (ratings.length ? ' (' + ratings.join('; ') + ')' : '') + ' are design limits, not readings.' + (qualitative ? ' ' + qualitative + ' further repair reports mention pressure testing or bleeding off pressure without a figure.' : ''));
    lines.push((reservoirMentions.length ? 'The word "reservoir" appears only in generic manual text (' + reservoirMentions.join(', ') + '), ' : 'Nothing in the data ') + 'and the data never states that wells share one reservoir.');
    lines.push('To map reservoir pressure the data would need periodic or static pressure surveys (bottom-hole or shut-in wellhead pressure) per well, or a SCADA/well-test pressure feed with timestamps and units. What I can show instead, clearly labelled: wellhead and ambient temperature per inspection with producing status by the manual rule, spill volumes, and downtime.');
    if (example) citations.push(T.citation(example, undefined, /Pressure-tested/i)!);
    for (const n of noteDocs.slice(0, 5)) citations.push(T.citation(n)!);
    for (const man of Object.values(d.manuals).slice(0, 3)) { const c = T.citation(man, undefined, /psi/i); if (c) citations.push(c); }
    for (const n of alarmNotes) wellIds.push(String(n.asset_id));
  } else if (metric === 'production') {
    const range = T.rangeFor(d, q, p);
    const periodLabel = p.year !== undefined || (/\b20\d{2}\b/.test(q) && !p.from) ? String(p.year ?? q.match(/\b20\d{2}\b/)![0]) : range.from + ' to ' + range.to;
    const spillHit = spillFields.map(m => m.field).join(', ');
    lines.push('The data cannot name the well that produced the most oil' + (periodLabel ? ' in ' + periodLabel : '') + '. It holds no oil production volumes (barrels, rates, meter, allocation or tank readings) for any well.');
    lines.push('What I scanned: field names in inspection, repair, note, regulatory and metadata records (' + allFields.length + ' field names in all) and document text. Volume-like fields found: ' + (real.length ? real.map(m => m.field + ' (' + m.source + ')').join(', ') : 'none') + '. ' + (spillHit ? 'The only barrel-valued field is ' + spillHit + ', the estimated volume of crude spilled, which is not production. ' : '') + 'Repair cost and downtime are not production either.');

    // Proxy: producing readings per well in the period, using the type rule in force on each date.
    type Tally = { id: string; type: string; area: string; readings: number; producing: number; downtime: number; jobs: number };
    const tally: Tally[] = [];
    for (const w of d.wells) {
      const views = new Map<string, WellData>();
      let readings = 0, producing = 0;
      for (const raw of w.inspections) {
        const day = T.day(raw.inspected_at);
        if (day > T.today(d) || !T.inRange(raw.inspected_at, range)) continue;
        const type = typeOn(w, day);
        let view = views.get(type);
        if (!view) { view = { ...w, metadata: { ...w.metadata, well_type: type } }; views.set(type, view); }
        // Apply data_correction notes dated before today.
        let item = raw;
        for (const n of w.context) if (n.note_type === 'data_correction' && n.inspection_id === raw.inspection_id && typeof n.corrected_value === 'number' && (n.field === 'wellhead_temp_c' || n.field === 'ambient_temp_c') && (!n.valid_from || String(n.valid_from) <= T.today(d))) item = { ...item, [n.field]: n.corrected_value };
        const status = T.production(d, s, view, item);
        readings++;
        if (status.producing === true) producing++;
      }
      const jobs = w.maintenance.filter(m => T.inRange(m.started_at, range));
      tally.push({ id: String(w.metadata.asset_id), type: String(w.metadata.well_type), area: String(w.metadata.area_id), readings, producing, downtime: jobs.reduce((a, m) => a + (Number(m.downtime_hours) || 0), 0), jobs: jobs.length });
    }
    const max = Math.max(...tally.map(t => t.producing));
    const tier = tally.filter(t => t.producing === max).sort((a, b) => a.downtime - b.downtime || a.id.localeCompare(b.id));
    const maxReadings = Math.max(...tier.map(t => t.readings));
    const below = tally.filter(t => t.producing === max - 1).length;
    const areaOf = new Map<string, string>(d.areas.map(a => [String(a.area_id), String(a.name ?? a.area_id)]));
    lines.push('What I can offer is a labelled proxy, not oil volume: producing weeks in the period, meaning inspection readings (about one per week) on which wellhead minus ambient meets the well type\'s manual threshold (T200 ' + (T.threshold(d, { metadata: { well_type: 'T200' } } as any) ?? 'n/a') + ' C, T350 ' + (T.threshold(d, { metadata: { well_type: 'T350' } } as any) ?? 'n/a') + ' C, T500 ' + (T.threshold(d, { metadata: { well_type: 'T500' } } as any) ?? 'n/a') + ' C above ambient; the type in force on each reading date is used). The maximum is ' + max + ' producing readings' + (maxReadings === max ? ' out of ' + maxReadings : '') + ', and ' + tier.length + ' wells tie at that maximum' + (below ? '; another ' + below + ' wells have ' + (max - 1) : '') + '. The proxy cannot rank them, and a higher-capacity well type may produce more oil than a smaller one with the same uptime.');
    lines.push('Tied wells, listed by least repair downtime in the period as a secondary proxy (still not oil volume): ' + tier.slice(0, 10).map(t => t.id + ' (' + t.type + ', ' + (areaOf.get(t.area) ?? t.area) + ', ' + t.producing + '/' + t.readings + ' readings, ' + t.downtime + ' h downtime)').join('; ') + (tier.length > 10 ? '; and ' + (tier.length - 10) + ' more.' : '.'));
    lines.push('To answer properly the data would need production volumes per well (allocated or metered oil barrels, tank gauge or SCADA flow-rate history) for the period.');
    visualization = { type: 'table', title: 'Producing-weeks proxy, tied top wells (not oil volume)', columns: ['Well', 'Type', 'Area', 'Producing readings', 'Readings', 'Downtime h (secondary)'], rows: tier.slice(0, 25).map(t => [t.id, t.type, areaOf.get(t.area) ?? t.area, t.producing, t.readings, t.downtime]) };
    for (const t of tier.slice(0, 10)) wellIds.push(t.id);
    for (const t of Object.keys(d.manuals)) { const c = T.citation(d.manuals[t], undefined, /at least\s+\*?\*?\d+/i); if (c) citations.push(c); }
    for (const t of tier.slice(0, 5)) { const c = T.cite(d, t.id, 'well'); if (c) citations.push(c); }
  } else {
    const hits = d.documents.filter(x => spec.text.test(x.content) && x.type !== 'manual');
    const manualHits = Object.values(d.manuals).filter(m => spec.text.test(m.content));
    lines.push('The data cannot answer this. It contains no flow-rate measurements (barrels or volume per day, meter or SCADA readings) for any well.');
    lines.push('What I scanned: field names in inspection, repair, note, regulatory and metadata records (' + allFields.length + ' field names in all). Flow-like fields found: ' + (real.length ? real.map(m => m.field + ' (' + m.source + ')').join(', ') : 'none') + '. Documents that mention a flow-rate style term: ' + hits.length + ' record/report documents' + (manualHits.length ? ' and manuals ' + manualHits.map(m => m.id).join(', ') : '') + (hits.length ? ' (for example ' + hits.slice(0, 3).map(h => h.id).join(', ') + '), which need checking before use' : '') + '.');
    lines.push('Available instead, clearly labelled as different quantities: wellhead and ambient temperature per inspection and the derived producing status, spill volume estimates (crude spilled, not produced), and repair downtime hours.');
    lines.push('To answer, the data would need flow or production-rate readings (barrels per day or meter totals) per well with timestamps and units.');
    for (const h of hits.slice(0, 3)) { const c = T.citation(h, undefined, spec.text); if (c) citations.push(c); }
  }

  const unique = new Map<string, Citation>();
  for (const c of citations.filter(Boolean)) unique.set(c.type + ':' + c.id, c);
  return T.answer(lines.join('\n'), visualization, [...unique.values()].slice(0, 150), [], [...new Set(wellIds)].slice(0, 150));
}
