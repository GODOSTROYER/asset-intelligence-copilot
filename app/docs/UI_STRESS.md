# UI stress review

Date: 2026-10-17. Scope: frontend source and UI documentation. No real chat, provider requests, cloud calls, commits, engine changes or API changes were performed by this UI pass.

## Changes

### Large results

- Tables and heatmaps start with 25 rows per page. Every row remains available through page controls and page-size selection. Counts state the displayed range and total.
- Tables have bounded, keyboard-focusable scrolling regions, sticky column headers, wrapping long cell content and accessible captions.
- Bar charts start with 10 items per page. Their numeric scale uses the entire result, so changing a page does not distort comparisons. Taller page sizes scroll instead of compressing hundreds of bars into one plot. Currency and measure metadata remain correct, and the exact values for each page are available in a semantic table.
- Temperature charts with more than four wells offer an explicit well selector. This avoids hundreds of overlapping series while retaining access to every well. The chart also includes a paginated inspection-readings table.
- Maps still plot every valid coordinate. For more than 20 points, overlapping point labels are replaced by an explicit explanation and a searchable, paginated record list. The list has its own bounded keyboard scrolling region. Its filter is labeled as a record-list filter; it does not imply that the coordinate plot is filtered.
- Multiple status records are paginated. Empty status, table, line, bar, map and heatmap results have explicit messages.

### Evidence and memory

- Large source lists support filtering by ID, title, type or path and page navigation. Inline citations retain the first four quick source links; every remaining source is reachable through the expanded collection.
- Source text retains JSON formatting and has a keyboard-focusable scrolling region. Formatting is memoized to avoid parsing large source content on every composer update.
- Memory groups initially show the latest 12 entries and provide a visible “Show all” control with the true total. Older entries are no longer silently hidden.

### Long conversations and request states

- Completed answer cards are memoized. Composer edits and elapsed-time updates do not rerender unchanged chart and table answers.
- New answers open at their beginning rather than forcing the conversation to the bottom of a long result. Reading earlier content is respected, with a “Jump to latest answer” control when needed.
- A failed request preserves both its original question and any draft typed while waiting. An explicit edit action restores the failed question; it does not automatically send another request.
- Existing user and conversation request epochs remain in place. User switches and new chats invalidate late responses immediately. Private history loads remain scoped to the selected user.
- Browser storage failures do not prevent selecting an operator or connecting to the service.
- Modal backgrounds are inert. Focus remains contained even when all import controls are disabled during loading. Short viewport dialogs scroll within the viewport.
- Long source titles, paths, trace tool names, conflicts and unbroken user text wrap within their intended surfaces. Narrow-screen map coordinates continue beneath their record name.

## Executed local evidence

`npm run build` passed: TypeScript and Vite production output, exit code 0. The chart code remains in a separate lazy chunk.

Twelve deterministic frontend render checks passed using Node with the installed `tsx` loader, React and `react-dom/server.renderToStaticMarkup`. These checks imported `src/VisualBlock.tsx` directly and performed no fetches or model calls.

| Check | Observed result |
| --- | --- |
| 200-row table | 25 body rows plus header; next-page control; row 26 absent from the first page |
| Empty table | Explicit no-rows message |
| Long hostile cell text | Script-like text escaped; unbroken 8,000-character content retained |
| 200 USD bar values | 10 exact-value table rows; USD/repair-cost labels; no incorrect downtime label |
| Empty bar | Explicit no-values message |
| 200 map points | All 200 points retained, 25 list records shown, overlap explanation and paging present |
| Empty map | Explicit no-coordinate message; no NaN or Infinity output |
| 200-well temperature result | All 200 well options retained; the selected well's two real readings and non-producing date available |
| Empty line chart | Explicit no-readings message |
| 200-area heatmap | 25 body rows plus header and page navigation; color scale uses the full result |
| Empty heatmap | Explicit no-areas message |
| 200 status records | 10 records initially shown; not-producing state remains amber and never matches producing styling |

The generated HTML ranged from 111 characters for an empty line result to 79,656 characters for the complete 200-point coordinate plot. These are deterministic render checks, not browser interaction or rendering-time benchmarks. ResponsiveContainer's measured chart SVG is exercised by browser QA, not server rendering.

Source review covered request-epoch guards, preservation of a newly typed draft after failure, modal focus containment and memory disclosure. Those findings are implementation evidence, not newly executed cloud or browser interaction tests.

## Browser follow-up and limits

- Root-observed browser checks after the latest build: filtering 23 answer citations for `MNT0138035` reduced the source list to one matching record. Opening it displayed the correct original JSON; closing the drawer restored focus.
- Initial fleet-question failure: the provider returned an incorrect downtime query plan. Root identified this as a provider/planning issue, not evidence that the requested fleet answer was correct. That wrong answer contained 836 citations. Root subsequently clicked the source next-page control and observed sources 26–50 of 836, with Previous enabled. This verifies source pagination independently of that initial answer's incorrect intent.
- Final fleet-table browser pass after the provider fix: the exact question “List all non-producing wells across the entire fleet as a table.” returned 15 current non-producing wells through the hosted provider. Selecting 10 rows per page showed 1–10 of 15; clicking Next showed 11–15 of 15, containing WELL-0128, WELL-0164, WELL-0170, WELL-0172 and WELL-0175. The initial planning failure is retained above as historical evidence; this final request passed.
- These source-filter, source-opening and focus observations came from root's actual browser pass. They are separate from the deterministic server-render checks above.
- Parent agent owns the final desktop/mobile browser pass and should click pagination, change page size, filter citations/maps, select a well, open a source, use keyboard modal navigation, and confirm the reading position after a long answer.
- Prior browser evidence documented in `design/IMPLEMENTATION.md` covers the real status response, 13-reading chart, full evidence drawer and switching to Jessica's empty private history. It predates this stress pass and is not represented as fresh verification of these changes.
- Maps are coordinate plots rather than geographic basemaps. Dense points may overlap at identical or nearby coordinates; their exact records remain in the list.
- Above four wells, temperature comparison is inspected one well at a time. The selector makes that restriction visible.
- Large histories still retain their answer components in the DOM. Memoization avoids unnecessary updates; this pass does not claim full history virtualization or a measured frame-rate guarantee.
- Starting a new chat or switching users invalidates browser display of a pending response. A server request already in progress may still finish and save to its originating user's private history; it is not displayed in the new user's conversation.
