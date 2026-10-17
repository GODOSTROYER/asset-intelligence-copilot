# Part 2 v2 narration - "Who told you that?" (first person, ~140 wpm, timed to part2-scenario-v2.mp4)

Read in your own voice. Times are video time; each block fits its window at about 140 words per minute (about 360 words total).

**[00:00-00:11]** (~23 words)
Part two, live on the test dataset. Robert Hayes, the maintenance lead, asks which recalled pumps are still in the ground right now.

**[00:11-00:31]** (~46 words)
The hosted Gemini model only plans: it picks one typed operation, recalled pumps. A deterministic tool then reads the supplier recall notice and the parts-installed line of every repair report, keeps the latest pump per well, and returns nine wells. Nothing here is written by the model.

**[00:31-00:53]** (~48 words)
Now Nathan Pierce says WELL-0333's pump was swapped yesterday, but there's no work order yet. The planner routes this to a claim operation. It is stored as an unconfirmed claim, attributed to Nathan, with a timestamp. It never overwrites a maintenance record, and WELL-0333 stays on the list.

**[00:53-01:14]** (~48 words)
Next, Olivia Grant asks to take WELL-0577 off the recall list, because Nathan told her it was swapped. That's second-hand, and the system keeps the chain: Olivia, via Nathan. It's recorded as another unconfirmed claim, the well is not removed, and hearsay is never treated as fact.

**[01:14-01:42]** (~44 words)
Back as Robert, I ask the same question again. Same nine wells, because a report alone never removes a well. But now WELL-0333 and WELL-0577 are flagged in the Notes column, with who said what, whether it's confirmed, and that second-hand chain via Nathan.

**[01:42-01:58]** (~33 words)
A conflict box and the answer count it both ways: nine per the records, seven if work orders confirm. I open the citation and see the raw claim itself: author Nathan Pierce, confirmed false.

**[01:58-02:20]** (~46 words)
Laura Simmons, the HSE officer, asks whether every gas report since the first of November got a timely response under our procedures. The planner picks a gas-response operation. The deadline comes from the SOP itself, OPS-1: twenty-four hours, then twelve hours from the first of January.

**[02:20-02:39]** (~40 words)
Twenty-six gas notes: seventeen met, nine missed. Each row shows the report, the first qualifying response, and the hours taken. Drone inspections don't count, and the response must start after the note. Late ones show the exact hours over.

**[02:39-02:58]** (~40 words)
Last, a judgment call: of all the wells we've talked about, which first? Triage ranks safety, then compliance, then production, then equipment. WELL-0332 wins: an unanswered gas report, no H2S reading, and it's not producing. Every line cites its record.
