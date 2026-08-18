import { describe, expect, it } from "vitest";
import { evaluateBidNoBid } from "./bid";

describe("BOS-4 bid/no-bid intelligence", () => {
  it("returns insufficient evidence when most fields are missing", () => {
    const result = evaluateBidNoBid({});
    expect(result.recommendation).toBe("insufficient_evidence");
    expect(result.disclaimer).toMatch(/not a statistical win probability/i);
    expect(result.version).toBe("bid_nobid.v1");
  });

  it("recommends pursue from strong supplied evidence without claiming win probability", () => {
    const result = evaluateBidNoBid({
      strategicFit: "high",
      opportunityScore: 80,
      estimatedValueMinor: "150000000",
      expectedMarginBps: "2800",
      deliveryCapability: "high",
      expectedCloseDate: "2026-09-30",
      relationshipStrength: "high",
      proposalEffort: "low",
      evidenceQuality: "high",
      commercialRisk: "low",
      asOf: "2026-08-18T00:00:00.000Z",
    });
    expect(result.recommendation).toBe("pursue");
    expect(result.total).toBeGreaterThanOrEqual(70);
    expect(result.disclaimer).not.toMatch(/win probability is/i);
  });

  it("recommends do_not_pursue for weak evidence that is still complete enough", () => {
    const result = evaluateBidNoBid({
      strategicFit: "low",
      opportunityScore: 10,
      estimatedValueMinor: "0",
      expectedMarginBps: "0",
      deliveryCapability: "low",
      expectedCloseDate: "2025-01-01",
      relationshipStrength: "low",
      proposalEffort: "high",
      evidenceQuality: "low",
      commercialRisk: "high",
      asOf: "2026-08-18T00:00:00.000Z",
    });
    expect(result.recommendation).toBe("do_not_pursue");
  });
});
