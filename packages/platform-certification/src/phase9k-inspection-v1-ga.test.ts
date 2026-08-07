/**
 * Phase 9K architecture boundary tests — Inspection Intelligence V1 GA.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9K Inspection Intelligence V1 GA", () => {
  it("ships GA docs, drift, pins and runbooks", () => {
    for (const file of [
      "packages/inspection-intelligence/src/domain/ga-closure-product.ts",
      "packages/inspection-intelligence/src/domain/registry-drift.ts",
      "packages/inspection-intelligence/src/domain/provider-assurance-pins.ts",
      "packages/inspection-intelligence/src/domain/slo-catalog.ts",
      "docs/runbooks/INSPECTION_INTELLIGENCE_V1_OPERATIONS.md",
      "docs/runbooks/INSPECTION_INTELLIGENCE_V1_INCIDENT_RESPONSE.md",
      "docs/runbooks/INSPECTION_INTELLIGENCE_V1_ROLLBACK.md",
      "docs/commercial/INSPECTION_INTELLIGENCE_V1_PACKAGING.md",
      "docs/contracts/INSPECTION_INTELLIGENCE_PUBLIC_CONTRACTS_V1.md",
      "docs/release/INSPECTION_INTELLIGENCE_V1_PERFORMANCE_BASELINE.md",
      "docs/release/INSPECTION_INTELLIGENCE_VERSION_COMPATIBILITY.md",
      "docs/architecture/INSPECTION_INTELLIGENCE_PHASE_9K_V1_GA.md",
    ]) {
      expect(existsSync(resolve(ROOT, file)), file).toBe(true);
    }
  });

  it("freezes V1.0.0 without ownership claims", () => {
    const version = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/INSPECTION_INTELLIGENCE_VERSION = "1\.0\.0"/);
    expect(version).not.toMatch(/1\.0\.0-ii-release/);
    expect(version).toMatch(/INSPECTION_INTELLIGENCE_V1_FROZEN = true/);
    expect(version).toMatch(/INSPECTION_PRODUCTION_READY = true/);
    expect(version).toMatch(/INSPECTION_CROSS_MODULE_CONSUMER_CONTRACTS_CERTIFIED = true/);
    expect(version).toMatch(/INSPECTION_MODULE_REGISTRY_DRIFT_DETECTED = false/);
    expect(version).toMatch(/INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false/);
    expect(version).toMatch(/INSPECTION_AI_VISION_IMPLEMENTED = true/);
  });

  it("exposes v1-ready marker", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain("inspection-intelligence-v1-ready");
    expect(page).toContain("inspection-intelligence-release-ready");
    expect(page).toContain("inspection-intelligence-ai-vision-ready");
  });
});
