import { describe, expect, it } from "vitest";
import {
  assertOwnershipLock,
  ASSET_INTELLIGENCE_IMPLEMENTED,
  PRODUCTION_ASSET_INTELLIGENCE_READY,
  CORE_CONDITION_SLICE_READY,
  HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
  getAssetIntelligenceCoreDeclaration,
  ASSET_INTELLIGENCE_PUBLIC_CONTRACT_DRAFTS,
  RUL_GOVERNANCE_DEFAULT,
  MULTI_HIERARCHY_RULES,
  ASSET_INTELLIGENCE_VERSION,
  createAssetIntelligenceRepository,
} from "../src/index";

describe("Phase 10B.1 ownership and persistence lock", () => {
  it("keeps shared-domain identity without full module GA", () => {
    const lock = assertOwnershipLock();
    expect(lock.assetIdentityOwnership).toBe("engineering_os_shared_domain");
    expect(ASSET_INTELLIGENCE_IMPLEMENTED).toBe(true);
    expect(CORE_CONDITION_SLICE_READY).toBe(true);
    expect(HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY).toBe(true);
    expect(PRODUCTION_MEMORY_REPOSITORY_ALLOWED).toBe(false);
    expect(PRODUCTION_ASSET_INTELLIGENCE_READY).toBe(false);
    expect(ASSET_INTELLIGENCE_VERSION).toBe("0.2.1-hosted-persistence");
    expect(getAssetIntelligenceCoreDeclaration().status).toBe("hosted_persistence");
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
