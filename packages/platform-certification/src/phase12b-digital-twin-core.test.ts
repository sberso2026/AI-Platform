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
const OWNERSHIP_LOCK = `${DT}/src/architecture/ownership-lock.ts`;
const GATES = `${CERT}/src/phase12b/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12b-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12b-digital-twin-core.yml";
const BATCH_75 = "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql";

const PROJECT_CONTROLS_V1_COMMIT = "b17fe4cfe2574520ec813a7b43ba7328a585d741";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";
const PHASE_12A_COMMIT = "2c5ed03f7de12cde9bfb71a9d430f5e342291303";

describe("Phase 12B Digital Twin core", () => {
  it("defines exactly 50 gates (Aâ€“AX)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(50);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("AX");
    expect(new Set(ids).size).toBe(50);
  });

  it("declares the core version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.2\.0-core"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "core"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12B"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.2\.0-core"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.2\.0-core"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12b/);
  });

  it("enables core capabilities while forbidding runtime", () => {
    const version = read(VERSION);
    for (const enabled of [
      /DIGITAL_TWIN_IMPLEMENTED = true/,
      /TWIN_IDENTITY_READY = true/,
      /TWIN_REPRESENTATION_READY = true/,
      /TWIN_THREAD_READY = true/,
      /KNOWLEDGE_GRAPH_REUSE = true/,
      /HOSTED_PERSISTENCE_READY = true/,
      /DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED = true/,
      /PHASE_12C_READY = true/,
    ]) {
      expect(version, String(enabled)).toMatch(enabled);
    }
    for (const lock of [
      /PRODUCTION_DIGITAL_TWIN_READY = false/,
      /DIGITAL_TWIN_RUNTIME_IMPLEMENTED = false/,
      /LIVE_TELEMETRY_IMPLEMENTED = false/,
      /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/,
      /THREE_D_VIEWER_IMPLEMENTED = false/,
      /PHYSICAL_ACTUATION_ENABLED = false/,
      /AUTOMATIC_CONTROL_ENABLED = false/,
      /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.2\.0-core-draft"/);
    expect(version).toMatch(/DIGITAL_TWIN_IDENTITY_REVIEW_SLUG = "digital_twin\.identity_review"/);
  });

  it("pins Phase 12A certified baseline", () => {
    expect(read(VERSION)).toContain(PHASE_12A_COMMIT);
    expect(read(VERSION)).toMatch(/PHASE_12A_HOSTED_RUN = "31253197987"/);
    expect(read(VERSION)).toMatch(/PHASE_12A_VERSION = "0\.1\.0-discovery"/);
  });

  it("locks ownership for core slice", () => {
    const lock = read(OWNERSHIP_LOCK);
    expect(lock).toMatch(/digital_twin_core_must_be_implemented_in_phase_12b/);
    expect(lock).toMatch(/digital_twin_runtime_forbidden_in_phase_12b/);
    expect(lock).toMatch(/product_tables_must_be_introduced_in_phase_12b/);
  });

  it("ships core domain modules", () => {
    for (const rel of [
      `${DT}/src/domain/identity.ts`,
      `${DT}/src/domain/representation.ts`,
      `${DT}/src/domain/state.ts`,
      `${DT}/src/domain/thread.ts`,
      `${DT}/src/domain/relationships.ts`,
      `${DT}/src/domain/events.ts`,
      `${DT}/src/domain/review-workflow.ts`,
      `${DT}/src/domain/twin-engine.ts`,
      `${DT}/src/domain/engine.ts`,
      `${DT}/src/domain/persistence.ts`,
      `${DT}/src/domain/postgres-repository.ts`,
      `${DT}/src/domain/repository-factory.ts`,
      `${DT}/src/domain/public-contracts-core.ts`,
    ]) {
      expect(present(rel), rel).toBe(true);
    }
  });

  it("ships batch_75 migration with RLS and forbid constraints", () => {
    expect(present(BATCH_75)).toBe(true);
    const migration = read(BATCH_75);
    expect(migration).toMatch(/digital_twin_identities/);
    expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(migration).toMatch(/dt_identity_no_live_telemetry/);
    expect(migration).not.toMatch(/DROP TABLE.*digital_twins/);
    expect(migration).not.toMatch(/digital_twin_telemetry/);
  });

  it("ships lookup HTTP routes without telemetry", () => {
    for (const rel of [
      "apps/web/src/app/api/engineering/digital-twin/identity/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/representation/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/thread/route.ts",
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(present("apps/web/src/app/api/engineering/digital-twin/telemetry")).toBe(false);
  });

  it("pins frozen V1 baselines", () => {
    expect(read(VERSION)).toContain(PROJECT_CONTROLS_V1_COMMIT);
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
    expect(read(GATES)).toContain(PROJECT_CONTROLS_V1_COMMIT);
    expect(read(RUNNER)).toContain("PHASE_12A_CERTIFIED_COMMIT");
    expect(read(WORKFLOW)).toContain("0.2.0-core");
  });

  it("ships certification runner, secret scan and workflow", () => {
    for (const rel of [
      GATES,
      RUNNER,
      `${CERT}/scripts/secret-exposure-scan.ts`,
      `${DT}/tests/phase12b-digital-twin-core.test.ts`,
      "docs/architecture/DIGITAL_TWIN_PHASE_12B_CORE.md",
      WORKFLOW,
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(read(WORKFLOW)).toMatch(/certify:phase12b/);
    expect(read(WORKFLOW)).toMatch(/requiredGates\.length===50/);
    expect(read(WORKFLOW)).toMatch(/a\.twinIdentityReady===true/);
    expect(read(WORKFLOW)).toMatch(/a\.phase12CReady===true/);
  });
});
