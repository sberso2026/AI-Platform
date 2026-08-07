/**
 * Phase 10B — Asset Health Index abstraction (derived intelligence, not identity).
 */

import type { Provenance } from "../architecture/identity-state";

export type HealthIndexStatus = "unavailable" | "advisory" | "reviewed_advisory";

export type AssetHealthIndexState = {
  kind: "health_index";
  assetId: string;
  stateId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  healthIndex?: number;
  healthClass?: string;
  healthConfidence?: number;
  healthTrend?: string;
  healthMethod?: string;
  healthSourceRefs?: string[];
  healthComputedAt?: string;
  healthReviewedBy?: string;
  healthApprovedAt?: string;
  status: HealthIndexStatus;
  /** Must remain distinct from conditionRating and criticalityRating. */
  distinctFromConditionRating: true;
  distinctFromCriticalityRating: true;
  accuracyClaimsCertified: false;
  rulClaimsCertified: false;
};

export const HEALTH_INDEX_DEFAULT: Pick<
  AssetHealthIndexState,
  | "status"
  | "distinctFromConditionRating"
  | "distinctFromCriticalityRating"
  | "accuracyClaimsCertified"
  | "rulClaimsCertified"
  | "silentIdentityMutationForbidden"
> = {
  status: "unavailable",
  distinctFromConditionRating: true,
  distinctFromCriticalityRating: true,
  accuracyClaimsCertified: false,
  rulClaimsCertified: false,
  silentIdentityMutationForbidden: true,
};

/**
 * Derive advisory health from condition when evidence is present; else abstain.
 * Does not claim predictive accuracy or RUL.
 */
export function deriveAdvisoryHealthIndex(input: {
  assetId: string;
  stateId: string;
  recordedAt: string;
  provenance: Provenance;
  conditionRating?: string;
  conditionIndex?: number;
  conditionConfidence?: number;
  conditionTrend?: string;
  conditionStateId?: string;
}): AssetHealthIndexState {
  const hasEvidence =
    input.conditionRating !== undefined ||
    input.conditionIndex !== undefined ||
    (input.provenance.evidenceRefs?.length ?? 0) > 0;

  if (!hasEvidence) {
    return {
      kind: "health_index",
      assetId: input.assetId,
      stateId: input.stateId,
      recordedAt: input.recordedAt,
      provenance: input.provenance,
      ...HEALTH_INDEX_DEFAULT,
      status: "unavailable",
      healthMethod: "abstain_insufficient_evidence",
      healthComputedAt: input.recordedAt,
    };
  }

  const healthIndex =
    typeof input.conditionIndex === "number"
      ? input.conditionIndex
      : mapConditionRatingToIndex(input.conditionRating);

  return {
    kind: "health_index",
    assetId: input.assetId,
    stateId: input.stateId,
    recordedAt: input.recordedAt,
    provenance: input.provenance,
    ...HEALTH_INDEX_DEFAULT,
    status: "advisory",
    healthIndex,
    healthClass: input.conditionRating,
    healthConfidence: input.conditionConfidence,
    healthTrend: input.conditionTrend,
    healthMethod: "compose_from_condition_v1",
    healthSourceRefs: [
      ...(input.conditionStateId ? [`condition:${input.conditionStateId}`] : []),
      ...(input.provenance.evidenceRefs ?? []),
    ],
    healthComputedAt: input.recordedAt,
  };
}

function mapConditionRatingToIndex(rating?: string): number | undefined {
  if (!rating) return undefined;
  const map: Record<string, number> = {
    excellent: 0.95,
    good: 0.8,
    fair: 0.55,
    poor: 0.3,
    critical: 0.1,
  };
  return map[rating.toLowerCase()];
}
