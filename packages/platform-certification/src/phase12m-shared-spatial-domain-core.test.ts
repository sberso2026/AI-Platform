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
const GATES = `${CERT}/src/phase12m/gates.ts`;
const RUNNER = `${CERT}/scripts/run-phase12m-certification.ts`;
const WORKFLOW = ".github/workflows/phase-12m-shared-spatial-domain-core.yml";
const BATCH_85 =
  "supabase/migrations/20260808240000_batch_85_engineering_shared_spatial_domain.sql";

describe("Phase 12M Shared Spatial Domain core", () => {
  it("defines exactly 72 gates (A–BT)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(72);
    expect(ids[0]).toBe("A");
    expect(ids[25]).toBe("Z");
    expect(ids[26]).toBe("AA");
    expect(ids[ids.length - 1]).toBe("BT");
    expect(new Set(ids).size).toBe(72);
  });

  it("declares spatial-core version without bumping Digital Twin", () => {
    expect(read(VERSION)).toMatch(
      /ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION\s*=\s*"0\.2\.0-spatial-core"/,
    );
    expect(read(`${SSD}/package.json`)).toMatch(/"version": "0\.2\.0-spatial-core"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "0\.2\.0-spatial-core"/);
    expect(read(DT_VERSION)).toMatch(/DIGITAL_TWIN_VERSION = "0\.11\.0-digital-thread"/);
    expect(read(`${DT}/package.json`)).toMatch(/"version": "0\.11\.0-digital-thread"/);
  });

  it("locks runtime and FullyResolved flags honestly", () => {
    const version = read(VERSION);
    expect(version).toMatch(/SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED = true/);
    expect(version).toMatch(/SPATIAL_OWNERSHIP_FULLY_RESOLVED = true/);
    expect(version).toMatch(/DIGITAL_TWIN_SPATIAL_BINDING_READY = true/);
    expect(version).toMatch(/DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL = false/);
    expect(version).toMatch(/COORDINATE_TRANSFORMATION_IMPLEMENTED = false/);
    expect(version).toMatch(/GIS_RUNTIME_IMPLEMENTED = false/);
    expect(version).toMatch(/GEOMETRY_REPOSITORY_IMPLEMENTED = false/);
    expect(version).toMatch(/PHASE_12N_READY = true/);
    expect(version).toMatch(/PUBLIC_CONTRACT_VERSION = "0\.2\.0-spatial-core"/);
    expect(read(DT_VERSION)).toMatch(/SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/);
    expect(read(DT_VERSION)).toMatch(/PRODUCTION_DIGITAL_TWIN_READY = false/);
  });

  it("ships batch_85, HTTP routes, docs, and workflow", () => {
    for (const rel of [
      BATCH_85,
      "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE_12M.md",
      "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_OWNERSHIP_MATRIX.md",
      "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_BOUNDARY_MAP.md",
      "docs/architecture/adr/ADR_TWIN_SPATIAL_REFERENCE_REBINDING.md",
      "docs/contracts/ENGINEERING_SHARED_SPATIAL_DOMAIN_PUBLIC_CONTRACTS_DRAFT.md",
      "apps/web/src/app/api/engineering/spatial/spatial-references/route.ts",
      "apps/web/src/app/api/engineering/spatial/reviews/route.ts",
      WORKFLOW,
      RUNNER,
      GATES,
    ]) {
      expect(present(rel), rel).toBe(true);
    }
    expect(read(BATCH_85)).toMatch(/spatial_reference_id text PRIMARY KEY/);
    expect(read(BATCH_85)).not.toMatch(/CREATE EXTENSION\s+postgis/i);
    expect(read(WORKFLOW)).toMatch(/NODE_VERSION: "22"/);
    expect(read(WORKFLOW)).toMatch(/PNPM_VERSION: "9\.15\.0"/);
    expect(read(CERT + "/package.json")).toMatch(/certify:phase12m/);
  });

  it("keeps batch_75–84 free of shared spatial tables and does not start 12N", () => {
    for (const batch of [
      "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql",
      "supabase/migrations/20260808230000_batch_84_digital_twin_digital_thread.sql",
    ]) {
      expect(read(batch)).not.toMatch(/engineering_spatial_references/);
    }
    expect(present(`${SSD}/src/domain/phase12n`)).toBe(false);
    expect(present(`${DT}/src/domain/phase12n`)).toBe(false);
    expect(read(`${DT}/src/domain/spatial-reference.ts`)).toMatch(/sharedSpatialReferenceId/);
  });
});
