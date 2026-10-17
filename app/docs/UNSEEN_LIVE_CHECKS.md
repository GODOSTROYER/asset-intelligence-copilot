# Latest targeted retest: 3/3 pass

Retested U17, U18 and U19 after the provider/agent owner's fixes, on 2026-10-17 from 08:43:02Z to 08:43:15Z. All three passed with actual hosted planning; both procedural answers also passed hosted synthesis and cite the applicable manual. Exact future production now explicitly acknowledges the evidence limit. T350 correctly returns <=95 C and shut in/inspect within 24 hours; T200 returns the complete prime mover, brake, wing valve and before-work maintenance record procedure.

**Across the initial run plus this focused retest: semantic evidence passes for all 32 scenarios; hosted + semantic evidence passes for 30/32.** U15 reversed dates and U16 unknown well remain correctly rejected through deterministic fallback and retain their hosted-reliability flags. This is not a complete fresh run of all 32 after the fixes. Every original failure and the harness audit remains below.

The retest used five HTTP requests, all 200, and 11,846 actual reported tokens. Total harness usage across both processes: 39 HTTP requests and 69,670 reported tokens; no provider retry, credential rejection or cooldown occurred. Final health: five healthy/available project keys. Production state and dataset files were untouched. Source hashes identify the loaded implementation for each run. Standalone TypeScript checking of the harness passed.

---
# Audit of the initial unseen run

**Audited hosted + semantic: 27/32. Semantic: 29/32. Hosted path: 29/32.** All 32 questions ran sequentially in one process. The original automated result was 22/32; its full failure records remain below. This is a bounded sample-data check, not hidden-data acceptance.

Five failures were harness mistakes and were audited from the captured answers without another hosted call: U12, U20, U31 and U32 correctly cite the loader's canonical `SPILL-RESPONSE-SOP` ID; the assertion incorrectly expected the document's printed `SOP-SR` identifier. U21 correctly says the median aggregate is "not supported" and returns no substitute visualization; the regex only accepted "unsupported". The harness now accepts the canonical ID and equivalent wording. Raw row/number checks and citation resolution had already passed in these cases; the remaining captured source/trace checks were reviewed and pass.

Three answer defects remain from this initial run: U17 exact future production reached retrieval and returned irrelevant passages after a rejected synthesis, without clearly acknowledging that an exact forecast lacks evidence. U18 T350 maximum temperature and U19 T200 planned shut-in procedure selected `shared_knowledge`, returning no matching wells instead of the applicable cited manual instructions. These were sent to the provider/agent owner for fixes. U15 reversed dates and U16 an unknown well were rejected correctly and changed no state, but the hosted plan failed validation and the app used a deterministic fallback; they remain hosted-path failures.

The cross-user private reference, shared temperature correction, follow-up read, future work note, and planned downtime read all passed. Repair costs, downtime, ranking, spill counts, reportable spill scope, heatmap, containment, compliance, and visual payloads matched their raw-record oracles. Citation IDs/types/paths resolved to source records or the exact shared feedback in memory.

HTTP telemetry: 34 requests, all HTTP 200; 57824 actual tokens reported; 78878 ms total request elapsed time (sum, not wall time). Five healthy projects/keys; zero disabled or cooling-down keys. Final provider was queued by its per-minute application caps, with next eligibility 2026-10-17T08:39:26.886Z. No provider retries were required. The cloud window was released to the video owner after this process exited.

---

# Unseen hosted copilot checks

Started: 2026-10-17T08:38:05.147Z; updated: 2026-10-17T08:39:26.070Z; run complete.
Reference date 2026-10-16; 200 wells; 47177 evidence documents.
Hosted and semantic pass: **22/32 executed**; selected 32; HTTP requests 34/60.

Independent expected arithmetic reads raw inspection/maintenance/context records and well-type manuals directly. No domain answer or planning function produces the expected values. Citation checks resolve each ID, type and path against dataset documents or exact in-memory feedback, enforce asset scope, and require metric inputs. Procedural cases also require accepted hosted synthesis. This sample-data run is not proof on the final hidden dataset.

One process, sequential runAgent calls, configured project pool and caps. .env.local is loaded through process.loadEnvFile; credentials, headers and upstream bodies are never recorded. All state is in memory; .local production state and dataset files are untouched. Actual totalTokenCount is observed when supplied. Broad retries stop when provider has no available project during cooldown, or at 60 attempts. A fallback with correct facts is recorded as a hosted failure.

| Case | Semantic | Hosted | ms | tools |
|---|---|---|---:|---|
| U01 | PASS | PASS | 2667 | gemini_planner, status |
| U02 | PASS | PASS | 2287 | gemini_planner, status |
| U03 | PASS | PASS | 2314 | gemini_planner, status |
| U04 | PASS | PASS | 2645 | gemini_planner, status |
| U05 | PASS | PASS | 2412 | gemini_planner, costs |
| U06 | PASS | PASS | 2029 | gemini_planner, costs |
| U07 | PASS | PASS | 2590 | gemini_planner, downtime |
| U08 | PASS | PASS | 2310 | gemini_planner, downtime |
| U09 | PASS | PASS | 2445 | gemini_planner, temperature_history |
| U10 | PASS | PASS | 2334 | gemini_planner, downtime_ranking |
| U11 | PASS | PASS | 2605 | gemini_planner, spills |
| U12 | FAIL | PASS | 3023 | gemini_planner, spills |
| U13 | PASS | PASS | 2575 | gemini_planner, heatmap |
| U14 | PASS | PASS | 1904 | gemini_planner, costs |
| U15 | PASS | FAIL | 2658 | deterministic_planner, downtime |
| U16 | PASS | FAIL | 2312 | deterministic_planner, status |
| U17 | FAIL | FAIL | 5320 | gemini_planner, document_retrieval, synthesis_routing, retrieval_fallback |
| U18 | FAIL | PASS | 2453 | gemini_planner, shared_knowledge |
| U19 | FAIL | PASS | 2557 | gemini_planner, shared_knowledge |
| U20 | FAIL | PASS | 3986 | gemini_planner, document_retrieval, synthesis_routing, gemini_synthesis |
| U21 | FAIL | PASS | 2395 | gemini_planner, capability_guard |
| U22 | PASS | PASS | 1784 | gemini_planner, status |
| U23 | PASS | PASS | 2637 | gemini_planner, costs |
| U24 | PASS | PASS | 2097 | gemini_planner, costs |
| U25 | PASS | PASS | 2735 | gemini_planner, correction |
| U26 | PASS | PASS | 2201 | gemini_planner, status |
| U27 | PASS | PASS | 2390 | gemini_planner, status |
| U28 | PASS | PASS | 2773 | gemini_planner, note |
| U29 | PASS | PASS | 2117 | gemini_planner, shared_knowledge |
| U30 | PASS | PASS | 2175 | gemini_planner, status |
| U31 | FAIL | PASS | 2537 | gemini_planner, containment |
| U32 | FAIL | PASS | 1300 | gemini_planner, compliance |

## U01

Question: Is WELL-0037 producing right now? Show a status card.

Oracle: Latest raw INS-0037-0205; delta 21.3 C; manual 15 C; producing; status.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2667ms.
Answer: Yes, WELL-0037 is producing oil. Latest inspection INS-0037-0205 was Oct 15, 2026 by Sarah Mitchell (drone). Wellhead 46.1 °C minus air 24.8 °C = 21.3 °C; the T200 manual threshold is 15 °C.

Sources: INS-0037-0205 [inspection], OM-T200 [manual].
Wells: WELL-0037.
Visualization: {"type":"status","title":"WELL-0037 · current status","data":[{"assetId":"WELL-0037","name":"SW-23 Well 037","status":"Producing","delta":21.3,"threshold":15,"ambient":24.8,"head":46.1,"date":"Oct 15, 2026","inspector":"Sarah Mitchell","method":"drone","inspectionId":"INS-0037-0205","recordedStatus":"active","reason":""}]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: status. Only this user’s last five exchanges were supplied.","durationMs":2663},{"tool":"status","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":4}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":0,"requestsToday":0,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":1542,"requestsToday":1,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U02

Question: Is WELL-0083 producing right now? Show a table.

Oracle: Latest raw INS-0083-0201; delta 29.6 C; manual 15 C; producing; table.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2287ms.
Answer: Yes, WELL-0083 is producing oil. Latest inspection INS-0083-0201 was Oct 15, 2026 by Ryan Brooks (manual). Wellhead 55.8 °C minus air 26.2 °C = 29.6 °C; the T200 manual threshold is 15 °C.

Sources: INS-0083-0201 [inspection], OM-T200 [manual].
Wells: WELL-0083.
Visualization: {"type":"table","title":"Current status · WELL-0083","columns":["Well","Status","Wellhead − air","Threshold","Last inspection","Stored status"],"rows":[["WELL-0083","Producing","29.6 °C","15 °C","Oct 15, 2026","active"]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: status. Only this user’s last five exchanges were supplied.","durationMs":2286},{"tool":"status","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":1}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":1542,"requestsToday":1,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":3083,"requestsToday":2,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U03

Question: Is WELL-0112 producing right now? Show a map.

Oracle: Latest raw INS-0112-0208; delta 30.5 C; manual 15 C; producing; map.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2314ms.
Answer: Yes, WELL-0112 is producing oil. Latest inspection INS-0112-0208 was Oct 15, 2026 by Tyler Hughes (drone). Wellhead 50.6 °C minus air 20.1 °C = 30.5 °C; the T200 manual threshold is 15 °C.

Sources: INS-0112-0208 [inspection], OM-T200 [manual].
Wells: WELL-0112.
Visualization: {"type":"map","title":"Well status","data":[{"assetId":"WELL-0112","name":"NE-07 Well 112","status":"Producing","delta":30.5,"threshold":15,"ambient":20.1,"head":50.6,"date":"Oct 15, 2026","inspector":"Tyler Hughes","method":"drone","inspectionId":"INS-0112-0208","recordedStatus":"active","reason":"","lat":32.09378,"lon":-102.20244}]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: status. Only this user’s last five exchanges were supplied.","durationMs":2312},{"tool":"status","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":2}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":3083,"requestsToday":2,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":4624,"requestsToday":3,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U04

Question: Is WELL-0191 producing right now? Show a bar chart.

Oracle: Latest raw INS-0191-0205; delta 34.2 C; manual 20 C; producing; bar.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2645ms.
Answer: Yes, WELL-0191 is producing oil. Latest inspection INS-0191-0205 was Oct 15, 2026 by Jessica Reed (drone). Wellhead 57.3 °C minus air 23.1 °C = 34.2 °C; the T350 manual threshold is 20 °C.

Sources: INS-0191-0205 [inspection], OM-T350 [manual].
Wells: WELL-0191.
Visualization: {"type":"bar","title":"Wellhead temperature above air","data":[{"assetId":"WELL-0191","name":"WELL-0191","status":"Producing","delta":34.2,"threshold":20,"ambient":23.1,"head":57.3,"date":"Oct 15, 2026","inspector":"Jessica Reed","method":"drone","inspectionId":"INS-0191-0205","recordedStatus":"active","reason":"","value":34.2,"label":"34.2 °C"}],"meta":{"valueLabel":"Wellhead above air","unit":"°C"}}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: status. Only this user’s last five exchanges were supplied.","durationMs":2643},{"tool":"status","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":2}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":4624,"requestsToday":3,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":6166,"requestsToday":4,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U05

Question: Show repair costs for WELL-0037 and WELL-0083 from 2026-07-01 through 2026-09-30 as a bar chart.

Oracle: WELL-0037 USD 413; WELL-0083 USD 662

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2412ms.
Answer: Repair costs by maintenance start date, Jul 1, 2026 through Sep 30, 2026: WELL-0037 USD 413 · WELL-0083 USD 662.

Sources: MNT-0037-031 [repair], MNT-0083-034 [repair].
Wells: WELL-0037, WELL-0083.
Visualization: {"type":"bar","title":"Repair cost by well","data":[{"name":"WELL-0037","assetId":"WELL-0037","value":413,"label":"USD 413","jobs":1,"partial":false},{"name":"WELL-0083","assetId":"WELL-0083","value":662,"label":"USD 662","jobs":1,"partial":false}],"meta":{"valueLabel":"Repair cost","currency":"USD","format":"currency"}}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: costs. Only this user’s last five exchanges were supplied.","durationMs":2410},{"tool":"costs","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":2}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":6166,"requestsToday":4,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":7823,"requestsToday":5,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U06

Question: Show repair costs for WELL-0194 from 2026-10-08 through 2026-10-15 as a bar chart.

Oracle: WELL-0194 USD 0

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2029ms.
Answer: Repair costs by maintenance start date, Oct 8, 2026 through Oct 15, 2026: WELL-0194 USD 0.

Sources: none.
Wells: WELL-0194.
Visualization: {"type":"bar","title":"Repair cost by well","data":[{"name":"WELL-0194","assetId":"WELL-0194","value":0,"label":"USD 0","jobs":0,"partial":false}],"meta":{"valueLabel":"Repair cost","currency":"USD","format":"currency"}}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: costs. Only this user’s last five exchanges were supplied.","durationMs":2029},{"tool":"costs","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":0}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":7823,"requestsToday":5,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":9422,"requestsToday":6,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U07

Question: How many days of downtime did WELL-0084 have from 2026-08-01 through 2026-09-30? Show a bar chart.

Oracle: 35 days from 5 raw weekly nonproducing inspections.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2590ms.
Answer: WELL-0084: 35 days (5 non-producing weekly inspections). Window Aug 1, 2026 through Sep 30, 2026. Each non-producing inspection counts as 7 days; missed inspections contribute no downtime. Aug 20, 2026: 1.9 °C above ambient; Separator level controller fault (MNT-0084-031). Aug 27, 2026: 0.8 °C above ambient; Separator level controller fault (MNT-0084-031). Sep 3, 2026: 3.6 °C above ambient; Separator level controller fault (MNT-0084-031). Sep 17, 2026: 4.6 °C above ambient; Gearbox oil leak (MNT-0084-032). Sep 24, 2026: 5.1 °C above ambient; Gearbox oil leak (MNT-0084-032).

Sources: OM-T200 [manual], INS-0084-0199 [inspection], MNT-0084-031 [repair], INS-0084-0200 [inspection], INS-0084-0201 [inspection], INS-0084-0203 [inspection], MNT-0084-032 [repair], INS-0084-0204 [inspection].
Wells: WELL-0084.
Visualization: {"type":"bar","title":"Downtime by well","data":[{"assetId":"WELL-0084","name":"WELL-0084","type":"T200","value":35,"count":5,"label":"35 days"}],"meta":{"valueLabel":"Days down","unit":"days"}}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: downtime. Only this user’s last five exchanges were supplied.","durationMs":2585},{"tool":"downtime","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":5}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":9422,"requestsToday":6,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":11027,"requestsToday":7,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U08

Question: How many days of downtime did WELL-0112 have from 2026-10-08 through 2026-10-08? Show a bar chart.

Oracle: 0 days from 0 raw weekly nonproducing inspections.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2310ms.
Answer: WELL-0112: 0 days (0 non-producing weekly inspections). Window Oct 8, 2026 through Oct 8, 2026. Each non-producing inspection counts as 7 days; missed inspections contribute no downtime. 

Sources: OM-T200 [manual].
Wells: WELL-0112.
Visualization: {"type":"bar","title":"Downtime by well","data":[{"assetId":"WELL-0112","name":"WELL-0112","type":"T200","value":0,"count":0,"label":"0 days"}],"meta":{"valueLabel":"Days down","unit":"days"}}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: downtime. Only this user’s last five exchanges were supplied.","durationMs":2309},{"tool":"downtime","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":1}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":11027,"requestsToday":7,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":12626,"requestsToday":8,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U09

Question: Show the last 5 weeks of wellhead and ambient temperatures for WELL-0037 as a line chart.

Oracle: Exact raw readings newer than 2026-09-11; own manual; line chart.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2445ms.
Answer: Here are 5 readings in the requested period. No non-producing readings are shown.

Sources: OM-T200 [manual], INS-0037-0201 [inspection], INS-0037-0202 [inspection], INS-0037-0203 [inspection], INS-0037-0204 [inspection], INS-0037-0205 [inspection].
Wells: WELL-0037.
Visualization: {"type":"line","title":"Wellhead vs air · Sep 11, 2026 to Oct 16, 2026","columns":["Date","Wellhead °C","Air °C","Δ °C","Producing"],"rows":[["Sep 17, 2026",59.8,27.8,32,"Yes"],["Sep 24, 2026",60.7,31,29.7,"Yes"],["Oct 1, 2026",54,27.6,26.4,"Yes"],["Oct 8, 2026",57.9,25.4,32.5,"Yes"],["Oct 15, 2026",46.1,24.8,21.3,"Yes"]],"data":[{"assetId":"WELL-0037","date":"Sep 17, 2026","wellhead":59.8,"air":27.8,"producing":true,"delta":32,"id":"INS-0037-0201"},{"assetId":"WELL-0037","date":"Sep 24, 2026","wellhead":60.7,"air":31,"producing":true,"delta":29.7,"id":"INS-0037-0202"},{"assetId":"WELL-0037","date":"Oct 1, 2026","wellhead":54,"air":27.6,"producing":true,"delta":26.4,"id":"INS-0037-0203"},{"assetId":"WELL-0037","date":"Oct 8, 2026","wellhead":57.9,"air":25.4,"producing":true,"delta":32.5,"id":"INS-0037-0204"},{"assetId":"WELL-0037","date":"Oct 15, 2026","wellhead":46.1,"air":24.8,"producing":true,"delta":21.3,"id":"INS-0037-0205"}]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: temperature_history. Only this user’s last five exchanges were supplied.","durationMs":2442},{"tool":"temperature_history","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":3}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":12626,"requestsToday":8,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":14186,"requestsToday":9,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U10

Question: Which top 4 wells in Southwest Block 24 had the most downtime in the last 3 months? Show a table.

Oracle: [{"id":"WELL-0084","value":42},{"id":"WELL-0061","value":28},{"id":"WELL-0071","value":28},{"id":"WELL-0080","value":28}]

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2334ms.
Answer: WELL-0084: 42 days (6 non-producing weekly inspections); WELL-0061: 28 days (4 non-producing weekly inspections); WELL-0071: 28 days (4 non-producing weekly inspections); WELL-0080: 28 days (4 non-producing weekly inspections). Window Jul 16, 2026 through Oct 16, 2026. Each non-producing inspection counts as 7 days; missed inspections contribute no downtime. 

Sources: OM-T200 [manual], OM-T350 [manual], INS-0054-0194 [inspection], MNT-0054-028 [repair], INS-0058-0195 [inspection], MNT-0058-031 [repair], INS-0058-0196 [inspection], INS-0058-0197 [inspection], INS-0060-0207 [inspection], INS-0061-0202 [inspection], MNT-0061-028 [repair], INS-0061-0203 [inspection], INS-0061-0204 [inspection], INS-0061-0205 [inspection], INS-0063-0190 [inspection], MNT-0063-031 [repair], INS-0066-0205 [inspection], INS-0068-0172 [inspection], MNT-0068-021 [repair], INS-0069-0191 [inspection], MNT-0069-035 [repair], INS-0071-0200 [inspection], MNT-0071-038 [repair], INS-0071-0201 [inspection], INS-0071-0202 [inspection], INS-0071-0203 [inspection], INS-0072-0196 [inspection], MNT-0072-029 [repair], INS-0072-0197 [inspection], INS-0072-0198 [inspection], INS-0073-0194 [inspection], MNT-0073-027 [repair], INS-0079-0200 [inspection], MNT-0079-036 [repair], INS-0080-0195 [inspection], MNT-0080-025 [repair], INS-0080-0196 [inspection], INS-0080-0197 [inspection], INS-0080-0198 [inspection], INS-0084-0199 [inspection], MNT-0084-031 [repair], INS-0084-0200 [inspection], INS-0084-0201 [inspection], INS-0084-0203 [inspection], MNT-0084-032 [repair], INS-0084-0204 [inspection], INS-0084-0205 [inspection], INS-0085-0197 [inspection], MNT-0085-031 [repair], INS-0085-0198 [inspection], INS-0085-0199 [inspection], INS-0087-0197 [inspection], MNT-0087-027 [repair], INS-0093-0198 [inspection], MNT-0093-032 [repair], INS-0093-0199 [inspection], INS-0093-0200 [inspection], INS-0093-0201 [inspection], INS-0097-0193 [inspection], MNT-0097-032 [repair], INS-0097-0194 [inspection], INS-0097-0195 [inspection].
Wells: WELL-0084, WELL-0061, WELL-0071, WELL-0080.
Visualization: {"type":"table","title":"Downtime leaders","columns":["Well","Type","Downtime days","Non-producing inspections"],"rows":[["WELL-0084","T200",42,6],["WELL-0061","T200",28,4],["WELL-0071","T200",28,4],["WELL-0080","T200",28,4]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: downtime_ranking. Only this user’s last five exchanges were supplied.","durationMs":2265},{"tool":"downtime_ranking","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":69}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":14186,"requestsToday":9,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":15736,"requestsToday":10,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U11

Question: List real spills for WELL-0037, WELL-0083, WELL-0112, WELL-0194 from 2026-01-01 through 2026-10-16 as a table.

Oracle: Raw spills minus formal false-positive notes, no other wells.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2605ms.
Answer: WELL-0037, WELL-0083, WELL-0112, WELL-0194 had 1 real spills, totalling 1.5 bbl from Jan 1, 2026 through Oct 16, 2026. Excluded 1 corrected false positive(s): INS-0194-0192. 

Sources: INS-0194-0191 [inspection], MNT-0194-036 [repair], MNT-0194-036 [repair report], INS-0194-0192 [inspection], CTX-0194-002 [note], SPILL-RESPONSE-SOP [SOP].
Wells: WELL-0194.
Visualization: {"type":"table","title":"Real spills","columns":["Well","Date","Barrels","Area","Latitude","Longitude","Inspection"],"rows":[["WELL-0194","Jul 16, 2026",1.5,"NE-08",32.13056,-102.1817,"INS-0194-0191"]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: spills. Only this user’s last five exchanges were supplied.","durationMs":2599},{"tool":"spills","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":6}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":15736,"requestsToday":10,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":17509,"requestsToday":11,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U12

Question: Which spills in Southwest Block 24 needed a regulator report in 2026? Show a table.

Oracle: 2 qualifying spills >=5 bbl from independent raw records.

Failures: Missing supporting source SOP-SR

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 3023ms.
Answer: Southwest Block 24 had 2 reportable spills, totalling 10.8 bbl from Jan 1, 2026 through Oct 16, 2026. Excluded 4 corrected false positive(s): INS-0054-0172, INS-0062-0187, INS-0080-0192, INS-0081-0171. WELL-0071: 5.7 bbl is reportable. Written report REG-0071-001 filed after 20 hours. WELL-0099: 5.1 bbl is reportable. Written report REG-0099-001 filed after 29 hours.

Sources: INS-0054-0172 [inspection], CTX-0054-002 [note], INS-0062-0187 [inspection], CTX-0062-001 [note], INS-0071-0184 [inspection], MNT-0071-036 [repair], MNT-0071-036 [repair report], REG-0071-001 [regulator], INS-0080-0192 [inspection], CTX-0080-002 [note], INS-0081-0171 [inspection], CTX-0081-001 [note], INS-0099-0171 [inspection], MNT-0099-026 [repair], MNT-0099-026 [repair report], REG-0099-001 [regulator], SPILL-RESPONSE-SOP [SOP].
Wells: WELL-0099, WELL-0071.
Visualization: {"type":"table","title":"Reportable spills","columns":["Well","Date","Barrels","Area","Latitude","Longitude","Inspection"],"rows":[["WELL-0099","Mar 12, 2026",5.1,"SW-24",31.77128,-102.47348,"INS-0099-0171"],["WELL-0071","May 21, 2026",5.7,"SW-24",31.78587,-102.48304,"INS-0071-0184"]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: spills. Only this user’s last five exchanges were supplied.","durationMs":3016},{"tool":"spills","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":7}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":17509,"requestsToday":11,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":19071,"requestsToday":12,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U13

Question: Show spill counts by month for Southwest Block 24 in 2026 as a heatmap.

Oracle: Only SW-24; corrected spill counts in Jan-Oct.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2575ms.
Answer: Spill counts by area and month in 2026. Formal corrections are applied; corrected false positives are excluded.

Sources: INS-0052-0172 [inspection], MNT-0052-028 [repair], MNT-0052-028 [repair report], INS-0053-0167 [inspection], MNT-0053-029 [repair], MNT-0053-029 [repair report], INS-0054-0172 [inspection], CTX-0054-002 [note], INS-0060-0169 [inspection], MNT-0060-028 [repair], MNT-0060-028 [repair report], INS-0060-0190 [inspection], MNT-0060-031 [repair], MNT-0060-031 [repair report], INS-0060-0191 [inspection], MNT-0060-033 [repair], MNT-0060-033 [repair report], INS-0062-0187 [inspection], CTX-0062-001 [note], INS-0064-0171 [inspection], MNT-0064-024 [repair], MNT-0064-024 [repair report], INS-0069-0171 [inspection], MNT-0069-029 [repair], MNT-0069-029 [repair report], INS-0071-0164 [inspection], MNT-0071-030 [repair], MNT-0071-030 [repair report], INS-0071-0180 [inspection], MNT-0071-034 [repair], MNT-0071-034 [repair report], INS-0071-0184 [inspection], MNT-0071-036 [repair], MNT-0071-036 [repair report], INS-0073-0180 [inspection], MNT-0073-023 [repair], MNT-0073-023 [repair report], INS-0073-0182 [inspection], MNT-0073-024 [repair], MNT-0073-024 [repair report], INS-0073-0195 [inspection], MNT-0073-028 [repair], MNT-0073-028 [repair report], INS-0074-0171 [inspection], MNT-0074-029 [repair], MNT-0074-029 [repair report], INS-0074-0176 [inspection], MNT-0074-030 [repair], MNT-0074-030 [repair report], INS-0074-0179 [inspection], MNT-0074-031 [repair], MNT-0074-031 [repair report], INS-0074-0183 [inspection], MNT-0074-033 [repair], MNT-0074-033 [repair report], INS-0075-0186 [inspection], MNT-0075-032 [repair], MNT-0075-032 [repair report], INS-0077-0201 [inspection], MNT-0077-025 [repair], MNT-0077-025 [repair report], INS-0079-0183 [inspection], MNT-0079-034 [repair], MNT-0079-034 [repair report], INS-0080-0192 [inspection], CTX-0080-002 [note], INS-0080-0202 [inspection], MNT-0080-027 [repair], MNT-0080-027 [repair report], INS-0080-0203 [inspection], MNT-0080-028 [repair], MNT-0080-028 [repair report], INS-0081-0171 [inspection], CTX-0081-001 [note], INS-0081-0179 [inspection], MNT-0081-026 [repair], MNT-0081-026 [repair report], INS-0082-0167 [inspection], MNT-0082-025 [repair], MNT-0082-025 [repair report], INS-0082-0198 [inspection], MNT-0082-028 [repair], MNT-0082-028 [repair report], INS-0084-0185 [inspection], MNT-0084-028 [repair], MNT-0084-028 [repair report], INS-0085-0162 [inspection], MNT-0085-020 [repair], MNT-0085-020 [repair report], INS-0085-0167 [inspection], MNT-0085-021 [repair], MNT-0085-021 [repair report], INS-0085-0187 [inspection], MNT-0085-028 [repair], MNT-0085-028 [repair report], INS-0085-0192 [inspection], MNT-0085-030 [repair], MNT-0085-030 [repair report], INS-0088-0178 [inspection], MNT-0088-027 [repair], MNT-0088-027 [repair report], INS-0088-0181 [inspection], MNT-0088-029 [repair], MNT-0088-029 [repair report], INS-0090-0187 [inspection], MNT-0090-033 [repair], MNT-0090-033 [repair report], INS-0091-0152 [inspection], MNT-0091-018 [repair], MNT-0091-018 [repair report], INS-0093-0189 [inspection], MNT-0093-029 [repair], MNT-0093-029 [repair report], INS-0096-0184 [inspection], MNT-0096-034 [repair], MNT-0096-034 [repair report], INS-0097-0201 [inspection], MNT-0097-034 [repair], MNT-0097-034 [repair report], INS-0098-0165 [inspection], MNT-0098-026 [repair], MNT-0098-026 [repair report], INS-0098-0173 [inspection], MNT-0098-027 [repair], MNT-0098-027 [repair report], INS-0098-0192 [inspection], MNT-0098-031 [repair], MNT-0098-031 [repair report], INS-0099-0171 [inspection], MNT-0099-026 [repair], MNT-0099-026 [repair report], INS-0099-0178 [inspection], MNT-0099-028 [repair], MNT-0099-028 [repair report], INS-0100-0196 [inspection], MNT-0100-034 [repair], MNT-0100-034 [repair report].
Wells: WELL-0052, WELL-0053, WELL-0060, WELL-0064, WELL-0069, WELL-0071, WELL-0073, WELL-0074, WELL-0075, WELL-0077, WELL-0079, WELL-0080, WELL-0081, WELL-0082, WELL-0084, WELL-0085, WELL-0088, WELL-0090, WELL-0091, WELL-0093, WELL-0096, WELL-0097, WELL-0098, WELL-0099, WELL-0100.
Visualization: {"type":"heatmap","title":"Spills by area × month · 2026","columns":["Area","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Total"],"rows":[["Southwest Block 24",7,4,5,6,5,5,3,1,5,2,43]],"data":[{"area":"Southwest Block 24","month":"Jan","value":7},{"area":"Southwest Block 24","month":"Feb","value":4},{"area":"Southwest Block 24","month":"Mar","value":5},{"area":"Southwest Block 24","month":"Apr","value":6},{"area":"Southwest Block 24","month":"May","value":5},{"area":"Southwest Block 24","month":"Jun","value":5},{"area":"Southwest Block 24","month":"Jul","value":3},{"area":"Southwest Block 24","month":"Aug","value":1},{"area":"Southwest Block 24","month":"Sep","value":5},{"area":"Southwest Block 24","month":"Oct","value":2}]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: heatmap. Only this user’s last five exchanges were supplied.","durationMs":2541},{"tool":"heatmap","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":34}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":19071,"requestsToday":12,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":20580,"requestsToday":13,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U14

Question: Show repair costs for WELL-0037 from 2030-01-01 through 2030-12-31 as a table.

Oracle: Empty future window: zero jobs and USD 0, no invented records.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 1904ms.
Answer: Repair costs by maintenance start date, Jan 1, 2030 through Dec 31, 2030: WELL-0037 USD 0.

Sources: none.
Wells: WELL-0037.
Visualization: {"type":"table","title":"Repair costs","columns":["Well","Repair jobs","Total cost"],"rows":[["WELL-0037",0,"USD 0"]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: costs. Only this user’s last five exchanges were supplied.","durationMs":1904},{"tool":"costs","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":0}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":20580,"requestsToday":13,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":22178,"requestsToday":14,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U15

Question: How many days was WELL-0083 down from 2026-10-15 through 2026-10-01?

Oracle: Reject reversed start/end dates, no metric or mutation.

Failures: Hosted path did not fully succeed: fallback invalid_plan

Model: {"name":"gemini-3.5-flash-lite","status":"fallback","reason":"invalid_plan"}; duration 2658ms.
Answer: The requested start date is after its end date.

Sources: none.
Wells: none.
Visualization: null
Conflicts: []
Trace: [{"tool":"deterministic_planner","detail":"Hosted planner unavailable (invalid_plan); validated domain fallback used. Retry this question to reconnect.","durationMs":2658},{"tool":"downtime","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":0}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":22178,"requestsToday":14,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":23749,"requestsToday":15,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U16

Question: Is WELL-9999 producing oil right now?

Oracle: Unknown well is explicit; no invented classification.

Failures: Hosted path did not fully succeed: fallback invalid_plan

Model: {"name":"gemini-3.5-flash-lite","status":"fallback","reason":"invalid_plan"}; duration 2312ms.
Answer: Well ID(s) not found in the loaded dataset: WELL-9999. No records were changed.

Sources: none.
Wells: none.
Visualization: null
Conflicts: []
Trace: [{"tool":"deterministic_planner","detail":"Hosted planner unavailable (invalid_plan); validated domain fallback used. Retry this question to reconnect.","durationMs":2312},{"tool":"status","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":0}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":23749,"requestsToday":15,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":25246,"requestsToday":16,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U17

Question: What will the exact oil production of WELL-0037 be next month, in barrels per day?

Oracle: Temperature/inspection records cannot prove an exact future production forecast.

Failures: Hosted path did not fully succeed: fallback invalid_response:well_ids Missing evidence uncertainty

Model: {"name":"gemini-3.5-flash-lite","status":"fallback","reason":"invalid_response:well_ids"}; duration 5320ms.
Answer: Relevant source passages:  regulatory compliance sop [REGULATORY-COMPLIANCE-SOP]: ## 2. Protocols  | Protocol ID | Requirement | Evidence in the data | |---|---|---| | **RC-01** | Every well must be inspected at least once every **14 days**. | `inspections.jsonl` timestamps | | **RC-02** | Every flowline must pass an **integrity test once per calendar year**. | `maintenance.jsonl` entries with issue "Annual flowline integrity test" | | **RC-03** | Any well down for more than **14 consecutive days** must be reported to the area production supervisor. | Inspections plus context notes | | **RC-04** | Agency notices of violation must be answered within **30 days** and tracked until closed. | `regulatory-events.jsonl` status and `nov_response_filed` events | | **RC-05** | Keep a **flowline maintenance program**: weekly visual inspection of the pad and flowline route, corrective repair of any leak found, and prompt cleanup. Modelled on EPA SPCC rules for onshore production (40 CFR 112.9(d)(4)). | Inspections, flowline repairs and their reports |  T200 operating manual [OM-T200]: ## 10. Maintenance escalation  - Three or more **corrective** maintenance events on the same equipment kind in the   12 months before the current date require a root-cause analysis (RCA) before the next repair is closed. - Downtime of more than 14 consecutive days must be reported to the area production supervisor. - An annual flowline integrity test is mandatory (see Regulatory Compliance SOP, RC-02).  spill response sop [SPILL-RESPONSE-SOP]: ## 2. Background (industry references)  - **Reporting:** state oil and gas regulators commonly require immediate notice of fires,   leaks, spills and breaks, and a written report for crude oil losses of more than 5   barrels. Texas Railroad Commission Statewide Rule 20 and its Form H-8 are an example. Our SR-01 keeps the   immediate phone call and adds a company deadline of 24 hours for the written notice.   Our reporting threshold (5 bbl or more) is slightly stricter than "more than 5 bbl". - **Cleanup:** Texas Statewide Rule 91 is an example cleanup standard for crude oil on   land in non-sensitive areas. It requires free oil to be removed promptly, the   contamination to be mapped, and soil cleaned to **1.0% total petroleum hydrocarbons   (TPH) by weight**; Commission guidance also describes treating more heavily   contaminated soil (around 5% TPH) by mixing it down or hauling it away. Our SR-03 follows   this approach. The number of soil samples and the 60-day verification deadline in SR-03   are company rules. - **Prevention:** for onshore production facilities covered by EPA's SPCC rules,   40 CFR 112.9 requires a flowline maintenance program and prompt cleanup of discharges   (see Regulatory Compliance SOP, RC-05).

Sources: REGULATORY-COMPLIANCE-SOP [SOP], OM-T200 [manual], SPILL-RESPONSE-SOP [SOP], INS-0037-0108 [inspection], INS-0037-0158 [inspection], INS-0037-0041 [inspection].
Wells: WELL-0037.
Visualization: null
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: search. Only this user’s last five exchanges were supplied.","durationMs":2530},{"tool":"document_retrieval","detail":"Lexical index reused per dataset; 6 bounded evidence passages selected from 47177 records.","durationMs":1235},{"tool":"synthesis_routing","detail":"Ordinary evidence lookup uses the primary fast model. Requested model: gemini-3.5-flash-lite.","durationMs":0},{"tool":"retrieval_fallback","detail":"Synthesis unavailable (invalid_response:well_ids); original source passages returned. Retry to reconnect.","durationMs":1555}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":25246,"requestsToday":16,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":29585,"requestsToday":18,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U18

Question: What is the maximum permitted wellhead temperature for T350, and what must happen if it is exceeded?

Oracle: T350 only: <=95 C; shut in and inspect within 24 hours.

Failures: Missing answer fact: 95

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2453ms.
Answer: No wells match the requested scope. Check the well, area and type filters.

Sources: none.
Wells: none.
Visualization: null
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: shared_knowledge. Only this user’s last five exchanges were supplied.","durationMs":2453},{"tool":"shared_knowledge","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":0}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":29585,"requestsToday":18,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":31089,"requestsToday":19,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U19

Question: For T200, what is the planned shut-in procedure before work starts?

Oracle: Stop prime mover at bottom of stroke; brake; wing valve; maintenance record before work.

Failures: Missing answer fact: prime mover

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2557ms.
Answer: No wells match the requested scope. Check the well, area and type filters.

Sources: none.
Wells: none.
Visualization: null
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: shared_knowledge. Only this user’s last five exchanges were supplied.","durationMs":2557},{"tool":"shared_knowledge","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":0}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":31089,"requestsToday":19,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":32594,"requestsToday":20,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U20

Question: Under the Spill Response SOP, what is the immediate notification duty and what are the written-notice deadlines for reportable and major spills?

Oracle: Reportable >=5 bbl:24h; major >=25:2h; phone immediately; SOP evidence.

Failures: Missing supporting source SOP-SR

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 3986ms.
Answer: For a reportable or major spill, phone the State Oil & Gas Commission immediately, then file the written notice within 24 hours of discovery, or within 2 hours for a major spill. [SPILL-RESPONSE-SOP]

Sources: SPILL-RESPONSE-SOP [SOP].
Wells: none.
Visualization: null
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: search. Only this user’s last five exchanges were supplied.","durationMs":2459},{"tool":"document_retrieval","detail":"Lexical index reused per dataset; 6 bounded evidence passages selected from 47177 records.","durationMs":60},{"tool":"synthesis_routing","detail":"Ordinary evidence lookup uses the primary fast model. Requested model: gemini-3.5-flash-lite.","durationMs":0},{"tool":"gemini_synthesis","detail":"Actual model: gemini-3.5-flash-lite. Grounded prose accepted after source-ID and numerical-token validation.","durationMs":1466}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":32594,"requestsToday":20,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":3,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":37477,"requestsToday":22,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:05.155Z"}

## U21

Question: Give the median corrective repair cost across all equipment at WELL-0083 in 2026.

Oracle: Median is unsupported: do not substitute total repair cost.

Failures: Unsupported median silently replaced with another metric

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2395ms.
Answer: That statistical aggregate is not supported by the current domain tools. I can provide exact repair-cost totals, inspection-derived downtime, or recorded readings, but I have not substituted a total or a list for the requested statistic.

Sources: none.
Wells: WELL-0083.
Visualization: null
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: costs. Only this user’s last five exchanges were supplied.","durationMs":2395},{"tool":"capability_guard","detail":"Unsupported filter or multiple time windows acknowledged without partial aggregation.","durationMs":0}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":3,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":37477,"requestsToday":22,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:05.155Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":2,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":39037,"requestsToday":23,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:05.155Z"}

## U22

Question: Compare current status for WELL-0037 and WELL-0194 as a table.

Oracle: Exactly two wells; independently derived latest production.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 1784ms.
Answer: Yes, WELL-0037 is producing oil. Latest inspection INS-0037-0205 was Oct 15, 2026 by Sarah Mitchell (drone). Wellhead 46.1 °C minus air 24.8 °C = 21.3 °C; the T200 manual threshold is 15 °C. Yes, WELL-0194 is producing oil. Latest inspection INS-0194-0204 was Oct 15, 2026 by Ashley Bennett (manual). Wellhead 56.4 °C minus air 25.8 °C = 30.6 °C; the T200 manual threshold is 15 °C.

Sources: INS-0037-0205 [inspection], OM-T200 [manual], INS-0194-0204 [inspection].
Wells: WELL-0037, WELL-0194.
Visualization: {"type":"table","title":"Current well status","data":[],"columns":["Well","Status","Wellhead − air","Threshold","Last inspection","Stored status"],"rows":[["WELL-0037","Producing","21.3 °C","15 °C","Oct 15, 2026","active"],["WELL-0194","Producing","30.6 °C","15 °C","Oct 15, 2026","active"]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: status. Only this user’s last five exchanges were supplied.","durationMs":1781},{"tool":"status","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":3}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":2,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":39037,"requestsToday":23,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:05.155Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":40612,"requestsToday":24,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:05.155Z"}

## U23

Question: For those two wells, show repair costs from 2026-01-01 through 2026-10-16 as a table.

Oracle: Same user resolves WELL-0037 and WELL-0194 only.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2637ms.
Answer: Repair costs by maintenance start date, Jan 1, 2026 through Oct 16, 2026: WELL-0037 USD 3,238 · WELL-0194 USD 14,110.

Sources: MNT-0037-028 [repair], MNT-0037-029 [repair], MNT-0037-030 [repair], MNT-0037-031 [repair], MNT-0194-031 [repair], MNT-0194-032 [repair], MNT-0194-033 [repair], MNT-0194-034 [repair], MNT-0194-035 [repair], MNT-0194-036 [repair], MNT-0194-037 [repair].
Wells: WELL-0037, WELL-0194.
Visualization: {"type":"table","title":"Repair costs","columns":["Well","Repair jobs","Total cost"],"rows":[["WELL-0037",4,"USD 3,238"],["WELL-0194",7,"USD 14,110"]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: costs. Only this user’s last five exchanges were supplied.","durationMs":2632},{"tool":"costs","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":5}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":40612,"requestsToday":24,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:05.155Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":40971,"requestsToday":25,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:07.826Z"}

## U24

Question: For those two wells, show repair costs from 2026-01-01 through 2026-10-16 as a table.

Oracle: Another user has no private history; no identities or costs leak.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2097ms.
Answer: I have no matching earlier conversation with Jessica Reed that identifies those wells. Conversation memory is private; I cannot use another user’s history.

Sources: none.
Wells: none.
Visualization: null
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: costs. Only this user’s last five exchanges were supplied.","durationMs":2097},{"tool":"costs","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":0}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":40971,"requestsToday":25,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:07.826Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"queued","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":0,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":42484,"requestsToday":26,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:07.826Z"}

## U25

Question: The 2026-10-15 wellhead reading for WELL-0083 is wrong. Correct it to 31.2 °C; the handheld instrument was calibrated.

Oracle: One explicit scoped in-memory correction; preserve raw 55.8.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2735ms.
Answer: Michael Turner corrected INS-0083-0201 wellhead_temp_c: original raw value 55.8; previous effective value 55.8; corrected value 31.2. Reason: The 2026-10-15 wellhead reading for WELL-0083 is wrong. Correct it to 31.2 °C; the handheld instrument was calibrated.. This correction is shared with all users and applies only to this inspection. The corrected difference is 5 °C versus the 15 °C T200 threshold, so the well is not producing oil. 

Sources: INS-0083-0201 [inspection], OM-T200 [manual], CORR-2e49c55f-2458-44b3-b7bb-c4f2c1afec1e [correction].
Wells: WELL-0083.
Visualization: {"type":"status","title":"Correction applied · WELL-0083","data":[{"assetId":"WELL-0083","inspectionId":"INS-0083-0201","field":"wellhead_temp_c","original":55.8,"previous":55.8,"corrected":31.2,"delta":5,"threshold":15,"status":"Not producing","author":"Michael Turner","reason":"The 2026-10-15 wellhead reading for WELL-0083 is wrong. Correct it to 31.2 °C; the handheld instrument was calibrated."}]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: correction. Only this user’s last five exchanges were supplied.","durationMs":2733},{"tool":"correction","detail":"Explicit user feedback applied by the scoped domain tool with provenance.","durationMs":2}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"queued","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":0,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":42484,"requestsToday":26,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:07.826Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":41471,"requestsToday":27,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:12.433Z"}

## U26

Question: Is WELL-0083 producing now? Show its status card.

Oracle: Other user sees effective delta5 C and shared provenance; raw stays unchanged.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2201ms.
Answer: No, WELL-0083 is not producing oil. Latest inspection INS-0083-0201 was Oct 15, 2026 by Ryan Brooks (manual). Wellhead 31.2 °C minus air 26.2 °C = 5 °C; the T200 manual threshold is 15 °C. Michael Turner corrected wellhead_temp_c from original raw value 55.8 to 31.2. Reason: The 2026-10-15 wellhead reading for WELL-0083 is wrong. Correct it to 31.2 °C; the handheld instrument was calibrated. No recorded reason explains the stop; a field check is warranted. The stored status “active” is out of date.

Sources: INS-0083-0201 [inspection], OM-T200 [manual], CORR-2e49c55f-2458-44b3-b7bb-c4f2c1afec1e [correction].
Wells: WELL-0083.
Visualization: {"type":"status","title":"WELL-0083 · current status","data":[{"assetId":"WELL-0083","name":"SW-24 Well 083","status":"Not producing","delta":5,"threshold":15,"ambient":26.2,"head":31.2,"date":"Oct 15, 2026","inspector":"Ryan Brooks","method":"manual","inspectionId":"INS-0083-0201","recordedStatus":"active","reason":""}]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: status. Only this user’s last five exchanges were supplied.","durationMs":2199},{"tool":"status","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":1}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":41471,"requestsToday":27,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:12.433Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":41456,"requestsToday":28,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:15.082Z"}

## U27

Question: Was the WELL-0083 temperature corrected?

Oracle: Read question must not append correction, note or claim.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2390ms.
Answer: No, WELL-0083 is not producing oil. Latest inspection INS-0083-0201 was Oct 15, 2026 by Ryan Brooks (manual). Wellhead 31.2 °C minus air 26.2 °C = 5 °C; the T200 manual threshold is 15 °C. Michael Turner corrected wellhead_temp_c from original raw value 55.8 to 31.2. Reason: The 2026-10-15 wellhead reading for WELL-0083 is wrong. Correct it to 31.2 °C; the handheld instrument was calibrated. No recorded reason explains the stop; a field check is warranted. The stored status “active” is out of date.

Sources: INS-0083-0201 [inspection], OM-T200 [manual], CORR-2e49c55f-2458-44b3-b7bb-c4f2c1afec1e [correction].
Wells: WELL-0083.
Visualization: {"type":"table","title":"Current status · WELL-0083","columns":["Well","Status","Wellhead − air","Threshold","Last inspection","Stored status"],"rows":[["WELL-0083","Not producing","5 °C","15 °C","Oct 15, 2026","active"]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: status. Only this user’s last five exchanges were supplied.","durationMs":2388},{"tool":"status","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":2}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":41456,"requestsToday":28,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:15.082Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"queued","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":0,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":43449,"requestsToday":29,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:15.082Z"}

## U28

Question: FYI for everyone: WELL-0194 will be shut in from 2026-10-17 for a 6-day planned workover.

Oracle: Append authored, scoped planned work note in memory.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2773ms.
Answer: Saved shared field knowledge from Michael Turner: FYI for everyone: WELL-0194 will be shut in from 2026-10-17 for a 6-day planned workover.. Other users can see its author and date.

Sources: FACT-b1055823-b101-4270-a8cd-a88924a4e3eb [shared knowledge].
Wells: WELL-0194.
Visualization: {"type":"status","title":"Shared well knowledge saved","data":[{"assetId":"WELL-0194","text":"FYI for everyone: WELL-0194 will be shut in from 2026-10-17 for a 6-day planned workover.","author":"Michael Turner","validFrom":"2026-10-17","days":6}]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: note. Only this user’s last five exchanges were supplied.","durationMs":2771},{"tool":"note","detail":"Explicit user feedback applied by the scoped domain tool with provenance.","durationMs":1}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"queued","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":0,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":43449,"requestsToday":29,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:15.082Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":42218,"requestsToday":30,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:19.528Z"}

## U29

Question: Is there any planned downtime for WELL-0194?

Oracle: Other user reads 17Oct/6days authored note without writing.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2117ms.
Answer: Yes. WELL-0194: FYI for everyone: WELL-0194 will be shut in from 2026-10-17 for a 6-day planned workover. According to Michael Turner. Starts Oct 17, 2026. Duration about 6 days.

Sources: FACT-b1055823-b101-4270-a8cd-a88924a4e3eb [shared knowledge].
Wells: WELL-0194.
Visualization: {"type":"table","title":"Shared field knowledge","columns":["Well","From","Days","Context","Author"],"rows":[["WELL-0194","Oct 17, 2026",6,"FYI for everyone: WELL-0194 will be shut in from 2026-10-17 for a 6-day planned workover.","Michael Turner"]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: shared_knowledge. Only this user’s last five exchanges were supplied.","durationMs":2116},{"tool":"shared_knowledge","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":1}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":42218,"requestsToday":30,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:19.528Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":42132,"requestsToday":31,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:22.123Z"}

## U30

Question: Is WELL-0037 producing oil right now? No visual please.

Oracle: Correct latest status with cited manual and no visualization.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2175ms.
Answer: Yes, WELL-0037 is producing oil. Latest inspection INS-0037-0205 was Oct 15, 2026 by Sarah Mitchell (drone). Wellhead 46.1 °C minus air 24.8 °C = 21.3 °C; the T200 manual threshold is 15 °C.

Sources: INS-0037-0205 [inspection], OM-T200 [manual].
Wells: WELL-0037.
Visualization: null
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: status. Only this user’s last five exchanges were supplied.","durationMs":2173},{"tool":"status","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":2}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":42132,"requestsToday":31,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:22.123Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":42075,"requestsToday":32,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:24.435Z"}

## U31

Question: Which spills in Southwest Block 24 during 2026 exceeded the SOP containment time limit? Show a table.

Oracle: Linked report SR-02 containment hours, never pressure-test holding hours; >4h only.

Failures: Missing supporting source SOP-SR

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 2537ms.
Answer: 18 spills exceeded the 4-hour SOP containment limit. Timing is extracted from linked repair reports. 

Sources: SPILL-RESPONSE-SOP [SOP], INS-0052-0172 [inspection], MNT-0052-028 [repair], MNT-0052-028 [repair report], INS-0053-0167 [inspection], MNT-0053-029 [repair], MNT-0053-029 [repair report], INS-0060-0169 [inspection], MNT-0060-028 [repair], MNT-0060-028 [repair report], INS-0060-0190 [inspection], MNT-0060-031 [repair], MNT-0060-031 [repair report], INS-0060-0191 [inspection], MNT-0060-033 [repair], MNT-0060-033 [repair report], INS-0064-0171 [inspection], MNT-0064-024 [repair], MNT-0064-024 [repair report], INS-0069-0171 [inspection], MNT-0069-029 [repair], MNT-0069-029 [repair report], INS-0071-0164 [inspection], MNT-0071-030 [repair], MNT-0071-030 [repair report], INS-0071-0180 [inspection], MNT-0071-034 [repair], MNT-0071-034 [repair report], INS-0071-0184 [inspection], MNT-0071-036 [repair], MNT-0071-036 [repair report], INS-0073-0180 [inspection], MNT-0073-023 [repair], MNT-0073-023 [repair report], INS-0073-0182 [inspection], MNT-0073-024 [repair], MNT-0073-024 [repair report], INS-0073-0195 [inspection], MNT-0073-028 [repair], MNT-0073-028 [repair report], INS-0074-0171 [inspection], MNT-0074-029 [repair], MNT-0074-029 [repair report], INS-0074-0176 [inspection], MNT-0074-030 [repair], MNT-0074-030 [repair report], INS-0074-0179 [inspection], MNT-0074-031 [repair], MNT-0074-031 [repair report], INS-0074-0183 [inspection], MNT-0074-033 [repair], MNT-0074-033 [repair report], INS-0075-0186 [inspection], MNT-0075-032 [repair], MNT-0075-032 [repair report], INS-0077-0201 [inspection], MNT-0077-025 [repair], MNT-0077-025 [repair report], INS-0079-0183 [inspection], MNT-0079-034 [repair], MNT-0079-034 [repair report], INS-0080-0202 [inspection], MNT-0080-027 [repair], MNT-0080-027 [repair report], INS-0080-0203 [inspection], MNT-0080-028 [repair], MNT-0080-028 [repair report], INS-0081-0179 [inspection], MNT-0081-026 [repair], MNT-0081-026 [repair report], INS-0082-0167 [inspection], MNT-0082-025 [repair], MNT-0082-025 [repair report], INS-0082-0198 [inspection], MNT-0082-028 [repair], MNT-0082-028 [repair report], INS-0084-0185 [inspection], MNT-0084-028 [repair], MNT-0084-028 [repair report], INS-0085-0162 [inspection], MNT-0085-020 [repair], MNT-0085-020 [repair report], INS-0085-0167 [inspection], MNT-0085-021 [repair], MNT-0085-021 [repair report], INS-0085-0187 [inspection], MNT-0085-028 [repair], MNT-0085-028 [repair report], INS-0085-0192 [inspection], MNT-0085-030 [repair], MNT-0085-030 [repair report], INS-0088-0178 [inspection], MNT-0088-027 [repair], MNT-0088-027 [repair report], INS-0088-0181 [inspection], MNT-0088-029 [repair], MNT-0088-029 [repair report], INS-0090-0187 [inspection], MNT-0090-033 [repair], MNT-0090-033 [repair report], INS-0091-0152 [inspection], MNT-0091-018 [repair], MNT-0091-018 [repair report], INS-0093-0189 [inspection], MNT-0093-029 [repair], MNT-0093-029 [repair report], INS-0096-0184 [inspection], MNT-0096-034 [repair], MNT-0096-034 [repair report], INS-0097-0201 [inspection], MNT-0097-034 [repair], MNT-0097-034 [repair report], INS-0098-0165 [inspection], MNT-0098-026 [repair], MNT-0098-026 [repair report], INS-0098-0173 [inspection], MNT-0098-027 [repair], MNT-0098-027 [repair report], INS-0098-0192 [inspection], MNT-0098-031 [repair], MNT-0098-031 [repair report], INS-0099-0171 [inspection], MNT-0099-026 [repair], MNT-0099-026 [repair report], INS-0099-0178 [inspection], MNT-0099-028 [repair], MNT-0099-028 [repair report], INS-0100-0196 [inspection], MNT-0100-034 [repair], MNT-0100-034 [repair report].
Wells: WELL-0052, WELL-0053, WELL-0060, WELL-0064, WELL-0069, WELL-0073, WELL-0074, WELL-0079, WELL-0081, WELL-0082, WELL-0084, WELL-0085, WELL-0090, WELL-0099, WELL-0100.
Visualization: {"type":"table","title":"Containment exceptions","columns":["Well","Discovery","Barrels","Containment time","Report","Inspection"],"rows":[["WELL-0052","Feb 12, 2026",0.8,"7.3 hours","MNT-0052-028","INS-0052-0172"],["WELL-0053","Jan 1, 2026",1.2,"8.5 hours","MNT-0053-029","INS-0053-0167"],["WELL-0060","Jun 18, 2026",0.9,"9 hours","MNT-0060-031","INS-0060-0190"],["WELL-0064","Feb 26, 2026",1.5,"8.2 hours","MNT-0064-024","INS-0064-0171"],["WELL-0069","Feb 19, 2026",2.3,"5.2 hours","MNT-0069-029","INS-0069-0171"],["WELL-0073","Apr 16, 2026",2,"5.7 hours","MNT-0073-024","INS-0073-0182"],["WELL-0074","Jan 29, 2026",1.8,"8.9 hours","MNT-0074-029","INS-0074-0171"],["WELL-0074","Mar 26, 2026",1.1,"6.1 hours","MNT-0074-031","INS-0074-0179"],["WELL-0074","Apr 23, 2026",0.2,"8 hours","MNT-0074-033","INS-0074-0183"],["WELL-0079","Jun 11, 2026",4.4,"5.3 hours","MNT-0079-034","INS-0079-0183"],["WELL-0081","Apr 30, 2026",3.6,"7.9 hours","MNT-0081-026","INS-0081-0179"],["WELL-0082","Jan 29, 2026",0.2,"8.6 hours","MNT-0082-025","INS-0082-0167"],["WELL-0082","Sep 10, 2026",0.7,"7.1 hours","MNT-0082-028","INS-0082-0198"],["WELL-0084","May 14, 2026",1,"6.2 hours","MNT-0084-028","INS-0084-0185"],["WELL-0085","Jan 1, 2026",2.9,"8.8 hours","MNT-0085-020","INS-0085-0162"],["WELL-0090","Jun 11, 2026",4.3,"4.7 hours","MNT-0090-033","INS-0090-0187"],["WELL-0099","May 7, 2026",0.4,"7.6 hours","MNT-0099-028","INS-0099-0178"],["WELL-0100","Sep 10, 2026",0.4,"8.1 hours","MNT-0100-034","INS-0100-0196"]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: containment. Only this user’s last five exchanges were supplied.","durationMs":2496},{"tool":"containment","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":41}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":42075,"requestsToday":32,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:24.435Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":42052,"requestsToday":33,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:26.886Z"}

## U32

Question: What compliance rules were broken or still open for WELL-0099 in 2026? Show a table.

Oracle: 29h SR-01 notice is late versus24h; agency verification met; report WS-03 violation; closed fine not open.

Failures: Missing supporting source SOP-SR

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 1300ms.
Answer: 3 breached or overdue rule(s), including possible breaches where required evidence is absent from the loaded data. Open regulator events carry USD 0 in recorded fines. Pending actions and met duties are listed separately.

Sources: SPILL-RESPONSE-SOP [SOP], REGULATORY-COMPLIANCE-SOP [SOP], OM-T350 [manual], INS-0099-0171 [inspection], MNT-0099-026 [repair], MNT-0099-026 [repair report], REG-0099-001 [regulator], REG-0099-002 [regulator], REG-0099-003 [regulator], REG-0099-004 [regulator], INS-0099-0178 [inspection], MNT-0099-028 [repair], MNT-0099-028 [repair report].
Wells: WELL-0099.
Visualization: {"type":"table","title":"Rules and open actions","columns":["Rule","Finding","Evidence / status","Source ID","Well"],"rows":[["SR-01","Breach","Written report after 29 hours against a 24-hour limit.","REG-0099-001","WELL-0099"],["SR-03","Met","Passing agency verification recorded May 3, 2026.","REG-0099-003","WELL-0099"],["SR-02","Breach","Contained after about 7.6 hours against a 4-hour limit.","MNT-0099-028","WELL-0099"],["WS-03","Breach","One monitor not bump-tested that day","MNT-0099-026","WELL-0099"]]}
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: compliance. Only this user’s last five exchanges were supplied.","durationMs":1293},{"tool":"compliance","detail":"Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.","durationMs":7}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":1,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":42052,"requestsToday":33,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:26.886Z"}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"queued","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":0,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":43638,"requestsToday":34,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:26.886Z"}

## Source hashes at process startup

{"server/agent.ts":"0489535191117d35a0c138591ea1eba76a6ab8511afd7b77691c411b887431c1","server/engine.ts":"143f3c99b7475d8a7c74ff16b5443d8d92c02cbbca01d63282a65546b465631c","server/gemini.ts":"b19b9fe28520d1324d2e88d772df67166b39e1e2b6a48959da2ceb2f6057ecbe","server/plan.ts":"b2ab0b7b67dc71c34ea4020989e3fe4ae3e6700572d0f002ddcf2c4a846205ef"}

## Sanitized HTTP observations

| Attempt | Model | HTTP | ms | tokens |
|---:|---|---:|---:|---:|
| 1 | gemini-3.5-flash-lite | 200 | 2659 | 1542 |
| 2 | gemini-3.5-flash-lite | 200 | 2285 | 1541 |
| 3 | gemini-3.5-flash-lite | 200 | 2311 | 1541 |
| 4 | gemini-3.5-flash-lite | 200 | 2643 | 1542 |
| 5 | gemini-3.5-flash-lite | 200 | 2409 | 1657 |
| 6 | gemini-3.5-flash-lite | 200 | 2028 | 1599 |
| 7 | gemini-3.5-flash-lite | 200 | 2583 | 1605 |
| 8 | gemini-3.5-flash-lite | 200 | 2308 | 1599 |
| 9 | gemini-3.5-flash-lite | 200 | 2441 | 1560 |
| 10 | gemini-3.5-flash-lite | 200 | 2263 | 1550 |
| 11 | gemini-3.5-flash-lite | 200 | 2599 | 1773 |
| 12 | gemini-3.5-flash-lite | 200 | 3014 | 1562 |
| 13 | gemini-3.5-flash-lite | 200 | 2540 | 1509 |
| 14 | gemini-3.5-flash-lite | 200 | 1904 | 1598 |
| 15 | gemini-3.5-flash-lite | 200 | 2657 | 1571 |
| 16 | gemini-3.5-flash-lite | 200 | 2311 | 1497 |
| 17 | gemini-3.5-flash-lite | 200 | 2530 | 1540 |
| 18 | gemini-3.5-flash-lite | 200 | 1552 | 2799 |
| 19 | gemini-3.5-flash-lite | 200 | 2451 | 1504 |
| 20 | gemini-3.5-flash-lite | 200 | 2556 | 1505 |
| 21 | gemini-3.5-flash-lite | 200 | 2457 | 1492 |
| 22 | gemini-3.5-flash-lite | 200 | 1465 | 3391 |
| 23 | gemini-3.5-flash-lite | 200 | 2393 | 1560 |
| 24 | gemini-3.5-flash-lite | 200 | 1780 | 1575 |
| 25 | gemini-3.5-flash-lite | 200 | 2630 | 1901 |
| 26 | gemini-3.5-flash-lite | 200 | 2096 | 1513 |
| 27 | gemini-3.5-flash-lite | 200 | 2614 | 2069 |
| 28 | gemini-3.5-flash-lite | 200 | 2199 | 1527 |
| 29 | gemini-3.5-flash-lite | 200 | 2387 | 1993 |
| 30 | gemini-3.5-flash-lite | 200 | 2739 | 2025 |
| 31 | gemini-3.5-flash-lite | 200 | 2116 | 1519 |
| 32 | gemini-3.5-flash-lite | 200 | 2172 | 1542 |
| 33 | gemini-3.5-flash-lite | 200 | 2495 | 1537 |
| 34 | gemini-3.5-flash-lite | 200 | 1291 | 1586 |

Initial provider: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":0,"requestsToday":0,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Final provider: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"queued","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":0,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":43638,"requestsToday":34,"dailyResetAt":"2026-10-18T07:00:01.402Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":"2026-10-17T08:39:26.886Z"}


---

# Unseen hosted copilot checks

Started: 2026-10-17T08:43:02.356Z; updated: 2026-10-17T08:43:15.655Z; run complete.
Reference date 2026-10-16; 200 wells; 47177 evidence documents.
Hosted and semantic pass: **3/3 executed**; selected 3; HTTP requests 5 this process, 39/60 cumulative.

Independent expected arithmetic reads raw inspection/maintenance/context records and well-type manuals directly. No domain answer or planning function produces the expected values. Citation checks resolve each ID, type and path against dataset documents or exact in-memory feedback, enforce asset scope, and require metric inputs. Procedural cases also require accepted hosted synthesis. This sample-data run is not proof on the final hidden dataset.

One process, sequential runAgent calls, configured project pool and caps. .env.local is loaded through process.loadEnvFile; credentials, headers and upstream bodies are never recorded. All state is in memory; .local production state and dataset files are untouched. Actual totalTokenCount is observed when supplied. Broad retries stop when provider has no available project during cooldown, or at 60 attempts. A fallback with correct facts is recorded as a hosted failure.

| Case | Semantic | Hosted | ms | tools |
|---|---|---|---:|---|
| U17 | PASS | PASS | 1843 | gemini_planner, capability_guard |
| U18 | PASS | PASS | 5372 | gemini_planner, document_retrieval, synthesis_routing, gemini_synthesis |
| U19 | PASS | PASS | 6066 | gemini_planner, document_retrieval, synthesis_routing, gemini_synthesis |

## U17

Question: What will the exact oil production of WELL-0037 be next month, in barrels per day?

Oracle: Temperature/inspection records cannot prove an exact future production forecast.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 1843ms.
Answer: Production forecasts are not supported. The loaded evidence is referenced to 2026-10-16; future production cannot be established from the recorded inspections. Ask for current or historical inspection status, or separately ask about recorded planned work.

Sources: none.
Wells: WELL-0037.
Visualization: null
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: search. Only this user’s last five exchanges were supplied.","durationMs":1842},{"tool":"capability_guard","detail":"Unsupported filter or multiple time windows acknowledged without partial aggregation.","durationMs":0}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":0,"requestsToday":0,"dailyResetAt":"2026-10-18T07:00:01.239Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":1580,"requestsToday":1,"dailyResetAt":"2026-10-18T07:00:01.239Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U18

Question: What is the maximum permitted wellhead temperature for T350, and what must happen if it is exceeded?

Oracle: T350 only: <=95 C; shut in and inspect within 24 hours.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 5372ms.
Answer: The wellhead must stay at or below 95 °C. [OM-T350]  Above 95 °C, shut in and inspect within 24 hours. [OM-T350]

Sources: OM-T350 [manual].
Wells: none.
Visualization: null
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: search. Only this user’s last five exchanges were supplied.","durationMs":2524},{"tool":"document_retrieval","detail":"Lexical index reused per dataset; 6 bounded evidence passages selected from 47177 records.","durationMs":1500},{"tool":"synthesis_routing","detail":"Ordinary evidence lookup uses the primary fast model. Requested model: gemini-3.5-flash-lite.","durationMs":0},{"tool":"gemini_synthesis","detail":"Actual model: gemini-3.5-flash-lite. Grounded prose accepted after source-ID and numerical-token validation.","durationMs":1346}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":1580,"requestsToday":1,"dailyResetAt":"2026-10-18T07:00:01.239Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":6349,"requestsToday":3,"dailyResetAt":"2026-10-18T07:00:01.239Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## U19

Question: For T200, what is the planned shut-in procedure before work starts?

Oracle: Stop prime mover at bottom of stroke; brake; wing valve; maintenance record before work.

Failures: none

Model: {"name":"gemini-3.5-flash-lite","status":"hosted"}; duration 6066ms.
Answer: For a planned shut-in, stop the prime mover at the bottom of the stroke, set the brake, close the wing valve and record the shut-in in the maintenance system before work starts. [OM-T200]

Sources: OM-T200 [manual].
Wells: none.
Visualization: null
Conflicts: []
Trace: [{"tool":"gemini_planner","detail":"Structured plan validated: search. Only this user’s last five exchanges were supplied.","durationMs":4425},{"tool":"document_retrieval","detail":"Lexical index reused per dataset; 6 bounded evidence passages selected from 47177 records.","durationMs":3},{"tool":"synthesis_routing","detail":"Ordinary evidence lookup uses the primary fast model. Requested model: gemini-3.5-flash-lite.","durationMs":0},{"tool":"gemini_synthesis","detail":"Actual model: gemini-3.5-flash-lite. Grounded prose accepted after source-ID and numerical-token validation.","durationMs":1638}]

Provider before: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":6349,"requestsToday":3,"dailyResetAt":"2026-10-18T07:00:01.239Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Provider after: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":11846,"requestsToday":5,"dailyResetAt":"2026-10-18T07:00:01.239Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}

## Source hashes at process startup

{"server/agent.ts":"904031ebb88ffc78a30ffb0eca4783c3691fe33b836ca6de14e0fe39572f197a","server/engine.ts":"12f25f73e91f38a106ca055a096556cfdeabe6750634959169f16bac3dd3fe34","server/gemini.ts":"b19b9fe28520d1324d2e88d772df67166b39e1e2b6a48959da2ceb2f6057ecbe","server/plan.ts":"b2ab0b7b67dc71c34ea4020989e3fe4ae3e6700572d0f002ddcf2c4a846205ef"}

## Sanitized HTTP observations

| Attempt | Model | HTTP | ms | tokens |
|---:|---|---:|---:|---:|
| 1 | gemini-3.5-flash-lite | 200 | 1838 | 1580 |
| 2 | gemini-3.5-flash-lite | 200 | 2520 | 1530 |
| 3 | gemini-3.5-flash-lite | 200 | 1342 | 3239 |
| 4 | gemini-3.5-flash-lite | 200 | 4424 | 2535 |
| 5 | gemini-3.5-flash-lite | 200 | 1637 | 2962 |

Initial provider: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":0,"requestsToday":0,"dailyResetAt":"2026-10-18T07:00:01.239Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
Final provider: {"provider":"gemini","configured":true,"model":"gemini-3.5-flash-lite","reasoningModel":"gemini-3.8-flash","status":"ready","keyCount":5,"projectCount":5,"healthyKeys":5,"availableKeys":5,"cooldownKeys":0,"disabledKeys":0,"busyProjects":0,"rpmPerProject":5,"tpmPerProject":20000,"rpdPerProject":100,"limitSource":"Application caps; actual Google project quotas may differ.","estimatedTokensLastMinute":11846,"requestsToday":5,"dailyResetAt":"2026-10-18T07:00:01.239Z","timeoutMs":25000,"maxAttempts":2,"nextRetryAt":null}
