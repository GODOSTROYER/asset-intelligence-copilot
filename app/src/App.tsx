import { Component, FormEvent, lazy, memo, ReactNode, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, Archive, ArrowDown, ArrowUpRight, BookOpen, Check, ChevronDown,
  ChevronRight, CircleHelp, Database, FileText, HardDrive, History, LoaderCircle,
  MapPinned, MessageSquare, Plus, Send, ShieldCheck, Sparkles, Users, X
} from "lucide-react";
import type { Bootstrap, ChatMessage, Citation, CopilotAnswer, User } from "./contracts";
import { ResultControls, usePagination } from "./ResultControls";
const VisualBlock=lazy(()=>import("./VisualBlock"));
/** Keeps a malformed visualization or a failed chunk load from blanking the whole conversation. */
class VisualBoundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error:unknown){console.error("Visualization failed to render",error);}
  render(){return this.state.failed?<div className="visual-block"><p className="visual-fallback" role="status">This data view could not be displayed. The answer text and sources above are unaffected.</p></div>:this.props.children;}
}

const EXAMPLES=[
  "Is WELL-0001 producing oil right now?",
  "Show a line chart of WELL-0001's wellhead temperature against air temperature for the last 13 weeks.",
  "Which wells in Northeast Block 8 are not producing oil right now? Show me a table.",
  "How many days was WELL-0001 down in 2025?",
  "Show a heatmap of 2026 spills by geographic area and month."
];
const roleLabel=(role:string)=>role.replaceAll("_"," ").replace(/\b\w/g,(c)=>c.toUpperCase());
const userIdOf=(u:any)=>String(u?.id??u?.user_id??u?.userId??"");
const userNameOf=(u:any)=>String(u?.name??u?.full_name??u?.displayName??userIdOf(u));
const formatTime=(s?:string)=>{if(!s)return "";const d=new Date(s);return Number.isFinite(d.getTime())?d.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"";};
const newKey=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const storedUser=()=>{try{return localStorage.getItem("asset-copilot-user");}catch{return null;}};
const rememberUser=(id:string)=>{try{localStorage.setItem("asset-copilot-user",id);}catch{/* The selected operator still works when browser storage is disabled. */}};

async function api<T=any>(url:string,options:RequestInit={}):Promise<T>{
  const response=await fetch(url,{...options,headers:{"Content-Type":"application/json",...(options.headers??{})}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body?.error??"Request failed ("+response.status+").");
  return body as T;
}
function useDialog(onClose:()=>void){
  const ref=useRef<HTMLElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    const dialog=ref.current;
    const backgrounds=Array.from(document.querySelectorAll<HTMLElement>(".left-rail, .main-workspace"));
    const previousInert=backgrounds.map((node)=>node.inert);
    backgrounds.forEach((node)=>{node.inert=true;});
    const controls=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')??[]);
    (controls()[0]??dialog)?.focus();
    const handle=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();onClose();}
      if(event.key==="Tab"){
        const items=controls(),first=items[0],last=items[items.length-1];
        if(!items.length){event.preventDefault();dialog?.focus();}
        else if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener("keydown",handle);
    return()=>{document.removeEventListener("keydown",handle);backgrounds.forEach((node,i)=>{node.inert=previousInert[i];});if(previous?.isConnected)previous.focus();};
  },[]);
  return ref;
}
function normalizeUsers(payload:any):User[]{
  return (payload?.users??[]).map((u:any)=>({id:userIdOf(u),name:userNameOf(u),role:String(u?.role??"field operator"),teamId:u?.teamId??u?.team_id})).filter((u:User)=>u.id);
}
function normalizeHistory(payload:any):ChatMessage[]{
  const source=Array.isArray(payload)?payload:(payload?.history??payload?.messages??[]);
  const out:ChatMessage[]=[];
  for(const item of source){
    if(item?.role==="user"||item?.role==="assistant"){
      out.push({id:String(item.id??newKey()),role:item.role,text:String(item.text??item.content??item.message??""),response:item.response,createdAt:item.createdAt??item.created_at});
      continue;
    }
    const question=String(item?.userText??item?.question??item?.prompt??"");
    const result=item?.response??item?.result;
    const response:CopilotAnswer|undefined=typeof result==="object"?result:undefined;
    const answerText=String(item?.answer??response?.answer??item?.assistantText??"");
    if(question)out.push({id:newKey(),role:"user",text:question,createdAt:item?.createdAt??item?.created_at});
    if(answerText)out.push({id:newKey(),role:"assistant",text:answerText,response,createdAt:item?.createdAt??item?.created_at});
  }
  return out;
}
function responseOf(payload:any):CopilotAnswer{
  const raw=payload?.response??payload?.answerData??payload;
  if(typeof raw==="string")return {answer:raw,citations:[],conflicts:[],referencedWellIds:[]};
  return {answer:String(raw?.answer??raw?.text??"The server returned no answer text."),citations:raw?.citations??[],conflicts:raw?.conflicts??[],referencedWellIds:raw?.referencedWellIds??[],memory:raw?.memory,trace:raw?.trace,model:raw?.model,durationMs:raw?.durationMs??payload?.durationMs,visualization:raw?.visualization};
}
function readableSource(content:unknown):string{
  if(content!==null&&typeof content==="object")return JSON.stringify(content,null,2);
  const text=String(content??"");
  try{
    const parsed=JSON.parse(text);
    return parsed!==null&&typeof parsed==="object"?JSON.stringify(parsed,null,2):text;
  }catch{return text;}
}

function CitationRow({citation,onOpen}:{citation:Citation;onOpen:(c:Citation)=>void}){
  return <button className="citation-row" type="button" onClick={()=>onOpen(citation)}>
    <span className={"citation-icon citation-"+String(citation.type).replaceAll(" ","-")}><FileText size={15}/></span>
    <span className="citation-copy"><strong>{citation.id||citation.title}</strong><small>{citation.title}{citation.path?" · "+citation.path:""}</small></span>
    <ChevronRight size={15} className="citation-chevron"/>
  </button>;
}
function CitationCollection({citations,onOpen}:{citations:Citation[];onOpen:(c:Citation)=>void}){
  const [query,setQuery]=useState("");
  const filtered=useMemo(()=>citations.filter((citation)=>[citation.id,citation.title,citation.type,citation.path].join(" ").toLowerCase().includes(query.toLowerCase())),[citations,query]);
  const pagination=usePagination(filtered.length);
  return <div className="citation-collection">
    {citations.length>8&&<label className="result-filter"><span className="sr-only">Filter answer sources</span><input value={query} onChange={(e)=>{setQuery(e.target.value);pagination.onPage(0);}} placeholder="Filter source ID, title or type…"/></label>}
    {citations.length>25&&<ResultControls total={filtered.length} {...pagination} label="sources"/>}
    <div className="citation-collection-rows">{filtered.slice(pagination.start,pagination.start+pagination.size).map((citation,i)=><CitationRow key={citation.type+":"+citation.id+":"+i} citation={citation} onOpen={onOpen}/>)}{filtered.length===0&&<p className="visual-empty">No sources match this filter.</p>}</div>
  </div>;
}

const MessageCard=memo(function MessageCard({message,onOpenSource}:{message:ChatMessage;onOpenSource:(c:Citation)=>void}){
  const response=message.response;
  if(message.role==="user")return <article id={"message-"+message.id} className="message message-user">
    <div className="user-message-meta"><span>You</span><time>{formatTime(message.createdAt)}</time></div>
    <div className="user-bubble">{message.text}</div>
  </article>;
  return <article id={"message-"+message.id} className="message message-assistant">
    <div className="assistant-mark"><Sparkles size={16}/></div>
    <div className="assistant-content">
      <div className="assistant-message-meta"><strong>Asset Copilot</strong><span className="answer-mode"><ShieldCheck size={12}/> Evidence-led answer</span>{formatTime(message.createdAt)&&<time>{formatTime(message.createdAt)}</time>}</div>
      <p className="answer-text">{message.text}</p>
      {response?.visualization&&<VisualBoundary><Suspense fallback={<div className="history-loading" role="status"><LoaderCircle size={16} className="spin"/>Preparing the data view…</div>}><VisualBlock visual={response.visualization}/></Suspense></VisualBoundary>}
      {response?.conflicts?.length>0&&<section className="conflict-box">
        <div className="conflict-heading"><CircleHelp size={16}/><strong>Evidence conflict</strong></div>
        {response.conflicts.map((conflict,i)=><p key={i}>{conflict}</p>)}
      </section>}
      {response?.memory?.length>0&&<div className="memory-note"><History size={14}/><span>{response.memory.join(" ")}</span></div>}
      {Array.isArray(response?.trace)&&response!.trace!.length>0&&<details className="trace-details">
        <summary><Activity size={13}/> How this answer was assembled</summary>
        <ol>{response!.trace!.map((step,i)=><li key={i}><strong>{step.tool??"Tool"}</strong><span>{step.detail??""}</span>{step.durationMs!==undefined&&<small>{step.durationMs} ms</small>}</li>)}</ol>
      </details>}
      {response?.model&&<div className="model-note"><span className={"model-dot "+(response.model.status==="hosted"||response.model.status==="cached"?"model-ready":"")}/><span>{response.model.name??"Gemini"} · {response.model.status??"configured"}{response.model.reason?" · "+response.model.reason:""}</span>{response.durationMs!==undefined&&<small>{response.durationMs} ms</small>}</div>}
      {response?.citations?.length>0&&<div className="inline-citations">
        <span className="inline-citations-label">Sources</span>
        <div className="inline-citation-list">{response.citations.slice(0,4).map((c,i)=><button type="button" key={(c.id??c.title)+i} onClick={()=>onOpenSource(c)} className="inline-citation"><FileText size={13}/><span>{c.id||c.title}</span><ArrowUpRight size={12}/></button>)}
        {response.citations.length>4&&<details className="more-sources"><summary>+{response.citations.length-4} more sources</summary><CitationCollection citations={response.citations.slice(4)} onOpen={onOpenSource}/></details>}</div>
      </div>}
    </div>
  </article>;
});

function SourceDrawer({citation,onClose}:{citation:Citation;onClose:()=>void}){
  const dialogRef=useDialog(onClose);
  const [loading,setLoading]=useState(true),[error,setError]=useState(""),[source,setSource]=useState<any>(null);
  useEffect(()=>{
    let alive=true;
    setLoading(true);setError("");setSource(null);
    const query=new URLSearchParams({id:String(citation.id??""),type:String(citation.type??"")});
    api("/api/evidence?"+query.toString()).then((data)=>{if(alive)setSource(data?.document??data?.source??data?.evidence??data);})
      .catch((e)=>{if(alive){setError(e.message);setSource(citation);}})
      .finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};
  },[citation.id,citation.type]);
  const title=source?.title??citation.title??citation.id;
  const content=source?.content??source?.text??source?.excerpt??citation.content??citation.excerpt??"No excerpt was returned for this source.";
  const displayContent=useMemo(()=>readableSource(content),[content]);
  return <div className="overlay-layer" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)onClose();}}>
    <aside ref={dialogRef} tabIndex={-1} className="drawer source-drawer" role="dialog" aria-modal="true" aria-labelledby="source-drawer-title">
      <div className="drawer-top"><div><span className="drawer-eyebrow">Evidence record</span><h2 id="source-drawer-title">{title}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close source"><X size={18}/></button></div>
      {loading?<div className="drawer-loading"><LoaderCircle className="spin" size={20}/> Loading the original source…</div>:<div className="drawer-body">
        {error&&<div className="soft-alert" role="alert">{error}{citation.excerpt?" Showing the excerpt returned with the answer.":""}</div>}
        <dl className="source-metadata"><div><dt>Record ID</dt><dd>{source?.id??citation.id}</dd></div><div><dt>Source type</dt><dd>{source?.type??citation.type}</dd></div>{(source?.path??citation.path)&&<div><dt>File</dt><dd className="source-path">{source?.path??citation.path}</dd></div>}{(source?.assetId??citation.assetId)&&<div><dt>Well</dt><dd>{source?.assetId??citation.assetId}</dd></div>}</dl>
        <section className="source-content"><h3>{error?"Citation excerpt":"Source content"}</h3><pre tabIndex={0} aria-label="Original source content">{displayContent}</pre></section>
        {source?.metadata&&<section className="source-content"><h3>Record fields</h3><pre>{JSON.stringify(source.metadata,null,2)}</pre></section>}
      </div>}
    </aside>
  </div>;
}

function MemoryDrawer({userId,userName,onClose,onCompose}:{userId:string;userName:string;onClose:()=>void;onCompose:()=>void}){
  const dialogRef=useDialog(onClose);
  const [loading,setLoading]=useState(true),[error,setError]=useState(""),[payload,setPayload]=useState<any>(null);
  const [expandedGroups,setExpandedGroups]=useState<Record<string,boolean>>({});
  useEffect(()=>{
    let alive=true;setLoading(true);setError("");
    api("/api/memory?"+new URLSearchParams({userId})).then((data)=>{if(alive)setPayload(data?.memory??data);})
      .catch((e)=>{if(alive)setError(e.message);})
      .finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};
  },[userId]);
  const groups=[
    {key:"sharedFacts",title:"Shared well knowledge",icon:<Users size={15}/>},
    {key:"corrections",title:"Corrections",icon:<Check size={15}/>},
    {key:"claims",title:"Unconfirmed claims",icon:<CircleHelp size={15}/>},
    {key:"typeRules",title:"Type-specific rules",icon:<ShieldCheck size={15}/>},
    {key:"privateHistory",title:userName+" · private memory",icon:<History size={15}/>}
  ];
  const findArray=(key:string)=>{
    const aliases:Record<string,string[]>={sharedFacts:["sharedFacts","shared_facts","facts","shared"],corrections:["corrections","feedback"],claims:["claims"],typeRules:["typeRules","type_rules","rules"],privateHistory:["privateHistory","private_history","history","conversations"]};
    for(const name of aliases[key]??[key])if(Array.isArray(payload?.[name]))return payload[name];
    return [];
  };
  return <div className="overlay-layer" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)onClose();}}>
    <aside ref={dialogRef} tabIndex={-1} className="drawer memory-drawer" role="dialog" aria-modal="true" aria-labelledby="memory-drawer-title">
      <div className="drawer-top"><div><span className="drawer-eyebrow">Knowledge layers</span><h2 id="memory-drawer-title">Memory & feedback</h2><p>Shared context reaches every user. Conversation recall stays with {userName}.</p></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close memory"><X size={18}/></button></div>
      {loading?<div className="drawer-loading"><LoaderCircle className="spin" size={20}/> Loading memory…</div>:error?<div className="drawer-body"><div className="soft-alert">{error}</div><p className="drawer-hint">Memory is read from the local copilot service and scoped to the selected user.</p></div>:<div className="drawer-body memory-groups">
        <div className="memory-compose"><p>Share a field note or correction in chat. Include the well, inspection record, updated reading and reason.</p><button type="button" className="button-secondary" onClick={onCompose}><Plus size={14}/> Write a note</button></div>
        {groups.map((group)=>{
          const entries=findArray(group.key);
          return <section className="memory-group" key={group.key}>
            <div className="memory-group-head">{group.icon}<h3>{group.title}</h3><span>{entries.length}</span></div>
            {entries.length?(expandedGroups[group.key]?entries:entries.slice(-12)).slice().reverse().map((entry:any,i)=><article className="memory-entry" key={entry.id??entry.note_id??i}>
              <p>{group.key==="corrections"?`${entry.field}: ${String(entry.originalValue)} → ${String(entry.correctedValue)}. ${entry.reason??""}`:group.key==="typeRules"?`${entry.wellType} · ${entry.equipmentKind}: RCA after ${entry.count} corrective repairs.`:entry.text??entry.userText??entry.answer??entry.value??JSON.stringify(entry)}</p>
              {group.key==="privateHistory"&&entry.answer&&<p className="memory-answer">{entry.answer}</p>}
              <small>{entry.authorName??entry.author??entry.authorUserId??entry.author_user_id??""}{(entry.assetId??entry.asset_id)&&" · "+(entry.assetId??entry.asset_id)}{entry.createdAt&&" · "+new Date(entry.createdAt).toLocaleDateString()}</small>
            </article>):<p className="memory-empty">No {group.title.toLowerCase()} saved yet.</p>}
            {entries.length>12&&<button type="button" className="memory-show-all" aria-expanded={Boolean(expandedGroups[group.key])} onClick={()=>setExpandedGroups((current)=>({...current,[group.key]:!current[group.key]}))}>{expandedGroups[group.key]?"Show latest 12":"Show all "+entries.length.toLocaleString()+" entries"}</button>}
          </section>;
        })}
      </div>}
    </aside>
  </div>;
}

function ImportDialog({onClose,onLoaded}:{onClose:()=>void;onLoaded:(info:any)=>void}){
  const [folder,setFolder]=useState(""),[today,setToday]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState("");
  const loadingRef=useRef(false);
  const close=()=>{if(!loadingRef.current)onClose();};
  const dialogRef=useDialog(close);
  async function submit(e:FormEvent){e.preventDefault();if(loadingRef.current)return;loadingRef.current=true;setLoading(true);setError("");try{
    const body:any={path:folder.trim()};if(today)body.today=today;
    const result=await api("/api/dataset/load",{method:"POST",body:JSON.stringify(body)});
    onLoaded(result);onClose();
  }catch(err:any){setError(err.message);}finally{loadingRef.current=false;setLoading(false);}}
  return <div className="overlay-layer" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)close();}}>
    <section ref={dialogRef} tabIndex={-1} className="modal-card import-modal" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="drawer-top"><div><span className="drawer-eyebrow">Local data only</span><h2 id="import-title">Add a dataset folder</h2><p>Point to a same-format folder. It will be merged with the sample data.</p></div><button className="icon-button" type="button" onClick={close} disabled={loading} aria-label="Close import"><X size={18}/></button></div>
      <form className="import-form" onSubmit={submit}>
        <label htmlFor="dataset-path">Folder path</label>
        <input id="dataset-path" value={folder} onChange={(e)=>setFolder(e.target.value)} placeholder="C:\\data\\test-dataset" required disabled={loading} autoFocus/>
        <small>Choose a folder containing fleet/ and assets/, or its parent folder.</small>
        <label htmlFor="reference-date">Reference date <span>optional</span></label>
        <input id="reference-date" type="date" value={today} onChange={(e)=>setToday(e.target.value)} disabled={loading}/>
        <small>Set a date only when the released evaluation data uses a different “today”.</small>
        {error&&<div className="error-alert" role="alert">{error}</div>}
        <div className="modal-actions"><button className="button-secondary" type="button" onClick={close} disabled={loading}>Cancel</button><button className="button-primary" type="submit" disabled={loading||!folder.trim()}>{loading?<><LoaderCircle size={15} className="spin"/> Loading folder…</>:<><HardDrive size={15}/> Load folder</>}</button></div>
      </form>
    </section>
  </div>;
}

export default function App(){
  const [bootstrap,setBootstrap]=useState<Bootstrap|null>(null);
  const [selectedUser,setSelectedUser]=useState("");
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [draft,setDraft]=useState("");
  const [sending,setSending]=useState(false);
  const [loading,setLoading]=useState(true);
  const [historyLoading,setHistoryLoading]=useState(false);
  const [error,setError]=useState("");
  const [activeTab,setActiveTab]=useState<"chat"|"sources">("chat");
  const [sourceDrawer,setSourceDrawer]=useState<Citation|null>(null);
  const [memoryOpen,setMemoryOpen]=useState(false);
  const [importOpen,setImportOpen]=useState(false);
  const [memoryRefresh,setMemoryRefresh]=useState(0);
  const [newChatActive,setNewChatActive]=useState(false);
  const [importToast,setImportToast]=useState("");
  const [restoredHistory,setRestoredHistory]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [failedQuestion,setFailedQuestion]=useState("");
  const [awayFromLatest,setAwayFromLatest]=useState(false);
  const followLatest=useRef(true);
  const requestEpoch=useRef(0);
  const listRef=useRef<HTMLDivElement>(null);
  const inputRef=useRef<HTMLTextAreaElement>(null);
  const users=bootstrap?.users??[];
  const currentUser=users.find((u)=>u.id===selectedUser);
  const currentAssistant=[...messages].reverse().find((m)=>m.role==="assistant"&&m.response);
  const citations=currentAssistant?.response?.citations??[];
  const recentQuestions=useMemo(()=>messages.filter((m)=>m.role==="user").slice(-4).reverse(),[messages]);

  const fetchBootstrap=useCallback(async(preserveUser?:string)=>{
    setLoading(true);setError("");
    try{
      const data=await api<any>("/api/bootstrap");
      const normalized:Bootstrap={...data,users:normalizeUsers(data)};
      setBootstrap(normalized);
      const stored=preserveUser??storedUser();
      const preferred=normalized.users.find((u)=>u.id===stored)??normalized.users.find((u)=>/Michael Turner/i.test(u.name))??normalized.users[0];
      if(preferred)setSelectedUser(preferred.id);
    }catch(err:any){setError(err.message??"Could not connect to the local copilot.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void fetchBootstrap();},[fetchBootstrap]);

  const loadHistory=useCallback(async(userId:string)=>{
    if(!userId)return;
    const epoch=++requestEpoch.current;
    followLatest.current=true;setAwayFromLatest(false);
    setSending(false);setMessages([]);setRestoredHistory(false);setFailedQuestion("");
    setHistoryLoading(true);
    try{
      const payload=await api<any>("/api/history?"+new URLSearchParams({userId}).toString());
      if(epoch!==requestEpoch.current)return;
      const restored=normalizeHistory(payload);
      setMessages(restored);setRestoredHistory(restored.length>0);
      setNewChatActive(false);
    }catch(err:any){
      if(epoch!==requestEpoch.current)return;
      setMessages([]);
      setError(err.message??"Could not load private history.");
    }finally{if(epoch===requestEpoch.current)setHistoryLoading(false);}
  },[]);
  useEffect(()=>{
    if(!selectedUser)return;
    rememberUser(selectedUser);
    setMessages([]);
    setNewChatActive(false);
    setSourceDrawer(null);setMemoryOpen(false);
    void loadHistory(selectedUser);
  },[selectedUser,loadHistory]);

  useEffect(()=>{
    const list=listRef.current;
    if(!list)return;
    if(!followLatest.current){setAwayFromLatest(true);return;}
    const last=messages[messages.length-1];
    const target=last?.role==="assistant"?document.getElementById("message-"+last.id):null;
    if(target)list.scrollTop+=target.getBoundingClientRect().top-list.getBoundingClientRect().top-8;
    else list.scrollTop=list.scrollHeight;
  },[messages,sending]);
  useEffect(()=>{
    if(importToast){const timer=window.setTimeout(()=>setImportToast(""),5000);return()=>window.clearTimeout(timer);}
  },[importToast]);
  useEffect(()=>{
    if(!sending){setElapsed(0);return;}
    const began=Date.now();
    const timer=window.setInterval(()=>setElapsed(Math.floor((Date.now()-began)/1000)),1000);
    return()=>window.clearInterval(timer);
  },[sending]);

  async function send(textOverride?:string){
    const text=(textOverride??draft).trim();
    if(!text||!selectedUser||sending||historyLoading||loading)return;
    const epoch=++requestEpoch.current;
    followLatest.current=true;setAwayFromLatest(false);setFailedQuestion("");
    setError("");setSending(true);setDraft("");setActiveTab("chat");setNewChatActive(false);
    const userMessage:ChatMessage={id:newKey(),role:"user",text,createdAt:new Date().toISOString()};
    setMessages((current)=>[...current,userMessage]);
    try{
      const payload=await api<any>("/api/chat",{method:"POST",body:JSON.stringify({userId:selectedUser,text})});
      if(epoch!==requestEpoch.current)return;
      const response=responseOf(payload);
      const assistantMessage:ChatMessage={id:newKey(),role:"assistant",text:response.answer,response,createdAt:new Date().toISOString()};
      setMessages((current)=>[...current,assistantMessage]);
      setMemoryRefresh((v)=>v+1);
    }catch(err:any){
      if(epoch!==requestEpoch.current)return;
      setMessages((current)=>current.filter((message)=>message.id!==userMessage.id));
      setDraft((current)=>current.trim()?current:text);setFailedQuestion(text);
      setError(err.message??"The answer request failed.");
    }finally{if(epoch===requestEpoch.current){setSending(false);inputRef.current?.focus();}}
  }
  function submit(e:FormEvent){e.preventDefault();void send();}
  function startNewChat(){
    ++requestEpoch.current;setSending(false);setHistoryLoading(false);setRestoredHistory(false);
    followLatest.current=true;setAwayFromLatest(false);setFailedQuestion("");
    setMessages([]);setDraft("");setError("");setNewChatActive(true);setActiveTab("chat");inputRef.current?.focus();
  }
  function switchUser(userId:string){
    if(userId===selectedUser)return;
    ++requestEpoch.current;setSending(false);setHistoryLoading(true);setSourceDrawer(null);setMemoryOpen(false);
    setFailedQuestion("");setAwayFromLatest(false);followLatest.current=true;
    setMessages([]);
    setDraft("");
    setError("");
    setSelectedUser(userId);
  }
  function loadedDataset(info:any){
    setBootstrap((current)=>current?{...current,stats:{...current.stats,...info?.stats},loadedRoots:info?.loadedRoots??current.loadedRoots}:current);
    void fetchBootstrap(selectedUser);
    setImportToast("Dataset loaded. "+(info?.warnings?.length?info.warnings.join(" "):"The sample and selected folder are now in scope."));
  }
  const latestStats=bootstrap?.stats;
  const rootLabel=(bootstrap?.loadedRoots?.length??0)>1?"sample + "+((bootstrap?.loadedRoots?.length??1)-1)+" imported":"sample dataset";
  function jumpToLatest(){
    const list=listRef.current;if(!list)return;
    const last=messages[messages.length-1];
    const target=last?document.getElementById("message-"+last.id):null;
    if(target)list.scrollTop+=target.getBoundingClientRect().top-list.getBoundingClientRect().top-8;
    else list.scrollTop=list.scrollHeight;
    followLatest.current=true;setAwayFromLatest(false);
  }

  return <div className="app-shell">
    <aside className="left-rail">
      <button className="brand" type="button" onClick={()=>{setActiveTab("chat");startNewChat();}} aria-label="Asset Intelligence Copilot home">
        <span className="brand-mark"><Activity size={18}/></span><span><strong>Asset Intelligence</strong><small>Copilot</small></span>
      </button>
      <div className="rail-section-label">Workspace</div>
      <nav className="primary-nav" aria-label="Main navigation">
        <button type="button" className={activeTab==="chat"?"nav-item active":"nav-item"} onClick={()=>setActiveTab("chat")}><MessageSquare size={17}/><span>Chat</span></button>
        <button type="button" className={activeTab==="sources"?"nav-item active":"nav-item"} onClick={()=>setActiveTab("sources")}><BookOpen size={17}/><span>Sources</span><span className="nav-count">{latestStats?.sources?.toLocaleString()??"—"}</span></button>
        <button type="button" className="nav-item" onClick={()=>setMemoryOpen(true)}><ShieldCheck size={17}/><span>Memory & feedback</span></button>
      </nav>
      <div className="rail-divider"/>
      <div className="recent-header"><span>Recent questions</span><History size={14}/></div>
      <div className="recent-list">
        {recentQuestions.length?recentQuestions.map((message)=><button key={message.id} className="recent-question" type="button" title={message.text} onClick={()=>{setDraft(message.text);setActiveTab("chat");inputRef.current?.focus();}}><span className="recent-dot"/><span>{message.text}</span></button>):<p className="recent-empty">Your questions will appear here.</p>}
      </div>
      <div className="rail-bottom">
        <div className="dataset-summary"><span className="dataset-icon"><Database size={15}/></span><div><strong>{latestStats?.wells?.toLocaleString()??"—"} wells</strong><small>{rootLabel}</small></div><span className={"connection-dot"+(!bootstrap?" status-muted":"")} title={bootstrap?"Dataset loaded":"Dataset not connected"}/></div>
        <button className="load-data-button" type="button" onClick={()=>setImportOpen(true)}><HardDrive size={15}/><span>Load dataset folder</span><ChevronRight size={14}/></button>
        <div className="local-mode"><span className={"local-pulse"+(!bootstrap?.provider?.configured?" status-muted":"")}/><span>{bootstrap?.provider?.configured?"Gemini · configured":"Copilot · awaiting configuration"}</span></div>
      </div>
    </aside>

    <main className="main-workspace">
      <header className="topbar">
        <div className="topbar-title">
          <span className="mobile-brand-mark"><Activity size={17}/></span>
          <div><h1>{activeTab==="chat"?"Chat with your field data":"Source library"}</h1><p>{activeTab==="chat"?"Answers grounded in inspections, repairs, manuals and field notes":"Searchable records from the loaded dataset"}</p></div>
        </div>
        <div className="topbar-actions">
          {latestStats&&<div className="dataset-chip"><span className="connection-dot"/><span>{latestStats.wells?.toLocaleString()} wells</span><span className="chip-divider"/><span>{latestStats.inspections?.toLocaleString()} inspections</span></div>}
          <button type="button" className="memory-shortcut" onClick={()=>setMemoryOpen(true)}><ShieldCheck size={15}/><span>Memory</span></button>
          <label className="user-select-wrap"><span className="sr-only">Selected operator</span><Users size={15}/><select value={selectedUser} onChange={(e)=>switchUser(e.target.value)} disabled={!users.length} aria-label="Select user">
            {users.map((user)=><option key={user.id} value={user.id}>{user.name}</option>)}
          </select><ChevronDown size={14}/></label>
        </div>
        <nav className="mobile-nav-actions" aria-label="Workspace actions"><button className="mobile-nav-button" type="button" onClick={()=>setActiveTab(activeTab==="chat"?"sources":"chat")}>{activeTab==="chat"?<BookOpen size={14}/>:<MessageSquare size={14}/>} {activeTab==="chat"?"Sources":"Chat"}</button><button className="mobile-nav-button" type="button" onClick={startNewChat}><Plus size={14}/> New chat</button><button className="mobile-nav-button" type="button" onClick={()=>void loadHistory(selectedUser)} disabled={!selectedUser||sending}><History size={14}/> History</button><button className="mobile-nav-button" type="button" onClick={()=>setImportOpen(true)}><HardDrive size={14}/> Load data</button></nav>
      </header>

      {error&&<div className="connection-alert" role="alert"><span>{error}</span><button type="button" onClick={()=>{setError("");if(!bootstrap)void fetchBootstrap();else inputRef.current?.focus();}}>{bootstrap?"Dismiss":"Retry"}</button></div>}
      {importToast&&<div className="toast" role="status"><Check size={15}/>{importToast}<button type="button" aria-label="Dismiss" onClick={()=>setImportToast("")}><X size={14}/></button></div>}

      {activeTab==="sources"?<SourcesView onOpen={setSourceDrawer} stats={latestStats} sourceCounts={bootstrap?.sources??{}}/>:
      <div className="work-area">
        <section className="conversation-column">
          {messages.length===0&&!sending&&!historyLoading?<div className="welcome-state">
            <div className="welcome-icon"><Sparkles size={20}/></div>
            <h2>Make sense of the field.</h2>
            <p>Ask a question about production, downtime, repairs, spills or compliance. Answers include the records and documents behind them.</p>
            <div className="example-grid">{EXAMPLES.map((example,i)=><button type="button" className="example-prompt" key={i} onClick={()=>void send(example)} disabled={loading||!selectedUser||historyLoading}><span>{i===0?<Activity size={15}/>:i===1?<TrendingIcon/>:i===2?<Users size={15}/>:i===3?<History size={15}/>:<MapPinned size={15}/>}</span><strong>{example}</strong><ArrowUpRight size={14}/></button>)}</div>
            <div className="welcome-foot"><span><ShieldCheck size={14}/>Evidence linked to source records</span><span><Database size={14}/>{latestStats?.wells?.toLocaleString()??"—"} wells loaded</span></div>
          </div>:<div className="conversation-scroll" ref={listRef} tabIndex={0} aria-label="Conversation" onScroll={()=>{const list=listRef.current;if(list){const last=messages[messages.length-1],target=last?document.getElementById("message-"+last.id):null;const away=last?.role==="assistant"&&target?target.getBoundingClientRect().top>list.getBoundingClientRect().top+list.clientHeight*.65:list.scrollHeight-list.scrollTop-list.clientHeight>160;followLatest.current=!away;setAwayFromLatest(away);}}}>
            {restoredHistory&&messages.length>0&&<div className="history-restored"><History size={14}/><span>Private history restored for {currentUser?.name}.</span><button type="button" onClick={startNewChat}>Start fresh</button></div>}
            {historyLoading&&messages.length===0&&<div className="history-loading"><LoaderCircle size={17} className="spin"/>Loading {currentUser?.name??"user"}’s private conversation…</div>}
            {messages.map((message)=><MessageCard key={message.id} message={message} onOpenSource={setSourceDrawer}/>)}
            {sending&&<div className="message message-assistant">
              <div className="assistant-mark"><Sparkles size={16}/></div><div className="thinking-bubble" role="status"><LoaderCircle size={16} className="spin"/><span>Waiting for the copilot’s evidence-backed response…</span><small>{elapsed}s</small></div>
            </div>}
            <div className="conversation-bottom-spacer"/>
          </div>}

          <div className="composer-wrap">
            {awayFromLatest&&messages.length>0&&<button className="jump-latest" type="button" onClick={jumpToLatest}><ArrowDown size={13}/>Jump to latest answer</button>}
            {failedQuestion&&<div className="failed-question" role="status"><span>The question could not be completed. Your text is preserved.</span><button type="button" onClick={()=>{setDraft(failedQuestion);setFailedQuestion("");inputRef.current?.focus();}}>Edit failed question</button><button type="button" aria-label="Dismiss failed question notice" onClick={()=>setFailedQuestion("")}><X size={13}/></button></div>}
            <div className="composer-context"><span><span className="context-dot"/>{messages.length>0?"Ask a follow-up":newChatActive?"New conversation · private memory retained":"Ask your field data"}</span><div className="composer-actions"><button type="button" onClick={()=>void loadHistory(selectedUser)} disabled={!selectedUser||sending||historyLoading}><History size={13}/>Private history</button><button type="button" onClick={startNewChat}><Plus size={13}/>New chat</button></div></div>
            <form className="composer" onSubmit={submit}>
              <textarea ref={inputRef} value={draft} maxLength={4000} onChange={(e)=>setDraft(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send();}}} placeholder="Ask about a well, trend, repair or spill…" rows={1} aria-label="Ask the operations copilot" disabled={!selectedUser||loading||historyLoading} />
              <div className="composer-tools"><span>{draft.length>3800?`${draft.length} / 4,000 characters`:"Enter to send · Shift + Enter for a new line"}</span><button type="submit" disabled={!draft.trim()||sending||!selectedUser||loading||historyLoading} aria-label="Send question">{sending?<LoaderCircle size={16} className="spin"/>:<Send size={16}/>}</button></div>
            </form>
            <p className="composer-disclaimer">Dataset reference date: {latestStats?.today??"loading"} · Verify critical decisions against the linked records.</p>
          </div>
        </section>

        <aside className="evidence-rail">
          <div className="evidence-head"><div><span className="drawer-eyebrow">Evidence trail</span><h2>{citations.length?"Sources used":"Answer sources"}</h2></div><span className="evidence-count">{citations.length||"—"}</span></div>
          {citations.length?<div className="evidence-list"><CitationCollection key={currentAssistant?.id} citations={citations} onOpen={setSourceDrawer}/></div>:<div className="evidence-empty"><div className="evidence-empty-icon"><FileText size={17}/></div><p>Source records will appear here with your answer.</p><small>Every result links back to the inspection, repair or document used.</small></div>}
          {currentAssistant?.response?.referencedWellIds?.length>0&&<div className="related-wells"><span>Wells in this answer</span><div>{currentAssistant.response.referencedWellIds.slice(0,8).map((id)=><button type="button" key={id} onClick={()=>setDraft("Is "+id+" producing oil right now?")}>{id}</button>)}</div></div>}
          <div className="evidence-bottom">
            <div className="knowledge-card"><div className="knowledge-icon"><Users size={15}/></div><div><strong>Shared well knowledge</strong><p>Corrections and field context are visible to all selected users.</p></div><button type="button" onClick={()=>setMemoryOpen(true)} aria-label="View shared well knowledge"><ChevronRight size={15}/></button></div>
            <div className="private-memory-card"><div className="private-memory-icon"><History size={14}/></div><span><strong>{currentUser?.name??"Selected user"}’s private memory</strong><small>Conversation history stays scoped to this user.</small></span></div>
          </div>
        </aside>
      </div>}
    </main>

    {sourceDrawer&&<SourceDrawer key={sourceDrawer.type+sourceDrawer.id} citation={sourceDrawer} onClose={()=>setSourceDrawer(null)}/>}
    {memoryOpen&&currentUser&&<MemoryDrawer key={currentUser.id+memoryRefresh} userId={currentUser.id} userName={currentUser.name} onClose={()=>setMemoryOpen(false)} onCompose={()=>{setMemoryOpen(false);setActiveTab("chat");window.setTimeout(()=>inputRef.current?.focus(),0);}}/>}
    {importOpen&&<ImportDialog onClose={()=>setImportOpen(false)} onLoaded={loadedDataset}/>}
    {loading&&<div className="startup-status"><LoaderCircle size={15} className="spin"/>Connecting to local data…</div>}
  </div>;
}

function TrendingIcon(){return <Activity size={15}/>;}

function SourcesView({onOpen,stats,sourceCounts}:{onOpen:(c:Citation)=>void;stats?:Bootstrap["stats"];sourceCounts:Record<string,number>}){
  const [query,setQuery]=useState("");
  const [recordId,setRecordId]=useState("");
  const groups=[
    {type:"inspection",label:"Inspections",count:sourceCounts.inspection??stats?.inspections},
    {type:"repair",label:"Maintenance records",count:sourceCounts.repair},
    {type:"repair report",label:"Repair reports",count:sourceCounts["repair report"]},
    {type:"note",label:"Operator notes",count:sourceCounts.note},
    {type:"manual",label:"Well-type manuals",count:sourceCounts.manual},
    {type:"SOP",label:"Safety & compliance SOPs",count:sourceCounts.SOP},
    {type:"regulator",label:"Regulator events",count:sourceCounts.regulator}
  ];
  const filtered=groups.filter((x)=>x.label.toLowerCase().includes(query.toLowerCase()));
  return <div className="sources-page">
    <div className="sources-intro"><div className="sources-intro-icon"><BookOpen size={20}/></div><div><h2>Source library</h2><p>Inspect original records from the loaded dataset. Open a citation in chat, or find a source by its record ID below.</p></div></div>
    <form className="source-record-lookup" onSubmit={(e)=>{e.preventDefault();if(recordId.trim())onOpen({id:recordId.trim(),title:recordId.trim(),type:""});}}><label htmlFor="record-id">Open a source record</label><div><input id="record-id" value={recordId} onChange={(e)=>setRecordId(e.target.value)} placeholder="e.g. INS-0001-0203"/><button className="button-primary" type="submit" disabled={!recordId.trim()}>Open source <ArrowUpRight size={14}/></button></div></form>
    <label className="source-search"><BookOpen size={16}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Filter source categories…" aria-label="Filter source categories"/>{query&&<button type="button" aria-label="Clear filter" onClick={()=>setQuery("")}><X size={14}/></button>}</label>
    <div className="source-category-list">{filtered.map((group)=><div className="source-category" key={group.type}>
      <span className="source-category-icon">{group.type==="manual"||group.type==="SOP"?<BookOpen size={18}/>:group.type==="regulator"?<ShieldCheck size={18}/>:<FileText size={18}/>}</span><span className="source-category-copy"><strong>{group.label}</strong><small>{group.count===undefined?"Count unavailable":group.count.toLocaleString()+" source records"}</small></span><span className="source-category-index">{group.count?.toLocaleString()??"—"}</span>
    </div>)}{!filtered.length&&<p className="drawer-hint">No source categories match this filter.</p>}</div>
    <div className="source-note"><ShieldCheck size={16}/><p>Every answer citation is generated from the records used by the query engine. Source paths and excerpts stay in this local workspace.</p></div>
  </div>;
}

