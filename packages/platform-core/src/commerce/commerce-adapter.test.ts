import { describe, it, expect } from "vitest";
import {
  buildCatalogSummary,
  filterApplicationsBySection,
  filterProductsByTab,
  getProductBySlug,
  isActionVisible,
  mapEngineeringApplications,
  mapRegistryToCommercialProducts,
  canManageBilling,
  canManageSeats,
} from "./commerce-adapter";
import type { CommerceAdapterContext, EngineeringApplicationSeed } from "./commerce-types";

const baseContext: CommerceAdapterContext = {
  roleSlug: "owner",
  engineeringOsEnabled: true,
  engineeringEdition: "Enterprise",
  engineeringVersion: "0.2.1",
  engineeringApplications: [
    {
      app_key: "project_intelligence",
      name: "Project Intelligence",
      description: "Project analytics",
      version: "0.0.0",
      enabled: false,
      routes: ["/engineering/apps/project-intelligence"],
    },
    {
      app_key: "inspection_intelligence",
      name: "Inspection Intelligence",
      description: "Inspection planning",
      version: "0.0.0",
      enabled: false,
    },
    {
      app_key: "standards_intelligence",
      name: "Standards Intelligence",
      description: "Standards compliance",
      version: "0.0.0",
      enabled: false,
    },
  ],
  seatUsage: { assigned: 12, total: 25 },
  renewalDate: "2027-01-01",
  currentPlan: "Enterprise",
};

describe("Platform Commerce UI — product catalog adapter", () => {
  it("places Engineering OS in the Installed tab", () => {
    const products = mapRegistryToCommercialProducts(baseContext);
    const engineering = getProductBySlug(products, "engineering-os");
    expect(engineering).toBeDefined();
    expect(engineering?.catalogTab).toBe("installed");
  });

  it("places coming soon OS products in the Coming Soon tab", () => {
    const products = mapRegistryToCommercialProducts(baseContext);
    const comingSoon = filterProductsByTab(products, "coming_soon");
    expect(comingSoon.length).toBeGreaterThan(0);
    expect(comingSoon.every((p) => p.catalogTab === "coming_soon")).toBe(true);
    expect(comingSoon.some((p) => p.osId === "business")).toBe(true);
  });

  it("does not expose internal platform OS card", () => {
    const products = mapRegistryToCommercialProducts(baseContext);
    expect(products.some((p) => p.osId === "platform")).toBe(false);
  });

  it("preserves separate subscription, licence, and installation statuses for Engineering OS", () => {
    const engineering = getProductBySlug(
      mapRegistryToCommercialProducts(baseContext),
      "engineering-os"
    );
    expect(engineering?.subscriptionStatus).toBe("active");
    expect(engineering?.licenceStatus).toBe("active");
    expect(engineering?.installationStatus).toBe("active");
  });

  it("defaults Installed tab filtering", () => {
    const products = mapRegistryToCommercialProducts(baseContext);
    const installed = filterProductsByTab(products, "installed");
    expect(installed).toHaveLength(1);
    expect(installed[0]?.slug).toBe("engineering-os");
  });

  it("builds catalog summary from installed products", () => {
    const products = mapRegistryToCommercialProducts(baseContext);
    const summary = buildCatalogSummary(products, baseContext);
    expect(summary.installedProducts).toBe(1);
    expect(summary.currentPlan).toBe("Enterprise");
    expect(summary.assignedSeats).toBe(12);
  });
});

describe("Platform Commerce UI — Engineering OS product detail", () => {
  it("maps Engineering OS open and manage routes", () => {
    const engineering = getProductBySlug(
      mapRegistryToCommercialProducts(baseContext),
      "engineering-os"
    );
    expect(engineering?.openHref).toBe("/engineering");
    expect(engineering?.manageHref).toBe("/system/products/engineering-os");
  });

  it("lists available engineering applications per commerce spec", () => {
    const apps = mapEngineeringApplications(
      baseContext.engineeringApplications as EngineeringApplicationSeed[],
      baseContext
    );
    const available = filterApplicationsBySection(apps, "available");
    const names = available.map((a) => a.name);
    expect(names).toContain("Inspection Intelligence");
    expect(names).toContain("Engineering Knowledge");
    expect(names).not.toContain("Project Intelligence");
  });

  it("shows Project Intelligence only when enabled", () => {
    const enabledContext: CommerceAdapterContext = {
      ...baseContext,
      engineeringApplications: baseContext.engineeringApplications?.map((app) =>
        app.app_key === "project_intelligence" ? { ...app, enabled: true } : app
      ),
    };
    const apps = mapEngineeringApplications(
      enabledContext.engineeringApplications as EngineeringApplicationSeed[],
      enabledContext
    );
    const installed = filterApplicationsBySection(apps, "installed");
    expect(installed.some((a) => a.name === "Project Intelligence")).toBe(true);
  });
});

describe("Platform Commerce UI — role-based action visibility", () => {
  it("allows viewers to open but not manage billing", () => {
    expect(isActionVisible("open", "viewer")).toBe(true);
    expect(isActionVisible("view_billing", "viewer")).toBe(false);
    expect(isActionVisible("manage", "viewer")).toBe(false);
  });

  it("allows tenant admin to manage seats but not billing", () => {
    expect(canManageSeats("admin")).toBe(true);
    expect(canManageBilling("admin")).toBe(false);
    expect(isActionVisible("manage_seats", "admin")).toBe(true);
    expect(isActionVisible("view_billing", "admin")).toBe(false);
  });

  it("allows owner to manage subscription and products", () => {
    expect(canManageBilling("owner")).toBe(true);
    expect(isActionVisible("view_billing", "owner")).toBe(true);
    expect(isActionVisible("manage", "owner")).toBe(true);
  });
});

describe("Platform Commerce UI — live tenant commerce projection", () => {
  const eosId = "c1000000-0000-4000-8000-000000000001";
  const commerceData = {
    commercial_products: [
      {
        id: eosId,
        slug: "engineering-os",
        name: "Engineering Operating System",
        product_type: "operating_system",
        description: "EOS",
        lifecycle_status: "active",
        marketplace_visible: true,
      },
      {
        id: "app-pi",
        slug: "project-intelligence",
        name: "Project Intelligence",
        product_type: "application",
        description: "PI",
        lifecycle_status: "active",
        marketplace_visible: true,
      },
      {
        id: "app-ii",
        slug: "inspection-intelligence",
        name: "Inspection Intelligence",
        product_type: "application",
        description: "II",
        lifecycle_status: "active",
        marketplace_visible: true,
      },
      {
        id: "ref-os",
        slug: "reference-os",
        name: "Reference OS",
        product_type: "operating_system",
        description: "Certification fixture",
        lifecycle_status: "active",
        marketplace_visible: false,
      },
    ],
    commercial_plans: [
      { id: "plan-enterprise", product_id: eosId, edition: "enterprise" },
      { id: "plan-trial", product_id: eosId, edition: "trial" },
    ],
    commercial_subscriptions: [
      {
        id: "sub-1",
        product_id: eosId,
        plan_id: "plan-trial",
        status: "trialing" as const,
        renewal_date: "2026-09-14",
      },
    ],
    commercial_licenses: [
      { id: "lic-os", product_id: eosId, status: "active" as const, license_type: "product" },
      {
        id: "lic-pi",
        product_id: eosId,
        status: "active" as const,
        license_type: "application",
        application_key: "project_intelligence",
      },
      {
        id: "lic-ii",
        product_id: eosId,
        status: "active" as const,
        license_type: "application",
        application_key: "inspection_intelligence",
      },
      {
        id: "lic-docs",
        product_id: eosId,
        status: "active" as const,
        license_type: "application",
        application_key: "documents",
      },
    ],
    product_installations: [
      { id: "inst-1", product_id: eosId, status: "active" as const, version: "0.2.0" },
    ],
    commercial_seat_pools: [{ id: "pool-1", product_id: eosId, assigned: 4, total: 5 }],
  };

  it("places licensed provisioned EOS on Installed, not Available/Start Trial", () => {
    const products = mapRegistryToCommercialProducts(baseContext, commerceData);
    const engineering = getProductBySlug(products, "engineering-os");
    expect(engineering?.catalogTab).toBe("installed");
    expect(engineering?.subscriptionStatus).toBe("trialing");
    expect(engineering?.licenceStatus).toBe("active");
    expect(engineering?.installationStatus).toBe("active");
    expect(engineering?.primaryAction).toBe("manage_seats");
    expect(engineering?.openHref).toBe("/engineering");
    expect(engineering?.edition).toBe("trial");
    expect(engineering?.seatUsage).toEqual({ assigned: 4, total: 5 });
  });

  it("does not treat current-user unseated as product not installed", () => {
    const products = mapRegistryToCommercialProducts(
      { ...baseContext, seatedProductIds: [] },
      commerceData
    );
    const engineering = getProductBySlug(products, "engineering-os");
    expect(engineering?.catalogTab).toBe("installed");
    expect(engineering?.currentUserSeated).toBe(false);
    expect(engineering?.primaryAction).not.toBe("start_trial");
    expect(engineering?.primaryAction).not.toBe("open");
  });

  it("opens EOS when the current user is seated", () => {
    const products = mapRegistryToCommercialProducts(
      { ...baseContext, seatedProductIds: [eosId] },
      commerceData
    );
    const engineering = getProductBySlug(products, "engineering-os");
    expect(engineering?.primaryAction).toBe("open");
    expect(engineering?.currentUserSeated).toBe(true);
  });

  it("shows governed applications as installed without Start Trial", () => {
    const products = mapRegistryToCommercialProducts(baseContext, commerceData);
    const pi = getProductBySlug(products, "project-intelligence");
    const ii = getProductBySlug(products, "inspection-intelligence");
    expect(pi?.catalogTab).toBe("installed");
    expect(ii?.catalogTab).toBe("installed");
    expect(pi?.primaryAction).not.toBe("start_trial");
    expect(pi?.openHref).toBe("/engineering/apps/project-intelligence");
  });

  it("hides certification-only products from ordinary catalog", () => {
    const products = mapRegistryToCommercialProducts(baseContext, commerceData);
    expect(products.some((p) => p.slug === "reference-os")).toBe(false);
  });

  it("summarizes installed OS, applications, and seat pool from tenant commerce", () => {
    const products = mapRegistryToCommercialProducts(baseContext, commerceData);
    const summary = buildCatalogSummary(products, baseContext);
    expect(summary.installedProducts).toBe(1);
    expect(summary.installedApplications).toBeGreaterThanOrEqual(3);
    expect(summary.assignedSeats).toBe(4);
    expect(summary.totalSeats).toBe(5);
  });
});
