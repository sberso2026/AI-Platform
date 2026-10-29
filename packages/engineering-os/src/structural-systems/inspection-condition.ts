/**
 * EOS-D1H-R3 bounded condition state, profile-bound rating, and engineering interpretation.
 * Reuses D1H-R1 evidence and D1H-R2 finding, measurement, and human-validation records.
 * Rating schemes are explicit catalog identities. This runtime does not select, average,
 * translate, or aggregate ratings, and it does not assess structural adequacy.
 */
import type { D1hProvenanceRef, D1hTargetKind } from "@rtb/types";
import { D1H_HUMAN_ROLES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D1hR1Store } from "./inspection-evidence";
import { currentD1hR1Effective } from "./inspection-evidence";
import type { D1hR2Store, D1hR2ValidatorAuthorization } from "./inspection-finding";

export const D1H_R3_MATURITY_STATE = "STRUCTURAL_CONDITION_STATE_RATING_INTERPRETATION_RUNTIME_IMPLEMENTED" as const;
export const D1H_R3_CONDITION_STATE_RUNTIME_COUNT = 1 as const;
export const D1H_R3_CONDITION_RATING_RUNTIME_COUNT = 1 as const;
export const D1H_R3_ENGINEERING_INTERPRETATION_RUNTIME_COUNT = 1 as const;
export const D1H_R3_AUTOMATIC_RATING_ENGINE_COUNT = 0 as const;
export const D1H_R3_SEVERITY_RUNTIME_COUNT = 0 as const;
export const D1H_R3_CAPACITY_ASSESSMENT_RUNTIME_COUNT = 0 as const;
export const D1H_R3_REPAIR_DESIGN_RUNTIME_COUNT = 0 as const;
export const D1H_R3_REPAIR_RECOMMENDATION_ENGINE_COUNT = 0 as const;
export const D1H_R3_REPAIR_DESIGN_ENGINE_COUNT = 0 as const;
export const D1H_R3_FITNESS_FOR_SERVICE_ENGINE_COUNT = 0 as const;
export const D1H_R3_CORROSION_RATE_ENGINE_COUNT = 0 as const;
export const D1H_R3_FATIGUE_LIFE_ENGINE_COUNT = 0 as const;
export const D1H_R3_REMAINING_LIFE_ENGINE_COUNT = 0 as const;
export const D1H_R3_CRACK_GROWTH_ENGINE_COUNT = 0 as const;
export const D1H_R3_DIGITAL_TWIN_RUNTIME_COUNT = 0 as const;
export const D1H_R3_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1H_R3_AI_RATING_ENGINE_COUNT = 0 as const;
export const D1H_R3_AI_CONDITION_ENGINE_COUNT = 0 as const;
export const D1H_R3_CROSS_INSPECTION_ASSOCIATION_RUNTIME_COUNT = 0 as const;
export const D1H_R3_CONDITION_TREND_PREDICTION_COUNT = 0 as const;
export const FINDING_EQUALS_CONDITION_RATING = false as const;
export const MEASUREMENT_EQUALS_CONDITION_RATING = false as const;
export const CONDITION_RATING_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const CONDITION_RATING_EQUALS_MEMBER_CAPACITY = false as const;
export const CONDITION_RATING_EQUALS_ASSET_SAFE = false as const;
export const CONDITION_RATING_EQUALS_REPAIR_REQUIRED = false as const;
export const D1H_R3_RATING_WITHOUT_SCHEME_ALLOWED = false as const;
export const D1H_R3_RATING_SCHEME_VERSION_REQUIRED = true as const;
export const D1H_R3_UNIVERSAL_RATING_SCALE_CREATED = false as const;
export const D1H_R3_CROSS_SCHEME_NUMERIC_COMPARISON_ALLOWED = false as const;
export const D1H_R3_CROSS_SCHEME_AUTOMATIC_TRANSLATION_ALLOWED = false as const;
export const D1H_R3_CROSS_SCHEME_AVERAGING_ALLOWED = false as const;
export const D1H_R3_CROSS_SCHEME_NORMALIZATION_ALLOWED = false as const;
export const D1H_R3_CROSS_SCHEME_ORDERING_ASSUMED_EQUIVALENT = false as const;
export const D1H_R3_FINDING_AUTO_SELECTS_RATING = false as const;
export const D1H_R3_MEASUREMENT_AUTO_SELECTS_RATING = false as const;
export const D1H_R3_AI_AUTO_SELECTS_RATING = false as const;
export const D1H_R3_NO_FINDING_AUTO_SELECTS_GOOD_RATING = false as const;
export const D1H_R3_DEFECT_COUNT_AUTO_SELECTS_RATING = false as const;
export const D1H_R3_RATING_SCHEME_AUTHORITY_REQUIRED = true as const;
export const D1H_R3_RATING_SCHEME_INFERRED_FROM_LOCATION = false as const;
export const D1H_R3_RATING_SCHEME_SELECTED_BY_AI = false as const;
export const D1H_R3_NUMERIC_RATING_TREATED_AS_CONTINUOUS_QUANTITY = false as const;
export const D1H_R3_NUMERIC_RATING_AUTOMATICALLY_AVERAGED = false as const;
export const D1H_R3_RATING_ORDER_INFERRED_FROM_LABEL = false as const;
export const D1H_R3_R1_TARGET_REUSED = true as const;
export const PARALLEL_CONDITION_TARGET_MODEL_CREATED = false as const;
export const D1H_R3_TARGET_LEVEL_EXPLICIT = true as const;
export const D1H_R3_MEMBER_RATINGS_AUTO_CREATE_SYSTEM_RATING = false as const;
export const D1H_R3_WORST_MEMBER_AUTO_DEFINES_SYSTEM_RATING = false as const;
export const D1H_R3_AVERAGE_MEMBER_RATING_AUTO_DEFINES_SYSTEM_RATING = false as const;
export const D1H_R3_CONDITION_STATE_AUTHORITY_REQUIRED = true as const;
export const AI_CONDITION_STATE_AUTHORITY = false as const;
export const D1H_R3_CURRENT_STATE_HISTORY_PRESERVED = true as const;
export const D1H_R3_NO_FINDING_EQUALS_GOOD_CONDITION = false as const;
export const D1H_R3_NO_FINDING_AUTO_CREATES_GOOD_RATING = false as const;
export const D1H_R3_COVERAGE_CONTEXT_PRESERVED = true as const;
export const D1H_R3_FULL_COVERAGE_EQUALS_GOOD_RATING = false as const;
export const D1H_R3_PARTIAL_COVERAGE_AUTO_DEGRADES_RATING = false as const;
export const D1H_R3_INACCESSIBLE_AUTO_DEGRADES_RATING = false as const;
export const D1H_R3_FINDING_REFERENCE_TRACEABLE = true as const;
export const D1H_R3_FINDING_REFERENCE_AUTO_DETERMINES_RATING = false as const;
export const D1H_R3_MEASUREMENT_REFERENCE_TRACEABLE = true as const;
export const D1H_R3_MEASUREMENT_VALUE_AUTO_DETERMINES_RATING = false as const;
export const D1H_R3_EVIDENCE_REFERENCE_TRACEABLE = true as const;
export const D1H_R3_UNVALIDATED_INPUT_AUTO_PROMOTED = false as const;
export const D1H_R3_MORE_VALIDATIONS_EQUALS_HIGHER_RATING = false as const;
export const D1H_R3_MORE_VALIDATIONS_EQUALS_HIGHER_CONFIDENCE = false as const;
export const D1H_R3_ENGINEERING_INTERPRETATION_AUTHORITY_REQUIRED = true as const;
export const AI_ENGINEERING_INTERPRETATION_CAN_GOVERN = false as const;
export const D1H_R3_AI_DRAFT_INTERPRETATION_ALLOWED = true as const;
export const D1H_R3_AI_DRAFT_AUTO_PROMOTED = false as const;
export const D1H_R3_INTERPRETATION_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1H_R3_INTERPRETATION_EQUALS_CAPACITY_ASSESSMENT = false as const;
export const D1H_R3_INTERPRETATION_EQUALS_REPAIR_APPROVAL = false as const;
export const D1H_R3_ENGINEERING_BASIS_TRACEABLE = true as const;
export const LLM_MEMORY_ONLY_ENGINEERING_BASIS_ALLOWED = false as const;
export const D1H_R3_RATING_AUTHORITY_REQUIRED = true as const;
export const D1H_R3_IMPORTED_RATING_WITH_UNKNOWN_SCHEME_CAN_GOVERN = false as const;
export const D1H_R3_RATING_SCHEME_CHANGE_PROPAGATES_STALE = true as const;
export const D1H_R3_SCHEME_A_TO_SCHEME_B_AUTO_CONVERSION = false as const;
export const D1H_R3_MEMBER_RATING_AVERAGE_IMPLEMENTED = false as const;
export const D1H_R3_SYSTEM_RATING_AVERAGE_IMPLEMENTED = false as const;
export const D1H_R3_AUTOMATIC_WORST_RATING_SELECTION = false as const;
export const D1H_R3_SEVERITY_EQUALS_CONDITION_RATING = false as const;
export const D1H_R3_AI_CONFIDENCE_EQUALS_SEVERITY = false as const;
export const D1H_R3_EXISTING_SEVERITY_SEMANTICS = "D1hSeverityRecord is architecture-only and remains separate from condition rating. Inspection-intelligence defect severity is a generic defect field, not a structural severity runtime." as const;
export const D1H_R3_EXISTING_RATING_SCHEME_INVENTORY = "inspection-intelligence ConditionRatingScheme identities: structural_ordinal_1_5 version 1.0.0 pack structural_condition; generic_numeric_0_100 version 1.0.0 pack generic. Cross-scheme compatibility is rejected by that platform. This runtime does not register either scheme as a default and does not call component aggregation." as const;
export const D1H_R3_CONDITION_STATE_CREATION_RULES = "Explicit target, authority, limitations, provenance, and coverage are required. A rating requires a registered scheme version and a scheme-defined value code. A governing current state requires a human authority and either a governing human interpretation or an explicit assessment basis." as const;
export const D1H_R3_UNRATED_CONDITION_STATE_POLICY = "DRAFT and UNRATED condition states may omit a rating. They still require an explicit assessment basis and must not be described as good condition." as const;
export const D1H_R3_RATING_INTERPRETATION_REQUIREMENT = "A rating may omit a full engineering interpretation when an explicit assessment basis reference is recorded. The basis is not structural adequacy." as const;
export const D1H_R3_CONDITION_STATE_AUTO_CHANGES_SECTION_PROPERTY = false as const;
export const D1H_R3_CONDITION_STATE_AUTO_CHANGES_MATERIAL_PROPERTY = false as const;
export const D1H_R3_CONDITION_STATE_AUTO_CHANGES_CAPACITY = false as const;
export const D1H_R3_CONDITION_STATE_AUTO_CHANGES_ANALYSIS_MODEL = false as const;
export const D1H_R3_CONDITION_STATE_AUTO_CHANGES_SUPPORT = false as const;
export const D1H_R3_CONDITION_STATE_AUTO_CHANGES_RELEASE = false as const;
export const D1H_R3_CONDITION_STATE_AUTO_CHANGES_LOAD = false as const;
export const D1H_R3_RATING_AUTO_CREATES_ANALYSIS_INPUT = false as const;
export const D1H_R3_MEASURED_SECTION_LOSS_AUTO_UPDATES_DESIGN_SECTION = false as const;
export const D1H_R3_RATING_AUTO_CREATES_REPAIR_ACTION = false as const;
export const D1H_R3_AUTOMATIC_SAFE_UNSAFE_CLASSIFICATION = false as const;
export const D1H_R3_GOOD_RATING_EQUALS_SAFE = false as const;
export const D1H_R3_POOR_RATING_EQUALS_UNSAFE = false as const;
export const D1H_R3_ANALYSIS_RESULT_EQUALS_CONDITION_RATING = false as const;
export const D1H_R3_ANALYSIS_RESULT_AUTO_SELECTS_RATING = false as const;
export const D1H_R3_ANALYSIS_PREDICTION_EQUALS_OBSERVED_CONDITION = false as const;
export const D1H_R3_ANALYSIS_PREDICTION_EQUALS_MEASUREMENT = false as const;
export const D1H_R3_R2_HUMAN_VALIDATION_REUSED = true as const;
export const PARALLEL_CONDITION_VALIDATION_PLATFORM_CREATED = false as const;
export const VALIDATED_CONDITION_RATING_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const VALIDATED_CONDITION_STATE_EQUALS_ASSET_SAFE = false as const;
export const D1H_R3_REVIEW_INDEPENDENCE_INFERRED = false as const;
export const D1H_R3_SELF_REVIEW_POLICY = "Validator identity and workflow role are preserved. This runtime does not impose a universal self-review prohibition and does not claim independence." as const;
export const NEW_INTERPRETATION_OVERWRITES_PRIOR_INTERPRETATION = false as const;
export const NEW_RATING_OVERWRITES_PRIOR_RATING = false as const;
export const NEW_CONDITION_STATE_OVERWRITES_PRIOR_STATE = false as const;
export const D1H_R3_SAME_DEFECT_ACROSS_INSPECTIONS_INFERRED = false as const;
export const D1H_R3_CONDITION_STATE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R3_CONDITION_RATING_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R3_INTERPRETATION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R3_RATING_SCHEME_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R3_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1H_R3_INTERPRETATION_PROVENANCE_COMPLETE = true as const;
export const D1H_R3_RATING_PROVENANCE_COMPLETE = true as const;
export const D1H_R3_CONDITION_STATE_PROVENANCE_COMPLETE = true as const;
export const D1H_R3_R1_R2_STALENESS_PROPAGATES = true as const;
export const D1H_R3_SCHEME_VERSION_CHANGE_INVALIDATES_DEPENDENT_STATE = true as const;
export const D1H_R3_INTERPRETATION_CHANGE_INVALIDATES_DEPENDENT_RATING_WHERE_LINKED = true as const;
export const D1H_R3_VALIDATION_WITHDRAWAL_DELETES_CONDITION = false as const;
export const D1H_R3_CONFLICTING_MEASUREMENTS_AUTOMATICALLY_AVERAGED = false as const;
export const D1H_R3_CONFLICTING_FINDINGS_AUTOMATICALLY_RESOLVED = false as const;
export const D1H_R3_CONFLICTING_INTERPRETATIONS_AUTOMATICALLY_MERGED = false as const;
export const D1H_R3_COMPLETE_EQUALS_GOOD_CONDITION = false as const;
export const D1H_R3_COMPLETE_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1H_R3_RUNTIME_DIAGNOSTIC_EQUALS_STRUCTURAL_FINDING = false as const;
export const D1H_R3_RUNTIME_RESULT_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1H_R3_RUNTIME_RESULT_EQUALS_REPAIR_APPROVAL = false as const;
export const D1H_R3_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1H_R3_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1H_R3_AI_ENGINEERING_AUTHORITY_CREATED = false as const;
export const D1H_R3_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1H_R3_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1H_R3_RATING_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1H_R3_INTERPRETATION_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1H_R3_TEST_SCHEME_EXPOSED_AS_PRODUCTION_DEFAULT = false as const;
export const D1H_R3_D1I_REFERENCE_READINESS = true as const;
export const D1H_R4_HANDOFF_READY = true as const;
export const D1H_R3_EXISTING_CONDITION_RATING_PLATFORM_REUSED = true as const;
export const PARALLEL_CONDITION_RATING_PLATFORM_CREATED = false as const;
export const PRODUCTION_DEFAULT_RATING_SCHEME_ID = null;

export const D1H_R3_CONDITION_EFFECTIVE_STATES = ["CURRENT", "HISTORICAL", "SUPERSEDED", "STALE", "INVALID"] as const;
export type D1hR3EffectiveState = (typeof D1H_R3_CONDITION_EFFECTIVE_STATES)[number];
export const D1H_R3_COMPLETENESS_STATES = ["COMPLETE_FOR_DECLARED_CONDITION_SCOPE", "PARTIAL", "INCOMPLETE", "INVALID", "STALE", "UNDETERMINED"] as const;
export type D1hR3Completeness = (typeof D1H_R3_COMPLETENESS_STATES)[number];
export const D1H_R3_CONDITION_VALIDATION_SUBJECTS = ["CONDITION_STATE", "CONDITION_RATING", "ENGINEERING_INTERPRETATION"] as const;
export const D1H_R3_EVENTS = [
  "ENGINEERING_INTERPRETATION_RECORDED",
  "ENGINEERING_INTERPRETATION_SUPERSEDED",
  "CONDITION_RATING_RECORDED",
  "CONDITION_RATING_SUPERSEDED",
  "CONDITION_STATE_RECORDED",
  "CONDITION_STATE_SUPERSEDED",
  "CONDITION_STATE_INVALIDATED",
] as const;
export const D1H_R3_INVALIDATION_CAUSES = [
  "SUPPORTING_EVIDENCE_STALE",
  "FINDING_STALE_OR_CORRECTED",
  "MEASUREMENT_STALE_OR_CORRECTED",
  "VALIDATION_WITHDRAWN",
  "INTERPRETATION_CORRECTED",
  "RATING_SCHEME_CHANGED",
  "RATING_SCHEME_APPLICABILITY_CHANGED",
  "TARGET_STALE",
  "COVERAGE_CORRECTED",
  "CONTEXT_SUPERSEDED",
  "AUTHORITY_WITHDRAWN",
] as const;
export type D1hR3InvalidationCause = (typeof D1H_R3_INVALIDATION_CAUSES)[number];
export const D1H_R4_REQUIRED_R3_CONTRACTS = [
  "inspectionContextIdentity",
  "structuralTargetIdentity",
  "coverageIdentity",
  "evidenceIdentity",
  "findingIdentity",
  "measurementIdentity",
  "humanValidationIdentity",
  "engineeringInterpretationIdentity",
  "ratingSchemeIdentityVersion",
  "conditionRatingIdentity",
  "conditionStateIdentity",
  "authority",
  "provenance",
  "fingerprints",
  "history",
  "supersession",
  "invalidation",
  "completeness",
] as const;

export type D1hR3RatingValueDefinition = {
  code: string;
  label: string;
  descriptionRef: string | null;
  explicitOrder: number | null;
};

export type D1hR3SchemeApplicability = {
  projectId: string | null;
  assetOwnerRef: string | null;
  clientRef: string | null;
  inspectionStandardRef: string | null;
  assetClass: string | null;
  targetKinds: readonly D1hTargetKind[];
};

export type D1hR3ConditionRatingScheme = {
  recordKind: "CONDITION_RATING_SCHEME";
  ratingSchemeId: string;
  schemeVersion: string;
  profileRef: string;
  schemeAuthority: string;
  applicability: D1hR3SchemeApplicability;
  ratingValueDefinitions: readonly D1hR3RatingValueDefinition[];
  provenance: D1hProvenanceRef;
  fingerprint: string;
  status: "GOVERNED" | "TEST_ONLY";
  productionDefault: false;
  universalScale: false;
  continuousQuantity: false;
};

export type D1hR3InputValidationSummary = {
  subjectKind: "EVIDENCE" | "FINDING" | "MEASUREMENT";
  subjectId: string;
  validationState: "UNVALIDATED" | "HUMAN_CONFIRMED";
  promoted: false;
};

export type D1hR3EngineeringInterpretation = {
  recordKind: "ENGINEERING_INTERPRETATION";
  interpretationId: string;
  inspectionContextId: string;
  targetId: string;
  supportingEvidenceIds: readonly string[];
  supportingFindingIds: readonly string[];
  supportingMeasurementIds: readonly string[];
  supportingValidationIds: readonly string[];
  authorId: string;
  reviewerId: string | null;
  statement: string;
  basisRefs: readonly string[];
  limitations: string;
  assumptions: string;
  createdAt: string;
  authority: "HUMAN" | "AI_DRAFT";
  governs: boolean;
  structuralAdequacy: false;
  capacityAssessment: false;
  repairApproval: false;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesInterpretationId: string | null;
};

export type D1hR3ConditionRating = {
  recordKind: "CONDITION_RATING";
  ratingId: string;
  inspectionContextId: string;
  targetId: string;
  ratingSchemeId: string;
  schemeVersion: string;
  schemeFingerprint: string;
  ratingValueCode: string;
  numericQuantity: false;
  averaged: false;
  interpretationId: string | null;
  assessmentBasisRef: string;
  supportingEvidenceIds: readonly string[];
  supportingFindingIds: readonly string[];
  supportingMeasurementIds: readonly string[];
  limitations: string;
  assessedAt: string;
  authority: string;
  governs: boolean;
  structuralAdequacy: false;
  assetSafe: false;
  repairRequired: false;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesRatingId: string | null;
};

export type D1hR3ConditionState = {
  recordKind: "CONDITION_STATE";
  conditionStateId: string;
  inspectionContextId: string;
  inspectionSessionId: string;
  targetId: string;
  targetKind: D1hTargetKind;
  assessmentScope: string;
  ratingSchemeId: string | null;
  schemeVersion: string | null;
  schemeFingerprint: string | null;
  ratingId: string | null;
  ratingValueCode: string | null;
  interpretationId: string | null;
  assessmentBasisRef: string;
  supportingFindingIds: readonly string[];
  supportingMeasurementIds: readonly string[];
  supportingEvidenceIds: readonly string[];
  relevantValidationIds: readonly string[];
  coverageIds: readonly string[];
  coverageLimitations: readonly string[];
  inputValidation: readonly D1hR3InputValidationSummary[];
  allInputsValidated: boolean;
  authority: string;
  status: "DRAFT" | "UNRATED" | "CURRENT";
  limitations: string;
  createdAt: string;
  createdBy: string;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesConditionStateId: string | null;
  goodCondition: false;
  structuralAdequacy: false;
  assetSafe: false;
  repairRequired: false;
  sectionPropertyChanged: false;
  materialPropertyChanged: false;
  capacityChanged: false;
  analysisModelChanged: false;
  supportChanged: false;
  releaseChanged: false;
  loadChanged: false;
  analysisInputCreated: false;
  repairActionCreated: false;
};

export type D1hR3ConditionValidation = {
  recordKind: "HUMAN_VALIDATION";
  validationId: string;
  subjectType: (typeof D1H_R3_CONDITION_VALIDATION_SUBJECTS)[number];
  subjectId: string;
  subjectVersion: string;
  scopeStatement: string;
  validatorId: string;
  role: (typeof D1H_HUMAN_ROLES)[number];
  validatedAt: string;
  decision: "CONFIRMED" | "REJECTED" | "NEEDS_CORRECTION" | "SUPERSEDED";
  limitations: string;
  authority: string;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesValidationId: string | null;
  structuralAdequacy: false;
  assetSafe: false;
  independenceClaimed: false;
  professionalRegistrationInferred: false;
};

type SubjectKind = "SCHEME" | "INTERPRETATION" | "RATING" | "CONDITION_STATE" | "VALIDATION";

export type D1hR3Store = {
  schemes: D1hR3ConditionRatingScheme[];
  interpretations: D1hR3EngineeringInterpretation[];
  ratings: D1hR3ConditionRating[];
  conditionStates: D1hR3ConditionState[];
  validations: D1hR3ConditionValidation[];
  history: Array<{ historyId: string; subjectKind: SubjectKind; subjectId: string; action: string; version: string; fingerprint: string; recordedAt: string; predecessorId: string | null }>;
  states: Array<{ subjectKind: SubjectKind; subjectId: string; effective: D1hR3EffectiveState; recordedAt: string }>;
  invalidations: Array<{ invalidationId: string; cause: D1hR3InvalidationCause; subjectKind: SubjectKind; subjectId: string; recordedAt: string; deletesSubject: false }>;
  events: Array<{ eventId: string; eventType: (typeof D1H_R3_EVENTS)[number]; subjectId: string; recordedAt: string; engineeringApproval: false }>;
};

export type D1hR3RuntimeResult = {
  resultId: string;
  inspectionContextId: string;
  targetIds: readonly string[];
  interpretationIds: readonly string[];
  ratingIds: readonly string[];
  conditionStateIds: readonly string[];
  scope: string;
  completeness: D1hR3Completeness;
  runtimeDiagnostics: readonly { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[];
  blockingRuntimeDiagnostics: readonly { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[];
  warnings: readonly string[];
  provenance: D1hProvenanceRef;
  fingerprint: string;
  structuralAdequacy: false;
  repairApproval: false;
  goodCondition: false;
};

const FORBIDDEN_SCOPE_KEYS = [
  "geographicLocation",
  "jurisdiction",
  "fileName",
  "aiRecommendation",
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
  "rollupToSystem",
  "averageRatings",
  "worstRating",
] as const;

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

function sorted(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
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
  if (provenance.workspaceId !== scope.workspaceId || provenance.projectId !== scope.projectId) fail("CROSS_PROJECT_BINDING_REJECTED");
}

function contextOf(r1: D1hR1Store, inspectionContextId: string) {
  const context = r1.contexts.find((row) => row.inspectionContextId === inspectionContextId);
  if (!context) fail("CONTEXT_UNKNOWN");
  return context;
}

function effectiveOf(store: D1hR3Store, kind: SubjectKind, subjectId: string): D1hR3EffectiveState {
  const rows = store.states.filter((row) => row.subjectKind === kind && row.subjectId === subjectId);
  return rows.length === 0 ? "CURRENT" : rows[rows.length - 1]!.effective;
}

function remember(store: D1hR3Store, kind: SubjectKind, subjectId: string, action: string, version: string, fingerprint: string, recordedAt: string, predecessorId: string | null, effective: D1hR3EffectiveState): void {
  store.history.push({ historyId: `${kind}:${subjectId}:${action}:${version}`, subjectKind: kind, subjectId, action, version, fingerprint, recordedAt, predecessorId });
  store.states.push({ subjectKind: kind, subjectId, effective, recordedAt });
}

function emit(store: D1hR3Store, eventType: (typeof D1H_R3_EVENTS)[number], subjectId: string, recordedAt: string, version: string): void {
  store.events.push({ eventId: `${eventType}:${subjectId}:${version}`, eventType, subjectId, recordedAt, engineeringApproval: false });
}

function invalidateSubject(store: D1hR3Store, cause: D1hR3InvalidationCause, kind: SubjectKind, subjectId: string, recordedAt: string): void {
  if (effectiveOf(store, kind, subjectId) === "STALE") return;
  const fingerprint = kind === "CONDITION_STATE"
    ? store.conditionStates.find((row) => row.conditionStateId === subjectId)?.fingerprint ?? ""
    : kind === "RATING"
      ? store.ratings.find((row) => row.ratingId === subjectId)?.fingerprint ?? ""
      : store.interpretations.find((row) => row.interpretationId === subjectId)?.fingerprint ?? "";
  store.invalidations.push({ invalidationId: `${cause}:${kind}:${subjectId}`, cause, subjectKind: kind, subjectId, recordedAt, deletesSubject: false });
  store.states.push({ subjectKind: kind, subjectId, effective: "STALE", recordedAt });
  store.history.push({ historyId: `${kind}:${subjectId}:INVALIDATED:${cause}`, subjectKind: kind, subjectId, action: "INVALIDATED", version: cause, fingerprint, recordedAt, predecessorId: null });
  if (kind === "CONDITION_STATE") emit(store, "CONDITION_STATE_INVALIDATED", subjectId, recordedAt, cause);
}

function r2Effective(r2: D1hR2Store, kind: "FINDING" | "MEASUREMENT" | "VALIDATION", subjectId: string): string {
  const rows = r2.states.filter((row) => row.subjectKind === kind && row.subjectId === subjectId);
  return rows.length === 0 ? "CURRENT" : rows[rows.length - 1]!.effective;
}

function confirmedInput(r2: D1hR2Store, subjectId: string, kinds: readonly string[]): boolean {
  return r2.validations.some((row) => row.subjectId === subjectId && kinds.includes(row.subjectType) && row.decision === "CONFIRMED" && r2Effective(r2, "VALIDATION", row.validationId) === "CURRENT");
}

export function createD1hR3Store(): D1hR3Store {
  return { schemes: [], interpretations: [], ratings: [], conditionStates: [], validations: [], history: [], states: [], invalidations: [], events: [] };
}

export function selectRatingFromFindings(): never {
  fail("FINDING_AUTO_SELECTS_RATING");
}

export function selectRatingFromMeasurement(): never {
  fail("MEASUREMENT_AUTO_SELECTS_RATING");
}

export function selectGoodRatingFromNoFindings(): never {
  fail("NO_FINDING_AUTO_SELECTS_GOOD_RATING");
}

export function selectRatingFromDefectCount(): never {
  fail("DEFECT_COUNT_AUTO_SELECTS_RATING");
}

export function averageConditionRatings(): never {
  fail("RATING_AVERAGE_REJECTED");
}

export function aggregateMemberRatingsToSystem(): never {
  fail("SYSTEM_RATING_AGGREGATION_REJECTED");
}

export function convertConditionRatingScheme(): never {
  fail("CROSS_SCHEME_CONVERSION_REJECTED");
}

export function promoteAiDraftInterpretation(): never {
  fail("AI_DRAFT_AUTO_PROMOTED_REJECTED");
}

export type D1hR3SchemeInput = {
  ratingSchemeId: string;
  schemeVersion: string;
  profileRef: string;
  schemeAuthority: string;
  applicability: D1hR3SchemeApplicability;
  ratingValueDefinitions: readonly D1hR3RatingValueDefinition[];
  provenance: D1hProvenanceRef;
  status: "GOVERNED" | "TEST_ONLY";
};

export function registerConditionRatingScheme(r1: D1hR1Store, r3: D1hR3Store, inspectionContextId: string, input: D1hR3SchemeInput): D1hR3ConditionRatingScheme {
  assertScope(input);
  assertScope(input.applicability);
  const context = contextOf(r1, inspectionContextId);
  assertProvenance(input.provenance, context);
  humanAuthority(input.schemeAuthority);
  required(input.ratingSchemeId, "RATING_SCHEME_REQUIRED");
  required(input.schemeVersion, "RATING_SCHEME_VERSION_REQUIRED");
  required(input.profileRef, "RATING_PROFILE_REQUIRED");
  if (input.applicability.targetKinds.length === 0) fail("SCHEME_APPLICABILITY_REQUIRED");
  if (input.ratingValueDefinitions.length === 0) fail("RATING_VALUE_DEFINITION_REQUIRED");
  const codes = new Set<string>();
  for (const value of input.ratingValueDefinitions) {
    required(value.code, "RATING_VALUE_CODE_REQUIRED");
    required(value.label, "RATING_VALUE_LABEL_REQUIRED");
    if (codes.has(value.code)) fail("DUPLICATE_RATING_VALUE");
    codes.add(value.code);
  }
  if (input.ratingSchemeId.startsWith("TEST_") && input.status !== "TEST_ONLY") fail("TEST_SCHEME_NOT_PRODUCTION");
  if (r3.schemes.some((row) => row.ratingSchemeId === input.ratingSchemeId && row.schemeVersion === input.schemeVersion)) fail("DUPLICATE_SCHEME_VERSION");
  const ratingValueDefinitions = Object.freeze(input.ratingValueDefinitions.map((value) => Object.freeze({ ...value })));
  const applicability = Object.freeze({ ...input.applicability, targetKinds: Object.freeze([...input.applicability.targetKinds]) });
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R3_SCHEME",
    ratingSchemeId: input.ratingSchemeId,
    schemeVersion: input.schemeVersion,
    profileRef: input.profileRef,
    schemeAuthority: input.schemeAuthority,
    applicability,
    ratingValueDefinitions,
    status: input.status,
  });
  const record: D1hR3ConditionRatingScheme = Object.freeze({
    recordKind: "CONDITION_RATING_SCHEME",
    ratingSchemeId: input.ratingSchemeId,
    schemeVersion: input.schemeVersion,
    profileRef: input.profileRef,
    schemeAuthority: input.schemeAuthority,
    applicability,
    ratingValueDefinitions,
    provenance: Object.freeze({ ...input.provenance, fingerprint }),
    status: input.status,
    fingerprint,
    productionDefault: false as const,
    universalScale: false as const,
    continuousQuantity: false as const,
  });
  r3.schemes.push(record);
  remember(r3, "SCHEME", `${record.ratingSchemeId}@${record.schemeVersion}`, "CREATED", record.schemeVersion, fingerprint, input.provenance.timestamp, null, "CURRENT");
  return record;
}

export function retireConditionRatingScheme(r3: D1hR3Store, ratingSchemeId: string, schemeVersion: string, recordedAt: string): void {
  const scheme = r3.schemes.find((row) => row.ratingSchemeId === ratingSchemeId && row.schemeVersion === schemeVersion);
  if (!scheme) fail("RATING_SCHEME_UNKNOWN");
  const key = `${ratingSchemeId}@${schemeVersion}`;
  if (effectiveOf(r3, "SCHEME", key) !== "STALE") {
    r3.states.push({ subjectKind: "SCHEME", subjectId: key, effective: "STALE", recordedAt });
    r3.history.push({ historyId: `SCHEME:${key}:RETIRED:${schemeVersion}`, subjectKind: "SCHEME", subjectId: key, action: "RETIRED", version: schemeVersion, fingerprint: scheme.fingerprint, recordedAt, predecessorId: null });
  }
  for (const rating of r3.ratings) {
    if (rating.ratingSchemeId === ratingSchemeId && rating.schemeVersion === schemeVersion) invalidateSubject(r3, "RATING_SCHEME_CHANGED", "RATING", rating.ratingId, recordedAt);
  }
  for (const state of r3.conditionStates) {
    if (state.ratingSchemeId === ratingSchemeId && state.schemeVersion === schemeVersion) invalidateSubject(r3, "RATING_SCHEME_CHANGED", "CONDITION_STATE", state.conditionStateId, recordedAt);
  }
}

function schemeOf(r3: D1hR3Store, ratingSchemeId: string, schemeVersion: string): D1hR3ConditionRatingScheme {
  const scheme = r3.schemes.find((row) => row.ratingSchemeId === ratingSchemeId && row.schemeVersion === schemeVersion);
  if (!scheme) fail("RATING_SCHEME_UNKNOWN");
  if (effectiveOf(r3, "SCHEME", `${ratingSchemeId}@${schemeVersion}`) === "STALE") fail("RATING_SCHEME_STALE");
  return scheme;
}

function assertApplicability(scheme: D1hR3ConditionRatingScheme, projectId: string, targetKind: D1hTargetKind): void {
  if (!scheme.applicability.targetKinds.includes(targetKind)) fail("SCHEME_APPLICABILITY_REJECTED");
  if (scheme.applicability.projectId && scheme.applicability.projectId !== projectId) fail("SCHEME_APPLICABILITY_REJECTED");
}

function assertSameTargetRefs(r1: D1hR1Store, r2: D1hR2Store, inspectionContextId: string, targetId: string, evidenceIds: readonly string[], findingIds: readonly string[], measurementIds: readonly string[]): void {
  for (const evidenceId of evidenceIds) {
    const evidence = r1.evidence.find((row) => row.evidenceId === evidenceId);
    if (!evidence || evidence.inspectionContextId !== inspectionContextId) fail("EVIDENCE_UNKNOWN");
    if (evidence.targetId !== targetId) fail("TARGET_MISMATCH");
  }
  for (const findingId of findingIds) {
    const finding = r2.structuralFindings.find((row) => row.findingId === findingId);
    if (!finding || finding.inspectionContextId !== inspectionContextId) fail("FINDING_UNKNOWN");
    if (finding.targetId !== targetId) fail("TARGET_MISMATCH");
  }
  for (const measurementId of measurementIds) {
    const measurement = r2.measurements.find((row) => row.measurementId === measurementId);
    if (!measurement || measurement.inspectionContextId !== inspectionContextId) fail("MEASUREMENT_UNKNOWN");
    if (measurement.targetId !== targetId) fail("TARGET_MISMATCH");
  }
}

export type D1hR3InterpretationInput = {
  interpretationId: string;
  inspectionContextId: string;
  targetId: string;
  supportingEvidenceIds: readonly string[];
  supportingFindingIds: readonly string[];
  supportingMeasurementIds: readonly string[];
  supportingValidationIds: readonly string[];
  authorId: string;
  reviewerId: string | null;
  statement: string;
  basisRefs: readonly string[];
  limitations: string;
  assumptions: string;
  createdAt: string;
  authority: "HUMAN" | "AI_DRAFT";
  provenance: D1hProvenanceRef;
  version: string;
};

export function recordEngineeringInterpretation(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, input: D1hR3InterpretationInput): D1hR3EngineeringInterpretation {
  assertScope(input);
  if (r3.interpretations.some((row) => row.interpretationId === input.interpretationId)) fail("DUPLICATE_INTERPRETATION_ID");
  const context = contextOf(r1, input.inspectionContextId);
  assertProvenance(input.provenance, context);
  const target = r1.targets.find((row) => row.inspectionContextId === context.inspectionContextId && row.targetId === input.targetId);
  if (!target) fail("TARGET_UNKNOWN");
  required(input.statement, "INTERPRETATION_STATEMENT_REQUIRED");
  if (input.basisRefs.length === 0 || input.basisRefs.every((ref) => ref === "LLM_MEMORY")) fail("ENGINEERING_BASIS_REQUIRED");
  if (input.authority === "HUMAN") humanAuthority("HUMAN");
  else if (input.authority !== "AI_DRAFT") fail("INTERPRETATION_AUTHORITY_UNKNOWN");
  assertSameTargetRefs(r1, r2, context.inspectionContextId, input.targetId, input.supportingEvidenceIds, input.supportingFindingIds, input.supportingMeasurementIds);
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R3_INTERPRETATION",
    inspectionContextId: input.inspectionContextId,
    targetId: input.targetId,
    statement: input.statement,
    basisRefs: input.basisRefs,
    supportingFindingIds: sorted(input.supportingFindingIds),
    supportingMeasurementIds: sorted(input.supportingMeasurementIds),
    supportingEvidenceIds: sorted(input.supportingEvidenceIds),
    supportingValidationIds: sorted(input.supportingValidationIds),
    authority: input.authority,
    limitations: input.limitations,
    version: input.version,
  });
  const record: D1hR3EngineeringInterpretation = {
    recordKind: "ENGINEERING_INTERPRETATION",
    ...input,
    supportingEvidenceIds: sorted(input.supportingEvidenceIds),
    supportingFindingIds: sorted(input.supportingFindingIds),
    supportingMeasurementIds: sorted(input.supportingMeasurementIds),
    supportingValidationIds: sorted(input.supportingValidationIds),
    governs: input.authority === "HUMAN",
    structuralAdequacy: false,
    capacityAssessment: false,
    repairApproval: false,
    provenance: { ...input.provenance, fingerprint },
    fingerprint,
    supersedesInterpretationId: null,
  };
  r3.interpretations.push(record);
  remember(r3, "INTERPRETATION", record.interpretationId, "CREATED", record.version, fingerprint, record.createdAt, null, "CURRENT");
  emit(r3, "ENGINEERING_INTERPRETATION_RECORDED", record.interpretationId, record.createdAt, record.version);
  return record;
}

export type D1hR3RatingInput = {
  ratingId: string;
  inspectionContextId: string;
  targetId: string;
  ratingSchemeId: string;
  schemeVersion: string;
  ratingValueCode: string;
  interpretationId: string | null;
  assessmentBasisRef: string;
  supportingEvidenceIds: readonly string[];
  supportingFindingIds: readonly string[];
  supportingMeasurementIds: readonly string[];
  limitations: string;
  assessedAt: string;
  authority: string;
  provenance: D1hProvenanceRef;
  version: string;
  imported: boolean;
};

export function recordConditionRating(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, input: D1hR3RatingInput): D1hR3ConditionRating {
  assertScope(input);
  if (r3.ratings.some((row) => row.ratingId === input.ratingId)) fail("DUPLICATE_RATING_ID");
  const context = contextOf(r1, input.inspectionContextId);
  assertProvenance(input.provenance, context);
  humanAuthority(input.authority);
  const target = r1.targets.find((row) => row.inspectionContextId === context.inspectionContextId && row.targetId === input.targetId);
  if (!target) fail("TARGET_UNKNOWN");
  if (!input.ratingSchemeId || !input.schemeVersion) fail("RATING_SCHEME_REQUIRED");
  const scheme = schemeOf(r3, input.ratingSchemeId, input.schemeVersion);
  assertApplicability(scheme, context.projectId, target.targetKind);
  if (!scheme.ratingValueDefinitions.some((row) => row.code === input.ratingValueCode)) fail("RATING_VALUE_UNKNOWN");
  required(input.assessmentBasisRef, "ASSESSMENT_BASIS_REQUIRED");
  if (input.interpretationId) {
    const interpretation = r3.interpretations.find((row) => row.interpretationId === input.interpretationId);
    if (!interpretation || interpretation.targetId !== input.targetId) fail("INTERPRETATION_UNKNOWN");
    if (!interpretation.governs) fail("AI_INTERPRETATION_CANNOT_GOVERN_RATING");
  }
  if (input.imported && effectiveOf(r3, "SCHEME", `${scheme.ratingSchemeId}@${scheme.schemeVersion}`) !== "CURRENT") fail("IMPORTED_RATING_SCHEME_UNKNOWN");
  assertSameTargetRefs(r1, r2, context.inspectionContextId, input.targetId, input.supportingEvidenceIds, input.supportingFindingIds, input.supportingMeasurementIds);
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R3_RATING",
    ratingSchemeId: input.ratingSchemeId,
    schemeVersion: input.schemeVersion,
    schemeFingerprint: scheme.fingerprint,
    ratingValueCode: input.ratingValueCode,
    targetId: input.targetId,
    assessmentBasisRef: input.assessmentBasisRef,
    authority: input.authority,
    version: input.version,
    supportingEvidenceIds: sorted(input.supportingEvidenceIds),
    supportingFindingIds: sorted(input.supportingFindingIds),
    supportingMeasurementIds: sorted(input.supportingMeasurementIds),
    interpretationId: input.interpretationId,
  });
  const record: D1hR3ConditionRating = {
    recordKind: "CONDITION_RATING",
    ratingId: input.ratingId,
    inspectionContextId: context.inspectionContextId,
    targetId: input.targetId,
    ratingSchemeId: input.ratingSchemeId,
    schemeVersion: input.schemeVersion,
    schemeFingerprint: scheme.fingerprint,
    ratingValueCode: input.ratingValueCode,
    numericQuantity: false,
    averaged: false,
    interpretationId: input.interpretationId,
    assessmentBasisRef: input.assessmentBasisRef,
    supportingEvidenceIds: sorted(input.supportingEvidenceIds),
    supportingFindingIds: sorted(input.supportingFindingIds),
    supportingMeasurementIds: sorted(input.supportingMeasurementIds),
    limitations: input.limitations,
    assessedAt: input.assessedAt,
    authority: input.authority,
    governs: true,
    structuralAdequacy: false,
    assetSafe: false,
    repairRequired: false,
    provenance: { ...input.provenance, fingerprint },
    version: input.version,
    fingerprint,
    supersedesRatingId: null,
  };
  r3.ratings.push(record);
  remember(r3, "RATING", record.ratingId, "CREATED", record.version, fingerprint, record.assessedAt, null, "CURRENT");
  emit(r3, "CONDITION_RATING_RECORDED", record.ratingId, record.assessedAt, record.version);
  return record;
}

function inputSummary(r2: D1hR2Store, evidenceIds: readonly string[], findingIds: readonly string[], measurementIds: readonly string[]): D1hR3InputValidationSummary[] {
  const rows: D1hR3InputValidationSummary[] = [];
  for (const subjectId of evidenceIds) rows.push({ subjectKind: "EVIDENCE", subjectId, validationState: confirmedInput(r2, subjectId, ["EVIDENCE_IDENTITY", "EVIDENCE_TARGET_LINK"]) ? "HUMAN_CONFIRMED" : "UNVALIDATED", promoted: false });
  for (const subjectId of findingIds) rows.push({ subjectKind: "FINDING", subjectId, validationState: confirmedInput(r2, subjectId, ["STRUCTURAL_FINDING", "FINDING_CLASSIFICATION", "FINDING_LOCATION"]) ? "HUMAN_CONFIRMED" : "UNVALIDATED", promoted: false });
  for (const subjectId of measurementIds) rows.push({ subjectKind: "MEASUREMENT", subjectId, validationState: confirmedInput(r2, subjectId, ["MEASUREMENT_VALUE", "MEASUREMENT_UNIT", "MEASUREMENT_LOCATION", "MEASUREMENT_METHOD"]) ? "HUMAN_CONFIRMED" : "UNVALIDATED", promoted: false });
  return rows;
}

export type D1hR3ConditionStateInput = {
  conditionStateId: string;
  inspectionContextId: string;
  targetId: string;
  assessmentScope: string;
  ratingId: string | null;
  interpretationId: string | null;
  assessmentBasisRef: string | null;
  supportingFindingIds: readonly string[];
  supportingMeasurementIds: readonly string[];
  supportingEvidenceIds: readonly string[];
  relevantValidationIds: readonly string[];
  coverageIds: readonly string[];
  authority: string;
  status: "DRAFT" | "UNRATED" | "CURRENT";
  limitations: string;
  createdAt: string;
  createdBy: string;
  provenance: D1hProvenanceRef;
  version: string;
};

export function recordConditionState(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, input: D1hR3ConditionStateInput): D1hR3ConditionState {
  assertScope(input);
  if (r3.conditionStates.some((row) => row.conditionStateId === input.conditionStateId)) fail("DUPLICATE_CONDITION_STATE_ID");
  const context = contextOf(r1, input.inspectionContextId);
  assertProvenance(input.provenance, context);
  humanAuthority(input.authority);
  const target = r1.targets.find((row) => row.inspectionContextId === context.inspectionContextId && row.targetId === input.targetId);
  if (!target) fail("TARGET_UNKNOWN");
  required(input.assessmentScope, "ASSESSMENT_SCOPE_REQUIRED");
  if (typeof input.limitations !== "string") fail("LIMITATIONS_REQUIRED");
  if (input.coverageIds.length === 0) fail("COVERAGE_REQUIRED");
  const coverageIds = sorted(input.coverageIds);
  const coverages = coverageIds.map((coverageId) => r1.coverages.find((row) => row.coverageId === coverageId));
  if (coverages.some((row) => !row || row.inspectionContextId !== context.inspectionContextId || row.targetId !== input.targetId)) fail("COVERAGE_UNKNOWN");
  assertSameTargetRefs(r1, r2, context.inspectionContextId, input.targetId, input.supportingEvidenceIds, input.supportingFindingIds, input.supportingMeasurementIds);
  let rating: D1hR3ConditionRating | null = null;
  if (input.ratingId) {
    rating = r3.ratings.find((row) => row.ratingId === input.ratingId) ?? null;
    if (!rating || rating.targetId !== input.targetId || rating.inspectionContextId !== context.inspectionContextId) fail("RATING_UNKNOWN");
  } else if (input.status === "CURRENT") fail("CURRENT_RATING_REQUIRED");
  if (input.status === "UNRATED" && input.ratingId) fail("UNRATED_HAS_RATING");
  let interpretationId = input.interpretationId;
  if (interpretationId) {
    const interpretation = r3.interpretations.find((row) => row.interpretationId === interpretationId);
    if (!interpretation || interpretation.targetId !== input.targetId) fail("INTERPRETATION_UNKNOWN");
    if (input.status === "CURRENT" && !interpretation.governs) fail("AI_INTERPRETATION_CANNOT_GOVERN");
  }
  const assessmentBasisRef = input.assessmentBasisRef ?? rating?.assessmentBasisRef ?? "";
  if (!interpretationId && assessmentBasisRef.trim() === "") fail("ASSESSMENT_BASIS_REQUIRED");
  const summary = inputSummary(r2, sorted(input.supportingEvidenceIds), sorted(input.supportingFindingIds), sorted(input.supportingMeasurementIds));
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R3_CONDITION_STATE",
    inspectionContextId: context.inspectionContextId,
    targetId: input.targetId,
    ratingSchemeId: rating?.ratingSchemeId ?? null,
    schemeVersion: rating?.schemeVersion ?? null,
    schemeFingerprint: rating?.schemeFingerprint ?? null,
    ratingValueCode: rating?.ratingValueCode ?? null,
    interpretationId,
    supportingFindingIds: sorted(input.supportingFindingIds),
    supportingMeasurementIds: sorted(input.supportingMeasurementIds),
    supportingEvidenceIds: sorted(input.supportingEvidenceIds),
    relevantValidationIds: sorted(input.relevantValidationIds),
    coverageIds,
    coverageLimitations: coverages.map((row) => row!.limitations),
    authority: input.authority,
    limitations: input.limitations,
    version: input.version,
  });
  const record: D1hR3ConditionState = {
    recordKind: "CONDITION_STATE",
    conditionStateId: input.conditionStateId,
    inspectionContextId: context.inspectionContextId,
    inspectionSessionId: context.inspectionSessionId,
    targetId: input.targetId,
    targetKind: target.targetKind,
    assessmentScope: input.assessmentScope,
    ratingSchemeId: rating?.ratingSchemeId ?? null,
    schemeVersion: rating?.schemeVersion ?? null,
    schemeFingerprint: rating?.schemeFingerprint ?? null,
    ratingId: rating?.ratingId ?? null,
    ratingValueCode: rating?.ratingValueCode ?? null,
    interpretationId,
    assessmentBasisRef,
    supportingFindingIds: sorted(input.supportingFindingIds),
    supportingMeasurementIds: sorted(input.supportingMeasurementIds),
    supportingEvidenceIds: sorted(input.supportingEvidenceIds),
    relevantValidationIds: sorted(input.relevantValidationIds),
    coverageIds,
    coverageLimitations: coverages.map((row) => row!.limitations),
    inputValidation: summary,
    allInputsValidated: summary.length > 0 && summary.every((row) => row.validationState === "HUMAN_CONFIRMED"),
    authority: input.authority,
    status: input.status,
    limitations: input.limitations,
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    provenance: { ...input.provenance, fingerprint },
    version: input.version,
    fingerprint,
    supersedesConditionStateId: null,
    goodCondition: false,
    structuralAdequacy: false,
    assetSafe: false,
    repairRequired: false,
    sectionPropertyChanged: false,
    materialPropertyChanged: false,
    capacityChanged: false,
    analysisModelChanged: false,
    supportChanged: false,
    releaseChanged: false,
    loadChanged: false,
    analysisInputCreated: false,
    repairActionCreated: false,
  };
  if (record.status === "CURRENT" && record.ratingSchemeId && record.schemeVersion) {
    const predecessors = r3.conditionStates.filter((row) => row.targetId === record.targetId && row.ratingSchemeId === record.ratingSchemeId && row.schemeVersion === record.schemeVersion && row.assessmentScope === record.assessmentScope && row.status === "CURRENT" && effectiveOf(r3, "CONDITION_STATE", row.conditionStateId) === "CURRENT");
    for (const prior of predecessors) {
      r3.states.push({ subjectKind: "CONDITION_STATE", subjectId: prior.conditionStateId, effective: "SUPERSEDED", recordedAt: input.createdAt });
      emit(r3, "CONDITION_STATE_SUPERSEDED", prior.conditionStateId, input.createdAt, prior.version);
    }
  }
  r3.conditionStates.push(record);
  remember(r3, "CONDITION_STATE", record.conditionStateId, "CREATED", record.version, fingerprint, record.createdAt, null, "CURRENT");
  emit(r3, "CONDITION_STATE_RECORDED", record.conditionStateId, record.createdAt, record.version);
  return record;
}

export type D1hR3ConditionValidationInput = {
  validationId: string;
  inspectionContextId: string;
  subjectType: (typeof D1H_R3_CONDITION_VALIDATION_SUBJECTS)[number];
  subjectId: string;
  scopeStatement: string;
  validatorId: string;
  role: (typeof D1H_HUMAN_ROLES)[number];
  validatedAt: string;
  decision: D1hR3ConditionValidation["decision"];
  limitations: string;
  authority: string;
  provenance: D1hProvenanceRef;
  version: string;
  supersedesValidationId: string | null;
};

export function recordConditionScopedValidation(r1: D1hR1Store, r3: D1hR3Store, validators: readonly D1hR2ValidatorAuthorization[], input: D1hR3ConditionValidationInput): D1hR3ConditionValidation {
  assertScope(input);
  if (!D1H_R3_CONDITION_VALIDATION_SUBJECTS.includes(input.subjectType)) fail("VALIDATION_SUBJECT_UNKNOWN");
  const context = contextOf(r1, input.inspectionContextId);
  assertProvenance(input.provenance, context);
  humanAuthority(input.authority);
  required(input.scopeStatement, "VALIDATION_SCOPE_REQUIRED");
  const authorization = validators.find((row) => row.validatorId === input.validatorId && row.role === input.role && row.authorized);
  if (!authorization) fail("VALIDATOR_UNAUTHORIZED");
  if (authorization.tenantId !== context.tenantId) fail("CROSS_TENANT_BINDING_REJECTED");
  if (authorization.projectId !== context.projectId || authorization.workspaceId !== context.workspaceId) fail("CROSS_PROJECT_BINDING_REJECTED");
  const subjectVersion = input.subjectType === "CONDITION_STATE"
    ? r3.conditionStates.find((row) => row.conditionStateId === input.subjectId)?.version
    : input.subjectType === "CONDITION_RATING"
      ? r3.ratings.find((row) => row.ratingId === input.subjectId)?.version
      : r3.interpretations.find((row) => row.interpretationId === input.subjectId)?.version;
  if (!subjectVersion) fail("VALIDATION_SUBJECT_UNKNOWN");
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R3_VALIDATION",
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    scopeStatement: input.scopeStatement,
    validatorId: input.validatorId,
    role: input.role,
    decision: input.decision,
    limitations: input.limitations,
    authority: input.authority,
    version: input.version,
  });
  const record: D1hR3ConditionValidation = {
    recordKind: "HUMAN_VALIDATION",
    ...input,
    subjectVersion,
    provenance: { ...input.provenance, fingerprint },
    fingerprint,
    structuralAdequacy: false,
    assetSafe: false,
    independenceClaimed: false,
    professionalRegistrationInferred: false,
  };
  r3.validations.push(record);
  remember(r3, "VALIDATION", record.validationId, "CREATED", record.version, fingerprint, record.validatedAt, input.supersedesValidationId, "CURRENT");
  return record;
}

export function propagateConditionStaleness(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, recordedAt: string): void {
  const staleEvidence = (id: string) => currentD1hR1Effective(r1, "EVIDENCE", id) === "STALE";
  const staleTarget = (id: string) => currentD1hR1Effective(r1, "TARGET", id) === "STALE";
  const staleCoverage = (id: string) => currentD1hR1Effective(r1, "COVERAGE", id) === "STALE";
  const staleContext = (id: string) => currentD1hR1Effective(r1, "CONTEXT", id) !== "CURRENT";
  for (const state of r3.conditionStates) {
    const cause: D1hR3InvalidationCause | null = staleContext(state.inspectionContextId)
      ? "CONTEXT_SUPERSEDED"
      : staleTarget(state.targetId)
        ? "TARGET_STALE"
        : state.coverageIds.some(staleCoverage)
          ? "COVERAGE_CORRECTED"
          : state.supportingEvidenceIds.some(staleEvidence)
            ? "SUPPORTING_EVIDENCE_STALE"
            : state.supportingFindingIds.some((id) => ["STALE", "SUPERSEDED"].includes(r2Effective(r2, "FINDING", id)))
              ? "FINDING_STALE_OR_CORRECTED"
              : state.supportingMeasurementIds.some((id) => ["STALE", "SUPERSEDED"].includes(r2Effective(r2, "MEASUREMENT", id)))
                ? "MEASUREMENT_STALE_OR_CORRECTED"
                : state.relevantValidationIds.some((id) => r2Effective(r2, "VALIDATION", id) === "STALE")
                  ? "VALIDATION_WITHDRAWN"
                  : state.ratingSchemeId && state.schemeVersion && effectiveOf(r3, "SCHEME", `${state.ratingSchemeId}@${state.schemeVersion}`) === "STALE"
                    ? "RATING_SCHEME_CHANGED"
                    : null;
    if (cause) invalidateSubject(r3, cause, "CONDITION_STATE", state.conditionStateId, recordedAt);
  }
}

export function correctEngineeringInterpretation(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, predecessorId: string, input: D1hR3InterpretationInput): D1hR3EngineeringInterpretation {
  const prior = r3.interpretations.find((row) => row.interpretationId === predecessorId);
  if (!prior) fail("PREDECESSOR_UNKNOWN");
  const snapshot = JSON.stringify(prior);
  if (input.version === prior.version) fail("CORRECTION_VERSION_REQUIRED");
  const successor = recordEngineeringInterpretation(r1, r2, r3, input);
  r3.interpretations[r3.interpretations.length - 1]!.supersedesInterpretationId = predecessorId;
  if (JSON.stringify(prior) !== snapshot) fail("HISTORICAL_RECORD_MUTATED");
  r3.states.push({ subjectKind: "INTERPRETATION", subjectId: predecessorId, effective: "SUPERSEDED", recordedAt: input.createdAt });
  emit(r3, "ENGINEERING_INTERPRETATION_SUPERSEDED", predecessorId, input.createdAt, prior.version);
  for (const rating of r3.ratings) if (rating.interpretationId === predecessorId) invalidateSubject(r3, "INTERPRETATION_CORRECTED", "RATING", rating.ratingId, input.createdAt);
  for (const state of r3.conditionStates) if (state.interpretationId === predecessorId) invalidateSubject(r3, "INTERPRETATION_CORRECTED", "CONDITION_STATE", state.conditionStateId, input.createdAt);
  return successor;
}

export function correctConditionRating(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, predecessorId: string, input: D1hR3RatingInput): D1hR3ConditionRating {
  const prior = r3.ratings.find((row) => row.ratingId === predecessorId);
  if (!prior) fail("PREDECESSOR_UNKNOWN");
  const snapshot = JSON.stringify(prior);
  if (input.version === prior.version) fail("CORRECTION_VERSION_REQUIRED");
  const successor = recordConditionRating(r1, r2, r3, input);
  r3.ratings[r3.ratings.length - 1]!.supersedesRatingId = predecessorId;
  if (JSON.stringify(prior) !== snapshot) fail("HISTORICAL_RECORD_MUTATED");
  r3.states.push({ subjectKind: "RATING", subjectId: predecessorId, effective: "SUPERSEDED", recordedAt: input.assessedAt });
  emit(r3, "CONDITION_RATING_SUPERSEDED", predecessorId, input.assessedAt, prior.version);
  for (const state of r3.conditionStates) if (state.ratingId === predecessorId) invalidateSubject(r3, "RATING_SCHEME_CHANGED", "CONDITION_STATE", state.conditionStateId, input.assessedAt);
  return successor;
}

export function correctConditionState(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, predecessorId: string, input: D1hR3ConditionStateInput): D1hR3ConditionState {
  const prior = r3.conditionStates.find((row) => row.conditionStateId === predecessorId);
  if (!prior) fail("PREDECESSOR_UNKNOWN");
  const snapshot = JSON.stringify(prior);
  if (input.version === prior.version) fail("CORRECTION_VERSION_REQUIRED");
  const successor = recordConditionState(r1, r2, r3, input);
  r3.conditionStates[r3.conditionStates.length - 1]!.supersedesConditionStateId = predecessorId;
  if (JSON.stringify(prior) !== snapshot) fail("HISTORICAL_RECORD_MUTATED");
  r3.states.push({ subjectKind: "CONDITION_STATE", subjectId: predecessorId, effective: "SUPERSEDED", recordedAt: input.createdAt });
  return successor;
}

export function conditionStateProvenance(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, conditionStateId: string): readonly string[] {
  const state = r3.conditionStates.find((row) => row.conditionStateId === conditionStateId);
  if (!state) fail("CONDITION_STATE_UNKNOWN");
  const context = contextOf(r1, state.inspectionContextId);
  const chain = [`system:${context.structuralSystemId}`, `context:${context.inspectionContextId}`];
  for (const coverageId of state.coverageIds) chain.push(`coverage:${coverageId}`);
  for (const evidenceId of state.supportingEvidenceIds) chain.push(`evidence:${evidenceId}`);
  for (const findingId of state.supportingFindingIds) {
    chain.push(`finding:${findingId}`);
    for (const link of r2.links.filter((row) => row.findingId === findingId)) chain.push(`link:${link.linkId}`);
  }
  for (const measurementId of state.supportingMeasurementIds) chain.push(`measurement:${measurementId}`);
  for (const validationId of state.relevantValidationIds) chain.push(`validation:${validationId}`);
  if (state.interpretationId) chain.push(`interpretation:${state.interpretationId}`);
  if (state.ratingId) chain.push(`rating:${state.ratingId}`);
  if (state.ratingSchemeId && state.schemeVersion) chain.push(`scheme:${state.ratingSchemeId}@${state.schemeVersion}`);
  chain.push(`condition:${state.conditionStateId}`);
  return chain;
}

export function digitalTwinReference(r3: D1hR3Store, conditionStateId: string) {
  const state = r3.conditionStates.find((row) => row.conditionStateId === conditionStateId);
  if (!state) fail("CONDITION_STATE_UNKNOWN");
  return {
    conditionStateId: state.conditionStateId,
    targetId: state.targetId,
    effective: effectiveOf(r3, "CONDITION_STATE", state.conditionStateId),
    ratingSchemeId: state.ratingSchemeId,
    schemeVersion: state.schemeVersion,
    ratingValueCode: state.ratingValueCode,
    interpretationId: state.interpretationId,
    evidenceIds: state.supportingEvidenceIds,
    findingIds: state.supportingFindingIds,
    measurementIds: state.supportingMeasurementIds,
    validationIds: state.relevantValidationIds,
    provenanceFingerprint: state.fingerprint,
    createdAt: state.createdAt,
    copiedEvidence: false as const,
  };
}

export function evaluateStructuralCondition(r1: D1hR1Store, r2: D1hR2Store, r3: D1hR3Store, input: { inspectionContextId: string; declaredConditionStateIds: readonly string[]; declaredRatingIds: readonly string[]; declaredInterpretationIds: readonly string[] }): D1hR3RuntimeResult {
  const context = contextOf(r1, input.inspectionContextId);
  propagateConditionStaleness(r1, r2, r3, context.recordedAt);
  const states = r3.conditionStates.filter((row) => row.inspectionContextId === context.inspectionContextId);
  const ratings = r3.ratings.filter((row) => row.inspectionContextId === context.inspectionContextId);
  const interpretations = r3.interpretations.filter((row) => row.inspectionContextId === context.inspectionContextId);
  const diagnostics: { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[] = [];
  const blocking: { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[] = [];
  const declared = [...input.declaredConditionStateIds, ...input.declaredRatingIds, ...input.declaredInterpretationIds];
  const present = (id: string) => states.some((row) => row.conditionStateId === id) || ratings.some((row) => row.ratingId === id) || interpretations.some((row) => row.interpretationId === id);
  const stale = states.some((row) => effectiveOf(r3, "CONDITION_STATE", row.conditionStateId) === "STALE") || ratings.some((row) => effectiveOf(r3, "RATING", row.ratingId) === "STALE");
  let completeness: D1hR3Completeness;
  if (stale) completeness = "STALE";
  else if (declared.length === 0) completeness = "UNDETERMINED";
  else if (declared.every((id) => !present(id))) completeness = "INCOMPLETE";
  else if (declared.some((id) => !present(id))) completeness = "PARTIAL";
  else completeness = "COMPLETE_FOR_DECLARED_CONDITION_SCOPE";
  if (completeness === "INCOMPLETE" || completeness === "PARTIAL") diagnostics.push({ kind: "RUNTIME_DIAGNOSTIC", code: "DECLARED_SUBJECT_MISSING", structuralFinding: false });
  const payload = {
    subject: "D1H_R3_RESULT",
    inspectionContextId: context.inspectionContextId,
    targetIds: sorted(states.map((row) => row.targetId)),
    interpretationIds: sorted(interpretations.map((row) => row.interpretationId)),
    ratingIds: sorted(ratings.map((row) => row.ratingId)),
    conditionStateIds: sorted(states.map((row) => row.conditionStateId)),
    completeness,
    blocking: blocking.map((row) => row.code),
  };
  const fingerprint = fingerprintCanonical(payload);
  return {
    resultId: fingerprint,
    inspectionContextId: context.inspectionContextId,
    targetIds: payload.targetIds,
    interpretationIds: payload.interpretationIds,
    ratingIds: payload.ratingIds,
    conditionStateIds: payload.conditionStateIds,
    scope: context.scopeStatement,
    completeness,
    runtimeDiagnostics: diagnostics,
    blockingRuntimeDiagnostics: blocking,
    warnings: [],
    provenance: context.provenance,
    fingerprint,
    structuralAdequacy: false,
    repairApproval: false,
    goodCondition: false,
  };
}
