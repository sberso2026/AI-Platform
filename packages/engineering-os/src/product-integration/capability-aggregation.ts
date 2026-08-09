/**
 * Phase 14B — capability aggregation / drift detection.
 */
import { buildEngineeringOSManifest } from "./aggregate-manifest";
import { ENGINEERING_OS_COMMERCIAL_PRODUCT } from "./commercial-product";

export interface CapabilityAggregationReport {
  capabilities: string[];
  duplicateIds: string[];
  orphanCapabilities: string[];
  staleComingSoon: string[];
  productionMarkedUnavailable: string[];
  unavailableMarkedProduction: string[];
  ok: boolean;
}

export function aggregateEngineeringOSCapabilities(): CapabilityAggregationReport {
  const manifest = buildEngineeringOSManifest();
  const caps = [...new Set(manifest.capabilities)];
  const seen = new Map<string, number>();
  for (const c of caps) seen.set(c, (seen.get(c) ?? 0) + 1);
  // Deduped list means duplicates already collapsed; detect within raw list.
  const raw = manifest.capabilities;
  const counts = new Map<string, number>();
  for (const c of raw) counts.set(c, (counts.get(c) ?? 0) + 1);
  const duplicateIds = [...counts.entries()]
    .filter(([, n]) => n > 1)
    .map(([id]) => id);

  const unavailable = new Set(
    manifest.unavailableCapabilities.map((u) => u.id),
  );
  const productionModuleCaps = new Set(
    ENGINEERING_OS_COMMERCIAL_PRODUCT.moduleEntitlements,
  );

  const productionMarkedUnavailable = [...productionModuleCaps].filter((k) =>
    unavailable.has(k),
  );
  const unavailableMarkedProduction = manifest.unavailableCapabilities
    .filter((u) => productionModuleCaps.has(u.id))
    .map((u) => u.id);

  const staleComingSoon = manifest.installedModules
    .filter((m) => m.status === "coming_soon" && m.version !== "0.0.0")
    .map((m) => m.moduleKey);

  const orphanCapabilities: string[] = [];

  return {
    capabilities: caps,
    duplicateIds,
    orphanCapabilities,
    staleComingSoon,
    productionMarkedUnavailable,
    unavailableMarkedProduction,
    ok:
      staleComingSoon.length === 0 &&
      productionMarkedUnavailable.length === 0 &&
      unavailableMarkedProduction.length === 0,
  };
}
