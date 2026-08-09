import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 15E Security & Assurance Secure Compute", () => {
  it("advances to 0.5.0-secure-compute with Secure Compute ready", () => {
    const version = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    const flags = readFileSync(
      resolve(root, "packages/security-assurance/src/secure-compute-flags.ts"),
      "utf8",
    );
    expect(version).toContain('SECURITY_ASSURANCE_VERSION = "0.5.0-secure-compute"');
    expect(version).toContain("ef8efd2b4b30082e9c26ac867c65c51e3e39d207");
    expect(flags).toContain("SecureComputeAssuranceReady = true");
    expect(flags).toContain("SecureComputeAssuranceRuntimeImplemented = true");
    expect(flags).toContain("duplicateSandboxDetected = false");
    expect(flags).toContain("phase15FReady = true");
  });

  it("requires secure-compute corpus, migration, UI, and preserves EOS V1 freeze", () => {
    for (const rel of [
      "docs/architecture/SECURITY_ASSURANCE_PHASE_15E.md",
      "docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_5_0.md",
      "packages/security-assurance/src/domain/secure-compute/engine.ts",
      "supabase/migrations/20260808320000_batch_93_security_assurance_secure_compute.sql",
      "apps/web/src/app/(platform)/platform/security-assurance/page.tsx",
      ".github/workflows/phase-15e-security-assurance-secure-compute.yml",
      "packages/security-assurance-certification/scripts/run-phase15e-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const ui = readFileSync(
      resolve(root, "apps/web/src/app/(platform)/platform/security-assurance/page.tsx"),
      "utf8",
    );
    expect(ui).toContain('data-testid="security-assurance-secure-compute-ready"');
    const eos = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(eos).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
  });

  it("does not implement TEE platform or duplicate execution host", () => {
    expect(existsSync(resolve(root, "packages/tee"))).toBe(false);
    expect(existsSync(resolve(root, "packages/confidential-compute"))).toBe(false);
    const runtime = readFileSync(
      resolve(root, "packages/security-assurance/src/domain/secure-compute/runtime.ts"),
      "utf8",
    );
    expect(runtime).toContain("duplicateExecutionHost: false");
    expect(runtime).toContain("teeImplementation: false");
  });
});
