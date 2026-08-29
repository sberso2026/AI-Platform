import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ENGINEERING_API_POLICIES, ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

const ENGINE_TOKENS = [
  "createChangeIntelligenceEngine",
  "createRiskOpportunityEngine",
  "createCostIntelligenceEngine",
  "createScheduleIntelligenceEngine",
  "createForecastIntelligenceEngine",
  "createProjectControlsEngine",
];

describe("PI-4 Risk & Change Intelligence web surface", () => {
  it("registers a read-only Risk & Change API under Project Intelligence entitlement", () => {
    const route = read(
      "app/api/engineering/project-intelligence/projects/[projectId]/risk-change/route.ts",
    );
    expect(route).toContain("export const GET");
    expect(route).not.toMatch(/export const (POST|PUT|PATCH|DELETE)/);
    expect(route).toContain("requireProjectIntelligenceRead");
    expect(route).toContain("project-intelligence-risk-change");
    expect(ENGINEERING_API_POLICIES["project-intelligence-risk-change.read"]?.applicationKey).toBe(
      "project_intelligence",
    );
    expect(ENGINEERING_API_POLICIES["project-intelligence-risk-change.read"]?.action).toBe("access");
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/risk-change"]?.action).toBe(
      "access",
    );
  });

  it("renders Command Centre risk/change cards and the dedicated page states", () => {
    const cc = read("components/engineering/project-command-centre.tsx");
    const ui = read("components/engineering/project-risk-change-intelligence.tsx");
    const page = read("app/(platform)/engineering/apps/project-intelligence/risk-change/page.tsx");
    expect(page).toContain('data-testid="project-intelligence-risk-change-ready"');
    expect(ui).toContain("command-centre-section-risk");
    expect(ui).toContain("command-centre-section-change");
    expect(ui).toContain("command-centre-risk-unavailable");
    expect(ui).toContain("command-centre-change-unavailable");
    expect(ui).toContain("-unknown");
    expect(ui).toContain("-stale");
    expect(ui).toContain("risk-change-risk-attention");
    expect(ui).toContain("risk-change-change-attention");
    expect(ui).toContain("risk-change-linked-signals");
    expect(ui).toContain("risk-change-evidence");
    expect(ui).toContain("unowned");
    expect(ui).toContain("overdue");
    expect(cc).toContain("RiskCommandCentreCard");
    expect(cc).toContain("ChangeCommandCentreCard");
    expect(cc).toContain("riskChangeIntelligence");
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain(
      "project-intelligence-nav-risk-change",
    );
  });

  it("does not invoke Project Controls engines or mutate canonical records from hosted adapters", () => {
    const files = [
      "lib/project-intelligence/hosted-risk-change-source.ts",
      "lib/project-intelligence/risk-change-intelligence-service.ts",
      "lib/project-intelligence/command-centre-service.ts",
      "app/api/engineering/project-intelligence/projects/[projectId]/risk-change/route.ts",
      "components/engineering/project-risk-change-intelligence.tsx",
    ];
    for (const file of files) {
      const source = read(file);
      for (const token of ENGINE_TOKENS) {
        expect(source).not.toContain(token);
      }
      expect(source).not.toContain(".insert(");
      expect(source).not.toContain(".update(");
    }
    const hosted = read("lib/project-intelligence/hosted-risk-change-source.ts");
    expect(hosted).toContain("listChangeStates");
    expect(hosted).toContain("engineering.risks.list");
    expect(hosted).toContain("invokesControlsEngine = false");
  });

  it("preserves existing PI routes", () => {
    const pages = [
      "app/(platform)/engineering/apps/project-intelligence/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/schedule/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/cost-progress/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/risk-change/page.tsx",
    ];
    for (const page of pages) {
      expect(existsSync(resolve(WEB_SRC, page))).toBe(true);
    }
  });
});
