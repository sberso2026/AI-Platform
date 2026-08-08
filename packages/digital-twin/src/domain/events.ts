/**
 * Phase 12D — Digital Twin domain events (identifiers only).
 */

import type { TwinIdentity } from "./identity";
import type { TwinRepresentationReference } from "./representation";
import type { TwinRelationship } from "./relationships";
import { INGESTION_DOMAIN_EVENTS } from "./ingestion-events";
import { STATE_DOMAIN_EVENTS } from "./state-events";

export { STATE_DOMAIN_EVENTS, INGESTION_DOMAIN_EVENTS };

export const CORE_DIGITAL_TWIN_EVENTS = [
  "engineering.digital_twin.created",
  "engineering.digital_twin.updated",
  "engineering.digital_twin.relationship.updated",
  "engineering.digital_twin.representation.updated",
] as const;

export const DIGITAL_TWIN_EVENTS = [
  ...CORE_DIGITAL_TWIN_EVENTS,
  ...STATE_DOMAIN_EVENTS,
  ...INGESTION_DOMAIN_EVENTS,
] as const;

export type DigitalTwinEventType = (typeof DIGITAL_TWIN_EVENTS)[number];

export type DigitalTwinEvent = {
  eventId: string;
  eventType: DigitalTwinEventType;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  recordedAt: string;
  correlationId?: string;
  payload: Record<string, unknown>;
  governance: {
    liveTelemetryImplemented: false;
    simulationExecuted: false;
    runtimeSyncEnabled: false;
    physicalActuationEnabled: false;
    mutatesCanonicalIdentity: false;
    storesTelemetryPayload: false;
  };
};

export function twinCreatedEventPayload(identity: TwinIdentity): Record<string, unknown> {
  return {
    twinId: identity.twinId,
    canonicalEntityType: identity.target.canonicalEntityType,
    canonicalEntityId: identity.target.canonicalEntityId,
    twinType: identity.twinType,
    status: identity.status,
    kernelTwinId: identity.kernelTwinId,
  };
}

export function twinUpdatedEventPayload(identity: TwinIdentity): Record<string, unknown> {
  return {
    twinId: identity.twinId,
    status: identity.status,
    twinVersion: identity.version.twinVersion,
    configurationVersion: identity.version.configurationVersion,
  };
}

export function representationUpdatedEventPayload(
  representation: TwinRepresentationReference,
): Record<string, unknown> {
  return {
    twinId: representation.twinId,
    representationId: representation.representationId,
    representationType: representation.representationType,
    sourceRef: representation.sourceRef,
    fidelityLevel: representation.fidelityLevel,
    status: representation.status,
  };
}

export function relationshipUpdatedEventPayload(
  relationship: TwinRelationship,
): Record<string, unknown> {
  return {
    twinId: relationship.twinId,
    relationshipId: relationship.relationshipId,
    relationshipType: relationship.relationshipType,
    targetRef: relationship.targetRef,
    targetKind: relationship.targetKind,
  };
}

export function createDigitalTwinEvent(input: {
  eventId: string;
  eventType: DigitalTwinEventType;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  recordedAt?: string;
  correlationId?: string;
  payload: Record<string, unknown>;
}): DigitalTwinEvent {
  return {
    eventId: input.eventId,
    eventType: input.eventType,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
    correlationId: input.correlationId,
    payload: input.payload,
    governance: {
      liveTelemetryImplemented: false,
      simulationExecuted: false,
      runtimeSyncEnabled: false,
      physicalActuationEnabled: false,
      mutatesCanonicalIdentity: false,
      storesTelemetryPayload: false,
    },
  };
}
