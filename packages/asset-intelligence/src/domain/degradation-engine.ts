/**
 * Phase 10F — Trend / Degradation Intelligence Engine.
 * Builds on Engineering Time Series, Change Detection, and Trend Confidence.
 */

import {
  createChangeDetectionEngine,
  type ChangeDetectionEngine,
} from "./change-detection";
import type {
  AssetDegradationState,
  AssetTrendState,
  TrendDegradationAssessmentInput,
  TrendDegradationBundle,
  TrendDirection,
} from "./degradation";
import {
  createTrendConfidenceEngine,
  type TrendConfidenceEngine,
} from "./trend-confidence";

export type AssetTrendIntelligenceEngineDeps = {
  trendConfidenceEngine?: TrendConfidenceEngine;
  changeDetectionEngine?: ChangeDetectionEngine;
  newId?: (prefix: string) => string;
};

export class AssetTrendIntelligenceEngine {
  readonly kind = "asset_trend_intelligence_engine" as const;
  private readonly trendConfidence: TrendConfidenceEngine;
  private readonly changeDetection: ChangeDetectionEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: AssetTrendIntelligenceEngineDeps = {}) {
    this.trendConfidence = deps.trendConfidenceEngine ?? createTrendConfidenceEngine();
    this.changeDetection = deps.changeDetectionEngine ?? createChangeDetectionEngine();
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  assess(input: TrendDegradationAssessmentInput): TrendDegradationBundle {
    const series = input.series;
    const suspect =
      series.points.filter((p) => p.quality === "suspect" || p.quality === "poor")
        .length / Math.max(1, series.points.length);

    const trendConfidence =
      input.trendConfidence ??
      this.trendConfidence.assess({
        assessmentId: this.newId("tc"),
        assetId: input.assetId,
        seriesId: series.seriesId,
        scope: "trend_intelligence",
        pointCount: series.points.length,
        windowStart: series.windowStart,
        windowEnd: series.windowEnd,
        asOf: input.recordedAt,
        sourceKeys: input.sourceRefs ?? [input.provenance.sourceSystem],
        qualitySuspectRatio: suspect,
      });

    const changeDetection = this.changeDetection.detect({
      detectionId: this.newId("cd"),
      series,
      assessedAt: input.recordedAt,
      trendConfidence,
    });

    const abstain =
      trendConfidence.confidenceClass === "abstain" ||
      changeDetection.abstained ||
      trendConfidence.dataSufficiency === "insufficient" ||
      trendConfidence.dataSufficiency === "conflicting" ||
      trendConfidence.dataSufficiency === "stale" ||
      trendConfidence.dataSufficiency === "revoked";

    const direction = abstain
      ? ("indeterminate" as const)
      : inferDirection(series, changeDetection.signals.map((s) => s.signalKind));

    const trend: AssetTrendState = {
      kind: "trend",
      stateId: this.newId("trend"),
      assetId: input.assetId,
      recordedAt: input.recordedAt,
      provenance: {
        ...input.provenance,
        method: abstain ? "abstain_insufficient_trend_confidence" : "governed_trend_v1",
        confidence: trendConfidence.score,
      },
      silentIdentityMutationForbidden: true,
      seriesId: series.seriesId,
      attributeKey: series.attributeKey,
      trendDirection: direction,
      trendClass: "qualitative",
      slopeHint: abstain ? undefined : slopeHint(series),
      windowStart: series.windowStart,
      windowEnd: series.windowEnd,
      method: abstain ? "abstain_insufficient_trend_confidence" : "governed_trend_v1",
      confidence: trendConfidence.score,
      trendConfidenceRef: trendConfidence.assessmentId,
      changeDetectionRef: changeDetection.detectionId,
      evidenceRefs: input.evidenceRefs ?? series.evidenceRefs,
      sourceRefs: input.sourceRefs,
      reviewStatus: abstain
        ? "draft"
        : input.startReview === false
          ? "draft"
          : "pending_review",
      assessedAt: input.recordedAt,
      limitations: [
        "advisory_only",
        "not_certified_rate",
        "not_rul",
        "not_pof",
        "heuristic_change_detection",
      ],
      trendConfidence,
      changeDetection,
      predictiveMlUsed: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      accuracyClaimsCertified: false,
      aiMayPublishForbidden: true,
    };

    const degradation: AssetDegradationState = {
      kind: "degradation",
      stateId: this.newId("deg"),
      assetId: input.assetId,
      recordedAt: input.recordedAt,
      provenance: trend.provenance,
      silentIdentityMutationForbidden: true,
      seriesId: series.seriesId,
      trendStateId: trend.stateId,
      changeDetectionId: changeDetection.detectionId,
      relatedFailureModeCodes: input.relatedFailureModeCodes ?? [],
      degradationDirection: direction,
      degradationClass: "qualitative",
      severityHint: abstain
        ? "indeterminate"
        : direction === "degrading"
          ? "moderate"
          : direction === "improving"
            ? "low"
            : "none",
      mechanismContext: input.mechanismContext,
      method: trend.method,
      confidence: trendConfidence.score,
      trendConfidenceRef: trendConfidence.assessmentId,
      evidenceConfidenceRef: input.evidenceConfidenceRef,
      evidenceRefs: trend.evidenceRefs,
      sourceRefs: input.sourceRefs,
      reviewStatus: trend.reviewStatus,
      assessedAt: input.recordedAt,
      limitations: [
        "advisory_only",
        "not_failure_mode_claim",
        "not_predictive_ml",
        "not_rul",
        "failure_presence_not_auto_trend",
        ...(input.relatedFailureModeCodes?.length
          ? ["failure_context_optional_only"]
          : []),
      ],
      predictiveMlUsed: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      accuracyClaimsCertified: false,
      aiMayPublishForbidden: true,
      isFailureModeClaim: false,
    };

    return {
      series,
      trend,
      degradation,
      changeDetection,
      trendConfidence,
      abstained: abstain,
      abstentionReason: abstain
        ? trendConfidence.abstentionReason ??
          changeDetection.abstentionReason ??
          "insufficient_evidence"
        : undefined,
    };
  }
}

export function createAssetTrendIntelligenceEngine(
  deps?: AssetTrendIntelligenceEngineDeps,
): AssetTrendIntelligenceEngine {
  return new AssetTrendIntelligenceEngine(deps);
}

function slopeHint(series: { points: Array<{ value: number }> }): number | undefined {
  const pts = series.points;
  if (pts.length < 2) return undefined;
  const slope = (pts[pts.length - 1]!.value - pts[0]!.value) / (pts.length - 1);
  return Number(slope.toFixed(6));
}

function inferDirection(
  series: { orientation: string; points: Array<{ value: number }> },
  signalKinds: string[],
): TrendDirection {
  if (series.points.length < 2) return "indeterminate";
  const delta = series.points[series.points.length - 1]!.value - series.points[0]!.value;
  const scale = Math.max(1e-9, Math.abs(series.points[0]!.value) || 1);
  if (Math.abs(delta) / scale < 0.05 && !signalKinds.includes("level_shift")) {
    return "stable";
  }
  const worsening =
    series.orientation === "decreasing_worse" ? delta < 0 : delta > 0;
  if (series.orientation === "neutral") return "indeterminate";
  return worsening ? "degrading" : "improving";
}
