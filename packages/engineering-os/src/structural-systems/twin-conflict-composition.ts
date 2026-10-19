/**
 * EOS-D1I-R3 state-conflict and multi-source composition.
 * Comparability is explicit. A difference is not a confirmed conflict.
 * Review does not rewrite R1 references or R2 selections.
 */

import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { existingUnitPairCompatible, ratingSchemesHistoricallyComparable } from "./inspection-temporal";
import type { D1iR1Actor, D1iR1StateReference } from "./twin-reference-foundation";
import { inspectStateReference, inspectTwin } from "./twin-reference-foundation";
import { inspectTwinSnapshot, type D1iR2Store } from "./twin-temporal-governance";

export const D1I_R3_MATURITY_STATE = "STRUCTURAL_DIGITAL_TWIN_STATE_CONFLICT_MULTI_SOURCE_COMPOSITION_RUNTIME_IMPLEMENTED" as const;
export const D1I_R3_DIFFERENT_VALUE_EQUALS_ENGINEERING_CONFLICT = false as const;
export const D1I_R3_ENGINEERING_CONFLICT_EQUALS_RUNTIME_ERROR = false as const;
export const D1I_R3_CONFLICT_RESOLUTION_REWRITES_SOURCE = false as const;
export const D1I_R3_CONFLICT_RESOLUTION_EQUALS_UNIVERSAL_TRUTH = false as const;
export const D1I_R3_CONFLICT_DETECTION_REQUIRES_COMPARABILITY = true as const;
export const D1I_R3_UNKNOWN_COMPARABILITY_EQUALS_CONFLICT = false as const;
export const D1I_R3_INCOMPARABLE_STATES_EQUALS_CONFLICT = false as const;
export const D1I_R3_NUMERIC_INEQUALITY_EQUALS_CONFLICT = false as const;
export const D1I_R3_DEFAULT_NUMERIC_TOLERANCE_CREATED = false as const;
export const D1I_R3_PERCENT_DIFFERENCE_THRESHOLD_CREATED = false as const;
export const D1I_R3_RESOLUTION_MUTATES_SOURCE = false as const;
export const D1I_R3_RESOLUTION_AVERAGES_SOURCE_VALUES = false as const;
export const D1I_R3_RESOLUTION_AUTO_CHANGES_R2_CURRENT_SELECTION = false as const;
export const D1I_R3_CONFLICT_KNOWN_TIME_REQUIRED = true as const;
export const D1I_R3_FUTURE_CONFLICT_CONFIRMATION_RETROACTIVE = false as const;
export const D1I_R3_UNIVERSAL_COMPARABILITY_ASSUMED = false as const;
export const D1I_R3_GENERIC_COMPARATOR_CREATED = false as const;
export const D1I_R3_UNSUPPORTED_PAIR_AUTO_CONFLICT = false as const;
export const D1I_R3_TARGET_COMPATIBILITY_REQUIRED = true as const;
export const D1I_R3_TARGET_RELATIONSHIP_INFERRED_FROM_GEOMETRY = false as const;
export const D1I_R3_TEMPORAL_COMPATIBILITY_REQUIRED = true as const;
export const D1I_R3_KNOWLEDGE_CUTOFF_REQUIRED = true as const;
export const D1I_R3_QUANTITY_COMPATIBILITY_REQUIRED = true as const;
export const D1I_R3_EXISTING_UNIT_SYSTEM_REUSED = true as const;
export const D1I_R3_INCOMPATIBLE_DIMENSIONS_COMPARABLE = false as const;
export const D1I_R3_LOCATION_COMPATIBILITY_REQUIRED = true as const;
export const D1I_R3_AXIS_SIGN_COMPATIBILITY_REQUIRED = true as const;
export const D1I_R3_AXIS_MAPPING_INFERRED = false as const;
export const D1I_R3_MEASUREMENT_METHOD_COMPATIBILITY_REQUIRED = true as const;
export const D1I_R3_CROSS_SCHEME_CONDITION_COMPARISON_ALLOWED = false as const;
export const D1I_R3_RATING_SCHEME_FINGERPRINT_COMPATIBILITY_REQUIRED = true as const;
export const D1I_R3_ANALYSIS_CASE_COMBINATION_COMPATIBILITY_REQUIRED = true as const;
export const D1I_R3_ANALYSIS_LOCATION_COMPATIBILITY_REQUIRED = true as const;
export const D1I_R3_PREDICTED_MEASURED_DIFFERENCE_EQUALS_CONFLICT = false as const;
export const D1I_R3_PREDICTED_MEASURED_DIFFERENCE_EQUALS_MODEL_ERROR = false as const;
export const D1I_R3_PREDICTED_MEASURED_DIFFERENCE_EQUALS_DAMAGE = false as const;
export const D1I_R3_NEW_NUMERIC_DIFFERENCE_ENGINE_CREATED = false as const;
export const D1I_R3_DEFAULT_CONFLICT_TOLERANCE = "NONE" as const;
export const D1I_R3_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT = false as const;
export const D1I_R3_AUTOMATIC_ENGINEERING_CONFLICT_CONFIRMATION = false as const;
export const D1I_R3_AI_CONFLICT_CANDIDATE_ALLOWED = true as const;
export const D1I_R3_AI_CONFLICT_CAN_GOVERN = false as const;
export const D1I_R3_CONFLICT_CONFIRMATION_AUTHORITY_REQUIRED = true as const;
export const D1I_R3_DIFFERENCE_CAN_EXIST_WITHOUT_CONFLICT = true as const;
export const D1I_R3_COMPOSITION_COPIES_SOURCE_BODY = false as const;
export const D1I_R3_COMPOSITION_SYNTHESIZES_ENGINEERING_VALUE = false as const;
export const D1I_R3_COMPOSITION_AVERAGES_VALUES = false as const;
export const D1I_R3_COMPOSITION_AUTO_SELECTS_WINNING_SOURCE = false as const;
export const D1I_R3_MULTI_STATE_CLASS_COMPOSITION_SUPPORTED = true as const;
export const D1I_R3_MISSING_STATE_EQUALS_NORMAL = false as const;
export const D1I_R3_MISSING_STATE_EQUALS_HEALTHY = false as const;
export const D1I_R3_INCOMPARABLE_STATE_DROPPED_FROM_COMPOSITION = false as const;
export const D1I_R3_UNRESOLVED_COMPARABILITY_AUTO_RESOLVED = false as const;
export const D1I_R3_REVIEWED_AT_RUNTIME_ASSIGNED = true as const;
export const D1I_R3_CONFLICT_REVIEW_PROMOTES_SOURCE_VALIDATION = false as const;
export const D1I_R3_CONFLICT_REVIEW_EQUALS_ANALYSIS_MODEL_VALIDATION = false as const;
export const D1I_R3_DISPOSITION_SCOPE_REQUIRED = true as const;
export const D1I_R3_DISPOSITION_AUTO_CHANGES_CURRENT_SELECTION = false as const;
export const D1I_R3_CURRENT_STATE_CHANGE_REQUIRES_R2_GOVERNED_OPERATION = true as const;
export const D1I_R3_RESOLUTION_AUTO_CHANGES_D1H_CONDITION = false as const;
export const D1I_R3_RESOLUTION_AUTO_CHANGES_ANALYSIS_MODEL = false as const;
export const D1I_R3_RESOLUTION_AUTO_CHANGES_CAPACITY = false as const;
export const D1I_R3_RESOLUTION_AUTO_TRIGGERS_SOLVER = false as const;
export const D1I_R3_CONFLICT_HISTORY_AS_KNOWN_SUPPORTED = true as const;
export const D1I_R3_FUTURE_CONFLICT_DISPOSITION_RETROACTIVE = false as const;
export const D1I_R3_LATE_SOURCE_REWRITES_PRIOR_CONFLICT_HISTORY = false as const;
export const D1I_R3_CONFLICT_REWRITES_R2_SNAPSHOT = false as const;
export const D1I_R3_NEW_CONFLICT_MUTATES_EXISTING_SNAPSHOT = false as const;
export const D1I_R3_CONFLICT_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R3_REVIEW_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R3_COMPOSITION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R3_COMPOSITION_ORDER_INDEPENDENT = true as const;
export const D1I_R3_COMPATIBILITY_PROVENANCE_COMPLETE = true as const;
export const D1I_R3_CONFLICT_PROVENANCE_COMPLETE = true as const;
export const D1I_R3_REVIEW_PROVENANCE_COMPLETE = true as const;
export const D1I_R3_COMPOSITION_PROVENANCE_COMPLETE = true as const;
export const D1I_R3_CONFLICT_HISTORY_APPEND_ONLY = true as const;
export const D1I_R3_REVIEW_HISTORY_APPEND_ONLY = true as const;
export const D1I_R3_CONFLICT_MUTATED_IN_PLACE = false as const;
export const D1I_R3_SOURCE_STALENESS_PROPAGATES = true as const;
export const D1I_R3_SELECTION_CHANGE_PROPAGATES_COMPOSITION_STALE = true as const;
export const D1I_R3_NEW_SNAPSHOT_REBINDS_CONFLICT = false as const;
export const D1I_R3_COMPARATOR_VERSION_CHANGE_PROPAGATES_STALE = true as const;
export const D1I_R3_RATING_SCHEME_CHANGE_PROPAGATES_STALE = true as const;
export const D1I_R3_INVALIDATION_MUTATES_R1_SOURCE_REFERENCE = false as const;
export const D1I_R3_INVALIDATION_MUTATES_UPSTREAM_SOURCE = false as const;
export const D1I_R3_COMPLETE_COMPOSITION_EQUALS_NO_CONFLICT = false as const;
export const D1I_R3_NO_CONFLICT_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1I_R3_NO_CONFLICT_EQUALS_HEALTHY = false as const;
export const D1I_R3_CONFLICT_EQUALS_UNSAFE = false as const;
export const D1I_R3_CONFLICT_EQUALS_DAMAGED = false as const;
export const D1I_R3_NO_CONFLICT_EQUALS_SAFE = false as const;
export const D1I_R3_UNIVERSAL_SOURCE_PRIORITY_CREATED = false as const;
export const D1I_R3_UNIVERSAL_STATE_CLASS_PRIORITY_CREATED = false as const;
export const D1I_R3_HIGHEST_AUTHORITY_AUTO_WINS_CONFLICT = false as const;
export const D1I_R3_MORE_VALIDATIONS_AUTO_WINS_CONFLICT = false as const;
export const D1I_R3_HIGHER_AI_CONFIDENCE_AUTO_WINS_CONFLICT = false as const;
export const D1I_R3_CONFLICT_VALUE_AVERAGING_ENGINE_COUNT = 0 as const;
export const D1I_R3_SOURCE_MAJORITY_VOTE_ENGINE_COUNT = 0 as const;
export const D1I_R3_LATEST_SOURCE_AUTO_WINS_CONFLICT = false as const;
export const D1I_R3_CURRENT_SELECTION_SUPPRESSES_CONFLICTING_EVIDENCE = false as const;
export const D1I_R3_CONFLICTING_EVIDENCE_AUTO_REPLACES_CURRENT_SELECTION = false as const;
export const D1I_R3_ARBITRARY_COMPARISON_EXPRESSION_ALLOWED = false as const;
export const D1I_R3_RUNTIME_DIAGNOSTIC_EQUALS_CONFIRMED_CONFLICT = false as const;
export const D1I_R3_RUNTIME_DIAGNOSTIC_EQUALS_STRUCTURAL_FINDING = false as const;
export const D1I_R3_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1I_R3_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1I_R3_AI_GOVERNING_AUTHORITY_CREATED = false as const;
export const D1I_R3_AI_RUNTIME_COUNT = 0 as const;
export const D1I_R3_TELEMETRY_RUNTIME_COUNT = 0 as const;
export const D1I_R3_SHM_RUNTIME_COUNT = 0 as const;
export const D1I_R3_MODEL_CALIBRATION_RUNTIME_COUNT = 0 as const;
export const D1I_R3_ANALYSIS_MODEL_MODIFICATION_COUNT = 0 as const;
export const D1I_R3_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1I_R3_CONFLICT_AUTO_TRIGGERS_SOLVER = false as const;
export const D1I_R3_STRUCTURAL_ADEQUACY_RUNTIME_COUNT = 0 as const;
export const D1I_R3_CAPACITY_ASSESSMENT_RUNTIME_COUNT = 0 as const;
export const D1I_R3_CONFLICT_AUTO_CHANGES_CAPACITY = false as const;
export const D1I_R3_PREDICTION_RUNTIME_COUNT = 0 as const;
export const D1I_R3_DETERIORATION_RUNTIME_COUNT = 0 as const;
export const D1I_R3_CAUSAL_DIAGNOSIS_RUNTIME_COUNT = 0 as const;
export const D1I_R3_REPAIR_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D1I_R3_REPAIR_DESIGN_RUNTIME_COUNT = 0 as const;
export const D1I_R3_PERSON_TWIN_IMPLEMENTED = false as const;
export const D1I_R3_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1I_R3_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1I_R3_CROSS_PROJECT_COMPOSITION_ALLOWED = false as const;
export const D1I_R3_CROSS_PROJECT_CONFLICT_ALLOWED = false as const;
export const D1I_R3_CROSS_TENANT_COMPOSITION_ALLOWED = false as const;
export const D1I_R3_CROSS_TENANT_CONFLICT_ALLOWED = false as const;
export const D1I_R3_COMPATIBILITY_RUNTIME_COUNT = 1 as const;
export const D1I_R3_STATE_CONFLICT_RUNTIME_COUNT = 1 as const;
export const D1I_R3_CONFLICT_REVIEW_RUNTIME_COUNT = 1 as const;
export const D1I_R3_MULTI_SOURCE_COMPOSITION_RUNTIME_COUNT = 1 as const;
export const D1I_R3_AUTOMATIC_ENGINEERING_TRUTH_SELECTION_COUNT = 0 as const;
export const D1I_R3_VALUE_AVERAGING_ENGINE_COUNT = 0 as const;
export const D1I_R3_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1I_R3_DIGITAL_THREAD_REUSED = true as const;
export const PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const PARALLEL_TWIN_RUNTIME_CREATED = false as const;
export const PARALLEL_STATE_REFERENCE_RUNTIME_CREATED = false as const;
export const PARALLEL_TEMPORAL_RUNTIME_CREATED = false as const;
export const D1I_R3_CONFLICT_CONFIRMATION_BYPASSES_AUTHORIZATION = false as const;
export const D1I_R3_DISPOSITION_BYPASSES_AUTHORIZATION = false as const;
export const D1I_R3_TEMPORAL_HISTORY_TAMPERING_ALLOWED = false as const;
export const D1I_R3_ARBITRARY_COMPARATOR_ALLOWED = false as const;
export const D1I_R3_CROSS_PROJECT_OPERATION_ALLOWED = false as const;
export const D1I_R3_CROSS_TENANT_OPERATION_ALLOWED = false as const;
export const D1I_R4_HANDOFF_READY = true as const;
export const D1I_R4_CANONICAL_PHASE_FROM_REPOSITORY = "EOS-D1I-R4-EXTERNAL-TELEMETRY-MONITORING-REFERENCE-INTERFACE" as const;
export const D1I_R4_CANONICAL_SCOPE_FROM_REPOSITORY = "A reference interface for external telemetry and monitoring, without sensor analytics, without SHM diagnosis, and without automatic engineering inference." as const;
export const D1I_R4_REQUIRED_R3_CONTRACTS = "twinIdentity, stateReferenceIdentity, stateClass, sourceDomain, effectiveTime, knownAtTime, currentSelection, snapshot, temporalView, compatibilityAssessment, stateConflict, conflictReview, conflictDisposition, multiSourceComposition, provenance, fingerprints, history, staleness." as const;

export const D1I_R3_COMPARATOR_VERSION = "r3-comparator-1" as const;
export const D1I_R3_COMPATIBILITY_STATES = ["COMPARABLE", "PARTIALLY_COMPARABLE", "NOT_COMPARABLE", "COMPARABILITY_UNRESOLVED", "STALE", "INVALID"] as const;
export const D1I_R3_CONFLICT_STATUSES = ["CANDIDATE", "REVIEW_REQUIRED", "HUMAN_CONFIRMED_CONFLICT", "HUMAN_CONFIRMED_NOT_CONFLICT", "DISPOSITION_RECORDED", "SUPERSEDED", "STALE", "INVALID"] as const;
export const D1I_R3_CONFLICT_TYPES = ["ANALYSIS_VS_MEASUREMENT", "ANALYSIS_VS_OBSERVATION", "MEASUREMENT_VS_MEASUREMENT", "CONDITION_VS_CONDITION", "INTERPRETATION_VS_INTERPRETATION", "SOURCE_AUTHORITY_CONFLICT", "TEMPORAL_CONFLICT", "SOURCE_VERSION_CONFLICT", "CURRENT_SELECTION_INCONSISTENCY", "OTHER_GOVERNED_CONFLICT"] as const;
export const D1I_R3_REVIEW_OUTCOMES = ["CONFIRM_CONFLICT", "CONFIRM_NO_CONFLICT", "REQUIRES_MORE_EVIDENCE", "DEFER", "ACKNOWLEDGE_PARALLEL_STATES", "REFER_TO_CURRENT_STATE_SELECTION_WORKFLOW"] as const;
export const D1I_R3_COMPOSITION_COMPLETENESS_STATES = ["COMPLETE_FOR_DECLARED_COMPOSITION_SCOPE", "PARTIAL", "INCOMPLETE", "STALE", "INVALID", "UNDETERMINED"] as const;
export const D1I_R3_EVENTS = ["TWIN_STATE_COMPATIBILITY_ASSESSED", "TWIN_STATE_CONFLICT_CANDIDATE_RECORDED", "TWIN_STATE_CONFLICT_CONFIRMED", "TWIN_STATE_NO_CONFLICT_CONFIRMED", "TWIN_STATE_CONFLICT_REVIEWED", "TWIN_STATE_CONFLICT_DISPOSITION_RECORDED", "TWIN_STATE_CONFLICT_SUPERSEDED", "TWIN_MULTI_SOURCE_COMPOSITION_CREATED"] as const;

export const D1I_R3_COMPARATOR_REGISTRY = "Allowlisted pairs only: measured with measured, analytical with measured, analytical with observed, condition with condition, interpretation with interpretation, and observed with observed. Each pair names the comparator version and the required basis dimensions. No generic object walk is registered." as const;
export const D1I_R3_COMPATIBILITY_CONTRACT = "An assessment names its id, twin, target, exact reference ids, purpose, state-class pair, source-domain pair, temporal context, declared basis, dimensions, status, limitations, comparator version, known-at time, provenance, version, and fingerprint." as const;
export const D1I_R3_CONFLICT_TOLERANCE_POLICY = "R3 has no default conflict tolerance and no percent threshold. A future governed profile may define acceptance criteria. No such profile is applied here." as const;
export const D1I_R3_AUTOMATIC_CANDIDATE_POLICY = "An assessment never creates a conflict. A candidate may be recorded only after an explicit comparable assessment, by a human or as a non-governing AI suggestion. Numeric inequality is not machine-safe contradiction semantics." as const;
export const D1I_R3_STATE_CONFLICT_CONTRACT = "A conflict names conflictId, twin, target, exact reference ids and fingerprints, compatibility assessment, optional view or snapshot, type, creation status, basis, effective context, known-at time, limitations, provenance, version, fingerprint, and optional predecessor." as const;
export const D1I_R3_CONFLICT_TYPE_TAXONOMY = "ANALYSIS_VS_MEASUREMENT, ANALYSIS_VS_OBSERVATION, MEASUREMENT_VS_MEASUREMENT, CONDITION_VS_CONDITION, INTERPRETATION_VS_INTERPRETATION, SOURCE_AUTHORITY_CONFLICT, TEMPORAL_CONFLICT, SOURCE_VERSION_CONFLICT, CURRENT_SELECTION_INCONSISTENCY, OTHER_GOVERNED_CONFLICT." as const;
export const D1I_R3_MULTI_SOURCE_COMPOSITION_CONTRACT = "A composition names compositionId, twin, declared scope, temporal context, exact reference ids, selection ids, snapshot or view refs, assessment ids, conflict ids, unresolved pairings, completeness, diagnostics, limitations, provenance, and fingerprint. It stores no source body and no synthesized value." as const;
export const D1I_R3_CONFLICT_REVIEW_CONTRACT = "A review names reviewId, conflictId, reviewer, authority, scope, basis, outcome, trusted reviewedAt, limitations, supporting refs, provenance, version, and fingerprint." as const;
export const D1I_R3_REVIEW_OUTCOME_TAXONOMY = "CONFIRM_CONFLICT, CONFIRM_NO_CONFLICT, REQUIRES_MORE_EVIDENCE, DEFER, ACKNOWLEDGE_PARALLEL_STATES, REFER_TO_CURRENT_STATE_SELECTION_WORKFLOW." as const;
export const D1I_R3_CONFLICT_DISPOSITION_CONTRACT = "Disposition is a separate record from review. It names dispositionId, conflictId, reviewId, purpose scope, outcome, trusted recorded time, limitations, provenance, and fingerprint. It does not rewrite the source or the R2 selection." as const;
export const D1I_R3_CONFLICT_BITEMPORAL_CONTRACT = "A conflict keeps each source effective time and known-at time, the candidate recorded time, and, on a successor only, the confirmation time. Disposition time is recorded on the disposition." as const;
export const D1I_R3_CONFLICT_SUPERSESSION_CONTRACT = "Confirmation, correction, and supersession append a successor. The predecessor record and its creation status stay in history." as const;
export const D1I_R3_AUTHORITY_WITHDRAWAL_POLICY = "Withdrawn review authority appends a stale history event on that review and disposition. The records remain. Sources and selections are not rewritten." as const;
export const D1I_R3_PROVENANCE_GRAPH_IMPLEMENTED = "Structural target to twin to R1 references to R2 view, snapshot, or selection to R3 compatibility assessment to conflict candidate or confirmed successor to review and disposition to multi-source composition." as const;
export const D1I_R3_COMPOSITION_COMPLETENESS_LIST = "COMPLETE_FOR_DECLARED_COMPOSITION_SCOPE, PARTIAL, INCOMPLETE, STALE, INVALID, UNDETERMINED. Completeness is not absence of conflict and not adequacy." as const;
export const D1I_R3_RUNTIME_API = "assessStateCompatibility, inspectCompatibilityAssessment, createConflictCandidate, confirmConflict, confirmNoConflict, recordConflictReview, recordConflictDisposition, inspectConflict, composeMultiSourceState, inspectComposition, evaluateConflictStatus, evaluateCompositionStatus, conflictStatusAsKnownAt, produceTwinConflictCompositionResult." as const;
export const D1I_R3_ERROR_TAXONOMY = "TWIN_NOT_FOUND, REFERENCE_NOT_FOUND, REFERENCE_STALE, REFERENCE_INVALID, TARGET_MISMATCH, TEMPORAL_CONTEXT_MISMATCH, STATE_PAIR_UNSUPPORTED, QUANTITY_INCOMPATIBLE, UNIT_INCOMPATIBLE, LOCATION_INCOMPATIBLE, AXIS_SIGN_UNRESOLVED, MEASUREMENT_BASIS_UNRESOLVED, RATING_SCHEME_MISMATCH, ANALYSIS_CASE_MISMATCH, COMPARABILITY_UNRESOLVED, CONFLICT_NOT_FOUND, REVIEW_AUTHORITY_REQUIRED, CROSS_PROJECT_OPERATION, CROSS_TENANT_OPERATION, UNAUTHORIZED, TEMPORAL_HISTORY_TAMPERING_REJECTED, ARBITRARY_COMPARISON_EXPRESSION, DISPOSITION_SCOPE_REQUIRED." as const;
export const D1I_R3_RUNTIME_RESULT_CONTRACT = "A result names resultId, twinId, assessment ids, conflict ids, review ids, disposition ids, composition ids, scope, completeness, diagnostics, warnings, provenance, and fingerprint." as const;

export type D1iR3CompatibilityStatus = (typeof D1I_R3_COMPATIBILITY_STATES)[number];
export type D1iR3ConflictStatus = (typeof D1I_R3_CONFLICT_STATUSES)[number];
export type D1iR3ConflictType = (typeof D1I_R3_CONFLICT_TYPES)[number];
export type D1iR3ReviewOutcome = (typeof D1I_R3_REVIEW_OUTCOMES)[number];
export type D1iR3Completeness = (typeof D1I_R3_COMPOSITION_COMPLETENESS_STATES)[number];

export type D1iR3BasisSide = {
  stateReferenceId: string;
  quantity?: string;
  unit?: string;
  location?: string;
  axis?: string;
  sign?: string;
  method?: string;
  ratingSchemeId?: string;
  schemeVersion?: string;
  schemeFingerprint?: string;
  loadCaseId?: string;
  combinationId?: string;
  analysisLocation?: string;
  descriptiveValue?: string;
};

export type D1iR3Assessment = {
  recordKind: "COMPATIBILITY_ASSESSMENT";
  compatibilityAssessmentId: string;
  twinId: string;
  structuralTargetId: string | null;
  stateReferenceIds: readonly string[];
  stateReferenceFingerprints: readonly string[];
  comparisonPurpose: string;
  stateClassPair: readonly string[];
  sourceDomainPair: readonly string[];
  temporalContext: { effectiveTime: string | null; knownAtCutoff: string };
  comparisonBasis: readonly D1iR3BasisSide[];
  compatibilityDimensions: readonly string[];
  compatibilityStatus: D1iR3CompatibilityStatus;
  differenceObserved: boolean;
  conflictCreated: false;
  limitations: string;
  comparatorVersion: string;
  knownAtTime: string;
  version: string;
  fingerprint: string;
  provenanceFingerprint: string;
};

export type D1iR3Conflict = {
  recordKind: "STATE_CONFLICT";
  conflictId: string;
  twinId: string;
  structuralTargetId: string;
  stateReferenceIds: readonly string[];
  stateReferenceFingerprints: readonly string[];
  compatibilityAssessmentId: string;
  temporalViewId: string | null;
  snapshotId: string | null;
  conflictType: D1iR3ConflictType;
  status: D1iR3ConflictStatus;
  candidateBasis: string;
  effectiveContext: { effectiveTime: string | null; knownAtCutoff: string };
  sourceContexts: readonly { stateReferenceId: string; effectiveTime: string; knownAtTime: string }[];
  knownAtTime: string;
  confirmedAt: string | null;
  limitations: string;
  version: string;
  fingerprint: string;
  provenanceFingerprint: string;
  supersedesConflictId: string | null;
  engineeringTruth: false;
  runtimeError: false;
};

export type D1iR3Review = {
  recordKind: "CONFLICT_REVIEW";
  reviewId: string;
  conflictId: string;
  reviewerId: string;
  authority: string;
  reviewScope: string;
  reviewBasis: string;
  reviewOutcome: D1iR3ReviewOutcome;
  reviewedAt: string;
  limitations: string;
  supportingRefs: readonly string[];
  version: string;
  fingerprint: string;
  provenanceFingerprint: string;
  promotesSourceValidation: false;
  analysisModelValidation: false;
};

export type D1iR3Disposition = {
  recordKind: "CONFLICT_DISPOSITION";
  dispositionId: string;
  conflictId: string;
  reviewId: string;
  purpose: string;
  outcome: D1iR3ReviewOutcome;
  recordedAt: string;
  limitations: string;
  version: string;
  fingerprint: string;
  provenanceFingerprint: string;
  changesCurrentSelection: false;
  universalTruth: false;
};

export type D1iR3Composition = {
  recordKind: "MULTI_SOURCE_COMPOSITION";
  compositionId: string;
  twinId: string;
  declaredScope: { targetIds: readonly string[]; stateClasses: readonly string[]; purpose: string };
  temporalContext: { knownAtCutoff: string };
  stateReferenceIds: readonly string[];
  selectionIds: readonly string[];
  snapshotId: string | null;
  viewId: string | null;
  compatibilityAssessmentIds: readonly string[];
  conflictIds: readonly string[];
  unresolvedPairings: readonly string[];
  compositionCompleteness: D1iR3Completeness;
  diagnostics: readonly string[];
  limitations: string;
  version: string;
  fingerprint: string;
  provenanceFingerprint: string;
  copiesSourceBody: false;
  synthesizedValue: null;
  averagedValue: null;
  winningSourceId: null;
  healthy: false;
  adequate: false;
  safe: false;
  normal: false;
};

type HistoryEvent = { historyId: string; subjectKind: "ASSESSMENT" | "CONFLICT" | "REVIEW" | "DISPOSITION" | "COMPOSITION"; subjectId: string; action: string; recordedAt: string };

export type D1iR3Store = D1iR2Store & {
  assessments: D1iR3Assessment[];
  conflicts: D1iR3Conflict[];
  reviews: D1iR3Review[];
  dispositions: D1iR3Disposition[];
  compositions: D1iR3Composition[];
  conflictHistory: HistoryEvent[];
  retiredComparatorVersions: string[];
  retiredSchemeFingerprints: string[];
  withdrawnConflictAuthorities: string[];
  conflictEvents: Array<{ eventId: string; eventType: (typeof D1I_R3_EVENTS)[number]; subjectId: string; recordedAt: string; engineeringApproval: false }>;
};

const PAIR_RULES: Record<string, { type: D1iR3ConflictType; dimensions: readonly string[] }> = {
  "MEASURED_STATE|MEASURED_STATE": { type: "MEASUREMENT_VS_MEASUREMENT", dimensions: ["quantity", "unit", "location", "method"] },
  "ANALYTICAL_STATE|MEASURED_STATE": { type: "ANALYSIS_VS_MEASUREMENT", dimensions: ["quantity", "unit", "location", "axis", "sign", "analysisCase", "analysisLocation"] },
  "ANALYTICAL_STATE|OBSERVED_STATE": { type: "ANALYSIS_VS_OBSERVATION", dimensions: ["location", "analysisCase", "analysisLocation"] },
  "CONDITION_STATE|CONDITION_STATE": { type: "CONDITION_VS_CONDITION", dimensions: ["ratingScheme"] },
  "ENGINEERING_INTERPRETED_STATE|ENGINEERING_INTERPRETED_STATE": { type: "INTERPRETATION_VS_INTERPRETATION", dimensions: ["location"] },
  "OBSERVED_STATE|OBSERVED_STATE": { type: "OTHER_GOVERNED_CONFLICT", dimensions: ["location"] },
};

function fail(code: string): never {
  throw new Error(code);
}

function pairKey(left: string, right: string): string {
  return [left, right].sort().join("|");
}

function assertActor(actor: D1iR1Actor, twin: { tenantId: string; workspaceId: string; projectId: string }, allowAi: boolean): void {
  if (!actor.actorId || !actor.authority) fail("UNAUTHORIZED");
  const ai = actor.authority.toUpperCase().startsWith("AI") || actor.authority.toUpperCase().includes("LLM");
  if (ai && !allowAi) fail("UNAUTHORIZED");
  if (actor.tenantId !== twin.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== twin.workspaceId || actor.projectId !== twin.projectId) fail("CROSS_PROJECT_OPERATION");
}

function rejectTamper(input: object): void {
  const record = input as { reviewedAt?: unknown; confirmedAt?: unknown; history?: unknown; expression?: unknown; comparatorModule?: unknown; knownAtTime?: unknown };
  if (record.reviewedAt !== undefined || record.confirmedAt !== undefined || record.history !== undefined || record.knownAtTime !== undefined) fail("TEMPORAL_HISTORY_TAMPERING_REJECTED");
  if (record.expression !== undefined || record.comparatorModule !== undefined) fail("ARBITRARY_COMPARISON_EXPRESSION");
}

function remember(store: D1iR3Store, subjectKind: HistoryEvent["subjectKind"], subjectId: string, action: string): void {
  store.conflictHistory.push({ historyId: `r3h-${store.conflictHistory.length + 1}`, subjectKind, subjectId, action, recordedAt: store.now() });
}

function emit(store: D1iR3Store, eventType: (typeof D1I_R3_EVENTS)[number], subjectId: string): void {
  store.conflictEvents.push({ eventId: `r3e-${store.conflictEvents.length + 1}`, eventType, subjectId, recordedAt: store.now(), engineeringApproval: false });
}

export function createD1iR3Store(store: D1iR2Store): D1iR3Store {
  const next = store as D1iR3Store;
  next.assessments = [];
  next.conflicts = [];
  next.reviews = [];
  next.dispositions = [];
  next.compositions = [];
  next.conflictHistory = [];
  next.retiredComparatorVersions = [];
  next.retiredSchemeFingerprints = [];
  next.withdrawnConflictAuthorities = [];
  next.conflictEvents = [];
  return next;
}

function visibleReference(store: D1iR3Store, referenceId: string, cutoff: string): D1iR1StateReference {
  const reference = store.references.find((row) => row.stateReferenceId === referenceId);
  if (!reference || reference.knownAtTime > cutoff) fail("REFERENCE_NOT_FOUND");
  if (reference.referenceStatus === "INVALID_REFERENCE") fail("REFERENCE_INVALID");
  return reference;
}

function basisFor(sides: readonly D1iR3BasisSide[], referenceId: string): D1iR3BasisSide {
  return sides.find((row) => row.stateReferenceId === referenceId) ?? fail("COMPARABILITY_UNRESOLVED");
}

function text(value: string | undefined): string | null {
  return value && value.trim() ? value : null;
}

export function assessStateCompatibility(store: D1iR3Store, actor: D1iR1Actor, input: { twinId: string; stateReferenceIds: readonly string[]; comparisonPurpose: string; knownAtCutoff?: string; basis: readonly D1iR3BasisSide[]; partialDimensions?: readonly string[]; version: string; expression?: unknown }): D1iR3Assessment {
  rejectTamper(input);
  const twin = inspectTwin(store, input.twinId);
  assertActor(actor, twin, false);
  if (input.stateReferenceIds.length !== 2) fail("STATE_PAIR_UNSUPPORTED");
  const cutoff = input.knownAtCutoff ?? store.now();
  const references = input.stateReferenceIds.map((id) => visibleReference(store, id, cutoff));
  if (references.some((row) => row.twinId !== input.twinId)) fail("TARGET_MISMATCH");
  const classes = references.map((row) => row.stateClass).sort();
  const rule = PAIR_RULES[pairKey(classes[0]!, classes[1]!)];
  const knownAtTime = store.now();
  let status: D1iR3CompatibilityStatus = "COMPARABLE";
  let limitation = "explicit basis";
  const sameTarget = references[0]!.structuralTargetRef.targetId === references[1]!.structuralTargetRef.targetId;
  const system = references.find((row) => row.structuralTargetRef.targetKind === "STRUCTURAL_SYSTEM");
  const component = references.find((row) => row.structuralTargetRef.targetKind !== "STRUCTURAL_SYSTEM");
  const explicitSystemComponent = !sameTarget && system && component && component.structuralTargetRef.structuralSystemId === system.structuralTargetRef.targetId;
  const structuralTargetId = sameTarget ? references[0]!.structuralTargetRef.targetId : explicitSystemComponent ? component!.structuralTargetRef.targetId : null;
  if (!rule) {
    status = "COMPARABILITY_UNRESOLVED";
    limitation = "STATE_PAIR_UNSUPPORTED";
  } else if (!structuralTargetId) {
    status = "NOT_COMPARABLE";
    limitation = "TARGET_MISMATCH";
  } else if (references[0]!.effectiveTime !== references[1]!.effectiveTime) {
    status = "NOT_COMPARABLE";
    limitation = "TEMPORAL_CONTEXT_MISMATCH";
  } else if (references.some((row) => row.referenceStatus === "STALE_REFERENCE")) {
    status = "STALE";
    limitation = "REFERENCE_STALE";
  } else {
    const left = basisFor(input.basis, references[0]!.stateReferenceId);
    const right = basisFor(input.basis, references[1]!.stateReferenceId);
    const partial = new Set(input.partialDimensions ?? []);
    const missing = (field: string, present: boolean) => {
      if (present) return;
      status = partial.has(field) ? "PARTIALLY_COMPARABLE" : "COMPARABILITY_UNRESOLVED";
      limitation = field;
    };
    if (rule.dimensions.includes("quantity")) {
      const lq = text(left.quantity);
      const rq = text(right.quantity);
      if (!lq || !rq) missing("quantity", false);
      else if (lq !== rq) {
        status = "NOT_COMPARABLE";
        limitation = "QUANTITY_INCOMPATIBLE";
      }
    }
    if (status === "COMPARABLE" && rule.dimensions.includes("unit")) {
      const lu = text(left.unit);
      const ru = text(right.unit);
      const quantity = text(left.quantity);
      if (!lu || !ru || !quantity) missing("unit", false);
      else if (!existingUnitPairCompatible(quantity!, lu, ru)) {
        status = "NOT_COMPARABLE";
        limitation = "UNIT_INCOMPATIBLE";
      }
    }
    if (status === "COMPARABLE" && rule.dimensions.includes("location")) {
      const ll = text(left.location);
      const rl = text(right.location);
      if (!ll || !rl) missing("location", false);
      else if (ll !== rl) {
        status = "NOT_COMPARABLE";
        limitation = "LOCATION_INCOMPATIBLE";
      }
    }
    if (status === "COMPARABLE" && (rule.dimensions.includes("axis") || rule.dimensions.includes("sign"))) {
      if (!text(left.axis) || !text(right.axis) || !text(left.sign) || !text(right.sign)) {
        status = "COMPARABILITY_UNRESOLVED";
        limitation = "AXIS_SIGN_UNRESOLVED";
      } else if (left.axis !== right.axis || left.sign !== right.sign) {
        status = "NOT_COMPARABLE";
        limitation = "AXIS_SIGN_UNRESOLVED";
      }
    }
    if (status === "COMPARABLE" && rule.dimensions.includes("method")) {
      if (!text(left.method) || !text(right.method)) {
        status = "COMPARABILITY_UNRESOLVED";
        limitation = "MEASUREMENT_BASIS_UNRESOLVED";
      } else if (left.method !== right.method) {
        status = "NOT_COMPARABLE";
        limitation = "MEASUREMENT_BASIS_UNRESOLVED";
      }
    }
    if (status === "COMPARABLE" && rule.dimensions.includes("ratingScheme")) {
      const schemeLeft = { ratingSchemeId: left.ratingSchemeId ?? "", schemeVersion: left.schemeVersion ?? "", fingerprint: left.schemeFingerprint ?? "" };
      const schemeRight = { ratingSchemeId: right.ratingSchemeId ?? "", schemeVersion: right.schemeVersion ?? "", fingerprint: right.schemeFingerprint ?? "" };
      if (!schemeLeft.ratingSchemeId || !schemeRight.ratingSchemeId) {
        status = "COMPARABILITY_UNRESOLVED";
        limitation = "RATING_SCHEME_MISMATCH";
      } else if (!ratingSchemesHistoricallyComparable(schemeLeft, schemeRight)) {
        status = "NOT_COMPARABLE";
        limitation = "RATING_SCHEME_MISMATCH";
      }
    }
    if (status === "COMPARABLE" && rule.dimensions.includes("analysisCase")) {
      if (!text(left.loadCaseId) || !text(right.loadCaseId) || !text(left.combinationId) || !text(right.combinationId)) {
        status = "COMPARABILITY_UNRESOLVED";
        limitation = "ANALYSIS_CASE_MISMATCH";
      } else if (left.loadCaseId !== right.loadCaseId || left.combinationId !== right.combinationId) {
        status = "NOT_COMPARABLE";
        limitation = "ANALYSIS_CASE_MISMATCH";
      }
    }
    if (status === "COMPARABLE" && rule.dimensions.includes("analysisLocation")) {
      if (!text(left.analysisLocation) || !text(right.analysisLocation)) missing("analysisLocation", false);
      else if (left.analysisLocation !== right.analysisLocation) {
        status = "NOT_COMPARABLE";
        limitation = "LOCATION_INCOMPATIBLE";
      }
    }
  }
  const differenceObserved = status === "COMPARABLE" && text(input.basis[0]?.descriptiveValue) !== null && text(input.basis[1]?.descriptiveValue) !== null && input.basis[0]?.descriptiveValue !== input.basis[1]?.descriptiveValue;
  const draft = {
    recordKind: "COMPATIBILITY_ASSESSMENT" as const,
    twinId: input.twinId,
    structuralTargetId,
    stateReferenceIds: Object.freeze([...references].sort((a, b) => a.stateReferenceId.localeCompare(b.stateReferenceId)).map((row) => row.stateReferenceId)),
    stateReferenceFingerprints: Object.freeze([...references].sort((a, b) => a.stateReferenceId.localeCompare(b.stateReferenceId)).map((row) => row.fingerprint)),
    comparisonPurpose: input.comparisonPurpose,
    stateClassPair: Object.freeze(classes),
    sourceDomainPair: Object.freeze(references.map((row) => row.sourceDomain).sort()),
    temporalContext: { effectiveTime: references[0]!.effectiveTime === references[1]!.effectiveTime ? references[0]!.effectiveTime : null, knownAtCutoff: cutoff },
    comparisonBasis: input.basis,
    compatibilityDimensions: Object.freeze(rule?.dimensions ?? []),
    compatibilityStatus: status,
    differenceObserved,
    conflictCreated: false as const,
    limitations: limitation,
    comparatorVersion: D1I_R3_COMPARATOR_VERSION,
    knownAtTime,
    version: input.version,
  };
  const fingerprint = fingerprintCanonical(draft);
  const existing = store.assessments.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const assessment: D1iR3Assessment = { ...draft, compatibilityAssessmentId: `assess-${store.assessments.length + 1}`, fingerprint, provenanceFingerprint: fingerprint };
  store.assessments.push(assessment);
  remember(store, "ASSESSMENT", assessment.compatibilityAssessmentId, status);
  emit(store, "TWIN_STATE_COMPATIBILITY_ASSESSED", assessment.compatibilityAssessmentId);
  return assessment;
}

export function inspectCompatibilityAssessment(store: D1iR3Store, id: string): D1iR3Assessment {
  return store.assessments.find((row) => row.compatibilityAssessmentId === id) ?? fail("COMPARABILITY_UNRESOLVED");
}

function conflictTypeFor(assessment: D1iR3Assessment): D1iR3ConflictType {
  return PAIR_RULES[pairKey(assessment.stateClassPair[0]!, assessment.stateClassPair[1]!)]?.type ?? "OTHER_GOVERNED_CONFLICT";
}

export function createConflictCandidate(store: D1iR3Store, actor: D1iR1Actor, input: { compatibilityAssessmentId: string; candidateBasis: string; snapshotId?: string; temporalViewId?: string; version: string; conflictType?: D1iR3ConflictType }): D1iR3Conflict {
  rejectTamper(input);
  const assessment = inspectCompatibilityAssessment(store, input.compatibilityAssessmentId);
  const twin = inspectTwin(store, assessment.twinId);
  const ai = actor.authority.toUpperCase().startsWith("AI") || actor.authority.toUpperCase().includes("LLM");
  assertActor(actor, twin, true);
  if (assessment.compatibilityStatus !== "COMPARABLE") fail("COMPARABILITY_UNRESOLVED");
  if (!assessment.structuralTargetId) fail("TARGET_MISMATCH");
  const status: D1iR3ConflictStatus = ai ? "CANDIDATE" : "CANDIDATE";
  const references = assessment.stateReferenceIds.map((id) => inspectStateReference(store, id));
  const draft = {
    recordKind: "STATE_CONFLICT" as const,
    twinId: assessment.twinId,
    structuralTargetId: assessment.structuralTargetId,
    stateReferenceIds: assessment.stateReferenceIds,
    stateReferenceFingerprints: assessment.stateReferenceFingerprints,
    compatibilityAssessmentId: assessment.compatibilityAssessmentId,
    temporalViewId: input.temporalViewId ?? null,
    snapshotId: input.snapshotId ?? null,
    conflictType: input.conflictType ?? conflictTypeFor(assessment),
    status,
    candidateBasis: input.candidateBasis,
    effectiveContext: assessment.temporalContext,
    sourceContexts: Object.freeze(references.map((row) => ({ stateReferenceId: row.stateReferenceId, effectiveTime: row.effectiveTime, knownAtTime: row.knownAtTime }))),
    knownAtTime: store.now(),
    confirmedAt: null,
    limitations: ai ? "AI suggestion is not confirmation" : "candidate is not confirmation",
    version: input.version,
    supersedesConflictId: null,
    engineeringTruth: false as const,
    runtimeError: false as const,
  };
  const fingerprint = fingerprintCanonical(draft);
  const existing = store.conflicts.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const conflict: D1iR3Conflict = { ...draft, conflictId: `conflict-${store.conflicts.length + 1}`, fingerprint, provenanceFingerprint: fingerprint };
  store.conflicts.push(conflict);
  remember(store, "CONFLICT", conflict.conflictId, "CANDIDATE");
  emit(store, "TWIN_STATE_CONFLICT_CANDIDATE_RECORDED", conflict.conflictId);
  return conflict;
}

function successor(store: D1iR3Store, prior: D1iR3Conflict, status: D1iR3ConflictStatus, version: string): D1iR3Conflict {
  const draft = { ...prior, status, knownAtTime: store.now(), confirmedAt: store.now(), supersedesConflictId: prior.conflictId, version, limitations: status };
  const fingerprint = fingerprintCanonical({ ...draft, conflictId: undefined, fingerprint: undefined, provenanceFingerprint: undefined });
  const next: D1iR3Conflict = { ...draft, conflictId: `conflict-${store.conflicts.length + 1}`, fingerprint, provenanceFingerprint: fingerprint };
  store.conflicts.push(next);
  remember(store, "CONFLICT", prior.conflictId, "SUPERSEDED");
  remember(store, "CONFLICT", next.conflictId, status);
  emit(store, "TWIN_STATE_CONFLICT_SUPERSEDED", prior.conflictId);
  return next;
}

export function confirmConflict(store: D1iR3Store, actor: D1iR1Actor, input: { conflictId: string; reviewBasis: string; reviewScope: string; limitations: string; version: string }): { conflict: D1iR3Conflict; review: D1iR3Review } {
  rejectTamper(input);
  const prior = inspectConflict(store, input.conflictId);
  const twin = inspectTwin(store, prior.twinId);
  assertActor(actor, twin, false);
  if (prior.status !== "CANDIDATE" && prior.status !== "REVIEW_REQUIRED") fail("REVIEW_AUTHORITY_REQUIRED");
  const conflict = successor(store, prior, "HUMAN_CONFIRMED_CONFLICT", input.version);
  const review = recordConflictReview(store, actor, { conflictId: conflict.conflictId, reviewScope: input.reviewScope, reviewBasis: input.reviewBasis, reviewOutcome: "CONFIRM_CONFLICT", limitations: input.limitations, supportingRefs: [prior.conflictId], version: input.version });
  emit(store, "TWIN_STATE_CONFLICT_CONFIRMED", conflict.conflictId);
  return { conflict, review };
}

export function confirmNoConflict(store: D1iR3Store, actor: D1iR1Actor, input: { conflictId: string; reviewBasis: string; reviewScope: string; limitations: string; version: string }): { conflict: D1iR3Conflict; review: D1iR3Review } {
  rejectTamper(input);
  const prior = inspectConflict(store, input.conflictId);
  const twin = inspectTwin(store, prior.twinId);
  assertActor(actor, twin, false);
  const conflict = successor(store, prior, "HUMAN_CONFIRMED_NOT_CONFLICT", input.version);
  const review = recordConflictReview(store, actor, { conflictId: conflict.conflictId, reviewScope: input.reviewScope, reviewBasis: input.reviewBasis, reviewOutcome: "CONFIRM_NO_CONFLICT", limitations: input.limitations, supportingRefs: [prior.conflictId], version: input.version });
  emit(store, "TWIN_STATE_NO_CONFLICT_CONFIRMED", conflict.conflictId);
  return { conflict, review };
}

export function recordConflictReview(store: D1iR3Store, actor: D1iR1Actor, input: { conflictId: string; reviewScope: string; reviewBasis: string; reviewOutcome: D1iR3ReviewOutcome; limitations: string; supportingRefs: readonly string[]; version: string }): D1iR3Review {
  rejectTamper(input);
  const conflict = inspectConflict(store, input.conflictId);
  const twin = inspectTwin(store, conflict.twinId);
  assertActor(actor, twin, false);
  const reviewedAt = store.now();
  const draft = {
    recordKind: "CONFLICT_REVIEW" as const,
    conflictId: conflict.conflictId,
    reviewerId: actor.actorId,
    authority: actor.authority,
    reviewScope: input.reviewScope,
    reviewBasis: input.reviewBasis,
    reviewOutcome: input.reviewOutcome,
    reviewedAt,
    limitations: input.limitations,
    supportingRefs: Object.freeze([...input.supportingRefs]),
    version: input.version,
    promotesSourceValidation: false as const,
    analysisModelValidation: false as const,
  };
  const fingerprint = fingerprintCanonical(draft);
  const review: D1iR3Review = { ...draft, reviewId: `review-${store.reviews.length + 1}`, fingerprint, provenanceFingerprint: fingerprint };
  store.reviews.push(review);
  remember(store, "REVIEW", review.reviewId, input.reviewOutcome);
  emit(store, "TWIN_STATE_CONFLICT_REVIEWED", review.reviewId);
  return review;
}

export function recordConflictDisposition(store: D1iR3Store, actor: D1iR1Actor, input: { conflictId: string; reviewId: string; purpose: string; outcome: D1iR3ReviewOutcome; limitations: string; version: string }): D1iR3Disposition {
  rejectTamper(input);
  if (!input.purpose.trim()) fail("DISPOSITION_SCOPE_REQUIRED");
  const conflict = inspectConflict(store, input.conflictId);
  const twin = inspectTwin(store, conflict.twinId);
  assertActor(actor, twin, false);
  const review = store.reviews.find((row) => row.reviewId === input.reviewId) ?? fail("CONFLICT_NOT_FOUND");
  const selectionsBefore = JSON.stringify(store.selections);
  const draft = {
    recordKind: "CONFLICT_DISPOSITION" as const,
    conflictId: conflict.conflictId,
    reviewId: review.reviewId,
    purpose: input.purpose,
    outcome: input.outcome,
    recordedAt: store.now(),
    limitations: input.limitations,
    version: input.version,
    changesCurrentSelection: false as const,
    universalTruth: false as const,
  };
  const fingerprint = fingerprintCanonical(draft);
  const disposition: D1iR3Disposition = { ...draft, dispositionId: `disposition-${store.dispositions.length + 1}`, fingerprint, provenanceFingerprint: fingerprint };
  store.dispositions.push(disposition);
  remember(store, "DISPOSITION", disposition.dispositionId, input.outcome);
  emit(store, "TWIN_STATE_CONFLICT_DISPOSITION_RECORDED", disposition.dispositionId);
  if (JSON.stringify(store.selections) !== selectionsBefore) fail("R2_SELECTION_MUTATED");
  return disposition;
}

export function inspectConflict(store: D1iR3Store, conflictId: string): D1iR3Conflict {
  return store.conflicts.find((row) => row.conflictId === conflictId) ?? fail("CONFLICT_NOT_FOUND");
}

export function conflictStatusAsKnownAt(store: D1iR3Store, conflictId: string, knownAt: string): D1iR3ConflictStatus | null {
  const conflict = store.conflicts.find((row) => row.conflictId === conflictId);
  if (!conflict || conflict.knownAtTime > knownAt) return null;
  let status = conflict.status;
  for (const event of store.conflictHistory) {
    if (event.subjectKind !== "CONFLICT" || event.subjectId !== conflictId || event.recordedAt > knownAt) continue;
    if (event.action === "SUPERSEDED") status = "SUPERSEDED";
    else if (event.action === "STALE" || event.action === "INVALID" || event.action === "CANDIDATE" || event.action === "HUMAN_CONFIRMED_CONFLICT" || event.action === "HUMAN_CONFIRMED_NOT_CONFLICT") status = event.action;
  }
  return status;
}

export function conflictsAsKnownAt(store: D1iR3Store, knownAt: string): D1iR3Conflict[] {
  return store.conflicts.filter((row) => row.knownAtTime <= knownAt);
}

export function composeMultiSourceState(store: D1iR3Store, actor: D1iR1Actor, input: { twinId: string; declaredScope: { targetIds: readonly string[]; stateClasses: readonly string[]; purpose: string }; stateReferenceIds: readonly string[]; selectionIds?: readonly string[]; snapshotId?: string; viewId?: string; compatibilityAssessmentIds?: readonly string[]; conflictIds?: readonly string[]; knownAtCutoff?: string; limitations: string; version: string }): D1iR3Composition {
  rejectTamper(input);
  const twin = inspectTwin(store, input.twinId);
  assertActor(actor, twin, false);
  const cutoff = input.knownAtCutoff ?? store.now();
  const references = input.stateReferenceIds.map((id) => visibleReference(store, id, cutoff));
  const unresolved: string[] = [];
  const assessmentIds: string[] = [...(input.compatibilityAssessmentIds ?? [])];
  for (let index = 0; index < references.length; index += 1) {
    for (let other = index + 1; other < references.length; other += 1) {
      const left = references[index]!;
      const right = references[other]!;
      const rule = PAIR_RULES[pairKey(left.stateClass, right.stateClass)];
      if (!rule || left.structuralTargetRef.targetId !== right.structuralTargetRef.targetId || left.effectiveTime !== right.effectiveTime) {
        const [first, second] = [left.stateReferenceId, right.stateReferenceId].sort();
        unresolved.push(`${first}|${second}`);
      }
    }
  }
  const present = references.map((row) => row.stateClass as string);
  const found = input.declaredScope.stateClasses.filter((stateClass) => present.includes(stateClass));
  const completeness: D1iR3Completeness = input.declaredScope.stateClasses.length === 0 ? "UNDETERMINED" : found.length === 0 ? "INCOMPLETE" : found.length < input.declaredScope.stateClasses.length ? "PARTIAL" : "COMPLETE_FOR_DECLARED_COMPOSITION_SCOPE";
  const sorted = [...references].sort((a, b) => a.stateReferenceId.localeCompare(b.stateReferenceId));
  const draft = {
    recordKind: "MULTI_SOURCE_COMPOSITION" as const,
    twinId: input.twinId,
    declaredScope: input.declaredScope,
    temporalContext: { knownAtCutoff: cutoff },
    stateReferenceIds: Object.freeze(sorted.map((row) => row.stateReferenceId)),
    selectionIds: Object.freeze([...(input.selectionIds ?? [])].sort()),
    snapshotId: input.snapshotId ?? null,
    viewId: input.viewId ?? null,
    compatibilityAssessmentIds: Object.freeze([...assessmentIds].sort()),
    conflictIds: Object.freeze([...(input.conflictIds ?? [])].sort()),
    unresolvedPairings: Object.freeze([...unresolved].sort()),
    compositionCompleteness: completeness,
    diagnostics: Object.freeze(unresolved.length > 0 ? ["COMPARABILITY_UNRESOLVED"] : []),
    limitations: input.limitations,
    version: input.version,
    copiesSourceBody: false as const,
    synthesizedValue: null,
    averagedValue: null,
    winningSourceId: null,
    healthy: false as const,
    adequate: false as const,
    safe: false as const,
    normal: false as const,
  };
  const fingerprint = fingerprintCanonical(draft);
  const existing = store.compositions.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const composition: D1iR3Composition = { ...draft, compositionId: `composition-${store.compositions.length + 1}`, fingerprint, provenanceFingerprint: fingerprint };
  store.compositions.push(composition);
  remember(store, "COMPOSITION", composition.compositionId, "RECORDED");
  emit(store, "TWIN_MULTI_SOURCE_COMPOSITION_CREATED", composition.compositionId);
  if (input.snapshotId) {
    const snapshot = inspectTwinSnapshot(store, input.snapshotId);
    if (snapshot.stateReferenceIds.join("|") !== inspectTwinSnapshot(store, input.snapshotId).stateReferenceIds.join("|")) fail("SNAPSHOT_MUTATED");
  }
  return composition;
}

export function inspectComposition(store: D1iR3Store, compositionId: string): D1iR3Composition {
  return store.compositions.find((row) => row.compositionId === compositionId) ?? fail("CONFLICT_NOT_FOUND");
}

export function evaluateConflictStatus(store: D1iR3Store, conflictId: string): D1iR3ConflictStatus {
  const conflict = inspectConflict(store, conflictId);
  const before = conflict.stateReferenceIds.join("|");
  let next: D1iR3ConflictStatus = conflict.status;
  for (const referenceId of conflict.stateReferenceIds) {
    const reference = inspectStateReference(store, referenceId);
    if (reference.referenceStatus === "INVALID_REFERENCE") next = "INVALID";
    else if (reference.referenceStatus === "STALE_REFERENCE" || reference.referenceStatus === "SUPERSEDED_REFERENCE") next = "STALE";
  }
  const assessment = inspectCompatibilityAssessment(store, conflict.compatibilityAssessmentId);
  if (store.retiredComparatorVersions.includes(assessment.comparatorVersion)) next = "STALE";
  const schemeFingerprint = assessment.comparisonBasis.map((row) => row.schemeFingerprint).find((value) => value);
  if (schemeFingerprint && store.retiredSchemeFingerprints.includes(schemeFingerprint)) next = "STALE";
  if (next !== conflict.status && !store.conflictHistory.some((event) => event.subjectId === conflictId && event.action === next)) {
    remember(store, "CONFLICT", conflictId, next);
  }
  if (conflict.stateReferenceIds.join("|") !== before) fail("R1_REFERENCE_MUTATED");
  return conflictStatusAsKnownAt(store, conflictId, store.now()) ?? conflict.status;
}

export function evaluateCompositionStatus(store: D1iR3Store, compositionId: string): D1iR3Completeness {
  const composition = inspectComposition(store, compositionId);
  const ids = composition.stateReferenceIds.join("|");
  const staleSelection = composition.selectionIds.some((selectionId) => {
    const selection = store.selections.find((row) => row.selectionId === selectionId);
    return !selection || selection.status !== "ACTIVE";
  });
  const staleReference = composition.stateReferenceIds.some((referenceId) => inspectStateReference(store, referenceId).referenceStatus === "STALE_REFERENCE");
  if ((staleSelection || staleReference) && !store.conflictHistory.some((event) => event.subjectId === compositionId && event.action === "STALE")) {
    remember(store, "COMPOSITION", compositionId, "STALE");
  }
  if (composition.stateReferenceIds.join("|") !== ids) fail("COMPOSITION_MUTATED");
  return staleSelection || staleReference ? "STALE" : composition.compositionCompleteness;
}

export function retireComparatorVersion(store: D1iR3Store, version: string): void {
  store.retiredComparatorVersions.push(version);
  for (const assessment of store.assessments) {
    if (assessment.comparatorVersion === version) remember(store, "ASSESSMENT", assessment.compatibilityAssessmentId, "STALE");
  }
  for (const conflict of store.conflicts) evaluateConflictStatus(store, conflict.conflictId);
}

export function retireRatingSchemeFingerprint(store: D1iR3Store, fingerprint: string): void {
  store.retiredSchemeFingerprints.push(fingerprint);
  for (const conflict of store.conflicts) evaluateConflictStatus(store, conflict.conflictId);
}

export function withdrawConflictAuthority(store: D1iR3Store, actorId: string): void {
  store.withdrawnConflictAuthorities.push(actorId);
  for (const review of store.reviews) {
    if (review.reviewerId === actorId) remember(store, "REVIEW", review.reviewId, "STALE");
  }
  for (const disposition of store.dispositions) {
    const review = store.reviews.find((row) => row.reviewId === disposition.reviewId);
    if (review?.reviewerId === actorId) remember(store, "DISPOSITION", disposition.dispositionId, "STALE");
  }
}

export function produceTwinConflictCompositionResult(store: D1iR3Store, twinId: string): { resultId: string; twinId: string; compatibilityAssessmentIds: string[]; conflictIds: string[]; reviewIds: string[]; dispositionIds: string[]; compositionIds: string[]; completeness: D1iR3Completeness; runtimeDiagnostics: string[]; blockingRuntimeDiagnostics: string[]; warnings: string[]; fingerprint: string; engineeringApproval: false; structuralAdequacy: false } {
  const compatibilityAssessmentIds = store.assessments.filter((row) => row.twinId === twinId).map((row) => row.compatibilityAssessmentId);
  const conflictIds = store.conflicts.filter((row) => row.twinId === twinId).map((row) => row.conflictId);
  const reviewIds = store.reviews.filter((row) => conflictIds.includes(row.conflictId)).map((row) => row.reviewId);
  const dispositionIds = store.dispositions.filter((row) => conflictIds.includes(row.conflictId)).map((row) => row.dispositionId);
  const compositionIds = store.compositions.filter((row) => row.twinId === twinId).map((row) => row.compositionId);
  return {
    resultId: `r3-${twinId}`,
    twinId,
    compatibilityAssessmentIds,
    conflictIds,
    reviewIds,
    dispositionIds,
    compositionIds,
    completeness: compositionIds.length === 0 ? "INCOMPLETE" : "COMPLETE_FOR_DECLARED_COMPOSITION_SCOPE",
    runtimeDiagnostics: [],
    blockingRuntimeDiagnostics: [],
    warnings: [],
    fingerprint: fingerprintCanonical({ twinId, compatibilityAssessmentIds, conflictIds, reviewIds, compositionIds }),
    engineeringApproval: false,
    structuralAdequacy: false,
  };
}
