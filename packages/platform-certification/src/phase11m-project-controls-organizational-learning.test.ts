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
const GATES = `${CERT}/src/phase11m/gates.ts`;
const BATCH_73 =
  "supabase/migrations/20260808130000_batch_73_project_controls_organizational_learning.sql";

describe("Phase 11M Project Controls organizational learning intelligence", () => {
  it("defines exactly 55 gates (A–BC)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(55);
    expect(ids[ids.length - 1]).toBe("BC");
  });

  it("declares GA over the organizational learning baseline", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "1\.0\.0"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "ga"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11N"/);
    expect(version).toMatch(/PHASE_11M_VERSION = "0\.13\.0-organizational-learning"/);
    expect(version).toMatch(
      /PHASE_11M_CERTIFIED_COMMIT = "c115329127266022a6233481671b77dee15ae1d7"/,
    );
    expect(version).toMatch(
      /PHASE_11L_CERTIFIED_COMMIT =\s*\r?\n?\s*"5176bed8168ad39cca4de43b2f95737aab6569aa"/,
    );
    expect(read(`${PC}/package.json`)).toMatch(/"version": "1\.0\.0"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11m/);
  });

  it("locks organizational learning ready while forbidden flags stay false", () => {
    const version = read(VERSION);
    expect(version).toMatch(/ORGANIZATIONAL_LEARNING_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/OrganizationalLearningReady = true/);
    expect(version).toMatch(/EXPLAINABILITY_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/ExplainabilityIntelligenceReady = true/);
    expect(version).toMatch(/ASSURANCE_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/AUTOMATIC_LEARNING_APPROVAL_ENABLED = false/);
    expect(version).toMatch(/AUTOMATIC_KNOWLEDGE_MUTATION_ENABLED = false/);
    expect(version).toMatch(/DUPLICATE_KNOWLEDGE_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/PHASE_11N_READY = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = true/);
  });

  it("ships organizational learning domain surface and batch 73 migration", () => {
    for (const file of [
      "organizational-learning.ts",
      "organizational-learning-confidence.ts",
      "organizational-learning-engine.ts",
      "engine-organizational-learning.ts",
    ]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(present(BATCH_73)).toBe(true);
    expect(
      present("apps/web/src/app/api/engineering/project-controls/organizational-learning/route.ts"),
    ).toBe(true);
  });
});
