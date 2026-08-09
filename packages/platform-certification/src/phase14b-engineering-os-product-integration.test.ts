import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 14B Engineering OS product integration", () => {
  it("advances EOS to 0.10.0-product-integration without claiming GA", () => {
    const version = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(version).toContain('ENGINEERING_OS_VERSION = "0.10.0-product-integration"');
    expect(version).toContain("EngineeringOSProductIntegrationReady = true");
    expect(version).toContain("productionEngineeringOSReady = false");
    expect(version).toContain("engineeringOSV1GaCertified = false");
    expect(version).toContain("phase14CReady = true");
  });

  it("registers six production modules truthfully", () => {
    const registry = readFileSync(
      resolve(root, "packages/engineering-os/src/module-registry.ts"),
      "utf8",
    );
    for (const key of [
      "project_intelligence",
      "inspection_intelligence",
      "asset_intelligence",
      "project_controls",
      "digital_twin",
      "engineering_model_interoperability",
    ]) {
      expect(registry).toContain(`moduleKey: "${key}"`);
    }
    expect(registry).not.toMatch(
      /moduleKey: "project_controls"[\s\S]{0,180}status: "coming_soon"/,
    );
  });

  it("requires product integration surfaces and workflow", () => {
    for (const rel of [
      "packages/engineering-os/src/product-integration/aggregate-manifest.ts",
      "packages/engineering-os/src/product-integration/engineering-context.ts",
      "packages/engineering-os/src/product-integration/cross-module-search.ts",
      "packages/engineering-os/src/product-integration/os-health.ts",
      ".github/workflows/phase-14b-engineering-os-product-integration.yml",
      "docs/architecture/ENGINEERING_OS_V1_GA_GAP_REGISTER.md",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const home = readFileSync(
      resolve(root, "apps/web/src/app/(platform)/engineering/page.tsx"),
      "utf8",
    );
    expect(home).toContain('data-testid="engineering-os-product-ready"');
  });
});
