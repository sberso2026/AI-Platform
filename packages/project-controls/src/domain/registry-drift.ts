/**
 * Phase 11N — module registry drift detection.
 */

import {
  PROJECT_CONTROLS_CAPABILITY_CATALOG,
  assertCapabilityCatalogComplete,
} from "./capability-registry";
import {
  PROJECT_CONTROLS_EVENT_CONTRACTS,
  assertEventContractsFrozen,
} from "./event-contracts";
import {
  assertManifestConsistentWithRegistries,
  generateProjectControlsModuleManifest,
} from "./module-manifest";
import {
  PROJECT_CONTROLS_SERVICE_REGISTRY,
  assertServiceRegistryComplete,
} from "./service-registry";
import {
  PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES,
  assertUnavailableCapabilitiesClosed,
} from "./unavailable-capabilities";
import {
  PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED,
  PROJECT_CONTROLS_RELEASE_TAG,
  PROJECT_CONTROLS_ROUTE_PREFIX,
  PROJECT_CONTROLS_V1_ENTITLEMENTS,
  PROJECT_CONTROLS_VERSION,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PRODUCTION_PROJECT_CONTROLS_READY,
} from "../version";

export type ProjectDriftReport = {
  moduleRegistryDriftDetected: false;
  version: string;
  releaseTag: string;
  checks: readonly { name: string; ok: true }[];
};

export function assertNoModuleRegistryDrift(): ProjectDriftReport {
  const manifest = generateProjectControlsModuleManifest();
  const checks: { name: string; ok: true }[] = [];

  if (manifest.version !== PROJECT_CONTROLS_VERSION) throw new Error("drift:version");
  if (manifest.releaseTag !== PROJECT_CONTROLS_RELEASE_TAG) throw new Error("drift:release_tag");
  checks.push({ name: "version", ok: true });

  assertManifestConsistentWithRegistries(manifest);
  checks.push({ name: "manifest", ok: true });

  assertCapabilityCatalogComplete();
  for (const id of PROJECT_CONTROLS_CAPABILITY_CATALOG.map((c) => c.id)) {
    if (!manifest.capabilities.includes(id)) throw new Error(`drift:capability:${id}`);
  }
  checks.push({ name: "capabilities", ok: true });

  assertServiceRegistryComplete();
  for (const id of PROJECT_CONTROLS_SERVICE_REGISTRY.map((s) => s.serviceId)) {
    if (!manifest.services.includes(id)) throw new Error(`drift:service:${id}`);
  }
  for (const health of PROJECT_CONTROLS_SERVICE_REGISTRY.map((s) => s.healthCheckId)) {
    if (!manifest.healthChecks.includes(health)) throw new Error(`drift:health:${health}`);
  }
  checks.push({ name: "services", ok: true });

  assertEventContractsFrozen();
  for (const family of PROJECT_CONTROLS_EVENT_CONTRACTS.map((e) => e.familyId)) {
    if (!manifest.eventFamilies.includes(family)) throw new Error(`drift:event_family:${family}`);
  }
  checks.push({ name: "event_contracts", ok: true });

  assertUnavailableCapabilitiesClosed();
  for (const id of PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES.map((e) => e.capabilityId)) {
    if (!manifest.unavailableCapabilities.includes(id)) {
      throw new Error(`drift:unavailable_capability:${id}`);
    }
  }
  checks.push({ name: "unavailable_capabilities", ok: true });

  for (const permission of PROJECT_CONTROLS_V1_ENTITLEMENTS) {
    if (!manifest.permissions.includes(permission)) {
      throw new Error(`drift:permission:${permission}`);
    }
  }
  checks.push({ name: "permissions", ok: true });

  if (!manifest.routes.includes(PROJECT_CONTROLS_ROUTE_PREFIX)) throw new Error("drift:route");
  checks.push({ name: "routes", ok: true });

  if (PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED !== false) {
    throw new Error("drift:flag_must_be_false");
  }
  if (PRODUCTION_MEMORY_REPOSITORY_ALLOWED !== false) {
    throw new Error("drift:memory_repository_allowed");
  }
  if (PRODUCTION_PROJECT_CONTROLS_READY !== true) {
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
  | { ok: true; report: ProjectDriftReport }
  | { ok: false; error: string } {
  try {
    return { ok: true, report: assertNoModuleRegistryDrift() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "unknown_drift" };
  }
}
