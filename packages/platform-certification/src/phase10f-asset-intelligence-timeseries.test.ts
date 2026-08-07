import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

describe("Phase 10F Asset Intelligence Time Series architecture lock", () => {
  it("exports timeseries readiness and pins Phase 10E baseline", () => {
    const version = readFileSync(
      resolve(root, "packages/asset-intelligence/src/version.ts"),
      "utf8",
    );
    expect(version).toMatch(/ASSET_INTELLIGENCE_VERSION = "0\.6\.0-timeseries"/);
    expect(version).toMatch(/ENGINEERING_TIME_SERIES_READY = true/);
    expect(version).toMatch(/CHANGE_DETECTION_ENGINE_READY = true/);
    expect(version).toMatch(/TREND_CONFIDENCE_ENGINE_READY = true/);
    expect(version).toMatch(/DEGRADATION_ANALYSIS_READY = true/);
    expect(version).toMatch(/DEGRADATION_HEALTH_CONTRIBUTION_ENABLED = false/);
    expect(version).toMatch(/RUL_CLAIMS_CERTIFIED = false/);
    expect(version).toMatch(
      /PHASE_10E_CERTIFIED_COMMIT = "ed127cd85901f8053d09155f7c4053f0b22b8a5f"/,
    );
  });

  it("has docs, migration, workflow, and cert runner", () => {
    expect(
      existsSync(
        resolve(root, "docs/architecture/ASSET_INTELLIGENCE_TIMESERIES_TREND_DEGRADATION.md"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          root,
          "supabase/migrations/20260807160000_batch_55_asset_intelligence_timeseries.sql",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(root, ".github/workflows/phase-10f-asset-intelligence-timeseries.yml"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          root,
          "packages/asset-intelligence-certification/scripts/run-phase10f-certification.ts",
        ),
      ),
    ).toBe(true);
  });
});
