# Part 2 v2 shot log - "Who told you that?"

File: `part2-scenario-v2.mp4` - 1920x1080, H.264, yuv420p, 30 fps, no audio, 178.0 s (2:58). Voiced version: `part2-voiced-v2.mp4`.
Final stitch: `asset-intelligence-copilot-demo-v2.mp4` = `part1-system-v2.mp4` (119.9 s) + `part2-voiced-v2.mp4` (178.0 s) = 297.9 s.
Real screen recording (Playwright + Chromium, ~35 ms/char typing, visible cursor dot) of the live app on the TEST dataset (600 wells, reference date 2027-01-15),
fresh state dir. Every answer shows model.status "hosted" (gemini-3.5-flash-lite planner). Timestamps are video time (mm:ss), +/-1 s.

| Time | Action / what is on screen |
|---|---|
| 00:01 | App open (600 wells, 125,198 inspections) |
| 00:03 | User dropdown -> **Robert Hayes** (maintenance lead) |
| 00:06-00:09 | Types T1: "Which recalled pumps are still in the ground right now?" |
| 00:12 / 00:15 | Send / answer: 9 wells (NW-12 = 4, NE-8 = 2, SW-23 = 2, SE-32 = 1), table, USD 209,949 install cost, deadline 31 Dec 2026 |
| 00:18-00:27 | Slow scroll through the 9-row table |
| 00:31 | Dropdown -> **Nathan Pierce** |
| 00:34-00:42 | Types T2: WELL-0333 pump swapped yesterday, no work order, "count it as replaced from now on" |
| 00:45 / 00:47 | Answer: recorded as an unconfirmed shared claim attributed to Nathan Pierce; does not overwrite maintenance records; WELL-0333 still counted ("1 per the records, 0 if confirmed by a work order") |
| 00:53 | Dropdown -> **Olivia Grant** |
| 00:56-01:03 | Types T3: "Nathan told me the recalled pump on WELL-0577 was swapped as well. Take it off the recall list." |
| 01:05 / 01:08 | Answer: recorded as unconfirmed claim, "second-hand report from Olivia Grant (via Nathan Pierce)"; 0577 not removed |
| 01:14 | Dropdown -> **Robert Hayes** |
| 01:17-01:22 | Types T4 (same recall question) |
| 01:25 / 01:27 | Answer: still 9 wells; "2 wells carry an unconfirmed replacement report (WELL-0333 by Nathan Pierce; WELL-0577 second-hand from Olivia Grant via Nathan Pierce)... 9 per the records, 7 if confirmed by work orders" |
| 01:30-01:33 | Table scrolls horizontally to the Notes column |
| 01:33-01:41 | Table scrolls down to WELL-0333 / WELL-0577 rows with Notes ("Reported replaced by Nathan Pierce ... unconfirmed: no work order on record"; "Second-hand: Olivia Grant relayed that Nathan Pierce said ...") |
| 01:45 | Page scrolls to the Evidence conflict box and the source chips |
| 01:48-01:54 | Clicks citation CLAIM-... -> source drawer shows the raw claim record (text, authorUserId U-601, authorName Nathan Pierce, confirmed false); drawer closed ~01:56 |
| 02:00 | Dropdown -> **Laura Simmons** (HSE officer) |
| 02:03-02:15 | Types T5: since 1 Nov 2026, gas notes vs timely response under operating procedures |
| 02:17 / 02:21 | Answer: 26 gas / H2S notes: **17 Met, 9 Missed** (OPS-1: 24 h before 1 Jan 2027, 12 h from 1 Jan 2027; drone inspections do not count). Missed list incl. WELL-0332 and WELL-0052 (no qualifying response) |
| 02:23-02:33 | Slow scroll through the Met / Missed table |
| 02:39-02:46 | Types T6: "Of all the wells we've talked about today, which one would you deal with first, and why?" |
| 02:49 / 02:53 | Answer: **WELL-0332 (Northwest Block 12) first**: unanswered gas report CTX-0332-004, no H2S reading, not producing (0.5 C above air vs 15 C needed); then WELL-0052, WELL-0401. Priority SAFETY > COMPLIANCE > PRODUCTION > EQUIPMENT |
| 02:58 | End (cut) |

Notes: claim timestamps display "Oct 17, 2026" (the real machine clock, since claims are stamped at write time) while the dataset reference date is 2027-01-15.
