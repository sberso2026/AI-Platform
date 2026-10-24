import { describe, expect, it } from "vitest";
import { persistDeterministicReview, persistHumanDisposition } from "./adapters/persisted-flow";
import { adaptProjectIntelligenceDocuments, assertReviewInputsReady } from "./adapters/pi-input";
import { createPlatformAuditAdapter } from "./adapters/platform-audit";
import { InMemoryReviewAuditSink } from "./audit";
import { GOLD_CASES, GOLD_SET_DOCUMENTS } from "./eval/fixtures";
import { MemoryEngineeringReviewStore, createSharedReviewMemory } from "./persistence/memory-store";
import { serviceRolePrincipal } from "./persistence/access";
import { createReviewScope } from "./review-scope";
import { expectCode } from "./expect-code";
import type { ProjectIntelligenceDocumentSnapshot } from "./adapters/pi-input";

function snapshotFromGold(
  doc: (typeof GOLD_SET_DOCUMENTS)[keyof typeof GOLD_SET_DOCUMENTS],
): ProjectIntelligenceDocumentSnapshot {
  return {
    engineeringDocumentId: doc.documentId,
    tenantId: doc.tenantId,
    workspaceId: doc.workspaceId,
    engineeringProjectId: doc.projectId,
    title: doc.documentNumber,
    documentType: doc.role,
    documentNumber: doc.documentNumber,
    revision: doc.revision,
    mimeType: "application/pdf",
    processingStatus: "ready",
    warnings: [],
    extractedText: doc.extractedText.text,
    role: doc.role,
    fields: doc.fields,
    requirements: doc.requirements,
    assumptions: doc.assumptions,
    evidenceKeys: doc.evidenceKeys,
  };
}

describe("persisted deterministic review flow", () => {
  it("runs PI input → package → run → detectors → persist → register → disposition history", async () => {
    const gold = GOLD_CASES[0];
    const memory = createSharedReviewMemory();
    const audit = new InMemoryReviewAuditSink();
    const store = new MemoryEngineeringReviewStore(serviceRolePrincipal(), memory, audit);
    const platformEvents: string[] = [];
    const platformAudit = createPlatformAuditAdapter((input) => {
      platformEvents.push(input.action);
    });

    const result = await persistDeterministicReview(store, platformAudit, {
      packageId: "pkg-persist",
      runId: "run-persist",
      name: "Persisted gold package",
      createdBy: "engineer-1",
      tenantId: gold.documents[0].tenantId,
      workspaceId: gold.documents[0].workspaceId,
      projectId: gold.documents[0].projectId,
      documents: gold.documents.map(snapshotFromGold),
      scope: createReviewScope({ reviewTypes: [...gold.reviewTypes] }),
      now: "2026-03-01T00:00:00.000Z",
    });

    expect(result.report.blocking).toHaveLength(0);
    expect(result.run.status).toBe("completed");
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.findings[0]?.status).toBe("awaiting_engineer");
    expect(result.findings[0]?.evidence.length).toBeGreaterThan(0);
    expect(result.register.findings.map((item) => item.title)).toEqual(
      result.findings.map((item) => item.title),
    );
    expect(audit.events.map((event) => event.action)).toEqual(
      expect.arrayContaining([
        "review_package.created",
        "review_run.created",
        "review_run.started",
        "review_finding.created",
        "review_evidence.verified",
        "review_run.completed",
      ]),
    );

    const findingId = result.findings[0].id;
    const accepted = await persistHumanDisposition(store, {
      findingId,
      action: "accept",
      actorId: "engineer-1",
      reason: "Confirmed against both documents",
      now: "2026-03-02T00:00:00.000Z",
    });
    const closed = await persistHumanDisposition(store, {
      findingId,
      action: "close",
      actorId: "lead-1",
      now: "2026-03-03T00:00:00.000Z",
    });
    expect(accepted.finding.status).toBe("accepted");
    expect(closed.finding.status).toBe("closed");
    expect(closed.history).toHaveLength(2);
    expect(closed.history.map((item) => item.action)).toEqual(["accept", "close"]);
    expect(closed.history[0]?.previousStatus).toBe("awaiting_engineer");
    expect(closed.history[0]?.newStatus).toBe("accepted");
    expect(closed.history[1]?.previousStatus).toBe("accepted");
    expect(closed.history[1]?.newStatus).toBe("closed");

    await platformAudit.record({
      tenantId: result.pkg.tenantId,
      workspaceId: result.pkg.workspaceId,
      projectId: result.pkg.projectId,
      action: "review_finding.closed",
      resourceType: "engineering_review_finding",
      resourceId: findingId,
      actorId: "lead-1",
      at: "2026-03-03T00:00:00.000Z",
    });
    expect(platformEvents).toContain("review_finding.closed");

    const reloaded = await store.loadReviewRegister(result.run.id);
    expect(reloaded?.dispositions).toHaveLength(2);
    expect(reloaded?.findings[0]?.status).toBe("closed");
    expect(reloaded?.dispositions[0]?.at).toBe("2026-03-02T00:00:00.000Z");
  });

  it("does not start a persisted run when OCR or unsupported documents are present", async () => {
    const gold = GOLD_CASES[0];
    const report = adaptProjectIntelligenceDocuments([
      snapshotFromGold(gold.documents[0]),
      {
        ...snapshotFromGold(gold.documents[1]),
        processingStatus: "ready_with_warnings",
        warnings: ["insufficient_extracted_text:ocr_recommended"],
        extractedText: "",
      },
    ]);
    expectCode(() => assertReviewInputsReady(report), "review_input_not_ready");

    const memory = createSharedReviewMemory();
    const store = new MemoryEngineeringReviewStore(serviceRolePrincipal(), memory);
    await expect(
      persistDeterministicReview(store, undefined, {
        packageId: "pkg-blocked",
        runId: "run-blocked",
        name: "Blocked",
        createdBy: "engineer-1",
        tenantId: gold.documents[0].tenantId,
        workspaceId: gold.documents[0].workspaceId,
        projectId: gold.documents[0].projectId,
        documents: [
          snapshotFromGold(gold.documents[0]),
          {
            ...snapshotFromGold(gold.documents[1]),
            mimeType: "image/png",
          },
        ],
      }),
    ).rejects.toMatchObject({ code: "review_input_not_ready" });
    expect(await store.loadReviewPackage("pkg-blocked")).toBeNull();
  });
});
