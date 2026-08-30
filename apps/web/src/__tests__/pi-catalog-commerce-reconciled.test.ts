import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY } from "@rtb/project-intelligence";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

describe("PI catalog/commerce reconciliation", () => {
  it("keeps PI licensed through Engineering OS without a standalone plan stack", () => {
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.parentProduct).toBe("engineering-os");
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.entitlementModel).toBe(
      "application_access_on_engineering_os_plans",
    );
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.standaloneCatalogProductHasPlans).toBe(false);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.createPlansInPi0).toBe(false);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.standaloneLicensingCreated).toBe(false);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.businessOsEntitlementRequired).toBe(false);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.catalogCommerceReconciled).toBe(true);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.planMismatchResolved).toBe(true);
    expect(PROJECT_INTELLIGENCE_COMMERCE_BOUNDARY.uiMismatch).toBe(false);
  });

  it("does not create a duplicate PI licensing path in hosted install or catalog", () => {
    const installRoute = read("app/api/platform/app-installations/route.ts");
    const installPage = read(
      "app/(platform)/system/applications/[applicationSlug]/install/page.tsx",
    );
    const catalogAdapter = readFileSync(
      resolve(__dirname, "../../../../packages/platform-core/src/commerce/commerce-adapter.ts"),
      "utf8",
    );
    expect(installRoute).toContain('applicationKey === "project_intelligence"');
    expect(installRoute).toContain("c1000000-0000-4000-8000-000000000001");
    expect(installPage).toContain("Engineering OS application");
    expect(installPage).toContain("not Business OS");
    expect(catalogAdapter).toContain("ENGINEERING_OS_APPLICATION_PRODUCT_SLUGS");
    expect(catalogAdapter).toContain("PI_ENGINEERING_OS_APP_DESCRIPTION");
  });
});
