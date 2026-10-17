# Hosted Gemini live integration checks

**Latest targeted retest: PASS, with complete cited manual answer in 4.274 seconds through actual Gemini 3.5 FlashLite planning and synthesis.** The answer includes stopping the prime mover at the bottom of the stroke, setting the brake, closing the wing valve, and recording the shut-in in the maintenance system before work starts. Both answer segments cite OM-T200. Actual HTTP observations: planner 200 / 2.117 seconds; synthesis 200 / 1.344 seconds. No retry, fallback or cooldown occurred.

The earlier passing reasoning-model check took 18.352 seconds. An intermediate FlashLite check took 5.182 seconds but failed freeform citation-marker validation; its complete cited fallback was preserved. The final schema associates each text segment with validated source IDs and the app renders its citations; the latest live check passed the complete-checklist assertions. These individual timings are not a latency benchmark.

Across the initial run and targeted retests, all 14 representative scenarios have passing evidence: 13 audited domain cases initially plus the latest passing manual check. This does not represent a new complete run of all 14 after the provider changes and does not prove results on the final hidden dataset. All original failures and retest results remain below. Total requests in these four harness processes: 22 (16 initially, 2 for the reasoning-model retest, 2 for the intermediate fast-model retest, 2 for the final segments-only fast-model retest).

Run started: 2026-10-17T08:12:31.599Z. Finished: 2026-10-17T08:13:09.848Z.
Sample reference date: 2026-10-16; 200 wells; 47177 indexed evidence documents.

**Audited hosted + semantic checks: 13/14. Semantic checks: 13/14. Hosted planning: 14/14.**

The initial automated run reported 10/14 because three assertions matched literal wording: `23 Nov 2026` instead of the equivalent `Nov 23, 2026`, `don't have a prior conversation` instead of `no matching earlier conversation`, and `yes` / `1.0` instead of `1 real spills` / `1 bbl` with `detection stands`. The captured answers and evidence below were inspected against the challenge and satisfy these three cases. The harness now accepts those equivalent representations and retains exact record, volume, attribution, conflict and privacy checks. No additional hosted requests were made to reclassify them. The general manual synthesis failure was subsequently resolved in the targeted retest below.

This is a bounded live run through the app runAgent entry point, with one sequential question at a time. Calls use the configured provider, its per-project budgets, retries and cooldowns. No local model or mocked provider is used. Credentials are loaded by process.loadEnvFile from ignored environment files and never printed. State and user histories exist only in memory; no .local/state.json writes occur.

Q6 history is appended in memory in the same shape as the API for the Q11 check. These checks validate the agent and shared/private memory semantics; browser behavior and persisted API memory are separate checks. This sample run does not prove results on the final hidden dataset.

Reproduce only with authorized hosted access: `node --import tsx scripts/live-check.ts`. Do not repeatedly rerun during recorded provider cooldown; provider budgets are scoped to the running process.

| Scenario | Semantic | Hosted | Model | Duration | Tools |
|---|---|---|---|---:|---|
| Q1 status | PASS | PASS | gemini-3.5-flash-lite | 2204 ms | gemini_planner, status |
| Q6 downtime ranking | PASS | PASS | gemini-3.5-flash-lite | 2270 ms | gemini_planner, downtime_ranking |
| Q11 private memory | PASS | PASS | gemini-3.5-flash-lite | 2941 ms | gemini_planner, costs |
| Q12 raw correction | PASS | PASS | gemini-3.5-flash-lite | 2248 ms | gemini_planner, correction |
| Q15 shared correction | PASS | PASS | gemini-3.5-flash-lite | 2215 ms | gemini_planner, status |
| Q13 spill correction | PASS (audited) | PASS | gemini-3.5-flash-lite | 2455 ms | gemini_planner, correction |
| Q15 shared reportability | PASS | PASS | gemini-3.5-flash-lite | 2691 ms | gemini_planner, spills |
| Q16 shared note | PASS | PASS | gemini-3.5-flash-lite | 2304 ms | gemini_planner, note |
| Q16 read without mutation | PASS | PASS | gemini-3.5-flash-lite | 2486 ms | gemini_planner, shared_knowledge |
| Q16 private isolation | PASS (audited) | PASS | gemini-3.5-flash-lite | 2207 ms | gemini_planner, costs |
| Unfamiliar status paraphrase | PASS | PASS | gemini-3.5-flash-lite | 2076 ms | gemini_planner, status |
| Explicit downtime window | PASS | PASS | gemini-3.5-flash-lite | 2871 ms | gemini_planner, downtime |
| Q18 spill conflict | PASS (audited) | PASS | gemini-3.5-flash-lite | 2018 ms | gemini_planner, spills |
| General manual retrieval | FAIL | FAIL | gemini-3.5-flash-lite | 5718 ms | gemini_planner, document_retrieval, retrieval_fallback |

## Q1 status

Question: Is WELL-0001 producing oil right now? When was it last inspected, and by whom? Show me its status card.

Expected: Not producing; latest inspection, Ryan Brooks, T200 manual and planned shut-in; status card.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: No, WELL-0001 is not producing oil. Latest inspection INS-0001-0203 was Oct 15, 2026 by Ryan Brooks (drone). Wellhead 25.6 °C minus air 22.4 °C = 3.2 °C; the T200 manual threshold is 15 °C. Well shut in from 7 Oct for planned rod string replacement. Work order not yet in the maintenance system. Expected back online around 20 Oct. According to Jake Morales (CTX-0001-003). The stored status “active” is out of date.

Evidence IDs: INS-0001-0203, OM-T200, CTX-0001-002, CTX-0001-003.

Referenced wells: WELL-0001. Visual: status. Conflicts: 0.

Trace: gemini_planner 2201 ms: Structured plan validated: status. Only this user’s last five exchanges were supplied. | status 3 ms: Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

## Q6 downtime ranking

Question: Which 3 wells in Northeast Block 7 had the most downtime in the last 4 months? Show a bar chart.

Expected: Bar chart: WELL-0121 49 days; WELL-0138 and WELL-0107 42 days.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: WELL-0121: 49 days (7 non-producing weekly inspections); WELL-0107: 42 days (6 non-producing weekly inspections); WELL-0138: 42 days (6 non-producing weekly inspections). Window Jun 16, 2026 through Oct 16, 2026. Each non-producing inspection counts as 7 days; missed inspections contribute no downtime. 

Evidence IDs: OM-T200, INS-0101-0205, OM-T350, INS-0103-0203, MNT-0103-031, INS-0103-0204, INS-0107-0194, MNT-0107-028, INS-0107-0195, INS-0107-0196, INS-0107-0197, INS-0107-0198, INS-0107-0199, INS-0108-0190, MNT-0108-028, INS-0109-0201, MNT-0109-022, INS-0110-0192, MNT-0110-028, INS-0110-0193, INS-0110-0205, MNT-0110-030, INS-0111-0186, MNT-0111-028, INS-0111-0187, INS-0112-0196, MNT-0112-028, INS-0114-0189, MNT-0114-023, INS-0114-0204, MNT-0114-025, INS-0115-0192, MNT-0115-034, INS-0115-0207, MNT-0115-037, INS-0115-0208, INS-0118-0198, MNT-0118-025, INS-0118-0199, INS-0118-0200, INS-0119-0197, MNT-0119-027, INS-0119-0198, INS-0119-0199, INS-0119-0200, INS-0120-0198, MNT-0120-030, INS-0121-0189, MNT-0121-031, INS-0121-0200, MNT-0121-034, INS-0121-0201, INS-0121-0202, INS-0121-0203, INS-0121-0205, MNT-0121-035, INS-0121-0206, INS-0123-0095, MNT-0123-015, INS-0123-0096, INS-0127-0190, MNT-0127-025, INS-0127-0191, INS-0127-0192, INS-0128-0203, INS-0132-0200, MNT-0132-027, INS-0132-0201, INS-0135-0194, MNT-0135-031, INS-0135-0195, INS-0138-0195, MNT-0138-031, INS-0138-0196, INS-0138-0200, MNT-0138-032, INS-0138-0201, INS-0138-0206, MNT-0138-034, INS-0138-0207, INS-0140-0196, MNT-0140-025, INS-0140-0197, INS-0140-0198, INS-0150-0191, MNT-0150-027, INS-0150-0200, MNT-0150-029, INS-0150-0201.

Referenced wells: WELL-0121, WELL-0107, WELL-0138. Visual: bar. Conflicts: 0.

Trace: gemini_planner 2147 ms: Structured plan validated: downtime_ranking. Only this user’s last five exchanges were supplied. | downtime_ranking 123 ms: Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

## Q11 private memory

Question: For the three wells we discussed yesterday, what have repairs cost this year?

Expected: Same user resolves Q6 wells and USD 25,794 / 46,942 / 5,176 in a table.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: Repair costs by maintenance start date, Jan 1, 2026 through Oct 16, 2026: WELL-0107 USD 5,176 · WELL-0121 USD 25,794 · WELL-0138 USD 46,942.

Evidence IDs: MNT-0107-025, MNT-0107-026, MNT-0107-027, MNT-0107-028, MNT-0107-029, MNT-0107-030, MNT-0121-029, MNT-0121-030, MNT-0121-031, MNT-0121-032, MNT-0121-033, MNT-0121-034, MNT-0121-035, MNT-0138-026, MNT-0138-027, MNT-0138-028, MNT-0138-029, MNT-0138-030, MNT-0138-031, MNT-0138-032, MNT-0138-033, MNT-0138-034, MNT-0138-035.

Referenced wells: WELL-0107, WELL-0121, WELL-0138. Visual: table. Conflicts: 0.

Trace: gemini_planner 2929 ms: Structured plan validated: costs. Only this user’s last five exchanges were supplied. | costs 12 ms: Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

## Q12 raw correction

Question: The 15 Oct reading for WELL-0164 is wrong. The handheld thermal gun used in that inspection was faulty; the field crew re-measured the wellhead at 41.0 °C.

Expected: Append scoped correction 24 to 41; original inspection preserved; producing with note conflict.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: Michael Turner corrected INS-0164-0205 wellhead_temp_c: original raw value 24; previous effective value 24; corrected value 41. Reason: The 15 Oct reading for WELL-0164 is wrong. The handheld thermal gun used in that inspection was faulty; the field crew re-measured the wellhead at 41.0 °C.. This correction is shared with all users and applies only to this inspection. The corrected difference is 21.1 °C versus the 15 °C T200 threshold, so the well is producing oil. The temperature correction by Michael Turner conflicts with inspector Tyler Hughes’s note “Pump jack not moving.”. Please confirm which observation is current.

Evidence IDs: INS-0164-0205, OM-T200, CORR-e242aba0-4d13-4081-b490-8b627bb72287.

Referenced wells: WELL-0164. Visual: status. Conflicts: 1.

Trace: gemini_planner 2245 ms: Structured plan validated: correction. Only this user’s last five exchanges were supplied. | correction 3 ms: Explicit user feedback applied by the scoped domain tool with provenance.

## Q15 shared correction

Question: Is WELL-0164 producing oil right now?

Expected: Jessica sees Michael correction, producing at 41 C, with inspection conflict.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: Yes, WELL-0164 is producing oil. Latest inspection INS-0164-0205 was Oct 15, 2026 by Tyler Hughes (manual). Wellhead 41 °C minus air 19.9 °C = 21.1 °C; the T200 manual threshold is 15 °C. Michael Turner corrected wellhead_temp_c from original raw value 24 to 41. Reason: The 15 Oct reading for WELL-0164 is wrong. The handheld thermal gun used in that inspection was faulty; the field crew re-measured the wellhead at 41.0 °C. The temperature correction by Michael Turner conflicts with inspector Tyler Hughes’s note “Pump jack not moving.”. Please confirm which observation is current.

Evidence IDs: INS-0164-0205, OM-T200, CORR-e242aba0-4d13-4081-b490-8b627bb72287.

Referenced wells: WELL-0164. Visual: status. Conflicts: 1.

Trace: gemini_planner 2213 ms: Structured plan validated: status. Only this user’s last five exchanges were supplied. | status 2 ms: Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

## Q13 spill correction

Question: The AI estimated the 24 Sep spill at WELL-0151 as 4.5 bbl. The field crew measured 5.4 bbl.

Expected: Correct exact spill to 5.4; SR-01 reporting and 23 Nov verification deadline; repair report evidence.

Initial literal assertion mismatch: Answer missing 23 Nov 2026. Audited pass: answer states the same deadline as Nov 23, 2026 and cites the exact inspection and repair report.
Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: Michael Turner corrected INS-0151-0201 spill_est_volume_bbl: original raw value 4.5; previous effective value 4.5; corrected value 5.4. Reason: The AI estimated the 24 Sep spill at WELL-0151 as 4.5 bbl. The field crew measured 5.4 bbl.. This correction is shared with all users and applies only to this inspection. At 5.4 bbl this spill is reportable under the Spill Response SOP. SR-01 Possible breach: No written notice is recorded in the loaded data for 5.4 bbl; due 2026-09-25T15:30:00.000Z (24-hour limit). SR-03 Pending action: Passing environmental agency clean-up verification due Nov 23, 2026; no passing agency inspection is recorded. Classification Changed by correction: The linked report classified the original 4.5 bbl estimate as moderate. At 5.4 bbl its exemption from reporting and agency verification no longer applies. SR-02 Breach: Contained after about 6.4 hours against a 4-hour limit. 

Evidence IDs: INS-0151-0201, OM-T350, CORR-e77d7a53-fdc4-4afb-ac00-8d28a49c11f8, MNT-0151-025, MNT-0151-025, SPILL-RESPONSE-SOP, REGULATORY-COMPLIANCE-SOP.

Referenced wells: WELL-0151. Visual: status. Conflicts: 0.

Trace: gemini_planner 2445 ms: Structured plan validated: correction. Only this user’s last five exchanges were supplied. | correction 10 ms: Explicit user feedback applied by the scoped domain tool with provenance.

## Q15 shared reportability

Question: Which spills in Northeast Block 8 in the last 90 days needed a report to the regulator?

Expected: Only WELL-0151 is reportable at corrected 5.4 bbl; absent notice is overdue; table.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: Northeast Block 8 had 1 reportable spills, totalling 5.4 bbl, from Jul 18, 2026 through Oct 16, 2026. Excluded 2 corrected false positive(s): INS-0194-0192, INS-0199-0200. WELL-0151: Michael Turner corrected spill_est_volume_bbl from original 4.5 to 5.4. WELL-0151: 5.4 bbl is reportable. No written notice is recorded in the loaded data; due within 24 hours of 2026-09-24T15:30:00Z. Overdue; possible SR-01 breach.

Evidence IDs: INS-0151-0201, MNT-0151-025, MNT-0151-025, CORR-e77d7a53-fdc4-4afb-ac00-8d28a49c11f8, INS-0194-0192, CTX-0194-002, INS-0199-0200, CTX-0199-002, SPILL-RESPONSE-SOP.

Referenced wells: WELL-0151. Visual: table. Conflicts: 0.

Trace: gemini_planner 2683 ms: Structured plan validated: spills. Only this user’s last five exchanges were supplied. | spills 8 ms: Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

## Q16 shared note

Question: FYI for everyone: WELL-0007 will be shut in from 17 Oct for a 10-day planned workover.

Expected: Append one shared field note with Jake attribution.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: Saved shared field knowledge from Jake Morales: FYI for everyone: WELL-0007 will be shut in from 17 Oct for a 10-day planned workover.. Other users can see its author and date.

Evidence IDs: FACT-df13dbb9-a76c-4baa-98e1-1eba6a58ceb3.

Referenced wells: WELL-0007. Visual: status. Conflicts: 0.

Trace: gemini_planner 2304 ms: Structured plan validated: note. Only this user’s last five exchanges were supplied. | note 0 ms: Explicit user feedback applied by the scoped domain tool with provenance.

## Q16 read without mutation

Question: Is any downtime planned for WELL-0007?

Expected: Michael reads Jake note, 17 Oct and 10 days, without state mutation.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: Yes. WELL-0007: FYI for everyone: WELL-0007 will be shut in from 17 Oct for a 10-day planned workover. According to Jake Morales. Starts Oct 17, 2026. Duration about 10 days.

Evidence IDs: FACT-df13dbb9-a76c-4baa-98e1-1eba6a58ceb3.

Referenced wells: WELL-0007. Visual: table. Conflicts: 0.

Trace: gemini_planner 2485 ms: Structured plan validated: shared_knowledge. Only this user’s last five exchanges were supplied. | shared_knowledge 1 ms: Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

## Q16 private isolation

Question: For the three wells we discussed yesterday, what have repairs cost this year?

Expected: Jessica cannot access Michael private Q6 history.

Initial literal assertion mismatch: Missing private-history clarification. Audited pass: answer explicitly states no matching earlier conversation with Jessica, no referenced wells, and no other-user IDs or costs.
Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: I have no matching earlier conversation with Jessica Reed that identifies those wells. Conversation memory is private; I cannot use another user’s history.

Evidence IDs: none.

Referenced wells: none. Visual: none. Conflicts: 0.

Trace: gemini_planner 2207 ms: Structured plan validated: costs. Only this user’s last five exchanges were supplied. | costs 0 ms: Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

## Unfamiliar status paraphrase

Question: Could you tell me whether WELL-0151 is currently yielding crude, using its most recent thermal survey and its own equipment manual?

Expected: Resolve unfamiliar wording to current T350 status and 29.2 C delta; cite own manual.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: Yes, WELL-0151 is producing oil. Latest inspection INS-0151-0204 was Oct 15, 2026 by Ashley Bennett (drone). Wellhead 54.9 °C minus air 25.7 °C = 29.2 °C; the T350 manual threshold is 20 °C.

Evidence IDs: INS-0151-0204, OM-T350.

Referenced wells: WELL-0151. Visual: status. Conflicts: 0.

Trace: gemini_planner 2075 ms: Structured plan validated: status. Only this user’s last five exchanges were supplied. | status 1 ms: Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

## Explicit downtime window

Question: How many days was WELL-0001 down from 8 Oct through 15 Oct 2026?

Expected: Inclusive arbitrary window counts exactly two weekly nonproducing inspections: 14 days.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: WELL-0001: 14 days (2 non-producing weekly inspections). Window Oct 8, 2026 through Oct 15, 2026. Each non-producing inspection counts as 7 days; missed inspections contribute no downtime. Oct 8, 2026: 3.2 °C above ambient; Pump jack not moving.. Oct 15, 2026: 3.2 °C above ambient; Pump jack not moving..

Evidence IDs: OM-T200, INS-0001-0202, INS-0001-0203.

Referenced wells: WELL-0001. Visual: table. Conflicts: 0.

Trace: gemini_planner 2870 ms: Structured plan validated: downtime. Only this user’s last five exchanges were supplied. | downtime 1 ms: Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

## Q18 spill conflict

Question: Was the 20 Aug spill at WELL-0101 real oil?

Expected: Yes 1.0 bbl; crude / produced-water disagreement retained; both notes and repair cited.

Initial literal assertion mismatch: Answer missing yes. Audited pass: answer affirms 1 real spill, 1 bbl, and that the detection stands; both conflicting notes and the repair are cited.
Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: WELL-0101 had 1 real spills, totalling 1 bbl, from Aug 20, 2026 through Aug 20, 2026.  Notes disagree: Ryan Brooks said “Inspection INS-0101-0197: I think this was only produced water, not crude.”; Chris Dalton said “Inspection INS-0101-0197: sampled the stain, it is crude oil. The detection stands.”. Neither note is a formal correction, so the inspection detection stands.

Evidence IDs: INS-0101-0197, CTX-0101-002, CTX-0101-003, MNT-0101-029, MNT-0101-029.

Referenced wells: WELL-0101. Visual: table. Conflicts: 1.

Trace: gemini_planner 2015 ms: Structured plan validated: spills. Only this user’s last five exchanges were supplied. | spills 3 ms: Exact domain output returned directly, with evidence and visualization; no model numerical rewriting.

## General manual retrieval

Question: What does the T200 operating manual require an operator to do before a planned shut-in starts?

Expected: Retrieve and synthesize manual requirement to record planned shut-in in maintenance system; cited hosted synthesis.

Failures: Hosted synthesis did not succeed: fallback (invalid_response). Manual recording duty missing. Hosted search planning succeeded, but the retrieved fallback excerpt truncates the planned shut-in instruction before its requirement to record it in the maintenance system.
Model: gemini-3.5-flash-lite; status: fallback; reason: invalid_response.

Answer: Relevant source passages: T200 operating manual [OM-T200]: d shut-in 1. Confirm the flowline valve is open and the separator (if fitted) is at operating level. 2. Release the pump jack brake and start the prime mover. 3. Confirm stroke rate within 6–9 spm and check the stuffing box for leaks. 4. For a planned shut-in, stop the prime mover at the bottom of t  T350 operating manual [OM-T350]: # T350 Deep Rod-Lift Oil Well — Operating & Maintenance Manual > Fictional manual written for the FlytBase Asset Copilot hackathon. Not for real-world use. Document ID: OM-T350 · Revision 2 · Applies to all wells with `well_type = "T350"` ## 1. Scope The T350 is a deeper, higher-rate version of the   Operator note · CTX-0001-003 [CTX-0001-003]: {"asset_id":"WELL-0001","created_at":"2026-10-08T06:40:00Z","author_user_id":"U-102","note_type":"operator_feedback","text":"Well shut in from 7 Oct for planned rod string replacement. Work order not yet in the maintenance system. Expected back online around 20 Oct.","valid_from":"2026-10-07","valid

Evidence IDs: OM-T200, OM-T350, CTX-0001-003, MNT-0110-030, MNT-0058-027, MNT-0066-013.

Referenced wells: WELL-0001, WELL-0110, WELL-0058, WELL-0066. Visual: none. Conflicts: 0.

Trace: gemini_planner 2133 ms: Structured plan validated: search. Only this user’s last five exchanges were supplied. | document_retrieval 853 ms: Lexical index reused per dataset; 6 bounded evidence passages selected from 47177 records. | retrieval_fallback 2732 ms: Synthesis unavailable (invalid_response); original source passages returned. Retry to reconnect.

## Provider status before run

```json
{
  "provider": "gemini",
  "configured": true,
  "model": "gemini-3.5-flash-lite",
  "reasoningModel": "gemini-3.8-flash",
  "status": "ready",
  "keyCount": 5,
  "projectCount": 5,
  "healthyKeys": 5,
  "availableKeys": 5,
  "cooldownKeys": 0,
  "disabledKeys": 0,
  "busyProjects": 0,
  "rpmPerProject": 5,
  "tpmPerProject": 20000,
  "rpdPerProject": 100,
  "limitSource": "Application caps; actual Google project quotas may differ.",
  "estimatedTokensLastMinute": 0,
  "requestsToday": 0,
  "dailyResetAt": "2026-10-18T07:00:01.479Z",
  "timeoutMs": 25000,
  "maxAttempts": 2,
  "nextRetryAt": null
}
```

## Provider status after run

```json
{
  "provider": "gemini",
  "configured": true,
  "model": "gemini-3.5-flash-lite",
  "reasoningModel": "gemini-3.8-flash",
  "status": "ready",
  "keyCount": 5,
  "projectCount": 5,
  "healthyKeys": 5,
  "availableKeys": 5,
  "cooldownKeys": 0,
  "disabledKeys": 0,
  "busyProjects": 0,
  "rpmPerProject": 5,
  "tpmPerProject": 20000,
  "rpdPerProject": 100,
  "limitSource": "Application caps; actual Google project quotas may differ.",
  "estimatedTokensLastMinute": 29562,
  "requestsToday": 16,
  "dailyResetAt": "2026-10-18T07:00:01.479Z",
  "timeoutMs": 25000,
  "maxAttempts": 2,
  "nextRetryAt": null
}
```


---

## Targeted manual retrieval retest

### Hosted Gemini targeted check

Run started: 2026-10-17T08:17:48.401Z. Finished: 2026-10-17T08:18:08.167Z.
Sample reference date: 2026-10-16; 200 wells; 47177 indexed evidence documents.

**Hosted + semantic checks: 1/1. Semantic checks: 1/1.**

This is a bounded live run through the app runAgent entry point, with one sequential question at a time. Calls use the configured provider, its per-project budgets, retries and cooldowns. No local model or mocked provider is used. Credentials are loaded by process.loadEnvFile from ignored environment files and never printed. State and user histories exist only in memory; no .local/state.json writes occur.

This targeted retest covers general manual retrieval and grounded hosted synthesis. The earlier multi-scenario run remains above. This sample run does not prove results on the final hidden dataset.

Reproduce only with authorized hosted access: `node --import tsx scripts/live-check.ts --manual-only`. Do not repeatedly rerun during recorded provider cooldown; provider budgets are scoped to the running process.

| Scenario | Semantic | Hosted | Model | Duration | Tools |
|---|---|---|---|---:|---|
| General manual retrieval | PASS | PASS | gemini-3.8-flash | 18352 ms | gemini_planner, document_retrieval, gemini_synthesis |

## General manual retrieval

Question: What does the T200 operating manual require an operator to do before a planned shut-in starts?

Expected: Retrieve and synthesize manual requirement to record planned shut-in in maintenance system; cited hosted synthesis.

Model: gemini-3.8-flash; status: hosted; reason: none.

Answer: According to Section 4 of the T200 operating manual, for a planned shut-in before work starts, an operator must stop the prime mover at the bottom of the stroke, set the brake, close the wing valve, and record the shut-in in the maintenance system [OM-T200].

Evidence IDs: OM-T200.

Referenced wells: none. Visual: none. Conflicts: 0.

Trace: gemini_planner 3421 ms: Structured plan validated: search. Only this user’s last five exchanges were supplied. | document_retrieval 897 ms: Lexical index reused per dataset; 6 bounded evidence passages selected from 47177 records. | gemini_synthesis 14034 ms: Grounded prose accepted after source-ID and numerical-token validation.

## Hosted request observations

Only model ID, HTTP status and elapsed time are observed; headers and response bodies are not recorded.

| Attempt | Requested model | HTTP status | Duration |
|---:|---|---:|---:|
| 1 | gemini-3.5-flash-lite | 200 | 3416 ms |
| 2 | gemini-3.8-flash | 200 | 14031 ms |

## Provider status before run

```json
{
  "provider": "gemini",
  "configured": true,
  "model": "gemini-3.5-flash-lite",
  "reasoningModel": "gemini-3.8-flash",
  "status": "ready",
  "keyCount": 5,
  "projectCount": 5,
  "healthyKeys": 5,
  "availableKeys": 5,
  "cooldownKeys": 0,
  "disabledKeys": 0,
  "busyProjects": 0,
  "rpmPerProject": 5,
  "tpmPerProject": 20000,
  "rpdPerProject": 100,
  "limitSource": "Application caps; actual Google project quotas may differ.",
  "estimatedTokensLastMinute": 0,
  "requestsToday": 0,
  "dailyResetAt": "2026-10-18T07:00:01.503Z",
  "timeoutMs": 25000,
  "maxAttempts": 2,
  "nextRetryAt": null
}
```

## Provider status after run

```json
{
  "provider": "gemini",
  "configured": true,
  "model": "gemini-3.5-flash-lite",
  "reasoningModel": "gemini-3.8-flash",
  "status": "ready",
  "keyCount": 5,
  "projectCount": 5,
  "healthyKeys": 5,
  "availableKeys": 5,
  "cooldownKeys": 0,
  "disabledKeys": 0,
  "busyProjects": 0,
  "rpmPerProject": 5,
  "tpmPerProject": 20000,
  "rpdPerProject": 100,
  "limitSource": "Application caps; actual Google project quotas may differ.",
  "estimatedTokensLastMinute": 4586,
  "requestsToday": 2,
  "dailyResetAt": "2026-10-18T07:00:01.503Z",
  "timeoutMs": 25000,
  "maxAttempts": 2,
  "nextRetryAt": null
}
```


---

## Targeted manual retrieval retest

### Hosted Gemini targeted check

Run started: 2026-10-17T08:20:08.570Z. Finished: 2026-10-17T08:20:15.141Z.
Sample reference date: 2026-10-16; 200 wells; 47177 indexed evidence documents.

**Hosted + semantic checks: 0/1. Semantic checks: 0/1.**

This is a bounded live run through the app runAgent entry point, with one sequential question at a time. Calls use the configured provider, its per-project budgets, retries and cooldowns. No local model or mocked provider is used. Credentials are loaded by process.loadEnvFile from ignored environment files and never printed. State and user histories exist only in memory; no .local/state.json writes occur.

This targeted retest covers general manual retrieval and grounded hosted synthesis. The earlier multi-scenario run remains above. This sample run does not prove results on the final hidden dataset.

Reproduce only with authorized hosted access: `node --import tsx scripts/live-check.ts --manual-only`. Do not repeatedly rerun during recorded provider cooldown; provider budgets are scoped to the running process.

| Scenario | Semantic | Hosted | Model | Duration | Tools |
|---|---|---|---|---:|---|
| General manual retrieval | FAIL | FAIL | gemini-3.5-flash-lite | 5182 ms | gemini_planner, document_retrieval, synthesis_routing, retrieval_fallback |

## General manual retrieval

Question: What does the T200 operating manual require an operator to do before a planned shut-in starts?

Expected: Retrieve and synthesize manual requirement to record planned shut-in in maintenance system; cited hosted synthesis.

Failures: Hosted agent result did not succeed: fallback (invalid_response:citation_markers). Hosted synthesis not accepted
Model: gemini-3.5-flash-lite; status: fallback; reason: invalid_response:citation_markers.

Answer: Relevant source passages:  T200 operating manual [OM-T200]: ## 4. Start-up and shut-in  1. Confirm the flowline valve is open and the separator (if fitted) is at operating level. 2. Release the pump jack brake and start the prime mover. 3. Confirm stroke rate within 6–9 spm and check the stuffing box for leaks. 4. For a planned shut-in, stop the prime mover at the bottom of the stroke, set the brake,    close the wing valve and record the shut-in in the maintenance system before work starts.  Operator note · CTX-0001-003 [CTX-0001-003]: {"asset_id":"WELL-0001","created_at":"2026-10-08T06:40:00Z","author_user_id":"U-102","note_type":"operator_feedback","text":"Well shut in from 7 Oct for planned rod string replacement. Work order not yet in the maintenance system. Expected back online around 20 Oct.","valid_from":"2026-10-07","valid_to":"2026-10-20","note_id":"CTX-0001-003"}  Repair report · MNT-0110-030 [MNT-0110-030]: ## Notes and recommendations  - Check wall thickness along the rest of this flowline. - Consider corrosion inhibitor injection. - Start a root-cause analysis for this equipment before the next repair is closed (well-type manual, section 10).

Evidence IDs: OM-T200, CTX-0001-003, MNT-0110-030, MNT-0058-027, MNT-0066-013, MNT-0067-017.

Referenced wells: WELL-0001, WELL-0110, WELL-0058, WELL-0066, WELL-0067. Visual: none. Conflicts: 0.

Trace: gemini_planner 2530 ms: Structured plan validated: search. Only this user’s last five exchanges were supplied. | document_retrieval 786 ms: Lexical index reused per dataset; 6 bounded evidence passages selected from 47177 records. | synthesis_routing 0 ms: Ordinary evidence lookup uses the primary fast model. Requested model: gemini-3.5-flash-lite. | retrieval_fallback 1865 ms: Synthesis unavailable (invalid_response:citation_markers); original source passages returned. Retry to reconnect.

## Hosted request observations

Only model ID, HTTP status and elapsed time are observed; headers and response bodies are not recorded.

| Attempt | Requested model | HTTP status | Duration |
|---:|---|---:|---:|
| 1 | gemini-3.5-flash-lite | 200 | 2526 ms |
| 2 | gemini-3.5-flash-lite | 200 | 1862 ms |

## Provider status before run

```json
{
  "provider": "gemini",
  "configured": true,
  "model": "gemini-3.5-flash-lite",
  "reasoningModel": "gemini-3.8-flash",
  "status": "ready",
  "keyCount": 5,
  "projectCount": 5,
  "healthyKeys": 5,
  "availableKeys": 5,
  "cooldownKeys": 0,
  "disabledKeys": 0,
  "busyProjects": 0,
  "rpmPerProject": 5,
  "tpmPerProject": 20000,
  "rpdPerProject": 100,
  "limitSource": "Application caps; actual Google project quotas may differ.",
  "estimatedTokensLastMinute": 0,
  "requestsToday": 0,
  "dailyResetAt": "2026-10-18T07:00:01.486Z",
  "timeoutMs": 25000,
  "maxAttempts": 2,
  "nextRetryAt": null
}
```

## Provider status after run

```json
{
  "provider": "gemini",
  "configured": true,
  "model": "gemini-3.5-flash-lite",
  "reasoningModel": "gemini-3.8-flash",
  "status": "ready",
  "keyCount": 5,
  "projectCount": 5,
  "healthyKeys": 5,
  "availableKeys": 5,
  "cooldownKeys": 0,
  "disabledKeys": 0,
  "busyProjects": 0,
  "rpmPerProject": 5,
  "tpmPerProject": 20000,
  "rpdPerProject": 100,
  "limitSource": "Application caps; actual Google project quotas may differ.",
  "estimatedTokensLastMinute": 4570,
  "requestsToday": 2,
  "dailyResetAt": "2026-10-18T07:00:01.486Z",
  "timeoutMs": 25000,
  "maxAttempts": 2,
  "nextRetryAt": null
}
```


---

## Targeted manual retrieval retest

### Hosted Gemini targeted check

Run started: 2026-10-17T08:24:56.109Z. Finished: 2026-10-17T08:25:01.926Z.
Sample reference date: 2026-10-16; 200 wells; 47177 indexed evidence documents.

**Hosted + semantic checks: 1/1. Semantic checks: 1/1.**

This is a bounded live run through the app runAgent entry point, with one sequential question at a time. Calls use the configured provider, its per-project budgets, retries and cooldowns. No local model or mocked provider is used. Credentials are loaded by process.loadEnvFile from ignored environment files and never printed. State and user histories exist only in memory; no .local/state.json writes occur.

This targeted retest covers general manual retrieval and grounded hosted synthesis. The earlier multi-scenario run remains above. This sample run does not prove results on the final hidden dataset.

Reproduce only with authorized hosted access: `node --import tsx scripts/live-check.ts --manual-only`. Do not repeatedly rerun during recorded provider cooldown; provider budgets are scoped to the running process.

| Scenario | Semantic | Hosted | Model | Duration | Tools |
|---|---|---|---|---:|---|
| General manual retrieval | PASS | PASS | gemini-3.5-flash-lite | 4274 ms | gemini_planner, document_retrieval, synthesis_routing, gemini_synthesis |

## General manual retrieval

Question: What does the T200 operating manual require an operator to do before a planned shut-in starts?

Expected: Complete shut-in checklist: stop prime mover at bottom of stroke, set brake, close wing valve, record in maintenance system before work; cited hosted synthesis.

Model: gemini-3.5-flash-lite; status: hosted; reason: none.

Answer: For a planned shut-in, the T200 operating manual requires an operator to stop the prime mover at the bottom of the stroke. [OM-T200]  The operator must also set the brake, close the wing valve, and record the shut-in in the maintenance system before work starts. [OM-T200]

Evidence IDs: OM-T200.

Referenced wells: none. Visual: none. Conflicts: 0.

Trace: gemini_planner 2123 ms: Structured plan validated: search. Only this user’s last five exchanges were supplied. | document_retrieval 804 ms: Lexical index reused per dataset; 6 bounded evidence passages selected from 47177 records. | synthesis_routing 0 ms: Ordinary evidence lookup uses the primary fast model. Requested model: gemini-3.5-flash-lite. | gemini_synthesis 1347 ms: Actual model: gemini-3.5-flash-lite. Grounded prose accepted after source-ID and numerical-token validation.

## Hosted request observations

Only model ID, HTTP status and elapsed time are observed; headers and response bodies are not recorded.

| Attempt | Requested model | HTTP status | Duration |
|---:|---|---:|---:|
| 1 | gemini-3.5-flash-lite | 200 | 2117 ms |
| 2 | gemini-3.5-flash-lite | 200 | 1344 ms |

## Provider status before run

```json
{
  "provider": "gemini",
  "configured": true,
  "model": "gemini-3.5-flash-lite",
  "reasoningModel": "gemini-3.8-flash",
  "status": "ready",
  "keyCount": 5,
  "projectCount": 5,
  "healthyKeys": 5,
  "availableKeys": 5,
  "cooldownKeys": 0,
  "disabledKeys": 0,
  "busyProjects": 0,
  "rpmPerProject": 5,
  "tpmPerProject": 20000,
  "rpdPerProject": 100,
  "limitSource": "Application caps; actual Google project quotas may differ.",
  "estimatedTokensLastMinute": 0,
  "requestsToday": 0,
  "dailyResetAt": "2026-10-18T07:00:01.449Z",
  "timeoutMs": 25000,
  "maxAttempts": 2,
  "nextRetryAt": null
}
```

## Provider status after run

```json
{
  "provider": "gemini",
  "configured": true,
  "model": "gemini-3.5-flash-lite",
  "reasoningModel": "gemini-3.8-flash",
  "status": "ready",
  "keyCount": 5,
  "projectCount": 5,
  "healthyKeys": 5,
  "availableKeys": 5,
  "cooldownKeys": 0,
  "disabledKeys": 0,
  "busyProjects": 0,
  "rpmPerProject": 5,
  "tpmPerProject": 20000,
  "rpdPerProject": 100,
  "limitSource": "Application caps; actual Google project quotas may differ.",
  "estimatedTokensLastMinute": 4651,
  "requestsToday": 2,
  "dailyResetAt": "2026-10-18T07:00:01.449Z",
  "timeoutMs": 25000,
  "maxAttempts": 2,
  "nextRetryAt": null
}
```
