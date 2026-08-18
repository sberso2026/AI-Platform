import { describe, expect, it } from "vitest";
import { scoreOpportunity } from "./opportunity-score";

describe("scoreOpportunity", () => {
  it("does not treat score as a win probability and leaves missing margin unknown", () => {
    const score = scoreOpportunity({
      estimatedValueMinor: "80000000",
      strategicFit: "high",
      expectedCloseDate: "2026-09-30",
      relationshipStrength: "medium",
      deliveryCapability: "high",
      commercialRisk: "low",
      nextAction: "Review",
      description: "Bridge",
      asOf: "2026-08-18T00:00:00.000Z",
    });
    expect(score.version).toBe("opportunity_score.v1");
    expect(score.disclaimer).toMatch(/not a statistical win probability/i);
    expect(score.components.find((c) => c.id === "expected_margin")?.score).toBeNull();
    expect(score.missingInputs).toContain("expected_margin");
    expect(score.total).not.toBeNull();
  });

  it("scores zero-value opportunities without fabricating probability", () => {
    const score = scoreOpportunity({ estimatedValueMinor: "0" });
    expect(score.components.find((c) => c.id === "estimated_value")?.score).toBe(0);
  });
});
