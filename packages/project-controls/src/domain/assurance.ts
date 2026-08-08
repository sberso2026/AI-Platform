/**
 * Phase 11K — Assurance Intelligence domain types.
 *
 * Assurance Intelligence assesses reliability of Project Controls intelligence
 * via evidence/provenance coverage, freshness, completeness, and conflict
 * detection. Advisory only — assurance ≠ verification ≠ certification ≠ approval.
 *
 * Forbidden: automatic evidence approval, certification claims, register mutation,
 * unsupported numerical confidence %, upstream contributor mutation.
 */

import type { ProjectProfileContributorKey, ProjectScopeRef } from "./progress";

// ---------------------------------------------------------------------------
// Control context
// ---------------------------------------------------------------------------

export type AssuranceControlContext = {
  scope: ProjectScopeRef;
  assuranceUnitId: string;
  assuranceUnitLabel?: string;
};

// ---------------------------------------------------------------------------
// Contributor references
// ---------------------------------------------------------------------------

export const ASSURANCE_CONTRIBUTOR_KEYS = [
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
  "forecast",
  "decision_support",
  "scenario_intelligence",
  "risk_opportunity_intelligence",
] as const;

export type AssuranceContributorKey = (typeof ASSURANCE_CONTRIBUTOR_KEYS)[number];

export type AssuranceContributorRef = {
  contributorKey: AssuranceContributorKey;
  stateId: string;
  status: string;
  abstained: boolean;
  postureOrIndication?: string;
  assessedAt?: string;
  published: boolean;
};

// ---------------------------------------------------------------------------
// Deterministic taxonomies
// ---------------------------------------------------------------------------

export const ASSURANCE_POSTURES = [
  "strong",
  "adequate",
  "constrained",
  "weak",
  "insufficient",
  "conflicting",
  "unknown",
] as const;

export type AssurancePosture = (typeof ASSURANCE_POSTURES)[number];

export const ASSURANCE_FINDING_KINDS = [
  "complete",
  "incomplete",
  "stale",
  "conflicting",
  "missing_source",
  "missing_provenance",
  "unsupported",
  "dependency_gap",
  "unavailable",
  "unknown",
] as const;

export type AssuranceFindingKind = (typeof ASSURANCE_FINDING_KINDS)[number];

export type AssuranceContributorFinding = {
  findingId: string;
  contributorKey: AssuranceContributorKey;
  findingKind: AssuranceFindingKind;
  narrative: string;
  evidenceIds: string[];
  unresolved: boolean;
  certificationClaimed: false;
  verificationClaimed: false;
  approvalClaimed: false;
};

export type AssuranceCrossContributorConflict = {
  conflictId: string;
  contributorKeys: AssuranceContributorKey[];
  description: string;
  unresolved: boolean;
};

export type AssuranceSynthesis = {
  synthesisId: string;
  integratedPosture: AssurancePosture;
  contributorFindings: AssuranceContributorFinding[];
  crossContributorConflicts: AssuranceCrossContributorConflict[];
  evidenceGapNotes: string[];
  staleSourceNotes: string[];
  unsupportedClaimNotes: string[];
  synthesisNotes: string[];
  certificationClaimed: false;
  verificationClaimed: false;
  approvalClaimed: false;
  evidenceApproved: false;
  mutatesUpstreamContributors: false;
};

export type AssuranceConfidenceSummary = {
  dataSufficiency: AssuranceEvidenceSufficiency;
  confidenceClass: AssuranceConfidenceClass;
  abstention: boolean;
  abstentionReason?: string;
};

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const ASSURANCE_EVIDENCE_KINDS = [
  "composed_context_ref",
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
  "manual_observation",
] as const;

export type AssuranceEvidenceKind = (typeof ASSURANCE_EVIDENCE_KINDS)[number];

export const ASSURANCE_EVIDENCE_SOURCE_TYPES = [
  "project_context_composition",
  "forecast_intelligence",
  "decision_support",
  "scenario_intelligence",
  "risk_opportunity_intelligence",
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "cost_intelligence",
  "productivity_intelligence",
  "project_context_engine",
  "approved_document",
] as const;

export type AssuranceEvidenceSourceType = (typeof ASSURANCE_EVIDENCE_SOURCE_TYPES)[number];

export const ASSURANCE_EVIDENCE_PROVENANCE = [
  "primary_source",
  "system_reference",
  "human_attestation",
  "derived_reference",
  "unknown",
] as const;

export type AssuranceEvidenceProvenance = (typeof ASSURANCE_EVIDENCE_PROVENANCE)[number];

export const ASSURANCE_EVIDENCE_REVIEW_STATUSES = [
  "unreviewed",
  "pending_review",
  "reviewed",
  "approved",
  "published",
  "revoked",
] as const;

export type AssuranceEvidenceReviewStatus = (typeof ASSURANCE_EVIDENCE_REVIEW_STATUSES)[number];

export type AssuranceEvidence = {
  evidenceId: string;
  kind: AssuranceEvidenceKind;
  sourceType: AssuranceEvidenceSourceType;
  sourceRef: string;
  sourceKey: string;
  provenance: AssuranceEvidenceProvenance;
  reviewStatus: AssuranceEvidenceReviewStatus;
  observedAt?: string;
  sourceVersion?: string;
  declaredSignal?: string;
  narrative?: string;
  revoked?: boolean;
  conflictsWith?: string[];
  contributorKey?: AssuranceContributorKey;
  autoExecutionClaimed: false;
  scheduleExecutionClaimed: false;
  costExecutionClaimed: false;
  contractInstructionClaimed: false;
  approvalAuthorityClaimed: false;
  certificationClaimed: false;
  verificationClaimed: false;
  evidenceApprovalClaimed: false;
  earnedValueDerived: false;
  cpmDerived: false;
  financialPostingClaimed: false;
  numericalPrecisionClaimed: false;
  registerMutationClaimed: false;
  mutatesCoreRisk: false;
  mutatesUpstreamContributors: false;
};

// ---------------------------------------------------------------------------
// Confidence (qualitative posture only)
// ---------------------------------------------------------------------------

export const ASSURANCE_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "stale",
] as const;

export type AssuranceEvidenceSufficiency = (typeof ASSURANCE_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type AssuranceConfidenceClass = "high" | "medium" | "low" | "unavailable";

export type AssuranceConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  confidenceClass: AssuranceConfidenceClass;
  dataSufficiency: AssuranceEvidenceSufficiency;
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
  method: "assurance_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  autoExecutionClaimed: false;
  approvalAuthorityClaimed: false;
  certificationClaimed: false;
  verificationClaimed: false;
  evidenceApprovalClaimed: false;
  numericalPrecisionClaimed: false;
  mutatesUpstreamContributors: false;
};

// ---------------------------------------------------------------------------
// Assessment state
// ---------------------------------------------------------------------------

export const ASSURANCE_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
  "superseded",
] as const;

export type AssuranceAssessmentStatus = (typeof ASSURANCE_ASSESSMENT_STATUSES)[number];

export type AssuranceAssessmentState = {
  id: string;
  stateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: AssuranceControlContext;
  version: number;
  status: AssuranceAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  assurancePosture: AssurancePosture;
  synthesis: AssuranceSynthesis;
  contributorFindings: AssuranceContributorFinding[];
  contributingContributors: AssuranceContributorRef[];
  evidenceRefs: string[];
  confidence: AssuranceConfidence;
  assumptions: string[];
  limitations: string[];
  reasons: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "assurance_intelligence_advisory_v1";
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
  riskOpportunityContextId?: string;
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  autoExecutionEnabled: false;
  scheduleExecutionPerformed: false;
  costExecutionPerformed: false;
  contractInstructionPerformed: false;
  approvalAuthorityClaimed: false;
  certificationClaimed: false;
  verificationClaimed: false;
  evidenceApprovalClaimed: false;
  resourcePlanningPerformed: false;
  budgetLedgerMutated: false;
  financialPostingPerformed: false;
  predictiveSchedulingPerformed: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  mutatesUpstreamContributors: false;
  autonomousPublication: false;
  duplicateAssuranceOwnershipDetected: false;
  numericalPrecisionClaimed: false;
};

export type AssuranceReviewOutcome = "approved" | "rejected" | "changes_requested" | "resubmitted";

export type AssuranceReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assuranceStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: AssuranceReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
  approvalAuthorityClaimed: false;
  certificationClaimed: false;
  verificationClaimed: false;
};

export type AssuranceProfileContribution = {
  assessmentsCompleted: number;
  assessmentsAbstained: number;
  publishedAssessments: number;
  strongPostureCount: number;
  adequatePostureCount: number;
  constrainedPostureCount: number;
  weakPostureCount: number;
  insufficientPostureCount: number;
  conflictingPostureCount: number;
  unknownPostureCount: number;
  completeFindingCount: number;
  incompleteFindingCount: number;
  staleFindingCount: number;
  conflictingFindingCount: number;
  missingSourceFindingCount: number;
  missingProvenanceFindingCount: number;
  unsupportedFindingCount: number;
  dependencyGapFindingCount: number;
  unavailableFindingCount: number;
  unknownFindingCount: number;
  contributorCoverageCount: number;
  crossContributorConflictCount: number;
  lowestConfidenceClass: AssuranceConfidenceClass;
  dominantSufficiency: AssuranceEvidenceSufficiency;
  latestAssessmentAt?: string;
};

export function assuranceStateKey(scope: ProjectScopeRef, assuranceUnitId: string): string {
  const ref = scope.referenceId ?? scope.projectId;
  return `${scope.kind}:${ref}:${assuranceUnitId}`;
}

export function isAbstainingAssuranceSufficiency(
  sufficiency: AssuranceEvidenceSufficiency,
): boolean {
  return sufficiency === "insufficient" || sufficiency === "conflicting" || sufficiency === "stale";
}

export function postureFromSufficiency(
  sufficiency: AssuranceEvidenceSufficiency,
  conflictDetected: boolean,
): AssurancePosture {
  if (conflictDetected || sufficiency === "conflicting") return "conflicting";
  if (sufficiency === "insufficient") return "insufficient";
  if (sufficiency === "stale") return "weak";
  if (sufficiency === "limited") return "constrained";
  if (sufficiency === "sufficient") return "adequate";
  return "unknown";
}

export function assertNoCertificationClaims(): {
  ok: true;
  certificationClaimed: false;
  verificationClaimed: false;
  evidenceApprovalClaimed: false;
} {
  return {
    ok: true,
    certificationClaimed: false,
    verificationClaimed: false,
    evidenceApprovalClaimed: false,
  };
}

export function assertAssuranceAdvisoryOnly(): { ok: true; advisoryOnly: true } {
  return { ok: true, advisoryOnly: true };
}

export function assertNoAssuranceNumericalPrecision(): {
  ok: true;
  numericalPrecisionClaimed: false;
} {
  return { ok: true, numericalPrecisionClaimed: false };
}

export type ProjectProfileAssuranceKey = Extract<
  ProjectProfileContributorKey,
  "assurance_intelligence"
>;
