/**
 * Phase 12I certification gates A–BW (Digital Twin External Engineering Solver).
 * Count: A–Z=26, AA–AZ=26, BA–BW=23 → 75 gates.
 */
export const PHASE_12I_DIGITAL_TWIN_EXTERNAL_SOLVER_GATES = [
  ["A", "Repository/build identity"],
  ["B", "12A regression"],
  ["C", "12B regression"],
  ["D", "12C regression"],
  ["E", "12D regression"],
  ["F", "12E regression"],
  ["G", "12F regression"],
  ["H", "12G regression"],
  ["I", "12H regression"],
  ["J", "PI V1 integrity"],
  ["K", "II V1 integrity"],
  ["L", "AI V1 integrity"],
  ["M", "PC V1 integrity"],
  ["N", "Ownership locks"],
  ["O", "Adapter contract"],
  ["P", "CalculiX adapter"],
  ["Q", "Version probe"],
  ["R", "Health check"],
  ["S", "Input/output mappers"],
  ["T", "Defaults manifest fail-closed"],
  ["U", "Benchmark definition"],
  ["V", "Negative benchmarks"],
  ["W", "No silent fallback"],
  ["X", "Qualification before real exec"],
  ["Y", "Orchestrator wiring"],
  ["Z", "Reserved solvers"],
  ["AA", "Tool registry compatibility"],
  ["AB", "License GPL metadata"],
  ["AC", "Events/lifecycle"],
  ["AD", "Prediction boundary"],
  ["AE", "SHM boundary"],
  ["AF", "Calibration reserved"],
  ["AG", "Optimization forbidden"],
  ["AH", "Actuation forbidden"],
  ["AI", "Spatial ownership unresolved"],
  ["AJ", "Native solver false"],
  ["AK", "External adapters true"],
  ["AL", "Framework ready flags"],
  ["AM", "First solver id calculix"],
  ["AN", "External solver count"],
  ["AO", "Hosted migration batch_82"],
  ["AP", "Hosted persistence"],
  ["AQ", "Events/outbox"],
  ["AR", "HTTP solver-providers"],
  ["AS", "HTTP solver-adapter-health"],
  ["AT", "HTTP solver-version"],
  ["AU", "HTTP solver-benchmarks"],
  ["AV", "HTTP solver-runs"],
  ["AW", "HTTP solver-packages"],
  ["AX", "Reject unqualified execution"],
  ["AY", "Idempotency"],
  ["AZ", "JWT/tenant isolation"],
  ["BA", "Workspace isolation"],
  ["BB", "IDOR"],
  ["BC", "Observability"],
  ["BD", "Performance"],
  ["BE", "UI external solver ready"],
  ["BF", "Browser E2E"],
  ["BG", "Accessibility"],
  ["BH", "Responsive"],
  ["BI", "Fixture vs CalculiX distinction"],
  ["BJ", "Secret exposure"],
  ["BK", "Artifact identity"],
  ["BL", "Unit tests"],
  ["BM", "Architecture tests"],
  ["BN", "CalculiX fixture present"],
  ["BO", "Docs first solver selection"],
  ["BP", "Docs adapter model"],
  ["BQ", "Docs license governance"],
  ["BR", "Docs phase 12I"],
  ["BS", "Ownership matrix updated"],
  ["BT", "Real solver hosted truthfulness"],
  ["BU", "silentSolverFallbackAllowed=false"],
  ["BV", "Phase 12J readiness flag only"],
  ["BW", "V1 tags untouched"],
] as const;

export type Phase12iGateId =
  (typeof PHASE_12I_DIGITAL_TWIN_EXTERNAL_SOLVER_GATES)[number][0];

export const PHASE_12I_GATE_COUNT =
  PHASE_12I_DIGITAL_TWIN_EXTERNAL_SOLVER_GATES.length;

export const PHASE_12I_DIGITAL_TWIN_VERSION = "0.9.0-external-solver" as const;

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

export const PHASE_12I_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12I_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12I_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12I_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12I_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12I_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12I_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12I_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12I_DIGITAL_TWIN_TABLES = [
  "digital_twin_solver_adapters",
  "digital_twin_solver_version_observations",
  "digital_twin_solver_benchmarks",
  "digital_twin_solver_benchmark_results",
  "digital_twin_solver_runs",
] as const;

export const PHASE_12I_FORBIDDEN_CAPABILITIES = [
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

export const PHASE_12I_REQUIRED_READY_FLAGS = [
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
  "PHASE_12H_READY",
  "PHASE_12I_READY",
  "PHASE_12J_READY",
] as const;
