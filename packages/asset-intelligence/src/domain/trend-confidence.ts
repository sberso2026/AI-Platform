/**
 * Phase 10F — Trend Confidence (sufficiency for trend/degradation conclusions).
 */

export type TrendSufficiency =
  | "sufficient"
  | "limited"
  | "insufficient"
  | "conflicting"
  | "stale"
  | "revoked";

export type TrendConfidenceAssessment = {
  assessmentId: string;
  assetId: string;
  seriesId?: string;
  scope: "trend_intelligence" | "degradation_analysis" | "change_detection";
  score: number;
  confidenceClass: "high" | "moderate" | "low" | "abstain";
  pointCount: number;
  windowCoverage: number;
  freshness: number;
  sourceDiversity: number;
  conflictState: "none" | "minor" | "major";
  dataSufficiency: TrendSufficiency;
  abstentionReason?: string;
  method: "trend_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  reasons: string[];
  predictiveMlUsed: false;
  rulClaimsCertified: false;
};

export type TrendConfidenceInput = {
  assessmentId: string;
  assetId: string;
  seriesId?: string;
  scope?: TrendConfidenceAssessment["scope"];
  pointCount: number;
  windowStart?: string;
  windowEnd?: string;
  asOf: string;
  sourceKeys?: string[];
  hasConflict?: boolean;
  hasRevoked?: boolean;
  staleDays?: number;
  qualitySuspectRatio?: number;
};

export class TrendConfidenceEngine {
  readonly kind = "trend_confidence_engine" as const;

  assess(input: TrendConfidenceInput): TrendConfidenceAssessment {
    const pointCount = input.pointCount;
    const sourceDiversity = Math.min(1, (input.sourceKeys?.length ?? 0) / 2);
    const staleDays = input.staleDays ?? 0;
    const freshness = staleDays > 365 ? 0.2 : staleDays > 90 ? 0.5 : 0.9;
    const windowCoverage =
      pointCount >= 8 ? 1 : pointCount >= 5 ? 0.7 : pointCount >= 3 ? 0.4 : 0.1;
    const qualityPenalty = Math.min(0.4, (input.qualitySuspectRatio ?? 0) * 0.5);

    let dataSufficiency: TrendSufficiency = "sufficient";
    let abstentionReason: string | undefined;
    const reasons: string[] = [];

    if (input.hasRevoked) {
      dataSufficiency = "revoked";
      abstentionReason = "revoked_evidence";
      reasons.push("revoked_points_present");
    } else if (input.hasConflict) {
      dataSufficiency = "conflicting";
      abstentionReason = "conflicting_points";
      reasons.push("conflicting_observations");
    } else if (staleDays > 365) {
      dataSufficiency = "stale";
      abstentionReason = "stale_series";
      reasons.push("series_stale");
    } else if (pointCount < 3) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_points";
      reasons.push("point_count_below_minimum");
    } else if (pointCount < 5 || qualityPenalty > 0.2) {
      dataSufficiency = "limited";
      reasons.push("limited_coverage_or_quality");
    } else {
      reasons.push("adequate_window");
    }

    const raw =
      0.35 * windowCoverage +
      0.25 * freshness +
      0.2 * sourceDiversity +
      0.2 * Math.min(1, pointCount / 10) -
      qualityPenalty;
    const score = Math.max(0, Math.min(1, Number(raw.toFixed(4))));

    const mustAbstain =
      dataSufficiency === "insufficient" ||
      dataSufficiency === "conflicting" ||
      dataSufficiency === "stale" ||
      dataSufficiency === "revoked";

    return {
      assessmentId: input.assessmentId,
      assetId: input.assetId,
      seriesId: input.seriesId,
      scope: input.scope ?? "trend_intelligence",
      score: mustAbstain ? Math.min(score, 0.3) : score,
      confidenceClass: mustAbstain
        ? "abstain"
        : score >= 0.75
          ? "high"
          : score >= 0.5
            ? "moderate"
            : "low",
      pointCount,
      windowCoverage,
      freshness,
      sourceDiversity,
      conflictState: input.hasConflict ? "major" : "none",
      dataSufficiency,
      abstentionReason,
      method: "trend_confidence_v1",
      methodVersion: "1",
      assessedAt: input.asOf,
      reasons,
      predictiveMlUsed: false,
      rulClaimsCertified: false,
    };
  }
}

export function createTrendConfidenceEngine(): TrendConfidenceEngine {
  return new TrendConfidenceEngine();
}
