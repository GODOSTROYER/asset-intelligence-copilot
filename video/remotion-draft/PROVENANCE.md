# Draft review film provenance

This temporary film uses Gemini AI narration. Replace it with the entrant's own voice before the final submission if the event requires own-voice recording.

Permanent onscreen disclosure: **Draft · AI narration · replace with entrant voice**.

The application screenshots are supplied sample-data captures taken on 17 October 2026. They are not final event-dataset evaluation evidence. The sample reference date displayed by the app is 16 October 2026.

| Evidence asset | Original app file | What it supports |
| --- | --- | --- |
| `public/evidence/desktop-status.png` | `../asset-intelligence-copilot/docs/screenshots/desktop-status.png` | WELL-0001 answer, temperatures, status, planned shut-in context, source IDs. |
| `public/evidence/desktop-chart.png` | `../asset-intelligence-copilot/docs/screenshots/desktop-chart.png` | Actual 13-week temperature chart with two final non-producing readings. |
| `public/evidence/built-cost-chart.png` | `../asset-intelligence-copilot/docs/screenshots/built-cost-chart.png` | Actual direct comparison of three named wells' repair costs; this screenshot is not a private-history follow-up. |

The architecture and memory slides are explanatory graphics, not simulated application screens. Their claims are grounded in the current app README and submission script. No screen fabricates a live interaction, hidden-dataset score, win, rank, or perfect evaluation record. Crop framing changes only the visible region of the original captures.

The voice-generation script reads credentials in process from the sibling app's ignored `.env.local` using `process.loadEnvFile`. It neither copies nor logs credentials. It makes one authorized request and at most one necessary retry for transient errors. No key cycling. The generated request receipt contains only nonsecret metadata and SHA-256 hashes.

Official speech-generation specification, read 17 October 2026: https://ai.google.dev/gemini-api/docs/speech-generation

Model: `gemini-3.8-flash-tts`. Voice: stock `Kore`. Narration generation is separate from the app's hosted planning and local calculation runtime.

The final MP4, WAV, timestamps, duration, hash, and verification results are recorded in `out/qa/QA_RECEIPT.md` after export.
