/**
 * Phase 13F — machine-readable Engineering Model Interoperability V1.0 module manifest.
 */

import {
  EMI_CAPABILITY_CATALOG,
  type EmiCapabilityMaturity,
} from "./capability-registry";
import { EMI_EVENT_CONTRACTS } from "./event-contracts";
import { EMI_SERVICE_REGISTRY } from "./service-registry";
import { EMI_UNAVAILABLE_CAPABILITIES } from "./unavailable-capabilities";
import {
  CANONICAL_ASSET_OWNERSHIP,
  CANONICAL_PROJECT_OWNERSHIP,
  CANONICAL_SPATIAL_OWNERSHIP,
  COMMERCIAL_PACKAGING_READY,
  CONTROLLED_EXECUTION_HOST_OWNERSHIP,
  DIGITAL_TWIN_OWNERSHIP,
  DIGITAL_TWIN_V1_INTACT,
  ENGINEERING_MODEL_INTEROPERABILITY_API_PREFIX,
  ENGINEERING_MODEL_INTEROPERABILITY_KEY,
  ENGINEERING_MODEL_INTEROPERABILITY_MODULE_REGISTRY_DRIFT_DETECTED,
  ENGINEERING_MODEL_INTEROPERABILITY_NAME,
  ENGINEERING_MODEL_INTEROPERABILITY_PREVIOUS_VERSION,
  ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACT_VERSION,
  ENGINEERING_MODEL_INTEROPERABILITY_READINESS_MARKER,
  ENGINEERING_MODEL_INTEROPERABILITY_RELEASE_TAG,
  ENGINEERING_MODEL_INTEROPERABILITY_ROUTE_PREFIX,
  ENGINEERING_MODEL_INTEROPERABILITY_STATUS,
  ENGINEERING_MODEL_INTEROPERABILITY_V1_ENTITLEMENTS,
  ENGINEERING_MODEL_INTEROPERABILITY_V1_FROZEN,
  ENGINEERING_MODEL_INTEROPERABILITY_V1_GA_CERTIFIED,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  ETABS_CONTROLLED_EXECUTION_CERTIFIED,
  ETABS_HOSTED_EXECUTION_CERTIFIED,
  MODEL_INTEROPERABILITY_OWNERSHIP,
  MODULE_MANIFEST_FROZEN,
  OPERATIONAL_CERTIFICATION_READY,
  PHASE_13E_CERTIFIED_COMMIT,
  PHASE_13E_HOSTED_RUN,
  PRODUCTION_ENGINEERING_MODEL_INTEROPERABILITY_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PUBLIC_CONTRACTS_FROZEN,
  SILENT_SOLVER_FALLBACK_ALLOWED,
  SPACEGASS_LIVE_EXECUTION_CERTIFIED,
  SPACEGASS_LIVE_PROVIDER_READY,
} from "../version";

export const EMI_MIGRATION_LINEAGE = [
  "20260808250000_batch_86_engineering_model_interoperability_ifc.sql",
  "20260808260000_batch_87_engineering_model_interoperability_spacegass.sql",
  "20260808270000_batch_88_engineering_execution_hosts.sql",
  "20260808280000_batch_89_engineering_model_interoperability_etabs.sql",
] as const;

export const EMI_API_ROUTES = [
  "models",
  "versions",
  "elements",
  "mappings",
  "reviews",
  "change-impacts",
  "results",
  "spacegass",
  "etabs",
].map((segment) => `${ENGINEERING_MODEL_INTEROPERABILITY_API_PREFIX}/${segment}`);

export type EmiModuleManifest = {
  schemaVersion: "engineering-model-interoperability-module-manifest/1";
  moduleKey: typeof ENGINEERING_MODEL_INTEROPERABILITY_KEY;
  productName: typeof ENGINEERING_MODEL_INTEROPERABILITY_NAME;
  commercialName: "Engineering Model Interoperability";
  version: typeof ENGINEERING_MODEL_INTEROPERABILITY_VERSION;
  status: typeof ENGINEERING_MODEL_INTEROPERABILITY_STATUS;
  previousVersion: typeof ENGINEERING_MODEL_INTEROPERABILITY_PREVIOUS_VERSION;
  releaseTag: typeof ENGINEERING_MODEL_INTEROPERABILITY_RELEASE_TAG;
  readinessMarker: typeof ENGINEERING_MODEL_INTEROPERABILITY_READINESS_MARKER;
  publicContractVersion: typeof ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACT_VERSION;
  osOwner: "engineering";
  routePrefix: typeof ENGINEERING_MODEL_INTEROPERABILITY_ROUTE_PREFIX;
  apiPrefix: typeof ENGINEERING_MODEL_INTEROPERABILITY_API_PREFIX;
  routes: readonly string[];
  apiRoutes: readonly string[];
  capabilities: readonly string[];
  capabilityMaturity: Record<string, EmiCapabilityMaturity>;
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
    digitalTwinCompatibleVersion: "1.0.0";
    executionHostCompatibleVersion: "0.1.0-execution-host";
  };
  migrationLineage: readonly string[];
  baseline: {
    phase13eCertifiedCommit: string;
    phase13eHostedRun: string;
  };
  featureFlags: Record<string, boolean | string>;
};

export function generateEngineeringModelInteroperabilityModuleManifest(): EmiModuleManifest {
  return {
    schemaVersion: "engineering-model-interoperability-module-manifest/1",
    moduleKey: ENGINEERING_MODEL_INTEROPERABILITY_KEY,
    productName: ENGINEERING_MODEL_INTEROPERABILITY_NAME,
    commercialName: "Engineering Model Interoperability",
    version: ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
    status: ENGINEERING_MODEL_INTEROPERABILITY_STATUS,
    previousVersion: ENGINEERING_MODEL_INTEROPERABILITY_PREVIOUS_VERSION,
    releaseTag: ENGINEERING_MODEL_INTEROPERABILITY_RELEASE_TAG,
    readinessMarker: ENGINEERING_MODEL_INTEROPERABILITY_READINESS_MARKER,
    publicContractVersion:
      ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACT_VERSION,
    osOwner: "engineering",
    routePrefix: ENGINEERING_MODEL_INTEROPERABILITY_ROUTE_PREFIX,
    apiPrefix: ENGINEERING_MODEL_INTEROPERABILITY_API_PREFIX,
    routes: [
      ENGINEERING_MODEL_INTEROPERABILITY_ROUTE_PREFIX,
      `${ENGINEERING_MODEL_INTEROPERABILITY_ROUTE_PREFIX}/release`,
      "/engineering/apps/execution-hosts",
    ],
    apiRoutes: EMI_API_ROUTES,
    capabilities: EMI_CAPABILITY_CATALOG.map((c) => c.id),
    capabilityMaturity: Object.fromEntries(
      EMI_CAPABILITY_CATALOG.map((c) => [c.id, c.maturity]),
    ),
    services: EMI_SERVICE_REGISTRY.map((s) => s.serviceId),
    eventFamilies: EMI_EVENT_CONTRACTS.map((e) => e.familyId),
    unavailableCapabilities: EMI_UNAVAILABLE_CAPABILITIES.map(
      (e) => e.capabilityId,
    ),
    permissions: [...ENGINEERING_MODEL_INTEROPERABILITY_V1_ENTITLEMENTS],
    healthChecks: EMI_SERVICE_REGISTRY.map((s) => s.healthCheckId),
    ownership: {
      engineeringModelInteroperability: MODEL_INTEROPERABILITY_OWNERSHIP,
      canonicalAssetIdentity: CANONICAL_ASSET_OWNERSHIP,
      canonicalProjectIdentity: CANONICAL_PROJECT_OWNERSHIP,
      canonicalSpatialReference: CANONICAL_SPATIAL_OWNERSHIP,
      digitalTwin: DIGITAL_TWIN_OWNERSHIP,
      controlledExecutionHost: CONTROLLED_EXECUTION_HOST_OWNERSHIP,
    },
    dependencies: {
      sdksConsumed: [
        "engineering-module-sdk",
        "engineering-domain-sdk",
        "engineering-workflow-sdk",
      ],
      platformServices: [
        "audit",
        "event_bus",
        "entitlements",
        "capability_registry",
        "platform_files",
      ],
      sharedDomain: [
        "engineering_os_shared_domain",
        "engineering_os_shared_project_domain",
        "engineering_os_shared_spatial_domain",
      ],
      digitalTwinCompatibleVersion: "1.0.0",
      executionHostCompatibleVersion: "0.1.0-execution-host",
    },
    migrationLineage: EMI_MIGRATION_LINEAGE,
    baseline: {
      phase13eCertifiedCommit: PHASE_13E_CERTIFIED_COMMIT,
      phase13eHostedRun: PHASE_13E_HOSTED_RUN,
    },
    featureFlags: {
      engineeringModelInteroperabilityV1GaCertified:
        ENGINEERING_MODEL_INTEROPERABILITY_V1_GA_CERTIFIED,
      engineeringModelInteroperabilityV1Frozen:
        ENGINEERING_MODEL_INTEROPERABILITY_V1_FROZEN,
      productionEngineeringModelInteroperabilityReady:
        PRODUCTION_ENGINEERING_MODEL_INTEROPERABILITY_READY,
      publicContractsFrozen: PUBLIC_CONTRACTS_FROZEN,
      moduleManifestFrozen: MODULE_MANIFEST_FROZEN,
      commercialPackagingReady: COMMERCIAL_PACKAGING_READY,
      operationalCertificationReady: OPERATIONAL_CERTIFICATION_READY,
      moduleRegistryDriftDetected:
        ENGINEERING_MODEL_INTEROPERABILITY_MODULE_REGISTRY_DRIFT_DETECTED,
      productionMemoryRepositoryAllowed: PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
      digitalTwinV1Intact: DIGITAL_TWIN_V1_INTACT,
      SPACEGASSLiveProviderReady: SPACEGASS_LIVE_PROVIDER_READY,
      SPACEGASSLiveExecutionCertified: SPACEGASS_LIVE_EXECUTION_CERTIFIED,
      ETABSHostedExecutionCertified: ETABS_HOSTED_EXECUTION_CERTIFIED,
      ETABSControlledExecutionCertified: ETABS_CONTROLLED_EXECUTION_CERTIFIED,
      silentSolverFallbackAllowed: SILENT_SOLVER_FALLBACK_ALLOWED,
      phase13DStatus: "blocked_external_dependency",
    },
  };
}

export function generateManifest(): EmiModuleManifest {
  return generateEngineeringModelInteroperabilityModuleManifest();
}

export function assertManifestConsistentWithRegistries(
  manifest: EmiModuleManifest = generateEngineeringModelInteroperabilityModuleManifest(),
): { ok: true; version: string } {
  if (manifest.version !== ENGINEERING_MODEL_INTEROPERABILITY_VERSION) {
    throw new Error("manifest_version_drift");
  }
  if (manifest.capabilities.length !== EMI_CAPABILITY_CATALOG.length) {
    throw new Error("manifest_capability_drift");
  }
  if (manifest.services.length !== EMI_SERVICE_REGISTRY.length) {
    throw new Error("manifest_service_drift");
  }
  if (manifest.eventFamilies.length !== EMI_EVENT_CONTRACTS.length) {
    throw new Error("manifest_event_family_drift");
  }
  if (
    manifest.unavailableCapabilities.length !==
    EMI_UNAVAILABLE_CAPABILITIES.length
  ) {
    throw new Error("manifest_unavailable_drift");
  }
  if (!manifest.routes.includes(ENGINEERING_MODEL_INTEROPERABILITY_ROUTE_PREFIX)) {
    throw new Error("manifest_missing_module_route");
  }
  if (manifest.releaseTag !== ENGINEERING_MODEL_INTEROPERABILITY_RELEASE_TAG) {
    throw new Error("manifest_release_tag_drift");
  }
  if (manifest.featureFlags.productionMemoryRepositoryAllowed !== false) {
    throw new Error("manifest_memory_repository_allowed");
  }
  if (manifest.featureFlags.silentSolverFallbackAllowed !== false) {
    throw new Error("manifest_silent_solver_fallback_enabled");
  }
  if (manifest.featureFlags.SPACEGASSLiveExecutionCertified !== false) {
    throw new Error("manifest_spacegass_live_claimed");
  }
  return { ok: true, version: manifest.version };
}
