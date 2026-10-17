import json
from pathlib import Path
import whisper

# Uses the already cached local base model; no hosted transcription.
model = whisper.load_model('base', device='cpu')
result = model.transcribe('public/audio/gemini-narration.wav', language='en', fp16=False, temperature=0, verbose=False)
Path('out/qa/asr-transcript.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
for segment in result['segments']:
    print(f"{segment['start']:.2f}-{segment['end']:.2f}: {segment['text']}")
