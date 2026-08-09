import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}

const DT = "packages/digital-twin/src";
const MANIFEST_JSON = "packages/digital-twin/manifest/digital-twin-module-manifest.json";
const UI_BASE = "apps/web/src/app/(platform)/engineering/apps/digital-twin";
const CERT = "packages/digital-twin-certification";

describe("Phase 12N Digital Twin V1.0 GA closure", () => {
  it("defines exactly 72 gates (A–BT)", () => {
    const gatesSource = read(`${CERT}/src/phase12n/gates.ts`);
    const ids = [...gatesSource.matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(72);
    expect(ids[ids.length - 1]).toBe("BT");
    expect(new Set(ids).size).toBe(72);
  });

  it("freezes version.ts at 1.0.0 GA and pins the Phase 12M baseline", () => {
    const version = read(`${DT}/version.ts`);
    expect(version).toMatch(/DIGITAL_TWIN_VERSION = "1\.0\.0"/);
    expect(version).toMatch(/DIGITAL_TWIN_STATUS = "ga"/);
    expect(version).toMatch(/DIGITAL_TWIN_RELEASE_TAG = "digital-twin-v1\.0\.0"/);
    expect(version).toMatch(/DIGITAL_TWIN_READINESS_MARKER = "digital-twin-v1-ready"/);
    expect(version).toMatch(/DIGITAL_TWIN_V1_GA_CERTIFIED = true/);
    expect(version).toMatch(/DIGITAL_TWIN_V1_FROZEN = true/);
    expect(version).toMatch(/PRODUCTION_DIGITAL_TWIN_READY = true/);
    expect(version).toMatch(/DIGITAL_TWIN_PREVIOUS_VERSION = "0\.11\.0-digital-thread"/);
    expect(version).toMatch(
      /PHASE_12M_CERTIFIED_COMMIT =\s*\r?\n?\s*"24fccb399ff34dac7f501c2fcf14cba97d7acb7d"/,
    );
    expect(version).toMatch(/PHASE_12M_HOSTED_RUN = "31270498973"/);
    expect(version).toMatch(/SPATIAL_OWNERSHIP_FULLY_RESOLVED = true/);
    expect(version).toMatch(/DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL = false/);
  });

  it("keeps forbidden locks closed at GA", () => {
    const version = read(`${DT}/version.ts`);
    for (const lock of [
      /PHYSICAL_ACTUATION_IMPLEMENTED = false/,
      /AUTOMATIC_CONTROL_IMPLEMENTED = false/,
      /PREDICTIVE_TWIN_IMPLEMENTED = false/,
      /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/,
      /OPTIMIZATION_IMPLEMENTED = false/,
      /SHM_IMPLEMENTED = false/,
      /GIS_RUNTIME_IMPLEMENTED = false/,
      /SILENT_FIXTURE_FALLBACK_ENABLED = false/,
      /SILENT_SOLVER_FALLBACK_ALLOWED = false/,
      /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/,
      /DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL = false/,
    ]) {
      expect(version, String(lock)).toMatch(lock);
    }
  });

  it("aligns both package versions with the module version", () => {
    expect(read("packages/digital-twin/package.json")).toMatch(/"version": "1\.0\.0"/);
    expect(read(`${CERT}/package.json`)).toMatch(/"version": "1\.0\.0"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase12n/);
  });

  it("ships frozen registries and drift guard", () => {
    for (const rel of [
      `${DT}/domain/module-manifest.ts`,
      `${DT}/domain/capability-registry.ts`,
      `${DT}/domain/service-registry.ts`,
      `${DT}/domain/event-contracts.ts`,
      `${DT}/domain/public-contracts.ts`,
      `${DT}/domain/unavailable-capabilities.ts`,
      `${DT}/domain/registry-drift.ts`,
      `${DT}/domain/ga-closure.ts`,
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });

  it("publishes authoritative GA manifest snapshot", () => {
    const manifest = JSON.parse(read(MANIFEST_JSON)) as Record<string, unknown>;
    expect(manifest.schemaVersion).toBe("digital-twin-module-manifest/1");
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.status).toBe("ga");
    expect(manifest.releaseTag).toBe("digital-twin-v1.0.0");
    expect((manifest.migrationLineage as string[]).length).toBe(11);
    expect((manifest.featureFlags as Record<string, boolean>).moduleRegistryDriftDetected).toBe(
      false,
    );
  });

  it("ships GA docs and runbooks", () => {
    for (const rel of [
      "docs/release/DIGITAL_TWIN_V1_CAPABILITY_MATRIX.md",
      "docs/architecture/DIGITAL_TWIN_V1_PUBLIC_CONTRACTS.md",
      "docs/commercial/DIGITAL_TWIN_V1_COMMERCIAL_PACKAGING.md",
      "docs/operations/DIGITAL_TWIN_V1_OPERATIONAL_CERTIFICATION.md",
      "docs/runbooks/DIGITAL_TWIN_V1_OPERATIONS.md",
      "docs/runbooks/DIGITAL_TWIN_V1_INCIDENT_RESPONSE.md",
      "docs/runbooks/DIGITAL_TWIN_V1_RECOVERY.md",
      "docs/runbooks/DIGITAL_TWIN_V1_ROLLBACK.md",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });

  it("exposes Engineering OS module page with GA readiness marker", () => {
    const page = read(`${UI_BASE}/page.tsx`);
    expect(page).toMatch(/data-testid="digital-twin-v1-ready"/);
    expect(page).toMatch(/data-testid="digital-twin-ga-version"/);
    expect(read(`${UI_BASE}/layout.tsx`)).toMatch(
      /ENGINEERING_PAGE_POLICIES\["\/engineering\/apps\/digital-twin"\]/,
    );
    expect(read("packages/platform-commerce/src/domain/commerce-access-policy.ts")).toMatch(
      /"\/engineering\/apps\/digital-twin"/,
    );
  });

  it("does not create batch_86 migration", () => {
    expect(
      existsSync(
        resolve(root, "supabase/migrations/20260808250000_batch_86_digital_twin_ga.sql"),
      ),
    ).toBe(false);
  });

  it("keeps Shared Spatial Domain at 0.2.0-spatial-core", () => {
    const ssd = read("packages/engineering-shared-spatial-domain/src/version.ts");
    expect(ssd).toMatch(/ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION =\s*\r?\n?\s*"0\.2\.0-spatial-core"/);
    expect(ssd).not.toMatch(/ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION = "1\.0\.0"/);
  });

  it("ships browser gate, workflow and certification runner", () => {
    for (const rel of [
      `${CERT}/playwright/v1-ga.spec.ts`,
      `${CERT}/src/phase12n/gates.ts`,
      `${CERT}/scripts/run-phase12n-certification.ts`,
      "packages/digital-twin/tests/phase12n-v1-ga.test.ts",
      ".github/workflows/phase-12n-digital-twin-ga.yml",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });
});
