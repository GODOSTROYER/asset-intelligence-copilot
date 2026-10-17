# Own-voice recording script

Target: **3:30–3:55**, below the five-minute limit. Read naturally in the entrant's own voice. This is a script, not a recorded deliverable. Record the actual UI run; leave the real wait visible. Adapt statements to the result on screen and acknowledge a provider fallback if it occurs.

**0:00–0:30 · The problem and design**

“An operator's question crosses inspections, repair reports, manuals and people's notes. I built Asset Intelligence Copilot so they can ask once and inspect the evidence behind the answer. My main design decision was to keep calculations in typed tools. Gemini interprets the question and chooses an operation. The local engine calculates the answer, applies the rules, and returns the citations and visual together.”

**0:30–1:10 · One real question, end to end**

“Here is a real run on the supplied sample data. The reference date is October sixteenth, twenty twenty-six. I'll ask: Is WELL-0001 producing right now, and why?”

[Type the question, submit it, and wait for the actual response.]

“The status card says it is not producing. The latest inspection puts its wellhead only three point two degrees above the air, below the fifteen-degree threshold in the T200 manual. The old active label is stale. The shared field note explains a planned rod-string replacement. Those are distinct pieces of evidence: the reading establishes status, and the note explains the reported cause.”

**1:10–1:40 · Show the source, not just the answer**

[Open the inspection citation, then the manual or shared-note citation.]

“This drawer opens the source record and its file path. The model does not write these citation links from memory. Domain tools select them from the data. For general document questions, I retrieve bounded passages and validate the source IDs attached to each generated segment. That catches unsupported identifiers and numbers; it does not guarantee the meaning of every sentence.”

**1:40–2:15 · Numbers across the fleet**

[Submit: Which three wells in Northeast Block 7 had the most downtime in the last four months?]

“This combines the type-specific temperature rule with weekly inspections across an area. Each non-producing inspection adds seven days. A missed inspection adds none, and repair duration is a different measure. The result is a bar chart with exact values and the underlying sources. The expected sample leaders are forty-nine, forty-two and forty-two days.”

**2:15–3:00 · Show the two memory levels**

[As Michael Turner, start a new chat and submit: For the three wells we discussed yesterday, what have repairs cost this year? Then switch to Jessica Reed and ask the same question.]

“The first answer resolves the wells from Michael's own history and sums their repair costs. Starting a new chat retains that private memory. Jessica should receive a clarification because Michael's conversation is not hers. Shared knowledge is separate: explicit corrections and field notes are visible across users. A correction preserves the original, author, reason and scope; conflicting claims stay visible instead of silently replacing inspections.”

**3:00–3:40 · New data, model use and honest limits**

[Show Memory & feedback, then the dataset import dialog without importing an unverified folder.]

“The app reads a same-format dataset folder and merges records by ID with source provenance. It also keeps the evaluation date explicit. Gemini FlashLite handles planning; an optional deeper model handles selected document questions. Bounded context, cached plans and request caps reduce calls. Exact billed cost is not measured. The current evidence is from sample data and targeted retests. Final questions still need to be run on the released event dataset. Next I would strengthen semantic retrieval, validate unfamiliar manuals and add authenticated identity for production.”

**Closing, if time permits**

“The useful outcome is an answer whose numbers, sources and corrections can be checked in the same conversation.”
