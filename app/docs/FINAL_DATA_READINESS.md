# Final dataset readiness: independent loader review

Reviewed 17 Oct 2026, 08:39 UTC / 14:09 IST. This is synthetic stress evidence, not acceptance against the unreleased final dataset or hidden questions.

## Results

| Command | Result | Scope |
|---|---:|---|
| `npx tsx scripts/data-stress.ts` | 22/22 passed | New isolated synthetic datasets, import overlap, provenance, corruption and state boundaries |
| `npx tsx scripts/data-check.ts` | 10/10 passed | Original importer regression and full sample load |
| `npx tsx scripts/api-check.ts` | 7/7 grouped checks passed | Isolated offline child server, atomic import/chat persistence and restart |
| `npx tsx scripts/acceptance.ts` | 25/25 passed | Published example answers and existing sample variations |
| `npx tsc --noEmit` | Passed | Current production TypeScript sources |

The stress suite initially passed 8 of 16 cases. Its eight failures were retained as regression assertions and corrected; six more checks then expanded coverage to 22. No assertion was removed or weakened.

## Confirmed fixes

Imported overlapping records now replace the previous complete record with the later root's complete record. They are not field patches: an omitted old temperature, status or other field is not silently inherited. This makes the effective raw record equal the JSON in its authoritative evidence document. Missing temperature remains unknown and does not add downtime. Metadata, users and areas follow the same record replacement rule; records whose IDs are absent from the new root remain in the combined dataset.

Replacing a repair also invalidates its previous narrative report. A null report pointer or an unreadable replacement report cannot keep an older report attached to a newer repair. A readable replacement still follows `report_file` exactly, including spaces, nested names and names beginning with two dots. Paths that actually traverse outside the well directory warn and are not read. Repair records and reports retain separate `(type, id)` source identities.

The loader accepts a UTF-8 BOM and whitespace-only JSONL lines. It rejects malformed JSON, invalid fleet array envelopes, missing record IDs, duplicate IDs within a source, wrong asset ownership, invalid required record timestamps and one record ID assigned to different wells. Invalid imports therefore fail before the API commits a candidate dataset or state.

The earlier `data-check.ts` repair fixture omitted `started_at`, a required Dataset Guide field. The fixture now supplies its existing test date as `started_at`; all ten original assertions are unchanged.

## Provenance and state evidence

The synthetic tests introduce T777 and T888, including decimal production thresholds, rather than reusing expected sample answers. The applicable manual changes the status classification. Empty optional record sections and missing thermal fields produce an unavailable/unknown result instead of inventing measurements.

For overlapping inspections and metadata, tests compare the effective loaded object directly with the cited source document's parsed JSON. Complete replacements preserve the imported origin and source path. Missing replacement narratives are absent from the evidence index and cannot influence containment conclusions.

Existing shared corrections survive import. A synthetic imported raw temperature of 45 °C with a persisted 35-to-50 °C correction keeps 50 °C effective, retains both sources, and surfaces a conflict explaining that the raw source changed after feedback. The original correction object is not mutated. A correction for another asset, a rule for another well type and another user's private history do not cross their scopes.

The isolated API checks confirm that malformed imports preserve prior statistics, roots, revision and saved-state bytes. Concurrent chat saves remain serialized, full answer/citation objects survive restart, and shared corrections remain visible to another user while private histories stay separate.

## Isolation and limits

Synthetic fixture trees live under a unique temporary directory. Cleanup checks that the resolved target is inside the system temporary directory and verifies that the stress directory no longer exists afterward. The API child uses its own temporary state and port 4180, stops only its spawned process, and removes only its own temporary tree. `COPILOT_SKIP_ENV_FILES=1` keeps the offline child from reading `.env` files; empty provider keys and the health check establish that no provider is configured.

No original dataset file, production state, real credential, cloud API, browser session, commit or push was used or modified for this review. Readiness here covers same-format data and the tested variations. It does not establish accuracy for arbitrary manual wording, every malformed input, model-generated plans, unreleased final questions or live deployment behavior.
