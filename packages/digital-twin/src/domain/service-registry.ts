/**
 * Phase 12N — frozen Digital Twin V1.0 public service registry.
 */

import { DIGITAL_TWIN_VERSION } from "../version";

export type DigitalTwinServiceId =
  | "digital_twin"
  | "identity"
  | "state"
  | "ingestion"
  | "telemetry"
  | "representation"
  | "digital_thread"
  | "simulation"
  | "simulation_assurance"
  | "solver"
  | "solver_capabilities"
  | "snapshot"
  | "spatial_binding";

export type DigitalTwinServiceEntry = {
  serviceId: DigitalTwinServiceId;
  className: string;
  semanticVersion: string;
  interfaceContractRef: string;
  healthCheckId: string;
  implementationRef: string;
  duplicateRuntimeForbidden: true;
  failsClosedOnPersistenceOutage: true;
};

const V = DIGITAL_TWIN_VERSION;

export const DIGITAL_TWIN_SERVICE_REGISTRY: readonly DigitalTwinServiceEntry[] = [
  {
    serviceId: "digital_twin",
    className: "DigitalTwinService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.digital_twin",
    healthCheckId: "dt.health.digital_twin",
    implementationRef: "domain/engine",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "identity",
    className: "TwinIdentityService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.identity",
    healthCheckId: "dt.health.identity",
    implementationRef: "domain/twin-engine",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "state",
    className: "TwinStateService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.state",
    healthCheckId: "dt.health.state",
    implementationRef: "domain/state-engine",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "ingestion",
    className: "TwinStateIngestionService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.ingestion",
    healthCheckId: "dt.health.ingestion",
    implementationRef: "domain/state-ingestion-engine",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "telemetry",
    className: "TwinTelemetryBindingService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.telemetry",
    healthCheckId: "dt.health.telemetry",
    implementationRef: "domain/telemetry-projection-engine",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "representation",
    className: "TwinRepresentationService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.representation",
    healthCheckId: "dt.health.representation",
    implementationRef: "domain/representation-navigation",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "digital_thread",
    className: "DigitalThreadIntelligenceService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.digital_thread",
    healthCheckId: "dt.health.digital_thread",
    implementationRef: "domain/digital-thread-intelligence-engine",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "simulation",
    className: "TwinSimulationService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.simulation",
    healthCheckId: "dt.health.simulation",
    implementationRef: "domain/simulation-orchestrator",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "simulation_assurance",
    className: "TwinSimulationAssuranceService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.simulation_assurance",
    healthCheckId: "dt.health.simulation_assurance",
    implementationRef: "domain/simulation-qualification-eligibility",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "solver",
    className: "ExternalSolverIntegrationService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.solver",
    healthCheckId: "dt.health.solver",
    implementationRef: "domain/solvers/calculix-adapter",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "solver_capabilities",
    className: "SolverCapabilityRegistryService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.solver_capabilities",
    healthCheckId: "dt.health.solver_capabilities",
    implementationRef: "domain/solvers/engineering-solver-capability-registry",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "snapshot",
    className: "TwinSnapshotService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.snapshot",
    healthCheckId: "dt.health.snapshot",
    implementationRef: "domain/snapshot",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
  {
    serviceId: "spatial_binding",
    className: "TwinSpatialBindingService",
    semanticVersion: V,
    interfaceContractRef: "dt.service.spatial_binding",
    healthCheckId: "dt.health.spatial_binding",
    implementationRef: "domain/spatial-reference",
    duplicateRuntimeForbidden: true,
    failsClosedOnPersistenceOutage: true,
  },
] as const;

export const REQUIRED_DIGITAL_TWIN_SERVICE_IDS: readonly DigitalTwinServiceId[] = [
  "digital_twin",
  "identity",
  "state",
  "ingestion",
  "telemetry",
  "representation",
  "digital_thread",
  "simulation",
  "simulation_assurance",
  "solver",
  "solver_capabilities",
  "snapshot",
  "spatial_binding",
];

export function listDigitalTwinServices(): readonly DigitalTwinServiceEntry[] {
  return DIGITAL_TWIN_SERVICE_REGISTRY;
}

export function getDigitalTwinService(
  serviceId: DigitalTwinServiceId,
): DigitalTwinServiceEntry | undefined {
  return DIGITAL_TWIN_SERVICE_REGISTRY.find((s) => s.serviceId === serviceId);
}

export function assertServiceRegistryComplete(): {
  ok: true;
  count: number;
  version: string;
} {
  const ids = DIGITAL_TWIN_SERVICE_REGISTRY.map((s) => s.serviceId);
  if (new Set(ids).size !== ids.length) throw new Error("service_duplicate_id");
  for (const required of REQUIRED_DIGITAL_TWIN_SERVICE_IDS) {
    if (!ids.includes(required)) throw new Error(`missing_service:${required}`);
  }
  for (const entry of DIGITAL_TWIN_SERVICE_REGISTRY) {
    if (!entry.duplicateRuntimeForbidden) {
      throw new Error(`duplicate_runtime_allowed:${entry.serviceId}`);
    }
    if (entry.semanticVersion !== DIGITAL_TWIN_VERSION) {
      throw new Error(`service_version_drift:${entry.serviceId}`);
    }
  }
  return {
    ok: true,
    count: DIGITAL_TWIN_SERVICE_REGISTRY.length,
    version: DIGITAL_TWIN_VERSION,
  };
}
