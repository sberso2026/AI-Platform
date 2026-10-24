/**
 * Phase 10A — draft public contracts (discovery; not frozen as 1.0.0).
 */

export const ASSET_INTELLIGENCE_CONTRACT_DRAFT_VERSION = "0.1.0-draft" as const;

export type DraftContractFamily = {
  contractId: string;
  family:
    | "query"
    | "command"
    | "event"
    | "condition"
    | "reliability"
    | "criticality"
    | "failure"
    | "risk"
    | "maintenance_signal"
    | "search";
  status: "draft_discovery";
  version: typeof ASSET_INTELLIGENCE_CONTRACT_DRAFT_VERSION;
};

export const ASSET_INTELLIGENCE_PUBLIC_CONTRACT_DRAFTS: readonly DraftContractFamily[] = [
  { contractId: "ai.query", family: "query", status: "draft_discovery", version: "0.1.0-draft" },
  { contractId: "ai.command", family: "command", status: "draft_discovery", version: "0.1.0-draft" },
  { contractId: "ai.event", family: "event", status: "draft_discovery", version: "0.1.0-draft" },
  { contractId: "ai.condition", family: "condition", status: "draft_discovery", version: "0.1.0-draft" },
  { contractId: "ai.reliability", family: "reliability", status: "draft_discovery", version: "0.1.0-draft" },
  { contractId: "ai.criticality", family: "criticality", status: "draft_discovery", version: "0.1.0-draft" },
  { contractId: "ai.failure", family: "failure", status: "draft_discovery", version: "0.1.0-draft" },
  { contractId: "ai.risk", family: "risk", status: "draft_discovery", version: "0.1.0-draft" },
  {
    contractId: "ai.maintenance_signal",
    family: "maintenance_signal",
    status: "draft_discovery",
    version: "0.1.0-draft",
  },
  { contractId: "ai.search", family: "search", status: "draft_discovery", version: "0.1.0-draft" },
] as const;

export const DRAFT_CAPABILITIES = [
  "asset.intelligence.read",
  "asset.condition.read",
  "asset.condition.assess",
  "asset.criticality.assess",
  "asset.reliability.read",
  "asset.failure.analyze",
  "asset.risk.analyze",
  "asset.maintenance.recommend",
  "asset.predictive.read",
] as const;

export const DRAFT_SERVICES = [
  "AssetIntelligenceService",
  "AssetConditionService",
  "AssetCriticalityService",
  "AssetReliabilityService",
  "AssetFailureService",
  "AssetRiskService",
  "AssetMaintenanceRecommendationService",
  "AssetLifecycleIntelligenceService",
] as const;

export const DRAFT_EVENTS = [
  "engineering.asset.condition.updated",
  "engineering.asset.health_index.updated",
  "engineering.asset.intelligence_timeline.appended",
  "engineering.asset.criticality.updated",
  "engineering.asset.reliability.updated",
  "engineering.asset.failure_signal.created",
  "engineering.asset.degradation.updated",
  "engineering.asset.risk_signal.created",
  "engineering.asset.maintenance_recommendation.created",
  "engineering.asset.lifecycle_signal.created",
] as const;
