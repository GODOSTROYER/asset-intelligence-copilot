import assert from 'node:assert/strict';
import {loadDataset} from '../server/data';
import {emptyState,inferPlan,executePlan} from '../server/engine';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const sample=(process.env.SAMPLE_DATA_PATH||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../sample-data'));
const d=await loadDataset([sample],'2026-10-16');
const user=d.users.find(u=>u.name==='Michael Turner')!.user_id;
let checks=0;
const check=(name:string,fn:()=>void)=>{fn();checks++;console.log('PASS '+name);};
const run=(q:string,s=emptyState(),data=d)=>executePlan(data,s,user,q,inferPlan(data,s,user,q));
check('2025 natural-language downtime',()=>assert.match(run('How many days was WELL-0001 down in 2025?').answer,/21 days/));
check('two-week history is not fixed to thirteen readings',()=>assert.equal(run('Show a line chart of WELL-0001 temperature for the last 2 weeks').visualization!.data!.length,2));
for(const q of ['Why is WELL-0001 shut in?','Was the WELL-0164 reading corrected to 41.0 C?','Is any downtime planned for WELL-0007?']){
  check('read question cannot mutate: '+q,()=>{const s=emptyState(),before=JSON.stringify(s);run(q,s);assert.equal(JSON.stringify(s),before);});
}
check('historical correction retains the explicit year',()=>{
  const s=emptyState();run('The 24 Jul 2025 reading for WELL-0001 is wrong; the crew remeasured the wellhead at 41.0 C.',s);
  assert.equal(s.corrections.length,1);
  const target=d.wells.find(w=>w.metadata.asset_id==='WELL-0001')!.inspections.find(i=>i.inspected_at.startsWith('2025-07-24'))!;
  assert.equal(s.corrections[0].inspectionId,target.inspection_id);
});
check('missing manual produces unknown readings excluded from downtime',()=>{
  const unknown=structuredClone(d);delete unknown.manuals.T200;
  const a=executePlan(unknown,emptyState(),user,'2025 downtime',{operation:'downtime',wellIds:['WELL-0001'],year:2025});
  assert.match(a.answer,/0 days/);assert.ok(a.conflicts.length);
});
check('moderate spill has the same containment deadline',()=>{
  const a=executePlan(d,emptyState(),user,'Compliance WELL-0151 24 Sep',{operation:'compliance',wellIds:['WELL-0151'],date:'2026-09-24'});
  assert.ok(a.visualization!.rows!.some(r=>r[0]==='SR-02'&&r[1]==='Breach'));
});
check('major spill uses a two-hour reporting deadline',()=>{
  const major=structuredClone(d),w=major.wells.find(w=>w.metadata.asset_id==='WELL-0001')!,spill=w.inspections.find(i=>i.inspected_at.startsWith('2026-06-11'))!;
  spill.spill_est_volume_bbl=30;
  w.regulatoryEvents.find(e=>e.related_inspection_id===spill.inspection_id&&e.event_type==='spill_report_filed')!.hours_to_report=12;
  const a=executePlan(major,emptyState(),user,'Compliance',{operation:'compliance',wellIds:[w.metadata.asset_id],date:'2026-06-11'});
  assert.ok(a.visualization!.rows!.some(r=>r[0]==='SR-01'&&r[1]==='Breach'&&/2-hour/.test(r[2])));
});
check('unknown well cannot substitute an existing well',()=>assert.deepEqual(run('Is WELL-9999 producing oil?').referencedWellIds,[]));
check('explicit inclusive window counts both weekly readings',()=>{
  const a=executePlan(d,emptyState(),user,'downtime',{operation:'downtime',wellIds:['WELL-0001'],from:'2026-10-08',to:'2026-10-15'});
  assert.match(a.answer,/14 days/);
});
check('repair costs honor a stated year without a planner year field',()=>{
  const w=d.wells.find(w=>w.metadata.asset_id==='WELL-0001')!;
  const total=w.maintenance.filter(m=>m.started_at.startsWith('2025')).reduce((sum,m)=>sum+m.cost_usd.total,0);
  const a=executePlan(d,emptyState(),user,'What were repair costs for WELL-0001 in 2025?',{operation:'costs',wellIds:[w.metadata.asset_id]});
  assert.ok(a.answer.includes('USD '+Math.round(total).toLocaleString('en-US')));
  assert.match(a.answer,/2025/);
});
check('expired workover is excluded while future work remains planned',()=>{
  const s=emptyState();run('FYI for everyone: WELL-0007 will be shut in from 17 Oct for a 10-day planned workover.',s);
  assert.equal(s.sharedFacts.length,1);
  const future=executePlan(d,s,user,'Is any downtime planned for WELL-0007?',{operation:'shared_knowledge',wellIds:['WELL-0007']});
  assert.match(future.answer,/Yes/);
  const later={...d,today:'2026-11-01'};
  const expired=executePlan(later,s,user,'Is any downtime planned for WELL-0007?',{operation:'shared_knowledge',wellIds:['WELL-0007']});
  assert.ok(!expired.citations.some(c=>c.id===s.sharedFacts[0].id));
  assert.ok(!expired.answer.includes('10-day planned workover'));
});
console.log('Independent engine review checks complete: '+checks+' passed. No provider calls.');
