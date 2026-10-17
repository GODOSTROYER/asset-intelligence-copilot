import {SharedFrame,Heading,Crop} from '../Design';
export const Fleet=()=> <SharedFrame section="06 / Exact totals across wells">
  <Heading sub="Actual sample query: compare repair costs for three named wells this year">Fleet questions. Inspectable numbers.</Heading>
  <Crop src="built-cost-chart.png" x={343} y={208} w={781} h={565} left={88} top={275} width={970}/>
  <div style={{position:'absolute',left:1300,top:350,right:88,fontSize:35,lineHeight:1.4}}><b>Repair costs</b><br/>Summed from<br/>maintenance records.<div style={{marginTop:70,fontSize:30,color:'#557085'}}><b>Downtime rule</b><br/>7 days per non-producing weekly inspection.<br/><br/>Missed inspection: 0 days.</div></div>
</SharedFrame>;
