/**
 * Phase 12J certification gates A–BZ (Digital Twin Solver Capabilities).
 * Count: A–Z=26, AA–AZ=26, BA–BZ=26 → 78 gates.
 */
export const PHASE_12J_DIGITAL_TWIN_SOLVER_CAPABILITIES_GATES = [
  ["A", "Repository/build identity"],
  ["B", "12A regression"],
  ["C", "12B regression"],
  ["D", "12C regression"],
  ["E", "12D regression"],
  ["F", "12E regression"],
  ["G", "12F regression"],
  ["H", "12G regression"],
  ["I", "12H regression"],
  ["J", "12I regression"],
  ["K", "PI V1 integrity"],
  ["L", "II V1 integrity"],
  ["M", "AI V1 integrity"],
  ["N", "PC V1 integrity"],
  ["O", "Ownership locks"],
  ["P", "Four-layer qualification intact"],
  ["Q", "CalculiX adapter intact"],
  ["R", "CalculiX linear_static only certified execution"],
  ["S", "No silent fallback"],
  ["T", "Reserved CalculiX capabilities"],
  ["U", "EngineeringSolverCapabilityRegistry"],
  ["V", "Capability metadata schema"],
  ["W", "SolverCapabilityQualification"],
  ["X", "Capability ≠ whole-solver qualification"],
  ["Y", "SolverProviderCompatibilityMatrix"],
  ["Z", "Adapter version governance"],
  ["AA", "EngineeringCapabilityDiscoveryService"],
  ["AB", "Discovery query-only (no auto-execute)"],
  ["AC", "Seed CalculiX linear_static qualified"],
  ["AD", "Seed CalculiX reserved capabilities"],
  ["AE", "Seed reserved solvers"],
  ["AF", "Simulation package capability extension"],
  ["AG", "Capability review workflow"],
  ["AH", "Capability events"],
  ["AI", "Prediction boundary"],
  ["AJ", "SHM boundary"],
  ["AK", "Calibration reserved"],
  ["AL", "Optimization forbidden"],
  ["AM", "Actuation forbidden"],
  ["AN", "Spatial ownership unresolved"],
  ["AO", "Native solver false"],
  ["AP", "External adapters true"],
  ["AQ", "Framework ready flags (12J)"],
  ["AR", "RealSolverExecutionCertified / CalculiXAdapterIntact"],
  ["AS", "silentSolverFallbackAllowed=false"],
  ["AT", "productionDigitalTwinReady=false"],
  ["AU", "Hosted migration batch_83"],
  ["AV", "Hosted persistence / RLS"],
  ["AW", "Events/outbox capability events"],
  ["AX", "HTTP solver-capabilities"],
  ["AY", "HTTP solver-capability-versions"],
  ["AZ", "HTTP solver-compatibility"],
  ["BA", "HTTP capability-discovery"],
  ["BB", "HTTP capability-qualifications/reviews"],
  ["BC", "Reject execute-on-discover"],
  ["BD", "Idempotency"],
  ["BE", "JWT/tenant isolation"],
  ["BF", "Workspace isolation"],
  ["BG", "UI solver-capabilities-ready"],
  ["BH", "Browser E2E"],
  ["BI", "Accessibility"],
  ["BJ", "Responsive"],
  ["BK", "Secret exposure"],
  ["BL", "Artifact identity"],
  ["BM", "Unit tests"],
  ["BN", "Architecture tests"],
  ["BO", "Docs capability registry"],
  ["BP", "Docs phase 12J"],
  ["BQ", "Ownership matrix updated"],
  ["BR", "batch_75–82 untouched"],
  ["BS", "CalculiX 12I evidence paths intact"],
  ["BT", "Phase 12K readiness flag only"],
  ["BU", "No domain/phase12k"],
  ["BV", "No new solver execute paths for reserved"],
  ["BW", "V1 tags untouched"],
  ["BX", "Duplicate solver ownership false"],
  ["BY", "ProviderCompatibilityMatrixReady"],
  ["BZ", "CapabilityDiscoveryReady / SimulationPackageExtended"],
] as const;

export type Phase12jGateId =
  (typeof PHASE_12J_DIGITAL_TWIN_SOLVER_CAPABILITIES_GATES)[number][0];

export const PHASE_12J_GATE_COUNT =
  PHASE_12J_DIGITAL_TWIN_SOLVER_CAPABILITIES_GATES.length;

export const PHASE_12J_DIGITAL_TWIN_VERSION = "0.10.0-solver-capabilities" as const;

export const PHASE_12A_CERTIFIED_COMMIT =
  "2c5ed03f7de12cde9bfb71a9d430f5e342291303" as const;
export const PHASE_12B_CERTIFIED_COMMIT =
  "5e1bb22486a9fdd6385fb980daf0150a330eca9b" as const;
export const PHASE_12C_CERTIFIED_COMMIT =
  "07b5ccc843395bd02633163dc654668da9f17658" as const;
export const PHASE_12D_CERTIFIED_COMMIT =
  "3e387f4b76cbd9c80b274585c7b78821482f496d" as const;
export const PHASE_12E_CERTIFIED_COMMIT =
  "b871e8c3eb9e1293604610bacdd410ecb4da5684" as const;
export const PHASE_12F_CERTIFIED_COMMIT =
  "2846421e7905a69c789a882a86da4071272278e3" as const;
export const PHASE_12G_CERTIFIED_COMMIT =
  "a3832076425b276f089e38f1c9aa76559014454c" as const;
export const PHASE_12H_CERTIFIED_COMMIT =
  "f276dbb15b3a68d2863b3547a2dc58aa1ef3afbe" as const;
export const PHASE_12H_HOSTED_RUN = "31263802033" as const;
export const PHASE_12H_VERSION = "0.8.0-simulation-assurance" as const;
export const PHASE_12I_CERTIFIED_COMMIT =
  "6989d310a91b04db5949954a57db060782dd8dec" as const;
export const PHASE_12I_HOSTED_RUN = "31265781321" as const;
export const PHASE_12I_VERSION = "0.9.0-external-solver" as const;

export const PHASE_12J_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12J_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12J_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12J_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12J_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12J_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12J_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12J_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12J_DIGITAL_TWIN_TABLES = [
  "digital_twin_solver_capabilities",
  "digital_twin_solver_capability_versions",
  "digital_twin_solver_provider_compatibility",
  "digital_twin_solver_capability_qualifications",
  "digital_twin_solver_adapter_versions",
] as const;

export const PHASE_12J_FORBIDDEN_CAPABILITIES = [
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
  "DUPLICATE_SOLVER_OWNERSHIP_DETECTED",
  "SPATIAL_OWNERSHIP_FULLY_RESOLVED",
  "SILENT_SOLVER_FALLBACK_ALLOWED",
] as const;

export const PHASE_12J_REQUIRED_READY_FLAGS = [
  "TWIN_SIMULATION_FRAMEWORK_READY",
  "SIMULATION_METHOD_QUALIFICATION_READY",
  "SIMULATION_PROVIDER_QUALIFICATION_READY",
  "SIMULATION_APPLICATION_QUALIFICATION_READY",
  "SIMULATION_EXECUTION_QUALIFICATION_READY",
  "SIMULATION_QUALIFICATION_ELIGIBILITY_READY",
  "TWIN_SIMULATION_PACKAGE_READY",
  "SIMULATION_PACKAGE_INTEGRITY_READY",
  "SIMULATION_REPRODUCIBILITY_READY",
  "EXTERNAL_SOLVER_ADAPTER_FRAMEWORK_READY",
  "FIRST_REAL_ENGINEERING_SOLVER_ADAPTER_IMPLEMENTED",
  "FIRST_REAL_ENGINEERING_SOLVER_METHOD_CERTIFIED",
  "EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED",
  "SOLVER_CAPABILITY_REGISTRY_READY",
  "PROVIDER_COMPATIBILITY_MATRIX_READY",
  "CAPABILITY_DISCOVERY_READY",
  "SIMULATION_PACKAGE_EXTENDED",
  "FOUR_LAYER_QUALIFICATION_INTACT",
  "REAL_SOLVER_EXECUTION_CERTIFIED",
  "CALCULIX_ADAPTER_INTACT",
  "PHASE_12H_READY",
  "PHASE_12I_READY",
  "PHASE_12J_READY",
  "PHASE_12K_READY",
] as const;
