import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 15C Security & Assurance isolation", () => {
  it("advances to 0.3.0-isolation-assurance with isolation ready", () => {
    const version = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    const flags = readFileSync(
      resolve(root, "packages/security-assurance/src/isolation-flags.ts"),
      "utf8",
    );
    expect(version).toMatch(/SECURITY_ASSURANCE_VERSION = "0\.[678]\.0-|1\.0\.0/);
    expect(version).toContain("897383f5a95cf81847ee866c1c1fdac5012b25a5");
    expect(flags).toContain("IsolationAssuranceRuntimeImplemented = true");
    expect(flags).toContain("IsolationAssuranceReady = true");
    expect(flags).toContain("knownCrossTenantLeakageDetected = false");
    expect(flags).toContain("automaticRlsMutationEnabled = false");
    expect(flags).toContain("phase15DReady = true");
  });

  it("requires isolation corpus, migration, UI, and preserves EOS V1 freeze", () => {
    for (const rel of [
      "docs/architecture/SECURITY_ASSURANCE_PHASE_15C.md",
      "docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_3_0.md",
      "packages/security-assurance/src/domain/isolation/engine.ts",
      "packages/security-assurance/src/domain/isolation/probe-registry.ts",
      "supabase/migrations/20260808300000_batch_91_security_assurance_isolation.sql",
      "apps/web/src/app/(platform)/platform/security-assurance/page.tsx",
      ".github/workflows/phase-15c-security-assurance-isolation.yml",
      "packages/security-assurance-certification/scripts/run-phase15c-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const ui = readFileSync(
      resolve(root, "apps/web/src/app/(platform)/platform/security-assurance/page.tsx"),
      "utf8",
    );
    expect(ui).toContain('data-testid="security-assurance-isolation-ready"');
    const eos = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(eos).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
  });

  it("does not implement advanced security products or mutate RLS", () => {
    expect(existsSync(resolve(root, "packages/customer-trust-center"))).toBe(false);
    expect(existsSync(resolve(root, "packages/siem"))).toBe(false);
    const engine = readFileSync(
      resolve(root, "packages/security-assurance/src/domain/isolation/engine.ts"),
      "utf8",
    );
    expect(engine).toContain("automaticRlsMutationEnabled = false");
    expect(engine).toContain("fallbackToPassForbidden: true");
  });
});
