/** Offline reproduction of fleet current-status versus downtime misrouting. */
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {loadDataset} from '../server/data';
import {emptyState,executePlan} from '../server/engine';
import {runAgent,validatePlan} from '../server/agent';
process.env.GEMINI_API_KEY=randomUUID();delete process.env.GEMINI_API_KEYS;
process.env.GEMINI_RPM='100';process.env.GEMINI_TPM='1000000';process.env.GEMINI_RPD='100';
const d=await loadDataset([process.env.SAMPLE_DATA_PATH||'../../sample-data'],'2026-10-16'),s=emptyState(),userId=d.users[0].user_id;
const oracle=d.wells.filter(w=>{
  const raw=w.inspections.filter(i=>String(i.inspected_at).slice(0,10)<=d.today).sort((a,b)=>String(b.inspected_at).localeCompare(String(a.inspected_at)))[0];
  const threshold=Number(d.manuals[w.metadata.well_type].content.replace(/\*/g,'').match(/at least\s+(\d+(?:\.\d+)?)\s*°?\s*C\s+above\s+ambient/i)![1]);
  return raw&&raw.wellhead_temp_c-raw.ambient_temp_c+1e-9<threshold;
}).map(w=>w.metadata.asset_id).sort();
const q='List all non-producing wells across the entire fleet as a table.';
const wrong={operation:'downtime_ranking',areaId:'NE-07',wellIds:['WELL-0121','WELL-0108','WELL-0138'],wellType:'T350',topK:3,year:2025,from:'2025-01-01',to:'2025-12-31',visual:'bar'};
const plan=validatePlan(wrong,d,s,userId,q);
assert.equal(plan.operation,'area_status');assert.equal(plan.visual,'table');
for(const field of ['areaId','wellIds','wellType','topK','year','from','to'])assert.equal(plan[field],undefined,field+' must not limit the fleet current-status list');
const result=executePlan(d,s,userId,q,plan);
assert.deepEqual(result.referencedWellIds,oracle);assert.deepEqual(result.visualization!.rows!.map(row=>row[0]),oracle);assert(oracle.length>3);
assert(!/Downtime leaders|non-producing weekly inspections/i.test(result.answer));
const areaPlan=validatePlan(wrong,d,s,userId,'List all non-producing wells in Northeast Block 7 as a table.');
assert.equal(areaPlan.operation,'area_status');assert.equal(areaPlan.areaId,'NE-07');assert.equal(areaPlan.wellIds,undefined);
assert.deepEqual(executePlan(d,s,userId,'Current Northeast Block 7 list',areaPlan).referencedWellIds,oracle.filter(id=>d.wells.find(w=>w.metadata.asset_id===id)!.metadata.area_id==='NE-07'));
const typePlan=validatePlan(wrong,d,s,userId,'Show all T350 non-producing wells across the entire fleet as a table.');assert.equal(typePlan.wellType,'T350');assert.equal(typePlan.areaId,undefined);
assert.deepEqual(executePlan(d,s,userId,'Current T350 list',typePlan).referencedWellIds,oracle.filter(id=>d.wells.find(w=>w.metadata.asset_id===id)!.metadata.well_type==='T350'));
for(const text of ['Rank the top 5 wells by downtime in Southwest Block 23 in the last 12 months.','Show non-producing wells ranked by downtime in Southwest Block 23 during 2025.']){
  const ranked=validatePlan({operation:'downtime_ranking',areaId:'SW-23',topK:5},d,s,userId,text);assert.equal(ranked.operation,'downtime_ranking');
  const rankedAnswer=executePlan(d,s,userId,text,{...ranked,visual:'table'});assert.equal(rankedAnswer.visualization!.rows!.length,5);assert.match(rankedAnswer.answer,/non-producing weekly inspections/);
}
let calls=0;
globalThis.fetch=(async()=>{calls++;return new Response(JSON.stringify({usageMetadata:{totalTokenCount:100},candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(wrong)}]}}]}),{status:200});}) as typeof fetch;
const hosted=await runAgent(d,s,userId,q);assert.equal(hosted.model.status,'hosted');assert.deepEqual(hosted.referencedWellIds,oracle);assert.equal(calls,1);
console.log('PASS current-status routing: all '+oracle.length+' current nonproducing wells, full fleet/type/area scope, exact table, genuine downtime preserved, mocked hosted misroute repaired.');
