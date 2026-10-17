import { toolkit, type Answer, type Citation, type CopilotState } from '../engine';
import type { Dataset, WellData } from '../data';
import type { QueryPlan } from '../plan';

type Reading = { area: string; type: string; month: string; head: number; air: number; delta: number; producing: boolean | undefined };

const mean = (v: number[]) => v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
const f = (v: number, d = 2) => Number.isFinite(v) ? v.toFixed(d) : 'n/a';
const sgn = (v: number, d = 2) => Number.isFinite(v) ? (v >= 0 ? '+' : '') + v.toFixed(d) : 'n/a';

/** Well type in force on a given date (type_history), falling back to the current type. */
export function typeOn(w: WellData, date: string): string {
  const history = Array.isArray(w.metadata.type_history) ? w.metadata.type_history : [];
  for (const h of history) if (h?.well_type && (!h.from || date >= h.from) && (!h.to || date <= h.to)) return String(h.well_type);
  return String(w.metadata.well_type);
}

/** Apply data_correction operator notes (field, corrected_value) to an inspection, then let the engine apply shared corrections. */
function patched(d: Dataset, w: WellData, raw: Record<string, any>) {
  const today = toolkit.today(d);
  let out = raw;
  for (const n of w.context) {
    if (n.note_type !== 'data_correction' || n.inspection_id !== raw.inspection_id || typeof n.corrected_value !== 'number') continue;
    if (n.field !== 'wellhead_temp_c' && n.field !== 'ambient_temp_c') continue;
    if (n.valid_from && String(n.valid_from) > today) continue;
    out = { ...out, [n.field]: n.corrected_value };
  }
  return out;
}

export function regionTemperature(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  const T = toolkit;
  const today = T.today(d);
  const ranged = p.year !== undefined || !!p.from || !!p.to;
  const range = ranged ? T.rangeFor(d, q, p) : { from: '0000-01-01', to: today };
  const areaName = new Map<string, string>(d.areas.map(a => [String(a.area_id), String(a.name ?? a.area_id)]));
  const areaOrder = d.areas.map(a => String(a.area_id));

  // Per well + type cached "well view" so the engine's production rule (manual threshold for that type) applies per reading.
  const readings: Reading[] = [];
  const wellCount = new Map<string, number>(), t500Wells = new Map<string, number>(), typeWells = new Map<string, Map<string, number>>();
  for (const w of d.wells) {
    const area = String(w.metadata.area_id), current = String(w.metadata.well_type);
    wellCount.set(area, (wellCount.get(area) ?? 0) + 1);
    if (!typeWells.has(area)) typeWells.set(area, new Map());
    typeWells.get(area)!.set(current, (typeWells.get(area)!.get(current) ?? 0) + 1);
    const views = new Map<string, WellData>();
    for (const raw of w.inspections) {
      const day = T.day(raw.inspected_at);
      if (day > today || !T.inRange(raw.inspected_at, range)) continue;
      const type = typeOn(w, day);
      let view = views.get(type);
      if (!view) { view = { ...w, metadata: { ...w.metadata, well_type: type } }; views.set(type, view); }
      const status = T.production(d, s, view, patched(d, w, raw));
      const head = status.item.wellhead_temp_c, air = status.item.ambient_temp_c;
      if (typeof head !== 'number' || typeof air !== 'number' || !Number.isFinite(head) || !Number.isFinite(air)) continue;
      readings.push({ area, type, month: day.slice(0, 7), head, air, delta: head - air, producing: status.producing });
    }
  }
  if (!readings.length) return T.answer('No usable wellhead and ambient temperature readings were found for the requested period.', undefined, [], [], []);

  const areas = [...new Set(readings.map(r => r.area))].sort((x, y) => (areaOrder.indexOf(x) + 1 || 99) - (areaOrder.indexOf(y) + 1 || 99) || x.localeCompare(y));
  const types = [...new Set(readings.map(r => r.type))].sort();
  // Field mean of wellhead - ambient per type, producing readings only (the quantity the manuals judge production by).
  const typeMean = new Map<string, number>();
  for (const t of types) typeMean.set(t, mean(readings.filter(r => r.type === t && r.producing === true).map(r => r.delta)));
  const adjusted = (r: Reading) => r.delta - (typeMean.get(r.type) ?? NaN);

  type Row = { id: string; wells: number; t500: number; t500Share: number; readShareT500: number; head: number; air: number; delta: number; adj: number };
  const topType = types.includes('T500') ? 'T500' : types.at(-1)!;
  const rows: Row[] = areas.map(id => {
    const mine = readings.filter(r => r.area === id), prod = mine.filter(r => r.producing === true);
    const wells = wellCount.get(id) ?? 0, t500 = typeWells.get(id)?.get(topType) ?? 0;
    return { id, wells, t500, t500Share: wells ? t500 / wells : 0, readShareT500: mine.length ? mine.filter(r => r.type === topType).length / mine.length : 0, head: mean(mine.map(r => r.head)), air: mean(mine.map(r => r.air)), delta: mean(prod.map(r => r.delta)), adj: mean(prod.map(adjusted)) };
  });
  const label = (id: string) => (areaName.get(id) ?? id) + ' (' + id + ')';

  // Area x type matrix of mean (wellhead - ambient), producing readings.
  const matrix = areas.map(id => ({ id, cells: types.map(t => { const x = readings.filter(r => r.area === id && r.type === t && r.producing === true); return { n: x.length, wells: typeWells.get(id)?.get(t) ?? 0, v: mean(x.map(r => r.delta)) }; }) }));

  // Spread statistics for the verdict.
  const spread = (v: number[]) => Math.max(...v) - Math.min(...v);
  const rawSpread = spread(rows.map(r => r.head)), airSpread = spread(rows.map(r => r.air)), adjSpread = spread(rows.map(r => r.adj).filter(Number.isFinite));
  const rawRank = [...rows].sort((x, y) => y.head - x.head), adjRank = [...rows].sort((x, y) => y.adj - x.adj);
  // Spearman correlation between raw wellhead rank and share of top-type wells.
  const rank = (arr: number[]) => arr.map(v => arr.filter(o => o > v).length + 1);
  const rr = rank(rows.map(r => r.head)), rs = rank(rows.map(r => r.t500Share));
  const meanR = mean(rr), meanS = mean(rs);
  const num = rr.reduce((a, v, i) => a + (v - meanR) * (rs[i] - meanS), 0), den = Math.sqrt(rr.reduce((a, v) => a + (v - meanR) ** 2, 0) * rs.reduce((a, v) => a + (v - meanS) ** 2, 0));
  const spearman = den ? num / den : NaN;

  // Consistency over time: which area leads each month.
  const months = [...new Set(readings.map(r => r.month))].sort();
  const rawLead = new Map<string, number>(), adjLead = new Map<string, number>();
  for (const m of months) {
    const inMonth = readings.filter(r => r.month === m);
    const rawBy = areas.map(a => ({ a, v: mean(inMonth.filter(r => r.area === a).map(r => r.head)) })).filter(x => Number.isFinite(x.v));
    const adjBy = areas.map(a => ({ a, v: mean(inMonth.filter(r => r.area === a && r.producing === true).map(adjusted)) })).filter(x => Number.isFinite(x.v));
    if (rawBy.length) { const top = rawBy.sort((x, y) => y.v - x.v)[0].a; rawLead.set(top, (rawLead.get(top) ?? 0) + 1); }
    if (adjBy.length) { const top = adjBy.sort((x, y) => y.v - x.v)[0].a; adjLead.set(top, (adjLead.get(top) ?? 0) + 1); }
  }
  const leadText = (m: Map<string, number>) => [...m.entries()].sort((x, y) => y[1] - x[1]).map(([a, n]) => a + ' ' + n).join(', ');
  const rawTop = [...rawLead.entries()].sort((x, y) => y[1] - x[1])[0];

  const typeMixEffect = rawSpread >= 1.5 && airSpread < 0.5 && adjSpread < 0.5;
  const realEffect = adjSpread >= 1;
  const period = ranged ? range.from + ' to ' + range.to : 'all inspections to ' + today;
  const lines: string[] = [];
  if (typeMixEffect) {
    lines.push('No region genuinely runs hotter. On raw wellhead temperature ' + label(rawRank[0].id) + ' ranks first, then ' + rawRank.slice(1, 3).map(r => r.id).join(' and ') + ' (mean ' + f(rawRank[0].head, 1) + ' C vs ' + f(rawRank.at(-1)!.head, 1) + ' C for ' + rawRank.at(-1)!.id + ', a ' + f(rawSpread, 1) + ' C gap), but that is a well-type mix effect, not a regional one.');
    lines.push('1. Ambient air is flat across areas: area means span only ' + f(airSpread, 2) + ' C (' + f(Math.min(...rows.map(r => r.air)), 2) + ' to ' + f(Math.max(...rows.map(r => r.air)), 2) + ' C), so location does not change the weather in this data.');
    lines.push('2. Wellhead temperature is driven by well type: producing wells run ' + types.map(t => t + ' ' + f(typeMean.get(t)!, 1) + ' C').join(', ') + ' above ambient (mean wellhead minus ambient). The raw ranking follows the ' + topType + ' share of wells (rank correlation ' + f(spearman, 2) + '): ' + rawRank.map(r => r.id + ' ' + Math.round(r.t500Share * 100) + '%').join(', ') + '.');
    lines.push('3. Compared like with like (wellhead minus ambient within well type, producing readings), the areas differ by at most ' + f(adjSpread, 2) + ' C: type-adjusted delta ' + rows.map(r => r.id + ' ' + sgn(r.adj)).join(', ') + '. That is noise.');
  } else if (realEffect) {
    lines.push('After removing ambient and well-type effects, ' + label(adjRank[0].id) + ' runs warmest (type-adjusted wellhead minus ambient ' + sgn(adjRank[0].adj) + ' C vs ' + sgn(adjRank.at(-1)!.adj) + ' C for ' + adjRank.at(-1)!.id + '), a spread of ' + f(adjSpread, 2) + ' C, so there is a regional difference beyond well-type mix. Raw wellhead temperature spreads ' + f(rawSpread, 1) + ' C and ambient ' + f(airSpread, 2) + ' C across areas.');
  } else {
    lines.push('No region clearly runs hotter. Raw wellhead temperature spreads ' + f(rawSpread, 1) + ' C across areas, ambient ' + f(airSpread, 2) + ' C, and the type-adjusted wellhead-minus-ambient only ' + f(adjSpread, 2) + ' C; raw leader ' + label(rawRank[0].id) + '.');
  }
  if (months.length > 3) lines.push('Consistency over ' + months.length + ' months: highest raw mean wellhead was ' + (rawTop ? rawTop[0] + ' in ' + rawTop[1] + ' of ' + months.length + ' months' : 'n/a') + ' (' + leadText(rawLead) + '); after the type adjustment the monthly leader is ' + (typeMixEffect || !realEffect ? 'scattered' : 'less consistent') + ' (' + leadText(adjLead) + ').');
  lines.push('"Hotter" is judged as wellhead minus ambient within well type, the quantity the manuals use for producing status (' + types.map(t => t + ' needs ' + (T.threshold(d, { metadata: { well_type: t } } as any) ?? 'n/a') + ' C').join(', ') + '), not absolute wellhead temperature. Period: ' + period + '; ' + readings.length.toLocaleString('en-US') + ' readings, well type taken from type history on the reading date, data corrections applied.');
  lines.push('Table (area; wells; % ' + topType + ' wells; mean wellhead C; mean ambient C; mean delta = wellhead minus ambient on producing readings C; type-adjusted delta C):');
  for (const r of rows) lines.push('- ' + label(r.id) + ': ' + r.wells + ' wells; ' + Math.round(r.t500Share * 100) + '% ' + topType + '; wellhead ' + f(r.head) + '; ambient ' + f(r.air) + '; delta ' + f(r.delta) + '; type-adjusted ' + sgn(r.adj));
  lines.push('Wellhead minus ambient by area and well type (producing readings, C):');
  for (const m of matrix) lines.push('- ' + m.id + ': ' + types.map((t, i) => t + ' ' + (m.cells[i].n ? f(m.cells[i].v) + (m.cells[i].wells <= 1 ? ' (' + m.cells[i].wells + ' well)' : '') : 'no wells')).join('; '));

  const columns = ['Area', 'Wells', '% ' + topType, 'Mean wellhead C', 'Mean ambient C', 'Mean delta C', 'Type-adjusted delta C'];
  const tableRows = rows.map(r => [label(r.id), r.wells, Math.round(r.t500Share * 100), +f(r.head), +f(r.air), +f(r.delta), +f(r.adj)]);
  const visualization = { type: 'table', title: 'Wellhead temperature by area: raw, ambient and type-adjusted', columns, rows: tableRows };

  const citations: Citation[] = [];
  for (const t of types) { const c = T.citation(d.manuals[t], undefined, /at least\s+\*?\*?\d+/i); if (c) citations.push(c); }
  const corrNotes = d.wells.flatMap(w => w.context.filter(n => n.note_type === 'data_correction' && typeof n.corrected_value === 'number').map(n => T.cite(d, n.note_id, 'note')));
  for (const c of corrNotes.slice(0, 20)) if (c) citations.push(c);
  return T.answer(lines.join('\n'), visualization, citations, [], []);
}
