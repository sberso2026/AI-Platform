import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DIGITAL_TWIN_CAPABILITY_CATALOG,
  DIGITAL_TWIN_EVENT_CONTRACTS,
  DIGITAL_TWIN_EVENTS,
  DIGITAL_TWIN_MODULE_REGISTRY_DRIFT_DETECTED,
  DIGITAL_TWIN_PREVIOUS_VERSION,
  DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION,
  DIGITAL_TWIN_RELEASE_TAG,
  DIGITAL_TWIN_SERVICE_REGISTRY,
  DIGITAL_TWIN_STATUS,
  DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES,
  DIGITAL_TWIN_V1_FROZEN,
  DIGITAL_TWIN_V1_GA_CERTIFIED,
  DIGITAL_TWIN_VERSION,
  PHYSICAL_ACTUATION_IMPLEMENTED,
  PREDICTIVE_TWIN_IMPLEMENTED,
  PRODUCTION_DIGITAL_TWIN_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  SILENT_FIXTURE_FALLBACK_ENABLED,
  SPATIAL_OWNERSHIP_FULLY_RESOLVED,
  digitalTwinMayOwnCanonicalSpatial,
  assertCapabilityCatalogComplete,
  assertDigitalTwinGaClosureReady,
  assertEventContractsFrozen,
  assertManifestConsistentWithRegistries,
  assertNoModuleRegistryDrift,
  assertOwnershipLock,
  assertPublicContractsFrozen,
  assertServiceRegistryComplete,
  assertUnavailableCapabilitiesClosed,
  detectModuleRegistryDrift,
  generateDigitalTwinModuleManifest,
  generateManifest,
  getDigitalTwinGaDeclaration,
  getDigitalTwinDigitalThreadDeclaration,
  isCapabilityUnavailable,
  listCapabilitiesByMaturity,
  resolveEventFamily,
} from "../src/index";

const root = resolve(__dirname, "../../..");
const manifestSnapshot = JSON.parse(
  readFileSync(
    resolve(root, "packages/digital-twin/manifest/digital-twin-module-manifest.json"),
    "utf8",
  ),
) as Record<string, unknown>;

describe("Phase 12N Digital Twin V1.0 GA", () => {
  it("freezes the module at 1.0.0 GA from a single version source", () => {
    expect(DIGITAL_TWIN_VERSION).toBe("1.0.0");
    expect(DIGITAL_TWIN_STATUS).toBe("ga");
    expect(DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION).toBe("1.0.0");
    expect(DIGITAL_TWIN_PREVIOUS_VERSION).toBe("0.11.0-digital-thread");
    expect(DIGITAL_TWIN_RELEASE_TAG).toBe("digital-twin-v1.0.0");
    expect(DIGITAL_TWIN_V1_GA_CERTIFIED).toBe(true);
    expect(DIGITAL_TWIN_V1_FROZEN).toBe(true);
    expect(PRODUCTION_DIGITAL_TWIN_READY).toBe(true);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    expect(SPATIAL_OWNERSHIP_FULLY_RESOLVED).toBe(true);
    expect(digitalTwinMayOwnCanonicalSpatial).toBe(false);

    const declaration = getDigitalTwinDigitalThreadDeclaration();
    expect(declaration.version).toBe("1.0.0");
    expect(declaration.status).toBe("ga");
    expect(getDigitalTwinGaDeclaration()).toEqual(declaration);
  });

  it("keeps forbidden engine locks closed", () => {
    expect(PHYSICAL_ACTUATION_IMPLEMENTED).toBe(false);
    expect(PREDICTIVE_TWIN_IMPLEMENTED).toBe(false);
    expect(SILENT_FIXTURE_FALLBACK_ENABLED).toBe(false);
    expect(assertOwnershipLock().productionDigitalTwinReady).toBe(true);
    expect(assertOwnershipLock().spatialOwnershipFullyResolved).toBe(true);
    expect(assertDigitalTwinGaClosureReady().ok).toBe(true);
  });

  it("publishes frozen registries", () => {
    expect(assertCapabilityCatalogComplete().version).toBe("1.0.0");
    expect(listCapabilitiesByMaturity("ga").length).toBeGreaterThan(0);
    expect(listCapabilitiesByMaturity("ga_advisory").length).toBeGreaterThan(0);
    expect(listCapabilitiesByMaturity("unavailable").length).toBeGreaterThan(0);
    expect(assertServiceRegistryComplete().count).toBe(DIGITAL_TWIN_SERVICE_REGISTRY.length);
    expect(assertEventContractsFrozen().contractVersion).toBe("1.0.0");
    expect(assertUnavailableCapabilitiesClosed().unavailableCount).toBeGreaterThan(0);
    expect(assertPublicContractsFrozen().contractCount).toBeGreaterThan(0);
    for (const name of DIGITAL_TWIN_EVENTS) {
      expect(resolveEventFamily(name), name).toBeDefined();
    }
    expect(isCapabilityUnavailable("digital_twin.physical_actuation")).toBe(true);
    expect(DIGITAL_TWIN_CAPABILITY_CATALOG.length).toBeGreaterThan(10);
    expect(DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES.length).toBeGreaterThan(5);
    expect(DIGITAL_TWIN_EVENT_CONTRACTS.length).toBeGreaterThan(5);
  });

  it("generates manifest agreeing with registries", () => {
    const manifest = generateDigitalTwinModuleManifest();
    expect(generateManifest()).toEqual(manifest);
    expect(assertManifestConsistentWithRegistries(manifest).ok).toBe(true);
    expect(manifest.migrationLineage).toHaveLength(11);
    expect(manifest.baseline.phase12mCertifiedCommit).toBe(
      "24fccb399ff34dac7f501c2fcf14cba97d7acb7d",
    );
    expect(assertNoModuleRegistryDrift().moduleRegistryDriftDetected).toBe(false);
    expect(detectModuleRegistryDrift().ok).toBe(true);
    expect(DIGITAL_TWIN_MODULE_REGISTRY_DRIFT_DETECTED).toBe(false);
  });

  it("keeps checked-in manifest snapshot in step", () => {
    const manifest = generateDigitalTwinModuleManifest() as unknown as Record<string, unknown>;
    expect(manifestSnapshot.version).toBe(manifest.version);
    expect(manifestSnapshot.releaseTag).toBe(manifest.releaseTag);
    expect(manifestSnapshot.schemaVersion).toBe("digital-twin-module-manifest/1");
    expect(
      (manifestSnapshot.featureFlags as Record<string, boolean>).moduleRegistryDriftDetected,
    ).toBe(false);
  });
});
