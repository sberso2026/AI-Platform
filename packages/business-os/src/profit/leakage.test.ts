import { describe, expect, it } from "vitest";
import { detectProfitLeakage } from "./leakage";
import { computeProfitConcentration } from "./ranking";
import { testFact } from "./test-facts";

describe("BOS-6 profit leakage", () => {
  it("detects negative contribution, high-revenue low-margin, and missing cost", () => {
    const facts = [
      testFact({ id: "neg", dimensionName: "Rework", revenueMinor: "1000000", directCostMinor: "4500000" }),
      testFact({
        id: "low",
        dimensionName: "Grid",
        revenueMinor: "200000000",
        directCostMinor: "192000000",
      }),
      testFact({
        id: "missing",
        dimensionName: "Harbour",
        revenueMinor: "25000000",
        directCostMinor: null,
      }),
    ];
    const detected = detectProfitLeakage({ facts, concentration: computeProfitConcentration(facts) });
    const ids = detected.signals.map((row) => row.ruleId);
    expect(ids).toContain("profit.negative_contribution.v1");
    expect(ids).toContain("profit.low_margin_high_revenue.v1");
    expect(ids).toContain("profit.missing_cost_attribution.v1");
    expect(detected.signals.every((row) => row.evidence.length > 0)).toBe(true);
  });

  it("detects margin deterioration across comparable periods", () => {
    const facts = [
      testFact({
        id: "q4",
        dimensionName: "Northbound",
        dimensionRef: "northbound",
        periodStart: "2026-04-01",
        periodEnd: "2026-06-30",
        revenueMinor: "70000000",
        directCostMinor: "52000000",
      }),
      testFact({
        id: "q1",
        dimensionName: "Northbound",
        dimensionRef: "northbound",
        periodStart: "2026-07-01",
        periodEnd: "2026-09-30",
        revenueMinor: "80000000",
        directCostMinor: "62000000",
      }),
    ];
    const detected = detectProfitLeakage({ facts, concentration: computeProfitConcentration(facts) });
    expect(detected.signals.some((row) => row.ruleId === "profit.margin_deterioration.v1")).toBe(true);
  });

  it("does not treat overdue receivables as profit leakage", () => {
    const facts = [
      testFact({
        dimensionName: "Harbour",
        revenueMinor: "25000000",
        directCostMinor: "10000000",
        provenance: { overdueReceivableMinor: "6000000" },
      }),
    ];
    const detected = detectProfitLeakage({ facts, concentration: computeProfitConcentration(facts) });
    expect(detected.signals.some((row) => /overdue|receivable|ar_/i.test(row.ruleId))).toBe(false);
    expect(detected.signals.some((row) => /overdue|receivable/i.test(row.title))).toBe(false);
  });

  it("keeps proposed margin leakage distinct from realized profit", () => {
    const facts = [
      testFact({
        id: "proposed",
        dimensionType: "opportunity",
        dimensionName: "Discounted proposal",
        revenueMinor: "68000000",
        directCostMinor: "62000000",
        valueState: "proposed",
        provenance: { targetMarginBps: "2200", discountBps: "1500", notRealized: true },
      }),
    ];
    const detected = detectProfitLeakage({ facts, concentration: computeProfitConcentration(facts) });
    const proposed = detected.signals.filter((row) => row.ruleId.includes("proposed") || row.ruleId.includes("discount"));
    expect(proposed.length).toBeGreaterThan(0);
    expect(proposed.every((row) => row.provenance.valueState === "proposed")).toBe(true);
    expect(detected.signals.some((row) => row.ruleId === "profit.negative_contribution.v1")).toBe(false);
  });
});
