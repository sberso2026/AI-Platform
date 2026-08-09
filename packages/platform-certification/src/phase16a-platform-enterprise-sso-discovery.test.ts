import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 16A Platform Enterprise SSO Discovery", () => {
  it("declares discovery version and keeps S08/S07 incomplete", () => {
    const version = readFileSync(
      resolve(root, "packages/platform-identity/src/version.ts"),
      "utf8",
    );
    const flags = readFileSync(
      resolve(root, "packages/platform-identity/src/discovery-flags.ts"),
      "utf8",
    );
    expect(version).toContain(
      'PLATFORM_IDENTITY_VERSION = "0.1.0-enterprise-sso-discovery"',
    );
    expect(version).toContain("cf3e9eff49c1314ea16e115dcde26cd45e520121");
    expect(version).toContain("3bfc02478f50ce17f7a81e4e312986c9e1377535");
    expect(flags).toContain("EnterpriseIdentityDiscoveryReady = true");
    expect(flags).toContain("S08CustomerSsoProductionReady = false");
    expect(flags).toContain("S07ExternalPenTestComplete = false");
    expect(flags).toContain("securityAssuranceOwnsCustomerSso = false");
    expect(flags).toContain("phase16BReady = true");
  });

  it("requires discovery corpus and preserves frozen baselines", () => {
    for (const rel of [
      "docs/architecture/PLATFORM_IDENTITY_PHASE_16A.md",
      "docs/architecture/PLATFORM_ENTERPRISE_IDENTITY_ARCHITECTURE.md",
      "docs/architecture/PLATFORM_ENTERPRISE_SSO_OWNERSHIP_MATRIX.md",
      "docs/identity/PLATFORM_IDENTITY_PHASE_16A_EXISTING_FOOTPRINT.md",
      "docs/identity/PLATFORM_ENTERPRISE_SSO_PROTOCOL_STRATEGY.md",
      "docs/identity/PLATFORM_ENTERPRISE_IDENTITY_LIFECYCLE.md",
      "docs/identity/PLATFORM_ENTERPRISE_SSO_TIER1_READINESS.md",
      "docs/identity/PLATFORM_ENTERPRISE_SSO_GAP_REGISTER.md",
      "docs/identity/PLATFORM_ENTERPRISE_SSO_IMPLEMENTATION_ROADMAP.md",
      "docs/identity/PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACTS_0_1_0_DRAFT.md",
      "docs/security/PLATFORM_ENTERPRISE_SSO_THREAT_MODEL.md",
      ".github/workflows/phase-16a-platform-enterprise-sso-discovery.yml",
      "packages/platform-identity-certification/scripts/run-phase16a-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const sa = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    expect(sa).toContain('SECURITY_ASSURANCE_VERSION = "1.0.0"');
    const eos = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(eos).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
  });

  it("does not claim production SSO or start 16B implementation docs", () => {
    expect(
      existsSync(resolve(root, "docs/architecture/PLATFORM_IDENTITY_PHASE_16B.md")),
    ).toBe(false);
    expect(existsSync(resolve(root, "packages/security-assurance-sso"))).toBe(false);
    const flags = readFileSync(
      resolve(root, "packages/platform-identity/src/discovery-flags.ts"),
      "utf8",
    );
    expect(flags).toContain("EnterpriseSsoRuntimeImplemented = false");
    expect(flags).toContain("CustomerSsoProductionReady = false");
  });
});
