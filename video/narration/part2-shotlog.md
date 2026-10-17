# Part 2 shot log - "Michael Turner's morning, then a hand-off"

File: `part2-scenario.mp4` - 1920x1080, H.264 (h264_nvenc), yuv420p, 30 fps, no audio, 172.8 s (2:52.8).
Real screen recording (Playwright + Chromium, ~35 ms/char typing, visible cursor dot) of the live app on the TEST dataset
(600 wells, 125,198 inspections, reference date 2027-01-15). Every answer shows the green "gemini-3.5-flash-lite - hosted" dot (hosted Gemini planner used for every question).
Timestamps are video time (mm:ss), accurate to about +/-1 s.

WELL-X = **WELL-0309** (NW-12, T200 rod-lift). Verified against raw files:
- Latest inspection INS-0309-0215, 2027-01-14T15:15Z, inspector U-603 = Caleb Whitaker, method drone; wellhead 13.1 C, ambient 10.6 C, delta 2.5 C.
- T200 manual (OM-T200 section 9.3): producing only if wellhead is >= 15 C above ambient. 2.5 C < 15 C, so NOT producing. Stored status says "active" (out of date).
- Previous reading (2027-01-07): delta 18.7 C (producing). Only the Jan 14 reading in the 13-week window is non-producing.
- Repair MNT-0309-026 "Downhole pump stuck", corrective, 2027-01-15 to 2027-01-27, triggered by INS-0309-0215.

## Timeline

| Time | Action / what is on screen |
|---|---|
| 00:00 | App opens, header shows 600 wells / 125,198 inspections, Gemini configured |
| 00:02-00:03 | Cursor clicks the user dropdown, selects **Michael Turner** |
| 00:05-00:11 | Click composer, types Q1 |
| 00:13 | Cursor clicks Send (after ~1.5 s pause) |
| 00:17 | **Answer 1 appears** (hosted, 2.5 s) |
| 00:24 | Table scrolled into view |
| 00:26-00:45 | Slow wheel scroll through the table (WELL-0309 first row down to WELL-0442) |
| 00:52-00:57 | Click composer, types Q2 |
| 00:59 | Send |
| 01:01 | **Answer 2 appears** with status card (Not producing; 13.1 / 10.6 / 2.5 delta; threshold 15) |
| 01:09 | Click first citation chip **INS-0309-0215** |
| 01:09-01:12 | Source drawer open with raw inspection JSON, held 3 s |
| 01:14 | Close drawer |
| 01:17-01:25 | Types Q3 |
| 01:27 | Send |
| 01:29 | **Answer 3 appears**: line chart |
| 01:33-01:42 | Chart in view, cursor sweeps along both lines; orange dot on Jan 14 point |
| 01:49-01:54 | Types Q4 (as Michael) |
| 01:57 | Send |
| 01:59 | **Answer 4 appears**: shared knowledge saved, attributed to Michael Turner |
| 02:07 | Cursor clicks the user dropdown, switches to **Robert Hayes** (empty history, private memory scoped to him) |
| 02:11-02:13 | Types Q5 |
| 02:16 | Send |
| 02:19 | **Answer 5 appears** |
| 02:23 | Q5 table in view |
| 02:32 | Click "Shared well knowledge" |
| 02:34 | Memory & feedback drawer open |
| 02:34-02:44 | Hold, then scroll: Shared well knowledge (1) vs Robert Hayes - private memory (1) |
| 02:50 | Close drawer |
| 02:53 | End |

## Questions (exact) and answers

**Q1 (as Michael Turner, 00:05)**: "Which wells in Northwest Block 12 are not producing oil right now, and why? Show them in a table."
Answer (00:17): "12 wells in Northwest Block 12 are not producing on their latest inspections." Table "Not producing - Northwest Block 12" with columns Well / Type / Wellhead - air / Stored status / Reason / Last inspected. Rows: WELL-0309 (T200, 2.5 C, downhole pump stuck), WELL-0316 (T350, 1 C, prime mover failure), WELL-0330 (T200, 4.4 C, status down, operator note by Austin Kemp), WELL-0332 and WELL-0373 (no recorded reason, field check recommended), WELL-0377 (prime mover failure), WELL-0397 (sucker rod parted), WELL-0404 (down, flowline corrosion pinhole leak), WELL-0408 (stuffing box packing leak), WELL-0418, WELL-0429, WELL-0442. Most are stored as "active (out of date)". 188 sources in the evidence trail.

**Q2 (00:52)**: "Is WELL-0309 producing oil right now? When was it last inspected, and by whom?"
Answer (01:01): "No, WELL-0309 is not producing oil. Latest inspection INS-0309-0215 was Jan 14, 2027 by Caleb Whitaker (drone). Wellhead 13.1 C minus air 10.6 C = 2.5 C; the T200 manual threshold is 15 C. Downhole pump stuck (MNT-0309-026). The stored status "active" is out of date." Status card; sources INS-0309-0215, OM-T200, CTX-0309-001, MNT-0309-026. Source drawer shows the raw JSONL record (inspector U-603, drone, 13.1 / 10.6, spill false).

**Q3 (01:17)**: "Show a line chart of WELL-0309's wellhead temperature against air temperature for the last 13 weeks, and mark when it was not producing oil."
Answer (01:29): "Here are 12 readings in the requested period. Not producing on Jan 14, 2027." Line chart "Wellhead vs air - Oct 16, 2026 to Jan 15, 2027": wellhead 41.3 C (Oct 22), peak 45.8 C (Nov 26), 24.5 C (Jan 7), then 13.1 C (Jan 14); air 19.7 C falling to 4.6 C then 10.6 C. Single orange marker and a "Non-producing readings" box: Jan 14, 2027 - WELL-0309. 13 sources (OM-T200 plus the 12 inspections).

**Q4 (as Michael, 01:49)**: "FYI for everyone: WELL-0309 will be shut in from 16 Jan for a 5-day planned workover."
Answer (01:59): "Saved shared field knowledge from Michael Turner: FYI for everyone: WELL-0309 will be shut in from 16 Jan for a 5-day planned workover. Other users can see its author and date." Card "Shared well knowledge saved", one source (FACT-..., shared knowledge).

**Q5 (as Robert Hayes, 02:11)**: "Is any downtime planned for WELL-0309?"
Answer (02:19): "Yes. WELL-0309: FYI for everyone: WELL-0309 will be shut in from 16 Jan for a 5-day planned workover. According to Michael Turner. Starts Jan 16, 2027. Duration about 5 days." Table "Shared field knowledge": Well WELL-0309, From Jan 16, 2027, Days 5, Author Michael Turner. Source is the same FACT- record Michael created.

**Memory drawer (02:34)**: "Shared well knowledge (1)": Michael's note, authored by Michael Turner, WELL-0309; corrections, claims, type rules all 0; "Robert Hayes - private memory (1)": his own Q5 and its answer. Message: shared context reaches every user, conversation recall stays private.
