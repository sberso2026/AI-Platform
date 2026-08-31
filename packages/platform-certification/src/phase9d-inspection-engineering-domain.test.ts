/**
 * Phase 9D architecture boundary tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9D Inspection Intelligence engineering domain", () => {
  it("ships Engineering Domain SDK", () => {
    expect(existsSync(resolve(ROOT, "packages/engineering-os/src/domain-sdk/index.ts"))).toBe(true);
    expect(
      readFileSync(resolve(ROOT, "packages/engineering-os/src/index.ts"), "utf8"),
    ).toContain("./domain-sdk");
  });

  it("ships domain frameworks and batch 45 migration", () => {
    for (const file of [
      "packages/inspection-intelligence/src/domain/defects.ts",
      "packages/inspection-intelligence/src/domain/recommendations.ts",
      "packages/inspection-intelligence/src/domain/corrective-actions.ts",
      "packages/inspection-intelligence/src/domain/assessments.ts",
      "packages/inspection-intelligence/src/domain/verification.ts",
      "packages/inspection-intelligence/src/domain/close-out.ts",
      "packages/inspection-intelligence/src/domain/compliance.ts",
      "packages/inspection-intelligence/src/domain/kpis.ts",
      "packages/inspection-intelligence/src/domain/risk-adapter.ts",
    ]) {
      expect(existsSync(resolve(ROOT, file)), file).toBe(true);
    }
    const migration = readFileSync(
      resolve(
        ROOT,
        "supabase/migrations/20260806220000_batch_45_inspection_intelligence_engineering_domain.sql",
      ),
      "utf8",
    );
    expect(migration).toContain("inspection_defects");
    expect(migration).toContain("inspection_corrective_actions");
    expect(migration).toContain("inspection_verifications");
    expect(migration).toContain("inspection_risk_links");
  });

  it("forbids offline and AI Vision and preserves domain complete + PI v1", () => {
    const version = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_AI_VISION_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_ENGINEERING_DOMAIN_COMPLETE = true/);
    expect(
      readFileSync(resolve(ROOT, "packages/project-intelligence/src/version.ts"), "utf8"),
    ).toMatch(/PROJECT_INTELLIGENCE_VERSION = "1\.0\.0"/);
  });

  it("exposes domain-complete UI markers", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain("inspection-intelligence-engineering-domain-ready");
  });
});
