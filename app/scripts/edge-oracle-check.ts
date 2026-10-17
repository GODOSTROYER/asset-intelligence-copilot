import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadDataset,type Dataset,type WellData,type RecordLike,type EvidenceDoc} from '../server/data';
import {executePlan,answerQuestion,emptyState,type Answer,type CopilotState} from '../server/engine';
import type {QueryPlan} from '../server/plan';

// Independent oracle: literals below are controlled fixture inputs. Expected answers
// never call engine classification, date, correction, retrieval, or arithmetic helpers.
const sourceRoot=(process.env.SAMPLE_DATA_PATH||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../sample-data'));
const d=await loadDataset([sourceRoot],'2026-10-16');
const rawMeta=JSON.parse(await readFile(path.join(sourceRoot,'assets/WELL-0001/metadata.json'),'utf8'));
const user='U-201',other='U-202',id='WELL-9901',id2='WELL-9902';
const inspection=(overrides:RecordLike={}):RecordLike=>({asset_id:id,inspection_id:'INS-9901-0001',inspected_at:'2026-10-15T08:00:00Z',wellhead_temp_c:30,ambient_temp_c:20,spill_detected:false,spill_est_volume_bbl:0,inspector_user_id:user,method:'drone',notes:'',...overrides});
const job=(overrides:RecordLike={}):RecordLike=>({asset_id:id,maintenance_id:'MNT-9901-001',started_at:'2026-10-15T09:00:00Z',completed_at:'2026-10-15T12:00:00Z',maintenance_type:'corrective',equipment_kind:'flowline',issue:'Fixture repair',action_taken:'Repaired',cost_usd:{total:100},...overrides});
const well=(overrides:Partial<WellData>={}):WellData=>({metadata:{...rawMeta,asset_id:id,name:'Independent fixture',area_id:'SW-23',well_type:'T200'},inspections:[inspection()],maintenance:[],regulatoryEvents:[],context:[],...overrides});
const doc=(rid:string,content:string,type='repair report',assetId=id):EvidenceDoc=>({id:rid,type,title:'Independent fixture '+rid,path:'fixture/'+assetId+'/'+rid,assetId,content});
const fixture=(wells:WellData[]=[well()],extras:EvidenceDoc[]=[]):Dataset=>({...d,wells,documents:[...d.documents.filter(x=>!x.assetId),...wells.flatMap(w=>w.inspections.map(i=>doc(i.inspection_id,JSON.stringify(i),'inspection',w.metadata.asset_id))),...extras]});
const ask=(p:QueryPlan,fd=fixture(),state=emptyState(),uid=user,q='Compute fixture result.'):Answer=>executePlan(fd,state,uid,q,p);
const data=(a:Answer)=>a.visualization?.data??[];
const rows=(a:Answer)=>a.visualization?.rows??[];
const status=(fd:Dataset,state=emptyState(),uid=user)=>ask({operation:'status',wellIds:[id]},fd,state,uid);
const correct=(fd:Dataset,state:CopilotState,field:QueryPlan['field'],value:number|boolean,uid=user)=>ask({operation:'correction',wellIds:[id],inspectionId:'INS-9901-0001',field,value,reason:'Independent field remeasurement'},fd,state,uid,'The reading is wrong; save the corrected observation.');
const tests:{name:string;run:()=>void}[]=[];
const check=(name:string,run:()=>void)=>tests.push({name,run});

check('E01 two conflicting spill corrections remain visible in later aggregates',()=>{
 const fd=fixture([well({inspections:[inspection({spill_detected:true,spill_est_volume_bbl:4})]})]),s=emptyState();
 correct(fd,s,'spill_est_volume_bbl',6);correct(fd,s,'spill_est_volume_bbl',8,other);
 const a=ask({operation:'spills',wellIds:[id],year:2026,visual:'table'},fd,s,other);
 assert.equal(rows(a)[0][2],8);assert.equal(s.corrections.length,2);assert.ok(s.corrections.every(c=>c.originalValue===4));assert.ok(a.conflicts.some(c=>/corrections disagree/i.test(c)));assert.equal(fd.wells[0].inspections[0].spill_est_volume_bbl,4);
});
check('E02 separate ambient and head corrections compose across users',()=>{
 const fd=fixture(),s=emptyState();correct(fd,s,'wellhead_temp_c',42);correct(fd,s,'ambient_temp_c',35,other);
 const a=status(fd,s,other);assert.equal(data(a)[0].delta,7);assert.equal(data(a)[0].status,'Not producing');assert.equal(a.citations.filter(c=>c.type==='correction').length,2);
});
check('E03 correction survives conflicting second correction and then reversal',()=>{
 const fd=fixture(),s=emptyState();correct(fd,s,'wellhead_temp_c',40);correct(fd,s,'wellhead_temp_c',22,other);correct(fd,s,'wellhead_temp_c',40);
 assert.equal(data(status(fd,s,other))[0].head,40);assert.equal(s.corrections.length,3);assert.ok(status(fd,s).conflicts.some(c=>/22/.test(c)&&/40/.test(c)));
});
for(const [n,text] of [
 ['E04','The well is producing when wellhead temperature is at least 12 °C higher than ambient temperature.'],
 ['E05','Production requires a wellhead-to-ambient temperature difference of at least 12 °C.'],
 ['E06','Classify as producing if wellhead temperature minus ambient temperature is >= 12 °C.'],
] as const)check(n+' independently worded new manual threshold',()=>{
 const fd=fixture([well({inspections:[inspection({wellhead_temp_c:32})]})]);fd.manuals={...fd.manuals,T200:doc('OM-T200',text,'operating manual')};
 assert.equal(data(status(fd))[0].status,'Producing');assert.equal(data(status(fd))[0].threshold,12);
});
check('E07 unparseable manual explicitly refuses classification',()=>{
 const fd=fixture();fd.manuals={T200:doc('OM-T200','Temperature rule is unavailable.','operating manual')};assert.equal(data(status(fd))[0].status,'Unknown');assert.match(status(fd).answer,/cannot be determined/i);
});
check('E08 measured zero temperature is valid unlike missing temperature',()=>{
 const zero=fixture([well({inspections:[inspection({wellhead_temp_c:0,ambient_temp_c:-20})]})]);const missing=fixture([well({inspections:[inspection({wellhead_temp_c:null,ambient_temp_c:-20})]})]);
 assert.equal(data(status(zero))[0].status,'Producing');assert.equal(data(status(missing))[0].status,'Unknown');
});
check('E09 zero spill volume remains a known zero',()=>{
 const a=ask({operation:'spills',wellIds:[id],year:2026,visual:'table'},fixture([well({inspections:[inspection({spill_detected:true,spill_est_volume_bbl:0})]})]));assert.equal(rows(a).length,1);assert.equal(rows(a)[0][2],0);assert.doesNotMatch(a.answer,/unknown volume|unavailable volume|missing volume/i);
});
check('E10 negative raw spill volume is unknown rather than negative total',()=>{
 const a=ask({operation:'spills',wellIds:[id],year:2026,visual:'table'},fixture([well({inspections:[inspection({spill_detected:true,spill_est_volume_bbl:-2})]})]));assert.notEqual(rows(a)[0][2],-2);assert.match(a.answer,/unknown|missing|unavailable/i);
});
check('E11 negative raw job amount is excluded with incomplete subtotal',()=>{
 const a=ask({operation:'costs',wellIds:[id],year:2026,visual:'bar'},fixture([well({maintenance:[job({cost_usd:{total:-100}}),job({maintenance_id:'MNT-9901-002',cost_usd:{total:0}})]})]));assert.equal(data(a)[0].value,0);assert.equal(data(a)[0].jobs,2);assert.equal(data(a)[0].partial,true);assert.match(a.answer,/missing|incomplete|subtotal/i);
});
check('E12 no repairs is a known zero while missing cost is partial',()=>{
 const empty=ask({operation:'costs',wellIds:[id],year:2026,visual:'bar'}),missing=ask({operation:'costs',wellIds:[id],year:2026,visual:'bar'},fixture([well({maintenance:[job({cost_usd:{}})]})]));assert.equal(data(empty)[0].value,0);assert.equal(data(empty)[0].partial,false);assert.equal(data(missing)[0].partial,true);
});
check('E13 negative typed volume correction is rejected without mutation',()=>{const fd=fixture(),s=emptyState(),a=correct(fd,s,'spill_est_volume_bbl',-2);assert.equal(s.corrections.length,0);assert.match(a.answer,/invalid|range/i);});
check('E14 negative natural language volume never becomes positive correction',()=>{
 const fd=fixture(),s=emptyState(),a=answerQuestion(fd,s,user,'The spill reading for WELL-9901 is wrong; correct it to -2 bbl.');assert.equal(s.corrections.length,0);assert.match(a.answer,/invalid|range|negative|cannot/i);
});
check('E15 negative ambient correction is valid physical input',()=>{const fd=fixture(),s=emptyState();correct(fd,s,'ambient_temp_c',-5);assert.equal(s.corrections[0].correctedValue,-5);assert.equal(data(status(fd,s))[0].delta,35);});
check('E16 equal downtime ties use stable well ID order independent of source order',()=>{
 const w2=well({metadata:{...well().metadata,asset_id:id2},inspections:[inspection({asset_id:id2,inspection_id:'INS-9902-0001',wellhead_temp_c:21})]}),w1=well({inspections:[inspection({wellhead_temp_c:21})]});
 const a=ask({operation:'downtime_ranking',areaId:'SW-23',from:'2026-10-01',to:'2026-10-16',topK:2,visual:'bar'},fixture([w2,w1]));assert.deepEqual(data(a).map(x=>[x.assetId,x.value]),[[id,7],[id2,7]]);
});
check('E17 range includes both UTC date boundaries and excludes adjacent days',()=>{
 const times=['2026-09-30T23:59:59Z','2026-10-01T00:00:00Z','2026-10-15T23:59:59Z','2026-10-16T00:00:00Z'];const fd=fixture([well({inspections:times.map((t,n)=>inspection({inspection_id:'INS-9901-'+n,inspected_at:t,wellhead_temp_c:21}))})]);assert.equal(data(ask({operation:'downtime',wellIds:[id],from:'2026-10-01',to:'2026-10-15',visual:'bar'},fd))[0].value,14);
});
check('E18 repair costs use start date even if completion falls in period',()=>{
 const fd=fixture([well({maintenance:[job({started_at:'2026-09-30T23:59:59Z',completed_at:'2026-10-02'}),job({maintenance_id:'MNT-9901-002',started_at:'2026-10-15T23:59:59Z',completed_at:'2026-11-01',cost_usd:{total:7}})]})]);assert.equal(data(ask({operation:'costs',wellIds:[id],from:'2026-10-01',to:'2026-10-15',visual:'bar'},fd))[0].value,7);
});
check('E19 future inspections cannot replace latest as-of observation',()=>{
 const fd=fixture([well({inspections:[inspection({wellhead_temp_c:21}),inspection({inspection_id:'INS-9901-0002',inspected_at:'2026-10-17',wellhead_temp_c:60})]})]);assert.equal(data(status(fd))[0].status,'Not producing');assert.equal(data(status(fd))[0].inspectionId,'INS-9901-0001');
});
check('E20 natural language yearless date uses dataset year',()=>{
 const fd=fixture([well({inspections:[inspection({inspected_at:'2025-10-15',wellhead_temp_c:60}),inspection({inspection_id:'INS-9901-0002',wellhead_temp_c:21})]})]);const a=answerQuestion(fd,emptyState(),user,'Was WELL-9901 producing on 15 Oct?');assert.equal(data(a)[0].inspectionId,'INS-9901-0002');assert.equal(data(a)[0].status,'Not producing');
});
check('E21 historical status cannot inherit a later planned shutdown conflict',()=>{
 const fd=fixture([well({inspections:[inspection({inspected_at:'2025-10-15',wellhead_temp_c:60})]})]),s=emptyState();s.sharedFacts.push({id:'FACT-FUTURE',assetId:id,text:'WELL-9901 is not producing during planned workover',authorUserId:other,createdAt:'2026-10-01',validFrom:'2026-10-01',days:30,kind:'planned downtime'});
 const a=ask({operation:'status',wellIds:[id],date:'2025-10-15'},fd,s);assert.equal(data(a)[0].status,'Producing');assert.ok(!a.citations.some(c=>c.id==='FACT-FUTURE'));assert.ok(!a.conflicts.some(c=>/workover/.test(c)));
});
check('E22 historical area status honors selected observation date',()=>{
 const fd=fixture([well({inspections:[inspection({inspected_at:'2025-10-15',wellhead_temp_c:21}),inspection({inspection_id:'INS-9901-0002',wellhead_temp_c:60})]})]);const a=ask({operation:'area_status',areaId:'SW-23',date:'2025-10-15',visual:'table'},fd);assert.deepEqual(a.referencedWellIds,[id]);assert.match(String(rows(a)[0][5]),/2025/);
});
function containmentFixture(repairs:RecordLike[],reports:EvidenceDoc[]){return fixture([well({inspections:[inspection({spill_detected:true,spill_est_volume_bbl:7})],maintenance:repairs})],reports);}
check('E23 containment searches all linked repairs when first has no report',()=>{
 const fd=containmentFixture([job({triggered_by_inspection_id:'INS-9901-0001'}),job({maintenance_id:'MNT-9901-002',triggered_by_inspection_id:'INS-9901-0001'})],[doc('MNT-9901-002','SR-02: Spill contained after 7 hours.')]);const a=ask({operation:'containment',wellIds:[id],year:2026},fd);assert.equal(rows(a).length,1);assert.equal(rows(a)[0][4],'MNT-9901-002');assert.equal(a.visualization?.meta.coverage.missingReports,0);
});
check('E24 pressure test report cannot hide later linked containment evidence',()=>{
 const fd=containmentFixture([job({triggered_by_inspection_id:'INS-9901-0001'}),job({maintenance_id:'MNT-9901-002',triggered_by_inspection_id:'INS-9901-0001'})],[doc('MNT-9901-001','Pressure test held for 2 hours.'),doc('MNT-9901-002','SR-02: Spill contained after 6 hours.')]);const a=ask({operation:'containment',wellIds:[id],year:2026},fd);assert.equal(rows(a).length,1);assert.ok(a.citations.some(c=>c.id==='MNT-9901-002'));
});
check('E25 conflicting containment reports disclose disagreement',()=>{
 const fd=containmentFixture([job({triggered_by_inspection_id:'INS-9901-0001'}),job({maintenance_id:'MNT-9901-002',triggered_by_inspection_id:'INS-9901-0001'})],[doc('MNT-9901-001','SR-02: Spill contained after 2 hours.'),doc('MNT-9901-002','SR-02: Spill contained after 8 hours.')]);const a=ask({operation:'containment',wellIds:[id],year:2026},fd);assert.match(a.answer+' '+a.conflicts.join(' '),/conflict|disagree|uncertain|contradict/i);assert.ok(a.citations.some(c=>c.id==='MNT-9901-002'));
});
check('E26 containment exact four hours is compliant, next tenth is breach',()=>{
 for(const [h,count] of [[4,0],[4.1,1]]){const fd=containmentFixture([job({triggered_by_inspection_id:'INS-9901-0001'})],[doc('MNT-9901-001','SR-02: Spill contained after '+h+' hours.')]);assert.equal(rows(ask({operation:'containment',wellIds:[id],year:2026},fd)).length,count);}
});
check('E27 reused inspection ID corrections stay confined to asset',()=>{
 const w2=well({metadata:{...well().metadata,asset_id:id2},inspections:[inspection({asset_id:id2,wellhead_temp_c:21})]}),fd=fixture([well(),w2]),s=emptyState();correct(fd,s,'wellhead_temp_c',60);const a=ask({operation:'status',wellIds:[id2]},fd,s,other);assert.equal(data(a)[0].head,21);assert.ok(!a.citations.some(c=>c.type==='correction'));
});
check('E28 reused inspection ID citation selects the same asset as answer',()=>{
 const w2=well({metadata:{...well().metadata,asset_id:id2},inspections:[inspection({asset_id:id2,wellhead_temp_c:21})]}),a=ask({operation:'status',wellIds:[id2]},fixture([well(),w2]));assert.ok(a.citations.some(c=>c.type==='inspection'&&c.assetId===id2));assert.ok(!a.citations.some(c=>c.type==='inspection'&&c.assetId===id));
});
check('E29 private history resolves same IDs independently for each user',()=>{
 const fd=fixture([well(),well({metadata:{...well().metadata,asset_id:id2},inspections:[inspection({asset_id:id2})]})]),s=emptyState();s.history[user]=[{userText:'one',answer:'one',wellIds:[id],createdAt:'2026-10-15'}];s.history[other]=[{userText:'two',answer:'two',wellIds:[id2],createdAt:'2026-10-15'}];assert.deepEqual(ask({operation:'costs',resolvePrivateHistory:true,year:2026},fd,s,user,'For those wells, show repair costs.').referencedWellIds,[id]);assert.deepEqual(ask({operation:'costs',resolvePrivateHistory:true,year:2026},fd,s,other,'For those wells, show repair costs.').referencedWellIds,[id2]);
});
check('E30 private history with missing loaded well refuses whole resolution',()=>{
 const s=emptyState();s.history[user]=[{userText:'old',answer:'old',wellIds:[id,'WELL-9999'],createdAt:'2026-01-01'}];const a=ask({operation:'costs',resolvePrivateHistory:true},fixture(),s,user,'For the two wells we discussed, show repair costs.');assert.deepEqual(a.referencedWellIds,[]);assert.match(a.answer,/not present/i);
});
check('E31 date-only natural language cost query selects exact day',()=>{
 const fd=fixture([well({maintenance:[job({started_at:'2026-10-01',cost_usd:{total:7}}),job({maintenance_id:'MNT-9901-002',started_at:'2026-10-15',cost_usd:{total:90}})]})]);const a=answerQuestion(fd,emptyState(),user,'What did repairs for WELL-9901 cost on 2026-10-01?');assert.equal(data(a)[0]?.value??Number(String(rows(a)[0]?.[2]).replace(/[^0-9.]/g,'')),7);
});
check('E32 explicit old inspection selects containment outside default year',()=>{
 const fd=containmentFixture([job({triggered_by_inspection_id:'INS-9901-0001'})],[doc('MNT-9901-001','SR-02: Spill contained after 7 hours.')]);fd.wells[0].inspections[0].inspected_at='2023-03-01';const a=ask({operation:'containment',wellIds:[id],inspectionId:'INS-9901-0001'},fd);assert.equal(rows(a).length,1);
});
check('E33 correcting detection false then true retains both versions and conflict',()=>{
 const fd=fixture([well({inspections:[inspection({spill_detected:true,spill_est_volume_bbl:6})]})]),s=emptyState();correct(fd,s,'spill_detected',false);correct(fd,s,'spill_detected',true,other);const a=ask({operation:'spills',wellIds:[id],year:2026,visual:'table'},fd,s);assert.equal(rows(a).length,1);assert.ok(a.conflicts.some(c=>/corrections disagree/i.test(c)));assert.ok(s.corrections.every(c=>c.originalValue===true));
});
check('E34 natural language historical followup names preserve private user scope',()=>{
 const s=emptyState(),fd=fixture();s.history[user]=[{userText:'historic',answer:'historic',wellIds:[id],createdAt:'2026-10-15'}];const a=answerQuestion(fd,s,other,'For those wells, what did repairs cost in 2025?');assert.deepEqual(a.referencedWellIds,[]);assert.match(a.answer,/private|no matching/i);
});
check('E35 requested date is validated before saving any feedback',()=>{const fd=fixture(),s=emptyState();const a=ask({operation:'correction',wellIds:[id],date:'2026-02-30',field:'wellhead_temp_c',value:60},fd,s,user,'Save the corrected reading.');assert.match(a.answer,/invalid/i);assert.equal(s.corrections.length,0);});
check('E36 engine analytical reads leave fixtures and shared state unchanged',()=>{
 const fd=fixture(),s=emptyState(),before=JSON.stringify({fd,s});for(const operation of ['status','spills','costs','containment','downtime','rca'] as const)ask({operation,wellIds:[id],year:2026},fd,s);assert.equal(JSON.stringify({fd,s}),before);
});

const failures:{name:string;error:string}[]=[];const started=performance.now();
for(const t of tests){try{t.run();console.log('PASS '+t.name);}catch(e){const error=e instanceof Error?e.message:String(e);failures.push({name:t.name,error});console.log('FAIL '+t.name+'\n'+error);}}
console.log(JSON.stringify({suite:'independent-edge-oracle',cases:tests.length,passed:tests.length-failures.length,failed:failures.length,elapsedMs:Math.round(performance.now()-started),failures},null,2));
if(failures.length)process.exitCode=1;
