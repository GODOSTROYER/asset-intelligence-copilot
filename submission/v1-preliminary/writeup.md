# Asset Intelligence Copilot

**Page 1 · System design**  
Local submission draft, 17 October 2026. Final event evaluation is pending.

**An answer an operator can inspect.** Its central decision is to let the model interpret language while local tools calculate quantities and apply domain rules.

**Architecture and retrieval.** React/Vite → loopback Express API → Gemini JSON planner → validated typed operation → local domain engine → answer, visual, citations and conflicts. JSON/JSONL records are loaded into memory; Markdown manuals, SOPs and linked repair reports become evidence documents with source type, record ID and path. Domain tools cover status, trends, spills, downtime, costs, compliance, containment and RCA. General document questions use scoped lexical retrieval and at most six bounded passages for synthesis. Citations come from selected records; model prose must declare source IDs per segment. Numeric and identifier checks reject unsupported tokens, but do not prove every sentence's meaning.

**Numbers plus context.** Production uses wellhead minus ambient temperature against the well-type manual, rather than stale metadata. Downtime counts seven days per non-producing weekly inspection; missing inspections add zero. Maintenance reports explain causes and containment; regulator records and SOPs establish reporting and verification obligations. Six visual types support status, tables, lines, bars, heatmaps and a coordinate plot. Explicit visual requests take precedence. Unsupported aggregates return retrieved evidence and a limitation.

**Memory and conflicts.** Private conversation history is keyed by selected dataset user. Shared corrections, notes, unconfirmed claims and type rules are stored separately. An explicit correction keeps the original, new value, author, reason and scope; later answers across users use it. A type rule affects that type only. A claim that disagrees with an inspection remains visible and unconfirmed. Chat/import transactions are serialized; candidate state is saved atomically before becoming current. The user picker demonstrates memory scope; production authentication is future work.

**Models, cost and tradeoffs.** The configured default is hosted `gemini-3.5-flash-lite` for planning and ordinary synthesis; optional `gemini-3.8-flash` handles eligible deep or conflicting document analysis. No training or local model is used. Bounded context, cached plans with recomputed answers, request/token/day caps and limited retries control use. Exact billed spend is unmeasured. Application caps are process-local and do not establish provider quota or free-tier eligibility. Lexical retrieval and inspectable tools simplify this small fleet; they limit semantic recall and arbitrary analysis. The map has no geographic basemap.

**New data and next steps.** Dataset paths are configurable. Same-format imports merge records by ID, with later roots winning, while preserving source files and evidence provenance. The evaluation date is explicit. Final evaluation must use the organizer's release and preserve its answers and citations. Next: validate the release, then strengthen semantic evidence checks and authenticated identity.

<div style="break-before: page; page-break-before: always;"></div>

**Page 2 · Results**  
**PRELIMINARY SAMPLE EVIDENCE ONLY. No final dataset score or leaderboard claim.**

Sample reference date: **16 October 2026**. Evidence reports include the **17 October 2026, 14:23 IST** browser follow-up; these are recorded outcomes, not a fresh run by this document's author.

| Sample use case | Recorded answer / behavior | Evidence |
|---|---|---|
| Is WELL-0001 producing now? | No: latest temperature delta +3.2 °C is below T200's +15 °C rule. Planned rod-string replacement supplies context; stored `active` status is stale. | INS-0001-0203, OM-T200, CTX-0001-003 |
| Most downtime, Northeast Block 7, last four months | WELL-0121: 49 days; WELL-0138: 42; WELL-0107: 42. Inspection-derived bar result. | Recorded Q6 answer and cited inspections in `docs/LIVE_CHECKS.md` |
| Michael's next-chat repair costs for those three wells | WELL-0107: USD 5,176; WELL-0121: USD 25,794; WELL-0138: USD 46,942. Another user does not inherit Michael's private reference. | Recorded Q11/private-isolation answers in `docs/LIVE_CHECKS.md` |
| Correct WELL-0151 spill from 4.5 to 5.4 bbl | Shared correction changes reportability and exposes the stale exemption in the repair report; missing notice is surfaced. | INS-0151-0201, linked report, SOP and correction provenance |

**What worked, and what the evidence covers.** Sample acceptance records 25/25 checks. Independent stress suites record 109 domain, 27 provider and 22 ingestion passes. The 32 unseen hosted questions initially gave 29/32 semantic passes. After three fixes, the targeted retest passed 3/3; across both runs, semantic evidence passes 32/32 and hosted-plus-semantic evidence passes 30/32. Two invalid inputs safely used deterministic fallback. All 39 HTTP requests returned 200; transport success alone does not establish answer correctness. This is **not a complete post-fix rerun or final-dataset evaluation**.

**What failed, and why.** The unseen run found three real defects: an unsupported forecast lacked a clear limitation, and two manual questions routed to shared knowledge. Their fixes passed targeted retests. A separate fleet-list routing defect was fixed; hosted UI retesting returned all 15 current wells and correct pagination. Five harness assertion mistakes were audited from captured evidence, with original failures retained. Earlier synthesis citation failures also remain documented. Source and numeric membership guards do not establish semantic entailment; final-dataset generalization remains unproven.

**Final event answers: reserved, not yet available.** Replace this block after loading the actual release and running the final questions. Record the dataset/release identifier, evaluation date and run time, then one row per question: exact question → actual answer → key source IDs → worked/failed and reason. Retain exported full answers separately if needed to keep this writeup to two pages. Do not relabel the sample table as final results.

Source evidence: `docs/ACCEPTANCE.md`, `docs/DOMAIN_STRESS.md`, `docs/PROVIDER_STRESS.md`, `docs/FINAL_DATA_READINESS.md`, `docs/UNSEEN_LIVE_CHECKS.md`. An [AI-voiced review video](https://drive.google.com/file/d/1W1Xnr73D0060BiEyy8eWXbGkTGGBHCz6/view) is available as a draft; it is not the required own-voice recording. Final questions/answers, that own-voice replacement, a public authored repository and a submission receipt remain outstanding at this snapshot.
