import { describe, it, expect } from "vitest";
import type { Permission } from "@rtb/types";
import {
  ADVANCED_PLATFORM_HUB_ROUTE,
  buildAdvancedToolCategories,
  canAccessPlatformRoute,
  canSeeNavItem,
  filterSidebarNavigation,
  hasMinimumNavTier,
  requiresAdvancedPlatformAccess,
  resolveNavTier,
  shouldIncludePlatformSearchResults,
  type SidebarNavContext,
} from "./nav-visibility";
import {
  ADVANCED_PLATFORM_NAVIGATION,
  FULL_NAVIGATION,
  PLATFORM_NAVIGATION,
  SIDEBAR_SECTIONS,
  groupNavigation,
  itemsForSidebarSection,
} from "./navigation";

function ctx(
  roleSlug: string,
  overrides: Partial<SidebarNavContext> = {}
): SidebarNavContext {
  const tier = resolveNavTier(roleSlug);
  const permissions: Permission[] =
    tier === "admin"
      ? [{ resource: "tenant", action: "admin" }]
      : tier === "manager"
        ? [
            { resource: "user", action: "read" },
            { resource: "audit", action: "read" },
          ]
        : [];

  const hasPermission = (resource: string, action: string) =>
    permissions.some(
      (p) =>
        p.resource === resource &&
        (p.action === action || p.action === "admin" || action === "read")
    );

  return {
    roleSlug,
    tier,
    permissions,
    showAdvancedInSidebar: false,
    hasPermission,
    ...overrides,
  };
}

describe("Batch 2.12 — Nav tier resolution", () => {
  it("maps owner and admin to admin tier", () => {
    expect(resolveNavTier("owner")).toBe("admin");
    expect(resolveNavTier("admin")).toBe("admin");
  });

  it("maps engineering manager to manager tier", () => {
    expect(resolveNavTier("engineering_manager")).toBe("manager");
    expect(resolveNavTier("manager")).toBe("manager");
  });

  it("maps viewer and member roles", () => {
    expect(resolveNavTier("viewer")).toBe("viewer");
    expect(resolveNavTier("member")).toBe("engineer");
  });
});

describe("Batch 2.12 — Simplified System Administration sidebar", () => {
  it("exposes commerce-aware platform admin items", () => {
    expect(PLATFORM_NAVIGATION.map((i) => i.label)).toEqual([
      "Products",
      "Subscriptions",
      "Licences",
      "Seats",
      "Usage",
      "Billing",
      "Marketplace",
      "Growth",
      "Analytics",
      "Customers",
      "Commerce Audit",
      "Workspaces",
      "Users & Permissions",
      "Integrations",
      "System Health",
      "Audit Logs",
      "Settings",
    ]);
  });

  it("hides platform internals from default sidebar navigation", () => {
    const visible = filterSidebarNavigation(FULL_NAVIGATION, ctx("owner"));
    const hrefs = visible.map((i) => i.href);
    expect(hrefs).not.toContain("/platform/ai-director");
    expect(hrefs).not.toContain("/platform/tools");
    expect(hrefs).not.toContain("/platform/models");
    expect(hrefs).not.toContain("/command-centre");
  });

  it("viewer cannot see System Administration items", () => {
    const visible = filterSidebarNavigation(FULL_NAVIGATION, ctx("viewer"));
    const platformItems = visible.filter((i) => i.group === "platform");
    expect(platformItems).toHaveLength(0);
  });

  it("engineer cannot see Advanced Platform Tools", () => {
    const visible = filterSidebarNavigation(FULL_NAVIGATION, ctx("member"));
    expect(visible.some((i) => i.href === ADVANCED_PLATFORM_HUB_ROUTE)).toBe(false);
    expect(
      visible.some((i) => i.group === "platform_advanced")
    ).toBe(false);
  });

  it("engineering manager sees limited platform admin tools", () => {
    const visible = filterSidebarNavigation(FULL_NAVIGATION, ctx("engineering_manager"));
    const labels = visible.filter((i) => i.group === "platform").map((i) => i.label);
    expect(labels).toEqual(
      expect.arrayContaining(["Users & Permissions", "System Health", "Audit Logs"])
    );
    expect(labels).not.toContain("Products");
    expect(labels).not.toContain("Integrations");
    expect(labels).not.toContain("Settings");
  });

  it("owner sees full System Administration", () => {
    const visible = filterSidebarNavigation(FULL_NAVIGATION, ctx("owner"));
    const labels = visible.filter((i) => i.group === "platform").map((i) => i.label);
    expect(labels).toEqual(PLATFORM_NAVIGATION.map((i) => i.label));
  });

  it("shows Advanced Platform Tools in sidebar only when enabled for admin", () => {
    const hidden = filterSidebarNavigation(FULL_NAVIGATION, ctx("owner"));
    expect(hidden.some((i) => i.href === ADVANCED_PLATFORM_HUB_ROUTE)).toBe(false);

    const shown = filterSidebarNavigation(
      FULL_NAVIGATION,
      ctx("owner", { showAdvancedInSidebar: true })
    );
    expect(shown.some((i) => i.href === ADVANCED_PLATFORM_HUB_ROUTE)).toBe(true);
  });
});

describe("Batch 2.12 — Advanced route access", () => {
  it("requires admin for advanced platform routes", () => {
    expect(canAccessPlatformRoute("/platform/advanced", ctx("owner"))).toBe(true);
    expect(canAccessPlatformRoute("/platform/advanced", ctx("engineering_manager"))).toBe(
      false
    );
    expect(canAccessPlatformRoute("/platform/ai-director", ctx("member"))).toBe(false);
  });

  it("allows managers on limited platform admin routes", () => {
    expect(canAccessPlatformRoute("/platform/health", ctx("engineering_manager"))).toBe(
      true
    );
    expect(canAccessPlatformRoute("/platform/settings", ctx("engineering_manager"))).toBe(
      false
    );
  });

  it("classifies internal platform routes as advanced", () => {
    expect(requiresAdvancedPlatformAccess("/platform/prompts")).toBe(true);
    expect(requiresAdvancedPlatformAccess("/platform/health")).toBe(false);
  });
});

describe("Batch 2.12 — Advanced tool categories", () => {
  it("groups advanced tools into categories", () => {
    const categories = buildAdvancedToolCategories(ADVANCED_PLATFORM_NAVIGATION);
    expect(categories.map((c) => c.label)).toEqual(
      expect.arrayContaining([
        "AI Runtime",
        "Governance",
        "Automation",
        "Data & Knowledge",
        "Integrations",
        "Monitoring",
        "Developer Tools",
      ])
    );
  });
});

describe("Batch 2.12 — Search visibility", () => {
  it("excludes platform internals from search for normal users", () => {
    expect(shouldIncludePlatformSearchResults(ctx("member"))).toBe(false);
    expect(
      shouldIncludePlatformSearchResults(
        ctx("owner", { showAdvancedInSidebar: true })
      )
    ).toBe(true);
  });
});

describe("Platform Commerce UI — access control", () => {
  it("hides owner-only commerce routes from tenant admin", () => {
    const visible = filterSidebarNavigation(FULL_NAVIGATION, ctx("admin"));
    const labels = visible.filter((i) => i.group === "platform").map((i) => i.label);
    expect(labels).toContain("Products");
    expect(labels).not.toContain("Billing");
    expect(labels).not.toContain("Growth");
  });

  it("allows owner on commerce billing routes", () => {
    expect(canAccessPlatformRoute("/system/billing", ctx("owner"))).toBe(true);
    expect(canAccessPlatformRoute("/system/billing", ctx("admin"))).toBe(false);
    expect(canAccessPlatformRoute("/system/products", ctx("admin"))).toBe(true);
  });
});

describe("Platform Commerce UI — sidebar persistence", () => {
  it("keeps sidebar section id stable for persisted group state", () => {
    const platformSection = SIDEBAR_SECTIONS.find((s) => s.id === "platform_admin");
    expect(platformSection?.id).toBe("platform_admin");
  });
});

describe("Batch 2.12 — Sidebar section defaults", () => {
  it("keeps System Administration collapsed by default", () => {
    const platformSection = SIDEBAR_SECTIONS.find((s) => s.id === "platform_admin");
    expect(platformSection?.defaultExpanded).toBe(false);
  });

  it("platform admin section only includes platform group", () => {
    const platformSection = SIDEBAR_SECTIONS.find((s) => s.id === "platform_admin")!;
    expect(platformSection.groups).toEqual(["platform"]);
    const grouped = groupNavigation(filterSidebarNavigation(FULL_NAVIGATION, ctx("owner")));
    const items = itemsForSidebarSection(platformSection, grouped);
    expect(items.length).toBe(17);
  });
});

describe("Batch 2.12 — Engineering Command Center home", () => {
  it("remains primary engineering entry", () => {
    const visible = filterSidebarNavigation(FULL_NAVIGATION, ctx("viewer"));
    expect(visible.find((i) => i.id === "eng-dashboard")?.href).toBe("/engineering");
  });
});

describe("Batch 2.12 — Tier ordering", () => {
  it("orders tiers correctly", () => {
    expect(hasMinimumNavTier("admin", "manager")).toBe(true);
    expect(hasMinimumNavTier("viewer", "engineer")).toBe(false);
    expect(canSeeNavItem(PLATFORM_NAVIGATION[0]!, ctx("engineering_manager"))).toBe(
      false
    );
  });
});
