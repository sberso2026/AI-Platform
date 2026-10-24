/**
 * Phase 9K — registry/manifest drift detection.
 */

import { INSPECTION_CAPABILITY_CATALOG } from "./capability-registry-integration";
import { HARDENED_PACK_REGISTRY } from "./pack-registry-hardened";
import { INSPECTION_PUBLIC_MODULE_CONTRACTS } from "./public-module-contracts";
import { INSPECTION_SERVICE_REGISTRY } from "./service-registry";
import { generateInspectionModuleManifest } from "./module-manifest";
import {
  INSPECTION_INTELLIGENCE_PLANNED_ENTITLEMENTS,
  INSPECTION_INTELLIGENCE_ROUTE_PREFIX,
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_MODULE_REGISTRY_DRIFT_DETECTED,
} from "../version";

export type DriftReport = {
  moduleRegistryDriftDetected: false;
  checks: readonly { name: string; ok: true }[];
  version: string;
};

export function detectModuleRegistryDrift(): DriftReport {
  const manifest = generateInspectionModuleManifest();
  const checks: { name: string; ok: true }[] = [];

  if (manifest.version !== INSPECTION_INTELLIGENCE_VERSION) {
    throw new Error("drift:version");
  }
  checks.push({ name: "version", ok: true });

  if (manifest.capabilities.length !== INSPECTION_CAPABILITY_CATALOG.length) {
    throw new Error("drift:capabilities");
  }
  for (const id of INSPECTION_CAPABILITY_CATALOG.map((c) => c.id)) {
    if (!manifest.capabilities.includes(id)) throw new Error(`drift:capability:${id}`);
  }
  checks.push({ name: "capabilities", ok: true });

  if (manifest.services.length !== INSPECTION_SERVICE_REGISTRY.length) {
    throw new Error("drift:services");
  }
  for (const id of INSPECTION_SERVICE_REGISTRY.map((s) => s.serviceId)) {
    if (!manifest.services.includes(id)) throw new Error(`drift:service:${id}`);
  }
  checks.push({ name: "services", ok: true });

  if (manifest.publicContracts.length !== INSPECTION_PUBLIC_MODULE_CONTRACTS.length) {
    throw new Error("drift:contracts");
  }
  for (const id of INSPECTION_PUBLIC_MODULE_CONTRACTS.map((c) => c.contractId)) {
    if (!manifest.publicContracts.includes(id)) throw new Error(`drift:contract:${id}`);
  }
  checks.push({ name: "public_contracts", ok: true });

  for (const perm of INSPECTION_INTELLIGENCE_PLANNED_ENTITLEMENTS) {
    if (!manifest.permissions.includes(perm)) throw new Error(`drift:permission:${perm}`);
  }
  checks.push({ name: "permissions_entitlements", ok: true });

  const requiredRoutes = [
    INSPECTION_INTELLIGENCE_ROUTE_PREFIX,
    `${INSPECTION_INTELLIGENCE_ROUTE_PREFIX}/vision`,
    `${INSPECTION_INTELLIGENCE_ROUTE_PREFIX}/release`,
    `${INSPECTION_INTELLIGENCE_ROUTE_PREFIX}/condition`,
  ];
  for (const route of requiredRoutes) {
    if (!manifest.routes.includes(route)) throw new Error(`drift:route:${route}`);
  }
  checks.push({ name: "routes", ok: true });

  for (const health of INSPECTION_SERVICE_REGISTRY.map((s) => s.healthCheckId)) {
    if (!manifest.healthChecks.includes(health)) throw new Error(`drift:health:${health}`);
  }
  checks.push({ name: "health_endpoints", ok: true });

  if (HARDENED_PACK_REGISTRY.length < 3) throw new Error("drift:pack_registry");
  checks.push({ name: "pack_registry", ok: true });

  if (INSPECTION_MODULE_REGISTRY_DRIFT_DETECTED !== false) {
    throw new Error("drift:flag_must_be_false");
  }
  if (manifest.assetIntelligenceOwnership !== false || manifest.digitalTwinOwnership !== false) {
    throw new Error("drift:ownership");
  }
  checks.push({ name: "ownership_flags", ok: true });

  return {
    moduleRegistryDriftDetected: false,
    checks,
    version: manifest.version,
  };
}
