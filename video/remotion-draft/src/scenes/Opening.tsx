import {SharedFrame,blue,mint} from '../Design';
export const Opening=()=> <SharedFrame dark section="01 / The problem">
  <div style={{position:'absolute',left:88,top:180,fontSize:104,lineHeight:1.02,fontWeight:600,letterSpacing:-5}}>Every answer.<br/><span style={{color:blue}}>An evidence trail.</span></div>
  <div style={{position:'absolute',left:92,top:470,width:1110,fontSize:38,lineHeight:1.35,color:'#cfdae2'}}>One conversation across inspections, repairs,<br/>manuals, and field notes.</div>
  <div style={{position:'absolute',left:92,top:718,display:'flex',gap:78,fontSize:29,color:mint}}><span>Ask a question</span><span>Inspect the calculation</span><span>Open the source</span></div>
  <div style={{position:'absolute',right:115,top:209,width:200,height:200,border:'1px solid #4f7595',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:72,color:mint}}>↗</div>
</SharedFrame>;
