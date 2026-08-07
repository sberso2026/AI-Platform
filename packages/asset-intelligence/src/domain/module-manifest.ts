/**
 * Phase 10K — machine-readable Asset Intelligence V1.0 module manifest.
 *
 * Generated from version.ts and the frozen registries. The checked-in JSON under
 * manifest/ is a snapshot of this generator, not a second source of truth.
 */

import {
  ASSET_INTELLIGENCE_CAPABILITY_CATALOG,
  type AssetCapabilityMaturity,
} from "./capability-registry";
import { ASSET_INTELLIGENCE_EVENT_CONTRACTS } from "./event-contracts";
import { ASSET_INTELLIGENCE_SERVICE_REGISTRY } from "./service-registry";
import { ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES } from "./unavailable-capabilities";
import {
  ACCURACY_CLAIMS_CERTIFIED,
  ASSET_FUSION_OWNERSHIP,
  ASSET_IDENTITY_OWNERSHIP,
  ASSET_INTELLIGENCE_API_PREFIX,
  ASSET_INTELLIGENCE_BACKUP_RESTORE_CERTIFIED,
  ASSET_INTELLIGENCE_MODULE_KEY,
  ASSET_INTELLIGENCE_MODULE_REGISTRY_DRIFT_DETECTED,
  ASSET_INTELLIGENCE_OWNERSHIP,
  ASSET_INTELLIGENCE_PREVIOUS_VERSION,
  ASSET_INTELLIGENCE_PRODUCT_NAME,
  ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION,
  ASSET_INTELLIGENCE_READINESS_MARKER,
  ASSET_INTELLIGENCE_RELEASE_TAG,
  ASSET_INTELLIGENCE_ROUTE_PREFIX,
  ASSET_INTELLIGENCE_STATUS,
  ASSET_INTELLIGENCE_V1_ENTITLEMENTS,
  ASSET_INTELLIGENCE_V1_FROZEN,
  ASSET_INTELLIGENCE_V1_GA_CERTIFIED,
  ASSET_INTELLIGENCE_VERSION,
  ASSET_PREDICTIVE_GOVERNANCE_OWNERSHIP,
  CANONICAL_ASSET_LIFECYCLE_OWNERSHIP,
  CANONICAL_ENGINEERING_RISK_OWNERSHIP,
  CMMS_WORK_ORDER_OWNERSHIP,
  CRITICALITY_IS_HEALTH_FACTOR,
  DEGRADATION_HEALTH_CONTRIBUTION_ENABLED,
  FAILURE_HEALTH_CONTRIBUTION_ENABLED,
  FUSION_HEALTH_CONTRIBUTION_ENABLED,
  HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY,
  INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED,
  LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED,
  PHASE_10J_CERTIFIED_COMMIT,
  PHASE_10J_HOSTED_RUN,
  PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED,
  PREDICTIVE_METHODS_CERTIFIED,
  PREDICTIVE_ML_ENABLED,
  PRIORITY_HEALTH_CONTRIBUTION_ENABLED,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  PRODUCTION_ASSET_INTELLIGENCE_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PRODUCTION_PREDICTIVE_EXECUTION_ENABLED,
  QUANTITATIVE_RELIABILITY_CERTIFIED,
  RISK_CORE_AUTO_MUTATION_ALLOWED,
  RISK_HEALTH_CONTRIBUTION_ENABLED,
  RUL_CLAIMS_CERTIFIED,
  SOURCE_TRUST_MODEL_READY,
} from "../version";

export const ASSET_INTELLIGENCE_MIGRATION_LINEAGE = [
  "20260807160000_batch_55_asset_intelligence_timeseries.sql",
  "20260807161000_batch_55b_asset_intelligence_degradation_created_by.sql",
  "20260807170000_batch_56_asset_intelligence_lifecycle.sql",
  "20260807180000_batch_57_asset_intelligence_risk_priority.sql",
  "20260807190000_batch_58_asset_intelligence_fusion.sql",
  "20260807200000_batch_59_asset_intelligence_predictive_governance.sql",
] as const;

export const ASSET_INTELLIGENCE_API_ROUTES = [
  "condition",
  "criticality",
  "decision-context",
  "degradation",
  "failure",
  "failure/taxonomy",
  "fusion",
  "health",
  "health-profile",
  "lifecycle",
  "maintenance-recommendation",
  "predictive-governance",
  "predictive-readiness",
  "priority",
  "reliability",
  "risk",
].map((segment) => `${ASSET_INTELLIGENCE_API_PREFIX}/${segment}`);

export type AssetModuleManifest = {
  schemaVersion: "asset-intelligence-module-manifest/1";
  moduleKey: typeof ASSET_INTELLIGENCE_MODULE_KEY;
  productName: typeof ASSET_INTELLIGENCE_PRODUCT_NAME;
  commercialName: typeof ASSET_INTELLIGENCE_PRODUCT_NAME;
  version: typeof ASSET_INTELLIGENCE_VERSION;
  status: typeof ASSET_INTELLIGENCE_STATUS;
  previousVersion: typeof ASSET_INTELLIGENCE_PREVIOUS_VERSION;
  releaseTag: typeof ASSET_INTELLIGENCE_RELEASE_TAG;
  readinessMarker: typeof ASSET_INTELLIGENCE_READINESS_MARKER;
  publicContractVersion: typeof ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION;
  osOwner: "engineering";
  routePrefix: typeof ASSET_INTELLIGENCE_ROUTE_PREFIX;
  apiPrefix: typeof ASSET_INTELLIGENCE_API_PREFIX;
  routes: readonly string[];
  apiRoutes: readonly string[];
  capabilities: readonly string[];
  capabilityMaturity: Record<string, AssetCapabilityMaturity>;
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
    inspectionIntelligenceContractsConsumed: typeof INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED;
  };
  migrationLineage: readonly string[];
  baseline: { phase10jCertifiedCommit: string; phase10jHostedRun: string };
  featureFlags: Record<string, boolean>;
};

export function generateAssetIntelligenceModuleManifest(): AssetModuleManifest {
  return {
    schemaVersion: "asset-intelligence-module-manifest/1",
    moduleKey: ASSET_INTELLIGENCE_MODULE_KEY,
    productName: ASSET_INTELLIGENCE_PRODUCT_NAME,
    commercialName: ASSET_INTELLIGENCE_PRODUCT_NAME,
    version: ASSET_INTELLIGENCE_VERSION,
    status: ASSET_INTELLIGENCE_STATUS,
    previousVersion: ASSET_INTELLIGENCE_PREVIOUS_VERSION,
    releaseTag: ASSET_INTELLIGENCE_RELEASE_TAG,
    readinessMarker: ASSET_INTELLIGENCE_READINESS_MARKER,
    publicContractVersion: ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION,
    osOwner: "engineering",
    routePrefix: ASSET_INTELLIGENCE_ROUTE_PREFIX,
    apiPrefix: ASSET_INTELLIGENCE_API_PREFIX,
    routes: [ASSET_INTELLIGENCE_ROUTE_PREFIX, `${ASSET_INTELLIGENCE_ROUTE_PREFIX}/release`],
    apiRoutes: ASSET_INTELLIGENCE_API_ROUTES,
    capabilities: ASSET_INTELLIGENCE_CAPABILITY_CATALOG.map((c) => c.id),
    capabilityMaturity: Object.fromEntries(
      ASSET_INTELLIGENCE_CAPABILITY_CATALOG.map((c) => [c.id, c.maturity]),
    ),
    services: ASSET_INTELLIGENCE_SERVICE_REGISTRY.map((s) => s.serviceId),
    eventFamilies: ASSET_INTELLIGENCE_EVENT_CONTRACTS.map((e) => e.familyId),
    unavailableCapabilities: ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES.map(
      (e) => e.capabilityId,
    ),
    permissions: [...ASSET_INTELLIGENCE_V1_ENTITLEMENTS],
    healthChecks: ASSET_INTELLIGENCE_SERVICE_REGISTRY.map((s) => s.healthCheckId),
    ownership: {
      assetIdentity: ASSET_IDENTITY_OWNERSHIP,
      canonicalAssetLifecycle: CANONICAL_ASSET_LIFECYCLE_OWNERSHIP,
      assetIntelligence: ASSET_INTELLIGENCE_OWNERSHIP,
      assetFusion: ASSET_FUSION_OWNERSHIP,
      assetPredictiveGovernance: ASSET_PREDICTIVE_GOVERNANCE_OWNERSHIP,
      canonicalEngineeringRisk: CANONICAL_ENGINEERING_RISK_OWNERSHIP,
      cmmsWorkOrder: CMMS_WORK_ORDER_OWNERSHIP,
    },
    dependencies: {
      sdksConsumed: [
        "engineering-module-sdk",
        "engineering-domain-sdk",
        "engineering-workflow-sdk",
      ],
      platformServices: ["audit", "event_bus", "entitlements", "capability_registry"],
      sharedDomain: ["engineering_assets", "engineering_asset_types"],
      inspectionIntelligenceContractsConsumed: INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED,
    },
    migrationLineage: ASSET_INTELLIGENCE_MIGRATION_LINEAGE,
    baseline: {
      phase10jCertifiedCommit: PHASE_10J_CERTIFIED_COMMIT,
      phase10jHostedRun: PHASE_10J_HOSTED_RUN,
    },
    featureFlags: {
      assetIntelligenceV1GaCertified: ASSET_INTELLIGENCE_V1_GA_CERTIFIED,
      assetIntelligenceV1Frozen: ASSET_INTELLIGENCE_V1_FROZEN,
      productionAssetIntelligenceReady: PRODUCTION_ASSET_INTELLIGENCE_READY,
      hostedAssetIntelligencePersistenceReady: HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY,
      backupRestoreCertified: ASSET_INTELLIGENCE_BACKUP_RESTORE_CERTIFIED,
      moduleRegistryDriftDetected: ASSET_INTELLIGENCE_MODULE_REGISTRY_DRIFT_DETECTED,
      productionMemoryRepositoryAllowed: PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
      productionPredictiveExecutionEnabled: PRODUCTION_PREDICTIVE_EXECUTION_ENABLED,
      predictiveMlEnabled: PREDICTIVE_ML_ENABLED,
      predictiveMethodsCertified: PREDICTIVE_METHODS_CERTIFIED,
      probabilityOfFailureCertified: PROBABILITY_OF_FAILURE_CERTIFIED,
      rulClaimsCertified: RUL_CLAIMS_CERTIFIED,
      accuracyClaimsCertified: ACCURACY_CLAIMS_CERTIFIED,
      quantitativeReliabilityCertified: QUANTITATIVE_RELIABILITY_CERTIFIED,
      sourceTrustModelReady: SOURCE_TRUST_MODEL_READY,
      criticalityIsHealthFactor: CRITICALITY_IS_HEALTH_FACTOR,
      failureHealthContributionEnabled: FAILURE_HEALTH_CONTRIBUTION_ENABLED,
      degradationHealthContributionEnabled: DEGRADATION_HEALTH_CONTRIBUTION_ENABLED,
      lifecycleHealthContributionEnabled: LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED,
      riskHealthContributionEnabled: RISK_HEALTH_CONTRIBUTION_ENABLED,
      priorityHealthContributionEnabled: PRIORITY_HEALTH_CONTRIBUTION_ENABLED,
      fusionHealthContributionEnabled: FUSION_HEALTH_CONTRIBUTION_ENABLED,
      predictiveHealthContributionEnabled: PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED,
      riskCoreAutoMutationAllowed: RISK_CORE_AUTO_MUTATION_ALLOWED,
    },
  };
}

/** Backwards-compatible alias matching the prompt's generateManifest() shape. */
export function generateManifest(): AssetModuleManifest {
  return generateAssetIntelligenceModuleManifest();
}

export function assertManifestConsistentWithRegistries(
  manifest: AssetModuleManifest = generateAssetIntelligenceModuleManifest(),
): { ok: true; version: string } {
  if (manifest.version !== ASSET_INTELLIGENCE_VERSION) {
    throw new Error("manifest_version_drift");
  }
  if (manifest.capabilities.length !== ASSET_INTELLIGENCE_CAPABILITY_CATALOG.length) {
    throw new Error("manifest_capability_drift");
  }
  if (manifest.services.length !== ASSET_INTELLIGENCE_SERVICE_REGISTRY.length) {
    throw new Error("manifest_service_drift");
  }
  if (manifest.eventFamilies.length !== ASSET_INTELLIGENCE_EVENT_CONTRACTS.length) {
    throw new Error("manifest_event_family_drift");
  }
  if (
    manifest.unavailableCapabilities.length !==
    ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES.length
  ) {
    throw new Error("manifest_unavailable_drift");
  }
  if (!manifest.routes.includes(ASSET_INTELLIGENCE_ROUTE_PREFIX)) {
    throw new Error("manifest_missing_module_route");
  }
  if (manifest.releaseTag !== ASSET_INTELLIGENCE_RELEASE_TAG) {
    throw new Error("manifest_release_tag_drift");
  }
  if (manifest.featureFlags.productionPredictiveExecutionEnabled !== false) {
    throw new Error("manifest_predictive_execution_enabled");
  }
  if (manifest.featureFlags.productionMemoryRepositoryAllowed !== false) {
    throw new Error("manifest_memory_repository_allowed");
  }
  return { ok: true, version: manifest.version };
}
