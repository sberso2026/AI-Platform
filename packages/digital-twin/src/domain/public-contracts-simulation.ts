/**
 * Phase 12I — Digital Twin external solver public contracts
 * (0.10.0-solver-capabilities-draft).
 */

import {
  NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
  EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED,
  PUBLIC_CONTRACT_VERSION,
  SIMULATION_EXECUTION_IMPLEMENTED,
  SIMULATION_OPTIMIZATION_IMPLEMENTED,
  AUTOMATIC_SIMULATION_APPROVAL_ENABLED,
  PREDICTIVE_TWIN_IMPLEMENTED,
  SIMULATION_METHOD_QUALIFICATION_READY,
  SIMULATION_QUALIFICATION_ELIGIBILITY_READY,
  TWIN_SIMULATION_PACKAGE_READY,
  SILENT_SOLVER_FALLBACK_ALLOWED,
  FIRST_REAL_ENGINEERING_SOLVER_ADAPTER_IMPLEMENTED,
  EXTERNAL_SOLVER_ADAPTER_FRAMEWORK_READY,
} from "../version";

export const SIMULATION_CONTRACT_FAMILIES = [
  "TwinSimulationMethodCore",
  "TwinSimulationProviderCore",
  "TwinSimulationDefinitionCore",
  "TwinSimulationScenarioCore",
  "TwinSimulationInputSetCore",
  "TwinSimulationExecutionCore",
  "TwinSimulationResultCore",
  "TwinSimulatedStateCore",
  "TwinSimulationScenarioComparisonCore",
  "SimulationMethodQualificationCore",
  "SimulationProviderQualificationCore",
  "SimulationApplicationQualificationCore",
  "SimulationExecutionQualificationCore",
  "SimulationQualificationEligibilityCore",
  "TwinSimulationPackageCore",
  "SimulationPackageIntegrityCore",
  "SimulationReproducibilityCore",
  "EngineeringSolverAdapterCore",
  "SolverBenchmarkCore",
  "SolverExecutionDefaultsManifestCore",
] as const;

export type SimulationContractFamily = (typeof SIMULATION_CONTRACT_FAMILIES)[number];

export const SIMULATION_QUALIFICATION_TERMINOLOGY_LOCK = {
  registeredNotEqualQualified: true,
  qualifiedNotEqualApplicationQualified: true,
  applicationQualifiedNotEqualExecutionQualified: true,
  executionQualifiedNotEqualEngineeringApproved: true,
  successfulRunNotEqualValidated: true,
  validatedNotEqualUniversallyAccurate: true,
} as const;

export function assertSimulationQualificationTerminologyLock(): {
  ok: true;
  lock: typeof SIMULATION_QUALIFICATION_TERMINOLOGY_LOCK;
} {
  return { ok: true, lock: SIMULATION_QUALIFICATION_TERMINOLOGY_LOCK };
}

export function assertSimulationContracts(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
} {
  if (PUBLIC_CONTRACT_VERSION !== "0.10.0-solver-capabilities-draft") {
    throw new Error("simulation_contracts_require_0_10_0_solver_capabilities_draft");
  }
  return { ok: true, contractVersion: PUBLIC_CONTRACT_VERSION };
}

export function assertSimulationForbiddenCapabilities(): {
  ok: true;
  simulationExecutionImplemented: true;
  nativeEngineeringSolverImplemented: false;
  externalEngineeringSolverAdaptersImplemented: true;
  silentSolverFallbackAllowed: false;
  simulationOptimizationImplemented: false;
  automaticSimulationApprovalEnabled: false;
  predictiveTwinImplemented: false;
} {
  if (!SIMULATION_EXECUTION_IMPLEMENTED) {
    throw new Error("bounded_simulation_execution_required");
  }
  if (NATIVE_ENGINEERING_SOLVER_IMPLEMENTED) {
    throw new Error("native_engineering_solver_forbidden");
  }
  if (!EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED) {
    throw new Error("external_engineering_solver_adapters_required");
  }
  if (!EXTERNAL_SOLVER_ADAPTER_FRAMEWORK_READY || !FIRST_REAL_ENGINEERING_SOLVER_ADAPTER_IMPLEMENTED) {
    throw new Error("first_real_solver_adapter_required");
  }
  if (SILENT_SOLVER_FALLBACK_ALLOWED) {
    throw new Error("silent_solver_fallback_forbidden");
  }
  if (SIMULATION_OPTIMIZATION_IMPLEMENTED) {
    throw new Error("simulation_optimization_forbidden");
  }
  if (AUTOMATIC_SIMULATION_APPROVAL_ENABLED) {
    throw new Error("automatic_simulation_approval_forbidden");
  }
  if (PREDICTIVE_TWIN_IMPLEMENTED) {
    throw new Error("predictive_twin_forbidden");
  }
  if (!SIMULATION_METHOD_QUALIFICATION_READY || !SIMULATION_QUALIFICATION_ELIGIBILITY_READY) {
    throw new Error("simulation_assurance_capabilities_required");
  }
  if (!TWIN_SIMULATION_PACKAGE_READY) {
    throw new Error("twin_simulation_package_required");
  }
  return {
    ok: true,
    simulationExecutionImplemented: true,
    nativeEngineeringSolverImplemented: false,
    externalEngineeringSolverAdaptersImplemented: true,
    silentSolverFallbackAllowed: false,
    simulationOptimizationImplemented: false,
    automaticSimulationApprovalEnabled: false,
    predictiveTwinImplemented: false,
  };
}
