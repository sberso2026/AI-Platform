import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");

describe("Phase 15D Security & Assurance AI & Data", () => {
  it("advances to 0.4.0-ai-data-security with AI/data ready", () => {
    const version = readFileSync(
      resolve(root, "packages/security-assurance/src/version.ts"),
      "utf8",
    );
    const flags = readFileSync(
      resolve(root, "packages/security-assurance/src/ai-data-flags.ts"),
      "utf8",
    );
    expect(version).toMatch(/SECURITY_ASSURANCE_VERSION = "0\.[678]\.0-|1\.0\.0/);
    expect(version).toContain("897383f5a95cf81847ee866c1c1fdac5012b25a5");
    expect(flags).toContain("AiDataSecurityReady = true");
    expect(flags).toContain("AiDataSecurityRuntimeImplemented = true");
    expect(flags).toContain("duplicateAiStackDetected = false");
    expect(flags).toContain("phase15EReady = true");
  });

  it("requires AI/data corpus, migration, UI, and preserves EOS V1 freeze", () => {
    for (const rel of [
      "docs/architecture/SECURITY_ASSURANCE_PHASE_15D.md",
      "docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_4_0.md",
      "packages/security-assurance/src/domain/ai-data/engine.ts",
      "supabase/migrations/20260808310000_batch_92_security_assurance_ai_data.sql",
      "apps/web/src/app/(platform)/platform/security-assurance/page.tsx",
      ".github/workflows/phase-15d-security-assurance-ai-data.yml",
      "packages/security-assurance-certification/scripts/run-phase15d-certification.ts",
    ]) {
      expect(existsSync(resolve(root, rel)), rel).toBe(true);
    }
    const ui = readFileSync(
      resolve(root, "apps/web/src/app/(platform)/platform/security-assurance/page.tsx"),
      "utf8",
    );
    expect(ui).toContain('data-testid="security-assurance-ai-data-ready"');
    const eos = readFileSync(
      resolve(root, "packages/engineering-os/src/version.ts"),
      "utf8",
    );
    expect(eos).toContain('ENGINEERING_OS_VERSION = "1.0.0"');
  });

  it("does not implement AI Trust product or duplicate AI stack", () => {
    expect(existsSync(resolve(root, "packages/ai-trust"))).toBe(false);
    expect(existsSync(resolve(root, "packages/dlp"))).toBe(false);
    const runtime = readFileSync(
      resolve(root, "packages/security-assurance/src/domain/ai-data/runtime.ts"),
      "utf8",
    );
    expect(runtime).toContain("duplicateAiStack: false");
  });
});
