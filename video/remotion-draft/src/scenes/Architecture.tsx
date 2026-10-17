import {SharedFrame,Heading,SmallLabel,ink} from '../Design';
export const Architecture=()=> <SharedFrame section="02 / The design">
  <Heading sub="Architecture diagram · hosted model, local calculation">Interpret the question. Calculate from records.</Heading>
  <div style={{position:'absolute',left:88,right:88,top:355,display:'flex',gap:22,alignItems:'center'}}>
    <div style={{width:320,padding:'40px 30px',borderTop:'5px solid #7098bf',fontSize:38,lineHeight:1.25}}>Operator<br/><b>question</b></div><span style={{fontSize:44,color:'#7894a8'}}>→</span>
    <div style={{width:340,padding:'40px 30px',background:ink,borderRadius:14,color:'white',fontSize:38,lineHeight:1.25}}>Hosted Gemini<br/><b>typed plan</b></div><span style={{fontSize:44,color:'#7894a8'}}>→</span>
    <div style={{width:340,padding:'40px 30px',background:'#dbeae3',borderRadius:14,fontSize:38,lineHeight:1.25}}>Local tools<br/><b>exact calculation</b></div><span style={{fontSize:44,color:'#7894a8'}}>→</span>
    <div style={{width:330,padding:'40px 20px',borderTop:'5px solid #2c77c9',fontSize:38,lineHeight:1.25}}>Answer<br/><b>visual + sources</b></div>
  </div>
  <SmallLabel top={720}>Data → rules → numbers → citations</SmallLabel>
  <div style={{position:'absolute',left:88,top:772,fontSize:34,maxWidth:1600,lineHeight:1.35,color:'#476176'}}>Numeric answers come from typed domain operations.<br/>Source passages support general document questions.</div>
</SharedFrame>;
