/**
 * Phase 11G — Forecast Confidence Engine.
 *
 * Scores the evidence basis for a forecast assessment from composed contributor
 * references. Anything other than sufficient/limited forces abstention.
 */

import {
  isAbstainingForecastSufficiency,
  type ForecastConfidence,
  type ForecastConfidenceClass,
  type ForecastControlContext,
  type ForecastContributorRef,
  type ForecastEvidence,
  type ForecastEvidenceProvenance,
  type ForecastEvidenceSufficiency,
} from "./forecast";
import type { ComposedProjectContext } from "./project-context-composition";
import type { ProjectScopeRef } from "./progress";

export type ForecastConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  controlContext: ForecastControlContext;
  composedContext: ComposedProjectContext;
  evidence: readonly ForecastEvidence[];
  asOf?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumContributorCount?: number;
};

const PROVENANCE_QUALITY: Record<ForecastEvidenceProvenance, number> = {
  primary_source: 1,
  system_reference: 0.8,
  human_attestation: 0.7,
  derived_reference: 0.4,
  unknown: 0.2,
};

export class ForecastConfidenceEngine {
  readonly kind = "forecast_confidence_engine" as const;

  assess(input: ForecastConfidenceInput): ForecastConfidence {
    const asOf = input.asOf ?? new Date().toISOString();
    const horizonHours = input.freshnessHorizonHours ?? 2160;
    const threshold = input.sufficiencyThreshold ?? 0.45;
    const minimumContributorCount = input.minimumContributorCount ?? 2;
    const reasons: string[] = [];

    const all = input.evidence ?? [];
    const usable = all.filter(
      (item) => item.revoked !== true && item.reviewStatus !== "revoked",
    );
    if (all.length === 0) reasons.push("no_forecast_evidence");
    if (usable.length === 0 && all.length > 0) reasons.push("all_forecast_evidence_revoked");

    const forbiddenClaim = usable.some(
      (item) =>
        item.completionDateClaimed !== false ||
        item.costForecastClaimed !== false ||
        item.earnedValueDerived !== false ||
        item.cpmDerived !== false ||
        item.resourcePlanningClaimed !== false ||
        item.budgetLedgerClaimed !== false ||
        item.financialPostingClaimed !== false,
    );
    if (forbiddenClaim) reasons.push("forbidden_forecast_evidence_claim");

    const declaredConflict = usable.some((item) => (item.conflictsWith ?? []).length > 0);
    if (declaredConflict) reasons.push("declared_evidence_conflict");

    const contributors = input.composedContext.contributorRefs;
    const contributorCoverage = clamp01(
      contributors.length / Math.max(1, minimumContributorCount + 1),
    );
    if (contributors.length < minimumContributorCount) {
      reasons.push("insufficient_contributor_coverage");
    }
    if (input.composedContext.missingContributorKeys.length > 0) {
      reasons.push("missing_published_contributors");
    }

    const freshness = scoreFreshness(contributors, asOf, horizonHours);
    if (contributors.length > 0 && freshness < 0.3) reasons.push("stale_contributor_basis");

    const sources = new Set(usable.map((item) => item.sourceKey));
    const kinds = new Set(usable.map((item) => item.kind));
    const sourceDiversity = clamp01((sources.size + kinds.size + contributors.length) / 6);

    const reviewCompleteness = scoreReviewCompleteness(usable);
    const provenanceQuality = scoreProvenance(usable);
    const { agreement, signalConflict, declaredCount } = scoreAgreement(usable, contributors);

    if (signalConflict) reasons.push("declared_forecast_signal_conflict");
    if (declaredCount === 0 && usable.length > 0) reasons.push("no_declared_forecast_signal");

    const score = clamp01(
      0.2 * contributorCoverage +
        0.2 * freshness +
        0.15 * sourceDiversity +
        0.1 * reviewCompleteness +
        0.15 * provenanceQuality +
        0.2 * agreement,
    );

    const conflictDetected = declaredConflict || signalConflict || forbiddenClaim;

    let dataSufficiency: ForecastEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = forbiddenClaim
        ? "forbidden_forecast_evidence_claim"
        : "conflicting_forecast_evidence";
    } else if (contributors.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_published_contributors_for_forecast";
    } else if (freshness < 0.2) {
      dataSufficiency = "stale";
      abstentionReason = "stale_contributor_basis";
    } else if (contributors.length < minimumContributorCount) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_contributor_coverage";
    } else if (score < threshold) {
      dataSufficiency = "limited";
      reasons.push("limited_forecast_evidence_basis");
    }

    const abstention = isAbstainingForecastSufficiency(dataSufficiency);
    if (abstention && !abstentionReason) {
      abstentionReason = "insufficient_forecast_evidence";
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
      contributorCoverage,
      sourceDiversity,
      freshness,
      reviewCompleteness,
      provenanceQuality,
      agreement,
      conflictState: conflictDetected ? "detected" : "none",
      abstention,
      abstentionReason,
      reasons: [...new Set(reasons)],
      method: "forecast_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      completionDateClaimed: false,
      costForecastClaimed: false,
    };
  }
}

export function createForecastConfidenceEngine(): ForecastConfidenceEngine {
  return new ForecastConfidenceEngine();
}

function confidenceClassFor(
  score: number,
  sufficiency: ForecastEvidenceSufficiency,
): ForecastConfidenceClass {
  if (isAbstainingForecastSufficiency(sufficiency)) return "unavailable";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scoreFreshness(
  contributors: readonly ForecastContributorRef[],
  asOf: string,
  horizonHours: number,
): number {
  if (contributors.length === 0) return 0;
  const asOfMs = Date.parse(asOf);
  const scores = contributors.map((item) => {
    if (!item.assessedAt) return 0.4;
    const ageHours = Math.max(0, (asOfMs - Date.parse(item.assessedAt)) / 3_600_000);
    return clamp01(1 - ageHours / horizonHours);
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function scoreReviewCompleteness(evidence: readonly ForecastEvidence[]): number {
  if (evidence.length === 0) return 0.5;
  const reviewed = evidence.filter(
    (item) =>
      item.reviewStatus === "reviewed" ||
      item.reviewStatus === "approved" ||
      item.reviewStatus === "published",
  ).length;
  return reviewed / evidence.length;
}

function scoreProvenance(evidence: readonly ForecastEvidence[]): number {
  if (evidence.length === 0) return 0.5;
  const total = evidence.reduce(
    (sum, item) => sum + (PROVENANCE_QUALITY[item.provenance] ?? 0.2),
    0,
  );
  return clamp01(total / evidence.length);
}

function scoreAgreement(
  evidence: readonly ForecastEvidence[],
  contributors: readonly ForecastContributorRef[],
): { agreement: number; signalConflict: boolean; declaredCount: number } {
  const signals = evidence
    .map((item) => item.declaredSignal)
    .filter((value): value is NonNullable<ForecastEvidence["declaredSignal"]> =>
      typeof value === "string",
    )
    .filter((value) => value !== "unknown");

  const deteriorating = signals.filter((value) => value === "deteriorating").length;
  const favourable = signals.filter((value) => value === "favourable").length;
  const signalConflict = deteriorating > 0 && favourable > 0 && deteriorating === favourable;

  const declaredCount = signals.length;
  let agreement = 1;
  if (signalConflict) agreement = 0.2;
  else if (declaredCount === 0 && contributors.length > 0) agreement = 0.6;
  else if (signals.length >= 2 && new Set(signals).size === 1) agreement = 1;
  else agreement = 0.85;

  return { agreement, signalConflict, declaredCount };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
