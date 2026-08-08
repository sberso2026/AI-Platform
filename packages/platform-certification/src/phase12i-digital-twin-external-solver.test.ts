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
const GATES = `${CERT}/src/phase12i/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12i-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12i-digital-twin-external-solver.yml";
const BATCH_82 =
  "supabase/migrations/20260808210000_batch_82_digital_twin_solver_adapters.sql";
const BATCH_81 =
  "supabase/migrations/20260808200000_batch_81_digital_twin_simulation_assurance.sql";

const PHASE_12H_COMMIT = "f276dbb15b3a68d2863b3547a2dc58aa1ef3afbe";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";

describe("Phase 12I Digital Twin external solver", () => {
  it("defines exactly 75 gates (A–BW)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(75);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("BW");
    expect(new Set(ids).size).toBe(75);
  });

  it("preserves Phase 12I external solver pins and artifacts after 12J", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PHASE_12I_VERSION = "0\.9\.0-external-solver"/);
    expect(version).toMatch(/PHASE_12I_CERTIFIED_COMMIT/);
    expect(version).toMatch(/EXTERNAL_SOLVER_ADAPTER_FRAMEWORK_READY = true/);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.10\.0-solver-capabilities"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12K"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12i/);
    expect(read(`${CERT}/package.json`)).toMatch(/test:e2e:external-solver/);
  });

  it("enables external solver flags and forbids silent fallback", () => {
    const version = read(VERSION);
    for (const enabled of [
      /EXTERNAL_SOLVER_ADAPTER_FRAMEWORK_READY = true/,
      /FIRST_REAL_ENGINEERING_SOLVER_ADAPTER_IMPLEMENTED = true/,
      /FIRST_REAL_ENGINEERING_SOLVER_METHOD_CERTIFIED = true/,
      /EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED = true/,
      /SIMULATION_EXECUTION_IMPLEMENTED = true/,
      /PHASE_12H_READY = true/,
      /PHASE_12I_READY = true/,
      /PHASE_12J_READY = true/,
    ]) {
      expect(version, String(enabled)).toMatch(enabled);
    }
    for (const lock of [
      /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/,
      /SILENT_SOLVER_FALLBACK_ALLOWED = false/,
      /silentSolverFallbackAllowed = false/,
      /SIMULATION_OPTIMIZATION_IMPLEMENTED = false/,
      /AUTOMATIC_SIMULATION_APPROVAL_ENABLED = false/,
      /PREDICTIVE_TWIN_IMPLEMENTED = false/,
      /SHM_RUNTIME_IMPLEMENTED = false/,
      /DUPLICATE_ENGINEERING_TOOL_FRAMEWORK_DETECTED = false/,
      /DUPLICATE_SOLVER_OWNERSHIP_DETECTED = false/,
      /SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/,
      /THREE_D_VIEWER_IMPLEMENTED = false/,
      /PRODUCTION_DIGITAL_TWIN_READY = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.10\.0-solver-capabilities-draft"/);
    expect(version).toMatch(/FIRST_REAL_SOLVER_ID = "calculix"/);
    expect(version).toMatch(/EXTERNAL_SOLVER_COUNT_CERTIFIED = 1/);
  });

  it("pins Phase 12H certified baseline", () => {
    expect(read(VERSION)).toContain(PHASE_12H_COMMIT);
    expect(read(VERSION)).toMatch(/PHASE_12H_HOSTED_RUN = "31263802033"/);
    expect(read(VERSION)).toMatch(/PHASE_12H_VERSION = "0\.8\.0-simulation-assurance"/);
  });

  it("includes solver domain modules, batch_82, and outbox_events", () => {
    for (const file of [
      `${DT}/src/domain/solvers/engineering-solver-adapter.ts`,
      `${DT}/src/domain/solvers/calculix-adapter.ts`,
      `${DT}/src/domain/solvers/solver-benchmarks.ts`,
      `${DT}/fixtures/calculix/axial-bar-linear-elastic.inp`,
      BATCH_82,
      `${CERT}/src/phase12i/gates.ts`,
      RUNNER,
      WORKFLOW,
      "docs/architecture/DIGITAL_TWIN_EXTERNAL_SOLVER_ADAPTER_MODEL.md",
      "docs/architecture/DIGITAL_TWIN_PHASE_12I_EXTERNAL_SOLVER.md",
      "docs/architecture/DIGITAL_TWIN_PHASE_12I_FIRST_SOLVER_SELECTION.md",
      "docs/architecture/DIGITAL_TWIN_SOLVER_LICENSE_GOVERNANCE.md",
      "apps/web/src/app/api/engineering/digital-twin/solver-providers/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/solver-runs/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx",
      `${CERT}/playwright/external-solver.spec.ts`,
      `${DT}/tests/phase12i-digital-twin-external-solver.test.ts`,
    ]) {
      expect(present(file), file).toBe(true);
    }
    expect(present(BATCH_81)).toBe(true);
    const batch82 = read(BATCH_82);
    const batch82Sql = batch82.replace(/--[^\n]*/g, "");
    expect(batch82Sql).toContain("digital_twin_outbox_events");
    expect(batch82Sql).not.toMatch(/\bdigital_twin_outbox\b(?!_events)/);
  });

  it("keeps CalculiX adapter and batch_82 intact for 12I evidence", () => {
    expect(present(`${DT}/src/domain/solvers/calculix-adapter.ts`)).toBe(true);
    expect(present(BATCH_82)).toBe(true);
  });

  it("keeps V1 asset intelligence pin intact in version module", () => {
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
  });
});
