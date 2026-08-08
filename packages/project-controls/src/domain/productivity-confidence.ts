/**
 * Phase 11F — Productivity Confidence Engine.
 *
 * Scores the evidence basis for a productivity assessment. Anything other than
 * sufficient/limited forces the productivity engine to abstain.
 */

import {
  isAbstainingProductivitySufficiency,
  type ProductivityConfidence,
  type ProductivityConfidenceClass,
  type ProductivityControlContext,
  type ProductivityEvidence,
  type ProductivityEvidenceProvenance,
  type ProductivityEvidenceSufficiency,
} from "./productivity";
import type { ProjectScopeRef } from "./progress";

export type ProductivityConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  controlContext: ProductivityControlContext;
  evidence: readonly ProductivityEvidence[];
  asOf?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumEvidenceCount?: number;
};

const PROVENANCE_QUALITY: Record<ProductivityEvidenceProvenance, number> = {
  primary_source: 1,
  system_reference: 0.8,
  human_attestation: 0.7,
  derived_reference: 0.4,
  unknown: 0.2,
};

export class ProductivityConfidenceEngine {
  readonly kind = "productivity_confidence_engine" as const;

  assess(input: ProductivityConfidenceInput): ProductivityConfidence {
    const asOf = input.asOf ?? new Date().toISOString();
    const horizonHours = input.freshnessHorizonHours ?? 2160;
    const threshold = input.sufficiencyThreshold ?? 0.45;
    const minimumEvidenceCount = input.minimumEvidenceCount ?? 2;
    const reasons: string[] = [];

    const all = input.evidence ?? [];
    const revoked = all.filter(
      (item) => item.revoked === true || item.reviewStatus === "revoked",
    );
    const usable = all.filter(
      (item) => item.revoked !== true && item.reviewStatus !== "revoked",
    );
    if (revoked.length > 0) reasons.push("revoked_productivity_evidence_excluded");
    if (usable.length === 0 && all.length > 0) reasons.push("all_productivity_evidence_revoked");
    if (all.length === 0) reasons.push("no_productivity_evidence");

    const declaredConflict = usable.some((item) => (item.conflictsWith ?? []).length > 0);
    if (declaredConflict) reasons.push("declared_evidence_conflict");

    const forbiddenClaim = usable.some(
      (item) =>
        item.derivedFromTimesheet !== false ||
        item.derivedFromPayroll !== false ||
        item.labourProductivityPercentClaimed !== false ||
        item.resourcePlanningClaimed !== false ||
        item.forecastDerived !== false ||
        item.earnedValueDerived !== false,
    );
    if (forbiddenClaim) reasons.push("forbidden_productivity_evidence_claim");

    const volume = clamp01(usable.length / Math.max(1, minimumEvidenceCount + 1));
    const freshness = scoreFreshness(usable, asOf, horizonHours);
    if (usable.length > 0 && freshness < 0.3) reasons.push("stale_productivity_evidence");

    const sources = new Set(usable.map((item) => item.sourceKey));
    const kinds = new Set(usable.map((item) => item.kind));
    const sourceDiversity = clamp01((sources.size + kinds.size) / 4);
    if (sources.size < 2 && usable.length > 0) reasons.push("single_source_basis");

    const reviewCompleteness = scoreReviewCompleteness(usable);
    if (reviewCompleteness < 0.5) reasons.push("evidence_review_incomplete");

    const provenanceQuality = scoreProvenance(usable);
    if (usable.length > 0 && provenanceQuality < 0.5) {
      reasons.push("weak_productivity_evidence_provenance");
    }

    const { agreement, trendConflict, declaredCount } = scoreAgreement(usable);
    if (trendConflict) reasons.push("declared_productivity_trend_conflict");
    if (declaredCount === 0 && usable.length > 0) reasons.push("no_declared_productivity_trend");

    const score = clamp01(
      0.25 * volume +
        0.2 * freshness +
        0.15 * sourceDiversity +
        0.1 * reviewCompleteness +
        0.15 * provenanceQuality +
        0.15 * agreement,
    );

    const conflictDetected = declaredConflict || trendConflict || forbiddenClaim;

    let dataSufficiency: ProductivityEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = forbiddenClaim
        ? "forbidden_productivity_evidence_claim"
        : "conflicting_productivity_evidence";
    } else if (usable.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = all.length > 0 ? "all_productivity_evidence_revoked" : "no_productivity_evidence";
    } else if (freshness < 0.2) {
      dataSufficiency = "stale";
      abstentionReason = "stale_productivity_evidence";
    } else if (usable.length < minimumEvidenceCount || declaredCount === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_productivity_evidence";
    } else if (score < threshold) {
      dataSufficiency = "limited";
      reasons.push("limited_productivity_evidence_basis");
    }

    const abstention = isAbstainingProductivitySufficiency(dataSufficiency);
    if (abstention && !abstentionReason) {
      abstentionReason = "insufficient_productivity_evidence";
    }

    return {
      confidenceId: input.confidenceId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      score,
      confidenceClass: confidenceClassFor(score, dataSufficiency),
      dataSufficiency,
      evidenceCount: all.length,
      usableEvidenceCount: usable.length,
      sourceDiversity,
      freshness,
      reviewCompleteness,
      provenanceQuality,
      agreement,
      conflictState: conflictDetected ? "detected" : "none",
      abstention,
      abstentionReason,
      reasons: [...new Set(reasons)],
      method: "productivity_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      labourProductivityPercentClaimed: false,
      workforceManagementClaimed: false,
    };
  }
}

export function createProductivityConfidenceEngine(): ProductivityConfidenceEngine {
  return new ProductivityConfidenceEngine();
}

function confidenceClassFor(
  score: number,
  sufficiency: ProductivityEvidenceSufficiency,
): ProductivityConfidenceClass {
  if (isAbstainingProductivitySufficiency(sufficiency)) return "unavailable";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scoreFreshness(
  evidence: readonly ProductivityEvidence[],
  asOf: string,
  horizonHours: number,
): number {
  if (evidence.length === 0) return 0;
  const asOfMs = Date.parse(asOf);
  const scores = evidence.map((item) => {
    if (!item.observedAt) return 0.4;
    const ageHours = Math.max(0, (asOfMs - Date.parse(item.observedAt)) / 3_600_000);
    return clamp01(1 - ageHours / horizonHours);
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function scoreReviewCompleteness(evidence: readonly ProductivityEvidence[]): number {
  if (evidence.length === 0) return 0;
  const reviewed = evidence.filter(
    (item) =>
      item.reviewStatus === "reviewed" ||
      item.reviewStatus === "approved" ||
      item.reviewStatus === "published",
  ).length;
  return reviewed / evidence.length;
}

function scoreProvenance(evidence: readonly ProductivityEvidence[]): number {
  if (evidence.length === 0) return 0;
  const total = evidence.reduce(
    (sum, item) => sum + (PROVENANCE_QUALITY[item.provenance] ?? 0.2),
    0,
  );
  return clamp01(total / evidence.length);
}

function scoreAgreement(evidence: readonly ProductivityEvidence[]): {
  agreement: number;
  trendConflict: boolean;
  declaredCount: number;
} {
  const trends = evidence
    .map((item) => item.declaredTrend)
    .filter((value): value is NonNullable<ProductivityEvidence["declaredTrend"]> =>
      typeof value === "string",
    )
    .filter((value) => value !== "unknown");

  const declaredCount = trends.length;
  const declining = trends.filter((value) => value === "declining").length;
  const improving = trends.filter((value) => value === "improving").length;
  const trendConflict = declining > 0 && improving > 0 && declining === improving;

  let agreement = 1;
  if (trendConflict) agreement = 0.2;
  else if (declaredCount === 0) agreement = 0.4;
  else if (trends.length >= 2 && new Set(trends).size === 1) agreement = 1;
  else agreement = 0.85;

  return { agreement, trendConflict, declaredCount };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
