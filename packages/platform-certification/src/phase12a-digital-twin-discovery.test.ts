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
const GATES = `${CERT}/src/phase12a/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12a-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12a-digital-twin-discovery.yml";

const PROJECT_CONTROLS_V1_COMMIT = "b17fe4cfe2574520ec813a7b43ba7328a585d741";
const ASSET_INTELLIGENCE_V1_COMMIT = "925e2ed74025cac6a145c346c17c53320efb8757";

describe("Phase 12A Digital Twin discovery", () => {
  it("defines exactly 39 gates (Aâ€“AM)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(39);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("AM");
    expect(new Set(ids).size).toBe(39);
  });

  it("declares the discovery version and status", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_PRODUCT_NAME = "Digital Twin"/);
    expect(version).toMatch(/DIGITAL_TWIN_MODULE_KEY = "digital_twin"/);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "0\.1\.0-discovery"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "discovery"/);
    expect(version).toMatch(/DIGITAL_TWIN_PHASE = "12A"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.1\.0-discovery"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.1\.0-discovery"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12a/);
  });

  it("keeps every Digital Twin product lock closed", () => {
    const version = read(VERSION);
    for (const lock of [
      /DIGITAL_TWIN_IMPLEMENTED = false/,
      /PRODUCTION_DIGITAL_TWIN_READY = false/,
      /DIGITAL_TWIN_RUNTIME_IMPLEMENTED = false/,
      /LIVE_TELEMETRY_IMPLEMENTED = false/,
      /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/,
      /THREE_D_VIEWER_IMPLEMENTED = false/,
      /PHYSICAL_ACTUATION_ENABLED = false/,
      /AUTOMATIC_CONTROL_ENABLED = false/,
      /IMPLEMENTS_OWN_AI_STACK = false/,
      /DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED = false/,
      /DIGITAL_TWIN_PRODUCT_UI_IMPLEMENTED = false/,
      /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/,
      /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
    expect(version).toMatch(/DIGITAL_TWIN_DISCOVERY_IMPLEMENTED = true/);
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.1\.0-draft"/);
  });

  it("locks ownership without claiming canonical identity", () => {
    const version = read(VERSION);
    expect(version).toMatch(/DIGITAL_TWIN_OWNERSHIP = "digital_twin"/);
    expect(version).toMatch(/TWIN_STATE_OWNERSHIP = "digital_twin"/);
    expect(version).toMatch(/CANONICAL_ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/);
    expect(version).toMatch(/CANONICAL_PROJECT_IDENTITY_OWNERSHIP =/);
    expect(version).toMatch(/engineering_os_shared_project_domain/);
    expect(version).toMatch(/SENSOR_STREAM_OWNERSHIP = "shm"/);
    expect(version).toMatch(/TWIN_MAY_NOT_CLAIM_ASSET_IDENTITY = true/);
    expect(version).toMatch(/TWIN_MAY_NOT_CLAIM_PROJECT_IDENTITY = true/);

    const lock = read(OWNERSHIP_LOCK);
    expect(lock).toMatch(/export function assertOwnershipLock/);
    expect(lock).toMatch(/DIGITAL_TWIN_OWNERSHIP_MATRIX/);
    expect(lock).toMatch(/digital_twin_may_not_claim_canonical_identity/);
    expect(lock).toMatch(/digital_twin_may_not_own_asset_identity/);
    expect(lock).toMatch(/digital_twin_product_forbidden_in_phase_12a/);
    expect(lock).toMatch(/digital_twin_runtime_forbidden_in_phase_12a/);
    expect(lock).toMatch(/actuation_and_control_forbidden_in_phase_12a/);
  });

  it("contains no runtime services in the discovery package", () => {
    for (const rel of [
      `${DT}/src/services`,
      `${DT}/src/runtime`,
      `${DT}/src/telemetry`,
      `${DT}/src/simulation`,
      `${DT}/src/viewer`,
      `${DT}/src/engines`,
      `${DT}/src/api`,
      `${DT}/manifest`,
      `${DT}/migrations`,
    ]) {
      expect(present(rel), rel).toBe(false);
    }
    const index = read(`${DT}/src/index.ts`);
    expect(index).toMatch(/\.\/version/);
    expect(index).toMatch(/\.\/architecture\/ownership-lock/);
    expect(index).toMatch(/\.\/domain\/draft-contracts/);
  });

  it("ships no Digital Twin product UI or API surface", () => {
    for (const rel of [
      "apps/web/src/app/(platform)/engineering/apps/digital-twin",
      "apps/web/src/app/api/engineering/digital-twin",
      "apps/web/src/components/engineering/digital-twin-shell.tsx",
    ]) {
      expect(present(rel), rel).toBe(false);
    }
  });

  it("leaves the Engineering OS module registry entry at coming_soon", () => {
    const registry = read("packages/engineering-os/src/module-registry.ts");
    const start = registry.indexOf('id: "digital_twin"');
    expect(start).toBeGreaterThan(-1);
    const entry = registry.slice(start, registry.indexOf("\n  {", start));
    expect(entry).toMatch(/status: "coming_soon"/);
    expect(entry).toMatch(/enabled: false/);
    expect(entry).toMatch(/version: "0\.0\.0"/);
  });

  it("ships the Phase 12A discovery documents", () => {
    for (const rel of [
      "docs/architecture/DIGITAL_TWIN_PHASE_12A_EXISTING_FOOTPRINT.md",
      "docs/architecture/DIGITAL_TWIN_TERMINOLOGY.md",
      "docs/architecture/DIGITAL_TWIN_OWNERSHIP_MATRIX.md",
      "docs/architecture/DIGITAL_TWIN_FIDELITY_MODEL.md",
      "docs/architecture/DIGITAL_THREAD_MODEL.md",
      "docs/architecture/DIGITAL_TWIN_SPATIAL_BOUNDARY.md",
      "docs/architecture/DIGITAL_TWIN_ASSET_INTELLIGENCE_BOUNDARY.md",
      "docs/architecture/DIGITAL_TWIN_SHM_BOUNDARY.md",
      "docs/architecture/DIGITAL_TWIN_PHASE_12A_CAPABILITY_MATRIX.md",
      "docs/architecture/DIGITAL_TWIN_PHASE_12A_DISCOVERY.md",
      "docs/contracts/DIGITAL_TWIN_PUBLIC_CONTRACTS_DRAFT.md",
      "docs/architecture/DIGITAL_TWIN_TELEMETRY_AND_TIMESERIES_ADR.md",
    ]) {
      expect(present(rel), rel).toBe(true);
    }

    expect(read("docs/architecture/DIGITAL_TWIN_PHASE_12A_EXISTING_FOOTPRINT.md")).toMatch(
      /## Confirmed absences before Phase 12A/,
    );
    expect(read("docs/architecture/DIGITAL_TWIN_PHASE_12A_DISCOVERY.md")).toMatch(
      /## Phase 12B readiness/,
    );
    expect(read("docs/architecture/DIGITAL_TWIN_TERMINOLOGY.md")).toMatch(
      /Twin references canonical entity/,
    );
  });

  it("pins frozen V1 baselines everywhere", () => {
    expect(read(VERSION)).toContain(PROJECT_CONTROLS_V1_COMMIT);
    expect(read(VERSION)).toContain(ASSET_INTELLIGENCE_V1_COMMIT);
    expect(read(VERSION)).toMatch(/PROJECT_CONTROLS_V1_TAG = "project-controls-v1\.0\.0"/);
    expect(read(VERSION)).toMatch(/ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1\.0\.0"/);
    expect(read(GATES)).toContain(PROJECT_CONTROLS_V1_COMMIT);
    expect(read(RUNNER)).toContain("PHASE_12A_PROJECT_CONTROLS_V1_COMMIT");
    expect(read(WORKFLOW)).toContain(PROJECT_CONTROLS_V1_COMMIT);
    expect(read(RUNNER)).not.toMatch(/git tag/);
  });

  it("preserves kernel twin foundation without product migrations", () => {
    expect(present("packages/platform-kernel/src/digital-twin/digital-twin-service.ts")).toBe(
      true,
    );
    expect(read(VERSION)).toMatch(/DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED = false/);
  });

  it("ships the certification runner, secret scan and workflow", () => {
    for (const rel of [
      GATES,
      RUNNER,
      `${CERT}/scripts/secret-exposure-scan.ts`,
      `${DT}/tests/discovery-lock.test.ts`,
      `${DT}/tsconfig.json`,
      WORKFLOW,
    ]) {
      expect(present(rel), rel).toBe(true);
    }

    const workflow = read(WORKFLOW);
    expect(workflow).toMatch(/NODE_VERSION: "22"/);
    expect(workflow).toMatch(/certify:phase12a/);
    expect(workflow).toMatch(/requiredGates\.length===39/);
    expect(workflow).toMatch(/a\.productionDigitalTwinReady===false/);
    expect(workflow).toMatch(/a\.version==="0\.1\.0-discovery"/);
    expect(workflow).toMatch(/git fetch --tags --force/);
  });
});
