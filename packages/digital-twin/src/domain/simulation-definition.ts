/**
 * Phase 12G — TwinSimulationDefinition (versioned) and TwinSimulationScenario.
 *
 * Scenarios are hypothetical — they must never overwrite observed twin state.
 */

import type { SimulationClass } from "./simulation-class";
import { assertSimulationClass } from "./simulation-class";

export const SIMULATION_DEFINITION_STATUSES = [
  "draft",
  "registered",
  "versioned",
  "superseded",
  "retired",
] as const;

export type SimulationDefinitionStatus = (typeof SIMULATION_DEFINITION_STATUSES)[number];

export type TwinSimulationDefinition = {
  definitionId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  definitionKey: string;
  displayName: string;
  simulationClass: SimulationClass;
  methodId: string;
  providerId: string;
  version: number;
  status: SimulationDefinitionStatus;
  /** Simulation-ready context declaration — does NOT auto-promote representation to L4/L5. */
  simulationReadyContextDeclared: boolean;
  claimsRepresentationFidelityL4OrL5: false;
  applicabilityNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export function createTwinSimulationDefinition(input: {
  definitionId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  definitionKey: string;
  displayName: string;
  simulationClass: string;
  methodId: string;
  providerId: string;
  simulationReadyContextDeclared?: boolean;
  createdBy?: string;
}): TwinSimulationDefinition {
  const now = new Date().toISOString();
  return {
    definitionId: input.definitionId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    definitionKey: input.definitionKey,
    displayName: input.displayName,
    simulationClass: assertSimulationClass(input.simulationClass),
    methodId: input.methodId,
    providerId: input.providerId,
    version: 1,
    status: "draft",
    simulationReadyContextDeclared: input.simulationReadyContextDeclared ?? false,
    claimsRepresentationFidelityL4OrL5: false,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export const SIMULATION_SCENARIO_STATUSES = [
  "draft",
  "registered",
  "active",
  "archived",
] as const;

export type SimulationScenarioStatus = (typeof SIMULATION_SCENARIO_STATUSES)[number];

export type TwinSimulationScenario = {
  scenarioId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  definitionId: string;
  scenarioKey: string;
  displayName: string;
  status: SimulationScenarioStatus;
  hypothesisNotes?: string;
  /** Scenarios cannot overwrite observed/derived/operational state. */
  mayOverwriteObservedState: false;
  isForecast: false;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export function createTwinSimulationScenario(input: {
  scenarioId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  definitionId: string;
  scenarioKey: string;
  displayName: string;
  hypothesisNotes?: string;
  createdBy?: string;
}): TwinSimulationScenario {
  const now = new Date().toISOString();
  return {
    scenarioId: input.scenarioId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    definitionId: input.definitionId,
    scenarioKey: input.scenarioKey,
    displayName: input.displayName,
    status: "draft",
    hypothesisNotes: input.hypothesisNotes,
    mayOverwriteObservedState: false,
    isForecast: false,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function assertScenarioCannotOverwriteObserved(scenario: TwinSimulationScenario): void {
  if (scenario.mayOverwriteObservedState) {
    throw new Error("scenario_may_not_overwrite_observed_state");
  }
  if (scenario.isForecast) {
    throw new Error("scenario_is_not_forecast");
  }
}
