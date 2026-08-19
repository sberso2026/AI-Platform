import { describe, expect, it } from "vitest";
import { CUSTOMER_DEMO_FACTS } from "../customers/demo";
import { computeFactMetrics } from "./metrics";
import { testFact } from "./test-facts";

describe("BOS-6 customer profitability", () => {
  it("reuses BOS-5 customer financial facts and leaves missing cost unknown", () => {
    const harbour = CUSTOMER_DEMO_FACTS.find((row) => row.sourceRef === "bos-5-demo-fact-harbour");
    const metro = CUSTOMER_DEMO_FACTS.find((row) => row.sourceRef === "bos-5-demo-fact-metro");
    expect(harbour?.directCostMinor).toBeUndefined();
    const harbourMetrics = computeFactMetrics(
      testFact({
        dimensionName: "Harbour Inspection Co",
        attributionMethod: "customer_fact",
        revenueMinor: harbour?.revenueMinor != null ? String(harbour.revenueMinor) : null,
        directCostMinor: harbour?.directCostMinor != null ? String(harbour.directCostMinor) : null,
      }),
    );
    expect(harbourMetrics.contribution).toBeNull();
    expect(harbourMetrics.unknownReasons).toContain("contribution_unknown_missing_direct_cost");

    const metroMetrics = computeFactMetrics(
      testFact({
        dimensionName: "Metro Interchange Authority",
        attributionMethod: "customer_fact",
        revenueMinor: metro?.revenueMinor != null ? String(metro.revenueMinor) : null,
        directCostMinor: metro?.directCostMinor != null ? String(metro.directCostMinor) : null,
      }),
    );
    expect(metroMetrics.contribution?.minor).toBe("30000000");
  });

  it("does not mix payment delay into contribution", () => {
    const metrics = computeFactMetrics(
      testFact({
        dimensionName: "Harbour",
        revenueMinor: "25000000",
        directCostMinor: null,
        provenance: { overdueReceivableMinor: "6000000" },
      }),
    );
    expect(metrics.contribution).toBeNull();
    expect(JSON.stringify(metrics)).not.toMatch(/overdue/);
  });
});
