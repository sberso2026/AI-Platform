/**
 * Phase 12E — Live projected state semantics (current_projected_state).
 *
 * Bounded binding/projection ONLY — not historian, SHM, or auto-publish.
 */

import type { ObservationQuality } from "./observation-quality";
import type { GapHandling } from "./gap-handling";
import type { SourceHealth } from "./source-health";
import type { ProjectionMethod } from "./projection-methods";

export type CurrentProjectedState = {
  twinId: string;
  bindingId: string;
  channelKey: string;
  twinAttributeKey: string;
  projectedValue: number | null;
  unit: string;
  quality: ObservationQuality;
  gapHandling: GapHandling;
  sourceHealth: SourceHealth;
  projectionMethod: ProjectionMethod;
  observedAt?: string;
  projectedAt: string;
  freshnessMs?: number;
  engineeringSeriesId?: string;
  /** Reference only — Twin does not store raw telemetry. */
  sourceRef: string;
  storesRawTelemetry: false;
  autoPublishEnabled: false;
  interpolation: "not_implemented";
};

export type LiveStateSemantics = {
  kind: "current_projected_state";
  states: CurrentProjectedState[];
  /** Historian, SHM signal processing, and sensor registry are not implemented. */
  historianImplemented: false;
  shmSignalProcessingImplemented: false;
  sensorRegistryImplemented: false;
  highFrequencyTelemetryImplemented: false;
  automaticTelemetryStatePublicationEnabled: false;
};

export function createLiveStateSemantics(
  states: CurrentProjectedState[],
): LiveStateSemantics {
  return {
    kind: "current_projected_state",
    states,
    historianImplemented: false,
    shmSignalProcessingImplemented: false,
    sensorRegistryImplemented: false,
    highFrequencyTelemetryImplemented: false,
    automaticTelemetryStatePublicationEnabled: false,
  };
}
