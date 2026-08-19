import { describe, expect, it } from "vitest";
import { PROFIT_DEMO_FACTS } from "./demo";
import { contributionFromComponents } from "./metrics";

describe("BOS-6 profit ingestion contract", () => {
  it("uses source_type + source_ref as the natural idempotency key", () => {
    const keys = PROFIT_DEMO_FACTS.map((row) => `${row.sourceType}|${row.sourceRef}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(PROFIT_DEMO_FACTS[0].sourceType).toBe("demo");
  });

  it("computes contribution server-side and ignores a client-supplied total", () => {
    const client = { ...PROFIT_DEMO_FACTS[0], contributionMinor: "1" };
    expect(contributionFromComponents(client.revenueMinor, client.directCostMinor)).toBe("-3500000");
    expect(contributionFromComponents(client.revenueMinor, client.directCostMinor)).not.toBe("1");
  });

  it("keeps money as integer minor-unit strings", () => {
    for (const fact of PROFIT_DEMO_FACTS) {
      if (fact.revenueMinor != null) expect(String(fact.revenueMinor)).toMatch(/^-?\d+$/);
      if (fact.directCostMinor != null) expect(String(fact.directCostMinor)).toMatch(/^-?\d+$/);
      if (fact.allocatedCostMinor != null) expect(String(fact.allocatedCostMinor)).toMatch(/^-?\d+$/);
    }
  });
});
