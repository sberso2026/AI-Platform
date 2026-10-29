/**
 * Phase 12G/12H — Simulation domain events (identifiers / refs only — no large payloads).
 */

export const SIMULATION_DOMAIN_EVENTS = [
  "engineering.digital_twin.simulation.method.registered",
  "engineering.digital_twin.simulation.provider.registered",
  "engineering.digital_twin.simulation.definition.versioned",
  "engineering.digital_twin.simulation.scenario.created",
  "engineering.digital_twin.simulation.input_set.frozen",
  "engineering.digital_twin.simulation.run.started",
  "engineering.digital_twin.simulation.run.succeeded",
  "engineering.digital_twin.simulation.run.failed",
  "engineering.digital_twin.simulation.result.persisted",
  "engineering.digital_twin.simulation.validation.updated",
  "engineering.digital_twin.simulation.review.submitted",
  "engineering.digital_twin.simulation.review.decided",
  "engineering.digital_twin.simulated_state.published",
  "engineering.digital_twin.simulation.method_qualification.activated",
  "engineering.digital_twin.simulation.method_qualification.revoked",
  "engineering.digital_twin.simulation.provider_qualification.activated",
  "engineering.digital_twin.simulation.provider_qualification.revoked",
  "engineering.digital_twin.simulation.application_qualification.activated",
  "engineering.digital_twin.simulation.application_qualification.revoked",
  "engineering.digital_twin.simulation.execution_qualification.issued",
  "engineering.digital_twin.simulation.execution_qualification.revoked",
  "engineering.digital_twin.simulation.package.assembled",
  "engineering.digital_twin.simulation.package.sealed",
  "engineering.digital_twin.simulation.package.integrity_checked",
  "engineering.digital_twin.simulation.reproducibility.assessed",
  "engineering.digital_twin.simulation.eligibility.assessed",
  "engineering.digital_twin.solver.adapter.registered",
  "engineering.digital_twin.solver.version.probed",
  "engineering.digital_twin.solver.health.checked",
  "engineering.digital_twin.solver.run.started",
  "engineering.digital_twin.solver.run.completed",
  "engineering.digital_twin.solver.run.failed",
  "engineering.digital_twin.solver.run.timeout",
  "engineering.digital_twin.solver.run.cancelled",
  "engineering.digital_twin.solver.benchmark.executed",
  "engineering.solver.capability.registered",
  "engineering.solver.capability.qualified",
  "engineering.solver.capability.revoked",
  "engineering.solver.provider.updated",
] as const;

export const SIMULATION_ASSURANCE_DOMAIN_EVENTS = [
  "engineering.digital_twin.simulation.method_qualification.activated",
  "engineering.digital_twin.simulation.method_qualification.revoked",
  "engineering.digital_twin.simulation.provider_qualification.activated",
  "engineering.digital_twin.simulation.provider_qualification.revoked",
  "engineering.digital_twin.simulation.application_qualification.activated",
  "engineering.digital_twin.simulation.application_qualification.revoked",
  "engineering.digital_twin.simulation.execution_qualification.issued",
  "engineering.digital_twin.simulation.execution_qualification.revoked",
  "engineering.digital_twin.simulation.package.assembled",
  "engineering.digital_twin.simulation.package.sealed",
  "engineering.digital_twin.simulation.package.integrity_checked",
  "engineering.digital_twin.simulation.reproducibility.assessed",
  "engineering.digital_twin.simulation.eligibility.assessed",
] as const;

export const SOLVER_DOMAIN_EVENTS = [
  "engineering.digital_twin.solver.adapter.registered",
  "engineering.digital_twin.solver.version.probed",
  "engineering.digital_twin.solver.health.checked",
  "engineering.digital_twin.solver.run.started",
  "engineering.digital_twin.solver.run.completed",
  "engineering.digital_twin.solver.run.failed",
  "engineering.digital_twin.solver.run.timeout",
  "engineering.digital_twin.solver.run.cancelled",
  "engineering.digital_twin.solver.benchmark.executed",
] as const;

/** Phase 12J — capability registry events (identifiers only). */
export const SOLVER_CAPABILITY_DOMAIN_EVENTS = [
  "engineering.solver.capability.registered",
  "engineering.solver.capability.qualified",
  "engineering.solver.capability.revoked",
  "engineering.solver.provider.updated",
] as const;

export type SimulationDomainEvent = (typeof SIMULATION_DOMAIN_EVENTS)[number];
export type SolverDomainEvent = (typeof SOLVER_DOMAIN_EVENTS)[number];
export type SolverCapabilityDomainEvent =
  (typeof SOLVER_CAPABILITY_DOMAIN_EVENTS)[number];

export function assertSimulationEventNoLargePayload(payload: Record<string, unknown>): void {
  const serialized = JSON.stringify(payload);
  if (serialized.length > 8_192) {
    throw new Error("simulation_event_payload_too_large");
  }
  if ("solverBinary" in payload || "meshPayload" in payload || "geometryPayload" in payload) {
    throw new Error("simulation_event_must_not_carry_solver_artifacts");
  }
}
