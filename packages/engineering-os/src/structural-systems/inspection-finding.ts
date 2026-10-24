/**
 * EOS-D1H-R2 structural finding, measurement, and human-validation foundation.
 * Reuses the D1H-R1 evidence runtime. Domain runtime only. No condition rating,
 * engineering acceptance, capacity change, repair design, or digital twin.
 */
import type { D1hFindingCategory, D1hProvenanceRef, StructuralQuantity } from "@rtb/types";
import { CANONICAL_INTERNAL_UNITS, D1H_FINDING_CATEGORIES, D1H_HUMAN_ROLES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D1hR1LocationInput, D1hR1Store } from "./inspection-evidence";
import { currentD1hR1Effective } from "./inspection-evidence";

export const D1H_R2_MATURITY_STATE = "STRUCTURAL_FINDING_MEASUREMENT_VALIDATION_RUNTIME_FOUNDATION_IMPLEMENTED" as const;
export const D1H_R2_STRUCTURAL_FINDING_RUNTIME_COUNT = 1 as const;
export const D1H_R2_MEASUREMENT_RUNTIME_COUNT = 1 as const;
export const D1H_R2_HUMAN_VALIDATION_RUNTIME_COUNT = 1 as const;
export const D1H_R2_CONDITION_STATE_RUNTIME_COUNT = 0 as const;
export const D1H_R2_CONDITION_RATING_RUNTIME_COUNT = 0 as const;
export const D1H_R2_ENGINEERING_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1H_R2_SEVERITY_RUNTIME_COUNT = 0 as const;
export const D1H_R2_SEVERITY_SCORING_ENGINE_COUNT = 0 as const;
export const D1H_R2_AI_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1H_R2_AI_FINDING_ENGINE_COUNT = 0 as const;
export const D1H_R2_AI_MEASUREMENT_ENGINE_COUNT = 0 as const;
export const D1H_R2_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1H_R2_ENGINEERING_THRESHOLD_COUNT = 0 as const;
export const D1H_R2_CROSS_INSPECTION_ASSOCIATION_RUNTIME_COUNT = 0 as const;
export const D1H_R2_REPAIR_RECOMMENDATION_ENGINE_COUNT = 0 as const;
export const D1H_R2_REPAIR_DESIGN_ENGINE_COUNT = 0 as const;
export const D1H_R2_FITNESS_FOR_SERVICE_ENGINE_COUNT = 0 as const;
export const D1H_R2_CORROSION_RATE_ENGINE_COUNT = 0 as const;
export const D1H_R2_FATIGUE_LIFE_ENGINE_COUNT = 0 as const;
export const D1H_R2_REMAINING_LIFE_ENGINE_COUNT = 0 as const;
export const D1H_R2_DIGITAL_TWIN_RUNTIME_COUNT = 0 as const;
export const EVIDENCE_EQUALS_STRUCTURAL_FINDING = false as const;
export const STRUCTURAL_FINDING_EQUALS_CONDITION_RATING = false as const;
export const MEASUREMENT_EQUALS_CONDITION_RATING = false as const;
export const HUMAN_VALIDATION_EQUALS_CONDITION_RATING = false as const;
export const HUMAN_VALIDATION_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1H_R2_RUNTIME_DIAGNOSTIC_EQUALS_STRUCTURAL_FINDING = false as const;
export const D1H_R2_BLOCKING_DIAGNOSTIC_EQUALS_STRUCTURAL_FINDING = false as const;
export const D1H_R2_RUNTIME_DIAGNOSTIC_NAMESPACE_DISTINCT = true as const;
export const D1H_R2_FINDING_TAXONOMY_REUSED = true as const;
export const D1H_R2_FINDING_TYPE_EQUALS_SEVERITY = false as const;
export const D1H_R2_FINDING_TYPE_EQUALS_CONDITION_RATING = false as const;
export const D1H_R2_FINDING_ORIGIN_EQUALS_AUTHORITY = false as const;
export const D1H_R2_FINDING_REQUIRES_EVIDENCE = true as const;
export const D1H_R2_FINDING_WITH_NO_TRACEABLE_EVIDENCE_ALLOWED = false as const;
export const D1H_R2_EVIDENCE_FINDING_LINK_AUTHORITY_REQUIRED = true as const;
export const AI_EVIDENCE_FINDING_LINK_CAN_GOVERN = false as const;
export const PHOTO_AUTO_CREATES_FINDING = false as const;
export const VIDEO_AUTO_CREATES_FINDING = false as const;
export const DOCUMENT_AUTO_CREATES_FINDING = false as const;
export const MEASUREMENT_EVIDENCE_AUTO_CREATES_FINDING = false as const;
export const ANALYSIS_RESULT_AUTO_CREATES_FINDING = false as const;
export const NEGATIVE_OBSERVATION_AUTO_CREATES_FINDING = false as const;
export const D1H_R2_NEGATIVE_OBSERVATION_CREATES_FINDING = false as const;
export const INSPECTED_NO_FINDING_RECORDED_CREATES_FINDING = false as const;
export const INSPECTED_NO_FINDING_RECORDED_EQUALS_GOOD_CONDITION = false as const;
export const D1H_R2_R1_TARGET_IDENTITY_REUSED = true as const;
export const PARALLEL_FINDING_TARGET_MODEL_CREATED = false as const;
export const D1H_R2_FINDING_LOCATION_GUESSED = false as const;
export const AI_FINDING_LOCATION_CAN_GOVERN = false as const;
export const D1H_R2_ORPHAN_FINDING_REGION_ALLOWED = false as const;
export const D1H_R2_FINDING_AUTHORITY_REQUIRED = true as const;
export const AI_FINDING_AUTHORITY = false as const;
export const D1H_R2_AI_CANDIDATE_CAN_EXIST = true as const;
export const D1H_R2_AI_CANDIDATE_GOVERNS = false as const;
export const D1H_R2_AI_CANDIDATE_AUTO_PROMOTED = false as const;
export const HUMAN_CONFIRMED_FINDING_EQUALS_BAD_CONDITION = false as const;
export const HUMAN_CONFIRMED_FINDING_EQUALS_UNSAFE = false as const;
export const HUMAN_CONFIRMED_FINDING_EQUALS_REPAIR_REQUIRED = false as const;
export const D1H_R2_EXISTING_QUANTITY_SYSTEM_REUSED = true as const;
export const D1H_R2_EXISTING_UNIT_SYSTEM_REUSED = true as const;
export const D1H_R2_MEASUREMENT_UNIT_REQUIRED = true as const;
export const D1H_R2_UNIT_INFERRED = false as const;
export const D1H_R2_MISSING_UNIT_EQUALS_DIMENSIONLESS = false as const;
export const D1H_R2_MEASUREMENT_SOURCE_EXPLICIT = true as const;
export const UNCALIBRATED_AI_MEASUREMENT_CAN_GOVERN = false as const;
export const AI_ESTIMATED_EQUALS_INSTRUMENT_MEASURED = false as const;
export const D1H_R2_MEASUREMENT_REQUIRES_FINDING = false as const;
export const D1H_R2_FINDING_REQUIRES_MEASUREMENT = false as const;
export const MEASURED_SECTION_LOSS_AUTO_UPDATES_SECTION_PROPERTY = false as const;
export const MEASURED_DEFORMATION_AUTO_UPDATES_ANALYSIS_GEOMETRY = false as const;
export const MEASURED_CRACK_WIDTH_AUTO_REDUCES_CAPACITY = false as const;
export const MEASURED_CORROSION_AUTO_REDUCES_MATERIAL_PROPERTY = false as const;
export const D1H_R2_ROLE_EQUALS_PROFESSIONAL_REGISTRATION = false as const;
export const D1H_R2_VALIDATOR_AUTHORIZATION_REQUIRED = true as const;
export const D1H_R2_SELF_VALIDATION_POLICY = "Validator identity and workflow role are preserved. This runtime does not impose a universal self-review prohibition and does not claim independence." as const;
export const D1H_R2_VALIDATION_SCOPE_EXPLICIT = true as const;
export const VALIDATING_FINDING_VALIDATES_MEASUREMENTS = false as const;
export const VALIDATING_MEASUREMENT_VALIDATES_FINDING = false as const;
export const VALIDATING_EVIDENCE_VALIDATES_CONDITION = false as const;
export const D1H_R2_VALIDATION_AUTO_PROPAGATION = false as const;
export const D1H_R2_HUMAN_VALIDATION_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const D1H_R2_HUMAN_VALIDATION_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1H_R2_HUMAN_VALIDATION_EQUALS_ASSET_SAFE = false as const;
export const D1H_R2_HUMAN_VALIDATION_EQUALS_REPAIR_APPROVAL = false as const;
export const D1H_R2_CONDITION_RATING_CREATED_FROM_FINDING = false as const;
export const D1H_R2_CONDITION_RATING_CREATED_FROM_MEASUREMENT = false as const;
export const NEW_FINDING_VERSION_OVERWRITES_OLD_FINDING = false as const;
export const CORRECTED_MEASUREMENT_OVERWRITES_PRIOR_MEASUREMENT = false as const;
export const NEW_VALIDATION_OVERWRITES_PRIOR_VALIDATION = false as const;
export const WITHDRAWN_VALIDATION_DELETES_PRIOR_VALIDATION = false as const;
export const D1H_R2_FINDING_AUTO_MATCH_ACROSS_INSPECTIONS = false as const;
export const D1H_R2_SIMILAR_FINDINGS_AUTO_MERGED = false as const;
export const AI_SIMILARITY_EQUALS_SAME_FINDING = false as const;
export const D1H_R2_FINDING_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R2_MEASUREMENT_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R2_VALIDATION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R2_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1H_R2_FINDING_PROVENANCE_COMPLETE = true as const;
export const D1H_R2_MEASUREMENT_PROVENANCE_COMPLETE = true as const;
export const D1H_R2_VALIDATION_PROVENANCE_COMPLETE = true as const;
export const D1H_R2_R1_EVIDENCE_STALENESS_PROPAGATES = true as const;
export const D1H_R2_FINDING_CHANGE_INVALIDATES_PRIOR_VALIDATION = true as const;
export const D1H_R2_MEASUREMENT_CHANGE_INVALIDATES_PRIOR_VALIDATION = true as const;
export const D1H_R2_VALIDATION_WITHDRAWAL_DELETES_SUBJECT = false as const;
export const D1H_R2_CROSS_PROJECT_BINDING_REJECTED = true as const;
export const D1H_R2_CROSS_TENANT_BINDING_REJECTED = true as const;
export const D1H_R2_TARGET_CONSISTENCY_ENFORCED = true as const;
export const D1H_R2_CROSS_TARGET_EVIDENCE_AUTO_LINKED = false as const;
export const D1H_R2_FINDING_AUTO_CREATES_COVERAGE = false as const;
export const D1H_R2_COMPLETE_EQUALS_GOOD_CONDITION = false as const;
export const D1H_R2_COMPLETE_EQUALS_INSPECTION_ADEQUATE = false as const;
export const D1H_R2_COMPLETE_EQUALS_STRUCTURALLY_ADEQUATE = false as const;
export const D1H_R2_RUNTIME_RESULT_EQUALS_CONDITION_ASSESSMENT = false as const;
export const D1H_R2_RUNTIME_RESULT_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const D1H_R2_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1H_R2_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1H_R2_AI_ENGINEERING_AUTHORITY_CREATED = false as const;
export const D1H_R2_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1H_R2_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1H_R2_FACE_RECOGNITION_IMPLEMENTED = false as const;
export const D1H_R2_FINDING_AUTO_CHANGES_SECTION_PROPERTIES = false as const;
export const D1H_R2_FINDING_AUTO_CHANGES_MATERIAL_PROPERTIES = false as const;
export const D1H_R2_FINDING_AUTO_CHANGES_CAPACITY = false as const;
export const D1H_R2_MEASUREMENT_AUTO_CHANGES_CAPACITY = false as const;
export const D1H_R2_FINDING_AUTO_CHANGES_ANALYSIS_MODEL = false as const;
export const D1H_R2_MEASUREMENT_AUTO_CHANGES_ANALYSIS_MODEL = false as const;
export const D1H_R2_VALIDATION_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1H_R3_HANDOFF_READY = true as const;
export const VALIDATED_FINDING_EQUALS_VALIDATED_CONDITION = false as const;
export const VALIDATED_MEASUREMENT_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const HUMAN_VALIDATION_SCOPE_PROPAGATES_AUTOMATICALLY = false as const;

export const D1H_R2_FINDING_ORIGINS = ["HUMAN_RECORDED", "IMPORTED", "AI_CANDIDATE", "DERIVED_FROM_GOVERNED_EVIDENCE"] as const;
export type D1hR2FindingOrigin = (typeof D1H_R2_FINDING_ORIGINS)[number];
export const D1H_R2_FINDING_VALIDATION_STATES = ["UNVALIDATED", "HUMAN_CONFIRMED", "SUPERSEDED", "STALE", "INVALID"] as const;
export type D1hR2FindingValidationState = (typeof D1H_R2_FINDING_VALIDATION_STATES)[number];
export const D1H_R2_MEASUREMENT_SOURCES = ["HUMAN_RECORDED", "INSTRUMENT_MEASURED", "AI_ESTIMATED", "IMPORTED", "GOVERNED_CALCULATED"] as const;
export type D1hR2MeasurementSource = (typeof D1H_R2_MEASUREMENT_SOURCES)[number];
export const D1H_R2_MEASUREMENT_VALIDATION_STATES = ["UNVALIDATED", "HUMAN_VALIDATED", "SUPERSEDED", "STALE", "INVALID"] as const;
export const D1H_R2_VALIDATION_SUBJECTS = [
  "EVIDENCE_IDENTITY",
  "EVIDENCE_TARGET_LINK",
  "STRUCTURAL_FINDING",
  "FINDING_CLASSIFICATION",
  "FINDING_LOCATION",
  "EVIDENCE_FINDING_LINK",
  "MEASUREMENT_VALUE",
  "MEASUREMENT_UNIT",
  "MEASUREMENT_LOCATION",
  "MEASUREMENT_METHOD",
] as const;
export type D1hR2ValidationSubject = (typeof D1H_R2_VALIDATION_SUBJECTS)[number];
export const D1H_R2_VALIDATION_DECISION_STATES = ["CONFIRMED", "REJECTED", "NEEDS_CORRECTION", "SUPERSEDED"] as const;
export type D1hR2ValidationDecision = (typeof D1H_R2_VALIDATION_DECISION_STATES)[number];
export const D1H_R2_COMPLETENESS_STATES = ["COMPLETE_FOR_DECLARED_R2_SCOPE", "PARTIAL", "INCOMPLETE", "INVALID", "STALE", "UNDETERMINED"] as const;
export type D1hR2Completeness = (typeof D1H_R2_COMPLETENESS_STATES)[number];
export const D1H_R2_EVENTS = [
  "STRUCTURAL_FINDING_RECORDED",
  "STRUCTURAL_FINDING_SUPERSEDED",
  "STRUCTURAL_FINDING_INVALIDATED",
  "INSPECTION_MEASUREMENT_RECORDED",
  "INSPECTION_MEASUREMENT_SUPERSEDED",
  "INSPECTION_MEASUREMENT_INVALIDATED",
  "HUMAN_VALIDATION_RECORDED",
  "HUMAN_VALIDATION_WITHDRAWN",
  "HUMAN_VALIDATION_SUPERSEDED",
] as const;
export const D1H_R2_INVALIDATION_CAUSES = [
  "SUPPORTING_EVIDENCE_STALE",
  "TARGET_STALE",
  "FINDING_LOCATION_CORRECTED",
  "FINDING_CLASSIFICATION_CORRECTED",
  "MEASUREMENT_CORRECTED",
  "UNIT_CORRECTED",
  "MEASUREMENT_METHOD_CORRECTED",
  "VALIDATION_WITHDRAWN",
  "VALIDATOR_AUTHORITY_WITHDRAWN",
  "CONTEXT_SUPERSEDED",
] as const;
export type D1hR2InvalidationCause = (typeof D1H_R2_INVALIDATION_CAUSES)[number];
export const D1H_R2_EFFECTIVE_STATES = ["CURRENT", "HISTORICAL", "SUPERSEDED", "STALE"] as const;
export type D1hR2EffectiveState = (typeof D1H_R2_EFFECTIVE_STATES)[number];
export const D1H_R3_REQUIRED_R2_CONTRACTS = [
  "inspectionContextIdentity",
  "structuralTargetIdentity",
  "coverageIdentity",
  "evidenceIdentity",
  "structuralFindingIdentity",
  "evidenceFindingLink",
  "measurementIdentity",
  "humanValidationIdentity",
  "authority",
  "provenance",
  "fingerprints",
  "historySupersession",
  "invalidation",
  "completeness",
] as const;
export const D1H_R2_CANONICAL_UNITS = CANONICAL_INTERNAL_UNITS;

const FORBIDDEN_SCOPE_KEYS = [
  "conditionRating",
  "conditionStateId",
  "severityScore",
  "repairDesign",
  "repairRecommendation",
  "safe",
  "unsafe",
  "faceRecognition",
  "workerIdentity",
  "employeeScore",
  "productivityScore",
  "behaviorScore",
  "runDetection",
  "sectionPropertyUpdate",
  "capacityReduction",
] as const;

export type D1hR2ValidatorAuthorization = {
  validatorId: string;
  role: (typeof D1H_HUMAN_ROLES)[number];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authorized: boolean;
};

export type D1hR2StructuralFinding = {
  recordKind: "STRUCTURAL_FINDING";
  findingId: string;
  inspectionContextId: string;
  inspectionSessionId: string;
  targetId: string;
  findingType: D1hFindingCategory;
  location: D1hR1LocationInput | null;
  supportingEvidenceIds: readonly string[];
  origin: D1hR2FindingOrigin;
  authority: string;
  validationState: "UNVALIDATED";
  createdAt: string;
  createdBy: string;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesFindingId: string | null;
  governs: boolean;
  conditionRating: false;
  severity: false;
  badCondition: false;
  unsafe: false;
  repairRequired: false;
  sectionPropertiesChanged: false;
  materialPropertiesChanged: false;
  capacityChanged: false;
  analysisModelChanged: false;
};

export type D1hR2EvidenceFindingLink = {
  recordKind: "EVIDENCE_FINDING_LINK";
  linkId: string;
  evidenceId: string;
  findingId: string;
  authority: string;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  automatic: false;
  governs: boolean;
};

export type D1hR2InspectionMeasurement = {
  recordKind: "INSPECTION_MEASUREMENT";
  measurementId: string;
  inspectionContextId: string;
  inspectionSessionId: string;
  targetId: string;
  evidenceId: string;
  findingId: string | null;
  quantity: string;
  value: number;
  unit: string;
  location: D1hR1LocationInput | null;
  methodRef: string;
  sourceType: D1hR2MeasurementSource;
  instrumentRef: string | null;
  measuredAt: string;
  uncertainty: string | null;
  accuracy: string | null;
  calibrationBasis: string | null;
  modelIdentity: string | null;
  modelVersion: string | null;
  authority: string;
  validationState: "UNVALIDATED";
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesMeasurementId: string | null;
  governs: boolean;
  instrumentMeasured: boolean;
  sectionPropertyUpdated: false;
  analysisGeometryUpdated: false;
  capacityChanged: false;
  materialPropertyChanged: false;
  analysisModelChanged: false;
};

export type D1hR2HumanValidation = {
  recordKind: "HUMAN_VALIDATION";
  validationId: string;
  subjectType: D1hR2ValidationSubject;
  subjectId: string;
  subjectVersion: string;
  scopeStatement: string;
  validatorId: string;
  role: (typeof D1H_HUMAN_ROLES)[number];
  validatedAt: string;
  decision: D1hR2ValidationDecision;
  limitations: string;
  authority: string;
  provenance: D1hProvenanceRef;
  version: string;
  fingerprint: string;
  supersedesValidationId: string | null;
  engineeringAcceptance: false;
  structuralAdequacy: false;
  assetSafe: false;
  repairApproval: false;
  conditionRating: false;
  independenceClaimed: false;
  professionalRegistrationInferred: false;
};

type HistoryAction = "CREATED" | "CORRECTED" | "SUPERSEDED" | "INVALIDATED" | "WITHDRAWN";
type SubjectKind = "FINDING" | "LINK" | "MEASUREMENT" | "VALIDATION";

export type D1hR2Store = {
  structuralFindings: D1hR2StructuralFinding[];
  links: D1hR2EvidenceFindingLink[];
  measurements: D1hR2InspectionMeasurement[];
  validations: D1hR2HumanValidation[];
  history: Array<{ historyId: string; subjectKind: SubjectKind; subjectId: string; action: HistoryAction; version: string; fingerprint: string; recordedAt: string; predecessorId: string | null }>;
  states: Array<{ subjectKind: SubjectKind; subjectId: string; effective: D1hR2EffectiveState; recordedAt: string }>;
  invalidations: Array<{ invalidationId: string; cause: D1hR2InvalidationCause; subjectKind: SubjectKind; subjectId: string; recordedAt: string; deletesHistory: false; deletesSubject: false }>;
  events: Array<{ eventId: string; eventType: (typeof D1H_R2_EVENTS)[number]; subjectId: string; recordedAt: string; engineeringApproval: false }>;
};

export type D1hR2RuntimeResult = {
  resultId: string;
  inspectionContextId: string;
  findingIds: readonly string[];
  measurementIds: readonly string[];
  validationIds: readonly string[];
  scope: string;
  completeness: D1hR2Completeness;
  runtimeDiagnostics: readonly { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[];
  blockingDiagnostics: readonly { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[];
  warnings: readonly string[];
  provenance: D1hProvenanceRef;
  fingerprint: string;
  conditionAssessment: false;
  engineeringAcceptance: false;
  goodCondition: false;
  inspectionAdequate: false;
  structurallyAdequate: false;
  conditionStateIds: readonly [];
  conditionRatingIds: readonly [];
  engineeringInterpretationIds: readonly [];
};

export function createD1hR2Store(): D1hR2Store {
  return { structuralFindings: [], links: [], measurements: [], validations: [], history: [], states: [], invalidations: [], events: [] };
}

export function promoteAiCandidateFinding(): never {
  throw new Error("AI_CANDIDATE_AUTO_PROMOTED_REJECTED");
}

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

function humanAuthority(authority: string): void {
  const normalized = required(authority, "AUTHORITY_REQUIRED").toUpperCase();
  if (normalized.startsWith("AI") || normalized.includes("LLM")) fail("AI_AUTHORITY_REJECTED");
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function current(store: D1hR2Store, kind: SubjectKind, subjectId: string): D1hR2EffectiveState {
  const rows = store.states.filter((row) => row.subjectKind === kind && row.subjectId === subjectId);
  return rows.length === 0 ? "CURRENT" : rows[rows.length - 1]!.effective;
}

function remember(store: D1hR2Store, kind: SubjectKind, subjectId: string, action: HistoryAction, version: string, fingerprint: string, recordedAt: string, predecessorId: string | null, effective: D1hR2EffectiveState): void {
  store.history.push({ historyId: `${kind}:${subjectId}:${action}:${version}`, subjectKind: kind, subjectId, action, version, fingerprint, recordedAt, predecessorId });
  store.states.push({ subjectKind: kind, subjectId, effective, recordedAt });
}

function emit(store: D1hR2Store, eventType: (typeof D1H_R2_EVENTS)[number], subjectId: string, recordedAt: string, version: string): void {
  store.events.push({ eventId: `${eventType}:${subjectId}:${version}`, eventType, subjectId, recordedAt, engineeringApproval: false });
}

function contextOf(r1: D1hR1Store, inspectionContextId: string) {
  const context = r1.contexts.find((row) => row.inspectionContextId === inspectionContextId);
  if (!context) fail("CONTEXT_UNKNOWN");
  return context;
}

function assertLocation(location: D1hR1LocationInput | null, requiredLocation: boolean): void {
  if (requiredLocation && !location) fail("LOCATION_REQUIRED");
  if (!location) return;
  if (location.explicit !== true || location.inferredBy) fail("LOCATION_GUESSED");
  if (location.aiSuggested) fail("AI_LOCATION_CANNOT_GOVERN");
}

function assertUnit(quantity: string, value: number, unit: string | null, dimensionless: boolean): StructuralQuantity {
  required(quantity, "QUANTITY_REQUIRED");
  if (!Number.isFinite(value)) fail("MEASUREMENT_VALUE_REQUIRED");
  if (unit === null || unit.trim() === "") fail("MISSING_UNIT");
  if (dimensionless) {
    if (unit !== "dimensionless" && unit !== "1") fail("DIMENSIONLESS_UNIT_REQUIRED");
    return { value, unit };
  }
  if (unit === "dimensionless" || unit === "1") fail("MISSING_UNIT_NOT_DIMENSIONLESS");
  if (!Object.values(CANONICAL_INTERNAL_UNITS).includes(unit as (typeof CANONICAL_INTERNAL_UNITS)[keyof typeof CANONICAL_INTERNAL_UNITS])) fail("UNIT_NOT_IN_CANONICAL_SYSTEM");
  return { value, unit };
}

export type D1hR2FindingInput = {
  findingId: string;
  inspectionContextId: string;
  targetId: string;
  findingType: D1hFindingCategory;
  location: D1hR1LocationInput | null;
  supportingEvidenceIds: readonly string[];
  origin: D1hR2FindingOrigin;
  authority: string;
  createdAt: string;
  createdBy: string;
  provenance: D1hProvenanceRef;
  version: string;
  modelIdentity: string | null;
  modelVersion: string | null;
  executionFingerprint: string | null;
};

function assertEvidenceLink(r1: D1hR1Store, finding: D1hR2StructuralFinding, evidenceId: string, authority: string): void {
  const context = contextOf(r1, finding.inspectionContextId);
  const evidence = r1.evidence.find((row) => row.evidenceId === evidenceId);
  if (!evidence) fail("EVIDENCE_UNKNOWN");
  const evidenceContext = contextOf(r1, evidence.inspectionContextId);
  if (evidenceContext.tenantId !== context.tenantId) fail("CROSS_TENANT_BINDING_REJECTED");
  if (evidenceContext.projectId !== context.projectId || evidenceContext.workspaceId !== context.workspaceId) fail("CROSS_PROJECT_BINDING_REJECTED");
  if (evidence.inspectionSessionId !== context.inspectionSessionId) fail("CROSS_INSPECTION_ASSOCIATION_REJECTED");
  if (evidence.explicitNegativeObservation) fail("NEGATIVE_OBSERVATION_CANNOT_CREATE_FINDING");
  if (evidence.targetId !== finding.targetId) fail("TARGET_MISMATCH");
  const target = r1.targets.find((row) => row.inspectionContextId === context.inspectionContextId && row.targetId === finding.targetId);
  if (!target) fail("TARGET_UNKNOWN");
  if (target.targetKind === "BOUNDED_REGION" && (!target.parentTargetId || !target.parentTargetKind)) fail("ORPHAN_FINDING_REGION");
  if (currentD1hR1Effective(r1, "TARGET", target.targetId) === "STALE") fail("STALE_TARGET");
  if (!r1.coverages.some((row) => row.inspectionContextId === context.inspectionContextId && row.targetId === finding.targetId)) fail("COVERAGE_REQUIRED");
  if (finding.origin === "AI_CANDIDATE") {
    if (!authority.toUpperCase().startsWith("AI")) fail("AI_CANDIDATE_AUTHORITY_REQUIRED");
  } else humanAuthority(authority);
}

function commitEvidenceLink(r1: D1hR1Store, r2: D1hR2Store, finding: D1hR2StructuralFinding, evidenceId: string, authority: string, provenance: D1hProvenanceRef): D1hR2EvidenceFindingLink {
  const beforeCoverage = r1.coverages.length;
  const fingerprint = fingerprintCanonical({ subject: "D1H_R2_LINK", evidenceId, findingId: finding.findingId, authority, version: finding.version });
  const link: D1hR2EvidenceFindingLink = {
    recordKind: "EVIDENCE_FINDING_LINK",
    linkId: `${finding.findingId}:${evidenceId}`,
    evidenceId,
    findingId: finding.findingId,
    authority,
    provenance: { ...provenance, fingerprint },
    version: finding.version,
    fingerprint,
    automatic: false,
    governs: finding.origin !== "AI_CANDIDATE",
  };
  r2.links.push(link);
  remember(r2, "LINK", link.linkId, "CREATED", link.version, fingerprint, finding.createdAt, null, "CURRENT");
  if (r1.coverages.length !== beforeCoverage) fail("FINDING_CREATED_COVERAGE");
  return link;
}

export function recordStructuralFinding(r1: D1hR1Store, r2: D1hR2Store, input: D1hR2FindingInput): D1hR2StructuralFinding {
  assertScope(input);
  if (!D1H_FINDING_CATEGORIES.includes(input.findingType)) fail("FINDING_TYPE_UNKNOWN");
  if (!D1H_R2_FINDING_ORIGINS.includes(input.origin)) fail("FINDING_ORIGIN_UNKNOWN");
  if (r2.structuralFindings.some((row) => row.findingId === input.findingId)) fail("DUPLICATE_FINDING_ID");
  if (input.supportingEvidenceIds.length === 0) fail("FINDING_EVIDENCE_REQUIRED");
  const context = contextOf(r1, input.inspectionContextId);
  assertProvenance(input.provenance, context);
  const target = r1.targets.find((row) => row.inspectionContextId === context.inspectionContextId && row.targetId === input.targetId);
  if (!target) fail("TARGET_UNKNOWN");
  assertLocation(input.location, target.targetKind !== "STRUCTURAL_SYSTEM");
  const governs = input.origin !== "AI_CANDIDATE";
  if (!governs) {
    required(input.modelIdentity, "AI_MODEL_PROVENANCE_REQUIRED");
    required(input.modelVersion, "AI_MODEL_PROVENANCE_REQUIRED");
    required(input.executionFingerprint, "AI_MODEL_PROVENANCE_REQUIRED");
    if (!input.authority.toUpperCase().startsWith("AI")) fail("AI_CANDIDATE_AUTHORITY_REQUIRED");
  } else humanAuthority(input.authority);
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R2_FINDING",
    inspectionContextId: input.inspectionContextId,
    inspectionSessionId: context.inspectionSessionId,
    targetId: input.targetId,
    location: input.location ? { locationId: input.location.locationId, locationKind: input.location.locationKind, description: input.location.description } : null,
    findingType: input.findingType,
    supportingEvidenceIds: sorted(input.supportingEvidenceIds),
    origin: input.origin,
    authority: input.authority,
    version: input.version,
  });
  const finding: D1hR2StructuralFinding = {
    recordKind: "STRUCTURAL_FINDING",
    findingId: input.findingId,
    inspectionContextId: input.inspectionContextId,
    inspectionSessionId: context.inspectionSessionId,
    targetId: input.targetId,
    findingType: input.findingType,
    location: input.location,
    supportingEvidenceIds: sorted(input.supportingEvidenceIds),
    origin: input.origin,
    authority: input.authority,
    validationState: "UNVALIDATED",
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    provenance: { ...input.provenance, fingerprint },
    version: input.version,
    fingerprint,
    supersedesFindingId: null,
    governs,
    conditionRating: false,
    severity: false,
    badCondition: false,
    unsafe: false,
    repairRequired: false,
    sectionPropertiesChanged: false,
    materialPropertiesChanged: false,
    capacityChanged: false,
    analysisModelChanged: false,
  };
  for (const evidenceId of finding.supportingEvidenceIds) assertEvidenceLink(r1, finding, evidenceId, input.authority);
  r2.structuralFindings.push(finding);
  for (const evidenceId of finding.supportingEvidenceIds) commitEvidenceLink(r1, r2, finding, evidenceId, input.authority, input.provenance);
  remember(r2, "FINDING", finding.findingId, "CREATED", finding.version, fingerprint, finding.createdAt, null, "CURRENT");
  emit(r2, "STRUCTURAL_FINDING_RECORDED", finding.findingId, finding.createdAt, finding.version);
  return finding;
}

export type D1hR2MeasurementInput = {
  measurementId: string;
  inspectionContextId: string;
  targetId: string;
  evidenceId: string;
  findingId: string | null;
  quantity: string;
  value: number;
  unit: string | null;
  dimensionless: boolean;
  location: D1hR1LocationInput | null;
  methodRef: string;
  sourceType: D1hR2MeasurementSource;
  instrumentRef: string | null;
  measuredAt: string;
  uncertainty: string | null;
  accuracy: string | null;
  calibrationBasis: string | null;
  modelIdentity: string | null;
  modelVersion: string | null;
  authority: string;
  provenance: D1hProvenanceRef;
  version: string;
};

export function recordInspectionMeasurement(r1: D1hR1Store, r2: D1hR2Store, input: D1hR2MeasurementInput): D1hR2InspectionMeasurement {
  assertScope(input);
  if (!D1H_R2_MEASUREMENT_SOURCES.includes(input.sourceType)) fail("MEASUREMENT_SOURCE_REQUIRED");
  if (r2.measurements.some((row) => row.measurementId === input.measurementId)) fail("DUPLICATE_MEASUREMENT_ID");
  const context = contextOf(r1, input.inspectionContextId);
  assertProvenance(input.provenance, context);
  const evidence = r1.evidence.find((row) => row.evidenceId === input.evidenceId);
  if (!evidence) fail("EVIDENCE_UNKNOWN");
  if (evidence.inspectionContextId !== context.inspectionContextId) fail("CROSS_PROJECT_BINDING_REJECTED");
  if (evidence.targetId !== input.targetId) fail("TARGET_MISMATCH");
  if (input.findingId) {
    const finding = r2.structuralFindings.find((row) => row.findingId === input.findingId);
    if (!finding || finding.targetId !== input.targetId || finding.inspectionContextId !== context.inspectionContextId) fail("FINDING_LINK_MISMATCH");
  }
  const target = r1.targets.find((row) => row.targetId === input.targetId && row.inspectionContextId === context.inspectionContextId);
  if (!target) fail("TARGET_UNKNOWN");
  assertLocation(input.location, target.targetKind !== "STRUCTURAL_SYSTEM");
  const quantity = assertUnit(input.quantity, input.value, input.unit, input.dimensionless);
  const ai = input.sourceType === "AI_ESTIMATED";
  if (ai) {
    required(input.modelIdentity, "AI_MODEL_PROVENANCE_REQUIRED");
    required(input.modelVersion, "AI_MODEL_PROVENANCE_REQUIRED");
  } else humanAuthority(input.authority);
  required(input.methodRef, "METHOD_REFERENCE_REQUIRED");
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R2_MEASUREMENT",
    targetId: input.targetId,
    evidenceId: input.evidenceId,
    findingId: input.findingId,
    quantity: quantity.unit ? input.quantity : input.quantity,
    quantityName: input.quantity,
    value: quantity.value,
    unit: quantity.unit,
    location: input.location ? { locationId: input.location.locationId, locationKind: input.location.locationKind, description: input.location.description } : null,
    methodRef: input.methodRef,
    sourceType: input.sourceType,
    instrumentRef: input.instrumentRef,
    measuredAt: input.measuredAt,
    authority: input.authority,
    version: input.version,
  });
  const record: D1hR2InspectionMeasurement = {
    recordKind: "INSPECTION_MEASUREMENT",
    measurementId: input.measurementId,
    inspectionContextId: context.inspectionContextId,
    inspectionSessionId: context.inspectionSessionId,
    targetId: input.targetId,
    evidenceId: input.evidenceId,
    findingId: input.findingId,
    quantity: input.quantity,
    value: quantity.value,
    unit: quantity.unit,
    location: input.location,
    methodRef: input.methodRef,
    sourceType: input.sourceType,
    instrumentRef: input.instrumentRef,
    measuredAt: input.measuredAt,
    uncertainty: input.uncertainty,
    accuracy: input.accuracy,
    calibrationBasis: input.calibrationBasis,
    modelIdentity: input.modelIdentity,
    modelVersion: input.modelVersion,
    authority: input.authority,
    validationState: "UNVALIDATED",
    provenance: { ...input.provenance, fingerprint },
    version: input.version,
    fingerprint,
    supersedesMeasurementId: null,
    governs: false,
    instrumentMeasured: input.sourceType === "INSTRUMENT_MEASURED",
    sectionPropertyUpdated: false,
    analysisGeometryUpdated: false,
    capacityChanged: false,
    materialPropertyChanged: false,
    analysisModelChanged: false,
  };
  r2.measurements.push(record);
  remember(r2, "MEASUREMENT", record.measurementId, "CREATED", record.version, fingerprint, input.measuredAt, null, "CURRENT");
  emit(r2, "INSPECTION_MEASUREMENT_RECORDED", record.measurementId, input.measuredAt, record.version);
  return record;
}

export type D1hR2ValidationInput = {
  validationId: string;
  inspectionContextId: string;
  subjectType: D1hR2ValidationSubject;
  subjectId: string;
  scopeStatement: string;
  validatorId: string;
  role: (typeof D1H_HUMAN_ROLES)[number];
  validatedAt: string;
  decision: D1hR2ValidationDecision;
  limitations: string;
  authority: string;
  provenance: D1hProvenanceRef;
  version: string;
  supersedesValidationId: string | null;
};

export function recordHumanValidation(r1: D1hR1Store, r2: D1hR2Store, validators: readonly D1hR2ValidatorAuthorization[], input: D1hR2ValidationInput): D1hR2HumanValidation {
  assertScope(input);
  if (!D1H_R2_VALIDATION_SUBJECTS.includes(input.subjectType)) fail("VALIDATION_SUBJECT_UNKNOWN");
  if (!D1H_R2_VALIDATION_DECISION_STATES.includes(input.decision)) fail("VALIDATION_DECISION_UNKNOWN");
  if (r2.validations.some((row) => row.validationId === input.validationId)) fail("DUPLICATE_VALIDATION_ID");
  const context = contextOf(r1, input.inspectionContextId);
  assertProvenance(input.provenance, context);
  humanAuthority(input.authority);
  required(input.scopeStatement, "VALIDATION_SCOPE_REQUIRED");
  const authorization = validators.find((row) => row.validatorId === input.validatorId && row.role === input.role);
  if (!authorization || !authorization.authorized) fail("VALIDATOR_UNAUTHORIZED");
  if (authorization.tenantId !== context.tenantId) fail("CROSS_TENANT_BINDING_REJECTED");
  if (authorization.projectId !== context.projectId || authorization.workspaceId !== context.workspaceId) fail("CROSS_PROJECT_BINDING_REJECTED");
  const subjectVersion = subjectVersionOf(r1, r2, input.subjectType, input.subjectId);
  const fingerprint = fingerprintCanonical({
    subject: "D1H_R2_VALIDATION",
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
  const record: D1hR2HumanValidation = {
    recordKind: "HUMAN_VALIDATION",
    validationId: input.validationId,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    subjectVersion,
    scopeStatement: input.scopeStatement,
    validatorId: input.validatorId,
    role: input.role,
    validatedAt: input.validatedAt,
    decision: input.decision,
    limitations: input.limitations,
    authority: input.authority,
    provenance: { ...input.provenance, fingerprint },
    version: input.version,
    fingerprint,
    supersedesValidationId: input.supersedesValidationId,
    engineeringAcceptance: false,
    structuralAdequacy: false,
    assetSafe: false,
    repairApproval: false,
    conditionRating: false,
    independenceClaimed: false,
    professionalRegistrationInferred: false,
  };
  r2.validations.push(record);
  remember(r2, "VALIDATION", record.validationId, "CREATED", record.version, fingerprint, record.validatedAt, input.supersedesValidationId, "CURRENT");
  emit(r2, "HUMAN_VALIDATION_RECORDED", record.validationId, record.validatedAt, record.version);
  return record;
}

function subjectVersionOf(r1: D1hR1Store, r2: D1hR2Store, subjectType: D1hR2ValidationSubject, subjectId: string): string {
  if (subjectType.startsWith("MEASUREMENT")) {
    const measurement = r2.measurements.find((row) => row.measurementId === subjectId);
    if (!measurement) fail("VALIDATION_SUBJECT_UNKNOWN");
    return measurement.version;
  }
  if (subjectType === "EVIDENCE_IDENTITY" || subjectType === "EVIDENCE_TARGET_LINK") {
    const evidence = r1.evidence.find((row) => row.evidenceId === subjectId);
    if (!evidence) fail("VALIDATION_SUBJECT_UNKNOWN");
    return evidence.version;
  }
  if (subjectType === "EVIDENCE_FINDING_LINK") {
    const link = r2.links.find((row) => row.linkId === subjectId);
    if (!link) fail("VALIDATION_SUBJECT_UNKNOWN");
    return link.version;
  }
  const finding = r2.structuralFindings.find((row) => row.findingId === subjectId);
  if (!finding) fail("VALIDATION_SUBJECT_UNKNOWN");
  return finding.version;
}

function invalidateSubject(r2: D1hR2Store, cause: D1hR2InvalidationCause, kind: SubjectKind, subjectId: string, recordedAt: string, eventType: (typeof D1H_R2_EVENTS)[number]): void {
  if (current(r2, kind, subjectId) === "STALE") return;
  const fingerprint = kind === "FINDING"
    ? r2.structuralFindings.find((row) => row.findingId === subjectId)?.fingerprint ?? ""
    : kind === "MEASUREMENT"
      ? r2.measurements.find((row) => row.measurementId === subjectId)?.fingerprint ?? ""
      : r2.validations.find((row) => row.validationId === subjectId)?.fingerprint ?? "";
  r2.invalidations.push({ invalidationId: `${cause}:${kind}:${subjectId}`, cause, subjectKind: kind, subjectId, recordedAt, deletesHistory: false, deletesSubject: false });
  r2.states.push({ subjectKind: kind, subjectId, effective: "STALE", recordedAt });
  r2.history.push({ historyId: `${kind}:${subjectId}:INVALIDATED:${cause}`, subjectKind: kind, subjectId, action: "INVALIDATED", version: cause, fingerprint, recordedAt, predecessorId: null });
  emit(r2, eventType, subjectId, recordedAt, cause);
}

export function propagateR1EvidenceStaleness(r1: D1hR1Store, r2: D1hR2Store, recordedAt: string): void {
  for (const evidence of r1.evidence) {
    if (currentD1hR1Effective(r1, "EVIDENCE", evidence.evidenceId) !== "STALE" && currentD1hR1Effective(r1, "TARGET", evidence.targetId) !== "STALE") continue;
    const cause = currentD1hR1Effective(r1, "TARGET", evidence.targetId) === "STALE" ? "TARGET_STALE" : "SUPPORTING_EVIDENCE_STALE";
    for (const finding of r2.structuralFindings) {
      if (finding.supportingEvidenceIds.includes(evidence.evidenceId)) invalidateSubject(r2, cause, "FINDING", finding.findingId, recordedAt, "STRUCTURAL_FINDING_INVALIDATED");
    }
    for (const measurement of r2.measurements) {
      if (measurement.evidenceId === evidence.evidenceId) invalidateSubject(r2, cause, "MEASUREMENT", measurement.measurementId, recordedAt, "INSPECTION_MEASUREMENT_INVALIDATED");
    }
  }
}

function staleValidations(r2: D1hR2Store, subjectId: string, cause: D1hR2InvalidationCause, recordedAt: string): void {
  for (const validation of r2.validations) {
    if (validation.subjectId === subjectId) invalidateSubject(r2, cause, "VALIDATION", validation.validationId, recordedAt, "HUMAN_VALIDATION_SUPERSEDED");
  }
}

export function correctStructuralFinding(r1: D1hR1Store, r2: D1hR2Store, predecessorId: string, input: D1hR2FindingInput, cause: "FINDING_LOCATION_CORRECTED" | "FINDING_CLASSIFICATION_CORRECTED"): D1hR2StructuralFinding {
  const prior = r2.structuralFindings.find((row) => row.findingId === predecessorId);
  if (!prior) fail("PREDECESSOR_UNKNOWN");
  const snapshot = JSON.stringify(prior);
  if (input.version === prior.version) fail("CORRECTION_VERSION_REQUIRED");
  const successor = recordStructuralFinding(r1, r2, input);
  const written = r2.structuralFindings[r2.structuralFindings.length - 1]!;
  written.supersedesFindingId = predecessorId;
  if (JSON.stringify(prior) !== snapshot) fail("HISTORICAL_RECORD_MUTATED");
  r2.states.push({ subjectKind: "FINDING", subjectId: predecessorId, effective: "SUPERSEDED", recordedAt: input.createdAt });
  emit(r2, "STRUCTURAL_FINDING_SUPERSEDED", predecessorId, input.createdAt, prior.version);
  staleValidations(r2, predecessorId, cause, input.createdAt);
  return successor;
}

export function correctInspectionMeasurement(r1: D1hR1Store, r2: D1hR2Store, predecessorId: string, input: D1hR2MeasurementInput, cause: "MEASUREMENT_CORRECTED" | "UNIT_CORRECTED" | "MEASUREMENT_METHOD_CORRECTED"): D1hR2InspectionMeasurement {
  const prior = r2.measurements.find((row) => row.measurementId === predecessorId);
  if (!prior) fail("PREDECESSOR_UNKNOWN");
  const snapshot = JSON.stringify(prior);
  if (input.version === prior.version) fail("CORRECTION_VERSION_REQUIRED");
  const successor = recordInspectionMeasurement(r1, r2, input);
  const written = r2.measurements[r2.measurements.length - 1]!;
  written.supersedesMeasurementId = predecessorId;
  if (JSON.stringify(prior) !== snapshot) fail("HISTORICAL_RECORD_MUTATED");
  r2.states.push({ subjectKind: "MEASUREMENT", subjectId: predecessorId, effective: "SUPERSEDED", recordedAt: input.measuredAt });
  emit(r2, "INSPECTION_MEASUREMENT_SUPERSEDED", predecessorId, input.measuredAt, prior.version);
  staleValidations(r2, predecessorId, cause, input.measuredAt);
  return successor;
}

export function withdrawHumanValidation(r2: D1hR2Store, validationId: string, recordedAt: string): void {
  const validation = r2.validations.find((row) => row.validationId === validationId);
  if (!validation) fail("VALIDATION_UNKNOWN");
  const findingCount = r2.structuralFindings.length;
  const measurementCount = r2.measurements.length;
  const validationCount = r2.validations.length;
  invalidateSubject(r2, "VALIDATION_WITHDRAWN", "VALIDATION", validationId, recordedAt, "HUMAN_VALIDATION_WITHDRAWN");
  if (r2.structuralFindings.length !== findingCount || r2.measurements.length !== measurementCount || r2.validations.length !== validationCount) fail("WITHDRAWAL_DELETED_SUBJECT");
}

export function structuralFindingProvenance(r1: D1hR1Store, r2: D1hR2Store, findingId: string): readonly string[] {
  const finding = r2.structuralFindings.find((row) => row.findingId === findingId);
  if (!finding) fail("FINDING_UNKNOWN");
  const context = contextOf(r1, finding.inspectionContextId);
  const chain = [`system:${context.structuralSystemId}`, `context:${context.inspectionContextId}`];
  const coverage = r1.coverages.find((row) => row.inspectionContextId === context.inspectionContextId && row.targetId === finding.targetId);
  if (coverage) chain.push(`coverage:${coverage.coverageId}`);
  for (const evidenceId of finding.supportingEvidenceIds) chain.push(`evidence:${evidenceId}`);
  for (const link of r2.links.filter((row) => row.findingId === finding.findingId)) chain.push(`link:${link.linkId}`);
  chain.push(`finding:${finding.findingId}`);
  for (const measurement of r2.measurements.filter((row) => row.findingId === finding.findingId)) chain.push(`measurement:${measurement.measurementId}`);
  for (const validation of r2.validations.filter((row) => row.subjectId === finding.findingId)) chain.push(`validation:${validation.validationId}`);
  return chain;
}

export function evaluateStructuralFindingMeasurementValidation(r1: D1hR1Store, r2: D1hR2Store, input: { inspectionContextId: string; declaredFindingIds: readonly string[]; declaredMeasurementIds: readonly string[]; declaredValidationIds: readonly string[] }): D1hR2RuntimeResult {
  const context = contextOf(r1, input.inspectionContextId);
  propagateR1EvidenceStaleness(r1, r2, context.recordedAt);
  const findings = r2.structuralFindings.filter((row) => row.inspectionContextId === context.inspectionContextId);
  const measurements = r2.measurements.filter((row) => row.inspectionContextId === context.inspectionContextId);
  const findingIds = new Set(findings.map((row) => row.findingId));
  const measurementIds = new Set(measurements.map((row) => row.measurementId));
  const validations = r2.validations.filter((row) => findingIds.has(row.subjectId) || measurementIds.has(row.subjectId) || r1.evidence.some((item) => item.evidenceId === row.subjectId && item.inspectionContextId === context.inspectionContextId) || r2.links.some((link) => link.linkId === row.subjectId && findingIds.has(link.findingId)));
  const diagnostics: { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[] = [];
  const blocking: { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false }[] = [];
  const stale = findings.some((row) => current(r2, "FINDING", row.findingId) === "STALE") || measurements.some((row) => current(r2, "MEASUREMENT", row.measurementId) === "STALE");
  const declared = [...input.declaredFindingIds, ...input.declaredMeasurementIds, ...input.declaredValidationIds];
  const present = (id: string) => findingIds.has(id) || measurementIds.has(id) || validations.some((row) => row.validationId === id);
  let completeness: D1hR2Completeness;
  if (stale) completeness = "STALE";
  else if (declared.length === 0) completeness = "UNDETERMINED";
  else if (declared.every((id) => !present(id))) completeness = "INCOMPLETE";
  else if (declared.some((id) => !present(id))) completeness = "PARTIAL";
  else completeness = "COMPLETE_FOR_DECLARED_R2_SCOPE";
  const payload = {
    subject: "D1H_R2_RESULT",
    inspectionContextId: context.inspectionContextId,
    findingIds: sorted(findings.map((row) => row.findingId)),
    measurementIds: sorted(measurements.map((row) => row.measurementId)),
    validationIds: sorted(validations.map((row) => row.validationId)),
    completeness,
    blocking: blocking.map((row) => row.code),
  };
  const fingerprint = fingerprintCanonical(payload);
  return {
    resultId: fingerprint,
    inspectionContextId: context.inspectionContextId,
    findingIds: payload.findingIds,
    measurementIds: payload.measurementIds,
    validationIds: payload.validationIds,
    scope: context.scopeStatement,
    completeness,
    runtimeDiagnostics: diagnostics,
    blockingDiagnostics: blocking,
    warnings: [],
    provenance: context.provenance,
    fingerprint,
    conditionAssessment: false,
    engineeringAcceptance: false,
    goodCondition: false,
    inspectionAdequate: false,
    structurallyAdequate: false,
    conditionStateIds: [],
    conditionRatingIds: [],
    engineeringInterpretationIds: [],
  };
}
