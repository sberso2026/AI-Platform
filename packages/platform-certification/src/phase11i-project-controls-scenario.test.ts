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
const GATES = `${CERT}/src/phase11i/gates.ts`;
const BATCH_69 =
  "supabase/migrations/20260808090000_batch_69_project_controls_scenario_intelligence.sql";

describe("Phase 11I Project Controls scenario intelligence", () => {
  it("defines exactly 55 gates (A–BC)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(55);
    expect(ids[ids.length - 1]).toBe("BC");
  });

  it("declares the scenario intelligence version and Phase 11H baseline", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.9\.0-scenario-intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "scenario_intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11I"/);
    expect(version).toMatch(
      /PHASE_11H_CERTIFIED_COMMIT =\s*\r?\n?\s*"9143abfe86234c115c84c5dc27c42ef48e2d3842"/,
    );
    expect(version).toMatch(/PHASE_11H_HOSTED_RUN = "31239588331"/);
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.9\.0-scenario-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11i/);
  });

  it("locks scenario intelligence ready while predictive capabilities stay forbidden", () => {
    const version = read(VERSION);
    expect(version).toMatch(/SCENARIO_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/ScenarioIntelligenceReady = true/);
    expect(version).toMatch(/DECISION_SUPPORT_READY = true/);
    expect(version).toMatch(/FORECAST_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/PROJECT_CONTEXT_COMPOSITION_READY = true/);
    expect(version).toMatch(/AUTOMATIC_SCENARIO_EXECUTION_ENABLED = false/);
    expect(version).toMatch(/PHASE_11J_READY = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = false/);
  });

  it("ships scenario domain surface and batch 69 migration", () => {
    for (const file of [
      "scenario.ts",
      "scenario-confidence.ts",
      "scenario-engine.ts",
      "engine-scenario.ts",
      "project-context-composition.ts",
    ]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(present(BATCH_69)).toBe(true);
    expect(present("apps/web/src/app/api/engineering/project-controls/scenario/route.ts")).toBe(
      true,
    );
  });
});
