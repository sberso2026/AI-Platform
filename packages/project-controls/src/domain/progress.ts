/**
 * Phase 11B — Progress Intelligence domain types.
 *
 * Progress Intelligence describes *what the evidence supports* about how far a
 * scope has advanced. It is advisory. It is not earned value, not a payment
 * certificate, and not a certified physical percent complete.
 *
 * Every persisted record carries its forbid locks so the constraint travels
 * with the data instead of living only in a review comment.
 */

import type { ProjectScopeKind } from "@rtb/engineering-shared-project-domain";

/** A scope Project Controls may attach progress intelligence to. */
export type ProjectScopeRef = {
  kind: ProjectScopeKind;
  projectId: string;
  /** Required for every kind except `project`. */
  referenceId?: string;
};

export const PROGRESS_EVIDENCE_KINDS = [
  "site_observation",
  "quantity_record",
  "inspection_result",
  "document_status",
  "milestone_attestation",
  "meeting_statement",
  "supplier_confirmation",
  "checklist_completion",
  "photo_record",
  "engineering_judgement",
] as const;

export type ProgressEvidenceKind = (typeof PROGRESS_EVIDENCE_KINDS)[number];

export const PROGRESS_EVIDENCE_SOURCE_TYPES = [
  "manual_engineering_assessment",
  "inspection_intelligence",
  "project_intelligence",
  "asset_intelligence",
  "external_import",
  "supplier_report",
] as const;

export type ProgressEvidenceSourceType = (typeof PROGRESS_EVIDENCE_SOURCE_TYPES)[number];

/**
 * One observation that speaks to progress. `indicatedCompletion` is a *reported*
 * figure from the source, never a computed earned value. It is optional: a piece
 * of evidence can be qualitative and still count toward sufficiency.
 */
export type ProgressEvidence = {
  evidenceId: string;
  kind: ProgressEvidenceKind;
  sourceType: ProgressEvidenceSourceType;
  sourceKey: string;
  sourceReference?: string;
  observedAt?: string;
  narrative?: string;
  /** 0..1 as reported by the source. Advisory input only. */
  indicatedCompletion?: number;
  /** Relative trust weight, 0..1. Defaults to 1 when omitted. */
  weight?: number;
  reviewStatus?: "unreviewed" | "pending_review" | "reviewed" | "approved" | "published";
  revoked?: boolean;
  /** Evidence ids this observation materially disagrees with. */
  conflictsWith?: string[];
  /** Locks persisted with the evidence row. */
  derivedFromEarnedValue: false;
  derivedFromCostData: false;
};

export const PROGRESS_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "stale",
] as const;

export type ProgressEvidenceSufficiency =
  (typeof PROGRESS_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type ProgressConfidenceClass = "high" | "medium" | "low" | "unavailable";

/**
 * Confidence in the *evidence basis* for a progress assessment — not confidence
 * that the reported progress is engineering-correct.
 */
export type ProgressConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  score: number;
  confidenceClass: ProgressConfidenceClass;
  dataSufficiency: ProgressEvidenceSufficiency;
  evidenceCount: number;
  usableEvidenceCount: number;
  sourceDiversity: number;
  freshness: number;
  reviewCompleteness: number;
  agreement: number;
  conflictState: "none" | "detected";
  abstentionReason?: string;
  reasons: string[];
  method: "progress_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  /** Confidence never asserts engineering correctness. */
  engineeringCorrectnessClaimed: false;
};

export const PROGRESS_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
] as const;

export type ProgressAssessmentStatus = (typeof PROGRESS_ASSESSMENT_STATUSES)[number];

export const PROGRESS_BANDS = [
  "not_started",
  "early",
  "in_progress",
  "advanced",
  "substantially_complete",
  "complete",
  "unavailable",
] as const;

export type ProgressBand = (typeof PROGRESS_BANDS)[number];

export type ProgressTrendDirection = "improving" | "stable" | "declining" | "unknown";

/**
 * The advisory progress assessment for a scope, at a version.
 *
 * When `abstained` is true, `indicatedCompletion` and `band` are absent — the
 * engine refuses to invent a number rather than reporting a low-confidence one.
 */
export type ProgressAssessmentState = {
  stateId: string;
  assessmentId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  version: number;
  status: ProgressAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  /** 0..1 advisory indication. Absent when abstained. */
  indicatedCompletion?: number;
  band?: ProgressBand;
  trendDirection: ProgressTrendDirection;
  confidence: ProgressConfidence;
  evidenceRefs: string[];
  reasons: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "progress_intelligence_advisory_v1";
  methodVersion: "1";
  assessedAt: string;
  recordedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  // ---- Forbid locks persisted with every assessment ----
  earnedValueComputed: false;
  criticalPathComputed: false;
  costIntegrated: false;
  forecastProduced: false;
  scheduleExecuted: false;
  resourceLevelled: false;
  physicalPercentCompleteCertified: false;
  paymentCertificationClaimed: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  autonomousPublication: false;
};

export type ProgressReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

export type ProgressReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: ProgressReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  /** A reviewer may never approve their own assessment. */
  selfApproved: false;
};

/** Immutable composed view of a scope's progress at a point in time. */
export type ProgressSnapshot = {
  snapshotId: string;
  schemaVersion: "project_controls_progress_snapshot/1";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  capturedAt: string;
  assessmentStateId: string;
  status: ProgressAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  indicatedCompletion?: number;
  band?: ProgressBand;
  confidenceClass: ProgressConfidenceClass;
  dataSufficiency: ProgressEvidenceSufficiency;
  evidenceRefs: string[];
  projectReferenceResolved: true;
  isProjectRegistry: false;
  mutatesProjectIdentity: false;
};

export const PROGRESS_TIMELINE_KINDS = [
  "progress_assessed",
  "progress_abstained",
  "progress_review_started",
  "progress_reviewed",
  "progress_published",
  "progress_rejected",
  "project_profile_composed",
] as const;

export type ProgressTimelineKind = (typeof PROGRESS_TIMELINE_KINDS)[number];

export type ProgressTimelineEvent = {
  entryId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  stateId?: string;
  kind: ProgressTimelineKind;
  eventType: string;
  recordedAt: string;
  sourceKey: string;
  actorId?: string;
  detail?: string;
  governance: {
    advisoryOnly: true;
    earnedValueComputed: false;
    criticalPathComputed: false;
    mutatesProjectIdentity: false;
  };
};

/** Ordered progress timeline for a project/scope (Phase 11B certification surface). */
export type ProgressTimeline = {
  projectId: string;
  scope: ProjectScopeRef;
  events: readonly ProgressTimelineEvent[];
};

// ---------------------------------------------------------------------------
// Project profile (Project Context Engine output)
// ---------------------------------------------------------------------------

export const PROJECT_PROFILE_CONTRIBUTOR_KEYS = [
  "progress_intelligence",
  "cost_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "contingency_intelligence",
  "productivity_intelligence",
  "earned_value",
  "forecast",
] as const;

export type ProjectProfileContributorKey = (typeof PROJECT_PROFILE_CONTRIBUTOR_KEYS)[number];

export type ProjectProfileContributor = {
  key: ProjectProfileContributorKey;
  status: "active" | "reserved";
  ownedBy: string;
  notes: string;
};

export type ProjectProfileClass =
  | "composed"
  | "partially_composed"
  | "abstained";

/**
 * A composed, read-only view of everything Project Controls currently knows
 * about a project. In 11B the only active contributor is progress intelligence;
 * the reserved contributors are listed so consumers can see the shape of the
 * eventual profile without being able to read values that do not exist.
 */
export type ProjectProfile = {
  profileId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  version: number;
  profileClass: ProjectProfileClass;
  composedAt: string;
  recordedAt: string;
  projectCode: string;
  projectName: string;
  projectPhase: string;
  projectStatus: string;
  /** Progress rollups are counts and bands only — never a weighted percentage. */
  progress: {
    scopesAssessed: number;
    scopesAbstained: number;
    publishedScopes: number;
    projectScopeIndication?: number;
    projectScopeBand?: ProgressBand;
    lowestConfidenceClass: ProgressConfidenceClass;
    dominantSufficiency: ProgressEvidenceSufficiency;
    latestAssessmentAt?: string;
  };
  /**
   * Schedule rollups from Phase 11C. Absent/empty when no schedule assessments
   * were supplied. Never includes CPM, float or a critical path.
   */
  schedule?: {
    scopesAssessed: number;
    scopesAbstained: number;
    publishedScopes: number;
    dominantMilestonePosture?: import("./schedule").MilestonePosture;
    lowestConfidenceClass: import("./schedule").ScheduleConfidenceClass;
    dominantSufficiency: import("./schedule").ScheduleEvidenceSufficiency;
    latestAssessmentAt?: string;
  };
  /**
   * Change rollups from Phase 11D. Counts and contexts only — never a monetary
   * quantum, never a contractual position.
   */
  change?: import("./change").ChangeProfileContribution;
  /**
   * Reserved shape for the Phase 11E cost contributor. Always absent in 11D;
   * declared so consumers can see where cost intelligence will land without
   * being able to read a value that does not exist.
   */
  costContribution?: never;
  contributors: readonly ProjectProfileContributor[];
  activeContributorKeys: readonly ProjectProfileContributorKey[];
  reservedContributorKeys: readonly ProjectProfileContributorKey[];
  reasons: string[];
  abstained: boolean;
  abstentionReason?: string;
  createdBy?: string;
  supersedesId?: string;
  // ---- Forbid locks ----
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  costIntegrated: false;
  financialPostingPerformed: false;
  contractualApprovalClaimed: false;
  forecastProduced: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  isProjectRegistry: false;
};

export function progressBandFor(indication: number): ProgressBand {
  if (indication <= 0) return "not_started";
  if (indication < 0.25) return "early";
  if (indication < 0.7) return "in_progress";
  if (indication < 0.95) return "advanced";
  if (indication < 1) return "substantially_complete";
  return "complete";
}

export function isAbstainingSufficiency(sufficiency: ProgressEvidenceSufficiency): boolean {
  return (
    sufficiency === "insufficient" || sufficiency === "conflicting" || sufficiency === "stale"
  );
}

export function scopeKey(scope: ProjectScopeRef): string {
  return scope.kind === "project"
    ? `project:${scope.projectId}`
    : `${scope.kind}:${scope.referenceId ?? "unknown"}`;
}
