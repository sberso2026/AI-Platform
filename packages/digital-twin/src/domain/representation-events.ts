/**
 * Phase 12F — Representation domain events (identifiers only).
 */

export const REPRESENTATION_DOMAIN_EVENTS = [
  "engineering.digital_twin.representation.registered",
  "engineering.digital_twin.representation.versioned",
  "engineering.digital_twin.mapping.created",
  "engineering.digital_twin.mapping.reviewed",
  "engineering.digital_twin.mapping.published",
  "engineering.digital_twin.mapping.superseded",
  "engineering.digital_twin.mapping.review_required",
] as const;

export type RepresentationDomainEventType = (typeof REPRESENTATION_DOMAIN_EVENTS)[number];

export function representationRegisteredPayload(input: {
  representationSourceId: string;
  twinId: string;
  format: string;
  version: string;
}): Record<string, unknown> {
  return {
    representationSourceId: input.representationSourceId,
    twinId: input.twinId,
    format: input.format,
    version: input.version,
    storesGeometryPayload: false,
    storesSourceModelBinary: false,
  };
}

export function representationVersionedPayload(input: {
  representationSourceId: string;
  twinId: string;
  version: string;
  previousVersion?: string;
}): Record<string, unknown> {
  return {
    representationSourceId: input.representationSourceId,
    twinId: input.twinId,
    version: input.version,
    previousVersion: input.previousVersion,
  };
}

export function mappingCreatedPayload(input: {
  mappingId: string;
  twinId: string;
  elementRefId: string;
  mappingMethod: string;
}): Record<string, unknown> {
  return {
    mappingId: input.mappingId,
    twinId: input.twinId,
    elementRefId: input.elementRefId,
    mappingMethod: input.mappingMethod,
    autoApproved: false,
  };
}

export function mappingReviewedPayload(input: {
  mappingId: string;
  twinId: string;
  outcome: string;
  reviewerId?: string;
}): Record<string, unknown> {
  return {
    mappingId: input.mappingId,
    twinId: input.twinId,
    outcome: input.outcome,
    reviewerId: input.reviewerId,
    selfApproved: false,
  };
}

export function mappingPublishedPayload(input: {
  mappingId: string;
  twinId: string;
  mappingVersion: number;
}): Record<string, unknown> {
  return {
    mappingId: input.mappingId,
    twinId: input.twinId,
    mappingVersion: input.mappingVersion,
    autoApproved: false,
  };
}

export function mappingSupersededPayload(input: {
  mappingId: string;
  twinId: string;
  supersededByMappingId: string;
}): Record<string, unknown> {
  return {
    mappingId: input.mappingId,
    twinId: input.twinId,
    supersededByMappingId: input.supersededByMappingId,
  };
}

export function mappingReviewRequiredPayload(input: {
  mappingId: string;
  twinId: string;
  reason: string;
}): Record<string, unknown> {
  return {
    mappingId: input.mappingId,
    twinId: input.twinId,
    reason: input.reason,
  };
}
