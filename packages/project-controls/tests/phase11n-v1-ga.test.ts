import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PROJECT_CONTROLS_CAPABILITY_CATALOG,
  PROJECT_CONTROLS_EVENT_CONTRACTS,
  PROJECT_CONTROLS_EVENTS,
  PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED,
  PROJECT_CONTROLS_PREVIOUS_VERSION,
  PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION,
  PROJECT_CONTROLS_RELEASE_TAG,
  PROJECT_CONTROLS_SERVICE_REGISTRY,
  PROJECT_CONTROLS_STATUS,
  PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES,
  PROJECT_CONTROLS_V1_FROZEN,
  PROJECT_CONTROLS_V1_GA_CERTIFIED,
  PROJECT_CONTROLS_VERSION,
  AUTOMATIC_DECISION_EXECUTION_ENABLED,
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FINANCIAL_POSTING_IMPLEMENTED,
  PRODUCTION_PROJECT_CONTROLS_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  assertCapabilityCatalogComplete,
  assertEventContractsFrozen,
  assertManifestConsistentWithRegistries,
  assertNoModuleRegistryDrift,
  assertPublicContractsFrozen,
  assertServiceRegistryComplete,
  assertUnavailableCapabilitiesClosed,
  detectModuleRegistryDrift,
  generateProjectControlsModuleManifest,
  generateManifest,
  getProjectControlsGaDeclaration,
  getProjectControlsDeclaration,
  isCapabilityUnavailable,
  listCapabilitiesByMaturity,
  resolveEventFamily,
} from "../src/index";

const root = resolve(__dirname, "../../..");
const manifestSnapshot = JSON.parse(
  readFileSync(
    resolve(root, "packages/project-controls/manifest/project-controls-module-manifest.json"),
    "utf8",
  ),
) as Record<string, unknown>;

describe("Phase 11N Project Controls V1.0 GA", () => {
  it("freezes the module at 1.0.0 GA from a single version source", () => {
    expect(PROJECT_CONTROLS_VERSION).toBe("1.0.0");
    expect(PROJECT_CONTROLS_STATUS).toBe("ga");
    expect(PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION).toBe("1.0.0");
    expect(PROJECT_CONTROLS_PREVIOUS_VERSION).toBe("0.13.0-organizational-learning");
    expect(PROJECT_CONTROLS_RELEASE_TAG).toBe("project-controls-v1.0.0");
    expect(PROJECT_CONTROLS_V1_GA_CERTIFIED).toBe(true);
    expect(PROJECT_CONTROLS_V1_FROZEN).toBe(true);
    expect(PRODUCTION_PROJECT_CONTROLS_READY).toBe(true);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);

    const declaration = getProjectControlsDeclaration();
    expect(declaration.version).toBe("1.0.0");
    expect(declaration.status).toBe("ga");
    expect(getProjectControlsGaDeclaration()).toEqual(declaration);
  });

  it("keeps forbidden engine locks closed", () => {
    expect(CPM_SCHEDULING_IMPLEMENTED).toBe(false);
    expect(EARNED_VALUE_IMPLEMENTED).toBe(false);
    expect(FINANCIAL_POSTING_IMPLEMENTED).toBe(false);
    expect(AUTOMATIC_DECISION_EXECUTION_ENABLED).toBe(false);
  });

  it("publishes frozen registries", () => {
    expect(assertCapabilityCatalogComplete().version).toBe("1.0.0");
    expect(listCapabilitiesByMaturity("ga").length).toBeGreaterThan(0);
    expect(listCapabilitiesByMaturity("ga_advisory").length).toBeGreaterThan(0);
    expect(listCapabilitiesByMaturity("unavailable").length).toBeGreaterThan(0);
    expect(assertServiceRegistryComplete().count).toBe(PROJECT_CONTROLS_SERVICE_REGISTRY.length);
    expect(assertEventContractsFrozen().contractVersion).toBe("1.0.0");
    expect(assertUnavailableCapabilitiesClosed().unavailableCount).toBeGreaterThan(0);
    expect(assertPublicContractsFrozen().contractCount).toBeGreaterThan(0);
    for (const name of PROJECT_CONTROLS_EVENTS) {
      expect(resolveEventFamily(name), name).toBeDefined();
    }
    expect(isCapabilityUnavailable("project_controls.earned_value")).toBe(true);
  });

  it("generates manifest agreeing with registries", () => {
    const manifest = generateProjectControlsModuleManifest();
    expect(generateManifest()).toEqual(manifest);
    expect(assertManifestConsistentWithRegistries(manifest).ok).toBe(true);
    expect(manifest.migrationLineage).toHaveLength(13);
    expect(manifest.baseline.phase11mCertifiedCommit).toBe(
      "c115329127266022a6233481671b77dee15ae1d7",
    );
  });

  it("keeps checked-in manifest snapshot in step", () => {
    const manifest = generateProjectControlsModuleManifest() as unknown as Record<string, unknown>;
    for (const key of Object.keys(manifest)) {
      expect(manifestSnapshot[key], key).toEqual(manifest[key]);
    }
    expect(manifestSnapshot.generatedBy).toMatch(/generateProjectControlsModuleManifest/);
  });

  it("detects no module registry drift", () => {
    const report = assertNoModuleRegistryDrift();
    expect(report.moduleRegistryDriftDetected).toBe(false);
    expect(PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED).toBe(false);
    expect(detectModuleRegistryDrift().ok).toBe(true);
  });
});
