# Independent domain stress checks

Run on 17 October 2026. Dataset reference date: **16 October 2026**.

The initial run contained **86 cases: 75 passed and 11 failed**. Every failing assertion was retained. After fixes and additional regressions, the final run contains **109 cases, all passing**. The final measured execution phase took **1.651 seconds**, excluding dataset and raw-file loading. This is local evidence, not a claim about the unreleased final dataset or hosted latency.

Run from the app directory:

~~~sh
npx tsx scripts/domain-stress.ts
npx tsc --noEmit
~~~

## Independent oracle

The harness reads metadata, inspections, maintenance, regulatory events, context, manuals, and linked narrative reports directly from sample-data using filesystem calls. It follows report_file rather than assuming a report filename. It does not import or call any engine calculation, threshold, correction, containment, or date helper to construct expected values.

The raw oracle covers 12 wells selected by a regular stride across the fleet, including both well types; 25 well/window downtime combinations; six cost aggregations; eight area/window spill queries; four top-five rankings; three full historical heatmaps; and four area containment queries. Windows include leap day, historical periods, partial months, and empty future periods.

Additional cases use controlled in-memory fixtures to exercise incomplete data and boundary conditions without changing source files. Decimal threshold expectations use integer tenths to avoid reproducing the engine's original floating-point error.

## Confirmed defects and fixes

| Case | Before | After |
| --- | --- | --- |
| Exact production threshold with decimal readings | Binary subtraction could classify equality as not producing. | A precision-scaled floating-point tolerance preserves the inclusive manual threshold. |
| Old spill selected by inspection ID | Default one-year range discarded the selected record. | An inspection ID without a requested period selects that inspection regardless of age. |
| Temperature history with explicit year | Returned the latest 13-week slice: 12 readings instead of the fixture's 51 readings in 2024. | Applies the requested year and labels the actual observation period. |
| Historical status date | Selected INS-0009-0204 instead of INS-0009-0063. | Selects the requested observation, with historical context and no comparison to today's stored status. |
| Contradictory well and area filters | Returned blank text. | Explicitly reports that no wells match the combined scope. |
| Missing reportable-spill volume | An undefined volume passed the reportability filter. | Excludes unclassified detections and discloses unknown volume/reportability. |
| Missing volume in a real spill | Asserted an exact zero-barrel total. | Displays unavailable volume and a known subtotal with incomplete-total disclosure. |
| Missing maintenance cost | Asserted USD 0 as an exact total. | Labels the known subtotal and flags bar data partial:true. |
| Missing SOP | Applied a default four-hour rule as if verified. | Declines rule assessment when the applicable SOP is unavailable. |
| Missing map coordinates | Emitted an invalid NaN pin. | Omits the pin and explains missing location data. |
| Unsupported correction field at runtime | Accepted and stored a pressure correction outside the supported schema. | Rejects unsupported fields without mutation. |

Additional fixes and retained regressions:

- Invalid literal ISO dates survive fallback planning long enough for execution to reject them; historical dates are also preserved by fallback planning.
- Corrections remain effective across users and after imports. When an imported raw value differs from the original captured by feedback, the answer explicitly reports that source revision and retains the correction author and original value.
- Repeated differing corrections retain all original values, authors, reasons, and correction sources; the latest recorded value is effective and disagreement is visible.
- Analysis requests such as Explain, Summarize, Review, and Please analyze cannot save claims or corrections. Negated-save and hypothetical statements cannot mutate shared records.
- Future regulator filings cannot satisfy duties before the dataset as-of date. Feedback recorded on 17 October can still correct observations evaluated at the 16 October snapshot.

## Compliance and evidence coverage

Containment answers enumerate every effective candidate spill in the selected scope and observation window. Their text and visualization.meta.coverage expose candidateSpills, resolvedTiming, withinLimit, breaches, missingReports, unparsedTiming, observationFrom, observationTo, and datasetAsOf. A pressure-test holding duration is not treated as a containment duration.

Compliance answers expose candidate spill counts, resolved containment timing, missing reports, unparsed timing, and unknown volumes. Missing facts produce explicit uncertainty and incomplete-coverage wording rather than a claim that duties were met.

Retained fixtures verify:

- A 24.9 bbl spill uses the ordinary written-report deadline; 25 and 30 bbl spills use the major-spill two-hour deadline.
- Fourteen calendar days between inspections meet RC-01; 15 and 21 days flag a possible breach requiring a missing-record check.
- A passing flowline test from the previous calendar year does not satisfy the current year's RC-02 duty. An absent current-year test is pending before its year-end deadline.
- Missing reports and existing reports with unusable timing have separate coverage counts.
- Missing manuals and null temperature readings yield unknown production and contribute no inferred downtime.

## Boundaries

The query plan represents one observation period. Multi-period comparisons, unsupported numerical statistics, and forecasts are handled by the agent's capability checks; the domain engine does not fabricate those results.

Narrative fact extraction remains constrained to recognizable containment language. Unrecognized report wording is counted as unparsed evidence and disclosed. Missing inspection records produce possible RC-01 breaches, not proof that an unlogged inspection never occurred. This suite uses synthetic fixtures and the supplied sample; loading and hosted-model stress results are recorded by their separate owners.
