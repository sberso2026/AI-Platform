import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ADMIN_CAN_BYPASS_BRANCH_GOVERNANCE,
  ADMIN_CAN_REWRITE_BRANCH_SELECTION_DECISION,
  ADMIN_CAN_SELECT_BEST_ALTERNATIVE_BY_ROLE_ALONE,
  ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY,
  AI_CAN_AUTHORITATIVELY_SELECT_BEST_ALTERNATIVE,
  AI_CAN_INVENT_BRANCH_ASSUMPTIONS,
  AI_CAN_INVENT_BRANCH_ENGINEERING_EVIDENCE,
  AI_CAN_MARK_BRANCH_CERTIFIED,
  AI_CAN_MARK_BRANCH_ENGINEERING_VALIDATED,
  AI_EQUALS_D1N_ENGINEERING_AUTHORITY,
  ALTERNATIVE_BRANCH_CREATED_EQUALS_PROGRESSION_CHANGED,
  AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT,
  BRANCH_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE,
  BRANCH_AUTO_REPOINTED_TO_NEWER_ASSUMPTION,
  BRANCH_AUTO_REPOINTED_TO_NEWER_DECISION,
  BRANCH_AUTO_REPOINTED_TO_NEWER_EVIDENCE,
  BRANCH_NOT_SELECTED_EQUALS_CERTIFICATION_FAILED,
  BRANCH_NOT_SELECTED_EQUALS_ENGINEERING_INVALID,
  BRANCH_NOT_SELECTED_EQUALS_ENGINEERING_NONCOMPLIANT,
  BRANCH_SELECTED_EQUALS_CERTIFIED,
  BRANCH_SELECTED_EQUALS_CONFORMANT,
  BRANCH_SELECTED_EQUALS_ENGINEERING_APPROVED,
  BRANCH_SELECTED_EQUALS_ENGINEERING_VALIDATED,
  BRANCH_SELECTION_REFERENCE_EQUALS_D1N_SELECTED_BEST_DESIGN,
  BRANCH_SELECTION_REFERENCE_EQUALS_ENGINEERING_APPROVED,
  BRANCH_SELECTION_REFERENCE_EQUALS_ENGINEERING_VALIDATED,
  CANONICAL_ASSUMPTION_REFERENCES_REUSED,
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
  D1N_ALTERNATIVE_BRANCH_FINGERPRINT_IMPLEMENTED,
  D1N_ALTERNATIVE_BRANCH_HISTORY_PRESERVED,
  D1N_ALTERNATIVE_BRANCH_LINEAGE_IMPLEMENTED,
  D1N_ALTERNATIVE_BRANCH_PROVENANCE_PRESERVED,
  D1N_ALTERNATIVE_BRANCH_PROVENANCE_REQUIRED,
  D1N_ALTERNATIVE_BRANCH_REPLAY_GOVERNED,
  D1N_ALTERNATIVE_BRANCH_RUNTIME_COUNT,
  D1N_ALTERNATIVE_BRANCH_RUNTIME_IMPLEMENTED,
  D1N_ALTERNATIVE_BRANCH_RUNTIME_READY,
  D1N_ALTERNATIVE_BRANCH_SPOOFING_PROTECTION_IMPLEMENTED,
  D1N_ARCHITECTURE_DEFINED,
  D1N_ARCHITECTURE_READY,
  D1N_AUTHORITATIVE_ALTERNATIVE_RANKING_RUNTIME_COUNT,
  D1N_AUTOMATIC_DESIGN_VARIANT_GENERATION_RUNTIME_COUNT,
  D1N_AUTOMATIC_STRUCTURAL_MODIFICATION_RUNTIME_COUNT,
  D1N_BRANCH_ENGINEERING_EVIDENCE_AUTHORSHIP_RUNTIME_COUNT,
  D1N_BRANCH_RECORD_STATES,
  D1N_BRANCH_SELECTION_DECISION_REFERENCE_IMPLEMENTED,
  D1N_BRANCH_SELECTION_REQUIRES_GOVERNED_DECISION_REFERENCE,
  D1N_CAD_BIM_INTERPRETATION_RUNTIME_COUNT,
  D1N_CAN_AUTHORITATIVELY_SELECT_BEST_ALTERNATIVE,
  D1N_CERTIFICATION_RUNTIME_COUNT,
  D1N_CONFORMANCE_RUNTIME_COUNT,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT,
  D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY,
  D1N_D1K_RUNTIME_INTEGRATION_COUNT,
  D1N_D1L_RUNTIME_INTEGRATION_COUNT,
  D1N_D1M_RUNTIME_INTEGRATION_COUNT,
  D1N_DESIGN_PROGRESSION_RUNTIME_READY,
  D1N_DUPLICATE_ALTERNATIVE_BRANCH_GOVERNED,
  D1N_ENGINEERING_APPROVAL_RUNTIME_COUNT,
  D1N_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D1N_HANDOFF_INTEGRATION_RUNTIME_READY,
  D1N_HUMAN_GATE_RUNTIME_READY,
  D1N_NUMERICAL_ALTERNATIVE_SCORE_RUNTIME_COUNT,
  D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY,
  D1N_PREREQUISITE_RUNTIME_READY,
  D1N_R1_ORCHESTRATION_CONTEXT_REUSED,
  D1N_R6_C10_DEBT,
  D1N_R6_CLOSEOUT_PATH,
  D1N_R6_D1F_DEBT,
  D1N_R6_D1G_BLOCKER_PRESERVED,
  D1N_R6_D1G_DEBT,
  D1N_R6_D1H_DEBT,
  D1N_R6_D1I_DEBT,
  D1N_R6_D1J_DEBT,
  D1N_R6_D1K_DEBT,
  D1N_R6_D1L_DEBT,
  D1N_R6_DATABASE_SCHEMA_CHANGED,
  D1N_R6_DEBT_PRESERVED,
  D1N_R6_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1N_R6_MACHINE_READABLE_ROADMAP_UPDATED,
  D1N_R6_MATURITY_STATE,
  D1N_R6_NEW_DEPENDENCY_ADDED,
  D1N_R6_PARENT_ARCHITECTURE_PATH,
  D1N_R6_POST_D1J_DEBT_LEDGER,
  D1N_R6_R1_CLOSEOUT_PATH,
  D1N_R6_R2_CLOSEOUT_PATH,
  D1N_R6_R3_CLOSEOUT_PATH,
  D1N_R6_R4_CLOSEOUT_PATH,
  D1N_R6_R5_CLOSEOUT_PATH,
  D1N_R6_READY_FOR_NEXT_PHASE,
  D1N_R6_SCOPE,
  D1N_R6_STATUS,
  D1N_R6_STRUCTURAL_PACK_COMPLETE,
  D1N_R7_CANONICAL_PHASE,
  D1N_R7_CANONICAL_SCOPE,
  D1N_R7_PHASE_TYPE,
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
  EXACT_PARENT_ORCHESTRATION_CONTEXT_REQUIRED,
  EXACT_R2_PROGRESSION_REFERENCE_REQUIRED_WHERE_APPLICABLE,
  FINGERPRINT_VERIFIED_EQUALS_BRANCH_CERTIFIED,
  FINGERPRINT_VERIFIED_EQUALS_BRANCH_SELECTED,
  FINGERPRINT_VERIFIED_EQUALS_BRANCH_VALIDATED,
  FLOATING_PARENT_ORCHESTRATION_CONTEXT_ALLOWED,
  IMPLICIT_BRANCH_DERIVATION_ALLOWED,
  PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D1N_DIGITAL_THREAD_CREATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_ALTERNATIVE_BRANCH_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_ALTERNATIVE_BRANCH_SCOPE_ENFORCED,
  authorBranchEvidence,
  changeDesignProgression,
  createD1nR6Store,
  executeStageTransition,
  generateDesignVariant,
  modifyStructure,
  mutateAlternativeBranch,
  rankAlternatives,
  recordAlternativeBranch,
  reconstructAlternativeBranch,
  repointAlternativeBranch,
  selectBestAlternative,
  type D1nR6Input,
} from "./alternative-branch";
import { createD1nR2Store, recordDesignProgression, type D1nR2Record } from "./design-progression-context";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  D1N_ALTERNATIVE_BRANCH_RUNTIME_READY as R5_BRANCH_READY,
  D1N_RUNTIME_COUNT as R5_RUNTIME_COUNT,
  createD1nR5Store,
  recordHumanDecision,
  type D1nR5Input,
} from "./human-decision-record";
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
  const foreignProgression = recordDesignProgression(orchestration, progressionStore, other, {
    progressionId: "prog-b",
    orchestrationContextId: foreignContext.contextId,
    orchestrationContextFingerprint: foreignContext.fingerprint,
    designProgressionState: "FEED",
    provenanceRef: "prov-b",
  });
  const assessments = createD1nR3Store();
  const requirement = recordPrerequisiteAssessment(orchestration, progressionStore, assessments, requester, assessmentInput(context, progression));
  const assumption = recordPrerequisiteAssessment(orchestration, progressionStore, assessments, requester, assessmentInput(context, progression, {
    assessmentId: "assess-asm-1",
    prerequisiteId: "asm-span-1",
    inputCategory: "ASSUMPTIONS",
    evidenceRef: "assumption-record-1",
    provenanceRef: "prov-asm-1",
  }));
  const evidence = recordPrerequisiteAssessment(orchestration, progressionStore, assessments, requester, assessmentInput(context, progression, {
    assessmentId: "assess-ev-1",
    prerequisiteId: "ev-1",
    inputCategory: "ENGINEERING_EVIDENCE_REFERENCES",
    evidenceRef: "cited-note-1",
    provenanceRef: "prov-ev-1",
  }));
  const requests = createD1nR4Store();
  const request = recordTransitionRequest(orchestration, progressionStore, assessments, requests, requester, requestInput(context, progression, requirement.assessmentId, requirement.fingerprint));
  const decisions = createD1nR5Store();
  const decision = recordHumanDecision(requests, decisions, decider, decisionInput(request.requestId, request.fingerprint));
  return { orchestration, progressionStore, context, progression, other, foreignContext, foreignProgression, assessments, assumption, evidence, requests, request, decisions, decision, branches: createD1nR6Store() };
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
    gateId: "MAJOR_SYSTEM_SELECTION",
    outcome: "APPROVED_TO_TRANSITION",
    rationale: "Human gate cited this alternative.",
    provenanceRef: "prov-decision",
    aal: "aal2",
    ...overrides,
  };
}

function branchInput(base: ReturnType<typeof prepared>, overrides: Partial<D1nR6Input> = {}): D1nR6Input {
  return {
    branchId: "branch-portal",
    displayLabel: "Portal frame",
    orchestrationContextId: base.context.contextId,
    orchestrationContextFingerprint: base.context.fingerprint,
    progressionId: base.progression.progressionId,
    progressionFingerprint: base.progression.fingerprint,
    assumptionReferences: [{ id: base.assumption.assessmentId, fingerprint: base.assumption.fingerprint }],
    evidenceReferences: [{ id: base.evidence.assessmentId, fingerprint: base.evidence.fingerprint }],
    provenanceRef: "prov-branch",
    ...overrides,
  };
}

describe("EOS-D1N-R6 alternative branch", () => {
  it("binds branch identity to an exact parent context and explicit lineage", () => {
    expect([...D1N_BRANCH_RECORD_STATES]).toEqual(["OPEN", "DECISION_CITED", "RETAINED_HISTORICAL"]);
    expect(D1N_R1_ORCHESTRATION_CONTEXT_REUSED).toBe(true);
    expect(EXACT_PARENT_ORCHESTRATION_CONTEXT_REQUIRED).toBe(true);
    expect(FLOATING_PARENT_ORCHESTRATION_CONTEXT_ALLOWED).toBe(false);
    expect(EXACT_R2_PROGRESSION_REFERENCE_REQUIRED_WHERE_APPLICABLE).toBe(true);
    expect(ALTERNATIVE_BRANCH_CREATED_EQUALS_PROGRESSION_CHANGED).toBe(false);
    expect(D1N_ALTERNATIVE_BRANCH_LINEAGE_IMPLEMENTED).toBe(true);
    expect(IMPLICIT_BRANCH_DERIVATION_ALLOWED).toBe(false);
    const base = prepared();
    const before = JSON.stringify(base.progressionStore.records);
    const branch = recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base));
    expect(branch.branchId).toBe("branch-portal");
    expect(branch.displayLabel).toBe("Portal frame");
    expect(branch.orchestrationContextId).toBe(base.context.contextId);
    expect(branch.orchestrationContextFingerprint).toBe(base.context.fingerprint);
    expect(branch.progressionId).toBe(base.progression.progressionId);
    expect(branch.progressionFingerprint).toBe(base.progression.fingerprint);
    expect(branch.parentBranchId).toBeNull();
    expect(branch.branchState).toBe("OPEN");
    expect(branch.progressionChanged).toBe(false);
    expect(base.progression.designProgressionState).toBe("CONCEPT");
    expect(JSON.stringify(base.progressionStore.records)).toBe(before);
    const sibling = recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, {
      branchId: "branch-truss",
      displayLabel: "Portal frame revised",
    }));
    expect(sibling.parentBranchId).toBeNull();
    expect(sibling.branchId).not.toBe(branch.branchId);
    const derived = recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, {
      branchId: "branch-derived",
      displayLabel: "Portal frame derived",
      parentBranchId: branch.branchId,
    }));
    expect(derived.parentBranchId).toBe(branch.branchId);
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-infer", inferParent: true }))).toThrow("IMPLICIT_DERIVATION_REJECTED");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-float", orchestrationContextId: "active" }))).toThrow("FLOATING_PARENT_CONTEXT_REJECTED");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-float-r2", progressionId: "current progression" }))).toThrow("FLOATING_PROGRESSION_REJECTED");
    const foreign = recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, base.other, {
      branchId: "branch-foreign",
      displayLabel: "Foreign frame",
      orchestrationContextId: base.foreignContext.contextId,
      orchestrationContextFingerprint: base.foreignContext.fingerprint,
      progressionId: base.foreignProgression.progressionId,
      progressionFingerprint: base.foreignProgression.fingerprint,
      provenanceRef: "prov-foreign",
    });
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-cross", parentBranchId: foreign.branchId }))).toThrow("PARENT_CONTEXT_MISMATCH");
    expect(reconstructAlternativeBranch(base.branches, branch.branchId).fingerprint).toBe(branch.fingerprint);
  });

  it("cites existing assumptions and evidence without authoring either", () => {
    expect(CANONICAL_ASSUMPTION_REFERENCES_REUSED).toBe(true);
    expect(AI_CAN_INVENT_BRANCH_ASSUMPTIONS).toBe(false);
    expect(AI_CAN_INVENT_BRANCH_ENGINEERING_EVIDENCE).toBe(false);
    expect(D1N_BRANCH_ENGINEERING_EVIDENCE_AUTHORSHIP_RUNTIME_COUNT).toBe(0);
    const base = prepared();
    const laterAssumption = recordPrerequisiteAssessment(base.orchestration, base.progressionStore, base.assessments, requester, assessmentInput(base.context, base.progression, {
      assessmentId: "assess-asm-2",
      prerequisiteId: "asm-span-2",
      inputCategory: "ASSUMPTIONS",
      evidenceRef: "assumption-record-2",
      provenanceRef: "prov-asm-2",
      predecessorAssessmentId: base.assumption.assessmentId,
    }));
    const first = recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base));
    const second = recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, {
      branchId: "branch-later",
      displayLabel: "Later span",
      assumptionReferences: [{ id: laterAssumption.assessmentId, fingerprint: laterAssumption.fingerprint }],
    }));
    expect(first.assumptionReferences[0]?.assumptionId).toBe("asm-span-1");
    expect(first.assumptionReferences[0]?.fingerprint).toBe(base.assumption.fingerprint);
    expect(second.assumptionReferences[0]?.assumptionId).toBe("asm-span-2");
    expect(first.assumptionReferences[0]?.fingerprint).not.toBe(second.assumptionReferences[0]?.fingerprint);
    expect(first.evidenceReferences[0]?.evidenceId).toBe(base.evidence.assessmentId);
    expect(first.evidenceReferences[0]?.fingerprint).toBe(base.evidence.fingerprint);
    expect(BRANCH_AUTO_REPOINTED_TO_NEWER_ASSUMPTION).toBe(false);
    expect(BRANCH_AUTO_REPOINTED_TO_NEWER_EVIDENCE).toBe(false);
    expect(reconstructAlternativeBranch(base.branches, first.branchId).assumptionReferences[0]?.fingerprint).toBe(base.assumption.fingerprint);
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-invented", assumptionText: "AI span is 12 m" }))).toThrow("ASSUMPTION_AUTHORSHIP_NOT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-body", evidenceBody: "AI authored a calculation" }))).toThrow("EVIDENCE_AUTHORSHIP_NOT_IN_R6");
    expect(() => authorBranchEvidence()).toThrow("EVIDENCE_AUTHORSHIP_NOT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, {
      branchId: "branch-wrong-category",
      assumptionReferences: [{ id: base.evidence.assessmentId, fingerprint: base.evidence.fingerprint }],
    }))).toThrow("ASSUMPTION_CATEGORY_REQUIRED");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, { ...requester, actorId: "AI_ASSISTANT" }, branchInput(base, { branchId: "branch-ai" }))).toThrow("AI_NOT_BRANCH_AUTHORITY");
  });

  it("cites a governed selection without ranking, validating, or generating a design", () => {
    expect(D1N_BRANCH_SELECTION_DECISION_REFERENCE_IMPLEMENTED).toBe(true);
    expect(D1N_BRANCH_SELECTION_REQUIRES_GOVERNED_DECISION_REFERENCE).toBe(true);
    expect(BRANCH_SELECTION_REFERENCE_EQUALS_D1N_SELECTED_BEST_DESIGN).toBe(false);
    expect(BRANCH_SELECTION_REFERENCE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(BRANCH_SELECTION_REFERENCE_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(D1N_CAN_AUTHORITATIVELY_SELECT_BEST_ALTERNATIVE).toBe(false);
    expect(AI_CAN_AUTHORITATIVELY_SELECT_BEST_ALTERNATIVE).toBe(false);
    expect(ADMIN_CAN_SELECT_BEST_ALTERNATIVE_BY_ROLE_ALONE).toBe(false);
    expect(BRANCH_SELECTED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(BRANCH_SELECTED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(BRANCH_SELECTED_EQUALS_CONFORMANT).toBe(false);
    expect(BRANCH_SELECTED_EQUALS_CERTIFIED).toBe(false);
    expect(BRANCH_NOT_SELECTED_EQUALS_ENGINEERING_INVALID).toBe(false);
    expect(BRANCH_NOT_SELECTED_EQUALS_ENGINEERING_NONCOMPLIANT).toBe(false);
    expect(BRANCH_NOT_SELECTED_EQUALS_CERTIFICATION_FAILED).toBe(false);
    expect(D1N_AUTHORITATIVE_ALTERNATIVE_RANKING_RUNTIME_COUNT).toBe(0);
    expect(D1N_NUMERICAL_ALTERNATIVE_SCORE_RUNTIME_COUNT).toBe(0);
    expect(D1N_AUTOMATIC_DESIGN_VARIANT_GENERATION_RUNTIME_COUNT).toBe(0);
    expect(D1N_AUTOMATIC_STRUCTURAL_MODIFICATION_RUNTIME_COUNT).toBe(0);
    const base = prepared();
    const before = JSON.stringify(base.progressionStore.records);
    const selected = recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, {
      selectionDecisionId: base.decision.decisionId,
      selectionDecisionFingerprint: base.decision.fingerprint,
      decisionReferences: [{ id: base.decision.decisionId, fingerprint: base.decision.fingerprint }],
    }));
    expect(selected.branchState).toBe("DECISION_CITED");
    expect(selected.selectionDecisionId).toBe(base.decision.decisionId);
    expect(selected.selectedByGovernedDecision).toBe(true);
    expect(selected.decisionReferences[0]?.outcome).toBe("APPROVED_TO_TRANSITION");
    expect(selected.technicallyBest).toBe(false);
    expect(selected.engineeringValidated).toBe(false);
    expect(selected.engineeringApproved).toBe(false);
    expect(selected.conformant).toBe(false);
    expect(selected.certified).toBe(false);
    expect(selected.progressionChanged).toBe(false);
    expect(base.decision.aal).toBe("aal2");
    expect(base.progression.designProgressionState).toBe("CONCEPT");
    expect(JSON.stringify(base.progressionStore.records)).toBe(before);
    const declinedBase = prepared();
    const declinedDecision = recordHumanDecision(declinedBase.requests, declinedBase.decisions, decider, decisionInput(declinedBase.request.requestId, declinedBase.request.fingerprint, {
      decisionId: "decision-declined",
      outcome: "NOT_APPROVED",
      rationale: "Held for a commercial reason.",
      provenanceRef: "prov-decision-declined",
      predecessorDecisionId: declinedBase.decision.decisionId,
    }));
    const declined = recordAlternativeBranch(declinedBase.orchestration, declinedBase.progressionStore, declinedBase.assessments, declinedBase.decisions, declinedBase.branches, requester, branchInput(declinedBase, {
      branchId: "branch-declined",
      selectionDecisionId: declinedDecision.decisionId,
      selectionDecisionFingerprint: declinedDecision.fingerprint,
    }));
    expect(declined.selectedByGovernedDecision).toBe(false);
    expect(declined.engineeringInvalid).toBe(false);
    expect(declined.branchState).toBe("DECISION_CITED");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-best", selectBest: true }))).toThrow("BEST_SELECTION_NOT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-rank", rank: 1 }))).toThrow("RANKING_NOT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-score", score: 0.91 }))).toThrow("ALTERNATIVE_SCORE_NOT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-label", displayLabel: "best option" }))).toThrow("AUTHORITATIVE_BRANCH_LABEL_REJECTED");
    expect(() => selectBestAlternative()).toThrow("BEST_SELECTION_NOT_IN_R6");
    expect(() => rankAlternatives()).toThrow("RANKING_NOT_IN_R6");
    expect(() => generateDesignVariant()).toThrow("DESIGN_VARIANT_GENERATION_NOT_IN_R6");
    expect(() => modifyStructure()).toThrow("STRUCTURAL_MODIFICATION_NOT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-gen", generateVariant: true }))).toThrow("DESIGN_VARIANT_GENERATION_NOT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-mod", modifyStructure: true }))).toThrow("STRUCTURAL_MODIFICATION_NOT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-calc", solverExecution: true }))).toThrow("SOLVER_NOT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, { ...requester, authority: "ADMIN" }, branchInput(base, { branchId: "branch-admin" }))).toThrow("ADMIN_NOT_BRANCH_AUTHORITY");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, decider, branchInput(base, { branchId: "branch-decider" }))).toThrow("DECISION_AUTHORITY_DOES_NOT_SELECT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, { ...requester, actorId: "AI reviewer" }, branchInput(base, { branchId: "branch-ai-select" }))).toThrow("AI_NOT_BRANCH_AUTHORITY");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-valid", engineeringValidated: true }))).toThrow("ENGINEERING_VALIDATION_NOT_IN_R6");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, { branchId: "branch-cert", certified: true }))).toThrow("CERTIFICATION_NOT_IN_R6");
    expect(AI_CAN_MARK_BRANCH_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_CAN_MARK_BRANCH_CERTIFIED).toBe(false);
    expect(AI_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D1N_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_CAN_REWRITE_BRANCH_SELECTION_DECISION).toBe(false);
    expect(ADMIN_CAN_BYPASS_BRANCH_GOVERNANCE).toBe(false);
  });

  it("preserves provenance, fingerprint, history, scope, and the R6 boundary", () => {
    expect(TENANT_WORKSPACE_PROJECT_ALTERNATIVE_BRANCH_SCOPE_ENFORCED).toBe(true);
    expect(D1N_ALTERNATIVE_BRANCH_PROVENANCE_REQUIRED).toBe(true);
    expect(D1N_ALTERNATIVE_BRANCH_PROVENANCE_PRESERVED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1N_ALTERNATIVE_BRANCH_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(FINGERPRINT_VERIFIED_EQUALS_BRANCH_VALIDATED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_BRANCH_SELECTED).toBe(false);
    expect(FINGERPRINT_VERIFIED_EQUALS_BRANCH_CERTIFIED).toBe(false);
    expect(SILENT_ALTERNATIVE_BRANCH_MUTATION_ALLOWED).toBe(false);
    expect(D1N_ALTERNATIVE_BRANCH_HISTORY_PRESERVED).toBe(true);
    expect(D1N_DUPLICATE_ALTERNATIVE_BRANCH_GOVERNED).toBe(true);
    expect(D1N_ALTERNATIVE_BRANCH_REPLAY_GOVERNED).toBe(true);
    expect(D1N_ALTERNATIVE_BRANCH_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(BRANCH_AUTO_REPOINTED_TO_NEWER_DECISION).toBe(false);
    expect(BRANCH_AUTO_REFRESHED_AFTER_UPSTREAM_CHANGE).toBe(false);
    const base = prepared();
    const input = branchInput(base, {
      selectionDecisionId: base.decision.decisionId,
      selectionDecisionFingerprint: base.decision.fingerprint,
    });
    const first = recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, input);
    const replay = recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, input);
    expect(replay).toBe(first);
    expect(base.branches.history).toHaveLength(1);
    const again = prepared();
    const twin = recordAlternativeBranch(again.orchestration, again.progressionStore, again.assessments, again.decisions, again.branches, requester, branchInput(again, {
      selectionDecisionId: again.decision.decisionId,
      selectionDecisionFingerprint: again.decision.fingerprint,
    }));
    expect(twin.fingerprint).toBe(first.fingerprint);
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, { ...input, displayLabel: "Changed label" })).toThrow("BRANCH_ALREADY_RECORDED");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, { ...input, branchId: "branch-spoof", assertedFingerprint: "spoofed" })).toThrow("FINGERPRINT_MISMATCH");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, { ...input, branchId: "branch-tenant", tenantId: "tenant-b" })).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, { ...input, branchId: "branch-workspace", workspaceId: "workspace-b" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, { ...input, branchId: "branch-project", projectId: "project-b" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => mutateAlternativeBranch()).toThrow("BRANCH_MUTATION_REJECTED");
    expect(() => repointAlternativeBranch()).toThrow("BRANCH_REPOINT_NOT_IN_R6");
    expect(() => changeDesignProgression()).toThrow("PROGRESSION_MUTATION_NOT_IN_R6");
    expect(() => executeStageTransition()).toThrow("STAGE_TRANSITION_EXECUTION_NOT_IN_R6");
    const retained = recordAlternativeBranch(base.orchestration, base.progressionStore, base.assessments, base.decisions, base.branches, requester, branchInput(base, {
      branchId: "branch-next",
      displayLabel: "Portal frame retained successor",
      predecessorBranchId: first.branchId,
      provenanceRef: "prov-branch-next",
    }));
    const historical = reconstructAlternativeBranch(base.branches, first.branchId);
    expect(historical.recordStatus).toBe("RETAINED_HISTORICAL");
    expect(historical.branchState).toBe("RETAINED_HISTORICAL");
    expect(historical.fingerprint).toBe(first.fingerprint);
    expect(historical.selectionDecisionId).toBe(base.decision.decisionId);
    expect(retained.recordStatus).toBe("CURRENT");
    expect(base.branches.history.some((row) => row.action === "RETAINED_HISTORICAL" && row.fingerprint === first.fingerprint)).toBe(true);
    const laterDecision = recordHumanDecision(base.requests, base.decisions, decider, decisionInput(base.request.requestId, base.request.fingerprint, {
      decisionId: "decision-2",
      outcome: "NOT_APPROVED",
      rationale: "A later commercial note.",
      provenanceRef: "prov-decision-2",
      predecessorDecisionId: base.decision.decisionId,
    }));
    expect(laterDecision.decisionId).toBe("decision-2");
    expect(reconstructAlternativeBranch(base.branches, first.branchId).selectionDecisionFingerprint).toBe(base.decision.fingerprint);
    expect(reconstructAlternativeBranch(base.branches, first.branchId).selectedByGovernedDecision).toBe(true);
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_COUNT).toBe(0);
    expect(AUTOMATIC_R2_PROGRESSION_MUTATION_RUNTIME_COUNT).toBe(0);
    expect(D1N_CURRENTNESS_REASSESSMENT_RUNTIME_COUNT).toBe(0);
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
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(PARALLEL_D1N_CURRENTNESS_ENGINE_CREATED).toBe(false);
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
    expect(D1N_R6_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1N_R6_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1N_R6_DEBT_PRESERVED).toBe(true);
    expect(D1N_R6_POST_D1J_DEBT_LEDGER).toContain("NOT_AVAILABLE");
    expect(D1N_R6_POST_D1J_DEBT_LEDGER).toContain("GA security debt remains.");
    expect(D1N_R6_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1N_R6_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1N_R6_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_R6_C10_DEBT).toBe(debt);
    expect(D1N_R6_D1F_DEBT).toBe(debt);
    expect(D1N_R6_D1G_DEBT).toBe(debt);
    expect(D1N_R6_D1H_DEBT).toBe(debt);
    expect(D1N_R6_D1I_DEBT).toBe(debt);
    expect(D1N_R6_D1J_DEBT).toBe(debt);
    expect(D1N_R6_D1K_DEBT).toBe(debt);
    expect(D1N_R6_D1L_DEBT).toBe(debt);
    expect(D1N_RUNTIME_STARTED).toBe(true);
    expect(D1N_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R5_BRANCH_READY).toBe(false);
    expect(D1N_ALTERNATIVE_BRANCH_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1N_ALTERNATIVE_BRANCH_RUNTIME_COUNT).toBe(1);
    expect(D1N_ALTERNATIVE_BRANCH_RUNTIME_READY).toBe(true);
    expect(D1N_ORCHESTRATION_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D1N_DESIGN_PROGRESSION_RUNTIME_READY).toBe(true);
    expect(D1N_PREREQUISITE_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_REQUEST_RUNTIME_READY).toBe(true);
    expect(D1N_HUMAN_GATE_RUNTIME_READY).toBe(true);
    expect(D1N_STAGE_TRANSITION_EXECUTION_RUNTIME_READY).toBe(false);
    expect(D1N_CURRENTNESS_REASSESSMENT_RUNTIME_READY).toBe(false);
    expect(D1N_HANDOFF_INTEGRATION_RUNTIME_READY).toBe(false);
    expect(D1N_ARCHITECTURE_DEFINED).toBe(true);
    expect(D1N_ARCHITECTURE_READY).toBe(true);
    expect(D1N_R6_STATUS).toBe("ALTERNATIVE_BRANCH_GOVERNANCE_IMPLEMENTED");
    expect(D1N_R6_MATURITY_STATE).toBe("STRUCTURAL_ALTERNATIVE_DESIGN_BRANCH_GOVERNANCE_IMPLEMENTED");
    expect(D1N_R6_SCOPE).toContain("alternative");
    expect(D1N_R7_CANONICAL_PHASE).toBe("EOS-D1N-R7-CURRENTNESS-STALENESS-AND-REASSESSMENT");
    expect(D1N_R7_PHASE_TYPE).toBe("CURRENTNESS_STALENESS_AND_REASSESSMENT");
    expect(D1N_R7_CANONICAL_SCOPE).toContain("reassessment");
    expect(D1N_R6_READY_FOR_NEXT_PHASE).toBe(true);
    expect(D1N_R6_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    const source = readFileSync(join(here, "alternative-branch.ts"), "utf8");
    const doc = readFileSync(join(root, D1N_R6_CLOSEOUT_PATH), "utf8");
    const index = readFileSync(join(here, "index.ts"), "utf8");
    const capability = readFileSync(join(root, "packages/engineering-os/src/structural-concrete/capability.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toContain("createHash");
    expect(source).not.toContain('from "@rtb/engineering-review"');
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("CREATE TABLE");
    expect(scanAnalysisFormulaBypass("alternative-branch.ts", source)).toEqual([]);
    expect(doc).toContain("EOS-D1N-R7-CURRENTNESS-STALENESS-AND-REASSESSMENT");
    expect(doc).not.toContain("```");
    expect(existsSync(join(root, D1N_R6_PARENT_ARCHITECTURE_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R6_R1_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R6_R2_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R6_R3_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R6_R4_CLOSEOUT_PATH))).toBe(true);
    expect(existsSync(join(root, D1N_R6_R5_CLOSEOUT_PATH))).toBe(true);
    expect(index).toContain("recordAlternativeBranch");
    expect(index.match(/D1N_R6_CANONICAL_PHASE/g)).toHaveLength(1);
    expect(capability).toContain("D1N.R6.ALTERNATIVE_DESIGN_BRANCH_GOVERNANCE");
  });
});
