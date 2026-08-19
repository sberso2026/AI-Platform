import { describe, expect, it } from "vitest";
import { compareOptions } from "./comparison";
import type { BusinessDecisionImpact, BusinessDecisionOption } from "@rtb/types";
import { OPTION_COMPARISON_VERSION } from "@rtb/types";

function option(partial: Partial<BusinessDecisionOption> & { id: string; title: string }): BusinessDecisionOption {
  return {
    tenantId: "t",
    workspaceId: "w",
    decisionId: "d1",
    status: "candidate",
    assumptions: [],
    constraints: [],
    reversibility: "unknown",
    generatedBy: "user",
    aiGenerated: false,
    sourceType: "demo",
    provenance: {},
    isDemo: true,
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

function impact(partial: Partial<BusinessDecisionImpact> & { optionId: string; dimension: BusinessDecisionImpact["dimension"] }): BusinessDecisionImpact {
  return {
    id: `${partial.optionId}-${partial.dimension}`,
    tenantId: "t",
    workspaceId: "w",
    quantification: "unknown",
    qualitativeOnly: false,
    provenance: {},
    isDemo: true,
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

describe("BOS-8 option comparison", () => {
  it("compares side-by-side without a false universal score by default", () => {
    const comparison = compareOptions({
      options: [
        option({ id: "a", title: "Hold", status: "preferred", expectedBenefits: "Preserve cash", reversibility: "reversible" }),
        option({ id: "b", title: "Continue", expectedRisks: "Runway compression", aiGenerated: false }),
      ],
      impacts: [
        impact({ optionId: "a", dimension: "financial", quantification: "quantitative", valueMinor: "2500000", currency: "AUD" }),
        impact({ optionId: "a", dimension: "operational", quantification: "unknown" }),
        impact({ optionId: "b", dimension: "financial", quantification: "quantitative", valueMinor: "-1800000", currency: "AUD" }),
      ],
    });
    expect(comparison.version).toBe(OPTION_COMPARISON_VERSION);
    expect(comparison.scoringEnabled).toBe(false);
    expect(comparison.ranking).toBeNull();
    expect(comparison.objectiveTruth).toBe(false);
    expect(comparison.recommendationText).toContain("strongest supported evidence");
    expect(comparison.recommendationText).not.toMatch(/guaranteed/i);
    expect(comparison.options[0]?.unknownImpacts).toEqual(expect.arrayContaining(["operational", "customer"]));
  });

  it("exposes configured ranking as inspectable and not objective truth", () => {
    const comparison = compareOptions({
      options: [option({ id: "a", title: "A" }), option({ id: "b", title: "B" })],
      impacts: [impact({ optionId: "a", dimension: "financial", quantification: "quantitative", valueMinor: "1" })],
      scoringEnabled: true,
    });
    expect(comparison.scoringEnabled).toBe(true);
    expect(comparison.rankingVersion).toBe("option_ranking.v1");
    expect(comparison.scoringDisclaimer).toMatch(/not objective truth/i);
    expect(comparison.objectiveTruth).toBe(false);
  });

  it("labels conflicting and AI-generated options without selecting them as truth", () => {
    const comparison = compareOptions({
      options: [
        option({ id: "a", title: "A", status: "candidate" }),
        option({
          id: "b",
          title: "AI termination",
          aiGenerated: true,
          generatedBy: "platform_ai_director",
          status: "rejected",
          reversibility: "irreversible",
        }),
      ],
      impacts: [],
    });
    const ai = comparison.options.find((row) => row.optionId === "b");
    expect(ai?.disadvantages.join(" ")).toMatch(/AI-generated/i);
    expect(ai?.requiredApprovals).toContain("human_decision_approval");
  });
});
