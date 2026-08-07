import { describe, expect, it } from "vitest";
import {
  assertOwnershipLock,
  ASSET_INTELLIGENCE_IMPLEMENTED,
  PRODUCTION_ASSET_INTELLIGENCE_READY,
  getAssetIntelligenceDiscoveryDeclaration,
  ASSET_INTELLIGENCE_PUBLIC_CONTRACT_DRAFTS,
  RUL_GOVERNANCE_DEFAULT,
  MULTI_HIERARCHY_RULES,
} from "../src/index";

describe("Phase 10A Asset Intelligence discovery lock", () => {
  it("locks shared-domain identity ownership without production claims", () => {
    const lock = assertOwnershipLock();
    expect(lock.assetIdentityOwnership).toBe("engineering_os_shared_domain");
    expect(lock.assetIntelligenceOwnership).toBe("asset_intelligence");
    expect(lock.duplicateAssetOwnershipDetected).toBe(false);
    expect(ASSET_INTELLIGENCE_IMPLEMENTED).toBe(false);
    expect(PRODUCTION_ASSET_INTELLIGENCE_READY).toBe(false);
    expect(getAssetIntelligenceDiscoveryDeclaration().status).toBe("discovery");
  });

  it("keeps RUL advisory-unavailable and multi-hierarchy non-duplicating", () => {
    expect(RUL_GOVERNANCE_DEFAULT.rulClaimsCertified).toBe(false);
    expect(RUL_GOVERNANCE_DEFAULT.accuracyClaimsCertified).toBe(false);
    expect(MULTI_HIERARCHY_RULES.duplicateAssetPerHierarchyForbidden).toBe(true);
    expect(ASSET_INTELLIGENCE_PUBLIC_CONTRACT_DRAFTS.length).toBe(10);
  });
});
