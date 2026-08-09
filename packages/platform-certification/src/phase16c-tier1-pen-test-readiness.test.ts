import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 16C Tier-1 External Pen-Test Readiness", () => {
  it("advances to 0.3.0-pen-test-readiness without completing S07", () => {
    const version = readFileSync(
      resolve(root, "packages/platform-identity/src/version.ts"),
      "utf8",
    );
    const readiness = readFileSync(
      resolve(root, "packages/platform-identity/src/pen-test-readiness-flags.ts"),
      "utf8",
    );
    const runtime = readFileSync(
      resolve(root, "packages/platform-identity/src/runtime-flags.ts"),
      "utf8",
    );
    expect(version).toContain(
      'PLATFORM_IDENTITY_VERSION = "0.3.0-pen-test-readiness"',
    );
    expect(version).toContain("0078c9b67021b695c5a4137905247818dd945d83");
    expect(version).toContain(
      'PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACT_VERSION',
    );
    expect(version).toContain('"0.2.0-enterprise-sso"');
    expect(readiness).toContain("ExternalPenTestReadinessReady = true");
    expect(readiness).toContain("S07ClosureCriteriaLocked = true");
    expect(readiness).toContain("FakeExternalPenTestResultPresent = false");
    expect(readiness).toContain("InternalPenetrationTestOpinionIssued = false");
    expect(runtime).toContain("S08CustomerSsoProductionReady = true");
    expect(runtime).toContain("S07ExternalPenTestComplete = false");
    expect(runtime).toContain("Tier1EnterpriseProductionReady = false");
  });

  it("requires scope, RoE, inventory, assessor package, and workflow", () => {
    for (const rel of [
      "docs/architecture/PLATFORM_IDENTITY_PHASE_16C.md",
      "docs/security/RTB_TIER1_ATTACK_SURFACE_INVENTORY.md",
      "docs/security/RTB_TIER1_EXTERNAL_PENETRATION_TEST_SCOPE.md",
      "docs/security/RTB_TIER1_PEN_TEST_RULES_OF_ENGAGEMENT.md",
      "docs/security/RTB_TIER1_PEN_TEST_REMEDIATION_AND_S07_CLOSURE.md",
      "docs/security/RTB_TIER1_PEN_TEST_ASSESSOR_PACKAGE.md",
      ".github/workflows/phase-16c-tier1-pen-test-readiness.yml",
      "packages/platform-identity-certification/scripts/run-phase16c-certification.ts",
      "packages/platform-identity/src/domain/pen-test-readiness.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });
});
