/**
 * Phase 10A — RUL and prediction governance (no certified claims).
 */

export type RulGovernanceRecord = {
  rulEstimate?: number;
  rulRange?: { min?: number; max?: number; unit?: string };
  rulConfidence?: number;
  rulMethod?: string;
  rulModel?: string;
  rulEvidenceWindow?: string;
  rulAssumptions?: string[];
  rulLimitations?: string[];
  rulReviewedBy?: string;
  rulApprovedAt?: string;
  status: "unavailable" | "advisory" | "reviewed_advisory";
  accuracyClaimsCertified: false;
  rulClaimsCertified: false;
};

export const RUL_GOVERNANCE_DEFAULT: RulGovernanceRecord = {
  status: "unavailable",
  accuracyClaimsCertified: false,
  rulClaimsCertified: false,
  rulLimitations: [
    "observed_condition_is_not_rul",
    "trend_is_not_certified_prediction",
    "predictive_signal_is_advisory",
  ],
};

/** Separated concepts — must not be treated as equivalent. */
export const PREDICTION_CONCEPT_SEPARATION = [
  "observed_condition",
  "trend",
  "predictive_signal",
  "estimated_degradation",
  "remaining_life_estimate",
  "certified_rul_claim",
] as const;
