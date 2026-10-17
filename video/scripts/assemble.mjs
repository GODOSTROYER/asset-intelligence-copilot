// Assemble index.html from the storyboard frames, real VO durations and word timings.
// Re-run after replacing assets/vo/*.wav with your own voice (and refreshing timings/words).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Optional CLI: --scenes <id,id,...> (subset, in that order, retimed from 0) and --out <file.html>.
const argv = process.argv.slice(2);
const arg = name => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
const sceneFilter = arg('--scenes')?.split(',').map(x => x.trim()).filter(Boolean);
const outFile = arg('--out') ?? 'index.html';
const LEAD = 0.45;   // silence before the VO starts in each scene
const TAIL = 0.75;   // breathing room after the VO ends

const board = readFileSync(join(root, 'STORYBOARD.md'), 'utf8');
const frames = board.split(/^## Frame /m).slice(1).map(block => {
  const get = key => block.match(new RegExp(`^- ${key}: (.*)$`, 'm'))?.[1]?.trim();
  return { id: get('src').replace(/^compositions\/frames\//, '').replace(/\.html$/, ''), src: get('src'), planned: parseFloat(get('duration')), vo: get('vo_file') };
});

const timings = existsSync(join(root, 'assets/vo/timings.json')) ? JSON.parse(readFileSync(join(root, 'assets/vo/timings.json'), 'utf8')) : [];
const voDuration = file => timings.find(t => t.file === file || file.endsWith(t.file) || t.file?.endsWith(file.split('/').pop()))?.durationSec;

let cursor = 0;
let selected = frames;
if (sceneFilter) {
  const missing = sceneFilter.filter(id => !frames.some(f => f.id === id));
  if (missing.length) { console.error(`Unknown scene id(s): ${missing.join(', ')}. Known: ${frames.map(f => f.id).join(', ')}`); process.exit(1); }
  selected = sceneFilter.map(id => frames.find(f => f.id === id));
}
const scenes = selected.map(f => {
  const vo = voDuration(f.vo);
  const duration = Math.round(Math.max(f.planned, vo ? LEAD + vo + TAIL : f.planned) * 100) / 100;
  const scene = { ...f, start: Math.round(cursor * 100) / 100, duration, voSec: vo };
  cursor += duration;
  return scene;
});
const total = Math.round(cursor * 100) / 100;

// Stretch scene-internal full-length layers (bg, camera, hold) to the synced scene length.
// A sidecar records the duration last written, so re-running after a VO swap stays idempotent.
for (const s of scenes) {
  const file = join(root, s.src), stamp = file.replace(/\.html$/, '.synced.json');
  if (!existsSync(file)) continue;
  const from = existsSync(stamp) ? JSON.parse(readFileSync(stamp, 'utf8')).duration : s.planned;
  if (from === s.duration) continue;
  const html = readFileSync(file, 'utf8');
  const pattern = new RegExp(`data-duration="${String(from).replace('.', '\\.')}"`, 'g');
  const count = (html.match(pattern) ?? []).length;
  writeFileSync(file, html.replace(pattern, `data-duration="${s.duration}"`));
  writeFileSync(stamp, JSON.stringify({ duration: s.duration, planned: s.planned }));
  console.error(`${s.id}: stretched ${count} full-length layer(s) ${from}s → ${s.duration}s`);
}

// Captions: phrase-chunk the word timings (max 7 words, break after punctuation).
const phrases = [];
for (const s of scenes) {
  const wordsFile = join(root, s.vo.replace(/\.wav$/, '.words.json'));
  if (!existsSync(wordsFile)) continue;
  const words = JSON.parse(readFileSync(wordsFile, 'utf8'));
  let chunk = [];
  const flush = () => { if (chunk.length) { phrases.push({ start: s.start + LEAD + chunk[0].start, end: s.start + LEAD + chunk.at(-1).end, words: chunk }); chunk = []; } };
  for (const w of words) { chunk.push(w); if (chunk.length >= 7 || /[.,!?;:—]$/.test(w.word.trim())) flush(); }
  flush();
}
// Close small gaps so captions don't flicker; never overlap the next phrase.
for (let i = 0; i < phrases.length; i++) {
  const next = phrases[i + 1];
  phrases[i].end = Math.min(next ? next.start : total, Math.max(phrases[i].end + 0.25, phrases[i].start + 0.8));
}
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = n => Math.round(n * 100) / 100;

const sceneHosts = scenes.map(s => `      <div id="scene-${s.id}" class="clip" data-composition-id="${s.id}" data-composition-src="${s.src}" data-start="${s.start}" data-duration="${s.duration}" data-track-index="1" data-width="1920" data-height="1080"></div>`).join('\n');
const voClips = scenes.filter(s => s.voSec).map(s => `      <audio id="vo-${s.id}" src="${s.vo}" data-start="${r2(s.start + LEAD)}" data-duration="${r2(s.voSec)}" data-track-index="2" data-volume="1"></audio>`).join('\n');
const captionClips = phrases.map((p, i) => `      <div id="cap-${i}" class="clip caption" data-start="${r2(p.start)}" data-duration="${r2(p.end - p.start)}" data-track-index="3"><span>${p.words.map((w, j) => `<b class="w" data-w="${i}-${j}">${esc(w.word.trim())}</b>`).join(' ')}</span></div>`).join('\n');
const wordTweens = phrases.flatMap((p, i) => p.words.map((w, j) => `      tl.to('[data-w="${i}-${j}"]', { color: '#EEF2F8', duration: 0.12, ease: 'none' }, ${r2(p.start + (w.start - p.words[0].start))});`)).join('\n');
const capIn = phrases.map((p, i) => `      tl.fromTo('#cap-${i} span', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: 'power3.out' }, ${r2(p.start)});`).join('\n');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0A1222; }
      #root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #0A1222; font-family: Montserrat, sans-serif; }
      .caption { position: absolute; left: 0; right: 0; bottom: 70px; display: flex; justify-content: center; pointer-events: none; z-index: 50; }
      .caption span { max-width: 1400px; padding: 12px 26px; border-radius: 14px; background: rgba(7, 13, 25, 0.78); color: #9AA8C0; font-size: 34px; font-weight: 600; line-height: 1.3; text-align: center; letter-spacing: -0.01em; }
      .caption .w { font-weight: 600; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
${sceneHosts}
${voClips}
${captionClips}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${capIn}
${wordTweens}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
writeFileSync(join(root, outFile), html);
console.log(JSON.stringify({ total, scenes: scenes.map(s => ({ id: s.id, start: s.start, duration: s.duration, vo: s.voSec ?? null })), captions: phrases.length }, null, 2));
