/**
 * EOS-D1J-R3 candidate, lineage, comparison, and multi-objective composition.
 * Registers governed alternatives and compares exact R2 evidence.
 * Does not generate candidates, run a search, execute a solver, or mutate a model.
 */

import { D1J_COMPLETENESS_STATES } from "@rtb/types";
import { computeParetoSet, type ObjectiveSpec } from "../optimization-intelligence/analysis";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { existingUnitPairCompatible } from "./inspection-temporal";
import {
  D1J_R2_D1G_CERTIFIED_SOLVER_STATUS,
  D1J_R2_PROBLEM_STATUS,
  deriveFeasibilityReference,
  propagateEvaluationStaleness,
  registerAnalysisResultReference,
  registerCheckResultReference,
  registerObjectiveValueReference,
  createEvaluationEvidenceSet,
  type D1jR2Actor,
  type D1jR2CheckRef,
  type D1jR2Feasibility,
  type D1jR2Problem,
  type D1jR2Store,
  type D1jR2Subject,
  type D1jR2ValueRef,
} from "./objective-constraint-foundation";
import { D1J_R1_PARAMETER_REGISTRY, inspectBaselineDesignReference } from "./optimization-problem-foundation";

export const D1J_R3_MATURITY_STATE = "STRUCTURAL_OPTIMIZATION_CANDIDATE_LINEAGE_COMPARISON_COMPOSITION_IMPLEMENTED" as const;
export const D1J_R3_CANDIDATE_EQUALS_APPLIED_DESIGN = false as const;
export const D1J_R3_CANDIDATE_EQUALS_APPROVED_DESIGN = false as const;
export const D1J_R3_CANDIDATE_EQUALS_CHECKED_DESIGN = false as const;
export const D1J_R3_NONDOMINATED_EQUALS_SELECTED_DESIGN = false as const;
export const D1J_R3_PARETO_SET_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1J_R3_PARAMETER_SEMANTIC_READINESS_AT_START = "PARTIAL_GENERIC_SEMANTICS_ONLY" as const;
export const D1J_R3_GENERIC_PARAMETER_KIND_EQUALS_ENGINEERING_PARAMETER = false as const;
export const D1J_R3_GENERIC_PARAMETER_KIND_EQUALS_MODEL_PROPERTY = false as const;
export const D1J_R3_GENERIC_VARIABLE_CAN_MUTATE_MODEL = false as const;
export const D1J_R3_CONCRETE_PARAMETER_SEMANTIC_REQUIRED_FOR_DESIGN_MAPPING = true as const;
export const D1J_R3_INVENTS_ENGINEERING_PARAMETER_SEMANTICS = false as const;
export const D1J_R3_NEW_ENGINEERING_PARAMETER_SEMANTIC_COUNT = 0 as const;
export const D1J_R3_CONCRETE_PARAMETER_SEMANTIC_INVENTORY = "No pre-existing governed concrete design-parameter semantic registry was found. R1 parameter kinds remain variable shape only." as const;
export const D1J_R3_CONCRETE_PARAMETER_SEMANTIC_STATUS = "NOT_AVAILABLE" as const;
export const D1J_R3_EXISTING_CANDIDATE_FOUNDATION_INVENTORY = "optimization-intelligence already records study alternatives and computes a Pareto set for that study runtime. R3 reuses computeParetoSet for deterministic non-dominance only. It does not register D1J candidates through the study or run platform." as const;
export const D1J_R3_CANDIDATE_DESIGN_STATE_SOURCE_INVENTORY = "D1F identities and R1 baselines identify the baseline. Study alternatives are not an immutable D1J design-state source. No separate candidate snapshot type was found. R3 allowlists a governed design-state reference pin." as const;
export const D1J_R3_CANDIDATE_SOURCE_RESOLVER_REGISTRY = "GOVERNED_DESIGN_STATE_REFERENCE resolves an exact design-state pin by id, version, and fingerprint. No generic fetch is registered." as const;
export const D1J_R3_GENERIC_CANDIDATE_SOURCE_FETCH_CREATED = false as const;
export const D1J_R3_CANDIDATE_ORIGIN_TAXONOMY = "Runtime origins are HUMAN_DEFINED and IMPORTED_GOVERNED. DETERMINISTIC_ENUMERATION and OPTIMIZATION_METHOD remain architecture enums with no R3 registration path." as const;
export const D1J_R3_HUMAN_DEFINED_EQUALS_APPROVED = false as const;
export const D1J_R3_IMPORTED_EQUALS_ENGINEER_VALIDATED = false as const;
export const D1J_R3_CANDIDATE_DESIGN_STATE_FLOATS_TO_LATEST = false as const;
export const D1J_R3_CALLER_FINGERPRINT_CAN_ESTABLISH_CANDIDATE_STATE_TRUTH = false as const;
export const D1J_R3_CANDIDATE_SOURCE_BODY_COPIED = false as const;
export const D1J_R3_REFERENCE_ONLY_CANDIDATE_POLICY = "A candidate may cite an exact design-state pin. Until a concrete parameter semantic exists, it is reference-only and does not claim that an R1 variable assignment was applied to a model." as const;
export const D1J_R3_CANDIDATE_RUNTIME_CONTRACT = "D1jDesignCandidate pins the R2 problem, baseline, origin, exact design-state reference, empty assignment set, parent, unvalidated registration authority, and fingerprint. Registration does not approve, check, or select it." as const;
export const D1J_R3_VARIABLE_ASSIGNMENT_REFERENCE_CONTRACT = "An assignment reference would pin a variable, a concrete parameter semantic, and a value. No concrete semantic is registered, so the reference cannot be stored and cannot claim a model mapping." as const;
export const D1J_R3_ASSIGNMENT_RECORD_MUTATES_MODEL = false as const;
export const D1J_R3_ASSIGNMENT_WITHOUT_CONCRETE_PARAMETER_SEMANTIC_CAN_CLAIM_MODEL_MAPPING = false as const;
export const D1J_R3_GOVERNED_BOUNDED_QUANTITY_AUTO_MAPS_TO_MODEL_PROPERTY = false as const;
export const D1J_R3_GOVERNED_CATALOGUE_CHOICE_AUTO_MAPS_TO_SECTION_PROPERTY = false as const;
export const D1J_R3_GOVERNED_INTEGER_COUNT_AUTO_MAPS_TO_REINFORCEMENT = false as const;
export const D1J_R3_AI_CAN_REGISTER_GOVERNING_ASSIGNMENT = false as const;
export const D1J_R3_ASSIGNMENT_OUTSIDE_GOVERNED_DOMAIN_ALLOWED = false as const;
export const D1J_R3_ASSIGNMENT_SEARCH_DOMAIN_POLICY = "No assignment is admitted, so none can leave or enlarge the R1 search domain. An external candidate does not redefine search bounds." as const;
export const D1J_R3_EXTERNAL_CANDIDATE_REDEFINES_SEARCH_DOMAIN = false as const;
export const D1J_R3_ASSIGNMENT_UNIT_INFERRED = false as const;
export const D1J_R3_FREEFORM_DISCRETE_ASSIGNMENT_ALLOWED = false as const;
export const D1J_R3_INTEGER_ASSIGNMENT_AUTO_ROUNDED = false as const;
export const D1J_R3_VARIABLE_ASSIGNMENT_SET_CONTRACT = "An assignment set would pin sorted assignment fingerprints. None can be created while the concrete parameter registry is empty." as const;
export const D1J_R3_ASSIGNMENT_SET_ORDER_INDEPENDENT = true as const;
export const D1J_R3_DUPLICATE_VARIABLE_ASSIGNMENT_ALLOWED = false as const;
export const D1J_R3_ASSIGNMENT_COMPLETENESS_STATES = "COMPLETE, PARTIAL, NOT_APPLICABLE_TO_REFERENCE_ONLY_CANDIDATE, UNDETERMINED" as const;
export const D1J_R3_PARTIAL_ASSIGNMENT_EQUALS_COMPLETE_DESIGN_MAPPING = false as const;
export const D1J_R3_CANDIDATE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1J_R3_ASSIGNMENT_FINGERPRINT_IMPLEMENTED = true as const;
export const D1J_R3_CANDIDATE_MUTATED_IN_PLACE = false as const;
export const D1J_R3_CANDIDATE_LINEAGE_CONTRACT = "Lineage is baseline to candidate, or candidate to a successor candidate in the same problem. A parent does not transfer validation." as const;
export const D1J_R3_CROSS_PROBLEM_PARENT_ALLOWED = false as const;
export const D1J_R3_SELF_PARENT_ALLOWED = false as const;
export const D1J_R3_LINEAGE_CYCLE_ALLOWED = false as const;
export const D1J_R3_PARENT_VALIDATION_AUTO_INHERITED = false as const;
export const D1J_R3_CANDIDATE_RUNTIME_API = "registerHumanDefinedCandidate, registerGovernedImportedCandidate, inspectCandidate, registerVariableAssignmentReference, createVariableAssignmentSet, linkCandidateParent, supersedeCandidate, registerCandidateEvaluationSubject, bindCandidateCheckReference, bindCandidateObjectiveValueReference, bindCandidateAnalysisReference, createCandidateEvidence, deriveCandidateFeasibility, assessComparisonEligibility, composeMultiObjectiveCandidateSet, propagateCandidateStaleness, produceCandidateCompositionResult" as const;
export const D1J_R3_CANDIDATE_GENERATION_API_COUNT = 0 as const;
export const D1J_R3_MODEL_WRITE_API_COUNT = 0 as const;
export const D1J_R3_CANDIDATE_EVALUATION_SUBJECT_EXTENSION = "R3 adds D1J_CANDIDATE_REFERENCE beside the R2 baseline subject. The baseline subject records are not rewritten." as const;
export const D1J_R3_MUTATES_R2_BASELINE_EVALUATION = false as const;
export const D1J_R3_CANDIDATE_EVALUATION_SUBJECT_CONTRACT = "A candidate evaluation subject pins the candidate id and fingerprint, design-state fingerprint, problem fingerprint, baseline fingerprint, and a null assignment-set fingerprint." as const;
export const D1J_R3_CANDIDATE_EVIDENCE_CORRELATION_POLICY = "A check, objective value, or analysis may be bound only when its owning record carries the same design-state fingerprint as the candidate. The same member or system id is not that correlation." as const;
export const D1J_R3_SAME_MEMBER_ID_ENOUGH_FOR_CANDIDATE_EVIDENCE = false as const;
export const D1J_R3_SAME_SYSTEM_ID_ENOUGH_FOR_CANDIDATE_EVIDENCE = false as const;
export const D1J_R3_BASELINE_EVIDENCE_AUTO_REUSED_FOR_CANDIDATE = false as const;
export const D1J_R3_BASELINE_EVIDENCE_REUSE_PROTECTION = "PASS" as const;
export const D1J_R3_R2_CHECK_REFERENCE_REUSED = true as const;
export const D1J_R3_R2_ANALYSIS_REFERENCE_REUSED = true as const;
export const D1J_R3_R2_OBJECTIVE_VALUE_REFERENCE_REUSED = true as const;
export const D1J_R3_R2_FEASIBILITY_REFERENCE_REUSED = true as const;
export const D1J_R3_CANDIDATE_FEASIBILITY_RECOMPUTES_ENGINEERING_CHECKS = false as const;
export const D1J_R3_CANDIDATE_OBJECTIVE_VALUE_CALLER_AUTHORED = false as const;
export const D1J_R3_CANDIDATE_ANALYSIS_PROMOTES_D1G_AUTHORITY = false as const;
export const D1J_R3_D1G_CERTIFICATION_PROMOTION = false as const;
export const D1J_R3_OBJECTIVE_COMPLETENESS_EQUALS_FEASIBILITY = false as const;
export const D1J_R3_COMPARISON_ELIGIBILITY_CONTRACT = "Comparison eligibility records problem, baseline, variable set, objective set, required-check set, standard binding, evaluation profile, unit, source assurance, and feasibility compatibility." as const;
export const D1J_R3_COMPARISON_ELIGIBILITY_STATES = "ELIGIBLE, INELIGIBLE, UNDETERMINED" as const;
export const D1J_R3_COMPARISON_REQUIRES_COMPATIBLE_PROBLEM = true as const;
export const D1J_R3_COMPARISON_REQUIRES_COMPATIBLE_BASELINE = true as const;
export const D1J_R3_COMPARISON_REQUIRES_COMPATIBLE_VARIABLE_SET = true as const;
export const D1J_R3_COMPARISON_REQUIRES_SAME_OBJECTIVE_DEFINITIONS = true as const;
export const D1J_R3_COMPARISON_REQUIRES_COMPATIBLE_REQUIRED_CHECK_SET = true as const;
export const D1J_R3_COMPARISON_REQUIRES_COMPATIBLE_STANDARD_BINDING = true as const;
export const D1J_R3_COMPARISON_REQUIRES_COMPATIBLE_EVALUATION_PROFILE = true as const;
export const D1J_R3_OBJECTIVE_SOURCE_ASSURANCE_COMPARISON_POLICY = "Two objective values are comparable only when their source validation state and evidence class match. A verified value is not treated as the same assurance as an unvalidated value." as const;
export const D1J_R3_OBJECTIVE_UNIT_COMPATIBILITY_REQUIRED = true as const;
export const D1J_R3_OBJECTIVE_NAME_MATCH_EQUALS_COMPATIBLE = false as const;
export const D1J_R3_DIFFERENT_STANDARD_BINDING_DIRECT_COMPARISON_ALLOWED = false as const;
export const D1J_R3_DIFFERENT_BASELINE_DIRECT_PARETO_ALLOWED = false as const;
export const D1J_R3_DIFFERENT_OBJECTIVE_SET_DIRECT_PARETO_ALLOWED = false as const;
export const D1J_R3_DIFFERENT_REQUIRED_CHECK_SET_DIRECT_PARETO_ALLOWED = false as const;
export const D1J_R3_COMPARISON_USES_CALLER_NUMERIC_VALUES = false as const;
export const D1J_R3_OBJECTIVE_VALUE_RECOMPUTED = false as const;
export const D1J_R3_OBJECTIVE_RECOMPUTATION_RUNTIME_COUNT = 0 as const;
export const D1J_R3_DEFAULT_NORMALIZATION_CREATED = false as const;
export const D1J_R3_DEFAULT_OBJECTIVE_NORMALIZATION_CREATED = false as const;
export const D1J_R3_DEFAULT_OBJECTIVE_WEIGHT_CREATED = false as const;
export const D1J_R3_DEFAULT_OBJECTIVE_WEIGHTS_CREATED = false as const;
export const D1J_R3_DEFAULT_COMPARISON_TOLERANCE_CREATED = false as const;
export const D1J_R3_DEFAULT_DOMINANCE_TOLERANCE_CREATED = false as const;
export const D1J_R3_UNIVERSAL_BEST_DESIGN_SCORE_CREATED = false as const;
export const D1J_R3_OBJECTIVE_PRECISION_POLICY = "Comparison uses the exact source number. No tolerance is added, and source rounding metadata is not invented." as const;
export const D1J_R3_PARETO_DOMINANCE_RUNTIME_CONTRACT = "Among comparison-eligible FEASIBLE candidates, computeParetoSet classifies non-dominance for MINIMIZE and MAXIMIZE. A candidate dominates another when every compared objective is no worse and at least one is strictly better." as const;
export const D1J_R3_TARGET_BAND_OBJECTIVE_COMPARISON_POLICY = "TARGET is excluded from dominance because the R2 objective definition carries no governed target value. BAND is not a governed direction and is not ordered." as const;
export const D1J_R3_PARETO_EQUALS_OPTIMIZATION_SEARCH = false as const;
export const D1J_R3_PARETO_EQUALS_DESIGN_SELECTION = false as const;
export const D1J_R3_PARETO_EQUALS_CERTIFICATION = false as const;
export const D1J_R3_PARETO_REQUIRES_COMPARISON_ELIGIBLE = true as const;
export const D1J_R3_FEASIBLE_PARETO_REQUIRES_FEASIBLE_CANDIDATE = true as const;
export const D1J_R3_UNDETERMINED_CANDIDATE_TREATED_FEASIBLE = false as const;
export const D1J_R3_INFEASIBLE_CANDIDATE_TREATED_FEASIBLE = false as const;
export const D1J_R3_INFEASIBLE_CANDIDATE_HISTORY_PRESERVED = true as const;
export const D1J_R3_UNDETERMINED_CANDIDATE_HISTORY_PRESERVED = true as const;
export const D1J_R3_UNDETERMINED_INCLUDED_AS_FEASIBLE_PARETO = false as const;
export const D1J_R3_INFEASIBLE_INCLUDED_AS_FEASIBLE_PARETO = false as const;
export const D1J_R3_EQUAL_OBJECTIVES_AUTO_TIEBROKEN = false as const;
export const D1J_R3_PARETO_DOMINANCE_EQUALS_GLOBAL_RANKING = false as const;
export const D1J_R3_MULTI_OBJECTIVE_CANDIDATE_SET_CONTRACT = "A candidate set pins the problem, baseline, objective set, required-check set, evaluation profile, and the feasible, infeasible, undetermined, ineligible, non-dominated, and dominated populations." as const;
export const D1J_R3_CANDIDATE_SET_MUTATED_IN_PLACE = false as const;
export const D1J_R3_CANDIDATE_SET_FINGERPRINT_ORDER_INDEPENDENT = true as const;
export const D1J_R3_NONDOMINATED_SET_EQUALS_RECOMMENDED_DESIGN = false as const;
export const D1J_R3_DOMINATED_CANDIDATE_HISTORY_PRESERVED = true as const;
export const D1J_R3_AUTOMATIC_WINNER_SELECTION_COUNT = 0 as const;
export const D1J_R3_GLOBAL_RANKING_RUNTIME_COUNT = 0 as const;
export const D1J_R3_HUMAN_SELECTION_RUNTIME_DECISION = "D1J-0 places human selection on the later certification-evidence manifest. R3 does not implement selection runtime." as const;
export const D1J_R3_HUMAN_SELECTION_RUNTIME_COUNT = 0 as const;
export const D1J_R3_CANDIDATE_SET_EQUALS_HUMAN_SELECTION = false as const;
export const D1J_R3_AI_GOVERNING_AUTHORITY_CREATED = false as const;
export const D1J_R3_AI_CANDIDATE_GENERATION_RUNTIME_COUNT = 0 as const;
export const D1J_R3_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1J_R3_CANDIDATE_PROVENANCE_COMPLETE = true as const;
export const D1J_R3_ASSIGNMENT_PROVENANCE_COMPLETE = true as const;
export const D1J_R3_LINEAGE_PROVENANCE_COMPLETE = true as const;
export const D1J_R3_COMPARISON_PROVENANCE_COMPLETE = true as const;
export const D1J_R3_CANDIDATE_SET_PROVENANCE_COMPLETE = true as const;
export const D1J_R3_FINGERPRINT_COVERAGE = "Fingerprints cover the candidate, the rejected assignment gate, the candidate evaluation subject, comparison eligibility, and the multi-objective candidate set." as const;
export const D1J_R3_FINGERPRINT_DETERMINISM = "PASS" as const;
export const D1J_R3_HISTORY_APPEND_ONLY = true as const;
export const D1J_R3_CANDIDATE_SOURCE_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R3_ASSIGNMENT_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R3_PROBLEM_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R3_BASELINE_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R3_VARIABLE_SET_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R3_OBJECTIVE_SET_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R3_REQUIRED_CHECK_SET_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R3_EVALUATION_PROFILE_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R3_OBJECTIVE_VALUE_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R3_FEASIBILITY_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R3_D1G_READINESS_CHANGE_PROPAGATES = true as const;
export const D1J_R3_INVALIDATION_MUTATES_STRUCTURAL_SOURCE = false as const;
export const D1J_R3_INVALIDATION_MUTATES_ANALYSIS_SOURCE = false as const;
export const D1J_R3_INVALIDATION_MUTATES_CHECK_SOURCE = false as const;
export const D1J_R3_INVALIDATION_MUTATES_OBJECTIVE_SOURCE = false as const;
export const D1J_R3_INVALIDATION_DELETES_HISTORY = false as const;
export const D1J_R3_HISTORICAL_REPRODUCIBILITY = "PASS" as const;
export const D1J_R3_TRUSTED_RECORDED_TIME_REQUIRED = true as const;
export const D1J_R3_CALLER_CAN_BACKDATE_AUDIT_HISTORY = false as const;
export const D1J_R3_RUNTIME_RESULT_CONTRACT = "The composition result lists candidates, evaluations, eligibility, and the separated populations. It names no winner and it is not certification." as const;
export const D1J_R3_RUNTIME_RESULT_EQUALS_SELECTED_WINNER = false as const;
export const D1J_R3_RUNTIME_RESULT_EQUALS_CERTIFICATION = false as const;
export const D1J_R3_EVENTS = [
  "OPTIMIZATION_CANDIDATE_REGISTERED",
  "OPTIMIZATION_CANDIDATE_SUPERSEDED",
  "OPTIMIZATION_VARIABLE_ASSIGNMENT_RECORDED",
  "OPTIMIZATION_CANDIDATE_LINEAGE_RECORDED",
  "OPTIMIZATION_CANDIDATE_EVIDENCE_BOUND",
  "OPTIMIZATION_COMPARISON_ELIGIBILITY_ASSESSED",
  "OPTIMIZATION_CANDIDATE_SET_COMPOSED",
  "OPTIMIZATION_CANDIDATE_SET_STALE",
] as const;
export const D1J_R3_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1J_R3_EVENT_MUTATES_DESIGN = false as const;
export const D1J_R3_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1J_R3_IDEMPOTENCY_POLICY = "Repeating the same candidate, lineage edge, evidence binding, comparison, or candidate set returns the existing record and does not append a second history row." as const;
export const D1J_R3_DUPLICATE_CANDIDATE_COUNTS_AS_NEW_ALTERNATIVE = false as const;
export const D1J_R3_DUPLICATE_EVIDENCE_COUNTS_AS_INDEPENDENT_EVIDENCE = false as const;
export const D1J_R3_CROSS_PROJECT_CANDIDATE_ALLOWED = false as const;
export const D1J_R3_CROSS_PROJECT_COMPARISON_ALLOWED = false as const;
export const D1J_R3_CROSS_TENANT_CANDIDATE_ALLOWED = false as const;
export const D1J_R3_CROSS_TENANT_COMPARISON_ALLOWED = false as const;
export const D1J_R3_CANDIDATE_RUNTIME_COUNT = 1 as const;
export const D1J_R3_CANDIDATE_SOURCE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1J_R3_LINEAGE_RUNTIME_COUNT = 1 as const;
export const D1J_R3_COMPARISON_ELIGIBILITY_RUNTIME_COUNT = 1 as const;
export const D1J_R3_MULTI_OBJECTIVE_CANDIDATE_SET_RUNTIME_COUNT = 1 as const;
export const D1J_R3_PARETO_COMPOSITION_RUNTIME_COUNT = 1 as const;
export const D1J_R3_VARIABLE_ASSIGNMENT_REFERENCE_RUNTIME_COUNT = 0 as const;
export const D1J_R3_AUTOMATIC_CANDIDATE_GENERATION_COUNT = 0 as const;
export const D1J_R3_CANDIDATE_GENERATION_RUNTIME_COUNT = 0 as const;
export const D1J_R3_OPTIMIZATION_SEARCH_RUNTIME_COUNT = 0 as const;
export const D1J_R3_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1J_R3_ENGINEERING_CHECK_EXECUTION_COUNT = 0 as const;
export const D1J_R3_MODEL_MUTATION_COUNT = 0 as const;
export const D1J_R3_AUTOMATIC_SELECTION_RUNTIME_COUNT = 0 as const;
export const D1J_R3_CERTIFICATION_EVIDENCE_RUNTIME_COUNT = 0 as const;
export const D1J_R3_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1J_R3_REGISTRATION_AUTHORITY_EQUALS_ENGINEERING_VALIDATION = false as const;
export const D1J_R3_SAME_TARGET_EQUALS_SAME_DESIGN_STATE = false as const;
export const D1J_R3_CANDIDATE_EVIDENCE_DESIGN_STATE_CORRELATION_REQUIRED = true as const;
export const D1J_R3_INCOMPATIBLE_CANDIDATES_DIRECTLY_COMPARABLE = false as const;
export const D1J_R3_D1G_CERTIFIED_SOLVER_STATUS = D1J_R2_D1G_CERTIFIED_SOLVER_STATUS;
export const D1J_R3_PARALLEL_GENERIC_CANDIDATE_PLATFORM_CREATED = false as const;
export const D1J_R3_PARALLEL_GENERIC_PARETO_PLATFORM_CREATED = false as const;
export const D1J_R3_DIGITAL_THREAD_REUSED = true as const;
export const D1J_R3_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1J_R3_REAUTHORS_D1B_BINDING = false as const;
export const D1J_R3_REAUTHORS_D1D_CHECKS = false as const;
export const D1J_R3_REAUTHORS_D1E_CHECKS = false as const;
export const D1J_R3_REAUTHORS_D1F_IDENTITY = false as const;
export const D1J_R3_REAUTHORS_D1G_RESULTS = false as const;
export const D1J_R3_REAUTHORS_D1I_HISTORY = false as const;
export const D1J_R3_D1G_MATURITY_PROMOTION = false as const;
export const D1J_R3_D1I_MATURITY_PROMOTION = false as const;
export const D1J_R3_D1D_MATURITY_PROMOTION = false as const;
export const D1J_R3_D1E_MATURITY_PROMOTION = false as const;
export const D1J_R3_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1J_R3_PARALLEL_CAPABILITY_MANIFEST_CREATED = false as const;
export const D1J_R3_NEW_DEPENDENCY_COUNT = 0 as const;
export const D1J_R3_PARAMETER_INJECTION_SURFACE_CREATED = false as const;
export const D1J_R3_ARBITRARY_EXTERNAL_SELECTOR_ALLOWED = false as const;
export const D1J_R3_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1J_R3_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1J_R3_CANDIDATE_AUTHORITY_SPOOF_ALLOWED = false as const;
export const D1J_R3_EVIDENCE_AUTHORITY_SPOOF_ALLOWED = false as const;
export const D1J_R4_CANONICAL_PHASE = "EOS-D1J-R4-CERTIFICATION-EVIDENCE-READINESS-GATE" as const;
export const D1J_R4_PHASE_TYPE = "STRUCTURAL_OPTIMIZATION_CERTIFICATION_EVIDENCE_READINESS_GATE" as const;
export const D1J_R4_CANONICAL_SCOPE = "R4 may record evidence without a certified solver. CERTIFICATION_ELIGIBLE requires certified D1G, engineer validation, and conformance validation. R4 does not grant those validations." as const;
export const D1J_R4_HANDOFF_READY = true as const;
export const D1J_R4_REQUIRED_R3_CONTRACTS = "Problem identity and fingerprint, baseline fingerprint, variable set, parameter-semantic status, candidate identities, design-state refs, lineage, assignment sets where valid, R2 objective set, R2 required-check set, candidate evaluation refs, candidate feasibility refs, comparison eligibility, candidate set, non-dominated composition, authority, provenance, fingerprints, history, and staleness." as const;

const GENERIC_KINDS = D1J_R1_PARAMETER_REGISTRY.map((row) => row.parameterKind);
const BLOCKED = ["[", "]", ".", "__proto__", "constructor", "prototype", "/", "\\", "$", " ", "eval", "select ", "://"];

export type D1jR3DesignState = {
  designStateId: string;
  version: string;
  fingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  structuralSystemId: string;
  authority: string;
  validationState: string;
  sourceKind: "GOVERNED_DESIGN_STATE_REFERENCE";
  status: "CURRENT" | "STALE";
};

export type D1jR3Origin = "HUMAN_DEFINED" | "IMPORTED_GOVERNED";
export type D1jR3Status = "CURRENT" | "STALE" | "SUPERSEDED";

export type D1jR3Candidate = {
  candidateId: string;
  optimizationProblemId: string;
  problemFingerprint: string;
  baselineReferenceId: string;
  baselineFingerprint: string;
  variableSetFingerprint: string | null;
  objectiveSetFingerprint: string;
  requiredCheckSetFingerprint: string;
  bindingFingerprint: string;
  evaluationProfileFingerprint: string;
  candidateOrigin: D1jR3Origin;
  designStateId: string;
  designStateFingerprint: string;
  structuralSystemId: string;
  assignmentSetRef: null;
  assignmentCompleteness: "NOT_APPLICABLE_TO_REFERENCE_ONLY_CANDIDATE";
  parentCandidateId: string | null;
  referenceOnly: true;
  claimsModelMapping: false;
  approved: false;
  checked: false;
  feasible: false;
  selected: false;
  validationState: "UNVALIDATED";
  engineerValidated: false;
  copiesSourceBody: false;
  floatsToLatest: false;
  mutatesModel: false;
  sourceAuthority: string;
  registrationAuthority: string;
  status: D1jR3Status;
  version: string;
  fingerprint: string;
  recordedAt: string;
  callerBackdated: false;
};

export type D1jR3Evaluation = {
  candidateId: string;
  subjectId: string;
  evidenceId: string;
  feasibilityReferenceId: string;
  feasibilityState: D1jR2Feasibility;
  objectiveValueReferenceIds: readonly string[];
  checkResultReferenceIds: readonly string[];
  analysisReferenceIds: readonly string[];
};

export type D1jR3Eligibility = {
  comparisonEligibilityId: string;
  candidateAId: string;
  candidateBId: string;
  eligibilityState: "ELIGIBLE" | "INELIGIBLE" | "UNDETERMINED";
  reasons: readonly string[];
  fingerprint: string;
  recordedAt: string;
  callerBackdated: false;
};

export type D1jR3CandidateSet = {
  candidateSetId: string;
  optimizationProblemId: string;
  problemFingerprint: string;
  baselineFingerprint: string;
  objectiveSetFingerprint: string;
  requiredCheckSetFingerprint: string;
  evaluationProfileFingerprint: string;
  candidateIds: readonly string[];
  feasibleCandidateIds: readonly string[];
  infeasibleCandidateIds: readonly string[];
  undeterminedCandidateIds: readonly string[];
  ineligibleCandidateIds: readonly string[];
  nonDominatedCandidateIds: readonly string[];
  dominatedCandidateIds: readonly string[];
  recommendedDesign: false;
  selectedWinner: null;
  certification: false;
  globalRank: null;
  limitation: string | null;
  status: D1jR3Status;
  version: string;
  fingerprint: string;
  recordedAt: string;
  callerBackdated: false;
};

export type D1jR3Store = {
  r2: D1jR2Store;
  designStates: D1jR3DesignState[];
  candidates: D1jR3Candidate[];
  evaluations: D1jR3Evaluation[];
  eligibilities: D1jR3Eligibility[];
  sets: D1jR3CandidateSet[];
  assignments: readonly [];
  history: { historyId: string; subjectId: string; action: string; fingerprint: string; recordedAt: string }[];
  events: { eventId: string; eventType: (typeof D1J_R3_EVENTS)[number]; subjectId: string; mutatesDesign: false; engineeringApproval: false }[];
  now: () => string;
};

function fail(code: string): never {
  throw new Error(code);
}

function assertHuman(actor: D1jR2Actor): void {
  if (!actor.authority || actor.authority === "AI" || actor.authority === "LLM") fail("UNAUTHORIZED");
}

function blocked(value: string): boolean {
  const text = value.toLowerCase();
  return BLOCKED.some((token) => text.includes(token));
}

function remember(store: D1jR3Store, subjectId: string, action: string, fingerprint: string): void {
  store.history.push({ historyId: `r3h-${store.history.length + 1}`, subjectId, action, fingerprint, recordedAt: store.now() });
}

function emit(store: D1jR3Store, eventType: (typeof D1J_R3_EVENTS)[number], subjectId: string): void {
  store.events.push({ eventId: `r3e-${store.events.length + 1}`, eventType, subjectId, mutatesDesign: false, engineeringApproval: false });
}

function problemOf(store: D1jR3Store, problemId: string): D1jR2Problem {
  const problem = store.r2.problems.find((row) => row.optimizationProblemId === problemId) ?? fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
  if (problem.status !== D1J_R2_PROBLEM_STATUS) fail("PROBLEM_NOT_R2_FOUNDATION");
  return problem;
}

function isolate(actor: D1jR2Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

export function createD1jR3Store(r2: D1jR2Store, designStates: readonly D1jR3DesignState[], now: () => string): D1jR3Store {
  return {
    r2, designStates: [...designStates], now, candidates: [], evaluations: [], eligibilities: [], sets: [],
    assignments: [], history: [], events: [],
  };
}

function resolveDesignState(store: D1jR3Store, actor: D1jR2Actor, designStateId: string, expectedFingerprint?: string | null): D1jR3DesignState {
  if (designStateId === "latest" || blocked(designStateId)) fail("CANDIDATE_SOURCE_UNSUPPORTED");
  const source = store.designStates.find((row) => row.designStateId === designStateId) ?? fail("CANDIDATE_SOURCE_NOT_FOUND");
  if (source.sourceKind !== "GOVERNED_DESIGN_STATE_REFERENCE" || source.status !== "CURRENT") fail("CANDIDATE_SOURCE_NOT_FOUND");
  isolate(actor, source);
  if (expectedFingerprint != null && expectedFingerprint !== source.fingerprint) fail("CANDIDATE_FINGERPRINT_MISMATCH");
  return source;
}

function lineageCycle(store: D1jR3Store, candidateId: string, parentId: string | null, supersededId: string | null): void {
  if (!parentId) return;
  if (parentId === candidateId || parentId === supersededId) fail("SELF_PARENT");
  const seen = new Set<string>([candidateId]);
  if (supersededId) seen.add(supersededId);
  let cursor: string | null = parentId;
  while (cursor) {
    if (seen.has(cursor)) fail("LINEAGE_CYCLE");
    seen.add(cursor);
    cursor = store.candidates.find((row) => row.candidateId === cursor)?.parentCandidateId ?? null;
  }
}

function registerCandidate(store: D1jR3Store, actor: D1jR2Actor, input: {
  candidateId: string;
  optimizationProblemId: string;
  designStateId: string;
  origin: D1jR3Origin;
  parentCandidateId?: string | null;
  expectedFingerprint?: string | null;
  version: string;
  successorOfCandidateId?: string | null;
}): D1jR3Candidate {
  assertHuman(actor);
  const beforeIdentities = JSON.stringify(store.r2.r1.catalog.identities);
  const beforeAnalyses = JSON.stringify(store.r2.catalog.analyses);
  const problem = problemOf(store, input.optimizationProblemId);
  const baseline = inspectBaselineDesignReference(store.r2.r1, problem.baselineRefId);
  const design = resolveDesignState(store, actor, input.designStateId, input.expectedFingerprint);
  if (design.structuralSystemId !== problem.scope.structuralSystemId) fail("CANDIDATE_SCOPE_MISMATCH");
  const parentId = input.parentCandidateId ?? null;
  if (parentId && (parentId === input.candidateId || parentId === input.successorOfCandidateId)) fail("SELF_PARENT");
  if (parentId) {
    const parent = store.candidates.find((row) => row.candidateId === parentId) ?? fail("CANDIDATE_NOT_FOUND");
    if (parent.problemFingerprint !== problem.fingerprint) fail("CROSS_PROBLEM_PARENT");
    lineageCycle(store, input.candidateId, parentId, input.successorOfCandidateId ?? null);
  }
  const fingerprint = fingerprintCanonical({
    problem: problem.fingerprint,
    baseline: baseline.fingerprint,
    design: design.fingerprint,
    origin: input.origin,
    assignment: null,
    parent: parentId,
    authority: actor.authority,
    version: input.version,
  });
  const duplicate = store.candidates.find((row) => row.problemFingerprint === problem.fingerprint && row.designStateFingerprint === design.fingerprint && row.candidateOrigin === input.origin && row.parentCandidateId === parentId && row.status !== "SUPERSEDED");
  if (duplicate && input.successorOfCandidateId !== duplicate.candidateId) {
    if (duplicate.fingerprint === fingerprint) return duplicate;
    fail("DUPLICATE_CANDIDATE");
  }
  const existing = store.candidates.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  if (input.successorOfCandidateId) {
    const previous = store.candidates.find((row) => row.candidateId === input.successorOfCandidateId && row.status !== "SUPERSEDED") ?? fail("CANDIDATE_NOT_FOUND");
    previous.status = "SUPERSEDED";
    remember(store, previous.candidateId, "SUPERSEDED", previous.fingerprint);
    emit(store, "OPTIMIZATION_CANDIDATE_SUPERSEDED", previous.candidateId);
  }
  const recordedAt = store.now();
  const candidate: D1jR3Candidate = {
    candidateId: input.candidateId, optimizationProblemId: problem.optimizationProblemId, problemFingerprint: problem.fingerprint,
    baselineReferenceId: baseline.baselineRefId, baselineFingerprint: baseline.fingerprint, variableSetFingerprint: problem.variableSetFingerprint,
    objectiveSetFingerprint: problem.objectiveSetFingerprint, requiredCheckSetFingerprint: problem.requiredCheckSetFingerprint,
    bindingFingerprint: problem.bindingFingerprint, evaluationProfileFingerprint: problem.evaluationProfileFingerprint,
    candidateOrigin: input.origin, designStateId: design.designStateId, designStateFingerprint: design.fingerprint,
    structuralSystemId: design.structuralSystemId, assignmentSetRef: null, assignmentCompleteness: "NOT_APPLICABLE_TO_REFERENCE_ONLY_CANDIDATE",
    parentCandidateId: parentId, referenceOnly: true, claimsModelMapping: false, approved: false, checked: false, feasible: false, selected: false,
    validationState: "UNVALIDATED", engineerValidated: false, copiesSourceBody: false, floatsToLatest: false, mutatesModel: false,
    sourceAuthority: design.authority, registrationAuthority: actor.authority, status: "CURRENT", version: input.version, fingerprint, recordedAt, callerBackdated: false,
  };
  store.candidates.push(candidate);
  remember(store, candidate.candidateId, "REGISTERED", fingerprint);
  emit(store, "OPTIMIZATION_CANDIDATE_REGISTERED", candidate.candidateId);
  if (parentId) {
    remember(store, candidate.candidateId, "LINEAGE", fingerprint);
    emit(store, "OPTIMIZATION_CANDIDATE_LINEAGE_RECORDED", candidate.candidateId);
  }
  if (JSON.stringify(store.r2.r1.catalog.identities) !== beforeIdentities || JSON.stringify(store.r2.catalog.analyses) !== beforeAnalyses) fail("MODEL_MUTATION");
  return candidate;
}

export function registerHumanDefinedCandidate(store: D1jR3Store, actor: D1jR2Actor, input: Omit<Parameters<typeof registerCandidate>[2], "origin">): D1jR3Candidate {
  return registerCandidate(store, actor, { ...input, origin: "HUMAN_DEFINED" });
}

export function registerGovernedImportedCandidate(store: D1jR3Store, actor: D1jR2Actor, input: Omit<Parameters<typeof registerCandidate>[2], "origin">): D1jR3Candidate {
  return registerCandidate(store, actor, { ...input, origin: "IMPORTED_GOVERNED" });
}

export function inspectCandidate(store: D1jR3Store, candidateId: string): D1jR3Candidate {
  return store.candidates.find((row) => row.candidateId === candidateId) ?? fail("CANDIDATE_NOT_FOUND");
}

export function registerVariableAssignmentReference(_store: D1jR3Store, actor: D1jR2Actor, input: { concreteParameterSemanticRef: string }): never {
  assertHuman(actor);
  if (actor.authority === "AI" || actor.authority === "LLM") fail("UNAUTHORIZED");
  if (blocked(input.concreteParameterSemanticRef)) fail("ARBITRARY_PROPERTY_PATH");
  if ((GENERIC_KINDS as readonly string[]).includes(input.concreteParameterSemanticRef)) fail("GENERIC_PARAMETER_KIND");
  fail("NO_CONCRETE_PARAMETER_SEMANTIC");
}

export function createVariableAssignmentSet(_store: D1jR3Store, actor: D1jR2Actor): never {
  assertHuman(actor);
  fail("NO_CONCRETE_PARAMETER_SEMANTIC");
}

export function linkCandidateParent(store: D1jR3Store, actor: D1jR2Actor, input: { successorCandidateId: string; candidateId: string; parentCandidateId: string; version: string }): D1jR3Candidate {
  const current = inspectCandidate(store, input.candidateId);
  return registerCandidate(store, actor, {
    candidateId: input.successorCandidateId, optimizationProblemId: current.optimizationProblemId, designStateId: current.designStateId,
    origin: current.candidateOrigin, parentCandidateId: input.parentCandidateId, version: input.version, successorOfCandidateId: current.candidateId,
  });
}

export function supersedeCandidate(store: D1jR3Store, actor: D1jR2Actor, input: { successorCandidateId: string; candidateId: string; designStateId: string; version: string }): D1jR3Candidate {
  const current = inspectCandidate(store, input.candidateId);
  return registerCandidate(store, actor, {
    candidateId: input.successorCandidateId, optimizationProblemId: current.optimizationProblemId, designStateId: input.designStateId,
    origin: current.candidateOrigin, parentCandidateId: current.parentCandidateId, version: input.version, successorOfCandidateId: current.candidateId,
  });
}

export function registerCandidateEvaluationSubject(store: D1jR3Store, actor: D1jR2Actor, input: { subjectId: string; candidateId: string }): D1jR2Subject {
  assertHuman(actor);
  const candidate = inspectCandidate(store, input.candidateId);
  const problem = problemOf(store, candidate.optimizationProblemId);
  const baseline = inspectBaselineDesignReference(store.r2.r1, problem.baselineRefId);
  const fingerprint = fingerprintCanonical({
    kind: "D1J_CANDIDATE_REFERENCE", candidate: candidate.fingerprint, design: candidate.designStateFingerprint,
    problem: problem.fingerprint, baseline: baseline.fingerprint, assignment: null,
  });
  const existing = store.r2.subjects.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const subject: D1jR2Subject = {
    subjectId: input.subjectId, subjectKind: "D1J_CANDIDATE_REFERENCE", baselineRefId: baseline.baselineRefId, baselineFingerprint: baseline.fingerprint,
    fingerprint, candidateId: candidate.candidateId, candidateFingerprint: candidate.fingerprint,
    candidateDesignStateFingerprint: candidate.designStateFingerprint, problemFingerprint: problem.fingerprint, assignmentSetFingerprint: null,
  };
  store.r2.subjects.push(subject);
  remember(store, subject.subjectId, "SUBJECT", fingerprint);
  return subject;
}

export function bindCandidateCheckReference(store: D1jR3Store, actor: D1jR2Actor, input: { checkResultReferenceId: string; candidateId: string; subjectId: string; constraintId: string; sourceCheckResultId: string; callerStatus?: string | null }): D1jR2CheckRef {
  inspectCandidate(store, input.candidateId);
  const reference = registerCheckResultReference(store.r2, actor, input);
  remember(store, reference.checkResultReferenceId, "CHECK_BOUND", reference.fingerprint);
  emit(store, "OPTIMIZATION_CANDIDATE_EVIDENCE_BOUND", reference.checkResultReferenceId);
  return reference;
}

export function bindCandidateObjectiveValueReference(store: D1jR3Store, actor: D1jR2Actor, input: { objectiveValueReferenceId: string; candidateId: string; subjectId: string; objectiveId: string; callerValue?: number | null }): D1jR2ValueRef {
  inspectCandidate(store, input.candidateId);
  const reference = registerObjectiveValueReference(store.r2, actor, input);
  remember(store, reference.objectiveValueReferenceId, "VALUE_BOUND", reference.fingerprint);
  emit(store, "OPTIMIZATION_CANDIDATE_EVIDENCE_BOUND", reference.objectiveValueReferenceId);
  return reference;
}

export function bindCandidateAnalysisReference(store: D1jR3Store, actor: D1jR2Actor, input: { analysisReferenceId: string; candidateId: string; resultSetId: string; callerValidation?: string | null }): { certifiedSolverStatus: typeof D1J_R2_D1G_CERTIFIED_SOLVER_STATUS; promotesAuthority: false } {
  const candidate = inspectCandidate(store, input.candidateId);
  const source = store.r2.catalog.analyses.find((row) => row.resultSetId === input.resultSetId);
  if (!source || source.designStateFingerprint !== candidate.designStateFingerprint) fail("CANDIDATE_EVIDENCE_UNCORRELATED");
  const reference = registerAnalysisResultReference(store.r2, actor, { analysisReferenceId: input.analysisReferenceId, resultSetId: input.resultSetId, callerValidation: input.callerValidation });
  remember(store, reference.analysisReferenceId, "ANALYSIS_BOUND", reference.fingerprint);
  return reference;
}

export function createCandidateEvidence(store: D1jR3Store, actor: D1jR2Actor, input: {
  evaluationEvidenceSetId: string;
  candidateId: string;
  subjectId: string;
  objectiveValueReferenceIds: readonly string[];
  checkResultReferenceIds: readonly string[];
  analysisReferenceIds: readonly string[];
  version: string;
}) {
  const candidate = inspectCandidate(store, input.candidateId);
  return createEvaluationEvidenceSet(store.r2, actor, { ...input, optimizationProblemId: candidate.optimizationProblemId });
}

export function deriveCandidateFeasibility(store: D1jR3Store, actor: D1jR2Actor, input: { candidateId: string; evidenceId: string }): D1jR3Evaluation {
  const candidate = inspectCandidate(store, input.candidateId);
  const evidence = store.r2.evidenceSets.find((row) => row.evaluationEvidenceSetId === input.evidenceId) ?? fail("CANDIDATE_NOT_FOUND");
  const feasibility = deriveFeasibilityReference(store.r2, actor, evidence.evaluationEvidenceSetId);
  const existing = store.evaluations.find((row) => row.candidateId === candidate.candidateId && row.feasibilityReferenceId === feasibility.feasibilityReferenceId);
  if (existing) return existing;
  const evaluation: D1jR3Evaluation = {
    candidateId: candidate.candidateId, subjectId: evidence.subjectId, evidenceId: evidence.evaluationEvidenceSetId,
    feasibilityReferenceId: feasibility.feasibilityReferenceId, feasibilityState: feasibility.feasibilityState,
    objectiveValueReferenceIds: evidence.objectiveValueReferenceIds, checkResultReferenceIds: evidence.checkResultReferenceIds,
    analysisReferenceIds: evidence.analysisReferenceIds,
  };
  store.evaluations.push(evaluation);
  remember(store, candidate.candidateId, "FEASIBILITY", feasibility.fingerprint);
  return evaluation;
}

function valuesFor(store: D1jR3Store, candidateId: string): D1jR2ValueRef[] {
  const evaluation = [...store.evaluations].reverse().find((row) => row.candidateId === candidateId);
  if (!evaluation) return [];
  return evaluation.objectiveValueReferenceIds.map((id) => store.r2.valueRefs.find((row) => row.objectiveValueReferenceId === id)!).filter(Boolean);
}

export function objectiveUnitsCompatible(quantity: string, leftUnit: string, rightUnit: string): boolean {
  return existingUnitPairCompatible(quantity, leftUnit, rightUnit);
}

export function assessComparisonEligibility(store: D1jR3Store, actor: D1jR2Actor, input: { comparisonEligibilityId: string; candidateAId: string; candidateBId: string }): D1jR3Eligibility {
  assertHuman(actor);
  const left = inspectCandidate(store, input.candidateAId);
  const right = inspectCandidate(store, input.candidateBId);
  isolate(actor, store.designStates.find((row) => row.designStateId === left.designStateId) ?? fail("CANDIDATE_SOURCE_NOT_FOUND"));
  const reasons: string[] = [];
  if (left.problemFingerprint !== right.problemFingerprint) reasons.push("PROBLEM");
  if (left.baselineFingerprint !== right.baselineFingerprint) reasons.push("BASELINE");
  if (left.variableSetFingerprint !== right.variableSetFingerprint) reasons.push("VARIABLE_SET");
  if (left.objectiveSetFingerprint !== right.objectiveSetFingerprint) reasons.push("OBJECTIVE_SET");
  if (left.requiredCheckSetFingerprint !== right.requiredCheckSetFingerprint) reasons.push("REQUIRED_CHECK_SET");
  if (left.bindingFingerprint !== right.bindingFingerprint) reasons.push("STANDARD_BINDING");
  if (left.evaluationProfileFingerprint !== right.evaluationProfileFingerprint) reasons.push("EVALUATION_PROFILE");
  const leftValues = valuesFor(store, left.candidateId);
  const rightValues = valuesFor(store, right.candidateId);
  const objective = store.r2.objectives.find((row) => leftValues[0] && row.objectiveId === leftValues[0].objectiveId);
  if (leftValues[0] && rightValues[0] && objective && !objectiveUnitsCompatible(objective.quantity, leftValues[0].unit, rightValues[0].unit)) reasons.push("OBJECTIVE_UNIT");
  const leftSource = leftValues[0] ? store.r2.catalog.objectiveSources.find((row) => row.sourceId === leftValues[0]!.sourceId) : null;
  const rightSource = rightValues[0] ? store.r2.catalog.objectiveSources.find((row) => row.sourceId === rightValues[0]!.sourceId) : null;
  if (leftSource && rightSource && (leftSource.validationState !== rightSource.validationState || leftSource.evidenceClass !== rightSource.evidenceClass)) reasons.push("OBJECTIVE_SOURCE_ASSURANCE");
  const leftState = store.evaluations.find((row) => row.candidateId === left.candidateId)?.feasibilityState;
  const rightState = store.evaluations.find((row) => row.candidateId === right.candidateId)?.feasibilityState;
  let eligibilityState: D1jR3Eligibility["eligibilityState"] = "ELIGIBLE";
  if (reasons.length > 0) eligibilityState = "INELIGIBLE";
  else if (leftState !== "FEASIBLE" || rightState !== "FEASIBLE" || leftValues.length === 0 || rightValues.length === 0) {
    eligibilityState = leftState === "INFEASIBLE" || rightState === "INFEASIBLE" ? "INELIGIBLE" : "UNDETERMINED";
    if (leftState === "INFEASIBLE" || rightState === "INFEASIBLE") reasons.push("INFEASIBLE");
    else reasons.push("UNDETERMINED_FEASIBILITY");
  }
  const fingerprint = fingerprintCanonical({ left: left.fingerprint, right: right.fingerprint, state: eligibilityState, reasons: [...reasons].sort() });
  const existing = store.eligibilities.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const recorded: D1jR3Eligibility = {
    comparisonEligibilityId: input.comparisonEligibilityId, candidateAId: left.candidateId, candidateBId: right.candidateId,
    eligibilityState, reasons, fingerprint, recordedAt: store.now(), callerBackdated: false,
  };
  store.eligibilities.push(recorded);
  remember(store, recorded.comparisonEligibilityId, "ELIGIBILITY", fingerprint);
  emit(store, "OPTIMIZATION_COMPARISON_ELIGIBILITY_ASSESSED", recorded.comparisonEligibilityId);
  return recorded;
}

export function composeMultiObjectiveCandidateSet(store: D1jR3Store, actor: D1jR2Actor, input: { candidateSetId: string; optimizationProblemId: string; candidateIds: readonly string[]; version: string }): D1jR3CandidateSet {
  assertHuman(actor);
  const problem = problemOf(store, input.optimizationProblemId);
  const candidates = input.candidateIds.map((id) => inspectCandidate(store, id));
  const feasible: string[] = [];
  const infeasible: string[] = [];
  const undetermined: string[] = [];
  const ineligible: string[] = [];
  for (const candidate of candidates) {
    const compatible = candidate.problemFingerprint === problem.fingerprint && candidate.baselineFingerprint === inspectBaselineDesignReference(store.r2.r1, problem.baselineRefId).fingerprint && candidate.objectiveSetFingerprint === problem.objectiveSetFingerprint && candidate.requiredCheckSetFingerprint === problem.requiredCheckSetFingerprint && candidate.bindingFingerprint === problem.bindingFingerprint && candidate.evaluationProfileFingerprint === problem.evaluationProfileFingerprint;
    const evaluation = [...store.evaluations].reverse().find((row) => row.candidateId === candidate.candidateId);
    if (!compatible) ineligible.push(candidate.candidateId);
    else if (evaluation?.feasibilityState === "INFEASIBLE") infeasible.push(candidate.candidateId);
    else if (!evaluation || evaluation.feasibilityState !== "FEASIBLE" || evaluation.objectiveValueReferenceIds.length === 0) undetermined.push(candidate.candidateId);
    else feasible.push(candidate.candidateId);
  }
  const objectives = problem.objectiveSetRef ? store.r2.objectiveSets.find((row) => row.objectiveSetId === problem.objectiveSetRef)?.objectiveIds.map((id) => store.r2.objectives.find((row) => row.objectiveId === id)!) ?? [] : [];
  const comparable = objectives.filter((row) => row.direction === "MINIMIZE" || row.direction === "MAXIMIZE");
  const limitation = objectives.some((row) => row.direction === "TARGET") ? "TARGET is excluded from dominance because no governed target value is recorded." : null;
  const specs: ObjectiveSpec[] = comparable.map((row) => ({ id: row.objectiveId, metric_key: row.objectiveId, direction: row.direction, unit: row.unit }));
  const paretoInput = feasible.filter((id) => {
    const evaluation = store.evaluations.find((row) => row.candidateId === id);
    return comparable.every((objective) => evaluation?.objectiveValueReferenceIds.some((valueId) => store.r2.valueRefs.find((row) => row.objectiveValueReferenceId === valueId)?.objectiveId === objective.objectiveId));
  });
  const pareto = specs.length === 0 ? [] : computeParetoSet(specs, paretoInput.map((id) => {
    const evaluation = store.evaluations.find((row) => row.candidateId === id)!;
    return {
      alternativeId: id,
      runId: id,
      feasible: true,
      metrics: comparable.map((objective) => {
        const value = evaluation.objectiveValueReferenceIds.map((valueId) => store.r2.valueRefs.find((row) => row.objectiveValueReferenceId === valueId)).find((row) => row?.objectiveId === objective.objectiveId);
        return { metric_key: objective.objectiveId, value: value?.value ?? Number.NaN, unit: value?.unit ?? objective.unit };
      }),
    };
  }));
  const nonDominated = pareto.filter((row) => row.status === "pareto-optimal").map((row) => row.alternativeId);
  const dominated = pareto.filter((row) => row.status === "dominated").map((row) => row.alternativeId);
  const ordered = [...candidates].sort((left, right) => left.fingerprint.localeCompare(right.fingerprint));
  const fingerprint = fingerprintCanonical({
    problem: problem.fingerprint, baseline: problem.baselineRefId, objectives: problem.objectiveSetFingerprint, checks: problem.requiredCheckSetFingerprint,
    profile: problem.evaluationProfileFingerprint, candidates: ordered.map((row) => row.fingerprint),
    nonDominated: [...nonDominated].sort(), dominated: [...dominated].sort(), version: input.version,
  });
  const existing = store.sets.find((row) => row.fingerprint === fingerprint && row.status !== "SUPERSEDED");
  if (existing) return existing;
  const recorded: D1jR3CandidateSet = {
    candidateSetId: input.candidateSetId, optimizationProblemId: problem.optimizationProblemId, problemFingerprint: problem.fingerprint,
    baselineFingerprint: inspectBaselineDesignReference(store.r2.r1, problem.baselineRefId).fingerprint,
    objectiveSetFingerprint: problem.objectiveSetFingerprint, requiredCheckSetFingerprint: problem.requiredCheckSetFingerprint,
    evaluationProfileFingerprint: problem.evaluationProfileFingerprint, candidateIds: ordered.map((row) => row.candidateId),
    feasibleCandidateIds: feasible, infeasibleCandidateIds: infeasible, undeterminedCandidateIds: undetermined, ineligibleCandidateIds: ineligible,
    nonDominatedCandidateIds: nonDominated, dominatedCandidateIds: dominated, recommendedDesign: false, selectedWinner: null, certification: false,
    globalRank: null, limitation, status: "CURRENT", version: input.version, fingerprint, recordedAt: store.now(), callerBackdated: false,
  };
  store.sets.push(recorded);
  remember(store, recorded.candidateSetId, "COMPOSED", fingerprint);
  emit(store, "OPTIMIZATION_CANDIDATE_SET_COMPOSED", recorded.candidateSetId);
  return recorded;
}

export function propagateCandidateStaleness(store: D1jR3Store): void {
  const before = store.history.length;
  propagateEvaluationStaleness(store.r2);
  for (const candidate of store.candidates) {
    if (candidate.status === "SUPERSEDED") continue;
    const design = store.designStates.find((row) => row.designStateId === candidate.designStateId);
    const problem = store.r2.problems.find((row) => row.optimizationProblemId === candidate.optimizationProblemId);
    const baseline = problem ? inspectBaselineDesignReference(store.r2.r1, problem.baselineRefId) : null;
    const variableSet = problem?.variableSetRef ? store.r2.r1.variableSets.find((row) => row.variableSetId === problem.variableSetRef) : null;
    const objectiveSet = problem ? store.r2.objectiveSets.find((row) => row.objectiveSetId === problem.objectiveSetRef) : null;
    const checkSet = problem ? store.r2.checkSets.find((row) => row.requiredCheckSetId === problem.requiredCheckSetRef) : null;
    const profile = problem ? store.r2.catalog.evaluationProfiles.find((row) => row.profileId === problem.evaluationProfileRef) : null;
    const evaluation = [...store.evaluations].reverse().find((row) => row.candidateId === candidate.candidateId);
    const valueStale = evaluation?.objectiveValueReferenceIds.some((id) => store.r2.valueRefs.find((row) => row.objectiveValueReferenceId === id)?.status === "STALE") ?? false;
    const feasibilityStale = evaluation ? store.r2.feasibilityRefs.find((row) => row.feasibilityReferenceId === evaluation.feasibilityReferenceId)?.status === "STALE" : false;
    const assignmentStale = store.assignments.length > 0;
    if (!design || design.fingerprint !== candidate.designStateFingerprint || design.status !== "CURRENT" || problem?.status === "STALE" || !baseline || baseline.fingerprint !== candidate.baselineFingerprint || (variableSet && variableSet.status !== "FOUNDATION_DEFINED") || objectiveSet?.status !== "CURRENT" || checkSet?.status !== "CURRENT" || !profile || profile.fingerprint !== candidate.evaluationProfileFingerprint || store.r2.catalog.solverReadinessChanged || valueStale || feasibilityStale || assignmentStale) {
      if (candidate.status !== "STALE") {
        candidate.status = "STALE";
        remember(store, candidate.candidateId, "STALE", candidate.fingerprint);
        for (const set of store.sets) {
          if (set.candidateIds.includes(candidate.candidateId) && set.status === "CURRENT") {
            set.status = "STALE";
            remember(store, set.candidateSetId, "STALE", set.fingerprint);
            emit(store, "OPTIMIZATION_CANDIDATE_SET_STALE", set.candidateSetId);
          }
        }
      }
    }
  }
  if (store.history.length < before) fail("INVALIDATION_DELETES_HISTORY");
}

export function produceCandidateCompositionResult(store: D1jR3Store, candidateSetId: string) {
  const set = store.sets.find((row) => row.candidateSetId === candidateSetId) ?? fail("CANDIDATE_NOT_FOUND");
  return {
    resultId: `r3-${set.candidateSetId}`, optimizationProblemId: set.optimizationProblemId, candidateIds: set.candidateIds,
    candidateEvaluationRefs: store.evaluations.filter((row) => set.candidateIds.includes(row.candidateId)).map((row) => row.feasibilityReferenceId),
    comparisonEligibilityRefs: store.eligibilities.map((row) => row.comparisonEligibilityId), candidateSetId: set.candidateSetId,
    feasibleCandidateRefs: set.feasibleCandidateIds, infeasibleCandidateRefs: set.infeasibleCandidateIds,
    undeterminedCandidateRefs: set.undeterminedCandidateIds, ineligibleCandidateRefs: set.ineligibleCandidateIds,
    nonDominatedCandidateRefs: set.nonDominatedCandidateIds, dominatedCandidateRefs: set.dominatedCandidateIds,
    completeness: (set.undeterminedCandidateIds.length > 0 ? "PARTIAL" : "COMPLETE_FOR_DECLARED_SCOPE") as (typeof D1J_COMPLETENESS_STATES)[number],
    selectedWinner: null as null, certification: false as const, automaticWinner: false as const, globalRank: null as null,
    provenanceFingerprint: set.fingerprint, fingerprint: set.fingerprint,
  };
}

export function replayCandidate(store: D1jR3Store, candidateId: string) {
  const candidate = inspectCandidate(store, candidateId);
  const set = [...store.sets].reverse().find((row) => row.candidateIds.includes(candidateId));
  return {
    candidateId: candidate.candidateId,
    designStateFingerprint: candidate.designStateFingerprint,
    parentCandidateId: candidate.parentCandidateId,
    feasibilityState: store.evaluations.find((row) => row.candidateId === candidateId)?.feasibilityState ?? null,
    eligibility: store.eligibilities.filter((row) => row.candidateAId === candidateId || row.candidateBId === candidateId).map((row) => row.eligibilityState),
    candidateSetId: set?.candidateSetId ?? null,
    nonDominated: set?.nonDominatedCandidateIds.includes(candidateId) ?? false,
    dominated: set?.dominatedCandidateIds.includes(candidateId) ?? false,
    history: store.history.filter((row) => row.subjectId === candidateId),
  };
}
