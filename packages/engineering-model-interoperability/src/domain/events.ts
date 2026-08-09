/**
 * Phase 13B — Outbox events (ids-only payloads).
 */

import { randomUUID } from "node:crypto";

export const ENGINEERING_MODEL_INTEROP_EVENT_TYPES = [
  "engineering.model.reference.created",
  "engineering.model.version.ingested",
  "engineering.model.element.indexed",
  "engineering.model.mapping.candidate",
  "engineering.model.mapping.confirmed",
  "engineering.model.mapping.review.recorded",
  "engineering.model.change_impact.recorded",
  "engineering.model.result.referenced",
] as const;

export type EngineeringModelInteropEventType =
  (typeof ENGINEERING_MODEL_INTEROP_EVENT_TYPES)[number];

export type EngineeringModelOutboxEvent = {
  outboxId: string;
  tenantId: string;
  workspaceId: string;
  eventType: EngineeringModelInteropEventType;
  /** Ids-only payload — no model binaries. */
  payload: {
    modelRefId?: string;
    modelVersionId?: string;
    elementRefId?: string;
    mappingId?: string;
    reviewId?: string;
    changeImpactId?: string;
    resultRefId?: string;
  };
  correlationId?: string;
  published: boolean;
  createdAt: string;
  publishedAt?: string;
};

export function createEngineeringModelOutboxEvent(input: {
  tenantId: string;
  workspaceId: string;
  eventType: EngineeringModelInteropEventType;
  payload: EngineeringModelOutboxEvent["payload"];
  correlationId?: string;
}): EngineeringModelOutboxEvent {
  return {
    outboxId: `emi_outbox_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    eventType: input.eventType,
    payload: input.payload,
    correlationId: input.correlationId,
    published: false,
    createdAt: new Date().toISOString(),
  };
}
