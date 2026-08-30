import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ENGINEERING_API_POLICIES, ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

const ENGINE_TOKENS = [
  "createForecastIntelligenceEngine",
  "createChangeIntelligenceEngine",
  "createCostIntelligenceEngine",
  "createScheduleIntelligenceEngine",
  "createProgressIntelligenceEngine",
  "createProjectControlsEngine",
];

describe("PI-6 Forecasting Intelligence web surface", () => {
  it("registers a read-only Forecasting API under Project Intelligence entitlement", () => {
    const route = read("app/api/engineering/project-intelligence/projects/[projectId]/forecasting/route.ts");
    expect(route).toContain("export const GET");
    expect(route).not.toMatch(/export const (POST|PUT|PATCH|DELETE)/);
    expect(route).toContain("requireProjectIntelligenceRead");
    expect(route).toContain("project-intelligence-forecasting");
    expect(ENGINEERING_API_POLICIES["project-intelligence-forecasting.read"]?.applicationKey).toBe(
      "project_intelligence",
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/forecasting"]?.action).toBe("access");
  });

  it("renders Command Centre forecast card and the dedicated page states", () => {
    const cc = read("components/engineering/project-command-centre.tsx");
    const ui = read("components/engineering/project-forecast-intelligence.tsx");
    const page = read("app/(platform)/engineering/apps/project-intelligence/forecasting/page.tsx");
    expect(page).toContain('data-testid="project-intelligence-forecasting-ready"');
    expect(ui).toContain("command-centre-section-forecast");
    expect(ui).toContain("command-centre-forecast-unavailable");
    expect(ui).toContain("-not-produced");
    expect(ui).toContain("-qualitative");
    expect(ui).toContain("-stale");
    expect(ui).toContain("forecasting-attention");
    expect(ui).toContain("forecasting-quality");
    expect(ui).toContain("forecasting-evidence");
    expect(ui).toContain("forecasting-limitations");
    expect(cc).toContain("ForecastCommandCentreCard");
    expect(cc).toContain("forecastIntelligence");
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain(
      "project-intelligence-nav-forecasting",
    );
  });

  it("does not invoke forecast engines or mutate canonical records from hosted adapters", () => {
    const files = [
      "lib/project-intelligence/hosted-forecast-source.ts",
      "lib/project-intelligence/forecast-intelligence-service.ts",
      "lib/project-intelligence/command-centre-service.ts",
      "app/api/engineering/project-intelligence/projects/[projectId]/forecasting/route.ts",
      "components/engineering/project-forecast-intelligence.tsx",
    ];
    for (const file of files) {
      const source = read(file);
      for (const token of ENGINE_TOKENS) {
        expect(source).not.toContain(token);
      }
      expect(source).not.toContain(".insert(");
      expect(source).not.toContain(".update(");
    }
    const hosted = read("lib/project-intelligence/hosted-forecast-source.ts");
    expect(hosted).toContain("listForecastStates");
    expect(hosted).toContain("computesForecast = false");
  });

  it("preserves existing PI routes", () => {
    const pages = [
      "app/(platform)/engineering/apps/project-intelligence/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/queries-decisions/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/forecasting/page.tsx",
    ];
    for (const page of pages) {
      expect(existsSync(resolve(WEB_SRC, page))).toBe(true);
    }
  });
});
