import type { Dataset, EvidenceDoc, RecordLike, WellData } from './data';
import type { QueryPlan } from './plan';
import { randomUUID } from 'node:crypto';
import { gasResponse } from './tools/gas-response';
import { coldWeather } from './tools/cold-weather';
import { bypassCompliance } from './tools/bypass-compliance';
import { regulatorLetter } from './tools/regulator-letter';
import { recalledPumps } from './tools/recalled-pumps';
import { teamInfo } from './tools/team-info';
import { statusDisagreement } from './tools/status-disagreement';
import { noteRisk } from './tools/note-risk';
import { delayReasons } from './tools/delay-reasons';
import { regionTemperature } from './tools/region-temperature';
import { dataAvailability } from './tools/data-availability';
import { triage } from './tools/triage';

export type Correction = { id:string; assetId:string; inspectionId:string; field:'wellhead_temp_c'|'ambient_temp_c'|'spill_est_volume_bbl'|'spill_detected'; originalValue:number|boolean; correctedValue:number|boolean; authorUserId:string; reason:string; createdAt:string };
export type SharedFact = { id:string; assetId?:string; wellType?:string; text:string; authorUserId:string; createdAt:string; kind:string; validFrom?:string; days?:number };
export type UserClaim = { id:string; assetId:string; text:string; authorUserId:string; createdAt:string; confirmed:boolean };
export type TypeRule = { id:string; wellType:string; equipmentKind:string; count:number; authorUserId:string; createdAt:string };
export type HistoryEntry = { userText:string; answer:string; wellIds:string[]; createdAt:string };
export type CopilotState = { corrections:Correction[]; sharedFacts:SharedFact[]; claims:UserClaim[]; typeRules:TypeRule[]; history:Record<string,HistoryEntry[]>; extraRoots:string[]; preferences?:Record<string,{text:string;createdAt:string}[]> };
export type Citation = { id:string; title:string; type:string; path:string; excerpt:string; assetId?:string };
export type Visualization = { type:string; title:string; columns?:string[]; rows?:any[][]; data?:any[]; meta?:any };
export type Answer = { answer:string; visualization?:Visualization; citations:Citation[]; conflicts:string[]; referencedWellIds:string[]; memory?:string[] };
export function emptyState():CopilotState { return {corrections:[],sharedFacts:[],claims:[],typeRules:[],history:{},extraRoots:[]}; }
const clean=(v:any)=>String(v??'').replace(/\s+/g,' ').trim();
const day=(v:any)=>String(v??'').slice(0,10);
const ms=(v:any)=>Date.parse(String(v??''));
const round=(v:number,d=1)=>Number(v.toFixed(d));
const numeric=(v:any):v is number=>typeof v==='number'&&Number.isFinite(v);
const volume=(i:RecordLike)=>numeric(i.spill_est_volume_bbl)&&i.spill_est_volume_bbl>=0?i.spill_est_volume_bbl as number:undefined;
function coordinates(w:WellData){const point=w.metadata.location;return point&&numeric(point.lat)&&numeric(point.lon)&&Math.abs(point.lat)<=90&&Math.abs(point.lon)<=180?{lat:point.lat,lon:point.lon}:undefined;}
const usd=(v:number)=>'USD '+Math.round(v).toLocaleString('en-US');
const newId=(prefix:string)=>prefix+'-'+randomUUID();
const idsIn=(text:string)=>Array.from(new Set((text.match(/\bWELL-\d+\b/gi)??[]).map(v=>v.toUpperCase())));
const today=(d:Dataset)=>d.today||new Date().toISOString().slice(0,10);
const dateLabel=(v:any)=>Number.isFinite(ms(v))?new Date(ms(v)).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'Unknown date';
const person=(d:Dataset,id:string)=>d.users.find(u=>u.user_id===id)?.name??id;
const wellById=(d:Dataset,id:string)=>d.wells.find(w=>String(w.metadata.asset_id).toUpperCase()===id.toUpperCase());
const docFor=(d:Dataset,id:string,type:string)=>d.documents.find(doc=>doc.id===id&&doc.type===type);
function citation(doc?:EvidenceDoc,extra?:Partial<Citation>,focus?:RegExp):Citation|undefined {
  if(!doc&&!extra?.id)return undefined;
  let content=doc?.content??extra?.excerpt??'';
  if(doc&&focus){const lines=content.split(/\r?\n/),i=lines.findIndex(line=>focus.test(line));if(i>=0)content=lines.slice(Math.max(0,i-1),i+3).join(' ');}
  if(content.trim().startsWith('{')){try{const row=JSON.parse(content);content=Object.entries(row).filter(([,v])=>v!=null&&typeof v!=='object').map(([k,v])=>k.replaceAll('_',' ')+': '+v).join(' · ');}catch{}}
  return {id:doc?.id??extra!.id!,title:doc?.title??extra?.title??'Source',type:doc?.type??extra?.type??'record',path:doc?.path??extra?.path??'local feedback',excerpt:clean(content).slice(0,600),assetId:doc?.assetId??extra?.assetId};
}
const cite=(d:Dataset,id:string,type:string)=>citation(docFor(d,id,type));
function feedbackCitation(d:Dataset,f:Correction|SharedFact|UserClaim|TypeRule):Citation|undefined {
  const text='field' in f?'Corrected '+f.field+': original raw value '+f.originalValue+'; effective value '+f.correctedValue+'. Reason: '+f.reason:'text' in f?f.text:'RCA required for '+f.wellType+' '+f.equipmentKind+' after '+f.count+' corrective repairs';
  return citation(undefined,{id:f.id,title:'Shared feedback · '+f.id,type:'field' in f?'correction':'count' in f?'shared rule':'confirmed' in f?'claim':'shared knowledge',path:'local feedback',excerpt:person(d,f.authorUserId)+' · '+f.createdAt+' · '+text,assetId:'assetId' in f?f.assetId:undefined});
}
function answer(text:string,visualization?:Visualization,sources:(Citation|undefined)[]=[],conflicts:string[]=[],wellIds:string[]=[],memory?:string[]):Answer {
  const seen=new Set<string>();return {answer:text,visualization,citations:sources.filter((c):c is Citation=>!!c).filter(c=>{const key=c.type+':'+c.id+':'+c.path;if(seen.has(key))return false;seen.add(key);return true;}),conflicts:Array.from(new Set(conflicts)),referencedWellIds:Array.from(new Set(wellIds)),memory};
}
function manual(d:Dataset,w:WellData){return d.manuals[w.metadata.well_type];}
function manualCitation(d:Dataset,w:WellData){return citation(manual(d,w),undefined,/at least\s+\*?\*?\d+/i);}
function threshold(d:Dataset,w:WellData):number|undefined {
  const text=clean(manual(d,w)?.content).replace(/\*/g,'');
  const value=text.match(/at least\s+(\d+(?:\.\d+)?)\s*°?\s*C\s+above\s+ambient/i)?.[1];
  return value===undefined?undefined:Number(value);
}
function correctionsFor(s:CopilotState,w:WellData,i:RecordLike){return s.corrections.filter(c=>c.assetId===w.metadata.asset_id&&c.inspectionId===i.inspection_id);}
function notesFor(w:WellData,i:RecordLike){return w.context.filter(n=>n.inspection_id===i.inspection_id||String(n.text).includes(i.inspection_id));}
function effective(s:CopilotState,w:WellData,raw:RecordLike):RecordLike {
  const result={...raw};
  for(const n of notesFor(w,raw))if(n.note_type==='correction'&&/not\s+(?:a\s+)?(?:crude|oil|spill)|rainwater|mud puddle|false positive/i.test(n.text))result.spill_detected=false;
  for(const c of correctionsFor(s,w,raw))result[c.field]=c.correctedValue;
  return result;
}
function production(d:Dataset,s:CopilotState,w:WellData,raw:RecordLike){
  const item=effective(s,w,raw),limit=threshold(d,w),head=item.wellhead_temp_c,air=item.ambient_temp_c;
  const delta=typeof head==='number'&&typeof air==='number'&&Number.isFinite(head)&&Number.isFinite(air)?head-air:NaN;
  const tolerance=Number.EPSILON*Math.max(Math.abs(head??0),Math.abs(air??0),limit??0,1)*8;
  return {item,delta,limit,producing:Number.isFinite(delta)&&limit!==undefined?delta>=limit||Math.abs(delta-limit)<=tolerance:undefined};
}
function latest(d:Dataset,w:WellData){return w.inspections.filter(i=>day(i.inspected_at)<=today(d)).sort((a,b)=>ms(b.inspected_at)-ms(a.inspected_at))[0];}
const inRange=(v:any,r:{from:string;to:string})=>day(v)>=r.from&&day(v)<=r.to;
function validDate(v:string){return /^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(ms(v))&&new Date(ms(v)).toISOString().slice(0,10)===v;}
const months=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
function parseDate(text:string,t:string):string|undefined {
  const iso=text.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0];if(iso)return validDate(iso)?iso:undefined;
  const m=text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(20\d{2}))?/i);
  const reverse=text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?/i);
  if(!m&&!reverse)return undefined;
  const mon=months.findIndex(v=>(m?.[2]??reverse![1]).toLowerCase().startsWith(v));
  const year=Number(m?.[3]??reverse?.[3]??text.match(/\b20\d{2}\b/)?.[0]??t.slice(0,4));
  const value=year+'-'+String(mon+1).padStart(2,'0')+'-'+String(m?.[1]??reverse![2]).padStart(2,'0');return validDate(value)?value:undefined;
}
function rangeFor(d:Dataset,q:string,p:QueryPlan):{from:string;to:string}{
  const end=today(d),start=new Date(end+'T00:00:00Z');let to=end;
  const duration=q.match(/(?:last|past)\s+(\d+)\s+(day|week|month|year)s?/i);
  if(p.year!==undefined||(!duration&&/\b20\d{2}\b/.test(q)&&!/\b\d{1,2}\s+[A-Za-z]{3}/.test(q))){const year=p.year??Number(q.match(/\b20\d{2}\b/)![0]);start.setTime(Date.UTC(year,0,1));to=year===Number(end.slice(0,4))?end:year+'-12-31';}
  else if(/this year/i.test(q))start.setUTCMonth(0,1);
  else if(duration){const n=Number(duration[1]),unit=duration[2].toLowerCase();if(unit==='day'||unit==='week')start.setUTCDate(start.getUTCDate()-n*(unit==='week'?7:1));else {const monthDay=start.getUTCDate();start.setUTCDate(1);if(unit==='month')start.setUTCMonth(start.getUTCMonth()-n);else start.setUTCFullYear(start.getUTCFullYear()-n);start.setUTCDate(Math.min(monthDay,new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0)).getUTCDate()));}}
  else start.setUTCFullYear(start.getUTCFullYear()-1);
  return {from:p.date??p.from??start.toISOString().slice(0,10),to:p.date??p.to??to};
}
function scopeFor(d:Dataset,p:QueryPlan){return d.wells.filter(w=>(!p.wellIds?.length||p.wellIds.includes(w.metadata.asset_id))&&(!p.areaId||w.metadata.area_id===p.areaId)&&(!p.wellType||w.metadata.well_type===p.wellType));}
const repairFor=(w:WellData,id:string)=>w.maintenance.find(m=>m.triggered_by_inspection_id===id);
function downtimeRepair(w:WellData,i:RecordLike){return repairFor(w,i.inspection_id)??w.maintenance.find(m=>m.maintenance_type==='corrective'&&day(m.started_at)<=day(i.inspected_at)&&day(m.completed_at)>=day(i.inspected_at));}
const reportFor=(d:Dataset,m?:RecordLike)=>m?docFor(d,m.maintenance_id,'repair report'):undefined;
function containHours(report?:EvidenceDoc):number|undefined {
  if(!report)return undefined;
  // Restrict extraction to spill containment language, never pressure-test holding hours.
  const line=report.content.split(/\r?\n/).find(v=>/\bSR-02\b/.test(v));
  const text=clean(line??report.content);
  const m=text.match(/contain(?:ed|ment)(?:\s+(?:about|after|within|took|approximately|in)){0,3}\s*(\d+(?:\.\d+)?)\s*(?:h(?:ours?)?|hrs?)\b/i);
  return m?Number(m[1]):undefined;
}
function sop(d:Dataset,id:string){return d.documents.find(doc=>doc.type==='SOP'&&new RegExp('\\b'+id+'\\b').test(doc.content));}
function spillRules(d:Dataset){
  const doc=sop(d,'SR-01'),text=clean(doc?.content).replace(/\*/g,'');
  const protocol=(id:string)=>text.match(new RegExp('\\| '+id+' \\| ([\\s\\S]*?)(?= \\| [A-Z]{2}-\\d{2} \\||$)'))?.[1]??text;
  return {doc,reportable:Number(text.match(/Reportable\s*\|\s*(\d+)/i)?.[1]??5),major:Number(text.match(/Major\s*\|\s*(\d+)/i)?.[1]??25),reportHours:Number(protocol('SR-01').match(/within\s+(\d+)\s+hours/i)?.[1]??24),majorHours:Number(protocol('SR-01').match(/within\s+(\d+)\s+hours\s+for a major/i)?.[1]??2),containHours:Number(protocol('SR-02').match(/within\s+(\d+)\s+hours/i)?.[1]??4),verifyDays:Number(protocol('SR-03').match(/within\s+(\d+)\s+days/i)?.[1]??60)};
}
function spillSources(d:Dataset,s:CopilotState,w:WellData,raw:RecordLike){
  const repair=repairFor(w,raw.inspection_id);return [cite(d,raw.inspection_id,'inspection'),...notesFor(w,raw).map(n=>cite(d,n.note_id,'note')),repair?cite(d,repair.maintenance_id,'repair'):undefined,citation(reportFor(d,repair)),...correctionsFor(s,w,raw).map(c=>feedbackCitation(d,c))];
}
function fieldFacts(s:CopilotState,w:WellData){return s.sharedFacts.filter(f=>f.assetId?f.assetId===w.metadata.asset_id:f.wellType?f.wellType===w.metadata.well_type:true);}
function currentNotes(d:Dataset,w:WellData){return w.context.filter(n=>(!n.valid_from||n.valid_from<=today(d))&&(!n.valid_to||n.valid_to>=today(d))&&!n.inspection_id);}
function currentFacts(d:Dataset,s:CopilotState,w:WellData){return fieldFacts(s,w).filter(f=>(!f.validFrom||f.validFrom<=today(d))&&(!f.days||!f.validFrom||ms(today(d))<ms(f.validFrom)+f.days*86400000));}
function claimDirection(q:string):boolean|undefined {if(/not producing|shut in|shut-in|offline|stopped|not running/i.test(q))return false;if(/running fine|back online|is producing|running now/i.test(q))return true;return undefined;}
function conflictsFor(d:Dataset,s:CopilotState,w:WellData,raw:RecordLike):string[]{
  const result:string[]=[],status=production(d,s,w,raw);
  const corrections=correctionsFor(s,w,raw);
  for(const c of corrections)if(c.originalValue!==raw[c.field])result.push('Source data changed after '+person(d,c.authorUserId)+'’s correction: '+c.field+' was '+c.originalValue+' when feedback was recorded, but the currently loaded raw record is '+String(raw[c.field])+'. The corrected value '+c.correctedValue+' remains effective; confirm the imported source and correction.');
  if(corrections.some(c=>c.field==='wellhead_temp_c'||c.field==='ambient_temp_c')&&/not moving|stopped|idle|running|producing/i.test(raw.notes??'')){
    const direction=/not moving|stopped|idle/i.test(raw.notes)?false:true;
    if(direction!==status.producing)result.push('The temperature correction by '+person(d,corrections.at(-1)!.authorUserId)+' conflicts with inspector '+person(d,raw.inspector_user_id)+'’s note “'+raw.notes+'”. Please confirm which observation is current.');
  }
  const notes=notesFor(w,raw),negative=notes.filter(n=>/not crude|not oil|produced water|rainwater/i.test(n.text)),positive=notes.filter(n=>/confirmed crude|is crude|detection stands|sampled.*oil/i.test(n.text));
  if(negative.length&&positive.length)result.push('Notes disagree: '+negative.map(n=>person(d,n.author_user_id)+' said “'+n.text+'”').join('; ')+'; '+positive.map(n=>person(d,n.author_user_id)+' said “'+n.text+'”').join('; ')+'. '+(notes.some(n=>n.note_type==='correction')?'Formal corrections determine the effective detection.':'Neither note is a formal correction, so the inspection detection stands.'));
  const statements=[...currentFacts(d,s,w).map(f=>({text:f.text,author:f.authorUserId})),...s.claims.filter(c=>c.assetId===w.metadata.asset_id).map(c=>({text:c.text,author:c.authorUserId}))];
  for(const statement of statements){const direction=claimDirection(statement.text);if(direction!==undefined&&status.producing!==undefined&&direction!==status.producing)result.push(person(d,statement.author)+' said “'+statement.text+'”, which conflicts with the '+dateLabel(raw.inspected_at)+' inspection by '+person(d,raw.inspector_user_id)+' showing '+round(status.delta,1)+' °C above ambient and '+(status.producing?'producing':'not producing')+'. The statement remains unconfirmed; please confirm with a current field reading.');}
  for(let i=0;i<statements.length;i++)for(let j=i+1;j<statements.length;j++){const a=claimDirection(statements[i].text),b=claimDirection(statements[j].text);if(a!==undefined&&b!==undefined&&a!==b)result.push('Shared statements disagree: '+person(d,statements[i].author)+' said “'+statements[i].text+'”; '+person(d,statements[j].author)+' said “'+statements[j].text+'”. Both statements are retained.');}
  for(const field of new Set(corrections.map(c=>c.field))){const history=corrections.filter(c=>c.field===field);if(new Set(history.map(c=>c.correctedValue)).size>1)result.push('Corrections disagree for '+field+': '+history.map(c=>person(d,c.authorUserId)+' entered '+c.correctedValue+' ('+c.reason+')').join('; ')+'. The latest recorded correction is used and all versions are retained.');}
  return result;
}
function statusAnswer(d:Dataset,s:CopilotState,w:WellData,visual?:string,selection?:QueryPlan):Answer {
  const historical=!!(selection?.date||selection?.from||selection?.to||selection?.year||selection?.inspectionId);
  const range=selection?rangeFor(d,'',selection):undefined;
  const raw=historical?w.inspections.filter(i=>day(i.inspected_at)<=today(d)&&(selection?.inspectionId?i.inspection_id===selection.inspectionId:inRange(i.inspected_at,range!))).sort((a,b)=>ms(b.inspected_at)-ms(a.inspected_at))[0]:latest(d,w);
  if(!raw)return answer('No inspections are available for '+w.metadata.asset_id+(historical?' in the requested period.':'.'),undefined,[cite(d,w.metadata.asset_id,'well')],[],[w.metadata.asset_id]);
  const contextDate=historical?{...d,today:day(raw.inspected_at)}:d;
  const status=production(d,s,w,raw),notes=currentNotes(contextDate,w),facts=currentFacts(contextDate,s,w),repair=w.maintenance.find(m=>day(m.started_at)<=today(contextDate)&&day(m.completed_at)>today(contextDate));
  const context=[...facts.map(f=>f.text+' According to '+person(d,f.authorUserId)+'.'),...notes.filter(n=>/shut in|planned|not moving|workover/i.test(n.text)).map(n=>n.text+' According to '+person(d,n.author_user_id)+' ('+n.note_id+').'),...(repair?[repair.issue+' ('+repair.maintenance_id+').']:[])];
  const edits=correctionsFor(s,w,raw),conflicts=conflictsFor(d,s,w,raw),label=status.producing===undefined?'Unknown':status.producing?'Producing':'Not producing';
  const delta=Number.isFinite(status.delta)?round(status.delta,1):undefined;
  const text=[status.producing===undefined?'Production cannot be determined from the available temperature readings and manual.':(status.producing?'Yes, ':'No, ')+w.metadata.asset_id+(historical?' was ':' is ')+(status.producing?'producing oil.':'not producing oil.'),(historical?'Selected inspection ':'Latest inspection ')+raw.inspection_id+' was '+dateLabel(raw.inspected_at)+' by '+person(d,raw.inspector_user_id)+' ('+raw.method+').','Wellhead '+status.item.wellhead_temp_c+' °C minus air '+status.item.ambient_temp_c+' °C = '+(delta??'unavailable')+' °C; the '+w.metadata.well_type+' manual threshold is '+(status.limit??'unavailable')+' °C.',...edits.map(c=>person(d,c.authorUserId)+' corrected '+c.field+' from original raw value '+c.originalValue+' to '+c.correctedValue+'. Reason: '+c.reason),...context,!context.length&&status.producing===false?'No recorded reason explains the stop; a field check is warranted.':'',!historical&&status.producing!==undefined&&w.metadata.recorded_status!==(status.producing?'active':'down')?'The stored status “'+w.metadata.recorded_status+'” is out of date.':'',visual==='map'&&!coordinates(w)?'Location is unavailable; no map pin can be shown.':'',...conflicts].filter(Boolean).join(' ');
  const row={assetId:w.metadata.asset_id,name:w.metadata.name,status:label,delta,threshold:status.limit,ambient:status.item.ambient_temp_c,head:status.item.wellhead_temp_c,date:dateLabel(raw.inspected_at),inspector:person(d,raw.inspector_user_id),method:raw.method,inspectionId:raw.inspection_id,recordedStatus:w.metadata.recorded_status,reason:context.join(' ')};
  const visualization:Visualization|undefined=visual==='none'?undefined:visual==='table'?{type:'table',title:'Current status · '+w.metadata.asset_id,columns:['Well','Status','Wellhead − air','Threshold','Last inspection','Stored status'],rows:[[row.assetId,label,delta===undefined?'Unavailable':delta+' °C',status.limit===undefined?'Unavailable':status.limit+' °C',row.date,row.recordedStatus]]}:visual==='bar'?{type:'bar',title:'Wellhead temperature above air',data:delta===undefined?[]:[{...row,name:row.assetId,value:delta,label:delta+' °C',threshold:status.limit}],meta:{valueLabel:'Wellhead above air',unit:'°C'}}:visual==='map'?{type:'map',title:'Well status',data:coordinates(w)?[{...row,...coordinates(w)}]:[]}:{type:'status',title:w.metadata.asset_id+' · '+(historical?'selected status':'current status'),data:[row]};
  return answer(text,visualization,[cite(d,raw.inspection_id,'inspection'),manualCitation(d,w),...notes.map(n=>cite(d,n.note_id,'note')),...facts.map(f=>feedbackCitation(d,f)),...edits.map(c=>feedbackCitation(d,c)),...s.claims.filter(c=>c.assetId===w.metadata.asset_id).map(c=>feedbackCitation(d,c)),repair?cite(d,repair.maintenance_id,'repair'):undefined],conflicts,[w.metadata.asset_id]);
}
function areaStatus(d:Dataset,s:CopilotState,p:QueryPlan):Answer {
  const rows:any[][]=[],sources:(Citation|undefined)[]=[],ids:string[]=[],conflicts:string[]=[],removed:string[]=[];
  let unknown=0;
  for(const w of scopeFor(d,p)){const raw=latest(d,w);if(!raw){unknown++;continue;}const status=production(d,s,w,raw),edits=correctionsFor(s,w,raw);sources.push(cite(d,raw.inspection_id,'inspection'),manualCitation(d,w),...edits.map(c=>feedbackCitation(d,c)));if(status.producing){if(edits.length&&production(d,emptyState(),w,raw).producing===false)removed.push(w.metadata.asset_id+' is now producing using '+person(d,edits.at(-1)!.authorUserId)+'’s correction.');continue;}if(status.producing===undefined){unknown++;continue;}
    const notes=currentNotes(d,w),facts=currentFacts(d,s,w),repair=w.maintenance.find(m=>day(m.started_at)<=today(d)&&day(m.completed_at)>today(d));
    const reason=facts.map(f=>f.text+' ('+person(d,f.authorUserId)+')').concat(notes.filter(n=>/planned|shut in|pump jack not moving/i.test(n.text)).map(n=>n.text+' ('+person(d,n.author_user_id)+')')).join(' ')||repair?.issue||'No recorded reason; field check recommended';
    rows.push([w.metadata.asset_id,w.metadata.well_type,round(status.delta,1)+' °C',w.metadata.recorded_status+(w.metadata.recorded_status==='active'?' (out of date)':''),reason,dateLabel(raw.inspected_at)]);ids.push(w.metadata.asset_id);sources.push(...notes.map(n=>cite(d,n.note_id,'note')),...facts.map(f=>feedbackCitation(d,f)),repair?cite(d,repair.maintenance_id,'repair'):undefined);conflicts.push(...conflictsFor(d,s,w,raw));}
  rows.sort((a,b)=>String(a[0]).localeCompare(b[0]));const name=d.areas.find(a=>a.area_id===p.areaId)?.name??p.areaId??(p.wellIds?.length?'the selected wells':p.wellType?p.wellType+' wells across the entire fleet':'the entire fleet');
  return answer(rows.length+' wells in '+name+' are not producing on their latest inspections. '+removed.join(' ')+(unknown?' '+unknown+' wells lack enough evidence to classify and are excluded.':''),p.visual==='none'?undefined:{type:p.visual==='map'?'map':'table',title:'Not producing · '+name,columns:['Well','Type','Wellhead − air','Stored status','Reason / context','Last inspected'],rows,data:ids.map(id=>{const w=wellById(d,id)!;return {assetId:id,...w.metadata.location};})},sources,conflicts,ids);
}
function historyAnswer(d:Dataset,s:CopilotState,q:string,p:QueryPlan):Answer {
  const sources:(Citation|undefined)[]=[],data:any[]=[],rows:any[][]=[],ids:string[]=[],off:string[]=[];
  const r=rangeFor(d,q,p),weeks=p.weeks??Number(q.match(/(?:last|past)\s+(\d+)\s+weeks/i)?.[1]??13),explicitPeriod=!!(p.from||p.to||p.date||p.year);
  for(const w of scopeFor(d,p)){let records=w.inspections.filter(i=>day(i.inspected_at)<=today(d)&&(explicitPeriod?inRange(i.inspected_at,r):true)&&(!p.inspectionId||i.inspection_id===p.inspectionId)).sort((a,b)=>ms(a.inspected_at)-ms(b.inspected_at));if(!explicitPeriod&&!p.inspectionId)records=records.filter(i=>day(i.inspected_at)>new Date(ms(today(d))-weeks*7*86400000).toISOString().slice(0,10));ids.push(w.metadata.asset_id);sources.push(manualCitation(d,w));for(const raw of records){const status=production(d,s,w,raw);data.push({assetId:w.metadata.asset_id,date:dateLabel(raw.inspected_at),wellhead:status.item.wellhead_temp_c,air:status.item.ambient_temp_c,producing:status.producing,delta:Number.isFinite(status.delta)?round(status.delta,1):undefined,id:raw.inspection_id});rows.push([dateLabel(raw.inspected_at),status.item.wellhead_temp_c??'Unavailable',status.item.ambient_temp_c??'Unavailable',Number.isFinite(status.delta)?round(status.delta,1):'Unavailable',status.producing===undefined?'Unknown':status.producing?'Yes':'No']);if(status.producing===false)off.push(dateLabel(raw.inspected_at));sources.push(cite(d,raw.inspection_id,'inspection'),...correctionsFor(s,w,raw).map(c=>feedbackCitation(d,c)));}}
  return answer('Here are '+data.length+' readings in the requested period. '+(off.length?'Not producing on '+off.join(', ')+'.':'No non-producing readings are shown.'),p.visual==='none'?undefined:{type:p.visual==='table'?'table':'line',title:'Wellhead vs air · '+(explicitPeriod?dateLabel(r.from)+' to '+dateLabel(r.to):weeks+' weeks'),columns:['Date','Wellhead °C','Air °C','Δ °C','Producing'],rows,data},sources,[],ids);
}
function downtimeAnswer(d:Dataset,s:CopilotState,q:string,p:QueryPlan):Answer {
  const r=rangeFor(d,q,p),sources:(Citation|undefined)[]=[],rows:any[][]=[],totals:any[]=[],conflicts:string[]=[];
  for(const w of scopeFor(d,p)){const inspections=w.inspections.filter(i=>inRange(i.inspected_at,r)&&day(i.inspected_at)<=today(d));const down=inspections.filter(i=>production(d,s,w,i).producing===false);totals.push({assetId:w.metadata.asset_id,name:w.metadata.asset_id,type:w.metadata.well_type,value:down.length*7,count:down.length,label:down.length*7+' days'});sources.push(manualCitation(d,w));for(const raw of down){const status=production(d,s,w,raw),repair=downtimeRepair(w,raw);rows.push([w.metadata.asset_id,dateLabel(raw.inspected_at),round(status.delta,1)+' °C',repair?.issue??raw.notes??'No recorded reason',repair?.maintenance_id??'—',raw.inspection_id]);sources.push(cite(d,raw.inspection_id,'inspection'),repair?cite(d,repair.maintenance_id,'repair'):undefined,...correctionsFor(s,w,raw).map(c=>feedbackCitation(d,c)));}const unknown=inspections.filter(i=>production(d,s,w,i).producing===undefined).length;if(unknown)conflicts.push(w.metadata.asset_id+': '+unknown+' readings lack a usable manual or temperature and are excluded from downtime.');}
  const ranking=p.operation==='downtime_ranking',chosen=ranking?totals.sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name)).slice(0,p.topK??3):totals;
  const detail=!ranking?rows.map(row=>row[1]+': '+row[2]+' above ambient; '+row[3]+(row[4]!=='—'?' ('+row[4]+')':'')+'.').join(' '):'';
  const text=chosen.map(x=>x.name+': '+x.value+' days ('+x.count+' non-producing weekly inspections)').join('; ')+'. Window '+dateLabel(r.from)+' through '+dateLabel(r.to)+'. Each non-producing inspection counts as 7 days; missed inspections contribute no downtime. '+detail;
  return answer(text,p.visual==='none'||(!p.visual&&!ranking)?undefined:p.visual==='bar'||ranking&&p.visual!=='table'?{type:'bar',title:ranking?'Downtime leaders':'Downtime by well',data:chosen,meta:{valueLabel:'Days down',unit:'days'}}:{type:'table',title:ranking?'Downtime leaders':'Downtime evidence',columns:ranking?['Well','Type','Downtime days','Non-producing inspections']:['Well','Inspection date','Wellhead − air','Reason','Repair','Inspection'],rows:ranking?chosen.map(x=>[x.assetId,x.type,x.value,x.count]):rows},sources,conflicts,chosen.map(x=>x.assetId));
}
function spillsAnswer(d:Dataset,s:CopilotState,q:string,p:QueryPlan):Answer {
  const r=rangeFor(d,q,p),rules=spillRules(d),sources:(Citation|undefined)[]=[],conflicts:string[]=[],hits:{w:WellData;raw:RecordLike;i:RecordLike}[]=[],excluded:string[]=[],details:string[]=[],unknownVolumes:string[]=[];
  if(p.reportableOnly&&!rules.doc)return answer('The Spill Response SOP is missing; reportability cannot be assessed from the loaded documents.');
  for(const w of scopeFor(d,p))for(const raw of w.inspections.filter(i=>(p.inspectionId&&!p.from&&!p.to&&!p.date&&!p.year?true:inRange(i.inspected_at,r))&&day(i.inspected_at)<=today(d)&&(!p.inspectionId||i.inspection_id===p.inspectionId))){const i=effective(s,w,raw);if(raw.spill_detected&&!i.spill_detected){excluded.push(raw.inspection_id);sources.push(...spillSources(d,s,w,raw));}if(i.spill_detected!==true)continue;const amount=volume(i);if(amount===undefined){unknownVolumes.push(i.inspection_id);sources.push(...spillSources(d,s,w,raw));}if(p.reportableOnly&&(amount===undefined||amount<rules.reportable))continue;hits.push({w,raw,i});sources.push(...spillSources(d,s,w,raw));conflicts.push(...conflictsFor(d,s,w,raw));const edits=correctionsFor(s,w,raw);details.push(...edits.map(c=>w.metadata.asset_id+': '+person(d,c.authorUserId)+' corrected '+c.field+' from original '+c.originalValue+' to '+c.correctedValue+'.'));if(p.reportableOnly){const ev=w.regulatoryEvents.find(e=>e.related_inspection_id===i.inspection_id&&e.event_type==='spill_report_filed'&&day(e.date)<=today(d)),hours=amount!>=rules.major?rules.majorHours:rules.reportHours;details.push(w.metadata.asset_id+': '+amount+' bbl is reportable. '+(ev?'Written report '+ev.event_id+' filed after '+ev.hours_to_report+' hours.':('No written notice is recorded in the loaded data; due within '+hours+' hours of '+i.inspected_at+'. '+(ms(today(d)+'T23:59:59Z')>ms(i.inspected_at)+hours*3600000?'Overdue; possible SR-01 breach.':'The reporting deadline has not passed.'))));if(ev)sources.push(cite(d,ev.event_id,'regulator'));}}
  hits.sort((a,b)=>ms(a.i.inspected_at)-ms(b.i.inspected_at)||a.w.metadata.asset_id.localeCompare(b.w.metadata.asset_id));
  const total=hits.reduce((n,x)=>n+(volume(x.i)??0),0),singleDate=!!p.date||!!p.inspectionId;
  if(singleDate&&hits.length)for(const {w,raw} of hits){const notes=notesFor(w,raw),repair=repairFor(w,raw.inspection_id);details.push(w.metadata.asset_id+' inspection '+raw.inspection_id+' flagged '+raw.spill_est_volume_bbl+' bbl: “'+raw.notes+'”. '+notes.map(n=>person(d,n.author_user_id)+' ('+n.note_id+'): “'+n.text+'”').join(' ')+' '+(notes.every(n=>n.note_type!=='correction')?'No formal correction cancels this detection. ':'')+(repair?'Spill repair '+repair.maintenance_id+' was performed.':''));}
  const name=p.wellIds?.join(', ')??d.areas.find(a=>a.area_id===p.areaId)?.name??'The field',rows=hits.map(({w,i})=>[w.metadata.asset_id,dateLabel(i.inspected_at),volume(i)??'Unavailable',w.metadata.area_id,w.metadata.location?.lat,w.metadata.location?.lon,i.inspection_id]);
  const spillTotals=new Map<string,{name:string;assetId:string;value:number;count:number;label:string;partial:boolean}>();
  for(const {w,i} of hits){const id=w.metadata.asset_id,total=spillTotals.get(id)??{name:id,assetId:id,value:0,count:0,label:'',partial:false};total.value=round(total.value+(volume(i)??0),6);total.count++;total.partial||=volume(i)===undefined;total.label=round(total.value,1)+' bbl'+(total.partial?' known subtotal':'');spillTotals.set(id,total);}
  const missingLocations=hits.filter(({w})=>!coordinates(w));
  if(p.visual==='map'&&missingLocations.length)details.push(missingLocations.length+' spill location(s) unavailable; no pins emitted for those records.');
  const visualization=p.visual==='none'?undefined:p.visual==='bar'?{type:'bar',title:'Spilled oil by well',data:Array.from(spillTotals.values()),meta:{valueLabel:unknownVolumes.length?'Known oil spilled':'Oil spilled',unit:'bbl'}}:p.visual==='map'?{type:'map',title:'Real spills',data:hits.filter(({w})=>coordinates(w)).map(({w,i})=>({assetId:w.metadata.asset_id,date:dateLabel(i.inspected_at),barrels:volume(i),...coordinates(w),inspectionId:i.inspection_id}))}:p.visual==='table'||hits.length>1||p.reportableOnly?{type:'table',title:p.reportableOnly?'Reportable spills':'Real spills',columns:['Well','Date','Barrels','Area','Latitude','Longitude','Inspection'],rows}:undefined;
  if(p.reportableOnly||excluded.length)sources.push(citation(rules.doc));
  const period=p.inspectionId&&!p.from&&!p.to&&!p.date&&!p.year?' for inspection '+p.inspectionId:' from '+dateLabel(r.from)+' through '+dateLabel(r.to);
  return answer((singleDate&&hits.length?'Yes. ':'')+name+' had '+hits.length+' '+(p.reportableOnly?'reportable':'real')+' spills, '+(unknownVolumes.length?'known volume subtotal '+round(total,1)+' bbl; '+unknownVolumes.length+' spill volume(s) unavailable, so the complete total and reportability of those detections are unknown':'totalling '+round(total,1)+' bbl')+period+'. '+(excluded.length?'Excluded '+excluded.length+' corrected false positive(s): '+excluded.join(', ')+'. ':'')+details.join(' ')+(conflicts.length?' '+conflicts.join(' '):''),visualization,sources,conflicts,hits.map(x=>x.w.metadata.asset_id));
}
function heatmapAnswer(d:Dataset,s:CopilotState,q:string,p:QueryPlan):Answer {
  if(p.reportableOnly&&!spillRules(d).doc)return answer('The Spill Response SOP is missing; reportable spill counts cannot be assessed.');
  const year=p.year??Number(q.match(/\b20\d{2}\b/)?.[0]??today(d).slice(0,4)),r=rangeFor(d,q,{...p,year}),n=year===Number(today(d).slice(0,4))?Number(today(d).slice(5,7)):12;
  const labels=Array.from({length:n},(_,i)=>new Date(Date.UTC(year,i,1)).toLocaleString('en-US',{month:'short',timeZone:'UTC'})),sources:(Citation|undefined)[]=[],ids:string[]=[];
  const rows=d.areas.filter(a=>!p.areaId||a.area_id===p.areaId).map(a=>{const counts=labels.map(()=>0);for(const w of scopeFor(d,p).filter(w=>w.metadata.area_id===a.area_id))for(const raw of w.inspections.filter(i=>inRange(i.inspected_at,r)&&day(i.inspected_at)<=today(d))){const i=effective(s,w,raw);if(i.spill_detected===true&&(!p.reportableOnly||Number(i.spill_est_volume_bbl)>=spillRules(d).reportable)){counts[Number(day(i.inspected_at).slice(5,7))-1]++;ids.push(w.metadata.asset_id);sources.push(...spillSources(d,s,w,raw));}else if(raw.spill_detected)sources.push(...spillSources(d,s,w,raw));}return [a.name,...counts,counts.reduce((a,b)=>a+b,0)];});
  return answer('Spill counts by area and month in '+year+'. Formal corrections are applied; corrected false positives are excluded.',p.visual==='none'?undefined:{type:p.visual==='table'?'table':'heatmap',title:'Spills by area × month · '+year,columns:['Area',...labels,'Total'],rows,data:rows.flatMap(r=>labels.map((month,i)=>({area:r[0],month,value:r[i+1]})))},sources,[],Array.from(new Set(ids)));
}
function containmentAnswer(d:Dataset,s:CopilotState,q:string,p:QueryPlan):Answer {
  const r=rangeFor(d,q,p),rules=spillRules(d),sources:(Citation|undefined)[]=[citation(rules.doc)],rows:any[][]=[],ids:string[]=[],unknown:string[]=[];
  if(!rules.doc)return answer('The Spill Response SOP is missing; its containment limit cannot be verified, so compliance cannot be assessed.');
  const coverage={candidateSpills:0,resolvedTiming:0,withinLimit:0,breaches:0,missingReports:0,unparsedTiming:0,observationFrom:r.from,observationTo:r.to,datasetAsOf:today(d)};
  for(const w of scopeFor(d,p))for(const raw of w.inspections.filter(i=>inRange(i.inspected_at,r)&&day(i.inspected_at)<=today(d))){const i=effective(s,w,raw);if(i.spill_detected!==true)continue;coverage.candidateSpills++;const repair=repairFor(w,i.inspection_id),report=reportFor(d,repair),hours=containHours(report);sources.push(...spillSources(d,s,w,raw));if(hours===undefined){unknown.push(i.inspection_id);if(!report)coverage.missingReports++;else coverage.unparsedTiming++;}else {coverage.resolvedTiming++;if(hours>rules.containHours){coverage.breaches++;rows.push([w.metadata.asset_id,dateLabel(i.inspected_at),volume(i)??'Unavailable',hours+' hours',repair?.maintenance_id??'—',i.inspection_id]);ids.push(w.metadata.asset_id);}else coverage.withinLimit++;}}
  return answer(rows.length+' spills exceeded the '+rules.containHours+'-hour SOP containment limit. Timing is extracted from linked repair reports. Coverage: '+coverage.candidateSpills+' candidate spills; '+coverage.resolvedTiming+' resolved timings ('+coverage.withinLimit+' within limit, '+coverage.breaches+' breaches); '+coverage.missingReports+' missing reports; '+coverage.unparsedTiming+' reports without usable timing. '+(unknown.length?'Coverage is incomplete. '+unknown.length+' spills cannot be assessed: '+unknown.join(', ')+'.':'All candidate spills have documented timing.'),p.visual==='none'?undefined:{type:'table',title:'Containment exceptions',columns:['Well','Discovery','Barrels','Containment time','Report','Inspection'],rows,meta:{coverage}},sources,[],ids);
}
function manualRcaCount(d:Dataset,w:WellData):number|undefined {
  const raw=clean(manual(d,w)?.content).replace(/\*/g,'');const number=raw.match(/(\d+|three|two|four|five)\s+or more\s+corrective/i)?.[1]??raw.match(/RCA after\s+(\d+|three|two|four|five)\s+corrective/i)?.[1];
  const word:Record<string,number>={two:2,three:3,four:4,five:5};if(number)return word[number.toLowerCase()]??Number(number);
  const parentType=raw.match(/Same as (T\d+) section/i)?.[1];return parentType&&parentType!==w.metadata.well_type?manualRcaCount(d,{...w,metadata:{...w.metadata,well_type:parentType}}):undefined;
}
function rcaAnswer(d:Dataset,s:CopilotState,q:string,p:QueryPlan):Answer {
  const r=rangeFor(d,q,p),kind=p.equipmentKind??'pump_jack',rows:any[][]=[],sources:(Citation|undefined)[]=[],ids:string[]=[],conflicts:string[]=[];
  for(const w of scopeFor(d,p)){const rules=s.typeRules.filter(v=>v.wellType===w.metadata.well_type&&v.equipmentKind===kind),override=rules.at(-1),trigger=override?.count??manualRcaCount(d,w);sources.push(citation(manual(d,w)),...rules.map(v=>feedbackCitation(d,v)));if(trigger===undefined){conflicts.push('No RCA trigger was found for '+w.metadata.well_type+'.');continue;}const repairs=w.maintenance.filter(m=>m.maintenance_type==='corrective'&&m.equipment_kind===kind&&inRange(m.started_at,r)&&day(m.started_at)<=today(d));if(repairs.length>=trigger){ids.push(w.metadata.asset_id);rows.push([w.metadata.asset_id,w.metadata.well_type,repairs.length,trigger,override?person(d,override.authorUserId)+' shared rule':'Operating manual',repairs.map(m=>m.maintenance_id).join(', ')]);sources.push(...repairs.map(m=>cite(d,m.maintenance_id,'repair')));}if(new Set(rules.map(v=>v.count)).size>1)conflicts.push('Saved rules disagree for '+w.metadata.well_type+' '+kind+'. The latest recorded rule is used and every author is retained.');}
  return answer(ids.length+' wells require a root-cause analysis on their '+kind.replaceAll('_',' ')+': '+(ids.join(', ')||'none')+'. Counts use corrective repairs started from '+dateLabel(r.from)+' through '+dateLabel(r.to)+'. '+rows.filter(r=>r[4]!=='Operating manual').map(r=>r[0]+' uses '+r[4]+' at '+r[3]+' repairs, overriding the manual for '+r[1]+' only.').join(' '),p.visual==='none'?undefined:p.visual==='bar'?{type:'bar',title:'Corrective repairs requiring RCA · '+kind.replaceAll('_',' '),data:rows.map(row=>({name:row[0],assetId:row[0],value:row[2],trigger:row[3],label:row[2]+' repairs'})),meta:{valueLabel:'Corrective repairs',unit:'repairs'}}:{type:'table',title:'Corrective repair escalation · '+kind.replaceAll('_',' '),columns:['Well','Type','Repairs','Trigger','Rule source','Repair IDs'],rows},sources,conflicts,ids);
}
function costsAnswer(d:Dataset,s:CopilotState,q:string,p:QueryPlan):Answer {
  const statedYear=q.match(/\b20\d{2}\b/)?.[0],hasPeriod=/(?:last|past)\s+\d+\s+(?:days?|weeks?|months?|years?)/i.test(q);
  const r=rangeFor(d,q,{...p,year:p.year??(!p.from&&!p.to&&!p.date&&!hasPeriod?Number(statedYear??today(d).slice(0,4)):undefined)}),rows:any[][]=[],data:{name:string;assetId:string;value:number;label:string;jobs:number;partial:boolean}[]=[],sources:(Citation|undefined)[]=[],ids:string[]=[];
  for(const w of scopeFor(d,p)){const repairs=w.maintenance.filter(m=>inRange(m.started_at,r)&&day(m.started_at)<=today(d)&&(!p.equipmentKind||m.equipment_kind===p.equipmentKind)),known=repairs.filter(m=>numeric(m.cost_usd?.total)&&m.cost_usd.total>=0),total=known.reduce((n,m)=>n+m.cost_usd.total,0),missing=repairs.length-known.length,label=usd(total)+(missing?' known subtotal ('+missing+' missing job total(s))':'');ids.push(w.metadata.asset_id);rows.push([w.metadata.asset_id,repairs.length,label]);data.push({name:w.metadata.asset_id,assetId:w.metadata.asset_id,value:total,label,jobs:repairs.length,partial:missing>0});sources.push(...repairs.map(m=>cite(d,m.maintenance_id,'repair')));}
  return answer('Repair costs by maintenance start date, '+dateLabel(r.from)+' through '+dateLabel(r.to)+': '+rows.map(r=>r[0]+' '+r[2]).join(' · ')+'.',p.visual==='none'?undefined:p.visual==='bar'?{type:'bar',title:'Repair cost by well',data,meta:{valueLabel:data.some(row=>row.partial)?'Known repair cost':'Repair cost',currency:'USD',format:'currency'}}:{type:'table',title:'Repair costs',columns:['Well','Repair jobs','Total cost'],rows},sources,[],ids);
}
function passingVerification(e:RecordLike){
  return e.event_type==='site_inspection'&&e.status==='closed'&&/environment/i.test(e.agency??'')&&/pass|verif(?:ied|ication complete)|clean.?up complete|remediation complete|below.*1[.]0|meets.*target/i.test(e.detail??'')&&!/not pass|fail|pending|not verified/i.test(e.detail??'');
}
function complianceAnswer(d:Dataset,s:CopilotState,q:string,p:QueryPlan):Answer {
  const r=rangeFor(d,q,p),now=today(d),rules=spillRules(d),rows:any[][]=[],sources:(Citation|undefined)[]=[citation(rules.doc),citation(sop(d,'RC-04'))],ids:string[]=[],seen=new Set<string>();
  if(!rules.doc||!sop(d,'RC-04'))return answer('A required spill or regulatory compliance SOP is missing; rule compliance cannot be assessed from the loaded documents.');
  const add=(well:string,rule:string,status:string,detail:string,source:string)=>{const key=well+':'+rule+':'+source;if(seen.has(key))return;seen.add(key);rows.push([rule,status,detail,source,well]);};
  const rcText=clean(sop(d,'RC-04')?.content).replace(/\*/g,''),responseDays=Number(rcText.match(/RC-04\s*\|[^|]*within\s+(\d+)\s+days/i)?.[1]??30),inspectionDays=Number(rcText.match(/RC-01\s*\|[^|]*every\s+(\d+)\s+days/i)?.[1]??14);
  const coverage={candidateSpills:0,resolvedTiming:0,missingReports:0,unparsedTiming:0,unknownVolumes:0,observationFrom:r.from,observationTo:r.to,datasetAsOf:now};
  let fines=0;
  for(const w of scopeFor(d,p)){ids.push(w.metadata.asset_id);sources.push(citation(manual(d,w)));
    for(const raw of w.inspections.filter(i=>inRange(i.inspected_at,r)&&day(i.inspected_at)<=now)){const i=effective(s,w,raw);if(i.spill_detected!==true)continue;
      coverage.candidateSpills++;
      const vol=volume(i),repair=repairFor(w,i.inspection_id),report=reportFor(d,repair),events=w.regulatoryEvents.filter(e=>e.related_inspection_id===i.inspection_id&&day(e.date)<=now),reportEvent=events.find(e=>e.event_type==='spill_report_filed'),hours=vol!==undefined&&vol>=rules.major?rules.majorHours:rules.reportHours;
      sources.push(...spillSources(d,s,w,raw),...events.map(e=>cite(d,e.event_id,'regulator')));
      if(vol===undefined){coverage.unknownVolumes++;add(w.metadata.asset_id,'Classification','Unknown','Spill volume is unavailable; reporting and agency verification duties cannot be determined.',i.inspection_id);}
      if(vol!==undefined&&vol>=rules.reportable){
        const reportingDue=ms(i.inspected_at)+hours*3600000;
        if(!reportEvent)add(w.metadata.asset_id,'SR-01',ms(now+'T23:59:59Z')>reportingDue?'Possible breach':'Pending action','No written notice is recorded in the loaded data for '+vol+' bbl; due '+new Date(reportingDue).toISOString()+' ('+hours+'-hour limit).',i.inspection_id);
        else {const elapsed=typeof reportEvent.hours_to_report==='number'?reportEvent.hours_to_report:undefined;if(elapsed!==undefined&&elapsed>hours)add(w.metadata.asset_id,'SR-01','Breach','Written report after '+elapsed+' hours against a '+hours+'-hour limit.',reportEvent.event_id);else if(elapsed===undefined)add(w.metadata.asset_id,'SR-01','Unknown','Written report exists but its elapsed reporting time is unavailable.',reportEvent.event_id);}
        const due=new Date(ms(i.inspected_at)+rules.verifyDays*86400000).toISOString().slice(0,10),verified=events.find(passingVerification);
        if(!verified)add(w.metadata.asset_id,'SR-03',now>due?'Overdue':'Pending action','Passing environmental agency clean-up verification due '+dateLabel(due)+'; '+(events.some(e=>e.event_type==='site_inspection')?'agency inspection remains unverified/open.':'no passing agency inspection is recorded.'),events.find(e=>e.event_type==='site_inspection')?.event_id??i.inspection_id);
        else add(w.metadata.asset_id,'SR-03','Met','Passing agency verification recorded '+dateLabel(verified.date)+'.',verified.event_id);
        if(report&&vol!==Number(raw.spill_est_volume_bbl)&&/moderate|only to reportable/i.test(report.content))add(w.metadata.asset_id,'Classification','Changed by correction','The linked report classified the original '+raw.spill_est_volume_bbl+' bbl estimate as moderate. At '+vol+' bbl its exemption from reporting and agency verification no longer applies.',repair!.maintenance_id);
      }
      const h=containHours(report);
      if(h!==undefined)coverage.resolvedTiming++;else if(!report)coverage.missingReports++;else coverage.unparsedTiming++;
      if(h!==undefined&&h>rules.containHours)add(w.metadata.asset_id,'SR-02','Breach','Contained after about '+h+' hours against a '+rules.containHours+'-hour limit.',repair?.maintenance_id??i.inspection_id);
      else if(h===undefined)add(w.metadata.asset_id,'SR-02','Unknown','No containment timing is recorded in the linked report; compliance cannot be confirmed.',repair?.maintenance_id??i.inspection_id);
    }
    // Notices can remain open even when they concern an older incident.
    for(const event of w.regulatoryEvents.filter(e=>e.event_type==='notice_of_violation'&&day(e.date)<=now&&(inRange(e.date,r)||e.status==='open'))){
      const response=w.regulatoryEvents.find(e=>e.event_type==='nov_response_filed'&&day(e.date)<=now&&(e.related_notice_id===event.event_id||e.related_event_id===event.event_id||(e.related_inspection_id===event.related_inspection_id&&day(e.date)>=day(event.date))));
      const due=new Date(ms(event.date)+responseDays*86400000).toISOString().slice(0,10);
      if(!response)add(w.metadata.asset_id,'RC-04',now>due?'Overdue':'Pending action','Notice response due '+dateLabel(due)+'; no response is recorded. Agency notice '+event.event_id+' is '+event.status+'.',event.event_id);
      else if(ms(response.date)>ms(due+'T23:59:59Z'))add(w.metadata.asset_id,'RC-04','Breach','Response filed '+dateLabel(response.date)+' after the '+dateLabel(due)+' deadline.',response.event_id);
      sources.push(cite(d,event.event_id,'regulator'),response?cite(d,response.event_id,'regulator'):undefined);
    }
    for(const event of w.regulatoryEvents.filter(e=>e.status==='open'&&day(e.date)<=now)){fines+=Number(event.fine_usd??0);sources.push(cite(d,event.event_id,'regulator'));}
    const repairs=w.maintenance.filter(m=>inRange(m.started_at,r)&&day(m.started_at)<=now);
    for(const kind of new Set(repairs.filter(m=>m.maintenance_type==='corrective').map(m=>String(m.equipment_kind)))){
      const jobs=repairs.filter(m=>m.maintenance_type==='corrective'&&m.equipment_kind===kind),override=s.typeRules.filter(v=>v.wellType===w.metadata.well_type&&v.equipmentKind===kind).at(-1),trigger=override?.count??manualRcaCount(d,w);
      if(trigger!==undefined&&jobs.length>=trigger){const last=[...jobs].sort((a,b)=>ms(b.started_at)-ms(a.started_at))[0],report=reportFor(d,last),completed=report&&/root.cause analysis (?:was |is )?(?:completed|closed)|RCA (?:completed|closed)/i.test(report.content);if(!completed)add(w.metadata.asset_id,'Manual §10','Pending action',jobs.length+' corrective '+kind.replaceAll('_',' ')+' repairs; root-cause analysis is required before the next repair closes.'+(report&&/action required/i.test(report.content)?' Latest report marks Action required.':''),jobs.map(m=>m.maintenance_id).join(', '));sources.push(...jobs.flatMap(m=>[cite(d,m.maintenance_id,'repair'),citation(reportFor(d,m))]),override?feedbackCitation(d,override):undefined);}
    }
    // Surface report findings outside SR-01..03 without asserting omissions as failures.
    for(const m of repairs){const report=reportFor(d,m);if(!report)continue;for(const line of report.content.split(/\r?\n/)){const cells=line.split('|').map(v=>clean(v).replace(/\*/g,''));if(cells.length<5||!/^WS-|^RC-|^SR-04/.test(cells[1])||!/not met|breach|action required/i.test(cells[2]))continue;add(w.metadata.asset_id,cells[1],/action required/i.test(cells[2])?'Pending action':'Breach',cells[3],m.maintenance_id);sources.push(citation(report));}}
    const planned=currentNotes(d,w).filter(n=>/planned|shut in/i.test(n.text));
    for(const n of planned){const matching=w.maintenance.some(m=>Math.abs(ms(day(m.started_at))-ms(n.valid_from??day(n.created_at)))<=86400000&&m.maintenance_type==='scheduled'&&/replacement|workover|shut.in/i.test(m.issue??''));if(!matching&&/not yet|not.*maintenance system|work order/i.test(n.text)){add(w.metadata.asset_id,'Manual §4','Pending record','Planned shut-in is not yet recorded in the maintenance system, as stated by '+person(d,n.author_user_id)+': '+n.text,n.note_id);sources.push(cite(d,n.note_id,'note'));}}
    const annual=w.maintenance.find(m=>/annual flowline integrity test/i.test(m.issue??'')&&day(m.started_at).slice(0,4)===now.slice(0,4)&&day(m.started_at)<=now&&/pass/i.test(m.action_taken??''));
    if(annual){add(w.metadata.asset_id,'RC-02','Met','Annual flowline integrity test passed on '+dateLabel(annual.started_at)+'.',annual.maintenance_id);sources.push(cite(d,annual.maintenance_id,'repair'));}
    else add(w.metadata.asset_id,'RC-02','Pending action','No passing flowline integrity test is recorded for calendar year '+now.slice(0,4)+'. It is due by 31 Dec; absence is not counted as a breach before that deadline.',w.metadata.asset_id);
    // Check gaps between observed inspections, with a prior anchor across the window boundary.
    const observationEnd=r.to<now?r.to:now,inspections=w.inspections.filter(i=>day(i.inspected_at)<=observationEnd).sort((a,b)=>ms(a.inspected_at)-ms(b.inspected_at));
    for(let index=1;index<inspections.length;index++){const previous=inspections[index-1],current=inspections[index];if(day(current.inspected_at)<r.from)continue;const gap=(ms(day(current.inspected_at))-ms(day(previous.inspected_at)))/86400000;if(gap>inspectionDays){add(w.metadata.asset_id,'RC-01','Possible breach',gap+' calendar days between recorded inspections '+previous.inspection_id+' and '+current.inspection_id+'; the limit is '+inspectionDays+' days. Verify whether an inspection record is missing.',current.inspection_id);sources.push(cite(d,previous.inspection_id,'inspection'),cite(d,current.inspection_id,'inspection'));}}
    const last=inspections.at(-1);if(last&&observationEnd>=r.from&&(ms(observationEnd)-ms(day(last.inspected_at)))/86400000>inspectionDays){add(w.metadata.asset_id,'RC-01','Possible breach','The latest recorded inspection before '+dateLabel(observationEnd)+' is '+dateLabel(last.inspected_at)+', beyond the '+inspectionDays+'-day interval; a missing record must be checked.',last.inspection_id);sources.push(cite(d,last.inspection_id,'inspection'));}
  }
  const breaches=rows.filter(r=>['Breach','Overdue','Possible breach'].includes(r[1])).length;
  return answer(breaches+' breached or overdue rule(s), including possible breaches where required evidence is absent from the loaded data. Open regulator events carry '+usd(fines)+' in recorded fines. Pending actions and met duties are listed separately. Spill coverage: '+coverage.candidateSpills+' candidates; '+coverage.resolvedTiming+' resolved containment timings; '+coverage.missingReports+' missing reports; '+coverage.unparsedTiming+' reports with unparsed timing; '+coverage.unknownVolumes+' unknown volumes. '+(coverage.missingReports||coverage.unparsedTiming||coverage.unknownVolumes?'Coverage is incomplete; unknown findings are not proof that duties were met.':'All candidate spill volumes and containment timings are resolved.'),p.visual==='none'?undefined:{type:'table',title:'Rules and open actions',columns:['Rule','Finding','Evidence / status','Source ID','Well'],rows,meta:{coverage}},sources,[],ids);
}
function sharedKnowledgeAnswer(d:Dataset,s:CopilotState,p:QueryPlan):Answer {
  const sources:(Citation|undefined)[]=[],details:string[]=[],rows:any[][]=[],conflicts:string[]=[],ids:string[]=[];
  for(const w of scopeFor(d,p)){ids.push(w.metadata.asset_id);const facts=fieldFacts(s,w).filter(f=>!f.days||!f.validFrom||ms(today(d))<ms(f.validFrom)+f.days*86400000),notes=w.context.filter(n=>/planned|shut in|workover/i.test(n.text)&&(!n.valid_to||n.valid_to>=today(d)));
    for(const f of facts){details.push(w.metadata.asset_id+': '+f.text+' According to '+person(d,f.authorUserId)+'.'+(f.validFrom?' Starts '+dateLabel(f.validFrom)+'.':'')+(f.days?' Duration about '+f.days+' days.':''));rows.push([w.metadata.asset_id,f.validFrom?dateLabel(f.validFrom):'Unspecified',f.days??'—',f.text,person(d,f.authorUserId)]);sources.push(feedbackCitation(d,f));}
    for(const n of notes){details.push(w.metadata.asset_id+': '+n.text+' According to '+person(d,n.author_user_id)+'.');rows.push([w.metadata.asset_id,n.valid_from?dateLabel(n.valid_from):'Unspecified','—',n.text,person(d,n.author_user_id)]);sources.push(cite(d,n.note_id,'note'));}
    const raw=latest(d,w);if(raw)conflicts.push(...conflictsFor(d,s,w,raw));
  }
  return answer(details.length?'Yes. '+details.join(' '):'No shared planned-downtime note is recorded for this scope in the loaded data.',p.visual==='none'?undefined:{type:'table',title:'Shared field knowledge',columns:['Well','From','Days','Context','Author'],rows},sources,conflicts,ids);
}
function isReadQuestion(q:string){
  const text=q.trim().replace(/^(?:please\s+)+/i,'');
  return /^(?:is|are|was|were|does|do|did|has|have|had|can|could|would|should|what|which|who|when|where|why|how|show|list|find|tell|compare|give|explain|summarize|summarise|review|assess|evaluate|analyze|analyse|describe|check|inspect|clarify|discuss|help me understand|I wonder|I want to know|I would like to know|plot|chart|graph|draw|display|visuali[sz]e|map|get|fetch|pull up|bring up|break down|let me see)\b/i.test(text)||/^(?:I|we)\s+(?:need|want|would like|'d like)\b(?!\s+to\s+(?:correct|update|change|record|log|save|note|flag|report|set|fix|add))/i.test(text)||text.endsWith('?')||/\b(?:do not|don't|never)\s+(?:save|record|store|remember|change|update|apply|correct)\b/i.test(text)||/\bhypothetical(?:ly)?\b|\bsuppose\b|\bpretend\b|\bimagine\b|\bwhat if\b/i.test(text);
}
function correctedNumber(q:string,unit:'temperature'|'volume'):number|undefined {
  const suffix=unit==='temperature'?'°?\\s*C\\b':'(?:bbl|barrels?)\\b',number='(-?\\d+(?:\\.\\d+)?)\\s*'+suffix;
  const patterns=[
    new RegExp('\\bto\\s*'+number,'gi'),
    new RegExp('\\b(?:re-?measured|measured|actual(?: value)?|real value|corrected(?: value)?)[^.;]{0,70}?'+number,'gi'),
    new RegExp(number+'\\s*(?:,?\\s*not|instead of)\\s*-?\\d','gi'),
    new RegExp(number,'gi')
  ];
  for(const pattern of patterns){const matches=[...q.matchAll(pattern)];if(matches.length)return Number(matches.at(-1)![1]);}
  return undefined;
}
function correctionAnswer(d:Dataset,s:CopilotState,userId:string,q:string,p:QueryPlan):Answer {
  if(!p.wellIds?.length||p.wellIds.length!==1||!p.field||p.value===undefined)return answer('A correction needs one well, an inspection or date, a field, and its corrected value.');
  if(!['wellhead_temp_c','ambient_temp_c','spill_est_volume_bbl','spill_detected'].includes(p.field))return answer('The correction field is unsupported. No correction was saved.');
  const w=wellById(d,p.wellIds[0])!,matches=w.inspections.filter(i=>(!p.inspectionId||i.inspection_id===p.inspectionId)&&(!p.date||day(i.inspected_at)===p.date)&&day(i.inspected_at)<=today(d));
  const raw=p.inspectionId||p.date?(matches.length===1?matches[0]:undefined):latest(d,w);
  if(!raw)return answer('No unique inspection matches this correction. Supply its inspection ID or exact date.',undefined,[],[],p.wellIds);
  if(p.field==='spill_detected'?typeof p.value!=='boolean':typeof p.value!=='number'||!Number.isFinite(p.value)||p.field==='spill_est_volume_bbl'&&Number(p.value)<0)return answer('The corrected value has an invalid type or range.');
  const original=raw[p.field];if(typeof original!=='number'&&typeof original!=='boolean')return answer('The raw record does not contain a numeric or boolean value for '+p.field+'. No correction was saved.');
  const previous=effective(s,w,raw)[p.field],c:Correction={id:newId('CORR'),assetId:w.metadata.asset_id,inspectionId:raw.inspection_id,field:p.field,originalValue:original,correctedValue:p.value,authorUserId:userId,reason:p.reason||q,createdAt:new Date().toISOString()};s.corrections.push(c);
  const status=production(d,s,w,raw),conflicts=conflictsFor(d,s,w,raw),sources=[cite(d,raw.inspection_id,'inspection'),manualCitation(d,w),...correctionsFor(s,w,raw).map(c=>feedbackCitation(d,c)),...spillSources(d,s,w,raw)];
  let detail=person(d,userId)+' corrected '+raw.inspection_id+' '+p.field+': original raw value '+original+'; previous effective value '+previous+'; corrected value '+p.value+'. Reason: '+c.reason+'. This correction is shared with all users and applies only to this inspection.';
  if(p.field==='wellhead_temp_c'||p.field==='ambient_temp_c')detail+=' The corrected difference is '+round(status.delta,1)+' °C versus the '+status.limit+' °C '+w.metadata.well_type+' threshold, so the well is '+(status.producing===undefined?'of unknown production status':status.producing?'producing oil':'not producing oil')+'.';
  if(p.field==='spill_est_volume_bbl'||p.field==='spill_detected'){
    const rules=spillRules(d),item=effective(s,w,raw);
    if(item.spill_detected&&rules.doc&&Number(item.spill_est_volume_bbl)>=rules.reportable)detail+=' At '+item.spill_est_volume_bbl+' bbl this spill is reportable under the Spill Response SOP.';
    else if(item.spill_detected&&!rules.doc)detail+=' The Spill Response SOP is missing; reportability cannot be verified.';
    const compliance=complianceAnswer(d,s,q,{operation:'compliance',wellIds:p.wellIds,date:day(raw.inspected_at)});detail+=' '+compliance.visualization?.rows?.filter(r=>r[3]===raw.inspection_id||r[3]===repairFor(w,raw.inspection_id)?.maintenance_id).map(r=>r[0]+' '+r[1]+': '+r[2]).join(' ');sources.push(...compliance.citations);
  }
  detail+=' '+conflicts.join(' ');
  return answer(detail,{type:'status',title:'Correction applied · '+w.metadata.asset_id,data:[{assetId:w.metadata.asset_id,inspectionId:raw.inspection_id,field:p.field,original,previous,corrected:p.value,delta:round(status.delta,1),threshold:status.limit,status:status.producing===undefined?'Unknown':status.producing?'Producing':'Not producing',author:person(d,userId),reason:c.reason}]},sources,conflicts,p.wellIds);
}
function mutationAnswer(d:Dataset,s:CopilotState,userId:string,q:string,p:QueryPlan):Answer {
  if(isReadQuestion(q))return answer('This question does not provide declarative feedback, so no shared records were changed.');
  if(!d.users.some(u=>u.user_id===userId))return answer('Select a valid dataset user before saving feedback.');
  if(p.operation==='correction')return correctionAnswer(d,s,userId,q,p);
  if(p.operation==='rule'){
    if(!p.wellType||!d.manuals[p.wellType]||!p.equipmentKind||!Number.isInteger(p.threshold)||p.threshold!<1)return answer('A shared rule needs a known well type, equipment kind, and a positive integer repair count.');
    const rule:TypeRule={id:newId('RULE'),wellType:p.wellType,equipmentKind:p.equipmentKind,count:p.threshold!,authorUserId:userId,createdAt:new Date().toISOString()};s.typeRules.push(rule);
    return answer('Saved '+person(d,userId)+'’s shared '+rule.wellType+' rule: root-cause analysis for '+rule.equipmentKind.replaceAll('_',' ')+' after '+rule.count+' corrective repairs. It overrides the manual only for '+rule.wellType+' wells.',{type:'status',title:'Shared type rule saved',data:[{wellType:rule.wellType,equipment:rule.equipmentKind,count:rule.count,author:person(d,userId)}]},[citation(d.manuals[rule.wellType]),feedbackCitation(d,rule)]);
  }
  if(p.operation==='preference'){
    const list=((s.preferences??={})[userId]??=[]);list.push({text:q,createdAt:new Date().toISOString()});
    return answer('Saved as a private display preference for '+person(d,userId)+': “'+q+'” It applies only to your future answers; other users are not affected.',undefined,[],[],[],['Private preference saved for '+person(d,userId)+'.']);
  }
  if(p.operation==='claim'&&/\b(?:swapped|swap(?:ped)? out|replaced|changed out)\b/i.test(q)){
    const claims=(p.wellIds??[]).map(id=>{const claim:UserClaim={id:newId('CLAIM'),assetId:id,text:q,authorUserId:userId,createdAt:new Date().toISOString(),confirmed:false};s.claims.push(claim);return claim;});
    const context=recalledPumps(d,s,userId,q,{operation:'recalled_pumps',wellIds:p.wellIds});
    return {...context,answer:'Recorded '+person(d,userId)+'’s report as an unconfirmed shared claim on '+(p.wellIds??[]).join(', ')+' (no work order is on record yet; it is attributed to '+person(d,userId)+' and visible to all users, but it does not overwrite the maintenance records). '+context.answer,citations:[...claims.map(c=>feedbackCitation(d,c)).filter((c):c is Citation=>!!c),...context.citations]};
  }
  if(p.operation==='claim'){
    if(!p.wellIds?.length)return answer('Name a well for this field claim.');
    const sources:(Citation|undefined)[]=[],conflicts:string[]=[],text:string[]=[];
    for(const id of p.wellIds){const w=wellById(d,id)!,claim:UserClaim={id:newId('CLAIM'),assetId:id,text:q,authorUserId:userId,createdAt:new Date().toISOString(),confirmed:false};s.claims.push(claim);const a=statusAnswer(d,s,w);sources.push(...a.citations,feedbackCitation(d,claim));conflicts.push(...a.conflicts);text.push(a.answer);}
    return answer('Recorded '+person(d,userId)+'’s statement as an unconfirmed claim. '+text.join(' '),{type:'status',title:'Unconfirmed field claim',data:p.wellIds.map(id=>({assetId:id,claim:q,author:person(d,userId),confirmed:false}))},sources,conflicts,p.wellIds);
  }
  const facts:SharedFact[]=[];
  for(const id of p.wellIds?.length?p.wellIds:[undefined]){const f:SharedFact={id:newId('FACT'),assetId:id,wellType:p.wellType,text:q,authorUserId:userId,createdAt:new Date().toISOString(),kind:/planned|shut in|workover/i.test(q)?'planned downtime':'shared note',validFrom:p.date??parseDate(q,today(d)),days:Number(q.match(/(\d+)[- ]day/i)?.[1]??0)||undefined};s.sharedFacts.push(f);facts.push(f);}
  const conflicts=p.wellIds?.flatMap(id=>{const w=wellById(d,id)!,raw=latest(d,w);return raw?conflictsFor(d,s,w,raw):[];})??[];
  return answer('Saved shared field knowledge from '+person(d,userId)+': '+q+'. Other users can see its author and date.',{type:'status',title:'Shared well knowledge saved',data:facts.map(f=>({assetId:f.assetId,text:q,author:person(d,userId),validFrom:f.validFrom,days:f.days}))},facts.map(f=>feedbackCitation(d,f)),conflicts,p.wellIds??[]);
}
/** Deterministic filter/group/aggregate over loaded records for questions no domain tool covers; undefined means "not an aggregate". */
export function queryRecords(d:Dataset,s:CopilotState,q:string,p:QueryPlan):Answer|undefined {
  if(/\b(?:the|T\d+|operating|well-type)\s+manual|\bmanuals\b|\bSOPs?\b|procedure|protocol|say about|requir/i.test(q))return undefined;
  const kind=/violation|\bNOVs?\b|\bfines?\b|regulator(?:y)? events?|site inspections?|agenc|spill reports? filed|notices?/i.test(q)?'events':/inspections?|inspected|inspectors?|missed/i.test(q)?'inspections':/repairs?|maintenance|jobs?|contractors?|technicians?|equipment|fail|broke|breakdown/i.test(q)?'repairs':undefined;
  if(!kind)return undefined;
  const allowed:Record<string,string[]>={repairs:['contractor','technician','well','equipment','area','well type','month','year'],inspections:['inspector','method','well','area','well type','month','year'],events:['agency','event type','well','area','well type','month','year']};
  const patterns:Record<string,RegExp>={contractor:/contractors?/i,technician:/technicians?/i,inspector:/inspectors?|who inspected|inspected\b.*\bmost/i,agency:/agenc/i,'event type':/event types?|kinds? of (?:regulator )?events?/i,method:/by method|inspection methods?|drone (?:vs|versus|or) manual|manual (?:vs|versus|or) drone/i,well:/which wells?|\b(?:per|by|each)\s+well\b|wells? (?:with|had|has) the most|top \d+ wells/i,equipment:/equipment|component/i,area:/\b(?:per|by|each|across(?: the)?|every|which)\s+(?:geographic\s+)?areas?\b|four areas/i,'well type':/\b(?:per|by|each|across|which)\s+(?:well\s+)?types?\b/i,month:/\b(?:per|by|each)\s+month\b|monthly/i,year:/\b(?:per|by|each)\s+year\b|yearly|annually/i};
  let dim=allowed[kind].find(k=>patterns[k].test(q));
  const aggregate=/how many|number of|\bcount|total|\bsum\b|average|\bmean\b|most|least|highest|lowest|\btop\b|rank|fewest|frequent|often|how much/i.test(q);
  if(!dim&&!aggregate)return undefined;
  dim??=(p.wellIds?.length??0)>1?'well':'total';
  const money=/cost|spend|spent|USD|\$|expensive/i.test(q);
  const metric=kind==='repairs'?(money&&/average|\bmean\b/i.test(q)?'average cost':money?'cost':'count'):kind==='events'?(/\bfines?\b|penalt|USD|\$|how much/i.test(q)?'fines':'count'):/missed|skipped/i.test(q)?'missed':'count';
  const hasPeriod=p.year!==undefined||!!(p.from||p.to||p.date)||/(?:last|past)\s+\d+|this year|\b20\d{2}\b/i.test(q);
  const range=hasPeriod?rangeFor(d,q,p):{from:'0000-01-01',to:today(d)};
  const windowText=hasPeriod?dateLabel(range.from)+' through '+dateLabel(range.to):'all loaded history through '+dateLabel(range.to);
  const areaName=(w:WellData)=>d.areas.find(a=>a.area_id===w.metadata.area_id)?.name??w.metadata.area_id;
  const groups=new Map<string,{count:number;value:number;known:number;sources:[string,string][]}>(),filters:string[]=[];let inHouse=0;
  const add=(key:string,value:number|undefined,id:string,type:string)=>{const g=groups.get(key)??{count:0,value:0,known:0,sources:[]};g.count++;if(numeric(value)){g.value+=value;g.known++;}g.sources.push([id,type]);groups.set(key,g);};
  const keyFor=(w:WellData,date:any,extra:Record<string,any>)=>dim==='well'?w.metadata.asset_id:dim==='area'?areaName(w):dim==='well type'?w.metadata.well_type:dim==='month'?day(date).slice(0,7):dim==='year'?day(date).slice(0,4):dim==='total'?'All matching records':String(extra[dim!]??'Not recorded');
  for(const w of scopeFor(d,p)){
    if(kind==='repairs'){
      const corrective=/corrective|fail|broke|breakdown|unplanned/i.test(q),scheduled=/scheduled|preventive/i.test(q);
      for(const m of w.maintenance){
        if(!inRange(m.started_at,range)||day(m.started_at)>today(d))continue;
        if(corrective&&!scheduled&&m.maintenance_type!=='corrective'||scheduled&&!corrective&&m.maintenance_type!=='scheduled')continue;
        if(p.equipmentKind&&m.equipment_kind!==p.equipmentKind)continue;
        if(dim==='contractor'&&!m.contractor){inHouse++;continue;}
        add(keyFor(w,m.started_at,{contractor:m.contractor||'No contractor recorded',technician:person(d,m.technician_user_id),equipment:String(m.equipment_kind??'unknown').replaceAll('_',' ')}),metric==='count'?1:Number(m.cost_usd?.total),m.maintenance_id,'repair');
      }
    }else if(kind==='events'){
      const type=/violation|\bNOVs?\b/i.test(q)?'notice_of_violation':/site inspections?/i.test(q)?'site_inspection':/spill reports?/i.test(q)?'spill_report_filed':/response/i.test(q)?'nov_response_filed':undefined;
      const status=/\bopen\b|unresolved|outstanding|unpaid/i.test(q)?'open':/\bclosed\b|resolved/i.test(q)?'closed':undefined;
      for(const e of w.regulatoryEvents){
        if(!inRange(e.date,range)||type&&e.event_type!==type||status&&e.status!==status)continue;
        add(keyFor(w,e.date,{agency:e.agency,'event type':String(e.event_type).replaceAll('_',' ')}),metric==='fines'?Number(e.fine_usd??0):1,e.event_id,'regulator');
      }
      if(type)filters.push(type.replaceAll('_',' '));if(status)filters.push(status);
    }else{
      const method=dim!=='method'&&/\bdrone\b/i.test(q)?'drone':dim!=='method'&&/\bmanual(?:ly)? inspect/i.test(q)?'manual':undefined;if(method)filters.push(method+' only');
      const list=w.inspections.filter(i=>day(i.inspected_at)<=today(d)).sort((a,b)=>ms(a.inspected_at)-ms(b.inspected_at));
      list.forEach((i,n)=>{
        if(!inRange(i.inspected_at,range)||method&&i.method!==method)return;
        const gap=n>0?(ms(i.inspected_at)-ms(list[n-1].inspected_at))/86400000:0,missed=gap>10?Math.round(gap/7)-1:0;
        if(metric==='missed'&&!missed)return;
        add(keyFor(w,i.inspected_at,{inspector:person(d,i.inspector_user_id),method:i.method}),metric==='missed'?missed:1,i.inspection_id,'inspection');
      });
    }
  }
  if(kind==='repairs'){if(/corrective|fail|broke|breakdown|unplanned/i.test(q)!==/scheduled|preventive/i.test(q))filters.push(/scheduled|preventive/i.test(q)?'scheduled':'corrective');if(p.equipmentKind)filters.push(p.equipmentKind.replaceAll('_',' '));}
  const valueOf=(g:{count:number;value:number;known:number})=>metric==='count'?g.count:metric==='average cost'?(g.known?g.value/g.known:0):metric==='missed'?g.value:g.value;
  const ascending=/least|lowest|fewest/i.test(q),chronological=dim==='month'||dim==='year';
  let rows=[...groups.entries()].map(([key,g])=>({key,g,value:valueOf(g)})).sort((a,b)=>chronological?a.key.localeCompare(b.key):ascending?a.value-b.value||a.key.localeCompare(b.key):b.value-a.value||a.key.localeCompare(b.key));
  const top=Number(q.match(/\btop\s+(\d+)/i)?.[1]);if(Number.isInteger(top)&&top>0)rows=rows.slice(0,top);
  const noun=kind==='repairs'?'repairs':kind==='events'?'regulator events':metric==='missed'?'missed inspections':'inspections';
  const label=metric==='cost'?'Repair cost':metric==='average cost'?'Average repair cost':metric==='fines'?'Fines':metric==='missed'?'Missed inspections':'Number of '+noun;
  const show=(v:number)=>metric==='cost'||metric==='average cost'||metric==='fines'?usd(v):String(round(v,1));
  const scope=p.areaId?d.areas.find(a=>a.area_id===p.areaId)?.name??p.areaId:p.wellIds?.length?p.wellIds.join(', '):p.wellType?p.wellType+' wells':'the field';
  const heading=label+(dim==='total'?'':' by '+dim)+' · '+scope+(filters.length?' ('+filters.join(', ')+')':'');
  const ids=Array.from(new Set(rows.flatMap(r=>r.g.sources.map(([id])=>id.match(/^[A-Z]+-(\d{4})-/)?.[1]).filter((v):v is string=>!!v).map(v=>'WELL-'+v))));
  if(!rows.length)return answer('No matching '+noun+' were found for '+scope+(filters.length?' ('+filters.join(', ')+')':'')+' in '+windowText+'. This is a deterministic count over the loaded records.',undefined,[],[],ids);
  const leader=chronological?'':(ascending?'Lowest: ':'Highest: ')+rows[0].key+' with '+show(rows[0].value)+(metric==='count'?'':' across '+rows[0].g.count+' record(s)')+'. ';
  const text=heading+', '+windowText+'. '+leader+rows.slice(0,12).map(r=>r.key+': '+show(r.value)+(metric==='count'?'':' ('+r.g.count+' record'+(r.g.count===1?'':'s')+')')).join(' · ')+(rows.length>12?' · plus '+(rows.length-12)+' more in the table.':'.');
  const all=rows.flatMap(r=>r.g.sources),limit=150,sources=all.slice(0,limit).map(([id,type])=>cite(d,id,type));
  const note=(inHouse?' '+inHouse+' matching job(s) with no contractor recorded (in-house crews) are excluded from the contractor ranking.':'')+(all.length>limit?' Citations show the first '+limit+' of '+all.length+' underlying records.':'');
  const want=p.visual&&p.visual!=='none'?p.visual:chronological?'line':rows.length>=2&&rows.length<=20&&dim!=='total'?'bar':'table';
  const meta=metric==='cost'||metric==='average cost'||metric==='fines'?{valueLabel:label,currency:'USD',format:'currency'}:{valueLabel:label,unit:metric==='missed'?'inspections':noun};
  const visualization:Visualization|undefined=p.visual==='none'?undefined:want==='bar'?{type:'bar',title:heading,data:rows.map(r=>({name:r.key,value:round(r.value,2),label:show(r.value)})),meta}:want==='line'?{type:'line',title:heading,data:rows.map(r=>({date:r.key,value:round(r.value,2)})),meta}:{type:'table',title:heading,columns:[dim==='total'?'Scope':dim[0].toUpperCase()+dim.slice(1),label,'Records'],rows:rows.map(r=>[r.key,show(r.value),r.g.count])};
  return answer(text+note,visualization,sources,[],ids);
}
function retrieve(d:Dataset,q:string,p:QueryPlan):Answer {
  const words=Array.from(new Set(clean(q.toLowerCase()).match(/[a-z0-9-]{3,}/g)??[])).filter(w=>!['the','what','which','with','this','that','show','for','well','wells','was','are','and','from'].includes(w));
  const scoped=d.documents.filter(doc=>(!p.wellIds?.length||!doc.assetId||p.wellIds.includes(doc.assetId))&&(!p.areaId||!doc.assetId||wellById(d,doc.assetId)?.metadata.area_id===p.areaId));
  const ranked=scoped.map(doc=>{const text=(doc.title+' '+doc.content).toLowerCase();return {doc,score:words.reduce((n,w)=>n+(text.includes(w)?1:0),0)};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
  if(!ranked.length)return answer('No matching evidence was found in the loaded dataset. Name a well, inspection, repair or protocol.');
  return answer('Relevant source passages: '+ranked.slice(0,3).map(({doc})=>doc.title+': '+clean(doc.content).slice(0,400)).join(' '),undefined,ranked.map(x=>citation(x.doc)),[],ranked.map(x=>x.doc.assetId).filter((v):v is string=>!!v));
}
/** Pure local planning fallback: no state mutation, model calls or question rewriting. */
export function inferPlan(d:Dataset,s:CopilotState,userId:string,q:string):QueryPlan {
  const ids=idsIn(q),area=d.areas.find(a=>q.toLowerCase().includes(String(a.name).toLowerCase())||q.toLowerCase().includes(String(a.area_id).toLowerCase()));
  const visual:QueryPlan['visual']=/no visual|without.*chart/i.test(q)?'none':/(?:as|in)(?: a)? table|table (?:instead|view|format)/i.test(q)?'table':/\bheat ?map\b/i.test(q)?'heatmap':/\bmap\b/i.test(q)?'map':/line chart|temperature.*trend/i.test(q)?'line':/bar chart/i.test(q)?'bar':/table/i.test(q)?'table':undefined;
  const p:QueryPlan={operation:'search',...(ids.length?{wellIds:ids}:{}),...(area?{areaId:area.area_id}:{}),...(visual?{visual}:{})};
  const kind=q.match(/pump[ _-]?jack|flowline|wellhead|rod[ _-]string|downhole[ _-]pump|separator/i)?.[0];if(kind)p.equipmentKind=kind.toLowerCase().replace(/[ -]/g,'_').replace('pumpjack','pump_jack');
  const type=q.match(/\bT\d+\b/i)?.[0];if(type)p.wellType=type.toUpperCase();
  const date=parseDate(q,today(d)),inspection=q.match(/\bINS-\d+-\d+\b/i)?.[0];if(inspection)p.inspectionId=inspection.toUpperCase();
  const literalIso=q.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0];if(literalIso&&!validDate(literalIso))p.date=literalIso;
  const year=q.match(/\b20\d{2}\b/)?.[0];if(year&&!date&&!/(?:last|past)\s+\d+\s+years?/i.test(q))p.year=Number(year);
  if(/this year/i.test(q))p.year=Number(today(d).slice(0,4));
  const periods=q.match(/\b(20\d{2}-\d{2}-\d{2})\s+(?:through|to|until|and)\s+(20\d{2}-\d{2}-\d{2})\b/i);if(periods){p.from=periods[1];p.to=periods[2];}
  const privateRef=/wells? (?:we|I) discussed|those wells|these wells|same wells|earlier wells|the (?:three|two|four|five|\d+) wells/i.test(q)&&!ids.length;
  if(privateRef)p.resolvePrivateHistory=true;
  if(!isReadQuestion(q)){
    const temperatures=[...q.matchAll(/(-?\d+(?:\.\d+)?)\s*°?\s*C\b/gi)].map(m=>Number(m[1]));
    const volumes=[...q.matchAll(/(\d+(?:\.\d+)?)\s*(?:bbl|barrels?)\b/gi)].map(m=>Number(m[1]));
    const correctionIntent=/wrong|correct(?:ion|ed)?|faulty|re-?measured|field crew measured|actual(?:ly| value)|real value|(?<!\b(?:was|were|been|is)\s+)\b(?:set|update|change)\b[^.;]{0,80}?\bto\s*-?\d/i.test(q);
    if(ids.length&&correctionIntent&&(temperatures.length||volumes.length||/false positive|not (?:a spill|oil|crude)/i.test(q))){
      p.operation='correction';p.date=date;p.reason=q;
      if(volumes.length&&/spill|bbl|barrel/i.test(q)){p.field='spill_est_volume_bbl';p.value=correctedNumber(q,'volume');}
      else if(temperatures.length){p.field=/ambient|air temperature/i.test(q)&&!/wellhead/i.test(q)?'ambient_temp_c':'wellhead_temp_c';p.value=correctedNumber(q,'temperature');}
      else {p.field='spill_detected';p.value=false;}return p;
    }
    if(p.wellType&&/all|every|team.*wants|rule/i.test(q)&&/root[- ]cause|RCA/i.test(q)){p.operation='rule';p.threshold=Number(q.match(/after\s+(\d+)\s+(?:corrective\s+)?repairs?/i)?.[1]);return p;}
    if(ids.length&&/running fine|back online|is producing|is running/i.test(q)&&!/planned|will be|expects?/i.test(q)){p.operation='claim';p.date=date;return p;}
    if(/\b(?:just for me|for me only|only for me|whenever you (?:list|show)|my (?:display )?preference)\b/i.test(q)){p.operation='preference';p.reason=q;return p;}
    if(ids.length&&/\b(?:swapped|swap(?:ped)? out|replaced|changed out)\b/i.test(q)&&/\b(?:pump|motor|part|equipment|esp)\b/i.test(q)){p.operation='claim';p.date=date;return p;}
    if(/FYI|note for|for everyone|remember|heads up|please note/i.test(q)||ids.length&&/planned|shut in|workover/i.test(q)){p.operation='note';p.date=date;return p;}
  }
  const priorRecall=(s.history[userId]??[]).some(h=>/\brecall/i.test(h.userText));
  if(/\b(?:reservoir|tubing|casing|bottom[- ]hole)\s+pressure\b|\bpressure (?:data|map)\b|\bproduced the most oil\b|\bproduction volumes?\b|\bbarrels? (?:of oil )?produced\b|\bflow ?rates?\b/i.test(q)){p.operation='data_availability';return p;}
  if(/\b(?:deal with|tackle|handle|fix|prioriti[sz]e|address)\b.{0,20}\bfirst\b|\bwhich (?:one|well) (?:would|should) (?:you|we)\b.{0,30}\bfirst\b/i.test(q)&&!/\b(?:sound|behav|noise|crew|cost)/i.test(q)){p.operation='triage';return p;}
  if(/\brecall(?:ed)?\b/i.test(q)||priorRecall&&/\bthe pumps\b|\bthose (?:wells|pumps)\b/i.test(q)){p.operation='recalled_pumps';return p;}
  if(/\bbypass/i.test(q)){p.operation='bypass_compliance';return p;}
  if(/\bletter\b|\bwrote to us\b/i.test(q)){p.operation='regulator_letter';return p;}
  if(/\b(?:gas|h2s|odou?rs?|rotten[- ]egg)\b/i.test(q)){p.operation='gas_response';return p;}
  if(/\bcold[- ]weather\b|\bheat[- ]trace\b|\bfreez/i.test(q)){p.operation='cold_weather';return p;}
  if(/\bwho leads\b|\bhow many wells does (?:that|the|this) team\b/i.test(q)){p.operation='team_info';return p;}
  if(/\bdisagree\b|\bwhich status is right\b/i.test(q)){p.operation='status_disagreement';return p;}
  if(/\b(?:sound|behav|noise|noisy|knock|vibrat|squeal|grind|rattl)\w*|\bsend a crew\b/i.test(q)){p.operation='note_risk';if(/\b(?:three|3)\b/.test(q))p.topK=3;return p;}
  if(/\bwaiting on\b|\blonger than the repair\b|\bshut in longer\b/i.test(q)){p.operation='delay_reasons';return p;}
  if(/\bhotter\b|\bruns? (?:hot|warm)/i.test(q)){p.operation='region_temperature';return p;}
  if(/(?:downtime|shut.in|workover|maintenance).{0,30}planned|planned.{0,30}(?:downtime|shut.in|workover|maintenance)|shared (?:notes|knowledge)|what.*told/i.test(q)){p.operation='shared_knowledge';return p;}
  if(/repair.*cost|cost.*repair|maintenance.*cost|cost.*maintenance|those wells|wells we discussed/i.test(q)){p.operation='costs';return p;}
  if(/root[- ]cause|RCA/i.test(q)){p.operation='rca';return p;}
  if(/heat ?map|spills? by .*month|area.*month/i.test(q)){p.operation='heatmap';return p;}
  if(/contain|within the SOP|time limit/i.test(q)&&/spill|SOP/i.test(q)){p.operation='containment';return p;}
  if(/rules?.*(?:broken|breach)|compliance|still open|violation|overdue/i.test(q)){p.operation='compliance';return p;}
  const negativeList=/(?:non[- ]producing|not\s+producing|not\s+running|stopped)/i.test(q)&&/\b(?:list|show|which|all)\b/i.test(q)&&!ids.length;
  const historicalAnalysis=/downtime|days.*down|down.*days|rank|most|top\s+\d|(?:last|past)\s+\d+\s+(?:days?|weeks?|months?|years?)|\bduring\b|\bsince\b/i.test(q)||!!(p.year||p.from||p.to||date);
  if(negativeList&&!historicalAnalysis){p.operation='area_status';return p;}
  if(/downtime|days.*down|down.*days/i.test(q)){p.operation=area&&!ids.length&&/most|top|which|[123456789]/i.test(q)?'downtime_ranking':'downtime';p.topK=Number(q.match(/(?:top|which)\s+(\d+)/i)?.[1]??3);return p;}
  if(/temperature.*(?:against|trend|history|over)|line chart|last \d+ weeks/i.test(q)){p.operation='temperature_history';p.weeks=Number(q.match(/(?:last|past)\s+(\d+)\s+weeks?/i)?.[1]??13);if(date&&!periods)p.date=date;return p;}
  if(/not producing|stopped|not running/i.test(q)&&area&&!ids.length){p.operation='area_status';return p;}
  if(/spill|oil sheen|real oil|crude/i.test(q)){p.operation='spills';if(date&&!periods)p.date=date;p.reportableOnly=/reportable|need(?:ed|s)? (?:a )?report|report to.*regulator|require.*report/i.test(q);return p;}
  if(ids.length&&/produc|status|right now|running|shut in/i.test(q)){p.operation='status';if(date&&!periods)p.date=date;return p;}
  if(/repair|maintenance|cost/i.test(q)&&ids.length){p.operation='costs';return p;}
  return p;
}
/** Execute only the typed operation; shared feedback and private references stay distinct. */
export function executePlan(d:Dataset,s:CopilotState,userId:string,q:string,plan:QueryPlan):Answer {
  let p:QueryPlan={...plan,wellIds:plan.wellIds?.map(id=>id.toUpperCase())},memory:string[]=[];
  for(const value of [p.from,p.to,p.date].filter((v):v is string=>v!==undefined))if(!validDate(value))return answer('The requested date is invalid. Use YYYY-MM-DD.');
  if(p.from&&p.to&&p.from>p.to)return answer('The requested start date is after its end date.');
  if(p.year!==undefined&&(!Number.isInteger(p.year)||p.year<1900||p.year>9999))return answer('The requested year is invalid.');
  if(p.weeks!==undefined&&(!Number.isInteger(p.weeks)||p.weeks<1||p.weeks>5200))return answer('The requested week count is invalid.');
  if(p.topK!==undefined&&(!Number.isInteger(p.topK)||p.topK<1))return answer('The requested result count is invalid.');
  const unknown=p.wellIds?.filter(id=>!wellById(d,id));if(unknown?.length)return answer('Well ID(s) not found in the loaded dataset: '+unknown.join(', ')+'. No records were changed.');
  if(p.areaId&&!d.areas.some(a=>a.area_id===p.areaId))return answer('Unknown area ID: '+p.areaId+'.');
  if(p.wellType&&!d.manuals[p.wellType])return answer('No manual is loaded for well type '+p.wellType+'.');
  // Fleet-level document tools resolve their own topical references ("those wells", "the pumps");
  // substituting well IDs from an unrelated earlier answer would silently narrow them.
  if(['gas_response','cold_weather','bypass_compliance','regulator_letter','recalled_pumps','team_info','status_disagreement','note_risk','delay_reasons','region_temperature','data_availability','triage'].includes(p.operation))delete p.resolvePrivateHistory;
  if(p.resolvePrivateHistory&&!p.wellIds?.length){
    const count=Number(q.match(/\b(\d+)\s+wells/i)?.[1]??({three:3,two:2,four:4,five:5} as Record<string,number>)[q.match(/\b(three|two|four|five)\s+wells/i)?.[1]?.toLowerCase()??'']??0);
    const prior=[...(s.history[userId]??[])].reverse().find(h=>h.wellIds.length>0&&(!count||new Set(h.wellIds).size===count));
    if(!prior)return answer('I have no matching earlier conversation with '+person(d,userId)+' that identifies those wells. Conversation memory is private; I cannot use another user’s history.',undefined,[],[],[],['No matching private history for '+person(d,userId)+'.']);
    p.wellIds=Array.from(new Set(prior.wellIds)).slice(0,count||undefined);memory.push('Resolved from '+person(d,userId)+'’s private conversation: '+p.wellIds.join(', '));
    if(p.wellIds.some(id=>!wellById(d,id)))return answer('Some wells from the earlier conversation are not present in the loaded dataset.',undefined,[],[],[],memory);
  }
  if(!['correction','rule','note','claim','search'].includes(p.operation)&&scopeFor(d,p).length===0)return answer('No wells match the requested scope. Check the well, area and type filters.');
  let result:Answer;
  switch(p.operation){
    case 'correction':case 'rule':case 'note':case 'claim':result=mutationAnswer(d,s,userId,q,p);break;
    case 'status':{
      const scope=scopeFor(d,p);if(!p.wellIds?.length&&!p.areaId)return answer('Name one or more wells for a status answer.');
      const answers=scope.map(w=>statusAnswer(d,s,w,p.visual,p));
      result=answers.length===1?answers[0]:answer(answers.map(a=>a.answer).join(' '),p.visual==='none'?undefined:{type:answers[0]?.visualization?.type??'status',title:p.visual==='bar'?'Latest wellhead temperature above air':'Current well status',data:answers.flatMap(a=>a.visualization?.data??[]),columns:answers[0]?.visualization?.columns,rows:answers.flatMap(a=>a.visualization?.rows??[]),meta:answers[0]?.visualization?.meta},answers.flatMap(a=>a.citations),answers.flatMap(a=>a.conflicts),answers.flatMap(a=>a.referencedWellIds));break;
    }
    case 'area_status':result=areaStatus(d,s,p);break;
    case 'temperature_history':result=historyAnswer(d,s,q,p);break;
    case 'downtime':case 'downtime_ranking':result=downtimeAnswer(d,s,q,p);break;
    case 'spills':result=spillsAnswer(d,s,q,p);break;
    case 'heatmap':result=heatmapAnswer(d,s,q,p);break;
    case 'containment':result=containmentAnswer(d,s,q,p);break;
    case 'compliance':result=complianceAnswer(d,s,q,p);break;
    case 'rca':result=rcaAnswer(d,s,q,p);break;
    case 'costs':result=costsAnswer(d,s,q,p);break;
    case 'shared_knowledge':result=sharedKnowledgeAnswer(d,s,p);break;
    case 'gas_response':result=gasResponse(d,s,userId,q,p);break;
    case 'cold_weather':result=coldWeather(d,s,userId,q,p);break;
    case 'bypass_compliance':result=bypassCompliance(d,s,userId,q,p);break;
    case 'regulator_letter':result=regulatorLetter(d,s,userId,q,p);break;
    case 'recalled_pumps':result=recalledPumps(d,s,userId,q,p);break;
    case 'team_info':result=teamInfo(d,s,userId,q,p);break;
    case 'status_disagreement':result=statusDisagreement(d,s,userId,q,p);break;
    case 'note_risk':result=noteRisk(d,s,userId,q,p);break;
    case 'delay_reasons':result=delayReasons(d,s,userId,q,p);break;
    case 'region_temperature':result=regionTemperature(d,s,userId,q,p);break;
    case 'data_availability':result=dataAvailability(d,s,userId,q,p);break;
    case 'triage':result=triage(d,s,userId,q,p);break;
    case 'preference':result=mutationAnswer(d,s,userId,q,p);break;
    case 'search':result=(p.date||p.inspectionId)&&/spill|real oil/i.test(q)?spillsAnswer(d,s,q,{...p,operation:'spills'}):queryRecords(d,s,q,p)??retrieve(d,q,p);break;
    default:result=answer('This operation is not supported.');
  }
  if(p.visual&&p.visual!=='none'&&result.visualization?.type!==p.visual)result.answer+=' The requested '+p.visual+' view is not supported for this result; '+(result.visualization?'showing a '+result.visualization.type+' view of the verified data.':'the available evidence is shown as text.');
  if(memory.length)result.memory=[...memory,...(result.memory??[])];return result;
}
export function answerQuestion(d:Dataset,s:CopilotState,userId:string,q:string):Answer {return executePlan(d,s,userId,q,inferPlan(d,s,userId,q));}
/** Shared helpers for tool modules in server/tools/ (same semantics as the built-in domain tools). */
export const toolkit={clean,day,ms,round,usd,today,dateLabel,person,wellById,docFor,citation,cite,feedbackCitation,answer,manualCitation,threshold,effective,production,latest,inRange,validDate,parseDate,rangeFor,scopeFor};
