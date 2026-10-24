import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ASSET_INTELLIGENCE_CAPABILITY_CATALOG,
  ASSET_INTELLIGENCE_EVENT_CONTRACTS,
  ASSET_INTELLIGENCE_EVENTS,
  ASSET_INTELLIGENCE_MODULE_REGISTRY_DRIFT_DETECTED,
  ASSET_INTELLIGENCE_PREVIOUS_VERSION,
  ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION,
  ASSET_INTELLIGENCE_RELEASE_TAG,
  ASSET_INTELLIGENCE_SERVICE_REGISTRY,
  ASSET_INTELLIGENCE_STATUS,
  ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES,
  ASSET_INTELLIGENCE_V1_FROZEN,
  ASSET_INTELLIGENCE_V1_GA_CERTIFIED,
  ASSET_INTELLIGENCE_VERSION,
  ACCURACY_CLAIMS_CERTIFIED,
  PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED,
  PREDICTIVE_METHODS_CERTIFIED,
  PREDICTIVE_ML_ENABLED,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  PRODUCTION_ASSET_INTELLIGENCE_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  PRODUCTION_PREDICTIVE_EXECUTION_ENABLED,
  RUL_CLAIMS_CERTIFIED,
  assertCapabilityCatalogComplete,
  assertEventContractsFrozen,
  assertManifestConsistentWithRegistries,
  assertNoModuleRegistryDrift,
  assertServiceRegistryComplete,
  assertUnavailableCapabilitiesClosed,
  detectModuleRegistryDrift,
  generateAssetIntelligenceModuleManifest,
  generateManifest,
  getAssetIntelligenceCoreDeclaration,
  getAssetIntelligenceGaDeclaration,
  isCapabilityUnavailable,
  listCapabilitiesByMaturity,
  resolveEventFamily,
} from "../src/index";

const root = resolve(__dirname, "../../..");
const manifestSnapshot = JSON.parse(
  readFileSync(
    resolve(root, "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.json"),
    "utf8",
  ),
) as Record<string, unknown>;

describe("Phase 10K Asset Intelligence V1.0 GA", () => {
  it("freezes the module at 1.0.0 GA from a single version source", () => {
    expect(ASSET_INTELLIGENCE_VERSION).toBe("1.0.0");
    expect(ASSET_INTELLIGENCE_STATUS).toBe("ga");
    expect(ASSET_INTELLIGENCE_PUBLIC_CONTRACT_VERSION).toBe("1.0.0");
    expect(ASSET_INTELLIGENCE_PREVIOUS_VERSION).toBe("0.10.0-predictive-governance");
    expect(ASSET_INTELLIGENCE_RELEASE_TAG).toBe("asset-intelligence-v1.0.0");
    expect(ASSET_INTELLIGENCE_V1_GA_CERTIFIED).toBe(true);
    expect(ASSET_INTELLIGENCE_V1_FROZEN).toBe(true);
    expect(PRODUCTION_ASSET_INTELLIGENCE_READY).toBe(true);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);

    const declaration = getAssetIntelligenceCoreDeclaration();
    expect(declaration.version).toBe(ASSET_INTELLIGENCE_VERSION);
    expect(declaration.status).toBe("ga");
    expect(declaration.releaseTag).toBe(ASSET_INTELLIGENCE_RELEASE_TAG);
    expect(getAssetIntelligenceGaDeclaration()).toEqual(declaration);
  });

  it("keeps every predictive, PoF, RUL and health contribution lock closed", () => {
    expect(PRODUCTION_PREDICTIVE_EXECUTION_ENABLED).toBe(false);
    expect(PREDICTIVE_ML_ENABLED).toBe(false);
    expect(PREDICTIVE_METHODS_CERTIFIED).toBe(false);
    expect(PROBABILITY_OF_FAILURE_CERTIFIED).toBe(false);
    expect(RUL_CLAIMS_CERTIFIED).toBe(false);
    expect(ACCURACY_CLAIMS_CERTIFIED).toBe(false);
    expect(PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED).toBe(false);
  });

  it("publishes a frozen capability registry with maturity classifications", () => {
    const result = assertCapabilityCatalogComplete();
    expect(result.ok).toBe(true);
    expect(result.version).toBe("1.0.0");
    expect(listCapabilitiesByMaturity("ga").length).toBeGreaterThan(0);
    expect(listCapabilitiesByMaturity("ga_advisory").length).toBeGreaterThan(0);
    expect(listCapabilitiesByMaturity("reserved").length).toBeGreaterThan(0);
    expect(listCapabilitiesByMaturity("unavailable").length).toBeGreaterThan(0);

    for (const entry of ASSET_INTELLIGENCE_CAPABILITY_CATALOG) {
      expect(entry.healthContribution).toBe(false);
      expect(entry.mutatesCanonicalState).toBe(false);
    }
    expect(isCapabilityUnavailable("asset_intelligence.predictive_execution")).toBe(true);
    expect(isCapabilityUnavailable("asset_intelligence.condition")).toBe(false);
  });

  it("publishes a frozen service registry with no duplicate runtimes", () => {
    const result = assertServiceRegistryComplete();
    expect(result.ok).toBe(true);
    expect(result.count).toBe(ASSET_INTELLIGENCE_SERVICE_REGISTRY.length);
    for (const service of ASSET_INTELLIGENCE_SERVICE_REGISTRY) {
      expect(service.duplicateRuntimeForbidden).toBe(true);
      expect(service.semanticVersion).toBe(ASSET_INTELLIGENCE_VERSION);
    }
  });

  it("maps every emitted event to exactly one frozen contract family", () => {
    const result = assertEventContractsFrozen();
    expect(result.ok).toBe(true);
    expect(result.contractVersion).toBe("1.0.0");
    expect(result.familyCount).toBe(ASSET_INTELLIGENCE_EVENT_CONTRACTS.length);
    for (const name of ASSET_INTELLIGENCE_EVENTS) {
      expect(resolveEventFamily(name), name).toBeDefined();
    }
    for (const contract of ASSET_INTELLIGENCE_EVENT_CONTRACTS) {
      expect(contract.containsPredictionOutput).toBe(false);
      expect(contract.mutatesCanonicalStateOnConsume).toBe(false);
      expect(contract.tenantIsolated).toBe(true);
    }
  });

  it("publishes a machine-readable unavailable capability matrix", () => {
    const result = assertUnavailableCapabilitiesClosed();
    expect(result.ok).toBe(true);
    expect(result.unavailableCount).toBeGreaterThan(0);
    const ids = ASSET_INTELLIGENCE_UNAVAILABLE_CAPABILITIES.map((e) => e.capabilityId);
    for (const required of [
      "asset_intelligence.predictive_execution",
      "asset_intelligence.probability_of_failure",
      "asset_intelligence.remaining_useful_life",
      "asset_intelligence.predictive_ml",
      "asset_intelligence.cmms_work_order",
    ]) {
      expect(ids).toContain(required);
    }
  });

  it("generates a manifest that agrees with every registry", () => {
    const manifest = generateAssetIntelligenceModuleManifest();
    expect(generateManifest()).toEqual(manifest);
    expect(assertManifestConsistentWithRegistries(manifest).ok).toBe(true);
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.capabilities).toHaveLength(ASSET_INTELLIGENCE_CAPABILITY_CATALOG.length);
    expect(manifest.services).toHaveLength(ASSET_INTELLIGENCE_SERVICE_REGISTRY.length);
    expect(manifest.eventFamilies).toHaveLength(ASSET_INTELLIGENCE_EVENT_CONTRACTS.length);
    expect(manifest.migrationLineage).toHaveLength(6);
    expect(manifest.baseline.phase10jCertifiedCommit).toBe(
      "94ba3eccd5b42d9afbc96962bbf7572470485746",
    );
  });

  it("keeps the checked-in manifest snapshot in step with the generator", () => {
    const manifest = generateAssetIntelligenceModuleManifest() as unknown as Record<
      string,
      unknown
    >;
    for (const key of Object.keys(manifest)) {
      expect(manifestSnapshot[key], key).toEqual(manifest[key]);
    }
    expect(manifestSnapshot.generatedBy).toMatch(/generateAssetIntelligenceModuleManifest/);
  });

  it("detects no module registry drift", () => {
    const report = assertNoModuleRegistryDrift();
    expect(report.moduleRegistryDriftDetected).toBe(false);
    expect(report.version).toBe("1.0.0");
    expect(report.releaseTag).toBe("asset-intelligence-v1.0.0");
    expect(ASSET_INTELLIGENCE_MODULE_REGISTRY_DRIFT_DETECTED).toBe(false);

    const detected = detectModuleRegistryDrift();
    expect(detected.ok).toBe(true);
  });
});
