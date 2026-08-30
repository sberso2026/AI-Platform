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

describe("PI-5 Query & Decision Intelligence web surface", () => {
  it("registers a read-only Queries & Decisions API under Project Intelligence entitlement", () => {
    const route = read(
      "app/api/engineering/project-intelligence/projects/[projectId]/queries-decisions/route.ts",
    );
    expect(route).toContain("export const GET");
    expect(route).not.toMatch(/export const (POST|PUT|PATCH|DELETE)/);
    expect(route).toContain("requireProjectIntelligenceRead");
    expect(route).toContain("project-intelligence-queries-decisions");
    expect(ENGINEERING_API_POLICIES["project-intelligence-queries-decisions.read"]?.applicationKey).toBe(
      "project_intelligence",
    );
    expect(ENGINEERING_API_POLICIES["project-intelligence-queries-decisions.read"]?.action).toBe("access");
    expect(
      ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/queries-decisions"]?.action,
    ).toBe("access");
  });

  it("renders Command Centre query/decision/action cards and the dedicated page states", () => {
    const cc = read("components/engineering/project-command-centre.tsx");
    const ui = read("components/engineering/project-query-decision-intelligence.tsx");
    const page = read("app/(platform)/engineering/apps/project-intelligence/queries-decisions/page.tsx");
    expect(page).toContain('data-testid="project-intelligence-queries-decisions-ready"');
    expect(ui).toContain("command-centre-section-queries");
    expect(ui).toContain("command-centre-section-decisions");
    expect(ui).toContain("command-centre-section-actions");
    expect(ui).toContain("command-centre-queries-unavailable");
    expect(ui).toContain("command-centre-decisions-unavailable");
    expect(ui).toContain("command-centre-actions-unavailable");
    expect(ui).toContain("-unknown");
    expect(ui).toContain("-stale");
    expect(ui).toContain("queries-decisions-query-attention");
    expect(ui).toContain("queries-decisions-decision-attention");
    expect(ui).toContain("queries-decisions-action-attention");
    expect(ui).toContain("queries-decisions-linked-signals");
    expect(ui).toContain("queries-decisions-evidence");
    expect(ui).toContain("unassigned");
    expect(ui).toContain("overdue");
    expect(cc).toContain("QueryCommandCentreCard");
    expect(cc).toContain("DecisionCommandCentreCard");
    expect(cc).toContain("ActionCommandCentreCard");
    expect(cc).toContain("queryDecisionIntelligence");
    expect(cc).toContain("command-centre-section-decisions-actions");
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain(
      "project-intelligence-nav-queries-decisions",
    );
  });

  it("does not invoke Project Controls engines or mutate canonical records from hosted adapters", () => {
    const files = [
      "lib/project-intelligence/hosted-query-decision-source.ts",
      "lib/project-intelligence/query-decision-intelligence-service.ts",
      "lib/project-intelligence/command-centre-service.ts",
      "app/api/engineering/project-intelligence/projects/[projectId]/queries-decisions/route.ts",
      "components/engineering/project-query-decision-intelligence.tsx",
    ];
    for (const file of files) {
      const source = read(file);
      for (const token of ENGINE_TOKENS) {
        expect(source).not.toContain(token);
      }
      expect(source).not.toContain(".insert(");
      expect(source).not.toContain(".update(");
    }
    const hosted = read("lib/project-intelligence/hosted-query-decision-source.ts");
    expect(hosted).toContain("engineering.technicalQueries.list");
    expect(hosted).toContain("engineering.decisions.list");
    expect(hosted).toContain("engineering.actions.list");
    expect(hosted).not.toContain("@rtb/project-controls");
  });

  it("preserves existing PI routes", () => {
    const pages = [
      "app/(platform)/engineering/apps/project-intelligence/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/schedule/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/cost-progress/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/risk-change/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/queries-decisions/page.tsx",
    ];
    for (const page of pages) {
      expect(existsSync(resolve(WEB_SRC, page))).toBe(true);
    }
  });
});
