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
const GATES = `${CERT}/src/phase12f/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12f-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12f-digital-twin-representation.yml";
const BATCH_79 = "supabase/migrations/20260808180000_batch_79_digital_twin_representation_mapping.sql";
const BATCH_78 = "supabase/migrations/20260808170000_batch_78_digital_twin_telemetry_binding.sql";

const PHASE_12E_COMMIT = "b871e8c3eb9e1293604610bacdd410ecb4da5684";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";

describe("Phase 12F Digital Twin representation", () => {
  it("defines exactly 60 gates (A–BH)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(60);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("BH");
    expect(new Set(ids).size).toBe(60);
  });

  it("declares representation version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.6\.0-representation"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "representation"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12F"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.6\.0-representation"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.6\.0-representation"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12f/);
  });

  it("enables representation mapping with navigation and forbids viewer/auto-approve", () => {
    const version = read(VERSION);
    for (const enabled of [
      /TWIN_REPRESENTATION_MAPPING_READY = true/,
      /TWIN_REPRESENTATION_NAVIGATION_READY = true/,
      /REPRESENTATION_NAVIGATION_IMPLEMENTED = true/,
      /PHASE_12G_READY = true/,
      /ENGINEERING_TIME_SERIES_OWNERSHIP = "asset_intelligence"/,
    ]) {
      expect(version, String(enabled)).toMatch(enabled);
    }
    for (const lock of [
      /AUTOMATIC_REPRESENTATION_MAPPING_APPROVAL_ENABLED = false/,
      /THREE_D_VIEWER_IMPLEMENTED = false/,
      /DUPLICATE_MODEL_OWNERSHIP_DETECTED = false/,
      /TELEMETRY_HISTORIAN_IMPLEMENTED = false/,
      /SHM_RUNTIME_IMPLEMENTED = false/,
      /SIMULATION_EXECUTION_IMPLEMENTED = false/,
      /PRODUCTION_DIGITAL_TWIN_READY = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.6\.0-representation-draft"/);
  });

  it("pins Phase 12E certified baseline", () => {
    expect(read(VERSION)).toContain(PHASE_12E_COMMIT);
    expect(read(VERSION)).toMatch(/PHASE_12E_HOSTED_RUN = "31260082507"/);
    expect(read(VERSION)).toMatch(/PHASE_12E_VERSION = "0\.5\.0-telemetry-binding"/);
  });

  it("includes representation domain modules and batch_79", () => {
    for (const file of [
      `${DT}/src/domain/representation-source.ts`,
      `${DT}/src/domain/representation-mapping.ts`,
      `${DT}/src/domain/spatial-reference.ts`,
      `${DT}/src/domain/representation-navigation.ts`,
      BATCH_79,
      `${CERT}/src/phase12f/gates.ts`,
      RUNNER,
      WORKFLOW,
      "docs/architecture/DIGITAL_TWIN_REPRESENTATION_MODEL.md",
      "docs/architecture/DIGITAL_TWIN_SPATIAL_MODEL_RECONCILIATION.md",
      "docs/architecture/DIGITAL_TWIN_PHASE_12F_REPRESENTATION.md",
      "apps/web/src/app/api/engineering/digital-twin/representation-sources/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/representation-mappings/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx",
      `${CERT}/playwright/representation.spec.ts`,
      `${DT}/tests/phase12f-digital-twin-representation.test.ts`,
    ]) {
      expect(present(file), file).toBe(true);
    }
    expect(present(BATCH_78)).toBe(true);
  });

  it("preserves Asset Intelligence V1 commit pin", () => {
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
  });
});
