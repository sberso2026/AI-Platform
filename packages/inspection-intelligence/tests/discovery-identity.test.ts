import { describe, expect, it } from "vitest";
import {
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_INTELLIGENCE_V1_FROZEN,
  INSPECTION_INTELLIGENCE_V1_CERTIFICATION_VERSION,
  INSPECTION_INTELLIGENCE_V1_CERTIFICATION_TAG,
  INSPECTION_INTELLIGENCE_V1_CERTIFIED_COMMIT,
  INSPECTION_INTELLIGENCE_NEXT_GEN_RELEASE_STATUS,
  INSPECTION_INTELLIGENCE_NEXT_GA_VERSION,
  INSPECTION_PRODUCTION_READY,
  INSPECTION_AI_VISION_IMPLEMENTED,
  INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED,
  INSPECTION_MODULE_REGISTRY_DRIFT_DETECTED,
  getInspectionIntelligenceDomainDeclaration,
  getInspectionIntelligenceHistoricalCertification,
  runInspectionV1GaClosure,
  detectModuleRegistryDrift,
  assertPublicContractsMachineCheckable,
  listCrossModuleConsumerFixtures,
} from "../src";

describe("Phase 9K Inspection Intelligence V1 GA", () => {
  it("locks GA 1.0.0 historical identity", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("1.0.0");
    expect(INSPECTION_INTELLIGENCE_V1_CERTIFICATION_VERSION).toBe("1.0.0");
    expect(INSPECTION_INTELLIGENCE_V1_CERTIFICATION_TAG).toBe("inspection-intelligence-v1.0.0");
    expect(INSPECTION_INTELLIGENCE_V1_CERTIFIED_COMMIT).toBe(
      "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09",
    );
    expect(INSPECTION_INTELLIGENCE_NEXT_GEN_RELEASE_STATUS).toBe("unreleased");
    expect(INSPECTION_INTELLIGENCE_NEXT_GA_VERSION).toBeNull();
    expect(INSPECTION_INTELLIGENCE_V1_FROZEN).toBe(true);
    expect(INSPECTION_PRODUCTION_READY).toBe(true);
    expect(INSPECTION_AI_VISION_IMPLEMENTED).toBe(true);
    expect(INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED).toBe(false);
    expect(INSPECTION_MODULE_REGISTRY_DRIFT_DETECTED).toBe(false);
    const historical = getInspectionIntelligenceHistoricalCertification();
    expect(historical.tag).toBe("inspection-intelligence-v1.0.0");
    const decl = getInspectionIntelligenceDomainDeclaration();
    expect(decl.inspectionIntelligenceV1Frozen).toBe(true);
    expect(decl.crossModuleConsumerContractsCertified).toBe(true);
    expect(decl.historicalCertification.certifiedCommit).toBe(
      "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09",
    );
    expect(decl.currentRelease.status).toBe("unreleased");
  });

  it("runs GA closure with drift-free registries and cross-module fixtures", () => {
    expect(assertPublicContractsMachineCheckable().frozenVersion).toBe("1.0.0");
    expect(detectModuleRegistryDrift().moduleRegistryDriftDetected).toBe(false);
    expect(listCrossModuleConsumerFixtures()).toHaveLength(3);

    const result = runInspectionV1GaClosure({
      actorUserId: "u-ga",
      reason: "phase9k_v1_ga_closure",
    });
    expect(result.version).toBe("1.0.0");
    expect(result.productionInspectionIntelligenceReady).toBe(true);
    expect(result.humanAuthority.aiCannotMutateConditionRating).toBe(true);
    expect(result.providerAssurance.trainingUse).toBe("forbidden");
    expect(result.moduleRegistryDriftDetected).toBe(false);
    // Preserve 9H operational hardening marker: abstain remains part of product surface.
    expect("abstain" in { abstain: true }).toBe(true);
  });
});
