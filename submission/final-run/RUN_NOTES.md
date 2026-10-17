# Run notes - final-questions run on the test dataset

- Start command: `node --import tsx server/index.ts` in the app folder, with PORT=4292, a fresh empty COPILOT_STATE_DIR, SAMPLE_DATA_PATH=test-data/dataset, REFERENCE_DATE=2027-01-15. `.env.local` was loaded normally (5 Gemini keys, planner model gemini-3.5-flash-lite). No app code was edited.
- /api/bootstrap confirmed: 600 wells, 7 areas, 125198 inspections, 17415 repairs, today = 2027-01-15, empty private memory at the start of the run.
- Result: all 21 turns returned HTTP 200 on the first attempt, with model.status = "fallback" and reason = "invalid_response" on every one. The hosted planner never produced a plan; the deterministic fallback planner did.

## Root cause of the hosted-planner failure (found, not fixed - code is out of scope)

`server/agent.ts` `schemaForDataset()` sets `maxWells = Math.max(200, dataset.wells.length)` and uses it as `maxItems` on `wellIds` and as `maximum` on `topK` in the JSON schema sent to Gemini. With 600 wells this is 600. The Gemini API rejects that structured-output schema with a non-retryable 4xx. `server/gemini.ts` maps any other 4xx to `ProviderError('invalid_response')` with no diagnostic text, so the trace only says "Hosted planner unavailable (invalid_response)".

Evidence: calling the app's own `generateStructured()` with a tiny schema succeeded when `maxItems`/`maximum` = 200 and failed with `invalid_response` when they were 600. Direct calls with the same keys to both configured models returned HTTP 200, so credentials, quota and model names are fine (health shows 5/5 healthy keys).

Suggested fix (not applied): keep the schema bound at 200 (the same value used for the 18-sample dataset) and enforce the 600-well limit in `validatePlan` instead of in the schema sent to Gemini.

A patched copy of the app outside APP to get hosted answers was attempted, but the tool permission layer blocked the copy step, so no hosted-planner run exists.

## Screenshots

Skipped. Only Q5 (empty table), Q6 (600-row inspection-count table), Q7-t1 (6-row costs table), Q9-t5 (1 row) returned tables, all from the fallback path; none is a presentable answer.
