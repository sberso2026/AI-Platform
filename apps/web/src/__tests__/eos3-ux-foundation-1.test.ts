import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  ENGINEERING_NAVIGATION,
  SIDEBAR_SECTIONS,
} from "@rtb/platform-core";
import {
  ENGINEERING_HUB_BRANCHES,
  FORBIDDEN_ENGINEER_FACING_TERMS,
  PROJECT_WORKSPACE_NAV_GROUPS,
  countForbiddenTermsInPrimaryNav,
  engineerFacingGovernedLabel,
  findWorkspaceNavItem,
  primaryEngineerNavLabels,
  proposedConfirmedEmptyCopy,
  resolveWorkspaceSlug,
  workspaceHref,
} from "../lib/engineering/project-workspace-ia";
import { MY_WORK_CATEGORIES } from "../lib/engineering/eos3-my-work-ui";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");

function read(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-3-UX-FOUNDATION-1 approved engineering workspace shell", () => {
  it("implements stable global shell labels in engineering language", () => {
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-home")?.label).toBe("Home");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-projects")?.label).toBe("Projects");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-my")?.label).toBe("My Work");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-review")?.label).toBe("Reviews");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-changes")?.label).toBe("Changes");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-documents")?.label).toBe("Documents");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-ask")?.label).toBe("AI");
    expect(SIDEBAR_SECTIONS.some((s) => s.label === "Administration")).toBe(true);
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-pilot-feedback")?.sidebarHidden).toBe(
      true,
    );
  });

  it("uses engineering-language project navigation without IT terminology", () => {
    const labels = primaryEngineerNavLabels();
    expect(labels).toEqual(
      expect.arrayContaining([
        "Guided Engineering",
        "Work Packages",
        "Scope & Design Basis",
        "Engineering Design",
        "Interfaces & Coordination",
        "Changes & Decisions",
        "Reviews & Approvals",
        "Deliverables & Records",
        "Assets & Systems",
        "Engineering Reference",
        "Dependencies",
        "Site & Handover",
      ]),
    );
    expect(labels.some((l) => l === "Project to Asset")).toBe(false);
    expect(countForbiddenTermsInPrimaryNav()).toBe(0);
    for (const term of FORBIDDEN_ENGINEER_FACING_TERMS) {
      expect(labels.join(" | ")).not.toContain(term);
    }
    expect(findWorkspaceNavItem("digital-thread")?.advanced).toBe(true);
    expect(findWorkspaceNavItem("digital-thread")?.label).toContain("Full view");
  });

  it("keeps independent scroll shell markers and context header", () => {
    const shell = read("src/components/engineering/project-workspace/shell.tsx");
    const layout = read("src/app/(platform)/engineering/projects/[projectId]/layout.tsx");
    expect(shell).toContain("project-workspace-nav-scroll");
    expect(shell).toContain("project-workspace-content-scroll");
    expect(shell).toContain("overflow-y-auto");
    expect(shell).toContain("pilot-feedback-control");
    expect(shell).toContain("isPilotFeedbackEnabled");
    expect(shell).toContain("engineering-context-header");
    expect(layout).toContain("overflow-hidden");
    expect(layout).toContain("Facility / Area");
    expect(layout).toContain("contextHeader");
  });

  it("aligns engineering hub branches and Work Package primary execution", () => {
    expect(ENGINEERING_HUB_BRANCHES.map((b) => b.label)).toEqual(
      expect.arrayContaining([
        "Scope & Design Basis",
        "Engineering Design",
        "Work Packages",
        "Assets & Systems",
        "Site & Handover",
      ]),
    );
    const overview = read("src/components/engineering/project-workspace/overview.tsx");
    expect(overview).toContain("work-package-primary-execution");
    expect(overview).toContain("engineering-hub");
    expect(overview).toContain("Engineering Design");
    expect(overview).not.toContain("Project-to-asset readiness");
  });

  it("implements Work Package cockpit with contextual tabs and engineering overview", () => {
    const wp = read("src/components/engineering/project-workspace/work-packages-panel.tsx");
    expect(wp).toContain("wp-cockpit-foundation");
    expect(wp).toContain("wp-contextual-tabs");
    expect(wp).toContain("wp-engineering-overview");
    expect(wp).toContain("Needs attention");
    expect(wp).toContain("Next recommended action");
    expect(wp).toContain("wp-context-header");
    expect(wp).toContain("not engineering approver");
  });

  it("implements My Work foundation without decorative images", () => {
    expect(MY_WORK_CATEGORIES.map((c) => c.label)).toEqual([
      "Needs Action",
      "Changed",
      "Reviews",
      "Decisions",
      "Waiting for Me",
      "Waiting for Others",
      "At Risk",
      "Recently Completed",
    ]);
    const my = read("src/app/(platform)/engineering/my/page.tsx");
    expect(my).toContain("my-work-foundation");
    expect(my).toContain('data-eos-decorative-images="0"');
    expect(my).not.toMatch(/<img\b/i);
    expect(my).not.toMatch(/backgroundImage|unsplash|hero/i);
  });

  it("reconciles proposed vs confirmed empty states and hides governance jargon", () => {
    const empty = proposedConfirmedEmptyCopy("requirements", 0, 1);
    expect(empty.title).toBe("No confirmed requirements");
    expect(empty.description).toContain("1 proposed");
    expect(engineerFacingGovernedLabel("PROPOSED · HIGH/HIGH · PROPOSE_AND_CONFIRM").label).toBe(
      "Needs confirmation",
    );
    const register = read("src/components/engineering/project-workspace/object-register.tsx");
    expect(register).toContain("governed-label-friendly");
    expect(register).toContain("explainability-why");
    expect(register).toContain("Needs confirmation");
  });

  it("preserves Guided objective reuse and progressive explainability", () => {
    const guided = read("src/components/engineering/project-workspace/guided-panel.tsx");
    expect(guided).toContain("guided-objective-reuse");
    expect(guided).toContain("Why?");
    expect(guided).not.toContain("Why EOS suggested this");
    expect(guided).toContain("Needs confirmation");
  });

  it("exposes Assets & Systems, Dependencies, and Decisions in engineering language", () => {
    expect(resolveWorkspaceSlug("systems")).toBe("interfaces");
    expect(workspaceHref("p1", "calculations")).toBe(
      "/engineering/projects/p1/engineering-design",
    );
    const cap = read("src/components/engineering/project-workspace/capability-view.tsx");
    expect(cap).toContain("dependencies-engineering-ui");
    expect(cap).toContain("decision-engineering-ui");
    expect(cap).toContain("contextual-assumptions");
    expect(cap).toContain("scope-design-basis-panel");
    expect(cap).toContain("engineering-design-panel");
    expect(cap).toContain("lifecycle-compact-summary");
    expect(cap).toContain("View maturity details");
    expect(PROJECT_WORKSPACE_NAV_GROUPS.find((g) => g.id === "advanced")?.advanced).toBe(true);
  });

  it("documents UX foundation artifacts", () => {
    const files = [
      "EOS_3_APPROVED_ENGINEERING_UI_FOUNDATION.md",
      "EOS_3_ENGINEERING_LANGUAGE_INFORMATION_ARCHITECTURE.md",
      "EOS_3_WORK_PACKAGE_COCKPIT_UI.md",
      "EOS_3_MY_WORK_UI_FOUNDATION.md",
      "EOS_3_UI_PROGRESSIVE_DISCLOSURE.md",
      "EOS_3_UX_FOUNDATION_PILOT_VALIDATION.md",
      "EOS_3_UX_FOUNDATION_1_MANIFEST.json",
    ];
    for (const f of files) {
      expect(existsSync(resolve(DOCS, f))).toBe(true);
    }
  });
});
