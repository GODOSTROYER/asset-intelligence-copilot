import {SharedFrame,Heading,SmallLabel,ink} from '../Design';
export const Memory=()=> <SharedFrame section="07 / Context and provenance">
  <Heading sub="Architecture summary · app behavior documented in source">Shared knowledge. Private conversation.</Heading>
  <div style={{position:'absolute',left:88,top:330,width:794,height:358,padding:42,background:ink,color:'white',borderRadius:16}}><div style={{fontSize:43,fontWeight:600,marginBottom:30}}>Shared knowledge</div><div style={{fontSize:32,lineHeight:1.45,color:'#d2e0e9'}}>Explicit corrections and field notes<br/>visible across selected users.<br/>Author, reason, scope, and conflicts retained.</div></div>
  <div style={{position:'absolute',left:930,top:330,width:794,height:358,padding:42,background:'#dce8e2',borderRadius:16}}><div style={{fontSize:43,fontWeight:600,marginBottom:30}}>Private history</div><div style={{fontSize:32,lineHeight:1.45,color:'#426078'}}>Earlier questions and referenced wells<br/>scoped to the selected dataset user.<br/>New chat can retain that context.</div></div>
  <SmallLabel top={796}>Same-format dataset folder → local import → merged records with provenance</SmallLabel>
  <div style={{position:'absolute',left:88,top:858,fontSize:28,color:'#557085'}}>Demo user selection is not authenticated production identity.</div>
</SharedFrame>;
