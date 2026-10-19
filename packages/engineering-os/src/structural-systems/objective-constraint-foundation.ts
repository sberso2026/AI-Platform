/**
 * EOS-D1J-R2 objective, constraint, and feasibility-reference foundation.
 * References owned records. Does not execute checks, solvers, or candidate generation.
 */

import { CONCRETE_LIMIT_STATES, D1J_COMPLETENESS_STATES, D1J_FEASIBILITY_STATES, D1J_OBJECTIVE_DIRECTIONS, STEEL_MEMBER_DESIGN_CHECK_KINDS } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { existingUnitPairCompatible } from "./inspection-temporal";
import {
  D1J_R1_PARAMETER_REGISTRY,
  inspectBaselineDesignReference,
  inspectVariableSet,
  type D1jR1Problem,
  type D1jR1Store,
} from "./optimization-problem-foundation";
import { D1G_CERTIFIED_SOLVER_STATUS } from "./roadmap-after-twin-closeout";

export const D1J_R2_MATURITY_STATE = "STRUCTURAL_OPTIMIZATION_OBJECTIVE_CONSTRAINT_FEASIBILITY_REFERENCE_FOUNDATION_IMPLEMENTED" as const;
export const D1J_R2_PROBLEM_STATUS = "EVALUATION_REFERENCE_FOUNDATION_DEFINED" as const;
export const D1J_R2_OBJECTIVE_EQUALS_CONSTRAINT = false as const;
export const D1J_R2_ANALYSIS_RESULT_EQUALS_DESIGN_CHECK = false as const;
export const D1J_R2_NO_FAILED_CHECKS_EQUALS_FEASIBLE = false as const;
export const D1J_R2_OBJECTIVE_COMPLETENESS_EQUALS_FEASIBILITY = false as const;
export const D1J_R2_CHECK_STATUS_RESOLVED_FROM_OWNING_ENGINE = true as const;
export const D1J_R2_NUMERIC_RESULT_AUTO_INTERPRETED_AS_PASS_FAIL = false as const;
export const D1J_R2_UTILIZATION_THRESHOLD_INVENTED = false as const;
export const D1J_R2_NEW_ENGINEERING_CHECK_FORMULA_COUNT = 0 as const;
export const D1J_R2_FAILED_REQUIRED_CHECK_IMPLIES_INFEASIBLE = true as const;
export const D1J_R2_MISSING_REQUIRED_CHECK_EQUALS_FEASIBLE = false as const;
export const D1J_R2_STALE_REQUIRED_CHECK_EQUALS_FEASIBLE = false as const;
export const D1J_R2_INVALID_REQUIRED_CHECK_EQUALS_FEASIBLE = false as const;
export const D1J_R2_UNSUPPORTED_REQUIRED_CHECK_EQUALS_FEASIBLE = false as const;
export const D1J_R2_INSUFFICIENT_ASSURANCE_EQUALS_FEASIBLE = false as const;
export const D1J_R2_MISSING_OBJECTIVE_VALUE_EQUALS_INFEASIBLE = false as const;
export const D1J_R2_COMPLETE_OBJECTIVES_EQUALS_FEASIBLE = false as const;
export const D1J_R2_OBJECTIVE_VALUE_CAN_OFFSET_FAILED_REQUIRED_CHECK = false as const;
export const D1J_R2_OBJECTIVE_VALUE_CAN_OFFSET_UNDETERMINED_FEASIBILITY = false as const;
export const D1J_R2_CANONICAL_CHECK_RESOLUTION_REQUIRED = true as const;
export const D1J_R2_CANONICAL_ANALYSIS_RESOLUTION_REQUIRED = true as const;
export const D1J_R2_CANONICAL_OBJECTIVE_VALUE_RESOLUTION_REQUIRED = true as const;
export const D1J_R2_CALLER_CAN_ESTABLISH_CHECK_PASS_FAIL = false as const;
export const D1J_R2_CALLER_CAN_ESTABLISH_OBJECTIVE_VALUE_TRUTH = false as const;
export const D1J_R2_D1G_CERTIFICATION_ASSUMED = false as const;
export const D1J_R2_UNCERTIFIED_SOLVER_EVIDENCE_CAN_SATISFY_CERTIFIED_SOLVER_REQUIREMENT = false as const;
export const D1J_R2_MUTATES_R1_PROBLEM_IN_PLACE = false as const;
export const D1J_R2_R1_PROBLEM_HISTORY_PRESERVED = true as const;
export const D1J_R1_PARAMETER_SEMANTIC_SPECIFICITY_AUDIT = "R1 parameter kinds identify variable shape only. They do not name a concrete engineering design parameter or a model property." as const;
export const D1J_R3_PARAMETER_ASSIGNMENT_SEMANTIC_READINESS = "PARTIAL_GENERIC_SEMANTICS_ONLY" as const;
export const D1J_R2_OBJECTIVE_DIRECTION_INFERRED = false as const;
export const D1J_R2_OBJECTIVE_SOURCE_REGISTRY = "GOVERNED_QUANTITY and D1G_ANALYSIS_METRIC. Cost and carbon are not recomputed because no canonical cost or carbon record is registered." as const;
export const D1J_R2_SUPPORTED_OBJECTIVE_SOURCE_DOMAINS = "GOVERNED_QUANTITY, D1G_ANALYSIS_METRIC" as const;
export const D1J_R2_ARBITRARY_OBJECTIVE_EXPRESSION_ALLOWED = false as const;
export const D1J_R2_COST_OBJECTIVE_RECOMPUTED_IN_D1J = false as const;
export const D1J_R2_CARBON_OBJECTIVE_RECOMPUTED_IN_D1J = false as const;
export const D1J_R2_AI_CAN_ORIGINATE_GOVERNING_COST_RATE = false as const;
export const D1J_R2_AI_CAN_ORIGINATE_GOVERNING_CARBON_FACTOR = false as const;
export const D1J_R2_EXISTING_UNIT_SYSTEM_REUSED = true as const;
export const D1J_R2_OBJECTIVE_UNIT_INFERRED = false as const;
export const D1J_R2_DEFAULT_OBJECTIVE_NORMALIZATION_CREATED = false as const;
export const D1J_R2_DEFAULT_OBJECTIVE_WEIGHTS_CREATED = false as const;
export const D1J_R2_OBJECTIVE_DEFINITION_RUNTIME_CONTRACT = "An objective pins semantic type, quantity, unit, explicit direction, allowlisted source domain, authority, scope, and fingerprint. It stores no default weight and no default normalization." as const;
export const D1J_R2_OBJECTIVE_SET_RUNTIME_CONTRACT = "An objective set pins sorted objective fingerprints. Membership changes are a new set." as const;
export const D1J_R2_OBJECTIVE_SET_MUTATED_IN_PLACE = false as const;
export const D1J_R2_OBJECTIVE_SET_ORDER_INDEPENDENT = true as const;
export const D1J_R2_DUPLICATE_OBJECTIVE_POLICY = "The same problem, semantic type, quantity, and source domain is one objective. An exact repeat returns it. A different direction or source is not merged." as const;
export const D1J_R2_CONSTRAINT_DEFINITION_RUNTIME_CONTRACT = "A constraint pins an allowlisted D1D or D1E check kind, target, applicability, requiredness, and the D1B binding. It does not calculate the check." as const;
export const D1J_R2_EXISTING_CHECK_ENGINE_REUSE = true as const;
export const D1J_R2_PARALLEL_STRUCTURAL_CHECK_ENGINE_CREATED = false as const;
export const D1J_R2_CHECK_RESOLVER_REGISTRY = "D1D_STEEL_MEMBER_CHECK resolves steel member check kinds. D1E_CONCRETE_DESIGN_CHECK resolves concrete limit states. No generic check fetch is registered." as const;
export const D1J_R2_SUPPORTED_CHECK_SOURCE_DOMAINS = "D1D_STEEL_MEMBER_CHECK, D1E_CONCRETE_DESIGN_CHECK" as const;
export const D1J_R2_GENERIC_CHECK_FETCH_API_CREATED = false as const;
export const D1J_R2_ARBITRARY_CHECK_TYPE_ALLOWED = false as const;
export const D1J_R2_CONSTRAINT_REGISTRATION_PROMOTES_CHECK_AUTHORITY = false as const;
export const D1J_R2_UNKNOWN_APPLICABILITY_EQUALS_NOT_APPLICABLE = false as const;
export const D1J_R2_CALLER_CAN_WAIVE_REQUIRED_CHECK = false as const;
export const D1J_R2_REQUIRED_CHECK_SET_RUNTIME_CONTRACT = "A required-check set pins sorted constraint fingerprints, the D1B binding, and an explicit solver-assurance requirement." as const;
export const D1J_R2_REQUIRED_CHECK_SET_MUTATED_IN_PLACE = false as const;
export const D1J_R2_REQUIRED_CHECK_SET_ORDER_INDEPENDENT = true as const;
export const D1J_R2_EMPTY_REQUIRED_CHECK_SET_POLICY = "An empty required-check set is rejected and cannot establish feasibility." as const;
export const D1J_R2_EMPTY_CHECK_SET_EQUALS_FEASIBLE = false as const;
export const D1J_R2_PROBLEM_SUCCESSOR_CONTRACT = "Binding an objective set and required-check set creates a new problem id and fingerprint. The R1 problem record, fingerprint, and status stay as they were." as const;
export const D1J_R2_PROBLEM_STATUS_EQUALS_OPTIMIZATION_RUNTIME_READY = false as const;
export const D1J_R2_PROBLEM_STATUS_EQUALS_CANDIDATE_GENERATION_READY = false as const;
export const D1J_R2_PROBLEM_STATUS_EQUALS_CERTIFICATION_READY = false as const;
export const D1J_R2_PROBLEM_FINGERPRINT_UPDATED = true as const;
export const D1J_R2_REWRITES_R1_PROBLEM_FINGERPRINT = false as const;
export const D1J_R2_EVALUATION_SUBJECT_CONTRACT = "The only R2 evaluation subject is BASELINE_DESIGN_REFERENCE, pinned to the exact R1 baseline reference." as const;
export const D1J_R2_CANDIDATE_EVALUATION_SUBJECT_RUNTIME_COUNT = 0 as const;
export const D1J_R2_BASELINE_EVALUATION_SUBJECT_PINNED = true as const;
export const D1J_R2_CHECK_RESULT_REFERENCE_CONTRACT = "A check reference pins the owned result id, version, fingerprint, target, binding, owning verdict, and authority. Caller status is not stored as canonical." as const;
export const D1J_R2_CHECK_RESULT_RESOLVED_FROM_OWNER = true as const;
export const D1J_R2_CALLER_CHECK_STATUS_STORED_AS_CANONICAL = false as const;
export const D1J_R2_EXPECTED_CHECK_FINGERPRINT_MISMATCH_REJECTED = true as const;
export const D1J_R2_CHECK_STATUS_MAPPING = "CHECK_SATISFIED maps to PASS, CHECK_NOT_SATISFIED maps to FAIL, and CHECK_UNDETERMINED maps to UNRESOLVED. A numeric metric without a verdict stays unresolved." as const;
export const D1J_R2_ANALYSIS_RESULT_REFERENCE_CONTRACT = "An analysis reference pins the D1G result set, run, model, version, fingerprint, provider, validation, and NOT_CERTIFIED solver status." as const;
export const D1J_R2_ANALYSIS_RESULT_EQUALS_CHECK_RESULT = false as const;
export const D1J_R2_ANALYSIS_RESULT_AUTO_CREATES_CONSTRAINT_PASS = false as const;
export const D1J_R2_FLOATING_ANALYSIS_REFERENCE_ALLOWED = false as const;
export const D1J_R2_LATEST_ANALYSIS_RESULT_AUTO_SELECTED = false as const;
export const D1J_R2_ANALYSIS_REFERENCE_PROMOTES_D1G_AUTHORITY = false as const;
export const D1J_R2_D1G_CERTIFIED_SOLVER_STATUS = D1G_CERTIFIED_SOLVER_STATUS;
export const D1J_R2_SOLVER_ASSURANCE_REQUIREMENT_CONTRACT = "A required-check set declares NONE or CERTIFIED_SOLVER_REQUIRED. CERTIFIED_SOLVER_REQUIRED cannot be satisfied while D1G is NOT_CERTIFIED." as const;
export const D1J_R2_INSUFFICIENT_SOLVER_ASSURANCE_PRODUCES_UNDETERMINED = true as const;
export const D1J_R2_FIXTURE_EVIDENCE_EQUALS_PRODUCTION_ENGINEERING_EVIDENCE = false as const;
export const D1J_R2_FIXTURE_FEASIBILITY_EQUALS_CERTIFICATION_ELIGIBILITY = false as const;
export const D1J_R2_OBJECTIVE_VALUE_REFERENCE_CONTRACT = "An objective-value reference pins the source record, version, fingerprint, value, unit, and source authority. The caller number is not canonical." as const;
export const D1J_R2_OBJECTIVE_VALUE_RESOLVED_FROM_SOURCE = true as const;
export const D1J_R2_CALLER_NUMERIC_OBJECTIVE_VALUE_CAN_ESTABLISH_TRUTH = false as const;
export const D1J_R2_OBJECTIVE_VALUE_EXPECTATION_POLICY = "An expected fingerprint or expected value that differs from the source record rejects the reference." as const;
export const D1J_R2_OBJECTIVE_SOURCE_BODY_COPIED = false as const;
export const D1J_R2_CHECK_SOURCE_BODY_COPIED = false as const;
export const D1J_R2_ANALYSIS_SOURCE_BODY_COPIED = false as const;
export const D1J_R2_COST_VALUE_COMPUTED_FROM_CALLER_RATE = false as const;
export const D1J_R2_CARBON_VALUE_COMPUTED_FROM_CALLER_FACTOR = false as const;
export const D1J_R2_CHECK_METRIC_AUTO_BECOMES_OBJECTIVE = false as const;
export const D1J_R2_OBJECTIVE_AGGREGATION_RUNTIME_COUNT = 0 as const;
export const D1J_R2_EVALUATION_EVIDENCE_SET_CONTRACT = "An evidence set pins the baseline subject, objective set, required-check set, and the exact reference ids it names." as const;
export const D1J_R2_EVIDENCE_SET_FLOATING_REFERENCE_COUNT = 0 as const;
export const D1J_R2_LATEST_CHECK_RESULT_AUTO_SELECTED = false as const;
export const D1J_R2_MULTIPLE_CHECK_RESULTS_AUTO_RESOLVED = false as const;
export const D1J_R2_EVALUATION_COMPLETENESS_STATES = "COMPLETE_FOR_DECLARED_SCOPE, PARTIAL, INCOMPLETE, STALE, INVALID, UNDETERMINED" as const;
export const D1J_R2_EVALUATION_COMPLETENESS_CONTRACT = "Completeness is reported separately for objective coverage and required-check coverage, including staleness, invalidity, and unresolved applicability." as const;
export const D1J_R2_COMPLETE_EVALUATION_EQUALS_FEASIBLE = false as const;
export const D1J_R2_FEASIBILITY_REFERENCE_CONTRACT = "A feasibility reference orchestrates exact required-check references into FEASIBLE, INFEASIBLE, or UNDETERMINED. It does not execute a formula." as const;
export const D1J_R2_FEASIBILITY_STATES = "FEASIBLE, INFEASIBLE, UNDETERMINED" as const;
export const D1J_R2_FEASIBILITY_REFERENCE_EXECUTES_ENGINEERING_FORMULA = false as const;
export const D1J_R2_FEASIBLE_REQUIRES_ALL_REQUIRED_CHECKS_PASS = true as const;
export const D1J_R2_FEASIBLE_REQUIRES_SUFFICIENT_EVIDENCE_AUTHORITY = true as const;
export const D1J_R2_FAIL_PLUS_MISSING_EQUALS_INFEASIBLE = true as const;
export const D1J_R2_INCOMPLETE_NO_FAIL_EQUALS_UNDETERMINED = true as const;
export const D1J_R2_ALL_OBJECTIVE_VALUES_PRESENT_EQUALS_FEASIBLE = false as const;
export const D1J_R2_UNKNOWN_REQUIRED_CHECK_APPLICABILITY_EQUALS_PASS = false as const;
export const D1J_R2_NOT_APPLICABLE_REQUIRES_GOVERNED_BASIS = true as const;
export const D1J_R2_CHECK_RESULT_SCOPE_COMPATIBILITY_REQUIRED = true as const;
export const D1J_R2_DIFFERENT_STANDARD_CHECK_RESULT_ACCEPTED = false as const;
export const D1J_R2_CROSS_PROJECT_CHECK_RESULT_ALLOWED = false as const;
export const D1J_R2_CROSS_TENANT_CHECK_RESULT_ALLOWED = false as const;
export const D1J_R2_CHECK_ANALYSIS_DEPENDENCY_FLOATS_TO_LATEST = false as const;
export const D1J_R2_STALE_CHECK_CAN_SUPPORT_FEASIBLE = false as const;
export const D1J_R2_ANALYSIS_STALENESS_PROPAGATES = true as const;
export const D1J_R2_OBJECTIVE_SOURCE_STALENESS_PROPAGATES = true as const;
export const D1J_R2_OBJECTIVE_DEFINITION_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R2_REQUIRED_CHECK_SET_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R2_D1B_BINDING_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R2_BASELINE_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R2_VARIABLE_SET_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R2_D1G_READINESS_CHANGE_PROPAGATES = true as const;
export const D1J_R2_INVALIDATION_MUTATES_CHECK_SOURCE = false as const;
export const D1J_R2_INVALIDATION_MUTATES_ANALYSIS_SOURCE = false as const;
export const D1J_R2_INVALIDATION_MUTATES_OBJECTIVE_SOURCE = false as const;
export const D1J_R2_INVALIDATION_DELETES_HISTORY = false as const;
export const D1J_R2_HISTORY_APPEND_ONLY = true as const;
export const D1J_R2_OBJECTIVE_CHANGED_IN_PLACE = false as const;
export const D1J_R2_CONSTRAINT_CHANGED_IN_PLACE = false as const;
export const D1J_R2_EVIDENCE_REFERENCE_REBOUND_IN_PLACE = false as const;
export const D1J_R2_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1J_R2_OBJECTIVE_PROVENANCE_COMPLETE = true as const;
export const D1J_R2_CONSTRAINT_PROVENANCE_COMPLETE = true as const;
export const D1J_R2_CHECK_REFERENCE_PROVENANCE_COMPLETE = true as const;
export const D1J_R2_ANALYSIS_REFERENCE_PROVENANCE_COMPLETE = true as const;
export const D1J_R2_OBJECTIVE_VALUE_PROVENANCE_COMPLETE = true as const;
export const D1J_R2_EVALUATION_PROVENANCE_COMPLETE = true as const;
export const D1J_R2_FEASIBILITY_PROVENANCE_COMPLETE = true as const;
export const D1J_R2_FINGERPRINT_ARCHITECTURE_IMPLEMENTED = true as const;
export const D1J_R2_OBJECTIVE_SET_FINGERPRINT_ORDER_INDEPENDENT = true as const;
export const D1J_R2_REQUIRED_CHECK_SET_FINGERPRINT_ORDER_INDEPENDENT = true as const;
export const D1J_R2_EVIDENCE_SET_FINGERPRINT_ORDER_INDEPENDENT = true as const;
export const D1J_R2_FEASIBILITY_FINGERPRINT_REQUIREMENT = "The feasibility fingerprint includes the R2 problem fingerprint, required-check-set fingerprint, exact check-reference fingerprints, assurance context, feasibility state, and completeness." as const;
export const D1J_R2_AUTHORITY_LAYERS_DISTINCT = true as const;
export const D1J_R2_EVIDENCE_ASSEMBLY_AUTHORITY_PROMOTES_SOURCE_AUTHORITY = false as const;
export const D1J_R2_FEASIBILITY_AUTHORITY_CAN_OVERRIDE_CHECK_STATUS = false as const;
export const D1J_R2_AI_GOVERNING_AUTHORITY_CREATED = false as const;
export const D1J_R2_AI_CAN_ORIGINATE_GOVERNING_OBJECTIVE_VALUE = false as const;
export const D1J_R2_AI_CAN_ORIGINATE_GOVERNING_CHECK_STATUS = false as const;
export const D1J_R2_AI_CAN_WAIVE_REQUIRED_CHECK = false as const;
export const D1J_R2_TRUSTED_RECORDED_TIME_REQUIRED = true as const;
export const D1J_R2_RUNTIME_API = "registerObjectiveDefinition, createObjectiveSet, registerConstraintDefinition, createRequiredCheckSet, bindEvaluationDefinitionToProblem, registerBaselineEvaluationSubject, registerCheckResultReference, registerAnalysisResultReference, registerObjectiveValueReference, createEvaluationEvidenceSet, evaluateEvaluationCompleteness, deriveFeasibilityReference, inspectFeasibilityReference, propagateEvaluationStaleness, produceObjectiveConstraintReferenceResult" as const;
export const D1J_R2_ENGINEERING_EXECUTION_API_COUNT = 0 as const;
export const D1J_R2_CHECK_REFERENCE_TRUST_BOUNDARY = "The caller may name a check-result id, an expected fingerprint, the baseline subject, and the constraint. The caller does not author PASS, FAIL, authority, validation, or the result fingerprint." as const;
export const D1J_R2_OBJECTIVE_VALUE_TRUST_BOUNDARY = "The caller may name an objective source and an expected fingerprint. The caller number is not the governing value." as const;
export const D1J_R2_CALLER_CAN_PROMOTE_ANALYSIS_VALIDATION = false as const;
export const D1J_R2_ERROR_TAXONOMY = "OPTIMIZATION_PROBLEM_NOT_FOUND, PROBLEM_NOT_R1_FOUNDATION, OBJECTIVE_SOURCE_UNSUPPORTED, OBJECTIVE_SOURCE_NOT_FOUND, OBJECTIVE_FINGERPRINT_MISMATCH, OBJECTIVE_UNIT_REQUIRED, OBJECTIVE_UNIT_INCOMPATIBLE, DUPLICATE_OBJECTIVE, CONSTRAINT_TYPE_UNSUPPORTED, CHECK_SOURCE_UNSUPPORTED, CHECK_RESULT_NOT_FOUND, CHECK_FINGERPRINT_MISMATCH, CHECK_TARGET_MISMATCH, CHECK_STANDARD_MISMATCH, CHECK_STALE, CHECK_INVALID, CHECK_APPLICABILITY_UNRESOLVED, CHECK_STATUS_UNRESOLVED, REQUIRED_CHECK_MISSING, REQUIRED_CHECK_UNSUPPORTED, ANALYSIS_RESULT_NOT_FOUND, ANALYSIS_FINGERPRINT_MISMATCH, ANALYSIS_STALE, ANALYSIS_ASSURANCE_INSUFFICIENT, OBJECTIVE_VALUE_NOT_FOUND, OBJECTIVE_VALUE_FINGERPRINT_MISMATCH, EVALUATION_SUBJECT_UNSUPPORTED, EVIDENCE_AMBIGUOUS, EMPTY_REQUIRED_CHECK_SET, CROSS_PROJECT_OPERATION, CROSS_TENANT_OPERATION, UNAUTHORIZED" as const;
export const D1J_R2_RUNTIME_RESULT_CONTRACT = "The result pins the successor problem, objective set, required-check set, baseline subject, exact references, evidence set, completeness, and feasibility reference. It is not design approval or certification." as const;
export const D1J_R2_RUNTIME_RESULT_EQUALS_DESIGN_APPROVAL = false as const;
export const D1J_R2_RUNTIME_RESULT_EQUALS_CERTIFICATION = false as const;
export const D1J_R2_EVENTS = [
  "OPTIMIZATION_OBJECTIVE_DEFINED",
  "OPTIMIZATION_OBJECTIVE_SET_CREATED",
  "OPTIMIZATION_CONSTRAINT_DEFINED",
  "OPTIMIZATION_REQUIRED_CHECK_SET_CREATED",
  "OPTIMIZATION_PROBLEM_EVALUATION_DEFINITION_BOUND",
  "OPTIMIZATION_CHECK_REFERENCE_REGISTERED",
  "OPTIMIZATION_OBJECTIVE_VALUE_REFERENCE_REGISTERED",
  "OPTIMIZATION_EVIDENCE_SET_CREATED",
  "OPTIMIZATION_FEASIBILITY_REFERENCE_RECORDED",
  "OPTIMIZATION_EVALUATION_STALE",
] as const;
export const D1J_R2_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1J_R2_EVENT_EXECUTES_ENGINEERING_CHECK = false as const;
export const D1J_R2_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1J_R2_IDEMPOTENCY_POLICY = "Repeating the same objective, set, constraint, check set, reference, evidence set, or feasibility content returns the existing record and does not append a second history row." as const;
export const D1J_R2_DUPLICATE_REFERENCE_COUNTS_AS_INDEPENDENT_EVIDENCE = false as const;
export const D1J_R2_INVENTS_NEW_ENGINEERING_PARAMETER_SEMANTICS = false as const;
export const D1J_R3_PARAMETER_SEMANTIC_PREREQUISITE = "Before a candidate assignment can claim a design-state mapping, it must cite a concrete governed parameter semantic. An R1 variable kind is not that semantic." as const;
export const D1J_R3_PARAMETER_HANDOFF_GUARD = "R3 may record candidate identity only against exact governed design-state references. It must not map generic R1 variable kinds onto model properties or apply assignments to D1F, D1G, or BIM models." as const;
export const D1J_R2_OBJECTIVE_DEFINITION_RUNTIME_COUNT = 1 as const;
export const D1J_R2_OBJECTIVE_SET_RUNTIME_COUNT = 1 as const;
export const D1J_R2_CONSTRAINT_DEFINITION_RUNTIME_COUNT = 1 as const;
export const D1J_R2_REQUIRED_CHECK_SET_RUNTIME_COUNT = 1 as const;
export const D1J_R2_CHECK_RESULT_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1J_R2_ANALYSIS_RESULT_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1J_R2_OBJECTIVE_VALUE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1J_R2_EVALUATION_EVIDENCE_SET_RUNTIME_COUNT = 1 as const;
export const D1J_R2_EVALUATION_COMPLETENESS_RUNTIME_COUNT = 1 as const;
export const D1J_R2_FEASIBILITY_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1J_R2_CANDIDATE_RUNTIME_COUNT = 0 as const;
export const D1J_R2_CANDIDATE_GENERATION_RUNTIME_COUNT = 0 as const;
export const D1J_R2_OPTIMIZATION_ALGORITHM_RUNTIME_COUNT = 0 as const;
export const D1J_R2_PARETO_RUNTIME_COUNT = 0 as const;
export const D1J_R2_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1J_R2_ENGINEERING_CHECK_EXECUTION_COUNT = 0 as const;
export const D1J_R2_AUTOMATIC_DESIGN_SELECTION_COUNT = 0 as const;
export const D1J_R2_CERTIFICATION_EVIDENCE_RUNTIME_COUNT = 0 as const;
export const D1J_R2_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1J_R2_OPTIMIZATION_INTELLIGENCE_REUSED = true as const;
export const D1J_R2_PARALLEL_GENERIC_OPTIMIZATION_PLATFORM_CREATED = false as const;
export const D1J_R2_DIGITAL_THREAD_REUSED = true as const;
export const D1J_R2_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1J_R2_REAUTHORS_D1B_BINDING = false as const;
export const D1J_R2_REAUTHORS_D1D_CHECKS = false as const;
export const D1J_R2_REAUTHORS_D1E_CHECKS = false as const;
export const D1J_R2_REAUTHORS_D1F_IDENTITY = false as const;
export const D1J_R2_REAUTHORS_D1G_RESULTS = false as const;
export const D1J_R2_REAUTHORS_D1I_HISTORY = false as const;
export const D1J_R2_D1I_MATURITY_PROMOTION = false as const;
export const D1J_R2_D1G_MATURITY_PROMOTION = false as const;
export const D1J_R2_D1G_CERTIFICATION_PROMOTION = false as const;
export const D1J_R2_D1D_MATURITY_PROMOTION = false as const;
export const D1J_R2_D1E_MATURITY_PROMOTION = false as const;
export const D1J_R2_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1J_R2_PARALLEL_CAPABILITY_MANIFEST_CREATED = false as const;
export const D1J_R2_NEW_DEPENDENCY_COUNT = 0 as const;
export const D1J_R2_CROSS_PROJECT_OPERATION_ALLOWED = false as const;
export const D1J_R2_CROSS_TENANT_OPERATION_ALLOWED = false as const;
export const D1J_R2_CHECK_AUTHORITY_SPOOF_ALLOWED = false as const;
export const D1J_R2_OBJECTIVE_AUTHORITY_SPOOF_ALLOWED = false as const;
export const D1J_R2_APPLICABILITY_WAIVER_BYPASSES_AUTHORIZATION = false as const;
export const D1J_R2_EXPRESSION_EXECUTION_SURFACE_CREATED = false as const;
export const D1J_R2_ARBITRARY_EXTERNAL_SELECTOR_ALLOWED = false as const;
export const D1J_R2_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1J_R2_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1J_R3_HANDOFF_READY = true as const;
export const D1J_R3_CANONICAL_PHASE = "EOS-D1J-R3-CANDIDATE-LINEAGE-COMPARISON-COMPOSITION" as const;
export const D1J_R3_PHASE_TYPE = "STRUCTURAL_OPTIMIZATION_CANDIDATE_LINEAGE_COMPARISON_COMPOSITION" as const;
export const D1J_R3_CANONICAL_SCOPE = "IMPLEMENT BOUNDED GOVERNED DESIGN-CANDIDATE IDENTITY, IMMUTABLE CANDIDATE LINEAGE, EXACT VARIABLE-ASSIGNMENT REFERENCES WHERE PARAMETER SEMANTICS ARE SUFFICIENT, HUMAN-DEFINED / GOVERNED-IMPORTED CANDIDATE REGISTRATION, EXACT R2 EVALUATION / FEASIBILITY REFERENCES, CANDIDATE COMPARISON ELIGIBILITY, AND MULTI-OBJECTIVE CANDIDATE-SET COMPOSITION, WITHOUT AUTOMATIC CANDIDATE GENERATION, WITHOUT OPTIMIZATION ALGORITHM EXECUTION, WITHOUT SOLVER EXECUTION, WITHOUT AUTOMATIC DESIGN SELECTION, AND WITHOUT CERTIFICATION CLAIMS" as const;
export const D1J_R3_REQUIRED_R2_CONTRACTS = "R1 problem identity and fingerprint, baseline identity and fingerprint, scope, variable definitions and set, parameter semantic readiness, objective definitions and set, constraint definitions, required-check set, evaluation subject, check-result references, analysis-result references, objective-value references, evidence set, evaluation completeness, feasibility reference, authority, provenance, fingerprints, history, and staleness." as const;

const OBJECTIVE_DOMAINS = ["GOVERNED_QUANTITY", "D1G_ANALYSIS_METRIC"] as const;
const CHECK_DOMAINS = ["D1D_STEEL_MEMBER_CHECK", "D1E_CONCRETE_DESIGN_CHECK"] as const;
const VERDICT_MAP = { CHECK_SATISFIED: "PASS", CHECK_NOT_SATISFIED: "FAIL", CHECK_UNDETERMINED: "UNRESOLVED" } as const;
const BLOCKED = ["[", "]", ".", "__proto__", "constructor", "prototype", "/", "\\", "$", " ", "eval", "select "];

export type D1jR2Actor = { actorId: string; tenantId: string; workspaceId: string; projectId: string; authority: string };
export type D1jR2Status = "CURRENT" | "STALE" | "INVALID" | "UNSUPPORTED" | "SUPERSEDED";
export type D1jR2CheckStatus = "PASS" | "FAIL" | "UNRESOLVED";
export type D1jR2Completeness = (typeof D1J_COMPLETENESS_STATES)[number];
export type D1jR2Feasibility = (typeof D1J_FEASIBILITY_STATES)[number];

export type D1jR2ObjectiveSource = {
  sourceId: string;
  sourceDomain: (typeof OBJECTIVE_DOMAINS)[number];
  version: string;
  fingerprint: string;
  quantity: string;
  unit: string;
  value: number;
  authority: string;
  validationState: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  targetId: string;
  status: "CURRENT" | "STALE" | "INVALID";
  evidenceClass: "OWNED" | "FIXTURE";
};

export type D1jR2OwnedCheck = {
  checkResultId: string;
  sourceDomain: (typeof CHECK_DOMAINS)[number];
  checkKind: string;
  version: string;
  fingerprint: string;
  targetId: string;
  jurisdictionBindingRef: string;
  standardBindingRefs: readonly string[];
  authoritativeVerdict: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED" | null;
  numericMetric: number | null;
  authority: string;
  validationState: string;
  analysisResultId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  status: "CURRENT" | "STALE" | "INVALID" | "UNSUPPORTED";
  evidenceClass: "OWNED" | "FIXTURE";
};

export type D1jR2OwnedAnalysis = {
  resultSetId: string;
  analysisRunId: string;
  analysisModelId: string;
  version: string;
  fingerprint: string;
  providerId: string;
  validationState: string;
  solverReadiness: string;
  targetId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  status: "CURRENT" | "STALE" | "INVALID";
  evidenceClass: "OWNED" | "FIXTURE";
};

export type D1jR2ApplicabilityRuling = {
  rulingId: string;
  applicability: "REQUIRED" | "CONDITIONAL" | "NOT_APPLICABLE";
  authority: string;
  fingerprint: string;
  status: "CURRENT" | "STALE";
};

export type D1jR2Catalog = {
  objectiveSources: D1jR2ObjectiveSource[];
  checkResults: D1jR2OwnedCheck[];
  analyses: D1jR2OwnedAnalysis[];
  applicabilityRulings: D1jR2ApplicabilityRuling[];
  evaluationProfiles: { profileId: string; solverAssurance: "NONE" | "CERTIFIED_SOLVER_REQUIRED"; fingerprint: string }[];
  solverReadinessChanged: boolean;
};

type Provenance = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  registrationAuthority: string;
  sourceAuthority: string;
  sourceRefs: readonly string[];
  recordedAt: string;
  callerBackdated: false;
  fingerprint: string;
};

export type D1jR2Store = {
  r1: D1jR1Store;
  catalog: D1jR2Catalog;
  now: () => string;
  objectives: D1jR2Objective[];
  objectiveSets: D1jR2ObjectiveSet[];
  constraints: D1jR2Constraint[];
  checkSets: D1jR2CheckSet[];
  problems: D1jR2Problem[];
  subjects: D1jR2Subject[];
  checkRefs: D1jR2CheckRef[];
  analysisRefs: D1jR2AnalysisRef[];
  valueRefs: D1jR2ValueRef[];
  evidenceSets: D1jR2Evidence[];
  feasibilityRefs: D1jR2FeasibilityRef[];
  history: { historyId: string; subjectId: string; action: string; fingerprint: string; recordedAt: string }[];
  events: { eventId: string; eventType: (typeof D1J_R2_EVENTS)[number]; subjectId: string; engineeringApproval: false; executesCheck: false }[];
};

export type D1jR2Objective = {
  objectiveId: string;
  optimizationProblemId: string;
  semanticType: string;
  quantity: string;
  unit: string;
  direction: (typeof D1J_OBJECTIVE_DIRECTIONS)[number];
  sourceDomain: (typeof OBJECTIVE_DOMAINS)[number];
  sourceId: string;
  sourceFingerprint: string;
  sourceAuthority: string;
  normalizationPolicyRef: null;
  defaultWeight: null;
  status: "CURRENT" | "STALE" | "SUPERSEDED";
  version: string;
  fingerprint: string;
  provenance: Provenance;
};

export type D1jR2ObjectiveSet = {
  objectiveSetId: string;
  optimizationProblemId: string;
  objectiveIds: readonly string[];
  objectiveFingerprints: readonly string[];
  status: "CURRENT" | "STALE" | "SUPERSEDED";
  version: string;
  fingerprint: string;
  provenance: Provenance;
};

export type D1jR2Constraint = {
  constraintId: string;
  optimizationProblemId: string;
  sourceDomain: (typeof CHECK_DOMAINS)[number];
  checkKind: string;
  targetId: string;
  applicability: "REQUIRED" | "CONDITIONAL" | "NOT_APPLICABLE" | "UNRESOLVED";
  requiredness: "REQUIRED" | "CONDITIONAL" | "NOT_APPLICABLE";
  rulingId: string | null;
  authority: string;
  sourceAuthority: string;
  jurisdictionBindingRef: string;
  standardBindingRefs: readonly string[];
  status: "CURRENT" | "STALE" | "SUPERSEDED";
  version: string;
  fingerprint: string;
  provenance: Provenance;
};

export type D1jR2CheckSet = {
  requiredCheckSetId: string;
  optimizationProblemId: string;
  constraintIds: readonly string[];
  constraintFingerprints: readonly string[];
  solverAssurance: "NONE" | "CERTIFIED_SOLVER_REQUIRED";
  evaluationProfileRef: string;
  status: "CURRENT" | "STALE" | "SUPERSEDED";
  version: string;
  fingerprint: string;
  provenance: Provenance;
};

export type D1jR2Problem = {
  optimizationProblemId: string;
  predecessorProblemId: string;
  r1Fingerprint: string;
  baselineRefId: string;
  scope: D1jR1Problem["scope"];
  variableSetRef: string | null;
  variableSetFingerprint: string | null;
  jurisdictionBindingRef: string;
  standardBindingRefs: readonly string[];
  bindingFingerprint: string;
  objectiveSetRef: string;
  objectiveSetFingerprint: string;
  requiredCheckSetRef: string;
  requiredCheckSetFingerprint: string;
  evaluationProfileRef: string;
  evaluationProfileFingerprint: string;
  status: typeof D1J_R2_PROBLEM_STATUS | "STALE";
  optimizationRuntimeReady: false;
  candidateGenerationReady: false;
  certificationReady: false;
  version: string;
  fingerprint: string;
  provenance: Provenance;
};

export type D1jR2Subject = {
  subjectId: string;
  subjectKind: "BASELINE_DESIGN_REFERENCE";
  baselineRefId: string;
  baselineFingerprint: string;
  fingerprint: string;
};

export type D1jR2CheckRef = {
  checkResultReferenceId: string;
  subjectId: string;
  constraintId: string;
  sourceCheckResultId: string;
  sourceDomain: (typeof CHECK_DOMAINS)[number];
  sourceVersion: string;
  sourceFingerprint: string;
  targetId: string;
  authoritativeStatus: D1jR2CheckStatus;
  sourceAuthority: string;
  analysisResultId: string | null;
  evidenceClass: "OWNED" | "FIXTURE";
  copiesSourceBody: false;
  status: "CURRENT" | "STALE";
  fingerprint: string;
  provenance: Provenance;
};

export type D1jR2AnalysisRef = {
  analysisReferenceId: string;
  resultSetId: string;
  analysisRunId: string;
  analysisModelId: string;
  sourceVersion: string;
  sourceFingerprint: string;
  providerId: string;
  validationState: string;
  certifiedSolverStatus: typeof D1G_CERTIFIED_SOLVER_STATUS;
  promotesAuthority: false;
  copiesSourceBody: false;
  status: "CURRENT" | "STALE";
  fingerprint: string;
  provenance: Provenance;
};

export type D1jR2ValueRef = {
  objectiveValueReferenceId: string;
  subjectId: string;
  objectiveId: string;
  sourceId: string;
  sourceVersion: string;
  sourceFingerprint: string;
  value: number;
  unit: string;
  sourceAuthority: string;
  evidenceClass: "OWNED" | "FIXTURE";
  copiesSourceBody: false;
  status: "CURRENT" | "STALE";
  fingerprint: string;
  provenance: Provenance;
};

export type D1jR2Evidence = {
  evaluationEvidenceSetId: string;
  optimizationProblemId: string;
  subjectId: string;
  objectiveSetRef: string;
  requiredCheckSetRef: string;
  objectiveValueReferenceIds: readonly string[];
  checkResultReferenceIds: readonly string[];
  analysisReferenceIds: readonly string[];
  status: "CURRENT" | "STALE" | "SUPERSEDED";
  version: string;
  fingerprint: string;
  provenance: Provenance;
};

export type D1jR2FeasibilityRef = {
  feasibilityReferenceId: string;
  optimizationProblemId: string;
  subjectId: string;
  requiredCheckSetFingerprint: string;
  checkResultReferenceIds: readonly string[];
  missingCheckIds: readonly string[];
  staleCheckIds: readonly string[];
  invalidCheckIds: readonly string[];
  unsupportedCheckIds: readonly string[];
  unresolvedApplicabilityIds: readonly string[];
  insufficientAssuranceIds: readonly string[];
  failedCheckIds: readonly string[];
  feasibilityState: D1jR2Feasibility;
  evaluationCompleteness: D1jR2Completeness;
  objectiveCompleteness: D1jR2Completeness;
  productionEngineeringEvidence: boolean;
  certificationEligible: false;
  executesFormula: false;
  status: "CURRENT" | "STALE";
  fingerprint: string;
  provenance: Provenance;
};

function fail(code: string): never {
  throw new Error(code);
}

function assertHuman(actor: D1jR2Actor): void {
  if (!actor.authority || actor.authority === "AI" || actor.authority === "LLM") fail("UNAUTHORIZED");
}

function assertIsolation(actor: D1jR2Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

function blocked(value: string): boolean {
  const text = value.toLowerCase();
  return BLOCKED.some((token) => text.includes(token));
}

function remember(store: D1jR2Store, subjectId: string, action: string, fingerprint: string): void {
  store.history.push({ historyId: `h-${store.history.length + 1}`, subjectId, action, fingerprint, recordedAt: store.now() });
}

function emit(store: D1jR2Store, eventType: (typeof D1J_R2_EVENTS)[number], subjectId: string): void {
  store.events.push({ eventId: `e-${store.events.length + 1}`, eventType, subjectId, engineeringApproval: false, executesCheck: false });
}

function provenance(actor: D1jR2Actor, sourceAuthority: string, sourceRefs: readonly string[], fingerprint: string, recordedAt: string): Provenance {
  return { tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, registrationAuthority: actor.authority, sourceAuthority, sourceRefs, recordedAt, callerBackdated: false, fingerprint };
}

function r1Problem(store: D1jR2Store, problemId: string): D1jR1Problem {
  const problem = store.r1.problems.find((row) => row.optimizationProblemId === problemId) ?? fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
  if (problem.status !== "FOUNDATION_DEFINED" || problem.objectiveSetRef !== null) fail("PROBLEM_NOT_R1_FOUNDATION");
  return problem;
}

function allowCheck(domain: string, kind: string): boolean {
  if (domain === "D1D_STEEL_MEMBER_CHECK") return (STEEL_MEMBER_DESIGN_CHECK_KINDS as readonly string[]).includes(kind);
  if (domain === "D1E_CONCRETE_DESIGN_CHECK") return (CONCRETE_LIMIT_STATES as readonly string[]).includes(kind);
  return false;
}

export function createD1jR2Store(r1: D1jR1Store, catalog: D1jR2Catalog, now: () => string): D1jR2Store {
  return {
    r1, catalog, now,
    objectives: [], objectiveSets: [], constraints: [], checkSets: [], problems: [], subjects: [],
    checkRefs: [], analysisRefs: [], valueRefs: [], evidenceSets: [], feasibilityRefs: [], history: [], events: [],
  };
}

export function registerObjectiveDefinition(store: D1jR2Store, actor: D1jR2Actor, input: {
  objectiveId: string;
  optimizationProblemId: string;
  semanticType: string;
  direction: string;
  sourceId: string;
  unit?: string | null;
  callerValue?: number | null;
  callerAuthority?: string | null;
  version: string;
  successorOfObjectiveId?: string | null;
}): D1jR2Objective {
  assertHuman(actor);
  const problem = r1Problem(store, input.optimizationProblemId);
  assertIsolation(actor, problem);
  if (!(D1J_OBJECTIVE_DIRECTIONS as readonly string[]).includes(input.direction)) fail("OBJECTIVE_SOURCE_UNSUPPORTED");
  const source = store.catalog.objectiveSources.find((row) => row.sourceId === input.sourceId);
  if (!source || !(OBJECTIVE_DOMAINS as readonly string[]).includes(source.sourceDomain)) fail("OBJECTIVE_SOURCE_NOT_FOUND");
  if (blocked(input.semanticType) || input.semanticType !== source.sourceDomain) fail("OBJECTIVE_SOURCE_UNSUPPORTED");
  assertIsolation(actor, source);
  if (source.status !== "CURRENT") fail("OBJECTIVE_SOURCE_NOT_FOUND");
  if (!input.unit) fail("OBJECTIVE_UNIT_REQUIRED");
  if (!existingUnitPairCompatible(source.quantity, input.unit, source.unit)) fail("OBJECTIVE_UNIT_INCOMPATIBLE");
  const fingerprint = fingerprintCanonical({
    problem: problem.fingerprint, semanticType: input.semanticType, quantity: source.quantity, unit: input.unit,
    direction: input.direction, sourceDomain: source.sourceDomain, sourceFingerprint: source.fingerprint, version: input.version,
  });
  const duplicate = store.objectives.find((row) => row.optimizationProblemId === problem.optimizationProblemId && row.semanticType === input.semanticType && row.quantity === source.quantity && row.sourceDomain === source.sourceDomain && row.status !== "SUPERSEDED");
  if (duplicate && input.successorOfObjectiveId !== duplicate.objectiveId) {
    if (duplicate.fingerprint === fingerprint) return duplicate;
    fail("DUPLICATE_OBJECTIVE");
  }
  if (input.successorOfObjectiveId) {
    const previous = store.objectives.find((row) => row.objectiveId === input.successorOfObjectiveId && row.status !== "SUPERSEDED") ?? fail("DUPLICATE_OBJECTIVE");
    previous.status = "SUPERSEDED";
    remember(store, previous.objectiveId, "SUPERSEDED", previous.fingerprint);
  }
  const recordedAt = store.now();
  const objective: D1jR2Objective = {
    objectiveId: input.objectiveId, optimizationProblemId: problem.optimizationProblemId, semanticType: input.semanticType,
    quantity: source.quantity, unit: input.unit, direction: input.direction as D1jR2Objective["direction"], sourceDomain: source.sourceDomain,
    sourceId: source.sourceId, sourceFingerprint: source.fingerprint, sourceAuthority: source.authority, normalizationPolicyRef: null, defaultWeight: null,
    status: "CURRENT", version: input.version, fingerprint, provenance: provenance(actor, source.authority, [source.sourceId], fingerprint, recordedAt),
  };
  store.objectives.push(objective);
  remember(store, objective.objectiveId, "CREATED", fingerprint);
  emit(store, "OPTIMIZATION_OBJECTIVE_DEFINED", objective.objectiveId);
  return objective;
}

export function createObjectiveSet(store: D1jR2Store, actor: D1jR2Actor, input: { objectiveSetId: string; optimizationProblemId: string; objectiveIds: readonly string[]; version: string }): D1jR2ObjectiveSet {
  assertHuman(actor);
  if (input.objectiveIds.length === 0) fail("OBJECTIVE_SOURCE_NOT_FOUND");
  const problem = r1Problem(store, input.optimizationProblemId);
  assertIsolation(actor, problem);
  const chosen = input.objectiveIds.map((id) => store.objectives.find((row) => row.objectiveId === id && row.status === "CURRENT") ?? fail("OBJECTIVE_SOURCE_NOT_FOUND"));
  const ordered = [...chosen].sort((left, right) => left.fingerprint.localeCompare(right.fingerprint));
  const fingerprint = fingerprintCanonical({ problem: problem.fingerprint, objectives: ordered.map((row) => row.fingerprint) });
  const existing = store.objectiveSets.find((row) => row.fingerprint === fingerprint && row.status !== "SUPERSEDED");
  if (existing) return existing;
  const recordedAt = store.now();
  const set: D1jR2ObjectiveSet = {
    objectiveSetId: input.objectiveSetId, optimizationProblemId: problem.optimizationProblemId,
    objectiveIds: ordered.map((row) => row.objectiveId), objectiveFingerprints: ordered.map((row) => row.fingerprint),
    status: "CURRENT", version: input.version, fingerprint, provenance: provenance(actor, actor.authority, ordered.map((row) => row.objectiveId), fingerprint, recordedAt),
  };
  store.objectiveSets.push(set);
  remember(store, set.objectiveSetId, "CREATED", fingerprint);
  emit(store, "OPTIMIZATION_OBJECTIVE_SET_CREATED", set.objectiveSetId);
  return set;
}

export function registerConstraintDefinition(store: D1jR2Store, actor: D1jR2Actor, input: {
  constraintId: string;
  optimizationProblemId: string;
  sourceDomain: string;
  checkKind: string;
  targetId: string;
  applicability: string;
  rulingId?: string | null;
  version: string;
  successorOfConstraintId?: string | null;
}): D1jR2Constraint {
  assertHuman(actor);
  const problem = r1Problem(store, input.optimizationProblemId);
  assertIsolation(actor, problem);
  if (blocked(input.checkKind) || blocked(input.sourceDomain)) fail("CONSTRAINT_TYPE_UNSUPPORTED");
  if (!(CHECK_DOMAINS as readonly string[]).includes(input.sourceDomain)) fail("CHECK_SOURCE_UNSUPPORTED");
  if (!allowCheck(input.sourceDomain, input.checkKind)) fail("CONSTRAINT_TYPE_UNSUPPORTED");
  const target = store.r1.catalog.identities.find((row) => row.id === input.targetId);
  if (!target) fail("CHECK_TARGET_MISMATCH");
  assertIsolation(actor, target);
  const inScope = problem.scope.scopeKind === "STRUCTURAL_SYSTEM"
    ? target.id === problem.scope.structuralSystemId || target.structuralSystemId === problem.scope.structuralSystemId
    : problem.scope.memberIds.includes(target.id);
  if (!inScope) fail("CHECK_TARGET_MISMATCH");
  let applicability = input.applicability;
  let rulingId: string | null = null;
  if (applicability === "NOT_APPLICABLE" || applicability === "CONDITIONAL") {
    const ruling = store.catalog.applicabilityRulings.find((row) => row.rulingId === input.rulingId && row.status === "CURRENT");
    if (!ruling || ruling.applicability !== applicability || ruling.authority === "AI") fail("CHECK_APPLICABILITY_UNRESOLVED");
    rulingId = ruling.rulingId;
  } else if (applicability !== "REQUIRED") fail("CHECK_APPLICABILITY_UNRESOLVED");
  const binding = store.r1.catalog.bindings.find((row) => row.bindingId && row.fingerprint === problem.bindingFingerprint);
  if (!binding) fail("CHECK_STANDARD_MISMATCH");
  const fingerprint = fingerprintCanonical({
    problem: problem.fingerprint, domain: input.sourceDomain, kind: input.checkKind, target: target.id,
    applicability, ruling: rulingId, standards: [...problem.standardBindingRefs].sort(), version: input.version,
  });
  const duplicate = store.constraints.find((row) => row.optimizationProblemId === problem.optimizationProblemId && row.checkKind === input.checkKind && row.targetId === target.id && row.status !== "SUPERSEDED");
  if (duplicate && input.successorOfConstraintId !== duplicate.constraintId) {
    if (duplicate.fingerprint === fingerprint) return duplicate;
    fail("DUPLICATE_OBJECTIVE");
  }
  if (input.successorOfConstraintId) {
    const previous = store.constraints.find((row) => row.constraintId === input.successorOfConstraintId) ?? fail("DUPLICATE_OBJECTIVE");
    previous.status = "SUPERSEDED";
    remember(store, previous.constraintId, "SUPERSEDED", previous.fingerprint);
  }
  const recordedAt = store.now();
  const constraint: D1jR2Constraint = {
    constraintId: input.constraintId, optimizationProblemId: problem.optimizationProblemId,
    sourceDomain: input.sourceDomain as D1jR2Constraint["sourceDomain"], checkKind: input.checkKind, targetId: target.id,
    applicability: applicability as D1jR2Constraint["applicability"], requiredness: applicability as D1jR2Constraint["requiredness"],
    rulingId, authority: actor.authority, sourceAuthority: "OWNING_CHECK_ENGINE", jurisdictionBindingRef: binding.jurisdictionBindingRef,
    standardBindingRefs: [...binding.standardBindingRefs], status: "CURRENT", version: input.version, fingerprint,
    provenance: provenance(actor, "OWNING_CHECK_ENGINE", [input.checkKind], fingerprint, recordedAt),
  };
  store.constraints.push(constraint);
  remember(store, constraint.constraintId, "CREATED", fingerprint);
  emit(store, "OPTIMIZATION_CONSTRAINT_DEFINED", constraint.constraintId);
  return constraint;
}

export function createRequiredCheckSet(store: D1jR2Store, actor: D1jR2Actor, input: { requiredCheckSetId: string; optimizationProblemId: string; constraintIds: readonly string[]; evaluationProfileId: string; version: string }): D1jR2CheckSet {
  assertHuman(actor);
  if (input.constraintIds.length === 0) fail("EMPTY_REQUIRED_CHECK_SET");
  const problem = r1Problem(store, input.optimizationProblemId);
  assertIsolation(actor, problem);
  const profile = store.catalog.evaluationProfiles.find((row) => row.profileId === input.evaluationProfileId) ?? fail("ANALYSIS_ASSURANCE_INSUFFICIENT");
  const chosen = input.constraintIds.map((id) => store.constraints.find((row) => row.constraintId === id && row.status === "CURRENT") ?? fail("REQUIRED_CHECK_MISSING"));
  const ordered = [...chosen].sort((left, right) => left.fingerprint.localeCompare(right.fingerprint));
  const fingerprint = fingerprintCanonical({ problem: problem.fingerprint, constraints: ordered.map((row) => row.fingerprint), assurance: profile.solverAssurance, profile: profile.fingerprint });
  const existing = store.checkSets.find((row) => row.fingerprint === fingerprint && row.status !== "SUPERSEDED");
  if (existing) return existing;
  const recordedAt = store.now();
  const set: D1jR2CheckSet = {
    requiredCheckSetId: input.requiredCheckSetId, optimizationProblemId: problem.optimizationProblemId,
    constraintIds: ordered.map((row) => row.constraintId), constraintFingerprints: ordered.map((row) => row.fingerprint),
    solverAssurance: profile.solverAssurance, evaluationProfileRef: profile.profileId, status: "CURRENT", version: input.version, fingerprint,
    provenance: provenance(actor, actor.authority, ordered.map((row) => row.constraintId), fingerprint, recordedAt),
  };
  store.checkSets.push(set);
  remember(store, set.requiredCheckSetId, "CREATED", fingerprint);
  emit(store, "OPTIMIZATION_REQUIRED_CHECK_SET_CREATED", set.requiredCheckSetId);
  return set;
}

export function bindEvaluationDefinitionToProblem(store: D1jR2Store, actor: D1jR2Actor, input: { successorProblemId: string; predecessorProblemId: string; objectiveSetId: string; requiredCheckSetId: string; version: string }): D1jR2Problem {
  assertHuman(actor);
  const prior = r1Problem(store, input.predecessorProblemId);
  const priorSnapshot = JSON.stringify(prior);
  assertIsolation(actor, prior);
  const objectiveSet = store.objectiveSets.find((row) => row.objectiveSetId === input.objectiveSetId && row.status === "CURRENT") ?? fail("OBJECTIVE_SOURCE_NOT_FOUND");
  const checkSet = store.checkSets.find((row) => row.requiredCheckSetId === input.requiredCheckSetId && row.status === "CURRENT") ?? fail("REQUIRED_CHECK_MISSING");
  const profile = store.catalog.evaluationProfiles.find((row) => row.profileId === checkSet.evaluationProfileRef) ?? fail("ANALYSIS_ASSURANCE_INSUFFICIENT");
  const variableSet = prior.variableSetRef ? inspectVariableSet(store.r1, prior.variableSetRef) : null;
  const fingerprint = fingerprintCanonical({
    r1: prior.fingerprint, objectiveSet: objectiveSet.fingerprint, requiredCheckSet: checkSet.fingerprint, profile: profile.fingerprint, version: input.version,
  });
  const existing = store.problems.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const recordedAt = store.now();
  const successor: D1jR2Problem = {
    optimizationProblemId: input.successorProblemId, predecessorProblemId: prior.optimizationProblemId, r1Fingerprint: prior.fingerprint,
    baselineRefId: prior.baselineRefId, scope: prior.scope, variableSetRef: prior.variableSetRef, variableSetFingerprint: variableSet?.fingerprint ?? null,
    jurisdictionBindingRef: prior.jurisdictionBindingRef, standardBindingRefs: [...prior.standardBindingRefs], bindingFingerprint: prior.bindingFingerprint,
    objectiveSetRef: objectiveSet.objectiveSetId, objectiveSetFingerprint: objectiveSet.fingerprint,
    requiredCheckSetRef: checkSet.requiredCheckSetId, requiredCheckSetFingerprint: checkSet.fingerprint,
    evaluationProfileRef: profile.profileId, evaluationProfileFingerprint: profile.fingerprint,
    status: D1J_R2_PROBLEM_STATUS, optimizationRuntimeReady: false, candidateGenerationReady: false, certificationReady: false,
    version: input.version, fingerprint, provenance: provenance(actor, prior.provenance.sourceAuthority, [prior.optimizationProblemId, objectiveSet.objectiveSetId, checkSet.requiredCheckSetId], fingerprint, recordedAt),
  };
  store.problems.push(successor);
  remember(store, successor.optimizationProblemId, "CREATED", fingerprint);
  emit(store, "OPTIMIZATION_PROBLEM_EVALUATION_DEFINITION_BOUND", successor.optimizationProblemId);
  if (JSON.stringify(prior) !== priorSnapshot) fail("PROBLEM_NOT_R1_FOUNDATION");
  return successor;
}

export function registerBaselineEvaluationSubject(store: D1jR2Store, actor: D1jR2Actor, input: { subjectId: string; optimizationProblemId: string }): D1jR2Subject {
  assertHuman(actor);
  const problem = store.problems.find((row) => row.optimizationProblemId === input.optimizationProblemId) ?? fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
  const baseline = inspectBaselineDesignReference(store.r1, problem.baselineRefId);
  const fingerprint = fingerprintCanonical({ kind: "BASELINE_DESIGN_REFERENCE", baseline: baseline.fingerprint });
  const existing = store.subjects.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const subject: D1jR2Subject = { subjectId: input.subjectId, subjectKind: "BASELINE_DESIGN_REFERENCE", baselineRefId: baseline.baselineRefId, baselineFingerprint: baseline.fingerprint, fingerprint };
  store.subjects.push(subject);
  return subject;
}

export function registerCheckResultReference(store: D1jR2Store, actor: D1jR2Actor, input: {
  checkResultReferenceId: string;
  subjectId: string;
  constraintId: string;
  sourceCheckResultId: string;
  expectedFingerprint?: string | null;
  callerStatus?: string | null;
  callerAuthority?: string | null;
}): D1jR2CheckRef {
  assertHuman(actor);
  if (input.sourceCheckResultId === "latest") fail("CHECK_RESULT_NOT_FOUND");
  const subject = store.subjects.find((row) => row.subjectId === input.subjectId) ?? fail("EVALUATION_SUBJECT_UNSUPPORTED");
  if (subject.subjectKind !== "BASELINE_DESIGN_REFERENCE") fail("EVALUATION_SUBJECT_UNSUPPORTED");
  const constraint = store.constraints.find((row) => row.constraintId === input.constraintId) ?? fail("REQUIRED_CHECK_MISSING");
  const source = store.catalog.checkResults.find((row) => row.checkResultId === input.sourceCheckResultId);
  if (!source) fail("CHECK_RESULT_NOT_FOUND");
  assertIsolation(actor, source);
  if (source.sourceDomain !== constraint.sourceDomain || source.checkKind !== constraint.checkKind) fail("CHECK_SOURCE_UNSUPPORTED");
  if (source.status === "STALE") fail("CHECK_STALE");
  if (source.status === "INVALID") fail("CHECK_INVALID");
  if (source.status === "UNSUPPORTED") fail("REQUIRED_CHECK_UNSUPPORTED");
  if (input.expectedFingerprint != null && input.expectedFingerprint !== source.fingerprint) fail("CHECK_FINGERPRINT_MISMATCH");
  if (source.targetId !== constraint.targetId) fail("CHECK_TARGET_MISMATCH");
  const standards = [...source.standardBindingRefs].sort().join("|");
  if (standards !== [...constraint.standardBindingRefs].sort().join("|") || source.jurisdictionBindingRef !== constraint.jurisdictionBindingRef) fail("CHECK_STANDARD_MISMATCH");
  if (!source.authoritativeVerdict) fail("CHECK_STATUS_UNRESOLVED");
  const authoritativeStatus = VERDICT_MAP[source.authoritativeVerdict];
  const fingerprint = fingerprintCanonical({ source: source.fingerprint, constraint: constraint.fingerprint, subject: subject.fingerprint, status: authoritativeStatus });
  const existing = store.checkRefs.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const recordedAt = store.now();
  const reference: D1jR2CheckRef = {
    checkResultReferenceId: input.checkResultReferenceId, subjectId: subject.subjectId, constraintId: constraint.constraintId,
    sourceCheckResultId: source.checkResultId, sourceDomain: source.sourceDomain, sourceVersion: source.version, sourceFingerprint: source.fingerprint,
    targetId: source.targetId, authoritativeStatus, sourceAuthority: source.authority, analysisResultId: source.analysisResultId,
    evidenceClass: source.evidenceClass, copiesSourceBody: false, status: "CURRENT", fingerprint,
    provenance: provenance(actor, source.authority, [source.checkResultId], fingerprint, recordedAt),
  };
  store.checkRefs.push(reference);
  remember(store, reference.checkResultReferenceId, "CREATED", fingerprint);
  emit(store, "OPTIMIZATION_CHECK_REFERENCE_REGISTERED", reference.checkResultReferenceId);
  return reference;
}

export function registerAnalysisResultReference(store: D1jR2Store, actor: D1jR2Actor, input: {
  analysisReferenceId: string;
  resultSetId: string;
  expectedFingerprint?: string | null;
  callerValidation?: string | null;
}): D1jR2AnalysisRef {
  assertHuman(actor);
  if (input.resultSetId === "latest") fail("ANALYSIS_RESULT_NOT_FOUND");
  const source = store.catalog.analyses.find((row) => row.resultSetId === input.resultSetId);
  if (!source) fail("ANALYSIS_RESULT_NOT_FOUND");
  assertIsolation(actor, source);
  if (source.status !== "CURRENT") fail("ANALYSIS_STALE");
  if (input.expectedFingerprint != null && input.expectedFingerprint !== source.fingerprint) fail("ANALYSIS_FINGERPRINT_MISMATCH");
  const fingerprint = fingerprintCanonical({ result: source.fingerprint, run: source.analysisRunId, model: source.analysisModelId, certified: D1G_CERTIFIED_SOLVER_STATUS });
  const existing = store.analysisRefs.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const recordedAt = store.now();
  const reference: D1jR2AnalysisRef = {
    analysisReferenceId: input.analysisReferenceId, resultSetId: source.resultSetId, analysisRunId: source.analysisRunId, analysisModelId: source.analysisModelId,
    sourceVersion: source.version, sourceFingerprint: source.fingerprint, providerId: source.providerId, validationState: source.validationState,
    certifiedSolverStatus: D1G_CERTIFIED_SOLVER_STATUS, promotesAuthority: false, copiesSourceBody: false, status: "CURRENT", fingerprint,
    provenance: provenance(actor, source.providerId, [source.resultSetId], fingerprint, recordedAt),
  };
  store.analysisRefs.push(reference);
  remember(store, reference.analysisReferenceId, "CREATED", fingerprint);
  return reference;
}

export function registerObjectiveValueReference(store: D1jR2Store, actor: D1jR2Actor, input: {
  objectiveValueReferenceId: string;
  subjectId: string;
  objectiveId: string;
  expectedFingerprint?: string | null;
  expectedValue?: number | null;
  callerValue?: number | null;
  callerRate?: number | null;
  callerFactor?: number | null;
}): D1jR2ValueRef {
  assertHuman(actor);
  if (input.callerRate != null || input.callerFactor != null) fail("OBJECTIVE_VALUE_NOT_FOUND");
  const subject = store.subjects.find((row) => row.subjectId === input.subjectId) ?? fail("EVALUATION_SUBJECT_UNSUPPORTED");
  const objective = store.objectives.find((row) => row.objectiveId === input.objectiveId) ?? fail("OBJECTIVE_VALUE_NOT_FOUND");
  const source = store.catalog.objectiveSources.find((row) => row.sourceId === objective.sourceId);
  if (!source || source.status !== "CURRENT") fail("OBJECTIVE_VALUE_NOT_FOUND");
  if (input.expectedFingerprint != null && input.expectedFingerprint !== source.fingerprint) fail("OBJECTIVE_VALUE_FINGERPRINT_MISMATCH");
  if (input.expectedValue != null && input.expectedValue !== source.value) fail("OBJECTIVE_VALUE_FINGERPRINT_MISMATCH");
  const fingerprint = fingerprintCanonical({ source: source.fingerprint, objective: objective.fingerprint, subject: subject.fingerprint, value: source.value, unit: source.unit });
  const existing = store.valueRefs.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const recordedAt = store.now();
  const reference: D1jR2ValueRef = {
    objectiveValueReferenceId: input.objectiveValueReferenceId, subjectId: subject.subjectId, objectiveId: objective.objectiveId,
    sourceId: source.sourceId, sourceVersion: source.version, sourceFingerprint: source.fingerprint, value: source.value, unit: source.unit,
    sourceAuthority: source.authority, evidenceClass: source.evidenceClass, copiesSourceBody: false, status: "CURRENT", fingerprint,
    provenance: provenance(actor, source.authority, [source.sourceId], fingerprint, recordedAt),
  };
  store.valueRefs.push(reference);
  remember(store, reference.objectiveValueReferenceId, "CREATED", fingerprint);
  emit(store, "OPTIMIZATION_OBJECTIVE_VALUE_REFERENCE_REGISTERED", reference.objectiveValueReferenceId);
  return reference;
}

export function createEvaluationEvidenceSet(store: D1jR2Store, actor: D1jR2Actor, input: {
  evaluationEvidenceSetId: string;
  optimizationProblemId: string;
  subjectId: string;
  objectiveValueReferenceIds: readonly string[];
  checkResultReferenceIds: readonly string[];
  analysisReferenceIds: readonly string[];
  version: string;
  successorOfEvidenceId?: string | null;
}): D1jR2Evidence {
  assertHuman(actor);
  const problem = store.problems.find((row) => row.optimizationProblemId === input.optimizationProblemId) ?? fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
  const checks = input.checkResultReferenceIds.map((id) => store.checkRefs.find((row) => row.checkResultReferenceId === id) ?? fail("CHECK_RESULT_NOT_FOUND"));
  const byConstraint = new Map<string, string>();
  for (const check of checks) {
    const prior = byConstraint.get(check.constraintId);
    if (prior && prior !== check.sourceFingerprint) fail("EVIDENCE_AMBIGUOUS");
    byConstraint.set(check.constraintId, check.sourceFingerprint);
  }
  const uniqueChecks = [...new Map(checks.map((row) => [row.sourceFingerprint, row])).values()].sort((left, right) => left.fingerprint.localeCompare(right.fingerprint));
  const values = input.objectiveValueReferenceIds.map((id) => store.valueRefs.find((row) => row.objectiveValueReferenceId === id) ?? fail("OBJECTIVE_VALUE_NOT_FOUND"));
  const analyses = input.analysisReferenceIds.map((id) => store.analysisRefs.find((row) => row.analysisReferenceId === id) ?? fail("ANALYSIS_RESULT_NOT_FOUND"));
  const fingerprint = fingerprintCanonical({
    problem: problem.fingerprint,
    checks: uniqueChecks.map((row) => row.fingerprint),
    values: [...values].sort((left, right) => left.fingerprint.localeCompare(right.fingerprint)).map((row) => row.fingerprint),
    analyses: [...analyses].sort((left, right) => left.fingerprint.localeCompare(right.fingerprint)).map((row) => row.fingerprint),
  });
  const existing = store.evidenceSets.find((row) => row.fingerprint === fingerprint && row.status !== "SUPERSEDED");
  if (existing) return existing;
  if (input.successorOfEvidenceId) {
    const previous = store.evidenceSets.find((row) => row.evaluationEvidenceSetId === input.successorOfEvidenceId) ?? fail("CHECK_RESULT_NOT_FOUND");
    previous.status = "SUPERSEDED";
    remember(store, previous.evaluationEvidenceSetId, "SUPERSEDED", previous.fingerprint);
  }
  const recordedAt = store.now();
  const evidence: D1jR2Evidence = {
    evaluationEvidenceSetId: input.evaluationEvidenceSetId, optimizationProblemId: problem.optimizationProblemId, subjectId: input.subjectId,
    objectiveSetRef: problem.objectiveSetRef, requiredCheckSetRef: problem.requiredCheckSetRef,
    objectiveValueReferenceIds: values.map((row) => row.objectiveValueReferenceId),
    checkResultReferenceIds: uniqueChecks.map((row) => row.checkResultReferenceId),
    analysisReferenceIds: analyses.map((row) => row.analysisReferenceId),
    status: "CURRENT", version: input.version, fingerprint, provenance: provenance(actor, actor.authority, uniqueChecks.map((row) => row.checkResultReferenceId), fingerprint, recordedAt),
  };
  store.evidenceSets.push(evidence);
  remember(store, evidence.evaluationEvidenceSetId, "CREATED", fingerprint);
  emit(store, "OPTIMIZATION_EVIDENCE_SET_CREATED", evidence.evaluationEvidenceSetId);
  return evidence;
}

function coverage(store: D1jR2Store, problem: D1jR2Problem, evidence: D1jR2Evidence): { feasibility: D1jR2FeasibilityRef; objectiveCompleteness: D1jR2Completeness; checkCompleteness: D1jR2Completeness } {
  const checkSet = store.checkSets.find((row) => row.requiredCheckSetId === problem.requiredCheckSetRef) ?? fail("REQUIRED_CHECK_MISSING");
  const required = checkSet.constraintIds.map((id) => store.constraints.find((row) => row.constraintId === id)!).filter((row) => row.requiredness !== "NOT_APPLICABLE");
  const refs = evidence.checkResultReferenceIds.map((id) => store.checkRefs.find((row) => row.checkResultReferenceId === id)!);
  const missing: string[] = [];
  const stale: string[] = [];
  const invalid: string[] = [];
  const unsupported: string[] = [];
  const unresolved: string[] = [];
  const assurance: string[] = [];
  const failed: string[] = [];
  let fixture = false;
  for (const constraint of required) {
    const matches = refs.filter((row) => row.constraintId === constraint.constraintId);
    if (matches.length === 0) { missing.push(constraint.constraintId); continue; }
    const reference = matches[0]!;
    const source = store.catalog.checkResults.find((row) => row.checkResultId === reference.sourceCheckResultId);
    if (reference.evidenceClass === "FIXTURE" || source?.evidenceClass === "FIXTURE") fixture = true;
    if (!source || source.status === "STALE" || reference.status === "STALE") stale.push(constraint.constraintId);
    else if (source.status === "INVALID") invalid.push(constraint.constraintId);
    else if (source.status === "UNSUPPORTED") unsupported.push(constraint.constraintId);
    else if (reference.authoritativeStatus === "UNRESOLVED") unresolved.push(constraint.constraintId);
    else if (reference.authoritativeStatus === "FAIL") failed.push(constraint.constraintId);
    if (checkSet.solverAssurance === "CERTIFIED_SOLVER_REQUIRED") assurance.push(constraint.constraintId);
    if (source?.analysisResultId) {
      const analysis = store.catalog.analyses.find((row) => row.resultSetId === source.analysisResultId);
      if (!analysis || analysis.status !== "CURRENT" || analysis.fingerprint !== store.analysisRefs.find((row) => row.resultSetId === analysis.resultSetId)?.sourceFingerprint) {
        stale.push(constraint.constraintId);
      }
    }
  }
  const objectiveSet = store.objectiveSets.find((row) => row.objectiveSetId === problem.objectiveSetRef);
  const valued = new Set(evidence.objectiveValueReferenceIds.map((id) => store.valueRefs.find((row) => row.objectiveValueReferenceId === id)?.objectiveId));
  const missingObjectives = (objectiveSet?.objectiveIds ?? []).filter((id) => !valued.has(id));
  const gaps = missing.length + stale.length + invalid.length + unsupported.length + unresolved.length + assurance.length;
  const feasibilityState: D1jR2Feasibility = failed.length > 0 ? "INFEASIBLE" : gaps > 0 ? "UNDETERMINED" : "FEASIBLE";
  const checkCompleteness: D1jR2Completeness = invalid.length ? "INVALID" : stale.length ? "STALE" : missing.length || unsupported.length || unresolved.length ? "INCOMPLETE" : "COMPLETE_FOR_DECLARED_SCOPE";
  const objectiveCompleteness: D1jR2Completeness = missingObjectives.length === (objectiveSet?.objectiveIds.length ?? 0) ? "INCOMPLETE" : missingObjectives.length ? "PARTIAL" : "COMPLETE_FOR_DECLARED_SCOPE";
  const evaluationCompleteness: D1jR2Completeness = checkCompleteness === "COMPLETE_FOR_DECLARED_SCOPE" && objectiveCompleteness === "COMPLETE_FOR_DECLARED_SCOPE" ? "COMPLETE_FOR_DECLARED_SCOPE" : checkCompleteness === "STALE" || checkCompleteness === "INVALID" ? checkCompleteness : "INCOMPLETE";
  const fingerprint = fingerprintCanonical({
    problem: problem.fingerprint, checks: checkSet.fingerprint, refs: refs.map((row) => row.fingerprint).sort(), assurance: checkSet.solverAssurance,
    state: feasibilityState, completeness: evaluationCompleteness,
  });
  const feasibility: D1jR2FeasibilityRef = {
    feasibilityReferenceId: `feasibility-${evidence.evaluationEvidenceSetId}`, optimizationProblemId: problem.optimizationProblemId, subjectId: evidence.subjectId,
    requiredCheckSetFingerprint: checkSet.fingerprint, checkResultReferenceIds: refs.map((row) => row.checkResultReferenceId),
    missingCheckIds: missing, staleCheckIds: [...new Set(stale)], invalidCheckIds: invalid, unsupportedCheckIds: unsupported,
    unresolvedApplicabilityIds: unresolved, insufficientAssuranceIds: assurance, failedCheckIds: failed,
    feasibilityState, evaluationCompleteness, objectiveCompleteness, productionEngineeringEvidence: !fixture && feasibilityState === "FEASIBLE",
    certificationEligible: false, executesFormula: false, status: "CURRENT", fingerprint, provenance: evidence.provenance,
  };
  return { feasibility, objectiveCompleteness, checkCompleteness };
}

export function evaluateEvaluationCompleteness(store: D1jR2Store, evidenceId: string): { objectiveCompleteness: D1jR2Completeness; checkCompleteness: D1jR2Completeness; evaluationCompleteness: D1jR2Completeness } {
  const evidence = store.evidenceSets.find((row) => row.evaluationEvidenceSetId === evidenceId) ?? fail("CHECK_RESULT_NOT_FOUND");
  const problem = store.problems.find((row) => row.optimizationProblemId === evidence.optimizationProblemId) ?? fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
  const covered = coverage(store, problem, evidence);
  return { objectiveCompleteness: covered.objectiveCompleteness, checkCompleteness: covered.checkCompleteness, evaluationCompleteness: covered.feasibility.evaluationCompleteness };
}

export function deriveFeasibilityReference(store: D1jR2Store, actor: D1jR2Actor, evidenceId: string): D1jR2FeasibilityRef {
  assertHuman(actor);
  const evidence = store.evidenceSets.find((row) => row.evaluationEvidenceSetId === evidenceId) ?? fail("CHECK_RESULT_NOT_FOUND");
  const problem = store.problems.find((row) => row.optimizationProblemId === evidence.optimizationProblemId) ?? fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
  const derived = coverage(store, problem, evidence).feasibility;
  const existing = store.feasibilityRefs.find((row) => row.fingerprint === derived.fingerprint);
  if (existing) return existing;
  store.feasibilityRefs.push(derived);
  remember(store, derived.feasibilityReferenceId, "CREATED", derived.fingerprint);
  emit(store, "OPTIMIZATION_FEASIBILITY_REFERENCE_RECORDED", derived.feasibilityReferenceId);
  return derived;
}

export function inspectFeasibilityReference(store: D1jR2Store, feasibilityReferenceId: string): D1jR2FeasibilityRef {
  return store.feasibilityRefs.find((row) => row.feasibilityReferenceId === feasibilityReferenceId) ?? fail("REQUIRED_CHECK_MISSING");
}

export function propagateEvaluationStaleness(store: D1jR2Store): void {
  const before = store.history.length;
  for (const problem of store.problems) {
    const baseline = inspectBaselineDesignReference(store.r1, problem.baselineRefId);
    const identity = store.r1.catalog.identities.find((row) => row.id === baseline.sourceObjectId);
    const binding = store.r1.catalog.bindings.find((row) => row.fingerprint === problem.bindingFingerprint);
    const variableSet = problem.variableSetRef ? store.r1.variableSets.find((row) => row.variableSetId === problem.variableSetRef) : null;
    const objectiveSet = store.objectiveSets.find((row) => row.objectiveSetId === problem.objectiveSetRef);
    const checkSet = store.checkSets.find((row) => row.requiredCheckSetId === problem.requiredCheckSetRef);
    const objectiveStale = objectiveSet?.objectiveIds.some((id) => {
      const objective = store.objectives.find((row) => row.objectiveId === id);
      const source = objective ? store.catalog.objectiveSources.find((row) => row.sourceId === objective.sourceId) : null;
      return !objective || objective.status !== "CURRENT" || !source || source.status !== "CURRENT" || source.fingerprint !== objective.sourceFingerprint;
    });
    if (!identity || identity.contentFingerprint !== baseline.sourceFingerprint || identity.status !== "CURRENT" || !binding || binding.status !== "CURRENT" || (variableSet && variableSet.status !== "FOUNDATION_DEFINED") || objectiveStale || checkSet?.status !== "CURRENT" || store.catalog.solverReadinessChanged) {
      if (problem.status !== "STALE") {
        problem.status = "STALE";
        remember(store, problem.optimizationProblemId, "STALE", problem.fingerprint);
        emit(store, "OPTIMIZATION_EVALUATION_STALE", problem.optimizationProblemId);
      }
    }
  }
  for (const reference of store.checkRefs) {
    const source = store.catalog.checkResults.find((row) => row.checkResultId === reference.sourceCheckResultId);
    if (!source || source.status !== "CURRENT" || source.fingerprint !== reference.sourceFingerprint) reference.status = "STALE";
  }
  for (const reference of store.analysisRefs) {
    const source = store.catalog.analyses.find((row) => row.resultSetId === reference.resultSetId);
    if (!source || source.status !== "CURRENT") reference.status = "STALE";
  }
  for (const reference of store.valueRefs) {
    const source = store.catalog.objectiveSources.find((row) => row.sourceId === reference.sourceId);
    if (!source || source.status !== "CURRENT" || source.fingerprint !== reference.sourceFingerprint) reference.status = "STALE";
  }
  if (store.history.length < before) fail("INVALIDATION_DELETES_HISTORY");
}

export function produceObjectiveConstraintReferenceResult(store: D1jR2Store, problemId: string): {
  resultId: string;
  problemId: string;
  problemFingerprint: string;
  objectiveSetId: string;
  requiredCheckSetId: string;
  evaluationSubjectRef: string | null;
  feasibilityState: D1jR2Feasibility | "UNDETERMINED";
  evaluationCompleteness: D1jR2Completeness;
  designApproval: false;
  certification: false;
  fingerprint: string;
} {
  const problem = store.problems.find((row) => row.optimizationProblemId === problemId) ?? fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
  const evidence = store.evidenceSets.find((row) => row.optimizationProblemId === problemId && row.status === "CURRENT");
  const feasibility = evidence ? store.feasibilityRefs.find((row) => row.optimizationProblemId === problemId) : null;
  return {
    resultId: `r2-${problemId}`, problemId, problemFingerprint: problem.fingerprint, objectiveSetId: problem.objectiveSetRef,
    requiredCheckSetId: problem.requiredCheckSetRef, evaluationSubjectRef: evidence?.subjectId ?? null,
    feasibilityState: feasibility?.feasibilityState ?? "UNDETERMINED", evaluationCompleteness: feasibility?.evaluationCompleteness ?? "INCOMPLETE",
    designApproval: false, certification: false, fingerprint: problem.fingerprint,
  };
}

export function parameterSemanticBoundary(): { kinds: readonly string[]; mutatesModel: false; concreteParameter: false } {
  return { kinds: D1J_R1_PARAMETER_REGISTRY.map((row) => row.parameterKind), mutatesModel: false, concreteParameter: false };
}
