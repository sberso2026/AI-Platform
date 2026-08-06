import { describe, expect, it } from "vitest";
import {
  INSPECTION_PRODUCT_FEATURES_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_VERSION,
  getInspectionIntelligenceDiscoveryDeclaration,
} from "../src/version";

describe("Inspection Intelligence Phase 9A discovery identity", () => {
  it("locks discovery version without product features", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("0.1.0-discovery");
    expect(INSPECTION_PRODUCT_FEATURES_IMPLEMENTED).toBe(false);
    const decl = getInspectionIntelligenceDiscoveryDeclaration();
    expect(decl.assetOwnership).toBe("engineering_os_shared_domain");
    expect(decl.moduleKey).toBe("inspection_intelligence");
    expect(decl.coreEntities).toContain("inspection_session");
  });
});
