/**
 * EOS-D1F-R2 provider-neutral analysis result and member action-binding types.
 * A provider result is not a governed result, a design input, or engineering acceptance.
 */

export const EOS_D1F_R2_PHASE = "EOS-D1F-R2-ANALYSIS-RESULT-CONTRACT-MEMBER-ACTION-BINDING" as const;
export const D1F_R2_MATURITY_STATE = "ANALYSIS_RESULT_AND_ACTION_BINDING_RUNTIME_IMPLEMENTED" as const;
export const D1F_R2_ANALYSIS_RESULT_RUNTIME_FOUNDATION_COUNT = 1 as const;
export const D1F_R2_MEMBER_ACTION_BINDING_RUNTIME_COUNT = 1 as const;
export const D1F_R2_STRUCTURAL_ANALYSIS_METHOD_COUNT = 0 as const;
export const D1F_R2_MEMBER_DESIGN_EXECUTION_COUNT = 0 as const;
export const D1F_R2_SYSTEM_ORCHESTRATOR_COUNT = 0 as const;
export const D1F_R2_STEEL_CHECK_RESULT_COUNT = 0 as const;
export const D1F_R2_CONCRETE_CHECK_RESULT_COUNT = 0 as const;
export const D1F_R2_SYSTEM_EVALUATION_ORCHESTRATOR_COUNT = 0 as const;

export const RAW_PROVIDER_RESULT_EQUALS_GOVERNED_RESULT = false as const;
export const GOVERNED_RESULT_EQUALS_DESIGN_INPUT = false as const;
export const DESIGN_INPUT_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const D1F_R2_UNTRACEABLE_RESULT_CAN_GOVERN = false as const;
export const RESPONSE_SPECTRUM_IMPLEMENTED = false as const;
export const NONLINEAR_ANALYSIS_IMPLEMENTED = false as const;
export const D1F_R2_SOURCE_TOPOLOGY_FINGERPRINT_REQUIRED = true as const;
export const ANALYSIS_MODEL_WITHOUT_TOPOLOGY_BINDING_CAN_GOVERN = false as const;
export const D1F_R2_TOPOLOGY_CHANGE_INVALIDATES_ANALYSIS_MODEL = true as const;
export const STALE_ANALYSIS_MODEL_CAN_GOVERN = false as const;
export const D1F_R2_UNVERIFIED_IMPORTED_RESULT_CAN_GOVERN = false as const;
export const D1F_R2_PROVIDER_IDENTITY_REQUIRED = true as const;
export const D1F_R2_PROVIDER_VERSION_REQUIRED = true as const;
export const D1F_R2_SOLVER_NAME_DEFINES_RESULT_SEMANTICS = false as const;
export const D1F_R2_CONVERGED_RUN_EQUALS_VALIDATED_MODEL = false as const;
export const D1F_R2_CONVERGED_RUN_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const D1F_R2_NONCONVERGED_RESULT_CAN_GOVERN = false as const;
export const D1F_R2_PROVIDER_WARNINGS_PRESERVED = true as const;
export const D1F_R2_PROVIDER_WARNINGS_SILENTLY_DROPPED = false as const;
export const D1F_R2_RAW_RESULT_MUTATED_DURING_NORMALIZATION = false as const;
export const AI_RESULT_NORMALIZATION_AUTHORITY = false as const;
export const LLM_RESULT_TRANSFORM_AUTHORITY = false as const;
export const D1F_R2_EXISTING_UNIT_NORMALIZATION_REUSED = true as const;
export const D1F_R2_UNKNOWN_UNIT_CAN_GOVERN = false as const;
export const D1F_R2_DIMENSION_MISMATCH_CAN_GOVERN = false as const;
export const D1F_R2_COORDINATE_TRANSFORM_REQUIRED_WHEN_SYSTEMS_DIFFER = true as const;
export const D1F_R2_COORDINATE_TRANSFORM_GUESSED = false as const;
export const D1F_R2_COORDINATE_TRANSFORM_IMPLEMENTATION_ROUTE =
  "Explicit D1F transform reference and caller-supplied component map. No analysis transform engine is created." as const;
export const PARALLEL_ANALYSIS_TRANSFORM_ENGINE_CREATED = false as const;
export const D1F_R2_PROVIDER_SIGN_ASSUMED = false as const;
export const D1F_R2_SIGN_CONVERSION_TRACEABLE = true as const;
export const D1F_R2_DOUBLE_SIGN_CONVERSION_ALLOWED = false as const;
export const D1F_R2_ACTION_EFFECT_PROVENANCE_COMPLETE = true as const;
export const D1F_R2_STATION_LOCATION_UNAMBIGUOUS = true as const;
export const D1F_R2_MISSING_RESULT_LOCATION_DEFAULTS_TO_MIDSPAN = false as const;
export const D1F_R2_D1C_CASE_COMBINATION_BINDING = true as const;
export const D1F_R2_GENERIC_LOAD_LABEL_CAN_GOVERN = false as const;
export const D1F_R2_RESULT_SET_FINGERPRINT_IMPLEMENTED = true as const;
export const D1F_R2_RESULT_FINGERPRINT_ORDER_INDEPENDENT = true as const;
export const D1F_R2_STALE_RESULT_DETECTION_IMPLEMENTED = true as const;
export const STALE_ANALYSIS_RESULT_CAN_GOVERN = false as const;
export const D1F_R2_PHYSICAL_ANALYTICAL_MAPPING_REUSED = true as const;
export const D1F_R2_ANALYTICAL_DESIGN_MEMBER_MAPPING_REUSED = true as const;
export const D1F_R2_MULTI_ELEMENT_RESULTS_PRESERVED = true as const;
export const D1F_R2_MAX_ABS_AUTOMATICALLY_GOVERNS = false as const;
export const D1F_R2_AUTOMATIC_ENVELOPE_ENGINE_IMPLEMENTED = false as const;
export const D1F_R2_STEEL_ACTION_BINDING_IMPLEMENTED = true as const;
export const D1F_R2_STEEL_DESIGN_EXECUTED = false as const;
export const D1F_R2_STEEL_BINDING_FAILS_CLOSED = true as const;
export const D1F_R2_CONCRETE_ACTION_BINDING_IMPLEMENTED = true as const;
export const D1F_R2_CONCRETE_DESIGN_EXECUTED = false as const;
export const D1F_R2_MISSING_ACTION_COMPONENT_INVENTED_AS_ZERO = false as const;
export const D1F_R2_ABSENT_ACTION_EQUALS_ZERO = false as const;
export const D1F_R2_ACTION_AXIS_MAPPING_EXPLICIT = true as const;
export const AI_AXIS_MAPPING_AUTHORITY = false as const;
export const UI_AXIS_MAPPING_AUTHORITY = false as const;
export const D1F_R2_MEMBER_END_MAPPING_EXPLICIT = true as const;
export const D1F_R2_REVERSED_ELEMENT_MAPPING_EXPLICITLY_TRANSFORMED = true as const;
export const D1F_R2_MANY_TO_ONE_FORCE_AGGREGATION_AUTOMATIC = false as const;
export const D1F_R2_SEGMENT_RESULT_IDENTITY_PRESERVED = true as const;
export const D1F_R2_AI_CAN_PROMOTE_RESULT_AUTHORITY = false as const;
export const D1F_R2_AUTOMATIC_AUTHORITY_PROMOTION = false as const;
export const D1F_R2_MISSING_MODEL_VALIDATION_CAN_SILENTLY_GOVERN = false as const;
export const D1F_R2_BINDING_COMPLETE_EQUALS_DESIGN_PASS = false as const;
export const D1F_R2_BINDING_COMPLETE_EQUALS_SYSTEM_ADEQUACY = false as const;
export const D1F_R2_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1F_R2_EVENT_MODEL_IMPLEMENTED = true as const;
export const D1F_R2_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1F_R2_RAW_RESULTS_HISTORICALLY_PRESERVED = true as const;
export const D1F_R2_NORMALIZED_RESULTS_HISTORICALLY_REPRODUCIBLE = true as const;
export const NEW_ANALYSIS_RUN_OVERWRITES_OLD_RESULTS = false as const;
export const D1F_R2_PROVIDER_NEUTRAL_CORE = true as const;
export const D1F_R2_VENDOR_NAME_DEFINES_TRUST = false as const;
export const D1F_R3_HANDOFF_READY = true as const;
export const CROSS_PROJECT_ANALYSIS_RESULT_BINDING_ALLOWED = false as const;
export const ANALYSIS_RESULT_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;

export const D1F_R2_ANALYSIS_MODEL_STATUS_STATES = [
  "DRAFT",
  "GOVERNED",
  "PENDING_VERIFICATION",
  "STALE",
  "INVALID",
  "SUPERSEDED",
  "ARCHIVED",
] as const;
export type D1fR2AnalysisModelStatus = (typeof D1F_R2_ANALYSIS_MODEL_STATUS_STATES)[number];

export const D1F_R2_ANALYSIS_RUN_STATUS_STATES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "COMPLETED_WITH_WARNINGS",
  "FAILED",
  "NONCONVERGED",
  "STALE",
  "INVALID",
  "SUPERSEDED",
] as const;
export type D1fR2AnalysisRunStatus = (typeof D1F_R2_ANALYSIS_RUN_STATUS_STATES)[number];

export const D1F_R2_BINDING_COMPLETENESS_STATES = [
  "BINDING_COMPLETE_FOR_DECLARED_SCOPE",
  "BINDING_INCOMPLETE",
  "BINDING_INVALID",
  "BINDING_UNDETERMINED",
  "STALE",
] as const;
export type D1fR2BindingCompleteness = (typeof D1F_R2_BINDING_COMPLETENESS_STATES)[number];

export const D1F_R2_GENERIC_LOAD_LABELS = ["ULTIMATE", "SERVICE", "WORST_CASE"] as const;
export const D1F_R2_FORBIDDEN_ENVELOPE_RULES = ["MAX_ABS", "MIN", "ABSOLUTE", "WORST_CASE", "SUM"] as const;

export const D1F_R2_EVENT_TYPES = [
  "ANALYSIS_MODEL_BOUND",
  "ANALYSIS_RUN_RECORDED",
  "RESULT_SET_RECORDED",
  "RESULT_NORMALIZED",
  "RESULT_MARKED_STALE",
  "ACTION_BINDING_CREATED",
  "ACTION_BINDING_INVALIDATED",
] as const;
export type D1fR2EventType = (typeof D1F_R2_EVENT_TYPES)[number];

export const D1F_R2_ANALYSIS_MODEL_RUNTIME_CONTRACT =
  "An analysis model records its id, version, structural system, source topology fingerprint, mapping fingerprint, provider identity and type, model type, unit system, coordinate systems, sign convention, assumptions, source model, fingerprint, authority, provenance, and status." as const;
export const D1F_R2_PROVIDER_AUTHORITY_MODEL =
  "GOVERNED_EXTERNAL_SOLVER, GOVERNED_INTERNAL_DETERMINISTIC_ENGINE, HUMAN_AUTHORED_GOVERNED_ANALYSIS, and IMPORTED_UNVERIFIED_RESULT. A product name does not grant trust." as const;
export const D1F_R2_ANALYSIS_RUN_RUNTIME_CONTRACT =
  "An analysis run records its id, model id and fingerprint, topology fingerprint, provider identity and version, analysis type, input fingerprint, load-case and combination ids, status, convergence, warnings, result-set fingerprint, timestamp, authority, and provenance." as const;
export const D1F_R2_RAW_RESULT_CONTRACT =
  "A raw result preserves the provider value, unit, coordinate system, sign convention, location, case or combination, category, authority, and provenance." as const;
export const D1F_R2_CANONICAL_RESULT_CONTRACT =
  "A canonical result points at its raw result and records the converted value, unit, coordinate system, sign convention, location, normalization chain, and fingerprints." as const;
export const D1F_R2_SIGN_NORMALIZATION_CONTRACT =
  "Provider sign convention maps to the EOS action convention through one explicit recorded factor. The provider name does not select the factor." as const;
export const D1F_R2_RESULT_CATEGORY_TAXONOMY =
  "NODAL_DISPLACEMENT, NODAL_REACTION, MEMBER_FORCE_ACTION_EFFECT, ELEMENT_STRESS_RESULT, SUPPORT_REACTION, MODAL_RESULT, BUCKLING_FACTOR, ANALYSIS_WARNING, ANALYSIS_CONVERGENCE_STATE. Only member action effects can become design inputs." as const;
export const D1F_R2_CANONICAL_MEMBER_ACTION_EFFECT_SET = ["N", "V_MAJOR", "V_MINOR", "M_MAJOR", "M_MINOR", "T"] as const;
export const D1F_R2_RESULT_LOCATION_CONTRACT =
  "MEMBER_START, MEMBER_END, STATION, SECTION, CRITICAL_LOCATION, and GOVERNED_ENVELOPE_LOCATION. A missing location does not become midspan." as const;
export const D1F_R2_RESULT_SET_CONTRACT =
  "A result set records its id, run id, count, raw fingerprint, normalized fingerprint, warnings, status, and provenance." as const;
export const D1F_R2_RESULT_SET_FINGERPRINT_CONTRACT =
  "The fingerprint covers run, model, topology, provider and version, case and combination ids, raw identities, values, units, locations, normalization mappings, transform versions, and sign conventions." as const;
export const D1F_R2_GOVERNED_ENVELOPE_INPUT_CONTRACT =
  "A governed envelope records source results, an explicit selection rule, quantity, location, governing case or combination, governing value, authority, and provenance. The runtime does not calculate it." as const;
export const D1F_R2_DESIGN_INPUT_BINDING_CONTRACT =
  "Canonical action effects bind to existing steel demand slots and concrete section-action slots. The binding does not execute design checks." as const;
export const D1F_R2_RESULT_AUTHORITY_STATE_CONTRACT =
  "VERIFIED_GOVERNED, IMPORTED_PENDING_VERIFICATION, STALE, INVALID, INCOMPLETE, and FAILED_ANALYSIS." as const;
export const D1F_R2_MODEL_VALIDATION_REFERENCE_CONTRACT =
  "Verified result authority requires an explicit model-validation evidence reference. Missing evidence stays pending." as const;
export const D1F_R2_RESULT_WARNING_CONTRACT =
  "Provider, normalization, mapping, staleness, and unsupported-result warnings are retained." as const;
export const D1F_R2_MEMBER_ACTION_BINDING_RESULT_CONTRACT =
  "A binding result records system, model, run, result set, element, physical member, design member, canonical actions, case or combination, location, units, normalization refs, authority, provenance, findings, completeness, and fingerprint." as const;
export const D1F_R3_REQUIRED_R2_CONTRACTS = [
  "analysisModelIdentity",
  "analysisRunIdentity",
  "resultSetIdentity",
  "canonicalNormalizedResults",
  "memberActionBinding",
  "bindingCompleteness",
  "resultAuthority",
  "provenance",
  "fingerprints",
  "invalidation",
] as const;

export type D1fR2RawResult = {
  resultId: string;
  analyticalElementId: string;
  nodeId: string | null;
  supportId: string | null;
  category: string;
  quantity: string;
  value: number | null;
  explicitZero: boolean;
  unit: string | null;
  coordinateSystemRef: string | null;
  signConventionRef: string | null;
  signFactor: 1 | -1 | null;
  signConversionsApplied: number;
  locationKind: string | null;
  stationCoordinate: number | null;
  stationUnit: string | null;
  stationOrigin: string | null;
  stationOrientation: string | null;
  loadCaseId: string | null;
  combinationId: string | null;
  providerMetadata: string | null;
  authority: string;
  provenanceRef: string;
  projectId: string;
};

export type D1fR2TransformRef = {
  transformId: string;
  fromSystem: string;
  toSystem: string;
  methodRef: string;
  version: string;
  componentMap: Readonly<Record<string, string>>;
  authority: string;
  provenanceRef: string;
};

export type D1fR2EnvelopeInput = {
  envelopeId: string;
  sourceResultIds: readonly string[];
  selectionRule: string;
  quantity: string;
  locationKind: string;
  governingCaseId: string;
  governingValue: number;
  authority: string;
  provenanceRef: string;
};

export type D1fR2EvaluationInput = {
  structuralSystemId: string;
  projectId: string;
  tenantId: string;
  workspaceId: string;
  analysisModelId: string;
  analysisModelVersion: string;
  sourceTopologyFingerprint: string;
  mappingFingerprint: string;
  providerId: string;
  providerName: string;
  providerVersion: string;
  providerType: string;
  modelType: string;
  unitSystemRef: string | null;
  globalCoordinateSystemRef: string | null;
  providerCoordinateSystemRef: string | null;
  canonicalCoordinateSystemRef: string | null;
  signConventionRef: string | null;
  assumptionsRef: string | null;
  sourceModelRef: string | null;
  modelStatus: string;
  modelAuthority: string;
  modelValidationEvidenceRef: string | null;
  normalizationRuleVersion: string;
  analysisRunId: string;
  analysisType: string;
  inputFingerprint: string;
  loadCaseIds: readonly string[];
  combinationIds: readonly string[];
  runStatus: string;
  convergenceStatus: string;
  warnings: readonly string[];
  runTimestamp: string;
  runAuthority: string;
  runProvenanceRef: string;
  resultSetId: string;
  rawResults: readonly D1fR2RawResult[];
  transform: D1fR2TransformRef | null;
  axisMapAuthority: "EXPLICIT_GOVERNED" | "AI" | "UI";
  axisMap: Readonly<Record<string, string>>;
  elementDirection: "ALIGNED" | "REVERSED";
  reversal: { endMap: Readonly<Record<string, string>>; explicit: boolean } | null;
  cardinality: "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_ONE";
  physicalMemberId: string | null;
  designMemberId: string | null;
  designTarget: "D1D_STEEL_MEMBER" | "D1E_CONCRETE_MEMBER" | null;
  aggregationRuleRef: string | null;
  declaredQuantities: readonly string[] | null;
  automaticEnvelope: boolean;
  governedEnvelope: D1fR2EnvelopeInput | null;
  currentTopologyFingerprint: string;
  currentMappingFingerprint: string;
  currentNormalizationRuleVersion: string;
  promoteActor: "HUMAN" | "AI" | "AUTOMATIC" | null;
};
