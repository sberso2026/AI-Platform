import { describe, expect, it } from "vitest";
import { computeFactMetrics, contributionFromComponents, profitAfterAllocatedFromComponents } from "./metrics";
import { testFact } from "./test-facts";

describe("BOS-6 profit metrics", () => {
  it("computes contribution as revenue minus direct cost in integer minor units", () => {
    const metrics = computeFactMetrics(
      testFact({ dimensionName: "Known", revenueMinor: "80000000", directCostMinor: "62000000" }),
    );
    expect(metrics.contribution?.minor).toBe("18000000");
    expect(metrics.contributionMarginBps).toBe("2250");
    expect(metrics.profitAfterAllocated).toBeNull();
    expect(metrics.unknownReasons).toContain("fully_allocated_profit_unknown");
    expect(metrics.attributionMethod).toBe("source_direct");
  });

  it("leaves contribution unknown when revenue exists without direct cost", () => {
    const metrics = computeFactMetrics(
      testFact({ dimensionName: "Harbour", revenueMinor: "25000000", directCostMinor: null }),
    );
    expect(metrics.revenue?.minor).toBe("25000000");
    expect(metrics.contribution).toBeNull();
    expect(metrics.contributionMarginBps).toBeNull();
    expect(metrics.unknownReasons).toContain("contribution_unknown_missing_direct_cost");
  });

  it("does not invent allocated cost", () => {
    const metrics = computeFactMetrics(
      testFact({
        dimensionName: "Allocated missing",
        revenueMinor: "100",
        directCostMinor: "40",
        allocatedCostMinor: null,
      }),
    );
    expect(metrics.allocatedCost).toBeNull();
    expect(metrics.profitAfterAllocated).toBeNull();
    expect(profitAfterAllocatedFromComponents("60", null)).toBeNull();
  });

  it("uses explicitly sourced allocated cost only", () => {
    const metrics = computeFactMetrics(
      testFact({
        dimensionName: "AU segment",
        revenueMinor: "255000000",
        directCostMinor: "204000000",
        allocatedCostMinor: "8000000",
      }),
    );
    expect(metrics.contribution?.minor).toBe("51000000");
    expect(metrics.profitAfterAllocated?.minor).toBe("43000000");
  });

  it("treats zero revenue as known contribution with unknown margin", () => {
    const metrics = computeFactMetrics(
      testFact({ dimensionName: "Zero revenue", revenueMinor: "0", directCostMinor: "1500000" }),
    );
    expect(metrics.contribution?.minor).toBe("-1500000");
    expect(metrics.contributionMarginBps).toBeNull();
    expect(metrics.unknownReasons).toContain("contribution_margin_undefined_zero_revenue");
  });

  it("supports negative contribution and refund revenue", () => {
    const negative = computeFactMetrics(
      testFact({ dimensionName: "Rework", revenueMinor: "1000000", directCostMinor: "4500000" }),
    );
    expect(negative.contribution?.minor).toBe("-3500000");
    const refund = computeFactMetrics(
      testFact({ dimensionName: "Refund", revenueMinor: "-2000000", directCostMinor: "0" }),
    );
    expect(refund.contribution?.minor).toBe("-2000000");
  });

  it("computes contribution from known components without trusting a client total", () => {
    expect(contributionFromComponents("100", "40")).toBe("60");
    expect(contributionFromComponents("100", null)).toBeNull();
    expect(contributionFromComponents(null, "40")).toBeNull();
  });
});
