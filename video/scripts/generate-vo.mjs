// Usage: node scripts/generate-vo.mjs [--frames 1,4] [--timings-only]
// Run from the pitch-video directory. Reads voiceover text + vo_file from STORYBOARD.md.
// Never logs credentials. --timings-only skips TTS and only rebuilds timings.json
// from whatever WAVs are present (use after dropping in your own recordings).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ENV = path.resolve(ROOT, '../asset-intelligence-copilot/.env.local');
const MAX_REQUESTS = 20;
const args = process.argv.slice(2);
const timingsOnly = args.includes('--timings-only');
const fi = args.indexOf('--frames');
const only = fi >= 0 ? args[fi + 1].split(',').map(Number) : null;

// --- parse storyboard
const md = fs.readFileSync(path.join(ROOT, 'STORYBOARD.md'), 'utf8');
const frames = [];
for (const block of md.split(/^## Frame /m).slice(1)) {
  const n = Number(block.match(/^(\d+)/)[1]);
  const file = block.match(/^- vo_file:\s*(\S+)/m)?.[1];
  const text = block.match(/^- voiceover:\s*"(.*)"\s*$/m)?.[1];
  if (file && text) frames.push({ frame: n, file, text });
}

// --- WAV helpers
function wrapPcm(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
function wavDuration(buf) {
  let off = 12, rate = 0, ch = 1, bits = 16;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4); let size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') { ch = buf.readUInt16LE(off + 10); rate = buf.readUInt32LE(off + 12); bits = buf.readUInt16LE(off + 22); }
    if (id === 'data') { if (off + 8 + size > buf.length || size === 0xFFFFFFFF) size = buf.length - off - 8; return size / (rate * ch * bits / 8); }
    off += 8 + size + (size & 1);
  }
  throw new Error('no data chunk');
}

// --- TTS
if (!timingsOnly) {
  process.loadEnvFile(ENV);
  const configured = process.env.GEMINI_API_KEYS;
  let cands = [];
  if (configured) {
    try { cands = JSON.parse(configured); } catch { cands = configured.split(/[,\n]/).map((v) => v.trim()).filter(Boolean); }
  }
  let keys = cands.map((c) => (typeof c === 'string' ? c : c?.key)).filter(Boolean);
  if (process.env.GEMINI_API_KEY) keys.unshift(process.env.GEMINI_API_KEY);
  if (!keys.length) throw new Error('No configured Gemini credential; values are never logged.');
  let ki = 0, requests = 0;
  const style = 'Calm, confident, precise product-launch narrator. Warm but not salesy. Moderate pace, about 150 words per minute. Leave a clear short pause after short sentences like "It isn\'t." and "No." Read the text verbatim without adding or changing words.';
  for (const f of frames) {
    if (only && !only.includes(f.frame)) continue;
    const request = {
      model: 'gemini-3.8-flash-tts',
      input: [{ type: 'user_input', content: [{ type: 'text', text: f.text, annotations: [{ type: 'speech_metadata', style }] }] }],
      response_format: { type: 'audio' },
      generation_config: { speech_config: [{ voice: 'Kore' }] },
    };
    let bytes;
    for (;;) {
      if (requests >= MAX_REQUESTS) throw new Error(`Request cap (${MAX_REQUESTS}) reached at frame ${f.frame}.`);
      requests++;
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST', headers: { 'x-goog-api-key': keys[ki % keys.length], 'Content-Type': 'application/json' },
        body: JSON.stringify(request), signal: AbortSignal.timeout(180000),
      });
      if (r.ok) {
        const j = await r.json();
        const a = j?.steps?.flatMap((s) => s.content || []).filter((b) => b.type === 'audio').at(-1);
        if (!a?.data) throw new Error(`Frame ${f.frame}: no audio block in response.`);
        bytes = Buffer.from(a.data, 'base64');
        if (bytes.toString('ascii', 0, 4) !== 'RIFF') bytes = wrapPcm(bytes);
        break;
      }
      console.log(`frame ${f.frame}: HTTP ${r.status} (request ${requests}/${MAX_REQUESTS}, key slot ${ki % keys.length})`);
      if (r.status === 429 || r.status >= 500) {
        ki++;
        const wait = Math.min(60000, 5000 * 2 ** Math.min(requests, 4));
        await new Promise((res) => setTimeout(res, wait));
        continue;
      }
      throw new Error(`Frame ${f.frame}: Gemini TTS failed with HTTP ${r.status}.`);
    }
    const out = path.join(ROOT, f.file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, bytes);
    console.log(`frame ${f.frame}: wrote ${f.file} (${bytes.length} bytes)`);
  }
  console.log(`requests used: ${requests}`);
}

// --- timings.json from whatever WAVs exist
const timings = [];
for (const f of frames) {
  const p = path.join(ROOT, f.file);
  if (!fs.existsSync(p)) { console.log(`missing ${f.file}`); continue; }
  timings.push({ frame: f.frame, file: f.file, durationSec: Math.round(wavDuration(fs.readFileSync(p)) * 1000) / 1000, text: f.text });
}
fs.writeFileSync(path.join(ROOT, 'assets/vo/timings.json'), JSON.stringify(timings, null, 2));
console.log('timings.json written; total', timings.reduce((s, t) => s + t.durationSec, 0).toFixed(2), 's');
