/**
 * EOS-D1J-0 structural optimization certification architecture.
 * Contracts only. No optimization runtime, solver execution, or candidate generation.
 */

export const D1J_CANONICAL_NAME = "STRUCTURAL OPTIMIZATION CERTIFICATION" as const;
export const D1J_0_PHASE = "EOS-D1J-0-STRUCTURAL-OPTIMIZATION-CERTIFICATION-ARCHITECTURE" as const;
export const D1J_0_PHASE_AUTHORIZED = true as const;
export const D1J_0_MATURITY_STATE = "STRUCTURAL_OPTIMIZATION_CERTIFICATION_ARCHITECTURE_DEFINED" as const;
export const D1J_0_RUNTIME_STATUS = "NOT_STARTED" as const;

export const D1J_0_D1I_MATURITY_PROMOTION = false as const;
export const D1J_0_D1I_RUNTIME_CHANGE = false as const;
export const D1J_0_D1G_LIVE_VALIDATION_PROMOTION = false as const;
export const D1J_0_D1G_ENGINEER_VALIDATION_PROMOTION = false as const;
export const D1J_0_D1G_CONFORMANCE_PROMOTION = false as const;
export const D1J_0_D1G_CERTIFICATION_PROMOTION = false as const;
export const D1J_0_D1B_MATURITY_PROMOTION = false as const;
export const D1J_0_D1D_MATURITY_PROMOTION = false as const;
export const D1J_0_D1E_MATURITY_PROMOTION = false as const;
export const D1J_0_D1F_MATURITY_PROMOTION = false as const;
export const D1J_0_D1H_MATURITY_PROMOTION = false as const;

export const D1J_0_EXISTING_OPTIMIZATION_FOUNDATION_INVENTORY =
  "Reuse packages/engineering-os/src/optimization-intelligence for studies, variables, objectives, constraints, alternatives, runs, Pareto comparison, immutable run manifests, and fingerprintCanonical. The structural pilot handoff already requires human selection. Lifecycle quantity records cost as quantity times an approved rate and carbon from a governed emission factor. Formal design approval stays in the engineering-review decision workflow. D1B binds jurisdiction and standard. D1D and D1E own design checks. D1F owns structural identity. D1G owns analysis references. D1I owns historical state references. Existing optimization tables are not migrated by this architecture." as const;
export const D1J_0_PARALLEL_GENERIC_OPTIMIZATION_PLATFORM_CREATED = false as const;

export const D1J_0_CANDIDATE_EQUALS_APPROVED_DESIGN = false as const;
export const D1J_0_OBJECTIVE_OPTIMUM_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const D1J_0_PARETO_OPTIMAL_EQUALS_CODE_COMPLIANT = false as const;
export const D1J_0_FEASIBLE_EQUALS_CERTIFIED = false as const;
export const D1J_0_CERTIFICATION_EVIDENCE_EQUALS_PROFESSIONAL_CERTIFICATION = false as const;
export const D1J_0_NO_FAILED_CHECKS_EQUALS_FEASIBLE = false as const;
export const D1J_0_MISSING_REQUIRED_CHECK_EQUALS_FEASIBLE = false as const;
export const D1J_0_STALE_REQUIRED_CHECK_EQUALS_FEASIBLE = false as const;
export const D1J_0_INVALID_REQUIRED_CHECK_EQUALS_FEASIBLE = false as const;
export const D1J_0_UNSUPPORTED_REQUIRED_CHECK_EQUALS_FEASIBLE = false as const;
export const D1J_0_UNKNOWN_REQUIRED_CHECK_EQUALS_PASS = false as const;
export const D1J_0_UNKNOWN_CHECK_EQUALS_PASS = false as const;
export const D1J_0_CROSS_PROBLEM_PARETO_COMPARISON_ALLOWED = false as const;
export const D1J_0_INCOMPATIBLE_OBJECTIVE_SET_COMPARISON_ALLOWED = false as const;
export const D1J_0_INCOMPATIBLE_CONSTRAINT_SET_COMPARISON_ALLOWED = false as const;
export const D1J_0_UNIVERSAL_BEST_DESIGN_SCORE_CREATED = false as const;
export const D1J_0_DEFAULT_OBJECTIVE_WEIGHTS_CREATED = false as const;
export const D1J_0_DEFAULT_OBJECTIVE_PRIORITY_CREATED = false as const;
export const D1J_0_SINGLE_OBJECTIVE_WINNER_AUTO_GOVERNS = false as const;
export const D1J_0_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1J_0_D1G_CERTIFICATION_ASSUMED = false as const;
export const D1J_0_RUNTIME_OPTIMIZATION_AUTHORIZED = false as const;
export const D1J_0_PARALLEL_STRUCTURAL_CHECK_ENGINE_CREATED = false as const;
export const D1J_0_OPTIMIZER_CAN_OVERRIDE_FAILED_CHECK = false as const;

export const D1J_0_OPTIMIZATION_PROBLEM_CONTRACT =
  "D1jOptimizationProblem pins optimizationProblemId, tenant, workspace, project, structuralSystemRef, optimizationScope, baselineDesignRef, jurisdictionBindingRef, standardBindingRefs, variableSetRef, objectiveSetRef, constraintSetRef, evaluationProfileRef, methodPolicyRef, humanAuthority, limitations, version, fingerprint, status, and provenance." as const;
export const D1J_0_OPTIMIZATION_PROBLEM_EQUALS_STRUCTURAL_MODEL = false as const;
export const D1J_0_OPTIMIZATION_PROBLEM_EQUALS_ANALYSIS_MODEL = false as const;
export const D1J_0_OPTIMIZATION_PROBLEM_EQUALS_DESIGN_CANDIDATE = false as const;
export const D1J_0_D1A_IDENTITY_REUSED = true as const;
export const D1J_0_D1F_IDENTITY_REUSED = true as const;
export const D1J_0_PARALLEL_OPTIMIZATION_ASSET_IDENTITY_CREATED = false as const;
export const D1J_0_OPTIMIZATION_SCOPE_CONTRACT =
  "D1jOptimizationScope declares the governed system or member set, material family, design discipline, check family, project stage, objectives, and constraints. Undeclared scope is not inferred as the full project." as const;

export const D1J_0_BASELINE_REFERENCE_CONTRACT =
  "D1jBaselineDesignReference pins baselineRefId, sourceDomain, sourceObjectId, sourceVersion, sourceFingerprint, structuralScope, authority, validation status, and known or effective context." as const;
export const D1J_0_OPTIMIZATION_MUTATES_BASELINE = false as const;
export const D1J_0_BASELINE_FLOATS_TO_LATEST = false as const;
export const D1J_0_BASELINE_REFERENCE_PROMOTES_AUTHORITY = false as const;

export const D1J_VARIABLE_TYPES = [
  "DISCRETE_CATALOGUE",
  "BOUNDED_CONTINUOUS",
  "INTEGER",
  "ENUMERATION",
  "BOOLEAN",
  "GOVERNED_CONFIGURATION_CHOICE",
] as const;
export type D1jVariableType = (typeof D1J_VARIABLE_TYPES)[number];
export const D1J_BOUND_CLASSES = [
  "HARD_ENGINEERING_BOUND",
  "CATALOGUE_DOMAIN_BOUND",
  "PROJECT_CONSTRAINT",
  "OPTIMIZATION_SEARCH_BOUND",
] as const;
export type D1jBoundClass = (typeof D1J_BOUND_CLASSES)[number];
export const D1J_0_DESIGN_VARIABLE_CONTRACT =
  "D1jDesignVariableDefinition pins variableId, semantic key, targetRef, parameterRef, variableType, quantity and unit when dimensional, domainType, allowed values or bound refs, sourceAuthority, governanceSource, applicability, version, and fingerprint." as const;
export const D1J_0_VARIABLE_TYPE_TAXONOMY =
  "DISCRETE_CATALOGUE, BOUNDED_CONTINUOUS, INTEGER, ENUMERATION, BOOLEAN, and GOVERNED_CONFIGURATION_CHOICE map onto the existing optimization-intelligence types DISCRETE, CONTINUOUS, INTEGER, CATEGORICAL, and BOOLEAN. They do not replace that taxonomy." as const;
export const D1J_0_UNSOURCED_VARIABLE_DOMAIN_ALLOWED = false as const;
export const D1J_0_AI_CAN_INVENT_GOVERNING_VARIABLE = false as const;
export const D1J_0_AI_CAN_INVENT_GOVERNING_VARIABLE_BOUND = false as const;
export const D1J_0_MISSING_VARIABLE_UNIT_INFERRED = false as const;
export const D1J_0_SEARCH_BOUND_EQUALS_ENGINEERING_LIMIT = false as const;
export const D1J_0_VARIABLE_SET_CONTRACT =
  "D1jVariableSet is an immutable set of exact design-variable definition fingerprints. A changed definition or membership is a new set identity." as const;

export const D1J_OBJECTIVE_DIRECTIONS = ["MINIMIZE", "MAXIMIZE", "TARGET"] as const;
export type D1jObjectiveDirection = (typeof D1J_OBJECTIVE_DIRECTIONS)[number];
export const D1J_0_OBJECTIVE_CONTRACT =
  "D1jObjectiveDefinition pins objectiveId, semanticType, quantity, unit, explicit direction, sourceDomain, source rule, authority, scope, optional explicit normalization policy, version, and fingerprint." as const;
export const D1J_0_OBJECTIVE_REQUIRES_GOVERNED_SOURCE = true as const;
export const D1J_0_OBJECTIVE_CATEGORY_ARCHITECTURE =
  "A governed objective may describe material quantity, cost, carbon, a structural metric, a constructability metric, or another governed metric. No universal objective list is mandatory." as const;
export const D1J_0_AI_CAN_ORIGINATE_GOVERNING_COST_RATE = false as const;
export const D1J_0_AI_CAN_ORIGINATE_GOVERNING_CARBON_FACTOR = false as const;
export const D1J_0_OBJECTIVE_DIRECTION_INFERRED = false as const;
export const D1J_0_OBJECTIVE_SET_CONTRACT =
  "D1jObjectiveSet is an immutable set of exact objective fingerprints. Direct comparison requires that set fingerprint." as const;
export const D1J_0_OBJECTIVE_DEFINITION_COMPATIBILITY_REQUIRED = true as const;
export const D1J_0_WEIGHTED_OBJECTIVE_POLICY =
  "A later weight set must be an explicit governed and fingerprinted human or project record. It does not replace raw objective values. No default weights and no default priority are created." as const;

export const D1J_REQUIREDNESS = ["REQUIRED", "CONDITIONAL", "NOT_APPLICABLE"] as const;
export type D1jRequiredness = (typeof D1J_REQUIREDNESS)[number];
export const D1J_0_CONSTRAINT_CONTRACT =
  "D1jConstraintDefinition pins constraintId, constraintType, required check or governing rule ref, target scope, applicability, requiredness, authority, standard and jurisdiction binding, version, and fingerprint." as const;
export const D1J_0_OBJECTIVE_EQUALS_CONSTRAINT = false as const;
export const D1J_0_REQUIRED_CHECK_SET_CONTRACT =
  "D1jRequiredCheckSet is the immutable list of checks required for feasibility inside the declared scope. Each entry is REQUIRED, CONDITIONAL, or a governed NOT_APPLICABLE." as const;
export const D1J_0_EXISTING_ENGINEERING_CHECK_REUSE = true as const;
export const D1J_0_PARALLEL_STEEL_CHECK_ENGINE_CREATED = false as const;
export const D1J_0_PARALLEL_CONCRETE_CHECK_ENGINE_CREATED = false as const;
export const D1J_0_D1B_BINDING_REQUIRED = true as const;
export const D1J_0_JURISDICTION_INFERRED = false as const;
export const D1J_0_UNKNOWN_APPLICABILITY_EQUALS_NOT_APPLICABLE = false as const;

export const D1J_FEASIBILITY_STATES = ["FEASIBLE", "INFEASIBLE", "UNDETERMINED"] as const;
export type D1jFeasibilityState = (typeof D1J_FEASIBILITY_STATES)[number];
export const D1J_0_FEASIBILITY_CONTRACT =
  "D1jCandidateFeasibility pins candidateId, requiredCheckSetFingerprint, applicable check refs, check result refs, missing, stale, invalid, unsupported, and failed check refs, feasibilityState, authority, limitations, and fingerprint." as const;
export const D1J_0_FEASIBILITY_STATES = "FEASIBLE, INFEASIBLE, UNDETERMINED" as const;
export const D1J_0_FEASIBLE_REQUIRES_COMPLETE_REQUIRED_CHECK_SET = true as const;
export const D1J_0_FAILED_REQUIRED_CHECK_IMPLIES_INFEASIBLE = true as const;
export const D1J_0_FLOATING_CHECK_RESULT_ALLOWED = false as const;
export const D1J_0_FLOATING_ANALYSIS_RESULT_ALLOWED = false as const;
export const D1J_0_ANALYSIS_REFERENCE_PROMOTES_AUTHORITY = false as const;
export const D1J_0_FAILED_ANALYSIS_CAN_SUPPORT_FEASIBLE_CANDIDATE = false as const;
export const D1J_0_NONCONVERGED_ANALYSIS_CAN_SUPPORT_FEASIBLE_CANDIDATE = false as const;
export const D1J_0_SOLVER_CERTIFICATION_GATE_ARCHITECTURE =
  "Fixture evaluation may support architecture tests and is neither live solver validation nor certification. Solver-backed production or certification claims stay closed while the D1G certified solver status is NOT_CERTIFIED. Offline SPACE GASS connector conformance is not that certification." as const;
export const D1G_LIVE_VALIDATED = false as const;
export const D1G_ENGINEER_VALIDATED = false as const;
export const D1G_CONFORMANCE_VALIDATED = false as const;
export const D1G_CERTIFIED_SOLVER_STATUS = "NOT_CERTIFIED" as const;
export const D1J_0_FIXTURE_EVALUATION_EQUALS_LIVE_SOLVER_VALIDATION = false as const;
export const D1J_0_FIXTURE_EVALUATION_EQUALS_CERTIFICATION = false as const;

export const D1J_CANDIDATE_ORIGINS = [
  "HUMAN_DEFINED",
  "DETERMINISTIC_ENUMERATION",
  "OPTIMIZATION_METHOD",
  "IMPORTED_GOVERNED",
  "OTHER_GOVERNED",
] as const;
export type D1jCandidateOrigin = (typeof D1J_CANDIDATE_ORIGINS)[number];
export const D1J_0_CANDIDATE_CONTRACT =
  "D1jDesignCandidate pins candidateId, optimizationProblemId, baselineRef, optional parentCandidateRef, variableSetFingerprint, variableAssignments, candidateDesignStateRef, optimizationRunRef, methodRef, generationOrigin, evaluationRefs, feasibilityRef, objectiveValueRefs, status, limitations, version, fingerprint, and provenance." as const;
export const D1J_0_CANDIDATE_EQUALS_SELECTED_DESIGN = false as const;
export const D1J_0_CANDIDATE_EQUALS_ISSUED_DESIGN = false as const;
export const D1J_0_CANDIDATE_ORIGIN_TAXONOMY =
  "HUMAN_DEFINED, DETERMINISTIC_ENUMERATION, OPTIMIZATION_METHOD, IMPORTED_GOVERNED, OTHER_GOVERNED. D1J-0 does not generate candidates from any origin." as const;
export const D1J_0_CANDIDATE_LINEAGE_EXPLICIT = true as const;
export const D1J_0_EVALUATED_CANDIDATE_MUTATED_IN_PLACE = false as const;
export const D1J_0_CANDIDATE_FINGERPRINT_ARCHITECTURE =
  "A candidate fingerprint includes the problem fingerprint, baseline fingerprint, variable-definition fingerprints, variable assignments, candidate source reference, and method or run identity when a run exists." as const;

export const D1J_COMPLETENESS_STATES = [
  "COMPLETE_FOR_DECLARED_SCOPE",
  "PARTIAL",
  "INCOMPLETE",
  "STALE",
  "INVALID",
  "UNDETERMINED",
] as const;
export type D1jCompleteness = (typeof D1J_COMPLETENESS_STATES)[number];
export const D1J_0_CANDIDATE_EVALUATION_CONTRACT =
  "D1jCandidateEvaluation pins evaluationId, candidateId, problemFingerprint, objectiveSetFingerprint, requiredCheckSetFingerprint, analysisRefs, checkResultRefs, objectiveValueRefs, feasibilityState, evaluationAuthority, evaluationStatus, knownAtTime, limitations, version, and fingerprint." as const;
export const D1J_0_EVALUATION_COMPLETENESS_STATES =
  "COMPLETE_FOR_DECLARED_SCOPE, PARTIAL, INCOMPLETE, STALE, INVALID, UNDETERMINED" as const;
export const D1J_0_COMPLETE_EVALUATION_EQUALS_FEASIBLE = false as const;
export const D1J_0_FEASIBLE_EQUALS_OPTIMAL = false as const;
export const D1J_0_OBJECTIVE_VALUE_CONTRACT =
  "An objective value pins the objective definition, numeric value, unit, source evaluation ref, authority, and fingerprint. The governing number comes from that evaluation." as const;
export const D1J_0_AI_CAN_ORIGINATE_GOVERNING_OBJECTIVE_VALUE = false as const;
export const D1J_0_AI_CAN_ORIGINATE_GOVERNING_CONSTRAINT_VALUE = false as const;

export const D1J_0_OPTIMIZATION_RUN_CONTRACT =
  "D1jOptimizationRun pins optimizationRunId, problem fingerprint, method id and version, method configuration fingerprint, seed or randomness policy, recorded metadata, candidate refs, termination policy, runtime authority, status, limitations, provenance, and fingerprint." as const;
export const D1J_0_OPTIMIZATION_RUN_RUNTIME_IMPLEMENTED = false as const;
export const D1J_0_OPTIMIZATION_METHOD_IDENTITY_CONTRACT =
  "D1jOptimizationMethodIdentity pins methodId, methodFamily, implementation version, configuration fingerprint, seed or randomness policy, termination policy, and provenance." as const;
export const D1J_0_METHOD_VERSION_REQUIRED = true as const;
export const D1J_0_UNTRACEABLE_STOCHASTIC_RANDOMNESS_ALLOWED = false as const;
export const D1J_0_AI_CAN_SET_UNDECLARED_TERMINATION_POLICY = false as const;

export const D1J_0_MULTI_OBJECTIVE_SET_CONTRACT =
  "D1jMultiObjectiveCandidateSet pins candidateSetId, optimizationProblemId, problem fingerprint, objective-set fingerprint, constraint-set fingerprint, evaluation refs, comparison eligibility, non-dominated refs, dominated refs, human selection ref, limitations, provenance, and fingerprint." as const;
export const D1J_0_PARETO_SEMANTICS_ARCHITECTURE =
  "Among comparison-eligible FEASIBLE candidates, one dominates another when every shared objective is no worse under its explicit direction and at least one is strictly better. No new engineering formula and no project weighting are introduced. The existing optimization-intelligence Pareto comparison remains the generic mechanism. D1J-0 does not execute it." as const;
export const D1J_0_PARETO_REQUIRES_COMPATIBLE_PROBLEM_FINGERPRINT = true as const;
export const D1J_0_PARETO_REQUIRES_COMPATIBLE_OBJECTIVE_SET = true as const;
export const D1J_0_PARETO_REQUIRES_COMPATIBLE_CONSTRAINT_SET = true as const;
export const D1J_0_FEASIBILITY_PARETO_POLICY =
  "Pareto claims about feasible designs use FEASIBLE candidates only. UNDETERMINED candidates stay in a separate incomplete set. INFEASIBLE candidates remain in history and are not feasible trade-offs." as const;
export const D1J_0_INFEASIBLE_CANDIDATE_HISTORY_PRESERVED = true as const;
export const D1J_0_UNDETERMINED_CANDIDATE_AUTO_DROPPED = false as const;
export const D1J_0_NONDOMINATED_EQUALS_APPROVED = false as const;
export const D1J_0_SINGLE_OBJECTIVE_MINIMUM_EQUALS_APPROVED_DESIGN = false as const;
export const D1J_0_WEIGHTED_RANKING_EQUALS_APPROVAL = false as const;

export const D1J_0_CANDIDATE_REVIEW_CONTRACT =
  "D1jCandidateReview pins reviewId, candidate and evaluation refs, reviewer, authority, reviewScope, reviewBasis, reviewOutcome, limitations, reviewedAt, provenance, version, and fingerprint." as const;
export const D1J_0_CANDIDATE_SELECTION_CONTRACT =
  "D1jCandidateSelection pins selectionId, optimizationProblemId, candidateId, evaluationRef, selectionAuthority, selectionBasis, trade-off rationale, limitations, selectedAt, status, provenance, version, and fingerprint." as const;
export const D1J_0_FINAL_CANDIDATE_SELECTION_REQUIRES_HUMAN_AUTHORITY = true as const;
export const D1J_0_AI_CAN_GOVERN_FINAL_CANDIDATE_SELECTION = false as const;
export const D1J_0_OPTIMIZER_CAN_GOVERN_FINAL_CANDIDATE_SELECTION = false as const;
export const D1J_0_CANDIDATE_SELECTION_EQUALS_FORMAL_DESIGN_APPROVAL = false as const;
export const D1J_0_ENGINEERING_APPROVAL_HANDOFF =
  "Formal design approval stays in the existing engineering-review decision workflow. A D1J selection cites a preferred candidate and does not create a second approval mechanism, an issued design, or a professional certification." as const;
export const D1J_0_SELECTION_HISTORY_APPEND_ONLY = true as const;
export const D1J_0_HUMAN_RATIONALE_MUTATES_OBJECTIVE_VALUES = false as const;

export const D1J_0_CERTIFICATION_EVIDENCE_CONTRACT =
  "D1jOptimizationCertificationEvidence cites the immutable study manifest and pins problem, baseline, jurisdiction and standard bindings, variable objective and constraint fingerprints, method, run, evaluations, selected candidate, human selection, analysis and check refs, solver readiness, limitations, validation status, provenance, version, and fingerprint." as const;
export const D1J_0_CERTIFICATION_TERM_EQUALS_PROFESSIONAL_CERTIFICATION = false as const;
export const D1J_0_CERTIFICATION_TERM_EQUALS_REGULATORY_APPROVAL = false as const;
export const D1J_0_CERTIFICATION_TERM_EQUALS_SOLVER_CERTIFICATION = false as const;
export const D1J_0_CERTIFICATION_TERM_EQUALS_CERTIFIED_DESIGN = false as const;
export const D1J_0_IMMUTABLE_MANIFEST_ARCHITECTURE =
  "D1jOptimizationStudyManifest is the immutable pin of problem, baseline, variables, objectives, constraints, method, run, evaluations, selected candidate, human selection, and analysis or check evidence. Certification evidence cites that manifest and adds readiness. Neither record is a design approval." as const;
export const D1J_0_MANIFEST_FLOATING_REFERENCES_ALLOWED = false as const;
export const D1J_0_MANIFEST_EQUALS_DESIGN_APPROVAL = false as const;

export const D1J_READINESS_LAYERS = [
  "ARCHITECTURE_READY",
  "FIXTURE_TEST_READY",
  "PILOT_RUNTIME_READY",
  "LIVE_SOLVER_RUNTIME_READY",
  "ENGINEER_VALIDATED",
  "CONFORMANCE_VALIDATED",
  "CERTIFICATION_ELIGIBLE",
] as const;
export const D1J_0_READINESS_LAYER_MODEL =
  "ARCHITECTURE_READY, FIXTURE_TEST_READY, PILOT_RUNTIME_READY, LIVE_SOLVER_RUNTIME_READY, ENGINEER_VALIDATED, CONFORMANCE_VALIDATED, CERTIFICATION_ELIGIBLE." as const;
export const D1J_0_ARCHITECTURE_READY = true as const;
export const D1J_0_FIXTURE_RUNTIME_CLAIM = false as const;
export const D1J_0_PILOT_RUNTIME_READY = false as const;
export const D1J_0_LIVE_SOLVER_RUNTIME_READY = false as const;
export const D1J_0_ENGINEER_VALIDATED = false as const;
export const D1J_0_CONFORMANCE_VALIDATED = false as const;
export const D1J_0_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_0_CURRENT_READINESS_STATE =
  "ARCHITECTURE_READY is YES. Fixture tests of these contracts are permitted and are not a runtime claim. PILOT_RUNTIME_READY, LIVE_SOLVER_RUNTIME_READY, ENGINEER_VALIDATED, CONFORMANCE_VALIDATED, and CERTIFICATION_ELIGIBLE are NO." as const;
export const D1J_0_D1G_CERTIFIED_SOLVER_PREREQUISITE_PRESERVED = true as const;
export const D1J_0_D1G_VALIDATION_ROUTE_STATUS =
  "D1G_VALIDATION_ROUTE_EXISTS is NO. D1G_VALIDATION_ROUTE_PHASE is NOT_DEFINED. No D1G certification phase is invented." as const;
export const D1J_0_D1I_REFERENCE_REUSE = true as const;
export const D1J_0_MUTATES_D1I_HISTORY = false as const;
export const D1J_0_CONDITION_AUTO_REDUCES_CAPACITY = false as const;
export const D1J_0_TELEMETRY_CONTROL_LOOP_IMPLEMENTED = false as const;
export const D1J_0_DESIGN_MODEL_MUTATION_COUNT = 0 as const;
export const D1J_0_AUTONOMOUS_GENERATIVE_DESIGN_IMPLEMENTED = false as const;
export const D1J_0_AI_AUTHORITY_BOUNDARY =
  "AI may summarize trade-offs, explain Pareto results, identify missing constraints, highlight candidate differences, and prepare review material. AI may not invent governing variables or bounds, invent governing rates or factors, waive checks, declare feasibility when required evidence is incomplete, select an approved design, or certify a study." as const;
export const D1J_0_AI_CAN_DECLARE_FEASIBILITY_WITH_MISSING_CHECK = false as const;

export const D1J_0_PROVENANCE_GRAPH_ARCHITECTURE =
  "Structural target to optimization problem to baseline to variable definitions and set to objectives and set to constraints and required-check set to method and run to candidate to exact analysis and check evaluation to feasibility to objective values to candidate set to human review to human selection to certification evidence and immutable manifest." as const;
export const D1J_0_PROVENANCE_REQUIREMENTS =
  "Every future D1J record preserves tenant, workspace, project, structural scope, actor or system, authority, source refs, version, fingerprint, and time metadata." as const;
export const D1J_0_FINGERPRINT_ARCHITECTURE =
  "Deterministic fingerprints, using the existing fingerprintCanonical convention, cover the optimization problem, baseline, variable definition and set, objective definition and set, constraint definition and set, candidate, evaluation, feasibility, method, run, candidate set, review, selection, and certification evidence or manifest. D1J-0 does not add a second hash implementation." as const;
export const D1J_0_PROBLEM_FINGERPRINT_REQUIREMENT =
  "An optimization-problem fingerprint pins scope, baseline, jurisdiction and standards bindings, variable set, objective set, constraint set, and evaluation profile." as const;
export const D1J_0_EVALUATION_FINGERPRINT_REQUIREMENT =
  "An evaluation fingerprint pins analysis and check fingerprints, objective values, feasibility state, and method or run context where they apply." as const;
export const D1J_0_INVALIDATION_ARCHITECTURE =
  "Dependent candidates and evaluations become stale when the baseline, variable definition or domain, objective definition, governed rate or factor, constraint or check set, jurisdiction or standard binding, analysis result, check result, method version or configuration, candidate design, consumed D1I context, or solver readiness changes. A new human selection supersedes without rewriting the prior selection." as const;
export const D1J_0_BASELINE_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_0_OBJECTIVE_DEFINITION_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_0_GOVERNED_RATE_FACTOR_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_0_CONSTRAINT_SET_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_0_CHECK_RESULT_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_0_ANALYSIS_RESULT_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_0_METHOD_VERSION_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_0_NEW_SELECTION_REWRITES_OLD_SELECTION = false as const;
export const D1J_0_HISTORICAL_REPRODUCIBILITY_REQUIRED = true as const;
export const D1J_0_TIME_SEMANTICS_ARCHITECTURE =
  "Recorded time comes from the trusted EOS event boundary. Known-at and effective context reuse existing digital-thread and D1I conventions when a D1I reference is cited. D1J does not create a second bitemporal framework." as const;
export const D1J_0_TRUSTED_RECORDED_TIME_REQUIRED = true as const;

export const D1J_0_COMPARISON_ELIGIBILITY_CONTRACT =
  "D1jCandidateComparisonEligibility requires matching problem fingerprint, baseline fingerprint, objective-set fingerprint, constraint-set fingerprint, jurisdiction and standard binding, evaluation profile, and objective unit compatibility." as const;
export const D1J_0_CROSS_PROBLEM_DOMINANCE_ALLOWED = false as const;
export const D1J_0_DIFFERENT_STANDARD_BINDING_DIRECTLY_COMPARABLE = false as const;
export const D1J_0_OBJECTIVE_UNIT_COMPATIBILITY_REQUIRED = true as const;
export const D1J_0_DEFAULT_OBJECTIVE_NORMALIZATION_CREATED = false as const;
export const D1J_0_UNSOURCED_CONSTRUCTABILITY_SCORE_ALLOWED = false as const;
export const D1J_0_UNIVERSAL_ENGINEERING_MARGIN_SCORE_CREATED = false as const;
export const D1J_0_IMPLICIT_UTILIZATION_AGGREGATION_CREATED = false as const;
export const D1J_0_OBJECTIVE_VALUE_CAN_OFFSET_FAILED_REQUIRED_CONSTRAINT = false as const;
export const D1J_0_OBJECTIVE_VALUE_CAN_OFFSET_UNDETERMINED_FEASIBILITY = false as const;
export const D1J_0_CERTIFICATION_EVIDENCE_COMPLETENESS_STATES =
  "COMPLETE_FOR_DECLARED_SCOPE, PARTIAL, INCOMPLETE, STALE, INVALID, UNDETERMINED" as const;
export const D1J_0_COMPLETE_EVIDENCE_EQUALS_CERTIFIED_DESIGN = false as const;
export const D1J_0_RECORD_LEVEL_HUMAN_SELECTION_EQUALS_SOFTWARE_ENGINEER_VALIDATION = false as const;

export const D1J_0_OPTIMIZATION_PROBLEM_RUNTIME_COUNT = 0 as const;
export const D1J_0_DESIGN_VARIABLE_RUNTIME_COUNT = 0 as const;
export const D1J_0_OBJECTIVE_RUNTIME_COUNT = 0 as const;
export const D1J_0_CONSTRAINT_RUNTIME_COUNT = 0 as const;
export const D1J_0_CANDIDATE_GENERATION_RUNTIME_COUNT = 0 as const;
export const D1J_0_CANDIDATE_EVALUATION_RUNTIME_COUNT = 0 as const;
export const D1J_0_PARETO_RUNTIME_COUNT = 0 as const;
export const D1J_0_SELECTION_RUNTIME_COUNT = 0 as const;
export const D1J_0_OPTIMIZATION_ALGORITHM_RUNTIME_COUNT = 0 as const;
export const D1J_0_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1J_0_ARCHITECTURE_CONTRACT_FILES =
  "packages/types/src/structural-optimization-d1j-0.ts; docs/architecture/engineering-os/EOS_D1J_0_STRUCTURAL_OPTIMIZATION_CERTIFICATION_ARCHITECTURE.md" as const;
export const D1J_0_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1J_0_PARALLEL_CAPABILITY_MANIFEST_CREATED = false as const;
export const D1J_0_NEW_DEPENDENCY_COUNT = 0 as const;
export const D1J_0_CROSS_PROJECT_REFERENCE_ALLOWED = false as const;
export const D1J_0_CROSS_TENANT_REFERENCE_ALLOWED = false as const;
export const D1J_0_AI_APPROVAL_AUTHORITY_CREATED = false as const;
export const D1J_0_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1J_0_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1J_0_D1K_STARTED = false as const;
export const D1J_0_D2_STARTED = false as const;
export const D1J_0_D3_STARTED = false as const;
export const D1J_0_STRUCTURAL_PACK_COMPLETE = false as const;

export const D1J_CANONICAL_PHASE_SEQUENCE =
  "EOS-D1J-0-STRUCTURAL-OPTIMIZATION-CERTIFICATION-ARCHITECTURE; EOS-D1J-R1-OPTIMIZATION-PROBLEM-BASELINE-VARIABLE-FOUNDATION; EOS-D1J-R2-OBJECTIVE-CONSTRAINT-FEASIBILITY-REFERENCE-FOUNDATION; EOS-D1J-R3-CANDIDATE-LINEAGE-COMPARISON-COMPOSITION; EOS-D1J-R4-CERTIFICATION-EVIDENCE-READINESS-GATE; EOS-D1J-R5-STRUCTURAL-OPTIMIZATION-CERTIFICATION-CLOSEOUT." as const;
export const D1J_PHASE_PREREQUISITE_MATRIX =
  "D1J-0 defines architecture and proceeds without a certified D1G solver. R1 records problem, baseline, and variable identity and proceeds without a certified solver, engineer validation, or conformance validation. R2 records objective, constraint, and required-check references and proceeds without a certified solver; executing checks or claiming solver-backed feasibility requires certified D1G. R3 records human-defined or imported candidate lineage and comparison eligibility without a certified solver; solver-backed evaluation requires certified D1G. R4 may record evidence without a certified solver; CERTIFICATION_ELIGIBLE requires certified D1G, engineer validation, and conformance validation. R5 may close the bounded track and cannot grant those validations." as const;
export const D1J_R1_HANDOFF_READY = true as const;
export const D1J_R1_CANONICAL_PHASE = "EOS-D1J-R1-OPTIMIZATION-PROBLEM-BASELINE-VARIABLE-FOUNDATION" as const;
export const D1J_R1_PHASE_TYPE = "STRUCTURAL_OPTIMIZATION_PROBLEM_BASELINE_VARIABLE_FOUNDATION" as const;
export const D1J_R1_CANONICAL_SCOPE =
  "Record optimization problem identity, declared optimization scope, an immutable baseline design reference, and governed design-variable definitions and sets, without candidate generation, objective evaluation, solver execution, automatic selection, or certification claims." as const;

export type D1jProvenance = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  structuralScope: string;
  actorOrSystem: string;
  authority: string;
  sourceRefs: readonly string[];
  version: string;
  fingerprint: string;
  recordedAt: string;
  callerBackdated: false;
};

export type D1jOptimizationProblem = {
  recordKind: "OPTIMIZATION_PROBLEM";
  optimizationProblemId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  structuralSystemRef: string;
  optimizationScopeRef: string;
  baselineDesignRef: string;
  jurisdictionBindingRef: string;
  standardBindingRefs: readonly string[];
  variableSetRef: string;
  objectiveSetRef: string;
  constraintSetRef: string;
  evaluationProfileRef: string;
  methodPolicyRef: string;
  humanAuthority: string;
  limitations: string;
  version: string;
  fingerprint: string;
  status: "DEFINED";
  provenance: D1jProvenance;
  equalsStructuralModel: false;
  equalsAnalysisModel: false;
  equalsDesignCandidate: false;
  mutatesBaseline: false;
  crossProject: false;
  crossTenant: false;
};

export type D1jBaselineDesignReference = {
  recordKind: "BASELINE_DESIGN_REFERENCE";
  baselineRefId: string;
  sourceDomain: string;
  sourceObjectId: string;
  sourceVersion: string;
  sourceFingerprint: string;
  structuralScope: string;
  authority: string;
  validationStatus: string;
  knownOrEffectiveContext: string;
  floatsToLatest: false;
  promotesAuthority: false;
};

export type D1jDesignVariableDefinition = {
  recordKind: "DESIGN_VARIABLE_DEFINITION";
  variableId: string;
  semanticKey: string;
  targetRef: string;
  parameterRef: string;
  variableType: D1jVariableType;
  quantity: string | null;
  unit: string | null;
  domainType: string;
  boundClass: D1jBoundClass;
  allowedValuesRef: string;
  sourceAuthority: string;
  governanceSource: string;
  applicability: string;
  version: string;
  fingerprint: string;
  unsourcedDomain: false;
  aiInventedVariable: false;
  aiInventedBound: false;
  missingUnitInferred: false;
  searchBoundEqualsEngineeringLimit: false;
};

export type D1jVariableSet = {
  recordKind: "VARIABLE_SET";
  variableSetId: string;
  definitionFingerprints: readonly string[];
  fingerprint: string;
  immutable: true;
};

export type D1jObjectiveDefinition = {
  recordKind: "OBJECTIVE_DEFINITION";
  objectiveId: string;
  semanticType: string;
  quantity: string;
  unit: string;
  direction: D1jObjectiveDirection;
  sourceDomain: string;
  sourceRuleRef: string;
  authority: string;
  scope: string;
  normalizationPolicyRef: string | null;
  version: string;
  fingerprint: string;
  directionInferred: false;
  defaultWeight: false;
  aiOriginatedRateOrFactor: false;
  equalsConstraint: false;
};

export type D1jObjectiveSet = {
  recordKind: "OBJECTIVE_SET";
  objectiveSetId: string;
  objectiveFingerprints: readonly string[];
  fingerprint: string;
  immutable: true;
};

export type D1jConstraintDefinition = {
  recordKind: "CONSTRAINT_DEFINITION";
  constraintId: string;
  constraintType: string;
  requiredCheckRef: string;
  targetScope: string;
  applicability: string;
  requiredness: D1jRequiredness;
  authority: string;
  standardBindingRef: string;
  jurisdictionBindingRef: string;
  version: string;
  fingerprint: string;
  copiesCheckFormula: false;
  unknownApplicabilityIsNotApplicable: false;
};

export type D1jRequiredCheckSet = {
  recordKind: "REQUIRED_CHECK_SET";
  requiredCheckSetId: string;
  checkRefs: readonly string[];
  fingerprint: string;
  immutable: true;
};

export type D1jPinnedCheckResultRef = {
  checkResultId: string;
  version: string;
  fingerprint: string;
  authority: string;
  status: "PASS" | "FAIL" | "UNKNOWN" | "STALE" | "INVALID" | "UNSUPPORTED" | "MISSING";
  floatsToLatest: false;
  unknownEqualsPass: false;
};

export type D1jPinnedAnalysisRef = {
  providerRef: string;
  modelRef: string;
  runRef: string;
  resultRef: string;
  caseOrCombinationRef: string;
  authority: string;
  validationStatus: string;
  fingerprint: string;
  floatsToLatest: false;
  promotesAuthority: false;
};

export type D1jCandidateFeasibility = {
  recordKind: "CANDIDATE_FEASIBILITY";
  candidateId: string;
  requiredCheckSetFingerprint: string;
  applicableCheckRefs: readonly string[];
  checkResultRefs: readonly D1jPinnedCheckResultRef[];
  missingCheckRefs: readonly string[];
  staleCheckRefs: readonly string[];
  invalidCheckRefs: readonly string[];
  unsupportedCheckRefs: readonly string[];
  failedCheckRefs: readonly string[];
  feasibilityState: D1jFeasibilityState;
  authority: string;
  limitations: string;
  fingerprint: string;
  noFailedChecksEqualsFeasible: false;
  objectiveCanOffsetFailure: false;
  objectiveCanOffsetUndetermined: false;
};

export type D1jDesignCandidate = {
  recordKind: "DESIGN_CANDIDATE";
  candidateId: string;
  optimizationProblemId: string;
  baselineRef: string;
  parentCandidateRef: string | null;
  variableSetFingerprint: string;
  variableAssignmentsRef: string;
  candidateDesignStateRef: string;
  optimizationRunRef: string | null;
  methodRef: string | null;
  generationOrigin: D1jCandidateOrigin;
  evaluationRefs: readonly string[];
  feasibilityRef: string | null;
  objectiveValueRefs: readonly string[];
  status: "RECORDED";
  limitations: string;
  version: string;
  fingerprint: string;
  provenance: D1jProvenance;
  equalsSelectedDesign: false;
  equalsApprovedDesign: false;
  equalsIssuedDesign: false;
  mutatedInPlace: false;
};

export type D1jCandidateEvaluation = {
  recordKind: "CANDIDATE_EVALUATION";
  evaluationId: string;
  candidateId: string;
  problemFingerprint: string;
  objectiveSetFingerprint: string;
  requiredCheckSetFingerprint: string;
  analysisRefs: readonly D1jPinnedAnalysisRef[];
  checkResultRefs: readonly D1jPinnedCheckResultRef[];
  objectiveValueRefs: readonly string[];
  feasibilityState: D1jFeasibilityState;
  completeness: D1jCompleteness;
  evaluationAuthority: string;
  evaluationStatus: string;
  knownAtTime: string;
  limitations: string;
  version: string;
  fingerprint: string;
  completeEqualsFeasible: false;
  fixtureEqualsCertification: false;
};

export type D1jOptimizationMethodIdentity = {
  recordKind: "OPTIMIZATION_METHOD_IDENTITY";
  methodId: string;
  methodFamily: string;
  implementationVersion: string;
  configurationFingerprint: string;
  randomnessPolicy: string;
  terminationPolicy: string;
  provenance: D1jProvenance;
  untraceableRandomness: false;
  aiSetsUndeclaredTermination: false;
};

export type D1jOptimizationRun = {
  recordKind: "OPTIMIZATION_RUN";
  optimizationRunId: string;
  problemFingerprint: string;
  methodRef: string;
  methodConfigurationFingerprint: string;
  randomnessPolicy: string;
  candidateRefs: readonly string[];
  terminationPolicy: string;
  runtimeAuthority: string;
  status: "ARCHITECTURAL_ONLY";
  limitations: string;
  provenance: D1jProvenance;
  fingerprint: string;
  runtimeImplemented: false;
};

export type D1jCandidateComparisonEligibility = {
  recordKind: "COMPARISON_ELIGIBILITY";
  problemFingerprintMatch: boolean;
  baselineFingerprintMatch: boolean;
  objectiveSetFingerprintMatch: boolean;
  constraintSetFingerprintMatch: boolean;
  jurisdictionBindingMatch: boolean;
  standardBindingMatch: boolean;
  evaluationProfileMatch: boolean;
  objectiveUnitCompatibility: boolean;
  crossProblem: false;
};

export type D1jMultiObjectiveCandidateSet = {
  recordKind: "MULTI_OBJECTIVE_CANDIDATE_SET";
  candidateSetId: string;
  optimizationProblemId: string;
  problemFingerprint: string;
  objectiveSetFingerprint: string;
  constraintSetFingerprint: string;
  candidateEvaluationRefs: readonly string[];
  feasibleNonDominatedRefs: readonly string[];
  undeterminedRefs: readonly string[];
  infeasibleRefs: readonly string[];
  humanSelectionRef: string | null;
  limitations: string;
  provenance: D1jProvenance;
  fingerprint: string;
  nonDominatedEqualsApproved: false;
  universalBestScore: false;
};

export type D1jCandidateReview = {
  recordKind: "CANDIDATE_REVIEW";
  reviewId: string;
  candidateRef: string;
  evaluationRef: string;
  reviewer: string;
  authority: string;
  reviewScope: string;
  reviewBasis: string;
  reviewOutcome: string;
  limitations: string;
  reviewedAt: string;
  provenance: D1jProvenance;
  version: string;
  fingerprint: string;
};

export type D1jCandidateSelection = {
  recordKind: "CANDIDATE_SELECTION";
  selectionId: string;
  optimizationProblemId: string;
  candidateId: string;
  evaluationRef: string;
  selectionAuthority: string;
  selectionBasis: string;
  tradeOffRationale: string;
  limitations: string;
  selectedAt: string;
  status: "RECORDED" | "SUPERSEDED";
  provenance: D1jProvenance;
  version: string;
  fingerprint: string;
  requiresHumanAuthority: true;
  aiGoverned: false;
  optimizerGoverned: false;
  equalsFormalDesignApproval: false;
  rewritesPriorSelection: false;
  rationaleMutatesObjectiveValues: false;
};

export type D1jOptimizationStudyManifest = {
  recordKind: "OPTIMIZATION_STUDY_MANIFEST";
  manifestId: string;
  problemFingerprint: string;
  baselineFingerprint: string;
  variableSetFingerprint: string;
  objectiveSetFingerprint: string;
  constraintSetFingerprint: string;
  methodFingerprint: string;
  runFingerprint: string | null;
  evaluationFingerprints: readonly string[];
  selectedCandidateRef: string | null;
  humanSelectionRef: string | null;
  analysisAndCheckFingerprints: readonly string[];
  fingerprint: string;
  floatingReferences: false;
  equalsDesignApproval: false;
};

export type D1jOptimizationCertificationEvidence = {
  recordKind: "OPTIMIZATION_CERTIFICATION_EVIDENCE";
  evidenceId: string;
  manifestRef: string;
  solverReadiness: "NOT_CERTIFIED";
  validationStatus: "NOT_VALIDATED";
  completeness: D1jCompleteness;
  limitations: string;
  provenance: D1jProvenance;
  version: string;
  fingerprint: string;
  equalsProfessionalCertification: false;
  equalsRegulatoryApproval: false;
  equalsSolverCertification: false;
  equalsCertifiedDesign: false;
  completeEqualsCertifiedDesign: false;
};
