# FINAL_ANSWERS - Asset Intelligence Copilot, 11 final questions, test dataset

Run settings: SAMPLE_DATA_PATH=test-data/dataset, REFERENCE_DATE=2027-01-15 (600 wells, 7 areas, 125198 inspections, 17415 repairs), fresh COPILOT_STATE_DIR, hosted Gemini planner configured via .env.local, API on port 4292, unmodified code. Each turn is one POST /api/chat {userId,text}. Raw JSON per turn: raw/Q<n>-t<k>.json.

**IMPORTANT RUN NOTE:** every turn's planner call to the hosted Gemini model failed (model.status = fallback, reason = invalid_response), so every answer below came from the deterministic fallback planner plus the domain tools, not the hosted model. Root cause is documented in RUN_NOTES.md.


---

## Q1

### Q1 turn 1

**Asker:** Turner (U-201)

**Question (exact):** All our wells feed one reservoir. Map the reservoir pressure across the field from the pressure data.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=6610, wall=6711 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

Operator note · CTX-0067-002 [CTX-0067-002]:
{"note_id":"CTX-0067-002","asset_id":"WELL-0067","created_at":"2027-01-09T11:00:00Z","author_user_id":"U-401","note_type":"data_correction","inspection_id":"INS-0067-0216","field":"spill_est_volume_bbl","original_value":4.8,"corrected_value":5.6,"text":"Inspection INS-0067-0216: spill volume corrected from 4.8 bbl (AI estimate) to 5.6 bbl measured by the clean-up crew.","valid_from":"2027-01-07","valid_to":null}

Operator note · CTX-0213-002 [CTX-0213-002]:
{"note_id":"CTX-0213-002","asset_id":"WELL-0213","created_at":"2027-01-14T18:30:00Z","author_user_id":"U-502","note_type":"data_correction","inspection_id":"INS-0213-0221","field":"wellhead_temp_c","original_value":10.7,"corrected_value":30.6,"text":"Inspection INS-0213-0221: wellhead_temp_c corrected from 10.7 to 30.6. Thermal camera pointed at the shaded side of the wellhead; handheld re-measure.","valid_from":"2027-01-14","valid_to":null}

Operator note · CTX-0201-002 [CTX-0201-002]:
{"note_id":"CTX-0201-002","asset_id":"WELL-0201","created_at":"2027-01-14T18:30:00Z","author_user_id":"U-503","note_type":"data_correction","inspection_id":"INS-0201-0218","field":"wellhead_temp_c","original_value":32.1,"corrected_value":10.4,"text":"Inspection INS-0201-0218: wellhead_temp_c corrected from 32.1 to 10.4. Reading taken off the hot separator, not the wellhead; handheld re-measure.","valid_from":"2027-01-14","valid_to":null}
~~~

**Visual:** none returned

**Citations (6):** CTX-0067-002, CTX-0213-002, CTX-0201-002, OM-T200, MNT-0294-009, MNT-0556-003

**Conflicts:** none

**Trace:** deterministic_planner (3049 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (3558 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.


---

## Q2

### Q2 turn 1

**Asker:** Hayes (U-301)

**Question (exact):** Which well produced the most oil in 2026?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=3223, wall=3230 ms

**Answer (verbatim):**

~~~text
This calculation needs a supported domain tool or a narrower scope. The retrieved passages are evidence only and have not been aggregated.

Relevant source passages:

Repair report · MNT-0454-021 [MNT-0454-021]:
# Maintenance Report — MNT-0454-021

**Asset:** WELL-0454 (SE-32 Well 454, T350, Southeast Block 32)
**Equipment:** pump jack
**Work started:** 04 Jan 2026 08:00 · **Finished:** 07 Jan 2026 02:00 · **Well stopped for this job:** 66 hours
**Crew lead:** Megan Ward (U-305) · **Crew:** Kevin Price · **Contractor:** Coyote Ridge Well Services
**Triggered by:** inspection INS-0454-0164 on 2026-01-01
**Report written:** 08 Jan 2026

Repair report · MNT-0020-030 [MNT-0020-030]:
# Maintenance Report — MNT-0020-030

**Asset:** WELL-0020 (SW-23 Well 020, T200, Southwest Block 23)
**Equipment:** pump jack
**Work started:** 06 Mar 2026 08:00 · **Finished:** 11 Mar 2026 09:00 · **Well stopped for this job:** 121 hours
**Crew lead:** Megan Ward (U-305) · **Crew:** Daniel Foster · **Contractor:** Coyote Ridge Well Services
**Triggered by:** inspection INS-0020-0175 on 2026-03-05
**Report written:** 13 Mar 2026

Repair report · MNT-0135-033 [MNT-0135-033]:
# Maintenance Report — MNT-0135-033

**Asset:** WELL-0135 (NE-07 Well 135, T200, Northeast Block 7)
**Equipment:** pump jack
**Work started:** 15 Nov 2026 08:00 · **Finished:** 18 Nov 2026 16:00 · **Well stopped for this job:** 80 hours
**Crew lead:** Megan Ward (U-305) · **Crew:** Kevin Price, Daniel Foster · **Contractor:** Coyote Ridge Well Services
**Triggered by:** inspection INS-0135-0209 on 2026-11-12
**Report written:** 19 Nov 2026
~~~

**Visual:** none returned

**Citations (6):** MNT-0454-021, MNT-0020-030, MNT-0135-033, MNT-0084-027, MNT-0121-031, MNT-0196-029

**Conflicts:** none

**Trace:** deterministic_planner (3209 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (13 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records. || calculation_guard (0 ms): Unsupported aggregate request returned source passages without model arithmetic.


---

## Q3

### Q3 turn 1

**Asker:** Simmons (U-401)

**Question (exact):** Since 1 Nov 2026, every time an operator note reports gas at a well, did we get someone out to that well in time under our operating procedures? List every report and whether the response met the deadline.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2914, wall=2921 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

regulator letter 2026 11 20 [REGULATOR-LETTER-2026-11-20]:
# Letter from the State Oil & Gas Commission

**Internal note from HSE (Laura Simmons, U-401), 22 Nov 2026:** crews must record lab samples in the
"Spill clean-up and waste" section of the maintenance report. We treat a spill as compliant only if
its clean-up report contains the sentence "Soil samples sent to the lab." Field soil readings taken
on site do not count.

operations sop rev2 [OPERATIONS-SOP-REV2]:
## OPS-1 Gas odor response

An operator note reporting a gas smell needs a field response on that well. A gas odor report is an
operator note saying the crew smelled gas, noticed a rotten-egg smell or a gas odor, or that an H2S
monitor alarmed at a well.

moc 2026 036 [MOC-2026-036]:
## Conditions

- Effective from 10 Nov 2026.
- The bypass is checked on every daily round and recorded as an operator note on the well when it
  is put in and when it is taken out.
- Only the wells named above are covered. Any other well needs its own MOC.
~~~

**Visual:** none returned

**Citations (6):** REGULATOR-LETTER-2026-11-20, OPERATIONS-SOP-REV2, MOC-2026-036, REGULATORY-COMPLIANCE-SOP, MOC-2026-031, MNT-0388-035

**Conflicts:** none

**Trace:** deterministic_planner (2889 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (24 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.


---

## Q4

### Q4 turn 1

**Asker:** Dalton (U-402)

**Question (exact):** Across all areas, which temporary flowline bypasses are in place right now, and is each one allowed? Also list any bypass, past or present, that stayed in after its approval ran out or was never approved at all.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=3160, wall=3177 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

moc 2026 036 [MOC-2026-036]:
# Management of Change — MOC-2026-036

**Title:** Temporary flowline bypass during the winter valve program
**Date:** 6 Nov 2026
**Requested by:** Robert Hayes (U-301), maintenance lead
**Approved by:** Michael Turner (U-201), production supervisor; Chris Dalton (U-402), HSE

moc 2026 031 [MOC-2026-031]:
# Management of Change — MOC-2026-031

**Title:** Temporary flowline bypass while check valves are on back-order
**Date:** 19 Oct 2026
**Requested by:** Robert Hayes (U-301), maintenance lead
**Approved by:** Emily Carter (U-101), production supervisor; Laura Simmons (U-401), HSE

moc 2026 044 [MOC-2026-044]:
# Management of Change — MOC-2026-044

**Title:** Extension of MOC-2026-031 (temporary flowline bypass)
**Date:** 24 Nov 2026
**Requested by:** Robert Hayes (U-301), maintenance lead
**Approved by:** Emily Carter (U-101), production supervisor; Laura Simmons (U-401), HSE
~~~

**Visual:** none returned

**Citations (6):** MOC-2026-036, MOC-2026-031, MOC-2026-044, OPERATIONS-SOP-REV2, FIELD-WORK-SOP, MNT-0001-029

**Conflicts:** none

**Trace:** deterministic_planner (3124 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (36 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.


---

## Q5

### Q5 turn 1

**Asker:** Turner (U-201)

**Question (exact):** The State Oil & Gas Commission wrote to us in November 2026 about spills. Which of our spills does the letter cover, and on which ones are we not compliant? Show me a table.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2944, wall=2952 ms

**Answer (verbatim):**

~~~text
The field had 0 real spills, totalling 0 bbl from Nov 20, 2026 through Nov 20, 2026. 
~~~

**Visual:** type=`table`, title="Real spills"

| Well | Date | Barrels | Area | Latitude | Longitude | Inspection |
| --- | --- | --- | --- | --- | --- | --- |

(0 row(s))

**Citations (0):** none

**Conflicts:** none

**Trace:** deterministic_planner (2934 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || spills (10 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q6

### Q6 turn 1

**Asker:** Pierce (U-601)

**Question (exact):** Across the whole field, not just my area, for which wells do the latest inspection and the operator notes disagree about whether the well is producing oil? For each one, what is its real status right now, and why?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=3010, wall=3023 ms

**Answer (verbatim):**

~~~text
Number of inspections by well · the field, all loaded history through Jan 15, 2027. Highest: WELL-0033 with 222. WELL-0033: 222 · WELL-0048: 222 · WELL-0107: 222 · WELL-0426: 222 · WELL-0021: 221 · WELL-0036: 221 · WELL-0061: 221 · WELL-0112: 221 · WELL-0113: 221 · WELL-0115: 221 · WELL-0138: 221 · WELL-0149: 221 · plus 588 more in the table. Citations show the first 150 of 125198 underlying records.
~~~

**Visual:** type=`table`, title="Number of inspections by well · the field"

| Well | Number of inspections | Records |
| --- | --- | --- |
| WELL-0033 | 222 | 222 |
| WELL-0048 | 222 | 222 |
| WELL-0107 | 222 | 222 |
| WELL-0426 | 222 | 222 |
| WELL-0021 | 221 | 221 |
| WELL-0036 | 221 | 221 |
| WELL-0061 | 221 | 221 |
| WELL-0112 | 221 | 221 |
| WELL-0113 | 221 | 221 |
| WELL-0115 | 221 | 221 |
| WELL-0138 | 221 | 221 |
| WELL-0149 | 221 | 221 |
| WELL-0181 | 221 | 221 |
| WELL-0189 | 221 | 221 |
| WELL-0195 | 221 | 221 |
| WELL-0203 | 221 | 221 |
| WELL-0213 | 221 | 221 |
| WELL-0217 | 221 | 221 |
| WELL-0238 | 221 | 221 |
| WELL-0269 | 221 | 221 |
| WELL-0283 | 221 | 221 |
| WELL-0312 | 221 | 221 |
| WELL-0321 | 221 | 221 |
| WELL-0363 | 221 | 221 |
| WELL-0394 | 221 | 221 |
| WELL-0401 | 221 | 221 |
| WELL-0465 | 221 | 221 |
| WELL-0486 | 221 | 221 |
| WELL-0510 | 221 | 221 |
| WELL-0512 | 221 | 221 |
| WELL-0546 | 221 | 221 |
| WELL-0551 | 221 | 221 |
| WELL-0588 | 221 | 221 |
| WELL-0594 | 221 | 221 |
| WELL-0017 | 220 | 220 |
| WELL-0020 | 220 | 220 |
| WELL-0023 | 220 | 220 |
| WELL-0024 | 220 | 220 |
| WELL-0038 | 220 | 220 |
| WELL-0042 | 220 | 220 |
| WELL-0046 | 220 | 220 |
| WELL-0053 | 220 | 220 |
| WELL-0060 | 220 | 220 |
| WELL-0070 | 220 | 220 |
| WELL-0073 | 220 | 220 |
| WELL-0074 | 220 | 220 |
| WELL-0080 | 220 | 220 |
| WELL-0084 | 220 | 220 |
| WELL-0088 | 220 | 220 |
| WELL-0103 | 220 | 220 |
| WELL-0118 | 220 | 220 |
| WELL-0120 | 220 | 220 |
| WELL-0132 | 220 | 220 |
| WELL-0168 | 220 | 220 |
| WELL-0179 | 220 | 220 |
| WELL-0180 | 220 | 220 |
| WELL-0183 | 220 | 220 |
| WELL-0266 | 220 | 220 |
| WELL-0268 | 220 | 220 |
| WELL-0270 | 220 | 220 |
| WELL-0272 | 220 | 220 |
| WELL-0285 | 220 | 220 |
| WELL-0290 | 220 | 220 |
| WELL-0297 | 220 | 220 |
| WELL-0301 | 220 | 220 |
| WELL-0306 | 220 | 220 |
| WELL-0307 | 220 | 220 |
| WELL-0315 | 220 | 220 |
| WELL-0318 | 220 | 220 |
| WELL-0324 | 220 | 220 |
| WELL-0326 | 220 | 220 |
| WELL-0367 | 220 | 220 |
| WELL-0374 | 220 | 220 |
| WELL-0377 | 220 | 220 |
| WELL-0380 | 220 | 220 |
| WELL-0388 | 220 | 220 |
| WELL-0398 | 220 | 220 |
| WELL-0427 | 220 | 220 |
| WELL-0442 | 220 | 220 |
| WELL-0443 | 220 | 220 |
| WELL-0481 | 220 | 220 |
| WELL-0496 | 220 | 220 |
| WELL-0505 | 220 | 220 |
| WELL-0507 | 220 | 220 |
| WELL-0528 | 220 | 220 |
| WELL-0534 | 220 | 220 |
| WELL-0539 | 220 | 220 |
| WELL-0542 | 220 | 220 |
| WELL-0553 | 220 | 220 |
| WELL-0558 | 220 | 220 |
| WELL-0561 | 220 | 220 |
| WELL-0568 | 220 | 220 |
| WELL-0581 | 220 | 220 |
| WELL-0010 | 219 | 219 |
| WELL-0012 | 219 | 219 |
| WELL-0013 | 219 | 219 |
| WELL-0015 | 219 | 219 |
| WELL-0018 | 219 | 219 |
| WELL-0019 | 219 | 219 |
| WELL-0027 | 219 | 219 |
| WELL-0032 | 219 | 219 |
| WELL-0041 | 219 | 219 |
| WELL-0050 | 219 | 219 |
| WELL-0052 | 219 | 219 |
| WELL-0054 | 219 | 219 |
| WELL-0056 | 219 | 219 |
| WELL-0058 | 219 | 219 |
| WELL-0059 | 219 | 219 |
| WELL-0072 | 219 | 219 |
| WELL-0096 | 219 | 219 |
| WELL-0102 | 219 | 219 |
| WELL-0108 | 219 | 219 |
| WELL-0114 | 219 | 219 |
| WELL-0119 | 219 | 219 |
| WELL-0121 | 219 | 219 |
| WELL-0122 | 219 | 219 |
| WELL-0127 | 219 | 219 |
| WELL-0133 | 219 | 219 |
| WELL-0136 | 219 | 219 |
| WELL-0150 | 219 | 219 |
| WELL-0152 | 219 | 219 |
| WELL-0158 | 219 | 219 |
| WELL-0159 | 219 | 219 |
| WELL-0169 | 219 | 219 |
| WELL-0170 | 219 | 219 |
| WELL-0185 | 219 | 219 |
| WELL-0193 | 219 | 219 |
| WELL-0200 | 219 | 219 |
| WELL-0216 | 219 | 219 |
| WELL-0223 | 219 | 219 |
| WELL-0224 | 219 | 219 |
| WELL-0230 | 219 | 219 |
| WELL-0235 | 219 | 219 |
| WELL-0236 | 219 | 219 |
| WELL-0247 | 219 | 219 |
| WELL-0255 | 219 | 219 |
| WELL-0257 | 219 | 219 |
| WELL-0259 | 219 | 219 |
| WELL-0262 | 219 | 219 |
| WELL-0263 | 219 | 219 |
| WELL-0274 | 219 | 219 |
| WELL-0275 | 219 | 219 |
| WELL-0276 | 219 | 219 |
| WELL-0277 | 219 | 219 |
| WELL-0280 | 219 | 219 |
| WELL-0288 | 219 | 219 |
| WELL-0303 | 219 | 219 |
| WELL-0311 | 219 | 219 |
| WELL-0313 | 219 | 219 |
| WELL-0323 | 219 | 219 |
| WELL-0325 | 219 | 219 |
| WELL-0327 | 219 | 219 |
| WELL-0333 | 219 | 219 |
| WELL-0342 | 219 | 219 |
| WELL-0344 | 219 | 219 |
| WELL-0348 | 219 | 219 |
| WELL-0358 | 219 | 219 |
| WELL-0361 | 219 | 219 |
| WELL-0369 | 219 | 219 |
| WELL-0373 | 219 | 219 |
| WELL-0375 | 219 | 219 |
| WELL-0383 | 219 | 219 |
| WELL-0395 | 219 | 219 |
| WELL-0396 | 219 | 219 |
| WELL-0397 | 219 | 219 |
| WELL-0400 | 219 | 219 |
| WELL-0405 | 219 | 219 |
| WELL-0417 | 219 | 219 |
| WELL-0418 | 219 | 219 |
| WELL-0420 | 219 | 219 |
| WELL-0421 | 219 | 219 |
| WELL-0423 | 219 | 219 |
| WELL-0425 | 219 | 219 |
| WELL-0429 | 219 | 219 |
| WELL-0430 | 219 | 219 |
| WELL-0432 | 219 | 219 |
| WELL-0433 | 219 | 219 |
| WELL-0439 | 219 | 219 |
| WELL-0451 | 219 | 219 |
| WELL-0452 | 219 | 219 |
| WELL-0459 | 219 | 219 |
| WELL-0461 | 219 | 219 |
| WELL-0462 | 219 | 219 |
| WELL-0471 | 219 | 219 |
| WELL-0475 | 219 | 219 |
| WELL-0483 | 219 | 219 |
| WELL-0488 | 219 | 219 |
| WELL-0498 | 219 | 219 |
| WELL-0502 | 219 | 219 |
| WELL-0503 | 219 | 219 |
| WELL-0530 | 219 | 219 |
| WELL-0531 | 219 | 219 |
| WELL-0544 | 219 | 219 |
| WELL-0562 | 219 | 219 |
| WELL-0563 | 219 | 219 |
| WELL-0566 | 219 | 219 |
| WELL-0574 | 219 | 219 |
| WELL-0575 | 219 | 219 |
| WELL-0578 | 219 | 219 |
| WELL-0583 | 219 | 219 |
| WELL-0585 | 219 | 219 |
| WELL-0589 | 219 | 219 |
| WELL-0592 | 219 | 219 |
| WELL-0593 | 219 | 219 |
| WELL-0005 | 218 | 218 |
| WELL-0008 | 218 | 218 |
| WELL-0011 | 218 | 218 |
| WELL-0035 | 218 | 218 |
| WELL-0037 | 218 | 218 |
| WELL-0044 | 218 | 218 |
| WELL-0049 | 218 | 218 |
| WELL-0051 | 218 | 218 |
| WELL-0066 | 218 | 218 |
| WELL-0075 | 218 | 218 |
| WELL-0076 | 218 | 218 |
| WELL-0078 | 218 | 218 |
| WELL-0086 | 218 | 218 |
| WELL-0087 | 218 | 218 |
| WELL-0090 | 218 | 218 |
| WELL-0101 | 218 | 218 |
| WELL-0104 | 218 | 218 |
| WELL-0135 | 218 | 218 |
| WELL-0144 | 218 | 218 |
| WELL-0148 | 218 | 218 |
| WELL-0172 | 218 | 218 |
| WELL-0176 | 218 | 218 |
| WELL-0188 | 218 | 218 |
| WELL-0190 | 218 | 218 |
| WELL-0191 | 218 | 218 |
| WELL-0196 | 218 | 218 |
| WELL-0201 | 218 | 218 |
| WELL-0207 | 218 | 218 |
| WELL-0218 | 218 | 218 |
| WELL-0220 | 218 | 218 |
| WELL-0221 | 218 | 218 |
| WELL-0227 | 218 | 218 |
| WELL-0232 | 218 | 218 |
| WELL-0240 | 218 | 218 |
| WELL-0253 | 218 | 218 |
| WELL-0254 | 218 | 218 |
| WELL-0256 | 218 | 218 |
| WELL-0260 | 218 | 218 |
| WELL-0267 | 218 | 218 |
| WELL-0282 | 218 | 218 |
| WELL-0284 | 218 | 218 |
| WELL-0287 | 218 | 218 |
| WELL-0289 | 218 | 218 |
| WELL-0291 | 218 | 218 |
| WELL-0292 | 218 | 218 |
| WELL-0304 | 218 | 218 |
| WELL-0314 | 218 | 218 |
| WELL-0322 | 218 | 218 |
| WELL-0329 | 218 | 218 |
| WELL-0334 | 218 | 218 |
| WELL-0336 | 218 | 218 |
| WELL-0338 | 218 | 218 |
| WELL-0340 | 218 | 218 |
| WELL-0349 | 218 | 218 |
| WELL-0352 | 218 | 218 |
| WELL-0365 | 218 | 218 |
| WELL-0366 | 218 | 218 |
| WELL-0379 | 218 | 218 |
| WELL-0407 | 218 | 218 |
| WELL-0408 | 218 | 218 |
| WELL-0410 | 218 | 218 |
| WELL-0424 | 218 | 218 |
| WELL-0428 | 218 | 218 |
| WELL-0440 | 218 | 218 |
| WELL-0447 | 218 | 218 |
| WELL-0453 | 218 | 218 |
| WELL-0457 | 218 | 218 |
| WELL-0466 | 218 | 218 |
| WELL-0469 | 218 | 218 |
| WELL-0484 | 218 | 218 |
| WELL-0487 | 218 | 218 |
| WELL-0489 | 218 | 218 |
| WELL-0493 | 218 | 218 |
| WELL-0499 | 218 | 218 |
| WELL-0509 | 218 | 218 |
| WELL-0511 | 218 | 218 |
| WELL-0513 | 218 | 218 |
| WELL-0515 | 218 | 218 |
| WELL-0526 | 218 | 218 |
| WELL-0536 | 218 | 218 |
| WELL-0541 | 218 | 218 |
| WELL-0543 | 218 | 218 |
| WELL-0545 | 218 | 218 |
| WELL-0550 | 218 | 218 |
| WELL-0552 | 218 | 218 |
| WELL-0554 | 218 | 218 |
| WELL-0556 | 218 | 218 |
| WELL-0567 | 218 | 218 |
| WELL-0571 | 218 | 218 |
| WELL-0586 | 218 | 218 |
| WELL-0596 | 218 | 218 |
| WELL-0597 | 218 | 218 |
| WELL-0004 | 217 | 217 |
| WELL-0009 | 217 | 217 |
| WELL-0028 | 217 | 217 |
| WELL-0030 | 217 | 217 |
| WELL-0039 | 217 | 217 |
| WELL-0040 | 217 | 217 |
| WELL-0057 | 217 | 217 |
| WELL-0062 | 217 | 217 |
| WELL-0064 | 217 | 217 |
| WELL-0065 | 217 | 217 |
| WELL-0067 | 217 | 217 |
| WELL-0069 | 217 | 217 |
| WELL-0071 | 217 | 217 |
| WELL-0095 | 217 | 217 |
| WELL-0110 | 217 | 217 |
| WELL-0125 | 217 | 217 |
| WELL-0137 | 217 | 217 |
| WELL-0141 | 217 | 217 |
| WELL-0147 | 217 | 217 |
| WELL-0151 | 217 | 217 |
| WELL-0153 | 217 | 217 |
| WELL-0154 | 217 | 217 |
| WELL-0156 | 217 | 217 |
| WELL-0157 | 217 | 217 |
| WELL-0160 | 217 | 217 |
| WELL-0164 | 217 | 217 |
| WELL-0165 | 217 | 217 |
| WELL-0166 | 217 | 217 |
| WELL-0174 | 217 | 217 |
| WELL-0194 | 217 | 217 |
| WELL-0204 | 217 | 217 |
| WELL-0206 | 217 | 217 |
| WELL-0211 | 217 | 217 |
| WELL-0215 | 217 | 217 |
| WELL-0233 | 217 | 217 |
| WELL-0252 | 217 | 217 |
| WELL-0258 | 217 | 217 |
| WELL-0261 | 217 | 217 |
| WELL-0271 | 217 | 217 |
| WELL-0279 | 217 | 217 |
| WELL-0286 | 217 | 217 |
| WELL-0294 | 217 | 217 |
| WELL-0299 | 217 | 217 |
| WELL-0302 | 217 | 217 |
| WELL-0310 | 217 | 217 |
| WELL-0316 | 217 | 217 |
| WELL-0319 | 217 | 217 |
| WELL-0328 | 217 | 217 |
| WELL-0332 | 217 | 217 |
| WELL-0335 | 217 | 217 |
| WELL-0337 | 217 | 217 |
| WELL-0343 | 217 | 217 |
| WELL-0345 | 217 | 217 |
| WELL-0350 | 217 | 217 |
| WELL-0351 | 217 | 217 |
| WELL-0354 | 217 | 217 |
| WELL-0357 | 217 | 217 |
| WELL-0376 | 217 | 217 |
| WELL-0384 | 217 | 217 |
| WELL-0385 | 217 | 217 |
| WELL-0399 | 217 | 217 |
| WELL-0409 | 217 | 217 |
| WELL-0436 | 217 | 217 |
| WELL-0437 | 217 | 217 |
| WELL-0438 | 217 | 217 |
| WELL-0441 | 217 | 217 |
| WELL-0445 | 217 | 217 |
| WELL-0446 | 217 | 217 |
| WELL-0454 | 217 | 217 |
| WELL-0456 | 217 | 217 |
| WELL-0458 | 217 | 217 |
| WELL-0460 | 217 | 217 |
| WELL-0467 | 217 | 217 |
| WELL-0495 | 217 | 217 |
| WELL-0519 | 217 | 217 |
| WELL-0525 | 217 | 217 |
| WELL-0532 | 217 | 217 |
| WELL-0533 | 217 | 217 |
| WELL-0555 | 217 | 217 |
| WELL-0580 | 217 | 217 |
| WELL-0582 | 217 | 217 |
| WELL-0587 | 217 | 217 |
| WELL-0590 | 217 | 217 |
| WELL-0595 | 217 | 217 |
| WELL-0001 | 216 | 216 |
| WELL-0003 | 216 | 216 |
| WELL-0007 | 216 | 216 |
| WELL-0026 | 216 | 216 |
| WELL-0055 | 216 | 216 |
| WELL-0063 | 216 | 216 |
| WELL-0093 | 216 | 216 |
| WELL-0105 | 216 | 216 |
| WELL-0109 | 216 | 216 |
| WELL-0111 | 216 | 216 |
| WELL-0124 | 216 | 216 |
| WELL-0131 | 216 | 216 |
| WELL-0134 | 216 | 216 |
| WELL-0140 | 216 | 216 |
| WELL-0162 | 216 | 216 |
| WELL-0175 | 216 | 216 |
| WELL-0177 | 216 | 216 |
| WELL-0178 | 216 | 216 |
| WELL-0184 | 216 | 216 |
| WELL-0187 | 216 | 216 |
| WELL-0192 | 216 | 216 |
| WELL-0198 | 216 | 216 |
| WELL-0199 | 216 | 216 |
| WELL-0209 | 216 | 216 |
| WELL-0225 | 216 | 216 |
| WELL-0226 | 216 | 216 |
| WELL-0237 | 216 | 216 |
| WELL-0264 | 216 | 216 |
| WELL-0296 | 216 | 216 |
| WELL-0298 | 216 | 216 |
| WELL-0300 | 216 | 216 |
| WELL-0305 | 216 | 216 |
| WELL-0317 | 216 | 216 |
| WELL-0331 | 216 | 216 |
| WELL-0353 | 216 | 216 |
| WELL-0359 | 216 | 216 |
| WELL-0368 | 216 | 216 |
| WELL-0378 | 216 | 216 |
| WELL-0382 | 216 | 216 |
| WELL-0390 | 216 | 216 |
| WELL-0393 | 216 | 216 |
| WELL-0406 | 216 | 216 |
| WELL-0412 | 216 | 216 |
| WELL-0414 | 216 | 216 |
| WELL-0415 | 216 | 216 |
| WELL-0419 | 216 | 216 |
| WELL-0434 | 216 | 216 |
| WELL-0435 | 216 | 216 |
| WELL-0464 | 216 | 216 |
| WELL-0473 | 216 | 216 |
| WELL-0482 | 216 | 216 |
| WELL-0494 | 216 | 216 |
| WELL-0516 | 216 | 216 |
| WELL-0527 | 216 | 216 |
| WELL-0547 | 216 | 216 |
| WELL-0559 | 216 | 216 |
| WELL-0569 | 216 | 216 |
| WELL-0570 | 216 | 216 |
| WELL-0572 | 216 | 216 |
| WELL-0579 | 216 | 216 |
| WELL-0025 | 215 | 215 |
| WELL-0031 | 215 | 215 |
| WELL-0047 | 215 | 215 |
| WELL-0081 | 215 | 215 |
| WELL-0082 | 215 | 215 |
| WELL-0097 | 215 | 215 |
| WELL-0098 | 215 | 215 |
| WELL-0128 | 215 | 215 |
| WELL-0130 | 215 | 215 |
| WELL-0155 | 215 | 215 |
| WELL-0173 | 215 | 215 |
| WELL-0214 | 215 | 215 |
| WELL-0241 | 215 | 215 |
| WELL-0245 | 215 | 215 |
| WELL-0251 | 215 | 215 |
| WELL-0295 | 215 | 215 |
| WELL-0309 | 215 | 215 |
| WELL-0320 | 215 | 215 |
| WELL-0346 | 215 | 215 |
| WELL-0356 | 215 | 215 |
| WELL-0360 | 215 | 215 |
| WELL-0370 | 215 | 215 |
| WELL-0372 | 215 | 215 |
| WELL-0381 | 215 | 215 |
| WELL-0422 | 215 | 215 |
| WELL-0431 | 215 | 215 |
| WELL-0449 | 215 | 215 |
| WELL-0450 | 215 | 215 |
| WELL-0474 | 215 | 215 |
| WELL-0514 | 215 | 215 |
| WELL-0518 | 215 | 215 |
| WELL-0520 | 215 | 215 |
| WELL-0535 | 215 | 215 |
| WELL-0537 | 215 | 215 |
| WELL-0540 | 215 | 215 |
| WELL-0548 | 215 | 215 |
| WELL-0560 | 215 | 215 |
| WELL-0573 | 215 | 215 |
| WELL-0006 | 214 | 214 |
| WELL-0043 | 214 | 214 |
| WELL-0045 | 214 | 214 |
| WELL-0077 | 214 | 214 |
| WELL-0089 | 214 | 214 |
| WELL-0099 | 214 | 214 |
| WELL-0182 | 214 | 214 |
| WELL-0197 | 214 | 214 |
| WELL-0202 | 214 | 214 |
| WELL-0205 | 214 | 214 |
| WELL-0243 | 214 | 214 |
| WELL-0265 | 214 | 214 |
| WELL-0281 | 214 | 214 |
| WELL-0362 | 214 | 214 |
| WELL-0386 | 214 | 214 |
| WELL-0389 | 214 | 214 |
| WELL-0404 | 214 | 214 |
| WELL-0416 | 214 | 214 |
| WELL-0506 | 214 | 214 |
| WELL-0591 | 214 | 214 |
| WELL-0079 | 213 | 213 |
| WELL-0100 | 213 | 213 |
| WELL-0139 | 213 | 213 |
| WELL-0145 | 213 | 213 |
| WELL-0248 | 213 | 213 |
| WELL-0330 | 213 | 213 |
| WELL-0355 | 213 | 213 |
| WELL-0387 | 213 | 213 |
| WELL-0448 | 213 | 213 |
| WELL-0479 | 213 | 213 |
| WELL-0501 | 213 | 213 |
| WELL-0083 | 212 | 212 |
| WELL-0092 | 212 | 212 |
| WELL-0308 | 212 | 212 |
| WELL-0577 | 211 | 211 |
| WELL-0022 | 210 | 210 |
| WELL-0085 | 208 | 208 |
| WELL-0117 | 205 | 205 |
| WELL-0126 | 204 | 204 |
| WELL-0485 | 204 | 204 |
| WELL-0557 | 204 | 204 |
| WELL-0171 | 203 | 203 |
| WELL-0476 | 203 | 203 |
| WELL-0278 | 202 | 202 |
| WELL-0538 | 202 | 202 |
| WELL-0480 | 201 | 201 |
| WELL-0500 | 201 | 201 |
| WELL-0508 | 200 | 200 |
| WELL-0576 | 199 | 199 |
| WELL-0584 | 199 | 199 |
| WELL-0491 | 198 | 198 |
| WELL-0504 | 198 | 198 |
| WELL-0016 | 197 | 197 |
| WELL-0477 | 197 | 197 |
| WELL-0517 | 197 | 197 |
| WELL-0599 | 197 | 197 |
| WELL-0244 | 194 | 194 |
| WELL-0210 | 192 | 192 |
| WELL-0371 | 191 | 191 |
| WELL-0143 | 188 | 188 |
| WELL-0564 | 188 | 188 |
| WELL-0068 | 187 | 187 |
| WELL-0403 | 187 | 187 |
| WELL-0463 | 184 | 184 |
| WELL-0600 | 184 | 184 |
| WELL-0524 | 181 | 181 |
| WELL-0472 | 176 | 176 |
| WELL-0521 | 175 | 175 |
| WELL-0163 | 174 | 174 |
| WELL-0293 | 173 | 173 |
| WELL-0034 | 172 | 172 |
| WELL-0219 | 171 | 171 |
| WELL-0490 | 170 | 170 |
| WELL-0091 | 169 | 169 |
| WELL-0161 | 168 | 168 |
| WELL-0478 | 168 | 168 |
| WELL-0234 | 166 | 166 |
| WELL-0549 | 165 | 165 |
| WELL-0106 | 160 | 160 |
| WELL-0565 | 160 | 160 |
| WELL-0598 | 160 | 160 |
| WELL-0468 | 156 | 156 |
| WELL-0002 | 154 | 154 |
| WELL-0229 | 154 | 154 |
| WELL-0250 | 153 | 153 |
| WELL-0364 | 152 | 152 |
| WELL-0228 | 148 | 148 |
| WELL-0094 | 147 | 147 |
| WELL-0411 | 147 | 147 |
| WELL-0413 | 146 | 146 |
| WELL-0444 | 146 | 146 |
| WELL-0116 | 141 | 141 |
| WELL-0273 | 139 | 139 |
| WELL-0242 | 137 | 137 |
| WELL-0492 | 137 | 137 |
| WELL-0246 | 135 | 135 |
| WELL-0347 | 134 | 134 |
| WELL-0522 | 134 | 134 |
| WELL-0129 | 132 | 132 |
| WELL-0014 | 130 | 130 |
| WELL-0339 | 128 | 128 |
| WELL-0392 | 126 | 126 |
| WELL-0529 | 126 | 126 |
| WELL-0231 | 124 | 124 |
| WELL-0186 | 122 | 122 |
| WELL-0402 | 121 | 121 |
| WELL-0249 | 120 | 120 |
| WELL-0167 | 119 | 119 |
| WELL-0341 | 113 | 113 |
| WELL-0455 | 110 | 110 |
| WELL-0470 | 110 | 110 |
| WELL-0123 | 109 | 109 |
| WELL-0212 | 107 | 107 |
| WELL-0029 | 103 | 103 |
| WELL-0146 | 103 | 103 |
| WELL-0497 | 101 | 101 |
| WELL-0523 | 101 | 101 |
| WELL-0391 | 98 | 98 |
| WELL-0142 | 90 | 90 |
| WELL-0208 | 10 | 10 |
| WELL-0222 | 7 | 7 |
| WELL-0239 | 5 | 5 |

(600 row(s))

**Citations (150):** INS-0033-0001, INS-0033-0002, INS-0033-0003, INS-0033-0004, INS-0033-0005, INS-0033-0006, INS-0033-0007, INS-0033-0008, INS-0033-0009, INS-0033-0010, INS-0033-0011, INS-0033-0012, INS-0033-0013, INS-0033-0014, INS-0033-0015, INS-0033-0016, INS-0033-0017, INS-0033-0018, INS-0033-0019, INS-0033-0020, INS-0033-0021, INS-0033-0022, INS-0033-0023, INS-0033-0024, INS-0033-0025, INS-0033-0026, INS-0033-0027, INS-0033-0028, INS-0033-0029, INS-0033-0030, INS-0033-0031, INS-0033-0032, INS-0033-0033, INS-0033-0034, INS-0033-0035, INS-0033-0036, INS-0033-0037, INS-0033-0038, INS-0033-0039, INS-0033-0040 ... (40 of 150 listed)

**Conflicts:** none

**Trace:** deterministic_planner (2862 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || query_records (0 ms): Deterministic filter/group/aggregate over loaded records; no model arithmetic.


---

## Q7

### Q7 turn 1

**Asker:** Hayes (U-301)

**Question (exact):** Over the last month the operators have written notes about wells that sound or behave wrong. Which of those wells haven't had a repair since? Rank the 10 most likely to need a repair in the next 90 days, other than a spill clean-up, and quote the notes as evidence.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2998, wall=3005 ms

**Answer (verbatim):**

~~~text
Repair costs by maintenance start date, Jan 1, 2027 through Jan 15, 2027: WELL-0020 USD 0 · WELL-0084 USD 1,211 · WELL-0121 USD 0 · WELL-0135 USD 315 · WELL-0196 USD 0 · WELL-0454 USD 18,740.
~~~

**Visual:** type=`table`, title="Repair costs"

| Well | Repair jobs | Total cost |
| --- | --- | --- |
| WELL-0020 | 0 | USD 0 |
| WELL-0084 | 1 | USD 1,211 |
| WELL-0121 | 0 | USD 0 |
| WELL-0135 | 1 | USD 315 |
| WELL-0196 | 0 | USD 0 |
| WELL-0454 | 1 | USD 18,740 |

(6 row(s))

**Citations (3):** MNT-0084-033, MNT-0135-035, MNT-0454-029

**Conflicts:** none

**Memory:** ~~~json ["Resolved from Robert Hayes’s private conversation: WELL-0454, WELL-0020, WELL-0135, WELL-0084, WELL-0121, WELL-0196"] ~~~

**Trace:** deterministic_planner (2982 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || costs (15 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

### Q7 turn 2

**Asker:** Hayes (U-301)

**Question (exact):** Which three would you send a crew to first this week, and why?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2963, wall=2976 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

Operator note · CTX-0002-001 [CTX-0002-001]:
{"asset_id":"WELL-0002","created_at":"2026-09-03T18:00:00Z","author_user_id":"U-201","note_type":"operator_note","text":"Workover rig delayed by weather; restart pushed back about a week.","valid_from":"2026-09-03","valid_to":"2026-10-08","note_id":"CTX-0002-001"}

Operator note · CTX-0003-001 [CTX-0003-001]:
{"asset_id":"WELL-0003","created_at":"2024-07-04T18:00:00Z","author_user_id":"U-201","note_type":"operator_note","text":"Workover rig delayed by weather; restart pushed back about a week.","valid_from":"2024-07-04","valid_to":"2024-08-08","note_id":"CTX-0003-001"}

Operator note · CTX-0005-001 [CTX-0005-001]:
{"asset_id":"WELL-0005","created_at":"2024-05-02T18:00:00Z","author_user_id":"U-101","note_type":"operator_note","text":"Workover rig delayed by weather; restart pushed back about a week.","valid_from":"2024-05-02","valid_to":"2024-05-16","note_id":"CTX-0005-001"}
~~~

**Visual:** none returned

**Citations (6):** CTX-0002-001, CTX-0003-001, CTX-0005-001, CTX-0007-001, CTX-0012-001, CTX-0020-001

**Conflicts:** none

**Trace:** deterministic_planner (2957 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (5 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.


---

## Q8

### Q8 turn 1

**Asker:** Pierce (U-601)

**Question (exact):** WELL-0333's recalled pump was swapped out yesterday. The work order isn't in the system yet. Please count it as replaced from now on.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2927, wall=2935 ms

**Answer (verbatim):**

~~~text
This calculation needs a supported domain tool or a narrower scope. The retrieved passages are evidence only and have not been aggregated.

Relevant source passages:

supplier recall notice 2026 12 01 [SUPPLIER-RECALL-NOTICE-2026-12-01]:
## How to find affected pumps

The lot number is stamped on the pump barrel. Your crews record it when the pump is installed
(in your maintenance reports, on the line "Parts installed"). Only the pump that is in the well
today matters: a recalled pump that has already been pulled and replaced needs no action.

operations sop rev2 [OPERATIONS-SOP-REV2]:
## OPS-1 Gas odor response

A field response is either:
- a maintenance job on that well (its `started_at` in `maintenance.jsonl`), or
- an inspection of that well with `method` = `manual`. Drone inspections do not count.

Repair · MNT-0333-024 [MNT-0333-024]:
{"maintenance_id":"MNT-0333-024","asset_id":"WELL-0333","started_at":"2026-05-09T08:00:00Z","completed_at":"2026-05-26T19:00:00Z","maintenance_type":"corrective","equipment_kind":"downhole_pump","issue":"Downhole pump stuck","action_taken":"Pulled and replaced downhole pump","technician_user_id":"U-304","contractor":null,"downtime_hours":419,"cost_usd":{"labor":7802,"parts":7638,"total":15440},"triggered_by_inspection_id":"INS-0333-0183","report_file":"maintenance-reports/MNT-0333-024.md"}
~~~

**Visual:** none returned

**Citations (6):** SUPPLIER-RECALL-NOTICE-2026-12-01, OPERATIONS-SOP-REV2, MNT-0333-024, INS-0333-0033, INS-0333-0034, MNT-0333-009

**Conflicts:** none

**Trace:** deterministic_planner (2914 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (13 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records. || calculation_guard (0 ms): Unsupported aggregate request returned source passages without model arithmetic.

### Q8 turn 2

**Asker:** Pierce (U-601)

**Question (exact):** Also, just for me: whenever you list wells, sort them by area and then by well ID, and show costs in thousands of dollars.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2984, wall=3001 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

Operator note · CTX-0010-003 [CTX-0010-003]:
{"asset_id":"WELL-0010","created_at":"2027-01-08T07:15:00Z","author_user_id":"U-104","note_type":"operator_note","text":"Repair crew on WELL-0010, shut the well in for them.","valid_from":"2027-01-08","valid_to":null,"note_id":"CTX-0010-003"}

Operator note · CTX-0116-003 [CTX-0116-003]:
{"asset_id":"WELL-0116","created_at":"2026-11-21T06:30:00Z","author_user_id":"U-203","note_type":"operator_note","text":"Repair crew on WELL-0116, shut the well in for them.","valid_from":"2026-11-21","valid_to":null,"note_id":"CTX-0116-003"}

Operator note · CTX-0135-005 [CTX-0135-005]:
{"asset_id":"WELL-0135","created_at":"2026-11-15T07:00:00Z","author_user_id":"U-203","note_type":"operator_note","text":"Repair crew on WELL-0135, shut the well in for them.","valid_from":"2026-11-15","valid_to":null,"note_id":"CTX-0135-005"}
~~~

**Visual:** none returned

**Citations (6):** CTX-0010-003, CTX-0116-003, CTX-0135-005, CTX-0138-005, CTX-0164-006, CTX-0176-002

**Conflicts:** none

**Trace:** deterministic_planner (2847 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (137 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.

### Q8 turn 3

**Asker:** Hayes (U-301)

**Question (exact):** Which recalled pumps are still in the ground right now?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2839, wall=2847 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

supplier recall notice 2026 12 01 [SUPPLIER-RECALL-NOTICE-2026-12-01]:
## How to find affected pumps

The lot number is stamped on the pump barrel. Your crews record it when the pump is installed
(in your maintenance reports, on the line "Parts installed"). Only the pump that is in the well
today matters: a recalled pump that has already been pulled and replaced needs no action.

Operator note · CTX-0001-002 [CTX-0001-002]:
{"asset_id":"WELL-0001","created_at":"2025-11-12T09:20:00Z","author_user_id":"U-101","note_type":"operator_note","text":"Pump jack counterweights rebalanced. Expect slightly lower wellhead temperature (~3 C) from now on; this is normal.","valid_from":"2025-11-12","valid_to":null,"note_id":"CTX-0001-002"}

Repair · MNT-0302-031 [MNT-0302-031]:
{"maintenance_id":"MNT-0302-031","asset_id":"WELL-0302","started_at":"2026-12-22T07:00:00Z","completed_at":"2026-12-23T10:00:00Z","maintenance_type":"scheduled","equipment_kind":"downhole_pump","issue":"Recalled downhole pump replaced","action_taken":"Pulled the recalled pump and ran in a new insert pump","technician_user_id":"U-302","contractor":"Sandstone Rod & Pump","downtime_hours":27,"cost_usd":{"labor":5227,"parts":11965,"total":17192},"triggered_by_inspection_id":null,"report_file":"maintenance-reports/MNT-0302-031.md"}
~~~

**Visual:** none returned

**Citations (6):** SUPPLIER-RECALL-NOTICE-2026-12-01, CTX-0001-002, MNT-0302-031, MNT-0340-038, MNT-0345-039, MNT-0398-025

**Conflicts:** none

**Trace:** deterministic_planner (2836 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (2 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.

### Q8 turn 4

**Asker:** Grant (U-501)

**Question (exact):** Nathan told me the recalled pump on WELL-0577 was swapped as well. Take it off the recall list.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=3294, wall=3305 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

supplier recall notice 2026 12 01 [SUPPLIER-RECALL-NOTICE-2026-12-01]:
## How to find affected pumps

The lot number is stamped on the pump barrel. Your crews record it when the pump is installed
(in your maintenance reports, on the line "Parts installed"). Only the pump that is in the well
today matters: a recalled pump that has already been pulled and replaced needs no action.

Well details · WELL-0577 [WELL-0577]:
{"asset_id":"WELL-0577","name":"SE-32 Well 577","asset_category":"oil_well","well_type":"T200","area_id":"SE-32","team_id":"TEAM-SE","in_charge_user_id":"U-501","location":{"lat":31.63857,"lon":-102.24996},"installed_on":"2022-11-06","equipment":[{"equipment_id":"WELL-0577-WH","kind":"wellhead","model":"WH-3000"},{"equipment_id":"WELL-0577-PJ","kind":"pump_jack","model":"PJ-228"},{"equipment_id":"WELL-0577-RS","kind":"rod_string","model":"API Grade D 7/8 in"},{"equipment_id":"WELL-0577-DP","kind":"downhole_pump","model":"Insert rod pump 1.75 in"},{"equipment_id":"WELL-0577-FL","kind":"flowline","model":"3 in carbon steel"}],"last_inspection":{"inspection_id":"INS-0577-0211","inspected_at":"2027-01-14T15:30:00Z","inspector_user_id":"U-504"},"recorded_status":"active"}

Operator note · CTX-0577-001 [CTX-0577-001]:
{"asset_id":"WELL-0577","created_at":"2026-11-16T13:05:00Z","author_user_id":"U-506","note_type":"operator_note","text":"Pumper reports rattling at WELL-0577 pump jack, keep an eye on it.","valid_from":"2026-11-16","valid_to":null,"note_id":"CTX-0577-001"}
~~~

**Visual:** none returned

**Citations (6):** SUPPLIER-RECALL-NOTICE-2026-12-01, WELL-0577, CTX-0577-001, MNT-0577-028, MNT-0577-002, MNT-0577-003

**Conflicts:** none

**Trace:** deterministic_planner (3278 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (15 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.

### Q8 turn 5

**Asker:** Pierce (U-601)

**Question (exact):** Show me the recalled pumps that are still in the ground in my area, and what it cost to install each one.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=3000, wall=3012 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

supplier recall notice 2026 12 01 [SUPPLIER-RECALL-NOTICE-2026-12-01]:
## How to find affected pumps

The lot number is stamped on the pump barrel. Your crews record it when the pump is installed
(in your maintenance reports, on the line "Parts installed"). Only the pump that is in the well
today matters: a recalled pump that has already been pulled and replaced needs no action.

Repair · MNT-0302-031 [MNT-0302-031]:
{"maintenance_id":"MNT-0302-031","asset_id":"WELL-0302","started_at":"2026-12-22T07:00:00Z","completed_at":"2026-12-23T10:00:00Z","maintenance_type":"scheduled","equipment_kind":"downhole_pump","issue":"Recalled downhole pump replaced","action_taken":"Pulled the recalled pump and ran in a new insert pump","technician_user_id":"U-302","contractor":"Sandstone Rod & Pump","downtime_hours":27,"cost_usd":{"labor":5227,"parts":11965,"total":17192},"triggered_by_inspection_id":null,"report_file":"maintenance-reports/MNT-0302-031.md"}

Repair · MNT-0340-038 [MNT-0340-038]:
{"maintenance_id":"MNT-0340-038","asset_id":"WELL-0340","started_at":"2027-01-02T07:00:00Z","completed_at":"2027-01-03T16:00:00Z","maintenance_type":"scheduled","equipment_kind":"downhole_pump","issue":"Recalled downhole pump replaced","action_taken":"Pulled the recalled pump and ran in a new insert pump","technician_user_id":"U-302","contractor":"Sandstone Rod & Pump","downtime_hours":33,"cost_usd":{"labor":8483,"parts":11708,"total":20191},"triggered_by_inspection_id":null,"report_file":"maintenance-reports/MNT-0340-038.md"}
~~~

**Visual:** none returned

**Citations (6):** SUPPLIER-RECALL-NOTICE-2026-12-01, MNT-0302-031, MNT-0340-038, MNT-0345-039, MNT-0398-025, MNT-0427-025

**Conflicts:** none

**Trace:** deterministic_planner (2928 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (71 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.


---

## Q9

### Q9 turn 1

**Asker:** Hayes (U-301)

**Question (exact):** How many recalled pumps are still in the ground, and in which areas?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2935, wall=2941 ms

**Answer (verbatim):**

~~~text
This calculation needs a supported domain tool or a narrower scope. The retrieved passages are evidence only and have not been aggregated.

Relevant source passages:

supplier recall notice 2026 12 01 [SUPPLIER-RECALL-NOTICE-2026-12-01]:
## How to find affected pumps

The lot number is stamped on the pump barrel. Your crews record it when the pump is installed
(in your maintenance reports, on the line "Parts installed"). Only the pump that is in the well
today matters: a recalled pump that has already been pulled and replaced needs no action.

Repair · MNT-0302-031 [MNT-0302-031]:
{"maintenance_id":"MNT-0302-031","asset_id":"WELL-0302","started_at":"2026-12-22T07:00:00Z","completed_at":"2026-12-23T10:00:00Z","maintenance_type":"scheduled","equipment_kind":"downhole_pump","issue":"Recalled downhole pump replaced","action_taken":"Pulled the recalled pump and ran in a new insert pump","technician_user_id":"U-302","contractor":"Sandstone Rod & Pump","downtime_hours":27,"cost_usd":{"labor":5227,"parts":11965,"total":17192},"triggered_by_inspection_id":null,"report_file":"maintenance-reports/MNT-0302-031.md"}

Repair · MNT-0340-038 [MNT-0340-038]:
{"maintenance_id":"MNT-0340-038","asset_id":"WELL-0340","started_at":"2027-01-02T07:00:00Z","completed_at":"2027-01-03T16:00:00Z","maintenance_type":"scheduled","equipment_kind":"downhole_pump","issue":"Recalled downhole pump replaced","action_taken":"Pulled the recalled pump and ran in a new insert pump","technician_user_id":"U-302","contractor":"Sandstone Rod & Pump","downtime_hours":33,"cost_usd":{"labor":8483,"parts":11708,"total":20191},"triggered_by_inspection_id":null,"report_file":"maintenance-reports/MNT-0340-038.md"}
~~~

**Visual:** none returned

**Citations (6):** SUPPLIER-RECALL-NOTICE-2026-12-01, MNT-0302-031, MNT-0340-038, MNT-0345-039, MNT-0398-025, MNT-0427-025

**Conflicts:** none

**Trace:** deterministic_planner (2934 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (1 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records. || calculation_guard (0 ms): Unsupported aggregate request returned source passages without model arithmetic.

### Q9 turn 2

**Asker:** Hayes (U-301)

**Question (exact):** Different topic. Who leads Northwest Production, and how many wells does that team run?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=3003, wall=3016 ms

**Answer (verbatim):**

~~~text
This calculation needs a supported domain tool or a narrower scope. The retrieved passages are evidence only and have not been aggregated.

Relevant source passages:

moc 2026 031 [MOC-2026-031]:
# Management of Change — MOC-2026-031

**Title:** Temporary flowline bypass while check valves are on back-order
**Date:** 19 Oct 2026
**Requested by:** Robert Hayes (U-301), maintenance lead
**Approved by:** Emily Carter (U-101), production supervisor; Laura Simmons (U-401), HSE

moc 2026 036 [MOC-2026-036]:
# Management of Change — MOC-2026-036

**Title:** Temporary flowline bypass during the winter valve program
**Date:** 6 Nov 2026
**Requested by:** Robert Hayes (U-301), maintenance lead
**Approved by:** Michael Turner (U-201), production supervisor; Chris Dalton (U-402), HSE

Repair report · MNT-0445-014 [MNT-0445-014]:
# Maintenance Report — MNT-0445-014

**Asset:** WELL-0445 (NW-12 Well 445, T500, Northwest Block 12)
**Equipment:** esp pump
**Work started:** 04 Jan 2025 08:00 · **Finished:** 14 Jan 2025 01:00 · **Well stopped for this job:** 233 hours
**Crew lead:** Megan Ward (U-305) · **Crew:** Brian Coleman
**Triggered by:** inspection INS-0445-0114 on 2025-01-02
**Report written:** 15 Jan 2025
~~~

**Visual:** none returned

**Citations (6):** MOC-2026-031, MOC-2026-036, MNT-0445-014, MNT-0329-031, MNT-0401-030, MNT-0352-012

**Conflicts:** none

**Trace:** deterministic_planner (2998 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (5 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records. || calculation_guard (0 ms): Unsupported aggregate request returned source passages without model arithmetic.

### Q9 turn 3

**Asker:** Hayes (U-301)

**Question (exact):** What does our operations SOP say about cold weather? Name one well that missed the check in December.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2932, wall=2940 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

operations sop rev2 [OPERATIONS-SOP-REV2]:
## OPS-1 Gas odor response

Otherwise the response is missed. Crews on site follow WS-03 of the Field Work SOP (H2S monitors,
10 ppm stop-work level).

field work sop [FIELD-WORK-SOP]:
## 2. Background (industry references)

| Topic | What industry practice says | How this SOP uses it |
|---|---|---|
| Crew safety on well servicing | API RP 54 (*Occupational Safety and Health for Oil and Gas Well Drilling and Servicing Operations*) covers well servicing rigs and special services. Pre-job safety meetings (job safety analysis briefings) are standard practice in OSHA's oil and gas safety guidance. | WS-01 |
| Energy isolation | The federal lockout/tagout standard (OSHA 29 CFR 1910.147) lists oil and gas well drilling and servicing as outside its scope; the US Chemical Safety Board has recommended closing that gap. API RP 11G (*Installation, Maintenance and Lubrication of Pumping Units*) covers safe installation and servicing of beam pumping units, and the manufacturer's instructions take precedence. | WS-02 is our company rule |
| Hydrogen sulfide | API RP 49 covers drilling and well servicing where hydrogen sulfide (H2S) may be present; 10 ppm is the commonly used action level. | WS-03 |
| Hot work | API RP 2009 covers safe welding, cutting and hot work in the petroleum industry, including permits and gas testing. | WS-04 (the 10% LEL limit is our company rule) |
| Pressure testing | US rules for hazardous liquid pipelines (49 CFR 195.304) test at 1.25 × the maximum operating pressure (MOP) for at least 4 hours. ASME B31.4 bases its test on the internal design pressure. Flowlines on a lease are not always covered by these rules. | WS-05 is our company rule, modelled on 49 CFR 195.304 |
| Flowline maintenance | EPA SPCC rules for onshore production (40 CFR 112.9(d)(4)) require a flowline maintenance program: compatible materials, scheduled inspection or testing, corrective action, and prompt cleanup of discharges. | WS-05, WS-06 and RC-05 |

Repair report · MNT-0126-020 [MNT-0126-020]:
## What happened

Field staff reported that the wellhead was cold and the pump jack was straining with a heavy, uneven load. The thermal reading at inspection INS-0126-0144 showed the wellhead at 16.2 °C with the air at 12.7 °C, so the well was not producing. The operator shut the well in for the repair. The downhole pump was stuck, most likely from sand or scale.
Sandstone Rod & Pump's workover rig was busy on other wells, so the well waited about 6 days for it; the work itself took about 2 days.
~~~

**Visual:** none returned

**Citations (6):** OPERATIONS-SOP-REV2, FIELD-WORK-SOP, MNT-0126-020, MNT-0424-006, MNT-0001-029, REGULATORY-COMPLIANCE-SOP

**Conflicts:** none

**Trace:** deterministic_planner (2918 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (14 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.

### Q9 turn 4

**Asker:** Hayes (U-301)

**Question (exact):** An operator reported a gas smell at WELL-0332 on 3 Dec. What was the H2S reading?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2888, wall=2894 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

Operator note · CTX-0332-004 [CTX-0332-004]:
{"asset_id":"WELL-0332","created_at":"2026-12-03T12:10:00Z","author_user_id":"U-602","note_type":"operator_note","text":"Gas odor reported by the pumper near WELL-0332 wellhead, area flagged off.","valid_from":"2026-12-03","valid_to":null,"note_id":"CTX-0332-004"}

operations sop rev2 [OPERATIONS-SOP-REV2]:
## OPS-1 Gas odor response

An operator note reporting a gas smell needs a field response on that well. A gas odor report is an
operator note saying the crew smelled gas, noticed a rotten-egg smell or a gas odor, or that an H2S
monitor alarmed at a well.

Operator note · CTX-0332-003 [CTX-0332-003]:
{"asset_id":"WELL-0332","created_at":"2026-11-20T20:00:00Z","author_user_id":"U-602","note_type":"operator_note","text":"Restarted WELL-0332 after the crew cleared the lockout.","valid_from":"2026-11-20","valid_to":null,"note_id":"CTX-0332-003"}
~~~

**Visual:** none returned

**Citations (6):** CTX-0332-004, OPERATIONS-SOP-REV2, CTX-0332-003, CTX-0332-002, CTX-0332-005, CTX-0332-006

**Conflicts:** none

**Trace:** deterministic_planner (2881 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (6 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.

### Q9 turn 5

**Asker:** Hayes (U-301)

**Question (exact):** Back to the pumps from my first question: which of those wells are not producing oil right now, and when was each one last repaired?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=17998, wall=18009 ms

**Answer (verbatim):**

~~~text
Repair costs by maintenance start date, Jan 1, 2027 through Jan 15, 2027: WELL-0332 USD 0.
~~~

**Visual:** type=`table`, title="Repair costs"

| Well | Repair jobs | Total cost |
| --- | --- | --- |
| WELL-0332 | 0 | USD 0 |

(1 row(s))

**Citations (0):** none

**Conflicts:** none

**Memory:** ~~~json ["Resolved from Robert Hayes’s private conversation: WELL-0332"] ~~~

**Trace:** deterministic_planner (17998 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || costs (0 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

### Q9 turn 6

**Asker:** Hayes (U-301)

**Question (exact):** Of all the wells we've talked about today, which one would you deal with first, and why?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2986, wall=2994 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

supplier recall notice 2026 12 01 [SUPPLIER-RECALL-NOTICE-2026-12-01]:
## What is recalled

Pumps from all other lots, including LOT-2409-B, LOT-2410-A and LOT-2410-C, are not affected.
Highline Pump Co. does not supply ESP pumps, so ESP wells are not affected by this notice.

Repair report · MNT-0556-003 [MNT-0556-003]:
## What happened

Field staff reported that the ESP drive reported a ground fault. The thermal reading at inspection INS-0556-0030 showed the wellhead at 38.1 °C with the air at 30.3 °C, so the well was not producing. The operator shut the well in for the repair. Insulation testing located a fault in the downhole power cable.
Coyote Ridge Well Services's workover rig was busy on other wells, so the well waited about 2 days for it; the work itself took about 2 days.

Repair report · MNT-0126-020 [MNT-0126-020]:
## What happened

Field staff reported that the wellhead was cold and the pump jack was straining with a heavy, uneven load. The thermal reading at inspection INS-0126-0144 showed the wellhead at 16.2 °C with the air at 12.7 °C, so the well was not producing. The operator shut the well in for the repair. The downhole pump was stuck, most likely from sand or scale.
Sandstone Rod & Pump's workover rig was busy on other wells, so the well waited about 6 days for it; the work itself took about 2 days.
~~~

**Visual:** none returned

**Citations (6):** SUPPLIER-RECALL-NOTICE-2026-12-01, MNT-0556-003, MNT-0126-020, MNT-0275-019, MNT-0424-006, MNT-0071-025

**Conflicts:** none

**Trace:** deterministic_planner (2980 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (6 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.


---

## Q10

### Q10 turn 1

**Asker:** Turner (U-201)

**Question (exact):** When a well stays shut in longer than the repair itself, what are we usually waiting on: parts, crews, contractors or weather? Break it down by area for jobs started in 2026, with the typical number of extra days, and tell me if any area stands out.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=10022, wall=10071 ms

**Answer (verbatim):**

~~~text
WELL-0001: 28 days (4 non-producing weekly inspections); WELL-0002: 56 days (8 non-producing weekly inspections); WELL-0003: 0 days (0 non-producing weekly inspections); WELL-0004: 42 days (6 non-producing weekly inspections); WELL-0005: 42 days (6 non-producing weekly inspections); WELL-0006: 28 days (4 non-producing weekly inspections); WELL-0007: 14 days (2 non-producing weekly inspections); WELL-0008: 0 days (0 non-producing weekly inspections); WELL-0009: 14 days (2 non-producing weekly inspections); WELL-0010: 56 days (8 non-producing weekly inspections); WELL-0011: 0 days (0 non-producing weekly inspections); WELL-0012: 7 days (1 non-producing weekly inspections); WELL-0013: 49 days (7 non-producing weekly inspections); WELL-0014: 7 days (1 non-producing weekly inspections); WELL-0015: 63 days (9 non-producing weekly inspections); WELL-0016: 0 days (0 non-producing weekly inspections); WELL-0017: 0 days (0 non-producing weekly inspections); WELL-0018: 28 days (4 non-producing weekly inspections); WELL-0019: 28 days (4 non-producing weekly inspections); WELL-0020: 35 days (5 non-producing weekly inspections); WELL-0021: 42 days (6 non-producing weekly inspections); WELL-0022: 0 days (0 non-producing weekly inspections); WELL-0023: 35 days (5 non-producing weekly inspections); WELL-0024: 0 days (0 non-producing weekly inspections); WELL-0025: 42 days (6 non-producing weekly inspections); WELL-0026: 21 days (3 non-producing weekly inspections); WELL-0027: 0 days (0 non-producing weekly inspections); WELL-0028: 7 days (1 non-producing weekly inspections); WELL-0029: 0 days (0 non-producing weekly inspections); WELL-0030: 14 days (2 non-producing weekly inspections); WELL-0031: 77 days (11 non-producing weekly inspections); WELL-0032: 14 days (2 non-producing weekly inspections); WELL-0033: 63 days (9 non-producing weekly inspections); WELL-0034: 0 days (0 non-producing weekly inspections); WELL-0035: 21 days (3 non-producing weekly inspections); WELL-0036: 28 days (4 non-producing weekly inspections); WELL-0037: 7 days (1 non-producing weekly inspections); WELL-0038: 7 days (1 non-producing weekly inspections); WELL-0039: 28 days (4 non-producing weekly inspections); WELL-0040: 21 days (3 non-producing weekly inspections); WELL-0041: 49 days (7 non-producing weekly inspections); WELL-0042: 35 days (5 non-producing weekly inspections); WELL-0043: 7 days (1 non-producing weekly inspections); WELL-0044: 0 days (0 non-producing weekly inspections); WELL-0045: 28 days (4 non-producing weekly inspections); WELL-0046: 14 days (2 non-producing weekly inspections); WELL-0047: 14 days (2 non-producing weekly inspections); WELL-0048: 7 days (1 non-producing weekly inspections); WELL-0049: 0 days (0 non-producing weekly inspections); WELL-0050: 0 days (0 non-producing weekly inspections); WELL-0051: 0 days (0 non-producing weekly inspections); WELL-0052: 0 days (0 non-producing weekly inspections); WELL-0053: 0 days (0 non-producing weekly inspections); WELL-0054: 28 days (4 non-producing weekly inspections); WELL-0055: 14 days (2 non-producing weekly inspections); WELL-0056: 14 days (2 non-producing weekly inspections); WELL-0057: 28 days (4 non-producing weekly inspections); WELL-0058: 28 days (4 non-producing weekly inspections); WELL-0059: 0 days (0 non-producing weekly inspections); WELL-0060: 21 days (3 non-producing weekly inspections); WELL-0061: 84 days (12 non-producing weekly inspections); WELL-0062: 28 days (4 non-producing weekly inspections); WELL-0063: 28 days (4 non-producing weekly inspections); WELL-0064: 7 days (1 non-producing weekly inspections); WELL-0065: 56 days (8 non-producing weekly inspections); WELL-0066: 21 days (3 non-producing weekly inspections); WELL-0067: 0 days (0 non-producing weekly inspections); WELL-0068: 7 days (1 non-producing weekly inspections); WELL-0069: 49 days (7 non-producing weekly inspections); WELL-0070: 14 days (2 non-producing weekly inspections); WELL-0071: 35 days (5 non-producing weekly inspections); WELL-0072: 21 days (3 non-producing weekly inspections); WELL-0073: 7 days (1 non-producing weekly inspections); WELL-0074: 7 days (1 non-producing weekly inspections); WELL-0075: 35 days (5 non-producing weekly inspections); WELL-0076: 0 days (0 non-producing weekly inspections); WELL-0077: 35 days (5 non-producing weekly inspections); WELL-0078: 42 days (6 non-producing weekly inspections); WELL-0079: 35 days (5 non-producing weekly inspections); WELL-0080: 28 days (4 non-producing weekly inspections); WELL-0081: 0 days (0 non-producing weekly inspections); WELL-0082: 0 days (0 non-producing weekly inspections); WELL-0083: 0 days (0 non-producing weekly inspections); WELL-0084: 63 days (9 non-producing weekly inspections); WELL-0085: 49 days (7 non-producing weekly inspections); WELL-0086: 0 days (0 non-producing weekly inspections); WELL-0087: 7 days (1 non-producing weekly inspections); WELL-0088: 14 days (2 non-producing weekly inspections); WELL-0089: 42 days (6 non-producing weekly inspections); WELL-0090: 28 days (4 non-producing weekly inspections); WELL-0091: 0 days (0 non-producing weekly inspections); WELL-0092: 49 days (7 non-producing weekly inspections); WELL-0093: 28 days (4 non-producing weekly inspections); WELL-0094: 0 days (0 non-producing weekly inspections); WELL-0095: 14 days (2 non-producing weekly inspections); WELL-0096: 14 days (2 non-producing weekly inspections); WELL-0097: 21 days (3 non-producing weekly inspections); WELL-0098: 0 days (0 non-producing weekly inspections); WELL-0099: 0 days (0 non-producing weekly inspections); WELL-0100: 14 days (2 non-producing weekly inspections); WELL-0101: 7 days (1 non-producing weekly inspections); WELL-0102: 21 days (3 non-producing weekly inspections); WELL-0103: 42 days (6 non-producing weekly inspections); WELL-0104: 0 days (0 non-producing weekly inspections); WELL-0105: 0 days (0 non-producing weekly inspections); WELL-0106: 0 days (0 non-producing weekly inspections); WELL-0107: 42 days (6 non-producing weekly inspections); WELL-0108: 63 days (9 non-producing weekly inspections); WELL-0109: 21 days (3 non-producing weekly inspections); WELL-0110: 28 days (4 non-producing weekly inspections); WELL-0111: 14 days (2 non-producing weekly inspections); WELL-0112: 7 days (1 non-producing weekly inspections); WELL-0113: 21 days (3 non-producing weekly inspections); WELL-0114: 28 days (4 non-producing weekly inspections); WELL-0115: 28 days (4 non-producing weekly inspections); WELL-0116: 42 days (6 non-producing weekly inspections); WELL-0117: 0 days (0 non-producing weekly inspections); WELL-0118: 21 days (3 non-producing weekly inspections); WELL-0119: 28 days (4 non-producing weekly inspections); WELL-0120: 7 days (1 non-producing weekly inspections); WELL-0121: 77 days (11 non-producing weekly inspections); WELL-0122: 28 days (4 non-producing weekly inspections); WELL-0123: 35 days (5 non-producing weekly inspections); WELL-0124: 7 days (1 non-producing weekly inspections); WELL-0125: 7 days (1 non-producing weekly inspections); WELL-0126: 0 days (0 non-producing weekly inspections); WELL-0127: 21 days (3 non-producing weekly inspections); WELL-0128: 35 days (5 non-producing weekly inspections); WELL-0129: 21 days (3 non-producing weekly inspections); WELL-0130: 0 days (0 non-producing weekly inspections); WELL-0131: 7 days (1 non-producing weekly inspections); WELL-0132: 14 days (2 non-producing weekly inspections); WELL-0133: 28 days (4 non-producing weekly inspections); WELL-0134: 0 days (0 non-producing weekly inspections); WELL-0135: 28 days (4 non-producing weekly inspections); WELL-0136: 35 days (5 non-producing weekly inspections); WELL-0137: 0 days (0 non-producing weekly inspections); WELL-0138: 42 days (6 non-producing weekly inspections); WELL-0139: 0 days (0 non-producing weekly inspections); WELL-0140: 28 days (4 non-producing weekly inspections); WELL-0141: 0 days (0 non-producing weekly inspections); WELL-0142: 0 days (0 non-producing weekly inspections); WELL-0143: 21 days (3 non-producing weekly inspections); WELL-0144: 0 days (0 non-producing weekly inspections); WELL-0145: 14 days (2 non-producing weekly inspections); WELL-0146: 0 days (0 non-producing weekly inspections); WELL-0147: 0 days (0 non-producing weekly inspections); WELL-0148: 0 days (0 non-producing weekly inspections); WELL-0149: 14 days (2 non-producing weekly inspections); WELL-0150: 21 days (3 non-producing weekly inspections); WELL-0151: 56 days (8 non-producing weekly inspections); WELL-0152: 7 days (1 non-producing weekly inspections); WELL-0153: 0 days (0 non-producing weekly inspections); WELL-0154: 14 days (2 non-producing weekly inspections); WELL-0155: 7 days (1 non-producing weekly inspections); WELL-0156: 14 days (2 non-producing weekly inspections); WELL-0157: 21 days (3 non-producing weekly inspections); WELL-0158: 0 days (0 non-producing weekly inspections); WELL-0159: 56 days (8 non-producing weekly inspections); WELL-0160: 42 days (6 non-producing weekly inspections); WELL-0161: 28 days (4 non-producing weekly inspections); WELL-0162: 0 days (0 non-producing weekly inspections); WELL-0163: 0 days (0 non-producing weekly inspections); WELL-0164: 21 days (3 non-producing weekly inspections); WELL-0165: 0 days (0 non-producing weekly inspections); WELL-0166: 7 days (1 non-producing weekly inspections); WELL-0167: 0 days (0 non-producing weekly inspections); WELL-0168: 7 days (1 non-producing weekly inspections); WELL-0169: 7 days (1 non-producing weekly inspections); WELL-0170: 98 days (14 non-producing weekly inspections); WELL-0171: 28 days (4 non-producing weekly inspections); WELL-0172: 49 days (7 non-producing weekly inspections); WELL-0173: 14 days (2 non-producing weekly inspections); WELL-0174: 28 days (4 non-producing weekly inspections); WELL-0175: 28 days (4 non-producing weekly inspections); WELL-0176: 28 days (4 non-producing weekly inspections); WELL-0177: 14 days (2 non-producing weekly inspections); WELL-0178: 28 days (4 non-producing weekly inspections); WELL-0179: 21 days (3 non-producing weekly inspections); WELL-0180: 42 days (6 non-producing weekly inspections); WELL-0181: 28 days (4 non-producing weekly inspections); WELL-0182: 70 days (10 non-producing weekly inspections); WELL-0183: 49 days (7 non-producing weekly inspections); WELL-0184: 21 days (3 non-producing weekly inspections); WELL-0185: 0 days (0 non-producing weekly inspections); WELL-0186: 0 days (0 non-producing weekly inspections); WELL-0187: 21 days (3 non-producing weekly inspections); WELL-0188: 28 days (4 non-producing weekly inspections); WELL-0189: 28 days (4 non-producing weekly inspections); WELL-0190: 56 days (8 non-producing weekly inspections); WELL-0191: 42 days (6 non-producing weekly inspections); WELL-0192: 7 days (1 non-producing weekly inspections); WELL-0193: 21 days (3 non-producing weekly inspections); WELL-0194: 28 days (4 non-producing weekly inspections); WELL-0195: 14 days (2 non-producing weekly inspections); WELL-0196: 14 days (2 non-producing weekly inspections); WELL-0197: 28 days (4 non-producing weekly inspections); WELL-0198: 0 days (0 non-producing weekly inspections); WELL-0199: 77 days (11 non-producing weekly inspections); WELL-0200: 28 days (4 non-producing weekly inspections); WELL-0201: 0 days (0 non-producing weekly inspections); WELL-0202: 0 days (0 non-producing weekly inspections); WELL-0203: 14 days (2 non-producing weekly inspections); WELL-0204: 21 days (3 non-producing weekly inspections); WELL-0205: 14 days (2 non-producing weekly inspections); WELL-0206: 0 days (0 non-producing weekly inspections); WELL-0207: 0 days (0 non-producing weekly inspections); WELL-0208: 0 days (0 non-producing weekly inspections); WELL-0209: 49 days (7 non-producing weekly inspections); WELL-0210: 14 days (2 non-producing weekly inspections); WELL-0211: 0 days (0 non-producing weekly inspections); WELL-0212: 0 days (0 non-producing weekly inspections); WELL-0213: 35 days (5 non-producing weekly inspections); WELL-0214: 0 days (0 non-producing weekly inspections); WELL-0215: 14 days (2 non-producing weekly inspections); WELL-0216: 49 days (7 non-producing weekly inspections); WELL-0217: 42 days (6 non-producing weekly inspections); WELL-0218: 28 days (4 non-producing weekly inspections); WELL-0219: 28 days (4 non-producing weekly inspections); WELL-0220: 0 days (0 non-producing weekly inspections); WELL-0221: 0 days (0 non-producing weekly inspections); WELL-0222: 0 days (0 non-producing weekly inspections); WELL-0223: 0 days (0 non-producing weekly inspections); WELL-0224: 21 days (3 non-producing weekly inspections); WELL-0225: 21 days (3 non-producing weekly inspections); WELL-0226: 21 days (3 non-producing weekly inspections); WELL-0227: 42 days (6 non-producing weekly inspections); WELL-0228: 0 days (0 non-producing weekly inspections); WELL-0229: 14 days (2 non-producing weekly inspections); WELL-0230: 0 days (0 non-producing weekly inspections); WELL-0231: 0 days (0 non-producing weekly inspections); WELL-0232: 14 days (2 non-producing weekly inspections); WELL-0233: 0 days (0 non-producing weekly inspections); WELL-0234: 7 days (1 non-producing weekly inspections); WELL-0235: 7 days (1 non-producing weekly inspections); WELL-0236: 7 days (1 non-producing weekly inspections); WELL-0237: 0 days (0 non-producing weekly inspections); WELL-0238: 77 days (11 non-producing weekly inspections); WELL-0239: 0 days (0 non-producing weekly inspections); WELL-0240: 14 days (2 non-producing weekly inspections); WELL-0241: 21 days (3 non-producing weekly inspections); WELL-0242: 0 days (0 non-producing weekly inspections); WELL-0243: 0 days (0 non-producing weekly inspections); WELL-0244: 21 days (3 non-producing weekly inspections); WELL-0245: 21 days (3 non-producing weekly inspections); WELL-0246: 0 days (0 non-producing weekly inspections); WELL-0247: 28 days (4 non-producing weekly inspections); WELL-0248: 21 days (3 non-producing weekly inspections); WELL-0249: 35 days (5 non-producing weekly inspections); WELL-0250: 28 days (4 non-producing weekly inspections); WELL-0251: 14 days (2 non-producing weekly inspections); WELL-0252: 21 days (3 non-producing weekly inspections); WELL-0253: 21 days (3 non-producing weekly inspections); WELL-0254: 0 days (0 non-producing weekly inspections); WELL-0255: 7 days (1 non-producing weekly inspections); WELL-0256: 0 days (0 non-producing weekly inspections); WELL-0257: 0 days (0 non-producing weekly inspections); WELL-0258: 28 days (4 non-producing weekly inspections); WELL-0259: 28 days (4 non-producing weekly inspections); WELL-0260: 28 days (4 non-producing weekly inspections); WELL-0261: 49 days (7 non-producing weekly inspections); WELL-0262: 21 days (3 non-producing weekly inspections); WELL-0263: 21 days (3 non-producing weekly inspections); WELL-0264: 7 days (1 non-producing weekly inspections); WELL-0265: 42 days (6 non-producing weekly inspections); WELL-0266: 0 days (0 non-producing weekly inspections); WELL-0267: 0 days (0 non-producing weekly inspections); WELL-0268: 21 days (3 non-producing weekly inspections); WELL-0269: 21 days (3 non-producing weekly inspections); WELL-0270: 14 days (2 non-producing weekly inspections); WELL-0271: 77 days (11 non-producing weekly inspections); WELL-0272: 0 days (0 non-producing weekly inspections); WELL-0273: 28 days (4 non-producing weekly inspections); WELL-0274: 0 days (0 non-producing weekly inspections); WELL-0275: 14 days (2 non-producing weekly inspections); WELL-0276: 21 days (3 non-producing weekly inspections); WELL-0277: 0 days (0 non-producing weekly inspections); WELL-0278: 7 days (1 non-producing weekly inspections); WELL-0279: 28 days (4 non-producing weekly inspections); WELL-0280: 14 days (2 non-producing weekly inspections); WELL-0281: 28 days (4 non-producing weekly inspections); WELL-0282: 0 days (0 non-producing weekly inspections); WELL-0283: 28 days (4 non-producing weekly inspections); WELL-0284: 0 days (0 non-producing weekly inspections); WELL-0285: 7 days (1 non-producing weekly inspections); WELL-0286: 21 days (3 non-producing weekly inspections); WELL-0287: 0 days (0 non-producing weekly inspections); WELL-0288: 7 days (1 non-producing weekly inspections); WELL-0289: 42 days (6 non-producing weekly inspections); WELL-0290: 7 days (1 non-producing weekly inspections); WELL-0291: 7 days (1 non-producing weekly inspections); WELL-0292: 14 days (2 non-producing weekly inspections); WELL-0293: 0 days (0 non-producing weekly inspections); WELL-0294: 14 days (2 non-producing weekly inspections); WELL-0295: 42 days (6 non-producing weekly inspections); WELL-0296: 0 days (0 non-producing weekly inspections); WELL-0297: 56 days (8 non-producing weekly inspections); WELL-0298: 42 days (6 non-producing weekly inspections); WELL-0299: 28 days (4 non-producing weekly inspections); WELL-0300: 14 days (2 non-producing weekly inspections); WELL-0301: 35 days (5 non-producing weekly inspections); WELL-0302: 21 days (3 non-producing weekly inspections); WELL-0303: 0 days (0 non-producing weekly inspections); WELL-0304: 28 days (4 non-producing weekly inspections); WELL-0305: 21 days (3 non-producing weekly inspections); WELL-0306: 14 days (2 non-producing weekly inspections); WELL-0307: 35 days (5 non-producing weekly inspections); WELL-0308: 0 days (0 non-producing weekly inspections); WELL-0309: 21 days (3 non-producing weekly inspections); WELL-0310: 7 days (1 non-producing weekly inspections); WELL-0311: 0 days (0 non-producing weekly inspections); WELL-0312: 0 days (0 non-producing weekly inspections); WELL-0313: 35 days (5 non-producing weekly inspections); WELL-0314: 14 days (2 non-producing weekly inspections); WELL-0315: 0 days (0 non-producing weekly inspections); WELL-0316: 21 days (3 non-producing weekly inspections); WELL-0317: 0 days (0 non-producing weekly inspections); WELL-0318: 28 days (4 non-producing weekly inspections); WELL-0319: 0 days (0 non-producing weekly inspections); WELL-0320: 7 days (1 non-producing weekly inspections); WELL-0321: 35 days (5 non-producing weekly inspections); WELL-0322: 14 days (2 non-producing weekly inspections); WELL-0323: 14 days (2 non-producing weekly inspections); WELL-0324: 7 days (1 non-producing weekly inspections); WELL-0325: 14 days (2 non-producing weekly inspections); WELL-0326: 42 days (6 non-producing weekly inspections); WELL-0327: 0 days (0 non-producing weekly inspections); WELL-0328: 42 days (6 non-producing weekly inspections); WELL-0329: 28 days (4 non-producing weekly inspections); WELL-0330: 42 days (6 non-producing weekly inspections); WELL-0331: 7 days (1 non-producing weekly inspections); WELL-0332: 14 days (2 non-producing weekly inspections); WELL-0333: 35 days (5 non-producing weekly inspections); WELL-0334: 0 days (0 non-producing weekly inspections); WELL-0335: 28 days (4 non-producing weekly inspections); WELL-0336: 7 days (1 non-producing weekly inspections); WELL-0337: 0 days (0 non-producing weekly inspections); WELL-0338: 77 days (11 non-producing weekly inspections); WELL-0339: 0 days (0 non-producing weekly inspections); WELL-0340: 77 days (11 non-producing weekly inspections); WELL-0341: 7 days (1 non-producing weekly inspections); WELL-0342: 7 days (1 non-producing weekly inspections); WELL-0343: 0 days (0 non-producing weekly inspections); WELL-0344: 28 days (4 non-producing weekly inspections); WELL-0345: 42 days (6 non-producing weekly inspections); WELL-0346: 49 days (7 non-producing weekly inspections); WELL-0347: 0 days (0 non-producing weekly inspections); WELL-0348: 42 days (6 non-producing weekly inspections); WELL-0349: 14 days (2 non-producing weekly inspections); WELL-0350: 0 days (0 non-producing weekly inspections); WELL-0351: 7 days (1 non-producing weekly inspections); WELL-0352: 84 days (12 non-producing weekly inspections); WELL-0353: 7 days (1 non-producing weekly inspections); WELL-0354: 35 days (5 non-producing weekly inspections); WELL-0355: 21 days (3 non-producing weekly inspections); WELL-0356: 0 days (0 non-producing weekly inspections); WELL-0357: 14 days (2 non-producing weekly inspections); WELL-0358: 7 days (1 non-producing weekly inspections); WELL-0359: 35 days (5 non-producing weekly inspections); WELL-0360: 21 days (3 non-producing weekly inspections); WELL-0361: 14 days (2 non-producing weekly inspections); WELL-0362: 7 days (1 non-producing weekly inspections); WELL-0363: 28 days (4 non-producing weekly inspections); WELL-0364: 0 days (0 non-producing weekly inspections); WELL-0365: 21 days (3 non-producing weekly inspections); WELL-0366: 49 days (7 non-producing weekly inspections); WELL-0367: 0 days (0 non-producing weekly inspections); WELL-0368: 7 days (1 non-producing weekly inspections); WELL-0369: 21 days (3 non-producing weekly inspections); WELL-0370: 28 days (4 non-producing weekly inspections); WELL-0371: 0 days (0 non-producing weekly inspections); WELL-0372: 0 days (0 non-producing weekly inspections); WELL-0373: 14 days (2 non-producing weekly inspections); WELL-0374: 56 days (8 non-producing weekly inspections); WELL-0375: 14 days (2 non-producing weekly inspections); WELL-0376: 35 days (5 non-producing weekly inspections); WELL-0377: 42 days (6 non-producing weekly inspections); WELL-0378: 7 days (1 non-producing weekly inspections); WELL-0379: 7 days (1 non-producing weekly inspections); WELL-0380: 42 days (6 non-producing weekly inspections); WELL-0381: 28 days (4 non-producing weekly inspections); WELL-0382: 35 days (5 non-producing weekly inspections); WELL-0383: 0 days (0 non-producing weekly inspections); WELL-0384: 42 days (6 non-producing weekly inspections); WELL-0385: 14 days (2 non-producing weekly inspections); WELL-0386: 0 days (0 non-producing weekly inspections); WELL-0387: 0 days (0 non-producing weekly inspections); WELL-0388: 42 days (6 non-producing weekly inspections); WELL-0389: 0 days (0 non-producing weekly inspections); WELL-0390: 0 days (0 non-producing weekly inspections); WELL-0391: 0 days (0 non-producing weekly inspections); WELL-0392: 7 days (1 non-producing weekly inspections); WELL-0393: 28 days (4 non-producing weekly inspections); WELL-0394: 14 days (2 non-producing weekly inspections); WELL-0395: 14 days (2 non-producing weekly inspections); WELL-0396: 7 days (1 non-producing weekly inspections); WELL-0397: 0 days (0 non-producing weekly inspections); WELL-0398: 35 days (5 non-producing weekly inspections); WELL-0399: 28 days (4 non-producing weekly inspections); WELL-0400: 63 days (9 non-producing weekly inspections); WELL-0401: 42 days (6 non-producing weekly inspections); WELL-0402: 49 days (7 non-producing weekly inspections); WELL-0403: 7 days (1 non-producing weekly inspections); WELL-0404: 35 days (5 non-producing weekly inspections); WELL-0405: 35 days (5 non-producing weekly inspections); WELL-0406: 14 days (2 non-producing weekly inspections); WELL-0407: 14 days (2 non-producing weekly inspections); WELL-0408: 7 days (1 non-producing weekly inspections); WELL-0409: 14 days (2 non-producing weekly inspections); WELL-0410: 28 days (4 non-producing weekly inspections); WELL-0411: 70 days (10 non-producing weekly inspections); WELL-0412: 14 days (2 non-producing weekly inspections); WELL-0413: 0 days (0 non-producing weekly inspections); WELL-0414: 91 days (13 non-producing weekly inspections); WELL-0415: 0 days (0 non-producing weekly inspections); WELL-0416: 0 days (0 non-producing weekly inspections); WELL-0417: 7 days (1 non-producing weekly inspections); WELL-0418: 7 days (1 non-producing weekly inspections); WELL-0419: 0 days (0 non-producing weekly inspections); WELL-0420: 56 days (8 non-producing weekly inspections); WELL-0421: 14 days (2 non-producing weekly inspections); WELL-0422: 0 days (0 non-producing weekly inspections); WELL-0423: 7 days (1 non-producing weekly inspections); WELL-0424: 14 days (2 non-producing weekly inspections); WELL-0425: 35 days (5 non-producing weekly inspections); WELL-0426: 14 days (2 non-producing weekly inspections); WELL-0427: 7 days (1 non-producing weekly inspections); WELL-0428: 14 days (2 non-producing weekly inspections); WELL-0429: 14 days (2 non-producing weekly inspections); WELL-0430: 21 days (3 non-producing weekly inspections); WELL-0431: 7 days (1 non-producing weekly inspections); WELL-0432: 70 days (10 non-producing weekly inspections); WELL-0433: 14 days (2 non-producing weekly inspections); WELL-0434: 14 days (2 non-producing weekly inspections); WELL-0435: 7 days (1 non-producing weekly inspections); WELL-0436: 7 days (1 non-producing weekly inspections); WELL-0437: 7 days (1 non-producing weekly inspections); WELL-0438: 28 days (4 non-producing weekly inspections); WELL-0439: 98 days (14 non-producing weekly inspections); WELL-0440: 0 days (0 non-producing weekly inspections); WELL-0441: 7 days (1 non-producing weekly inspections); WELL-0442: 0 days (0 non-producing weekly inspections); WELL-0443: 14 days (2 non-producing weekly inspections); WELL-0444: 42 days (6 non-producing weekly inspections); WELL-0445: 0 days (0 non-producing weekly inspections); WELL-0446: 28 days (4 non-producing weekly inspections); WELL-0447: 14 days (2 non-producing weekly inspections); WELL-0448: 42 days (6 non-producing weekly inspections); WELL-0449: 14 days (2 non-producing weekly inspections); WELL-0450: 7 days (1 non-producing weekly inspections); WELL-0451: 21 days (3 non-producing weekly inspections); WELL-0452: 14 days (2 non-producing weekly inspections); WELL-0453: 7 days (1 non-producing weekly inspections); WELL-0454: 28 days (4 non-producing weekly inspections); WELL-0455: 56 days (8 non-producing weekly inspections); WELL-0456: 56 days (8 non-producing weekly inspections); WELL-0457: 7 days (1 non-producing weekly inspections); WELL-0458: 21 days (3 non-producing weekly inspections); WELL-0459: 70 days (10 non-producing weekly inspections); WELL-0460: 28 days (4 non-producing weekly inspections); WELL-0461: 21 days (3 non-producing weekly inspections); WELL-0462: 7 days (1 non-producing weekly inspections); WELL-0463: 28 days (4 non-producing weekly inspections); WELL-0464: 42 days (6 non-producing weekly inspections); WELL-0465: 0 days (0 non-producing weekly inspections); WELL-0466: 70 days (10 non-producing weekly inspections); WELL-0467: 7 days (1 non-producing weekly inspections); WELL-0468: 0 days (0 non-producing weekly inspections); WELL-0469: 14 days (2 non-producing weekly inspections); WELL-0470: 0 days (0 non-producing weekly inspections); WELL-0471: 28 days (4 non-producing weekly inspections); WELL-0472: 14 days (2 non-producing weekly inspections); WELL-0473: 0 days (0 non-producing weekly inspections); WELL-0474: 21 days (3 non-producing weekly inspections); WELL-0475: 63 days (9 non-producing weekly inspections); WELL-0476: 0 days (0 non-producing weekly inspections); WELL-0477: 14 days (2 non-producing weekly inspections); WELL-0478: 14 days (2 non-producing weekly inspections); WELL-0479: 0 days (0 non-producing weekly inspections); WELL-0480: 0 days (0 non-producing weekly inspections); WELL-0481: 21 days (3 non-producing weekly inspections); WELL-0482: 0 days (0 non-producing weekly inspections); WELL-0483: 14 days (2 non-producing weekly inspections); WELL-0484: 42 days (6 non-producing weekly inspections); WELL-0485: 7 days (1 non-producing weekly inspections); WELL-0486: 63 days (9 non-producing weekly inspections); WELL-0487: 28 days (4 non-producing weekly inspections); WELL-0488: 35 days (5 non-producing weekly inspections); WELL-0489: 35 days (5 non-producing weekly inspections); WELL-0490: 0 days (0 non-producing weekly inspections); WELL-0491: 42 days (6 non-producing weekly inspections); WELL-0492: 21 days (3 non-producing weekly inspections); WELL-0493: 0 days (0 non-producing weekly inspections); WELL-0494: 0 days (0 non-producing weekly inspections); WELL-0495: 0 days (0 non-producing weekly inspections); WELL-0496: 112 days (16 non-producing weekly inspections); WELL-0497: 0 days (0 non-producing weekly inspections); WELL-0498: 49 days (7 non-producing weekly inspections); WELL-0499: 49 days (7 non-producing weekly inspections); WELL-0500: 35 days (5 non-producing weekly inspections); WELL-0501: 14 days (2 non-producing weekly inspections); WELL-0502: 14 days (2 non-producing weekly inspections); WELL-0503: 0 days (0 non-producing weekly inspections); WELL-0504: 14 days (2 non-producing weekly inspections); WELL-0505: 35 days (5 non-producing weekly inspections); WELL-0506: 49 days (7 non-producing weekly inspections); WELL-0507: 14 days (2 non-producing weekly inspections); WELL-0508: 0 days (0 non-producing weekly inspections); WELL-0509: 21 days (3 non-producing weekly inspections); WELL-0510: 56 days (8 non-producing weekly inspections); WELL-0511: 21 days (3 non-producing weekly inspections); WELL-0512: 14 days (2 non-producing weekly inspections); WELL-0513: 7 days (1 non-producing weekly inspections); WELL-0514: 7 days (1 non-producing weekly inspections); WELL-0515: 21 days (3 non-producing weekly inspections); WELL-0516: 0 days (0 non-producing weekly inspections); WELL-0517: 28 days (4 non-producing weekly inspections); WELL-0518: 7 days (1 non-producing weekly inspections); WELL-0519: 21 days (3 non-producing weekly inspections); WELL-0520: 42 days (6 non-producing weekly inspections); WELL-0521: 14 days (2 non-producing weekly inspections); WELL-0522: 0 days (0 non-producing weekly inspections); WELL-0523: 0 days (0 non-producing weekly inspections); WELL-0524: 21 days (3 non-producing weekly inspections); WELL-0525: 0 days (0 non-producing weekly inspections); WELL-0526: 14 days (2 non-producing weekly inspections); WELL-0527: 0 days (0 non-producing weekly inspections); WELL-0528: 7 days (1 non-producing weekly inspections); WELL-0529: 28 days (4 non-producing weekly inspections); WELL-0530: 0 days (0 non-producing weekly inspections); WELL-0531: 21 days (3 non-producing weekly inspections); WELL-0532: 7 days (1 non-producing weekly inspections); WELL-0533: 0 days (0 non-producing weekly inspections); WELL-0534: 21 days (3 non-producing weekly inspections); WELL-0535: 7 days (1 non-producing weekly inspections); WELL-0536: 0 days (0 non-producing weekly inspections); WELL-0537: 0 days (0 non-producing weekly inspections); WELL-0538: 28 days (4 non-producing weekly inspections); WELL-0539: 0 days (0 non-producing weekly inspections); WELL-0540: 0 days (0 non-producing weekly inspections); WELL-0541: 0 days (0 non-producing weekly inspections); WELL-0542: 0 days (0 non-producing weekly inspections); WELL-0543: 7 days (1 non-producing weekly inspections); WELL-0544: 21 days (3 non-producing weekly inspections); WELL-0545: 14 days (2 non-producing weekly inspections); WELL-0546: 56 days (8 non-producing weekly inspections); WELL-0547: 0 days (0 non-producing weekly inspections); WELL-0548: 35 days (5 non-producing weekly inspections); WELL-0549: 0 days (0 non-producing weekly inspections); WELL-0550: 0 days (0 non-producing weekly inspections); WELL-0551: 0 days (0 non-producing weekly inspections); WELL-0552: 28 days (4 non-producing weekly inspections); WELL-0553: 0 days (0 non-producing weekly inspections); WELL-0554: 14 days (2 non-producing weekly inspections); WELL-0555: 7 days (1 non-producing weekly inspections); WELL-0556: 28 days (4 non-producing weekly inspections); WELL-0557: 7 days (1 non-producing weekly inspections); WELL-0558: 7 days (1 non-producing weekly inspections); WELL-0559: 14 days (2 non-producing weekly inspections); WELL-0560: 0 days (0 non-producing weekly inspections); WELL-0561: 21 days (3 non-producing weekly inspections); WELL-0562: 21 days (3 non-producing weekly inspections); WELL-0563: 0 days (0 non-producing weekly inspections); WELL-0564: 0 days (0 non-producing weekly inspections); WELL-0565: 0 days (0 non-producing weekly inspections); WELL-0566: 7 days (1 non-producing weekly inspections); WELL-0567: 28 days (4 non-producing weekly inspections); WELL-0568: 14 days (2 non-producing weekly inspections); WELL-0569: 14 days (2 non-producing weekly inspections); WELL-0570: 0 days (0 non-producing weekly inspections); WELL-0571: 7 days (1 non-producing weekly inspections); WELL-0572: 0 days (0 non-producing weekly inspections); WELL-0573: 0 days (0 non-producing weekly inspections); WELL-0574: 7 days (1 non-producing weekly inspections); WELL-0575: 28 days (4 non-producing weekly inspections); WELL-0576: 63 days (9 non-producing weekly inspections); WELL-0577: 56 days (8 non-producing weekly inspections); WELL-0578: 21 days (3 non-producing weekly inspections); WELL-0579: 35 days (5 non-producing weekly inspections); WELL-0580: 14 days (2 non-producing weekly inspections); WELL-0581: 21 days (3 non-producing weekly inspections); WELL-0582: 0 days (0 non-producing weekly inspections); WELL-0583: 21 days (3 non-producing weekly inspections); WELL-0584: 0 days (0 non-producing weekly inspections); WELL-0585: 0 days (0 non-producing weekly inspections); WELL-0586: 0 days (0 non-producing weekly inspections); WELL-0587: 42 days (6 non-producing weekly inspections); WELL-0588: 56 days (8 non-producing weekly inspections); WELL-0589: 14 days (2 non-producing weekly inspections); WELL-0590: 84 days (12 non-producing weekly inspections); WELL-0591: 0 days (0 non-producing weekly inspections); WELL-0592: 56 days (8 non-producing weekly inspections); WELL-0593: 28 days (4 non-producing weekly inspections); WELL-0594: 0 days (0 non-producing weekly inspections); WELL-0595: 35 days (5 non-producing weekly inspections); WELL-0596: 0 days (0 non-producing weekly inspections); WELL-0597: 21 days (3 non-producing weekly inspections); WELL-0598: 14 days (2 non-producing weekly inspections); WELL-0599: 28 days (4 non-producing weekly inspections); WELL-0600: 14 days (2 non-producing weekly inspections). Window Jan 1, 2026 through Dec 31, 2026. Each non-producing inspection counts as 7 days; missed inspections contribute no downtime. May 7, 2026: 1.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0001-028). Oct 8, 2026: 3.2 °C above ambient; Pump jack not moving.. Oct 15, 2026: 3.2 °C above ambient; Pump jack not moving.. Nov 5, 2026: 5.4 °C above ambient; Prime mover failure (MNT-0001-033). Sep 3, 2026: -0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0002-018). Sep 10, 2026: 1.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0002-018). Sep 17, 2026: 4 °C above ambient; Flowline corrosion pinhole leak (MNT-0002-018). Sep 24, 2026: 3.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0002-018). Oct 1, 2026: 2.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0002-018). Oct 8, 2026: 4.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0002-018). Dec 24, 2026: 1.9 °C above ambient; Downhole pump stuck (MNT-0002-020). Dec 31, 2026: -0.6 °C above ambient; Downhole pump stuck (MNT-0002-020). Feb 19, 2026: 10.2 °C above ambient; Walking beam bearing wear (MNT-0004-021). Feb 26, 2026: 5.1 °C above ambient; Walking beam bearing wear (MNT-0004-021). Mar 5, 2026: 8.4 °C above ambient; Walking beam bearing wear (MNT-0004-021). Mar 12, 2026: 0 °C above ambient; Walking beam bearing wear (MNT-0004-021). Jul 16, 2026: 10.3 °C above ambient; Prime mover failure (MNT-0004-026). Jul 23, 2026: 7.3 °C above ambient; Prime mover failure (MNT-0004-026). Jun 18, 2026: 8.1 °C above ambient; Prime mover failure (MNT-0005-031). Jun 25, 2026: 7.8 °C above ambient; Prime mover failure (MNT-0005-031). Jul 2, 2026: 9.8 °C above ambient; Prime mover failure (MNT-0005-031). Jul 9, 2026: 10.3 °C above ambient; Prime mover failure (MNT-0005-031). Jul 16, 2026: 10.8 °C above ambient; Prime mover failure (MNT-0005-031). Jul 23, 2026: 2 °C above ambient; Prime mover failure (MNT-0005-031). Feb 19, 2026: 0.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0006-023). Apr 2, 2026: 0.1 °C above ambient; Prime mover failure (MNT-0006-025). Apr 9, 2026: 0 °C above ambient; Prime mover failure (MNT-0006-025). Apr 23, 2026: 5.1 °C above ambient; Stuffing box packing leak (MNT-0006-026). Dec 24, 2026: 10.5 °C above ambient; Gearbox oil leak (MNT-0007-031). Dec 31, 2026: -0.3 °C above ambient; Gearbox oil leak (MNT-0007-031). May 7, 2026: 0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0009-026). May 14, 2026: 2.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0009-026). Feb 19, 2026: 3.4 °C above ambient; Separator level controller fault (MNT-0010-024). May 7, 2026: 5.6 °C above ambient; Prime mover failure (MNT-0010-027). Jun 4, 2026: 19.1 °C above ambient; . Jul 23, 2026: 19.8 °C above ambient; . Sep 3, 2026: 19.6 °C above ambient; . Sep 17, 2026: 19.6 °C above ambient; . Oct 29, 2026: 19.5 °C above ambient; . Nov 19, 2026: 2.4 °C above ambient; Workover rig on location.. Dec 10, 2026: 8.1 °C above ambient; Downhole pump stuck (MNT-0012-029). Jul 23, 2026: 4.3 °C above ambient; Sucker rod parted (MNT-0013-034). Sep 17, 2026: 5.8 °C above ambient; Prime mover failure (MNT-0013-036). Oct 15, 2026: 1.2 °C above ambient; Prime mover failure (MNT-0013-037). Oct 22, 2026: 6 °C above ambient; Prime mover failure (MNT-0013-037). Dec 17, 2026: 4.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0013-038). Dec 24, 2026: 5.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0013-038). Dec 31, 2026: 2 °C above ambient; Flowline corrosion pinhole leak (MNT-0013-038). Jul 23, 2026: 10.4 °C above ambient; Prime mover failure (MNT-0014-015). Mar 12, 2026: 5.1 °C above ambient; Gearbox oil leak (MNT-0015-030). Mar 19, 2026: 5.5 °C above ambient; Gearbox oil leak (MNT-0015-030). Mar 26, 2026: 5.1 °C above ambient; Gearbox oil leak (MNT-0015-030). Apr 2, 2026: 3.5 °C above ambient; Gearbox oil leak (MNT-0015-030). Apr 9, 2026: 5.1 °C above ambient; Gearbox oil leak (MNT-0015-030). Apr 16, 2026: 2.8 °C above ambient; Gearbox oil leak (MNT-0015-030). Apr 30, 2026: 3.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0015-032). May 7, 2026: 6 °C above ambient; Flowline corrosion pinhole leak (MNT-0015-032). Sep 3, 2026: 1.5 °C above ambient; Gearbox oil leak (MNT-0015-036). Dec 10, 2026: 4.7 °C above ambient; Walking beam bearing wear (MNT-0018-028). Dec 17, 2026: 0.8 °C above ambient; Walking beam bearing wear (MNT-0018-028). Dec 24, 2026: 5.8 °C above ambient; Walking beam bearing wear (MNT-0018-028). Dec 31, 2026: -0.4 °C above ambient; Walking beam bearing wear (MNT-0018-028). Jan 1, 2026: 4.6 °C above ambient; Sucker rod parted (MNT-0019-025). Jan 8, 2026: 2.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0019-026). Jan 15, 2026: 0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0019-026). Dec 17, 2026: 1.6 °C above ambient; Downhole pump stuck (MNT-0019-032). Mar 5, 2026: -0.7 °C above ambient; Gearbox oil leak (MNT-0020-030). Aug 13, 2026: 3.8 °C above ambient; Walking beam bearing wear (MNT-0020-034). Aug 20, 2026: 0.9 °C above ambient; Walking beam bearing wear (MNT-0020-034). Aug 27, 2026: 0.2 °C above ambient; Walking beam bearing wear (MNT-0020-034). Sep 3, 2026: 5 °C above ambient; Walking beam bearing wear (MNT-0020-034). Feb 5, 2026: 9.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0021-027). Feb 12, 2026: 4.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0021-027). Feb 19, 2026: 7.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0021-027). Feb 26, 2026: 10.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0021-027). Jul 2, 2026: 2.6 °C above ambient; Gearbox oil leak (MNT-0021-032). Dec 31, 2026: 7.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0021-036). Mar 5, 2026: 3.5 °C above ambient; Prime mover failure (MNT-0023-025). Sep 3, 2026: 1.5 °C above ambient; Walking beam bearing wear (MNT-0023-030). Sep 10, 2026: 1.9 °C above ambient; Walking beam bearing wear (MNT-0023-030). Sep 17, 2026: 0.3 °C above ambient; Walking beam bearing wear (MNT-0023-030). Dec 3, 2026: 4.7 °C above ambient; Sucker rod parted (MNT-0023-033). Mar 26, 2026: 6.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0025-030). May 28, 2026: 2.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0025-032). Jun 4, 2026: 8.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0025-032). Jun 11, 2026: 0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0025-032). Nov 26, 2026: 4.5 °C above ambient; Walking beam bearing wear (MNT-0025-035). Dec 3, 2026: 2.9 °C above ambient; Walking beam bearing wear (MNT-0025-035). Aug 27, 2026: 5.4 °C above ambient; Prime mover failure (MNT-0026-031). Sep 3, 2026: 0.2 °C above ambient; Prime mover failure (MNT-0026-031). Dec 31, 2026: -0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0026-034). Mar 26, 2026: 10.2 °C above ambient; Walking beam bearing wear (MNT-0028-028). Feb 26, 2026: 5.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0030-028). Mar 5, 2026: 1.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0030-028). Mar 26, 2026: 5.5 °C above ambient; Stuffing box packing leak (MNT-0031-026). Apr 2, 2026: 1.6 °C above ambient; Stuffing box packing leak (MNT-0031-026). Apr 9, 2026: 2.7 °C above ambient; Stuffing box packing leak (MNT-0031-026). Apr 16, 2026: -0.4 °C above ambient; Stuffing box packing leak (MNT-0031-026). Apr 23, 2026: 0.5 °C above ambient; Downhole pump stuck (MNT-0031-027). Apr 30, 2026: 3 °C above ambient; Downhole pump stuck (MNT-0031-027). May 7, 2026: -0.5 °C above ambient; Gearbox oil leak (MNT-0031-028). May 14, 2026: 5.2 °C above ambient; Gearbox oil leak (MNT-0031-028). May 21, 2026: 4.4 °C above ambient; Gearbox oil leak (MNT-0031-028). May 28, 2026: 0.7 °C above ambient; Gearbox oil leak (MNT-0031-028). Dec 31, 2026: 4.8 °C above ambient; Stuffing box packing leak (MNT-0031-033). Jan 1, 2026: 7.6 °C above ambient; Prime mover failure (MNT-0032-021). Jan 8, 2026: 9.6 °C above ambient; Prime mover failure (MNT-0032-021). Jan 15, 2026: 5.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0033-022). Jan 22, 2026: 10.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0033-022). Feb 26, 2026: 8.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0033-024). Mar 5, 2026: 9.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0033-024). May 28, 2026: 2.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0033-026). Oct 1, 2026: 0.9 °C above ambient; Gearbox oil leak (MNT-0033-030). Oct 8, 2026: 7.5 °C above ambient; Gearbox oil leak (MNT-0033-030). Dec 3, 2026: 7 °C above ambient; Separator level controller fault (MNT-0033-031). Dec 10, 2026: 5.9 °C above ambient; Separator level controller fault (MNT-0033-031). Jan 1, 2026: 1.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0035-024). Jun 11, 2026: -0.5 °C above ambient; Prime mover failure (MNT-0035-027). Jun 18, 2026: 5.5 °C above ambient; Prime mover failure (MNT-0035-027). Feb 12, 2026: -0.4 °C above ambient; Stuffing box packing leak (MNT-0036-022). Feb 19, 2026: 1 °C above ambient; Stuffing box packing leak (MNT-0036-022). Feb 26, 2026: 4.8 °C above ambient; Stuffing box packing leak (MNT-0036-022). Mar 5, 2026: 0.4 °C above ambient; Stuffing box packing leak (MNT-0036-022). Dec 31, 2026: 4.5 °C above ambient; Separator level controller fault (MNT-0037-032). Sep 3, 2026: 2.7 °C above ambient; Prime mover failure (MNT-0038-029). Jun 25, 2026: 1.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0039-024). Jul 2, 2026: 0.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0039-024). Jul 9, 2026: 3.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0039-024). Jul 16, 2026: 3.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0039-024). Mar 12, 2026: 5.3 °C above ambient; Stuffing box packing leak (MNT-0040-024). Apr 2, 2026: 0.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0040-025). Apr 9, 2026: 4 °C above ambient; Flowline corrosion pinhole leak (MNT-0040-025). Jan 8, 2026: 10.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0041-029). Apr 30, 2026: 6.6 °C above ambient; Walking beam bearing wear (MNT-0041-031). May 7, 2026: 10.8 °C above ambient; Walking beam bearing wear (MNT-0041-031). May 14, 2026: 6.4 °C above ambient; Walking beam bearing wear (MNT-0041-031). Jul 30, 2026: 4.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0041-034). Aug 6, 2026: 4 °C above ambient; Flowline corrosion pinhole leak (MNT-0041-034). Aug 13, 2026: -0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0041-034). Mar 19, 2026: -0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0042-020). Nov 5, 2026: 2.8 °C above ambient; Walking beam bearing wear (MNT-0042-027). Nov 12, 2026: 0.7 °C above ambient; Walking beam bearing wear (MNT-0042-027). Nov 19, 2026: 2.3 °C above ambient; Walking beam bearing wear (MNT-0042-027). Nov 26, 2026: 2.4 °C above ambient; Walking beam bearing wear (MNT-0042-027). Apr 30, 2026: 2.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0043-029). Feb 12, 2026: 2 °C above ambient; Prime mover failure (MNT-0045-027). Feb 19, 2026: 4.9 °C above ambient; Prime mover failure (MNT-0045-027). Feb 26, 2026: 8.5 °C above ambient; Prime mover failure (MNT-0045-027). Dec 31, 2026: 5.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0045-034). Dec 17, 2026: 1.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0046-027). Dec 31, 2026: 5.1 °C above ambient; Stuffing box packing leak (MNT-0046-028). Aug 20, 2026: 0 °C above ambient; Downhole pump stuck (MNT-0047-025). Aug 27, 2026: -0.3 °C above ambient; Downhole pump stuck (MNT-0047-025). Aug 13, 2026: 2.3 °C above ambient; Prime mover failure (MNT-0048-028). Jul 23, 2026: 2.7 °C above ambient; Sucker rod parted (MNT-0054-028). Nov 26, 2026: 8.4 °C above ambient; Sucker rod parted (MNT-0054-030). Dec 3, 2026: 2.9 °C above ambient; Sucker rod parted (MNT-0054-030). Dec 10, 2026: 4.3 °C above ambient; Sucker rod parted (MNT-0054-030). Apr 30, 2026: 1.8 °C above ambient; Walking beam bearing wear (MNT-0055-026). May 7, 2026: 10.1 °C above ambient; Walking beam bearing wear (MNT-0055-026). Dec 24, 2026: 8.2 °C above ambient; Separator level controller fault (MNT-0056-032). Dec 31, 2026: 9.6 °C above ambient; Separator level controller fault (MNT-0056-032). Apr 9, 2026: 1.6 °C above ambient; Sucker rod parted (MNT-0057-023). Apr 16, 2026: -1 °C above ambient; Sucker rod parted (MNT-0057-023). Apr 23, 2026: 1.5 °C above ambient; Sucker rod parted (MNT-0057-023). Apr 30, 2026: 1.5 °C above ambient; Sucker rod parted (MNT-0057-023). Feb 19, 2026: -0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0058-027). Jul 30, 2026: 4 °C above ambient; Stuffing box packing leak (MNT-0058-031). Aug 6, 2026: 2.5 °C above ambient; Stuffing box packing leak (MNT-0058-031). Aug 13, 2026: 5.7 °C above ambient; Stuffing box packing leak (MNT-0058-031). Oct 15, 2026: 4.9 °C above ambient; No stroke observed during flight.. Dec 24, 2026: 5.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0060-036). Dec 31, 2026: 0.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0060-036). Mar 5, 2026: 3.3 °C above ambient; Sucker rod parted (MNT-0061-025). Mar 12, 2026: 3 °C above ambient; Sucker rod parted (MNT-0061-025). Mar 19, 2026: 3.8 °C above ambient; Sucker rod parted (MNT-0061-025). Mar 26, 2026: 4.8 °C above ambient; Sucker rod parted (MNT-0061-025). Apr 2, 2026: 3.4 °C above ambient; Sucker rod parted (MNT-0061-025). Apr 9, 2026: 4.8 °C above ambient; Sucker rod parted (MNT-0061-025). Sep 3, 2026: 5.3 °C above ambient; Sucker rod parted (MNT-0061-028). Sep 10, 2026: 5.4 °C above ambient; Sucker rod parted (MNT-0061-028). Sep 17, 2026: 3.7 °C above ambient; Sucker rod parted (MNT-0061-028). Sep 24, 2026: 3.4 °C above ambient; Sucker rod parted (MNT-0061-028). Dec 10, 2026: 4 °C above ambient; Sucker rod parted (MNT-0061-031). Dec 17, 2026: 1.6 °C above ambient; Sucker rod parted (MNT-0061-031). Jun 4, 2026: 1.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0062-025). Jun 11, 2026: 4.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0062-025). Jun 18, 2026: 4 °C above ambient; Flowline corrosion pinhole leak (MNT-0062-025). Nov 12, 2026: 4.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0062-029). May 21, 2026: 0.3 °C above ambient; Downhole pump stuck (MNT-0063-030). May 28, 2026: 9.6 °C above ambient; Downhole pump stuck (MNT-0063-030). Jul 9, 2026: -0.2 °C above ambient; Prime mover failure (MNT-0063-031). Jul 16, 2026: 7 °C above ambient; Prime mover failure (MNT-0063-031). May 28, 2026: 2.9 °C above ambient; Sucker rod parted (MNT-0064-027). Feb 26, 2026: 1.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0065-022). Mar 5, 2026: 2.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0065-022). Apr 16, 2026: 8.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0065-024). Apr 23, 2026: 7.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0065-024). May 7, 2026: 6.6 °C above ambient; Sucker rod parted (MNT-0065-025). May 14, 2026: 9.6 °C above ambient; Sucker rod parted (MNT-0065-025). May 21, 2026: 6 °C above ambient; Walking beam bearing wear (MNT-0065-026). May 28, 2026: 5.3 °C above ambient; Walking beam bearing wear (MNT-0065-026). Apr 23, 2026: 3.4 °C above ambient; Stuffing box packing leak (MNT-0066-031). Oct 15, 2026: 1.3 °C above ambient; . Dec 31, 2026: 6 °C above ambient; Prime mover failure (MNT-0066-034). Oct 1, 2026: 1.4 °C above ambient; Walking beam bearing wear (MNT-0068-021). Apr 2, 2026: 1.7 °C above ambient; Prime mover failure (MNT-0069-032). Jun 11, 2026: 3.4 °C above ambient; Prime mover failure (MNT-0069-034). Jun 18, 2026: 1.9 °C above ambient; Prime mover failure (MNT-0069-034). Jun 25, 2026: -0.5 °C above ambient; Downhole pump stuck (MNT-0069-035). Jul 2, 2026: 1.6 °C above ambient; Downhole pump stuck (MNT-0069-035). Jul 9, 2026: -0.7 °C above ambient; Downhole pump stuck (MNT-0069-035). Jul 16, 2026: 5.8 °C above ambient; Downhole pump stuck (MNT-0069-035). Jan 8, 2026: 1.7 °C above ambient; Gearbox oil leak (MNT-0070-027). Jan 15, 2026: 1.2 °C above ambient; Gearbox oil leak (MNT-0070-027). Feb 26, 2026: 4.2 °C above ambient; Walking beam bearing wear (MNT-0071-032). Sep 10, 2026: -1 °C above ambient; Walking beam bearing wear (MNT-0071-038). Sep 17, 2026: 4.3 °C above ambient; Walking beam bearing wear (MNT-0071-038). Sep 24, 2026: 1.4 °C above ambient; Walking beam bearing wear (MNT-0071-038). Oct 1, 2026: 5.6 °C above ambient; Walking beam bearing wear (MNT-0071-038). Aug 6, 2026: -0.9 °C above ambient; Gearbox oil leak (MNT-0072-029). Aug 13, 2026: 0.7 °C above ambient; Gearbox oil leak (MNT-0072-029). Aug 20, 2026: 5.7 °C above ambient; Gearbox oil leak (MNT-0072-029). Jul 16, 2026: 7.4 °C above ambient; Stuffing box packing leak (MNT-0073-027). Dec 10, 2026: 2.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0074-038). Jan 1, 2026: 5.8 °C above ambient; Gearbox oil leak (MNT-0075-026). Jan 8, 2026: 1.4 °C above ambient; Gearbox oil leak (MNT-0075-026). Jan 15, 2026: 8.1 °C above ambient; Gearbox oil leak (MNT-0075-026). Feb 19, 2026: 0.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0075-028). Feb 26, 2026: 8.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0075-028). Jan 8, 2026: 2.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0077-019). Jun 11, 2026: -0.4 °C above ambient; Separator level controller fault (MNT-0077-022). Nov 12, 2026: 5.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0077-027). Nov 19, 2026: 3.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0077-027). Nov 26, 2026: 0.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0077-027). Feb 5, 2026: -0.1 °C above ambient; Gearbox oil leak (MNT-0078-022). Feb 12, 2026: 0.1 °C above ambient; Gearbox oil leak (MNT-0078-022). Feb 19, 2026: 4.7 °C above ambient; Gearbox oil leak (MNT-0078-022). Jun 25, 2026: 3.2 °C above ambient; Gearbox oil leak (MNT-0078-026). Jul 2, 2026: -1 °C above ambient; Gearbox oil leak (MNT-0078-026). Jul 9, 2026: 1.6 °C above ambient; Gearbox oil leak (MNT-0078-026). May 21, 2026: 8 °C above ambient; Walking beam bearing wear (MNT-0079-032). May 28, 2026: 6.8 °C above ambient; Walking beam bearing wear (MNT-0079-032). Oct 15, 2026: 4 °C above ambient; Prime mover failure (MNT-0079-036). Oct 22, 2026: 7 °C above ambient; Prime mover failure (MNT-0079-036). Oct 29, 2026: 10.2 °C above ambient; Prime mover failure (MNT-0079-036). Jul 23, 2026: -0.8 °C above ambient; Prime mover failure (MNT-0080-025). Jul 30, 2026: 2.2 °C above ambient; Prime mover failure (MNT-0080-025). Aug 6, 2026: -0.3 °C above ambient; Prime mover failure (MNT-0080-025). Aug 13, 2026: 3.2 °C above ambient; Prime mover failure (MNT-0080-025). Feb 19, 2026: 3 °C above ambient; Stuffing box packing leak (MNT-0084-025). Feb 26, 2026: -0.6 °C above ambient; Stuffing box packing leak (MNT-0084-025). Mar 19, 2026: 3.3 °C above ambient; Gearbox oil leak (MNT-0084-027). Aug 20, 2026: 1.9 °C above ambient; Separator level controller fault (MNT-0084-031). Aug 27, 2026: 0.8 °C above ambient; Separator level controller fault (MNT-0084-031). Sep 3, 2026: 3.6 °C above ambient; Separator level controller fault (MNT-0084-031). Sep 17, 2026: 4.6 °C above ambient; Gearbox oil leak (MNT-0084-032). Sep 24, 2026: 5.1 °C above ambient; Gearbox oil leak (MNT-0084-032). Oct 1, 2026: 4.8 °C above ambient; Gearbox oil leak (MNT-0084-032). Feb 12, 2026: 4.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0085-022). Feb 19, 2026: 5 °C above ambient; Stuffing box packing leak (MNT-0085-024). May 21, 2026: 2.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0085-027). May 28, 2026: 4.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0085-027). Sep 3, 2026: -0.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0085-031). Sep 10, 2026: 4.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0085-031). Sep 17, 2026: 3.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0085-031). Aug 20, 2026: 3.8 °C above ambient; Downhole pump stuck (MNT-0087-027). Jul 2, 2026: 8.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0088-031). Jul 9, 2026: -0.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0088-031). Jan 22, 2026: 5.4 °C above ambient; Walking beam bearing wear (MNT-0089-025). Jan 29, 2026: 5.6 °C above ambient; Walking beam bearing wear (MNT-0089-025). Nov 12, 2026: -0.9 °C above ambient; Sucker rod parted (MNT-0089-031). Nov 19, 2026: 1.5 °C above ambient; Sucker rod parted (MNT-0089-031). Dec 3, 2026: 3.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0089-032). Dec 10, 2026: 2.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0089-032). Feb 26, 2026: 4.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0090-030). Mar 5, 2026: 0.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0090-030). Mar 12, 2026: 8 °C above ambient; Flowline corrosion pinhole leak (MNT-0090-030). Mar 19, 2026: 3.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0090-030). Apr 2, 2026: 0.5 °C above ambient; Downhole pump stuck (MNT-0092-026). Apr 9, 2026: 0 °C above ambient; Downhole pump stuck (MNT-0092-026). Apr 23, 2026: 5.1 °C above ambient; Downhole pump stuck (MNT-0092-026). May 14, 2026: 5.8 °C above ambient; Downhole pump stuck (MNT-0092-027). Dec 17, 2026: 0.4 °C above ambient; Downhole pump stuck (MNT-0092-033). Dec 24, 2026: 0.3 °C above ambient; Downhole pump stuck (MNT-0092-033). Dec 31, 2026: 5.6 °C above ambient; Downhole pump stuck (MNT-0092-033). Sep 10, 2026: 5.7 °C above ambient; Prime mover failure (MNT-0093-032). Sep 17, 2026: 0 °C above ambient; Prime mover failure (MNT-0093-032). Sep 24, 2026: 0.2 °C above ambient; Prime mover failure (MNT-0093-032). Oct 1, 2026: 1.4 °C above ambient; Prime mover failure (MNT-0093-032). Jan 1, 2026: 3.7 °C above ambient; Prime mover failure (MNT-0095-021). Jan 8, 2026: 1.7 °C above ambient; Prime mover failure (MNT-0095-021). Nov 5, 2026: 0.5 °C above ambient; Gearbox oil leak (MNT-0096-037). Nov 12, 2026: 1.4 °C above ambient; Gearbox oil leak (MNT-0096-037). Aug 13, 2026: 5.4 °C above ambient; Prime mover failure (MNT-0097-032). Aug 20, 2026: -0.8 °C above ambient; Prime mover failure (MNT-0097-032). Aug 27, 2026: 6.8 °C above ambient; Prime mover failure (MNT-0097-032). Mar 19, 2026: 5.6 °C above ambient; Prime mover failure (MNT-0100-031). Mar 26, 2026: 0.3 °C above ambient; Prime mover failure (MNT-0100-031). Oct 15, 2026: 1.4 °C above ambient; . Feb 26, 2026: 3.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0102-027). Mar 5, 2026: 1 °C above ambient; Flowline corrosion pinhole leak (MNT-0102-027). May 21, 2026: 1.2 °C above ambient; Gearbox oil leak (MNT-0102-030). Jan 15, 2026: 7.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0103-025). Jan 22, 2026: 5.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0103-025). Jan 29, 2026: 8.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0103-025). Feb 5, 2026: 1.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0103-025). Sep 10, 2026: 3 °C above ambient; Walking beam bearing wear (MNT-0103-031). Sep 17, 2026: 4.8 °C above ambient; Walking beam bearing wear (MNT-0103-031). Jul 2, 2026: 1.6 °C above ambient; Stuffing box packing leak (MNT-0107-028). Jul 9, 2026: 6.5 °C above ambient; Stuffing box packing leak (MNT-0107-028). Jul 16, 2026: 9.2 °C above ambient; Stuffing box packing leak (MNT-0107-028). Jul 23, 2026: 3.7 °C above ambient; Stuffing box packing leak (MNT-0107-028). Jul 30, 2026: 3.4 °C above ambient; Stuffing box packing leak (MNT-0107-028). Aug 6, 2026: 9.9 °C above ambient; Stuffing box packing leak (MNT-0107-028). Mar 5, 2026: 2.3 °C above ambient; Prime mover failure (MNT-0108-024). Mar 12, 2026: 9.6 °C above ambient; Prime mover failure (MNT-0108-024). Apr 16, 2026: -0.1 °C above ambient; Walking beam bearing wear (MNT-0108-026). Apr 23, 2026: 3 °C above ambient; Walking beam bearing wear (MNT-0108-026). Apr 30, 2026: 7.9 °C above ambient; Walking beam bearing wear (MNT-0108-026). May 7, 2026: 6.8 °C above ambient; Walking beam bearing wear (MNT-0108-026). May 14, 2026: 10.4 °C above ambient; Walking beam bearing wear (MNT-0108-026). May 21, 2026: 6.2 °C above ambient; Walking beam bearing wear (MNT-0108-026). Jun 25, 2026: -0.5 °C above ambient; Prime mover failure (MNT-0108-028). Sep 17, 2026: 8.6 °C above ambient; Sucker rod parted (MNT-0109-022). Nov 19, 2026: 8.1 °C above ambient; Gearbox oil leak (MNT-0109-023). Nov 26, 2026: 2 °C above ambient; Gearbox oil leak (MNT-0109-023). Jul 9, 2026: 5.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0110-028). Jul 16, 2026: 4.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0110-028). Oct 15, 2026: 0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0110-030). Oct 22, 2026: -0.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0110-030). Jun 18, 2026: 3.2 °C above ambient; Walking beam bearing wear (MNT-0111-028). Jun 25, 2026: 1.3 °C above ambient; Walking beam bearing wear (MNT-0111-028). Jul 23, 2026: 1.9 °C above ambient; Stuffing box packing leak (MNT-0112-028). Dec 3, 2026: 5.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0113-033). Dec 10, 2026: 5.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0113-033). Dec 17, 2026: -0.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0113-033). Jun 18, 2026: 7.1 °C above ambient; Stuffing box packing leak (MNT-0114-023). Oct 1, 2026: 6.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0114-025). Dec 3, 2026: 7.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0114-028). Dec 10, 2026: 6 °C above ambient; Flowline corrosion pinhole leak (MNT-0114-028). Jun 25, 2026: 4.9 °C above ambient; Prime mover failure (MNT-0115-034). Oct 8, 2026: 4.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0115-037). Oct 15, 2026: 3.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0115-037). Oct 22, 2026: 1.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0115-037). Apr 23, 2026: 4.8 °C above ambient; Walking beam bearing wear (MNT-0116-012). Apr 30, 2026: 3.1 °C above ambient; Walking beam bearing wear (MNT-0116-012). May 7, 2026: 2.8 °C above ambient; Walking beam bearing wear (MNT-0116-012). May 14, 2026: 4.5 °C above ambient; Walking beam bearing wear (MNT-0116-012). Nov 19, 2026: 4.8 °C above ambient; Walking beam bearing wear (MNT-0116-016). Nov 26, 2026: 4 °C above ambient; Walking beam bearing wear (MNT-0116-016). Aug 13, 2026: 3.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0118-025). Aug 20, 2026: 2.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0118-025). Aug 27, 2026: 3.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0118-025). Aug 13, 2026: 5.2 °C above ambient; Downhole pump stuck (MNT-0119-027). Aug 20, 2026: -0.2 °C above ambient; Downhole pump stuck (MNT-0119-027). Aug 27, 2026: -0.8 °C above ambient; Downhole pump stuck (MNT-0119-027). Sep 3, 2026: 2.7 °C above ambient; Downhole pump stuck (MNT-0119-027). Aug 13, 2026: 0.7 °C above ambient; Walking beam bearing wear (MNT-0120-030). May 28, 2026: -0.3 °C above ambient; Gearbox oil leak (MNT-0121-031). Jun 4, 2026: 0 °C above ambient; Gearbox oil leak (MNT-0121-031). Jun 11, 2026: 3.4 °C above ambient; Gearbox oil leak (MNT-0121-031). Jun 18, 2026: 0.4 °C above ambient; Gearbox oil leak (MNT-0121-031). Sep 3, 2026: 0.6 °C above ambient; Prime mover failure (MNT-0121-034). Sep 10, 2026: 4.9 °C above ambient; Prime mover failure (MNT-0121-034). Sep 17, 2026: -0.8 °C above ambient; Prime mover failure (MNT-0121-034). Sep 24, 2026: 5.2 °C above ambient; Prime mover failure (MNT-0121-034). Oct 8, 2026: 3.5 °C above ambient; Prime mover failure (MNT-0121-035). Oct 15, 2026: 1 °C above ambient; Prime mover failure (MNT-0121-035). Oct 22, 2026: 5.1 °C above ambient; Prime mover failure (MNT-0121-035). Feb 26, 2026: 6.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0122-026). Mar 5, 2026: 3.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0122-026). Mar 12, 2026: 4.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0122-026). Mar 19, 2026: 0.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0122-026). Mar 5, 2026: 4.5 °C above ambient; Downhole pump stuck (MNT-0123-009). Mar 12, 2026: -0.4 °C above ambient; Downhole pump stuck (MNT-0123-009). Oct 8, 2026: 5.8 °C above ambient; Downhole pump stuck (MNT-0123-015). Oct 15, 2026: 0.3 °C above ambient; Downhole pump stuck (MNT-0123-015). Oct 22, 2026: 4.5 °C above ambient; Downhole pump stuck (MNT-0123-015). Jan 1, 2026: -0.2 °C above ambient; Prime mover failure (MNT-0124-022). May 7, 2026: 3.4 °C above ambient; Downhole pump stuck (MNT-0125-028). Jun 25, 2026: 8.1 °C above ambient; Stuffing box packing leak (MNT-0127-025). Jul 2, 2026: 4.1 °C above ambient; Stuffing box packing leak (MNT-0127-025). Jul 9, 2026: 5.2 °C above ambient; Stuffing box packing leak (MNT-0127-025). Mar 5, 2026: 2.8 °C above ambient; Stuffing box packing leak (MNT-0128-031). Mar 12, 2026: 10.8 °C above ambient; Stuffing box packing leak (MNT-0128-031). Mar 19, 2026: 6.1 °C above ambient; Stuffing box packing leak (MNT-0128-031). Mar 26, 2026: 9.6 °C above ambient; Stuffing box packing leak (MNT-0128-031). Oct 15, 2026: 5.5 °C above ambient; No stroke observed during flight.. Dec 17, 2026: 8.3 °C above ambient; Downhole pump stuck (MNT-0129-015). Dec 24, 2026: 4 °C above ambient; Downhole pump stuck (MNT-0129-015). Dec 31, 2026: 7.4 °C above ambient; Downhole pump stuck (MNT-0129-015). Feb 12, 2026: 1.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0131-018). Aug 27, 2026: 10.7 °C above ambient; Stuffing box packing leak (MNT-0132-027). Sep 3, 2026: 7.4 °C above ambient; Stuffing box packing leak (MNT-0132-027). Apr 23, 2026: 3.5 °C above ambient; Walking beam bearing wear (MNT-0133-020). Apr 30, 2026: 1.8 °C above ambient; Walking beam bearing wear (MNT-0133-020). May 7, 2026: 2.8 °C above ambient; Walking beam bearing wear (MNT-0133-020). May 14, 2026: 1.7 °C above ambient; Walking beam bearing wear (MNT-0133-020). Jul 23, 2026: 2.9 °C above ambient; Prime mover failure (MNT-0135-031). Jul 30, 2026: 1.5 °C above ambient; Prime mover failure (MNT-0135-031). Nov 12, 2026: -0.7 °C above ambient; Gearbox oil leak (MNT-0135-033). Dec 24, 2026: 4.7 °C above ambient; Prime mover failure (MNT-0135-034). Apr 2, 2026: 4.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0136-028). Apr 9, 2026: 3.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0136-028). Apr 16, 2026: 0.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0136-028). Nov 19, 2026: 2.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0136-032). Nov 26, 2026: 0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0136-032). Jul 16, 2026: 3.5 °C above ambient; Prime mover failure (MNT-0138-031). Jul 23, 2026: 2.5 °C above ambient; Prime mover failure (MNT-0138-031). Aug 20, 2026: 2 °C above ambient; Prime mover failure (MNT-0138-032). Aug 27, 2026: 8.1 °C above ambient; Prime mover failure (MNT-0138-032). Oct 1, 2026: 4.9 °C above ambient; Gearbox oil leak (MNT-0138-034). Oct 8, 2026: 8.1 °C above ambient; Gearbox oil leak (MNT-0138-034). Jan 8, 2026: 5.4 °C above ambient; Stuffing box packing leak (MNT-0140-021). Aug 20, 2026: -0.9 °C above ambient; Gearbox oil leak (MNT-0140-025). Aug 27, 2026: 0.6 °C above ambient; Gearbox oil leak (MNT-0140-025). Sep 3, 2026: 1 °C above ambient; Gearbox oil leak (MNT-0140-025). Jan 1, 2026: -0.2 °C above ambient; Prime mover failure (MNT-0143-020). Jan 8, 2026: 5.2 °C above ambient; Prime mover failure (MNT-0143-020). Apr 2, 2026: 3.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0143-022). Jan 1, 2026: 8.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0145-021). Jan 8, 2026: -0.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0145-021). Nov 5, 2026: 8 °C above ambient; Walking beam bearing wear (MNT-0149-029). Nov 12, 2026: 10.9 °C above ambient; Walking beam bearing wear (MNT-0149-029). Jun 25, 2026: 0.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0150-027). Aug 27, 2026: 4 °C above ambient; Walking beam bearing wear (MNT-0150-029). Sep 3, 2026: 3.3 °C above ambient; Walking beam bearing wear (MNT-0150-029). Aug 27, 2026: 8.7 °C above ambient; Sucker rod parted (MNT-0151-023). Sep 3, 2026: 5.2 °C above ambient; Sucker rod parted (MNT-0151-023). Oct 1, 2026: 5.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0151-026). Dec 3, 2026: 7.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0151-029). Dec 10, 2026: 5.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0151-029). Dec 17, 2026: 9.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0151-029). Dec 24, 2026: -0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0151-029). Dec 31, 2026: 3.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0151-029). Jul 23, 2026: -0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0152-026). Apr 30, 2026: -0.7 °C above ambient; Sucker rod parted (MNT-0154-027). Jul 9, 2026: 4.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0154-029). Dec 31, 2026: 3.3 °C above ambient; Downhole pump stuck (MNT-0155-029). Apr 16, 2026: 0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0156-024). Jun 25, 2026: -0.1 °C above ambient; Downhole pump stuck (MNT-0156-027). Nov 26, 2026: 5.1 °C above ambient; Stuffing box packing leak (MNT-0157-024). Dec 3, 2026: 5 °C above ambient; Stuffing box packing leak (MNT-0157-024). Dec 10, 2026: 7.2 °C above ambient; Stuffing box packing leak (MNT-0157-024). Mar 19, 2026: 6.8 °C above ambient; Prime mover failure (MNT-0159-025). Aug 20, 2026: 10.7 °C above ambient; Gearbox oil leak (MNT-0159-029). Aug 27, 2026: 6.1 °C above ambient; Gearbox oil leak (MNT-0159-029). Sep 3, 2026: 5.3 °C above ambient; Gearbox oil leak (MNT-0159-029). Dec 10, 2026: 0.9 °C above ambient; Prime mover failure (MNT-0159-031). Dec 17, 2026: 9.5 °C above ambient; Prime mover failure (MNT-0159-031). Dec 24, 2026: 2.9 °C above ambient; Prime mover failure (MNT-0159-031). Dec 31, 2026: 3.4 °C above ambient; Prime mover failure (MNT-0159-031). Jul 16, 2026: 0.8 °C above ambient; Downhole pump stuck (MNT-0160-028). Jul 23, 2026: 4.7 °C above ambient; Downhole pump stuck (MNT-0160-028). Jul 30, 2026: 0.5 °C above ambient; Prime mover failure (MNT-0160-029). Aug 6, 2026: 4.8 °C above ambient; Prime mover failure (MNT-0160-029). Aug 13, 2026: 2.7 °C above ambient; Prime mover failure (MNT-0160-029). Aug 20, 2026: 3.4 °C above ambient; Prime mover failure (MNT-0160-029). Feb 19, 2026: 2.4 °C above ambient; Sucker rod parted (MNT-0161-017). Feb 26, 2026: 9.1 °C above ambient; Sucker rod parted (MNT-0161-017). Jul 2, 2026: -0.4 °C above ambient; Sucker rod parted (MNT-0161-021). Jul 9, 2026: 8.8 °C above ambient; Sucker rod parted (MNT-0161-021). Apr 23, 2026: 2.7 °C above ambient; Prime mover failure (MNT-0164-024). Oct 15, 2026: 4.1 °C above ambient; Pump jack not moving.. Nov 26, 2026: -0.1 °C above ambient; Prime mover failure (MNT-0164-029). Nov 5, 2026: 6 °C above ambient; Walking beam bearing wear (MNT-0166-029). Jul 30, 2026: 5 °C above ambient; Prime mover failure (MNT-0168-026). Nov 26, 2026: 0 °C above ambient; Flowline corrosion pinhole leak (MNT-0169-025). Apr 23, 2026: 4.3 °C above ambient; Gearbox oil leak (MNT-0170-026). Aug 20, 2026: 5.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0170-029). Sep 17, 2026: 2.2 °C above ambient; Walking beam bearing wear (MNT-0170-031). Sep 24, 2026: 0.4 °C above ambient; Walking beam bearing wear (MNT-0170-031). Oct 1, 2026: 3.3 °C above ambient; Walking beam bearing wear (MNT-0170-031). Oct 8, 2026: 2.6 °C above ambient; Walking beam bearing wear (MNT-0170-031). Oct 15, 2026: 2.9 °C above ambient; Walking beam bearing wear (MNT-0170-031). Oct 22, 2026: 1.4 °C above ambient; Walking beam bearing wear (MNT-0170-031). Nov 5, 2026: 4.2 °C above ambient; Walking beam bearing wear (MNT-0170-032). Nov 12, 2026: -0.4 °C above ambient; Walking beam bearing wear (MNT-0170-032). Nov 19, 2026: 4 °C above ambient; Walking beam bearing wear (MNT-0170-032). Nov 26, 2026: 0.6 °C above ambient; Walking beam bearing wear (MNT-0170-032). Dec 3, 2026: 5.4 °C above ambient; Walking beam bearing wear (MNT-0170-032). Dec 10, 2026: 5.8 °C above ambient; Walking beam bearing wear (MNT-0170-032). May 14, 2026: 9.4 °C above ambient; Walking beam bearing wear (MNT-0171-021). May 21, 2026: 0.9 °C above ambient; Walking beam bearing wear (MNT-0171-021). Dec 24, 2026: 8.6 °C above ambient; Gearbox oil leak (MNT-0171-024). Dec 31, 2026: 2.5 °C above ambient; Gearbox oil leak (MNT-0171-024). Mar 5, 2026: 0 °C above ambient; Flowline corrosion pinhole leak (MNT-0172-023). Mar 12, 2026: 5.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0172-023). Mar 19, 2026: 2.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0172-023). Mar 26, 2026: 3.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0172-023). Oct 1, 2026: 2.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0172-028). Oct 8, 2026: 4.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0172-028). Oct 15, 2026: 5.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0172-028). Jun 11, 2026: 5.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0173-026). Jun 18, 2026: 0.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0173-026). Jun 11, 2026: 7.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0174-028). Jun 18, 2026: 2.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0174-028). Nov 5, 2026: 10.7 °C above ambient; Sucker rod parted (MNT-0174-031). Nov 12, 2026: 1.2 °C above ambient; Sucker rod parted (MNT-0174-031). Mar 5, 2026: 2.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0175-028). Mar 12, 2026: 2 °C above ambient; Flowline corrosion pinhole leak (MNT-0175-028). May 28, 2026: 1.3 °C above ambient; Stuffing box packing leak (MNT-0175-031). Oct 15, 2026: 0.4 °C above ambient; . Nov 5, 2026: 8.9 °C above ambient; Walking beam bearing wear (MNT-0176-029). Nov 12, 2026: 8.3 °C above ambient; Walking beam bearing wear (MNT-0176-029). Nov 19, 2026: 7.3 °C above ambient; Walking beam bearing wear (MNT-0176-029). Nov 26, 2026: 10.5 °C above ambient; Walking beam bearing wear (MNT-0176-029). Jan 15, 2026: 4.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0177-023). Jan 29, 2026: -0.7 °C above ambient; Walking beam bearing wear (MNT-0177-025). Feb 5, 2026: -0.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0178-029). Feb 12, 2026: 1 °C above ambient; Flowline corrosion pinhole leak (MNT-0178-029). Feb 19, 2026: 3.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0178-029). Jun 25, 2026: 4.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0178-033). Aug 20, 2026: 3.3 °C above ambient; Walking beam bearing wear (MNT-0179-029). Aug 27, 2026: 2.6 °C above ambient; Walking beam bearing wear (MNT-0179-029). Sep 3, 2026: 2.3 °C above ambient; Walking beam bearing wear (MNT-0179-029). Nov 26, 2026: 2.7 °C above ambient; Separator level controller fault (MNT-0180-031). Dec 3, 2026: 2.3 °C above ambient; Separator level controller fault (MNT-0180-031). Dec 10, 2026: 1.8 °C above ambient; Separator level controller fault (MNT-0180-031). Dec 17, 2026: 4.9 °C above ambient; Separator level controller fault (MNT-0180-031). Dec 24, 2026: 3.3 °C above ambient; Separator level controller fault (MNT-0180-031). Dec 31, 2026: 0.8 °C above ambient; Separator level controller fault (MNT-0180-031). Jan 15, 2026: 3.6 °C above ambient; Prime mover failure (MNT-0181-022). Jan 22, 2026: -0.5 °C above ambient; Prime mover failure (MNT-0181-022). Jan 29, 2026: 2.5 °C above ambient; Prime mover failure (MNT-0181-022). Mar 19, 2026: 2.9 °C above ambient; Downhole pump stuck (MNT-0181-025). Jan 29, 2026: 1.3 °C above ambient; Walking beam bearing wear (MNT-0182-021). Feb 5, 2026: 2.7 °C above ambient; Walking beam bearing wear (MNT-0182-021). Feb 12, 2026: 1.8 °C above ambient; Walking beam bearing wear (MNT-0182-021). Feb 19, 2026: -0.3 °C above ambient; Walking beam bearing wear (MNT-0182-021). Mar 26, 2026: 3 °C above ambient; Prime mover failure (MNT-0182-023). Apr 2, 2026: 3.4 °C above ambient; Prime mover failure (MNT-0182-023). Apr 9, 2026: 4 °C above ambient; Prime mover failure (MNT-0182-023). Nov 5, 2026: 1.8 °C above ambient; Gearbox oil leak (MNT-0182-027). Dec 24, 2026: 2.6 °C above ambient; Walking beam bearing wear (MNT-0182-029). Dec 31, 2026: 1.2 °C above ambient; Walking beam bearing wear (MNT-0182-029). Feb 26, 2026: 2.8 °C above ambient; Gearbox oil leak (MNT-0183-026). Mar 5, 2026: 5.5 °C above ambient; Gearbox oil leak (MNT-0183-026). Apr 30, 2026: -0.2 °C above ambient; Prime mover failure (MNT-0183-028). May 7, 2026: 2.8 °C above ambient; Prime mover failure (MNT-0183-028). Jun 25, 2026: 8.5 °C above ambient; Downhole pump stuck (MNT-0183-031). Jul 2, 2026: 1.8 °C above ambient; Downhole pump stuck (MNT-0183-031). Jul 9, 2026: 4.1 °C above ambient; Downhole pump stuck (MNT-0183-031). Jan 22, 2026: 4.7 °C above ambient; Downhole pump stuck (MNT-0184-020). Jan 29, 2026: 6 °C above ambient; Downhole pump stuck (MNT-0184-020). Feb 5, 2026: 7.3 °C above ambient; Downhole pump stuck (MNT-0184-020). Jul 16, 2026: 8.5 °C above ambient; Downhole pump stuck (MNT-0187-022). Aug 6, 2026: 4.7 °C above ambient; Gearbox oil leak (MNT-0187-023). Aug 13, 2026: 3.3 °C above ambient; Gearbox oil leak (MNT-0187-023). Sep 10, 2026: 3.3 °C above ambient; Gearbox oil leak (MNT-0188-031). Sep 17, 2026: 5.4 °C above ambient; Gearbox oil leak (MNT-0188-031). Sep 24, 2026: 2.3 °C above ambient; Gearbox oil leak (MNT-0188-031). Oct 1, 2026: 5.3 °C above ambient; Gearbox oil leak (MNT-0188-031). Apr 23, 2026: 9.1 °C above ambient; Walking beam bearing wear (MNT-0189-030). Apr 30, 2026: 2.4 °C above ambient; Walking beam bearing wear (MNT-0189-030). Jul 30, 2026: 0.5 °C above ambient; Prime mover failure (MNT-0189-033). Aug 6, 2026: 8.8 °C above ambient; Prime mover failure (MNT-0189-033). Aug 20, 2026: 5.3 °C above ambient; Walking beam bearing wear (MNT-0190-028). Aug 27, 2026: 0.1 °C above ambient; Walking beam bearing wear (MNT-0190-028). Nov 19, 2026: -0.2 °C above ambient; Gearbox oil leak (MNT-0190-030). Nov 26, 2026: 1.9 °C above ambient; Gearbox oil leak (MNT-0190-030). Dec 3, 2026: 2.6 °C above ambient; Gearbox oil leak (MNT-0190-030). Dec 10, 2026: 0.5 °C above ambient; Gearbox oil leak (MNT-0190-030). Dec 17, 2026: 4.4 °C above ambient; Gearbox oil leak (MNT-0190-030). Dec 24, 2026: 5.2 °C above ambient; Gearbox oil leak (MNT-0190-030). Jun 4, 2026: 0.7 °C above ambient; Walking beam bearing wear (MNT-0191-026). Jun 11, 2026: 1.3 °C above ambient; Walking beam bearing wear (MNT-0191-026). Dec 3, 2026: 3.4 °C above ambient; Stuffing box packing leak (MNT-0191-028). Dec 10, 2026: -0.5 °C above ambient; Stuffing box packing leak (MNT-0191-028). Dec 17, 2026: 7.3 °C above ambient; Stuffing box packing leak (MNT-0191-028). Dec 24, 2026: 8.2 °C above ambient; Stuffing box packing leak (MNT-0191-028). Jan 1, 2026: 4.2 °C above ambient; Sucker rod parted (MNT-0192-025). Feb 12, 2026: -0.4 °C above ambient; Downhole pump stuck (MNT-0193-019). Aug 27, 2026: 7.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0193-023). Sep 3, 2026: 10.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0193-023). Jan 29, 2026: 1.7 °C above ambient; Gearbox oil leak (MNT-0194-031). Feb 5, 2026: 4.4 °C above ambient; Gearbox oil leak (MNT-0194-031). Nov 5, 2026: -0.6 °C above ambient; Walking beam bearing wear (MNT-0194-038). Nov 12, 2026: 2.9 °C above ambient; Walking beam bearing wear (MNT-0194-038). Apr 2, 2026: 0.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0195-027). Aug 13, 2026: -0.2 °C above ambient; Separator level controller fault (MNT-0195-029). May 7, 2026: 2.5 °C above ambient; Gearbox oil leak (MNT-0196-029). May 14, 2026: 0.4 °C above ambient; Gearbox oil leak (MNT-0196-029). Jan 1, 2026: -0.4 °C above ambient; Walking beam bearing wear (MNT-0197-022). Jan 8, 2026: 0 °C above ambient; Walking beam bearing wear (MNT-0197-022). Jan 15, 2026: 5.7 °C above ambient; Walking beam bearing wear (MNT-0197-022). Dec 31, 2026: 1.1 °C above ambient; Sucker rod parted (MNT-0197-029). Feb 26, 2026: 1 °C above ambient; Flowline corrosion pinhole leak (MNT-0199-025). Mar 5, 2026: 3.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0199-025). Mar 12, 2026: 4.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0199-025). Sep 24, 2026: -0.9 °C above ambient; Downhole pump stuck (MNT-0199-031). Oct 1, 2026: 2.5 °C above ambient; Downhole pump stuck (MNT-0199-031). Nov 19, 2026: 2.2 °C above ambient; Prime mover failure (MNT-0199-032). Nov 26, 2026: 4.3 °C above ambient; Prime mover failure (MNT-0199-032). Dec 3, 2026: 4.2 °C above ambient; Prime mover failure (MNT-0199-032). Dec 17, 2026: 2.4 °C above ambient; Prime mover failure (MNT-0199-033). Dec 24, 2026: 0.6 °C above ambient; Prime mover failure (MNT-0199-033). Dec 31, 2026: 4.1 °C above ambient; Prime mover failure (MNT-0199-033). Jan 1, 2026: 0.5 °C above ambient; Gearbox oil leak (MNT-0200-020). Nov 26, 2026: 9.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0200-028). Dec 10, 2026: -0.2 °C above ambient; Prime mover failure (MNT-0200-029). Dec 17, 2026: -0.8 °C above ambient; Prime mover failure (MNT-0200-029). Sep 10, 2026: 15.6 °C above ambient; ESP motor burnout (MNT-0203-029). Sep 17, 2026: 11.9 °C above ambient; ESP motor burnout (MNT-0203-029). Jun 11, 2026: 10.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0204-024). Jun 18, 2026: 4.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0204-024). Jun 25, 2026: 8.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0204-024). Jan 15, 2026: 1.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0205-023). Sep 17, 2026: -0.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0205-028). Apr 9, 2026: 15 °C above ambient; ESP motor burnout (MNT-0209-019). Apr 16, 2026: 2 °C above ambient; ESP motor burnout (MNT-0209-019). Apr 23, 2026: 13.7 °C above ambient; ESP motor burnout (MNT-0209-019). Apr 30, 2026: 8.7 °C above ambient; ESP motor burnout (MNT-0209-019). May 28, 2026: 14.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0209-022). Jun 4, 2026: 9.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0209-022). Jun 11, 2026: 1.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0209-022). Nov 5, 2026: 4.8 °C above ambient; Stuffing box packing leak (MNT-0210-025). Nov 12, 2026: 0.3 °C above ambient; Stuffing box packing leak (MNT-0210-025). Aug 27, 2026: 4 °C above ambient; Flowline corrosion pinhole leak (MNT-0213-026). Sep 3, 2026: 3.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0213-026). Oct 1, 2026: 5.3 °C above ambient; Prime mover failure (MNT-0213-028). Oct 8, 2026: 3.2 °C above ambient; Prime mover failure (MNT-0213-028). Oct 15, 2026: 3.8 °C above ambient; Prime mover failure (MNT-0213-028). Sep 24, 2026: 2.4 °C above ambient; Sucker rod parted (MNT-0215-026). Oct 1, 2026: 5.9 °C above ambient; Sucker rod parted (MNT-0215-026). Aug 27, 2026: 7.4 °C above ambient; Wellhead cable penetrator leak (MNT-0216-034). Sep 3, 2026: 14.3 °C above ambient; Wellhead cable penetrator leak (MNT-0216-034). Sep 10, 2026: 1.9 °C above ambient; Wellhead cable penetrator leak (MNT-0216-034). Sep 17, 2026: 10.6 °C above ambient; Wellhead cable penetrator leak (MNT-0216-034). Dec 17, 2026: 9.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0216-037). Dec 24, 2026: 6.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0216-037). Dec 31, 2026: 10.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0216-037). Mar 5, 2026: 1.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0217-020). Mar 12, 2026: 4.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0217-020). Mar 19, 2026: -0.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0217-020). Apr 23, 2026: 1.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0217-022). Apr 30, 2026: 1.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0217-022). Oct 15, 2026: 4.4 °C above ambient; No stroke observed during flight.. Jan 22, 2026: 0.8 °C above ambient; Stuffing box packing leak (MNT-0218-023). Jan 29, 2026: -0.3 °C above ambient; Stuffing box packing leak (MNT-0218-023). Feb 5, 2026: 1.3 °C above ambient; Stuffing box packing leak (MNT-0218-023). Sep 3, 2026: 4 °C above ambient; Stuffing box packing leak (MNT-0218-029). Apr 9, 2026: 6.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0219-016). Apr 16, 2026: 7.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0219-016). Aug 20, 2026: 3.4 °C above ambient; Wellhead cable penetrator leak (MNT-0219-020). Aug 27, 2026: 9.6 °C above ambient; Wellhead cable penetrator leak (MNT-0219-020). Jan 22, 2026: 10.3 °C above ambient; Separator level controller fault (MNT-0224-024). Jan 29, 2026: 5.1 °C above ambient; Separator level controller fault (MNT-0224-024). Feb 5, 2026: 6.1 °C above ambient; Separator level controller fault (MNT-0224-024). Mar 5, 2026: 4 °C above ambient; Gearbox oil leak (MNT-0225-027). Mar 12, 2026: 4.2 °C above ambient; Gearbox oil leak (MNT-0225-027). Mar 19, 2026: 0.3 °C above ambient; Gearbox oil leak (MNT-0225-027). Mar 5, 2026: 3.9 °C above ambient; Wellhead cable penetrator leak (MNT-0226-025). Mar 12, 2026: 13.8 °C above ambient; Wellhead cable penetrator leak (MNT-0226-025). Mar 19, 2026: 9.2 °C above ambient; Wellhead cable penetrator leak (MNT-0226-025). Mar 19, 2026: 3.7 °C above ambient; Downhole pump stuck (MNT-0227-021). Mar 26, 2026: 4.3 °C above ambient; Downhole pump stuck (MNT-0227-021). Apr 2, 2026: 3.3 °C above ambient; Downhole pump stuck (MNT-0227-021). Apr 9, 2026: 5 °C above ambient; Downhole pump stuck (MNT-0227-021). Apr 16, 2026: 3 °C above ambient; Downhole pump stuck (MNT-0227-021). Apr 23, 2026: 3.4 °C above ambient; Downhole pump stuck (MNT-0227-021). Feb 5, 2026: 15.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0229-014). Feb 12, 2026: 2 °C above ambient; Flowline corrosion pinhole leak (MNT-0229-014). Mar 5, 2026: -0.2 °C above ambient; Stuffing box packing leak (MNT-0232-023). Mar 12, 2026: 2.2 °C above ambient; Stuffing box packing leak (MNT-0232-023). Sep 3, 2026: 14.6 °C above ambient; Separator level controller fault (MNT-0234-022). Dec 17, 2026: 2.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0235-030). May 21, 2026: 3.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0236-032). Jan 15, 2026: 3.7 °C above ambient; Downhole pump stuck (MNT-0238-022). Jan 22, 2026: -0.2 °C above ambient; Downhole pump stuck (MNT-0238-022). Jan 29, 2026: 3 °C above ambient; Downhole pump stuck (MNT-0238-022). Feb 5, 2026: 2 °C above ambient; Downhole pump stuck (MNT-0238-022). Feb 12, 2026: 5.1 °C above ambient; Downhole pump stuck (MNT-0238-023). Feb 19, 2026: 4.6 °C above ambient; Downhole pump stuck (MNT-0238-023). Feb 26, 2026: 0.5 °C above ambient; Downhole pump stuck (MNT-0238-023). Mar 5, 2026: -0.6 °C above ambient; Downhole pump stuck (MNT-0238-023). Jun 11, 2026: 3.7 °C above ambient; Prime mover failure (MNT-0238-027). Jun 18, 2026: 4.1 °C above ambient; Prime mover failure (MNT-0238-027). Jun 25, 2026: 3.7 °C above ambient; Prime mover failure (MNT-0238-027). Jul 23, 2026: 5.9 °C above ambient; Prime mover failure (MNT-0240-034). Jul 30, 2026: 8.2 °C above ambient; Prime mover failure (MNT-0240-034). Jun 4, 2026: 0.8 °C above ambient; ESP power cable insulation failure (MNT-0241-028). Jun 11, 2026: 12.8 °C above ambient; ESP power cable insulation failure (MNT-0241-028). Jun 18, 2026: 13.2 °C above ambient; ESP power cable insulation failure (MNT-0241-028). Feb 19, 2026: 2.1 °C above ambient; Sucker rod parted (MNT-0244-020). Feb 26, 2026: 3.9 °C above ambient; Sucker rod parted (MNT-0244-020). May 28, 2026: 2.9 °C above ambient; Downhole pump stuck (MNT-0244-024). Dec 3, 2026: 10.6 °C above ambient; ESP power cable insulation failure (MNT-0245-029). Dec 10, 2026: 1.1 °C above ambient; ESP power cable insulation failure (MNT-0245-029). Dec 17, 2026: 1.5 °C above ambient; ESP power cable insulation failure (MNT-0245-029). Mar 12, 2026: 9.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0247-024). Mar 19, 2026: 12.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0247-024). May 28, 2026: 0.3 °C above ambient; Wellhead cable penetrator leak (MNT-0247-027). Sep 24, 2026: 1.8 °C above ambient; Wellhead cable penetrator leak (MNT-0247-030). Sep 10, 2026: 1.5 °C above ambient; Wellhead cable penetrator leak (MNT-0248-025). Sep 17, 2026: 2.7 °C above ambient; Wellhead cable penetrator leak (MNT-0248-025). Sep 24, 2026: 8.8 °C above ambient; Wellhead cable penetrator leak (MNT-0248-025). Jan 1, 2026: 8.6 °C above ambient; ESP power cable insulation failure (MNT-0249-009). Feb 26, 2026: 10.9 °C above ambient; ESP motor burnout (MNT-0249-011). Mar 5, 2026: 9.8 °C above ambient; ESP motor burnout (MNT-0249-011). Apr 23, 2026: 6.8 °C above ambient; ESP motor burnout (MNT-0249-013). Apr 30, 2026: 13 °C above ambient; ESP motor burnout (MNT-0249-013). Dec 3, 2026: 2.7 °C above ambient; ESP motor burnout (MNT-0250-017). Dec 10, 2026: 5.2 °C above ambient; ESP motor burnout (MNT-0250-017). Dec 17, 2026: 6.2 °C above ambient; ESP motor burnout (MNT-0250-017). Dec 24, 2026: 6.4 °C above ambient; ESP motor burnout (MNT-0250-017). Nov 5, 2026: 4.1 °C above ambient; Sucker rod parted (MNT-0251-027). Nov 12, 2026: 0.3 °C above ambient; Sucker rod parted (MNT-0251-027). Feb 19, 2026: -0.3 °C above ambient; Prime mover failure (MNT-0252-028). Jun 18, 2026: 0.3 °C above ambient; Prime mover failure (MNT-0252-030). Jun 25, 2026: 5.7 °C above ambient; Prime mover failure (MNT-0252-030). Apr 9, 2026: -0.2 °C above ambient; Sucker rod parted (MNT-0253-026). Oct 15, 2026: 4.7 °C above ambient; Walking beam bearing wear (MNT-0253-029). Oct 22, 2026: -0.4 °C above ambient; Walking beam bearing wear (MNT-0253-029). Feb 26, 2026: 15.5 °C above ambient; Wellhead cable penetrator leak (MNT-0255-027). Feb 12, 2026: 2.4 °C above ambient; Gearbox oil leak (MNT-0258-027). Feb 19, 2026: 4.6 °C above ambient; Gearbox oil leak (MNT-0258-027). Feb 26, 2026: 2.5 °C above ambient; Gearbox oil leak (MNT-0258-027). Mar 5, 2026: 3.1 °C above ambient; Gearbox oil leak (MNT-0258-027). Aug 27, 2026: 0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0259-027). Sep 3, 2026: 0 °C above ambient; Flowline corrosion pinhole leak (MNT-0259-027). Sep 10, 2026: 1.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0259-027). Sep 17, 2026: 4.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0259-027). Jun 25, 2026: 9.8 °C above ambient; Prime mover failure (MNT-0260-031). Aug 27, 2026: 5.3 °C above ambient; Gearbox oil leak (MNT-0260-033). Sep 3, 2026: 9.9 °C above ambient; Gearbox oil leak (MNT-0260-033). Sep 17, 2026: 5.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0260-035). Apr 30, 2026: 7.4 °C above ambient; Stuffing box packing leak (MNT-0261-026). May 7, 2026: 9.4 °C above ambient; Stuffing box packing leak (MNT-0261-026). May 14, 2026: -0.6 °C above ambient; Stuffing box packing leak (MNT-0261-026). May 21, 2026: 0 °C above ambient; Stuffing box packing leak (MNT-0261-026). Sep 17, 2026: 3.9 °C above ambient; Walking beam bearing wear (MNT-0261-029). Sep 24, 2026: 8 °C above ambient; Walking beam bearing wear (MNT-0261-029). Oct 1, 2026: 9.1 °C above ambient; Walking beam bearing wear (MNT-0261-029). Jan 22, 2026: 1 °C above ambient; Walking beam bearing wear (MNT-0262-022). Apr 16, 2026: 3.7 °C above ambient; Walking beam bearing wear (MNT-0262-025). Apr 23, 2026: -0.4 °C above ambient; Walking beam bearing wear (MNT-0262-025). Jun 11, 2026: 9.8 °C above ambient; Downhole pump stuck (MNT-0263-030). Jun 18, 2026: 10.5 °C above ambient; Downhole pump stuck (MNT-0263-030). Oct 15, 2026: -0.9 °C above ambient; Downhole pump stuck (MNT-0263-033). Sep 3, 2026: 2.9 °C above ambient; Separator level controller fault (MNT-0264-026). Oct 15, 2026: -0.8 °C above ambient; Prime mover failure (MNT-0265-026). Oct 22, 2026: 4.4 °C above ambient; Prime mover failure (MNT-0265-026). Oct 29, 2026: 0.4 °C above ambient; Prime mover failure (MNT-0265-026). Nov 5, 2026: -0.5 °C above ambient; Prime mover failure (MNT-0265-026). Nov 12, 2026: 3.9 °C above ambient; Prime mover failure (MNT-0265-026). Nov 19, 2026: 4.7 °C above ambient; Prime mover failure (MNT-0265-026). Jun 25, 2026: 4.3 °C above ambient; Prime mover failure (MNT-0268-022). Jul 2, 2026: 0.9 °C above ambient; Prime mover failure (MNT-0268-022). Jul 9, 2026: 8.2 °C above ambient; Prime mover failure (MNT-0268-022). Aug 27, 2026: 5.6 °C above ambient; Prime mover failure (MNT-0269-026). Sep 3, 2026: -0.7 °C above ambient; Prime mover failure (MNT-0269-026). Sep 10, 2026: 1.4 °C above ambient; Prime mover failure (MNT-0269-026). May 28, 2026: 2.3 °C above ambient; Prime mover failure (MNT-0270-025). Jun 4, 2026: 3.8 °C above ambient; Prime mover failure (MNT-0270-025). Feb 26, 2026: 1.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0271-025). Mar 5, 2026: 3.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0271-025). Mar 12, 2026: 0.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0271-025). Mar 19, 2026: 1.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0271-025). Mar 26, 2026: 4.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0271-025). Apr 2, 2026: 2.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0271-025). May 14, 2026: -1 °C above ambient; Prime mover failure (MNT-0271-027). May 28, 2026: 4.3 °C above ambient; Walking beam bearing wear (MNT-0271-028). Jun 4, 2026: -1 °C above ambient; Walking beam bearing wear (MNT-0271-028). Jun 11, 2026: 0 °C above ambient; Walking beam bearing wear (MNT-0271-028). Jun 18, 2026: 1.1 °C above ambient; Walking beam bearing wear (MNT-0271-028). Apr 23, 2026: 0 °C above ambient; Gearbox oil leak (MNT-0273-015). Apr 30, 2026: 0.3 °C above ambient; Gearbox oil leak (MNT-0273-015). May 7, 2026: 5.2 °C above ambient; Gearbox oil leak (MNT-0273-015). May 14, 2026: -0.1 °C above ambient; Gearbox oil leak (MNT-0273-015). Jun 18, 2026: 10.2 °C above ambient; Sucker rod parted (MNT-0275-025). Jun 25, 2026: 5.8 °C above ambient; Sucker rod parted (MNT-0275-025). Jan 1, 2026: 2.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0276-028). Jan 8, 2026: 3.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0276-028). Jan 15, 2026: -0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0276-028). Apr 30, 2026: 3.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0278-024). Apr 16, 2026: 3.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0279-028). Apr 23, 2026: 9.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0279-028). Apr 30, 2026: 5.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0279-028). May 7, 2026: 3.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0279-028). Aug 13, 2026: 0.9 °C above ambient; Sucker rod parted (MNT-0280-030). Aug 20, 2026: 8.1 °C above ambient; Sucker rod parted (MNT-0280-030). Feb 12, 2026: 2.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0281-022). Feb 19, 2026: 10.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0281-022). Feb 26, 2026: -0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0281-022). Dec 31, 2026: 8.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0281-031). Jun 18, 2026: 0.2 °C above ambient; Sucker rod parted (MNT-0283-029). Jun 25, 2026: 1.3 °C above ambient; Sucker rod parted (MNT-0283-029). Jul 2, 2026: 1.2 °C above ambient; Sucker rod parted (MNT-0283-029). Jul 9, 2026: 3.5 °C above ambient; Sucker rod parted (MNT-0283-029). Dec 3, 2026: 3.1 °C above ambient; Wellhead cable penetrator leak (MNT-0285-025). May 28, 2026: -0.5 °C above ambient; Walking beam bearing wear (MNT-0286-023). Jun 4, 2026: -0.1 °C above ambient; Walking beam bearing wear (MNT-0286-023). Sep 24, 2026: 2.4 °C above ambient; Walking beam bearing wear (MNT-0286-026). Aug 27, 2026: 2.7 °C above ambient; Prime mover failure (MNT-0288-028). Jan 29, 2026: -0.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0289-027). Feb 5, 2026: 4.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0289-027). Feb 12, 2026: 0.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0289-027). Feb 19, 2026: -0.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0289-027). Feb 26, 2026: 2.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0289-027). Mar 5, 2026: 4.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0289-027). Jun 18, 2026: 5.9 °C above ambient; Prime mover failure (MNT-0290-028). Aug 6, 2026: 1.7 °C above ambient; Gearbox oil leak (MNT-0291-029). Apr 23, 2026: -0.6 °C above ambient; Stuffing box packing leak (MNT-0292-024). Apr 30, 2026: -0.7 °C above ambient; Stuffing box packing leak (MNT-0292-024). Feb 5, 2026: 5.6 °C above ambient; Walking beam bearing wear (MNT-0294-027). Feb 12, 2026: 5.9 °C above ambient; Walking beam bearing wear (MNT-0294-027). Apr 30, 2026: 2.2 °C above ambient; Sucker rod parted (MNT-0295-028). Jul 23, 2026: 4.3 °C above ambient; Sucker rod parted (MNT-0295-031). Nov 5, 2026: 5.1 °C above ambient; Sucker rod parted (MNT-0295-034). Nov 12, 2026: 5.7 °C above ambient; Sucker rod parted (MNT-0295-034). Nov 19, 2026: 5.9 °C above ambient; Sucker rod parted (MNT-0295-034). Nov 26, 2026: -0.6 °C above ambient; Sucker rod parted (MNT-0295-034). Jan 22, 2026: 4.3 °C above ambient; Sucker rod parted (MNT-0297-025). Jan 29, 2026: 4.8 °C above ambient; Sucker rod parted (MNT-0297-025). May 7, 2026: 0.9 °C above ambient; Stuffing box packing leak (MNT-0297-028). May 14, 2026: 2.9 °C above ambient; Stuffing box packing leak (MNT-0297-028). Sep 24, 2026: 0.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0297-032). Dec 3, 2026: 0.9 °C above ambient; Downhole pump stuck (MNT-0297-034). Dec 10, 2026: 10.9 °C above ambient; Downhole pump stuck (MNT-0297-034). Dec 17, 2026: 6.8 °C above ambient; Downhole pump stuck (MNT-0297-034). Mar 19, 2026: 2.9 °C above ambient; Walking beam bearing wear (MNT-0298-027). Mar 26, 2026: 7.3 °C above ambient; Walking beam bearing wear (MNT-0298-027). Apr 2, 2026: 8 °C above ambient; Walking beam bearing wear (MNT-0298-027). Apr 16, 2026: 10.5 °C above ambient; Gearbox oil leak (MNT-0298-030). Jun 11, 2026: 3.6 °C above ambient; Prime mover failure (MNT-0298-032). Sep 24, 2026: 1.5 °C above ambient; Sucker rod parted (MNT-0298-034). Apr 16, 2026: 8.3 °C above ambient; Separator level controller fault (MNT-0299-027). Apr 23, 2026: 14.3 °C above ambient; Separator level controller fault (MNT-0299-027). Apr 30, 2026: 0.3 °C above ambient; Separator level controller fault (MNT-0299-027). May 7, 2026: 2.4 °C above ambient; Separator level controller fault (MNT-0299-027). Nov 26, 2026: 3.5 °C above ambient; Stuffing box packing leak (MNT-0300-033). Dec 3, 2026: 0.7 °C above ambient; Stuffing box packing leak (MNT-0300-033). Feb 19, 2026: 1 °C above ambient; Flowline corrosion pinhole leak (MNT-0301-025). Feb 26, 2026: 8.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0301-025). Mar 5, 2026: 14.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0301-025). May 21, 2026: 3.9 °C above ambient; Wellhead cable penetrator leak (MNT-0301-028). May 28, 2026: 6.8 °C above ambient; Wellhead cable penetrator leak (MNT-0301-028). Apr 30, 2026: 9.7 °C above ambient; Walking beam bearing wear (MNT-0302-027). May 7, 2026: 0.8 °C above ambient; Walking beam bearing wear (MNT-0302-027). Nov 12, 2026: 9 °C above ambient; Downhole pump stuck (MNT-0302-030). Oct 1, 2026: 0.8 °C above ambient; Sucker rod parted (MNT-0304-030). Oct 8, 2026: 6.8 °C above ambient; Sucker rod parted (MNT-0304-030). Oct 15, 2026: 0.3 °C above ambient; Sucker rod parted (MNT-0304-030). Oct 22, 2026: 3.9 °C above ambient; Sucker rod parted (MNT-0304-030). Sep 10, 2026: 1.6 °C above ambient; Gearbox oil leak (MNT-0305-030). Sep 17, 2026: -0.6 °C above ambient; Gearbox oil leak (MNT-0305-030). Oct 15, 2026: -0.9 °C above ambient; Downhole pump stuck (MNT-0305-032). Jul 9, 2026: 5.1 °C above ambient; Prime mover failure (MNT-0306-029). Jul 16, 2026: 3.6 °C above ambient; Prime mover failure (MNT-0306-029). Oct 1, 2026: 3.9 °C above ambient; Walking beam bearing wear (MNT-0307-028). Oct 8, 2026: 4.6 °C above ambient; Prime mover failure (MNT-0307-029). Oct 15, 2026: 2.5 °C above ambient; Prime mover failure (MNT-0307-029). Oct 22, 2026: 3.4 °C above ambient; Prime mover failure (MNT-0307-029). Oct 29, 2026: 1.4 °C above ambient; Prime mover failure (MNT-0307-029). Sep 17, 2026: -0.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0309-022). Sep 24, 2026: 5 °C above ambient; Flowline corrosion pinhole leak (MNT-0309-022). Oct 1, 2026: 5.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0309-022). May 28, 2026: 1.4 °C above ambient; Gearbox oil leak (MNT-0310-024). Sep 17, 2026: 5.8 °C above ambient; Sucker rod parted (MNT-0313-025). Sep 24, 2026: 0.2 °C above ambient; Sucker rod parted (MNT-0313-025). Dec 17, 2026: 6.2 °C above ambient; Prime mover failure (MNT-0313-027). Dec 24, 2026: 6.7 °C above ambient; Prime mover failure (MNT-0313-027). Dec 31, 2026: 0.9 °C above ambient; Prime mover failure (MNT-0313-027). Sep 3, 2026: 13.8 °C above ambient; Separator level controller fault (MNT-0314-032). Sep 10, 2026: 8.2 °C above ambient; Separator level controller fault (MNT-0314-032). Apr 23, 2026: -0.7 °C above ambient; Gearbox oil leak (MNT-0316-022). Apr 30, 2026: 6.2 °C above ambient; Gearbox oil leak (MNT-0316-022). May 7, 2026: 10.4 °C above ambient; Gearbox oil leak (MNT-0316-022). Jan 15, 2026: 1.2 °C above ambient; Walking beam bearing wear (MNT-0318-021). May 14, 2026: 2.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0318-026). May 21, 2026: -0.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0318-026). Sep 10, 2026: 5.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0318-029). Feb 26, 2026: 1.8 °C above ambient; Walking beam bearing wear (MNT-0320-025). Feb 12, 2026: 4.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0321-027). Feb 19, 2026: 9 °C above ambient; Flowline corrosion pinhole leak (MNT-0321-027). Jun 11, 2026: 8.1 °C above ambient; Prime mover failure (MNT-0321-030). Jun 18, 2026: 6.8 °C above ambient; Prime mover failure (MNT-0321-030). Jun 25, 2026: 10.7 °C above ambient; Prime mover failure (MNT-0321-030). Apr 16, 2026: 2 °C above ambient; Prime mover failure (MNT-0322-025). Apr 23, 2026: 4.7 °C above ambient; Prime mover failure (MNT-0322-025). Apr 16, 2026: 1.7 °C above ambient; Stuffing box packing leak (MNT-0323-025). Apr 23, 2026: 5 °C above ambient; Stuffing box packing leak (MNT-0323-025). Dec 31, 2026: 1.1 °C above ambient; Walking beam bearing wear (MNT-0324-036). Feb 26, 2026: 4.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0325-024). Mar 5, 2026: 0.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0325-024). May 14, 2026: 1.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0326-021). May 21, 2026: 5.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0326-021). Sep 17, 2026: 10.1 °C above ambient; Walking beam bearing wear (MNT-0326-025). Sep 24, 2026: 6.3 °C above ambient; Walking beam bearing wear (MNT-0326-025). Oct 1, 2026: 2 °C above ambient; Walking beam bearing wear (MNT-0326-025). Oct 8, 2026: 10 °C above ambient; Walking beam bearing wear (MNT-0326-025). Jan 29, 2026: -0.6 °C above ambient; Gearbox oil leak (MNT-0328-026). Feb 5, 2026: 2 °C above ambient; Gearbox oil leak (MNT-0328-026). Jul 30, 2026: -0.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0328-031). Aug 6, 2026: 4.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0328-031). Aug 13, 2026: 3.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0328-031). Aug 20, 2026: 5.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0328-031). Jun 4, 2026: 14.1 °C above ambient; ESP motor burnout (MNT-0329-029). Jun 11, 2026: 9.5 °C above ambient; ESP motor burnout (MNT-0329-029). Jun 18, 2026: 13.6 °C above ambient; ESP motor burnout (MNT-0329-029). Sep 24, 2026: 8.5 °C above ambient; ESP power cable insulation failure (MNT-0329-031). May 28, 2026: -0.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0330-024). Jun 4, 2026: -0.5 °C above ambient; Prime mover failure (MNT-0330-025). Jun 18, 2026: 4.8 °C above ambient; Prime mover failure (MNT-0330-025). Nov 26, 2026: -0.5 °C above ambient; Stuffing box packing leak (MNT-0330-028). Dec 3, 2026: 1.7 °C above ambient; Stuffing box packing leak (MNT-0330-028). Dec 31, 2026: -0.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0330-030). Jan 22, 2026: -0.7 °C above ambient; Gearbox oil leak (MNT-0331-022). Feb 12, 2026: 3.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0332-027). Feb 19, 2026: -0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0332-027). May 7, 2026: 5.1 °C above ambient; Downhole pump stuck (MNT-0333-024). May 14, 2026: 5.2 °C above ambient; Downhole pump stuck (MNT-0333-024). May 21, 2026: 1.1 °C above ambient; Downhole pump stuck (MNT-0333-024). Jun 4, 2026: 0.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0333-026). Jun 11, 2026: 2.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0333-026). Apr 23, 2026: 0.4 °C above ambient; Prime mover failure (MNT-0335-024). Aug 20, 2026: 1.2 °C above ambient; Prime mover failure (MNT-0335-030). Dec 24, 2026: -0.5 °C above ambient; Sucker rod parted (MNT-0335-032). Dec 31, 2026: 0.6 °C above ambient; Sucker rod parted (MNT-0335-032). May 7, 2026: 4.6 °C above ambient; ESP motor burnout (MNT-0336-026). Feb 26, 2026: 5.5 °C above ambient; Walking beam bearing wear (MNT-0338-023). Mar 5, 2026: -0.8 °C above ambient; Walking beam bearing wear (MNT-0338-023). Mar 12, 2026: 1.8 °C above ambient; Walking beam bearing wear (MNT-0338-023). Mar 19, 2026: -1 °C above ambient; Walking beam bearing wear (MNT-0338-023). Sep 17, 2026: 3 °C above ambient; Flowline corrosion pinhole leak (MNT-0338-028). Sep 24, 2026: 1.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0338-028). Oct 1, 2026: 4.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0338-028). Nov 19, 2026: -0.5 °C above ambient; Prime mover failure (MNT-0338-030). Nov 26, 2026: 2.4 °C above ambient; Prime mover failure (MNT-0338-030). Dec 3, 2026: 1.4 °C above ambient; Prime mover failure (MNT-0338-030). Dec 10, 2026: 3.4 °C above ambient; Prime mover failure (MNT-0338-030). Jan 29, 2026: 5.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0340-030). Feb 5, 2026: 5.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0340-030). Feb 12, 2026: 7 °C above ambient; Flowline corrosion pinhole leak (MNT-0340-030). Apr 2, 2026: 7 °C above ambient; Downhole pump stuck (MNT-0340-031). Apr 9, 2026: -0.6 °C above ambient; Downhole pump stuck (MNT-0340-031). May 7, 2026: 6.1 °C above ambient; Stuffing box packing leak (MNT-0340-032). May 14, 2026: 8.9 °C above ambient; Stuffing box packing leak (MNT-0340-032). May 21, 2026: -0.4 °C above ambient; Stuffing box packing leak (MNT-0340-032). May 28, 2026: 8.6 °C above ambient; Stuffing box packing leak (MNT-0340-032). Dec 17, 2026: 6.8 °C above ambient; Sucker rod parted (MNT-0340-037). Dec 24, 2026: 2.5 °C above ambient; Sucker rod parted (MNT-0340-037). Sep 10, 2026: 5.8 °C above ambient; Prime mover failure (MNT-0341-016). Nov 12, 2026: 14.6 °C above ambient; Separator level controller fault (MNT-0342-028). Jan 1, 2026: 5.1 °C above ambient; ESP power cable insulation failure (MNT-0344-025). Feb 12, 2026: 10.7 °C above ambient; ESP motor burnout (MNT-0344-027). Feb 19, 2026: -1 °C above ambient; ESP motor burnout (MNT-0344-027). Sep 24, 2026: 16 °C above ambient; Flowline corrosion pinhole leak (MNT-0344-032). Jan 8, 2026: 2.1 °C above ambient; Prime mover failure (MNT-0345-031). Jan 15, 2026: 7.4 °C above ambient; Prime mover failure (MNT-0345-031). Jan 22, 2026: 1.4 °C above ambient; Prime mover failure (MNT-0345-031). Feb 5, 2026: 7.1 °C above ambient; Stuffing box packing leak (MNT-0345-033). Feb 12, 2026: 2.9 °C above ambient; Stuffing box packing leak (MNT-0345-033). Aug 6, 2026: 9.3 °C above ambient; Downhole pump stuck (MNT-0345-036). Oct 15, 2026: -0.1 °C above ambient; Unit stopped, brake set.. Nov 26, 2026: 9.7 °C above ambient; Walking beam bearing wear (MNT-0346-029). Dec 3, 2026: 2.2 °C above ambient; Walking beam bearing wear (MNT-0346-029). Dec 10, 2026: -0.2 °C above ambient; Walking beam bearing wear (MNT-0346-029). Dec 17, 2026: 0.9 °C above ambient; Walking beam bearing wear (MNT-0346-029). Dec 24, 2026: 6.5 °C above ambient; Walking beam bearing wear (MNT-0346-029). Dec 31, 2026: 3.2 °C above ambient; Walking beam bearing wear (MNT-0346-029). May 14, 2026: 5.6 °C above ambient; Walking beam bearing wear (MNT-0348-032). May 21, 2026: 4.7 °C above ambient; Walking beam bearing wear (MNT-0348-032). May 28, 2026: 2.7 °C above ambient; Walking beam bearing wear (MNT-0348-032). Jun 4, 2026: 1.3 °C above ambient; Walking beam bearing wear (MNT-0348-032). Dec 17, 2026: 3.9 °C above ambient; Downhole pump stuck (MNT-0348-038). Dec 24, 2026: 3.5 °C above ambient; Downhole pump stuck (MNT-0348-038). Apr 30, 2026: 9.7 °C above ambient; Sucker rod parted (MNT-0349-028). May 7, 2026: 4.5 °C above ambient; Sucker rod parted (MNT-0349-028). Mar 12, 2026: -0.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0351-026). Feb 5, 2026: 6.6 °C above ambient; ESP motor burnout (MNT-0352-020). Feb 12, 2026: 1.1 °C above ambient; ESP motor burnout (MNT-0352-020). Feb 19, 2026: 0.1 °C above ambient; ESP motor burnout (MNT-0352-020). Feb 26, 2026: 14.1 °C above ambient; ESP motor burnout (MNT-0352-020). Mar 5, 2026: 6.5 °C above ambient; ESP motor burnout (MNT-0352-020). Mar 12, 2026: 6.2 °C above ambient; ESP motor burnout (MNT-0352-020). May 21, 2026: 0.8 °C above ambient; ESP power cable insulation failure (MNT-0352-024). May 28, 2026: 10.7 °C above ambient; ESP power cable insulation failure (MNT-0352-024). Jun 4, 2026: 3.8 °C above ambient; ESP power cable insulation failure (MNT-0352-024). Jun 11, 2026: 13.8 °C above ambient; ESP power cable insulation failure (MNT-0352-024). Oct 1, 2026: 2.9 °C above ambient; ESP power cable insulation failure (MNT-0352-027). Oct 8, 2026: 8 °C above ambient; ESP power cable insulation failure (MNT-0352-027). Mar 12, 2026: 4 °C above ambient; Sucker rod parted (MNT-0353-019). Mar 26, 2026: 2.1 °C above ambient; Sucker rod parted (MNT-0354-026). Apr 9, 2026: 0.2 °C above ambient; Walking beam bearing wear (MNT-0354-027). Apr 16, 2026: 1 °C above ambient; Walking beam bearing wear (MNT-0354-027). Apr 23, 2026: 2.7 °C above ambient; Walking beam bearing wear (MNT-0354-027). Nov 26, 2026: 2.1 °C above ambient; Prime mover failure (MNT-0354-031). Jan 1, 2026: 4.4 °C above ambient; Walking beam bearing wear (MNT-0355-020). Jan 8, 2026: 1.4 °C above ambient; Walking beam bearing wear (MNT-0355-020). Jan 15, 2026: 4.6 °C above ambient; Walking beam bearing wear (MNT-0355-020). Feb 26, 2026: 1 °C above ambient; Stuffing box packing leak (MNT-0357-023). Mar 5, 2026: 5.8 °C above ambient; Stuffing box packing leak (MNT-0357-023). Aug 27, 2026: -0.2 °C above ambient; Prime mover failure (MNT-0358-024). May 7, 2026: 1.6 °C above ambient; Sucker rod parted (MNT-0359-030). Jul 9, 2026: 4.3 °C above ambient; Prime mover failure (MNT-0359-032). Nov 19, 2026: 4 °C above ambient; Downhole pump stuck (MNT-0359-034). Nov 26, 2026: 3.5 °C above ambient; Downhole pump stuck (MNT-0359-034). Dec 3, 2026: -0.6 °C above ambient; Downhole pump stuck (MNT-0359-034). Sep 3, 2026: 3 °C above ambient; ESP power cable insulation failure (MNT-0360-026). Sep 10, 2026: 6 °C above ambient; ESP power cable insulation failure (MNT-0360-026). Sep 17, 2026: 11.9 °C above ambient; ESP power cable insulation failure (MNT-0360-026). Oct 8, 2026: 15.3 °C above ambient; ESP power cable insulation failure (MNT-0361-026). Oct 15, 2026: 7.6 °C above ambient; ESP power cable insulation failure (MNT-0361-026). Jul 2, 2026: 4.6 °C above ambient; Prime mover failure (MNT-0362-026). Jul 9, 2026: 3.6 °C above ambient; Wellhead cable penetrator leak (MNT-0363-030). Jul 16, 2026: 9.5 °C above ambient; Wellhead cable penetrator leak (MNT-0363-030). Jul 23, 2026: 4.7 °C above ambient; Wellhead cable penetrator leak (MNT-0363-030). Jul 30, 2026: 0.1 °C above ambient; Wellhead cable penetrator leak (MNT-0363-030). Feb 5, 2026: 5.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0365-024). May 21, 2026: 5.7 °C above ambient; Prime mover failure (MNT-0365-027). May 28, 2026: 3.1 °C above ambient; Prime mover failure (MNT-0365-027). Apr 9, 2026: 1.9 °C above ambient; Walking beam bearing wear (MNT-0366-023). Jun 25, 2026: -0.1 °C above ambient; Prime mover failure (MNT-0366-026). Jul 2, 2026: 5.6 °C above ambient; Prime mover failure (MNT-0366-026). Jul 9, 2026: 0 °C above ambient; Prime mover failure (MNT-0366-026). Jul 16, 2026: 5.2 °C above ambient; Prime mover failure (MNT-0366-026). Jul 23, 2026: 4 °C above ambient; Prime mover failure (MNT-0366-026). Jul 30, 2026: -0.4 °C above ambient; Prime mover failure (MNT-0366-026). Mar 19, 2026: 1.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0368-028). Apr 2, 2026: 0.7 °C above ambient; Prime mover failure (MNT-0369-028). Apr 9, 2026: 5.6 °C above ambient; Prime mover failure (MNT-0369-028). Apr 16, 2026: 2.7 °C above ambient; Prime mover failure (MNT-0369-028). May 7, 2026: 8.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0370-022). May 14, 2026: 4.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0370-022). May 21, 2026: 11.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0370-022). Oct 1, 2026: 13.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0370-026). Mar 12, 2026: 2.4 °C above ambient; Walking beam bearing wear (MNT-0373-024). Sep 3, 2026: 5 °C above ambient; Prime mover failure (MNT-0373-027). Feb 5, 2026: -0.5 °C above ambient; Prime mover failure (MNT-0374-022). Feb 26, 2026: 1.4 °C above ambient; Walking beam bearing wear (MNT-0374-024). Mar 5, 2026: 0.9 °C above ambient; Walking beam bearing wear (MNT-0374-024). Sep 3, 2026: 1.9 °C above ambient; Walking beam bearing wear (MNT-0374-027). Sep 10, 2026: 2.5 °C above ambient; Walking beam bearing wear (MNT-0374-027). Sep 17, 2026: -0.8 °C above ambient; Gearbox oil leak (MNT-0374-029). Dec 10, 2026: 4.5 °C above ambient; Separator level controller fault (MNT-0374-031). Dec 17, 2026: 2.9 °C above ambient; Separator level controller fault (MNT-0374-031). Jun 11, 2026: 10.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0375-024). Oct 15, 2026: 14.5 °C above ambient; ESP drive panel shows a trip.. Jan 22, 2026: 4.2 °C above ambient; Walking beam bearing wear (MNT-0376-024). Jan 29, 2026: 2.7 °C above ambient; Walking beam bearing wear (MNT-0376-024). Feb 5, 2026: -0.6 °C above ambient; Walking beam bearing wear (MNT-0376-024). Jun 18, 2026: 0.5 °C above ambient; Prime mover failure (MNT-0376-028). Jun 25, 2026: 1.5 °C above ambient; Prime mover failure (MNT-0376-028). Apr 23, 2026: 5 °C above ambient; Prime mover failure (MNT-0377-029). May 14, 2026: 5.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0377-030). May 21, 2026: 10.9 °C above ambient; Stuffing box packing leak (MNT-0377-031). May 28, 2026: 10.8 °C above ambient; Stuffing box packing leak (MNT-0377-031). Jun 4, 2026: 7.9 °C above ambient; Stuffing box packing leak (MNT-0377-031). Jun 11, 2026: 4.6 °C above ambient; Stuffing box packing leak (MNT-0377-031). Jan 15, 2026: -0.7 °C above ambient; Separator level controller fault (MNT-0378-024). Dec 31, 2026: 4.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0379-027). Apr 9, 2026: 4.7 °C above ambient; Walking beam bearing wear (MNT-0380-029). Apr 16, 2026: 0.5 °C above ambient; Walking beam bearing wear (MNT-0380-029). Apr 23, 2026: 2.7 °C above ambient; Walking beam bearing wear (MNT-0380-029). Apr 30, 2026: 1.6 °C above ambient; Walking beam bearing wear (MNT-0380-029). Nov 19, 2026: 0.7 °C above ambient; Stuffing box packing leak (MNT-0380-032). Nov 26, 2026: 7.2 °C above ambient; Stuffing box packing leak (MNT-0380-032). Apr 23, 2026: 8 °C above ambient; Flowline corrosion pinhole leak (MNT-0381-027). Jul 23, 2026: 7.1 °C above ambient; Prime mover failure (MNT-0381-030). Jul 30, 2026: 2.6 °C above ambient; Prime mover failure (MNT-0381-030). Aug 6, 2026: 6.6 °C above ambient; Prime mover failure (MNT-0381-030). May 28, 2026: 12.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0382-027). Jun 4, 2026: 13.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0382-027). Jun 11, 2026: 2.3 °C above ambient; ESP motor burnout (MNT-0382-028). Dec 17, 2026: 5.8 °C above ambient; ESP power cable insulation failure (MNT-0382-033). Dec 24, 2026: 14.6 °C above ambient; ESP power cable insulation failure (MNT-0382-033). May 21, 2026: 3.9 °C above ambient; Walking beam bearing wear (MNT-0384-020). May 28, 2026: 2.6 °C above ambient; Walking beam bearing wear (MNT-0384-020). Jun 4, 2026: 5 °C above ambient; Walking beam bearing wear (MNT-0384-020). Jun 11, 2026: 4.8 °C above ambient; Walking beam bearing wear (MNT-0384-020). Jun 18, 2026: -0.4 °C above ambient; Walking beam bearing wear (MNT-0384-020). Jun 25, 2026: 2.9 °C above ambient; Walking beam bearing wear (MNT-0384-020). May 28, 2026: 2.4 °C above ambient; Stuffing box packing leak (MNT-0385-026). Jun 4, 2026: 3 °C above ambient; Stuffing box packing leak (MNT-0385-026). Feb 19, 2026: 7.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0388-028). May 21, 2026: 13.5 °C above ambient; ESP power cable insulation failure (MNT-0388-031). May 28, 2026: 6.1 °C above ambient; ESP power cable insulation failure (MNT-0388-031). Jun 4, 2026: 8.2 °C above ambient; ESP power cable insulation failure (MNT-0388-031). Jun 11, 2026: 11 °C above ambient; ESP power cable insulation failure (MNT-0388-031). Nov 12, 2026: 10.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0388-035). Jul 30, 2026: 3.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0392-014). Jan 8, 2026: 7.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0393-023). Jan 15, 2026: 3.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0393-023). Jan 22, 2026: 4.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0393-023). Jan 29, 2026: 4 °C above ambient; Flowline corrosion pinhole leak (MNT-0393-023). Jan 1, 2026: -0.5 °C above ambient; Prime mover failure (MNT-0394-022). Jul 30, 2026: 0.1 °C above ambient; Walking beam bearing wear (MNT-0394-027). Nov 5, 2026: 2.3 °C above ambient; Stuffing box packing leak (MNT-0395-026). Nov 12, 2026: 5.6 °C above ambient; Stuffing box packing leak (MNT-0395-026). Feb 5, 2026: 0.3 °C above ambient; Walking beam bearing wear (MNT-0396-023). Mar 12, 2026: -0.8 °C above ambient; Downhole pump stuck (MNT-0398-018). Mar 19, 2026: -0.3 °C above ambient; Downhole pump stuck (MNT-0398-018). Mar 26, 2026: 5.8 °C above ambient; Downhole pump stuck (MNT-0398-018). May 14, 2026: 0.5 °C above ambient; Prime mover failure (MNT-0398-021). May 21, 2026: 1.2 °C above ambient; Prime mover failure (MNT-0398-021). Jan 8, 2026: 2.3 °C above ambient; Stuffing box packing leak (MNT-0399-019). Jul 16, 2026: -0.6 °C above ambient; Sucker rod parted (MNT-0399-024). Jul 23, 2026: 1.7 °C above ambient; Sucker rod parted (MNT-0399-024). Dec 31, 2026: 0.1 °C above ambient; Downhole pump stuck (MNT-0399-026). Jan 15, 2026: 14.8 °C above ambient; ESP motor burnout (MNT-0400-022). Apr 23, 2026: 2.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0400-025). Apr 30, 2026: 11.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0400-025). Nov 19, 2026: -0.6 °C above ambient; ESP motor burnout (MNT-0400-028). Nov 26, 2026: 13.6 °C above ambient; ESP motor burnout (MNT-0400-028). Dec 3, 2026: 6.4 °C above ambient; ESP motor burnout (MNT-0400-028). Dec 17, 2026: 9.7 °C above ambient; Separator level controller fault (MNT-0400-030). Dec 24, 2026: 13.5 °C above ambient; Separator level controller fault (MNT-0400-030). Dec 31, 2026: 3.7 °C above ambient; Separator level controller fault (MNT-0400-030). May 21, 2026: 15.1 °C above ambient; Wellhead cable penetrator leak (MNT-0401-028). May 28, 2026: 11 °C above ambient; Wellhead cable penetrator leak (MNT-0401-028). Jul 23, 2026: 0.1 °C above ambient; ESP power cable insulation failure (MNT-0401-030). Jul 30, 2026: 14.8 °C above ambient; ESP power cable insulation failure (MNT-0401-030). Aug 6, 2026: 10.8 °C above ambient; ESP power cable insulation failure (MNT-0401-030). Nov 26, 2026: 9.8 °C above ambient; ESP motor burnout (MNT-0401-032). Apr 23, 2026: 1.8 °C above ambient; Gearbox oil leak (MNT-0402-012). Apr 30, 2026: 4.6 °C above ambient; Gearbox oil leak (MNT-0402-012). May 7, 2026: 4.8 °C above ambient; Gearbox oil leak (MNT-0402-012). May 14, 2026: -0.7 °C above ambient; Gearbox oil leak (MNT-0402-012). Jul 16, 2026: 5.8 °C above ambient; Prime mover failure (MNT-0402-014). Jul 23, 2026: 3 °C above ambient; Prime mover failure (MNT-0402-014). Jul 30, 2026: 0 °C above ambient; Prime mover failure (MNT-0402-014). Oct 8, 2026: 3.4 °C above ambient; Separator level controller fault (MNT-0403-023). Jun 4, 2026: 3.5 °C above ambient; Prime mover failure (MNT-0404-030). Jun 11, 2026: 4.3 °C above ambient; Prime mover failure (MNT-0404-030). Jun 18, 2026: 3.8 °C above ambient; Prime mover failure (MNT-0404-030). Dec 24, 2026: 1.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0404-034). Dec 31, 2026: 1.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0404-034). Jan 22, 2026: 5.4 °C above ambient; Gearbox oil leak (MNT-0405-024). Jan 29, 2026: 4.1 °C above ambient; Gearbox oil leak (MNT-0405-024). Feb 5, 2026: 1.2 °C above ambient; Gearbox oil leak (MNT-0405-024). Nov 26, 2026: 2 °C above ambient; Flowline corrosion pinhole leak (MNT-0405-030). Dec 3, 2026: 4.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0405-030). Jun 11, 2026: 4.6 °C above ambient; Prime mover failure (MNT-0406-027). Jun 18, 2026: 1 °C above ambient; Prime mover failure (MNT-0406-027). Oct 8, 2026: 8.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0407-029). Oct 15, 2026: 8.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0407-029). Jun 11, 2026: -0.2 °C above ambient; Stuffing box packing leak (MNT-0408-029). Apr 30, 2026: 1.5 °C above ambient; Walking beam bearing wear (MNT-0409-027). May 7, 2026: 9.7 °C above ambient; Walking beam bearing wear (MNT-0409-027). Dec 3, 2026: 3.4 °C above ambient; ESP motor burnout (MNT-0410-030). Dec 10, 2026: 6 °C above ambient; ESP motor burnout (MNT-0410-030). Dec 17, 2026: 15.4 °C above ambient; ESP motor burnout (MNT-0410-030). Dec 24, 2026: 14.9 °C above ambient; ESP motor burnout (MNT-0410-030). Mar 26, 2026: 3.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0411-013). Apr 2, 2026: 7.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0411-013). Apr 9, 2026: 10.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0411-013). Apr 23, 2026: 9.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0411-014). Apr 30, 2026: 0.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0411-014). Dec 3, 2026: 12.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0411-023). Dec 10, 2026: 1.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0411-023). Dec 17, 2026: 8 °C above ambient; Flowline corrosion pinhole leak (MNT-0411-023). Dec 24, 2026: 5 °C above ambient; Flowline corrosion pinhole leak (MNT-0411-023). Dec 31, 2026: 2.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0411-023). Jan 1, 2026: 7.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0412-024). Dec 24, 2026: -0.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0412-032). May 28, 2026: 7.5 °C above ambient; Stuffing box packing leak (MNT-0414-028). Jun 4, 2026: 0.8 °C above ambient; Stuffing box packing leak (MNT-0414-028). Jun 11, 2026: 4.3 °C above ambient; Stuffing box packing leak (MNT-0414-028). Jun 18, 2026: 5.5 °C above ambient; Stuffing box packing leak (MNT-0414-028). Jun 25, 2026: 4.6 °C above ambient; Stuffing box packing leak (MNT-0414-028). Jul 2, 2026: 8.4 °C above ambient; Stuffing box packing leak (MNT-0414-028). Jul 23, 2026: 3.8 °C above ambient; Prime mover failure (MNT-0414-030). Aug 27, 2026: 7.4 °C above ambient; Stuffing box packing leak (MNT-0414-031). Sep 3, 2026: 4.1 °C above ambient; Stuffing box packing leak (MNT-0414-031). Sep 10, 2026: 10.8 °C above ambient; Stuffing box packing leak (MNT-0414-031). Sep 17, 2026: 0.1 °C above ambient; Stuffing box packing leak (MNT-0414-031). Sep 24, 2026: 2.8 °C above ambient; Stuffing box packing leak (MNT-0414-031). Oct 1, 2026: 3.3 °C above ambient; Stuffing box packing leak (MNT-0414-031). Jun 11, 2026: 4.9 °C above ambient; Separator level controller fault (MNT-0417-025). Jul 9, 2026: 7.3 °C above ambient; Stuffing box packing leak (MNT-0418-023). Mar 19, 2026: 0.8 °C above ambient; ESP motor burnout (MNT-0420-026). Mar 26, 2026: 3.6 °C above ambient; ESP motor burnout (MNT-0420-026). Aug 20, 2026: 2.5 °C above ambient; ESP power cable insulation failure (MNT-0420-029). Aug 27, 2026: 15.2 °C above ambient; ESP power cable insulation failure (MNT-0420-029). Sep 3, 2026: 9.1 °C above ambient; ESP power cable insulation failure (MNT-0420-029). Sep 10, 2026: 11.7 °C above ambient; ESP power cable insulation failure (MNT-0420-029). Sep 17, 2026: 3.8 °C above ambient; ESP power cable insulation failure (MNT-0420-029). Sep 24, 2026: 0.2 °C above ambient; ESP power cable insulation failure (MNT-0420-029). Sep 10, 2026: 1.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0421-030). Sep 17, 2026: 4.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0421-030). Jan 1, 2026: 2.3 °C above ambient; Walking beam bearing wear (MNT-0423-029). Jan 1, 2026: 6 °C above ambient; Sucker rod parted (MNT-0424-021). Jan 8, 2026: 2 °C above ambient; Sucker rod parted (MNT-0424-021). May 28, 2026: 4 °C above ambient; Gearbox oil leak (MNT-0425-026). Jun 4, 2026: 3.4 °C above ambient; Gearbox oil leak (MNT-0425-026). Sep 17, 2026: 6.8 °C above ambient; Sucker rod parted (MNT-0425-029). Sep 24, 2026: 10.4 °C above ambient; Sucker rod parted (MNT-0425-029). Nov 12, 2026: 5.9 °C above ambient; Walking beam bearing wear (MNT-0425-031). Jun 18, 2026: -0.1 °C above ambient; Downhole pump stuck (MNT-0426-030). Aug 6, 2026: 1.3 °C above ambient; Gearbox oil leak (MNT-0426-033). Feb 12, 2026: -0.8 °C above ambient; Downhole pump stuck (MNT-0427-020). Mar 5, 2026: 5.3 °C above ambient; Downhole pump stuck (MNT-0428-022). Mar 12, 2026: 4.2 °C above ambient; Downhole pump stuck (MNT-0428-022). Dec 3, 2026: 10 °C above ambient; Flowline corrosion pinhole leak (MNT-0429-034). Dec 10, 2026: 8.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0429-034). Dec 10, 2026: 2.8 °C above ambient; Wellhead cable penetrator leak (MNT-0430-030). Dec 17, 2026: 5.2 °C above ambient; Wellhead cable penetrator leak (MNT-0430-030). Dec 24, 2026: 1.9 °C above ambient; Wellhead cable penetrator leak (MNT-0430-030). Nov 19, 2026: 0.5 °C above ambient; Sucker rod parted (MNT-0431-029). Jan 29, 2026: 6.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0432-021). Feb 5, 2026: 6.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0432-021). Feb 12, 2026: 8.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0432-021). Feb 19, 2026: 3.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0432-021). Apr 2, 2026: 4.9 °C above ambient; Stuffing box packing leak (MNT-0432-023). May 21, 2026: 2.7 °C above ambient; Stuffing box packing leak (MNT-0432-024). Nov 5, 2026: 6.1 °C above ambient; Walking beam bearing wear (MNT-0432-028). Nov 12, 2026: 5.1 °C above ambient; Walking beam bearing wear (MNT-0432-028). Nov 19, 2026: 1.7 °C above ambient; Walking beam bearing wear (MNT-0432-028). Nov 26, 2026: 9.1 °C above ambient; Walking beam bearing wear (MNT-0432-028). Dec 10, 2026: 5.9 °C above ambient; Gearbox oil leak (MNT-0433-039). Dec 17, 2026: 4.2 °C above ambient; Gearbox oil leak (MNT-0433-039). Apr 2, 2026: -1 °C above ambient; Flowline corrosion pinhole leak (MNT-0434-023). Jun 11, 2026: 6.6 °C above ambient; Wellhead cable penetrator leak (MNT-0434-025). Nov 19, 2026: 4.4 °C above ambient; ESP motor burnout (MNT-0435-031). Dec 17, 2026: 2.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0436-030). Jan 8, 2026: 0.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0437-027). Nov 5, 2026: 4.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0438-030). Nov 12, 2026: 3.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0438-030). Nov 19, 2026: -0.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0438-030). Nov 26, 2026: 2.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0438-030). Feb 26, 2026: 2.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0439-024). Mar 5, 2026: 5.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0439-024). May 28, 2026: 1.1 °C above ambient; Prime mover failure (MNT-0439-027). Jun 4, 2026: 3.2 °C above ambient; Prime mover failure (MNT-0439-027). Jun 11, 2026: 0.9 °C above ambient; Prime mover failure (MNT-0439-027). Jun 18, 2026: 5.7 °C above ambient; Prime mover failure (MNT-0439-027). Jun 25, 2026: 1.3 °C above ambient; Prime mover failure (MNT-0439-027). Jul 2, 2026: -0.5 °C above ambient; Prime mover failure (MNT-0439-027). Aug 27, 2026: -0.9 °C above ambient; Prime mover failure (MNT-0439-030). Sep 3, 2026: 5.1 °C above ambient; Prime mover failure (MNT-0439-030). Sep 10, 2026: 0.6 °C above ambient; Prime mover failure (MNT-0439-030). Sep 17, 2026: -1 °C above ambient; Prime mover failure (MNT-0439-030). Sep 24, 2026: 4.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0439-032). Oct 1, 2026: 2.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0439-032). Nov 12, 2026: 1.7 °C above ambient; Walking beam bearing wear (MNT-0441-027). Mar 19, 2026: 3.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0443-025). Mar 26, 2026: 0.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0443-025). Feb 12, 2026: 8.2 °C above ambient; Walking beam bearing wear (MNT-0444-012). Feb 19, 2026: 2.2 °C above ambient; Walking beam bearing wear (MNT-0444-012). Feb 26, 2026: -1 °C above ambient; Walking beam bearing wear (MNT-0444-012). Mar 5, 2026: 8.6 °C above ambient; Walking beam bearing wear (MNT-0444-012). Mar 12, 2026: 0.3 °C above ambient; Walking beam bearing wear (MNT-0444-012). Mar 19, 2026: 4.9 °C above ambient; Walking beam bearing wear (MNT-0444-012). Jul 2, 2026: 13.4 °C above ambient; ESP motor burnout (MNT-0446-024). Jul 9, 2026: 14.4 °C above ambient; ESP motor burnout (MNT-0446-024). Nov 19, 2026: -0.3 °C above ambient; ESP power cable insulation failure (MNT-0446-026). Nov 26, 2026: 12.4 °C above ambient; ESP power cable insulation failure (MNT-0446-026). Feb 26, 2026: 8.8 °C above ambient; Stuffing box packing leak (MNT-0447-028). Aug 20, 2026: 1.5 °C above ambient; Prime mover failure (MNT-0447-032). Aug 6, 2026: 1.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0448-024). Aug 13, 2026: 15.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0448-024). Aug 20, 2026: -0.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0448-024). Aug 27, 2026: 2.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0448-024). Sep 3, 2026: 12.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0448-024). Sep 10, 2026: 1.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0448-024). Jan 1, 2026: 0.2 °C above ambient; Stuffing box packing leak (MNT-0449-026). Apr 23, 2026: 4.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0449-029). Nov 12, 2026: 3.3 °C above ambient; Sucker rod parted (MNT-0450-025). Sep 3, 2026: 4.9 °C above ambient; Stuffing box packing leak (MNT-0451-029). Sep 10, 2026: 5.4 °C above ambient; Stuffing box packing leak (MNT-0451-029). Sep 17, 2026: 4.8 °C above ambient; Stuffing box packing leak (MNT-0451-029). Dec 10, 2026: 6.5 °C above ambient; Prime mover failure (MNT-0452-030). Dec 31, 2026: -0.8 °C above ambient; Downhole pump stuck (MNT-0452-031). Aug 20, 2026: 4 °C above ambient; Prime mover failure (MNT-0453-028). Jan 1, 2026: 6.8 °C above ambient; Gearbox oil leak (MNT-0454-021). Apr 2, 2026: 4.1 °C above ambient; Separator level controller fault (MNT-0454-024). Apr 9, 2026: 6.2 °C above ambient; Separator level controller fault (MNT-0454-024). Dec 31, 2026: 8.9 °C above ambient; Sucker rod parted (MNT-0454-029). Aug 6, 2026: -0.5 °C above ambient; Walking beam bearing wear (MNT-0455-011). Oct 15, 2026: 3.1 °C above ambient; . Nov 26, 2026: 0.5 °C above ambient; Downhole pump stuck (MNT-0455-015). Dec 3, 2026: -1 °C above ambient; Downhole pump stuck (MNT-0455-015). Dec 10, 2026: 1.1 °C above ambient; Downhole pump stuck (MNT-0455-015). Dec 17, 2026: 5.4 °C above ambient; Downhole pump stuck (MNT-0455-015). Dec 24, 2026: 5.3 °C above ambient; Downhole pump stuck (MNT-0455-015). Dec 31, 2026: 4.1 °C above ambient; Downhole pump stuck (MNT-0455-015). Jan 15, 2026: 1 °C above ambient; Sucker rod parted (MNT-0456-023). Jan 22, 2026: 4 °C above ambient; Sucker rod parted (MNT-0456-023). Jan 29, 2026: 1.2 °C above ambient; Sucker rod parted (MNT-0456-023). Jun 25, 2026: 10.5 °C above ambient; Prime mover failure (MNT-0456-027). Jul 2, 2026: 10.4 °C above ambient; Prime mover failure (MNT-0456-027). Aug 27, 2026: 10.1 °C above ambient; Gearbox oil leak (MNT-0456-029). Sep 3, 2026: 1.7 °C above ambient; Gearbox oil leak (MNT-0456-029). Sep 10, 2026: 7.9 °C above ambient; Gearbox oil leak (MNT-0456-029). Dec 31, 2026: 5.9 °C above ambient; Sucker rod parted (MNT-0457-026). Jan 29, 2026: 8.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0458-020). Feb 5, 2026: 2.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0458-020). Jul 30, 2026: 5.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0458-024). Mar 5, 2026: 10.2 °C above ambient; Prime mover failure (MNT-0459-021). Mar 12, 2026: -0.2 °C above ambient; Prime mover failure (MNT-0459-021). Sep 3, 2026: 3 °C above ambient; Walking beam bearing wear (MNT-0459-025). Sep 10, 2026: 1 °C above ambient; Walking beam bearing wear (MNT-0459-025). Oct 1, 2026: 3.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0459-026). Dec 3, 2026: 7.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0459-031). Dec 10, 2026: 0.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0459-031). Dec 17, 2026: 1.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0459-031). Dec 24, 2026: 5.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0459-031). Dec 31, 2026: 10.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0459-031). Jan 8, 2026: -0.5 °C above ambient; Downhole pump stuck (MNT-0460-029). Jan 15, 2026: -0.3 °C above ambient; Downhole pump stuck (MNT-0460-029). Jan 22, 2026: -0.3 °C above ambient; Downhole pump stuck (MNT-0460-029). Jan 29, 2026: 4.3 °C above ambient; Downhole pump stuck (MNT-0460-029). Jan 29, 2026: 1.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0461-022). Feb 5, 2026: 4.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0461-022). Feb 12, 2026: 1.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0461-022). Dec 31, 2026: 9 °C above ambient; Downhole pump stuck (MNT-0462-031). Jul 2, 2026: -0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0463-019). Jul 16, 2026: 7.5 °C above ambient; Wellhead cable penetrator leak (MNT-0463-020). Jul 23, 2026: 10.1 °C above ambient; Wellhead cable penetrator leak (MNT-0463-020). Jul 30, 2026: 1.5 °C above ambient; Wellhead cable penetrator leak (MNT-0463-020). Mar 26, 2026: 12.4 °C above ambient; Wellhead cable penetrator leak (MNT-0464-021). Apr 2, 2026: 5.3 °C above ambient; Wellhead cable penetrator leak (MNT-0464-021). Apr 9, 2026: 6.3 °C above ambient; Wellhead cable penetrator leak (MNT-0464-021). Sep 17, 2026: 15.8 °C above ambient; Wellhead cable penetrator leak (MNT-0464-024). Sep 24, 2026: -0.4 °C above ambient; Wellhead cable penetrator leak (MNT-0464-024). Oct 1, 2026: 6 °C above ambient; Wellhead cable penetrator leak (MNT-0464-024). May 14, 2026: 3.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0466-023). May 21, 2026: 1.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0466-023). May 28, 2026: 2.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0466-023). Jun 4, 2026: -0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0466-023). Jun 11, 2026: 0.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0466-023). Jun 18, 2026: -0.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0466-023). Oct 1, 2026: 0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0466-027). Oct 8, 2026: 1.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0466-027). Oct 15, 2026: -0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0466-027). Dec 17, 2026: 6 °C above ambient; Prime mover failure (MNT-0466-029). May 7, 2026: 3 °C above ambient; ESP power cable insulation failure (MNT-0467-028). Apr 23, 2026: 2.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0469-024). Jul 23, 2026: 4.2 °C above ambient; Separator level controller fault (MNT-0469-026). Jan 22, 2026: -0.7 °C above ambient; Stuffing box packing leak (MNT-0471-025). Jan 29, 2026: 4.2 °C above ambient; Stuffing box packing leak (MNT-0471-025). Feb 5, 2026: 4.4 °C above ambient; Stuffing box packing leak (MNT-0471-025). Feb 12, 2026: 8.1 °C above ambient; Stuffing box packing leak (MNT-0471-025). Mar 26, 2026: 0.6 °C above ambient; Walking beam bearing wear (MNT-0472-019). Apr 2, 2026: 5.6 °C above ambient; Walking beam bearing wear (MNT-0472-019). Jul 16, 2026: 14.4 °C above ambient; Wellhead cable penetrator leak (MNT-0474-030). Dec 24, 2026: 14.5 °C above ambient; Separator level controller fault (MNT-0474-034). Dec 31, 2026: 9.6 °C above ambient; Separator level controller fault (MNT-0474-034). Mar 5, 2026: 3.9 °C above ambient; Sucker rod parted (MNT-0475-025). Mar 12, 2026: 2.1 °C above ambient; Sucker rod parted (MNT-0475-025). Mar 19, 2026: 3.2 °C above ambient; Sucker rod parted (MNT-0475-025). Mar 26, 2026: 3 °C above ambient; Sucker rod parted (MNT-0475-025). Apr 2, 2026: 2.2 °C above ambient; Downhole pump stuck (MNT-0475-027). Apr 9, 2026: 1.9 °C above ambient; Downhole pump stuck (MNT-0475-027). Apr 16, 2026: 0.9 °C above ambient; Downhole pump stuck (MNT-0475-027). Apr 23, 2026: 4.8 °C above ambient; Downhole pump stuck (MNT-0475-027). Jul 16, 2026: 5.2 °C above ambient; Downhole pump stuck (MNT-0475-030). Jun 25, 2026: 2.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0477-025). Jul 2, 2026: 4.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0477-025). Sep 3, 2026: 10 °C above ambient; Flowline corrosion pinhole leak (MNT-0478-022). Sep 10, 2026: 4.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0478-022). Apr 2, 2026: 2.5 °C above ambient; Gearbox oil leak (MNT-0481-021). Nov 12, 2026: 2.6 °C above ambient; Downhole pump stuck (MNT-0481-024). Nov 19, 2026: 3.6 °C above ambient; Downhole pump stuck (MNT-0481-024). Jan 1, 2026: 3.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0483-024). Sep 3, 2026: 4.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0483-031). Mar 26, 2026: 4.4 °C above ambient; Gearbox oil leak (MNT-0484-024). Jul 23, 2026: 2.7 °C above ambient; Prime mover failure (MNT-0484-029). Jul 30, 2026: 2.3 °C above ambient; Prime mover failure (MNT-0484-029). Aug 6, 2026: 0.1 °C above ambient; Prime mover failure (MNT-0484-029). Dec 24, 2026: 5.5 °C above ambient; Walking beam bearing wear (MNT-0484-033). Dec 31, 2026: 0.8 °C above ambient; Walking beam bearing wear (MNT-0484-033). Apr 16, 2026: 1 °C above ambient; ESP power cable insulation failure (MNT-0485-021). Jan 1, 2026: 5.5 °C above ambient; Sucker rod parted (MNT-0486-022). May 7, 2026: 2.9 °C above ambient; Stuffing box packing leak (MNT-0486-026). May 14, 2026: 4.7 °C above ambient; Stuffing box packing leak (MNT-0486-026). Jun 11, 2026: 0.6 °C above ambient; Walking beam bearing wear (MNT-0486-027). Jun 18, 2026: 1.4 °C above ambient; Walking beam bearing wear (MNT-0486-027). Jun 25, 2026: -0.7 °C above ambient; Walking beam bearing wear (MNT-0486-027). Jul 2, 2026: -0.6 °C above ambient; Walking beam bearing wear (MNT-0486-027). Jul 9, 2026: 1.6 °C above ambient; Walking beam bearing wear (MNT-0486-027). Jul 16, 2026: 3.3 °C above ambient; Walking beam bearing wear (MNT-0486-027). Apr 23, 2026: 6.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0487-019). Apr 30, 2026: 8.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0487-019). Nov 26, 2026: 12.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0487-024). Dec 3, 2026: -0.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0487-024). Aug 27, 2026: 4.4 °C above ambient; ESP power cable insulation failure (MNT-0488-028). Sep 10, 2026: 10.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0488-029). Sep 17, 2026: 1.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0488-029). Sep 24, 2026: 3.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0488-029). Oct 1, 2026: 9.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0488-029). Feb 12, 2026: 5.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0489-025). Jul 9, 2026: 1.2 °C above ambient; Walking beam bearing wear (MNT-0489-028). Jul 16, 2026: 0.2 °C above ambient; Walking beam bearing wear (MNT-0489-028). Jul 23, 2026: 4.3 °C above ambient; Walking beam bearing wear (MNT-0489-028). Jul 30, 2026: 5.4 °C above ambient; Walking beam bearing wear (MNT-0489-028). Jul 2, 2026: 0.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0491-024). Jul 9, 2026: 5.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0491-024). Sep 24, 2026: 0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0491-027). Oct 15, 2026: 5.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0491-027). Oct 22, 2026: 0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0491-027). Oct 29, 2026: -0.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0491-027). Feb 5, 2026: 3.5 °C above ambient; Separator level controller fault (MNT-0492-014). Feb 12, 2026: -0.7 °C above ambient; Separator level controller fault (MNT-0492-014). Feb 19, 2026: 5.4 °C above ambient; Separator level controller fault (MNT-0492-014). Feb 26, 2026: 3.7 °C above ambient; ESP power cable insulation failure (MNT-0496-022). Mar 5, 2026: 9 °C above ambient; ESP power cable insulation failure (MNT-0496-022). Jun 25, 2026: 0.2 °C above ambient; Wellhead cable penetrator leak (MNT-0496-026). Jul 2, 2026: 12.8 °C above ambient; Wellhead cable penetrator leak (MNT-0496-026). Jul 9, 2026: 15 °C above ambient; Wellhead cable penetrator leak (MNT-0496-026). Jul 23, 2026: 7.8 °C above ambient; Separator level controller fault (MNT-0496-027). Jul 30, 2026: 8.4 °C above ambient; Separator level controller fault (MNT-0496-027). Aug 6, 2026: 11.5 °C above ambient; Separator level controller fault (MNT-0496-027). Aug 13, 2026: 2.2 °C above ambient; ESP motor burnout (MNT-0496-028). Aug 20, 2026: 11.3 °C above ambient; ESP motor burnout (MNT-0496-028). Aug 27, 2026: 9.7 °C above ambient; ESP motor burnout (MNT-0496-028). Sep 17, 2026: -0.3 °C above ambient; ESP motor burnout (MNT-0496-030). Sep 24, 2026: 5 °C above ambient; ESP motor burnout (MNT-0496-030). Dec 17, 2026: 13.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0496-033). Dec 24, 2026: 5.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0496-033). Dec 31, 2026: 9.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0496-033). Jan 8, 2026: 14.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0498-024). Jan 15, 2026: 1.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0498-024). Jan 22, 2026: 6.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0498-024). Jan 29, 2026: 8.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0498-024). Feb 5, 2026: 9.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0498-024). Feb 12, 2026: 12.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0498-024). Dec 31, 2026: 6.5 °C above ambient; Separator level controller fault (MNT-0498-031). Jan 8, 2026: -0.3 °C above ambient; Sucker rod parted (MNT-0499-020). Jan 22, 2026: 0.6 °C above ambient; Sucker rod parted (MNT-0499-020). Jan 29, 2026: 5.4 °C above ambient; Sucker rod parted (MNT-0499-020). Feb 5, 2026: 4.8 °C above ambient; Sucker rod parted (MNT-0499-020). Feb 12, 2026: 3.2 °C above ambient; Sucker rod parted (MNT-0499-020). Jun 11, 2026: 5.8 °C above ambient; Walking beam bearing wear (MNT-0499-025). Jun 18, 2026: 5.3 °C above ambient; Walking beam bearing wear (MNT-0499-025). Apr 16, 2026: 0.8 °C above ambient; Sucker rod parted (MNT-0500-024). Apr 23, 2026: 6.7 °C above ambient; Sucker rod parted (MNT-0500-024). May 14, 2026: 8.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0500-025). May 28, 2026: 3.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0500-025). Jul 9, 2026: 9.9 °C above ambient; Prime mover failure (MNT-0500-027). Dec 10, 2026: 6 °C above ambient; Flowline corrosion pinhole leak (MNT-0501-028). Dec 17, 2026: 5.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0501-028). Sep 17, 2026: 1.8 °C above ambient; Prime mover failure (MNT-0502-027). Sep 24, 2026: -0.6 °C above ambient; Prime mover failure (MNT-0502-027). Dec 17, 2026: -0.6 °C above ambient; Prime mover failure (MNT-0504-026). Dec 24, 2026: 0.1 °C above ambient; Prime mover failure (MNT-0504-026). Jan 15, 2026: 4 °C above ambient; Prime mover failure (MNT-0505-022). Jan 22, 2026: 6 °C above ambient; Prime mover failure (MNT-0505-023). May 21, 2026: 4.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0505-027). Jul 30, 2026: 1.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0505-029). Aug 6, 2026: 4.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0505-029). Apr 9, 2026: 4.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0506-028). Nov 5, 2026: -0.9 °C above ambient; Prime mover failure (MNT-0506-032). Nov 12, 2026: -0.4 °C above ambient; Prime mover failure (MNT-0506-032). Nov 19, 2026: 4.3 °C above ambient; Prime mover failure (MNT-0506-032). Nov 26, 2026: 3.9 °C above ambient; Prime mover failure (MNT-0506-032). Dec 3, 2026: 5.4 °C above ambient; Prime mover failure (MNT-0506-032). Dec 10, 2026: -0.2 °C above ambient; Prime mover failure (MNT-0506-032). Jun 4, 2026: 6.2 °C above ambient; ESP motor burnout (MNT-0507-025). Jun 11, 2026: 0.9 °C above ambient; ESP motor burnout (MNT-0507-025). Sep 3, 2026: 2 °C above ambient; Prime mover failure (MNT-0509-034). Sep 10, 2026: 6.1 °C above ambient; Prime mover failure (MNT-0509-034). Sep 17, 2026: 6.5 °C above ambient; Prime mover failure (MNT-0509-034). Apr 9, 2026: 6.6 °C above ambient; Walking beam bearing wear (MNT-0510-030). Apr 16, 2026: 8.2 °C above ambient; Walking beam bearing wear (MNT-0510-030). May 7, 2026: 5.6 °C above ambient; Stuffing box packing leak (MNT-0510-031). May 14, 2026: 0.1 °C above ambient; Stuffing box packing leak (MNT-0510-031). May 21, 2026: 10.5 °C above ambient; Stuffing box packing leak (MNT-0510-031). May 28, 2026: 7.6 °C above ambient; Stuffing box packing leak (MNT-0510-031). Jun 4, 2026: 0.7 °C above ambient; Stuffing box packing leak (MNT-0510-031). Jun 11, 2026: 4.9 °C above ambient; Stuffing box packing leak (MNT-0510-031). May 21, 2026: 4.9 °C above ambient; Walking beam bearing wear (MNT-0511-027). May 28, 2026: -0.4 °C above ambient; Walking beam bearing wear (MNT-0511-027). Jun 4, 2026: 3.3 °C above ambient; Walking beam bearing wear (MNT-0511-027). Jan 1, 2026: 2.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0512-024). Feb 12, 2026: 0.5 °C above ambient; Sucker rod parted (MNT-0512-025). Dec 31, 2026: 9.6 °C above ambient; Stuffing box packing leak (MNT-0513-028). Jul 9, 2026: 11 °C above ambient; Flowline corrosion pinhole leak (MNT-0514-024). Feb 19, 2026: -0.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0515-019). Mar 5, 2026: 0.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0515-019). Mar 12, 2026: 2.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0515-019). Jan 22, 2026: -0.6 °C above ambient; Downhole pump stuck (MNT-0517-021). Jun 11, 2026: -0.1 °C above ambient; Prime mover failure (MNT-0517-025). Jul 2, 2026: 3.2 °C above ambient; Stuffing box packing leak (MNT-0517-026). Jul 9, 2026: 1.7 °C above ambient; Stuffing box packing leak (MNT-0517-026). Jan 1, 2026: 5.9 °C above ambient; Downhole pump stuck (MNT-0518-019). Oct 8, 2026: 3.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0519-029). Oct 15, 2026: 4.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0519-029). Oct 22, 2026: 9.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0519-029). Jan 1, 2026: 6.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0520-026). Jan 8, 2026: 15.1 °C above ambient; Flowline corrosion pinhole leak (MNT-0520-026). Jan 15, 2026: 12.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0520-026). Jan 22, 2026: 10.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0520-026). Jan 29, 2026: 6.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0520-026). Feb 5, 2026: 2.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0520-026). Jul 23, 2026: 4.2 °C above ambient; Prime mover failure (MNT-0521-023). Jul 30, 2026: 5.3 °C above ambient; Prime mover failure (MNT-0521-023). Apr 23, 2026: 8.9 °C above ambient; Prime mover failure (MNT-0524-021). Apr 30, 2026: 6.4 °C above ambient; Prime mover failure (MNT-0524-021). May 7, 2026: 2 °C above ambient; Prime mover failure (MNT-0524-021). Oct 15, 2026: 1.3 °C above ambient; . Dec 31, 2026: -0.7 °C above ambient; Prime mover failure (MNT-0526-026). Dec 31, 2026: 5.7 °C above ambient; Gearbox oil leak (MNT-0528-031). Apr 2, 2026: 3.6 °C above ambient; Prime mover failure (MNT-0529-012). Jul 30, 2026: 1 °C above ambient; Walking beam bearing wear (MNT-0529-015). Sep 17, 2026: 1.8 °C above ambient; Prime mover failure (MNT-0529-016). Sep 24, 2026: 8.5 °C above ambient; Prime mover failure (MNT-0529-016). Jul 2, 2026: 15.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0531-025). Jul 9, 2026: 11.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0531-025). Jul 16, 2026: 7.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0531-025). Sep 3, 2026: 2.7 °C above ambient; Prime mover failure (MNT-0532-029). May 14, 2026: 5.4 °C above ambient; Walking beam bearing wear (MNT-0534-027). May 21, 2026: 5 °C above ambient; Walking beam bearing wear (MNT-0534-027). May 28, 2026: 3.9 °C above ambient; Walking beam bearing wear (MNT-0534-027). Dec 3, 2026: 2.4 °C above ambient; Walking beam bearing wear (MNT-0535-024). May 14, 2026: 0.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0538-022). May 21, 2026: 4.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0538-022). May 28, 2026: 10.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0538-022). Jun 4, 2026: 1.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0538-022). Jul 30, 2026: 4.3 °C above ambient; Gearbox oil leak (MNT-0543-029). Jun 4, 2026: 11.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0544-026). Jul 9, 2026: 12.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0544-027). Oct 15, 2026: 15.8 °C above ambient; ESP drive panel shows a trip.. Apr 30, 2026: 9.1 °C above ambient; Walking beam bearing wear (MNT-0545-023). Jul 9, 2026: 8.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0545-028). Jan 15, 2026: -0.7 °C above ambient; Wellhead cable penetrator leak (MNT-0546-024). Jan 22, 2026: 12.3 °C above ambient; ESP motor burnout (MNT-0546-025). Jan 29, 2026: 10.9 °C above ambient; ESP motor burnout (MNT-0546-025). Feb 5, 2026: 13 °C above ambient; ESP motor burnout (MNT-0546-025). Apr 23, 2026: 11.2 °C above ambient; ESP motor burnout (MNT-0546-029). Apr 30, 2026: -0.9 °C above ambient; ESP motor burnout (MNT-0546-029). May 7, 2026: 2.4 °C above ambient; ESP motor burnout (MNT-0546-029). May 14, 2026: 8.1 °C above ambient; ESP motor burnout (MNT-0546-029). Jul 23, 2026: 5.3 °C above ambient; Separator level controller fault (MNT-0548-024). Jul 30, 2026: 1.4 °C above ambient; Separator level controller fault (MNT-0548-024). Aug 13, 2026: 0.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0548-025). Dec 3, 2026: 14.7 °C above ambient; Wellhead cable penetrator leak (MNT-0548-028). Dec 10, 2026: 8.7 °C above ambient; Wellhead cable penetrator leak (MNT-0548-028). May 21, 2026: 12 °C above ambient; ESP motor burnout (MNT-0552-024). May 28, 2026: -1 °C above ambient; ESP motor burnout (MNT-0552-024). Jun 4, 2026: 4.8 °C above ambient; ESP motor burnout (MNT-0552-024). Jun 11, 2026: 10 °C above ambient; ESP motor burnout (MNT-0552-024). Jul 30, 2026: 9 °C above ambient; Sucker rod parted (MNT-0554-024). Aug 6, 2026: -0.5 °C above ambient; Sucker rod parted (MNT-0554-024). Jun 4, 2026: 0.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0555-028). Mar 26, 2026: 5.7 °C above ambient; Wellhead cable penetrator leak (MNT-0556-028). Apr 9, 2026: 11.9 °C above ambient; ESP power cable insulation failure (MNT-0556-029). Apr 16, 2026: 4.7 °C above ambient; ESP power cable insulation failure (MNT-0556-029). Oct 15, 2026: 14.4 °C above ambient; . Feb 26, 2026: 1.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0557-023). Aug 6, 2026: -0.2 °C above ambient; ESP power cable insulation failure (MNT-0558-026). May 14, 2026: 9 °C above ambient; Wellhead cable penetrator leak (MNT-0559-025). May 21, 2026: 5.6 °C above ambient; Wellhead cable penetrator leak (MNT-0559-025). Apr 23, 2026: 1.1 °C above ambient; Walking beam bearing wear (MNT-0561-027). Apr 30, 2026: 5.1 °C above ambient; Walking beam bearing wear (MNT-0561-027). May 7, 2026: 0.6 °C above ambient; Walking beam bearing wear (MNT-0561-027). Jan 1, 2026: 5.1 °C above ambient; Stuffing box packing leak (MNT-0562-019). Oct 15, 2026: 3.6 °C above ambient; . Dec 31, 2026: 1.5 °C above ambient; Separator level controller fault (MNT-0562-025). Apr 30, 2026: 7.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0566-027). Feb 5, 2026: 1.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0567-023). Feb 12, 2026: 4.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0567-023). Feb 19, 2026: 5.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0567-023). Feb 26, 2026: -0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0567-023). May 14, 2026: 10.3 °C above ambient; Prime mover failure (MNT-0568-027). May 21, 2026: 10.5 °C above ambient; Prime mover failure (MNT-0568-027). Feb 19, 2026: 9.4 °C above ambient; Prime mover failure (MNT-0569-025). Feb 26, 2026: 5.2 °C above ambient; Prime mover failure (MNT-0569-025). May 28, 2026: -0.9 °C above ambient; Prime mover failure (MNT-0571-022). Jan 1, 2026: -0.2 °C above ambient; Sucker rod parted (MNT-0574-023). Jan 22, 2026: 9.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0575-018). Jan 29, 2026: 3.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0575-018). Feb 5, 2026: 5.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0575-018). May 21, 2026: 8.7 °C above ambient; Stuffing box packing leak (MNT-0575-022). Oct 1, 2026: 4.4 °C above ambient; Sucker rod parted (MNT-0576-020). Oct 8, 2026: 2.2 °C above ambient; Sucker rod parted (MNT-0576-020). Oct 15, 2026: 1.6 °C above ambient; Sucker rod parted (MNT-0576-020). Nov 19, 2026: 5.1 °C above ambient; Downhole pump stuck (MNT-0576-021). Nov 26, 2026: 5 °C above ambient; Downhole pump stuck (MNT-0576-021). Dec 3, 2026: 0.8 °C above ambient; Downhole pump stuck (MNT-0576-021). Dec 17, 2026: 1 °C above ambient; Gearbox oil leak (MNT-0576-022). Dec 24, 2026: 3.7 °C above ambient; Gearbox oil leak (MNT-0576-022). Dec 31, 2026: 3.9 °C above ambient; Gearbox oil leak (MNT-0576-022). Mar 12, 2026: 1.2 °C above ambient; Prime mover failure (MNT-0577-023). Mar 19, 2026: 4.7 °C above ambient; Prime mover failure (MNT-0577-023). Mar 26, 2026: 5.4 °C above ambient; Prime mover failure (MNT-0577-023). Apr 2, 2026: 3.4 °C above ambient; Prime mover failure (MNT-0577-023). Jul 30, 2026: 4.8 °C above ambient; Downhole pump stuck (MNT-0577-028). Aug 6, 2026: 0.1 °C above ambient; Downhole pump stuck (MNT-0577-028). Nov 19, 2026: 1.3 °C above ambient; Walking beam bearing wear (MNT-0577-032). Nov 26, 2026: 4.8 °C above ambient; Walking beam bearing wear (MNT-0577-032). Sep 10, 2026: 10.7 °C above ambient; Separator level controller fault (MNT-0578-029). Sep 17, 2026: 12.6 °C above ambient; Separator level controller fault (MNT-0578-029). Sep 24, 2026: 2.3 °C above ambient; Separator level controller fault (MNT-0578-029). Nov 12, 2026: 8.8 °C above ambient; Gearbox oil leak (MNT-0579-027). Nov 19, 2026: 3.8 °C above ambient; Gearbox oil leak (MNT-0579-027). Dec 17, 2026: -0.2 °C above ambient; Walking beam bearing wear (MNT-0579-028). Dec 24, 2026: 5.7 °C above ambient; Walking beam bearing wear (MNT-0579-028). Dec 31, 2026: 5 °C above ambient; Walking beam bearing wear (MNT-0579-028). Mar 12, 2026: 3.5 °C above ambient; Sucker rod parted (MNT-0580-024). Mar 19, 2026: 2.7 °C above ambient; Sucker rod parted (MNT-0580-024). Mar 19, 2026: 3 °C above ambient; Prime mover failure (MNT-0581-024). Dec 24, 2026: 5.4 °C above ambient; Stuffing box packing leak (MNT-0581-029). Dec 31, 2026: 2.4 °C above ambient; Stuffing box packing leak (MNT-0581-029). Nov 12, 2026: 4.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0583-029). Nov 19, 2026: 1.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0583-029). Nov 26, 2026: 2 °C above ambient; Flowline corrosion pinhole leak (MNT-0583-029). Apr 30, 2026: 9.1 °C above ambient; Separator level controller fault (MNT-0587-026). May 7, 2026: 5.8 °C above ambient; Separator level controller fault (MNT-0587-026). May 14, 2026: 7.7 °C above ambient; Separator level controller fault (MNT-0587-026). May 21, 2026: 8.8 °C above ambient; Separator level controller fault (MNT-0587-026). May 28, 2026: 6 °C above ambient; Separator level controller fault (MNT-0587-026). Jun 4, 2026: 8 °C above ambient; Separator level controller fault (MNT-0587-026). May 7, 2026: 12.3 °C above ambient; ESP motor burnout (MNT-0588-022). May 14, 2026: 11.2 °C above ambient; ESP motor burnout (MNT-0588-022). May 21, 2026: 10.1 °C above ambient; ESP motor burnout (MNT-0588-022). May 28, 2026: 14.7 °C above ambient; ESP motor burnout (MNT-0588-022). Jun 4, 2026: 8.4 °C above ambient; ESP motor burnout (MNT-0588-022). Jun 11, 2026: 8.2 °C above ambient; ESP motor burnout (MNT-0588-022). Jul 9, 2026: -0.9 °C above ambient; ESP power cable insulation failure (MNT-0588-024). Jul 16, 2026: 9.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0588-025). Dec 10, 2026: 4.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0589-032). Dec 17, 2026: -0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0589-032). Jan 1, 2026: 7.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-029). Jan 8, 2026: 7.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-029). Jan 15, 2026: 0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-029). Jan 22, 2026: 6.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-029). Feb 19, 2026: 6.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-031). Feb 26, 2026: 15.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-031). Sep 3, 2026: 3.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-035). Sep 10, 2026: 9.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-035). Sep 17, 2026: 14.4 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-035). Sep 24, 2026: 10 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-035). Oct 1, 2026: 11.5 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-035). Oct 8, 2026: 4.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0590-035). May 7, 2026: 5.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0592-023). May 14, 2026: 1.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0592-023). May 21, 2026: 0.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0592-023). May 28, 2026: -0.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0592-023). Jun 4, 2026: 3.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0592-023). Jun 11, 2026: -0.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0592-023). Sep 3, 2026: -0.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0592-025). Sep 10, 2026: 0.3 °C above ambient; Flowline corrosion pinhole leak (MNT-0592-025). Aug 27, 2026: 1.8 °C above ambient; Flowline corrosion pinhole leak (MNT-0593-023). Sep 3, 2026: -0.9 °C above ambient; Flowline corrosion pinhole leak (MNT-0593-023). Sep 10, 2026: 3.7 °C above ambient; Flowline corrosion pinhole leak (MNT-0593-023). Sep 17, 2026: -0.6 °C above ambient; Flowline corrosion pinhole leak (MNT-0593-023). Apr 30, 2026: -0.6 °C above ambient; Walking beam bearing wear (MNT-0595-025). Aug 13, 2026: 5.4 °C above ambient; Downhole pump stuck (MNT-0595-028). Aug 20, 2026: 2.5 °C above ambient; Downhole pump stuck (MNT-0595-028). Aug 27, 2026: 4.7 °C above ambient; Downhole pump stuck (MNT-0595-028). Sep 3, 2026: 0.9 °C above ambient; Downhole pump stuck (MNT-0595-028). May 7, 2026: 9.2 °C above ambient; Wellhead cable penetrator leak (MNT-0597-024). May 14, 2026: 8.9 °C above ambient; Wellhead cable penetrator leak (MNT-0597-024). Jun 18, 2026: 13.2 °C above ambient; Flowline corrosion pinhole leak (MNT-0597-026). Aug 27, 2026: 7.2 °C above ambient; Prime mover failure (MNT-0598-019). Sep 3, 2026: 8.4 °C above ambient; Prime mover failure (MNT-0598-019). Mar 12, 2026: -0.6 °C above ambient; Walking beam bearing wear (MNT-0599-021). Apr 30, 2026: -0.4 °C above ambient; Separator level controller fault (MNT-0599-024). Jul 2, 2026: 3.3 °C above ambient; Walking beam bearing wear (MNT-0599-026). Dec 31, 2026: 3.4 °C above ambient; Gearbox oil leak (MNT-0599-030). Nov 12, 2026: 0.2 °C above ambient; Gearbox oil leak (MNT-0600-028). Nov 19, 2026: 3.1 °C above ambient; Gearbox oil leak (MNT-0600-028).
~~~

**Visual:** none returned

**Citations (2399):** OM-T200, INS-0001-0181, MNT-0001-028, INS-0001-0202, INS-0001-0203, INS-0001-0206, MNT-0001-033, INS-0002-0135, MNT-0002-018, INS-0002-0136, INS-0002-0137, INS-0002-0138, INS-0002-0139, INS-0002-0140, INS-0002-0151, MNT-0002-020, INS-0002-0152, OM-T350, INS-0004-0172, MNT-0004-021, INS-0004-0173, INS-0004-0174, INS-0004-0175, INS-0004-0192, MNT-0004-026, INS-0004-0193, INS-0005-0188, MNT-0005-031, INS-0005-0189, INS-0005-0190, INS-0005-0191, INS-0005-0192, INS-0005-0193, INS-0006-0169, MNT-0006-023, INS-0006-0175, MNT-0006-025, INS-0006-0176, INS-0006-0178, MNT-0006-026 ... (40 of 2399 listed)

**Conflicts:** none

**Trace:** deterministic_planner (3083 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || downtime (6939 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q11

### Q11 turn 1

**Asker:** Grant (U-501)

**Question (exact):** Which region of the field consistently runs hotter?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_response; **latency:** durationMs=2910, wall=2928 ms

**Answer (verbatim):**

~~~text
Relevant source passages:

T350 operating manual [OM-T350]:
## 3. Production temperature rule

Because T350 fluid comes from a deeper, hotter zone, a T350 well is considered
**producing (active)** only when its wellhead temperature is at least **20 °C above
ambient** air temperature at the time of the reading.

Operator note · CTX-0067-002 [CTX-0067-002]:
{"note_id":"CTX-0067-002","asset_id":"WELL-0067","created_at":"2027-01-09T11:00:00Z","author_user_id":"U-401","note_type":"data_correction","inspection_id":"INS-0067-0216","field":"spill_est_volume_bbl","original_value":4.8,"corrected_value":5.6,"text":"Inspection INS-0067-0216: spill volume corrected from 4.8 bbl (AI estimate) to 5.6 bbl measured by the clean-up crew.","valid_from":"2027-01-07","valid_to":null}

Operator note · CTX-0213-002 [CTX-0213-002]:
{"note_id":"CTX-0213-002","asset_id":"WELL-0213","created_at":"2027-01-14T18:30:00Z","author_user_id":"U-502","note_type":"data_correction","inspection_id":"INS-0213-0221","field":"wellhead_temp_c","original_value":10.7,"corrected_value":30.6,"text":"Inspection INS-0213-0221: wellhead_temp_c corrected from 10.7 to 30.6. Thermal camera pointed at the shaded side of the wellhead; handheld re-measure.","valid_from":"2027-01-14","valid_to":null}
~~~

**Visual:** none returned

**Citations (6):** OM-T350, CTX-0067-002, CTX-0213-002, CTX-0201-002, OM-T500, OPERATIONS-SOP-REV2

**Conflicts:** none

**Trace:** deterministic_planner (2906 ms): Hosted planner unavailable (invalid_response); validated domain fallback used. Retry this question to reconnect. || document_retrieval (4 ms): Lexical index reused per dataset; 6 bounded evidence passages selected from 149877 records.

