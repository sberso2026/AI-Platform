import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ENGINEERING_NAVIGATION,
  SIDEBAR_SECTIONS,
  filterSidebarNavigation,
  groupNavigation,
  isNavItemActive,
  itemsForSidebarSection,
} from "@rtb/platform-core";
import type { Permission } from "@rtb/types";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

function viewerCtx(activeOperatingSystemIds: string[] = ["engineering"]) {
  const permissions: Permission[] = [];
  return {
    roleSlug: "viewer",
    tier: "viewer" as const,
    permissions,
    showAdvancedInSidebar: false,
    hasPermission: () => false,
    activeOperatingSystemIds,
  };
}

describe("EOS-SHELL-NAV-1 restore Engineering Systems navigation", () => {
  it("places Engineering Systems second in Engineering OS, then Work items", () => {
    const visible = filterSidebarNavigation(ENGINEERING_NAVIGATION, viewerCtx());
    const grouped = groupNavigation(visible);
    const engineeringOs = SIDEBAR_SECTIONS.find((s) => s.id === "engineering")!;
    const work = SIDEBAR_SECTIONS.find((s) => s.id === "engineering_work")!;
    const osItems = itemsForSidebarSection(engineeringOs, grouped);
    const workOrder = itemsForSidebarSection(work, groupNavigation(ENGINEERING_NAVIGATION));

    expect(osItems.map((i) => i.id)).toEqual(["eng-home", "eng-modules"]);
    expect(osItems.map((i) => i.label)).toEqual(["Command Centre", "Engineering Systems"]);
    expect(workOrder.filter((i) => !i.sidebarHidden).map((i) => i.id).slice(0, 4)).toEqual([
      "eng-projects",
      "eng-assets",
      "eng-inspections",
      "eng-documents",
    ]);
    expect(workOrder.filter((i) => !i.sidebarHidden).map((i) => i.label).slice(0, 4)).toEqual([
      "Projects",
      "Assets",
      "Inspections",
      "Documents",
    ]);
  });

  it("uses the existing modules route, grid icon, and does not hide or app-gate the item", () => {
    const item = ENGINEERING_NAVIGATION.find((i) => i.id === "eng-modules");
    expect(item?.href).toBe("/engineering/modules");
    expect(item?.icon).toBe("AppWindow");
    expect(item?.group).toBe("engineering");
    expect(item?.audience).toBe("viewer");
    expect(item?.sidebarHidden).toBeFalsy();
    expect(item?.applicationKey).toBeUndefined();
    expect(item?.permissions).toBeUndefined();
  });

  it("does not highlight Command Centre and Engineering Systems at the same time", () => {
    const hrefs = ENGINEERING_NAVIGATION.filter((i) => !i.sidebarHidden).map((i) => i.href);
    const commandCentre = "/engineering";
    const systems = "/engineering/modules";

    expect(isNavItemActive("/engineering", commandCentre, hrefs)).toBe(true);
    expect(isNavItemActive("/engineering", systems, hrefs)).toBe(false);

    expect(isNavItemActive("/engineering/modules", commandCentre, hrefs)).toBe(false);
    expect(isNavItemActive("/engineering/modules", systems, hrefs)).toBe(true);
  });

  it("keeps Sign out outside the sidebar scroll container", () => {
    const sidebar = readApp("src/components/layout/sidebar.tsx");
    const scrollIdx = sidebar.indexOf('data-testid="sidebar-nav-scroll"');
    const signOutIdx = sidebar.indexOf('data-testid="sidebar-sign-out"');
    expect(scrollIdx).toBeGreaterThan(-1);
    expect(signOutIdx).toBeGreaterThan(scrollIdx);
    expect(sidebar).toContain("flex-1 overflow-y-auto");
    const signOutBlock = sidebar.slice(signOutIdx);
    expect(signOutBlock).not.toContain("overflow-y-auto");
  });

  it("keeps existing module Return paths unchanged", () => {
    expect(readApp("src/app/(platform)/engineering/apps/asset-intelligence/layout.tsx")).toContain(
      'returnPath="/engineering/modules"',
    );
    expect(readApp("src/app/(platform)/engineering/apps/digital-twin/layout.tsx")).toContain(
      'returnPath="/engineering/modules"',
    );
    expect(readApp("src/app/(platform)/engineering/apps/model-interoperability/layout.tsx")).toContain(
      'returnPath="/engineering/modules"',
    );
    expect(readApp("src/app/(platform)/engineering/apps/project-controls/layout.tsx")).toContain(
      'returnPath="/system/products"',
    );
  });

  it("does not introduce a new Engineering Systems route file", () => {
    const page = readApp("src/app/(platform)/engineering/modules/page.tsx");
    expect(page).toContain('title="Engineering Systems"');
    expect(page).toContain('data-testid="engineering-module-launcher"');
  });
});
