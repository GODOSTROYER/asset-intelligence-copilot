import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import { Activity, CircleHelp, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import type { Visualization } from "./contracts";
import { ResultControls, usePagination } from "./ResultControls";

function fmt(value:any){
  if(value===null||value===undefined||value==="")return "—";
  if(typeof value==="number")return Number.isInteger(value)?value.toLocaleString():value.toLocaleString(undefined,{maximumFractionDigits:2});
  return String(value);
}
function RecordStatusVisual({visual}:{visual:Visualization}){
  return <div className="record-status-list">{(visual.data??[visual.meta??{}]).map((item,i)=>{
    const correction=Object.hasOwn(item,"corrected")||Object.hasOwn(item,"correctedValue");
    const rule=Object.hasOwn(item,"count")&&Boolean(item.wellType);
    const claim=Object.hasOwn(item,"claim")||item.confirmed===false;
    const label=correction?"Correction applied":rule?"Shared type rule saved":claim?"Unconfirmed field claim":"Shared field note saved";
    const field=String(item.field??"Reading").replaceAll("_"," ");
    const unit=String(item.field??"").endsWith("_c")?" °C":String(item.field??"").endsWith("_bbl")?" bbl":"";
    return <section className="record-status" key={item.id??i} aria-label={label}>
      <div className="record-status-heading"><span className={"record-status-icon "+(claim?"record-claim":"")}>{claim?<CircleHelp size={19}/>:<ShieldCheck size={19}/>}</span><div><h3>{item.assetId??item.wellType??label}</h3><p>{label}{item.inspectionId?" · "+item.inspectionId:""}</p></div></div>
      {correction?<><h4>{field}</h4><dl className="correction-values"><div><dt>Original raw value</dt><dd>{fmt(item.original??item.originalValue)}{unit}</dd></div>{item.previous!==undefined&&<div><dt>Previous effective</dt><dd>{fmt(item.previous)}{unit}</dd></div>}<div className="corrected-value"><dt>Corrected value</dt><dd>{fmt(item.corrected??item.correctedValue)}{unit}</dd></div></dl>{item.reason&&<p className="record-status-text">{item.reason}</p>}</>
        :rule?<p className="record-status-text">Root-cause analysis after <strong>{fmt(item.count)} corrective repairs</strong> to {String(item.equipment??item.equipmentKind??"equipment").replaceAll("_"," ")} on {item.wellType} wells.</p>
        :<p className="record-status-text">{item.claim??item.text??item.reason??"Saved to shared knowledge."}</p>}
      <div className="record-status-footer">{item.author&&<span>Recorded by {item.author}</span>}{item.validFrom&&<span>From {item.validFrom}</span>}{item.days&&<span>{item.days} days</span>}{claim&&<span>Requires field confirmation</span>}</div>
    </section>;
  })}</div>;
}
function StatusVisual({visual}:{visual:Visualization}){
  if((visual.data?.length??0)>1)return <div className="status-list">{visual.data!.map((item,i)=><StatusVisual key={(item.assetId??item.id??"")+i} visual={{...visual,data:[item]}}/>)}</div>;
  const item=visual.data?.[0]??visual.meta??{};
  if(Object.hasOwn(item,"corrected")||Object.hasOwn(item,"correctedValue")||Object.hasOwn(item,"count")||Object.hasOwn(item,"claim")||Object.hasOwn(item,"text"))return <RecordStatusVisual visual={visual}/>;
  const producing=String(item.status??"").toLowerCase()==="producing";
  const unknown=!item.status||String(item.status).toLowerCase()==="unknown";
  const hasState=Boolean(item.status);
  const delta=Number(item.delta??item.deltaC??NaN);
  const values=[
    ["Wellhead",item.head??item.wellhead??item.wellheadTemp,item.head!==undefined||item.wellhead!==undefined?"°C":""],
    ["Air",item.ambient??item.air??item.ambientTemp,item.ambient!==undefined||item.air!==undefined?"°C":""],
    ["Above air",Number.isFinite(delta)?(delta>0?"+":"")+fmt(delta)+" °C":"—",""],
    ["Type threshold",item.threshold!==undefined?fmt(item.threshold)+" °C":"—",""],
    ["Last inspection",item.date??item.inspectedAt??"—",""]
  ];
  return <section className="status-visual" aria-label="Well status card">
    <div className="status-card-head">
      <div className="status-symbol"><Activity size={19}/></div>
      <div className="status-title-wrap"><h3>{item.assetId??item.wellId??"Well status"}</h3><p>{item.name??"Latest inspection evidence"}</p></div>
      {hasState&&<span className={"status-pill "+(unknown?"status-unknown":producing?"status-up":"status-down")}><i/>{item.status}</span>}
    </div>
    <div className="status-metrics">
      {values.map(([label,value,unit])=><div className="status-metric" key={label}><span>{label}</span><strong>{fmt(value)}{unit&&fmt(value)!=="—"?" "+unit:""}</strong></div>)}
    </div>
    <div className="status-summary">
      <div className={"status-summary-icon "+(unknown?"neutral":producing?"green":"amber")}>{unknown?<CircleHelp size={18}/>:producing?<TrendingUp size={18}/>:<TrendingDown size={18}/>}</div>
      <div><strong>{item.status??"Status from inspection"}</strong><p>{item.reason??"Derived from wellhead temperature relative to ambient, using the manual threshold."}</p></div>
    </div>
    {(item.inspectionId||item.inspector||item.method)&&<div className="status-foot">{item.inspectionId&&<span>{item.inspectionId}</span>}{item.inspector&&<span>Inspected by {item.inspector}</span>}{item.method&&<span>{item.method}</span>}{item.recordedStatus&&<span>System status: {item.recordedStatus}</span>}</div>}
  </section>;
}
function StatusCollection({visual}:{visual:Visualization}){
  const records=visual.data??(visual.meta?[visual.meta]:[]);
  const pagination=usePagination(records.length,10);
  if(records.length===0)return <div className="visual-empty">No status records in this result.</div>;
  return <>{records.length>1&&<ResultControls total={records.length} {...pagination} label="records"/>}<div className="status-list">{records.slice(pagination.start,pagination.start+pagination.size).map((item,i)=><StatusVisual key={(item.assetId??item.id??"")+i} visual={{...visual,data:[item]}}/>)}</div></>;
}
function DataTable({visual}:{visual:Visualization}){
  const cols=visual.columns??[];
  const rows=(visual.rows??[]).map((row:any)=>Array.isArray(row)?row:(cols.map((c)=>row?.[c])));
  const pagination=usePagination(rows.length);
  return <><ResultControls total={rows.length} {...pagination} label="rows"/><div className="table-scroll result-table-scroll" tabIndex={0} role="region" aria-label={(visual.title??"Result")+" table"}><table className="answer-table">
    <caption className="sr-only">{visual.title??"Result data"}</caption>
    {cols.length>0&&<thead><tr>{cols.map((c,i)=><th key={c+i} scope="col">{c}</th>)}</tr></thead>}
    <tbody>{rows.slice(pagination.start,pagination.start+pagination.size).map((row:any[],i)=><tr key={pagination.start+i}>{row.map((cell:any,j)=><td key={j}><span className="table-cell-content">{typeof cell==="object"&&cell!==null?JSON.stringify(cell):fmt(cell)}</span></td>)}</tr>)}
    {!rows.length&&<tr><td colSpan={Math.max(1,cols.length)} className="table-empty">No rows in this result.</td></tr>}</tbody>
  </table></div></>;
}
function LineVisual({visual}:{visual:Visualization}){
  const allData=visual.data??[];
  const assets=useMemo(()=>Array.from(new Set(allData.map((item)=>String(item.assetId??"")).filter(Boolean))),[allData]);
  const [chosenAsset,setChosenAsset]=useState("");
  const activeAsset=assets.includes(chosenAsset)?chosenAsset:assets[0];
  const data=useMemo(()=>assets.length>4?allData.filter((item)=>item.assetId===activeAsset):allData,[allData,assets,activeAsset]);
  const isDown=(item:any)=>item.producing===false||String(item.status??"").toLowerCase()==="not producing";
  const downReadings=data.filter(isDown);
  const keys=useMemo(()=>{
    const candidates=Array.from(new Set(data.flatMap((item)=>Object.keys(item))));
    return candidates.filter((k)=>data.some((item)=>typeof item[k]==="number")&&!["delta","lat","lon"].includes(k)).slice(0,3);
  },[data]);
  const {chartData,series}=useMemo(()=>{
    const assetIds=Array.from(new Set(data.map((item)=>String(item.assetId??"")).filter(Boolean)));
    if(assetIds.length<=1)return {chartData:data,series:keys.map((key,i)=>({key,dataKey:key,name:key==="wellhead"?"Wellhead °C":key==="air"?"Ambient air °C":key,colorIndex:i,assetId:""}))};
    const dates=new Map<string,any>();
    for(const item of data){
      const row=dates.get(item.date)??{date:item.date,__records:{}};
      row.__records[item.assetId]=item;
      for(const key of keys)row[item.assetId+"__"+key]=item[key];
      dates.set(item.date,row);
    }
    return {chartData:[...dates.values()].sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)),series:assetIds.flatMap((assetId,i)=>keys.map((key)=>({key,dataKey:assetId+"__"+key,name:assetId+" · "+(key==="wellhead"?"Wellhead °C":key==="air"?"Air °C":key),colorIndex:i,assetId})))};
  },[data,keys]);
  const colors=["#2164e8","#08a9a0","#8954b9","#c37817","#c75669","#4c829b"];
  if(data.length===0)return <div className="visual-empty">No temperature readings in this result.</div>;
  return <div className="chart-frame">
    {assets.length>4&&<label className="chart-well-select">View one of {assets.length.toLocaleString()} wells <select aria-label="Well shown in temperature chart" value={activeAsset} onChange={(e)=>setChosenAsset(e.target.value)}>{assets.map((id)=><option key={id} value={id}>{id}</option>)}</select></label>}
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData} margin={{top:12,right:18,bottom:4,left:0}}>
        <CartesianGrid stroke="#e9edf4" vertical={false}/>
        <XAxis dataKey="date" tick={{fontSize:11,fill:"#76849a"}} tickLine={false} axisLine={false} minTickGap={24}/>
        <YAxis tick={{fontSize:11,fill:"#76849a"}} tickLine={false} axisLine={false} width={42}/>
        <Tooltip contentStyle={{border:"1px solid #dfe5ef",borderRadius:10,fontSize:12}}/>
        <Legend wrapperStyle={{fontSize:11,paddingTop:10}}/>
        {series.map((line)=><Line key={line.dataKey} isAnimationActive={false} type="linear" dataKey={line.dataKey} name={line.name} stroke={colors[line.colorIndex%colors.length]} strokeDasharray={line.assetId&&line.key==="air"?"5 4":undefined} strokeWidth={2.2} dot={(props:any)=>{
          if(!Number.isFinite(props.cx)||!Number.isFinite(props.cy))return <g key={props.index}/>;
          const record=line.assetId?props.payload.__records?.[line.assetId]:props.payload;
          const down=line.key==="wellhead"&&isDown(record??{});
          return <circle key={record?.id??props.index} cx={props.cx} cy={props.cy} r={down?5:2.1} fill={down?"#c37817":colors[line.colorIndex%colors.length]} stroke={down?"#fff":"none"} strokeWidth={down?2:0}><title>{props.payload.date+" · "+line.name+" · "+(down?"Not producing · ":"")+fmt(props.value)+" °C"}</title></circle>;
        }} activeDot={{r:5}}/> )}
      </LineChart>
    </ResponsiveContainer>
    <div className="chart-note">Readings follow inspection dates. Producing status is derived from the applicable manual threshold.</div>
    {downReadings.length>0&&<div className="nonproducing-readings"><strong><i/>Non-producing readings</strong><ul>{downReadings.map((item,i)=><li key={item.id??i}>{item.date}{item.assetId?" · "+item.assetId:""}</li>)}</ul></div>}
    <details className="chart-data-details"><summary>View inspection readings</summary><DataTable visual={{type:"table",title:"Inspection readings",columns:["Well","Date","Wellhead °C","Air °C","Above air °C","Producing"],rows:data.map((item)=>[item.assetId??"—",item.date,item.wellhead,item.air,item.delta,item.producing===true?"Yes":item.producing===false?"No":"Unknown"])}}/></details>
  </div>;
}
function BarVisual({visual}:{visual:Visualization}){
  const data=visual.data??[];
  const pagination=usePagination(data.length,10);
  const visibleData=data.slice(pagination.start,pagination.start+pagination.size);
  const meta=visual.meta??{};
  const series:string[]=meta.stacked&&Array.isArray(meta.series)?meta.series.map(String):[];
  const stacked=series.length>0;
  const seriesColors=["#2164e8","#08a9a0","#c37817","#8954b9","#c75669","#4c829b"];
  const seriesLabel=(key:string)=>key.charAt(0).toUpperCase()+key.slice(1);
  const rowTotal=(item:any)=>series.reduce((sum,key)=>sum+(Number(item[key])||0),0);
  const currency=typeof meta.currency==="string"&&/^[A-Z]{3}$/.test(meta.currency)?meta.currency:meta.format==="currency"||meta.unit==="USD"?"USD":undefined;
  const valueLabel=meta.valueLabel??(currency?"Repair cost":"Days down");
  const fullValue=(value:unknown)=>{
    if(typeof value!=="number"||!Number.isFinite(value))return fmt(value);
    if(currency)return new Intl.NumberFormat("en-US",{style:"currency",currency,currencyDisplay:"code",maximumFractionDigits:2}).format(value);
    return fmt(value)+(meta.unit?" "+meta.unit:"");
  };
  const axisValue=(value:number)=>currency?new Intl.NumberFormat("en-US",{style:"currency",currency,currencyDisplay:"narrowSymbol",notation:"compact",maximumFractionDigits:1}).format(value):fmt(value);
  if(stacked)return <div className="chart-frame">
    <ResultControls total={data.length} {...pagination} label="items"/>
    {data.length===0?<div className="visual-empty">No values in this result.</div>:<div className="bar-chart-scroll"><ResponsiveContainer width="100%" height={Math.max(260,visibleData.length*40+80)}>
      <BarChart data={visibleData} layout="vertical" margin={{top:8,right:24,bottom:8,left:0}} accessibilityLayer>
        <CartesianGrid stroke="#e9edf4" horizontal={false}/>
        <XAxis type="number" domain={[0,Math.max(1,...data.map(rowTotal))]} allowDecimals={false} tick={{fontSize:11,fill:"#76849a"}} tickFormatter={axisValue} tickLine={false} axisLine={false}/>
        <YAxis type="category" dataKey="name" width={130} tick={{fontSize:11,fill:"#34445e"}} tickLine={false} axisLine={false}/>
        <Tooltip formatter={(value:any,name:any)=>[fullValue(value),name]} contentStyle={{border:"1px solid #dfe5ef",borderRadius:10,fontSize:12}}/>
        <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
        {series.map((key,i)=><Bar key={key} isAnimationActive={false} dataKey={key} name={seriesLabel(key)} stackId="a" fill={seriesColors[i%seriesColors.length]} barSize={22}/>)}
      </BarChart>
    </ResponsiveContainer></div>}
    <div className="chart-note">{valueLabel}{meta.unit?" · "+meta.unit:""} · stacked by {series.map(seriesLabel).join(", ")}</div>
    {data.length>0&&<details className="chart-data-details"><summary>View values for this page</summary><div className="table-scroll result-table-scroll" tabIndex={0} role="region" aria-label="Chart values"><table className="answer-table"><caption className="sr-only">{visual.title??valueLabel}</caption><thead><tr><th scope="col">{typeof meta.categoryLabel==="string"?meta.categoryLabel:"Item"}</th>{series.map((key)=><th scope="col" key={key}>{seriesLabel(key)}</th>)}<th scope="col">Total</th></tr></thead><tbody>{visibleData.map((item,i)=><tr key={String(item.name)+i}><th scope="row">{item.name}</th>{series.map((key)=><td key={key}>{fullValue(item[key])}</td>)}<td>{fullValue(rowTotal(item))}</td></tr>)}</tbody></table></div></details>}
  </div>;
  return <div className="chart-frame">
    <ResultControls total={data.length} {...pagination} label="items"/>
    {data.length===0?<div className="visual-empty">No values in this result.</div>:<div className="bar-chart-scroll"><ResponsiveContainer width="100%" height={Math.max(220,visibleData.length*36+45)}>
      <BarChart data={visibleData} layout="vertical" margin={{top:8,right:currency?86:45,bottom:8,left:0}} accessibilityLayer>
        <CartesianGrid stroke="#e9edf4" horizontal={false}/>
        <XAxis type="number" domain={[Math.min(0,...data.map((item)=>Number(item.value)||0)),Math.max(0,...data.map((item)=>Number(item.value)||0))]} tick={{fontSize:11,fill:"#76849a"}} tickFormatter={axisValue} tickLine={false} axisLine={false}/>
        <YAxis type="category" dataKey="name" width={95} tick={{fontSize:11,fill:"#34445e"}} tickLine={false} axisLine={false}/>
        <Tooltip formatter={(value:any)=>[fullValue(value),valueLabel]} contentStyle={{border:"1px solid #dfe5ef",borderRadius:10,fontSize:12}}/>
        <Bar isAnimationActive={false} dataKey="value" name={valueLabel} fill="#2368f6" radius={[0,5,5,0]} barSize={20} label={{position:"right",fontSize:11,fill:"#60708a",formatter:(v:any)=>currency?axisValue(v):fmt(v)}}/>
      </BarChart>
    </ResponsiveContainer></div>}
    <div className="chart-note">{valueLabel}{currency?" · "+currency:meta.unit?" · "+meta.unit:""}</div>
    {data.length>0&&<details className="chart-data-details"><summary>View values for this page</summary><div className="table-scroll result-table-scroll" tabIndex={0} role="region" aria-label="Chart values"><table className="answer-table"><caption className="sr-only">{visual.title??valueLabel}</caption><thead><tr><th scope="col">{typeof meta.categoryLabel==="string"?meta.categoryLabel:"Well"}</th><th scope="col">{valueLabel}</th></tr></thead><tbody>{visibleData.map((item,i)=><tr key={String(item.name)+i}><th scope="row">{item.name}</th><td>{fullValue(item.value)}</td></tr>)}</tbody></table></div></details>}
  </div>;
}
function MapVisual({visual}:{visual:Visualization}){
  const points=visual.data??[];
  const [query,setQuery]=useState("");
  const filtered=useMemo(()=>points.filter((point)=>String(point.assetId??"").toLowerCase().includes(query.toLowerCase())),[points,query]);
  const pagination=usePagination(filtered.length);
  const pointDetails=(point:any)=>[point.date,point.barrels!==undefined?fmt(point.barrels)+" bbl":point.status??point.state,point.barrels===undefined&&Number.isFinite(point.delta)?fmt(point.delta)+" °C above air":undefined].filter(Boolean).join(" · ");
  const pointColor=(point:any)=>String(point.status??point.state??"").toLowerCase()==="not producing"?"#c37817":"#2164e8";
  const coords=points.filter((p)=>p.lat!==null&&p.lon!==null&&p.lat!==""&&p.lon!==""&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))&&Math.abs(Number(p.lat))<=90&&Math.abs(Number(p.lon))<=180);
  const lats=coords.map((p)=>Number(p.lat)),lons=coords.map((p)=>Number(p.lon));
  const minLat=Math.min(...lats),maxLat=Math.max(...lats),minLon=Math.min(...lons),maxLon=Math.max(...lons);
  const spanLat=maxLat-minLat||.01,spanLon=maxLon-minLon||.01;
  const plotted=coords.map((p,i)=>({p,x:72+(maxLon===minLon ? .5 : ((Number(p.lon)-minLon)/spanLon))*330,y:25+(maxLat===minLat ? .5 : ((maxLat-Number(p.lat))/spanLat))*180,index:i}));
  return <div className="map-visual">
    <div className="map-canvas">
      <svg viewBox="0 0 480 270" role="img" aria-label="Coordinate plot of wells using recorded latitude and longitude. No geographic basemap.">
        <defs><pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#dce6ed" strokeWidth="1"/></pattern></defs>
        <rect x="65" y="20" width="350" height="195" fill="url(#map-grid)"/>
        <path d="M65 20V215H415" fill="none" stroke="#a8bacb"/>
        {coords.length>0&&<><text x="61" y="29" textAnchor="end" fontSize="10" fill="#77869a">{maxLat.toFixed(3)}°</text><text x="61" y="210" textAnchor="end" fontSize="10" fill="#77869a">{minLat.toFixed(3)}°</text><text x="70" y="234" fontSize="10" fill="#77869a">{minLon.toFixed(3)}°</text><text x="412" y="234" textAnchor="end" fontSize="10" fill="#77869a">{maxLon.toFixed(3)}°</text></>}
        {plotted.map(({p,x,y,index})=><g key={(p.assetId??"")+index} tabIndex={coords.length<=20?0:-1} role="img" aria-label={p.assetId+", "+pointDetails(p)}>
          <title>{p.assetId+" · "+pointDetails(p)+" · "+p.lat+", "+p.lon}</title>
          <circle cx={x} cy={y} r="12" fill={pointColor(p)} opacity=".12"/>
          <circle cx={x} cy={y} r="5.5" fill={pointColor(p)} stroke="#fff" strokeWidth="2"/>
          {coords.length<=20&&<text x={x+9} y={y-9+(index%2)*16} fontSize="10" fill="#223857" fontWeight="600">{p.assetId}</text>}
        </g>)}
        <text x="240" y="260" textAnchor="middle" fontSize="11" fill="#77869a">Longitude · recorded coordinates</text>
        <text x="16" y="120" transform="rotate(-90 16 120)" textAnchor="middle" fontSize="11" fill="#77869a">Latitude</text>
      </svg>
      {!coords.length&&<div className="map-empty">No coordinates are available for these results.</div>}
    </div>
    {points.length>20&&<p className="chart-note">{coords.length.toLocaleString()} points plotted. Use the record list to identify wells; labels are hidden to prevent overlap.</p>}
    {points.length>10&&<label className="result-filter"><span className="sr-only">Filter mapped record list</span><input value={query} onChange={(e)=>{setQuery(e.target.value);pagination.onPage(0);}} placeholder="Filter the well record list…"/></label>}
    <ResultControls total={filtered.length} {...pagination} label="records"/>
    <div className="map-list" tabIndex={0} role="region" aria-label="Mapped well records">{filtered.slice(pagination.start,pagination.start+pagination.size).map((p,i)=><div className="map-item" key={(p.assetId??"")+i}><span className="map-index">{String(pagination.start+i+1).padStart(2,"0")}</span><div><strong>{p.assetId??"Well"}</strong>{pointDetails(p)&&<span>{pointDetails(p)}</span>}</div><small>{coords.includes(p)?Number(p.lat).toFixed(5)+", "+Number(p.lon).toFixed(5):"Coordinates unavailable"}</small></div>)}{filtered.length===0&&<p className="visual-empty">{query?"No wells match this filter.":"No records in this result."}</p>}</div>
  </div>;
}
function Heatmap({visual}:{visual:Visualization}){
  const rows=visual.rows??[],columns=visual.columns??[];
  const pagination=usePagination(rows.length);
  const all=rows.flatMap((r:any[])=>r.slice(1,-1).map(Number).filter(Number.isFinite));
  const max=Math.max(1,...all);
  return <><ResultControls total={rows.length} {...pagination} label="areas"/><div className="table-scroll heatmap-scroll result-table-scroll" tabIndex={0} role="region" aria-label={(visual.title??"Heatmap")+" data"}><table className="heat-table">
    <thead><tr>{columns.map((c,i)=><th key={c+i}>{c}</th>)}</tr></thead>
    <tbody>{rows.slice(pagination.start,pagination.start+pagination.size).map((row:any[],ri)=><tr key={ri}>{row.map((cell:any,ci:number)=>{
      const n=Number(cell),hasFill=ci>0&&ci<row.length-1&&Number.isFinite(n);
      const alpha=hasFill ? .10+(n/max)*.63 : 0;
      return <td key={ci} className={ci===0?"heat-row-label":ci===row.length-1?"heat-total":""} style={hasFill?{backgroundColor:"rgba(35,104,246,"+alpha+")",color:alpha>.44?"#fff":"#183354"}:undefined}>{fmt(cell)}</td>;
    })}</tr>)}{rows.length===0&&<tr><td colSpan={Math.max(1,columns.length)} className="table-empty">No areas in this result.</td></tr>}</tbody>
  </table></div></>;
}

export default function VisualBlock({visual}:{visual:Visualization}){
  const first=visual.data?.[0]??visual.meta??{};
  const recordStatus=["corrected","correctedValue","claim","text","count"].some((key)=>Object.hasOwn(first,key));
  return <section className="visual-block">
    {visual.title&&<div className="visual-heading"><div><span className="visual-mark"><ShieldCheck size={14}/></span><h3>{visual.title}</h3></div><span className="visual-type">{visual.type==="status"?recordStatus?"SHARED RECORD":"LATEST INSPECTION":visual.type==="map"?"COORDINATES":visual.type.toUpperCase()}</span></div>}
    {visual.type==="status"?<StatusCollection visual={visual}/>
      :visual.type==="table"?<DataTable visual={visual}/>
      :visual.type==="line"?<LineVisual visual={visual}/>
      :visual.type==="bar"?<BarVisual visual={visual}/>
      :visual.type==="map"?<MapVisual visual={visual}/>
      :visual.type==="heatmap"?<Heatmap visual={visual}/>
      :<div className="visual-fallback">This result includes structured data. Open the citations to inspect the source records.</div>}
  </section>;
}

