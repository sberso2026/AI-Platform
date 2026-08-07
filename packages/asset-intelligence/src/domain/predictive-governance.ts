/**
 * Phase 10J — Predictive governance state models.
 *
 * These types describe the governance record around predictive work: which
 * objectives the evidence could support, which methods could be considered, and
 * what would have to be proven first. None of them carry a predicted value.
 */

import type { AssetFusionState, FusionSourceKind, PredictiveReadinessClass } from "./fusion";
import type { PredictiveMethodClass, PredictiveObjectiveId } from "./predictive-objectives";
import type { PredictiveMethodStatus } from "./predictive-methods";

export type { PredictiveReadinessClass } from "./fusion";

/**
 * Provenance back to the fusion state a governance record was derived from.
 * `evidenceConfidenceRef` carries `EvidenceConfidenceAssessment.assessmentId`.
 */
export type FusionProvenanceRef = {
  fusionStateRef: string;
  fusionClass: AssetFusionState["fusionClass"];
  reconciliationRef?: string;
  evidenceConfidenceRef?: string;
  trendConfidenceRef?: string;
  contributingSourceKinds: readonly FusionSourceKind[];
  missingSourceKinds: readonly FusionSourceKind[];
  conflictingSourceKinds: readonly FusionSourceKind[];
  globalReadinessRef?: string;
};

export type FreshnessState = "fresh" | "aging" | "stale" | "unknown";

export type FreshnessPolicy = {
  policyId: string;
  version: string;
  /** Evidence older than this is no longer fresh. */
  maxEvidenceAgeDays: number;
  /** Age at which evidence is stale and readiness must be withheld. */
  staleAfterDays: number;
  /** Largest acceptable gap between consecutive observations in the window. */
  maxObservationGapDays: number;
  minimumObservationWindowDays: number;
  /** How often a published readiness state must be re-assessed. */
  revalidationIntervalDays: number;
  onAging: "downgrade_to_limited" | "require_human_review";
  onStale: "abstain" | "downgrade_to_not_ready" | "require_human_review";
};

export const DEFAULT_PREDICTIVE_FRESHNESS_POLICY: FreshnessPolicy = {
  policyId: "predictive_freshness_default_v1",
  version: "1",
  maxEvidenceAgeDays: 180,
  staleAfterDays: 540,
  maxObservationGapDays: 365,
  minimumObservationWindowDays: 180,
  revalidationIntervalDays: 180,
  onAging: "downgrade_to_limited",
  onStale: "downgrade_to_not_ready",
};

export function classifyFreshness(
  evidenceAgeDays: number | undefined,
  policy: FreshnessPolicy = DEFAULT_PREDICTIVE_FRESHNESS_POLICY,
): FreshnessState {
  if (evidenceAgeDays === undefined || !Number.isFinite(evidenceAgeDays)) return "unknown";
  if (evidenceAgeDays < 0) return "unknown";
  if (evidenceAgeDays > policy.staleAfterDays) return "stale";
  if (evidenceAgeDays > policy.maxEvidenceAgeDays) return "aging";
  return "fresh";
}

/**
 * Readiness for one specific objective. Replaces the single global readiness
 * flag with a per-objective judgement; the global state remains for backward
 * compatibility.
 */
export type ObjectivePredictiveReadinessState = {
  id: string;
  tenantId?: string;
  workspaceId?: string;
  assetId: string;
  objectiveId: PredictiveObjectiveId;
  objectiveVersion: string;
  version: number;
  readinessClass: PredictiveReadinessClass;
  readinessRationale: string[];
  satisfiedRequirements: string[];
  unmetRequirements: string[];
  evidenceConfidenceRef?: string;
  trendConfidenceRef?: string;
  fusionProvenance: FusionProvenanceRef;
  freshnessPolicyRef: string;
  freshnessState: FreshnessState;
  observationCount?: number;
  observationWindowDays?: number;
  method: "objective_predictive_readiness_v1";
  methodVersion: "1";
  reviewStatus: string;
  reviewInstanceId?: string;
  provenance: Record<string, unknown>;
  limitations: string[];
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  supersedesId?: string;
  /** Readiness is not permission: these remain false for the whole of 10J. */
  predictiveMlEnabled: false;
  predictiveMethodsCertified: false;
  predictiveMlExecuted: false;
  productionExecutionEnabled: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  isHealthFactor: false;
  containsPredictionOutput: false;
  autonomousExecutionForbidden: true;
};

export type PredictiveEligibilityOutcome =
  | "eligible"
  | "conditionally_eligible"
  | "ineligible";

/**
 * A proposal that a method be evaluated for an objective on an asset.
 * A candidate is never a prediction: it holds no estimated value, horizon or
 * probability, and `containsPredictionOutput` is structurally false.
 */
export type PredictiveMethodCandidate = {
  id: string;
  tenantId?: string;
  workspaceId?: string;
  assetId: string;
  objectiveId: PredictiveObjectiveId;
  methodId: string;
  methodDefinitionVersion: string;
  methodClass: PredictiveMethodClass;
  version: number;
  eligibility: PredictiveEligibilityOutcome;
  eligibilityRationale: string[];
  /** Conditions that must be discharged before a conditionally eligible method proceeds. */
  outstandingConditions: string[];
  unmetRequirements: string[];
  assumptionsAsserted: string[];
  assumptionsViolated: string[];
  readinessStateRef?: string;
  readinessClass: PredictiveReadinessClass;
  fusionProvenance: FusionProvenanceRef;
  freshnessPolicyRef: string;
  freshnessState: FreshnessState;
  qualificationRef?: string;
  method: "predictive_method_candidate_v1";
  methodVersion: "1";
  reviewStatus: string;
  reviewInstanceId?: string;
  provenance: Record<string, unknown>;
  limitations: string[];
  proposedAt: string;
  reviewedAt?: string;
  supersedesId?: string;
  /** A candidate proposes evaluation; it never carries an executed result. */
  containsPredictionOutput: false;
  predictiveMlExecuted: false;
  predictiveMethodsCertified: false;
  productionExecutionEnabled: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  isHealthFactor: false;
  autonomousExecutionForbidden: true;
};

export type QualificationStatus =
  | "draft"
  | "in_evaluation"
  | "passed"
  | "failed"
  | "inconclusive"
  | "withdrawn"
  | "expired";

export type AcceptanceComparator = "lte" | "gte" | "within_tolerance_of";

export type AcceptanceCriterion = {
  metricId: string;
  comparator: AcceptanceComparator;
  threshold: number;
  /** Required when comparator is `within_tolerance_of`. */
  tolerance?: number;
  mandatory: boolean;
  rationale?: string;
};

export type QualificationMetricResult = {
  metricId: string;
  observedValue: number;
  comparator: AcceptanceComparator;
  threshold: number;
  tolerance?: number;
  mandatory: boolean;
  passed: boolean;
  note?: string;
};

/**
 * Outcome of evaluating a method against a fixed, reproducible fixture set.
 * Passing qualification establishes acceptability within the fixture domain
 * only — it does not grant certification or production execution.
 */
export type PredictiveMethodQualificationState = {
  id: string;
  tenantId?: string;
  workspaceId?: string;
  methodId: string;
  methodDefinitionVersion: string;
  methodClass: PredictiveMethodClass;
  methodStatusAtQualification: PredictiveMethodStatus;
  objectiveId: PredictiveObjectiveId;
  version: number;
  qualificationStatus: QualificationStatus;
  /** Identifies the frozen fixture set; the hash makes reruns verifiable. */
  fixtureSetRef: string;
  fixtureSetHash: string;
  fixtureCount: number;
  applicabilityDomain: string[];
  acceptanceCriteria: AcceptanceCriterion[];
  results: QualificationMetricResult[];
  failedMandatoryMetricIds: string[];
  reproducible: boolean;
  evaluatedAt?: string;
  evaluatorId?: string;
  reviewStatus: string;
  reviewInstanceId?: string;
  provenance: Record<string, unknown>;
  limitations: string[];
  createdAt: string;
  supersedesId?: string;
  /** Qualification never promotes a method into production. */
  certificationGranted: false;
  productionExecutionEnabled: false;
  predictiveMlEnabled: false;
  predictiveMethodsCertified: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  isHealthFactor: false;
  autonomousExecutionForbidden: true;
};

export type PredictiveReviewSubjectKind =
  | "objective_readiness"
  | "method_candidate"
  | "method_qualification";

export type PredictiveReviewRecord = {
  id: string;
  tenantId?: string;
  workspaceId?: string;
  assetId?: string;
  subjectKind: PredictiveReviewSubjectKind;
  subjectId: string;
  subjectVersion: number;
  objectiveId?: PredictiveObjectiveId;
  methodId?: string;
  reviewInstanceId: string;
  action: string;
  reviewerId: string;
  reason?: string;
  evidenceConfidenceRef?: string;
  contentHash?: string;
  correlationId?: string;
  createdAt: string;
  /** Review may approve governance records; it may not approve execution. */
  grantsProductionExecution: false;
  grantsCertification: false;
};

/** Single place to read the Phase 10J execution posture. */
export const PREDICTIVE_GOVERNANCE_LOCKS = {
  productionPredictiveExecutionEnabled: false,
  predictiveMlEnabled: false,
  predictiveMethodsCertified: false,
  probabilityOfFailureCertified: false,
  rulClaimsCertified: false,
  predictiveHealthContributionEnabled: false,
  autonomousExecutionForbidden: true,
  containsPredictionOutput: false,
} as const;
