# Asset Intelligence Copilot: Final Report

**Arnav Bule · FlytBase AHC SWE Hackathon · 17 Oct 2026** · Code: github.com/GODOSTROYER/flytbase-asset-intelligence-copilot (MIT) · Full verbatim answers for all 21 turns: `submission/final-run/FINAL_ANSWERS.md`

## Page 1 · System design

**Core idea: the model plans, code calculates.** An LLM turns a plain-English question into **one typed, validated operation**. Deterministic tools then compute every number, table, citation and conflict from the loaded records and documents. The model never does arithmetic on domain data, and every answer can be traced to source record IDs.

**Request flow.** React chat UI (user picker, inline visuals, source drawer, memory drawer) → local Express API (requests handled one at a time) → **planner** (Gemini 3.5 Flash-Lite, JSON schema) → **validator** → **router** → tools over the **evidence index** and **memory** → answer (text + visual + citations + conflicts).

| Layer | How it works |
|---|---|
| **Storage & index** | At startup every JSON/JSONL record and Markdown document (manuals, SOPs, MOC memos, recall notice, regulator letter, repair reports) is loaded and indexed as typed evidence with record ID, well, type and path. The test set loads in about 4 s: 600 wells, 7 areas, 149,877 evidence documents. Optional fields (type and team history, late-entered records, data corrections, plugged wells) are respected. |
| **Planner** | Picks 1 of 29 operations: 17 core (status, trends, spills, downtime, heatmap, compliance, containment, RCA, costs, shared knowledge, document Q&A, and 4 writes) plus 12 document-driven tools added for new data. It sees only areas, users, well-ID ranges and the asking user's last 5 exchanges. |
| **Validator** | Rejects unknown wells, areas, dates and fields. Explicit values in the question override the model's. Fleet tools take well and area scope only from the question, not from earlier answers. Year-less past dates never resolve into the future. **Writes need explicit declarative feedback** detected by rules; questions, quotations, hypotheticals and "don't save" never write. |
| **Rules from documents** | Deadlines, thresholds and approvals are parsed from the documents, never hard-coded: OPS-1 gas response (24 h, then 12 h from 1 Jan 2027), OPS-3 status precedence, OPS-5 cold weather, MOC validity and extensions, recall model and lots, the regulator letter's scope, and per-type production thresholds (T200/T350/T500). Each rule is cited. |
| **Memory** | **Shared:** corrections (original value, author, reason, scope), notes, **unconfirmed claims** (e.g. "pump was swapped": kept attributed, never overwrites records, flagged when second-hand), and well-type rules. **Private:** per-user history and **display preferences** (sort order, $k). Stored in `state.json` with atomic saves. |
| **Conflicts & honesty** | Shows disagreements instead of picking a side: claim vs record, note vs inspection, and second-hand reports. When the data can't answer, it says so: no pressure data, no production volumes. It offers labelled proxies instead. |
| **Resilience** | A deterministic planner takes over if the model fails, and answers are flagged `fallback`. |

**Models and cost.** Gemini 3.5 Flash-Lite (planner and synthesis), about 2–5 s per hosted answer, on free-tier keys with app-side rate caps and a 10-minute plan cache. Gemma 4 was tested as a drop-in planner with the same prompt and validator: every plan that returned was correct, but free-tier capacity (429/500/503) and 40–60 s latency ruled it out for the live run.

**Verification.** Sample: 25/25 acceptance checks over the 18 scenarios, 109/109 independent domain checks, 27 provider checks, and adversarial write-routing probes. Test set: every final answer was checked against an **independent oracle** computed straight from the raw files.

**Next steps.** Multi-step plans (a conversation-wide triage across tools); entity state over time as a first-class store (installed parts, approvals); a semantic document-rule extractor so new SOP clauses become checkable rules without code; and a UI for confirming or rejecting claims.

<div style="break-before: page; page-break-before: always;"></div>

## Pages 2–3 · Results on the 11 final questions

Test dataset (600 wells, today = 15 Jan 2027), questions run in order exactly as written. **20 of 21 turns ran on the hosted planner and 1 on the deterministic fallback.** "Oracle" means the expected answer, computed independently from raw files.

| Q | Copilot answer (key facts) | vs oracle |
|---|---|---|
| **1** Reservoir pressure | **Declines to map it:** no reservoir, tubing, casing or wellhead pressure exists. Lists what does exist: flowline test pressures 188–400 psi in 2,432 repair reports, separator alarms with no values (CTX-0422-003, CTX-0481-006), and equipment ratings. Says what data is needed. | ✅ |
| **2** Best producer 2026 | **No production volumes exist**, so it won't name a winner. Labelled proxy: producing weeks by the type rule. 52 wells tie at 53/53; downtime tie-break gives WELL-0147 and WELL-0315. | ✅ |
| **3** Gas reports since 1 Nov | 26 reports: **17 Met, 9 Missed** (0163, 0341, 0332, 0401, 0052, 0362, 0161, 0599, 0516). OPS-1: 24 h, 12 h from 1 Jan 2027; drone flights don't count as a response. Full table. | ✅ exact |
| **4** Flowline bypasses | In place: **WELL-0248 Allowed** (MOC-2026-031 extended by 044 to 28 Feb), **WELL-0249 Expired** (MOC-036 ended 15 Dec), **WELL-0405 Not approved**. Past violations: WELL-0087, 0158 (expired), 0561 (never approved). | ✅ exact |
| **5** Regulator letter | Covers NE Blocks 7–8, ≥ 5 bbl, since 1 Jun 2026: 6 spills. **Compliant:** 0119, 0168, 0277. **Not compliant:** 0123, 0182, 0262 (no "soil samples sent to the lab"). Also flags SR-01/02/03 timing breaches. | ✅ exact |
| **6** Which status is right | 17 wells. Ten where a newer note wins: 6 shut in on 14 Jan (0044, 0323, 0355, 0422, 0479, 0481), and 4 restarted as **"Producing (unconfirmed)"** with an in-progress job. Seven where a newer inspection wins. Type history (WELL-0010 now T350) and data corrections handled. | ✅ |
| **7** Operator noises (2 turns) | 175 wells noted → filtered by "no repair since" → ranked by a transparent score (recalled pump, overdue follow-up, ESP trend, repeat failures). **8/10 overlap** with the oracle top 10. Crew picks: 0263, 0219, 0401 (oracle: 0219, 0263, 0202). | 🟡 judgement, 2/3 top picks |
| **8** Who told you that (5 turns) | t1: Nathan's swap recorded as an **unconfirmed claim**; WELL-0333 stays listed. t2: **private** preference saved. t3 (Robert): **9 wells**, 0333 flagged "reported replaced by Nathan, no work order"; Nathan's preference not applied. t4: Olivia's **second-hand** claim recorded but 0577 **not removed**. t5: Nathan's 4 NW wells **sorted, in $k** ($24.5k / $15.4k / $24.0k / $27.1k). Sources stated each turn. | ✅ |
| **9** Six topics (6 turns) | t1: 9 recalled pumps in 4 areas. t2: **Nathan Pierce, 150 wells**. t3: OPS-5 quoted; December misses 0310, 0354, 0486, 0531. t4: **no H2S reading recorded** on 3 Dec, and the response deadline was missed. t5: **WELL-0160, 0263** not producing, with last repairs. t6: gives a fleet-wide risk ranking rather than triage of *the wells discussed* (oracle: WELL-0332 first). | ✅ ×5, 🟡 t6 |
| **10** What are we waiting on | 634 jobs (2026): **Contractors 33%, Crews 27%, Weather 22%, Parts 18%**, median about 9 extra days. **No area stands out** (χ² p ≈ 0.92). Share and median by area, plus a stacked bar by area. Classification map and sensitivity stated. | ✅ |
| **11** Hotter wells | **No region genuinely runs hotter.** SE-31 looks hottest on raw temperature only because 58% of its wells are T500. Ambient is flat (21.5 °C) and the type-adjusted delta is within ±0.05 °C. | ✅ |

**What worked.**
- **Document-driven rules** carried most of the score. Deadlines, approvals, lots and letter scope were read from the new documents at run time, so the T500 type, MOC extensions and the mid-period SOP revision were handled without special cases.
- **The two-level memory design held up under adversarial multi-user turns.** It kept claims unconfirmed and attributed, separated first- from second-hand reports, and kept one user's preferences private.
- **Honest refusals:** Q1 and Q2 refuse to invent data the dataset doesn't hold.

**What didn't, and why.**
1. **Our first live run scored 0/11.** Two causes:
   - The planner schema's well bound grew with the fleet (600), and Gemini rejected it, so every turn silently fell back to the rule-based planner.
   - The original 17-operation menu had no way to express MOC approvals, recall lots, note-to-response joins or letter scope.

   Fix: a fixed schema bound, plus the 12 general document-driven tools.
2. **Topic references across turns** first narrowed fleet questions to wells from earlier answers. Fixed: scope now comes only from the question.
3. **Remaining gaps:**
   - **Q7** is a ranking judgement; the transparent score differs from the oracle on 2 of the top 10.
   - **Q9 t6** needs a multi-step plan: gather every well from the conversation, then triage across gas, recall and status. A single operation can't express that. This is the clearest next step.

*All runs are preserved for audit:* `FINAL_ANSWERS.fallback-run.md` (schema bug), `raw/` (hosted, before the new tools) and `raw-v2/` (final).
