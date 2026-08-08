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

const DT = "packages/digital-twin";
const CERT = "packages/digital-twin-certification";
const VERSION = `${DT}/src/version.ts`;
const GATES = `${CERT}/src/phase12g/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12g-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12g-digital-twin-simulation.yml";
const BATCH_80 = "supabase/migrations/20260808190000_batch_80_digital_twin_simulation.sql";
const BATCH_79 = "supabase/migrations/20260808180000_batch_79_digital_twin_representation_mapping.sql";

const PHASE_12F_COMMIT = "2846421e7905a69c789a882a86da4071272278e3";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";

describe("Phase 12G Digital Twin simulation", () => {
  it("defines exactly 71 gates (A–BS)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(71);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("BS");
    expect(new Set(ids).size).toBe(71);
  });

  it("declares simulation version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.7\.0-simulation"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "simulation"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12G"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.7\.0-simulation"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.7\.0-simulation"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12g/);
  });

  it("enables bounded simulation and forbids native solver/prediction", () => {
    const version = read(VERSION);
    for (const enabled of [
      /TWIN_SIMULATION_FRAMEWORK_READY = true/,
      /TWIN_SIMULATION_METHOD_REGISTRY_READY = true/,
      /TWIN_SIMULATION_PROVIDER_REGISTRY_READY = true/,
      /TWIN_SIMULATED_STATE_READY = true/,
      /SIMULATION_EXECUTION_IMPLEMENTED = true/,
      /PHASE_12H_READY = true/,
    ]) {
      expect(version, String(enabled)).toMatch(enabled);
    }
    for (const lock of [
      /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/,
      /SIMULATION_OPTIMIZATION_IMPLEMENTED = false/,
      /AUTOMATIC_SIMULATION_APPROVAL_ENABLED = false/,
      /PREDICTIVE_TWIN_IMPLEMENTED = false/,
      /SHM_RUNTIME_IMPLEMENTED = false/,
      /DUPLICATE_ENGINEERING_TOOL_FRAMEWORK_DETECTED = false/,
      /SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/,
      /THREE_D_VIEWER_IMPLEMENTED = false/,
      /PRODUCTION_DIGITAL_TWIN_READY = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.7\.0-simulation-draft"/);
  });

  it("pins Phase 12F certified baseline", () => {
    expect(read(VERSION)).toContain(PHASE_12F_COMMIT);
    expect(read(VERSION)).toMatch(/PHASE_12F_HOSTED_RUN = "31261555990"/);
    expect(read(VERSION)).toMatch(/PHASE_12F_VERSION = "0\.6\.0-representation"/);
  });

  it("includes simulation domain modules and batch_80", () => {
    for (const file of [
      `${DT}/src/domain/simulation-method.ts`,
      `${DT}/src/domain/simulation-orchestrator.ts`,
      `${DT}/src/domain/simulated-state.ts`,
      BATCH_80,
      `${CERT}/src/phase12g/gates.ts`,
      RUNNER,
      WORKFLOW,
      "docs/architecture/DIGITAL_TWIN_SIMULATION_GOVERNANCE_MODEL.md",
      "docs/architecture/DIGITAL_TWIN_SIMULATION_TOOL_BOUNDARY.md",
      "docs/architecture/DIGITAL_TWIN_PHASE_12G_SIMULATION.md",
      "apps/web/src/app/api/engineering/digital-twin/simulation-runs/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/simulated-states/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx",
      `${CERT}/playwright/simulation.spec.ts`,
      `${DT}/tests/phase12g-digital-twin-simulation.test.ts`,
    ]) {
      expect(present(file), file).toBe(true);
    }
    expect(present(BATCH_79)).toBe(true);
  });

  it("preserves Asset Intelligence V1 commit pin", () => {
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
  });
});
