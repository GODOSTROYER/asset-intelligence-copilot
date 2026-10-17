// Gemma 4 (OpenRouter) as the copilot planner: same production prompt, context, schema, validator and engine.
// Reads OPENROUTER_API_KEY from the app's git-ignored .env.local; never prints it. Uses a fresh in-memory state.
// Usage (from app/): SAMPLE_DATA_PATH=<test-data/dataset> REFERENCE_DATE=2027-01-15 npm run gemma-test -- [model] [caseLimit] [offset]
//   model: google/gemma-4-31b-it:free (OpenRouter, default) or google:gemma-4-31b-it (Gemini API with AI Studio keys)
import { fileURLToPath } from 'node:url';
const APP = fileURLToPath(new URL('..', import.meta.url));
const SRV = new URL('../server/', import.meta.url).href;
process.loadEnvFile(APP + '/.env.local');
const key = process.env.OPENROUTER_API_KEY ?? '';
const googleKeys = (process.env.GEMINI_API_KEYS ?? process.env.GEMINI_API_KEY ?? '').split(',').map(k => k.trim()).filter(Boolean);
let googleIndex = 0;
// model 'google:<id>' calls Gemma directly on the Gemini API (AI Studio keys); otherwise OpenRouter.
async function callModel(model: string, system: string, user: string): Promise<{ status: number; text: string; error: string }> {
  if (model.startsWith('google:')) {
    const k = googleKeys[googleIndex++ % googleKeys.length];
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.slice(7)}:generateContent`, { method: 'POST', headers: { 'x-goog-api-key': k, 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { temperature: 0, maxOutputTokens: 800 } }) });
    const j: any = await r.json().catch(() => ({}));
    return { status: r.status, text: (j.candidates?.[0]?.content?.parts ?? []).filter((p: any) => !p.thought).map((p: any) => p.text ?? '').join(''), error: String(j.error?.message ?? '').slice(0, 200) };
  }
  if (!key) throw new Error('OPENROUTER_API_KEY is not set in .env.local');
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', 'X-Title': 'Asset Intelligence Copilot planner test' },
    body: JSON.stringify({ model, temperature: 0, max_tokens: 600, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
  const j: any = await r.json().catch(() => ({}));
  return { status: r.status, text: j.choices?.[0]?.message?.content ?? '', error: String(j.error?.metadata?.raw ?? j.error?.message ?? '').slice(0, 200) };
}
const { loadDataset } = await import(SRV + 'data.ts');
const { executePlan, emptyState } = await import(SRV + 'engine.ts');
const { plannerSystem, plannerContext, schemaForDataset, validatePlan } = await import(SRV + 'agent.ts');
const d = await loadDataset([process.env.SAMPLE_DATA_PATH ?? APP + '/../../sample-data'], process.env.REFERENCE_DATE ?? '2026-10-16'), s = emptyState();
const users: Record<string, string> = Object.fromEntries(d.users.map((u: any) => [u.name, u.user_id]));
const model = process.argv[2] ?? 'google/gemma-4-31b-it:free', limit = Number(process.argv[3] ?? 8), offset = Number(process.argv[4] ?? 0);
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const cases: [string, string, string, string, (a: any) => boolean][] = [
  ['Q1', 'Michael Turner', 'Is WELL-0001 producing oil right now? When was it last inspected, and by whom?', 'status', a => /not producing/i.test(a.answer) && a.citations.some((c: any) => c.id === 'CTX-0001-003')],
  ['Q2', 'Michael Turner', 'Which wells in Northeast Block 8 are not producing oil right now, and why? Show them in a table.', 'area_status', a => ['WELL-0164', 'WELL-0170', 'WELL-0172', 'WELL-0175'].every(w => a.answer.includes(w)) && a.visualization?.type === 'table'],
  ['Q6', 'Michael Turner', 'Which 3 wells in Northeast Block 7 had the most downtime in the last 4 months? Show a bar chart.', 'downtime_ranking', a => /WELL-0121/.test(a.answer) && /49/.test(a.answer) && a.visualization?.type === 'bar'],
  ['Q8', 'Michael Turner', 'Show a heatmap of 2026 spills by geographic area and month.', 'heatmap', a => a.visualization?.type === 'heatmap'],
  ['Q10', 'Michael Turner', 'In Southwest Block 24, which spills in the last 90 days were not contained within the SOP time limit?', 'containment', a => /WELL-0082/.test(a.answer) && /WELL-0100/.test(a.answer)],
  ['Q13', 'Michael Turner', 'The AI estimated the 24 Sep spill at WELL-0151 as 4.5 bbl. The field crew measured 5.4 bbl.', 'correction', a => /reportable/i.test(a.answer) && s.corrections.length === 1],
  ['Q14', 'Michael Turner', 'Note for all T350 wells: our team now wants a pump jack root-cause analysis after 2 repairs, not 3.', 'rule', () => s.typeRules.length === 1 && s.typeRules[0].wellType === 'T350'],
  ['Q18', 'Laura Simmons', 'Was the 20 Aug spill at WELL-0101 real oil?', 'spills', a => a.conflicts.length > 0],
];
const extract = (t: string) => { const m = t.match(/\{[\s\S]*\}/); if (!m) throw new Error('no JSON in reply'); return JSON.parse(m[0]); };
let pass = 0, calls = 0;
for (const [id, user, q, expectOp, check] of cases.slice(offset, offset + limit)) {
  if (calls) await sleep(4000);
  const userId = users[user], schema = schemaForDataset(d), t = Date.now(); calls++;
  const system = plannerSystem + '\nReturn ONLY one JSON object matching this JSON schema, no prose, no code fences:\n' + JSON.stringify(schema), userText = plannerContext(d, s, userId, q);
  let res = await callModel(model, system, userText);
  for (let attempt = 1; attempt < 3 && res.status === 429; attempt++) { calls++; await sleep(10000 * attempt); res = await callModel(model, system, userText); }
  const ms = Date.now() - t;
  if (res.status !== 200) { console.log(`${id} HTTP ${res.status} ${ms}ms ${res.error}`); if (res.status === 401) break; continue; }
  try {
    const raw = extract(res.text);
    let plan: any;
    try { plan = validatePlan(raw, d, s, userId, q); }
    catch (e: any) { console.log(`FAIL ${id} ${ms}ms gemma op=${raw.operation} → validator rejected (${e.reason ?? e.message})`); continue; }
    const a = executePlan(d, s, userId, q, plan), ok = plan.operation === expectOp && check(a);
    if (ok) pass++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${ms}ms gemma=${raw.operation} validated=${plan.operation} expect=${expectOp} visual=${a.visualization?.type ?? 'none'} cites=${a.citations.length} | ${a.answer.replace(/\s+/g, ' ').slice(0, 110)}`);
  } catch (e: any) { console.log(`FAIL ${id} ${ms}ms parse error: ${e.message}; raw=${res.text.slice(0, 140)}`); }
}
console.log(`\n${model}: ${pass}/${Math.min(limit, cases.length)} passed, ${calls} OpenRouter requests (provider: ${j_provider()}).`);
function j_provider() { return 'see OpenRouter dashboard'; }
