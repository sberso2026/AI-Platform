/**
 * Phase 12G — Digital Twin simulation public contracts (0.7.0-simulation-draft).
 */

import {
  NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
  PUBLIC_CONTRACT_VERSION,
  SIMULATION_EXECUTION_IMPLEMENTED,
  SIMULATION_OPTIMIZATION_IMPLEMENTED,
  AUTOMATIC_SIMULATION_APPROVAL_ENABLED,
  PREDICTIVE_TWIN_IMPLEMENTED,
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
] as const;

export type SimulationContractFamily = (typeof SIMULATION_CONTRACT_FAMILIES)[number];

export function assertSimulationContracts(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
} {
  if (PUBLIC_CONTRACT_VERSION !== "0.7.0-simulation-draft") {
    throw new Error("simulation_contracts_require_0_7_0_simulation_draft");
  }
  return { ok: true, contractVersion: PUBLIC_CONTRACT_VERSION };
}

export function assertSimulationForbiddenCapabilities(): {
  ok: true;
  simulationExecutionImplemented: true;
  nativeEngineeringSolverImplemented: false;
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
  if (SIMULATION_OPTIMIZATION_IMPLEMENTED) {
    throw new Error("simulation_optimization_forbidden");
  }
  if (AUTOMATIC_SIMULATION_APPROVAL_ENABLED) {
    throw new Error("automatic_simulation_approval_forbidden");
  }
  if (PREDICTIVE_TWIN_IMPLEMENTED) {
    throw new Error("predictive_twin_forbidden");
  }
  return {
    ok: true,
    simulationExecutionImplemented: true,
    nativeEngineeringSolverImplemented: false,
    simulationOptimizationImplemented: false,
    automaticSimulationApprovalEnabled: false,
    predictiveTwinImplemented: false,
  };
}
