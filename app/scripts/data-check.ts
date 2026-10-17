import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDataset, validateDatasetPath } from '../server/data';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'asset-copilot-data-check-'));
let checks = 0;
const check = (name:string, run:()=>void) => { run(); checks++; console.log('PASS '+name); };
async function textFile(root:string, relative:string, value:string) {
  const file=path.join(root,relative);
  await mkdir(path.dirname(file), {recursive:true});
  await writeFile(file,value,'utf8');
}
async function jsonFile(root:string, relative:string, value:unknown) {
  await textFile(root,relative,JSON.stringify(value));
}
async function fixture(root:string, value:number, reportName:string, date:string) {
  await jsonFile(root,'fleet/areas.json',{areas:[{area_id:'AREA-1',name:'Review area'}]});
  await jsonFile(root,'fleet/users.json',{users:[{user_id:'REVIEW-USER',name:'Review user'}]});
  await textFile(root,'fleet/well-types/T200.md','A T200 well is considered producing when its wellhead temperature is at least 10 °C above ambient.');
  await jsonFile(root,'assets/WELL-0001/metadata.json',{asset_id:'WELL-0001',well_type:'T200',area_id:'AREA-1'});
  await jsonFile(root,'assets/WELL-0001/inspections.jsonl',{asset_id:'WELL-0001',inspection_id:'INS-0001-0001',inspected_at:date,ambient_temp_c:20,wellhead_temp_c:35,spill_detected:false});
  await jsonFile(root,'assets/WELL-0001/maintenance.jsonl',{asset_id:'WELL-0001',maintenance_id:'MNT-0001-0001',started_at:date,cost_usd:{total:value},report_file:reportName});
  await textFile(root,'assets/WELL-0001/'+reportName,'Review repair narrative '+value);
}
try {
  const first=path.join(temporary,'sample-data'),second=path.join(temporary,'test-data');
  await fixture(first,100,'maintenance-reports/first-name.md','2026-10-15T12:00:00Z');
  await fixture(second,200,'maintenance-reports/new-name.md','2026-10-22T12:00:00Z');
  const merged=await loadDataset([first,second], '2027-01-03');
  check('overlapping wells and records merge once',()=>{assert.equal(merged.wells.length,1);assert.equal(merged.wells[0].maintenance.length,1);assert.equal(merged.wells[0].inspections.length,1);assert.equal(merged.wells[0].maintenance[0].cost_usd.total,200);});
  check('repair record and narrative survive their shared ID',()=>{const documents=merged.documents.filter(d=>d.id==='MNT-0001-0001');assert.equal(documents.length,2);assert.deepEqual(documents.map(d=>d.type).sort(),['repair','repair report']);assert.match(documents.find(d=>d.type==='repair report')!.content,/narrative 200/);});
  check('latest source provenance points to imported root',()=>{for(const d of merged.documents.filter(d=>d.id==='MNT-0001-0001')){assert.equal(d.origin,second);assert.ok(d.path.startsWith('test-data/'));}assert.ok(merged.documents.some(d=>d.path.endsWith('/new-name.md')));});
  check('explicit evaluation reference date wins',()=>assert.equal(merged.today,'2027-01-03'));
  const inferred=await loadDataset([first,second]);
  check('reference inference follows merged latest inspection',()=>assert.equal(inferred.today,'2026-10-23'));
  const normalized=await validateDatasetPath(temporary);
  check('parent dataset folder normalizes',()=>assert.equal(normalized,first));
  await assert.rejects(loadDataset([first],'2026-02-30'),/real date/);checks++;console.log('PASS invalid calendar date rejects');
  await textFile(second,'assets/WELL-0001/inspections.jsonl','{invalid json');
  await assert.rejects(loadDataset([first,second]));checks++;console.log('PASS malformed imported JSONL rejects');
  check('failed import cannot mutate previously loaded dataset',()=>{assert.equal(merged.today,'2027-01-03');assert.equal(merged.wells[0].maintenance[0].cost_usd.total,200);});
  const sample=await loadDataset([process.env.SAMPLE_DATA_PATH||path.resolve(workspace,'../../sample-data')],'2026-10-16');
  check('full sample loads and preserves both repair source types',()=>{assert.equal(sample.wells.length,200);assert.equal(sample.today,'2026-10-16');const repair=sample.wells.flatMap(w=>w.maintenance).find(m=>m.report_file);assert.ok(repair);assert.equal(sample.documents.filter(d=>d.id===repair.maintenance_id).length,2);});
  console.log('Data checks complete: '+checks+' passed.');
} finally {
  const resolved=path.resolve(temporary),base=path.resolve(os.tmpdir()),relative=path.relative(base,resolved);
  assert.ok(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative)&&path.basename(resolved).startsWith('asset-copilot-data-check-'));
  await rm(resolved,{recursive:true,force:true});
}
