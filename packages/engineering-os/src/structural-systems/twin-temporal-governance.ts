/**
 * EOS-D1I-R2 temporal snapshot and current-selection governance.
 * Uses D1I-R1 references. Does not resolve conflicts or extend effective-time points into intervals.
 */

import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1I_R1_REFERENCE_STATUSES,
  type D1iR1Actor,
  type D1iR1ReferenceStatus,
  type D1iR1StateReference,
  type D1iR1Store,
  inspectStateReference,
  inspectTwin,
} from "./twin-reference-foundation";

export const D1I_R2_MATURITY_STATE = "STRUCTURAL_DIGITAL_TWIN_TEMPORAL_SNAPSHOT_CURRENT_AS_OF_RUNTIME_IMPLEMENTED" as const;
export const D1I_R2_CURRENT_SELECTION_EQUALS_STRUCTURAL_TRUTH = false as const;
export const D1I_R2_SNAPSHOT_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1I_R2_AS_OF_VIEW_AUTO_SELECTS_GOVERNING_TRUTH = false as const;
export const D1I_R2_EFFECTIVE_TIME_POINT_AUTO_IMPLIED_VALID_UNTIL_NEXT = false as const;
export const D1I_R2_LATEST_PRIOR_REFERENCE_AUTO_GOVERNS_AS_OF = false as const;
export const D1I_R2_PRESENT_STATUS_RETROACTIVELY_REWRITES_KNOWN_AT_VIEW = false as const;
export const D1I_R2_REFERENCE_HISTORY_REQUIRED_FOR_KNOWN_AT = true as const;
export const D1I_R2_LATE_DATA_REWRITES_PRIOR_KNOWN_AT = false as const;
export const D1I_R2_SINGLE_UNIVERSAL_CURRENT_STATE = false as const;
export const D1I_R2_CURRENT_SELECTION_SCOPE_REQUIRED = true as const;
export const D1I_R2_SELECTION_USES_R1_STATE_REFERENCE = true as const;
export const D1I_R2_SELECTION_PROMOTES_SOURCE_AUTHORITY = false as const;
export const D1I_R2_SELECTION_PROMOTES_SOURCE_VALIDATION = false as const;
export const D1I_R2_MULTIPLE_ACTIVE_SELECTIONS_SAME_LANE_ALLOWED = false as const;
export const D1I_R2_MULTIPLE_CURRENT_STATE_CLASSES_ALLOWED = true as const;
export const D1I_R2_CURRENT_SELECTION_AUTHORITY_REQUIRED = true as const;
export const AI_CAN_GOVERN_CURRENT_SELECTION = false as const;
export const D1I_R2_CURRENT_SELECTION_EQUALS_VALIDATED_SOURCE = false as const;
export const D1I_R2_CURRENT_SELECTION_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1I_R2_CURRENT_SELECTION_EQUALS_SAFE = false as const;
export const D1I_R2_CURRENT_SELECTION_EQUALS_ADEQUATE = false as const;
export const D1I_R2_SELECTED_AT_RUNTIME_ASSIGNED = true as const;
export const D1I_R2_SELECTED_AT_CALLER_CONTROLLED = false as const;
export const D1I_R2_NEWEST_REFERENCE_AUTO_SELECTED = false as const;
export const D1I_R2_LATEST_EFFECTIVE_TIME_AUTO_SELECTED = false as const;
export const D1I_R2_LATEST_KNOWN_AT_AUTO_SELECTED = false as const;
export const D1I_R2_CURRENT_SELECTION_HISTORY_APPEND_ONLY = true as const;
export const NEW_SELECTION_OVERWRITES_PRIOR_SELECTION = false as const;
export const D1I_R2_CURRENT_SELECTION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R2_SNAPSHOT_DECLARED_SCOPE_REQUIRED = true as const;
export const D1I_R2_UNIVERSAL_REQUIRED_STATE_SET_CREATED = false as const;
export const D1I_R2_COMPLETE_SNAPSHOT_EQUALS_HEALTHY = false as const;
export const D1I_R2_COMPLETE_SNAPSHOT_EQUALS_ADEQUATE = false as const;
export const D1I_R2_INCOMPLETE_SNAPSHOT_EQUALS_DAMAGED = false as const;
export const D1I_R2_SNAPSHOT_COPIES_SOURCE_BODY = false as const;
export const D1I_R2_SNAPSHOT_COPIES_R1_REFERENCE_BODY = false as const;
export const D1I_R2_SNAPSHOT_MUTATED_IN_PLACE = false as const;
export const D1I_R2_HISTORICAL_SNAPSHOT_FLOATS_TO_LATEST_REFERENCE = false as const;
export const D1I_R2_SNAPSHOT_FINGERPRINT_IMPLEMENTED = true as const;
export const D1I_R2_SNAPSHOT_REFERENCE_ORDER_INDEPENDENT = true as const;
export const D1I_R2_SNAPSHOT_CREATION_AUTHORITY_REQUIRED = true as const;
export const AI_CAN_CREATE_GOVERNING_SNAPSHOT = false as const;
export const D1I_R2_CURRENT_SNAPSHOT_USES_SELECTION_RECORDS = true as const;
export const D1I_R2_AS_OF_EFFECTIVE_AUTO_GOVERNS = false as const;
export const D1I_R2_AS_OF_EFFECTIVE_USES_LATEST_PRIOR_AS_GENERIC_VALIDITY = false as const;
export const D1I_R2_POINT_OBSERVATION_AUTO_EXTENDED_TO_PRESENT = false as const;
export const D1I_R2_ANALYSIS_TIMESTAMP_EQUALS_PHYSICAL_EFFECTIVE_TIME = false as const;
export const D1I_R2_FUTURE_KNOWLEDGE_VISIBLE_IN_PRIOR_KNOWN_AT = false as const;
export const D1I_R2_AS_KNOWN_USES_REFERENCE_HISTORY = true as const;
export const D1I_R2_FUTURE_STALENESS_RETROACTIVE = false as const;
export const D1I_R2_FUTURE_SUPERSESSION_RETROACTIVE = false as const;
export const D1I_R2_FUTURE_AUTHORITY_WITHDRAWAL_RETROACTIVE = false as const;
export const D1I_R2_LATE_DATA_REWRITES_HISTORICAL_SNAPSHOT = false as const;
export const D1I_R2_LATE_DATA_REWRITES_PRIOR_KNOWN_AT_VIEW = false as const;
export const D1I_R2_LATE_DATA_CAN_AFFECT_LATER_EFFECTIVE_RECONSTRUCTION = true as const;
export const D1I_R2_TEMPORAL_VIEW_REPRODUCIBLE = true as const;
export const D1I_R2_TEMPORAL_VIEW_AUTO_PERSISTED_AS_SNAPSHOT = false as const;
export const D1I_R2_MULTIPLE_ELIGIBLE_REFERENCES_AUTO_RESOLVED = false as const;
export const D1I_R2_STATE_CONFLICT_RUNTIME_COUNT = 0 as const;
export const D1I_R2_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D1I_R2_RUNTIME_DIAGNOSTIC_EQUALS_STATE_CONFLICT = false as const;
export const D1I_R2_RUNTIME_DIAGNOSTIC_EQUALS_STRUCTURAL_FINDING = false as const;
export const D1I_R2_CURRENT_VIEW_REQUIRES_SELECTION = true as const;
export const D1I_R2_CURRENT_REFERENCE_STATUS_EQUALS_CURRENT_SELECTION = false as const;
export const D1I_R2_CURRENT_VIEW_MULTI_LANE = true as const;
export const D1I_R2_MISSING_SELECTION_AUTO_FILLED = false as const;
export const D1I_R2_STALE_SELECTION_AUTO_REPLACED = false as const;
export const D1I_R2_STALE_SOURCE_REWRITES_SNAPSHOT = false as const;
export const D1I_R2_SNAPSHOT_STATUS_HISTORY_APPEND_ONLY = true as const;
export const D1I_R2_CURRENT_SELECTION_PROVENANCE_COMPLETE = true as const;
export const D1I_R2_SNAPSHOT_PROVENANCE_COMPLETE = true as const;
export const D1I_R2_TEMPORAL_VIEW_PROVENANCE_COMPLETE = true as const;
export const D1I_R2_SELECTION_HISTORY_REPLAY_SUPPORTED = true as const;
export const D1I_R2_SELECTION_SUPERSESSION_RETROACTIVE = false as const;
export const D1I_R2_SNAPSHOT_HISTORY_APPEND_ONLY = true as const;
export const D1I_R2_NEW_SNAPSHOT_DELETES_OLD_SNAPSHOT = false as const;
export const D1I_R2_TIMEZONE_INFERRED_FROM_PROJECT_LOCATION = false as const;
export const D1I_R2_SOURCE_BODY_COPIED = false as const;
export const D1I_R2_SELECTION_MUTATES_R1_REFERENCE = false as const;
export const D1I_R2_SNAPSHOT_MUTATES_R1_REFERENCE = false as const;
export const D1I_R2_TEMPORAL_VIEW_MUTATES_UPSTREAM = false as const;
export const D1I_R2_REAUTHORS_D1H_HISTORY = false as const;
export const D1I_R2_REAUTHORS_ANALYSIS_HISTORY = false as const;
export const D1I_R2_CURRENT_ANALYTICAL_EQUALS_CURRENT_PHYSICAL = false as const;
export const D1I_R2_CURRENT_CONDITION_MUTATES_D1H = false as const;
export const D1I_R2_CURRENT_MEASUREMENT_IMPLIES_CONTINUOUS_PHYSICAL_VALUE = false as const;
export const D1I_R2_CURRENT_OBSERVATION_IMPLIES_CURRENT_PHYSICAL_EXISTENCE = false as const;
export const D1I_R2_SNAPSHOT_AUTHORITY_PROMOTES_SOURCE_AUTHORITY = false as const;
export const D1I_R2_TEMPORAL_VIEW_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1I_R2_ENGINEERING_AGGREGATION_ENGINE_COUNT = 0 as const;
export const D1I_R2_UNIVERSAL_STATE_CLASS_PRIORITY_CREATED = false as const;
export const D1I_R2_UNIVERSAL_SOURCE_DOMAIN_PRIORITY_CREATED = false as const;
export const D1I_R2_AI_CURRENT_SELECTION_AUTHORITY = false as const;
export const D1I_R2_AI_EFFECTIVE_INTERVAL_AUTHORITY = false as const;
export const D1I_R2_AI_RUNTIME_COUNT = 0 as const;
export const D1I_R2_TELEMETRY_RUNTIME_COUNT = 0 as const;
export const D1I_R2_SHM_RUNTIME_COUNT = 0 as const;
export const D1I_R2_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1I_R2_PREDICTION_RUNTIME_COUNT = 0 as const;
export const D1I_R2_DETERIORATION_RUNTIME_COUNT = 0 as const;
export const D1I_R2_CAUSAL_DIAGNOSIS_RUNTIME_COUNT = 0 as const;
export const D1I_R2_MODEL_CALIBRATION_RUNTIME_COUNT = 0 as const;
export const D1I_R2_ANALYSIS_MODEL_MODIFICATION_COUNT = 0 as const;
export const D1I_R2_CAPACITY_ASSESSMENT_RUNTIME_COUNT = 0 as const;
export const D1I_R2_STRUCTURAL_ADEQUACY_RUNTIME_COUNT = 0 as const;
export const D1I_R2_REPAIR_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D1I_R2_REPAIR_DESIGN_RUNTIME_COUNT = 0 as const;
export const D1I_R2_PERSON_TWIN_IMPLEMENTED = false as const;
export const D1I_R2_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1I_R2_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1I_R2_ARBITRARY_TEMPORAL_QUERY_LANGUAGE_CREATED = false as const;
export const D1I_R2_CROSS_PROJECT_SELECTION_ALLOWED = false as const;
export const D1I_R2_CROSS_PROJECT_SNAPSHOT_ALLOWED = false as const;
export const D1I_R2_CROSS_TENANT_SELECTION_ALLOWED = false as const;
export const D1I_R2_CROSS_TENANT_SNAPSHOT_ALLOWED = false as const;
export const D1I_R2_RUNTIME_RESULT_EQUALS_DIGITAL_TWIN_COMPLETE = false as const;
export const D1I_R2_RUNTIME_RESULT_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1I_R2_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1I_R2_EVENT_MUTATES_PRIOR_HISTORY = false as const;
export const D1I_R2_CURRENT_STATE_SELECTION_RUNTIME_COUNT = 1 as const;
export const D1I_R2_SNAPSHOT_RUNTIME_COUNT = 1 as const;
export const D1I_R2_AS_OF_EFFECTIVE_VIEW_RUNTIME_COUNT = 1 as const;
export const D1I_R2_AS_KNOWN_AT_VIEW_RUNTIME_COUNT = 1 as const;
export const D1I_R2_REFERENCE_HISTORY_RECONSTRUCTION_RUNTIME_COUNT = 1 as const;
export const D1I_R2_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1I_R3_HANDOFF_READY = true as const;
export const D1I_R2_CURRENT_SELECTION_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1I_R2_SNAPSHOT_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1I_R2_TEMPORAL_HISTORY_TAMPERING_ALLOWED = false as const;
export const D1I_R2_ARBITRARY_QUERY_EXPRESSION_ALLOWED = false as const;
export const D1I_R2_CROSS_PROJECT_TEMPORAL_OPERATION_ALLOWED = false as const;
export const D1I_R2_CROSS_TENANT_TEMPORAL_OPERATION_ALLOWED = false as const;
export const D1I_R2_DIGITAL_THREAD_REUSED = true as const;
export const PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const PARALLEL_TWIN_IDENTITY_RUNTIME_CREATED = false as const;
export const PARALLEL_STATE_REFERENCE_RUNTIME_CREATED = false as const;

export const D1I_R2_COMPLETENESS_STATES = ["COMPLETE_FOR_DECLARED_SCOPE", "PARTIAL", "INCOMPLETE", "STALE", "INVALID", "UNDETERMINED"] as const;
export const D1I_R2_SNAPSHOT_PURPOSES = ["ENGINEERING_REVIEW_CONTEXT", "HISTORICAL_RECORD", "AS_OF_RECONSTRUCTION", "CURRENT_REFERENCE_SET", "COMPARISON_CONTEXT"] as const;
export const D1I_R2_DIAGNOSTIC_CODES = ["MULTIPLE_ELIGIBLE_REFERENCES", "CURRENT_SELECTION_MISSING", "CURRENT_SELECTION_STALE", "TEMPORAL_APPLICABILITY_UNRESOLVED"] as const;
export const D1I_R2_EVENTS = ["TWIN_CURRENT_STATE_SELECTED", "TWIN_CURRENT_STATE_SELECTION_SUPERSEDED", "TWIN_CURRENT_STATE_SELECTION_INVALIDATED", "TWIN_SNAPSHOT_CREATED", "TWIN_SNAPSHOT_STALE", "TWIN_TEMPORAL_VIEW_EVALUATED"] as const;

export const D1I_R2_CURRENT_SELECTION_CONTRACT = "A selection names selectionId, twin, target, state class, source domain, purpose, exact R1 stateReferenceId, authority, basis, trusted selectedAt, null effectiveFrom, limitations, status, provenance, version, and fingerprint." as const;
export const D1I_R2_CURRENT_SELECTION_LANE_CONTRACT = "A lane is twinId, structural target id, state class, source domain, and purpose. One active selection is allowed in that lane. Other state classes remain independent." as const;
export const D1I_R2_SELECTION_ELIGIBILITY_RULES = "The R1 reference must exist on the same twin, match the lane target, state class, and source domain, and must not be invalid, unresolved, superseded, or stale. Selection does not change source authority or validation." as const;
export const D1I_R2_STALE_REFERENCE_CURRENT_SELECTION_POLICY = "A STALE_REFERENCE cannot be newly selected. No review bypass is provided in R2." as const;
export const D1I_R2_SELECTION_EFFECTIVE_FROM_POLICY = "R2 does not invent retroactive effectiveFrom. selectedAt from the trusted clock is the selection-history time. A caller-supplied effectiveFrom is rejected." as const;
export const D1I_R2_CURRENT_SELECTION_SUPERSESSION_CONTRACT = "Replacing a selection appends a successor and marks the prior selection SUPERSEDED. The prior record stays in history." as const;
export const D1I_R2_SNAPSHOT_CONTRACT = "A snapshot names snapshotId, twin, purpose, declared scope, temporal mode, optional effective query time, known-at cutoff, exact R1 reference ids and fingerprints, selection ids, completeness, limitations, authority, createdAt, provenance, version, and fingerprint. Conflict ids stay empty." as const;
export const D1I_R2_EXPLICIT_SNAPSHOT_POLICY = "An explicit snapshot records caller-selected R1 reference ids after scope and authority checks. It does not become the current selection." as const;
export const D1I_R2_AS_OF_EFFECTIVE_VIEW_CONTRACT = "AS_OF_EFFECTIVE_TIME returns references whose effectiveTime point equals the query time and whose knownAtTime is at or before the recorded knowledge cutoff. It does not choose governing truth." as const;
export const D1I_R2_EFFECTIVE_INTERVAL_POLICY = "An effectiveTime point is not an interval. R2 does not infer valid-until-next. An interval is used only when a governed record already carries one, and R1 references do not." as const;
export const D1I_R2_D1H_CONDITION_EFFECTIVITY_POLICY = "Condition references keep the R1 effective time taken from the D1H inspection context. R2 does not invent a separate condition interval." as const;
export const D1I_R2_AS_KNOWN_AT_VIEW_CONTRACT = "AS_KNOWN_AT_TIME returns references with knownAtTime at or before the query and reconstructs status from R1 history events recorded at or before that time." as const;
export const D1I_R2_PRESENT_KNOWLEDGE_EFFECTIVE_RECONSTRUCTION_CONTRACT = "A later AS_OF_EFFECTIVE_TIME query records its knowledge cutoff. References learned after the effective point can be included when the cutoff is after their knownAtTime. That query is not AS_KNOWN_AT the earlier date." as const;
export const D1I_R2_LATE_DATA_RUNTIME_CONTRACT = "A reference known on 10 June for an effective point on 1 June is absent from AS_KNOWN_AT 5 June. A later AS_OF_EFFECTIVE query for 1 June with a cutoff after 10 June can include it. Prior snapshots and prior known-at views stay unchanged." as const;
export const D1I_R2_EFFECTIVE_QUERY_KNOWLEDGE_CUTOFF_POLICY = "AS_OF_EFFECTIVE_TIME requires a knowledge cutoff. If the caller omits it, the trusted query clock is used and stored on the view." as const;
export const D1I_R2_TEMPORAL_VIEW_CONTRACT = "A temporal view names view id, twin, query mode, declared scope, effective time, known-at cutoff, eligible reference ids, governed selection ids only where a selection applies, completeness, diagnostics, warnings, provenance, and fingerprint." as const;
export const D1I_R2_TEMPORAL_DIAGNOSTIC_TAXONOMY = "MULTIPLE_ELIGIBLE_REFERENCES, CURRENT_SELECTION_MISSING, CURRENT_SELECTION_STALE, TEMPORAL_APPLICABILITY_UNRESOLVED. Diagnostics are not conflict records and not structural findings." as const;
export const D1I_R2_SELECTION_INVALIDATION_CONTRACT = "A selection becomes stale or invalid when its R1 reference is stale, invalid, unresolved, or superseded, when the twin target is stale, or when selection authority is withdrawn. R2 does not switch to another reference." as const;
export const D1I_R2_SNAPSHOT_INVALIDATION_CONTRACT = "Later source staleness marks a snapshot STALE_FOR_CURRENT_USE and appends status history. The stored reference ids and fingerprints stay unchanged." as const;
export const D1I_R2_PROVENANCE_GRAPH_IMPLEMENTED = "Structural target to twin to R1 state reference to current selection to temporal view, and to a snapshot only when snapshot creation is explicit." as const;
export const D1I_R2_REFERENCE_STATUS_AS_KNOWN_CONTRACT = "statusAsKnownAt reads R1 append-only history at or before the cutoff, starting from the REGISTERED status. It does not read the reference status stored today." as const;
export const D1I_R2_SELECTION_AS_KNOWN_CONTRACT = "selectionAsKnownAt returns the lane selection whose selectedAt is at or before the cutoff and whose supersession was not yet recorded." as const;
export const D1I_R2_QUERY_TIME_TRUST_POLICY = "An omitted known-at cutoff uses the trusted query clock and the view records that cutoff. A caller may request an earlier cutoff. The caller cannot rewrite R1 knownAtTime." as const;
export const D1I_R2_CURRENT_SELECTION_IDEMPOTENCY_POLICY = "Repeating the same active lane, reference, and basis returns the existing selection." as const;
export const D1I_R2_SNAPSHOT_IDEMPOTENCY_POLICY = "The same declared scope, mode, cutoff, and exact reference set returns the existing snapshot. A different composition creates a new snapshot and does not delete the old one." as const;
export const D1I_R2_SNAPSHOT_PURPOSE_TAXONOMY = "ENGINEERING_REVIEW_CONTEXT, HISTORICAL_RECORD, AS_OF_RECONSTRUCTION, CURRENT_REFERENCE_SET, COMPARISON_CONTEXT. Purpose does not promote source authority." as const;
export const D1I_R2_RUNTIME_API = "selectCurrentStateReference, inspectCurrentStateSelection, supersedeCurrentStateSelection, evaluateCurrentSelection, createExplicitTwinSnapshot, createCurrentTwinSnapshot, queryAsOfEffectiveTime, queryAsKnownAtTime, inspectTwinSnapshot, evaluateSnapshotStatus, inspectCurrentStateView, statusAsKnownAt, selectionAsKnownAt, produceTwinTemporalRuntimeResult." as const;
export const D1I_R2_RUNTIME_RESULT_CONTRACT = "A temporal result names resultId, twinId, selection ids, snapshot ids, view ids, scope, completeness, diagnostics, warnings, provenance, and fingerprint. It is not a complete twin and not structural adequacy." as const;
export const D1I_R3_REQUIRED_R2_CONTRACTS = "twinIdentity, stateReferenceIdentity, sourceDomain, stateClass, effectiveTime, knownAtTime, referenceHistory, currentSelectionIdentity, currentSelectionLane, selectionHistory, snapshotIdentity, declaredSnapshotScope, temporalViewIdentity, asOfEffective semantics, asKnownAt semantics, completeness, provenance, fingerprints, staleness." as const;
export const D1I_R2_SNAPSHOT_COMPLETENESS_STATES = "COMPLETE_FOR_DECLARED_SCOPE, PARTIAL, INCOMPLETE, STALE, INVALID, UNDETERMINED. Completeness is only against the declared scope." as const;

export type D1iR2Completeness = (typeof D1I_R2_COMPLETENESS_STATES)[number];
export type D1iR2SnapshotPurpose = (typeof D1I_R2_SNAPSHOT_PURPOSES)[number];
export type D1iR2DiagnosticCode = (typeof D1I_R2_DIAGNOSTIC_CODES)[number];

export type D1iR2Lane = {
  twinId: string;
  targetId: string;
  stateClass: string;
  sourceDomain: string;
  purpose: string;
};

export type D1iR2DeclaredScope = {
  targetIds: readonly string[];
  stateClasses: readonly string[];
  sourceDomains: readonly string[];
  purpose: string;
};

export type D1iR2Selection = {
  recordKind: "CURRENT_STATE_SELECTION";
  selectionId: string;
  twinId: string;
  structuralTargetId: string;
  stateClass: string;
  sourceDomain: string;
  purpose: string;
  selectedStateReferenceId: string;
  selectedReferenceFingerprint: string;
  selectionAuthority: string;
  selectionActorId: string;
  selectionBasis: string;
  selectedAt: string;
  effectiveFrom: null;
  limitations: string;
  status: "ACTIVE" | "SUPERSEDED" | "STALE_REVIEW_REQUIRED" | "INVALID";
  supersedesSelectionId: string | null;
  provenanceFingerprint: string;
  version: string;
  fingerprint: string;
  promotesSourceAuthority: false;
  promotesSourceValidation: false;
  engineeringApproval: false;
  safe: false;
  adequate: false;
  validatedSource: false;
  structuralTruth: false;
};

export type D1iR2Snapshot = {
  recordKind: "TWIN_SNAPSHOT";
  snapshotId: string;
  twinId: string;
  snapshotPurpose: D1iR2SnapshotPurpose;
  declaredScope: D1iR2DeclaredScope;
  temporalMode: "EXPLICIT" | "CURRENT_SELECTION";
  effectiveQueryTime: string | null;
  knownAtCutoff: string | null;
  stateReferenceIds: readonly string[];
  stateReferenceFingerprints: readonly string[];
  currentSelectionIds: readonly string[];
  conflictIds: readonly [];
  completeness: D1iR2Completeness;
  limitations: string;
  authority: string;
  createdAt: string;
  version: string;
  fingerprint: string;
  status: "RECORDED" | "STALE_FOR_CURRENT_USE";
  copiesSourceBody: false;
  healthy: false;
  adequate: false;
  damaged: false;
};

export type D1iR2Diagnostic = { kind: "RUNTIME_DIAGNOSTIC"; code: D1iR2DiagnosticCode; structuralFinding: false; stateConflict: false };

export type D1iR2TemporalView = {
  recordKind: "TEMPORAL_STATE_VIEW";
  viewId: string;
  twinId: string;
  queryMode: "AS_OF_EFFECTIVE_TIME" | "AS_KNOWN_AT_TIME" | "CURRENT_SELECTION_VIEW";
  declaredScope: D1iR2DeclaredScope;
  effectiveTime: string | null;
  knownAtCutoff: string;
  eligibleReferenceIds: readonly string[];
  selectedReferenceIds: readonly string[];
  completeness: D1iR2Completeness;
  runtimeDiagnostics: readonly D1iR2Diagnostic[];
  warnings: readonly string[];
  provenanceFingerprint: string;
  fingerprint: string;
  engineeringApproval: false;
  autoGoverned: false;
  pointObservationExtended: false;
  analysisTimestampEqualsPhysicalEffectiveTime: false;
  persistedAsSnapshot: false;
};

export type D1iR2Store = D1iR1Store & {
  selections: D1iR2Selection[];
  snapshots: D1iR2Snapshot[];
  views: D1iR2TemporalView[];
  selectionHistory: Array<{ historyId: string; subjectId: string; action: string; recordedAt: string; predecessorId: string | null }>;
  snapshotStatusHistory: Array<{ historyId: string; snapshotId: string; status: D1iR2Snapshot["status"]; recordedAt: string }>;
  temporalEvents: Array<{ eventId: string; eventType: (typeof D1I_R2_EVENTS)[number]; subjectId: string; recordedAt: string; engineeringApproval: false }>;
  withdrawnSelectionAuthorities: string[];
};

function fail(code: string): never {
  throw new Error(code);
}

function assertActor(actor: D1iR1Actor, twinTenant: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (!actor.actorId || !actor.authority) fail("UNAUTHORIZED");
  if (actor.authority.toUpperCase().startsWith("AI") || actor.authority.toUpperCase().includes("LLM")) fail("UNAUTHORIZED");
  if (actor.tenantId !== twinTenant.tenantId) fail("CROSS_TENANT_REFERENCE");
  if (actor.workspaceId !== twinTenant.workspaceId || actor.projectId !== twinTenant.projectId) fail("CROSS_PROJECT_REFERENCE");
}

function rejectTamper(input: object): void {
  const record = input as { selectedAt?: unknown; knownAtTime?: unknown; history?: unknown; effectiveFrom?: unknown; expression?: unknown; script?: unknown; filter?: unknown };
  if (record.selectedAt !== undefined || record.knownAtTime !== undefined || record.history !== undefined) fail("TEMPORAL_HISTORY_TAMPERING_REJECTED");
  if (record.effectiveFrom !== undefined) fail("EFFECTIVE_FROM_NOT_GOVERNED");
  if (record.expression !== undefined || record.script !== undefined || record.filter !== undefined) fail("ARBITRARY_QUERY_EXPRESSION");
}

function laneKey(lane: D1iR2Lane): string {
  return [lane.twinId, lane.targetId, lane.stateClass, lane.sourceDomain, lane.purpose].join("|");
}

function selectionLane(selection: D1iR2Selection): D1iR2Lane {
  return { twinId: selection.twinId, targetId: selection.structuralTargetId, stateClass: selection.stateClass, sourceDomain: selection.sourceDomain, purpose: selection.purpose };
}

export function createD1iR2Store(store: D1iR1Store): D1iR2Store {
  const temporal = store as D1iR2Store;
  temporal.selections = [];
  temporal.snapshots = [];
  temporal.views = [];
  temporal.selectionHistory = [];
  temporal.snapshotStatusHistory = [];
  temporal.temporalEvents = [];
  temporal.withdrawnSelectionAuthorities = [];
  return temporal;
}

export function statusAsKnownAt(store: D1iR1Store, referenceId: string, knownAt: string): D1iR1ReferenceStatus | null {
  const reference = store.references.find((row) => row.stateReferenceId === referenceId);
  if (!reference || reference.knownAtTime > knownAt) return null;
  let status: D1iR1ReferenceStatus | null = null;
  for (const event of store.history) {
    if (event.subjectKind !== "STATE_REFERENCE" || event.subjectId !== referenceId || event.recordedAt > knownAt) continue;
    if (event.action.startsWith("REGISTERED:")) status = event.action.slice("REGISTERED:".length) as D1iR1ReferenceStatus;
    else if (event.action === "SUPERSEDED") status = "SUPERSEDED_REFERENCE";
    else if ((D1I_R1_REFERENCE_STATUSES as readonly string[]).includes(event.action)) status = event.action as D1iR1ReferenceStatus;
  }
  return status;
}

function eligibleReference(reference: D1iR1StateReference, lane: D1iR2Lane): void {
  if (reference.twinId !== lane.twinId) fail("TARGET_SCOPE_MISMATCH");
  if (reference.structuralTargetRef.targetId !== lane.targetId) fail("TARGET_SCOPE_MISMATCH");
  if (reference.stateClass !== lane.stateClass || reference.sourceDomain !== lane.sourceDomain) fail("STATE_CLASS_SOURCE_MISMATCH");
  if (reference.referenceStatus === "INVALID_REFERENCE" || reference.referenceStatus === "UNRESOLVED_REFERENCE" || reference.referenceStatus === "SUPERSEDED_REFERENCE") {
    fail("REFERENCE_NOT_SELECTABLE");
  }
  if (reference.referenceStatus === "STALE_REFERENCE") fail("STALE_REFERENCE_NOT_SELECTABLE");
}

function selectionFingerprint(selection: Omit<D1iR2Selection, "fingerprint" | "provenanceFingerprint">): string {
  return fingerprintCanonical({
    twinId: selection.twinId,
    targetId: selection.structuralTargetId,
    stateClass: selection.stateClass,
    sourceDomain: selection.sourceDomain,
    purpose: selection.purpose,
    selectedStateReferenceId: selection.selectedStateReferenceId,
    selectedReferenceFingerprint: selection.selectedReferenceFingerprint,
    selectionAuthority: selection.selectionAuthority,
    selectionBasis: selection.selectionBasis,
    selectedAt: selection.selectedAt,
    effectiveFrom: selection.effectiveFrom,
    limitations: selection.limitations,
    version: selection.version,
  });
}

export function selectCurrentStateReference(store: D1iR2Store, actor: D1iR1Actor, input: D1iR2Lane & { stateReferenceId: string; selectionBasis: string; limitations: string; version: string; selectionId?: string }): D1iR2Selection {
  rejectTamper(input);
  const twin = inspectTwin(store, input.twinId);
  assertActor(actor, twin);
  const reference = inspectStateReference(store, input.stateReferenceId);
  const before = JSON.stringify(reference);
  eligibleReference(reference, input);
  const active = store.selections.find((row) => row.status === "ACTIVE" && laneKey(selectionLane(row)) === laneKey(input));
  if (active && active.selectedStateReferenceId === reference.stateReferenceId && active.selectionBasis === input.selectionBasis) return active;
  if (active) fail("MULTIPLE_ACTIVE_SELECTIONS");
  const selectedAt = store.now();
  const draft = {
    recordKind: "CURRENT_STATE_SELECTION" as const,
    selectionId: input.selectionId ?? `sel-${store.selections.length + 1}`,
    twinId: input.twinId,
    structuralTargetId: input.targetId,
    stateClass: input.stateClass,
    sourceDomain: input.sourceDomain,
    purpose: input.purpose,
    selectedStateReferenceId: reference.stateReferenceId,
    selectedReferenceFingerprint: reference.fingerprint,
    selectionAuthority: actor.authority,
    selectionActorId: actor.actorId,
    selectionBasis: input.selectionBasis,
    selectedAt,
    effectiveFrom: null as null,
    limitations: input.limitations,
    status: "ACTIVE" as const,
    supersedesSelectionId: null,
    version: input.version,
    promotesSourceAuthority: false as const,
    promotesSourceValidation: false as const,
    engineeringApproval: false as const,
    safe: false as const,
    adequate: false as const,
    validatedSource: false as const,
    structuralTruth: false as const,
  };
  const fingerprint = selectionFingerprint(draft);
  const selection: D1iR2Selection = { ...draft, provenanceFingerprint: fingerprint, fingerprint };
  store.selections.push(selection);
  store.selectionHistory.push({ historyId: `sh-${store.selectionHistory.length + 1}`, subjectId: selection.selectionId, action: "SELECTED", recordedAt: selectedAt, predecessorId: null });
  store.temporalEvents.push({ eventId: `r2-${store.events.length + 1}`, eventType: "TWIN_CURRENT_STATE_SELECTED", subjectId: selection.selectionId, recordedAt: selectedAt, engineeringApproval: false });
  if (JSON.stringify(reference) !== before) fail("R1_REFERENCE_MUTATED");
  return selection;
}

export function inspectCurrentStateSelection(store: D1iR2Store, selectionId: string): D1iR2Selection {
  return store.selections.find((row) => row.selectionId === selectionId) ?? fail("SELECTION_NOT_FOUND");
}

export function supersedeCurrentStateSelection(store: D1iR2Store, actor: D1iR1Actor, selectionId: string, input: D1iR2Lane & { stateReferenceId: string; selectionBasis: string; limitations: string; version: string; selectionId?: string }): D1iR2Selection {
  const prior = inspectCurrentStateSelection(store, selectionId);
  if (prior.status !== "ACTIVE") fail("SELECTION_NOT_ACTIVE");
  prior.status = "SUPERSEDED";
  const recordedAt = store.now();
  store.selectionHistory.push({ historyId: `sh-${store.selectionHistory.length + 1}`, subjectId: prior.selectionId, action: "SUPERSEDED", recordedAt, predecessorId: null });
  store.temporalEvents.push({ eventId: `r2-${store.events.length + 1}`, eventType: "TWIN_CURRENT_STATE_SELECTION_SUPERSEDED", subjectId: prior.selectionId, recordedAt, engineeringApproval: false });
  const successor = selectCurrentStateReference(store, actor, input);
  successor.supersedesSelectionId = prior.selectionId;
  return successor;
}

export function evaluateCurrentSelection(store: D1iR2Store, selectionId: string): D1iR2Selection {
  const selection = inspectCurrentStateSelection(store, selectionId);
  if (selection.status === "SUPERSEDED") return selection;
  const reference = inspectStateReference(store, selection.selectedStateReferenceId);
  const twin = inspectTwin(store, selection.twinId);
  const target = store.catalog.identities.find((row) => row.id === twin.governedStructuralTargetRef.targetId);
  let next = selection.status;
  if (!target || target.lifecycle === "SUPERSEDED" || reference.referenceStatus === "STALE_REFERENCE") next = "STALE_REVIEW_REQUIRED";
  if (reference.referenceStatus === "INVALID_REFERENCE" || reference.referenceStatus === "UNRESOLVED_REFERENCE" || reference.referenceStatus === "SUPERSEDED_REFERENCE" || store.withdrawnSelectionAuthorities.includes(selection.selectionActorId)) {
    next = "INVALID";
  }
  if (next !== selection.status) {
    selection.status = next;
    const recordedAt = store.now();
    store.selectionHistory.push({ historyId: `sh-${store.selectionHistory.length + 1}`, subjectId: selection.selectionId, action: next, recordedAt, predecessorId: null });
    store.temporalEvents.push({ eventId: `r2-${store.events.length + 1}`, eventType: "TWIN_CURRENT_STATE_SELECTION_INVALIDATED", subjectId: selection.selectionId, recordedAt, engineeringApproval: false });
  }
  return selection;
}

export function withdrawSelectionAuthority(store: D1iR2Store, actorId: string): void {
  store.withdrawnSelectionAuthorities.push(actorId);
  for (const selection of store.selections) {
    if (selection.selectionActorId === actorId && selection.status === "ACTIVE") evaluateCurrentSelection(store, selection.selectionId);
  }
}

export function selectionAsKnownAt(store: D1iR2Store, lane: D1iR2Lane, knownAt: string): D1iR2Selection | null {
  const matches = store.selections.filter((row) => laneKey(selectionLane(row)) === laneKey(lane) && row.selectedAt <= knownAt);
  const active = matches.filter((row) => !store.selectionHistory.some((event) => event.subjectId === row.selectionId && event.action === "SUPERSEDED" && event.recordedAt <= knownAt));
  return active.at(-1) ?? null;
}

function scopeCompleteness(declared: readonly string[], present: readonly string[], stale: boolean): D1iR2Completeness {
  if (declared.length === 0) return "UNDETERMINED";
  const found = declared.filter((stateClass) => present.includes(stateClass));
  if (found.length === 0) return "INCOMPLETE";
  if (found.length < declared.length) return "PARTIAL";
  return stale ? "STALE" : "COMPLETE_FOR_DECLARED_SCOPE";
}

function snapshotFingerprint(snapshot: Omit<D1iR2Snapshot, "fingerprint" | "stateReferenceIds" | "stateReferenceFingerprints"> & { pairs: readonly { id: string; fingerprint: string }[] }): string {
  const pairs = [...snapshot.pairs].sort((left, right) => left.id.localeCompare(right.id));
  return fingerprintCanonical({
    twinId: snapshot.twinId,
    purpose: snapshot.snapshotPurpose,
    scope: snapshot.declaredScope,
    mode: snapshot.temporalMode,
    effectiveQueryTime: snapshot.effectiveQueryTime,
    knownAtCutoff: snapshot.knownAtCutoff,
    pairs,
    selectionIds: [...snapshot.currentSelectionIds].sort(),
    completeness: snapshot.completeness,
    authority: snapshot.authority,
    version: snapshot.version,
  });
}

function buildSnapshot(store: D1iR2Store, actor: D1iR1Actor, input: { snapshotId?: string; twinId: string; snapshotPurpose: D1iR2SnapshotPurpose; declaredScope: D1iR2DeclaredScope; temporalMode: "EXPLICIT" | "CURRENT_SELECTION"; effectiveQueryTime: string | null; knownAtCutoff: string | null; references: D1iR1StateReference[]; selectionIds: string[]; limitations: string; version: string }): D1iR2Snapshot {
  const twin = inspectTwin(store, input.twinId);
  assertActor(actor, twin);
  if (!input.declaredScope.purpose || input.declaredScope.stateClasses.length === 0) fail("SNAPSHOT_SCOPE_REQUIRED");
  const pairs = input.references.map((row) => ({ id: row.stateReferenceId, fingerprint: row.fingerprint }));
  const present = input.references.map((row) => row.stateClass);
  const stale = input.references.some((row) => row.referenceStatus === "STALE_REFERENCE" || row.referenceStatus === "INVALID_REFERENCE");
  const completeness = scopeCompleteness(input.declaredScope.stateClasses, present, stale);
  const createdAt = store.now();
  const draft = {
    recordKind: "TWIN_SNAPSHOT" as const,
    snapshotId: input.snapshotId ?? `snap-${store.snapshots.length + 1}`,
    twinId: input.twinId,
    snapshotPurpose: input.snapshotPurpose,
    declaredScope: input.declaredScope,
    temporalMode: input.temporalMode,
    effectiveQueryTime: input.effectiveQueryTime,
    knownAtCutoff: input.knownAtCutoff,
    currentSelectionIds: Object.freeze([...input.selectionIds]),
    conflictIds: Object.freeze([]) as readonly [],
    completeness,
    limitations: input.limitations,
    authority: actor.authority,
    createdAt,
    version: input.version,
    status: "RECORDED" as const,
    copiesSourceBody: false as const,
    healthy: false as const,
    adequate: false as const,
    damaged: false as const,
    pairs,
  };
  const fingerprint = snapshotFingerprint(draft);
  const existing = store.snapshots.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const sorted = [...pairs].sort((left, right) => left.id.localeCompare(right.id));
  const snapshot: D1iR2Snapshot = {
    ...draft,
    stateReferenceIds: Object.freeze(sorted.map((row) => row.id)),
    stateReferenceFingerprints: Object.freeze(sorted.map((row) => row.fingerprint)),
    fingerprint,
  };
  store.snapshots.push(snapshot);
  store.snapshotStatusHistory.push({ historyId: `ssh-${store.snapshotStatusHistory.length + 1}`, snapshotId: snapshot.snapshotId, status: "RECORDED", recordedAt: createdAt });
  store.temporalEvents.push({ eventId: `r2-${store.events.length + 1}`, eventType: "TWIN_SNAPSHOT_CREATED", subjectId: snapshot.snapshotId, recordedAt: createdAt, engineeringApproval: false });
  return snapshot;
}

export function createExplicitTwinSnapshot(store: D1iR2Store, actor: D1iR1Actor, input: { snapshotId?: string; twinId: string; snapshotPurpose: D1iR2SnapshotPurpose; declaredScope: D1iR2DeclaredScope; stateReferenceIds: readonly string[]; limitations: string; version: string; expression?: unknown }): D1iR2Snapshot {
  rejectTamper(input);
  const references = input.stateReferenceIds.map((id) => inspectStateReference(store, id));
  for (const reference of references) {
    if (reference.twinId !== input.twinId) fail("TARGET_SCOPE_MISMATCH");
    if (!input.declaredScope.stateClasses.includes(reference.stateClass)) fail("TARGET_SCOPE_MISMATCH");
    if (input.declaredScope.sourceDomains.length > 0 && !input.declaredScope.sourceDomains.includes(reference.sourceDomain)) fail("TARGET_SCOPE_MISMATCH");
  }
  return buildSnapshot(store, actor, { ...input, temporalMode: "EXPLICIT", effectiveQueryTime: null, knownAtCutoff: store.now(), references, selectionIds: [] });
}

export function createCurrentTwinSnapshot(store: D1iR2Store, actor: D1iR1Actor, input: { snapshotId?: string; twinId: string; snapshotPurpose: D1iR2SnapshotPurpose; declaredScope: D1iR2DeclaredScope; limitations: string; version: string }): D1iR2Snapshot {
  const selections = store.selections.filter((row) => row.status === "ACTIVE" && row.twinId === input.twinId && row.purpose === input.declaredScope.purpose && input.declaredScope.stateClasses.includes(row.stateClass));
  const references = selections.map((row) => inspectStateReference(store, row.selectedStateReferenceId));
  return buildSnapshot(store, actor, { ...input, temporalMode: "CURRENT_SELECTION", effectiveQueryTime: null, knownAtCutoff: store.now(), references, selectionIds: selections.map((row) => row.selectionId) });
}

export function inspectTwinSnapshot(store: D1iR2Store, snapshotId: string): D1iR2Snapshot {
  return store.snapshots.find((row) => row.snapshotId === snapshotId) ?? fail("SNAPSHOT_NOT_FOUND");
}

export function evaluateSnapshotStatus(store: D1iR2Store, snapshotId: string): D1iR2Snapshot {
  const snapshot = inspectTwinSnapshot(store, snapshotId);
  const ids = [...snapshot.stateReferenceIds];
  const fingerprints = [...snapshot.stateReferenceFingerprints];
  const stale = ids.some((id) => {
    const reference = inspectStateReference(store, id);
    return reference.referenceStatus === "STALE_REFERENCE" || reference.referenceStatus === "INVALID_REFERENCE";
  });
  if (stale && snapshot.status !== "STALE_FOR_CURRENT_USE") {
    snapshot.status = "STALE_FOR_CURRENT_USE";
    const recordedAt = store.now();
    store.snapshotStatusHistory.push({ historyId: `ssh-${store.snapshotStatusHistory.length + 1}`, snapshotId, status: "STALE_FOR_CURRENT_USE", recordedAt });
    store.temporalEvents.push({ eventId: `r2-${store.events.length + 1}`, eventType: "TWIN_SNAPSHOT_STALE", subjectId: snapshotId, recordedAt, engineeringApproval: false });
  }
  if (snapshot.stateReferenceIds.join("|") !== ids.join("|") || snapshot.stateReferenceFingerprints.join("|") !== fingerprints.join("|")) fail("SNAPSHOT_MUTATED");
  return snapshot;
}

function viewFingerprint(view: Omit<D1iR2TemporalView, "fingerprint" | "provenanceFingerprint" | "viewId">): string {
  return fingerprintCanonical({
    twinId: view.twinId,
    queryMode: view.queryMode,
    scope: view.declaredScope,
    effectiveTime: view.effectiveTime,
    knownAtCutoff: view.knownAtCutoff,
    eligibleReferenceIds: [...view.eligibleReferenceIds].sort(),
    selectedReferenceIds: [...view.selectedReferenceIds].sort(),
    completeness: view.completeness,
  });
}

function storeView(store: D1iR2Store, view: Omit<D1iR2TemporalView, "fingerprint" | "provenanceFingerprint" | "viewId"> & { viewId?: string }): D1iR2TemporalView {
  const fingerprint = viewFingerprint(view);
  const recorded: D1iR2TemporalView = { ...view, viewId: view.viewId ?? `view-${store.views.length + 1}`, provenanceFingerprint: fingerprint, fingerprint };
  store.views.push(recorded);
  store.temporalEvents.push({ eventId: `r2-${store.events.length + 1}`, eventType: "TWIN_TEMPORAL_VIEW_EVALUATED", subjectId: recorded.viewId, recordedAt: store.now(), engineeringApproval: false });
  return recorded;
}

export function queryAsOfEffectiveTime(store: D1iR2Store, input: { twinId: string; effectiveTime: string; knownAtCutoff?: string; declaredScope: D1iR2DeclaredScope; expression?: unknown }): D1iR2TemporalView {
  rejectTamper(input);
  const cutoff = input.knownAtCutoff ?? store.now();
  const eligible = store.references.filter((reference) => {
    if (reference.twinId !== input.twinId || reference.knownAtTime > cutoff || reference.effectiveTime !== input.effectiveTime) return false;
    if (!input.declaredScope.stateClasses.includes(reference.stateClass)) return false;
    if (input.declaredScope.sourceDomains.length > 0 && !input.declaredScope.sourceDomains.includes(reference.sourceDomain)) return false;
    if (input.declaredScope.targetIds.length > 0 && !input.declaredScope.targetIds.includes(reference.structuralTargetRef.targetId)) return false;
    const status = statusAsKnownAt(store, reference.stateReferenceId, cutoff);
    return status === "CURRENT_REFERENCE" || status === "HISTORICAL_REFERENCE" || status === "STALE_REFERENCE";
  });
  const diagnostics: D1iR2Diagnostic[] = [];
  if (eligible.length === 0) diagnostics.push({ kind: "RUNTIME_DIAGNOSTIC", code: "TEMPORAL_APPLICABILITY_UNRESOLVED", structuralFinding: false, stateConflict: false });
  if (eligible.length > 1) diagnostics.push({ kind: "RUNTIME_DIAGNOSTIC", code: "MULTIPLE_ELIGIBLE_REFERENCES", structuralFinding: false, stateConflict: false });
  const selected = store.selections.filter((row) => row.status === "ACTIVE" && row.selectedAt <= cutoff && eligible.some((reference) => reference.stateReferenceId === row.selectedStateReferenceId));
  return storeView(store, {
    recordKind: "TEMPORAL_STATE_VIEW",
    twinId: input.twinId,
    queryMode: "AS_OF_EFFECTIVE_TIME",
    declaredScope: input.declaredScope,
    effectiveTime: input.effectiveTime,
    knownAtCutoff: cutoff,
    eligibleReferenceIds: Object.freeze(eligible.map((row) => row.stateReferenceId)),
    selectedReferenceIds: Object.freeze(selected.map((row) => row.selectedStateReferenceId)),
    completeness: eligible.length === 0 ? "INCOMPLETE" : "COMPLETE_FOR_DECLARED_SCOPE",
    runtimeDiagnostics: diagnostics,
    warnings: [],
    engineeringApproval: false,
    autoGoverned: false,
    pointObservationExtended: false,
    analysisTimestampEqualsPhysicalEffectiveTime: false,
    persistedAsSnapshot: false,
  });
}

export function queryAsKnownAtTime(store: D1iR2Store, input: { twinId: string; knownAt: string; declaredScope: D1iR2DeclaredScope }): D1iR2TemporalView {
  rejectTamper(input);
  const eligible = store.references.filter((reference) => {
    if (reference.twinId !== input.twinId || reference.knownAtTime > input.knownAt) return false;
    if (!input.declaredScope.stateClasses.includes(reference.stateClass)) return false;
    const status = statusAsKnownAt(store, reference.stateReferenceId, input.knownAt);
    return status !== null;
  });
  return storeView(store, {
    recordKind: "TEMPORAL_STATE_VIEW",
    twinId: input.twinId,
    queryMode: "AS_KNOWN_AT_TIME",
    declaredScope: input.declaredScope,
    effectiveTime: null,
    knownAtCutoff: input.knownAt,
    eligibleReferenceIds: Object.freeze(eligible.map((row) => row.stateReferenceId)),
    selectedReferenceIds: Object.freeze([]),
    completeness: eligible.length === 0 ? "INCOMPLETE" : "COMPLETE_FOR_DECLARED_SCOPE",
    runtimeDiagnostics: [],
    warnings: [],
    engineeringApproval: false,
    autoGoverned: false,
    pointObservationExtended: false,
    analysisTimestampEqualsPhysicalEffectiveTime: false,
    persistedAsSnapshot: false,
  });
}

export function inspectCurrentStateView(store: D1iR2Store, input: { twinId: string; declaredScope: D1iR2DeclaredScope }): D1iR2TemporalView {
  const selections = store.selections.filter((row) => row.status === "ACTIVE" && row.twinId === input.twinId && row.purpose === input.declaredScope.purpose && input.declaredScope.stateClasses.includes(row.stateClass));
  const diagnostics: D1iR2Diagnostic[] = [];
  for (const stateClass of input.declaredScope.stateClasses) {
    if (!selections.some((row) => row.stateClass === stateClass)) diagnostics.push({ kind: "RUNTIME_DIAGNOSTIC", code: "CURRENT_SELECTION_MISSING", structuralFinding: false, stateConflict: false });
  }
  if (store.references.some((row) => row.referenceStatus === "CURRENT_REFERENCE" && !selections.some((selection) => selection.selectedStateReferenceId === row.stateReferenceId))) {
    diagnostics.push({ kind: "RUNTIME_DIAGNOSTIC", code: "CURRENT_SELECTION_MISSING", structuralFinding: false, stateConflict: false });
  }
  return storeView(store, {
    recordKind: "TEMPORAL_STATE_VIEW",
    twinId: input.twinId,
    queryMode: "CURRENT_SELECTION_VIEW",
    declaredScope: input.declaredScope,
    effectiveTime: null,
    knownAtCutoff: store.now(),
    eligibleReferenceIds: Object.freeze(selections.map((row) => row.selectedStateReferenceId)),
    selectedReferenceIds: Object.freeze(selections.map((row) => row.selectedStateReferenceId)),
    completeness: scopeCompleteness(input.declaredScope.stateClasses, selections.map((row) => row.stateClass), false),
    runtimeDiagnostics: diagnostics,
    warnings: [],
    engineeringApproval: false,
    autoGoverned: false,
    pointObservationExtended: false,
    analysisTimestampEqualsPhysicalEffectiveTime: false,
    persistedAsSnapshot: false,
  });
}

export function produceTwinTemporalRuntimeResult(store: D1iR2Store, twinId: string): { resultId: string; twinId: string; selectionIds: string[]; snapshotIds: string[]; viewIds: string[]; completeness: D1iR2Completeness; runtimeDiagnostics: D1iR2Diagnostic[]; blockingRuntimeDiagnostics: D1iR2Diagnostic[]; warnings: string[]; fingerprint: string; digitalTwinComplete: false; structuralAdequacy: false } {
  const selectionIds = store.selections.filter((row) => row.twinId === twinId).map((row) => row.selectionId);
  const snapshotIds = store.snapshots.filter((row) => row.twinId === twinId).map((row) => row.snapshotId);
  const viewIds = store.views.filter((row) => row.twinId === twinId).map((row) => row.viewId);
  return {
    resultId: `temporal-${twinId}`,
    twinId,
    selectionIds,
    snapshotIds,
    viewIds,
    completeness: selectionIds.length === 0 && snapshotIds.length === 0 ? "INCOMPLETE" : "COMPLETE_FOR_DECLARED_SCOPE",
    runtimeDiagnostics: [],
    blockingRuntimeDiagnostics: [],
    warnings: [],
    fingerprint: fingerprintCanonical({ twinId, selectionIds: [...selectionIds].sort(), snapshotIds: [...snapshotIds].sort(), viewIds: [...viewIds].sort() }),
    digitalTwinComplete: false,
    structuralAdequacy: false,
  };
}
