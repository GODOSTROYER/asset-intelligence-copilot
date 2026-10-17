# Asset Intelligence Copilot acceptance checks

Run the local, deterministic acceptance suite from this app directory:

```powershell
npx tsx scripts/acceptance.ts
```

The script loads the repository's original `sample-data/` with the challenge reference
date fixed to **16 Oct 2026**, then calls `executePlan` directly. It does not start the
web server, call a model/provider, access a cloud service, read credentials, or write
`.local/state.json`. Each independent scenario receives a fresh `emptyState()`; only
the explicitly sequential memory/correction scenarios share an in-memory state object.
The Q6-to-Q11 case appends the same private-history entry that the API layer owns in
production.

The checks use the expected facts and evidence IDs in `../../03-evaluation-queries.md`
and the source files under `../../sample-data/`. They assert answer values, affected
well IDs, visual types or rows, citation IDs, and state mutations where those are part
of the contract. They are acceptance evidence for the deterministic engine and local
sample data, not proof of UI rendering, provider behavior, the later test dataset, or a
live deployment. A failing check is reported as a failure; do not describe the whole
challenge as passed based on a selected subset.

## Coverage

| Scenario | Acceptance evidence |
|---|---|
| Q1 | WELL-0001 status is derived from the T200 temperature rule, with latest inspection, inspector, planned-shut-in context, source citations, and status visual. |
| Q2 | Northeast Block 8 has exactly WELL-0164, WELL-0170, WELL-0172 and WELL-0175 as non-producing; rows cite their latest inspections and do not invent missing causes. |
| Q3 | The requested 13-week temperature series has 13 points and marks the two non-producing dates, with inspection and manual sources. |
| Q4 | WELL-0001 has six real spills totaling 15.1 bbl; the rainwater correction excludes INS-0001-0070 from spill rows. |
| Q5 | 2025 downtime is 21 days from three non-producing weekly inspections, with inspection, repair and manual evidence. |
| Q6 | The four-month Northeast Block 7 ranking is WELL-0121 (49), WELL-0138 (42), WELL-0107 (42), shown as a bar visual; WELL-0119 is excluded from top three. |
| Q7 | The 90-day Northeast Block 8 spill map has the four expected wells, coordinates, inspection sources, and no corrected false positives. |
| Q8 | The complete 2026 area-by-month spill matrix matches the expected counts, including area totals. |
| Q9 | The WELL-0001 compliance result identifies SR-01, SR-02, SR-03 and RC-04 evidence, the open USD 5,000 notice, pending RCA repairs and the planned shut-in note. |
| Q10 | The two Southwest Block 24 containment exceptions use linked report evidence and expected repair IDs/times. |
| Q11 | A Q6 result saved to Michael Turner's private history resolves the next-chat repair-cost question to the expected three wells and totals. |
| Q12 | A 41.0 °C correction is attributed to Michael, retains 24.0 °C as the original, targets INS-0164-0205 only, preserves the input record, surfaces the inspector conflict and removes WELL-0164 from the follow-up area list. |
| Q13 | The 4.5-to-5.4 bbl correction targets INS-0151-0201 and flags the 24-hour report issue, SR-01, the linked repair and the 23 Nov 2026 verification date. |
| Q14 | A T350 pump-jack RCA threshold of two adds WELL-0120 while retaining the default T200 threshold, which keeps WELL-0102 out. |
| Q15 | Jessica sees Michael's shared correction and inspector conflict; Laura sees only WELL-0151 as reportable after the correction. |
| Q16 | Jake's 10-day WELL-0007 workover note is visible to Michael; reading planned downtime is read-only; Jessica cannot use Michael's private Q6 history. |
| Q17 | Tyler's WELL-0175 claim remains unconfirmed beside the 0.4 °C inspection evidence and Michael's planned-work note; Jake's WELL-0001 claim is checked against the latest inspection and context. |
| Q18 | The WELL-0101 spill remains a real 1.0 bbl finding while both conflicting human notes, the inspection, and repair are cited; the disagreement is not converted into a correction. |
| Unseen variations | WELL-0151 checks the T350 threshold; an explicit 8–15 Oct window checks date-range handling; WELL-9999 checks graceful unknown-asset handling without substituting a different well. |

## Interpretation

The checks exercise the local `executePlan` boundary with explicit plans, so they
isolate calculation, evidence selection, and state scope from query classification and
browser rendering. They do not establish that natural-language planning always emits
the tested plan. Before sharing a pass result, record the command output and the exact
revision tested. The input dataset is synthetic and its manuals/SOPs are challenge
documents, not real operational or legal guidance.
