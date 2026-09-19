import { failClosed } from "./errors";

/**
 * Review confidence — detector/model self-support, not engineering severity.
 *
 * Score is a closed unit interval quantized to two decimal places.
 * It is **not** a calibrated probability of engineering truth and must not
 * be displayed as fake precision beyond that quantum.
 *
 * Bands:
 * - low:    0.00–0.34
 * - medium: 0.35–0.67
 * - high:   0.68–1.00
 */
export const REVIEW_CONFIDENCE_BANDS = ["low", "medium", "high"] as const;
export type ReviewConfidenceBand = (typeof REVIEW_CONFIDENCE_BANDS)[number];

export type ReviewConfidence = {
  band: ReviewConfidenceBand;
  score: number;
};

const BAND_MIDPOINT: Record<ReviewConfidenceBand, number> = {
  low: 0.2,
  medium: 0.5,
  high: 0.85,
};

export function quantizeConfidenceScore(score: number): number {
  if (!Number.isFinite(score) || score < 0 || score > 1) {
    failClosed("confidence_out_of_bounds", "Confidence score must be a finite number in [0, 1]", {
      score,
    });
  }
  return Math.round(score * 100) / 100;
}

export function bandFromScore(score: number): ReviewConfidenceBand {
  const quantized = quantizeConfidenceScore(score);
  if (quantized <= 0.34) return "low";
  if (quantized <= 0.67) return "medium";
  return "high";
}

export function createReviewConfidence(input: {
  band?: ReviewConfidenceBand;
  score?: number;
}): ReviewConfidence {
  if (input.score === undefined && input.band === undefined) {
    failClosed("confidence_required", "Confidence band or score is required");
  }
  if (input.score !== undefined && input.band !== undefined) {
    const quantized = quantizeConfidenceScore(input.score);
    const derived = bandFromScore(quantized);
    if (derived !== input.band) {
      failClosed("confidence_band_mismatch", "Confidence band does not match score", {
        band: input.band,
        score: quantized,
        derived,
      });
    }
    return { band: input.band, score: quantized };
  }
  if (input.score !== undefined) {
    const score = quantizeConfidenceScore(input.score);
    return { band: bandFromScore(score), score };
  }
  const band = input.band as ReviewConfidenceBand;
  if (!(REVIEW_CONFIDENCE_BANDS as readonly string[]).includes(band)) {
    failClosed("confidence_band_invalid", "Invalid confidence band", { band });
  }
  return { band, score: BAND_MIDPOINT[band] };
}
