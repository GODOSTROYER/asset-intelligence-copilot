# Part 2 narration (first person, ~140 wpm, timed to part2-scenario.mp4)

Read in your own voice. Times are video time; each block fits its window at about 140 words per minute (about 400 words total).

**[00:00-00:17]** (~40 words)
This is the real app running on the test dataset: six hundred wells, over a hundred and twenty-five thousand inspections. I'm Michael Turner, a production supervisor, and I start my morning with a plain-English question about Northwest Block 12: which wells are not producing oil, and why.

**[00:17-00:52]** (~80 words)
A hosted Gemini model only plans the question. It picks one typed operation, here area status, and the server validates that plan. A deterministic tool then does the work: it applies each well type's rule from its manual to the latest inspection, and joins repairs and field notes. Twelve wells come back, in a table with the reason for each. Notice the stored status still says active on most of them. The evidence says otherwise, and nothing in this table was written by the model.

**[00:52-01:01]** (~21 words)
I'll pick WELL-0309, a pump-stuck well at the top of the list, and ask whether it's producing and who inspected it last.

**[01:01-01:09]** (~25 words)
Not producing. Inspected January fourteenth by Caleb Whitaker: wellhead thirteen point one against air ten point six, only two and a half degrees above ambient.

**[01:09-01:17]** (~22 words)
The T200 manual needs fifteen. Every claim carries a citation, so I open the first one and see the raw inspection record itself.

**[01:17-01:29]** (~28 words)
Next I ask for a chart: wellhead against air temperature for thirteen weeks, with the non-producing readings marked. I type it exactly as I'd say it to a colleague.

**[01:29-01:49]** (~46 words)
Same pattern. The planner chooses a temperature-history operation, and the tool returns the exact readings. The well ran twenty to thirty degrees above ambient for weeks, then dropped to two and a half on January fourteenth. That single orange marker is the only non-producing reading, and each point links back to its inspection.

**[01:49-02:00]** (~26 words)
Now a hand-off. I tell the system that WELL-0309 will be shut in from the sixteenth of January for a five-day planned workover.

**[02:00-02:11]** (~26 words)
That isn't a question, so it's saved as shared field knowledge, with me as the author and the date attached. Now I switch users to Robert Hayes.

**[02:11-02:32]** (~48 words)
Robert is the maintenance lead and has never seen my conversation. He asks whether any downtime is planned for WELL-0309. The answer is yes: the workover from January sixteenth, five days, according to Michael Turner. My note reached him through shared memory, attributed to me, with a citation.

**[02:32-02:53]** (~54 words)
Opening the memory drawer shows why. Shared well knowledge holds my note and is visible to everyone. Corrections, claims and rules are empty. Below that is Robert's private memory, only his own questions. So the system shares facts, not chat history: planner for understanding, tools for the numbers, citations for trust, shared memory for the team.
