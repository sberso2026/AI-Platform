/**
 * Phase 8C Document Intelligence integration unit tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertNoDuplicateDomainOwnership,
  ENGINEERING_DOMAIN_ENTITY_KINDS,
} from "@rtb/types";
import { defaultEngineeringModuleRegistry } from "@rtb/engineering-os";
import {
  DOCUMENT_INTELLIGENCE_SHARED_SERVICES,
  DOCUMENT_REVIEW_ACTIONS,
  FORBIDDEN_DIRECT_CORE_WRITES,
  PROJECT_INTELLIGENCE_MODULE_KEY,
  assertDocumentIntelligenceSharedServices,
  assertFindingsHandoffCannotMutateCore,
  assertNoPrivateAuditOrNotificationStack,
  assertProjectIntelligenceSharedStack,
  createDocumentFindingsHandoff,
  applyDocumentReviewAction,
} from "@rtb/project-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("Phase 8C Document Intelligence integration", () => {
  it("documents reconciliation and ownership", () => {
    expect(
      existsSync(resolve(ROOT, "docs/migration/PROJECT_INTELLIGENCE_DOCUMENT_PHASE_8C_RECONCILIATION.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/architecture/PROJECT_INTELLIGENCE_DOCUMENT_DATA_OWNERSHIP.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/testing/PROJECT_INTELLIGENCE_DOCUMENT_PRODUCTION_BASELINE.md")),
    ).toBe(true);
    const recon = readFileSync(
      resolve(ROOT, "docs/migration/PROJECT_INTELLIGENCE_DOCUMENT_PHASE_8C_RECONCILIATION.md"),
      "utf8",
    );
    expect(recon.toLowerCase()).not.toMatch(/cortex/);
    expect(recon).toMatch(/Do not rebuild/i);
  });

  it("keeps document_intelligence registered under Project Intelligence", () => {
    const mod = defaultEngineeringModuleRegistry.get(PROJECT_INTELLIGENCE_MODULE_KEY)!;
    expect(mod.features?.some((f) => f.id === "document_intelligence")).toBe(true);
    expect(mod.features?.find((f) => f.id === "document_intelligence")?.capabilities?.some((c) => c.id === "document.intelligence.query")).toBe(true);
  });

  it("consumes shared Engineering services without private audit/notification", () => {
    expect(() => assertDocumentIntelligenceSharedServices()).not.toThrow();
    expect(() => assertProjectIntelligenceSharedStack()).not.toThrow();
    expect(() =>
      assertNoPrivateAuditOrNotificationStack({
        implementsPrivateAudit: false,
        implementsPrivateNotification: false,
      }),
    ).not.toThrow();
    expect(DOCUMENT_INTELLIGENCE_SHARED_SERVICES).toContain("activity");
    expect(DOCUMENT_INTELLIGENCE_SHARED_SERVICES).toContain("notification");
  });

  it("forbids competing Engineering Core ownership and direct core writes list", () => {
    expect(FORBIDDEN_DIRECT_CORE_WRITES).toContain("engineering_documents");
    expect(FORBIDDEN_DIRECT_CORE_WRITES).toContain("engineering_decisions");
    expect(() =>
      assertNoDuplicateDomainOwnership(
        ENGINEERING_DOMAIN_ENTITY_KINDS.map((entity) => ({
          entity,
          owner: "engineering-os-core",
        })),
      ),
    ).not.toThrow();
  });

  it("emits typed Findings Intelligence handoff that cannot mutate Core", () => {
    const handoff = createDocumentFindingsHandoff({
      id: "f1",
      findingType: "missing_specification",
      title: "Missing spec",
      confidence: 0.7,
      evidence: [
        {
          engineeringDocumentId: "d1",
          revision: "A",
          excerpt: "shall",
          evidenceScore: 1,
          chunkId: "c1",
        },
      ],
      engineeringDocumentId: "d1",
      traceId: "t1",
    });
    expect(() => assertFindingsHandoffCannotMutateCore(handoff)).not.toThrow();
    expect(handoff.mayMutateEngineeringCore).toBe(false);
    expect(handoff.targetFeatureKey).toBe("findings_intelligence");
  });

  it("supports full review action set without Core mutation", () => {
    expect(DOCUMENT_REVIEW_ACTIONS).toContain("approve");
    expect(DOCUMENT_REVIEW_ACTIONS).toContain("request_changes");
    expect(DOCUMENT_REVIEW_ACTIONS).toContain("reopen");
    const decision = applyDocumentReviewAction({
      action: "approve",
      reviewerUserId: "user-1",
      reasonCode: "ok",
    });
    expect(decision.coreMutationApplied).toBe(false);
    expect(decision.reviewState).toBe("approved");
  });

  it("exposes document-intelligence-ready inside Project Intelligence shell", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/documents/page.tsx",
      ),
      "utf8",
    );
    const shell = readFileSync(
      resolve(ROOT, "apps/web/src/components/engineering/project-intelligence-shell.tsx"),
      "utf8",
    );
    expect(page).toContain('data-testid="document-intelligence-ready"');
    expect(page).toContain('data-testid="project-intelligence-documents-ready"');
    expect(shell).toContain('data-testid="project-intelligence-shell"');
    expect(page).toContain("Document Intelligence");
  });

  it("preserves durable runtime markers and embedding contract", () => {
    const worker = readFileSync(
      resolve(ROOT, "packages/project-intelligence/src/documents/document-worker.ts"),
      "utf8",
    );
    const registry = readFileSync(
      resolve(ROOT, "packages/project-intelligence/src/documents/embedding-registry.ts"),
      "utf8",
    );
    const migration = readFileSync(
      resolve(
        ROOT,
        "supabase/migrations/20260712200000_batch_37_project_intelligence_document_runtime.sql",
      ),
      "utf8",
    );
    expect(worker).toMatch(/SKIP LOCKED|claim/);
    expect(registry).toMatch(/text-embedding-3-small/);
    expect(registry).toMatch(/1536/);
    expect(migration).toMatch(/HNSW|hnsw/i);
    expect(migration).toMatch(/SKIP LOCKED/);
  });
});
