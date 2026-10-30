import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ENGINEERING_HUB_BRANCHES,
  ENGINEERING_HUB_BRANCH_COUNT,
  ENGINEERING_HUB_CENTRAL_IMAGE_SRC,
  countForbiddenTermsInPrimaryNav,
} from "../lib/engineering/project-workspace-ia";
import { ENGINEERING_NAVIGATION, filterSidebarNavigation } from "@rtb/platform-core";
import type { Permission } from "@rtb/types";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const PUBLIC = resolve(WEB_ROOT, "public");

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

describe("EOS-3-UX-FOUNDATION-1C Home functional reference lock", () => {
  it("locks major Home geometry and three-zone composition", () => {
    const page = read("src/app/(platform)/engineering/page.tsx");
    expect(page).toContain("home-three-zone-layout");
    expect(page).toContain('data-eos-home-architecture-locked="yes"');
    expect(page).toContain("approved-engineering-1c-locked");
    expect(page).toContain("HomeAttentionColumn");
    expect(page).toContain("EngineeringHubRadial");
    expect(page).toContain("home-my-projects");
    expect(page).toContain("home-recent-activity");
    expect(page).not.toContain("Command Centre");
    expect(page).not.toContain("KPI");
  });

  it("requires industrial hub asset and DOM branch cards with descriptions", () => {
    expect(ENGINEERING_HUB_BRANCH_COUNT).toBe(10);
    expect(ENGINEERING_HUB_BRANCHES).toHaveLength(10);
    expect(ENGINEERING_HUB_CENTRAL_IMAGE_SRC).toBe("/eos/engineering-hub-plant.webp");
    expect(existsSync(resolve(PUBLIC, "eos/engineering-hub-plant.webp"))).toBe(true);

    const hub = read("src/components/engineering/home/engineering-hub-radial.tsx");
    expect(hub).toContain("home-hub-industrial-image");
    expect(hub).toContain("data-eos-hub-central-image-decorative");
    expect(hub).toContain("home-hub-connectors");
    expect(hub).toContain('data-eos-hub-connector-data-model="no"');
    expect(hub).toContain("{b.label}");
    expect(hub).toContain("{b.description}");
    expect(hub).toContain("BRANCH_ICONS");
    expect(hub).not.toContain("usemap");
    expect(hub).not.toContain("backgroundImage");

    for (const b of ENGINEERING_HUB_BRANCHES) {
      expect(b.description.length).toBeGreaterThan(8);
      expect(b.icon.length).toBeGreaterThan(2);
    }
    expect(countForbiddenTermsInPrimaryNav()).toBe(0);
    const hubSrc = hub.toLowerCase();
    for (const term of [
      "intelligence layer",
      "orchestration",
      "canonical state",
      "context resolver",
      "data fabric",
      "automation engine",
    ]) {
      expect(hubSrc).not.toContain(term);
    }
  });

  it("locks attention card destinations and count of seven", () => {
    const page = read("src/app/(platform)/engineering/page.tsx");
    expect(page).toContain('id: "needs-action"');
    expect(page).toContain('id: "changed"');
    expect(page).toContain('id: "reviews"');
    expect(page).toContain('id: "decisions"');
    expect(page).toContain('id: "waiting-others"');
    expect(page).toContain('id: "at-risk"');
    expect(page).toContain('id: "completed"');
    expect(page).toContain("/engineering/my?cat=needs-action");
    expect(page).toContain("/engineering/changes");
    expect(page).toContain("/review?filter=assigned");
    expect(page).toContain("/engineering/decisions");
    expect(page).toContain("/engineering/my?cat=waiting-for-others");
    expect(page).toContain("/engineering/risks");
    expect(page).toContain("/engineering/my?cat=recently-completed");
    const attention = read("src/components/engineering/home/home-attention-column.tsx");
    expect(attention).toContain("aria-label");
    expect(attention).toContain("focus-visible:outline");
  });

  it("uses canonical recent documents for activity — no fabricated project events", () => {
    const page = read("src/app/(platform)/engineering/page.tsx");
    expect(page).toContain("recentDocuments");
    expect(page).toContain("home-activity-empty");
    expect(page).not.toContain("Project workspace active —");
  });

  it("keeps stable global nav including Administration", () => {
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
  });

  it("keeps My Work free of decorative imagery", () => {
    const my = read("src/app/(platform)/engineering/my/page.tsx");
    expect(my).toContain('data-eos-decorative-images="0"');
  });

  it("documents Home architecture lock and UX-1C artifacts", () => {
    expect(existsSync(resolve(DOCS, "EOS_3_UX_FOUNDATION_1C_HOME_REFERENCE_LOCK.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_UX_FOUNDATION_1C_HOME_FUNCTIONAL_CONTRACT.md"))).toBe(
      true,
    );
    expect(existsSync(resolve(DOCS, "EOS_3_UX_FOUNDATION_1C_HOME_VISUAL_COMPARISON.md"))).toBe(
      true,
    );
    expect(existsSync(resolve(DOCS, "EOS_3_UX_FOUNDATION_1C_MANIFEST.json"))).toBe(true);
    const lock = readFileSync(
      resolve(DOCS, "EOS_3_UX_FOUNDATION_1C_HOME_REFERENCE_LOCK.md"),
      "utf8",
    );
    expect(lock).toContain("HOME_UI_ARCHITECTURE_LOCKED");
    expect(lock).toContain("EOS_HOME_MAJOR_GEOMETRY_LOCKED");
  });
});
