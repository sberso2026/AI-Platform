/**
 * EOS-D1G-R2 provider-neutral external result package.
 * A package file is data. It does not authorize a result, a mapping, a project, or a profile.
 * Machine-readable schema:
 * packages/engineering-os/src/structural-systems/eos-structural-result-package-v1.schema.json
 */

export const D1G_R2_PACKAGE_FORMAT = "EOS_STRUCTURAL_RESULT_PACKAGE" as const;
export const D1G_R2_SCHEMA_VERSION = "1" as const;
export const D1G_R2_PACKAGE_V1_CONTAINER = "SINGLE_UTF8_JSON_FILE" as const;
export const D1G_R2_MATURITY_STATE = "PROVIDER_NEUTRAL_RESULT_PACKAGE_INGESTION_IMPLEMENTED" as const;
export const D1G_R2_RESULT_PACKAGE_RUNTIME_COUNT = 1 as const;
export const D1G_R2_SECURE_INGESTION_PIPELINE_COUNT = 1 as const;
export const D1G_R2_COMMERCIAL_PROVIDER_CONNECTOR_COUNT = 0 as const;
export const D1G_R2_STRUCTURAL_SOLVER_EXECUTION_COUNT = 0 as const;
export const D1G_R2_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1G_R2_ARCHIVE_FORMAT_SUPPORTED = false as const;
export const D1G_R2_EXTERNAL_RESOURCE_REFERENCE_SUPPORTED = false as const;
export const D1G_R2_PACKAGE_FORMAT_MARKER_REQUIRED = true as const;
export const D1G_R2_UNKNOWN_SCHEMA_VERSION_ACCEPTED = false as const;
export const D1G_R2_FUTURE_SCHEMA_AUTO_INTERPRETED = false as const;
export const D1G_R2_DUPLICATE_JSON_KEY_REJECTED = true as const;
export const D1G_R2_UTF8_REQUIRED = true as const;
export const D1G_R2_INVALID_UTF8_REJECTED = true as const;
export const D1G_R2_UTF8_BOM_POLICY = "ACCEPT_OPTIONAL_UTF8_BOM_AND_STRIP_BEFORE_PARSE_KEEP_RAW_FINGERPRINT" as const;
export const D1G_R2_FILE_EXTENSION_DEFINES_TRUST = false as const;
export const D1G_R2_UNBOUNDED_PARSE_ALLOWED = false as const;
export const D1G_R2_UNBOUNDED_RECURSION_ALLOWED = false as const;
export const D1G_R2_NAN_CAN_GOVERN = false as const;
export const D1G_R2_INFINITY_CAN_GOVERN = false as const;
export const D1G_R2_NON_NUMERIC_ENGINEERING_VALUE_CAN_GOVERN = false as const;
export const D1G_R2_INGESTION_ROUNDS_ENGINEERING_VALUES = false as const;
export const D1G_R2_RAW_PACKAGE_PRESERVED = true as const;
export const D1G_R2_RAW_PACKAGE_MUTATED = false as const;
export const D1G_R2_PACKAGE_CAN_DEFINE_LOCAL_FILE_PATH = false as const;
export const D1G_R2_PACKAGE_CAN_TRIGGER_FILE_READ = false as const;
export const D1G_R2_PACKAGE_CAN_TRIGGER_FILE_WRITE = false as const;
export const D1G_R2_PACKAGE_CAN_TRIGGER_NETWORK_FETCH = false as const;
export const D1G_R2_EVAL_ALLOWED = false as const;
export const D1G_R2_DYNAMIC_CODE_EXECUTION_ALLOWED = false as const;
export const D1G_R2_SCRIPT_EXECUTION_ALLOWED = false as const;
export const D1G_R2_TEMPLATE_EXECUTION_ALLOWED = false as const;
export const D1G_R2_PROVIDER_DECLARATION_REQUIRED = true as const;
export const D1G_R2_PROVIDER_DECLARATION_AUTO_TRUSTED = false as const;
export const D1G_R2_UNKNOWN_PROVIDER_CAN_GOVERN = false as const;
export const D1G_R2_PROVIDER_VERSION_COMPATIBILITY_REQUIRED = true as const;
export const D1G_R2_ACTUAL_ADAPTER_VERSION_RECORDED = true as const;
export const D1G_R2_MAPPING_MANIFEST_RESOLVED_FROM_GOVERNED_EOS_CONFIGURATION = true as const;
export const D1G_R2_PACKAGE_MAPPING_LOGIC_EXECUTED = false as const;
export const D1G_R2_MAPPING_FINGERPRINT_MISMATCH_CAN_GOVERN = false as const;
export const D1G_R2_PACKAGE_OBJECT_MAPPING_AUTO_APPROVED = false as const;
export const D1G_R2_AUTHORIZED_PROJECT_CONTEXT_REQUIRED = true as const;
export const D1G_R2_PACKAGE_PROJECT_ID_GRANTS_ACCESS = false as const;
export const D1G_R2_CROSS_PROJECT_RESULT_BINDING_ALLOWED = false as const;
export const D1G_R2_CROSS_TENANT_RESULT_BINDING_ALLOWED = false as const;
export const D1G_R2_PACKAGE_CAN_OVERRIDE_GOVERNED_PROFILE = false as const;
export const D1G_R2_PACKAGE_RESULT_AUTHORITY_SELF_DECLARATION_GOVERNS = false as const;
export const D1G_R2_PACKAGE_MODEL_VALIDATED_FLAG_GOVERNS = false as const;
export const D1G_R2_CAPABILITY_MISMATCH_FAILS_CLOSED = true as const;
export const D1G_R2_DUPLICATE_RESULT_ID_REJECTED = true as const;
export const D1G_R2_PROVIDER_OBJECT_GLOBAL_UNIQUENESS_ASSUMED = false as const;
export const D1G_R2_UNITLESS_ENGINEERING_RESULT_CAN_GOVERN = false as const;
export const D1G_R2_MISSING_COORDINATE_SYSTEM_CAN_GOVERN = false as const;
export const D1G_R2_MISSING_SIGN_CONVENTION_CAN_GOVERN = false as const;
export const D1G_R2_MISSING_RESULT_LOCATION_CAN_GOVERN = false as const;
export const D1G_R2_MEMBER_END_IDENTITY_REQUIRED = true as const;
export const D1G_R2_STATION_RESULT_SEMANTICS_REQUIRED = true as const;
export const D1G_R2_ABSENT_VALUE_EQUALS_ZERO = false as const;
export const D1G_R2_MISSING_COMPONENT_INVENTED_AS_ZERO = false as const;
export const D1G_R2_EXPLICIT_ZERO_PRESERVED = true as const;
export const D1G_R2_PROVIDER_WARNINGS_PRESERVED = true as const;
export const D1G_R2_UNKNOWN_WARNING_DROPPED = false as const;
export const D1G_R2_UNKNOWN_FIELD_POLICY = "REJECT_UNKNOWN_ENGINEERING_FIELDS_PRESERVE_EXTENSIONS_AS_NON_GOVERNING_METADATA" as const;
export const D1G_R2_EXTENSION_METADATA_CAN_GOVERN = false as const;
export const D1G_R2_PARTIAL_PACKAGE_CAN_IMPLY_COMPLETE = false as const;
export const D1G_R2_JSON_PARSE_SUCCESS_EQUALS_ENGINEERING_VALID = false as const;
export const D1G_R2_SCHEMA_VALID_EQUALS_GOVERNED_RESULT = false as const;
export const D1G_R2_INGESTION_SUCCESS_EQUALS_VERIFIED_GOVERNED = false as const;
export const D1G_R2_INGESTION_FINGERPRINT_IMPLEMENTED = true as const;
export const D1G_R2_HISTORICAL_INGESTION_REPRODUCIBLE = true as const;
export const D1G_R2_NEW_INGESTION_OVERWRITES_OLD_RESULT = false as const;
export const D1G_R2_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1G_R2_FILENAME_DEFINES_PROVIDER = false as const;
export const D1G_R2_FILENAME_DEFINES_SCHEMA = false as const;
export const D1G_R2_FILE_EXTENSION_DEFINES_PACKAGE_VALIDITY = false as const;
export const D1G_R2_CALLER_MIME_TYPE_DEFINES_TRUST = false as const;
export const D1G_R2_R3_MEMBER_DESIGN_EXECUTION_ADDED = false as const;
export const D1G_R2_STRUCTURAL_SOLVER_IMPLEMENTED = false as const;
export const D1G_R2_SPACEGASS_CONNECTOR_IMPLEMENTED = false as const;
export const D1G_R2_ETABS_CONNECTOR_IMPLEMENTED = false as const;
export const D1G_R2_SAP2000_CONNECTOR_IMPLEMENTED = false as const;
export const D1G_R2_STAAD_CONNECTOR_IMPLEMENTED = false as const;
export const D1G_R2_ROBOT_CONNECTOR_IMPLEMENTED = false as const;
export const D1G_R2_D1F_MATURITY_PROMOTION = false as const;
export const D1G_R2_C10_MATURITY_PROMOTION = false as const;
export const D1G_R2_STEEL_SYSTEM_BREADTH_EXPANDED = false as const;
export const D1G_R2_R3_STEEL_DISPATCH_DEBT_PRESERVED = true as const;
export const D1G_R2_R1_CASE_COMBINATION_MAPPING_REUSED = true as const;
export const D1G_R2_R1_RESULT_CATEGORY_MAPPING_REUSED = true as const;
export const D1G_R2_R1_QUANTITY_MAPPING_REUSED = true as const;
export const D1G_R2_PACKAGE_CAN_SELF_PROMOTE_RESULT_AUTHORITY = false as const;
export const D1G_R2_PACKAGE_CAN_SELF_SELECT_GOVERNED_MAPPING = false as const;
export const D1G_R2_PACKAGE_CAN_SELF_APPROVE_OBJECT_MAPPING = false as const;
export const D1G_R2_PACKAGE_CAN_SELF_SELECT_PROJECT_CONTEXT = false as const;
export const D1G_R2_PACKAGE_CAN_SELF_SELECT_DESIGN_PROFILE = false as const;
export const D1G_R2_MACHINE_READABLE_SCHEMA_PATH = "packages/engineering-os/src/structural-systems/eos-structural-result-package-v1.schema.json" as const;
export const D1G_R2_EXAMPLE_PACKAGE_PATH = "packages/engineering-os/src/structural-systems/eos-structural-result-package-v1.example.json" as const;

export const D1G_R2_PACKAGE_VALIDATION_STATES = [
  "PARSED",
  "SCHEMA_VALID",
  "SEMANTICALLY_VALID",
  "PARTIAL",
  "UNSUPPORTED",
  "INVALID",
  "STALE",
] as const;

export type D1gR2PackageValidationState = (typeof D1G_R2_PACKAGE_VALIDATION_STATES)[number];

export const D1G_R2_INGESTION_PIPELINE = [
  "FILE_RECEIVED",
  "RAW_BYTE_FINGERPRINT",
  "ENCODING_VALIDATION",
  "DUPLICATE_KEY_VALIDATION",
  "JSON_PARSE",
  "RESOURCE_LIMIT_VALIDATION",
  "SCHEMA_VALIDATION",
  "REFERENTIAL_VALIDATION",
  "AUTHORIZED_CONTEXT_RESOLUTION",
  "ADAPTER_RESOLUTION",
  "MAPPING_MANIFEST_RESOLUTION",
  "OBJECT_MAPPING_RESOLUTION",
  "R1_ADAPTER_EXECUTION",
  "D1F_RAW_HANDOFF",
  "D1F_NORMALIZATION",
  "INGESTION_RESULT",
] as const;

export type D1gR2ResourceLimits = {
  maxFileBytes: number;
  maxNestingDepth: number;
  maxResultCount: number;
  maxObjectCount: number;
  maxWarningCount: number;
  maxCaseCount: number;
  maxCombinationCount: number;
  maxStringLength: number;
  maxIdentifierLength: number;
  maxArrayLength: number;
};

export const D1G_R2_DEFAULT_RESOURCE_LIMITS: D1gR2ResourceLimits = {
  maxFileBytes: 262144,
  maxNestingDepth: 8,
  maxResultCount: 64,
  maxObjectCount: 64,
  maxWarningCount: 32,
  maxCaseCount: 32,
  maxCombinationCount: 32,
  maxStringLength: 512,
  maxIdentifierLength: 128,
  maxArrayLength: 64,
};

export type D1gR2PackageResult = {
  providerResultId: string;
  providerObjectId: string;
  providerRunId: string;
  resultCategory: string;
  providerQuantityName: string;
  rawValue: number | null;
  explicitZero: boolean;
  rawUnit: string | null;
  coordinateSystem: string | null;
  signConvention: string | null;
  resultLocation: string | null;
  station: { value: number; unit: string; origin: string; orientation: string } | null;
  providerCaseId: string | null;
  providerCombinationId: string | null;
  warningIds: readonly string[];
};

export type D1gR2PackageDocument = {
  packageFormat: typeof D1G_R2_PACKAGE_FORMAT;
  schemaVersion: typeof D1G_R2_SCHEMA_VERSION;
  packageId: string;
  createdAt: string;
  completeness: "COMPLETE" | "PARTIAL";
  producer: { producerId: string; producerName: string };
  provider: { providerId: string; providerName: string; providerVersion: string };
  source: { sourceName: string; sourceVersion: string; sourceTimestamp: string };
  model: {
    providerModelId: string;
    modelVersion: string;
    analysisType: string;
    unitContextRef: string | null;
    coordinateSystemRef: string | null;
    signConventionRef: string | null;
  };
  run: {
    providerRunId: string;
    providerRunState: string;
    providerConvergenceState: string;
    runVersion: string;
    runTimestamp: string;
  };
  capabilities: readonly string[];
  mappingExpectation: {
    mappingManifestId: string;
    mappingManifestVersion: string;
    mappingManifestFingerprint: string | null;
  };
  objectMappingExpectation: { objectMappingId: string; objectMappingVersion: string };
  loadCases: readonly { providerCaseId: string; providerCaseName: string; providerCaseType: string | null }[];
  loadCombinations: readonly { providerCombinationId: string; providerCombinationName: string; providerCombinationType: string | null }[];
  providerObjects: readonly { providerObjectId: string; providerObjectType: string; providerModelId: string }[];
  results: readonly D1gR2PackageResult[];
  warnings: readonly { warningId: string; code: string; text: string; resultId: string | null }[];
  extensions: Readonly<Record<string, unknown>>;
};
