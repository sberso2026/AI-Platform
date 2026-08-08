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
const GATES = `${CERT}/src/phase12e/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12e-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12e-digital-twin-telemetry-binding.yml";
const BATCH_78 = "supabase/migrations/20260808170000_batch_78_digital_twin_telemetry_binding.sql";
const BATCH_77 = "supabase/migrations/20260808160000_batch_77_digital_twin_state_ingestion.sql";

const PHASE_12D_COMMIT = "3e387f4b76cbd9c80b274585c7b78821482f496d";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";

describe("Phase 12E Digital Twin telemetry binding", () => {
  it("defines exactly 61 gates (A–BI)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(61);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("BI");
    expect(new Set(ids).size).toBe(61);
  });

  it("declares telemetry binding version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.5\.0-telemetry-binding"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "telemetry_binding"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12E"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.5\.0-telemetry-binding"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.5\.0-telemetry-binding"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12e/);
  });

  it("enables telemetry binding with bounded live telemetry and AI ownership", () => {
    const version = read(VERSION);
    for (const enabled of [
      /TWIN_TELEMETRY_BINDING_READY = true/,
      /TWIN_TELEMETRY_PROJECTION_READY = true/,
      /ENGINEERING_TIME_SERIES_REUSE_READY = true/,
      /LIVE_TELEMETRY_IMPLEMENTED = true/,
      /PHASE_12F_READY = true/,
      /ENGINEERING_TIME_SERIES_OWNERSHIP = "asset_intelligence"/,
    ]) {
      expect(version, String(enabled)).toMatch(enabled);
    }
    for (const lock of [
      /AUTOMATIC_TELEMETRY_STATE_PUBLICATION_ENABLED = false/,
      /HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED = false/,
      /TELEMETRY_HISTORIAN_IMPLEMENTED = false/,
      /SENSOR_REGISTRY_IMPLEMENTED = false/,
      /SHM_SIGNAL_PROCESSING_IMPLEMENTED = false/,
      /DUPLICATE_TIME_SERIES_PLANE_DETECTED = false/,
      /PRODUCTION_DIGITAL_TWIN_READY = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.5\.0-telemetry-binding-draft"/);
  });

  it("pins Phase 12D certified baseline", () => {
    expect(read(VERSION)).toContain(PHASE_12D_COMMIT);
    expect(read(VERSION)).toMatch(/PHASE_12D_HOSTED_RUN = "31257741414"/);
    expect(read(VERSION)).toMatch(/PHASE_12D_VERSION = "0\.4\.0-ingestion"/);
  });

  it("includes telemetry domain modules and batch_78", () => {
    for (const file of [
      `${DT}/src/domain/telemetry-source.ts`,
      `${DT}/src/domain/telemetry-binding.ts`,
      `${DT}/src/domain/time-series-read-port.ts`,
      `${DT}/src/domain/telemetry-projection-engine.ts`,
      BATCH_78,
      `${CERT}/src/phase12e/gates.ts`,
      RUNNER,
      WORKFLOW,
      "docs/architecture/DIGITAL_TWIN_TELEMETRY_MODEL.md",
      "docs/architecture/DIGITAL_TWIN_ENGINEERING_TIMESERIES_RECONCILIATION.md",
      "docs/architecture/DIGITAL_TWIN_LIVE_STATE_SEMANTICS.md",
      "docs/architecture/DIGITAL_TWIN_PHASE_12E_TELEMETRY_BINDING.md",
      "apps/web/src/app/api/engineering/digital-twin/telemetry-sources/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/telemetry-bindings/route.ts",
      "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx",
      `${CERT}/playwright/telemetry-binding.spec.ts`,
      `${DT}/tests/phase12e-digital-twin-telemetry-binding.test.ts`,
    ]) {
      expect(present(file), file).toBe(true);
    }
    expect(present(BATCH_77)).toBe(true);
  });

  it("preserves Asset Intelligence V1 commit pin", () => {
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
  });
});
