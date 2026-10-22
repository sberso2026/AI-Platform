import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1N_PREREQUISITE_RUNTIME_READY as R2_PREREQUISITE_READY,
  D1N_R3_CANONICAL_PHASE,
  D1N_R3_CANONICAL_SCOPE,
  D1N_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  createD1nR2Store,
  recordDesignProgression,
  type D1nR2Record,
} from "./design-progression-context";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  D1N_CONTEXT_AUTHORITY,
  createD1nR1Store,
  recordOrchestrationContext,
  type D1nR1Actor,
  type D1nR1Record,
} from "./orchestration-context";
import {
  ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE,
  ADMIN_CAN_MARK_MISSING_PREREQUISITE_PRESENT_BY_ROLE_ALONE,
  ADMIN_CAN_OVERRIDE_STALE_PREREQUISITE_BY_ROLE_ALONE,
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_CAN_APPROVE_STAGE_TRANSITION,
  AI_CAN_DECLARE_STAGE_READY,
  AI_CAN_INVENT_PREREQUISITE_SATISFACTION,
  AI_CAN_INVENT_REQUIRED_EVIDENCE,
  AI_CAN_MARK_EXTERNAL_AUTHORITY_SATISFIED,
  AI_CAN_OVERRIDE_STALE_PREREQUISITE,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  ALL_RECORDED_PREREQUISITES_PRESENT_EQUALS_STAGE_APPROVED,
  ALL_RECORDED_PREREQUISITES_PRESENT_EQUALS_STAGE_TRANSITION_AUTHORIZED,
  AVAILABLE_WITH_LIMITATIONS_EQUALS_AVAILABLE,
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
  D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
  D1N_CERTIFICATION_RUNTIME_COUNT,
  D1N_CONFORMANCE_RUNTIME_COUNT,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY,
  D1N_D1K_RUNTIME_INTEGRATION_COUNT,
  D1N_D1L_RUNTIME_INTEGRATION_COUNT,
  D1N_D1M_RUNTIME_INTEGRATION_COUNT,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_DUPLICATE_EVIDENCE_GAP_GOVERNED,
  D1N_DUPLICATE_PREREQUISITE_ASSESSMENT_GOVERNED,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_EVIDENCE_GAP_FINGERPRINT_IMPLEMENTED,
  D1N_EVIDENCE_GAP_HISTORY_PRESERVED,
  D1N_EVIDENCE_GAP_RUNTIME_COUNT,
  D1N_EVIDENCE_GAP_RUNTIME_IMPLEMENTED,
  D1N_EVIDENCE_GAP_SPOOFING_PROTECTION_IMPLEMENTED,
  D1N_HANDOFF_INTEGRATION_RUNTIME_READY,
  D1N_HUMAN_DECISION_GATE_RUNTIME_COUNT,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_NEXT_ACTION_RUNTIME_COUNT,
  D1N_NUMERICAL_STAGE_READINESS_SCORE_RUNTIME_COUNT,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_ASSESSMENT_FINGERPRINT_IMPLEMENTED,
  D1N_PREREQUISITE_ASSESSMENT_HISTORY_PRESERVED,
  D1N_PREREQUISITE_ASSESSMENT_STATUSES,
  D1N_PREREQUISITE_AUTHORITY,
  D1N_PREREQUISITE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1N_PREREQUISITE_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY,
  D1N_PREREQUISITE_AUTHORITY_EQUALS_ENGINEERING_VALIDATION_AUTHORITY,
  D1N_PREREQUISITE_AUTHORITY_EQUALS_STAGE_APPROVAL_AUTHORITY,
  D1N_PREREQUISITE_AUTHORITY_PRESERVED,
  D1N_PREREQUISITE_INPUT_CATEGORIES,
  D1N_PREREQUISITE_PROVENANCE_PRESERVED,
  D1N_PREREQUISITE_PROVENANCE_REQUIRED,
  D1N_PREREQUISITE_RUNTIME_COUNT,
  D1N_PREREQUISITE_RUNTIME_IMPLEMENTED,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_PREREQUISITE_SPOOFING_PROTECTION_IMPLEMENTED,
  D1N_PREREQUISITE_STATUS_ALLOWLIST_IMPLEMENTED,
  D1N_R1_ORCHESTRATION_CONTEXT_REUSED,
  D1N_R2_DESIGN_PROGRESSION_CONTEXT_REUSED,
  D1N_R3_C10_DEBT,
  D1N_R3_CLOSEOUT_PATH,
  D1N_R3_D1F_DEBT,
  D1N_R3_D1G_BLOCKER_PRESERVED,
  D1N_R3_D1G_DEBT,
  D1N_R3_D1H_DEBT,
  D1N_R3_D1I_DEBT,
  D1N_R3_D1J_DEBT,
  D1N_R3_D1K_DEBT,
  D1N_R3_D1L_DEBT,
  D1N_R3_DATABASE_SCHEMA_CHANGED,
  D1N_R3_DEBT_PRESERVED,
  D1N_R3_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R3_MACHINE_READABLE_ROADMAP_UPDATED,
  D1N_R3_MATURITY_STATE,
  D1N_R3_NEW_DEPENDENCY_ADDED,
  D1N_R3_PARENT_ARCHITECTURE_PATH,
  D1N_R3_POST_D1J_DEBT_LEDGER,
  D1N_R3_R1_CLOSEOUT_PATH,
  D1N_R3_R2_CLOSEOUT_PATH,
  D1N_R3_READY_FOR_NEXT_PHASE,
  D1N_R3_SCOPE,
  D1N_R3_STATUS,
  D1N_R3_STRUCTURAL_PACK_COMPLETE,
  D1N_R4_CANONICAL_PHASE,
  D1N_R4_CANONICAL_SCOPE,
  D1N_R4_PHASE_TYPE,
  D1N_REVIEW_GATE_RUNTIME_COUNT,
  D1N_RUNTIME_COUNT,
  D1N_RUNTIME_STARTED,
  D1N_SOLVER_EXECUTION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_REQUEST_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_RUNTIME_COUNT,
  D1N_STAGE_TRANSITION_RUNTIME_READY,
  D1N_STRUCTURAL_CALCULATION_AUTHORSHIP_RUNTIME_COUNT,
  D2_D8_RUNTIME_COUNT,
  D2_D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  EVIDENCE_GAP_EQUALS_CERTIFICATION_FAILURE,
  EVIDENCE_GAP_EQUALS_DESIGN_REJECTION,
  EVIDENCE_GAP_EQUALS_ENGINEERING_FAILURE,
  EVIDENCE_GAP_EQUALS_STAGE_TRANSITION_DENIED,
  EXACT_R1_CONTEXT_REFERENCE_REQUIRED,
  EXACT_R2_PROGRESSION_REFERENCE_REQUIRED,
  FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED,
  FINGERPRINT_VERIFIED_EQUALS_PREREQUISITE_CORRECT,
  FINGERPRINT_VERIFIED_EQUALS_STAGE_READY,
  FLOATING_R1_CONTEXT_REFERENCE_ALLOWED,
  FLOATING_R2_PROGRESSION_REFERENCE_ALLOWED,
  FREEFORM_AUTHORITATIVE_PREREQUISITE_STATUS_ALLOWED,
  MISSING_REQUIRED_INPUT_AUTO_INVENTED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  PREREQUISITE_ASSESSMENT_COMPLETE_EQUALS_STAGE_READY,
  PREREQUISITE_MISSING_EQUALS_ENGINEERING_INCORRECT,
  PREREQUISITE_PRESENT_EQUALS_ENGINEERING_APPROVED,
  PREREQUISITE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  R3_CAN_INVENT_STALENESS,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_PREREQUISITE_ASSESSMENT_MUTATION_ALLOWED,
  STALE_PREREQUISITE_EQUALS_ENGINEERING_INCORRECT,
  TENANT_WORKSPACE_PROJECT_PREREQUISITE_SCOPE_ENFORCED,
  UNKNOWN_PREREQUISITE_STATUS_AUTO_ACCEPTED,
  createD1nR3Store,
  declareStageReady,
  inventRequiredEvidence,
  mutatePrerequisiteAssessment,
  recordPrerequisiteAssessment,
  reconstructEvidenceGap,
  reconstructPrerequisiteAssessment,
  requestStageTransition,
  type D1nR3Input,
} from "./prerequisite-assessment";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../../..");
const debt = "DOES_NOT_BLOCK_D1N_BUT_REMAINS_LIMITATION";
const actor: D1nR1Actor = {
  actorId: "recorder-1",
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
    citedLifecycleStage: "FEASIBILITY",
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
  return { orchestration, progressionStore, context, progression, foreignContext, foreignProgression, assessments: createD1nR3Store() };
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

describe("EOS-D1N-R3 prerequisite assessment", () => {
  it("binds an allowlisted status to the exact R1 and R2 contexts", () => {
    expect([...D1N_PREREQUISITE_ASSESSMENT_STATUSES]).toEqual(["PRESENT", "MISSING", "STALE", "EXTERNAL_AUTHORITY_REQUIRED", "AVAILABLE_WITH_LIMITATIONS"]);
    expect(D1N_PREREQUISITE_INPUT_CATEGORIES).toContain("D1M_CURRENT_HANDOFF");
    expect(D1N_PREREQUISITE_INPUT_CATEGORIES).toHaveLength(11);
    const { orchestration, progressionStore, context, progression, assessments } = prepared();
    const present = recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression));
    expect(present.orchestrationContextId).toBe(context.contextId);
    expect(present.progressionId).toBe(progression.progressionId);
    expect(present.assessmentStatus).toBe("PRESENT");
    expect(present.evidenceRef).toBe("evidence-1");
    expect(present.engineeringValidated).toBe(false);
    expect(present.engineeringApproved).toBe(false);
    expect(present.stageReady).toBe(false);
    expect(present.gapId).toBeNull();
    expect(context.designProgressionState).toBeNull();
    expect(progression.stageTransitionApproved).toBe(false);
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { orchestrationContextId: "latest orchestration" }))).toThrow("FLOATING_R1_CONTEXT_REJECTED");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { progressionId: "current progression" }))).toThrow("FLOATING_R2_PROGRESSION_REJECTED");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { assessmentId: "assess-bad", inputCategory: "ENGINEERING_VALIDATION" }))).toThrow("INPUT_CATEGORY_INVALID");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { assessmentId: "assess-free", inputCategory: "custom input" }))).toThrow("FREEFORM_INPUT_CATEGORY_REJECTED");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { assessmentId: "assess-unknown", assessmentStatus: "AVAILABLE" }))).toThrow("PREREQUISITE_STATUS_INVALID");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { assessmentId: "assess-text", assessmentStatus: "not quite present" }))).toThrow("FREEFORM_PREREQUISITE_STATUS_REJECTED");
    expect(D1N_R1_ORCHESTRATION_CONTEXT_REUSED).toBe(true);
    expect(D1N_R2_DESIGN_PROGRESSION_CONTEXT_REUSED).toBe(true);
    expect(EXACT_R1_CONTEXT_REFERENCE_REQUIRED).toBe(true);
    expect(EXACT_R2_PROGRESSION_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_R1_CONTEXT_REFERENCE_ALLOWED).toBe(false);
    expect(FLOATING_R2_PROGRESSION_REFERENCE_ALLOWED).toBe(false);
    expect(D1N_PREREQUISITE_STATUS_ALLOWLIST_IMPLEMENTED).toBe(true);
    expect(FREEFORM_AUTHORITATIVE_PREREQUISITE_STATUS_ALLOWED).toBe(false);
    expect(UNKNOWN_PREREQUISITE_STATUS_AUTO_ACCEPTED).toBe(false);
  });

  it("keeps present, missing, stale, limited, and external statuses from becoming engineering judgment", () => {
    const base = prepared();
    expect(() => recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { evidenceRef: "" }))).toThrow("PRESENT_REQUIRES_EVIDENCE");
    const missing = recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-missing", prerequisiteId: "asm-1", inputCategory: "ASSUMPTIONS", assessmentStatus: "MISSING", evidenceRef: null, gapId: "gap-missing" }));
    expect(missing.engineeringIncorrect).toBe(false);
    expect(reconstructEvidenceGap(base.assessments, "gap-missing").engineeringFailure).toBe(false);
    expect(reconstructEvidenceGap(base.assessments, "gap-missing").designRejected).toBe(false);
    expect(reconstructEvidenceGap(base.assessments, "gap-missing").transitionDenied).toBe(false);
    expect(reconstructEvidenceGap(base.assessments, "gap-missing").certificationFailure).toBe(false);
    expect(() => recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-filled", inputCategory: "DECISIONS", assessmentStatus: "MISSING", evidenceRef: "invented", gapId: "gap-filled" }))).toThrow("MISSING_EVIDENCE_NOT_INVENTED");
    expect(() => recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-fake-stale", inputCategory: "CURRENTNESS", assessmentStatus: "STALE", evidenceRef: "cur-1", citedCurrentness: "CURRENT", gapId: "gap-fake" }))).toThrow("STALENESS_NOT_CITED");
    const stale = recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-stale", prerequisiteId: "cur-1", inputCategory: "CURRENTNESS", assessmentStatus: "STALE", evidenceRef: "cur-1", citedCurrentness: "STALE", gapId: "gap-stale" }));
    expect(stale.engineeringIncorrect).toBe(false);
    expect(stale.assessmentStatus).toBe("STALE");
    const limited = recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-limited", prerequisiteId: "handoff-1", inputCategory: "D1M_CURRENT_HANDOFF", assessmentStatus: "AVAILABLE_WITH_LIMITATIONS", evidenceRef: "handoff-1", limitationRef: "handoff-not-orchestration", gapId: "gap-limited" }));
    expect(limited.fullyAvailable).toBe(false);
    const external = recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-external", prerequisiteId: "gate-1", inputCategory: "HUMAN_GATE_STATE", assessmentStatus: "EXTERNAL_AUTHORITY_REQUIRED", evidenceRef: null, externalAuthorityRef: "human-gate-authority", gapId: "gap-external" }));
    expect(external.stageApproved).toBe(false);
    expect(() => recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-full", inputCategory: "SYSTEMS", fullyAvailable: true }))).toThrow("LIMITATION_NOT_FULL_AVAILABILITY");
    expect(() => recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-score", inputCategory: "SYSTEMS", readinessScore: 0.91 }))).toThrow("STAGE_READINESS_NOT_IN_R3");
    expect(() => recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, actor, assessmentInput(base.context, base.progression, { assessmentId: "assess-ready", inputCategory: "SYSTEMS", stageReady: true }))).toThrow("STAGE_READINESS_NOT_IN_R3");
    expect(declareStageReady).toThrow("STAGE_READINESS_NOT_IN_R3");
    expect(requestStageTransition).toThrow("STAGE_TRANSITION_NOT_IN_R3");
    expect(inventRequiredEvidence).toThrow("EVIDENCE_INVENTION_NOT_IN_R3");
    expect(base.assessments.assessments.every((row) => row.stageApproved === false && row.transitionAuthorized === false)).toBe(true);
    expect(PREREQUISITE_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(PREREQUISITE_PRESENT_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(PREREQUISITE_MISSING_EQUALS_ENGINEERING_INCORRECT).toBe(false);
    expect(STALE_PREREQUISITE_EQUALS_ENGINEERING_INCORRECT).toBe(false);
    expect(AVAILABLE_WITH_LIMITATIONS_EQUALS_AVAILABLE).toBe(false);
    expect(R3_CAN_INVENT_STALENESS).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(EVIDENCE_GAP_EQUALS_ENGINEERING_FAILURE).toBe(false);
    expect(EVIDENCE_GAP_EQUALS_DESIGN_REJECTION).toBe(false);
    expect(EVIDENCE_GAP_EQUALS_STAGE_TRANSITION_DENIED).toBe(false);
    expect(EVIDENCE_GAP_EQUALS_CERTIFICATION_FAILURE).toBe(false);
    expect(MISSING_REQUIRED_INPUT_AUTO_INVENTED).toBe(false);
    expect(PREREQUISITE_ASSESSMENT_COMPLETE_EQUALS_STAGE_READY).toBe(false);
    expect(ALL_RECORDED_PREREQUISITES_PRESENT_EQUALS_STAGE_APPROVED).toBe(false);
    expect(ALL_RECORDED_PREREQUISITES_PRESENT_EQUALS_STAGE_TRANSITION_AUTHORIZED).toBe(false);
    expect(D1N_NUMERICAL_STAGE_READINESS_SCORE_RUNTIME_COUNT).toBe(0);
  });

  it("rejects spoofed scope and preserves provenance, fingerprint, and history", () => {
    const { orchestration, progressionStore, context, progression, foreignContext, foreignProgression, assessments } = prepared();
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(foreignContext, foreignProgression))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { workspaceId: "workspace-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { projectId: "project-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { provenanceRef: "" }))).toThrow("MISSING_PROVENANCE");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { orchestrationContextFingerprint: "substituted" }))).toThrow("ORCHESTRATION_CONTEXT_FINGERPRINT_MISMATCH");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { progressionFingerprint: "substituted" }))).toThrow("PROGRESSION_FINGERPRINT_MISMATCH");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, { ...actor, actorId: "AI_ASSISTANT" }, assessmentInput(context, progression))).toThrow("AI_NOT_PREREQUISITE_AUTHORITY");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, { ...actor, authority: "ADMINISTRATOR" }, assessmentInput(context, progression))).toThrow("ADMIN_NOT_PREREQUISITE_AUTHORITY");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, { ...actor, authority: "STAGE_APPROVAL_AUTHORITY" }, assessmentInput(context, progression))).toThrow("PREREQUISITE_AUTHORITY_NOT_STAGE_APPROVAL");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { evidenceRef: "AI_EVIDENCE" }))).toThrow("AI_NOT_PREREQUISITE_AUTHORITY");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { inventEvidence: true }))).toThrow("EVIDENCE_INVENTION_NOT_IN_R3");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { overrideStale: true }))).toThrow("STALE_OVERRIDE_NOT_IN_R3");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { externalAuthoritySatisfied: true }))).toThrow("EXTERNAL_AUTHORITY_SATISFACTION_NOT_IN_R3");
    const record = recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression));
    const expected = fingerprintCanonical({
      provenanceRef: "prov-assess",
      assessmentId: "assess-1",
      assessmentStatus: "PRESENT",
      evidenceRef: "evidence-1",
      externalAuthorityRef: null,
      limitationRef: null,
      citedCurrentness: "CURRENT",
      prerequisiteId: "req-1",
      inputCategory: "REQUIREMENTS",
      orchestrationContextId: context.contextId,
      orchestrationContextFingerprint: context.fingerprint,
      progressionId: progression.progressionId,
      progressionFingerprint: progression.fingerprint,
      structuralIdentityId: "member-1",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
      authority: D1N_PREREQUISITE_AUTHORITY,
      predecessorAssessmentId: null,
    });
    expect(record.fingerprint).toBe(expected);
    expect(record.authority).toBe(D1N_CONTEXT_AUTHORITY);
    expect(recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression))).toBe(record);
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { assertedFingerprint: "substituted" }))).toThrow("FINGERPRINT_MISMATCH");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { assessmentStatus: "MISSING", evidenceRef: null, gapId: "gap-conflict" }))).toThrow("ASSESSMENT_ALREADY_RECORDED");
    expect(() => recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { assessmentId: "assess-dup" }))).toThrow("DUPLICATE_ASSESSMENT_REJECTED");
    const successor = recordPrerequisiteAssessment(orchestration, progressionStore, assessments, actor, assessmentInput(context, progression, { assessmentId: "assess-2", assessmentStatus: "STALE", citedCurrentness: "STALE", gapId: "gap-2", provenanceRef: "prov-2", predecessorAssessmentId: "assess-1" }));
    expect(successor.assessmentStatus).toBe("STALE");
    expect(successor.stageApproved).toBe(false);
    const prior = reconstructPrerequisiteAssessment(assessments, "assess-1");
    expect(prior.assessmentStatus).toBe("PRESENT");
    expect(prior.recordStatus).toBe("SUPERSEDED");
    expect(prior.fingerprint).toBe(record.fingerprint);
    const gap = reconstructEvidenceGap(assessments, "gap-2");
    expect(gap.assessmentId).toBe("assess-2");
    expect(gap.engineeringFailure).toBe(false);
    expect(assessments.assessmentHistory.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED"]);
    expect(Object.isFrozen(successor)).toBe(true);
    expect(() => mutatePrerequisiteAssessment()).toThrow("ASSESSMENT_MUTATION_REJECTED");
    expect(() => {
      (successor as { assessmentStatus: string }).assessmentStatus = "PRESENT";
    }).toThrow();
    expect(successor.assessmentStatus).toBe("STALE");
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1N_PREREQUISITE_ASSESSMENT_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D1N_EVIDENCE_GAP_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(FINGERPRINT_VERIFIED_EQUALS_PREREQUISITE_CORRECT).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_STAGE_READY).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(SILENT_PREREQUISITE_ASSESSMENT_MUTATION_ALLOWED).toBe(false);
    expect(D1N_PREREQUISITE_ASSESSMENT_HISTORY_PRESERVED).toBe(true);
    expect(D1N_EVIDENCE_GAP_HISTORY_PRESERVED).toBe(true);
    expect(D1N_DUPLICATE_PREREQUISITE_ASSESSMENT_GOVERNED).toBe(true);
    expect(D1N_DUPLICATE_EVIDENCE_GAP_GOVERNED).toBe(true);
    expect(D1N_PREREQUISITE_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D1N_EVIDENCE_GAP_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D1N_PREREQUISITE_PROVENANCE_REQUIRED).toBe(true);
    expect(D1N_PREREQUISITE_PROVENANCE_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_PREREQUISITE_SCOPE_ENFORCED).toBe(true);
    expect(D1N_PREREQUISITE_AUTHORITY_PRESERVED).toBe(true);
    expect(D1N_PREREQUISITE_AUTHORITY_EQUALS_STAGE_APPROVAL_AUTHORITY).toBe(false);
    expect(D1N_PREREQUISITE_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY).toBe(false);
    expect(D1N_PREREQUISITE_AUTHORITY_EQUALS_ENGINEERING_VALIDATION_AUTHORITY).toBe(false);
    expect(D1N_PREREQUISITE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_REQUIRED_EVIDENCE).toBe(false);
    expect(AI_CAN_INVENT_PREREQUISITE_SATISFACTION).toBe(false);
    expect(AI_CAN_OVERRIDE_STALE_PREREQUISITE).toBe(false);
    expect(AI_CAN_MARK_EXTERNAL_AUTHORITY_SATISFIED).toBe(false);
    expect(AI_CAN_DECLARE_STAGE_READY).toBe(false);
    expect(AI_CAN_APPROVE_STAGE_TRANSITION).toBe(false);
    expect(AI_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_CAN_MARK_MISSING_PREREQUISITE_PRESENT_BY_ROLE_ALONE).toBe(false);
    expect(ADMIN_CAN_OVERRIDE_STALE_PREREQUISITE_BY_ROLE_ALONE).toBe(false);
    expect(ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE).toBe(false);
  });

  it("keeps the consolidated boundary, debt, and next phase unchanged", () => {
    expect(D1N_RUNTIME_STARTED).toBe(true);
    expect(D1N_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R2_PREREQUISITE_READY).toBe(false);
    expect(D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_RUNTIME_READY).toBe(true);
    expect(D1N_PREREQUISITE_RUNTIME_READY).toBe(true);
    expect(D1N_PREREQUISITE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1N_PREREQUISITE_RUNTIME_COUNT).toBe(1);
    expect(D1N_EVIDENCE_GAP_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1N_EVIDENCE_GAP_RUNTIME_COUNT).toBe(1);
    expect(D1N_STAGE_TRANSITION_RUNTIME_READY).toBe(false);
    expect(D1N_HUMAN_GATE_RUNTIME_READY).toBe(false);
    expect(D1N_ALTERNATIVE_BRANCH_RUNTIME_READY).toBe(false);
    expect(D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY).toBe(false);
    expect(D1N_HANDOFF_INTEGRATION_RUNTIME_READY).toBe(false);
    expect([
      D1N_NEXT_ACTION_RUNTIME_COUNT,
      D1N_STAGE_TRANSITION_REQUEST_RUNTIME_COUNT,
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
    expect(D1N_R3_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1N_R3_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1N_R3_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect([D1N_R3_C10_DEBT, D1N_R3_D1F_DEBT, D1N_R3_D1G_DEBT, D1N_R3_D1H_DEBT, D1N_R3_D1I_DEBT, D1N_R3_D1J_DEBT, D1N_R3_D1K_DEBT, D1N_R3_D1L_DEBT].every((row) => row === debt)).toBe(true);
    expect(D1N_R3_DEBT_PRESERVED).toBe(true);
    expect(D1N_R3_POST_D1J_DEBT_LEDGER).toContain("NOT_AVAILABLE");
    expect(D1N_R3_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1N_R3_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1N_R3_STATUS).toBe("PREREQUISITE_ASSESSMENT_IMPLEMENTED");
    expect(D1N_R3_MATURITY_STATE).toBe("STRUCTURAL_PREREQUISITE_ASSESSMENT_AND_EVIDENCE_GAPS_IMPLEMENTED");
    expect(D1N_R3_SCOPE).toBe(D1N_R3_CANONICAL_SCOPE);
    expect(D1N_R3_CANONICAL_PHASE).toBe("EOS-D1N-R3-PREREQUISITE-ASSESSMENT-AND-EVIDENCE-GAPS");
    expect(D1N_R4_CANONICAL_PHASE).toBe("EOS-D1N-R4-STAGE-TRANSITION-REQUEST-GOVERNANCE");
    expect(D1N_R4_PHASE_TYPE).toBe("STAGE_TRANSITION_REQUEST_GOVERNANCE");
    expect(D1N_R4_CANONICAL_SCOPE).toContain("requested destination");
    expect(D1N_R3_READY_FOR_NEXT_PHASE).toBe(true);
    expect(D1N_R3_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    const source = readFileSync(join(here, "prerequisite-assessment.ts"), "utf8");
    const doc = readFileSync(join(root, D1N_R3_CLOSEOUT_PATH), "utf8");
    const index = readFileSync(join(here, "index.ts"), "utf8");
    const capability = readFileSync(join(root, "packages/engineering-os/src/structural-concrete/capability.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toContain("createHash");
    expect(source).not.toContain('from "@rtb/engineering-review"');
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("CREATE TABLE");
    expect(scanAnalysisFormulaBypass("prerequisite-assessment.ts", source)).toEqual([]);
    expect(doc).toContain("EOS-D1N-R4-STAGE-TRANSITION-REQUEST-GOVERNANCE");
    expect(doc).not.toContain("```");
    expect(existsSync(join(root, D1N_R3_PARENT_ARCHITECTURE_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R3_R1_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R3_R2_CLOSEOUT_PATH))).toBe(true);
    expect(index).toContain("recordPrerequisiteAssessment");
    expect(index.match(/D1N_R3_CANONICAL_PHASE/g)).toHaveLength(1);
    expect(capability).toContain("D1N.R3.PREREQUISITE_ASSESSMENT_AND_EVIDENCE_GAPS");
  });
});
