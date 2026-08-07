import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

describe("Phase 10E Asset Intelligence Failure architecture lock", () => {
  it("exports failure readiness and pins Phase 10D baseline", () => {
    const version = readFileSync(
      resolve(root, "packages/asset-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/ASSET_INTELLIGENCE_VERSION = "0\.5\.0-failure"/);
    expect(version).toMatch(/FAILURE_TAXONOMY_REGISTRY_READY = true/);
    expect(version).toMatch(/FAILURE_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/FAILURE_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(version).toMatch(/CRITICALITY_IS_HEALTH_FACTOR = false/);
    expect(version).toMatch(/PROBABILITY_OF_FAILURE_CERTIFIED = false/);
    expect(version).toMatch(
      /PHASE_10D_CERTIFIED_COMMIT = "ef6981e1c42f80cbb12337c21e6830eb22c3fdbf"/,
    );
  });

  it("keeps failure contribution out of health-index.ts", () => {
    const hi = readFileSync(
      resolve(root, "packages/asset-intelligence/src/domain/health-index.ts"),
      "utf8",
    );
    expect(hi).not.toMatch(/compose_condition_reliability_failure/);
    expect(hi).not.toMatch(/class HealthCompositionEngine/);
  });

  it("has failure docs, migration, workflow, and cert runner", () => {
    expect(
      existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_FAILURE_MODEL.md")),
    ).toBe(true);
    expect(
      existsSync(
        resolve(root, "docs/architecture/ASSET_INTELLIGENCE_FAILURE_DEGRADATION_BOUNDARY.md"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          root,
          "supabase/migrations/20260807150000_batch_54_asset_intelligence_failure.sql",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(root, ".github/workflows/phase-10e-asset-intelligence-failure.yml"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          root,
          "packages/asset-intelligence-certification/scripts/run-phase10e-certification.ts",
        ),
      ),
    ).toBe(true);
  });
});
