import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE,
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_CAN_ADVANCE_DESIGN_PROGRESSION_STATE,
  AI_CAN_APPROVE_STAGE_TRANSITION,
  AI_CAN_ASSIGN_AUTHORITATIVE_DESIGN_PROGRESSION_STATE,
  AI_CAN_INFER_AUTHORITATIVE_DESIGN_PROGRESSION_STATE,
  AI_CAN_MARK_PROGRESSION_PREREQUISITES_SATISFIED,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AUTOMATIC_DESIGN_PROGRESSION_RUNTIME_COUNT,
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
  D1N_DESIGN_PROGRESSION_CONTEXT_RUNTIME_COUNT,
  D1N_DESIGN_PROGRESSION_CONTEXT_RUNTIME_IMPLEMENTED,
  D1N_DESIGN_PROGRESSION_FINGERPRINT_IMPLEMENTED,
  D1N_DESIGN_PROGRESSION_HISTORY_PRESERVED,
  D1N_DESIGN_PROGRESSION_PROVENANCE_PRESERVED,
  D1N_DESIGN_PROGRESSION_PROVENANCE_REQUIRED,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_DESIGN_PROGRESSION_STATE_ALLOWLIST,
  D1N_DESIGN_PROGRESSION_STATE_ALLOWLIST_IMPLEMENTED,
  D1N_DUPLICATE_DESIGN_PROGRESSION_CONTEXT_GOVERNED,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_EVIDENCE_GAP_RUNTIME_COUNT,
  D1N_HANDOFF_INTEGRATION_RUNTIME_READY,
  D1N_HUMAN_DECISION_GATE_RUNTIME_COUNT,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_NEXT_ACTION_RUNTIME_COUNT,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_COUNT,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_PROGRESSION_CONTEXT_AUTHORITY,
  D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY,
  D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_ENGINEERING_VALIDATION_AUTHORITY,
  D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_STAGE_APPROVAL_AUTHORITY,
  D1N_PROGRESSION_CONTEXT_AUTHORITY_PRESERVED,
  D1N_R1_ORCHESTRATION_CONTEXT_REUSED,
  D1N_R2_C10_DEBT,
  D1N_R2_CLOSEOUT_PATH,
  D1N_R2_D1F_DEBT,
  D1N_R2_D1G_BLOCKER_PRESERVED,
  D1N_R2_D1G_DEBT,
  D1N_R2_D1H_DEBT,
  D1N_R2_D1I_DEBT,
  D1N_R2_D1J_DEBT,
  D1N_R2_D1K_DEBT,
  D1N_R2_D1L_DEBT,
  D1N_R2_DATABASE_SCHEMA_CHANGED,
  D1N_R2_DEBT_PRESERVED,
  D1N_R2_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R2_MACHINE_READABLE_ROADMAP_UPDATED,
  D1N_R2_MATURITY_STATE,
  D1N_R2_NEW_DEPENDENCY_ADDED,
  D1N_R2_PARENT_ARCHITECTURE_PATH,
  D1N_R2_POST_D1J_DEBT_LEDGER,
  D1N_R2_R1_CLOSEOUT_PATH,
  D1N_R2_READY_FOR_NEXT_PHASE,
  D1N_R2_SCOPE,
  D1N_R2_STATUS,
  D1N_R2_STRUCTURAL_PACK_COMPLETE,
  D1N_R3_CANONICAL_PHASE,
  D1N_R3_CANONICAL_SCOPE,
  D1N_R3_PHASE_TYPE,
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
  DESIGN_PROGRESSION_STATE_AUTO_INFERRED,
  DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_CERTIFIED,
  DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_ENGINEERING_APPROVED,
  DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_ENGINEERING_VALIDATED,
  DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_PREREQUISITES_SATISFIED,
  DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_STAGE_TRANSITION_APPROVED,
  EXACT_ORCHESTRATION_CONTEXT_REFERENCE_REQUIRED,
  FINGERPRINT_VERIFIED_EQUALS_CERTIFIED,
  FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED,
  FINGERPRINT_VERIFIED_EQUALS_STAGE_APPROVED,
  FLOATING_ORCHESTRATION_CONTEXT_REFERENCE_ALLOWED,
  FREEFORM_AUTHORITATIVE_DESIGN_PROGRESSION_STATE_ALLOWED,
  LIFECYCLE_STAGE_EQUALS_D1N_DESIGN_PROGRESSION_STATE,
  LIFECYCLE_TO_D1N_STAGE_AUTO_MAPPING_RUNTIME_COUNT,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  PARALLEL_D1N_ORCHESTRATION_CONTEXT_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_DESIGN_PROGRESSION_STATE_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_PROGRESSION_SCOPE_ENFORCED,
  UNKNOWN_DESIGN_PROGRESSION_STATE_AUTO_ACCEPTED,
  advanceDesignProgression,
  approveStageTransition,
  assessPrerequisites,
  certifyProgression,
  createD1nR2Store,
  executeHumanGate,
  inferDesignProgressionState,
  mapLifecycleStageToProgression,
  mutateDesignProgression,
  recordDesignProgression,
  reconstructDesignProgression,
  requestStageTransition,
  selectAlternative,
  validateEngineering,
  type D1nR2Input,
} from "./design-progression-context";
import {
  D1N_CONTEXT_AUTHORITY,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY as R1_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_R2_CANONICAL_PHASE,
  D1N_R2_CANONICAL_SCOPE,
  D1N_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  createD1nR1Store,
  recordOrchestrationContext,
  type D1nR1Actor,
  type D1nR1Record,
  type D1nR1Store,
} from "./orchestration-context";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../../..");
const debt = "DOES_NOT_BLOCK_D1N_BUT_REMAINS_LIMITATION";
const stages = ["CONCEPT", "PREFEASIBILITY", "FEASIBILITY", "FEED", "DETAILED_DESIGN"] as const;

const actor: D1nR1Actor = {
  actorId: "recorder-1",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "ORCHESTRATION_CONTEXT_AUTHORITY",
};

function prepared(citedLifecycleStage = "FEASIBILITY") {
  const orchestration: D1nR1Store = createD1nR1Store([
    { id: "member-1", kind: "MEMBER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" },
    { id: "member-b", kind: "MEMBER", tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" },
  ]);
  const context = recordOrchestrationContext(orchestration, actor, {
    contextId: "ctx-1",
    structuralIdentityId: "member-1",
    citedLifecycleStage,
    provenanceRef: "prov-ctx",
  });
  return { orchestration, progression: createD1nR2Store(), context };
}

function progressionInput(context: D1nR1Record, overrides: Partial<D1nR2Input> = {}): D1nR2Input {
  return {
    progressionId: "prog-1",
    orchestrationContextId: context.contextId,
    orchestrationContextFingerprint: context.fingerprint,
    designProgressionState: "CONCEPT",
    provenanceRef: "prov-prog",
    ...overrides,
  };
}

describe("EOS-D1N-R2 design progression context", () => {
  it("records an explicit allowlisted stage on an exact R1 context without inferring it", () => {
    expect([...D1N_DESIGN_PROGRESSION_STATE_ALLOWLIST]).toEqual([...stages]);
    for (const stage of stages) {
      const { orchestration, progression, context } = prepared();
      const record = recordDesignProgression(orchestration, progression, actor, progressionInput(context, { progressionId: `prog-${stage}`, designProgressionState: stage }));
      expect(record.designProgressionState).toBe(stage);
      expect(record.orchestrationContextId).toBe(context.contextId);
      expect(record.orchestrationContextFingerprint).toBe(context.fingerprint);
      expect(record.citedLifecycleStage).toBe("FEASIBILITY");
      expect(record.lifecycleStageIsProgressionState).toBe(false);
      expect(record.stageTransitionApproved).toBe(false);
      expect(record.prerequisitesSatisfied).toBe(false);
      expect(context.designProgressionState).toBeNull();
    }
    const same = prepared("CONCEPT");
    const matched = recordDesignProgression(same.orchestration, same.progression, actor, progressionInput(same.context, { designProgressionState: "CONCEPT" }));
    expect(matched.citedLifecycleStage).toBe("CONCEPT");
    expect(matched.lifecycleStageIsProgressionState).toBe(false);
    const { orchestration, progression, context } = prepared();
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { designProgressionState: "PRELIMINARY" }))).toThrow("DESIGN_PROGRESSION_STATE_INVALID");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { designProgressionState: "detailed design" }))).toThrow("FREEFORM_PROGRESSION_STATE_REJECTED");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { designProgressionState: undefined }))).toThrow("EXPLICIT_PROGRESSION_STATE_REQUIRED");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { orchestrationContextId: "latest context" }))).toThrow("FLOATING_ORCHESTRATION_CONTEXT_REJECTED");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { orchestrationContextId: "missing" }))).toThrow("ORCHESTRATION_CONTEXT_REQUIRED");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { orchestrationContextFingerprint: "" }))).toThrow("ORCHESTRATION_CONTEXT_FINGERPRINT_REQUIRED");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { inferStage: true }))).toThrow("PROGRESSION_INFERENCE_NOT_IN_R2");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { mapLifecycle: true }))).toThrow("LIFECYCLE_MAPPING_NOT_IN_R2");
    expect(inferDesignProgressionState).toThrow("PROGRESSION_INFERENCE_NOT_IN_R2");
    expect(mapLifecycleStageToProgression).toThrow("LIFECYCLE_MAPPING_NOT_IN_R2");
    expect(advanceDesignProgression).toThrow("AUTOMATIC_PROGRESSION_NOT_IN_R2");
    expect(D1N_DESIGN_PROGRESSION_STATE_ALLOWLIST_IMPLEMENTED).toBe(true);
    expect(FREEFORM_AUTHORITATIVE_DESIGN_PROGRESSION_STATE_ALLOWED).toBe(false);
    expect(UNKNOWN_DESIGN_PROGRESSION_STATE_AUTO_ACCEPTED).toBe(false);
    expect(D1N_R1_ORCHESTRATION_CONTEXT_REUSED).toBe(true);
    expect(PARALLEL_D1N_ORCHESTRATION_CONTEXT_CREATED).toBe(false);
    expect(EXACT_ORCHESTRATION_CONTEXT_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_ORCHESTRATION_CONTEXT_REFERENCE_ALLOWED).toBe(false);
    expect(DESIGN_PROGRESSION_STATE_AUTO_INFERRED).toBe(false);
    expect(AI_CAN_INFER_AUTHORITATIVE_DESIGN_PROGRESSION_STATE).toBe(false);
    expect(LIFECYCLE_STAGE_EQUALS_D1N_DESIGN_PROGRESSION_STATE).toBe(false);
    expect(LIFECYCLE_TO_D1N_STAGE_AUTO_MAPPING_RUNTIME_COUNT).toBe(0);
    expect(AUTOMATIC_DESIGN_PROGRESSION_RUNTIME_COUNT).toBe(0);
  });

  it("keeps a recorded stage distinct from approval, validation, and engineering authority", () => {
    const { orchestration, progression, context } = prepared();
    const detailed = recordDesignProgression(orchestration, progression, actor, progressionInput(context, { designProgressionState: "DETAILED_DESIGN" }));
    expect(detailed.stageTransitionApproved).toBe(false);
    expect(detailed.prerequisitesSatisfied).toBe(false);
    expect(detailed.engineeringValidated).toBe(false);
    expect(detailed.engineeringApproved).toBe(false);
    expect(detailed.certified).toBe(false);
    expect(detailed.authority).toBe(D1N_CONTEXT_AUTHORITY);
    expect(detailed.authority).toBe(D1N_PROGRESSION_CONTEXT_AUTHORITY);
    expect(() => recordDesignProgression(orchestration, createD1nR2Store(), { ...actor, authority: "STAGE_APPROVAL_AUTHORITY" }, progressionInput(context))).toThrow("PROGRESSION_AUTHORITY_NOT_STAGE_APPROVAL");
    expect(() => recordDesignProgression(orchestration, createD1nR2Store(), { ...actor, authority: "ENGINEERING_APPROVAL_AUTHORITY" }, progressionInput(context))).toThrow("PROGRESSION_AUTHORITY_NOT_ENGINEERING_APPROVAL");
    expect(() => recordDesignProgression(orchestration, createD1nR2Store(), { ...actor, authority: "ENGINEERING_VALIDATION_AUTHORITY" }, progressionInput(context))).toThrow("PROGRESSION_AUTHORITY_NOT_ENGINEERING_VALIDATION");
    expect(() => recordDesignProgression(orchestration, createD1nR2Store(), { ...actor, authority: "CERTIFICATION_AUTHORITY" }, progressionInput(context))).toThrow("PROGRESSION_AUTHORITY_NOT_CERTIFIER");
    expect(() => recordDesignProgression(orchestration, createD1nR2Store(), { ...actor, actorId: "AI_ASSISTANT" }, progressionInput(context))).toThrow("AI_NOT_PROGRESSION_AUTHORITY");
    expect(() => recordDesignProgression(orchestration, createD1nR2Store(), { ...actor, authority: "LLM_OPERATOR" }, progressionInput(context))).toThrow("AI_NOT_PROGRESSION_AUTHORITY");
    expect(() => recordDesignProgression(orchestration, createD1nR2Store(), { ...actor, authority: "ADMINISTRATOR" }, progressionInput(context))).toThrow("ADMIN_NOT_PROGRESSION_AUTHORITY");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { progressionId: "prog-ai", designProgressionState: "AI_FEED" }))).toThrow("AI_NOT_PROGRESSION_AUTHORITY");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { prerequisitesSatisfied: true }))).toThrow("PREREQUISITE_NOT_IN_R2");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { stageTransitionApproved: true }))).toThrow("STAGE_APPROVAL_NOT_IN_R2");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { engineeringValidated: true }))).toThrow("ENGINEERING_VALIDATION_NOT_IN_R2");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { engineeringApproved: true }))).toThrow("ENGINEERING_APPROVAL_NOT_IN_R2");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { certified: true }))).toThrow("CERTIFICATION_NOT_IN_R2");
    expect(assessPrerequisites).toThrow("PREREQUISITE_NOT_IN_R2");
    expect(requestStageTransition).toThrow("STAGE_TRANSITION_NOT_IN_R2");
    expect(approveStageTransition).toThrow("STAGE_APPROVAL_NOT_IN_R2");
    expect(executeHumanGate).toThrow("HUMAN_GATE_NOT_IN_R2");
    expect(selectAlternative).toThrow("ALTERNATIVE_SELECTION_NOT_IN_R2");
    expect(validateEngineering).toThrow("ENGINEERING_VALIDATION_NOT_IN_R2");
    expect(certifyProgression).toThrow("CERTIFICATION_NOT_IN_R2");
    expect(DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_STAGE_TRANSITION_APPROVED).toBe(false);
    expect(DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_PREREQUISITES_SATISFIED).toBe(false);
    expect(DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(DESIGN_PROGRESSION_STATE_RECORDED_EQUALS_CERTIFIED).toBe(false);
    expect(D1N_PROGRESSION_CONTEXT_AUTHORITY_PRESERVED).toBe(true);
    expect(D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_STAGE_APPROVAL_AUTHORITY).toBe(false);
    expect(D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY).toBe(false);
    expect(D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_ENGINEERING_VALIDATION_AUTHORITY).toBe(false);
    expect(D1N_PROGRESSION_CONTEXT_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(AI_CAN_ASSIGN_AUTHORITATIVE_DESIGN_PROGRESSION_STATE).toBe(false);
    expect(AI_CAN_ADVANCE_DESIGN_PROGRESSION_STATE).toBe(false);
    expect(AI_CAN_MARK_PROGRESSION_PREREQUISITES_SATISFIED).toBe(false);
    expect(AI_CAN_APPROVE_STAGE_TRANSITION).toBe(false);
    expect(AI_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_CAN_APPROVE_STAGE_TRANSITION_BY_ROLE_ALONE).toBe(false);
  });

  it("preserves scope, provenance, fingerprint, and immutable history", () => {
    const { orchestration, progression, context } = prepared();
    const other = { ...actor, tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" };
    const foreign = recordOrchestrationContext(orchestration, other, { contextId: "ctx-b", structuralIdentityId: "member-b", citedLifecycleStage: "FEED", provenanceRef: "prov-b" });
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(foreign))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { tenantId: "tenant-b" }))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { workspaceId: "workspace-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { projectId: "project-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { provenanceRef: "" }))).toThrow("MISSING_PROVENANCE");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { orchestrationContextFingerprint: "substituted" }))).toThrow("ORCHESTRATION_CONTEXT_FINGERPRINT_MISMATCH");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { structuralIdentityId: "member-b" }))).toThrow("STRUCTURAL_IDENTITY_MISMATCH");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { citedLifecycleStage: "FEED" }))).toThrow("LIFECYCLE_CITATION_MISMATCH");
    const record = recordDesignProgression(orchestration, progression, actor, progressionInput(context));
    const expected = fingerprintCanonical({
      authority: D1N_PROGRESSION_CONTEXT_AUTHORITY,
      progressionId: "prog-1",
      designProgressionState: "CONCEPT",
      provenanceRef: "prov-prog",
      orchestrationContextFingerprint: context.fingerprint,
      projectId: "project-a",
      workspaceId: "workspace-a",
      tenantId: "tenant-a",
      structuralIdentityId: "member-1",
      orchestrationContextId: "ctx-1",
      predecessorProgressionId: null,
    });
    expect(record.fingerprint).toBe(expected);
    expect(recordDesignProgression(orchestration, progression, actor, progressionInput(context)).fingerprint).toBe(record.fingerprint);
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { assertedFingerprint: "substituted" }))).toThrow("FINGERPRINT_MISMATCH");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { designProgressionState: "FEED" }))).toThrow("PROGRESSION_ALREADY_RECORDED");
    expect(() => recordDesignProgression(orchestration, progression, actor, progressionInput(context, { progressionId: "prog-dup" }))).toThrow("DUPLICATE_PROGRESSION_REJECTED");
    const successor = recordDesignProgression(orchestration, progression, actor, progressionInput(context, { progressionId: "prog-2", designProgressionState: "FEED", provenanceRef: "prov-2", predecessorProgressionId: "prog-1" }));
    expect(successor.designProgressionState).toBe("FEED");
    expect(successor.stageTransitionApproved).toBe(false);
    expect(successor.prerequisitesSatisfied).toBe(false);
    const prior = reconstructDesignProgression(progression, "prog-1");
    expect(prior.designProgressionState).toBe("CONCEPT");
    expect(prior.recordStatus).toBe("SUPERSEDED");
    expect(prior.fingerprint).toBe(record.fingerprint);
    expect(prior.provenanceRef).toBe("prov-prog");
    expect(progression.history.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED"]);
    expect(Object.isFrozen(successor)).toBe(true);
    expect(() => mutateDesignProgression()).toThrow("PROGRESSION_MUTATION_REJECTED");
    expect(() => {
      (successor as { designProgressionState: string }).designProgressionState = "DETAILED_DESIGN";
    }).toThrow();
    expect(successor.designProgressionState).toBe("FEED");
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1N_DESIGN_PROGRESSION_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(FINGERPRINT_VERIFIED_EQUALS_STAGE_APPROVED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_CERTIFIED).toBe(false);
    expect(SILENT_DESIGN_PROGRESSION_STATE_MUTATION_ALLOWED).toBe(false);
    expect(D1N_DESIGN_PROGRESSION_HISTORY_PRESERVED).toBe(true);
    expect(D1N_DUPLICATE_DESIGN_PROGRESSION_CONTEXT_GOVERNED).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_PROVENANCE_REQUIRED).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_PROVENANCE_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_PROGRESSION_SCOPE_ENFORCED).toBe(true);
  });

  it("keeps the consolidated boundary, debt, and next phase unchanged", () => {
    expect(D1N_RUNTIME_STARTED).toBe(true);
    expect(D1N_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R1_DESIGN_PROGRESSION_RUNTIME_READY).toBe(false);
    expect(D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_RUNTIME_READY).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D1N_ARCHITECTURE_DEFINED).toBe(true);
    expect(D1N_ARCHITECTURE_READY).toBe(true);
    expect(D1N_PREREQUISITE_RUNTIME_READY).toBe(false);
    expect(D1N_STAGE_TRANSITION_RUNTIME_READY).toBe(false);
    expect(D1N_HUMAN_GATE_RUNTIME_READY).toBe(false);
    expect(D1N_ALTERNATIVE_BRANCH_RUNTIME_READY).toBe(false);
    expect(D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY).toBe(false);
    expect(D1N_HANDOFF_INTEGRATION_RUNTIME_READY).toBe(false);
    expect([
      D1N_PREREQUISITE_RUNTIME_COUNT,
      D1N_EVIDENCE_GAP_RUNTIME_COUNT,
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
    expect(D1N_R2_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1N_R2_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1N_R2_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect([D1N_R2_C10_DEBT, D1N_R2_D1F_DEBT, D1N_R2_D1G_DEBT, D1N_R2_D1H_DEBT, D1N_R2_D1I_DEBT, D1N_R2_D1J_DEBT, D1N_R2_D1K_DEBT, D1N_R2_D1L_DEBT].every((row) => row === debt)).toBe(true);
    expect(D1N_R2_DEBT_PRESERVED).toBe(true);
    expect(D1N_R2_POST_D1J_DEBT_LEDGER).toContain("NOT_AVAILABLE");
    expect(D1N_R2_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1N_R2_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1N_R2_STATUS).toBe("DESIGN_PROGRESSION_CONTEXT_IMPLEMENTED");
    expect(D1N_R2_MATURITY_STATE).toBe("STRUCTURAL_DESIGN_PROGRESSION_CONTEXT_IMPLEMENTED");
    expect(D1N_R2_SCOPE).toBe(D1N_R2_CANONICAL_SCOPE);
    expect(D1N_R2_CANONICAL_PHASE).toBe("EOS-D1N-R2-DESIGN-PROGRESSION-CONTEXT");
    expect(D1N_R3_CANONICAL_PHASE).toBe("EOS-D1N-R3-PREREQUISITE-ASSESSMENT-AND-EVIDENCE-GAPS");
    expect(D1N_R3_PHASE_TYPE).toBe("PREREQUISITE_ASSESSMENT_AND_EVIDENCE_GAPS");
    expect(D1N_R3_CANONICAL_SCOPE).toContain("present");
    expect(D1N_R2_READY_FOR_NEXT_PHASE).toBe(true);
    expect(D1N_R2_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    const source = readFileSync(join(here, "design-progression-context.ts"), "utf8");
    const doc = readFileSync(join(root, D1N_R2_CLOSEOUT_PATH), "utf8");
    const index = readFileSync(join(here, "index.ts"), "utf8");
    const capability = readFileSync(join(root, "packages/engineering-os/src/structural-concrete/capability.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toContain("createHash");
    expect(source).not.toContain('from "@rtb/engineering-review"');
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("CREATE TABLE");
    expect(scanAnalysisFormulaBypass("design-progression-context.ts", source)).toEqual([]);
    expect(doc).toContain("EOS-D1N-R3-PREREQUISITE-ASSESSMENT-AND-EVIDENCE-GAPS");
    expect(doc).not.toContain("```");
    expect(existsSync(join(root, D1N_R2_PARENT_ARCHITECTURE_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R2_R1_CLOSEOUT_PATH))).toBe(true);
    expect(scanAnalysisFormulaBypass(D1N_R2_CLOSEOUT_PATH, doc)).toEqual([]);
    expect(index).toContain("recordDesignProgression");
    expect(index.match(/D1N_R2_CANONICAL_PHASE/g)).toHaveLength(1);
    expect(capability).toContain("D1N.R2.DESIGN_PROGRESSION_CONTEXT");
  });
});
