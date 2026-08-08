/**
 * Phase 11H — Decision Support Intelligence domain types.
 *
 * Decision Support produces OPTIONS / RECOMMENDATIONS — never instructions or
 * executions. It consumes composed project context plus forecast and upstream
 * intelligence contributors without mutating them.
 *
 * Forbidden throughout: approve/reject/execute/commit/authorise/instruct
 * contractor classes, auto-execution, CPM, EV, financial posting, schedule/cost
 * execution, contractual approval claims.
 */

import type { ProjectProfileContributorKey } from "./progress";
import type { ProjectScopeRef } from "./progress";

// ---------------------------------------------------------------------------
// Control context
// ---------------------------------------------------------------------------

export type DecisionControlContext = {
  scope: ProjectScopeRef;
  /** Decision thread identifier (governance topic, review thread, etc.). */
  decisionUnitId: string;
  decisionUnitLabel?: string;
};

// ---------------------------------------------------------------------------
// Contributor references (evidence provenance)
// ---------------------------------------------------------------------------

export const DECISION_CONTRIBUTOR_KEYS = [
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
  "forecast",
] as const;

export type DecisionContributorKey = (typeof DECISION_CONTRIBUTOR_KEYS)[number];

export type DecisionContributorRef = {
  contributorKey: DecisionContributorKey | "forecast";
  stateId: string;
  status: string;
  abstained: boolean;
  postureOrIndication?: string;
  assessedAt?: string;
};

// ---------------------------------------------------------------------------
// Decision classes (allowed advisory classes only)
// ---------------------------------------------------------------------------

export const DECISION_CLASSES = [
  "monitor",
  "investigate",
  "escalate",
  "review",
  "coordinate",
  "defer",
  "prioritise",
] as const;

export type DecisionClass = (typeof DECISION_CLASSES)[number];

export const FORBIDDEN_DECISION_CLASSES = [
  "approve",
  "reject",
  "execute",
  "commit",
  "authorise",
  "instruct_contractor",
] as const;

export type ForbiddenDecisionClass = (typeof FORBIDDEN_DECISION_CLASSES)[number];

// ---------------------------------------------------------------------------
// Options and recommendations
// ---------------------------------------------------------------------------

export type DecisionOption = {
  optionId: string;
  decisionClass: DecisionClass;
  objective: string;
  expectedBenefit: string;
  engineeringAssumptions: string[];
  limitations: string[];
  affectedContributors: DecisionContributorKey[];
  priorityRank?: number;
};

export type DecisionRecommendation = {
  recommendationId: string;
  decisionClass: DecisionClass;
  objective: string;
  supportingEvidenceIds: string[];
  expectedBenefit: string;
  engineeringAssumptions: string[];
  limitations: string[];
  confidence: DecisionConfidenceSummary;
  affectedContributors: DecisionContributorKey[];
  abstentionReason?: string;
};

export type DecisionConfidenceSummary = {
  dataSufficiency: DecisionEvidenceSufficiency;
  confidenceClass: DecisionConfidenceClass;
  abstention: boolean;
  abstentionReason?: string;
};

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const DECISION_EVIDENCE_KINDS = [
  "composed_context_ref",
  "forecast_assessment_ref",
  "progress_assessment_ref",
  "schedule_assessment_ref",
  "change_assessment_ref",
  "cost_assessment_ref",
  "productivity_assessment_ref",
  "project_profile_ref",
  "manual_observation",
] as const;

export type DecisionEvidenceKind = (typeof DECISION_EVIDENCE_KINDS)[number];

export const DECISION_EVIDENCE_SOURCE_TYPES = [
  "project_context_composition",
  "forecast_intelligence",
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
  "project_context_engine",
  "approved_document",
] as const;

export type DecisionEvidenceSourceType = (typeof DECISION_EVIDENCE_SOURCE_TYPES)[number];

export const DECISION_EVIDENCE_PROVENANCE = [
  "primary_source",
  "system_reference",
  "human_attestation",
  "derived_reference",
  "unknown",
] as const;

export type DecisionEvidenceProvenance = (typeof DECISION_EVIDENCE_PROVENANCE)[number];

export const DECISION_EVIDENCE_REVIEW_STATUSES = [
  "unreviewed",
  "pending_review",
  "reviewed",
  "approved",
  "published",
  "revoked",
] as const;

export type DecisionEvidenceReviewStatus =
  (typeof DECISION_EVIDENCE_REVIEW_STATUSES)[number];

export type DecisionEvidence = {
  evidenceId: string;
  kind: DecisionEvidenceKind;
  sourceType: DecisionEvidenceSourceType;
  sourceRef: string;
  sourceKey: string;
  provenance: DecisionEvidenceProvenance;
  reviewStatus: DecisionEvidenceReviewStatus;
  observedAt?: string;
  sourceVersion?: string;
  declaredSignal?: string;
  confidence?: number;
  weight?: number;
  narrative?: string;
  revoked?: boolean;
  conflictsWith?: string[];
  contributorKey?: DecisionContributorKey | "forecast";
  autoExecutionClaimed: false;
  scheduleExecutionClaimed: false;
  costExecutionClaimed: false;
  contractInstructionClaimed: false;
  approvalAuthorityClaimed: false;
  earnedValueDerived: false;
  cpmDerived: false;
  financialPostingClaimed: false;
  mutatesCoreRisk: false;
};

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

export const DECISION_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "stale",
] as const;

export type DecisionEvidenceSufficiency =
  (typeof DECISION_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type DecisionConfidenceClass = "high" | "medium" | "low" | "unavailable";

export type DecisionConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  score: number;
  confidenceClass: DecisionConfidenceClass;
  dataSufficiency: DecisionEvidenceSufficiency;
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
  method: "decision_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  autoExecutionClaimed: false;
  approvalAuthorityClaimed: false;
};

// ---------------------------------------------------------------------------
// Assessment state
// ---------------------------------------------------------------------------

export const DECISION_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
  "superseded",
] as const;

export type DecisionAssessmentStatus = (typeof DECISION_ASSESSMENT_STATUSES)[number];

/**
 * Advisory decision support assessment — options and recommendations only.
 * When `abstained` is true no recommendations are published.
 */
export type DecisionAssessmentState = {
  id: string;
  stateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: DecisionControlContext;
  version: number;
  status: DecisionAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  options: DecisionOption[];
  recommendations: DecisionRecommendation[];
  dominantDecisionClass?: DecisionClass;
  contributingContributors: DecisionContributorRef[];
  evidenceRefs: string[];
  confidence: DecisionConfidence;
  assumptions: string[];
  limitations: string[];
  reasons: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "decision_support_advisory_v1";
  methodVersion: "1";
  assessedAt: string;
  recordedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  composedContextId?: string;
  forecastContextId?: string;
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  autoExecutionEnabled: false;
  scheduleExecutionPerformed: false;
  costExecutionPerformed: false;
  contractInstructionPerformed: false;
  approvalAuthorityClaimed: false;
  resourcePlanningPerformed: false;
  budgetLedgerMutated: false;
  financialPostingPerformed: false;
  predictiveSchedulingPerformed: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  mutatesUpstreamContributors: false;
  autonomousPublication: false;
  /** Forbidden predictive claims — decision support never predicts completion dates. */
  completionDatePredicted: false;
  /** Forbidden cost decision engine claims — advisory recommendations only. */
  costDecisionComputed: false;
  /** Forbidden schedule execution — recommendations never mutate schedules. */
  scheduleExecuted: false;
};

export type DecisionReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

export type DecisionReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  decisionStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: DecisionReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
  approvalAuthorityClaimed: false;
};

/** Rollup contribution the Project Context Engine embeds in ProjectProfile. */
export type DecisionProfileContribution = {
  decisionsAssessed: number;
  decisionsAbstained: number;
  publishedDecisions: number;
  monitorCount: number;
  investigateCount: number;
  escalateCount: number;
  reviewCount: number;
  coordinateCount: number;
  deferCount: number;
  prioritiseCount: number;
  dominantDecisionClass?: DecisionClass;
  recommendationCount: number;
  contributorCoverageCount: number;
  lowestConfidenceClass: DecisionConfidenceClass;
  dominantSufficiency: DecisionEvidenceSufficiency;
  latestAssessmentAt?: string;
  autoExecutionClaimed: false;
  approvalAuthorityClaimed: false;
  completionDatePredicted: false;
  costDecisionComputed: false;
  scheduleExecuted: false;
};

// ---------------------------------------------------------------------------
// Timeline extensions (project-level)
// ---------------------------------------------------------------------------

export const DECISION_TIMELINE_KINDS = [
  "decision_updated",
  "decision_abstained",
  "decision_reviewed",
  "decision_published",
  "decision_rejected",
  "decision_superseded",
] as const;

export type DecisionTimelineKind = (typeof DECISION_TIMELINE_KINDS)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isAbstainingDecisionSufficiency(
  sufficiency: DecisionEvidenceSufficiency,
): boolean {
  return (
    sufficiency === "insufficient" ||
    sufficiency === "conflicting" ||
    sufficiency === "stale"
  );
}

export function isForbiddenDecisionClass(value: string): value is ForbiddenDecisionClass {
  return (FORBIDDEN_DECISION_CLASSES as readonly string[]).includes(value);
}

export function assertAllowedDecisionClass(value: string): DecisionClass {
  if (isForbiddenDecisionClass(value)) {
    throw new Error(`forbidden_decision_class:${value}`);
  }
  if (!(DECISION_CLASSES as readonly string[]).includes(value)) {
    throw new Error(`unknown_decision_class:${value}`);
  }
  return value as DecisionClass;
}

export function decisionStateKey(scope: ProjectScopeRef, decisionUnitId: string): string {
  const scopePart =
    scope.kind === "project"
      ? `project:${scope.projectId}`
      : `${scope.kind}:${scope.referenceId ?? "unknown"}`;
  return `${scopePart}#${decisionUnitId}`;
}

export function dominantDecisionClass(
  classes: readonly DecisionClass[],
): DecisionClass | undefined {
  if (classes.length === 0) return undefined;
  const counts = new Map<DecisionClass, number>();
  for (const value of classes) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function isActiveDecisionContributorKey(
  key: ProjectProfileContributorKey,
): key is DecisionContributorKey | "forecast" {
  return (DECISION_CONTRIBUTOR_KEYS as readonly string[]).includes(key);
}
