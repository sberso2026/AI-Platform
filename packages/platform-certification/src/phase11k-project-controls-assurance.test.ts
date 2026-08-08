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
const GATES = `${CERT}/src/phase11k/gates.ts`;
const BATCH_71 =
  "supabase/migrations/20260808110000_batch_71_project_controls_assurance_intelligence.sql";

describe("Phase 11K Project Controls assurance intelligence", () => {
  it("defines exactly 55 gates (A–BC)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(55);
    expect(ids[ids.length - 1]).toBe("BC");
  });

  it("declares the assurance intelligence version and Phase 11J baseline", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.11\.0-assurance-intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "assurance_intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11K"/);
    expect(version).toMatch(
      /PHASE_11J_CERTIFIED_COMMIT =\s*\r?\n?\s*"c840c93d8f7b5eb93d510437ad92b4087d067b2b"/,
    );
    expect(version).toMatch(/PHASE_11J_HOSTED_RUN = "31246586072"/);
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.11\.0-assurance-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11k/);
  });

  it("locks assurance intelligence ready while register mutation stays forbidden", () => {
    const version = read(VERSION);
    expect(version).toMatch(/ASSURANCE_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/AssuranceIntelligenceReady = true/);
    expect(version).toMatch(/RISK_OPPORTUNITY_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/SCENARIO_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/DECISION_SUPPORT_READY = true/);
    expect(version).toMatch(/FORECAST_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/PROJECT_CONTEXT_COMPOSITION_READY = true/);
    expect(version).toMatch(/AUTOMATIC_RISK_REGISTER_MUTATION_ENABLED = false/);
    expect(version).toMatch(/DUPLICATE_ASSURANCE_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/PHASE_11L_READY = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = true/);
  });

  it("ships assurance domain surface and batch 71 migration", () => {
    for (const file of [
      "assurance.ts",
      "assurance-confidence.ts",
      "assurance-engine.ts",
      "engine-assurance.ts",
      "project-context-composition.ts",
    ]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(present(BATCH_71)).toBe(true);
    expect(
      present("apps/web/src/app/api/engineering/project-controls/assurance/route.ts"),
    ).toBe(true);
  });
});
