/**
 * EOS-D1I-R1 twin identity and pinned state-reference foundation.
 * Resolves canonical upstream records. Does not copy source bodies, select current state,
 * create snapshots, resolve conflicts, or ingest telemetry.
 */

import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D1hR1CatalogObject, D1hR1ContextRecord } from "./inspection-evidence";
import type { D1hR2InspectionMeasurement, D1hR2StructuralFinding } from "./inspection-finding";
import type { D1hR3ConditionState, D1hR3EngineeringInterpretation } from "./inspection-condition";
import type { D1hR4AnalysisIdentityRef } from "./inspection-temporal";

export const D1I_R1_MATURITY_STATE = "STRUCTURAL_DIGITAL_TWIN_IDENTITY_STATE_REFERENCE_RUNTIME_FOUNDATION_IMPLEMENTED" as const;
export const D1I_R1_PHASE_AUTHORIZED = true as const;
export const D1I_R1_REFERENCE_EQUALS_SOURCE_COPY = false as const;
export const D1I_R1_REFERENCE_EQUALS_ENGINEERING_STATE_AUTHORSHIP = false as const;
export const D1I_R1_REFERENCE_EQUALS_CURRENT_STATE_SELECTION = false as const;
export const D1I_R1_CALLER_SUPPLIED_FINGERPRINT_CAN_ESTABLISH_SOURCE_TRUTH = false as const;
export const D1I_R1_CALLER_SUPPLIED_AUTHORITY_CAN_ESTABLISH_SOURCE_TRUTH = false as const;
export const D1I_R1_CANONICAL_SOURCE_RESOLUTION_REQUIRED = true as const;
export const D1I_R1_KNOWN_AT_CALLER_CONTROLLED = false as const;
export const D1I_R1_KNOWN_AT_TRUSTED_RUNTIME_ASSIGNED = true as const;
export const D1I_R1_EFFECTIVE_TIME_SOURCE_DERIVED = true as const;
export const D1I_R1_CURRENT_REFERENCE_STATUS_EQUALS_GOVERNING_CURRENT_STATE = false as const;
export const D1I_R1_TWIN_IDENTITY_RUNTIME_COUNT = 1 as const;
export const D1I_R1_STATE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1I_R1_SOURCE_RESOLUTION_RUNTIME_COUNT = 1 as const;
export const D1I_R1_CURRENT_STATE_SELECTOR_RUNTIME_COUNT = 0 as const;
export const D1I_R1_CURRENT_STATE_SELECTION_RECORD_COUNT = 0 as const;
export const D1I_R1_SNAPSHOT_RUNTIME_COUNT = 0 as const;
export const D1I_R1_STATE_CONFLICT_RUNTIME_COUNT = 0 as const;
export const D1I_R1_CONFLICT_RUNTIME_COUNT = 0 as const;
export const D1I_R1_AS_OF_QUERY_RUNTIME_COUNT = 0 as const;
export const D1I_R1_AS_KNOWN_QUERY_RUNTIME_COUNT = 0 as const;
export const D1I_R1_TELEMETRY_RUNTIME_COUNT = 0 as const;
export const D1I_R1_SHM_RUNTIME_COUNT = 0 as const;
export const D1I_R1_INFERENCE_ENGINE_COUNT = 0 as const;
export const D1I_R1_INFERRED_STATE_ENGINE_COUNT = 0 as const;
export const D1I_R1_PREDICTION_ENGINE_COUNT = 0 as const;
export const D1I_R1_PREDICTION_RUNTIME_COUNT = 0 as const;
export const D1I_R1_MODEL_CALIBRATION_RUNTIME_COUNT = 0 as const;
export const D1I_R1_STRUCTURAL_ADEQUACY_RUNTIME_COUNT = 0 as const;
export const D1I_R1_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1I_R1_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1I_R1_CONDITION_RATING_ENGINE_COUNT = 0 as const;
export const D1I_R1_DETERIORATION_RUNTIME_COUNT = 0 as const;
export const D1I_R1_CAUSAL_DIAGNOSIS_RUNTIME_COUNT = 0 as const;
export const D1I_R1_REPAIR_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D1I_R1_REPAIR_DESIGN_RUNTIME_COUNT = 0 as const;
export const D1I_R1_BIM_RUNTIME_COUNT = 0 as const;
export const D1I_R1_3D_RUNTIME_COUNT = 0 as const;
export const D1I_R1_AI_RUNTIME_COUNT = 0 as const;
export const D1I_R1_FUTURE_TELEMETRY_REFERENCE_RUNTIME_SUPPORTED = false as const;
export const D1I_R1_ARBITRARY_OTHER_SOURCE_ALLOWED = false as const;
export const D1I_R1_GENERIC_SOURCE_FETCH_API_CREATED = false as const;
export const D1I_R1_SOURCE_BODY_COPIED = false as const;
export const D1I_R1_TWIN_IDENTITY_EQUALS_STRUCTURAL_ASSET_IDENTITY = false as const;
export const D1I_R1_ORPHAN_TWIN_ALLOWED = false as const;
export const D1I_R1_GOVERNED_TARGET_REQUIRED = true as const;
export const D1I_R1_BOUNDED_SCOPE_PARENT_REQUIRED = true as const;
export const D1I_R1_BOUNDED_SCOPE_INFERRED_FROM_GEOMETRY = false as const;
export const D1I_R1_CROSS_PROJECT_TWIN_BINDING_ALLOWED = false as const;
export const D1I_R1_CROSS_TENANT_TWIN_BINDING_ALLOWED = false as const;
export const D1I_R1_TWIN_PURPOSE_INFERRED = false as const;
export const D1I_R1_TWIN_CREATION_AUTHORITY_REQUIRED = true as const;
export const AI_CAN_CREATE_GOVERNING_TWIN = false as const;
export const D1I_R1_TWIN_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R1_SOURCE_OBJECT_TYPE_ALLOWLIST_REQUIRED = true as const;
export const D1I_R1_SOURCE_EXISTENCE_REQUIRED = true as const;
export const D1I_R1_SOURCE_FINGERPRINT_RESOLVED_FROM_CANONICAL_SOURCE = true as const;
export const D1I_R1_EXPECTED_FINGERPRINT_MISMATCH_REJECTED = true as const;
export const D1I_R1_UNVERIFIED_CALLER_FINGERPRINT_STORED_AS_CANONICAL = false as const;
export const D1I_R1_SOURCE_AUTHORITY_PRESERVED = true as const;
export const D1I_R1_REGISTRATION_AUTHORITY_PROMOTES_SOURCE_AUTHORITY = false as const;
export const D1I_R1_SOURCE_VALIDATION_STATE_PRESERVED = true as const;
export const D1I_R1_REFERENCE_REGISTRATION_PROMOTES_VALIDATION = false as const;
export const D1I_R1_ANALYSIS_TO_OBSERVED_ALLOWED = false as const;
export const D1I_R1_ANALYSIS_TO_MEASURED_ALLOWED = false as const;
export const D1I_R1_FREEFORM_INFERRED_STATE_ALLOWED = false as const;
export const D1I_R1_FREEFORM_PREDICTED_STATE_ALLOWED = false as const;
export const D1I_R1_FREEFORM_TELEMETRY_STATE_ALLOWED = false as const;
export const D1I_R1_TARGET_SCOPE_COMPATIBILITY_ENFORCED = true as const;
export const D1I_R1_COMPONENT_MEMBERSHIP_INFERRED = false as const;
export const D1I_R1_CROSS_PROJECT_STATE_REFERENCE_ALLOWED = false as const;
export const D1I_R1_CROSS_TENANT_STATE_REFERENCE_ALLOWED = false as const;
export const D1I_R1_CREATED_AT_AUTO_USED_AS_EFFECTIVE_TIME = false as const;
export const D1I_R1_KNOWN_AT_RUNTIME_ASSIGNED = true as const;
export const D1I_R1_KNOWN_AT_BACKDATE_REJECTED = true as const;
export const D1I_R1_SOURCE_TIMES_PRESERVED = true as const;
export const D1I_R1_EFFECTIVE_TIME_EQUALS_KNOWN_AT_TIME = false as const;
export const D1I_R1_REFERENCE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R1_REFERENCE_FINGERPRINT_INCLUDES_RESOLVED_SOURCE_FINGERPRINT = true as const;
export const D1I_R1_TWIN_HISTORY_APPEND_ONLY = true as const;
export const D1I_R1_REFERENCE_HISTORY_APPEND_ONLY = true as const;
export const D1I_R1_REFERENCE_REBINDS_IN_PLACE = false as const;
export const D1I_R1_SOURCE_SUPERSESSION_REWRITES_REFERENCE = false as const;
export const D1I_R1_SOURCE_FINGERPRINT_CHANGE_AUTO_ACCEPTED = false as const;
export const D1I_R1_TARGET_STALENESS_PROPAGATES = true as const;
export const D1I_R1_SOURCE_STALENESS_PROPAGATES = true as const;
export const D1I_R1_INVALIDATION_MUTATES_UPSTREAM_SOURCE = false as const;
export const D1I_R1_INVALIDATION_DELETES_REFERENCE_HISTORY = false as const;
export const D1I_R1_PROVENANCE_COMPLETE = true as const;
export const D1I_R1_AUTHORITY_LAYERS_DISTINCT = true as const;
export const D1I_R1_AI_SOURCE_RESOLUTION_AUTHORITY = false as const;
export const D1I_R1_AI_STATE_CLASS_AUTHORITY = false as const;
export const D1I_R1_AI_TARGET_AUTHORITY = false as const;
export const D1I_R1_ANALYSIS_AUTHORITY_CLASSES_PRESERVED = true as const;
export const D1I_R1_FAILED_ANALYSIS_GOVERNS_PHYSICAL_STATE = false as const;
export const D1I_R1_NONCONVERGED_ANALYSIS_GOVERNS_PHYSICAL_STATE = false as const;
export const D1I_R1_ANALYSIS_RESULT_EQUALS_OBSERVED_STATE = false as const;
export const D1I_R1_ANALYSIS_RESULT_EQUALS_MEASURED_STATE = false as const;
export const D1I_R1_CONDITION_REFERENCE_MUTATES_D1H = false as const;
export const D1I_R1_D1H_HISTORICAL_REFERENCE_SUPPORTED = true as const;
export const D1I_R1_NO_REFERENCE_EQUALS_HEALTHY = false as const;
export const D1I_R1_NO_D1H_CONDITION_EQUALS_HEALTHY = false as const;
export const D1I_R1_REFERENCE_AUTO_CHANGES_CAPACITY = false as const;
export const D1I_R1_REFERENCE_AUTO_CHANGES_SECTION_PROPERTY = false as const;
export const D1I_R1_REFERENCE_AUTO_CHANGES_MATERIAL_PROPERTY = false as const;
export const D1I_R1_REFERENCE_AUTO_CHANGES_ANALYSIS_MODEL = false as const;
export const D1I_R1_REFERENCE_AUTO_CHANGES_SUPPORTS = false as const;
export const D1I_R1_REFERENCE_AUTO_CHANGES_RELEASES = false as const;
export const D1I_R1_REFERENCE_AUTO_CHANGES_LOADS = false as const;
export const D1I_R1_STATE_CHANGE_AUTO_TRIGGERS_SOLVER = false as const;
export const D1I_R1_PERSON_TWIN_IMPLEMENTED = false as const;
export const D1I_R1_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1I_R1_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1I_R1_CREATE_TWIN_FAIL_CLOSED = true as const;
export const D1I_R1_REGISTER_REFERENCE_FAIL_CLOSED = true as const;
export const D1I_R1_RUNTIME_DIAGNOSTIC_EQUALS_TWIN_STATE = false as const;
export const D1I_R1_RUNTIME_DIAGNOSTIC_EQUALS_STRUCTURAL_FINDING = false as const;
export const D1I_R1_COMPLETE_EQUALS_COMPLETE_PHYSICAL_TWIN = false as const;
export const D1I_R1_COMPLETE_EQUALS_HEALTHY_STRUCTURE = false as const;
export const D1I_R1_COMPLETE_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1I_R1_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1I_R1_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1I_R1_DUPLICATE_REFERENCE_COUNTS_AS_INDEPENDENT_STATE = false as const;
export const D1I_R1_D1A_STATE_CLASS_MAPPING_EXPLICIT = true as const;
export const D1I_R1_D1H_MEASUREMENT_MAPPING_EXPLICIT = true as const;
export const D1I_R1_D1H_INTERPRETATION_MAPPING_EXPLICIT = true as const;
export const D1I_R1_D1H_CONDITION_MAPPING_EXPLICIT = true as const;
export const D1I_R1_SOURCE_AUTHORITY_SPOOF_ALLOWED = false as const;
export const D1I_R1_REFERENCE_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1I_R1_ARBITRARY_SOURCE_SELECTOR_ALLOWED = false as const;
export const D1I_R1_D1H_MATURITY_PROMOTION = false as const;
export const D1I_R1_D1H_ENGINEER_VALIDATION_PROMOTION = false as const;
export const D1I_R1_D1H_CONFORMANCE_PROMOTION = false as const;
export const D1I_R2_HANDOFF_READY = true as const;

export const D1I_R1_SUPPORTED_TWIN_TARGET_KINDS = ["STRUCTURAL_SYSTEM", "MEMBER", "CONNECTION", "SUPPORT", "FOUNDATION"] as const;
export const D1I_R1_TWIN_SCOPES = ["STRUCTURAL_SYSTEM", "BOUNDED_STRUCTURAL_ASSET_SCOPE"] as const;
export const D1I_R1_RUNTIME_SUPPORTED_SOURCE_DOMAINS = [
  "D1A_DESIGN_OR_REFERENCE",
  "D1F_STRUCTURAL_SYSTEM",
  "D1F_ANALYSIS",
  "D1G_EXTERNAL_ANALYSIS_RESULT",
  "D1H_INSPECTION_CONDITION",
] as const;
export const D1I_R1_COMPLETENESS_STATES = ["COMPLETE_FOR_DECLARED_REFERENCE_SCOPE", "PARTIAL", "INCOMPLETE", "INVALID", "STALE", "UNDETERMINED"] as const;
export const D1I_R1_EVENTS = [
  "STRUCTURAL_DIGITAL_TWIN_CREATED",
  "TWIN_STATE_REFERENCE_REGISTERED",
  "TWIN_STATE_REFERENCE_SUPERSEDED",
  "TWIN_STATE_REFERENCE_STALE",
  "TWIN_STATE_REFERENCE_INVALIDATED",
] as const;
export const D1I_R1_REFERENCE_STATUSES = ["CURRENT_REFERENCE", "HISTORICAL_REFERENCE", "STALE_REFERENCE", "UNRESOLVED_REFERENCE", "INVALID_REFERENCE", "SUPERSEDED_REFERENCE"] as const;

export const D1I_R1_MULTIPLE_TWINS_PER_TARGET_POLICY = "Multiple governed twins may bind the same structural target when each purpose is explicit. There is no universal one-twin-per-asset rule. An exact retry of the same twin identity returns the existing twin." as const;
export const D1I_R1_UNRESOLVED_REFERENCE_POLICY = "A new registration fails when the canonical source cannot be resolved. UNRESOLVED_REFERENCE is only a later status of a previously valid pinned reference whose source can no longer be resolved. No historical import route is implemented." as const;
export const D1I_R1_SOURCE_VERSION_POLICY = "The runtime records the explicit upstream version when the canonical source has one. It does not invent version 1, latest, or current. A missing explicit version stays null and the canonical fingerprint remains the pin." as const;
export const D1I_R1_AUTHORITY_SEPARATION_CONTRACT = "Source authority is read from the canonical source. Registration authority is the authorized actor who pinned the reference. Registration does not promote source authority or validation." as const;
export const D1I_R1_STATE_CLASS_SOURCE_COMPATIBILITY_MATRIX = "D1A and D1F structural identity map only to DESIGN_OR_REFERENCE_STATE. D1F and D1G analysis results map only to ANALYTICAL_STATE. D1H structural findings map only to OBSERVED_STATE. D1H measurements map only to MEASURED_STATE. D1H interpretations map only to ENGINEERING_INTERPRETED_STATE. D1H condition states map only to CONDITION_STATE. Evidence and ratings are not automatically those classes." as const;
export const D1I_R1_D1F_SYSTEM_STATE_CLASS_POLICY = "Structural system identity metadata maps only to DESIGN_OR_REFERENCE_STATE. It is not measured state and not observed state." as const;
export const D1I_R1_D1H_OBSERVED_STATE_MAPPING_POLICY = "Only a D1H structural finding maps to OBSERVED_STATE. Inspection evidence is not treated as observed state automatically." as const;
export const D1I_R1_D1H_RATING_REFERENCE_POLICY = "A condition rating is not a condition state. R1 does not register a rating record as CONDITION_STATE." as const;
export const D1I_R1_EFFECTIVE_TIME_RESOLUTION_MATRIX = "Design or structural identity uses the canonical identity effectiveAt when that upstream field exists. Analysis uses analysisTimestamp. Findings, interpretations, and condition states use the inspection context inspectedAt. Measurements use measuredAt. Record createdAt and context recordedAt are not effective time." as const;
export const D1I_R1_MISSING_EFFECTIVE_TIME_POLICY = "When the source class needs an effective time and the canonical source does not provide one, registration fails closed with EFFECTIVE_TIME_UNRESOLVED. No timestamp is fabricated." as const;
export const D1I_R1_TRUSTED_CLOCK_POLICY = "knownAtTime comes from the clock injected into the R1 store. Tests pass a fixed clock. The registration request cannot supply it." as const;
export const D1I_R1_LATE_SOURCE_SEMANTICS = "A source whose effective time is 1 June and whose reference is registered on the trusted clock at 10 June keeps effectiveTime at 1 June and knownAtTime at 10 June." as const;
export const D1I_R1_REFERENCE_STATUS_RUNTIME_CONTRACT = "CURRENT_REFERENCE means an active non-superseded reference record. It does not select governing physical state. HISTORICAL_REFERENCE is used for failed or nonconverged analysis context. Later evaluation may mark STALE, INVALID, UNRESOLVED, or SUPERSEDED without rewriting the pin." as const;
export const D1I_R1_DISPLAY_METADATA_POLICY = "R1 stores no display metadata. Labels are not a substitute for source resolution." as const;
export const D1I_R1_KNOWN_AT_FINGERPRINT_POLICY = "The reference fingerprint includes the trusted runtime-assigned knownAtTime. A caller timestamp is rejected and is not hashed." as const;
export const D1I_R1_REFERENCE_CORRECTION_CONTRACT = "A correction that changes source identity, version, or fingerprint creates a successor reference. The predecessor pin stays unchanged and becomes SUPERSEDED_REFERENCE." as const;
export const D1I_R1_AUTHORITY_WITHDRAWAL_INVALIDATION_POLICY = "If the canonical source later reports STALE, SUPERSEDED, INVALID, or WITHDRAWN, the reference becomes STALE_REFERENCE or INVALID_REFERENCE. The stored pin is not rewritten and the upstream object is not mutated." as const;
export const D1I_R1_PROVENANCE_GRAPH_IMPLEMENTED = "Structural target to twin to state reference to the exact upstream object id, version, and fingerprint. Analysis references also pin model, run, and result identity. D1H references pin the finding, measurement, interpretation, or condition id." as const;
export const D1I_R1_REGISTRATION_REQUEST_TRUST_BOUNDARY = "The caller may supply twin id, source domain, allowlisted object type, object id, compatible state class, optional expected version, optional expected fingerprint, and limitations. The caller cannot author source authority, source validation, canonical fingerprint, or known-at time." as const;
export const D1I_R1_ERROR_TAXONOMY = "TWIN_NOT_FOUND, TARGET_NOT_FOUND, TARGET_STALE, SOURCE_DOMAIN_UNSUPPORTED, SOURCE_OBJECT_TYPE_UNSUPPORTED, SOURCE_NOT_FOUND, SOURCE_VERSION_MISMATCH, SOURCE_FINGERPRINT_MISMATCH, SOURCE_AUTHORITY_UNRESOLVED, SOURCE_VALIDATION_UNRESOLVED, SOURCE_AUTHORITY_ASSERTION_REJECTED, SOURCE_VALIDATION_ASSERTION_REJECTED, STATE_CLASS_SOURCE_MISMATCH, TARGET_SCOPE_MISMATCH, CROSS_PROJECT_REFERENCE, CROSS_TENANT_REFERENCE, EFFECTIVE_TIME_UNRESOLVED, SOURCE_STALE, SOURCE_INVALID, KNOWN_AT_BACKDATE_REJECTED, UNAUTHORIZED, ARBITRARY_SOURCE_SELECTOR, REFERENCE_REBIND_REJECTED." as const;
export const D1I_R1_RUNTIME_RESULT_CONTRACT = "A result names resultId, twinId, registered reference ids, scope, completeness for that registration scope, runtime diagnostics, blocking diagnostics, warnings, provenance, and fingerprint. Diagnostics are not engineering states." as const;
export const D1I_R1_REGISTRATION_IDEMPOTENCY_POLICY = "An exact retry for the same twin, state class, source object, resolved version, resolved fingerprint, and effective time returns the existing reference and does not create a second semantic state." as const;
export const D1I_R1_CROSS_TWIN_REFERENCE_REUSE_POLICY = "Different governed twins may pin the same upstream source when each twin scope permits that target. Reuse is not independent evidence inside one twin." as const;
export const D1I_R1_RUNTIME_API = "createTwin, inspectTwin, registerStateReference, inspectStateReference, supersedeStateReference, evaluateStateReferenceStatus, produceTwinReferenceFoundationResult." as const;
export const D1I_R1_TWIN_IDENTITY_RUNTIME_CONTRACT = "createTwin records twinId, tenant, workspace, project, scope, governed structural target, explicit purpose, registration authority, governance profile, trusted createdAt, version, fingerprint, and RECORDED status." as const;
export const D1I_R1_STATE_REFERENCE_RUNTIME_CONTRACT = "registerStateReference records a pinned pointer with state class, source domain, allowlisted object type, object id, resolved version, resolved fingerprint, source authority, source validation, target, source-derived effective time, trusted known-at time, source times, reference status, limitations, registration authority, provenance, version, and fingerprint." as const;
export const D1I_R1_SOURCE_RESOLVER_REGISTRY = "Explicit resolvers: D1A design identity, D1F structural identity, D1F analysis identity, D1G external analysis identity, D1H finding, measurement, interpretation, and condition state. An R4 telemetry data reference resolves only when that exact pin is already published. No generic object fetch is registered." as const;
export const D1I_R2_REQUIRED_R1_CONTRACTS = "twinIdentity, governedStructuralTarget, stateReferenceIdentity, sourceDomain, stateClass, resolvedSourceIdentity, sourceVersion, sourceFingerprint, sourceAuthority, sourceValidation, effectiveTime, knownAtTime, sourceTimes, referenceStatus, registrationAuthority, provenance, fingerprint, history, staleness." as const;
export const D1I_R1_CANONICAL_NAME = "STRUCTURAL DIGITAL TWIN" as const;

export type D1iR1TargetKind = (typeof D1I_R1_SUPPORTED_TWIN_TARGET_KINDS)[number];
export type D1iR1TwinScope = (typeof D1I_R1_TWIN_SCOPES)[number];
export type D1iR1SourceDomain = (typeof D1I_R1_RUNTIME_SUPPORTED_SOURCE_DOMAINS)[number] | "FUTURE_TELEMETRY";
export type D1iR1ReferenceStatus = (typeof D1I_R1_REFERENCE_STATUSES)[number];
export type D1iR1Completeness = (typeof D1I_R1_COMPLETENESS_STATES)[number];
export type D1iR1StateClass = "DESIGN_OR_REFERENCE_STATE" | "ANALYTICAL_STATE" | "OBSERVED_STATE" | "MEASURED_STATE" | "ENGINEERING_INTERPRETED_STATE" | "CONDITION_STATE" | "INFERRED_STATE" | "PREDICTED_STATE" | "TELEMETRY_STATE";

export type D1iR1StructuralIdentity = D1hR1CatalogObject & {
  authority: string;
  validationState: string;
  effectiveAt: string | null;
  contentFingerprint: string | null;
};

export type D1iR1UpstreamMark = { objectType: string; objectId: string; mark: "CURRENT" | "STALE" | "INVALID" | "SUPERSEDED" | "WITHDRAWN" };

export type D1iR1Catalog = {
  identities: D1iR1StructuralIdentity[];
  contexts: D1hR1ContextRecord[];
  findings: D1hR2StructuralFinding[];
  measurements: D1hR2InspectionMeasurement[];
  interpretations: D1hR3EngineeringInterpretation[];
  conditionStates: D1hR3ConditionState[];
  analysisResults: D1hR4AnalysisIdentityRef[];
  upstreamMarks: D1iR1UpstreamMark[];
};

export type D1iR1Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D1iR1SourceTimes = {
  inspectionTime: string | null;
  measurementTime: string | null;
  captureTime: string | null;
  analysisRunTime: string | null;
  conditionEffectiveTime: string | null;
  validationTime: string | null;
  sourceCreationTime: string | null;
};

export type D1iR1TargetPin = {
  targetKind: D1iR1TargetKind;
  targetId: string;
  structuralSystemId: string;
  sourceVersion: string;
  sourceFingerprint: string;
};

export type D1iR1TwinRecord = {
  recordKind: "TWIN_IDENTITY";
  twinId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  twinScope: D1iR1TwinScope;
  governedStructuralTargetRef: D1iR1TargetPin;
  purpose: string;
  authority: string;
  registrationActorId: string;
  governanceProfileRef: string;
  createdAt: string;
  version: string;
  fingerprint: string;
  status: "RECORDED";
  replacesStructuralIdentity: false;
  copiesUpstreamBodies: false;
};

export type D1iR1StateReference = {
  recordKind: "STATE_REFERENCE";
  stateReferenceId: string;
  twinId: string;
  stateClass: D1iR1StateClass;
  sourceDomain: D1iR1SourceDomain;
  sourceObjectType: string;
  sourceObjectId: string;
  sourceVersion: string | null;
  sourceFingerprint: string;
  sourceAuthority: string;
  sourceValidationState: string;
  analysisAuthorityClass: "RAW" | "NORMALIZED" | "GOVERNED" | null;
  analysisModelId: string | null;
  analysisRunId: string | null;
  structuralTargetRef: D1iR1TargetPin;
  effectiveTime: string;
  knownAtTime: string;
  sourceTimes: D1iR1SourceTimes;
  referenceStatus: D1iR1ReferenceStatus;
  statusMeaning: "ACTIVE_REFERENCE_RECORD_NOT_GOVERNING_STATE" | "HISTORICAL_CONTEXT_NOT_PHYSICAL_TRUTH" | "NON_GOVERNING_STATUS";
  governsPhysicalState: false;
  limitations: string;
  registrationAuthority: string;
  registrationActorId: string;
  provenance: D1iR1Provenance;
  version: string;
  fingerprint: string;
  predecessorId: string | null;
  copiesSourceBody: false;
  independentEvidence: false;
};

export type D1iR1Provenance = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  twinId: string;
  structuralTargetId: string;
  actorOrSystem: string;
  registrationAuthority: string;
  sourceAuthority: string;
  sourceDomain: string;
  sourceObjectType: string;
  sourceObjectId: string;
  sourceFingerprint: string;
  sourceValidationState: string;
  effectiveTime: string;
  knownAtTime: string;
  version: string;
  fingerprint: string;
};

export type D1iR1HistoryEntry = {
  historyId: string;
  subjectKind: "TWIN" | "STATE_REFERENCE";
  subjectId: string;
  action: string;
  version: string;
  fingerprint: string;
  recordedAt: string;
  predecessorId: string | null;
};

export type D1iR1TelemetryPin = {
  telemetryReferenceId: string;
  version: string;
  fingerprint: string;
  structuralTargetRef: D1iR1TargetPin;
  sourceAuthority: string;
  sourceValidationState: string;
  effectiveTime: string;
  sourceTimes: D1iR1SourceTimes;
  bindingFingerprint: string;
  qualityCalibrationIdentity: string;
  status: "ACTIVE" | "STALE" | "INVALID";
};

export type D1iR1Store = {
  catalog: D1iR1Catalog;
  now: () => string;
  twins: D1iR1TwinRecord[];
  references: D1iR1StateReference[];
  history: D1iR1HistoryEntry[];
  events: Array<{ eventId: string; eventType: (typeof D1I_R1_EVENTS)[number]; subjectId: string; recordedAt: string; engineeringApproval: false }>;
  telemetryPins?: D1iR1TelemetryPin[];
};

export type D1iR1CreateTwinInput = {
  twinId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  twinScope: D1iR1TwinScope;
  targetKind: D1iR1TargetKind;
  targetId: string;
  parentStructuralSystemId: string | null;
  purpose: string;
  governanceProfileRef: string;
  version: string;
  limitations?: string;
};

export type D1iR1RegisterInput = {
  stateReferenceId?: string;
  twinId: string;
  sourceDomain: string;
  sourceObjectType: string;
  sourceObjectId: string;
  stateClass: string;
  expectedSourceVersion?: string;
  expectedSourceFingerprint?: string;
  assertedSourceAuthority?: string;
  assertedSourceValidationState?: string;
  knownAtTime?: string;
  limitations: string;
  version: string;
};

export type D1iR1RuntimeResult = {
  resultId: string;
  twinId: string;
  registeredReferenceIds: readonly string[];
  scope: string;
  completeness: D1iR1Completeness;
  runtimeDiagnostics: readonly { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false; twinState: false }[];
  blockingRuntimeDiagnostics: readonly { kind: "RUNTIME_DIAGNOSTIC"; code: string; structuralFinding: false; twinState: false }[];
  warnings: readonly string[];
  provenance: D1iR1Provenance | null;
  fingerprint: string;
  healthyStructure: false;
  structuralAdequacy: false;
  completePhysicalTwin: false;
};

const DOMAIN_TYPES: Record<D1iR1SourceDomain, readonly string[]> = {
  D1A_DESIGN_OR_REFERENCE: ["STRUCTURAL_SYSTEM", "MEMBER", "CONNECTION", "SUPPORT", "FOUNDATION"],
  D1F_STRUCTURAL_SYSTEM: ["STRUCTURAL_SYSTEM"],
  D1F_ANALYSIS: ["ANALYSIS_RESULT"],
  D1G_EXTERNAL_ANALYSIS_RESULT: ["ANALYSIS_RESULT"],
  D1H_INSPECTION_CONDITION: ["STRUCTURAL_FINDING", "INSPECTION_MEASUREMENT", "ENGINEERING_INTERPRETATION", "CONDITION_STATE"],
  FUTURE_TELEMETRY: ["TELEMETRY_DATA_REFERENCE"],
};

const CLASS_BY_TYPE: Record<string, D1iR1StateClass> = {
  "D1A_DESIGN_OR_REFERENCE:STRUCTURAL_SYSTEM": "DESIGN_OR_REFERENCE_STATE",
  "D1A_DESIGN_OR_REFERENCE:MEMBER": "DESIGN_OR_REFERENCE_STATE",
  "D1A_DESIGN_OR_REFERENCE:CONNECTION": "DESIGN_OR_REFERENCE_STATE",
  "D1A_DESIGN_OR_REFERENCE:SUPPORT": "DESIGN_OR_REFERENCE_STATE",
  "D1A_DESIGN_OR_REFERENCE:FOUNDATION": "DESIGN_OR_REFERENCE_STATE",
  "D1F_STRUCTURAL_SYSTEM:STRUCTURAL_SYSTEM": "DESIGN_OR_REFERENCE_STATE",
  "D1F_ANALYSIS:ANALYSIS_RESULT": "ANALYTICAL_STATE",
  "D1G_EXTERNAL_ANALYSIS_RESULT:ANALYSIS_RESULT": "ANALYTICAL_STATE",
  "D1H_INSPECTION_CONDITION:STRUCTURAL_FINDING": "OBSERVED_STATE",
  "D1H_INSPECTION_CONDITION:INSPECTION_MEASUREMENT": "MEASURED_STATE",
  "D1H_INSPECTION_CONDITION:ENGINEERING_INTERPRETATION": "ENGINEERING_INTERPRETED_STATE",
  "D1H_INSPECTION_CONDITION:CONDITION_STATE": "CONDITION_STATE",
  "FUTURE_TELEMETRY:TELEMETRY_DATA_REFERENCE": "TELEMETRY_STATE",
};

function fail(code: string): never {
  throw new Error(code);
}

function required(value: string, code: string): string {
  const trimmed = value.trim();
  if (!trimmed) fail(code);
  return trimmed;
}

function assertSelector(value: string): string {
  const trimmed = required(value, "ARBITRARY_SOURCE_SELECTOR");
  if (/[\\/]|https?:|\.\.|\bselect\b|\bfrom\b|file:/i.test(trimmed)) fail("ARBITRARY_SOURCE_SELECTOR");
  return trimmed;
}

function assertActor(actor: D1iR1Actor, scope: { tenantId: string; workspaceId: string; projectId: string }): void {
  required(actor.actorId, "UNAUTHORIZED");
  required(actor.authority, "UNAUTHORIZED");
  if (actor.authority.toUpperCase().startsWith("AI") || actor.authority.toUpperCase().includes("LLM")) fail("UNAUTHORIZED");
  if (actor.tenantId !== scope.tenantId) fail("CROSS_TENANT_REFERENCE");
  if (actor.workspaceId !== scope.workspaceId || actor.projectId !== scope.projectId) fail("CROSS_PROJECT_REFERENCE");
}

function blankTimes(): D1iR1SourceTimes {
  return { inspectionTime: null, measurementTime: null, captureTime: null, analysisRunTime: null, conditionEffectiveTime: null, validationTime: null, sourceCreationTime: null };
}

function markFor(catalog: D1iR1Catalog, objectType: string, objectId: string): D1iR1UpstreamMark["mark"] {
  return catalog.upstreamMarks.find((row) => row.objectType === objectType && row.objectId === objectId)?.mark ?? "CURRENT";
}

function assertRegistrable(mark: D1iR1UpstreamMark["mark"]): void {
  if (mark === "STALE" || mark === "SUPERSEDED") fail("SOURCE_STALE");
  if (mark === "INVALID" || mark === "WITHDRAWN") fail("SOURCE_INVALID");
}

function identityFingerprint(row: D1iR1StructuralIdentity): string {
  return row.contentFingerprint ?? fingerprintCanonical({
    kind: row.kind,
    id: row.id,
    structuralSystemId: row.structuralSystemId,
    version: row.version,
    lifecycle: row.lifecycle,
    authority: row.authority,
    validationState: row.validationState,
  });
}

function identityPin(row: D1iR1StructuralIdentity): D1iR1TargetPin {
  return {
    targetKind: row.kind,
    targetId: row.id,
    structuralSystemId: row.structuralSystemId,
    sourceVersion: row.version,
    sourceFingerprint: identityFingerprint(row),
  };
}

function findIdentity(catalog: D1iR1Catalog, kind: string, id: string): D1iR1StructuralIdentity | undefined {
  return catalog.identities.find((row) => row.kind === kind && row.id === id);
}

function contextFor(catalog: D1iR1Catalog, inspectionContextId: string): D1hR1ContextRecord {
  return catalog.contexts.find((row) => row.inspectionContextId === inspectionContextId) ?? fail("EFFECTIVE_TIME_UNRESOLVED");
}

function scopeOfContext(context: D1hR1ContextRecord, twin: D1iR1TwinRecord): void {
  if (context.tenantId !== twin.tenantId) fail("CROSS_TENANT_REFERENCE");
  if (context.workspaceId !== twin.workspaceId || context.projectId !== twin.projectId) fail("CROSS_PROJECT_REFERENCE");
}

function assertInTwinScope(twin: D1iR1TwinRecord, target: D1iR1TargetPin): void {
  if (twin.twinScope === "STRUCTURAL_SYSTEM") {
    if (target.structuralSystemId !== twin.governedStructuralTargetRef.targetId && target.targetId !== twin.governedStructuralTargetRef.targetId) {
      fail("TARGET_SCOPE_MISMATCH");
    }
    return;
  }
  if (target.targetId !== twin.governedStructuralTargetRef.targetId) fail("TARGET_SCOPE_MISMATCH");
}

function analysisFingerprint(row: D1hR4AnalysisIdentityRef): string {
  return fingerprintCanonical({
    analysisResultId: row.analysisResultId,
    analysisModelId: row.analysisModelId,
    analysisModelVersion: row.analysisModelVersion,
    analysisModelFingerprint: row.analysisModelFingerprint,
    analysisRunId: row.analysisRunId,
    analysisRunFingerprint: row.analysisRunFingerprint,
    resultClass: row.resultClass,
    authorityState: row.authorityState,
    runStatus: row.runStatus,
    resultSetId: row.resultSetId,
  });
}

function analysisClass(resultClass: D1hR4AnalysisIdentityRef["resultClass"]): "RAW" | "NORMALIZED" | "GOVERNED" | null {
  if (resultClass === "RAW_PROVIDER_RESULT") return "RAW";
  if (resultClass === "NORMALIZED_RESULT") return "NORMALIZED";
  if (resultClass === "GOVERNED_RESULT") return "GOVERNED";
  return null;
}

type Resolved = {
  sourceDomain: D1iR1SourceDomain;
  sourceObjectType: string;
  sourceObjectId: string;
  sourceVersion: string | null;
  sourceFingerprint: string;
  sourceAuthority: string;
  sourceValidationState: string;
  analysisAuthorityClass: "RAW" | "NORMALIZED" | "GOVERNED" | null;
  analysisModelId: string | null;
  analysisRunId: string | null;
  structuralTargetRef: D1iR1TargetPin;
  effectiveTime: string;
  sourceTimes: D1iR1SourceTimes;
  historicalContext: boolean;
};

function resolveIdentityState(catalog: D1iR1Catalog, domain: D1iR1SourceDomain, objectType: string, objectId: string): Resolved {
  const row = findIdentity(catalog, objectType, objectId);
  if (!row) fail("SOURCE_NOT_FOUND");
  if (domain === "D1F_STRUCTURAL_SYSTEM" && row.kind !== "STRUCTURAL_SYSTEM") fail("SOURCE_OBJECT_TYPE_UNSUPPORTED");
  if (!row.effectiveAt) fail("EFFECTIVE_TIME_UNRESOLVED");
  if (!row.authority) fail("SOURCE_AUTHORITY_UNRESOLVED");
  if (!row.validationState) fail("SOURCE_VALIDATION_UNRESOLVED");
  assertRegistrable(markFor(catalog, objectType, objectId));
  if (row.lifecycle === "SUPERSEDED") fail("SOURCE_STALE");
  const times = blankTimes();
  return {
    sourceDomain: domain,
    sourceObjectType: objectType,
    sourceObjectId: objectId,
    sourceVersion: row.version || null,
    sourceFingerprint: identityFingerprint(row),
    sourceAuthority: row.authority,
    sourceValidationState: row.validationState,
    analysisAuthorityClass: null,
    analysisModelId: null,
    analysisRunId: null,
    structuralTargetRef: identityPin(row),
    effectiveTime: row.effectiveAt,
    sourceTimes: times,
    historicalContext: false,
  };
}

function resolveAnalysis(catalog: D1iR1Catalog, domain: D1iR1SourceDomain, objectId: string, twin: D1iR1TwinRecord): Resolved {
  const row = catalog.analysisResults.find((item) => item.analysisResultId === objectId);
  if (!row) fail("SOURCE_NOT_FOUND");
  if (domain === "D1G_EXTERNAL_ANALYSIS_RESULT" && !row.providerProvenanceRef.trim()) fail("SOURCE_NOT_FOUND");
  if (row.tenantId !== twin.tenantId) fail("CROSS_TENANT_REFERENCE");
  if (row.workspaceId !== twin.workspaceId || row.projectId !== twin.projectId) fail("CROSS_PROJECT_REFERENCE");
  if (!analysisClass(row.resultClass)) fail("STATE_CLASS_SOURCE_MISMATCH");
  if (!row.analysisTimestamp) fail("EFFECTIVE_TIME_UNRESOLVED");
  if (!row.authorityState) fail("SOURCE_AUTHORITY_UNRESOLVED");
  assertRegistrable(markFor(catalog, "ANALYSIS_RESULT", objectId));
  if (row.authorityState === "INVALID" || row.runStatus === "INVALID") fail("SOURCE_INVALID");
  if (row.authorityState === "STALE" || row.runStatus === "STALE" || row.runStatus === "SUPERSEDED") fail("SOURCE_STALE");
  const system = findIdentity(catalog, "STRUCTURAL_SYSTEM", row.structuralSystemId);
  if (!system) fail("TARGET_NOT_FOUND");
  const historicalContext = row.runStatus === "FAILED" || row.runStatus === "NONCONVERGED" || row.authorityState === "FAILED_ANALYSIS";
  const times = blankTimes();
  times.analysisRunTime = row.analysisTimestamp;
  return {
    sourceDomain: domain,
    sourceObjectType: "ANALYSIS_RESULT",
    sourceObjectId: objectId,
    sourceVersion: row.analysisModelVersion || null,
    sourceFingerprint: analysisFingerprint(row),
    sourceAuthority: row.authorityState,
    sourceValidationState: row.runStatus,
    analysisAuthorityClass: analysisClass(row.resultClass),
    analysisModelId: row.analysisModelId,
    analysisRunId: row.analysisRunId,
    structuralTargetRef: identityPin(system),
    effectiveTime: row.analysisTimestamp,
    sourceTimes: times,
    historicalContext,
  };
}

function resolveD1h(catalog: D1iR1Catalog, objectType: string, objectId: string, twin: D1iR1TwinRecord): Resolved {
  if (objectType === "STRUCTURAL_FINDING") {
    const row = catalog.findings.find((item) => item.findingId === objectId);
    if (!row) fail("SOURCE_NOT_FOUND");
    const context = contextFor(catalog, row.inspectionContextId);
    scopeOfContext(context, twin);
    if (!context.inspectedAt) fail("EFFECTIVE_TIME_UNRESOLVED");
    const target = findIdentity(catalog, "MEMBER", row.targetId) ?? findIdentity(catalog, "STRUCTURAL_SYSTEM", row.targetId) ?? findIdentity(catalog, "CONNECTION", row.targetId) ?? findIdentity(catalog, "SUPPORT", row.targetId) ?? findIdentity(catalog, "FOUNDATION", row.targetId);
    if (!target) fail("TARGET_NOT_FOUND");
    assertRegistrable(markFor(catalog, objectType, objectId));
    const times = blankTimes();
    times.inspectionTime = context.inspectedAt;
    times.sourceCreationTime = row.createdAt;
    return baseD1h(row.findingId, objectType, row.version, row.fingerprint, row.authority, row.validationState, identityPin(target), context.inspectedAt, times);
  }
  if (objectType === "INSPECTION_MEASUREMENT") {
    const row = catalog.measurements.find((item) => item.measurementId === objectId);
    if (!row) fail("SOURCE_NOT_FOUND");
    const context = contextFor(catalog, row.inspectionContextId);
    scopeOfContext(context, twin);
    if (!row.measuredAt) fail("EFFECTIVE_TIME_UNRESOLVED");
    const target = findIdentity(catalog, "MEMBER", row.targetId) ?? findIdentity(catalog, "STRUCTURAL_SYSTEM", row.targetId);
    if (!target) fail("TARGET_NOT_FOUND");
    assertRegistrable(markFor(catalog, objectType, objectId));
    const times = blankTimes();
    times.inspectionTime = context.inspectedAt || null;
    times.measurementTime = row.measuredAt;
    return baseD1h(row.measurementId, objectType, row.version, row.fingerprint, row.authority, row.validationState, identityPin(target), row.measuredAt, times);
  }
  if (objectType === "ENGINEERING_INTERPRETATION") {
    const row = catalog.interpretations.find((item) => item.interpretationId === objectId);
    if (!row) fail("SOURCE_NOT_FOUND");
    const context = contextFor(catalog, row.inspectionContextId);
    scopeOfContext(context, twin);
    if (!context.inspectedAt) fail("EFFECTIVE_TIME_UNRESOLVED");
    const target = findIdentity(catalog, "MEMBER", row.targetId) ?? findIdentity(catalog, "STRUCTURAL_SYSTEM", row.targetId);
    if (!target) fail("TARGET_NOT_FOUND");
    assertRegistrable(markFor(catalog, objectType, objectId));
    const times = blankTimes();
    times.inspectionTime = context.inspectedAt;
    times.sourceCreationTime = row.createdAt;
    return baseD1h(row.interpretationId, objectType, row.version, row.fingerprint, row.authority, row.authority, identityPin(target), context.inspectedAt, times);
  }
  if (objectType === "CONDITION_STATE") {
    const row = catalog.conditionStates.find((item) => item.conditionStateId === objectId);
    if (!row) fail("SOURCE_NOT_FOUND");
    const context = contextFor(catalog, row.inspectionContextId);
    scopeOfContext(context, twin);
    if (!context.inspectedAt) fail("EFFECTIVE_TIME_UNRESOLVED");
    const target = findIdentity(catalog, row.targetKind, row.targetId);
    if (!target) fail("TARGET_NOT_FOUND");
    assertRegistrable(markFor(catalog, objectType, objectId));
    const times = blankTimes();
    times.inspectionTime = context.inspectedAt;
    times.conditionEffectiveTime = context.inspectedAt;
    times.sourceCreationTime = row.createdAt;
    return baseD1h(row.conditionStateId, objectType, row.version, row.fingerprint, row.authority, row.status, identityPin(target), context.inspectedAt, times);
  }
  return fail("SOURCE_OBJECT_TYPE_UNSUPPORTED");
}

function baseD1h(id: string, objectType: string, version: string, fingerprint: string, authority: string, validation: string, target: D1iR1TargetPin, effectiveTime: string, sourceTimes: D1iR1SourceTimes): Resolved {
  if (!fingerprint) fail("SOURCE_FINGERPRINT_MISMATCH");
  if (!authority) fail("SOURCE_AUTHORITY_UNRESOLVED");
  if (!validation) fail("SOURCE_VALIDATION_UNRESOLVED");
  return {
    sourceDomain: "D1H_INSPECTION_CONDITION",
    sourceObjectType: objectType,
    sourceObjectId: id,
    sourceVersion: version || null,
    sourceFingerprint: fingerprint,
    sourceAuthority: authority,
    sourceValidationState: validation,
    analysisAuthorityClass: null,
    analysisModelId: null,
    analysisRunId: null,
    structuralTargetRef: target,
    effectiveTime,
    sourceTimes,
    historicalContext: false,
  };
}

function resolveTelemetryPin(store: D1iR1Store, objectId: string, twin: D1iR1TwinRecord): Resolved {
  const pin = store.telemetryPins?.find((row) => row.telemetryReferenceId === objectId);
  if (!pin) fail("SOURCE_NOT_FOUND");
  if (pin.status === "INVALID") fail("SOURCE_INVALID");
  if (pin.status === "STALE") fail("SOURCE_STALE");
  assertInTwinScope(twin, pin.structuralTargetRef);
  return {
    sourceDomain: "FUTURE_TELEMETRY",
    sourceObjectType: "TELEMETRY_DATA_REFERENCE",
    sourceObjectId: pin.telemetryReferenceId,
    sourceVersion: pin.version,
    sourceFingerprint: pin.fingerprint,
    sourceAuthority: pin.sourceAuthority,
    sourceValidationState: pin.sourceValidationState,
    analysisAuthorityClass: null,
    analysisModelId: null,
    analysisRunId: null,
    structuralTargetRef: pin.structuralTargetRef,
    effectiveTime: pin.effectiveTime,
    sourceTimes: pin.sourceTimes,
    historicalContext: false,
  };
}

export function publishTelemetryPin(store: D1iR1Store, pin: D1iR1TelemetryPin): void {
  if (!store.telemetryPins) store.telemetryPins = [];
  const existing = store.telemetryPins.find((row) => row.telemetryReferenceId === pin.telemetryReferenceId);
  if (!existing) {
    store.telemetryPins.push({ ...pin, sourceTimes: { ...pin.sourceTimes }, structuralTargetRef: { ...pin.structuralTargetRef } });
    return;
  }
  if (existing.fingerprint !== pin.fingerprint) {
    existing.status = "STALE";
    return;
  }
  existing.status = pin.status;
}

export function markTelemetryPinStatus(store: D1iR1Store, telemetryReferenceId: string, status: D1iR1TelemetryPin["status"]): void {
  const pin = store.telemetryPins?.find((row) => row.telemetryReferenceId === telemetryReferenceId);
  if (!pin) fail("SOURCE_NOT_FOUND");
  pin.status = status;
}

function resolveSource(catalog: D1iR1Catalog, domain: string, objectType: string, objectId: string, twin: D1iR1TwinRecord, store: D1iR1Store): Resolved {
  if (domain === "FUTURE_TELEMETRY") {
    if (objectType !== "TELEMETRY_DATA_REFERENCE") fail("SOURCE_DOMAIN_UNSUPPORTED");
    return resolveTelemetryPin(store, objectId, twin);
  }
  if (domain === "OTHER_GOVERNED_SOURCE") fail("SOURCE_DOMAIN_UNSUPPORTED");
  if (!D1I_R1_RUNTIME_SUPPORTED_SOURCE_DOMAINS.includes(domain as (typeof D1I_R1_RUNTIME_SUPPORTED_SOURCE_DOMAINS)[number])) fail("SOURCE_DOMAIN_UNSUPPORTED");
  const typed = domain as D1iR1SourceDomain;
  const allowed = DOMAIN_TYPES[typed];
  if (!allowed.includes(objectType)) fail("SOURCE_OBJECT_TYPE_UNSUPPORTED");
  if (typed === "D1A_DESIGN_OR_REFERENCE" || typed === "D1F_STRUCTURAL_SYSTEM") return resolveIdentityState(catalog, typed, objectType, objectId);
  if (typed === "D1F_ANALYSIS" || typed === "D1G_EXTERNAL_ANALYSIS_RESULT") return resolveAnalysis(catalog, typed, objectId, twin);
  return resolveD1h(catalog, objectType, objectId, twin);
}

function remember(store: D1iR1Store, subjectKind: D1iR1HistoryEntry["subjectKind"], subjectId: string, action: string, version: string, fingerprint: string, predecessorId: string | null, eventType: (typeof D1I_R1_EVENTS)[number]): void {
  const recordedAt = store.now();
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, version, fingerprint, recordedAt, predecessorId });
  store.events.push({ eventId: `evt-${store.events.length + 1}`, eventType, subjectId, recordedAt, engineeringApproval: false });
}

export function createD1iR1Store(catalog: D1iR1Catalog, now: () => string): D1iR1Store {
  if (typeof now !== "function") fail("CLOCK_REQUIRED");
  return { catalog, now, twins: [], references: [], history: [], events: [] };
}

export function createTwin(store: D1iR1Store, actor: D1iR1Actor, input: D1iR1CreateTwinInput): D1iR1TwinRecord {
  const extra = input as D1iR1CreateTwinInput & { coordinates?: unknown; proximity?: unknown; fileName?: unknown };
  if (extra.coordinates !== undefined || extra.proximity !== undefined || extra.fileName !== undefined) fail("BOUNDED_SCOPE_GEOMETRY_REJECTED");
  assertActor(actor, input);
  const twinId = assertSelector(input.twinId);
  const purpose = required(input.purpose, "PURPOSE_REQUIRED");
  required(input.governanceProfileRef, "GOVERNANCE_PROFILE_REQUIRED");
  required(input.version, "VERSION_REQUIRED");
  if (!D1I_R1_TWIN_SCOPES.includes(input.twinScope)) fail("TARGET_SCOPE_MISMATCH");
  const identity = findIdentity(store.catalog, input.targetKind, assertSelector(input.targetId));
  if (!identity) fail("TARGET_NOT_FOUND");
  if (identity.tenantId !== input.tenantId) fail("CROSS_TENANT_REFERENCE");
  if (identity.workspaceId !== input.workspaceId || identity.projectId !== input.projectId) fail("CROSS_PROJECT_REFERENCE");
  if (identity.lifecycle !== "CURRENT") fail("TARGET_STALE");
  if (input.twinScope === "STRUCTURAL_SYSTEM" && input.targetKind !== "STRUCTURAL_SYSTEM") fail("TARGET_SCOPE_MISMATCH");
  if (input.twinScope === "BOUNDED_STRUCTURAL_ASSET_SCOPE") {
    if (!input.parentStructuralSystemId) fail("BOUNDED_SCOPE_PARENT_REQUIRED");
    if (input.targetKind === "STRUCTURAL_SYSTEM") fail("TARGET_SCOPE_MISMATCH");
    if (identity.structuralSystemId !== input.parentStructuralSystemId) fail("TARGET_SCOPE_MISMATCH");
  }
  const target = identityPin(identity);
  const createdAt = store.now();
  const fingerprint = fingerprintCanonical({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    twinScope: input.twinScope,
    target,
    purpose,
    authority: actor.authority,
    governanceProfileRef: input.governanceProfileRef,
    version: input.version,
  });
  const existing = store.twins.find((row) => row.twinId === twinId);
  if (existing) {
    if (existing.fingerprint !== fingerprint) fail("TWIN_ID_CONFLICT");
    return existing;
  }
  const record: D1iR1TwinRecord = {
    recordKind: "TWIN_IDENTITY",
    twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    twinScope: input.twinScope,
    governedStructuralTargetRef: target,
    purpose,
    authority: actor.authority,
    registrationActorId: actor.actorId,
    governanceProfileRef: input.governanceProfileRef,
    createdAt,
    version: input.version,
    fingerprint,
    status: "RECORDED",
    replacesStructuralIdentity: false,
    copiesUpstreamBodies: false,
  };
  store.twins.push(record);
  remember(store, "TWIN", twinId, "CREATED", input.version, fingerprint, null, "STRUCTURAL_DIGITAL_TWIN_CREATED");
  return record;
}

export function inspectTwin(store: D1iR1Store, twinId: string): D1iR1TwinRecord {
  return store.twins.find((row) => row.twinId === twinId) ?? fail("TWIN_NOT_FOUND");
}

function referenceFingerprint(input: Omit<D1iR1StateReference, "fingerprint" | "provenance"> & { provenanceFingerprint?: string }): string {
  return fingerprintCanonical({
    twinId: input.twinId,
    stateClass: input.stateClass,
    sourceDomain: input.sourceDomain,
    sourceObjectType: input.sourceObjectType,
    sourceObjectId: input.sourceObjectId,
    sourceVersion: input.sourceVersion,
    sourceFingerprint: input.sourceFingerprint,
    structuralTargetRef: input.structuralTargetRef,
    effectiveTime: input.effectiveTime,
    knownAtTime: input.knownAtTime,
    referenceStatus: input.referenceStatus,
    sourceAuthority: input.sourceAuthority,
    registrationAuthority: input.registrationAuthority,
    version: input.version,
  });
}

export function registerStateReference(store: D1iR1Store, actor: D1iR1Actor, input: D1iR1RegisterInput): D1iR1StateReference {
  if (input.knownAtTime !== undefined) fail("KNOWN_AT_BACKDATE_REJECTED");
  const twin = inspectTwin(store, assertSelector(input.twinId));
  assertActor(actor, twin);
  const objectId = assertSelector(input.sourceObjectId);
  const objectType = required(input.sourceObjectType, "SOURCE_OBJECT_TYPE_UNSUPPORTED");
  const resolved = resolveSource(store.catalog, input.sourceDomain, objectType, objectId, twin, store);
  const expectedClass = CLASS_BY_TYPE[`${resolved.sourceDomain}:${resolved.sourceObjectType}`];
  if (!expectedClass || input.stateClass !== expectedClass) fail("STATE_CLASS_SOURCE_MISMATCH");
  if (input.stateClass === "INFERRED_STATE" || input.stateClass === "PREDICTED_STATE") fail("STATE_CLASS_SOURCE_MISMATCH");
  if (input.stateClass === "TELEMETRY_STATE" && resolved.sourceObjectType !== "TELEMETRY_DATA_REFERENCE") fail("STATE_CLASS_SOURCE_MISMATCH");
  if (input.expectedSourceFingerprint !== undefined && input.expectedSourceFingerprint !== resolved.sourceFingerprint) fail("SOURCE_FINGERPRINT_MISMATCH");
  if (input.expectedSourceVersion !== undefined && input.expectedSourceVersion !== resolved.sourceVersion) fail("SOURCE_VERSION_MISMATCH");
  if (input.assertedSourceAuthority !== undefined && input.assertedSourceAuthority !== resolved.sourceAuthority) fail("SOURCE_AUTHORITY_ASSERTION_REJECTED");
  if (input.assertedSourceValidationState !== undefined && input.assertedSourceValidationState !== resolved.sourceValidationState) fail("SOURCE_VALIDATION_ASSERTION_REJECTED");
  assertInTwinScope(twin, resolved.structuralTargetRef);
  const duplicate = store.references.find((row) => row.twinId === twin.twinId && row.stateClass === resolvedSourceClass(input.stateClass) && row.sourceObjectType === resolved.sourceObjectType && row.sourceObjectId === resolved.sourceObjectId && row.sourceVersion === resolved.sourceVersion && row.sourceFingerprint === resolved.sourceFingerprint && row.effectiveTime === resolved.effectiveTime && row.referenceStatus !== "SUPERSEDED_REFERENCE");
  if (duplicate) return duplicate;
  const pinned = store.references.find((row) => row.twinId === twin.twinId && row.sourceObjectType === resolved.sourceObjectType && row.sourceObjectId === resolved.sourceObjectId && row.referenceStatus !== "SUPERSEDED_REFERENCE");
  if (pinned && pinned.sourceFingerprint !== resolved.sourceFingerprint) fail("SOURCE_FINGERPRINT_MISMATCH");
  const knownAtTime = store.now();
  const referenceStatus: D1iR1ReferenceStatus = resolved.historicalContext ? "HISTORICAL_REFERENCE" : "CURRENT_REFERENCE";
  const draft = {
    recordKind: "STATE_REFERENCE" as const,
    stateReferenceId: input.stateReferenceId ? assertSelector(input.stateReferenceId) : `ref-${store.references.length + 1}`,
    twinId: twin.twinId,
    stateClass: expectedClass,
    sourceDomain: resolved.sourceDomain,
    sourceObjectType: resolved.sourceObjectType,
    sourceObjectId: resolved.sourceObjectId,
    sourceVersion: resolved.sourceVersion,
    sourceFingerprint: resolved.sourceFingerprint,
    sourceAuthority: resolved.sourceAuthority,
    sourceValidationState: resolved.sourceValidationState,
    analysisAuthorityClass: resolved.analysisAuthorityClass,
    analysisModelId: resolved.analysisModelId,
    analysisRunId: resolved.analysisRunId,
    structuralTargetRef: resolved.structuralTargetRef,
    effectiveTime: resolved.effectiveTime,
    knownAtTime,
    sourceTimes: resolved.sourceTimes,
    referenceStatus,
    statusMeaning: resolved.historicalContext ? "HISTORICAL_CONTEXT_NOT_PHYSICAL_TRUTH" as const : "ACTIVE_REFERENCE_RECORD_NOT_GOVERNING_STATE" as const,
    governsPhysicalState: false as const,
    limitations: input.limitations,
    registrationAuthority: actor.authority,
    registrationActorId: actor.actorId,
    version: required(input.version, "VERSION_REQUIRED"),
    predecessorId: null,
    copiesSourceBody: false as const,
    independentEvidence: false as const,
  };
  const fingerprint = referenceFingerprint(draft);
  const provenance: D1iR1Provenance = {
    tenantId: twin.tenantId,
    workspaceId: twin.workspaceId,
    projectId: twin.projectId,
    twinId: twin.twinId,
    structuralTargetId: resolved.structuralTargetRef.targetId,
    actorOrSystem: actor.actorId,
    registrationAuthority: actor.authority,
    sourceAuthority: resolved.sourceAuthority,
    sourceDomain: resolved.sourceDomain,
    sourceObjectType: resolved.sourceObjectType,
    sourceObjectId: resolved.sourceObjectId,
    sourceFingerprint: resolved.sourceFingerprint,
    sourceValidationState: resolved.sourceValidationState,
    effectiveTime: resolved.effectiveTime,
    knownAtTime,
    version: draft.version,
    fingerprint,
  };
  const record: D1iR1StateReference = { ...draft, fingerprint, provenance };
  store.references.push(record);
  remember(store, "STATE_REFERENCE", record.stateReferenceId, `REGISTERED:${referenceStatus}`, record.version, record.fingerprint, null, "TWIN_STATE_REFERENCE_REGISTERED");
  return record;
}

function resolvedSourceClass(value: string): D1iR1StateClass {
  return value as D1iR1StateClass;
}

export function inspectStateReference(store: D1iR1Store, stateReferenceId: string): D1iR1StateReference {
  return store.references.find((row) => row.stateReferenceId === stateReferenceId) ?? fail("TWIN_NOT_FOUND");
}

export function supersedeStateReference(store: D1iR1Store, actor: D1iR1Actor, predecessorId: string, input: D1iR1RegisterInput): D1iR1StateReference {
  const prior = inspectStateReference(store, predecessorId);
  const successor = registerStateReference(store, actor, input);
  if (successor.stateReferenceId === prior.stateReferenceId) fail("REFERENCE_REBIND_REJECTED");
  if (successor.sourceObjectId === prior.sourceObjectId && successor.sourceFingerprint === prior.sourceFingerprint && successor.sourceVersion === prior.sourceVersion) {
    fail("REFERENCE_REBIND_REJECTED");
  }
  prior.referenceStatus = "SUPERSEDED_REFERENCE";
  prior.statusMeaning = "NON_GOVERNING_STATUS";
  successor.predecessorId = prior.stateReferenceId;
  remember(store, "STATE_REFERENCE", prior.stateReferenceId, "SUPERSEDED", prior.version, prior.fingerprint, successor.stateReferenceId, "TWIN_STATE_REFERENCE_SUPERSEDED");
  return successor;
}

export function evaluateStateReferenceStatus(store: D1iR1Store, stateReferenceId: string): D1iR1StateReference {
  const reference = inspectStateReference(store, stateReferenceId);
  if (reference.referenceStatus === "SUPERSEDED_REFERENCE") return reference;
  const before = reference.referenceStatus;
  const pinnedFingerprint = reference.sourceFingerprint;
  const pinnedVersion = reference.sourceVersion;
  const pinnedObjectId = reference.sourceObjectId;
  const twin = inspectTwin(store, reference.twinId);
  const targetIdentity = findIdentity(store.catalog, twin.governedStructuralTargetRef.targetKind, twin.governedStructuralTargetRef.targetId);
  let next: D1iR1ReferenceStatus = reference.referenceStatus;
  if (!targetIdentity || targetIdentity.lifecycle === "SUPERSEDED") next = "STALE_REFERENCE";
  try {
    const live = resolveSource(store.catalog, reference.sourceDomain, reference.sourceObjectType, reference.sourceObjectId, twin, store);
    if (live.sourceFingerprint !== pinnedFingerprint) next = "STALE_REFERENCE";
    else if (live.sourceAuthority !== reference.sourceAuthority || live.sourceValidationState !== reference.sourceValidationState) {
      next = live.sourceAuthority === "INVALID" || live.sourceValidationState === "INVALID" || live.sourceAuthority === "WITHDRAWN" ? "INVALID_REFERENCE" : "STALE_REFERENCE";
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "SOURCE_NOT_FOUND") next = "UNRESOLVED_REFERENCE";
    else if (code === "SOURCE_INVALID") next = "INVALID_REFERENCE";
    else if (code === "SOURCE_STALE") next = "STALE_REFERENCE";
    else throw error;
  }
  reference.referenceStatus = next;
  reference.sourceFingerprint = pinnedFingerprint;
  reference.sourceVersion = pinnedVersion;
  reference.sourceObjectId = pinnedObjectId;
  if (next !== before) {
    const event = next === "INVALID_REFERENCE" ? "TWIN_STATE_REFERENCE_INVALIDATED" : "TWIN_STATE_REFERENCE_STALE";
    remember(store, "STATE_REFERENCE", reference.stateReferenceId, next, reference.version, reference.fingerprint, null, event);
  }
  return reference;
}

export function produceTwinReferenceFoundationResult(store: D1iR1Store, twinId: string): D1iR1RuntimeResult {
  const twin = inspectTwin(store, twinId);
  const rows = store.references.filter((row) => row.twinId === twinId);
  const stale = rows.some((row) => row.referenceStatus === "STALE_REFERENCE" || row.referenceStatus === "UNRESOLVED_REFERENCE");
  const invalid = rows.some((row) => row.referenceStatus === "INVALID_REFERENCE");
  const completeness: D1iR1Completeness = rows.length === 0 ? "INCOMPLETE" : invalid ? "INVALID" : stale ? "STALE" : "COMPLETE_FOR_DECLARED_REFERENCE_SCOPE";
  const provenance = rows[0]?.provenance ?? null;
  return {
    resultId: `result-${twinId}`,
    twinId,
    registeredReferenceIds: rows.map((row) => row.stateReferenceId),
    scope: twin.purpose,
    completeness,
    runtimeDiagnostics: [],
    blockingRuntimeDiagnostics: [],
    warnings: [],
    provenance,
    fingerprint: fingerprintCanonical({ twinId, referenceIds: rows.map((row) => row.stateReferenceId).sort(), completeness }),
    healthyStructure: false,
    structuralAdequacy: false,
    completePhysicalTwin: false,
  };
}
