/**
 * Phase 10K — frozen Asset Intelligence V1.0 public service registry.
 * Each entry points at an existing implementation; no duplicate runtimes.
 */

import { ASSET_INTELLIGENCE_VERSION } from "../version";

export type AssetServiceId =
  | "asset_intelligence"
  | "condition"
  | "criticality"
  | "reliability"
  | "failure"
  | "degradation"
  | "lifecycle"
  | "decision_context"
  | "risk"
  | "maintenance_recommendation"
  | "priority"
  | "fusion"
  | "predictive_readiness"
  | "predictive_governance"
  | "health"
  | "timeline";

export type AssetServiceEntry = {
  serviceId: AssetServiceId;
  className: string;
  semanticVersion: string;
  interfaceContractRef: string;
  healthCheckId: string;
  implementationRef: string;
  duplicateRuntimeForbidden: true;
  failsClosedOnPersistenceOutage: true;
};

const V = ASSET_INTELLIGENCE_VERSION;

export const ASSET_INTELLIGENCE_SERVICE_REGISTRY: readonly AssetServiceEntry[] = [
  {
    serviceId: "asset_intelligence",
    className: "AssetIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.asset_intelligence",
    healthCheckId: "ai.health.asset_intelligence",
    implementationRef: "domain/services#AssetIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "condition",
    className: "AssetConditionService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.condition",
    healthCheckId: "ai.health.condition",
    implementationRef: "domain/services#AssetConditionService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "criticality",
    className: "AssetCriticalityService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.criticality",
    healthCheckId: "ai.health.criticality",
    implementationRef: "domain/services#AssetCriticalityService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "reliability",
    className: "AssetReliabilityService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.reliability",
    healthCheckId: "ai.health.reliability",
    implementationRef: "domain/services#AssetReliabilityService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "failure",
    className: "AssetFailureService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.failure",
    healthCheckId: "ai.health.failure",
    implementationRef: "domain/services#AssetFailureService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "degradation",
    className: "AssetDegradationService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.degradation",
    healthCheckId: "ai.health.degradation",
    implementationRef: "domain/services#AssetDegradationService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "lifecycle",
    className: "AssetLifecycleService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.lifecycle",
    healthCheckId: "ai.health.lifecycle",
    implementationRef: "domain/services#AssetLifecycleService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "decision_context",
    className: "AssetDecisionContextService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.decision_context",
    healthCheckId: "ai.health.decision_context",
    implementationRef: "domain/services#AssetDecisionContextService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "risk",
    className: "AssetRiskService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.risk",
    healthCheckId: "ai.health.risk",
    implementationRef: "domain/services#AssetRiskService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "maintenance_recommendation",
    className: "AssetMaintenanceRecommendationService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.maintenance_recommendation",
    healthCheckId: "ai.health.maintenance_recommendation",
    implementationRef: "domain/services#AssetMaintenanceRecommendationService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "priority",
    className: "AssetPriorityService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.priority",
    healthCheckId: "ai.health.priority",
    implementationRef: "domain/services#AssetPriorityService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "fusion",
    className: "AssetFusionService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.fusion",
    healthCheckId: "ai.health.fusion",
    implementationRef: "domain/services#AssetFusionService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "predictive_readiness",
    className: "AssetPredictiveReadinessService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.predictive_readiness",
    healthCheckId: "ai.health.predictive_readiness",
    implementationRef: "domain/services#AssetPredictiveReadinessService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "predictive_governance",
    className: "AssetPredictiveGovernanceService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.predictive_governance",
    healthCheckId: "ai.health.predictive_governance",
    implementationRef: "domain/services#AssetPredictiveGovernanceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "health",
    className: "AssetHealthIndexService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.health",
    healthCheckId: "ai.health.health_index",
    implementationRef: "domain/services#AssetHealthIndexService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "timeline",
    className: "AssetTimelineService",
    semanticVersion: V,
    interfaceContractRef: "ai.service.timeline",
    healthCheckId: "ai.health.timeline",
    implementationRef: "domain/services#AssetTimelineService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
] as const;

export const REQUIRED_ASSET_SERVICE_IDS: readonly AssetServiceId[] = [
  "asset_intelligence",
  "condition",
  "criticality",
  "reliability",
  "failure",
  "degradation",
  "lifecycle",
  "decision_context",
  "risk",
  "maintenance_recommendation",
  "priority",
  "fusion",
  "predictive_readiness",
  "predictive_governance",
  "health",
  "timeline",
];

export function listAssetIntelligenceServices(): readonly AssetServiceEntry[] {
  return ASSET_INTELLIGENCE_SERVICE_REGISTRY;
}

export function getAssetIntelligenceService(
  serviceId: AssetServiceId,
): AssetServiceEntry | undefined {
  return ASSET_INTELLIGENCE_SERVICE_REGISTRY.find((s) => s.serviceId === serviceId);
}

export function assertServiceRegistryComplete(): {
  ok: true;
  count: number;
  version: string;
} {
  const ids = ASSET_INTELLIGENCE_SERVICE_REGISTRY.map((s) => s.serviceId);
  if (new Set(ids).size !== ids.length) throw new Error("service_duplicate_id");
  for (const required of REQUIRED_ASSET_SERVICE_IDS) {
    if (!ids.includes(required)) throw new Error(`missing_service:${required}`);
  }
  for (const entry of ASSET_INTELLIGENCE_SERVICE_REGISTRY) {
    if (!entry.duplicateRuntimeForbidden) {
      throw new Error(`duplicate_runtime_allowed:${entry.serviceId}`);
    }
    if (entry.semanticVersion !== ASSET_INTELLIGENCE_VERSION) {
      throw new Error(`service_version_drift:${entry.serviceId}`);
    }
  }
  return {
    ok: true,
    count: ASSET_INTELLIGENCE_SERVICE_REGISTRY.length,
    version: ASSET_INTELLIGENCE_VERSION,
  };
}
