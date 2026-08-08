/**
 * Phase 11N — frozen Project Controls V1.0 public service registry.
 */

import { PROJECT_CONTROLS_VERSION } from "../version";

export type ProjectServiceId =
  | "project_controls"
  | "progress"
  | "schedule"
  | "change"
  | "cost"
  | "productivity"
  | "forecast"
  | "decision_support"
  | "scenario"
  | "risk_opportunity"
  | "assurance"
  | "explainability"
  | "organizational_learning"
  | "snapshot"
  | "project_context";

export type ProjectServiceEntry = {
  serviceId: ProjectServiceId;
  className: string;
  semanticVersion: string;
  interfaceContractRef: string;
  healthCheckId: string;
  implementationRef: string;
  duplicateRuntimeForbidden: true;
  failsClosedOnPersistenceOutage: true;
};

const V = PROJECT_CONTROLS_VERSION;

export const PROJECT_CONTROLS_SERVICE_REGISTRY: readonly ProjectServiceEntry[] = [
  {
    serviceId: "project_controls",
    className: "ProjectControlsService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.project_controls",
    healthCheckId: "pc.health.project_controls",
    implementationRef: "domain/services#ProjectControlsService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "progress",
    className: "ProgressIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.progress",
    healthCheckId: "pc.health.progress",
    implementationRef: "domain/services#ProgressIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "schedule",
    className: "ScheduleIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.schedule",
    healthCheckId: "pc.health.schedule",
    implementationRef: "domain/services#ScheduleIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "change",
    className: "ChangeIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.change",
    healthCheckId: "pc.health.change",
    implementationRef: "domain/services#ChangeIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "cost",
    className: "CostIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.cost",
    healthCheckId: "pc.health.cost",
    implementationRef: "domain/services#CostIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "productivity",
    className: "ProductivityIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.productivity",
    healthCheckId: "pc.health.productivity",
    implementationRef: "domain/services#ProductivityIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "forecast",
    className: "ForecastIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.forecast",
    healthCheckId: "pc.health.forecast",
    implementationRef: "domain/services#ForecastIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "decision_support",
    className: "DecisionSupportService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.decision_support",
    healthCheckId: "pc.health.decision_support",
    implementationRef: "domain/services#DecisionSupportService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "scenario",
    className: "ScenarioIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.scenario",
    healthCheckId: "pc.health.scenario",
    implementationRef: "domain/services#ScenarioIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "risk_opportunity",
    className: "RiskOpportunityIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.risk_opportunity",
    healthCheckId: "pc.health.risk_opportunity",
    implementationRef: "domain/services#RiskOpportunityIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "assurance",
    className: "AssuranceIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.assurance",
    healthCheckId: "pc.health.assurance",
    implementationRef: "domain/services#AssuranceIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "explainability",
    className: "ExplainabilityIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.explainability",
    healthCheckId: "pc.health.explainability",
    implementationRef: "domain/services#ExplainabilityIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "organizational_learning",
    className: "OrganizationalLearningIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.organizational_learning",
    healthCheckId: "pc.health.organizational_learning",
    implementationRef: "domain/services#OrganizationalLearningIntelligenceService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "snapshot",
    className: "ProjectSnapshotService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.snapshot",
    healthCheckId: "pc.health.snapshot",
    implementationRef: "domain/services#ProjectSnapshotService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "project_context",
    className: "ProjectContextService",
    semanticVersion: V,
    interfaceContractRef: "pc.service.project_context",
    healthCheckId: "pc.health.project_context",
    implementationRef: "domain/services#ProjectContextService",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
] as const;

export const REQUIRED_PROJECT_SERVICE_IDS: readonly ProjectServiceId[] = [
  "project_controls",
  "progress",
  "schedule",
  "change",
  "cost",
  "productivity",
  "forecast",
  "decision_support",
  "scenario",
  "risk_opportunity",
  "assurance",
  "explainability",
  "organizational_learning",
  "snapshot",
  "project_context",
];

export function listProjectControlsServices(): readonly ProjectServiceEntry[] {
  return PROJECT_CONTROLS_SERVICE_REGISTRY;
}

export function getProjectControlsService(
  serviceId: ProjectServiceId,
): ProjectServiceEntry | undefined {
  return PROJECT_CONTROLS_SERVICE_REGISTRY.find((s) => s.serviceId === serviceId);
}

export function assertServiceRegistryComplete(): {
  ok: true;
  count: number;
  version: string;
} {
  const ids = PROJECT_CONTROLS_SERVICE_REGISTRY.map((s) => s.serviceId);
  if (new Set(ids).size !== ids.length) throw new Error("service_duplicate_id");
  for (const required of REQUIRED_PROJECT_SERVICE_IDS) {
    if (!ids.includes(required)) throw new Error(`missing_service:${required}`);
  }
  for (const entry of PROJECT_CONTROLS_SERVICE_REGISTRY) {
    if (!entry.duplicateRuntimeForbidden) {
      throw new Error(`duplicate_runtime_allowed:${entry.serviceId}`);
    }
    if (entry.semanticVersion !== PROJECT_CONTROLS_VERSION) {
      throw new Error(`service_version_drift:${entry.serviceId}`);
    }
  }
  return {
    ok: true,
    count: PROJECT_CONTROLS_SERVICE_REGISTRY.length,
    version: PROJECT_CONTROLS_VERSION,
  };
}
