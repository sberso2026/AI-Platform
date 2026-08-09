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
import { SECURITY_ASSURANCE_DRAFT_CONTRACT_NAMES } from "./draft-contracts";
import {
  ENGINEERING_OS_V1_COMMIT,
  PHASE_15A_BASELINE_COMMIT,
  SECURITY_ASSURANCE_VERSION,
} from "./version";

describe("Phase 15A Security & Assurance discovery regression", () => {
  it("preserves discovery locks and EOS V1 baseline under foundation version", () => {
    expect(SECURITY_ASSURANCE_VERSION).toBe("0.7.0-customer-assurance");
    expect(PHASE_15A_BASELINE_COMMIT).toBe(
      "4748972076f77e7392bb41ec664adddfeb677407",
    );
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

  it("keeps draft contract names and discovery declaration", () => {
    expect(SECURITY_ASSURANCE_DRAFT_CONTRACT_NAMES).toContain(
      "SecurityControlReference",
    );
    const d = getSecurityAssuranceDiscoveryDeclaration();
    expect(d.SecurityAssuranceBoundaryLocked).toBe(true);
    expect(d.EngineeringOSV1Intact).toBe(true);
  });
});
