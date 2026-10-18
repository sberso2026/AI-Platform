/**
 * EOS-D1H-0 structural inspection and condition architecture.
 * Contracts only. No condition engine, no runtime, no engineering formula.
 */

import type { EosInspectionFindingClass } from "./discipline-capability";

export const D1H_CANONICAL_NAME = "STRUCTURAL INSPECTION & CONDITION" as const;
export const D1H_0_PHASE = "EOS-D1H-0-STRUCTURAL-INSPECTION-CONDITION-ARCHITECTURE" as const;
export const D1H_0_MATURITY_STATE = "STRUCTURAL_INSPECTION_CONDITION_ARCHITECTURE_DEFINED" as const;
export const D1H_PHASE_AUTHORIZED = true as const;
export const D1H_0_STRUCTURAL_INSPECTION_RUNTIME_COUNT = 0 as const;
export const D1H_0_CONDITION_ENGINE_RUNTIME_COUNT = 0 as const;
export const D1H_0_AI_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1H_0_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;

export const INSPECTION_EVIDENCE_EQUALS_ENGINEERING_FINDING = false as const;
export const ENGINEERING_FINDING_EQUALS_CONDITION_RATING = false as const;
export const CONDITION_RATING_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const CONDITION_RATING_EQUALS_REPAIR_APPROVAL = false as const;
export const CONDITION_RATING_EQUALS_MEMBER_CAPACITY = false as const;
export const CONDITION_RATING_EQUALS_REPAIR_NEEDED = false as const;
export const HUMAN_VALIDATION_EQUALS_STRUCTURAL_CERTIFICATION = false as const;
export const NO_FINDING_EQUALS_GOOD_CONDITION = false as const;
export const NO_FINDING_EQUALS_NO_DEFECT = false as const;
export const NO_EVIDENCE_EQUALS_HEALTHY = false as const;
export const D1H_INSPECTION_COVERAGE_EXPLICIT = true as const;
export const GEOMETRIC_PROXIMITY_EQUALS_SAME_DEFECT = false as const;
export const AI_SIMILARITY_EQUALS_SAME_DEFECT = false as const;
export const IMAGE_SIMILARITY_EQUALS_SAME_DEFECT = false as const;
export const CROSS_INSPECTION_DEFECT_ASSOCIATION_REQUIRES_GOVERNED_CONFIRMATION = true as const;
export const GENERIC_INSPECTION_PLATFORM_EQUALS_D1H = false as const;
export const D1H_INSPECTION_PURPOSE_INFERRED_BY_AI = false as const;
export const D1H_FINDING_LOCATION_REQUIRED_WHERE_APPLICABLE = true as const;
export const D1H_FINDING_LOCATION_GUESSED = false as const;
export const AI_FINDING_LOCATION_AUTHORITY = false as const;
export const UNCONFIRMED_AI_LOCATION_CAN_GOVERN = false as const;
export const D1H_COVERAGE_LIMITATIONS_PRESERVED = true as const;
export const D1H_NO_FINDING_IS_NEGATIVE_EVIDENCE = false as const;
export const D1H_EXPLICIT_NO_DEFECT_OBSERVATION_SCOPE_REQUIRED = true as const;
export const D1H_RAW_EVIDENCE_PRESERVED = true as const;
export const NEW_DERIVED_EVIDENCE_OVERWRITES_SOURCE = false as const;
export const AI_FINDING_CLASSIFICATION_CAN_GOVERN = false as const;
export const OBSERVATION_EQUALS_ENGINEERING_FINDING = false as const;
export const D1H_GEOMETRY_AUTO_MERGES_FINDINGS = false as const;
export const D1H_IMAGE_AI_AUTO_MERGES_FINDINGS = false as const;
export const D1H_PROXIMITY_AUTO_MERGES_FINDINGS = false as const;
export const D1H_MEASUREMENT_UNIT_REQUIRED = true as const;
export const D1H_MEASUREMENT_QUANTITY_REQUIRED = true as const;
export const MISSING_UNIT_INFERRED_FROM_CONTEXT = false as const;
export const AI_ESTIMATED_MEASUREMENT_EQUALS_INSTRUMENT_MEASUREMENT = false as const;
export const UNCALIBRATED_AI_NUMERIC_MEASUREMENT_CAN_GOVERN = false as const;
export const D1H_DEFAULT_ENGINEERING_SEVERITY_THRESHOLDS_CREATED = false as const;
export const AI_CONFIDENCE_EQUALS_ENGINEERING_SEVERITY = false as const;
export const AI_CONFIDENCE_EQUALS_CONDITION_RATING = false as const;
export const HIGH_AI_CONFIDENCE_EQUALS_HUMAN_VALIDATION = false as const;
export const AI_ENGINEERING_INTERPRETATION_CAN_GOVERN = false as const;
export const D1H_CONDITION_STATE_AUTHORITY_REQUIRED = true as const;
export const AI_CONDITION_STATE_AUTHORITY = false as const;
export const D1H_EXISTING_CONDITION_RATING_REUSED = true as const;
export const D1H_UNIVERSAL_CONDITION_RATING_SCALE_CREATED = false as const;
export const D1H_HUMAN_VALIDATION_SCOPE_EXPLICIT = true as const;
export const VALIDATING_ONE_FINDING_VALIDATES_ALL_INSPECTION_EVIDENCE = false as const;
export const D1H_HUMAN_VALIDATION_EQUALS_DESIGN_APPROVAL = false as const;
export const D1H_HUMAN_VALIDATION_EQUALS_REPAIR_APPROVAL = false as const;
export const D1H_HUMAN_VALIDATION_EQUALS_ASSET_SAFE = false as const;
export const D1H_AUTOMATIC_SAFE_UNSAFE_CLASSIFICATION = false as const;
export const D1H_FINDING_AUTO_CHANGES_SECTION_PROPERTIES = false as const;
export const D1H_FINDING_AUTO_CHANGES_MATERIAL_PROPERTIES = false as const;
export const D1H_FINDING_AUTO_CHANGES_CAPACITY = false as const;
export const D1H_FINDING_AUTO_CHANGES_ANALYSIS_MODEL = false as const;
export const D1H_FINDING_AUTO_CHANGES_SUPPORT = false as const;
export const D1H_FINDING_AUTO_CHANGES_RELEASE = false as const;
export const D1H_FINDING_AUTO_CHANGES_LOAD = false as const;
export const ANALYSIS_RESULT_EQUALS_OBSERVED_CONDITION = false as const;
export const ANALYSIS_PREDICTION_EQUALS_MEASURED_RESPONSE = false as const;
export const D1H_MEASURED_RESPONSE_EQUALS_INFERRED_RESPONSE = false as const;
export const NEW_INSPECTION_OVERWRITES_PRIOR_INSPECTION = false as const;
export const NEW_CONDITION_STATE_OVERWRITES_PRIOR_STATE = false as const;
export const NEW_VALIDATION_OVERWRITES_PRIOR_VALIDATION = false as const;
export const D1H_DETERIORATION_PREDICTION_IMPLEMENTED = false as const;
export const D1H_OBSERVED_CHANGE_EQUALS_CAUSAL_DIAGNOSIS = false as const;
export const D1H_STRUCTURAL_REVISION_DELETES_HISTORICAL_INSPECTION = false as const;
export const D1H_DUPLICATE_EVIDENCE_COUNTS_AS_INDEPENDENT_CORROBORATION = false as const;
export const D1H_CONFLICTING_MEASUREMENTS_AUTOMATICALLY_AVERAGED = false as const;
export const D1H_COMPUTER_VISION_IMPLEMENTED = false as const;
export const D1H_AI_MODEL_PROVENANCE_REQUIRED = true as const;
export const AI_DETECTION_EQUALS_VALIDATED_FINDING = false as const;
export const AI_CLASSIFICATION_EQUALS_VALIDATED_FINDING = false as const;
export const AI_CONFIDENCE_EQUALS_ENGINEERING_CERTAINTY = false as const;
export const HUMAN_OBSERVATION_EQUALS_ENGINEERING_ASSESSMENT = false as const;
export const D1H_REPAIR_DESIGN_IMPLEMENTED = false as const;
export const D1H_AI_REPAIR_APPROVAL_AUTHORITY = false as const;
export const D1H_FITNESS_FOR_SERVICE_CALCULATION_IMPLEMENTED = false as const;
export const D1H_FATIGUE_LIFE_CALCULATION_IMPLEMENTED = false as const;
export const D1H_CORROSION_RATE_PREDICTION_IMPLEMENTED = false as const;
export const D1H_MEASURED_SECTION_LOSS_AUTO_UPDATES_DESIGN_SECTION = false as const;
export const D1H_CRACK_SEVERITY_FORMULA_IMPLEMENTED = false as const;
export const D1H_MEASURED_DEFORMATION_EQUALS_ANALYSIS_DISPLACEMENT = false as const;
export const D1H_SHM_RUNTIME_IMPLEMENTED = false as const;
export const D1H_GEOTECHNICAL_DESIGN_IMPLEMENTED = false as const;
export const D1H_CONNECTION_DESIGN_IMPLEMENTED = false as const;
export const D1H_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1H_PERSON_TWIN_IMPLEMENTED = false as const;
export const D1I_REAUTHORS_D1H_EVIDENCE = false as const;
export const D1H_0_DIGITAL_TWIN_RUNTIME_CREATED = false as const;
export const D1H_CROSS_PROJECT_EVIDENCE_BINDING_ALLOWED = false as const;
export const D1H_CROSS_TENANT_EVIDENCE_BINDING_ALLOWED = false as const;
export const D1H_AI_ENGINEERING_AUTHORITY_CREATED = false as const;
export const D1H_D1F_MATURITY_PROMOTION = false as const;
export const D1H_D1G_MATURITY_PROMOTION = false as const;
export const D1H_STEEL_MATURITY_PROMOTION = false as const;
export const D1H_CONCRETE_MATURITY_PROMOTION = false as const;
export const PARALLEL_INSPECTION_PLATFORM_CREATED = false as const;
export const PARALLEL_GENERIC_DEFECT_DOMAIN_CREATED = false as const;
export const PARALLEL_CONDITION_RATING_PLATFORM_CREATED = false as const;
export const PARALLEL_STRUCTURAL_OBJECT_MODEL_CREATED = false as const;
export const PARALLEL_INSPECTION_SESSION_MODEL_CREATED = false as const;

export const D1H_INSPECTION_PURPOSES = [
  "ROUTINE",
  "DETAILED",
  "SPECIAL",
  "POST_EVENT",
  "TARGETED",
  "FOLLOW_UP",
  "OTHER",
] as const;
export type D1hInspectionPurpose = (typeof D1H_INSPECTION_PURPOSES)[number];

export const D1H_COVERAGE_RESULTS = [
  "NOT_INSPECTED",
  "INACCESSIBLE",
  "INSPECTION_SCOPE_UNKNOWN",
  "INSPECTED_NO_FINDING_RECORDED",
  "INSPECTED_WITH_FINDINGS",
] as const;
export type D1hCoverageResult = (typeof D1H_COVERAGE_RESULTS)[number];

export const D1H_TARGET_KINDS = [
  "STRUCTURAL_SYSTEM",
  "MEMBER",
  "CONNECTION",
  "SUPPORT",
  "FOUNDATION",
  "BOUNDED_REGION",
] as const;
export type D1hTargetKind = (typeof D1H_TARGET_KINDS)[number];

export const D1H_LOCATION_KINDS = [
  "MEMBER_STATION_OR_RANGE",
  "CONNECTION_REGION",
  "FOUNDATION_OR_SUPPORT_LOCATION",
  "COORDINATE_REFERENCE",
  "SURFACE_OR_FACE",
  "IMAGE_OR_VIDEO_REGION",
] as const;

export const D1H_EVIDENCE_SOURCE_CLASSES = [
  "HUMAN_OBSERVATION",
  "PHOTO",
  "VIDEO",
  "MEASUREMENT",
  "DOCUMENT",
  "INSTRUMENTATION_REFERENCE",
  "ANALYSIS_RESULT_REFERENCE",
  "HISTORICAL_INSPECTION_REFERENCE",
  "AI_DERIVED_CANDIDATE_EVIDENCE",
] as const;
export type D1hEvidenceSourceClass = (typeof D1H_EVIDENCE_SOURCE_CLASSES)[number];

export const D1H_FINDING_CATEGORIES = [
  "CRACKING",
  "CORROSION",
  "SECTION_LOSS",
  "DEFORMATION",
  "FATIGUE_INDICATOR",
  "CONNECTION_DISTRESS",
  "FOUNDATION_MOVEMENT",
  "VIBRATION_EVIDENCE",
  "OTHER",
] as const;
export type D1hFindingCategory = (typeof D1H_FINDING_CATEGORIES)[number];

export const D1H_CLASSIFICATION_AUTHORITIES = [
  "HUMAN_OBSERVATION",
  "GOVERNED_IMPORT",
  "AI_CANDIDATE",
] as const;

export const D1H_ASSOCIATION_STATES = [
  "NEW_FINDING",
  "POSSIBLE_MATCH",
  "HUMAN_CONFIRMED_SAME_CONDITION",
  "HUMAN_CONFIRMED_DISTINCT",
  "SUPERSEDED_ASSOCIATION",
] as const;

export const D1H_MEASUREMENT_SOURCES = [
  "HUMAN_RECORDED",
  "INSTRUMENT_MEASURED",
  "AI_ESTIMATED",
  "IMPORTED",
  "CALCULATED_BY_GOVERNED_METHOD",
] as const;

export const D1H_HUMAN_ROLES = [
  "OBSERVER_INSPECTOR",
  "ENGINEER_REVIEWER",
  "VALIDATOR",
  "APPROVER",
] as const;

export const D1H_VALIDATION_SUBJECTS = [
  "EVIDENCE_IDENTITY",
  "FINDING_CLASSIFICATION",
  "FINDING_ASSOCIATION",
  "MEASUREMENT",
  "ENGINEERING_INTERPRETATION",
  "CONDITION_RATING",
] as const;

export const D1H_FINDING_CLASS_ALIGNMENT: readonly EosInspectionFindingClass[] = [
  "observed_defect",
  "measurement",
  "ai_detection",
  "ai_classification",
  "engineering_interpretation",
  "condition_rating",
  "human_validation",
];

export const D1H_PLATFORM_REUSE = [
  "inspection_session",
  "defect",
  "assessment",
  "condition_rating",
  "structural_condition_pack",
  "visual_template",
  "condition_template",
  "evidence_artifact",
] as const;

export const D1H_FINGERPRINT_SUBJECTS = [
  "inspection_context",
  "coverage",
  "evidence",
  "finding",
  "measurement",
  "association",
  "engineering_interpretation",
  "condition_state",
  "human_validation",
] as const;

export const D1H_INVALIDATION_CAUSES = [
  "SOURCE_EVIDENCE_CORRECTED",
  "TARGET_IDENTITY_CHANGED",
  "FINDING_CLASSIFICATION_CHANGED",
  "MEASUREMENT_CORRECTED",
  "LOCATION_CORRECTED",
  "ASSOCIATION_CHANGED",
  "RATING_PROFILE_CHANGED",
  "INTERPRETATION_CHANGED",
  "VALIDATION_WITHDRAWN_OR_SUPERSEDED",
] as const;

export const D1H_R1_CANONICAL_PHASE = "EOS-D1H-R1-STRUCTURAL-INSPECTION-EVIDENCE-FOUNDATION" as const;
export const D1H_PROPOSED_PHASE_SEQUENCE = [
  "EOS-D1H-R1-STRUCTURAL-INSPECTION-EVIDENCE-FOUNDATION",
  "EOS-D1H-R2-STRUCTURAL-FINDING-MEASUREMENT-VALIDATION-FOUNDATION",
  "EOS-D1H-R3-CONDITION-STATE-RATING-INTERPRETATION",
  "EOS-D1H-R4-TEMPORAL-HISTORY-ASSOCIATION-ANALYSIS-LINKAGE",
  "EOS-D1H-R5-CLOSEOUT-AND-D1I-HANDOFF",
] as const;

export type D1hProvenanceRef = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  actorOrSystem: string;
  timestamp: string;
  authority: string;
  version: string;
  fingerprint: string;
};

export type D1hStructuralInspectionContext = {
  inspectionContextId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  structuralSystemId: string;
  inspectionSessionId: string;
  purpose: D1hInspectionPurpose;
  scopeStatement: string;
  inspectedAt: string;
  coverageScopeRef: string;
  methodRefs: readonly string[];
  sourceAuthority: string;
  governanceProfileRef: string;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  status: "DRAFT" | "RECORDED" | "SUPERSEDED";
};

export type D1hStructuralTargetRef = {
  targetId: string;
  targetKind: D1hTargetKind;
  structuralSystemId: string;
  memberId: string | null;
  connectionId: string | null;
  supportId: string | null;
  foundationIdentity: string | null;
};

export type D1hInspectionLocation = {
  locationId: string;
  locationKind: (typeof D1H_LOCATION_KINDS)[number];
  description: string;
  explicit: true;
  aiSuggested: boolean;
  governs: false;
};

export type D1hInspectionCoverage = {
  coverageId: string;
  targetId: string;
  regionRef: string | null;
  methodRef: string;
  inspectionSessionId: string;
  accessState: D1hCoverageResult;
  limitations: string;
  provenance: D1hProvenanceRef;
};

export type D1hInspectionEvidence = {
  evidenceId: string;
  inspectionContextId: string;
  inspectionSessionId: string;
  targetId: string;
  sourceClass: D1hEvidenceSourceClass;
  sourceArtifactId: string;
  capturedAt: string;
  capturedBy: string;
  locationId: string | null;
  methodRef: string | null;
  unit: string | null;
  authority: (typeof D1H_CLASSIFICATION_AUTHORITIES)[number];
  validationState: "UNVALIDATED" | "VALIDATED_FOR_DECLARED_SCOPE";
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  derivedFromEvidenceId: string | null;
};

export type D1hObservation = {
  observationId: string;
  evidenceId: string;
  statement: string;
  findingClass: "observed_defect";
  engineeringFinding: false;
};

type D1hFindingBase = {
  findingId: string;
  category: D1hFindingCategory;
  targetId: string;
  locationId: string | null;
  evidenceIds: readonly string[];
  observationIds: readonly string[];
  provenance: D1hProvenanceRef;
  fingerprint: string;
};

export type D1hStructuralFinding = D1hFindingBase & (
  | { classificationAuthority: "AI_CANDIDATE"; governs: false }
  | { classificationAuthority: "HUMAN_OBSERVATION" | "GOVERNED_IMPORT"; governs: boolean }
);

export type D1hEvidenceFindingLink = {
  evidenceId: string;
  findingId: string;
  automaticMerge: false;
};

export type D1hCrossInspectionAssociation = {
  associationId: string;
  earlierFindingId: string;
  laterFindingId: string;
  state: (typeof D1H_ASSOCIATION_STATES)[number];
  confirmedByHuman: boolean;
};

type D1hMeasurementBase = {
  measurementId: string;
  evidenceId: string;
  findingId: string | null;
  quantity: string;
  value: number;
  unit: string;
  locationId: string;
  methodRef: string;
  instrumentRef: string | null;
  measuredAt: string;
  uncertainty: string | null;
  provenance: D1hProvenanceRef;
  fingerprint: string;
};

export type D1hInspectionMeasurement = D1hMeasurementBase & (
  | { source: "AI_ESTIMATED"; calibrationBasis: string | null; governs: false }
  | { source: "HUMAN_RECORDED" | "INSTRUMENT_MEASURED" | "IMPORTED" | "CALCULATED_BY_GOVERNED_METHOD"; calibrationBasis: string | null; governs: boolean }
);

export type D1hSeverityRecord = {
  severityId: string;
  profileRef: string;
  findingId: string;
  confidenceId: string | null;
  separateFromConfidence: true;
  separateFromConditionRating: true;
  universalThreshold: false;
};

export type D1hConfidenceRecord = {
  confidenceId: string;
  subjectId: string;
  score: number | null;
  engineeringSeverity: false;
  conditionRating: false;
  humanValidation: false;
  engineeringCertainty: false;
};

export type D1hEngineeringInterpretation = {
  interpretationId: string;
  findingIds: readonly string[];
  evidenceIds: readonly string[];
  targetId: string;
  authorRef: string;
  reviewerRef: string | null;
  statement: string;
  basisRefs: readonly string[];
  limitations: string;
  timestamp: string;
  validationState: "UNVALIDATED" | "HUMAN_VALIDATED_FOR_DECLARED_SCOPE";
  provenance: D1hProvenanceRef;
  fingerprint: string;
} & (
  | { authority: "AI_DRAFT"; governs: false }
  | { authority: "HUMAN"; governs: boolean }
);

export type D1hConditionState = {
  conditionStateId: string;
  findingIds: readonly string[];
  evidenceIds: readonly string[];
  ratingId: string | null;
  ratingSchemeId: string | null;
  interpretationId: string | null;
  authority: "HUMAN";
  effective: "CURRENT" | "HISTORICAL";
  successorConditionStateId: string | null;
  provenance: D1hProvenanceRef;
  fingerprint: string;
};

export type D1hHumanValidation = {
  validationId: string;
  role: (typeof D1H_HUMAN_ROLES)[number];
  subject: (typeof D1H_VALIDATION_SUBJECTS)[number];
  subjectId: string;
  validatorRef: string;
  validatedAt: string;
  scopeStatement: string;
  designApproval: false;
  repairApproval: false;
  assetSafeDeclaration: false;
  provenance: D1hProvenanceRef;
  fingerprint: string;
};

export type D1hAnalysisResultReference = {
  referenceId: string;
  analysisResultId: string;
  targetId: string;
  contextualOnly: true;
  observedCondition: false;
  measuredResponse: false;
};

export type D1hAiDetectionCandidate = {
  candidateId: string;
  modelIdentity: string;
  modelVersion: string;
  executionFingerprint: string;
  evidenceId: string;
  locationCandidateId: string | null;
  classCandidate: D1hFindingCategory;
  confidence: number | null;
  timestamp: string;
  validatedFinding: false;
  provenance: D1hProvenanceRef;
};

export type D1hDigitalTwinHandoffRef = {
  structuralObjectId: string;
  conditionStateId: string;
  evidenceIds: readonly string[];
  measurementIds: readonly string[];
  validationIds: readonly string[];
  provenanceFingerprint: string;
  copiedEvidence: false;
};
