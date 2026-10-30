import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ENGINEERING_NAVIGATION,
  filterSidebarNavigation,
} from "@rtb/platform-core";
import type { Permission } from "@rtb/types";
import {
  ENGINEERING_HUB_BRANCHES,
  PROJECT_WORKSPACE_NAV_GROUPS,
  countForbiddenTermsInPrimaryNav,
  primaryEngineerNavLabels,
} from "../lib/engineering/project-workspace-ia";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");

function read(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

function viewerCtx() {
  const permissions: Permission[] = [];
  return {
    roleSlug: "viewer",
    tier: "viewer" as const,
    permissions,
    showAdvancedInSidebar: false,
    hasPermission: () => false,
    activeOperatingSystemIds: ["engineering"],
  };
}

describe("EOS-3-UX-FOUNDATION-1A default workspace cutover", () => {
  it("documents legacy Command Centre root cause", () => {
    expect(existsSync(resolve(DOCS, "EOS_3_UX_FOUNDATION_1A_ROOT_CAUSE.md"))).toBe(true);
    const cause = readFileSync(resolve(DOCS, "EOS_3_UX_FOUNDATION_1A_ROOT_CAUSE.md"), "utf8");
    expect(cause).toContain("engineering/page.tsx");
    expect(cause).toContain("Command Centre");
    expect(cause).toContain("Open Engineering Workbench");
  });

  it("makes approved Home the default /engineering experience", () => {
    const page = read("src/app/(platform)/engineering/page.tsx");
    expect(page).toContain('data-testid="engineering-approved-home"');
    expect(page).toContain("title=\"Home\"");
    expect(page).toContain("Needs Action");
    expect(page).toContain("home-engineering-hub");
    expect(page).not.toContain("Command Centre");
    expect(page).not.toContain("Open Engineering Workbench");
    expect(page).not.toContain("Engineering Intelligence Core");
    expect(page).not.toContain("System Review");
    expect(page).toContain("ENGINEERING_HUB_BRANCHES");
    expect(page).toContain("home-hub-branches");
    expect(ENGINEERING_HUB_BRANCHES.length).toBeGreaterThanOrEqual(10);
  });

  it("redirects legacy command-centre and labels workbench as legacy", () => {
    expect(read("src/app/(platform)/command-centre/page.tsx")).toContain('redirect("/engineering")');
    const work = read("src/app/(platform)/engineering/work/page.tsx");
    expect(work).toContain("legacy-engineering-workbench");
    expect(work).toContain("Legacy Workbench");
  });

  it("exposes approved global nav including Reviews and Administration", () => {
    const visible = filterSidebarNavigation(ENGINEERING_NAVIGATION, viewerCtx());
    const labels = visible.map((i) => i.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        "Home",
        "Projects",
        "My Work",
        "Reviews",
        "Changes",
        "Administration",
      ]),
    );
    const withDocs = filterSidebarNavigation(ENGINEERING_NAVIGATION, {
      ...viewerCtx(),
      entitledApplicationKeys: ["documents"],
    } as ReturnType<typeof viewerCtx> & { entitledApplicationKeys: string[] });
    expect(withDocs.map((i) => i.label)).toEqual(expect.arrayContaining(["Documents"]));
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-review")?.audience).toBe("viewer");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-administration")?.href).toBe(
      "/engineering/administration",
    );
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-ask")?.label).toBe("AI");
    const adminPage = read("src/app/(platform)/engineering/administration/page.tsx");
    expect(adminPage).toContain('data-testid="engineering-administration"');
  });

  it("keeps approved project navigation without software terminology", () => {
    const ids = PROJECT_WORKSPACE_NAV_GROUPS.map((g) => g.id);
    expect(ids).toEqual(["work", "engineering", "information", "execution", "advanced"]);
    const labels = primaryEngineerNavLabels();
    expect(labels).toEqual(
      expect.arrayContaining([
        "Guided Engineering",
        "Work Packages",
        "Engineering Design",
        "Assets & Systems",
        "Site & Handover",
        "Engineering Reference",
      ]),
    );
    expect(countForbiddenTermsInPrimaryNav()).toBe(0);
  });

  it("compacts pilot notices and deemphasizes workspace technical identity", () => {
    const notices = read("src/components/pilot/pilot-notices.tsx");
    expect(notices).toContain("pilot-notice-toggle");
    expect(notices).toContain("Controlled pilot");
    const switcher = read("src/components/layout/workspace-switcher.tsx");
    expect(switcher).toContain("{selected ? selected.slug : \"Select workspace\"}");
  });

  it("preserves independent scroll shell", () => {
    const shell = read("src/components/engineering/project-workspace/shell.tsx");
    expect(shell).toContain("project-workspace-nav-scroll");
    expect(shell).toContain("project-workspace-content-scroll");
  });
});
