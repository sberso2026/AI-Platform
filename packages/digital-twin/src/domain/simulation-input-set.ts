/**
 * Phase 12G — TwinSimulationInputSet.
 *
 * Immutable after run starts. contentHash pins representation + published Twin state versions.
 * Telemetry/time-series refs are windows only (no historian).
 */

import { createHash } from "node:crypto";
import {
  assertQuantitativeUnits,
  type EngineeringUnitCode,
  type EngineeringUnitSystem,
} from "./unit-governance";
import { SIMULATION_USES_PUBLISHED_STATE_ONLY } from "../version";

export type SimulationTelemetryWindowRef = {
  timeSeriesRef: string;
  windowStart: string;
  windowEnd: string;
  /** Window refs only — Twin does not own a historian. */
  storesHistorianPayload: false;
};

export type TwinSimulationInputSet = {
  inputSetId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  scenarioId: string;
  definitionId: string;
  contentHash: string;
  representationVersionPins: string[];
  publishedStateVersionPins: string[];
  telemetryWindowRefs: SimulationTelemetryWindowRef[];
  unitSystem?: EngineeringUnitSystem;
  unitCode?: EngineeringUnitCode;
  parameters: Record<string, unknown>;
  simulationUsesPublishedStateOnly: true;
  immutable: boolean;
  frozenAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export function computeInputSetContentHash(input: {
  scenarioId: string;
  definitionId: string;
  representationVersionPins: string[];
  publishedStateVersionPins: string[];
  telemetryWindowRefs: SimulationTelemetryWindowRef[];
  parameters: Record<string, unknown>;
  unitSystem?: string;
  unitCode?: string;
}): string {
  const canonical = JSON.stringify({
    scenarioId: input.scenarioId,
    definitionId: input.definitionId,
    representationVersionPins: [...input.representationVersionPins].sort(),
    publishedStateVersionPins: [...input.publishedStateVersionPins].sort(),
    telemetryWindowRefs: input.telemetryWindowRefs,
    parameters: input.parameters,
    unitSystem: input.unitSystem ?? null,
    unitCode: input.unitCode ?? null,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export function createTwinSimulationInputSet(input: {
  inputSetId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  scenarioId: string;
  definitionId: string;
  representationVersionPins: string[];
  publishedStateVersionPins: string[];
  telemetryWindowRefs?: SimulationTelemetryWindowRef[];
  parameters?: Record<string, unknown>;
  hasQuantitativeValue?: boolean;
  unitSystem?: string;
  unitCode?: string;
  createdBy?: string;
}): TwinSimulationInputSet {
  if (!SIMULATION_USES_PUBLISHED_STATE_ONLY) {
    throw new Error("simulation_must_use_published_state_only");
  }
  if (input.publishedStateVersionPins.length === 0) {
    throw new Error("published_state_version_pins_required");
  }
  if (input.representationVersionPins.length === 0) {
    throw new Error("representation_version_pins_required");
  }
  const units = assertQuantitativeUnits({
    hasQuantitativeValue: input.hasQuantitativeValue ?? false,
    unitSystem: input.unitSystem,
    unitCode: input.unitCode,
  });
  const parameters = input.parameters ?? {};
  const telemetryWindowRefs = (input.telemetryWindowRefs ?? []).map((w) => ({
    ...w,
    storesHistorianPayload: false as const,
  }));
  const contentHash = computeInputSetContentHash({
    scenarioId: input.scenarioId,
    definitionId: input.definitionId,
    representationVersionPins: input.representationVersionPins,
    publishedStateVersionPins: input.publishedStateVersionPins,
    telemetryWindowRefs,
    parameters,
    unitSystem: units?.unitSystem,
    unitCode: units?.unitCode,
  });
  const now = new Date().toISOString();
  return {
    inputSetId: input.inputSetId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    scenarioId: input.scenarioId,
    definitionId: input.definitionId,
    contentHash,
    representationVersionPins: [...input.representationVersionPins],
    publishedStateVersionPins: [...input.publishedStateVersionPins],
    telemetryWindowRefs,
    unitSystem: units?.unitSystem,
    unitCode: units?.unitCode,
    parameters,
    simulationUsesPublishedStateOnly: true,
    immutable: false,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function freezeInputSet(inputSet: TwinSimulationInputSet): TwinSimulationInputSet {
  if (inputSet.immutable) return inputSet;
  return {
    ...inputSet,
    immutable: true,
    frozenAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function assertInputSetMutable(inputSet: TwinSimulationInputSet): void {
  if (inputSet.immutable) {
    throw new Error("input_set_immutable_after_run_starts");
  }
}

export function mutateInputSetParameters(
  inputSet: TwinSimulationInputSet,
  parameters: Record<string, unknown>,
): TwinSimulationInputSet {
  assertInputSetMutable(inputSet);
  const contentHash = computeInputSetContentHash({
    scenarioId: inputSet.scenarioId,
    definitionId: inputSet.definitionId,
    representationVersionPins: inputSet.representationVersionPins,
    publishedStateVersionPins: inputSet.publishedStateVersionPins,
    telemetryWindowRefs: inputSet.telemetryWindowRefs,
    parameters,
    unitSystem: inputSet.unitSystem,
    unitCode: inputSet.unitCode,
  });
  return {
    ...inputSet,
    parameters,
    contentHash,
    updatedAt: new Date().toISOString(),
  };
}
