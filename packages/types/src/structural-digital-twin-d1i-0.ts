/**
 * EOS-D1I-0 structural digital twin architecture.
 * Contracts only. No twin runtime, sensor ingestion, calibration, or engineering formula.
 */

export const D1I_CANONICAL_NAME = "STRUCTURAL DIGITAL TWIN" as const;
export const D1I_0_PHASE = "EOS-D1I-0-STRUCTURAL-DIGITAL-TWIN-ARCHITECTURE" as const;
export const D1I_0_MATURITY_STATE = "STRUCTURAL_DIGITAL_TWIN_ARCHITECTURE_DEFINED" as const;
export const D1I_PHASE_AUTHORIZED = true as const;
export const D1I_OWNS_UPSTREAM_ENGINEERING_TRUTH = false as const;
export const D1I_OWNS_TWIN_REFERENCE_COMPOSITION = true as const;
export const D1I_BITEMPORAL_SEMANTICS_REQUIRED = true as const;
export const D1I_EFFECTIVE_TIME_EQUALS_RECORDED_TIME = false as const;
export const D1I_AS_OF_EFFECTIVE_EQUALS_AS_KNOWN_AT = false as const;
export const D1I_FLOATING_SOURCE_REFERENCE_ALLOWED = false as const;
export const D1I_MULTIPLE_STATE_CLASSES_CAN_COEXIST = true as const;
export const D1I_CONFLICT_AUTO_RESOLUTION = false as const;

export const D1I_0_TWIN_RUNTIME_COUNT = 0 as const;
export const D1I_0_STATE_REFERENCE_RUNTIME_COUNT = 0 as const;
export const D1I_0_SNAPSHOT_RUNTIME_COUNT = 0 as const;
export const D1I_0_CURRENT_STATE_SELECTOR_RUNTIME_COUNT = 0 as const;
export const D1I_0_CONFLICT_RUNTIME_COUNT = 0 as const;
export const D1I_0_TELEMETRY_RUNTIME_COUNT = 0 as const;
export const D1I_0_MODEL_CALIBRATION_RUNTIME_COUNT = 0 as const;
export const D1I_0_PREDICTION_RUNTIME_COUNT = 0 as const;
export const D1I_0_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;

export const D1I_TWIN_SCOPES = ["STRUCTURAL_SYSTEM", "BOUNDED_STRUCTURAL_ASSET_SCOPE"] as const;
export type D1iTwinScope = (typeof D1I_TWIN_SCOPES)[number];

export const D1I_SOURCE_DOMAINS = [
  "D1A_DESIGN_OR_REFERENCE",
  "D1F_STRUCTURAL_SYSTEM",
  "D1F_ANALYSIS",
  "D1G_EXTERNAL_ANALYSIS_RESULT",
  "D1H_INSPECTION_CONDITION",
  "FUTURE_TELEMETRY",
  "OTHER_GOVERNED_SOURCE",
] as const;
export type D1iSourceDomain = (typeof D1I_SOURCE_DOMAINS)[number];

export const D1I_STATE_CLASSES = [
  "DESIGN_OR_REFERENCE_STATE",
  "ANALYTICAL_STATE",
  "OBSERVED_STATE",
  "MEASURED_STATE",
  "ENGINEERING_INTERPRETED_STATE",
  "CONDITION_STATE",
  "INFERRED_STATE",
  "PREDICTED_STATE",
  "TELEMETRY_STATE",
] as const;
export type D1iStateClass = (typeof D1I_STATE_CLASSES)[number];

export const D1I_STATE_REFERENCE_STATUSES = [
  "CURRENT_REFERENCE",
  "HISTORICAL_REFERENCE",
  "STALE_REFERENCE",
  "UNRESOLVED_REFERENCE",
  "INVALID_REFERENCE",
  "SUPERSEDED_REFERENCE",
] as const;
export type D1iStateReferenceStatus = (typeof D1I_STATE_REFERENCE_STATUSES)[number];

export const D1I_SNAPSHOT_COMPLETENESS_STATES = [
  "COMPLETE_FOR_DECLARED_SCOPE",
  "PARTIAL",
  "INCOMPLETE",
  "STALE",
  "INVALID",
  "UNDETERMINED",
] as const;
export type D1iSnapshotCompleteness = (typeof D1I_SNAPSHOT_COMPLETENESS_STATES)[number];

export const D1I_CONFLICT_TYPES = [
  "ANALYSIS_VS_MEASUREMENT",
  "ANALYSIS_VS_OBSERVATION",
  "MEASUREMENT_VS_MEASUREMENT",
  "CONDITION_ASSESSMENT_VS_CONDITION_ASSESSMENT",
  "INTERPRETATION_VS_INTERPRETATION",
  "AUTHORITY_CONFLICT",
  "TEMPORAL_CONFLICT",
  "SOURCE_VERSION_CONFLICT",
  "OTHER",
] as const;
export type D1iConflictType = (typeof D1I_CONFLICT_TYPES)[number];

export const D1I_ANALYSIS_AUTHORITY_CLASSES = ["RAW", "NORMALIZED", "GOVERNED"] as const;

export type D1iStructuralTargetRef = {
  targetKind: "STRUCTURAL_SYSTEM" | "MEMBER" | "CONNECTION" | "SUPPORT" | "FOUNDATION";
  targetId: string;
  structuralSystemId: string;
  sourceVersion: string;
  sourceFingerprint: string;
};

export type D1iTwinIdentity = {
  recordKind: "TWIN_IDENTITY";
  twinId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  twinScope: D1iTwinScope;
  governedStructuralTargetRef: D1iStructuralTargetRef;
  purpose: string;
  authority: string;
  governanceProfileRef: string;
  createdAt: string;
  version: string;
  fingerprint: string;
  status: "RECORDED";
  replacesStructuralIdentity: false;
  copiesUpstreamBodies: false;
};

export type D1iStateReference = {
  recordKind: "STATE_REFERENCE";
  stateReferenceId: string;
  twinId: string;
  stateClass: D1iStateClass;
  sourceDomain: D1iSourceDomain;
  sourceObjectType: string;
  sourceObjectId: string;
  sourceVersion: string;
  sourceFingerprint: string;
  sourceAuthority: string;
  sourceValidationState: string;
  structuralTargetRef: D1iStructuralTargetRef;
  effectiveTime: string;
  knownAtTime: string;
  sourceTimes: D1iSourceTimes;
  referenceStatus: D1iStateReferenceStatus;
  limitations: string;
  provenance: D1iProvenance;
  version: string;
  fingerprint: string;
  copiesSourceBody: false;
  floatsToLatest: false;
  promotesSourceAuthority: false;
  promotesValidationState: false;
};

export type D1iSourceTimes = {
  inspectionTime: string | null;
  measurementTime: string | null;
  captureTime: string | null;
  analysisRunTime: string | null;
  conditionEffectiveTime: string | null;
  validationTime: string | null;
  sourceCreationTime: string | null;
};

export type D1iProvenance = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  actorOrSystem: string;
  authority: string;
  effectiveTime: string;
  knownAtTime: string;
  version: string;
  fingerprint: string;
};

export type D1iCurrentStateSelection = {
  recordKind: "CURRENT_STATE_SELECTION";
  selectionId: string;
  twinId: string;
  structuralTargetRef: D1iStructuralTargetRef;
  stateClass: D1iStateClass;
  sourceDomain: D1iSourceDomain | null;
  purpose: string;
  selectedStateReferenceId: string;
  selectionAuthority: string;
  selectionBasis: string;
  selectedAt: string;
  limitations: string;
  version: string;
  fingerprint: string;
  selectedByNewestRecord: false;
  aiGoverned: false;
};

export type D1iTwinSnapshot = {
  recordKind: "TWIN_SNAPSHOT";
  snapshotId: string;
  twinId: string;
  snapshotPurpose: string;
  effectiveTime: string;
  knownAtTime: string;
  stateReferenceIds: readonly string[];
  currentSelectionIds: readonly string[];
  conflictIds: readonly string[];
  completeness: D1iSnapshotCompleteness;
  createdBy: string;
  authority: string;
  provenance: D1iProvenance;
  version: string;
  fingerprint: string;
  copiesSourceBodies: false;
  mutableInPlace: false;
  equalsHealthyStructure: false;
  equalsStructuralAdequacy: false;
};

export type D1iStateConflict = {
  recordKind: "STATE_CONFLICT";
  conflictId: string;
  twinId: string;
  structuralTargetRef: D1iStructuralTargetRef;
  stateReferenceIds: readonly string[];
  conflictType: D1iConflictType;
  conflictStatus: "PRESERVED" | "REVIEW_REQUESTED" | "SUPERSEDED";
  comparisonBasis: string;
  authority: string;
  reviewRefs: readonly string[];
  limitations: string;
  provenance: D1iProvenance;
  version: string;
  fingerprint: string;
  autoResolved: false;
  autoAveraged: false;
  runtimeError: false;
};

export type D1iTelemetrySeam = {
  recordKind: "FUTURE_TELEMETRY_SEAM";
  implemented: false;
  sourceIdentityRequired: true;
  sensorIdentityRequired: true;
  channelIdentityRequired: true;
  samplingTimeRequired: true;
  qualityStateRequired: true;
  rawDistinctFromProcessed: true;
  autoGovernsPhysicalState: false;
};

export const D1I_TWIN_IDENTITY_CONTRACT = "D1iTwinIdentity names a twin, tenant, workspace, project, scope, governed structural target, purpose, authority, profile, created time, version, fingerprint, and recorded status. It does not replace the structural identity." as const;
export const D1I_TWIN_IDENTITY_EQUALS_STRUCTURAL_ASSET_IDENTITY = false as const;
export const D1I_TWIN_REQUIRES_GOVERNED_STRUCTURAL_TARGET = true as const;
export const D1I_ORPHAN_TWIN_ALLOWED = false as const;
export const D1I_TWIN_SCOPE_CONTRACT = "STRUCTURAL_SYSTEM or BOUNDED_STRUCTURAL_ASSET_SCOPE. A component twin does not imply a whole building, facility, or project." as const;
export const D1I_STATE_REFERENCE_CONTRACT = "D1iStateReference is owned by D1I and pins state class, source domain, source object, version, fingerprint, authority, validation, target, effective time, known-at time, source times, status, limitations, provenance, and fingerprint. The source body stays upstream." as const;
export const D1I_SOURCE_DOMAIN_TAXONOMY = "D1A_DESIGN_OR_REFERENCE, D1F_STRUCTURAL_SYSTEM, D1F_ANALYSIS, D1G_EXTERNAL_ANALYSIS_RESULT, D1H_INSPECTION_CONDITION, FUTURE_TELEMETRY, OTHER_GOVERNED_SOURCE." as const;
export const D1I_STATE_CLASS_TAXONOMY = "DESIGN_OR_REFERENCE_STATE, ANALYTICAL_STATE, OBSERVED_STATE, MEASURED_STATE, ENGINEERING_INTERPRETED_STATE, CONDITION_STATE, INFERRED_STATE, PREDICTED_STATE, TELEMETRY_STATE." as const;
export const D1I_STATE_CLASS_EQUALS_SOURCE_DOMAIN = false as const;
export const D1I_STATE_CLASS_EQUALS_AUTHORITY = false as const;
export const MEASURED_STATE_AUTO_GOVERNS = false as const;
export const ANALYTICAL_STATE_AUTO_GOVERNS = false as const;
export const OBSERVED_STATE_AUTO_GOVERNS = false as const;
export const D1I_DESIGN_REFERENCE_STATE_REFERENCES_SOURCE = true as const;
export const D1I_COPIES_DESIGN_REFERENCE_BODY = false as const;
export const D1I_ANALYTICAL_STATE_REFERENCE_REQUIREMENT = "Pin analysis model identity, model version and fingerprint, analysis run and fingerprint, result or result-set, case or combination, location, authority class, and model-validation evidence where the source has it." as const;
export const D1I_ANALYTICAL_STATE_EQUALS_PHYSICAL_STATE = false as const;
export const D1I_SOLVER_RESULT_EQUALS_OBSERVED_STATE = false as const;
export const D1I_OBSERVED_STATE_USES_D1H_REFERENCE = true as const;
export const D1I_MEASURED_STATE_USES_GOVERNED_MEASUREMENT_REFERENCE = true as const;
export const D1I_INTERPRETED_STATE_USES_D1H_REFERENCE = true as const;
export const D1I_CONDITION_STATE_OWNED_BY_D1H = true as const;
export const D1I_REAUTHORS_CONDITION_STATE = false as const;
export const D1I_INFERRED_STATE_ARCHITECTURE = "An inferred state records method identity, inputs, method version, authority, validation, uncertainty where supplied, and fingerprint. No inference engine is implemented." as const;
export const D1I_INFERRED_STATE_EQUALS_MEASURED_STATE = false as const;
export const D1I_PREDICTED_STATE_ARCHITECTURE = "Predicted state is a category for model or forecast references. No forecasting runtime is implemented." as const;
export const D1I_PREDICTION_ENGINE_IMPLEMENTED = false as const;
export const D1I_TELEMETRY_STATE_ARCHITECTURE = "Telemetry state is a future reference seam for source, sensor, channel, sample time, quality, and raw versus processed identity. No sensor runtime is implemented." as const;
export const D1I_TELEMETRY_RUNTIME_IMPLEMENTED = false as const;
export const OBSERVED_STATE_EQUALS_MEASURED_STATE = false as const;
export const OBSERVED_STATE_EQUALS_ANALYTICAL_STATE = false as const;
export const MEASURED_STATE_EQUALS_PREDICTED_STATE = false as const;
export const MEASURED_STATE_EQUALS_INFERRED_STATE = false as const;
export const CONDITION_STATE_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1I_EXACT_SOURCE_REFERENCE_REQUIRED = true as const;
export const D1I_FLOATING_LATEST_CONDITION_REFERENCE_ALLOWED = false as const;
export const D1I_FLOATING_LATEST_ANALYSIS_REFERENCE_ALLOWED = false as const;
export const D1I_FLOATING_LATEST_MEASUREMENT_REFERENCE_ALLOWED = false as const;
export const D1I_STATE_REFERENCE_STATUS_ARCHITECTURE = "CURRENT_REFERENCE, HISTORICAL_REFERENCE, STALE_REFERENCE, UNRESOLVED_REFERENCE, INVALID_REFERENCE, SUPERSEDED_REFERENCE." as const;
export const D1I_BITEMPORAL_TIME_CONTRACT = "Effective time is when the source state applies. Known-at time is when EOS had that reference. An inspection on 1 June entered on 10 June has effective time 1 June and known-at time 10 June." as const;
export const D1I_EFFECTIVE_TIME_FROM_CREATED_AT_ONLY = false as const;
export const D1I_KNOWN_AT_TIME_REQUIREMENT = "Known-at time is the governed time EOS had the reference, not the physical event time." as const;
export const D1I_SOURCE_TIME_PRESERVATION_REQUIREMENT = "Preserve inspection, measurement, capture, analysis-run, condition-effective, validation, and source-creation times when the source supplies them." as const;
export const D1I_AS_OF_EFFECTIVE_VIEW_REQUIREMENT = "An as-of-effective view selects references whose governed validity covers the declared effective time." as const;
export const D1I_AS_KNOWN_AT_VIEW_REQUIREMENT = "An as-known-at view selects references EOS had recorded at the declared known-at time." as const;
export const D1I_LATE_HISTORICAL_ENTRY_REWRITES_PRIOR_KNOWN_AT_VIEW = false as const;
export const D1I_CORRECTION_TEMPORAL_REQUIREMENT = "A corrected source may inform a later effective reconstruction. It does not mutate an already recorded snapshot." as const;
export const D1I_CURRENT_EFFECTIVE_STATE_CONTRACT = "A current selection is scoped by twin, structural target, state class, source domain where applicable, and purpose. Several classes may be current together." as const;
export const D1I_SINGLE_UNIVERSAL_CURRENT_STATE_REQUIRED = false as const;
export const D1I_CURRENT_STATE_SELECTION_AUTHORITY_REQUIRED = true as const;
export const AI_CAN_SELECT_GOVERNING_CURRENT_STATE = false as const;
export const D1I_NEWEST_RECORD_AUTO_CURRENT = false as const;
export const D1I_LATEST_TIMESTAMP_AUTO_CURRENT = false as const;
export const D1I_LATEST_SOLVER_RUN_AUTO_CURRENT = false as const;
export const D1I_CURRENT_STATE_SELECTION_RECORD_REQUIREMENT = "A selection records authority, scope, basis, chosen reference, selected-at time, limitations, version, and fingerprint." as const;
export const D1I_SNAPSHOT_CONTRACT = "D1iTwinSnapshot names the twin, purpose, effective time, known-at time, state-reference ids, selection ids, conflict ids, completeness, authority, provenance, version, and fingerprint." as const;
export const D1I_SNAPSHOT_COPIES_SOURCE_BODIES = false as const;
export const D1I_HISTORICAL_SNAPSHOT_FLOATS_TO_LATEST_SOURCE = false as const;
export const D1I_SNAPSHOT_COMPLETENESS_ARCHITECTURE = "COMPLETE_FOR_DECLARED_SCOPE, PARTIAL, INCOMPLETE, STALE, INVALID, UNDETERMINED. Completeness is relative to the declared snapshot scope." as const;
export const D1I_COMPLETE_SNAPSHOT_EQUALS_HEALTHY_STRUCTURE = false as const;
export const D1I_COMPLETE_SNAPSHOT_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1I_MISSING_STATE_EQUALS_ZERO = false as const;
export const D1I_MISSING_STATE_EQUALS_HEALTHY = false as const;
export const D1I_MISSING_STATE_EQUALS_UNCHANGED = false as const;
export const D1I_STATE_CONFLICT_CONTRACT = "D1iStateConflict names the twin, target, referenced states, conflict type, preserved status, comparison basis, authority, review refs, limitations, provenance, version, and fingerprint." as const;
export const D1I_STATE_CONFLICT_TAXONOMY = "ANALYSIS_VS_MEASUREMENT, ANALYSIS_VS_OBSERVATION, MEASUREMENT_VS_MEASUREMENT, CONDITION_ASSESSMENT_VS_CONDITION_ASSESSMENT, INTERPRETATION_VS_INTERPRETATION, AUTHORITY_CONFLICT, TEMPORAL_CONFLICT, SOURCE_VERSION_CONFLICT, OTHER." as const;
export const D1I_ENGINEERING_CONFLICT_ALWAYS_RUNTIME_ERROR = false as const;
export const D1I_CONFLICT_PRESERVED = true as const;
export const D1I_CONFLICT_AUTO_RESOLVED = false as const;
export const D1I_CONFLICT_AUTO_AVERAGED = false as const;
export const D1I_CONFLICT_RESOLUTION_AUTHORITY_REQUIRED = true as const;
export const D1I_AI_CONFLICT_RESOLUTION_AUTHORITY = false as const;
export const D1I_REFERENCE_PROMOTES_SOURCE_AUTHORITY = false as const;
export const D1I_REFERENCE_PROMOTES_VALIDATION_STATE = false as const;
export const D1I_STALE_SOURCE_CAN_REMAIN_CURRENT_WITHOUT_REVIEW = false as const;
export const D1I_INVALID_SOURCE_CAN_GOVERN = false as const;
export const D1I_D1H_REFERENCE_OWNERSHIP_MATRIX = "D1H owns inspection context, coverage, evidence, finding, measurement, human validation, interpretation, rating scheme, rating, condition state, association, continuity, comparison, change evidence, and analysis link. D1I may reference each and does not own the body." as const;
export const D1I_CAN_MUTATE_D1H_OBJECT = false as const;
export const D1I_CAN_SUPERSEDE_D1H_OBJECT = false as const;
export const D1I_CAN_DELETE_D1H_OBJECT = false as const;
export const D1I_ANALYSIS_REFERENCE_OWNERSHIP_MATRIX = "D1F and D1G own analysis model, analysis run, raw result, normalized result, governed result, case and combination, provider provenance, and model-validation evidence. D1I pins those identities." as const;
export const D1I_ANALYSIS_REFERENCE_FLOATS_TO_NEW_RUN = false as const;
export const D1I_COLLAPSES_ANALYSIS_AUTHORITY_CLASSES = false as const;
export const D1I_FAILED_ANALYSIS_CAN_GOVERN_PHYSICAL_STATE = false as const;
export const D1I_NONCONVERGED_ANALYSIS_CAN_GOVERN_PHYSICAL_STATE = false as const;
export const D1I_PREDICTED_EQUALS_MEASURED = false as const;
export const D1I_PREDICTED_MEASURED_AGREEMENT_EQUALS_MODEL_VALIDATION = false as const;
export const D1I_PREDICTED_MEASURED_DISAGREEMENT_EQUALS_DAMAGE = false as const;
export const D1I_AUTOMATIC_MODEL_CALIBRATION_IMPLEMENTED = false as const;
export const D1I_MEASURED_STATE_AUTO_UPDATES_ANALYSIS_MODEL = false as const;
export const D1I_OBSERVED_STATE_AUTO_UPDATES_ANALYSIS_MODEL = false as const;
export const D1I_CONDITION_STATE_AUTO_UPDATES_ANALYSIS_MODEL = false as const;
export const D1I_INFERRED_STATE_AUTO_UPDATES_ANALYSIS_MODEL = false as const;
export const D1I_STATE_CHANGE_AUTO_TRIGGERS_SOLVER = false as const;
export const D1I_STATE_AUTO_CHANGES_CAPACITY = false as const;
export const D1I_STATE_AUTO_CHANGES_SECTION_PROPERTY = false as const;
export const D1I_STATE_AUTO_CHANGES_MATERIAL_PROPERTY = false as const;
export const D1I_STRUCTURAL_ADEQUACY_RUNTIME_IMPLEMENTED = false as const;
export const D1I_TWIN_STATE_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1I_AUTOMATIC_CONDITION_RATING_ENGINE_IMPLEMENTED = false as const;
export const D1I_CORROSION_RATE_ENGINE_IMPLEMENTED = false as const;
export const D1I_CRACK_GROWTH_ENGINE_IMPLEMENTED = false as const;
export const D1I_FATIGUE_LIFE_ENGINE_IMPLEMENTED = false as const;
export const D1I_REMAINING_LIFE_ENGINE_IMPLEMENTED = false as const;
export const D1I_FUTURE_STATE_PREDICTION_IMPLEMENTED = false as const;
export const D1I_CAUSAL_DIAGNOSIS_IMPLEMENTED = false as const;
export const D1I_REPAIR_RECOMMENDATION_ENGINE_IMPLEMENTED = false as const;
export const D1I_REPAIR_DESIGN_IMPLEMENTED = false as const;
export const D1I_PREDICTIVE_MAINTENANCE_ENGINE_IMPLEMENTED = false as const;
export const D1I_FUTURE_TELEMETRY_SEAM_REQUIREMENT = "A future telemetry reference must name source, sensor or system, channel, sample time, quality, raw versus processed class, provenance, and fingerprint. It does not process a stream." as const;
export const D1I_SENSOR_VALUE_AUTO_GOVERNS_PHYSICAL_STATE = false as const;
export const NEW_D1_SHM_PHASE_CREATED = false as const;
export const D1I_REQUIRES_LIVE_CONNECTIVITY = false as const;
export const D1I_DIGITAL_TWIN_EQUALS_BIM = false as const;
export const D1I_DIGITAL_TWIN_EQUALS_3D_MODEL = false as const;
export const D1I_BIM_AUTHORING_IMPLEMENTED = false as const;
export const D1I_CAD_AUTHORING_IMPLEMENTED = false as const;
export const D1I_3D_RUNTIME_IMPLEMENTED = false as const;
export const D1I_UNIVERSAL_HEALTH_SCORE_CREATED = false as const;
export const D1I_DIGITAL_TWIN_EQUALS_HEALTH_SCORE = false as const;
export const D1I_COMPONENT_STATE_AUTO_DEFINES_SYSTEM_STATE = false as const;
export const D1I_WORST_COMPONENT_AUTO_DEFINES_SYSTEM_STATE = false as const;
export const D1I_AVERAGE_COMPONENT_AUTO_DEFINES_SYSTEM_STATE = false as const;
export const D1I_PROVENANCE_GRAPH_ARCHITECTURE = "Twin to state reference to exact upstream source. Snapshot to exact state references. Conflict to exact conflicting references. Current selection to the chosen reference. Each edge carries authority, time, version, and fingerprint." as const;
export const D1I_PROVENANCE_REQUIREMENTS = "Every D1I-owned record preserves tenant, workspace, project, twin, structural target, actor or system, authority, effective time, known-at time, source refs, version, and fingerprint." as const;
export const D1I_FINGERPRINT_ARCHITECTURE = "Deterministic fingerprints cover twin identity, state reference, current-state selection, snapshot, and state conflict. They hash reference identities, not copied source bodies." as const;
export const D1I_REFERENCE_FINGERPRINT_INCLUDES_SOURCE_FINGERPRINT = true as const;
export const D1I_SNAPSHOT_FINGERPRINT_REQUIREMENT = "A snapshot fingerprint includes the canonical sorted state-reference identities and fingerprints plus the declared effective and known-at context." as const;
export const D1I_CONFLICT_FINGERPRINT_REQUIREMENT = "A conflict fingerprint includes the canonical sorted conflicting state-reference identities and fingerprints, conflict type, and target." as const;
export const D1I_INVALIDATION_ARCHITECTURE = "A reference becomes stale or unresolved when the structural target, source correction, source supersession, source fingerprint, authority, validation, current selection, rating scheme, analysis result, or D1H condition becomes stale. The snapshot body is not rewritten." as const;
export const D1I_INVALIDATION_MUTATES_UPSTREAM_SOURCE = false as const;
export const D1I_STALE_SOURCE_REWRITES_HISTORICAL_SNAPSHOT = false as const;
export const D1I_CURRENT_SNAPSHOT_MUTATED_IN_PLACE = false as const;
export const D1I_HISTORY_ARCHITECTURE = "Append-only history covers twin versions, state-reference changes, current selections, snapshot creation, conflict records, and conflict supersession." as const;
export const D1I_HISTORICAL_REPRODUCIBILITY_REQUIRED = true as const;
export const D1I_LATE_DATA_ARCHITECTURE = "Late inspection, measurement, validation, corrected history, and late analysis results create new references and may inform a later view. They do not rewrite prior snapshots or prior known-at views." as const;
export const D1I_LATE_DATA_REWRITES_PRIOR_SNAPSHOT = false as const;
export const D1I_LATE_DATA_REWRITES_PRIOR_KNOWN_AT_VIEW = false as const;
export const D1I_AS_OF_QUERY_SEMANTICS_EXPLICIT = true as const;
export const D1I_AI_AUTHORITY_BOUNDARY = "AI may summarize state, compare sources, identify conflicts, identify stale references, suggest a current-state candidate, suggest an association, and suggest review priority. AI cannot author a measured state, convert inferred to measured, select governing truth, approve condition, declare adequacy, declare safe or unsafe, change an analysis model, or approve a repair." as const;
export const D1I_PERSON_TWIN_IMPLEMENTED = false as const;
export const D1I_EMPLOYEE_SURVEILLANCE_IMPLEMENTED = false as const;
export const D1I_WORKER_PRODUCTIVITY_SCORING_IMPLEMENTED = false as const;
export const D1I_PERSON_PROFILING_IMPLEMENTED = false as const;
export const D1I_DIGITAL_THREAD_TWIN_BOUNDARY_EXPLICIT = true as const;
export const DIGITAL_THREAD_EQUALS_DIGITAL_TWIN = false as const;
export const D1I_DIGITAL_THREAD_REUSED = true as const;
export const PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1I_D1A_IDENTITY_REUSED = true as const;
export const D1I_D1F_IDENTITY_REUSED = true as const;
export const PARALLEL_TWIN_ASSET_MODEL_CREATED = false as const;
export const D1I_D1H_MATURITY_PROMOTION = false as const;
export const D1I_D1H_ENGINEER_VALIDATION_PROMOTION = false as const;
export const D1I_D1H_CONFORMANCE_PROMOTION = false as const;
export const C10_MATURITY_PROMOTION = false as const;
export const D1F_MATURITY_PROMOTION = false as const;
export const D1G_LIVE_VALIDATION_PROMOTION = false as const;
export const D1I_D1J_SEAM = "D1J Structural Optimization Certification remains unimplemented. A future D1J may reference D1I state and must not be started by this architecture." as const;
export const D1J_STARTED = false as const;
export const D1I_D1K_SEAM = "D1K Cross-Discipline Structural Interfaces remains unimplemented. D1I does not start it." as const;
export const D1K_STARTED = false as const;
export const D1I_ABSORBS_D1M_CAD_BIM = false as const;
export const D1I_ABSORBS_D1N_CONCEPT_ORCHESTRATION = false as const;
export const D2_STARTED_BY_D1I_0 = false as const;
export const D3_STARTED_BY_D1I_0 = false as const;
export const D1_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1I_CROSS_PROJECT_REFERENCE_ALLOWED = false as const;
export const D1I_CROSS_TENANT_REFERENCE_ALLOWED = false as const;
export const D1I_AI_GOVERNING_STATE_AUTHORITY_CREATED = false as const;
export const DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1I_PARALLEL_CAPABILITY_MANIFEST_CREATED = false as const;
export const D1I_0_ARCHITECTURE_CONTRACT_FILES = "packages/types/src/structural-digital-twin-d1i-0.ts; docs/architecture/engineering-os/EOS_D1I_0_STRUCTURAL_DIGITAL_TWIN_ARCHITECTURE.md" as const;
export const D1I_EXISTING_DIGITAL_THREAD_FOUNDATION_INVENTORY = "Existing digital thread in packages/engineering-os/src/digital-thread covers traces, relations, traversal, projection identity, and explanation. Provenance and fingerprintCanonical already serve D1H and analysis records. D1I reuses those conventions by reference." as const;
export const D1I_0_OWNERSHIP_MATRIX = "D1A/D1F own structural identity. D1F/D1G own analysis model, run, and result. D1H owns evidence, finding, measurement, rating, and condition state. D1I owns twin identity, state reference, current selection, snapshot, and conflict record. Future telemetry source identity remains a seam." as const;
export const D1I_0_STATE_CLASS_MATRIX = "Design/reference from D1A, reference nature, does not auto-govern. Analytical from D1F/D1G, predicted or analytical nature, does not auto-govern. Observed and measured and interpreted and condition from D1H, do not auto-govern. Inferred and predicted are explicit categories without engines and do not auto-govern. Telemetry is a future seam and does not auto-govern." as const;
export const D1I_0_TEMPORAL_SEMANTICS_MATRIX = "Effective time is validity. Known-at time is EOS knowledge. Capture, inspection, measurement, analysis, and validation times stay source-specific. Recorded time is not effective time. Snapshot time is the time the snapshot reference set was recorded." as const;
export const D1I_0_CONFLICT_MATRIX = "Analysis versus measurement, analysis versus observation, measurement versus measurement, condition versus condition, interpretation versus interpretation, authority conflict, and temporal conflict are preserved and are not auto-resolved." as const;
export const D1I_0_INVALIDATION_MATRIX = "Target stale, source corrected, source superseded, fingerprint mismatch, authority withdrawn, validation withdrawn, selection superseded, rating scheme changed, analysis result stale, and D1H condition stale mark references. Historical snapshots stay reproducible." as const;
export const D1I_0_AUTHORITY_MATRIX = "Creating a twin, registering a reference, selecting a current reference, creating a snapshot, and confirming a conflict resolution require human or otherwise governed authority. AI actions stay advisory." as const;
export const D1I_CANONICAL_PHASE_SEQUENCE = "EOS-D1I-0-STRUCTURAL-DIGITAL-TWIN-ARCHITECTURE; EOS-D1I-R1-TWIN-IDENTITY-STATE-REFERENCE-FOUNDATION; EOS-D1I-R2-TEMPORAL-SNAPSHOT-CURRENT-AS-OF-STATE-GOVERNANCE; EOS-D1I-R3-STATE-CONFLICT-MULTI-SOURCE-COMPOSITION; EOS-D1I-R4-EXTERNAL-TELEMETRY-MONITORING-REFERENCE-INTERFACE; EOS-D1I-R5-STRUCTURAL-DIGITAL-TWIN-CLOSEOUT." as const;
export const D1I_R1_HANDOFF_READY = true as const;
export const D1I_R1_CANONICAL_PHASE = "EOS-D1I-R1-TWIN-IDENTITY-STATE-REFERENCE-FOUNDATION" as const;
export const D1I_R1_CANONICAL_SCOPE = "Implement bounded twin identity, governed structural-target binding, exact upstream state references, state-class and source-domain metadata, authority, provenance, fingerprints, staleness, and history, without snapshots, current-state orchestration, conflict resolution, telemetry runtime, or engineering inference." as const;
export const D1I_SHM_RUNTIME_IMPLEMENTED = false as const;
