import {SharedFrame,Heading,Crop,SmallLabel} from '../Design';
export const Sources=()=> <SharedFrame section="04 / Evidence behind the answer">
  <Heading>Reading. Rule. Reported cause.</Heading>
  <SmallLabel top={280}>The evidence chain shown in the answer</SmallLabel>
  <div style={{position:'absolute',left:88,top:350,width:950,fontSize:42,lineHeight:1.3}}><div style={{marginBottom:52}}><b>INS-0001-0203</b><br/><span style={{fontSize:33,color:'#557085'}}>Latest inspection establishes the reading.</span></div><div style={{marginBottom:52}}><b>OM-T200</b><br/><span style={{fontSize:33,color:'#557085'}}>Manual supplies the production threshold.</span></div><div><b>CTX-0001-003</b><br/><span style={{fontSize:33,color:'#557085'}}>Field note reports a planned rod replacement.</span></div></div>
  <Crop src="desktop-status.png" x={1195} y={81} w={310} h={300} left={1118} top={278} width={650}/>
  <div style={{position:'absolute',left:1118,top:930,fontSize:24,color:'#557085'}}>Actual source list from the recorded answer</div>
</SharedFrame>;
