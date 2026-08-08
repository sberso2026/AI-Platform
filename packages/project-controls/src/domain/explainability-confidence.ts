/**
 * Phase 11L — Explainability Intelligence Confidence Engine.
 * Qualitative confidence from evidence/provenance/trace completeness. Fail closed.
 */

import {
  isAbstainingExplainabilitySufficiency,
  type ExplainabilityConfidence,
  type ExplainabilityConfidenceClass,
  type ExplainabilityControlContext,
  type ExplainabilityContributorRef,
  type ExplainabilityEvidence,
  type ExplainabilityEvidenceSufficiency,
} from "./explainability";
import type { ComposedProjectContext } from "./project-context-composition";
import type { AssuranceAssessmentState } from "./assurance";
import type { ForecastAssessmentState } from "./forecast";
import type { DecisionAssessmentState } from "./decision";
import type { ScenarioAssessmentState } from "./scenario";
import type { RiskOpportunityAssessmentState } from "./risk-opportunity";
import type { ProjectScopeRef } from "./progress";

export type ExplainabilityConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  controlContext: ExplainabilityControlContext;
  composedContext: ComposedProjectContext;
  assuranceStates?: readonly AssuranceAssessmentState[];
  forecastStates?: readonly ForecastAssessmentState[];
  decisionStates?: readonly DecisionAssessmentState[];
  scenarioStates?: readonly ScenarioAssessmentState[];
  riskOpportunityStates?: readonly RiskOpportunityAssessmentState[];
  evidence: readonly ExplainabilityEvidence[];
  asOf?: string;
  minimumContributorCount?: number;
};

export class ExplainabilityConfidenceEngine {
  readonly kind = "explainability_confidence_engine" as const;

  assess(input: ExplainabilityConfidenceInput): ExplainabilityConfidence {
    const asOf = input.asOf ?? new Date().toISOString();
    const minimumContributorCount = input.minimumContributorCount ?? 3;
    const reasons: string[] = [];
    const all = input.evidence ?? [];
    const usable = all.filter((item) => item.revoked !== true);
    if (all.length === 0) reasons.push("no_explainability_evidence");
    if (usable.length === 0 && all.length > 0) reasons.push("all_explainability_evidence_revoked");

    const forbiddenClaim = usable.some(
      (item) =>
        item.chainOfThoughtExposed !== false ||
        item.hiddenReasoningExposed !== false ||
        item.fabricatedProvenance !== false ||
        item.automaticEvidenceCreationClaimed !== false ||
        item.mutatesUpstreamContributors !== false,
    );
    if (forbiddenClaim) reasons.push("forbidden_explainability_evidence_claim");

    const contributors = input.composedContext.contributorRefs;
    const extendedPublished = [
      ...(input.assuranceStates ?? []).filter((s) => s.status === "published" && !s.abstained),
      ...(input.forecastStates ?? []).filter((s) => s.status === "published" && !s.abstained),
      ...(input.decisionStates ?? []).filter((s) => s.status === "published" && !s.abstained),
      ...(input.scenarioStates ?? []).filter((s) => s.status === "published" && !s.abstained),
      ...(input.riskOpportunityStates ?? []).filter(
        (s) => s.status === "published" && !s.abstained,
      ),
    ];
    const contributorCoverage = clamp01(
      (contributors.length + extendedPublished.length) /
        Math.max(1, minimumContributorCount + 5),
    );
    if (contributors.length < minimumContributorCount) {
      reasons.push("insufficient_contributor_coverage");
    }
    if (input.composedContext.missingContributorKeys.length > 0) {
      reasons.push("missing_published_contributors");
    }

    const provenanceCompleteness = scoreProvenance(usable);
    const traceCompleteness = clamp01((contributors.length + extendedPublished.length) / 10);
    const conflictDetected = forbiddenClaim;

    let dataSufficiency: ExplainabilityEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = "forbidden_explainability_evidence_claim";
    } else if (contributors.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_published_contributors_for_explainability_intelligence";
    } else if (contributors.length < minimumContributorCount) {
      dataSufficiency = "incomplete";
      abstentionReason = "incomplete_contributor_coverage";
    } else if (provenanceCompleteness < 0.45) {
      dataSufficiency = "limited";
      reasons.push("limited_provenance_basis");
    }

    const abstention = isAbstainingExplainabilitySufficiency(dataSufficiency);
    if (abstention && !abstentionReason) {
      abstentionReason = "insufficient_explainability_evidence";
    }

    const compositeScore = clamp01(
      0.35 * contributorCoverage + 0.35 * provenanceCompleteness + 0.3 * traceCompleteness,
    );

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
      provenanceCompleteness,
      traceCompleteness,
      conflictState: conflictDetected ? "detected" : "none",
      abstention,
      abstentionReason,
      reasons: [...new Set(reasons)],
      method: "explainability_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      chainOfThoughtExposed: false,
      hiddenReasoningExposed: false,
      fabricatedProvenance: false,
      automaticEvidenceCreationClaimed: false,
      approvalAuthorityClaimed: false,
      verificationClaimed: false,
      mutatesUpstreamContributors: false,
    };
  }
}

export function createExplainabilityConfidenceEngine(): ExplainabilityConfidenceEngine {
  return new ExplainabilityConfidenceEngine();
}

function confidenceClassFor(
  score: number,
  sufficiency: ExplainabilityEvidenceSufficiency,
): ExplainabilityConfidenceClass {
  if (isAbstainingExplainabilitySufficiency(sufficiency)) return "unavailable";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scoreProvenance(evidence: readonly ExplainabilityEvidence[]): number {
  if (evidence.length === 0) return 0;
  const known = evidence.filter((item) => item.provenance !== "unknown").length;
  return clamp01(known / evidence.length);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
