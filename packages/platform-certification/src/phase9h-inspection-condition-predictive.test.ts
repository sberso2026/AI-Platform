/**
 * Phase 9H architecture boundary tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9H Inspection Intelligence condition rating and predictive signals", () => {
  it("ships condition, aggregation, predictive, and structural pack modules", () => {
    for (const file of [
      "packages/inspection-intelligence/src/domain/condition-rating.ts",
      "packages/inspection-intelligence/src/domain/condition-aggregation.ts",
      "packages/inspection-intelligence/src/domain/predictive-signals.ts",
      "packages/inspection-intelligence/src/domain/condition-predictive-product.ts",
      "docs/architecture/INSPECTION_INTELLIGENCE_PHASE_9H_CONDITION_PREDICTIVE.md",
      "docs/security/INSPECTION_INTELLIGENCE_CONDITION_PREDICTIVE_THREAT_MODEL.md",
      "docs/testing/INSPECTION_INTELLIGENCE_CONDITION_DEVICE_EVIDENCE.md",
      "supabase/migrations/20260807020000_batch_49_inspection_intelligence_condition_predictive.sql",
    ]) {
      expect(existsSync(resolve(ROOT, file)), file).toBe(true);
    }
    expect(
      readFileSync(
        resolve(ROOT, "packages/inspection-intelligence/src/pack-sdk/index.ts"),
        "utf8",
      ),
    ).toContain("STRUCTURAL_CONDITION_PACK_SDK");
  });

  it("implements condition/predictive flags while keeping AI Vision and Twin false", () => {
    const version = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/INSPECTION_CONDITION_RATING_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_PREDICTIVE_SIGNALS_SCAFFOLDED = true/);
    expect(version).toMatch(/INSPECTION_PACK_EXPANSION_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_PREDICTIVE_IMPLEMENTED = false/);
    expect(version).toMatch(/INSPECTION_AI_VISION_IMPLEMENTED = false/);
    expect(version).toMatch(/INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false/);
    expect(version).toMatch(/INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/);
  });

  it("exposes condition/predictive UI markers", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain("inspection-intelligence-condition-predictive-ready");
    expect(page).toContain("inspection-intelligence-offline-sync-ready");
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/condition/page.tsx",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/predictive/page.tsx",
        ),
      ),
    ).toBe(true);
  });
});
