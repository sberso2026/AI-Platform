import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 15A Security & Assurance discovery", () => {
  it("places Sec&A at Platform level as 0.1.0-discovery without runtime", () => {
    const version = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    const flags = readFileSync(
      resolve(root, "packages/security-assurance/src/discovery-flags.ts"),
      "utf8",
    );
    expect(version).toContain('SECURITY_ASSURANCE_VERSION = "0.1.0-discovery"');
    expect(version).toContain('SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION =');
    expect(version).toContain("0.1.0-draft");
    expect(flags).toContain("SecurityAssuranceDiscoveryReady = true");
    expect(flags).toContain("SecurityAssuranceRuntimeImplemented = false");
    expect(flags).toContain("CustomerTrustCenterImplemented = false");
    expect(flags).toContain("duplicatePolicyEngineDetected = false");
    expect(flags).toContain("phase15BReady = true");
    expect(flags).toContain("EngineeringOSV1Intact = true");
  });

  it("requires discovery corpus and preserves EOS V1 freeze", () => {
    for (const rel of [
      "docs/security/SECURITY_ASSURANCE_PHASE_15A_EXISTING_CONTROL_INVENTORY.md",
      "docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md",
      "docs/security/SECURITY_ASSURANCE_ARCHITECTURE_BOUNDARIES.md",
      "docs/security/SECURITY_ASSURANCE_PHASE_15A_GAP_REGISTER.md",
      "docs/security/SECURITY_ASSURANCE_IMPLEMENTATION_ROADMAP.md",
      "docs/architecture/SECURITY_ASSURANCE_PHASE_15A.md",
      ".github/workflows/phase-15a-security-assurance-discovery.yml",
      "packages/security-assurance/src/draft-contracts.ts",
      "packages/security-assurance-certification/scripts/run-phase15a-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const eos = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(eos).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
    expect(eos).toContain("engineeringOSV1Frozen = true");
  });

  it("does not implement Trust Center / Security Intelligence / second engines", () => {
    expect(existsSync(resolve(root, "packages/customer-trust-center"))).toBe(false);
    expect(existsSync(resolve(root, "packages/security-intelligence"))).toBe(false);
    const ownership = readFileSync(
      resolve(root, "docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md"),
      "utf8",
    );
    expect(ownership).toContain("MUST_NEVER_OWN");
    expect(ownership).toContain("**None remaining**");
  });
});
