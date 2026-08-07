/**
 * Phase 10A architecture boundary tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 10A Asset Intelligence Discovery", () => {
  it("ships required discovery docs and packages", () => {
    for (const file of [
      "docs/migration/ASSET_INTELLIGENCE_PHASE_10A_EXISTING_ASSET_INVENTORY.md",
      "docs/architecture/ASSET_INTELLIGENCE_DATA_OWNERSHIP.md",
      "docs/architecture/ASSET_INTELLIGENCE_SHARED_DOMAIN_BOUNDARY.md",
      "docs/architecture/ASSET_INTELLIGENCE_HIERARCHY_MODEL.md",
      "docs/architecture/ASSET_INTELLIGENCE_CONDITION_CRITICALITY_RELIABILITY_MODEL.md",
      "docs/architecture/ASSET_INTELLIGENCE_FAILURE_DEGRADATION_MODEL.md",
      "docs/architecture/ASSET_INTELLIGENCE_DIGITAL_TWIN_BOUNDARY.md",
      "docs/architecture/ASSET_INTELLIGENCE_MAINTENANCE_BOUNDARY.md",
      "docs/architecture/ASSET_INTELLIGENCE_AI_GOVERNANCE.md",
      "docs/architecture/ASSET_INTELLIGENCE_EVENT_MODEL.md",
      "docs/contracts/ASSET_INTELLIGENCE_PUBLIC_CONTRACTS_DRAFT.md",
      "docs/commercial/ASSET_INTELLIGENCE_COMMERCIAL_BOUNDARY.md",
      "packages/asset-intelligence/package.json",
      "packages/asset-intelligence-certification/package.json",
      "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.discovery.json",
    ]) {
      expect(existsSync(resolve(ROOT, file)), file).toBe(true);
    }
  });

  it("locks ownership without production readiness", () => {
    const version = readFileSync(
      resolve(ROOT, "packages/asset-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_OWNERSHIP = "asset_intelligence"/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_IMPLEMENTED = false/);
    expect(version).toMatch(/PRODUCTION_ASSET_INTELLIGENCE_READY = false/);
    expect(version).toMatch(/DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/ACCURACY_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(/RUL_CLAIMS_CERTIFIED = false/);
  });
});
