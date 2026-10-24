/**
 * Phase 10K — module registry drift detection.
 *
 * version.ts, the generated manifest, the capability registry, the service
 * registry, the event contracts and the unavailable matrix must all agree.
 * Any disagreement is a release blocker, not a warning.
 */

import {
  ASSET_INTELLIGENCE_CAPABILITY_CATALOG,
  assertCapabilityCatalogComplete,
} from "./capability-registry";
import {
  ASSET_INTELLIGENCE_EVENT_CONTRACTS,
  assertEventContractsFrozen,
} from "./event-contracts";
import {
  assertManifestConsistentWithRegistries,
  generateAssetIntelligenceModuleManifest,
} from "./module-manifest";
import {
  ASSET_INTELLIGENCE_SERVICE_REGISTRY,
  assertServiceRegistryComplete,
} from "./service-registry";
import {
  ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES,
  assertUnavailableCapabilitiesClosed,
} from "./unavailable-capabilities";
import {
  ASSET_INTELLIGENCE_MODULE_REGISTRY_DRIFT_DETECTED,
  ASSET_INTELLIGENCE_RELEASE_TAG,
  ASSET_INTELLIGENCE_ROUTE_PREFIX,
  ASSET_INTELLIGENCE_V1_ENTITLEMENTS,
  ASSET_INTELLIGENCE_VERSION,
  PRODUCTION_ASSET_INTELLIGENCE_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
} from "../version";

export type AssetDriftReport = {
  moduleRegistryDriftDetected: false;
  version: string;
  releaseTag: string;
  checks: readonly { name: string; ok: true }[];
};

export function assertNoModuleRegistryDrift(): AssetDriftReport {
  const manifest = generateAssetIntelligenceModuleManifest();
  const checks: { name: string; ok: true }[] = [];

  if (manifest.version !== ASSET_INTELLIGENCE_VERSION) throw new Error("drift:version");
  if (manifest.releaseTag !== ASSET_INTELLIGENCE_RELEASE_TAG) throw new Error("drift:release_tag");
  checks.push({ name: "version", ok: true });

  assertManifestConsistentWithRegistries(manifest);
  checks.push({ name: "manifest", ok: true });

  assertCapabilityCatalogComplete();
  for (const id of ASSET_INTELLIGENCE_CAPABILITY_CATALOG.map((c) => c.id)) {
    if (!manifest.capabilities.includes(id)) throw new Error(`drift:capability:${id}`);
  }
  checks.push({ name: "capabilities", ok: true });

  assertServiceRegistryComplete();
  for (const id of ASSET_INTELLIGENCE_SERVICE_REGISTRY.map((s) => s.serviceId)) {
    if (!manifest.services.includes(id)) throw new Error(`drift:service:${id}`);
  }
  for (const health of ASSET_INTELLIGENCE_SERVICE_REGISTRY.map((s) => s.healthCheckId)) {
    if (!manifest.healthChecks.includes(health)) throw new Error(`drift:health:${health}`);
  }
  checks.push({ name: "services", ok: true });

  assertEventContractsFrozen();
  for (const family of ASSET_INTELLIGENCE_EVENT_CONTRACTS.map((e) => e.familyId)) {
    if (!manifest.eventFamilies.includes(family)) throw new Error(`drift:event_family:${family}`);
  }
  checks.push({ name: "event_contracts", ok: true });

  assertUnavailableCapabilitiesClosed();
  for (const id of ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES.map((e) => e.capabilityId)) {
    if (!manifest.unavailableCapabilities.includes(id)) {
      throw new Error(`drift:unavailable_capability:${id}`);
    }
  }
  checks.push({ name: "unavailable_capabilities", ok: true });

  for (const permission of ASSET_INTELLIGENCE_V1_ENTITLEMENTS) {
    if (!manifest.permissions.includes(permission)) {
      throw new Error(`drift:permission:${permission}`);
    }
  }
  checks.push({ name: "permissions", ok: true });

  if (!manifest.routes.includes(ASSET_INTELLIGENCE_ROUTE_PREFIX)) throw new Error("drift:route");
  checks.push({ name: "routes", ok: true });

  if (ASSET_INTELLIGENCE_MODULE_REGISTRY_DRIFT_DETECTED !== false) {
    throw new Error("drift:flag_must_be_false");
  }
  if (PRODUCTION_MEMORY_REPOSITORY_ALLOWED !== false) {
    throw new Error("drift:memory_repository_allowed");
  }
  if (PRODUCTION_ASSET_INTELLIGENCE_READY !== true) {
    throw new Error("drift:production_not_ready");
  }
  checks.push({ name: "release_locks", ok: true });

  return {
    moduleRegistryDriftDetected: false,
    version: manifest.version,
    releaseTag: manifest.releaseTag,
    checks,
  };
}

/** Non-throwing wrapper for health/observability surfaces. */
export function detectModuleRegistryDrift():
  | { ok: true; report: AssetDriftReport }
  | { ok: false; error: string } {
  try {
    return { ok: true, report: assertNoModuleRegistryDrift() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "unknown_drift" };
  }
}
