# Provider and planner stress review

Date: 2026-10-17. Scope: `server/agent.ts`, `server/gemini.ts`, and focused offline checks. No commits or pushes. The provider owner made no cloud calls during this stress phase; the separate unseen-query runner owned hosted requests.

## Confirmed defects and changes

| Reproduction | Before | Change |
|---|---|---|
| Repair costs explicitly requested for 2026; model returned `year: 2025` | Valid model filter overrode the requested year | Explicit year wins; conflicting date filters are removed |
| Explicit January-June 2026 interval; model returned 2024 dates | Wrong interval was accepted | Explicit inclusive endpoints win |
| Flowline RCA; model selected pump jack | Wrong equipment count could be returned | Explicit equipment wins |
| Reportable spills; model returned `reportableOnly: false` | Full list could substitute for required-report list | Explicit reportable requirement wins |
| Last 26 weeks; model returned 13 | Wrong history length | Explicit week count and reference-date window win |
| Top 5; model returned 3 | Wrong result count | Explicit numeric result count wins |
| Valid extended dataset with 250 wells | Planner schema/validation capped selection at the sample's 200 wells | Schema and validator selection bounds expand with the loaded dataset |
| Large prior well lists | Five history entries could still contain unbounded ID arrays | Each prompt history entry includes at most 40 IDs, its complete count, and a truncation flag; the domain resolver retains the full private list |
| Future production question planned as `search` | Forecast guard only covered status/history operations | Explicit future production questions are rejected as unsupported regardless of selected operation |
| T350 alarm rule or T200 shut-in procedure planned as `shared_knowledge` | Missing/irrelevant well scope produced no useful manual evidence | Explicit well-type manual/procedure questions route to document retrieval |
| Explain/summarize/review/hypothetical statements containing feedback phrases | The original deterministic parser could classify them as writes | An independent read-intent barrier protects both hosted-plan canonicalization and fallback; the domain owner's corresponding gate was also corrected |

Supported single-period comparisons across explicitly named wells remain supported. Multiple-period comparisons, below-threshold-only spill filters, median/average aggregates, and production forecasts receive an explicit capability response instead of a substituted total, unfiltered list, or partial comparison.

## Offline evidence

`node --import tsx scripts/provider-stress-check.ts`: **27 passed**. This retained suite covers the six filter reproductions, relative windows, 250-well selection, a new T777 type/manual, unsupported requests, an ordinary cross-well comparison, same-context cache reuse, correction-sensitive recomputation, dataset identity isolation, bounded private history, hosted-operation misroutes reproduced with mocked transport, and four read/hypothetical statements that must not mutate state.

`npx tsc --noEmit`: passed after these changes.

The existing retained provider checks cover key deduplication, per-project RPM/TPM/RPD admission, Pacific daily rollover, 429 cooldown, bounded model fallback, queue serialization, and timeout release. The independent synthesis review checks cover strict segment structure, cited-source numeric membership, and unknown/lowercase identifier rejection. These checks use fake runtime keys and mocked transport.

## Hosted evidence

Full observations and original failures remain in [UNSEEN_LIVE_CHECKS.md](UNSEEN_LIVE_CHECKS.md). The initial 32-question run exposed three genuine routing failures, U17-U19. Its invalid-ID and reversed-date responses were semantically safe but carried `invalid_plan` fallback metadata; those original flags remain visible.

The authorized targeted U17-U19 rerun passed **3/3**, using five HTTP 200 requests, 11,846 reported tokens, no retries, and no cooldowns:

- U17: a forecast question planned as search now returns the explicit forecast evidence gap.
- U18: the T350 manual answer states the 95 °C maximum and shut-in/inspection within 24 hours, citing OM-T350. Total 5,372 ms; synthesis 1,346 ms.
- U19: the T200 answer includes prime mover at the bottom of the stroke, brake, wing valve, and maintenance recording before work starts, citing OM-T200. Total 6,066 ms; synthesis 1,638 ms.

The first retrieval built its dataset index in 1,500 ms; the next manual retrieval reused it in 3 ms. Both successful manual syntheses used the primary Flash Lite model. Reasoning-model routing remains reserved for explicit deep analysis or comparisons/conflicts across sources, with an application override.

## Limits retained

- Citation and identifier checks establish membership in supplied evidence. Each structured segment's numeric tokens must be supported by that segment's cited passages. These guards do not prove semantic entailment or make every possible hallucination impossible.
- Exact domain calculations are returned directly and are never numerically rewritten by a model. Unsupported calculations are identified explicitly.
- Invalid IDs and reversed dates are safely rejected but may still be labeled as a planner fallback rather than as a distinct input-validation state.
- RPM/TPM/RPD settings are conservative application caps, not claims about Google's actual project quotas. Token admission starts from an estimate and reconciles returned usage. Application accounting is in process memory and resets on restart; upstream limits still apply.
- Read-plan caching is bounded, scoped to dataset identity, user/private context, reference date, question, and shared-state revisions. Exact answers are recomputed; mutations and answer outputs are not cached.

## Separate browser smoke issue 33: fleet current-status list

This was discovered by the root browser smoke after a server restart, separately from the original 32-question unseen batch. Exact request: **"List all non-producing wells across the entire fleet as a table."** The hosted Flash Lite planner selected downtime ranking, and the UI returned three historical downtime leaders with a year window. That answer did not satisfy the current fleet-status request. The reported hosted duration was 3,540 ms; this was not an old cached response.

The agent now treats an unambiguously current nonproducing-well list as `area_status`. An explicit fleet request uses the whole fleet: invented top-three limits, year/date windows, and model-supplied subsets are removed. `area_status` accepts fleet, area, type, or explicit well scopes. Genuine downtime and temporal ranking questions retain their original tool.

`node --import tsx scripts/provider-current-status-check.ts` passed against a separate raw-record/manual oracle: **all 15 currently nonproducing wells**, an exact table row/ID match, no top-three restriction, correct area/type scope, and genuine downtime routing preserved. The mocked transport deliberately returned the wrong historical-ranking plan, reproducing the hosted defect without a cloud call. TypeScript also passed.

The root owns the one targeted UI retest and source-package refresh. Its observed result will be recorded separately here; the offline proof is not represented as a completed browser retest.
