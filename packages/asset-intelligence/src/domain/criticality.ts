/**
 * Phase 10C — Asset Criticality assessment (distinct from condition and health).
 */

import type { AssetCriticalityState, Provenance } from "../architecture/identity-state";

export type CriticalityReviewStatus =
  | "draft"
  | "pending_review"
  | "changes_requested"
  | "approved"
  | "rejected";

export type CriticalityAssessmentInput = {
  assetId: string;
  stateId: string;
  recordedAt: string;
  provenance: Provenance;
  criticalityRating?: string;
  safetyCriticality?: string;
  productionCriticality?: string;
  environmentalCriticality?: string;
  financialCriticality?: string;
  operationalCriticality?: string;
  regulatoryCriticality?: string;
  criticalityMethod?: string;
  criticalityConfidence?: number;
  reviewStatus?: CriticalityReviewStatus;
};

export type AssetCriticalityStateRecord = AssetCriticalityState & {
  criticalityMethod?: string;
  criticalityConfidence?: number;
  reviewStatus: CriticalityReviewStatus;
  reviewInstanceId?: string;
};

export function assessCriticality(input: CriticalityAssessmentInput): AssetCriticalityStateRecord {
  const hasEvidence =
    Boolean(input.criticalityRating) ||
    Boolean(input.safetyCriticality) ||
    Boolean(input.productionCriticality) ||
    Boolean(input.environmentalCriticality) ||
    Boolean(input.financialCriticality) ||
    Boolean(input.operationalCriticality) ||
    Boolean(input.regulatoryCriticality) ||
    (input.provenance.evidenceRefs?.length ?? 0) > 0;

  if (!hasEvidence) {
    return {
      kind: "criticality",
      assetId: input.assetId,
      stateId: input.stateId,
      recordedAt: input.recordedAt,
      provenance: {
        ...input.provenance,
        method: input.criticalityMethod ?? "abstain_insufficient_evidence",
      },
      silentIdentityMutationForbidden: true,
      criticalityMethod: "abstain_insufficient_evidence",
      reviewStatus: "draft",
    };
  }

  return {
    kind: "criticality",
    assetId: input.assetId,
    stateId: input.stateId,
    recordedAt: input.recordedAt,
    provenance: {
      ...input.provenance,
      method: input.criticalityMethod ?? "governed_criticality_v1",
      confidence: input.criticalityConfidence,
    },
    silentIdentityMutationForbidden: true,
    criticalityRating: input.criticalityRating,
    safetyCriticality: input.safetyCriticality,
    productionCriticality: input.productionCriticality,
    environmentalCriticality: input.environmentalCriticality,
    financialCriticality: input.financialCriticality,
    operationalCriticality: input.operationalCriticality,
    regulatoryCriticality: input.regulatoryCriticality,
    criticalityMethod: input.criticalityMethod ?? "governed_criticality_v1",
    criticalityConfidence: input.criticalityConfidence,
    reviewStatus: input.reviewStatus ?? "pending_review",
  };
}

export function mapCriticalityRatingToWeight(rating?: string): number | undefined {
  if (!rating) return undefined;
  const map: Record<string, number> = {
    low: 0.2,
    medium: 0.5,
    high: 0.8,
    extreme: 0.95,
  };
  return map[rating.toLowerCase()];
}
