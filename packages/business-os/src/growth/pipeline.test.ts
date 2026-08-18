import { describe, expect, it } from "vitest";
import type { BusinessGrowthOpportunity } from "@rtb/types";
import { computePipelineMetrics, qualificationRateBps } from "./pipeline";

function opp(partial: Partial<BusinessGrowthOpportunity> & Pick<BusinessGrowthOpportunity, "name" | "stage">): BusinessGrowthOpportunity {
  return {
    id: partial.name,
    tenantId: "t",
    workspaceId: "w",
    estimatedValueMinor: "100",
    currency: "AUD",
    scale: 2,
    probabilityBps: null,
    expectedCloseDate: null,
    expectedMarginBps: null,
    sourceType: "demo",
    score: null,
    scoreVersion: "opportunity_score.v1",
    scoreDetail: {
      total: null,
      components: [],
      missingInputs: [],
      version: "opportunity_score.v1",
      method: "deterministic_opportunity_score_v1",
      disclaimer: "",
    },
    provenance: {},
    suppressed: false,
    isDemo: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...partial,
  };
}

describe("computePipelineMetrics", () => {
  it("returns unknown totals for zero opportunities", () => {
    const metrics = computePipelineMetrics([]);
    expect(metrics.openCount).toBe(0);
    expect(metrics.totalPipeline).toBeNull();
    expect(metrics.unknownReasons).toContain("zero_opportunities");
  });

  it("excludes lost opportunities and keeps missing probability unknown for weighted pipeline", () => {
    const metrics = computePipelineMetrics([
      opp({ name: "open", stage: "qualified", estimatedValueMinor: "1000", probabilityBps: "5000" }),
      opp({ name: "lost", stage: "lost", estimatedValueMinor: "9000", probabilityBps: "8000" }),
      opp({ name: "no-prob", stage: "discovery", estimatedValueMinor: "1000" }),
    ]);
    expect(metrics.totalPipeline?.minor).toBe("2000");
    expect(metrics.weightedPipeline?.minor).toBe("500");
    expect(metrics.lostCount).toBe(1);
    expect(metrics.unknownReasons).toContain("weighted_pipeline_excludes_opportunities_without_probability");
  });

  it("does not invent coverage or win rate", () => {
    const noTarget = computePipelineMetrics([opp({ name: "a", stage: "qualified", estimatedValueMinor: "100" })]);
    expect(noTarget.pipelineCoverageBps).toBeNull();
    expect(noTarget.winRateBps).toBeNull();
    const covered = computePipelineMetrics(
      [opp({ name: "a", stage: "qualified", estimatedValueMinor: "80" })],
      { revenueTargetMinor: "100", currency: "AUD", scale: 2 },
    );
    expect(covered.pipelineCoverageBps).toBe("8000");
  });

  it("refuses implicit cross-currency aggregation", () => {
    const metrics = computePipelineMetrics([
      opp({ name: "aud", stage: "qualified", currency: "AUD", estimatedValueMinor: "100" }),
      opp({ name: "usd", stage: "qualified", currency: "USD", estimatedValueMinor: "100" }),
    ]);
    expect(metrics.totalPipeline).toBeNull();
    expect(metrics.unknownReasons).toContain("currency_mismatch");
  });

  it("requires a sufficient closed sample for win rate", () => {
    const small = computePipelineMetrics([
      opp({ name: "w", stage: "won" }),
      opp({ name: "l", stage: "lost" }),
    ]);
    expect(small.winRateBps).toBeNull();
    const enough = computePipelineMetrics([
      opp({ name: "w1", stage: "won" }),
      opp({ name: "w2", stage: "won" }),
      opp({ name: "l1", stage: "lost" }),
    ]);
    expect(enough.winRateBps).toBe("6667");
  });
});

describe("qualificationRateBps", () => {
  it("returns unknown for zero leads", () => {
    expect(qualificationRateBps(0, 0)).toBeNull();
    expect(qualificationRateBps(1, 4)).toBe("2500");
  });
});
