import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ENGINEERING_API_POLICIES, ENGINEERING_PAGE_POLICIES } from "@rtb/platform-commerce";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

const FORBIDDEN = ["new OpenAI", "anthropic", "createServiceClient"];

describe("II-5 AI Inspection Engineer web surface", () => {
  it("registers an Inspection Intelligence engineer route under read entitlement", () => {
    const route = read("app/api/engineering/inspection-intelligence/engineer/route.ts");
    expect(route).toContain("export const GET");
    expect(route).toContain("export const POST");
    expect(route).not.toMatch(/export const (PUT|PATCH|DELETE)/);
    expect(route).toContain("requireInspectionIntelligenceAccess");
    expect(route).toContain("inspection-intelligence-engineer");
    expect(route).toContain("prepareEngineerRuntime");
    expect(ENGINEERING_API_POLICIES["inspection-intelligence-engineer.read"]?.action).toBe("inspection.read");
    expect(ENGINEERING_API_POLICIES["inspection-intelligence-engineer.write"]?.action).toBe("inspection.read");
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/inspection-intelligence/engineer"]?.action).toBe(
      "inspection.read",
    );
  });

  it("renders engineer page, starters, citations, advisory banner, and contextual entries", () => {
    const page = read("app/(platform)/engineering/apps/inspection-intelligence/engineer/page.tsx");
    const ui = read("components/engineering/inspection-ai-engineer.tsx");
    expect(page).toContain('data-testid="inspection-intelligence-engineer-ready"');
    expect(ui).toContain("engineer-advisory-banner");
    expect(ui).toContain("engineer-starters");
    expect(ui).toContain("engineer-citations");
    expect(ui).toContain("engineer-ai-unavailable");
    expect(ui).toContain("Advisory only");
    expect(ui).toContain("AI_INTERPRETATION");
    expect(read("components/engineering/inspection-intelligence-shell.tsx")).toContain(
      "/engineering/apps/inspection-intelligence/engineer",
    );
    expect(read("components/engineering/inspection-session-workspace.tsx")).toContain("InspectionEngineerEntry");
    expect(read("components/engineering/inspection-report-detail.tsx")).toContain("InspectionEngineerEntry");
    expect(read("components/engineering/inspection-defect-detail.tsx")).toContain("InspectionEngineerEntry");
    expect(read("components/engineering/inspection-target-history.tsx")).toContain("InspectionEngineerEntry");
  });

  it("does not call providers or mutate canonical records from the hosted engineer", () => {
    const files = [
      "lib/inspection-intelligence/ai-inspection-engineer-service.ts",
      "app/api/engineering/inspection-intelligence/engineer/route.ts",
      "components/engineering/inspection-ai-engineer.tsx",
    ];
    for (const file of files) {
      const source = read(file);
      for (const token of FORBIDDEN) {
        expect(source).not.toContain(token);
      }
      expect(source).not.toContain(".insert(");
      expect(source).not.toContain(".update(");
    }
    const hosted = read("lib/inspection-intelligence/ai-inspection-engineer-service.ts");
    expect(hosted).toContain("createHostedInspectionFromRequest");
    expect(hosted).toContain("kernel.aiDirector.run");
    expect(hosted).toContain("probeEngineerRuntime");
    expect(hosted).toContain("prepareEngineerRuntime");
    expect(hosted).toContain("ensureActivePrompt");
    expect(hosted).toContain("upsertCatalogAgent");
    expect(hosted).toContain("AuditService");
    expect(hosted).toContain("buildDirectorOverlayMessage");
    expect(hosted).toContain("AI_INSPECTION_ENGINEER_PROMPT_KEY");
    expect(hosted).not.toContain("new OpenAI");
  });

  it("preserves existing II routes", () => {
    const pages = [
      "app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      "app/(platform)/engineering/apps/inspection-intelligence/history/page.tsx",
      "app/(platform)/engineering/apps/inspection-intelligence/reports/page.tsx",
      "app/(platform)/engineering/apps/inspection-intelligence/engineer/page.tsx",
    ];
    for (const page of pages) {
      expect(existsSync(resolve(WEB_SRC, page))).toBe(true);
    }
  });
});
