/**
 * Phase 11I — Scenario Intelligence domain types.
 *
 * Scenario Intelligence produces EXPLORATORY / ADVISORY scenario comparisons —
 * never instructions, decisions, recommendations-as-authority, or executions.
 * It consumes composed project context, forecast intelligence, and decision
 * support recommendations without mutating upstream contributors.
 *
 * Forbidden throughout: preferred scenario selection, optimisation, auto-execution,
 * Monte Carlo, unsupported percentages, CPM, EV, financial posting, schedule/cost
 * execution, contractual approval claims.
 */

import type { ProjectProfileContributorKey } from "./progress";
import type { ProjectScopeRef } from "./progress";

// ---------------------------------------------------------------------------
// Control context
// ---------------------------------------------------------------------------

export type ScenarioControlContext = {
  scope: ProjectScopeRef;
  /** Scenario thread identifier (governance topic, review thread, etc.). */
  scenarioUnitId: string;
  scenarioUnitLabel?: string;
};

// ---------------------------------------------------------------------------
// Contributor references (evidence provenance)
// ---------------------------------------------------------------------------

export const SCENARIO_CONTRIBUTOR_KEYS = [
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
  "forecast",
  "decision_support",
] as const;

export type ScenarioContributorKey = (typeof SCENARIO_CONTRIBUTOR_KEYS)[number];

export type ScenarioContributorRef = {
  contributorKey: ScenarioContributorKey | "forecast" | "decision_support";
  stateId: string;
  status: string;
  abstained: boolean;
  postureOrIndication?: string;
  assessedAt?: string;
};

// ---------------------------------------------------------------------------
// Scenario taxonomy (deterministic advisory classes only)
// ---------------------------------------------------------------------------

export const SCENARIO_TYPES = [
  "maintain_current_posture",
  "investigate",
  "coordinate",
  "prioritise",
  "defer",
  "recovery_planning",
  "alternative_sequence",
  "unknown",
] as const;

export type ScenarioType = (typeof SCENARIO_TYPES)[number];

export const FORBIDDEN_SCENARIO_SELECTION = [
  "preferred",
  "winning",
  "optimal",
  "recommended",
  "selected",
] as const;

export type ForbiddenScenarioSelection = (typeof FORBIDDEN_SCENARIO_SELECTION)[number];

// ---------------------------------------------------------------------------
// Scenario options and comparison (no preferred selection)
// ---------------------------------------------------------------------------

export type ScenarioOption = {
  optionId: string;
  scenarioType: ScenarioType;
  objective: string;
  assumptions: string[];
  dependencies: string[];
  constraints: string[];
  uncertainties: string[];
  potentialImplications: string[];
  supportingEvidenceIds: string[];
  limitations: string[];
  affectedContributors: ScenarioContributorKey[];
  /** Explicitly never set — comparison only, no ranking winner. */
  preferredRank?: never;
  selectionClaimed: false;
};

export type ScenarioComparison = {
  comparisonId: string;
  scenarioOptions: ScenarioOption[];
  /** Advisory notes on differences — never declares a preferred scenario. */
  comparisonNotes: string[];
  /** Must remain false — no optimisation or preferred selection. */
  preferredScenarioSelected: false;
  optimisationPerformed: false;
};

export type ScenarioConfidenceSummary = {
  dataSufficiency: ScenarioEvidenceSufficiency;
  confidenceClass: ScenarioConfidenceClass;
  abstention: boolean;
  abstentionReason?: string;
};

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const SCENARIO_EVIDENCE_KINDS = [
  "composed_context_ref",
  "forecast_assessment_ref",
  "decision_assessment_ref",
  "progress_assessment_ref",
  "schedule_assessment_ref",
  "change_assessment_ref",
  "cost_assessment_ref",
  "productivity_assessment_ref",
  "project_profile_ref",
  "manual_observation",
] as const;

export type ScenarioEvidenceKind = (typeof SCENARIO_EVIDENCE_KINDS)[number];

export const SCENARIO_EVIDENCE_SOURCE_TYPES = [
  "project_context_composition",
  "forecast_intelligence",
  "decision_support",
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
  "project_context_engine",
  "approved_document",
] as const;

export type ScenarioEvidenceSourceType = (typeof SCENARIO_EVIDENCE_SOURCE_TYPES)[number];

export const SCENARIO_EVIDENCE_PROVENANCE = [
  "primary_source",
  "system_reference",
  "human_attestation",
  "derived_reference",
  "unknown",
] as const;

export type ScenarioEvidenceProvenance = (typeof SCENARIO_EVIDENCE_PROVENANCE)[number];

export const SCENARIO_EVIDENCE_REVIEW_STATUSES = [
  "unreviewed",
  "pending_review",
  "reviewed",
  "approved",
  "published",
  "revoked",
] as const;

export type ScenarioEvidenceReviewStatus =
  (typeof SCENARIO_EVIDENCE_REVIEW_STATUSES)[number];

export type ScenarioEvidence = {
  evidenceId: string;
  kind: ScenarioEvidenceKind;
  sourceType: ScenarioEvidenceSourceType;
  sourceRef: string;
  sourceKey: string;
  provenance: ScenarioEvidenceProvenance;
  reviewStatus: ScenarioEvidenceReviewStatus;
  observedAt?: string;
  sourceVersion?: string;
  declaredSignal?: string;
  narrative?: string;
  revoked?: boolean;
  conflictsWith?: string[];
  contributorKey?: ScenarioContributorKey | "forecast" | "decision_support";
  autoExecutionClaimed: false;
  scheduleExecutionClaimed: false;
  costExecutionClaimed: false;
  contractInstructionClaimed: false;
  approvalAuthorityClaimed: false;
  earnedValueDerived: false;
  cpmDerived: false;
  financialPostingClaimed: false;
  monteCarloClaimed: false;
  numericalPrecisionClaimed: false;
  preferredSelectionClaimed: false;
  optimisationClaimed: false;
  mutatesCoreRisk: false;
};

// ---------------------------------------------------------------------------
// Confidence (qualitative posture only — no fabricated precision)
// ---------------------------------------------------------------------------

export const SCENARIO_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "stale",
] as const;

export type ScenarioEvidenceSufficiency =
  (typeof SCENARIO_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type ScenarioConfidenceClass = "high" | "medium" | "low" | "unavailable";

export type ScenarioConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  confidenceClass: ScenarioConfidenceClass;
  dataSufficiency: ScenarioEvidenceSufficiency;
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
  method: "scenario_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  autoExecutionClaimed: false;
  approvalAuthorityClaimed: false;
  preferredSelectionClaimed: false;
  optimisationClaimed: false;
  monteCarloClaimed: false;
  numericalPrecisionClaimed: false;
};

// ---------------------------------------------------------------------------
// Assessment state
// ---------------------------------------------------------------------------

export const SCENARIO_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
  "superseded",
] as const;

export type ScenarioAssessmentStatus = (typeof SCENARIO_ASSESSMENT_STATUSES)[number];

/**
 * Advisory scenario intelligence assessment — exploratory scenario comparison only.
 * When `abstained` is true no scenario comparison is published.
 */
export type ScenarioAssessmentState = {
  id: string;
  stateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ScenarioControlContext;
  version: number;
  status: ScenarioAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  comparison: ScenarioComparison;
  scenarioOptions: ScenarioOption[];
  contributingContributors: ScenarioContributorRef[];
  evidenceRefs: string[];
  confidence: ScenarioConfidence;
  assumptions: string[];
  limitations: string[];
  reasons: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "scenario_intelligence_advisory_v1";
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
  decisionContextId?: string;
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
  completionDatePredicted: false;
  costDecisionComputed: false;
  scheduleExecuted: false;
  preferredScenarioSelected: false;
  optimisationPerformed: false;
  monteCarloPerformed: false;
  numericalPrecisionClaimed: false;
};

export type ScenarioReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

export type ScenarioReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scenarioStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: ScenarioReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
  approvalAuthorityClaimed: false;
};

/** Rollup contribution the Project Context Engine embeds in ProjectProfile. */
export type ScenarioProfileContribution = {
  scenariosAssessed: number;
  scenariosAbstained: number;
  publishedScenarios: number;
  maintainCurrentPostureCount: number;
  investigateCount: number;
  coordinateCount: number;
  prioritiseCount: number;
  deferCount: number;
  recoveryPlanningCount: number;
  alternativeSequenceCount: number;
  unknownCount: number;
  scenarioOptionCount: number;
  contributorCoverageCount: number;
  lowestConfidenceClass: ScenarioConfidenceClass;
  dominantSufficiency: ScenarioEvidenceSufficiency;
  latestAssessmentAt?: string;
  autoExecutionClaimed: false;
  approvalAuthorityClaimed: false;
  preferredScenarioSelected: false;
  optimisationPerformed: false;
  completionDatePredicted: false;
  costDecisionComputed: false;
  scheduleExecuted: false;
};

// ---------------------------------------------------------------------------
// Timeline extensions (project-level)
// ---------------------------------------------------------------------------

export const SCENARIO_TIMELINE_KINDS = [
  "scenario_updated",
  "scenario_abstained",
  "scenario_reviewed",
  "scenario_published",
  "scenario_rejected",
  "scenario_superseded",
] as const;

export type ScenarioTimelineKind = (typeof SCENARIO_TIMELINE_KINDS)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isAbstainingScenarioSufficiency(
  sufficiency: ScenarioEvidenceSufficiency,
): boolean {
  return (
    sufficiency === "insufficient" ||
    sufficiency === "conflicting" ||
    sufficiency === "stale"
  );
}

export function isForbiddenScenarioSelection(value: string): value is ForbiddenScenarioSelection {
  return (FORBIDDEN_SCENARIO_SELECTION as readonly string[]).includes(value);
}

export function assertAllowedScenarioType(value: string): ScenarioType {
  if (!(SCENARIO_TYPES as readonly string[]).includes(value)) {
    throw new Error(`unknown_scenario_type:${value}`);
  }
  return value as ScenarioType;
}

export function scenarioStateKey(scope: ProjectScopeRef, scenarioUnitId: string): string {
  const scopePart =
    scope.kind === "project"
      ? `project:${scope.projectId}`
      : `${scope.kind}:${scope.referenceId ?? "unknown"}`;
  return `${scopePart}#${scenarioUnitId}`;
}

export function isActiveScenarioContributorKey(
  key: ProjectProfileContributorKey,
): key is ScenarioContributorKey | "forecast" | "decision_support" {
  return (SCENARIO_CONTRIBUTOR_KEYS as readonly string[]).includes(key);
}
