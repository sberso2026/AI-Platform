import { describe, expect, it } from "vitest";
import { applyHumanDisposition, advanceCandidateAfterVerification } from "./disposition";
import { createReviewFinding, verifyFindingEvidence } from "./finding";
import { assertReviewTransition, createReviewLifecycleEvent } from "./lifecycle";
import { asActorId } from "./ids";
import { expectCode } from "./expect-code";

const OWNER = {
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
};

function candidate() {
  return createReviewFinding({
    id: "f-1",
    ...OWNER,
    reviewPackageId: "pkg-1",
    reviewRunId: "run-1",
    category: "cross_document_inconsistency",
    title: "Conflict",
    description: "values differ",
    severity: "major",
    confidence: { score: 0.8 },
    evidence: [
      {
        evidenceId: "ev-1",
        documentId: "doc-1",
        ...OWNER,
        revision: "C",
        span: "150 kPa",
        sourceType: "structured_field",
      },
    ],
    reasoningSummary: "mismatch",
    recommendedAction: "reconcile",
    provenance: { origin: "detector" },
    now: "2026-01-01T00:00:00.000Z",
  });
}

describe("human authority state machine", () => {
  it("allows AI to queue a candidate after verification but not to accept or close", () => {
    const finding = verifyFindingEvidence(candidate());
    const queued = advanceCandidateAfterVerification(finding, "system:engine", "ai");
    expect(queued.status).toBe("awaiting_engineer");
    expectCode(
      () =>
        createReviewLifecycleEvent({
          from: queued.status,
          to: "accepted",
          actorId: asActorId("ai-model"),
          actorKind: "ai",
        }),
      "ai_cannot_dispose",
    );
    expectCode(() => assertReviewTransition("accepted", "closed", "ai"), "ai_cannot_dispose");
    expectCode(
      () => assertReviewTransition("awaiting_engineer", "rejected", "system"),
      "ai_cannot_dispose",
    );
  });

  it("requires an actor for human disposition and records timestamp", () => {
    const finding = advanceCandidateAfterVerification(verifyFindingEvidence(candidate()), "sys", "system");
    expectCode(
      () => applyHumanDisposition({ finding, action: "accept", actorId: " " }),
      "actor_required",
    );
    const { finding: accepted, disposition, event } = applyHumanDisposition({
      finding,
      action: "accept",
      actorId: "engineer-1",
      reason: "Confirmed on both documents",
      now: "2026-01-02T00:00:00.000Z",
    });
    expect(accepted.status).toBe("accepted");
    expect(disposition.actorKind).toBe("human");
    expect(disposition.actorId).toBe("engineer-1");
    expect(disposition.at).toBe("2026-01-02T00:00:00.000Z");
    expect(event.toStatus).toBe("accepted");
  });

  it("supports assign, modify, reject, close, and reopen", () => {
    let finding = advanceCandidateAfterVerification(verifyFindingEvidence(candidate()), "sys", "system");
    finding = applyHumanDisposition({
      finding,
      action: "assign",
      actorId: "lead",
      assignedTo: "engineer-1",
    }).finding;
    expect(finding.status).toBe("assigned");
    finding = applyHumanDisposition({
      finding,
      action: "modify",
      actorId: "engineer-1",
      title: "Pressure conflict (updated)",
      reason: "Clarify title against source documents",
    }).finding;
    expect(finding.status).toBe("modified");
    expect(finding.title).toContain("updated");
    expect(finding.evidence).toHaveLength(1);
    finding = applyHumanDisposition({
      finding,
      action: "reject",
      actorId: "engineer-1",
      reason: "Not a material discrepancy after unit check",
    }).finding;
    expect(finding.status).toBe("rejected");
    finding = applyHumanDisposition({ finding, action: "close", actorId: "engineer-1" }).finding;
    expect(finding.status).toBe("closed");
    finding = applyHumanDisposition({ finding, action: "reopen", actorId: "lead" }).finding;
    expect(finding.status).toBe("awaiting_engineer");
  });

  it("fails closed on invalid transitions", () => {
    const finding = candidate();
    expectCode(
      () => applyHumanDisposition({ finding, action: "close", actorId: "engineer-1" }),
      "transition_invalid",
    );
  });

  it("does not allow evidence to disappear on modify", () => {
    const finding = applyHumanDisposition({
      finding: advanceCandidateAfterVerification(verifyFindingEvidence(candidate()), "sys", "system"),
      action: "assign",
      actorId: "lead",
      assignedTo: "engineer-1",
    }).finding;
    expectCode(
      () =>
        applyHumanDisposition({
          finding,
          action: "modify",
          actorId: "engineer-1",
          evidence: [],
          reason: "Attempted to drop evidence",
        }),
      "evidence_provenance_lost",
    );
  });
});
