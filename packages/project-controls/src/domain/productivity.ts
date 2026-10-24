/**
 * Phase 11F — Productivity Intelligence domain types.
 *
 * Productivity Intelligence describes *what the evidence supports* about execution
 * efficiency posture on a project. It is advisory. It never manages workforce,
 * never processes timesheets or payroll, never computes labour productivity %,
 * and never produces forecasts or earned value.
 *
 * Forbidden throughout: workforce management, payroll, timesheets, resource
 * planning/leveling, labour costing, labour productivity %, forecasting,
 * EV/CPI/SPI, CPM, financial posting, cost engine execution.
 */

import type { ProjectScopeRef } from "./progress";

// ---------------------------------------------------------------------------
// Control context
// ---------------------------------------------------------------------------

export type ProductivityControlContext = {
  scope: ProjectScopeRef;
  /** Execution thread identifier (work package, activity group, etc.). */
  controlUnitId: string;
  controlUnitLabel?: string;
};

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const PRODUCTIVITY_EVIDENCE_KINDS = [
  "completed_quantity_reference",
  "progress_assessment_ref",
  "inspection_assessment_ref",
  "schedule_assessment_ref",
  "cost_assessment_ref",
  "approved_change_ref",
  "engineering_review_ref",
  "manual_observation",
] as const;

export type ProductivityEvidenceKind = (typeof PRODUCTIVITY_EVIDENCE_KINDS)[number];

export const PRODUCTIVITY_EVIDENCE_SOURCE_TYPES = [
  "manual_engineering_assessment",
  "project_intelligence",
  "inspection_intelligence",
  "progress_intelligence",
  "schedule_intelligence",
  "cost_intelligence",
  "change_intelligence",
  "approved_document",
] as const;

export type ProductivityEvidenceSourceType =
  (typeof PRODUCTIVITY_EVIDENCE_SOURCE_TYPES)[number];

export const PRODUCTIVITY_EVIDENCE_PROVENANCE = [
  "primary_source",
  "system_reference",
  "human_attestation",
  "derived_reference",
  "unknown",
] as const;

export type ProductivityEvidenceProvenance =
  (typeof PRODUCTIVITY_EVIDENCE_PROVENANCE)[number];

export const PRODUCTIVITY_EVIDENCE_REVIEW_STATUSES = [
  "unreviewed",
  "pending_review",
  "reviewed",
  "approved",
  "published",
  "revoked",
] as const;

export type ProductivityEvidenceReviewStatus =
  (typeof PRODUCTIVITY_EVIDENCE_REVIEW_STATUSES)[number];

export const PRODUCTIVITY_EVIDENCE_TRENDS = [
  "improving",
  "stable",
  "declining",
  "constrained",
  "recovering",
  "unknown",
] as const;

export type ProductivityEvidenceTrend = (typeof PRODUCTIVITY_EVIDENCE_TRENDS)[number];

/**
 * One governed observation referencing execution signals held elsewhere.
 */
export type ProductivityEvidence = {
  evidenceId: string;
  kind: ProductivityEvidenceKind;
  sourceType: ProductivityEvidenceSourceType;
  sourceRef: string;
  sourceKey: string;
  provenance: ProductivityEvidenceProvenance;
  reviewStatus: ProductivityEvidenceReviewStatus;
  observedAt?: string;
  sourceVersion?: string;
  /** Qualitative trend signal — never a labour % or numeric productivity rate. */
  declaredTrend?: ProductivityEvidenceTrend;
  confidence?: number;
  weight?: number;
  narrative?: string;
  revoked?: boolean;
  conflictsWith?: string[];
  derivedFromTimesheet: false;
  derivedFromPayroll: false;
  labourProductivityPercentClaimed: false;
  resourcePlanningClaimed: false;
  forecastDerived: false;
  earnedValueDerived: false;
  mutatesCoreRisk: false;
};

// ---------------------------------------------------------------------------
// Factors (evidence-backed)
// ---------------------------------------------------------------------------

export const PRODUCTIVITY_FACTOR_KEYS = [
  "work_continuity",
  "access_constraints",
  "engineering_delays",
  "inspection_hold_points",
  "approved_design_changes",
  "dependency_interruptions",
  "environmental_constraints",
  "logistics_constraints",
] as const;

export type ProductivityFactorKey = (typeof PRODUCTIVITY_FACTOR_KEYS)[number];

export type ProductivityFactor = {
  factorKey: ProductivityFactorKey;
  present: boolean;
  provenance: ProductivityEvidenceProvenance;
  confidence: number;
  reviewStatus: ProductivityEvidenceReviewStatus;
  observedAt?: string;
  sourceRef?: string;
  limitations: string[];
};

// ---------------------------------------------------------------------------
// Posture
// ---------------------------------------------------------------------------

export const PRODUCTIVITY_POSTURES = [
  "improving",
  "stable",
  "declining",
  "constrained",
  "recovering",
  "unknown",
] as const;

export type ProductivityPosture = (typeof PRODUCTIVITY_POSTURES)[number];

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

export const PRODUCTIVITY_EVIDENCE_SUFFICIENCY_OUTCOMES = [
  "sufficient",
  "limited",
  "insufficient",
  "conflicting",
  "stale",
] as const;

export type ProductivityEvidenceSufficiency =
  (typeof PRODUCTIVITY_EVIDENCE_SUFFICIENCY_OUTCOMES)[number];

export type ProductivityConfidenceClass = "high" | "medium" | "low" | "unavailable";

export type ProductivityConfidence = {
  confidenceId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  score: number;
  confidenceClass: ProductivityConfidenceClass;
  dataSufficiency: ProductivityEvidenceSufficiency;
  evidenceCount: number;
  usableEvidenceCount: number;
  sourceDiversity: number;
  freshness: number;
  reviewCompleteness: number;
  provenanceQuality: number;
  agreement: number;
  conflictState: "none" | "detected";
  abstention: boolean;
  abstentionReason?: string;
  reasons: string[];
  method: "productivity_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  labourProductivityPercentClaimed: false;
  workforceManagementClaimed: false;
};

// ---------------------------------------------------------------------------
// Assessment state
// ---------------------------------------------------------------------------

export const PRODUCTIVITY_ASSESSMENT_STATUSES = [
  "draft",
  "assessed",
  "pending_review",
  "changes_requested",
  "reviewed",
  "published",
  "rejected",
  "superseded",
] as const;

export type ProductivityAssessmentStatus =
  (typeof PRODUCTIVITY_ASSESSMENT_STATUSES)[number];

/**
 * The advisory productivity assessment for a scope and control unit, at a version.
 *
 * When `abstained` is true no posture or factors are published.
 */
export type ProductivityAssessmentState = {
  id: string;
  stateId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ProductivityControlContext;
  version: number;
  status: ProductivityAssessmentStatus;
  assessmentClass: "assessed" | "abstained";
  productivityPosture: ProductivityPosture;
  factors: ProductivityFactor[];
  evidenceRefs: string[];
  confidence: ProductivityConfidence;
  reasons: string[];
  limitations: string[];
  abstained: boolean;
  abstentionReason?: string;
  narrative?: string;
  method: "productivity_intelligence_advisory_v1";
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
  workforceManagementPerformed: false;
  timesheetProcessed: false;
  payrollProcessed: false;
  resourcePlanningPerformed: false;
  labourCostComputed: false;
  labourProductivityPercentComputed: false;
  forecastProduced: false;
  financialPostingPerformed: false;
  changeExecuted: false;
  scheduleExecuted: false;
  advisoryOnly: true;
  mutatesProjectIdentity: false;
  autonomousPublication: false;
};

export type ProductivityReviewOutcome =
  | "approved"
  | "rejected"
  | "changes_requested"
  | "resubmitted";

export type ProductivityReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  productivityStateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: ProductivityReviewOutcome;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
  workforceManagementClaimed: false;
};

/** Rollup contribution the Project Context Engine embeds in ProjectProfile. */
export type ProductivityProfileContribution = {
  productivityAssessed: number;
  productivityAbstained: number;
  publishedProductivity: number;
  improvingCount: number;
  stableCount: number;
  decliningCount: number;
  constrainedCount: number;
  recoveringCount: number;
  dominantPosture?: ProductivityPosture;
  factorPresenceCount: number;
  lowestConfidenceClass: ProductivityConfidenceClass;
  dominantSufficiency: ProductivityEvidenceSufficiency;
  latestAssessmentAt?: string;
  labourProductivityPercentClaimed: false;
};

// ---------------------------------------------------------------------------
// Timeline extensions (project-level)
// ---------------------------------------------------------------------------

export const PRODUCTIVITY_TIMELINE_KINDS = [
  "productivity_updated",
  "productivity_abstained",
  "productivity_reviewed",
  "productivity_published",
  "productivity_rejected",
  "productivity_superseded",
] as const;

export type ProductivityTimelineKind = (typeof PRODUCTIVITY_TIMELINE_KINDS)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isAbstainingProductivitySufficiency(
  sufficiency: ProductivityEvidenceSufficiency,
): boolean {
  return (
    sufficiency === "insufficient" ||
    sufficiency === "conflicting" ||
    sufficiency === "stale"
  );
}

export function productivityStateKey(
  scope: ProjectScopeRef,
  controlUnitId: string,
): string {
  const scopePart =
    scope.kind === "project"
      ? `project:${scope.projectId}`
      : `${scope.kind}:${scope.referenceId ?? "unknown"}`;
  return `${scopePart}#${controlUnitId}`;
}

export function dominantProductivityPosture(
  postures: readonly ProductivityPosture[],
): ProductivityPosture | undefined {
  if (postures.length === 0) return undefined;
  const counts = new Map<ProductivityPosture, number>();
  for (const value of postures) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function deriveProductivityFactors(
  evidence: readonly ProductivityEvidence[],
): ProductivityFactor[] {
  const usable = evidence.filter(
    (item) => item.revoked !== true && item.reviewStatus !== "revoked",
  );
  const factorMap = new Map<ProductivityFactorKey, ProductivityFactor>();

  for (const key of PRODUCTIVITY_FACTOR_KEYS) {
    factorMap.set(key, {
      factorKey: key,
      present: false,
      provenance: "unknown",
      confidence: 0,
      reviewStatus: "unreviewed",
      limitations: [],
    });
  }

  const kindToFactor: Partial<Record<ProductivityEvidenceKind, ProductivityFactorKey>> = {
    completed_quantity_reference: "work_continuity",
    progress_assessment_ref: "work_continuity",
    inspection_assessment_ref: "inspection_hold_points",
    schedule_assessment_ref: "dependency_interruptions",
    cost_assessment_ref: "logistics_constraints",
    approved_change_ref: "approved_design_changes",
    engineering_review_ref: "engineering_delays",
    manual_observation: "access_constraints",
  };

  for (const item of usable) {
    const factorKey = kindToFactor[item.kind];
    if (!factorKey) continue;
    const existing = factorMap.get(factorKey)!;
    factorMap.set(factorKey, {
      factorKey,
      present: true,
      provenance: item.provenance,
      confidence: item.confidence ?? existing.confidence,
      reviewStatus: item.reviewStatus,
      observedAt: item.observedAt ?? existing.observedAt,
      sourceRef: item.sourceRef,
      limitations: existing.limitations,
    });
  }

  return [...factorMap.values()];
}
