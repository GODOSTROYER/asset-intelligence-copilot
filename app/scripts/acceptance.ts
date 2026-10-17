import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDataset } from "../server/data";
import { emptyState, executePlan, type Answer, type CopilotState } from "../server/engine";
import type { QueryPlan } from "../server/plan";

const here = path.dirname(fileURLToPath(import.meta.url));
const sampleData = process.env.SAMPLE_DATA_PATH||path.resolve(here, "../../../sample-data");
const referenceDate = "2026-10-16";
const michael = "U-201";
const jake = "U-102";
const jessica = "U-202";
const tyler = "U-204";
const laura = "U-401";

type Check = { name: string; run: () => void };
const checks: Check[] = [];
const check = (name: string, run: () => void) => checks.push({ name, run });

function ask(dataset: Awaited<ReturnType<typeof loadDataset>>, state: CopilotState, userId: string, question: string, plan: QueryPlan): Answer {
  return executePlan(dataset, state, userId, question, plan);
}

function sourceIds(answer: Answer): string[] {
  return answer.citations.map((citation) => citation.id);
}

function expectSources(answer: Answer, expected: string[]) {
  const actual = new Set(sourceIds(answer));
  for (const id of expected) assert.ok(actual.has(id), `missing citation ${id}; got ${[...actual].join(", ")}`);
}

function expectSourceType(answer: Answer, id: string, type: string) {
  assert.ok(answer.citations.some((citation) => citation.id === id && citation.type === type), `expected ${type} evidence for ${id}`);
}

function visualizationJson(answer: Answer): string {
  return JSON.stringify(answer.visualization ?? {});
}

function rows(answer: Answer): unknown[][] {
  return Array.isArray(answer.visualization?.rows) ? answer.visualization.rows : [];
}

function expectWellSet(actual: string[], expected: string[]) {
  assert.deepEqual([...actual].sort(), [...expected].sort());
}

function addApiHistory(state: CopilotState, userId: string, userText: string, answer: Answer) {
  const history = state.history[userId] ?? [];
  history.push({
    userText,
    answer: answer.answer,
    wellIds: [...answer.referencedWellIds],
    createdAt: "2026-10-16T12:00:00.000Z",
  });
  state.history[userId] = history;
}

function includesAll(text: string, expected: string[]) {
  for (const item of expected) assert.ok(text.toLowerCase().includes(item.toLowerCase()), `expected “${item}” in: ${text}`);
}

async function main() {
  const dataset = await loadDataset([sampleData], referenceDate);
  assert.equal(dataset.today, referenceDate, `sample reference date should be pinned to ${referenceDate}`);

  check("Q1: current status uses the T200 threshold, latest inspection, context, and status card", () => {
    const answer = ask(dataset, emptyState(), michael,
      "Is WELL-0001 producing oil right now? When was it last inspected, and by whom? Show me its status card.",
      { operation: "status", wellIds: ["WELL-0001"], visual: "status" });
    includesAll(answer.answer, ["not producing oil", "INS-0001-0203", "3.2", "T200", "Ryan Brooks", "Jake Morales"]);
    assert.equal(answer.visualization?.type, "status");
    expectSources(answer, ["INS-0001-0203", "OM-T200", "CTX-0001-003"]);
  });

  check("Q2: Northeast Block 8 list has exactly the four expected wells and grounded reasons", () => {
    const answer = ask(dataset, emptyState(), michael,
      "Which wells in Northeast Block 8 are not producing oil right now, and why? Show them in a table.",
      { operation: "area_status", areaId: "NE-08", visual: "table" });
    assert.equal(answer.visualization?.type, "table");
    assert.equal(rows(answer).length, 4);
    expectWellSet(answer.referencedWellIds, ["WELL-0164", "WELL-0170", "WELL-0172", "WELL-0175"]);
    const rendered = visualizationJson(answer);
    includesAll(rendered, ["WELL-0164", "WELL-0170", "WELL-0172", "WELL-0175", "No recorded reason"]);
    expectSources(answer, ["INS-0164-0205", "INS-0170-0206", "INS-0172-0206", "INS-0175-0204"]);
  });

  check("Q3: requested temperature chart has the 13-week window and marks both latest non-producing readings", () => {
    const answer = ask(dataset, emptyState(), michael,
      "Show a line chart of WELL-0001's wellhead temperature against air temperature for the last 13 weeks, and mark when it was not producing oil.",
      { operation: "temperature_history", wellIds: ["WELL-0001"], from: "2026-07-23", to: "2026-10-15", weeks: 13, visual: "line" });
    assert.equal(answer.visualization?.type, "line");
    assert.equal(rows(answer).length, 13);
    includesAll(answer.answer, ["not producing", "Oct 8, 2026", "Oct 15, 2026"]);
    const points = answer.visualization?.data ?? [];
    assert.equal(points.length, 13);
    assert.ok(points.every((point: any) => point.assetId === "WELL-0001"), "every plotted reading must be attributed to WELL-0001");
    const stopped = points.filter((point: any) => point.producing === false).map((point: any) => point.date);
    expectWellSet(stopped, ["Oct 8, 2026", "Oct 15, 2026"]);
    expectSources(answer, ["INS-0001-0202", "INS-0001-0203", "OM-T200"]);
  });

  check("Q4: corrected false positive is excluded from the six-spill, 15.1-bbl total", () => {
    const answer = ask(dataset, emptyState(), michael,
      "How many oil spills has WELL-0001 had in the last 4 years, and how much oil in total? List them in a table.",
      { operation: "spills", wellIds: ["WELL-0001"], from: "2022-10-16", to: referenceDate, visual: "table" });
    assert.match(answer.answer, /6\s+real spills/i);
    assert.match(answer.answer, /15\.1\s*bbl/i);
    assert.equal(rows(answer).length, 6);
    const listedVolume = rows(answer).reduce((sum, row) => sum + Number(row[2]), 0);
    assert.equal(Number(listedVolume.toFixed(1)), 15.1);
    expectSources(answer, ["CTX-0001-001", "INS-0001-0201"]);
    // The corrected detection may be cited to explain its exclusion; it must not be counted or listed.
    assert.ok(!visualizationJson(answer).includes("INS-0001-0070"), "a corrected false positive must not appear in spill rows");
  });

  check("Q5: 2025 downtime counts weekly non-producing inspections, not repair hours", () => {
    const answer = ask(dataset, emptyState(), michael,
      "How many days was WELL-0001 down in 2025?",
      { operation: "downtime", wellIds: ["WELL-0001"], from: "2025-01-01", to: "2025-12-31", year: 2025, visual: "none" });
    assert.match(answer.answer, /21\s+days/i);
    expectSources(answer, ["INS-0001-0140", "INS-0001-0152", "INS-0001-0153", "MNT-0001-021", "MNT-0001-023", "OM-T200"]);
    const hotAfternoon = answer.citations.find((citation) => citation.id === "INS-0001-0140");
    assert.ok(hotAfternoon?.excerpt.includes("51.6") && hotAfternoon.excerpt.includes("43.1"), "the 24 Jul calculation must be grounded in the ambient-adjusted reading");
  });

  check("Q6: top downtime ranking honors the date window and excludes the fourth-place well", () => {
    const answer = ask(dataset, emptyState(), michael,
      "Which 3 wells in Northeast Block 7 had the most downtime in the last 4 months? Show a bar chart.",
      { operation: "downtime_ranking", areaId: "NE-07", from: "2026-06-16", to: referenceDate, topK: 3, visual: "bar" });
    assert.equal(answer.visualization?.type, "bar");
    const plot = answer.visualization?.data ?? [];
    assert.equal(plot.length, 3);
    const byWell = new Map(plot.map((item: any) => [item.name, item.value]));
    assert.equal(byWell.get("WELL-0121"), 49);
    assert.equal(byWell.get("WELL-0138"), 42);
    assert.equal(byWell.get("WELL-0107"), 42);
    assert.ok(!answer.referencedWellIds.includes("WELL-0119"), "the fourth-place well must not leak into top three");
    expectSources(answer, ["INS-0121-0200", "INS-0138-0206", "INS-0107-0194", "OM-T200", "OM-T350"]);
  });

  check("Q7: map includes exactly the four real Northeast Block 8 spills in the requested 90-day window", () => {
    const answer = ask(dataset, emptyState(), michael,
      "Show on a map every well in Northeast Block 8 with a real spill in the last 90 days.",
      { operation: "spills", areaId: "NE-08", from: "2026-07-18", to: referenceDate, visual: "map" });
    assert.equal(answer.visualization?.type, "map");
    const pins = answer.visualization?.data ?? [];
    assert.equal(pins.length, 4);
    expectWellSet(pins.map((pin: any) => pin.assetId), ["WELL-0151", "WELL-0165", "WELL-0175", "WELL-0186"]);
    expectSources(answer, ["INS-0151-0201", "INS-0165-0194", "INS-0175-0193", "INS-0186-0097"]);
    const coordinates = new Map(pins.map((pin: any) => [pin.assetId, [pin.lat, pin.lon]]));
    assert.deepEqual(coordinates.get("WELL-0151"), [32.12246, -102.18445]);
    assert.deepEqual(coordinates.get("WELL-0165"), [32.15665, -102.14522]);
    assert.deepEqual(coordinates.get("WELL-0175"), [32.1802, -102.1479]);
    assert.deepEqual(coordinates.get("WELL-0186"), [32.17552, -102.17775]);
  });

  check("Q8: 2026 area-by-month heatmap matches the challenge matrix with corrected detections removed", () => {
    const answer = ask(dataset, emptyState(), michael,
      "Show a heatmap of 2026 spills by geographic area and month.",
      { operation: "heatmap", year: 2026, visual: "heatmap" });
    assert.equal(answer.visualization?.type, "heatmap");
    const expected = [
      ["Southwest Block 23", 4, 3, 3, 6, 3, 4, 4, 3, 3, 2, 35],
      ["Southwest Block 24", 7, 4, 5, 6, 5, 5, 3, 1, 5, 2, 43],
      ["Northeast Block 7", 5, 3, 2, 4, 6, 6, 2, 4, 4, 1, 37],
      ["Northeast Block 8", 4, 4, 4, 3, 2, 4, 4, 0, 1, 0, 26],
    ];
    assert.deepEqual(rows(answer), expected);
  });

  check("Q9: compliance summary links the four breaches and open follow-up evidence", () => {
    const answer = ask(dataset, emptyState(), michael,
      "Which rules has WELL-0001 broken in the last 12 months, and what is still open?",
      { operation: "compliance", wellIds: ["WELL-0001"], from: "2025-10-16", to: referenceDate, visual: "table" });
    assert.match(answer.answer, /4\s+(?:overdue or breached|breached or overdue) rule/i);
    assert.match(answer.answer, /USD\s*5,000/i);
    const rendered = visualizationJson(answer);
    includesAll(rendered, ["SR-01", "SR-02", "SR-03", "RC-04", "MNT-0001-028", "MNT-0001-029", "MNT-0001-032", "CTX-0001-003", "RC-02"]);
    expectSources(answer, ["REG-0001-001", "REG-0001-002", "REG-0001-003", "MNT-0001-028", "MNT-0001-029", "MNT-0001-032", "CTX-0001-003"]);
    expectSourceType(answer, "MNT-0001-032", "repair report");
  });

  check("Q10: containment timing is read from both linked repair reports", () => {
    const answer = ask(dataset, emptyState(), michael,
      "In Southwest Block 24, which spills in the last 90 days were not contained within the SOP time limit?",
      { operation: "containment", areaId: "SW-24", from: "2026-07-18", to: referenceDate, visual: "table" });
    assert.equal(rows(answer).length, 2);
    expectWellSet(answer.referencedWellIds, ["WELL-0082", "WELL-0100"]);
    const rendered = visualizationJson(answer);
    includesAll(rendered, ["7.1", "8.1", "MNT-0082-028", "MNT-0100-034"]);
    expectSources(answer, ["INS-0082-0198", "INS-0100-0196", "MNT-0082-028", "MNT-0100-034"]);
    expectSourceType(answer, "MNT-0082-028", "repair report");
    expectSourceType(answer, "MNT-0100-034", "repair report");
  });

  check("Q11: Q6 wells resolve in the same user's next-chat repair-cost question", () => {
    const state = emptyState();
    const q6 = ask(dataset, state, michael,
      "Which 3 wells in Northeast Block 7 had the most downtime in the last 4 months? Show a bar chart.",
      { operation: "downtime_ranking", areaId: "NE-07", from: "2026-06-16", to: referenceDate, topK: 3, visual: "bar" });
    expectWellSet(q6.referencedWellIds, ["WELL-0121", "WELL-0138", "WELL-0107"]);
    addApiHistory(state, michael, "Which 3 wells in Northeast Block 7 had the most downtime in the last 4 months?", q6);
    const q11 = ask(dataset, state, michael,
      "For the three wells we discussed yesterday, what have repairs cost this year?",
      { operation: "costs", year: 2026, resolvePrivateHistory: true, visual: "table" });
    const rendered = visualizationJson(q11);
    includesAll(rendered, ["WELL-0121", "25,794", "WELL-0138", "46,942", "WELL-0107", "5,176"]);
    expectWellSet(q11.referencedWellIds, ["WELL-0121", "WELL-0138", "WELL-0107"]);
  });

  const crossUserFeedback = emptyState();
  check("Q12: correction is appended to the exact inspection, preserves raw data and exposes the note conflict", () => {
    const well = dataset.wells.find((item) => item.metadata.asset_id === "WELL-0164")!;
    const original = well.inspections.find((item) => item.inspection_id === "INS-0164-0205")!;
    const rawBefore = JSON.stringify(original);
    const answer = ask(dataset, crossUserFeedback, michael,
      "The 15 Oct reading for WELL-0164 is wrong. The handheld thermal gun used in that inspection was faulty; the field crew re-measured the wellhead at 41.0 °C.",
      { operation: "correction", wellIds: ["WELL-0164"], inspectionId: "INS-0164-0205", date: "2026-10-15", field: "wellhead_temp_c", value: 41.0, reason: "Handheld thermal gun was faulty; field crew re-measured the wellhead." });
    assert.equal(crossUserFeedback.corrections.length, 1);
    const correction = crossUserFeedback.corrections[0];
    assert.equal(correction.assetId, "WELL-0164");
    assert.equal(correction.inspectionId, "INS-0164-0205");
    assert.equal(correction.field, "wellhead_temp_c");
    assert.equal(correction.originalValue, 24.0);
    assert.equal(correction.correctedValue, 41.0);
    assert.equal(correction.authorUserId, michael);
    assert.match(correction.reason, /faulty|re-measured/i);
    assert.equal(JSON.stringify(original), rawBefore, "the raw inspection fixture must not be overwritten");
    includesAll(answer.answer, ["INS-0164-0205", "24", "41", "producing"]);
    assert.ok(answer.conflicts.length > 0, "the inspector's note must be surfaced as a conflict");
    expectSources(answer, ["INS-0164-0205"]);
  });

  check("Q12 follow-up: the corrected WELL-0164 leaves the non-producing area list", () => {
    const answer = ask(dataset, crossUserFeedback, michael,
      "Which wells in Northeast Block 8 are not producing oil right now, and why? Show them in a table.",
      { operation: "area_status", areaId: "NE-08", visual: "table" });
    expectWellSet(answer.referencedWellIds, ["WELL-0170", "WELL-0172", "WELL-0175"]);
    assert.ok(!visualizationJson(answer).includes("WELL-0164"));
  });

  check("Q13: spill correction targets INS-0151-0201 and recomputes reportability from 4.5 to 5.4 bbl", () => {
    const answer = ask(dataset, crossUserFeedback, michael,
      "The AI estimated the 24 Sep spill at WELL-0151 as 4.5 bbl. The field crew measured 5.4 bbl.",
      { operation: "correction", wellIds: ["WELL-0151"], inspectionId: "INS-0151-0201", date: "2026-09-24", field: "spill_est_volume_bbl", value: 5.4, reason: "Field crew measured the spill volume." });
    const correction = crossUserFeedback.corrections.find((item) => item.inspectionId === "INS-0151-0201");
    assert.ok(correction);
    assert.equal(correction.assetId, "WELL-0151");
    assert.equal(correction.originalValue, 4.5);
    assert.equal(correction.correctedValue, 5.4);
    assert.equal(correction.authorUserId, michael);
    includesAll(answer.answer, ["5.4", "24-hour", "SR-01", "Nov 23, 2026"]);
    expectSources(answer, ["INS-0151-0201", "MNT-0151-025"]);
    expectSourceType(answer, "MNT-0151-025", "repair report");
  });

  check("Q15: another user sees both the shared correction and the inspector conflict", () => {
    const answer = ask(dataset, crossUserFeedback, jessica,
      "Is WELL-0164 producing oil right now?",
      { operation: "status", wellIds: ["WELL-0164"], visual: "status" });
    includesAll(answer.answer, ["producing oil", "41", "Michael Turner", "Pump jack not moving"]);
    assert.ok(answer.conflicts.length > 0);
    expectSources(answer, ["INS-0164-0205"]);
    expectSources(answer, [crossUserFeedback.corrections[0].id]);
  });

  check("Q15: only the corrected 5.4-bbl spill is reportable and the missing notice is flagged", () => {
    const answer = ask(dataset, crossUserFeedback, laura,
      "Which spills in Northeast Block 8 in the last 90 days needed a report to the regulator?",
      { operation: "spills", areaId: "NE-08", from: "2026-07-18", to: referenceDate, reportableOnly: true, visual: "table" });
    assert.equal(rows(answer).length, 1);
    expectWellSet(answer.referencedWellIds, ["WELL-0151"]);
    includesAll(answer.answer, ["5.4", "SR-01"]);
    assert.ok(/no written notice|no report|none is recorded|overdue/i.test(answer.answer), "the missing report must be identified as overdue");
    includesAll(visualizationJson(answer), ["WELL-0151", "5.4"]);
    expectSources(answer, ["INS-0151-0201"]);
  });

  check("Q14: a T350 pump-jack RCA override adds WELL-0120 and leaves T200 WELL-0102 out", () => {
    const state = emptyState();
    const before = ask(dataset, state, michael,
      "Which wells in Northeast Block 7 need a root-cause analysis on their pump jack?",
      { operation: "rca", areaId: "NE-07", equipmentKind: "pump_jack", from: "2025-10-16", to: referenceDate, visual: "table" });
    expectWellSet(before.referencedWellIds, ["WELL-0108", "WELL-0121", "WELL-0138"]);
    ask(dataset, state, michael,
      "Note for all T350 wells: our team now wants a pump jack root-cause analysis after 2 repairs, not 3.",
      { operation: "rule", wellType: "T350", equipmentKind: "pump_jack", threshold: 2, reason: "Team RCA trigger for T350 pump jacks is two corrective repairs." });
    assert.equal(state.typeRules.length, 1);
    assert.equal(state.typeRules[0].wellType, "T350");
    assert.equal(state.typeRules[0].equipmentKind, "pump_jack");
    assert.equal(state.typeRules[0].count, 2);
    assert.equal(state.typeRules[0].authorUserId, michael);
    const after = ask(dataset, state, michael,
      "Which wells in Northeast Block 7 need a root-cause analysis on their pump jack?",
      { operation: "rca", areaId: "NE-07", equipmentKind: "pump_jack", from: "2025-10-16", to: referenceDate, visual: "table" });
    expectWellSet(after.referencedWellIds, ["WELL-0108", "WELL-0120", "WELL-0121", "WELL-0138"]);
    assert.ok(!after.referencedWellIds.includes("WELL-0102"), "the T350 override must not change the T200 threshold");
    includesAll(visualizationJson(after), ["T350", "shared rule", "T200"]);
  });

  check("Q16: shared planned downtime is visible to another user, and reading it does not mutate state", () => {
    const state = emptyState();
    ask(dataset, state, jake,
      "FYI for everyone: WELL-0007 will be shut in from 17 Oct for a 10-day planned workover.",
      { operation: "note", wellIds: ["WELL-0007"], reason: "FYI for everyone: WELL-0007 will be shut in from 17 Oct for a 10-day planned workover." });
    assert.equal(state.sharedFacts.length, 1);
    const beforeRead = JSON.stringify(state);
    const answer = ask(dataset, state, michael,
      "Is any downtime planned for WELL-0007?",
      { operation: "shared_knowledge", wellIds: ["WELL-0007"] });
    assert.equal(JSON.stringify(state), beforeRead, "a read-only planned-downtime question must not save another note");
    includesAll(answer.answer, ["17 Oct", "10-day", "Jake Morales"]);
    expectSources(answer, [state.sharedFacts[0].id]);
  });

  check("Q16: Jessica cannot reuse Michael's private Q6 list", () => {
    const state = emptyState();
    state.history[michael] = [{
      userText: "Which three wells did we discuss?",
      answer: "WELL-0121, WELL-0138, WELL-0107",
      wellIds: ["WELL-0121", "WELL-0138", "WELL-0107"],
      createdAt: "2026-10-16T12:00:00.000Z",
    }];
    const answer = ask(dataset, state, jessica,
      "For the three wells we discussed yesterday, what have repairs cost this year?",
      { operation: "costs", year: 2026, resolvePrivateHistory: true, visual: "table" });
    assert.match(answer.answer, /no matching earlier conversation|no prior conversation/i);
    assert.deepEqual(answer.referencedWellIds, []);
    assert.ok(!visualizationJson(answer).includes("WELL-0121"));
    assert.ok(!answer.answer.includes("25,794"));
  });

  check("Q17: conflicting WELL-0175 claim remains unconfirmed beside Michael's note and inspection evidence", () => {
    const state = emptyState();
    ask(dataset, state, michael,
      "WELL-0175 has been shut in for planned work since 14 Oct.",
      { operation: "note", wellIds: ["WELL-0175"], reason: "WELL-0175 has been shut in for planned work since 14 Oct." });
    const answer = ask(dataset, state, tyler,
      "WELL-0175 is running fine.",
      { operation: "claim", wellIds: ["WELL-0175"] });
    assert.equal(state.claims.length, 1);
    assert.equal(state.claims[0].authorUserId, tyler);
    assert.equal(state.claims[0].confirmed, false);
    includesAll(answer.answer, ["0.4", "not producing", "Michael Turner", "unconfirmed"]);
    assert.ok(answer.conflicts.length > 0);
    expectSources(answer, ["INS-0175-0204"]);
  });

  check("Q17: WELL-0001 back-online claim is checked against the latest inspection and planned-shut-in note", () => {
    const state = emptyState();
    const answer = ask(dataset, state, jake,
      "WELL-0001 is back online since 14 Oct.",
      { operation: "claim", wellIds: ["WELL-0001"] });
    assert.equal(state.claims.length, 1);
    assert.equal(state.claims[0].confirmed, false);
    includesAll(answer.answer, ["INS-0001-0203", "not producing", "20 Oct"]);
    assert.ok(answer.conflicts.length > 0);
    expectSources(answer, ["INS-0001-0203", "CTX-0001-003"]);
  });

  check("Q18: disagreement about WELL-0101's finding is shown without discarding the spill", () => {
    const state = emptyState();
    const answer = ask(dataset, state, michael,
      "Was the 20 Aug spill at WELL-0101 real oil?",
      { operation: "spills", wellIds: ["WELL-0101"], date: "2026-08-20", visual: "table" });
    assert.equal(rows(answer).length, 1);
    includesAll(answer.answer, ["yes", "crude", "produced water"]);
    assert.match(answer.answer, /1\s+bbl/i);
    assert.ok(answer.conflicts.length > 0, "both users' views must remain visible as disagreement");
    expectSources(answer, ["INS-0101-0197", "CTX-0101-002", "CTX-0101-003", "MNT-0101-029"]);
    assert.deepEqual(state.corrections, [], "informal disagreement is not a formal correction");
  });

  check("unseen variation: a T350 well uses its own threshold and manual", () => {
    const answer = ask(dataset, emptyState(), michael,
      "Is WELL-0151 producing oil right now?",
      { operation: "status", wellIds: ["WELL-0151"], visual: "status" });
    includesAll(answer.answer, ["producing oil", "29.2", "20", "T350"]);
    expectSources(answer, ["INS-0151-0204", "OM-T350"]);
  });

  check("unseen variation: an explicit arbitrary date range is honored for downtime", () => {
    const answer = ask(dataset, emptyState(), michael,
      "How many days was WELL-0001 down from 8 Oct through 15 Oct 2026?",
      { operation: "downtime", wellIds: ["WELL-0001"], from: "2026-10-08", to: "2026-10-15", visual: "none" });
    assert.match(answer.answer, /14\s+days/i);
    expectSources(answer, ["INS-0001-0202", "INS-0001-0203"]);
  });

  check("unseen variation: unsupported well is handled without substituting another asset", () => {
    const answer = ask(dataset, emptyState(), michael,
      "Is WELL-9999 producing oil right now?",
      { operation: "status", wellIds: ["WELL-9999"], visual: "status" });
    assert.deepEqual(answer.referencedWellIds, []);
    assert.deepEqual(answer.citations, []);
    assert.ok(/not found|not loaded|no inspection|couldn.t find/i.test(answer.answer));
  });

  let failed = 0;
  for (const item of checks) {
    try {
      item.run();
      console.log(`PASS ${item.name}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL ${item.name}`);
      console.error(error instanceof Error ? error.stack ?? error.message : error);
    }
  }
  console.log(`\nAcceptance: ${checks.length - failed}/${checks.length} passed`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Acceptance setup failed:", error);
  process.exitCode = 1;
});
