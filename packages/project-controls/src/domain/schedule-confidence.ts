/**
 * Phase 11C — Schedule Confidence Engine.
 *
 * Scores the evidence basis for a schedule assessment. Anything other than
 * sufficient/limited forces the schedule engine to abstain. Never claims CPM,
 * float or engineering correctness.
 */

import {
  isAbstainingScheduleSufficiency,
  type MilestonePosture,
  type ScheduleConfidence,
  type ScheduleConfidenceClass,
  type ScheduleEvidence,
  type ScheduleEvidenceSufficiency,
} from "./schedule";
import type { ProjectScopeRef } from "./progress";

export type ScheduleConfidenceInput = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  evidence: readonly ScheduleEvidence[];
  asOf?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  disagreementThresholdDays?: number;
  minimumEvidenceCount?: number;
};

export class ScheduleConfidenceEngine {
  readonly kind = "schedule_confidence_engine" as const;

  assess(input: ScheduleConfidenceInput): ScheduleConfidence {
    const asOf = input.asOf ?? new Date().toISOString();
    const horizonHours = input.freshnessHorizonHours ?? 2160;
    const threshold = input.sufficiencyThreshold ?? 0.45;
    const disagreementThresholdDays = input.disagreementThresholdDays ?? 14;
    const minimumEvidenceCount = input.minimumEvidenceCount ?? 2;
    const reasons: string[] = [];

    const all = input.evidence ?? [];
    const usable = all.filter((item) => !item.revoked);
    if (usable.length < all.length) reasons.push("revoked_evidence_excluded");
    if (usable.length === 0) reasons.push("no_schedule_evidence");

    const declaredConflict = usable.some((item) => (item.conflictsWith ?? []).length > 0);
    if (declaredConflict) reasons.push("declared_evidence_conflict");

    const volume = clamp01(usable.length / Math.max(1, minimumEvidenceCount + 1));
    const freshness = scoreFreshness(usable, asOf, horizonHours);
    if (usable.length > 0 && freshness < 0.3) reasons.push("stale_schedule_evidence");

    const sources = new Set(usable.map((item) => item.sourceKey));
    const kinds = new Set(usable.map((item) => item.kind));
    const sourceDiversity = clamp01((sources.size + kinds.size) / 4);
    if (sources.size < 2 && usable.length > 0) reasons.push("single_source_basis");

    const reviewCompleteness = scoreReviewCompleteness(usable);
    if (reviewCompleteness < 0.5) reasons.push("evidence_review_incomplete");

    const { agreement, dateConflict, postureConflict, declaredCount } = scoreAgreement(
      usable,
      disagreementThresholdDays,
    );
    if (dateConflict) reasons.push("declared_date_disagreement_exceeds_threshold");
    if (postureConflict) reasons.push("declared_posture_conflict");
    if (declaredCount === 0 && usable.length > 0) reasons.push("no_declared_schedule_signal");

    const score = clamp01(
      0.3 * volume +
        0.2 * freshness +
        0.2 * sourceDiversity +
        0.15 * reviewCompleteness +
        0.15 * agreement,
    );

    const conflictDetected = declaredConflict || dateConflict || postureConflict;

    let dataSufficiency: ScheduleEvidenceSufficiency = "sufficient";
    let abstentionReason: string | undefined;

    if (conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = "conflicting_schedule_evidence";
    } else if (usable.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "no_schedule_evidence";
    } else if (freshness < 0.2) {
      dataSufficiency = "stale";
      abstentionReason = "stale_schedule_evidence";
    } else if (usable.length < minimumEvidenceCount || declaredCount === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_schedule_evidence";
    } else if (score < threshold) {
      dataSufficiency = "limited";
      reasons.push("limited_schedule_evidence_basis");
    }

    if (isAbstainingScheduleSufficiency(dataSufficiency) && !abstentionReason) {
      abstentionReason = "insufficient_schedule_evidence";
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
      agreement,
      conflictState: conflictDetected ? "detected" : "none",
      abstentionReason,
      reasons: [...new Set(reasons)],
      method: "schedule_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      engineeringCorrectnessClaimed: false,
      criticalPathClaimed: false,
      floatClaimed: false,
    };
  }
}

export function createScheduleConfidenceEngine(): ScheduleConfidenceEngine {
  return new ScheduleConfidenceEngine();
}

function confidenceClassFor(
  score: number,
  sufficiency: ScheduleEvidenceSufficiency,
): ScheduleConfidenceClass {
  if (isAbstainingScheduleSufficiency(sufficiency)) return "unavailable";
  if (score >= 0.75) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

function scoreFreshness(
  evidence: readonly ScheduleEvidence[],
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

function scoreReviewCompleteness(evidence: readonly ScheduleEvidence[]): number {
  if (evidence.length === 0) return 0;
  const reviewed = evidence.filter((item) =>
    item.reviewStatus === "reviewed" ||
    item.reviewStatus === "approved" ||
    item.reviewStatus === "published",
  ).length;
  return reviewed / evidence.length;
}

function scoreAgreement(
  evidence: readonly ScheduleEvidence[],
  disagreementThresholdDays: number,
): {
  agreement: number;
  dateConflict: boolean;
  postureConflict: boolean;
  declaredCount: number;
} {
  const dates = evidence
    .map((item) => item.declaredCurrentDate ?? item.declaredBaselineDate)
    .filter((value): value is string => typeof value === "string" && Number.isFinite(Date.parse(value)))
    .map((value) => Date.parse(value));
  const postures = evidence
    .map((item) => item.declaredPosture)
    .filter((value): value is MilestonePosture => typeof value === "string");

  const declaredCount = Math.max(dates.length, postures.length);

  let dateConflict = false;
  if (dates.length >= 2) {
    const min = Math.min(...dates);
    const max = Math.max(...dates);
    const spreadDays = (max - min) / 86_400_000;
    dateConflict = spreadDays > disagreementThresholdDays;
  }

  const postureSet = new Set(postures.filter((p) => p !== "unknown"));
  const postureConflict = postureSet.size > 1;

  let agreement = 1;
  if (dateConflict || postureConflict) agreement = 0.2;
  else if (declaredCount === 0) agreement = 0.4;
  else if (postures.length >= 2 && postureSet.size === 1) agreement = 1;
  else if (dates.length >= 2) agreement = 0.85;

  return { agreement, dateConflict, postureConflict, declaredCount };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
