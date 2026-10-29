import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY as R6_CURRENTNESS_READY,
  D1N_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  createD1nR6Store,
  recordAlternativeBranch,
  type D1nR6Input,
} from "./alternative-branch";
import {
  ADMIN_CAN_FORCE_CURRENT_STATE_BY_ROLE_ALONE,
  ADMIN_CAN_REMOVE_REASSESSMENT_REQUIREMENT_BY_ROLE_ALONE,
  ADMIN_CAN_REWRITE_CURRENTNESS_HISTORY,
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_D1N_DEPENDENCY,
  AI_CAN_REAPPROVE_TRANSITION,
  AI_CAN_RECERTIFY,
  AI_CAN_REVALIDATE_ENGINEERING_DURING_REASSESSMENT,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_DIGITAL_THREAD_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY,
  D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY,
  D1K_LIMITATIONS_PRESERVED,
  D1L_TRACK_COMPLETE,
  D1L_TRACK_STATUS,
  D1M_REOPENED,
  D1M_TRACK_COMPLETE,
  D1N_ALTERNATIVE_BRANCH_RUNTIME_READY,
  D1N_ARCHITECTURE_DEFINED,
  D1N_ARCHITECTURE_READY,
  D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
  D1N_CERTIFICATION_RUNTIME_COUNT,
  D1N_CONFORMANCE_RUNTIME_COUNT,
  D1N_CURRENTNESS_HISTORY_PRESERVED,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY,
  D1N_CURRENTNESS_STATES,
  D1N_D1K_RUNTIME_INTEGRATION_COUNT,
  D1N_D1L_RUNTIME_INTEGRATION_COUNT,
  D1N_D1M_CURRENTNESS_STATES_REUSED,
  D1N_D1M_RUNTIME_INTEGRATION_COUNT,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_DUPLICATE_REASSESSMENT_GOVERNED,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_EXPLICIT_DEPENDENCY_CURRENTNESS_PROPAGATION_IMPLEMENTED,
  D1N_HANDOFF_INTEGRATION_RUNTIME_READY,
  D1N_HISTORICAL_REFERENCE_MUTATION_ALLOWED,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_R7_C10_DEBT,
  D1N_R7_CLOSEOUT_PATH,
  D1N_R7_D1F_DEBT,
  D1N_R7_D1G_BLOCKER_PRESERVED,
  D1N_R7_D1G_DEBT,
  D1N_R7_D1H_DEBT,
  D1N_R7_D1I_DEBT,
  D1N_R7_D1J_DEBT,
  D1N_R7_D1K_DEBT,
  D1N_R7_D1L_DEBT,
  D1N_R7_DATABASE_SCHEMA_CHANGED,
  D1N_R7_DEBT_PRESERVED,
  D1N_R7_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R7_MACHINE_READABLE_ROADMAP_UPDATED,
  D1N_R7_MATURITY_STATE,
  D1N_R7_NEW_DEPENDENCY_ADDED,
  D1N_R7_PARENT_ARCHITECTURE_PATH,
  D1N_R7_POST_D1J_DEBT_LEDGER,
  D1N_R7_R1_CLOSEOUT_PATH,
  D1N_R7_R2_CLOSEOUT_PATH,
  D1N_R7_R3_CLOSEOUT_PATH,
  D1N_R7_R4_CLOSEOUT_PATH,
  D1N_R7_R5_CLOSEOUT_PATH,
  D1N_R7_R6_CLOSEOUT_PATH,
  D1N_R7_READY_FOR_NEXT_PHASE,
  D1N_R7_SCOPE,
  D1N_R7_STATUS,
  D1N_R7_STRUCTURAL_PACK_COMPLETE,
  D1N_R8_CANONICAL_PHASE,
  D1N_R8_CANONICAL_SCOPE,
  D1N_R8_PHASE_TYPE,
  D1N_REASSESSMENT_AUTHORITY_EQUALS_ENGINEERING_AUTHORITY,
  D1N_REASSESSMENT_AUTHORITY_EQUALS_HUMAN_DECISION_AUTHORITY,
  D1N_REASSESSMENT_EQUALS_CERTIFICATION,
  D1N_REASSESSMENT_EQUALS_CONFORMANCE_RECHECK,
  D1N_REASSESSMENT_EQUALS_ENGINEERING_APPROVAL,
  D1N_REASSESSMENT_EQUALS_ENGINEERING_REVALIDATION,
  D1N_REASSESSMENT_FINGERPRINT_IMPLEMENTED,
  D1N_REASSESSMENT_HISTORY_PRESERVED,
  D1N_REASSESSMENT_PROVENANCE_PRESERVED,
  D1N_REASSESSMENT_PROVENANCE_REQUIRED,
  D1N_REASSESSMENT_REPLAY_GOVERNED,
  D1N_REASSESSMENT_REQUIRED_RUNTIME_IMPLEMENTED,
  D1N_REASSESSMENT_RUNTIME_COUNT,
  D1N_REASSESSMENT_RUNTIME_IMPLEMENTED,
  D1N_REASSESSMENT_SPOOFING_PROTECTION_IMPLEMENTED,
  D1N_RECORD_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE,
  D1N_RECORD_AUTO_REPOINTED_TO_NEWER_DEPENDENCY,
  D1N_RUNTIME_COUNT,
  D1N_RUNTIME_STARTED,
  D1N_SOLVER_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  FINGERPRINT_VERIFIED_EQUALS_CURRENT,
  FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED,
  FINGERPRINT_VERIFIED_EQUALS_REASSESSMENT_COMPLETE,
  INFERRED_DEPENDENCY_PROPAGATION_ALLOWED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  R7_AUTOMATIC_BRANCH_RESELECTION_RUNTIME_COUNT,
  R7_AUTOMATICALLY_APPROVES_TRANSITION_REQUEST,
  R7_AUTOMATICALLY_REAPPROVES_HUMAN_DECISION,
  R7_AUTOMATICALLY_REJECTS_TRANSITION_REQUEST,
  R7_MUTATES_PRIOR_HUMAN_DECISION,
  R7_SILENTLY_REWRITES_R3_PREREQUISITE_STATUS,
  REASSESSMENT_REQUIRED_EQUALS_CERTIFICATION_REVOKED,
  REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID,
  REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_REVALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_TRANSITION_REVOKED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_CURRENTNESS_STATE_MUTATION_ALLOWED,
  STALE_EQUALS_CERTIFICATION_REVOKED,
  STALE_EQUALS_ENGINEERING_INCORRECT,
  STALE_EQUALS_ENGINEERING_INVALID,
  SUPERSEDED_EQUALS_DELETED,
  SUPERSEDED_HISTORY_REMOVED,
  TENANT_WORKSPACE_PROJECT_CURRENTNESS_SCOPE_ENFORCED,
  changeDesignProgression,
  createD1nR7Store,
  executeStageTransition,
  inferDependency,
  mutateCurrentness,
  reapproveTransition,
  recertify,
  recordCurrentness,
  recordReassessment,
  reconstructReassessment,
  repointD1nRecord,
  reselectBranch,
  revalidateEngineering,
  rewriteCurrentnessHistory,
  type D1nR7Input,
  type D1nR7Sources,
} from "./currentness-reassessment";
import { createD1nR2Store, recordDesignProgression, type D1nR2Record } from "./design-progression-context";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { createD1nR5Store, recordHumanDecision, type D1nR5Input } from "./human-decision-record";
import { createD1nR1Store, recordOrchestrationContext, type D1nR1Actor, type D1nR1Record } from "./orchestration-context";
import { createD1nR3Store, recordPrerequisiteAssessment, type D1nR3Input } from "./prerequisite-assessment";
import { createD1nR4Store, recordTransitionRequest, type D1nR4Input } from "./stage-transition-request";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..", "..");
const debt = "DOES_NOT_BLOCK_D1N_BUT_REMAINS_LIMITATION";
const requester: D1nR1Actor = {
  actorId: "orchestrator-1",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "ORCHESTRATION_CONTEXT_AUTHORITY",
};
const decider: D1nR1Actor = { ...requester, actorId: "gate-1", authority: "LIFECYCLE_GATE_DECISION" };

function prepared() {
  const orchestration = createD1nR1Store([
    { id: "member-1", kind: "MEMBER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" },
    { id: "member-b", kind: "MEMBER", tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" },
  ]);
  const context = recordOrchestrationContext(orchestration, requester, {
    contextId: "ctx-1",
    structuralIdentityId: "member-1",
    citedLifecycleStage: "CONCEPT",
    provenanceRef: "prov-ctx",
  });
  const progressionStore = createD1nR2Store();
  const progression = recordDesignProgression(orchestration, progressionStore, requester, {
    progressionId: "prog-1",
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    designProgressionState: "CONCEPT",
    provenanceRef: "prov-prog",
  });
  const other: D1nR1Actor = { ...requester, tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" };
  const foreignContext = recordOrchestrationContext(orchestration, other, {
    contextId: "ctx-b",
    structuralIdentityId: "member-b",
    citedLifecycleStage: "FEED",
    provenanceRef: "prov-b",
  });
  const assessments = createD1nR3Store();
  const requirement = recordPrerequisiteAssessment(orchestration, progressionStore, assessments, requester, assessmentInput(context, progression));
  const requests = createD1nR4Store();
  const request = recordTransitionRequest(orchestration, progressionStore, assessments, requests, requester, requestInput(context, progression, requirement));
  const decisions = createD1nR5Store();
  const decision = recordHumanDecision(requests, decisions, decider, decisionInput(request));
  const branches = createD1nR6Store();
  const branch = recordAlternativeBranch(orchestration, progressionStore, assessments, decisions, branches, requester, branchInput(context, progression));
  const sources: D1nR7Sources = { orchestration, progression: progressionStore, assessments, requests, decisions, branches };
  return { sources, context, progression, requirement, request, decision, branch, other, foreignContext, currentness: createD1nR7Store() };
}

function assessmentInput(context: D1nR1Record, progression: D1nR2Record, overrides: Partial<D1nR3Input> = {}): D1nR3Input {
  return {
    assessmentId: "assess-req",
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    progressionId: progression.progressionId,
    progressionFingerprint: progression.fingerprint,
    prerequisiteId: "req-1",
    inputCategory: "REQUIREMENTS",
    assessmentStatus: "PRESENT",
    evidenceRef: "evidence-1",
    citedCurrentness: "CURRENT",
    provenanceRef: "prov-assess",
    ...overrides,
  };
}
function requestInput(context: D1nR1Record, progression: D1nR2Record, assessment: { assessmentId: string; fingerprint: string }, overrides: Partial<D1nR4Input> = {}): D1nR4Input {
  return {
    requestId: "request-1",
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    progressionId: progression.progressionId,
    progressionFingerprint: progression.fingerprint,
    destinationStage: "PREFEASIBILITY",
    prerequisiteReferences: [{ assessmentId: assessment.assessmentId, fingerprint: assessment.fingerprint }],
    provenanceRef: "prov-request",
    ...overrides,
  };
}
function decisionInput(request: { requestId: string; fingerprint: string }, overrides: Partial<D1nR5Input> = {}): D1nR5Input {
  return {
    decisionId: "decision-1",
    requestId: request.requestId,
    requestFingerprint: request.fingerprint,
    gateId: "MAJOR_SYSTEM_SELECTION",
    outcome: "APPROVED_TO_TRANSITION",
    rationale: "Human gate cited this request.",
    provenanceRef: "prov-decision",
    aal: "aal2",
    ...overrides,
  };
}
function branchInput(context: D1nR1Record, progression: D1nR2Record, overrides: Partial<D1nR6Input> = {}): D1nR6Input {
  return {
    branchId: "branch-portal",
    displayLabel: "Portal frame",
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    progressionId: progression.progressionId,
    progressionFingerprint: progression.fingerprint,
    provenanceRef: "prov-branch",
    ...overrides,
  };
}
function currentInput(base: ReturnType<typeof prepared>, overrides: Partial<D1nR7Input> = {}): D1nR7Input {
  return {
    reassessmentId: "current-1",
    affectedKind: "R2_PROGRESSION",
    affectedId: base.progression.progressionId,
    affectedFingerprint: base.progression.fingerprint,
    dependencies: [{ kind: "R3_ASSESSMENT", id: base.requirement.assessmentId, fingerprint: base.requirement.fingerprint }],
    provenanceRef: "prov-current",
    ...overrides,
  };
}

describe("EOS-D1N-R7 currentness", () => {
  it("reuses canonical currentness and propagates only explicit dependencies", () => {
    expect(D1N_D1M_CURRENTNESS_STATES_REUSED).toBe(true);
    expect([...D1N_CURRENTNESS_STATES]).toEqual(["CURRENT", "STALE", "REASSESSMENT_REQUIRED", "SUPERSEDED"]);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D1N_EXPLICIT_DEPENDENCY_CURRENTNESS_PROPAGATION_IMPLEMENTED).toBe(true);
    expect(INFERRED_DEPENDENCY_PROPAGATION_ALLOWED).toBe(false);
    const base = prepared();
    const before = JSON.stringify(base.sources.progression.records);
    const current = recordCurrentness(base.sources, base.currentness, requester, currentInput(base));
    expect(current.currentnessState).toBe("CURRENT");
    expect(current.reassessmentRequired).toBe(false);
    expect(current.affectedId).toBe(base.progression.progressionId);
    expect(current.affectedFingerprint).toBe(base.progression.fingerprint);
    expect(current.dependencies[0]?.fingerprint).toBe(base.requirement.fingerprint);
    expect(current.engineeringValidated).toBe(false);
    expect(current.progressionChanged).toBe(false);
    expect(JSON.stringify(base.sources.progression.records)).toBe(before);
    expect(base.progression.designProgressionState).toBe("CONCEPT");
    expect(() => recordCurrentness(base.sources, base.currentness, requester, currentInput(base, { reassessmentId: "current-infer", inferDependency: true }))).toThrow("INFERRED_DEPENDENCY_REJECTED");
    expect(() => inferDependency()).toThrow("INFERRED_DEPENDENCY_REJECTED");
    expect(() => recordCurrentness(base.sources, createD1nR7Store(), requester, currentInput(base, {
      dependencies: [{ kind: "R3_ASSESSMENT", id: "missing-assessment", fingerprint: base.requirement.fingerprint }],
    }))).toThrow("DEPENDENCY_MISMATCH");
    expect(() => recordCurrentness(base.sources, createD1nR7Store(), requester, currentInput(base, {
      dependencies: [{ kind: "D1M_HANDOFF", id: base.requirement.assessmentId, fingerprint: base.requirement.fingerprint }],
    }))).toThrow("DEPENDENCY_KIND_INVALID");
  });

  it("marks stale or reassessment-required without rewriting upstream records", () => {
    expect(STALE_EQUALS_ENGINEERING_INCORRECT).toBe(false);
    expect(STALE_EQUALS_ENGINEERING_INVALID).toBe(false);
    expect(STALE_EQUALS_CERTIFICATION_REVOKED).toBe(false);
    expect(R7_SILENTLY_REWRITES_R3_PREREQUISITE_STATUS).toBe(false);
    expect(AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT).toBe(0);
    expect(R7_AUTOMATICALLY_APPROVES_TRANSITION_REQUEST).toBe(false);
    expect(R7_AUTOMATICALLY_REJECTS_TRANSITION_REQUEST).toBe(false);
    expect(R7_MUTATES_PRIOR_HUMAN_DECISION).toBe(false);
    expect(R7_AUTOMATICALLY_REAPPROVES_HUMAN_DECISION).toBe(false);
    expect(R7_AUTOMATIC_BRANCH_RESELECTION_RUNTIME_COUNT).toBe(0);
    expect(D1N_RECORD_AUTO_REPOINTED_TO_NEWER_DEPENDENCY).toBe(false);
    expect(D1N_RECORD_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE).toBe(false);
    expect(D1N_HISTORICAL_REFERENCE_MUTATION_ALLOWED).toBe(false);
    const staleBase = prepared();
    const baseline = recordCurrentness(staleBase.sources, staleBase.currentness, requester, currentInput(staleBase));
    const staleAssessment = recordPrerequisiteAssessment(staleBase.sources.orchestration, staleBase.sources.progression, staleBase.sources.assessments, requester, assessmentInput(staleBase.context, staleBase.progression, {
      assessmentId: "assess-stale",
      assessmentStatus: "STALE",
      evidenceRef: "evidence-stale",
      citedCurrentness: "STALE",
      gapId: "gap-stale",
      provenanceRef: "prov-stale",
      predecessorAssessmentId: staleBase.requirement.assessmentId,
    }));
    const stale = recordReassessment(staleBase.sources, staleBase.currentness, requester, currentInput(staleBase, {
      reassessmentId: "reassess-stale",
      triggerCategory: "DEPENDENCY_STALE",
      triggeringDependencyId: staleBase.requirement.assessmentId,
      observedFingerprint: staleAssessment.fingerprint,
      predecessorReassessmentId: baseline.reassessmentId,
    }));
    expect(stale.currentnessState).toBe("STALE");
    expect(stale.reassessmentRequired).toBe(true);
    expect(stale.triggeringDependencyId).toBe(staleBase.requirement.assessmentId);
    expect(stale.triggeringDependencyFingerprint).toBe(staleBase.requirement.fingerprint);
    expect(stale.dependencies[0]?.fingerprint).toBe(staleBase.requirement.fingerprint);
    expect(stale.engineeringIncorrect).toBe(false);
    expect(stale.engineeringInvalid).toBe(false);
    expect(stale.certificationRevoked).toBe(false);
    expect(staleBase.requirement.assessmentStatus).toBe("PRESENT");
    expect(staleBase.requirement.evidenceRef).toBe("evidence-1");
    expect(reconstructReassessment(staleBase.currentness, baseline.reassessmentId).dependencies[0]?.fingerprint).toBe(staleBase.requirement.fingerprint);
    const progressionBase = prepared();
    const progressionBaseline = recordCurrentness(progressionBase.sources, progressionBase.currentness, requester, currentInput(progressionBase, {
      affectedKind: "R1_ORCHESTRATION",
      affectedId: progressionBase.context.contextId,
      affectedFingerprint: progressionBase.context.fingerprint,
      dependencies: [{ kind: "R2_PROGRESSION", id: progressionBase.progression.progressionId, fingerprint: progressionBase.progression.fingerprint }],
    }));
    const laterProgression = recordDesignProgression(progressionBase.sources.orchestration, progressionBase.sources.progression, requester, {
      progressionId: "prog-2",
      orchestrationContextId: progressionBase.context.contextId,
      orchestrationContextFingerprint: progressionBase.context.fingerprint,
      designProgressionState: "PREFEASIBILITY",
      provenanceRef: "prov-prog-2",
      predecessorProgressionId: progressionBase.progression.progressionId,
    });
    const beforeProgression = JSON.stringify(progressionBase.sources.progression.records);
    const reassessedProgression = recordReassessment(progressionBase.sources, progressionBase.currentness, requester, currentInput(progressionBase, {
      reassessmentId: "reassess-progression",
      affectedKind: "R1_ORCHESTRATION",
      affectedId: progressionBase.context.contextId,
      affectedFingerprint: progressionBase.context.fingerprint,
      dependencies: [{ kind: "R2_PROGRESSION", id: progressionBase.progression.progressionId, fingerprint: progressionBase.progression.fingerprint }],
      triggerCategory: "DEPENDENCY_SUPERSEDED",
      triggeringDependencyId: progressionBase.progression.progressionId,
      observedFingerprint: laterProgression.fingerprint,
      predecessorReassessmentId: progressionBaseline.reassessmentId,
    }));
    expect(reassessedProgression.currentnessState).toBe("REASSESSMENT_REQUIRED");
    expect(reassessedProgression.progressionChanged).toBe(false);
    expect(progressionBase.progression.designProgressionState).toBe("CONCEPT");
    expect(JSON.stringify(progressionBase.sources.progression.records)).toBe(beforeProgression);
    expect(() => changeDesignProgression()).toThrow("PROGRESSION_MUTATION_NOT_IN_R7");
    const requestBase = prepared();
    const requestBaseline = recordCurrentness(requestBase.sources, requestBase.currentness, requester, currentInput(requestBase, {
      affectedKind: "R4_TRANSITION_REQUEST",
      affectedId: requestBase.request.requestId,
      affectedFingerprint: requestBase.request.fingerprint,
    }));
    const replacement = recordPrerequisiteAssessment(requestBase.sources.orchestration, requestBase.sources.progression, requestBase.sources.assessments, requester, assessmentInput(requestBase.context, requestBase.progression, {
      assessmentId: "assess-next",
      evidenceRef: "evidence-2",
      provenanceRef: "prov-next",
      predecessorAssessmentId: requestBase.requirement.assessmentId,
    }));
    recordReassessment(requestBase.sources, requestBase.currentness, requester, currentInput(requestBase, {
      reassessmentId: "reassess-request",
      affectedKind: "R4_TRANSITION_REQUEST",
      affectedId: requestBase.request.requestId,
      affectedFingerprint: requestBase.request.fingerprint,
      triggerCategory: "DEPENDENCY_SUPERSEDED",
      triggeringDependencyId: requestBase.requirement.assessmentId,
      observedFingerprint: replacement.fingerprint,
      predecessorReassessmentId: requestBaseline.reassessmentId,
    }));
    expect(requestBase.request.lifecycleState).toBe("OPEN");
    expect(requestBase.request.prerequisiteReferences[0]?.fingerprint).toBe(requestBase.requirement.fingerprint);
    expect(() => recordReassessment(requestBase.sources, requestBase.currentness, requester, currentInput(requestBase, { reassessmentId: "reassess-approve", approveRequest: true }))).toThrow("TRANSITION_APPROVAL_NOT_IN_R7");
    expect(() => recordReassessment(requestBase.sources, requestBase.currentness, requester, currentInput(requestBase, { reassessmentId: "reassess-reject", rejectRequest: true }))).toThrow("TRANSITION_REJECTION_NOT_IN_R7");
    const decisionBase = prepared();
    const decisionBaseline = recordCurrentness(decisionBase.sources, decisionBase.currentness, requester, currentInput(decisionBase, {
      affectedKind: "R6_ALTERNATIVE_BRANCH",
      affectedId: decisionBase.branch.branchId,
      affectedFingerprint: decisionBase.branch.fingerprint,
      dependencies: [{ kind: "R5_HUMAN_DECISION", id: decisionBase.decision.decisionId, fingerprint: decisionBase.decision.fingerprint }],
    }));
    const laterDecision = recordHumanDecision(decisionBase.sources.requests, decisionBase.sources.decisions, decider, decisionInput(decisionBase.request, {
      decisionId: "decision-2",
      outcome: "NOT_APPROVED",
      rationale: "A later commercial note.",
      provenanceRef: "prov-decision-2",
      predecessorDecisionId: decisionBase.decision.decisionId,
    }));
    recordReassessment(decisionBase.sources, decisionBase.currentness, requester, currentInput(decisionBase, {
      reassessmentId: "reassess-decision",
      affectedKind: "R6_ALTERNATIVE_BRANCH",
      affectedId: decisionBase.branch.branchId,
      affectedFingerprint: decisionBase.branch.fingerprint,
      dependencies: [{ kind: "R5_HUMAN_DECISION", id: decisionBase.decision.decisionId, fingerprint: decisionBase.decision.fingerprint }],
      triggerCategory: "DEPENDENCY_SUPERSEDED",
      triggeringDependencyId: decisionBase.decision.decisionId,
      observedFingerprint: laterDecision.fingerprint,
      predecessorReassessmentId: decisionBaseline.reassessmentId,
    }));
    expect(decisionBase.decision.outcome).toBe("APPROVED_TO_TRANSITION");
    expect(decisionBase.decision.fingerprint).toBe(decisionBaseline.dependencies[0]?.fingerprint);
    expect(decisionBase.decision.humanTransitionApprovalRecorded).toBe(true);
    expect(() => reapproveTransition()).toThrow("TRANSITION_REAPPROVAL_NOT_IN_R7");
    const branchBase = prepared();
    const branchBaseline = recordCurrentness(branchBase.sources, branchBase.currentness, requester, currentInput(branchBase, {
      affectedKind: "R6_ALTERNATIVE_BRANCH",
      affectedId: branchBase.branch.branchId,
      affectedFingerprint: branchBase.branch.fingerprint,
    }));
    const laterEvidence = recordPrerequisiteAssessment(branchBase.sources.orchestration, branchBase.sources.progression, branchBase.sources.assessments, requester, assessmentInput(branchBase.context, branchBase.progression, {
      assessmentId: "assess-evidence-2",
      evidenceRef: "evidence-3",
      provenanceRef: "prov-evidence-2",
      predecessorAssessmentId: branchBase.requirement.assessmentId,
    }));
    recordReassessment(branchBase.sources, branchBase.currentness, requester, currentInput(branchBase, {
      reassessmentId: "reassess-branch",
      affectedKind: "R6_ALTERNATIVE_BRANCH",
      affectedId: branchBase.branch.branchId,
      affectedFingerprint: branchBase.branch.fingerprint,
      triggerCategory: "DEPENDENCY_SUPERSEDED",
      triggeringDependencyId: branchBase.requirement.assessmentId,
      observedFingerprint: laterEvidence.fingerprint,
      predecessorReassessmentId: branchBaseline.reassessmentId,
    }));
    expect(branchBase.branch.evidenceReferences).toHaveLength(0);
    expect(branchBase.branch.selectedByGovernedDecision).toBe(false);
    expect(() => reselectBranch()).toThrow("BRANCH_RESELECTION_NOT_IN_R7");
    expect(() => repointD1nRecord()).toThrow("AUTO_REPOINT_NOT_IN_R7");
  });

  it("keeps reassessment distinct from engineering authority", () => {
    expect(D1N_REASSESSMENT_REQUIRED_RUNTIME_IMPLEMENTED).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_REVALIDATED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_TRANSITION_REVOKED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_CERTIFICATION_REVOKED).toBe(false);
    expect(D1N_REASSESSMENT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1N_REASSESSMENT_RUNTIME_COUNT).toBe(1);
    expect(D1N_REASSESSMENT_EQUALS_ENGINEERING_REVALIDATION).toBe(false);
    expect(D1N_REASSESSMENT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(D1N_REASSESSMENT_EQUALS_CONFORMANCE_RECHECK).toBe(false);
    expect(D1N_REASSESSMENT_EQUALS_CERTIFICATION).toBe(false);
    expect(D1N_REASSESSMENT_AUTHORITY_EQUALS_HUMAN_DECISION_AUTHORITY).toBe(false);
    expect(D1N_REASSESSMENT_AUTHORITY_EQUALS_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_D1N_DEPENDENCY).toBe(false);
    expect(AI_CAN_REVALIDATE_ENGINEERING_DURING_REASSESSMENT).toBe(false);
    expect(AI_CAN_REAPPROVE_TRANSITION).toBe(false);
    expect(AI_CAN_RECERTIFY).toBe(false);
    expect(AI_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_CAN_FORCE_CURRENT_STATE_BY_ROLE_ALONE).toBe(false);
    expect(ADMIN_CAN_REMOVE_REASSESSMENT_REQUIREMENT_BY_ROLE_ALONE).toBe(false);
    expect(ADMIN_CAN_REWRITE_CURRENTNESS_HISTORY).toBe(false);
    const base = prepared();
    const baseline = recordCurrentness(base.sources, base.currentness, requester, currentInput(base));
    const successor = recordPrerequisiteAssessment(base.sources.orchestration, base.sources.progression, base.sources.assessments, requester, assessmentInput(base.context, base.progression, {
      assessmentId: "assess-review",
      evidenceRef: "evidence-review",
      provenanceRef: "prov-review",
      predecessorAssessmentId: base.requirement.assessmentId,
    }));
    const review = recordReassessment(base.sources, base.currentness, requester, currentInput(base, {
      reassessmentId: "reassess-review",
      triggerCategory: "DEPENDENCY_SUPERSEDED",
      triggeringDependencyId: base.requirement.assessmentId,
      observedFingerprint: successor.fingerprint,
      predecessorReassessmentId: baseline.reassessmentId,
    }));
    expect(review.affectedId).toBe(base.progression.progressionId);
    expect(review.triggeringDependencyId).toBe(base.requirement.assessmentId);
    expect(review.currentnessState).toBe("REASSESSMENT_REQUIRED");
    expect(review.engineeringValidated).toBe(false);
    expect(review.engineeringApproved).toBe(false);
    expect(review.conformant).toBe(false);
    expect(review.certified).toBe(false);
    expect(review.authority).toBe("ORCHESTRATION_CONTEXT_AUTHORITY");
    expect(() => revalidateEngineering()).toThrow("ENGINEERING_REVALIDATION_NOT_IN_R7");
    expect(() => recertify()).toThrow("CERTIFICATION_NOT_IN_R7");
    expect(() => recordReassessment(base.sources, base.currentness, requester, currentInput(base, { reassessmentId: "reassess-valid", revalidate: true }))).toThrow("ENGINEERING_REVALIDATION_NOT_IN_R7");
    expect(() => recordReassessment(base.sources, base.currentness, { ...requester, actorId: "AI_ASSISTANT" }, currentInput(base, { reassessmentId: "reassess-ai" }))).toThrow("AI_NOT_REASSESSMENT_AUTHORITY");
    expect(() => recordReassessment(base.sources, base.currentness, { ...requester, authority: "ADMIN" }, currentInput(base, { reassessmentId: "reassess-admin", forceCurrent: true }))).toThrow("ADMIN_NOT_CURRENTNESS_AUTHORITY");
    expect(() => recordCurrentness(base.sources, createD1nR7Store(), decider, currentInput(base, { reassessmentId: "current-decider" }))).toThrow("REASSESSMENT_AUTHORITY_NOT_HUMAN_DECISION");
    expect(() => recordCurrentness(base.sources, createD1nR7Store(), { ...requester, authority: "ENGINEERING_VALIDATION_AUTHORITY" }, currentInput(base))).toThrow("REASSESSMENT_AUTHORITY_NOT_ENGINEERING");
    expect(() => rewriteCurrentnessHistory()).toThrow("CURRENTNESS_HISTORY_REWRITE_REJECTED");
  });

  it("preserves provenance, fingerprint, history, scope, and the R7 boundary", () => {
    expect(TENANT_WORKSPACE_PROJECT_CURRENTNESS_SCOPE_ENFORCED).toBe(true);
    expect(D1N_REASSESSMENT_PROVENANCE_REQUIRED).toBe(true);
    expect(D1N_REASSESSMENT_PROVENANCE_PRESERVED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1N_REASSESSMENT_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(FINGERPRINT_VERIFIED_EQUALS_CURRENT).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_REASSESSMENT_COMPLETE).toBe(false);
    expect(SILENT_CURRENTNESS_STATE_MUTATION_ALLOWED).toBe(false);
    expect(D1N_CURRENTNESS_HISTORY_PRESERVED).toBe(true);
    expect(D1N_REASSESSMENT_HISTORY_PRESERVED).toBe(true);
    expect(D1N_DUPLICATE_REASSESSMENT_GOVERNED).toBe(true);
    expect(D1N_REASSESSMENT_REPLAY_GOVERNED).toBe(true);
    expect(D1N_REASSESSMENT_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(SUPERSEDED_EQUALS_DELETED).toBe(false);
    expect(SUPERSEDED_HISTORY_REMOVED).toBe(false);
    const base = prepared();
    const input = currentInput(base);
    const first = recordCurrentness(base.sources, base.currentness, requester, input);
    expect(recordCurrentness(base.sources, base.currentness, requester, input)).toBe(first);
    expect(base.currentness.history).toHaveLength(1);
    const again = prepared();
    expect(recordCurrentness(again.sources, again.currentness, requester, currentInput(again)).fingerprint).toBe(first.fingerprint);
    expect(() => recordCurrentness(base.sources, base.currentness, requester, { ...input, provenanceRef: "prov-other" })).toThrow("REASSESSMENT_ALREADY_RECORDED");
    expect(() => recordCurrentness(base.sources, base.currentness, requester, { ...input, reassessmentId: "current-spoof", assertedFingerprint: "spoofed" })).toThrow("FINGERPRINT_MISMATCH");
    expect(() => recordCurrentness(base.sources, base.currentness, requester, { ...input, reassessmentId: "current-tenant", tenantId: "tenant-b" })).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordCurrentness(base.sources, base.currentness, requester, { ...input, reassessmentId: "current-workspace", workspaceId: "workspace-b" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordCurrentness(base.sources, base.currentness, requester, { ...input, reassessmentId: "current-project", projectId: "project-b" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordCurrentness(base.sources, createD1nR7Store(), requester, currentInput(base, {
      affectedKind: "R1_ORCHESTRATION",
      affectedId: base.foreignContext.contextId,
      affectedFingerprint: base.foreignContext.fingerprint,
      dependencies: [{ kind: "R1_ORCHESTRATION", id: base.foreignContext.contextId, fingerprint: base.foreignContext.fingerprint }],
    }))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => mutateCurrentness()).toThrow("CURRENTNESS_MUTATION_REJECTED");
    expect(() => executeStageTransition()).toThrow("STAGE_TRANSITION_EXECUTION_NOT_IN_R7");
    const successor = recordPrerequisiteAssessment(base.sources.orchestration, base.sources.progression, base.sources.assessments, requester, assessmentInput(base.context, base.progression, {
      assessmentId: "assess-history",
      evidenceRef: "evidence-history",
      provenanceRef: "prov-history",
      predecessorAssessmentId: base.requirement.assessmentId,
    }));
    const later = recordReassessment(base.sources, base.currentness, requester, currentInput(base, {
      reassessmentId: "reassess-history",
      triggerCategory: "DEPENDENCY_SUPERSEDED",
      triggeringDependencyId: base.requirement.assessmentId,
      observedFingerprint: successor.fingerprint,
      predecessorReassessmentId: first.reassessmentId,
    }));
    const historical = reconstructReassessment(base.currentness, first.reassessmentId);
    expect(historical.recordStatus).toBe("SUPERSEDED");
    expect(historical.currentnessState).toBe("CURRENT");
    expect(historical.deleted).toBe(false);
    expect(historical.dependencies[0]?.fingerprint).toBe(base.requirement.fingerprint);
    expect(later.priorCurrentness).toBe("CURRENT");
    expect(later.recordStatus).toBe("CURRENT");
    expect(base.currentness.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === first.fingerprint)).toBe(true);
    expect(() => recordCurrentness(base.sources, base.currentness, requester, currentInput(base, { reassessmentId: "current-duplicate" }))).toThrow("DUPLICATE_REASSESSMENT_REJECTED");
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT).toBe(0);
    expect(D1N_D1M_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D1N_D1K_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D1N_D1L_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D1N_SOLVER_EXECUTION_RUNTIME_COUNT).toBe(0);
    expect(D1N_CONFORMANCE_RUNTIME_COUNT).toBe(0);
    expect(D1N_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT).toBe(0);
    expect(D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT).toBe(0);
    expect(CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(PARALLEL_D1N_DIGITAL_THREAD_CREATED).toBe(false);
    expect(D1M_TRACK_COMPLETE).toBe(true);
    expect(D1M_REOPENED).toBe(false);
    expect(D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY).toBe(false);
    expect(D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY).toBe(false);
    expect(D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1L_TRACK_COMPLETE).toBe(true);
    expect(D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1N_R7_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1N_R7_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1N_R7_DEBT_PRESERVED).toBe(true);
    expect(D1N_R7_POST_D1J_DEBT_LEDGER).toContain("NOT_AVAILABLE");
    expect(D1N_R7_POST_D1J_DEBT_LEDGER).toContain("GA security debt remains.");
    expect(D1N_R7_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1N_R7_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1N_R7_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_R7_C10_DEBT).toBe(debt);
    expect(D1N_R7_D1F_DEBT).toBe(debt);
    expect(D1N_R7_D1G_DEBT).toBe(debt);
    expect(D1N_R7_D1H_DEBT).toBe(debt);
    expect(D1N_R7_D1I_DEBT).toBe(debt);
    expect(D1N_R7_D1J_DEBT).toBe(debt);
    expect(D1N_R7_D1K_DEBT).toBe(debt);
    expect(D1N_R7_D1L_DEBT).toBe(debt);
    expect(D1N_RUNTIME_STARTED).toBe(true);
    expect(D1N_RUNTIME_COUNT).toBe(7);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(R6_CURRENTNESS_READY).toBe(false);
    expect(D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY).toBe(true);
    expect(D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_RUNTIME_READY).toBe(true);
    expect(D1N_PREREQUISITE_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY).toBe(true);
    expect(D1N_HUMAN_GATE_RUNTIME_READY).toBe(true);
    expect(D1N_ALTERNATIVE_BRANCH_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY).toBe(false);
    expect(D1N_HANDOFF_INTEGRATION_RUNTIME_READY).toBe(false);
    expect(D1N_ARCHITECTURE_DEFINED).toBe(true);
    expect(D1N_ARCHITECTURE_READY).toBe(true);
    expect(D1N_R7_STATUS).toBe("CURRENTNESS_AND_REASSESSMENT_IMPLEMENTED");
    expect(D1N_R7_MATURITY_STATE).toBe("STRUCTURAL_CURRENTNESS_STALENESS_AND_REASSESSMENT_IMPLEMENTED");
    expect(D1N_R7_SCOPE).toContain("reassessment");
    expect(D1N_R8_CANONICAL_PHASE).toBe("EOS-D1N-R8-D1M-D1K-D1L-HANDOFF-INTEGRATION");
    expect(D1N_R8_PHASE_TYPE).toBe("D1M_D1K_D1L_HANDOFF_INTEGRATION");
    expect(D1N_R8_CANONICAL_SCOPE).toContain("handoff");
    expect(D1N_R7_READY_FOR_NEXT_PHASE).toBe(true);
    expect(D1N_R7_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    const source = readFileSync(join(here, "currentness-reassessment.ts"), "utf8");
    const doc = readFileSync(join(root, D1N_R7_CLOSEOUT_PATH), "utf8");
    const index = readFileSync(join(here, "index.ts"), "utf8");
    const capability = readFileSync(join(root, "packages/engineering-os/src/structural-concrete/capability.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).toContain("D1M_R7_CURRENTNESS_STATES");
    expect(source).not.toContain("createHash");
    expect(source).not.toContain(["from", '"@rtb/engineering-review"'].join(" "));
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("CREATE TABLE");
    expect(scanAnalysisFormulaBypass("currentness-reassessment.ts", source)).toEqual([]);
    expect(doc).toContain("EOS-D1N-R8-D1M-D1K-D1L-HANDOFF-INTEGRATION");
    expect(doc).not.toContain("```");
    expect(existsSync(join(root, D1N_R7_PARENT_ARCHITECTURE_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R7_R1_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R7_R2_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R7_R3_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R7_R4_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R7_R5_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R7_R6_CLOSEOUT_PATH))).toBe(true);
    expect(index).toContain("recordReassessment");
    expect(index.match(/D1N_R7_CANONICAL_PHASE/g)).toHaveLength(1);
    expect(capability).toContain("D1N.R7.CURRENTNESS_STALENESS_AND_REASSESSMENT");
  });
});
