import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 15H Security & Assurance V1 GA Readiness", () => {
  it("advances to 0.8.0-ga-readiness with readiness decision", () => {
    const version = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    const flags = readFileSync(
      resolve(root, "packages/security-assurance/src/ga-readiness-flags.ts"),
      "utf8",
    );
    expect(version).toContain('SECURITY_ASSURANCE_VERSION = "0.8.0-ga-readiness"');
    expect(version).toContain("a7b309fbb556ed96f03a8e1c206955e54d90f1b2");
    expect(flags).toContain("SecurityAssuranceGaReadinessAssessmentComplete = true");
    expect(flags).toContain("securityAssuranceV1GaCertified = false");
    expect(flags).toContain("SecurityAssurancePublicContractsFrozenAt1_0_0 = false");
    expect(flags).toContain("phase15IReady");
  });

  it("requires readiness corpus, UI marker, and preserves EOS V1 freeze", () => {
    for (const rel of [
      "docs/architecture/SECURITY_ASSURANCE_PHASE_15H.md",
      "docs/security/SECURITY_ASSURANCE_V1_GA_GAP_REGISTER.md",
      "docs/security/SECURITY_ASSURANCE_V1_CAPABILITY_MATURITY_MATRIX.md",
      "docs/security/SECURITY_ASSURANCE_V1_OPERATIONS_RUNBOOK.md",
      "docs/security/SECURITY_ASSURANCE_V1_COMMERCIAL_PACKAGING.md",
      "docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_8_0.md",
      "packages/security-assurance/src/domain/ga-readiness/assessment.ts",
      "apps/web/src/app/(platform)/platform/security-assurance/page.tsx",
      ".github/workflows/phase-15h-security-assurance-v1-ga.yml",
      "packages/security-assurance-certification/scripts/run-phase15h-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const ui = readFileSync(
      resolve(root, "apps/web/src/app/(platform)/platform/security-assurance/page.tsx"),
      "utf8",
    );
    expect(ui).toContain('data-testid="security-assurance-v1-readiness"');
    const eos = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(eos).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
  });

  it("does not freeze V1 GA or start Phase 15I", () => {
    expect(existsSync(resolve(root, "docs/architecture/SECURITY_ASSURANCE_PHASE_15I.md"))).toBe(
      false,
    );
    expect(existsSync(resolve(root, "packages/customer-trust-center"))).toBe(false);
    const flags = readFileSync(
      resolve(root, "packages/security-assurance/src/ga-readiness-flags.ts"),
      "utf8",
    );
    expect(flags).toContain("securityAssuranceV1GaCertified = false");
  });
});
