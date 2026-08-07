import { describe, expect, it } from "vitest";
import {
  assertOwnershipLock,
  ASSET_INTELLIGENCE_IMPLEMENTED,
  PRODUCTION_ASSET_INTELLIGENCE_READY,
  CORE_CONDITION_SLICE_READY,
  CORE_CRITICALITY_SLICE_READY,
  CORE_RELIABILITY_SLICE_READY,
  HEALTH_COMPOSITION_ENGINE_READY,
  EVIDENCE_CONFIDENCE_ENGINE_READY,
  CRITICALITY_IS_HEALTH_FACTOR,
  HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  getAssetIntelligenceCoreDeclaration,
  ASSET_INTELLIGENCE_VERSION,
  createAssetIntelligenceRepository,
  PHASE_10B1_CERTIFIED_COMMIT,
  PHASE_10C_CERTIFIED_COMMIT,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  RUL_CLAIMS_CERTIFIED,
} from "../src/index";

describe("Phase 10D ownership and reliability lock", () => {
  it("keeps shared-domain identity with reliability on hosted persistence", () => {
    const lock = assertOwnershipLock();
    expect(lock.assetIdentityOwnership).toBe("engineering_os_shared_domain");
    expect(ASSET_INTELLIGENCE_IMPLEMENTED).toBe(true);
    expect(CORE_CONDITION_SLICE_READY).toBe(true);
    expect(CORE_CRITICALITY_SLICE_READY).toBe(true);
    expect(CORE_RELIABILITY_SLICE_READY).toBe(true);
    expect(HEALTH_COMPOSITION_ENGINE_READY).toBe(true);
    expect(EVIDENCE_CONFIDENCE_ENGINE_READY).toBe(true);
    expect(CRITICALITY_IS_HEALTH_FACTOR).toBe(false);
    expect(HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY).toBe(true);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    expect(lock.productionAssetIntelligenceReady).toBe(PRODUCTION_ASSET_INTELLIGENCE_READY);
    expect(PROBABILITY_OF_FAILURE_CERTIFIED).toBe(false);
    expect(RUL_CLAIMS_CERTIFIED).toBe(false);
    expect([
      "0.8.0-risk-priority",
      "0.9.0-fusion-readiness",
      "0.10.0-predictive-governance",
      "1.0.0",
    ]).toContain(ASSET_INTELLIGENCE_VERSION);
    expect(PHASE_10B1_CERTIFIED_COMMIT).toBe("e72822434a38e66a409da3c8a291e68f006888c3");
    expect(PHASE_10C_CERTIFIED_COMMIT).toBe("10b0259134995f55bfe889dba2386edd653d9c2b");
    expect(["risk_priority", "fusion_readiness", "predictive_governance", "ga"]).toContain(
      getAssetIntelligenceCoreDeclaration().status,
    );
  });

  it("fails closed when production selects memory repository", () => {
    expect(() =>
      createAssetIntelligenceRepository({ adapter: "memory", nodeEnv: "production" }),
    ).toThrow(/production_memory_repository_forbidden/);
  });
});
