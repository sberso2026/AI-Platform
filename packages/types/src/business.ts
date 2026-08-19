/**
 * Business OS contracts (BOS-0 foundation, BOS-1 Owner Command, BOS-2 Financial Intelligence,
 * BOS-3 Growth Intelligence, BOS-4 Revenue Execution, BOS-5 Customer Intelligence).
 * Capabilities are identifiers — owner_command, financial_intelligence, growth_intelligence,
 * revenue_execution, and customer_intelligence are implemented.
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
  operations: { available: false; reason: "operations_domain_not_implemented" };
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
