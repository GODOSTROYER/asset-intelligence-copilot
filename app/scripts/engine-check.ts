import {loadDataset} from '../server/data';
import {emptyState,answerQuestion,inferPlan} from '../server/engine';
import assert from 'node:assert/strict';
const d=await loadDataset([process.env.SAMPLE_DATA_PATH||'../../sample-data'],'2026-10-16'),s=emptyState(),u='U-201';
const queries=[
 'Is WELL-0001 producing oil right now? When was it last inspected, and by whom? Show me its status card.',
 'Which wells in Northeast Block 8 are not producing oil right now?',
 "Show a line chart of WELL-0001's wellhead temperature against air temperature for the last 13 weeks, and mark when it was not producing oil.",
 'How many oil spills has WELL-0001 had in the last 4 years, and how much oil in total? List them in a table.',
 'How many days was WELL-0001 down in 2025?',
 'Which 3 wells in Northeast Block 7 had the most downtime in the last 4 months? Show a bar chart.',
 'Show on a map every well in Northeast Block 8 with a real spill in the last 90 days.',
 'Show a heatmap of 2026 spills by geographic area and month.',
 'Which rules has WELL-0001 broken in the last 12 months, and what is still open?',
 'In Southwest Block 24, which spills in the last 90 days were not contained within the SOP time limit?',
 'The 15 Oct reading for WELL-0164 is wrong. The handheld thermal gun used in that inspection was faulty; the field crew re-measured the wellhead at 41.0 °C.',
 'The AI estimated the 24 Sep spill at WELL-0151 as 4.5 bbl. The field crew measured 5.4 bbl.',
 'Which wells in Northeast Block 7 need a root-cause analysis on their pump jack?',
 'Note for all T350 wells: our team now wants a pump jack root-cause analysis after 2 repairs, not 3.',
 'Which wells in Northeast Block 7 need a root-cause analysis on their pump jack?',
 'FYI for everyone: WELL-0007 will be shut in from 17 Oct for a 10-day planned workover.',
 'Is any downtime planned for WELL-0007?',
 'WELL-0175 has been shut in for planned work since 14 Oct.',
 'WELL-0175 is running fine.',
 'Was the 20 Aug spill at WELL-0101 real oil?'
];
const outcomes=queries.map((q,index)=>{const before=JSON.stringify([s.corrections,s.claims,s.sharedFacts,s.typeRules]);const p=inferPlan(d,s,u,q),a=answerQuestion(d,s,u,q);if(q.endsWith('?'))assert.equal(JSON.stringify([s.corrections,s.claims,s.sharedFacts,s.typeRules]),before);console.log('PASS fallback '+(index+1)+': '+p.operation);return a;});
assert.equal(outcomes[1].visualization?.rows?.length,4);
assert.equal(outcomes[2].visualization?.data?.length,13);
assert.equal(outcomes[3].visualization?.rows?.length,6);
assert.match(outcomes[3].answer,/15[.]1 bbl/);
assert.match(outcomes[4].answer,/21 days/);
assert.match(outcomes[4].answer,/8[.]5 °C/);
assert.deepEqual(outcomes[5].visualization?.data?.map(x=>x.value),[49,42,42]);
assert.equal(outcomes[6].visualization?.data?.length,4);
assert.deepEqual(outcomes[7].visualization?.rows?.map(r=>r.at(-1)),[35,43,37,26]);
assert.match(outcomes[8].answer,/^4 breached/);
assert.equal(outcomes[9].visualization?.rows?.length,2);
assert.equal(s.corrections[0].originalValue,24);
assert.equal(s.corrections[0].correctedValue,41);
assert.match(outcomes[11].answer,/reportable/);
assert.match(outcomes[11].answer,/Nov 23, 2026/);
assert.equal(outcomes[12].referencedWellIds.length,3);
assert.equal(outcomes[14].referencedWellIds.length,4);
assert.match(outcomes[16].answer,/10 days/);
assert.ok(outcomes[18].conflicts.length);
assert.ok(outcomes[19].conflicts.length);
assert.ok(outcomes[19].citations.some(c=>c.id==='CTX-0101-002'));
assert.ok(outcomes[19].citations.some(c=>c.id==='CTX-0101-003'));
s.history[u]=[{userText:queries[5],answer:outcomes[5].answer,wellIds:outcomes[5].referencedWellIds,createdAt:'2026-10-16T12:00:00Z'}];
const costs=answerQuestion(d,s,u,'For the three wells we discussed yesterday, what have repairs cost this year?');
assert.match(costs.answer,/25,794/);assert.match(costs.answer,/46,942/);assert.match(costs.answer,/5,176/);
assert.equal(answerQuestion(d,s,'U-202','For the three wells we discussed yesterday, what have repairs cost this year?').referencedWellIds.length,0);
assert.equal(inferPlan(d,s,u,'Correct WELL-0164 wellhead to 42 °C from 24 °C.').value,42);
assert.equal(inferPlan(d,s,u,'The WELL-0151 spill volume was wrong: actual 5.4 bbl, not 4.5 bbl.').value,5.4);
console.log('Fallback checks: 20 scenarios plus private reference isolation and reversed correction wording passed.');
