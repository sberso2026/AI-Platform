/**
 * Phase 9J — Inspection Intelligence capability catalog for RTB AI Platform Capability Registry.
 * Declarative entries; registration targets CapabilityRegistryService (no parallel runtime).
 */

export type CapabilityStatus = "available" | "deprecated";

export type InspectionCapabilityEntry = {
  id: string;
  name: string;
  version: string;
  owningModule: "inspection_intelligence";
  permissions: readonly string[];
  entitlementBinding: string;
  status: CapabilityStatus;
  dependencies: readonly string[];
  featureSurface: string;
};

export const INSPECTION_CAPABILITY_CATALOG: readonly InspectionCapabilityEntry[] = [
  {
    id: "inspection_intelligence.session",
    name: "Inspection Session",
    version: "1.0.0",
    owningModule: "inspection_intelligence",
    permissions: ["inspection.read", "inspection.write"],
    entitlementBinding: "inspection.write",
    status: "available",
    dependencies: [],
    featureSurface: "session",
  },
  {
    id: "inspection_intelligence.template",
    name: "Inspection Template",
    version: "1.0.0",
    owningModule: "inspection_intelligence",
    permissions: ["inspection.read", "inspection.write"],
    entitlementBinding: "inspection.write",
    status: "available",
    dependencies: [],
    featureSurface: "template",
  },
  {
    id: "inspection_intelligence.evidence",
    name: "Inspection Evidence",
    version: "1.0.0",
    owningModule: "inspection_intelligence",
    permissions: ["inspection.read", "inspection.write"],
    entitlementBinding: "inspection.write",
    status: "available",
    dependencies: ["inspection_intelligence.session"],
    featureSurface: "evidence",
  },
  {
    id: "inspection_intelligence.condition",
    name: "Condition Rating",
    version: "1.0.0",
    owningModule: "inspection_intelligence",
    permissions: ["inspection.read", "inspection.review", "inspection.approve"],
    entitlementBinding: "inspection.review",
    status: "available",
    dependencies: ["inspection_intelligence.session"],
    featureSurface: "condition",
  },
  {
    id: "inspection_intelligence.predictive",
    name: "Predictive Signals (advisory)",
    version: "1.0.0",
    owningModule: "inspection_intelligence",
    permissions: ["inspection.read", "inspection.review"],
    entitlementBinding: "inspection.review",
    status: "available",
    dependencies: ["inspection_intelligence.condition"],
    featureSurface: "predictive",
  },
  {
    id: "inspection_intelligence.vision",
    name: "AI Vision (advisory)",
    version: "1.0.0",
    owningModule: "inspection_intelligence",
    permissions: ["inspection.read", "inspection.review"],
    entitlementBinding: "inspection.review",
    status: "available",
    dependencies: ["inspection_intelligence.evidence"],
    featureSurface: "vision",
  },
  {
    id: "inspection_intelligence.reporting",
    name: "Reporting Preparation",
    version: "1.0.0",
    owningModule: "inspection_intelligence",
    permissions: ["inspection.read", "inspection.report"],
    entitlementBinding: "inspection.report",
    status: "available",
    dependencies: ["inspection_intelligence.session"],
    featureSurface: "reporting",
  },
  {
    id: "inspection_intelligence.packs",
    name: "Inspection Packs",
    version: "1.0.0",
    owningModule: "inspection_intelligence",
    permissions: ["inspection.read", "inspection.admin"],
    entitlementBinding: "inspection.admin",
    status: "available",
    dependencies: [],
    featureSurface: "packs",
  },
  {
    id: "inspection_intelligence.mobile_offline",
    name: "Mobile / Offline Continuity",
    version: "1.0.0",
    owningModule: "inspection_intelligence",
    permissions: ["inspection.read", "inspection.write"],
    entitlementBinding: "inspection.write",
    status: "available",
    dependencies: ["inspection_intelligence.session"],
    featureSurface: "mobile/offline",
  },
] as const;

export const REQUIRED_CAPABILITY_FEATURE_SURFACES = [
  "session",
  "template",
  "evidence",
  "condition",
  "predictive",
  "vision",
  "reporting",
  "packs",
  "mobile/offline",
] as const;

/** Payload shape compatible with CapabilityRegistryService.registerFromPlugin. */
export function toCapabilityRegistryRegistrationPayload(
  entry: InspectionCapabilityEntry,
  tenantId: string,
): {
  tenantId: string;
  capabilityKey: string;
  name: string;
  description: string;
  operatingSystem: "engineering";
  pluginId: string;
} {
  return {
    tenantId,
    capabilityKey: entry.id,
    name: entry.name,
    description: `Inspection Intelligence capability (${entry.featureSurface}) v${entry.version}`,
    operatingSystem: "engineering",
    pluginId: "inspection_intelligence",
  };
}

export function assertCapabilityCatalogComplete(): {
  ok: true;
  count: number;
  surfaces: string[];
} {
  const surfaces = INSPECTION_CAPABILITY_CATALOG.map((c) => c.featureSurface);
  for (const required of REQUIRED_CAPABILITY_FEATURE_SURFACES) {
    if (!surfaces.includes(required)) {
      throw new Error(`missing_capability_surface:${required}`);
    }
  }
  return { ok: true, count: INSPECTION_CAPABILITY_CATALOG.length, surfaces };
}

export function listCapabilityRegistryPayloads(tenantId: string) {
  return INSPECTION_CAPABILITY_CATALOG.map((e) =>
    toCapabilityRegistryRegistrationPayload(e, tenantId),
  );
}
