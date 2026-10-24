import {
  D1G_R2_DEFAULT_RESOURCE_LIMITS,
  D1G_R3_CONNECTOR_API_METHODS,
  D1G_R3_DECISION_VERSION,
  D1G_R3_DEFERRED_FEATURES,
  D1G_R3_EVIDENCE_ACCESS_DATE,
  D1G_R3_FEATURE_FLAG,
  D1G_R3_FEATURE_FLAG_DEFAULT,
  D1G_R3_MATURITY_STATE,
  D1G_R3_PROVIDER_ERROR_CODES,
  D1G_R3_R2_PACKAGE_SCALE_CLASSIFICATION,
  D1G_R3_R4_SCALE_ARCHITECTURE,
  D1G_R3_SELECTED_INTEGRATION_MODE,
  D1G_R3_SELECTED_PROVIDER,
  D1G_R3_SELECTED_PROVIDER_PRODUCT,
  D1G_R3_SELECTED_PROVIDER_VERSION_SCOPE,
  D1G_R3_SELECTION_RESULT,
  D1G_R3_UNRESOLVED_SEMANTICS,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";

export const D1G_R3_SELECTION_RECORD = {
  decisionVersion: D1G_R3_DECISION_VERSION,
  evidenceAccessDate: D1G_R3_EVIDENCE_ACCESS_DATE,
  selectionResult: D1G_R3_SELECTION_RESULT,
  selectedProvider: D1G_R3_SELECTED_PROVIDER,
  product: D1G_R3_SELECTED_PROVIDER_PRODUCT,
  versionScope: D1G_R3_SELECTED_PROVIDER_VERSION_SCOPE,
  integrationMode: D1G_R3_SELECTED_INTEGRATION_MODE,
  deploymentModel: "USER_MACHINE_AGENT",
  handoffRoute: "SINGLE_MAPPING_TO_R1_RECORDS_WITH_OPTIONAL_V1_CHUNK_SERIALIZATION",
  scaleClassification: D1G_R3_R2_PACKAGE_SCALE_CLASSIFICATION,
  r4ScaleArchitecture: D1G_R3_R4_SCALE_ARCHITECTURE,
  featureFlag: D1G_R3_FEATURE_FLAG,
  featureFlagDefault: D1G_R3_FEATURE_FLAG_DEFAULT,
  connectorImplemented: false,
  solverExecutionInScope: false,
  readOnly: true,
  licensingReviewRequired: true,
  cloudSolverExecutionAssumed: false,
  r2Limits: D1G_R2_DEFAULT_RESOURCE_LIMITS,
  r2LimitsAreProductionScale: false,
  unresolvedSemantics: D1G_R3_UNRESOLVED_SEMANTICS,
  deferredFeatures: D1G_R3_DEFERRED_FEATURES,
  capabilityScope: [
    "MODEL_METADATA",
    "NODES",
    "ANALYTICAL_MEMBERS",
    "LOAD_CASES",
    "LOAD_COMBINATIONS",
    "MEMBER_STATION_FORCES",
    "SUPPORT_REACTION_FORCES",
    "WARNINGS",
    "RUN_TERMINAL_STATUS",
  ],
  officialSources: [
    { id: "SG-API-PRODUCT", title: "SPACE GASS API product page", url: "https://spacegass.com/api" },
    { id: "SG-API-CONCEPTS", title: "SPACE GASS API concepts", url: "https://api.spacegass.com/docs/concepts" },
    { id: "SG-API-VERSIONING", title: "SPACE GASS API versioning", url: "https://api.spacegass.com/docs/versioning" },
    { id: "SG-API-AUTH", title: "SPACE GASS API authentication", url: "https://api.spacegass.com/docs/authentication" },
    { id: "SG-API-RESULTS", title: "Filter analysis results by load case", url: "https://api.spacegass.com/docs/examples/filter-results-by-case" },
    { id: "SG-API-REACTIONS", title: "Read reactions for restrained nodes", url: "https://api.spacegass.com/docs/examples/reactions-for-restrained-nodes" },
    { id: "SG-API-BEAM", title: "Simple beam example, member station forces", url: "https://api.spacegass.com/docs/examples/simple-beam" },
    { id: "SG-MANUAL-AXES", title: "Coordinate systems", url: "https://www.spacegass.com/manual/Modelling_the_Structure/Coordinate_systems.htm" },
    { id: "SG-MANUAL-SIGNS", title: "Sign conventions", url: "https://www.spacegass.com/manual/Modelling_the_Structure/Sign_conventions.htm" },
    { id: "SG-MANUAL-ACTIONS", title: "Displacements, actions and reactions", url: "https://www.spacegass.com/manual/Analysis/Static_Analysis/Displacements_actions_and_reactions.htm" },
  ],
} as const;

export function d1gR3SelectionFingerprint(): string {
  return fingerprintCanonical({ subject: "D1G_R3_PROVIDER_SELECTION", identity: D1G_R3_SELECTION_RECORD });
}

export function reviewD1gR3ProviderArchitecture(): { pass: boolean; gaps: readonly string[] } {
  const gaps: string[] = [];
  const controls = D1G_R3_ARCHITECTURE.localAgent.join(" ");
  if (!controls.includes("NO_PROVIDER_SUPPLIED_PATH_READ")) gaps.push("PATH_TRAVERSAL");
  if (!controls.includes("NO_PROCESS_SPAWN")) gaps.push("UNCONTROLLED_PROCESS");
  if (!controls.includes("NO_PLUGIN_LOAD")) gaps.push("UNCONTROLLED_PLUGIN");
  if (!controls.includes("LOCALHOST_ALLOWLIST_ONLY")) gaps.push("UNTRUSTED_HOST");
  if (!controls.includes("BOUNDED_RESPONSE_BYTES")) gaps.push("UNBOUNDED_INPUT");
  if (D1G_R3_ARCHITECTURE.credentialArchitecture !== "NOT_APPLICABLE") gaps.push("CREDENTIAL_PATH");
  if (D1G_R3_SELECTION_RECORD.connectorImplemented) gaps.push("CONNECTOR_RUNTIME");
  if (D1G_R3_SELECTION_RECORD.solverExecutionInScope) gaps.push("SOLVER_EXECUTION");
  if (D1G_R3_SELECTION_RECORD.cloudSolverExecutionAssumed) gaps.push("CLOUD_SOLVER");
  if (D1G_R3_SELECTION_RECORD.r2LimitsAreProductionScale) gaps.push("R2_LIMITS_OVERSTATED");
  return { pass: gaps.length === 0, gaps };
}

export const D1G_R3_ARCHITECTURE = {
  maturity: D1G_R3_MATURITY_STATE,
  flow: [
    "PROVIDER_NATIVE_SOURCE",
    "SELECTED_PROVIDER_CONNECTOR",
    "D1G_R1_ADAPTER_CONTRACT",
    "D1G_R2_RESULT_PACKAGE_CHUNKS",
    "D1F_NORMALIZATION",
    "D1F_RESULT_AUTHORITY",
  ],
  nativeSource: "IMMUTABLE_JSON_SNAPSHOT_OF_THE_READ_ONLY_LOCAL_API_RESPONSES",
  methods: D1G_R3_CONNECTOR_API_METHODS,
  errors: D1G_R3_PROVIDER_ERROR_CODES,
  errorLayers: ["PROVIDER_FAILURE", "CONNECTOR_FAILURE", "SEMANTIC_MAPPING_FAILURE", "D1F_VALIDATION_FAILURE"],
  credentialArchitecture: "NOT_APPLICABLE",
  localAgent: [
    "EXPLICIT_USER_INITIATION",
    "LOCALHOST_ALLOWLIST_ONLY",
    "NO_PROVIDER_SUPPLIED_PATH_READ",
    "NO_PROCESS_SPAWN",
    "NO_PLUGIN_LOAD",
    "BOUNDED_RESPONSE_BYTES",
    "PRESERVED_SNAPSHOT_HANDOFF",
  ],
  network: [
    "NO_NETWORK_IN_R3",
    "R4_HOST_ALLOWLIST_LOCAL_ONLY",
    "NO_REDIRECT",
    "TIMEOUT_AND_RESPONSE_SIZE_LIMITS",
    "NO_CREDENTIAL_IN_LOGS_OR_PACKAGE",
  ],
  fingerprints: ["NATIVE_SOURCE", "CONNECTOR_EXECUTION", "MAPPING_MANIFEST", "OBJECT_MAPPING", "NEUTRAL_ADAPTER_OUTPUT", "PACKAGE_CHUNK"],
  stalenessInputs: ["NATIVE_SOURCE", "PROVIDER_VERSION", "CONNECTOR_VERSION", "MAPPING_VERSION", "OBJECT_MAPPING", "TOPOLOGY"],
  offlineFixture: "SYNTHETIC_JSON_SHAPED_LIKE_DOCUMENTED_FIELDS_NOT_A_VENDOR_SAMPLE_FILE",
} as const;
