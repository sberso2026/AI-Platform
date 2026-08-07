/**
 * Phase 9H — Governed component-to-asset condition aggregation.
 * No hidden averaging or false precision across incompatible schemes.
 */
import {
  assertCompatibleScheme,
  type ConditionEvidenceSufficiency,
  type ConditionRatingRecord,
  type ConditionRatingScheme,
  type ConditionTrendDirection,
} from "./condition-rating";

export type ConditionAggregationWeighting = {
  weightingId: string;
  version: string;
  /** Component scope → weight (must sum conceptually; not assumed equal). */
  weights: Readonly<Record<string, number>>;
};

export type ConditionAggregationResult = {
  aggregationId: string;
  scheme: ConditionRatingScheme;
  weighting: ConditionAggregationWeighting;
  componentRatingIds: readonly string[];
  /** Null when abstaining — never invent a score. */
  aggregateOrdinalCode?: string;
  aggregateNumericScore?: number;
  confidence: number;
  uncertainty: number;
  evidenceSufficiency: ConditionEvidenceSufficiency;
  missingComponents: readonly string[];
  criticalComponentTriggered: boolean;
  stale: boolean;
  abstained: boolean;
  abstentionReason?: string;
  trend: ConditionTrendDirection;
  drillDown: readonly {
    ratingId: string;
    componentScope: string;
    observationIds: readonly string[];
  }[];
};

export function aggregateComponentRatings(input: {
  ratings: readonly ConditionRatingRecord[];
  weighting: ConditionAggregationWeighting;
  requiredComponents: readonly string[];
  criticalComponents?: readonly string[];
  minConfidence?: number;
}): ConditionAggregationResult {
  if (input.ratings.length === 0) {
    return abstainResult(input, "no_ratings", []);
  }
  const scheme = input.ratings[0]!.scheme;
  for (const r of input.ratings) {
    assertCompatibleScheme(scheme, r.scheme);
  }

  const byComponent = new Map(input.ratings.map((r) => [r.componentScope, r]));
  const missing = input.requiredComponents.filter((c) => !byComponent.has(c));
  const critical = input.criticalComponents ?? [];
  const criticalMissing = critical.filter((c) => missing.includes(c));
  if (criticalMissing.length > 0) {
    return abstainResult(input, `critical_component_missing:${criticalMissing.join(",")}`, missing);
  }

  const present = input.ratings.filter((r) => !r.stale);
  const stale = input.ratings.some((r) => r.stale);
  if (present.some((r) => r.evidenceSufficiency === "insufficient" || r.evidenceSufficiency === "abstain")) {
    return abstainResult(input, "component_evidence_insufficient", missing);
  }

  const minConfidence = input.minConfidence ?? 0.5;
  let weightSum = 0;
  let scoreSum = 0;
  let confSum = 0;
  let uncSum = 0;
  for (const r of present) {
    const w = input.weighting.weights[r.componentScope] ?? 0;
    if (w <= 0) continue;
    const value = r.published ?? r.humanApproved ?? r.observed;
    const numeric =
      value.numericScore ??
      scheme.scale.find((s) => s.code === value.ordinalCode)?.numericValue;
    if (numeric === undefined) {
      return abstainResult(input, `unmapped_ordinal:${value.ordinalCode}`, missing);
    }
    weightSum += w;
    scoreSum += numeric * w;
    confSum += r.confidence * w;
    uncSum += r.uncertainty * w;
  }
  if (weightSum <= 0) {
    return abstainResult(input, "zero_weight", missing);
  }

  const aggregateNumericScore = scoreSum / weightSum;
  const confidence = confSum / weightSum;
  const uncertainty = uncSum / weightSum;
  if (confidence < minConfidence) {
    return abstainResult(input, `confidence_below_threshold:${confidence}`, missing);
  }

  const criticalTriggered = present.some(
    (r) =>
      critical.includes(r.componentScope) &&
      ((r.published ?? r.humanApproved ?? r.observed).numericScore ??
        scheme.scale.find(
          (s) => s.code === (r.published ?? r.humanApproved ?? r.observed).ordinalCode,
        )?.numericValue ??
        0) >= 4,
  );

  let aggregateOrdinalCode: string | undefined;
  if (scheme.kind === "ordinal") {
    const rounded = Math.round(aggregateNumericScore);
    aggregateOrdinalCode =
      scheme.scale.find((s) => s.numericValue === rounded)?.code ?? String(rounded);
  }

  const trends = present.map((r) => r.trend);
  const trend: ConditionTrendDirection = trends.every((t) => t === trends[0])
    ? trends[0]!
    : "unknown";

  return {
    aggregationId: `agg_${Date.now().toString(36)}`,
    scheme,
    weighting: input.weighting,
    componentRatingIds: present.map((r) => r.ratingId),
    aggregateOrdinalCode,
    aggregateNumericScore,
    confidence,
    uncertainty,
    evidenceSufficiency: missing.length ? "marginal" : "sufficient",
    missingComponents: missing,
    criticalComponentTriggered: criticalTriggered,
    stale,
    abstained: false,
    trend,
    drillDown: present.map((r) => ({
      ratingId: r.ratingId,
      componentScope: r.componentScope,
      observationIds: r.observationIds,
    })),
  };
}

function abstainResult(
  input: {
    ratings: readonly ConditionRatingRecord[];
    weighting: ConditionAggregationWeighting;
    requiredComponents: readonly string[];
  },
  reason: string,
  missing: readonly string[],
): ConditionAggregationResult {
  const scheme =
    input.ratings[0]?.scheme ??
    ({
      schemeId: "unknown",
      version: "0",
      kind: "ordinal" as const,
      packId: "unknown",
      standardRefs: [],
      scale: [],
    } satisfies ConditionRatingScheme);
  return {
    aggregationId: `agg_abstain_${Date.now().toString(36)}`,
    scheme,
    weighting: input.weighting,
    componentRatingIds: input.ratings.map((r) => r.ratingId),
    confidence: 0,
    uncertainty: 1,
    evidenceSufficiency: "abstain",
    missingComponents: missing,
    criticalComponentTriggered: false,
    stale: input.ratings.some((r) => r.stale),
    abstained: true,
    abstentionReason: reason,
    trend: "unknown",
    drillDown: input.ratings.map((r) => ({
      ratingId: r.ratingId,
      componentScope: r.componentScope,
      observationIds: r.observationIds,
    })),
  };
}
