import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ENGINEERING_PAGE_POLICIES, LicenseIssuanceService } from "@rtb/platform-commerce";
import {
  customerFacingProductName,
  licenceStateLabel,
  subscriptionStatusLabel,
} from "../lib/commerce/commerce-display";
import {
  ENGINEERING_CERTIFIED_V1_MODULES,
  resolveModuleMatrixPresentation,
} from "../lib/engineering/certified-modules";

const WEB_SRC = resolve(__dirname, "..");
const REPO = resolve(__dirname, "../../../..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

describe("EOS-COMMERCE-APP-1 entitlement and module matrix", () => {
  it("keeps canonical Engineering OS application keys aligned across registry, policies, and Commerce", () => {
    const keys = ENGINEERING_CERTIFIED_V1_MODULES.map((module) => module.applicationKey);
    const version = readFileSync(resolve(REPO, "packages/engineering-os/src/version.ts"), "utf8");
    for (const key of keys) {
      expect(version).toContain(`"${key}"`);
    }
    expect(LicenseIssuanceService.PILOT_APPLICATION_KEYS).toEqual(
      expect.arrayContaining(keys),
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence"]?.applicationKey).toBe(
      "project_intelligence",
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/inspection-intelligence"]?.applicationKey).toBe(
      "inspection_intelligence",
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/asset-intelligence"]?.applicationKey).toBe(
      "asset_intelligence",
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-controls"]?.applicationKey).toBe(
      "project_controls",
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/digital-twin"]?.applicationKey).toBe(
      "digital_twin",
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/model-interoperability"]?.applicationKey).toBe(
      "engineering_model_interoperability",
    );
    const adapter = readFileSync(
      resolve(REPO, "packages/platform-core/src/commerce/commerce-adapter.ts"),
      "utf8",
    );
    expect(adapter).toContain("engineering_model_interoperability");
    expect(adapter).toContain("asset_intelligence");
    expect(adapter).toContain("digital_twin");
  });

  it("does not offer Open system when the route guard would deny application_not_in_plan", () => {
    const denied = resolveModuleMatrixPresentation({
      releaseEligible: true,
      entitled: false,
      installed: false,
      accessible: false,
      canInstall: true,
      reasonCode: "application_not_in_plan",
    });
    expect(denied.badge).toBe("Not included");
    expect(denied.action).toBe("view_plan");
    expect(denied.actionLabel).toBe("View plan");

    const installed = resolveModuleMatrixPresentation({
      releaseEligible: true,
      entitled: true,
      installed: true,
      accessible: true,
      canInstall: true,
    });
    expect(installed.badge).toBe("Installed");
    expect(installed.action).toBe("open");
    expect(installed.actionLabel).toBe("Open system");

    const entitledUninstalled = resolveModuleMatrixPresentation({
      releaseEligible: true,
      entitled: true,
      installed: false,
      accessible: false,
      canInstall: true,
    });
    expect(entitledUninstalled.badge).toBe("Available");
    expect(entitledUninstalled.action).toBe("install");
  });

  it("uses customer-facing Engineering OS names instead of opaque product UUIDs", () => {
    expect(
      customerFacingProductName({
        slug: "engineering-os",
        name: "Engineering Operating System",
      }),
    ).toBe("Engineering OS");
    expect(subscriptionStatusLabel("trialing")).toBe("Trialing");
    expect(subscriptionStatusLabel("active")).toBe("Active");
    expect(licenceStateLabel("active")).toBe("Active");
    const subscriptions = read("app/(platform)/system/subscriptions/page.tsx");
    expect(subscriptions).not.toContain("product_id.slice");
    expect(subscriptions).toContain("productName");
    expect(subscriptions).toContain("planName");
    expect(subscriptions).toContain("Installed applications");
    expect(subscriptions).toContain("Diagnostics");
  });

  it("wires Install and pilot reconcile through existing Commerce routes", () => {
    const modules = read("app/(platform)/engineering/modules/page.tsx");
    const reconcile = read("app/api/platform/commerce/licenses/reconcile-pilot/route.ts");
    const access = read("app/api/engineering/modules/access/route.ts");
    expect(modules).toContain("Engineering systems matrix");
    expect(modules).toContain("Open system");
    expect(modules).toContain("engineering-module-${mod.key}");
    expect(modules).toContain("/api/platform/app-installations");
    expect(modules).toContain("/api/platform/commerce/licenses/reconcile-pilot");
    expect(modules).not.toMatch(/>\s*\{mod\.key\}/);
    expect(reconcile).toContain("reconcilePilotProfile");
    expect(reconcile).toContain("assertPilotTenantScope");
    expect(reconcile).toContain("requireInstallationAdmin");
    expect(reconcile).not.toContain("service_role");
    expect(access).toContain("loadCanonicalEngineeringAccess");
  });

  it("does not globally mutate Enterprise plan entitlements for the missing applications", () => {
    const migration = readFileSync(
      resolve(REPO, "supabase/migrations/20260904000000_eos_commerce_app_1_engineering_os_applications.sql"),
      "utf8",
    );
    const issuance = readFileSync(
      resolve(REPO, "packages/platform-commerce/src/services/license-issuance-service.ts"),
      "utf8",
    );
    expect(migration).toContain("asset_intelligence");
    expect(migration).toContain("digital_twin");
    expect(migration).toContain("engineering_model_interoperability");
    expect(migration).not.toMatch(/INSERT INTO commercial_plan_entitlements/);
    expect(issuance).toContain("pilot_reconcile");
    expect(issuance).toContain("asset_intelligence");
    const appInstallRepo = readFileSync(
      resolve(REPO, "packages/platform-commerce/src/repositories/application-installation-repository.ts"),
      "utf8",
    );
    expect(appInstallRepo).not.toContain("requested_at");
  });
});
