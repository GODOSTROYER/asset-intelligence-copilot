# Independent engineering review

Reviewed at 2026-10-17 08:06 UTC (13:36 IST). Implementation was still in progress.

Follow-up review at 2026-10-17 08:12 UTC (13:42 IST).

API follow-up at 2026-10-17 08:14 UTC (13:44 IST).

Focused synthesis/visual follow-up at 2026-10-17 08:24 UTC (13:54 IST).

## Verified checks

Command: `./node_modules/.bin/tsx.cmd scripts/data-check.ts`

Result: 10 checks passed against isolated temporary fixtures and the full sample dataset.

- Overlapping well, inspection and maintenance IDs merge once, with imported records taking precedence.
- A structured repair and its narrative report retain their distinct source types despite sharing an ID.
- Updated reports follow `report_file` and retain their imported root and path provenance.
- An explicit evaluation reference date overrides the inferred date; inference otherwise follows the merged latest inspection.
- Parent folders normalize to their sample-data child.
- Invalid calendar dates and malformed imported JSONL reject.
- A failed import does not mutate an already loaded dataset object.
- The full 200-well sample loads and retains both repair source types.

Temporary fixture folders were removed after the checks. No production data, credentials or cloud calls were used.

Command: `./node_modules/.bin/tsx.cmd scripts/review-check.ts`

Result: 13 independent engine checks passed without provider calls or persisted-state writes. They cover natural-language 2025 downtime, two-week temperature history, three ordinary questions that must not write memory, an explicit 2025 correction date, unknown manual exclusion from downtime, moderate-spill containment, major-spill reporting within two hours, unknown asset handling, inclusive date windows, stated-year repair costs and future/expired planned work.

Command: `./node_modules/.bin/tsx.cmd scripts/api-check.ts`

Result: seven grouped HTTP checks passed on an isolated child server at port 4180. Its state lived in a new temporary folder, both provider-key environment variables were empty, and readiness asserted `provider.configured === false` before sending any question. The server was stopped and its temporary folder removed after the checks.

- Invalid users and foreign browser origins reject before writing history.
- Concurrent questions persist complete, separate Michael/Jessica histories with full answer objects.
- A shared temperature correction retains author and original value; the original inspection source and its file hash remain unchanged.
- Exact source types distinguish a repair record from its narrative report with the same ID.
- An omitted import date preserves the explicit evaluation date.
- A malformed import leaves dataset statistics, roots, revision and saved-state bytes unchanged.
- Restart restores the evaluation date, rich private answers and shared correction; another user sees the correction and its conflict while retaining their own private history.

No new API defect was found by these checks. The primary development server and its state were not used.

Command: `./node_modules/.bin/tsx.cmd scripts/synthesis-review-check.ts`

Result: nine focused checks passed through the actual agent path with 16 mocked requests and zero cloud calls. Valid per-segment prose renders its associated source. A number found only in another segment's uncited source rejects with `numeric_tokens`; unknown source IDs reject; both legacy answer shapes reject; fabricated lowercase well/protocol IDs and full inspection IDs reject for the intended identifier diagnostic. The cost-bar check retains the exact decimal amount and its `USD` currency metadata.

The corresponding renderer was inspected: cost bars use currency formatting for axes, full amounts in tooltips and their accessible table, and the `Repair cost` label. Downtime, temperature, spill and repair-count bars carry distinct labels and units.

The rewritten API was inspected: chat and import changes run through one transaction queue, persist a candidate state before assigning it, and retain full answer responses in private history. Source and memory endpoints select original records and current-user history respectively.

## Confirmed issues and follow-up

The initial API rewrite passed `undefined` to the loader when an import omitted its optional reference date, replacing a prior explicit evaluation date with the latest inspection plus one day. The API owner corrected it to preserve the saved/environment reference date. The corrected expression was confirmed by source inspection at 2026-10-17 08:08 UTC and then by the isolated HTTP checks above.

The frontend's production-status comparison now matches `Producing` exactly, and request epochs guard history and answer completions after user switches or a new chat. Imported users refresh through bootstrap. These corrections were confirmed by source inspection; browser acceptance remains separate.

The follow-up identified two further confirmed source issues and notified their owners: hosted search retrieval accepted area/type scope but did not apply it when selecting passages, and the status renderer displayed only the first item of a multiple-well status result. Both repairs were subsequently confirmed by source inspection: retrieval filters scoped asset records, while the status renderer iterates all rows and the line renderer separates wells into series. A remaining type-rule memory filter gap was reported at 2026-10-17 08:15 UTC and its fix was confirmed by inspection at 08:16 UTC: shared type rules and type-level facts are now restricted to the types of the scoped wells.

No confirmed blocking defect remains from this targeted review. This conclusion covers the inspected local flow and the checks recorded here, subject to the limits below.

The final synthesis follow-up found and helped resolve two validation gaps before acceptance: legacy whole-answer output could bypass the intended per-segment contract, and identifier checks omitted lowercase/full record IDs. The final validator requires segments at its public boundary, validates each segment through a private helper, and checks case-insensitive exact identifier membership against only that segment's declared sources. This validates source association and token membership; it does not establish semantic truth for every sentence.

## Earlier findings under active repair

The engine and frontend owners received concrete findings concerning read questions being parsed as writes, production status styling, user-switch request races, fixed history windows, unknown thresholds counted as downtime, correction date years, containment scope, major-spill deadlines and citation truncation. These are historical findings from the initial implementation and require a final check after the owners finish; this document does not claim that they remain present.

## Limits and speculative concerns

No live hosted-model acceptance was performed in this review. The provider code was inspected for bounded retries, server-only credentials, sanitized errors, per-user planner context and dataset-scoped plan caches. No concrete credential exposure or cross-user planner-cache leak was found by inspection. General semantic accuracy of model-written search prose still requires representative acceptance questions; numeric/source-ID guards alone cannot establish every sentence's meaning.
