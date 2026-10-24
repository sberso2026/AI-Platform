/**
 * Phase 12E — Telemetry domain events (identifiers only).
 */

export const TELEMETRY_DOMAIN_EVENTS = [
  "engineering.digital_twin.telemetry_binding.created",
  "engineering.digital_twin.telemetry_binding.reviewed",
  "engineering.digital_twin.telemetry_binding.published",
  "engineering.digital_twin.telemetry_binding.suspended",
  "engineering.digital_twin.telemetry.projection_created",
  "engineering.digital_twin.telemetry.quality_rejected",
  "engineering.digital_twin.telemetry.stale_detected",
  "engineering.digital_twin.telemetry.source_unavailable",
] as const;

export type TelemetryDomainEventType = (typeof TELEMETRY_DOMAIN_EVENTS)[number];

export function telemetryBindingCreatedPayload(input: {
  bindingId: string;
  twinId: string;
  sourceId: string;
  channelId: string;
}): Record<string, unknown> {
  return {
    bindingId: input.bindingId,
    twinId: input.twinId,
    sourceId: input.sourceId,
    channelId: input.channelId,
    storesRawTelemetry: false,
  };
}

export function telemetryProjectionCreatedPayload(input: {
  bindingId: string;
  twinId: string;
  candidateId?: string;
  projectedValue: number | null;
  quality: string;
}): Record<string, unknown> {
  return {
    bindingId: input.bindingId,
    twinId: input.twinId,
    candidateId: input.candidateId,
    projectedValue: input.projectedValue,
    quality: input.quality,
    autoPublishEnabled: false,
  };
}

export function telemetryQualityRejectedPayload(input: {
  bindingId: string;
  quality: string;
  reason: string;
}): Record<string, unknown> {
  return { bindingId: input.bindingId, quality: input.quality, reason: input.reason };
}

export function telemetryStaleDetectedPayload(input: {
  bindingId: string;
  lastObservationAt?: string;
  freshnessMs?: number;
}): Record<string, unknown> {
  return {
    bindingId: input.bindingId,
    lastObservationAt: input.lastObservationAt,
    freshnessMs: input.freshnessMs,
  };
}

export function telemetrySourceUnavailablePayload(input: {
  bindingId: string;
  sourceId: string;
  health: string;
}): Record<string, unknown> {
  return { bindingId: input.bindingId, sourceId: input.sourceId, health: input.health };
}
