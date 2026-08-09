/**
 * Phase 13F — frozen Engineering Model Interoperability V1.0 service registry.
 */

import { ENGINEERING_MODEL_INTEROPERABILITY_VERSION } from "../version";

export type EmiServiceId =
  | "engineering_model_interoperability"
  | "model_federation"
  | "ifc_federation"
  | "spacegass_federation"
  | "etabs_federation"
  | "mapping"
  | "mapping_review"
  | "change_impact"
  | "result_reference"
  | "execution_host"
  | "spacegass_solver_adapter"
  | "etabs_solver_adapter";

export type EmiServiceEntry = {
  serviceId: EmiServiceId;
  className: string;
  semanticVersion: string;
  interfaceContractRef: string;
  healthCheckId: string;
  implementationRef: string;
  duplicateRuntimeForbidden: true;
  failsClosedOnPersistenceOutage: true;
};

const V = ENGINEERING_MODEL_INTEROPERABILITY_VERSION;

export const EMI_SERVICE_REGISTRY: readonly EmiServiceEntry[] = [
  {
    serviceId: "engineering_model_interoperability",
    className: "EngineeringModelInteroperabilityService",
    semanticVersion: V,
    interfaceContractRef: "emi.service.core",
    healthCheckId: "emi.health.core",
    implementationRef: "domain/federation-service",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "model_federation",
    className: "EngineeringModelFederationService",
    semanticVersion: V,
    interfaceContractRef: "emi.service.federation",
    healthCheckId: "emi.health.federation",
    implementationRef: "domain/federation-service",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "ifc_federation",
    className: "IfcModelAdapter",
    semanticVersion: V,
    interfaceContractRef: "emi.service.ifc",
    healthCheckId: "emi.health.ifc",
    implementationRef: "domain/ifc-model-adapter",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "spacegass_federation",
    className: "SpaceGassModelAdapter",
    semanticVersion: V,
    interfaceContractRef: "emi.service.spacegass",
    healthCheckId: "emi.health.spacegass",
    implementationRef: "domain/spacegass/spacegass-model-adapter",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "etabs_federation",
    className: "EtabsModelAdapter",
    semanticVersion: V,
    interfaceContractRef: "emi.service.etabs",
    healthCheckId: "emi.health.etabs",
    implementationRef: "domain/etabs/etabs-model-adapter",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "mapping",
    className: "EngineeringModelMappingService",
    semanticVersion: V,
    interfaceContractRef: "emi.service.mapping",
    healthCheckId: "emi.health.mapping",
    implementationRef: "domain/mappings",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "mapping_review",
    className: "EngineeringModelMappingReviewService",
    semanticVersion: V,
    interfaceContractRef: "emi.service.mapping_review",
    healthCheckId: "emi.health.mapping_review",
    implementationRef: "domain/mappings",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "change_impact",
    className: "EngineeringModelChangeImpactService",
    semanticVersion: V,
    interfaceContractRef: "emi.service.change_impact",
    healthCheckId: "emi.health.change_impact",
    implementationRef: "domain/change-impact",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "result_reference",
    className: "EngineeringAnalysisResultReferenceService",
    semanticVersion: V,
    interfaceContractRef: "emi.service.result_reference",
    healthCheckId: "emi.health.result_reference",
    implementationRef: "domain/result-reference",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "execution_host",
    className: "ControlledEngineeringExecutionHost",
    semanticVersion: V,
    interfaceContractRef: "emi.service.execution_host",
    healthCheckId: "emi.health.execution_host",
    implementationRef: "@rtb/engineering-execution-host",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "spacegass_solver_adapter",
    className: "SPACEGASSSolverAdapter",
    semanticVersion: V,
    interfaceContractRef: "emi.service.spacegass_solver",
    healthCheckId: "emi.health.spacegass_solver",
    implementationRef: "domain/spacegass/spacegass-solver-adapter",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "etabs_solver_adapter",
    className: "ETABSSolverAdapter",
    semanticVersion: V,
    interfaceContractRef: "emi.service.etabs_solver",
    healthCheckId: "emi.health.etabs_solver",
    implementationRef: "domain/etabs/etabs-solver-adapter",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
] as const;

export function assertServiceRegistryComplete(): {
  ok: true;
  count: number;
  version: string;
} {
  if (EMI_SERVICE_REGISTRY.length < 12) {
    throw new Error("service_registry_incomplete");
  }
  for (const entry of EMI_SERVICE_REGISTRY) {
    if (entry.semanticVersion !== ENGINEERING_MODEL_INTEROPERABILITY_VERSION) {
      throw new Error(`service_version_drift:${entry.serviceId}`);
    }
    if (!entry.duplicateRuntimeForbidden) {
      throw new Error(`service_duplicate_runtime_allowed:${entry.serviceId}`);
    }
  }
  return {
    ok: true,
    count: EMI_SERVICE_REGISTRY.length,
    version: ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  };
}
