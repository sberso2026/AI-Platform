import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}
function present(rel: string): boolean {
  return existsSync(resolve(root, rel));
}

const PC = "packages/project-controls";
const CERT = "packages/project-controls-certification";
const VERSION = `${PC}/src/version.ts`;
const GATES = `${CERT}/src/phase11g/gates.ts`;
const BATCH_67 =
  "supabase/migrations/20260808070000_batch_67_project_controls_forecast_intelligence.sql";

describe("Phase 11G Project Controls forecast intelligence", () => {
  it("defines exactly 55 gates (A–BC)", () => {
    const ids = [...read(GATES).matchAll(/^\s*\["([A-Z]+)",/gm)].map((m) => m[1]);
    expect(ids.length).toBe(55);
    expect(ids[ids.length - 1]).toBe("BC");
  });

  it("declares the forecast intelligence version and Phase 11F baseline", () => {
    const version = read(VERSION);
    expect(version).toMatch(/PROJECT_CONTROLS_VERSION = "0\.7\.0-forecast-intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_STATUS = "forecast_intelligence"/);
    expect(version).toMatch(/PROJECT_CONTROLS_PHASE = "11G"/);
    expect(version).toMatch(
      /PHASE_11F_CERTIFIED_COMMIT =\s*\r?\n?\s*"15702b8eeb0627dda27411e27966e24c4aaead4b"/,
    );
    expect(version).toMatch(/PHASE_11F_HOSTED_RUN = "31234010313"/);
    expect(read(`${PC}/package.json`)).toMatch(/"version": "0\.7\.0-forecast-intelligence"/);
    expect(read(`${CERT}/package.json`)).toMatch(/certify:phase11g/);
  });

  it("locks forecast intelligence ready while predictive capabilities stay forbidden", () => {
    const version = read(VERSION);
    expect(version).toMatch(/FORECAST_INTELLIGENCE_READY = true/);
    expect(version).toMatch(/PROJECT_CONTEXT_COMPOSITION_READY = true/);
    expect(version).toMatch(/FORECAST_ENGINE_IMPLEMENTED = false/);
    expect(version).toMatch(/PREDICTIVE_SCHEDULING_IMPLEMENTED = false/);
    expect(version).toMatch(/FORECAST_EXECUTION_IMPLEMENTED = false/);
    expect(version).toMatch(/PHASE_11H_READY = true/);
    expect(version).toMatch(/PRODUCTION_PROJECT_CONTROLS_READY = true/);
  });

  it("ships forecast domain surface and batch 67 migration", () => {
    for (const file of [
      "forecast.ts",
      "forecast-confidence.ts",
      "forecast-engine.ts",
      "project-context-composition.ts",
    ]) {
      expect(present(`${PC}/src/domain/${file}`), file).toBe(true);
    }
    expect(present(BATCH_67)).toBe(true);
    expect(present("apps/web/src/app/api/engineering/project-controls/forecast/route.ts")).toBe(
      true,
    );
  });
});
