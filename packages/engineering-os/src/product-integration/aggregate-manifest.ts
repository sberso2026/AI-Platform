/**
 * Phase 14B — EngineeringOSManifest (composition metadata only).
 */
import {
  defaultEngineeringModuleRegistry,
  type EngineeringModuleRegistry,
} from "../module-registry";
import {
  ENGINEERING_OS_PHASE,
  ENGINEERING_OS_PUBLIC_CONTRACT_VERSION,
  ENGINEERING_OS_STATUS,
  ENGINEERING_OS_VERSION,
  PRODUCTION_V1_MODULE_KEYS,
} from "../version";
import {
  RUNTIME_ASSET_IDENTITY_OWNERSHIP,
  SEMANTIC_ASSET_IDENTITY_OWNERSHIP,
} from "./ownership-normalizer";

export interface EngineeringOSInstalledModule {
  moduleKey: string;
  name: string;
  version: string;
  status: string;
  enabled: boolean;
  publicContractVersion: string;
  manifestRef: string;
  route: string;
  healthRef: string;
  capabilities: string[];
  entitlements: string[];
  dependencies: string[];
  searchProviders: string[];
  aiCapabilities: string[];
}

export interface EngineeringOSUnavailableCapability {
  id: string;
  classification:
    | "unavailable"
    | "blocked_external_dependency"
    | "not_certified"
    | "reserved";
  detail: string;
}

export interface EngineeringOSManifest {
  engineeringOsVersion: typeof ENGINEERING_OS_VERSION;
  status: typeof ENGINEERING_OS_STATUS;
  phase: typeof ENGINEERING_OS_PHASE;
  publicContractVersion: typeof ENGINEERING_OS_PUBLIC_CONTRACT_VERSION;
  installedModules: EngineeringOSInstalledModule[];
  moduleVersions: Record<string, string>;
  moduleContractVersions: Record<string, string>;
  moduleManifestRefs: Record<string, string>;
  sharedDomainVersions: {
    assetSemanticOwner: typeof SEMANTIC_ASSET_IDENTITY_OWNERSHIP;
    assetRuntimeOwner: typeof RUNTIME_ASSET_IDENTITY_OWNERSHIP;
    project: "0.1.0-shared-project-domain";
    spatial: "0.2.0-spatial-core";
  };
  sdkVersions: {
    moduleSdk: string;
    domainSdk: string;
    workflowSdk: string;
    mobileSdk: string;
  };
  capabilities: string[];
  entitlements: string[];
  routes: string[];
  healthRefs: string[];
  dependencies: string[];
  unavailableCapabilities: EngineeringOSUnavailableCapability[];
  blockedExternalDependencies: string[];
}

const MODULE_HEALTH: Record<string, string> = {
  project_intelligence: "/api/engineering/project-intelligence/health",
  inspection_intelligence: "/engineering/apps/inspection-intelligence/release",
  asset_intelligence: "/api/engineering/asset-intelligence/health",
  project_controls: "/api/engineering/project-controls/health",
  digital_twin: "/api/engineering/digital-twin/health",
  engineering_model_interoperability:
    "/engineering/apps/model-interoperability/release",
};

const MODULE_CONTRACT: Record<string, string> = {
  project_intelligence: "1.0.0",
  inspection_intelligence: "1.0.0",
  asset_intelligence: "1.0.0",
  project_controls: "1.0.0",
  digital_twin: "1.0.0",
  engineering_model_interoperability: "1.0.0",
};

export function buildEngineeringOSManifest(
  registry: EngineeringModuleRegistry = defaultEngineeringModuleRegistry,
): EngineeringOSManifest {
  const modules = registry.list();
  const installedModules: EngineeringOSInstalledModule[] = modules.map((m) => ({
    moduleKey: m.moduleKey,
    name: m.name,
    version: m.version,
    status: m.status,
    enabled: Boolean(m.enabled),
    publicContractVersion: MODULE_CONTRACT[m.moduleKey] ?? m.version,
    manifestRef: `module://${m.moduleKey}@${m.version}`,
    route: m.routes?.[0]?.path ?? `/engineering/apps/${m.moduleKey.replace(/_/g, "-")}`,
    healthRef: MODULE_HEALTH[m.moduleKey] ?? "/api/engineering/health",
    capabilities: (m.features ?? []).flatMap((f) =>
      (f.capabilities ?? []).map((c) => c.id),
    ),
    entitlements: [m.commerceApplicationKey],
    dependencies: ["engineering-os", "platform-commerce"],
    searchProviders: m.searchProviders ?? [],
    aiCapabilities: m.aiCapabilities ?? [],
  }));

  const moduleVersions = Object.fromEntries(
    installedModules.map((m) => [m.moduleKey, m.version]),
  );
  const moduleContractVersions = Object.fromEntries(
    installedModules.map((m) => [m.moduleKey, m.publicContractVersion]),
  );
  const moduleManifestRefs = Object.fromEntries(
    installedModules.map((m) => [m.moduleKey, m.manifestRef]),
  );

  const unavailableCapabilities: EngineeringOSUnavailableCapability[] = [
    {
      id: "spacegass.live_execution",
      classification: "blocked_external_dependency",
      detail: "Licensed SPACE GASS environment unavailable",
    },
    {
      id: "etabs.live_execution",
      classification: "not_certified",
      detail: "ETABS COM/API live execution not certified",
    },
    {
      id: "pof",
      classification: "unavailable",
      detail: "Probability of Failure not independently certified",
    },
    {
      id: "rul",
      classification: "unavailable",
      detail: "Remaining Useful Life not independently certified",
    },
    {
      id: "shm",
      classification: "reserved",
      detail: "Structural Health Monitoring reserved / unavailable in V1",
    },
    {
      id: "analysis_model_generation",
      classification: "reserved",
      detail: "Analysis-model generation reserved / unavailable in V1",
    },
  ];

  return {
    engineeringOsVersion: ENGINEERING_OS_VERSION,
    status: ENGINEERING_OS_STATUS,
    phase: ENGINEERING_OS_PHASE,
    publicContractVersion: ENGINEERING_OS_PUBLIC_CONTRACT_VERSION,
    installedModules,
    moduleVersions,
    moduleContractVersions,
    moduleManifestRefs,
    sharedDomainVersions: {
      assetSemanticOwner: SEMANTIC_ASSET_IDENTITY_OWNERSHIP,
      assetRuntimeOwner: RUNTIME_ASSET_IDENTITY_OWNERSHIP,
      project: "0.1.0-shared-project-domain",
      spatial: "0.2.0-spatial-core",
    },
    sdkVersions: {
      moduleSdk: "0.3.0",
      domainSdk: "0.4.0",
      workflowSdk: "0.5.0",
      mobileSdk: "0.7.0",
    },
    capabilities: [
      "engineering_os",
      "engineering_module_host",
      "engineering_shared_domain",
      "engineering_ai_framework",
      "engineering_search",
      "engineering_health",
      ...installedModules.flatMap((m) => m.capabilities),
    ],
    entitlements: [
      "engineering-os",
      ...installedModules.flatMap((m) => m.entitlements),
      "external_solver.execute",
    ],
    routes: [
      "/engineering",
      "/engineering/modules",
      "/engineering/projects",
      "/engineering/assets",
      "/engineering/search",
      "/engineering/ai",
      "/engineering/reports",
      "/engineering/settings",
      ...installedModules.map((m) => m.route),
    ],
    healthRefs: [
      "/api/engineering/health",
      ...installedModules.map((m) => m.healthRef),
    ],
    dependencies: [
      "platform-kernel",
      "platform-commerce",
      "platform-intelligence",
      "engineering-execution-host",
    ],
    unavailableCapabilities,
    blockedExternalDependencies: ["spacegass.live_licensed_api"],
  };
}

export function assertProductionModulesRegistered(
  manifest: EngineeringOSManifest = buildEngineeringOSManifest(),
): void {
  const keys = new Set(manifest.installedModules.map((m) => m.moduleKey));
  for (const key of PRODUCTION_V1_MODULE_KEYS) {
    if (!keys.has(key)) {
      throw new Error(`moduleRegistryDriftDetected: missing ${key}`);
    }
    const mod = manifest.installedModules.find((m) => m.moduleKey === key)!;
    if (mod.status === "coming_soon" || !mod.enabled || mod.version === "0.0.0") {
      throw new Error(`moduleRegistryDriftDetected: untruthful ${key}`);
    }
  }
}

export const ENGINEERING_OS_AGGREGATE_MANIFEST = buildEngineeringOSManifest();
