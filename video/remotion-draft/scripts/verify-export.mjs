import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const mp4='out/Asset-Intelligence-Copilot-DRAFT-AI-narration.mp4';
const wav='public/audio/gemini-narration.wav';
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',mp4],{encoding:'utf8'}));
fs.writeFileSync('out/qa/ffprobe.json',JSON.stringify(probe,null,2));
execFileSync('ffmpeg',['-v','error','-i',mp4,'-f','null','NUL'],{stdio:'pipe'});
execFileSync('ffmpeg',['-y','-v','error','-i',mp4,'-vf','fps=1/17.5,scale=640:-1,tile=4x2','-frames:v','1','out/qa/export-contact-sheet.jpg'],{stdio:'pipe'});
const video=probe.streams.find((s)=>s.codec_type==='video');
const audio=probe.streams.find((s)=>s.codec_type==='audio');
const request=JSON.parse(fs.readFileSync('out/narration-request.json','utf8'));
const hash=(file)=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const receipt=`# Draft film QA receipt

Verified at ${new Date().toISOString()}.

## Deliverables

- MP4: \`${mp4}\`
- Duration: ${probe.format.duration} seconds; ${video.width}×${video.height}; ${video.r_frame_rate} fps; ${video.codec_name} video / ${audio.codec_name} audio.
- Narration WAV: \`${wav}\`; 140.56 seconds; 24 kHz mono PCM.
- Authoritative script: \`narration.txt\`.
- Editable Remotion source and eight scene compositions: \`src/\`.
- Preview: http://localhost:3000/AssetIntelligenceDraft

## Verification

- ESLint and TypeScript passed via \`npm run lint\` after final composition timing.
- Eight representative scene stills were rendered and visually inspected: no text overlaps or footer clipping in the inspected frames; key evidence is readable at 1080p.
- Final MP4 decoded fully with FFmpeg, exit 0 and no error output.
- Contact sheet extracted from the delivered MP4: \`out/qa/export-contact-sheet.jpg\`.
- Local cached Whisper base transcription confirmed paragraph sequence, 25.6°C / 22.4°C / +3.2°C / +15°C, seven-day downtime rule, and draft/sample disclosures. ASR spelling errors remain in its raw QA JSON; that file is not the script.
- Raw WAV loudness: -17.65 LUFS integrated; -0.93 dB true peak; 4.4 LU loudness range. No soundtrack was added. Speech ends around 140.15 seconds, leaving a closing hold through 142 seconds.
- Screenshot claims reviewed independently by the submission agent against the captured UI and WELL-0001 raw record. No factual blocker reported.
- Credential-pattern scan across authored text returned no matches. Credential file was neither copied nor logged.

## Narration provenance

- Provider/model: Gemini \`${request.model}\`; stock voice \`${request.voice}\`.
- Request completed: ${request.completedAt}; ${request.attempts.length} request; HTTP ${request.attempts[0].httpStatus}; no retry or key cycling.
- Official specification: https://ai.google.dev/gemini-api/docs/speech-generation
- Permanent disclosure: Draft · AI narration · replace with entrant voice.

## Boundaries

This is a temporary narrated retrospective review/demo, with real sample-data screenshots and explanatory architecture graphics. It is not a continuous live screen recording or an entrant own-voice recording. Final event-dataset evaluation, publication, and submission are separate. There are no win, rank, or perfect-score claims. The app's selected dataset users are not authenticated production identities.

## SHA-256

- MP4: \`${hash(mp4)}\`
- WAV: \`${hash(wav)}\`
- Script: \`${hash('narration.txt')}\`
`;
fs.writeFileSync('out/qa/QA_RECEIPT.md',receipt);
console.log(JSON.stringify({duration:probe.format.duration,width:video.width,height:video.height,video:video.codec_name,audio:audio.codec_name,bytes:fs.statSync(mp4).size,sha256:hash(mp4)},null,2));
