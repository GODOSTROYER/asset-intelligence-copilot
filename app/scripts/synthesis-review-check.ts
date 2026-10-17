import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type {Dataset} from '../server/data';

// Set fake credentials before provider initialization; replace fetch before any
// request. This script never reads .env files or contacts a provider.
process.env.GEMINI_API_KEY=randomUUID();process.env.GEMINI_API_KEYS='';
process.env.GEMINI_RPM='100';process.env.GEMINI_TPM='1000000';process.env.GEMINI_RPD='1000';
process.env.GEMINI_SYNTHESIS_REASONING='never';
let scenario='valid',requests=0;
globalThis.fetch=(async(_url:any,options:any)=>{
  requests++;
  const body=JSON.parse(options.body),schema=body.generationConfig.responseJsonSchema;
  let value:unknown={operation:'search',wellIds:['WELL-0001']};
  if(schema.required.includes('segments')){
    const {sources}=JSON.parse(body.contents[0].parts[0].text);
    const manual=sources.find((s:any)=>s.recordId==='OM-T200').id;
    const inspection=sources.find((s:any)=>s.recordId==='INS-0001-0001').id;
    if(scenario==='valid')value={segments:[{text:'The review limit is 95 °C.',citationIds:[manual]}]};
    else if(scenario==='uncited_number')value={segments:[{text:'The review limit is 85 °C.',citationIds:[manual]}]};
    else if(scenario==='unknown_source')value={segments:[{text:'The review limit is 95 °C.',citationIds:['S99']}]};
    else if(scenario==='legacy_no_marker')value={answer:'The review limit is 95 °C.',citationIds:[manual]};
    else if(scenario==='legacy_pooled')value={answer:'The manual limit is 85 °C ['+manual+']. The inspection reading is 95 °C ['+inspection+'].',citationIds:[manual,inspection]};
    else if(scenario==='unknown_lowercase_well')value={segments:[{text:'The review limit is 95 °C for well-9999.',citationIds:[manual]}]};
    else if(scenario==='unknown_record')value={segments:[{text:'The review limit is 95 °C in INS-9999-9999.',citationIds:[manual]}]};
    else if(scenario==='unknown_lowercase_protocol')value={segments:[{text:'The review limit is 95 °C under sr-99.',citationIds:[manual]}]};
  }
  return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}]}),{status:200});
}) as typeof fetch;
const {runAgent}=await import('../server/agent');
const {emptyState,executePlan}=await import('../server/engine');
const manual={id:'OM-T200',title:'Review limits manual',type:'manual',path:'fixture/manual.md',content:'Review limits: manual limit is 95 °C.'};
const inspection={id:'INS-0001-0001',title:'Review limits inspection',type:'inspection',assetId:'WELL-0001',path:'fixture/inspections.jsonl',content:'Review limits: inspection thermal reading is 85 °C.'};
const d:Dataset={roots:[],today:'2026-10-16',users:[{user_id:'REVIEW',name:'Review user'}],areas:[{area_id:'AREA'}],wells:[{metadata:{asset_id:'WELL-0001',well_type:'T200',area_id:'AREA',equipment:[]},inspections:[{inspection_id:inspection.id,inspected_at:'2026-10-15'}],maintenance:[],regulatoryEvents:[],context:[]}],documents:[manual,inspection],manuals:{T200:manual}};
let checks=0;
for(const name of ['valid','uncited_number','unknown_source','legacy_no_marker','legacy_pooled','unknown_lowercase_well','unknown_record','unknown_lowercase_protocol']){
  scenario=name;
  const answer=await runAgent(d,emptyState(),'REVIEW','Explain the review limits for WELL-0001. '+name);
  assert.equal(answer.model.status,name==='valid'?'hosted':'fallback',name+' must '+(name==='valid'?'pass':'reject unsupported content'));
  if(name==='valid'){assert.equal(answer.citations.length,1);assert.equal(answer.citations[0].id,'OM-T200');assert.match(answer.answer,/\[OM-T200\]/);}
  else{
    const diagnostic:Record<string,string>={uncited_number:'numeric_tokens',unknown_source:'citation_ids',legacy_no_marker:'citation_ids',legacy_pooled:'citation_ids',unknown_lowercase_well:'well_ids',unknown_record:'well_ids',unknown_lowercase_protocol:'protocol_ids'};
    assert.equal(answer.model.reason,'invalid_response:'+diagnostic[name],name+' must reject for the intended validation reason');
  }
  checks++;console.log('PASS '+name);
}
const costs:Dataset={...d,wells:[{...d.wells[0],maintenance:[{maintenance_id:'MNT-0001-0001',started_at:'2026-01-10',cost_usd:{total:12345.67}}]}]};
const cost=executePlan(costs,emptyState(),'REVIEW','Show repair costs this year as a bar chart.',{operation:'costs',wellIds:['WELL-0001'],year:2026,visual:'bar'});
assert.equal(cost.visualization!.type,'bar');assert.equal(cost.visualization!.meta.currency,'USD');assert.equal(cost.visualization!.meta.valueLabel,'Repair cost');assert.equal(cost.visualization!.data![0].value,12345.67);checks++;console.log('PASS exact USD cost bar contract');
console.log('Independent synthesis/visual checks complete: '+checks+' passed; '+requests+' mocked requests, zero cloud calls.');
