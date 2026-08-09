/**
 * Phase 12N — module registry drift detection.
 */

import {
  DIGITAL_TWIN_CAPABILITY_CATALOG,
  assertCapabilityCatalogComplete,
} from "./capability-registry";
import {
  DIGITAL_TWIN_EVENT_CONTRACTS,
  assertEventContractsFrozen,
} from "./event-contracts";
import {
  assertManifestConsistentWithRegistries,
  generateDigitalTwinModuleManifest,
} from "./module-manifest";
import {
  DIGITAL_TWIN_SERVICE_REGISTRY,
  assertServiceRegistryComplete,
} from "./service-registry";
import {
  DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES,
  assertUnavailableCapabilitiesClosed,
} from "./unavailable-capabilities";
import {
  DIGITAL_TWIN_MODULE_REGISTRY_DRIFT_DETECTED,
  DIGITAL_TWIN_RELEASE_TAG,
  DIGITAL_TWIN_ROUTE_PREFIX,
  DIGITAL_TWIN_V1_ENTITLEMENTS,
  DIGITAL_TWIN_VERSION,
  PRODUCTION_DIGITAL_TWIN_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
} from "../version";

export type DigitalTwinDriftReport = {
  moduleRegistryDriftDetected: false;
  version: string;
  releaseTag: string;
  checks: readonly { name: string; ok: true }[];
};

export function assertNoModuleRegistryDrift(): DigitalTwinDriftReport {
  const manifest = generateDigitalTwinModuleManifest();
  const checks: { name: string; ok: true }[] = [];

  if (manifest.version !== DIGITAL_TWIN_VERSION) throw new Error("drift:version");
  if (manifest.releaseTag !== DIGITAL_TWIN_RELEASE_TAG) throw new Error("drift:release_tag");
  checks.push({ name: "version", ok: true });

  assertManifestConsistentWithRegistries(manifest);
  checks.push({ name: "manifest", ok: true });

  assertCapabilityCatalogComplete();
  for (const id of DIGITAL_TWIN_CAPABILITY_CATALOG.map((c) => c.id)) {
    if (!manifest.capabilities.includes(id)) throw new Error(`drift:capability:${id}`);
  }
  checks.push({ name: "capabilities", ok: true });

  assertServiceRegistryComplete();
  for (const id of DIGITAL_TWIN_SERVICE_REGISTRY.map((s) => s.serviceId)) {
    if (!manifest.services.includes(id)) throw new Error(`drift:service:${id}`);
  }
  for (const health of DIGITAL_TWIN_SERVICE_REGISTRY.map((s) => s.healthCheckId)) {
    if (!manifest.healthChecks.includes(health)) throw new Error(`drift:health:${health}`);
  }
  checks.push({ name: "services", ok: true });

  assertEventContractsFrozen();
  for (const family of DIGITAL_TWIN_EVENT_CONTRACTS.map((e) => e.familyId)) {
    if (!manifest.eventFamilies.includes(family)) throw new Error(`drift:event_family:${family}`);
  }
  checks.push({ name: "event_contracts", ok: true });

  assertUnavailableCapabilitiesClosed();
  for (const id of DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES.map((e) => e.capabilityId)) {
    if (!manifest.unavailableCapabilities.includes(id)) {
      throw new Error(`drift:unavailable_capability:${id}`);
    }
  }
  checks.push({ name: "unavailable_capabilities", ok: true });

  for (const permission of DIGITAL_TWIN_V1_ENTITLEMENTS) {
    if (!manifest.permissions.includes(permission)) {
      throw new Error(`drift:permission:${permission}`);
    }
  }
  checks.push({ name: "permissions", ok: true });

  if (!manifest.routes.includes(DIGITAL_TWIN_ROUTE_PREFIX)) throw new Error("drift:route");
  checks.push({ name: "routes", ok: true });

  if (DIGITAL_TWIN_MODULE_REGISTRY_DRIFT_DETECTED !== false) {
    throw new Error("drift:flag_must_be_false");
  }
  if (PRODUCTION_MEMORY_REPOSITORY_ALLOWED !== false) {
    throw new Error("drift:memory_repository_allowed");
  }
  if (PRODUCTION_DIGITAL_TWIN_READY !== true) {
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

export function detectModuleRegistryDrift():
  | { ok: true; report: DigitalTwinDriftReport }
  | { ok: false; error: string } {
  try {
    return { ok: true, report: assertNoModuleRegistryDrift() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "unknown_drift" };
  }
}
