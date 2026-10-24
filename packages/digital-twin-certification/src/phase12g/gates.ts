/**
 * Phase 12G certification gates A–BS (Digital Twin Simulation Governance).
 * 71 gates covering simulation domain, firewall, persistence, HTTP, UI, and Phase 12H readiness.
 */
export const PHASE_12G_DIGITAL_TWIN_SIMULATION_GATES = [
  ["A", "Repository/build identity"],
  ["B", "12A regression"],
  ["C", "12B regression"],
  ["D", "12C regression"],
  ["E", "12D regression"],
  ["F", "12E regression"],
  ["G", "12F regression"],
  ["H", "PI V1 integrity"],
  ["I", "II V1 integrity"],
  ["J", "AI V1 integrity"],
  ["K", "PC V1 integrity"],
  ["L", "Ownership locks"],
  ["M", "Simulation terminology"],
  ["N", "Simulation classification"],
  ["O", "Method Registry"],
  ["P", "Provider Registry"],
  ["Q", "Engineering Tool compatibility"],
  ["R", "Simulation Definition"],
  ["S", "Scenario model"],
  ["T", "Input Set immutability"],
  ["U", "Representation pinning"],
  ["V", "State pinning"],
  ["W", "Telemetry/time-series boundary"],
  ["X", "Unit governance"],
  ["Y", "Execution request"],
  ["Z", "Orchestrator"],
  ["AA", "Sandbox/safety"],
  ["AB", "Result model"],
  ["AC", "Result artifacts"],
  ["AD", "Validation"],
  ["AE", "Method qualification"],
  ["AF", "Governed review"],
  ["AG", "Simulated Twin State"],
  ["AH", "State semantic firewall"],
  ["AI", "Twin Snapshot"],
  ["AJ", "Timeline"],
  ["AK", "Digital Thread"],
  ["AL", "Knowledge Graph reuse"],
  ["AM", "Scenario comparison"],
  ["AN", "Prediction boundary"],
  ["AO", "Asset Intelligence boundary"],
  ["AP", "Project Controls boundary"],
  ["AQ", "SHM boundary"],
  ["AR", "Calibration reserved"],
  ["AS", "AI governance"],
  ["AT", "Hosted migration"],
  ["AU", "Hosted persistence"],
  ["AV", "Events/outbox"],
  ["AW", "HTTP contracts"],
  ["AX", "Idempotency"],
  ["AY", "Concurrency"],
  ["AZ", "JWT"],
  ["BA", "Tenant isolation"],
  ["BB", "Workspace isolation"],
  ["BC", "IDOR"],
  ["BD", "Observability"],
  ["BE", "Performance"],
  ["BF", "UI"],
  ["BG", "Browser E2E"],
  ["BH", "Accessibility"],
  ["BI", "Responsive"],
  ["BJ", "Provider fail-closed"],
  ["BK", "No native solver"],
  ["BL", "No optimization"],
  ["BM", "No prediction"],
  ["BN", "No SHM"],
  ["BO", "No actuation"],
  ["BP", "No duplicate tool framework"],
  ["BQ", "Secret exposure"],
  ["BR", "Artifact identity"],
  ["BS", "Phase 12H readiness"],
] as const;

export type Phase12gGateId = (typeof PHASE_12G_DIGITAL_TWIN_SIMULATION_GATES)[number][0];

export const PHASE_12G_GATE_COUNT = PHASE_12G_DIGITAL_TWIN_SIMULATION_GATES.length;

export const PHASE_12G_DIGITAL_TWIN_VERSION = "0.7.0-simulation" as const;

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

export const PHASE_12G_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12G_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12G_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12G_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12G_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12G_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12G_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12G_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12G_DIGITAL_TWIN_TABLES = [
  "digital_twin_simulation_methods",
  "digital_twin_simulation_providers",
  "digital_twin_simulation_definitions",
  "digital_twin_simulation_scenarios",
  "digital_twin_simulation_input_sets",
  "digital_twin_simulation_runs",
  "digital_twin_simulation_results",
  "digital_twin_simulation_validation",
  "digital_twin_simulated_states",
  "digital_twin_simulation_reviews",
] as const;

export const PHASE_12G_FORBIDDEN_CAPABILITIES = [
  "NATIVE_ENGINEERING_SOLVER_IMPLEMENTED",
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
] as const;

export const PHASE_12G_REQUIRED_READY_FLAGS = [
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
  "SIMULATION_EXECUTION_IMPLEMENTED",
  "PHASE_12H_READY",
] as const;
