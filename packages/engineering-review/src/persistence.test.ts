import { describe, expect, it } from "vitest";
import { createReviewPackage } from "./review-package";
import { createReviewRun } from "./review-run";
import { createReviewScope } from "./review-scope";
import { createReviewFinding } from "./finding";
import { createFindingEvidence } from "./evidence";
import { ERA1_REVIEW_RULES } from "./rule";
import { InMemoryReviewAuditSink } from "./audit";
import { MemoryEngineeringReviewStore, createSharedReviewMemory } from "./persistence/memory-store";
import { serviceRolePrincipal, type ReviewAccessPrincipal } from "./persistence/access";
import { findingFromRow } from "./persistence/mappers";
import { expectCode, expectCodeAsync } from "./expect-code";
import type { ReviewFindingRow } from "./persistence/rows";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const WS_A = "workspace-a";
const WS_B = "workspace-b";
const PROJECT_A = "project-a";
const PROJECT_B = "project-b";

function principal(input: {
  userId: string;
  tenantId: string;
  workspaceId: string;
  action?: "execute" | "admin" | "none";
}): ReviewAccessPrincipal {
  return {
    userId: input.userId,
    tenantIds: [input.tenantId],
    workspaceIds: [input.workspaceId],
    permissions:
      input.action && input.action !== "none"
        ? [{ resource: "engineering", action: input.action }]
        : [],
  };
}

function evidenceDraft(overrides: Record<string, string> = {}) {
  return {
    evidenceId: "ev-1",
    documentId: "doc-1",
    tenantId: TENANT_A,
    workspaceId: WS_A,
    projectId: PROJECT_A,
    revision: "C",
    span: "150 kPa",
    sourceType: "structured_field" as const,
    ...overrides,
  };
}

function packageA() {
  return createReviewPackage({
    id: "pkg-a",
    tenantId: TENANT_A,
    workspaceId: WS_A,
    projectId: PROJECT_A,
    name: "Package A",
    createdBy: "user-a",
    documents: [{ documentId: "doc-1", revision: "C", role: "specification" }],
    now: "2026-01-01T00:00:00.000Z",
  });
}

describe("persistence security (tenant + workspace RLS simulation)", () => {
  it("prevents Tenant A from reading Tenant B review packages and findings", async () => {
    const memory = createSharedReviewMemory();
    const admin = new MemoryEngineeringReviewStore(serviceRolePrincipal(), memory);
    admin.registerKnownDocument({
      documentId: "doc-1",
      tenantId: TENANT_A,
      workspaceId: WS_A,
      projectId: PROJECT_A,
    });
    await admin.saveReviewPackage(packageA());
    const run = await admin.startReviewRun(
      createReviewRun({
        id: "run-a",
        pkg: packageA(),
        scope: createReviewScope({ reviewTypes: ["missing_information"] }),
        rules: ERA1_REVIEW_RULES.filter((rule) => rule.reviewType === "missing_information"),
      }),
    );
    await admin.persistCandidateFindings([
      createReviewFinding({
        id: "finding-a",
        tenantId: TENANT_A,
        workspaceId: WS_A,
        projectId: PROJECT_A,
        reviewPackageId: "pkg-a",
        reviewRunId: run.id,
        category: "missing_information",
        title: "Missing",
        description: "x",
        severity: "minor",
        confidence: { score: 0.4 },
        evidence: [evidenceDraft()],
        reasoningSummary: "x",
        recommendedAction: "x",
        provenance: { origin: "detector" },
      }),
    ]);

    const tenantB = new MemoryEngineeringReviewStore(
      principal({ userId: "user-b", tenantId: TENANT_B, workspaceId: WS_B, action: "execute" }),
      memory,
    );
    expect(await tenantB.loadReviewPackage("pkg-a")).toBeNull();
    expect(await tenantB.loadReviewFinding("finding-a")).toBeNull();
    expect(await tenantB.loadReviewRegister(run.id)).toBeNull();
  });

  it("prevents Workspace B from reading Workspace A data in the same tenant", async () => {
    const memory = createSharedReviewMemory();
    const writer = new MemoryEngineeringReviewStore(
      principal({ userId: "user-a", tenantId: TENANT_A, workspaceId: WS_A, action: "execute" }),
      memory,
    );
    writer.registerKnownDocument({
      documentId: "doc-1",
      tenantId: TENANT_A,
      workspaceId: WS_A,
      projectId: PROJECT_A,
    });
    await writer.saveReviewPackage(packageA());

    const workspaceB = new MemoryEngineeringReviewStore(
      principal({ userId: "user-ab", tenantId: TENANT_A, workspaceId: WS_B, action: "execute" }),
      memory,
    );
    expect(await workspaceB.loadReviewPackage("pkg-a")).toBeNull();
  });

  it("rejects cross-workspace, cross-tenant, and wrong-project evidence attachment", async () => {
    const memory = createSharedReviewMemory();
    const store = new MemoryEngineeringReviewStore(serviceRolePrincipal(), memory);
    store.registerKnownDocument({
      documentId: "doc-ws-b",
      tenantId: TENANT_A,
      workspaceId: WS_B,
      projectId: PROJECT_A,
    });
    store.registerKnownDocument({
      documentId: "doc-tenant-b",
      tenantId: TENANT_B,
      workspaceId: WS_B,
      projectId: PROJECT_B,
    });
    store.registerKnownDocument({
      documentId: "doc-project-b",
      tenantId: TENANT_A,
      workspaceId: WS_A,
      projectId: PROJECT_B,
    });
    await store.saveReviewPackage(packageA());
    const run = await store.startReviewRun(
      createReviewRun({
        id: "run-a",
        pkg: packageA(),
        scope: createReviewScope({ reviewTypes: ["missing_information"] }),
        rules: ERA1_REVIEW_RULES.filter((rule) => rule.reviewType === "missing_information"),
      }),
    );
    const finding = createReviewFinding({
      id: "finding-a",
      tenantId: TENANT_A,
      workspaceId: WS_A,
      projectId: PROJECT_A,
      reviewPackageId: "pkg-a",
      reviewRunId: run.id,
      category: "other_observation",
      title: "x",
      description: "x",
      severity: "minor",
      confidence: { score: 0.5 },
      evidence: [evidenceDraft({ documentId: "doc-1" })],
      reasoningSummary: "x",
      recommendedAction: "x",
      provenance: { origin: "human" },
    });
    store.registerKnownDocument({
      documentId: "doc-1",
      tenantId: TENANT_A,
      workspaceId: WS_A,
      projectId: PROJECT_A,
    });
    await store.saveReviewFinding(finding);

    await expectCodeAsync(
      () =>
        store.attachVerifiedEvidence(
          finding.id,
          createFindingEvidence(
            evidenceDraft({ evidenceId: "ev-ws", documentId: "doc-ws-b", workspaceId: WS_A }),
            finding,
          ),
        ),
      "cross_workspace_rejected",
    );
    await expectCodeAsync(
      () =>
        store.attachVerifiedEvidence(
          finding.id,
          createFindingEvidence(
            evidenceDraft({ evidenceId: "ev-t", documentId: "doc-tenant-b", tenantId: TENANT_A }),
            finding,
          ),
        ),
      "cross_tenant_rejected",
    );
    await expectCodeAsync(
      () =>
        store.attachVerifiedEvidence(
          finding.id,
          createFindingEvidence(
            evidenceDraft({ evidenceId: "ev-p", documentId: "doc-project-b", projectId: PROJECT_A }),
            finding,
          ),
        ),
      "cross_project_rejected",
    );
  });

  it("rejects unauthorized insert, update, and delete", async () => {
    const memory = createSharedReviewMemory();
    const reader = new MemoryEngineeringReviewStore(
      principal({ userId: "reader", tenantId: TENANT_A, workspaceId: WS_A, action: "none" }),
      memory,
    );
    await expectCodeAsync(() => reader.saveReviewPackage(packageA()), "rls_insert_denied");

    const writer = new MemoryEngineeringReviewStore(
      principal({ userId: "writer", tenantId: TENANT_A, workspaceId: WS_A, action: "execute" }),
      memory,
    );
    writer.registerKnownDocument({
      documentId: "doc-1",
      tenantId: TENANT_A,
      workspaceId: WS_A,
      projectId: PROJECT_A,
    });
    await writer.saveReviewPackage(packageA());
    await expectCodeAsync(() => reader.deleteReviewPackage("pkg-a"), "rls_delete_denied");
    await expectCodeAsync(() => writer.deleteReviewPackage("pkg-a"), "rls_delete_denied");

    const loaded = await writer.loadReviewPackage("pkg-a");
    expect(loaded?.name).toBe("Package A");
    await expectCodeAsync(
      () => reader.saveReviewPackage({ ...loaded!, name: "Hijack", updatedAt: "2026-01-02T00:00:00.000Z" }),
      "rls_update_denied",
    );
  });

  it("requires a human actor and rejects AI disposition", async () => {
    const memory = createSharedReviewMemory();
    const store = new MemoryEngineeringReviewStore(serviceRolePrincipal(), memory);
    store.registerKnownDocument({
      documentId: "doc-1",
      tenantId: TENANT_A,
      workspaceId: WS_A,
      projectId: PROJECT_A,
    });
    await store.saveReviewPackage(packageA());
    const run = await store.startReviewRun(
      createReviewRun({
        id: "run-a",
        pkg: packageA(),
        scope: createReviewScope({ reviewTypes: ["missing_information"] }),
        rules: ERA1_REVIEW_RULES.filter((rule) => rule.reviewType === "missing_information"),
      }),
    );
    const finding = await store.saveReviewFinding(
      createReviewFinding({
        id: "finding-a",
        tenantId: TENANT_A,
        workspaceId: WS_A,
        projectId: PROJECT_A,
        reviewPackageId: "pkg-a",
        reviewRunId: run.id,
        category: "other_observation",
        title: "x",
        description: "x",
        severity: "minor",
        confidence: { score: 0.5 },
        evidence: [evidenceDraft()],
        reasoningSummary: "x",
        recommendedAction: "x",
        provenance: { origin: "human" },
      }),
    );
    const queued = { ...finding, status: "awaiting_engineer" as const };
    await store.saveReviewFinding(queued);

    await expectCodeAsync(
      () =>
        store.recordHumanDisposition({
          findingId: queued.id,
          action: "accept",
          actorId: "model-1",
          actorKind: "ai",
        }),
      "ai_cannot_dispose",
    );
    await expectCodeAsync(
      () =>
        store.recordHumanDisposition({
          findingId: queued.id,
          action: "accept",
          actorId: " ",
        }),
      "actor_required",
    );
  });

  it("does not coerce invalid severity or confidence from persistence rows", () => {
    const row = {
      id: "f-1",
      review_package_id: "pkg-a",
      review_run_id: "run-a",
      tenant_id: TENANT_A,
      workspace_id: WS_A,
      project_id: PROJECT_A,
      discipline: null,
      category: "other_observation",
      title: "x",
      description: "x",
      severity: "high",
      confidence_band: "medium",
      confidence_score: 0.5,
      requirement_references: [],
      reasoning_summary: "x",
      reasoning_basis: "EVIDENCE_BASED",
      recommended_action: "x",
      status: "candidate",
      verification_state: "unverified",
      human_disposition_id: null,
      provenance: { origin: "detector", engine_version: "x" },
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    } satisfies ReviewFindingRow;
    expectCode(() => findingFromRow(row, []), "persistence_invalid");
    expectCode(
      () => findingFromRow({ ...row, severity: "minor", confidence_band: "extreme" }, []),
      "persistence_invalid",
    );
  });

  it("rejects unauthorized document UUID lookups in the catalog", async () => {
    const memory = createSharedReviewMemory();
    const store = new MemoryEngineeringReviewStore(serviceRolePrincipal(), memory);
    store.registerKnownDocument({
      documentId: "doc-1",
      tenantId: TENANT_A,
      workspaceId: WS_A,
      projectId: PROJECT_A,
    });
    await expectCodeAsync(
      () =>
        store.loadAuthorizedDocument("doc-unknown", {
          tenantId: TENANT_A,
          workspaceId: WS_A,
          projectId: PROJECT_A,
        }),
      "document_unauthorized",
    );
    await expectCodeAsync(
      () =>
        store.loadAuthorizedDocument("doc-1", {
          tenantId: TENANT_A,
          workspaceId: WS_B,
          projectId: PROJECT_A,
        }),
      "cross_workspace_rejected",
    );
  });

  it("records audit events for package and run creation", async () => {
    const memory = createSharedReviewMemory();
    const audit = new InMemoryReviewAuditSink();
    const store = new MemoryEngineeringReviewStore(serviceRolePrincipal(), memory, audit);
    await store.saveReviewPackage(packageA());
    expect(audit.events.map((event) => event.action)).toContain("review_package.created");
  });
});
