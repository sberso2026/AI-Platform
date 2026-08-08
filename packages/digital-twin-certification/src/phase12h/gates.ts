/**
 * Phase 12H certification gates A–BR (Digital Twin Simulation Assurance).
 * 70 gates covering qualification layers, packages, firewall, persistence, HTTP, UI, Phase 12I readiness.
 */
export const PHASE_12H_DIGITAL_TWIN_SIMULATION_ASSURANCE_GATES = [
  ["A", "Repository/build identity"],
  ["B", "12A regression"],
  ["C", "12B regression"],
  ["D", "12C regression"],
  ["E", "12D regression"],
  ["F", "12E regression"],
  ["G", "12F regression"],
  ["H", "12G regression"],
  ["I", "PI V1 integrity"],
  ["J", "II V1 integrity"],
  ["K", "AI V1 integrity"],
  ["L", "PC V1 integrity"],
  ["M", "Ownership locks"],
  ["N", "Qualification terminology"],
  ["O", "Method Qualification"],
  ["P", "Provider Qualification"],
  ["Q", "Application Qualification"],
  ["R", "Execution Qualification"],
  ["S", "Eligibility Engine"],
  ["T", "Expiry/revocation"],
  ["U", "Conflict detection"],
  ["V", "Compatibility matrix"],
  ["W", "Simulation Package"],
  ["X", "Package Manifest"],
  ["Y", "Package Integrity"],
  ["Z", "Package Completeness"],
  ["AA", "Material/Section/Property refs"],
  ["AB", "Boundary/Load/Discretization refs"],
  ["AC", "Execution environment metadata"],
  ["AD", "Reproducibility Assessment"],
  ["AE", "Validation/review package refs"],
  ["AF", "Simulated State package link"],
  ["AG", "Digital Thread package"],
  ["AH", "Knowledge Graph package"],
  ["AI", "Review workflows"],
  ["AJ", "External solver adapter reservation"],
  ["AK", "Events/lifecycle"],
  ["AL", "Orchestrator eligibility gate"],
  ["AM", "Prediction boundary"],
  ["AN", "Asset Intelligence boundary"],
  ["AO", "Project Controls boundary"],
  ["AP", "SHM boundary"],
  ["AQ", "Calibration reserved"],
  ["AR", "AI governance"],
  ["AS", "Hosted migration"],
  ["AT", "Hosted persistence"],
  ["AU", "Events/outbox"],
  ["AV", "HTTP contracts"],
  ["AW", "Idempotency"],
  ["AX", "Concurrency"],
  ["AY", "JWT"],
  ["AZ", "Tenant isolation"],
  ["BA", "Workspace isolation"],
  ["BB", "IDOR"],
  ["BC", "Observability"],
  ["BD", "Performance"],
  ["BE", "UI"],
  ["BF", "Browser E2E"],
  ["BG", "Accessibility"],
  ["BH", "Responsive"],
  ["BI", "No native solver"],
  ["BJ", "No external solver adapters"],
  ["BK", "No optimization"],
  ["BL", "No prediction"],
  ["BM", "No SHM"],
  ["BN", "No actuation"],
  ["BO", "No spatial ownership claim"],
  ["BP", "Secret exposure"],
  ["BQ", "Artifact identity"],
  ["BR", "Phase 12I readiness"],
] as const;

export type Phase12hGateId =
  (typeof PHASE_12H_DIGITAL_TWIN_SIMULATION_ASSURANCE_GATES)[number][0];

export const PHASE_12H_GATE_COUNT =
  PHASE_12H_DIGITAL_TWIN_SIMULATION_ASSURANCE_GATES.length;

export const PHASE_12H_DIGITAL_TWIN_VERSION = "0.8.0-simulation-assurance" as const;

export const PHASE_12A_CERTIFIED_COMMIT =
  "2c5ed03f7de12cde9bfb71a9d430f5e342291303" as const;
export const PHASE_12A_HOSTED_RUN = "31253197987" as const;
export const PHASE_12A_VERSION = "0.1.0-discovery" as const;

export const PHASE_12B_CERTIFIED_COMMIT =
  "5e1bb22486a9fdd6385fb980daf0150a330eca9b" as const;
export const PHASE_12B_HOSTED_RUN = "31255221472" as const;
export const PHASE_12B_VERSION = "0.2.0-core" as const;

export const PHASE_12C_CERTIFIED_COMMIT =
  "07b5ccc843395bd02633163dc654668da9f17658" as const;
export const PHASE_12C_HOSTED_RUN = "31256556800" as const;
export const PHASE_12C_VERSION = "0.3.0-state" as const;

export const PHASE_12D_CERTIFIED_COMMIT =
  "3e387f4b76cbd9c80b274585c7b78821482f496d" as const;
export const PHASE_12D_HOSTED_RUN = "31257741414" as const;
export const PHASE_12D_VERSION = "0.4.0-ingestion" as const;

export const PHASE_12E_CERTIFIED_COMMIT =
  "b871e8c3eb9e1293604610bacdd410ecb4da5684" as const;
export const PHASE_12E_HOSTED_RUN = "31260082507" as const;
export const PHASE_12E_VERSION = "0.5.0-telemetry-binding" as const;

export const PHASE_12F_CERTIFIED_COMMIT =
  "2846421e7905a69c789a882a86da4071272278e3" as const;
export const PHASE_12F_HOSTED_RUN = "31261555990" as const;
export const PHASE_12F_VERSION = "0.6.0-representation" as const;

export const PHASE_12G_CERTIFIED_COMMIT =
  "a3832076425b276f089e38f1c9aa76559014454c" as const;
export const PHASE_12G_HOSTED_RUN = "31262355460" as const;
export const PHASE_12G_VERSION = "0.7.0-simulation" as const;

export const PHASE_12H_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12H_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12H_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12H_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12H_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12H_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12H_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12H_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12H_DIGITAL_TWIN_TABLES = [
  "digital_twin_method_qualifications",
  "digital_twin_provider_qualifications",
  "digital_twin_application_qualifications",
  "digital_twin_execution_qualifications",
  "digital_twin_simulation_packages",
  "digital_twin_simulation_package_versions",
  "digital_twin_simulation_package_artifacts",
  "digital_twin_simulation_package_integrity",
  "digital_twin_simulation_reproducibility",
] as const;

export const PHASE_12H_FORBIDDEN_CAPABILITIES = [
  "NATIVE_ENGINEERING_SOLVER_IMPLEMENTED",
  "EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED",
  "SIMULATION_OPTIMIZATION_IMPLEMENTED",
  "AUTOMATIC_SIMULATION_APPROVAL_ENABLED",
  "AUTOMATIC_SIMULATION_CALIBRATION_ENABLED",
  "PREDICTIVE_TWIN_IMPLEMENTED",
  "PROBABILISTIC_PREDICTION_IMPLEMENTED",
  "RUL_PREDICTION_IMPLEMENTED",
  "POF_PREDICTION_IMPLEMENTED",
  "HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED",
  "TELEMETRY_HISTORIAN_IMPLEMENTED",
  "SENSOR_REGISTRY_IMPLEMENTED",
  "SHM_SIGNAL_PROCESSING_IMPLEMENTED",
  "SHM_RUNTIME_IMPLEMENTED",
  "SHM_SIMULATION_CALIBRATION_IMPLEMENTED",
  "THREE_D_VIEWER_IMPLEMENTED",
  "PHYSICAL_ACTUATION_ENABLED",
  "AUTOMATIC_CONTROL_ENABLED",
  "PRODUCTION_DIGITAL_TWIN_READY",
  "DUPLICATE_TIME_SERIES_PLANE_DETECTED",
  "DUPLICATE_MODEL_OWNERSHIP_DETECTED",
  "DUPLICATE_ENGINEERING_TOOL_FRAMEWORK_DETECTED",
  "SPATIAL_OWNERSHIP_FULLY_RESOLVED",
] as const;

export const PHASE_12H_REQUIRED_READY_FLAGS = [
  "TWIN_IDENTITY_READY",
  "TWIN_REPRESENTATION_READY",
  "TWIN_THREAD_READY",
  "TWIN_STATE_READY",
  "TWIN_VERSIONING_READY",
  "REPRESENTATION_VERSIONING_READY",
  "TWIN_SNAPSHOT_READY",
  "TWIN_TIMELINE_READY",
  "TWIN_STATE_INGESTION_READY",
  "TWIN_SOURCE_ADAPTER_READY",
  "TWIN_STATE_RECONCILIATION_READY",
  "TWIN_TELEMETRY_BINDING_READY",
  "TWIN_TELEMETRY_PROJECTION_READY",
  "ENGINEERING_TIME_SERIES_REUSE_READY",
  "TWIN_REPRESENTATION_MAPPING_READY",
  "TWIN_REPRESENTATION_NAVIGATION_READY",
  "TWIN_SIMULATION_FRAMEWORK_READY",
  "TWIN_SIMULATION_METHOD_REGISTRY_READY",
  "TWIN_SIMULATION_PROVIDER_REGISTRY_READY",
  "TWIN_SIMULATED_STATE_READY",
  "SIMULATION_METHOD_QUALIFICATION_READY",
  "SIMULATION_PROVIDER_QUALIFICATION_READY",
  "SIMULATION_APPLICATION_QUALIFICATION_READY",
  "SIMULATION_EXECUTION_QUALIFICATION_READY",
  "SIMULATION_QUALIFICATION_ELIGIBILITY_READY",
  "TWIN_SIMULATION_PACKAGE_READY",
  "SIMULATION_PACKAGE_INTEGRITY_READY",
  "SIMULATION_REPRODUCIBILITY_READY",
  "SIMULATION_EXECUTION_IMPLEMENTED",
  "PHASE_12I_READY",
] as const;
