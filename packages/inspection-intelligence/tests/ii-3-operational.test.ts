import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED,
  AUTONOMOUS_INSPECTION_APPROVAL_ENABLED,
  AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED,
  DATABASE_POLICY_CHANGED,
  DUPLICATE_ACTION_MODEL_DETECTED,
  DUPLICATE_CONDITION_MODEL_DETECTED,
  DUPLICATE_ENGINEERING_TRUTH_MODEL_DETECTED,
  DUPLICATE_FILE_MODEL_DETECTED,
  DUPLICATE_FINDING_MODEL_DETECTED,
  GENERIC_NUMERIC_SCHEME_V1,
  II_3_IMPLEMENTED,
  II_4_READY,
  II_AI_INSPECTION_ENGINEER_IMPLEMENTED,
  II_COMMAND_CENTRE_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_II_3_IMPLEMENTED,
  MemoryInspectionDb,
  SCHEMA_CHANGED,
  computeDeterministicIntelligence,
  createHostedInspectionRepository,
  createObservedConditionRating,
  memoryActor,
  type HostedInspectionContext,
} from "../src";

const tenantA = randomUUID();
const workspaceA = randomUUID();
const projectA = randomUUID();
const actorA = randomUUID();

function ctx(projectId?: string): HostedInspectionContext {
  return { tenantId: tenantA, workspaceId: workspaceA, actorUserId: actorA, projectId };
}

describe("II-3 defect, condition, and evidence intelligence", () => {
  it("locks II-3 flags without schema, Command Centre, AI, or duplicate truth models", () => {
    expect(INSPECTION_INTELLIGENCE_II_3_IMPLEMENTED).toBe(true);
    expect(II_3_IMPLEMENTED).toBe(true);
    expect(II_4_READY).toBe(true);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(DATABASE_POLICY_CHANGED).toBe(false);
    expect(II_COMMAND_CENTRE_IMPLEMENTED).toBe(true);
    expect(II_AI_INSPECTION_ENGINEER_IMPLEMENTED).toBe(true);
    expect(AUTONOMOUS_INSPECTION_APPROVAL_ENABLED).toBe(false);
    expect(AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED).toBe(false);
    expect(AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED).toBe(false);
    expect(DUPLICATE_FINDING_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_ACTION_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_CONDITION_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_FILE_MODEL_DETECTED).toBe(false);
    expect(DUPLICATE_ENGINEERING_TRUTH_MODEL_DETECTED).toBe(false);
  });

  it("computes deterministic indicators without inventing health or converting unknown to pass", () => {
    const result = computeDeterministicIntelligence({
      defects: [
        { id: "d1", status: "open", taxonomy: { severity: "high" } },
        { id: "d2", status: "closed", taxonomy: {} },
        { id: "d3" },
      ],
      correctiveActions: [{ id: "ca1", status: "assigned" }, { id: "ca2", status: "closed" }],
      verifications: [{ id: "v1", kind: "defect", subject_id: "d1", status: "pending", session_id: "s1" }],
      sessions: [
        { id: "s1", status: "started" },
        { id: "s2", status: "started" },
      ],
      evidence: [{ id: "e1", session_id: "s1" }],
      conditionRatings: [],
    });
    expect(result.openDefectCount.value).toBe(1);
    expect(result.openDefectCount.unknownStatus).toBe(1);
    expect(result.defectsByRecordedSeverity.counts.high).toBe(1);
    expect(result.defectsByRecordedSeverity.unknownSeverity).toBe(2);
    expect(result.unverifiedDefects.provenanceIds).toEqual(expect.arrayContaining(["d1", "d3"]));
    expect(result.outstandingCorrectiveActions.value).toBe(1);
    expect(result.evidenceCompleteness.withoutRegisteredEvidence).toBe(1);
    expect(result.conditionRatingDistribution.unratedSessions).toBe(2);
    expect(result.inspectionsAwaitingVerification.pendingVerifications).toBe(1);
    expect(result.indicators.every((item) => item.unknownBehavior && item.provenance)).toBe(true);
  });

  it("persists inspection defects, remediation, assessment, rating, and verification on V1 tables", async () => {
    const db = new MemoryInspectionDb();
    db.seed("engineering_projects", [{ id: projectA, tenant_id: tenantA, workspace_id: workspaceA }]);
    const repo = createHostedInspectionRepository(ctx(projectA), db.clientFor(memoryActor(ctx(projectA))));
    const created = await repo.createPlan({
      title: "II-3",
      targets: [
        {
          id: randomUUID(),
          kind: "project",
          canonicalId: projectA,
          snapshot: { capturedAt: new Date().toISOString(), label: "A" },
        },
      ],
    });
    const session = await repo.startSession({ planId: String(created.plan.id) });
    const observation = await repo.recordObservation({
      sessionId: String(session.id),
      checklistItemType: "visual",
      body: "flange",
    });
    const defect = await repo.createDefect({
      sessionId: String(session.id),
      observationId: String(observation.id),
      title: "Corrosion",
      description: "face",
      taxonomy: { severity: "medium", urgency: "routine", monitoringRequired: true, defectCategory: "corrosion" },
    });
    expect(defect.status).toBe("identified");
    const rec = await repo.linkRecommendation({
      sessionId: String(session.id),
      defectId: defect.id,
      action: "repair",
      rationale: "recoat",
    });
    const ca = await repo.createCorrectiveAction({
      sessionId: String(session.id),
      defectId: defect.id,
      recommendationId: rec.id,
      ownerPersonId: actorA,
      dueAt: new Date().toISOString(),
      description: "recoat flange",
    });
    expect(ca.status).toBe("open");
    expect((ca as { coreActionId?: string }).coreActionId).toBeUndefined();
    const assessment = await repo.recordAssessment({
      sessionId: String(session.id),
      defectId: defect.id,
      title: "Human",
      body: "repair",
    });
    expect(assessment.aiGenerated).toBe(false);
    const rating = await repo.persistConditionRating({
      sessionId: String(session.id),
      componentScope: "flange",
      inspectionScope: "visual",
      observationIds: [String(observation.id)],
      scheme: GENERIC_NUMERIC_SCHEME_V1,
      numericScore: 42,
      confidence: 0.7,
      uncertainty: 0.2,
      evidenceSufficiency: "sufficient",
      packId: "generic",
    });
    expect(rating.assessorUserId).toBe(actorA);
    expect(rating.reviewState).toBe("draft");
    await expect(
      repo.persistConditionRating({
        sessionId: String(session.id),
        componentScope: "flange",
        inspectionScope: "visual",
        observationIds: [String(observation.id)],
        scheme: GENERIC_NUMERIC_SCHEME_V1,
        numericScore: 1,
        confidence: 0.1,
        uncertainty: 0.9,
        evidenceSufficiency: "abstain",
        packId: "generic",
      }),
    ).rejects.toThrow(/condition_rating_abstain/);
    const verification = await repo.requestVerification({
      sessionId: String(session.id),
      kind: "defect",
      subjectId: defect.id,
    });
    expect(verification.status).toBe("pending");
    const workspace = await repo.getDefectWorkspace(defect.id);
    expect(workspace.ownership.inspectionDefect).toBe(true);
    expect(workspace.ownership.projectIntelligenceFinding).toBe(false);
    expect(workspace.ownership.engineeringCoreAction).toBe(false);
    const listed = await repo.listDefects();
    expect(listed.some((row) => String(row.id) === defect.id)).toBe(true);
    const intelligence = await repo.getIntelligence();
    expect(intelligence.openDefectCount.value).toBeGreaterThanOrEqual(1);
    expect(intelligence.conditionRatingDistribution.recordedRatings).toBeGreaterThanOrEqual(1);
  });

  it("refuses to persist an abstain rating as a canonical observed value", () => {
    expect(() =>
      createObservedConditionRating({
        tenantId: tenantA,
        workspaceId: workspaceA,
        sessionId: randomUUID(),
        componentScope: "x",
        inspectionScope: "visual",
        observationIds: [],
        scheme: GENERIC_NUMERIC_SCHEME_V1,
        numericScore: 80,
        confidence: 0.9,
        uncertainty: 0.1,
        evidenceSufficiency: "insufficient",
        assessorUserId: actorA,
        packId: "generic",
      }),
    ).toThrow(/condition_rating_abstain/);
  });
});
