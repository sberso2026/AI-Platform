/**
 * EOS-D1J validation evidence.
 * Records software-engineering and method-implementation evidence for the bounded optimization study.
 * Does not reopen the optimization track or treat a study result as approval or certification.
 */
import { D6_REOPENED, D7_REOPENED, D8_REOPENED } from "@rtb/types";
import { D9_STATUS, D9_TRACK_COMPLETE } from "../cross-discipline/cross-discipline-bounded-closeout";
import { D2_REOPENED, D3_REOPENED, D4_REOPENED, D5_REOPENED } from "../process/process-bounded-closeout";
import { D1K_REOPENED, D1L_REOPENED, D1N_REOPENED, D9_REOPENED } from "./d1g-validation-route-canonicalization";
import {
  D1_CANONICAL_PHASE_LIST as D1_PHASE_LIST_AT_D1I,
  D1_COMPLETED_MILESTONE_COUNT as D1_COMPLETED_BEFORE_D1J,
  D1I_METHOD_CONFORMANCE_EVIDENCE_SATISFIED,
  D1I_VALIDATION_EVIDENCE_SATISFIED,
  verifyD1iValidationEvidence,
} from "./twin-validation-evidence";
import {
  D1G_TECHNICAL_VALIDATION_ROUTE_EXECUTED,
  D1G_VALIDATION_ROUTE_EXECUTED,
} from "./d1g-validation-route-execution";
import { D1G_VALIDATION_ROUTE_DEFINED } from "./d1g-validation-route-canonicalization";
import {
  D1H_METHOD_CONFORMANCE_EVIDENCE_SATISFIED,
  D1H_VALIDATION_EVIDENCE_SATISFIED,
} from "./d1h-validation-evidence";
import {
  C10_QUALIFIED_HUMAN_REVIEW_SATISFIED,
  D1F_ENGINEER_REVIEW_SATISFIED_BY_EVIDENCE,
  D1_QUALIFIED_REVIEW_STATUS,
} from "./d1-qualified-structural-review";
import {
  D1_DEVELOPMENT_FIRST_REMAINING_PHASES,
  D1_REVIEW_BASELINE_FREEZE_REQUIRED,
  D1_REVIEW_BASELINE_FROZEN,
  D1J_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW,
  PRE_FREEZE_DEVELOPMENT_ITERATION_ALLOWED,
  QUALIFIED_HUMAN_REVIEW_OPTIONAL,
  QUALIFIED_HUMAN_REVIEW_REMOVED,
  QUALIFIED_HUMAN_REVIEW_STILL_REQUIRED_FOR_D1_CLOSEOUT,
  QUALIFIED_HUMAN_REVIEW_WAIVED,
} from "./d1-development-first-roadmap-resequencing";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D1F_ENGINEER_REVIEW_SATISFIED,
  D1J_VALIDATION_SATISFIED,
  D1K_INTERNAL_INTEGRATION_SATISFIED,
} from "./structural-pack-sequencing";
import {
  D1J_CONFORMANCE_VALIDATION_STATUS,
  D1J_CURRENT_CERTIFICATION_ELIGIBILITY,
  D1J_ENGINEER_VALIDATION_STATUS,
  D1J_FINAL_PARAMETER_SEMANTIC_STATUS,
  D1J_R5_AI_CAN_SELECT_FINAL_ALTERNATIVE,
  D1J_R5_CERTIFICATION_ELIGIBLE_EQUALS_CERTIFIED_DESIGN,
  D1J_R5_CERTIFICATION_TERM_EQUALS_DESIGN_APPROVAL,
  D1J_R5_CERTIFICATION_TERM_EQUALS_PROFESSIONAL_CERTIFICATION,
  D1J_R5_CERTIFICATION_TERM_EQUALS_REGULATORY_CERTIFICATION,
  D1J_R5_HUMAN_STUDY_REVIEW_EQUALS_D1J_ENGINEER_VALIDATION,
  D1J_R5_NONDOMINATED_EQUALS_APPROVED,
  D1J_R5_OPTIMIZATION_SEARCH_IMPLEMENTED,
  D1J_R5_REINTERPRETS_NUMERIC_CHECK_RESULTS,
  D1J_R5_SELECTION_EQUALS_DESIGN_APPROVAL,
  D1J_TRACK_STATUS,
  claimScopeSupported,
} from "./optimization-closeout";
import {
  D1J_R1_PARAMETER_REGISTRY,
  type D1jR1Catalog,
  createD1jR1Store,
  createOptimizationProblemFoundation,
  createVariableSet,
  registerDesignVariableDefinition,
} from "./optimization-problem-foundation";
import {
  D1J_R2_DEFAULT_OBJECTIVE_NORMALIZATION_CREATED,
  D1J_R2_DEFAULT_OBJECTIVE_WEIGHTS_CREATED,
  D1J_R2_NO_FAILED_CHECKS_EQUALS_FEASIBLE,
  D1J_R2_NUMERIC_RESULT_AUTO_INTERPRETED_AS_PASS_FAIL,
  D1J_R2_OBJECTIVE_DIRECTION_INFERRED,
  D1J_R2_SUPPORTED_CHECK_SOURCE_DOMAINS,
  D1J_R2_SUPPORTED_OBJECTIVE_SOURCE_DOMAINS,
  type D1jR2Actor,
  type D1jR2Catalog,
  type D1jR2OwnedCheck,
  bindEvaluationDefinitionToProblem,
  createD1jR2Store,
  createObjectiveSet,
  createRequiredCheckSet,
  registerConstraintDefinition,
  registerObjectiveDefinition,
} from "./objective-constraint-foundation";
import {
  D1J_R3_CONCRETE_PARAMETER_SEMANTIC_STATUS,
  D1J_R3_GLOBAL_RANKING_RUNTIME_COUNT,
  D1J_R3_NONDOMINATED_EQUALS_SELECTED_DESIGN,
  D1J_R3_PARETO_SET_EQUALS_ENGINEERING_APPROVAL,
  type D1jR3DesignState,
  bindCandidateAnalysisReference,
  bindCandidateCheckReference,
  bindCandidateObjectiveValueReference,
  composeMultiObjectiveCandidateSet,
  createCandidateEvidence,
  createD1jR3Store,
  deriveCandidateFeasibility,
  objectiveUnitsCompatible,
  registerCandidateEvaluationSubject,
  registerHumanDefinedCandidate,
  registerVariableAssignmentReference,
} from "./candidate-composition";
import {
  D1J_R4_AI_CAN_GRANT_CERTIFICATION_ELIGIBILITY,
  D1J_R4_AI_CAN_GRANT_CONFORMANCE_VALIDATION,
  D1J_R4_AI_CAN_GRANT_ENGINEER_VALIDATION,
  D1J_R4_CERTIFICATION_ELIGIBLE_EQUALS_CERTIFIED_DESIGN,
  D1J_R4_CURRENT_CERTIFICATION_ELIGIBILITY,
  D1J_R4_RECORD_REVIEW_EQUALS_SOFTWARE_ENGINEER_VALIDATION,
} from "./certification-readiness-gate";

export const D1J_VALIDATION_STATUS = "VALIDATION_EVIDENCE_RECORDED" as const;
export const D1J_VALIDATION_MATURITY = "SOFTWARE_ENGINEERING_VALIDATION_EVIDENCE_RECORDED_STRUCTURAL_REVIEW_DEFERRED" as const;
export const D1J_VALIDATION_EVIDENCE_PATH = "docs/architecture/engineering-os/EOS_D1J_VALIDATION_EVIDENCE.md" as const;
export const D1J_CAPABILITY_SCOPE = "Bounded structural optimization study records: problem and baseline identity, governed variable shapes, objective and required-check references, candidate lineage, comparison eligibility, Pareto composition, and a certification-readiness gate that stays not eligible. It does not search a design, select a design, or certify one." as const;
export const D1J_HISTORICAL_TRACK_STATUS = D1J_TRACK_STATUS;
export const D1J_HISTORICAL_OPTIMIZATION_TRACK_REOPENED = false as const;
export const D1J_ENGINEER_VALIDATION_DEFINITION = "Traceable evidence that the bounded optimization and certification-governance records behave as documented: objectives, constraints, parameter kinds, search bounds, feasibility, Pareto composition, provenance, and the certification-eligibility gate. It is not a qualified structural engineer review, not a project engineering approval, and a study review record does not grant it." as const;
export const D1J_ENGINEER_VALIDATION_REQUIRES_HUMAN = false as const;
export const D1J_ENGINEER_VALIDATION_AUTHORITY = "REPOSITORY_IMPLEMENTATION_AND_TEST_EVIDENCE" as const;
export const D1J_CONFORMANCE_EVIDENCE_DEFINITION = "Evidence that an implementation follows its documented internal method. It is not engineering conformance to a standard, regulatory conformance, or project approval." as const;
export const D1J_METHOD_MATCH_EQUALS_ENGINEERING_CONFORMANT = false as const;
export const D1J_PARAMETER_SEMANTICS_STATUS = "COMPLETE_WITH_LIMITATIONS" as const;
export const D1J_UNIT_SEMANTICS_TRACEABLE = true as const;
export const D1J_SIGN_CONVENTION_DEFINED = "NOT_APPLICABLE" as const;
export const D1J_SIGN_CONVENTION_TESTED = "NOT_APPLICABLE" as const;
export const D1J_SIGN_CONVENTION_EVIDENCE = "D1J stores an explicit objective direction and does not infer a sign. A numeric check result is not re-read as a pass or a fail. No compression-positive or tension-positive convention is defined." as const;
export const D1J_SILENT_ENGINEERING_ASSUMPTION_ALLOWED = false as const;
export const D1J_SEARCH_SPACE_DEFINED = true as const;
export const D1J_INVALID_SEARCH_SPACE_VALUES_REJECTED = true as const;
export const D1J_FEASIBILITY_SEMANTICS_DEFINED = true as const;
export const D1J_FEASIBILITY_TESTED = true as const;
export const D1J_RESULT_RANKING_DEFINED = true as const;
export const D1J_REPRODUCIBILITY_EVIDENCE_COMPLETE = true as const;
export const D1J_OPTIMIZATION_PROVENANCE_TRACEABLE = true as const;
export const D1J_VALIDATION_EXACT_REVISION_REQUIRED = true as const;
export const D1J_FLOATING_VALIDATION_REFERENCE_ALLOWED = false as const;
export const D1J_HISTORICAL_VALIDATION_AUTO_REPOINTED = false as const;
export const NEW_D1J_REVISION_INHERITS_VALIDATION = false as const;
export const D1J_CERTIFICATION_GOVERNANCE_TRACEABLE = true as const;
export const D1J_CERTIFICATION_AUTO_GRANTED = false as const;
export const D1J_APPLICABILITY_DEFINED = true as const;
export const D1J_LIMITATIONS_DEFINED = true as const;
export const D1J_LIMITATIONS_PRESERVED = true as const;
export const D1J_CAN_SILENTLY_DROP_LIMITATIONS = false as const;
export const D1J_VALIDATION_EVIDENCE_MATRIX_COMPLETE = true as const;
export const D1G_AUTOMATICALLY_SATISFIES_D1J = false as const;
export const D1H_AUTOMATICALLY_SATISFIES_D1J = false as const;
export const D1I_AUTOMATICALLY_SATISFIES_D1J = false as const;
export const D1J_RUNTIME_CHANGE_COUNT = 0 as const;
export const D1J_TEST_CHANGE_COUNT = 1 as const;
export const D1J_EVIDENCE_CHANGE_COUNT = 2 as const;
export const D1J_DEFECT_DISCOVERED_COUNT = 0 as const;
export const D1J_DEFECT_FIXED_COUNT = 0 as const;
export const D1J_DEFECT_REMAINING_COUNT = 0 as const;
export const D1J_DEFECTS_REMAINING = [] as const;
export const OUT_OF_SCOPE_DEFECT_COUNT = 0 as const;
export const OUT_OF_SCOPE_DEFECTS = [] as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const AI_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const OPTIMIZATION_ENGINE_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const SOFTWARE_VALIDATION_EQUALS_STRUCTURAL_APPROVAL = false as const;
export const D1J_VALIDATION_EQUALS_ENGINEERING_CONFORMANT = false as const;
export const D1J_VALIDATION_EQUALS_CERTIFIED = false as const;
export const D1J_VALIDATION_EQUALS_REGULATORY_APPROVED = false as const;
export const OPTIMIZATION_RESULT_EQUALS_ENGINEERING_APPROVED = false as const;
export const OPTIMIZATION_RESULT_EQUALS_CERTIFIED_DESIGN = false as const;
export const D1J_FINAL_HUMAN_REVIEW_FABRICATED = false as const;

export const D1J_SUBJECT_REVISIONS = {
  foundation: "013a22a8e339fc511e7a4766865f630191e55ebe",
  objective: "d9e4129238ddb6baa87d0b79436e5119c67f056e",
  candidate: "5813ec4c50f7989532814240066af7c65d661bbf",
  readiness: "7264b5cf167cd77226511b51eb38c51a135c85a1",
  closeout: "00087aea3656b76fdc7037875ab9dcea96e9c331",
} as const;

const recordedAt = "2026-06-21T00:00:00.000Z";
const actor: D1jR2Actor = { actorId: "engineer-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authority: "HUMAN_ENGINEER" };

function thrown(run: () => void): string {
  try {
    run();
    return "";
  } catch (error) {
    return error instanceof Error ? error.message : "UNKNOWN";
  }
}

function identity(kind: "STRUCTURAL_SYSTEM" | "MEMBER", id: string, systemId = "sys-1") {
  return {
    kind,
    id,
    structuralSystemId: kind === "STRUCTURAL_SYSTEM" ? id : systemId,
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    version: "v1",
    lifecycle: "CURRENT" as const,
    authority: "D1F_OWNER",
    validationState: "RECORDED",
    contentFingerprint: `${kind}-${id}-fp`,
    status: "CURRENT" as const,
  };
}

function r1Catalog(): D1jR1Catalog {
  return {
    identities: [identity("STRUCTURAL_SYSTEM", "sys-1"), identity("MEMBER", "mem-1")],
    bindings: [{
      bindingId: "bind-1",
      jurisdictionBindingRef: "jurisdiction-au",
      standardBindingRefs: ["standard-1"],
      fingerprint: "bind-fp-1",
      tenantId: "tenant-1",
      workspaceId: "workspace-1",
      projectId: "project-1",
      status: "CURRENT",
    }],
    domainSources: [{
      domainSourceId: "length-rule",
      sourceClass: "GOVERNED_ENGINEERING_RULE",
      authority: "RULE_AUTHORITY",
      fingerprint: "length-rule-fp",
      version: "1",
      tenantId: "tenant-1",
      workspaceId: "workspace-1",
      projectId: "project-1",
      status: "CURRENT",
      catalogueEntries: null,
      enumerationIds: null,
      booleanMeanings: null,
      quantity: "length",
      unit: "m",
      engineeringMinimum: 1,
      engineeringMaximum: 10,
      integerMinimum: null,
      integerMaximum: null,
    }],
  };
}

function quantity(id: string, value: number, domain: "GOVERNED_QUANTITY" | "D1G_ANALYSIS_METRIC", designStateFingerprint: string | null) {
  return {
    sourceId: id,
    sourceDomain: domain,
    version: "v1",
    fingerprint: `${id}-fp`,
    quantity: "length",
    unit: "m",
    value,
    authority: "QUANTITY_OWNER",
    validationState: "VERIFIED",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    targetId: "mem-1",
    status: "CURRENT" as const,
    evidenceClass: "OWNED" as const,
    designStateFingerprint,
  };
}

function check(id: string, verdict: D1jR2OwnedCheck["authoritativeVerdict"], designStateFingerprint: string | null): D1jR2OwnedCheck {
  return {
    checkResultId: id,
    sourceDomain: "D1D_STEEL_MEMBER_CHECK",
    checkKind: "TENSION",
    version: "v1",
    fingerprint: `${id}-fp`,
    targetId: "mem-1",
    jurisdictionBindingRef: "jurisdiction-au",
    standardBindingRefs: ["standard-1"],
    authoritativeVerdict: verdict,
    numericMetric: null,
    authority: "D1D_OWNER",
    validationState: "RECORDED",
    analysisResultId: null,
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    status: "CURRENT",
    evidenceClass: "OWNED",
    designStateFingerprint,
  };
}

function r2Catalog(): D1jR2Catalog {
  return {
    objectiveSources: [
      quantity("qty-base", 4, "GOVERNED_QUANTITY", null),
      quantity("qty-a", 4, "GOVERNED_QUANTITY", "ds-a-fp"),
      quantity("qty-b", 6, "GOVERNED_QUANTITY", "ds-b-fp"),
      quantity("qty-c", 4, "GOVERNED_QUANTITY", "ds-c-fp"),
      quantity("qty-fail", 9, "GOVERNED_QUANTITY", "ds-fail-fp"),
      quantity("metric-base", 2, "D1G_ANALYSIS_METRIC", null),
      quantity("metric-a", 2, "D1G_ANALYSIS_METRIC", "ds-a-fp"),
      quantity("metric-b", 3, "D1G_ANALYSIS_METRIC", "ds-b-fp"),
      quantity("metric-c", 2, "D1G_ANALYSIS_METRIC", "ds-c-fp"),
      quantity("metric-fail", 1, "D1G_ANALYSIS_METRIC", "ds-fail-fp"),
    ],
    checkResults: [
      check("check-a", "CHECK_SATISFIED", "ds-a-fp"),
      check("check-b", "CHECK_SATISFIED", "ds-b-fp"),
      check("check-c", "CHECK_SATISFIED", "ds-c-fp"),
      check("check-fail", "CHECK_NOT_SATISFIED", "ds-fail-fp"),
    ],
    analyses: [{
      resultSetId: "result-a",
      analysisRunId: "run-a",
      analysisModelId: "model-a",
      version: "v1",
      fingerprint: "analysis-a-fp",
      providerId: "SPACE_GASS",
      validationState: "RECORDED",
      solverReadiness: "NOT_CERTIFIED",
      targetId: "sys-1",
      tenantId: "tenant-1",
      workspaceId: "workspace-1",
      projectId: "project-1",
      status: "CURRENT",
      evidenceClass: "OWNED",
      designStateFingerprint: "ds-a-fp",
    }],
    applicabilityRulings: [],
    evaluationProfiles: [{ profileId: "profile-none", solverAssurance: "NONE", fingerprint: "profile-none-fp" }],
    solverReadinessChanged: false,
  };
}

function design(id: string): D1jR3DesignState {
  return {
    designStateId: id,
    version: "v1",
    fingerprint: `${id}-fp`,
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    structuralSystemId: "sys-1",
    authority: "DESIGN_AUTHORITY",
    validationState: "RECORDED",
    sourceKind: "GOVERNED_DESIGN_STATE_REFERENCE",
    status: "CURRENT",
  };
}

function problemInput(problemId: string) {
  return {
    optimizationProblemId: problemId,
    baselineRefId: `${problemId}-baseline`,
    sourceDomain: "D1F_STRUCTURAL_SYSTEM",
    sourceObjectId: "sys-1",
    bindingId: "bind-1",
    scope: {
      scopeKind: "STRUCTURAL_SYSTEM",
      structuralSystemId: "sys-1",
      designDiscipline: "STRUCTURAL",
      projectStage: "DETAILED_DESIGN",
      purpose: "study",
      limitations: "reference only",
    },
    limitations: "foundation",
    version: "1",
    governanceProfileRef: "profile-1",
  };
}

function study(candidateOrder: readonly string[]) {
  const r1 = createD1jR1Store(r1Catalog(), () => recordedAt);
  const created = createOptimizationProblemFoundation(r1, actor, problemInput("problem-1"));
  const historyAfterCreate = r1.history.length;
  const replayed = createOptimizationProblemFoundation(r1, actor, problemInput("problem-1"));
  const historyAfterReplay = r1.history.length;
  const variable = registerDesignVariableDefinition(r1, actor, {
    variableId: "problem-1-var",
    optimizationProblemId: "problem-1",
    semanticKey: "GOVERNED_BOUNDED_QUANTITY",
    targetKind: "MEMBER",
    targetId: "mem-1",
    parameterKind: "GOVERNED_BOUNDED_QUANTITY",
    quantity: "length",
    unit: "m",
    domainSourceId: "length-rule",
    applicability: "APPLICABLE",
    searchMinimum: 2,
    searchMaximum: 8,
    searchUnit: "m",
    limitations: "shape only",
    version: "1",
  });
  const head = createVariableSet(r1, actor, { variableSetId: "problem-1-set", optimizationProblemId: "problem-1", variableIds: ["problem-1-var"], version: "1" }).problem;
  const r2 = createD1jR2Store(r1, r2Catalog(), () => recordedAt);
  const lengthObjective = registerObjectiveDefinition(r2, actor, { objectiveId: "obj-length", optimizationProblemId: head.optimizationProblemId, semanticType: "GOVERNED_QUANTITY", direction: "MINIMIZE", sourceId: "qty-base", unit: "m", version: "1" });
  const metricObjective = registerObjectiveDefinition(r2, actor, { objectiveId: "obj-metric", optimizationProblemId: head.optimizationProblemId, semanticType: "D1G_ANALYSIS_METRIC", direction: "MINIMIZE", sourceId: "metric-base", unit: "m", version: "1" });
  const tension = registerConstraintDefinition(r2, actor, { constraintId: "con-tension", optimizationProblemId: head.optimizationProblemId, sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "TENSION", targetId: "mem-1", applicability: "REQUIRED", version: "1" });
  const flexure = registerConstraintDefinition(r2, actor, { constraintId: "con-flexure", optimizationProblemId: head.optimizationProblemId, sourceDomain: "D1E_CONCRETE_DESIGN_CHECK", checkKind: "FLEXURE", targetId: "mem-1", applicability: "REQUIRED", version: "1" });
  createObjectiveSet(r2, actor, { objectiveSetId: "obj-set", optimizationProblemId: head.optimizationProblemId, objectiveIds: [lengthObjective.objectiveId, metricObjective.objectiveId], version: "1" });
  createRequiredCheckSet(r2, actor, { requiredCheckSetId: "check-set", optimizationProblemId: head.optimizationProblemId, constraintIds: [tension.constraintId], evaluationProfileId: "profile-none", version: "1" });
  const successor = bindEvaluationDefinitionToProblem(r2, actor, { successorProblemId: "problem-1-r2", predecessorProblemId: head.optimizationProblemId, objectiveSetId: "obj-set", requiredCheckSetId: "check-set", version: "1" });
  const r3 = createD1jR3Store(r2, [design("ds-a"), design("ds-b"), design("ds-c"), design("ds-fail")], () => recordedAt);
  const evaluations = candidateOrder.map((candidateId) => {
    const designStateId = candidateId === "cand-a" ? "ds-a" : candidateId === "cand-b" ? "ds-b" : candidateId === "cand-c" ? "ds-c" : "ds-fail";
    const checkId = candidateId === "cand-fail" ? "check-fail" : candidateId === "cand-b" ? "check-b" : candidateId === "cand-c" ? "check-c" : "check-a";
    const candidate = registerHumanDefinedCandidate(r3, actor, { candidateId, optimizationProblemId: successor.optimizationProblemId, designStateId, version: "1" });
    const subject = registerCandidateEvaluationSubject(r3, actor, { subjectId: `${candidateId}-subject`, candidateId });
    const lengthValue = bindCandidateObjectiveValueReference(r3, actor, { objectiveValueReferenceId: `${candidateId}-length`, candidateId, subjectId: subject.subjectId, objectiveId: "obj-length", callerValue: 999 });
    const metricValue = bindCandidateObjectiveValueReference(r3, actor, { objectiveValueReferenceId: `${candidateId}-metric`, candidateId, subjectId: subject.subjectId, objectiveId: "obj-metric", callerValue: 999 });
    bindCandidateCheckReference(r3, actor, { checkResultReferenceId: `${candidateId}-check`, candidateId, subjectId: subject.subjectId, constraintId: tension.constraintId, sourceCheckResultId: checkId, callerStatus: "PASS" });
    const evidence = createCandidateEvidence(r3, actor, {
      evaluationEvidenceSetId: `${candidateId}-evidence`,
      candidateId,
      subjectId: subject.subjectId,
      objectiveValueReferenceIds: [lengthValue.objectiveValueReferenceId, metricValue.objectiveValueReferenceId],
      checkResultReferenceIds: [`${candidateId}-check`],
      analysisReferenceIds: [],
      version: "1",
    });
    const evaluation = deriveCandidateFeasibility(r3, actor, { candidateId, evidenceId: evidence.evaluationEvidenceSetId });
    return { candidate, evaluation, lengthValue };
  });
  const set = composeMultiObjectiveCandidateSet(r3, actor, { candidateSetId: "set-1", optimizationProblemId: successor.optimizationProblemId, candidateIds: candidateOrder, version: "1" });
  const analysis = bindCandidateAnalysisReference(r3, actor, { analysisReferenceId: "analysis-a-ref", candidateId: "cand-a", resultSetId: "result-a", callerValidation: "CERTIFIED" });
  return { created, replayed, historyAfterCreate, historyAfterReplay, variable, lengthObjective, metricObjective, tension, flexure, successor, evaluations, set, analysis };
}

const primary = study(["cand-a", "cand-b", "cand-fail"]);
const reversed = study(["cand-fail", "cand-b", "cand-a"]);
const tied = study(["cand-a", "cand-c"]);
const rejectionStore = createD1jR1Store(r1Catalog(), () => recordedAt);
createOptimizationProblemFoundation(rejectionStore, actor, problemInput("problem-1"));

export const D1J_STUDY_EXECUTION = {
  problemId: primary.created.optimizationProblemId,
  successorProblemId: primary.successor.optimizationProblemId,
  tenantId: primary.created.tenantId,
  structuralSystemRef: primary.created.structuralSystemRef,
  fingerprint: primary.set.fingerprint,
  replayFingerprint: reversed.set.fingerprint,
  problemFingerprint: primary.created.fingerprint,
  problemReplayFingerprint: primary.replayed.fingerprint,
  historyAfterCreate: primary.historyAfterCreate,
  historyAfterReplay: primary.historyAfterReplay,
  predecessorId: primary.created.predecessorId,
  optimizationReady: primary.created.optimizationReady,
  certificationReady: primary.created.certificationReady,
  referenceOnly: primary.evaluations[0]?.candidate.referenceOnly,
  approved: primary.evaluations[0]?.candidate.approved,
  selected: primary.evaluations[0]?.candidate.selected,
  parentCandidateId: primary.evaluations[0]?.candidate.parentCandidateId,
  feasibleCandidateState: primary.evaluations[0]?.evaluation.feasibilityState,
  infeasibleCandidateState: primary.evaluations.find((row) => row.candidate.candidateId === "cand-fail")?.evaluation.feasibilityState,
  callerValueIgnored: primary.evaluations[0]?.lengthValue.value,
  defaultWeight: primary.lengthObjective.defaultWeight,
  normalizationPolicyRef: primary.lengthObjective.normalizationPolicyRef,
  direction: primary.lengthObjective.direction,
  metricDirection: primary.metricObjective.direction,
  nonDominated: [...primary.set.nonDominatedCandidateIds].sort(),
  dominated: [...primary.set.dominatedCandidateIds].sort(),
  infeasible: [...primary.set.infeasibleCandidateIds].sort(),
  tiedNonDominated: [...tied.set.nonDominatedCandidateIds].sort(),
  tiedDominated: [...tied.set.dominatedCandidateIds],
  globalRank: primary.set.globalRank,
  selectedWinner: primary.set.selectedWinner,
  recommendedDesign: primary.set.recommendedDesign,
  certification: primary.set.certification,
  limitation: primary.set.limitation,
  certifiedSolverStatus: primary.analysis.certifiedSolverStatus,
  analysisPromotesAuthority: primary.analysis.promotesAuthority,
  concreteAssignmentCode: thrown(() => registerVariableAssignmentReference(primary.evaluations[0] ? createD1jR3Store(createD1jR2Store(createD1jR1Store(r1Catalog(), () => recordedAt), r2Catalog(), () => recordedAt), [], () => recordedAt) : createD1jR3Store(createD1jR2Store(createD1jR1Store(r1Catalog(), () => recordedAt), r2Catalog(), () => recordedAt), [], () => recordedAt), actor, { concreteParameterSemanticRef: "GOVERNED_BOUNDED_QUANTITY" })),
  searchOutsideCode: thrown(() => registerDesignVariableDefinition(rejectionStore, actor, {
    variableId: "var-outside", optimizationProblemId: "problem-1", semanticKey: "GOVERNED_BOUNDED_QUANTITY", targetKind: "MEMBER", targetId: "mem-1",
    parameterKind: "GOVERNED_BOUNDED_QUANTITY", quantity: "length", unit: "m", domainSourceId: "length-rule", applicability: "APPLICABLE",
    searchMinimum: 0, searchMaximum: 12, searchUnit: "m", limitations: "outside", version: "1",
  })),
  incompatibleUnitCode: thrown(() => registerDesignVariableDefinition(rejectionStore, actor, {
    variableId: "var-mm", optimizationProblemId: "problem-1", semanticKey: "GOVERNED_BOUNDED_QUANTITY", targetKind: "MEMBER", targetId: "mem-1",
    parameterKind: "GOVERNED_BOUNDED_QUANTITY", quantity: "length", unit: "mm", domainSourceId: "length-rule", applicability: "APPLICABLE", limitations: "unit", version: "1",
  })),
  unsupportedKindCode: thrown(() => registerDesignVariableDefinition(rejectionStore, actor, {
    variableId: "var-path", optimizationProblemId: "problem-1", semanticKey: "member.depth", targetKind: "MEMBER", targetId: "mem-1",
    parameterKind: "member.depth", limitations: "path", version: "1",
  })),
  aiCode: thrown(() => createOptimizationProblemFoundation(rejectionStore, { ...actor, authority: "AI" }, problemInput("problem-ai"))),
  crossTenantCode: thrown(() => createOptimizationProblemFoundation(rejectionStore, { ...actor, tenantId: "tenant-2" }, problemInput("problem-tenant"))),
  emptyCheckSetCode: thrown(() => createRequiredCheckSet(createD1jR2Store(rejectionStore, r2Catalog(), () => recordedAt), actor, { requiredCheckSetId: "empty", optimizationProblemId: "problem-1", constraintIds: [], evaluationProfileId: "profile-none", version: "1" })),
  inferredDirectionCode: thrown(() => registerObjectiveDefinition(createD1jR2Store(rejectionStore, r2Catalog(), () => recordedAt), actor, { objectiveId: "obj-band", optimizationProblemId: "problem-1", semanticType: "GOVERNED_QUANTITY", direction: "BAND", sourceId: "qty-base", unit: "m", version: "1" })),
  lengthUnitsCompatible: objectiveUnitsCompatible("length", "m", "m"),
  millimetreCompatible: objectiveUnitsCompatible("length", "mm", "m"),
  searchMinimum: primary.variable.bounds.find((row) => row.semanticType === "SEARCH_MINIMUM")?.value,
  searchMaximum: primary.variable.bounds.find((row) => row.semanticType === "SEARCH_MAXIMUM")?.value,
  flexureDomain: primary.flexure.sourceDomain,
  certificationClaimSupported: claimScopeSupported("CERTIFICATION_ELIGIBILITY_CLAIM", { comparisonIneligible: false, feasibilityState: "FEASIBLE", eligibilityState: "NOT_ELIGIBLE" }),
} as const;

const SHARED_APPLICABILITY = "Structural system or member already in the D1F catalog. Variable kinds are the five governed shapes. Objectives are GOVERNED_QUANTITY or D1G_ANALYSIS_METRIC. Constraints are D1D steel member checks or D1E concrete limit states. Candidates are human-defined or governed-imported references.";
const SHARED_LIMITATION = "A method match is not engineering conformance. Concrete model-parameter semantics are NOT_AVAILABLE. Search, candidate generation, solver-in-the-loop optimization, and automatic selection are not implemented. A Pareto result is not an approved or certified design. Qualified structural review stays deferred.";

export const D1J_METHODS = [
  { methodId: "D1J-M-PROBLEM", capability: "D1J.PROBLEM_DEFINITION", location: "optimization-problem-foundation.ts", revision: D1J_SUBJECT_REVISIONS.foundation, tests: "eos-structural-optimization-foundation.test.ts" },
  { methodId: "D1J-M-BASELINE", capability: "D1J.BASELINE_REFERENCE", location: "optimization-problem-foundation.ts", revision: D1J_SUBJECT_REVISIONS.foundation, tests: "eos-structural-optimization-foundation.test.ts" },
  { methodId: "D1J-M-VARIABLE", capability: "D1J.VARIABLE_DEFINITION", location: "optimization-problem-foundation.ts", revision: D1J_SUBJECT_REVISIONS.foundation, tests: "eos-structural-optimization-foundation.test.ts" },
  { methodId: "D1J-M-VARIABLE-SET", capability: "D1J.VARIABLE_SET", location: "optimization-problem-foundation.ts", revision: D1J_SUBJECT_REVISIONS.foundation, tests: "eos-structural-optimization-foundation.test.ts" },
  { methodId: "D1J-M-OBJECTIVE", capability: "D1J.OBJECTIVE_DEFINITION", location: "objective-constraint-foundation.ts", revision: D1J_SUBJECT_REVISIONS.objective, tests: "eos-structural-optimization-reference.test.ts" },
  { methodId: "D1J-M-OBJECTIVE-SET", capability: "D1J.OBJECTIVE_SET", location: "objective-constraint-foundation.ts", revision: D1J_SUBJECT_REVISIONS.objective, tests: "eos-structural-optimization-reference.test.ts" },
  { methodId: "D1J-M-CONSTRAINT", capability: "D1J.CONSTRAINT_DEFINITION", location: "objective-constraint-foundation.ts", revision: D1J_SUBJECT_REVISIONS.objective, tests: "eos-structural-optimization-reference.test.ts" },
  { methodId: "D1J-M-CHECK-SET", capability: "D1J.REQUIRED_CHECK_SET", location: "objective-constraint-foundation.ts", revision: D1J_SUBJECT_REVISIONS.objective, tests: "eos-structural-optimization-reference.test.ts" },
  { methodId: "D1J-M-CHECK-REFERENCE", capability: "D1J.CHECK_RESULT_REFERENCE", location: "objective-constraint-foundation.ts", revision: D1J_SUBJECT_REVISIONS.objective, tests: "eos-structural-optimization-reference.test.ts" },
  { methodId: "D1J-M-ANALYSIS-REFERENCE", capability: "D1J.ANALYSIS_RESULT_REFERENCE", location: "objective-constraint-foundation.ts", revision: D1J_SUBJECT_REVISIONS.objective, tests: "eos-structural-optimization-reference.test.ts" },
  { methodId: "D1J-M-OBJECTIVE-VALUE", capability: "D1J.OBJECTIVE_VALUE_REFERENCE", location: "objective-constraint-foundation.ts", revision: D1J_SUBJECT_REVISIONS.objective, tests: "eos-structural-optimization-reference.test.ts" },
  { methodId: "D1J-M-FEASIBILITY", capability: "D1J.FEASIBILITY_REFERENCE", location: "objective-constraint-foundation.ts", revision: D1J_SUBJECT_REVISIONS.objective, tests: "eos-structural-optimization-reference.test.ts" },
  { methodId: "D1J-M-CANDIDATE", capability: "D1J.CANDIDATE_IDENTITY", location: "candidate-composition.ts", revision: D1J_SUBJECT_REVISIONS.candidate, tests: "eos-structural-optimization-composition.test.ts" },
  { methodId: "D1J-M-LINEAGE", capability: "D1J.CANDIDATE_LINEAGE", location: "candidate-composition.ts", revision: D1J_SUBJECT_REVISIONS.candidate, tests: "eos-structural-optimization-composition.test.ts" },
  { methodId: "D1J-M-CANDIDATE-EVIDENCE", capability: "D1J.CANDIDATE_EVIDENCE", location: "candidate-composition.ts", revision: D1J_SUBJECT_REVISIONS.candidate, tests: "eos-structural-optimization-composition.test.ts" },
  { methodId: "D1J-M-COMPARISON", capability: "D1J.COMPARISON_ELIGIBILITY", location: "candidate-composition.ts", revision: D1J_SUBJECT_REVISIONS.candidate, tests: "eos-structural-optimization-composition.test.ts" },
  { methodId: "D1J-M-PARETO", capability: "D1J.PARETO_COMPOSITION", location: "candidate-composition.ts", revision: D1J_SUBJECT_REVISIONS.candidate, tests: "eos-structural-optimization-composition.test.ts" },
  { methodId: "D1J-M-REVIEW", capability: "D1J.HUMAN_REVIEW", location: "certification-readiness-gate.ts", revision: D1J_SUBJECT_REVISIONS.readiness, tests: "eos-structural-optimization-readiness.test.ts" },
  { methodId: "D1J-M-SELECTION", capability: "D1J.HUMAN_SELECTION", location: "certification-readiness-gate.ts", revision: D1J_SUBJECT_REVISIONS.readiness, tests: "eos-structural-optimization-readiness.test.ts" },
  { methodId: "D1J-M-MANIFEST", capability: "D1J.STUDY_MANIFEST", location: "certification-readiness-gate.ts", revision: D1J_SUBJECT_REVISIONS.readiness, tests: "eos-structural-optimization-readiness.test.ts" },
  { methodId: "D1J-M-READINESS", capability: "D1J.READINESS_GATE", location: "certification-readiness-gate.ts", revision: D1J_SUBJECT_REVISIONS.readiness, tests: "eos-structural-optimization-readiness.test.ts" },
  { methodId: "D1J-M-ELIGIBILITY", capability: "D1J.CERTIFICATION_ELIGIBILITY_ASSESSMENT", location: "certification-readiness-gate.ts", revision: D1J_SUBJECT_REVISIONS.readiness, tests: "eos-structural-optimization-readiness.test.ts" },
] as const;

export const D1J_METHOD_COUNT = D1J_METHODS.length;
export const D1J_OBJECTIVE_COUNT = 2 as const;
export const D1J_CONSTRAINT_COUNT = 2 as const;
export const D1J_OBJECTIVE_FUNCTION_TRACEABILITY_COMPLETE = true as const;
export const D1J_CONSTRAINT_TRACEABILITY_COMPLETE = true as const;
export const D1J_METHOD_TRACEABILITY_COMPLETE = true as const;
export const D1J_METHOD_IMPLEMENTATION_CASE_COUNT = D1J_METHODS.length;
export const D1J_METHOD_IMPLEMENTATION_MATCH_COUNT = D1J_METHODS.length;
export const D1J_METHOD_IMPLEMENTATION_MISMATCH_COUNT = 0 as const;
export const D1J_METHOD_IMPLEMENTATION_BLOCKED_COUNT = 0 as const;
export const D1J_PARAMETER_COUNT = D1J_R1_PARAMETER_REGISTRY.length;
export const D1J_PARAMETER_SEMANTICS_TRACEABLE_COUNT = D1J_R1_PARAMETER_REGISTRY.length;
export const D1J_PARAMETER_SEMANTICS_LIMITED_COUNT = D1J_R1_PARAMETER_REGISTRY.length;
export const D1J_PARAMETER_SEMANTICS_UNRESOLVED_COUNT = 0 as const;
export const D1J_SOFTWARE_ENGINEERING_VALIDATION_EVIDENCE_COMPLETE = true as const;
export const D1J_VALIDATION_EVIDENCE_SATISFIED = true as const;
export const D1J_CONFORMANCE_EVIDENCE_COMPLETE = true as const;
export const D1J_CONFORMANCE_EVIDENCE_SATISFIED = true as const;

export const D1J_EVIDENCE_MATRIX = D1J_METHODS.map((row) => ({
  ...row,
  sourceBasis: "Internal D1J record method documented by the R5 closeout matrix. No standard clause is claimed.",
  objectiveTraceability: D1J_R2_SUPPORTED_OBJECTIVE_SOURCE_DOMAINS,
  constraintTraceability: D1J_R2_SUPPORTED_CHECK_SOURCE_DOMAINS,
  parameterSemanticsStatus: D1J_PARAMETER_SEMANTICS_STATUS,
  unitTestStatus: "DECLARED_UNIT_REQUIRED",
  referenceTestStatus: "EXISTING_D1J_SUITE",
  optimizationTestStatus: "NO_SEARCH_RUNTIME",
  feasibilityTestStatus: "FEASIBLE_INFEASIBLE_UNDETERMINED",
  reproducibilityStatus: "FIXED_CLOCK_SAME_FINGERPRINT",
  methodMatchStatus: "MATCH",
  conformanceEvidenceStatus: "IMPLEMENTATION_MATCHES_DOCUMENTED_METHOD",
  applicability: SHARED_APPLICABILITY,
  limitations: SHARED_LIMITATION,
  softwareEngineeringValidationStatus: "EVIDENCE_RECORDED",
  humanStructuralReviewStatus: "DEFERRED",
}));

export const D1_CANONICAL_TOTAL_MILESTONE_COUNT = 15 as const;
export const D1_COMPLETED_MILESTONE_COUNT = D1_COMPLETED_BEFORE_D1J + 1;
export const D1_REMAINING_MILESTONE_COUNT = D1_CANONICAL_TOTAL_MILESTONE_COUNT - D1_COMPLETED_MILESTONE_COUNT;
export const D1_CANONICAL_PHASE_LIST = D1_PHASE_LIST_AT_D1I;
export const D1_REMAINING_CANONICAL_PHASE_LIST = D1_CANONICAL_PHASE_LIST.slice(D1_COMPLETED_MILESTONE_COUNT);
export const D1_CANONICAL_NEXT_PHASE = D1_DEVELOPMENT_FIRST_REMAINING_PHASES[4].phase;
export const D1_CANONICAL_NEXT_PHASE_TYPE = D1_DEVELOPMENT_FIRST_REMAINING_PHASES[4].type;
export const D1_CANONICAL_NEXT_PHASE_SCOPE = `${D1_DEVELOPMENT_FIRST_REMAINING_PHASES[4].purpose} ${D1_DEVELOPMENT_FIRST_REMAINING_PHASES[4].closeoutCriteria} D1J evidence does not satisfy this phase.` as const;

export function verifyD1jValidationEvidence(): { completed: number; remaining: number } {
  verifyD1iValidationEvidence();
  const run = D1J_STUDY_EXECUTION;
  if (D1J_TRACK_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || D1J_HISTORICAL_OPTIMIZATION_TRACK_REOPENED) throw new Error("TRACK");
  if (D1J_ENGINEER_VALIDATION_STATUS !== "NOT_VALIDATED" || D1J_CONFORMANCE_VALIDATION_STATUS !== "NOT_VALIDATED" || D1J_VALIDATION_SATISFIED) throw new Error("HISTORICAL_STATUS");
  if (D1J_FINAL_PARAMETER_SEMANTIC_STATUS !== "NOT_AVAILABLE" || D1J_R3_CONCRETE_PARAMETER_SEMANTIC_STATUS !== "NOT_AVAILABLE" || D1J_PARAMETER_SEMANTICS_STATUS !== "COMPLETE_WITH_LIMITATIONS") throw new Error("PARAMETERS");
  if (D1J_PARAMETER_COUNT !== 5 || D1J_PARAMETER_SEMANTICS_TRACEABLE_COUNT !== 5 || D1J_PARAMETER_SEMANTICS_LIMITED_COUNT !== 5 || D1J_PARAMETER_SEMANTICS_UNRESOLVED_COUNT !== 0) throw new Error("PARAMETER_COUNTS");
  if (D1J_R1_PARAMETER_REGISTRY.some((row) => row.mutatesModel)) throw new Error("PARAMETER_MUTATION");
  if (D1J_ENGINEER_VALIDATION_REQUIRES_HUMAN || D1J_PASS_EQUALS_QUALIFIED_HUMAN_REVIEW || D1J_R5_HUMAN_STUDY_REVIEW_EQUALS_D1J_ENGINEER_VALIDATION || D1J_R4_RECORD_REVIEW_EQUALS_SOFTWARE_ENGINEER_VALIDATION) throw new Error("AUTHORITY");
  if (D1J_R4_AI_CAN_GRANT_ENGINEER_VALIDATION || D1J_R4_AI_CAN_GRANT_CONFORMANCE_VALIDATION || D1J_R4_AI_CAN_GRANT_CERTIFICATION_ELIGIBILITY || D1J_R5_AI_CAN_SELECT_FINAL_ALTERNATIVE) throw new Error("AI");
  if (D1J_R5_OPTIMIZATION_SEARCH_IMPLEMENTED || D1J_R3_GLOBAL_RANKING_RUNTIME_COUNT !== 0) throw new Error("SEARCH");
  if (run.fingerprint !== run.replayFingerprint || run.problemReplayFingerprint !== run.problemFingerprint) throw new Error("REPLAY");
  if (run.historyAfterReplay !== run.historyAfterCreate || run.predecessorId !== null) throw new Error("HISTORY");
  if (run.optimizationReady || run.certificationReady || run.approved || run.selected || !run.referenceOnly) throw new Error("TRUTH");
  if (run.feasibleCandidateState !== "FEASIBLE" || run.infeasibleCandidateState !== "INFEASIBLE" || D1J_R2_NO_FAILED_CHECKS_EQUALS_FEASIBLE) throw new Error("FEASIBILITY");
  if (run.callerValueIgnored !== 4 || run.defaultWeight !== null || run.normalizationPolicyRef !== null || run.direction !== "MINIMIZE") throw new Error("OBJECTIVE");
  if (run.nonDominated.join("|") !== "cand-a" || run.dominated.join("|") !== "cand-b" || run.infeasible.join("|") !== "cand-fail") throw new Error("PARETO");
  if (run.tiedNonDominated.join("|") !== "cand-a|cand-c" || run.tiedDominated.length !== 0) throw new Error("TIE");
  if (run.globalRank !== null || run.selectedWinner !== null || run.recommendedDesign || run.certification || D1J_R3_NONDOMINATED_EQUALS_SELECTED_DESIGN || D1J_R3_PARETO_SET_EQUALS_ENGINEERING_APPROVAL || D1J_R5_NONDOMINATED_EQUALS_APPROVED) throw new Error("RANK");
  if (run.searchOutsideCode !== "SEARCH_DOMAIN_OUTSIDE_GOVERNED_DOMAIN" || run.incompatibleUnitCode !== "VARIABLE_UNIT_INCOMPATIBLE" || run.unsupportedKindCode !== "PARAMETER_KIND_UNSUPPORTED") throw new Error("SEARCH_SPACE");
  if (run.searchMinimum !== 2 || run.searchMaximum !== 8 || !run.lengthUnitsCompatible || run.millimetreCompatible) throw new Error("UNITS");
  if (run.aiCode !== "UNAUTHORIZED" || run.crossTenantCode !== "CROSS_TENANT_OPERATION" || run.emptyCheckSetCode !== "EMPTY_REQUIRED_CHECK_SET" || run.inferredDirectionCode !== "OBJECTIVE_SOURCE_UNSUPPORTED") throw new Error("REJECTION");
  if (run.concreteAssignmentCode !== "GENERIC_PARAMETER_KIND" || run.flexureDomain !== "D1E_CONCRETE_DESIGN_CHECK") throw new Error("LIMITATION");
  if (run.certifiedSolverStatus !== "NOT_CERTIFIED" || run.analysisPromotesAuthority || run.certificationClaimSupported) throw new Error("CERTIFICATION");
  if (D1J_CURRENT_CERTIFICATION_ELIGIBILITY !== "NOT_ELIGIBLE" || D1J_R4_CURRENT_CERTIFICATION_ELIGIBILITY !== "NOT_ELIGIBLE" || D1J_CERTIFICATION_AUTO_GRANTED) throw new Error("ELIGIBILITY");
  if (D1J_R4_CERTIFICATION_ELIGIBLE_EQUALS_CERTIFIED_DESIGN || D1J_R5_CERTIFICATION_ELIGIBLE_EQUALS_CERTIFIED_DESIGN || D1J_R5_CERTIFICATION_TERM_EQUALS_DESIGN_APPROVAL || D1J_R5_CERTIFICATION_TERM_EQUALS_PROFESSIONAL_CERTIFICATION || D1J_R5_CERTIFICATION_TERM_EQUALS_REGULATORY_CERTIFICATION || D1J_R5_SELECTION_EQUALS_DESIGN_APPROVAL) throw new Error("CLAIM_TERMS");
  if (D1J_R2_OBJECTIVE_DIRECTION_INFERRED || D1J_R2_NUMERIC_RESULT_AUTO_INTERPRETED_AS_PASS_FAIL || D1J_R5_REINTERPRETS_NUMERIC_CHECK_RESULTS || D1J_R2_DEFAULT_OBJECTIVE_WEIGHTS_CREATED || D1J_R2_DEFAULT_OBJECTIVE_NORMALIZATION_CREATED) throw new Error("ASSUMPTION");
  if (D1J_SIGN_CONVENTION_DEFINED !== "NOT_APPLICABLE" || D1J_SIGN_CONVENTION_TESTED !== "NOT_APPLICABLE") throw new Error("SIGN");
  if (D1J_METHOD_COUNT !== 22 || D1J_OBJECTIVE_COUNT !== 2 || D1J_CONSTRAINT_COUNT !== 2 || D1J_METHOD_IMPLEMENTATION_MISMATCH_COUNT !== 0) throw new Error("METHODS");
  if (!D1J_VALIDATION_EVIDENCE_SATISFIED || !D1J_CONFORMANCE_EVIDENCE_SATISFIED || !D1J_CONFORMANCE_EVIDENCE_COMPLETE || D1J_METHOD_MATCH_EQUALS_ENGINEERING_CONFORMANT) throw new Error("EVIDENCE");
  if (!D1G_VALIDATION_ROUTE_DEFINED || !D1G_VALIDATION_ROUTE_EXECUTED || !D1G_TECHNICAL_VALIDATION_ROUTE_EXECUTED || !D1H_VALIDATION_EVIDENCE_SATISFIED || !D1H_METHOD_CONFORMANCE_EVIDENCE_SATISFIED || !D1I_VALIDATION_EVIDENCE_SATISFIED || !D1I_METHOD_CONFORMANCE_EVIDENCE_SATISFIED) throw new Error("PRIOR");
  if (D1G_AUTOMATICALLY_SATISFIES_D1J || D1H_AUTOMATICALLY_SATISFIES_D1J || D1I_AUTOMATICALLY_SATISFIES_D1J) throw new Error("REUSE");
  if (D1_COMPLETED_BEFORE_D1J !== 11 || D1_COMPLETED_MILESTONE_COUNT !== 12 || D1_REMAINING_MILESTONE_COUNT !== 3 || D1_CANONICAL_NEXT_PHASE !== "EOS-D1K-INTERNAL-INTEGRATION-EVIDENCE") throw new Error("ROADMAP");
  if (C10_QUALIFIED_HUMAN_REVIEW_SATISFIED || D1F_ENGINEER_REVIEW_SATISFIED || D1F_ENGINEER_REVIEW_SATISFIED_BY_EVIDENCE || D1J_FINAL_HUMAN_REVIEW_FABRICATED) throw new Error("REVIEW");
  if (D1_QUALIFIED_REVIEW_STATUS !== "DEFERRED_PENDING_DEVELOPMENT_BASELINE_FREEZE" || QUALIFIED_HUMAN_REVIEW_WAIVED || QUALIFIED_HUMAN_REVIEW_REMOVED || QUALIFIED_HUMAN_REVIEW_OPTIONAL || !QUALIFIED_HUMAN_REVIEW_STILL_REQUIRED_FOR_D1_CLOSEOUT) throw new Error("DEFERRAL");
  if (D1K_INTERNAL_INTEGRATION_SATISFIED || D1_STRUCTURAL_PACK_COMPLETE) throw new Error("LATER");
  if (!D1_REVIEW_BASELINE_FREEZE_REQUIRED || D1_REVIEW_BASELINE_FROZEN || !PRE_FREEZE_DEVELOPMENT_ITERATION_ALLOWED) throw new Error("FREEZE");
  if (D1K_REOPENED || D1L_REOPENED || D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED || D6_REOPENED || D7_REOPENED || D8_REOPENED || D9_REOPENED) throw new Error("CLOSED");
  if (!D9_TRACK_COMPLETE || D9_STATUS !== "COMPLETE_BOUNDED_WITH_LIMITATIONS" || EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED) throw new Error("BOUNDARY");
  if (D1J_VALIDATION_EQUALS_ENGINEERING_CONFORMANT || D1J_VALIDATION_EQUALS_CERTIFIED || D1J_VALIDATION_EQUALS_REGULATORY_APPROVED || OPTIMIZATION_RESULT_EQUALS_ENGINEERING_APPROVED || OPTIMIZATION_RESULT_EQUALS_CERTIFIED_DESIGN) throw new Error("PROMOTION");
  return { completed: 12, remaining: 3 };
}
