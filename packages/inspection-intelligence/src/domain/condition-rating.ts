/**
 * Phase 9H — Governed condition rating model.
 * Separates observed / calculated / human-approved / published ratings.
 * Never silently mutates findings, risks, actions, workflows or reports.
 */

export type ConditionRatingSchemeKind = "ordinal" | "numeric";

export type ConditionRatingScheme = {
  schemeId: string;
  version: string;
  kind: ConditionRatingSchemeKind;
  /** Ordinal labels or numeric bounds — pack-specific; not a universal scale. */
  scale: readonly { code: string; label: string; numericValue?: number }[];
  packId: string;
  standardRefs: readonly string[];
};

export type ConditionTrendDirection = "improving" | "stable" | "declining" | "unknown";

export type ConditionEvidenceSufficiency =
  | "sufficient"
  | "marginal"
  | "insufficient"
  | "abstain";

export type ConditionReviewState =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "superseded"
  | "published";

export type ConditionRatingLayer =
  | "observed"
  | "calculated_recommendation"
  | "human_approved"
  | "published";

export type ConditionRatingValue = {
  schemeId: string;
  schemeVersion: string;
  ordinalCode?: string;
  numericScore?: number;
  layer: ConditionRatingLayer;
};

export type ConditionOverrideRecord = {
  overrideId: string;
  previousValue: ConditionRatingValue;
  newValue: ConditionRatingValue;
  reason: string;
  authorityRole: string;
  actorUserId: string;
  at: string;
};

export type ConditionSupersessionEntry = {
  previousRatingId: string;
  supersededAt: string;
  supersededByRatingId: string;
  reason: string;
};

export type ConditionRatingRecord = {
  ratingId: string;
  tenantId: string;
  workspaceId: string;
  projectId?: string;
  assignmentId?: string;
  sessionId: string;
  componentScope: string;
  inspectionScope: string;
  observationIds: readonly string[];
  findingIds: readonly string[];
  scheme: ConditionRatingScheme;
  observed: ConditionRatingValue;
  calculatedRecommendation?: ConditionRatingValue;
  humanApproved?: ConditionRatingValue;
  published?: ConditionRatingValue;
  confidence: number;
  uncertainty: number;
  evidenceSufficiency: ConditionEvidenceSufficiency;
  assessorUserId: string;
  assessedAt: string;
  trend: ConditionTrendDirection;
  reviewState: ConditionReviewState;
  overrides: readonly ConditionOverrideRecord[];
  supersessionHistory: readonly ConditionSupersessionEntry[];
  packId: string;
  ruleRefs: readonly string[];
  standardRefs: readonly string[];
  stale: boolean;
  offlineOrigin: boolean;
};

export type ConditionRatingEventType =
  | "engineering.inspection.condition.created"
  | "engineering.inspection.condition.overridden"
  | "engineering.inspection.condition.approved"
  | "engineering.inspection.condition.published"
  | "engineering.inspection.condition.superseded"
  | "engineering.inspection.condition.abstained";

export type ConditionRatingEvent = {
  type: ConditionRatingEventType;
  tenantId: string;
  workspaceId?: string;
  ratingId: string;
  occurredAt: string;
  /** Identifiers and governance only — no evidence payloads. */
  payload: Record<string, unknown>;
};

export const STRUCTURAL_ORDINAL_SCHEME_V1: ConditionRatingScheme = {
  schemeId: "structural_ordinal_1_5",
  version: "1.0.0",
  kind: "ordinal",
  packId: "structural_condition",
  standardRefs: ["AS5100-ish-reference", "pack:structural_condition"],
  scale: [
    { code: "1", label: "Very good", numericValue: 1 },
    { code: "2", label: "Good", numericValue: 2 },
    { code: "3", label: "Fair", numericValue: 3 },
    { code: "4", label: "Poor", numericValue: 4 },
    { code: "5", label: "Very poor", numericValue: 5 },
  ],
};

export const GENERIC_NUMERIC_SCHEME_V1: ConditionRatingScheme = {
  schemeId: "generic_numeric_0_100",
  version: "1.0.0",
  kind: "numeric",
  packId: "generic",
  standardRefs: ["pack:generic"],
  scale: [
    { code: "min", label: "0", numericValue: 0 },
    { code: "max", label: "100", numericValue: 100 },
  ],
};

export function assertCompatibleScheme(
  a: ConditionRatingScheme,
  b: ConditionRatingScheme,
): void {
  if (a.schemeId !== b.schemeId || a.version !== b.version || a.kind !== b.kind) {
    throw new Error(
      `condition_scheme_incompatible:${a.schemeId}@${a.version}!=${b.schemeId}@${b.version}`,
    );
  }
}

export function createObservedConditionRating(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  componentScope: string;
  inspectionScope: string;
  observationIds: readonly string[];
  findingIds?: readonly string[];
  scheme: ConditionRatingScheme;
  ordinalCode?: string;
  numericScore?: number;
  confidence: number;
  uncertainty: number;
  evidenceSufficiency: ConditionEvidenceSufficiency;
  assessorUserId: string;
  trend?: ConditionTrendDirection;
  packId: string;
  ruleRefs?: readonly string[];
  offlineOrigin?: boolean;
  assignmentId?: string;
  projectId?: string;
}): ConditionRatingRecord {
  if (input.evidenceSufficiency === "insufficient" || input.evidenceSufficiency === "abstain") {
    throw new Error(`condition_rating_abstain:${input.evidenceSufficiency}`);
  }
  if (input.scheme.kind === "ordinal" && !input.ordinalCode) {
    throw new Error("condition_rating_ordinal_code_required");
  }
  if (input.scheme.kind === "numeric" && input.numericScore === undefined) {
    throw new Error("condition_rating_numeric_score_required");
  }
  const observed: ConditionRatingValue = {
    schemeId: input.scheme.schemeId,
    schemeVersion: input.scheme.version,
    ordinalCode: input.ordinalCode,
    numericScore: input.numericScore,
    layer: "observed",
  };
  return {
    ratingId: `cr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    assignmentId: input.assignmentId,
    sessionId: input.sessionId,
    componentScope: input.componentScope,
    inspectionScope: input.inspectionScope,
    observationIds: input.observationIds,
    findingIds: input.findingIds ?? [],
    scheme: input.scheme,
    observed,
    confidence: input.confidence,
    uncertainty: input.uncertainty,
    evidenceSufficiency: input.evidenceSufficiency,
    assessorUserId: input.assessorUserId,
    assessedAt: new Date().toISOString(),
    trend: input.trend ?? "unknown",
    reviewState: "draft",
    overrides: [],
    supersessionHistory: [],
    packId: input.packId,
    ruleRefs: input.ruleRefs ?? [],
    standardRefs: input.scheme.standardRefs,
    stale: false,
    offlineOrigin: input.offlineOrigin ?? false,
  };
}

export function recommendCalculatedRating(
  rating: ConditionRatingRecord,
  recommendation: Omit<ConditionRatingValue, "layer">,
): ConditionRatingRecord {
  assertCompatibleScheme(rating.scheme, {
    ...rating.scheme,
    schemeId: recommendation.schemeId,
    version: recommendation.schemeVersion,
  });
  return {
    ...rating,
    calculatedRecommendation: { ...recommendation, layer: "calculated_recommendation" },
    reviewState: rating.reviewState === "draft" ? "pending_review" : rating.reviewState,
  };
}

export function overrideConditionRating(
  rating: ConditionRatingRecord,
  input: {
    newOrdinalCode?: string;
    newNumericScore?: number;
    reason: string;
    authorityRole: string;
    actorUserId: string;
  },
): ConditionRatingRecord {
  if (!input.reason.trim()) throw new Error("condition_override_reason_required");
  const previous =
    rating.humanApproved ?? rating.calculatedRecommendation ?? rating.observed;
  const next: ConditionRatingValue = {
    schemeId: rating.scheme.schemeId,
    schemeVersion: rating.scheme.version,
    ordinalCode: input.newOrdinalCode ?? previous.ordinalCode,
    numericScore: input.newNumericScore ?? previous.numericScore,
    layer: "human_approved",
  };
  const override: ConditionOverrideRecord = {
    overrideId: `ovr_${Date.now().toString(36)}`,
    previousValue: previous,
    newValue: next,
    reason: input.reason,
    authorityRole: input.authorityRole,
    actorUserId: input.actorUserId,
    at: new Date().toISOString(),
  };
  return {
    ...rating,
    humanApproved: next,
    overrides: [...rating.overrides, override],
    reviewState: "approved",
  };
}

export function approveConditionRating(
  rating: ConditionRatingRecord,
  actorUserId: string,
): ConditionRatingRecord {
  void actorUserId;
  const approved =
    rating.humanApproved ?? rating.calculatedRecommendation ?? rating.observed;
  return {
    ...rating,
    humanApproved: { ...approved, layer: "human_approved" },
    reviewState: "approved",
  };
}

export function publishConditionRating(
  rating: ConditionRatingRecord,
  authorised: boolean,
): ConditionRatingRecord {
  if (!authorised) throw new Error("condition_publish_unauthorised");
  if (rating.reviewState !== "approved") {
    throw new Error(`condition_publish_requires_approval:${rating.reviewState}`);
  }
  const source = rating.humanApproved ?? rating.observed;
  return {
    ...rating,
    published: { ...source, layer: "published" },
    reviewState: "published",
    offlineOrigin: false,
  };
}

export function supersedeConditionRating(
  previous: ConditionRatingRecord,
  next: ConditionRatingRecord,
  reason: string,
): { previous: ConditionRatingRecord; next: ConditionRatingRecord } {
  const entry: ConditionSupersessionEntry = {
    previousRatingId: previous.ratingId,
    supersededAt: new Date().toISOString(),
    supersededByRatingId: next.ratingId,
    reason,
  };
  return {
    previous: {
      ...previous,
      reviewState: "superseded",
      supersessionHistory: [...previous.supersessionHistory, entry],
    },
    next: {
      ...next,
      supersessionHistory: [...next.supersessionHistory, entry],
    },
  };
}

export function createConditionEvent(
  type: ConditionRatingEventType,
  rating: ConditionRatingRecord,
  extra: Record<string, unknown> = {},
): ConditionRatingEvent {
  return {
    type,
    tenantId: rating.tenantId,
    workspaceId: rating.workspaceId,
    ratingId: rating.ratingId,
    occurredAt: new Date().toISOString(),
    payload: {
      reviewState: rating.reviewState,
      packId: rating.packId,
      schemeId: rating.scheme.schemeId,
      schemeVersion: rating.scheme.version,
      evidenceSufficiency: rating.evidenceSufficiency,
      ...extra,
    },
  };
}
