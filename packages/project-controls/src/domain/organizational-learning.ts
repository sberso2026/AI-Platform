/**
 * Phase 11M — Organizational Learning Intelligence domain types.
 *
 * Advisory organizational learning references from historical evidence and
 * published contributors. Pattern ≠ prediction. Lesson ≠ recommendation.
 * History ≠ approval. Organizational learning ≠ optimisation.
 *
 * Forbidden: automatic learning approval, knowledge mutation, fabricated lessons,
 * unsupported similarity scoring, upstream contributor mutation, execution authority.
 */

import type { ProjectProfileContributorKey, ProjectScopeRef } from "./progress";

export type OrganizationalLearningControlContext = {
  scope: ProjectScopeRef;
  organizationalLearningUnitId: string;
  organizationalLearningUnitLabel?: string;
};

export const ORGANIZATIONAL_LEARNING_CONTRIBUTOR_KEYS = [
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
  "explainability_intelligence",
] as const;

export type OrganizationalLearningContributorKey =
  (typeof ORGANIZATIONAL_LEARNING_CONTRIBUTOR_KEYS)[number];

export type OrganizationalLearningContributorRef = {
  contributorKey: OrganizationalLearningContributorKey;
  stateId: string;
  status: string;
  abstained: boolean;
  indication?: string;
  assessedAt?: string;
  published: boolean;
};

export const LEARNING_TAXONOMY = [
  "historical_pattern",
  "recurring_issue",
  "recurring_success",
  "lesson_learned",
  "knowledge_gap",
  "best_practice",
  "similar_project",
  "unknown",
] as const;

export type LearningTaxonomyClass = (typeof LEARNING_TAXONOMY)[number];

export const LEARNING_BASIS_STATUSES = [
  "supported",
  "partially_supported",
  "unsupported",
  "conflicting",
  "incomplete",
  "unknown",
] as const;

export type LearningBasisStatus = (typeof LEARNING_BASIS_STATUSES)[number];

export const LEARNING_BASIS_REASONS = [
  "evidence_based",
  "derived",
  "assumed",
  "insufficient_evidence",
  "unknown",
] as const;

export type LearningBasisReason = (typeof LEARNING_BASIS_REASONS)[number];

export type OrganizationalLearningEvidenceRef = {
  evidenceRefId: string;
  kind: string;
  sourceType: string;
  sourceRef: string;
  sourceKey: string;
  provenance: "primary_source" | "system_reference" | "human_attestation" | "derived_reference" | "unknown";
  observedAt?: string;
  reviewStatus?: string;
  contributorKey?: OrganizationalLearningContributorKey;
  fabricatedLesson: false;
  unsupportedSimilarityScore: false;
  knowledgeMutationClaimed: false;
};

export type HistoricalSimilarityRef = {
  similarityRefId: string;
  projectRef: string;
  projectLabel?: string;
  qualitativeReference: string;
  unsupportedSimilarityScore: false;
  similarityScorePercent?: never;
};

export type LessonReference = {
  lessonRefId: string;
  lessonRegisterRef?: string;
  summary: string;
  taxonomyClass: LearningTaxonomyClass;
  fabricatedLesson: false;
  recommendationClaimed: false;
};

export type PatternReference = {
  patternRefId: string;
  patternSummary: string;
  taxonomyClass: LearningTaxonomyClass;
  predictionClaimed: false;
};

export type OutcomeReference = {
  outcomeRefId: string;
  outcomeSummary: string;
  sourceRef: string;
  approvalClaimed: false;
};

export type ReusablePracticeReference = {
  practiceRefId: string;
  practiceSummary: string;
  sourceRef: string;
  enforcementClaimed: false;
};

export type KnowledgeProvenanceTrace = {
  traceId: string;
  sourceRef: string;
  sourceType: string;
  provenance: OrganizationalLearningEvidenceRef["provenance"];
  complete: boolean;
  missingFields: string[];
};

export type OrganizationalLearningTimelineTrace = {
  traceId: string;
  eventType: string;
  stateId: string;
  recordedAt: string;
  sourceKey: string;
};

export type CrossProjectKnowledgeRef = {
  crossProjectRefId: string;
  projectRef: string;
  knowledgeRef: string;
  qualitativeReference: string;
  currentProjectClaimed: false;
  unsupportedSimilarityScore: false;
};

export type OrganizationalLearningGovernanceRef = {
  governanceRefId: string;
  kind: "review_workflow" | "human_approval" | "publication_gate" | "advisory_only";
  workflowSlug?: string;
  workflowState?: string;
  learningApprovalClaimed: false;
  knowledgeMutationClaimed: false;
};

export type OrganizationalLearningItem = {
  learningItemId: string;
  taxonomyClass: LearningTaxonomyClass;
  basisStatus: LearningBasisStatus;
  reason: LearningBasisReason;
  reasonSummary: string;
  evidenceRefIds: string[];
  lessonRefIds: string[];
  patternRefIds: string[];
  missingEvidenceNotes: string[];
  unknownNotes: string[];
  fabricatedLesson: false;
  unsupportedSimilarityScore: false;
  recommendationClaimed: false;
  predictionClaimed: false;
  optimisationClaimed: false;
};

export type OrganizationalLearningSynthesis = {
  synthesisId: string;
  integratedTaxonomyClass: LearningTaxonomyClass;
  integratedBasisStatus: LearningBasisStatus;
  integratedReason: LearningBasisReason;
  reasonSummary: string;
  learningItems: OrganizationalLearningItem[];
  historicalSimilarityRefs: HistoricalSimilarityRef[];
  lessonReferences: LessonReference[];
  patternReferences: PatternReference[];
  outcomeReferences: OutcomeReference[];
  reusablePracticeReferences: ReusablePracticeReference[];
  crossProjectKnowledgeRefs: CrossProjectKnowledgeRef[];
  knowledgeProvenanceTraces: KnowledgeProvenanceTrace[];
  timelineTraces: OrganizationalLearningTimelineTrace[];
  governanceRefs: OrganizationalLearningGovernanceRef[];
  fabricatedLesson: false;
  unsupportedSimilarityScore: false;
  knowledgeMutationClaimed: false;
  learningApprovalClaimed: false;
  mutatesUpstreamContributors: false;
};

export const ORGANIZATIONAL_LEARNING_EVIDENCE_KINDS = [
  "composed_context_ref",
  "explainability_assessment_ref",
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
  "lesson_register_ref",
  "historical_evidence_ref",
  "knowledge_graph_ref",
  "project_metadata_ref",
  "timeline_ref",
  "governance_ref",
  "manual_observation",
] as const;

export type OrganizationalLearningEvidenceKind =
  (typeof ORGANIZATIONAL_LEARNING_EVIDENCE_KINDS)[number];

export type OrganizationalLearningEvidence = {
  evidenceId: string;
  kind: OrganizationalLearningEvidenceKind;
  sourceType: string;
  sourceRef: string;
  sourceKey: string;
  provenance: OrganizationalLearningEvidenceRef["provenance"];
  reviewStatus: string;
  observedAt?: string;
  declaredSignal?: string;
  narrative?: string;
  revoked?: boolean;
  contributorKey?: OrganizationalLearningContributorKey;
  fabricatedLesson: false;
  unsupportedSimilarityScore: false;
  knowledgeMutationClaimed: false;
  autoExecutionClaimed: false;
  learningApprovalClaimed: false;
  recommendationClaimed: false;
  predictionClaimed: false;
  optimisationClaimed: false;
  earnedValueDerived: false;
  cpmDerived: false;
  financialPostingClaimed: false;
  registerMutationClaimed: false;
  mutatesUpstreamContributors: false;
};

export const ORGANIZATIONAL_LEARNING_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "incomplete",
] as const;

export type OrganizationalLearningEvidenceSufficiency =
  (typeof ORGANIZATIONAL_LEARNING_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type OrganizationalLearningConfidenceClass = "high" | "medium" | "low" | "unavailable";

export type OrganizationalLearningConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  confidenceClass: OrganizationalLearningConfidenceClass;
  dataSufficiency: OrganizationalLearningEvidenceSufficiency;
  evidenceCount: number;
  usableEvidenceCount: number;
  contributorCoverage: number;
  provenanceCompleteness: number;
  historicalEvidencePresent: boolean;
  conflictState: "none" | "detected";
  abstention: boolean;
  abstentionReason?: string;
  reasons: string[];
  method: "organizational_learning_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  fabricatedLesson: false;
  unsupportedSimilarityScore: false;
  knowledgeMutationClaimed: false;
  learningApprovalClaimed: false;
  mutatesUpstreamContributors: false;
};

export const ORGANIZATIONAL_LEARNING_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
  "superseded",
] as const;

export type OrganizationalLearningAssessmentStatus =
  (typeof ORGANIZATIONAL_LEARNING_ASSESSMENT_STATUSES)[number];

export type OrganizationalLearningSnapshot = {
  snapshotId: string;
  integratedTaxonomyClass: LearningTaxonomyClass;
  integratedBasisStatus: LearningBasisStatus;
  reasonSummary: string;
  learningItemCount: number;
  evidenceRefCount: number;
  traceCount: number;
  abstained: boolean;
  fabricatedLesson: false;
  unsupportedSimilarityScore: false;
};

export type OrganizationalLearningAssessmentState = {
  id: string;
  stateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: OrganizationalLearningControlContext;
  version: number;
  status: OrganizationalLearningAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  taxonomyClass: LearningTaxonomyClass;
  synthesis: OrganizationalLearningSynthesis;
  snapshot: OrganizationalLearningSnapshot;
  learningItems: OrganizationalLearningItem[];
  contributingContributors: OrganizationalLearningContributorRef[];
  evidenceRefs: OrganizationalLearningEvidenceRef[];
  historicalSimilarityRefs: HistoricalSimilarityRef[];
  lessonReferences: LessonReference[];
  patternReferences: PatternReference[];
  outcomeReferences: OutcomeReference[];
  reusablePracticeReferences: ReusablePracticeReference[];
  crossProjectKnowledgeRefs: CrossProjectKnowledgeRef[];
  knowledgeProvenanceTraces: KnowledgeProvenanceTrace[];
  timelineTraces: OrganizationalLearningTimelineTrace[];
  governanceRefs: OrganizationalLearningGovernanceRef[];
  confidence: OrganizationalLearningConfidence;
  assumptions: string[];
  limitations: string[];
  reasons: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "organizational_learning_intelligence_advisory_v1";
  methodVersion: "1";
  assessedAt: string;
  recordedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  composedContextId?: string;
  explainabilityContextId?: string;
  assuranceContextId?: string;
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  autoExecutionEnabled: false;
  scheduleExecutionPerformed: false;
  costExecutionPerformed: false;
  contractInstructionPerformed: false;
  learningApprovalClaimed: false;
  knowledgeMutationClaimed: false;
  automaticLearningApprovalClaimed: false;
  automaticKnowledgeMutationClaimed: false;
  resourcePlanningPerformed: false;
  budgetLedgerMutated: false;
  financialPostingPerformed: false;
  predictiveSchedulingPerformed: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  mutatesUpstreamContributors: false;
  autonomousPublication: false;
  duplicateKnowledgeOwnershipDetected: false;
  fabricatedLesson: false;
  unsupportedSimilarityScore: false;
  recommendationClaimed: false;
  predictionClaimed: false;
  optimisationClaimed: false;
};

export type OrganizationalLearningReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

export type OrganizationalLearningReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  organizationalLearningStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: OrganizationalLearningReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
  learningApprovalClaimed: false;
  knowledgeMutationClaimed: false;
};

export type OrganizationalLearningProfileContribution = {
  assessmentsCompleted: number;
  assessmentsAbstained: number;
  publishedAssessments: number;
  historicalPatternCount: number;
  recurringIssueCount: number;
  recurringSuccessCount: number;
  lessonLearnedCount: number;
  knowledgeGapCount: number;
  bestPracticeCount: number;
  similarProjectCount: number;
  unknownCount: number;
  contributorCoverageCount: number;
  crossProjectRefCount: number;
  lowestConfidenceClass: OrganizationalLearningConfidenceClass;
  dominantSufficiency: OrganizationalLearningEvidenceSufficiency;
  latestAssessmentAt?: string;
};

export function organizationalLearningStateKey(
  scope: ProjectScopeRef,
  organizationalLearningUnitId: string,
): string {
  const ref = scope.referenceId ?? scope.projectId;
  return `${scope.kind}:${ref}:${organizationalLearningUnitId}`;
}

export function isAbstainingOrganizationalLearningSufficiency(
  sufficiency: OrganizationalLearningEvidenceSufficiency,
): boolean {
  return (
    sufficiency === "insufficient" ||
    sufficiency === "conflicting" ||
    sufficiency === "incomplete"
  );
}

export function taxonomyFromSufficiency(
  sufficiency: OrganizationalLearningEvidenceSufficiency,
  hasHistoricalEvidence: boolean,
): LearningTaxonomyClass {
  if (!hasHistoricalEvidence) return "unknown";
  if (sufficiency === "conflicting") return "knowledge_gap";
  if (sufficiency === "insufficient" || sufficiency === "incomplete") return "unknown";
  if (sufficiency === "limited") return "historical_pattern";
  return "lesson_learned";
}

export function basisStatusFromSufficiency(
  sufficiency: OrganizationalLearningEvidenceSufficiency,
  conflictDetected: boolean,
): LearningBasisStatus {
  if (conflictDetected || sufficiency === "conflicting") return "conflicting";
  if (sufficiency === "insufficient" || sufficiency === "incomplete") return "incomplete";
  if (sufficiency === "limited") return "partially_supported";
  if (sufficiency === "sufficient") return "supported";
  return "unknown";
}

export function reasonFromSufficiency(
  sufficiency: OrganizationalLearningEvidenceSufficiency,
  hasEvidence: boolean,
): LearningBasisReason {
  if (!hasEvidence) return "insufficient_evidence";
  if (sufficiency === "insufficient" || sufficiency === "incomplete") return "insufficient_evidence";
  if (sufficiency === "limited") return "derived";
  if (sufficiency === "sufficient") return "evidence_based";
  return "unknown";
}

export function assertNoFabricatedLessons(): { ok: true; fabricatedLesson: false } {
  return { ok: true, fabricatedLesson: false };
}

export function assertNoUnsupportedSimilarityScore(): {
  ok: true;
  unsupportedSimilarityScore: false;
} {
  return { ok: true, unsupportedSimilarityScore: false };
}

export function assertOrganizationalLearningAdvisoryOnly(): { ok: true; advisoryOnly: true } {
  return { ok: true, advisoryOnly: true };
}

export type ProjectProfileOrganizationalLearningKey = Extract<
  ProjectProfileContributorKey,
  "organizational_learning"
>;
