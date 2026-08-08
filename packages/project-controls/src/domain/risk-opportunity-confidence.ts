/**
 * Phase 11J — Risk & Opportunity Intelligence Confidence Engine.
 *
 * Qualitative confidence posture for intelligence signals from composed context,
 * forecast, decision support, scenario intelligence, and upstream contributors.
 * Fail closed when evidence insufficient. Never fabricates numerical precision.
 */

import {
  isAbstainingRiskOpportunitySufficiency,
  type RiskOpportunityConfidence,
  type RiskOpportunityConfidenceClass,
  type RiskOpportunityControlContext,
  type RiskOpportunityContributorRef,
  type RiskOpportunityEvidence,
  type RiskOpportunityEvidenceProvenance,
  type RiskOpportunityEvidenceSufficiency,
} from "./risk-opportunity";
import type { ComposedProjectContext } from "./project-context-composition";
import type { ForecastAssessmentState } from "./forecast";
import type { DecisionAssessmentState } from "./decision";
import type { ScenarioAssessmentState } from "./scenario";
import type { ProjectScopeRef } from "./progress";

export type RiskOpportunityConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  controlContext: RiskOpportunityControlContext;
  composedContext: ComposedProjectContext;
  forecastStates?: readonly ForecastAssessmentState[];
  decisionStates?: readonly DecisionAssessmentState[];
  scenarioStates?: readonly ScenarioAssessmentState[];
  evidence: readonly RiskOpportunityEvidence[];
  asOf?: string;
  freshnessHorizonHours?: number;
  minimumContributorCount?: number;
};

const PROVENANCE_QUALITY: Record<RiskOpportunityEvidenceProvenance, number> = {
  primary_source: 1,
  system_reference: 0.8,
  human_attestation: 0.7,
  derived_reference: 0.4,
  unknown: 0.2,
};

export class RiskOpportunityConfidenceEngine {
  readonly kind = "risk_opportunity_confidence_engine" as const;

  assess(input: RiskOpportunityConfidenceInput): RiskOpportunityConfidence {
    const asOf = input.asOf ?? new Date().toISOString();
    const horizonHours = input.freshnessHorizonHours ?? 2160;
    const minimumContributorCount = input.minimumContributorCount ?? 2;
    const reasons: string[] = [];

    const all = input.evidence ?? [];
    const usable = all.filter(
      (item) => item.revoked !== true && item.reviewStatus !== "revoked",
    );
    if (all.length === 0) reasons.push("no_risk_opportunity_evidence");
    if (usable.length === 0 && all.length > 0) reasons.push("all_risk_opportunity_evidence_revoked");

    const forbiddenClaim = usable.some(
      (item) =>
        item.autoExecutionClaimed !== false ||
        item.scheduleExecutionClaimed !== false ||
        item.costExecutionClaimed !== false ||
        item.contractInstructionClaimed !== false ||
        item.approvalAuthorityClaimed !== false ||
        item.earnedValueDerived !== false ||
        item.cpmDerived !== false ||
        item.financialPostingClaimed !== false ||
        item.monteCarloClaimed !== false ||
        item.numericalPrecisionClaimed !== false ||
        item.riskRegisterMutationClaimed !== false ||
        item.opportunityRegisterMutationClaimed !== false ||
        item.ownerAssignmentClaimed !== false ||
        item.treatmentExecutionClaimed !== false ||
        item.mutatesCoreRisk !== false,
    );
    if (forbiddenClaim) reasons.push("forbidden_risk_opportunity_evidence_claim");

    const declaredConflict = usable.some((item) => (item.conflictsWith ?? []).length > 0);
    if (declaredConflict) reasons.push("declared_evidence_conflict");

    const contributors = input.composedContext.contributorRefs;
    const forecastPublished = (input.forecastStates ?? []).filter(
      (state) => state.status === "published" && !state.abstained,
    );
    const decisionPublished = (input.decisionStates ?? []).filter(
      (state) => state.status === "published" && !state.abstained,
    );
    const scenarioPublished = (input.scenarioStates ?? []).filter(
      (state) => state.status === "published" && !state.abstained,
    );
    const contributorCoverage = clamp01(
      (contributors.length +
        (forecastPublished.length > 0 ? 1 : 0) +
        (decisionPublished.length > 0 ? 1 : 0) +
        (scenarioPublished.length > 0 ? 1 : 0)) /
        Math.max(1, minimumContributorCount + 3),
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
    const sourceDiversity = clamp01((sources.size + kinds.size + contributors.length) / 10);

    const reviewCompleteness = scoreReviewCompleteness(usable);
    const provenanceQuality = scoreProvenance(usable);
    const { agreement, signalConflict } = scoreAgreement(usable, contributors);

    if (signalConflict) reasons.push("declared_risk_opportunity_signal_conflict");

    const compositeScore = clamp01(
      0.2 * contributorCoverage +
        0.2 * freshness +
        0.15 * sourceDiversity +
        0.1 * reviewCompleteness +
        0.15 * provenanceQuality +
        0.2 * agreement,
    );

    const conflictDetected = declaredConflict || signalConflict || forbiddenClaim;

    let dataSufficiency: RiskOpportunityEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = forbiddenClaim
        ? "forbidden_risk_opportunity_evidence_claim"
        : "conflicting_risk_opportunity_evidence";
    } else if (contributors.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_published_contributors_for_risk_opportunity_intelligence";
    } else if (freshness < 0.2) {
      dataSufficiency = "stale";
      abstentionReason = "stale_contributor_basis";
    } else if (contributors.length < minimumContributorCount) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_contributor_coverage";
    } else if (compositeScore < 0.45) {
      dataSufficiency = "limited";
      reasons.push("limited_risk_opportunity_evidence_basis");
    }

    const abstention = isAbstainingRiskOpportunitySufficiency(dataSufficiency);
    if (abstention && !abstentionReason) {
      abstentionReason = "insufficient_risk_opportunity_evidence";
    }

    return {
      confidenceId: input.confidenceId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      confidenceClass: confidenceClassFor(compositeScore, dataSufficiency),
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
      method: "risk_opportunity_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      autoExecutionClaimed: false,
      approvalAuthorityClaimed: false,
      riskRegisterMutationClaimed: false,
      opportunityRegisterMutationClaimed: false,
      ownerAssignmentClaimed: false,
      treatmentExecutionClaimed: false,
      monteCarloClaimed: false,
      numericalPrecisionClaimed: false,
    };
  }
}

export function createRiskOpportunityConfidenceEngine(): RiskOpportunityConfidenceEngine {
  return new RiskOpportunityConfidenceEngine();
}

function confidenceClassFor(
  score: number,
  sufficiency: RiskOpportunityEvidenceSufficiency,
): RiskOpportunityConfidenceClass {
  if (isAbstainingRiskOpportunitySufficiency(sufficiency)) return "unavailable";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scoreFreshness(
  contributors: readonly RiskOpportunityContributorRef[],
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

function scoreReviewCompleteness(evidence: readonly RiskOpportunityEvidence[]): number {
  if (evidence.length === 0) return 0.5;
  const reviewed = evidence.filter(
    (item) =>
      item.reviewStatus === "reviewed" ||
      item.reviewStatus === "approved" ||
      item.reviewStatus === "published",
  ).length;
  return reviewed / evidence.length;
}

function scoreProvenance(evidence: readonly RiskOpportunityEvidence[]): number {
  if (evidence.length === 0) return 0.5;
  const total = evidence.reduce(
    (sum, item) => sum + (PROVENANCE_QUALITY[item.provenance] ?? 0.2),
    0,
  );
  return clamp01(total / evidence.length);
}

function scoreAgreement(
  evidence: readonly RiskOpportunityEvidence[],
  contributors: readonly RiskOpportunityContributorRef[],
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
