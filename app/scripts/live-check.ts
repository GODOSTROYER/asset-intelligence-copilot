/** Opt-in, sequential hosted checks. Reads ignored .env.local; never saves app state.
 * Run only with the owner's authorization: node --import tsx scripts/live-check.ts
 * Each invocation is a new provider budget process; do not rerun during cooldown.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { loadDataset } from '../server/data';
import { emptyState, type CopilotState } from '../server/engine';
import { runAgent, providerStatus, type AgentResult } from '../server/agent';

const appDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manualOnly=process.argv.includes('--manual-only');
// Observe only safe URL model IDs, HTTP status and timing. Provider still owns
// request construction, credentials, routing, budgets, retries and response bodies.
const hostedRequests:{model:string;status:number|null;durationMs:number}[]=[];
const nativeFetch=globalThis.fetch;
globalThis.fetch=(async (input:Parameters<typeof fetch>[0],init:Parameters<typeof fetch>[1])=>{
  const started=Date.now(),url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  const model=new URL(url).pathname.match(/\/models\/([a-zA-Z0-9._-]+):generateContent$/)?.[1];
  try{const response=await nativeFetch(input,init);if(model)hostedRequests.push({model,status:response.status,durationMs:Date.now()-started});return response;}
  catch(error){if(model)hostedRequests.push({model,status:null,durationMs:Date.now()-started});throw error;}
}) as typeof fetch;
for(const file of ['.env.local','.env']){
  try{process.loadEnvFile(path.join(appDir,file));}catch(error:any){if(error.code!=='ENOENT')throw new Error('Environment file could not be loaded.');}
}
const michael='U-201',jake='U-102',jessica='U-202',laura='U-401';
const state=emptyState(),memory=emptyState(),planned=emptyState();
type Case={id:string;question:string;state:CopilotState;user:string;expectation:string;verify:(a:AgentResult)=>void;after?:(a:AgentResult)=>void;before?:()=>void};
type Result={id:string;question:string;expectation:string;semanticPass:boolean;hostedPass:boolean;errors:string[];result?:AgentResult;blocked?:string};
const has=(a:AgentResult,...values:string[])=>{for(const value of values)assert(a.answer.toLowerCase().includes(value.toLowerCase()),'Answer missing '+value);};
const cites=(a:AgentResult,...ids:string[])=>{for(const id of ids)assert(a.citations.some(c=>c.id===id),'Citation missing '+id);};
const wells=(a:AgentResult,ids:string[])=>assert.deepEqual([...a.referencedWellIds].sort(),[...ids].sort(),'Referenced well set differs');
const rendered=(a:AgentResult)=>JSON.stringify(a.visualization??{});
const history=(s:CopilotState,user:string,q:string,a:AgentResult)=>{
  (s.history[user]??=[]).push({userText:q,answer:a.answer,wellIds:[...a.referencedWellIds],createdAt:'2026-10-16T12:00:00.000Z'});
};
const q6='Which 3 wells in Northeast Block 7 had the most downtime in the last 4 months? Show a bar chart.';
let rawReading='',beforeRead='';
const cases:Case[]=[
  {id:'Q1 status',question:'Is WELL-0001 producing oil right now? When was it last inspected, and by whom? Show me its status card.',state:emptyState(),user:michael,expectation:'Not producing; latest inspection, Ryan Brooks, T200 manual and planned shut-in; status card.',verify:a=>{has(a,'not producing oil','INS-0001-0203','3.2','Ryan Brooks','Jake Morales');assert.equal(a.visualization?.type,'status');cites(a,'INS-0001-0203','OM-T200','CTX-0001-003');}},
  {id:'Q6 downtime ranking',question:q6,state:memory,user:michael,expectation:'Bar chart: WELL-0121 49 days; WELL-0138 and WELL-0107 42 days.',verify:a=>{wells(a,['WELL-0121','WELL-0138','WELL-0107']);assert.equal(a.visualization?.type,'bar');for(const [id,value] of [['WELL-0121',49],['WELL-0138',42],['WELL-0107',42]] as const)assert.equal(a.visualization.data?.find(d=>d.assetId===id)?.value,value,'Wrong chart value for '+id);assert(a.citations.length>0);},after:a=>history(memory,michael,q6,a)},
  {id:'Q11 private memory',question:'For the three wells we discussed yesterday, what have repairs cost this year?',state:memory,user:michael,expectation:'Same user resolves Q6 wells and USD 25,794 / 46,942 / 5,176 in a table.',verify:a=>{wells(a,['WELL-0121','WELL-0138','WELL-0107']);assert.equal(a.visualization?.type,'table');for(const [id,cost] of [['WELL-0121','USD 25,794'],['WELL-0138','USD 46,942'],['WELL-0107','USD 5,176']])assert.equal(a.visualization.rows?.find(r=>r[0]===id)?.[2],cost,'Wrong cost for '+id);assert(a.citations.length>0);}},
  {id:'Q12 raw correction',question:'The 15 Oct reading for WELL-0164 is wrong. The handheld thermal gun used in that inspection was faulty; the field crew re-measured the wellhead at 41.0 °C.',state,user:michael,expectation:'Append scoped correction 24 to 41; original inspection preserved; producing with note conflict.',verify:a=>{const c=state.corrections.find(c=>c.inspectionId==='INS-0164-0205');assert(c,'Correction missing');assert.equal(c.originalValue,24);assert.equal(c.correctedValue,41);assert.equal(c.authorUserId,michael);has(a,'41','producing');assert(a.conflicts.length>0,'Inspector conflict missing');cites(a,'INS-0164-0205');}},
  {id:'Q15 shared correction',question:'Is WELL-0164 producing oil right now?',state,user:jessica,expectation:'Jessica sees Michael correction, producing at 41 C, with inspection conflict.',verify:a=>{has(a,'producing oil','41','Michael Turner','Pump jack not moving');assert(a.conflicts.length>0);cites(a,'INS-0164-0205');const c=state.corrections.find(c=>c.inspectionId==='INS-0164-0205');assert(c);cites(a,c.id);assert.equal(a.visualization?.type,'status');}},
  {id:'Q13 spill correction',question:'The AI estimated the 24 Sep spill at WELL-0151 as 4.5 bbl. The field crew measured 5.4 bbl.',state,user:michael,expectation:'Correct exact spill to 5.4; SR-01 reporting and 23 Nov verification deadline; repair report evidence.',verify:a=>{const c=state.corrections.find(c=>c.inspectionId==='INS-0151-0201');assert(c);assert.equal(c.originalValue,4.5);assert.equal(c.correctedValue,5.4);has(a,'5.4','SR-01','SR-03');assert(/23 Nov 2026|Nov 23,? 2026|2026-11-23/i.test(a.answer),'Verification deadline differs from 23 Nov 2026');cites(a,'INS-0151-0201','MNT-0151-025');}},
  {id:'Q15 shared reportability',question:'Which spills in Northeast Block 8 in the last 90 days needed a report to the regulator?',state,user:laura,expectation:'Only WELL-0151 is reportable at corrected 5.4 bbl; absent notice is overdue; table.',verify:a=>{wells(a,['WELL-0151']);has(a,'5.4','SR-01');assert(/no written notice|no report|none is recorded|overdue/i.test(a.answer),'Missing-notice finding absent');assert.equal(a.visualization?.type,'table');assert.equal(a.visualization.rows?.length,1);cites(a,'INS-0151-0201');}},
  {id:'Q16 shared note',question:'FYI for everyone: WELL-0007 will be shut in from 17 Oct for a 10-day planned workover.',state:planned,user:jake,expectation:'Append one shared field note with Jake attribution.',verify:a=>{assert.equal(planned.sharedFacts.length,1);assert.equal(planned.sharedFacts[0].authorUserId,jake);assert.equal(planned.sharedFacts[0].assetId,'WELL-0007');has(a,'shared');}},
  {id:'Q16 read without mutation',question:'Is any downtime planned for WELL-0007?',state:planned,user:michael,expectation:'Michael reads Jake note, 17 Oct and 10 days, without state mutation.',before:()=>{beforeRead=JSON.stringify(planned);},verify:a=>{assert.equal(JSON.stringify(planned),beforeRead,'Read question mutated state');has(a,'17 Oct','10-day','Jake Morales');cites(a,planned.sharedFacts[0].id);}},
  {id:'Q16 private isolation',question:'For the three wells we discussed yesterday, what have repairs cost this year?',state:memory,user:jessica,expectation:'Jessica cannot access Michael private Q6 history.',verify:a=>{assert(/don.t have a prior conversation|no matching earlier conversation/i.test(a.answer),'Missing private-history clarification');wells(a,[]);assert(!/WELL-0121|WELL-0138|WELL-0107|25,794|46,942|5,176/.test(a.answer+rendered(a)),'Leaked another user history');}},
  {id:'Unfamiliar status paraphrase',question:'Could you tell me whether WELL-0151 is currently yielding crude, using its most recent thermal survey and its own equipment manual?',state:emptyState(),user:michael,expectation:'Resolve unfamiliar wording to current T350 status and 29.2 C delta; cite own manual.',verify:a=>{has(a,'producing oil','29.2','T350');wells(a,['WELL-0151']);cites(a,'INS-0151-0204','OM-T350');assert.equal(a.visualization?.type,'status');}},
  {id:'Explicit downtime window',question:'How many days was WELL-0001 down from 8 Oct through 15 Oct 2026?',state:emptyState(),user:michael,expectation:'Inclusive arbitrary window counts exactly two weekly nonproducing inspections: 14 days.',verify:a=>{assert(/14\s+days/i.test(a.answer),'Expected 14 days');cites(a,'INS-0001-0202','INS-0001-0203');wells(a,['WELL-0001']);}},
  {id:'Q18 spill conflict',question:'Was the 20 Aug spill at WELL-0101 real oil?',state:emptyState(),user:michael,expectation:'Affirm one real 1.0-bbl spill; crude / produced-water disagreement retained; both notes and repair cited.',verify:a=>{assert(/\byes\b|1\s+real spills?/i.test(a.answer),'Real-spill affirmation missing');assert(/1(?:\.0)?\s*bbl/i.test(a.answer),'Expected 1.0 bbl');has(a,'crude','produced water','detection stands');assert(a.conflicts.length>0);cites(a,'INS-0101-0197','CTX-0101-002','CTX-0101-003','MNT-0101-029');}},
  {id:'General manual retrieval',question:'What does the T200 operating manual require an operator to do before a planned shut-in starts?',state:emptyState(),user:michael,expectation:'Complete shut-in checklist: stop prime mover at bottom of stroke, set brake, close wing valve, record in maintenance system before work; cited hosted synthesis.',verify:a=>{has(a,'prime mover','bottom','stroke','brake','wing valve','maintenance');assert(/stop|shut (?:off|down)/i.test(a.answer),'Prime mover stop instruction missing');assert(/record|log|enter/i.test(a.answer),'Manual recording duty missing');assert(/before.*work/i.test(a.answer),'Before-work requirement missing');cites(a,'OM-T200');assert(a.trace.some(t=>t.tool==='document_retrieval'),'Retrieval not used');assert(a.trace.some(t=>t.tool==='gemini_synthesis'),'Hosted synthesis not accepted');}},
];

async function main(){
  const started=new Date(),dataset=await loadDataset([(process.env.SAMPLE_DATA_PATH||path.resolve(appDir,'../../sample-data'))],'2026-10-16');
  const initial=providerStatus(),results:Result[]=[];
  const selected=manualOnly?cases.filter(item=>item.id==='General manual retrieval'):cases;
  assert.equal(initial.model,'gemini-3.5-flash-lite','Unexpected configured planner model');
  assert(initial.reasoningModel===null||initial.reasoningModel==='gemini-3.8-flash','Unexpected reasoning model');
  rawReading=JSON.stringify(dataset.wells.find(w=>w.metadata.asset_id==='WELL-0164')!.inspections.find(i=>i.inspection_id==='INS-0164-0205'));
  let blocked='';
  for(const item of selected){
    const current=providerStatus();
    if(!current.configured)blocked='Hosted Gemini is not configured.';
    if(!current.availableKeys&&['cooldown','credentials_rejected'].includes(current.status))blocked='Provider '+current.status+'; respecting recorded cooldown. Next retry '+(current.nextRetryAt??'unavailable')+'.';
    if(blocked){results.push({id:item.id,question:item.question,expectation:item.expectation,semanticPass:false,hostedPass:false,errors:[],blocked});console.log('BLOCKED '+item.id);continue;}
    item.before?.();
    const row:Result={id:item.id,question:item.question,expectation:item.expectation,semanticPass:false,hostedPass:false,errors:[]};
    try{
      const answer=await runAgent(dataset,item.state,item.user,item.question);row.result=answer;
      row.hostedPass=answer.model.status==='hosted'&&answer.trace.some(t=>t.tool==='gemini_planner');
      if(!row.hostedPass)row.errors.push('Hosted agent result did not succeed: '+answer.model.status+' ('+(answer.model.reason??'no planner trace')+').');
      try{item.verify(answer);if(item.id==='Q12 raw correction')assert.equal(JSON.stringify(dataset.wells.find(w=>w.metadata.asset_id==='WELL-0164')!.inspections.find(i=>i.inspection_id==='INS-0164-0205')),rawReading,'Raw inspection was overwritten');row.semanticPass=true;}catch(error){row.errors.push(error instanceof Error?error.message:'Assertion failed.');}
      item.after?.(answer);
    }catch{row.errors.push('runAgent threw; upstream error details intentionally omitted.');}
    results.push(row);console.log((row.semanticPass&&row.hostedPass?'PASS ':'FAIL ')+item.id+' | '+(row.result?.model.status??'error')+' | '+(row.result?.durationMs??0)+' ms | '+row.errors.join(' '));
  }
  const final=providerStatus(),passed=results.filter(r=>r.semanticPass&&r.hostedPass).length,semantic=results.filter(r=>r.semanticPass).length;
  const safeStatus=(s:typeof initial)=>JSON.stringify(s,null,2);
  const lines=[manualOnly?'### Hosted Gemini targeted check':'# Hosted Gemini live integration checks','',`Run started: ${started.toISOString()}. Finished: ${new Date().toISOString()}.`,`Sample reference date: ${dataset.today}; ${dataset.wells.length} wells; ${dataset.documents.length} indexed evidence documents.`,
    '',`**Hosted + semantic checks: ${passed}/${selected.length}. Semantic checks: ${semantic}/${selected.length}.**`,'',
    'This is a bounded live run through the app runAgent entry point, with one sequential question at a time. Calls use the configured provider, its per-project budgets, retries and cooldowns. No local model or mocked provider is used. Credentials are loaded by process.loadEnvFile from ignored environment files and never printed. State and user histories exist only in memory; no .local/state.json writes occur.',
    '', manualOnly?'This targeted retest covers general manual retrieval and grounded hosted synthesis. The earlier multi-scenario run remains above. This sample run does not prove results on the final hidden dataset.':'Q6 history is appended in memory in the same shape as the API for the Q11 check. These checks validate the agent and shared/private memory semantics; browser behavior and persisted API memory are separate checks. This sample run does not prove results on the final hidden dataset.',
    '', 'Reproduce only with authorized hosted access: `node --import tsx scripts/live-check.ts'+(manualOnly?' --manual-only':'')+'`. Do not repeatedly rerun during recorded provider cooldown; provider budgets are scoped to the running process.',
    '', '| Scenario | Semantic | Hosted | Model | Duration | Tools |','|---|---|---|---|---:|---|',
    ...results.map(r=>`| ${r.id} | ${r.blocked?'BLOCKED':r.semanticPass?'PASS':'FAIL'} | ${r.hostedPass?'PASS':'FAIL'} | ${r.result?.model.name??'none'} | ${r.result?.durationMs??0} ms | ${r.result?.trace.map(t=>t.tool).join(', ')??'none'} |`),'',
    ...results.flatMap(r=>[`## ${r.id}`,'',`Question: ${r.question}`,'',`Expected: ${r.expectation}`,'',...(r.blocked?[`Blocked: ${r.blocked}`]:[]),...(r.errors.length?[`Failures: ${r.errors.join(' ')}`]:[]),...(r.result?[`Model: ${r.result.model.name}; status: ${r.result.model.status}; reason: ${r.result.model.reason??'none'}.`,``,`Answer: ${r.result.answer.replaceAll('\n',' ')}`,'',`Evidence IDs: ${r.result.citations.map(c=>c.id).join(', ')||'none'}.`,``,`Referenced wells: ${r.result.referencedWellIds.join(', ')||'none'}. Visual: ${r.result.visualization?.type??'none'}. Conflicts: ${r.result.conflicts.length}.`,``,`Trace: ${r.result.trace.map(t=>t.tool+' '+t.durationMs+' ms: '+t.detail).join(' | ')}`]:[]),'']),
    '## Hosted request observations','', 'Only model ID, HTTP status and elapsed time are observed; headers and response bodies are not recorded.','',
    '| Attempt | Requested model | HTTP status | Duration |','|---:|---|---:|---:|',...hostedRequests.map((r,i)=>`| ${i+1} | ${r.model} | ${r.status??'transport error'} | ${r.durationMs} ms |`),'',
    '## Provider status before run','', '```json',safeStatus(initial),'```','','## Provider status after run','', '```json',safeStatus(final),'```',''];
  await mkdir(path.join(appDir,'docs'),{recursive:true});
  if(manualOnly)await appendFile(path.join(appDir,'docs/LIVE_CHECKS.md'),'\n\n---\n\n## Targeted manual retrieval retest\n\n'+lines.join('\n'),'utf8');
  else await writeFile(path.join(appDir,'docs/LIVE_CHECKS.md'),lines.join('\n'),'utf8');
  console.log(`Hosted + semantic: ${passed}/${selected.length}; semantic: ${semantic}/${selected.length}; report docs/LIVE_CHECKS.md`);
  if(passed!==selected.length)process.exitCode=1;
}
main().catch(()=>{console.error('Live-check setup failed; no credentials or upstream bodies printed.');process.exitCode=1;});
