/**
 * Phase 10C — Asset Health Index state model only.
 * Composition algorithm lives in HealthCompositionEngine — do not embed scoring here.
 */

import type { Provenance } from "../architecture/identity-state";
import type { EvidenceSufficiencyRecord } from "./evidence-sufficiency";

export type HealthIndexStatus = "unavailable" | "advisory" | "reviewed_advisory";

export type HealthCompositionFactor = "condition" | "criticality" | "reliability";

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
  /** Reserved distinctness for Phase 10D reliability factor. */
  distinctFromReliabilityRating: true;
  evidenceSufficiency?: EvidenceSufficiencyRecord;
  factorsUsed?: HealthCompositionFactor[];
  composedBy?: "health_composition_engine";
  accuracyClaimsCertified: false;
  rulClaimsCertified: false;
};

export const HEALTH_INDEX_DEFAULT: Pick<
  AssetHealthIndexState,
  | "status"
  | "distinctFromConditionRating"
  | "distinctFromCriticalityRating"
  | "distinctFromReliabilityRating"
  | "accuracyClaimsCertified"
  | "rulClaimsCertified"
  | "silentIdentityMutationForbidden"
> = {
  status: "unavailable",
  distinctFromConditionRating: true,
  distinctFromCriticalityRating: true,
  distinctFromReliabilityRating: true,
  accuracyClaimsCertified: false,
  rulClaimsCertified: false,
  silentIdentityMutationForbidden: true,
};

/** Map condition rating labels to advisory index (shared helper for composers/tests). */
export function mapConditionRatingToIndex(rating?: string): number | undefined {
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
