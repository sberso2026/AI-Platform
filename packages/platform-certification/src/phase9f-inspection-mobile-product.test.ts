/**
 * Phase 9F architecture boundary tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9F Inspection Intelligence mobile product", () => {
  it("ships Engineering Mobile SDK", () => {
    expect(existsSync(resolve(ROOT, "packages/engineering-os/src/mobile-sdk/index.ts"))).toBe(true);
    expect(readFileSync(resolve(ROOT, "packages/engineering-os/src/index.ts"), "utf8")).toContain(
      "./mobile-sdk",
    );
    const sdk = readFileSync(resolve(ROOT, "packages/engineering-os/src/mobile-sdk/index.ts"), "utf8");
    expect(sdk).toContain("ENGINEERING_MOBILE_CAPABILITY_MANIFESTS");
    expect(sdk).toContain("assertMobileCapabilityAvailable");
  });

  it("ships mobile product domain, pack forms, migration, and privacy docs", () => {
    for (const file of [
      "packages/inspection-intelligence/src/domain/mobile-product.ts",
      "packages/inspection-intelligence/src/domain/pack-mobile-forms.ts",
      "docs/architecture/ENGINEERING_MOBILE_SDK.md",
      "docs/architecture/INSPECTION_INTELLIGENCE_MOBILE_INTEGRATION.md",
      "docs/security/INSPECTION_INTELLIGENCE_MOBILE_PRIVACY.md",
      "docs/testing/INSPECTION_INTELLIGENCE_MOBILE_BASELINE.md",
      "supabase/migrations/20260806240000_batch_47_inspection_intelligence_mobile_product.sql",
    ]) {
      expect(existsSync(resolve(ROOT, file)), file).toBe(true);
    }
  });

  it("implements mobile product while keeping offline and AI Vision false", () => {
    const version = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_AI_VISION_IMPLEMENTED = false/);
    expect(version).toMatch(/INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false/);
    expect(
      readFileSync(resolve(ROOT, "packages/project-intelligence/src/version.ts"), "utf8"),
    ).toMatch(/PROJECT_INTELLIGENCE_VERSION = "1\.0\.0"/);
  });

  it("exposes mobile UI markers and field surfaces", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain("inspection-intelligence-mobile-ready");
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/my-work/page.tsx",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/field/page.tsx",
        ),
      ),
    ).toBe(true);
    const shell = readFileSync(
      resolve(ROOT, "apps/web/src/components/engineering/inspection-intelligence-shell.tsx"),
      "utf8",
    );
    expect(shell).toContain("data-min-touch-target");
    expect(shell).toContain("data-offline-sync");
  });
});
