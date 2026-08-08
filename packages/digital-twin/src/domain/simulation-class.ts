/**
 * Phase 12G — Simulation class taxonomy (classification only).
 *
 * Classification ≠ solver capability. Declaring a class does not imply a native
 * FEA/CFD/physics engine exists.
 */

export const SIMULATION_CLASSES = [
  "structural",
  "thermal",
  "fluid",
  "electrical",
  "geotechnical",
  "process",
  "operational_scenario",
  "other",
] as const;

export type SimulationClass = (typeof SIMULATION_CLASSES)[number];

export function assertSimulationClass(value: string): SimulationClass {
  if (!SIMULATION_CLASSES.includes(value as SimulationClass)) {
    throw new Error(`unsupported_simulation_class:${value}`);
  }
  return value as SimulationClass;
}

/** Terminology lock: simulation is not observation, measurement, or prediction. */
export const SIMULATION_TERMINOLOGY_LOCK = {
  simulationNeqObservation: true,
  simulationNeqMeasurement: true,
  simulationNeqPrediction: true,
  scenarioNeqForecast: true,
  resultNeqApproval: true,
  successfulExecutionNeqEngineeringAcceptance: true,
} as const;

export function assertSimulationTerminologyLock(): typeof SIMULATION_TERMINOLOGY_LOCK {
  return SIMULATION_TERMINOLOGY_LOCK;
}
