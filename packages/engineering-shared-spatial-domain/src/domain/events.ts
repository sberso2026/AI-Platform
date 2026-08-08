/**
 * Phase 12M — Spatial domain events (ids only; no geometry payloads).
 */

export const SPATIAL_DOMAIN_EVENT_TYPES = [
  "engineering.spatial.reference.created",
  "engineering.spatial.reference.updated",
  "engineering.spatial.reference.superseded",
  "engineering.spatial.reference.published",
  "engineering.spatial.relationship.created",
  "engineering.spatial.mapping.confirmed",
  "engineering.spatial.review.recorded",
  "engineering.spatial.crs.created",
  "engineering.spatial.coordinate.created",
  "engineering.spatial.legacy.classified",
] as const;

export type SpatialDomainEventType = (typeof SPATIAL_DOMAIN_EVENT_TYPES)[number];

export type SpatialOutboxEvent = {
  outboxId: string;
  tenantId: string;
  workspaceId: string;
  eventType: SpatialDomainEventType;
  /** Ids only — never geometry blobs. */
  payload: {
    spatialReferenceId?: string;
    relationshipId?: string;
    crsId?: string;
    coordinateReferenceId?: string;
    reconciliationId?: string;
    reviewId?: string;
  };
  correlationId?: string;
  published: boolean;
  createdAt: string;
  publishedAt?: string;
};

export function createSpatialOutboxEvent(input: {
  outboxId: string;
  tenantId: string;
  workspaceId: string;
  eventType: SpatialDomainEventType;
  payload: SpatialOutboxEvent["payload"];
  correlationId?: string;
}): SpatialOutboxEvent {
  return {
    outboxId: input.outboxId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    eventType: input.eventType,
    payload: input.payload,
    correlationId: input.correlationId,
    published: false,
    createdAt: new Date().toISOString(),
  };
}
