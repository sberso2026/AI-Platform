import { describe, expect, it } from "vitest";
import { isRealizedState } from "./metrics";
import { computeFactMetrics } from "./metrics";
import { detectProfitLeakage } from "./leakage";
import { computeProfitConcentration, realizedFacts } from "./ranking";
import { testFact } from "./test-facts";

describe("BOS-6 proposed vs realized semantics", () => {
  it("keeps proposed opportunity margin out of realized contribution", () => {
    const proposed = testFact({
      id: "proposed",
      dimensionType: "opportunity",
      dimensionName: "Northbound",
      dimensionRef: "opp-northbound",
      revenueMinor: "80000000",
      directCostMinor: "58000000",
      valueState: "proposed",
    });
    const realized = testFact({
      id: "realized",
      dimensionType: "opportunity",
      dimensionName: "Northbound",
      dimensionRef: "opp-northbound",
      revenueMinor: "80000000",
      directCostMinor: "62000000",
      valueState: "actual",
    });
    expect(isRealizedState(proposed.valueState)).toBe(false);
    expect(isRealizedState(realized.valueState)).toBe(true);
    expect(realizedFacts([proposed, realized])).toHaveLength(1);
    expect(computeFactMetrics(proposed).contributionMarginBps).toBe("2750");
    expect(computeFactMetrics(realized).contributionMarginBps).toBe("2250");
    const detected = detectProfitLeakage({
      facts: [proposed, realized],
      concentration: computeProfitConcentration([proposed, realized]),
    });
    expect(detected.signals.some((row) => row.ruleId === "profit.proposed_vs_realized_divergence.v1")).toBe(true);
  });
});
