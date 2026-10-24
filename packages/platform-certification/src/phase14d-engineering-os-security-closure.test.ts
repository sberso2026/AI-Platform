import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 14D Engineering OS security closure", () => {
  it("advances to 0.12.0-security-closure and passes GA security gate without claiming EOS GA", () => {
    const version = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    const flags = readFileSync(
      resolve(root, "packages/engineering-os/src/security-closure/flags.ts"),
      "utf8",
    );
    expect(version).toContain('ENGINEERING_OS_VERSION = "0.12.0-security-closure"');
    expect(version).toContain("productionEngineeringOSReady = false");
    expect(version).toContain("engineeringOSV1GaCertified = false");
    expect(version).toContain("phase14EReady = true");
    expect(version).toContain("EngineeringOSProductIntegrationReady = true");
    expect(flags).toContain("engineeringOsSecurityGaGatePassed = true");
    expect(flags).toContain("securityClosureRequiredBeforeGa = false");
    expect(flags).toContain("CriticalDependencyVulnerabilityUnresolved = false");
  });

  it("requires S01–S06 closure corpus and workflow", () => {
    for (const rel of [
      "packages/engineering-os/src/security-closure/privileged-mfa.ts",
      "packages/engineering-os/src/security-closure/break-glass.ts",
      "packages/engineering-os/src/security-closure/classification-ai-policy.ts",
      "packages/engineering-os/src/security-closure/sensitive-logging.ts",
      "packages/engineering-os/src/security-closure/backup-restore.ts",
      "packages/engineering-os/src/security-closure/incident-fixtures.ts",
      "docs/security/RTB_ENGINEERING_OS_V1_SECURITY_GAP_REGISTER.md",
      "docs/architecture/ENGINEERING_OS_PHASE_14D.md",
      ".github/workflows/phase-14d-engineering-os-security-closure.yml",
      "packages/engineering-os-certification/scripts/run-dependency-sca.ts",
      "packages/engineering-os-certification/scripts/run-platform-restore-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const gaps = readFileSync(
      resolve(root, "docs/security/RTB_ENGINEERING_OS_V1_SECURITY_GAP_REGISTER.md"),
      "utf8",
    );
    expect(gaps).toMatch(/REQUIRED_BEFORE_GA open \| \*\*0\*\*/);
    expect(gaps).toContain("REQUIRED_BEFORE_TIER1_PRODUCTION");
  });

  it("does not start Security & Assurance or Trust Center products", () => {
    expect(existsSync(resolve(root, "packages/rtb-security-assurance"))).toBe(false);
    expect(existsSync(resolve(root, "packages/customer-trust-center"))).toBe(false);
    expect(existsSync(resolve(root, "packages/security-intelligence"))).toBe(false);
  });
});
