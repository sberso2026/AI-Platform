/**
 * Phase 11N — machine-readable Project Controls V1.0 module manifest generator.
 */

import {
  PROJECT_CONTROLS_CAPABILITY_CATALOG,
  type ProjectCapabilityMaturity,
} from "./capability-registry";
import { PROJECT_CONTROLS_EVENT_CONTRACTS } from "./event-contracts";
import { PROJECT_CONTROLS_SERVICE_REGISTRY } from "./service-registry";
import { PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES } from "./unavailable-capabilities";
import {
  ASSET_INTELLIGENCE_V1_INTACT,
  ASSET_INTELLIGENCE_V1_VERSION,
  AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED,
  AUTOMATIC_DECISION_EXECUTION_ENABLED,
  AUTOMATIC_KNOWLEDGE_MUTATION_ENABLED,
  AUTOMATIC_LEARNING_APPROVAL_ENABLED,
  CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
  CPM_SCHEDULING_IMPLEMENTED,
  DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
  EARNED_VALUE_IMPLEMENTED,
  FINANCIAL_LEDGER_OWNERSHIP,
  FINANCIAL_POSTING_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_V1_INTACT,
  PHASE_11M_CERTIFIED_COMMIT,
  PHASE_11M_HOSTED_RUN,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PRODUCTION_PROJECT_CONTROLS_READY,
  PROJECT_CONTROLS_API_PREFIX,
  PROJECT_CONTROLS_BACKUP_RESTORE_CERTIFIED,
  PROJECT_CONTROLS_MODULE_KEY,
  PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED,
  PROJECT_CONTROLS_OWNERSHIP,
  PROJECT_CONTROLS_PREVIOUS_VERSION,
  PROJECT_CONTROLS_PRODUCT_NAME,
  PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION,
  PROJECT_CONTROLS_READINESS_MARKER,
  PROJECT_CONTROLS_RELEASE_TAG,
  PROJECT_CONTROLS_ROUTE_PREFIX,
  PROJECT_CONTROLS_STATUS,
  PROJECT_CONTROLS_V1_ENTITLEMENTS,
  PROJECT_CONTROLS_V1_FROZEN,
  PROJECT_CONTROLS_V1_GA_CERTIFIED,
  PROJECT_CONTROLS_VERSION,
  projectDecisionOwnership,
  PROJECT_INTELLIGENCE_V1_INTACT,
  RESOURCE_LEVELING_IMPLEMENTED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
  SHARED_PROJECT_DOMAIN_MIGRATION,
  PROJECT_CONTROLS_PROGRESS_MIGRATION,
  PROJECT_CONTROLS_SCHEDULE_MIGRATION,
  PROJECT_CONTROLS_CHANGE_MIGRATION,
  PROJECT_CONTROLS_COST_MIGRATION,
  PROJECT_CONTROLS_PRODUCTIVITY_MIGRATION,
  PROJECT_CONTROLS_FORECAST_MIGRATION,
  PROJECT_CONTROLS_DECISION_MIGRATION,
  PROJECT_CONTROLS_SCENARIO_MIGRATION,
  PROJECT_CONTROLS_RISK_OPPORTUNITY_MIGRATION,
  PROJECT_CONTROLS_ASSURANCE_MIGRATION,
  PROJECT_CONTROLS_EXPLAINABILITY_MIGRATION,
  PROJECT_CONTROLS_ORGANIZATIONAL_LEARNING_MIGRATION,
} from "../version";

export const PROJECT_CONTROLS_MIGRATION_LINEAGE = [
  SHARED_PROJECT_DOMAIN_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_PROGRESS_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_SCHEDULE_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_CHANGE_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_COST_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_PRODUCTIVITY_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_FORECAST_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_DECISION_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_SCENARIO_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_RISK_OPPORTUNITY_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_ASSURANCE_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_EXPLAINABILITY_MIGRATION.replace("supabase/migrations/", ""),
  PROJECT_CONTROLS_ORGANIZATIONAL_LEARNING_MIGRATION.replace("supabase/migrations/", ""),
] as const;

export const PROJECT_CONTROLS_API_ROUTES = [
  "progress",
  "schedule",
  "change",
  "cost",
  "productivity",
  "forecast",
  "decision",
  "scenario",
  "risk-opportunity",
  "assurance",
  "explainability",
  "organizational-learning",
  "snapshot",
  "profile",
  "health",
].map((segment) => `${PROJECT_CONTROLS_API_PREFIX}/${segment}`);

export type ProjectModuleManifest = {
  schemaVersion: "project-controls-module-manifest/1";
  moduleKey: typeof PROJECT_CONTROLS_MODULE_KEY;
  productName: typeof PROJECT_CONTROLS_PRODUCT_NAME;
  commercialName: typeof PROJECT_CONTROLS_PRODUCT_NAME;
  version: typeof PROJECT_CONTROLS_VERSION;
  status: typeof PROJECT_CONTROLS_STATUS;
  previousVersion: typeof PROJECT_CONTROLS_PREVIOUS_VERSION;
  releaseTag: typeof PROJECT_CONTROLS_RELEASE_TAG;
  readinessMarker: typeof PROJECT_CONTROLS_READINESS_MARKER;
  publicContractVersion: typeof PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION;
  osOwner: "engineering";
  routePrefix: typeof PROJECT_CONTROLS_ROUTE_PREFIX;
  apiPrefix: typeof PROJECT_CONTROLS_API_PREFIX;
  routes: readonly string[];
  apiRoutes: readonly string[];
  capabilities: readonly string[];
  capabilityMaturity: Record<string, ProjectCapabilityMaturity>;
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
    assetIntelligenceContractsConsumed: typeof ASSET_INTELLIGENCE_V1_VERSION;
  };
  migrationLineage: readonly string[];
  baseline: { phase11mCertifiedCommit: string; phase11mHostedRun: string };
  featureFlags: Record<string, boolean>;
};

export function generateProjectControlsModuleManifest(): ProjectModuleManifest {
  return {
    schemaVersion: "project-controls-module-manifest/1",
    moduleKey: PROJECT_CONTROLS_MODULE_KEY,
    productName: PROJECT_CONTROLS_PRODUCT_NAME,
    commercialName: PROJECT_CONTROLS_PRODUCT_NAME,
    version: PROJECT_CONTROLS_VERSION,
    status: PROJECT_CONTROLS_STATUS,
    previousVersion: PROJECT_CONTROLS_PREVIOUS_VERSION,
    releaseTag: PROJECT_CONTROLS_RELEASE_TAG,
    readinessMarker: PROJECT_CONTROLS_READINESS_MARKER,
    publicContractVersion: PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION,
    osOwner: "engineering",
    routePrefix: PROJECT_CONTROLS_ROUTE_PREFIX,
    apiPrefix: PROJECT_CONTROLS_API_PREFIX,
    routes: [PROJECT_CONTROLS_ROUTE_PREFIX, `${PROJECT_CONTROLS_ROUTE_PREFIX}/release`],
    apiRoutes: PROJECT_CONTROLS_API_ROUTES,
    capabilities: PROJECT_CONTROLS_CAPABILITY_CATALOG.map((c) => c.id),
    capabilityMaturity: Object.fromEntries(
      PROJECT_CONTROLS_CAPABILITY_CATALOG.map((c) => [c.id, c.maturity]),
    ),
    services: PROJECT_CONTROLS_SERVICE_REGISTRY.map((s) => s.serviceId),
    eventFamilies: PROJECT_CONTROLS_EVENT_CONTRACTS.map((e) => e.familyId),
    unavailableCapabilities: PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES.map(
      (e) => e.capabilityId,
    ),
    permissions: [...PROJECT_CONTROLS_V1_ENTITLEMENTS],
    healthChecks: PROJECT_CONTROLS_SERVICE_REGISTRY.map((s) => s.healthCheckId),
    ownership: {
      projectControls: PROJECT_CONTROLS_OWNERSHIP,
      canonicalProjectIdentity: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
      projectDecision: projectDecisionOwnership,
      financialLedger: FINANCIAL_LEDGER_OWNERSHIP,
    },
    dependencies: {
      sdksConsumed: [
        "engineering-module-sdk",
        "engineering-domain-sdk",
        "engineering-workflow-sdk",
      ],
      platformServices: ["audit", "event_bus", "entitlements", "capability_registry"],
      sharedDomain: ["engineering_projects"],
      assetIntelligenceContractsConsumed: ASSET_INTELLIGENCE_V1_VERSION,
    },
    migrationLineage: PROJECT_CONTROLS_MIGRATION_LINEAGE,
    baseline: {
      phase11mCertifiedCommit: PHASE_11M_CERTIFIED_COMMIT,
      phase11mHostedRun: PHASE_11M_HOSTED_RUN,
    },
    featureFlags: {
      projectControlsV1GaCertified: PROJECT_CONTROLS_V1_GA_CERTIFIED,
      projectControlsV1Frozen: PROJECT_CONTROLS_V1_FROZEN,
      productionProjectControlsReady: PRODUCTION_PROJECT_CONTROLS_READY,
      backupRestoreCertified: PROJECT_CONTROLS_BACKUP_RESTORE_CERTIFIED,
      moduleRegistryDriftDetected: PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED,
      productionMemoryRepositoryAllowed: PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
      assetIntelligenceV1Intact: ASSET_INTELLIGENCE_V1_INTACT,
      projectIntelligenceV1Intact: PROJECT_INTELLIGENCE_V1_INTACT,
      inspectionIntelligenceV1Intact: INSPECTION_INTELLIGENCE_V1_INTACT,
      duplicateProjectOwnershipDetected: DUPLICATE_PROJECT_OWNERSHIP_DETECTED,
      cpmSchedulingImplemented: CPM_SCHEDULING_IMPLEMENTED,
      earnedValueImplemented: EARNED_VALUE_IMPLEMENTED,
      financialPostingImplemented: FINANCIAL_POSTING_IMPLEMENTED,
      scheduleExecutionImplemented: SCHEDULE_EXECUTION_IMPLEMENTED,
      resourceLevelingImplemented: RESOURCE_LEVELING_IMPLEMENTED,
      automaticDecisionExecutionEnabled: AUTOMATIC_DECISION_EXECUTION_ENABLED,
      automaticContractInstructionEnabled: AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED,
      automaticLearningApprovalEnabled: AUTOMATIC_LEARNING_APPROVAL_ENABLED,
      automaticKnowledgeMutationEnabled: AUTOMATIC_KNOWLEDGE_MUTATION_ENABLED,
    },
  };
}

export function generateManifest(): ProjectModuleManifest {
  return generateProjectControlsModuleManifest();
}

export function assertManifestConsistentWithRegistries(
  manifest: ProjectModuleManifest = generateProjectControlsModuleManifest(),
): { ok: true; version: string } {
  if (manifest.version !== PROJECT_CONTROLS_VERSION) {
    throw new Error("manifest_version_drift");
  }
  if (manifest.capabilities.length !== PROJECT_CONTROLS_CAPABILITY_CATALOG.length) {
    throw new Error("manifest_capability_drift");
  }
  if (manifest.services.length !== PROJECT_CONTROLS_SERVICE_REGISTRY.length) {
    throw new Error("manifest_service_drift");
  }
  if (manifest.eventFamilies.length !== PROJECT_CONTROLS_EVENT_CONTRACTS.length) {
    throw new Error("manifest_event_family_drift");
  }
  if (
    manifest.unavailableCapabilities.length !==
    PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES.length
  ) {
    throw new Error("manifest_unavailable_drift");
  }
  if (!manifest.routes.includes(PROJECT_CONTROLS_ROUTE_PREFIX)) {
    throw new Error("manifest_missing_module_route");
  }
  if (manifest.releaseTag !== PROJECT_CONTROLS_RELEASE_TAG) {
    throw new Error("manifest_release_tag_drift");
  }
  if (manifest.featureFlags.productionMemoryRepositoryAllowed !== false) {
    throw new Error("manifest_memory_repository_allowed");
  }
  if (manifest.featureFlags.cpmSchedulingImplemented !== false) {
    throw new Error("manifest_cpm_enabled");
  }
  return { ok: true, version: manifest.version };
}
