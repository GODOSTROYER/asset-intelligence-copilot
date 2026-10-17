# FINAL_ANSWERS - Asset Intelligence Copilot, 11 final questions, test dataset

Run settings: SAMPLE_DATA_PATH=test-data/dataset, REFERENCE_DATE=2027-01-15 (600 wells, 7 areas, 125198 inspections, 17415 repairs), fresh COPILOT_STATE_DIR, hosted Gemini planner configured via .env.local, API on port 4292, code at the final commit. Each turn is one POST /api/chat {userId,text}. Raw JSON per turn: raw-v2/Q<n>-t<k>.json.

**Run note:** final run on the final code (planner schema fix for 600-well fleets + new document-driven tools). Earlier runs are preserved: FINAL_ANSWERS.fallback-run.md (schema bug, every turn fell back) and raw/ (hosted planner, before the new tools).


---

## Q1

### Q1 turn 1

**Asker:** Turner (U-201)

**Question (exact):** All our wells feed one reservoir. Map the reservoir pressure across the field from the pressure data.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2499, wall=2579 ms

**Answer (verbatim):**

~~~text
The data cannot answer this. It contains no reservoir pressure, and no tubing, casing, bottom-hole or live wellhead pressure measurements, for any well, so a pressure map or ranking cannot be drawn and I have not estimated one (for example from temperature, well type or production state).
What I scanned: field names in inspection, repair (maintenance), operator note / context, regulatory event, well metadata records (68 field names in all) and the text of 149,877 documents. Pressure-like field names found: none. Reservoir/pool/formation fields in well metadata: none.
Pressure-related facts that do exist, none of which is reservoir pressure:
- Flowline pressure tests in repair reports: 2,432 reports on 561 wells state a one-off test of a repaired flowline section (test pressure 188 to 400 psi, flowline maximum operating pressure 150 to 320 psi, held 4 hours). These are integrity tests of a repaired section, per job, not a field or reservoir reading.
- Separator alarm notes: 2 operator note(s) record a high pressure alarm on the separator (CTX-0422-003 on WELL-0422 2027-01-14; CTX-0481-006 on WELL-0481 2027-01-14), with no pressure value. An alarm is an event, not a measurement.
- Equipment ratings in the well-type manuals (T200: "Maximum allowable wellhead working pressure: 3,000 psi") are design limits, not readings. 2004 further repair reports mention pressure testing or bleeding off pressure without a figure.
The word "reservoir" appears only in generic manual text (OM-T200), and the data never states that wells share one reservoir.
To map reservoir pressure the data would need periodic or static pressure surveys (bottom-hole or shut-in wellhead pressure) per well, or a SCADA/well-test pressure feed with timestamps and units. What I can show instead, clearly labelled: wellhead and ambient temperature per inspection with producing status by the manual rule, spill volumes, and downtime. The requested map view is not supported for this result; the available evidence is shown as text.
~~~

**Visual:** none returned

**Citations (6):** MNT-0001-002, CTX-0422-003, CTX-0481-006, OM-T200, OM-T350, OM-T500

**Conflicts:** none

**Trace:** gemini_planner (2439 ms): Structured plan validated: data_availability. Only this user’s last five exchanges were supplied. || data_availability (60 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q2

### Q2 turn 1

**Asker:** Hayes (U-301)

**Question (exact):** Which well produced the most oil in 2026?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=3193, wall=3201 ms

**Answer (verbatim):**

~~~text
The data cannot name the well that produced the most oil in 2026. It holds no oil production volumes (barrels, rates, meter, allocation or tank readings) for any well.
What I scanned: field names in inspection, repair, note, regulatory and metadata records (68 field names in all) and document text. Volume-like fields found: none. The only barrel-valued field is spill_est_volume_bbl, the estimated volume of crude spilled, which is not production. Repair cost and downtime are not production either.
What I can offer is a labelled proxy, not oil volume: producing weeks in the period, meaning inspection readings (about one per week) on which wellhead minus ambient meets the well type's manual threshold (T200 15 C, T350 20 C, T500 25 C above ambient; the type in force on each reading date is used). The maximum is 53 producing readings out of 53, and 52 wells tie at that maximum; another 89 wells have 52. The proxy cannot rank them, and a higher-capacity well type may produce more oil than a smaller one with the same uptime.
Tied wells, listed by least repair downtime in the period as a secondary proxy (still not oil volume): WELL-0147 (T200, Northeast Block 7, 53/53 readings, 22 h downtime); WELL-0315 (T350, Northwest Block 12, 53/53 readings, 22 h downtime); WELL-0008 (T200, Southwest Block 23, 53/53 readings, 24 h downtime); WELL-0266 (T350, Northeast Block 8, 53/53 readings, 25 h downtime); WELL-0242 (T500, Southeast Block 31, 53/53 readings, 27 h downtime); WELL-0497 (T350, Southeast Block 32, 53/53 readings, 27 h downtime); WELL-0530 (T350, Southeast Block 32, 53/53 readings, 27 h downtime); WELL-0480 (T200, Southeast Block 32, 53/53 readings, 29 h downtime); WELL-0327 (T200, Northwest Block 12, 53/53 readings, 30 h downtime); WELL-0339 (T350, Northwest Block 12, 53/53 readings, 30 h downtime); and 42 more.
To answer properly the data would need production volumes per well (allocated or metered oil barrels, tank gauge or SCADA flow-rate history) for the period.
~~~

**Visual:** type=`table`, title="Producing-weeks proxy, tied top wells (not oil volume)"

| Well | Type | Area | Producing readings | Readings | Downtime h (secondary) |
| --- | --- | --- | --- | --- | --- |
| WELL-0147 | T200 | Northeast Block 7 | 53 | 53 | 22 |
| WELL-0315 | T350 | Northwest Block 12 | 53 | 53 | 22 |
| WELL-0008 | T200 | Southwest Block 23 | 53 | 53 | 24 |
| WELL-0266 | T350 | Northeast Block 8 | 53 | 53 | 25 |
| WELL-0242 | T500 | Southeast Block 31 | 53 | 53 | 27 |
| WELL-0497 | T350 | Southeast Block 32 | 53 | 53 | 27 |
| WELL-0530 | T350 | Southeast Block 32 | 53 | 53 | 27 |
| WELL-0480 | T200 | Southeast Block 32 | 53 | 53 | 29 |
| WELL-0327 | T200 | Northwest Block 12 | 53 | 53 | 30 |
| WELL-0339 | T350 | Northwest Block 12 | 53 | 53 | 30 |
| WELL-0364 | T200 | Northwest Block 12 | 53 | 53 | 30 |
| WELL-0371 | T200 | Northwest Block 12 | 53 | 53 | 30 |
| WELL-0594 | T200 | Southeast Block 32 | 53 | 53 | 30 |
| WELL-0016 | T200 | Southwest Block 23 | 53 | 53 | 31 |
| WELL-0051 | T200 | Southwest Block 24 | 53 | 53 | 31 |
| WELL-0230 | T500 | Southeast Block 31 | 53 | 53 | 31 |
| WELL-0024 | T350 | Southwest Block 23 | 53 | 53 | 32 |
| WELL-0228 | T500 | Southeast Block 31 | 53 | 53 | 32 |
| WELL-0223 | T500 | Southeast Block 31 | 53 | 53 | 33 |
| WELL-0231 | T200 | Southeast Block 31 | 53 | 53 | 34 |
| WELL-0106 | T200 | Northeast Block 7 | 53 | 53 | 35 |
| WELL-0539 | T200 | Southeast Block 32 | 53 | 53 | 35 |
| WELL-0212 | T500 | Southeast Block 31 | 53 | 53 | 36 |
| WELL-0343 | T200 | Northwest Block 12 | 53 | 53 | 36 |
| WELL-0440 | T500 | Northwest Block 12 | 53 | 53 | 36 |

(25 row(s))

**Citations (8):** OM-T200, OM-T350, OM-T500, WELL-0147, WELL-0315, WELL-0008, WELL-0266, WELL-0242

**Conflicts:** none

**Trace:** gemini_planner (2214 ms): Structured plan validated: data_availability. Only this user’s last five exchanges were supplied. || data_availability (979 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q3

### Q3 turn 1

**Asker:** Simmons (U-401)

**Question (exact):** Since 1 Nov 2026, every time an operator note reports gas at a well, did we get someone out to that well in time under our operating procedures? List every report and whether the response met the deadline.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2230, wall=2238 ms

**Answer (verbatim):**

~~~text
26 gas / H2S odor operator notes from Nov 1, 2026 to Jan 15, 2027 (26 wells): 17 Met, 9 Missed. OPS-1 (Revision 2 · Effective 1 Oct 2026 · Owner: Field Operations with Health, Safety & Environment (TEAM-HSE); response = maintenance job started on the well, or an inspection with method manual; drone inspections do not count; must start after the note): 24 h for reports before Jan 1, 2027; 12 h for reports from Jan 1, 2027. Missed: WELL-0163 (251.1 h vs 24 h), WELL-0341 (677.8 h vs 24 h), WELL-0332 (no qualifying response), WELL-0401 (138.2 h vs 24 h), WELL-0052 (no qualifying response), WELL-0362 (31.8 h vs 24 h), WELL-0161 (475.2 h vs 24 h), WELL-0599 (16.4 h vs 12 h), WELL-0516 (15 h vs 12 h).
~~~

**Visual:** type=`table`, title="Gas / H2S odor reports vs OPS-1 response deadline"

| Well | Area | Reported at | Response (record ID + time) | Hours to response | Deadline | Met / Missed |
| --- | --- | --- | --- | --- | --- | --- |
| WELL-0163 | Northeast Block 8 | 2026-11-03 20:55Z (CTX-0163-002) | MNT-0163-019 (maintenance job) at 2026-11-14 08:00Z | 251.1 | 24 h | Missed |
| WELL-0149 | Northeast Block 7 | 2026-11-06 18:20Z (CTX-0149-004) | MNT-0149-029 (maintenance job) at 2026-11-07 08:00Z | 13.7 | 24 h | Met |
| WELL-0165 | Northeast Block 8 | 2026-11-13 20:35Z (CTX-0165-001) | MNT-0165-031 (maintenance job) at 2026-11-14 08:00Z | 11.4 | 24 h | Met |
| WELL-0341 | Northwest Block 12 | 2026-11-19 07:40Z (CTX-0341-002) | INS-0341-0109 (manual inspection) at 2026-12-17 13:30Z | 677.8 | 24 h | Missed |
| WELL-0091 | Southwest Block 24 | 2026-11-27 22:25Z (CTX-0091-001) | MNT-0091-019 (maintenance job) at 2026-11-28 08:00Z | 9.6 | 24 h | Met |
| WELL-0423 | Northwest Block 12 | 2026-12-03 05:25Z (CTX-0423-002) | INS-0423-0213 (manual inspection) at 2026-12-03 09:15Z | 3.8 | 24 h | Met |
| WELL-0059 | Southwest Block 24 | 2026-12-03 06:10Z (CTX-0059-002) | INS-0059-0213 (manual inspection) at 2026-12-03 12:15Z | 6.1 | 24 h | Met |
| WELL-0332 | Northwest Block 12 | 2026-12-03 12:10Z (CTX-0332-004) | none | n/a | 24 h | Missed |
| WELL-0401 | Northwest Block 12 | 2026-12-05 13:50Z (CTX-0401-002) | MNT-0401-033 (maintenance job) at 2026-12-11 08:00Z | 138.2 | 24 h | Missed |
| WELL-0189 | Northeast Block 8 | 2026-12-10 12:35Z (CTX-0189-003) | MNT-0189-037 (maintenance job) at 2026-12-11 08:00Z | 19.4 | 24 h | Met |
| WELL-0403 | Northwest Block 12 | 2026-12-10 21:15Z (CTX-0403-004) | MNT-0403-024 (maintenance job) at 2026-12-11 08:00Z | 10.8 | 24 h | Met |
| WELL-0244 | Southeast Block 31 | 2026-12-11 05:25Z (CTX-0244-002) | MNT-0244-026 (maintenance job) at 2026-12-11 08:00Z | 2.6 | 24 h | Met |
| WELL-0040 | Southwest Block 23 | 2026-12-12 01:55Z (CTX-0040-002) | MNT-0040-029 (maintenance job) at 2026-12-12 08:00Z | 6.1 | 24 h | Met |
| WELL-0228 | Southeast Block 31 | 2026-12-16 19:50Z (CTX-0228-004) | INS-0228-0144 (manual inspection) at 2026-12-17 12:45Z | 16.9 | 24 h | Met |
| WELL-0052 | Southwest Block 24 | 2026-12-18 06:45Z (CTX-0052-003) | none | n/a | 24 h | Missed |
| WELL-0370 | Northwest Block 12 | 2026-12-21 12:45Z (CTX-0370-005) | MNT-0370-028 (maintenance job) at 2026-12-22 08:00Z | 19.2 | 24 h | Met |
| WELL-0362 | Northwest Block 12 | 2026-12-24 00:15Z (CTX-0362-002) | MNT-0362-030 (maintenance job) at 2026-12-25 08:00Z | 31.8 | 24 h | Missed |
| WELL-0161 | Northeast Block 8 | 2026-12-25 15:45Z (CTX-0161-006) | INS-0161-0168 (manual inspection) at 2027-01-14 11:00Z | 475.2 | 24 h | Missed |
| WELL-0135 | Northeast Block 7 | 2026-12-27 03:50Z (CTX-0135-009) | MNT-0135-034 (maintenance job) at 2026-12-27 08:00Z | 4.2 | 24 h | Met |
| WELL-0324 | Northwest Block 12 | 2027-01-01 22:40Z (CTX-0324-001) | MNT-0324-036 (maintenance job) at 2027-01-02 08:00Z | 9.3 | 12 h | Met |
| WELL-0330 | Northwest Block 12 | 2027-01-02 21:40Z (CTX-0330-003) | MNT-0330-030 (maintenance job) at 2027-01-03 08:00Z | 10.3 | 12 h | Met |
| WELL-0599 | Southeast Block 32 | 2027-01-06 17:20Z (CTX-0599-003) | INS-0599-0196 (manual inspection) at 2027-01-07 09:45Z | 16.4 | 12 h | Missed |
| WELL-0516 | Southeast Block 32 | 2027-01-06 21:15Z (CTX-0516-002) | INS-0516-0215 (manual inspection) at 2027-01-07 12:15Z | 15 | 12 h | Missed |
| WELL-0425 | Northwest Block 12 | 2027-01-07 05:20Z (CTX-0425-006) | INS-0425-0218 (manual inspection) at 2027-01-07 09:00Z | 3.7 | 12 h | Met |
| WELL-0465 | Southeast Block 32 | 2027-01-08 23:35Z (CTX-0465-005) | MNT-0465-031 (maintenance job) at 2027-01-09 08:00Z | 8.4 | 12 h | Met |
| WELL-0137 | Northeast Block 7 | 2027-01-10 23:30Z (CTX-0137-004) | MNT-0137-032 (maintenance job) at 2027-01-11 08:00Z | 8.5 | 12 h | Met |

(26 row(s))

**Citations (51):** OPERATIONS-SOP-REV2, CTX-0163-002, MNT-0163-019, CTX-0149-004, MNT-0149-029, CTX-0165-001, MNT-0165-031, CTX-0341-002, INS-0341-0109, CTX-0091-001, MNT-0091-019, CTX-0423-002, INS-0423-0213, CTX-0059-002, INS-0059-0213, CTX-0332-004, CTX-0401-002, MNT-0401-033, CTX-0189-003, MNT-0189-037, CTX-0403-004, MNT-0403-024, CTX-0244-002, MNT-0244-026, CTX-0040-002, MNT-0040-029, CTX-0228-004, INS-0228-0144, CTX-0052-003, CTX-0370-005, MNT-0370-028, CTX-0362-002, MNT-0362-030, CTX-0161-006, INS-0161-0168, CTX-0135-009, MNT-0135-034, CTX-0324-001, MNT-0324-036, CTX-0330-003 ... (40 of 51 listed)

**Conflicts:** none

**Trace:** gemini_planner (2153 ms): Structured plan validated: gas_response. Only this user’s last five exchanges were supplied. || gas_response (77 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q4

### Q4 turn 1

**Asker:** Dalton (U-402)

**Question (exact):** Across all areas, which temporary flowline bypasses are in place right now, and is each one allowed? Also list any bypass, past or present, that stayed in after its approval ran out or was never approved at all.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2276, wall=2283 ms

**Answer (verbatim):**

~~~text
12 temporary flowline bypasses found in the operator notes (3 in place now on 2027-01-15, 9 removed).
In place now: WELL-0249 (Southeast Block 31, Expired, valid until 15 Dec 2026; still in place 31 days past expiry (not extended)); WELL-0405 (Northwest Block 12, Not approved; well is named in no MOC memo); WELL-0248 (Southeast Block 31, Allowed, valid until 28 Feb 2027; expires in 44 days). 2 of these 3 are violations (WELL-0249 expired, WELL-0405 not approved).
Past violations (removed, but overstayed their approval or were never approved): WELL-0158 (Northeast Block 8, Expired, valid until 15 Dec 2026; stayed in 13 days past expiry (not extended)); WELL-0087 (Southwest Block 24, Expired, valid until 15 Dec 2026; stayed in 22 days past expiry (not extended)); WELL-0561 (Southeast Block 32, Not approved; well is named in no MOC memo).
Past bypasses that stayed within their approval: WELL-0476, WELL-0062, WELL-0013, WELL-0284, WELL-0461, WELL-0356.
Total violations: 5 of 12. Rule: a bypass needs a non-expired MOC naming the well; an extension memo replaces the expiry of the memo it extends, and expiry is the end of that day.
~~~

**Visual:** type=`table`, title="Temporary flowline bypasses and MOC approval"

| Well | Area | Bypass in | Bypass out | Approval | Approval valid until | Status |
| --- | --- | --- | --- | --- | --- | --- |
| WELL-0249 | Southeast Block 31 | 2026-11-25 | still in | MOC-2026-036 | 15 Dec 2026 | Expired (in place now) |
| WELL-0405 | Northwest Block 12 | 2026-12-20 | still in | none | n/a | Not approved (in place now) |
| WELL-0248 | Southeast Block 31 | 2026-11-05 | still in | MOC-2026-031, extended by MOC-2026-044 | 28 Feb 2027 | Allowed (in place now) |
| WELL-0158 | Northeast Block 8 | 2026-11-20 | 2026-12-28 | MOC-2026-036 | 15 Dec 2026 | Expired (past violation) |
| WELL-0087 | Southwest Block 24 | 2026-12-02 | 2027-01-06 | MOC-2026-036 | 15 Dec 2026 | Expired (past violation) |
| WELL-0561 | Southeast Block 32 | 2026-12-08 | 2026-12-19 | none | n/a | Not approved (past violation) |
| WELL-0476 | Southeast Block 32 | 2026-10-22 | 2026-11-18 | MOC-2026-031, extended by MOC-2026-044 | 28 Feb 2027 | Allowed |
| WELL-0062 | Southwest Block 24 | 2026-11-02 | 2026-11-27 | MOC-2026-031, extended by MOC-2026-044 | 28 Feb 2027 | Allowed |
| WELL-0013 | Southwest Block 23 | 2026-11-10 | 2027-01-08 | MOC-2026-031, extended by MOC-2026-044 | 28 Feb 2027 | Allowed |
| WELL-0284 | Southwest Block 24 | 2026-11-12 | 2026-12-10 | MOC-2026-036 | 15 Dec 2026 | Allowed |
| WELL-0461 | Southeast Block 32 | 2026-11-14 | 2026-12-12 | MOC-2026-036 | 15 Dec 2026 | Allowed |
| WELL-0356 | Northwest Block 12 | 2026-11-18 | 2026-12-05 | MOC-2026-036 | 15 Dec 2026 | Allowed |

(12 row(s))

**Citations (25):** CTX-0249-002, MOC-2026-036, CTX-0405-003, CTX-0248-002, MOC-2026-031, MOC-2026-044, CTX-0158-003, CTX-0158-005, CTX-0087-001, CTX-0087-004, CTX-0561-004, CTX-0561-005, CTX-0476-002, CTX-0476-003, CTX-0062-002, CTX-0062-005, CTX-0013-002, CTX-0013-005, CTX-0284-002, CTX-0284-003, CTX-0461-002, CTX-0461-003, CTX-0356-002, CTX-0356-003, OPERATIONS-SOP-REV2

**Conflicts:** none

**Trace:** gemini_planner (2234 ms): Structured plan validated: bypass_compliance. Only this user’s last five exchanges were supplied. || bypass_compliance (42 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q5

### Q5 turn 1

**Asker:** Turner (U-201)

**Question (exact):** The State Oil & Gas Commission wrote to us in November 2026 about spills. Which of our spills does the letter cover, and on which ones are we not compliant? Show me a table.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2258, wall=2274 ms

**Answer (verbatim):**

~~~text
The letter from State Oil & Gas Commission dated 20 Nov 2026 covers reportable spills (5 bbl or more) in Northeast Block 7 or Northeast Block 8 discovered since 1 Jun 2026, excluding detections later confirmed not to be crude oil. Soil results are due 15 Jan 2027 (today).
Scope narrowed to your team (TEAM-NE wells at the time of the spill).
6 spills are covered. Compliance test (HSE note in the letter): the clean-up report must contain the sentence "Soil samples sent to the lab."; field soil readings do not count.
Compliant (3): WELL-0119, WELL-0168, WELL-0277. Not compliant (3): WELL-0123 (no "Soil samples sent to the lab." sentence in the clean-up report (only 4 field soil samples, 0.68% TPH)); WELL-0182 (no "Soil samples sent to the lab." sentence in the clean-up report (only 4 field soil samples, 0.74% TPH)); WELL-0262 (no "Soil samples sent to the lab." sentence in the clean-up report (only 4 field soil samples, 0.77% TPH)).
Separate Spill Response SOP timing findings (not part of the letter test): WELL-0168 - SR-03 verification came 75 days after discovery vs 60 days (REG-0168-010) | WELL-0182 - SR-01 missed: written notice 50 h vs 24 h (REG-0182-003; NOV REG-0182-004 2027-01-02, USD 2,500, open) | WELL-0262 - SR-01 missed: written notice 17 h vs 12 h (REG-0262-001; no NOV yet); SR-02 missed: contained 6.4 h vs 4 h | WELL-0277 - SR-01 missed: written notice 38 h vs 24 h (REG-0277-001; NOV REG-0277-002 2026-10-18, USD 5,000, closed).
~~~

**Visual:** type=`table`, title="Spills covered by regulator letter 2026 11 20 and soil-sample compliance"

| Well | Area | Inspection | Volume (bbl) | Clean-up job | Compliant? |
| --- | --- | --- | --- | --- | --- |
| WELL-0119 | Northeast Block 7 | INS-0119-0209, 2026-11-05 | 6 | MNT-0119-029 (flowline, 2026-11-06) | Yes - report says "Soil samples sent to the lab." |
| WELL-0123 | Northeast Block 7 | INS-0123-0093, 2026-09-24 | 6 | MNT-0123-014 (flowline, 2026-09-25) | No - no "Soil samples sent to the lab." sentence in the clean-up report (only 4 field soil samples, 0.68% TPH) |
| WELL-0168 | Northeast Block 8 | INS-0168-0190, 2026-06-11 | 5.6 | MNT-0168-024 (flowline, 2026-06-12) | Yes - report says "Soil samples sent to the lab.". Also: SR-03 verification came 75 days after discovery vs 60 days (REG-0168-010) |
| WELL-0182 | Northeast Block 8 | INS-0182-0208, 2026-12-03 | 5.2 | MNT-0182-028 (flowline, 2026-12-04) | No - no "Soil samples sent to the lab." sentence in the clean-up report (only 4 field soil samples, 0.74% TPH). Also: SR-01 missed: written notice 50 h vs 24 h (REG-0182-003; NOV REG-0182-004 2027-01-02, USD 2,500, open) |
| WELL-0262 | Northeast Block 8 | INS-0262-0218, 2027-01-07 | 6.1 | MNT-0262-029 (flowline, 2027-01-08) | No - no "Soil samples sent to the lab." sentence in the clean-up report (only 4 field soil samples, 0.77% TPH). Also: SR-01 missed: written notice 17 h vs 12 h (REG-0262-001; no NOV yet); SR-02 missed: contained 6.4 h vs 4 h |
| WELL-0277 | Northeast Block 7 | INS-0277-0205, 2026-10-01 | 6.2 | MNT-0277-031 (flowline, 2026-10-02) | Yes - report says "Soil samples sent to the lab.". Also: SR-01 missed: written notice 38 h vs 24 h (REG-0277-001; NOV REG-0277-002 2026-10-18, USD 5,000, closed) |

(6 row(s))

**Citations (30):** REGULATOR-LETTER-2026-11-20, SPILL-RESPONSE-SOP, INS-0119-0209, MNT-0119-029, MNT-0119-029, INS-0123-0093, MNT-0123-014, MNT-0123-014, INS-0168-0190, MNT-0168-024, MNT-0168-024, REG-0168-009, REG-0168-010, INS-0182-0208, MNT-0182-028, MNT-0182-028, REG-0182-003, REG-0182-004, REG-0182-005, INS-0262-0218, MNT-0262-029, MNT-0262-029, REG-0262-001, INS-0277-0205, MNT-0277-031, MNT-0277-031, REG-0277-001, REG-0277-002, REG-0277-003, REG-0277-004

**Conflicts:** none

**Trace:** gemini_planner (2223 ms): Structured plan validated: regulator_letter. Only this user’s last five exchanges were supplied. || regulator_letter (34 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q6

### Q6 turn 1

**Asker:** Pierce (U-601)

**Question (exact):** Across the whole field, not just my area, for which wells do the latest inspection and the operator notes disagree about whether the well is producing oil? For each one, what is its real status right now, and why?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2631, wall=2636 ms

**Answer (verbatim):**

~~~text
10 well(s) across the whole field have an inspection and an operator note that disagree, where the note is newer: 6 shut-in after a producing reading (now not producing) and 4 restart after a not-producing reading (now producing, unconfirmed). Rule: OPS-3 - current status comes from the more recent of the latest inspection (after any data correction, judged by the well-type manual threshold in force on that date) and the latest operator note that says the well was shut in or restarted. A further 7 well(s) carry an older restart note but their later inspection still reads not producing; the inspection wins and they are listed as not producing. Excluded: 3 plugged/abandoned well(s); notes older than the latest inspection that agree with it (103 older shut-in notes before a producing reading); gas odor, bypass and equipment remarks, which do not set status.
~~~

**Visual:** type=`table`, title="Inspection vs operator note: status disagreements"

| Well | Area | Latest inspection (ID, date, shows) | Latest operator note (date and time, quote) | Status now | Why |
| --- | --- | --- | --- | --- | --- |
| WELL-0044 | Southwest Block 23 | INS-0044-0218, 2027-01-14 07:30 UTC: 30.7 - 7 = 23.7 °C vs 15 °C limit (T200) = producing | CTX-0044-008, 2027-01-14 13:05 UTC: "Shut in WELL-0044 at the wellhead, flowline leak suspected." | Not producing (shut in) | Shut-in note is 5.6 h newer than the inspection that read producing; OPS-3: the more recent evidence wins. |
| WELL-0323 | Northwest Block 12 | INS-0323-0219, 2027-01-14 14:45 UTC: 34.9 - 10.4 = 24.5 °C vs 15 °C limit (T200) = producing | CTX-0323-002, 2027-01-14 19:20 UTC: "Shut-in WELL-0323 after the pumper reported a stuffing box leak." | Not producing (shut in) | Shut-in note is 4.6 h newer than the inspection that read producing; OPS-3: the more recent evidence wins. |
| WELL-0355 | Northwest Block 12 | INS-0355-0213, 2027-01-14 15:15 UTC: 39 - 7.9 = 31.1 °C vs 15 °C limit (T200) = producing | CTX-0355-004, 2027-01-14 19:05 UTC: "Found WELL-0355 leaking at the stuffing box, shut the well in." | Not producing (shut in) | Shut-in note is 3.8 h newer than the inspection that read producing; OPS-3: the more recent evidence wins. |
| WELL-0422 | Northwest Block 12 | INS-0422-0215, 2027-01-14 15:15 UTC: 35.1 - 7.4 = 27.7 °C vs 20 °C limit (T350) = producing | CTX-0422-003, 2027-01-14 21:35 UTC: "Shut in WELL-0422 for the night, high pressure alarm on the separator." | Not producing (shut in) | Shut-in note is 6.3 h newer than the inspection that read producing; OPS-3: the more recent evidence wins. |
| WELL-0479 | Southeast Block 32 | INS-0479-0213, 2027-01-14 11:45 UTC: 31.7 - 8.1 = 23.6 °C vs 15 °C limit (T200) = producing | CTX-0479-004, 2027-01-14 15:35 UTC: "Found WELL-0479 leaking at the stuffing box, shut the well in." | Not producing (shut in) | Shut-in note is 3.8 h newer than the inspection that read producing; OPS-3: the more recent evidence wins. |
| WELL-0481 | Southeast Block 32 | INS-0481-0220, 2027-01-14 14:30 UTC: 27.2 - 4.8 = 22.4 °C vs 15 °C limit (T200) = producing | CTX-0481-006, 2027-01-14 18:50 UTC: "Shut in WELL-0481 for the night, high pressure alarm on the separator." | Not producing (shut in) | Shut-in note is 4.3 h newer than the inspection that read producing; OPS-3: the more recent evidence wins. |
| WELL-0026 | Southwest Block 23 | INS-0026-0216, 2027-01-14 12:15 UTC: 10.6 - 5.2 = 5.4 °C vs 15 °C limit (T200) = not producing ("Pump jack not moving.") | CTX-0026-001, 2027-01-15 10:25 UTC: "WELL-0026 put back on production after the repair crew finished." | Producing (unconfirmed) | Restart note is 22.2 h newer than the inspection that read not producing; OPS-3: producing, but unconfirmed until an inspection confirms it. Caveat: the restart note implies the repair finished, but MNT-0026-034 (flowline corrosion pinhole leak, started 2027-01-03) is still in progress, planned finish 2027-02-09. |
| WELL-0032 | Southwest Block 23 | INS-0032-0219, 2027-01-14 08:30 UTC: 19.4 - 12 = 7.4 °C vs 20 °C limit (T350) = not producing ("Wellhead cold to touch.") | CTX-0032-006, 2027-01-15 10:25 UTC: "Brought WELL-0032 back online after the pump change." | Producing (unconfirmed) | Restart note is 25.9 h newer than the inspection that read not producing; OPS-3: producing, but unconfirmed until an inspection confirms it. Caveat: the note refers to a repair but the latest job on file is MNT-0032-027 (scheduled, scheduled wellhead valve service). |
| WELL-0033 | Southwest Block 23 | INS-0033-0222, 2027-01-14 14:45 UTC: 16.2 - 6.2 = 10 °C vs 20 °C limit (T350) = not producing | CTX-0033-003, 2027-01-15 10:25 UTC: "Restarted WELL-0033, unit running smooth." | Producing (unconfirmed) | Restart note is 19.7 h newer than the inspection that read not producing; OPS-3: producing, but unconfirmed until an inspection confirms it. Caveat: the restart note implies the repair finished, but MNT-0033-033 (walking beam bearing wear, started 2027-01-09) is still in progress, planned finish 2027-02-02. |
| WELL-0046 | Southwest Block 23 | INS-0046-0220, 2027-01-14 13:00 UTC: 8.9 - 6.8 = 2.1 °C vs 15 °C limit (T200) = not producing | CTX-0046-004, 2027-01-15 10:25 UTC: "WELL-0046 put back on production after the repair crew finished." | Producing (unconfirmed) | Restart note is 21.4 h newer than the inspection that read not producing; OPS-3: producing, but unconfirmed until an inspection confirms it. Caveat: the restart note implies the repair finished, but MNT-0046-028 (stuffing box packing leak, started 2027-01-01) is still in progress, planned finish 2027-01-27. |
| WELL-0010 | Southwest Block 23 | INS-0010-0219, 2027-01-14 14:00 UTC: 27.7 - 10.2 = 17.5 °C vs 20 °C limit (T350) = not producing | CTX-0010-004, 2027-01-09 04:00 UTC: "Restarted WELL-0010 after the crew cleared the lockout." | Not producing | Restart note is older than the latest inspection, which still reads not producing; OPS-3: the inspection is the more recent evidence, so the well is not producing and the restart did not hold. |
| WELL-0219 | Southeast Block 31 | INS-0219-0171, 2027-01-14 08:45 UTC: 13.1 - 8.6 = 4.5 °C vs 25 °C limit (T500) = not producing ("No flow noise at the wellhead.") | CTX-0219-006, 2027-01-05 09:55 UTC: "WELL-0219 drive tripping on underload, restarted from the panel." | Not producing | Restart note is older than the latest inspection, which still reads not producing; OPS-3: the inspection is the more recent evidence, so the well is not producing and the restart did not hold. |
| WELL-0249 | Southeast Block 31 | INS-0249-0120, 2027-01-14 12:00 UTC: 16.1 - 10.2 = 5.9 °C vs 25 °C limit (T500) = not producing | CTX-0249-004, 2027-01-13 09:40 UTC: "WELL-0249 drive tripping on underload, restarted from the panel." | Not producing | Restart note is older than the latest inspection, which still reads not producing; OPS-3: the inspection is the more recent evidence, so the well is not producing and the restart did not hold. Open job: MNT-0249-018 (esp motor burnout, started 2027-01-09) is still in progress, planned finish 2027-02-02. |
| WELL-0330 | Northwest Block 12 | INS-0330-0213, 2027-01-14 07:15 UTC: 13 - 8.6 = 4.4 °C vs 15 °C limit (T200) = not producing ("No stroke observed during flight.") | CTX-0330-002, 2026-12-19 06:00 UTC: "WELL-0330 put back on production after the repair crew finished." | Not producing | Restart note is older than the latest inspection, which still reads not producing; OPS-3: the inspection is the more recent evidence, so the well is not producing and the restart did not hold. Open job: MNT-0330-030 (flowline corrosion pinhole leak, started 2027-01-03) is still in progress, planned finish 2027-01-27. |
| WELL-0332 | Northwest Block 12 | INS-0332-0217, 2027-01-14 14:45 UTC: 10.9 - 10.4 = 0.5 °C vs 15 °C limit (T200) = not producing | CTX-0332-003, 2026-11-20 20:00 UTC: "Restarted WELL-0332 after the crew cleared the lockout." | Not producing | Restart note is older than the latest inspection, which still reads not producing; OPS-3: the inspection is the more recent evidence, so the well is not producing and the restart did not hold. |
| WELL-0429 | Northwest Block 12 | INS-0429-0219, 2027-01-14 11:15 UTC: 18 - 11.8 = 6.2 °C vs 20 °C limit (T350) = not producing ("No stroke observed during flight.") | CTX-0429-004, 2026-11-14 05:30 UTC: "Restarted WELL-0429 after the crew cleared the lockout." | Not producing | Restart note is older than the latest inspection, which still reads not producing; OPS-3: the inspection is the more recent evidence, so the well is not producing and the restart did not hold. Open job: MNT-0429-037 (downhole pump stuck, started 2027-01-15) is still in progress, planned finish 2027-01-20. |
| WELL-0452 | Southeast Block 32 | INS-0452-0219, 2027-01-14 11:15 UTC: 10.9 - 7.8 = 3.1 °C vs 20 °C limit (T350) = not producing | CTX-0452-005, 2026-12-15 01:00 UTC: "Restarted WELL-0452, unit running smooth." | Not producing | Restart note is older than the latest inspection, which still reads not producing; OPS-3: the inspection is the more recent evidence, so the well is not producing and the restart did not hold. Open job: MNT-0452-031 (downhole pump stuck, started 2027-01-02) is still in progress, planned finish 2027-02-09. |

(17 row(s))

**Citations (45):** OPERATIONS-SOP-REV2, INS-0026-0216, CTX-0026-001, MNT-0026-034, INS-0032-0219, CTX-0032-006, INS-0033-0222, CTX-0033-003, MNT-0033-033, INS-0044-0218, CTX-0044-008, INS-0046-0220, CTX-0046-004, MNT-0046-028, INS-0323-0219, CTX-0323-002, INS-0355-0213, CTX-0355-004, INS-0422-0215, CTX-0422-003, INS-0479-0213, CTX-0479-004, INS-0481-0220, CTX-0481-006, INS-0010-0219, CTX-0010-004, INS-0219-0171, CTX-0219-006, INS-0249-0120, CTX-0249-004, MNT-0249-018, INS-0330-0213, CTX-0330-002, MNT-0330-030, INS-0332-0217, CTX-0332-003, INS-0429-0219, CTX-0429-004, MNT-0429-037, INS-0452-0219 ... (40 of 45 listed)

**Conflicts:** 

~~~json
[
 "WELL-0026: restart note CTX-0026-001 says the well is back on production, but MNT-0026-034 (flowline corrosion pinhole leak, started 2027-01-03) is still in progress, planned finish 2027-02-09.",
 "WELL-0033: restart note CTX-0033-003 says the well is back on production, but MNT-0033-033 (walking beam bearing wear, started 2027-01-09) is still in progress, planned finish 2027-02-02.",
 "WELL-0046: restart note CTX-0046-004 says the well is back on production, but MNT-0046-028 (stuffing box packing leak, started 2027-01-01) is still in progress, planned finish 2027-01-27."
]
~~~

**Trace:** gemini_planner (2522 ms): Structured plan validated: status_disagreement. Only this user’s last five exchanges were supplied. || status_disagreement (109 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q7

### Q7 turn 1

**Asker:** Hayes (U-301)

**Question (exact):** Over the last month the operators have written notes about wells that sound or behave wrong. Which of those wells haven't had a repair since? Rank the 10 most likely to need a repair in the next 90 days, other than a spill clean-up, and quote the notes as evidence.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=4201, wall=4208 ms

**Answer (verbatim):**

~~~text
175 well(s) have operator notes from 2026-12-15 to 2027-01-15 describing abnormal sound or behaviour (keywords: knocking, grinding, banging, vibration, squeal, rattling, tagging bottom, fluid pound, amps hunting, drive tripping, and similar). 12 of them already had a corrective (non-spill) repair start after the latest such note and are excluded (WELL-0019 (MNT-0019-032); WELL-0033 (MNT-0033-033); WELL-0058 (MNT-0058-033); WELL-0066 (MNT-0066-034); WELL-0069 (MNT-0069-039); WELL-0251 (MNT-0251-029); WELL-0313 (MNT-0313-027); WELL-0316 (MNT-0316-026); WELL-0335 (MNT-0335-032); WELL-0382 (MNT-0382-033); WELL-0540 (MNT-0540-025); WELL-0599 (MNT-0599-030)), leaving 163 candidates. Spill clean-up jobs are not counted as repairs. Plugged wells excluded: 3. Top 10 most likely to need a repair in the next 90 days: 1. WELL-0263 (score 22.8), 2. WELL-0219 (score 20.1), 3. WELL-0401 (score 16.6), 4. WELL-0202 (score 16), 5. WELL-0428 (score 14.5), 6. WELL-0023 (score 14), 7. WELL-0061 (score 13.5), 8. WELL-0305 (score 13), 9. WELL-0349 (score 12.5), 10. WELL-0336 (score 12.4). Area clustering: WELL-0263 and WELL-0023 are both in Southwest Block 23; WELL-0219 and WELL-0202 are both in Southeast Block 31; WELL-0401 and WELL-0428 and WELL-0305 and WELL-0349 and WELL-0336 are both in Northwest Block 12. Next in line: WELL-0182 (12), WELL-0286 (12), WELL-0020 (11), WELL-0010 (11), WELL-0270 (11). Score = worst symptom (1 to 3) + 1.5 per repeat note (max 3) + 1 for differing symptoms + 3 not producing now + decline trend (rule read from the well-type manual, e.g. T500 s.5: N consecutive drops totalling X °C or more; 0.25 per drop up to 2 plus 0.4 per °C of total fall up to 3, times 0.6 on wells whose own manual has no mandated check) + mandated check from that rule (days read from the manual): 7 plus up to 2 more by weeks late when its due date has PASSED with no check job (failure precursor and compliance breach), only 2 when triggered but not yet due + recalled pump still in the well (recall notice lots, only the latest installed pump counts): 9 once the replacement deadline has passed, else 6 + 5 overdue repair follow-up with no later "Follow-up to" job + repeat-failure history 2 per same-equipment corrective repair in 12 months (max 3) plus 2 at the RCA trigger - 6 if a repair on the lift equipment is already under way, - 3 if one finished during the notes.
~~~

**Visual:** type=`table`, title="Operator-note risk ranking"

| Rank | Well | Area | Operator-note evidence (date, quote) | Other warning signs | Last repair |
| --- | --- | --- | --- | --- | --- |
| 1 | WELL-0263 | Southwest Block 23 | CTX-0263-004, 2027-01-11: "Heard fluid pound on WELL-0263, unit still running." \| CTX-0263-005, 2027-01-14: "Rod squeal at WELL-0263 stuffing box, greased the polished rod." | 2 notes in the window; different symptoms reported (fluid pound, squeal); not producing now (2027-01-14: 4 °C vs 20 °C limit); wellhead-minus-air fell 3 inspections in a row, 36.5 to 4 (-32.5 °C) [T500 manual s.5 early warning, rule met at INS-0263-0219]; recalled pump still in the well: Highline RP-175 pump, serial SN-187332, lot LOT-2410-B (installed MNT-0263-033, 2026-10-16), replacement deadline 2026-12-31 missed; 2 corrective repair(s) on the same equipment in 12 months (MNT-0263-030 downhole pump stuck; MNT-0263-033 downhole pump stuck) [score 22.8: severity (fluid pound/squeal) +2, 2 notes +1.5, escalating variety +1, not producing now +3, temperature trend +2.3, recalled pump in well +9, 2 recent corrective repair(s) on the same equipment +4] | MNT-0263-035 flowline corrosion pinhole leak, 2027-01-09 to 2027-01-19 (in progress) |
| 2 | WELL-0219 | Southeast Block 31 | CTX-0219-006, 2027-01-05: "WELL-0219 drive tripping on underload, restarted from the panel." \| CTX-0219-007, 2027-01-13: "Drive on WELL-0219 showing amps hunting between 38 and 44 A." | 2 notes in the window; different symptoms reported (drive tripping, amps hunting); not producing now (2027-01-14: 4.5 °C vs 25 °C limit, "No flow noise at the wellhead."); wellhead-minus-air fell 6 inspections in a row, 37.4 to 4.5 (-32.9 °C) [T500 manual s.5 early warning, rule met at INS-0219-0168]; ESP drive and insulation check due 2027-01-07 (14 days after the drop on INS-0219-0168, T500 manual s.5), no check job since - 8 days overdue: a failure precursor and a compliance breach [score 20.1: severity (drive tripping/amps hunting) +2, 2 notes +1.5, escalating variety +1, not producing now +3, decline trend +4.5, mandated check OVERDUE +8.1] | MNT-0219-020 wellhead cable penetrator leak, 2026-08-21 to 2026-09-02 |
| 3 | WELL-0401 | Northwest Block 12 | CTX-0401-003, 2026-12-18: "WELL-0401 amps hunting on the drive panel, still running." \| CTX-0401-004, 2027-01-14: "WELL-0401 amps hunting on the drive panel, still running." | 2 notes in the window; wellhead-minus-air fell 6 inspections in a row, 36.9 to 30.3 (-6.6 °C) [T500 manual s.5 early warning, rule met at INS-0401-0220]; ESP drive and insulation check due 2027-01-21 (T500 manual s.5), not yet overdue; only 5.3 °C above the 25 °C producing limit; 2 corrective repair(s) on the same equipment in 12 months (MNT-0401-030 esp power cable insulation failure; MNT-0401-032 esp motor burnout), root-cause-analysis trigger reached [score 16.6: severity (amps hunting) +2, 2 notes +1.5, decline trend +4.1, mandated check due +2, near producing limit +1, 2 recent corrective repair(s) on the same equipment +6] | MNT-0401-032 esp motor burnout, 2026-11-27 to 2026-12-01 |
| 4 | WELL-0202 | Southeast Block 31 | CTX-0202-004, 2026-12-28: "WELL-0202 amps hunting on the drive panel, still running." | wellhead-minus-air fell 8 inspections in a row, 36.8 to 29.6 (-7.2 °C) [T500 manual s.5 early warning, rule met at INS-0202-0211]; ESP drive and insulation check due 2027-01-07 (14 days after the drop on INS-0202-0211, T500 manual s.5), no check job since - 8 days overdue: a failure precursor and a compliance breach; only 4.6 °C above the 25 °C producing limit [score 16: severity (amps hunting) +2, decline trend +4.9, mandated check OVERDUE +8.1, near producing limit +1] | MNT-0202-019 flowline corrosion pinhole leak, 2025-04-19 to 2025-04-29; later: MNT-0202-026 flowline leak causing spill, 2026-06-12 to 2026-06-13 |
| 5 | WELL-0428 | Northwest Block 12 | CTX-0428-002, 2027-01-01: "Heard fluid pound on WELL-0428, unit still running." \| CTX-0428-003, 2027-01-06: "Heard fluid pound on WELL-0428, unit still running." | 2 notes in the window; recalled pump still in the well: Highline RP-175 pump, serial SN-708611, lot LOT-2410-B (installed MNT-0428-022, 2026-03-07), replacement deadline 2026-12-31 missed; 1 corrective repair(s) on the same equipment in 12 months (MNT-0428-022 downhole pump stuck) [score 14.5: severity (fluid pound) +2, 2 notes +1.5, recalled pump in well +9, 1 recent corrective repair(s) on the same equipment +2] | MNT-0428-022 downhole pump stuck, 2026-03-07 to 2026-03-17; later: MNT-0428-025 flowline leak causing spill, 2026-04-17 to 2026-04-17 |
| 6 | WELL-0023 | Southwest Block 23 | CTX-0023-003, 2026-12-27: "Rod squeal at WELL-0023 stuffing box, greased the polished rod." \| CTX-0023-004, 2027-01-04: "Rod squeal at WELL-0023 stuffing box, greased the polished rod." \| CTX-0023-005, 2027-01-10: "Heard fluid pound on WELL-0023, unit still running." | 3 notes in the window; different symptoms reported (squeal, fluid pound); wellhead-minus-air fell 3 inspections in a row, 30.7 to 24.3 (-6.4 °C) [T500 manual s.5 early warning, rule met at INS-0023-0220]; 3 corrective repair(s) on the same equipment in 12 months (MNT-0023-025 prime mover failure; MNT-0023-030 walking beam bearing wear; MNT-0023-033 sucker rod parted) [score 14: severity (squeal/fluid pound) +2, 3 notes +3, escalating variety +1, temperature trend +2, 3 recent corrective repair(s) on the same equipment +6] | MNT-0023-033 sucker rod parted, 2026-12-06 to 2026-12-07 |
| 7 | WELL-0061 | Southwest Block 24 | CTX-0061-004, 2026-12-26: "WELL-0061 tagging bottom on the downstroke, adjust spacing next visit." \| CTX-0061-005, 2027-01-12: "Heard fluid pound on WELL-0061, unit still running." | 2 notes in the window; different symptoms reported (tagging bottom, fluid pound); 3 corrective repair(s) on the same equipment in 12 months (MNT-0061-025 sucker rod parted; MNT-0061-028 sucker rod parted; MNT-0061-031 sucker rod parted), root-cause-analysis trigger reached [score 13.5: severity (tagging bottom/fluid pound) +3, 2 notes +1.5, escalating variety +1, 3 recent corrective repair(s) on the same equipment +8] | MNT-0061-031 sucker rod parted, 2026-12-11 to 2026-12-21 |
| 8 | WELL-0305 | Northwest Block 12 | CTX-0305-004, 2027-01-11: "Pumper reports rattling at WELL-0305 pump jack, keep an eye on it." | recalled pump still in the well: Highline RP-175 pump, serial SN-978137, lot LOT-2409-A (installed MNT-0305-032, 2026-10-16), replacement deadline 2026-12-31 missed; 1 corrective repair(s) on the same equipment in 12 months (MNT-0305-030 gearbox oil leak) [score 13: severity (rattling) +2, recalled pump in well +9, 1 recent corrective repair(s) on the same equipment +2] | MNT-0305-032 downhole pump stuck, 2026-10-16 to 2026-10-21 |
| 9 | WELL-0349 | Northwest Block 12 | CTX-0349-001, 2026-12-19: "Pumper reports rattling at WELL-0349 pump jack, keep an eye on it." \| CTX-0349-002, 2027-01-03: "WELL-0349 tagging bottom on the downstroke, adjust spacing next visit." | 2 notes in the window; different symptoms reported (rattling, tagging bottom); overdue follow-up from MNT-0349-028 (due 2026-05-20, no later "Follow-up to" job): "Crew to return within 7 days to check the rod load and pump spacing."; 1 corrective repair(s) on the same equipment in 12 months (MNT-0349-028 sucker rod parted) [score 12.5: severity (rattling/tagging bottom) +3, 2 notes +1.5, escalating variety +1, overdue follow-up MNT-0349-028 +5, 1 recent corrective repair(s) on the same equipment +2] | MNT-0349-028 sucker rod parted, 2026-05-01 to 2026-05-13; later: MNT-0349-032 flowline leak causing spill, 2026-10-23 to 2026-10-24 |
| 10 | WELL-0336 | Northwest Block 12 | CTX-0336-003, 2026-12-24: "WELL-0336 amps hunting on the drive panel, still running." \| CTX-0336-004, 2027-01-07: "WELL-0336 drive tripping on underload, restarted from the panel." \| CTX-0336-005, 2027-01-14: "WELL-0336 amps hunting on the drive panel, still running." | 3 notes in the window; different symptoms reported (amps hunting, drive tripping); wellhead-minus-air fell 3 inspections in a row, 37.3 to 33.1 (-4.2 °C) [T500 manual s.5 early warning, rule met at INS-0336-0218]; ESP drive and insulation check due 2027-01-28 (T500 manual s.5), not yet overdue; 1 corrective repair(s) on the same equipment in 12 months (MNT-0336-026 esp motor burnout) [score 12.4: severity (amps hunting/drive tripping) +2, 3 notes +3, escalating variety +1, decline trend +2.4, mandated check due +2, 1 recent corrective repair(s) on the same equipment +2] | MNT-0336-026 esp motor burnout, 2026-05-08 to 2026-05-13 |

(10 row(s))

**Citations (54):** INS-0263-0219, MNT-0263-033, SUPPLIER-RECALL-NOTICE-2026-12-01, MNT-0263-030, MNT-0263-033, MNT-0263-035, CTX-0263-004, CTX-0263-005, INS-0219-0171, OM-T500, MNT-0219-020, CTX-0219-006, CTX-0219-007, INS-0401-0221, MNT-0401-030, MNT-0401-032, CTX-0401-003, CTX-0401-004, INS-0202-0214, MNT-0202-019, CTX-0202-004, INS-0428-0218, MNT-0428-022, MNT-0428-022, CTX-0428-002, CTX-0428-003, INS-0023-0220, MNT-0023-025, MNT-0023-030, MNT-0023-033, CTX-0023-003, CTX-0023-004, CTX-0023-005, INS-0061-0221, MNT-0061-025, MNT-0061-028, MNT-0061-031, CTX-0061-004, CTX-0061-005, INS-0305-0216 ... (40 of 54 listed)

**Conflicts:** none

**Trace:** gemini_planner (2300 ms): Structured plan validated: note_risk. Only this user’s last five exchanges were supplied. || note_risk (1901 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

### Q7 turn 2

**Asker:** Hayes (U-301)

**Question (exact):** Which three would you send a crew to first this week, and why?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_plan; **latency:** durationMs=4164, wall=4173 ms

**Answer (verbatim):**

~~~text
175 well(s) have operator notes from 2026-12-15 to 2027-01-15 describing abnormal sound or behaviour (keywords: knocking, grinding, banging, vibration, squeal, rattling, tagging bottom, fluid pound, amps hunting, drive tripping, and similar). 12 of them already had a corrective (non-spill) repair start after the latest such note and are excluded (WELL-0019 (MNT-0019-032); WELL-0033 (MNT-0033-033); WELL-0058 (MNT-0058-033); WELL-0066 (MNT-0066-034); WELL-0069 (MNT-0069-039); WELL-0251 (MNT-0251-029); WELL-0313 (MNT-0313-027); WELL-0316 (MNT-0316-026); WELL-0335 (MNT-0335-032); WELL-0382 (MNT-0382-033); WELL-0540 (MNT-0540-025); WELL-0599 (MNT-0599-030)), leaving 163 candidates. Spill clean-up jobs are not counted as repairs. Plugged wells excluded: 3. Send a crew first to: 1. WELL-0263 (Southwest Block 23, score 22.8) - repeat notes (CTX-0263-004, CTX-0263-005); already not producing (INS-0263-0219: 4 °C above air vs 20 °C); steady decline: 3 drops, -32.5 °C (INS-0263-0219); recalled pump LOT-2410-B (MNT-0263-033) past the 2026-12-31 deadline; 2 repairs on the same equipment in 12 months (MNT-0263-030, MNT-0263-033); notes CTX-0263-004, CTX-0263-005. 2. WELL-0219 (Southeast Block 31, score 20.1) - repeat notes (CTX-0219-006, CTX-0219-007); already not producing (INS-0219-0171: 4.5 °C above air vs 25 °C); steady decline: 6 drops, -32.9 °C (INS-0219-0168); T500 manual s.5 mandated ESP drive and insulation check OVERDUE since 2027-01-07 (8 days; drop INS-0219-0168), no check job on record; notes CTX-0219-006, CTX-0219-007. 3. WELL-0202 (Southeast Block 31, score 16) - picked ahead of WELL-0401 (score 16.6) because its score 16 is within 20% of it and it is in the same area (Southeast Block 31) as WELL-0219, so one crew trip covers both; steady decline: 8 drops, -7.2 °C (INS-0202-0211); T500 manual s.5 mandated ESP drive and insulation check OVERDUE since 2027-01-07 (8 days; drop INS-0202-0211), no check job on record; notes CTX-0202-004. Trip logistics: WELL-0219 and WELL-0202 are both in Southeast Block 31, so one crew trip can cover them. Picks start from the top-ranked well, then prefer a high-risk well (within 20% of the next candidate's score) in the same area as one already chosen. Score = worst symptom (1 to 3) + 1.5 per repeat note (max 3) + 1 for differing symptoms + 3 not producing now + decline trend (rule read from the well-type manual, e.g. T500 s.5: N consecutive drops totalling X °C or more; 0.25 per drop up to 2 plus 0.4 per °C of total fall up to 3, times 0.6 on wells whose own manual has no mandated check) + mandated check from that rule (days read from the manual): 7 plus up to 2 more by weeks late when its due date has PASSED with no check job (failure precursor and compliance breach), only 2 when triggered but not yet due + recalled pump still in the well (recall notice lots, only the latest installed pump counts): 9 once the replacement deadline has passed, else 6 + 5 overdue repair follow-up with no later "Follow-up to" job + repeat-failure history 2 per same-equipment corrective repair in 12 months (max 3) plus 2 at the RCA trigger - 6 if a repair on the lift equipment is already under way, - 3 if one finished during the notes.
~~~

**Visual:** type=`table`, title="Where to send a crew first"

| Rank | Well | Area | Why send a crew first | Operator-note evidence | Last repair |
| --- | --- | --- | --- | --- | --- |
| 1 | WELL-0263 | Southwest Block 23 | repeat notes (CTX-0263-004, CTX-0263-005); already not producing (INS-0263-0219: 4 °C above air vs 20 °C); steady decline: 3 drops, -32.5 °C (INS-0263-0219); recalled pump LOT-2410-B (MNT-0263-033) past the 2026-12-31 deadline; 2 repairs on the same equipment in 12 months (MNT-0263-030, MNT-0263-033); notes CTX-0263-004, CTX-0263-005 (score 22.8) | CTX-0263-004, 2027-01-11: "Heard fluid pound on WELL-0263, unit still running." \| CTX-0263-005, 2027-01-14: "Rod squeal at WELL-0263 stuffing box, greased the polished rod." | MNT-0263-035 flowline corrosion pinhole leak, 2027-01-09 to 2027-01-19 (in progress) |
| 2 | WELL-0219 | Southeast Block 31 | repeat notes (CTX-0219-006, CTX-0219-007); already not producing (INS-0219-0171: 4.5 °C above air vs 25 °C); steady decline: 6 drops, -32.9 °C (INS-0219-0168); T500 manual s.5 mandated ESP drive and insulation check OVERDUE since 2027-01-07 (8 days; drop INS-0219-0168), no check job on record; notes CTX-0219-006, CTX-0219-007 (score 20.1) | CTX-0219-006, 2027-01-05: "WELL-0219 drive tripping on underload, restarted from the panel." \| CTX-0219-007, 2027-01-13: "Drive on WELL-0219 showing amps hunting between 38 and 44 A." | MNT-0219-020 wellhead cable penetrator leak, 2026-08-21 to 2026-09-02 |
| 3 | WELL-0202 | Southeast Block 31 | picked ahead of WELL-0401 (score 16.6) because its score 16 is within 20% of it and it is in the same area (Southeast Block 31) as WELL-0219, so one crew trip covers both; steady decline: 8 drops, -7.2 °C (INS-0202-0211); T500 manual s.5 mandated ESP drive and insulation check OVERDUE since 2027-01-07 (8 days; drop INS-0202-0211), no check job on record; notes CTX-0202-004 (score 16) | CTX-0202-004, 2026-12-28: "WELL-0202 amps hunting on the drive panel, still running." | MNT-0202-019 flowline corrosion pinhole leak, 2025-04-19 to 2025-04-29; later: MNT-0202-026 flowline leak causing spill, 2026-06-12 to 2026-06-13 |

(3 row(s))

**Citations (16):** INS-0263-0219, MNT-0263-033, SUPPLIER-RECALL-NOTICE-2026-12-01, MNT-0263-030, MNT-0263-033, MNT-0263-035, CTX-0263-004, CTX-0263-005, INS-0219-0171, OM-T500, MNT-0219-020, CTX-0219-006, CTX-0219-007, INS-0202-0214, MNT-0202-019, CTX-0202-004

**Conflicts:** none

**Trace:** deterministic_planner (2401 ms): Hosted planner unavailable (invalid_plan); validated domain fallback used. Retry this question to reconnect. || note_risk (1763 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q8

### Q8 turn 1

**Asker:** Pierce (U-601)

**Question (exact):** WELL-0333's recalled pump was swapped out yesterday. The work order isn't in the system yet. Please count it as replaced from now on.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2400, wall=2408 ms

**Answer (verbatim):**

~~~text
Recorded Nathan Pierce’s report as an unconfirmed shared claim on WELL-0333 (no work order is on record yet; it is attributed to Nathan Pierce and visible to all users, but it does not overwrite the maintenance records). 1 well has a recalled pump in the ground (Highline RP-175 LOT-2409-A/LOT-2409-C/LOT-2410-B, notice HPC-RN-2026-07). By area: Northwest Block 12 = 1. The installed pump is the latest "Parts installed" line by job start date, so a later non-recalled pump removes the well from the list. Total install cost of the listed jobs: USD 15,440. The replacement deadline was 31 Dec 2026. Status uses the latest inspection against the well-type threshold; "last repair" is the latest completed corrective job start date plus any job still in progress today. 1 well carries an unconfirmed replacement report (WELL-0333 report by Nathan Pierce). Reports alone do not remove a well: 1 per the records, 0 if those reports are confirmed by a work order.
~~~

**Visual:** type=`table`, title="Recalled pumps still in the ground"

| Well | Area | Pump (model, serial, lot) | Installed by | Install cost | Status now | Last repair | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WELL-0333 | Northwest Block 12 | Highline RP-175, SN-507591, LOT-2409-A | MNT-0333-024 (May 9, 2026) | USD 15,440 | Producing | Jun 6, 2026 (MNT-0333-026, Flowline corrosion pinhole leak) | HPC-RN-2026-07; MNT-0333-024 report | Reported replaced by Nathan Pierce on Oct 17, 2026, unconfirmed: no work order on record |

(1 row(s))

**Citations (6):** CLAIM-f24a665b-e209-48c5-bc9e-974eff89597a, SUPPLIER-RECALL-NOTICE-2026-12-01, CLAIM-f24a665b-e209-48c5-bc9e-974eff89597a, MNT-0333-024, MNT-0333-024, MNT-0333-026

**Conflicts:** 

~~~json
[
 "WELL-0333: Nathan Pierce (in charge of this well) reported on Oct 17, 2026 that the recalled pump was replaced, but the records show recalled LOT-2409-A (MNT-0333-024) still installed and no work order or Parts-installed report for a replacement. Kept on the list as unconfirmed."
]
~~~

**Trace:** gemini_planner (2377 ms): Structured plan validated: claim. Only this user’s last five exchanges were supplied. || claim (23 ms): Explicit user feedback applied by the scoped domain tool with provenance.

### Q8 turn 2

**Asker:** Pierce (U-601)

**Question (exact):** Also, just for me: whenever you list wells, sort them by area and then by well ID, and show costs in thousands of dollars.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2404, wall=2424 ms

**Answer (verbatim):**

~~~text
Saved as a private display preference for Nathan Pierce: “Also, just for me: whenever you list wells, sort them by area and then by well ID, and show costs in thousands of dollars.” It applies only to your future answers; other users are not affected.
~~~

**Visual:** none returned

**Citations (0):** none

**Conflicts:** none

**Memory:** ~~~json ["Private preference saved for Nathan Pierce."] ~~~

**Trace:** gemini_planner (2404 ms): Structured plan validated: preference. Only this user’s last five exchanges were supplied. || preference (0 ms): Explicit user feedback applied by the scoped domain tool with provenance.

### Q8 turn 3

**Asker:** Hayes (U-301)

**Question (exact):** Which recalled pumps are still in the ground right now?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2428, wall=2446 ms

**Answer (verbatim):**

~~~text
9 wells have a recalled pump in the ground (Highline RP-175 LOT-2409-A/LOT-2409-C/LOT-2410-B, notice HPC-RN-2026-07). By area: Northwest Block 12 = 4, Northeast Block 8 = 2, Southwest Block 23 = 2, Southeast Block 32 = 1. The installed pump is the latest "Parts installed" line by job start date, so a later non-recalled pump removes the well from the list. Total install cost of the listed jobs: USD 209,949. The replacement deadline was 31 Dec 2026. Status uses the latest inspection against the well-type threshold; "last repair" is the latest completed corrective job start date plus any job still in progress today. 1 well carries an unconfirmed replacement report (WELL-0333 report by Nathan Pierce). Reports alone do not remove a well: 9 per the records, 8 if those reports are confirmed by a work order.
~~~

**Visual:** type=`table`, title="Recalled pumps still in the ground"

| Well | Area | Pump (model, serial, lot) | Installed by | Install cost | Status now | Last repair | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WELL-0156 | Northeast Block 8 | Highline RP-175, SN-952958, LOT-2409-A | MNT-0156-027 (Jun 27, 2026) | USD 23,398 | Producing | Dec 4, 2026 (MNT-0156-030, Flowline leak causing spill) | HPC-RN-2026-07; MNT-0156-027 report |  |
| WELL-0160 | Northeast Block 8 | Highline RP-175, SN-429965, LOT-2409-C | MNT-0160-028 (Jul 18, 2026) | USD 33,086 | Not producing | Jul 31, 2026 (MNT-0160-029, Prime mover failure); in progress: MNT-0160-032 started Jan 15, 2027 | HPC-RN-2026-07; MNT-0160-028 report |  |
| WELL-0305 | Northwest Block 12 | Highline RP-175, SN-978137, LOT-2409-A | MNT-0305-032 (Oct 16, 2026) | USD 24,528 | Producing | Oct 16, 2026 (MNT-0305-032, Downhole pump stuck) | HPC-RN-2026-07; MNT-0305-032 report |  |
| WELL-0333 | Northwest Block 12 | Highline RP-175, SN-507591, LOT-2409-A | MNT-0333-024 (May 9, 2026) | USD 15,440 | Producing | Jun 6, 2026 (MNT-0333-026, Flowline corrosion pinhole leak) | HPC-RN-2026-07; MNT-0333-024 report | Reported replaced by Nathan Pierce on Oct 17, 2026, unconfirmed: no work order on record |
| WELL-0426 | Northwest Block 12 | Highline RP-175, SN-880271, LOT-2409-C | MNT-0426-030 (Jun 19, 2026) | USD 24,044 | Producing | Aug 9, 2026 (MNT-0426-033, Gearbox oil leak) | HPC-RN-2026-07; MNT-0426-030 report |  |
| WELL-0428 | Northwest Block 12 | Highline RP-175, SN-708611, LOT-2410-B | MNT-0428-022 (Mar 7, 2026) | USD 27,074 | Producing | Apr 17, 2026 (MNT-0428-025, Flowline leak causing spill) | HPC-RN-2026-07; MNT-0428-022 report |  |
| WELL-0577 | Southeast Block 32 | Highline RP-175, SN-757468, LOT-2409-A | MNT-0577-028 (Jul 31, 2026) | USD 25,500 | Producing | Nov 21, 2026 (MNT-0577-032, Walking beam bearing wear) | HPC-RN-2026-07; MNT-0577-028 report |  |
| WELL-0031 | Southwest Block 23 | Highline RP-175, SN-664877, LOT-2409-A | MNT-0031-027 (Apr 24, 2026) | USD 19,625 | Producing | Jan 2, 2027 (MNT-0031-033, Stuffing box packing leak) | HPC-RN-2026-07; MNT-0031-027 report |  |
| WELL-0263 | Southwest Block 23 | Highline RP-175, SN-187332, LOT-2410-B | MNT-0263-033 (Oct 16, 2026) | USD 17,254 | Not producing | Jan 1, 2027 (MNT-0263-034, Flowline leak causing spill); in progress: MNT-0263-035 started Jan 9, 2027 | HPC-RN-2026-07; MNT-0263-033 report |  |

(9 row(s))

**Citations (30):** SUPPLIER-RECALL-NOTICE-2026-12-01, CLAIM-f24a665b-e209-48c5-bc9e-974eff89597a, MNT-0156-027, MNT-0156-027, MNT-0156-030, MNT-0160-028, MNT-0160-028, MNT-0160-029, MNT-0160-032, MNT-0305-032, MNT-0305-032, MNT-0333-024, MNT-0333-024, MNT-0333-026, MNT-0426-030, MNT-0426-030, MNT-0426-033, MNT-0428-022, MNT-0428-022, MNT-0428-025, MNT-0577-028, MNT-0577-028, MNT-0577-032, MNT-0031-027, MNT-0031-027, MNT-0031-033, MNT-0263-033, MNT-0263-033, MNT-0263-034, MNT-0263-035

**Conflicts:** 

~~~json
[
 "WELL-0333: Nathan Pierce (in charge of this well) reported on Oct 17, 2026 that the recalled pump was replaced, but the records show recalled LOT-2409-A (MNT-0333-024) still installed and no work order or Parts-installed report for a replacement. Kept on the list as unconfirmed."
]
~~~

**Trace:** gemini_planner (2384 ms): Structured plan validated: recalled_pumps. Only this user’s last five exchanges were supplied. || recalled_pumps (44 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

### Q8 turn 4

**Asker:** Grant (U-501)

**Question (exact):** Nathan told me the recalled pump on WELL-0577 was swapped as well. Take it off the recall list.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=1832, wall=1851 ms

**Answer (verbatim):**

~~~text
Recorded Olivia Grant’s report as an unconfirmed shared claim on WELL-0577 (no work order is on record yet; it is attributed to Olivia Grant and visible to all users, but it does not overwrite the maintenance records). 1 well has a recalled pump in the ground (Highline RP-175 LOT-2409-A/LOT-2409-C/LOT-2410-B, notice HPC-RN-2026-07). By area: Southeast Block 32 = 1. The installed pump is the latest "Parts installed" line by job start date, so a later non-recalled pump removes the well from the list. Total install cost of the listed jobs: USD 25,500. The replacement deadline was 31 Dec 2026. Status uses the latest inspection against the well-type threshold; "last repair" is the latest completed corrective job start date plus any job still in progress today. 1 well carries an unconfirmed replacement report (WELL-0577 second-hand report from Olivia Grant (via Nathan Pierce)). Reports alone do not remove a well: 1 per the records, 0 if those reports are confirmed by a work order.
~~~

**Visual:** type=`table`, title="Recalled pumps still in the ground"

| Well | Area | Pump (model, serial, lot) | Installed by | Install cost | Status now | Last repair | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WELL-0577 | Southeast Block 32 | Highline RP-175, SN-757468, LOT-2409-A | MNT-0577-028 (Jul 31, 2026) | USD 25,500 | Producing | Nov 21, 2026 (MNT-0577-032, Walking beam bearing wear) | HPC-RN-2026-07; MNT-0577-028 report | Second-hand: Olivia Grant relayed that Nathan Pierce said the pump was replaced (Oct 17, 2026), unconfirmed: no work order on record |

(1 row(s))

**Citations (6):** CLAIM-cc28c82c-d8b1-496d-89eb-9d1706310bdb, SUPPLIER-RECALL-NOTICE-2026-12-01, CLAIM-cc28c82c-d8b1-496d-89eb-9d1706310bdb, MNT-0577-028, MNT-0577-028, MNT-0577-032

**Conflicts:** 

~~~json
[
 "WELL-0577: Olivia Grant says Nathan Pierce told them the recalled pump was swapped. This is second-hand and unconfirmed. The records still show recalled LOT-2409-A (MNT-0577-028) installed and no later pump job, so the well stays on the list."
]
~~~

**Trace:** gemini_planner (1812 ms): Structured plan validated: claim. Only this user’s last five exchanges were supplied. || claim (20 ms): Explicit user feedback applied by the scoped domain tool with provenance.

### Q8 turn 5

**Asker:** Pierce (U-601)

**Question (exact):** Show me the recalled pumps that are still in the ground in my area, and what it cost to install each one.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=1830, wall=1848 ms

**Answer (verbatim):**

~~~text
4 wells have a recalled pump in the ground in your team’s area (Northwest Block 12) (Highline RP-175 LOT-2409-A/LOT-2409-C/LOT-2410-B, notice HPC-RN-2026-07). By area: Northwest Block 12 = 4. The installed pump is the latest "Parts installed" line by job start date, so a later non-recalled pump removes the well from the list. Total install cost of the listed jobs: $91.1k. The replacement deadline was 31 Dec 2026. Status uses the latest inspection against the well-type threshold; "last repair" is the latest completed corrective job start date plus any job still in progress today. Costs are shown in thousands of dollars per your saved preference. Sorted by area, then well ID per your saved preference. 1 well carries an unconfirmed replacement report (WELL-0333 report by Nathan Pierce). Reports alone do not remove a well: 4 per the records, 3 if those reports are confirmed by a work order.
~~~

**Visual:** type=`table`, title="Recalled pumps still in the ground in your team’s area (Northwest Block 12)"

| Well | Area | Pump (model, serial, lot) | Installed by | Install cost | Status now | Last repair | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WELL-0305 | Northwest Block 12 | Highline RP-175, SN-978137, LOT-2409-A | MNT-0305-032 (Oct 16, 2026) | $24.5k | Producing | Oct 16, 2026 (MNT-0305-032, Downhole pump stuck) | HPC-RN-2026-07; MNT-0305-032 report |  |
| WELL-0333 | Northwest Block 12 | Highline RP-175, SN-507591, LOT-2409-A | MNT-0333-024 (May 9, 2026) | $15.4k | Producing | Jun 6, 2026 (MNT-0333-026, Flowline corrosion pinhole leak) | HPC-RN-2026-07; MNT-0333-024 report | Reported replaced by Nathan Pierce on Oct 17, 2026, unconfirmed: no work order on record |
| WELL-0426 | Northwest Block 12 | Highline RP-175, SN-880271, LOT-2409-C | MNT-0426-030 (Jun 19, 2026) | $24.0k | Producing | Aug 9, 2026 (MNT-0426-033, Gearbox oil leak) | HPC-RN-2026-07; MNT-0426-030 report |  |
| WELL-0428 | Northwest Block 12 | Highline RP-175, SN-708611, LOT-2410-B | MNT-0428-022 (Mar 7, 2026) | $27.1k | Producing | Apr 17, 2026 (MNT-0428-025, Flowline leak causing spill) | HPC-RN-2026-07; MNT-0428-022 report |  |

(4 row(s))

**Citations (13):** SUPPLIER-RECALL-NOTICE-2026-12-01, CLAIM-f24a665b-e209-48c5-bc9e-974eff89597a, MNT-0305-032, MNT-0305-032, MNT-0333-024, MNT-0333-024, MNT-0333-026, MNT-0426-030, MNT-0426-030, MNT-0426-033, MNT-0428-022, MNT-0428-022, MNT-0428-025

**Conflicts:** 

~~~json
[
 "WELL-0333: Nathan Pierce (in charge of this well) reported on Oct 17, 2026 that the recalled pump was replaced, but the records show recalled LOT-2409-A (MNT-0333-024) still installed and no work order or Parts-installed report for a replacement. Kept on the list as unconfirmed."
]
~~~

**Trace:** gemini_planner (1799 ms): Structured plan validated: recalled_pumps. Only this user’s last five exchanges were supplied. || recalled_pumps (31 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q9

### Q9 turn 1

**Asker:** Hayes (U-301)

**Question (exact):** How many recalled pumps are still in the ground, and in which areas?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2279, wall=2286 ms

**Answer (verbatim):**

~~~text
9 wells have a recalled pump in the ground (Highline RP-175 LOT-2409-A/LOT-2409-C/LOT-2410-B, notice HPC-RN-2026-07). By area: Northwest Block 12 = 4, Northeast Block 8 = 2, Southwest Block 23 = 2, Southeast Block 32 = 1. The installed pump is the latest "Parts installed" line by job start date, so a later non-recalled pump removes the well from the list. Total install cost of the listed jobs: USD 209,949. The replacement deadline was 31 Dec 2026. Status uses the latest inspection against the well-type threshold; "last repair" is the latest completed corrective job start date plus any job still in progress today. 2 wells carry an unconfirmed replacement report (WELL-0333 report by Nathan Pierce; WELL-0577 second-hand report from Olivia Grant (via Nathan Pierce)). Reports alone do not remove a well: 9 per the records, 7 if those reports are confirmed by a work order.
~~~

**Visual:** type=`table`, title="Recalled pumps still in the ground"

| Well | Area | Pump (model, serial, lot) | Installed by | Install cost | Status now | Last repair | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WELL-0156 | Northeast Block 8 | Highline RP-175, SN-952958, LOT-2409-A | MNT-0156-027 (Jun 27, 2026) | USD 23,398 | Producing | Dec 4, 2026 (MNT-0156-030, Flowline leak causing spill) | HPC-RN-2026-07; MNT-0156-027 report |  |
| WELL-0160 | Northeast Block 8 | Highline RP-175, SN-429965, LOT-2409-C | MNT-0160-028 (Jul 18, 2026) | USD 33,086 | Not producing | Jul 31, 2026 (MNT-0160-029, Prime mover failure); in progress: MNT-0160-032 started Jan 15, 2027 | HPC-RN-2026-07; MNT-0160-028 report |  |
| WELL-0305 | Northwest Block 12 | Highline RP-175, SN-978137, LOT-2409-A | MNT-0305-032 (Oct 16, 2026) | USD 24,528 | Producing | Oct 16, 2026 (MNT-0305-032, Downhole pump stuck) | HPC-RN-2026-07; MNT-0305-032 report |  |
| WELL-0333 | Northwest Block 12 | Highline RP-175, SN-507591, LOT-2409-A | MNT-0333-024 (May 9, 2026) | USD 15,440 | Producing | Jun 6, 2026 (MNT-0333-026, Flowline corrosion pinhole leak) | HPC-RN-2026-07; MNT-0333-024 report | Reported replaced by Nathan Pierce on Oct 17, 2026, unconfirmed: no work order on record |
| WELL-0426 | Northwest Block 12 | Highline RP-175, SN-880271, LOT-2409-C | MNT-0426-030 (Jun 19, 2026) | USD 24,044 | Producing | Aug 9, 2026 (MNT-0426-033, Gearbox oil leak) | HPC-RN-2026-07; MNT-0426-030 report |  |
| WELL-0428 | Northwest Block 12 | Highline RP-175, SN-708611, LOT-2410-B | MNT-0428-022 (Mar 7, 2026) | USD 27,074 | Producing | Apr 17, 2026 (MNT-0428-025, Flowline leak causing spill) | HPC-RN-2026-07; MNT-0428-022 report |  |
| WELL-0577 | Southeast Block 32 | Highline RP-175, SN-757468, LOT-2409-A | MNT-0577-028 (Jul 31, 2026) | USD 25,500 | Producing | Nov 21, 2026 (MNT-0577-032, Walking beam bearing wear) | HPC-RN-2026-07; MNT-0577-028 report | Second-hand: Olivia Grant relayed that Nathan Pierce said the pump was replaced (Oct 17, 2026), unconfirmed: no work order on record |
| WELL-0031 | Southwest Block 23 | Highline RP-175, SN-664877, LOT-2409-A | MNT-0031-027 (Apr 24, 2026) | USD 19,625 | Producing | Jan 2, 2027 (MNT-0031-033, Stuffing box packing leak) | HPC-RN-2026-07; MNT-0031-027 report |  |
| WELL-0263 | Southwest Block 23 | Highline RP-175, SN-187332, LOT-2410-B | MNT-0263-033 (Oct 16, 2026) | USD 17,254 | Not producing | Jan 1, 2027 (MNT-0263-034, Flowline leak causing spill); in progress: MNT-0263-035 started Jan 9, 2027 | HPC-RN-2026-07; MNT-0263-033 report |  |

(9 row(s))

**Citations (31):** SUPPLIER-RECALL-NOTICE-2026-12-01, CLAIM-f24a665b-e209-48c5-bc9e-974eff89597a, CLAIM-cc28c82c-d8b1-496d-89eb-9d1706310bdb, MNT-0156-027, MNT-0156-027, MNT-0156-030, MNT-0160-028, MNT-0160-028, MNT-0160-029, MNT-0160-032, MNT-0305-032, MNT-0305-032, MNT-0333-024, MNT-0333-024, MNT-0333-026, MNT-0426-030, MNT-0426-030, MNT-0426-033, MNT-0428-022, MNT-0428-022, MNT-0428-025, MNT-0577-028, MNT-0577-028, MNT-0577-032, MNT-0031-027, MNT-0031-027, MNT-0031-033, MNT-0263-033, MNT-0263-033, MNT-0263-034, MNT-0263-035

**Conflicts:** 

~~~json
[
 "WELL-0333: Nathan Pierce (in charge of this well) reported on Oct 17, 2026 that the recalled pump was replaced, but the records show recalled LOT-2409-A (MNT-0333-024) still installed and no work order or Parts-installed report for a replacement. Kept on the list as unconfirmed.",
 "WELL-0577: Olivia Grant says Nathan Pierce told them the recalled pump was swapped. This is second-hand and unconfirmed. The records still show recalled LOT-2409-A (MNT-0577-028) installed and no later pump job, so the well stays on the list."
]
~~~

**Trace:** gemini_planner (2236 ms): Structured plan validated: recalled_pumps. Only this user’s last five exchanges were supplied. || recalled_pumps (43 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

### Q9 turn 2

**Asker:** Hayes (U-301)

**Question (exact):** Different topic. Who leads Northwest Production, and how many wells does that team run?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2231, wall=2238 ms

**Answer (verbatim):**

~~~text
Nathan Pierce leads Northwest Production (TEAM-NW), which runs 150 wells today (Jan 15, 2027), in Northwest Block 12. None of its wells is plugged or abandoned, so none are excluded. Counted by each well’s own team_id and team_history as of today, not by area.
~~~

**Visual:** type=`table`, title="Team lead and wells run today"

| Team | Lead | Wells | Areas |
| --- | --- | --- | --- |
| Northwest Production (TEAM-NW) | Nathan Pierce (production supervisor) | 150 | Northwest Block 12 |

(1 row(s))

**Citations (5):** teams-dataset, U-601, WELL-0301, WELL-0302, WELL-0303

**Conflicts:** none

**Trace:** gemini_planner (2225 ms): Structured plan validated: team_info. Only this user’s last five exchanges were supplied. || team_info (6 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

### Q9 turn 3

**Asker:** Hayes (U-301)

**Question (exact):** What does our operations SOP say about cold weather? Name one well that missed the check in December.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=fallback, reason=invalid_plan; **latency:** durationMs=2021, wall=2033 ms

**Answer (verbatim):**

~~~text
OPS-5 Freeze protection (1 Dec – 28 Feb): From 1 Dec to 28 Feb, any inspection with `ambient_temp_c` at or below −5 °C on a well that is producing oil at that reading needs a heat trace check on that well: a maintenance job whose `issue` contains "Heat trace check", starting within 7 days after the inspection. A cold reading on a well that is not producing oil needs no check.

Rule in short: during 1 Dec – 28 Feb, an inspection with air temperature at or below -5 C on a well that is producing oil at that reading needs a maintenance job whose issue contains "Heat trace check" starting within 7 days after the inspection. Cold readings on wells not producing oil need no check.

Checked in December 2026: 9 cold readings on producing wells needed a check; 5 Met, 4 Missed (WELL-0310, WELL-0354, WELL-0486, WELL-0531). 2 cold readings on wells not producing oil needed no check.
~~~

**Visual:** type=`table`, title="OPS-5 heat trace checks after cold readings (in December 2026)"

| Well | Area | Cold reading (inspection, date, air temp) | Required check by | Check job | Met / Missed |
| --- | --- | --- | --- | --- | --- |
| WELL-0310 | Northwest Block 12 | INS-0310-0213, 2026-12-17 07:15Z, air -6 C, wellhead 13.3 C | Dec 24, 2026 07:15Z | none | Missed |
| WELL-0354 | Northwest Block 12 | INS-0354-0215, 2026-12-17 07:15Z, air -11.4 C, wellhead 13.9 C | Dec 24, 2026 07:15Z | none | Missed |
| WELL-0486 | Southeast Block 32 | INS-0486-0219, 2026-12-31 07:15Z, air -7 C, wellhead 23.2 C | Jan 7, 2027 07:15Z | none | Missed |
| WELL-0531 | Southeast Block 32 | INS-0531-0217, 2026-12-31 07:30Z, air -5.3 C, wellhead 31.3 C | Jan 7, 2027 07:30Z | none | Missed |
| WELL-0421 | Northwest Block 12 | INS-0421-0216, 2026-12-17 07:00Z, air -8 C, wellhead 16.2 C | Dec 24, 2026 07:00Z | MNT-0421-032 (2026-12-20 09:00Z) | Met |
| WELL-0325 | Northwest Block 12 | INS-0325-0215, 2026-12-17 07:15Z, air -10.5 C, wellhead 19 C | Dec 24, 2026 07:15Z | MNT-0325-030 (2026-12-22 09:00Z) | Met |
| WELL-0445 | Northwest Block 12 | INS-0445-0213, 2026-12-17 07:30Z, air -9.1 C, wellhead 27.3 C | Dec 24, 2026 07:30Z | MNT-0445-026 (2026-12-21 09:00Z) | Met |
| WELL-0468 | Southeast Block 32 | INS-0468-0154, 2026-12-31 07:15Z, air -9.6 C, wellhead 18.9 C | Jan 7, 2027 07:15Z | MNT-0468-020 (2027-01-05 09:00Z) | Met |
| WELL-0547 | Southeast Block 32 | INS-0547-0214, 2026-12-31 07:15Z, air -10.8 C, wellhead 26.2 C | Jan 7, 2027 07:15Z | MNT-0547-028 (2027-01-04 09:00Z) | Met |

(9 row(s))

**Citations (15):** OPERATIONS-SOP-REV2, INS-0421-0216, MNT-0421-032, INS-0310-0213, INS-0325-0215, MNT-0325-030, INS-0354-0215, INS-0445-0213, MNT-0445-026, INS-0468-0154, MNT-0468-020, INS-0486-0219, INS-0547-0214, MNT-0547-028, INS-0531-0217

**Conflicts:** none

**Trace:** deterministic_planner (1887 ms): Hosted planner unavailable (invalid_plan); validated domain fallback used. Retry this question to reconnect. || cold_weather (134 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

### Q9 turn 4

**Asker:** Hayes (U-301)

**Question (exact):** An operator reported a gas smell at WELL-0332 on 3 Dec. What was the H2S reading?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2383, wall=2404 ms

**Answer (verbatim):**

~~~text
No H2S or gas reading is recorded for WELL-0332 on Dec 3, 2026. The note carries no ppm value and no inspection, repair report or other record on that day holds a measurement. What is recorded instead: operator note CTX-0332-004 (2026-12-03 12:10Z, Rachel Dunn): "Gas odor reported by the pumper near WELL-0332 wellhead, area flagged off."; same-day inspection(s) INS-0332-0212 (drone at 2026-12-03 14:45Z, no notes or gas field). No qualifying response (maintenance job or manual inspection) followed the report, so the 24 h deadline was Missed. OPS-1 (Revision 2 · Effective 1 Oct 2026 · Owner: Field Operations with Health, Safety & Environment (TEAM-HSE); response = maintenance job started on the well, or an inspection with method manual; drone inspections do not count; must start after the note): 24 h for reports before Jan 1, 2027; 12 h for reports from Jan 1, 2027.
~~~

**Visual:** type=`table`, title="Gas / H2S odor reports vs OPS-1 response deadline"

| Well | Area | Reported at | Response (record ID + time) | Hours to response | Deadline | Met / Missed |
| --- | --- | --- | --- | --- | --- | --- |
| WELL-0332 | Northwest Block 12 | 2026-12-03 12:10Z (CTX-0332-004) | none | n/a | 24 h | Missed |

(1 row(s))

**Citations (3):** OPERATIONS-SOP-REV2, CTX-0332-004, INS-0332-0212

**Conflicts:** none

**Trace:** gemini_planner (2377 ms): Structured plan validated: gas_response. Only this user’s last five exchanges were supplied. || gas_response (6 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

### Q9 turn 5

**Asker:** Hayes (U-301)

**Question (exact):** Back to the pumps from my first question: which of those wells are not producing oil right now, and when was each one last repaired?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=24145, wall=24154 ms

**Answer (verbatim):**

~~~text
2 wells have a recalled pump in the ground and are not producing (Highline RP-175 LOT-2409-A/LOT-2409-C/LOT-2410-B, notice HPC-RN-2026-07). By area: Northeast Block 8 = 1, Southwest Block 23 = 1. The installed pump is the latest "Parts installed" line by job start date, so a later non-recalled pump removes the well from the list. Total install cost of the listed jobs: USD 50,340. The replacement deadline was 31 Dec 2026. Status uses the latest inspection against the well-type threshold; "last repair" is the latest completed corrective job start date plus any job still in progress today.
~~~

**Visual:** type=`table`, title="Recalled pumps still in the ground"

| Well | Area | Pump (model, serial, lot) | Installed by | Install cost | Status now | Last repair | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WELL-0160 | Northeast Block 8 | Highline RP-175, SN-429965, LOT-2409-C | MNT-0160-028 (Jul 18, 2026) | USD 33,086 | Not producing | Jul 31, 2026 (MNT-0160-029, Prime mover failure); in progress: MNT-0160-032 started Jan 15, 2027 | HPC-RN-2026-07; MNT-0160-028 report |
| WELL-0263 | Southwest Block 23 | Highline RP-175, SN-187332, LOT-2410-B | MNT-0263-033 (Oct 16, 2026) | USD 17,254 | Not producing | Jan 1, 2027 (MNT-0263-034, Flowline leak causing spill); in progress: MNT-0263-035 started Jan 9, 2027 | HPC-RN-2026-07; MNT-0263-033 report |

(2 row(s))

**Citations (9):** SUPPLIER-RECALL-NOTICE-2026-12-01, MNT-0160-028, MNT-0160-028, MNT-0160-029, MNT-0160-032, MNT-0263-033, MNT-0263-033, MNT-0263-034, MNT-0263-035

**Conflicts:** none

**Trace:** gemini_planner (24114 ms): Structured plan validated: recalled_pumps. Only this user’s last five exchanges were supplied. || recalled_pumps (31 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

### Q9 turn 6

**Asker:** Hayes (U-301)

**Question (exact):** Of all the wells we've talked about today, which one would you deal with first, and why?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=3258, wall=3286 ms

**Answer (verbatim):**

~~~text
Dealing with WELL-0332 (Northwest Block 12) first, out of 57 wells from this conversation. Priority order: SAFETY > COMPLIANCE > unexplained PRODUCTION loss > EQUIPMENT risk; ties broken by number of flags, then most recent evidence. Why: SAFETY: gas/H2S report CTX-0332-004 has no qualifying OPS-1 response; PRODUCTION: not producing (INS-0332-0217 2027-01-14: 0.5 C above air vs 15 C needed) and no in-progress job or shut-in note explains it; EQUIPMENT: operator-note risk (2 notes in the window; different symptoms reported (squeal, rattling)). No H2S reading was taken or recorded for it. Recommended action: send a manual inspection with a personal H2S monitor per the field-work SOP (field work sop WS-03: bump-tested monitor, stop work at 10 ppm), record the reading, and check why the well stopped. Next: 2. WELL-0160 (Northeast Block 8; COMPLIANCE): COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0160-028 still installed); PRODUCTION: not producing (INS-0160-0217 2027-01-14: 3.8 C above air vs 15 C needed), explained by MNT-0160-032 in progress to 2027-01-26; EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-429965, LOT-2409-C, installed MNT-0160-028) 3. WELL-0263 (Southwest Block 23; COMPLIANCE): COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0263-033 still installed); PRODUCTION: not producing (INS-0263-0219 2027-01-14: 4 C above air vs 20 C needed), explained by MNT-0263-035 in progress to 2027-01-19; EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-187332, LOT-2410-B, installed MNT-0263-033); EQUIPMENT: operator-note risk (2 notes in the window; different symptoms reported (fluid pound, squeal) wellhead-minus-air fell 3 inspections)
~~~

**Visual:** type=`table`, title="Triage of wells discussed (SAFETY > COMPLIANCE > unexplained PRODUCTION loss > EQUIPMENT risk; ties broken by number of flags, then most recent evidence) - top 15 of 57"

| Rank | Well | Area | Safety | Compliance | Production | Equipment | Why |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | WELL-0332 | Northwest Block 12 | Yes: CTX-0332-004 | No | Down, unexplained | Yes: operator-note risk | SAFETY: gas/H2S report CTX-0332-004 has no qualifying OPS-1 response; PRODUCTION: not producing (INS-0332-0217 2027-01-14: 0.5 C above air vs 15 C needed) and no in-progress job or shut-in note explains it; EQUIPMENT: operator-note risk (2 notes in the window; different symptoms reported (squeal, rattling)) |
| 2 | WELL-0160 | Northeast Block 8 | No | Yes (1): recall replacement deadline 2026-12-31 missed | Down, explained | Yes: recalled pump in the ground | COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0160-028 still installed); PRODUCTION: not producing (INS-0160-0217 2027-01-14: 3.8 C above air vs 15 C needed), explained by MNT-0160-032 in progress to 2027-01-26; EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-429965, LOT-2409-C, installed MNT-0160-028) |
| 3 | WELL-0263 | Southwest Block 23 | No | Yes (1): recall replacement deadline 2026-12-31 missed | Down, explained | Yes: recalled pump in the ground; operator-note risk | COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0263-033 still installed); PRODUCTION: not producing (INS-0263-0219 2027-01-14: 4 C above air vs 20 C needed), explained by MNT-0263-035 in progress to 2027-01-19; EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-187332, LOT-2410-B, installed MNT-0263-033); EQUIPMENT: operator-note risk (2 notes in the window; different symptoms reported (fluid pound, squeal) wellhead-minus-air fell 3 inspections) |
| 4 | WELL-0031 | Southwest Block 23 | No | Yes (1): recall replacement deadline 2026-12-31 missed | Producing | Yes: recalled pump in the ground | COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0031-027 still installed); EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-664877, LOT-2409-A, installed MNT-0031-027) |
| 5 | WELL-0156 | Northeast Block 8 | No | Yes (1): recall replacement deadline 2026-12-31 missed | Producing | Yes: recalled pump in the ground | COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0156-027 still installed); EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-952958, LOT-2409-A, installed MNT-0156-027) |
| 6 | WELL-0305 | Northwest Block 12 | No | Yes (1): recall replacement deadline 2026-12-31 missed | Producing | Yes: recalled pump in the ground; operator-note risk | COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0305-032 still installed); EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-978137, LOT-2409-A, installed MNT-0305-032); EQUIPMENT: operator-note risk (recalled pump still in the well: Highline RP-175 pump, serial SN-978137, lot LOT-2409-A (installed MNT-0305-03) |
| 7 | WELL-0333 | Northwest Block 12 | No | Yes (1): recall replacement deadline 2026-12-31 missed | Producing | Yes: recalled pump in the ground | COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0333-024 still installed); EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-507591, LOT-2409-A, installed MNT-0333-024) |
| 8 | WELL-0401 | Northwest Block 12 | No | Yes (1): OPS-1 gas/H2S response late for CTX-0401-002 | Producing | Yes: operator-note risk | COMPLIANCE: OPS-1 gas/H2S response late for CTX-0401-002 (138.2 h vs 24 h, answered by MNT-0401-033); EQUIPMENT: operator-note risk (2 notes in the window; wellhead-minus-air fell 6 inspections in a row, 36.9 to 30.3 (-6.6 °C) [T500 manual s.5) |
| 9 | WELL-0426 | Northwest Block 12 | No | Yes (1): recall replacement deadline 2026-12-31 missed | Producing | Yes: recalled pump in the ground | COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0426-030 still installed); EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-880271, LOT-2409-C, installed MNT-0426-030) |
| 10 | WELL-0428 | Northwest Block 12 | No | Yes (1): recall replacement deadline 2026-12-31 missed | Producing | Yes: recalled pump in the ground; operator-note risk | COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0428-022 still installed); EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-708611, LOT-2410-B, installed MNT-0428-022); EQUIPMENT: operator-note risk (2 notes in the window; recalled pump still in the well: Highline RP-175 pump, serial SN-708611, lot LOT-2410-B) |
| 11 | WELL-0577 | Southeast Block 32 | No | Yes (1): recall replacement deadline 2026-12-31 missed | Producing | Yes: recalled pump in the ground | COMPLIANCE: recall replacement deadline 2026-12-31 missed (recalled pump from MNT-0577-028 still installed); EQUIPMENT: recalled pump in the ground (Highline RP-175, SN-757468, LOT-2409-A, installed MNT-0577-028) |
| 12 | WELL-0147 | Northeast Block 7 | No | Yes (1): OPS-1 gas/H2S response late for CTX-0147-001 | Producing | No | COMPLIANCE: OPS-1 gas/H2S response late for CTX-0147-001 (1868.8 h vs 24 h, answered by MNT-0147-029) |
| 13 | WELL-0310 | Northwest Block 12 | No | Yes (1): OPS-5 heat-trace check missed after cold reading INS-0310-0213 | Producing | No | COMPLIANCE: OPS-5 heat-trace check missed after cold reading INS-0310-0213 (due Dec 24, 2026 07:15Z, no check job) |
| 14 | WELL-0486 | Southeast Block 32 | No | Yes (1): OPS-5 heat-trace check missed after cold reading INS-0486-0219 | Producing | No | COMPLIANCE: OPS-5 heat-trace check missed after cold reading INS-0486-0219 (due Jan 7, 2027 07:15Z, no check job) |
| 15 | WELL-0531 | Southeast Block 32 | No | Yes (1): OPS-5 heat-trace check missed after cold reading INS-0531-0217 | Producing | No | COMPLIANCE: OPS-5 heat-trace check missed after cold reading INS-0531-0217 (due Jan 7, 2027 07:30Z, no check job) |

(15 row(s))

**Citations (15):** FIELD-WORK-SOP, OPERATIONS-SOP-REV2, CTX-0332-004, SUPPLIER-RECALL-NOTICE-2026-12-01, MNT-0160-028, MNT-0160-028, MNT-0160-032, MNT-0263-033, MNT-0263-033, MNT-0263-035, INS-0263-0219, INS-0332-0217, INS-0160-0217, MNT-0160-032, MNT-0263-035

**Conflicts:** none

**Trace:** gemini_planner (2636 ms): Structured plan validated: triage. Only this user’s last five exchanges were supplied. || triage (622 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q10

### Q10 turn 1

**Asker:** Turner (U-201)

**Question (exact):** When a well stays shut in longer than the repair itself, what are we usually waiting on: parts, crews, contractors or weather? Break it down by area for jobs started in 2026, with the typical number of extra days, and tell me if any area stands out.

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=2017, wall=2030 ms

**Answer (verbatim):**

~~~text
For 634 jobs started in 2026 (of 4360 jobs started in that period; the rest record no wait) the repair report names why the well stayed shut in longer than the repair. Most common: Contractors 33%, Crews 27%, Weather 22%, Parts 18%. Typical (median) extra wait is about 9 days (field-wide median by reason: Parts 9 d, Crews 9 d, Contractors 9 d, Weather 9 d).
No area clearly stands out: area medians are 8 to 10 days and the reason mix is within chance (chi-square 10.3 on 18 degrees of freedom, p about 0.92).
Worth watching only, small-sample noise: Southwest Block 24 (SW-24): Crews 18% of 66 jobs vs 27% field-wide (z -1.6).
Per area (jobs; each reason as count (share of the area's waiting jobs) / median extra days; last value is the area median):
- Southwest Block 23 (SW-23): 72 jobs; Parts 16 (22%) / 12.5 d; Crews 19 (26%) / 7 d; Contractors 21 (29%) / 9 d; Weather 16 (22%) / 9 d; area median 8.5 d
- Southwest Block 24 (SW-24): 66 jobs; Parts 12 (18%) / 8 d; Crews 12 (18%) / 12 d; Contractors 27 (41%) / 9 d; Weather 15 (23%) / 10 d; area median 9 d
- Northeast Block 7 (NE-07): 64 jobs; Parts 15 (23%) / 15 d; Crews 14 (22%) / 11.5 d; Contractors 20 (31%) / 9 d; Weather 15 (23%) / 9 d; area median 9 d
- Northeast Block 8 (NE-08): 80 jobs; Parts 13 (16%) / 10 d; Crews 25 (31%) / 9 d; Contractors 24 (30%) / 9 d; Weather 18 (23%) / 8 d; area median 8 d
- Southeast Block 31 (SE-31): 40 jobs; Parts 6 (15%) / 8.5 d; Crews 9 (23%) / 9 d; Contractors 17 (43%) / 14 d; Weather 8 (20%) / 12.5 d; area median 10 d
- Northwest Block 12 (NW-12): 172 jobs; Parts 29 (17%) / 9 d; Crews 54 (31%) / 9 d; Contractors 52 (30%) / 9 d; Weather 37 (22%) / 9 d; area median 9 d
- Southeast Block 32 (SE-32): 140 jobs; Parts 26 (19%) / 9.5 d; Crews 37 (26%) / 10 d; Contractors 46 (33%) / 9 d; Weather 31 (22%) / 8 d; area median 9 d
- All areas: 634 jobs; Parts 117 (18%) / 9 d; Crews 170 (27%) / 9 d; Contractors 207 (33%) / 9 d; Weather 140 (22%) / 9 d; field median 9 d
Test used: an area stands out if, with at least 30 jobs, a reason share differs from the field share by |z| >= 3 (binomial z-score; strict because there are 28 comparisons) or its median extra days differs from the field median by at least 3 days.
Reasons are classified from the "What happened" sentence of each repair report using this keyword map: Weather = rain, weather, storm, flood, snow, ice, impassable lease road; Parts = back-ordered, replacement part, parts, supplier, vendor, shipment; Crews = crew committed elsewhere (e.g. spill response), personnel; Contractors = weekday contractor slot, contractor; "workover rig busy": company rig = Crews, a named contractor rig = Contractors (future-tense reports use the job's contractor field).
Wording found in the reports: replacement part back-ordered 117, heavy rain / lease road impassable 140, contractor workover rig busy 76, crew on higher-priority spill response 112, weekday contractor slot 131, company workover rig busy 58.
Classification choice: 134 jobs are "workover rig busy" waits. If every rig wait were called Crews instead, Crews would be 246 (39%) and Contractors 131 (21%).
2 jobs are still in progress and their reports use future wording ("expected to stay shut in"); they are counted (MNT-0404-034, MNT-0496-033).
Source: the recorded reason and the number of extra days are only in each repair report's "What happened" text; maintenance records have no reason field. 39 generic operator notes about waiting for parts or weather in this period carry no day count and do not reliably match the report of the nearest job, so they were ignored. Extra days are the number stated in the report (for rig waits, the days waited for the rig).
~~~

**Visual:** type=`bar`, title="Why wells stayed shut in longer than the repair, by area (jobs started 2026)"


Series/field `data` (7 items):

| name | areaId | parts | crews | contractors | weather |
| --- | --- | --- | --- | --- | --- |
| Southwest Block 23 | SW-23 | 16 | 19 | 21 | 16 |
| Southwest Block 24 | SW-24 | 12 | 12 | 27 | 15 |
| Northeast Block 7 | NE-07 | 15 | 14 | 20 | 15 |
| Northeast Block 8 | NE-08 | 13 | 25 | 24 | 18 |
| Southeast Block 31 | SE-31 | 6 | 9 | 17 | 8 |
| Northwest Block 12 | NW-12 | 29 | 54 | 52 | 37 |
| Southeast Block 32 | SE-32 | 26 | 37 | 46 | 31 |

Field `meta`: `{"stacked":true,"series":["parts","crews","contractors","weather"],"valueLabel":"Jobs","unit":"jobs","categoryLabel":"Area"}`

**Citations (150):** MNT-0001-028, MNT-0004-021, MNT-0002-020, MNT-0001-033, MNT-0055-026, MNT-0061-028, MNT-0054-030, MNT-0056-032, MNT-0102-027, MNT-0107-028, MNT-0103-025, MNT-0102-030, MNT-0151-029, MNT-0151-023, MNT-0159-025, MNT-0154-029, MNT-0204-024, MNT-0203-029, MNT-0209-019, MNT-0210-025, MNT-0301-028, MNT-0305-032, MNT-0304-030, MNT-0301-025, MNT-0451-029, MNT-0454-024, MNT-0455-011, MNT-0459-021, MNT-0002-018, MNT-0004-026, MNT-0005-031, MNT-0006-023, MNT-0006-025, MNT-0006-026, MNT-0007-031, MNT-0009-026, MNT-0010-024, MNT-0010-027, MNT-0012-029, MNT-0013-034 ... (40 of 150 listed)

**Conflicts:** none

**Trace:** gemini_planner (1984 ms): Structured plan validated: delay_reasons. Only this user’s last five exchanges were supplied. || delay_reasons (33 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.


---

## Q11

### Q11 turn 1

**Asker:** Grant (U-501)

**Question (exact):** Which region of the field consistently runs hotter?

**HTTP:** 200, attempts: 1

**Model:** name=gemini-3.5-flash-lite, status=hosted; **latency:** durationMs=5721, wall=5738 ms

**Answer (verbatim):**

~~~text
No region genuinely runs hotter. On raw wellhead temperature Southeast Block 31 (SE-31) ranks first, then SE-32 and NW-12 (mean 52.8 C vs 47.7 C for SW-24, a 5.1 C gap), but that is a well-type mix effect, not a regional one.
1. Ambient air is flat across areas: area means span only 0.08 C (21.47 to 21.55 C), so location does not change the weather in this data.
2. Wellhead temperature is driven by well type: producing wells run T200 25.9 C, T350 31.0 C, T500 36.2 C above ambient (mean wellhead minus ambient). The raw ranking follows the T500 share of wells (rank correlation 0.95): SE-31 58%, SE-32 25%, NW-12 23%, NE-07 2%, SW-23 6%, NE-08 2%, SW-24 0%.
3. Compared like with like (wellhead minus ambient within well type, producing readings), the areas differ by at most 0.08 C: type-adjusted delta SW-23 +0.00, SW-24 +0.04, NE-07 +0.05, NE-08 +0.01, SE-31 -0.03, NW-12 -0.03, SE-32 -0.01. That is noise.
Consistency over 52 months: highest raw mean wellhead was SE-31 in 52 of 52 months (SE-31 52); after the type adjustment the monthly leader is scattered (NE-07 12, SW-24 12, SW-23 10, SE-31 6, NE-08 6, SE-32 4, NW-12 2).
"Hotter" is judged as wellhead minus ambient within well type, the quantity the manuals use for producing status (T200 needs 15 C, T350 needs 20 C, T500 needs 25 C), not absolute wellhead temperature. Period: all inspections to 2027-01-15; 125,198 readings, well type taken from type history on the reading date, data corrections applied.
Table (area; wells; % T500 wells; mean wellhead C; mean ambient C; mean delta = wellhead minus ambient on producing readings C; type-adjusted delta C):
- Southwest Block 23 (SW-23): 63 wells; 6% T500; wellhead 48.61; ambient 21.49; delta 28.40; type-adjusted +0.00
- Southwest Block 24 (SW-24): 63 wells; 0% T500; wellhead 47.74; ambient 21.47; delta 27.84; type-adjusted +0.04
- Northeast Block 7 (NE-07): 62 wells; 2% T500; wellhead 48.76; ambient 21.55; delta 28.48; type-adjusted +0.05
- Northeast Block 8 (NE-08): 62 wells; 2% T500; wellhead 48.34; ambient 21.49; delta 28.00; type-adjusted +0.01
- Southeast Block 31 (SE-31): 50 wells; 58% T500; wellhead 52.85; ambient 21.49; delta 32.41; type-adjusted -0.03
- Northwest Block 12 (NW-12): 150 wells; 23% T500; wellhead 50.06; ambient 21.49; delta 29.79; type-adjusted -0.03
- Southeast Block 32 (SE-32): 150 wells; 25% T500; wellhead 50.75; ambient 21.55; delta 30.24; type-adjusted -0.01
Wellhead minus ambient by area and well type (producing readings, C):
- SW-23: T200 25.96; T350 30.96; T500 36.18
- SW-24: T200 26.01; T350 30.98; T500 no wells
- NE-07: T200 26.04; T350 30.95; T500 36.47 (1 well)
- NE-08: T200 25.89; T350 31.07; T500 36.59 (1 well)
- SE-31: T200 25.84; T350 30.90; T500 36.25
- NW-12: T200 25.91; T350 30.95; T500 36.22
- SE-32: T200 25.95; T350 30.94; T500 36.25
~~~

**Visual:** type=`table`, title="Wellhead temperature by area: raw, ambient and type-adjusted"

| Area | Wells | % T500 | Mean wellhead C | Mean ambient C | Mean delta C | Type-adjusted delta C |
| --- | --- | --- | --- | --- | --- | --- |
| Southwest Block 23 (SW-23) | 63 | 6 | 48.61 | 21.49 | 28.4 | 0 |
| Southwest Block 24 (SW-24) | 63 | 0 | 47.74 | 21.47 | 27.84 | 0.04 |
| Northeast Block 7 (NE-07) | 62 | 2 | 48.76 | 21.55 | 28.48 | 0.05 |
| Northeast Block 8 (NE-08) | 62 | 2 | 48.34 | 21.49 | 28 | 0.01 |
| Southeast Block 31 (SE-31) | 50 | 58 | 52.85 | 21.49 | 32.41 | -0.03 |
| Northwest Block 12 (NW-12) | 150 | 23 | 50.06 | 21.49 | 29.79 | -0.03 |
| Southeast Block 32 (SE-32) | 150 | 25 | 50.75 | 21.55 | 30.24 | -0.01 |

(7 row(s))

**Citations (6):** OM-T200, OM-T350, OM-T500, CTX-0067-002, CTX-0201-002, CTX-0213-002

**Conflicts:** none

**Trace:** gemini_planner (2408 ms): Structured plan validated: region_temperature. Only this user’s last five exchanges were supplied. || region_temperature (3313 ms): Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

