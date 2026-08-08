/**
 * Phase 11E — Cost Confidence Engine.
 *
 * Scores the evidence basis for a cost assessment. Anything other than
 * sufficient/limited forces the cost engine to abstain. Confidence never
 * asserts financial certainty and never asserts engineering correctness.
 */

import {
  currenciesCompatible,
  isAbstainingCostSufficiency,
  type CostBasisReference,
  type CostConfidence,
  type CostConfidenceClass,
  type CostControlContext,
  type CostEvidence,
  type CostEvidenceProvenance,
  type CostEvidenceSufficiency,
} from "./cost";
import type { ProjectScopeRef } from "./progress";

export type CostConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  controlContext: CostControlContext;
  costBasisRef?: CostBasisReference;
  evidence: readonly CostEvidence[];
  asOf?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumEvidenceCount?: number;
};

const PROVENANCE_QUALITY: Record<CostEvidenceProvenance, number> = {
  primary_source: 1,
  system_reference: 0.8,
  human_attestation: 0.7,
  derived_reference: 0.4,
  unknown: 0.2,
};

export class CostConfidenceEngine {
  readonly kind = "cost_confidence_engine" as const;

  assess(input: CostConfidenceInput): CostConfidence {
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
    if (revoked.length > 0) reasons.push("revoked_cost_evidence_excluded");
    if (usable.length === 0 && all.length > 0) reasons.push("all_cost_evidence_revoked");
    if (all.length === 0) reasons.push("no_cost_evidence");

    const currencyCheck = currenciesCompatible(
      input.controlContext.currencyCode,
      input.costBasisRef,
      usable,
    );
    const currencyConsistency = currencyCheck.compatible ? 1 : 0;
    if (!currencyCheck.compatible) {
      reasons.push(currencyCheck.reason ?? "incompatible_currencies");
    }

    const basisCompatibility = input.costBasisRef ? 1 : 0;
    if (!input.costBasisRef) reasons.push("no_cost_basis_reference");

    const declaredConflict = usable.some((item) => (item.conflictsWith ?? []).length > 0);
    if (declaredConflict) reasons.push("declared_evidence_conflict");

    const volume = clamp01(usable.length / Math.max(1, minimumEvidenceCount + 1));
    const freshness = scoreFreshness(usable, asOf, horizonHours);
    if (usable.length > 0 && freshness < 0.3) reasons.push("stale_cost_evidence");

    const sources = new Set(usable.map((item) => item.sourceKey));
    const kinds = new Set(usable.map((item) => item.kind));
    const sourceDiversity = clamp01((sources.size + kinds.size) / 4);
    if (sources.size < 2 && usable.length > 0) reasons.push("single_source_basis");

    const reviewCompleteness = scoreReviewCompleteness(usable);
    if (reviewCompleteness < 0.5) reasons.push("evidence_review_incomplete");

    const provenanceQuality = scoreProvenance(usable);
    if (usable.length > 0 && provenanceQuality < 0.5) {
      reasons.push("weak_cost_evidence_provenance");
    }

    const { agreement, directionConflict, declaredCount } = scoreAgreement(usable);
    if (directionConflict) reasons.push("declared_cost_direction_conflict");
    if (declaredCount === 0 && usable.length > 0) reasons.push("no_declared_cost_direction");

    const score = clamp01(
      0.2 * volume +
        0.15 * freshness +
        0.15 * sourceDiversity +
        0.1 * reviewCompleteness +
        0.15 * provenanceQuality +
        0.1 * agreement +
        0.075 * currencyConsistency +
        0.075 * basisCompatibility,
    );

    const conflictDetected = declaredConflict || directionConflict || !currencyCheck.compatible;

    let dataSufficiency: CostEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = currencyCheck.compatible
        ? "conflicting_cost_evidence"
        : "incompatible_currencies_without_conversion_ref";
    } else if (all.length > 0 && usable.length === 0) {
      dataSufficiency = "revoked";
      abstentionReason = "all_cost_evidence_revoked";
    } else if (usable.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_cost_evidence";
    } else if (!input.costBasisRef) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_cost_basis_reference";
    } else if (freshness < 0.2) {
      dataSufficiency = "stale";
      abstentionReason = "stale_cost_evidence";
    } else if (usable.length < minimumEvidenceCount || declaredCount === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_cost_evidence";
    } else if (score < threshold) {
      dataSufficiency = "limited";
      reasons.push("limited_cost_evidence_basis");
    }

    const abstention = isAbstainingCostSufficiency(dataSufficiency);
    if (abstention && !abstentionReason) {
      abstentionReason = "insufficient_cost_evidence";
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
      currencyConsistency,
      basisCompatibility,
      conflictState: conflictDetected ? "detected" : "none",
      abstention,
      abstentionReason,
      reasons: [...new Set(reasons)],
      method: "cost_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      engineeringCorrectnessClaimed: false,
      financialCertaintyClaimed: false,
    };
  }
}

export function createCostConfidenceEngine(): CostConfidenceEngine {
  return new CostConfidenceEngine();
}

function confidenceClassFor(
  score: number,
  sufficiency: CostEvidenceSufficiency,
): CostConfidenceClass {
  if (isAbstainingCostSufficiency(sufficiency)) return "unavailable";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scoreFreshness(
  evidence: readonly CostEvidence[],
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

function scoreReviewCompleteness(evidence: readonly CostEvidence[]): number {
  if (evidence.length === 0) return 0;
  const reviewed = evidence.filter(
    (item) =>
      item.reviewStatus === "reviewed" ||
      item.reviewStatus === "approved" ||
      item.reviewStatus === "published",
  ).length;
  return reviewed / evidence.length;
}

function scoreProvenance(evidence: readonly CostEvidence[]): number {
  if (evidence.length === 0) return 0;
  const total = evidence.reduce(
    (sum, item) => sum + (PROVENANCE_QUALITY[item.provenance] ?? 0.2),
    0,
  );
  return clamp01(total / evidence.length);
}

function scoreAgreement(evidence: readonly CostEvidence[]): {
  agreement: number;
  directionConflict: boolean;
  declaredCount: number;
} {
  const directions = evidence
    .map((item) => item.declaredDirection)
    .filter((value): value is NonNullable<CostEvidence["declaredDirection"]> =>
      typeof value === "string",
    )
    .filter((value) => value !== "unknown");

  const declaredCount = directions.length;
  const overUnder = directions.filter(
    (value): value is "over_basis" | "under_basis" =>
      value === "over_basis" || value === "under_basis",
  );
  const directionConflict =
    overUnder.includes("over_basis") && overUnder.includes("under_basis");

  let agreement = 1;
  if (directionConflict) agreement = 0.2;
  else if (declaredCount === 0) agreement = 0.4;
  else if (directions.length >= 2 && new Set(directions).size === 1) agreement = 1;
  else agreement = 0.85;

  return { agreement, directionConflict, declaredCount };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
