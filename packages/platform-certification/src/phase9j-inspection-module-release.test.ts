/**
 * Phase 9J architecture boundary tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9J Inspection Intelligence Module Release", () => {
  it("ships contracts, registries, manifest, health and docs", () => {
    for (const file of [
      "packages/inspection-intelligence/src/domain/public-module-contracts.ts",
      "packages/inspection-intelligence/src/domain/capability-registry-integration.ts",
      "packages/inspection-intelligence/src/domain/service-registry.ts",
      "packages/inspection-intelligence/src/domain/pack-registry-hardened.ts",
      "packages/inspection-intelligence/src/domain/module-manifest.ts",
      "packages/inspection-intelligence/src/domain/operational-health-metrics.ts",
      "packages/inspection-intelligence/src/domain/versioning-compatibility.ts",
      "packages/inspection-intelligence/src/domain/consumer-contracts.ts",
      "packages/inspection-intelligence/src/domain/module-release-product.ts",
      "packages/inspection-intelligence/manifest/inspection-intelligence-module-manifest.json",
      "docs/architecture/INSPECTION_INTELLIGENCE_PHASE_9J_MODULE_RELEASE.md",
      "docs/architecture/INSPECTION_INTELLIGENCE_VERSIONING_COMPATIBILITY.md",
      "docs/security/INSPECTION_INTELLIGENCE_MODULE_RELEASE_THREAT_MODEL.md",
      "docs/testing/INSPECTION_INTELLIGENCE_MODULE_RELEASE_DEVICE_EVIDENCE.md",
    ]) {
      expect(existsSync(resolve(ROOT, file)), file).toBe(true);
    }
  });

  it("closes release while keeping AI Vision advisory and Twin ownership false", () => {
    const version = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(
      /INSPECTION_INTELLIGENCE_VERSION = "1\.0\.0(?:-ii-release)?"/,
    );
    expect(version).toMatch(/INSPECTION_INTELLIGENCE_RELEASE_CLOSED = true/);
    expect(version).toMatch(/INSPECTION_AI_VISION_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false/);
    expect(version).toMatch(/INSPECTION_PUBLIC_MODULE_CONTRACTS_PUBLISHED = true/);
    expect(version).toMatch(/INSPECTION_CAPABILITY_REGISTRY_INTEGRATED = true/);
    expect(version).toMatch(/INSPECTION_SERVICE_REGISTRY_PUBLISHED = true/);
    expect(version).toMatch(/INSPECTION_PACK_REGISTRY_HARDENED = true/);
    expect(version).toMatch(/INSPECTION_MODULE_MANIFEST_GENERATED = true/);
    expect(version).toMatch(/INSPECTION_OPERATIONAL_HEALTH_METRICS_EXPOSED = true/);
    expect(version).toMatch(/INSPECTION_VERSIONING_COMPATIBILITY_FORMALIZED = true/);
  });

  it("exposes release UI markers", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain("inspection-intelligence-release-ready");
    expect(page).toContain("inspection-intelligence-ai-vision-ready");
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
        ),
      ),
    ).toBe(true);
  });
});
