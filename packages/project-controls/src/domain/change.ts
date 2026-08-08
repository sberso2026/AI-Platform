/**
 * Phase 11D — Change Intelligence domain types.
 *
 * Change Intelligence describes *what the evidence supports* about a change on a
 * project. It is advisory. A change candidate is not an approved change, an
 * assessment is not a contractual instruction, and no record here carries
 * contractual authority.
 *
 * The concept ladder is deliberate and is spelled out in
 * `docs/architecture/PROJECT_CONTROLS_CHANGE_MODEL.md`:
 *
 *   Change Signal      an observation that something may have changed
 *   Change Candidate   a grouped signal set worth assessing — NOT approved
 *   Change Reference   a pointer at a record held by the contractual authority
 *   Change Assessment  the advisory intelligence state produced from evidence
 *   Change Impact      advisory impact context, never a computed monetary amount
 *
 * Forbidden throughout: cost engine, budget ledger, financial posting, earned
 * value, CPM/float, contingency drawdown, change execution, contractual change
 * approval.
 */

import type { ProjectScopeRef } from "./progress";

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

export const CHANGE_CLASSIFICATIONS = [
  "scope",
  "design",
  "schedule",
  "cost",
  "technical",
  "contractual",
  "regulatory",
  "procurement",
  "construction",
  "quality",
  "safety",
  "asset_interface",
  "other",
] as const;

export type ChangeClassification = (typeof CHANGE_CLASSIFICATIONS)[number];

/**
 * A `cost` classification labels the *subject* of a change. It never implies a
 * cost engine, a budget movement or a monetary amount — Project Controls holds
 * no money position in Phase 11D.
 */
export const CHANGE_CLASSIFICATION_COST_IS_SUBJECT_NOT_QUANTUM = true as const;

// ---------------------------------------------------------------------------
// Authority
// ---------------------------------------------------------------------------

/**
 * Who may hold contractual change authority. Project Controls is not on this
 * list and must never be added to it.
 */
export const CHANGE_AUTHORITY_OWNERS = [
  "engineering_core",
  "future_commercial_contracts_domain",
  "business_os",
  "external_contract_administration",
  "unassigned",
] as const;

export type ChangeAuthorityOwner = (typeof CHANGE_AUTHORITY_OWNERS)[number];

export const CHANGE_REFERENCE_KINDS = [
  "external_change_order",
  "variation_register_entry",
  "contract_instruction",
  "site_instruction",
  "client_directive",
  "internal_trend_record",
  "unknown",
] as const;

export type ChangeReferenceKind = (typeof CHANGE_REFERENCE_KINDS)[number];

/**
 * A pointer at a change record owned elsewhere. Project Controls stores the
 * reference so intelligence can be attributed; it never stores the instrument
 * itself and never asserts that the reference is approved.
 */
export type ChangeReference = {
  referenceId: string;
  kind: ChangeReferenceKind;
  /** Who owns the referenced record. Never `project_controls`. */
  authorityOwner: ChangeAuthorityOwner;
  externalRef?: string;
  referencedAt?: string;
  /** What the *source* says the status is — not what Project Controls decides. */
  declaredStatusContext?: ChangeStatusContext;
  ownedByProjectControls: false;
  contractualApprovalClaimed: false;
};

// ---------------------------------------------------------------------------
// Signals and candidates
// ---------------------------------------------------------------------------

export const CHANGE_SIGNAL_SOURCE_TYPES = [
  "manual_engineering_observation",
  "project_intelligence",
  "inspection_intelligence",
  "progress_intelligence",
  "schedule_intelligence",
  "approved_document",
  "approved_meeting",
  "external_reference",
] as const;

export type ChangeSignalSourceType = (typeof CHANGE_SIGNAL_SOURCE_TYPES)[number];

/** An observation that something on the project may have changed. */
export type ChangeSignal = {
  signalId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  sourceType: ChangeSignalSourceType;
  sourceKey: string;
  sourceRef?: string;
  observedAt?: string;
  narrative?: string;
  suggestedChangeClass?: ChangeClassification;
  revoked?: boolean;
  contractualApprovalClaimed: false;
  mutatesBudget: false;
};

export const CHANGE_CANDIDATE_STATUSES = [
  "candidate",
  "assessed",
  "withdrawn",
  "superseded",
] as const;

export type ChangeCandidateStatus = (typeof CHANGE_CANDIDATE_STATUSES)[number];

/**
 * A grouped set of signals worth assessing.
 *
 * A candidate is emphatically NOT an approved change. `isApprovedChange` is a
 * `false` literal so the distinction survives serialisation into the database
 * and the outbox.
 */
export type ChangeCandidate = {
  candidateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  changeClass: ChangeClassification;
  status: ChangeCandidateStatus;
  signalRefs: string[];
  title?: string;
  narrative?: string;
  createdAt: string;
  createdBy?: string;
  supersedesId?: string;
  isApprovedChange: false;
  contractualApprovalClaimed: false;
  mutatesBudget: false;
  derivedFromEarnedValue: false;
};

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const CHANGE_EVIDENCE_KINDS = [
  "document_reference",
  "meeting_statement",
  "instruction_reference",
  "design_revision_reference",
  "inspection_result",
  "progress_assessment_ref",
  "schedule_assessment_ref",
  "correspondence_reference",
  "manual_engineering_attestation",
  "external_register_reference",
] as const;

export type ChangeEvidenceKind = (typeof CHANGE_EVIDENCE_KINDS)[number];

export const CHANGE_EVIDENCE_SOURCE_TYPES = [
  "manual_engineering_assessment",
  "project_intelligence",
  "inspection_intelligence",
  "progress_intelligence",
  "schedule_intelligence",
  "approved_document",
  "approved_meeting",
  "external_change_register",
] as const;

export type ChangeEvidenceSourceType = (typeof CHANGE_EVIDENCE_SOURCE_TYPES)[number];

export const CHANGE_EVIDENCE_PROVENANCE = [
  "primary_source",
  "system_reference",
  "human_attestation",
  "derived_reference",
  "unknown",
] as const;

export type ChangeEvidenceProvenance = (typeof CHANGE_EVIDENCE_PROVENANCE)[number];

export const CHANGE_EVIDENCE_REVIEW_STATUSES = [
  "unreviewed",
  "pending_review",
  "reviewed",
  "approved",
  "published",
  "revoked",
] as const;

export type ChangeEvidenceReviewStatus = (typeof CHANGE_EVIDENCE_REVIEW_STATUSES)[number];

/**
 * One observation that speaks to a change.
 *
 * Evidence carries a *reference* to its source and never a copy of the source
 * payload: Project Controls is not a document store and must not become a
 * shadow copy of the owning module's content.
 */
export type ChangeEvidence = {
  evidenceId: string;
  kind: ChangeEvidenceKind;
  sourceType: ChangeEvidenceSourceType;
  /** Identifier of the record in the owning system. No payload duplication. */
  sourceRef: string;
  sourceKey: string;
  provenance: ChangeEvidenceProvenance;
  reviewStatus: ChangeEvidenceReviewStatus;
  observedAt?: string;
  /** Version of the referenced source, when the owner exposes one. */
  sourceVersion?: string;
  /** 0..1 as declared by the source. An input to confidence, never an output. */
  confidence?: number;
  weight?: number;
  declaredChangeClass?: ChangeClassification;
  declaredStatusContext?: ChangeStatusContext;
  narrative?: string;
  revoked?: boolean;
  conflictsWith?: string[];
  // ---- Locks persisted with the evidence row ----
  derivedFromEarnedValue: false;
  mutatesCoreRisk: false;
  mutatesBudget: false;
  contractualApprovalClaimed: false;
};

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

export const CHANGE_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "stale",
  "revoked",
] as const;

export type ChangeEvidenceSufficiency =
  (typeof CHANGE_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type ChangeConfidenceClass = "high" | "medium" | "low" | "unavailable";

/**
 * Confidence in the *evidence basis* for a change assessment. It never claims
 * contractual certainty and never claims engineering correctness.
 */
export type ChangeConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  score: number;
  confidenceClass: ChangeConfidenceClass;
  dataSufficiency: ChangeEvidenceSufficiency;
  evidenceCount: number;
  usableEvidenceCount: number;
  sourceDiversity: number;
  freshness: number;
  reviewCompleteness: number;
  provenanceQuality: number;
  agreement: number;
  conflictState: "none" | "detected";
  /** True whenever the sufficiency outcome forces the engine to abstain. */
  abstention: boolean;
  abstentionReason?: string;
  reasons: string[];
  method: "change_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  engineeringCorrectnessClaimed: false;
  contractualCertaintyClaimed: false;
};

// ---------------------------------------------------------------------------
// Assessment state
// ---------------------------------------------------------------------------

export const CHANGE_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
  "superseded",
] as const;

export type ChangeAssessmentStatus = (typeof CHANGE_ASSESSMENT_STATUSES)[number];

/**
 * What the evidence says about where the change sits in someone else's process.
 * `approved_context` means "the authoritative source says it is approved", not
 * "Project Controls approved it".
 */
export const CHANGE_STATUS_CONTEXTS = [
  "pending",
  "approved_context",
  "rejected_context",
  "unknown",
] as const;

export type ChangeStatusContext = (typeof CHANGE_STATUS_CONTEXTS)[number];

/** Advisory impact context. Never a computed monetary or day amount. */
export const CHANGE_IMPACT_CONTEXTS = [
  "suspected",
  "supported",
  "unknown",
  "not_applicable",
] as const;

export type ChangeImpactContext = (typeof CHANGE_IMPACT_CONTEXTS)[number];

export type ChangeImpactContexts = {
  scope: ChangeImpactContext;
  schedule: ChangeImpactContext;
  cost: ChangeImpactContext;
  risk: ChangeImpactContext;
  quality: ChangeImpactContext;
  procurement: ChangeImpactContext;
};

/**
 * The advisory change assessment for a scope and change class, at a version.
 *
 * When `abstained` is true no status context or impact context is published:
 * the engine refuses to guess at a change posture it cannot support.
 */
export type ChangeIntelligenceState = {
  id: string;
  stateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  version: number;
  status: ChangeAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  changeClass: ChangeClassification;
  changeStatusContext: ChangeStatusContext;
  /** Reference to the record held by the contractual authority, when known. */
  authoritativeChangeRef?: ChangeReference;
  candidateId?: string;
  impact: ChangeImpactContexts;
  evidenceRefs: string[];
  confidence: ChangeConfidence;
  reasons: string[];
  limitations: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "change_intelligence_advisory_v1";
  methodVersion: "1";
  assessedAt: string;
  recordedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  // ---- Forbid locks persisted with every state ----
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  costIntegrated: false;
  budgetMutated: false;
  financialPostingPerformed: false;
  forecastProduced: false;
  contingencyDrawn: false;
  changeExecuted: false;
  contractualApprovalClaimed: false;
  contractualAuthorityClaimed: false;
  coreRiskMutated: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  autonomousPublication: false;
};

export type ChangeReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

/**
 * A human review of the *assessment*. Approving an assessment says the
 * intelligence is fit to publish; it says nothing about contractual approval of
 * the underlying change.
 */
export type ChangeReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  changeStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: ChangeReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
  contractualApprovalClaimed: false;
};

/** Rollup contribution the Project Context Engine embeds in ProjectProfile. */
export type ChangeProfileContribution = {
  changesAssessed: number;
  changesAbstained: number;
  publishedChanges: number;
  candidateCount: number;
  pendingContextCount: number;
  approvedContextCount: number;
  rejectedContextCount: number;
  dominantChangeClass?: ChangeClassification;
  lowestConfidenceClass: ChangeConfidenceClass;
  dominantSufficiency: ChangeEvidenceSufficiency;
  latestAssessmentAt?: string;
  contractualAuthorityClaimed: false;
};

// ---------------------------------------------------------------------------
// Shared project-level timeline and snapshot (introduced in 11D)
// ---------------------------------------------------------------------------

export const PROJECT_TIMELINE_KINDS = [
  "change_candidate_created",
  "change_assessed",
  "change_abstained",
  "change_reviewed",
  "change_published",
  "change_rejected",
  "change_superseded",
  "project_profile_composed",
  "project_snapshot_created",
] as const;

export type ProjectTimelineKind = (typeof PROJECT_TIMELINE_KINDS)[number];

export type ProjectTimelineGovernance = {
  advisoryOnly: true;
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  financialPostingPerformed: false;
  contractualApprovalClaimed: false;
  mutatesProjectIdentity: false;
};

/**
 * An append-only, project-level timeline entry. It coexists with the
 * progress-scoped and schedule-scoped timelines rather than replacing them.
 */
export type ProjectTimelineEvent = {
  entryId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  stateId?: string;
  kind: ProjectTimelineKind;
  eventType: string;
  recordedAt: string;
  sourceKey: string;
  actorId?: string;
  detail?: string;
  governance: ProjectTimelineGovernance;
};

export type ProjectTimeline = {
  projectId: string;
  events: readonly ProjectTimelineEvent[];
};

/**
 * An immutable point-in-time reference set. It holds identifiers only: no
 * evidence payloads, no indications, no dates copied out of the referenced
 * states.
 */
export type ProjectSnapshot = {
  snapshotId: string;
  schemaVersion: "project_controls_project_snapshot/1";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  capturedAt: string;
  profileId?: string;
  progressStateIds: string[];
  scheduleStateIds: string[];
  changeStateIds: string[];
  createdBy?: string;
  immutable: true;
  containsEvidencePayloads: false;
  projectReferenceResolved: true;
  isProjectRegistry: false;
  mutatesProjectIdentity: false;
  earnedValueComputed: false;
  financialPostingPerformed: false;
  contractualApprovalClaimed: false;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isAbstainingChangeSufficiency(
  sufficiency: ChangeEvidenceSufficiency,
): boolean {
  return (
    sufficiency === "insufficient" ||
    sufficiency === "conflicting" ||
    sufficiency === "stale" ||
    sufficiency === "revoked"
  );
}

/** Conservative: an unresolved or contested context outranks an approved one. */
export function dominantChangeStatusContext(
  contexts: readonly ChangeStatusContext[],
): ChangeStatusContext {
  if (contexts.length === 0) return "unknown";
  const distinct = new Set(contexts.filter((value) => value !== "unknown"));
  if (distinct.size === 0) return "unknown";
  if (distinct.size > 1) return "pending";
  return [...distinct][0];
}

export function dominantChangeClass(
  classes: readonly ChangeClassification[],
): ChangeClassification | undefined {
  if (classes.length === 0) return undefined;
  const counts = new Map<ChangeClassification, number>();
  for (const value of classes) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

/** Stable key for a change thread: one version series per scope + class. */
export function changeStateKey(scope: ProjectScopeRef, changeClass: ChangeClassification): string {
  const scopePart =
    scope.kind === "project"
      ? `project:${scope.projectId}`
      : `${scope.kind}:${scope.referenceId ?? "unknown"}`;
  return `${scopePart}#${changeClass}`;
}

export function emptyChangeImpactContexts(): ChangeImpactContexts {
  return {
    scope: "unknown",
    schedule: "unknown",
    cost: "unknown",
    risk: "unknown",
    quality: "unknown",
    procurement: "unknown",
  };
}

/** A candidate never becomes an approved change by passing through this module. */
export function assertCandidateIsNotApprovedChange(candidate: ChangeCandidate): void {
  if (candidate.isApprovedChange !== false) {
    throw new Error("change_candidate_is_not_an_approved_change");
  }
  if (candidate.contractualApprovalClaimed !== false) {
    throw new Error("change_candidate_may_not_claim_contractual_approval");
  }
}
