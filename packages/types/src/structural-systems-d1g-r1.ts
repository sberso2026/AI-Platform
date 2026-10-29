/**
 * EOS-D1G-R1 provider-neutral solver adapter contracts.
 * The adapter translates explicit provider data into D1F raw results.
 * It does not solve, design, or approve.
 */

export const EOS_D1G_R1_PHASE = "EOS-D1G-R1-PROVIDER-NEUTRAL-SOLVER-ADAPTER-FOUNDATION" as const;
export const D1G_R1_MATURITY_STATE = "PROVIDER_NEUTRAL_SOLVER_ADAPTER_FOUNDATION_IMPLEMENTED" as const;
export const PROVIDER_NEUTRAL_ADAPTER_RUNTIME_COUNT = 1 as const;
export const FIXTURE_PROVIDER_COUNT = 1 as const;
export const COMMERCIAL_PROVIDER_CONNECTOR_COUNT = 0 as const;
export const STRUCTURAL_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1G_R1_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;

export const SOLVER_ADAPTER_EQUALS_STRUCTURAL_SOLVER = false as const;
export const SOLVER_ADAPTER_EQUALS_ENGINEERING_APPROVAL = false as const;
export const SOLVER_ADAPTER_EQUALS_MODEL_VALIDATION = false as const;
export const SOLVER_ADAPTER_EQUALS_RESULT_AUTHORITY = false as const;
export const PROVIDER_BRAND_EQUALS_TRUST = false as const;
export const D1G_R1_ADAPTER_CAN_BYPASS_D1F_NORMALIZATION = false as const;
export const D1G_R1_ADAPTER_CAN_BYPASS_D1F_RESULT_AUTHORITY = false as const;
export const D1G_R1_ADAPTER_CAN_CREATE_DESIGN_INPUT_DIRECTLY = false as const;
export const D1F_R1_TOPOLOGY_REUSED = true as const;
export const D1F_R2_ANALYSIS_MODEL_CONTRACT_REUSED = true as const;
export const D1F_R2_ANALYSIS_RUN_CONTRACT_REUSED = true as const;
export const D1F_R2_RAW_RESULT_CONTRACT_REUSED = true as const;
export const D1F_R2_NORMALIZED_RESULT_CONTRACT_REUSED = true as const;
export const D1F_R2_RESULT_AUTHORITY_REUSED = true as const;
export const D1F_R2_RESULT_FINGERPRINT_REUSED = true as const;
export const D1F_R2_ACTION_BINDING_REUSED = true as const;
export const PARALLEL_ANALYSIS_DOMAIN_CREATED = false as const;
export const PARALLEL_RESULT_AUTHORITY_MODEL_CREATED = false as const;
export const PARALLEL_NORMALIZATION_ENGINE_CREATED = false as const;

export const D1G_R1_ADAPTER_TYPES = [
  "FIXTURE_PROVIDER",
  "FILE_BASED_PROVIDER",
  "API_PROVIDER",
  "SDK_PROVIDER",
  "COMMAND_LINE_PROVIDER",
  "OTHER",
] as const;
export type D1gR1AdapterType = (typeof D1G_R1_ADAPTER_TYPES)[number];
export const D1G_R1_ADAPTER_TYPE_TAXONOMY =
  "FIXTURE_PROVIDER, FILE_BASED_PROVIDER, API_PROVIDER, SDK_PROVIDER, COMMAND_LINE_PROVIDER, and OTHER. R1 implements only the fixture provider." as const;

export const D1G_R1_ADAPTER_CAPABILITIES = [
  "MODEL_METADATA",
  "NODES",
  "ANALYTICAL_ELEMENTS",
  "LOAD_CASES",
  "LOAD_COMBINATIONS",
  "MEMBER_END_FORCES",
  "MEMBER_STATION_FORCES",
  "SUPPORT_REACTIONS",
  "NODE_DISPLACEMENTS",
  "WARNINGS",
  "CONVERGENCE_STATUS",
  "MODAL_RESULTS",
  "BUCKLING_RESULTS",
  "OTHER",
] as const;
export type D1gR1AdapterCapability = (typeof D1G_R1_ADAPTER_CAPABILITIES)[number];

export const D1G_R1_COMPLETENESS_STATES = [
  "COMPLETE_FOR_DECLARED_ADAPTER_SCOPE",
  "PARTIAL",
  "INCOMPLETE",
  "INVALID",
  "UNSUPPORTED",
  "STALE",
] as const;
export type D1gR1Completeness = (typeof D1G_R1_COMPLETENESS_STATES)[number];

export const D1G_R1_ADAPTER_IDENTITY_CONTRACT =
  "An adapter records adapterId, adapterVersion, adapterSchemaVersion, providerId, supportedProviderVersions, adapterType, capabilityManifestRef, mappingManifestRef, status, authority, provenance, and fingerprint." as const;
export const D1G_R1_ADAPTER_CAPABILITY_MANIFEST_CONTRACT =
  "Capabilities are an explicit declared list. MODEL_METADATA, NODES, ANALYTICAL_ELEMENTS, LOAD_CASES, LOAD_COMBINATIONS, MEMBER_END_FORCES, MEMBER_STATION_FORCES, SUPPORT_REACTIONS, NODE_DISPLACEMENTS, WARNINGS, CONVERGENCE_STATUS, MODAL_RESULTS, BUCKLING_RESULTS, and OTHER. Absence is not support." as const;
export const D1G_R1_SOURCE_PAYLOAD_IDENTITY_CONTRACT =
  "A source payload records sourcePayloadId, providerId, sourceType, sourceName, sourceVersion, sourceTimestamp, sourceFingerprint, ingestion identity, adapterId, adapterVersion, authority, and provenance." as const;
export const D1G_R1_PROVIDER_MODEL_METADATA_CONTRACT =
  "Provider model metadata may record provider model id, revision, source ref, analysis type, unit metadata, coordinate metadata, provider object ids, and warnings. It does not become governed topology." as const;
export const D1G_R1_PROVIDER_OBJECT_MAPPING_CONTRACT =
  "Each provider object id is scoped to its provider model and maps explicitly to analyticalElementId, nodeId, supportId, physicalMemberId, and designMemberId where those governed ids exist." as const;
export const D1G_R1_PROVIDER_RUN_EXTRACTION_CONTRACT =
  "Run extraction records provider run id, model identity, provider version, analysis type, explicit run state, explicit convergence state, warnings, cases, combinations, timestamp, and source fingerprint." as const;
export const D1G_R1_WARNING_MAPPING_CONTRACT =
  "Warnings keep original provider id, code, and text. A transport category may be attached. Unknown warnings stay attached. Transport category is not a governing severity." as const;
export const D1G_R1_LOAD_CASE_MAPPING_CONTRACT =
  "A provider load-case id maps to a D1C case id only through an explicit manifest entry." as const;
export const D1G_R1_LOAD_COMBINATION_MAPPING_CONTRACT =
  "A provider combination id maps to a D1C combination id only through an explicit manifest entry." as const;
export const D1G_R1_PROVIDER_RESULT_EXTRACTION_CONTRACT =
  "A provider result records providerResultId, providerObjectId, result category, provider quantity name, raw value, raw unit, provider coordinate system, provider sign convention, location, case or combination, run, source payload, warnings, and provenance." as const;
export const D1G_R1_RESULT_CATEGORY_MAPPING_CONTRACT =
  "Provider categories map explicitly to MEMBER_FORCE_ACTION_EFFECT, SUPPORT_REACTION, NODAL_DISPLACEMENT, ANALYSIS_WARNING, and ANALYSIS_CONVERGENCE_STATE where the fixture declares them." as const;
export const D1G_R1_QUANTITY_MAPPING_CONTRACT =
  "Provider quantity names map to N, V_MAJOR, V_MINOR, M_MAJOR, M_MINOR, or T only through the mapping manifest. The quantity name is not the semantic." as const;
export const D1G_R1_MEMBER_END_MAPPING_CONTRACT =
  "Provider ends I, J, START, END, END1, END2, LOCAL-I, and LOCAL-J map only through explicit manifest entries." as const;
export const D1G_R1_PARTIAL_RESULT_SET_CONTRACT =
  "A source may contain member forces without reactions, unmapped objects, unavailable cases, or unsupported categories. Missing required scope stays partial and is retained." as const;
export const D1G_R1_ADAPTER_RESULT_COMPLETENESS_STATES =
  "COMPLETE_FOR_DECLARED_ADAPTER_SCOPE, PARTIAL, INCOMPLETE, INVALID, UNSUPPORTED, and STALE." as const;
export const D1G_R1_MAPPING_MANIFEST_CONTRACT =
  "The mapping manifest versions explicit maps for units allowance, axes, signs, quantity names, result categories, member ends, locations, case ids, combination ids, and run states." as const;
export const D1G_R1_D1F_RAW_HANDOFF_CONTRACT =
  "Adapter output is a D1F-R2 evaluation input. D1F normalizes units, signs, coordinates, authority, fingerprints, and staleness." as const;
export const D1G_R1_ADAPTER_EXECUTION_FINGERPRINT_CONTRACT =
  "The execution fingerprint covers adapter version, provider version, source fingerprint, mapping-manifest fingerprint, object-mapping fingerprint, and declared scope." as const;
export const D1G_R1_PROVIDER_INPUT_RESOURCE_LIMIT_CONTRACT =
  "Caller-bounded limits cover payload bytes, result count, nesting depth, and identifier length. Parsing stops at the bound." as const;
export const D1G_R1_CAPABILITY_NEGOTIATION_CONTRACT =
  "Negotiation returns the declared capability list. The provider name adds none." as const;
export type D1gR1ResourceLimits = {
  maxPayloadBytes: number;
  maxResultCount: number;
  maxNestingDepth: number;
  maxIdentifierLength: number;
};

export const D1G_R1_DEFAULT_RESOURCE_LIMITS: D1gR1ResourceLimits = {
  maxPayloadBytes: 262144,
  maxResultCount: 64,
  maxNestingDepth: 8,
  maxIdentifierLength: 128,
};

export const D1G_R1_PROVIDER_IDENTITY_REQUIRED = true as const;
export const D1G_R1_PROVIDER_VERSION_REQUIRED = true as const;
export const D1G_R1_PROVIDER_NAME_DEFINES_UNITS = false as const;
export const D1G_R1_PROVIDER_NAME_DEFINES_AXES = false as const;
export const D1G_R1_PROVIDER_NAME_DEFINES_SIGN_CONVENTION = false as const;
export const D1G_R1_PROVIDER_NAME_DEFINES_RESULT_SEMANTICS = false as const;
export const D1G_R1_UNSUPPORTED_CAPABILITY_SILENTLY_ASSUMED = false as const;
export const D1G_R1_UNSUPPORTED_CAPABILITY_INVENTED = false as const;
export const D1G_R1_RAW_SOURCE_PRESERVED = true as const;
export const D1G_R1_RAW_SOURCE_MUTATED_DURING_MAPPING = false as const;
export const D1G_R1_SOURCE_FINGERPRINT_IMPLEMENTED = true as const;
export const RAW_PROVIDER_DATA_EQUALS_NORMALIZED_D1F_DATA = false as const;
export const D1G_R1_PROVIDER_MODEL_TO_D1F_MODEL_MAPPING_REQUIRED = true as const;
export const D1G_R1_PROVIDER_MODEL_AUTOMATICALLY_CREATES_GOVERNED_TOPOLOGY = false as const;
export const D1G_R1_SOLVER_MODEL_TOPOLOGY_AUTOMATICALLY_GOVERNS = false as const;
export const D1G_R1_PROVIDER_OBJECT_MAPPING_AUTHORITY_REQUIRED = true as const;
export const AI_PROVIDER_OBJECT_MAPPING_CAN_GOVERN = false as const;
export const D1G_R1_UNKNOWN_PROVIDER_OBJECT_CAN_SILENTLY_DROP = false as const;
export const D1G_R1_RUN_STATE_MAPPING_EXPLICIT = true as const;
export const D1G_R1_UNKNOWN_RUN_STATE_CAN_GOVERN = false as const;
export const D1G_R1_PROVIDER_SUCCESS_FLAG_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const D1G_R1_PROVIDER_COMPLETED_EQUALS_CONVERGED = false as const;
export const D1G_R1_PROVIDER_WARNINGS_PRESERVED = true as const;
export const D1G_R1_UNKNOWN_WARNING_SILENTLY_DROPPED = false as const;
export const D1G_R1_GENERIC_ULTIMATE_LABEL_CAN_GOVERN = false as const;
export const D1G_R1_GENERIC_SERVICE_LABEL_CAN_GOVERN = false as const;
export const D1G_R1_UNKNOWN_CASE_COMBINATION_CAN_GOVERN = false as const;
export const D1G_R1_UNKNOWN_RESULT_CATEGORY_CAN_GOVERN = false as const;
export const D1G_R1_QUANTITY_NAME_ALONE_DEFINES_SEMANTICS = false as const;
export const D1G_R1_PROVIDER_UNIT_REQUIRED = true as const;
export const UNITLESS_PROVIDER_RESULT_CAN_GOVERN = false as const;
export const D1G_R1_D1F_UNIT_NORMALIZATION_REUSED = true as const;
export const D1G_R1_ADAPTER_HAS_PARALLEL_UNIT_ENGINE = false as const;
export const D1G_R1_PROVIDER_COORDINATE_SYSTEM_REQUIRED = true as const;
export const D1G_R1_D1F_COORDINATE_NORMALIZATION_REUSED = true as const;
export const D1G_R1_ADAPTER_PARALLEL_TRANSFORM_ENGINE = false as const;
export const D1G_R1_PROVIDER_SIGN_CONVENTION_REQUIRED = true as const;
export const D1G_R1_SIGN_INFERRED_FROM_PROVIDER_BRAND = false as const;
export const D1G_R1_PROVIDER_MEMBER_END_GUESSED = false as const;
export const D1G_R1_REVERSED_ELEMENT_DIRECTION_SILENTLY_SWAPPED = false as const;
export const D1G_R1_RESULT_LOCATION_REQUIRED = true as const;
export const D1G_R1_STATION_SEMANTICS_EXPLICIT = true as const;
export const D1G_R1_SUPPORT_REACTION_EXTRACTION_IMPLEMENTED = true as const;
export const D1G_R1_MEMBER_FORCE_EXTRACTION_IMPLEMENTED = true as const;
export const D1G_R1_MEMBER_FORCE_CALCULATED = false as const;
export const D1G_R1_SUPPORT_REACTION_CALCULATED = false as const;
export const D1G_R1_DISPLACEMENT_CALCULATED = false as const;
export const D1G_R1_ABSENT_PROVIDER_VALUE_EQUALS_ZERO = false as const;
export const D1G_R1_MISSING_COMPONENT_INVENTED_AS_ZERO = false as const;
export const D1G_R1_EXPLICIT_ZERO_PRESERVED = true as const;
export const D1G_R1_PARTIAL_RESULT_SET_CAN_IMPLY_COMPLETE = false as const;
export const D1G_R1_MAPPING_MANIFEST_VERSIONED = true as const;
export const D1G_R1_UNKNOWN_PROVIDER_SEMANTIC_CAN_AUTO_MAP = false as const;
export const D1G_R1_ADAPTER_INGESTION_AUTO_PROMOTES_VERIFIED_GOVERNED = false as const;
export const D1G_R1_FIXTURE_PROVIDER_IMPLEMENTED = true as const;
export const D1G_R1_FIXTURE_PROVIDER_STRUCTURAL_SOLVER = false as const;
export const D1G_R1_FIXTURE_RESULTS_COMPUTED_FROM_STRUCTURE = false as const;
export const D1G_R1_DUPLICATE_PROVIDER_RESULT_DETECTED = true as const;
export const D1G_R1_PROVIDER_OBJECT_ID_GLOBAL_UNIQUENESS_ASSUMED = false as const;
export const D1G_R1_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1G_R1_HISTORICAL_ADAPTER_EXECUTION_REPRODUCIBLE = true as const;
export const NEW_ADAPTER_RUN_OVERWRITES_OLD_RESULT = false as const;
export const D1G_R1_ORIGINAL_SOURCE_REFERENCE_PRESERVED = true as const;
export const D1G_R1_EXTERNAL_NETWORK_CALL_IMPLEMENTED = false as const;
export const D1G_R1_VENDOR_API_IMPLEMENTED = false as const;
export const D1G_R1_VENDOR_SDK_IMPLEMENTED = false as const;
export const D1G_R1_VENDOR_CLI_EXECUTION_IMPLEMENTED = false as const;
export const D1G_R1_COMMERCIAL_SOLVER_INTEGRATED = false as const;
export const D1G_R1_SPACEGASS_CONNECTOR_IMPLEMENTED = false as const;
export const D1G_R1_ETABS_CONNECTOR_IMPLEMENTED = false as const;
export const D1G_R1_SAP2000_CONNECTOR_IMPLEMENTED = false as const;
export const D1G_R1_STAAD_CONNECTOR_IMPLEMENTED = false as const;
export const D1G_R1_ROBOT_CONNECTOR_IMPLEMENTED = false as const;
export const D1G_R1_DYNAMIC_CODE_EXECUTION_FROM_PROVIDER_PAYLOAD = false as const;
export const D1G_R1_EVAL_FROM_PROVIDER_PAYLOAD = false as const;
export const D1G_R1_UNSAFE_DESERIALIZATION = false as const;
export const D1G_R1_PATH_TRAVERSAL_ALLOWED = false as const;
export const D1G_R1_PROVIDER_PAYLOAD_CAN_DEFINE_LOCAL_FILE_PATH = false as const;
export const D1G_R1_UNKNOWN_FIELD_CAN_SILENTLY_CHANGE_ENGINEERING_SEMANTICS = false as const;
export const D1G_R1_ADAPTER_CONFORMANCE_HARNESS_IMPLEMENTED = true as const;
export const D1G_R1_MEMBER_DESIGN_EXECUTION_ADDED = false as const;
export const D1G_R1_D1F_MATURITY_PROMOTION = false as const;
export const D1G_R1_C10_MATURITY_PROMOTION = false as const;
export const D1G_R1_STEEL_DISPATCH_DEBT_PRESERVED = true as const;
export const D1G_R1_STEEL_SYSTEM_BREADTH_EXPANDED = false as const;
export const D1G_R1_NAN_CAN_GOVERN = false as const;
export const D1G_R1_INFINITY_CAN_GOVERN = false as const;
export const D1G_R1_NON_NUMERIC_ENGINEERING_VALUE_CAN_GOVERN = false as const;
export const CROSS_PROJECT_PROVIDER_RESULT_BINDING_ALLOWED = false as const;
export const CROSS_TENANT_PROVIDER_RESULT_BINDING_ALLOWED = false as const;
export const PROVIDER_ADAPTER_AUTHORITY_BYPASSES_AUTHORIZATION = false as const;
export const D1G_R2_HANDOFF_READY = true as const;
export const D1G_PROPOSED_PHASE_SEQUENCE = [
  "EOS-D1G-R1-PROVIDER-NEUTRAL-SOLVER-ADAPTER-FOUNDATION",
  "EOS-D1G-R2-PROVIDER-NEUTRAL-RESULT-PACKAGE-INGESTION",
  "EOS-D1G-R3-FIRST-PROVIDER-SPECIFIC-CONNECTOR",
  "EOS-D1G-R4-CROSS-PROVIDER-CONSISTENCY",
  "EOS-D1G-R5-SOLVER-INTEGRATION-CLOSEOUT",
] as const;
export const D1G_R2_REQUIRED_R1_CONTRACTS = [
  "adapterIdentity",
  "capabilityManifest",
  "sourcePayloadIdentity",
  "mappingManifest",
  "providerObjectMappings",
  "analysisRunExtraction",
  "resultExtraction",
  "unitAxisSignMetadata",
  "caseCombinationMapping",
  "rawD1fHandoff",
  "fingerprints",
  "provenance",
  "conformanceHarness",
] as const;

export const D1G_R1_GENERIC_LOAD_LABELS = ["ULTIMATE", "SERVICE", "WORST_CASE"] as const;

export type D1gR1AdapterIdentity = {
  adapterId: string;
  adapterVersion: string;
  adapterSchemaVersion: string;
  providerId: string;
  supportedProviderVersions: readonly string[];
  adapterType: D1gR1AdapterType;
  capabilityManifestRef: string;
  mappingManifestRef: string;
  declaredCapabilities: readonly D1gR1AdapterCapability[];
  requiredCapabilities: readonly D1gR1AdapterCapability[];
  status: string;
  authority: string;
  provenanceRef: string;
};

export type D1gR1ProviderWarning = { warningId: string; code: string; text: string };

export type D1gR1ProviderResult = {
  providerResultId: string;
  providerObjectId: string;
  providerCategory: string;
  providerQuantityName: string;
  value: number | null;
  explicitZero: boolean;
  unit: string | null;
  coordinateSystemRef: string | null;
  signConventionRef: string | null;
  location: string | null;
  stationValue: number | null;
  stationUnit: string | null;
  stationOrigin: string | null;
  stationOrientation: string | null;
  providerCaseId: string | null;
  providerCombinationId: string | null;
};

export type D1gR1ProviderSource = {
  sourcePayloadId: string;
  providerId: string;
  providerName: string;
  providerVersion: string;
  providerModelVersion: string;
  providerRunVersion: string;
  sourceType: string;
  sourceName: string;
  sourceVersion: string;
  sourceTimestamp: string;
  projectId: string;
  tenantId: string;
  workspaceId: string;
  providerModelId: string;
  analysisType: string;
  unitContextRef: string | null;
  coordinateSystemRef: string | null;
  signConventionRef: string | null;
  providerRunId: string;
  providerRunState: string;
  providerConvergenceState: string;
  warnings: readonly D1gR1ProviderWarning[];
  cases: readonly { providerCaseId: string; label: string }[];
  combinations: readonly { providerCombinationId: string; label: string }[];
  results: readonly D1gR1ProviderResult[];
  unknownFields: Readonly<Record<string, unknown>>;
};

export type D1gR1MappingManifest = {
  manifestId: string;
  manifestVersion: string;
  authority: "EXPLICIT_GOVERNED" | "AI" | "UNCONFIRMED";
  categories: Readonly<Record<string, string>>;
  quantities: Readonly<Record<string, string>>;
  signs: Readonly<Record<string, 1 | -1>>;
  memberEnds: Readonly<Record<string, string>>;
  locations: Readonly<Record<string, string>>;
  cases: Readonly<Record<string, string>>;
  combinations: Readonly<Record<string, string>>;
  runStates: Readonly<Record<string, string>>;
  convergenceStates: Readonly<Record<string, string>>;
  warningCategories: Readonly<Record<string, string>>;
};

export type D1gR1ObjectMappingEntry = {
  providerObjectId: string;
  providerModelId: string;
  kind: "ELEMENT" | "NODE" | "SUPPORT";
  analyticalElementId: string | null;
  nodeId: string | null;
  supportId: string | null;
  physicalMemberId: string | null;
  designMemberId: string | null;
  elementDirection: "ALIGNED" | "REVERSED";
};

export type D1gR1ObjectMapping = {
  mappingId: string;
  mappingVersion: string;
  authority: "EXPLICIT_GOVERNED" | "AI" | "UNCONFIRMED";
  projectId: string;
  tenantId: string;
  workspaceId: string;
  structuralSystemId: string;
  analysisModelId: string;
  providerModelId: string;
  entries: readonly D1gR1ObjectMappingEntry[];
};

export type D1gR1GovernedContext = {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  structuralSystemId: string;
  analysisModelId: string;
  analysisModelVersion: string;
  sourceTopologyFingerprint: string;
  currentTopologyFingerprint: string;
  modelStatus: string;
  modelValidationEvidenceRef: string | null;
  normalizationRuleVersion: string;
  currentNormalizationRuleVersion: string;
  canonicalCoordinateSystemRef: string;
  signConventionRef: string;
  explicitResultAuthority: "IMPORTED_PENDING_VERIFICATION" | "VERIFIED_GOVERNED";
  axisMapAuthority: "EXPLICIT_GOVERNED" | "AI" | "UI";
  currentMappingFingerprint: string | null;
};

export type D1gR1AdapterRequest = {
  adapter: D1gR1AdapterIdentity;
  source: D1gR1ProviderSource;
  mappingManifest: D1gR1MappingManifest;
  objectMapping: D1gR1ObjectMapping;
  governed: D1gR1GovernedContext;
  transform: {
    transformId: string;
    fromSystem: string;
    toSystem: string;
    methodRef: string;
    version: string;
    componentMap: Readonly<Record<string, string>>;
    authority: string;
    provenanceRef: string;
  } | null;
  limits?: Partial<D1gR1ResourceLimits>;
};
