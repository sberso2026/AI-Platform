import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 14E Engineering OS V1 GA", () => {
  it("advances Engineering OS to 1.0.0 ga with frozen contracts", () => {
    const version = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(version).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
    expect(version).toContain('ENGINEERING_OS_STATUS = "ga"');
    expect(version).toContain("productionEngineeringOSReady = true");
    expect(version).toContain("engineeringOSV1GaCertified = true");
    expect(version).toContain("engineeringOSV1Frozen = true");
    expect(version).toContain("EngineeringOSPublicContractsFrozen = true");
    expect(version).toContain("EngineeringOSManifestFrozen = true");
    expect(version).toContain('ENGINEERING_OS_RELEASE_TAG = "engineering-os-v1.0.0"');
    expect(version).toContain("clientLicensedETABSExecutionCertified = false");
    expect(version).toContain("clientLicensedSPACEGASSExecutionCertified = false");
  });

  it("requires GA corpus and Home marker", () => {
    for (const rel of [
      "docs/architecture/ENGINEERING_OS_V1_PUBLIC_CONTRACTS.md",
      "docs/commercial/ENGINEERING_OS_V1_PACKAGING.md",
      "docs/operations/ENGINEERING_OS_V1_OPERATIONS.md",
      "docs/security/ENGINEERING_OS_V1_ENTERPRISE_DEPLOYMENT_REQUIREMENTS.md",
      "docs/architecture/ENGINEERING_OS_PHASE_14E.md",
      ".github/workflows/phase-14e-engineering-os-ga.yml",
      "packages/engineering-os-certification/scripts/run-phase14e-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const home = readFileSync(
      resolve(root, "apps/web/src/app/(platform)/engineering/page.tsx"),
      "utf8",
    );
    expect(home).toContain('data-testid="engineering-os-v1-ready"');
  });

  it("does not start Security & Assurance or live solvers", () => {
    expect(existsSync(resolve(root, "packages/rtb-security-assurance"))).toBe(false);
    expect(existsSync(resolve(root, "packages/customer-trust-center"))).toBe(false);
    const gaps = readFileSync(
      resolve(root, "docs/architecture/ENGINEERING_OS_V1_GA_GAP_REGISTER.md"),
      "utf8",
    );
    expect(gaps).toContain("REQUIRED_BEFORE_TIER1_PRODUCTION");
    expect(gaps).toMatch(/REQUIRED_BEFORE_GA open = 0/);
  });
});
