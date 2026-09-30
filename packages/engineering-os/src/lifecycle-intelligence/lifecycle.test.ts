import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { canAuthorizeTransition, evaluateLifecycleGate, markEvaluationStale } from "./evaluate";
import { composeLifecycleThread, fingerprintLifecycleEvidence } from "./fingerprint";
import {
  A9A_EARLY_WORKS_ID,
  A9A_FEED_ASSIGNMENT_ID,
  A9A_STRUCTURAL_PACKAGE_ID,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  incompleteFeedEvidence,
  mixedLifecycleAssignments,
  processOnlyAnalysisEvidence,
  readyFeedEvidence,
  staleAfterReadyEvidence,
  truncatedFeedEvidence,
} from "./fixture";
import { createMemoryLifecycleStore } from "./memory-store";
import {
  DEFAULT_ENGINEERING_LIFECYCLE_PROFILE,
  DEFAULT_LIFECYCLE_PROFILE_VERSION,
  lifecycleProfileById,
  transitionAllowed,
  unknownProfileRejected,
} from "./profile";
import { mixedScopeView, resolveEffectiveStage } from "./resolve";
import { EngineeringLifecycleService } from "./service";
import { LIFECYCLE_AI_BOUNDARY, LIFECYCLE_STAGES } from "./types";

function commerce(action: "analysis.read" | "analysis.write" | "settings.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

describe("EOS-A9A Lifecycle Intelligence", () => {
  const read = commerce("analysis.read");
  const write = commerce("analysis.write");
  const admin = commerce("settings.write");

  it("reuses the canonical A5 lifecycle taxonomy and keeps concepts distinct", () => {
    expect([...LIFECYCLE_STAGES]).toEqual([
      "CONCEPT",
      "PREFEASIBILITY",
      "FEASIBILITY",
      "FEED",
      "DETAILED_DESIGN",
      "CONSTRUCTION",
      "COMMISSIONING",
      "OPERATIONS",
      "MODIFICATION",
    ]);
    expect(DEFAULT_ENGINEERING_LIFECYCLE_PROFILE.profileId).toBe("EOS-DEFAULT-ENGINEERING");
    expect(DEFAULT_ENGINEERING_LIFECYCLE_PROFILE.profileVersion).toBe("v1");
    expect(LIFECYCLE_AI_BOUNDARY.mayApproveGate).toBe(false);
    expect(LIFECYCLE_AI_BOUNDARY.mayApproveTransition).toBe(false);
    expect(LIFECYCLE_AI_BOUNDARY.mayAdvanceStage).toBe(false);
  });

  it("allows governed non-linear and Modification-loop transitions only", () => {
    const profile = DEFAULT_ENGINEERING_LIFECYCLE_PROFILE;
    expect(transitionAllowed(profile, "FEED", "DETAILED_DESIGN")).toBe(true);
    expect(transitionAllowed(profile, "DETAILED_DESIGN", "FEED")).toBe(true);
    expect(transitionAllowed(profile, "OPERATIONS", "MODIFICATION")).toBe(true);
    expect(transitionAllowed(profile, "MODIFICATION", "OPERATIONS")).toBe(true);
    expect(transitionAllowed(profile, "CONCEPT", "OPERATIONS")).toBe(false);
    expect(unknownProfileRejected("EOS-DEFAULT-ENGINEERING", "v2")).toBe(true);
    expect(lifecycleProfileById("EOS-DEFAULT-ENGINEERING", "v1")?.profileVersion).toBe(DEFAULT_LIFECYCLE_PROFILE_VERSION);
  });

  it("resolves mixed scoped lifecycle without forcing project inheritance", () => {
    const assignments = mixedLifecycleAssignments(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
    const project = resolveEffectiveStage({
      assignments,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    const structural = resolveEffectiveStage({
      assignments,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "SYSTEM",
      scopeId: A9A_STRUCTURAL_PACKAGE_ID,
      parentScopeType: "PROJECT",
      parentScopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    const unknownChild = resolveEffectiveStage({
      assignments,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "ASSET",
      scopeId: "unassigned-asset",
      parentScopeType: "PROJECT",
      parentScopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    const missing = resolveEffectiveStage({
      assignments: [],
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(project).toMatchObject({ stage: "FEED", source: "explicit" });
    expect(structural).toMatchObject({ stage: "DETAILED_DESIGN", source: "explicit" });
    expect(unknownChild).toMatchObject({ stage: "FEED", source: "parent" });
    expect(missing).toMatchObject({ stage: "UNKNOWN", source: "UNKNOWN" });
    const mixed = mixedScopeView(assignments);
    expect(mixed.find((row) => row.scopeId === A9A_EARLY_WORKS_ID)?.stage).toBe("CONSTRUCTION");
  });

  it("evaluates an incomplete FEED EXIT gate as NOT_READY without changing stage", () => {
    const evaluation = evaluateLifecycleGate({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      assignmentId: A9A_FEED_ASSIGNMENT_ID,
      profile: DEFAULT_ENGINEERING_LIFECYCLE_PROFILE,
      gateId: "FEED_EXIT",
      evidence: incompleteFeedEvidence(),
    });
    expect(evaluation.completeness).toBe("COMPLETE");
    expect(evaluation.readiness).toBe("NOT_READY");
    expect(evaluation.criteria.some((row) => row.criterionId === "A9A-IFC-001" && row.status === "NOT_SATISFIED")).toBe(true);
    expect(evaluation.criteria.find((row) => row.criterionId === "A9A-IFC-001")?.explanation).toMatch(/OPERATING_LOAD/);
    expect(evaluation.criteria.find((row) => row.criterionId === "A9A-ASR-002")?.status).toBe("NOT_SATISFIED");
    expect(canAuthorizeTransition({ evaluation, profileVersion: "v1", decision: null }).ok).toBe(false);
  });

  it("marks READY_FOR_REVIEW only when complete required criteria are satisfied and stage remains FEED", async () => {
    const service = EngineeringLifecycleService.memoryForTests();
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const evaluation = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
      evidence: readyFeedEvidence(),
      evidenceMode: "TEST_FIXTURE",
    });
    expect(evaluation.completeness).toBe("COMPLETE");
    expect(evaluation.readiness).toBe("READY_FOR_REVIEW");
    expect(evaluation.criteria.find((row) => row.criterionId === "A9A-OPT-001")?.applicability).toBe("NOT_APPLICABLE");
    expect(evaluation.criteria.find((row) => row.criterionId === "A9A-CHG-001")?.status).toBe("SATISFIED");
    const current = await service.effective(read, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(current.stage).toBe("FEED");
  });

  it("blocks READY_FOR_REVIEW and transition on PARTIAL evaluation", () => {
    const evaluation = evaluateLifecycleGate({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      assignmentId: A9A_FEED_ASSIGNMENT_ID,
      profile: DEFAULT_ENGINEERING_LIFECYCLE_PROFILE,
      gateId: "FEED_EXIT",
      evidence: truncatedFeedEvidence(),
    });
    expect(evaluation.completeness).toBe("PARTIAL");
    expect(evaluation.readiness).toBe("PARTIAL");
    expect(evaluation.readiness).not.toBe("READY_FOR_REVIEW");
    expect(canAuthorizeTransition({
        evaluation,
        profileVersion: "v1",
        decision: { decision: "APPROVED_TO_TRANSITION", evaluationId: evaluation.id },
      })).toEqual({ ok: false, reason: "gate_not_ready" });
  });

  it("human-authorizes FEED → DETAILED_DESIGN and retains profile version plus evidence snapshot", async () => {
    const service = EngineeringLifecycleService.memoryForTests();
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const evaluation = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
      evidence: readyFeedEvidence(),
      evidenceMode: "TEST_FIXTURE",
    });
    const decided = await service.recordGateDecision(admin, CRUSHER_FEED_TENANT, {
      evaluationId: evaluation.id,
      decision: "APPROVED_TO_TRANSITION",
      rationale: "FEED exit evidence is complete for human review.",
      actorId: "eng-admin",
    });
    expect(decided.aiApproved).toBe(false);
    expect(decided.findingCreated).toBe(false);
    const moved = await service.transition(admin, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      toStage: "DETAILED_DESIGN",
      evaluationId: evaluation.id,
      actorId: "eng-admin",
      rationale: "Authorized FEED exit.",
    });
    expect(moved.assignment.stage).toBe("DETAILED_DESIGN");
    expect(moved.transition.profileVersion).toBe("v1");
    expect(moved.transition.snapshot.fromStage).toBe("FEED");
    expect(moved.aiApproved).toBe(false);
    expect(moved.thread).toMatch(/lifecycle_profile:EOS-DEFAULT-ENGINEERING:v1/);
    expect(moved.thread).toMatch(/lifecycle_stage:DETAILED_DESIGN/);
    const history = await service.history(read, CRUSHER_FEED_TENANT, assignment.id);
    expect(history).toHaveLength(1);
  });

  it("marks a ready gate STALE when required analysis evidence changes before transition", async () => {
    const ready = evaluateLifecycleGate({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      assignmentId: A9A_FEED_ASSIGNMENT_ID,
      profile: DEFAULT_ENGINEERING_LIFECYCLE_PROFILE,
      gateId: "FEED_EXIT",
      evidence: readyFeedEvidence(),
    });
    const stale = markEvaluationStale(ready, fingerprintLifecycleEvidence(staleAfterReadyEvidence()));
    expect(stale.stale).toBe(true);
    expect(stale.readiness).toBe("STALE");
    expect(canAuthorizeTransition({
        evaluation: stale,
        profileVersion: "v1",
        decision: { decision: "APPROVED_TO_TRANSITION", evaluationId: ready.id },
      })).toEqual({ ok: false, reason: "stale_gate_evaluation" });
  });

  it("records authorized back-transition DETAILED_DESIGN → FEED without treating it as corruption", async () => {
    const service = EngineeringLifecycleService.memoryForTests();
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "DETAILED_DESIGN",
      actorId: "engineer-a1",
    });
    const evaluation = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "DD_RETURN_FEED",
      evidence: readyFeedEvidence(),
      evidenceMode: "TEST_FIXTURE",
    });
    await service.recordGateDecision(admin, CRUSHER_FEED_TENANT, {
      evaluationId: evaluation.id,
      decision: "APPROVED_TO_TRANSITION",
      rationale: "Redesign authorized; return to FEED.",
      actorId: "eng-admin",
    });
    const moved = await service.transition(admin, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      toStage: "FEED",
      evaluationId: evaluation.id,
      actorId: "eng-admin",
      rationale: "Authorized return to FEED.",
    });
    expect(moved.assignment.stage).toBe("FEED");
    expect(moved.transition.fromStage).toBe("DETAILED_DESIGN");
  });

  it("supports Operations → Modification as a governed loop", async () => {
    const service = EngineeringLifecycleService.memoryForTests();
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "OPERATIONS",
      actorId: "engineer-a1",
    });
    const evaluation = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "OPS_TO_MOD",
      evidence: readyFeedEvidence(),
      evidenceMode: "TEST_FIXTURE",
    });
    await service.recordGateDecision(admin, CRUSHER_FEED_TENANT, {
      evaluationId: evaluation.id,
      decision: "APPROVED_TO_TRANSITION",
      rationale: "Plant modification campaign authorized.",
      actorId: "eng-admin",
    });
    const moved = await service.transition(admin, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      toStage: "MODIFICATION",
      evaluationId: evaluation.id,
      actorId: "eng-admin",
      rationale: "Enter modification.",
    });
    expect(moved.assignment.stage).toBe("MODIFICATION");
    expect(transitionAllowed(DEFAULT_ENGINEERING_LIFECYCLE_PROFILE, "MODIFICATION", "OPERATIONS")).toBe(true);
  });

  it("does not treat SPACE GASS unavailability as a blocker for unrelated scopes", () => {
    const evaluation = evaluateLifecycleGate({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      assignmentId: A9A_FEED_ASSIGNMENT_ID,
      profile: DEFAULT_ENGINEERING_LIFECYCLE_PROFILE,
      gateId: "FEED_EXIT",
      evidence: processOnlyAnalysisEvidence(),
    });
    expect(evaluation.criteria.find((row) => row.criterionId === "A9A-ANL-001")?.status).toBe("NOT_APPLICABLE");
  });

  it("records APPROVED_WITH_CONDITIONS without resolving Assurance Conditions or creating Findings", async () => {
    const service = EngineeringLifecycleService.memoryForTests();
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const evaluation = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
      evidence: readyFeedEvidence(),
      evidenceMode: "TEST_FIXTURE",
    });
    const decided = await service.recordGateDecision(admin, CRUSHER_FEED_TENANT, {
      evaluationId: evaluation.id,
      decision: "APPROVED_WITH_CONDITIONS",
      rationale: "Proceed with open informational conditions accepted by the authorized human.",
      actorId: "eng-admin",
      outstandingConditionIds: ["ac-informational"],
    });
    expect(decided.decision.outstandingConditionIds).toEqual(["ac-informational"]);
    expect(decided.assuranceResolved).toBe(false);
    expect(decided.findingCreated).toBe(false);
    expect(decided.issueCreated).toBe(false);
    expect(decided.complianceDeclared).toBe(false);
  });

  it("denies ordinary engineers from configuring profiles or authorizing transitions", async () => {
    const service = EngineeringLifecycleService.memoryForTests();
    await expect(
      service.updateProfileSetting(write, CRUSHER_FEED_TENANT, {
        profileId: "EOS-DEFAULT-ENGINEERING",
        profileVersion: "v1",
        actorId: "engineer-a1",
      }),
    ).rejects.toThrow();
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    await expect(
      service.transition(write, CRUSHER_FEED_TENANT, {
        assignmentId: assignment.id,
        toStage: "DETAILED_DESIGN",
        actorId: "engineer-a1",
        rationale: "AI or unauthorized skip",
      }),
    ).rejects.toThrow();
  });

  it("rejects unknown profile versions and concurrent double transition", async () => {
    const store = createMemoryLifecycleStore();
    const service = new EngineeringLifecycleService({ from() { return {}; } } as never, store);
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "CONCEPT",
      actorId: "engineer-a1",
    });
    const first = await store.updateAssignmentStage(assignment.id, "CONCEPT", 1, "PREFEASIBILITY");
    const second = await store.updateAssignmentStage(assignment.id, "CONCEPT", 1, "PREFEASIBILITY");
    expect(first?.stage).toBe("PREFEASIBILITY");
    expect(second).toBeNull();
    expect(unknownProfileRejected("made-up", "v1")).toBe(true);
  });

  it("measures a representative FEED gate evaluation", () => {
    const started = Date.now();
    const evaluation = evaluateLifecycleGate({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      assignmentId: A9A_FEED_ASSIGNMENT_ID,
      profile: DEFAULT_ENGINEERING_LIFECYCLE_PROFILE,
      gateId: "FEED_EXIT",
      evidence: readyFeedEvidence(),
    });
    const durationMs = Date.now() - started;
    expect(evaluation.criteria.length).toBeGreaterThan(8);
    expect(evaluation.completeness).toBe("COMPLETE");
    expect(durationMs).toBeLessThan(1000);
    expect(composeLifecycleThread({
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      profileId: evaluation.profileId,
      profileVersion: evaluation.profileVersion,
      gateId: evaluation.gateId,
      evaluationId: evaluation.id,
      toStage: "DETAILED_DESIGN",
    })).toContain("lifecycle_gate:FEED_EXIT");
  });
});
