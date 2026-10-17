import {Audio} from '@remotion/media';
import {AbsoluteFill, Series, staticFile, useVideoConfig} from 'remotion';
import {Opening} from './scenes/Opening';
import {Architecture} from './scenes/Architecture';
import {Status} from './scenes/Status';
import {Sources} from './scenes/Sources';
import {Trend} from './scenes/Trend';
import {Fleet} from './scenes/Fleet';
import {Memory} from './scenes/Memory';
import {Closing} from './scenes/Closing';

export const ReviewFilm=()=>{
  const {fps}=useVideoConfig();
  return <AbsoluteFill>
    <Audio src={staticFile('audio/gemini-narration.wav')} premountFor={fps}/>
    <Series>
      <Series.Sequence name="Opening" durationInFrames={393} premountFor={fps}><Opening/></Series.Sequence>
      <Series.Sequence name="Architecture" durationInFrames={450} premountFor={fps}><Architecture/></Series.Sequence>
      <Series.Sequence name="Status question" durationInFrames={798} premountFor={fps}><Status/></Series.Sequence>
      <Series.Sequence name="Evidence chain" durationInFrames={456} premountFor={fps}><Sources/></Series.Sequence>
      <Series.Sequence name="Thirteen week trend" durationInFrames={432} premountFor={fps}><Trend/></Series.Sequence>
      <Series.Sequence name="Fleet calculations" durationInFrames={539} premountFor={fps}><Fleet/></Series.Sequence>
      <Series.Sequence name="Memory and import" durationInFrames={577} premountFor={fps}><Memory/></Series.Sequence>
      <Series.Sequence name="Draft disclosure" durationInFrames={615} premountFor={fps}><Closing/></Series.Sequence>
    </Series>
  </AbsoluteFill>;
};
