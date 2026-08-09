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

const EMI = "packages/engineering-model-interoperability";
const CERT = "packages/engineering-model-interoperability-certification";
const DT = "packages/digital-twin";
const VERSION = `${EMI}/src/version.ts`;
const DT_VERSION = `${DT}/src/version.ts`;
const GATES = `${CERT}/src/phase13a/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase13a-certification.ts`;
const WORKFLOW = ".github/workflows/phase-13a-engineering-interoperability-discovery.yml";

describe("Phase 13A Engineering Model Interoperability discovery", () => {
  it("defines exactly 57 gates (A–BE)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(57);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("BE");
    expect(new Set(ids).size).toBe(57);
  });

  it("declares discovery version without mutating Digital Twin V1", () => {
    expect(read(VERSION)).toMatch(
      /ENGINEERING_MODEL_INTEROPERABILITY_VERSION\s*=\s*"0\.1\.0-interop-discovery"/,
    );
    expect(read(`${EMI}/package.json`)).toMatch(/"version": "0\.1\.0-interop-discovery"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.1\.0-interop-discovery"/);
    expect(read(DT_VERSION)).toMatch(/DIGITAL_TWIN_VERSION = "1\.0\.0"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "1\.0\.0"/);
    expect(present(`${DT}/src/domain/phase13a`)).toBe(false);
  });

  it("locks honest interoperability flags", () => {
    const version = read(VERSION);
    expect(version).toMatch(/INTEROP_DISCOVERY_READY = true/);
    expect(version).toMatch(/ENGINEERING_FEDERATION_MODEL_LOCKED = true/);
    expect(version).toMatch(/MODEL_FEDERATION_BOUNDARY_LOCKED = true/);
    expect(version).toMatch(/RESULT_FEDERATION_BOUNDARY_LOCKED = true/);
    expect(version).toMatch(/SOLVER_EXECUTION_BOUNDARY_LOCKED = true/);
    expect(version).toMatch(/IFC_FIRST_CLASS_INTEROPERABILITY_RESERVED = true/);
    expect(version).toMatch(/ETABS_INTEGRATION_DISCOVERED = true/);
    expect(version).toMatch(/SPACE_GASS_INTEGRATION_DISCOVERED = true/);
    expect(version).toMatch(/PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED = false/);
    expect(version).toMatch(/AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED = false/);
    expect(version).toMatch(/DUPLICATE_TOOL_FRAMEWORK_DETECTED = false/);
    expect(version).toMatch(/SOURCE_MODEL_OWNERSHIP_PRESERVED = true/);
    expect(version).toMatch(/DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/DUPLICATE_SPATIAL_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/PHASE_13B_READY = true/);
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.1\.0-draft"/);
    expect(version).toMatch(
      /DIGITAL_TWIN_V1_COMMIT =\s*"a94425ed009ca087c2f44c9d3757c0c82bd936b1"/,
    );
  });

  it("ships required docs and certification runner", () => {
    for (const rel of [
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_EXISTING_FOOTPRINT.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_BOUNDARY_MAP.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_OWNERSHIP_MATRIX.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_IFC_STRATEGY.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_SOLVER_STRATEGY.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_ETABS_DISCOVERY.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_SPACEGASS_DISCOVERY.md",
      "docs/architecture/ENGINEERING_FEDERATION_MODEL.md",
      "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_PHASE_13A.md",
      "docs/contracts/ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACTS_DRAFT.md",
      WORKFLOW,
      RUNNER,
      GATES,
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(WORKFLOW)).toMatch(/PNPM_VERSION: "9\.15\.0"/);
    expect(read(CERT + "/package.json")).toMatch(/certify:phase13a/);
  });

  it("does not introduce production runtime or Phase 13B", () => {
    for (const rel of [
      `${EMI}/src/runtime`,
      `${EMI}/src/adapters/production`,
      `${EMI}/migrations`,
      `${EMI}/src/domain/phase13b`,
      `${DT}/src/domain/phase13a`,
      `${DT}/src/domain/phase13b`,
    ]) {
      expect(present(rel), rel).toBe(false);
    }
    expect(read(VERSION)).toMatch(/productionInteroperabilityRuntimeImplemented = false/);
  });
});
