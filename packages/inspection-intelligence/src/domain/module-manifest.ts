/**
 * Phase 9J — machine-readable Inspection Intelligence module manifest.
 * Must stay consistent with capability catalog, service registry and public contracts.
 */

import { INSPECTION_CAPABILITY_CATALOG } from "./capability-registry-integration";
import { INSPECTION_PUBLIC_MODULE_CONTRACTS } from "./public-module-contracts";
import { INSPECTION_SERVICE_REGISTRY } from "./service-registry";
import {
  INSPECTION_INTELLIGENCE_MODULE_KEY,
  INSPECTION_INTELLIGENCE_PLANNED_ENTITLEMENTS,
  INSPECTION_INTELLIGENCE_PRODUCT_NAME,
  INSPECTION_INTELLIGENCE_ROUTE_PREFIX,
  INSPECTION_INTELLIGENCE_VERSION,
} from "../version";

export type InspectionModuleManifest = {
  schemaVersion: "inspection-intelligence-module-manifest/1";
  moduleKey: typeof INSPECTION_INTELLIGENCE_MODULE_KEY;
  productName: typeof INSPECTION_INTELLIGENCE_PRODUCT_NAME;
  version: typeof INSPECTION_INTELLIGENCE_VERSION;
  routePrefix: typeof INSPECTION_INTELLIGENCE_ROUTE_PREFIX;
  capabilities: readonly string[];
  services: readonly string[];
  publicContracts: readonly string[];
  dependencies: {
    sdksConsumed: readonly string[];
    sdksExported: readonly string[];
    platformServices: readonly string[];
  };
  permissions: readonly string[];
  eventsEmitted: readonly string[];
  eventsConsumed: readonly string[];
  healthChecks: readonly string[];
  routes: readonly string[];
  featureFlags: Record<string, boolean>;
  assetIntelligenceOwnership: false;
  digitalTwinOwnership: false;
};

export function generateInspectionModuleManifest(): InspectionModuleManifest {
  return {
    schemaVersion: "inspection-intelligence-module-manifest/1",
    moduleKey: INSPECTION_INTELLIGENCE_MODULE_KEY,
    productName: INSPECTION_INTELLIGENCE_PRODUCT_NAME,
    version: INSPECTION_INTELLIGENCE_VERSION,
    routePrefix: INSPECTION_INTELLIGENCE_ROUTE_PREFIX,
    capabilities: INSPECTION_CAPABILITY_CATALOG.map((c) => c.id),
    services: INSPECTION_SERVICE_REGISTRY.map((s) => s.serviceId),
    publicContracts: INSPECTION_PUBLIC_MODULE_CONTRACTS.map((c) => c.contractId),
    dependencies: {
      sdksConsumed: [
        "engineering-module-sdk",
        "engineering-domain-sdk",
        "engineering-workflow-sdk",
        "engineering-mobile-sdk",
        "inspection-pack-sdk",
      ],
      sdksExported: ["inspection-pack-sdk"],
      platformServices: [
        "files",
        "audit",
        "notifications",
        "event_bus",
        "entitlements",
        "capability_registry",
        "ai_policy",
      ],
    },
    permissions: [...INSPECTION_INTELLIGENCE_PLANNED_ENTITLEMENTS],
    eventsEmitted: [
      "engineering.inspection.*",
      "engineering.inspection.vision.*",
      "engineering.inspection.condition.*",
      "engineering.inspection.predictive.*",
      "engineering.mobile.sync.*",
    ],
    eventsConsumed: ["engineering.workflow.*", "engineering.mobile.sync.*"],
    healthChecks: INSPECTION_SERVICE_REGISTRY.map((s) => s.healthCheckId),
    routes: [
      "/engineering/apps/inspection-intelligence",
      "/engineering/apps/inspection-intelligence/vision",
      "/engineering/apps/inspection-intelligence/condition",
      "/engineering/apps/inspection-intelligence/predictive",
      "/engineering/apps/inspection-intelligence/sync",
      "/engineering/apps/inspection-intelligence/field",
      "/engineering/apps/inspection-intelligence/release",
    ],
    featureFlags: {
      mobileProductImplemented: true,
      offlineSyncImplemented: true,
      conditionRatingImplemented: true,
      predictiveSignalsScaffolded: true,
      packExpansionImplemented: true,
      aiVisionImplemented: true,
      inspectionIntelligenceReleaseClosed: true,
      publicModuleContractsPublished: true,
      capabilityRegistryIntegrated: true,
      serviceRegistryPublished: true,
      inspectionPackRegistryHardened: true,
      moduleManifestGenerated: true,
      operationalHealthMetricsExposed: true,
      versioningCompatibilityFormalized: true,
      crossModuleConsumerContractsCertified: true,
      moduleRegistryDriftDetected: false,
      inspectionIntelligenceV1Frozen: true,
      productionInspectionIntelligenceReady: true,
      assetIntelligenceOwnership: false,
      digitalTwinOwnership: false,
    },
    assetIntelligenceOwnership: false,
    digitalTwinOwnership: false,
  };
}

export function assertManifestConsistentWithRegistries(
  manifest: InspectionModuleManifest = generateInspectionModuleManifest(),
): { ok: true; version: string } {
  if (manifest.capabilities.length !== INSPECTION_CAPABILITY_CATALOG.length) {
    throw new Error("manifest_capability_drift");
  }
  if (manifest.services.length !== INSPECTION_SERVICE_REGISTRY.length) {
    throw new Error("manifest_service_drift");
  }
  if (manifest.publicContracts.length !== INSPECTION_PUBLIC_MODULE_CONTRACTS.length) {
    throw new Error("manifest_contract_drift");
  }
  if (!manifest.routes.includes(`${INSPECTION_INTELLIGENCE_ROUTE_PREFIX}/release`)) {
    throw new Error("manifest_missing_release_route");
  }
  if (manifest.featureFlags.assetIntelligenceOwnership !== false) {
    throw new Error("manifest_asset_intelligence_ownership");
  }
  if (manifest.version !== INSPECTION_INTELLIGENCE_VERSION) {
    throw new Error("manifest_version_drift");
  }
  return { ok: true, version: manifest.version };
}
