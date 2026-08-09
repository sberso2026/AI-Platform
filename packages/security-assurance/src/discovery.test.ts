import { describe, expect, it } from "vitest";
import {
  CustomerTrustCenterImplemented,
  SecurityAssuranceDiscoveryReady,
  SecurityAssuranceRuntimeImplemented,
  SecurityIntelligenceImplemented,
  duplicatePolicyEngineDetected,
  getSecurityAssuranceDiscoveryDeclaration,
  phase15BReady,
} from "./discovery-flags";
import {
  SECURITY_ASSURANCE_DRAFT_CONTRACT_NAMES,
} from "./draft-contracts";
import {
  ENGINEERING_OS_V1_COMMIT,
  SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION,
  SECURITY_ASSURANCE_VERSION,
} from "./version";

describe("Phase 15A Security & Assurance discovery", () => {
  it("declares 0.1.0-discovery without implementing runtime", () => {
    expect(SECURITY_ASSURANCE_VERSION).toBe("0.1.0-discovery");
    expect(SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION).toBe("0.1.0-draft");
    expect(SecurityAssuranceDiscoveryReady).toBe(true);
    expect(SecurityAssuranceRuntimeImplemented).toBe(false);
    expect(SecurityIntelligenceImplemented).toBe(false);
    expect(CustomerTrustCenterImplemented).toBe(false);
    expect(duplicatePolicyEngineDetected).toBe(false);
    expect(phase15BReady).toBe(true);
    expect(ENGINEERING_OS_V1_COMMIT).toBe(
      "3bfc02478f50ce17f7a81e4e312986c9e1377535",
    );
  });

  it("exposes draft contracts and discovery declaration", () => {
    expect(SECURITY_ASSURANCE_DRAFT_CONTRACT_NAMES).toContain(
      "SecurityControlReference",
    );
    const d = getSecurityAssuranceDiscoveryDeclaration();
    expect(d.SecurityAssuranceBoundaryLocked).toBe(true);
    expect(d.EngineeringOSV1Intact).toBe(true);
    expect(d.SecurityAssuranceRuntimeImplemented).toBe(false);
  });
});
