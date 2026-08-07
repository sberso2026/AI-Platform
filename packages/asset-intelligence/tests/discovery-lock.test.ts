import { describe, expect, it } from "vitest";
import {
  assertOwnershipLock,
  ASSET_INTELLIGENCE_IMPLEMENTED,
  PRODUCTION_ASSET_INTELLIGENCE_READY,
  CORE_CONDITION_SLICE_READY,
  getAssetIntelligenceCoreDeclaration,
  ASSET_INTELLIGENCE_PUBLIC_CONTRACT_DRAFTS,
  RUL_GOVERNANCE_DEFAULT,
  MULTI_HIERARCHY_RULES,
  ASSET_INTELLIGENCE_VERSION,
} from "../src/index";

describe("Phase 10B Asset Intelligence ownership lock", () => {
  it("keeps shared-domain identity ownership without full module GA", () => {
    const lock = assertOwnershipLock();
    expect(lock.assetIdentityOwnership).toBe("engineering_os_shared_domain");
    expect(lock.assetIntelligenceOwnership).toBe("asset_intelligence");
    expect(lock.duplicateAssetOwnershipDetected).toBe(false);
    expect(ASSET_INTELLIGENCE_IMPLEMENTED).toBe(true);
    expect(CORE_CONDITION_SLICE_READY).toBe(true);
    expect(PRODUCTION_ASSET_INTELLIGENCE_READY).toBe(false);
    expect(ASSET_INTELLIGENCE_VERSION).toBe("0.2.0-core");
    expect(getAssetIntelligenceCoreDeclaration().status).toBe("core");
  });

  it("keeps RUL advisory-unavailable and multi-hierarchy non-duplicating", () => {
    expect(RUL_GOVERNANCE_DEFAULT.rulClaimsCertified).toBe(false);
    expect(RUL_GOVERNANCE_DEFAULT.accuracyClaimsCertified).toBe(false);
    expect(MULTI_HIERARCHY_RULES.duplicateAssetPerHierarchyForbidden).toBe(true);
    expect(ASSET_INTELLIGENCE_PUBLIC_CONTRACT_DRAFTS.length).toBe(10);
  });
});
