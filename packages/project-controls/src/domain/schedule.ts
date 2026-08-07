/**
 * Phase 11C — Schedule Intelligence domain types.
 *
 * Schedule Intelligence describes *what the evidence supports* about declared
 * schedule / milestone posture. It is advisory. It is not CPM, not float, not
 * schedule execution, and not a planning-system replacement.
 */

import type { ProjectScopeRef } from "./progress";

export const SCHEDULE_EVIDENCE_KINDS = [
  "baseline_declaration",
  "milestone_declaration",
  "meeting_statement",
  "document_status",
  "inspection_result",
  "progress_assessment_ref",
  "manual_engineering_update",
  "planning_system_import",
  "photo_record",
  "finding_record",
] as const;

export type ScheduleEvidenceKind = (typeof SCHEDULE_EVIDENCE_KINDS)[number];

export const SCHEDULE_EVIDENCE_SOURCE_TYPES = [
  "manual_engineering_assessment",
  "inspection_intelligence",
  "project_intelligence",
  "progress_intelligence",
  "approved_document",
  "approved_meeting",
  "external_planning_import",
] as const;

export type ScheduleEvidenceSourceType = (typeof SCHEDULE_EVIDENCE_SOURCE_TYPES)[number];

export const MILESTONE_POSTURES = [
  "on_track",
  "at_risk",
  "missed",
  "unknown",
] as const;

export type MilestonePosture = (typeof MILESTONE_POSTURES)[number];

/**
 * One observation that speaks to schedule posture. Dates are *declared* by the
 * source. The engine never computes a longest path or float from them.
 */
export type ScheduleEvidence = {
  evidenceId: string;
  kind: ScheduleEvidenceKind;
  sourceType: ScheduleEvidenceSourceType;
  sourceKey: string;
  sourceReference?: string;
  observedAt?: string;
  narrative?: string;
  /** Declared baseline date from the source (ISO date or datetime). */
  declaredBaselineDate?: string;
  /** Declared current / forecast date from the source — not a computed forecast. */
  declaredCurrentDate?: string;
  /** Declared milestone posture from the source. */
  declaredPosture?: MilestonePosture;
  weight?: number;
  reviewStatus?: "unreviewed" | "pending_review" | "reviewed" | "approved" | "published";
  revoked?: boolean;
  conflictsWith?: string[];
  derivedFromCpm: false;
  derivedFromFloat: false;
  derivedFromEarnedValue: false;
  mutatesActivityIdentity: false;
};

export const SCHEDULE_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "stale",
] as const;

export type ScheduleEvidenceSufficiency =
  (typeof SCHEDULE_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type ScheduleConfidenceClass = "high" | "medium" | "low" | "unavailable";

export type ScheduleConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  score: number;
  confidenceClass: ScheduleConfidenceClass;
  dataSufficiency: ScheduleEvidenceSufficiency;
  evidenceCount: number;
  usableEvidenceCount: number;
  sourceDiversity: number;
  freshness: number;
  reviewCompleteness: number;
  agreement: number;
  conflictState: "none" | "detected";
  abstentionReason?: string;
  reasons: string[];
  method: "schedule_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  engineeringCorrectnessClaimed: false;
  criticalPathClaimed: false;
  floatClaimed: false;
};

export const SCHEDULE_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
] as const;

export type ScheduleAssessmentStatus = (typeof SCHEDULE_ASSESSMENT_STATUSES)[number];

export type ScheduleAssessmentState = {
  stateId: string;
  assessmentId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  version: number;
  status: ScheduleAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  /** Dominant advisory milestone posture from evidence — never from CPM. */
  milestonePosture?: MilestonePosture;
  declaredBaselineDate?: string;
  declaredCurrentDate?: string;
  /** Days between declared current and baseline when both present; sign indicates slip. */
  declaredDateDeltaDays?: number;
  confidence: ScheduleConfidence;
  evidenceRefs: string[];
  reasons: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "schedule_intelligence_advisory_v1";
  methodVersion: "1";
  assessedAt: string;
  recordedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  // Forbid locks
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  forwardBackwardPassComputed: false;
  costIntegrated: false;
  forecastProduced: false;
  scheduleExecuted: false;
  resourceLevelled: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  mutatesActivityIdentity: false;
  autonomousPublication: false;
};

export type ScheduleReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

export type ScheduleReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: ScheduleReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
};

export type ScheduleSnapshot = {
  snapshotId: string;
  schemaVersion: "project_controls_schedule_snapshot/1";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  capturedAt: string;
  assessmentStateId: string;
  status: ScheduleAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  milestonePosture?: MilestonePosture;
  confidenceClass: ScheduleConfidenceClass;
  dataSufficiency: ScheduleEvidenceSufficiency;
  evidenceRefs: string[];
  projectReferenceResolved: true;
  isProjectRegistry: false;
  mutatesProjectIdentity: false;
  criticalPathComputed: false;
  floatComputed: false;
};

export const SCHEDULE_TIMELINE_KINDS = [
  "schedule_assessed",
  "schedule_abstained",
  "schedule_reviewed",
  "schedule_published",
  "schedule_rejected",
] as const;

export type ScheduleTimelineKind = (typeof SCHEDULE_TIMELINE_KINDS)[number];

export type ScheduleTimelineEvent = {
  entryId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  stateId?: string;
  kind: ScheduleTimelineKind;
  eventType: string;
  recordedAt: string;
  sourceKey: string;
  actorId?: string;
  detail?: string;
  governance: {
    advisoryOnly: true;
    earnedValueComputed: false;
    criticalPathComputed: false;
    floatComputed: false;
    mutatesProjectIdentity: false;
  };
};

export type ScheduleTimeline = {
  projectId: string;
  scope: ProjectScopeRef;
  events: readonly ScheduleTimelineEvent[];
};

/** Rollup contribution the Project Context Engine embeds in ProjectProfile. */
export type ScheduleProfileContribution = {
  scopesAssessed: number;
  scopesAbstained: number;
  publishedScopes: number;
  dominantMilestonePosture?: MilestonePosture;
  lowestConfidenceClass: ScheduleConfidenceClass;
  dominantSufficiency: ScheduleEvidenceSufficiency;
  latestAssessmentAt?: string;
};

export function isAbstainingScheduleSufficiency(
  sufficiency: ScheduleEvidenceSufficiency,
): boolean {
  return (
    sufficiency === "insufficient" || sufficiency === "conflicting" || sufficiency === "stale"
  );
}

export function dominantMilestonePosture(
  postures: readonly MilestonePosture[],
): MilestonePosture | undefined {
  if (postures.length === 0) return undefined;
  const priority: MilestonePosture[] = ["missed", "at_risk", "on_track", "unknown"];
  for (const p of priority) {
    if (postures.includes(p)) return p;
  }
  return postures[0];
}
