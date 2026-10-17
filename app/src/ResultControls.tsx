import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function usePagination(total:number,initialSize=25){
  const [requestedPage,setPage]=useState(0);
  const [size,setSize]=useState(initialSize);
  const pages=Math.max(1,Math.ceil(total/size));
  const page=Math.min(requestedPage,pages-1);
  return {page,size,pages,start:page*size,onPage:setPage,onSize:(next:number)=>{setSize(next);setPage(0);}};
}

export function ResultControls({total,page,size,pages,onPage,onSize,label="results"}:{total:number;page:number;size:number;pages:number;onPage:(page:number)=>void;onSize:(size:number)=>void;label?:string}){
  if(total===0)return null;
  return <nav className="result-controls" aria-label={label+" pages"}>
    <span aria-live="polite">{page*size+1}–{Math.min(total,(page+1)*size)} of {total.toLocaleString()} {label}</span>
    {total>10&&<label><span className="sr-only">{label} per page</span><select aria-label={label+" per page"} value={size} onChange={(e)=>onSize(Number(e.target.value))}>{[10,25,50,100].map((n)=><option key={n} value={n}>{n} / page</option>)}</select></label>}
    {pages>1&&<div className="result-page-buttons"><button type="button" aria-label={"Previous "+label+" page"} onClick={()=>onPage(page-1)} disabled={page===0}><ChevronLeft size={15}/></button><span>{page+1} / {pages}</span><button type="button" aria-label={"Next "+label+" page"} onClick={()=>onPage(page+1)} disabled={page>=pages-1}><ChevronRight size={15}/></button></div>}
  </nav>;
}
