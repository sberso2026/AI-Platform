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
const GATES = `${CERT}/src/phase11l/gates.ts`;
const BATCH_72 =
  "supabase/migrations/20260808120000_batch_72_project_controls_explainability_intelligence.sql";

describe("Phase 11L Project Controls explainability intelligence", () => {
  it("defines exactly 55 gates (A–BC)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(55);
    expect(ids[ids.length - 1]).toBe("BC");
  });

  it("declares the explainability intelligence version and Phase 11K baseline", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.12\.0-explainability-intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "explainability_intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11L"/);
    expect(version).toMatch(
      /PHASE_11K_CERTIFIED_COMMIT =\s*\r?\n?\s*"82ac9720247c96ca4029121b97c44dceb52b5145"/,
    );
    expect(version).toMatch(/PHASE_11K_HOSTED_RUN = "31248471330"/);
    expect(read(`${PC}/package.json`)).toMatch(
      /"version": "0\.12\.0-explainability-intelligence"/,
    );
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11l/);
  });

  it("locks explainability intelligence ready while forbidden flags stay false", () => {
    const version = read(VERSION);
    expect(version).toMatch(/EXPLAINABILITY_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/ExplainabilityIntelligenceReady = true/);
    expect(version).toMatch(/ASSURANCE_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/AssuranceIntelligenceReady = true/);
    expect(version).toMatch(/RISK_OPPORTUNITY_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/RiskOpportunityIntelligenceReady = true/);
    expect(version).toMatch(/SCENARIO_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/ScenarioIntelligenceReady = true/);
    expect(version).toMatch(/DECISION_SUPPORT_READY = true/);
    expect(version).toMatch(/FORECAST_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/PROJECT_CONTEXT_COMPOSITION_READY = true/);
    expect(version).toMatch(/AUTOMATIC_EXPLANATION_APPROVAL_ENABLED = false/);
    expect(version).toMatch(/AUTOMATIC_EVIDENCE_CREATION_ENABLED = false/);
    expect(version).toMatch(/DUPLICATE_EXPLAINABILITY_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/PHASE_11M_READY = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = false/);
  });

  it("ships explainability domain surface and batch 72 migration", () => {
    for (const file of [
      "explainability.ts",
      "explainability-confidence.ts",
      "explainability-engine.ts",
      "engine-explainability.ts",
      "project-context-composition.ts",
    ]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(present(BATCH_72)).toBe(true);
    expect(
      present("apps/web/src/app/api/engineering/project-controls/explainability/route.ts"),
    ).toBe(true);
  });
});
