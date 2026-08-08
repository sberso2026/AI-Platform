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
const GATES = `${CERT}/src/phase11e/gates.ts`;
const BATCH_65 =
  "supabase/migrations/20260808050000_batch_65_project_controls_cost_intelligence.sql";

describe("Phase 11E Project Controls cost intelligence", () => {
  it("defines exactly 55 gates (A–BC)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(55);
    expect(ids[ids.length - 1]).toBe("BC");
  });

  it("declares the cost intelligence version and Phase 11D baseline (11E regression)", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PHASE_11E_VERSION = "0\.5\.0-cost-intelligence"/);
    expect(version).toMatch(/COST_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/COST_INTELLIGENCE_11E_INTACT = true/);
    expect(version).toMatch(
      /PHASE_11D_CERTIFIED_COMMIT =\s*\r?\n?\s*"3a27fde6bb15fd6298feafca121438dddb2087af"/,
    );
    expect(version).toMatch(/PHASE_11D_HOSTED_RUN = "31231309349"/);
    expect(read(`${PC}/src/domain/cost.ts`)).toContain("CostIntelligenceState");
    expect(present(BATCH_65)).toBe(true);
  });

  it("current module version is productivity intelligence (11F)", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.6\.0-productivity-intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "productivity_intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11F"/);
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.6\.0-productivity-intelligence"/);
  });

  it("locks cost intelligence ready while ledger capabilities stay forbidden", () => {
    const version = read(VERSION);
    expect(version).toMatch(/COST_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/COST_ENGINE_IMPLEMENTED = false/);
    expect(version).toMatch(/BUDGET_LEDGER_IMPLEMENTED = false/);
    expect(version).toMatch(/FINANCIAL_POSTING_IMPLEMENTED = false/);
    expect(version).toMatch(/FORECAST_ENGINE_IMPLEMENTED = false/);
    expect(version).toMatch(/PHASE_11F_READY = true/);
    expect(version).toMatch(/PHASE_11G_READY = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = true/);
  });

  it("ships cost domain surface and batch 65 migration", () => {
    for (const file of ["cost.ts", "cost-confidence.ts", "cost-engine.ts"]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(present(BATCH_65)).toBe(true);
    expect(present("apps/web/src/app/api/engineering/project-controls/cost/route.ts")).toBe(true);
  });
});
