/**
 * Phase 12E — TelemetryChannelReference.
 *
 * Logical channel binding a twin attribute to an engineering time series source.
 */

import type { TelemetrySourceReference } from "./telemetry-source";

export type TelemetryChannelReference = {
  channelId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  sourceId: string;
  channelKey: string;
  displayName: string;
  unit: string;
  twinAttributeKey: string;
  engineeringSeriesRef?: string;
  sourceRef: Pick<TelemetrySourceReference, "sourceKind" | "externalRef" | "ownerModule">;
  storesRawTelemetry: false;
  createdAt: string;
  updatedAt: string;
};

export function createTelemetryChannelReference(input: {
  channelId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  sourceId: string;
  channelKey: string;
  displayName: string;
  unit: string;
  twinAttributeKey: string;
  engineeringSeriesRef?: string;
  sourceRef: TelemetryChannelReference["sourceRef"];
}): TelemetryChannelReference {
  const now = new Date().toISOString();
  return {
    channelId: input.channelId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    sourceId: input.sourceId,
    channelKey: input.channelKey,
    displayName: input.displayName,
    unit: input.unit,
    twinAttributeKey: input.twinAttributeKey,
    engineeringSeriesRef: input.engineeringSeriesRef,
    sourceRef: input.sourceRef,
    storesRawTelemetry: false,
    createdAt: now,
    updatedAt: now,
  };
}
