import assert from 'node:assert/strict';
import {spawn,type ChildProcess} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,mkdtemp,readFile,rename,rm,rmdir,stat,writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const appDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temporary=await mkdtemp(path.join(os.tmpdir(),'asset-copilot-import-memory-'));
const stateDir=path.join(temporary,'state'),stateFile=path.join(stateDir,'state.json');
const base='http://127.0.0.1:4183';
const failures:{name:string;message:string}[]=[];let passed=0;
let child:ChildProcess|undefined;
async function file(root:string,name:string,value:unknown){const target=path.join(root,name);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,typeof value==='string'?value:JSON.stringify(value),'utf8');}
const users=[{user_id:'U-901',name:'Morgan Review',role:'field_operator'},{user_id:'U-902',name:'Jordan Review',role:'field_inspector'}];
const row=(well='WELL-0901',n='0001',date='2026-10-15T12:00:00Z',head=35)=>({asset_id:well,inspection_id:'INS-'+well.slice(5)+'-'+n,inspected_at:date,inspector_user_id:'U-901',method:'manual',ambient_temp_c:20,wellhead_temp_c:head,spill_detected:false,notes:'Fixture observation'});
async function fixture(label:string,well='WELL-0901',rows=[row(well)]){
  const root=path.join(temporary,label);
  await file(root,'fleet/areas.json',{areas:[{area_id:'REVIEW-AREA',name:'Review Area'}]});await file(root,'fleet/users.json',{users});
  await file(root,'fleet/well-types/T777.md','A T777 well is considered producing only when its wellhead temperature is at least 12.5 °C above ambient. RCA after three corrective events.');
  await file(root,'assets/'+well+'/metadata.json',{asset_id:well,well_type:'T777',area_id:'REVIEW-AREA',recorded_status:'active'});
  await file(root,'assets/'+well+'/inspections.jsonl',rows.map(value=>JSON.stringify(value)).join('\n'));
  await file(root,'assets/'+well+'/maintenance.jsonl','');await file(root,'assets/'+well+'/regulatory-events.jsonl','');await file(root,'assets/'+well+'/context.jsonl','');return root;
}
const primary=await fixture('primary','WELL-0901',[row(),row('WELL-0901','0002','2026-11-01T12:00:00Z',21)]);
async function request(route:string,body?:unknown){const response=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});return {status:response.status,data:await response.json()};}
const chat=(userId:string,text:string)=>request('/api/chat',{userId,text});
const health=()=>request('/api/health');
const bootstrap=async()=>(await request('/api/bootstrap')).data;
const history=async(user:string)=>(await request('/api/history?userId='+user)).data.history;
const memory=async(user='U-901')=>(await request('/api/memory?userId='+user)).data;
const saved=()=>readFile(stateFile,'utf8');
const sleep=(milliseconds:number)=>new Promise(resolve=>setTimeout(resolve,milliseconds));
async function start(expectedFailure=false){
  assert.equal(await fetch(base+'/api/health',{signal:AbortSignal.timeout(400)}).catch(()=>undefined),undefined,'Port 4183 belongs to another service.');
  child=spawn(process.execPath,[path.join(appDir,'node_modules/tsx/dist/cli.mjs'),path.join(appDir,'server/index.ts')],{cwd:appDir,env:{...process.env,PORT:'4183',COPILOT_STATE_DIR:stateDir,SAMPLE_DATA_PATH:primary,COPILOT_SKIP_ENV_FILES:'1',GEMINI_API_KEY:'',GEMINI_API_KEYS:'',REFERENCE_DATE:''},stdio:'ignore',windowsHide:true});
  for(let i=0;i<80;i++){
    if(child.exitCode!==null){if(expectedFailure){assert.notEqual(child.exitCode,0);return;}throw new Error('Isolated child exited: '+child.exitCode);}
    const ready=await health().catch(()=>undefined);
    if(ready?.status===200){assert.equal(ready.data.provider.configured,false);if(expectedFailure)throw new Error('Malformed saved state was accepted at startup.');return;}
    await sleep(100);
  }
  throw new Error('Isolated child did not resolve startup.');
}
async function stop(){if(!child)return;const current=child;child=undefined;if(current.exitCode!==null)return;const ended=once(current,'exit');current.kill();await Promise.race([ended,sleep(5000).then(()=>{if(current.exitCode===null)throw new Error('Spawned child did not stop.');})]);}
async function check(name:string,fn:()=>Promise<void>){try{await fn();passed++;console.log('PASS '+name);}catch(error:any){failures.push({name,message:String(error.message)});console.log('FAIL '+name+': '+error.message);}}
try{
  await start();
  await check('first import without a date preserves startup evaluation date',async()=>{
    const before=await bootstrap();assert.equal(before.stats.today,'2026-10-16');
    const imported=await request('/api/dataset/load',{path:primary});assert.equal(imported.status,200);
    try{assert.equal(imported.data.stats.today,'2026-10-16');}finally{assert.equal((await request('/api/dataset/load',{path:primary,today:'2026-10-16'})).status,200);}
  });
  await check('historical reference excludes all future observations and future reference reveals them',async()=>{
    assert.equal((await request('/api/dataset/load',{path:primary,today:'2026-10-01'})).status,200);
    assert.match((await chat('U-901','Is WELL-0901 producing oil right now?')).data.response.answer,/No inspections/);
    assert.equal((await request('/api/dataset/load',{path:primary,today:'2026-11-02'})).status,200);
    const later=(await chat('U-901','Is WELL-0901 producing oil right now?')).data.response;assert.equal(later.visualization.data[0].head,21);
    assert.equal((await request('/api/dataset/load',{path:primary,today:'2026-10-16'})).status,200);
  });
  let correctionId='';
  await check('two users keep independent histories and shared correction versions',async()=>{
    const a=await chat('U-901','The 15 Oct reading for WELL-0901 is wrong; the real wellhead value is 50.0 C.');assert.equal(a.status,200);
    const b=await chat('U-902','The 15 Oct reading for WELL-0901 is wrong; the real wellhead value is 42.0 C.');assert.equal(b.status,200);
    const m=await memory();assert.equal(m.corrections.length,2);correctionId=m.corrections[0].id;assert.equal(m.corrections[0].originalValue,35);assert.equal(m.corrections[1].originalValue,35);assert.ok(b.data.response.conflicts.length);
    assert.ok((await history('U-901')).every((h:any)=>!h.userText.includes('42.0')));assert.ok((await history('U-902')).every((h:any)=>!h.userText.includes('50.0')));
  });
  await check('local correction evidence rejects a mismatched source type',async()=>{
    assert.equal((await request('/api/evidence?id='+correctionId+'&type=correction')).status,200);
    assert.equal((await request('/api/evidence?id='+correctionId+'&type=inspection')).status,404);
  });
  await check('revised raw identity retains corrections and shows changed-source conflict',async()=>{
    const before=(await memory()).corrections;
    await file(primary,'assets/WELL-0901/inspections.jsonl',[row('WELL-0901','0001','2026-10-15T12:00:00Z',45),row('WELL-0901','0002','2026-11-01T12:00:00Z',21)].map(r=>JSON.stringify(r)).join('\n'));
    assert.equal((await request('/api/dataset/load',{path:primary})).status,200);assert.deepEqual((await memory()).corrections,before);
    const answer=(await chat('U-902','Is WELL-0901 producing oil right now?')).data.response;assert.equal(answer.visualization.data[0].head,42);assert.ok(answer.conflicts.some((c:string)=>/Source data changed/.test(c)));
    const source=(await request('/api/evidence?id=INS-0901-0001&type=inspection')).data;assert.equal(JSON.parse(source.content).wellhead_temp_c,45);assert.ok(answer.citations.some((c:any)=>c.id===correctionId));
  });
  const addition=await fixture('addition','WELL-0902'),third=await fixture('third','WELL-0903');
  await check('new roots add wells and repeated imports retain one root identity',async()=>{
    assert.equal((await request('/api/dataset/load',{path:addition})).status,200);assert.equal((await request('/api/dataset/load',{path:third})).status,200);
    assert.equal((await request('/api/dataset/load',{path:addition})).status,200);const data=await bootstrap();assert.equal(data.stats.wells,3);assert.equal(data.loadedRoots.length,3);assert.equal(JSON.parse(await saved()).extraRoots.length,2);
  });
  const malformed=await fixture('malformed','WELL-0904');await file(malformed,'assets/WELL-0904/inspections.jsonl','{broken');
  await check('malformed import rejects without partial root, date or memory commit',async()=>{
    const before=await bootstrap(),bytes=await saved();assert.equal((await request('/api/dataset/load',{path:malformed,today:'2031-01-01'})).status,400);const after=await bootstrap();assert.deepEqual(after.stats,before.stats);assert.equal(after.revision,before.revision);assert.deepEqual(after.loadedRoots,before.loadedRoots);assert.equal(await saved(),bytes);
  });
  await check('duplicate identities reject atomically without replacing existing evidence',async()=>{
    const duplicate=await fixture('duplicate','WELL-0905',[row('WELL-0905'),row('WELL-0905','0001','2026-10-15T12:00:00Z',50)]),bytes=await saved(),before=await bootstrap();assert.equal((await request('/api/dataset/load',{path:duplicate})).status,400);assert.equal(await saved(),bytes);assert.equal((await bootstrap()).revision,before.revision);
  });
  await check('invalid import date leaves saved reference and roots unchanged',async()=>{const bytes=await saved();assert.equal((await request('/api/dataset/load',{path:primary,today:'2026-02-30'})).status,400);assert.equal(await saved(),bytes);});
  await check('multiuser chat and imports interleave without lost valid transactions',async()=>{
    const a=(await history('U-901')).length,b=(await history('U-902')).length,before=await bootstrap();
    const result=await Promise.all([chat('U-901','Is WELL-0902 producing oil right now?'),request('/api/dataset/load',{path:addition}),chat('U-902','Is WELL-0903 producing oil right now?'),request('/api/dataset/load',{path:malformed})]);assert.deepEqual(result.map(r=>r.status).sort(),[200,200,200,400]);assert.equal((await history('U-901')).length,a+1);assert.equal((await history('U-902')).length,b+1);const after=await bootstrap();assert.equal(after.revision,before.revision+3);assert.equal(after.stats.wells,3);assert.equal((await memory()).corrections.length,2);
  });
  await check('persistence failure commits neither candidate dataset nor state',async()=>{
    const before=await bootstrap(),bytes=await saved(),backup=path.join(stateDir,'state-original.json');await rename(stateFile,backup);await mkdir(stateFile);
    try{assert.equal((await request('/api/dataset/load',{path:third,today:'2032-01-01'})).status,400);const after=await bootstrap();assert.equal(after.revision,before.revision);assert.deepEqual(after.stats,before.stats);assert.deepEqual(after.loadedRoots,before.loadedRoots);assert.equal(await readFile(backup,'utf8'),bytes);}finally{await rmdir(stateFile);await rename(backup,stateFile);}
    assert.equal((await chat('U-901','Is WELL-0901 producing oil right now?')).status,200);
  });
  await check('reserved user IDs cannot corrupt object-keyed private memory',async()=>{
    const unsafe=await fixture('reserved-user','WELL-0906');await file(unsafe,'fleet/users.json',{users:[...users,{user_id:'__proto__',name:'Reserved identity',role:'field_operator'}]});const bytes=await saved();assert.equal((await request('/api/dataset/load',{path:unsafe})).status,400);assert.equal(await saved(),bytes);
  });
  await check('restart preserves all roots, exact reference, corrections and rich private history',async()=>{
    const a=await history('U-901'),b=await history('U-902'),m=(await memory()).corrections,prior=await bootstrap();await stop();await start();const current=await bootstrap();assert.deepEqual(current.stats,prior.stats);assert.deepEqual(current.loadedRoots,prior.loadedRoots);assert.deepEqual(await history('U-901'),a);assert.deepEqual(await history('U-902'),b);assert.deepEqual((await memory()).corrections,m);assert.ok(a.some((h:any)=>h.response?.citations?.length));
  });
  await check('malformed saved history rejects startup while retaining original bytes',async()=>{
    await stop();const good=await saved(),bad=JSON.stringify({...JSON.parse(good),history:null});await writeFile(stateFile,bad);
    try{await start(true);assert.equal(await saved(),bad);}finally{await stop();await writeFile(stateFile,good);await start();}
  });
  console.log('Import/memory adversarial summary: '+passed+' passed, '+failures.length+' failed. Isolated offline server; no cloud calls.');if(failures.length)process.exitCode=1;
}finally{
  await stop();const resolved=path.resolve(temporary),relative=path.relative(path.resolve(os.tmpdir()),resolved);assert.ok(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative)&&path.basename(resolved).startsWith('asset-copilot-import-memory-'));await rm(resolved,{recursive:true,force:true});await assert.rejects(stat(resolved),{code:'ENOENT'});
}
