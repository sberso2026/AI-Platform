/**
 * Phase 8G Knowledge Intelligence integration unit tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultEngineeringModuleRegistry } from "@rtb/engineering-os";
import {
  KNOWLEDGE_INTELLIGENCE_SHARED_SERVICES,
  PROJECT_INTELLIGENCE_MODULE_KEY,
  assertKnowledgeIntelligenceSharedServices,
  assertNoKnowledgePrivateInfrastructure,
  assertProjectIntelligenceSharedStack,
  EngineeringKnowledgeGraph,
  drillDownPathFor,
  hybridSearchNodes,
} from "@rtb/project-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("Phase 8G Knowledge Intelligence integration", () => {
  it("documents reconciliation, ownership and baselines", () => {
    expect(
      existsSync(resolve(ROOT, "docs/migration/PROJECT_INTELLIGENCE_KNOWLEDGE_PHASE_8G_RECONCILIATION.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/architecture/PROJECT_INTELLIGENCE_KNOWLEDGE_DATA_OWNERSHIP.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/testing/PROJECT_INTELLIGENCE_KNOWLEDGE_PRODUCTION_BASELINE.md")),
    ).toBe(true);
    const recon = readFileSync(
      resolve(ROOT, "docs/migration/PROJECT_INTELLIGENCE_KNOWLEDGE_PHASE_8G_RECONCILIATION.md"),
      "utf8",
    );
    expect(recon.toLowerCase()).not.toMatch(/cortex/);
    expect(recon).toMatch(/Do not duplicate ownership/i);
  });

  it("keeps knowledge_intelligence registered under Project Intelligence", () => {
    const mod = defaultEngineeringModuleRegistry.get(PROJECT_INTELLIGENCE_MODULE_KEY)!;
    expect(mod.features?.some((f) => f.id === "knowledge_intelligence")).toBe(true);
    expect(
      mod.features?.find((f) => f.id === "knowledge_intelligence")?.capabilities?.some(
        (c) => c.id === "knowledge.intelligence.read",
      ),
    ).toBe(true);
  });

  it("consumes shared Engineering services without private infrastructure", () => {
    expect(() => assertKnowledgeIntelligenceSharedServices()).not.toThrow();
    expect(() => assertProjectIntelligenceSharedStack()).not.toThrow();
    expect(() =>
      assertNoKnowledgePrivateInfrastructure({
        implementsPrivateAudit: false,
        implementsPrivateNotification: false,
        implementsPrivateAiRuntime: false,
        implementsPrivateEmbeddingClient: false,
        storesDuplicateBusinessRecords: false,
      }),
    ).not.toThrow();
    expect(KNOWLEDGE_INTELLIGENCE_SHARED_SERVICES.length).toBeGreaterThanOrEqual(5);
  });

  it("hybrid search returns cited grounded hits without ownership duplication", () => {
    const g = new EngineeringKnowledgeGraph();
    const scope = { tenantId: "t", workspaceId: "w" };
    g.upsertNode({
      refId: "m1",
      kind: "meeting",
      owner: "meeting_intelligence",
      title: "Leak discussion",
      snippet: "valve leak",
      ...scope,
      drillDownPath: drillDownPathFor("meeting", "m1"),
      storesBusinessRecord: false,
    });
    const result = hybridSearchNodes(g.listNodes(scope), { query: "valve leak", ...scope });
    expect(result.duplicateOwnership).toBe(false);
    expect(result.hits[0]!.citations[0]!.drillDownPath).toContain("meetings");
  });

  it("exposes knowledge-search-ready inside Project Intelligence shell", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/knowledge/page.tsx",
      ),
      "utf8",
    );
    const shell = readFileSync(
      resolve(ROOT, "apps/web/src/components/engineering/project-intelligence-shell.tsx"),
      "utf8",
    );
    expect(page).toContain('data-testid="knowledge-search-ready"');
    expect(page).toContain('data-testid="project-intelligence-knowledge-ready"');
    expect(shell).toContain('data-testid="project-intelligence-shell"');
    expect(shell).toContain("Knowledge Intelligence");
  });

  it("preserves additive knowledge migration identity", () => {
    const migration = readFileSync(
      resolve(
        ROOT,
        "supabase/migrations/20260806140000_batch_42_project_intelligence_knowledge.sql",
      ),
      "utf8",
    );
    expect(migration).toMatch(/project_intelligence_knowledge_nodes/);
    expect(migration).toMatch(/project_intelligence_knowledge_edges/);
    expect(migration).toMatch(/refs only|relationship|no duplicated/i);
  });
});
