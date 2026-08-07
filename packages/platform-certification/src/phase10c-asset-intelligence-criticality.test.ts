/**
 * Phase 10C architecture tests — Health Composition Engine separation.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 10C Asset Intelligence Criticality", () => {
  it("ships criticality, health composer, review, and batch_52 migration", () => {
    for (const f of [
      "packages/asset-intelligence/src/domain/criticality.ts",
      "packages/asset-intelligence/src/domain/health-composer.ts",
      "packages/asset-intelligence/src/domain/review-workflow.ts",
      "supabase/migrations/20260807130000_batch_52_asset_intelligence_criticality_health.sql",
      "docs/architecture/ASSET_INTELLIGENCE_HEALTH_COMPOSITION.md",
      "docs/architecture/ASSET_INTELLIGENCE_CRITICALITY_MODEL.md",
      "apps/web/src/app/api/engineering/asset-intelligence/criticality/route.ts",
    ]) {
      expect(existsSync(resolve(ROOT, f)), f).toBe(true);
    }
  });

  it("locks Health Index vs Health Composition Engine separation", () => {
    const index = readFileSync(
      resolve(ROOT, "packages/asset-intelligence/src/domain/health-index.ts"),
      "utf8",
    );
    const composer = readFileSync(
      resolve(ROOT, "packages/asset-intelligence/src/domain/health-composer.ts"),
      "utf8",
    );
    const version = readFileSync(
      resolve(ROOT, "packages/asset-intelligence/src/version.ts"),
      "utf8",
    );
    expect(index).toMatch(/AssetHealthIndexState/);
    expect(index).not.toMatch(/compose_condition_criticality_v1/);
    expect(composer).toMatch(/class HealthCompositionEngine/);
    expect(composer).toMatch(/compose_condition_criticality_v1/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_VERSION = "0\.3\.0-criticality"/);
    expect(version).toMatch(/HEALTH_COMPOSITION_ENGINE_READY = true/);
    expect(version).toMatch(/PHASE_10B1_CERTIFIED_COMMIT = "e72822434a38e66a409da3c8a291e68f006888c3"/);
  });
});
