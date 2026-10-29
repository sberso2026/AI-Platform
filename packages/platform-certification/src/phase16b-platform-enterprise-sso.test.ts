import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 16B Platform Enterprise SSO / S08", () => {
  it("advances to 0.2.0-enterprise-sso and closes S08", () => {
    const version = readFileSync(
      resolve(root, "packages/platform-identity/src/version.ts"),
      "utf8",
    );
    const runtime = readFileSync(
      resolve(root, "packages/platform-identity/src/runtime-flags.ts"),
      "utf8",
    );
    expect(version).toMatch(
      /PLATFORM_IDENTITY_VERSION = "(0\.2\.0-enterprise-sso|0\.3\.0-pen-test-readiness|0\.3\.1-internal-adversarial)"/,
    );
    expect(version).toContain("af1e0425c77c516d4cf99a42d5e3eab9bee7206e");
    expect(runtime).toContain("EnterpriseSsoRuntimeImplemented = true");
    expect(runtime).toContain("S08CustomerSsoProductionReady = true");
    expect(runtime).toContain("CustomerSsoProductionReady = true");
    expect(runtime).toContain("S07ExternalPenTestComplete = false");
    expect(runtime).toContain("Tier1EnterpriseProductionReady = false");
    expect(runtime).toContain("nearFinalTier1AttackSurfaceReadyForExternalPenTest = true");
    expect(runtime).toContain("phase16CReady = true");
  });

  it("requires 16B corpus, migration, UI marker, and frozen baselines", () => {
    for (const rel of [
      "docs/architecture/PLATFORM_IDENTITY_PHASE_16B.md",
      "docs/operations/PLATFORM_ENTERPRISE_SSO_OPERATIONS.md",
      "docs/identity/PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACTS_0_2_0.md",
      "supabase/migrations/20260808350000_batch_96_platform_enterprise_identity_oidc.sql",
      "apps/web/src/app/(platform)/platform/enterprise-sso/page.tsx",
      "apps/web/src/app/api/platform/enterprise-sso/discover/route.ts",
      ".github/workflows/phase-16b-platform-enterprise-sso.yml",
      "packages/platform-identity-certification/scripts/run-phase16b-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const ui = readFileSync(
      resolve(root, "apps/web/src/app/(platform)/platform/enterprise-sso/page.tsx"),
      "utf8",
    );
    expect(ui).toContain('data-testid="platform-enterprise-sso-ready"');
    const sa = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    expect(sa).toContain('SECURITY_ASSURANCE_VERSION = "1.0.0"');
  });

  it("preserves SAML/SCIM/live-Entra boundaries and S07 incomplete", () => {
    const runtime = readFileSync(
      resolve(root, "packages/platform-identity/src/runtime-flags.ts"),
      "utf8",
    );
    expect(runtime).toContain("SamlFederationImplemented = false");
    expect(runtime).toContain("ScimProvisioningImplemented = false");
    expect(runtime).toContain("LiveEntraIntegrationImplemented = false");
    expect(runtime).toContain("S07ExternalPenTestComplete = false");
  });
});
