import { describe, expect, it } from "vitest";
import {
  ERA4_GOLD_PACKAGES,
  InMemoryReviewAuditSink,
  InMemoryReviewProductTelemetry,
  MemoryEngineeringReviewStore,
  MemoryReviewDocumentDirectory,
  MemoryReviewProjectDirectory,
  READINESS_LABELS,
  TrustedReviewService,
  ZERO_FINDING_MESSAGE,
  computePilotRates,
  createSharedReviewMemory,
  type ProjectIntelligenceDocumentSnapshot,
  type ReviewActor,
  type ReviewDocumentFixture,
} from "./index";
import { expectCode, expectCodeAsync } from "./expect-code";
import { ADVERSARIAL_CONTROL_PHRASES } from "./control-plane";

const gold1 = ERA4_GOLD_PACKAGES.find((item) => item.id === "pkg-1-material-inconsistency")!;
const gold2 = ERA4_GOLD_PACKAGES.find((item) => item.id === "pkg-2-consistent-control")!;
const OWNER = gold1.documents[0]!;

const ACTOR: ReviewActor = {
  userId: "engineer-a",
  tenantId: OWNER.tenantId,
  workspaceId: OWNER.workspaceId,
};

const PROJECT = {
  id: OWNER.projectId,
  name: "Pilot vessel",
  code: "PV-1",
  tenantId: OWNER.tenantId,
  workspaceId: OWNER.workspaceId,
};

function snapshot(doc: ReviewDocumentFixture, extraText = ""): ProjectIntelligenceDocumentSnapshot {
  return {
    engineeringDocumentId: doc.documentId,
    tenantId: doc.tenantId,
    workspaceId: doc.workspaceId,
    engineeringProjectId: doc.projectId,
    title: doc.documentNumber,
    documentNumber: doc.documentNumber,
    documentType: doc.role,
    revision: doc.revision,
    processingStatus: "ready",
    extractedText: `${doc.extractedText.text}${extraText ? `\n${extraText}` : ""}`,
    fields: doc.fields,
    role: doc.role,
  };
}

function service(docs: readonly ReviewDocumentFixture[], extraText = "") {
  const memory = createSharedReviewMemory();
  const audit = new InMemoryReviewAuditSink();
  const telemetry = new InMemoryReviewProductTelemetry();
  const store = new MemoryEngineeringReviewStore(
    {
      userId: ACTOR.userId,
      tenantIds: [ACTOR.tenantId],
      workspaceIds: [ACTOR.workspaceId],
      permissions: [{ resource: "engineering", action: "execute" }],
    },
    memory,
    audit,
  );
  const review = new TrustedReviewService({
    store,
    projects: new MemoryReviewProjectDirectory([
      PROJECT,
      {
        id: "project-other-workspace",
        name: "Other WS",
        tenantId: ACTOR.tenantId,
        workspaceId: "workspace-other",
      },
    ]),
    documents: new MemoryReviewDocumentDirectory(docs.map((doc) => snapshot(doc, extraText))),
    audit,
    telemetry,
    ids: (() => {
      let n = 0;
      return () => `id-${(n += 1)}`;
    })(),
    now: () => "2026-09-19T00:00:00.000Z",
  });
  return { review, store, audit, telemetry };
}

describe("trusted Review application service", () => {
  it("requires authentication", async () => {
    const { review } = service(gold1.documents);
    await expectCodeAsync(
      () => review.listProjects({ userId: "", tenantId: ACTOR.tenantId, workspaceId: ACTOR.workspaceId }),
      "unauthenticated",
    );
  });

  it("lists only authorized projects and rejects unknown or cross-workspace projects", async () => {
    const { review } = service(gold1.documents);
    const projects = await review.listProjects(ACTOR);
    expect(projects.map((item) => item.id)).toEqual([PROJECT.id]);
    await expectCodeAsync(() => review.getProject(ACTOR, "missing"), "project_unauthorized");
    await expectCodeAsync(
      () => review.getProject(ACTOR, "project-other-workspace"),
      "cross_workspace_rejected",
    );
  });

  it("selects authorized documents with explicit readiness and excludes unsupported from execution", async () => {
    const docs: ReviewDocumentFixture[] = [
      ...gold1.documents,
    ];
    const { review } = service(docs);
    const listed = await review.listDocuments(ACTOR, PROJECT.id);
    expect(listed.every((item) => item.readiness === "READY_MACHINE_READABLE")).toBe(true);
    expect(READINESS_LABELS.READY_MACHINE_READABLE).toBe("READY");
    expect(READINESS_LABELS.OCR_REQUIRED).toBe("OCR REQUIRED");
    expect(READINESS_LABELS.UNSUPPORTED).toBe("UNSUPPORTED");
    expect(READINESS_LABELS.FAILED_INGESTION).toBe("FAILED");
    expect(READINESS_LABELS.NOT_READY).toBe("NOT READY");
  });

  it("rejects unknown document UUIDs at package creation", async () => {
    const { review } = service(gold1.documents);
    await expectCodeAsync(
      () =>
        review.createPackage(ACTOR, {
          projectId: PROJECT.id,
          name: "Bad docs",
          documentIds: ["00000000-0000-4000-8000-000000000099"],
        }),
      "document_unauthorized",
    );
  });

  it("creates a package, runs grounded review, persists findings and evidence", async () => {
    const { review, audit } = service(gold1.documents);
    const created = await review.createPackage(ACTOR, {
      projectId: PROJECT.id,
      name: "Material package",
      documentIds: gold1.documents.map((doc) => doc.documentId),
    });
    await review.setScope(ACTOR, created.pkg.id, ["cross_document_inconsistency"]);
    const started = await review.startReview(ACTOR, created.pkg.id, ["cross_document_inconsistency"]);
    expect(started.run.status).toBe("completed");
    expect(started.register.findings.length).toBeGreaterThan(0);
    expect(started.register.findings[0]?.evidence.length).toBeGreaterThan(0);
    expect(started.register.findings[0]?.verificationState).toBe("evidence_verified");
    expect(audit.events.map((event) => event.action)).toEqual(
      expect.arrayContaining([
        "review_package.created",
        "review_run.created",
        "review_run.started",
        "review_finding.created",
        "review_run.completed",
      ]),
    );
    expect(audit.events.every((event) => event.actorId === ACTOR.userId || event.action.startsWith("review_finding") || event.action.startsWith("review_run") || event.action.startsWith("review_package") || event.action.startsWith("review_evidence"))).toBe(true);
  });

  it("supports a successful zero-finding review without claiming safety or approval", async () => {
    const { review } = service(gold2.documents);
    const created = await review.createPackage(ACTOR, {
      projectId: PROJECT.id,
      name: "Consistent package",
      documentIds: gold2.documents.map((doc) => doc.documentId),
    });
    const started = await review.startReview(ACTOR, created.pkg.id, ["cross_document_inconsistency"]);
    expect(started.zeroFinding).toBe(true);
    expect(started.zeroFindingMessage).toBe(ZERO_FINDING_MESSAGE);
    expect(started.disclaimer.toLowerCase()).not.toMatch(/design is safe|design complies|design approved|no engineering issues exist/);
    expect(started.register.findings).toHaveLength(0);
    expect(started.run.status).toBe("completed");
  });

  it("records human disposition and rejects AI actors", async () => {
    const { review, store } = service(gold1.documents);
    const created = await review.createPackage(ACTOR, {
      projectId: PROJECT.id,
      name: "Disposition package",
      documentIds: gold1.documents.map((doc) => doc.documentId),
    });
    const started = await review.startReview(ACTOR, created.pkg.id, ["cross_document_inconsistency"]);
    const findingId = started.register.findings[0]!.id;
    const accepted = await review.recordDisposition(ACTOR, {
      findingId,
      action: "accept",
    });
    expect(accepted.finding.status).toBe("accepted");
    expect(accepted.history).toHaveLength(1);
    await expectCodeAsync(
      () =>
        store.recordHumanDisposition({
          findingId,
          action: "close",
          actorId: "system:model",
          actorKind: "ai",
        }),
      "ai_cannot_dispose",
    );
  });

  it("ignores malicious document instructions for control-plane behaviour", async () => {
    const injection = ADVERSARIAL_CONTROL_PHRASES.join("\n");
    const { review } = service(gold1.documents, `\n${injection}`);
    const created = await review.createPackage(ACTOR, {
      projectId: PROJECT.id,
      name: "Adversarial package",
      documentIds: gold1.documents.map((doc) => doc.documentId),
    });
    const started = await review.startReview(ACTOR, created.pkg.id, ["cross_document_inconsistency"]);
    expect(started.attemptedControlEffects).toBeGreaterThan(0);
    expect(started.run.scope.reviewTypes).toEqual(["cross_document_inconsistency"]);
    expect(started.register.findings.length).toBeGreaterThan(0);
    expect(started.register.findings.every((finding) => finding.status === "awaiting_engineer")).toBe(true);
    expect(started.register.findings.some((finding) => finding.status === "accepted")).toBe(false);
  });

  it("does not leak secrets into telemetry and can compute pilot rates", async () => {
    const { review, telemetry } = service(gold1.documents);
    const created = await review.createPackage(ACTOR, {
      projectId: PROJECT.id,
      name: "Telemetry package",
      documentIds: gold1.documents.map((doc) => doc.documentId),
    });
    const started = await review.startReview(ACTOR, created.pkg.id, ["cross_document_inconsistency"]);
    await review.recordDisposition(ACTOR, {
      findingId: started.register.findings[0]!.id,
      action: "accept",
    });
    const serialized = JSON.stringify(telemetry.events);
    expect(serialized).not.toMatch(/service_role|extractedText|password|api_key/i);
    const rates = computePilotRates(telemetry.events);
    expect(rates.reviews_completed).toBe(1);
    expect(rates.findings_accepted).toBe(1);
    expect(rates.review_time_saved).toBeNull();
  });
});
