import {SharedFrame,Heading,Crop} from '../Design';
export const Trend=()=> <SharedFrame section="05 / Context over time">
  <Heading sub="Actual application capture · dated inspections with source IDs">The temperature story across thirteen weeks.</Heading>
  <Crop src="desktop-chart.png" x={341} y={345} w={788} h={464} left={88} top={290} width={1170}/>
  <div style={{position:'absolute',left:1365,top:395,right:88,fontSize:36,lineHeight:1.3}}><b>Two final readings</b><br/><span style={{color:'#557085'}}>close to ambient temperature.</span><div style={{marginTop:65,color:'#946f28',fontWeight:600}}>Marked<br/>non-producing</div></div>
</SharedFrame>;
