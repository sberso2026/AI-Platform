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
];

describe("PI-7 AI Project Analyst web surface", () => {
  it("registers a Project Intelligence analyst route under entitlement", () => {
    const route = read("app/api/engineering/project-intelligence/projects/[projectId]/analyst/route.ts");
    expect(route).toContain("export const GET");
    expect(route).toContain("export const POST");
    expect(route).not.toMatch(/export const (PUT|PATCH|DELETE)/);
    expect(route).toContain("requireProjectIntelligenceRead");
    expect(route).toContain("project-intelligence-analyst");
    expect(ENGINEERING_API_POLICIES["project-intelligence-analyst.read"]?.applicationKey).toBe("project_intelligence");
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/analyst"]?.action).toBe("access");
  });

  it("renders analyst page, starters, citations, advisory banner, and Command Centre entry", () => {
    const page = read("app/(platform)/engineering/apps/project-intelligence/analyst/page.tsx");
    const ui = read("components/engineering/project-ai-analyst.tsx");
    const cc = read("components/engineering/project-command-centre.tsx");
    expect(page).toContain('data-testid="project-intelligence-analyst-ready"');
    expect(ui).toContain("analyst-advisory-banner");
    expect(ui).toContain("analyst-starters");
    expect(ui).toContain("analyst-citations");
    expect(ui).toContain("analyst-ai-unavailable");
    expect(ui).toContain("Advisory only");
    expect(cc).toContain("AnalystCommandCentreEntry");
    expect(read("components/engineering/project-intelligence-shell.tsx")).toContain(
      "project-intelligence-nav-analyst",
    );
  });

  it("does not call providers or mutate canonical records from the hosted analyst", () => {
    const files = [
      "lib/project-intelligence/ai-project-analyst-service.ts",
      "app/api/engineering/project-intelligence/projects/[projectId]/analyst/route.ts",
      "components/engineering/project-ai-analyst.tsx",
    ];
    for (const file of files) {
      const source = read(file);
      for (const token of FORBIDDEN) {
        expect(source).not.toContain(token);
      }
      expect(source).not.toContain(".insert(");
      expect(source).not.toContain(".update(");
    }
    const hosted = read("lib/project-intelligence/ai-project-analyst-service.ts");
    expect(hosted).toContain("composeProjectCommandCentre");
    expect(hosted).toContain("kernel.aiDirector.run");
    expect(hosted).toContain("AuditService");
  });

  it("preserves existing PI routes", () => {
    const pages = [
      "app/(platform)/engineering/apps/project-intelligence/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/forecasting/page.tsx",
      "app/(platform)/engineering/apps/project-intelligence/analyst/page.tsx",
    ];
    for (const page of pages) {
      expect(existsSync(resolve(WEB_SRC, page))).toBe(true);
    }
  });
});
