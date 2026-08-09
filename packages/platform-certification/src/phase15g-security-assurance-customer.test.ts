import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 15G Security & Assurance Customer Assurance", () => {
  it("advances to 0.7.0-customer-assurance with Customer Assurance ready", () => {
    const version = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    const flags = readFileSync(
      resolve(root, "packages/security-assurance/src/customer-assurance-flags.ts"),
      "utf8",
    );
    const discovery = readFileSync(
      resolve(root, "packages/security-assurance/src/discovery-flags.ts"),
      "utf8",
    );
    expect(version).toMatch(/SECURITY_ASSURANCE_VERSION = "0\.[78]\.0-/);
    expect(version).toContain("924b2eaa7f6bfc635d742c5310cff3a22ed5d446");
    expect(flags).toContain("CustomerAssuranceImplemented = true");
    expect(flags).toContain("AssuranceDisclosurePolicyReady = true");
    expect(flags).toContain("automaticCustomerAssurancePublicationEnabled = false");
    expect(flags).toContain("S07ExternalPenTestComplete = false");
    expect(flags).toContain("phase15HReady = true");
    expect(discovery).toContain("CustomerTrustCenterImplemented = false");
    expect(discovery).toContain("ComplianceIntelligenceImplemented = true");
  });

  it("requires customer corpus, migration, UI, and preserves EOS V1 freeze", () => {
    for (const rel of [
      "docs/architecture/SECURITY_ASSURANCE_PHASE_15G.md",
      "docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_7_0.md",
      "packages/security-assurance/src/domain/customer-assurance/engine.ts",
      "supabase/migrations/20260808340000_batch_95_security_assurance_customer.sql",
      "apps/web/src/app/(platform)/platform/security-assurance/customer-assurance/page.tsx",
      ".github/workflows/phase-15g-security-assurance-customer.yml",
      "packages/security-assurance-certification/scripts/run-phase15g-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const ui = readFileSync(
      resolve(
        root,
        "apps/web/src/app/(platform)/platform/security-assurance/customer-assurance/page.tsx",
      ),
      "utf8",
    );
    expect(ui).toContain('data-testid="security-assurance-customer-ready"');
    const eos = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(eos).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
  });

  it("does not implement Trust Center or automatic external disclosure", () => {
    expect(existsSync(resolve(root, "packages/customer-trust-center"))).toBe(false);
    expect(existsSync(resolve(root, "packages/grc"))).toBe(false);
    const runtime = readFileSync(
      resolve(
        root,
        "packages/security-assurance/src/domain/customer-assurance/runtime.ts",
      ),
      "utf8",
    );
    expect(runtime).toContain("trustCenterProduct: false");
    expect(runtime).toContain("duplicateAssuranceStack: false");
    expect(runtime).toContain("automaticExternalDisclosure: false");
  });
});
