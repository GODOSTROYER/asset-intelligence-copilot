/** Hosted Gemini only. Keys and upstream error bodies never leave this module. */
type TokenUse={at:number;tokens:number};
type Project = { starts:number[]; tokens:TokenUse[]; dailyRequests:number;dayResetAt:number;busy:boolean; cooldownUntil:number; disabled:boolean };
type KeySlot = { key:string; project:Project };
export type ProviderReason = 'not_configured' | 'rate_limited' | 'credentials_rejected' | 'timeout' | 'unavailable' | 'invalid_response' | 'invalid_plan';
type ProviderDiagnostic='finish_reason'|'empty_content'|'json_parse'|'citation_ids'|'citation_markers'|'numeric_tokens'|'well_ids'|'protocol_ids';
export class ProviderError extends Error {
  constructor(public reason:ProviderReason,public diagnostic?:ProviderDiagnostic) { super(reason); this.name='ProviderError'; }
}
type Config = { slots:KeySlot[]; model:string; reasoningModel?:string; rpm:number;tpm:number;rpd:number;timeoutMs:number };
let config:Config|undefined;
let cursor=0;
const modelCooldown=new Map<string,number>();
const numberEnv=(name:string,fallback:number,min:number,max:number)=>{
  const n=Number(process.env[name]);return Number.isFinite(n)&&n>=min?Math.min(max,Math.floor(n)):fallback;
};
const modelName=(value:string|undefined,fallback?:string)=>value&&/^[a-zA-Z0-9._-]{1,100}$/.test(value)?value:fallback;
function settings():Config {
  if(config)return config;
  const raw=process.env.GEMINI_API_KEYS?.trim()??'';
  let list:any[]=[];
  try { list=raw.startsWith('[')?JSON.parse(raw):raw.split(/[,\r\n]+/).filter(Boolean); } catch { list=[]; }
  if(!Array.isArray(list))list=[];
  // Prefer explicit project metadata over the duplicate primary-key shortcut.
  if(process.env.GEMINI_API_KEY)list.push(process.env.GEMINI_API_KEY);
  const projects=new Map<string,Project>(),seen=new Set<string>(),slots:KeySlot[]=[];
  for(const item of list){
    const rawKey=typeof item==='string'?item:item?.key;
    if(typeof rawKey!=='string')continue;
    const key=rawKey.trim();
    if(!key||seen.has(key))continue;
    seen.add(key);
    // Strings are independent projects, as confirmed by this deployment's owner.
    // Object entries can share a projectId to enforce project-wide limits.
    const projectId=typeof item==='object'&&typeof item.projectId==='string'?item.projectId:'independent-'+slots.length;
    let project=projects.get(projectId);
    if(!project){project={starts:[],tokens:[],dailyRequests:0,dayResetAt:nextPacificMidnight(Date.now()),busy:false,cooldownUntil:0,disabled:false};projects.set(projectId,project);}
    slots.push({key,project});
  }
  config={slots,model:modelName(process.env.GEMINI_MODEL,'gemini-3.5-flash-lite')!,reasoningModel:modelName(process.env.GEMINI_REASONING_MODEL),rpm:numberEnv('GEMINI_RPM',5,1,1000),tpm:numberEnv('GEMINI_TPM',20000,100,10000000),rpd:numberEnv('GEMINI_RPD',100,1,1000000),timeoutMs:numberEnv('GEMINI_TIMEOUT_MS',25000,1000,60000)};
  return config;
}
export function providerStatus(){
  const c=settings(),now=Date.now(),projects=[...new Set(c.slots.map(s=>s.project))];
  const healthy=c.slots.filter(s=>!s.project.disabled&&s.project.cooldownUntil<=now).length;
  for(const p of projects)refresh(p,now);
  const available=c.slots.filter(s=>!s.project.disabled&&!s.project.busy&&s.project.cooldownUntil<=now&&s.project.starts.length<c.rpm&&s.project.dailyRequests<c.rpd&&tokenTotal(s.project)<c.tpm).length;
  const next=projects.filter(p=>!p.disabled).map(p=>Math.max(p.cooldownUntil,p.starts.length>=c.rpm?p.starts[0]+60001:0,p.dailyRequests>=c.rpd?p.dayResetAt:0,tokenTotal(p)>=c.tpm?p.tokens[0].at+60001:0)).filter(t=>t>now);
  return {provider:'gemini',configured:c.slots.length>0,model:c.model,reasoningModel:c.reasoningModel??null,
    status:!c.slots.length?'not_configured':available?'ready':healthy?'queued':projects.every(p=>p.disabled)?'credentials_rejected':'cooldown',keyCount:c.slots.length,projectCount:projects.length,
    healthyKeys:healthy,availableKeys:available,cooldownKeys:c.slots.filter(s=>!s.project.disabled&&s.project.cooldownUntil>now).length,
    disabledKeys:c.slots.filter(s=>s.project.disabled).length,busyProjects:projects.filter(p=>p.busy).length,
    rpmPerProject:c.rpm,tpmPerProject:c.tpm,rpdPerProject:c.rpd,limitSource:'Application caps; actual Google project quotas may differ.',
    estimatedTokensLastMinute:projects.reduce((sum,p)=>sum+tokenTotal(p),0),requestsToday:projects.reduce((sum,p)=>sum+p.dailyRequests,0),
    dailyResetAt:projects.length?new Date(Math.min(...projects.map(p=>p.dayResetAt))).toISOString():null,
    timeoutMs:c.timeoutMs,maxAttempts:2,nextRetryAt:next.length?new Date(Math.min(...next)).toISOString():null};
}
// Gemini daily quotas reset at midnight America/Los_Angeles, including DST.
function nextPacificMidnight(now:number){
  const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'});
  const label=(time:number)=>fmt.format(new Date(time));
  const current=label(now);let lo=now,hi=now+27*3600000;
  while(hi-lo>1000){const mid=Math.floor((lo+hi)/2);if(label(mid)===current)lo=mid;else hi=mid;}
  return hi+1000;
}
function refresh(p:Project,now:number){
  p.starts=p.starts.filter(t=>t>now-60000);p.tokens=p.tokens.filter(t=>t.at>now-60000);
  if(now>=p.dayResetAt){p.dailyRequests=0;p.dayResetAt=nextPacificMidnight(now);}
}
function tokenTotal(p:Project){return p.tokens.reduce((sum,t)=>sum+t.tokens,0);}
function retryUntil(response:Response,body:any,now:number){
  const header=response.headers.get('retry-after');
  let delay=header?(Number.isFinite(Number(header))?Number(header)*1000:Date.parse(header)-now):0;
  const details=Array.isArray(body?.error?.details)?body.error.details:[];
  for(const d of details){const seconds=typeof d?.retryDelay==='string'?Number(d.retryDelay.replace(/s$/,'')):NaN;if(Number.isFinite(seconds))delay=Math.max(delay,seconds*1000);}
  // Unknown quota errors receive the conservative daily cooldown. Never probe
  // a quota-failed project repeatedly to discover whether its limit reset.
  const daily=/per.?day|daily|rpd|tokensperday|requestsperday/i.test(JSON.stringify(details)+' '+String(body?.error?.message??''));
  if(daily||!Number.isFinite(delay)||delay<=0)return nextPacificMidnight(now);
  return now+Math.max(1000,delay);
}
async function acquire(deadline:number,excluded:Set<Project>,estimatedTokens:number):Promise<{slot:KeySlot;tokenUse:TokenUse}>{
  const c=settings();if(!c.slots.length)throw new ProviderError('not_configured');
  if(estimatedTokens>c.tpm)throw new ProviderError('rate_limited');
  for(;;){
    const now=Date.now();let wait=Infinity,eligible=false;
    if(now>=deadline)throw new ProviderError('timeout');
    for(let offset=0;offset<c.slots.length;offset++){
      const idx=(cursor+offset)%c.slots.length,slot=c.slots[idx],p=slot.project;
      if(p.disabled||excluded.has(p))continue;
      refresh(p,now);
      if(p.cooldownUntil>now){wait=Math.min(wait,p.cooldownUntil-now);continue;}
      if(p.dailyRequests>=c.rpd){wait=Math.min(wait,p.dayResetAt-now);continue;}
      eligible=true;
      if(p.busy){wait=Math.min(wait,100);continue;}
      if(p.starts.length>=c.rpm){wait=Math.min(wait,p.starts[0]+60001-now);continue;}
      if(tokenTotal(p)+estimatedTokens>c.tpm){wait=Math.min(wait,p.tokens[0].at+60001-now);continue;}
      const tokenUse={at:now,tokens:estimatedTokens};
      p.busy=true;p.starts.push(now);p.tokens.push(tokenUse);p.dailyRequests++;cursor=(idx+1)%c.slots.length;return {slot,tokenUse};
    }
    const remaining=deadline-now;
    if(!eligible&&wait>remaining||remaining<=0||!Number.isFinite(wait))throw new ProviderError('rate_limited');
    if(wait>=remaining)throw new ProviderError('rate_limited');
    await new Promise(resolve=>setTimeout(resolve,Math.min(wait,200)));
  }
}
export type StructuredRequest={system:string;prompt:string;schema:Record<string,any>;reasoning?:boolean;deadline?:number;maxOutputTokens?:number};
export async function generateStructured(request:StructuredRequest):Promise<{value:unknown;model:string;durationMs:number}>{
  const start=Date.now(),c=settings(),deadline=Math.min(request.deadline??Infinity,start+c.timeoutMs);
  let model=request.reasoning&&c.reasoningModel?c.reasoningModel:c.model;
  if((modelCooldown.get(model)??0)>start)model=c.model;
  const excluded=new Set<Project>();let last:ProviderReason='unavailable';
  // Reserve approximate input + maximum output before sending. Reconcile with
  // usageMetadata when supplied. These are application caps, not quota claims.
  const estimatedTokens=Math.ceil((request.system.length+request.prompt.length+JSON.stringify(request.schema).length)/4)+(request.maxOutputTokens??1800);
  for(let attempt=0;attempt<2;attempt++){
    let lease:Awaited<ReturnType<typeof acquire>>;
    try{lease=await acquire(deadline,excluded,estimatedTokens);}catch(error){
      if(attempt>0&&error instanceof ProviderError&&error.reason==='rate_limited')throw new ProviderError(last);
      throw error;
    }
    const {slot,tokenUse}=lease,controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),Math.max(1,deadline-Date.now()));
    try{
      const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{
        method:'POST',headers:{'content-type':'application/json','x-goog-api-key':slot.key},signal:controller.signal,
        body:JSON.stringify({systemInstruction:{parts:[{text:request.system}]},contents:[{role:'user',parts:[{text:request.prompt}]}],
          generationConfig:{temperature:0,responseMimeType:'application/json',responseJsonSchema:request.schema,maxOutputTokens:request.maxOutputTokens??1800,
            ...(request.reasoning&&/^gemini-[3-9]\./.test(model)?{thinkingConfig:{thinkingLevel:'LOW'}}:{})}})
      });
      const body=await response.json().catch(()=>null);
      const actualTokens=body?.usageMetadata?.totalTokenCount;
      if(Number.isFinite(actualTokens)&&actualTokens>=0)tokenUse.tokens=actualTokens;
      if(!response.ok){
        if(response.status===429){slot.project.cooldownUntil=retryUntil(response,body,Date.now());excluded.add(slot.project);last='rate_limited';continue;}
        if(response.status===401||response.status===403){slot.project.disabled=true;excluded.add(slot.project);last='credentials_rejected';continue;}
        if(response.status===404||response.status===503){
          modelCooldown.set(model,Date.now()+60000);last='unavailable';
          const fallback=modelName(process.env.GEMINI_FALLBACK_MODEL,model!==c.model?c.model:undefined);
          if(fallback&&fallback!==model){model=fallback;continue;}
          // No useful alternate model: one bounded failure, no request storm.
          throw new ProviderError(last);
        }
        throw new ProviderError(response.status>=500?'unavailable':'invalid_response');
      }
      const candidate=body?.candidates?.[0];
      if(candidate?.finishReason&&candidate.finishReason!=='STOP')throw new ProviderError('invalid_response','finish_reason');
      const content=candidate?.content?.parts?.filter((p:any)=>typeof p.text==='string'&&!p.thought).map((p:any)=>p.text).join('');
      if(!content||content.length>60000)throw new ProviderError('invalid_response','empty_content');
      let value:unknown;try{value=JSON.parse(content);}catch{throw new ProviderError('invalid_response','json_parse');}
      return {value,model,durationMs:Date.now()-start};
    }catch(error){
      if(error instanceof ProviderError)throw error;
      throw new ProviderError(controller.signal.aborted?'timeout':'unavailable');
    }finally{clearTimeout(timer);slot.project.busy=false;}
  }
  throw new ProviderError(last);
}
