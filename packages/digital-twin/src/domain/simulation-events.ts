/**
 * Phase 12G — Simulation domain events (identifiers / refs only — no large payloads).
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
] as const;

export type SimulationDomainEvent = (typeof SIMULATION_DOMAIN_EVENTS)[number];

export function assertSimulationEventNoLargePayload(payload: Record<string, unknown>): void {
  const serialized = JSON.stringify(payload);
  if (serialized.length > 8_192) {
    throw new Error("simulation_event_payload_too_large");
  }
  if ("solverBinary" in payload || "meshPayload" in payload || "geometryPayload" in payload) {
    throw new Error("simulation_event_must_not_carry_solver_artifacts");
  }
}
