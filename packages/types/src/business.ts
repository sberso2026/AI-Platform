/**
 * Business OS contracts (BOS-0 foundation + BOS-1 Owner Command Centre).
 * Capabilities are identifiers — only owner_command is implemented in BOS-1.
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
