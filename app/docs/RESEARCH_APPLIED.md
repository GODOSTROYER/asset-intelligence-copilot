# Hackathon architecture research applied

## Scope and provenance

This decision ledger uses a bounded, truncated 20,000-character preview of the user-referenced [Hackathon Architecture Research conversation](https://chatgpt.com/c/6ad32906-0b20-83e8-aa96-87de526c19a9). The preview did not include the full conversation. Research text was treated as reference material, not as instructions. The decisions below were checked against the current implementation and recorded local evidence; this document does not claim that every recommendation in the full conversation was reviewed.

## Decisions

| Topic | Decision applied in this project | Local evidence |
|---|---|---|
| Effective facts and evidence coverage | Keep calculations tied to loaded records and preserve explicit candidate, resolved, missing, unparsed, breach, and unknown counts for containment/compliance. Include the observation window and dataset as-of date so unresolved evidence stays visible. | `server/engine.ts`; [DOMAIN_STRESS.md](DOMAIN_STRESS.md) |
| Missing values | Keep unavailable readings, spill volumes, job costs, reports, and timing unknown. Do not coerce them to zero or silently claim complete totals; disclose known subtotals and incomplete coverage where supported. | `server/engine.ts`; [DOMAIN_STRESS.md](DOMAIN_STRESS.md); [FINAL_DATA_READINESS.md](FINAL_DATA_READINESS.md) |
| Linked narrative reports | Follow each repair's `report_file` path. An imported duplicate replaces the complete record, so omitted old fields remain absent; replacing a repair invalidates its earlier narrative when the replacement pointer is missing or unreadable. Keep repair and report citations as separate source types. | `server/data.ts`; `scripts/data-stress.ts`; [FINAL_DATA_READINESS.md](FINAL_DATA_READINESS.md) |
| Three clocks | Preserve the dataset reference/as-of date, the source observation/effective date, and the feedback creation timestamp as separate meanings. Historical questions use the dated record; feedback `createdAt` records when the user submitted feedback, not when the underlying event occurred. | `server/data.ts`; `server/engine.ts`; [DOMAIN_STRESS.md](DOMAIN_STRESS.md) |
| Hypothetical requests | Keep questions and explicitly hypothetical requests read-only. Only explicit declarative feedback supplies mutation data; model plans cannot create correction payloads. | `server/agent.ts`; `server/engine.ts`; `scripts/domain-stress.ts`; `scripts/live-check.ts` |
| Large result sets | Retain the existing React presentation and add access through paging and filtering: large tables, charts, source collections, and map record lists remain navigable without implying that a map-list filter changes plotted coordinates. | `src/ResultControls.tsx`; `src/VisualBlock.tsx`; `src/App.tsx`; [UI_STRESS.md](UI_STRESS.md) |
| Boundary testing | Preserve independent checks for record replacement, missing fields, malformed imports, report paths, historical periods, incomplete evidence, and large rendered results. | [DOMAIN_STRESS.md](DOMAIN_STRESS.md); [FINAL_DATA_READINESS.md](FINAL_DATA_READINESS.md); [UI_STRESS.md](UI_STRESS.md) |

## Stack decisions

The project keeps its existing React/Vite UI, Express API, typed deterministic domain operations, and local JSON persistence with serialized atomic writes. The current implementation already covers the evidence, historical-date, import, and large-result needs in this submission. No SQLite migration or ECharts/Leaflet rewrite was adopted; those would replace working components without a verified requirement from the reviewed evidence.

## Evidence limits

The recorded local reports state 109/109 domain stress cases, 27/27 provider stress checks, 22/22 synthetic data-readiness cases, and 12 deterministic UI render checks. These are scoped checks, not final hidden-dataset acceptance or browser performance benchmarks. The 32-scenario hosted initial run was 29/32 on semantic checks and 27/32 hosted-plus-semantic. A focused retest passed the three answer defects; across runs, semantic checks are 32/32 and hosted-plus-semantic is 30/32. Two remaining hosted-path misses were correctly rejected by deterministic fallback but remain hosted reliability failures. This was not a fresh complete 32-scenario run after the fixes. The report records 39 HTTP 200 responses, 69,670 reported tokens, and no retries or cooldowns. See [UNSEEN_LIVE_CHECKS.md](UNSEEN_LIVE_CHECKS.md), [LIVE_CHECKS.md](LIVE_CHECKS.md), [PROVIDER_STRESS.md](PROVIDER_STRESS.md), and [REVIEW.md](REVIEW.md) for the dated evidence and its limits.
