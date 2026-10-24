import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 16C.1 Internal Adversarial Security & S07 Deferral", () => {
  it("advances to 0.3.1-internal-adversarial without closing S07", () => {
    const version = readFileSync(
      resolve(root, "packages/platform-identity/src/version.ts"),
      "utf8",
    );
    const adversarial = readFileSync(
      resolve(root, "packages/platform-identity/src/internal-adversarial-flags.ts"),
      "utf8",
    );
    const runtime = readFileSync(
      resolve(root, "packages/platform-identity/src/runtime-flags.ts"),
      "utf8",
    );
    expect(version).toContain(
      'PLATFORM_IDENTITY_VERSION = "0.3.1-internal-adversarial"',
    );
    expect(version).toContain("2999b103d35ce600ced3a15f2e39eef146c48236");
    expect(version).toContain("internalAdversarialNeqExternalPenTest");
    expect(adversarial).toContain(
      'S07Status = "DEFERRED_UNTIL_TIER1_COMMERCIALIZATION"',
    );
    expect(adversarial).toContain("S07RequirementWaived = false");
    expect(adversarial).toContain("ExternalPenTestStillRequiredForTier1 = true");
    expect(adversarial).toContain("ExternalPenTestPerformed = false");
    expect(adversarial).toContain(
      "InternalAdversarialSecurityValidationReady = true",
    );
    expect(adversarial).toContain(
      "KnownCriticalInternalSecurityFindingOpen = false",
    );
    expect(adversarial).toContain("KnownHighInternalSecurityFindingOpen = false");
    expect(runtime).toContain("S08CustomerSsoProductionReady = true");
    expect(runtime).toContain("S07ExternalPenTestComplete = false");
    expect(runtime).toContain("Tier1EnterpriseProductionReady = false");
  });

  it("requires deferral/docs/suite/workflow and preserves 16C package", () => {
    for (const rel of [
      "docs/architecture/PLATFORM_IDENTITY_PHASE_16C1.md",
      "docs/security/S07_EXTERNAL_PEN_TEST_DEFERRAL.md",
      "docs/security/INTERNAL_ADVERSARIAL_SECURITY_VALIDATION.md",
      "docs/security/INTERNAL_SECURITY_TEST_MATRIX.md",
      "docs/security/INTERNAL_SECURITY_FINDINGS.md",
      "docs/security/INTERNAL_SECURITY_REGRESSION_RUNBOOK.md",
      "docs/security/RTB_TIER1_EXTERNAL_PENETRATION_TEST_SCOPE.md",
      "docs/security/RTB_TIER1_PEN_TEST_RULES_OF_ENGAGEMENT.md",
      ".github/workflows/phase-16c1-internal-adversarial-security.yml",
      "packages/platform-identity/src/domain/internal-adversarial/suite.ts",
      "packages/platform-identity-certification/scripts/run-phase16c1-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
  });
});
