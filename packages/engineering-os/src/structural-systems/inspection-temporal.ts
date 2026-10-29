/**
 * EOS-D1H-R4 temporal association, comparison, and analysis-result linkage.
 * Records reference R1, R2, R3, and D1F/D1G identities. They do not predict deterioration or diagnose cause.
 */

import type { D1hProvenanceRef } from "@rtb/types";
import { D1F_ANALYSIS_RESULT_AUTHORITY_STATES, D1F_RESULT_CATEGORIES, D1F_R2_ANALYSIS_RUN_STATUS_STATES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { toDistributedNpm, toEPa, toForceN, toLengthM, toMomentNm } from "../structural-demand/units";
import { currentD1hR1Effective, type D1hR1AnalysisResultRef, type D1hR1Store } from "./inspection-evidence";
import type { D1hR2Store } from "./inspection-finding";
import type { D1hR3Store } from "./inspection-condition";

export const D1H_R4_MATURITY_STATE = "STRUCTURAL_CONDITION_TEMPORAL_ASSOCIATION_ANALYSIS_LINKAGE_RUNTIME_IMPLEMENTED" as const;
export const D1H_R4_FINDING_ASSOCIATION_RUNTIME_COUNT = 1 as const;
export const D1H_R4_CONDITION_CONTINUITY_RUNTIME_COUNT = 1 as const;
export const D1H_R4_MEASUREMENT_COMPARISON_RUNTIME_COUNT = 1 as const;
export const D1H_R4_CHANGE_EVIDENCE_RUNTIME_COUNT = 1 as const;
export const D1H_R4_ANALYSIS_LINK_RUNTIME_COUNT = 1 as const;
export const D1H_R4_DETERIORATION_PREDICTION_RUNTIME_COUNT = 0 as const;
export const D1H_R4_DETERIORATION_RATE_ENGINE_COUNT = 0 as const;
export const D1H_R4_CAUSAL_DIAGNOSIS_RUNTIME_COUNT = 0 as const;
export const D1H_R4_CAUSAL_DIAGNOSIS_ENGINE_COUNT = 0 as const;
export const D1H_R4_REGRESSION_ENGINE_COUNT = 0 as const;
export const D1H_R4_TREND_MODEL_COUNT = 0 as const;
export const D1H_R4_AI_ASSOCIATION_ENGINE_COUNT = 0 as const;
export const D1H_R4_AI_CAUSAL_DIAGNOSIS_ENGINE_COUNT = 0 as const;
export const D1H_R4_CAPACITY_ASSESSMENT_RUNTIME_COUNT = 0 as const;
export const D1H_R4_DIGITAL_TWIN_RUNTIME_COUNT = 0 as const;
export const D1H_R4_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const CROSS_INSPECTION_ASSOCIATION_EQUALS_SAME_PHYSICAL_DEFECT = false as const;
export const OBSERVED_CHANGE_EQUALS_DETERIORATION_RATE = false as const;
export const MEASURED_CHANGE_EQUALS_CAUSAL_DIAGNOSIS = false as const;
export const ANALYSIS_CORRELATION_EQUALS_CAUSATION = false as const;
export const GEOMETRIC_PROXIMITY_EQUALS_SAME_FINDING = false as const;
export const AI_SIMILARITY_EQUALS_SAME_FINDING = false as const;
export const IMAGE_SIMILARITY_EQUALS_SAME_FINDING = false as const;
export const SAME_TARGET_EQUALS_SAME_FINDING = false as const;
export const SAME_LOCATION_EQUALS_SAME_FINDING = false as const;
export const SAME_QUANTITY_EQUALS_COMPARABLE = false as const;
export const SAME_UNIT_EQUALS_COMPARABLE = false as const;
export const SAME_TARGET_EQUALS_COMPARABLE = false as const;
export const D1H_R4_DISTINCT_TIME_SEMANTICS_PRESERVED = true as const;
export const D1H_R4_DYNAMIC_LATEST_ANALYSIS_REFERENCE_ALLOWED = false as const;
export const D1H_0_ARCHITECTURE_REUSED = true as const;
export const D1H_R1_CONTEXT_REUSED = true as const;
export const D1H_R1_COVERAGE_REUSED = true as const;
export const D1H_R1_EVIDENCE_REUSED = true as const;
export const D1H_R2_FINDING_REUSED = true as const;
export const D1H_R2_MEASUREMENT_REUSED = true as const;
export const D1H_R2_VALIDATION_REUSED = true as const;
export const D1H_R3_INTERPRETATION_REUSED = true as const;
export const D1H_R3_RATING_REUSED = true as const;
export const D1H_R3_CONDITION_STATE_REUSED = true as const;
export const PARALLEL_INSPECTION_DOMAIN_CREATED = false as const;
export const PARALLEL_FINDING_DOMAIN_CREATED = false as const;
export const PARALLEL_CONDITION_DOMAIN_CREATED = false as const;
export const D1H_R4_STRUCTURAL_TARGET_IDENTITY_REUSED = true as const;
export const PARALLEL_STRUCTURAL_ASSET_IDENTITY_CREATED = false as const;
export const D1H_R4_D1F_ANALYSIS_IDENTITY_REUSED = true as const;
export const D1H_R4_D1G_PROVIDER_PROVENANCE_REUSED = true as const;
export const PARALLEL_ANALYSIS_RESULT_DOMAIN_CREATED = false as const;
export const D1H_R4_AI_ASSOCIATION_CANDIDATE_ALLOWED = true as const;
export const D1H_R4_AI_ASSOCIATION_CAN_GOVERN = false as const;
export const D1H_R4_AI_ASSOCIATION_AUTO_CONFIRMED = false as const;
export const D1H_R4_ASSOCIATION_CONFIRMATION_AUTHORITY_REQUIRED = true as const;
export const D1H_R4_SPLIT_LINEAGE_SUPPORTED = true as const;
export const D1H_R4_MERGED_LINEAGE_SUPPORTED = true as const;
export const D1H_R4_ASSOCIATION_MERGES_FINDING_RECORDS = false as const;
export const D1H_R4_ASSOCIATION_DELETES_PRIOR_FINDINGS = false as const;
export const D1H_R4_STALE_TARGET_AUTO_REBOUND = false as const;
export const D1H_R4_CROSS_PROJECT_ASSOCIATION_ALLOWED = false as const;
export const D1H_R4_CROSS_TENANT_ASSOCIATION_ALLOWED = false as const;
export const D1H_R4_ASSOCIATION_FINGERPRINT_IMPLEMENTED = true as const;
export const NEW_ASSOCIATION_STATE_OVERWRITES_PRIOR_ASSOCIATION = false as const;
export const SAME_RATING_EQUALS_UNCHANGED_CONDITION = false as const;
export const DIFFERENT_RATING_EQUALS_PHYSICAL_DETERIORATION = false as const;
export const D1H_R4_CROSS_SCHEME_RATING_COMPARISON_ALLOWED = false as const;
export const D1H_R4_SCHEME_VERSION_COMPARABILITY_POLICY = "Rating values may be placed side by side only when both condition states use the same rating scheme id, the same scheme version, and the same scheme content fingerprint captured at assessment time. A scheme version change or a content fingerprint change does not make the value codes comparable. Different schemes are not compared, translated, averaged, or ordered against each other." as const;
export const TEMPORAL_RATING_COMPARABILITY_REQUIRES_SCHEME_FINGERPRINT_MATCH = true as const;
export const D1H_R5_SAME_SCHEME_ID_VERSION_DIFFERENT_FINGERPRINT_COMPARABLE = false as const;
export const D1H_R4_REAUTHORS_R3_CONDITION_HISTORY = false as const;
export const D1H_R4_TEMPORAL_ORDER_INFERRED_FROM_RECORD_ORDER = false as const;
export const D1H_R4_LATE_ENTRY_REWRITES_HISTORY = false as const;
export const D1H_R4_TIMEZONE_INFERRED_FROM_PROJECT_LOCATION = false as const;
export const D1H_R4_QUANTITY_COMPATIBILITY_REQUIRED = true as const;
export const D1H_R4_EXISTING_UNIT_SYSTEM_REUSED = true as const;
export const D1H_R4_INCOMPATIBLE_DIMENSIONS_COMPARABLE = false as const;
export const D1H_R4_LOCATION_COMPATIBILITY_REQUIRED = true as const;
export const D1H_R4_MEASUREMENT_METHOD_COMPATIBILITY_REQUIRED = true as const;
export const D1H_R4_UNKNOWN_MEASUREMENT_BASIS_AUTO_COMPATIBLE = false as const;
export const D1H_R4_COMPARISON_AUTO_PROMOTES_UNVALIDATED_MEASUREMENT = false as const;
export const D1H_R4_NUMERIC_DIFFERENCE_POLICY = "An exact difference is stored only when the comparison status is COMPARABLE. Both values are normalized with the existing unit converters for force, moment, distributed force, stress, length, or deflection, or they already share one canonical unit. The difference is descriptive arithmetic. It is not a rate, a forecast, or a deterioration conclusion." as const;
export const D1H_R4_TEMPORAL_EXTRAPOLATION_IMPLEMENTED = false as const;
export const D1H_R4_FUTURE_CONDITION_PREDICTION_IMPLEMENTED = false as const;
export const D1H_R4_NUMERIC_CHANGE_EQUALS_DETERIORATION = false as const;
export const D1H_R4_RATING_CHANGE_EQUALS_DETERIORATION = false as const;
export const D1H_R4_IMPROVED_CONDITION_EQUALS_REPAIR_EFFECTIVE = false as const;
export const D1H_R4_ANALYSIS_RESULT_IDENTITY_REUSED = true as const;
export const PARALLEL_ANALYSIS_RESULT_RECORD_CREATED = false as const;
export const D1H_R4_ANALYSIS_RESULT_AUTHORITY_STATE_PRESERVED = true as const;
export const D1H_R4_ANALYSIS_LINK_AUTO_PROMOTES_RESULT_AUTHORITY = false as const;
export const D1H_R4_FAILED_ANALYSIS_CAN_GOVERN_CONDITION = false as const;
export const D1H_R4_NONCONVERGED_ANALYSIS_CAN_GOVERN_CONDITION = false as const;
export const D1H_R4_ANALYSIS_LINK_EQUALS_MODEL_VALIDATION = false as const;
export const D1H_R4_ANALYSIS_TEMPORAL_ALIGNMENT_CONTRACT = "The link stores the analysis run timestamp and the inspection timestamp as separate fields, together with the structural-state reference on each side. Different references remain a visible temporal mismatch. The analysis is not described as contemporaneous with the inspection." as const;
export const D1H_R4_ANALYSIS_TEMPORAL_MISMATCH_HIDDEN = false as const;
export const D1H_R4_LATEST_ANALYSIS_AUTO_SELECTED = false as const;
export const D1H_R4_LATEST_RESULT_AUTO_SELECTED = false as const;
export const D1H_R4_ANALYSIS_CASE_COMBINATION_EXPLICIT = true as const;
export const D1H_R4_ANALYSIS_MEASUREMENT_LOCATION_COMPATIBILITY_REQUIRED = true as const;
export const D1H_R4_ANALYSIS_MEASUREMENT_QUANTITY_COMPATIBILITY_REQUIRED = true as const;
export const D1H_R4_PREDICTED_EQUALS_MEASURED = false as const;
export const D1H_R4_PREDICTION_AGREEMENT_EQUALS_MODEL_VALIDATION = false as const;
export const D1H_R4_PREDICTION_AGREEMENT_EQUALS_CAUSAL_PROOF = false as const;
export const D1H_R4_PREDICTION_DISAGREEMENT_AUTO_DIAGNOSES_DAMAGE = false as const;
export const D1H_R4_MEASURED_DATA_AUTO_UPDATES_ANALYSIS_MODEL = false as const;
export const D1H_R4_CONDITION_STATE_AUTO_UPDATES_ANALYSIS_MODEL = false as const;
export const D1H_R4_CHANGE_EVIDENCE_AUTO_MODIFIES_CAPACITY = false as const;
export const D1H_R4_ASSOCIATION_AUTO_MODIFIES_CAPACITY = false as const;
export const D1H_R4_ANALYSIS_LINK_AUTO_MODIFIES_CAPACITY = false as const;
export const D1H_R4_CHANGE_EVIDENCE_AUTO_UPDATES_CONDITION_RATING = false as const;
export const D1H_R4_CHANGE_AUTO_CREATES_ENGINEERING_INTERPRETATION = false as const;
export const D1H_R4_ASSOCIATION_PROVENANCE_COMPLETE = true as const;
export const D1H_R4_CONTINUITY_PROVENANCE_COMPLETE = true as const;
export const D1H_R4_COMPARISON_PROVENANCE_COMPLETE = true as const;
export const D1H_R4_ANALYSIS_LINK_PROVENANCE_COMPLETE = true as const;
export const D1H_R4_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1H_R4_FINGERPRINT_ARCHITECTURE = "Deterministic fingerprints cover finding association, condition continuity, measurement comparison, change evidence, and analysis-result link. Each fingerprint includes the referenced identities, compatibility or authority state, and version." as const;
export const D1H_R4_ANALYSIS_LINK_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R4_ANALYSIS_RESULT_CHANGE_PROPAGATES_STALE = true as const;
export const D1H_R4_TARGET_CHANGE_PROPAGATES_STALE = true as const;
export const D1H_R4_FINDING_CHANGE_PROPAGATES_ASSOCIATION_STALE = true as const;
export const D1H_R4_MEASUREMENT_CHANGE_PROPAGATES_COMPARISON_STALE = true as const;
export const D1H_R4_CONDITION_STATE_CHANGE_PROPAGATES_CONTINUITY_STALE = true as const;
export const D1H_R4_RATING_SCHEME_CHANGE_PROPAGATES_CONTINUITY_STALE = true as const;
export const NEW_ASSOCIATION_OVERWRITES_OLD = false as const;
export const NEW_COMPARISON_OVERWRITES_OLD = false as const;
export const NEW_ANALYSIS_LINK_OVERWRITES_OLD = false as const;
export const NEW_CONTINUITY_STATE_OVERWRITES_OLD = false as const;
export const D1H_R4_CONFLICTING_ASSOCIATIONS_AUTO_RESOLVED = false as const;
export const D1H_R4_CURRENT_ASSOCIATION_AUTHORITY_REQUIRED = true as const;
export const D1H_R4_CONFLICTING_COMPARISONS_AUTO_AVERAGED = false as const;
export const D1H_R4_COMPLETE_EQUALS_DETERIORATION_CONFIRMED = false as const;
export const D1H_R4_COMPLETE_EQUALS_CAUSE_CONFIRMED = false as const;
export const D1H_R4_RUNTIME_DIAGNOSTIC_EQUALS_STRUCTURAL_FINDING = false as const;
export const D1H_R4_RUNTIME_RESULT_EQUALS_DETERIORATION_ASSESSMENT = false as const;
export const D1H_R4_RUNTIME_RESULT_EQUALS_CAUSAL_DIAGNOSIS = false as const;
export const D1H_R4_RUNTIME_RESULT_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1H_R4_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1H_R4_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1H_R4_AI_ENGINEERING_AUTHORITY_CREATED = false as const;
export const D1H_R4_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1H_R4_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1I_REAUTHORS_D1H_TEMPORAL_HISTORY = false as const;
export const D1H_R4_CROSS_PROJECT_BINDING_ALLOWED = false as const;
export const D1H_R4_CROSS_TENANT_BINDING_ALLOWED = false as const;
export const D1H_R4_ASSOCIATION_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1H_R4_ANALYSIS_LINK_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1H_R5_HANDOFF_READY = true as const;
export const D1H_R4_ASSOCIATION_CARDINALITY_CONTRACT = "Associations are separate records. One prior finding may relate to several later findings. Several prior findings may relate to one later finding. Unresolved relations remain unresolved. Split and merged lineage do not rewrite or delete the source finding records." as const;
export const D1H_R4_CURRENT_HISTORICAL_SEMANTICS = "CURRENT, HISTORICAL, SUPERSEDED, STALE, and INVALID are lifecycle states. A successor or an explicit current selection leaves the prior record in place." as const;
export const D1H_R4_D1I_HANDOFF_CONTRACT = "A future D1I reference returns target, condition-state, association, comparison, change-evidence, and analysis-link identities with provenance, fingerprints, and timestamps. It does not copy or re-author D1H history." as const;
export const D1H_R5_REQUIRED_R4_CONTRACTS = [
  "inspectionContextIdentity",
  "structuralTargetIdentity",
  "findingAssociationIdentity",
  "conditionContinuityIdentity",
  "measurementComparisonIdentity",
  "changeEvidenceIdentity",
  "analysisResultLinkIdentity",
  "authority",
  "provenance",
  "fingerprints",
  "history",
  "supersession",
  "invalidation",
  "completeness",
  "timestamps",
] as const;

export const D1H_R4_ASSOCIATION_STATES = [
  "POSSIBLE_MATCH",
  "HUMAN_CONFIRMED_SAME_CONDITION",
  "HUMAN_CONFIRMED_DISTINCT",
  "CONTINUITY_UNRESOLVED",
  "SPLIT_LINEAGE",
  "MERGED_LINEAGE",
  "SUPERSEDED",
  "STALE",
  "INVALID",
] as const;
export const D1H_R4_ASSOCIATION_CARDINALITIES = ["ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_ONE", "UNRESOLVED"] as const;
export const D1H_R4_EFFECTIVE_STATES = ["CURRENT", "HISTORICAL", "SUPERSEDED", "STALE", "INVALID"] as const;
export const D1H_R4_MEASUREMENT_COMPARABILITY_STATES = [
  "COMPARABLE",
  "NOT_COMPARABLE_QUANTITY",
  "NOT_COMPARABLE_UNIT",
  "NOT_COMPARABLE_LOCATION",
  "NOT_COMPARABLE_METHOD",
  "NOT_COMPARABLE_BASIS",
  "TARGET_MISMATCH",
  "VALIDATION_STATE_LIMITATION",
  "UNDETERMINED",
] as const;
export const D1H_R4_ANALYSIS_LINK_PURPOSES = [
  "CONTEXT_REFERENCE",
  "PREDICTED_RESPONSE_REFERENCE",
  "LOAD_EFFECT_CONTEXT",
  "SUPPORT_REACTION_CONTEXT",
  "COMPARISON_CONTEXT",
  "OTHER",
] as const;
export const D1H_R4_COMPLETENESS_STATES = ["COMPLETE_FOR_DECLARED_TEMPORAL_SCOPE", "PARTIAL", "INCOMPLETE", "INVALID", "STALE", "UNDETERMINED"] as const;
export const D1H_R4_EVENTS = [
  "FINDING_ASSOCIATION_RECORDED",
  "FINDING_ASSOCIATION_CONFIRMED",
  "FINDING_ASSOCIATION_SUPERSEDED",
  "CONDITION_CONTINUITY_RECORDED",
  "MEASUREMENT_COMPARISON_RECORDED",
  "CHANGE_EVIDENCE_RECORDED",
  "ANALYSIS_RESULT_LINK_RECORDED",
  "ANALYSIS_RESULT_LINK_INVALIDATED",
] as const;
export const D1H_R4_INVALIDATION_CAUSES = [
  "FINDING_CHANGED",
  "TARGET_STALE",
  "BASIS_EVIDENCE_CHANGED",
  "CONFIRMATION_WITHDRAWN",
  "CONTEXT_INVALID",
  "MEASUREMENT_CHANGED",
  "CONDITION_STATE_CHANGED",
  "RATING_SCHEME_CHANGED",
  "ANALYSIS_RESULT_CHANGED",
  "AUTHORITY_WITHDRAWN",
] as const;
export const D1H_R4_RESULT_CLASSES = ["RAW_PROVIDER_RESULT", "NORMALIZED_RESULT", "GOVERNED_RESULT", "DESIGN_INPUT"] as const;

export type D1hR4AssociationState = (typeof D1H_R4_ASSOCIATION_STATES)[number];
export type D1hR4EffectiveState = (typeof D1H_R4_EFFECTIVE_STATES)[number];
export type D1hR4Comparability = (typeof D1H_R4_MEASUREMENT_COMPARABILITY_STATES)[number];
export type D1hR4Completeness = (typeof D1H_R4_COMPLETENESS_STATES)[number];
export type D1hR4InvalidationCause = (typeof D1H_R4_INVALIDATION_CAUSES)[number];

export type D1hR4AssociationBasis = {
  basisId: string;
  kind: "LOCATION" | "GEOMETRY" | "IMAGE_EVIDENCE" | "FINDING_TYPE" | "MEASUREMENT" | "HUMAN_NOTE" | "OTHER_EVIDENCE";
  ref: string;
  provesIdentity: false;
};

export type D1hR4MeasurementBasis = {
  referenceDatum: string | null;
  gaugeLength: string | null;
  calibrationBasis: string | null;
  orientation: string | null;
  surfaceFace: string | null;
  memberStation: string | null;
  coordinateSystem: string | null;
  measurementSetup: string | null;
};

export type D1hR4FindingAssociation = {
  recordKind: "FINDING_ASSOCIATION";
  associationId: string;
  sourceFindingId: string;
  relatedFindingId: string;
  sourceInspectionContextId: string;
  relatedInspectionContextId: string;
  targetId: string;
  associationType: (typeof D1H_R4_ASSOCIATION_CARDINALITIES)[number];
  associationStatus: Exclude<D1hR4AssociationState, "SUPERSEDED" | "STALE" | "INVALID">;
  basisRefs: readonly D1hR4AssociationBasis[];
  createdBy: string;
  authority: string;
  validatedBy: string | null;
  validationRef: string | null;
  limitations: string;
  sourceCapturedAt: string | null;
  sourceInspectionAt: string;
  relatedInspectionAt: string;
  sourceFindingRecordedAt: string;
  relatedFindingRecordedAt: string;
  recordCreatedAt: string;
  timezoneInferred: false;
  chronologyInferredFromRecordOrder: false;
  identityProof: false;
  governs: boolean;
  findingsMerged: false;
  findingsDeleted: false;
  capacityChanged: false;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesAssociationId: string | null;
};

export type D1hR4ConditionContinuity = {
  recordKind: "CONDITION_CONTINUITY";
  continuityId: string;
  targetId: string;
  priorConditionStateId: string;
  currentConditionStateId: string;
  priorInspectionContextId: string;
  currentInspectionContextId: string;
  priorRatingSchemeId: string | null;
  priorSchemeVersion: string | null;
  priorSchemeFingerprint: string | null;
  currentRatingSchemeId: string | null;
  currentSchemeVersion: string | null;
  currentSchemeFingerprint: string | null;
  associationIds: readonly string[];
  comparisonIds: readonly string[];
  continuityStatus: "RECORDED" | "CONTINUITY_UNRESOLVED";
  ratingValuesComparable: boolean;
  sameRatingEqualsUnchanged: false;
  differentRatingEqualsDeterioration: false;
  authority: string;
  limitations: string;
  priorInspectionAt: string;
  currentInspectionAt: string;
  priorConditionEffectiveAt: string;
  currentConditionEffectiveAt: string;
  recordCreatedAt: string;
  timezoneInferred: false;
  chronologyInferredFromRecordOrder: false;
  reauthoredConditionState: false;
  capacityChanged: false;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesContinuityId: string | null;
};

export type D1hR4MeasurementComparison = {
  recordKind: "MEASUREMENT_COMPARISON";
  comparisonId: string;
  priorMeasurementId: string;
  currentMeasurementId: string;
  targetId: string;
  quantity: string;
  priorUnit: string;
  currentUnit: string;
  unitNormalizationRef: string | null;
  locationCompatible: boolean;
  methodCompatible: boolean;
  basisCompatible: boolean;
  priorMeasuredAt: string;
  currentMeasuredAt: string;
  recordCreatedAt: string;
  comparisonStatus: D1hR4Comparability;
  rawDifference: number | null;
  priorValidationState: "HUMAN_CONFIRMED" | "UNVALIDATED" | "STALE";
  currentValidationState: "HUMAN_CONFIRMED" | "UNVALIDATED" | "STALE";
  promoted: false;
  deteriorationRate: null;
  rateComputed: false;
  limitations: string;
  authority: string;
  timezoneInferred: false;
  chronologyInferredFromRecordOrder: false;
  capacityChanged: false;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesComparisonId: string | null;
};

export type D1hR4ChangeEvidence = {
  recordKind: "CHANGE_EVIDENCE";
  changeEvidenceId: string;
  comparisonId: string;
  priorRef: string;
  currentRef: string;
  comparability: D1hR4Comparability;
  observedDifference: number | null;
  priorAt: string;
  currentAt: string;
  recordCreatedAt: string;
  limitations: string;
  cause: null;
  deterioration: false;
  deteriorationRate: null;
  repairEffectiveness: false;
  ratingUpdated: false;
  interpretationCreated: false;
  capacityChanged: false;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
};

export type D1hR4AnalysisIdentityRef = {
  analysisResultId: string;
  analysisModelId: string;
  analysisModelVersion: string;
  analysisModelFingerprint: string;
  analysisRunId: string;
  analysisRunFingerprint: string;
  resultSetId: string;
  normalizedResultId: string | null;
  resultClass: (typeof D1H_R4_RESULT_CLASSES)[number];
  authorityState: (typeof D1F_ANALYSIS_RESULT_AUTHORITY_STATES)[number];
  runStatus: (typeof D1F_R2_ANALYSIS_RUN_STATUS_STATES)[number];
  resultCategory: (typeof D1F_RESULT_CATEGORIES)[number];
  quantity: string;
  locationKind: string;
  loadCaseId: string | null;
  combinationId: string | null;
  providerId: string;
  providerVersion: string;
  providerProvenanceRef: string;
  modelValidationEvidenceRef: string | null;
  analysisTimestamp: string;
  structuralStateRef: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  structuralSystemId: string;
};

export type D1hR4AnalysisResultLink = {
  recordKind: "ANALYSIS_RESULT_LINK";
  analysisLinkId: string;
  inspectionContextId: string;
  targetId: string;
  evidenceIds: readonly string[];
  findingIds: readonly string[];
  measurementIds: readonly string[];
  conditionStateIds: readonly string[];
  analysisResultId: string;
  analysisModelId: string;
  analysisModelVersion: string;
  analysisModelFingerprint: string;
  analysisRunId: string;
  analysisRunFingerprint: string;
  resultSetId: string;
  normalizedResultId: string | null;
  resultClass: (typeof D1H_R4_RESULT_CLASSES)[number];
  resultCategory: string;
  quantity: string;
  locationKind: string;
  loadCaseId: string | null;
  combinationId: string | null;
  providerId: string;
  providerVersion: string;
  providerProvenanceRef: string;
  authorityState: string;
  runStatus: string;
  modelValidationEvidenceRef: string | null;
  analysisTimestamp: string;
  inspectionAt: string;
  inspectionStructuralStateRef: string;
  analysisStructuralStateRef: string;
  temporalMismatch: boolean;
  contemporaneous: false;
  linkPurpose: (typeof D1H_R4_ANALYSIS_LINK_PURPOSES)[number];
  boundIdentityFingerprint: string;
  authority: string;
  limitations: string;
  governsCondition: false;
  predictedEqualsMeasured: false;
  agreementEqualsModelValidation: false;
  disagreementDiagnosesDamage: false;
  analysisModelUpdated: false;
  capacityChanged: false;
  recordCreatedAt: string;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesAnalysisLinkId: string | null;
};

type SubjectKind = "ASSOCIATION" | "CONTINUITY" | "COMPARISON" | "CHANGE" | "ANALYSIS_LINK";

export type D1hR4Store = {
  associations: D1hR4FindingAssociation[];
  continuities: D1hR4ConditionContinuity[];
  comparisons: D1hR4MeasurementComparison[];
  changeEvidence: D1hR4ChangeEvidence[];
  analysisLinks: D1hR4AnalysisResultLink[];
  history: Array<{ historyId: string; subjectKind: SubjectKind; subjectId: string; action: string; version: string; fingerprint: string; recordedAt: string; predecessorId: string | null }>;
  states: Array<{ subjectKind: SubjectKind; subjectId: string; effective: D1hR4EffectiveState; recordedAt: string }>;
  invalidations: Array<{ invalidationId: string; cause: D1hR4InvalidationCause; subjectKind: SubjectKind; subjectId: string; recordedAt: string; deletesSubject: false }>;
  events: Array<{ eventId: string; eventType: (typeof D1H_R4_EVENTS)[number]; subjectId: string; recordedAt: string; engineeringApproval: false }>;
};

export type D1hR4RuntimeResult = {
  resultId: string;
  inspectionContextIds: readonly string[];
  targetIds: readonly string[];
  associationIds: readonly string[];
  continuityIds: readonly string[];
  comparisonIds: readonly string[];
  changeEvidenceIds: readonly string[];
  analysisLinkIds: readonly string[];
  scope: string;
  completeness: D1hR4Completeness;
  runtimeDiagnostics: readonly { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[];
  blockingRuntimeDiagnostics: readonly { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[];
  warnings: readonly string[];
  provenance: D1hProvenanceRef;
  fingerprint: string;
  deteriorationAssessment: false;
  causalDiagnosis: false;
  structuralAdequacy: false;
};

const FORBIDDEN_SCOPE_KEYS = [
  "geographicLocation",
  "projectLocation",
  "latest",
  "latestAnalysis",
  "latestResult",
  "currentResult",
  "safe",
  "unsafe",
  "capacityReduction",
  "sectionPropertyUpdate",
  "materialPropertyUpdate",
  "repairDesign",
  "repairRecommendation",
  "faceRecognition",
  "workerIdentity",
  "employeeScore",
  "fitnessForService",
  "remainingLife",
  "corrosionRate",
  "crackGrowth",
  "fatigueLife",
  "regression",
  "forecast",
  "causalDiagnosis",
  "digitalTwin",
  "resultValue",
  "governsCondition",
] as const;
const DYNAMIC_REFS = new Set(["LATEST_ANALYSIS", "LATEST_RESULT", "CURRENT_RESULT"]);
const CONFIRMED = new Set(["HUMAN_CONFIRMED_SAME_CONDITION", "HUMAN_CONFIRMED_DISTINCT", "SPLIT_LINEAGE", "MERGED_LINEAGE"]);

function fail(code: string): never {
  throw new Error(code);
}

function required(value: string | null | undefined, code: string): string {
  if (typeof value !== "string" || value.trim() === "") fail(code);
  return value;
}

function assertScope(input: object): void {
  for (const key of FORBIDDEN_SCOPE_KEYS) if (key in input) fail(`SCOPE_REJECTED:${key}`);
}

function humanAuthority(authority: string): void {
  const normalized = required(authority, "AUTHORITY_REQUIRED").toUpperCase();
  if (normalized.startsWith("AI") || normalized.includes("LLM")) fail("AI_AUTHORITY_REJECTED");
}

function assertProvenance(provenance: D1hProvenanceRef, scope: { tenantId: string; workspaceId: string; projectId: string }): void {
  required(provenance.tenantId, "PROVENANCE_INCOMPLETE");
  required(provenance.workspaceId, "PROVENANCE_INCOMPLETE");
  required(provenance.projectId, "PROVENANCE_INCOMPLETE");
  required(provenance.actorOrSystem, "PROVENANCE_INCOMPLETE");
  required(provenance.timestamp, "PROVENANCE_INCOMPLETE");
  required(provenance.authority, "PROVENANCE_INCOMPLETE");
  required(provenance.version, "PROVENANCE_INCOMPLETE");
  if (provenance.tenantId !== scope.tenantId) fail("CROSS_TENANT_BINDING_REJECTED");
  if (provenance.projectId !== scope.projectId || provenance.workspaceId !== scope.workspaceId) fail("CROSS_PROJECT_BINDING_REJECTED");
}

function effectiveOf(store: D1hR4Store, kind: SubjectKind, subjectId: string): D1hR4EffectiveState {
  const rows = store.states.filter((row) => row.subjectKind === kind && row.subjectId === subjectId);
  return rows.length === 0 ? "CURRENT" : rows[rows.length - 1]!.effective;
}

function r2Effective(r2: D1hR2Store, kind: "FINDING" | "MEASUREMENT" | "VALIDATION", subjectId: string): string {
  const rows = r2.states.filter((row) => row.subjectKind === kind && row.subjectId === subjectId);
  return rows.length === 0 ? "CURRENT" : rows[rows.length - 1]!.effective;
}

function r3Effective(r3: D1hR3Store, kind: "SCHEME" | "CONDITION_STATE", subjectId: string): string {
  const rows = r3.states.filter((row) => row.subjectKind === kind && row.subjectId === subjectId);
  return rows.length === 0 ? "CURRENT" : rows[rows.length - 1]!.effective;
}

function remember(store: D1hR4Store, kind: SubjectKind, subjectId: string, action: string, version: string, fingerprint: string, recordedAt: string, predecessorId: string | null, effective: D1hR4EffectiveState): void {
  store.history.push({ historyId: `${kind}:${subjectId}:${action}:${version}`, subjectKind: kind, subjectId, action, version, fingerprint, recordedAt, predecessorId });
  store.states.push({ subjectKind: kind, subjectId, effective, recordedAt });
}

function emit(store: D1hR4Store, eventType: (typeof D1H_R4_EVENTS)[number], subjectId: string, recordedAt: string, version: string): void {
  store.events.push({ eventId: `${eventType}:${subjectId}:${version}`, eventType, subjectId, recordedAt, engineeringApproval: false });
}

function invalidateSubject(store: D1hR4Store, cause: D1hR4InvalidationCause, kind: SubjectKind, subjectId: string, recordedAt: string): void {
  if (effectiveOf(store, kind, subjectId) === "STALE") return;
  const fingerprint = fingerprintOf(store, kind, subjectId);
  store.invalidations.push({ invalidationId: `${cause}:${kind}:${subjectId}`, cause, subjectKind: kind, subjectId, recordedAt, deletesSubject: false });
  store.states.push({ subjectKind: kind, subjectId, effective: "STALE", recordedAt });
  store.history.push({ historyId: `${kind}:${subjectId}:INVALIDATED:${cause}`, subjectKind: kind, subjectId, action: "INVALIDATED", version: cause, fingerprint, recordedAt, predecessorId: null });
  if (kind === "ANALYSIS_LINK") emit(store, "ANALYSIS_RESULT_LINK_INVALIDATED", subjectId, recordedAt, cause);
}

function fingerprintOf(store: D1hR4Store, kind: SubjectKind, subjectId: string): string {
  if (kind === "ASSOCIATION") return store.associations.find((row) => row.associationId === subjectId)?.fingerprint ?? "";
  if (kind === "CONTINUITY") return store.continuities.find((row) => row.continuityId === subjectId)?.fingerprint ?? "";
  if (kind === "COMPARISON") return store.comparisons.find((row) => row.comparisonId === subjectId)?.fingerprint ?? "";
  if (kind === "CHANGE") return store.changeEvidence.find((row) => row.changeEvidenceId === subjectId)?.fingerprint ?? "";
  return store.analysisLinks.find((row) => row.analysisLinkId === subjectId)?.fingerprint ?? "";
}

export function createD1hR4Store(): D1hR4Store {
  return { associations: [], continuities: [], comparisons: [], changeEvidence: [], analysisLinks: [], history: [], states: [], invalidations: [], events: [] };
}

export function confirmAssociationFromProximity(): never {
  throw new Error("GEOMETRIC_PROXIMITY_EQUALS_SAME_FINDING_REJECTED");
}
export function confirmAssociationFromImageSimilarity(): never {
  throw new Error("IMAGE_SIMILARITY_EQUALS_SAME_FINDING_REJECTED");
}
export function confirmAssociationFromAi(): never {
  throw new Error("AI_ASSOCIATION_AUTO_CONFIRMED_REJECTED");
}
export function equateFindingsByTarget(): never {
  throw new Error("SAME_TARGET_EQUALS_SAME_FINDING_REJECTED");
}
export function equateFindingsByLocation(): never {
  throw new Error("SAME_LOCATION_EQUALS_SAME_FINDING_REJECTED");
}
export function mergeFindingRecords(): never {
  throw new Error("ASSOCIATION_MERGES_FINDING_RECORDS_REJECTED");
}
export function deletePriorFindings(): never {
  throw new Error("ASSOCIATION_DELETES_PRIOR_FINDINGS_REJECTED");
}
export function rebindStaleTarget(): never {
  throw new Error("STALE_TARGET_AUTO_REBOUND_REJECTED");
}
export function inferTimezoneFromProjectLocation(): never {
  throw new Error("TIMEZONE_INFERENCE_REJECTED");
}
export function computeDeteriorationRate(): never {
  throw new Error("DETERIORATION_RATE_REJECTED");
}
export function extrapolateFutureCondition(): never {
  throw new Error("TEMPORAL_EXTRAPOLATION_REJECTED");
}
export function fitTemporalTrend(): never {
  throw new Error("TREND_MODEL_REJECTED");
}
export function diagnoseCause(): never {
  throw new Error("CAUSAL_DIAGNOSIS_REJECTED");
}
export function selectLatestAnalysisResult(): never {
  throw new Error("LATEST_ANALYSIS_AUTO_SELECTED_REJECTED");
}
export function promoteLinkedAnalysisAuthority(): never {
  throw new Error("ANALYSIS_AUTHORITY_PROMOTION_REJECTED");
}
export function updateAnalysisModelFromMeasurement(): never {
  throw new Error("MEASUREMENT_MODEL_UPDATE_REJECTED");
}
export function updateAnalysisModelFromCondition(): never {
  throw new Error("CONDITION_MODEL_UPDATE_REJECTED");
}
export function modifyCapacityFromTemporalRecord(): never {
  throw new Error("CAPACITY_MODIFICATION_REJECTED");
}
export function updateConditionRatingFromChange(): never {
  throw new Error("CONDITION_RATING_UPDATE_REJECTED");
}
export function createInterpretationFromChange(): never {
  throw new Error("INTERPRETATION_AUTO_CREATE_REJECTED");
}
export function averageMeasurementComparisons(): never {
  throw new Error("COMPARISON_AVERAGE_REJECTED");
}
export function resolveConflictingAssociations(): never {
  throw new Error("CONFLICTING_ASSOCIATIONS_AUTO_RESOLVE_REJECTED");
}

export function normalizeWithExistingUnitSystem(quantity: string, value: number, unit: string): number {
  if (quantity === "force") return toForceN({ value, unit });
  if (quantity === "moment") return toMomentNm({ value, unit });
  if (quantity === "distributedForce") return toDistributedNpm({ value, unit });
  if (quantity === "stress") return toEPa({ value, unit });
  if (quantity === "length" || quantity === "deflection") return toLengthM(value, unit);
  throw new Error("UNIT_CONVERTER_ABSENT");
}

export function existingUnitPairCompatible(quantity: string, leftUnit: string, rightUnit: string): boolean {
  try {
    normalizeWithExistingUnitSystem(quantity, 1, leftUnit);
    normalizeWithExistingUnitSystem(quantity, 1, rightUnit);
    return true;
  } catch {
    return false;
  }
}

export type D1hR4AssociationInput = {
  associationId: string;
  sourceFindingId: string;
  relatedFindingId: string;
  targetId: string;
  associationType: (typeof D1H_R4_ASSOCIATION_CARDINALITIES)[number];
  associationStatus: D1hR4FindingAssociation["associationStatus"];
  basisRefs: readonly Omit<D1hR4AssociationBasis, "provesIdentity">[];
  createdBy: string;
  authority: string;
  validatedBy: string | null;
  validationRef: string | null;
  limitations: string;
  recordCreatedAt: string;
  provenance: D1hProvenanceRef;
  version: string;
};

export function recordFindingAssociation(r1: D1hR1Store, r2: D1hR2Store, r4: D1hR4Store, input: D1hR4AssociationInput): D1hR4FindingAssociation {
  assertScope(input);
  if (!D1H_R4_ASSOCIATION_CARDINALITIES.includes(input.associationType)) fail("ASSOCIATION_CARDINALITY_UNKNOWN");
  if (r4.associations.some((row) => row.associationId === input.associationId)) fail("DUPLICATE_ASSOCIATION_ID");
  const source = r2.structuralFindings.find((row) => row.findingId === input.sourceFindingId);
  const related = r2.structuralFindings.find((row) => row.findingId === input.relatedFindingId);
  if (!source || !related) fail("FINDING_UNKNOWN");
  if (source.findingId === related.findingId) fail("ASSOCIATION_SELF_LINK");
  const sourceContext = r1.contexts.find((row) => row.inspectionContextId === source.inspectionContextId);
  const relatedContext = r1.contexts.find((row) => row.inspectionContextId === related.inspectionContextId);
  if (!sourceContext || !relatedContext) fail("CONTEXT_UNKNOWN");
  if (sourceContext.tenantId !== relatedContext.tenantId) fail("CROSS_TENANT_ASSOCIATION_REJECTED");
  if (sourceContext.projectId !== relatedContext.projectId || sourceContext.workspaceId !== relatedContext.workspaceId) fail("CROSS_PROJECT_ASSOCIATION_REJECTED");
  assertProvenance(input.provenance, sourceContext);
  if (source.targetId !== input.targetId || related.targetId !== input.targetId) fail("TARGET_MISMATCH");
  if (currentD1hR1Effective(r1, "TARGET", input.targetId) === "STALE") fail("STALE_TARGET");
  if (r2Effective(r2, "FINDING", source.findingId) !== "CURRENT" || r2Effective(r2, "FINDING", related.findingId) !== "CURRENT") fail("FINDING_NOT_CURRENT");
  const ai = input.authority.toUpperCase().startsWith("AI");
  if (ai) {
    if (input.authority !== "AI_CANDIDATE") fail("AI_AUTHORITY_REJECTED");
    if (input.associationStatus !== "POSSIBLE_MATCH" && input.associationStatus !== "CONTINUITY_UNRESOLVED") fail("AI_ASSOCIATION_CANNOT_GOVERN");
  } else {
    humanAuthority(input.authority);
    if (CONFIRMED.has(input.associationStatus) && !input.validatedBy) fail("ASSOCIATION_CONFIRMATION_AUTHORITY_REQUIRED");
  }
  if (input.basisRefs.length === 0) fail("ASSOCIATION_BASIS_REQUIRED");
  const basisRefs = input.basisRefs.map((row) => ({ ...row, provesIdentity: false as const }));
  const sourceEvidence = r1.evidence.find((row) => row.evidenceId === source.supportingEvidenceIds[0]);
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R4_ASSOCIATION",
    sourceFindingId: source.findingId,
    relatedFindingId: related.findingId,
    sourceInspectionContextId: source.inspectionContextId,
    relatedInspectionContextId: related.inspectionContextId,
    targetId: input.targetId,
    associationType: input.associationType,
    associationStatus: input.associationStatus,
    basisRefs,
    authority: input.authority,
    version: input.version,
  });
  const record: D1hR4FindingAssociation = {
    recordKind: "FINDING_ASSOCIATION",
    associationId: input.associationId,
    sourceFindingId: source.findingId,
    relatedFindingId: related.findingId,
    sourceInspectionContextId: source.inspectionContextId,
    relatedInspectionContextId: related.inspectionContextId,
    targetId: input.targetId,
    associationType: input.associationType,
    associationStatus: input.associationStatus,
    basisRefs,
    createdBy: required(input.createdBy, "AUTHORITY_REQUIRED"),
    authority: input.authority,
    validatedBy: input.validatedBy,
    validationRef: input.validationRef,
    limitations: required(input.limitations, "LIMITATIONS_REQUIRED"),
    sourceCapturedAt: sourceEvidence?.capturedAt ?? null,
    sourceInspectionAt: sourceContext.inspectedAt,
    relatedInspectionAt: relatedContext.inspectedAt,
    sourceFindingRecordedAt: source.createdAt,
    relatedFindingRecordedAt: related.createdAt,
    recordCreatedAt: input.recordCreatedAt,
    timezoneInferred: false,
    chronologyInferredFromRecordOrder: false,
    identityProof: false,
    governs: !ai && CONFIRMED.has(input.associationStatus),
    findingsMerged: false,
    findingsDeleted: false,
    capacityChanged: false,
    provenance: input.provenance,
    version: input.version,
    fingerprint,
    supersedesAssociationId: null,
  };
  r4.associations.push(record);
  remember(r4, "ASSOCIATION", record.associationId, "CREATED", record.version, fingerprint, input.recordCreatedAt, null, "CURRENT");
  emit(r4, CONFIRMED.has(record.associationStatus) ? "FINDING_ASSOCIATION_CONFIRMED" : "FINDING_ASSOCIATION_RECORDED", record.associationId, input.recordCreatedAt, record.version);
  return record;
}

export function selectCurrentFindingAssociation(r4: D1hR4Store, associationId: string, authority: string, recordedAt: string): void {
  humanAuthority(authority);
  const selected = r4.associations.find((row) => row.associationId === associationId);
  if (!selected) fail("ASSOCIATION_UNKNOWN");
  if (selected.authority.toUpperCase().startsWith("AI")) fail("AI_ASSOCIATION_CANNOT_GOVERN");
  for (const row of r4.associations) {
    if (row.associationId !== associationId && row.sourceFindingId === selected.sourceFindingId && effectiveOf(r4, "ASSOCIATION", row.associationId) === "CURRENT") {
      r4.states.push({ subjectKind: "ASSOCIATION", subjectId: row.associationId, effective: "HISTORICAL", recordedAt });
    }
  }
  r4.states.push({ subjectKind: "ASSOCIATION", subjectId: associationId, effective: "CURRENT", recordedAt });
}

export function compareConditionRatings(r3: D1hR3Store, priorConditionStateId: string, currentConditionStateId: string): { comparable: false; numericComparison: false; deterioration: false } {
  const prior = r3.conditionStates.find((row) => row.conditionStateId === priorConditionStateId);
  const current = r3.conditionStates.find((row) => row.conditionStateId === currentConditionStateId);
  if (!prior || !current) fail("CONDITION_STATE_UNKNOWN");
  if (prior.ratingSchemeId !== current.ratingSchemeId || prior.schemeVersion !== current.schemeVersion || prior.schemeFingerprint !== current.schemeFingerprint) fail("CROSS_SCHEME_RATING_COMPARISON_REJECTED");
  return { comparable: false, numericComparison: false, deterioration: false };
}

export function ratingSchemesHistoricallyComparable(left: { ratingSchemeId: string; schemeVersion: string; fingerprint: string }, right: { ratingSchemeId: string; schemeVersion: string; fingerprint: string }): boolean {
  return left.ratingSchemeId === right.ratingSchemeId && left.schemeVersion === right.schemeVersion && left.fingerprint === right.fingerprint;
}

export type D1hR4ContinuityInput = {
  continuityId: string;
  targetId: string;
  priorConditionStateId: string;
  currentConditionStateId: string;
  associationIds: readonly string[];
  comparisonIds: readonly string[];
  continuityStatus: "RECORDED" | "CONTINUITY_UNRESOLVED";
  authority: string;
  limitations: string;
  recordCreatedAt: string;
  provenance: D1hProvenanceRef;
  version: string;
};

export function recordConditionContinuity(r1: D1hR1Store, r3: D1hR3Store, r4: D1hR4Store, input: D1hR4ContinuityInput): D1hR4ConditionContinuity {
  assertScope(input);
  humanAuthority(input.authority);
  if (r4.continuities.some((row) => row.continuityId === input.continuityId)) fail("DUPLICATE_CONTINUITY_ID");
  const prior = r3.conditionStates.find((row) => row.conditionStateId === input.priorConditionStateId);
  const current = r3.conditionStates.find((row) => row.conditionStateId === input.currentConditionStateId);
  if (!prior || !current) fail("CONDITION_STATE_UNKNOWN");
  if (prior.targetId !== input.targetId || current.targetId !== input.targetId) fail("TARGET_MISMATCH");
  const priorContext = r1.contexts.find((row) => row.inspectionContextId === prior.inspectionContextId);
  const currentContext = r1.contexts.find((row) => row.inspectionContextId === current.inspectionContextId);
  if (!priorContext || !currentContext) fail("CONTEXT_UNKNOWN");
  if (priorContext.tenantId !== currentContext.tenantId) fail("CROSS_TENANT_ASSOCIATION_REJECTED");
  if (priorContext.projectId !== currentContext.projectId) fail("CROSS_PROJECT_ASSOCIATION_REJECTED");
  assertProvenance(input.provenance, priorContext);
  if (currentD1hR1Effective(r1, "TARGET", input.targetId) === "STALE") fail("STALE_TARGET");
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R4_CONTINUITY",
    targetId: input.targetId,
    priorConditionStateId: prior.conditionStateId,
    currentConditionStateId: current.conditionStateId,
    priorRatingSchemeId: prior.ratingSchemeId,
    priorSchemeVersion: prior.schemeVersion,
    priorSchemeFingerprint: prior.schemeFingerprint,
    currentRatingSchemeId: current.ratingSchemeId,
    currentSchemeVersion: current.schemeVersion,
    currentSchemeFingerprint: current.schemeFingerprint,
    associationIds: input.associationIds,
    comparisonIds: input.comparisonIds,
    continuityStatus: input.continuityStatus,
    authority: input.authority,
    version: input.version,
  });
  const record: D1hR4ConditionContinuity = {
    recordKind: "CONDITION_CONTINUITY",
    continuityId: input.continuityId,
    targetId: input.targetId,
    priorConditionStateId: prior.conditionStateId,
    currentConditionStateId: current.conditionStateId,
    priorInspectionContextId: prior.inspectionContextId,
    currentInspectionContextId: current.inspectionContextId,
    priorRatingSchemeId: prior.ratingSchemeId,
    priorSchemeVersion: prior.schemeVersion,
    priorSchemeFingerprint: prior.schemeFingerprint,
    currentRatingSchemeId: current.ratingSchemeId,
    currentSchemeVersion: current.schemeVersion,
    currentSchemeFingerprint: current.schemeFingerprint,
    associationIds: input.associationIds,
    comparisonIds: input.comparisonIds,
    continuityStatus: input.continuityStatus,
    ratingValuesComparable: false,
    sameRatingEqualsUnchanged: false,
    differentRatingEqualsDeterioration: false,
    authority: input.authority,
    limitations: required(input.limitations, "LIMITATIONS_REQUIRED"),
    priorInspectionAt: priorContext.inspectedAt,
    currentInspectionAt: currentContext.inspectedAt,
    priorConditionEffectiveAt: prior.createdAt,
    currentConditionEffectiveAt: current.createdAt,
    recordCreatedAt: input.recordCreatedAt,
    timezoneInferred: false,
    chronologyInferredFromRecordOrder: false,
    reauthoredConditionState: false,
    capacityChanged: false,
    provenance: input.provenance,
    version: input.version,
    fingerprint,
    supersedesContinuityId: null,
  };
  const before = r3.conditionStates.length;
  r4.continuities.push(record);
  if (r3.conditionStates.length !== before) fail("CONDITION_HISTORY_REAUTHORED");
  remember(r4, "CONTINUITY", record.continuityId, "CREATED", record.version, fingerprint, input.recordCreatedAt, null, "CURRENT");
  emit(r4, "CONDITION_CONTINUITY_RECORDED", record.continuityId, input.recordCreatedAt, record.version);
  return record;
}

function basisKnown(basis: D1hR4MeasurementBasis): boolean {
  return Object.values(basis).every((value) => typeof value === "string" && value.trim() !== "");
}

function measurementValidationState(r2: D1hR2Store, measurementId: string): "HUMAN_CONFIRMED" | "UNVALIDATED" | "STALE" {
  if (r2Effective(r2, "MEASUREMENT", measurementId) === "STALE") return "STALE";
  const confirmed = r2.validations.some((row) => row.subjectId === measurementId && row.decision === "CONFIRMED" && r2Effective(r2, "VALIDATION", row.validationId) === "CURRENT");
  return confirmed ? "HUMAN_CONFIRMED" : "UNVALIDATED";
}

export type D1hR4ComparisonInput = {
  comparisonId: string;
  priorMeasurementId: string;
  currentMeasurementId: string;
  priorBasis: D1hR4MeasurementBasis;
  currentBasis: D1hR4MeasurementBasis;
  limitations: string;
  authority: string;
  recordCreatedAt: string;
  provenance: D1hProvenanceRef;
  version: string;
};

export function recordMeasurementComparison(r1: D1hR1Store, r2: D1hR2Store, r4: D1hR4Store, input: D1hR4ComparisonInput): D1hR4MeasurementComparison {
  assertScope(input);
  humanAuthority(input.authority);
  if (r4.comparisons.some((row) => row.comparisonId === input.comparisonId)) fail("DUPLICATE_COMPARISON_ID");
  const prior = r2.measurements.find((row) => row.measurementId === input.priorMeasurementId);
  const current = r2.measurements.find((row) => row.measurementId === input.currentMeasurementId);
  if (!prior || !current) fail("MEASUREMENT_UNKNOWN");
  const context = r1.contexts.find((row) => row.inspectionContextId === prior.inspectionContextId);
  if (!context) fail("CONTEXT_UNKNOWN");
  const other = r1.contexts.find((row) => row.inspectionContextId === current.inspectionContextId);
  if (!other) fail("CONTEXT_UNKNOWN");
  if (context.tenantId !== other.tenantId) fail("CROSS_TENANT_ASSOCIATION_REJECTED");
  if (context.projectId !== other.projectId) fail("CROSS_PROJECT_ASSOCIATION_REJECTED");
  assertProvenance(input.provenance, context);
  if (r2Effective(r2, "MEASUREMENT", prior.measurementId) !== "CURRENT" || r2Effective(r2, "MEASUREMENT", current.measurementId) !== "CURRENT") fail("MEASUREMENT_NOT_CURRENT");
  const priorValidationState = measurementValidationState(r2, prior.measurementId);
  const currentValidationState = measurementValidationState(r2, current.measurementId);
  const locationCompatible = prior.location !== null && current.location !== null && prior.location.locationId === current.location.locationId && prior.location.locationKind === current.location.locationKind;
  const methodCompatible = prior.methodRef === current.methodRef && prior.sourceType === current.sourceType;
  const basisCompatible = basisKnown(input.priorBasis) && basisKnown(input.currentBasis) && JSON.stringify(input.priorBasis) === JSON.stringify(input.currentBasis) && input.priorBasis.calibrationBasis === prior.calibrationBasis && input.currentBasis.calibrationBasis === current.calibrationBasis;
  let comparisonStatus: D1hR4Comparability = "COMPARABLE";
  let unitNormalizationRef: string | null = null;
  let rawDifference: number | null = null;
  if (prior.targetId !== current.targetId) comparisonStatus = "TARGET_MISMATCH";
  else if (prior.quantity !== current.quantity) comparisonStatus = "NOT_COMPARABLE_QUANTITY";
  else if (!locationCompatible) comparisonStatus = "NOT_COMPARABLE_LOCATION";
  else if (!methodCompatible) comparisonStatus = "NOT_COMPARABLE_METHOD";
  else if (!basisCompatible) comparisonStatus = "NOT_COMPARABLE_BASIS";
  else {
    try {
      const left = normalizeWithExistingUnitSystem(prior.quantity, prior.value, prior.unit);
      const right = normalizeWithExistingUnitSystem(current.quantity, current.value, current.unit);
      unitNormalizationRef = prior.quantity === "force" ? "toForceN" : prior.quantity === "moment" ? "toMomentNm" : prior.quantity === "distributedForce" ? "toDistributedNpm" : prior.quantity === "stress" ? "toEPa" : "toLengthM";
      rawDifference = right - left;
    } catch {
      if (prior.unit === current.unit) {
        rawDifference = current.value - prior.value;
        unitNormalizationRef = "CANONICAL_UNIT_IDENTITY";
      } else comparisonStatus = "NOT_COMPARABLE_UNIT";
    }
  }
  if (comparisonStatus === "COMPARABLE" && (priorValidationState !== "HUMAN_CONFIRMED" || currentValidationState !== "HUMAN_CONFIRMED")) {
    comparisonStatus = "VALIDATION_STATE_LIMITATION";
    rawDifference = null;
  }
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R4_COMPARISON",
    priorMeasurementId: prior.measurementId,
    currentMeasurementId: current.measurementId,
    quantity: prior.quantity,
    priorUnit: prior.unit,
    currentUnit: current.unit,
    unitNormalizationRef,
    locationCompatible,
    methodCompatible,
    basisCompatible,
    comparisonStatus,
    authority: input.authority,
    version: input.version,
  });
  const record: D1hR4MeasurementComparison = {
    recordKind: "MEASUREMENT_COMPARISON",
    comparisonId: input.comparisonId,
    priorMeasurementId: prior.measurementId,
    currentMeasurementId: current.measurementId,
    targetId: prior.targetId,
    quantity: prior.quantity,
    priorUnit: prior.unit,
    currentUnit: current.unit,
    unitNormalizationRef,
    locationCompatible,
    methodCompatible,
    basisCompatible,
    priorMeasuredAt: prior.measuredAt,
    currentMeasuredAt: current.measuredAt,
    recordCreatedAt: input.recordCreatedAt,
    comparisonStatus,
    rawDifference,
    priorValidationState,
    currentValidationState,
    promoted: false,
    deteriorationRate: null,
    rateComputed: false,
    limitations: required(input.limitations, "LIMITATIONS_REQUIRED"),
    authority: input.authority,
    timezoneInferred: false,
    chronologyInferredFromRecordOrder: false,
    capacityChanged: false,
    provenance: input.provenance,
    version: input.version,
    fingerprint,
    supersedesComparisonId: null,
  };
  r4.comparisons.push(record);
  remember(r4, "COMPARISON", record.comparisonId, "CREATED", record.version, fingerprint, input.recordCreatedAt, null, "CURRENT");
  emit(r4, "MEASUREMENT_COMPARISON_RECORDED", record.comparisonId, input.recordCreatedAt, record.version);
  return record;
}

export function recordChangeEvidence(r4: D1hR4Store, input: { changeEvidenceId: string; comparisonId: string; limitations: string; recordCreatedAt: string; provenance: D1hProvenanceRef; version: string }): D1hR4ChangeEvidence {
  assertScope(input);
  const comparison = r4.comparisons.find((row) => row.comparisonId === input.comparisonId);
  if (!comparison) fail("COMPARISON_UNKNOWN");
  if (r4.changeEvidence.some((row) => row.changeEvidenceId === input.changeEvidenceId)) fail("DUPLICATE_CHANGE_ID");
  assertProvenance(input.provenance, { tenantId: comparison.provenance.tenantId, workspaceId: comparison.provenance.workspaceId, projectId: comparison.provenance.projectId });
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R4_CHANGE",
    comparisonId: comparison.comparisonId,
    priorRef: comparison.priorMeasurementId,
    currentRef: comparison.currentMeasurementId,
    comparability: comparison.comparisonStatus,
    observedDifference: comparison.rawDifference,
    version: input.version,
  });
  const record: D1hR4ChangeEvidence = {
    recordKind: "CHANGE_EVIDENCE",
    changeEvidenceId: input.changeEvidenceId,
    comparisonId: comparison.comparisonId,
    priorRef: comparison.priorMeasurementId,
    currentRef: comparison.currentMeasurementId,
    comparability: comparison.comparisonStatus,
    observedDifference: comparison.rawDifference,
    priorAt: comparison.priorMeasuredAt,
    currentAt: comparison.currentMeasuredAt,
    recordCreatedAt: input.recordCreatedAt,
    limitations: required(input.limitations, "LIMITATIONS_REQUIRED"),
    cause: null,
    deterioration: false,
    deteriorationRate: null,
    repairEffectiveness: false,
    ratingUpdated: false,
    interpretationCreated: false,
    capacityChanged: false,
    provenance: input.provenance,
    version: input.version,
    fingerprint,
  };
  r4.changeEvidence.push(record);
  remember(r4, "CHANGE", record.changeEvidenceId, "CREATED", record.version, fingerprint, input.recordCreatedAt, null, "CURRENT");
  emit(r4, "CHANGE_EVIDENCE_RECORDED", record.changeEvidenceId, input.recordCreatedAt, record.version);
  return record;
}

function identityFingerprint(identity: D1hR4AnalysisIdentityRef): string {
  return fingerprintCanonical({ subject: "D1F_D1G_ANALYSIS_IDENTITY", ...identity });
}

export type D1hR4AnalysisLinkInput = {
  analysisLinkId: string;
  inspectionContextId: string;
  targetId: string;
  evidenceIds: readonly string[];
  findingIds: readonly string[];
  measurementIds: readonly string[];
  conditionStateIds: readonly string[];
  analysisResultId: string;
  inspectionStructuralStateRef: string;
  linkPurpose: (typeof D1H_R4_ANALYSIS_LINK_PURPOSES)[number];
  measurementLocationId: string | null;
  limitations: string;
  authority: string;
  recordCreatedAt: string;
  provenance: D1hProvenanceRef;
  version: string;
};

export function recordAnalysisResultLink(
  r1: D1hR1Store,
  r2: D1hR2Store,
  catalogResults: readonly D1hR1AnalysisResultRef[],
  identities: readonly D1hR4AnalysisIdentityRef[],
  r4: D1hR4Store,
  input: D1hR4AnalysisLinkInput,
): D1hR4AnalysisResultLink {
  assertScope(input);
  humanAuthority(input.authority);
  if (DYNAMIC_REFS.has(input.analysisResultId)) fail("DYNAMIC_LATEST_ANALYSIS_REFERENCE_REJECTED");
  if (!D1H_R4_ANALYSIS_LINK_PURPOSES.includes(input.linkPurpose)) fail("ANALYSIS_LINK_PURPOSE_UNKNOWN");
  if (r4.analysisLinks.some((row) => row.analysisLinkId === input.analysisLinkId)) fail("DUPLICATE_ANALYSIS_LINK_ID");
  const context = r1.contexts.find((row) => row.inspectionContextId === input.inspectionContextId);
  if (!context) fail("CONTEXT_UNKNOWN");
  assertProvenance(input.provenance, context);
  const listed = catalogResults.find((row) => row.analysisResultId === input.analysisResultId);
  if (!listed) fail("ANALYSIS_RESULT_UNKNOWN");
  if (listed.tenantId !== context.tenantId) fail("CROSS_TENANT_BINDING_REJECTED");
  if (listed.projectId !== context.projectId || listed.workspaceId !== context.workspaceId) fail("CROSS_PROJECT_BINDING_REJECTED");
  if (listed.structuralSystemId !== context.structuralSystemId) fail("STRUCTURAL_SYSTEM_MISMATCH");
  const identity = identities.find((row) => row.analysisResultId === input.analysisResultId);
  if (!identity) fail("ANALYSIS_RESULT_UNKNOWN");
  if (DYNAMIC_REFS.has(identity.analysisRunId) || DYNAMIC_REFS.has(identity.analysisModelId)) fail("DYNAMIC_LATEST_ANALYSIS_REFERENCE_REJECTED");
  if (!D1F_ANALYSIS_RESULT_AUTHORITY_STATES.includes(identity.authorityState)) fail("RESULT_AUTHORITY_UNKNOWN");
  if (!D1F_R2_ANALYSIS_RUN_STATUS_STATES.includes(identity.runStatus)) fail("RUN_STATUS_UNKNOWN");
  if (!D1F_RESULT_CATEGORIES.includes(identity.resultCategory)) fail("RESULT_CATEGORY_UNKNOWN");
  if (!D1H_R4_RESULT_CLASSES.includes(identity.resultClass)) fail("RESULT_CLASS_UNKNOWN");
  required(identity.providerId, "PROVIDER_PROVENANCE_REQUIRED");
  required(identity.providerVersion, "PROVIDER_PROVENANCE_REQUIRED");
  required(identity.providerProvenanceRef, "PROVIDER_PROVENANCE_REQUIRED");
  required(identity.analysisModelFingerprint, "ANALYSIS_FINGERPRINT_REQUIRED");
  required(identity.analysisRunFingerprint, "ANALYSIS_FINGERPRINT_REQUIRED");
  if (identity.tenantId !== context.tenantId) fail("CROSS_TENANT_BINDING_REJECTED");
  if (identity.projectId !== context.projectId) fail("CROSS_PROJECT_BINDING_REJECTED");
  for (const measurementId of input.measurementIds) {
    const measurement = r2.measurements.find((row) => row.measurementId === measurementId);
    if (!measurement) fail("MEASUREMENT_UNKNOWN");
    if (measurement.quantity !== identity.quantity) fail("ANALYSIS_MEASUREMENT_QUANTITY_INCOMPATIBLE");
    if (!input.measurementLocationId || measurement.location?.locationId !== input.measurementLocationId) fail("ANALYSIS_MEASUREMENT_LOCATION_INCOMPATIBLE");
  }
  const temporalMismatch = identity.structuralStateRef !== input.inspectionStructuralStateRef || identity.analysisTimestamp !== context.inspectedAt;
  const boundIdentityFingerprint = identityFingerprint(identity);
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R4_ANALYSIS_LINK",
    analysisModelFingerprint: identity.analysisModelFingerprint,
    analysisRunFingerprint: identity.analysisRunFingerprint,
    analysisResultId: identity.analysisResultId,
    resultSetId: identity.resultSetId,
    loadCaseId: identity.loadCaseId,
    combinationId: identity.combinationId,
    locationKind: identity.locationKind,
    authorityState: identity.authorityState,
    inspectionContextId: context.inspectionContextId,
    conditionStateIds: input.conditionStateIds,
    linkPurpose: input.linkPurpose,
    version: input.version,
  });
  const record: D1hR4AnalysisResultLink = {
    recordKind: "ANALYSIS_RESULT_LINK",
    analysisLinkId: input.analysisLinkId,
    inspectionContextId: context.inspectionContextId,
    targetId: input.targetId,
    evidenceIds: input.evidenceIds,
    findingIds: input.findingIds,
    measurementIds: input.measurementIds,
    conditionStateIds: input.conditionStateIds,
    analysisResultId: identity.analysisResultId,
    analysisModelId: identity.analysisModelId,
    analysisModelVersion: identity.analysisModelVersion,
    analysisModelFingerprint: identity.analysisModelFingerprint,
    analysisRunId: identity.analysisRunId,
    analysisRunFingerprint: identity.analysisRunFingerprint,
    resultSetId: identity.resultSetId,
    normalizedResultId: identity.normalizedResultId,
    resultClass: identity.resultClass,
    resultCategory: identity.resultCategory,
    quantity: identity.quantity,
    locationKind: identity.locationKind,
    loadCaseId: identity.loadCaseId,
    combinationId: identity.combinationId,
    providerId: identity.providerId,
    providerVersion: identity.providerVersion,
    providerProvenanceRef: identity.providerProvenanceRef,
    authorityState: identity.authorityState,
    runStatus: identity.runStatus,
    modelValidationEvidenceRef: identity.modelValidationEvidenceRef,
    analysisTimestamp: identity.analysisTimestamp,
    inspectionAt: context.inspectedAt,
    inspectionStructuralStateRef: input.inspectionStructuralStateRef,
    analysisStructuralStateRef: identity.structuralStateRef,
    temporalMismatch,
    contemporaneous: false,
    linkPurpose: input.linkPurpose,
    boundIdentityFingerprint,
    authority: input.authority,
    limitations: required(input.limitations, "LIMITATIONS_REQUIRED"),
    governsCondition: false,
    predictedEqualsMeasured: false,
    agreementEqualsModelValidation: false,
    disagreementDiagnosesDamage: false,
    analysisModelUpdated: false,
    capacityChanged: false,
    recordCreatedAt: input.recordCreatedAt,
    provenance: input.provenance,
    version: input.version,
    fingerprint,
    supersedesAnalysisLinkId: null,
  };
  if (identity.runStatus === "FAILED" || identity.runStatus === "NONCONVERGED" || identity.authorityState === "FAILED_ANALYSIS") {
    if (record.governsCondition !== false) fail("NONCONVERGED_ANALYSIS_CANNOT_GOVERN");
  }
  r4.analysisLinks.push(record);
  remember(r4, "ANALYSIS_LINK", record.analysisLinkId, "CREATED", record.version, fingerprint, input.recordCreatedAt, null, "CURRENT");
  emit(r4, "ANALYSIS_RESULT_LINK_RECORDED", record.analysisLinkId, input.recordCreatedAt, record.version);
  return record;
}

export function correctFindingAssociation(r1: D1hR1Store, r2: D1hR2Store, r4: D1hR4Store, predecessorId: string, input: D1hR4AssociationInput): D1hR4FindingAssociation {
  const prior = r4.associations.find((row) => row.associationId === predecessorId);
  if (!prior) fail("PREDECESSOR_UNKNOWN");
  const snapshot = JSON.stringify(prior);
  if (input.version === prior.version) fail("CORRECTION_VERSION_REQUIRED");
  const successor = recordFindingAssociation(r1, r2, r4, input);
  r4.associations[r4.associations.length - 1]!.supersedesAssociationId = predecessorId;
  if (JSON.stringify(prior) !== snapshot) fail("HISTORICAL_RECORD_MUTATED");
  r4.states.push({ subjectKind: "ASSOCIATION", subjectId: predecessorId, effective: "SUPERSEDED", recordedAt: input.recordCreatedAt });
  emit(r4, "FINDING_ASSOCIATION_SUPERSEDED", predecessorId, input.recordCreatedAt, prior.version);
  return successor;
}

export function correctMeasurementComparison(r1: D1hR1Store, r2: D1hR2Store, r4: D1hR4Store, predecessorId: string, input: D1hR4ComparisonInput): D1hR4MeasurementComparison {
  const prior = r4.comparisons.find((row) => row.comparisonId === predecessorId);
  if (!prior) fail("PREDECESSOR_UNKNOWN");
  const snapshot = JSON.stringify(prior);
  if (input.version === prior.version) fail("CORRECTION_VERSION_REQUIRED");
  const successor = recordMeasurementComparison(r1, r2, r4, input);
  r4.comparisons[r4.comparisons.length - 1]!.supersedesComparisonId = predecessorId;
  if (JSON.stringify(prior) !== snapshot) fail("HISTORICAL_RECORD_MUTATED");
  r4.states.push({ subjectKind: "COMPARISON", subjectId: predecessorId, effective: "SUPERSEDED", recordedAt: input.recordCreatedAt });
  return successor;
}

export function correctConditionContinuity(r1: D1hR1Store, r3: D1hR3Store, r4: D1hR4Store, predecessorId: string, input: D1hR4ContinuityInput): D1hR4ConditionContinuity {
  const prior = r4.continuities.find((row) => row.continuityId === predecessorId);
  if (!prior) fail("PREDECESSOR_UNKNOWN");
  const snapshot = JSON.stringify(prior);
  if (input.version === prior.version) fail("CORRECTION_VERSION_REQUIRED");
  const successor = recordConditionContinuity(r1, r3, r4, input);
  r4.continuities[r4.continuities.length - 1]!.supersedesContinuityId = predecessorId;
  if (JSON.stringify(prior) !== snapshot) fail("HISTORICAL_RECORD_MUTATED");
  r4.states.push({ subjectKind: "CONTINUITY", subjectId: predecessorId, effective: "SUPERSEDED", recordedAt: input.recordCreatedAt });
  return successor;
}

export function correctAnalysisResultLink(
  r1: D1hR1Store,
  r2: D1hR2Store,
  catalogResults: readonly D1hR1AnalysisResultRef[],
  identities: readonly D1hR4AnalysisIdentityRef[],
  r4: D1hR4Store,
  predecessorId: string,
  input: D1hR4AnalysisLinkInput,
): D1hR4AnalysisResultLink {
  const prior = r4.analysisLinks.find((row) => row.analysisLinkId === predecessorId);
  if (!prior) fail("PREDECESSOR_UNKNOWN");
  const snapshot = JSON.stringify(prior);
  if (input.version === prior.version) fail("CORRECTION_VERSION_REQUIRED");
  const successor = recordAnalysisResultLink(r1, r2, catalogResults, identities, r4, input);
  r4.analysisLinks[r4.analysisLinks.length - 1]!.supersedesAnalysisLinkId = predecessorId;
  if (JSON.stringify(prior) !== snapshot) fail("HISTORICAL_RECORD_MUTATED");
  r4.states.push({ subjectKind: "ANALYSIS_LINK", subjectId: predecessorId, effective: "SUPERSEDED", recordedAt: input.recordCreatedAt });
  return successor;
}

export function withdrawAssociationConfirmation(r4: D1hR4Store, associationId: string, recordedAt: string): void {
  const before = r4.associations.length;
  invalidateSubject(r4, "CONFIRMATION_WITHDRAWN", "ASSOCIATION", associationId, recordedAt);
  if (r4.associations.length !== before) fail("WITHDRAWAL_DELETED_SUBJECT");
}

export function withdrawTemporalAuthority(r4: D1hR4Store, kind: SubjectKind, subjectId: string, recordedAt: string): void {
  const before = r4.associations.length + r4.analysisLinks.length;
  invalidateSubject(r4, "AUTHORITY_WITHDRAWN", kind, subjectId, recordedAt);
  if (r4.associations.length + r4.analysisLinks.length !== before) fail("WITHDRAWAL_DELETED_SUBJECT");
}

export function propagateTemporalStaleness(
  r1: D1hR1Store,
  r2: D1hR2Store,
  r3: D1hR3Store,
  identities: readonly D1hR4AnalysisIdentityRef[],
  r4: D1hR4Store,
  recordedAt: string,
): void {
  const findingStale = (id: string) => ["STALE", "SUPERSEDED"].includes(r2Effective(r2, "FINDING", id));
  const measurementStale = (id: string) => ["STALE", "SUPERSEDED"].includes(r2Effective(r2, "MEASUREMENT", id));
  const targetStale = (id: string) => currentD1hR1Effective(r1, "TARGET", id) === "STALE";
  const contextInvalid = (id: string) => currentD1hR1Effective(r1, "CONTEXT", id) !== "CURRENT";
  for (const association of r4.associations) {
    const cause: D1hR4InvalidationCause | null = contextInvalid(association.sourceInspectionContextId) || contextInvalid(association.relatedInspectionContextId)
      ? "CONTEXT_INVALID"
      : targetStale(association.targetId)
        ? "TARGET_STALE"
        : findingStale(association.sourceFindingId) || findingStale(association.relatedFindingId)
          ? "FINDING_CHANGED"
          : null;
    if (cause) invalidateSubject(r4, cause, "ASSOCIATION", association.associationId, recordedAt);
  }
  for (const comparison of r4.comparisons) {
    const cause: D1hR4InvalidationCause | null = targetStale(comparison.targetId)
      ? "TARGET_STALE"
      : measurementStale(comparison.priorMeasurementId) || measurementStale(comparison.currentMeasurementId)
        ? "MEASUREMENT_CHANGED"
        : null;
    if (cause) {
      invalidateSubject(r4, cause, "COMPARISON", comparison.comparisonId, recordedAt);
      for (const change of r4.changeEvidence) if (change.comparisonId === comparison.comparisonId) invalidateSubject(r4, cause, "CHANGE", change.changeEvidenceId, recordedAt);
    }
  }
  for (const continuity of r4.continuities) {
    const schemeKey = continuity.priorRatingSchemeId && continuity.priorSchemeVersion ? `${continuity.priorRatingSchemeId}@${continuity.priorSchemeVersion}` : null;
    const currentKey = continuity.currentRatingSchemeId && continuity.currentSchemeVersion ? `${continuity.currentRatingSchemeId}@${continuity.currentSchemeVersion}` : null;
    const cause: D1hR4InvalidationCause | null = targetStale(continuity.targetId)
      ? "TARGET_STALE"
      : r3.conditionStates.some((row) => row.supersedesConditionStateId === continuity.priorConditionStateId || row.supersedesConditionStateId === continuity.currentConditionStateId) || r3Effective(r3, "CONDITION_STATE", continuity.priorConditionStateId) === "STALE" || r3Effective(r3, "CONDITION_STATE", continuity.currentConditionStateId) === "STALE"
        ? "CONDITION_STATE_CHANGED"
        : (schemeKey && r3Effective(r3, "SCHEME", schemeKey) === "STALE") || (currentKey && r3Effective(r3, "SCHEME", currentKey) === "STALE")
          ? "RATING_SCHEME_CHANGED"
          : null;
    if (cause) invalidateSubject(r4, cause, "CONTINUITY", continuity.continuityId, recordedAt);
  }
  for (const link of r4.analysisLinks) {
    const identity = identities.find((row) => row.analysisResultId === link.analysisResultId && row.analysisRunId === link.analysisRunId);
    const changed = !identity || identityFingerprint(identity) !== link.boundIdentityFingerprint || identity.authorityState === "STALE" || identity.authorityState === "INVALID";
    if (changed || targetStale(link.targetId)) invalidateSubject(r4, changed ? "ANALYSIS_RESULT_CHANGED" : "TARGET_STALE", "ANALYSIS_LINK", link.analysisLinkId, recordedAt);
  }
}

export function temporalProvenance(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, r4: D1hR4Store, continuityId: string): readonly string[] {
  const continuity = r4.continuities.find((row) => row.continuityId === continuityId);
  if (!continuity) fail("CONTINUITY_UNKNOWN");
  const chain = [`target:${continuity.targetId}`];
  for (const stateId of [continuity.priorConditionStateId, continuity.currentConditionStateId]) {
    const state = r3.conditionStates.find((row) => row.conditionStateId === stateId);
    if (!state) continue;
    chain.push(`context:${state.inspectionContextId}`);
    for (const coverage of r1.coverages.filter((row) => row.inspectionContextId === state.inspectionContextId && row.targetId === state.targetId)) chain.push(`coverage:${coverage.coverageId}`);
    for (const evidenceId of state.supportingEvidenceIds) chain.push(`evidence:${evidenceId}`);
    for (const findingId of state.supportingFindingIds) chain.push(`finding:${findingId}`);
    for (const measurementId of state.supportingMeasurementIds) chain.push(`measurement:${measurementId}`);
    for (const validation of r2.validations.filter((row) => state.relevantValidationIds.includes(row.validationId))) chain.push(`validation:${validation.validationId}`);
    chain.push(`condition:${state.conditionStateId}`);
  }
  for (const associationId of continuity.associationIds) chain.push(`association:${associationId}`);
  chain.push(`continuity:${continuity.continuityId}`);
  for (const comparisonId of continuity.comparisonIds) chain.push(`comparison:${comparisonId}`);
  for (const change of r4.changeEvidence.filter((row) => continuity.comparisonIds.includes(row.comparisonId))) chain.push(`change:${change.changeEvidenceId}`);
  for (const link of r4.analysisLinks.filter((row) => row.conditionStateIds.includes(continuity.currentConditionStateId) || row.conditionStateIds.includes(continuity.priorConditionStateId))) {
    chain.push(`analysis-link:${link.analysisLinkId}`);
    chain.push(`analysis-result:${link.analysisResultId}`);
    chain.push(`analysis-run:${link.analysisRunId}`);
  }
  return chain;
}

export function d1iTemporalReference(r4: D1hR4Store, continuityId: string): {
  continuityId: string;
  targetId: string;
  conditionStateIds: readonly string[];
  associationIds: readonly string[];
  comparisonIds: readonly string[];
  fingerprint: string;
  copiedEvidence: false;
  reauthorsHistory: false;
} {
  const continuity = r4.continuities.find((row) => row.continuityId === continuityId);
  if (!continuity) fail("CONTINUITY_UNKNOWN");
  return {
    continuityId: continuity.continuityId,
    targetId: continuity.targetId,
    conditionStateIds: [continuity.priorConditionStateId, continuity.currentConditionStateId],
    associationIds: continuity.associationIds,
    comparisonIds: continuity.comparisonIds,
    fingerprint: continuity.fingerprint,
    copiedEvidence: false,
    reauthorsHistory: false,
  };
}

export function evaluateTemporalAssociation(
  r1: D1hR1Store,
  r2: D1hR2Store,
  r3: D1hR3Store,
  identities: readonly D1hR4AnalysisIdentityRef[],
  r4: D1hR4Store,
  input: {
    resultId: string;
    inspectionContextIds: readonly string[];
    declaredAssociationIds: readonly string[];
    declaredContinuityIds: readonly string[];
    declaredComparisonIds: readonly string[];
    declaredChangeEvidenceIds: readonly string[];
    declaredAnalysisLinkIds: readonly string[];
    scope: string;
    provenance: D1hProvenanceRef;
  },
): D1hR4RuntimeResult {
  propagateTemporalStaleness(r1, r2, r3, identities, r4, input.provenance.timestamp);
  const declared = [
    ...input.declaredAssociationIds.map((id) => ["ASSOCIATION", id] as const),
    ...input.declaredContinuityIds.map((id) => ["CONTINUITY", id] as const),
    ...input.declaredComparisonIds.map((id) => ["COMPARISON", id] as const),
    ...input.declaredChangeEvidenceIds.map((id) => ["CHANGE", id] as const),
    ...input.declaredAnalysisLinkIds.map((id) => ["ANALYSIS_LINK", id] as const),
  ];
  const missing = declared.filter(([kind, id]) => fingerprintOf(r4, kind, id) === "");
  const stale = declared.some(([kind, id]) => fingerprintOf(r4, kind, id) !== "" && effectiveOf(r4, kind, id) === "STALE");
  const diagnostics: { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[] = [];
  let completeness: D1hR4Completeness = "COMPLETE_FOR_DECLARED_TEMPORAL_SCOPE";
  if (stale) completeness = "STALE";
  else if (declared.length === 0) completeness = "UNDETERMINED";
  else if (missing.length === declared.length) completeness = "INCOMPLETE";
  else if (missing.length > 0) {
    completeness = "PARTIAL";
    diagnostics.push({ kind: "RUNTIME_DIAGNOSTIC", code: "DECLARED_SUBJECT_MISSING", structuralFinding: false });
  }
  const fingerprint = fingerprintCanonical({ subject: "D1H_R4_RESULT", ...input, completeness });
  return {
    resultId: input.resultId,
    inspectionContextIds: input.inspectionContextIds,
    targetIds: [...new Set(r4.associations.map((row) => row.targetId).concat(r4.continuities.map((row) => row.targetId)))],
    associationIds: input.declaredAssociationIds,
    continuityIds: input.declaredContinuityIds,
    comparisonIds: input.declaredComparisonIds,
    changeEvidenceIds: input.declaredChangeEvidenceIds,
    analysisLinkIds: input.declaredAnalysisLinkIds,
    scope: input.scope,
    completeness,
    runtimeDiagnostics: diagnostics,
    blockingRuntimeDiagnostics: [],
    warnings: [],
    provenance: input.provenance,
    fingerprint,
    deteriorationAssessment: false,
    causalDiagnosis: false,
    structuralAdequacy: false,
  };
}
