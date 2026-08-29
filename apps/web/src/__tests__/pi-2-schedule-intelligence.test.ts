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
];

describe("PI-2 Schedule Intelligence web surface", () => {
  it("registers a read-only Schedule Intelligence API under Project Intelligence entitlement", () => {
    const route = read(
      "app/api/engineering/project-intelligence/projects/[projectId]/schedule/route.ts",
    );
    expect(route).toContain("export const GET");
    expect(route).not.toMatch(/export const (POST|PUT|PATCH|DELETE)/);
    expect(route).toContain("requireProjectIntelligenceRead");
    expect(route).toContain("project-intelligence-schedule");
    expect(ENGINEERING_API_POLICIES["project-intelligence-schedule.read"]?.applicationKey).toBe(
      "project_intelligence",
    );
    expect(ENGINEERING_API_POLICIES["project-intelligence-schedule.read"]?.action).toBe("access");
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/schedule"]?.applicationKey).toBe(
      "project_intelligence",
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/schedule"]?.action).toBe("access");
  });

  it("renders Command Centre schedule card and dedicated Schedule Intelligence page states", () => {
    const cc = read("components/engineering/project-command-centre.tsx");
    const ui = read("components/engineering/project-schedule-intelligence.tsx");
    const page = read("app/(platform)/engineering/apps/project-intelligence/schedule/page.tsx");
    expect(page).toContain('data-testid="project-intelligence-schedule-ready"');
    expect(ui).toContain('data-testid="project-intelligence-schedule"');
    expect(ui).toContain("command-centre-section-schedule");
    expect(ui).toContain("command-centre-schedule");
    expect(ui).toContain("-unavailable");
    expect(ui).toContain("-unknown");
    expect(ui).toContain("-stale");
    expect(ui).toContain("-milestones");
    expect(ui).toContain("-attention");
    expect(ui).toContain("schedule-intelligence");
    expect(cc).toContain("ScheduleCommandCentreCard");
    expect(cc).toContain("scheduleIntelligence");
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain(
      "project-intelligence-nav-schedule",
    );
  });

  it("does not invoke a Project Controls schedule engine from hosted adapters", () => {
    const files = [
      "lib/project-intelligence/hosted-schedule-source.ts",
      "lib/project-intelligence/schedule-intelligence-service.ts",
      "lib/project-intelligence/command-centre-service.ts",
      "app/api/engineering/project-intelligence/projects/[projectId]/schedule/route.ts",
      "components/engineering/project-schedule-intelligence.tsx",
    ];
    for (const file of files) {
      const source = read(file);
      for (const token of ENGINE_TOKENS) {
        expect(source).not.toContain(token);
      }
      expect(source).not.toContain(".insert(");
      expect(source).not.toContain(".update(");
    }
    const hosted = read("lib/project-intelligence/hosted-schedule-source.ts");
    expect(hosted).toContain("listScheduleAssessments");
    expect(hosted).toContain("listScheduleEvidence");
    expect(hosted).toContain("invokesControlsEngine = false");
  });

  it("preserves existing PI v1 and PI-1 routes", () => {
    const pages = [
      "app/(platform)/engineering/apps/project-intelligence/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/documents/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/meetings/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/findings/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/schedule/page.tsx",
    ];
    for (const page of pages) {
      expect(existsSync(resolve(WEB_SRC, page))).toBe(true);
    }
  });
});
