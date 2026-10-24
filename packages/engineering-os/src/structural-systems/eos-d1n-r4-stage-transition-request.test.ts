import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createD1nR2Store, recordDesignProgression, type D1nR2Record } from "./design-progression-context";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { D1N_CONTEXT_AUTHORITY, createD1nR1Store, recordOrchestrationContext, type D1nR1Actor, type D1nR1Record } from "./orchestration-context";
import { createD1nR3Store, recordPrerequisiteAssessment, type D1nR3Input } from "./prerequisite-assessment";
import { D1N_RUNTIME_COUNT as R3_RUNTIME_COUNT, D1N_STAGE_TRANSITION_REQUEST_RUNTIME_COUNT as R3_REQUEST_COUNT, D1N_STAGE_TRANSITION_RUNTIME_READY as R3_STAGE_TRANSITION_READY } from "./prerequisite-assessment";
import {
  ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE,
  ADMIN_CAN_BYPASS_TRANSITION_REQUEST_GOVERNANCE,
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_CAN_APPROVE_STAGE_TRANSITION,
  AI_CAN_AUTHORITATIVELY_SELECT_NEXT_STAGE,
  AI_CAN_CHANGE_DESIGN_PROGRESSION_STATE,
  AI_CAN_INVENT_SOURCE_STATE,
  AI_CAN_INVENT_TRANSITION_REQUEST_AUTHORITY,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  ALL_REFERENCED_PREREQUISITES_PRESENT_EQUALS_TRANSITION_APPROVED,
  AUTOMATIC_DESIGN_PROGRESSION_RUNTIME_COUNT,
  AUTOMATIC_STAGE_TRANSITION_APPROVAL_RUNTIME_COUNT,
  AUTOMATIC_TRANSITION_REQUEST_ACCEPTANCE_RUNTIME_COUNT,
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
  D1N_AUTOMATIC_NEXT_STAGE_SELECTION_RUNTIME_COUNT,
  D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
  D1N_CERTIFICATION_RUNTIME_COUNT,
  D1N_CONFORMANCE_RUNTIME_COUNT,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY,
  D1N_D1K_RUNTIME_INTEGRATION_COUNT,
  D1N_D1L_RUNTIME_INTEGRATION_COUNT,
  D1N_D1M_RUNTIME_INTEGRATION_COUNT,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_DUPLICATE_TRANSITION_REQUEST_GOVERNED,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_HANDOFF_INTEGRATION_RUNTIME_READY,
  D1N_HUMAN_DECISION_GATE_RUNTIME_COUNT,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_R4_C10_DEBT,
  D1N_R4_CANONICAL_SCOPE,
  D1N_R4_CLOSEOUT_PATH,
  D1N_R4_D1F_DEBT,
  D1N_R4_D1G_BLOCKER_PRESERVED,
  D1N_R4_D1G_DEBT,
  D1N_R4_D1H_DEBT,
  D1N_R4_D1I_DEBT,
  D1N_R4_D1J_DEBT,
  D1N_R4_D1K_DEBT,
  D1N_R4_D1L_DEBT,
  D1N_R4_DATABASE_SCHEMA_CHANGED,
  D1N_R4_DEBT_PRESERVED,
  D1N_R4_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R4_MACHINE_READABLE_ROADMAP_UPDATED,
  D1N_R4_MATURITY_STATE,
  D1N_R4_NEW_DEPENDENCY_ADDED,
  D1N_R4_PARENT_ARCHITECTURE_PATH,
  D1N_R4_POST_D1J_DEBT_LEDGER,
  D1N_R4_R1_CLOSEOUT_PATH,
  D1N_R4_R2_CLOSEOUT_PATH,
  D1N_R4_R3_CLOSEOUT_PATH,
  D1N_R4_READY_FOR_NEXT_PHASE,
  D1N_R4_STATUS,
  D1N_R4_STRUCTURAL_PACK_COMPLETE,
  D1N_R5_CANONICAL_PHASE,
  D1N_R5_CANONICAL_SCOPE,
  D1N_R5_PHASE_TYPE,
  D1N_REVIEW_GATE_RUNTIME_COUNT,
  D1N_RUNTIME_COUNT,
  D1N_RUNTIME_STARTED,
  D1N_SOLVER_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_IMPLEMENTED,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY,
  D1N_STAGE_TRANSITION_RUNTIME_COUNT,
  D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT,
  D1N_TRANSITION_REQUEST_AUTHORITY,
  D1N_TRANSITION_REQUEST_FINGERPRINT_IMPLEMENTED,
  D1N_TRANSITION_REQUEST_HISTORY_PRESERVED,
  D1N_TRANSITION_REQUEST_LIFECYCLE_IMPLEMENTED,
  D1N_TRANSITION_REQUEST_REPLAY_GOVERNED,
  D1N_TRANSITION_REQUEST_SPOOFING_PROTECTION_IMPLEMENTED,
  D1N_TRANSITION_RELATIONSHIP_RULES_REUSED,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  EXACT_R1_CONTEXT_REFERENCE_REQUIRED,
  EXACT_R2_SOURCE_PROGRESSION_REFERENCE_REQUIRED,
  EXACT_R3_PREREQUISITE_REFERENCE_REQUIRED,
  FINGERPRINT_VERIFIED_EQUALS_CERTIFIED,
  FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED,
  FINGERPRINT_VERIFIED_EQUALS_TRANSITION_APPROVED,
  FLOATING_R1_CONTEXT_REFERENCE_ALLOWED,
  FLOATING_R2_PROGRESSION_REFERENCE_ALLOWED,
  FLOATING_R3_PREREQUISITE_REFERENCE_ALLOWED,
  FREEFORM_TRANSITION_DESTINATION_ALLOWED,
  NO_EVIDENCE_GAPS_EQUALS_ENGINEERING_VALIDATED,
  NO_EVIDENCE_GAPS_EQUALS_TRANSITION_APPROVED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  R3_EVIDENCE_GAP_STATE_REUSED,
  R3_PREREQUISITE_STATUS_REUSED,
  R4_REASSESSES_PREREQUISITES_INDEPENDENTLY,
  REQUESTER_CAN_OVERRIDE_SOURCE_STATE,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_R2_PROGRESSION_MUTATION_ALLOWED,
  SILENT_TRANSITION_REQUEST_MUTATION_ALLOWED,
  STAGE_TRANSITION_REQUEST_EQUALS_CERTIFICATION,
  STAGE_TRANSITION_REQUEST_EQUALS_DESIGN_PROGRESSION_CHANGE,
  STAGE_TRANSITION_REQUEST_EQUALS_ENGINEERING_APPROVAL,
  STAGE_TRANSITION_REQUEST_EQUALS_ENGINEERING_VALIDATION,
  STAGE_TRANSITION_REQUEST_EQUALS_STAGE_APPROVAL,
  STAGE_TRANSITION_REQUEST_EQUALS_STAGE_TRANSITION_AUTHORIZED,
  TRANSITION_REQUEST_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE,
  TRANSITION_REQUEST_AUTO_REPOINTED_TO_NEWER_R2_CONTEXT,
  TRANSITION_REQUEST_AUTO_REPOINTED_TO_NEWER_R3_ASSESSMENT,
  TRANSITION_SOURCE_STATE_DERIVED_FROM_EXACT_R2_RECORD,
  UNKNOWN_TRANSITION_DESTINATION_AUTO_ACCEPTED,
  approveStageTransition,
  changeDesignProgression,
  createD1nR4Store,
  executeStageTransition,
  mutateTransitionRequest,
  recordTransitionRequest,
  reconstructTransitionRequest,
  repointTransitionRequest,
  selectNextStage,
  withdrawTransitionRequest,
  type D1nR4Input,
} from "./stage-transition-request";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..", "..");
const debt = "DOES_NOT_BLOCK_D1N_BUT_REMAINS_LIMITATION";
const actor: D1nR1Actor = {
  actorId: "orchestrator-1",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "ORCHESTRATION_CONTEXT_AUTHORITY",
};

function prepared() {
  const orchestration = createD1nR1Store([
    { id: "member-1", kind: "MEMBER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" },
    { id: "member-b", kind: "MEMBER", tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" },
  ]);
  const context = recordOrchestrationContext(orchestration, actor, {
    contextId: "ctx-1",
    structuralIdentityId: "member-1",
    citedLifecycleStage: "CONCEPT",
    provenanceRef: "prov-ctx",
  });
  const progressionStore = createD1nR2Store();
  const progression = recordDesignProgression(orchestration, progressionStore, actor, {
    progressionId: "prog-1",
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    designProgressionState: "CONCEPT",
    provenanceRef: "prov-prog",
  });
  const other: D1nR1Actor = { ...actor, tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" };
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
  const present = recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression));
  return { orchestration, progressionStore, context, progression, foreignContext, foreignProgression, assessments, present, requests: createD1nR4Store() };
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

describe("EOS-D1N-R4 stage-transition request", () => {
  it("binds a request to the exact R1, R2, and R3 records without changing progression", () => {
    expect(EXACT_R1_CONTEXT_REFERENCE_REQUIRED).toBe(true);
    expect(EXACT_R2_SOURCE_PROGRESSION_REFERENCE_REQUIRED).toBe(true);
    expect(EXACT_R3_PREREQUISITE_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_R1_CONTEXT_REFERENCE_ALLOWED).toBe(false);
    expect(FLOATING_R2_PROGRESSION_REFERENCE_ALLOWED).toBe(false);
    expect(FLOATING_R3_PREREQUISITE_REFERENCE_ALLOWED).toBe(false);
    expect(D1N_TRANSITION_RELATIONSHIP_RULES_REUSED).toBe(true);
    expect(TRANSITION_SOURCE_STATE_DERIVED_FROM_EXACT_R2_RECORD).toBe(true);
    expect(REQUESTER_CAN_OVERRIDE_SOURCE_STATE).toBe(false);
    expect(FREEFORM_TRANSITION_DESTINATION_ALLOWED).toBe(false);
    expect(UNKNOWN_TRANSITION_DESTINATION_AUTO_ACCEPTED).toBe(false);
    const base = prepared();
    const before = JSON.stringify(base.progressionStore.records);
    const request = recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint));
    expect(request.orchestrationContextId).toBe(base.context.contextId);
    expect(request.progressionId).toBe(base.progression.progressionId);
    expect(request.sourceStage).toBe("CONCEPT");
    expect(request.destinationStage).toBe("PREFEASIBILITY");
    expect(request.prerequisiteReferences[0]?.assessmentStatus).toBe("PRESENT");
    expect(request.lifecycleState).toBe("OPEN");
    expect(request.authority).toBe(D1N_CONTEXT_AUTHORITY);
    expect(JSON.stringify(base.progressionStore.records)).toBe(before);
    expect(base.progression.designProgressionState).toBe("CONCEPT");
    expect(base.progression.stageTransitionApproved).toBe(false);
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-float", orchestrationContextId: "latest orchestration" }))).toThrow("FLOATING_R1_CONTEXT_REJECTED");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-float-r2", progressionId: "current progression" }))).toThrow("FLOATING_R2_PROGRESSION_REJECTED");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, "latest assessment", "fp", { requestId: "request-float-r3" }))).toThrow("FLOATING_R3_PREREQUISITE_REJECTED");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-none", prerequisiteReferences: [] }))).toThrow("PREREQUISITE_REFERENCE_REQUIRED");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-source", sourceStage: "FEED" }))).toThrow("SOURCE_STATE_OVERRIDE_REJECTED");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-blank", destinationStage: "" }))).toThrow("EXPLICIT_DESTINATION_REQUIRED");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-free", destinationStage: "feed please" }))).toThrow("FREEFORM_TRANSITION_DESTINATION_REJECTED");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-unknown", destinationStage: "READY_FOR_FEED" }))).toThrow("DESTINATION_STATE_INVALID");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-scope", destinationStage: "CONSTRUCTION" }))).toThrow("DESTINATION_OUT_OF_D1N_SCOPE");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-skip", destinationStage: "FEED" }))).toThrow("TRANSITION_RELATIONSHIP_NOT_ALLOWED");
    const moved = recordDesignProgression(base.orchestration, base.progressionStore, actor, {
      progressionId: "prog-moved",
      orchestrationContextId: base.context.contextId,
      orchestrationContextFingerprint: base.context.fingerprint,
      designProgressionState: "PREFEASIBILITY",
      provenanceRef: "prov-moved",
      predecessorProgressionId: base.progression.progressionId,
    });
    const movedAssessment = recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, moved, { assessmentId: "assess-moved" }));
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, createD1nR4Store(), actor, requestInput(base.context, moved, movedAssessment.assessmentId, movedAssessment.fingerprint, { destinationStage: "CONCEPT" }))).toThrow("TRANSITION_RELATIONSHIP_NOT_ALLOWED");
    expect(() => selectNextStage()).toThrow("NEXT_STAGE_SELECTION_NOT_IN_R4");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-auto", selectNextStage: true }))).toThrow("NEXT_STAGE_SELECTION_NOT_IN_R4");
  });

  it("keeps a request from becoming approval, progression, or a new prerequisite judgment", () => {
    const base = prepared();
    const missing = recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-missing", prerequisiteId: "asm-1", inputCategory: "ASSUMPTIONS", assessmentStatus: "MISSING", evidenceRef: null, gapId: "gap-missing" }));
    const gap = base.assessments.gaps.find((row) => row.gapId === "gap-missing");
    expect(gap).toBeTruthy();
    const openGap = recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, missing.assessmentId, missing.fingerprint, {
      requestId: "request-gap",
      evidenceGapReferences: [{ gapId: gap!.gapId, fingerprint: gap!.fingerprint }],
    }));
    expect(openGap.lifecycleState).toBe("OPEN");
    expect(openGap.evidenceGapReferences[0]?.assessmentStatus).toBe("MISSING");
    expect(openGap.transitionApproved).toBe(false);
    expect(openGap.transitionApprovable).toBe(false);
    expect(openGap.progressionChanged).toBe(false);
    expect(STAGE_TRANSITION_REQUEST_EQUALS_STAGE_APPROVAL).toBe(false);
    expect(STAGE_TRANSITION_REQUEST_EQUALS_STAGE_TRANSITION_AUTHORIZED).toBe(false);
    expect(STAGE_TRANSITION_REQUEST_EQUALS_DESIGN_PROGRESSION_CHANGE).toBe(false);
    expect(STAGE_TRANSITION_REQUEST_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(STAGE_TRANSITION_REQUEST_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(STAGE_TRANSITION_REQUEST_EQUALS_CERTIFICATION).toBe(false);
    expect(ALL_REFERENCED_PREREQUISITES_PRESENT_EQUALS_TRANSITION_APPROVED).toBe(false);
    expect(NO_EVIDENCE_GAPS_EQUALS_TRANSITION_APPROVED).toBe(false);
    expect(NO_EVIDENCE_GAPS_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(R4_REASSESSES_PREREQUISITES_INDEPENDENTLY).toBe(false);
    expect(R3_PREREQUISITE_STATUS_REUSED).toBe(true);
    expect(R3_EVIDENCE_GAP_STATE_REUSED).toBe(true);
    const presentRequest = recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, createD1nR4Store(), actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint));
    expect(presentRequest.evidenceGapReferences).toEqual([]);
    expect(presentRequest.transitionApproved).toBe(false);
    expect(presentRequest.engineeringValidated).toBe(false);
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, missing.assessmentId, missing.fingerprint, { requestId: "request-status", prerequisiteReferences: [{ assessmentId: missing.assessmentId, fingerprint: missing.fingerprint, assessmentStatus: "PRESENT" }], evidenceGapReferences: [{ gapId: gap!.gapId, fingerprint: gap!.fingerprint }] }))).toThrow("PREREQUISITE_STATUS_MISMATCH");
    const stale = recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-stale", prerequisiteId: "cur-1", inputCategory: "CURRENTNESS", assessmentStatus: "STALE", evidenceRef: "cur-1", citedCurrentness: "STALE", gapId: "gap-stale" }));
    const staleGap = base.assessments.gaps.find((row) => row.gapId === "gap-stale");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, createD1nR4Store(), actor, requestInput(base.context, base.progression, stale.assessmentId, stale.fingerprint, { evidenceGapReferences: [{ gapId: staleGap!.gapId, fingerprint: staleGap!.fingerprint }], overrideStale: true }))).toThrow("STALE_OVERRIDE_NOT_IN_R4");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, createD1nR4Store(), actor, requestInput(base.context, base.progression, stale.assessmentId, stale.fingerprint, { evidenceGapReferences: [{ gapId: staleGap!.gapId, fingerprint: staleGap!.fingerprint }] }))).toThrow("STALE_INPUT_NOT_ALLOWED_FOR_CURRENT_TRANSITION");
    expect(() => approveStageTransition()).toThrow("STAGE_APPROVAL_NOT_IN_R4");
    expect(() => executeStageTransition()).toThrow("STAGE_TRANSITION_EXECUTION_NOT_IN_R4");
    expect(() => changeDesignProgression()).toThrow("PROGRESSION_MUTATION_NOT_IN_R4");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, createD1nR4Store(), actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { transitionApproved: true }))).toThrow("STAGE_APPROVAL_NOT_IN_R4");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, createD1nR4Store(), actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { progressionChange: true }))).toThrow("PROGRESSION_MUTATION_NOT_IN_R4");
    expect(AUTOMATIC_STAGE_TRANSITION_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(AUTOMATIC_TRANSITION_REQUEST_ACCEPTANCE_RUNTIME_COUNT).toBe(0);
    expect(AUTOMATIC_DESIGN_PROGRESSION_RUNTIME_COUNT).toBe(0);
    expect(D1N_AUTOMATIC_NEXT_STAGE_SELECTION_RUNTIME_COUNT).toBe(0);
    expect(base.progression.designProgressionState).toBe("CONCEPT");
  });

  it("preserves lifecycle, exact references, fingerprint, and scope", () => {
    const base = prepared();
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.foreignContext, base.foreignProgression, base.present.assessmentId, base.present.fingerprint))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { workspaceId: "workspace-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, { ...actor, actorId: "AI_ASSISTANT" }, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint))).toThrow("AI_NOT_TRANSITION_REQUEST_AUTHORITY");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, { ...actor, authority: "ADMINISTRATOR" }, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint))).toThrow("ADMIN_NOT_TRANSITION_REQUEST_AUTHORITY");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, { ...actor, authority: "STAGE_APPROVAL_AUTHORITY" }, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint))).toThrow("TRANSITION_REQUEST_AUTHORITY_NOT_STAGE_APPROVAL");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { provenanceRef: "AI_EVIDENCE" }))).toThrow("AI_NOT_TRANSITION_REQUEST_AUTHORITY");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, "substituted"))).toThrow("PREREQUISITE_FINGERPRINT_MISMATCH");
    const first = recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { prerequisiteReferences: [{ fingerprint: base.present.fingerprint, assessmentId: base.present.assessmentId }] }));
    const replay = recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint));
    expect(replay).toBe(first);
    expect(first.fingerprint).toBe(replay.fingerprint);
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { provenanceRef: "prov-other" }))).toThrow("REQUEST_ALREADY_RECORDED");
    expect(() => recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-dup" }))).toThrow("DUPLICATE_REQUEST_REJECTED");
    const successor = recordTransitionRequest(base.orchestration, base.progressionStore, base.assessments, base.requests, actor, requestInput(base.context, base.progression, base.present.assessmentId, base.present.fingerprint, { requestId: "request-2", provenanceRef: "prov-next", predecessorRequestId: first.requestId }));
    expect(reconstructTransitionRequest(base.requests, first.requestId).lifecycleState).toBe("SUPERSEDED");
    expect(successor.lifecycleState).toBe("OPEN");
    expect(successor.fingerprint).not.toBe(first.fingerprint);
    const withdrawn = withdrawTransitionRequest(base.requests, actor, { requestId: successor.requestId, provenanceRef: "prov-withdraw" });
    expect(withdrawn.lifecycleState).toBe("WITHDRAWN");
    expect(withdrawn.fingerprint).toBe(successor.fingerprint);
    expect(withdrawn.progressionId).toBe(base.progression.progressionId);
    expect(base.requests.history.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED", "WITHDRAWN"]);
    expect(() => mutateTransitionRequest()).toThrow("REQUEST_MUTATION_REJECTED");
    expect(() => repointTransitionRequest()).toThrow("REQUEST_REPOINT_NOT_IN_R4");
    const pinned = first.prerequisiteReferences[0]?.fingerprint;
    recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-2", assessmentStatus: "MISSING", evidenceRef: null, gapId: "gap-2", provenanceRef: "prov-later", predecessorAssessmentId: base.present.assessmentId }));
    expect(reconstructTransitionRequest(base.requests, first.requestId).prerequisiteReferences[0]?.fingerprint).toBe(pinned);
    expect(reconstructTransitionRequest(base.requests, first.requestId).prerequisiteReferences[0]?.assessmentStatus).toBe("PRESENT");
    const newer = recordDesignProgression(base.orchestration, base.progressionStore, actor, {
      progressionId: "prog-2",
      orchestrationContextId: base.context.contextId,
      orchestrationContextFingerprint: base.context.fingerprint,
      designProgressionState: "PREFEASIBILITY",
      provenanceRef: "prov-later-stage",
      predecessorProgressionId: base.progression.progressionId,
    });
    expect(reconstructTransitionRequest(base.requests, first.requestId).progressionId).toBe(base.progression.progressionId);
    expect(reconstructTransitionRequest(base.requests, first.requestId).progressionFingerprint).toBe(base.progression.fingerprint);
    expect(newer.designProgressionState).toBe("PREFEASIBILITY");
    expect(base.progression.designProgressionState).toBe("CONCEPT");
    expect(D1N_TRANSITION_REQUEST_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D1N_DUPLICATE_TRANSITION_REQUEST_GOVERNED).toBe(true);
    expect(D1N_TRANSITION_REQUEST_REPLAY_GOVERNED).toBe(true);
    expect(D1N_TRANSITION_REQUEST_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D1N_TRANSITION_REQUEST_HISTORY_PRESERVED).toBe(true);
    expect(D1N_TRANSITION_REQUEST_LIFECYCLE_IMPLEMENTED).toBe(true);
    expect(SILENT_TRANSITION_REQUEST_MUTATION_ALLOWED).toBe(false);
    expect(SILENT_R2_PROGRESSION_MUTATION_ALLOWED).toBe(false);
    expect(TRANSITION_REQUEST_AUTO_REPOINTED_TO_NEWER_R2_CONTEXT).toBe(false);
    expect(TRANSITION_REQUEST_AUTO_REPOINTED_TO_NEWER_R3_ASSESSMENT).toBe(false);
    expect(TRANSITION_REQUEST_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_TRANSITION_APPROVED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_CERTIFIED).toBe(false);
    expect(AI_CAN_INVENT_TRANSITION_REQUEST_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_SOURCE_STATE).toBe(false);
    expect(AI_CAN_AUTHORITATIVELY_SELECT_NEXT_STAGE).toBe(false);
    expect(AI_CAN_APPROVE_STAGE_TRANSITION).toBe(false);
    expect(AI_CAN_CHANGE_DESIGN_PROGRESSION_STATE).toBe(false);
    expect(AI_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE).toBe(false);
    expect(ADMIN_CAN_BYPASS_TRANSITION_REQUEST_GOVERNANCE).toBe(false);
    expect(D1N_TRANSITION_REQUEST_AUTHORITY).toBe(D1N_CONTEXT_AUTHORITY);
  });

  it("keeps the consolidated boundary, debt, and next phase unchanged", () => {
    expect(D1N_RUNTIME_STARTED).toBe(true);
    expect(D1N_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R3_REQUEST_COUNT).toBe(0);
    expect(R3_STAGE_TRANSITION_READY).toBe(false);
    expect(D1N_ARCHITECTURE_DEFINED).toBe(true);
    expect(D1N_ARCHITECTURE_READY).toBe(true);
    expect(D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_RUNTIME_READY).toBe(true);
    expect(D1N_PREREQUISITE_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_REQUEST_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1N_STAGE_TRANSITION_REQUEST_RUNTIME_COUNT).toBe(1);
    expect(D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY).toBe(false);
    expect(D1N_HUMAN_GATE_RUNTIME_READY).toBe(false);
    expect(D1N_ALTERNATIVE_BRANCH_RUNTIME_READY).toBe(false);
    expect(D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY).toBe(false);
    expect(D1N_HANDOFF_INTEGRATION_RUNTIME_READY).toBe(false);
    expect([
      D1N_STAGE_TRANSITION_RUNTIME_COUNT,
      D1N_HUMAN_DECISION_GATE_RUNTIME_COUNT,
      D1N_REVIEW_GATE_RUNTIME_COUNT,
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
    expect(D1N_R4_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1N_R4_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1N_R4_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect([D1N_R4_C10_DEBT, D1N_R4_D1F_DEBT, D1N_R4_D1G_DEBT, D1N_R4_D1H_DEBT, D1N_R4_D1I_DEBT, D1N_R4_D1J_DEBT, D1N_R4_D1K_DEBT, D1N_R4_D1L_DEBT].every((row) => row === debt)).toBe(true);
    expect(D1N_R4_DEBT_PRESERVED).toBe(true);
    expect(D1N_R4_POST_D1J_DEBT_LEDGER).toContain("NOT_AVAILABLE");
    expect(D1N_R4_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1N_R4_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1N_R4_STATUS).toBe("STAGE_TRANSITION_REQUEST_IMPLEMENTED");
    expect(D1N_R4_MATURITY_STATE).toBe("STRUCTURAL_STAGE_TRANSITION_REQUEST_GOVERNANCE_IMPLEMENTED");
    expect(D1N_R4_CANONICAL_SCOPE).toContain("requested destination");
    expect(D1N_R5_CANONICAL_PHASE).toBe("EOS-D1N-R5-HUMAN-DECISION-AND-REVIEW-GATE-INTEGRATION");
    expect(D1N_R5_PHASE_TYPE).toBe("HUMAN_DECISION_AND_REVIEW_GATE_INTEGRATION");
    expect(D1N_R5_CANONICAL_SCOPE).toContain("human decision");
    expect(D1N_R4_READY_FOR_NEXT_PHASE).toBe(true);
    expect(D1N_R4_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    const source = readFileSync(join(here, "stage-transition-request.ts"), "utf8");
    const doc = readFileSync(join(root, D1N_R4_CLOSEOUT_PATH), "utf8");
    const index = readFileSync(join(here, "index.ts"), "utf8");
    const capability = readFileSync(join(root, "packages/engineering-os/src/structural-concrete/capability.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toContain("createHash");
    expect(source).not.toContain('from "@rtb/engineering-review"');
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("CREATE TABLE");
    expect(scanAnalysisFormulaBypass("stage-transition-request.ts", source)).toEqual([]);
    expect(doc).toContain("EOS-D1N-R5-HUMAN-DECISION-AND-REVIEW-GATE-INTEGRATION");
    expect(doc).not.toContain("```");
    expect(existsSync(join(root, D1N_R4_PARENT_ARCHITECTURE_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R4_R1_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R4_R2_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R4_R3_CLOSEOUT_PATH))).toBe(true);
    expect(index).toContain("recordTransitionRequest");
    expect(index.match(/D1N_R4_CANONICAL_PHASE/g)).toHaveLength(1);
    expect(capability).toContain("D1N.R4.STAGE_TRANSITION_REQUEST_GOVERNANCE");
  });
});
