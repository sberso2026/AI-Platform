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
const GATES = `${CERT}/src/phase12d/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12d-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12d-digital-twin-ingestion.yml";
const BATCH_77 = "supabase/migrations/20260808160000_batch_77_digital_twin_state_ingestion.sql";
const BATCH_76 = "supabase/migrations/20260808150000_batch_76_digital_twin_state.sql";
const BATCH_75 = "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql";

const PHASE_12C_COMMIT = "07b5ccc843395bd02633163dc654668da9f17658";
const PROJECT_CONTROLS_V1_COMMIT = "b17fe4cfe2574520ec813a7b43ba7328a585d741";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";

describe("Phase 12D Digital Twin ingestion", () => {
  it("defines exactly 51 gates (A–AY)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(51);
    expect(ids[0]).toBe("A");
    expect(ids[ids.length - 1]).toBe("AY");
    expect(new Set(ids).size).toBe(51);
  });

  it("declares the ingestion version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.8\.0-simulation-assurance"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "simulation_assurance"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12H"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.8\.0-simulation-assurance"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.8\.0-simulation-assurance"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12d/);
  });

  it("enables ingestion capabilities with bounded runtime", () => {
    const version = read(VERSION);
    for (const enabled of [
      /TWIN_STATE_INGESTION_READY = true/,
      /TWIN_SOURCE_ADAPTER_READY = true/,
      /TWIN_STATE_RECONCILIATION_READY = true/,
      /DIGITAL_TWIN_RUNTIME_IMPLEMENTED = true/,
      /PHASE_12E_READY = true/,
    ]) {
      expect(version, String(enabled)).toMatch(enabled);
    }
    for (const lock of [
      /AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED = false/,
      /LIVE_TELEMETRY_IMPLEMENTED = false/,
      /HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED = false/,
      /SHM_RUNTIME_IMPLEMENTED = false/,
      /PRODUCTION_DIGITAL_TWIN_READY = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.8\.0-simulation-assurance-draft"/);
  });

  it("pins Phase 12C certified baseline", () => {
    expect(read(VERSION)).toContain(PHASE_12C_COMMIT);
    expect(read(VERSION)).toMatch(/PHASE_12C_HOSTED_RUN = "31256556800"/);
    expect(read(VERSION)).toMatch(/PHASE_12C_VERSION = "0\.3\.0-state"/);
  });

  it("includes ingestion domain modules and batch_77", () => {
    for (const file of [
      `${DT}/src/domain/source-adapter.ts`,
      `${DT}/src/domain/state-ingestion-engine.ts`,
      `${DT}/src/domain/state-reconciliation.ts`,
      `${DT}/src/domain/observed-state-candidate.ts`,
      BATCH_77,
      `${CERT}/src/phase12d/gates.ts`,
      RUNNER,
      WORKFLOW,
      "docs/architecture/DIGITAL_TWIN_PHASE_12D_INGESTION.md",
      "docs/architecture/DIGITAL_TWIN_SOURCE_AUTHORITY_MODEL.md",
      "apps/web/src/app/api/engineering/digital-twin/adapters/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/ingestion/route.ts",
      "apps/web/src/app/api/engineering/digital-twin/ingestion-health/route.ts",
    ]) {
      expect(present(file), file).toBe(true);
    }
    expect(present(BATCH_75)).toBe(true);
    expect(present(BATCH_76)).toBe(true);
  });

  it("preserves V1 tag commit pins", () => {
    const version = read(VERSION);
    expect(version).toContain(PROJECT_CONTROLS_V1_COMMIT);
    expect(version).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
  });

  it("ownership lock requires ingestion draft contracts", () => {
    expect(read(OWNERSHIP_LOCK)).toMatch(/0\.4\.0-ingestion-draft/);
    expect(read(OWNERSHIP_LOCK)).toMatch(/digital_twin_bounded_runtime_required_in_phase_12d/);
  });
});
