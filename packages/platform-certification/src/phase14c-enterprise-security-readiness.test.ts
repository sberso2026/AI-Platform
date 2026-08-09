import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 14C Enterprise Security Readiness", () => {
  it("advances assessment to 0.11.0-security-readiness without claiming EOS GA or ISO/SOC2", () => {
    const version = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    const security = readFileSync(
      resolve(root, "packages/engineering-os/src/security-readiness.ts"),
      "utf8",
    );
    expect(version).toContain('ENGINEERING_OS_VERSION = "0.11.0-security-readiness"');
    expect(version).toContain("EngineeringOSProductIntegrationReady = true");
    expect(version).toContain("productionEngineeringOSReady = false");
    expect(version).toContain("engineeringOSV1GaCertified = false");
    expect(version).toContain("phase14DReady = true");
    expect(security).toContain("EnterpriseSecurityAssessmentComplete = true");
    expect(security).toContain("engineeringOsSecurityGaGatePassed = false");
    expect(security).toContain("securityClosureRequiredBeforeGa = true");
    expect(security).toContain("iso27001Certified = false");
    expect(security).toContain("soc2Assured = false");
    expect(security).toContain("essentialEightMaturityClaimed = false");
    expect(security).toContain("existingPolicyEngineReused = true");
    expect(security).toContain("knownCrossTenantLeakageDetected = false");
  });

  it("requires security assessment corpus and workflow", () => {
    for (const rel of [
      "docs/security/RTB_ENTERPRISE_SECURITY_EXISTING_CONTROL_INVENTORY.md",
      "docs/security/RTB_SECURITY_OWNERSHIP_MATRIX.md",
      "docs/architecture/RTB_SECURITY_AND_ASSURANCE_BOUNDARY.md",
      "docs/security/RTB_ENTERPRISE_SECURITY_CONTROL_MATRIX.md",
      "docs/security/RTB_ENGINEERING_OS_V1_SECURITY_GAP_REGISTER.md",
      "docs/security/RTB_ENTERPRISE_SECURITY_READINESS_MATRIX.md",
      "docs/security/RTB_ESSENTIAL_EIGHT_APPLICABILITY.md",
      "docs/architecture/ENGINEERING_OS_PHASE_14C.md",
      ".github/workflows/phase-14c-enterprise-security-readiness.yml",
      "packages/engineering-os-certification/src/phase14c/gates.ts",
      "packages/engineering-os-certification/scripts/run-phase14c-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });

  it("locks Security & Assurance as assessment boundary only", () => {
    expect(existsSync(resolve(root, "packages/security-intelligence"))).toBe(false);
    expect(existsSync(resolve(root, "packages/customer-trust-center"))).toBe(false);
    expect(existsSync(resolve(root, "packages/rtb-security-assurance"))).toBe(false);
    const boundary = readFileSync(
      resolve(root, "docs/architecture/RTB_SECURITY_AND_ASSURANCE_BOUNDARY.md"),
      "utf8",
    );
    expect(boundary).toContain("≠ ISO 27001 certification");
    expect(boundary).toContain("≠ SOC 2 report");
  });
});
