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
  | "time_series"
  | "change_detection"
  | "trend"
  | "degradation"
  | "degradation_review"
  | "degradation_published"
  | "risk_intelligence"
  | "lifecycle_intelligence"
  | "lifecycle_review"
  | "lifecycle_published"
  | "lifecycle_transition_candidate"
  | "decision_context"
  | "risk_signal"
  | "risk_review"
  | "risk_published"
  | "risk_candidate"
  | "maintenance_recommendation"
  | "maintenance_recommendation_review"
  | "maintenance_recommendation_published"
  | "priority_profile"
  | "priority_review"
  | "priority_published"
  | "fusion_state"
  | "fusion_review"
  | "fusion_published"
  | "reconciliation_record"
  | "predictive_readiness"
  | "predictive_readiness_review"
  | "predictive_readiness_published"
  | "predictive_objective_readiness"
  | "predictive_objective_readiness_review"
  | "predictive_objective_readiness_published"
  | "predictive_method_candidate"
  | "predictive_method_candidate_review"
  | "predictive_method_qualification"
  | "predictive_method_qualification_review"
  | "predictive_method_qualified";

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
