/**
 * Phase 12E — TwinTelemetryAggregationPolicy.
 */

import type { ProjectionMethod } from "./projection-methods";
import type { GapHandling } from "./gap-handling";

export type TwinTelemetryAggregationPolicy = {
  policyId: string;
  tenantId: string;
  workspaceId: string;
  bindingId: string;
  method: ProjectionMethod;
  windowSeconds: number;
  minSamples: number;
  gapHandling: GapHandling;
  interpolation: "not_implemented";
  staleAfterSeconds: number;
  storesRawTelemetry: false;
  createdAt: string;
  updatedAt: string;
};

export function createTwinTelemetryAggregationPolicy(input: {
  policyId: string;
  tenantId: string;
  workspaceId: string;
  bindingId: string;
  method: ProjectionMethod;
  windowSeconds?: number;
  minSamples?: number;
  gapHandling?: GapHandling;
  staleAfterSeconds?: number;
}): TwinTelemetryAggregationPolicy {
  const now = new Date().toISOString();
  return {
    policyId: input.policyId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    bindingId: input.bindingId,
    method: input.method,
    windowSeconds: input.windowSeconds ?? 300,
    minSamples: input.minSamples ?? 1,
    gapHandling: input.gapHandling ?? "no_data",
    interpolation: "not_implemented",
    staleAfterSeconds: input.staleAfterSeconds ?? 600,
    storesRawTelemetry: false,
    createdAt: now,
    updatedAt: now,
  };
}
