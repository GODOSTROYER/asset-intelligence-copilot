---
format: 1920x1080
duration: 185s
message: "Ask your oil field anything and get the answer with its evidence attached; the model plans, code calculates."
arc: Context → Hook → Problem → Product intro → Demo: ask → Demo: generative visuals → Demo: memory & corrections → How it works → Close
audience: FlytBase AHC SWE hackathon judges
mode: autonomous
design: frame.md
---

## Frame 1 — Context: how an oil field works

- scene: Wide dusk oil field; pump jacks nod; a cutaway shows the well going down to the oil; the wellhead is labelled; a drone flies the inspection route and thermal-scans a wellhead; WARM = producing vs AIR TEMPERATURE = stopped
- duration: 30s
- poster: 15s
- transition_in: cut
- status: outline
- blueprint: camera-journey
- rules: svg-path-draw, sine-wave-loop, multi-phase-camera
- vo_file: assets/vo/00-context.wav
- voiceover: "Picture an oil field. Hundreds of wells, each with a pump jack nodding up and down, lifting crude oil from deep underground. On top of every well sits the wellhead, the valve cap where the oil comes out. Every week, a drone flies over and checks its temperature. Oil comes up warm, so a wellhead much warmer than the air means the well is working. One that has cooled to air temperature has stopped. Simple, in theory."
- src: compositions/frames/00-context.html

Explain the domain to a non-expert in one continuous illustrated world (flat, engineered vector style in frame.md colors; no stock imagery). Beat 1, "Picture an oil field": a wide horizon at dusk (bg navy, a thin accent horizon line) with a row of 6-8 SVG pump-jack silhouettes nodding on a sine loop at slightly different phases, and tiny mono labels WELL-0001, WELL-0002, … under a few. Beat 2, "lifting crude oil from deep underground": the camera pushes into one well and the ground becomes a cutaway. The well bore draws down (svg-path-draw) to an oil reservoir layer, and dashed flow particles rise up the pipe. Label chips: PUMP JACK, WELL BORE, OIL RESERVOIR. Beat 3, "the wellhead": a zoom onto the top of the well; the wellhead (a simple valve-cap glyph) gets a labelled callout, "WELLHEAD · the valve cap where oil comes out". Beat 4, "a drone flies over": a small quadcopter glyph flies across the field on a dotted route and hovers over the wellhead; a scan cone sweeps down; a thermal readout card appears. Beat 5, "warm means working": a split comparison card. Left: WELLHEAD 70 °C vs AIR 25 °C, labelled MUCH WARMER → PRODUCING (accent). Right: WELLHEAD 26 °C vs AIR 25 °C, labelled SAME AS AIR → STOPPED (alert amber). These two example numbers are illustrative and marked "example". Beat 6, "Simple, in theory.": the comparison card shrinks to a corner and the frame holds on the field, setting up the next scene's twist.

## Frame 2 — Hook: the hot well that isn't working

- scene: Thermal readout 51.6 °C counts up and looks healthy; air 43.1 °C slides in; the difference collapses to +8.5 °C, stamped NOT PRODUCING in amber
- duration: 15s
- poster: 11s
- transition_in: cut
- status: outline
- blueprint: dataviz-countup
- rules: counting-dynamic-scale, kinetic-beat-slam, ambient-glow-bloom
- vo_file: assets/vo/01-hook.wav
- voiceover: "This wellhead reads fifty-one point six degrees. Looks like a working well. It isn't. The air that day was forty-three. The well had stopped, and the rule that says so was buried in a manual."
- src: compositions/frames/01-hook.html

Cold open on one number. The wellhead readout (IBM Plex Mono, hero size, `fg`) counts up 0 → 51.6 °C with a soft accent glow ("healthy"). Beat: "It isn't." The glow drains and an AIR 43.1 °C readout slides in beside it. The two readouts subtract with an animated minus, and the difference +8.5 °C becomes the hero, with a T200 MANUAL · min +15 °C ruler drawn under it showing 8.5 short of 15. Stamp: NOT PRODUCING (alert amber). Final beat: a manual page glyph sinks into a stack of documents ("buried in a manual"). Source: WELL-0001, 24 Jul 2025 (INS-0001-0140) as a small mono chip.

Motion rules for this scene: counting-dynamic-scale, kinetic-beat-slam, ambient-glow-bloom. Evidence-thread signature move uses svg-path-draw.

## Frame 3 — Problem: scattered data

- scene: Four data streams (40,000 inspections · 5,700 repairs · 1,500 reports · notes & manuals) pour in from the edges and pile into a tangled field; one question line cuts through and gets lost
- duration: 17s
- poster: 9s
- transition_in: crossfade
- status: outline
- blueprint: overwhelm-surround
- rules: depth-scatter-assemble, waterfall-entry, counting-dynamic-scale
- vo_file: assets/vo/02-problem.wav
- voiceover: "An oil field generates forty thousand inspections, fifty-seven hundred repairs, fifteen hundred free-text reports, and the notes people write. Answering one simple question means digging through all of it. So wells sit idle, and leaks go unreported, for weeks."
- src: compositions/frames/02-problem.html

Counters arrive with their numbers (count-ups in mono): 40,000 INSPECTIONS, 5,700 REPAIRS, 1,500 REPORTS, plus MANUALS · SOPs · FIELD NOTES. Each spawns a cloud of tiny record cards (mono IDs like INS-0164-0205, MNT-0172-028, CTX-0101-003, REG-0001-002) that crowd the frame from all sides. A typed question appears in the middle, "Which wells in my area were down the longest this summer, and why?", and is visibly swallowed by the clutter. Closing beat: two amber counters tick: WELLS IDLE and LEAKS UNREPORTED, with the subtitle "for weeks".

Motion rules for this scene: depth-scatter-assemble, waterfall-entry, counting-dynamic-scale. Evidence-thread signature move uses svg-path-draw.

## Frame 4 — Product intro

- scene: The clutter collapses into one point; the Asset Intelligence Copilot wordmark assembles; the tagline types beneath
- duration: 9s
- poster: 6s
- transition_in: cut
- status: outline
- blueprint: logo-assemble-lockup
- rules: center-outward-expansion, spring-pop-entrance, svg-path-draw
- vo_file: assets/vo/03-intro.wav
- voiceover: "This is Asset Intelligence Copilot. Ask your oil field anything, in plain English, and get the answer, with the evidence attached."
- src: compositions/frames/03-intro.html

The record cards from Frame 2 are pulled into a single accent point (continuity), which blooms into the wordmark "Asset Intelligence Copilot" (Montserrat 900, the word Copilot in accent). Tagline line 1, "Ask your oil field anything.", then line 2, "Get the answer — with the evidence.", where the word evidence is underlined by an evidence thread that ends on a chip. A small mono kicker: FLYTBASE AHC · HACKTOBERFEST 2026.

Motion rules for this scene: center-outward-expansion, spring-pop-entrance, svg-path-draw. Evidence-thread signature move uses svg-path-draw.

## Frame 5 — Demo: ask a question

- scene: Real app UI floats in; the question types into the composer; the status card answer appears; camera zooms to the +3.2 °C reading, the stale status, the shut-in note and the citations, each tied by an evidence thread
- duration: 25s
- poster: 16s
- transition_in: crossfade
- status: outline
- blueprint: prompt-type-submit-generate
- rules: context-sensitive-cursor, cursor-click-ripple, coordinate-target-zoom, svg-path-draw
- vo_file: assets/vo/04-ask.wav
- voiceover: "Is WELL-0001 producing oil right now? No. The latest drone inspection shows the wellhead just three point two degrees above the air, below the fifteen-degree limit in the T200 manual. The system of record still says active, which is stale. And a field note explains why: a planned shut-in for a rod string replacement. Every claim links to its source."
- src: compositions/frames/04-ask.html

Uses the real captures: assets/ui/01-empty.png → 02-typed-status.png → 03-answer-status.png (+ element crop 03-answer-status-card.png, 04-source-drawer.png). Sequence: the UI frame slides up with a slight 3D tilt settling to flat. A custom cursor clicks the composer. The question types (rebuild the typing over the captured composer with a mono caret, or cross-dissolve between the captured typed/answered states). On send there's a short status-theater pulse ("Planning · Calling status tool · Citing sources"), then the answer card. Camera push-ins with callouts and evidence threads, in order: (1) +3.2 °C vs T200 min +15 °C → NOT PRODUCING; (2) Recorded status "active" crossed out as STALE; (3) note CTX-0001-003 · Jake Morales · planned shut-in; (4) citation chips INS-0001-0203 · OM-T200 · CTX-0001-003 fly out and line up. End on the source drawer opening (04-source-drawer.png).

Motion rules for this scene: context-sensitive-cursor, cursor-click-ripple, coordinate-target-zoom, svg-path-draw. Evidence-thread signature move uses svg-path-draw.

## Frame 6 — Demo: the right visual, generated

- scene: Three answer visuals cycle in a floating-window showcase (line chart, bar chart, map/heatmap), each labelled with the question that produced it
- duration: 14.5s
- poster: 8s
- transition_in: cut
- status: outline
- blueprint: device-surface-showcase
- rules: orbit-3d-entry, split-tilt-cards, card-morph-anchor
- vo_file: assets/vo/05-visuals.wav
- voiceover: "Ask for a trend, and you get a line chart. Compare wells, a bar chart. Spills across the field, a map or a heatmap. The visual is chosen for the question, or the one you ask for."
- src: compositions/frames/05-visuals.html

Uses assets/ui/05-line-chart-card.png, 06-bar-chart-card.png, 07-map-card.png, 08-heatmap-card.png (element crops of the answer visual), with fallbacks ../asset-intelligence-copilot/docs/screenshots/desktop-chart.png and built-cost-chart.png. Each card enters on a 3D carousel or stacked floating windows with a mono question label above it: "WELL-0001 · temperature vs air · last 13 weeks", "Northeast Block 7 · most downtime · 4 months", "Northeast Block 8 · real spills · 90 days", "2026 spills · area × month". The last beat fans all four out together into a 2×2 grid under the headline "Generated for the question."

Motion rules for this scene: orbit-3d-entry, split-tilt-cards, card-morph-anchor. Evidence-thread signature move uses svg-path-draw.

## Frame 7 — Demo: memory, corrections, conflicts

- scene: Michael's correction 4.5 → 5.4 bbl lands as a provenance card, ripples into REPORTABLE + SR-01 breach flags; the user switches to Laura (HSE), whose answer already shows WELL-0151 overdue; a conflict card shows two notes disagreeing
- duration: 25.5s
- poster: 14s
- transition_in: crossfade
- status: outline
- blueprint: cursor-ui-demo
- rules: cursor-click-ripple, particle-burst
- vo_file: assets/vo/06-memory.wav
- voiceover: "And it learns from the people in the field. Michael corrects an AI spill estimate: four point five barrels was actually five point four. The copilot keeps the original, records who changed it and why, and immediately flags that the spill is now reportable, with no notice on file. When Laura from safety asks later, she sees it too. And if two people disagree, it says so instead of picking a side."
- src: compositions/frames/06-memory.html

Uses assets/ui/09-typed-correction.png, 10-correction-card.png (element crop), 11-laura-answer.png / 11-laura-answer-card.png, 12-conflict-card.png. Beats: a user badge "Michael Turner · Production supervisor"; the typed correction; the correction card with a big mono 4.5 → 5.4 bbl morph (4.5 struck through and kept), author and reason chips; the ripple, where a shockwave ring emits three amber flags: REPORTABLE (≥ 5 bbl) · SR-01 NOTICE MISSING · SR-03 VERIFY BY 23 NOV; then the user-picker switch animation to "Laura Simmons · HSE officer" and her answer card with WELL-0151 highlighted as overdue; then the conflict card (WELL-0101: Ryan Brooks "produced water" vs Chris Dalton "confirmed crude") with both chips visible and a label "Shows the disagreement. Doesn't pick a side."

Motion rules for this scene: cursor-click-ripple, particle-burst. Evidence-thread signature move uses svg-path-draw.

## Frame 8 — The whole system: architecture

- scene: A full architecture map assembles layer by layer: users → React chat UI → local API → planner + validator → tool router (domain tools, query-records aggregator, grounded retrieval) → evidence index + memory → answer with visual, citations and conflicts; a fallback path is shown
- duration: 38.7s
- poster: 24s
- transition_in: crossfade
- status: outline
- blueprint: constellation-hub
- rules: svg-path-draw, waterfall-entry, multi-phase-camera
- vo_file: assets/vo/065-architecture.wav
- voiceover: "Here is the whole system. A React chat app talks to a local API. At startup, every inspection, repair, report, manual and note is loaded and indexed, forty-seven thousand pieces of evidence. For each question, a Gemini planner picks one typed operation, and a validator checks it. Then the work goes to deterministic tools, a records aggregator, or grounded document retrieval. A memory layer keeps shared corrections and private conversations apart. Every answer returns with its visual, its sources, and any conflicts."
- src: compositions/frames/065-architecture.html

One clean, legible system map (a judge must be able to pause on the final frame and understand the whole architecture). Build it progressively, then pull back to the full map for the final ~5s. Layout, left to right with data underneath:
- LEFT · USERS: a user-picker stack of 3 avatars with names (Michael Turner · Laura Simmons · Jake Morales).
- UI · "React chat app": chips for chat, inline visuals (status · table · line · bar · map · heatmap), source drawer, user picker.
- API · "Local Express API": chips /api/chat · /api/evidence · /api/memory · /api/dataset/load, and "one request at a time (serialized)".
- CORE (centre, the largest box): PLANNER "Gemini 3.5 Flash-Lite · JSON schema · picks 1 of 17 typed operations" → VALIDATOR "well IDs · dates · explicit write intent" → ROUTER with three lanes: (1) DOMAIN TOOLS: status · downtime · spills · heatmap · compliance · containment · RCA · costs; (2) RECORDS AGGREGATOR: "filter · group · count · sum"; (3) DOCUMENT Q&A: "lexical retrieval → Gemini synthesis with per-sentence source IDs; numbers & IDs checked".
- BOTTOM · EVIDENCE INDEX: "loaded at startup · 47,177 evidence records", with source-type chips: inspections · repairs · repair reports · regulator events · notes · manuals (T200, T350) · SOPs. A small label: "rules (thresholds, deadlines) read from the manuals & SOPs".
- RIGHT-BOTTOM · MEMORY "state.json · atomic saves", split in two: SHARED (corrections keep the original + author + reason · notes · unconfirmed claims · well-type rules) and PRIVATE (per-user conversation history; the planner sees only that user's last 5).
- RIGHT · ANSWER: a card with text · visual · citations · conflicts.
- Dashed amber-free accent bypass from the Question straight to the ROUTER, labelled "deterministic planner if the model is unavailable".
Use evidence-thread data flow: a pulse travels the path Question → Planner → Validator → Tools ↔ Evidence/Memory → Answer as the VO describes it. Box headings use Montserrat 700 at 28-32px; chips use IBM Plex Mono at 20-22px. Nothing below 20px. Keep everything above y=930.

Motion rules for this scene: svg-path-draw, waterfall-entry, multi-phase-camera. Evidence-thread signature move uses svg-path-draw.

## Frame 9 — How it works: the model plans, code calculates

- scene: Architecture pipeline draws left→right: Question → Gemini planner → validated typed plan → deterministic tools (manuals & SOP rules) → answer + visual + citations; a fallback path lights when the model is cut
- duration: 16s
- poster: 10s
- transition_in: cut
- status: outline
- blueprint: spatial-pan-stations
- rules: multi-phase-camera, svg-path-draw, counting-dynamic-scale
- vo_file: assets/vo/07-how.wav
- voiceover: "Under the hood, the language model only plans. Deterministic tools do every calculation, against the rules in your manuals and SOPs. So the numbers come from your data, not from guesswork. And if the model goes down, the copilot keeps answering."
- src: compositions/frames/07-how.html

Stations on one wide canvas, with a camera pan across them: QUESTION (plain English) → PLANNER (Gemini · picks 1 of 17 typed operations, JSON schema) → VALIDATOR (well IDs, dates, write intent) → TOOLS (status · downtime · spills · compliance · costs · RCA … each a mono chip; ruled by OM-T200 / OM-T350 / SOP-SR / SOP-RC documents) → ANSWER (text · visual · citations · conflicts). The planner node then gets a red "×" (model unavailable) and a dashed amber bypass "deterministic planner" lights, so the answer still arrives. Proof strip at the bottom, with count-ups: 18/18 sample scenarios · 25/25 acceptance checks · 109/109 domain stress checks · 0 numbers computed by the LLM.

Motion rules for this scene: multi-phase-camera, svg-path-draw, counting-dynamic-scale. Evidence-thread signature move uses svg-path-draw.

## Frame 10 — Close

- scene: Wordmark lockup returns; tagline "Every answer, with its evidence."; repo URL and name
- duration: 6s
- poster: 4s
- transition_in: crossfade
- status: outline
- blueprint: titlecard-reveal
- rules: ambient-glow-bloom, svg-path-draw, spring-pop-entrance
- vo_file: assets/vo/08-close.wav
- voiceover: "Asset Intelligence Copilot. Every answer, with its evidence."
- src: compositions/frames/08-close.html

The evidence threads from all earlier chips converge into the wordmark (motif payoff). Tagline: "Every answer, with its evidence." Footer mono lines: github.com/GODOSTROYER/flytbase-asset-intelligence-copilot · Arnav Bule · FlytBase AHC SWE Hackathon 2026. Hold for 2s still.

Motion rules for this scene: ambient-glow-bloom, svg-path-draw, spring-pop-entrance. Evidence-thread signature move uses svg-path-draw.

