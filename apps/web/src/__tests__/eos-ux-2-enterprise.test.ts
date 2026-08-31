import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  contextualAskStarters,
  describeAskContext,
  humanizeOperationalError,
  withProjectHref,
} from "../lib/engineering/enterprise-ux";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-UX-2 enterprise presentation helpers", () => {
  it("maps technical errors to operational copy without dropping diagnostics", () => {
    const mismatch = humanizeOperationalError("Action mismatch");
    expect(mismatch.title).toBe("Cannot load this record");
    expect(mismatch.diagnostic).toBe("Action mismatch");

    const plan = humanizeOperationalError("application_not_in_plan");
    expect(plan.title).toMatch(/not included in your current plan/i);

    const missing = humanizeOperationalError("licence_not_found");
    expect(missing.title).toMatch(/do not have access/i);
  });

  it("preserves project context on operational hrefs", () => {
    expect(withProjectHref("/engineering/risks", "abc")).toBe("/engineering/risks?projectId=abc");
    expect(withProjectHref("/engineering/risks?projectId=abc", "abc")).toBe(
      "/engineering/risks?projectId=abc",
    );
    expect(withProjectHref("/engineering/risks", null)).toBe("/engineering/risks");
  });

  it("adapts AI starters to object context without implying approval authority", () => {
    const asset = contextualAskStarters({ objectType: "asset" });
    expect(asset.some((s) => /condition/i.test(s.q))).toBe(true);
    const project = contextualAskStarters({ objectType: "project", projectId: "p1" });
    expect(project.some((s) => /attention/i.test(s.q))).toBe(true);
    expect(describeAskContext({ objectType: "asset", objectId: "a1" })).toContain("Asset");
  });
});

describe("EOS-UX-2 operational screens", () => {
  it("does not flash System Administration as the pre-hydration primary nav", () => {
    const sidebar = readApp("src/components/layout/sidebar.tsx");
    expect(sidebar).toContain("sidebar-nav-skeleton");
    expect(sidebar).not.toMatch(/Fall back to platform-only navigation/);
    expect(sidebar).toContain("if (!navContext) return []");
  });

  it("hides Ask Engineering AI entry when the assistant is not entitled", () => {
    const ask = readApp("src/components/engineering/ask-this-object-link.tsx");
    expect(ask).toContain("visiblePrimaryNavIds.includes(\"eng-ask\")");
    expect(ask).toContain("capabilities.loaded");
    const header = readApp("src/components/layout/header.tsx");
    expect(header).toContain("visiblePrimaryNavIds.includes(\"eng-ask\")");
    expect(header).toContain("{askEnabled ? (");
  });

  it("Command Centre hides unentitled Ask and actions destinations", () => {
    const page = readApp("src/app/(platform)/engineering/page.tsx");
    expect(page).toContain("withProjectHref");
    expect(page).toContain("actionsEnabled");
    expect(page).not.toContain("home-ask-unavailable");
  });

  it("project workspace groups tabs and keeps breadcrumbs", () => {
    const page = readApp("src/app/(platform)/engineering/projects/[projectId]/page.tsx");
    expect(page).toContain("WORKSPACE_PRIMARY_TABS");
    expect(page).toContain("WORKSPACE_MORE_TABS");
    expect(page).toContain("EngineeringBreadcrumb");
    expect(page).toContain("Technical Queries");
  });

  it("asset 360 uses recorded tabs only", () => {
    const page = readApp("src/app/(platform)/engineering/assets/[assetId]/page.tsx");
    expect(page).toContain("asset-360");
    expect(page).toContain("Inspections");
    expect(page).toContain("Defects");
    expect(page).toContain("are not calculated");
  });

  it("inspection landing exposes the existing workflow strip", () => {
    const page = readApp(
      "src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
    );
    expect(page).toContain("inspection-workflow-strip");
    expect(page).toContain("Plan");
    expect(page).toContain("Verification");
  });

  it("Engineering AI states advisory limits and context", () => {
    const ask = readApp("src/components/engineering/ask-engineering-shell.tsx");
    expect(ask).toContain("ask-object-context");
    expect(ask).toContain("cannot approve engineering work");
    expect(ask).toContain("contextualAskStarters");
  });

  it("module tabs match pathname without query strings", () => {
    const nav = readApp("src/components/engineering/module-section-nav.tsx");
    expect(nav).toContain("href.split(\"?\")[0]");
    expect(nav).toContain("aria-current");
  });
});
