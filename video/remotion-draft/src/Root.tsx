import {Composition, Folder} from 'remotion';
import {ReviewFilm} from './Composition';
import {Opening} from './scenes/Opening';
import {Architecture} from './scenes/Architecture';
import {Status} from './scenes/Status';
import {Sources} from './scenes/Sources';
import {Trend} from './scenes/Trend';
import {Fleet} from './scenes/Fleet';
import {Memory} from './scenes/Memory';
import {Closing} from './scenes/Closing';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AssetIntelligenceDraft" component={ReviewFilm} durationInFrames={4260} fps={30} width={1920} height={1080}/>
      <Folder name="Scenes">
        <Composition id="Opening" component={Opening} durationInFrames={393} fps={30} width={1920} height={1080}/>
        <Composition id="Architecture" component={Architecture} durationInFrames={450} fps={30} width={1920} height={1080}/>
        <Composition id="Status" component={Status} durationInFrames={798} fps={30} width={1920} height={1080}/>
        <Composition id="Sources" component={Sources} durationInFrames={456} fps={30} width={1920} height={1080}/>
        <Composition id="Trend" component={Trend} durationInFrames={432} fps={30} width={1920} height={1080}/>
        <Composition id="Fleet" component={Fleet} durationInFrames={539} fps={30} width={1920} height={1080}/>
        <Composition id="Memory" component={Memory} durationInFrames={577} fps={30} width={1920} height={1080}/>
        <Composition id="Closing" component={Closing} durationInFrames={615} fps={30} width={1920} height={1080}/>
      </Folder>
    </>
  );
};
