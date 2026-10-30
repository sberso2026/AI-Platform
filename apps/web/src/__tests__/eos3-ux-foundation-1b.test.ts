import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ENGINEERING_HUB_BRANCHES,
  countForbiddenTermsInPrimaryNav,
} from "../lib/engineering/project-workspace-ia";
import { MY_WORK_CATEGORIES } from "../lib/engineering/eos3-my-work-ui";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");

function read(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-3-UX-FOUNDATION-1B approved functional reference Home", () => {
  it("implements three-zone Home with functional attention and hub", () => {
    const page = read("src/app/(platform)/engineering/page.tsx");
    expect(page).toContain("home-three-zone-layout");
    expect(page).toContain("HomeAttentionColumn");
    expect(page).toContain("EngineeringHubRadial");
    expect(page).toContain("home-my-projects");
    expect(page).toContain("home-recent-activity");
    expect(page).toContain("eos-engineering-work-surface");
    expect(page).not.toContain("Command Centre");
    expect(page).not.toContain("Open Engineering Workbench");
  });

  it("exposes ten clickable hub branches as real links, not raster UI", () => {
    expect(ENGINEERING_HUB_BRANCHES).toHaveLength(10);
    const hub = read("src/components/engineering/home/engineering-hub-radial.tsx");
    expect(hub).toContain("home-hub-branches");
    expect(hub).toContain("home-hub-centre");
    expect(hub).toContain("RTB");
    expect(hub).toContain("Engineering OS");
    expect(hub).toContain("home-hub-${b.id}");
    expect(hub).toContain("{b.label}");
    expect(hub).toContain("ENGINEERING_HUB_BRANCHES");
    expect(ENGINEERING_HUB_BRANCHES.map((b) => b.label)).toEqual([
      "Scope & Design Basis",
      "Engineering Design",
      "Work Packages",
      "Interfaces & Coordination",
      "Changes & Decisions",
      "Reviews & Approvals",
      "Deliverables & Records",
      "Assets & Systems",
      "Site & Handover",
      "Engineering Reference",
    ]);
    expect(hub).not.toContain("<img");
    expect(hub).not.toContain("usemap");
    expect(hub).not.toContain("backgroundImage");
    expect(countForbiddenTermsInPrimaryNav()).toBe(0);
  });

  it("wires attention cards to real My Work / Reviews / Decisions routes", () => {
    const page = read("src/app/(platform)/engineering/page.tsx");
    expect(page).toContain("/engineering/my?cat=needs-action");
    expect(page).toContain("/review?filter=assigned");
    expect(page).toContain("/engineering/decisions");
    expect(page).toContain("/engineering/my?cat=waiting-for-others");
    expect(page).toContain("/engineering/risks");
    expect(page).toContain("/engineering/my?cat=recently-completed");
    const attention = read("src/components/engineering/home/home-attention-column.tsx");
    expect(attention).toContain("home-left-attention-column");
    expect(attention).toContain("aria-label");
  });

  it("uses a single compact pilot banner", () => {
    const layout = read("src/app/(platform)/engineering/layout.tsx");
    expect(layout).toContain("CompactPilotBanner");
    expect(layout).not.toContain("EngineeringAuthorityNotice");
    const notices = read("src/components/pilot/pilot-notices.tsx");
    expect(notices).toContain('data-eos-pilot-banner-count="1"');
    expect(notices).toContain("Approved/synthetic data only");
    expect(notices).toContain("PILOT_DATA_NOTICE");
    expect(notices).toContain("ENGINEERING_AUTHORITY_NOTICE");
  });

  it("keeps My Work dense and functionally filterable", () => {
    const my = read("src/app/(platform)/engineering/my/page.tsx");
    expect(my).toContain("my-work-search");
    expect(my).toContain("my-work-next-action");
    expect(my).toContain('data-eos-decorative-images="0"');
    expect(my).toContain("setCategory");
    expect(MY_WORK_CATEGORIES.some((c) => c.id === "needs-action")).toBe(true);
  });

  it("defines light engineering work surface CSS overrides", () => {
    const css = read("src/app/globals.css");
    expect(css).toContain(".eos-engineering-work-surface");
    expect(css).toContain("--eos-work-surface");
    expect(css).toContain("--eos-gold");
    expect(css).toContain("--eos-navy");
  });

  it("records UX-1B visual/functional artifacts", () => {
    expect(existsSync(resolve(DOCS, "EOS_3_UX_FOUNDATION_1B_VISUAL_SPEC.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_UX_FOUNDATION_1B_FUNCTIONAL_CONTRACT.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_UX_FOUNDATION_1B_MANIFEST.json"))).toBe(true);
  });
});
