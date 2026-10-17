# Asset Intelligence Copilot — Builder Handoff

**Current continuation checkpoint: 17 October 2026, approximately 14:26 IST.** Level 1 submission v1 is saved in OrganizerHQ, ID `sub_BGC6l8zU`, and the authored app is published separately at [GODOSTROYER/flytbase-asset-intelligence-copilot](https://github.com/GODOSTROYER/flytbase-asset-intelligence-copilot), verified `main` commit `2a37658038c8c8ef28f30f06c7e004607faf696f`. The [receipt](apps/asset-intelligence-copilot/docs/SUBMISSION_RECEIPT.md) records the saved writeup, disclosed AI-voiced draft video and unchanged uploaded ZIP. Final answers remain pending: load the scheduled 16:00 IST event release, preserve its reference date, run every final question, replace the writeup's reserved results, and replace the narration with the entrant's own voice. Update the existing submission and verify its new receipt before the current 17:00 IST portal deadline; this supersedes the older 18:00 IST event-listing snapshot below. Arena ordering with zero points is not a quality rank.

Captured 17 October 2026, about 1:10 PM IST from the participant portal and the event listing. Recheck the live schedule, leaderboard, submission state, and test-data release before relying on those values.

## Current build

The application is implemented in [apps/asset-intelligence-copilot](apps/asset-intelligence-copilot/README.md), on local branch `codex/asset-intelligence-copilot`. The original challenge documents and sample data remain intact. Start with the app README, [architecture](apps/asset-intelligence-copilot/docs/ARCHITECTURE.md), and [delivery status](apps/asset-intelligence-copilot/docs/DELIVERY.md).

It uses hosted Gemini for structured question planning, deterministic tools for calculations, cited document retrieval, shared corrections with provenance, private per-user history, and six inline visualization types. It supports importing a same-format event dataset. The UI, API and data storage run locally; no local model is used.

The deterministic sample acceptance suite passed 25/25 checks. Additional importer, engine, provider and persisted API checks are documented in the app. Hosted-call results, including failures and targeted retests, are retained in [LIVE_CHECKS.md](apps/asset-intelligence-copilot/docs/LIVE_CHECKS.md). These are sample-data results; the final event dataset, submission and public publication remain outstanding.

## Goal

Build a local, demoable Asset Intelligence Copilot for the FlytBase Hack Day. It should answer operators’ plain-English questions over the well fleet, cite the evidence it used, choose and render an appropriate visual in the chat, retain scoped user feedback, and remain usable when the event’s later test dataset is loaded.

This is an agentic data and retrieval engineering challenge. The problem statement explicitly excludes model training and image analysis. The important work is the typed tools and data layer, exact calculations, document retrieval, memory boundaries, conflict handling, and a clear end-to-end demonstration.

## Start here

Read the challenge contract and keep these source documents authoritative:

- [01 Problem Statement](01-problem-statement.md)
- [02 Dataset Guide](02-dataset-guide.md)
- [03 Evaluation Queries](03-evaluation-queries.md)
- [04 Prerequisites](04-prerequisites.md)
- [Challenge repository README](README.md)

The user’s local export, [FlytBase AHC SWE Hackathon#17Oct.md](../FlytBase%20AHC%20SWE%20Hackathon%2317Oct.md), also contains the problem statement, dataset guide, scenarios, setup guide, and resource tabs.

## What the copilot must do

1. Provide a chat UI with inline, question-appropriate visuals: a well status card, table, line chart, bar chart, map, or heatmap. Honor an explicitly requested format; otherwise choose a useful one.
2. Ground every answer in structured records or documents and show citations that link back to the source file and record/document ID.
3. Combine numeric facts with manuals, SOPs, repair reports, regulator events, and human notes.
4. Support shared well knowledge, private conversation memory per selected user, and feedback that keeps the original value plus correction author, reason, scope, and time.
5. Apply a correction only to its intended scope: a single observation/well or all wells of a specified type. Preserve contradictions and tell the user about them instead of silently discarding either side.
6. Load a new dataset in the same format without relying on sample-only well IDs or hard-coded expected answers.

### Domain rules that affect answers

- Derive producing status from wellhead temperature versus air temperature using the threshold for that well type in its manual. A recorded status can be stale.
- In the sample manuals, the producing threshold is +15 °C for T200 and +20 °C for T350. Compare the delta, never absolute wellhead temperature.
- Downtime is based on weekly inspections: each inspection that finds a well not producing contributes seven days. A missed inspection contributes zero. Repair duration or maintenance downtime hours are not the challenge’s downtime measure.
- A spill of at least five barrels must be reported to the regulator within 24 hours. Use the SOPs and regulator records to explain whether reporting was timely.
- The manuals also describe type-specific temperature alarms (T200 above 85 °C; T350 above 95 °C) and an immediate shut-in when a spill covers more than 5% of pad area. Retrieve and cite those rules when relevant.
- An explicit correction to an inspection finding wins for that finding, but retain and cite the original and the correction. Do not silently treat every human note as a formal correction.
- Link maintenance records to the matching report using the record’s report-file field; filenames are not always regular.
- Challenge manuals and SOPs are fictional, simplified test materials, not real operating or legal guidance.

## Data already present

The sample dataset is already checked out under sample-data; it does not need to be downloaded again. The local scan found 200 well directories, 2,516 files, and 23,648,836 bytes (about 23.6 MB).

- sample-data/fleet: areas, users, well-type manuals, and SOPs.
- sample-data/assets/WELL-XXXX: metadata.json, inspections.jsonl, maintenance.jsonl, regulatory-events.jsonl, context.jsonl, and maintenance-reports/*.md.
- The challenge describes four areas, four years of history, and roughly 40,000 weekly inspections. The final dataset is a separate release and may add wells and history.
- Inspection photo references exist, but the challenge does not include the referenced photos. Image understanding is not required.

## Evaluation scope

The sample has 18 scenarios in 03-evaluation-queries.md. Use all of them to shape tool coverage; do not tune a separate answer template to each sample question.

- Q1–Q10 cover well status/reasons, area summaries, temperature history, spill counts and volume, downtime, cross-well ranking, locations, area-by-month heatmaps, reporting compliance, and spill containment timing.
- Q11–Q14 cover private cross-conversation memory, raw-data correction with conflicting notes, correcting a model’s earlier analysis and recomputing consequences, and a user-defined repair threshold scoped to a well type.
- Q15–Q18 cover whether corrections are visible to other users, shared well knowledge versus private histories, disagreements between people and records, and disagreement between notes about an AI finding.

Final questions and a same-format test dataset are scheduled for the last two hours of the event. The test set is the real generalization checkpoint; record the exact outputs and evidence used.

### Reference semantics and sample acceptance anchors

The examples in `03-evaluation-queries.md` use **16 Oct 2026** as “today”; “right now” means latest inspection. Date windows end on that reference date, and repairs are grouped by start date. Apply corrections only when the scenario explicitly establishes one. The exact expected answers, names, IDs, dates, and evidence remain in the source file; these anchors help keep implementation and demo decisions aligned:

| Query | Sample expectation / behavior that must survive generalization |
|---|---|
| Q1 | WELL-0001: not producing; INS-0001-0203, 15 Oct, Ryan Brooks; delta +3.2 °C below T200 +15 °C. CTX-0001-003 attributes planned shut-in to Jake Morales since 7 Oct, rod-string replacement, expected back around 20 Oct. Stored `active` status is stale. |
| Q2 | Northeast Block 8 has four non-producing wells: WELL-0164 (+4.1 °C, stale active, inspector note “Pump jack not moving,” no confirmed cause); WELL-0170 (+2.9 °C, open MNT-0170-031 since 19 Sep); WELL-0172 (+5.7 °C, open MNT-0172-028 since 3 Oct); WELL-0175 (+0.4 °C, no recorded cause). Do not invent explanations. |
| Q3 | WELL-0001 has 13 weekly readings from 23 Jul–15 Oct; not producing on 8 and 15 Oct. Show wellhead and air temperatures plus status on a line chart. |
| Q4 | WELL-0001: 6 real spills totaling 15.1 bbl in four years, from 7 detections. Exclude INS-0001-0070 (7 Mar 2024), corrected to rainwater by CTX-0001-001. |
| Q5 | WELL-0001 had 21 downtime days in 2025: three non-producing weekly inspections. On 24 Jul, 51.6 °C wellhead vs 43.1 °C air is only +8.5 °C; MNT-0001-021 says prime mover tripped. On 16 and 23 Oct, MNT-0001-023 says stuffing-box packing leak. |
| Q6 | Northeast Block 7, 16 Jun–16 Oct 2026: WELL-0121 49 days (T200), WELL-0138 42 (T350), WELL-0107 42 (T350); next is WELL-0119 at 28. |
| Q7 | Map the four real Northeast Block 8 spills in the last 90 days: WELL-0151 (24 Sep, 4.5 bbl), WELL-0165 (30 Jul, 1.2), WELL-0175 (30 Jul, 3.9), WELL-0186 (23 Jul, 0.6). Coordinates are in the source scenario. |
| Q8 | 2026 monthly spill heatmap by area must exclude corrected detections. Totals: Southwest Block 23 = 35; Southwest Block 24 = 43; Northeast Block 7 = 37; Northeast Block 8 = 26. Monthly Jan–Oct values are tabulated in the source scenario. |
| Q9 | WELL-0001 has four breaches tied to the 11 Jun 2026 spill (6.8 bbl): SR-01 reported after 41h vs 24h; SR-02 contained after ~7h vs 4h; SR-03 cleanup verification overdue since 10 Aug; RC-04 notice response absent after 30 Jul. $5,000 fine is open. Separately surface pending RCA for repairs MNT-0001-028/-029/-032, missing planned-shut-in maintenance record, and completed RC-02 test on 7 Mar 2026. |
| Q10 | Southwest Block 24, last 90 days: WELL-0082 (~7.1h) and WELL-0100 (~8.1h) exceeded the 4h containment limit; containment evidence is in reports MNT-0082-028 / MNT-0100-034. |
| Q11 | Michael Turner’s private prior-chat reference to Q6 resolves repair costs this year: WELL-0121 $25,794; WELL-0138 $46,942; WELL-0107 $5,176. Do not make that memory available to other users. |
| Q12 | Michael Turner corrects INS-0164-0205 from 24.0 °C to 41.0 °C, citing a faulty thermal gun. Retain old value, author, and reason. Against 19.9 °C air (+21.1), WELL-0164 becomes producing; surface conflict with Tyler Hughes’s “Pump jack not moving” note and ask for confirmation. Repeat Q2: only WELL-0170/-0172/-0175. |
| Q13 | Michael Turner corrects WELL-0151 inspection INS-0151-0201 from 4.5 to 5.4 bbl. Recompute: reportable, no notice recorded within 24h of 24 Sep 15:30 (possible SR-01 breach), report MNT-0151-025’s “no reporting duty” is stale, containment was ~6.4h (SR-02 breach), and SR-03 verification is due 23 Nov 2026. Preserve the estimate and correction. |
| Q14 | Initially list WELL-0108/-0121/-0138 for three pump-jack repairs (manual threshold). After Michael Turner sets a T350-only threshold of two, add WELL-0120, but not WELL-0102 (T200). Attribute the overridden rule to Michael, not the manual. |
| Q15 | Jessica sees Michael’s shared WELL-0164 correction and the conflicting inspector note. Laura’s Q about Northeast Block 8 reportable spills returns corrected WELL-0151 at 5.4 bbl, with no notice recorded; no other spill reached 5 bbl. |
| Q16 | Jake’s shared note says WELL-0007 will be shut in from 17 Oct for a 10-day workover, visible to Michael. Jessica must not inherit Michael’s private Q11 conversation. |
| Q17 | Keep both claims about WELL-0175; to Tyler, cite 15 Oct inspection (+0.4 °C, not producing) and Michael’s matching note, mark Tyler’s “running fine” unconfirmed, and ask for confirmation. Jake’s “WELL-0001 back online since 14 Oct” stays unconfirmed against 15 Oct inspection and CTX-0001-003’s ~20 Oct return estimate. |
| Q18 | WELL-0101’s 20 Aug finding INS-0101-0197 (1.0 bbl, “Oil sheen around cellar”) stands because a spill repair MNT-0101-029 exists and neither note is a formal correction. Show Ryan Brooks’s produced-water opinion and Chris Dalton’s sampled/confirmed-crude opinion (CTX-0101-002/-003) as a conflict; answer yes, with evidence. |

Visual behavior is explicitly graded: one well now → status card; lists → table; time series → line chart; comparisons → bar chart; geography → map; area × month → heatmap. Explicitly requested formats take precedence.

## Recommended implementation boundary

- Keep arithmetic and business rules in deterministic, inspectable tools. Use an LLM for question interpretation, tool selection, and concise wording only; never ask it to invent totals or citations.
- Give every tool a typed input/output contract and return source IDs with results. Render citations from tool results, not from model-generated citation strings.
- Keep structured records queryable, and index manuals, SOPs, notes, and repair reports for retrieval. Preserve source paths and passage locations.
- Store shared facts/corrections separately from per-user memories. Make correction scope explicit in the schema and retrieval filter.
- Make data loading point at a dataset directory so the 4 PM release can be swapped in without code changes. Keep the sample dataset and event release distinguishable.
- Provide a useful local demo mode when no model key is configured. Never commit secrets; keep any provider key server-side in a local ignored environment file.

## Portal and event facts

The authenticated participant portal is [OrganizerHQ / AHC Visual Intelligence Hackathon Arena](https://fbhackathonplatform-production.up.railway.app/). The signed-in account is registered for the event; Level 1 showed “ready to submit” and no submission. No organizer messages were present. The Resources page linked only to the problem-statement Google Doc already exported locally.

Relevant routes observed:

- Participant home: /participant/p_S2tTZD
- Quest and schedule: /participant/p_S2tTZD/quest-map
- Resources: /participant/p_S2tTZD/resources
- Submission list: /participant/p_S2tTZD/submissions
- Level 1 form: /participant/p_S2tTZD/submissions/1
- Messages: /participant/p_S2tTZD/messages
- Profile: /participant/p_S2tTZD/register
- Public Arena and live leaderboard: /arena

Level 1 currently asks for a write-up link (Google Doc or Drive) and a Google Drive video link. A code ZIP is optional, with a 150 MB maximum. The form has a Submit Level 1 button; no submission was made. The public arena refreshes every 30 seconds, so leaderboard position and points are only snapshots, not a final result.

The MLH event page is [Hacktoberfest Hack Day Pune × AI Hackers Collective](https://www.mlh.com/events/hacktoberfest-hack-day-pune-x-ai-hackers-collective). It lists the event as hybrid, in Pune, on 17 October 2026. The observed schedule was:

| Time (IST) | Event |
|---|---|
| 9:00 AM | Breakfast and networking |
| 9:30 AM | SOTA session |
| 11:00 AM–2:00 PM | Build time |
| 2:02–2:30 PM | Lunch |
| 2:30–5:00 PM | Build time |
| 4:00 PM | Test-data release |
| 5:00–6:00 PM | Submissions |
| 6:00–6:30 PM | Demos |

The MLH event listing says submissions close at 6:00 PM IST. Confirm the live portal before the final upload.

One submission may enter every MLH category it qualifies for:

- [Asset Intelligence Copilot Challenge](https://www.mlh.com/events/hacktoberfest-hack-day-pune-x-ai-hackers-collective/challenges/01a144b8-b67d-0d1e-ec79-d7a90c04dd18): the core challenge.
- [Best Open-Source AI Project](https://www.mlh.com/events/hacktoberfest-hack-day-pune-x-ai-hackers-collective/challenges/01a0d987-0c41-12ea-13ac-5b85755dc2f3): open-source or open-weight AI must be an important part; the project must be in a public GitHub repository with an open-source license.
- [Best Use of Gemma 4](https://www.mlh.com/events/hacktoberfest-hack-day-pune-x-ai-hackers-collective/challenges/01a03b87-be22-9180-5e2d-b3beeb66666d): specifically build with Gemma 4. This is a separate eligibility choice from merely using a Gemini-branded API model.

### Submission requirements

The problem statement asks for a clear 2–3 page write-up (page 1: system design; page 2: final results), a video no longer than five minutes, and a public GitHub repository with an open-source license. The video must be in the entrant’s own voice and show one real use case end to end. The Quest page also says “2–3 pages.” The current draft targets two pages as a practical presentation choice, not a stricter requirement.

The original checkout's Git remote still points to FlytBase's upstream dataset repository. The authored app has since been published from an independent clean staging checkout at the public repository linked in the current checkpoint above; the upstream checkout and its history were not pushed.

## Gemini free-tier and voice notes

Checked against the official Google Gemini API docs on 17 October 2026:

- Rate limits are measured by requests per minute, input tokens per minute, and requests per day (some models have additional limits). They apply **per project, not per API key**; active values vary and are shown in Google AI Studio. Rotating several keys does not increase the project quota.
- The user confirmed that the five supplied keys belong to different projects. The app distributes requests round robin across those independent projects, with separate application caps, token reservations and cooldowns. A rate-limited project is cooled down; actual project limits still apply. Keys from the same project can share an explicit project identifier.
- The default model is `gemini-3.5-flash-lite`. `gemini-3.8-flash` is configured for deeper document reasoning when appropriate. Five key entries were accepted by Google's models endpoint; actual hosted planning and synthesis calls are recorded in the app's live-check report. No additional API provider is required for the current implementation.
- The current TTS model best aligned with expressive, longer-form narration is gemini-3.8-flash-tts. Google lists standard-tier text/audio pricing as free of charge, but the actual active quota remains project-specific. The free tier is marked as eligible for use to improve Google products.
- The hackathon says the submitted video must be in the entrant’s own voice. TTS may be used for an internal review draft, but it should not replace the entrant’s voice in the submitted video unless the organizer confirms that is acceptable.
- Credentials are stored only in the app's ignored server-side `.env.local`. They are intentionally omitted from documentation, browser code and recorded evidence. Application request/token/day counters are process-local controls, not a measurement of every consumer of a Google project.

Official references: [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), and [Gemini speech generation](https://ai.google.dev/gemini-api/docs/speech-generation).

## Local environment and next steps

- Original checkout: FlytBase's challenge dataset repository with the authored app on local branch `codex/asset-intelligence-copilot`. Separate authored public source and Level 1 submission v1 are confirmed in the current checkpoint and receipt above.
- Runtime observed: Node.js 24.19.0, npm 11.6.0, Python 3.13.5.
- Sample data and application dependencies are present locally. No model weights are installed.
- Run `npm run dev` in `apps/asset-intelligence-copilot`, or use `npm run build` followed by `npm start` for the built interface at `http://127.0.0.1:4178`.
- Next competition checkpoint: at 16:00 IST load the released test dataset, preserve the organizer's evaluation reference date, save all final answers/evidence, update the writeup, and replace the AI draft narration with the entrant's own voice. Update the existing Level 1 submission before 17:00 IST and verify its replacement receipt. Preserve the original v1 ZIP and receipt as historical evidence.
