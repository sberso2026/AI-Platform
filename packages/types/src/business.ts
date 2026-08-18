/**
 * Business OS contracts (BOS-0 foundation, BOS-1 Owner Command, BOS-2 Financial Intelligence, BOS-3 Growth Intelligence).
 * Capabilities are identifiers — owner_command, financial_intelligence, and growth_intelligence are implemented.
 */

export const BUSINESS_OS_ID = "business" as const;
export const BUSINESS_OS_PRODUCT_SLUG = "business-os" as const;
export const BUSINESS_OS_FEATURE_KEY = "business_os" as const;

/** Foundation preview is feature-flag gated; catalog remains coming_soon. */
export const BUSINESS_OS_PREVIEW_MODE = "feature_flag_foundation" as const;

export const BUSINESS_PERMISSIONS = [
  "business_os.view",
  "business_os.manage",
  "business_os.admin",
  "business_os.owner_command.view",
  "business_os.owner_command.manage",
  "business_os.financial_intelligence.view",
  "business_os.financial_intelligence.manage",
  "business_os.growth_intelligence.view",
  "business_os.growth_intelligence.manage",
] as const;

export type BusinessPermission = (typeof BUSINESS_PERMISSIONS)[number];

/**
 * Capability-level permission convention:
 * `business_os.{capabilityId}.view` | `.manage`
 */
export function businessCapabilityViewPermission(capabilityId: string): string {
  return `business_os.${capabilityId}.view`;
}

export const BUSINESS_CAPABILITY_IDS = [
  "owner_command",
  "financial_intelligence",
  "growth_intelligence",
  "market_intelligence",
  "lead_generation",
  "lead_enrichment",
  "lead_scoring",
  "opportunity_intelligence",
  "revenue_execution",
  "proposal_intelligence",
  "pricing_intelligence",
  "customer_intelligence",
  "profit_intelligence",
  "work_operations",
  "decision_action",
  "business_risk",
  "business_context",
  "ai_workforce",
] as const;

export type BusinessCapabilityId = (typeof BUSINESS_CAPABILITY_IDS)[number];

export type BusinessCapabilityActivationStatus =
  | "registered"
  | "preview"
  | "unavailable"
  | "active";

export interface BusinessCapabilityDefinition {
  id: BusinessCapabilityId;
  name: string;
  description: string;
  implemented: boolean;
  activationStatus: BusinessCapabilityActivationStatus;
}

export const BUSINESS_OS_EVENT_TYPES = [
  "business_os.foundation.status.requested",
  "business_os.foundation.access.denied",
  "business_os.foundation.access.granted",
  "business_os.kpi.updated",
  "business_os.signal.created",
  "business_os.signal.resolved",
  "business_os.recommendation.created",
  "business_os.decision.created",
  "business_os.decision.updated",
  "business_os.action.created",
  "business_os.action.completed",
  "business_os.finance.snapshot_ingested",
  "business_os.finance.metrics_updated",
  "business_os.finance.signal_detected",
  "business_os.growth.lead_created",
  "business_os.growth.lead_qualified",
  "business_os.growth.lead_converted",
  "business_os.growth.opportunity_created",
  "business_os.growth.opportunity_updated",
  "business_os.growth.opportunity_won",
  "business_os.growth.opportunity_lost",
  "business_os.growth.metrics_updated",
  "business_os.growth.signal_detected",
] as const;

export type BusinessOsEventType = (typeof BUSINESS_OS_EVENT_TYPES)[number];

export const BUSINESS_KPI_STATUSES = [
  "healthy",
  "watch",
  "warning",
  "critical",
  "unknown",
] as const;
export type BusinessKpiStatus = (typeof BUSINESS_KPI_STATUSES)[number];

export const BUSINESS_KPI_CATEGORIES = [
  "revenue",
  "cash",
  "margin",
  "receivables",
  "pipeline",
  "operations",
  "general",
] as const;
export type BusinessKpiCategory = (typeof BUSINESS_KPI_CATEGORIES)[number];

export const BUSINESS_SIGNAL_SEVERITIES = ["info", "watch", "warning", "critical"] as const;
export type BusinessSignalSeverity = (typeof BUSINESS_SIGNAL_SEVERITIES)[number];

export const BUSINESS_SIGNAL_STATUSES = ["open", "acknowledged", "resolved", "dismissed"] as const;
export type BusinessSignalStatus = (typeof BUSINESS_SIGNAL_STATUSES)[number];

export const BUSINESS_RECOMMENDATION_STATUSES = [
  "proposed",
  "accepted",
  "rejected",
  "superseded",
] as const;
export type BusinessRecommendationStatus = (typeof BUSINESS_RECOMMENDATION_STATUSES)[number];

export const BUSINESS_DECISION_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "deferred",
  "closed",
] as const;
export type BusinessDecisionStatus = (typeof BUSINESS_DECISION_STATUSES)[number];

export const BUSINESS_ACTION_STATUSES = [
  "open",
  "in_progress",
  "blocked",
  "completed",
  "cancelled",
] as const;
export type BusinessActionStatus = (typeof BUSINESS_ACTION_STATUSES)[number];

export interface BusinessEvidenceRef {
  sourceType: string;
  sourceRef: string;
  title: string;
  excerpt?: string;
}

export interface BusinessKpi {
  id: string;
  tenantId: string;
  workspaceId: string;
  key: string;
  name: string;
  description?: string | null;
  category: BusinessKpiCategory;
  unit: string;
  value: number | null;
  target: number | null;
  warningThreshold: number | null;
  criticalThreshold: number | null;
  direction: "higher_is_better" | "lower_is_better";
  status: BusinessKpiStatus;
  measuredAt: string | null;
  sourceType: "manual" | "demo" | "derived" | "import";
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSignal {
  id: string;
  tenantId: string;
  workspaceId: string;
  type: string;
  severity: BusinessSignalSeverity;
  title: string;
  summary: string;
  sourceType: "kpi" | "manual" | "demo" | "derived";
  sourceRef?: string | null;
  kpiId?: string | null;
  evidence: BusinessEvidenceRef[];
  provenance: Record<string, unknown>;
  detectedAt: string;
  status: BusinessSignalStatus;
  businessImpact?: "low" | "medium" | "high" | "critical" | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRecommendation {
  id: string;
  tenantId: string;
  workspaceId: string;
  signalId?: string | null;
  title: string;
  recommendationText: string;
  rationaleSummary: string;
  expectedImpact?: string | null;
  confidence: "high" | "medium" | "low" | "unavailable";
  evidenceRefs: BusinessEvidenceRef[];
  status: BusinessRecommendationStatus;
  generatedBy: "deterministic_rule" | "platform_ai_director" | "user";
  advisoryOnly: true;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessDecision {
  id: string;
  tenantId: string;
  workspaceId: string;
  recommendationId?: string | null;
  statement: string;
  context?: string | null;
  ownerId?: string | null;
  status: BusinessDecisionStatus;
  decision?: "approve" | "reject" | "defer" | "close" | null;
  rationale?: string | null;
  decidedAt?: string | null;
  reviewAt?: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessAction {
  id: string;
  tenantId: string;
  workspaceId: string;
  decisionId?: string | null;
  title: string;
  ownerId?: string | null;
  dueDate?: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: BusinessActionStatus;
  completionEvidence: Record<string, unknown>;
  completedAt?: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BUSINESS_HEALTH_STATUS_WEIGHTS = {
  healthy: 4,
  watch: 3,
  warning: 1,
  critical: 0,
  unknown: null,
} as const;

export const BUSINESS_HEALTH_MIN_KNOWN_KPIS_FOR_SCORE = 3;

export interface BusinessHealthContributor {
  kpiId: string;
  key: string;
  name: string;
  status: BusinessKpiStatus;
  weight: number | null;
  value: number | null;
}

export interface BusinessHealthSnapshot {
  overallStatus: BusinessKpiStatus;
  score: number | null;
  contributingKpiCount: number;
  unknownCount: number;
  missingCount: number;
  primaryNegativeContributors: BusinessHealthContributor[];
  weights: typeof BUSINESS_HEALTH_STATUS_WEIGHTS;
  minKnownKpisForScore: typeof BUSINESS_HEALTH_MIN_KNOWN_KPIS_FOR_SCORE;
  method: "deterministic_kpi_weights_v1";
  disclaimer: string;
  asOf: string;
  containsDemoData: boolean;
}

export interface DeterministicDailyBrief {
  generatedAt: string;
  health: {
    overallStatus: BusinessKpiStatus;
    score: number | null;
    contributingKpiCount: number;
    unknownCount: number;
  };
  criticalSignals: Array<{ id: string; title: string; severity: BusinessSignalSeverity }>;
  majorKpiChanges: Array<{ id: string; name: string; status: BusinessKpiStatus }>;
  pendingDecisions: Array<{ id: string; statement: string }>;
  overdueOrBlockedActions: Array<{ id: string; title: string; status: BusinessActionStatus }>;
  containsDemoData: boolean;
  evidenceRefs: BusinessEvidenceRef[];
  domainSections: Array<{
    id: string;
    title: string;
    lines: string[];
    containsDemoData?: boolean;
  }>;
}

export interface AiDailyBriefNarrative {
  text: string;
  generatedAt: string;
  generatedBy: "platform_ai_director";
  modelProvenance?: string;
  evidenceRefs: BusinessEvidenceRef[];
  advisory: true;
  unavailableReason?: string;
}

export const BUSINESS_FINANCE_SOURCE_TYPES = [
  "xero",
  "myob",
  "quickbooks",
  "csv",
  "excel",
  "manual",
  "api",
  "demo",
] as const;
export type BusinessFinanceSourceType = (typeof BUSINESS_FINANCE_SOURCE_TYPES)[number];

export const BUSINESS_FINANCE_PERIOD_STATUSES = ["draft", "open", "closed", "superseded"] as const;
export type BusinessFinancePeriodStatus = (typeof BUSINESS_FINANCE_PERIOD_STATUSES)[number];

export const BUSINESS_FINANCE_KPI_KEYS = [
  "revenue",
  "revenue_growth",
  "cash_position",
  "gross_margin",
  "operating_margin",
  "overdue_receivables",
  "budget_variance",
  "cash_runway",
] as const;
export type BusinessFinanceKpiKey = (typeof BUSINESS_FINANCE_KPI_KEYS)[number];

export const BUSINESS_FINANCE_DEFAULT_THRESHOLDS = {
  grossMarginWarningBps: 1800,
  grossMarginCriticalBps: 1200,
  operatingMarginWarningBps: 800,
  operatingMarginCriticalBps: 300,
  cashRunwayWarningMonthHundredths: 600,
  cashRunwayCriticalMonthHundredths: 300,
  overdueReceivableRatioWarningBps: 2500,
  overdueReceivableRatioCriticalBps: 5000,
  budgetRevenueAdverseBps: 500,
  expenseIncreaseWarningBps: 1000,
  revenueDeclineWarningBps: 500,
} as const;

export interface MoneyJson {
  minor: string;
  currency: string;
  scale: number;
}

export interface BusinessFinancePeriod {
  id: string;
  tenantId: string;
  workspaceId: string;
  periodStart: string;
  periodEnd: string;
  currency: string;
  scale: number;
  status: BusinessFinancePeriodStatus;
  sourceType: BusinessFinanceSourceType;
  sourceRef?: string | null;
  sourceTimestamp?: string | null;
  provenance: Record<string, unknown>;
  syncedAt: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessFinanceSnapshot {
  id: string;
  tenantId: string;
  workspaceId: string;
  periodId: string;
  currency: string;
  scale: number;
  revenueMinor: string | null;
  costOfSalesMinor: string | null;
  operatingExpensesMinor: string | null;
  cashMinor: string | null;
  accountsReceivableMinor: string | null;
  accountsPayableMinor: string | null;
  budgetRevenueMinor: string | null;
  budgetExpensesMinor: string | null;
  budgetProfitMinor: string | null;
  sourceType: BusinessFinanceSourceType;
  sourceRef?: string | null;
  sourceTimestamp?: string | null;
  provenance: Record<string, unknown>;
  syncedAt: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessFinanceReceivableSnapshot {
  id: string;
  tenantId: string;
  workspaceId: string;
  periodId: string;
  currency: string;
  scale: number;
  outstandingMinor: string | null;
  overdueMinor: string | null;
  ageingCurrentMinor: string | null;
  ageing130Minor: string | null;
  ageing3160Minor: string | null;
  ageing6190Minor: string | null;
  ageing90PlusMinor: string | null;
  sourceType: BusinessFinanceSourceType;
  sourceRef?: string | null;
  sourceTimestamp?: string | null;
  provenance: Record<string, unknown>;
  syncedAt: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessFinanceMetrics {
  currency: string;
  scale: number;
  grossProfit: MoneyJson | null;
  grossMarginBps: string | null;
  operatingProfit: MoneyJson | null;
  operatingMarginBps: string | null;
  budgetRevenueVariance: MoneyJson | null;
  budgetRevenueVarianceBps: string | null;
  budgetExpenseVariance: MoneyJson | null;
  budgetProfitVariance: MoneyJson | null;
  receivablesOutstanding: MoneyJson | null;
  receivablesOverdue: MoneyJson | null;
  receivablesOverdueBps: string | null;
  ageing: {
    current: MoneyJson | null;
    days1to30: MoneyJson | null;
    days31to60: MoneyJson | null;
    days61to90: MoneyJson | null;
    days90Plus: MoneyJson | null;
  };
  cashRunwayMonthHundredths: string | null;
  unknownReasons: string[];
  method: "deterministic_finance_metrics_v1";
  disclaimer: string;
}

export interface BusinessFinanceForecastPoint {
  offsetMonths: number;
  kind: "observed" | "forecast";
  cash: MoneyJson | null;
}

export interface BusinessFinanceForecast {
  currency: string;
  scale: number;
  points: BusinessFinanceForecastPoint[];
  assumptions: string[];
  unknownReason?: string;
  method: "deterministic_cash_forecast_v1";
}

export interface BusinessFinanceIngestInput {
  periodStart: string;
  periodEnd: string;
  currency: string;
  scale?: number;
  status?: BusinessFinancePeriodStatus;
  sourceType: BusinessFinanceSourceType;
  sourceRef?: string;
  sourceTimestamp?: string;
  revenueMinor?: string | number | null;
  costOfSalesMinor?: string | number | null;
  operatingExpensesMinor?: string | number | null;
  cashMinor?: string | number | null;
  accountsReceivableMinor?: string | number | null;
  accountsPayableMinor?: string | number | null;
  budgetRevenueMinor?: string | number | null;
  budgetExpensesMinor?: string | number | null;
  budgetProfitMinor?: string | number | null;
  outstandingMinor?: string | number | null;
  overdueMinor?: string | number | null;
  ageingCurrentMinor?: string | number | null;
  ageing130Minor?: string | number | null;
  ageing3160Minor?: string | number | null;
  ageing6190Minor?: string | number | null;
  ageing90PlusMinor?: string | number | null;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export const BUSINESS_GROWTH_SOURCE_TYPES = [
  "manual",
  "referral",
  "website",
  "public_directory",
  "public_tender",
  "event",
  "campaign",
  "csv",
  "api",
  "demo",
  "future_connector",
] as const;
export type BusinessGrowthSourceType = (typeof BUSINESS_GROWTH_SOURCE_TYPES)[number];

export const BUSINESS_GROWTH_QUALIFICATION_STATUSES = [
  "unqualified",
  "researching",
  "qualified",
  "disqualified",
  "converted",
] as const;
export type BusinessGrowthQualificationStatus = (typeof BUSINESS_GROWTH_QUALIFICATION_STATUSES)[number];

export const BUSINESS_GROWTH_ENRICHMENT_STATUSES = ["none", "partial", "complete"] as const;
export type BusinessGrowthEnrichmentStatus = (typeof BUSINESS_GROWTH_ENRICHMENT_STATUSES)[number];

export const BUSINESS_GROWTH_OPPORTUNITY_STAGES = [
  "identified",
  "qualified",
  "discovery",
  "proposal_ready",
  "proposal",
  "negotiation",
  "won",
  "lost",
  "on_hold",
] as const;
export type BusinessGrowthOpportunityStage = (typeof BUSINESS_GROWTH_OPPORTUNITY_STAGES)[number];

export const BUSINESS_GROWTH_KPI_KEYS = [
  "new_leads",
  "qualified_leads",
  "lead_qualification_rate",
  "total_pipeline",
  "qualified_pipeline",
  "weighted_pipeline",
  "pipeline_coverage",
  "opportunities_won",
  "opportunities_lost",
  "win_rate",
] as const;
export type BusinessGrowthKpiKey = (typeof BUSINESS_GROWTH_KPI_KEYS)[number];

export const LEAD_SCORE_VERSION = "lead_score.v1" as const;
export const OPPORTUNITY_SCORE_VERSION = "opportunity_score.v1" as const;

export const BUSINESS_GROWTH_DEFAULT_THRESHOLDS = {
  qualifiedLeadWarningCount: 2,
  pipelineCoverageWarningBps: 8000,
  pipelineCoverageCriticalBps: 5000,
  qualificationRateWarningBps: 2000,
  winRateWarningBps: 2500,
  minWinRateSample: 3,
  stagnationDays: 30,
  concentrationWarningBps: 5000,
  highValueMinor: "50000000",
} as const;

export interface BusinessGrowthTargetProfile {
  industries: string[];
  geographies: string[];
  companySizeBands: string[];
  services: string[];
  targetMarkets: string[];
}

export interface BusinessGrowthEnrichedField {
  value: string;
  source: string;
  timestamp: string;
  confidence?: "high" | "medium" | "low" | "unknown";
}

export interface BusinessGrowthEnrichment {
  organisationName?: BusinessGrowthEnrichedField;
  industry?: BusinessGrowthEnrichedField;
  geography?: BusinessGrowthEnrichedField;
  website?: BusinessGrowthEnrichedField;
  companySizeBand?: BusinessGrowthEnrichedField;
  services?: BusinessGrowthEnrichedField;
  publicContext?: BusinessGrowthEnrichedField;
}

export interface BusinessGrowthScoreComponent {
  id: string;
  label: string;
  weight: number;
  score: number | null;
  evidence: string;
}

export interface BusinessGrowthLeadScore {
  total: number | null;
  components: BusinessGrowthScoreComponent[];
  missingInputs: string[];
  version: typeof LEAD_SCORE_VERSION;
  method: "deterministic_lead_score_v1";
}

export interface BusinessGrowthOpportunityScore {
  total: number | null;
  components: BusinessGrowthScoreComponent[];
  missingInputs: string[];
  version: typeof OPPORTUNITY_SCORE_VERSION;
  method: "deterministic_opportunity_score_v1";
  disclaimer: string;
}

export interface BusinessGrowthLead {
  id: string;
  tenantId: string;
  workspaceId: string;
  organisationName: string;
  website?: string | null;
  domain?: string | null;
  industry?: string | null;
  geography?: string | null;
  companySizeBand?: string | null;
  services?: string | null;
  targetMarket?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
  businessEmail?: string | null;
  evidenceOfNeed?: boolean | null;
  relationshipKind?: string | null;
  sourceType: BusinessGrowthSourceType;
  sourceRef?: string | null;
  sourceTimestamp?: string | null;
  provenance: Record<string, unknown>;
  enrichment: BusinessGrowthEnrichment;
  enrichmentStatus: BusinessGrowthEnrichmentStatus;
  qualificationStatus: BusinessGrowthQualificationStatus;
  score: number | null;
  scoreVersion: string;
  scoreDetail: BusinessGrowthLeadScore;
  owner?: string | null;
  suppressed: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessGrowthOpportunity {
  id: string;
  tenantId: string;
  workspaceId: string;
  leadId?: string | null;
  name: string;
  description?: string | null;
  stage: BusinessGrowthOpportunityStage;
  estimatedValueMinor: string | null;
  currency: string;
  scale: number;
  probabilityBps: string | null;
  expectedCloseDate?: string | null;
  expectedMarginBps: string | null;
  sourceType: BusinessGrowthSourceType;
  sourceRef?: string | null;
  owner?: string | null;
  nextAction?: string | null;
  strategicFit?: string | null;
  relationshipStrength?: string | null;
  deliveryCapability?: string | null;
  commercialRisk?: string | null;
  score: number | null;
  scoreVersion: string;
  scoreDetail: BusinessGrowthOpportunityScore;
  provenance: Record<string, unknown>;
  suppressed: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessGrowthMarketSegment {
  id: string;
  tenantId: string;
  workspaceId: string;
  segmentName: string;
  industry?: string | null;
  geography?: string | null;
  targetCustomerProfile?: string | null;
  attractiveness: "high" | "medium" | "low" | "unknown";
  status: "active" | "watch" | "inactive";
  evidence: BusinessEvidenceRef[];
  sourceType: BusinessGrowthSourceType;
  sourceRef?: string | null;
  sourceTimestamp?: string | null;
  provenance: Record<string, unknown>;
  suppressed: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessGrowthPipelineMetrics {
  currency: string | null;
  scale: number;
  totalPipeline: MoneyJson | null;
  qualifiedPipeline: MoneyJson | null;
  weightedPipeline: MoneyJson | null;
  pipelineByStage: Array<{ stage: BusinessGrowthOpportunityStage; count: number; value: MoneyJson | null }>;
  expectedCloseByPeriod: Array<{ period: string; value: MoneyJson | null; count: number }>;
  wonCount: number;
  lostCount: number;
  winRateBps: string | null;
  averageOpportunityValue: MoneyJson | null;
  openCount: number;
  qualifiedOpenCount: number;
  pipelineCoverageBps: string | null;
  unknownReasons: string[];
  method: "deterministic_pipeline_metrics_v1";
  disclaimer: string;
}

export interface BusinessGrowthLeadIngestInput {
  organisationName: string;
  website?: string | null;
  domain?: string | null;
  industry?: string | null;
  geography?: string | null;
  companySizeBand?: string | null;
  services?: string | null;
  targetMarket?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
  businessEmail?: string | null;
  evidenceOfNeed?: boolean | null;
  relationshipKind?: string | null;
  sourceType: BusinessGrowthSourceType;
  sourceRef?: string;
  sourceTimestamp?: string;
  enrichment?: BusinessGrowthEnrichment;
  qualificationStatus?: BusinessGrowthQualificationStatus;
  owner?: string | null;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
  suppressed?: boolean;
}

export interface BusinessGrowthOpportunityIngestInput {
  leadId?: string | null;
  name: string;
  description?: string | null;
  stage?: BusinessGrowthOpportunityStage;
  estimatedValueMinor?: string | number | null;
  currency: string;
  scale?: number;
  probabilityBps?: string | number | null;
  expectedCloseDate?: string | null;
  expectedMarginBps?: string | number | null;
  sourceType: BusinessGrowthSourceType;
  sourceRef?: string;
  owner?: string | null;
  nextAction?: string | null;
  strategicFit?: string | null;
  relationshipStrength?: string | null;
  deliveryCapability?: string | null;
  commercialRisk?: string | null;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
  suppressed?: boolean;
}

export interface BusinessGrowthMarketIngestInput {
  segmentName: string;
  industry?: string | null;
  geography?: string | null;
  targetCustomerProfile?: string | null;
  attractiveness?: "high" | "medium" | "low" | "unknown";
  status?: "active" | "watch" | "inactive";
  evidence?: BusinessEvidenceRef[];
  sourceType: BusinessGrowthSourceType;
  sourceRef?: string;
  sourceTimestamp?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}
