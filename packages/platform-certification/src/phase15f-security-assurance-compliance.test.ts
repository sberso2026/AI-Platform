import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 15F Security & Assurance Compliance Intelligence", () => {
  it("advances to 0.6.0-compliance-intelligence with Compliance ready", () => {
    const version = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    const flags = readFileSync(
      resolve(root, "packages/security-assurance/src/compliance-intelligence-flags.ts"),
      "utf8",
    );
    const discovery = readFileSync(
      resolve(root, "packages/security-assurance/src/discovery-flags.ts"),
      "utf8",
    );
    expect(version).toMatch(/SECURITY_ASSURANCE_VERSION = "0\.[678]\.0-|1\.0\.0/);
    expect(version).toContain("aa5150fc4acf287b50c973220c40d62b7f91687f");
    expect(flags).toContain("ComplianceIntelligenceReady = true");
    expect(flags).toContain("ComplianceFrameworkRegistryImplemented = true");
    expect(flags).toContain("automaticCertificationEnabled = false");
    expect(flags).toContain("phase15GReady = true");
    expect(discovery).toContain("ComplianceIntelligenceImplemented = true");
  });

  it("requires compliance corpus, migration, UI, and preserves EOS V1 freeze", () => {
    for (const rel of [
      "docs/architecture/SECURITY_ASSURANCE_PHASE_15F.md",
      "docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_6_0.md",
      "packages/security-assurance/src/domain/compliance-intelligence/engine.ts",
      "supabase/migrations/20260808330000_batch_94_security_assurance_compliance.sql",
      "apps/web/src/app/(platform)/platform/security-assurance/page.tsx",
      ".github/workflows/phase-15f-security-assurance-compliance.yml",
      "packages/security-assurance-certification/scripts/run-phase15f-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const ui = readFileSync(
      resolve(root, "apps/web/src/app/(platform)/platform/security-assurance/page.tsx"),
      "utf8",
    );
    expect(ui).toContain('data-testid="security-assurance-compliance-ready"');
    const eos = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(eos).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
  });

  it("does not implement Trust Center or GRC replacement", () => {
    expect(existsSync(resolve(root, "packages/customer-trust-center"))).toBe(false);
    expect(existsSync(resolve(root, "packages/grc"))).toBe(false);
    const runtime = readFileSync(
      resolve(
        root,
        "packages/security-assurance/src/domain/compliance-intelligence/runtime.ts",
      ),
      "utf8",
    );
    expect(runtime).toContain("certificationAuthority: false");
    expect(runtime).toContain("duplicateSecurityControlRegistry: false");
  });
});
