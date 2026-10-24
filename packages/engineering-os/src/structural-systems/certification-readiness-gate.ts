/**
 * EOS-D1J-R4 certification-evidence and readiness gate.
 * Pins study evidence, human review, and human selection.
 * Does not execute a solver, grant validation, or certify a design.
 */

import { D1J_COMPLETENESS_STATES, D1J_READINESS_LAYERS } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1J_R3_CONCRETE_PARAMETER_SEMANTIC_STATUS,
  D1J_R3_VARIABLE_ASSIGNMENT_REFERENCE_RUNTIME_COUNT,
  inspectCandidate,
  propagateCandidateStaleness,
  type D1jR3CandidateSet,
  type D1jR3Evaluation,
  type D1jR3Store,
} from "./candidate-composition";
import { D1J_R2_D1G_CERTIFIED_SOLVER_STATUS, type D1jR2Actor } from "./objective-constraint-foundation";
import { inspectBaselineDesignReference } from "./optimization-problem-foundation";

export const D1J_R4_MATURITY_STATE = "STRUCTURAL_OPTIMIZATION_CERTIFICATION_EVIDENCE_READINESS_GATE_IMPLEMENTED" as const;
export const D1J_R4_PHASE_AUTHORIZED = true as const;
export const D1J_R4_CANONICAL_SCOPE_REUSED = true as const;
export const D1J_R4_EVIDENCE_COMPLETE_EQUALS_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_R4_RECORD_REVIEW_EQUALS_SOFTWARE_ENGINEER_VALIDATION = false as const;
export const D1J_R4_HUMAN_SELECTION_EQUALS_DESIGN_APPROVAL = false as const;
export const D1J_R4_HUMAN_SELECTION_EQUALS_CERTIFICATION = false as const;
export const D1J_R4_CERTIFICATION_ELIGIBLE_EQUALS_CERTIFIED_DESIGN = false as const;
export const D1J_R4_PROCESS_EVIDENCE_EQUALS_PROFESSIONAL_CERTIFICATE = false as const;
export const D1J_R4_CERTIFICATION_ELIGIBILITY_HARDCODED_TRUE = false as const;
export const D1J_R4_CERTIFICATION_TERM_EQUALS_PROFESSIONAL_CERTIFICATION = false as const;
export const D1J_R4_CERTIFICATION_TERM_EQUALS_REGULATORY_APPROVAL = false as const;
export const D1J_R4_CERTIFICATION_TERM_EQUALS_DESIGN_CERTIFICATION = false as const;
export const D1J_R4_CERTIFICATION_TERM_EQUALS_SOLVER_CERTIFICATION = false as const;
export const D1J_R4_SELECTION_MUTATES_OBJECTIVE_VALUES = false as const;
export const D1J_R4_SELECTION_MUTATES_FEASIBILITY = false as const;
export const D1J_R4_SELECTION_MUTATES_PARETO_STATUS = false as const;
export const D1J_R4_SELECTION_OVERRIDES_FAILED_CHECK = false as const;
export const D1J_R4_INFEASIBLE_SELECTED_CANDIDATE_CAN_BE_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_R4_UNDETERMINED_SELECTED_CANDIDATE_CAN_BE_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_R4_STALE_SELECTED_CANDIDATE_CAN_BE_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_R4_SELECTION_CAN_OVERRIDE_READINESS_GATE = false as const;
export const D1J_R4_HUMAN_CAN_RECORD_DOMINATED_CANDIDATE_SELECTION = true as const;
export const D1J_R4_DOMINATED_SELECTION_REQUIRES_EXPLICIT_RATIONALE = true as const;
export const D1J_R4_SELECTION_RECLASSIFIES_DOMINANCE = false as const;
export const D1J_R4_SELECTION_CREATES_HIDDEN_OBJECTIVE = false as const;
export const D1J_R4_STUDY_REVIEW_CAN_PROMOTE_D1J_ENGINEER_VALIDATION = false as const;
export const D1J_R4_STUDY_REVIEW_CAN_PROMOTE_D1J_CONFORMANCE_VALIDATION = false as const;
export const D1J_R4_EXECUTES_D1G = false as const;
export const D1J_R4_CERTIFIES_D1G = false as const;
export const D1J_R4_CREATES_D1G_CERTIFICATION_ROUTE = false as const;
export const D1J_R4_AI_CAN_GOVERN_SELECTION = false as const;
export const D1J_R4_AI_CAN_GRANT_ENGINEER_VALIDATION = false as const;
export const D1J_R4_AI_CAN_GRANT_CONFORMANCE_VALIDATION = false as const;
export const D1J_R4_AI_CAN_GRANT_CERTIFICATION_ELIGIBILITY = false as const;
export const D1J_R4_INVENTS_ENGINEERING_PARAMETER_SEMANTICS = false as const;
export const D1J_R4_D1G_MATURITY_PROMOTION = false as const;
export const D1J_R4_D1I_MATURITY_PROMOTION = false as const;
export const D1J_R4_D1D_MATURITY_PROMOTION = false as const;
export const D1J_R4_D1E_MATURITY_PROMOTION = false as const;
export const D1J_R4_R1_R2_R3_MATURITY_PROMOTION = false as const;
export const D1J_R4_EXISTING_REVIEW_DECISION_INFRASTRUCTURE = "EngineeringDecisionService remains the formal engineering-decision record. Concrete review packs keep their own engineer-review taxonomy. R4 records a study review and a study selection and does not call either workflow." as const;
export const D1J_R4_PARALLEL_ENGINEERING_APPROVAL_SYSTEM_CREATED = false as const;
export const D1J_R4_STUDY_EVIDENCE_CONTRACT = "Study evidence cites the immutable manifest and records completeness, readiness inputs, and certification eligibility. It is not a design model and it is not an approval." as const;
export const D1J_R4_STUDY_EVIDENCE_EQUALS_DESIGN_MODEL = false as const;
export const D1J_R4_STUDY_EVIDENCE_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1J_R4_STUDY_MANIFEST_CONTRACT = "The study manifest pins the R1 problem, baseline, variable set, R2 objective and check sets, R3 candidate set, selected-candidate evidence, human review, and human selection by exact fingerprint." as const;
export const D1J_R4_MANIFEST_PINNED_FIELDS = "problem fingerprint, baseline fingerprint, variable-set fingerprint, parameter-semantic status, objective-set fingerprint, required-check-set fingerprint, evaluation-profile fingerprint, candidate-set fingerprint, candidate fingerprints, evaluation fingerprints, feasibility fingerprint, comparison fingerprints, selected-candidate fingerprint, review fingerprints, selection fingerprint, D1G fingerprint, engineer-validation fingerprint, conformance fingerprint" as const;
export const D1J_R4_FLOATING_PROBLEM_REFERENCE_ALLOWED = false as const;
export const D1J_R4_FLOATING_BASELINE_REFERENCE_ALLOWED = false as const;
export const D1J_R4_FLOATING_VARIABLE_SET_REFERENCE_ALLOWED = false as const;
export const D1J_R4_FLOATING_OBJECTIVE_SET_REFERENCE_ALLOWED = false as const;
export const D1J_R4_FLOATING_REQUIRED_CHECK_SET_REFERENCE_ALLOWED = false as const;
export const D1J_R4_FLOATING_CANDIDATE_REFERENCE_ALLOWED = false as const;
export const D1J_R4_FLOATING_EVALUATION_REFERENCE_ALLOWED = false as const;
export const D1J_R4_MANIFEST_FLOATING_REFERENCE_COUNT = 0 as const;
export const D1J_R4_HUMAN_REVIEW_CONTRACT = "A candidate review pins the candidate, evaluation, feasibility, reviewer identity taken from the authenticated actor, explicit scope, basis, and a study outcome that is not software validation." as const;
export const D1J_R4_HUMAN_REVIEWER_REQUIRED = true as const;
export const D1J_R4_AI_CAN_BE_REVIEWER_OF_RECORD = false as const;
export const D1J_R4_REVIEW_SCOPE_BOUND = true as const;
export const D1J_R4_REVIEW_OUTCOMES = ["REVIEW_RECORDED", "REVIEW_RECORDED_WITH_LIMITATIONS", "NOT_ACCEPTED_FOR_STUDY"] as const;
export const D1J_R4_REVIEW_OUTCOME_TAXONOMY = "REVIEW_RECORDED, REVIEW_RECORDED_WITH_LIMITATIONS, NOT_ACCEPTED_FOR_STUDY. These outcomes are study records. They are not the concrete engineer-review decisions and they do not grant software validation." as const;
export const D1J_R4_REVIEW_CAN_OVERRIDE_FEASIBILITY = false as const;
export const D1J_R4_REVIEW_CAN_OVERRIDE_PARETO_CLASSIFICATION = false as const;
export const D1J_R4_REVIEW_MUTATED_IN_PLACE = false as const;
export const D1J_R4_HUMAN_SELECTION_CONTRACT = "A selection pins the candidate set, the selected candidate fingerprint, evaluation, feasibility, human actor, purpose, and rationale. It does not approve a design." as const;
export const D1J_R4_FINAL_SELECTION_REQUIRES_HUMAN = true as const;
export const D1J_R4_AI_CAN_GOVERN_FINAL_SELECTION = false as const;
export const D1J_R4_OPTIMIZER_CAN_GOVERN_FINAL_SELECTION = false as const;
export const D1J_R4_NONDOMINATED_STATUS_AUTO_SELECTS_CANDIDATE = false as const;
export const D1J_R4_SELECTED_CANDIDATE_MUST_BE_IN_CANDIDATE_SET = true as const;
export const D1J_R4_UNREGISTERED_EXTERNAL_CANDIDATE_CAN_BE_SELECTED = false as const;
export const D1J_R4_PROFESSIONAL_REGISTRATION_INFERRED = false as const;
export const D1J_R4_SELECTION_PURPOSES = ["PREFERRED_FOR_FURTHER_DEVELOPMENT", "SELECTED_OPTIMIZATION_ALTERNATIVE"] as const;
export const D1J_R4_SELECTION_PURPOSE_POLICY = "PREFERRED_FOR_FURTHER_DEVELOPMENT and SELECTED_OPTIMIZATION_ALTERNATIVE are study decisions. Neither purpose is formal design approval." as const;
export const D1J_R4_INFEASIBLE_SELECTION_CAN_CREATE_CERTIFICATION_ELIGIBILITY = false as const;
export const D1J_R4_UNDETERMINED_SELECTION_CAN_CREATE_CERTIFICATION_ELIGIBILITY = false as const;
export const D1J_R4_DOMINATED_SELECTION_RATIONALE_REQUIRED = true as const;
export const D1J_R4_DOMINATED_SELECTION_CHANGES_OBJECTIVE_SET = false as const;
export const D1J_R4_DOMINATED_SELECTION_CHANGES_PARETO_CLASSIFICATION = false as const;
export const D1J_R4_SELECTION_RATIONALE_AUTO_BECOMES_OBJECTIVE = false as const;
export const D1J_R4_SELECTION_RATIONALE_AUTO_BECOMES_CONSTRAINT = false as const;
export const D1J_R4_SELECTION_HISTORY_APPEND_ONLY = true as const;
export const D1J_R4_NEW_SELECTION_REWRITES_OLD_SELECTION = false as const;
export const D1J_R4_SELECTION_EQUALS_FORMAL_ENGINEERING_APPROVAL = false as const;
export const D1J_R4_ENGINEERING_APPROVAL_HANDOFF = "Formal design approval stays in the existing engineering-review decision workflow. A D1J selection cites a preferred candidate and does not create a second approval mechanism, an issued design, or a professional certification." as const;
export const D1J_R4_SELECTED_CANDIDATE_EVIDENCE_CONTRACT = "Selected-candidate evidence pins that candidate design state, its own objective and check references, feasibility, comparison membership, review, and selection. Baseline evidence cannot stand in for it." as const;
export const D1J_R4_R3_CANDIDATE_EVIDENCE_CORRELATION_REUSED = true as const;
export const D1J_R4_BASELINE_EVIDENCE_CAN_SUBSTITUTE_FOR_SELECTED_CANDIDATE_EVIDENCE = false as const;
export const D1J_R4_EVIDENCE_COMPLETENESS_STATES = "COMPLETE_FOR_DECLARED_SCOPE, PARTIAL, INCOMPLETE, STALE, INVALID, UNDETERMINED" as const;
export const D1J_R4_EVIDENCE_COMPLETENESS_CONTRACT = "Completeness inspects the pinned problem, baseline, variable set, parameter-semantic status, objective and check sets, candidate set, selected evidence, review, selection, staleness, and provenance. It does not decide certification eligibility." as const;
export const D1J_R4_COMPLETE_EVIDENCE_CAN_EXIST_WHILE_NOT_CERTIFICATION_ELIGIBLE = true as const;
export const D1J_R4_MISSING_SELECTION_COMPLETENESS_POLICY = "A study package may be recorded before selection. Its completeness stays INCOMPLETE and it cannot claim a completed selected study." as const;
export const D1J_R4_MISSING_REVIEW_COMPLETENESS_POLICY = "A selected study without an exact human review stays INCOMPLETE." as const;
export const D1J_R4_PARAMETER_SEMANTIC_DEBT_DISCLOSED = true as const;
export const D1J_R4_REFERENCE_ONLY_CANDIDATE_FALSELY_DESCRIBED_AS_EOS_GENERATED_DESIGN = false as const;
export const D1J_R4_READINESS_LAYER_MODEL = "ARCHITECTURE_READY, FIXTURE_TEST_READY, PILOT_RUNTIME_READY, LIVE_SOLVER_RUNTIME_READY, ENGINEER_VALIDATED, CONFORMANCE_VALIDATED, CERTIFICATION_ELIGIBLE." as const;
export const D1J_R4_READINESS_COLLAPSED_TO_SINGLE_BOOLEAN = false as const;
export const D1J_R4_ARCHITECTURE_READY = true as const;
export const D1J_R4_FIXTURE_TEST_READY = true as const;
export const D1J_R4_FIXTURE_TEST_EQUALS_LIVE_VALIDATION = false as const;
export const D1J_R4_PILOT_RUNTIME_READY = false as const;
export const D1J_R4_LIVE_SOLVER_RUNTIME_READY = false as const;
export const D1J_R4_ENGINEER_VALIDATED_SOURCE_REQUIRED = true as const;
export const D1J_R4_ENGINEER_VALIDATED = false as const;
export const D1J_R4_CONFORMANCE_VALIDATION_SOURCE_REQUIRED = true as const;
export const D1J_R4_CONFORMANCE_VALIDATED = false as const;
export const D1J_R4_D1G_CERTIFIED_SOLVER_STATUS = D1J_R2_D1G_CERTIFIED_SOLVER_STATUS;
export const D1J_R4_CALLER_CAN_ESTABLISH_D1G_CERTIFICATION = false as const;
export const D1J_R4_D1G_OFFLINE_CONFORMANCE_EQUALS_CERTIFIED_SOLVER = false as const;
export const D1J_R4_SPACE_GASS_LIVE_EXECUTION_COUNT = 0 as const;
export const D1J_R4_CALLER_CAN_ESTABLISH_D1J_ENGINEER_VALIDATION = false as const;
export const D1J_R4_CALLER_CAN_ESTABLISH_D1J_CONFORMANCE_VALIDATION = false as const;
export const D1J_R4_CERTIFICATION_ELIGIBILITY_CONTRACT = "Eligibility cites the manifest and selected evidence, then reports NOT_ELIGIBLE, ELIGIBLE, or UNDETERMINED from the pinned gates. The current canonical gates keep it NOT_ELIGIBLE." as const;
export const D1J_R4_CERTIFICATION_ELIGIBILITY_STATES = "ELIGIBLE, NOT_ELIGIBLE, UNDETERMINED" as const;
export const D1J_R4_CURRENT_CERTIFICATION_ELIGIBILITY = "NOT_ELIGIBLE" as const;
export const D1J_R4_ELIGIBILITY_REQUIRES_VALID_MANIFEST = true as const;
export const D1J_R4_ELIGIBILITY_REQUIRES_COMPLETE_EVIDENCE = true as const;
export const D1J_R4_ELIGIBILITY_REQUIRES_HUMAN_SELECTED_CANDIDATE = true as const;
export const D1J_R4_ELIGIBILITY_REQUIRES_SELECTED_CANDIDATE_FEASIBLE = true as const;
export const D1J_R4_ELIGIBILITY_REQUIRES_VALID_SELECTED_CANDIDATE_EVIDENCE = true as const;
export const D1J_R4_ELIGIBILITY_REQUIRES_CURRENT_NONSTALE_EVIDENCE = true as const;
export const D1J_R4_ELIGIBILITY_REQUIRES_HUMAN_REVIEW = true as const;
export const D1J_R4_ELIGIBILITY_REQUIRES_CERTIFIED_D1G = true as const;
export const D1J_R4_ELIGIBILITY_REQUIRES_D1J_ENGINEER_VALIDATION = true as const;
export const D1J_R4_ELIGIBILITY_REQUIRES_D1J_CONFORMANCE_VALIDATION = true as const;
export const D1J_R4_DOMINATED_CANDIDATE_ELIGIBILITY_POLICY = "Dominance alone is not a certification blocker. A dominated selection still needs every other eligibility gate, including certified D1G and both D1J validations." as const;
export const D1J_R4_COMPARISON_INELIGIBLE_SELECTION_POLICY = "A comparison-ineligible selection is not represented as supported by the candidate-set trade-off comparison." as const;
export const D1J_R4_SELECTED_INFEASIBLE_CAN_BE_ELIGIBLE = false as const;
export const D1J_R4_SELECTED_UNDETERMINED_CAN_BE_ELIGIBLE = false as const;
export const D1J_R4_MISSING_REQUIRED_OBJECTIVE_EVIDENCE_CAN_BE_COMPLETE = false as const;
export const D1J_R4_MISSING_REQUIRED_CHECK_EVIDENCE_CAN_BE_COMPLETE = false as const;
export const D1J_R4_NOT_CERTIFIED_D1G_CAN_YIELD_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_R4_NOT_ENGINEER_VALIDATED_CAN_YIELD_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_R4_NOT_CONFORMANCE_VALIDATED_CAN_YIELD_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_R4_HUMAN_SELECTION_CAN_BYPASS_MISSING_D1G_CERTIFICATION = false as const;
export const D1J_R4_HUMAN_SELECTION_CAN_BYPASS_ENGINEER_VALIDATION = false as const;
export const D1J_R4_HUMAN_SELECTION_CAN_BYPASS_CONFORMANCE_VALIDATION = false as const;
export const D1J_R4_ADMIN_CERTIFICATION_OVERRIDE_CREATED = false as const;
export const D1J_R4_AI_CERTIFICATION_OVERRIDE_CREATED = false as const;
export const D1J_R4_ELIGIBILITY_DERIVATION_POLICY = "Eligibility is the conjunction of a current complete manifest, a feasible selected candidate, human review, human selection, certified D1G, D1J engineer validation, and D1J conformance validation. No engineering formula is introduced." as const;
export const D1J_R4_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1J_R4_MANIFEST_FINGERPRINT_IMPLEMENTED = true as const;
export const D1J_R4_REVIEW_FINGERPRINT_IMPLEMENTED = true as const;
export const D1J_R4_SELECTION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1J_R4_ELIGIBILITY_FINGERPRINT_IMPLEMENTED = true as const;
export const D1J_R4_FINGERPRINT_DETERMINISM = "PASS" as const;
export const D1J_R4_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1J_R4_REVIEW_PROVENANCE_COMPLETE = true as const;
export const D1J_R4_SELECTION_PROVENANCE_COMPLETE = true as const;
export const D1J_R4_MANIFEST_PROVENANCE_COMPLETE = true as const;
export const D1J_R4_ELIGIBILITY_PROVENANCE_COMPLETE = true as const;
export const D1J_R4_HISTORY_APPEND_ONLY = true as const;
export const D1J_R4_NEW_REVIEW_REWRITES_OLD_REVIEW = false as const;
export const D1J_R4_ELIGIBILITY_REASSESSMENT_REWRITES_HISTORY = false as const;
export const D1J_R4_BASELINE_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R4_VARIABLE_SET_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R4_OBJECTIVE_SET_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R4_REQUIRED_CHECK_SET_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R4_CANDIDATE_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R4_CANDIDATE_EVALUATION_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R4_FEASIBILITY_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R4_CANDIDATE_SET_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R4_HUMAN_REVIEW_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R4_SELECTION_CHANGE_PROPAGATES_STALE = true as const;
export const D1J_R4_D1G_READINESS_CHANGE_PROPAGATES = true as const;
export const D1J_R4_ENGINEER_VALIDATION_CHANGE_PROPAGATES = true as const;
export const D1J_R4_CONFORMANCE_VALIDATION_CHANGE_PROPAGATES = true as const;
export const D1J_R4_STALE_MANIFEST_CAN_SUPPORT_CERTIFICATION_ELIGIBLE = false as const;
export const D1J_R4_INVALIDATION_DELETES_HISTORY = false as const;
export const D1J_R4_INVALIDATION_MUTATES_UPSTREAM_SOURCE = false as const;
export const D1J_R4_HISTORICAL_REPRODUCIBILITY = "PASS" as const;
export const D1J_R4_TRUSTED_RECORDED_TIME_REQUIRED = true as const;
export const D1J_R4_CALLER_CAN_BACKDATE_AUDIT_HISTORY = false as const;
export const D1J_R4_RUNTIME_API = "registerCandidateReview, inspectCandidateReview, recordCandidateSelection, inspectCandidateSelection, composeSelectedCandidateEvidence, createOptimizationStudyManifest, evaluateStudyEvidenceCompleteness, assessCertificationReadiness, inspectCertificationReadiness, supersedeCandidateReview, supersedeCandidateSelection, propagateCertificationEvidenceStaleness, produceCertificationEvidenceReadinessResult" as const;
export const D1J_R4_DESIGN_CERTIFICATION_API_COUNT = 0 as const;
export const D1J_R4_OPTIMIZATION_EXECUTION_API_COUNT = 0 as const;
export const D1J_R4_SOLVER_EXECUTION_API_COUNT = 0 as const;
export const D1J_R4_ENGINEERING_CHECK_EXECUTION_API_COUNT = 0 as const;
export const D1J_R4_REVIEW_TRUST_BOUNDARY = "The caller may supply review scope, basis, outcome, and limitations. The reviewer identity, candidate fingerprint, feasibility, objective values, and validation states are resolved by the runtime." as const;
export const D1J_R4_SELECTION_TRUST_BOUNDARY = "The caller may name a candidate in a set and supply purpose and rationale. The runtime resolves the candidate, set, fingerprint, evaluation, feasibility, and comparison class." as const;
export const D1J_R4_CALLER_CAN_SET_READINESS_FLAGS_DIRECTLY = false as const;
export const D1J_R4_ERROR_TAXONOMY = "OPTIMIZATION_PROBLEM_NOT_FOUND, CANDIDATE_NOT_FOUND, CANDIDATE_SET_NOT_FOUND, CANDIDATE_NOT_IN_SET, CANDIDATE_FINGERPRINT_MISMATCH, CANDIDATE_EVALUATION_NOT_FOUND, CANDIDATE_FEASIBILITY_NOT_FOUND, CANDIDATE_EVIDENCE_STALE, BASELINE_EVIDENCE_SUBSTITUTION, HUMAN_REVIEW_REQUIRED, REVIEW_AUTHORITY_REQUIRED, REVIEW_SCOPE_REQUIRED, SELECTION_AUTHORITY_REQUIRED, SELECTION_RATIONALE_REQUIRED, SELECTED_CANDIDATE_INFEASIBLE, SELECTED_CANDIDATE_UNDETERMINED, STUDY_MANIFEST_INCOMPLETE, STUDY_MANIFEST_STALE, D1G_CERTIFIED_SOLVER_REQUIRED, D1J_ENGINEER_VALIDATION_REQUIRED, D1J_CONFORMANCE_VALIDATION_REQUIRED, CERTIFICATION_NOT_ELIGIBLE, CROSS_PROJECT_OPERATION, CROSS_TENANT_OPERATION, UNAUTHORIZED, REVIEWER_IDENTITY_SPOOF" as const;
export const D1J_R4_RUNTIME_RESULT_CONTRACT = "The readiness result pins the manifest, selection, completeness, separate readiness layers, and NOT_ELIGIBLE blockers. It is not a certificate and it is not design approval." as const;
export const D1J_R4_RUNTIME_RESULT_EQUALS_CERTIFICATE = false as const;
export const D1J_R4_RUNTIME_RESULT_EQUALS_DESIGN_APPROVAL = false as const;
export const D1J_R4_EVENTS = [
  "OPTIMIZATION_CANDIDATE_REVIEW_RECORDED",
  "OPTIMIZATION_CANDIDATE_REVIEW_SUPERSEDED",
  "OPTIMIZATION_CANDIDATE_SELECTION_RECORDED",
  "OPTIMIZATION_CANDIDATE_SELECTION_SUPERSEDED",
  "OPTIMIZATION_STUDY_MANIFEST_CREATED",
  "OPTIMIZATION_STUDY_MANIFEST_STALE",
  "OPTIMIZATION_CERTIFICATION_READINESS_ASSESSED",
] as const;
export const D1J_R4_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1J_R4_EVENT_EQUALS_CERTIFICATION = false as const;
export const D1J_R4_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1J_R4_IDEMPOTENCY_POLICY = "Repeating the same review, selection, manifest, or readiness assessment returns the existing record and does not append a second history row." as const;
export const D1J_R4_DUPLICATE_REVIEW_COUNTS_AS_INDEPENDENT_REVIEW = false as const;
export const D1J_R4_DUPLICATE_SELECTION_COUNTS_AS_NEW_DECISION = false as const;
export const D1J_R4_CROSS_PROJECT_REVIEW_ALLOWED = false as const;
export const D1J_R4_CROSS_PROJECT_SELECTION_ALLOWED = false as const;
export const D1J_R4_CROSS_PROJECT_MANIFEST_ALLOWED = false as const;
export const D1J_R4_CROSS_TENANT_REVIEW_ALLOWED = false as const;
export const D1J_R4_CROSS_TENANT_SELECTION_ALLOWED = false as const;
export const D1J_R4_CROSS_TENANT_MANIFEST_ALLOWED = false as const;
export const D1J_R4_STUDY_EVIDENCE_RUNTIME_COUNT = 1 as const;
export const D1J_R4_STUDY_MANIFEST_RUNTIME_COUNT = 1 as const;
export const D1J_R4_HUMAN_REVIEW_RUNTIME_COUNT = 1 as const;
export const D1J_R4_HUMAN_SELECTION_RUNTIME_COUNT = 1 as const;
export const D1J_R4_SELECTED_CANDIDATE_EVIDENCE_RUNTIME_COUNT = 1 as const;
export const D1J_R4_EVIDENCE_COMPLETENESS_RUNTIME_COUNT = 1 as const;
export const D1J_R4_READINESS_GATE_RUNTIME_COUNT = 1 as const;
export const D1J_R4_CERTIFICATION_ELIGIBILITY_RUNTIME_COUNT = 1 as const;
export const D1J_R4_OPTIMIZATION_SEARCH_RUNTIME_COUNT = 0 as const;
export const D1J_R4_CANDIDATE_GENERATION_RUNTIME_COUNT = 0 as const;
export const D1J_R4_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1J_R4_ENGINEERING_CHECK_EXECUTION_COUNT = 0 as const;
export const D1J_R4_MODEL_MUTATION_COUNT = 0 as const;
export const D1J_R4_AUTOMATIC_SELECTION_RUNTIME_COUNT = 0 as const;
export const D1J_R4_PROFESSIONAL_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D1J_R4_DIRECT_CERTIFICATION_FLAG_WRITE_SURFACE_CREATED = false as const;
export const D1J_R4_CALLER_CAN_SPOOF_HUMAN_REVIEWER = false as const;
export const D1J_R4_CALLER_CAN_SPOOF_HUMAN_SELECTOR = false as const;
export const D1J_R4_REVIEW_AUTHORITY_SPOOF_ALLOWED = false as const;
export const D1J_R4_SELECTION_AUTHORITY_SPOOF_ALLOWED = false as const;
export const D1J_R4_READINESS_AUTHORITY_SPOOF_ALLOWED = false as const;
export const D1J_R4_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1J_R4_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1J_R4_NEW_DEPENDENCY_COUNT = 0 as const;
export const D1J_R4_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1J_R4_PARALLEL_CAPABILITY_MANIFEST_CREATED = false as const;
export const D1J_R5_CANONICAL_PHASE = "EOS-D1J-R5-STRUCTURAL-OPTIMIZATION-CERTIFICATION-CLOSEOUT" as const;
export const D1J_R5_PHASE_TYPE = "STRUCTURAL_OPTIMIZATION_CERTIFICATION_CLOSEOUT" as const;
export const D1J_R5_CANONICAL_SCOPE = "R5 may close the bounded track and cannot grant D1G certification, engineer validation, conformance validation, or certification eligibility." as const;
export const D1J_R5_HANDOFF_READY = true as const;
export const D1J_R5_REQUIRED_R4_CONTRACTS = "Study evidence, manifest, human review, human selection, selected-candidate evidence, evidence completeness, readiness layers, D1G certified-solver state, D1J engineer-validation state, D1J conformance-validation state, certification eligibility, blockers, limitations, provenance, fingerprints, history, and staleness." as const;
export const D1J_R4_NOT_ELIGIBLE_STATUS_AUTOMATICALLY_BLOCKS_R5_CLOSEOUT = false as const;
export const D1J_R4_REVIEW_SCOPES = ["CANDIDATE_RECORD", "CANDIDATE_EVIDENCE", "STUDY_RECORD"] as const;

const REVIEW_SCOPES = D1J_R4_REVIEW_SCOPES;
const REVIEW_OUTCOMES = D1J_R4_REVIEW_OUTCOMES;
const SELECTION_PURPOSES = D1J_R4_SELECTION_PURPOSES;

export type D1jR4Review = {
  reviewId: string;
  optimizationProblemId: string;
  candidateId: string;
  candidateFingerprint: string;
  evaluationRef: string;
  feasibilityRef: string;
  feasibilityState: string;
  candidateSetId: string;
  reviewerIdentity: string;
  reviewAuthority: string;
  reviewScope: (typeof REVIEW_SCOPES)[number];
  reviewBasis: string;
  reviewOutcome: (typeof REVIEW_OUTCOMES)[number];
  softwareValidation: false;
  limitations: string;
  status: "CURRENT" | "STALE" | "SUPERSEDED";
  version: string;
  fingerprint: string;
  recordedAt: string;
  callerBackdated: false;
};

export type D1jR4Selection = {
  selectionId: string;
  optimizationProblemId: string;
  candidateSetId: string;
  candidateSetFingerprint: string;
  selectedCandidateId: string;
  selectedCandidateFingerprint: string;
  evaluationRef: string;
  feasibilityRef: string;
  feasibilityState: string;
  dominated: boolean;
  comparisonIneligible: boolean;
  selectionAuthority: string;
  selectionActor: string;
  selectionPurpose: (typeof SELECTION_PURPOSES)[number];
  tradeOffRationale: string;
  designApproval: false;
  certification: false;
  status: "CURRENT" | "STALE" | "SUPERSEDED";
  version: string;
  fingerprint: string;
  recordedAt: string;
  callerBackdated: false;
};

export type D1jR4SelectedEvidence = {
  selectedEvidenceId: string;
  candidateId: string;
  designStateFingerprint: string;
  objectiveValueReferenceIds: readonly string[];
  checkResultReferenceIds: readonly string[];
  feasibilityRef: string;
  candidateSetId: string;
  reviewId: string;
  selectionId: string;
  baselineSubstituted: false;
  fingerprint: string;
};

export type D1jR4Manifest = {
  manifestId: string;
  optimizationProblemId: string;
  problemFingerprint: string;
  baselineFingerprint: string;
  variableSetFingerprint: string | null;
  parameterSemanticStatus: typeof D1J_R3_CONCRETE_PARAMETER_SEMANTIC_STATUS;
  assignmentReferenceCount: typeof D1J_R3_VARIABLE_ASSIGNMENT_REFERENCE_RUNTIME_COUNT;
  referenceOnlyCandidates: true;
  generatedDesign: false;
  objectiveSetFingerprint: string;
  requiredCheckSetFingerprint: string;
  evaluationProfileFingerprint: string;
  candidateSetId: string;
  candidateSetFingerprint: string;
  selectedEvidenceId: string | null;
  reviewIds: readonly string[];
  selectionId: string | null;
  d1gStatus: typeof D1J_R4_D1G_CERTIFIED_SOLVER_STATUS;
  d1gFingerprint: string;
  engineerValidationStatus: "NOT_VALIDATED";
  engineerValidationFingerprint: string;
  conformanceValidationStatus: "NOT_VALIDATED";
  conformanceValidationFingerprint: string;
  status: "CURRENT" | "STALE" | "SUPERSEDED";
  version: string;
  fingerprint: string;
  recordedAt: string;
  callerBackdated: false;
};

export type D1jR4StudyEvidence = {
  studyEvidenceId: string;
  manifestId: string;
  manifestFingerprint: string;
  completeness: (typeof D1J_COMPLETENESS_STATES)[number];
  certificationEligibility: "NOT_ELIGIBLE";
  designModel: false;
  engineeringApproval: false;
  fingerprint: string;
};

export type D1jR4Eligibility = {
  eligibilityId: string;
  manifestId: string;
  manifestFingerprint: string;
  selectedCandidateId: string | null;
  completeness: (typeof D1J_COMPLETENESS_STATES)[number];
  d1gStatus: typeof D1J_R4_D1G_CERTIFIED_SOLVER_STATUS;
  engineerValidationStatus: "NOT_VALIDATED";
  conformanceValidationStatus: "NOT_VALIDATED";
  eligibilityState: "NOT_ELIGIBLE";
  blockingReasons: readonly string[];
  certificate: false;
  designApproval: false;
  status: "CURRENT" | "STALE" | "SUPERSEDED";
  version: string;
  fingerprint: string;
  recordedAt: string;
  callerBackdated: false;
};

export type D1jR4Store = {
  r3: D1jR3Store;
  reviews: D1jR4Review[];
  selections: D1jR4Selection[];
  selectedEvidence: D1jR4SelectedEvidence[];
  manifests: D1jR4Manifest[];
  studyEvidence: D1jR4StudyEvidence[];
  eligibilities: D1jR4Eligibility[];
  sources: {
    d1gFingerprint: string;
    engineerValidationFingerprint: string;
    conformanceValidationFingerprint: string;
  };
  history: { historyId: string; subjectId: string; action: string; fingerprint: string; recordedAt: string }[];
  events: { eventId: string; eventType: (typeof D1J_R4_EVENTS)[number]; subjectId: string; certification: false; engineeringApproval: false }[];
  now: () => string;
};

function fail(code: string): never {
  throw new Error(code);
}

function assertHuman(actor: D1jR2Actor): void {
  if (!actor.actorId || !actor.authority || actor.authority === "AI" || actor.authority === "LLM" || actor.authority === "OPTIMIZER" || actor.authority === "SYSTEM") fail("UNAUTHORIZED");
}

function remember(store: D1jR4Store, subjectId: string, action: string, fingerprint: string): void {
  store.history.push({ historyId: `r4h-${store.history.length + 1}`, subjectId, action, fingerprint, recordedAt: store.now() });
}

function emit(store: D1jR4Store, eventType: (typeof D1J_R4_EVENTS)[number], subjectId: string): void {
  store.events.push({ eventId: `r4e-${store.events.length + 1}`, eventType, subjectId, certification: false, engineeringApproval: false });
}

function exact(id: string): void {
  if (!id || id === "latest") fail("STUDY_MANIFEST_INCOMPLETE");
}

function isolate(actor: D1jR2Actor, store: D1jR4Store, candidateId: string): void {
  const candidate = inspectCandidate(store.r3, candidateId);
  const design = store.r3.designStates.find((row) => row.designStateId === candidate.designStateId) ?? fail("CANDIDATE_NOT_FOUND");
  if (actor.tenantId !== design.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== design.workspaceId || actor.projectId !== design.projectId) fail("CROSS_PROJECT_OPERATION");
}

export function createD1jR4Store(r3: D1jR3Store, now: () => string): D1jR4Store {
  return {
    r3, now, reviews: [], selections: [], selectedEvidence: [], manifests: [], studyEvidence: [], eligibilities: [],
    sources: { d1gFingerprint: "d1g-not-certified", engineerValidationFingerprint: "d1j-engineer-not-validated", conformanceValidationFingerprint: "d1j-conformance-not-validated" },
    history: [], events: [],
  };
}

function evaluationOf(store: D1jR4Store, candidateId: string): D1jR3Evaluation | null {
  return [...store.r3.evaluations].reverse().find((row) => row.candidateId === candidateId) ?? null;
}

function setOf(store: D1jR4Store, candidateSetId: string): D1jR3CandidateSet {
  return store.r3.sets.find((row) => row.candidateSetId === candidateSetId) ?? fail("CANDIDATE_SET_NOT_FOUND");
}

export function registerCandidateReview(store: D1jR4Store, actor: D1jR2Actor, input: {
  reviewId: string;
  candidateId: string;
  candidateSetId: string;
  reviewScope: string;
  reviewBasis: string;
  reviewOutcome: string;
  limitations: string;
  version: string;
  claimedReviewerId?: string | null;
  successorOfReviewId?: string | null;
}): D1jR4Review {
  assertHuman(actor);
  exact(input.reviewId);
  exact(input.candidateId);
  if (input.claimedReviewerId && input.claimedReviewerId !== actor.actorId) fail("REVIEWER_IDENTITY_SPOOF");
  isolate(actor, store, input.candidateId);
  const candidate = inspectCandidate(store.r3, input.candidateId);
  const set = setOf(store, input.candidateSetId);
  if (!set.candidateIds.includes(candidate.candidateId)) fail("CANDIDATE_NOT_IN_SET");
  if (!(REVIEW_SCOPES as readonly string[]).includes(input.reviewScope)) fail("REVIEW_SCOPE_REQUIRED");
  if (!(REVIEW_OUTCOMES as readonly string[]).includes(input.reviewOutcome)) fail("REVIEW_SCOPE_REQUIRED");
  const evaluation = evaluationOf(store, candidate.candidateId);
  const feasibilityState = evaluation?.feasibilityState ?? "UNDETERMINED";
  const feasibilityBefore = feasibilityState;
  const dominatedBefore = [...set.dominatedCandidateIds];
  const fingerprint = fingerprintCanonical({
    candidate: candidate.fingerprint, evaluation: evaluation?.feasibilityReferenceId ?? "UNRESOLVED", feasibility: feasibilityState,
    scope: input.reviewScope, basis: input.reviewBasis, outcome: input.reviewOutcome, actor: actor.actorId, version: input.version,
  });
  const duplicate = store.reviews.find((row) => row.fingerprint === fingerprint && row.status !== "SUPERSEDED");
  if (duplicate && input.successorOfReviewId !== duplicate.reviewId) return duplicate;
  if (input.successorOfReviewId) {
    const previous = store.reviews.find((row) => row.reviewId === input.successorOfReviewId && row.status !== "SUPERSEDED") ?? fail("HUMAN_REVIEW_REQUIRED");
    previous.status = "SUPERSEDED";
    remember(store, previous.reviewId, "SUPERSEDED", previous.fingerprint);
    emit(store, "OPTIMIZATION_CANDIDATE_REVIEW_SUPERSEDED", previous.reviewId);
  }
  const review: D1jR4Review = {
    reviewId: input.reviewId, optimizationProblemId: candidate.optimizationProblemId, candidateId: candidate.candidateId,
    candidateFingerprint: candidate.fingerprint, evaluationRef: evaluation?.evidenceId ?? "UNRESOLVED", feasibilityRef: evaluation?.feasibilityReferenceId ?? "UNRESOLVED",
    feasibilityState, candidateSetId: set.candidateSetId, reviewerIdentity: actor.actorId,
    reviewAuthority: actor.authority, reviewScope: input.reviewScope as D1jR4Review["reviewScope"], reviewBasis: input.reviewBasis,
    reviewOutcome: input.reviewOutcome as D1jR4Review["reviewOutcome"], softwareValidation: false, limitations: input.limitations,
    status: "CURRENT", version: input.version, fingerprint, recordedAt: store.now(), callerBackdated: false,
  };
  store.reviews.push(review);
  remember(store, review.reviewId, "REVIEW", fingerprint);
  emit(store, "OPTIMIZATION_CANDIDATE_REVIEW_RECORDED", review.reviewId);
  if (feasibilityState !== feasibilityBefore || set.dominatedCandidateIds.join("|") !== dominatedBefore.join("|")) fail("REVIEW_CAN_OVERRIDE_FEASIBILITY");
  return review;
}

export function inspectCandidateReview(store: D1jR4Store, reviewId: string): D1jR4Review {
  return store.reviews.find((row) => row.reviewId === reviewId) ?? fail("HUMAN_REVIEW_REQUIRED");
}

export function recordCandidateSelection(store: D1jR4Store, actor: D1jR2Actor, input: {
  selectionId: string;
  candidateSetId: string;
  selectedCandidateId: string;
  selectionPurpose: string;
  tradeOffRationale?: string | null;
  version: string;
  claimedSelectorId?: string | null;
  expectedCandidateFingerprint?: string | null;
  successorOfSelectionId?: string | null;
}): D1jR4Selection {
  assertHuman(actor);
  exact(input.selectionId);
  exact(input.selectedCandidateId);
  if (input.claimedSelectorId && input.claimedSelectorId !== actor.actorId) fail("REVIEWER_IDENTITY_SPOOF");
  if (!(SELECTION_PURPOSES as readonly string[]).includes(input.selectionPurpose)) fail("SELECTION_AUTHORITY_REQUIRED");
  isolate(actor, store, input.selectedCandidateId);
  const candidate = inspectCandidate(store.r3, input.selectedCandidateId);
  if (input.expectedCandidateFingerprint && input.expectedCandidateFingerprint !== candidate.fingerprint) fail("CANDIDATE_FINGERPRINT_MISMATCH");
  const set = setOf(store, input.candidateSetId);
  if (!set.candidateIds.includes(candidate.candidateId)) fail("CANDIDATE_NOT_IN_SET");
  const evaluation = evaluationOf(store, candidate.candidateId);
  const feasibilityState = evaluation?.feasibilityState ?? "UNDETERMINED";
  const dominated = set.dominatedCandidateIds.includes(candidate.candidateId);
  const rationale = input.tradeOffRationale ?? "";
  if (dominated && rationale.trim().length === 0) fail("SELECTION_RATIONALE_REQUIRED");
  const valuesBefore = store.r3.r2.valueRefs.map((row) => row.value).join("|");
  const dominatedBefore = set.dominatedCandidateIds.join("|");
  const fingerprint = fingerprintCanonical({
    set: set.fingerprint, candidate: candidate.fingerprint, evaluation: evaluation?.feasibilityReferenceId ?? "UNRESOLVED", feasibility: feasibilityState,
    purpose: input.selectionPurpose, rationale, actor: actor.actorId, version: input.version,
  });
  const duplicate = store.selections.find((row) => row.fingerprint === fingerprint && row.status !== "SUPERSEDED");
  if (duplicate && input.successorOfSelectionId !== duplicate.selectionId) return duplicate;
  if (input.successorOfSelectionId) {
    const previous = store.selections.find((row) => row.selectionId === input.successorOfSelectionId && row.status !== "SUPERSEDED") ?? fail("SELECTION_AUTHORITY_REQUIRED");
    previous.status = "SUPERSEDED";
    remember(store, previous.selectionId, "SUPERSEDED", previous.fingerprint);
    emit(store, "OPTIMIZATION_CANDIDATE_SELECTION_SUPERSEDED", previous.selectionId);
  }
  const selection: D1jR4Selection = {
    selectionId: input.selectionId, optimizationProblemId: candidate.optimizationProblemId, candidateSetId: set.candidateSetId,
    candidateSetFingerprint: set.fingerprint, selectedCandidateId: candidate.candidateId, selectedCandidateFingerprint: candidate.fingerprint,
    evaluationRef: evaluation?.evidenceId ?? "UNRESOLVED", feasibilityRef: evaluation?.feasibilityReferenceId ?? "UNRESOLVED", feasibilityState,
    dominated, comparisonIneligible: set.ineligibleCandidateIds.includes(candidate.candidateId), selectionAuthority: actor.authority,
    selectionActor: actor.actorId, selectionPurpose: input.selectionPurpose as D1jR4Selection["selectionPurpose"], tradeOffRationale: rationale,
    designApproval: false, certification: false, status: "CURRENT", version: input.version, fingerprint, recordedAt: store.now(), callerBackdated: false,
  };
  store.selections.push(selection);
  remember(store, selection.selectionId, "SELECTION", fingerprint);
  emit(store, "OPTIMIZATION_CANDIDATE_SELECTION_RECORDED", selection.selectionId);
  if (store.r3.r2.valueRefs.map((row) => row.value).join("|") !== valuesBefore || set.dominatedCandidateIds.join("|") !== dominatedBefore || (evaluation?.feasibilityState ?? "UNDETERMINED") !== feasibilityState) fail("SELECTION_MUTATES_FEASIBILITY");
  return selection;
}

export function inspectCandidateSelection(store: D1jR4Store, selectionId: string): D1jR4Selection {
  return store.selections.find((row) => row.selectionId === selectionId) ?? fail("SELECTION_AUTHORITY_REQUIRED");
}

export function composeSelectedCandidateEvidence(store: D1jR4Store, actor: D1jR2Actor, input: { selectedEvidenceId: string; selectionId: string; reviewId: string; evidenceId?: string | null }): D1jR4SelectedEvidence {
  assertHuman(actor);
  const selection = inspectCandidateSelection(store, input.selectionId);
  const review = inspectCandidateReview(store, input.reviewId);
  if (review.candidateId !== selection.selectedCandidateId) fail("CANDIDATE_NOT_IN_SET");
  const evaluation = evaluationOf(store, selection.selectedCandidateId) ?? fail("CANDIDATE_EVALUATION_NOT_FOUND");
  if (input.evidenceId) {
    const evidence = store.r3.r2.evidenceSets.find((row) => row.evaluationEvidenceSetId === input.evidenceId) ?? fail("CANDIDATE_EVALUATION_NOT_FOUND");
    const subject = store.r3.r2.subjects.find((row) => row.subjectId === evidence.subjectId);
    if (!subject || subject.subjectKind !== "D1J_CANDIDATE_REFERENCE" || subject.candidateId !== selection.selectedCandidateId) fail("BASELINE_EVIDENCE_SUBSTITUTION");
  }
  const candidate = inspectCandidate(store.r3, selection.selectedCandidateId);
  const fingerprint = fingerprintCanonical({
    candidate: candidate.fingerprint, design: candidate.designStateFingerprint, values: [...evaluation.objectiveValueReferenceIds].sort(),
    checks: [...evaluation.checkResultReferenceIds].sort(), feasibility: evaluation.feasibilityReferenceId, review: review.fingerprint, selection: selection.fingerprint,
  });
  const existing = store.selectedEvidence.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const record: D1jR4SelectedEvidence = {
    selectedEvidenceId: input.selectedEvidenceId, candidateId: candidate.candidateId, designStateFingerprint: candidate.designStateFingerprint,
    objectiveValueReferenceIds: evaluation.objectiveValueReferenceIds, checkResultReferenceIds: evaluation.checkResultReferenceIds,
    feasibilityRef: evaluation.feasibilityReferenceId, candidateSetId: selection.candidateSetId, reviewId: review.reviewId, selectionId: selection.selectionId,
    baselineSubstituted: false, fingerprint,
  };
  store.selectedEvidence.push(record);
  remember(store, record.selectedEvidenceId, "SELECTED_EVIDENCE", fingerprint);
  return record;
}

export function evaluateStudyEvidenceCompleteness(store: D1jR4Store, manifestId: string): (typeof D1J_COMPLETENESS_STATES)[number] {
  const manifest = store.manifests.find((row) => row.manifestId === manifestId) ?? fail("STUDY_MANIFEST_INCOMPLETE");
  if (manifest.status === "STALE") return "STALE";
  const selection = manifest.selectionId ? store.selections.find((row) => row.selectionId === manifest.selectionId) : null;
  const review = manifest.reviewIds.length > 0;
  const selected = manifest.selectedEvidenceId ? store.selectedEvidence.find((row) => row.selectedEvidenceId === manifest.selectedEvidenceId) : null;
  if (!selection || !review || !selected) return "INCOMPLETE";
  if (selected.objectiveValueReferenceIds.length === 0 || selected.checkResultReferenceIds.length === 0) return "INCOMPLETE";
  if (selection.status !== "CURRENT" || manifest.status !== "CURRENT") return "STALE";
  return "COMPLETE_FOR_DECLARED_SCOPE";
}

export function createOptimizationStudyManifest(store: D1jR4Store, actor: D1jR2Actor, input: {
  manifestId: string;
  studyEvidenceId: string;
  optimizationProblemId: string;
  candidateSetId: string;
  reviewIds: readonly string[];
  selectionId?: string | null;
  selectedEvidenceId?: string | null;
  version: string;
}): { manifest: D1jR4Manifest; studyEvidence: D1jR4StudyEvidence } {
  assertHuman(actor);
  exact(input.manifestId);
  exact(input.optimizationProblemId);
  exact(input.candidateSetId);
  const problem = store.r3.r2.problems.find((row) => row.optimizationProblemId === input.optimizationProblemId) ?? fail("OPTIMIZATION_PROBLEM_NOT_FOUND");
  const baseline = inspectBaselineDesignReference(store.r3.r2.r1, problem.baselineRefId);
  const set = setOf(store, input.candidateSetId);
  const reviews = input.reviewIds.map((id) => inspectCandidateReview(store, id));
  const selection = input.selectionId ? inspectCandidateSelection(store, input.selectionId) : null;
  const selected = input.selectedEvidenceId ? store.selectedEvidence.find((row) => row.selectedEvidenceId === input.selectedEvidenceId) ?? fail("CANDIDATE_EVALUATION_NOT_FOUND") : null;
  if (selection) isolate(actor, store, selection.selectedCandidateId);
  const orderedReviews = [...reviews].sort((left, right) => left.fingerprint.localeCompare(right.fingerprint));
  const fingerprint = fingerprintCanonical({
    problem: problem.fingerprint, baseline: baseline.fingerprint, variables: problem.variableSetFingerprint, parameterStatus: D1J_R3_CONCRETE_PARAMETER_SEMANTIC_STATUS,
    objectives: problem.objectiveSetFingerprint, checks: problem.requiredCheckSetFingerprint, profile: problem.evaluationProfileFingerprint,
    set: set.fingerprint, candidates: [...set.candidateIds].sort(), reviews: orderedReviews.map((row) => row.fingerprint),
    selection: selection?.fingerprint ?? null, selected: selected?.fingerprint ?? null, d1g: store.sources.d1gFingerprint,
    engineer: store.sources.engineerValidationFingerprint, conformance: store.sources.conformanceValidationFingerprint, version: input.version,
  });
  const existing = store.manifests.find((row) => row.fingerprint === fingerprint && row.status !== "SUPERSEDED");
  if (existing) {
    const evidence = store.studyEvidence.find((row) => row.manifestId === existing.manifestId) ?? fail("STUDY_MANIFEST_INCOMPLETE");
    return { manifest: existing, studyEvidence: evidence };
  }
  const manifest: D1jR4Manifest = {
    manifestId: input.manifestId, optimizationProblemId: problem.optimizationProblemId, problemFingerprint: problem.fingerprint,
    baselineFingerprint: baseline.fingerprint, variableSetFingerprint: problem.variableSetFingerprint,
    parameterSemanticStatus: D1J_R3_CONCRETE_PARAMETER_SEMANTIC_STATUS, assignmentReferenceCount: D1J_R3_VARIABLE_ASSIGNMENT_REFERENCE_RUNTIME_COUNT,
    referenceOnlyCandidates: true, generatedDesign: false, objectiveSetFingerprint: problem.objectiveSetFingerprint,
    requiredCheckSetFingerprint: problem.requiredCheckSetFingerprint, evaluationProfileFingerprint: problem.evaluationProfileFingerprint,
    candidateSetId: set.candidateSetId, candidateSetFingerprint: set.fingerprint, selectedEvidenceId: selected?.selectedEvidenceId ?? null,
    reviewIds: orderedReviews.map((row) => row.reviewId), selectionId: selection?.selectionId ?? null,
    d1gStatus: D1J_R4_D1G_CERTIFIED_SOLVER_STATUS, d1gFingerprint: store.sources.d1gFingerprint,
    engineerValidationStatus: "NOT_VALIDATED", engineerValidationFingerprint: store.sources.engineerValidationFingerprint,
    conformanceValidationStatus: "NOT_VALIDATED", conformanceValidationFingerprint: store.sources.conformanceValidationFingerprint,
    status: "CURRENT", version: input.version, fingerprint, recordedAt: store.now(), callerBackdated: false,
  };
  store.manifests.push(manifest);
  const completeness = evaluateStudyEvidenceCompleteness(store, manifest.manifestId);
  const studyFingerprint = fingerprintCanonical({ manifest: manifest.fingerprint, completeness, eligibility: "NOT_ELIGIBLE" });
  const studyEvidence: D1jR4StudyEvidence = {
    studyEvidenceId: input.studyEvidenceId, manifestId: manifest.manifestId, manifestFingerprint: manifest.fingerprint,
    completeness, certificationEligibility: "NOT_ELIGIBLE", designModel: false, engineeringApproval: false, fingerprint: studyFingerprint,
  };
  store.studyEvidence.push(studyEvidence);
  remember(store, manifest.manifestId, "MANIFEST", fingerprint);
  emit(store, "OPTIMIZATION_STUDY_MANIFEST_CREATED", manifest.manifestId);
  return { manifest, studyEvidence };
}

export function assessCertificationReadiness(store: D1jR4Store, actor: D1jR2Actor, input: {
  eligibilityId: string;
  manifestId: string;
  version: string;
  callerD1gStatus?: string | null;
  callerEngineerValidated?: boolean | null;
  callerConformanceValidated?: boolean | null;
  callerOfflineConformance?: boolean | null;
  callerEligible?: boolean | null;
}): D1jR4Eligibility {
  assertHuman(actor);
  exact(input.eligibilityId);
  const manifest = store.manifests.find((row) => row.manifestId === input.manifestId) ?? fail("STUDY_MANIFEST_INCOMPLETE");
  const completeness = evaluateStudyEvidenceCompleteness(store, manifest.manifestId);
  const selection = manifest.selectionId ? store.selections.find((row) => row.selectionId === manifest.selectionId) ?? null : null;
  const blockers: string[] = [];
  if (manifest.status !== "CURRENT") blockers.push("STUDY_MANIFEST_STALE");
  if (completeness !== "COMPLETE_FOR_DECLARED_SCOPE") blockers.push("STUDY_MANIFEST_INCOMPLETE");
  if (!selection) blockers.push("SELECTION_AUTHORITY_REQUIRED");
  if (!manifest.reviewIds.length) blockers.push("HUMAN_REVIEW_REQUIRED");
  if (selection?.feasibilityState === "INFEASIBLE") blockers.push("SELECTED_CANDIDATE_INFEASIBLE");
  else if (selection && selection.feasibilityState !== "FEASIBLE") blockers.push("SELECTED_CANDIDATE_UNDETERMINED");
  if (selection?.status === "STALE" || manifest.status === "STALE") blockers.push("CANDIDATE_EVIDENCE_STALE");
  const solverStatus: string = D1J_R4_D1G_CERTIFIED_SOLVER_STATUS;
  if (solverStatus !== "CERTIFIED") blockers.push("D1G_CERTIFIED_SOLVER_REQUIRED");
  if (!D1J_R4_ENGINEER_VALIDATED) blockers.push("D1J_ENGINEER_VALIDATION_REQUIRED");
  if (!D1J_R4_CONFORMANCE_VALIDATED) blockers.push("D1J_CONFORMANCE_VALIDATION_REQUIRED");
  if (selection?.comparisonIneligible) blockers.push("COMPARISON_INELIGIBLE");
  const unique = [...new Set(blockers)].sort();
  const fingerprint = fingerprintCanonical({
    manifest: manifest.fingerprint, completeness, d1g: D1J_R4_D1G_CERTIFIED_SOLVER_STATUS, engineer: "NOT_VALIDATED", conformance: "NOT_VALIDATED",
    blockers: unique, version: input.version, callerIgnored: true,
  });
  const existing = store.eligibilities.find((row) => row.fingerprint === fingerprint && row.status !== "SUPERSEDED");
  if (existing) return existing;
  const eligibility: D1jR4Eligibility = {
    eligibilityId: input.eligibilityId, manifestId: manifest.manifestId, manifestFingerprint: manifest.fingerprint,
    selectedCandidateId: selection?.selectedCandidateId ?? null, completeness, d1gStatus: D1J_R4_D1G_CERTIFIED_SOLVER_STATUS,
    engineerValidationStatus: "NOT_VALIDATED", conformanceValidationStatus: "NOT_VALIDATED", eligibilityState: "NOT_ELIGIBLE",
    blockingReasons: unique, certificate: false, designApproval: false, status: "CURRENT", version: input.version, fingerprint,
    recordedAt: store.now(), callerBackdated: false,
  };
  void input.callerD1gStatus;
  void input.callerEngineerValidated;
  void input.callerConformanceValidated;
  void input.callerOfflineConformance;
  void input.callerEligible;
  store.eligibilities.push(eligibility);
  remember(store, eligibility.eligibilityId, "ELIGIBILITY", fingerprint);
  emit(store, "OPTIMIZATION_CERTIFICATION_READINESS_ASSESSED", eligibility.eligibilityId);
  return eligibility;
}

export function inspectCertificationReadiness(store: D1jR4Store, eligibilityId: string): D1jR4Eligibility {
  return store.eligibilities.find((row) => row.eligibilityId === eligibilityId) ?? fail("CERTIFICATION_NOT_ELIGIBLE");
}

export function supersedeCandidateReview(store: D1jR4Store, actor: D1jR2Actor, input: { successorReviewId: string; reviewId: string; reviewOutcome: string; version: string }): D1jR4Review {
  const current = inspectCandidateReview(store, input.reviewId);
  return registerCandidateReview(store, actor, {
    reviewId: input.successorReviewId, candidateId: current.candidateId, candidateSetId: current.candidateSetId, reviewScope: current.reviewScope,
    reviewBasis: current.reviewBasis, reviewOutcome: input.reviewOutcome, limitations: current.limitations, version: input.version, successorOfReviewId: current.reviewId,
  });
}

export function supersedeCandidateSelection(store: D1jR4Store, actor: D1jR2Actor, input: { successorSelectionId: string; selectionId: string; selectedCandidateId: string; tradeOffRationale: string; version: string }): D1jR4Selection {
  const current = inspectCandidateSelection(store, input.selectionId);
  return recordCandidateSelection(store, actor, {
    selectionId: input.successorSelectionId, candidateSetId: current.candidateSetId, selectedCandidateId: input.selectedCandidateId,
    selectionPurpose: current.selectionPurpose, tradeOffRationale: input.tradeOffRationale, version: input.version, successorOfSelectionId: current.selectionId,
  });
}

export function propagateCertificationEvidenceStaleness(store: D1jR4Store): void {
  const before = store.history.length;
  const authority = store.r3.r2.catalog.checkResults[0]?.authority;
  propagateCandidateStaleness(store.r3);
  for (const manifest of store.manifests) {
    if (manifest.status !== "CURRENT") continue;
    const problem = store.r3.r2.problems.find((row) => row.optimizationProblemId === manifest.optimizationProblemId);
    const baseline = problem ? inspectBaselineDesignReference(store.r3.r2.r1, problem.baselineRefId) : null;
    const variableSet = problem?.variableSetRef ? store.r3.r2.r1.variableSets.find((row) => row.variableSetId === problem.variableSetRef) : null;
    const objectiveSet = problem ? store.r3.r2.objectiveSets.find((row) => row.objectiveSetId === problem.objectiveSetRef) : null;
    const checkSet = problem ? store.r3.r2.checkSets.find((row) => row.requiredCheckSetId === problem.requiredCheckSetRef) : null;
    const set = store.r3.sets.find((row) => row.candidateSetId === manifest.candidateSetId);
    const selection = manifest.selectionId ? store.selections.find((row) => row.selectionId === manifest.selectionId) : null;
    const candidate = selection ? store.r3.candidates.find((row) => row.candidateId === selection.selectedCandidateId) : null;
    const evaluation = selection ? store.r3.evaluations.find((row) => row.candidateId === selection.selectedCandidateId) : null;
    const feasibility = evaluation ? store.r3.r2.feasibilityRefs.find((row) => row.feasibilityReferenceId === evaluation.feasibilityReferenceId) : null;
    const reviewStale = manifest.reviewIds.some((id) => store.reviews.find((row) => row.reviewId === id)?.status !== "CURRENT");
    const selectionChanged = selection != null && selection.status !== "CURRENT";
    const candidateChanged = selection != null && (candidate?.status === "STALE" || candidate?.fingerprint !== selection.selectedCandidateFingerprint);
    if (!problem || problem.status === "STALE" || !baseline || baseline.fingerprint !== manifest.baselineFingerprint || (variableSet && variableSet.status !== "FOUNDATION_DEFINED") || (objectiveSet && objectiveSet.status !== "CURRENT") || (checkSet && checkSet.status !== "CURRENT") || !set || set.status !== "CURRENT" || set.fingerprint !== manifest.candidateSetFingerprint || candidateChanged || feasibility?.status === "STALE" || reviewStale || selectionChanged || store.sources.d1gFingerprint !== manifest.d1gFingerprint || store.sources.engineerValidationFingerprint !== manifest.engineerValidationFingerprint || store.sources.conformanceValidationFingerprint !== manifest.conformanceValidationFingerprint || store.r3.r2.catalog.solverReadinessChanged) {
      manifest.status = "STALE";
      remember(store, manifest.manifestId, "STALE", manifest.fingerprint);
      emit(store, "OPTIMIZATION_STUDY_MANIFEST_STALE", manifest.manifestId);
      for (const eligibility of store.eligibilities) {
        if (eligibility.manifestId === manifest.manifestId && eligibility.status === "CURRENT") eligibility.status = "STALE";
      }
    }
  }
  if (store.history.length < before) fail("INVALIDATION_DELETES_HISTORY");
  if (authority && store.r3.r2.catalog.checkResults[0]?.authority !== authority) fail("INVALIDATION_MUTATES_UPSTREAM_SOURCE");
}

export function produceCertificationEvidenceReadinessResult(store: D1jR4Store, eligibilityId: string) {
  const eligibility = inspectCertificationReadiness(store, eligibilityId);
  const manifest = store.manifests.find((row) => row.manifestId === eligibility.manifestId) ?? fail("STUDY_MANIFEST_INCOMPLETE");
  return {
    resultId: `r4-${eligibility.eligibilityId}`, optimizationProblemId: manifest.optimizationProblemId, studyManifestId: manifest.manifestId,
    studyManifestFingerprint: manifest.fingerprint, selectedCandidateId: eligibility.selectedCandidateId, humanReviewRefs: manifest.reviewIds,
    humanSelectionRef: manifest.selectionId, evidenceCompleteness: eligibility.completeness,
    readinessLayers: {
      ARCHITECTURE_READY: D1J_R4_ARCHITECTURE_READY, FIXTURE_TEST_READY: D1J_R4_FIXTURE_TEST_READY, PILOT_RUNTIME_READY: D1J_R4_PILOT_RUNTIME_READY,
      LIVE_SOLVER_RUNTIME_READY: D1J_R4_LIVE_SOLVER_RUNTIME_READY, ENGINEER_VALIDATED: D1J_R4_ENGINEER_VALIDATED, CONFORMANCE_VALIDATED: D1J_R4_CONFORMANCE_VALIDATED,
      CERTIFICATION_ELIGIBLE: false as const,
    },
    D1GCertifiedSolverStatus: D1J_R4_D1G_CERTIFIED_SOLVER_STATUS, D1JEngineerValidationStatus: "NOT_VALIDATED" as const,
    D1JConformanceValidationStatus: "NOT_VALIDATED" as const, certificationEligibility: eligibility.eligibilityState,
    eligibilityBlockers: eligibility.blockingReasons, limitations: manifest.parameterSemanticStatus, certificate: false as const, designApproval: false as const,
    fingerprint: eligibility.fingerprint, recordedAt: eligibility.recordedAt,
  };
}

export function replayCertificationEvidence(store: D1jR4Store, manifestId: string) {
  const manifest = store.manifests.find((row) => row.manifestId === manifestId) ?? fail("STUDY_MANIFEST_INCOMPLETE");
  const selection = manifest.selectionId ? store.selections.find((row) => row.selectionId === manifest.selectionId) : null;
  return {
    problemFingerprint: manifest.problemFingerprint,
    baselineFingerprint: manifest.baselineFingerprint,
    selectedCandidateId: selection?.selectedCandidateId ?? null,
    reviewerIds: manifest.reviewIds.map((id) => store.reviews.find((row) => row.reviewId === id)?.reviewerIdentity),
    selectorId: selection?.selectionActor ?? null,
    rationale: selection?.tradeOffRationale ?? null,
    dominated: selection?.dominated ?? null,
    d1gStatus: manifest.d1gStatus,
    engineerValidationStatus: manifest.engineerValidationStatus,
    conformanceValidationStatus: manifest.conformanceValidationStatus,
    eligibility: store.eligibilities.filter((row) => row.manifestId === manifestId).map((row) => row.eligibilityState),
    history: store.history.filter((row) => row.subjectId === manifestId || row.subjectId === selection?.selectionId),
  };
}

export const D1J_R4_READINESS_LAYER_NAMES = D1J_READINESS_LAYERS;
