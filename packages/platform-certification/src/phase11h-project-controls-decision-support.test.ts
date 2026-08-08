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
const GATES = `${CERT}/src/phase11h/gates.ts`;
const BATCH_68 =
  "supabase/migrations/20260808080000_batch_68_project_controls_decision_support.sql";

describe("Phase 11H Project Controls decision support", () => {
  it("defines exactly 55 gates (A–BC)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(55);
    expect(ids[ids.length - 1]).toBe("BC");
  });

  it("declares the decision support version and Phase 11G baseline", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.8\.0-decision-support"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "decision_support"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11H"/);
    expect(version).toMatch(
      /PHASE_11G_CERTIFIED_COMMIT =\s*\r?\n?\s*"abdbf3153118baa0c3dc5758fac7a5137b84f5d7"/,
    );
    expect(version).toMatch(/PHASE_11G_HOSTED_RUN = "31238798319"/);
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.8\.0-decision-support"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11h/);
  });

  it("locks decision support ready while predictive capabilities stay forbidden", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DECISION_SUPPORT_READY = true/);
    expect(version).toMatch(/FORECAST_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/PROJECT_CONTEXT_COMPOSITION_READY = true/);
    expect(version).toMatch(/FORECAST_ENGINE_IMPLEMENTED = false/);
    expect(version).toMatch(/PREDICTIVE_SCHEDULING_IMPLEMENTED = false/);
    expect(version).toMatch(/FORECAST_EXECUTION_IMPLEMENTED = false/);
    expect(version).toMatch(/AUTOMATIC_DECISION_EXECUTION_ENABLED = false/);
    expect(version).toMatch(/PHASE_11I_READY = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = true/);
  });

  it("ships decision domain surface and batch 68 migration", () => {
    for (const file of [
      "decision.ts",
      "decision-confidence.ts",
      "decision-engine.ts",
      "engine-decision.ts",
      "project-context-composition.ts",
    ]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(present(BATCH_68)).toBe(true);
    expect(present("apps/web/src/app/api/engineering/project-controls/decision/route.ts")).toBe(
      true,
    );
  });
});
