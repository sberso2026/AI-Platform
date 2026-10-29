/**
 * Phase 11G — Forecast Intelligence domain types.
 *
 * Forecast Intelligence describes advisory trajectory posture from published
 * composed contributor outputs. It is NOT predictive scheduling, NOT completion
 * date prediction, NOT earned value, and NOT a budget or financial forecast.
 *
 * Forbidden throughout: CPM, critical path, float, EV/CPI/SPI/BCWS/BCWP/ACWP,
 * resource leveling/planning, budget ledger, financial posting, deterministic
 * finish dates, completion date prediction, contractual commitments.
 */

import type { ProjectProfileContributorKey } from "./progress";
import type { ProjectScopeRef } from "./progress";

// ---------------------------------------------------------------------------
// Control context
// ---------------------------------------------------------------------------

export type ForecastControlContext = {
  scope: ProjectScopeRef;
  /** Trajectory thread identifier (project phase, delivery thread, etc.). */
  trajectoryUnitId: string;
  trajectoryUnitLabel?: string;
};

// ---------------------------------------------------------------------------
// Composed contributor references (evidence provenance)
// ---------------------------------------------------------------------------

export const FORECAST_CONTRIBUTOR_KEYS = [
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
] as const;

export type ForecastContributorKey = (typeof FORECAST_CONTRIBUTOR_KEYS)[number];

export type ForecastContributorRef = {
  contributorKey: ForecastContributorKey;
  stateId: string;
  status: string;
  abstained: boolean;
  postureOrIndication?: string;
  assessedAt?: string;
};

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const FORECAST_EVIDENCE_KINDS = [
  "composed_context_ref",
  "progress_assessment_ref",
  "schedule_assessment_ref",
  "change_assessment_ref",
  "cost_assessment_ref",
  "productivity_assessment_ref",
  "project_profile_ref",
  "manual_observation",
] as const;

export type ForecastEvidenceKind = (typeof FORECAST_EVIDENCE_KINDS)[number];

export const FORECAST_EVIDENCE_SOURCE_TYPES = [
  "project_context_composition",
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
  "project_context_engine",
  "approved_document",
] as const;

export type ForecastEvidenceSourceType = (typeof FORECAST_EVIDENCE_SOURCE_TYPES)[number];

export const FORECAST_EVIDENCE_PROVENANCE = [
  "primary_source",
  "system_reference",
  "human_attestation",
  "derived_reference",
  "unknown",
] as const;

export type ForecastEvidenceProvenance = (typeof FORECAST_EVIDENCE_PROVENANCE)[number];

export const FORECAST_EVIDENCE_REVIEW_STATUSES = [
  "unreviewed",
  "pending_review",
  "reviewed",
  "approved",
  "published",
  "revoked",
] as const;

export type ForecastEvidenceReviewStatus =
  (typeof FORECAST_EVIDENCE_REVIEW_STATUSES)[number];

export const FORECAST_TRAJECTORY_SIGNALS = [
  "favourable",
  "stable",
  "uncertain",
  "deteriorating",
  "recovery_possible",
  "unknown",
] as const;

export type ForecastTrajectorySignal = (typeof FORECAST_TRAJECTORY_SIGNALS)[number];

/**
 * One governed reference to a composed contributor output — never fabricated.
 */
export type ForecastEvidence = {
  evidenceId: string;
  kind: ForecastEvidenceKind;
  sourceType: ForecastEvidenceSourceType;
  sourceRef: string;
  sourceKey: string;
  provenance: ForecastEvidenceProvenance;
  reviewStatus: ForecastEvidenceReviewStatus;
  observedAt?: string;
  sourceVersion?: string;
  declaredSignal?: ForecastTrajectorySignal;
  confidence?: number;
  weight?: number;
  narrative?: string;
  revoked?: boolean;
  conflictsWith?: string[];
  contributorKey?: ForecastContributorKey;
  completionDateClaimed: false;
  costForecastClaimed: false;
  earnedValueDerived: false;
  cpmDerived: false;
  resourcePlanningClaimed: false;
  budgetLedgerClaimed: false;
  financialPostingClaimed: false;
  mutatesCoreRisk: false;
};

// ---------------------------------------------------------------------------
// Posture (qualitative only — NOT numeric, NOT dates, NOT %)
// ---------------------------------------------------------------------------

export const FORECAST_POSTURES = [
  "favourable",
  "stable",
  "uncertain",
  "deteriorating",
  "recovery_possible",
  "unknown",
] as const;

export type ForecastPosture = (typeof FORECAST_POSTURES)[number];

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

export const FORECAST_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "stale",
] as const;

export type ForecastEvidenceSufficiency =
  (typeof FORECAST_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type ForecastConfidenceClass = "high" | "medium" | "low" | "unavailable";

export type ForecastConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  score: number;
  confidenceClass: ForecastConfidenceClass;
  dataSufficiency: ForecastEvidenceSufficiency;
  evidenceCount: number;
  usableEvidenceCount: number;
  contributorCoverage: number;
  sourceDiversity: number;
  freshness: number;
  reviewCompleteness: number;
  provenanceQuality: number;
  agreement: number;
  conflictState: "none" | "detected";
  abstention: boolean;
  abstentionReason?: string;
  reasons: string[];
  method: "forecast_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  completionDateClaimed: false;
  costForecastClaimed: false;
};

// ---------------------------------------------------------------------------
// Assessment state
// ---------------------------------------------------------------------------

export const FORECAST_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
  "superseded",
] as const;

export type ForecastAssessmentStatus = (typeof FORECAST_ASSESSMENT_STATUSES)[number];

/**
 * Advisory forecast assessment from published composed contributors.
 * When `abstained` is true no posture is published.
 */
export type ForecastAssessmentState = {
  id: string;
  stateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ForecastControlContext;
  version: number;
  status: ForecastAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  forecastPosture: ForecastPosture;
  contributingContributors: ForecastContributorRef[];
  evidenceRefs: string[];
  confidence: ForecastConfidence;
  assumptions: string[];
  limitations: string[];
  reasons: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "forecast_intelligence_advisory_v1";
  methodVersion: "1";
  assessedAt: string;
  recordedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  composedContextId?: string;
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  completionDatePredicted: false;
  costForecastComputed: false;
  resourcePlanningPerformed: false;
  budgetLedgerMutated: false;
  financialPostingPerformed: false;
  scheduleExecuted: false;
  changeExecuted: false;
  predictiveSchedulingPerformed: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  mutatesUpstreamContributors: false;
  autonomousPublication: false;
};

export type ForecastReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

export type ForecastReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  forecastStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: ForecastReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
  completionDateClaimed: false;
};

/** Rollup contribution the Project Context Engine embeds in ProjectProfile. */
export type ForecastProfileContribution = {
  forecastsAssessed: number;
  forecastsAbstained: number;
  publishedForecasts: number;
  favourableCount: number;
  stableCount: number;
  uncertainCount: number;
  deterioratingCount: number;
  recoveryPossibleCount: number;
  dominantPosture?: ForecastPosture;
  contributorCoverageCount: number;
  lowestConfidenceClass: ForecastConfidenceClass;
  dominantSufficiency: ForecastEvidenceSufficiency;
  latestAssessmentAt?: string;
  completionDateClaimed: false;
};

// ---------------------------------------------------------------------------
// Timeline extensions (project-level)
// ---------------------------------------------------------------------------

export const FORECAST_TIMELINE_KINDS = [
  "forecast_updated",
  "forecast_abstained",
  "forecast_reviewed",
  "forecast_published",
  "forecast_rejected",
  "forecast_superseded",
] as const;

export type ForecastTimelineKind = (typeof FORECAST_TIMELINE_KINDS)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isAbstainingForecastSufficiency(
  sufficiency: ForecastEvidenceSufficiency,
): boolean {
  return (
    sufficiency === "insufficient" ||
    sufficiency === "conflicting" ||
    sufficiency === "stale"
  );
}

export function forecastStateKey(scope: ProjectScopeRef, trajectoryUnitId: string): string {
  const scopePart =
    scope.kind === "project"
      ? `project:${scope.projectId}`
      : `${scope.kind}:${scope.referenceId ?? "unknown"}`;
  return `${scopePart}#${trajectoryUnitId}`;
}

export function dominantForecastPosture(
  postures: readonly ForecastPosture[],
): ForecastPosture | undefined {
  if (postures.length === 0) return undefined;
  const counts = new Map<ForecastPosture, number>();
  for (const value of postures) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function isActiveForecastContributorKey(
  key: ProjectProfileContributorKey,
): key is ForecastContributorKey {
  return (FORECAST_CONTRIBUTOR_KEYS as readonly string[]).includes(key);
}
