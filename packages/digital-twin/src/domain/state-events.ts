/**
 * Phase 12C — Digital Twin state events (identifiers only).
 */

import type { TwinState, TwinStateSnapshot } from "./state";
import type { RepresentationVersion } from "./representation-versioning";

export const STATE_DOMAIN_EVENTS = [
  "engineering.digital_twin.state.created",
  "engineering.digital_twin.state.reviewed",
  "engineering.digital_twin.state.published",
  "engineering.digital_twin.state.superseded",
  "engineering.digital_twin.snapshot.updated",
] as const;

export type StateDomainEventType = (typeof STATE_DOMAIN_EVENTS)[number];

export function stateCreatedEventPayload(state: TwinState): Record<string, unknown> {
  return {
    stateId: state.stateId,
    twinId: state.twinId,
    category: state.category,
    lifecycle: state.lifecycle,
    currentVersion: state.currentVersion,
    externalRef: state.externalRef,
    reviewStatus: state.reviewStatus,
  };
}

export function stateReviewedEventPayload(input: {
  state: TwinState;
  reviewerId?: string;
  outcome: string;
}): Record<string, unknown> {
  return {
    stateId: input.state.stateId,
    twinId: input.state.twinId,
    reviewerId: input.reviewerId,
    outcome: input.outcome,
    reviewStatus: input.state.reviewStatus,
  };
}

export function statePublishedEventPayload(state: TwinState): Record<string, unknown> {
  return {
    stateId: state.stateId,
    twinId: state.twinId,
    publishedAt: state.publishedAt,
    currentVersion: state.currentVersion,
  };
}

export function stateSupersededEventPayload(input: {
  state: TwinState;
  supersededByStateId: string;
}): Record<string, unknown> {
  return {
    stateId: input.state.stateId,
    twinId: input.state.twinId,
    supersededByStateId: input.supersededByStateId,
    supersededAt: input.state.supersededAt,
  };
}

export function snapshotUpdatedEventPayload(snapshot: TwinStateSnapshot): Record<string, unknown> {
  return {
    snapshotId: snapshot.snapshotId,
    twinId: snapshot.twinId,
    stateVersionRefCount: snapshot.stateVersionRefs.length,
    label: snapshot.label,
  };
}

export function representationVersionEventPayload(
  version: RepresentationVersion,
): Record<string, unknown> {
  return {
    representationVersionId: version.representationVersionId,
    twinId: version.twinId,
    representationType: version.representationType,
    revision: version.revision,
    effectiveDate: version.effectiveDate,
    supersededBy: version.supersededBy,
  };
}
