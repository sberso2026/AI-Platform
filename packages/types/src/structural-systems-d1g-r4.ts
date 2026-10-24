/**
 * EOS-D1G-R4 SPACE GASS read-only connector.
 * The connector transports and maps preserved results. It does not analyse a structure.
 */

export const D1G_R4_MATURITY_STATE = "SPACE_GASS_READ_ONLY_CONNECTOR_IMPLEMENTED_OFFLINE_CONFORMANCE_VALIDATED" as const;
export const D1G_R4_CONNECTOR_VERSION = "d1g-r4-1" as const;
export const D1G_R4_MAPPING_MANIFEST_ID = "map-d1g-r4-space-gass" as const;
export const D1G_R4_MAPPING_MANIFEST_VERSION = "1" as const;
export const D1G_R4_PROVIDER_ID = "SPACE_GASS" as const;
export const D1G_R4_PROVIDER_PRODUCT = "SPACE GASS" as const;
export const D1G_R4_API_GENERATION = "v1" as const;
export const D1G_R4_SUPPORTED_PROVIDER_VERSIONS = ["15.0.2", "15.1.0"] as const;
export const D1G_R4_FEATURE_FLAG = "d1g.spaceGass.readOnlyConnector" as const;
export const D1G_R4_FEATURE_FLAG_DEFAULT = false as const;
export const D1G_R4_LIVE_TEST_DEFAULT_ENABLED = false as const;
export const D1G_R4_SPACE_GASS_CONNECTOR_RUNTIME_COUNT = 1 as const;
export const D1G_R4_COMMERCIAL_PROVIDER_CONNECTOR_RUNTIME_COUNT = 1 as const;
export const D1G_R4_LIVE_PROVIDER_VALIDATED_CONNECTOR_COUNT = 0 as const;
export const D1G_R4_STRUCTURAL_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1G_R4_MODEL_MODIFICATION_COUNT = 0 as const;
export const D1G_R4_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;

export const D1G_R4_CONNECTOR_EQUALS_STRUCTURAL_SOLVER = false as const;
export const D1G_R4_CONNECTOR_EQUALS_MODEL_VALIDATION = false as const;
export const D1G_R4_CONNECTOR_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1G_R4_CONNECTOR_EQUALS_RESULT_AUTHORITY = false as const;
export const SPACE_GASS_BRAND_EQUALS_TRUST = false as const;
export const D1G_R4_UNRESOLVED_SEMANTICS_PRESERVED = true as const;
export const D1G_R4_PROVIDER_VERSION_POLICY_IMPLEMENTED = true as const;
export const D1G_R4_UNTESTED_PROVIDER_VERSION_AUTO_ACCEPTED = false as const;
export const D1G_R4_PROVIDER_VERSION_GUESSED = false as const;
export const D1G_R4_CONNECTOR_READ_ONLY = true as const;
export const D1G_R4_MUTATING_HTTP_METHOD_ALLOWED = false as const;
export const D1G_R4_ANALYSIS_RUN_COMMAND_IMPLEMENTED = false as const;
export const D1G_R4_SOLVER_START_COMMAND_IMPLEMENTED = false as const;
export const D1G_R4_SOLVER_RESTART_COMMAND_IMPLEMENTED = false as const;
export const D1G_R4_MODEL_OPEN_COMMAND_IMPLEMENTED = false as const;
export const D1G_R4_MODEL_SAVE_COMMAND_IMPLEMENTED = false as const;
export const D1G_R4_MODEL_EDIT_COMMAND_IMPLEMENTED = false as const;
export const D1G_R4_LOAD_EDIT_COMMAND_IMPLEMENTED = false as const;
export const D1G_R4_PROCESS_SPAWN_IMPLEMENTED = false as const;
export const D1G_R4_VENDOR_CLI_EXECUTION_IMPLEMENTED = false as const;
export const D1G_R4_VENDOR_SDK_DEPENDENCY_ADDED = false as const;
export const D1G_R4_VENDOR_DLL_LOADING_IMPLEMENTED = false as const;
export const D1G_R4_COM_AUTOMATION_IMPLEMENTED = false as const;
export const D1G_R4_LOCALHOST_ONLY = true as const;
export const D1G_R4_REMOTE_HOST_ALLOWED = false as const;
export const D1G_R4_PROVIDER_PAYLOAD_CAN_CHANGE_BASE_URL = false as const;
export const D1G_R4_PACKAGE_CAN_CHANGE_BASE_URL = false as const;
export const D1G_R4_HTTP_REDIRECT_AUTO_FOLLOW = false as const;
export const D1G_R4_UNBOUNDED_HTTP_RESPONSE_ALLOWED = false as const;
export const D1G_R4_API_CREDENTIAL_REQUIRED = false as const;
export const D1G_R4_LICENSE_KEY_READ = false as const;
export const D1G_R4_LICENSE_KEY_STORED = false as const;
export const D1G_R4_LICENSE_CIRCUMVENTION_IMPLEMENTED = false as const;
export const D1G_R4_PROVIDER_UNAVAILABLE_FAILS_CLOSED = true as const;
export const D1G_R4_LICENSE_FAILURE_BYPASS_ATTEMPTED = false as const;
export const D1G_R4_ARBITRARY_ENDPOINT_REQUEST_ALLOWED = false as const;
export const D1G_R4_ARBITRARY_QUERY_PARAMETER_ALLOWED = false as const;
export const D1G_R4_PROVIDER_SIDE_BOUNDED_FILTERING_IMPLEMENTED = true as const;
export const D1G_R4_NATIVE_SNAPSHOT_MUTATED = false as const;
export const D1G_R4_NATIVE_SOURCE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1G_R4_PROVIDER_MODEL_PATH_CAN_TRIGGER_FILE_READ = false as const;
export const D1G_R4_PROVIDER_MODEL_PATH_CAN_TRIGGER_FILE_WRITE = false as const;
export const D1G_R4_PROVIDER_MODEL_PATH_CAN_TRIGGER_PROCESS = false as const;
export const D1G_R4_RUN_IDENTITY_GUESSED = false as const;
export const D1G_R4_COMPLETED_EQUALS_CONVERGED = false as const;
export const D1G_R4_COMPLETED_EQUALS_MODEL_VALIDATED = false as const;
export const D1G_R4_COMPLETED_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const D1G_R4_NONLINEAR_CONVERGENCE_MAPPING_IMPLEMENTED = false as const;
export const D1G_R4_UNKNOWN_NONLINEAR_CONVERGENCE_CAN_GOVERN = false as const;
export const D1G_R4_WARNINGS_PRESERVED = true as const;
export const D1G_R4_LOAD_CASE_NOT_ANALYZED_INTERPRETED_AS_ZERO = false as const;
export const D1G_R4_JOB_UNITS_READ_FROM_PROVIDER = true as const;
export const D1G_R4_UNITS_ASSUMED_FROM_DISPLAY = false as const;
export const D1G_R4_UNITS_HARDCODED = false as const;
export const D1G_R4_RESULT_WITHOUT_UNIT_CONTEXT_CAN_GOVERN = false as const;
export const D1G_R4_LOAD_CASE_EXTRACTION_IMPLEMENTED = true as const;
export const D1G_R4_PROVIDER_CASE_TITLE_EQUALS_EOS_CASE_ID = false as const;
export const D1G_R4_LOAD_COMBINATION_EXTRACTION_IMPLEMENTED = true as const;
export const D1G_R4_PROVIDER_COMBINATION_AUTO_CREATES_D1C_COMBINATION = false as const;
export const D1G_R4_RESTRAINED_NODE_SUPPORT_EXTRACTION_IMPLEMENTED = true as const;
export const D1G_R4_PROVIDER_OBJECT_ID_GLOBAL_UNIQUENESS_ASSUMED = false as const;
export const D1G_R4_OBJECT_ID_STABILITY_OVERSTATED = false as const;
export const D1G_R4_PROVIDER_OBJECT_ID_AUTO_BECOMES_EOS_MEMBER_ID = false as const;
export const AI_PROVIDER_OBJECT_MAPPING_AUTHORITY = false as const;
export const D1G_R4_MEMBER_LOCAL_AXIS_GUESSED = false as const;
export const D1G_R4_VERTICAL_MEMBER_AXIS_GUESSED = false as const;
export const D1G_R4_LOCAL_Y_EQUALS_DESIGN_MAJOR_ASSUMED = false as const;
export const D1G_R4_LOCAL_Z_EQUALS_DESIGN_MINOR_ASSUMED = false as const;
export const D1G_R4_SIGN_MAPPING_HARDCODED_OUTSIDE_MANIFEST = false as const;
export const D1G_R4_MEMBER_STATION_FORCE_EXTRACTION_IMPLEMENTED = true as const;
export const D1G_R4_STATION_DISTANCE_PRESERVED = true as const;
export const D1G_R4_STATION_ORIGIN_EXPLICIT = true as const;
export const D1G_R4_STATION_ZERO_AUTO_CLASSIFIED_AS_MEMBER_END = false as const;
export const D1G_R4_STATION_AT_LENGTH_AUTO_CLASSIFIED_AS_MEMBER_END = false as const;
export const D1G_R4_MEMBER_END_FORCE_ENDPOINT_IMPLEMENTED = false as const;
export const D1G_R4_PROVIDER_NATIVE_FORCE_COMPONENTS_PRESERVED = true as const;
export const D1G_R4_MEMBER_FORCE_CALCULATED = false as const;
export const D1G_R4_MEMBER_FORCE_INTERPOLATED = false as const;
export const D1G_R4_MEMBER_FORCE_EXTRAPOLATED = false as const;
export const D1G_R4_SUPPORT_REACTION_FORCE_EXTRACTION_IMPLEMENTED = true as const;
export const D1G_R4_REACTION_MOMENT_EXTRACTION_IMPLEMENTED = false as const;
export const D1G_R4_REACTION_MOMENT_FIELDS_GUESSED = false as const;
export const D1G_R4_REACTION_LOCATION_EXPLICIT = true as const;
export const D1G_R4_ABSENT_FORCE_COMPONENT_EQUALS_ZERO = false as const;
export const D1G_R4_MISSING_REACTION_MOMENT_EQUALS_ZERO = false as const;
export const D1G_R4_EXPLICIT_ZERO_PRESERVED = true as const;
export const D1G_R4_CAPABILITY_SCOPE_OVERSTATED = false as const;
export const D1G_R4_MEMBER_END_FORCE_ENDPOINT_SUPPORTED = false as const;
export const D1G_R4_REACTION_MOMENTS_SUPPORTED = false as const;
export const D1G_R4_MODAL_RESULTS_SUPPORTED = false as const;
export const D1G_R4_BUCKLING_RESULTS_SUPPORTED = false as const;
export const D1G_R4_SHELL_STRESS_RESULTS_SUPPORTED = false as const;
export const D1G_R4_NONLINEAR_HISTORY_SUPPORTED = false as const;
export const D1G_R4_DESIGN_RESULTS_SUPPORTED = false as const;
export const D1G_R4_MODEL_EDIT_SUPPORTED = false as const;
export const D1G_R4_SOLVER_EXECUTION_SUPPORTED = false as const;
export const D1G_R4_MAPPING_MANIFEST_VERSIONED = true as const;
export const D1G_R4_MAPPING_MANIFEST_FINGERPRINT_IMPLEMENTED = true as const;
export const D1G_R4_PROVIDER_FILTER_CHUNKING_IMPLEMENTED = true as const;
export const D1G_R4_CHUNK_PARTITION_DETERMINISTIC = true as const;
export const D1G_R4_CHUNK_BOUNDARY_CREATES_ENVELOPE = false as const;
export const D1G_R4_CHUNK_BOUNDARY_CREATES_GOVERNING_CASE = false as const;
export const D1G_R4_MISSING_CHUNK_CAN_IMPLY_COMPLETE = false as const;
export const PARALLEL_SPACE_GASS_SEMANTIC_MAPPING_IMPLEMENTATIONS = false as const;
export const D1G_R4_BUNDLE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1G_R4_BUNDLE_FINGERPRINT_ORDER_INDEPENDENT = true as const;
export const NATIVE_SNAPSHOT_EQUALS_EOS_RESULT_PACKAGE = false as const;
export const D1G_R4_UNRESOLVED_DESIGN_AXIS_CAN_REACH_GOVERNING_MEMBER_CHECK = false as const;
export const D1G_R4_CONNECTOR_AUTO_PROMOTES_RESULT_AUTHORITY = false as const;
export const D1G_R4_CONNECTOR_CAN_APPROVE_OBJECT_MAPPING = false as const;
export const D1G_R4_CONNECTOR_AUTO_APPROVES_D1C_MAPPING = false as const;
export const D1G_R4_ARBITRARY_PROVIDER_REQUEST_API_EXPOSED = false as const;
export const D1G_R4_ERROR_LAYERING_PRESERVED = true as const;
export const D1G_R4_RAW_ENGINEERING_PAYLOAD_LOGGED_BY_DEFAULT = false as const;
export const D1G_R4_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1G_R4_CONNECTOR_EXECUTION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1G_R4_HISTORICAL_CONNECTOR_EXECUTION_REPRODUCIBLE = true as const;
export const NEW_SPACE_GASS_IMPORT_OVERWRITES_OLD_RESULT = false as const;
export const D1G_R4_OFFLINE_REPLAY_NO_VENDOR_CALL = true as const;
export const D1G_R4_STEEL_SYSTEM_BREADTH_EXPANDED = false as const;
export const D1G_R4_R3_STEEL_DISPATCH_DEBT_PRESERVED = true as const;
export const D1G_R4_C10_MATURITY_PROMOTION = false as const;
export const D1G_R4_D1F_ENGINEER_VALIDATION_PROMOTION = false as const;
export const D1G_R4_UNSOURCED_SPACE_GASS_SEMANTIC_IMPLEMENTED = false as const;
export const PARALLEL_RESULT_DOMAIN_CREATED = false as const;
export const D1G_R4_REQUEST_TIMEOUT_MS = 5000 as const;
export const D1G_R4_NATIVE_RESPONSE_SIZE_LIMIT_BYTES = 262144 as const;
export const D1G_R4_REQUEST_CONCURRENCY_LIMIT = 1 as const;
export const D1G_R4_RETRY_LIMIT = 2 as const;

export const D1G_R4_PROVIDER_ERROR_CODES = [
  "PROVIDER_UNAVAILABLE",
  "UNSUPPORTED_PROVIDER_VERSION",
  "UNRESOLVED_PROVIDER_VERSION",
  "SOURCE_INVALID",
  "AUTHENTICATION_REQUIRED",
  "LICENSE_UNAVAILABLE",
  "MODEL_NOT_ANALYZED",
  "RUN_FAILED",
  "RUN_NONCONVERGED",
  "UNSUPPORTED_RESULT_TYPE",
  "OBJECT_MAPPING_FAILED",
  "UNIT_MAPPING_FAILED",
  "AXIS_MAPPING_FAILED",
  "SIGN_MAPPING_FAILED",
  "CASE_MAPPING_FAILED",
  "RESULT_LOCATION_UNRESOLVED",
  "SOURCE_TOO_LARGE",
  "OTHER_PROVIDER_ERROR",
] as const;

export const D1G_R4_UNRESOLVED_SEMANTICS = [
  "MEMBER_END_RESULT_ENDPOINT_NAME",
  "REACTION_MOMENT_FIELD_NAMES",
  "OBJECT_ID_STABILITY_ACROSS_SAVE_REOPEN_RENUMBER",
  "MINIMUM_DESKTOP_VERSION_BELOW_DOCUMENTED_15_SDK_EXAMPLES",
  "NONLINEAR_CONVERGENCE_FLAG_DISTINCT_FROM_RUN_STATUS",
  "MAJOR_MINOR_AXIS_WITHOUT_SECTION_TRANSPOSE_STATE",
] as const;

export const D1G_R4_CANONICAL_BASE_URL = "http://127.0.0.1:34560/api/v1" as const;
export const D1G_R4_DOCUMENTED_LOCALHOST_BASE_URL = "http://localhost:34560/api/v1" as const;
