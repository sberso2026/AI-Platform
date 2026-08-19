import { describe, expect, it } from "vitest";
import { computeProfitConcentration, computeProfitCoverage, rankProfitFacts } from "./ranking";
import { testFact } from "./test-facts";

describe("BOS-6 profit ranking", () => {
  it("ranks contribution, margin, and revenue as distinct concepts", () => {
    const facts = [
      testFact({
        id: "grid",
        dimensionName: "Grid",
        revenueMinor: "200000000",
        directCostMinor: "192000000",
      }),
      testFact({
        id: "metro",
        dimensionName: "Metro",
        revenueMinor: "150000000",
        directCostMinor: "120000000",
      }),
      testFact({
        id: "north",
        dimensionName: "Northbound",
        revenueMinor: "80000000",
        directCostMinor: "62000000",
      }),
    ];
    expect(rankProfitFacts(facts, "revenue").map((row) => row.dimensionName)).toEqual([
      "Grid",
      "Metro",
      "Northbound",
    ]);
    expect(rankProfitFacts(facts, "contribution").map((row) => row.dimensionName)).toEqual([
      "Metro",
      "Northbound",
      "Grid",
    ]);
    expect(rankProfitFacts(facts, "margin").map((row) => row.dimensionName)).toEqual([
      "Northbound",
      "Metro",
      "Grid",
    ]);
  });

  it("does not rank mixed currencies as comparable", () => {
    const facts = [
      testFact({ id: "aud", dimensionName: "AU", revenueMinor: "100", directCostMinor: "40", currency: "AUD" }),
      testFact({ id: "usd", dimensionName: "US", revenueMinor: "5000000", directCostMinor: "10", currency: "USD" }),
    ];
    const ranked = rankProfitFacts(facts, "contribution");
    expect(ranked.every((row) => row.rankingUnknownReason === "currency_mismatch")).toBe(true);
    const concentration = computeProfitConcentration(facts);
    expect(concentration.totalContribution).toBeNull();
    expect(concentration.unknownReasons).toContain("currency_mismatch");
    const coverage = computeProfitCoverage(facts);
    expect(coverage.coverageBps).toBeNull();
    expect(coverage.unknownReasons).toContain("currency_mismatch");
  });

  it("reports 100% concentration when one dimension holds all known profit", () => {
    const facts = [
      testFact({
        id: "only",
        dimensionName: "Metro",
        revenueMinor: "150000000",
        directCostMinor: "120000000",
      }),
    ];
    const concentration = computeProfitConcentration(facts);
    expect(concentration.topShareBps).toBe("10000");
    expect(concentration.top5ShareBps).toBe("10000");
  });
});
