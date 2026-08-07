/**
 * Phase 10F — Engineering Time Series model.
 * Ordered engineering observations about a canonical asset attribute.
 */

import type { Provenance } from "../architecture/identity-state";

export type TimeSeriesOrientation =
  | "increasing_worse"
  | "decreasing_worse"
  | "neutral";

export type TimeSeriesLifecycleStatus =
  | "draft"
  | "ingested"
  | "pending_review"
  | "approved"
  | "published"
  | "superseded"
  | "archived";

export type EngineeringTimeSeriesPoint = {
  observedAt: string;
  value: number;
  quality?: "good" | "suspect" | "poor" | "unknown";
  evidenceRef?: string;
};

export type EngineeringTimeSeries = {
  kind: "engineering_time_series";
  seriesId: string;
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  attributeKey: string;
  attributeLabel?: string;
  unit: string;
  orientation: TimeSeriesOrientation;
  points: EngineeringTimeSeriesPoint[];
  windowStart?: string;
  windowEnd?: string;
  samplingHint?: string;
  sourceRefs?: string[];
  evidenceRefs?: string[];
  status: TimeSeriesLifecycleStatus;
  version: number;
  limitations: string[];
  /** Not an SHM runtime or sensor registry. */
  isSensorRegistry: false;
  isShmRuntime: false;
};

export function createEngineeringTimeSeries(input: {
  seriesId: string;
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  attributeKey: string;
  attributeLabel?: string;
  unit: string;
  orientation?: TimeSeriesOrientation;
  points: EngineeringTimeSeriesPoint[];
  sourceRefs?: string[];
  evidenceRefs?: string[];
  samplingHint?: string;
  version?: number;
  status?: TimeSeriesLifecycleStatus;
}): EngineeringTimeSeries {
  const points = [...input.points].sort((a, b) =>
    a.observedAt.localeCompare(b.observedAt),
  );
  return {
    kind: "engineering_time_series",
    seriesId: input.seriesId,
    assetId: input.assetId,
    recordedAt: input.recordedAt,
    provenance: input.provenance,
    silentIdentityMutationForbidden: true,
    attributeKey: input.attributeKey,
    attributeLabel: input.attributeLabel,
    unit: input.unit,
    orientation: input.orientation ?? "increasing_worse",
    points,
    windowStart: points[0]?.observedAt,
    windowEnd: points[points.length - 1]?.observedAt,
    samplingHint: input.samplingHint,
    sourceRefs: input.sourceRefs,
    evidenceRefs: input.evidenceRefs,
    status: input.status ?? "ingested",
    version: input.version ?? 1,
    limitations: [
      "not_sensor_registry",
      "not_shm_runtime",
      "points_advisory_until_reviewed",
    ],
    isSensorRegistry: false,
    isShmRuntime: false,
  };
}
