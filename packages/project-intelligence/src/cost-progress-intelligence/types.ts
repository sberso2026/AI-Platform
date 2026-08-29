/**
 * PI-3 Cost & Progress Intelligence contracts. Read-only projections over
 * published Project Controls cost and progress assessments. Not a ledger,
 * earned-value engine, or progress calculator.
 */

import type { ProjectHealthEvidenceReference, ProjectHealthOverallClassification } from "../project-health/types";
import type { CommandCentreAvailability } from "../command-centre/types";

export const COST_PUBLISHED_POSTURES = [
  "within_tolerance",
  "over",
  "under",
  "attention_required",
  "unknown",
] as const;
export type CostPublishedPosture = (typeof COST_PUBLISHED_POSTURES)[number];

export const PROGRESS_PUBLISHED_BANDS = [
  "not_started",
  "early",
  "in_progress",
  "advanced",
  "substantially_complete",
  "complete",
  "unavailable",
] as const;
export type ProgressPublishedBand = (typeof PROGRESS_PUBLISHED_BANDS)[number];

export const PROGRESS_PUBLISHED_TRENDS = ["improving", "stable", "declining", "unknown"] as const;
export type ProgressPublishedTrend = (typeof PROGRESS_PUBLISHED_TRENDS)[number];

export const COST_PROGRESS_FRESHNESS_STATES = ["CURRENT", "STALE", "UNKNOWN", "UNAVAILABLE"] as const;
export type CostProgressFreshnessState = (typeof COST_PROGRESS_FRESHNESS_STATES)[number];

export const COST_PROGRESS_ATTENTION_SEVERITIES = ["red", "amber", "info"] as const;
export type CostProgressAttentionSeverity = (typeof COST_PROGRESS_ATTENTION_SEVERITIES)[number];

export type CostEvidenceReference = ProjectHealthEvidenceReference;
export type ProgressEvidenceReference = ProjectHealthEvidenceReference;

export type PublishedCostStateRef = {
  stateId: string;
  projectId: string;
  published: boolean;
  abstained: boolean;
  posture?: CostPublishedPosture;
  varianceAttribution?: string;
  currencyCode?: string;
  basisKind?: string;
  basisCurrencyCode?: string;
  conversionRef?: string;
  dataSufficiency?: string;
  confidenceClass?: string;
  evidenceCount?: number;
  usableEvidenceCount?: number;
  assessedAt?: string;
  publishedAt?: string;
  recordedAt?: string;
  version?: number;
  storesCanonicalCopy: false;
};

export type PublishedCostEvidenceRef = {
  evidenceId: string;
  costStateId: string;
  kind: string;
  sourceType: string;
  sourceKey: string;
  currencyCode?: string;
  declaredDirection?: string;
  observedAt?: string;
  recordedAt?: string;
  revoked: boolean;
  storesCanonicalCopy: false;
};

export type PublishedProgressAssessmentRef = {
  assessmentId: string;
  stateId: string;
  projectId: string;
  published: boolean;
  abstained: boolean;
  band?: ProgressPublishedBand;
  trendDirection?: ProgressPublishedTrend;
  /** Pass-through of the published advisory indication. PI must not recompute. */
  indicatedCompletion?: number;
  dataSufficiency?: string;
  confidenceClass?: string;
  evidenceCount?: number;
  usableEvidenceCount?: number;
  assessedAt?: string;
  publishedAt?: string;
  recordedAt?: string;
  version?: number;
  storesCanonicalCopy: false;
};

export type PublishedProgressEvidenceRef = {
  evidenceId: string;
  assessmentId: string;
  kind: string;
  sourceType: string;
  sourceKey: string;
  indicatedCompletion?: number;
  observedAt?: string;
  recordedAt?: string;
  revoked: boolean;
  storesCanonicalCopy: false;
};

export type CostHealthSummary = {
  classification: ProjectHealthOverallClassification;
  posture?: CostPublishedPosture;
  headline: string;
  reasonCodes: readonly string[];
};

export type ProgressHealthSummary = {
  classification: ProjectHealthOverallClassification;
  band?: ProgressPublishedBand;
  trendDirection?: ProgressPublishedTrend;
  headline: string;
  reasonCodes: readonly string[];
};

export type CostAttentionItem = {
  id: string;
  severity: CostProgressAttentionSeverity;
  reasonCode: string;
  explanation: string;
  evidenceReference: CostEvidenceReference;
  asOf?: string;
};

export type ProgressAttentionItem = {
  id: string;
  severity: CostProgressAttentionSeverity;
  reasonCode: string;
  explanation: string;
  evidenceReference: ProgressEvidenceReference;
  asOf?: string;
};

export type CostDataQuality = {
  asOf?: string;
  publishedAt?: string;
  source: "project_controls";
  freshness: CostProgressFreshnessState;
  completeness?: string;
  missing: readonly string[];
  limitations: readonly string[];
  evidenceCount?: number;
  usableEvidenceCount?: number;
};

export type ProgressDataQuality = CostDataQuality;

export type CostMoneySafety = {
  currencyCode?: string;
  currencies: readonly string[];
  compatible: boolean;
  amountsPublished: false;
  mixedCurrenciesAggregated: false;
  exchangeRateInferred: false;
  limitation?: string;
};

export type UnsupportedEarnedValueMetrics = {
  published: false;
  ev: "unavailable";
  pv: "unavailable";
  ac: "unavailable";
  cpi: "unavailable";
  spi: "unavailable";
  eac: "unavailable";
  etc: "unavailable";
  vac: "unavailable";
  limitation: "earned_value_metrics_not_published";
};

export type CostPublishedMetrics = {
  posture?: CostPublishedPosture;
  varianceAttribution?: string;
  basisKind?: string;
  currencyCode?: string;
  monetaryVariancePublished: false;
  budgetAmountPublished: false;
  actualAmountPublished: false;
  committedAmountPublished: false;
  forecastAmountPublished: false;
  contingencyAmountPublished: false;
  summary: string;
};

export type ProgressPublishedMetrics = {
  band?: ProgressPublishedBand;
  trendDirection?: ProgressPublishedTrend;
  indicatedCompletion?: number;
  plannedProgressPublished: false;
  progressVarianceVersusPlanPublished: false;
  physicalPercentCertified: false;
  summary: string;
};

export type CostProgressConsistencySignal =
  | {
      available: false;
      explanation: string;
    }
  | {
      available: true;
      consistent: boolean;
      reasonCode: string;
      explanation: string;
      costEvidence: CostEvidenceReference;
      progressEvidence: ProgressEvidenceReference;
    };

export type ProjectCostIntelligence = {
  availability: CommandCentreAvailability;
  health: CostHealthSummary;
  attentionItems: readonly CostAttentionItem[];
  dataQuality: CostDataQuality;
  money: CostMoneySafety;
  metrics: CostPublishedMetrics;
  evidenceReferences: readonly CostEvidenceReference[];
};

export type ProjectProgressIntelligence = {
  availability: CommandCentreAvailability;
  health: ProgressHealthSummary;
  attentionItems: readonly ProgressAttentionItem[];
  dataQuality: ProgressDataQuality;
  metrics: ProgressPublishedMetrics;
  evidenceReferences: readonly ProgressEvidenceReference[];
};

export type ProjectCostProgressIntelligence = {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  cost: ProjectCostIntelligence;
  progress: ProjectProgressIntelligence;
  consistency: CostProgressConsistencySignal;
  earnedValue: UnsupportedEarnedValueMetrics;
  generatedAt: string;
  readOnly: true;
  persisted: false;
  aiRequired: false;
  mutatesCost: false;
  mutatesProgress: false;
};

export type CostSourceSlice = {
  availability: CommandCentreAvailability;
  latest: PublishedCostStateRef | null;
  history: readonly PublishedCostStateRef[];
  evidence: readonly PublishedCostEvidenceRef[];
};

export type ProgressSourceSlice = {
  availability: CommandCentreAvailability;
  latest: PublishedProgressAssessmentRef | null;
  history: readonly PublishedProgressAssessmentRef[];
  evidence: readonly PublishedProgressEvidenceRef[];
};

export type CostProgressSourceSnapshot = {
  cost: CostSourceSlice;
  progress: ProgressSourceSlice;
};
