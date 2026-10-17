import { toolkit, type Answer, type CopilotState, type Citation } from '../engine';
import type { Dataset, WellData } from '../data';
import type { QueryPlan } from '../plan';
import { readFileSync } from 'node:fs';
import path from 'node:path';

type Team = { team_id: string; name: string; lead_user_id?: string; source?: string };

// Teams (name + lead) live in fleet/areas.json under "teams"; the loaded Dataset only keeps the areas array,
// so read them from the dataset roots, falling back to users (production_supervisor) and area names.
function loadTeams(d: Dataset): { teams: Team[]; files: { root: string; rel: string }[] } {
  const teams = new Map<string, Team>(), files: { root: string; rel: string }[] = [];
  const injected = (d as any).teams;
  if (Array.isArray(injected)) for (const t of injected) if (t?.team_id) teams.set(t.team_id, { ...t, name: t.name ?? t.team_id });
  for (const root of d.roots ?? []) {
    try {
      const raw = JSON.parse(readFileSync(path.join(root, 'fleet', 'areas.json'), 'utf8').replace(/^﻿/, ''));
      if (Array.isArray(raw.teams)) { files.push({ root, rel: 'fleet/areas.json' }); for (const t of raw.teams) if (t?.team_id) teams.set(t.team_id, { team_id: t.team_id, name: t.name ?? t.team_id, lead_user_id: t.lead_user_id, source: path.join(path.basename(root), 'fleet/areas.json').split(path.sep).join('/') }); }
    } catch { /* fall back below */ }
  }
  const ids = new Set<string>([...d.users.map(u => u.team_id), ...d.areas.map(a => a.team_id), ...d.wells.flatMap(w => [w.metadata.team_id, ...(w.metadata.team_history ?? []).map((h: any) => h.team_id)])].filter(Boolean));
  for (const id of ids) {
    if (teams.has(id)) continue;
    const area = d.areas.find(a => a.team_id === id);
    const lead = d.users.find(u => u.team_id === id && /supervisor|lead/i.test(String(u.role)));
    teams.set(id, { team_id: id, name: area ? String(area.name).split(/\s+Block\b/i)[0] + ' Production' : id, lead_user_id: lead?.user_id });
  }
  return { teams: [...teams.values()], files };
}

function teamOn(d: Dataset, w: WellData, date: string): string | undefined {
  const hist = (Array.isArray(w.metadata.team_history) ? w.metadata.team_history : []).find((h: any) => h?.team_id && String(h.from ?? '0000') <= date && (!h.to || String(h.to) >= date));
  if (hist) return hist.team_id;
  return w.metadata.team_id ?? d.areas.find(a => a.area_id === w.metadata.area_id)?.team_id;
}
const retired = (w: WellData, date: string) => (/plugged|abandon/i.test(String(w.metadata.status ?? '')) || /plugged|abandon/i.test(String(w.metadata.recorded_status ?? ''))) && (!w.metadata.decommissioned_on || String(w.metadata.decommissioned_on) <= date);
const GENERIC = new Set(['production', 'team', 'field', 'the', 'and', 'health', 'safety', 'environment', 'maintenance']);

export function teamInfo(d: Dataset, s: CopilotState, userId: string, q: string, p: QueryPlan): Answer {
  const T = toolkit, today = T.today(d), lower = q.toLowerCase();
  const { teams, files } = loadTeams(d);
  const areaName = (id: string) => d.areas.find(a => a.area_id === id)?.name ?? id;

  // 1. Which team(s)? Full name or id in the question, then distinctive name words, then area / well in the plan, then "my team".
  let picked = teams.filter(t => lower.includes(t.name.toLowerCase()) || new RegExp('\\b' + t.team_id.toLowerCase() + '\\b').test(lower));
  if (!picked.length) picked = teams.filter(t => t.name.toLowerCase().split(/[^a-z]+/).some(wd => wd.length > 3 && !GENERIC.has(wd) && new RegExp('\\b' + wd + '\\b').test(lower)));
  if (!picked.length && p.areaId) { const tid = d.areas.find(a => a.area_id === p.areaId)?.team_id; picked = teams.filter(t => t.team_id === tid); }
  if (!picked.length) { const areaQ = d.areas.find(a => lower.includes(String(a.name).toLowerCase())); if (areaQ) picked = teams.filter(t => t.team_id === areaQ.team_id); }
  if (!picked.length && /\bmy\s+team\b|\bour\s+team\b/.test(lower)) { const tid = d.users.find(u => u.user_id === userId)?.team_id; picked = teams.filter(t => t.team_id === tid); }
  if (!picked.length) { const lead = d.users.find(u => lower.includes(String(u.name).toLowerCase())); if (lead) picked = teams.filter(t => t.lead_user_id === lead.user_id || t.team_id === lead.team_id); }
  const listAll = !picked.length;
  if (listAll) picked = teams.filter(t => d.wells.some(w => teamOn(d, w, today) === t.team_id));

  const rows: any[][] = [], citations: (Citation | undefined)[] = [], wellIds: string[] = [], conflicts: string[] = [], sentences: string[] = [];
  for (const root of new Set(files.map(f => f.root))) citations.push(T.citation(undefined, { id: 'teams-' + path.basename(root), title: 'Teams and leads (fleet/areas.json)', type: 'fleet', path: path.join(path.basename(root), 'fleet/areas.json').split(path.sep).join('/'), excerpt: teams.map(t => t.team_id + ' ' + t.name + ' lead ' + (t.lead_user_id ?? 'unknown')).join('; ') }));
  for (const t of picked) {
    const all = d.wells.filter(w => teamOn(d, w, today) === t.team_id);
    const live = all.filter(w => !retired(w, today)), closed = all.filter(w => retired(w, today));
    const leadUser = d.users.find(u => u.user_id === t.lead_user_id);
    const areaCounts = new Map<string, number>();
    for (const w of live) areaCounts.set(areaName(w.metadata.area_id), (areaCounts.get(areaName(w.metadata.area_id)) ?? 0) + 1);
    const areas = [...areaCounts.entries()].sort((a, b) => b[1] - a[1]).map(([a, n]) => areaCounts.size > 1 ? a + ' (' + n + ')' : a).join(', ') || 'none';
    const leadName = leadUser ? leadUser.name + (leadUser.role ? ' (' + String(leadUser.role).replace(/_/g, ' ') + ')' : '') : (t.lead_user_id ?? 'No lead recorded');
    rows.push([t.name + ' (' + t.team_id + ')', leadName, live.length, areas]);
    const moved = live.filter(w => Array.isArray(w.metadata.team_history) && w.metadata.team_history.length).length;
    sentences.push((leadUser?.name ?? 'No lead is recorded') + ' leads ' + t.name + ' (' + t.team_id + '), which runs ' + live.length + ' wells today (' + T.dateLabel(today) + ')' + (live.length ? ', in ' + areas : '') + '.'
      + (closed.length ? ' ' + closed.length + ' plugged-and-abandoned well' + (closed.length === 1 ? ' is' : 's are') + ' excluded (' + closed.map(w => w.metadata.asset_id).join(', ') + ').' : ' None of its wells is plugged or abandoned, so none are excluded.')
      + ' Counted by each well’s own team_id and team_history as of today' + (moved ? ' (' + moved + ' of them changed team through team_history)' : '') + ', not by area.');
    if (live.length) { wellIds.push(...live.slice(0, 5).map(w => w.metadata.asset_id)); }
    if (leadUser) citations.push(T.citation(undefined, { id: leadUser.user_id, title: 'User · ' + leadUser.name, type: 'fleet', path: (d.roots[0] ? path.basename(d.roots[0]) + '/' : '') + 'fleet/users.json', excerpt: leadUser.name + ' · ' + leadUser.role + ' · ' + leadUser.team_id }));
    for (const w of closed.slice(0, 10)) citations.push(T.cite(d, w.metadata.asset_id, 'well'));
    for (const w of live.slice(0, 3)) citations.push(T.cite(d, w.metadata.asset_id, 'well'));
    // Wells sitting in the team's areas but run by a different team (so area counts do not match).
    const foreign = d.wells.filter(w => !retired(w, today) && teamOn(d, w, today) !== t.team_id && areaCounts.has(areaName(w.metadata.area_id)));
    if (foreign.length) conflicts.push(t.name + ': ' + foreign.length + ' well' + (foreign.length === 1 ? '' : 's') + ' in the same area' + (areaCounts.size > 1 ? 's' : '') + ' (e.g. ' + foreign.slice(0, 3).map(w => w.metadata.asset_id).join(', ') + ') are run by another team today and are not counted.');
  }
  if (listAll) sentences.unshift('No single team was named, so here are all teams that run wells today.');
  return T.answer(sentences.join(' '), { type: 'table', title: 'Team lead and wells run today', columns: ['Team', 'Lead', 'Wells', 'Areas'], rows }, citations.filter(Boolean).slice(0, 150), conflicts, wellIds);
}
