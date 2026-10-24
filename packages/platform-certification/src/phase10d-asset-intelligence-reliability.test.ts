/**
 * Phase 10D architecture tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 10D Asset Intelligence Reliability", () => {
  it("ships reliability, evidence confidence, health profile, batch_53", () => {
    for (const f of [
      "packages/asset-intelligence/src/domain/reliability.ts",
      "packages/asset-intelligence/src/domain/evidence-confidence.ts",
      "packages/asset-intelligence/src/domain/health-profile.ts",
      "packages/asset-intelligence/src/domain/health-composer.ts",
      "supabase/migrations/20260807140000_batch_53_asset_intelligence_reliability.sql",
      "docs/architecture/ASSET_INTELLIGENCE_HEALTH_SEMANTICS.md",
      "docs/architecture/ASSET_INTELLIGENCE_EVIDENCE_CONFIDENCE.md",
      "docs/architecture/ASSET_INTELLIGENCE_RELIABILITY_MODEL.md",
      "apps/web/src/app/api/engineering/asset-intelligence/reliability/route.ts",
      "apps/web/src/app/api/engineering/asset-intelligence/health-profile/route.ts",
    ]) {
      expect(existsSync(resolve(ROOT, f)), f).toBe(true);
    }
  });

  it("locks health-index without composition scoring and v2 semantics", () => {
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
    expect(index).not.toMatch(/compose_condition_reliability_v2/);
    expect(index).not.toMatch(/class HealthCompositionEngine/);
    expect(composer).toMatch(/compose_condition_criticality_v1/);
    expect(composer).toMatch(/compose_condition_reliability_v2/);
    expect(composer).toMatch(/CRITICALITY_IS_HEALTH_FACTOR_V2 = false/);
    expect(version).toMatch(/ASSET_INTELLIGENCE_VERSION = "0\.4\.0-reliability"/);
    expect(version).toMatch(/CRITICALITY_IS_HEALTH_FACTOR = false/);
    expect(version).toMatch(/EVIDENCE_CONFIDENCE_ENGINE_READY = true/);
    expect(version).toMatch(/PROBABILITY_OF_FAILURE_CERTIFIED = false/);
    expect(version).toMatch(/PHASE_10C_CERTIFIED_COMMIT = "10b0259134995f55bfe889dba2386edd653d9c2b"/);
  });
});
