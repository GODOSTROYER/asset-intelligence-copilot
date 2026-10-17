# Asset Intelligence Copilot

A chat application for the FlytBase Hack Day asset-intelligence challenge. It answers questions over well inspections, maintenance, regulator events, manuals and field notes, with inline visuals and inspectable source records.

Hosted Gemini interprets a question into a validated typed operation. Local tools calculate status, downtime, spills, costs and compliance; general document questions use scoped retrieval and cited synthesis. Shared corrections preserve provenance, while conversation recall stays scoped to the selected dataset user.

## Run locally

Use Node.js 24 and npm. This repository contains the authored app and challenge reference documents; the synthetic dataset is obtained separately.

1. Obtain `sample-data/` from [FlytBase's upstream challenge repository](https://github.com/FlytBaseAILabs/flytbase-ahc-swe-asset-intelligence-dataset) at commit `b8de8c9bd68f40334e5d06922126169e4f3bf3ca`.
2. Place `sample-data/` beside `apps/` in this checkout, or set `SAMPLE_DATA_PATH` to its absolute directory.
3. In `apps/asset-intelligence-copilot`, run:

```powershell
npm ci
npm run build
npm start
```

4. Open `http://127.0.0.1:4178`. The sample reference date is `2026-10-16`.
5. For hosted planning/synthesis, copy the app's `.env.example` to a private `.env.local` and supply your own authorized Gemini credentials. Keys remain server-side. Without keys, the app starts with a labeled local planner fallback; hosted general synthesis requires configured access. No local model is included.

See the [app README](apps/asset-intelligence-copilot/README.md), [architecture](apps/asset-intelligence-copilot/docs/ARCHITECTURE.md), and [reproduction guide](apps/asset-intelligence-copilot/submission/REPRODUCE.md) for configuration and data handling.

## Evidence and limitations

These are preliminary sample-data and synthetic-fixture results, not final event-dataset results. The retained reports record 25 sample acceptance checks, 109 independent domain stress checks, 27 provider stress checks and 22 ingestion stress checks passing. Across an initial unseen-question run and a three-case targeted retest, semantic evidence passes for 32/32 scenarios and hosted-plus-semantic evidence for 30/32; two invalid inputs correctly use deterministic fallback. This is not a complete fresh run after the fixes. The original failures and harness audits remain documented.

A separate fleet-status routing regression passed; the hosted UI retest returned all 15 current non-producing wells and correct ten-row pagination. This browser observation is separate from the 32-question batch.

- [Domain stress evidence](apps/asset-intelligence-copilot/docs/DOMAIN_STRESS.md)
- [Provider stress evidence](apps/asset-intelligence-copilot/docs/PROVIDER_STRESS.md)
- [Ingestion and provenance evidence](apps/asset-intelligence-copilot/docs/FINAL_DATA_READINESS.md)
- [Unseen hosted questions and targeted fixes](apps/asset-intelligence-copilot/docs/UNSEEN_LIVE_CHECKS.md)
- [Submission writeup draft](apps/asset-intelligence-copilot/submission/writeup.md)

The map plots coordinates without an external basemap. The user picker demonstrates memory isolation and is not production authentication. Numeric/source membership checks do not prove every generated sentence's meaning. Exact billed model spend is unmeasured. The final dataset/questions, final own-voice video and portal submission confirmation remain separate deliverables.

No dataset, credentials, saved histories, dependencies, build output or upstream Git history are distributed here. Challenge data and manuals are fictional and are not operational guidance.

## License and challenge attribution

[MIT License](LICENSE). The original FlytBase copyright notice is preserved. The challenge problem statement, dataset guide, example questions and prerequisites are included as attributed reference materials; the application is in `apps/asset-intelligence-copilot/`.
