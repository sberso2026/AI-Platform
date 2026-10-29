/**
 * Phase 12N — machine-readable Digital Twin V1.0 module manifest generator.
 */

import {
  DIGITAL_TWIN_CAPABILITY_CATALOG,
  type DigitalTwinCapabilityMaturity,
} from "./capability-registry";
import { DIGITAL_TWIN_EVENT_CONTRACTS } from "./event-contracts";
import { DIGITAL_TWIN_SERVICE_REGISTRY } from "./service-registry";
import { DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES } from "./unavailable-capabilities";
import {
  ASSET_INTELLIGENCE_V1_INTACT,
  AUTOMATIC_CONTROL_IMPLEMENTED,
  CANONICAL_ASSET_IDENTITY_OWNERSHIP,
  CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
  CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
  DIGITAL_TWIN_API_PREFIX,
  DIGITAL_TWIN_BACKUP_RESTORE_CERTIFIED,
  DIGITAL_TWIN_MODULE_KEY,
  DIGITAL_TWIN_MODULE_REGISTRY_DRIFT_DETECTED,
  DIGITAL_TWIN_OWNERSHIP,
  DIGITAL_TWIN_PREVIOUS_VERSION,
  DIGITAL_TWIN_PRODUCT_NAME,
  DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION,
  DIGITAL_TWIN_READINESS_MARKER,
  DIGITAL_TWIN_RELEASE_TAG,
  DIGITAL_TWIN_ROUTE_PREFIX,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_V1_ENTITLEMENTS,
  DIGITAL_TWIN_V1_FROZEN,
  DIGITAL_TWIN_V1_GA_CERTIFIED,
  DIGITAL_TWIN_VERSION,
  INSPECTION_INTELLIGENCE_V1_INTACT,
  NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
  PHASE_12M_CERTIFIED_COMMIT,
  PHASE_12M_HOSTED_RUN,
  PHYSICAL_ACTUATION_IMPLEMENTED,
  PREDICTIVE_TWIN_IMPLEMENTED,
  PRODUCTION_DIGITAL_TWIN_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PROJECT_CONTROLS_V1_INTACT,
  PROJECT_INTELLIGENCE_V1_INTACT,
  SHARED_SPATIAL_DOMAIN_COMPATIBLE_VERSION,
  SILENT_FIXTURE_FALLBACK_ENABLED,
  SILENT_SOLVER_FALLBACK_ALLOWED,
} from "../version";

export const DIGITAL_TWIN_MIGRATION_LINEAGE = [
  "20260808140000_batch_75_digital_twin_core.sql",
  "20260808150000_batch_76_digital_twin_state.sql",
  "20260808160000_batch_77_digital_twin_state_ingestion.sql",
  "20260808170000_batch_78_digital_twin_telemetry_binding.sql",
  "20260808180000_batch_79_digital_twin_representation_mapping.sql",
  "20260808190000_batch_80_digital_twin_simulation.sql",
  "20260808200000_batch_81_digital_twin_simulation_assurance.sql",
  "20260808210000_batch_82_digital_twin_solver_adapters.sql",
  "20260808220000_batch_83_digital_twin_solver_capabilities.sql",
  "20260808230000_batch_84_digital_twin_digital_thread.sql",
  "20260808240000_batch_85_engineering_shared_spatial_domain.sql",
] as const;

export const DIGITAL_TWIN_API_ROUTES = [
  "identity",
  "state",
  "ingestion",
  "snapshot",
  "telemetry-bindings",
  "representation",
  "representation-navigation",
  "digital-threads",
  "simulation-methods",
  "solver-capabilities",
  "solver-adapter-health",
  "health",
].map((segment) => `${DIGITAL_TWIN_API_PREFIX}/${segment}`);

export type DigitalTwinModuleManifest = {
  schemaVersion: "digital-twin-module-manifest/1";
  moduleKey: typeof DIGITAL_TWIN_MODULE_KEY;
  productName: typeof DIGITAL_TWIN_PRODUCT_NAME;
  commercialName: typeof DIGITAL_TWIN_PRODUCT_NAME;
  version: typeof DIGITAL_TWIN_VERSION;
  status: typeof DIGITAL_TWIN_STATUS;
  previousVersion: typeof DIGITAL_TWIN_PREVIOUS_VERSION;
  releaseTag: typeof DIGITAL_TWIN_RELEASE_TAG;
  readinessMarker: typeof DIGITAL_TWIN_READINESS_MARKER;
  publicContractVersion: typeof DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION;
  osOwner: "engineering";
  routePrefix: typeof DIGITAL_TWIN_ROUTE_PREFIX;
  apiPrefix: typeof DIGITAL_TWIN_API_PREFIX;
  routes: readonly string[];
  apiRoutes: readonly string[];
  capabilities: readonly string[];
  capabilityMaturity: Record<string, DigitalTwinCapabilityMaturity>;
  services: readonly string[];
  eventFamilies: readonly string[];
  unavailableCapabilities: readonly string[];
  permissions: readonly string[];
  healthChecks: readonly string[];
  ownership: Record<string, string>;
  dependencies: {
    sdksConsumed: readonly string[];
    platformServices: readonly string[];
    sharedDomain: readonly string[];
    sharedSpatialDomainCompatibleVersion: typeof SHARED_SPATIAL_DOMAIN_COMPATIBLE_VERSION;
  };
  migrationLineage: readonly string[];
  baseline: { phase12mCertifiedCommit: string; phase12mHostedRun: string };
  featureFlags: Record<string, boolean>;
};

export function generateDigitalTwinModuleManifest(): DigitalTwinModuleManifest {
  return {
    schemaVersion: "digital-twin-module-manifest/1",
    moduleKey: DIGITAL_TWIN_MODULE_KEY,
    productName: DIGITAL_TWIN_PRODUCT_NAME,
    commercialName: DIGITAL_TWIN_PRODUCT_NAME,
    version: DIGITAL_TWIN_VERSION,
    status: DIGITAL_TWIN_STATUS,
    previousVersion: DIGITAL_TWIN_PREVIOUS_VERSION,
    releaseTag: DIGITAL_TWIN_RELEASE_TAG,
    readinessMarker: DIGITAL_TWIN_READINESS_MARKER,
    publicContractVersion: DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION,
    osOwner: "engineering",
    routePrefix: DIGITAL_TWIN_ROUTE_PREFIX,
    apiPrefix: DIGITAL_TWIN_API_PREFIX,
    routes: [DIGITAL_TWIN_ROUTE_PREFIX, `${DIGITAL_TWIN_ROUTE_PREFIX}/release`],
    apiRoutes: DIGITAL_TWIN_API_ROUTES,
    capabilities: DIGITAL_TWIN_CAPABILITY_CATALOG.map((c) => c.id),
    capabilityMaturity: Object.fromEntries(
      DIGITAL_TWIN_CAPABILITY_CATALOG.map((c) => [c.id, c.maturity]),
    ),
    services: DIGITAL_TWIN_SERVICE_REGISTRY.map((s) => s.serviceId),
    eventFamilies: DIGITAL_TWIN_EVENT_CONTRACTS.map((e) => e.familyId),
    unavailableCapabilities: DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES.map(
      (e) => e.capabilityId,
    ),
    permissions: [...DIGITAL_TWIN_V1_ENTITLEMENTS],
    healthChecks: DIGITAL_TWIN_SERVICE_REGISTRY.map((s) => s.healthCheckId),
    ownership: {
      digitalTwin: DIGITAL_TWIN_OWNERSHIP,
      canonicalAssetIdentity: CANONICAL_ASSET_IDENTITY_OWNERSHIP,
      canonicalProjectIdentity: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
      canonicalSpatialReference: CANONICAL_SPATIAL_REFERENCE_OWNERSHIP,
    },
    dependencies: {
      sdksConsumed: [
        "engineering-module-sdk",
        "engineering-domain-sdk",
        "engineering-workflow-sdk",
      ],
      platformServices: ["audit", "event_bus", "entitlements", "capability_registry"],
      sharedDomain: ["engineering_os_shared_domain", "engineering_os_shared_spatial_domain"],
      sharedSpatialDomainCompatibleVersion: SHARED_SPATIAL_DOMAIN_COMPATIBLE_VERSION,
    },
    migrationLineage: DIGITAL_TWIN_MIGRATION_LINEAGE,
    baseline: {
      phase12mCertifiedCommit: PHASE_12M_CERTIFIED_COMMIT,
      phase12mHostedRun: PHASE_12M_HOSTED_RUN,
    },
    featureFlags: {
      digitalTwinV1GaCertified: DIGITAL_TWIN_V1_GA_CERTIFIED,
      digitalTwinV1Frozen: DIGITAL_TWIN_V1_FROZEN,
      productionDigitalTwinReady: PRODUCTION_DIGITAL_TWIN_READY,
      backupRestoreCertified: DIGITAL_TWIN_BACKUP_RESTORE_CERTIFIED,
      moduleRegistryDriftDetected: DIGITAL_TWIN_MODULE_REGISTRY_DRIFT_DETECTED,
      productionMemoryRepositoryAllowed: PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
      assetIntelligenceV1Intact: ASSET_INTELLIGENCE_V1_INTACT,
      projectIntelligenceV1Intact: PROJECT_INTELLIGENCE_V1_INTACT,
      inspectionIntelligenceV1Intact: INSPECTION_INTELLIGENCE_V1_INTACT,
      projectControlsV1Intact: PROJECT_CONTROLS_V1_INTACT,
      physicalActuationImplemented: PHYSICAL_ACTUATION_IMPLEMENTED,
      automaticControlImplemented: AUTOMATIC_CONTROL_IMPLEMENTED,
      predictiveTwinImplemented: PREDICTIVE_TWIN_IMPLEMENTED,
      nativeEngineeringSolverImplemented: NATIVE_ENGINEERING_SOLVER_IMPLEMENTED,
      silentFixtureFallbackEnabled: SILENT_FIXTURE_FALLBACK_ENABLED,
      silentSolverFallbackAllowed: SILENT_SOLVER_FALLBACK_ALLOWED,
    },
  };
}

export function generateManifest(): DigitalTwinModuleManifest {
  return generateDigitalTwinModuleManifest();
}

export function assertManifestConsistentWithRegistries(
  manifest: DigitalTwinModuleManifest = generateDigitalTwinModuleManifest(),
): { ok: true; version: string } {
  if (manifest.version !== DIGITAL_TWIN_VERSION) {
    throw new Error("manifest_version_drift");
  }
  if (manifest.capabilities.length !== DIGITAL_TWIN_CAPABILITY_CATALOG.length) {
    throw new Error("manifest_capability_drift");
  }
  if (manifest.services.length !== DIGITAL_TWIN_SERVICE_REGISTRY.length) {
    throw new Error("manifest_service_drift");
  }
  if (manifest.eventFamilies.length !== DIGITAL_TWIN_EVENT_CONTRACTS.length) {
    throw new Error("manifest_event_family_drift");
  }
  if (
    manifest.unavailableCapabilities.length !==
    DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES.length
  ) {
    throw new Error("manifest_unavailable_drift");
  }
  if (!manifest.routes.includes(DIGITAL_TWIN_ROUTE_PREFIX)) {
    throw new Error("manifest_missing_module_route");
  }
  if (manifest.releaseTag !== DIGITAL_TWIN_RELEASE_TAG) {
    throw new Error("manifest_release_tag_drift");
  }
  if (manifest.featureFlags.productionMemoryRepositoryAllowed !== false) {
    throw new Error("manifest_memory_repository_allowed");
  }
  if (manifest.featureFlags.physicalActuationImplemented !== false) {
    throw new Error("manifest_physical_actuation_enabled");
  }
  if (manifest.featureFlags.silentFixtureFallbackEnabled !== false) {
    throw new Error("manifest_silent_fixture_fallback_enabled");
  }
  return { ok: true, version: manifest.version };
}
