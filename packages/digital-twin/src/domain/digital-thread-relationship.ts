/**
 * Phase 12K — Digital Thread relationships (typed + versioned taxonomy).
 */

import {
  DIGITAL_THREAD_TAXONOMY_VERSION,
  assertNoCausalInference,
  coerceRelationshipType,
  type DigitalThreadRelationshipType,
} from "./digital-thread-taxonomy";

export type DigitalThreadRelationship = {
  threadRelationshipId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  fromReferenceId: string;
  toReferenceId: string;
  relationshipType: DigitalThreadRelationshipType;
  taxonomyVersion: typeof DIGITAL_THREAD_TAXONOMY_VERSION;
  impliesCausality: false;
  impliesDependency: false;
  /** Association ≠ dependency; Correlation ≠ causation */
  notes?: string;
  recordedAt: string;
  supersededBy?: string;
};

export function createDigitalThreadRelationship(input: {
  threadRelationshipId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  fromReferenceId: string;
  toReferenceId: string;
  relationshipType?: string | null;
  notes?: string;
  recordedAt?: string;
}): DigitalThreadRelationship {
  const relationshipType = coerceRelationshipType(input.relationshipType);
  assertNoCausalInference(relationshipType);
  return {
    threadRelationshipId: input.threadRelationshipId,
    twinId: input.twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    fromReferenceId: input.fromReferenceId,
    toReferenceId: input.toReferenceId,
    relationshipType,
    taxonomyVersion: DIGITAL_THREAD_TAXONOMY_VERSION,
    impliesCausality: false,
    impliesDependency: false,
    notes: input.notes,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
  };
}
