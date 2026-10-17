# Asset Intelligence Copilot interface

Reference: `concept.png`, 1505 × 1045 pixels.

The design uses a navy navigation rail, a white conversation canvas, a restrained blue accent, and a narrow evidence rail. Content stays in readable document and table layouts. The reference conversation is visual guidance only; the application starts with an empty conversation unless the selected user has saved private history.

## Design system

- Background: white `#ffffff`; navigation: navy `#102642`.
- Primary text: `#182943`; secondary text: `#748198`.
- Action blue: `#2468ed`; inspection chart series: blue and teal.
- System sans typography with deliberate control sizing. Answer text uses 14 px and generous line height; source text and data tables use 12 px minimum on desktop.
- Borders: subtle cool gray; 7–11 px corners on controls and data panels.
- SVG line icons use a consistent stroke and inherit text color.
- The desktop shell has navigation, conversation and evidence columns. Evidence collapses below 950 px; every citation remains reachable inside its answer. Mobile provides sources, new conversation and dataset actions in the header.

## Workflow behavior

- Bootstrap populates actual users, counts, dataset reference date and provider status.
- Private history loads for the selected user and is labeled when restored. New chat clears the visible conversation while retaining private recall. A history action restores saved messages.
- User switches and new conversations invalidate pending request results immediately. A response from an earlier user or conversation cannot append into the active conversation.
- The pending answer state shows the actual waiting state and elapsed time. It does not invent tool execution stages.
- Answer data supports status, tables, line charts, bar charts, coordinate plots and heatmaps.
- Temperature charts mark non-producing wellhead readings in amber and list their dates in accessible text beneath the chart.
- Multiple wells render separate status records and separate named temperature series, aligned by actual inspection date. Ambient lines use dashes in comparisons across wells.
- Shared corrections show original, previous effective and corrected values with author and reason. Rules, claims and field notes use dedicated record summaries instead of temperature metrics.
- Status colors distinguish producing, not producing and unknown. The status card describes the latest inspection; it does not imply live telemetry.
- Coordinate plots use the recorded latitude and longitude, labeled axes and a record list. They contain no invented roads or terrain.
- All answer citations open full original source content through the evidence endpoint. A failed lookup reports the actual error and labels any available citation excerpt.
- Memory presents shared facts, attributed corrections, unconfirmed claims, type rules and the selected user's private history. The note action returns to the chat composer.
- Dataset import accepts a folder path and optional reference date, displays loading/errors, and refreshes users and counts after success.
- Drawers and import dialogs support Escape, keyboard focus containment and focus restoration. Reduced motion settings are respected.

## Intentional extensions from the reference

The reference is an answered desktop conversation. Empty state, private history controls, import dialog, source record lookup, memory drawer, error states and responsive navigation are required application states implemented using the same palette, typography and component treatment. Example prompts are offered as actions and never seeded as answered conversations. Tables and coordinate plots render actual server results.

## Verification ledger

The concept was inspected with `view_image`. Full application TypeScript and frontend production compilation via `npm run build` succeeded. The chart module is loaded on demand, leaving the empty-state bundle separate from Recharts.

The parent captured `docs/screenshots/desktop-empty.png` through the browser at the reference's native 1505 × 1045 viewport. Both that screenshot and `design/concept.png` were inspected using `view_image` in the same comparison pass.

| Comparison point | Reference and render evidence | Outcome |
| --- | --- | --- |
| Layout | Reference has navy left navigation, white conversation center, and a right evidence rail. Render preserves all three surfaces without clipping. | Direction preserved. Render uses a 248 px navigation rail and 310 px evidence rail; the reference is approximately 286 px and 348 px. This leaves more room for actual answer data. |
| Palette | Reference has an un-tinted white primary canvas and restrained navy/blue controls. Render has white main/background panels, navy navigation, and blue active navigation. | White retained; no invented gradients or image overlays. Navy is a slightly lighter shade than the reference. |
| Primary copy | Both use “Chat with your field data” and the selected “Michael Turner” control. Render adds the required source/date/history workflow labels. | Core copy preserved. Additional visible copy is an intentional functional extension. |
| Typography | Reference heading is approximately 34 px and has spacious navigation labels. Render uses a 24 px heading and 14 px navigation. Body and controls were increased from the inherited 8–10 px sizes. | Deliberately denser than the concept. The screenshot retains clear heading, body, control and metadata hierarchy. |
| Content state | Reference contains an answered status question and chart. Render is an empty conversation with actionable example prompts and no seeded answer. | Required empty state verified. Answered-state comparison is a separate pending browser pass. |
| Source treatment | Reference right rail lists answer source records and shared knowledge. Render has the same rail with an honest empty source state and shared knowledge/private memory controls. | Required source workflow represented without fabricated citations. |
| Component treatment | Both use thin cool-gray borders, restrained corner radii and stroke icons. Render uses these for prompts and composer. | Consistent component family; smaller icon scale follows denser navigation. |
| Composer and history | The reference does not show these controls in its captured region. Render keeps the composer at the bottom and provides private history and new chat actions. | Intentional required extension, visible without obscuring the empty state. |

Above-the-fold copy comparison: the reference header and user label are retained. The welcome headline, explanatory text, example prompts, counts, source empty state, history controls, dataset loader and provider configuration indicator are intentional required workflow additions. The reference's answer text, readings, chart and example source IDs are never inserted as fake runtime output.

The desktop empty state is verified against the reference's visual direction. It is not an exact reproduction or a claim of 10/10 fidelity.

### Real answered state and mobile comparison

The parent captured `docs/screenshots/desktop-status.png` at 1505 × 1045 and `docs/screenshots/mobile-status.png` at 390 × 844. Both status captures and the original concept were inspected using `view_image` in the same pass.

- Desktop has the required five inspection metrics in one row: wellhead 25.6 °C, air 22.4 °C, difference +3.2 °C, threshold 15 °C, and inspection date Oct 15, 2026. Values come from the actual source; the concept's 22.9/19.7 values are illustrative and intentionally not copied into the application.
- The well is correctly labeled “Not producing” with amber status and downward trend treatment. Planned shutdown context and the stale stored “active” status remain visible.
- The reference's left/right rails, white canvas, blue question bubble, metric layout and source treatment carry through. The implementation adds actual source IDs, assembly trace, provider/model attribution and response timing.
- The reference composes status plus a temperature chart in one illustrative answer. The captured real Q1 response returns only its actual requested status visualization. The chart is shown when the real answer includes chart data.
- Mobile keeps the question and answer inside one scrollable conversation column. The status title wraps cleanly, status indicator remains visible, metrics continue below the fold, and there is no horizontal clipping in the supplied capture.
- Mobile replaces the wide rails with source/new-chat/load-data actions and inline answer citations. The composer and private history actions remain visible beneath the scrolling answer.
- JSON source records are pretty-printed for readable evidence inspection. Original field values are retained; Markdown and other plain text remain unchanged.

Parent live Q1 evidence: hosted answer completed in 2,584 ms and linked the original inspection plus operating manual and operator notes. This is observed local application behavior for that request, not a latency guarantee.

The parent browser checked the real Q3 temperature chart: 13 readings, blue wellhead and teal ambient series, and amber non-producing points plus text dates for Oct 8 and Oct 15. `docs/screenshots/desktop-chart.png` was inspected with `view_image`; its observed readings and axes follow actual server data rather than the concept's illustrative curve.

The parent also checked the full JSON evidence drawer in the browser and switched to Jessica, observing an empty private history. Import failure paths were checked through the isolated API, not through browser form submission. These are separate pieces of verification evidence.

Bar charts accept typed metadata for the measure label, unit and currency. Cost bars show USD values, and each bar result includes an expandable accessible data table. Compatible non-cost bars retain their actual repair, day, spill-volume or temperature units. Status coordinate plots display state rather than absent spill-volume placeholders.

The latest `npm run build` passed after these metadata changes. The final built application was served at `http://127.0.0.1:4178`. A fresh hosted repair-cost question completed in 2,072 ms and rendered USD 5,176 / 25,794 / 46,942 in both the bar chart and its accessible data table. The parent inspected `docs/screenshots/built-cost-chart.png` at 1505 × 1045: all three bars, currency units, exact values, citations and composer are visible without horizontal clipping. The browser viewport override was reset after capture.
