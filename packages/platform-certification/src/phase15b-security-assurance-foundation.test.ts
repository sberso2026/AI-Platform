import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 15B Security & Assurance foundation", () => {
  it("advances to 0.2.0-control-evidence with foundation ready", () => {
    const version = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    const flags = readFileSync(
      resolve(root, "packages/security-assurance/src/foundation-flags.ts"),
      "utf8",
    );
    expect(version).toMatch(/0\.[678]\.0-/);
    expect(version).toContain("c0e96eaa03c76146bbeb6eb68bdc8c49f5efdf0f");
    expect(version).toContain("4748972076f77e7392bb41ec664adddfeb677407");
    expect(flags).toContain("SecurityAssuranceFoundationReady = true");
    expect(flags).toContain("automaticSecurityApprovalEnabled = false");
    expect(flags).toContain("phase15CReady = true");
    expect(flags).toContain("implementsOwnAiStack = false");
  });

  it("requires foundation corpus, migration, UI, and preserves EOS V1 freeze", () => {
    for (const rel of [
      "docs/architecture/SECURITY_ASSURANCE_PHASE_15B.md",
      "docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_2_0.md",
      "packages/security-assurance/src/domain/control-registry.ts",
      "packages/security-assurance/src/domain/evidence-registry.ts",
      "packages/security-assurance/src/domain/assessment-engine.ts",
      "supabase/migrations/20260808290000_batch_90_security_assurance_foundation.sql",
      "apps/web/src/app/(platform)/platform/security-assurance/page.tsx",
      ".github/workflows/phase-15b-security-assurance-foundation.yml",
      "packages/security-assurance-certification/scripts/run-phase15b-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const eos = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(eos).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
    expect(eos).toContain("engineeringOSV1Frozen = true");
  });

  it("does not implement advanced security products or duplicate engines", () => {
    expect(existsSync(resolve(root, "packages/customer-trust-center"))).toBe(false);
    expect(existsSync(resolve(root, "packages/security-intelligence"))).toBe(false);
    expect(existsSync(resolve(root, "packages/siem"))).toBe(false);
    const foundation = readFileSync(
      resolve(root, "packages/security-assurance/src/domain/foundation.ts"),
      "utf8",
    );
    expect(foundation).toContain("duplicatePolicyEngine: false");
    expect(foundation).toContain("policyEngine: true");
  });
});
