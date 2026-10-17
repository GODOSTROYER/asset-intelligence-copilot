import assert from 'node:assert/strict';
import {spawn, type ChildProcess} from 'node:child_process';
import {mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const appDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sample=(process.env.SAMPLE_DATA_PATH||path.resolve(appDir,'../../sample-data'));
const temporary=await mkdtemp(path.join(os.tmpdir(),'asset-copilot-api-check-'));
const stateDir=path.join(temporary,'state');
const base='http://127.0.0.1:4180';
let child:ChildProcess|undefined;
let checks=0;
const check=async(name:string,fn:()=>Promise<void>|void)=>{await fn();checks++;console.log('PASS '+name);};
async function request(route:string,body?:unknown,headers:Record<string,string>={}){
  const response=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
  const data=await response.json();return {status:response.status,data};
}
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
async function start(){
  const probe=await fetch(base+'/api/health',{signal:AbortSignal.timeout(600)}).catch(()=>undefined);
  assert.equal(probe,undefined,'Port 4180 is occupied; refusing to interact with another service.');
  child=spawn(process.execPath,[path.join(appDir,'node_modules/tsx/dist/cli.mjs'),path.join(appDir,'server/index.ts')],{
    cwd:appDir,env:{...process.env,PORT:'4180',COPILOT_STATE_DIR:stateDir,SAMPLE_DATA_PATH:sample,REFERENCE_DATE:'2026-10-16',COPILOT_SKIP_ENV_FILES:'1',GEMINI_API_KEY:'',GEMINI_API_KEYS:''},stdio:['ignore','ignore','pipe'],windowsHide:true
  });
  let stderr='';child.stderr?.on('data',chunk=>{stderr+=String(chunk).slice(0,1000);});
  for(let attempt=0;attempt<100;attempt++){
    if(child.exitCode!==null)throw new Error('Isolated server exited before readiness; exit '+child.exitCode+'. '+stderr);
    const health=await request('/api/health').catch(()=>undefined);
    if(health?.status===200){assert.equal(health.data.provider.configured,false,'Offline checks require zero configured provider credentials.');return;}
    await sleep(100);
  }
  throw new Error('Isolated server did not become ready.');
}
async function stop(){
  if(!child)return;
  const active=child;child=undefined;
  if(active.exitCode!==null)return;
  const exited=once(active,'exit');active.kill();
  await Promise.race([exited,sleep(5000).then(()=>{if(active.exitCode===null)throw new Error('Spawned server did not stop.');})]);
}
try{
  await start();
  const bootstrap=(await request('/api/bootstrap')).data;
  const michael=bootstrap.users.find((u:any)=>u.name==='Michael Turner')!.id;
  const jessica=bootstrap.users.find((u:any)=>u.name==='Jessica Reed')!.id;
  const chat=(userId:string,text:string)=>request('/api/chat',{userId,text});
  await check('invalid user and foreign origin reject before writes',async()=>{
    assert.equal((await chat('UNKNOWN','Is WELL-0001 producing oil?')).status,400);
    assert.equal((await request('/api/chat',{userId:michael,text:'Is WELL-0001 producing oil?'},{origin:'https://foreign.example'})).status,403);
    assert.equal((await request('/api/history?userId='+michael)).data.history.length,0);
  });
  await check('concurrent questions atomically persist complete private histories',async()=>{
    const results=await Promise.all([chat(michael,'Is WELL-0001 producing oil right now?'),chat(michael,'How many days was WELL-0001 down in 2025?'),chat(jessica,'Is WELL-0151 producing oil right now?')]);
    for(const r of results){assert.equal(r.status,200);assert.equal(r.data.response.model.status,'fallback');assert.equal(r.data.response.model.reason,'not_configured');}
    const mh=(await request('/api/history?userId='+michael)).data.history,jh=(await request('/api/history?userId='+jessica)).data.history;
    assert.equal(mh.length,2);assert.equal(jh.length,1);assert.ok(mh.every((h:any)=>!h.userText.includes('WELL-0151')));assert.ok(jh.every((h:any)=>h.userText.includes('WELL-0151')));
    const saved=JSON.parse(await readFile(path.join(stateDir,'state.json'),'utf8'));
    assert.equal(saved.history[michael].length,2);assert.equal(saved.history[jessica].length,1);
    assert.ok(mh[0].response.citations.length);assert.ok(mh[0].response.visualization);
  });
  let correctedId='';
  await check('correction audit preserves raw inspection source',async()=>{
    const rawFile=path.join(sample,'assets/WELL-0164/inspections.jsonl');
    const before=createHash('sha256').update(await readFile(rawFile)).digest('hex');
    const correction=await chat(michael,'The 15 Oct reading for WELL-0164 is wrong. The handheld thermal gun used in that inspection was faulty; the field crew re-measured the wellhead at 41.0 C.');
    assert.equal(correction.status,200);
    const memory=(await request('/api/memory?userId='+jessica)).data;
    assert.equal(memory.corrections.length,1);const c=memory.corrections[0];correctedId=c.id;
    assert.equal(c.originalValue,24);assert.equal(c.correctedValue,41);assert.equal(c.authorUserId,michael);assert.equal(c.inspectionId,'INS-0164-0205');
    assert.equal(memory.privateHistory.length,1);
    const raw=(await request('/api/evidence?id=INS-0164-0205&type=inspection')).data;
    assert.equal(JSON.parse(raw.content).wellhead_temp_c,24);
    const audit=(await request('/api/evidence?id='+correctedId+'&type=correction')).data;
    assert.equal(JSON.parse(audit.content).correctedValue,41);
    assert.equal(createHash('sha256').update(await readFile(rawFile)).digest('hex'),before);
  });
  await check('evidence resolves repair and report by exact type',async()=>{
    const record=await request('/api/evidence?id=MNT-0001-028&type=repair');
    const report=await request('/api/evidence?id=MNT-0001-028&type=repair%20report');
    assert.equal(record.status,200);assert.equal(report.status,200);
    assert.equal(record.data.type,'repair');assert.equal(report.data.type,'repair report');assert.notEqual(record.data.content,report.data.content);
    assert.equal((await request('/api/evidence?id=MNT-0001-028&type=inspection')).status,404);
  });
  await check('blank import date preserves an explicit evaluation reference',async()=>{
    assert.equal((await request('/api/dataset/load',{path:sample,today:'2026-10-18'})).status,200);
    const blank=await request('/api/dataset/load',{path:sample});
    assert.equal(blank.status,200);assert.equal(blank.data.stats.today,'2026-10-18');
  });
  await check('malformed import leaves dataset and saved state unchanged',async()=>{
    const bad=path.join(temporary,'malformed');
    await mkdir(path.join(bad,'fleet'),{recursive:true});await mkdir(path.join(bad,'assets/WELL-0999'),{recursive:true});
    await writeFile(path.join(bad,'fleet/areas.json'),JSON.stringify({areas:[]}));await writeFile(path.join(bad,'fleet/users.json'),JSON.stringify({users:[{user_id:'TEST-USER'}]}));
    await writeFile(path.join(bad,'assets/WELL-0999/metadata.json'),JSON.stringify({asset_id:'WELL-0999',well_type:'T200'}));await writeFile(path.join(bad,'assets/WELL-0999/inspections.jsonl'),'{broken');
    const before=(await request('/api/bootstrap')).data,stateBefore=await readFile(path.join(stateDir,'state.json'),'utf8');
    assert.equal((await request('/api/dataset/load',{path:bad})).status,400);
    const after=(await request('/api/bootstrap')).data;
    assert.deepEqual(after.stats,before.stats);assert.deepEqual(after.loadedRoots,before.loadedRoots);assert.equal(after.revision,before.revision);
    assert.equal(await readFile(path.join(stateDir,'state.json'),'utf8'),stateBefore);
  });
  await check('restart restores rich private answers and shared corrections',async()=>{
    const before=(await request('/api/history?userId='+michael)).data.history;
    await stop();await start();
    assert.equal((await request('/api/bootstrap')).data.stats.today,'2026-10-18');
    const restored=(await request('/api/history?userId='+michael)).data.history;
    assert.deepEqual(restored,before);assert.ok(restored[0].response.citations.length);assert.ok(restored[0].response.visualization);
    const memory=(await request('/api/memory?userId='+jessica)).data;
    assert.equal(memory.corrections[0].id,correctedId);assert.equal(memory.privateHistory.length,1);
    const answer=await chat(jessica,'Is WELL-0164 producing oil right now?');
    assert.equal(answer.status,200);assert.match(answer.data.response.answer,/Yes/);assert.match(answer.data.response.answer,/Michael Turner/);assert.ok(answer.data.response.conflicts.length);
  });
  console.log('Isolated API checks complete: '+checks+' passed. No provider calls.');
}finally{
  await stop();
  const resolved=path.resolve(temporary),relative=path.relative(path.resolve(os.tmpdir()),resolved);
  assert.ok(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative)&&path.basename(resolved).startsWith('asset-copilot-api-check-'));
  await rm(resolved,{recursive:true,force:true});
}
