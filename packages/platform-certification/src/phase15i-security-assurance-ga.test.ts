import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 15I Security & Assurance V1.0 Production GA", () => {
  it("freezes at 1.0.0 with GA certified flags", () => {
    const version = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    expect(version).toContain('SECURITY_ASSURANCE_VERSION = "1.0.0"');
    expect(version).toContain('SECURITY_ASSURANCE_STATUS = "ga"');
    expect(version).toContain("SecurityAssurancePublicContractsFrozen = true");
    expect(version).toContain("SecurityAssuranceV1GaCertified = true");
    expect(version).toContain("SecurityAssuranceV1Frozen = true");
    expect(version).toContain("productionSecurityAssuranceReady = true");
    expect(version).toContain("e1d2d72170c3fa47bc2dddcd13b596890387666f");
  });

  it("requires freeze corpus, UI marker, manifest, and preserves EOS V1", () => {
    for (const rel of [
      "docs/architecture/SECURITY_ASSURANCE_PHASE_15I.md",
      "docs/security/SECURITY_ASSURANCE_V1_PUBLIC_CONTRACTS.md",
      "docs/security/SECURITY_ASSURANCE_V1_TIER1_DEPLOYMENT_REQUIREMENTS.md",
      "docs/commercial/SECURITY_ASSURANCE_V1_PACKAGING.md",
      "docs/operations/SECURITY_ASSURANCE_V1_OPERATIONS.md",
      "packages/security-assurance/manifest/security-assurance-module-manifest.json",
      "apps/web/src/app/(platform)/platform/security-assurance/page.tsx",
      ".github/workflows/phase-15i-security-assurance-ga.yml",
      "packages/security-assurance-certification/scripts/run-phase15i-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const ui = readFileSync(
      resolve(root, "apps/web/src/app/(platform)/platform/security-assurance/page.tsx"),
      "utf8",
    );
    expect(ui).toContain('data-testid="security-assurance-v1-ready"');
    const eos = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(eos).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
  });

  it("does not start post-GA feature phases or Trust Center", () => {
    expect(existsSync(resolve(root, "docs/architecture/SECURITY_ASSURANCE_PHASE_15J.md"))).toBe(
      false,
    );
    expect(existsSync(resolve(root, "packages/customer-trust-center"))).toBe(false);
    expect(existsSync(resolve(root, "packages/siem"))).toBe(false);
  });
});
