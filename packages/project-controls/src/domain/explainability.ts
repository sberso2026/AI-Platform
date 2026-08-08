/**
 * Phase 11L — Explainability & Traceability Intelligence domain types.
 *
 * Public explanation summaries with evidence/provenance/dependency traces.
 * Explanation ≠ chain-of-thought ≠ hidden inference. Traceability ≠ approval ≠ verification.
 *
 * Forbidden: CoT exposure, fabricated provenance, automatic explanation approval,
 * automatic evidence creation, upstream contributor mutation, execution authority.
 */

import type { ProjectProfileContributorKey, ProjectScopeRef } from "./progress";

export type ExplainabilityControlContext = {
  scope: ProjectScopeRef;
  explainabilityUnitId: string;
  explainabilityUnitLabel?: string;
};

export const EXPLAINABILITY_CONTRIBUTOR_KEYS = [
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
  "forecast",
  "decision_support",
  "scenario_intelligence",
  "risk_opportunity_intelligence",
  "assurance_intelligence",
] as const;

export type ExplainabilityContributorKey = (typeof EXPLAINABILITY_CONTRIBUTOR_KEYS)[number];

export type ExplainabilityContributorRef = {
  contributorKey: ExplainabilityContributorKey;
  stateId: string;
  status: string;
  abstained: boolean;
  indication?: string;
  assessedAt?: string;
  published: boolean;
};

export const EXPLANATION_STATUSES = [
  "supported",
  "partially_supported",
  "unsupported",
  "conflicting",
  "incomplete",
  "unknown",
] as const;

export type ExplanationStatus = (typeof EXPLANATION_STATUSES)[number];

export const EXPLANATION_REASONS = [
  "evidence_based",
  "derived",
  "assumed",
  "insufficient_evidence",
  "unknown",
] as const;

export type ExplanationReason = (typeof EXPLANATION_REASONS)[number];

export type ExplainabilityEvidenceRef = {
  evidenceRefId: string;
  kind: string;
  sourceType: string;
  sourceRef: string;
  sourceKey: string;
  provenance: "primary_source" | "system_reference" | "human_attestation" | "derived_reference" | "unknown";
  observedAt?: string;
  reviewStatus?: string;
  contributorKey?: ExplainabilityContributorKey;
  chainOfThoughtExposed: false;
  hiddenReasoningExposed: false;
  fabricatedProvenance: false;
};

export type ExplainabilityDependencyTrace = {
  traceId: string;
  fromContributorKey: ExplainabilityContributorKey;
  toContributorKey?: ExplainabilityContributorKey;
  dependencyKind: "consumes" | "references" | "derives_from";
  stateId?: string;
  unresolved: boolean;
};

export type ExplainabilityProvenanceTrace = {
  traceId: string;
  sourceRef: string;
  sourceType: string;
  provenance: ExplainabilityEvidenceRef["provenance"];
  complete: boolean;
  missingFields: string[];
};

export type ExplainabilityTimelineTrace = {
  traceId: string;
  eventType: string;
  stateId: string;
  recordedAt: string;
  sourceKey: string;
};

export type ExplainabilityAssumptionRef = {
  assumptionRefId: string;
  assumption: string;
  reason: ExplanationReason;
  disclosed: true;
};

export type ExplainabilityConfidenceSourceRef = {
  sourceRefId: string;
  contributorKey: ExplainabilityContributorKey;
  confidenceClass: string;
  dataSufficiency?: string;
};

export type ExplainabilityGovernanceRef = {
  governanceRefId: string;
  kind: "review_workflow" | "human_approval" | "publication_gate" | "advisory_only";
  workflowSlug?: string;
  workflowState?: string;
  approvalAuthorityClaimed: false;
  verificationClaimed: false;
};

export type ExplainabilityContributorExplanation = {
  explanationId: string;
  contributorKey: ExplainabilityContributorKey;
  explanationStatus: ExplanationStatus;
  reason: ExplanationReason;
  reasonSummary: string;
  evidenceRefIds: string[];
  missingEvidenceNotes: string[];
  conflictNotes: string[];
  unknownNotes: string[];
  chainOfThoughtExposed: false;
  hiddenReasoningExposed: false;
  fabricatedProvenance: false;
  approvalClaimed: false;
  verificationClaimed: false;
};

export type ExplainabilitySynthesis = {
  synthesisId: string;
  integratedExplanationStatus: ExplanationStatus;
  integratedReason: ExplanationReason;
  reasonSummary: string;
  contributorExplanations: ExplainabilityContributorExplanation[];
  crossContributorConflictNotes: string[];
  missingEvidenceNotes: string[];
  unknownNotes: string[];
  dependencyTraces: ExplainabilityDependencyTrace[];
  provenanceTraces: ExplainabilityProvenanceTrace[];
  timelineTraces: ExplainabilityTimelineTrace[];
  assumptionRefs: ExplainabilityAssumptionRef[];
  confidenceSourceRefs: ExplainabilityConfidenceSourceRef[];
  governanceRefs: ExplainabilityGovernanceRef[];
  chainOfThoughtExposed: false;
  hiddenReasoningExposed: false;
  fabricatedProvenance: false;
  approvalClaimed: false;
  verificationClaimed: false;
  mutatesUpstreamContributors: false;
};

export const EXPLAINABILITY_EVIDENCE_KINDS = [
  "composed_context_ref",
  "assurance_assessment_ref",
  "forecast_assessment_ref",
  "decision_assessment_ref",
  "scenario_assessment_ref",
  "risk_opportunity_assessment_ref",
  "progress_assessment_ref",
  "schedule_assessment_ref",
  "change_assessment_ref",
  "cost_assessment_ref",
  "productivity_assessment_ref",
  "project_profile_ref",
  "timeline_ref",
  "governance_ref",
  "manual_observation",
] as const;

export type ExplainabilityEvidenceKind = (typeof EXPLAINABILITY_EVIDENCE_KINDS)[number];

export type ExplainabilityEvidence = {
  evidenceId: string;
  kind: ExplainabilityEvidenceKind;
  sourceType: string;
  sourceRef: string;
  sourceKey: string;
  provenance: ExplainabilityEvidenceRef["provenance"];
  reviewStatus: string;
  observedAt?: string;
  declaredSignal?: string;
  narrative?: string;
  revoked?: boolean;
  contributorKey?: ExplainabilityContributorKey;
  chainOfThoughtExposed: false;
  hiddenReasoningExposed: false;
  fabricatedProvenance: false;
  autoExecutionClaimed: false;
  approvalAuthorityClaimed: false;
  verificationClaimed: false;
  automaticEvidenceCreationClaimed: false;
  earnedValueDerived: false;
  cpmDerived: false;
  financialPostingClaimed: false;
  registerMutationClaimed: false;
  mutatesUpstreamContributors: false;
};

export const EXPLAINABILITY_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "incomplete",
] as const;

export type ExplainabilityEvidenceSufficiency =
  (typeof EXPLAINABILITY_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type ExplainabilityConfidenceClass = "high" | "medium" | "low" | "unavailable";

export type ExplainabilityConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  confidenceClass: ExplainabilityConfidenceClass;
  dataSufficiency: ExplainabilityEvidenceSufficiency;
  evidenceCount: number;
  usableEvidenceCount: number;
  contributorCoverage: number;
  provenanceCompleteness: number;
  traceCompleteness: number;
  conflictState: "none" | "detected";
  abstention: boolean;
  abstentionReason?: string;
  reasons: string[];
  method: "explainability_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  chainOfThoughtExposed: false;
  hiddenReasoningExposed: false;
  fabricatedProvenance: false;
  automaticEvidenceCreationClaimed: false;
  approvalAuthorityClaimed: false;
  verificationClaimed: false;
  mutatesUpstreamContributors: false;
};

export const EXPLAINABILITY_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
  "superseded",
] as const;

export type ExplainabilityAssessmentStatus = (typeof EXPLAINABILITY_ASSESSMENT_STATUSES)[number];

export type ExplainabilitySnapshot = {
  snapshotId: string;
  integratedExplanationStatus: ExplanationStatus;
  integratedReason: ExplanationReason;
  reasonSummary: string;
  contributorCount: number;
  evidenceRefCount: number;
  traceCount: number;
  abstained: boolean;
  chainOfThoughtExposed: false;
  hiddenReasoningExposed: false;
};

export type ExplainabilityAssessmentState = {
  id: string;
  stateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ExplainabilityControlContext;
  version: number;
  status: ExplainabilityAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  explanationStatus: ExplanationStatus;
  synthesis: ExplainabilitySynthesis;
  snapshot: ExplainabilitySnapshot;
  contributorExplanations: ExplainabilityContributorExplanation[];
  contributingContributors: ExplainabilityContributorRef[];
  evidenceRefs: ExplainabilityEvidenceRef[];
  dependencyTraces: ExplainabilityDependencyTrace[];
  provenanceTraces: ExplainabilityProvenanceTrace[];
  timelineTraces: ExplainabilityTimelineTrace[];
  assumptionRefs: ExplainabilityAssumptionRef[];
  confidenceSourceRefs: ExplainabilityConfidenceSourceRef[];
  governanceRefs: ExplainabilityGovernanceRef[];
  confidence: ExplainabilityConfidence;
  assumptions: string[];
  limitations: string[];
  reasons: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "explainability_intelligence_advisory_v1";
  methodVersion: "1";
  assessedAt: string;
  recordedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  composedContextId?: string;
  assuranceContextId?: string;
  forecastContextId?: string;
  decisionContextId?: string;
  scenarioContextId?: string;
  riskOpportunityContextId?: string;
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  autoExecutionEnabled: false;
  scheduleExecutionPerformed: false;
  costExecutionPerformed: false;
  contractInstructionPerformed: false;
  approvalAuthorityClaimed: false;
  verificationClaimed: false;
  automaticEvidenceCreationClaimed: false;
  automaticExplanationApprovalClaimed: false;
  resourcePlanningPerformed: false;
  budgetLedgerMutated: false;
  financialPostingPerformed: false;
  predictiveSchedulingPerformed: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  mutatesUpstreamContributors: false;
  autonomousPublication: false;
  duplicateExplainabilityOwnershipDetected: false;
  chainOfThoughtExposed: false;
  hiddenReasoningExposed: false;
  fabricatedProvenance: false;
};

export type ExplainabilityReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

export type ExplainabilityReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  explainabilityStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: ExplainabilityReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
  approvalAuthorityClaimed: false;
  verificationClaimed: false;
  chainOfThoughtExposed: false;
};

export type ExplainabilityProfileContribution = {
  assessmentsCompleted: number;
  assessmentsAbstained: number;
  publishedAssessments: number;
  supportedCount: number;
  partiallySupportedCount: number;
  unsupportedCount: number;
  conflictingCount: number;
  incompleteCount: number;
  unknownCount: number;
  evidenceBasedReasonCount: number;
  derivedReasonCount: number;
  assumedReasonCount: number;
  insufficientEvidenceReasonCount: number;
  unknownReasonCount: number;
  contributorCoverageCount: number;
  crossContributorConflictCount: number;
  lowestConfidenceClass: ExplainabilityConfidenceClass;
  dominantSufficiency: ExplainabilityEvidenceSufficiency;
  latestAssessmentAt?: string;
};

export function explainabilityStateKey(
  scope: ProjectScopeRef,
  explainabilityUnitId: string,
): string {
  const ref = scope.referenceId ?? scope.projectId;
  return `${scope.kind}:${ref}:${explainabilityUnitId}`;
}

export function isAbstainingExplainabilitySufficiency(
  sufficiency: ExplainabilityEvidenceSufficiency,
): boolean {
  return (
    sufficiency === "insufficient" ||
    sufficiency === "conflicting" ||
    sufficiency === "incomplete"
  );
}

export function explanationStatusFromSufficiency(
  sufficiency: ExplainabilityEvidenceSufficiency,
  conflictDetected: boolean,
): ExplanationStatus {
  if (conflictDetected || sufficiency === "conflicting") return "conflicting";
  if (sufficiency === "insufficient" || sufficiency === "incomplete") return "incomplete";
  if (sufficiency === "limited") return "partially_supported";
  if (sufficiency === "sufficient") return "supported";
  return "unknown";
}

export function reasonFromSufficiency(
  sufficiency: ExplainabilityEvidenceSufficiency,
  hasEvidence: boolean,
): ExplanationReason {
  if (!hasEvidence) return "insufficient_evidence";
  if (sufficiency === "insufficient" || sufficiency === "incomplete") return "insufficient_evidence";
  if (sufficiency === "limited") return "derived";
  if (sufficiency === "sufficient") return "evidence_based";
  return "unknown";
}

export function assertNoChainOfThoughtExposure(): {
  ok: true;
  chainOfThoughtExposed: false;
  hiddenReasoningExposed: false;
} {
  return { ok: true, chainOfThoughtExposed: false, hiddenReasoningExposed: false };
}

export function assertExplainabilityAdvisoryOnly(): { ok: true; advisoryOnly: true } {
  return { ok: true, advisoryOnly: true };
}

export type ProjectProfileExplainabilityKey = Extract<
  ProjectProfileContributorKey,
  "explainability_intelligence"
>;
