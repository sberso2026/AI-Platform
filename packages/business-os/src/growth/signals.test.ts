import { describe, expect, it } from "vitest";
import type { BusinessGrowthLead, BusinessGrowthOpportunity } from "@rtb/types";
import { computePipelineMetrics } from "./pipeline";
import { detectGrowthSignals } from "./signals";

function lead(partial: Partial<BusinessGrowthLead> & { organisationName: string }): BusinessGrowthLead {
  return {
    id: partial.organisationName,
    tenantId: "t",
    workspaceId: "w",
    sourceType: "demo",
    provenance: {},
    enrichment: {},
    enrichmentStatus: "none",
    qualificationStatus: "unqualified",
    score: 10,
    scoreVersion: "lead_score.v1",
    scoreDetail: { total: 10, components: [], missingInputs: [], version: "lead_score.v1", method: "deterministic_lead_score_v1" },
    suppressed: false,
    isDemo: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...partial,
  };
}

function opp(partial: Partial<BusinessGrowthOpportunity> & { name: string }): BusinessGrowthOpportunity {
  return {
    id: partial.name,
    tenantId: "t",
    workspaceId: "w",
    stage: "qualified",
    estimatedValueMinor: "1000",
    currency: "AUD",
    scale: 2,
    probabilityBps: "4000",
    expectedCloseDate: null,
    expectedMarginBps: null,
    sourceType: "demo",
    score: 40,
    scoreVersion: "opportunity_score.v1",
    scoreDetail: {
      total: 40,
      components: [],
      missingInputs: [],
      version: "opportunity_score.v1",
      method: "deterministic_opportunity_score_v1",
      disclaimer: "",
    },
    provenance: {},
    suppressed: false,
    isDemo: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("detectGrowthSignals", () => {
  it("emits high-value without next action and does not claim win rate on a small sample", () => {
    const opportunities = [
      opp({ name: "Metro", estimatedValueMinor: "150000000", nextAction: null, stage: "proposal_ready" }),
      opp({ name: "Won", stage: "won", estimatedValueMinor: "100" }),
      opp({ name: "Lost", stage: "lost", estimatedValueMinor: "100" }),
    ];
    const pipeline = computePipelineMetrics(opportunities, {
      revenueTargetMinor: "200000000",
      currency: "AUD",
      scale: 2,
    });
    const { signals, recommendations } = detectGrowthSignals({
      leads: [lead({ organisationName: "A" })],
      opportunities,
      pipeline,
      asOf: "2026-08-18T00:00:00.000Z",
    });
    expect(signals.some((s) => s.ruleId === "growth.high_value_without_next_action.v1")).toBe(true);
    expect(signals.every((s) => s.evidence.length > 0 && s.ruleId)).toBe(true);
    expect(signals.some((s) => s.ruleId === "growth.declining_win_rate.v1")).toBe(false);
    expect(recommendations.length).toBeGreaterThan(0);
  });
});
