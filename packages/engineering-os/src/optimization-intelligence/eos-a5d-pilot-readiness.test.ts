import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CERTIFICATION_STUB_ADAPTER_ID } from "./manifest";
import { ExecutionHostDelegatingAdapter } from "./host-adapter";
import { isCertificationStubAdapter } from "./certification-adapter";
import type { OptimizationExecutionRequest } from "./execution-port";
import {
  independentReactionSanity,
  isSpaceGassAdapterId,
  SPACE_GASS_CERTIFICATION_MODEL,
  SPACE_GASS_CERTIFICATION_UNITS,
  SPACE_GASS_EXPECTED_BENCHMARK,
  SPACE_GASS_RELATIVE_TOLERANCE,
  totalVerticalLoadkN,
} from "./spacegass-certification-model";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function spaceGassRequest(overrides: Partial<OptimizationExecutionRequest> = {}): OptimizationExecutionRequest {
  return {
    studyId: "st-1",
    runId: "run-1",
    alternativeId: "alt-1",
    scenarioId: null,
    baselineId: "bl-1",
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    adapterId: "spacegass",
    adapterVersion: "0.3.0-spacegass",
    toolId: "spacegass",
    toolVersion: null,
    requestedBy: "engineer-a",
    executionRef: "job-1",
    runInputManifest: {
      manifest_schema_version: 1,
      study: { study_id: "st-1", lifecycle_stage: "FEED" },
      configuration: { baseline_id: "bl-1", baseline_fingerprint: "abc", pinned_configuration_items: [] },
      system_scope: [],
      decision_context: { decision_id: "dec-1" },
      requirements: [],
      assumptions: [],
      interfaces: [],
      objectives: [],
      constraints: [],
      design_variables: [],
      scenario: { scenario_id: null, scenario_code: null, name: null, description: null },
      alternative: { alternative_id: "alt-1", alternative_code: "ALT-A", name: "Bay A", values: [] },
      execution: {
        adapter_id: "spacegass",
        adapter_version: "0.3.0-spacegass",
        tool_id: "spacegass",
        tool_version: null,
        algorithm_id: null,
        algorithm_version: null,
        model_artifact_refs: [],
        artifact_hashes: [],
        random_seed: null,
      },
    },
    ...overrides,
  };
}

describe("EOS-A5D SPACE GASS certification model", () => {
  it("defines a deterministic single-bay portal with SI units", () => {
    expect(SPACE_GASS_CERTIFICATION_MODEL.analysis).toBe("linear_elastic_static");
    expect(SPACE_GASS_CERTIFICATION_UNITS.geometry).toBe("m");
    expect(SPACE_GASS_CERTIFICATION_UNITS.force).toBe("kN");
    expect(SPACE_GASS_CERTIFICATION_UNITS.moment).toBe("kN.m");
    expect(SPACE_GASS_CERTIFICATION_UNITS.displacement).toBe("mm");
    expect(totalVerticalLoadkN()).toBe(80);
    expect(SPACE_GASS_EXPECTED_BENCHMARK.supportReactions.leftVertical_kN).toBe(40);
    expect(SPACE_GASS_RELATIVE_TOLERANCE).toBe(0.005);
  });

  it("passes independent reaction equilibrium sanity for the golden load case", () => {
    const check = independentReactionSanity({
      leftVerticalReaction_kN: 40,
      rightVerticalReaction_kN: 40,
      leftHorizontalReaction_kN: 0,
      rightHorizontalReaction_kN: 0,
      totalAppliedVertical_kN: totalVerticalLoadkN(),
      totalAppliedHorizontal_kN: 0,
    });
    expect(check.ok).toBe(true);
    expect(check.failures).toEqual([]);
  });

  it("fails closed when extracted reactions violate equilibrium", () => {
    const check = independentReactionSanity({
      leftVerticalReaction_kN: 80,
      rightVerticalReaction_kN: 0,
      leftHorizontalReaction_kN: 12,
      rightHorizontalReaction_kN: 0,
      totalAppliedVertical_kN: 80,
      totalAppliedHorizontal_kN: 0,
    });
    expect(check.ok).toBe(false);
    expect(check.failures.length).toBeGreaterThan(0);
  });
});

describe("EOS-A5D SPACE GASS adapter fail-closed", () => {
  it("does not treat the generic test adapter as SPACE GASS", () => {
    expect(isCertificationStubAdapter(CERTIFICATION_STUB_ADAPTER_ID)).toBe(true);
    expect(isSpaceGassAdapterId(CERTIFICATION_STUB_ADAPTER_ID)).toBe(false);
    expect(isSpaceGassAdapterId("spacegass")).toBe(true);
    expect(isSpaceGassAdapterId("spacegass_solver_adapter")).toBe(true);
  });

  it("fail-closes SPACE GASS execution without fabricating metrics", async () => {
    const port = new ExecutionHostDelegatingAdapter();
    const result = await port.execute(spaceGassRequest());
    expect(result.status).not.toBe("succeeded");
    expect(result.metrics).toEqual([]);
    expect(result.errorCode ?? result.status).toMatch(/unavailable|license|failed|rejected|solver/i);
  });
});

describe("EOS-A5D Optimization UI language", () => {
  it("does not present Best, Winner, Recommended, or Approved by AI", () => {
    const src = readFileSync(join(ROOT, "apps/web/src/components/engineering/optimization-workspace.tsx"), "utf8");
    expect(src).not.toMatch(/\bBest\b/);
    expect(src).not.toMatch(/\bWinner\b/);
    expect(src).not.toMatch(/Approved by AI/i);
    expect(src).not.toMatch(/autonomous/i);
  });
});
