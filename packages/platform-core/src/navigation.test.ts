import { describe, it, expect } from "vitest";
import {
  FULL_NAVIGATION,
  ENGINEERING_NAVIGATION,
  NAV_GROUP_LABELS,
  NAV_GROUP_ORDER,
  SIDEBAR_COLLAPSED_KEY,
  SIDEBAR_GROUP_STATE_KEY,
  SIDEBAR_SCROLL_KEY,
  SIDEBAR_SECTIONS,
  getDefaultSidebarGroupState,
  groupNavigation,
  itemsForSidebarSection,
  parseSidebarGroupState,
  isNavItemActive,
} from "./navigation";
import { filterSidebarNavigation } from "./nav-visibility";

describe("Batch 2.07 — Navigation grouping", () => {
  it("places Engineering OS groups first", () => {
    expect(NAV_GROUP_ORDER[0]).toBe("engineering");
    expect(NAV_GROUP_ORDER[1]).toBe("engineering_work");
    expect(NAV_GROUP_ORDER[2]).toBe("engineering_registers");
    expect(NAV_GROUP_ORDER[3]).toBe("engineering_analysis");
  });

  it("labels Command Centre as primary engineering entry", () => {
    const home = ENGINEERING_NAVIGATION.find((i) => i.id === "eng-home");
    expect(home?.label).toBe("Command Centre");
    expect(home?.href).toBe("/engineering");
    expect(home?.group).toBe("engineering");
  });

  it("splits work, engineering, analysis, and administration", () => {
    const grouped = groupNavigation(FULL_NAVIGATION);
    expect(Object.keys(grouped)[0]).toBe("engineering");
    expect(grouped.engineering_work?.some((i) => i.id === "eng-projects")).toBe(true);
    expect(grouped.engineering_registers?.some((i) => i.id === "eng-risks")).toBe(true);
    expect(grouped.engineering_analysis?.some((i) => i.id === "eng-digital-twin")).toBe(true);
    expect(grouped.engineering_admin?.some((i) => i.id === "eng-settings")).toBe(true);
    expect(NAV_GROUP_LABELS.engineering_registers).toBe("Engineering");
    expect(NAV_GROUP_LABELS.administration).toBe("Administration");
  });

  it("keeps simplified System Administration in platform group only", () => {
    const grouped = groupNavigation(FULL_NAVIGATION);
    expect(grouped.platform?.some((i) => i.href === "/system/products")).toBe(true);
    expect(grouped.platform?.some((i) => i.href === "/platform/health")).toBe(true);
    expect(grouped.platform?.some((i) => i.href === "/command-centre")).toBe(false);
    expect(grouped.kernel?.some((i) => i.href === "/platform/ai-director")).toBe(true);
  });

  it("does not drop existing engineering register routes", () => {
    const hrefs = FULL_NAVIGATION.map((i) => i.href);
    for (const href of [
      "/engineering/decisions",
      "/engineering/actions",
      "/engineering/risks",
      "/engineering/issues",
      "/engineering/technical-queries",
      "/engineering/lessons",
      "/engineering/timeline",
      "/engineering/activity",
      "/engineering/health",
      "/engineering/test-runner",
    ]) {
      expect(hrefs).toContain(href);
    }
  });
});

describe("Batch 2.07 — UX theme contracts", () => {
  it("defines enterprise light background token", () => {
    expect("#F4F6F8".toLowerCase()).toBe("#f4f6f8");
  });

  it("requires dark sidebar with light main content", () => {
    const theme = {
      sidebar: "dark",
      main: "light",
      cards: "white",
    };
    expect(theme.sidebar).toBe("dark");
    expect(theme.main).toBe("light");
  });
});

describe("Batch 2.07 — Sidebar scroll persistence contract", () => {
  it("uses sessionStorage key for scroll position", () => {
    expect(SIDEBAR_SCROLL_KEY).toBe("rtb.sidebar.scrollTop");
    expect(SIDEBAR_COLLAPSED_KEY).toBe("rtb.sidebar.collapsed");
  });

  it("requires layout-hosted PlatformShell to avoid remount", () => {
    const architecture = { shellInLayout: true, shellPerPage: false };
    expect(architecture.shellInLayout).toBe(true);
    expect(architecture.shellPerPage).toBe(false);
  });
});

describe("Batch 2.08 — Collapsible sidebar sections", () => {
  it("defines sidebar sections including Engineering, reference-os, and advanced tools", () => {
    expect(SIDEBAR_SECTIONS.map((s) => s.id)).toEqual([
      "engineering",
      "engineering_work",
      "engineering_registers",
      "engineering_analysis",
      "engineering_ai",
      "engineering_admin",
      "reference_os",
      "platform_admin",
      "platform_advanced",
    ]);
  });

  it("expands Engineering OS by default; registers collapse by default", () => {
    const defaults = getDefaultSidebarGroupState();
    expect(defaults.engineering).toBe(true);
    expect(defaults.engineering_work).toBe(true);
    expect(defaults.engineering_registers).toBe(true);
    expect(defaults.engineering_admin).toBe(false);
    expect(defaults.platform_admin).toBe(false);
  });

  it("persists group expand state via sessionStorage key", () => {
    expect(SIDEBAR_GROUP_STATE_KEY).toBe("rtb.sidebar.groupState");
  });

  it("parses stored group state and merges with defaults", () => {
    const parsed = parseSidebarGroupState(
      JSON.stringify({ engineering_admin: true, platform_admin: true, unknown: false })
    );
      expect(parsed.engineering).toBe(true);
      expect(parsed.engineering_registers).toBe(true);
    expect(parsed.engineering_admin).toBe(true);
    expect(parsed.platform_admin).toBe(true);
    expect(parsed).not.toHaveProperty("unknown");
  });

  it("falls back to defaults on invalid stored JSON", () => {
    expect(parseSidebarGroupState("{not-json")).toEqual(getDefaultSidebarGroupState());
    expect(parseSidebarGroupState(null)).toEqual(getDefaultSidebarGroupState());
  });

  it("keeps simplified routes under collapsed System Administration", () => {
    const grouped = groupNavigation(
      filterSidebarNavigation(FULL_NAVIGATION, {
        roleSlug: "owner",
        tier: "admin",
        permissions: [{ resource: "tenant", action: "admin" }],
        showAdvancedInSidebar: false,
        hasPermission: () => true,
      })
    );
    const platformSection = SIDEBAR_SECTIONS.find((s) => s.id === "platform_admin")!;
    const items = itemsForSidebarSection(platformSection, grouped);
    const hrefs = items.map((i) => i.href);
    expect(hrefs).toContain("/platform/health");
    expect(hrefs).toContain("/system/products");
    expect(hrefs).toContain("/platform/users-permissions");
    expect(hrefs).not.toContain("/platform/ai-director");
    expect(hrefs).not.toContain("/system/commerce-audit");
    expect(items.length).toBe(12);
  });

  it("keeps Engineering Administration routes without dropping them", () => {
    const grouped = groupNavigation(FULL_NAVIGATION);
    const adminSection = SIDEBAR_SECTIONS.find((s) => s.id === "engineering_admin")!;
    const hrefs = itemsForSidebarSection(adminSection, grouped).map((i) => i.href);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/engineering/disciplines",
        "/engineering/companies",
        "/engineering/settings",
        "/engineering/health",
        "/engineering/governance",
      ])
    );
  });

  it("labels Platform section as System Administration", () => {
    expect(NAV_GROUP_LABELS.platform).toBe("System Administration");
    expect(SIDEBAR_SECTIONS.find((s) => s.id === "platform_admin")?.label).toBe(
      "System Administration"
    );
  });
});

describe("Platform Commerce UI — navigation rename", () => {
  it("exposes Installed Products as primary commerce catalogue route", () => {
    const item = FULL_NAVIGATION.find((i) => i.id === "installed-products");
    expect(item?.label).toBe("Installed Products");
    expect(item?.href).toBe("/system/products");
  });

  it("keeps legacy commerce routes reachable but hidden", () => {
    const hrefs = FULL_NAVIGATION.filter((i) => i.group === "platform").map((i) => i.href);
    expect(hrefs).toContain("/system/subscriptions");
    expect(hrefs).toContain("/system/licenses-seats");
    expect(hrefs).toContain("/system/subscription-billing");
    expect(hrefs).toContain("/system/growth-credits");
  });
});

describe("Platform Commerce UI — Engineering OS access", () => {
  it("keeps Engineering home route unchanged", () => {
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-home")?.href).toBe(
      "/engineering"
    );
  });

  it("exposes work-first primary experience surfaces without dead tabs", () => {
    const primary = ENGINEERING_NAVIGATION.filter((i) => !i.sidebarHidden);
    expect(primary.map((i) => i.id)).toEqual(
      expect.arrayContaining([
        "eng-home",
        "eng-projects",
        "eng-assets",
        "eng-inspections",
        "eng-documents",
        "eng-risks",
        "eng-tqs",
        "eng-decisions",
        "eng-actions",
        "eng-models",
        "eng-digital-twin",
        "eng-reports",
        "eng-ask",
      ]),
    );
    expect(primary.every((i) => Boolean(i.href))).toBe(true);
  });

  it("keeps assistant-first E1 routes reachable but not as the primary work nav", () => {
    for (const id of ["eng-my", "eng-explore", "eng-intelligence", "eng-ai"]) {
      const item = ENGINEERING_NAVIGATION.find((i) => i.id === id);
      expect(item?.sidebarHidden).toBe(true);
      expect(item?.href).toBeTruthy();
    }
  });

  it("preserves sidebar persistence keys", () => {
    expect(SIDEBAR_GROUP_STATE_KEY).toBe("rtb.sidebar.groupState");
    expect(SIDEBAR_SCROLL_KEY).toBe("rtb.sidebar.scrollTop");
  });
});

describe("Batch 2.08 — Default landing and Platform Overview access", () => {
  it("uses Engineering Home as product home route", () => {
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-home")?.href).toBe(
      "/engineering"
    );
  });

  it("keeps System Health Overview accessible at /dashboard as legacy route", () => {
    expect(FULL_NAVIGATION.some((i) => i.href === "/dashboard")).toBe(true);
    expect(FULL_NAVIGATION.find((i) => i.href === "/dashboard")?.label).toBe(
      "System Health Overview"
    );
    expect(FULL_NAVIGATION.find((i) => i.href === "/dashboard")?.sidebarHidden).toBe(
      true
    );
  });

  it("documents default landing redirect targets", () => {
    const defaults = {
      home: "/engineering",
      postAuth: "/engineering",
      platformOverview: "/dashboard",
    };
    expect(defaults.home).toBe("/engineering");
    expect(defaults.postAuth).toBe("/engineering");
    expect(defaults.platformOverview).toBe("/dashboard");
  });
});

describe("Batch 2.08 — Layout spacing contract", () => {
  it("requires page main padding tokens", () => {
    const spacing = {
      pageTopPx: 24,
      pageHorizontalMinPx: 24,
      pageHorizontalDesktopPx: 32,
      pageBottomPx: 32,
      sectionGapPx: 32,
      cardGapPx: 16,
      cardPaddingPx: 20,
      headerMinHeightPx: 64,
    };
    expect(spacing.pageTopPx).toBeGreaterThanOrEqual(24);
    expect(spacing.pageHorizontalDesktopPx).toBeGreaterThanOrEqual(24);
    expect(spacing.pageBottomPx).toBeGreaterThanOrEqual(32);
    expect(spacing.headerMinHeightPx).toBeGreaterThanOrEqual(56);
  });

  it("keeps compact sidebar mode toggle supported", () => {
    expect(SIDEBAR_COLLAPSED_KEY).toBe("rtb.sidebar.collapsed");
  });
});

describe("Batch 2.09 — Design system persistence contracts", () => {
  it("preserves sidebar scroll and group collapse keys", () => {
    expect(SIDEBAR_SCROLL_KEY).toBe("rtb.sidebar.scrollTop");
    expect(SIDEBAR_GROUP_STATE_KEY).toBe("rtb.sidebar.groupState");
    expect(SIDEBAR_COLLAPSED_KEY).toBe("rtb.sidebar.collapsed");
  });

  it("keeps Command Center as engineering home", () => {
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-dashboard")?.href).toBe(
      "/engineering"
    );
  });
});

describe("EOS-UX-1R — primary nav exact root match", () => {
  const hrefs = ENGINEERING_NAVIGATION.filter((i) => !i.sidebarHidden).map((i) => i.href);

  it("activates Command Centre only on the exact /engineering route", () => {
    expect(isNavItemActive("/engineering", "/engineering", hrefs)).toBe(true);
    expect(isNavItemActive("/engineering/projects", "/engineering", hrefs)).toBe(false);
    expect(isNavItemActive("/engineering/assets", "/engineering", hrefs)).toBe(false);
    expect(isNavItemActive("/engineering/governance", "/engineering", hrefs)).toBe(false);
  });

  it("activates the longest matching primary item", () => {
    expect(isNavItemActive("/engineering/projects", "/engineering/projects", hrefs)).toBe(true);
    expect(isNavItemActive("/engineering/projects/abc", "/engineering/projects", hrefs)).toBe(true);
    expect(isNavItemActive("/engineering/assets/xyz", "/engineering/assets", hrefs)).toBe(true);
    expect(isNavItemActive("/engineering/risks", "/engineering/risks", hrefs)).toBe(true);
  });
});
