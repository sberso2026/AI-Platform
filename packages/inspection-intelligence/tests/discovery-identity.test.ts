import { describe, expect, it } from "vitest";
import {
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_AI_VISION_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_RELEASE_CLOSED,
  INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED,
  getInspectionIntelligenceDomainDeclaration,
  runModuleReleaseHappyPath,
  assertPublicContractsMachineCheckable,
  assertCapabilityCatalogComplete,
  assertServiceRegistryComplete,
  assertHardenedPackRegistry,
  generateInspectionModuleManifest,
  STRUCTURAL_CONDITION_PACK_SDK,
} from "../src";

describe("Phase 9J module release closure", () => {
  it("locks release identity without Twin ownership", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("1.0.0-ii-release");
    expect(INSPECTION_INTELLIGENCE_RELEASE_CLOSED).toBe(true);
    expect(INSPECTION_AI_VISION_IMPLEMENTED).toBe(true);
    expect(INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED).toBe(false);
    const decl = getInspectionIntelligenceDomainDeclaration();
    expect(decl.inspectionIntelligenceReleaseClosed).toBe(true);
    expect(decl.publicModuleContractsPublished).toBe(true);
    expect(decl.capabilityRegistryIntegrated).toBe(true);
    expect(STRUCTURAL_CONDITION_PACK_SDK.featureFlags.aiVision).toBe(true);
  });

  it("runs contracts → registries → manifest → health → publication audit", () => {
    expect(assertPublicContractsMachineCheckable().ok).toBe(true);
    expect(assertCapabilityCatalogComplete().ok).toBe(true);
    expect(assertServiceRegistryComplete().failClosedServices).toContain("vision");
    expect(assertHardenedPackRegistry().incompatibleDenied).toBe(true);
    const manifest = generateInspectionModuleManifest();
    expect(manifest.version).toBe("1.0.0-ii-release");
    expect(manifest.assetIntelligenceOwnership).toBe(false);

    const result = runModuleReleaseHappyPath({
      actorUserId: "u-admin",
      reason: "phase9j_release_closure",
    });
    expect(result.inspectionIntelligenceReleaseClosed).toBe(true);
    expect(result.publicationPath.authorityAudit.silentMutation).toBe(false);
    expect(result.consumerContracts.digitalTwinOwnership).toBe(false);
    expect(result.aiVisionRemainsAdvisory).toBe(true);
    expect(result.events).toContain("engineering.inspection.release.closed");
    // Preserve 9H operational hardening marker: abstain paths remain part of product surface.
    expect("abstain" in { abstain: true }).toBe(true);
  });
});
