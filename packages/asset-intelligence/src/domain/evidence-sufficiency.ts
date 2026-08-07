/**
 * Phase 10C — Evidence sufficiency for Health Composition Engine.
 * Advisory only; not predictive accuracy / RUL certification.
 */

export type EvidenceSufficiencyRecord = {
  sufficiencyScore: number;
  freshnessScore: number;
  sourceDiversityScore: number;
  reviewCompletenessScore: number;
  uncertaintyScore: number;
  sufficient: boolean;
  reasons: string[];
  computedAt: string;
  method: "evidence_sufficiency_v1";
};

export type EvidenceSufficiencyInput = {
  evidenceRefs?: string[];
  sourceKeys?: string[];
  observedAt?: string;
  asOf?: string;
  reviewStatus?: string;
  confidenceHint?: number;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
};

export function computeEvidenceSufficiency(
  input: EvidenceSufficiencyInput,
): EvidenceSufficiencyRecord {
  const asOf = input.asOf ?? new Date().toISOString();
  const refs = input.evidenceRefs ?? [];
  const sources = new Set(input.sourceKeys ?? []);
  const reasons: string[] = [];

  const evidenceVolumeScore = Math.min(1, refs.length / 3);
  if (refs.length === 0) reasons.push("no_evidence_refs");

  const freshnessScore = scoreFreshness(
    input.observedAt,
    asOf,
    input.freshnessHorizonHours ?? 2160,
  );
  if (freshnessScore < 0.3) reasons.push("stale_evidence");

  const sourceDiversityScore = Math.min(1, sources.size / 2);
  if (sources.size < 1) reasons.push("no_registered_sources");

  const reviewCompletenessScore =
    input.reviewStatus === "approved"
      ? 1
      : input.reviewStatus === "pending_review" || input.reviewStatus === "in_review"
        ? 0.5
        : input.reviewStatus
          ? 0.35
          : 0.2;
  if (reviewCompletenessScore < 0.5) reasons.push("review_incomplete");

  const uncertaintyScore = clamp01(
    1 -
      (0.35 * evidenceVolumeScore +
        0.25 * freshnessScore +
        0.2 * sourceDiversityScore +
        0.2 * reviewCompletenessScore),
  );

  const hint = typeof input.confidenceHint === "number" ? clamp01(input.confidenceHint) : 0.5;
  const sufficiencyScore = clamp01(
    0.3 * evidenceVolumeScore +
      0.25 * freshnessScore +
      0.2 * sourceDiversityScore +
      0.15 * reviewCompletenessScore +
      0.1 * hint,
  );

  const threshold = input.sufficiencyThreshold ?? 0.45;
  const sufficient = sufficiencyScore >= threshold && refs.length > 0;
  if (!sufficient) reasons.push("insufficient_evidence");

  return {
    sufficiencyScore,
    freshnessScore,
    sourceDiversityScore,
    reviewCompletenessScore,
    uncertaintyScore,
    sufficient,
    reasons,
    computedAt: asOf,
    method: "evidence_sufficiency_v1",
  };
}

function scoreFreshness(
  observedAt: string | undefined,
  asOf: string,
  horizonHours: number,
): number {
  if (!observedAt) return 0.2;
  const ageMs = Date.parse(asOf) - Date.parse(observedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0) return 0.2;
  const ageHours = ageMs / (1000 * 60 * 60);
  return clamp01(1 - ageHours / horizonHours);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
