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
const GATES = `${CERT}/src/phase11f/gates.ts`;
const BATCH_66 =
  "supabase/migrations/20260808060000_batch_66_project_controls_productivity_intelligence.sql";

describe("Phase 11F Project Controls productivity intelligence", () => {
  it("defines exactly 55 gates (A–BC)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(55);
    expect(ids[ids.length - 1]).toBe("BC");
  });

  it("declares the productivity intelligence version and Phase 11E baseline", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.6\.0-productivity-intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "productivity_intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11F"/);
    expect(version).toMatch(
      /PHASE_11E_CERTIFIED_COMMIT =\s*\r?\n?\s*"83edd1302a621560511255eb8071d4ad5c9343a9"/,
    );
    expect(version).toMatch(/PHASE_11E_HOSTED_RUN = "31232558080"/);
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.6\.0-productivity-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11f/);
  });

  it("locks productivity intelligence ready while workforce capabilities stay forbidden", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PRODUCTIVITY_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/RESOURCE_PLANNING_IMPLEMENTED = false/);
    expect(version).toMatch(/TIMESHEET_SYSTEM_IMPLEMENTED = false/);
    expect(version).toMatch(/PAYROLL_IMPLEMENTED = false/);
    expect(version).toMatch(/LABOUR_COST_ENGINE_IMPLEMENTED = false/);
    expect(version).toMatch(/PRODUCTIVITY_ANALYSIS_IMPLEMENTED = false/);
    expect(version).toMatch(/PHASE_11G_READY = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = false/);
  });

  it("ships productivity domain surface and batch 66 migration", () => {
    for (const file of ["productivity.ts", "productivity-confidence.ts", "productivity-engine.ts"]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(present(BATCH_66)).toBe(true);
    expect(present("apps/web/src/app/api/engineering/project-controls/productivity/route.ts")).toBe(
      true,
    );
  });
});
