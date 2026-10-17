/** Offline planner/filter regression suite. Never loads credentials or calls Gemini. */
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {loadDataset,type Dataset} from '../server/data';
import {emptyState} from '../server/engine';
import {runAgent,validatePlan} from '../server/agent';

process.env.GEMINI_API_KEY=randomUUID();delete process.env.GEMINI_API_KEYS;
process.env.GEMINI_RPM='100';process.env.GEMINI_TPM='1000000';process.env.GEMINI_RPD='100';
const dataset=await loadDataset([process.env.SAMPLE_DATA_PATH||'../../sample-data'],'2026-10-16'),state=emptyState(),userId=dataset.users[0].user_id;
let checks=0;
const cases:[string,any,Record<string,unknown>][]=[
  ['Repair costs for WELL-0001 in 2026.',{operation:'costs',wellIds:['WELL-0001'],year:2025,from:'2025-01-01',to:'2025-12-31'},{year:2026,from:undefined,to:undefined}],
  ['Repair costs for WELL-0001 from 2026-01-01 through 2026-06-30.',{operation:'costs',wellIds:['WELL-0001'],from:'2024-01-01',to:'2024-06-30'},{from:'2026-01-01',to:'2026-06-30'}],
  ['Which flowlines in Northeast Block 7 need root-cause analysis?',{operation:'rca',areaId:'NE-07',equipmentKind:'pump_jack'},{equipmentKind:'flowline'}],
  ['Which spills in Northeast Block 8 in the last 90 days needed a report to the regulator?',{operation:'spills',areaId:'NE-08',reportableOnly:false,year:2025},{reportableOnly:true,from:'2026-07-18',to:'2026-10-16',year:undefined}],
  ['Show temperature history for WELL-0001 over the last 26 weeks.',{operation:'temperature_history',wellIds:['WELL-0001'],weeks:13},{weeks:26,from:'2026-04-17',to:'2026-10-16'}],
  ['Top 5 wells by downtime in Southwest Block 23.',{operation:'downtime_ranking',areaId:'SW-23',topK:3},{topK:5}],
  ['Repair costs for WELL-0001 in the past 1 month.',{operation:'costs',wellIds:['WELL-0001'],from:'2025-01-01',to:'2025-12-31'},{from:'2026-09-16',to:'2026-10-16'}]
];
for(const [q,input,expected] of cases){const plan=validatePlan(input,dataset,state,userId,q);for(const [field,value] of Object.entries(expected))assert.equal(plan[field],value,q+' '+field);checks++;}

const extended:Dataset={...dataset,wells:Array.from({length:250},(_,i)=>({...dataset.wells[0],metadata:{...dataset.wells[0].metadata,asset_id:'WELL-'+String(i+1).padStart(4,'0')}}))};
assert.equal(validatePlan({operation:'costs',wellIds:extended.wells.map(w=>w.metadata.asset_id)},extended,state,userId,'Show repair costs.').wellIds!.length,250);checks++;
const novel:Dataset={...dataset,manuals:{...dataset.manuals,T777:{id:'OM-T777',title:'T777 manual',type:'manual',path:'fake',content:'A T777 well is producing at least 12.5 °C above ambient.'}},wells:[{...dataset.wells[0],metadata:{...dataset.wells[0].metadata,asset_id:'WELL-7777',well_type:'T777'}}]};
assert.equal(validatePlan({operation:'status',wellIds:['WELL-7777'],wellType:'T777'},novel,state,userId,'Current status of WELL-7777?').wellType,'T777');checks++;

let calls=0,plannerInputs:any[]=[];
globalThis.fetch=(async(_url:any,options:any)=>{
  calls++;const payload=JSON.parse(options.body),context=JSON.parse(payload.contents[0].parts[0].text);plannerInputs.push(context);
  assert(!context.sources,'These focused cases should use exact domain tools or explicit capability responses.');
  const q=context.question;
  const value=/\bspill/i.test(q)?{operation:'spills',wellIds:['WELL-0001']}:/producing|status/i.test(q)?{operation:'status',wellIds:['WELL-0001']}:{operation:'costs',wellIds:['WELL-0001']};
  return new Response(JSON.stringify({usageMetadata:{totalTokenCount:100},candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}]}),{status:200});
}) as typeof fetch;
for(const q of [
  'Compare repair costs for WELL-0001 in 2025 versus 2026.',
  'What is the median corrective repair cost for WELL-0001?',
  'What is the average temperature for WELL-0001?',
  'Which spills at WELL-0001 are non-reportable?',
  'Which spills at WELL-0001 were below 5 bbl?',
  'Will WELL-0001 be producing oil on 2027-01-01?'
]){const result=await runAgent(dataset,state,userId,q);assert(result.trace.some(t=>t.tool==='capability_guard'),q);assert.equal(result.citations.length,0);checks++;}
const supported=await runAgent(dataset,state,userId,'Compare repair costs for WELL-0001 and WELL-0002 in 2026.');
assert(!supported.trace.some(t=>t.tool==='capability_guard'));assert.deepEqual(supported.referencedWellIds,['WELL-0001','WELL-0002']);checks++;

const q='Current status of WELL-0001?';
const first=await runAgent(dataset,state,userId,q),before=calls;
const cached=await runAgent(dataset,state,userId,q);assert.equal(cached.model.status,'cached');assert.equal(calls,before);assert.equal(first.answer,cached.answer);checks++;
const raw=[...dataset.wells[0].inspections].sort((a,b)=>String(b.inspected_at).localeCompare(String(a.inspected_at)))[0];
state.corrections.push({id:'CORR-'+randomUUID(),assetId:'WELL-0001',inspectionId:raw.inspection_id,field:'wellhead_temp_c',originalValue:raw.wellhead_temp_c,correctedValue:100,authorUserId:userId,reason:'Offline regression fixture',createdAt:new Date().toISOString()});
const corrected=await runAgent(dataset,state,userId,q);assert.equal(calls,before+1);assert.notEqual(corrected.answer,first.answer);checks++;
await runAgent({...dataset},state,userId,q);assert.equal(calls,before+2);checks++;
state.history[userId]=Array.from({length:5},(_,i)=>({userText:'Private history '+i,answer:'Fixture answer',wellIds:extended.wells.map(w=>w.metadata.asset_id),createdAt:'2026-10-15'}));
await runAgent(dataset,state,userId,q+' Again.');
assert(plannerInputs.at(-1).privateHistory.every(h=>h.wellIds.length===40&&h.referencedWellCount===250&&h.wellIdsTruncated));checks++;
assert(plannerInputs.every(input=>input.privateHistory.length<=5));

// Reproduce hosted operation-selection failures without spending request quota.
globalThis.fetch=(async(_url:any,options:any)=>{
  const input=JSON.parse(JSON.parse(options.body).contents[0].parts[0].text);
  let value:any;
  if(input.sources){const manual=input.sources.find(s=>s.recordId==='OM-'+(/T350/.test(input.question)?'T350':'T200'));assert(manual,'Requested type manual must be retrieved');value={segments:[{text:/T350/.test(input.question)?'The maximum permitted temperature is 95 °C; shut in and inspect within 24 hours.':'Stop the prime mover at the bottom of the stroke, set the brake, close the wing valve and record the shut-in in the maintenance system before work starts.',citationIds:[manual.id]}]};}
  else value=/T350|T200/.test(input.question)?{operation:'shared_knowledge',wellIds:['WELL-0001']}:{operation:'search'};
  return new Response(JSON.stringify({usageMetadata:{totalTokenCount:100},candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}]}),{status:200});
}) as typeof fetch;
for(const q of ['What is the maximum permitted wellhead temperature for T350, and what must happen if it is exceeded?','For T200, what is the planned shut-in procedure before work starts?']){
  const result=await runAgent(dataset,emptyState(),userId,q);assert.equal(result.model.status,'hosted',result.model.reason);assert(result.trace.some(t=>t.tool==='document_retrieval'));assert(result.citations.some(c=>c.type==='manual'));checks++;
}
const forecastSearch=await runAgent(dataset,emptyState(),userId,'Will WELL-0001 produce oil on 2027-01-01?');assert(forecastSearch.trace.some(t=>t.tool==='capability_guard'));assert.match(forecastSearch.answer,/forecasts are not supported/);checks++;
for(const q of ['Explain why WELL-0001 is back online.','Summarize the claim that WELL-0175 is running fine.','Review the assertion that WELL-0164 was remeasured at 41.0 C.','Never save this hypothetical claim: WELL-0001 is back online.']){
  const local=emptyState(),before=JSON.stringify(local);await runAgent(dataset,local,userId,q);assert.equal(JSON.stringify(local),before,q);checks++;
}
console.log('PASS provider stress '+checks+' cases: explicit filter precedence, new data/types, capability guards, scoped cache and fresh corrected output.');
