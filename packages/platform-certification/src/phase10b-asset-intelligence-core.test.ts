/**
 * Phase 10B architecture boundary tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 10B Asset Intelligence Core", () => {
  it("ships required core docs and packages", () => {
    for (const file of [
      "docs/architecture/ASSET_INTELLIGENCE_ENGINE.md",
      "docs/architecture/ASSET_INTELLIGENCE_SNAPSHOT_MODEL.md",
      "docs/architecture/ASSET_INTELLIGENCE_HEALTH_INDEX.md",
      "docs/architecture/ASSET_INTELLIGENCE_SOURCE_REGISTRY.md",
      "docs/architecture/ASSET_INTELLIGENCE_HISTORICAL_TIMELINE.md",
      "docs/architecture/ASSET_INTELLIGENCE_PHASE_10B_CORE.md",
      "docs/architecture/ASSET_INTELLIGENCE_DATA_OWNERSHIP.md",
      "packages/asset-intelligence/package.json",
      "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.core.json",
      "packages/asset-intelligence/src/domain/engine.ts",
      "packages/asset-intelligence-certification/package.json",
    ]) {
      expect(existsSync(resolve(ROOT, file)), file).toBe(true);
    }
  });

  it("locks ownership and core flags without full module GA", () => {
    const version = readFileSync(
      resolve(ROOT, "packages/asset-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_OWNERSHIP = "asset_intelligence"/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_VERSION = "0\.2\.0-core"/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_IMPLEMENTED = true/);
    expect(version).toMatch(/CORE_CONDITION_SLICE_READY = true/);
    expect(version).toMatch(/PRODUCTION_ASSET_INTELLIGENCE_READY = false/);
    expect(version).toMatch(/DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/);
    expect(version).toMatch(/ACCURACY_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(/RUL_CLAIMS_CERTIFIED = false/);
  });
});
