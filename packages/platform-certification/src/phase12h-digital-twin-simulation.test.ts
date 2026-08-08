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
const GATES = `${CERT}/src/phase12h/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12h-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12h-digital-twin-simulation-assurance.yml";
const BATCH_81 =
  "supabase/migrations/20260808200000_batch_81_digital_twin_simulation_assurance.sql";
const BATCH_80 = "supabase/migrations/20260808190000_batch_80_digital_twin_simulation.sql";

const PHASE_12G_COMMIT = "a3832076425b276f089e38f1c9aa76559014454c";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";

describe("Phase 12H Digital Twin simulation assurance", () => {
  it("defines exactly 70 gates (A–BR)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(70);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("BR");
    expect(new Set(ids).size).toBe(70);
  });

  it("declares simulation assurance version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.8\.0-simulation-assurance"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "simulation_assurance"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12H"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.8\.0-simulation-assurance"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.8\.0-simulation-assurance"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12h/);
  });

  it("enables assurance flags and forbids solvers/prediction", () => {
    const version = read(VERSION);
    for (const enabled of [
      /SIMULATION_METHOD_QUALIFICATION_READY = true/,
      /SIMULATION_PROVIDER_QUALIFICATION_READY = true/,
      /SIMULATION_APPLICATION_QUALIFICATION_READY = true/,
      /SIMULATION_EXECUTION_QUALIFICATION_READY = true/,
      /SIMULATION_QUALIFICATION_ELIGIBILITY_READY = true/,
      /TWIN_SIMULATION_PACKAGE_READY = true/,
      /SIMULATION_PACKAGE_INTEGRITY_READY = true/,
      /SIMULATION_REPRODUCIBILITY_READY = true/,
      /TWIN_SIMULATION_FRAMEWORK_READY = true/,
      /SIMULATION_EXECUTION_IMPLEMENTED = true/,
      /PHASE_12I_READY = true/,
    ]) {
      expect(version, String(enabled)).toMatch(enabled);
    }
    for (const lock of [
      /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/,
      /EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED = false/,
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
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.8\.0-simulation-assurance-draft"/);
  });

  it("pins Phase 12G certified baseline", () => {
    expect(read(VERSION)).toContain(PHASE_12G_COMMIT);
    expect(read(VERSION)).toMatch(/PHASE_12G_HOSTED_RUN = "31262355460"/);
    expect(read(VERSION)).toMatch(/PHASE_12G_VERSION = "0\.7\.0-simulation"/);
  });

  it("includes assurance domain modules and batch_81", () => {
    for (const file of [
      `${DT}/src/domain/simulation-method-qualification.ts`,
      `${DT}/src/domain/simulation-qualification-eligibility.ts`,
      `${DT}/src/domain/simulation-package.ts`,
      BATCH_81,
      `${CERT}/src/phase12h/gates.ts`,
      RUNNER,
      WORKFLOW,
      "docs/architecture/DIGITAL_TWIN_SIMULATION_QUALIFICATION_MODEL.md",
      "docs/architecture/DIGITAL_TWIN_PHASE_12H_SIMULATION_ASSURANCE.md",
      "apps/web/src/app/api/engineering/digital-twin/method-qualifications/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/simulation-packages/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx",
      `${CERT}/playwright/simulation-assurance.spec.ts`,
      `${DT}/tests/phase12h-digital-twin-simulation-assurance.test.ts`,
    ]) {
      expect(present(file), file).toBe(true);
    }
    expect(present(BATCH_80)).toBe(true);
  });

  it("keeps V1 asset intelligence pin intact in version module", () => {
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
  });
});
