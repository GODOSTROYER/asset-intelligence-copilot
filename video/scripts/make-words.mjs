// Usage: node scripts/make-words.mjs   (run after generate-vo.mjs --timings-only / replacing WAVs)
// Fallback word timing: ffmpeg silencedetect anchors sentence boundaries; words are spread by character count within each sentence.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
const ROOT = path.resolve(import.meta.dirname, '..');
const timings = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/vo/timings.json'), 'utf8'));
for (const t of timings) {
  const wav = path.join(ROOT, t.file);
  const r = spawnSync('ffmpeg', ['-i', wav, '-af', 'silencedetect=noise=-38dB:d=0.18', '-f', 'null', '-'], { encoding: 'utf8' });
  const sil = []; let cur = null;
  for (const line of r.stderr.split('\n')) {
    const s = line.match(/silence_start: ([\d.]+)/), e = line.match(/silence_end: ([\d.]+)/);
    if (s) cur = { start: +s[1] };
    if (e && cur) { cur.end = +e[1]; sil.push(cur); cur = null; }
    if (!e && cur && line.includes('silence_start') === false) {}
  }
  if (cur) { cur.end = t.durationSec; sil.push(cur); }
  let speechStart = 0, speechEnd = t.durationSec;
  if (sil[0] && sil[0].start < 0.05) speechStart = sil.shift().end;
  if (sil.length && sil.at(-1).end >= t.durationSec - 0.05) speechEnd = sil.pop().start;
  const sentences = t.text.match(/[^.?!]+[.?!]+(?:\s|$)|[^.?!]+$/g).map((s) => s.trim());
  const weights = sentences.map((s) => s.replace(/\s/g, '').length);
  const total = weights.reduce((a, b) => a + b, 0);
  // anchor each sentence boundary to nearest unused internal silence
  const used = new Set(); const bounds = [];
  let acc = 0;
  for (let k = 0; k < sentences.length - 1; k++) {
    acc += weights[k];
    const expected = speechStart + (speechEnd - speechStart) * acc / total;
    let best = -1, bd = 1.5;
    sil.forEach((s, i) => { const d = Math.abs((s.start + s.end) / 2 - expected); if (!used.has(i) && d < bd) { bd = d; best = i; } });
    if (best >= 0) { used.add(best); bounds.push({ end: sil[best].start, next: sil[best].end }); }
    else bounds.push({ end: expected, next: expected });
  }
  bounds.sort((a, b) => a.end - b.end);
  const words = []; let s0 = speechStart;
  sentences.forEach((sent, k) => {
    const s1 = k < bounds.length ? bounds[k].end : speechEnd;
    const ws = sent.split(/\s+/); const w = ws.map((x) => x.replace(/[^\w]/g, '').length + 1 + (/[,:;]$/.test(x) ? 1.5 : 0));
    const tw = w.reduce((a, b) => a + b, 0); let p = s0;
    ws.forEach((word, i) => { const d = (s1 - s0) * w[i] / tw; words.push({ word, start: +p.toFixed(3), end: +(p + d).toFixed(3) }); p += d; });
    if (k < bounds.length) s0 = bounds[k].next;
  });
  const out = path.join(ROOT, t.file.replace(/\.wav$/, '.words.json'));
  fs.writeFileSync(out, JSON.stringify(words, null, 2));
  console.log(path.basename(out), words.length, 'words', `speech ${speechStart.toFixed(2)}-${speechEnd.toFixed(2)}`, 'anchors', used.size + '/' + (sentences.length - 1));
}
