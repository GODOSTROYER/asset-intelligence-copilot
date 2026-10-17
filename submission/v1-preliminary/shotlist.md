# Recording shotlist and final handoff

Record the entrant's own microphone voice with the actual app. The script targets under four minutes; the challenge maximum is five. Keep the browser focused on the result, source drawer and selected user. Keep credentials and environment files out of the recording. The entrant has separately requested a Gemini-voiced draft for review; label it as AI narration and replace that narration with the entrant's own voice before treating it as the brief-compliant final video.

| Time | Actual screen action | What it demonstrates |
|---|---|---|
| 0:00–0:30 | App chat and dataset/reference-date labels | Problem, local data, model/tool boundary |
| 0:30–1:10 | Select Michael Turner. Submit “Is WELL-0001 producing right now, and why?” Wait for completion. | Live question → plan → calculation → inline status |
| 1:10–1:40 | Open INS-0001-0203; inspect OM-T200 and CTX-0001-003 | Original evidence, stale metadata and cause attribution |
| 1:40–2:15 | Ask “Which three wells in Northeast Block 7 had the most downtime in the last four months?” | Fleet aggregation and exact values in a bar result |
| 2:15–2:40 | New chat as Michael. Ask “For the three wells we discussed yesterday, what have repairs cost this year?” | Private history survives a new chat; repair-cost calculation |
| 2:40–3:00 | Switch to Jessica Reed and ask the same question | No cross-user private history reference; retain the actual outcome |
| 3:00–3:40 | Open Memory & feedback, then Load dataset folder dialog; dismiss without loading | Shared audit provenance, import capability, scope and limitations |

Before recording, confirm the displayed dataset is the sample and the reference date is 2026-10-16. Existing user histories can affect the privacy demonstration: use an isolated recording state directory or inspect both users' histories before selecting them. A clean recording process can use `COPILOT_STATE_DIR` pointing at a new directory and a spare `PORT`; it must not replace the running review server's state. Hosted calls require the entrant's authorized configuration and quota. This preparation did not make cloud calls.

If Jessica already has her own relevant history, use another dataset user with no matching conversation and say that user's actual name. If a result differs from the script, narrate the actual result and investigate it before calling the recording final. Do not substitute screenshots for the end-to-end query run.

## Final deliverables still required

- Organizer's final dataset and final questions, with the actual release identifier and evaluation reference date.
- Actual final answers, citations, observed failures and explanations; replace the reserved block on page 2. Preserve the full answer export as supporting evidence.
- Final two-page document after layout/export review. `writeup.md` is a draft intended for two pages; Markdown alone does not guarantee pagination.
- An actual own-voice recording, reviewed for duration and truthful on-screen results. The script/shotlist are preparation only.
- Authorized public repository containing the authored app and an open-source license. The existing Git remote is the upstream challenge dataset, not publication of this app.
- Accessible writeup and video links in the formats currently required by OrganizerHQ; confirm with the live portal before upload.
- Portal submission confirmation/receipt. No upload, publication or submission is performed by these local artifacts.

The ZIP is optional according to the previously captured portal form, with a 150 MB cap. Its current presence does not satisfy missing final results, video, repository publication or portal receipt. Any portal fields, dates or status must be checked live by the submitting agent.
