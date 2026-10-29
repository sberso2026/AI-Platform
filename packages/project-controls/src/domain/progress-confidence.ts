/**
 * Phase 11B — Progress Confidence Engine.
 *
 * Scores the *evidence basis* for a progress assessment and decides whether the
 * basis is sufficient, limited, insufficient, conflicting or stale. A verdict of
 * anything other than sufficient/limited forces the progress engine to abstain.
 *
 * Mirrors the Asset Intelligence evidence confidence engine so the two modules
 * behave identically under thin evidence.
 */

import {
  isAbstainingSufficiency,
  type ProgressConfidence,
  type ProgressConfidenceClass,
  type ProgressEvidence,
  type ProgressEvidenceSufficiency,
  type ProjectScopeRef,
} from "./progress";

export type ProgressConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  evidence: readonly ProgressEvidence[];
  asOf?: string;
  /** Hours after which evidence is considered fully stale. Default 90 days. */
  freshnessHorizonHours?: number;
  /** Score below which the basis is insufficient. Default 0.45. */
  sufficiencyThreshold?: number;
  /** Spread in reported completion above which sources are in conflict. Default 0.35. */
  disagreementThreshold?: number;
  /** Minimum usable observations before a number may be published. Default 2. */
  minimumEvidenceCount?: number;
};

export class ProgressConfidenceEngine {
  readonly kind = "progress_confidence_engine" as const;

  assess(input: ProgressConfidenceInput): ProgressConfidence {
    const asOf = input.asOf ?? new Date().toISOString();
    const horizonHours = input.freshnessHorizonHours ?? 2160;
    const threshold = input.sufficiencyThreshold ?? 0.45;
    const disagreementThreshold = input.disagreementThreshold ?? 0.35;
    const minimumEvidenceCount = input.minimumEvidenceCount ?? 2;
    const reasons: string[] = [];

    const all = input.evidence ?? [];
    const usable = all.filter((item) => !item.revoked);
    if (usable.length < all.length) reasons.push("revoked_evidence_excluded");
    if (usable.length === 0) reasons.push("no_progress_evidence");

    const declaredConflict = usable.some((item) => (item.conflictsWith ?? []).length > 0);
    if (declaredConflict) reasons.push("declared_evidence_conflict");

    const volume = clamp01(usable.length / Math.max(1, minimumEvidenceCount + 1));
    const freshness = scoreFreshness(usable, asOf, horizonHours);
    if (usable.length > 0 && freshness < 0.3) reasons.push("stale_progress_evidence");

    const sources = new Set(usable.map((item) => item.sourceKey));
    const kinds = new Set(usable.map((item) => item.kind));
    const sourceDiversity = clamp01((sources.size + kinds.size) / 4);
    if (sources.size < 2 && usable.length > 0) reasons.push("single_source_basis");

    const reviewCompleteness = scoreReviewCompleteness(usable);
    if (reviewCompleteness < 0.5) reasons.push("evidence_review_incomplete");

    const { agreement, spread, quantified } = scoreAgreement(usable);
    const numericConflict = quantified >= 2 && spread > disagreementThreshold;
    if (numericConflict) reasons.push("evidence_disagreement_exceeds_threshold");
    if (quantified === 0 && usable.length > 0) reasons.push("no_quantified_evidence");

    const score = clamp01(
      0.3 * volume +
        0.2 * freshness +
        0.2 * sourceDiversity +
        0.15 * reviewCompleteness +
        0.15 * agreement,
    );

    const conflictDetected = declaredConflict || numericConflict;

    let dataSufficiency: ProgressEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = "conflicting_progress_evidence";
    } else if (usable.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_progress_evidence";
    } else if (freshness < 0.2) {
      dataSufficiency = "stale";
      abstentionReason = "stale_progress_evidence";
    } else if (usable.length < minimumEvidenceCount || quantified === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_progress_evidence";
    } else if (score < threshold) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_progress_evidence";
    } else if (score < 0.65) {
      dataSufficiency = "limited";
    }

    const confidenceClass: ProgressConfidenceClass = isAbstainingSufficiency(dataSufficiency)
      ? "unavailable"
      : score >= 0.75
        ? "high"
        : score >= 0.5
          ? "medium"
          : "low";

    return {
      confidenceId: input.confidenceId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      score,
      confidenceClass,
      dataSufficiency,
      evidenceCount: all.length,
      usableEvidenceCount: usable.length,
      sourceDiversity,
      freshness,
      reviewCompleteness,
      agreement,
      conflictState: conflictDetected ? "detected" : "none",
      abstentionReason,
      reasons,
      method: "progress_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      engineeringCorrectnessClaimed: false,
    };
  }
}

export function createProgressConfidenceEngine(): ProgressConfidenceEngine {
  return new ProgressConfidenceEngine();
}

function scoreFreshness(
  evidence: readonly ProgressEvidence[],
  asOf: string,
  horizonHours: number,
): number {
  const observed = evidence
    .map((item) => item.observedAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value));
  if (observed.length === 0) return evidence.length === 0 ? 0 : 0.2;
  const newest = Math.max(...observed);
  const ageHours = (Date.parse(asOf) - newest) / (1000 * 60 * 60);
  if (!Number.isFinite(ageHours) || ageHours < 0) return 0.2;
  return clamp01(1 - ageHours / horizonHours);
}

function scoreReviewCompleteness(evidence: readonly ProgressEvidence[]): number {
  if (evidence.length === 0) return 0;
  const total = evidence.reduce((sum, item) => {
    switch (item.reviewStatus) {
      case "published":
      case "approved":
        return sum + 1;
      case "reviewed":
        return sum + 0.75;
      case "pending_review":
        return sum + 0.5;
      default:
        return sum + 0.25;
    }
  }, 0);
  return clamp01(total / evidence.length);
}

function scoreAgreement(evidence: readonly ProgressEvidence[]): {
  agreement: number;
  spread: number;
  quantified: number;
} {
  const values = evidence
    .map((item) => item.indicatedCompletion)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .map(clamp01);
  if (values.length === 0) return { agreement: 0, spread: 0, quantified: 0 };
  if (values.length === 1) return { agreement: 0.6, spread: 0, quantified: 1 };
  const spread = Math.max(...values) - Math.min(...values);
  return { agreement: clamp01(1 - spread), spread, quantified: values.length };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
