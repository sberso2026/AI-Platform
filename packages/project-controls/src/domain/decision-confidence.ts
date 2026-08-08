/**
 * Phase 11H — Decision Support Confidence Engine.
 *
 * Scores the evidence basis for decision recommendations from composed context,
 * forecast and upstream contributor references. Anything other than
 * sufficient/limited forces abstention.
 */

import {
  isAbstainingDecisionSufficiency,
  type DecisionConfidence,
  type DecisionConfidenceClass,
  type DecisionControlContext,
  type DecisionContributorRef,
  type DecisionEvidence,
  type DecisionEvidenceProvenance,
  type DecisionEvidenceSufficiency,
} from "./decision";
import type { ComposedProjectContext } from "./project-context-composition";
import type { ForecastAssessmentState } from "./forecast";
import type { ProjectScopeRef } from "./progress";

export type DecisionConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  controlContext: DecisionControlContext;
  composedContext: ComposedProjectContext;
  forecastStates?: readonly ForecastAssessmentState[];
  evidence: readonly DecisionEvidence[];
  asOf?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumContributorCount?: number;
};

const PROVENANCE_QUALITY: Record<DecisionEvidenceProvenance, number> = {
  primary_source: 1,
  system_reference: 0.8,
  human_attestation: 0.7,
  derived_reference: 0.4,
  unknown: 0.2,
};

export class DecisionConfidenceEngine {
  readonly kind = "decision_confidence_engine" as const;

  assess(input: DecisionConfidenceInput): DecisionConfidence {
    const asOf = input.asOf ?? new Date().toISOString();
    const horizonHours = input.freshnessHorizonHours ?? 2160;
    const threshold = input.sufficiencyThreshold ?? 0.45;
    const minimumContributorCount = input.minimumContributorCount ?? 2;
    const reasons: string[] = [];

    const all = input.evidence ?? [];
    const usable = all.filter(
      (item) => item.revoked !== true && item.reviewStatus !== "revoked",
    );
    if (all.length === 0) reasons.push("no_decision_evidence");
    if (usable.length === 0 && all.length > 0) reasons.push("all_decision_evidence_revoked");

    const forbiddenClaim = usable.some(
      (item) =>
        item.autoExecutionClaimed !== false ||
        item.scheduleExecutionClaimed !== false ||
        item.costExecutionClaimed !== false ||
        item.contractInstructionClaimed !== false ||
        item.approvalAuthorityClaimed !== false ||
        item.earnedValueDerived !== false ||
        item.cpmDerived !== false ||
        item.financialPostingClaimed !== false,
    );
    if (forbiddenClaim) reasons.push("forbidden_decision_evidence_claim");

    const declaredConflict = usable.some((item) => (item.conflictsWith ?? []).length > 0);
    if (declaredConflict) reasons.push("declared_evidence_conflict");

    const contributors = input.composedContext.contributorRefs;
    const forecastPublished = (input.forecastStates ?? []).filter(
      (state) => state.status === "published" && !state.abstained,
    );
    const contributorCoverage = clamp01(
      (contributors.length + (forecastPublished.length > 0 ? 1 : 0)) /
        Math.max(1, minimumContributorCount + 1),
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
    const sourceDiversity = clamp01((sources.size + kinds.size + contributors.length) / 7);

    const reviewCompleteness = scoreReviewCompleteness(usable);
    const provenanceQuality = scoreProvenance(usable);
    const { agreement, signalConflict } = scoreAgreement(usable, contributors);

    if (signalConflict) reasons.push("declared_decision_signal_conflict");

    const score = clamp01(
      0.2 * contributorCoverage +
        0.2 * freshness +
        0.15 * sourceDiversity +
        0.1 * reviewCompleteness +
        0.15 * provenanceQuality +
        0.2 * agreement,
    );

    const conflictDetected = declaredConflict || signalConflict || forbiddenClaim;

    let dataSufficiency: DecisionEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = forbiddenClaim
        ? "forbidden_decision_evidence_claim"
        : "conflicting_decision_evidence";
    } else if (contributors.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_published_contributors_for_decision_support";
    } else if (freshness < 0.2) {
      dataSufficiency = "stale";
      abstentionReason = "stale_contributor_basis";
    } else if (contributors.length < minimumContributorCount) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_contributor_coverage";
    } else if (score < threshold) {
      dataSufficiency = "limited";
      reasons.push("limited_decision_evidence_basis");
    }

    const abstention = isAbstainingDecisionSufficiency(dataSufficiency);
    if (abstention && !abstentionReason) {
      abstentionReason = "insufficient_decision_evidence";
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
      method: "decision_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      autoExecutionClaimed: false,
      approvalAuthorityClaimed: false,
    };
  }
}

export function createDecisionConfidenceEngine(): DecisionConfidenceEngine {
  return new DecisionConfidenceEngine();
}

function confidenceClassFor(
  score: number,
  sufficiency: DecisionEvidenceSufficiency,
): DecisionConfidenceClass {
  if (isAbstainingDecisionSufficiency(sufficiency)) return "unavailable";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scoreFreshness(
  contributors: readonly DecisionContributorRef[],
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

function scoreReviewCompleteness(evidence: readonly DecisionEvidence[]): number {
  if (evidence.length === 0) return 0.5;
  const reviewed = evidence.filter(
    (item) =>
      item.reviewStatus === "reviewed" ||
      item.reviewStatus === "approved" ||
      item.reviewStatus === "published",
  ).length;
  return reviewed / evidence.length;
}

function scoreProvenance(evidence: readonly DecisionEvidence[]): number {
  if (evidence.length === 0) return 0.5;
  const total = evidence.reduce(
    (sum, item) => sum + (PROVENANCE_QUALITY[item.provenance] ?? 0.2),
    0,
  );
  return clamp01(total / evidence.length);
}

function scoreAgreement(
  evidence: readonly DecisionEvidence[],
  contributors: readonly DecisionContributorRef[],
): { agreement: number; signalConflict: boolean } {
  const signals = evidence
    .map((item) => item.declaredSignal)
    .filter((value): value is string => typeof value === "string" && value !== "unknown");

  const deteriorating = signals.filter((value) => value === "deteriorating").length;
  const favourable = signals.filter((value) => value === "favourable").length;
  const signalConflict = deteriorating > 0 && favourable > 0 && deteriorating === favourable;

  let agreement = 1;
  if (signalConflict) agreement = 0.2;
  else if (signals.length === 0 && contributors.length > 0) agreement = 0.6;
  else if (signals.length >= 2 && new Set(signals).size === 1) agreement = 1;
  else agreement = 0.85;

  return { agreement, signalConflict };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
