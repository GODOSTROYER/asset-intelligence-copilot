# Adversarial hardening round

Started 17 October 2026, approximately 14:53 IST. This is a working record; pending checks are not passes.

## Objective

Improve behavior under changed documents, stale and competing evidence, multi-user feedback, and malformed imports while preserving the successful challenge scenarios. Keep the existing typed planner, deterministic tools, inline visuals and scoped memory architecture.

## Recorded baseline

The preliminary v1 source snapshot is identified by ZIP SHA-256 `e34ca8a1ba5740e51b9ccba7a928da86ee8d57d9bac607539febfc19acc24ac2` and public source commit `2a37658038c8c8ef28f30f06c7e004607faf696f`. The receipt/status-only follow-up is `98b5cfc`.

Before this round, the recorded suites passed 25 engine acceptance checks covering all 18 examples, 109 domain stress cases, 27 provider stress checks, 22 ingestion stress cases and nine synthesis checks. The full natural-language/API sequence of all 18 examples had not been run as a single complete sequence. The earlier 32-question hosted run and targeted retests remain separately documented; they are not a baseline clean full rerun.

## Work streams

| Area | Adversarial target | Evidence file |
|---|---|---|
| Rules and reports | Changed SOP prose, unsupported or conflicting rules, negation and ambiguous timing; no silent sample constants | `RULE_ADVERSARIAL.md` |
| Retrieval and feedback | Corrections displaced by high-scoring raw passages, superseded values, claim conflicts, scope boundaries | `RETRIEVAL_ADVERSARIAL.md` |
| Imports and memory | Malformed additions, identity reuse, date handling, atomic rollback and restart persistence | `IMPORT_MEMORY_ADVERSARIAL.md` |
| Independent challenge probes | Oracles constructed from raw fixtures, with original failures preserved | `EDGE_ORACLE.md` |
| Complete pipeline | All 18 official examples and their dependent multi-user steps through an isolated Express API and hosted planner | `E2E18_CHECKS.md` |

All automated stateful checks use isolated fixtures/state. One owner controls hosted calls. Credentials are excluded from reports. The preliminary uploaded ZIP stays unchanged until a new verified version is prepared.

## Completion gates

1. Reproduce and retain genuine failures, then rerun their exact assertions after fixes.
2. Re-run the existing acceptance, domain, provider, synthesis, import and visual regressions.
3. Complete the all-18 hosted API sequence, checking facts, citations, visuals, shared corrections, private histories and persistence.
4. Inspect the affected UI flows and production build; record remaining limitations without converting a safe refusal into a complete answer.
5. Refresh the source package and judge-facing QA account only from the verified implementation.

Current status: implementation and adversarial fixture work in progress; the complete hosted sequence has not started.
