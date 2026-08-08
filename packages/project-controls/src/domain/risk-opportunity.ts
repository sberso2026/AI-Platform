/**
 * Phase 11J — Risk & Opportunity Intelligence domain types.
 *
 * Risk & Opportunity Intelligence produces ADVISORY intelligence signals —
 * never formal risk-register items, owner assignments, treatments, or executions.
 * AI intelligence signal ≠ formal project risk/opportunity.
 *
 * Consumes composed project context, forecast, decision support, scenario
 * intelligence, and upstream contributor evidence without mutating upstream
 * contributors or the canonical engineering risk register.
 *
 * Forbidden: automatic risk/opportunity register mutation, owner assignment,
 * treatment execution, Monte Carlo, unsupported percentages, CPM, EV,
 * financial posting, schedule/cost/change execution, contract instructions.
 */

import type { ProjectProfileContributorKey } from "./progress";
import type { ProjectScopeRef } from "./progress";

// ---------------------------------------------------------------------------
// Control context
// ---------------------------------------------------------------------------

export type RiskOpportunityControlContext = {
  scope: ProjectScopeRef;
  /** Risk/opportunity intelligence thread identifier. */
  riskOpportunityUnitId: string;
  riskOpportunityUnitLabel?: string;
};

// ---------------------------------------------------------------------------
// Contributor references (evidence provenance)
// ---------------------------------------------------------------------------

export const RISK_OPPORTUNITY_CONTRIBUTOR_KEYS = [
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
  "forecast",
  "decision_support",
  "scenario_intelligence",
] as const;

export type RiskOpportunityContributorKey = (typeof RISK_OPPORTUNITY_CONTRIBUTOR_KEYS)[number];

export type RiskOpportunityContributorRef = {
  contributorKey: RiskOpportunityContributorKey | "forecast" | "decision_support" | "scenario_intelligence";
  stateId: string;
  status: string;
  abstained: boolean;
  postureOrIndication?: string;
  assessedAt?: string;
};

// ---------------------------------------------------------------------------
// Deterministic taxonomies (qualitative signals only)
// ---------------------------------------------------------------------------

export const RISK_SIGNALS = [
  "emerging",
  "increasing",
  "persistent",
  "interacting",
  "unresolved",
  "evidence_gap",
  "unknown",
] as const;

export type RiskSignal = (typeof RISK_SIGNALS)[number];

export const OPPORTUNITY_SIGNALS = [
  "recovery",
  "mitigation",
  "coordination",
  "sequencing",
  "productivity",
  "cost_avoidance",
  "schedule_protection",
  "unknown",
] as const;

export type OpportunitySignal = (typeof OPPORTUNITY_SIGNALS)[number];

export const MATERIALITY_POSTURES = [
  "attention_warranted",
  "monitoring",
  "informational",
  "unknown",
] as const;

export type MaterialityPosture = (typeof MATERIALITY_POSTURES)[number];

// ---------------------------------------------------------------------------
// Intelligence signals (not register items)
// ---------------------------------------------------------------------------

export type RiskIntelligenceSignal = {
  signalId: string;
  riskSignal: RiskSignal;
  narrative: string;
  assumptions: string[];
  dependencies: string[];
  uncertainties: string[];
  evidenceGapNotes: string[];
  supportingEvidenceIds: string[];
  affectedContributors: RiskOpportunityContributorKey[];
  materialityPosture: MaterialityPosture;
  escalationIndicator: boolean;
  /** Must remain false — signal is not a governed register item. */
  registerItemClaimed: false;
  ownerAssigned: false;
  treatmentExecuted: false;
};

export type OpportunityIntelligenceSignal = {
  signalId: string;
  opportunitySignal: OpportunitySignal;
  narrative: string;
  assumptions: string[];
  dependencies: string[];
  uncertainties: string[];
  evidenceGapNotes: string[];
  supportingEvidenceIds: string[];
  affectedContributors: RiskOpportunityContributorKey[];
  materialityPosture: MaterialityPosture;
  /** Must remain false — signal is not a governed register item. */
  registerItemClaimed: false;
  ownerAssigned: false;
  treatmentExecuted: false;
};

export type CrossContributorConflict = {
  conflictId: string;
  contributorKeys: RiskOpportunityContributorKey[];
  description: string;
  unresolved: boolean;
};

export type RiskOpportunitySynthesis = {
  synthesisId: string;
  riskSignals: RiskIntelligenceSignal[];
  opportunitySignals: OpportunityIntelligenceSignal[];
  crossContributorConflicts: CrossContributorConflict[];
  escalationIndicators: string[];
  synthesisNotes: string[];
  /** Must remain false — no register mutation performed. */
  riskRegisterMutated: false;
  opportunityRegisterMutated: false;
  ownerAssignmentPerformed: false;
  treatmentExecutionPerformed: false;
};

export type RiskOpportunityConfidenceSummary = {
  dataSufficiency: RiskOpportunityEvidenceSufficiency;
  confidenceClass: RiskOpportunityConfidenceClass;
  abstention: boolean;
  abstentionReason?: string;
};

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const RISK_OPPORTUNITY_EVIDENCE_KINDS = [
  "composed_context_ref",
  "forecast_assessment_ref",
  "decision_assessment_ref",
  "scenario_assessment_ref",
  "progress_assessment_ref",
  "schedule_assessment_ref",
  "change_assessment_ref",
  "cost_assessment_ref",
  "productivity_assessment_ref",
  "project_profile_ref",
  "manual_observation",
] as const;

export type RiskOpportunityEvidenceKind = (typeof RISK_OPPORTUNITY_EVIDENCE_KINDS)[number];

export const RISK_OPPORTUNITY_EVIDENCE_SOURCE_TYPES = [
  "project_context_composition",
  "forecast_intelligence",
  "decision_support",
  "scenario_intelligence",
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
  "project_context_engine",
  "approved_document",
] as const;

export type RiskOpportunityEvidenceSourceType =
  (typeof RISK_OPPORTUNITY_EVIDENCE_SOURCE_TYPES)[number];

export const RISK_OPPORTUNITY_EVIDENCE_PROVENANCE = [
  "primary_source",
  "system_reference",
  "human_attestation",
  "derived_reference",
  "unknown",
] as const;

export type RiskOpportunityEvidenceProvenance =
  (typeof RISK_OPPORTUNITY_EVIDENCE_PROVENANCE)[number];

export const RISK_OPPORTUNITY_EVIDENCE_REVIEW_STATUSES = [
  "unreviewed",
  "pending_review",
  "reviewed",
  "approved",
  "published",
  "revoked",
] as const;

export type RiskOpportunityEvidenceReviewStatus =
  (typeof RISK_OPPORTUNITY_EVIDENCE_REVIEW_STATUSES)[number];

export type RiskOpportunityEvidence = {
  evidenceId: string;
  kind: RiskOpportunityEvidenceKind;
  sourceType: RiskOpportunityEvidenceSourceType;
  sourceRef: string;
  sourceKey: string;
  provenance: RiskOpportunityEvidenceProvenance;
  reviewStatus: RiskOpportunityEvidenceReviewStatus;
  observedAt?: string;
  sourceVersion?: string;
  declaredSignal?: string;
  narrative?: string;
  revoked?: boolean;
  conflictsWith?: string[];
  contributorKey?: RiskOpportunityContributorKey | "forecast" | "decision_support" | "scenario_intelligence";
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
  riskRegisterMutationClaimed: false;
  opportunityRegisterMutationClaimed: false;
  ownerAssignmentClaimed: false;
  treatmentExecutionClaimed: false;
  mutatesCoreRisk: false;
};

// ---------------------------------------------------------------------------
// Confidence (qualitative posture only)
// ---------------------------------------------------------------------------

export const RISK_OPPORTUNITY_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "stale",
] as const;

export type RiskOpportunityEvidenceSufficiency =
  (typeof RISK_OPPORTUNITY_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type RiskOpportunityConfidenceClass = "high" | "medium" | "low" | "unavailable";

export type RiskOpportunityConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  confidenceClass: RiskOpportunityConfidenceClass;
  dataSufficiency: RiskOpportunityEvidenceSufficiency;
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
  method: "risk_opportunity_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  autoExecutionClaimed: false;
  approvalAuthorityClaimed: false;
  riskRegisterMutationClaimed: false;
  opportunityRegisterMutationClaimed: false;
  ownerAssignmentClaimed: false;
  treatmentExecutionClaimed: false;
  monteCarloClaimed: false;
  numericalPrecisionClaimed: false;
};

// ---------------------------------------------------------------------------
// Assessment state
// ---------------------------------------------------------------------------

export const RISK_OPPORTUNITY_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
  "superseded",
] as const;

export type RiskOpportunityAssessmentStatus =
  (typeof RISK_OPPORTUNITY_ASSESSMENT_STATUSES)[number];

/**
 * Advisory risk/opportunity intelligence assessment — intelligence signals only.
 * When `abstained` is true no signals are published.
 */
export type RiskOpportunityAssessmentState = {
  id: string;
  stateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: RiskOpportunityControlContext;
  version: number;
  status: RiskOpportunityAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  synthesis: RiskOpportunitySynthesis;
  riskSignals: RiskIntelligenceSignal[];
  opportunitySignals: OpportunityIntelligenceSignal[];
  contributingContributors: RiskOpportunityContributorRef[];
  evidenceRefs: string[];
  confidence: RiskOpportunityConfidence;
  assumptions: string[];
  limitations: string[];
  reasons: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "risk_opportunity_intelligence_advisory_v1";
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
  scenarioContextId?: string;
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
  riskRegisterMutated: false;
  opportunityRegisterMutated: false;
  ownerAssignmentPerformed: false;
  treatmentExecutionPerformed: false;
  duplicateRiskOwnershipDetected: false;
  monteCarloPerformed: false;
  numericalPrecisionClaimed: false;
};

export type RiskOpportunityReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

export type RiskOpportunityReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  riskOpportunityStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: RiskOpportunityReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
  approvalAuthorityClaimed: false;
};

/** Rollup contribution the Project Context Engine embeds in ProjectProfile. */
export type RiskOpportunityProfileContribution = {
  assessmentsCompleted: number;
  assessmentsAbstained: number;
  publishedAssessments: number;
  emergingRiskCount: number;
  increasingRiskCount: number;
  persistentRiskCount: number;
  interactingRiskCount: number;
  unresolvedRiskCount: number;
  evidenceGapRiskCount: number;
  unknownRiskCount: number;
  recoveryOpportunityCount: number;
  mitigationOpportunityCount: number;
  coordinationOpportunityCount: number;
  sequencingOpportunityCount: number;
  productivityOpportunityCount: number;
  costAvoidanceOpportunityCount: number;
  scheduleProtectionOpportunityCount: number;
  unknownOpportunityCount: number;
  riskSignalCount: number;
  opportunitySignalCount: number;
  crossContributorConflictCount: number;
  escalationIndicatorCount: number;
  contributorCoverageCount: number;
  lowestConfidenceClass: RiskOpportunityConfidenceClass;
  dominantSufficiency: RiskOpportunityEvidenceSufficiency;
  latestAssessmentAt?: string;
  autoExecutionClaimed: false;
  approvalAuthorityClaimed: false;
  riskRegisterMutated: false;
  opportunityRegisterMutated: false;
  ownerAssignmentPerformed: false;
  treatmentExecutionPerformed: false;
  duplicateRiskOwnershipDetected: false;
};

// ---------------------------------------------------------------------------
// Timeline extensions
// ---------------------------------------------------------------------------

export const RISK_OPPORTUNITY_TIMELINE_KINDS = [
  "risk_opportunity_updated",
  "risk_opportunity_abstained",
  "risk_opportunity_reviewed",
  "risk_opportunity_published",
  "risk_opportunity_rejected",
  "risk_opportunity_superseded",
] as const;

export type RiskOpportunityTimelineKind = (typeof RISK_OPPORTUNITY_TIMELINE_KINDS)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isAbstainingRiskOpportunitySufficiency(
  sufficiency: RiskOpportunityEvidenceSufficiency,
): boolean {
  return (
    sufficiency === "insufficient" ||
    sufficiency === "conflicting" ||
    sufficiency === "stale"
  );
}

export function assertAllowedRiskSignal(value: string): RiskSignal {
  if (!(RISK_SIGNALS as readonly string[]).includes(value)) {
    throw new Error(`unknown_risk_signal:${value}`);
  }
  return value as RiskSignal;
}

export function assertAllowedOpportunitySignal(value: string): OpportunitySignal {
  if (!(OPPORTUNITY_SIGNALS as readonly string[]).includes(value)) {
    throw new Error(`unknown_opportunity_signal:${value}`);
  }
  return value as OpportunitySignal;
}

export function riskOpportunityStateKey(
  scope: ProjectScopeRef,
  riskOpportunityUnitId: string,
): string {
  const scopePart =
    scope.kind === "project"
      ? `project:${scope.projectId}`
      : `${scope.kind}:${scope.referenceId ?? "unknown"}`;
  return `${scopePart}#${riskOpportunityUnitId}`;
}

export function isActiveRiskOpportunityContributorKey(
  key: ProjectProfileContributorKey,
): key is RiskOpportunityContributorKey | "forecast" | "decision_support" | "scenario_intelligence" {
  return (RISK_OPPORTUNITY_CONTRIBUTOR_KEYS as readonly string[]).includes(key);
}
