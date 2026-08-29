import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ENGINEERING_API_POLICIES, ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

const ENGINE_TOKENS = [
  "createCostIntelligenceEngine",
  "createProgressIntelligenceEngine",
  "createForecastIntelligenceEngine",
  "createProjectControlsEngine",
  "createScheduleIntelligenceEngine",
];

describe("PI-3 Cost & Progress Intelligence web surface", () => {
  it("registers a read-only Cost & Progress API under Project Intelligence entitlement", () => {
    const route = read(
      "app/api/engineering/project-intelligence/projects/[projectId]/cost-progress/route.ts",
    );
    expect(route).toContain("export const GET");
    expect(route).not.toMatch(/export const (POST|PUT|PATCH|DELETE)/);
    expect(route).toContain("requireProjectIntelligenceRead");
    expect(route).toContain("project-intelligence-cost-progress");
    expect(ENGINEERING_API_POLICIES["project-intelligence-cost-progress.read"]?.applicationKey).toBe(
      "project_intelligence",
    );
    expect(ENGINEERING_API_POLICIES["project-intelligence-cost-progress.read"]?.action).toBe("access");
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/cost-progress"]?.action).toBe(
      "access",
    );
  });

  it("renders Command Centre cost/progress cards and the dedicated page states", () => {
    const cc = read("components/engineering/project-command-centre.tsx");
    const ui = read("components/engineering/project-cost-progress-intelligence.tsx");
    const page = read("app/(platform)/engineering/apps/project-intelligence/cost-progress/page.tsx");
    expect(page).toContain('data-testid="project-intelligence-cost-progress-ready"');
    expect(ui).toContain("command-centre-section-cost");
    expect(ui).toContain("command-centre-section-progress");
    expect(ui).toContain("command-centre-cost-unavailable");
    expect(ui).toContain("command-centre-progress-unavailable");
    expect(ui).toContain("-unknown");
    expect(ui).toContain("-stale");
    expect(ui).toContain("cost-progress-currency");
    expect(ui).toContain("cost-progress-consistency");
    expect(ui).toContain("cost-progress-cost-attention");
    expect(ui).toContain("cost-progress-progress-attention");
    expect(cc).toContain("CostCommandCentreCard");
    expect(cc).toContain("ProgressCommandCentreCard");
    expect(cc).toContain("costProgressIntelligence");
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain(
      "project-intelligence-nav-cost-progress",
    );
  });

  it("does not invoke Project Controls engines from hosted adapters", () => {
    const files = [
      "lib/project-intelligence/hosted-cost-progress-source.ts",
      "lib/project-intelligence/cost-progress-intelligence-service.ts",
      "lib/project-intelligence/command-centre-service.ts",
      "app/api/engineering/project-intelligence/projects/[projectId]/cost-progress/route.ts",
      "components/engineering/project-cost-progress-intelligence.tsx",
    ];
    for (const file of files) {
      const source = read(file);
      for (const token of ENGINE_TOKENS) {
        expect(source).not.toContain(token);
      }
      expect(source).not.toContain(".insert(");
      expect(source).not.toContain(".update(");
    }
    const hosted = read("lib/project-intelligence/hosted-cost-progress-source.ts");
    expect(hosted).toContain("listCostStates");
    expect(hosted).toContain("listProgressAssessments");
    expect(hosted).toContain("invokesControlsEngine = false");
  });

  it("preserves existing PI routes", () => {
    const pages = [
      "app/(platform)/engineering/apps/project-intelligence/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/schedule/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/cost-progress/page.tsx",
    ];
    for (const page of pages) {
      expect(existsSync(resolve(WEB_SRC, page))).toBe(true);
    }
  });
});
