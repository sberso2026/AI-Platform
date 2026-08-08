/**
 * Phase 11K — Assurance Intelligence Confidence Engine.
 *
 * Qualitative confidence posture for assurance assessments from composed context
 * and all contributor outputs. Fail closed when evidence insufficient.
 * Never fabricates numerical precision.
 */

import {
  isAbstainingAssuranceSufficiency,
  type AssuranceConfidence,
  type AssuranceConfidenceClass,
  type AssuranceControlContext,
  type AssuranceContributorRef,
  type AssuranceEvidence,
  type AssuranceEvidenceProvenance,
  type AssuranceEvidenceSufficiency,
} from "./assurance";
import type { ComposedProjectContext } from "./project-context-composition";
import type { ForecastAssessmentState } from "./forecast";
import type { DecisionAssessmentState } from "./decision";
import type { ScenarioAssessmentState } from "./scenario";
import type { RiskOpportunityAssessmentState } from "./risk-opportunity";
import type { ProjectScopeRef } from "./progress";

export type AssuranceConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  controlContext: AssuranceControlContext;
  composedContext: ComposedProjectContext;
  forecastStates?: readonly ForecastAssessmentState[];
  decisionStates?: readonly DecisionAssessmentState[];
  scenarioStates?: readonly ScenarioAssessmentState[];
  riskOpportunityStates?: readonly RiskOpportunityAssessmentState[];
  evidence: readonly AssuranceEvidence[];
  asOf?: string;
  freshnessHorizonHours?: number;
  minimumContributorCount?: number;
};

const PROVENANCE_QUALITY: Record<AssuranceEvidenceProvenance, number> = {
  primary_source: 1,
  system_reference: 0.8,
  human_attestation: 0.7,
  derived_reference: 0.4,
  unknown: 0.2,
};

export class AssuranceConfidenceEngine {
  readonly kind = "assurance_confidence_engine" as const;

  assess(input: AssuranceConfidenceInput): AssuranceConfidence {
    const asOf = input.asOf ?? new Date().toISOString();
    const horizonHours = input.freshnessHorizonHours ?? 2160;
    const minimumContributorCount = input.minimumContributorCount ?? 3;
    const reasons: string[] = [];

    const all = input.evidence ?? [];
    const usable = all.filter(
      (item) => item.revoked !== true && item.reviewStatus !== "revoked",
    );
    if (all.length === 0) reasons.push("no_assurance_evidence");
    if (usable.length === 0 && all.length > 0) reasons.push("all_assurance_evidence_revoked");

    const forbiddenClaim = usable.some(
      (item) =>
        item.autoExecutionClaimed !== false ||
        item.scheduleExecutionClaimed !== false ||
        item.costExecutionClaimed !== false ||
        item.contractInstructionClaimed !== false ||
        item.approvalAuthorityClaimed !== false ||
        item.certificationClaimed !== false ||
        item.verificationClaimed !== false ||
        item.evidenceApprovalClaimed !== false ||
        item.earnedValueDerived !== false ||
        item.cpmDerived !== false ||
        item.financialPostingClaimed !== false ||
        item.numericalPrecisionClaimed !== false ||
        item.registerMutationClaimed !== false ||
        item.mutatesCoreRisk !== false ||
        item.mutatesUpstreamContributors !== false,
    );
    if (forbiddenClaim) reasons.push("forbidden_assurance_evidence_claim");

    const declaredConflict = usable.some((item) => (item.conflictsWith ?? []).length > 0);
    if (declaredConflict) reasons.push("declared_evidence_conflict");

    const contributors = input.composedContext.contributorRefs;
    const extendedPublished = [
      ...(input.forecastStates ?? []).filter((s) => s.status === "published" && !s.abstained),
      ...(input.decisionStates ?? []).filter((s) => s.status === "published" && !s.abstained),
      ...(input.scenarioStates ?? []).filter((s) => s.status === "published" && !s.abstained),
      ...(input.riskOpportunityStates ?? []).filter(
        (s) => s.status === "published" && !s.abstained,
      ),
    ];
    const contributorCoverage = clamp01(
      (contributors.length + extendedPublished.length) /
        Math.max(1, minimumContributorCount + 4),
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
    const sourceDiversity = clamp01((sources.size + kinds.size + contributors.length) / 12);

    const reviewCompleteness = scoreReviewCompleteness(usable);
    const provenanceQuality = scoreProvenance(usable);
    const { agreement, signalConflict } = scoreAgreement(usable, contributors);

    if (signalConflict) reasons.push("declared_assurance_signal_conflict");

    const compositeScore = clamp01(
      0.2 * contributorCoverage +
        0.2 * freshness +
        0.15 * sourceDiversity +
        0.1 * reviewCompleteness +
        0.15 * provenanceQuality +
        0.2 * agreement,
    );

    const conflictDetected = declaredConflict || signalConflict || forbiddenClaim;

    let dataSufficiency: AssuranceEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = forbiddenClaim
        ? "forbidden_assurance_evidence_claim"
        : "conflicting_assurance_evidence";
    } else if (contributors.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_published_contributors_for_assurance_intelligence";
    } else if (freshness < 0.2) {
      dataSufficiency = "stale";
      abstentionReason = "stale_contributor_basis";
    } else if (contributors.length < minimumContributorCount) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_contributor_coverage";
    } else if (compositeScore < 0.45) {
      dataSufficiency = "limited";
      reasons.push("limited_assurance_evidence_basis");
    }

    const abstention = isAbstainingAssuranceSufficiency(dataSufficiency);
    if (abstention && !abstentionReason) {
      abstentionReason = "insufficient_assurance_evidence";
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
      method: "assurance_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      autoExecutionClaimed: false,
      approvalAuthorityClaimed: false,
      certificationClaimed: false,
      verificationClaimed: false,
      evidenceApprovalClaimed: false,
      numericalPrecisionClaimed: false,
      mutatesUpstreamContributors: false,
    };
  }
}

export function createAssuranceConfidenceEngine(): AssuranceConfidenceEngine {
  return new AssuranceConfidenceEngine();
}

function confidenceClassFor(
  score: number,
  sufficiency: AssuranceEvidenceSufficiency,
): AssuranceConfidenceClass {
  if (isAbstainingAssuranceSufficiency(sufficiency)) return "unavailable";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scoreFreshness(
  contributors: readonly AssuranceContributorRef[],
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

function scoreReviewCompleteness(evidence: readonly AssuranceEvidence[]): number {
  if (evidence.length === 0) return 0.5;
  const reviewed = evidence.filter(
    (item) =>
      item.reviewStatus === "reviewed" ||
      item.reviewStatus === "approved" ||
      item.reviewStatus === "published",
  ).length;
  return reviewed / evidence.length;
}

function scoreProvenance(evidence: readonly AssuranceEvidence[]): number {
  if (evidence.length === 0) return 0.5;
  const total = evidence.reduce(
    (sum, item) => sum + (PROVENANCE_QUALITY[item.provenance] ?? 0.2),
    0,
  );
  return clamp01(total / evidence.length);
}

function scoreAgreement(
  evidence: readonly AssuranceEvidence[],
  contributors: readonly AssuranceContributorRef[],
): { agreement: number; signalConflict: boolean } {
  const signals = evidence
    .map((item) => item.declaredSignal)
    .filter((value): value is string => typeof value === "string" && value !== "unknown");

  const weak = signals.filter((value) => value === "weak" || value === "insufficient").length;
  const strong = signals.filter((value) => value === "strong" || value === "adequate").length;
  const signalConflict = weak > 0 && strong > 0 && weak === strong;

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
