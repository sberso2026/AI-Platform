import { describe, expect, it } from "vitest";
import {
  assertOwnershipLock,
  ASSET_INTELLIGENCE_IMPLEMENTED,
  PRODUCTION_ASSET_INTELLIGENCE_READY,
  CORE_CONDITION_SLICE_READY,
  CORE_CRITICALITY_SLICE_READY,
  HEALTH_COMPOSITION_ENGINE_READY,
  HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  getAssetIntelligenceCoreDeclaration,
  ASSET_INTELLIGENCE_PUBLIC_CONTRACT_DRAFTS,
  RUL_GOVERNANCE_DEFAULT,
  MULTI_HIERARCHY_RULES,
  ASSET_INTELLIGENCE_VERSION,
  createAssetIntelligenceRepository,
  PHASE_10B1_CERTIFIED_COMMIT,
} from "../src/index";

describe("Phase 10C ownership and Health Composition Engine lock", () => {
  it("keeps shared-domain identity with criticality on hosted persistence", () => {
    const lock = assertOwnershipLock();
    expect(lock.assetIdentityOwnership).toBe("engineering_os_shared_domain");
    expect(ASSET_INTELLIGENCE_IMPLEMENTED).toBe(true);
    expect(CORE_CONDITION_SLICE_READY).toBe(true);
    expect(CORE_CRITICALITY_SLICE_READY).toBe(true);
    expect(HEALTH_COMPOSITION_ENGINE_READY).toBe(true);
    expect(HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY).toBe(true);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    expect(PRODUCTION_ASSET_INTELLIGENCE_READY).toBe(false);
    expect(ASSET_INTELLIGENCE_VERSION).toBe("0.3.0-criticality");
    expect(PHASE_10B1_CERTIFIED_COMMIT).toBe("e72822434a38e66a409da3c8a291e68f006888c3");
    expect(getAssetIntelligenceCoreDeclaration().status).toBe("criticality");
    expect(getAssetIntelligenceCoreDeclaration().healthCompositionEngineReady).toBe(true);
  });

  it("fails closed when production selects memory repository", () => {
    expect(() =>
      createAssetIntelligenceRepository({ adapter: "memory", nodeEnv: "production" }),
    ).toThrow(/production_memory_repository_forbidden/);
  });

  it("keeps RUL advisory-unavailable and multi-hierarchy non-duplicating", () => {
    expect(RUL_GOVERNANCE_DEFAULT.rulClaimsCertified).toBe(false);
    expect(MULTI_HIERARCHY_RULES.duplicateAssetPerHierarchyForbidden).toBe(true);
    expect(ASSET_INTELLIGENCE_PUBLIC_CONTRACT_DRAFTS.length).toBe(10);
  });
});
