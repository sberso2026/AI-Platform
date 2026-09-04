import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ENGINEERING_API_POLICIES, ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

const ENGINE_TOKENS = [
  "createScheduleIntelligenceEngine",
  "createCostIntelligenceEngine",
  "createProgressIntelligenceEngine",
  "createChangeIntelligenceEngine",
  "createForecastIntelligenceEngine",
  "createProjectControlsEngine",
  "criticalPath",
  "earnedValue",
];

describe("PI-1 Command Centre web surface", () => {
  it("registers a read-only Command Centre API under Project Intelligence entitlement", () => {
    const route = read(
      "app/api/engineering/project-intelligence/projects/[projectId]/command-centre/route.ts",
    );
    expect(route).toContain("export const GET");
    expect(route).not.toMatch(/export const (POST|PUT|PATCH|DELETE)/);
    expect(route).toContain("requireProjectIntelligenceRead");
    expect(route).toContain("project-intelligence-command-centre");
    expect(ENGINEERING_API_POLICIES["project-intelligence-command-centre.read"]?.applicationKey).toBe(
      "project_intelligence",
    );
    expect(ENGINEERING_API_POLICIES["project-intelligence-command-centre.read"]?.seatRequired).toBe(true);
    expect(ENGINEERING_API_POLICIES["project-intelligence-command-centre.read"]?.workspaceRequired).toBe(true);
    expect(ENGINEERING_API_POLICIES["project-intelligence-command-centre.read"]?.action).toBe("access");
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence"]?.applicationKey).toBe(
      "project_intelligence",
    );
  });

  it("renders Command Centre on overview while preserving PI v1 dashboard markers", () => {
    const overview = read("app/(platform)/engineering/apps/project-intelligence/page.tsx");
    const ui = read("components/engineering/project-command-centre.tsx");
    const scheduleUi = read("components/engineering/project-schedule-intelligence.tsx");
    expect(overview).toContain('data-testid="project-intelligence-ready"');
    expect(overview).toContain('data-testid="project-intelligence-dashboard"');
    expect(overview).toContain("project-intelligence-panel-${panel.id}");
    expect(overview).toContain('id: "documents"');
    expect(overview).toContain('id: "meetings"');
    expect(overview).toContain('id: "findings"');
    expect(overview).toContain("ProjectCommandCentre");
    expect(ui).toContain('data-testid="project-intelligence-command-centre"');
    expect(ui).toContain("command-centre-project-select");
    expect(ui).toContain('data-testid="command-centre-overall-health"');
    expect(ui).toContain('data-testid="command-centre-health-dimensions"');
    expect(ui).toContain('data-testid="command-centre-attention"');
    expect(ui).toContain("health-state-");
    expect(ui).toContain("border-dashed");
    expect(ui).toContain("ScheduleCommandCentreCard");
    expect(scheduleUi).toContain("command-centre-section-schedule");
    expect(ui).toContain("-unavailable");
  });

  it("does not import Project Controls engines in hosted adapters", () => {
    const files = [
      "lib/project-intelligence/hosted-core-source.ts",
      "lib/project-intelligence/hosted-controls-source.ts",
      "lib/project-intelligence/hosted-knowledge-source.ts",
      "lib/project-intelligence/command-centre-service.ts",
      "app/api/engineering/project-intelligence/projects/[projectId]/command-centre/route.ts",
      "components/engineering/project-command-centre.tsx",
    ];
    for (const file of files) {
      const source = read(file);
      for (const token of ENGINE_TOKENS) {
        expect(source).not.toContain(token);
      }
    }
    const controls = read("lib/project-intelligence/hosted-controls-source.ts");
    expect(controls).toContain("createProjectControlsRepository");
    expect(controls).toContain("listScheduleAssessments");
    expect(controls).toContain("invokesControlsEngine = false");
    expect(controls).not.toContain(".insert(");
    expect(controls).not.toContain(".update(");
    expect(read("lib/project-intelligence/hosted-core-source.ts")).toContain("aggregate: true");
  });

  it("preserves existing PI v1 routes", () => {
    const pages = [
      "app/(platform)/engineering/apps/project-intelligence/documents/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/meetings/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/findings/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/reports/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/knowledge/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/reasoning/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/migration/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/settings/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/about/page.tsx",
    ];
    for (const page of pages) {
      expect(existsSync(resolve(WEB_SRC, page))).toBe(true);
    }
    expect(read("app/(platform)/engineering/apps/project-intelligence/findings/page.tsx")).toContain(
      'data-testid="project-intelligence-findings-ready"',
    );
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain(
      "project-intelligence-nav-overview",
    );
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain(
      "project-intelligence-nav-documents",
    );
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain(
      "projectId=${encodeURIComponent(projectId)}",
    );
    expect(read("components/engineering/pi-project-context.tsx")).toContain(
      "router.replace(query ? `${pathname}?${query}` : pathname",
    );
  });
});
