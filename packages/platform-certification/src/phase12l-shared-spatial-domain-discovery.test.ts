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

const SSD = "packages/engineering-shared-spatial-domain";
const CERT = "packages/engineering-shared-spatial-domain-certification";
const DT = "packages/digital-twin";
const VERSION = `${SSD}/src/version.ts`;
const DT_VERSION = `${DT}/src/version.ts`;
const GATES = `${CERT}/src/phase12l/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12l-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12l-shared-spatial-domain-discovery.yml";

describe("Phase 12L Shared Spatial Domain discovery", () => {
  it("defines exactly 57 gates (A–BE)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(57);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("BE");
    expect(new Set(ids).size).toBe(57);
  });

  it("declares discovery version without bumping Digital Twin", () => {
    expect(read(VERSION)).toMatch(
      /ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION\s*=\s*"0\.1\.0-spatial-discovery"/,
    );
    expect(read(`${SSD}/package.json`)).toMatch(/"version": "0\.1\.0-spatial-discovery"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.1\.0-spatial-discovery"/);
    expect(read(DT_VERSION)).toMatch(/DIGITAL_TWIN_VERSION = "0\.11\.0-digital-thread"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.11\.0-digital-thread"/);
  });

  it("locks honest ownership flags", () => {
    const version = read(VERSION);
    expect(version).toMatch(/SHARED_SPATIAL_DOMAIN_DISCOVERY_READY = true/);
    expect(version).toMatch(/SHARED_SPATIAL_DOMAIN_OWNERSHIP_LOCKED = true/);
    expect(version).toMatch(/SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED = false/);
    expect(version).toMatch(/SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/);
    expect(version).toMatch(/COORDINATE_TRANSFORMATION_IMPLEMENTED = false/);
    expect(version).toMatch(/GIS_RUNTIME_IMPLEMENTED = false/);
    expect(version).toMatch(/SPATIAL_ANALYTICS_IMPLEMENTED = false/);
    expect(version).toMatch(/DUPLICATE_SPATIAL_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL = false/);
    expect(version).toMatch(/PHASE_12M_READY = true/);
    expect(read(DT_VERSION)).toMatch(/SPATIAL_CANONICAL_OWNERSHIP =\s*"engineering_os_shared_spatial_domain"/);
    expect(read(DT_VERSION)).toMatch(/SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/);
    expect(read(DT_VERSION)).toMatch(/PRODUCTION_DIGITAL_TWIN_READY = false/);
  });

  it("ships required docs and certification runner", () => {
    for (const rel of [
      "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_EXISTING_FOOTPRINT.md",
      "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_OWNERSHIP_MATRIX.md",
      "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_BOUNDARY_MAP.md",
      "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE_12L.md",
      "docs/architecture/adr/ADR_SHARED_SPATIAL_OWNERSHIP.md",
      "docs/architecture/adr/ADR_SHARED_SPATIAL_GEOMETRY_OWNERSHIP.md",
      "docs/architecture/adr/ADR_SHARED_SPATIAL_CRS_GOVERNANCE.md",
      "docs/architecture/adr/ADR_SHARED_SPATIAL_LOCAL_VS_GLOBAL_COORDINATES.md",
      "docs/architecture/adr/ADR_SHARED_SPATIAL_BIM_GIS_MODEL_BOUNDARY.md",
      "docs/architecture/adr/ADR_SHARED_SPATIAL_LINEAR_REFERENCING_BOUNDARY.md",
      "docs/architecture/adr/ADR_TWIN_SPATIAL_REFERENCE_REBINDING.md",
      "docs/contracts/ENGINEERING_SHARED_SPATIAL_DOMAIN_PUBLIC_CONTRACTS_DRAFT.md",
      WORKFLOW,
      RUNNER,
      GATES,
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(WORKFLOW)).toMatch(/PNPM_VERSION: "9\.15\.0"/);
    expect(read(CERT + "/package.json")).toMatch(/certify:phase12l/);
  });

  it("does not introduce spatial runtime or batch_85", () => {
    for (const rel of [
      `${SSD}/src/runtime`,
      `${SSD}/src/gis`,
      `${SSD}/src/postgis`,
      `${SSD}/migrations`,
      `${DT}/src/domain/phase12m`,
    ]) {
      expect(present(rel), rel).toBe(false);
    }
    expect(read(VERSION)).toMatch(/ENGINEERING_LOCATIONS_TABLE_EXISTS = false/);
  });
});
