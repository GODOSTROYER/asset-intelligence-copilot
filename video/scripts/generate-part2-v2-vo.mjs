// Usage: node scripts/generate-part2-vo.mjs   (run from pitch-video). Never logs credentials.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ENV = path.resolve(ROOT, '../asset-intelligence-copilot/.env.local');
const OUT = path.join(ROOT, 'assets/vo-part2-v2');
const MAX_REQUESTS = 15;

const md = fs.readFileSync(path.join(ROOT, 'renders/part2-v2-narration.md'), 'utf8').split(/\r?\n/);
const blocks = [];
for (let i = 0; i < md.length; i++) {
  const m = md[i].match(/^\*\*\[(\d+):(\d+)-(\d+):(\d+)\]\*\*/);
  if (!m) continue;
  let j = i + 1; while (j < md.length && !md[j].trim()) j++;
  blocks.push({ n: blocks.length + 1, start: +m[1] * 60 + +m[2], end: +m[3] * 60 + +m[4], text: md[j].trim() });
}
if (blocks.length < 8) throw new Error(`expected 8+ blocks, got ${blocks.length}`);

function wrapPcm(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

process.loadEnvFile(ENV);
let cands = [];
const configured = process.env.GEMINI_API_KEYS;
if (configured) { try { cands = JSON.parse(configured); } catch { cands = configured.split(/[,\n]/).map((v) => v.trim()).filter(Boolean); } }
const keys = cands.map((c) => (typeof c === 'string' ? c : c?.key)).filter(Boolean);
if (process.env.GEMINI_API_KEY) keys.unshift(process.env.GEMINI_API_KEY);
if (!keys.length) throw new Error('No configured Gemini credential; values are never logged.');

fs.mkdirSync(OUT, { recursive: true });
const style = 'Calm, confident, precise product-demo narrator. Warm but not salesy. Brisk but natural pace, about 150 words per minute, first person. Read the text verbatim without adding or changing words.';
let ki = 0, requests = 0;
for (const b of blocks) {
  const file = path.join(OUT, String(b.n).padStart(2, '0') + '.wav');
  if (fs.existsSync(file) && fs.statSync(file).size > 1000) { console.log(`block ${b.n}: exists, skipping`); continue; }
  const request = {
    model: 'gemini-3.8-flash-tts',
    input: [{ type: 'user_input', content: [{ type: 'text', text: b.text, annotations: [{ type: 'speech_metadata', style }] }] }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice: 'Kore' }] },
  };
  let bytes;
  for (;;) {
    if (requests >= MAX_REQUESTS) throw new Error(`Request cap (${MAX_REQUESTS}) reached at block ${b.n}.`);
    requests++;
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST', headers: { 'x-goog-api-key': keys[ki % keys.length], 'Content-Type': 'application/json' },
      body: JSON.stringify(request), signal: AbortSignal.timeout(180000),
    });
    if (r.ok) {
      const j = await r.json();
      const a = j?.steps?.flatMap((s) => s.content || []).filter((x) => x.type === 'audio').at(-1);
      if (!a?.data) throw new Error(`Block ${b.n}: no audio block in response.`);
      bytes = Buffer.from(a.data, 'base64');
      if (bytes.toString('ascii', 0, 4) !== 'RIFF') bytes = wrapPcm(bytes);
      break;
    }
    console.log(`block ${b.n}: HTTP ${r.status} (request ${requests}/${MAX_REQUESTS})`);
    if (r.status === 429 || r.status >= 500) { ki++; await new Promise((res) => setTimeout(res, Math.min(60000, 5000 * 2 ** Math.min(requests, 4)))); continue; }
    throw new Error(`Block ${b.n}: Gemini TTS failed with HTTP ${r.status}.`);
  }
  fs.writeFileSync(file, bytes);
  console.log(`block ${b.n}: wrote ${path.basename(file)} (${bytes.length} bytes)`);
}
fs.writeFileSync(path.join(OUT, 'blocks.json'), JSON.stringify(blocks, null, 2));
console.log(`requests used: ${requests}`);
