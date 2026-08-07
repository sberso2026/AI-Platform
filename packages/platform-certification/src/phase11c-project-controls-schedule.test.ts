import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}
function present(rel: string): boolean {
  return existsSync(resolve(root, rel));
}

const PC = "packages/project-controls";
const CERT = "packages/project-controls-certification";
const VERSION = `${PC}/src/version.ts`;
const OWNERSHIP_LOCK = `${PC}/src/architecture/ownership-lock.ts`;
const GATES = `${CERT}/src/phase11c/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase11c-certification.ts`;
const WORKFLOW = ".github/workflows/phase-11c-project-controls-schedule.yml";

const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";
const PHASE_11B_COMMIT = "336707d4baaf63b6a4e5f4ef4255f9ca8d7e4dd6";

describe("Phase 11C Project Controls schedule intelligence", () => {
  it("defines exactly 43 gates (A–AQ)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(43);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("AQ");
    expect(new Set(ids).size).toBe(43);
    expect(read(GATES)).toMatch(/PHASE_11C_GATE_COUNT = 43|PHASE_11C_GATE_COUNT = PHASE_11C/);
  });

  it("declares the schedule intelligence version and Phase 11B baseline", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.3\.0-schedule-intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "schedule_intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11C"/);
    expect(version).toMatch(new RegExp(`PHASE_11B_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11B_COMMIT}"`));
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.3\.0-schedule-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.3\.0-schedule-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11c/);
  });

  it("locks schedule intelligence ready while CPM stays forbidden", () => {
    const version = read(VERSION);
    expect(version).toMatch(/SCHEDULE_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/PROGRESS_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/PROGRESS_INTELLIGENCE_11B_INTACT = true/);
    expect(version).toMatch(/CPM_SCHEDULING_IMPLEMENTED = false/);
    expect(version).toMatch(/FLOAT_COMPUTATION_IMPLEMENTED = false/);
    expect(version).toMatch(/SCHEDULE_EXECUTION_IMPLEMENTED = false/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = false/);
    expect(read(OWNERSHIP_LOCK)).toMatch(/schedule_controls_intelligence/);
    expect(read(OWNERSHIP_LOCK)).toMatch(/SCHEDULE_INTELLIGENCE_READY/);
  });

  it("ships schedule domain surface and batch 63 migration", () => {
    for (const file of [
      "schedule.ts",
      "schedule-confidence.ts",
      "schedule-engine.ts",
      "engine.ts",
      "services.ts",
    ]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(
      present("supabase/migrations/20260808030000_batch_63_project_controls_schedule.sql"),
    ).toBe(true);
    const batch63 = read(
      "supabase/migrations/20260808030000_batch_63_project_controls_schedule.sql",
    );
    expect(batch63).toMatch(/project_controls_schedule_assessments/);
    expect(batch63).toMatch(/pc_schedule_no_cpm/);
    expect(batch63).toMatch(/pc_schedule_no_float/);
    expect(batch63).toMatch(/engineering\.project\.schedule\.updated/);
    expect(batch63).toMatch(/schedule_summary/);
    expect(batch63).toMatch(/ENABLE ROW LEVEL SECURITY/);
  });

  it("exposes schedule HTTP route and profile route with two active contributors", () => {
    const schedule = read("apps/web/src/app/api/engineering/project-controls/schedule/route.ts");
    const profile = read("apps/web/src/app/api/engineering/project-controls/profile/route.ts");
    expect(schedule).toMatch(/cpmImplemented:\s*false/);
    expect(schedule).toMatch(/scheduleIntelligenceReady:\s*true/);
    expect(schedule).toMatch(/scheduleExecutionImplemented:\s*false/);
    expect(schedule).toMatch(/error:\s*\{\s*code/);
    expect(profile).toMatch(/scheduleIntelligenceReady:\s*true/);
    expect(profile).toMatch(/progress_intelligence/);
    expect(profile).toMatch(/schedule_intelligence/);
  });

  it("keeps certification harness present", () => {
    expect(present(RUNNER)).toBe(true);
    expect(present(WORKFLOW)).toBe(true);
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(WORKFLOW)).toMatch(/certify:phase11c/);
    expect(read(GATES)).toMatch(new RegExp(`"${ASSET_INTELLIGENCE_V1_COMMIT}"`));
  });
});
