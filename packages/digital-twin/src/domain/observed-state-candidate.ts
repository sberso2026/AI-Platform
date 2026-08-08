/**
 * Phase 12D — ObservedTwinStateCandidate (candidate ≠ published).
 */

import type { StateReferenceCategory } from "./state";
import type { TwinSourceFreshnessState } from "./source-freshness";
import type { UnitGovernanceRecord } from "./unit-governance";

export const CANDIDATE_LIFECYCLE = [
  "received",
  "validated",
  "reconciled",
  "pending_review",
  "rejected",
  "published",
  "superseded",
] as const;

export type ObservedCandidateLifecycle = (typeof CANDIDATE_LIFECYCLE)[number];

export type ObservedTwinStateCandidate = {
  candidateId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  adapterId: string;
  schemaId: string;
  schemaVersion: string;
  category: StateReferenceCategory;
  lifecycle: ObservedCandidateLifecycle;
  externalRef: string;
  idempotencyKey: string;
  observedAt: string;
  receivedAt: string;
  freshness: TwinSourceFreshnessState;
  payload: Record<string, unknown>;
  provenance: {
    sourceModule: string;
    sourceRef: string;
    capturedAt: string;
  };
  unitGovernance?: UnitGovernanceRecord;
  confidence?: number;
  evidenceRefs: string[];
  reconciliationId?: string;
  publishedStateId?: string;
  reviewWorkflowInstanceId?: string;
  createdBy?: string;
  updatedAt: string;
  storesTelemetryPayload: false;
  autoPublishAttempted: false;
  simulationExecuted: false;
  liveIngestionEnabled: false;
};

export function assertCandidateNotPublished(candidate: ObservedTwinStateCandidate): void {
  if (candidate.lifecycle === "published") {
    throw new Error("candidate_already_published");
  }
}

export function assertCandidateIsObserved(candidate: ObservedTwinStateCandidate): void {
  if (candidate.category !== "observed") {
    throw new Error("ingestion_candidate_must_be_observed");
  }
  if (candidate.storesTelemetryPayload) {
    throw new Error("candidate_telemetry_payload_forbidden");
  }
}
