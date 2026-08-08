/**
 * Phase 11E — Cost Intelligence domain types.
 *
 * Cost Intelligence describes *what the evidence supports* about cost posture
 * on a project. It is advisory. It never holds a budget ledger, never posts
 * to a GL, never computes earned value, and never produces a forecast.
 *
 * The concept ladder:
 *
 *   Cost Evidence       an observation referencing a cost signal held elsewhere
 *   Cost Basis Ref      a pointer at a baseline/budget record owned externally
 *   Cost Assessment     the advisory intelligence state produced from evidence
 *   Variance Attribution advisory context linking movement to change intelligence
 *
 * Forbidden throughout: cost engine, budget ledger, financial posting, earned
 * value, forecast engine, contingency drawdown, CPM/float, schedule/change execution.
 */

import type { ChangeIntelligenceState } from "./change";
import type { ProjectScopeRef } from "./progress";

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

export const COST_BASIS_KINDS = [
  "approved_budget",
  "baseline_estimate",
  "control_budget",
  "external_cost_register",
  "manual_engineering_basis",
  "unknown",
] as const;

export type CostBasisKind = (typeof COST_BASIS_KINDS)[number];

/**
 * A pointer at a cost basis record owned elsewhere. Project Controls stores
 * the reference so intelligence can be attributed; it never stores the ledger
 * itself and never asserts budget authority.
 */
export type CostBasisReference = {
  referenceId: string;
  kind: CostBasisKind;
  /** Who owns the referenced record. Never `project_controls`. */
  authorityOwner: CostBasisAuthorityOwner;
  externalRef?: string;
  referencedAt?: string;
  currencyCode: string;
  /** Approved conversion reference when basis currency differs from assessment currency. */
  conversionRef?: string;
  ownedByProjectControls: false;
  mutatesBudget: false;
  financialPostingClaimed: false;
};

export const COST_BASIS_AUTHORITY_OWNERS = [
  "external_finance_or_future_finance_domain",
  "engineering_core",
  "business_os",
  "future_commercial_contracts_domain",
  "external_contract_administration",
  "unassigned",
] as const;

export type CostBasisAuthorityOwner = (typeof COST_BASIS_AUTHORITY_OWNERS)[number];

export type CostAccountReference = {
  accountId: string;
  accountCode?: string;
  label?: string;
  currencyCode: string;
  /** CBS node the account rolls up to, when known. */
  cbsRef?: CostBreakdownStructureReference;
  ownedByProjectControls: false;
};

export type CostBreakdownStructureReference = {
  cbsId: string;
  nodeCode?: string;
  label?: string;
  externalRef?: string;
  ownedByProjectControls: false;
};

export type CostControlContext = {
  scope: ProjectScopeRef;
  accountRef: CostAccountReference;
  cbsRef?: CostBreakdownStructureReference;
  currencyCode: string;
  toleranceBand?: "within_5pct" | "within_10pct" | "custom" | "unknown";
};

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const COST_EVIDENCE_KINDS = [
  "actual_cost_reference",
  "commitment_reference",
  "invoice_reference",
  "progress_assessment_ref",
  "schedule_assessment_ref",
  "change_assessment_ref",
  "manual_engineering_attestation",
  "external_cost_register_reference",
] as const;

export type CostEvidenceKind = (typeof COST_EVIDENCE_KINDS)[number];

export const COST_EVIDENCE_SOURCE_TYPES = [
  "manual_engineering_assessment",
  "project_intelligence",
  "inspection_intelligence",
  "progress_intelligence",
  "schedule_intelligence",
  "change_intelligence",
  "external_cost_register",
  "approved_document",
] as const;

export type CostEvidenceSourceType = (typeof COST_EVIDENCE_SOURCE_TYPES)[number];

export const COST_EVIDENCE_PROVENANCE = [
  "primary_source",
  "system_reference",
  "human_attestation",
  "derived_reference",
  "unknown",
] as const;

export type CostEvidenceProvenance = (typeof COST_EVIDENCE_PROVENANCE)[number];

export const COST_EVIDENCE_REVIEW_STATUSES = [
  "unreviewed",
  "pending_review",
  "reviewed",
  "approved",
  "published",
  "revoked",
] as const;

export type CostEvidenceReviewStatus = (typeof COST_EVIDENCE_REVIEW_STATUSES)[number];

export const COST_EVIDENCE_DIRECTIONS = [
  "over_basis",
  "under_basis",
  "within_tolerance",
  "attention_required",
  "unknown",
] as const;

export type CostEvidenceDirection = (typeof COST_EVIDENCE_DIRECTIONS)[number];

/**
 * One observation that speaks to cost posture. References only — no payload
 * duplication from the owning system.
 */
export type CostEvidence = {
  evidenceId: string;
  kind: CostEvidenceKind;
  sourceType: CostEvidenceSourceType;
  sourceRef: string;
  sourceKey: string;
  provenance: CostEvidenceProvenance;
  reviewStatus: CostEvidenceReviewStatus;
  observedAt?: string;
  sourceVersion?: string;
  currencyCode: string;
  /** Qualitative direction signal from the source — never a computed ledger amount. */
  declaredDirection?: CostEvidenceDirection;
  confidence?: number;
  weight?: number;
  narrative?: string;
  revoked?: boolean;
  conflictsWith?: string[];
  derivedFromEarnedValue: false;
  mutatesCoreRisk: false;
  mutatesBudget: false;
  financialPostingClaimed: false;
  forecastDerived: false;
};

// ---------------------------------------------------------------------------
// Posture and attribution
// ---------------------------------------------------------------------------

export const COST_POSTURES = [
  "within_tolerance",
  "over",
  "under",
  "attention_required",
  "unknown",
] as const;

export type CostPosture = (typeof COST_POSTURES)[number];

export const COST_VARIANCE_ATTRIBUTIONS = [
  "explained_by_approved_change",
  "pending_change_context",
  "rejected_change_context",
  "unexplained_movement",
  "mixed_context",
  "insufficient_evidence",
] as const;

export type CostVarianceAttribution = (typeof COST_VARIANCE_ATTRIBUTIONS)[number];

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

export const COST_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "stale",
  "revoked",
] as const;

export type CostEvidenceSufficiency = (typeof COST_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type CostConfidenceClass = "high" | "medium" | "low" | "unavailable";

export type CostConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  score: number;
  confidenceClass: CostConfidenceClass;
  dataSufficiency: CostEvidenceSufficiency;
  evidenceCount: number;
  usableEvidenceCount: number;
  sourceDiversity: number;
  freshness: number;
  reviewCompleteness: number;
  provenanceQuality: number;
  agreement: number;
  currencyConsistency: number;
  basisCompatibility: number;
  conflictState: "none" | "detected";
  abstention: boolean;
  abstentionReason?: string;
  reasons: string[];
  method: "cost_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  engineeringCorrectnessClaimed: false;
  financialCertaintyClaimed: false;
};

// ---------------------------------------------------------------------------
// Assessment state
// ---------------------------------------------------------------------------

export const COST_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
  "superseded",
] as const;

export type CostAssessmentStatus = (typeof COST_ASSESSMENT_STATUSES)[number];

/**
 * The advisory cost assessment for a scope and account, at a version.
 *
 * When `abstained` is true no posture or variance attribution is published.
 */
export type CostIntelligenceState = {
  id: string;
  stateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: CostControlContext;
  version: number;
  status: CostAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  costPosture: CostPosture;
  varianceAttribution: CostVarianceAttribution;
  costBasisRef?: CostBasisReference;
  changeIntelligenceRefs: string[];
  evidenceRefs: string[];
  confidence: CostConfidence;
  reasons: string[];
  limitations: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "cost_intelligence_advisory_v1";
  methodVersion: "1";
  assessedAt: string;
  recordedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  budgetMutated: false;
  financialPostingPerformed: false;
  forecastProduced: false;
  contingencyDrawn: false;
  changeExecuted: false;
  scheduleExecuted: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  autonomousPublication: false;
};

export type CostReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

export type CostReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  costStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: CostReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
  financialPostingClaimed: false;
};

/** Rollup contribution the Project Context Engine embeds in ProjectProfile. */
export type CostProfileContribution = {
  costsAssessed: number;
  costsAbstained: number;
  publishedCosts: number;
  overCount: number;
  underCount: number;
  withinToleranceCount: number;
  attentionRequiredCount: number;
  unexplainedVarianceCount: number;
  changeExplainedVarianceCount: number;
  dominantPosture?: CostPosture;
  dominantVarianceAttribution?: CostVarianceAttribution;
  lowestConfidenceClass: CostConfidenceClass;
  dominantSufficiency: CostEvidenceSufficiency;
  latestAssessmentAt?: string;
  financialPostingClaimed: false;
};

// ---------------------------------------------------------------------------
// Timeline extensions (project-level)
// ---------------------------------------------------------------------------

export const COST_TIMELINE_KINDS = [
  "cost_assessed",
  "cost_abstained",
  "cost_reviewed",
  "cost_published",
  "cost_rejected",
  "cost_superseded",
  "cost_variance_attributed",
] as const;

export type CostTimelineKind = (typeof COST_TIMELINE_KINDS)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isAbstainingCostSufficiency(
  sufficiency: CostEvidenceSufficiency,
): boolean {
  return (
    sufficiency === "insufficient" ||
    sufficiency === "conflicting" ||
    sufficiency === "stale" ||
    sufficiency === "revoked"
  );
}

export function costStateKey(scope: ProjectScopeRef, accountId: string): string {
  const scopePart =
    scope.kind === "project"
      ? `project:${scope.projectId}`
      : `${scope.kind}:${scope.referenceId ?? "unknown"}`;
  return `${scopePart}#${accountId}`;
}

export function currenciesCompatible(
  assessmentCurrency: string,
  basis: CostBasisReference | undefined,
  evidence: readonly CostEvidence[],
): { compatible: boolean; reason?: string } {
  if (!assessmentCurrency) {
    return { compatible: false, reason: "currency_code_required" };
  }
  const codes = new Set<string>([assessmentCurrency.toUpperCase()]);
  if (basis) codes.add(basis.currencyCode.toUpperCase());
  for (const item of evidence) {
    if (item.revoked === true) continue;
    codes.add(item.currencyCode.toUpperCase());
  }
  if (codes.size === 1) return { compatible: true };
  if (basis?.conversionRef) return { compatible: true };
  return { compatible: false, reason: "incompatible_currencies_without_conversion_ref" };
}

/** Consume published change intelligence for variance attribution — never approves change. */
export function attributeVarianceFromChangeIntelligence(
  changeStates: readonly ChangeIntelligenceState[],
): CostVarianceAttribution {
  const published = changeStates.filter(
    (state) => !state.abstained && state.status === "published",
  );
  if (published.length === 0) return "insufficient_evidence";

  const contexts = published.map((state) => state.changeStatusContext);
  const hasApproved = contexts.includes("approved_context");
  const hasPending = contexts.includes("pending");
  const hasRejected = contexts.includes("rejected_context");

  if (hasApproved && !hasPending && !hasRejected) return "explained_by_approved_change";
  if (hasRejected && !hasApproved && !hasPending) return "rejected_change_context";
  if (hasPending && !hasApproved && !hasRejected) return "pending_change_context";
  if (hasApproved || hasPending || hasRejected) return "mixed_context";
  return "unexplained_movement";
}

export function dominantCostPosture(postures: readonly CostPosture[]): CostPosture | undefined {
  if (postures.length === 0) return undefined;
  const counts = new Map<CostPosture, number>();
  for (const value of postures) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
