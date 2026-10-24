/**
 * Phase 9J — versioned Inspection Intelligence service registry entries.
 * Point at existing Eng OS / II implementations; no duplicate runtimes.
 */

export type InspectionServiceId =
  | "session"
  | "template"
  | "evidence"
  | "condition"
  | "vision"
  | "reporting"
  | "pack";

export type InspectionServiceEntry = {
  serviceId: InspectionServiceId;
  semanticVersion: string;
  interfaceContractRef: string;
  healthCheckId: string;
  residencyPolicyNote: string | null;
  failClosedOnProviderOutage: boolean;
  implementationRef: string;
  duplicateRuntimeForbidden: true;
};

export const INSPECTION_SERVICE_REGISTRY: readonly InspectionServiceEntry[] = [
  {
    serviceId: "session",
    semanticVersion: "1.0.0",
    interfaceContractRef: "ii.command.session.write",
    healthCheckId: "ii.health.session",
    residencyPolicyNote: null,
    failClosedOnProviderOutage: false,
    implementationRef: "domain/vertical-slice#session",
    duplicateRuntimeForbidden: true,
  },
  {
    serviceId: "template",
    semanticVersion: "1.0.0",
    interfaceContractRef: "ii.query.session.read",
    healthCheckId: "ii.health.template",
    residencyPolicyNote: null,
    failClosedOnProviderOutage: false,
    implementationRef: "domain/vertical-slice#template",
    duplicateRuntimeForbidden: true,
  },
  {
    serviceId: "evidence",
    semanticVersion: "1.0.0",
    interfaceContractRef: "ii.api.slice",
    healthCheckId: "ii.health.evidence",
    residencyPolicyNote: "tenant_workspace_isolated",
    failClosedOnProviderOutage: false,
    implementationRef: "domain/persistence#evidence",
    duplicateRuntimeForbidden: true,
  },
  {
    serviceId: "condition",
    semanticVersion: "1.0.0",
    interfaceContractRef: "ii.reporting.preparation",
    healthCheckId: "ii.health.condition",
    residencyPolicyNote: null,
    failClosedOnProviderOutage: true,
    implementationRef: "domain/condition-rating",
    duplicateRuntimeForbidden: true,
  },
  {
    serviceId: "vision",
    semanticVersion: "1.0.0",
    interfaceContractRef: "ii.ai.vision.advisory",
    healthCheckId: "ii.health.vision",
    residencyPolicyNote: "provider_allowlist_and_residency_policy",
    failClosedOnProviderOutage: true,
    implementationRef: "domain/ai-vision-analysis",
    duplicateRuntimeForbidden: true,
  },
  {
    serviceId: "reporting",
    semanticVersion: "1.0.0",
    interfaceContractRef: "ii.reporting.preparation",
    healthCheckId: "ii.health.reporting",
    residencyPolicyNote: null,
    failClosedOnProviderOutage: false,
    implementationRef: "domain/reporting-preparation",
    duplicateRuntimeForbidden: true,
  },
  {
    serviceId: "pack",
    semanticVersion: "1.0.0",
    interfaceContractRef: "ii.api.slice",
    healthCheckId: "ii.health.pack",
    residencyPolicyNote: null,
    failClosedOnProviderOutage: false,
    implementationRef: "pack-sdk#InspectionPackSdk",
    duplicateRuntimeForbidden: true,
  },
] as const;

export const REQUIRED_SERVICE_IDS: readonly InspectionServiceId[] = [
  "session",
  "template",
  "evidence",
  "condition",
  "vision",
  "reporting",
  "pack",
];

export function listInspectionServices(): readonly InspectionServiceEntry[] {
  return INSPECTION_SERVICE_REGISTRY;
}

export function getInspectionService(
  serviceId: InspectionServiceId,
): InspectionServiceEntry | undefined {
  return INSPECTION_SERVICE_REGISTRY.find((s) => s.serviceId === serviceId);
}

export function assertServiceRegistryComplete(): {
  ok: true;
  count: number;
  failClosedServices: InspectionServiceId[];
} {
  const ids = INSPECTION_SERVICE_REGISTRY.map((s) => s.serviceId);
  for (const required of REQUIRED_SERVICE_IDS) {
    if (!ids.includes(required)) throw new Error(`missing_service:${required}`);
  }
  for (const s of INSPECTION_SERVICE_REGISTRY) {
    if (!s.duplicateRuntimeForbidden) {
      throw new Error(`duplicate_runtime_allowed:${s.serviceId}`);
    }
  }
  const failClosedServices = INSPECTION_SERVICE_REGISTRY.filter(
    (s) => s.failClosedOnProviderOutage,
  ).map((s) => s.serviceId);
  return { ok: true, count: INSPECTION_SERVICE_REGISTRY.length, failClosedServices };
}
