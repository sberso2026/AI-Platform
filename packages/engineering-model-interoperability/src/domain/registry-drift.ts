/**
 * Phase 13F — module registry drift detection.
 */

import {
  EMI_CAPABILITY_CATALOG,
  assertCapabilityCatalogComplete,
} from "./capability-registry";
import {
  EMI_EVENT_CONTRACTS,
  assertEventContractsFrozen,
} from "./event-contracts";
import {
  assertManifestConsistentWithRegistries,
  generateEngineeringModelInteroperabilityModuleManifest,
} from "./module-manifest";
import {
  EMI_SERVICE_REGISTRY,
  assertServiceRegistryComplete,
} from "./service-registry";
import {
  EMI_UNAVAILABLE_CAPABILITIES,
  assertUnavailableCapabilitiesClosed,
} from "./unavailable-capabilities";
import {
  ENGINEERING_MODEL_INTEROPERABILITY_MODULE_REGISTRY_DRIFT_DETECTED,
  ENGINEERING_MODEL_INTEROPERABILITY_RELEASE_TAG,
  ENGINEERING_MODEL_INTEROPERABILITY_ROUTE_PREFIX,
  ENGINEERING_MODEL_INTEROPERABILITY_V1_ENTITLEMENTS,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  PRODUCTION_ENGINEERING_MODEL_INTEROPERABILITY_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  SPACEGASS_LIVE_EXECUTION_CERTIFIED,
} from "../version";

export type EmiDriftReport = {
  moduleRegistryDriftDetected: false;
  version: string;
  releaseTag: string;
  checks: readonly { name: string; ok: true }[];
};

export function assertNoModuleRegistryDrift(): EmiDriftReport {
  const manifest = generateEngineeringModelInteroperabilityModuleManifest();
  const checks: { name: string; ok: true }[] = [];

  if (manifest.version !== ENGINEERING_MODEL_INTEROPERABILITY_VERSION) {
    throw new Error("drift:version");
  }
  if (manifest.releaseTag !== ENGINEERING_MODEL_INTEROPERABILITY_RELEASE_TAG) {
    throw new Error("drift:release_tag");
  }
  checks.push({ name: "version", ok: true });

  assertManifestConsistentWithRegistries(manifest);
  checks.push({ name: "manifest", ok: true });

  assertCapabilityCatalogComplete();
  for (const id of EMI_CAPABILITY_CATALOG.map((c) => c.id)) {
    if (!manifest.capabilities.includes(id)) {
      throw new Error(`drift:capability:${id}`);
    }
  }
  checks.push({ name: "capabilities", ok: true });

  assertServiceRegistryComplete();
  for (const id of EMI_SERVICE_REGISTRY.map((s) => s.serviceId)) {
    if (!manifest.services.includes(id)) {
      throw new Error(`drift:service:${id}`);
    }
  }
  for (const health of EMI_SERVICE_REGISTRY.map((s) => s.healthCheckId)) {
    if (!manifest.healthChecks.includes(health)) {
      throw new Error(`drift:health:${health}`);
    }
  }
  checks.push({ name: "services", ok: true });

  assertEventContractsFrozen();
  for (const family of EMI_EVENT_CONTRACTS.map((e) => e.familyId)) {
    if (!manifest.eventFamilies.includes(family)) {
      throw new Error(`drift:event_family:${family}`);
    }
  }
  checks.push({ name: "event_contracts", ok: true });

  assertUnavailableCapabilitiesClosed();
  for (const id of EMI_UNAVAILABLE_CAPABILITIES.map((e) => e.capabilityId)) {
    if (!manifest.unavailableCapabilities.includes(id)) {
      throw new Error(`drift:unavailable_capability:${id}`);
    }
  }
  checks.push({ name: "unavailable_capabilities", ok: true });

  for (const permission of ENGINEERING_MODEL_INTEROPERABILITY_V1_ENTITLEMENTS) {
    if (!manifest.permissions.includes(permission)) {
      throw new Error(`drift:permission:${permission}`);
    }
  }
  checks.push({ name: "permissions", ok: true });

  if (!manifest.routes.includes(ENGINEERING_MODEL_INTEROPERABILITY_ROUTE_PREFIX)) {
    throw new Error("drift:route");
  }
  checks.push({ name: "routes", ok: true });

  if (
    ENGINEERING_MODEL_INTEROPERABILITY_MODULE_REGISTRY_DRIFT_DETECTED !== false
  ) {
    throw new Error("drift:flag_must_be_false");
  }
  if (PRODUCTION_MEMORY_REPOSITORY_ALLOWED !== false) {
    throw new Error("drift:memory_repository_allowed");
  }
  if (PRODUCTION_ENGINEERING_MODEL_INTEROPERABILITY_READY !== true) {
    throw new Error("drift:production_not_ready");
  }
  if (SPACEGASS_LIVE_EXECUTION_CERTIFIED !== false) {
    throw new Error("drift:spacegass_live_claimed");
  }
  checks.push({ name: "release_locks", ok: true });

  return {
    moduleRegistryDriftDetected: false,
    version: manifest.version,
    releaseTag: manifest.releaseTag,
    checks,
  };
}

export function detectModuleRegistryDrift():
  | { ok: true; report: EmiDriftReport }
  | { ok: false; error: string } {
  try {
    return { ok: true, report: assertNoModuleRegistryDrift() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_drift",
    };
  }
}
