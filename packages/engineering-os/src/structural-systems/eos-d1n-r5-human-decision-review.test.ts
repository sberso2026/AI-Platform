import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createD1nR2Store, recordDesignProgression, type D1nR2Record } from "./design-progression-context";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  D1N_HUMAN_DECISION_GATE_RUNTIME_COUNT as R4_HUMAN_DECISION_COUNT,
  D1N_HUMAN_GATE_RUNTIME_READY as R4_HUMAN_GATE_READY,
  D1N_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  createD1nR4Store,
  recordTransitionRequest,
  type D1nR4Input,
} from "./stage-transition-request";
import {
  ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE,
  ADMIN_CAN_BYPASS_DECISION_AUTHORITY,
  ADMIN_CAN_REWRITE_HUMAN_DECISION,
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_CAN_APPROVE_STAGE_TRANSITION,
  AI_CAN_CHANGE_DESIGN_PROGRESSION_STATE,
  AI_CAN_CHANGE_HUMAN_DECISION_OUTCOME,
  AI_CAN_IMPERSONATE_HUMAN_DECISION_AUTHORITY,
  AI_CAN_REJECT_STAGE_TRANSITION_AUTHORITATIVELY,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AUTOMATIC_HUMAN_DECISION_RUNTIME_COUNT,
  AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT,
  AUTOMATIC_TRANSITION_APPROVAL_RUNTIME_COUNT,
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
  D1N_ALTERNATIVE_BRANCH_RUNTIME_COUNT,
  D1N_ALTERNATIVE_BRANCH_RUNTIME_READY,
  D1N_ARCHITECTURE_DEFINED,
  D1N_ARCHITECTURE_READY,
  D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
  D1N_CERTIFICATION_RUNTIME_COUNT,
  D1N_CONFORMANCE_RUNTIME_COUNT,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY,
  D1N_D1K_RUNTIME_INTEGRATION_COUNT,
  D1N_D1L_RUNTIME_INTEGRATION_COUNT,
  D1N_D1M_RUNTIME_INTEGRATION_COUNT,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_DUPLICATE_HUMAN_DECISION_GOVERNED,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_HANDOFF_INTEGRATION_RUNTIME_READY,
  D1N_HUMAN_DECISION_AAL2_GUARD_REUSED,
  D1N_HUMAN_DECISION_AUTHORITY,
  D1N_HUMAN_DECISION_AUTHORITY_PRESERVED,
  D1N_HUMAN_DECISION_AUTHORITY_REQUIRED,
  D1N_HUMAN_DECISION_FINGERPRINT_IMPLEMENTED,
  D1N_HUMAN_DECISION_HISTORY_PRESERVED,
  D1N_HUMAN_DECISION_OUTCOMES,
  D1N_HUMAN_DECISION_RATIONALE_PRESERVED,
  D1N_HUMAN_DECISION_REPLAY_GOVERNED,
  D1N_HUMAN_DECISION_RUNTIME_COUNT,
  D1N_HUMAN_DECISION_RUNTIME_IMPLEMENTED,
  D1N_HUMAN_DECISION_SPOOFING_PROTECTION_IMPLEMENTED,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_R5_C10_DEBT,
  D1N_R5_CANONICAL_SCOPE,
  D1N_R5_CLOSEOUT_PATH,
  D1N_R5_D1F_DEBT,
  D1N_R5_D1G_BLOCKER_PRESERVED,
  D1N_R5_D1G_DEBT,
  D1N_R5_D1H_DEBT,
  D1N_R5_D1I_DEBT,
  D1N_R5_D1J_DEBT,
  D1N_R5_D1K_DEBT,
  D1N_R5_D1L_DEBT,
  D1N_R5_DATABASE_SCHEMA_CHANGED,
  D1N_R5_DEBT_PRESERVED,
  D1N_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R5_MACHINE_READABLE_ROADMAP_UPDATED,
  D1N_R5_MATURITY_STATE,
  D1N_R5_NEW_DEPENDENCY_ADDED,
  D1N_R5_PARENT_ARCHITECTURE_PATH,
  D1N_R5_POST_D1J_DEBT_LEDGER,
  D1N_R5_R1_CLOSEOUT_PATH,
  D1N_R5_R2_CLOSEOUT_PATH,
  D1N_R5_R3_CLOSEOUT_PATH,
  D1N_R5_R4_CLOSEOUT_PATH,
  D1N_R5_READY_FOR_NEXT_PHASE,
  D1N_R5_STATUS,
  D1N_R5_STRUCTURAL_PACK_COMPLETE,
  D1N_R6_CANONICAL_PHASE,
  D1N_R6_CANONICAL_SCOPE,
  D1N_R6_PHASE_TYPE,
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
  EXACT_R4_TRANSITION_REQUEST_REFERENCE_REQUIRED,
  FINGERPRINT_VERIFIED_EQUALS_CERTIFIED,
  FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED,
  FINGERPRINT_VERIFIED_EQUALS_PROGRESSION_EXECUTED,
  FLOATING_R4_TRANSITION_REQUEST_REFERENCE_ALLOWED,
  FREEFORM_AUTHORITATIVE_HUMAN_DECISION_OUTCOME_ALLOWED,
  HUMAN_DECISION_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE,
  HUMAN_DECISION_AUTO_REPOINTED_TO_NEWER_R3_ASSESSMENT,
  HUMAN_DECISION_AUTO_REPOINTED_TO_NEWER_R4_REQUEST,
  HUMAN_TRANSITION_APPROVAL_RECORDED_EQUALS_R2_PROGRESSION_CHANGED,
  HUMAN_TRANSITION_APPROVAL_RECORDED_EQUALS_TRANSITION_EXECUTED,
  HUMAN_TRANSITION_DECISION_EQUALS_CERTIFICATION,
  HUMAN_TRANSITION_DECISION_EQUALS_ENGINEERING_CONFORMANCE,
  HUMAN_TRANSITION_DECISION_EQUALS_ENGINEERING_VALIDATION,
  OPEN_EVIDENCE_GAP_EQUALS_AUTOMATIC_REJECTION,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  R3_EVIDENCE_GAP_STATE_REUSED,
  R3_PREREQUISITE_STATUS_REUSED,
  R4_TRANSITION_REQUEST_REUSED,
  R5_REASSESSES_PREREQUISITES_INDEPENDENTLY,
  R5_REBINDS_R1_CONTEXT,
  R5_REBINDS_R2_PROGRESSION_CONTEXT,
  R5_REBINDS_R3_PREREQUISITE_ASSESSMENTS,
  R5_REBINDS_R4_TRANSITION_REQUEST,
  RECOMMENDATION_EQUALS_TRANSITION_APPROVAL,
  REQUEST_AUTHORITY_EQUALS_DECISION_AUTHORITY,
  REVIEW_OUTCOME_EQUALS_TRANSITION_DECISION,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_HUMAN_DECISION_MUTATION_ALLOWED,
  UNKNOWN_HUMAN_DECISION_OUTCOME_AUTO_ACCEPTED,
  approveTransitionAutomatically,
  changeDesignProgression,
  createD1nR5Store,
  executeStageTransition,
  mutateHumanDecision,
  recordHumanDecision,
  reconstructHumanDecision,
  repointHumanDecision,
  rewriteHumanDecision,
  type D1nR5Input,
} from "./human-decision-record";
import { createD1nR1Store, recordOrchestrationContext, type D1nR1Actor, type D1nR1Record } from "./orchestration-context";
import { createD1nR3Store, recordPrerequisiteAssessment, type D1nR3Input } from "./prerequisite-assessment";

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

function prepared(withGap = false) {
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
  const foreignProgression = recordDesignProgression(orchestration, progressionStore, other, {
    progressionId: "prog-b",
    orchestrationContextId: foreignContext.contextId,
    orchestrationContextFingerprint: foreignContext.fingerprint,
    designProgressionState: "FEED",
    provenanceRef: "prov-b",
  });
  const assessments = createD1nR3Store();
  const present = recordPrerequisiteAssessment(orchestration, progressionStore, assessments, requester, assessmentInput(context, progression, withGap ? { assessmentId: "assess-gap", prerequisiteId: "asm-1", inputCategory: "ASSUMPTIONS", assessmentStatus: "MISSING", evidenceRef: null, gapId: "gap-1" } : {}));
  const gap = assessments.gaps.find((row) => row.gapId === present.gapId);
  const requests = createD1nR4Store();
  const request = recordTransitionRequest(orchestration, progressionStore, assessments, requests, requester, requestInput(context, progression, present.assessmentId, present.fingerprint, gap ? { evidenceGapReferences: [{ gapId: gap.gapId, fingerprint: gap.fingerprint }] } : {}));
  return { orchestration, progressionStore, context, progression, foreignContext, foreignProgression, assessments, present, requests, request, decisions: createD1nR5Store() };
}

function assessmentInput(context: D1nR1Record, progression: D1nR2Record, overrides: Partial<D1nR3Input> = {}): D1nR3Input {
  return {
    assessmentId: "assess-1",
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

function requestInput(context: D1nR1Record, progression: D1nR2Record, assessmentId: string, fingerprint: string, overrides: Partial<D1nR4Input> = {}): D1nR4Input {
  return {
    requestId: "request-1",
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    progressionId: progression.progressionId,
    progressionFingerprint: progression.fingerprint,
    destinationStage: "PREFEASIBILITY",
    prerequisiteReferences: [{ assessmentId, fingerprint }],
    provenanceRef: "prov-request",
    ...overrides,
  };
}

function decisionInput(requestId: string, requestFingerprint: string, overrides: Partial<D1nR5Input> = {}): D1nR5Input {
  return {
    decisionId: "decision-1",
    requestId,
    requestFingerprint,
    gateId: "DESIGN_PROGRESSION_ADVANCEMENT",
    outcome: "APPROVED_TO_TRANSITION",
    rationale: "Human gate considered the cited request.",
    provenanceRef: "prov-decision",
    aal: "aal2",
    ...overrides,
  };
}

describe("EOS-D1N-R5 human decision", () => {
  it("binds an allowlisted human outcome to the exact open R4 request", () => {
    expect([...D1N_HUMAN_DECISION_OUTCOMES]).toEqual(["APPROVED_TO_TRANSITION", "APPROVED_WITH_CONDITIONS", "NOT_APPROVED", "DEFERRED", "WAIVED"]);
    expect(EXACT_R4_TRANSITION_REQUEST_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_R4_TRANSITION_REQUEST_REFERENCE_ALLOWED).toBe(false);
    expect(R5_REBINDS_R1_CONTEXT).toBe(false);
    expect(R5_REBINDS_R2_PROGRESSION_CONTEXT).toBe(false);
    expect(R5_REBINDS_R3_PREREQUISITE_ASSESSMENTS).toBe(false);
    expect(R5_REBINDS_R4_TRANSITION_REQUEST).toBe(false);
    expect(D1N_HUMAN_DECISION_AUTHORITY_REQUIRED).toBe(true);
    expect(FREEFORM_AUTHORITATIVE_HUMAN_DECISION_OUTCOME_ALLOWED).toBe(false);
    expect(UNKNOWN_HUMAN_DECISION_OUTCOME_AUTO_ACCEPTED).toBe(false);
    const base = prepared();
    const before = JSON.stringify(base.progressionStore.records);
    const decision = recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint));
    expect(decision.requestId).toBe(base.request.requestId);
    expect(decision.requestFingerprint).toBe(base.request.fingerprint);
    expect(decision.orchestrationContextId).toBe(base.context.contextId);
    expect(decision.progressionId).toBe(base.progression.progressionId);
    expect(decision.sourceStage).toBe("CONCEPT");
    expect(decision.destinationStage).toBe("PREFEASIBILITY");
    expect(decision.prerequisiteReferences[0]?.fingerprint).toBe(base.present.fingerprint);
    expect(decision.outcome).toBe("APPROVED_TO_TRANSITION");
    expect(decision.rationale).toContain("cited request");
    expect(decision.authority).toBe(D1N_HUMAN_DECISION_AUTHORITY);
    expect(decision.humanTransitionApprovalRecorded).toBe(true);
    expect(decision.progressionChanged).toBe(false);
    expect(decision.transitionExecuted).toBe(false);
    expect(decision.engineeringValidated).toBe(false);
    expect(JSON.stringify(base.progressionStore.records)).toBe(before);
    expect(base.progression.designProgressionState).toBe("CONCEPT");
    expect(base.request.lifecycleState).toBe("OPEN");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput("latest request", base.request.fingerprint, { decisionId: "decision-float" }))).toThrow("FLOATING_R4_REQUEST_REJECTED");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { decisionId: "decision-rebind", orchestrationContextId: "ctx-b" }))).toThrow("R1_REBIND_REJECTED");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { decisionId: "decision-rebind-r2", progressionId: "prog-b" }))).toThrow("R2_REBIND_REJECTED");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { decisionId: "decision-rebind-r3", prerequisiteFingerprint: "newer-assessment" }))).toThrow("R3_REBIND_REJECTED");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { decisionId: "decision-blank", rationale: " " }))).toThrow("RATIONALE_REQUIRED");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { decisionId: "decision-free", outcome: "looks fine" }))).toThrow("FREEFORM_HUMAN_DECISION_OUTCOME_REJECTED");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { decisionId: "decision-unknown", outcome: "APPROVED" }))).toThrow("HUMAN_DECISION_OUTCOME_INVALID");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { decisionId: "decision-done", outcome: "DONE" }))).toThrow("HUMAN_DECISION_OUTCOME_INVALID");
    expect(() => recordHumanDecision(base.requests, createD1nR5Store(), requester, decisionInput(base.request.requestId, base.request.fingerprint))).toThrow("REQUEST_AUTHORITY_NOT_DECISION_AUTHORITY");
  });

  it("keeps a recorded approval from validating, certifying, or changing progression", () => {
    const gapCase = prepared(true);
    const before = JSON.stringify(gapCase.progressionStore.records);
    const approvedWithGap = recordHumanDecision(gapCase.requests, gapCase.decisions, decider, decisionInput(gapCase.request.requestId, gapCase.request.fingerprint));
    expect(OPEN_EVIDENCE_GAP_EQUALS_AUTOMATIC_REJECTION).toBe(false);
    expect(approvedWithGap.evidenceGapReferences).toHaveLength(1);
    expect(approvedWithGap.humanTransitionApprovalRecorded).toBe(true);
    expect(approvedWithGap.progressionChanged).toBe(false);
    expect(approvedWithGap.certified).toBe(false);
    expect(JSON.stringify(gapCase.progressionStore.records)).toBe(before);
    expect(gapCase.progression.designProgressionState).toBe("CONCEPT");
    const deferred = recordHumanDecision(gapCase.requests, createD1nR5Store(), decider, decisionInput(gapCase.request.requestId, gapCase.request.fingerprint, { decisionId: "decision-defer", outcome: "DEFERRED", rationale: "Held for more information." }));
    expect(deferred.humanTransitionApprovalRecorded).toBe(false);
    expect(HUMAN_TRANSITION_DECISION_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(HUMAN_TRANSITION_DECISION_EQUALS_ENGINEERING_CONFORMANCE).toBe(false);
    expect(HUMAN_TRANSITION_DECISION_EQUALS_CERTIFICATION).toBe(false);
    expect(HUMAN_TRANSITION_APPROVAL_RECORDED_EQUALS_R2_PROGRESSION_CHANGED).toBe(false);
    expect(HUMAN_TRANSITION_APPROVAL_RECORDED_EQUALS_TRANSITION_EXECUTED).toBe(false);
    expect(REVIEW_OUTCOME_EQUALS_TRANSITION_DECISION).toBe(false);
    expect(RECOMMENDATION_EQUALS_TRANSITION_APPROVAL).toBe(false);
    expect(REQUEST_AUTHORITY_EQUALS_DECISION_AUTHORITY).toBe(false);
    expect(R5_REASSESSES_PREREQUISITES_INDEPENDENTLY).toBe(false);
    expect(R3_PREREQUISITE_STATUS_REUSED).toBe(true);
    expect(R3_EVIDENCE_GAP_STATE_REUSED).toBe(true);
    expect(R4_TRANSITION_REQUEST_REUSED).toBe(true);
    const base = prepared();
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { recordKind: "REVIEW" }))).toThrow("REVIEW_NOT_TRANSITION_DECISION");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { recordKind: "RECOMMENDATION" }))).toThrow("RECOMMENDATION_NOT_TRANSITION_APPROVAL");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { autoApprove: true }))).toThrow("AUTOMATIC_APPROVAL_NOT_IN_R5");
    expect(() => approveTransitionAutomatically()).toThrow("AUTOMATIC_APPROVAL_NOT_IN_R5");
    expect(() => executeStageTransition()).toThrow("STAGE_TRANSITION_EXECUTION_NOT_IN_R5");
    expect(() => changeDesignProgression()).toThrow("PROGRESSION_MUTATION_NOT_IN_R5");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { progressionChange: true }))).toThrow("PROGRESSION_MUTATION_NOT_IN_R5");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { engineeringValidated: true }))).toThrow("ENGINEERING_VALIDATION_NOT_IN_R5");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { certified: true }))).toThrow("CERTIFICATION_NOT_IN_R5");
    expect(AUTOMATIC_HUMAN_DECISION_RUNTIME_COUNT).toBe(0);
    expect(AUTOMATIC_TRANSITION_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT).toBe(0);
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT).toBe(0);
  });

  it("preserves authority, AAL2, provenance, fingerprint, and history", () => {
    const base = prepared();
    expect(() => recordHumanDecision(base.requests, base.decisions, { ...decider, actorId: "AI_ASSISTANT" }, decisionInput(base.request.requestId, base.request.fingerprint))).toThrow("AI_NOT_DECISION_AUTHORITY");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { rationale: "AI recommends approval" }))).toThrow("AI_NOT_DECISION_AUTHORITY");
    expect(() => recordHumanDecision(base.requests, base.decisions, { ...decider, authority: "ADMINISTRATOR" }, decisionInput(base.request.requestId, base.request.fingerprint))).toThrow("ADMIN_NOT_DECISION_AUTHORITY");
    expect(() => rewriteHumanDecision()).toThrow("ADMIN_DECISION_REWRITE_REJECTED");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { aal: "aal1" }))).toThrow("AAL2_REQUIRED");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { aal: null }))).toThrow("AAL2_REQUIRED");
    expect(() => recordHumanDecision(base.requests, base.decisions, { ...decider, tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }, decisionInput(base.request.requestId, base.request.fingerprint))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { workspaceId: "workspace-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, "substituted"))).toThrow("TRANSITION_REQUEST_FINGERPRINT_MISMATCH");
    const accepted = recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { aiDraftRationale: true, humanAcceptedRationale: true, rationale: "Accepted draft after review." }));
    expect(accepted.rationaleProvenance).toBe("HUMAN_ACCEPTED_DRAFT");
    expect(accepted.recordedBy).toBe(decider.actorId);
    expect(accepted.aal).toBe("aal2");
    const replay = recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { aiDraftRationale: true, humanAcceptedRationale: true, rationale: "Accepted draft after review." }));
    expect(replay).toBe(accepted);
    const otherStore = createD1nR5Store();
    const again = recordHumanDecision(base.requests, otherStore, decider, decisionInput(base.request.requestId, base.request.fingerprint, { aiDraftRationale: true, humanAcceptedRationale: true, rationale: "Accepted draft after review." }));
    expect(again.fingerprint).toBe(accepted.fingerprint);
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { provenanceRef: "prov-other" }))).toThrow("DECISION_ALREADY_RECORDED");
    expect(() => recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { decisionId: "decision-dup", rationale: "A second current decision." }))).toThrow("DUPLICATE_DECISION_REJECTED");
    const successor = recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, { decisionId: "decision-2", outcome: "NOT_APPROVED", rationale: "Returned without changing progression.", predecessorDecisionId: accepted.decisionId }));
    expect(reconstructHumanDecision(base.decisions, accepted.decisionId).outcome).toBe("APPROVED_TO_TRANSITION");
    expect(reconstructHumanDecision(base.decisions, accepted.decisionId).recordStatus).toBe("SUPERSEDED");
    expect(successor.outcome).toBe("NOT_APPROVED");
    expect(successor.predecessorDecisionId).toBe(accepted.decisionId);
    expect(base.decisions.history.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED"]);
    expect(() => mutateHumanDecision()).toThrow("DECISION_MUTATION_REJECTED");
    expect(() => repointHumanDecision()).toThrow("DECISION_REPOINT_NOT_IN_R5");
    const pinned = accepted.requestFingerprint;
    recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, requester, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-2", provenanceRef: "prov-next", predecessorRequestId: base.request.requestId }));
    expect(reconstructHumanDecision(base.decisions, accepted.decisionId).requestId).toBe(base.request.requestId);
    expect(reconstructHumanDecision(base.decisions, accepted.decisionId).requestFingerprint).toBe(pinned);
    expect(reconstructHumanDecision(base.decisions, accepted.decisionId).prerequisiteReferences[0]?.assessmentStatus).toBe("PRESENT");
    expect(() => recordHumanDecision(base.requests, createD1nR5Store(), decider, decisionInput(base.request.requestId, pinned, { decisionId: "decision-closed" }))).toThrow("REQUEST_NOT_OPEN");
    expect(base.progression.designProgressionState).toBe("CONCEPT");
    expect(D1N_HUMAN_DECISION_AAL2_GUARD_REUSED).toBe(true);
    expect(D1N_HUMAN_DECISION_RATIONALE_PRESERVED).toBe(true);
    expect(D1N_HUMAN_DECISION_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D1N_HUMAN_DECISION_HISTORY_PRESERVED).toBe(true);
    expect(D1N_DUPLICATE_HUMAN_DECISION_GOVERNED).toBe(true);
    expect(D1N_HUMAN_DECISION_REPLAY_GOVERNED).toBe(true);
    expect(D1N_HUMAN_DECISION_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(SILENT_HUMAN_DECISION_MUTATION_ALLOWED).toBe(false);
    expect(HUMAN_DECISION_AUTO_REPOINTED_TO_NEWER_R4_REQUEST).toBe(false);
    expect(HUMAN_DECISION_AUTO_REPOINTED_TO_NEWER_R3_ASSESSMENT).toBe(false);
    expect(HUMAN_DECISION_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_CERTIFIED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_PROGRESSION_EXECUTED).toBe(false);
    expect(AI_CAN_IMPERSONATE_HUMAN_DECISION_AUTHORITY).toBe(false);
    expect(AI_CAN_APPROVE_STAGE_TRANSITION).toBe(false);
    expect(AI_CAN_REJECT_STAGE_TRANSITION_AUTHORITATIVELY).toBe(false);
    expect(AI_CAN_CHANGE_HUMAN_DECISION_OUTCOME).toBe(false);
    expect(AI_CAN_CHANGE_DESIGN_PROGRESSION_STATE).toBe(false);
    expect(AI_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE).toBe(false);
    expect(ADMIN_CAN_REWRITE_HUMAN_DECISION).toBe(false);
    expect(ADMIN_CAN_BYPASS_DECISION_AUTHORITY).toBe(false);
    expect(D1N_HUMAN_DECISION_AUTHORITY_PRESERVED).toBe(true);
  });

  it("keeps the consolidated boundary, debt, and next phase unchanged", () => {
    expect(D1N_RUNTIME_STARTED).toBe(true);
    expect(D1N_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R4_HUMAN_GATE_READY).toBe(false);
    expect(R4_HUMAN_DECISION_COUNT).toBe(0);
    expect(D1N_ARCHITECTURE_DEFINED).toBe(true);
    expect(D1N_ARCHITECTURE_READY).toBe(true);
    expect(D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_RUNTIME_READY).toBe(true);
    expect(D1N_PREREQUISITE_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY).toBe(false);
    expect(D1N_HUMAN_GATE_RUNTIME_READY).toBe(true);
    expect(D1N_HUMAN_DECISION_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1N_HUMAN_DECISION_RUNTIME_COUNT).toBe(1);
    expect(D1N_ALTERNATIVE_BRANCH_RUNTIME_READY).toBe(false);
    expect(D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY).toBe(false);
    expect(D1N_HANDOFF_INTEGRATION_RUNTIME_READY).toBe(false);
    expect([
      D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT,
      AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT,
      D1N_ALTERNATIVE_BRANCH_RUNTIME_COUNT,
      D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT,
      D1N_D1M_RUNTIME_INTEGRATION_COUNT,
      D1N_D1K_RUNTIME_INTEGRATION_COUNT,
      D1N_D1L_RUNTIME_INTEGRATION_COUNT,
      D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
      D1N_SOLVER_EXECUTION_RUNTIME_COUNT,
      D1N_CONFORMANCE_RUNTIME_COUNT,
      D1N_CERTIFICATION_RUNTIME_COUNT,
      D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT,
      D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
      D9_RUNTIME_COUNT,
      D2_D8_RUNTIME_COUNT,
    ].every((count) => count === 0)).toBe(true);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D1M_TRACK_COMPLETE).toBe(true);
    expect(D1M_REOPENED).toBe(false);
    expect(D1K_INTERNAL_DISCIPLINE_INTEGRATION_READY).toBe(false);
    expect(D1K_CROSS_DISCIPLINE_INTELLIGENCE_READY).toBe(false);
    expect(D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1L_TRACK_COMPLETE).toBe(true);
    expect(D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D1N_DIGITAL_THREAD_CREATED).toBe(false);
    expect(CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(D1N_R5_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1N_R5_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1N_R5_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect([D1N_R5_C10_DEBT, D1N_R5_D1F_DEBT, D1N_R5_D1G_DEBT, D1N_R5_D1H_DEBT, D1N_R5_D1I_DEBT, D1N_R5_D1J_DEBT, D1N_R5_D1K_DEBT, D1N_R5_D1L_DEBT].every((row) => row === debt)).toBe(true);
    expect(D1N_R5_DEBT_PRESERVED).toBe(true);
    expect(D1N_R5_POST_D1J_DEBT_LEDGER).toContain("NOT_AVAILABLE");
    expect(D1N_R5_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1N_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1N_R5_STATUS).toBe("HUMAN_DECISION_AND_REVIEW_GATE_INTEGRATED");
    expect(D1N_R5_MATURITY_STATE).toBe("STRUCTURAL_HUMAN_DECISION_AND_REVIEW_GATE_INTEGRATED");
    expect(D1N_R5_CANONICAL_SCOPE).toContain("human decision");
    expect(D1N_R6_CANONICAL_PHASE).toBe("EOS-D1N-R6-ALTERNATIVE-DESIGN-BRANCH-GOVERNANCE");
    expect(D1N_R6_PHASE_TYPE).toBe("ALTERNATIVE_DESIGN_BRANCH_GOVERNANCE");
    expect(D1N_R6_CANONICAL_SCOPE).toContain("alternative");
    expect(D1N_R5_READY_FOR_NEXT_PHASE).toBe(true);
    expect(D1N_R5_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    const source = readFileSync(join(here, "human-decision-record.ts"), "utf8");
    const doc = readFileSync(join(root, D1N_R5_CLOSEOUT_PATH), "utf8");
    const index = readFileSync(join(here, "index.ts"), "utf8");
    const capability = readFileSync(join(root, "packages/engineering-os/src/structural-concrete/capability.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).toContain("resolveAuthAssuranceLevel");
    expect(source).not.toContain("createHash");
    expect(source).not.toContain('from "@rtb/engineering-review"');
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("CREATE TABLE");
    expect(scanAnalysisFormulaBypass("human-decision-record.ts", source)).toEqual([]);
    expect(doc).toContain("EOS-D1N-R6-ALTERNATIVE-DESIGN-BRANCH-GOVERNANCE");
    expect(doc).not.toContain("```");
    expect(existsSync(join(root, D1N_R5_PARENT_ARCHITECTURE_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R5_R1_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R5_R2_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R5_R3_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R5_R4_CLOSEOUT_PATH))).toBe(true);
    expect(index).toContain("recordHumanDecision");
    expect(index.match(/D1N_R5_CANONICAL_PHASE/g)).toHaveLength(1);
    expect(capability).toContain("D1N.R5.HUMAN_DECISION_AND_REVIEW_GATE");
  });
});
