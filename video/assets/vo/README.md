Placeholder AI voiceover (Gemini TTS, voice Kore). Text and filenames come from STORYBOARD.md (vo_file lines).
To use your own voice: record each frame and save over the same filenames (01-hook.wav ... 08-close.wav), then run `node scripts/generate-vo.mjs --timings-only && node scripts/make-words.mjs` to refresh timings.json and the *.words.json caption timings.
To regenerate one scene with Gemini: `node scripts/generate-vo.mjs --frames 4` (then rerun the two commands above for timings).
