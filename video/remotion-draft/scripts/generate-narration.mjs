import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

process.loadEnvFile(path.resolve('../asset-intelligence-copilot/.env.local'));
const configured = process.env.GEMINI_API_KEYS;
let candidates = [];
if (configured) {
  try { candidates = JSON.parse(configured); }
  catch { candidates = configured.split(/[,\n]/).map((v) => v.trim()).filter(Boolean); }
}
const first = candidates[0];
const key = process.env.GEMINI_API_KEY || (typeof first === 'string' ? first : first?.key);
if (!key) throw new Error('No configured Gemini credential; values are never logged.');
const transcript = fs.readFileSync('narration.txt', 'utf8').trim();
const request = {
  model: 'gemini-3.8-flash-tts',
  input: [{ type: 'user_input', content: [{ type: 'text', text: transcript,
    annotations: [{ type: 'speech_metadata', style: 'Calm, clear, engaging documentary narration. Measured natural pace, about 155 words per minute. A brief pause between paragraphs. Read the text verbatim without adding words.' }] }] }],
  response_format: { type: 'audio' },
  generation_config: { speech_config: [{ voice: 'Kore' }] },
};
fs.mkdirSync('out', {recursive: true});
fs.mkdirSync('public/audio', {recursive: true});
const startedAt = new Date().toISOString();
let attempts = [];
let interaction;
for (let attempt = 1; attempt <= 2; attempt++) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify(request), signal: AbortSignal.timeout(180000),
  });
  const retryAfter = response.headers.get('retry-after');
  attempts.push({attempt, httpStatus: response.status, retryAfter});
  if (response.ok) { interaction = await response.json(); break; }
  // Deliberately do not log the response body or credentials.
  if (attempt === 2 || ![429, 500, 502, 503, 504].includes(response.status)) {
    fs.writeFileSync('out/narration-request.json', JSON.stringify({startedAt, attempts, result:'failed'}, null, 2));
    throw new Error(`Gemini TTS failed with HTTP ${response.status}. No credential cycling or further requests.`);
  }
  const seconds = Number(retryAfter);
  const delay = retryAfter && !Number.isFinite(seconds) ? Math.max(0, Date.parse(retryAfter)-Date.now()) : Math.max(60000, (seconds || 60)*1000);
  if (delay > 180000) throw new Error(`Provider backoff exceeds three minutes; retry deferred. HTTP ${response.status}.`);
  console.log(`Provider requested backoff; waiting ${Math.ceil(delay/1000)} seconds before the only retry.`);
  await new Promise((resolve) => setTimeout(resolve, delay));
}
const audio = interaction?.steps?.flatMap((step) => step.content || []).filter((block) => block.type === 'audio').at(-1);
if (!audio?.data) throw new Error('Successful response contained no audio block. No further requests.');
const bytes = Buffer.from(audio.data, 'base64');
if (bytes.toString('ascii', 0, 4) !== 'RIFF') throw new Error('Expected default WAV output; received a different audio container.');
fs.writeFileSync('public/audio/gemini-narration.wav', bytes);
fs.writeFileSync('out/narration-request.json', JSON.stringify({
  startedAt, completedAt: new Date().toISOString(), attempts, model:request.model, voice:'Kore',
  style:request.input[0].content[0].annotations[0].style,
  officialDocs:'https://ai.google.dev/gemini-api/docs/speech-generation',
  transcriptSha256:crypto.createHash('sha256').update(transcript).digest('hex'),
  audioSha256:crypto.createHash('sha256').update(bytes).digest('hex'), bytes:bytes.length,
  disclosure:'Draft · AI narration · replace with entrant voice',
}, null, 2));
console.log(`Saved Gemini narration WAV (${bytes.length} bytes). Credentials and response content were not logged.`);
