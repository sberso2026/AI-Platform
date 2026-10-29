/**
 * Phase 11D — Change Confidence Engine.
 *
 * Scores the evidence basis for a change assessment. Anything other than
 * sufficient/limited forces the change engine to abstain. Confidence never
 * asserts contractual certainty and never asserts engineering correctness.
 */

import {
  isAbstainingChangeSufficiency,
  type ChangeConfidence,
  type ChangeConfidenceClass,
  type ChangeEvidence,
  type ChangeEvidenceProvenance,
  type ChangeEvidenceSufficiency,
  type ChangeStatusContext,
} from "./change";
import type { ProjectScopeRef } from "./progress";

export type ChangeConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  evidence: readonly ChangeEvidence[];
  asOf?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumEvidenceCount?: number;
};

const PROVENANCE_QUALITY: Record<ChangeEvidenceProvenance, number> = {
  primary_source: 1,
  system_reference: 0.8,
  human_attestation: 0.7,
  derived_reference: 0.4,
  unknown: 0.2,
};

export class ChangeConfidenceEngine {
  readonly kind = "change_confidence_engine" as const;

  assess(input: ChangeConfidenceInput): ChangeConfidence {
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
    if (revoked.length > 0) reasons.push("revoked_change_evidence_excluded");
    if (usable.length === 0 && all.length > 0) reasons.push("all_change_evidence_revoked");
    if (all.length === 0) reasons.push("no_change_evidence");

    const declaredConflict = usable.some((item) => (item.conflictsWith ?? []).length > 0);
    if (declaredConflict) reasons.push("declared_evidence_conflict");

    const volume = clamp01(usable.length / Math.max(1, minimumEvidenceCount + 1));
    const freshness = scoreFreshness(usable, asOf, horizonHours);
    if (usable.length > 0 && freshness < 0.3) reasons.push("stale_change_evidence");

    const sources = new Set(usable.map((item) => item.sourceKey));
    const kinds = new Set(usable.map((item) => item.kind));
    const sourceDiversity = clamp01((sources.size + kinds.size) / 4);
    if (sources.size < 2 && usable.length > 0) reasons.push("single_source_basis");

    const reviewCompleteness = scoreReviewCompleteness(usable);
    if (reviewCompleteness < 0.5) reasons.push("evidence_review_incomplete");

    const provenanceQuality = scoreProvenance(usable);
    if (usable.length > 0 && provenanceQuality < 0.5) {
      reasons.push("weak_change_evidence_provenance");
    }

    const { agreement, statusConflict, classConflict, declaredCount } = scoreAgreement(usable);
    if (statusConflict) reasons.push("declared_change_status_conflict");
    if (classConflict) reasons.push("declared_change_class_conflict");
    if (declaredCount === 0 && usable.length > 0) reasons.push("no_declared_change_signal");

    const score = clamp01(
      0.25 * volume +
        0.15 * freshness +
        0.2 * sourceDiversity +
        0.1 * reviewCompleteness +
        0.15 * provenanceQuality +
        0.15 * agreement,
    );

    const conflictDetected = declaredConflict || statusConflict || classConflict;

    let dataSufficiency: ChangeEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = "conflicting_change_evidence";
    } else if (all.length > 0 && usable.length === 0) {
      dataSufficiency = "revoked";
      abstentionReason = "all_change_evidence_revoked";
    } else if (usable.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_change_evidence";
    } else if (freshness < 0.2) {
      dataSufficiency = "stale";
      abstentionReason = "stale_change_evidence";
    } else if (usable.length < minimumEvidenceCount || declaredCount === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_change_evidence";
    } else if (score < threshold) {
      dataSufficiency = "limited";
      reasons.push("limited_change_evidence_basis");
    }

    const abstention = isAbstainingChangeSufficiency(dataSufficiency);
    if (abstention && !abstentionReason) {
      abstentionReason = "insufficient_change_evidence";
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
      method: "change_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      engineeringCorrectnessClaimed: false,
      contractualCertaintyClaimed: false,
    };
  }
}

export function createChangeConfidenceEngine(): ChangeConfidenceEngine {
  return new ChangeConfidenceEngine();
}

function confidenceClassFor(
  score: number,
  sufficiency: ChangeEvidenceSufficiency,
): ChangeConfidenceClass {
  if (isAbstainingChangeSufficiency(sufficiency)) return "unavailable";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scoreFreshness(
  evidence: readonly ChangeEvidence[],
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

function scoreReviewCompleteness(evidence: readonly ChangeEvidence[]): number {
  if (evidence.length === 0) return 0;
  const reviewed = evidence.filter(
    (item) =>
      item.reviewStatus === "reviewed" ||
      item.reviewStatus === "approved" ||
      item.reviewStatus === "published",
  ).length;
  return reviewed / evidence.length;
}

function scoreProvenance(evidence: readonly ChangeEvidence[]): number {
  if (evidence.length === 0) return 0;
  const total = evidence.reduce(
    (sum, item) => sum + (PROVENANCE_QUALITY[item.provenance] ?? 0.2),
    0,
  );
  return clamp01(total / evidence.length);
}

function scoreAgreement(evidence: readonly ChangeEvidence[]): {
  agreement: number;
  statusConflict: boolean;
  classConflict: boolean;
  declaredCount: number;
} {
  const statuses = evidence
    .map((item) => item.declaredStatusContext)
    .filter((value): value is ChangeStatusContext => typeof value === "string")
    .filter((value) => value !== "unknown");
  const classes = evidence
    .map((item) => item.declaredChangeClass)
    .filter((value): value is NonNullable<ChangeEvidence["declaredChangeClass"]> =>
      typeof value === "string",
    );

  const declaredCount = Math.max(statuses.length, classes.length);
  const statusConflict = hasApprovalContradiction(statuses);
  const classConflict = new Set(classes).size > 1;

  let agreement = 1;
  if (statusConflict || classConflict) agreement = 0.2;
  else if (declaredCount === 0) agreement = 0.4;
  else if (statuses.length >= 2 && new Set(statuses).size === 1) agreement = 1;
  else agreement = 0.85;

  return { agreement, statusConflict, classConflict, declaredCount };
}

/**
 * Approved and rejected contexts asserted for the same change are a hard
 * conflict; pending alongside either is merely an unsettled process, not a
 * contradiction the engine should refuse over.
 */
function hasApprovalContradiction(statuses: readonly ChangeStatusContext[]): boolean {
  return (
    statuses.includes("approved_context") && statuses.includes("rejected_context")
  );
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
