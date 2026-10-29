/**
 * Phase 11M — Organizational Learning Intelligence Confidence Engine.
 * Qualitative confidence from historical evidence and provenance. Fail closed.
 */

import {
  isAbstainingOrganizationalLearningSufficiency,
  type OrganizationalLearningConfidence,
  type OrganizationalLearningConfidenceClass,
  type OrganizationalLearningControlContext,
  type OrganizationalLearningEvidence,
  type OrganizationalLearningEvidenceSufficiency,
} from "./organizational-learning";
import type { ComposedProjectContext } from "./project-context-composition";
import type { ExplainabilityAssessmentState } from "./explainability";
import type { AssuranceAssessmentState } from "./assurance";
import type { ProjectScopeRef } from "./progress";

export type OrganizationalLearningConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  controlContext: OrganizationalLearningControlContext;
  composedContext: ComposedProjectContext;
  explainabilityStates?: readonly ExplainabilityAssessmentState[];
  assuranceStates?: readonly AssuranceAssessmentState[];
  evidence: readonly OrganizationalLearningEvidence[];
  historicalEvidenceRefs?: readonly { sourceRef: string }[];
  asOf?: string;
  minimumContributorCount?: number;
};

export class OrganizationalLearningConfidenceEngine {
  readonly kind = "organizational_learning_confidence_engine" as const;

  assess(input: OrganizationalLearningConfidenceInput): OrganizationalLearningConfidence {
    const asOf = input.asOf ?? new Date().toISOString();
    const minimumContributorCount = input.minimumContributorCount ?? 3;
    const reasons: string[] = [];
    const all = input.evidence ?? [];
    const usable = all.filter((item) => item.revoked !== true);
    if (all.length === 0) reasons.push("no_organizational_learning_evidence");
    if (usable.length === 0 && all.length > 0) {
      reasons.push("all_organizational_learning_evidence_revoked");
    }

    const historicalEvidencePresent =
      (input.historicalEvidenceRefs?.length ?? 0) > 0 ||
      usable.some(
        (item) =>
          item.kind === "historical_evidence_ref" ||
          item.kind === "lesson_register_ref" ||
          item.kind === "knowledge_graph_ref",
      );
    if (!historicalEvidencePresent) reasons.push("no_historical_evidence");

    const forbiddenClaim = usable.some(
      (item) =>
        item.fabricatedLesson !== false ||
        item.unsupportedSimilarityScore !== false ||
        item.knowledgeMutationClaimed !== false ||
        item.mutatesUpstreamContributors !== false,
    );
    if (forbiddenClaim) reasons.push("forbidden_organizational_learning_evidence_claim");

    const contributors = input.composedContext.contributorRefs;
    const extendedPublished = [
      ...(input.explainabilityStates ?? []).filter(
        (s) => s.status === "published" && !s.abstained,
      ),
      ...(input.assuranceStates ?? []).filter((s) => s.status === "published" && !s.abstained),
    ];
    const contributorCoverage = clamp01(
      (contributors.length + extendedPublished.length) /
        Math.max(1, minimumContributorCount + 6),
    );
    if (contributors.length < minimumContributorCount) {
      reasons.push("insufficient_contributor_coverage");
    }

    const provenanceCompleteness = scoreProvenance(usable);
    const conflictDetected = forbiddenClaim;

    let dataSufficiency: OrganizationalLearningEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = "forbidden_organizational_learning_evidence_claim";
    } else if (!historicalEvidencePresent) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_historical_evidence_for_organizational_learning";
    } else if (contributors.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_published_contributors_for_organizational_learning";
    } else if (contributors.length < minimumContributorCount) {
      dataSufficiency = "incomplete";
      abstentionReason = "incomplete_contributor_coverage";
    } else if (provenanceCompleteness < 0.45) {
      dataSufficiency = "limited";
      reasons.push("limited_provenance_basis");
    }

    const abstention = isAbstainingOrganizationalLearningSufficiency(dataSufficiency);
    if (abstention && !abstentionReason) {
      abstentionReason = "insufficient_organizational_learning_evidence";
    }

    const compositeScore = clamp01(
      0.35 * contributorCoverage +
        0.35 * provenanceCompleteness +
        0.3 * (historicalEvidencePresent ? 1 : 0),
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
      historicalEvidencePresent,
      conflictState: conflictDetected ? "detected" : "none",
      abstention,
      abstentionReason,
      reasons: [...new Set(reasons)],
      method: "organizational_learning_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      fabricatedLesson: false,
      unsupportedSimilarityScore: false,
      knowledgeMutationClaimed: false,
      learningApprovalClaimed: false,
      mutatesUpstreamContributors: false,
    };
  }
}

export function createOrganizationalLearningConfidenceEngine(): OrganizationalLearningConfidenceEngine {
  return new OrganizationalLearningConfidenceEngine();
}

function confidenceClassFor(
  score: number,
  sufficiency: OrganizationalLearningEvidenceSufficiency,
): OrganizationalLearningConfidenceClass {
  if (isAbstainingOrganizationalLearningSufficiency(sufficiency)) return "unavailable";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scoreProvenance(evidence: readonly OrganizationalLearningEvidence[]): number {
  if (evidence.length === 0) return 0;
  const known = evidence.filter((item) => item.provenance !== "unknown").length;
  return clamp01(known / evidence.length);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
