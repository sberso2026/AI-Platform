import { describe, expect, it } from "vitest";
import { PROFIT_CLASSIFICATION_VERSION } from "@rtb/types";
import { classifyProfit } from "./classification";
import { testFact } from "./test-facts";

describe("BOS-6 profitability classification", () => {
  it("classifies versioned bands from contribution evidence", () => {
    expect(classifyProfit(testFact({ dimensionName: "High", revenueMinor: "10000", directCostMinor: "7000" })).classification).toBe(
      "highly_profitable",
    );
    expect(classifyProfit(testFact({ dimensionName: "Ok", revenueMinor: "10000", directCostMinor: "8000" })).classification).toBe(
      "profitable",
    );
    expect(classifyProfit(testFact({ dimensionName: "Low", revenueMinor: "10000", directCostMinor: "9600" })).classification).toBe(
      "low_margin",
    );
    expect(classifyProfit(testFact({ dimensionName: "Even", revenueMinor: "10000", directCostMinor: "9900" })).classification).toBe(
      "break_even",
    );
    expect(
      classifyProfit(testFact({ dimensionName: "Loss", revenueMinor: "10000", directCostMinor: "12000" })).classification,
    ).toBe("negative_contribution");
  });

  it("returns unknown when cost is missing and does not use AI", () => {
    const result = classifyProfit(testFact({ dimensionName: "Unknown", revenueMinor: "25000000", directCostMinor: null }));
    expect(result.classification).toBe("unknown");
    expect(result.version).toBe(PROFIT_CLASSIFICATION_VERSION);
    expect(result.method).toBe("deterministic_profit_classification_v1");
    expect(result.disclaimer).not.toMatch(/ai|llm|model/i);
  });
});
