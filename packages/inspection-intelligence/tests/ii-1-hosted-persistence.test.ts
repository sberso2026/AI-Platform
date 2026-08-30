import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  GENERIC_NUMERIC_SCHEME_V1,
  HostedInspectionRepository,
  II_HOSTED_PERSISTENCE_WIRED,
  INSPECTION_INTELLIGENCE_II_1_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_II_2_READY,
  MemoryInspectionDb,
  SCHEMA_CHANGED,
  autonomousConditionRatingCertificationEnabled,
  autonomousInspectionApprovalEnabled,
  autonomousRemediationApprovalEnabled,
  createHostedInspectionRepository,
  duplicatePersistenceModelDetected,
  memoryActor,
  type HostedInspectionContext,
} from "../src";

const tenantA = randomUUID();
const tenantB = randomUUID();
const workspaceA = randomUUID();
const workspaceB = randomUUID();
const projectA = randomUUID();
const actorA = randomUUID();
const actorB = randomUUID();

function ctxA(projectId?: string): HostedInspectionContext {
  return { tenantId: tenantA, workspaceId: workspaceA, actorUserId: actorA, projectId };
}

function seedCanonical(db: MemoryInspectionDb) {
  db.seed("engineering_projects", [
    { id: projectA, tenant_id: tenantA, workspace_id: workspaceA, project_code: "P-A", project_name: "Alpha" },
  ]);
}

async function roundTrip(repo: HostedInspectionRepository) {
  const created = await repo.createPlan({
    title: "Weekly visual",
    targets: [
      {
        id: randomUUID(),
        kind: "project",
        canonicalId: projectA,
        snapshot: { capturedAt: new Date().toISOString(), label: "Alpha" },
      },
    ],
    checklistItemTypes: ["pass_fail", "numeric"],
  });
  await repo.updatePlan(String(created.plan.id), { title: "Weekly visual revised" });
  const plan = await repo.getPlan(String(created.plan.id));
  const session = await repo.startSession({ planId: String(created.plan.id) });
  const observation = await repo.recordObservation({
    sessionId: String(session.id),
    checklistItemType: "numeric",
    body: "gap recorded",
  });
  const unknownMeasurement = await repo.recordMeasurement({
    sessionId: String(session.id),
    observationId: String(observation.id),
    measurementType: "gap_mm",
    observedValue: 4.2,
  });
  const measured = await repo.recordMeasurement({
    sessionId: String(session.id),
    observationId: String(observation.id),
    measurementType: "gap_mm",
    observedValue: 4.9,
    expectedValue: 5,
    criteria: { mode: "tolerance", tolerance: { absolute: 0.5 } },
  });
  const evidence = await repo.registerEvidence({
    sessionId: String(session.id),
    observationId: String(observation.id),
    kind: "photo",
    fileId: "file_platform_1",
  });
  const defect = await repo.createDefect({
    sessionId: String(session.id),
    observationId: String(observation.id),
    title: "Corrosion",
    description: "flange face",
    taxonomy: {
      severity: "medium",
      urgency: "routine",
      monitoringRequired: true,
      defectCategory: "corrosion",
    },
  });
  const recommendation = await repo.linkRecommendation({
    sessionId: String(session.id),
    defectId: defect.id,
    action: "repair",
    rationale: "restore coating",
  });
  let ca = await repo.createCorrectiveAction({
    sessionId: String(session.id),
    defectId: defect.id,
    recommendationId: recommendation.id,
    ownerPersonId: actorA,
    dueAt: new Date(Date.now() + 86400000).toISOString(),
    description: "recoat flange",
  });
  ca = await repo.progressCorrectiveAction(ca.id, "in_progress");
  ca = await repo.progressCorrectiveAction(ca.id, "pending_verification");
  ca = await repo.progressCorrectiveAction(ca.id, "verified");
  ca = await repo.progressCorrectiveAction(ca.id, "closed");
  const assessment = await repo.recordAssessment({
    sessionId: String(session.id),
    defectId: defect.id,
    title: "Human assessment",
    body: "repair required",
  });
  const condition = await repo.persistConditionRating({
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
  const verification = await repo.requestVerification({
    sessionId: String(session.id),
    kind: "corrective_action",
    subjectId: ca.id,
  });
  await repo.completeVerificationRecord(verification.id, { status: "passed", notes: "human verified" });
  await repo.transitionSession(String(session.id), "completed");
  await repo.transitionSession(String(session.id), "submitted");
  await repo.transitionSession(String(session.id), "reviewed", {
    action: "inspection.review",
    actorUserId: actorA,
  });
  await repo.transitionSession(String(session.id), "approved", {
    action: "inspection.approve",
    actorUserId: actorA,
  });
  const closed = await repo.closeOut(String(session.id));
  const rereadCondition = await repo.getConditionRating(condition.ratingId);
  return {
    plan,
    session,
    observation,
    unknownMeasurement,
    measured,
    evidence,
    defect,
    recommendation,
    ca,
    assessment,
    condition,
    rereadCondition,
    closed,
  };
}

describe("II-1 hosted persistence", () => {
  it("wires hosted persistence without a second truth model or schema change", () => {
    expect(II_HOSTED_PERSISTENCE_WIRED).toBe(true);
    expect(INSPECTION_INTELLIGENCE_II_1_IMPLEMENTED).toBe(true);
    expect(INSPECTION_INTELLIGENCE_II_2_READY).toBe(true);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(duplicatePersistenceModelDetected).toBe(false);
    expect(autonomousInspectionApprovalEnabled).toBe(false);
    expect(autonomousConditionRatingCertificationEnabled).toBe(false);
    expect(autonomousRemediationApprovalEnabled).toBe(false);
  });

  it("round-trips planning, execution, evidence, defects, condition, and close-out", async () => {
    const db = new MemoryInspectionDb();
    seedCanonical(db);
    const repo = createHostedInspectionRepository(ctxA(projectA), db.clientFor(memoryActor(ctxA(projectA))));
    const result = await roundTrip(repo);
    expect(result.plan.title).toBe("Weekly visual revised");
    expect(result.session.started_at).toBeTruthy();
    expect(result.closed.status).toBe("closed");
    expect(result.unknownMeasurement.evaluation_status).toBe("unknown");
    expect(result.measured.evaluation_status).toBe("pass");
    expect(result.evidence.file_id).toBe("file_platform_1");
    expect(result.defect.status).toBe("identified");
    expect(result.recommendation.status).toBe("issued");
    expect(result.ca.status).toBe("closed");
    expect(result.assessment.aiGenerated).toBe(false);
    expect(result.condition.reviewState).toBe("draft");
    expect(result.rereadCondition?.ratingId).toBe(result.condition.ratingId);
    expect(result.closed.status).toBe("closed");
    expect(db.rows("inspection_plans")).toHaveLength(1);
    expect(db.rows("inspection_sessions")).toHaveLength(1);
    expect(db.rows("inspection_events").length).toBeGreaterThan(0);
  });

  it("denies unauthenticated, cross-tenant, cross-workspace, and cross-project access without leaking", async () => {
    const db = new MemoryInspectionDb();
    seedCanonical(db);
    const repoA = createHostedInspectionRepository(ctxA(projectA), db.clientFor(memoryActor(ctxA(projectA))));
    const created = await repoA.createPlan({
      title: "Scoped",
      targets: [{ id: randomUUID(), kind: "project", canonicalId: projectA }],
    });
    const planId = String(created.plan.id);

    const unauthenticated = db.clientFor({ tenantId: tenantA, workspaceId: workspaceA, userId: null });
    const { data: unauthRow } = await unauthenticated
      .from("inspection_plans")
      .select("*")
      .eq("id", planId)
      .maybeSingle();
    expect(unauthRow).toBeNull();

    const otherTenant = createHostedInspectionRepository(
      { tenantId: tenantB, workspaceId: workspaceA, actorUserId: actorB },
      db.clientFor({
        tenantId: tenantB,
        workspaceId: workspaceA,
        userId: actorB,
        workspaceMemberships: [workspaceA],
      }),
    );
    await expect(otherTenant.getPlan(planId)).rejects.toThrow(/not_found/);

    const otherWorkspace = createHostedInspectionRepository(
      { tenantId: tenantA, workspaceId: workspaceB, actorUserId: actorA },
      db.clientFor({
        tenantId: tenantA,
        workspaceId: workspaceB,
        userId: actorA,
        workspaceMemberships: [workspaceB],
      }),
    );
    await expect(otherWorkspace.getPlan(planId)).rejects.toThrow(/not_found/);

    const otherProject = createHostedInspectionRepository(
      ctxA(randomUUID()),
      db.clientFor(memoryActor(ctxA(projectA))),
    );
    await expect(
      otherProject.startSession({ planId }),
    ).rejects.toThrow(/not_found/);

    await expect(repoA.createPlan({ tenantId: tenantB, title: "override", targets: [] })).rejects.toThrow(
      "caller_tenant_override_forbidden",
    );
  });

  it("does not fabricate pass/good/complete from missing measurement criteria", async () => {
    const db = new MemoryInspectionDb();
    seedCanonical(db);
    const repo = createHostedInspectionRepository(ctxA(), db.clientFor(memoryActor(ctxA())));
    const created = await repo.createPlan({
      title: "Unknown semantics",
      targets: [{ id: randomUUID(), kind: "custom" }],
    });
    const session = await repo.startSession({ planId: String(created.plan.id) });
    const measurement = await repo.recordMeasurement({
      sessionId: String(session.id),
      measurementType: "gap_mm",
      observedValue: 0,
    });
    expect(measurement.evaluation_status).toBe("unknown");
    expect(measurement.evaluation_status).not.toBe("pass");
  });

  it("rejects autonomous condition certification and missing human verifier", async () => {
    expect(autonomousConditionRatingCertificationEnabled).toBe(false);
    const db = new MemoryInspectionDb();
    seedCanonical(db);
    const repo = createHostedInspectionRepository(ctxA(), db.clientFor(memoryActor(ctxA())));
    const created = await repo.createPlan({
      title: "Authority",
      targets: [{ id: randomUUID(), kind: "custom" }],
    });
    const session = await repo.startSession({ planId: String(created.plan.id) });
    await repo.transitionSession(String(session.id), "completed");
    await repo.transitionSession(String(session.id), "submitted");
    await expect(
      repo.transitionSession(String(session.id), "reviewed", {
        action: "inspection.write",
        actorUserId: actorA,
      }),
    ).rejects.toThrow(/inspection_transition_unauthorized/);
  });
});
