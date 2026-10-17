/** Offline provider contract checks. Never reads .env or makes real requests.
 * Run: node --import tsx scripts/provider-check.ts
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scenario=process.argv[2];
if(!scenario){
  for(const name of ['round-robin','project-rpm','project-tpm','project-rpd','reasoning-fallback','expired-deadline','queue','timeout']){
    const result=spawnSync(process.execPath,['--import','tsx',fileURLToPath(import.meta.url),name],{encoding:'utf8'});
    assert.equal(result.status,0,result.stdout+result.stderr);process.stdout.write(result.stdout);
  }
}else{
  const a=randomUUID(),b=randomUUID();
  process.env.GEMINI_API_KEY=a;
  process.env.GEMINI_API_KEYS=scenario==='round-robin'?a+','+b:JSON.stringify([{key:a,projectId:'same'},{key:b,projectId:'same'}]);
  process.env.GEMINI_MODEL='gemini-3.5-flash-lite';process.env.GEMINI_REASONING_MODEL='gemini-3.8-flash';
  process.env.GEMINI_RPM=scenario==='project-rpm'?'2':'10';
  process.env.GEMINI_TPM=scenario==='project-tpm'?'2200':'20000';
  process.env.GEMINI_RPD=scenario==='project-rpd'?'2':'100';
  let calls:{key:string;url:string}[]=[],active=0,maxActive=0;
  globalThis.fetch=(async (url:any,options:any)=>{
    const key=options.headers['x-goog-api-key'];calls.push({key,url:String(url)});
    assert(!String(url).includes(key));
    const config=JSON.parse(options.body).generationConfig;
    assert.equal(config.responseMimeType,'application/json');assert(config.responseJsonSchema);
    if(scenario==='timeout')return await new Promise<Response>((_,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('fake timeout')),{once:true}));
    if(scenario==='queue'){active++;maxActive=Math.max(maxActive,active);await new Promise(resolve=>setTimeout(resolve,20));active--;}
    if(scenario==='round-robin'&&key===a)return new Response(JSON.stringify({error:{message:'Quota exhausted'}}),{status:429,headers:{'retry-after':'60'}});
    if(scenario==='reasoning-fallback'&&String(url).includes('3.8'))return new Response('{}',{status:503});
    return new Response(JSON.stringify({usageMetadata:{totalTokenCount:scenario==='project-tpm'?2200:10},candidates:[{finishReason:'STOP',content:{parts:[{text:'{"operation":"search"}'}]}}]}),{status:200});
  }) as typeof fetch;
  const {generateStructured,providerStatus,ProviderError}=await import('../server/gemini');
  const request={system:'fake instructions',prompt:'fake question',schema:{type:'object',properties:{operation:{type:'string'}}}};
  assert.equal(providerStatus().keyCount,2);
  assert.equal(providerStatus().projectCount,scenario==='round-robin'?2:1);
  if(scenario==='round-robin'){
    await generateStructured(request);assert.deepEqual(calls.map(c=>c.key),[a,b]);
    assert.equal(providerStatus().healthyKeys,1);assert.equal(providerStatus().cooldownKeys,1);
    await generateStructured(request);assert.deepEqual(calls.map(c=>c.key),[a,b,b]);
    assert(!JSON.stringify(providerStatus()).includes(a));assert(!JSON.stringify(providerStatus()).includes(b));
  }else if(scenario==='reasoning-fallback'){
    assert.equal((await generateStructured({...request,reasoning:true})).model,'gemini-3.5-flash-lite');assert.equal(calls.length,2);
    await generateStructured({...request,reasoning:true});assert.equal(calls.length,3);assert(calls[2].url.includes('3.5'));
  }else if(scenario==='expired-deadline'){
    await assert.rejects(generateStructured({...request,deadline:Date.now()-1}),e=>e instanceof ProviderError&&e.reason==='timeout');assert.equal(calls.length,0);
  }else if(scenario==='queue'){
    await Promise.all([generateStructured(request),generateStructured(request),generateStructured(request)]);
    assert.equal(calls.length,3);assert.equal(maxActive,1);assert.equal(providerStatus().busyProjects,0);
  }else if(scenario==='timeout'){
    await assert.rejects(generateStructured({...request,deadline:Date.now()+50}),e=>e instanceof ProviderError&&e.reason==='timeout');
    assert.equal(calls.length,1);assert.equal(providerStatus().busyProjects,0);
  }else{
    const expected=scenario==='project-tpm'?1:2;
    for(let i=0;i<expected;i++)await generateStructured(request);
    await assert.rejects(generateStructured({...request,deadline:Date.now()+50}),e=>e instanceof ProviderError&&e.reason==='rate_limited');
    assert.equal(calls.length,expected);assert.equal(providerStatus().availableKeys,0);
    if(scenario==='project-tpm')assert.equal(providerStatus().estimatedTokensLastMinute,2200);
    if(scenario==='project-rpd'){
      assert.equal(providerStatus().requestsToday,2);assert(providerStatus().dailyResetAt);
      const originalNow=Date.now,afterReset=Date.parse(providerStatus().dailyResetAt!)+1000;
      try{Date.now=()=>afterReset;assert.equal(providerStatus().requestsToday,0);await generateStructured(request);assert.equal(providerStatus().requestsToday,1);}finally{Date.now=originalNow;}
    }
  }
  console.log('PASS '+scenario);
}
