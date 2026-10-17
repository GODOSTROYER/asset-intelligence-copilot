import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, rename, writeFile, access } from 'node:fs/promises';
import { loadDataset, validateDatasetPath } from './data';
import { emptyState, type CopilotState, type HistoryEntry } from './engine';
import { runAgent } from './agent';
import { providerStatus } from './gemini';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
for (const file of process.env.COPILOT_SKIP_ENV_FILES==='1'?[]:['.env.local', '.env']) {
  try { process.loadEnvFile(path.join(appDir, file)); } catch (error:any) { if(error.code!=='ENOENT') throw error; }
}
const stateDir = path.resolve(process.env.COPILOT_STATE_DIR || path.join(appDir, '.local'));
const stateFile = path.join(stateDir, 'state.json');
const defaultData = process.env.SAMPLE_DATA_PATH ? path.resolve(process.env.SAMPLE_DATA_PATH) : path.resolve(here, '../../../sample-data');
type AppState = CopilotState & { referenceDate?:string };
let state:AppState = emptyState();
let dataset:Awaited<ReturnType<typeof loadDataset>>;
let revision = 0;
let pending = Promise.resolve();
let pendingCount = 0;

async function readState() {
  try {
    const parsed = JSON.parse(await readFile(stateFile, 'utf8'));
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Invalid persisted state');
    for (const name of ['corrections','sharedFacts','claims','typeRules','extraRoots']) {
      if (parsed[name] !== undefined && !Array.isArray(parsed[name])) throw new Error('Invalid persisted '+name);
    }
    if (parsed.history!==undefined && (!parsed.history || typeof parsed.history!=='object' || Array.isArray(parsed.history) || Object.values(parsed.history).some(value=>!Array.isArray(value)))) throw new Error('Invalid persisted history');
    state = {...emptyState(), ...parsed};
  } catch(error:any) {
    if(error.code!=='ENOENT') throw new Error('Saved state could not be loaded. Original file retained at '+stateFile);
  }
}
async function saveState(next:AppState) {
  await mkdir(stateDir, {recursive:true});
  const temp = stateFile+'.tmp';
  await writeFile(temp, JSON.stringify(next,null,2), 'utf8');
  await rename(temp, stateFile);
}
function transaction<T>(work:()=>Promise<T>):Promise<T> {
  pendingCount++;
  const result = pending.then(work);
  pending = result.then(()=>{},()=>{});
  return result.finally(()=>{pendingCount--;});
}
const api = express();
api.disable('x-powered-by');
api.use(express.json({limit:'1mb'}));
api.use('/api', (req,res,next)=>{
  res.setHeader('Cache-Control','no-store');
  const origin=req.headers.origin;
  if(origin){
    try { if(!['localhost','127.0.0.1','[::1]'].includes(new URL(origin).hostname)) return res.status(403).json({error:'This app accepts requests from its local interface.'}); }
    catch { return res.status(403).json({error:'Invalid request origin.'}); }
  }
  next();
});
const userExists=(id:string)=>dataset.users.some(u=>u.user_id===id);
const publicHistory=(id:string)=>Object.hasOwn(state.history,id)?state.history[id]:[];
const authorName=(id:string)=>dataset.users.find(u=>u.user_id===id)?.name??id;
function stats(){return {wells:dataset.wells.length,inspections:dataset.wells.reduce((n,w)=>n+w.inspections.length,0),repairs:dataset.wells.reduce((n,w)=>n+w.maintenance.length,0),sources:dataset.documents.length,today:dataset.today};}
api.get('/api/health',(_req,res)=>res.json({ok:true,mode:'hosted-gemini-with-verified-tools',provider:providerStatus(),revision}));
api.get('/api/bootstrap',(req,res)=>{
  const userId=String(req.query.userId??'');
  res.json({
    users:dataset.users.map(u=>({id:u.user_id,name:u.name,role:u.role,teamId:u.team_id})),
    areas:dataset.areas.map(a=>({id:a.area_id,name:a.name,teamId:a.team_id})),
    stats:stats(),
    sources:dataset.documents.reduce((out:Record<string,number>,d)=>{out[d.type]=(out[d.type]??0)+1;return out;},{}),
    memory:{privateEntries:publicHistory(userId).length,sharedFacts:state.sharedFacts.length,corrections:state.corrections.length,claims:state.claims.length,typeRules:state.typeRules.length},
    provider:providerStatus(),loadedRoots:dataset.roots,warnings:dataset.warnings??[],revision
  });
});
api.get('/api/history',(req,res)=>{
  const id=String(req.query.userId??'');
  if(!userExists(id)) return res.status(400).json({error:'Select a user from the dataset.'});
  res.json({userId:id,history:publicHistory(id)});
});
api.get('/api/memory',(req,res)=>{
  const id=String(req.query.userId??'');
  if(!userExists(id)) return res.status(400).json({error:'Select a user from the dataset.'});
  const attributed=(rows:any[])=>rows.map(row=>({...row,authorName:authorName(row.authorUserId)}));
  res.json({userId:id,corrections:attributed(state.corrections),sharedFacts:attributed(state.sharedFacts),claims:attributed(state.claims),typeRules:attributed(state.typeRules),privateHistory:publicHistory(id)});
});
api.get('/api/evidence',(req,res)=>{
  const id=String(req.query.id??''); const type=String(req.query.type??'');
  const matches=dataset.documents.filter(d=>d.id===id);
  const source=matches.find(d=>d.type===type)??(!type?matches[0]:undefined);
  if(source){return res.json({...source,document:source});}
  const local=[...state.corrections.map(row=>({row,type:'correction'})),...state.sharedFacts.map(row=>({row,type:'shared knowledge'})),...state.claims.map(row=>({row,type:'claim'})),...state.typeRules.map(row=>({row,type:'shared rule'}))].find(source=>source.row.id===id&&(!type||source.type===type));
  if(local){const document={id,title:'Shared audit record · '+id,type:local.type,path:'.local/state.json',content:JSON.stringify({...local.row,authorName:authorName(local.row.authorUserId)},null,2)};return res.json({...document,document});}
  return res.status(404).json({error:'Source record is not available in the loaded dataset.'});
});
api.post('/api/chat',async(req,res)=>{
  const userId=String(req.body?.userId??''); const text=String(req.body?.text??'').trim();
  if(!userExists(userId)) return res.status(400).json({error:'Select a user from the dataset.'});
  if(!text||text.length>4000) return res.status(400).json({error:'Enter a question or note between 1 and 4,000 characters.'});
  if(pendingCount>12) return res.status(429).json({error:'Several questions are queued. Please try again shortly.'});
  try {
    const result=await transaction(async()=>{
      const next:AppState=structuredClone(state);
      const response=await runAgent(dataset,next,userId,text);
      const entry:HistoryEntry & {response:typeof response}={userText:text,answer:response.answer,wellIds:response.referencedWellIds??[],createdAt:new Date().toISOString(),response};
      next.history[userId]=[...(next.history[userId]??[]),entry].slice(-80);
      await saveState(next);
      state=next; revision++;
      return {userId,response,history:next.history[userId],revision};
    });
    res.json(result);
  } catch(error:any) {
    console.error('Chat transaction failed:',error?.name??'Error');
    res.status(500).json({error:'The question could not be completed. Your saved state was retained. Please try again.'});
  }
});
api.post('/api/dataset/load',async(req,res)=>{
  const input=String(req.body?.path??'').trim();
  const reference=String(req.body?.today??'').trim();
  if(!input) return res.status(400).json({error:'Enter a dataset folder path.'});
  try {
    const result=await transaction(async()=>{
      const normalized=await validateDatasetPath(input);
      const extraRoots=Array.from(new Set([...state.extraRoots,normalized])).filter(p=>path.resolve(p)!==path.resolve(defaultData));
      const loaded=await loadDataset([defaultData,...extraRoots],reference||state.referenceDate||process.env.REFERENCE_DATE||dataset.today);
      const next={...state,extraRoots,referenceDate:loaded.today};
      await saveState(next);
      state=next;dataset=loaded;revision++;
      return {ok:true,loadedRoots:dataset.roots,stats:stats(),warnings:dataset.warnings??[],revision};
    });
    res.json(result);
  } catch(error:any) { res.status(400).json({error:String(error?.message??'Could not load that dataset.').slice(0,400)}); }
});
api.get('/api/export',(req,res)=>{
  const id=String(req.query.userId??'');
  if(!userExists(id)) return res.status(400).json({error:'Select a user from the dataset.'});
  res.setHeader('Content-Disposition','attachment; filename="copilot-results.json"');
  res.json({exportedAt:new Date().toISOString(),referenceDate:dataset.today,userId:id,history:publicHistory(id),loadedRoots:dataset.roots});
});
api.use('/api',(_req,res)=>res.status(404).json({error:'Unknown API route.'}));
api.use(express.static(path.join(appDir,'dist')));
api.get(/.*/,async(_req,res)=>{
  try { await access(path.join(appDir,'dist','index.html'));res.sendFile(path.join(appDir,'dist','index.html')); }
  catch { res.status(503).send('The interface has not been built. Run npm run dev for development, or npm run build then npm start.'); }
});
api.use((error:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(400).json({error:'Invalid request body.'}));
async function start(){
  await readState();
  dataset=await loadDataset([defaultData,...state.extraRoots],state.referenceDate||process.env.REFERENCE_DATE||'2026-10-16');
  const port=Number(process.env.PORT??4178);
  api.listen(port,'127.0.0.1',()=>console.log('Asset Intelligence Copilot ready at http://127.0.0.1:'+port+' · '+dataset.wells.length+' wells · reference '+dataset.today));
}
start().catch(error=>{console.error('Startup failed:',error.message);process.exitCode=1;});

