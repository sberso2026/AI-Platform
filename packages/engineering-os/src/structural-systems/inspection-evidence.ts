/**
 * EOS-D1H-R1 structural inspection evidence foundation.
 * Domain runtime only. Reuses inspection-session, artifact, and D1A/D1F
 * identities by reference. No finding, measurement, condition, or validation engine.
 * No database migration.
 */
import type {
  D1hCoverageResult,
  D1hEvidenceSourceClass,
  D1hInspectionPurpose,
  D1hProvenanceRef,
  D1hTargetKind,
} from "@rtb/types";
import {
  D1H_COVERAGE_RESULTS,
  D1H_EVIDENCE_SOURCE_CLASSES,
  D1H_INSPECTION_PURPOSES,
  D1H_LOCATION_KINDS,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";

export const D1H_R1_MATURITY_STATE = "STRUCTURAL_INSPECTION_EVIDENCE_RUNTIME_FOUNDATION_IMPLEMENTED" as const;
export const D1H_R1_PHASE = "EOS-D1H-R1-STRUCTURAL-INSPECTION-EVIDENCE-FOUNDATION" as const;
export const D1H_R1_EVIDENCE_FOUNDATION_RUNTIME_COUNT = 1 as const;
export const D1H_R1_STRUCTURAL_FINDING_RUNTIME_COUNT = 0 as const;
export const D1H_R1_FINDING_CLASSIFICATION_ENGINE_COUNT = 0 as const;
export const D1H_R1_MEASUREMENT_RUNTIME_COUNT = 0 as const;
export const D1H_R1_MEASUREMENT_VALIDATION_ENGINE_COUNT = 0 as const;
export const D1H_R1_CONDITION_STATE_RUNTIME_COUNT = 0 as const;
export const D1H_R1_CONDITION_RATING_RUNTIME_COUNT = 0 as const;
export const D1H_R1_ENGINEERING_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1H_R1_HUMAN_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1H_R1_AI_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1H_R1_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1H_R1_FULL_D1H_IMPLEMENTED = false as const;
export const D1H_R1_AI_RUNTIME_IMPLEMENTED = false as const;
export const D1H_R1_D1I_DIGITAL_TWIN_RUNTIME_IMPLEMENTED = false as const;
export const D1H_R1_CONTEXT_EQUALS_FINDING = false as const;
export const D1H_R1_COVERAGE_EQUALS_FINDING = false as const;
export const D1H_R1_EVIDENCE_EQUALS_FINDING = false as const;
export const D1H_R1_EVIDENCE_EQUALS_ENGINEERING_ASSESSMENT = false as const;
export const D1H_R1_ALL_OBSERVATIONS_CLASSIFIED_AS_OBSERVED_DEFECT = false as const;
export const D1H_R1_NO_DEFECT_OBSERVATION_CREATES_DEFECT = false as const;
export const D1H_R1_EVIDENCE_CAN_EXIST_WITHOUT_FINDING = true as const;
export const INACCESSIBLE_EQUALS_INSPECTED = false as const;
export const NOT_INSPECTED_EQUALS_INSPECTED_NO_FINDING = false as const;
export const D1H_R1_INSPECTED_EQUALS_HEALTHY = false as const;
export const D1H_R1_FULL_COVERAGE_EQUALS_STRUCTURALLY_ADEQUATE = false as const;
export const D1H_R1_INACCESSIBLE_EQUALS_NO_DEFECT = false as const;
export const D1H_R1_INSPECTED_NO_FINDING_EQUALS_DEFECT_FREE = false as const;
export const D1H_R1_BOUNDED_REGION_PARENT_REQUIRED = true as const;
export const D1H_R1_ORPHAN_BOUNDED_REGION_ALLOWED = false as const;
export const D1H_R1_TARGET_INFERRED_FROM_FILENAME = false as const;
export const D1H_R1_TARGET_INFERRED_FROM_IMAGE = false as const;
export const D1H_R1_TARGET_INFERRED_FROM_GEOMETRIC_PROXIMITY = false as const;
export const D1H_R1_TARGET_INFERRED_BY_LLM = false as const;
export const D1H_R1_EXISTING_INSPECTION_SESSION_REQUIRED = true as const;
export const D1H_R1_SECOND_INSPECTION_SESSION_LIFECYCLE_CREATED = false as const;
export const D1H_R1_CONTEXT_STATUS_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1H_R1_PURPOSE_INFERRED = false as const;
export const D1H_R1_METHOD_REFERENCE_EQUALS_METHOD_ADEQUACY = false as const;
export const D1H_R1_COVERAGE_AUTHORITY_REQUIRED = true as const;
export const AI_COVERAGE_AUTHORITY = false as const;
export const D1H_R1_COVERAGE_LIMITATIONS_PRESERVED = true as const;
export const D1H_R1_EXPLICIT_NEGATIVE_OBSERVATION_EQUALS_GOOD_CONDITION = false as const;
export const D1H_R1_EXPLICIT_NEGATIVE_OBSERVATION_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1H_R1_EXISTING_ARTIFACT_IDENTITY_REUSED = true as const;
export const PARALLEL_FILE_REPOSITORY_CREATED = false as const;
export const D1H_R1_RAW_SOURCE_PRESERVED = true as const;
export const D1H_R1_DERIVED_EVIDENCE_OVERWRITES_RAW_SOURCE = false as const;
export const D1H_R1_DERIVATION_CYCLE_ALLOWED = false as const;
export const D1H_R1_DERIVATION_CHAIN_TRACEABLE = true as const;
export const D1H_R1_DUPLICATE_EVIDENCE_ID_REJECTED = true as const;
export const D1H_R1_DUPLICATE_CONTENT_AUTO_MERGED = false as const;
export const D1H_R1_DUPLICATE_CONTENT_COUNTS_AS_INDEPENDENT_EVIDENCE = false as const;
export const D1H_R1_LOCATION_GUESSED_FROM_FILENAME = false as const;
export const D1H_R1_LOCATION_GUESSED_FROM_MEDIA = false as const;
export const D1H_R1_SOURCE_ACTOR_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const D1H_R1_AI_DERIVED_EVIDENCE_CAN_GOVERN = false as const;
export const D1H_R1_EVIDENCE_RECORDED_EQUALS_HUMAN_VALIDATED = false as const;
export const D1H_R1_EVIDENCE_SCHEMA_VALID_EQUALS_ENGINEERING_VALID = false as const;
export const D1H_R1_PHOTO_AUTO_CREATES_DEFECT = false as const;
export const D1H_R1_VIDEO_AUTO_CREATES_DEFECT = false as const;
export const D1H_R1_MEASUREMENT_AUTO_CREATES_DEFECT = false as const;
export const D1H_R1_NEGATIVE_OBSERVATION_AUTO_CREATES_DEFECT = false as const;
export const D1H_R1_EVIDENCE_AUTO_CREATES_CONDITION_RATING = false as const;
export const D1H_R1_COVERAGE_AUTO_CREATES_CONDITION_RATING = false as const;
export const D1H_R1_EVIDENCE_AUTO_CHANGES_SECTION_PROPERTIES = false as const;
export const D1H_R1_EVIDENCE_AUTO_CHANGES_MATERIAL_PROPERTIES = false as const;
export const D1H_R1_EVIDENCE_AUTO_CHANGES_CAPACITY = false as const;
export const D1H_R1_EVIDENCE_AUTO_CHANGES_ANALYSIS_MODEL = false as const;
export const D1H_R1_EVIDENCE_AUTO_CHANGES_SUPPORTS = false as const;
export const D1H_R1_EVIDENCE_AUTO_CHANGES_RELEASES = false as const;
export const D1H_R1_EVIDENCE_AUTO_CHANGES_LOADS = false as const;
export const D1H_R1_D1F_ANALYSIS_RESULT_IDENTITY_REUSED = true as const;
export const PARALLEL_ANALYSIS_RESULT_CREATED = false as const;
export const D1H_R1_ANALYSIS_REFERENCE_EQUALS_OBSERVED_CONDITION = false as const;
export const D1H_R1_ANALYSIS_REFERENCE_EQUALS_MEASURED_RESPONSE = false as const;
export const D1H_R1_HISTORICAL_EVIDENCE_REAUTHORED = false as const;
export const NEW_INSPECTION_CONTEXT_OVERWRITES_OLD_CONTEXT = false as const;
export const NEW_COVERAGE_RECORD_OVERWRITES_OLD_COVERAGE = false as const;
export const NEW_EVIDENCE_OVERWRITES_OLD_EVIDENCE = false as const;
export const CORRECTED_EVIDENCE_MUTATES_HISTORICAL_RECORD = false as const;
export const D1H_R1_CONTEXT_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R1_COVERAGE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R1_EVIDENCE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1H_R1_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1H_R1_PROVENANCE_COMPLETE = true as const;
export const D1H_R1_INVALIDATION_DELETES_HISTORY = false as const;
export const D1H_R1_STRUCTURAL_REVISION_ERASES_EVIDENCE = false as const;
export const D1H_R1_STALE_TARGET_AUTO_REBOUND = false as const;
export const D1H_R1_CROSS_PROJECT_BINDING_REJECTED = true as const;
export const D1H_R1_CROSS_TENANT_BINDING_REJECTED = true as const;
export const D1H_R1_AUTOMATIC_SYSTEM_COVERAGE_COMPLETENESS = false as const;
export const D1H_R1_ALL_TARGETS_NO_FINDING_EQUALS_STRUCTURE_CLEAR = false as const;
export const D1H_R1_ZERO_FINDINGS_EQUALS_STRUCTURE_SAFE = false as const;
export const D1H_R1_EVIDENCE_COMPLETE_EQUALS_GOOD_CONDITION = false as const;
export const D1H_R1_EVIDENCE_COMPLETE_EQUALS_INSPECTION_ADEQUATE = false as const;
export const D1H_R1_EVIDENCE_COMPLETE_EQUALS_ENGINEERING_ACCEPTED = false as const;
export const D1H_R1_RUNTIME_RESULT_EQUALS_CONDITION_ASSESSMENT = false as const;
export const D1H_R1_RUNTIME_RESULT_EQUALS_INSPECTION_APPROVAL = false as const;
export const D1H_R1_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1H_R1_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1H_R1_AI_ASSISTANCE_ADVISORY_ONLY = true as const;
export const D1H_R1_AUTHORITY_REQUIRED = true as const;
export const D1H_R1_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1H_R1_FACE_RECOGNITION_IMPLEMENTED = false as const;
export const D1H_R1_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1H_R1_EVIDENCE_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1H_R1_D1A_IDENTITY_REUSED = true as const;
export const D1H_R1_D1F_SYSTEM_IDENTITY_REUSED = true as const;
export const D1H_R1_D1F_MEMBER_IDENTITY_REUSED = true as const;
export const D1H_R1_D1F_CONNECTION_IDENTITY_REUSED = true as const;
export const D1H_R1_D1F_SUPPORT_IDENTITY_REUSED = true as const;
export const D1H_R1_D1F_FOUNDATION_IDENTITY_REUSED = true as const;
export const D1H_R2_HANDOFF_READY = true as const;

export const D1H_R1_CONTEXT_STATUSES = ["DRAFT", "RECORDED", "SUPERSEDED"] as const;
export type D1hR1ContextStatus = (typeof D1H_R1_CONTEXT_STATUSES)[number];

export const D1H_R1_EFFECTIVE_STATES = ["CURRENT", "HISTORICAL", "SUPERSEDED", "STALE"] as const;
export type D1hR1EffectiveState = (typeof D1H_R1_EFFECTIVE_STATES)[number];

export const D1H_R1_EVIDENCE_COMPLETENESS_STATES = [
  "COMPLETE_FOR_DECLARED_EVIDENCE_SCOPE",
  "PARTIAL",
  "INCOMPLETE",
  "INVALID",
  "STALE",
  "UNDETERMINED",
] as const;
export type D1hR1EvidenceCompleteness = (typeof D1H_R1_EVIDENCE_COMPLETENESS_STATES)[number];

export const D1H_R1_EVENTS = [
  "STRUCTURAL_INSPECTION_CONTEXT_RECORDED",
  "INSPECTION_COVERAGE_RECORDED",
  "INSPECTION_EVIDENCE_RECORDED",
  "INSPECTION_EVIDENCE_DERIVED",
  "INSPECTION_EVIDENCE_SUPERSEDED",
  "INSPECTION_EVIDENCE_INVALIDATED",
] as const;
export type D1hR1EventType = (typeof D1H_R1_EVENTS)[number];

export const D1H_R1_INVALIDATION_CAUSES = [
  "TARGET_REVISION",
  "SOURCE_CORRECTION",
  "LOCATION_CORRECTION",
  "COVERAGE_CORRECTION",
  "AUTHORITY_WITHDRAWN",
  "PROVENANCE_CORRECTION",
  "UPSTREAM_EVIDENCE_SUPERSEDED",
  "CONTEXT_SUPERSEDED",
] as const;
export type D1hR1InvalidationCause = (typeof D1H_R1_INVALIDATION_CAUSES)[number];

/** Artifact classes that must cite an existing platform artifact. Others use a governed reference of a different kind. */
export const D1H_R1_ARTIFACT_REQUIREMENT_MATRIX = {
  HUMAN_OBSERVATION: "OPTIONAL",
  PHOTO: "REQUIRED",
  VIDEO: "REQUIRED",
  MEASUREMENT: "OPTIONAL",
  DOCUMENT: "REQUIRED",
  INSTRUMENTATION_REFERENCE: "REQUIRED",
  ANALYSIS_RESULT_REFERENCE: "ANALYSIS_RESULT",
  HISTORICAL_INSPECTION_REFERENCE: "PRIOR_EVIDENCE",
  AI_DERIVED_CANDIDATE_EVIDENCE: "DERIVED_SOURCE",
} as const;

export const D1H_R2_REQUIRED_R1_CONTRACTS = [
  "inspectionContextIdentity",
  "inspectionSessionIdentity",
  "structuralTargetIdentity",
  "coverageIdentity",
  "evidenceIdentity",
  "sourceArtifactReference",
  "evidenceAuthority",
  "provenance",
  "fingerprints",
  "historySupersession",
  "invalidation",
  "completeness",
] as const;

const FORBIDDEN_SCOPE_KEYS = [
  "findingId",
  "findingCategory",
  "conditionRating",
  "conditionStateId",
  "measurementValue",
  "severityScore",
  "repairDesign",
  "faceRecognition",
  "workerIdentity",
  "employeeScore",
  "productivityScore",
  "behaviorScore",
  "runDetection",
] as const;

export type D1hR1CatalogObject = {
  kind: "STRUCTURAL_SYSTEM" | "MEMBER" | "CONNECTION" | "SUPPORT" | "FOUNDATION";
  id: string;
  structuralSystemId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  version: string;
  lifecycle: "CURRENT" | "SUPERSEDED";
};

/** Existing @rtb/inspection-intelligence session identity. This runtime does not transition it. */
export type D1hR1InspectionSessionRef = {
  inspectionSessionId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

/** Existing platform artifact identity. This runtime does not create a file repository. */
export type D1hR1ArtifactRef = {
  artifactId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contentFingerprint: string;
};

/** Existing D1A/D1F analysis-result identity. This runtime does not copy the result. */
export type D1hR1AnalysisResultRef = {
  analysisResultId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  structuralSystemId: string;
};

export type D1hR1GovernedCatalog = {
  objects: readonly D1hR1CatalogObject[];
  sessions: readonly D1hR1InspectionSessionRef[];
  artifacts: readonly D1hR1ArtifactRef[];
  analysisResults: readonly D1hR1AnalysisResultRef[];
};

export type D1hR1Scope = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D1hR1LocationInput = {
  locationId: string;
  locationKind: (typeof D1H_LOCATION_KINDS)[number];
  description: string;
  explicit: true;
  aiSuggested: boolean;
  confirmed: boolean;
  inferredBy: "FILENAME" | "IMAGE" | "PROXIMITY" | "LLM" | null;
};

export type D1hR1TargetInput = {
  targetId: string;
  targetKind: D1hTargetKind;
  structuralSystemId: string;
  memberId: string | null;
  connectionId: string | null;
  supportId: string | null;
  foundationIdentity: string | null;
  parentTargetKind: D1hR1CatalogObject["kind"] | null;
  parentTargetId: string | null;
  regionRef: string | null;
  candidateOnly: boolean;
  inferredBy: D1hR1LocationInput["inferredBy"];
};

export type D1hR1ContextInput = D1hR1Scope & {
  inspectionContextId: string;
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
  status: D1hR1ContextStatus;
  declaredTargetIds: readonly string[];
  recordedAt: string;
};

export type D1hR1ContextRecord = D1hR1ContextInput & {
  fingerprint: string;
  engineeringApproval: false;
  predecessorId: string | null;
};

export type D1hR1TargetRecord = D1hR1TargetInput & {
  inspectionContextId: string;
  version: string;
  fingerprint: string;
};

export type D1hR1CoverageInput = {
  coverageId: string;
  inspectionContextId: string;
  inspectionSessionId: string;
  targetId: string;
  regionRef: string | null;
  methodRef: string;
  accessState: D1hCoverageResult;
  limitations: string;
  authority: string;
  provenance: D1hProvenanceRef;
  version: string;
  recordedAt: string;
};

export type D1hR1CoverageRecord = D1hR1CoverageInput & {
  fingerprint: string;
  predecessorId: string | null;
  inspectedEqualsHealthy: false;
  fullCoverageEqualsAdequate: false;
  inaccessibleEqualsNoDefect: false;
  inspectedNoFindingEqualsDefectFree: false;
  goodCondition: false;
  createsConditionRating: false;
  createsFinding: false;
  methodAdequacy: false;
};

export type D1hR1EvidenceInput = {
  evidenceId: string;
  inspectionContextId: string;
  inspectionSessionId: string;
  targetId: string;
  sourceClass: D1hEvidenceSourceClass;
  sourceArtifactId: string | null;
  analysisResultId: string | null;
  priorEvidenceId: string | null;
  derivedFromEvidenceId: string | null;
  capturedAt: string;
  capturedBy: string;
  location: D1hR1LocationInput | null;
  methodRef: string | null;
  unit: string | null;
  authority: "HUMAN_OBSERVATION" | "GOVERNED_IMPORT" | "AI_CANDIDATE";
  modelIdentity: string | null;
  modelVersion: string | null;
  executionFingerprint: string | null;
  provenance: D1hProvenanceRef;
  version: string;
  recordedAt: string;
  explicitNegativeObservation: boolean;
  negativeScopeStatement: string | null;
};

export type D1hR1EvidenceRecord = D1hR1EvidenceInput & {
  fingerprint: string;
  predecessorId: string | null;
  validationState: "UNVALIDATED";
  governsEngineering: false;
  createsDefect: false;
  classifiedAsObservedDefect: false;
  humanValidated: false;
  engineeringValid: false;
  observedCondition: false;
  measuredResponse: false;
  reauthored: false;
  independentCorroboration: false;
  contentFingerprint: string | null;
};

export type D1hR1HistoryEntry = {
  historyId: string;
  subjectKind: "CONTEXT" | "TARGET" | "COVERAGE" | "EVIDENCE";
  subjectId: string;
  action: "CREATED" | "DERIVED" | "CORRECTED" | "SUPERSEDED" | "INVALIDATED";
  version: string;
  fingerprint: string;
  recordedAt: string;
  predecessorId: string | null;
};

export type D1hR1StateEntry = {
  subjectKind: D1hR1HistoryEntry["subjectKind"];
  subjectId: string;
  effective: D1hR1EffectiveState;
  recordedAt: string;
};

export type D1hR1InvalidationRecord = {
  invalidationId: string;
  cause: D1hR1InvalidationCause;
  subjectKind: D1hR1HistoryEntry["subjectKind"];
  subjectId: string;
  recordedAt: string;
  deletesHistory: false;
};

export type D1hR1Event = {
  eventId: string;
  eventType: D1hR1EventType;
  subjectId: string;
  recordedAt: string;
  engineeringApproval: false;
};

export type D1hR1Store = {
  contexts: D1hR1ContextRecord[];
  targets: D1hR1TargetRecord[];
  coverages: D1hR1CoverageRecord[];
  evidence: D1hR1EvidenceRecord[];
  history: D1hR1HistoryEntry[];
  states: D1hR1StateEntry[];
  invalidations: D1hR1InvalidationRecord[];
  events: D1hR1Event[];
};

/** Runtime diagnostic. This is not a D1H structural finding. */
export type D1hRuntimeDiagnostic = {
  kind: "RUNTIME_DIAGNOSTIC";
  code: string;
  structuralFinding: false;
};

export type D1hR1RuntimeResult = {
  resultId: string;
  inspectionContextId: string;
  inspectionSessionId: string;
  structuralSystemId: string;
  targetIds: readonly string[];
  coverageIds: readonly string[];
  evidenceIds: readonly string[];
  scope: string;
  completeness: D1hR1EvidenceCompleteness;
  /** Compatibility name for runtime diagnostic codes. Not structural findings. */
  findings: readonly string[];
  /** Compatibility name for blocking runtime diagnostic codes. Not structural findings. */
  blockingFindings: readonly string[];
  runtimeDiagnostics: readonly D1hRuntimeDiagnostic[];
  blockingRuntimeDiagnostics: readonly D1hRuntimeDiagnostic[];
  provenance: D1hProvenanceRef;
  fingerprint: string;
  warnings: readonly string[];
  effective: D1hR1EffectiveState;
  structuralFindingIds: readonly [];
  measurementIds: readonly [];
  conditionStateIds: readonly [];
  conditionRatingIds: readonly [];
  engineeringInterpretationIds: readonly [];
  humanValidationIds: readonly [];
  conditionAssessment: false;
  inspectionApproval: false;
  engineeringApproval: false;
  goodCondition: false;
  healthy: false;
  defectFree: false;
  safe: false;
  structurallyAdequate: false;
  inspectionAdequate: false;
  engineeringAccepted: false;
  sectionPropertiesChanged: false;
  materialPropertiesChanged: false;
  capacityChanged: false;
  analysisModelChanged: false;
  supportsChanged: false;
  releasesChanged: false;
  loadsChanged: false;
  structureClear: false;
  systemCoverageComplete: false;
};

export function createD1hR1Store(): D1hR1Store {
  return { contexts: [], targets: [], coverages: [], evidence: [], history: [], states: [], invalidations: [], events: [] };
}

export function aggregateSystemCoverageCompleteness(): false {
  return D1H_R1_AUTOMATIC_SYSTEM_COVERAGE_COMPLETENESS;
}

export function rebindStaleTarget(): never {
  throw new Error("STALE_TARGET_AUTO_REBIND_REJECTED");
}

function fail(code: string): never {
  throw new Error(code);
}

function required(value: string | null | undefined, code: string): string {
  if (typeof value !== "string" || value.trim() === "") fail(code);
  return value;
}

function assertScopeKeys(input: object): void {
  for (const key of FORBIDDEN_SCOPE_KEYS) {
    if (key in input) fail(`SCOPE_REJECTED:${key}`);
  }
}

function assertHumanAuthority(authority: string): void {
  const normalized = required(authority, "AUTHORITY_REQUIRED").trim().toUpperCase();
  if (normalized.startsWith("AI") || normalized.includes("LLM")) fail("AI_AUTHORITY_REJECTED");
}

function assertProvenance(provenance: D1hProvenanceRef, scope: D1hR1Scope): void {
  required(provenance.tenantId, "PROVENANCE_INCOMPLETE");
  required(provenance.workspaceId, "PROVENANCE_INCOMPLETE");
  required(provenance.projectId, "PROVENANCE_INCOMPLETE");
  required(provenance.actorOrSystem, "PROVENANCE_INCOMPLETE");
  required(provenance.timestamp, "PROVENANCE_INCOMPLETE");
  required(provenance.authority, "PROVENANCE_INCOMPLETE");
  required(provenance.version, "PROVENANCE_INCOMPLETE");
  if (provenance.tenantId !== scope.tenantId || provenance.workspaceId !== scope.workspaceId || provenance.projectId !== scope.projectId) {
    if (provenance.tenantId !== scope.tenantId) fail("CROSS_TENANT_BINDING_REJECTED");
    fail("CROSS_PROJECT_BINDING_REJECTED");
  }
}

function assertSameScope(left: D1hR1Scope, right: D1hR1Scope): void {
  if (left.tenantId !== right.tenantId) fail("CROSS_TENANT_BINDING_REJECTED");
  if (left.workspaceId !== right.workspaceId || left.projectId !== right.projectId) fail("CROSS_PROJECT_BINDING_REJECTED");
}

function sorted(values: readonly string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

export function currentD1hR1Effective(store: D1hR1Store, kind: D1hR1HistoryEntry["subjectKind"], subjectId: string): D1hR1EffectiveState {
  const matches = store.states.filter((row) => row.subjectKind === kind && row.subjectId === subjectId);
  return matches.length === 0 ? "CURRENT" : matches[matches.length - 1]!.effective;
}

function remember(
  store: D1hR1Store,
  subjectKind: D1hR1HistoryEntry["subjectKind"],
  subjectId: string,
  action: D1hR1HistoryEntry["action"],
  version: string,
  fingerprint: string,
  recordedAt: string,
  predecessorId: string | null,
  effective: D1hR1EffectiveState,
): void {
  store.history.push({
    historyId: `${subjectKind}:${subjectId}:${action}:${version}`,
    subjectKind,
    subjectId,
    action,
    version,
    fingerprint,
    recordedAt,
    predecessorId,
  });
  store.states.push({ subjectKind, subjectId, effective, recordedAt });
}

function emit(store: D1hR1Store, eventType: D1hR1EventType, subjectId: string, recordedAt: string, version: string): void {
  store.events.push({
    eventId: `${eventType}:${subjectId}:${version}`,
    eventType,
    subjectId,
    recordedAt,
    engineeringApproval: false,
  });
}

export function contextFingerprint(input: Pick<D1hR1ContextInput, "tenantId" | "workspaceId" | "projectId" | "structuralSystemId" | "inspectionSessionId" | "purpose" | "scopeStatement" | "coverageScopeRef" | "methodRefs" | "sourceAuthority" | "governanceProfileRef" | "version" | "inspectedAt">): string {
  return fingerprintCanonical({
    subject: "D1H_R1_CONTEXT",
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    structuralSystemId: input.structuralSystemId,
    inspectionSessionId: input.inspectionSessionId,
    purpose: input.purpose,
    scopeStatement: input.scopeStatement,
    coverageScopeRef: input.coverageScopeRef,
    methodRefs: sorted(input.methodRefs),
    sourceAuthority: input.sourceAuthority,
    governanceProfileRef: input.governanceProfileRef,
    version: input.version,
    inspectedAt: input.inspectedAt,
  });
}

export function coverageFingerprint(input: Pick<D1hR1CoverageInput, "inspectionContextId" | "inspectionSessionId" | "targetId" | "regionRef" | "methodRef" | "accessState" | "limitations" | "authority" | "version">): string {
  return fingerprintCanonical({
    subject: "D1H_R1_COVERAGE",
    inspectionContextId: input.inspectionContextId,
    inspectionSessionId: input.inspectionSessionId,
    targetId: input.targetId,
    regionRef: input.regionRef,
    methodRef: input.methodRef,
    accessState: input.accessState,
    limitations: input.limitations,
    authority: input.authority,
    version: input.version,
  });
}

export function evidenceFingerprint(input: Pick<D1hR1EvidenceInput, "inspectionContextId" | "inspectionSessionId" | "targetId" | "sourceClass" | "sourceArtifactId" | "capturedAt" | "capturedBy" | "location" | "methodRef" | "unit" | "authority" | "derivedFromEvidenceId" | "version" | "analysisResultId" | "priorEvidenceId" | "modelIdentity" | "modelVersion" | "executionFingerprint">, artifactFingerprint: string | null): string {
  return fingerprintCanonical({
    subject: "D1H_R1_EVIDENCE",
    inspectionContextId: input.inspectionContextId,
    inspectionSessionId: input.inspectionSessionId,
    targetId: input.targetId,
    sourceClass: input.sourceClass,
    sourceArtifactId: input.sourceArtifactId,
    artifactFingerprint,
    capturedAt: input.capturedAt,
    capturedBy: input.capturedBy,
    location: input.location
      ? { locationId: input.location.locationId, locationKind: input.location.locationKind, description: input.location.description }
      : null,
    methodRef: input.methodRef,
    unit: input.unit,
    authority: input.authority,
    derivedFromEvidenceId: input.derivedFromEvidenceId,
    analysisResultId: input.analysisResultId,
    priorEvidenceId: input.priorEvidenceId,
    modelIdentity: input.modelIdentity,
    modelVersion: input.modelVersion,
    executionFingerprint: input.executionFingerprint,
    version: input.version,
  });
}

function contextOf(store: D1hR1Store, inspectionContextId: string): D1hR1ContextRecord {
  const context = store.contexts.find((row) => row.inspectionContextId === inspectionContextId);
  if (!context) fail("CONTEXT_UNKNOWN");
  return context;
}

export function recordStructuralInspectionContext(store: D1hR1Store, catalog: D1hR1GovernedCatalog, input: D1hR1ContextInput): D1hR1ContextRecord {
  assertScopeKeys(input);
  if (store.contexts.some((row) => row.inspectionContextId === input.inspectionContextId)) fail("DUPLICATE_CONTEXT_ID");
  if (!D1H_R1_CONTEXT_STATUSES.includes(input.status)) fail("CONTEXT_STATUS_NOT_ENGINEERING_APPROVAL");
  if (!D1H_INSPECTION_PURPOSES.includes(input.purpose)) fail("PURPOSE_REQUIRED");
  required(input.scopeStatement, "SCOPE_REQUIRED");
  required(input.coverageScopeRef, "COVERAGE_SCOPE_REQUIRED");
  if (input.methodRefs.length === 0 || input.methodRefs.some((method) => method.trim() === "")) fail("METHOD_REFERENCE_REQUIRED");
  assertHumanAuthority(input.sourceAuthority);
  assertProvenance(input.provenance, input);
  const session = catalog.sessions.find((row) => row.inspectionSessionId === input.inspectionSessionId);
  if (!session) fail("INSPECTION_SESSION_REQUIRED");
  assertSameScope(input, session);
  const system = catalog.objects.find((row) => row.kind === "STRUCTURAL_SYSTEM" && row.id === input.structuralSystemId);
  if (!system) fail("STRUCTURAL_SYSTEM_UNKNOWN");
  assertSameScope(input, system);
  if (system.lifecycle !== "CURRENT") fail("STALE_TARGET");
  const fingerprint = contextFingerprint(input);
  const record: D1hR1ContextRecord = { ...input, methodRefs: sorted(input.methodRefs), declaredTargetIds: sorted(input.declaredTargetIds), fingerprint, engineeringApproval: false, predecessorId: null, provenance: { ...input.provenance, fingerprint } };
  store.contexts.push(record);
  remember(store, "CONTEXT", record.inspectionContextId, "CREATED", record.version, fingerprint, record.recordedAt, null, record.status === "SUPERSEDED" ? "SUPERSEDED" : "CURRENT");
  emit(store, "STRUCTURAL_INSPECTION_CONTEXT_RECORDED", record.inspectionContextId, record.recordedAt, record.version);
  return record;
}

function identityForKind(input: D1hR1TargetInput): { kind: D1hR1CatalogObject["kind"]; id: string } | null {
  if (input.targetKind === "STRUCTURAL_SYSTEM") return { kind: "STRUCTURAL_SYSTEM", id: input.structuralSystemId };
  if (input.targetKind === "MEMBER") return input.memberId ? { kind: "MEMBER", id: input.memberId } : null;
  if (input.targetKind === "CONNECTION") return input.connectionId ? { kind: "CONNECTION", id: input.connectionId } : null;
  if (input.targetKind === "SUPPORT") return input.supportId ? { kind: "SUPPORT", id: input.supportId } : null;
  if (input.targetKind === "FOUNDATION") return input.foundationIdentity ? { kind: "FOUNDATION", id: input.foundationIdentity } : null;
  return null;
}

export function bindStructuralInspectionTarget(store: D1hR1Store, catalog: D1hR1GovernedCatalog, inspectionContextId: string, input: D1hR1TargetInput): D1hR1TargetRecord {
  assertScopeKeys(input);
  const context = contextOf(store, inspectionContextId);
  if (input.candidateOnly) fail("UNCONFIRMED_TARGET");
  if (input.inferredBy) fail("TARGET_INFERRED");
  if (input.structuralSystemId !== context.structuralSystemId) fail("STRUCTURAL_SYSTEM_MISMATCH");
  if (input.targetKind === "BOUNDED_REGION") {
    if (!input.parentTargetId || !input.parentTargetKind || !input.regionRef || input.regionRef.trim() === "") fail("ORPHAN_BOUNDED_REGION");
    const parent = catalog.objects.find((row) => row.kind === input.parentTargetKind && row.id === input.parentTargetId);
    if (!parent) fail("ORPHAN_BOUNDED_REGION");
    assertSameScope(context, parent);
    if (parent.structuralSystemId !== context.structuralSystemId) fail("STRUCTURAL_SYSTEM_MISMATCH");
    if (parent.lifecycle !== "CURRENT") fail("STALE_TARGET");
  } else {
    const identity = identityForKind(input);
    if (!identity || identity.id !== input.targetId) fail("TARGET_KIND_MISMATCH");
    const extras = [input.memberId, input.connectionId, input.supportId, input.foundationIdentity].filter((value) => value !== null);
    if (input.targetKind !== "STRUCTURAL_SYSTEM" && extras.length !== 1) fail("TARGET_KIND_MISMATCH");
    if (input.targetKind === "STRUCTURAL_SYSTEM" && extras.length !== 0) fail("TARGET_KIND_MISMATCH");
    const object = catalog.objects.find((row) => row.kind === identity.kind && row.id === identity.id);
    if (!object) fail("TARGET_UNKNOWN");
    assertSameScope(context, object);
    if (object.structuralSystemId !== context.structuralSystemId) fail("STRUCTURAL_SYSTEM_MISMATCH");
    if (object.lifecycle !== "CURRENT") fail("STALE_TARGET");
  }
  if (store.targets.some((row) => row.inspectionContextId === inspectionContextId && row.targetId === input.targetId)) fail("DUPLICATE_TARGET_ID");
  const fingerprint = fingerprintCanonical({ subject: "D1H_R1_TARGET", inspectionContextId, target: input });
  const record: D1hR1TargetRecord = { ...input, inspectionContextId, version: context.version, fingerprint };
  store.targets.push(record);
  remember(store, "TARGET", record.targetId, "CREATED", record.version, fingerprint, context.recordedAt, null, "CURRENT");
  return record;
}

export function recordStructuralInspectionCoverage(store: D1hR1Store, input: D1hR1CoverageInput): D1hR1CoverageRecord {
  assertScopeKeys(input);
  if (!D1H_COVERAGE_RESULTS.includes(input.accessState)) fail("COVERAGE_STATE_UNKNOWN");
  if (store.coverages.some((row) => row.coverageId === input.coverageId)) fail("DUPLICATE_COVERAGE_ID");
  const context = contextOf(store, input.inspectionContextId);
  if (input.inspectionSessionId !== context.inspectionSessionId) fail("INSPECTION_SESSION_MISMATCH");
  if (!store.targets.some((row) => row.inspectionContextId === context.inspectionContextId && row.targetId === input.targetId)) fail("TARGET_UNKNOWN");
  required(input.methodRef, "METHOD_REFERENCE_REQUIRED");
  if (typeof input.limitations !== "string") fail("COVERAGE_LIMITATIONS_REQUIRED");
  assertHumanAuthority(input.authority);
  assertProvenance(input.provenance, context);
  const fingerprint = coverageFingerprint(input);
  const record: D1hR1CoverageRecord = {
    ...input,
    fingerprint,
    predecessorId: null,
    provenance: { ...input.provenance, fingerprint },
    inspectedEqualsHealthy: false,
    fullCoverageEqualsAdequate: false,
    inaccessibleEqualsNoDefect: false,
    inspectedNoFindingEqualsDefectFree: false,
    goodCondition: false,
    createsConditionRating: false,
    createsFinding: false,
    methodAdequacy: false,
  };
  store.coverages.push(record);
  remember(store, "COVERAGE", record.coverageId, "CREATED", record.version, fingerprint, record.recordedAt, null, "CURRENT");
  emit(store, "INSPECTION_COVERAGE_RECORDED", record.coverageId, record.recordedAt, record.version);
  return record;
}

function artifactFingerprintOf(catalog: D1hR1GovernedCatalog, context: D1hR1ContextRecord, sourceArtifactId: string | null): string | null {
  if (!sourceArtifactId) return null;
  const artifact = catalog.artifacts.find((row) => row.artifactId === sourceArtifactId);
  if (!artifact) fail("ARTIFACT_UNKNOWN");
  assertSameScope(context, artifact);
  return artifact.contentFingerprint;
}

function assertDerivationAcyclic(store: D1hR1Store, evidenceId: string, derivedFromEvidenceId: string): void {
  const seen = new Set<string>([evidenceId]);
  let cursor: string | null = derivedFromEvidenceId;
  while (cursor) {
    if (seen.has(cursor)) fail("DERIVATION_CYCLE");
    seen.add(cursor);
    const prior: D1hR1EvidenceRecord | undefined = store.evidence.find((row) => row.evidenceId === cursor);
    if (!prior) fail("DERIVATION_SOURCE_UNKNOWN");
    cursor = prior.derivedFromEvidenceId;
  }
}

function evidenceBase(store: D1hR1Store, catalog: D1hR1GovernedCatalog, input: D1hR1EvidenceInput, predecessorId: string | null, action: D1hR1HistoryEntry["action"]): D1hR1EvidenceRecord {
  assertScopeKeys(input);
  if (!D1H_EVIDENCE_SOURCE_CLASSES.includes(input.sourceClass)) fail("SOURCE_CLASS_UNKNOWN");
  if (store.evidence.some((row) => row.evidenceId === input.evidenceId)) fail("DUPLICATE_EVIDENCE_ID");
  const context = contextOf(store, input.inspectionContextId);
  if (input.inspectionSessionId !== context.inspectionSessionId) fail("INSPECTION_SESSION_MISMATCH");
  const target = store.targets.find((row) => row.inspectionContextId === context.inspectionContextId && row.targetId === input.targetId);
  if (!target) fail("TARGET_UNKNOWN");
  if (currentD1hR1Effective(store, "TARGET", target.targetId) === "STALE") fail("STALE_TARGET");
  assertProvenance(input.provenance, context);
  required(input.capturedAt, "CAPTURE_TIME_REQUIRED");
  required(input.capturedBy, "SOURCE_ACTOR_REQUIRED");
  if (target.targetKind !== "STRUCTURAL_SYSTEM" && !input.location) fail("LOCATION_REQUIRED");
  if (input.location) {
    if (input.location.explicit !== true) fail("LOCATION_GUESSED");
    if (input.location.inferredBy) fail("LOCATION_GUESSED");
    if (input.location.aiSuggested && !input.location.confirmed) fail("UNCONFIRMED_AI_LOCATION");
    if (!D1H_LOCATION_KINDS.includes(input.location.locationKind)) fail("LOCATION_KIND_UNKNOWN");
  }
  const requirement = D1H_R1_ARTIFACT_REQUIREMENT_MATRIX[input.sourceClass];
  let artifactFingerprint: string | null = null;
  if (requirement === "REQUIRED") {
    required(input.sourceArtifactId, "ARTIFACT_REQUIRED");
    artifactFingerprint = artifactFingerprintOf(catalog, context, input.sourceArtifactId);
  } else if (requirement === "OPTIONAL") {
    artifactFingerprint = artifactFingerprintOf(catalog, context, input.sourceArtifactId);
  } else if (requirement === "ANALYSIS_RESULT") {
    const analysis = catalog.analysisResults.find((row) => row.analysisResultId === input.analysisResultId);
    if (!analysis) fail("ANALYSIS_RESULT_REQUIRED");
    assertSameScope(context, analysis);
    if (analysis.structuralSystemId !== context.structuralSystemId) fail("STRUCTURAL_SYSTEM_MISMATCH");
  } else if (requirement === "PRIOR_EVIDENCE") {
    const prior = store.evidence.find((row) => row.evidenceId === input.priorEvidenceId);
    if (!prior) fail("PRIOR_EVIDENCE_REQUIRED");
    if (prior.inspectionContextId !== context.inspectionContextId && prior.sourceArtifactId !== input.sourceArtifactId) fail("HISTORICAL_REAUTHOR_REJECTED");
    if (input.sourceArtifactId !== prior.sourceArtifactId) fail("HISTORICAL_REAUTHOR_REJECTED");
  } else {
    required(input.derivedFromEvidenceId, "DERIVED_SOURCE_REQUIRED");
    required(input.modelIdentity, "AI_MODEL_PROVENANCE_REQUIRED");
    required(input.modelVersion, "AI_MODEL_PROVENANCE_REQUIRED");
    required(input.executionFingerprint, "AI_MODEL_PROVENANCE_REQUIRED");
    if (input.authority !== "AI_CANDIDATE") fail("AI_AUTHORITY_REJECTED");
    assertDerivationAcyclic(store, input.evidenceId, input.derivedFromEvidenceId!);
  }
  if (input.authority === "AI_CANDIDATE" && input.sourceClass !== "AI_DERIVED_CANDIDATE_EVIDENCE") fail("AI_AUTHORITY_REJECTED");
  if (input.authority !== "AI_CANDIDATE") assertHumanAuthority(input.authority);
  if (input.explicitNegativeObservation) {
    required(input.negativeScopeStatement, "NEGATIVE_SCOPE_REQUIRED");
    required(input.methodRef, "METHOD_REFERENCE_REQUIRED");
    const coverage = store.coverages.find((row) => row.inspectionContextId === context.inspectionContextId && row.targetId === input.targetId);
    if (!coverage || coverage.limitations.trim() === "") fail("NEGATIVE_LIMITATIONS_REQUIRED");
  }
  if (input.derivedFromEvidenceId && requirement !== "DERIVED_SOURCE") assertDerivationAcyclic(store, input.evidenceId, input.derivedFromEvidenceId);
  const fingerprint = evidenceFingerprint(input, artifactFingerprint);
  const record: D1hR1EvidenceRecord = {
    ...input,
    fingerprint,
    predecessorId,
    provenance: { ...input.provenance, fingerprint },
    validationState: "UNVALIDATED",
    governsEngineering: false,
    createsDefect: false,
    classifiedAsObservedDefect: false,
    humanValidated: false,
    engineeringValid: false,
    observedCondition: false,
    measuredResponse: false,
    reauthored: false,
    independentCorroboration: false,
    contentFingerprint: artifactFingerprint,
  };
  store.evidence.push(record);
  remember(store, "EVIDENCE", record.evidenceId, action, record.version, fingerprint, record.recordedAt, predecessorId, "CURRENT");
  return record;
}

export function recordStructuralInspectionEvidence(store: D1hR1Store, catalog: D1hR1GovernedCatalog, input: D1hR1EvidenceInput): D1hR1EvidenceRecord {
  if (input.sourceClass === "AI_DERIVED_CANDIDATE_EVIDENCE") fail("USE_DERIVED_EVIDENCE");
  const record = evidenceBase(store, catalog, input, null, "CREATED");
  emit(store, "INSPECTION_EVIDENCE_RECORDED", record.evidenceId, record.recordedAt, record.version);
  return record;
}

export function recordExplicitNegativeObservation(
  store: D1hR1Store,
  catalog: D1hR1GovernedCatalog,
  input: D1hR1EvidenceInput,
): D1hR1EvidenceRecord {
  if (!input.explicitNegativeObservation) fail("NEGATIVE_OBSERVATION_REQUIRED");
  if (input.sourceClass !== "HUMAN_OBSERVATION") fail("NEGATIVE_OBSERVATION_SOURCE");
  return recordStructuralInspectionEvidence(store, catalog, input);
}

export function deriveStructuralInspectionEvidence(store: D1hR1Store, catalog: D1hR1GovernedCatalog, input: D1hR1EvidenceInput): D1hR1EvidenceRecord {
  if (input.sourceClass !== "AI_DERIVED_CANDIDATE_EVIDENCE") fail("DERIVED_SOURCE_CLASS");
  const record = evidenceBase(store, catalog, input, null, "DERIVED");
  emit(store, "INSPECTION_EVIDENCE_DERIVED", record.evidenceId, record.recordedAt, record.version);
  return record;
}

export function correctStructuralInspectionEvidence(store: D1hR1Store, catalog: D1hR1GovernedCatalog, predecessorEvidenceId: string, input: D1hR1EvidenceInput): D1hR1EvidenceRecord {
  const prior = store.evidence.find((row) => row.evidenceId === predecessorEvidenceId);
  if (!prior) fail("PREDECESSOR_UNKNOWN");
  const priorFingerprint = prior.fingerprint;
  const priorSnapshot = JSON.stringify(prior);
  if (input.version === prior.version) fail("CORRECTION_VERSION_REQUIRED");
  const record = evidenceBase(store, catalog, input, predecessorEvidenceId, "CORRECTED");
  if (JSON.stringify(prior) !== priorSnapshot || prior.fingerprint !== priorFingerprint) fail("HISTORICAL_RECORD_MUTATED");
  const predecessorState = currentD1hR1Effective(store, "EVIDENCE", predecessorEvidenceId);
  if (predecessorState === "CURRENT") {
    store.states.push({ subjectKind: "EVIDENCE", subjectId: predecessorEvidenceId, effective: "SUPERSEDED", recordedAt: input.recordedAt });
    store.history.push({
      historyId: `EVIDENCE:${predecessorEvidenceId}:SUPERSEDED:${input.version}`,
      subjectKind: "EVIDENCE",
      subjectId: predecessorEvidenceId,
      action: "SUPERSEDED",
      version: prior.version,
      fingerprint: prior.fingerprint,
      recordedAt: input.recordedAt,
      predecessorId: null,
    });
    emit(store, "INSPECTION_EVIDENCE_SUPERSEDED", predecessorEvidenceId, input.recordedAt, prior.version);
  }
  return record;
}

export function invalidateStructuralInspectionRecord(
  store: D1hR1Store,
  cause: D1hR1InvalidationCause,
  subjectKind: D1hR1HistoryEntry["subjectKind"],
  subjectId: string,
  recordedAt: string,
): D1hR1InvalidationRecord {
  if (!D1H_R1_INVALIDATION_CAUSES.includes(cause)) fail("INVALIDATION_CAUSE_UNKNOWN");
  const known = subjectKind === "CONTEXT"
    ? store.contexts.some((row) => row.inspectionContextId === subjectId)
    : subjectKind === "COVERAGE"
      ? store.coverages.some((row) => row.coverageId === subjectId)
      : subjectKind === "EVIDENCE"
        ? store.evidence.some((row) => row.evidenceId === subjectId)
        : store.targets.some((row) => row.targetId === subjectId);
  if (!known) fail("INVALIDATION_SUBJECT_UNKNOWN");
  const before = store.evidence.length + store.contexts.length + store.coverages.length + store.history.length;
  const record: D1hR1InvalidationRecord = {
    invalidationId: `${cause}:${subjectKind}:${subjectId}:${recordedAt}`,
    cause,
    subjectKind,
    subjectId,
    recordedAt,
    deletesHistory: false,
  };
  store.invalidations.push(record);
  store.states.push({ subjectKind, subjectId, effective: "STALE", recordedAt });
  const fingerprint = subjectKind === "EVIDENCE"
    ? store.evidence.find((row) => row.evidenceId === subjectId)?.fingerprint ?? ""
    : subjectKind === "COVERAGE"
      ? store.coverages.find((row) => row.coverageId === subjectId)?.fingerprint ?? ""
      : subjectKind === "CONTEXT"
        ? store.contexts.find((row) => row.inspectionContextId === subjectId)?.fingerprint ?? ""
        : store.targets.find((row) => row.targetId === subjectId)?.fingerprint ?? "";
  store.history.push({
    historyId: `${subjectKind}:${subjectId}:INVALIDATED:${cause}`,
    subjectKind,
    subjectId,
    action: "INVALIDATED",
    version: cause,
    fingerprint,
    recordedAt,
    predecessorId: null,
  });
  if (subjectKind === "EVIDENCE" || subjectKind === "CONTEXT" || subjectKind === "COVERAGE") {
    emit(store, "INSPECTION_EVIDENCE_INVALIDATED", subjectId, recordedAt, cause);
  }
  if (store.evidence.length + store.contexts.length + store.coverages.length + store.history.length < before) fail("INVALIDATION_DELETED_HISTORY");
  return record;
}

export function provenanceChain(store: D1hR1Store, evidenceId: string): readonly string[] {
  const evidence = store.evidence.find((row) => row.evidenceId === evidenceId);
  if (!evidence) fail("EVIDENCE_UNKNOWN");
  const context = contextOf(store, evidence.inspectionContextId);
  const target = store.targets.find((row) => row.targetId === evidence.targetId);
  const chain = [
    `project:${context.projectId}`,
    `system:${context.structuralSystemId}`,
    `session:${context.inspectionSessionId}`,
    `context:${context.inspectionContextId}`,
    `target:${target?.targetId ?? "missing"}`,
    `evidence:${evidence.evidenceId}`,
  ];
  if (evidence.sourceArtifactId) chain.push(`artifact:${evidence.sourceArtifactId}`);
  if (evidence.analysisResultId) chain.push(`analysis:${evidence.analysisResultId}`);
  if (evidence.priorEvidenceId) chain.push(`prior:${evidence.priorEvidenceId}`);
  let cursor = evidence.derivedFromEvidenceId;
  const seen = new Set<string>([evidence.evidenceId]);
  while (cursor) {
    if (seen.has(cursor)) fail("DERIVATION_CYCLE");
    seen.add(cursor);
    const prior = store.evidence.find((row) => row.evidenceId === cursor);
    if (!prior) fail("DERIVATION_SOURCE_UNKNOWN");
    chain.push(`source:${prior.evidenceId}`);
    if (prior.sourceArtifactId) chain.push(`raw:${prior.sourceArtifactId}`);
    cursor = prior.derivedFromEvidenceId;
  }
  return chain;
}

function closedClaims(): Pick<D1hR1RuntimeResult, "structuralFindingIds" | "measurementIds" | "conditionStateIds" | "conditionRatingIds" | "engineeringInterpretationIds" | "humanValidationIds" | "conditionAssessment" | "inspectionApproval" | "engineeringApproval" | "goodCondition" | "healthy" | "defectFree" | "safe" | "structurallyAdequate" | "inspectionAdequate" | "engineeringAccepted" | "sectionPropertiesChanged" | "materialPropertiesChanged" | "capacityChanged" | "analysisModelChanged" | "supportsChanged" | "releasesChanged" | "loadsChanged" | "structureClear" | "systemCoverageComplete"> {
  return {
    structuralFindingIds: [],
    measurementIds: [],
    conditionStateIds: [],
    conditionRatingIds: [],
    engineeringInterpretationIds: [],
    humanValidationIds: [],
    conditionAssessment: false,
    inspectionApproval: false,
    engineeringApproval: false,
    goodCondition: false,
    healthy: false,
    defectFree: false,
    safe: false,
    structurallyAdequate: false,
    inspectionAdequate: false,
    engineeringAccepted: false,
    sectionPropertiesChanged: false,
    materialPropertiesChanged: false,
    capacityChanged: false,
    analysisModelChanged: false,
    supportsChanged: false,
    releasesChanged: false,
    loadsChanged: false,
    structureClear: false,
    systemCoverageComplete: false,
  };
}

export function evaluateStructuralInspectionEvidence(store: D1hR1Store, inspectionContextId: string): D1hR1RuntimeResult {
  const context = contextOf(store, inspectionContextId);
  const effective = currentD1hR1Effective(store, "CONTEXT", context.inspectionContextId);
  const targets = store.targets.filter((row) => row.inspectionContextId === context.inspectionContextId);
  const coverages = store.coverages.filter((row) => row.inspectionContextId === context.inspectionContextId);
  const evidence = store.evidence.filter((row) => row.inspectionContextId === context.inspectionContextId);
  const warnings: string[] = [];
  const findings: string[] = [];
  const blockingFindings: string[] = [];
  const contentFingerprints = evidence.map((row) => row.contentFingerprint).filter((id): id is string => Boolean(id));
  const counts = new Map<string, number>();
  for (const id of contentFingerprints) counts.set(id, (counts.get(id) ?? 0) + 1);
  if ([...counts.values()].some((count) => count > 1)) warnings.push("DUPLICATE_CONTENT_NOT_INDEPENDENT");
  if (coverages.some((row) => row.accessState === "INSPECTED_WITH_FINDINGS")) warnings.push("FINDING_RUNTIME_NOT_IN_SCOPE");
  const stale = effective === "STALE"
    || effective === "SUPERSEDED"
    || targets.some((row) => currentD1hR1Effective(store, "TARGET", row.targetId) === "STALE")
    || coverages.some((row) => currentD1hR1Effective(store, "COVERAGE", row.coverageId) === "STALE")
    || evidence.some((row) => currentD1hR1Effective(store, "EVIDENCE", row.evidenceId) === "STALE");
  let completeness: D1hR1EvidenceCompleteness;
  if (stale) completeness = "STALE";
  else if (blockingFindings.length > 0) completeness = "INVALID";
  else if (context.status === "DRAFT" && coverages.length === 0) completeness = "UNDETERMINED";
  else if (coverages.length === 0) completeness = "INCOMPLETE";
  else if (context.declaredTargetIds.some((id) => !coverages.some((row) => row.targetId === id))) completeness = "PARTIAL";
  else completeness = "COMPLETE_FOR_DECLARED_EVIDENCE_SCOPE";
  if (store.invalidations.some((row) => row.cause === "AUTHORITY_WITHDRAWN" && (row.subjectId === context.inspectionContextId || evidence.some((item) => item.evidenceId === row.subjectId)))) {
    blockingFindings.push("AUTHORITY_WITHDRAWN");
  }
  const payload = {
    subject: "D1H_R1_RESULT",
    inspectionContextId: context.inspectionContextId,
    inspectionSessionId: context.inspectionSessionId,
    structuralSystemId: context.structuralSystemId,
    targetIds: sorted(targets.map((row) => row.targetId)),
    coverageIds: sorted(coverages.map((row) => row.coverageId)),
    evidenceIds: sorted(evidence.map((row) => row.evidenceId)),
    scope: context.scopeStatement,
    completeness,
    warnings: sorted(warnings),
    blockingFindings: sorted(blockingFindings),
  };
  const fingerprint = fingerprintCanonical(payload);
  return {
    resultId: fingerprint,
    inspectionContextId: context.inspectionContextId,
    inspectionSessionId: context.inspectionSessionId,
    structuralSystemId: context.structuralSystemId,
    targetIds: payload.targetIds,
    coverageIds: payload.coverageIds,
    evidenceIds: payload.evidenceIds,
    scope: context.scopeStatement,
    completeness,
    findings,
    blockingFindings: payload.blockingFindings,
    runtimeDiagnostics: [...findings, ...payload.warnings].map((code) => ({ kind: "RUNTIME_DIAGNOSTIC" as const, code, structuralFinding: false as const })),
    blockingRuntimeDiagnostics: payload.blockingFindings.map((code) => ({ kind: "RUNTIME_DIAGNOSTIC" as const, code, structuralFinding: false as const })),
    provenance: context.provenance,
    fingerprint,
    warnings: payload.warnings,
    effective,
    ...closedClaims(),
  };
}
