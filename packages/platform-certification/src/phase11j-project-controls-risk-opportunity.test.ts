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
const GATES = `${CERT}/src/phase11j/gates.ts`;
const BATCH_70 =
  "supabase/migrations/20260808100000_batch_70_project_controls_risk_opportunity_intelligence.sql";

describe("Phase 11J Project Controls risk & opportunity intelligence", () => {
  it("defines exactly 55 gates (A–BC)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(55);
    expect(ids[ids.length - 1]).toBe("BC");
  });

  it("declares the risk/opportunity intelligence version and Phase 11I baseline", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.10\.0-risk-opportunity-intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "risk_opportunity_intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11J"/);
    expect(version).toMatch(
      /PHASE_11I_CERTIFIED_COMMIT =\s*\r?\n?\s*"1dc73a070883ea4783869517da558ea34ff797eb"/,
    );
    expect(version).toMatch(/PHASE_11I_HOSTED_RUN = "31245651307"/);
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.10\.0-risk-opportunity-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11j/);
  });

  it("locks risk/opportunity intelligence ready while register mutation stays forbidden", () => {
    const version = read(VERSION);
    expect(version).toMatch(/RISK_OPPORTUNITY_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/RiskOpportunityIntelligenceReady = true/);
    expect(version).toMatch(/SCENARIO_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/DECISION_SUPPORT_READY = true/);
    expect(version).toMatch(/FORECAST_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/PROJECT_CONTEXT_COMPOSITION_READY = true/);
    expect(version).toMatch(/AUTOMATIC_RISK_REGISTER_MUTATION_ENABLED = false/);
    expect(version).toMatch(/DUPLICATE_RISK_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/PHASE_11K_READY = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = false/);
  });

  it("ships risk/opportunity domain surface and batch 70 migration", () => {
    for (const file of [
      "risk-opportunity.ts",
      "risk-opportunity-confidence.ts",
      "risk-opportunity-engine.ts",
      "engine-risk-opportunity.ts",
      "project-context-composition.ts",
    ]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(present(BATCH_70)).toBe(true);
    expect(
      present("apps/web/src/app/api/engineering/project-controls/risk-opportunity/route.ts"),
    ).toBe(true);
  });
});
