/**
 * Phase 10F — Change Detection Engine (rule-based / heuristic only).
 * Not predictive ML. Not PoF. Not RUL.
 */

import type { EngineeringTimeSeries } from "./time-series";
import type { TrendConfidenceAssessment } from "./trend-confidence";

export type ChangeSignalKind =
  | "step_change"
  | "slope_change"
  | "level_shift"
  | "volatility_increase"
  | "insufficient_data"
  | "none_detected";

export type ChangeDetectionResult = {
  kind: "change_detection";
  detectionId: string;
  assetId: string;
  seriesId: string;
  assessedAt: string;
  signals: Array<{
    signalKind: ChangeSignalKind;
    at?: string;
    magnitudeHint?: number;
    confidence: number;
  }>;
  method: "change_detection_heuristic_v1";
  trendConfidenceRef?: string;
  abstained: boolean;
  abstentionReason?: string;
  predictiveMlUsed: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  limitations: string[];
};

export class ChangeDetectionEngine {
  readonly kind = "change_detection_engine" as const;

  detect(input: {
    detectionId: string;
    series: EngineeringTimeSeries;
    assessedAt: string;
    trendConfidence?: TrendConfidenceAssessment;
  }): ChangeDetectionResult {
    const tc = input.trendConfidence;
    if (
      tc &&
      (tc.dataSufficiency === "insufficient" ||
        tc.dataSufficiency === "conflicting" ||
        tc.dataSufficiency === "stale" ||
        tc.dataSufficiency === "revoked")
    ) {
      return base(input, true, tc.abstentionReason ?? "insufficient_trend_confidence", [
        { signalKind: "insufficient_data", confidence: 0 },
      ]);
    }

    const points = input.series.points;
    if (points.length < 3) {
      return base(input, true, "insufficient_points", [
        { signalKind: "insufficient_data", confidence: 0 },
      ]);
    }

    const values = points.map((p) => p.value);
    const n = values.length;
    const mid = Math.floor(n / 2);
    const first = values.slice(0, mid);
    const second = values.slice(mid);
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const variance = (xs: number[]) => {
      const m = mean(xs);
      return xs.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, xs.length);
    };

    const m1 = mean(first);
    const m2 = mean(second);
    const delta = m2 - m1;
    const scale = Math.max(1e-9, Math.abs(m1) || 1);
    const relative = Math.abs(delta) / scale;
    const v1 = variance(first);
    const v2 = variance(second);

    const signals: ChangeDetectionResult["signals"] = [];
    if (relative >= 0.15) {
      signals.push({
        signalKind: "level_shift",
        at: points[mid]?.observedAt,
        magnitudeHint: Number(delta.toFixed(6)),
        confidence: Math.min(0.9, 0.5 + relative),
      });
    }

    // Simple end-vs-start slope heuristic (not certified rate).
    const slope = (values[n - 1]! - values[0]!) / Math.max(1, n - 1);
    const slopeRel = Math.abs(slope) / scale;
    if (slopeRel >= 0.02) {
      signals.push({
        signalKind: "slope_change",
        magnitudeHint: Number(slope.toFixed(6)),
        confidence: Math.min(0.85, 0.4 + slopeRel * 5),
      });
    }

    if (v2 > v1 * 2.5 && v2 > 0) {
      signals.push({
        signalKind: "volatility_increase",
        at: points[mid]?.observedAt,
        confidence: 0.55,
      });
    }

    if (signals.length === 0) {
      signals.push({ signalKind: "none_detected", confidence: 0.6 });
    }

    return base(input, false, undefined, signals);
  }
}

export function createChangeDetectionEngine(): ChangeDetectionEngine {
  return new ChangeDetectionEngine();
}

function base(
  input: {
    detectionId: string;
    series: EngineeringTimeSeries;
    assessedAt: string;
    trendConfidence?: TrendConfidenceAssessment;
  },
  abstained: boolean,
  abstentionReason: string | undefined,
  signals: ChangeDetectionResult["signals"],
): ChangeDetectionResult {
  return {
    kind: "change_detection",
    detectionId: input.detectionId,
    assetId: input.series.assetId,
    seriesId: input.series.seriesId,
    assessedAt: input.assessedAt,
    signals,
    method: "change_detection_heuristic_v1",
    trendConfidenceRef: input.trendConfidence?.assessmentId,
    abstained,
    abstentionReason,
    predictiveMlUsed: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    limitations: [
      "heuristic_only",
      "not_predictive_ml",
      "not_pof",
      "not_rul",
      "advisory_until_reviewed",
    ],
  };
}
