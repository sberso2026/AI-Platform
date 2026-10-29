/**
 * Phase 9I architecture boundary tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 9I Inspection Intelligence AI Vision", () => {
  it("ships vision analysis, assurance, adapters, and docs", () => {
    for (const file of [
      "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
      "packages/inspection-intelligence/src/domain/ai-vision-assurance.ts",
      "packages/inspection-intelligence/src/domain/ai-vision-pack-adapters.ts",
      "packages/inspection-intelligence/src/domain/ai-vision-product.ts",
      "docs/architecture/INSPECTION_INTELLIGENCE_PHASE_9I_AI_VISION.md",
      "docs/security/INSPECTION_INTELLIGENCE_AI_VISION_THREAT_MODEL.md",
      "docs/testing/INSPECTION_INTELLIGENCE_AI_VISION_DEVICE_EVIDENCE.md",
      "supabase/migrations/20260807030000_batch_50_inspection_intelligence_ai_vision.sql",
    ]) {
      expect(existsSync(resolve(ROOT, file)), file).toBe(true);
    }
  });

  it("implements AI Vision while keeping Asset Intelligence false", () => {
    const version = readFileSync(
      resolve(ROOT, "packages/inspection-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/INSPECTION_AI_VISION_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false/);
    expect(version).toMatch(/INSPECTION_CONDITION_RATING_IMPLEMENTED = true/);
    expect(version).toMatch(/INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/);
  });

  it("exposes AI Vision UI markers", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
      ),
      "utf8",
    );
    expect(page).toContain("inspection-intelligence-ai-vision-ready");
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/vision/page.tsx",
        ),
      ),
    ).toBe(true);
  });
});
