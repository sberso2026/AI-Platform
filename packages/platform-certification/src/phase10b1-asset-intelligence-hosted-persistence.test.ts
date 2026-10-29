/**
 * Phase 10B.1 architecture tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Phase 10B.1 Asset Intelligence Hosted Persistence", () => {
  it("ships migration, postgres adapter, and HTTP routes", () => {
    for (const f of [
      "supabase/migrations/20260807120000_batch_51_asset_intelligence_hosted_persistence.sql",
      "packages/asset-intelligence/src/domain/postgres-repository.ts",
      "packages/asset-intelligence/src/domain/repository-factory.ts",
      "apps/web/src/app/api/engineering/asset-intelligence/condition/route.ts",
      "apps/web/src/app/api/engineering/asset-intelligence/health/route.ts",
      "docs/architecture/ASSET_INTELLIGENCE_HOSTED_PERSISTENCE.md",
    ]) {
      expect(existsSync(resolve(ROOT, f)), f).toBe(true);
    }
  });

  it("locks hosted persistence flags", () => {
    const v = readFileSync(resolve(ROOT, "packages/asset-intelligence/src/version.ts"), "utf8");
    expect(v).toMatch(/ASSET_INTELLIGENCE_VERSION = "0\.2\.1-hosted-persistence"/);
    expect(v).toMatch(/HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY = true/);
    expect(v).toMatch(/PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/);
    expect(v).toMatch(/PRODUCTION_ASSET_INTELLIGENCE_READY = false/);
    expect(v).toMatch(/PHASE_10B_CERTIFIED_COMMIT = "ef7268e6dd3873f8941885a87a2723130a6bb6bc"/);
  });
});
