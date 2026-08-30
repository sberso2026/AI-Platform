import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY } from "@rtb/inspection-intelligence";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

describe("II catalog/commerce reconciliation", () => {
  it("keeps II licensed through Engineering OS without a standalone plan stack", () => {
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.parentProduct).toBe("engineering-os");
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.entitlementModel).toBe(
      "application_access_on_engineering_os_plans",
    );
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.standaloneCatalogProductHasPlans).toBe(false);
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.createStandalonePlansInIi0).toBe(false);
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.standaloneLicensingCreated).toBe(false);
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.businessOsEntitlementRequired).toBe(false);
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.catalogCommerceReconciled).toBe(true);
    expect(INSPECTION_INTELLIGENCE_COMMERCE_BOUNDARY.planMismatchResolved).toBe(true);
  });

  it("does not create a duplicate II licensing path in hosted install or catalog", () => {
    const installRoute = read("app/api/platform/app-installations/route.ts");
    const installPage = read(
      "app/(platform)/system/applications/[applicationSlug]/install/page.tsx",
    );
    const catalogAdapter = readFileSync(
      resolve(__dirname, "../../../../packages/platform-core/src/commerce/commerce-adapter.ts"),
      "utf8",
    );
    expect(installRoute).toContain('applicationKey === "inspection_intelligence"');
    expect(installRoute).toContain("c1000000-0000-4000-8000-000000000001");
    expect(installPage).toContain('applicationSlug === "inspection-intelligence"');
    expect(installPage).toContain("is an Engineering OS application");
    expect(installPage).toContain("not Business OS");
    expect(catalogAdapter).toContain("inspection-intelligence");
    expect(catalogAdapter).toContain("ENGINEERING_OS_APPLICATION_PRODUCT_SLUGS");
    expect(catalogAdapter).toContain("II_ENGINEERING_OS_APP_DESCRIPTION");
  });
});
