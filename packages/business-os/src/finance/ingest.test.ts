import { describe, expect, it } from "vitest";
import { FINANCE_DEMO_PERIODS } from "./demo";

describe("BOS-2 finance ingestion contract", () => {
  it("uses integer minor strings and a natural period key for idempotency", () => {
    const keys = FINANCE_DEMO_PERIODS.map(
      (p) => `${p.periodStart}|${p.periodEnd}|${p.currency}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
    for (const period of FINANCE_DEMO_PERIODS) {
      expect(period.sourceType).toBe("demo");
      expect(period.isDemo).toBe(true);
      expect(period.provenance).toMatchObject({ live: false });
      expect(String(period.revenueMinor)).toMatch(/^-?\d+$/);
    }
  });

  it("marks duplicate ingestion of the same period key as the same natural identity", () => {
    const first = FINANCE_DEMO_PERIODS[1];
    const duplicate = { ...first, cashMinor: "1" };
    const key = (p: typeof first) => `${p.periodStart}|${p.periodEnd}|${p.currency}`;
    expect(key(duplicate)).toBe(key(first));
  });
});
