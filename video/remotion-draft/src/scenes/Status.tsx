import {SharedFrame,Heading,Crop,SmallLabel} from '../Design';
export const Status=()=> <SharedFrame section="03 / A recorded sample answer">
  <Heading sub="Sample reference date: 16 Oct 2026 · actual application capture">Is WELL-0001 producing right now?</Heading>
  <Crop src="desktop-status.png" x={309} y={110} w={830} h={470} left={88} top={270} width={1238}/>
  <SmallLabel top={308} left={1394}>Calculated status</SmallLabel>
  <div style={{position:'absolute',left:1394,top:360,right:88,fontSize:49,fontWeight:600,lineHeight:1.2}}>Not<br/>producing</div>
  <div style={{position:'absolute',left:1394,top:525,right:88,fontSize:34,lineHeight:1.45,color:'#426078'}}>25.6°C − 22.4°C<br/><b style={{fontSize:55,color:'#184e88'}}>+3.2°C</b><br/>below T200<br/>+15°C threshold</div>
</SharedFrame>;
