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
const GATES = `${CERT}/src/phase12k/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12k-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12k-digital-twin-digital-thread.yml";
const BATCH_84 =
  "supabase/migrations/20260808230000_batch_84_digital_twin_digital_thread.sql";
const BATCH_83 =
  "supabase/migrations/20260808220000_batch_83_digital_twin_solver_capabilities.sql";

const PHASE_12J_COMMIT = "b9c9a911e96e490022248badd99630ddc8cacb2f";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";

describe("Phase 12K Digital Twin digital thread", () => {
  it("defines exactly 82 gates (A–CD)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(82);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("CD");
    expect(new Set(ids).size).toBe(82);
  });

  it("declares digital thread version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.11\.0-digital-thread"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "digital_thread"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12K"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.11\.0-digital-thread"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.11\.0-digital-thread"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12k/);
    expect(read(`${CERT}/package.json`)).toMatch(/test:e2e:digital-thread/);
  });

  it("enables thread flags and preserves 12J/12I evidence", () => {
    const version = read(VERSION);
    for (const enabled of [
      /DIGITAL_THREAD_INTELLIGENCE_READY = true/,
      /PROVENANCE_READY = true/,
      /INTEGRITY_ASSESSMENT_READY = true/,
      /TEMPORAL_TRAVERSAL_READY = true/,
      /CHANGE_SET_READY = true/,
      /KNOWLEDGE_GRAPH_REUSE_READY = true/,
      /SOLVER_CAPABILITY_REGISTRY_READY = true/,
      /FOUR_LAYER_QUALIFICATION_INTACT = true/,
      /REAL_SOLVER_EXECUTION_CERTIFIED = true/,
      /CALCULIX_ADAPTER_INTACT = true/,
      /PHASE_12J_READY = true/,
      /PHASE_12K_READY = true/,
      /PHASE_12L_READY = true/,
    ]) {
      expect(version, String(enabled)).toMatch(enabled);
    }
    for (const lock of [
      /DUPLICATE_KNOWLEDGE_GRAPH_DETECTED = false/,
      /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/,
      /PREDICTIVE_TWIN_IMPLEMENTED = false/,
      /SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/,
      /PRODUCTION_DIGITAL_TWIN_READY = false/,
      /physicalActuationImplemented = false/,
      /probabilityOfFailureImplemented = false/,
      /rulImplemented = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.11\.0-digital-thread-draft"/);
  });

  it("pins Phase 12J certified baseline", () => {
    expect(read(VERSION)).toContain(PHASE_12J_COMMIT);
    expect(read(VERSION)).toMatch(/PHASE_12J_HOSTED_RUN = "31267810968"/);
    expect(read(VERSION)).toMatch(/PHASE_12J_VERSION = "0\.10\.0-solver-capabilities"/);
  });

  it("includes thread domain modules, batch_84, and outbox_events", () => {
    for (const file of [
      `${DT}/src/domain/digital-thread-intelligence-engine.ts`,
      `${DT}/src/domain/digital-thread-taxonomy.ts`,
      `${DT}/src/domain/digital-thread-provenance.ts`,
      `${DT}/src/domain/digital-thread-change-set.ts`,
      `${DT}/src/domain/digital-thread-integrity.ts`,
      BATCH_84,
      GATES,
      RUNNER,
      WORKFLOW,
      "docs/architecture/DIGITAL_TWIN_DIGITAL_THREAD_INTELLIGENCE.md",
      "docs/architecture/DIGITAL_TWIN_PHASE_12K_DIGITAL_THREAD.md",
      "apps/web/src/app/api/engineering/digital-twin/digital-threads/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/digital-thread-as-of/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx",
      `${CERT}/playwright/digital-thread.spec.ts`,
      `${DT}/tests/phase12k-digital-twin-digital-thread.test.ts`,
    ]) {
      expect(present(file), file).toBe(true);
    }
    expect(present(BATCH_83)).toBe(true);
    const batch84 = read(BATCH_84);
    const batch84Sql = batch84.replace(/--[^\n]*/g, "");
    expect(batch84Sql).toContain("digital_twin_outbox_events");
    expect(batch84Sql).not.toMatch(/\bdigital_twin_outbox\b(?!_events)/);
    expect(batch84Sql).toContain("profile_id");
    expect(batch84Sql).toContain("thread_snapshot_id");
    expect(batch84Sql).toContain("provenance_id");
    expect(batch84Sql).toContain("integrity_id");
    expect(batch84Sql).toContain("change_set_id");
  });

  it("does not start Phase 12L domain implementation", () => {
    expect(present(`${DT}/src/domain/phase12l`)).toBe(false);
  });

  it("keeps V1 asset intelligence pin intact in version module", () => {
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
  });
});
