/**
 * Phase 12D — Ingestion domain events (identifiers only).
 */

import type { ObservedTwinStateCandidate } from "./observed-state-candidate";
import type { TwinStateReconciliationRecord } from "./state-reconciliation";

export const INGESTION_DOMAIN_EVENTS = [
  "engineering.digital_twin.state_candidate.received",
  "engineering.digital_twin.state_candidate.validated",
  "engineering.digital_twin.state_candidate.rejected",
  "engineering.digital_twin.state.conflict_detected",
  "engineering.digital_twin.state.superseded",
] as const;

export type IngestionDomainEventType = (typeof INGESTION_DOMAIN_EVENTS)[number];

export function stateCandidateReceivedPayload(
  candidate: ObservedTwinStateCandidate,
): Record<string, unknown> {
  return {
    candidateId: candidate.candidateId,
    twinId: candidate.twinId,
    adapterId: candidate.adapterId,
    schemaId: candidate.schemaId,
    externalRef: candidate.externalRef,
    idempotencyKey: candidate.idempotencyKey,
    freshness: candidate.freshness,
  };
}

export function stateCandidateValidatedPayload(
  candidate: ObservedTwinStateCandidate,
): Record<string, unknown> {
  return {
    candidateId: candidate.candidateId,
    twinId: candidate.twinId,
    lifecycle: candidate.lifecycle,
    schemaId: candidate.schemaId,
  };
}

export function stateCandidateRejectedPayload(input: {
  candidate: ObservedTwinStateCandidate;
  reason: string;
}): Record<string, unknown> {
  return {
    candidateId: input.candidate.candidateId,
    twinId: input.candidate.twinId,
    reason: input.reason,
  };
}

export function stateConflictDetectedPayload(input: {
  candidate: ObservedTwinStateCandidate;
  reconciliation: TwinStateReconciliationRecord;
}): Record<string, unknown> {
  return {
    candidateId: input.candidate.candidateId,
    twinId: input.candidate.twinId,
    reconciliationId: input.reconciliation.reconciliationId,
    conflictingStateId: input.reconciliation.conflictingStateId,
    outcome: input.reconciliation.outcome,
  };
}
