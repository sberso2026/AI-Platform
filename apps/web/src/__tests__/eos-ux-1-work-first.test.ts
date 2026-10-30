import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ENGINEERING_NAVIGATION,
  NAV_GROUP_LABELS,
  SIDEBAR_SECTIONS,
} from "@rtb/platform-core";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-UX-1 work-first navigation", () => {
  it("puts Home, Work, Engineering, Analysis, AI, and Administration in the sidebar", () => {
    expect(SIDEBAR_SECTIONS.map((s) => s.label)).toEqual(
      expect.arrayContaining([
        "Engineering OS",
        "Work",
        "Engineering",
        "Analysis",
        "AI",
        "Administration",
      ]),
    );
    expect(NAV_GROUP_LABELS.engineering_work).toBe("Work");
    expect(NAV_GROUP_LABELS.engineering_analysis).toBe("Analysis");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-home")?.label).toBe("Home");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-my")?.label).toBe("My Work");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-ask")?.label).toBe("AI");
  });

  it("gates Documents and Actions on existing application entitlements", () => {
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-documents")?.applicationKey).toBe("documents");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-actions")?.applicationKey).toBe("project_controls");
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-changes")?.href).toBe("/engineering/changes");
  });

  it("keeps Explore / Intelligence out of primary nav; My Work is primary", () => {
    expect(ENGINEERING_NAVIGATION.find((i) => i.id === "eng-my")?.sidebarHidden).not.toBe(true);
    for (const id of ["eng-explore", "eng-intelligence"]) {
      expect(ENGINEERING_NAVIGATION.find((i) => i.id === id)?.sidebarHidden).toBe(true);
    }
  });

  it("does not duplicate nav registries", () => {
    const ids = ENGINEERING_NAVIGATION.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("EOS-UX-1 operational screens", () => {
  it("approved Home uses the composed dashboard API", () => {
    const page = readApp("src/app/(platform)/engineering/page.tsx");
    expect(page).toContain("/api/engineering/dashboard");
    expect(page).toContain("Home");
    expect(page).toContain('data-testid="engineering-approved-home"');
    expect(page).not.toContain("Open Engineering Workbench");
    expect(page).not.toContain("Command Centre");
  });

  it("project workspace GET authorizes asset and document reads separately", () => {
    const route = readApp("src/app/api/engineering/projects/[projectId]/route.ts");
    expect(route).toContain("authorizeEngineeringSegment");
    expect(route).toContain('"assets"');
    expect(route).toContain('"documents"');
    expect(route).not.toMatch(/assets\.list\(\s*commerce/);
    expect(route).not.toMatch(/documents\.list\(\s*commerce/);
  });

  it("project workspace exposes operational overview without duplicating registers", () => {
    const page = readApp("src/app/(platform)/engineering/projects/[projectId]/page.tsx");
    expect(page).toContain("project-workspace");
    expect(page).toContain("ProjectOverviewPanel");
    expect(page).toContain("/api/engineering/projects/");
  });

  it("moves raw EMI flags to Governance & Assurance, not the operational landing", () => {
    const overview = readApp(
      "src/app/(platform)/engineering/apps/model-interoperability/page.tsx",
    );
    const release = readApp(
      "src/app/(platform)/engineering/apps/model-interoperability/release/page.tsx",
    );
    expect(overview).not.toContain("HiddenCertificationMarkers");
    expect(overview).not.toContain("ETABSHostedExecutionCertified=false");
    expect(overview).toContain("Live ETABS execution is not currently certified");
    expect(release).toContain("ETABSHostedExecutionCertified=false");
    expect(release).toContain("GovernancePanel");
  });

  it("Inspection Intelligence landing is workflow-first; GA markers live on release", () => {
    const page = readApp(
      "src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
    );
    const release = readApp(
      "src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
    );
    expect(page).toContain("Start inspection");
    expect(page).not.toContain("inspection-intelligence-v1-ready");
    expect(page).not.toMatch(/Production GA: frozen public contracts/);
    expect(release).toContain("inspection-intelligence-v1-ready");
  });

  it("does not invent remaining-life or PoF on Asset Intelligence overview", () => {
    const page = readApp("src/app/(platform)/engineering/apps/asset-intelligence/page.tsx");
    expect(page).not.toMatch(/remaining life|probability of failure|PoF|RUL/i);
  });
});
