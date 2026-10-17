# Asset Intelligence Copilot

A local-first demo for the FlytBase Asset Intelligence Copilot challenge. The React chat UI talks to a loopback Express service. The service uses hosted Gemini to plan calls to typed domain tools; the tools calculate numeric answers from the loaded records and attach source citations. Gemini is the only model provider in this build. There is no local-model mode.

## Run locally

From this directory:

```powershell
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://127.0.0.1:5173`). The API listens on `127.0.0.1:4178` by default and Vite proxies `/api` requests to it. The server reads the repository's `sample-data/` by default.

For a production-style local run, build the interface and then start the server:

```powershell
npm run build
npm start
```

## Hosted Gemini configuration

The server loads `.env.local` or `.env` from this app directory. `.env.local` is ignored by Git. Put credentials only in that server-side file; do not add them to `src/`, Vite variables, screenshots, or committed docs.

Set `GEMINI_API_KEYS` to the five project keys as a JSON array or comma/newline-separated list. In this deployment each string entry maps to an independent application-side bucket; entries for one shared project can instead use matching `projectId` metadata. The queues, counters, and cooldowns are process-local and do not aggregate across app processes. Never put key values in the repository. `GEMINI_API_KEY` is also supported for a single-key setup.

| Variable | Behavior |
| --- | --- |
| `GEMINI_MODEL` | Main model; defaults to `gemini-3.5-flash-lite`. |
| `GEMINI_REASONING_MODEL` | Optional Gemini 3.8 model for eligible search synthesis routed to reasoning. |
| `GEMINI_SYNTHESIS_REASONING` | Search-synthesis routing: `auto` (default), `always`, or `never`. |
| `GEMINI_FALLBACK_MODEL` | Optional alternate model when the selected model is unavailable. |
| `GEMINI_RPM` | App-side per-project request cap per minute; defaults to 5. |
| `GEMINI_TPM` | App-side per-project token cap per minute; defaults to 20,000. |
| `GEMINI_RPD` | App-side per-project request cap per day; defaults to 100. |
| `GEMINI_TIMEOUT_MS` | Provider request deadline; defaults to 25,000 ms. |
| `REFERENCE_DATE` | Optional evaluation “today” in `YYYY-MM-DD`; the app defaults to 16 Oct 2026. |
| `SAMPLE_DATA_PATH` | Optional path to the base dataset; defaults to this repository's `sample-data/`. |
| `COPILOT_STATE_DIR` | Optional state directory; defaults to `.local/` in this app. |
| `PORT` | Optional local API port; defaults to 4178. |

The RPM/TPM/RPD counters, queues, and cooldowns are process-local application caps. They are not aggregate across server processes and do not guarantee or report the actual Google project quotas. Gemini quota is project-scoped and can vary by model and account; check actual limits in Google AI Studio. Daily cooldown handling follows midnight America/Los_Angeles. The UI and local deterministic tools can start without keys, but hosted planning and grounded search synthesis need a configured provider.

The question, compact well/area context, and up to five bounded exchanges for the selected user can be sent to Gemini for planning; general search synthesis also sends up to six bounded source passages. The planner and ordinary one-document synthesis use the primary model, `gemini-3.5-flash-lite` by default. In `auto` mode, synthesis uses the optional reasoning model only for an explicit deep-analysis request or a comparison/conflict across multiple retrieved documents. `always` and `never` override that routing for eligible synthesis requests; if no reasoning model is configured, the primary model is used. Dataset files and copilot state remain in the local app directory; this is not a cloud deployment.

## What the app does

- Loads well metadata, inspections, repairs, regulator events, operator notes, manuals, SOPs, and linked repair reports from the challenge data format.
- Derives production status from the relevant manual and temperature difference; counts downtime from weekly inspections.
- Uses typed domain operations for status, trends, spills, downtime, compliance, repair costs, containment, and RCA queries. Numeric answers are computed by local code, not rewritten by a model.
- Retrieves source passages for general questions and requires cited source IDs in model-written synthesis.
- Reports containment and compliance coverage, including candidate incidents, resolved timing, missing reports, and unparsed timing.
- Keeps shared corrections, notes, claims, and type rules separate from private conversation history for the selected dataset user.
- Renders status cards, paginated tables and charts, heatmaps, and a coordinate plot for map results. Large result lists and source collections can be paged or filtered. The map is not a geographic basemap.
- Provides a source library, citation drawer, memory drawer, and local same-format dataset importer.

See [Architecture](docs/ARCHITECTURE.md) for the request flow, [research applied](docs/RESEARCH_APPLIED.md) for the decision ledger, [Acceptance checks](docs/ACCEPTANCE.md) for deterministic sample scenarios, [hosted Gemini checks](docs/LIVE_CHECKS.md) for recorded live outcomes, and the [independent review](docs/REVIEW.md) for local review evidence and its limits.

## Demo sequence

1. Ask whether WELL-0001 is producing now (Q1) and open the inspection/manual citations.
2. Ask which Northeast Block 7 wells had the most downtime in the last four months (Q6) and inspect the bar result.
3. As Michael Turner, run Q6; start a new chat and ask what repairs cost for the three wells discussed yesterday (Q11). The lookup should use Michael's private history.
4. Submit a well reading or spill-volume correction as Michael, then switch to Jessica Reed or Laura Simmons and ask the matching Q15 question. Inspect the shared correction and any recorded conflict.
5. Use **Load dataset folder** to add a same-format event dataset when it is released. Set the optional reference date only when that dataset uses a different evaluation “today”.

## Data and release boundaries

The challenge data and its manuals/SOPs are synthetic and are not operational or legal guidance. Inspection photo references do not include image files, and this app does not analyze photos. Imported folders are read locally and are not uploaded. A later root replaces a matching record as a whole; omitted fields remain missing rather than being copied from the older record. A replacement repair invalidates its earlier report, and the new narrative is loaded only through its `report_file` path. Source files on disk are not changed. Repair records and repair reports with the same record ID remain separate source types. Dataset reference date, source observation/effective dates, and feedback creation timestamps describe different clocks.

Recorded local evidence includes 109/109 domain stress cases, 27/27 provider stress checks, 22/22 synthetic data-readiness cases, and 12 deterministic UI render checks; see [DOMAIN_STRESS](docs/DOMAIN_STRESS.md), [PROVIDER_STRESS](docs/PROVIDER_STRESS.md), [FINAL_DATA_READINESS](docs/FINAL_DATA_READINESS.md), and [UI_STRESS](docs/UI_STRESS.md) for scope. The 32-scenario hosted initial run was 29/32 on semantic checks and 27/32 hosted-plus-semantic. A focused retest passed the three answer defects; across runs, semantic checks are 32/32 and hosted-plus-semantic is 30/32. Two remaining hosted-path misses were correctly rejected by deterministic fallback but remain hosted reliability failures. This was not a fresh complete 32-scenario run after the fixes. The report records 39 HTTP 200 responses, 69,670 reported tokens, and no retries or cooldowns; see [UNSEEN_LIVE_CHECKS](docs/UNSEEN_LIVE_CHECKS.md) and [LIVE_CHECKS](docs/LIVE_CHECKS.md). These sample-data results do not establish acceptance on the unreleased final dataset or guarantee a judging outcome. Public GitHub publication and the OrganizerHQ submission are still outstanding.

Challenge references: [Problem statement](../../01-problem-statement.md), [Dataset guide](../../02-dataset-guide.md), [Example questions](../../03-evaluation-queries.md), and [Prerequisites](../../04-prerequisites.md).

