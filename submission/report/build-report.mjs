#!/usr/bin/env node
// Reproducible generator: submission/FINAL_REPORT.md -> report.html -> FINAL_REPORT.pdf (A4, 3 pages)
//   node submission/report/build-report.mjs [--png]
// The markdown is the single source of truth. Every number on the scorecard is derived from it.
// Needs: playwright-core + a Chromium/Chrome (CHROME_PATH env var overrides auto-detection).

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'FINAL_REPORT.md');
const OUT_HTML = path.join(HERE, 'report.html');
const OUT_PDF = path.join(HERE, 'FINAL_REPORT.pdf');
const WANT_PNG = process.argv.includes('--png');
const MAX_PAGES = 3;

// Product screenshot used as the "inside the product" figure (optional; skipped if missing).
const FIGURE_CANDIDATES = [
  path.join(HERE, 'assets', 'conflict-card.png'),
  path.resolve(HERE, '../../../pitch-video/assets/ui/12-conflict-card.png'),
];

/* ------------------------------------------------------------------ markdown */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const ID_RE = new RegExp(
  [
    String.raw`\b(?:WELL|MOC|CTX|OPS|INS|MNT|OM)-[A-Z0-9]+(?:-[A-Z0-9]+)*\b`,
    String.raw`\bSR-\d+(?:/\d+)*`,
    String.raw`\bT[2-5]00\b`,
    String.raw`\b0\d{3}\b`,
  ].join('|'),
  'g',
);

function decorate(html) {
  return html
    .split(/(<[^>]+>)/)
    .map((part) => (part.startsWith('<') ? part : part.replace(ID_RE, (m) => `<span class="id">${m}</span>`)))
    .join('');
}

function inline(src) {
  const stash = [];
  let s = src.replace(/`([^`]+)`/g, (_, c) => {
    stash.push(c);
    return `\u0000${stash.length - 1}\u0000`;
  });
  s = esc(s);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*]+?)\*(?![*\w])/g, '$1<em>$2</em>');
  s = decorate(s);
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(stash[+i])}</code>`);
}

const plain = (s) => s.replace(/\*\*/g, '').replace(/`/g, '').replace(/(^|\s)\*([^*]+)\*/g, '$1$2');

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function parseList(lines, i) {
  // returns { node, next }. Handles nesting by indentation and indented continuation paragraphs.
  const itemRe = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
  const first = itemRe.exec(lines[i]);
  const baseIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const items = [];
  while (i < lines.length) {
    const m = itemRe.exec(lines[i]);
    if (m && m[1].length === baseIndent) {
      items.push({ text: m[3], children: [], extra: [] });
      i++;
      continue;
    }
    if (m && m[1].length > baseIndent && items.length) {
      const sub = parseList(lines, i);
      items[items.length - 1].children.push(sub.node);
      i = sub.next;
      continue;
    }
    if (lines[i].trim() === '') {
      // blank line: continue only if next non-blank line is indented (belongs to the list)
      let j = i;
      while (j < lines.length && lines[j].trim() === '') j++;
      if (j < lines.length && /^\s{2,}\S/.test(lines[j]) && items.length) {
        i = j;
        const t = lines[i].trim();
        if (!itemRe.test(lines[i])) {
          items[items.length - 1].extra.push(t);
          i++;
        }
        continue;
      }
      break;
    }
    if (/^\s{2,}\S/.test(lines[i]) && items.length) {
      items[items.length - 1].extra.push(lines[i].trim());
      i++;
      continue;
    }
    break;
  }
  return { node: { type: 'list', ordered, items }, next: i };
}

function parseMarkdown(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    if (/^<div[^>]*page-break[^>]*>\s*<\/div>\s*$/i.test(line.trim())) { blocks.push({ type: 'pagebreak' }); i++; continue; }
    let m;
    if ((m = /^(#{1,6})\s+(.*)$/.exec(line))) { blocks.push({ type: 'h', level: m[1].length, text: m[2] }); i++; continue; }
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
      blocks.push({ type: 'table', head, rows });
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const { node, next } = parseList(lines, i);
      blocks.push(node);
      i = next;
      continue;
    }
    // paragraph: gather until blank line / block start
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|\||\s*([-*]|\d+\.)\s|<div)/.test(lines[i])) { buf.push(lines[i]); i++; }
    blocks.push({ type: 'p', text: buf.join(' ') });
  }
  return blocks;
}

function renderList(node) {
  const tag = node.ordered ? 'ol' : 'ul';
  const lis = node.items
    .map((it) => {
      const extra = it.extra.map((t) => `<p class="li-extra">${inline(t)}</p>`).join('');
      const kids = it.children.map(renderList).join('');
      return `<li><div class="li-body">${inline(it.text)}</div>${kids}${extra}</li>`;
    })
    .join('');
  return `<${tag}>${lis}</${tag}>`;
}

/* ------------------------------------------------------------------ model */

function buildModel(md) {
  const blocks = parseMarkdown(md);
  const h1 = blocks.find((b) => b.type === 'h' && b.level === 1);
  const title = h1 ? h1.text.replace(/:.*$/, '').trim() : 'Asset Intelligence Copilot';
  const subtitleOfTitle = h1 && h1.text.includes(':') ? h1.text.split(':').slice(1).join(':').trim() : 'Final Report';

  // sections split by H2
  const sections = [];
  let cur = null;
  let byline = null;
  for (const b of blocks) {
    if (b.type === 'h' && b.level === 2) { cur = { title: b.text, blocks: [] }; sections.push(cur); continue; }
    if (b.type === 'h' && b.level === 1) continue;
    if (!cur) { if (b.type === 'p' && !byline) byline = b.text; continue; }
    if (b.type !== 'pagebreak') cur.blocks.push(b);
  }
  const A = sections[0] || { title: '', blocks: [] };
  const B = sections[1] || { title: '', blocks: [] };

  // byline -> author / event / date / repo / answers file
  const bl = byline || '';
  const blPlain = plain(bl);
  const parts = blPlain.split(' · ').map((s) => s.trim());
  const author = parts[0] || '';
  const event = parts[1] || '';
  const date = (parts[2] || '').replace(/\s*Code:.*$/, '');
  const repoMatch = /(github\.com\/[^\s)]+)/.exec(blPlain);
  const repo = repoMatch ? repoMatch[1] : '';
  const license = /\((MIT[^)]*)\)/.exec(blPlain)?.[1] || '';
  const answersFile = /`([^`]+)`/.exec(bl)?.[1] || '';

  // Section A
  const pA = A.blocks.filter((b) => b.type === 'p');
  const tableA = A.blocks.find((b) => b.type === 'table');
  const lead = (re) => pA.find((p) => re.test(p.text));
  const core = lead(/^\*\*Core idea/i);
  const flow = lead(/^\*\*Request flow/i);
  const strip = pA.filter((p) => /^\*\*(Models|Verification|Next steps)/i.test(p.text));
  const knownA = new Set([core, flow, ...strip]);
  const otherA = pA.filter((p) => !knownA.has(p));
  const tagline = /Core idea:\s*(.+?)\.?\*\*/i.exec(core?.text || '')?.[1] || 'the model plans, code calculates';

  // Section B
  const pB = B.blocks.filter((b) => b.type === 'p');
  const tableB = B.blocks.find((b) => b.type === 'table');
  const intro = [];
  const tail = [];
  let afterTable = false;
  const callouts = []; // {label, node}
  for (let k = 0; k < B.blocks.length; k++) {
    const b = B.blocks[k];
    if (b === tableB) { afterTable = true; continue; }
    if (!afterTable) { if (b.type === 'p') intro.push(b); continue; }
    if (b.type === 'p' && /^\*\*[^*]+\*\*$/.test(b.text.trim()) && B.blocks[k + 1]?.type === 'list') {
      callouts.push({ label: b.text.trim().replace(/\*\*/g, '').replace(/\.$/, ''), node: B.blocks[k + 1] });
      k++;
      continue;
    }
    if (b.type === 'p') tail.push(b);
  }

  // Results rows
  const rows = (tableB?.rows || []).map((r) => {
    const q = /^\*\*(\d+)\*\*\s*(.*)$/.exec(r[0]) || [null, '?', r[0]];
    const verdictRaw = r[2] || '';
    const pills = [];
    const re = /(✅|🟡)([^✅🟡]*)/gu;
    let m;
    while ((m = re.exec(verdictRaw))) pills.push({ kind: m[1] === '✅' ? 'ok' : 'partial', note: m[2].trim().replace(/[,;]\s*$/, '') });
    return { n: q[1], title: q[2], answer: r[1], verdictRaw, pills };
  });
  const total = rows.length;
  const correct = rows.filter((r) => r.pills.some((p) => p.kind === 'ok') && !r.pills.some((p) => p.kind === 'partial')).length;
  const partialRows = rows.filter((r) => r.pills.some((p) => p.kind === 'partial'));

  const introText = intro.map((p) => p.text).join(' ');
  const hostedM = /(\d+)\s+of\s+(\d+)\s+turns ran on the hosted/i.exec(introText);
  const hosted = hostedM ? +hostedM[1] : null;
  const turns = hostedM ? +hostedM[2] : null;
  const fallbackM = /(\d+)\s+on the deterministic fallback/i.exec(introText);
  const fallbackN = fallbackM ? +fallbackM[1] : hosted != null ? turns - hosted : null;
  const dsM = /([\d,]+)\s+wells,\s*(\d+)\s+areas,\s*([\d,]+)\s+evidence documents/i.exec(plain(tableA?.rows.map((r) => r[1]).join(' ') || ''));
  const wells = dsM?.[1] || '';
  const areas = dsM?.[2] || '';
  const records = dsM?.[3] || '149,877';
  const opsM = /1 of (\d+) operations/i.exec(plain(tableA?.rows.map((r) => r[1]).join(' ') || ''));
  const ops = opsM?.[1] || '29';
  const coreOpsM = /(\d+) core/i.exec(plain(tableA?.rows.map((r) => r[1]).join(' ') || ''));
  const docOpsM = /(\d+) document-driven/i.exec(plain(tableA?.rows.map((r) => r[1]).join(' ') || ''));
  const firstRunM = /first live run scored\s+(\d+)\s*\/\s*(\d+)/i.exec(plain(B.blocks.map((b) => JSON.stringify(b)).join(' ')).replace(/\\"/g, '"'));
  const firstRun = firstRunM ? +firstRunM[1] : 0;

  return {
    title, subtitleOfTitle, tagline, author, event, date, repo, license, answersFile,
    A: { core, flow, strip, otherA, tableA },
    B: { title: B.title, intro, rows, callouts, tail, total, correct, partialRows },
    facts: { hosted, turns, fallbackN, wells, areas, records, ops, coreOps: coreOpsM?.[1] || '17', docOps: docOpsM?.[1] || '12', firstRun },
  };
}

/* ------------------------------------------------------------------ SVG diagram */

function diagram(f) {
  const bx = (x, y, w, h, title, sub, cls, extra = '') => `
    <g class="node ${cls}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>
      <text class="t" x="${x + w / 2}" y="${y + (sub ? h / 2 - 3 : h / 2 + 4)}" text-anchor="middle">${title}</text>
      ${sub ? `<text class="s" x="${x + w / 2}" y="${y + h / 2 + 11}" text-anchor="middle">${sub}</text>` : ''}
      ${extra}
    </g>`;
  const arrow = (d, cls = '') => `<path class="edge ${cls}" d="${d}" marker-end="url(#ah${cls ? '-' + cls.split(' ')[0] : ''})"/>`;
  const W = 104, H = 46, gap = 19.2, y0 = 34;
  const X = (i) => +(i * (W + gap)).toFixed(1);
  const rowA = [
    ['Users', 'user picker', 'plain'],
    ['React chat UI', 'visuals · source drawer', 'plain'],
    ['Express API', 'one request at a time', 'plain'],
    ['Planner', 'Gemini 3.5 Flash-Lite', 'llm'],
    ['Validator', 'typed · rule-checked', 'code'],
    ['Router', `1 of ${f.ops} operations`, 'code'],
  ];
  let g = '';
  rowA.forEach(([t, s, c], i) => {
    const chip = c === 'llm' ? `<rect class="chip-llm" x="${X(i) + W - 30}" y="${y0 - 6}" width="26" height="12" rx="6"/><text class="chip-t" x="${X(i) + W - 17}" y="${y0 + 3}" text-anchor="middle">LLM</text>` : '';
    g += bx(X(i), y0, W, H, t, s, c, chip);
  });
  for (let i = 0; i < 5; i++) g += arrow(`M${X(i) + W + 1} ${y0 + H / 2} H${X(i + 1) - 2}`);

  // dashed fallback arch Planner -> Validator
  const pc = X(3) + W / 2, vc = X(4) + W / 2, mid = (pc + vc) / 2;
  g += `<path class="edge dashed" d="M${pc} ${y0 - 7} V12 H${vc} V${y0 - 3}" marker-end="url(#ah-amber)"/>`;
  g += `<g><rect class="pill-fb" x="${mid - 112}" y="4" width="224" height="16" rx="8"/><text class="pill-fb-t" x="${mid}" y="15" text-anchor="middle">if the model fails: deterministic planner, flagged fallback</text></g>`;

  // router -> tools bus
  const rc = X(5) + W / 2;
  const TW = 152, tg = 10, tx0 = 720 - (3 * TW + 2 * tg);
  const ty = 108;
  const tools = [
    ['Domain tools', `${f.coreOps} core operations`],
    ['Document-driven tools', `${f.docOps} operations · rules from documents`],
    ['Document Q&amp;A', 'cited passages'],
  ];
  const tc = tools.map((_, i) => tx0 + i * (TW + tg) + TW / 2);
  g += `<path class="edge" d="M${rc} ${y0 + H + 1} V96 H${tc[0]}"/>`;
  tc.forEach((c) => { g += arrow(`M${c} 96 V${ty - 2}`); });
  tools.forEach(([t, s], i) => { g += bx(tx0 + i * (TW + tg), ty, TW, 42, t, s, 'code'); });

  // tools -> evidence + memory
  const EW = 232, ey = 184, eh = 48;
  const ex = tx0, mx = 720 - EW;
  const bus = 168;
  g += `<path class="edge" d="M${tc[0]} ${ty + 42 + 1} V${bus} H${tc[2]} M${tc[1]} ${ty + 43} V${bus} M${tc[2]} ${ty + 43} V${bus}"/>`;
  g += arrow(`M${ex + EW / 2} ${bus} V${ey - 2}`);
  g += arrow(`M${mx + EW / 2} ${bus} V${ey - 2}`);
  g += `
    <g class="node store">
      <rect x="${ex}" y="${ey}" width="${EW}" height="${eh}" rx="7"/>
      <text class="t" x="${ex + EW / 2}" y="${ey + 20}" text-anchor="middle">Evidence index</text>
      <text class="num" x="${ex + EW / 2}" y="${ey + 36}" text-anchor="middle">${f.records} records</text>
    </g>
    <g class="node store">
      <rect x="${mx}" y="${ey}" width="${EW}" height="${eh}" rx="7"/>
      <text class="t" x="${mx + EW / 2}" y="${ey + 20}" text-anchor="middle">Memory</text>
      <text class="s2" x="${mx + EW / 2}" y="${ey + 36}" text-anchor="middle">shared | private</text>
    </g>`;
  // answer (left, snake back)
  const aw = ex - 22;
  g += arrow(`M${ex - 1} ${ey + eh / 2 - 6} H${aw + 3}`, 'blue');
  g += `<path class="edge blue" d="M${mx + EW / 2} ${ey + eh + 1} V${ey + eh + 9} H${aw / 2} V${ey + eh + 2}" marker-end="url(#ah-blue)"/>`;
  g += `
    <g class="node answer">
      <rect x="0" y="${ey}" width="${aw}" height="${eh}" rx="7"/>
      <text class="t" x="${aw / 2}" y="${ey + 21}" text-anchor="middle">Answer</text>
      <text class="s" x="${aw / 2}" y="${ey + 36}" text-anchor="middle">text · visual · citations · conflicts</text>
    </g>`;

  g += `<text class="cap-a" x="0" y="10">ARCHITECTURE</text><text class="cap-b" x="0" y="22">solid = request path</text><text class="cap-b" x="0" y="32">dashed = fallback</text>`;
  // legend in the empty left area
  const ly = 92;
  g += `
    <g class="legend">
      <rect class="chip-llm" x="0" y="${ly}" width="30" height="13" rx="6.5"/><text class="chip-t" x="15" y="${ly + 9.2}" text-anchor="middle">LLM</text>
      <text class="lg-h" x="38" y="${ly + 10}">The model plans</text>
      <text class="lg-b" x="0" y="${ly + 25}">turns the question into one typed,</text>
      <text class="lg-b" x="0" y="${ly + 35}">validated operation.</text>
      <rect class="chip-code" x="0" y="${ly + 48}" width="30" height="13" rx="6.5"/><text class="chip-t" x="15" y="${ly + 57.2}" text-anchor="middle">CODE</text>
      <text class="lg-h" x="38" y="${ly + 58}">Code calculates</text>
      <text class="lg-b" x="0" y="${ly + 73}">every number, table, citation and</text>
      <text class="lg-b" x="0" y="${ly + 83}">conflict, traced to record IDs.</text>
    </g>`;

  const marker = (id, color) => `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="${color}"/></marker>`;
  return `<svg viewBox="0 0 720 248" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Architecture: Users, React UI, Express API, Planner, Validator, Router, tools, evidence index and memory, answer; dashed fallback path from Planner to Validator">
  <defs>${marker('ah', '#0A1222')}${marker('ah-blue', '#3D7BFF')}${marker('ah-amber', '#F2A33A')}</defs>
  ${g}
</svg>`;
}

/* ------------------------------------------------------------------ HTML */

function pill(p) {
  return `<span class="pill ${p.kind}"><i></i>${p.kind === 'ok' ? 'Correct' : 'Partial'}</span>${p.note ? `<span class="pill-note">${inline(p.note)}</span>` : ''}`;
}

function resultRow(r) {
  const verdict = r.pills.length
    ? r.pills.map((p) => `<div class="v">${pill(p)}</div>`).join('')
    : `<span class="pill-note">${esc(r.verdictRaw)}</span>`;
  const cls = r.pills.some((p) => p.kind === 'partial') ? 'row-partial' : 'row-ok';
  return `<tr class="${cls}">
    <td class="c-q"><span class="qb">${esc(r.n)}</span><span class="qt">${inline(r.title)}</span></td>
    <td class="c-a">${inline(r.answer)}</td>
    <td class="c-v">${verdict}</td>
  </tr>`;
}

function resultsTable(rows, cont) {
  if (!rows.length) return '';
  return `<table class="results${cont ? ' cont' : ''}">
    <thead><tr><th>Question</th><th>Copilot answer (key facts)</th><th>vs oracle</th></tr></thead>
    <tbody>${rows.map(resultRow).join('')}</tbody>
  </table>`;
}

function fontLinks() {
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;
}

const CSS = String.raw`
:root{
  --paper:#FBFCFE; --navy:#0A1222; --navy2:#121D36; --blue:#3D7BFF; --blue-ink:#2B5FD9; --blue-tint:#EEF3FF;
  --amber:#F2A33A; --amber-ink:#9A5F08; --amber-tint:#FEF4E2; --green:#3FBF8A; --green-ink:#1B7F59; --green-tint:#E8F7F0;
  --ink:#1A2236; --muted:#5A6580; --line:#E0E6F1; --card:#FFFFFF;
  --f-head:'Montserrat','Inter',system-ui,sans-serif; --f-body:'Inter','Montserrat',system-ui,sans-serif; --f-mono:'IBM Plex Mono',ui-monospace,Consolas,monospace;
}
@page{ size:A4; margin:0 }
*{ box-sizing:border-box; margin:0; padding:0 }
html,body{ background:var(--paper); -webkit-print-color-adjust:exact; print-color-adjust:exact }
body{ font-family:var(--f-body); color:var(--ink); font-size:9.5pt; line-height:1.5; font-feature-settings:'cv11','ss03'; text-rendering:geometricPrecision }
.page{ width:210mm; height:296.6mm; position:relative; overflow:hidden; background:var(--paper); break-after:page; page-break-after:always }
.page:last-child{ break-after:auto; page-break-after:auto }
.body{ position:absolute; left:0; right:0; top:0; bottom:0 }
.pad{ padding:0 13mm }
strong{ font-weight:650; color:var(--navy) }
code,.id{ font-family:var(--f-mono); font-size:.9em; font-feature-settings:'zero'; font-variant-numeric:tabular-nums }
.id{ color:var(--blue-ink); font-weight:500; white-space:nowrap }
code{ background:#EDF1F8; color:var(--navy2); padding:.05em .35em; border-radius:3px; font-size:.84em; white-space:nowrap }
em{ color:var(--muted) }

/* header band */
.band{ background:var(--navy); color:#fff; padding:7.5mm 13mm 6.5mm; position:relative; overflow:hidden }
.band::before{ content:''; position:absolute; inset:0; background-image:radial-gradient(circle at 1px 1px, rgba(120,160,255,.22) 1px, transparent 1.3px); background-size:4.2mm 4.2mm; -webkit-mask-image:linear-gradient(100deg, transparent 30%, #000 95%); mask-image:linear-gradient(100deg, transparent 30%, #000 95%) }
.band::after{ content:''; position:absolute; left:0; right:0; bottom:0; height:1.1mm; background:linear-gradient(90deg,var(--blue),#7FA8FF 60%, transparent) }
.band .row{ position:relative; display:flex; justify-content:space-between; align-items:flex-end; gap:8mm }
.band .row > div:first-child{ flex:1 }
.tagrow{ display:flex; justify-content:space-between; align-items:baseline; gap:6mm }
.krepo{ font-family:var(--f-mono); font-size:6.6pt; color:#8A9AB8; white-space:nowrap }
.kicker{ font-family:var(--f-mono); font-size:6.6pt; letter-spacing:.14em; text-transform:uppercase; color:#8FB0FF; margin-bottom:1.8mm }
.band h1{ white-space:nowrap; font-family:var(--f-head); font-weight:800; font-size:25pt; line-height:1.05; letter-spacing:-.015em }
.band .tag{ font-family:var(--f-head); font-weight:600; font-size:11.5pt; color:#6F9CFF; margin-top:1.4mm; letter-spacing:.01em }
.meta{ flex:none; text-align:right; font-family:var(--f-mono); font-size:6.6pt; line-height:1.65; color:#B7C3DA; white-space:nowrap }
.meta b{ color:#fff; font-weight:500; font-size:8pt }
.meta .lic{ color:#6F7F9E }

/* page 1 */
.lede{ margin:4mm 0 2.8mm; display:flex; gap:5mm; align-items:flex-start }
.lede .bar{ width:1.1mm; align-self:stretch; background:var(--blue); border-radius:1mm; flex:none }
.lede p{ font-size:9.1pt; line-height:1.48; color:var(--ink) }
.dia{ background:var(--card); border:.25mm solid var(--line); border-radius:3mm; padding:2.6mm 4.5mm 2.4mm; position:relative }
.dia .cap{ display:flex; justify-content:space-between; font-family:var(--f-mono); font-size:6.6pt; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-bottom:1.5mm }
.dia .cap b{ color:var(--blue-ink); font-weight:600 }
.dia svg{ width:100%; height:auto; display:block }
.dia .flow{ font-size:7.6pt; line-height:1.45; color:var(--muted); margin-top:1.6mm; padding-top:1.8mm; border-top:.2mm dashed var(--line) }
.dia .flow strong{ color:var(--ink); font-weight:600 }
svg .node rect{ fill:#fff; stroke:#C9D3E6; stroke-width:1 }
svg .node.plain rect{ fill:#F5F8FD }
svg .node .t{ font-family:var(--f-head); font-weight:700; font-size:10.4px; fill:#0A1222 }
svg .node .s{ font-family:var(--f-body); font-size:7.6px; fill:#5A6580 }
svg .node.llm rect{ fill:#EEF3FF; stroke:#3D7BFF; stroke-width:1.5 }
svg .node.code rect{ fill:#fff; stroke:#0A1222; stroke-width:1 }
svg .node.store rect{ fill:#0A1222; stroke:#0A1222 }
svg .node.store .t{ fill:#fff; font-size:10.4px }
svg .node .num{ font-family:var(--f-mono); font-weight:600; font-size:10px; fill:#7FA8FF }
svg .node .s2{ font-family:var(--f-mono); font-size:8.6px; fill:#B7C3DA }
svg .node.answer rect{ fill:#3D7BFF; stroke:#3D7BFF }
svg .node.answer .t{ fill:#fff; font-size:11.6px }
svg .node.answer .s{ fill:#EAF1FF; font-size:7.8px }
svg .edge{ fill:none; stroke:#0A1222; stroke-width:1.1 }
svg .edge.blue{ stroke:#3D7BFF; stroke-width:1.3 }
svg .edge.dashed{ stroke:#F2A33A; stroke-width:1.3; stroke-dasharray:3.5 2.6 }
svg .pill-fb{ fill:#FEF4E2; stroke:#F2A33A; stroke-width:.8 }
svg .pill-fb-t{ font-family:var(--f-body); font-weight:600; font-size:7.4px; fill:#8A5206 }
svg .node rect.chip-llm, svg rect.chip-llm{ fill:#3D7BFF; stroke:none } svg rect.chip-code{ fill:#0A1222; stroke:none }
svg .chip-t{ font-family:var(--f-mono); font-weight:600; font-size:6.8px; fill:#fff; letter-spacing:.06em }
svg .cap-a{ font-family:var(--f-mono); font-weight:600; font-size:7.4px; letter-spacing:.14em; fill:#2B5FD9 } svg .cap-b{ font-family:var(--f-mono); font-size:6.6px; fill:#5A6580 }
svg .lg-h{ font-family:var(--f-head); font-weight:700; font-size:9.4px; fill:#0A1222 }
svg .lg-b{ font-family:var(--f-body); font-size:7.7px; fill:#5A6580 }

.sec-h{ display:flex; align-items:center; gap:3mm; margin:3mm 0 1.8mm }
.sec-h h2{ font-family:var(--f-head); font-weight:800; font-size:11.5pt; letter-spacing:-.005em; color:var(--navy) }
.sec-h .rule{ flex:1; height:.25mm; background:var(--line) }
.sec-h .n{ font-family:var(--f-mono); font-size:7pt; color:var(--blue-ink); letter-spacing:.12em; text-transform:uppercase }
.cards{ column-count:3; column-gap:2.8mm; margin-bottom:2.4mm }
.card{ break-inside:avoid; background:var(--card); border:.25mm solid var(--line); border-radius:2.6mm; padding:2mm 2.6mm 2.1mm; margin-bottom:2.2mm; position:relative; font-size:7.9pt; line-height:1.42 }
.card .ct{ font-family:var(--f-head); font-weight:700; font-size:8.7pt; color:var(--navy); margin-bottom:1.1mm; display:flex; align-items:center; gap:2mm }
.card .ct::before{ content:''; width:2mm; height:2mm; border-radius:.6mm; background:var(--blue); flex:none }
.card .ct .ix{ margin-left:auto; font-family:var(--f-mono); font-weight:500; font-size:6.4pt; color:#9AA6BD; letter-spacing:.1em }
.card strong{ font-weight:600 }
.strip{ display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:4mm; margin-top:.6mm; padding-top:2.4mm; border-top:.4mm solid var(--navy) }
.strip .s{ font-size:7.6pt; line-height:1.42; color:var(--ink) }
.strip .s h3{ font-family:var(--f-head); font-weight:800; font-size:7.4pt; letter-spacing:.1em; text-transform:uppercase; color:var(--blue-ink); margin-bottom:1.1mm }

/* footer */
.foot{ position:absolute; left:13mm; right:13mm; bottom:6.5mm; display:flex; justify-content:space-between; align-items:center; font-family:var(--f-mono); font-size:6.6pt; color:#7A869F; letter-spacing:.03em; border-top:.2mm solid var(--line); padding-top:2mm }
.foot b{ color:var(--navy); font-weight:600 }
.foot .pg{ font-weight:600; color:var(--navy) }

/* pages 2-3 */
.mini{ background:var(--navy); color:#fff; padding:5.2mm 13mm 4.6mm; display:flex; justify-content:space-between; align-items:center; position:relative }
.mini::after{ content:''; position:absolute; left:0; right:0; bottom:0; height:.8mm; background:linear-gradient(90deg,var(--blue),#7FA8FF 55%, transparent) }
.mini .l{ font-family:var(--f-head); font-weight:800; font-size:9.6pt; letter-spacing:.005em }
.mini .l span{ color:#6F9CFF; font-weight:600; margin-left:2.5mm }
.mini .r{ font-family:var(--f-mono); font-size:6.8pt; letter-spacing:.12em; text-transform:uppercase; color:#8FB0FF }
.res-h{ margin:5.2mm 0 1.6mm; font-family:var(--f-head); font-weight:800; font-size:15pt; letter-spacing:-.01em; color:var(--navy); line-height:1.15 }
.res-h em{ font-style:normal; color:var(--blue-ink) }
.res-intro{ font-size:8.6pt; line-height:1.5; color:var(--muted); margin-bottom:3.4mm; max-width:170mm }
.res-intro strong{ color:var(--ink) }
.score{ display:grid; grid-template-columns:repeat(4,1fr); gap:2.6mm; margin-bottom:4mm }
.tile{ background:var(--card); border:.25mm solid var(--line); border-radius:2.8mm; padding:3mm 3.4mm 2.8mm; position:relative; overflow:hidden }
.tile::before{ content:''; position:absolute; left:0; top:0; bottom:0; width:1mm; background:var(--blue) }
.tile.t-ok::before{ background:var(--green) }
.tile .big{ font-family:var(--f-head); font-weight:800; font-size:21pt; line-height:1; letter-spacing:-.02em; color:var(--navy); font-variant-numeric:tabular-nums; white-space:nowrap }
.tile .big small{ font-size:11pt; font-weight:700; color:var(--muted); letter-spacing:0 }
.tile .big .arr{ color:var(--blue); padding:0 .06em }
.tile.t-ok .big .g{ color:var(--green-ink) }
.tile .lab{ font-family:var(--f-head); font-weight:700; font-size:7.4pt; color:var(--navy); margin-top:1.8mm; letter-spacing:.01em }
.tile .sub{ font-size:6.9pt; color:var(--muted); margin-top:.5mm; line-height:1.35 }
.tile .sub .am{ color:var(--amber-ink); font-weight:600 }

table.results{ width:100%; border-collapse:separate; border-spacing:0; font-size:8.5pt; line-height:1.45; background:var(--card); border:.25mm solid var(--line); border-radius:2.6mm; overflow:hidden }
table.results thead th{ background:var(--navy); color:#fff; text-align:left; font-family:var(--f-mono); font-weight:500; font-size:6.3pt; letter-spacing:.12em; text-transform:uppercase; padding:2mm 3mm }
table.results td{ padding:2.4mm 3mm; vertical-align:top; border-top:.2mm solid var(--line) }
table.results tbody tr:first-child td{ border-top:0 }
table.results tr{ break-inside:avoid; page-break-inside:avoid }
table.results tr:nth-child(even) td{ background:#F7F9FD }
.c-q{ width:31mm }
.c-v{ width:25mm }
.qb{ display:inline-flex; align-items:center; justify-content:center; min-width:5.6mm; height:5.6mm; padding:0 1.2mm; border-radius:1.6mm; background:var(--navy); color:#fff; font-family:var(--f-mono); font-weight:600; font-size:7.4pt; margin-right:1.8mm; vertical-align:top }
.qt{ display:inline-block; width:calc(100% - 8mm); font-family:var(--f-head); font-weight:700; font-size:7.8pt; line-height:1.3; color:var(--navy); padding-top:.2mm }
.c-a strong{ font-weight:600 }
.v{ margin-bottom:1.2mm }
.pill{ display:inline-flex; align-items:center; gap:1.2mm; padding:.55mm 2.2mm .55mm 1.7mm; border-radius:10mm; font-family:var(--f-head); font-weight:700; font-size:6.9pt; letter-spacing:.02em; white-space:nowrap }
.pill i{ width:1.7mm; height:1.7mm; border-radius:50%; display:block }
.pill.ok{ background:var(--green-tint); color:var(--green-ink) } .pill.ok i{ background:var(--green) }
.pill.partial{ background:var(--amber-tint); color:var(--amber-ink) } .pill.partial i{ background:var(--amber) }
.pill-note{ display:block; font-family:var(--f-mono); font-size:6.3pt; color:var(--muted); margin-top:.6mm; line-height:1.3; letter-spacing:0 }
.pill + .pill-note{ margin-top:.9mm }

.two{ display:grid; grid-template-columns:1fr 1fr; gap:4mm; margin-top:5mm; align-items:start }
.co{ background:var(--card); border:.25mm solid var(--line); border-radius:3mm; padding:3.6mm 4.2mm 3.4mm; position:relative; font-size:8.4pt; line-height:1.5; border-top:1mm solid var(--blue) }
.co.worked{ border-top-color:var(--green) }
.co.didnt{ border-top-color:var(--amber) }
.co h3{ font-family:var(--f-head); font-weight:800; font-size:10.4pt; color:var(--navy); margin-bottom:2mm; display:flex; align-items:center; gap:2mm }
.co h3 .ic{ width:4.4mm; height:4.4mm; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:7pt; color:#fff; flex:none }
.co.worked .ic{ background:var(--green) } .co.didnt .ic{ background:var(--amber) }
.co ul,.co ol{ padding-left:0; list-style:none; counter-reset:c }
.co li{ position:relative; padding-left:4.6mm; margin-bottom:1.8mm }
.co ul > li::before{ content:''; position:absolute; left:.8mm; top:1.9mm; width:1.6mm; height:1.6mm; border-radius:50%; background:var(--green) }
.co ol > li{ counter-increment:c }
.co ol > li::before{ content:counter(c); position:absolute; left:0; top:.2mm; width:3.6mm; height:3.6mm; border-radius:1.2mm; background:var(--amber); color:#fff; font-family:var(--f-mono); font-weight:600; font-size:6.6pt; text-align:center; line-height:3.6mm }
.co li ul{ margin:1.2mm 0 .6mm }
.co li li{ padding-left:3.4mm; margin-bottom:1mm; font-size:8pt }
.co li ul > li::before, .co.didnt li ul > li::before{ left:.4mm; top:1.8mm; width:1.2mm; height:1.2mm; background:#B9C3D8 }
.co .li-extra{ margin-top:1mm }
.co.didnt li > .li-body{ }

.stack{ display:flex; flex-direction:column; gap:4mm }
.stack .co{ flex:none }
.fig-row-unused{ display:grid; grid-template-columns:112mm 1fr; gap:5mm; margin-top:5mm; align-items:start }
figure.shot{ margin:5mm 0 0; display:grid; grid-template-columns:134mm 1fr; gap:6mm; align-items:center }
.frame{ background:#fff; border:.25mm solid var(--line); border-radius:3mm; overflow:hidden; box-shadow:0 1.6mm 5mm rgba(10,18,34,.10) }
.frame .chrome{ background:#F1F4FA; border-bottom:.25mm solid var(--line); padding:1.5mm 3mm; display:flex; align-items:center; gap:1.2mm }
.frame .chrome span{ width:1.7mm; height:1.7mm; border-radius:50%; background:#CBD3E3 }
.frame .chrome em{ margin-left:2mm; font-family:var(--f-mono); font-style:normal; font-size:6pt; color:var(--muted); letter-spacing:.06em }
.frame img{ display:block; width:100%; height:auto }
figure.shot figcaption{ font-size:8.4pt; line-height:1.5; color:var(--muted) }
figure.shot figcaption b{ font-family:var(--f-mono); font-weight:600; font-size:6.5pt; letter-spacing:.12em; text-transform:uppercase; color:var(--blue-ink); display:block; margin-bottom:1.2mm }
.audit{ background:var(--navy); color:#C9D3E6; border-radius:3mm; padding:4mm 4.4mm; font-size:8pt; line-height:1.5 }
.audit h4{ font-family:var(--f-mono); font-weight:500; font-size:6.5pt; letter-spacing:.14em; text-transform:uppercase; color:#8FB0FF; margin-bottom:1.6mm }
.audit em{ color:#C9D3E6; font-style:normal }
.audit code{ background:rgba(255,255,255,.09); color:#fff; display:inline-block; margin:.4mm 0 }
.audit p + p{ margin-top:1.6mm }
.audit .tail{ color:#8FA0BF; font-size:7.4pt }
`;

function page1(M, f) {
  const cardsFrom = (t) =>
    (t?.rows || [])
      .map((r, i) => `<div class="card"><div class="ct">${inline(plain(r[0]))}<span class="ix">${String(i + 1).padStart(2, '0')}</span></div>${inline(r[1])}</div>`)
      .join('');
  const stripHtml = M.A.strip
    .map((p) => {
      const m = /^\*\*([^*]+?)\.?\*\*\s*(.*)$/.exec(p.text);
      return `<div class="s"><h3>${esc(m ? m[1] : '')}</h3>${inline(m ? m[2] : p.text)}</div>`;
    })
    .join('');
  const coreText = M.A.core ? M.A.core.text.replace(/^\*\*Core idea:\s*[^*]+\*\*\s*/i, '') : '';
  const flowText = M.A.flow ? M.A.flow.text.replace(/^\*\*Request flow\.\*\*\s*/i, '') : '';
  return `<section class="page" id="p1"><div class="body">
    <header class="band"><div class="row">
      <div>
        <div class="kicker">Final report &nbsp;·&nbsp; ${esc(M.event)}</div>
        <h1>${esc(M.title)}</h1>
        <div class="tagrow"><div class="tag">${esc(M.tagline)}</div><div class="krepo">${esc(M.repo)}</div></div>
      </div>
      <div class="meta"><b>${esc(M.author)}</b><br>${esc(M.date)}${M.license ? `<br><span class="lic">${esc(M.license)} licence</span>` : ''}</div>
    </div></header>
    <div class="pad">
      <div class="lede"><div class="bar"></div><p>${inline(`**${M.tagline.charAt(0).toUpperCase() + M.tagline.slice(1)}.** ${coreText}`)}</p></div>
      <div class="dia">
        
        ${diagram(f)}
        
      </div>
      <div class="sec-h"><span class="n">01</span><h2>${esc(M.A.tableA ? 'System design' : '')}</h2><span class="rule"></span></div>
      <div class="cards">${cardsFrom(M.A.tableA)}</div>
      <div class="strip">${stripHtml}</div>
    </div>
    ${footer(M, 1)}
  </div></section>`;
}

function footer(M, n) {
  return `<div class="foot"><span><b>${esc(M.title)}</b> &nbsp;·&nbsp; Final report</span><span>${esc(M.repo)}</span><span class="pg">${n} / ${MAX_PAGES}</span></div>`;
}

function scorecard(M, f) {
  const b = M.B;
  const partials = b.partialRows.map((r) => `Q${r.n}`).join(', ');
  const tiles = [];
  tiles.push(`<div class="tile t-ok"><div class="big"><span class="g">${b.correct}</span><small>/${b.total}</small></div><div class="lab">Questions answered correctly</div><div class="sub">${b.partialRows.length ? `<span class="am">${b.partialRows.length} partial</span> (${esc(partials)}) · rest match the oracle` : 'all match the oracle'}</div></div>`);
  if (f.hosted != null) tiles.push(`<div class="tile"><div class="big">${f.hosted}<small>/${f.turns}</small></div><div class="lab">Turns on the hosted planner</div><div class="sub">${f.fallbackN} on the deterministic fallback</div></div>`);
  tiles.push(`<div class="tile"><div class="big">${f.firstRun}<span class="arr"> &rarr; </span>${b.correct}</div><div class="lab">First live run to final</div><div class="sub">questions correct, same ${b.total}-question set</div></div>`);
  tiles.push(`<div class="tile"><div class="big">${esc(f.records)}</div><div class="lab">Evidence records indexed</div><div class="sub">${f.wells ? `${esc(f.wells)} wells · ${esc(f.areas)} areas · ` : ''}every answer cited</div></div>`);
  return `<div class="score" style="grid-template-columns:repeat(${tiles.length},1fr)">${tiles.join('')}</div>`;
}

function mini(M, label) {
  return `<div class="mini"><div class="l">${esc(M.title)}<span>${esc(M.tagline)}</span></div><div class="r">${esc(label)}</div></div>`;
}

function page2(M, f, split) {
  const b = M.B;
  const introHtml = b.intro.map((p) => `<p>${inline(p.text)}</p>`).join('');
  const heading = b.title.replace(/^Pages?\s*[\d–-]+\s*·\s*/i, '');
  const hm = /^(Results on)\s+(.*)$/i.exec(heading);
  const h = hm ? `${hm[1]} <em>${esc(hm[2])}</em>` : esc(heading);
  return `<section class="page" id="p2"><div class="body">
    ${mini(M, 'Results · 1 of 2')}
    <div class="pad">
      <div class="res-h">${h}</div>
      <div class="res-intro">${introHtml}</div>
      ${scorecard(M, f)}
      <div id="tbl-wrap">${resultsTable(b.rows.slice(0, split), false)}</div>
    </div>
    ${footer(M, 2)}
  </div></section>`;
}

function figureHtml(figSrc) {
  if (!figSrc) return '';
  return `<figure class="shot">
    <div class="frame"><div class="chrome"><span></span><span></span><span></span><em>ASSET COPILOT</em></div><img src="${figSrc}" alt="Copilot answer showing an evidence conflict card and cited sources"></div>
    <figcaption><b>Inside the product</b>A conflict is shown, not resolved. Both notes are quoted, neither counts as a formal correction, and the answer cites its source records.</figcaption>
  </figure>`;
}

function page3(M, f, split, figSrc) {
  const b = M.B;
  const cont = b.rows.slice(split);
  const card = (c) => {
    const worked = /worked/i.test(c.label);
    const cls = worked ? 'worked' : /didn|not/i.test(c.label) ? 'didnt' : '';
    return { worked, html: `<div class="co ${cls}"><h3><span class="ic">${worked ? '&#10003;' : '!'}</span>${esc(c.label)}</h3>${renderList(c.node)}</div>` };
  };
  const cards = b.callouts.map(card);
  const tail = b.tail.map((p) => `<p class="tail">${inline(p.text)}</p>`).join('');
  const links = M.answersFile ? `<p>Full verbatim answers for all ${esc(f.turns ?? '')} turns:<br><code>${esc(M.answersFile)}</code></p>` : '';
  const audit = `<div class="audit"><h4>Audit trail</h4>${links}${tail}</div>`;
  const left = cards.filter((c) => c.worked).map((c) => c.html).join('') + audit;
  const right = cards.filter((c) => !c.worked).map((c) => c.html).join('');
  return `<section class="page" id="p3"><div class="body">
    ${mini(M, 'Results · 2 of 2')}
    <div class="pad">
      ${cont.length ? `<div style="margin-top:5mm">${resultsTable(cont, true)}</div>` : ''}
      <div class="two" ${cont.length ? '' : 'style="margin-top:6mm"'}><div class="stack">${left}</div><div class="stack">${right}</div></div>
      ${figureHtml(figSrc)}
    </div>
    ${footer(M, 3)}
  </div></section>`;
}

function buildHtml(M, split, figSrc) {
  const f = M.facts;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(M.title)}: Final Report</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
${fontLinks()}
<style>${CSS}</style></head>
<body>
${page1(M, f)}
${page2(M, f, split)}
${page3(M, f, split, figSrc)}
</body></html>`;
}

/* ------------------------------------------------------------------ browser */

function findPlaywright() {
  const req = createRequire(import.meta.url);
  const tries = [
    () => req('playwright-core'),
    () => createRequire(path.join(process.cwd(), 'noop.js'))('playwright-core'),
    () => req(path.join(process.env.APPDATA || '', 'npm', 'node_modules', '@playwright', 'cli', 'node_modules', 'playwright-core')),
    () => req(path.join(os.homedir(), 'AppData', 'Roaming', 'npm', 'node_modules', '@playwright', 'cli', 'node_modules', 'playwright-core')),
  ];
  for (const t of tries) { try { return t(); } catch { /* next */ } }
  throw new Error('playwright-core not found. npm i -D playwright-core (or install @playwright/cli globally).');
}

function findChrome() {
  const env = process.env.CHROME_PATH;
  const cands = [
    env,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const c of cands) if (fs.existsSync(c)) return c;
  // playwright / hyperframes caches
  const roots = [path.join(os.homedir(), '.cache', 'hyperframes', 'chrome'), path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright')];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    const stack = [r];
    while (stack.length) {
      const d = stack.pop();
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) stack.push(p);
        else if (/^(chrome|headless_shell|chrome-headless-shell)(\.exe)?$/.test(e.name)) return p;
      }
    }
  }
  return undefined; // let playwright try its own default
}

async function main() {
  const md = fs.readFileSync(SRC, 'utf8');
  const M = buildModel(md);
  const figPath = FIGURE_CANDIDATES.find((p) => fs.existsSync(p));
  const figSrc = figPath ? `data:image/png;base64,${fs.readFileSync(figPath).toString('base64')}` : '';

  const { chromium } = findPlaywright();
  const browser = await chromium.launch({ executablePath: findChrome(), headless: true, args: ['--font-render-hinting=none'] });
  const ctx = await browser.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  const load = async (html) => {
    fs.writeFileSync(OUT_HTML, html);
    await page.goto(pathToFileURL(OUT_HTML).href, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.emulateMedia({ media: 'print' });
  };

  // pass 1: everything on page 2, measure how many table rows fit
  await load(buildHtml(M, M.B.rows.length, figSrc));
  const fit = await page.evaluate(() => {
    const p2 = document.getElementById('p2');
    const pr = p2.getBoundingClientRect();
    const limit = pr.top + pr.height - 14 * 3.78; // keep clear of the footer (~14mm)
    const trs = [...p2.querySelectorAll('table.results tbody tr')];
    let k = 0;
    for (const tr of trs) { if (tr.getBoundingClientRect().bottom <= limit - 4) k++; else break; }
    return { k, total: trs.length };
  });
  let split = Math.max(1, fit.k);
  // keep a sensible balance if the table nearly fits: leave last rows on p3 only if they overflow
  await load(buildHtml(M, split, figSrc));

  const report = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((pg) => {
      const pr = pg.getBoundingClientRect();
      const foot = pg.querySelector('.foot').getBoundingClientRect();
      let maxBottom = 0;
      pg.querySelectorAll('.pad > *, .pad > * *').forEach((el) => { const r = el.getBoundingClientRect(); if (r.height) maxBottom = Math.max(maxBottom, r.bottom); });
      out.push({ id: pg.id, contentBottomMm: +((maxBottom - pr.top) / 3.7795).toFixed(1), footTopMm: +((foot.top - pr.top) / 3.7795).toFixed(1), pageMm: +(pr.height / 3.7795).toFixed(1) });
    });
    const fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`);
    return { out, fonts };
  });

  await page.pdf({ path: OUT_PDF, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

  if (WANT_PNG) {
    for (const id of ['p1', 'p2', 'p3']) {
      const el = await page.$('#' + id);
      await el.screenshot({ path: path.join(HERE, `preview-${id}.png`) });
    }
  }
  await browser.close();

  const pdf = fs.readFileSync(OUT_PDF);
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  const fontsEmbedded = [...new Set((pdf.toString('latin1').match(/\/BaseFont\s*\/[A-Z]{6}\+[A-Za-z0-9-]+/g) || []).map((s) => s.replace(/.*\+/, '')))];

  console.log(`table rows on page 2: ${split}/${fit.total}`);
  for (const r of report.out) {
    const over = r.contentBottomMm > r.footTopMm - 1;
    console.log(`${r.id}: content ends ${r.contentBottomMm}mm, footer at ${r.footTopMm}mm of ${r.pageMm}mm ${over ? '  <-- OVERFLOW' : ''}`);
  }
  console.log(`web fonts loaded: ${[...new Set(report.fonts)].length}  | embedded in PDF: ${fontsEmbedded.join(', ') || '(none found)'}`);
  console.log(`PDF pages: ${pages} (limit ${MAX_PAGES})  -> ${OUT_PDF}`);
  if (pages > MAX_PAGES || report.out.some((r) => r.contentBottomMm > r.footTopMm - 1)) { console.error('Layout check failed: reduce content or tune the template.'); process.exitCode = 1; }
}

main().catch((e) => { console.error(e); process.exit(1); });
