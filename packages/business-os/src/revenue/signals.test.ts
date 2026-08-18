import { describe, expect, it } from "vitest";
import { detectRevenueSignals } from "./signals";
import type { BusinessGrowthOpportunity, BusinessRevenueProposal } from "@rtb/types";
import { evaluatePricing } from "./pricing";
import { applyPricingGuardrails, defaultGuardrails } from "./guardrails";

function opp(partial: Partial<BusinessGrowthOpportunity> & Pick<BusinessGrowthOpportunity, "name" | "stage">): BusinessGrowthOpportunity {
  return {
    id: partial.name,
    tenantId: "t",
    workspaceId: "w",
    estimatedValueMinor: "80000000",
    currency: "AUD",
    scale: 2,
    probabilityBps: null,
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
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...partial,
  };
}

function proposal(partial: Partial<BusinessRevenueProposal> & Pick<BusinessRevenueProposal, "title">): BusinessRevenueProposal {
  return {
    id: partial.title,
    tenantId: "t",
    workspaceId: "w",
    opportunityId: "o",
    proposalNumber: "P1",
    version: 1,
    status: "draft",
    proposedPriceMinor: "1",
    estimatedCostMinor: "1",
    currency: "AUD",
    scale: 2,
    targetMarginBps: null,
    sourceType: "demo",
    evidenceRefs: [],
    provenance: {},
    isDemo: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...partial,
  };
}

describe("BOS-4 revenue signals", () => {
  it("flags missing engagement, unresolved requirements, and pricing exceptions", () => {
    const detected = detectRevenueSignals({
      opportunities: [opp({ name: "Metro", stage: "proposal_ready", nextAction: null })],
      engagements: [],
      proposals: [proposal({ title: "Old draft" })],
      requirements: [
        {
          id: "r1",
          tenantId: "t",
          workspaceId: "w",
          proposalId: "Old draft",
          requirement: "Named certified diving supervisor.",
          mandatory: true,
          status: "open",
          complianceStatus: "unsatisfied",
          evidenceRefs: [],
          generatedBy: "deterministic_rule",
          sourceType: "demo",
          provenance: {},
          isDemo: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      evaluations: [
        applyPricingGuardrails(
          evaluatePricing({ revenueMinor: "100", estimatedDirectCostMinor: "160", currency: "AUD" }),
          defaultGuardrails("AUD"),
        ),
      ],
      bids: [
        {
          id: "b1",
          tenantId: "t",
          workspaceId: "w",
          opportunityId: "Metro",
          recommendation: "review",
          components: [],
          missingInputs: [],
          version: "bid_nobid.v1",
          sourceType: "derived",
          provenance: {},
          disclaimer: "advisory",
          isDemo: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      asOf: "2026-08-18",
    });
    expect(detected.signals.some((s) => s.ruleId === "revenue.missing_engagement_plan.v1")).toBe(true);
    expect(detected.signals.some((s) => s.ruleId === "revenue.unresolved_requirement.v1")).toBe(true);
    expect(detected.signals.some((s) => s.ruleId === "revenue.pricing_below_margin.v1")).toBe(true);
    expect(detected.signals.some((s) => s.ruleId === "revenue.bid_decision_pending.v1")).toBe(true);
    expect(detected.recommendations.some((r) => r.type === "revenue.prepare_engagement_plan")).toBe(true);
  });
});
