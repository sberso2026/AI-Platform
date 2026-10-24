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
const GATES = `${CERT}/src/phase12j/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12j-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12j-digital-twin-solver-capabilities.yml";
const BATCH_83 =
  "supabase/migrations/20260808220000_batch_83_digital_twin_solver_capabilities.sql";
const BATCH_82 =
  "supabase/migrations/20260808210000_batch_82_digital_twin_solver_adapters.sql";

const PHASE_12I_COMMIT = "6989d310a91b04db5949954a57db060782dd8dec";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";

describe("Phase 12J Digital Twin solver capabilities", () => {
  it("defines exactly 78 gates (A–BZ)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(78);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("BZ");
    expect(new Set(ids).size).toBe(78);
  });

  it("declares solver capabilities version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.11\.0-digital-thread"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "digital_thread"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12K"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.11\.0-digital-thread"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.11\.0-digital-thread"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12j/);
    expect(read(`${CERT}/package.json`)).toMatch(/test:e2e:solver-capabilities/);
  });

  it("enables capability flags and preserves 12I / forbids silent fallback", () => {
    const version = read(VERSION);
    for (const enabled of [
      /SOLVER_CAPABILITY_REGISTRY_READY = true/,
      /PROVIDER_COMPATIBILITY_MATRIX_READY = true/,
      /CAPABILITY_DISCOVERY_READY = true/,
      /SIMULATION_PACKAGE_EXTENDED = true/,
      /FOUR_LAYER_QUALIFICATION_INTACT = true/,
      /REAL_SOLVER_EXECUTION_CERTIFIED = true/,
      /CALCULIX_ADAPTER_INTACT = true/,
      /EXTERNAL_SOLVER_ADAPTER_FRAMEWORK_READY = true/,
      /PHASE_12I_READY = true/,
      /PHASE_12J_READY = true/,
      /PHASE_12K_READY = true/,
    ]) {
      expect(version, String(enabled)).toMatch(enabled);
    }
    for (const lock of [
      /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/,
      /SILENT_SOLVER_FALLBACK_ALLOWED = false/,
      /silentSolverFallbackAllowed = false/,
      /SIMULATION_OPTIMIZATION_IMPLEMENTED = false/,
      /PREDICTIVE_TWIN_IMPLEMENTED = false/,
      /SHM_RUNTIME_IMPLEMENTED = false/,
      /DUPLICATE_SOLVER_OWNERSHIP_DETECTED = false/,
      /SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/,
      /PRODUCTION_DIGITAL_TWIN_READY = false/,
      /physicalActuationImplemented = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.11\.0-digital-thread-draft"/);
  });

  it("pins Phase 12I certified baseline", () => {
    expect(read(VERSION)).toContain(PHASE_12I_COMMIT);
    expect(read(VERSION)).toMatch(/PHASE_12I_HOSTED_RUN = "31265781321"/);
    expect(read(VERSION)).toMatch(/PHASE_12I_VERSION = "0\.9\.0-external-solver"/);
  });

  it("includes capability domain modules, batch_83, and outbox_events", () => {
    for (const file of [
      `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
      `${DT}/src/domain/solvers/solver-capability-qualification.ts`,
      `${DT}/src/domain/solvers/solver-provider-compatibility-matrix.ts`,
      `${DT}/src/domain/solvers/engineering-capability-discovery.ts`,
      `${DT}/src/domain/solvers/capability-review.ts`,
      `${DT}/src/domain/solvers/calculix-adapter.ts`,
      BATCH_83,
      `${CERT}/src/phase12j/gates.ts`,
      RUNNER,
      WORKFLOW,
      "docs/architecture/DIGITAL_TWIN_SOLVER_CAPABILITY_REGISTRY.md",
      "docs/architecture/DIGITAL_TWIN_PHASE_12J_SOLVER_CAPABILITIES.md",
      "apps/web/src/app/api/engineering/digital-twin/solver-capabilities/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/capability-discovery/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx",
      `${CERT}/playwright/solver-capabilities.spec.ts`,
      `${DT}/tests/phase12j-digital-twin-solver-capabilities.test.ts`,
    ]) {
      expect(present(file), file).toBe(true);
    }
    expect(present(BATCH_82)).toBe(true);
    const batch83 = read(BATCH_83);
    const batch83Sql = batch83.replace(/--[^\n]*/g, "");
    expect(batch83Sql).toContain("digital_twin_outbox_events");
    expect(batch83Sql).not.toMatch(/\bdigital_twin_outbox\b(?!_events)/);
    expect(batch83Sql).toContain("capability_id");
    expect(batch83Sql).toContain("capability_version_id");
    expect(batch83Sql).toContain("compatibility_id");
    expect(batch83Sql).toContain("capability_qualification_id");
  });

  it("does not start Phase 12K domain implementation", () => {
    expect(present(`${DT}/src/domain/phase12k`)).toBe(false);
  });

  it("keeps V1 asset intelligence pin intact in version module", () => {
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
  });
});
