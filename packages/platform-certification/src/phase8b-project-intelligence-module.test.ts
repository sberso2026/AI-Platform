/**
 * Phase 8B — Project Intelligence production module unit gates.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertNoDuplicateDomainOwnership,
  ENGINEERING_DOMAIN_ENTITY_KINDS,
  resolveOsModules,
} from "@rtb/types";
import {
  defaultEngineeringModuleRegistry,
  ENGINEERING_OS_RUNTIME_MANIFEST,
  createEngineeringAiFramework,
  createEngineeringSharedServicesFacade,
} from "@rtb/engineering-os";
import {
  PROJECT_INTELLIGENCE_MODULE_KEY,
  PROJECT_INTELLIGENCE_FEATURES,
  PROJECT_INTELLIGENCE_AI_CONSUMPTION,
  assertProjectIntelligenceSharedStack,
  assertProjectIntelligenceAiRuntime,
  assertUnifiedWorkspaceVisibility,
  listProjectIntelligenceFeatures,
  listProjectIntelligenceEntitlements,
} from "@rtb/project-intelligence";
import { ENGINEERING_PAGE_POLICIES, ENGINEERING_API_POLICIES } from "@rtb/platform-commerce";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("Phase 8B Project Intelligence production module", () => {
  it("documents Project Intelligence Phase 8B architecture", () => {
    expect(
      existsSync(resolve(ROOT, "docs/architecture/PROJECT_INTELLIGENCE_PHASE_8B.md")),
    ).toBe(true);
    const doc = readFileSync(
      resolve(ROOT, "docs/architecture/PROJECT_INTELLIGENCE_PHASE_8B.md"),
      "utf8",
    );
    expect(doc).toMatch(/Document Intelligence/);
    expect(doc).toMatch(/Meeting Intelligence/);
    expect(doc).toMatch(/Findings Intelligence/);
    expect(doc).toMatch(/Reporting Intelligence/);
    expect(doc.toLowerCase()).not.toMatch(/cortex/);
  });

  it("registers Project Intelligence as Engineering OS module with six V1 features", () => {
    const mod = defaultEngineeringModuleRegistry.get(PROJECT_INTELLIGENCE_MODULE_KEY);
    expect(mod).toBeDefined();
    expect(mod!.enabled).toBe(true);
    expect(mod!.workspaceVisibility).toBe("assigned");
    expect(mod!.version).toBe("1.0.0");
    expect(mod!.features?.map((f) => f.id).sort()).toEqual(
      [
        "document_intelligence",
        "engineering_reasoning_assistant",
        "findings_intelligence",
        "knowledge_intelligence",
        "meeting_intelligence",
        "reporting_intelligence",
      ].sort(),
    );
    const routes = (mod!.routes ?? []).map((r) => r.path);
    expect(routes).toContain("/engineering/apps/project-intelligence/documents");
    expect(routes).toContain("/engineering/apps/project-intelligence/meetings");
    expect(routes).toContain("/engineering/apps/project-intelligence/findings");
    expect(routes).toContain("/engineering/apps/project-intelligence/reports");
    expect(routes).toContain("/engineering/apps/project-intelligence/knowledge");
    expect(routes).toContain("/engineering/apps/project-intelligence/reasoning");
    expect(mod!.navigation?.some((n) => n.id === "pi-feature-documents")).toBe(true);
  });

  it("keeps PI features aligned between package registry and Eng OS registration", () => {
    const packageIds = listProjectIntelligenceFeatures().map((f) => f.id).sort();
    const engIds = defaultEngineeringModuleRegistry
      .get(PROJECT_INTELLIGENCE_MODULE_KEY)!
      .features!.map((f) => f.id)
      .sort();
    expect(packageIds).toEqual(engIds);
    expect(PROJECT_INTELLIGENCE_FEATURES.every((f) => f.implementsOwnAiStack === false)).toBe(true);
  });

  it("consumes shared Engineering services and AI framework only", () => {
    expect(() => assertProjectIntelligenceSharedStack()).not.toThrow();
    expect(() => assertProjectIntelligenceAiRuntime()).not.toThrow();
    expect(PROJECT_INTELLIGENCE_AI_CONSUMPTION.implementsOwnAiStack).toBe(false);
    expect(PROJECT_INTELLIGENCE_AI_CONSUMPTION.platformRuntime).toBe("rtb-ai-platform");
    const services = createEngineeringSharedServicesFacade();
    const ai = createEngineeringAiFramework();
    expect(services.has("ai_context")).toBe(true);
    expect(ai.listCapabilities().length).toBeGreaterThan(0);
  });

  it("unifies seat and workspace entitlement across PI features", () => {
    expect(() => assertUnifiedWorkspaceVisibility()).not.toThrow();
    const entitlements = listProjectIntelligenceEntitlements();
    expect(entitlements.length).toBeGreaterThanOrEqual(5);
    expect(
      entitlements.every((e) => e.seatRequired && e.workspaceRequired && e.applicationKey === "project_intelligence"),
    ).toBe(true);
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/findings"]?.action).toBe(
      "findings.intelligence.read",
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/reports"]?.action).toBe(
      "reporting.intelligence.read",
    );
    expect(ENGINEERING_PAGE_POLICIES["/engineering/apps/project-intelligence/knowledge"]?.action).toBe(
      "knowledge.intelligence.read",
    );
    expect(ENGINEERING_API_POLICIES["project-intelligence-findings.read"]?.workspaceRequired).toBe(true);
    expect(ENGINEERING_API_POLICIES["project-intelligence-reports.read"]?.workspaceRequired).toBe(true);
    expect(ENGINEERING_API_POLICIES["project-intelligence-knowledge.read"]?.workspaceRequired).toBe(true);
  });

  it("does not claim Engineering Domain ownership", () => {
    expect(() =>
      assertNoDuplicateDomainOwnership(
        ENGINEERING_DOMAIN_ENTITY_KINDS.map((entity) => ({
          entity,
          owner: "engineering-os-core",
        })),
      ),
    ).not.toThrow();
    expect(() =>
      assertNoDuplicateDomainOwnership([{ entity: "document", owner: "project_intelligence" }]),
    ).toThrow(/ownership violation/);
  });

  it("exposes production shell, dashboard, and feature markers", () => {
    const shell = readFileSync(
      resolve(ROOT, "apps/web/src/components/engineering/project-intelligence-shell.tsx"),
      "utf8",
    );
    const overview = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/engineering/apps/project-intelligence/page.tsx"),
      "utf8",
    );
    const findings = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/findings/page.tsx",
      ),
      "utf8",
    );
    const reports = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/reports/page.tsx",
      ),
      "utf8",
    );
    const documents = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/documents/page.tsx",
      ),
      "utf8",
    );
    expect(shell).toContain('data-testid="project-intelligence-shell"');
    expect(documents).toContain("Document Intelligence");
    expect(findings).toContain("Meeting Intelligence");
    expect(findings).toContain("Document Intelligence");
    expect(reports).toContain("project-intelligence-reports-ready");
    expect(overview).toContain('data-testid="project-intelligence-ready"');
    expect(overview).toContain('data-testid="project-intelligence-dashboard"');
    expect(overview).toContain("project-intelligence-panel-${panel.id}");
    for (const panelId of [
      "recent-activity",
      "assigned-work",
      "documents",
      "meetings",
      "findings",
      "reports",
      "ai-insights",
    ]) {
      expect(overview).toContain(`id: "${panelId}"`);
    }
    expect(findings).toContain('data-testid="project-intelligence-findings-ready"');
    expect(reports).toContain('data-testid="project-intelligence-reports-ready"');
  });

  it("preserves Engineering OS shell markers and module launcher", () => {
    const dash = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/engineering/page.tsx"),
      "utf8",
    );
    const modules = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/engineering/modules/page.tsx"),
      "utf8",
    );
    const platform = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/platform/home/page.tsx"),
      "utf8",
    );
    expect(platform).toContain('data-testid="rtb-ai-platform-ready"');
    expect(dash).toContain('data-testid="engineering-os-shell"');
    expect(modules).toContain('data-testid="engineering-module-launcher"');
    expect(modules).toContain("project_intelligence");
    const osModules = resolveOsModules(ENGINEERING_OS_RUNTIME_MANIFEST);
    expect(osModules.some((m) => m.moduleKey === "project_intelligence")).toBe(true);
  });

  it("keeps Teams live deferred and Manual meeting provider certified", () => {
    const types = readFileSync(
      resolve(ROOT, "packages/project-intelligence/src/meetings/types.ts"),
      "utf8",
    );
    expect(types).toMatch(/manual:\s*"certified"/);
    const teamsStatus = readFileSync(
      resolve(ROOT, "docs/integrations/MICROSOFT_TEAMS_CONNECTOR_STATUS.md"),
      "utf8",
    );
    expect(teamsStatus).toMatch(/conditionally_deferred/);
  });
});
