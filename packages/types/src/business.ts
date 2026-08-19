/**
 * Business OS contracts (BOS-0 foundation, BOS-1 Owner Command, BOS-2 Financial Intelligence,
 * BOS-3 Growth Intelligence, BOS-4 Revenue Execution, BOS-5 Customer Intelligence,
 * BOS-6 Profit Intelligence, BOS-7 Work & Operations, BOS-8 Decision & Action Intelligence,
 * BOS-9 Business Risk, BOS-10 Business Context Graph, BOS-11 AI Workforce).
 * Capabilities are identifiers — owner_command through ai_workforce are implemented.
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
  "business_os.revenue_execution.view",
  "business_os.revenue_execution.manage",
  "business_os.revenue_execution.approve",
  "business_os.customer_intelligence.view",
  "business_os.customer_intelligence.manage",
  "business_os.profit_intelligence.view",
  "business_os.profit_intelligence.manage",
  "business_os.work_operations.view",
  "business_os.work_operations.manage",
  "business_os.decision_action.view",
  "business_os.decision_action.manage",
  "business_os.decision_action.approve",
  "business_os.business_risk.view",
  "business_os.business_risk.manage",
  "business_os.business_risk.approve",
  "business_os.business_context.view",
  "business_os.business_context.manage",
  "business_os.ai_workforce.view",
  "business_os.ai_workforce.manage",
  "business_os.ai_workforce.run",
  "business_os.ai_workforce.approve",
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
  "business_os.decision.evidence_updated",
  "business_os.decision.option_created",
  "business_os.decision.brief_prepared",
  "business_os.decision.selected",
  "business_os.decision.outcome_recorded",
  "business_os.decision.outcome_reviewed",
  "business_os.decision.lesson_recorded",
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
  "business_os.revenue.engagement_created",
  "business_os.revenue.proposal_created",
  "business_os.revenue.proposal_updated",
  "business_os.revenue.proposal_ready",
  "business_os.revenue.pricing_evaluated",
  "business_os.revenue.pricing_exception",
  "business_os.revenue.bid_decision_requested",
  "business_os.revenue.bid_decision_completed",
  "business_os.revenue.draft_prepared",
  "business_os.customer.created",
  "business_os.customer.updated",
  "business_os.customer.converted",
  "business_os.customer.health_updated",
  "business_os.customer.risk_detected",
  "business_os.customer.financial_fact_ingested",
  "business_os.customer.signal_detected",
  "business_os.profit.fact_ingested",
  "business_os.profit.metrics_updated",
  "business_os.profit.leakage_detected",
  "business_os.profit.classification_updated",
  "business_os.operations.work_created",
  "business_os.operations.work_updated",
  "business_os.operations.work_completed",
  "business_os.operations.milestone_updated",
  "business_os.operations.cost_fact_ingested",
  "business_os.operations.capacity_updated",
  "business_os.operations.risk_detected",
  "business_os.operations.metrics_updated",
  "business_os.risk.created",
  "business_os.risk.assessed",
  "business_os.risk.residual_updated",
  "business_os.risk.control_updated",
  "business_os.risk.treatment_updated",
  "business_os.risk.outside_tolerance",
  "business_os.risk.obligation_overdue",
  "business_os.risk.review_due",
  "business_os.context.node_projected",
  "business_os.context.relationship_projected",
  "business_os.context.projection_failed",
  "business_os.context.rebuild_completed",
  "business_os.context.unresolved_reference_detected",
  "business_os.ai_workforce.agent_installed",
  "business_os.ai_workforce.agent_enabled",
  "business_os.ai_workforce.agent_suspended",
  "business_os.ai_workforce.agent_revoked",
  "business_os.ai_workforce.task_requested",
  "business_os.ai_workforce.run_started",
  "business_os.ai_workforce.approval_requested",
  "business_os.ai_workforce.execution_started",
  "business_os.ai_workforce.run_completed",
  "business_os.ai_workforce.run_failed",
  "business_os.ai_workforce.run_blocked",
  "business_os.ai_workforce.handoff_requested",
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
  "decision",
  "risk",
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

export const BUSINESS_REVENUE_ENGAGEMENT_STATUSES = [
  "draft",
  "ready_for_review",
  "approved",
  "active",
  "completed",
  "cancelled",
] as const;
export type BusinessRevenueEngagementStatus = (typeof BUSINESS_REVENUE_ENGAGEMENT_STATUSES)[number];

export const BUSINESS_REVENUE_COMMUNICATION_TYPES = [
  "email",
  "follow_up",
  "meeting_request",
  "call_brief",
  "internal_note",
] as const;
export type BusinessRevenueCommunicationType = (typeof BUSINESS_REVENUE_COMMUNICATION_TYPES)[number];

export const BUSINESS_REVENUE_APPROVAL_STATUSES = [
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "superseded",
] as const;
export type BusinessRevenueApprovalStatus = (typeof BUSINESS_REVENUE_APPROVAL_STATUSES)[number];

export const BUSINESS_REVENUE_PROPOSAL_STATUSES = [
  "draft",
  "internal_review",
  "pricing_review",
  "approval_required",
  "approved",
  "ready_to_send",
  "superseded",
  "withdrawn",
] as const;
export type BusinessRevenueProposalStatus = (typeof BUSINESS_REVENUE_PROPOSAL_STATUSES)[number];

export const BUSINESS_REVENUE_COMPLIANCE_STATUSES = [
  "satisfied",
  "partially_satisfied",
  "unsatisfied",
  "unknown",
  "not_applicable",
] as const;
export type BusinessRevenueComplianceStatus = (typeof BUSINESS_REVENUE_COMPLIANCE_STATUSES)[number];

export const BUSINESS_REVENUE_BID_RECOMMENDATIONS = [
  "pursue",
  "pursue_with_conditions",
  "review",
  "do_not_pursue",
  "insufficient_evidence",
] as const;
export type BusinessRevenueBidRecommendation = (typeof BUSINESS_REVENUE_BID_RECOMMENDATIONS)[number];

export const BUSINESS_REVENUE_KPI_KEYS = [
  "qualified_opportunities",
  "proposal_ready_opportunities",
  "proposals_in_progress",
  "proposal_turnaround_time",
  "opportunities_without_next_action",
  "bid_decisions_pending",
  "average_proposed_margin",
  "pricing_guardrail_breaches",
] as const;
export type BusinessRevenueKpiKey = (typeof BUSINESS_REVENUE_KPI_KEYS)[number];

export const PRICING_GUARDRAIL_VERSION = "pricing_guardrail.v1" as const;
export const BID_NOBID_VERSION = "bid_nobid.v1" as const;
export const BUSINESS_DEVELOPMENT_AGENT_SLUG = "business-development-agent" as const;

export const BUSINESS_AGENT_AUTHORITY_LEVELS = ["A0", "A1", "A2", "A3", "A4"] as const;
export type BusinessAgentAuthorityLevel = (typeof BUSINESS_AGENT_AUTHORITY_LEVELS)[number];

export const BUSINESS_REVENUE_DEFAULT_GUARDRAILS = {
  minTargetMarginBps: 2000,
  maxDiscountBpsWithoutApproval: 1000,
  minAbsoluteContributionMinor: "0",
  version: PRICING_GUARDRAIL_VERSION,
} as const;

export interface BusinessRevenueGuardrails {
  minTargetMarginBps: number;
  maxDiscountBpsWithoutApproval: number;
  minAbsoluteContributionMinor: string;
  currency?: string | null;
  scale: number;
  version: typeof PRICING_GUARDRAIL_VERSION;
}

export interface BusinessRevenueEngagementPlan {
  id: string;
  tenantId: string;
  workspaceId: string;
  opportunityId: string;
  objective: string;
  stakeholderSummary?: string | null;
  valueProposition?: string | null;
  keyNeeds?: string | null;
  proposedApproach?: string | null;
  nextAction?: string | null;
  owner?: string | null;
  dueAt?: string | null;
  status: BusinessRevenueEngagementStatus;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRevenueCommunicationDraft {
  id: string;
  tenantId: string;
  workspaceId: string;
  opportunityId: string;
  engagementPlanId?: string | null;
  type: BusinessRevenueCommunicationType;
  recipientContext?: string | null;
  subject: string;
  body: string;
  purpose: string;
  evidenceRefs: BusinessEvidenceRef[];
  generatedBy: "user" | "deterministic_rule" | "platform_ai_director";
  approvalStatus: BusinessRevenueApprovalStatus;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRevenueProposal {
  id: string;
  tenantId: string;
  workspaceId: string;
  opportunityId: string;
  proposalNumber: string;
  title: string;
  version: number;
  status: BusinessRevenueProposalStatus;
  scopeSummary?: string | null;
  customerRequirements?: string | null;
  assumptions?: string | null;
  exclusions?: string | null;
  deliverables?: string | null;
  commercialTermsSummary?: string | null;
  proposedPriceMinor: string | null;
  estimatedCostMinor: string | null;
  currency: string;
  scale: number;
  targetMarginBps: string | null;
  owner?: string | null;
  approvalDecisionId?: string | null;
  sourceType: string;
  sourceRef?: string | null;
  evidenceRefs: BusinessEvidenceRef[];
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRevenueProposalRequirement {
  id: string;
  tenantId: string;
  workspaceId: string;
  proposalId: string;
  requirement: string;
  sourceReference?: string | null;
  mandatory: boolean;
  response?: string | null;
  status: "open" | "drafted" | "reviewed" | "closed";
  complianceStatus: BusinessRevenueComplianceStatus;
  evidenceRefs: BusinessEvidenceRef[];
  generatedBy: "user" | "deterministic_rule" | "platform_ai_director";
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRevenuePricingScenario {
  id: string;
  tenantId: string;
  workspaceId: string;
  opportunityId: string;
  proposalId?: string | null;
  scenarioName: string;
  assumptions?: string | null;
  revenueMinor: string | null;
  estimatedDirectCostMinor: string | null;
  allocatedCostMinor: string | null;
  discountBps: string | null;
  riskAllowanceMinor: string | null;
  grossProfitMinor: string | null;
  grossMarginBps: string | null;
  currency: string;
  scale: number;
  exceptionDecisionId?: string | null;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRevenueBidEvaluation {
  id: string;
  tenantId: string;
  workspaceId: string;
  opportunityId: string;
  recommendation: BusinessRevenueBidRecommendation;
  components: BusinessGrowthScoreComponent[];
  missingInputs: string[];
  version: typeof BID_NOBID_VERSION;
  decisionId?: string | null;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  disclaimer: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRevenuePricingEvaluation {
  revenue: MoneyJson | null;
  estimatedDirectCost: MoneyJson | null;
  allocatedCost: MoneyJson | null;
  riskAllowance: MoneyJson | null;
  grossProfit: MoneyJson | null;
  contribution: MoneyJson | null;
  grossMarginBps: string | null;
  discountBps: string | null;
  targetMarginPrice: MoneyJson | null;
  violations: Array<{ ruleId: string; message: string; severity: "warning" | "critical" }>;
  requiresApproval: boolean;
  unknownReasons: string[];
  version: typeof PRICING_GUARDRAIL_VERSION;
  method: "deterministic_pricing_v1";
  disclaimer: string;
}

export interface BusinessRevenueBidInput {
  strategicFit?: string | null;
  opportunityScore?: number | null;
  estimatedValueMinor?: string | number | null;
  currency?: string | null;
  expectedMarginBps?: string | number | null;
  deliveryCapability?: string | null;
  expectedCloseDate?: string | null;
  relationshipStrength?: string | null;
  proposalEffort?: string | null;
  evidenceQuality?: string | null;
  commercialRisk?: string | null;
  asOf?: string;
}

export interface BusinessRevenueAgentPassport {
  id: typeof BUSINESS_DEVELOPMENT_AGENT_SLUG;
  name: "AI Business Development Agent";
  role: "AI Business Development Agent";
  purpose: string;
  authorityMax: "A2";
  allowedTools: string[];
  dataScope: string[];
  prohibitedActions: string[];
  approvalRequirements: string[];
  modelPolicy: {
    usesPlatformAiDirector: true;
    implementsOwnAiStack: false;
    noAutonomousApproval: true;
    externalWritesDisabled: true;
  };
  auditRequirements: string[];
  killSwitch: { disabled: boolean };
  generatedContentMustRetainProvenance: true;
}

export interface BusinessRevenueEngagementIngestInput {
  opportunityId: string;
  objective: string;
  stakeholderSummary?: string | null;
  valueProposition?: string | null;
  keyNeeds?: string | null;
  proposedApproach?: string | null;
  nextAction?: string | null;
  owner?: string | null;
  dueAt?: string | null;
  status?: BusinessRevenueEngagementStatus;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessRevenueDraftIngestInput {
  opportunityId: string;
  engagementPlanId?: string | null;
  type: BusinessRevenueCommunicationType;
  recipientContext?: string | null;
  subject: string;
  body: string;
  purpose: string;
  evidenceRefs?: BusinessEvidenceRef[];
  generatedBy?: BusinessRevenueCommunicationDraft["generatedBy"];
  approvalStatus?: BusinessRevenueApprovalStatus;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessRevenueProposalIngestInput {
  opportunityId: string;
  proposalNumber: string;
  title: string;
  version?: number;
  status?: BusinessRevenueProposalStatus;
  scopeSummary?: string | null;
  customerRequirements?: string | null;
  assumptions?: string | null;
  exclusions?: string | null;
  deliverables?: string | null;
  commercialTermsSummary?: string | null;
  proposedPriceMinor?: string | number | null;
  estimatedCostMinor?: string | number | null;
  currency: string;
  scale?: number;
  targetMarginBps?: string | number | null;
  owner?: string | null;
  evidenceRefs?: BusinessEvidenceRef[];
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessRevenueRequirementIngestInput {
  proposalId: string;
  requirement: string;
  sourceReference?: string | null;
  mandatory?: boolean;
  response?: string | null;
  status?: BusinessRevenueProposalRequirement["status"];
  complianceStatus?: BusinessRevenueComplianceStatus;
  evidenceRefs?: BusinessEvidenceRef[];
  generatedBy?: BusinessRevenueProposalRequirement["generatedBy"];
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessRevenuePricingIngestInput {
  opportunityId: string;
  proposalId?: string | null;
  scenarioName: string;
  assumptions?: string | null;
  revenueMinor?: string | number | null;
  estimatedDirectCostMinor?: string | number | null;
  allocatedCostMinor?: string | number | null;
  discountBps?: string | number | null;
  riskAllowanceMinor?: string | number | null;
  currency: string;
  scale?: number;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export const BUSINESS_CUSTOMER_STATUSES = [
  "prospect_converted",
  "active",
  "inactive",
  "at_risk",
  "former",
  "archived",
] as const;
export type BusinessCustomerStatus = (typeof BUSINESS_CUSTOMER_STATUSES)[number];

export const BUSINESS_CUSTOMER_LINK_ENTITY_TYPES = ["lead", "opportunity"] as const;
export type BusinessCustomerLinkEntityType = (typeof BUSINESS_CUSTOMER_LINK_ENTITY_TYPES)[number];

export const BUSINESS_CUSTOMER_HEALTH_STATUSES = [
  "healthy",
  "watch",
  "at_risk",
  "critical",
  "unknown",
] as const;
export type BusinessCustomerHealthStatus = (typeof BUSINESS_CUSTOMER_HEALTH_STATUSES)[number];

export const CUSTOMER_HEALTH_VERSION = "customer_health.v1" as const;
export const CUSTOMER_CONCENTRATION_VERSION = "customer_concentration.v1" as const;
export const CUSTOMER_PAYMENT_VERSION = "customer_payment.v1" as const;

export const BUSINESS_CUSTOMER_KPI_KEYS = [
  "active_customers",
  "new_customers",
  "customer_revenue",
  "top_customer_concentration",
  "top5_customer_concentration",
  "customers_at_risk",
  "overdue_customer_receivables",
  "customer_health_coverage",
] as const;
export type BusinessCustomerKpiKey = (typeof BUSINESS_CUSTOMER_KPI_KEYS)[number];

export const BUSINESS_CUSTOMER_DEFAULT_THRESHOLDS = {
  topCustomerConcentrationWarningBps: 4000,
  top5CustomerConcentrationWarningBps: 8000,
  overdueRatioWarningBps: 2500,
  inactivityDays: 60,
  healthMinKnownComponents: 3,
  newCustomerDays: 90,
} as const;

export interface BusinessCustomer {
  id: string;
  tenantId: string;
  workspaceId: string;
  organisationName: string;
  tradingName?: string | null;
  externalIds: Record<string, string>;
  website?: string | null;
  domain?: string | null;
  industry?: string | null;
  geography?: string | null;
  customerStatus: BusinessCustomerStatus;
  relationshipOwner?: string | null;
  acquiredAt?: string | null;
  sourceType: string;
  sourceRef?: string | null;
  sourceTimestamp?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface BusinessCustomerContact {
  id: string;
  tenantId: string;
  workspaceId: string;
  customerId: string;
  name: string;
  role?: string | null;
  businessEmail?: string | null;
  businessPhone?: string | null;
  relationshipType?: string | null;
  primary: boolean;
  suppressed: boolean;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessCustomerLink {
  id: string;
  tenantId: string;
  workspaceId: string;
  customerId: string;
  entityType: BusinessCustomerLinkEntityType;
  entityId: string;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessCustomerFinancialFact {
  id: string;
  tenantId: string;
  workspaceId: string;
  customerId: string;
  periodStart: string;
  periodEnd: string;
  revenueMinor: string | null;
  directCostMinor: string | null;
  grossContributionMinor: string | null;
  receivableOutstandingMinor: string | null;
  receivableOverdueMinor: string | null;
  ageingCurrentMinor: string | null;
  ageing130Minor: string | null;
  ageing3160Minor: string | null;
  ageing6190Minor: string | null;
  ageing90PlusMinor: string | null;
  dueDate?: string | null;
  paidDate?: string | null;
  currency: string;
  scale: number;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessCustomerHealthComponent {
  id: string;
  label: string;
  weight: number;
  status: BusinessCustomerHealthStatus;
  score: number | null;
  evidence: string;
}

export interface BusinessCustomerHealth {
  status: BusinessCustomerHealthStatus;
  score: number | null;
  components: BusinessCustomerHealthComponent[];
  missingComponents: string[];
  version: typeof CUSTOMER_HEALTH_VERSION;
  method: "deterministic_customer_health_v1";
  disclaimer: string;
}

export interface BusinessCustomerPaymentBehaviour {
  outstanding: MoneyJson | null;
  overdue: MoneyJson | null;
  overdueRatioBps: string | null;
  ageing: {
    current: MoneyJson | null;
    d1to30: MoneyJson | null;
    d31to60: MoneyJson | null;
    d61to90: MoneyJson | null;
    d90plus: MoneyJson | null;
  };
  averagePaymentDelayDays: number | null;
  unknownReasons: string[];
  version: typeof CUSTOMER_PAYMENT_VERSION;
  method: "deterministic_customer_payment_v1";
  disclaimer: string;
}

export interface BusinessCustomerConcentration {
  currency: string | null;
  periodEnd: string | null;
  totalRevenue: MoneyJson | null;
  shares: Array<{ customerId: string; organisationName: string; shareBps: string | null; revenue: MoneyJson | null }>;
  topCustomerShareBps: string | null;
  top3ShareBps: string | null;
  top5ShareBps: string | null;
  unknownReasons: string[];
  version: typeof CUSTOMER_CONCENTRATION_VERSION;
  method: "deterministic_customer_concentration_v1";
  disclaimer: string;
}

export interface BusinessCustomer360 {
  customer: BusinessCustomer;
  contacts: BusinessCustomerContact[];
  leads: BusinessGrowthLead[];
  opportunities: BusinessGrowthOpportunity[];
  engagements: BusinessRevenueEngagementPlan[];
  proposals: BusinessRevenueProposal[];
  pricing: BusinessRevenuePricingScenario[];
  financialFacts: BusinessCustomerFinancialFact[];
  payment: BusinessCustomerPaymentBehaviour;
  health: BusinessCustomerHealth;
  operations: BusinessCustomerOperationsEvidence;
  renewal: { available: false; reason: "renewal_intelligence_not_implemented"; contract: "renewal_intelligence" };
  expansion: { available: false; reason: "account_expansion_not_implemented"; contract: "account_expansion" };
  dataQuality: {
    sourceTypes: string[];
    freshness: string | null;
    missingFinancialAttribution: string[];
    unknownHealthComponents: string[];
    personalContactCount: number;
  };
}

export interface BusinessCustomerIngestInput {
  organisationName: string;
  tradingName?: string | null;
  externalIds?: Record<string, string>;
  website?: string | null;
  domain?: string | null;
  industry?: string | null;
  geography?: string | null;
  customerStatus?: BusinessCustomerStatus;
  relationshipOwner?: string | null;
  acquiredAt?: string | null;
  sourceType: string;
  sourceRef?: string;
  sourceTimestamp?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessCustomerContactIngestInput {
  customerId: string;
  name: string;
  role?: string | null;
  businessEmail?: string | null;
  businessPhone?: string | null;
  relationshipType?: string | null;
  primary?: boolean;
  suppressed?: boolean;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessCustomerFactIngestInput {
  customerId: string;
  periodStart: string;
  periodEnd: string;
  revenueMinor?: string | number | null;
  directCostMinor?: string | number | null;
  receivableOutstandingMinor?: string | number | null;
  receivableOverdueMinor?: string | number | null;
  ageingCurrentMinor?: string | number | null;
  ageing130Minor?: string | number | null;
  ageing3160Minor?: string | number | null;
  ageing6190Minor?: string | number | null;
  ageing90PlusMinor?: string | number | null;
  dueDate?: string | null;
  paidDate?: string | null;
  currency: string;
  scale?: number;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessCustomerSettings {
  tenantId: string;
  workspaceId: string;
  concentrationTop1ThresholdBps: number;
  concentrationTop5ThresholdBps: number;
  inactivityDays: number;
  staleDays: number;
  overdueIncreaseWarningBps: number;
  highValueInactivityMinor: string;
  provenance: Record<string, unknown> | null;
  updatedAt: string;
}

export interface CustomerRenewalIntelligenceContract {
  capability: "renewal_intelligence";
  implemented: false;
  inputs: readonly string[];
  note: string;
}

export interface CustomerAccountExpansionContract {
  capability: "account_expansion";
  implemented: false;
  inputs: readonly string[];
  note: string;
}

export const BUSINESS_PROFIT_DIMENSION_TYPES = [
  "customer",
  "project",
  "service",
  "product",
  "segment",
  "business_unit",
  "channel",
  "opportunity",
  "work",
] as const;
export type BusinessProfitDimensionType = (typeof BUSINESS_PROFIT_DIMENSION_TYPES)[number];

export const BUSINESS_PROFIT_VALUE_STATES = ["actual", "forecast", "proposed", "budget", "derived"] as const;
export type BusinessProfitValueState = (typeof BUSINESS_PROFIT_VALUE_STATES)[number];

export const BUSINESS_PROFIT_ATTRIBUTION_METHODS = [
  "source_direct",
  "customer_fact",
  "imported",
  "manual",
  "derived_from_known_components",
  "operations_fact",
  "unknown",
] as const;
export type BusinessProfitAttributionMethod = (typeof BUSINESS_PROFIT_ATTRIBUTION_METHODS)[number];

export const BUSINESS_PROFIT_CONFIDENCE = ["high", "medium", "low", "unknown"] as const;
export type BusinessProfitAttributionConfidence = (typeof BUSINESS_PROFIT_CONFIDENCE)[number];

export const BUSINESS_PROFIT_CLASSIFICATIONS = [
  "highly_profitable",
  "profitable",
  "low_margin",
  "break_even",
  "negative_contribution",
  "unknown",
] as const;
export type BusinessProfitClassification = (typeof BUSINESS_PROFIT_CLASSIFICATIONS)[number];

export const PROFIT_CLASSIFICATION_VERSION = "profit_classification.v1" as const;
export const PROFIT_METRICS_VERSION = "profit_metrics.v1" as const;
export const PROFIT_CONCENTRATION_VERSION = "profit_concentration.v1" as const;

export const BUSINESS_PROFIT_KPI_KEYS = [
  "total_contribution",
  "contribution_margin",
  "negative_contribution_count",
  "low_margin_customer_count",
  "top_customer_profit_share",
  "top5_profit_concentration",
  "profit_data_coverage",
  "margin_deterioration_count",
] as const;
export type BusinessProfitKpiKey = (typeof BUSINESS_PROFIT_KPI_KEYS)[number];

export const BUSINESS_PROFIT_DEFAULT_THRESHOLDS = {
  highlyProfitableMinBps: 2500,
  profitableMinBps: 1500,
  lowMarginMinBps: 200,
  breakEvenAbsBps: 200,
  highRevenueMinor: "50000000",
  lowMarginWarningBps: 1500,
  concentrationTop1WarningBps: 4000,
  concentrationTop5WarningBps: 8000,
  missingCostMajorRevenueMinor: "10000000",
  proposedRealizedDivergenceBps: 400,
  marginDeteriorationBps: 200,
} as const;

export interface BusinessProfitFact {
  id: string;
  tenantId: string;
  workspaceId: string;
  periodStart: string;
  periodEnd: string;
  dimensionType: BusinessProfitDimensionType;
  dimensionId?: string | null;
  dimensionRef?: string | null;
  dimensionName: string;
  revenueMinor: string | null;
  directCostMinor: string | null;
  allocatedCostMinor: string | null;
  contributionMinor: string | null;
  profitAfterAllocatedMinor: string | null;
  currency: string;
  scale: number;
  valueState: BusinessProfitValueState;
  attributionMethod: BusinessProfitAttributionMethod;
  attributionConfidence: BusinessProfitAttributionConfidence;
  sourceType: string;
  sourceRef?: string | null;
  sourceTimestamp?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfitMetrics {
  revenue: MoneyJson | null;
  directCost: MoneyJson | null;
  contribution: MoneyJson | null;
  contributionMarginBps: string | null;
  allocatedCost: MoneyJson | null;
  profitAfterAllocated: MoneyJson | null;
  profitMarginBps: string | null;
  unknownReasons: string[];
  attributionMethod: BusinessProfitAttributionMethod;
  valueState: BusinessProfitValueState;
  version: typeof PROFIT_METRICS_VERSION;
  method: "deterministic_profit_metrics_v1";
  disclaimer: string;
}

export interface BusinessProfitClassificationResult {
  classification: BusinessProfitClassification;
  contributionMarginBps: string | null;
  evidence: string;
  missingInputs: string[];
  version: typeof PROFIT_CLASSIFICATION_VERSION;
  method: "deterministic_profit_classification_v1";
  disclaimer: string;
}

export interface BusinessProfitRankRow {
  factId: string;
  dimensionType: BusinessProfitDimensionType;
  dimensionId?: string | null;
  dimensionName: string;
  revenue: MoneyJson | null;
  directCost: MoneyJson | null;
  contribution: MoneyJson | null;
  contributionMarginBps: string | null;
  classification: BusinessProfitClassification;
  attributionMethod: BusinessProfitAttributionMethod;
  valueState: BusinessProfitValueState;
  evidenceQuality: string[];
  rankingUnknownReason?: string | null;
}

export interface BusinessProfitConcentration {
  currency: string | null;
  periodEnd: string | null;
  totalContribution: MoneyJson | null;
  shares: Array<{
    dimensionType: BusinessProfitDimensionType;
    dimensionName: string;
    shareBps: string | null;
    contribution: MoneyJson | null;
  }>;
  topShareBps: string | null;
  top5ShareBps: string | null;
  unknownReasons: string[];
  version: typeof PROFIT_CONCENTRATION_VERSION;
  method: "deterministic_profit_concentration_v1";
  disclaimer: string;
}

export interface BusinessProfitCoverage {
  revenueWithKnownCost: MoneyJson | null;
  revenueWithoutKnownCost: MoneyJson | null;
  coverageBps: string | null;
  factCount: number;
  knownContributionCount: number;
  staleFactCount: number;
  attributionMethods: Record<string, number>;
  unknownReasons: string[];
}

export interface BusinessProfitTrendPoint {
  periodEnd: string;
  contribution: MoneyJson | null;
  contributionMarginBps: string | null;
  unknownReasons: string[];
}

export interface BusinessProfitTrend {
  dimensionType: BusinessProfitDimensionType;
  dimensionRef: string | null;
  dimensionName: string;
  points: BusinessProfitTrendPoint[];
  comparable: boolean;
  unknownReasons: string[];
}

export interface BusinessProfitLeakageSignal {
  ruleId: string;
  type: string;
  severity: BusinessSignalSeverity;
  title: string;
  summary: string;
  evidence: BusinessEvidenceRef[];
  provenance: Record<string, unknown>;
}

export interface BusinessProfitSummary {
  contribution: MoneyJson | null;
  contributionMarginBps: string | null;
  coverage: BusinessProfitCoverage;
  negativeContributionCount: number;
  lowMarginCount: number;
  concentration: BusinessProfitConcentration;
  ranking: BusinessProfitRankRow[];
  leakage: BusinessProfitLeakageSignal[];
  proposedCount: number;
  workOperations: { available: boolean; reason: string };
  containsDemoData: boolean;
  disclaimer: string;
  generatedAt: string;
}

export interface BusinessProfitCustomerView {
  customerId: string;
  organisationName: string;
  revenue: MoneyJson | null;
  contribution: MoneyJson | null;
  contributionMarginBps: string | null;
  classification: BusinessProfitClassification;
  paymentOverdueRatioBps: string | null;
  healthStatus: string | null;
  unknownReasons: string[];
}

export interface BusinessProfitFactIngestInput {
  periodStart: string;
  periodEnd: string;
  dimensionType: BusinessProfitDimensionType;
  dimensionId?: string | null;
  dimensionRef?: string | null;
  dimensionName: string;
  revenueMinor?: string | number | null;
  directCostMinor?: string | number | null;
  allocatedCostMinor?: string | number | null;
  currency: string;
  scale?: number;
  valueState?: BusinessProfitValueState;
  attributionMethod?: BusinessProfitAttributionMethod;
  attributionConfidence?: BusinessProfitAttributionConfidence;
  sourceType: string;
  sourceRef?: string;
  sourceTimestamp?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface WorkOperationsProfitContract {
  capability: "work_operations";
  implemented: boolean;
  inputs: readonly string[];
  note: string;
}

export const BUSINESS_WORK_TYPES = [
  "customer_job",
  "service_engagement",
  "internal_initiative",
  "business_project",
  "delivery_package",
] as const;
export type BusinessWorkType = (typeof BUSINESS_WORK_TYPES)[number];

export const BUSINESS_WORK_STATUSES = [
  "planned",
  "ready",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;
export type BusinessWorkStatus = (typeof BUSINESS_WORK_STATUSES)[number];

export const BUSINESS_WORK_MILESTONE_STATUSES = [
  "not_started",
  "in_progress",
  "blocked",
  "completed",
  "cancelled",
] as const;
export type BusinessWorkMilestoneStatus = (typeof BUSINESS_WORK_MILESTONE_STATUSES)[number];

export const BUSINESS_WORK_COST_TYPES = [
  "labour",
  "subcontractor",
  "material",
  "travel",
  "equipment",
  "other_direct",
] as const;
export type BusinessWorkCostType = (typeof BUSINESS_WORK_COST_TYPES)[number];

export const BUSINESS_WORK_VALUE_STATES = ["actual", "forecast", "budget", "derived"] as const;
export type BusinessWorkValueState = (typeof BUSINESS_WORK_VALUE_STATES)[number];

export const BUSINESS_WORK_CAPACITY_DIMENSIONS = ["team", "role", "work_item", "period"] as const;
export type BusinessWorkCapacityDimension = (typeof BUSINESS_WORK_CAPACITY_DIMENSIONS)[number];

export const BUSINESS_WORK_HEALTH_STATUSES = ["healthy", "watch", "at_risk", "critical", "unknown"] as const;
export type BusinessWorkHealthStatus = (typeof BUSINESS_WORK_HEALTH_STATUSES)[number];

export const WORK_HEALTH_VERSION = "work_health.v1" as const;
export const WORK_PROGRESS_VERSION = "work_progress.v1" as const;
export const WORK_COST_PROGRESS_VERSION = "operations.cost_progress_variance.v1" as const;

export const BUSINESS_OPERATIONS_KPI_KEYS = [
  "active_work",
  "overdue_work",
  "blocked_work",
  "milestone_on_time_rate",
  "work_completion_rate",
  "cost_progress_variance_count",
  "capacity_utilization",
  "overcommitted_capacity",
  "operational_data_coverage",
] as const;
export type BusinessOperationsKpiKey = (typeof BUSINESS_OPERATIONS_KPI_KEYS)[number];

export const BUSINESS_OPERATIONS_DEFAULT_THRESHOLDS = {
  costProgressVarianceBps: 1500,
  approachingFinishDays: 14,
  lowProgressBps: 4000,
  staleDays: 14,
  overcommitUtilizationBps: 10000,
} as const;

export interface BusinessWorkItem {
  id: string;
  tenantId: string;
  workspaceId: string;
  reference: string;
  name: string;
  description?: string | null;
  workType: BusinessWorkType;
  customerId?: string | null;
  linkedOpportunityId?: string | null;
  linkedProposalId?: string | null;
  linkedEngineeringProjectId?: string | null;
  linkedEngineeringProjectRef?: string | null;
  owner?: string | null;
  status: BusinessWorkStatus;
  plannedStart?: string | null;
  plannedFinish?: string | null;
  actualStart?: string | null;
  actualFinish?: string | null;
  progressBps: string | null;
  progressSource: "user_supplied" | "weighted_milestones" | "unknown";
  currency: string;
  scale: number;
  contractedValueMinor: string | null;
  budgetCostMinor: string | null;
  actualCostMinor: string | null;
  lastStatusAt: string;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessWorkMilestone {
  id: string;
  tenantId: string;
  workspaceId: string;
  workId: string;
  name: string;
  dueAt?: string | null;
  completedAt?: string | null;
  status: BusinessWorkMilestoneStatus;
  weightBps: string | null;
  owner?: string | null;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessWorkActionLink {
  id: string;
  tenantId: string;
  workspaceId: string;
  workId: string;
  actionId: string;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessWorkCostFact {
  id: string;
  tenantId: string;
  workspaceId: string;
  workId: string;
  periodStart: string;
  periodEnd: string;
  costType: BusinessWorkCostType;
  amountMinor: string;
  currency: string;
  scale: number;
  valueState: BusinessWorkValueState;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessWorkCapacityFact {
  id: string;
  tenantId: string;
  workspaceId: string;
  dimensionType: BusinessWorkCapacityDimension;
  dimensionRef: string;
  dimensionName: string;
  workId?: string | null;
  periodStart: string;
  periodEnd: string;
  availableHoursMinor: string | null;
  committedHoursMinor: string | null;
  utilizationBps: string | null;
  capacityStatus: "ok" | "watch" | "overcommitted" | "unknown";
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessWorkProgress {
  progressBps: string | null;
  method: "user_supplied" | "weighted_milestones" | "unknown";
  missingInputs: string[];
  version: typeof WORK_PROGRESS_VERSION;
  disclaimer: string;
}

export interface BusinessWorkHealth {
  status: BusinessWorkHealthStatus;
  score: number | null;
  components: Array<{
    id: string;
    label: string;
    status: BusinessWorkHealthStatus;
    score: number | null;
    evidence: string;
  }>;
  missingComponents: string[];
  version: typeof WORK_HEALTH_VERSION;
  method: "deterministic_work_health_v1";
  disclaimer: string;
}

export interface BusinessWorkCostProgress {
  actualCostBpsOfBudget: string | null;
  progressBps: string | null;
  varianceBps: string | null;
  signal: boolean;
  unknownReasons: string[];
  version: typeof WORK_COST_PROGRESS_VERSION;
  method: "deterministic_cost_progress_v1";
  disclaimer: string;
}

export interface BusinessCustomerOperationsEvidence {
  available: boolean;
  reason?: string;
  activeWorkCount?: number;
  completedWorkCount?: number;
  atRiskWorkCount?: number;
  work?: Array<{
    id: string;
    reference: string;
    name: string;
    status: BusinessWorkStatus;
    progressBps: string | null;
    health: BusinessWorkHealthStatus;
    plannedFinish: string | null;
  }>;
  signalTypes?: string[];
}

export interface BusinessWorkItemIngestInput {
  reference: string;
  name: string;
  description?: string | null;
  workType: BusinessWorkType;
  customerId?: string | null;
  linkedOpportunityId?: string | null;
  linkedProposalId?: string | null;
  linkedEngineeringProjectId?: string | null;
  linkedEngineeringProjectRef?: string | null;
  owner?: string | null;
  status?: BusinessWorkStatus;
  plannedStart?: string | null;
  plannedFinish?: string | null;
  actualStart?: string | null;
  actualFinish?: string | null;
  progressBps?: string | number | null;
  currency: string;
  scale?: number;
  contractedValueMinor?: string | number | null;
  budgetCostMinor?: string | number | null;
  sourceType: string;
  sourceRef?: string;
  lastStatusAt?: string | null;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessWorkMilestoneIngestInput {
  workId: string;
  name: string;
  dueAt?: string | null;
  completedAt?: string | null;
  status?: BusinessWorkMilestoneStatus;
  weightBps?: string | number | null;
  owner?: string | null;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessWorkCostIngestInput {
  workId: string;
  periodStart: string;
  periodEnd: string;
  costType: BusinessWorkCostType;
  amountMinor: string | number;
  currency: string;
  scale?: number;
  valueState?: BusinessWorkValueState;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessWorkCapacityIngestInput {
  dimensionType: BusinessWorkCapacityDimension;
  dimensionRef: string;
  dimensionName: string;
  workId?: string | null;
  periodStart: string;
  periodEnd: string;
  availableHoursMinor?: string | number | null;
  committedHoursMinor?: string | number | null;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessWorkActionLinkIngestInput {
  workId: string;
  actionId: string;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface EngineeringProjectLinkContract {
  capability: "engineering_project_link";
  implemented: true;
  mode: "stable_reference";
  writesEngineeringOs: false;
  readsEngineeringTables: false;
  note: string;
}

export interface DecisionActionIntelligenceContract {
  capability: "decision_action";
  implemented: true;
  inputs: readonly string[];
  reuses: readonly ["business_os_signals", "business_os_recommendations", "business_os_decisions", "business_os_actions"];
  advisoryOnly: true;
  noAutonomousApproval: true;
  note: string;
}

export interface BusinessRiskContract {
  capability: "business_risk";
  implemented: true;
  inputs: readonly string[];
  reuses: readonly [
    "business_os_signals",
    "business_os_recommendations",
    "business_os_kpis",
    "business_os_decisions",
    "business_os_actions",
  ];
  threatFocused: true;
  opportunityRiskDeferred: true;
  residualRequiresEvidencedControls: true;
  controlEffectivenessRequiresEvidence: true;
  treatmentsReuseBosActions: true;
  riskAcceptanceHumanOnly: true;
  noAutonomousRiskAcceptance: true;
  noStatutoryComplianceClaims: true;
  noLegalAdvice: true;
  noExternalRegulatorWrites: true;
  implementsOwnAiStack: false;
  note: string;
}

export interface BusinessContextGraphContract {
  capability: "business_context";
  implemented: true;
  ontologyVersion: "business_context_graph.v1";
  reuses: readonly [
    "platform_kernel_knowledge_graph",
    "platform_kernel_event_bus",
    "platform_kernel_ai_director",
  ];
  projectionOnly: true;
  noSecondGraphRuntime: true;
  noSecondVectorStore: true;
  noSecondSearchStack: true;
  noSecondMemoryService: true;
  adjacencyIsNotCausation: true;
  engineeringOsReferenceOnly: true;
  implementsOwnAiStack: false;
  note: string;
}

export interface AiWorkforceContract {
  capability: "ai_workforce";
  implemented: true;
  reuses: readonly [
    "platform_kernel_agent_registry",
    "platform_kernel_ai_director",
    "platform_intelligence_policy_engine",
    "platform_intelligence_tool_registry",
    "platform_kernel_workflow_engine",
    "platform_kernel_event_bus",
    "platform_kernel_memory",
    "platform_kernel_knowledge_graph",
  ];
  implementsOwnAiStack: false;
  duplicateAgentRuntimeDetected: false;
  autonomousApprovalEnabled: false;
  directProviderAccess: false;
  unrestrictedGraphAccess: false;
  canonicalDomainMutationBypass: false;
  crossTenantAgentAccess: false;
  note: string;
}

export const BUSINESS_WORKFORCE_AUTHORITY_CLASSES = [
  "observe",
  "recommend",
  "prepare",
  "request_execution",
  "execute_with_approval",
] as const;
export type BusinessWorkforceAuthorityClass = (typeof BUSINESS_WORKFORCE_AUTHORITY_CLASSES)[number];

export const BUSINESS_WORKFORCE_INSTALL_STATUSES = [
  "installed",
  "enabled",
  "suspended",
  "revoked",
] as const;
export type BusinessWorkforceInstallStatus = (typeof BUSINESS_WORKFORCE_INSTALL_STATUSES)[number];

export const BUSINESS_WORKFORCE_RUN_STATES = [
  "requested",
  "policy_check",
  "context_assembled",
  "planned",
  "awaiting_approval",
  "approved",
  "executing",
  "completed",
  "failed",
  "blocked",
  "cancelled",
] as const;
export type BusinessWorkforceRunState = (typeof BUSINESS_WORKFORCE_RUN_STATES)[number];

export const BUSINESS_WORKFORCE_APPROVAL_DECISIONS = ["pending", "approved", "rejected"] as const;
export type BusinessWorkforceApprovalDecision = (typeof BUSINESS_WORKFORCE_APPROVAL_DECISIONS)[number];

export const BUSINESS_WORKFORCE_READ_TOOLS = [
  "bos.context.search",
  "bos.context.entity",
  "bos.context.neighbourhood",
  "bos.context.explain",
] as const;
export type BusinessWorkforceReadTool = (typeof BUSINESS_WORKFORCE_READ_TOOLS)[number];

export const BUSINESS_WORKFORCE_FORBIDDEN_TOOLS = [
  "bos.canonical.write",
  "bos.external.send",
  "bos.external.submit",
  "bos.engineering.mutate",
  "bos.finance.commit",
  "bos.pricing.commit",
  "bos.proposal.submit",
  "bos.customer.mutate",
  "direct.model.provider",
] as const;

export type BusinessWorkforceAgentContextState =
  | "ok"
  | "insufficient_evidence"
  | "needs_human_review";

export interface BusinessWorkforceAgentContext {
  state: BusinessWorkforceAgentContextState;
  reasons: string[];
  assembly: BusinessContextAiAssembly | null;
  adjacencyIsNotCausation: true;
  provenancePreserved: true;
}

export interface BusinessWorkforceExplanation {
  evidence: Array<{ sourceRef: string; provenance: Record<string, unknown>; freshness: string | null }>;
  derivedRecommendation: string;
  assumption: string[];
  missingEvidence: string[];
  chainOfThoughtExposed: false;
}

export const BUSINESS_DECISION_DOMAINS = [
  "finance",
  "growth",
  "revenue",
  "customer",
  "profit",
  "operations",
  "signal",
  "kpi",
  "document",
  "risk",
  "general",
] as const;
export type BusinessDecisionDomain = (typeof BUSINESS_DECISION_DOMAINS)[number];

export const BUSINESS_DECISION_URGENCIES = ["low", "normal", "high", "urgent", "critical"] as const;
export type BusinessDecisionUrgency = (typeof BUSINESS_DECISION_URGENCIES)[number];

export const BUSINESS_DECISION_PRIORITIES = ["low", "normal", "high", "urgent", "critical", "unknown"] as const;
export type BusinessDecisionPriorityLevel = (typeof BUSINESS_DECISION_PRIORITIES)[number];

export const BUSINESS_DECISION_OPTION_STATUSES = [
  "candidate",
  "preferred",
  "rejected",
  "selected",
  "superseded",
] as const;
export type BusinessDecisionOptionStatus = (typeof BUSINESS_DECISION_OPTION_STATUSES)[number];

export const BUSINESS_DECISION_IMPACT_DIMENSIONS = [
  "financial",
  "revenue",
  "customer",
  "operational",
  "capacity",
  "profit",
  "risk",
  "timing",
] as const;
export type BusinessDecisionImpactDimension = (typeof BUSINESS_DECISION_IMPACT_DIMENSIONS)[number];

export const BUSINESS_DECISION_QUANTIFICATIONS = ["quantitative", "qualitative", "unknown"] as const;
export type BusinessDecisionQuantification = (typeof BUSINESS_DECISION_QUANTIFICATIONS)[number];

export const BUSINESS_DECISION_REVERSIBILITIES = [
  "reversible",
  "partially_reversible",
  "irreversible",
  "unknown",
] as const;
export type BusinessDecisionReversibility = (typeof BUSINESS_DECISION_REVERSIBILITIES)[number];

export const BUSINESS_DECISION_OUTCOME_STATUSES = [
  "pending",
  "measuring",
  "achieved",
  "partially_achieved",
  "not_achieved",
  "inconclusive",
  "cancelled",
] as const;
export type BusinessDecisionOutcomeStatus = (typeof BUSINESS_DECISION_OUTCOME_STATUSES)[number];

export const BUSINESS_DECISION_EFFECTIVENESS = [
  "effective",
  "partially_effective",
  "ineffective",
  "inconclusive",
  "unknown",
] as const;
export type BusinessDecisionEffectivenessStatus = (typeof BUSINESS_DECISION_EFFECTIVENESS)[number];

export const BUSINESS_DECISION_LESSON_STATUSES = ["draft", "proposed_ai", "accepted", "rejected"] as const;
export type BusinessDecisionLessonStatus = (typeof BUSINESS_DECISION_LESSON_STATUSES)[number];

export const BUSINESS_DECISION_EVIDENCE_QUALITY = ["high", "medium", "low", "unavailable"] as const;
export type BusinessDecisionEvidenceQuality = (typeof BUSINESS_DECISION_EVIDENCE_QUALITY)[number];

export const BUSINESS_DECISION_GENERATED_BY = [
  "deterministic_rule",
  "platform_ai_director",
  "user",
] as const;
export type BusinessDecisionGeneratedBy = (typeof BUSINESS_DECISION_GENERATED_BY)[number];

export const DECISION_PRIORITY_VERSION = "decision_priority.v1" as const;
export const OPTION_COMPARISON_VERSION = "option_comparison.v1" as const;
export const DECISION_BRIEF_VERSION = "decision_brief.v1" as const;
export const DECISION_EFFECTIVENESS_VERSION = "decision_effectiveness.v1" as const;
export const OPTION_RANKING_VERSION = "option_ranking.v1" as const;

export const BUSINESS_DECISION_KPI_KEYS = [
  "pending_decisions",
  "overdue_decisions",
  "critical_decisions",
  "decisions_without_evidence",
  "decision_cycle_time",
  "action_completion_rate",
  "overdue_actions",
  "blocked_actions",
  "outcome_measurement_coverage",
  "decision_effectiveness_coverage",
] as const;
export type BusinessDecisionKpiKey = (typeof BUSINESS_DECISION_KPI_KEYS)[number];

export const BUSINESS_RISK_KPI_KEYS = [
  "open_high_risks",
  "extreme_residual_risks",
  "overdue_risk_reviews",
  "risks_without_owner",
  "ineffective_controls",
  "untested_controls",
  "overdue_obligations",
  "treatment_actions_overdue",
  "risks_outside_tolerance",
  "risk_data_coverage",
] as const;
export type BusinessRiskKpiKey = (typeof BUSINESS_RISK_KPI_KEYS)[number];

export const BUSINESS_DECISION_DEFAULT_THRESHOLDS = {
  overdueGraceDays: 0,
  criticalFinancialImpactMinor: 10_000_000,
  highFinancialImpactMinor: 1_000_000,
  materialVarianceBps: 2000,
  outcomeReviewOverdueDays: 0,
  ineffectiveRepeatSample: 3,
  comparisonScoringEnabled: false,
} as const;

export interface BusinessDecisionContext {
  id: string;
  tenantId: string;
  workspaceId: string;
  decisionId: string;
  question: string;
  problemStatement?: string | null;
  originatingSignalId?: string | null;
  originatingRecommendationId?: string | null;
  domain: BusinessDecisionDomain;
  ownerLabel?: string | null;
  stakeholders: string[];
  urgency: BusinessDecisionUrgency;
  dueAt?: string | null;
  evidenceCompletenessBps: string | null;
  assumptions: string[];
  constraints: string[];
  selectedOptionId?: string | null;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessDecisionEvidenceItem {
  id: string;
  tenantId: string;
  workspaceId: string;
  decisionId: string;
  optionId?: string | null;
  sourceType: string;
  sourceDomain: BusinessDecisionDomain;
  sourceId?: string | null;
  sourceRef: string;
  summary: string;
  valueState: "known" | "unknown" | "qualitative";
  valueText?: string | null;
  valueMinor?: string | null;
  currency?: string | null;
  scale?: number | null;
  unit?: string | null;
  observedAt?: string | null;
  linkedAt: string;
  freshness?: string | null;
  confidence: BusinessDecisionEvidenceQuality;
  evidenceQuality: BusinessDecisionEvidenceQuality;
  snapshot: Record<string, unknown>;
  generatedBy: BusinessDecisionGeneratedBy;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessDecisionOption {
  id: string;
  tenantId: string;
  workspaceId: string;
  decisionId: string;
  title: string;
  description?: string | null;
  status: BusinessDecisionOptionStatus;
  assumptions: string[];
  constraints: string[];
  expectedBenefits?: string | null;
  expectedCosts?: string | null;
  expectedRisks?: string | null;
  reversibility: BusinessDecisionReversibility;
  generatedBy: BusinessDecisionGeneratedBy;
  aiGenerated: boolean;
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessDecisionImpact {
  id: string;
  tenantId: string;
  workspaceId: string;
  optionId: string;
  dimension: BusinessDecisionImpactDimension;
  quantification: BusinessDecisionQuantification;
  valueMinor?: string | null;
  currency?: string | null;
  scale?: number | null;
  unit?: string | null;
  period?: string | null;
  qualitativeLabel?: string | null;
  qualitativeOnly: boolean;
  sourceDomain?: string | null;
  sourceRef?: string | null;
  ruleVersion?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessDecisionOutcome {
  id: string;
  tenantId: string;
  workspaceId: string;
  decisionId: string;
  selectedOptionId?: string | null;
  expectedOutcome?: string | null;
  expectedMetricKey?: string | null;
  expectedValue?: string | null;
  expectedUnit?: string | null;
  expectedCurrency?: string | null;
  expectedScale?: number | null;
  expectedPeriod?: string | null;
  actualOutcome?: string | null;
  actualMetricKey?: string | null;
  actualValue?: string | null;
  actualUnit?: string | null;
  actualCurrency?: string | null;
  actualScale?: number | null;
  actualPeriod?: string | null;
  measurementDate?: string | null;
  measurementWindowStart?: string | null;
  measurementWindowEnd?: string | null;
  status: BusinessDecisionOutcomeStatus;
  varianceValue?: string | null;
  varianceState: "computed" | "unknown";
  explanation?: string | null;
  evidenceRefs: BusinessEvidenceRef[];
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessDecisionLesson {
  id: string;
  tenantId: string;
  workspaceId: string;
  decisionId: string;
  selectedOptionId?: string | null;
  assumptionsSnapshot: string[];
  evidenceSnapshot: Record<string, unknown>;
  expectedOutcome?: string | null;
  actualOutcome?: string | null;
  lessonText: string;
  draftSource: BusinessDecisionGeneratedBy;
  status: BusinessDecisionLessonStatus;
  acceptedAt?: string | null;
  acceptedBy?: string | null;
  memoryId?: string | null;
  reviewStatus: "pending" | "reviewed" | "not_required";
  sourceType: string;
  sourceRef?: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessDecisionPriorityComponent {
  id: string;
  label: string;
  value: string | null;
  contribution: BusinessDecisionPriorityLevel | "none";
  known: boolean;
}

export interface BusinessDecisionPriorityResult {
  priority: BusinessDecisionPriorityLevel;
  components: BusinessDecisionPriorityComponent[];
  evidence: BusinessEvidenceRef[];
  missingInputs: string[];
  version: typeof DECISION_PRIORITY_VERSION;
  inspectable: true;
  authoritativeAi: false;
}

export interface BusinessDecisionComparisonOption {
  optionId: string;
  title: string;
  status: BusinessDecisionOptionStatus;
  aiGenerated: boolean;
  reversibility: BusinessDecisionReversibility;
  advantages: string[];
  disadvantages: string[];
  constraints: string[];
  requiredApprovals: string[];
  knownImpacts: Partial<Record<BusinessDecisionImpactDimension, string>>;
  unknownImpacts: BusinessDecisionImpactDimension[];
  evidenceRefs: BusinessEvidenceRef[];
}

export interface BusinessDecisionComparison {
  version: typeof OPTION_COMPARISON_VERSION;
  scoringEnabled: boolean;
  scoringDisclaimer: string;
  rankingVersion: typeof OPTION_RANKING_VERSION | null;
  ranking: Array<{ optionId: string; score: number; components: Record<string, number> }> | null;
  objectiveTruth: false;
  options: BusinessDecisionComparisonOption[];
  preferredOptionId?: string | null;
  recommendationText: string;
}

export interface BusinessDecisionBrief {
  version: typeof DECISION_BRIEF_VERSION;
  decisionId: string;
  decisionQuestion: string;
  currentSituation: string;
  keyEvidence: BusinessEvidenceRef[];
  missingEvidence: string[];
  options: Array<{ id: string; title: string; status: BusinessDecisionOptionStatus; aiGenerated: boolean }>;
  impactComparison: BusinessDecisionComparison;
  recommendation: {
    text: string;
    preferredOptionId?: string | null;
    evidenceRefs: BusinessEvidenceRef[];
    assumptions: string[];
    knownImpacts: string[];
    unknownImpacts: string[];
    ruleVersion: string;
    generatedBy: BusinessDecisionGeneratedBy;
    timestamp: string;
    advisoryOnly: true;
  };
  assumptions: string[];
  constraints: string[];
  dueAt?: string | null;
  reviewAt?: string | null;
  generatedBy: "deterministic_rule";
  requiresAi: false;
}

export interface BusinessDecisionEffectiveness {
  status: BusinessDecisionEffectivenessStatus;
  expectedOutcome?: string | null;
  actualOutcome?: string | null;
  evidence: BusinessEvidenceRef[];
  measurementCoverage: "full" | "partial" | "none";
  version: typeof DECISION_EFFECTIVENESS_VERSION;
  authoritativeAi: false;
}

export interface BusinessDecisionQueueItem {
  id: string;
  statement: string;
  question: string;
  domain: BusinessDecisionDomain | "unknown";
  priority: BusinessDecisionPriorityResult;
  ownerId?: string | null;
  ownerLabel?: string | null;
  dueAt?: string | null;
  originatingSignalId?: string | null;
  evidenceCompletenessBps: string | null;
  status: BusinessDecisionStatus;
  isDemo: boolean;
}

export interface BusinessActionIntelligence {
  overdue: BusinessAction[];
  blocked: BusinessAction[];
  highPriority: BusinessAction[];
  decisionCritical: BusinessAction[];
  completionLag: Array<{ actionId: string; dueDate: string | null; completedAt: string | null; lagDays: number | null }>;
  unresolvedDependencies: Array<{ actionId: string; title: string; blocker: string }>;
}

export interface BusinessDecisionContextInput {
  decisionId: string;
  question: string;
  problemStatement?: string | null;
  originatingSignalId?: string | null;
  originatingRecommendationId?: string | null;
  domain?: BusinessDecisionDomain;
  ownerLabel?: string | null;
  stakeholders?: string[];
  urgency?: BusinessDecisionUrgency;
  dueAt?: string | null;
  assumptions?: string[];
  constraints?: string[];
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessDecisionEvidenceInput {
  decisionId: string;
  optionId?: string | null;
  sourceType: string;
  sourceDomain: BusinessDecisionDomain;
  sourceId?: string | null;
  sourceRef: string;
  summary: string;
  valueState?: "known" | "unknown" | "qualitative";
  valueText?: string | null;
  valueMinor?: string | number | null;
  currency?: string | null;
  scale?: number | null;
  unit?: string | null;
  observedAt?: string | null;
  freshness?: string | null;
  confidence?: BusinessDecisionEvidenceQuality;
  evidenceQuality?: BusinessDecisionEvidenceQuality;
  snapshot?: Record<string, unknown>;
  generatedBy?: BusinessDecisionGeneratedBy;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessDecisionOptionInput {
  decisionId: string;
  title: string;
  description?: string | null;
  status?: BusinessDecisionOptionStatus;
  assumptions?: string[];
  constraints?: string[];
  expectedBenefits?: string | null;
  expectedCosts?: string | null;
  expectedRisks?: string | null;
  reversibility?: BusinessDecisionReversibility;
  generatedBy?: BusinessDecisionGeneratedBy;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessDecisionImpactInput {
  optionId: string;
  dimension: BusinessDecisionImpactDimension;
  quantification?: BusinessDecisionQuantification;
  valueMinor?: string | number | null;
  currency?: string | null;
  scale?: number | null;
  unit?: string | null;
  period?: string | null;
  qualitativeLabel?: string | null;
  sourceDomain?: string | null;
  sourceRef?: string | null;
  ruleVersion?: string | null;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessDecisionOutcomeInput {
  decisionId: string;
  selectedOptionId?: string | null;
  expectedOutcome?: string | null;
  expectedMetricKey?: string | null;
  expectedValue?: string | number | null;
  expectedUnit?: string | null;
  expectedCurrency?: string | null;
  expectedScale?: number | null;
  expectedPeriod?: string | null;
  actualOutcome?: string | null;
  actualMetricKey?: string | null;
  actualValue?: string | number | null;
  actualUnit?: string | null;
  actualCurrency?: string | null;
  actualScale?: number | null;
  actualPeriod?: string | null;
  measurementDate?: string | null;
  measurementWindowStart?: string | null;
  measurementWindowEnd?: string | null;
  status?: BusinessDecisionOutcomeStatus;
  explanation?: string | null;
  evidenceRefs?: BusinessEvidenceRef[];
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessDecisionLessonInput {
  decisionId: string;
  selectedOptionId?: string | null;
  assumptionsSnapshot?: string[];
  evidenceSnapshot?: Record<string, unknown>;
  expectedOutcome?: string | null;
  actualOutcome?: string | null;
  lessonText: string;
  draftSource?: BusinessDecisionGeneratedBy;
  sourceType: string;
  sourceRef?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export const BUSINESS_RISK_STATUSES = [
  "identified",
  "assessing",
  "open",
  "treating",
  "monitoring",
  "accepted",
  "closed",
  "archived",
] as const;
export type BusinessRiskStatus = (typeof BUSINESS_RISK_STATUSES)[number];

export const BUSINESS_RISK_CATEGORIES = [
  "strategic",
  "financial",
  "customer",
  "commercial",
  "operational",
  "workforce",
  "supplier",
  "compliance",
  "legal",
  "cyber",
  "technology",
  "reputation",
  "continuity",
  "other",
] as const;
export type BusinessRiskCategory = (typeof BUSINESS_RISK_CATEGORIES)[number];

export const BUSINESS_RISK_NATURES = ["threat"] as const;
export type BusinessRiskNature = (typeof BUSINESS_RISK_NATURES)[number];

export const BUSINESS_RISK_LIKELIHOODS = [
  "rare",
  "unlikely",
  "possible",
  "likely",
  "almost_certain",
  "unknown",
] as const;
export type BusinessRiskLikelihood = (typeof BUSINESS_RISK_LIKELIHOODS)[number];

export const BUSINESS_RISK_IMPACTS = [
  "insignificant",
  "minor",
  "moderate",
  "major",
  "severe",
  "unknown",
] as const;
export type BusinessRiskImpact = (typeof BUSINESS_RISK_IMPACTS)[number];

export const BUSINESS_RISK_LEVELS = ["low", "moderate", "high", "extreme", "unknown"] as const;
export type BusinessRiskLevel = (typeof BUSINESS_RISK_LEVELS)[number];

export const BUSINESS_RISK_CONTROL_TYPES = [
  "preventive",
  "detective",
  "corrective",
  "directive",
] as const;
export type BusinessRiskControlType = (typeof BUSINESS_RISK_CONTROL_TYPES)[number];

export const BUSINESS_RISK_CONTROL_STATUSES = [
  "planned",
  "implemented",
  "operating",
  "ineffective",
  "suspended",
  "retired",
] as const;
export type BusinessRiskControlStatus = (typeof BUSINESS_RISK_CONTROL_STATUSES)[number];

export const BUSINESS_RISK_CONTROL_EFFECTIVENESS = [
  "effective",
  "partially_effective",
  "ineffective",
  "untested",
  "unknown",
] as const;
export type BusinessRiskControlEffectiveness = (typeof BUSINESS_RISK_CONTROL_EFFECTIVENESS)[number];

export const BUSINESS_RISK_TREATMENT_STRATEGIES = [
  "avoid",
  "reduce",
  "transfer",
  "accept",
  "exploit",
  "monitor",
] as const;
export type BusinessRiskTreatmentStrategy = (typeof BUSINESS_RISK_TREATMENT_STRATEGIES)[number];

export const BUSINESS_RISK_OBLIGATION_STATUSES = [
  "identified",
  "applicable",
  "not_applicable",
  "in_progress",
  "compliant",
  "non_compliant",
  "overdue",
  "unknown",
] as const;
export type BusinessRiskObligationStatus = (typeof BUSINESS_RISK_OBLIGATION_STATUSES)[number];

export const BUSINESS_RISK_INCIDENT_SEVERITIES = ["low", "medium", "high", "critical", "unknown"] as const;
export type BusinessRiskIncidentSeverity = (typeof BUSINESS_RISK_INCIDENT_SEVERITIES)[number];

export const BUSINESS_RISK_EVIDENCE_SOURCE_TYPES = [
  "finance",
  "growth",
  "revenue",
  "customer",
  "profit",
  "operations",
  "decision",
  "action",
  "signal",
  "kpi",
  "document",
  "incident",
  "obligation",
  "control",
] as const;
export type BusinessRiskEvidenceSourceType = (typeof BUSINESS_RISK_EVIDENCE_SOURCE_TYPES)[number];

export const BUSINESS_RISK_ASSESSMENT_METHOD = "risk_assessment.v1" as const;
export const BUSINESS_RISK_RESIDUAL_METHOD = "residual_risk.v1" as const;
export const BUSINESS_RISK_PRIORITY_METHOD = "risk_priority.v1" as const;

export const BUSINESS_RISK_LIKELIHOOD_SCORES: Record<Exclude<BusinessRiskLikelihood, "unknown">, number> = {
  rare: 1,
  unlikely: 2,
  possible: 3,
  likely: 4,
  almost_certain: 5,
};

export const BUSINESS_RISK_IMPACT_SCORES: Record<Exclude<BusinessRiskImpact, "unknown">, number> = {
  insignificant: 1,
  minor: 2,
  moderate: 3,
  major: 4,
  severe: 5,
};

export interface BusinessRiskAssessmentRule {
  method: typeof BUSINESS_RISK_ASSESSMENT_METHOD;
  likelihoodScores: typeof BUSINESS_RISK_LIKELIHOOD_SCORES;
  impactScores: typeof BUSINESS_RISK_IMPACT_SCORES;
  scoreBands: {
    low: { min: 1; max: 4 };
    moderate: { min: 5; max: 9 };
    high: { min: 10; max: 16 };
    extreme: { min: 17; max: 25 };
  };
  note: "Score is likelihood × impact (1–25). Unknown inputs yield unknown. Not a statistical probability.";
}

export const BUSINESS_RISK_ASSESSMENT_RULE: BusinessRiskAssessmentRule = {
  method: BUSINESS_RISK_ASSESSMENT_METHOD,
  likelihoodScores: BUSINESS_RISK_LIKELIHOOD_SCORES,
  impactScores: BUSINESS_RISK_IMPACT_SCORES,
  scoreBands: {
    low: { min: 1, max: 4 },
    moderate: { min: 5, max: 9 },
    high: { min: 10, max: 16 },
    extreme: { min: 17, max: 25 },
  },
  note: "Score is likelihood × impact (1–25). Unknown inputs yield unknown. Not a statistical probability.",
};

export const BUSINESS_RISK_DEFAULT_THRESHOLDS = {
  defaultMaxAcceptableLevel: "high" as Exclude<BusinessRiskLevel, "unknown">,
  staleEvidenceDays: 90,
  overdueGraceDays: 0,
} as const;

export const BUSINESS_RISK_DISCLAIMER =
  "Business Risk is operational risk intelligence. It is not legal advice, statutory compliance certification, insurance underwriting, or a GRC suite. Risk levels are qualitative matrix outcomes, not statistical probabilities. Residual risk does not improve merely because a control record exists. Compliant obligations require evidence and authorized human confirmation. Risk acceptance remains human.";

export interface BusinessRiskRecord {
  id: string;
  tenantId: string;
  workspaceId: string;
  reference: string;
  title: string;
  description: string | null;
  category: BusinessRiskCategory;
  domain: string | null;
  nature: BusinessRiskNature;
  ownerLabel: string | null;
  status: BusinessRiskStatus;
  sourceType: string;
  sourceRef: string;
  identifiedAt: string;
  reviewAt: string | null;
  closedAt: string | null;
  acceptedAt: string | null;
  acceptedBy: string | null;
  linkedDecisionId: string | null;
  toleranceExceptionAt: string | null;
  toleranceExceptionBy: string | null;
  toleranceExceptionRationale: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRiskAssessment {
  id: string;
  tenantId: string;
  workspaceId: string;
  riskId: string;
  version: number;
  method: typeof BUSINESS_RISK_ASSESSMENT_METHOD;
  likelihood: BusinessRiskLikelihood;
  impact: BusinessRiskImpact;
  inherentLevel: BusinessRiskLevel;
  residualLevel: BusinessRiskLevel;
  inherentScore: number | null;
  residualScore: number | null;
  assessorLabel: string | null;
  rationale: string | null;
  assumptions: string[];
  evidenceRefs: BusinessEvidenceRef[];
  residualMethod: typeof BUSINESS_RISK_RESIDUAL_METHOD;
  residualRationale: string | null;
  assessedAt: string;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
}

export interface BusinessRiskControl {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: string;
  description: string | null;
  controlType: BusinessRiskControlType;
  ownerLabel: string | null;
  status: BusinessRiskControlStatus;
  effectiveness: BusinessRiskControlEffectiveness;
  frequency: string | null;
  evidenceRefs: BusinessEvidenceRef[];
  testedAt: string | null;
  reviewAt: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRiskControlLink {
  id: string;
  tenantId: string;
  workspaceId: string;
  riskId: string;
  controlId: string;
  applicable: boolean;
  createdAt: string;
}

export interface BusinessRiskTreatment {
  id: string;
  tenantId: string;
  workspaceId: string;
  riskId: string;
  strategy: BusinessRiskTreatmentStrategy;
  decisionId: string | null;
  expectedResidualLevel: BusinessRiskLevel | null;
  actualResidualLevel: BusinessRiskLevel | null;
  acceptedAt: string | null;
  acceptedBy: string | null;
  notes: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRiskActionLink {
  id: string;
  tenantId: string;
  workspaceId: string;
  riskId: string;
  treatmentId: string | null;
  actionId: string;
  createdAt: string;
}

export interface BusinessRiskObligation {
  id: string;
  tenantId: string;
  workspaceId: string;
  riskId: string | null;
  controlId: string | null;
  actionId: string | null;
  title: string;
  sourceRef: string | null;
  jurisdiction: string | null;
  ownerLabel: string | null;
  dueAt: string | null;
  reviewAt: string | null;
  status: BusinessRiskObligationStatus;
  evidenceRefs: BusinessEvidenceRef[];
  authorizedConfirmation: boolean;
  confirmationBy: string | null;
  confirmationAt: string | null;
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRiskIncident {
  id: string;
  tenantId: string;
  workspaceId: string;
  riskId: string | null;
  actionId: string | null;
  title: string;
  description: string | null;
  occurredAt: string;
  severity: BusinessRiskIncidentSeverity;
  sourceType: string;
  sourceRef: string;
  impact: string | null;
  evidenceRefs: BusinessEvidenceRef[];
  provenance: Record<string, unknown>;
  isDemo: boolean;
  createdAt: string;
}

export interface BusinessRiskEvidenceLink {
  id: string;
  tenantId: string;
  workspaceId: string;
  riskId: string;
  sourceType: BusinessRiskEvidenceSourceType;
  sourceRef: string;
  snapshot: Record<string, unknown>;
  capturedAt: string;
  provenance: Record<string, unknown>;
}

export interface BusinessRiskToleranceRule {
  domain?: string;
  category?: BusinessRiskCategory;
  maxAcceptableLevel: Exclude<BusinessRiskLevel, "unknown">;
  escalationThreshold?: Exclude<BusinessRiskLevel, "unknown">;
  requiresApproval: boolean;
  unit?: string;
  toleranceValue?: number | null;
}

export interface BusinessRiskSettings {
  id: string;
  tenantId: string;
  workspaceId: string;
  version: number;
  effectiveAt: string;
  defaultMaxAcceptableLevel: Exclude<BusinessRiskLevel, "unknown">;
  rules: BusinessRiskToleranceRule[];
  provenance: Record<string, unknown>;
  updatedAt: string;
}

export interface BusinessRiskPriorityComponent {
  id: string;
  label: string;
  value: unknown;
  contribution: BusinessDecisionPriorityLevel | "none";
  known: boolean;
}

export interface BusinessRiskPriority {
  priority: BusinessDecisionPriorityLevel;
  score: number | null;
  components: BusinessRiskPriorityComponent[];
  evidence: BusinessEvidenceRef[];
  missingInputs: string[];
  version: typeof BUSINESS_RISK_PRIORITY_METHOD;
  inspectable: true;
  authoritativeAi: false;
}

export type BusinessRiskToleranceStatus = "within" | "outside" | "unknown";
export type BusinessRiskEvidenceFreshness = "fresh" | "stale" | "missing";

export interface BusinessRiskRegisterRow {
  risk: BusinessRiskRecord;
  latestAssessment: BusinessRiskAssessment | null;
  inherentLevel: BusinessRiskLevel;
  residualLevel: BusinessRiskLevel;
  toleranceStatus: BusinessRiskToleranceStatus;
  toleranceException: boolean;
  treatmentStrategy: BusinessRiskTreatmentStrategy | null;
  controlCount: number;
  evidencedControlCount: number;
  evidenceFreshness: BusinessRiskEvidenceFreshness;
  priority: BusinessRiskPriority;
}

export interface BusinessRiskSummary {
  generatedAt: string;
  openHighRisks: number;
  extremeResidualRisks: number;
  outsideTolerance: number;
  overdueReviews: number;
  ineffectiveControls: number;
  untestedControls: number;
  overdueObligations: number;
  risksWithoutOwner: number;
  treatmentActionsOverdue: number;
  materialRisksRequiringDecision: number;
  containsDemoData: boolean;
  disclaimer: string;
}

export interface BusinessRiskDetail {
  risk: BusinessRiskRecord;
  assessments: BusinessRiskAssessment[];
  latestAssessment: BusinessRiskAssessment | null;
  controls: BusinessRiskControl[];
  controlLinks: BusinessRiskControlLink[];
  treatments: BusinessRiskTreatment[];
  actionLinks: BusinessRiskActionLink[];
  actions: BusinessAction[];
  obligations: BusinessRiskObligation[];
  incidents: BusinessRiskIncident[];
  evidence: BusinessRiskEvidenceLink[];
  decisions: BusinessDecision[];
  priority: BusinessRiskPriority;
  toleranceStatus: BusinessRiskToleranceStatus;
  evidenceFreshness: BusinessRiskEvidenceFreshness;
  disclaimer: string;
}

export interface BusinessRiskIntelligence {
  generatedAt: string;
  method: "business_risk.v1";
  summary: BusinessRiskSummary;
  register: BusinessRiskRegisterRow[];
  signals: BusinessSignal[];
  recommendations: BusinessRecommendation[];
  kpis: BusinessKpi[];
  missingEvidence: string[];
  disclaimer: string;
}

export interface BusinessRiskInput {
  title: string;
  description?: string | null;
  category?: BusinessRiskCategory;
  domain?: string | null;
  ownerLabel?: string | null;
  status?: BusinessRiskStatus;
  sourceType: string;
  sourceRef?: string;
  identifiedAt?: string;
  reviewAt?: string | null;
  linkedDecisionId?: string | null;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessRiskAssessmentInput {
  riskId: string;
  likelihood: BusinessRiskLikelihood;
  impact: BusinessRiskImpact;
  assessorLabel?: string | null;
  rationale?: string | null;
  assumptions?: string[];
  evidenceRefs?: BusinessEvidenceRef[];
  assessedAt?: string;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessRiskControlInput {
  name: string;
  description?: string | null;
  controlType?: BusinessRiskControlType;
  ownerLabel?: string | null;
  status?: BusinessRiskControlStatus;
  effectiveness?: BusinessRiskControlEffectiveness;
  frequency?: string | null;
  evidenceRefs?: BusinessEvidenceRef[];
  testedAt?: string | null;
  reviewAt?: string | null;
  riskId?: string;
  applicable?: boolean;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessRiskTreatmentInput {
  riskId: string;
  strategy: BusinessRiskTreatmentStrategy;
  decisionId?: string | null;
  expectedResidualLevel?: BusinessRiskLevel | null;
  notes?: string | null;
  actionId?: string | null;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessRiskObligationInput {
  title: string;
  riskId?: string | null;
  controlId?: string | null;
  actionId?: string | null;
  sourceRef?: string | null;
  jurisdiction?: string | null;
  ownerLabel?: string | null;
  dueAt?: string | null;
  reviewAt?: string | null;
  status?: BusinessRiskObligationStatus;
  evidenceRefs?: BusinessEvidenceRef[];
  authorizedConfirmation?: boolean;
  confirmationBy?: string | null;
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessRiskIncidentInput {
  title: string;
  description?: string | null;
  riskId?: string | null;
  actionId?: string | null;
  occurredAt?: string;
  severity?: BusinessRiskIncidentSeverity;
  sourceType: string;
  sourceRef?: string;
  impact?: string | null;
  evidenceRefs?: BusinessEvidenceRef[];
  provenance?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface BusinessRiskEvidenceInput {
  riskId: string;
  sourceType: BusinessRiskEvidenceSourceType;
  sourceRef: string;
  snapshot?: Record<string, unknown>;
  capturedAt?: string;
  provenance?: Record<string, unknown>;
}

export interface BusinessRiskSettingsInput {
  defaultMaxAcceptableLevel?: Exclude<BusinessRiskLevel, "unknown">;
  rules?: BusinessRiskToleranceRule[];
  version?: number;
  effectiveAt?: string;
  provenance?: Record<string, unknown>;
}

export const BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION = "business_context_graph.v1" as const;
export type BusinessContextGraphOntologyVersion = typeof BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION;

export const BUSINESS_CONTEXT_NODE_TYPES = [
  "organisation",
  "customer",
  "contact",
  "lead",
  "opportunity",
  "proposal",
  "work",
  "market_segment",
  "financial_period",
  "financial_fact",
  "profit_fact",
  "risk",
  "control",
  "obligation",
  "decision",
  "action",
  "signal",
  "recommendation",
  "kpi",
  "evidence",
  "document_reference",
  "agent_reference",
  "engineering_project_reference",
] as const;
export type BusinessContextNodeType = (typeof BUSINESS_CONTEXT_NODE_TYPES)[number];

export const BUSINESS_CONTEXT_SOURCE_DOMAINS = [
  "finance",
  "growth",
  "revenue",
  "customer",
  "profit",
  "operations",
  "risk",
  "decision",
  "owner_command",
  "platform",
  "engineering_reference",
] as const;
export type BusinessContextSourceDomain = (typeof BUSINESS_CONTEXT_SOURCE_DOMAINS)[number];

export const BUSINESS_CONTEXT_RELATIONSHIP_TYPES = [
  "CUSTOMER_HAS_OPPORTUNITY",
  "CUSTOMER_HAS_CONTACT",
  "CUSTOMER_HAS_WORK",
  "CUSTOMER_IN_SEGMENT",
  "CUSTOMER_LINKED_TO_FINANCIAL_FACT",
  "LEAD_CONVERTED_TO_CUSTOMER",
  "OPPORTUNITY_HAS_PROPOSAL",
  "OPPORTUNITY_CONVERTED_TO_CUSTOMER",
  "WORK_LINKED_TO_PROFIT_FACT",
  "WORK_LINKED_TO_OPERATIONAL_COST",
  "WORK_LINKED_TO_ENGINEERING_PROJECT_REFERENCE",
  "PROFIT_FACT_ATTRIBUTED_TO_CUSTOMER",
  "PROFIT_FACT_ATTRIBUTED_TO_WORK",
  "RISK_AFFECTS_CUSTOMER",
  "RISK_AFFECTS_WORK",
  "RISK_CONTROLLED_BY",
  "RISK_REQUIRES_DECISION",
  "RISK_HAS_OBLIGATION",
  "DECISION_HAS_OPTION",
  "DECISION_CREATES_ACTION",
  "DECISION_HAS_EVIDENCE",
  "DECISION_AFFECTS_CUSTOMER",
  "DECISION_AFFECTS_WORK",
  "DECISION_AFFECTS_RISK",
  "SIGNAL_TRIGGERED_RECOMMENDATION",
  "SIGNAL_AFFECTS_CUSTOMER",
  "RECOMMENDATION_INFORMS_DECISION",
  "ACTION_MITIGATES_RISK",
  "ACTION_LINKED_TO_WORK",
] as const;
export type BusinessContextRelationshipType = (typeof BUSINESS_CONTEXT_RELATIONSHIP_TYPES)[number];

export const BUSINESS_CONTEXT_RELATIONSHIP_STATUSES = [
  "active",
  "inactive",
  "suppressed",
  "deleted",
  "override",
  "reversed",
] as const;
export type BusinessContextRelationshipStatus = (typeof BUSINESS_CONTEXT_RELATIONSHIP_STATUSES)[number];

export const BUSINESS_CONTEXT_DEFAULT_DEPTH = 2;
export const BUSINESS_CONTEXT_MAX_DEPTH = 4;
export const BUSINESS_CONTEXT_MAX_NEIGHBOURS = 80;

export const BUSINESS_CONTEXT_KPI_KEYS = [
  "graph_projection_freshness",
  "unresolved_relationships",
  "orphaned_nodes",
  "relationship_evidence_coverage",
  "customer_context_coverage",
  "decision_context_coverage",
] as const;
export type BusinessContextKpiKey = (typeof BUSINESS_CONTEXT_KPI_KEYS)[number];

export interface BusinessContextNodeIdentity {
  tenantId: string;
  workspaceId: string;
  domain: BusinessContextSourceDomain;
  entityType: BusinessContextNodeType;
  entityId: string;
  canonicalRef: string;
  displayName: string;
  sourceType: string;
  sourceRef?: string | null;
  classification?: string | null;
  ontologyVersion: BusinessContextGraphOntologyVersion;
  effectiveAt: string;
  suppressed?: boolean;
  deleted?: boolean;
}

export interface BusinessContextRelationshipEvidence {
  sourceDomain: BusinessContextSourceDomain;
  sourceEntityRef: string;
  sourceEvent?: string | null;
  provenance: Record<string, unknown>;
  projectedAt: string;
  relationshipVersion: typeof BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION;
  confidence?: number | null;
  status: BusinessContextRelationshipStatus;
}

export interface BusinessContextCanonicalRecord {
  identity: BusinessContextNodeIdentity;
  links: BusinessContextCanonicalLink[];
}

export interface BusinessContextCanonicalLink {
  relationshipType: BusinessContextRelationshipType;
  toEntityType: BusinessContextNodeType;
  toEntityId: string;
  toTenantId?: string;
  toWorkspaceId?: string;
  evidence: BusinessContextRelationshipEvidence;
}

export interface BusinessContextNeighbour {
  node: BusinessContextNodeIdentity;
  relationshipType: BusinessContextRelationshipType;
  direction: "outbound" | "inbound";
  evidence: BusinessContextRelationshipEvidence;
  depth: number;
}

export interface BusinessContextQueryResult {
  entity: BusinessContextNodeIdentity | null;
  neighbours: BusinessContextNeighbour[];
  missingLinks: string[];
  unknown: string[];
  truncated: boolean;
  adjacencyIsNotCausation: true;
  freshness: string | null;
  dataQuality: BusinessContextDataQuality;
}

export interface BusinessContextDataQuality {
  projectionFreshnessHours: number | null;
  sourceCoverageBps: number;
  unresolvedRefs: number;
  orphanRateBps: number;
  relationshipEvidenceCoverageBps: number;
  domainCoverage: string[];
  staleProjections: number;
  schemaVersionMismatches: number;
}

export interface BusinessContextDiagnosticFinding {
  code:
    | "orphaned_node"
    | "orphaned_relationship"
    | "missing_source_entity"
    | "duplicate_canonical_ref"
    | "stale_projection"
    | "unresolved_link"
    | "cross_tenant_violation"
    | "schema_version_mismatch"
    | "ambiguous_mapping"
    | "missing_source_domain"
    | "suppressed_context_leakage";
  severity: "info" | "watch" | "warning" | "critical";
  message: string;
  canonicalRef?: string;
  repaired: false;
}

export interface BusinessContextAiAssembly {
  entity: BusinessContextNodeIdentity | null;
  neighbours: Array<{
    nodeType: BusinessContextNodeType;
    displayName: string;
    relationshipType: BusinessContextRelationshipType;
    evidence: BusinessContextRelationshipEvidence;
    freshness: string;
    sourceRefs: string[];
  }>;
  dataQuality: BusinessContextDataQuality;
  unknown: string[];
  missingLinks: string[];
  adjacencyIsNotCausation: true;
  narrativeSeparate: true;
}
