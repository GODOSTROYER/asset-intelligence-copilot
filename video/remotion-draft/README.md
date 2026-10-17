# Asset Intelligence Copilot review film

Editable Remotion review/demo video. Temporary Gemini narration is disclosed on every scene. Entrant own-voice recording remains pending. Screens show supplied sample data, not the final event dataset.

## Review

```powershell
npm run dev -- --no-open
```

Composition: `AssetIntelligenceDraft`. With Studio on port 3000: `http://localhost:3000/AssetIntelligenceDraft`.

Every substantial scene also has its own editable composition under **Scenes**.

## Export

```powershell
npx remotion render src/index.ts AssetIntelligenceDraft out/Asset-Intelligence-Copilot-DRAFT-AI-narration.mp4 --codec=h264 --audio-codec=aac --crf=18
```

Narration text: `narration.txt`. Audio: `public/audio/gemini-narration.wav`. See `PROVENANCE.md` and `out/qa/QA_RECEIPT.md` for evidence and export details.

`scripts/generate-narration.mjs` is an explicitly authorized cloud operation. Coordinate its request window with other agents; do not rerun it automatically. It loads the sibling app's ignored credentials in process and writes only nonsecret receipt metadata.

To replace the voice, use an entrant-recorded WAV, then adjust sequence lengths and root composition duration to the real recording. Do not relabel the existing AI audio as entrant voice.
