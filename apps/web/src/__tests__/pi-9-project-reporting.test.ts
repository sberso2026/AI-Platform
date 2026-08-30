import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ENGINEERING_API_POLICIES, ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

const FORBIDDEN = [
  "createForecastIntelligenceEngine",
  "createProjectControlsEngine",
  "new OpenAI",
  "anthropic",
  "puppeteer",
  "pdfkit",
];

describe("PI-9 Project Reporting web surface", () => {
  it("registers a project-scoped reports route under existing reporting entitlement", () => {
    const route = read("app/api/engineering/project-intelligence/projects/[projectId]/reports/route.ts");
    expect(route).toContain("export const GET");
    expect(route).toContain("export const POST");
    expect(route).not.toMatch(/export const (PUT|PATCH|DELETE)/);
    expect(route).toContain("requireProjectIntelligenceRead");
    expect(route).toContain("project-intelligence-reports");
    expect(route).toContain("generateProjectReport");
    expect(ENGINEERING_API_POLICIES["project-intelligence-reports.read"]?.applicationKey).toBe("project_intelligence");
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/reports"]?.action).toBe(
      "reporting.intelligence.read",
    );
  });

  it("renders project reporting inside the existing Reports experience", () => {
    const page = read("app/(platform)/engineering/apps/project-intelligence/reports/page.tsx");
    const ui = read("components/engineering/project-reporting-intelligence.tsx");
    expect(page).toContain('data-testid="project-intelligence-reports-ready"');
    expect(page).toContain("ProjectReportingIntelligenceView");
    expect(page).toContain("executive-dashboard-open-link");
    expect(ui).toContain("reporting-advisory-banner");
    expect(ui).toContain("reporting-type-select");
    expect(ui).toContain("reporting-generate");
    expect(ui).toContain("reporting-export");
    expect(ui).toContain("reporting-ai-unavailable");
    expect(ui).toContain("reporting-sections");
    expect(ui).toContain("reporting-limitations");
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain("project-intelligence-nav-reports");
  });

  it("reuses Command Centre, connector context, and Analyst Director without a second stack", () => {
    const hosted = read("lib/project-intelligence/project-reporting-service.ts");
    expect(hosted).toContain("composeProjectCommandCentre");
    expect(hosted).toContain("loadHostedConnectorContext");
    expect(hosted).toContain("overlayAnalystAnswer");
    expect(hosted).toContain("assembleProjectReport");
    expect(hosted).toContain("reportOverlayIsMockSubstitution");
    expect(hosted).toContain("answer.aiProvider");
    expect(hosted).toContain("AuditService");
    expect(hosted).not.toContain("@rtb/business-os");
    expect(hosted).not.toContain("new OpenAI");
    const files = [
      "lib/project-intelligence/project-reporting-service.ts",
      "app/api/engineering/project-intelligence/projects/[projectId]/reports/route.ts",
      "components/engineering/project-reporting-intelligence.tsx",
    ];
    for (const file of files) {
      const source = read(file);
      for (const token of FORBIDDEN) {
        expect(source).not.toContain(token);
      }
      expect(source).not.toContain(".insert(");
      expect(source).not.toContain(".update(");
    }
  });

  it("preserves existing PI routes including Analyst and executive dashboard", () => {
    const pages = [
      "app/(platform)/engineering/apps/project-intelligence/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/analyst/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/reports/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/reports/executive/page.tsx",
    ];
    for (const page of pages) {
      expect(existsSync(resolve(WEB_SRC, page))).toBe(true);
    }
  });
});
