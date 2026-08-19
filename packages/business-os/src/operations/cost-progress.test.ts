import { describe, expect, it } from "vitest";
import type { BusinessWorkCostFact } from "@rtb/types";
import { computeCostProgress } from "./cost-progress";
import { work } from "./test-work";

function fact(partial: Partial<BusinessWorkCostFact> & { id: string }): BusinessWorkCostFact {
  return {
    tenantId: "t",
    workspaceId: "w",
    workId: "w1",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-31",
    costType: "labour",
    amountMinor: "0",
    currency: "AUD",
    scale: 2,
    valueState: "actual",
    sourceType: "demo",
    provenance: {},
    isDemo: true,
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

describe("BOS-7 cost vs progress", () => {
  it("raises a potential overrun when actual cost % of budget is materially ahead of progress", () => {
    const result = computeCostProgress({
      work: work({ budgetCostMinor: "1000000" }),
      facts: [fact({ id: "a", amountMinor: "800000", valueState: "actual" })],
      progressBps: "3500",
      thresholdBps: 1500,
    });
    expect(result.actualCostBpsOfBudget).toBe("8000");
    expect(result.progressBps).toBe("3500");
    expect(result.varianceBps).toBe("4500");
    expect(result.signal).toBe(true);
    expect(result.version).toBe("operations.cost_progress_variance.v1");
    expect(result.disclaimer).toMatch(/not a final overrun/i);
  });

  it("keeps actual, forecast, and budget distinct", () => {
    const result = computeCostProgress({
      work: work({ budgetCostMinor: "1000000" }),
      facts: [
        fact({ id: "actual", amountMinor: "200000", valueState: "actual" }),
        fact({ id: "forecast", amountMinor: "900000", valueState: "forecast" }),
        fact({ id: "budget", amountMinor: "1000000", valueState: "budget" }),
      ],
      progressBps: "5000",
    });
    expect(result.actualCostBpsOfBudget).toBe("2000");
    expect(result.signal).toBe(false);
  });

  it("stays unknown for zero budget, missing progress, missing cost, and mixed currency", () => {
    expect(
      computeCostProgress({
        work: work({ budgetCostMinor: "0" }),
        facts: [fact({ id: "a", amountMinor: "1", valueState: "actual" })],
        progressBps: "5000",
      }).unknownReasons,
    ).toContain("zero_budget");
    expect(
      computeCostProgress({
        work: work({ budgetCostMinor: "1000" }),
        facts: [fact({ id: "a", amountMinor: "1", valueState: "actual" })],
        progressBps: null,
      }).unknownReasons,
    ).toContain("progress_unknown");
    expect(
      computeCostProgress({
        work: work({ budgetCostMinor: "1000" }),
        facts: [],
        progressBps: "5000",
      }).unknownReasons,
    ).toContain("actual_cost_unknown");
    expect(
      computeCostProgress({
        work: work({ budgetCostMinor: "1000" }),
        facts: [
          fact({ id: "aud", amountMinor: "100", currency: "AUD" }),
          fact({ id: "usd", amountMinor: "100", currency: "USD" }),
        ],
        progressBps: "5000",
      }).unknownReasons,
    ).toContain("mixed_currency_actual_cost");
  });
});
