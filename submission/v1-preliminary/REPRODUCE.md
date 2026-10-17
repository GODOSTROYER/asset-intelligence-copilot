# Reproduce the source package

This package contains the authored app and local documentation/scripts plus the challenge's MIT notice and four challenge documents. It excludes dependencies, build output, Git history, datasets, credentials and saved conversations. Only five named app screenshots are included; portal/account screenshots and PDF preview images are excluded. Package contents are explicitly selected by `build-package.py`; `PACKAGE-MANIFEST.json` records each included file's SHA-256 and size. Credential scanning covers recognized API-key, OAuth-token, JWT, GitHub-token and private-key formats; it does not establish that every possible secret format is detected.

The sample dataset is public synthetic challenge data. Obtain it from [FlytBase's upstream repository](https://github.com/FlytBaseAILabs/flytbase-ahc-swe-asset-intelligence-dataset), pinned to commit `b8de8c9bd68f40334e5d06922126169e4f3bf3ca` for this package's documented sample evidence. It is deliberately not bundled, so the app ZIP contains no local imported data or histories.

## Run

1. Extract the ZIP to a new folder, preserving `apps/asset-intelligence-copilot/`.
2. Obtain the upstream sample at the pinned commit, and place its `sample-data/` next to `apps/` in the extracted root. Alternatively set `SAMPLE_DATA_PATH` to its absolute path.
3. Use Node.js 24 and npm. The development environment recorded Node 24.19.0 and npm 11.6.0. In `apps/asset-intelligence-copilot`, run `npm ci`, then `npm run build`, then `npm start`.
4. Open `http://127.0.0.1:4178`. Use a new empty `COPILOT_STATE_DIR` if you want isolated reproduction. The sample evaluation date is `2026-10-16`.
5. For hosted Gemini, copy `.env.example` to a private `.env.local` and supply your own authorized credentials. Never share that file. The app can start without credentials and has a labeled local planner fallback; hosted general synthesis requires configured access. No local model is bundled.

The source package does not include the final event release or final-question answers. An importer adds roots to the base dataset; use `SAMPLE_DATA_PATH` to select the intended base explicitly if the organizer supplies a replacement dataset. Keep the release and reference date recorded with the final answers.

## Optional documented checks

After installing dependencies, the offline checks are `node --import tsx scripts/acceptance.ts`, `scripts/data-check.ts`, `scripts/engine-check.ts`, `scripts/review-check.ts`, `scripts/api-check.ts`, `scripts/provider-check.ts`, `scripts/synthesis-review-check.ts` and `scripts/visual-check.ts` (repeat the same `node --import tsx` prefix for each). Read each script before running it; reports document their scope. `scripts/live-check.ts` makes hosted calls and requires separate authorized provider access. Creating this package does not rerun application acceptance or establish new pass results.

## Rebuild the ZIP

From the original repository or an extracted package root, run `python apps/asset-intelligence-copilot/submission/build-package.py`. It uses Python's standard library only and writes into that `submission/` directory. Sorted entries, fixed ZIP timestamps and identical input bytes produce the same archive bytes on the same Python/zlib toolchain. File hashes identify exactly which source/report versions were packaged while implementation and stress reviews continue.

The root `LICENSE` preserves the existing repository's MIT license notice. The authored app is packaged within that repository's licensing context; retain upstream attribution when distributing it.
