import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ENGINEERING_MODEL_INTEROPERABILITY_MODULE_REGISTRY_DRIFT_DETECTED,
  ENGINEERING_MODEL_INTEROPERABILITY_PREVIOUS_VERSION,
  ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACT_VERSION,
  ENGINEERING_MODEL_INTEROPERABILITY_RELEASE_TAG,
  ENGINEERING_MODEL_INTEROPERABILITY_STATUS,
  ENGINEERING_MODEL_INTEROPERABILITY_V1_FROZEN,
  ENGINEERING_MODEL_INTEROPERABILITY_V1_GA_CERTIFIED,
  ENGINEERING_MODEL_INTEROPERABILITY_VERSION,
  EMI_CAPABILITY_CATALOG,
  EMI_EVENT_CONTRACTS,
  EMI_SERVICE_REGISTRY,
  EMI_UNAVAILABLE_CAPABILITIES,
  PHASE_13D_STATUS,
  PRODUCTION_ENGINEERING_MODEL_INTEROPERABILITY_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  SPACEGASSLiveExecutionCertified,
  SPACEGASSLiveProviderReady,
  assertCapabilityCatalogComplete,
  assertEngineeringModelInteroperabilityGaClosureReady,
  assertEngineeringInteropOwnershipLock,
  assertEventContractsFrozen,
  assertManifestConsistentWithRegistries,
  assertNoModuleRegistryDrift,
  assertPublicContractsFrozen,
  assertServiceRegistryComplete,
  assertUnavailableCapabilitiesClosed,
  detectModuleRegistryDrift,
  generateEngineeringModelInteroperabilityModuleManifest,
  generateManifest,
  getEngineeringInteropGaDeclaration,
  isCapabilityUnavailable,
  listCapabilitiesByMaturity,
} from "../src/index";

const root = resolve(__dirname, "../../..");
const manifestSnapshot = JSON.parse(
  readFileSync(
    resolve(
      root,
      "packages/engineering-model-interoperability/manifest/engineering-model-interoperability-module-manifest.json",
    ),
    "utf8",
  ),
) as Record<string, unknown>;

describe("Phase 13F Engineering Model Interoperability V1.0 GA", () => {
  it("freezes the module at 1.0.0 GA from a single version source", () => {
    expect(ENGINEERING_MODEL_INTEROPERABILITY_VERSION).toBe("1.0.0");
    expect(ENGINEERING_MODEL_INTEROPERABILITY_STATUS).toBe("ga");
    expect(ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACT_VERSION).toBe(
      "1.0.0",
    );
    expect(ENGINEERING_MODEL_INTEROPERABILITY_PREVIOUS_VERSION).toBe(
      "0.4.0-etabs-federation",
    );
    expect(ENGINEERING_MODEL_INTEROPERABILITY_RELEASE_TAG).toBe(
      "engineering-model-interoperability-v1.0.0",
    );
    expect(ENGINEERING_MODEL_INTEROPERABILITY_V1_GA_CERTIFIED).toBe(true);
    expect(ENGINEERING_MODEL_INTEROPERABILITY_V1_FROZEN).toBe(true);
    expect(PRODUCTION_ENGINEERING_MODEL_INTEROPERABILITY_READY).toBe(true);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    expect(PHASE_13D_STATUS).toBe("blocked_external_dependency");
    expect(SPACEGASSLiveProviderReady).toBe(false);
    expect(SPACEGASSLiveExecutionCertified).toBe(false);

    const declaration = getEngineeringInteropGaDeclaration();
    expect(declaration.version).toBe("1.0.0");
    expect(declaration.status).toBe("ga");
    expect(declaration.phase13DStatus).toBe("blocked_external_dependency");
  });

  it("keeps forbidden live/execution locks closed", () => {
    expect(assertEngineeringInteropOwnershipLock().ok).toBe(true);
    expect(assertEngineeringModelInteroperabilityGaClosureReady().ok).toBe(
      true,
    );
  });

  it("publishes frozen registries", () => {
    expect(assertCapabilityCatalogComplete().version).toBe("1.0.0");
    expect(listCapabilitiesByMaturity("ga").length).toBeGreaterThan(0);
    expect(assertServiceRegistryComplete().count).toBe(
      EMI_SERVICE_REGISTRY.length,
    );
    expect(assertEventContractsFrozen().contractVersion).toBe("1.0.0");
    expect(assertUnavailableCapabilitiesClosed().unavailableCount).toBeGreaterThan(
      5,
    );
    expect(assertPublicContractsFrozen().contractCount).toBeGreaterThan(5);
    expect(isCapabilityUnavailable("emi.spacegass_live_api")).toBe(true);
    expect(EMI_CAPABILITY_CATALOG.length).toBeGreaterThan(15);
    expect(EMI_UNAVAILABLE_CAPABILITIES.length).toBeGreaterThan(5);
    expect(EMI_EVENT_CONTRACTS.length).toBeGreaterThan(4);
  });

  it("generates manifest agreeing with registries", () => {
    const manifest = generateEngineeringModelInteroperabilityModuleManifest();
    expect(generateManifest()).toEqual(manifest);
    expect(assertManifestConsistentWithRegistries(manifest).ok).toBe(true);
    expect(manifest.migrationLineage).toHaveLength(4);
    expect(manifest.baseline.phase13eCertifiedCommit).toBe(
      "0d01d970b444f878b63cc655a283279cf0683123",
    );
    expect(assertNoModuleRegistryDrift().moduleRegistryDriftDetected).toBe(
      false,
    );
    expect(detectModuleRegistryDrift().ok).toBe(true);
    expect(
      ENGINEERING_MODEL_INTEROPERABILITY_MODULE_REGISTRY_DRIFT_DETECTED,
    ).toBe(false);
  });

  it("keeps checked-in manifest snapshot in step", () => {
    const manifest =
      generateEngineeringModelInteroperabilityModuleManifest() as unknown as Record<
        string,
        unknown
      >;
    expect(manifestSnapshot.version).toBe(manifest.version);
    expect(manifestSnapshot.releaseTag).toBe(manifest.releaseTag);
    expect(manifestSnapshot.schemaVersion).toBe(
      "engineering-model-interoperability-module-manifest/1",
    );
    expect(
      (manifestSnapshot.featureFlags as Record<string, boolean>)
        .moduleRegistryDriftDetected,
    ).toBe(false);
  });
});
