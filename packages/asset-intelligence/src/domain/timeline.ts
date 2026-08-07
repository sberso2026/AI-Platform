/**
 * Phase 10B — Historical Intelligence Timeline.
 */

export type TimelineStateKind =
  | "condition"
  | "health_index"
  | "criticality"
  | "reliability"
  | "failure_mode"
  | "failure_mechanism"
  | "failure_cause"
  | "failure_review"
  | "failure_published"
  | "failure_superseded"
  | "risk_intelligence"
  | "lifecycle_intelligence";

export type IntelligenceTimelineEntry = {
  entryId: string;
  assetId: string;
  tenantId: string;
  workspaceId: string;
  stateId: string;
  kind: TimelineStateKind;
  recordedAt: string;
  sourceKey: string;
  provenance: {
    sourceSystem: string;
    observedAt: string;
    method?: string;
    confidence?: number;
    evidenceRefs?: string[];
    modelId?: string;
    policyId?: string;
    reviewedBy?: string;
    approvedAt?: string;
  };
  governance: {
    silentIdentityMutationForbidden: true;
    rawEvidenceForbidden: true;
    secretsForbidden: true;
  };
};

export function createTimelineEntry(
  partial: Omit<IntelligenceTimelineEntry, "governance">,
): IntelligenceTimelineEntry {
  return {
    ...partial,
    governance: {
      silentIdentityMutationForbidden: true,
      rawEvidenceForbidden: true,
      secretsForbidden: true,
    },
  };
}
