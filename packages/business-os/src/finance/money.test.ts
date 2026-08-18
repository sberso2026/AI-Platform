import { describe, expect, it } from "vitest";
import {
  add,
  CurrencyMismatchError,
  money,
  parseMinor,
  ratioBps,
  roundDiv,
  sub,
  toSafeNumber,
} from "./money";

describe("BOS-2 monetary arithmetic", () => {
  it("rejects floating-point and non-integer strings", () => {
    expect(() => parseMinor(1.5)).toThrow("monetary_value_not_integer");
    expect(() => parseMinor("12.00")).toThrow("monetary_value_not_integer");
    expect(parseMinor("38000000")).toBe(38_000_000n);
    expect(parseMinor(null)).toBeNull();
  });

  it("adds and subtracts in integer minor units", () => {
    const revenue = money("42000000", "AUD")!;
    const cos = money("25200000", "AUD")!;
    expect(sub(revenue, cos).minor).toBe(16_800_000n);
    expect(add(cos, money("100", "AUD")!).minor).toBe(25_200_100n);
  });

  it("refuses implicit cross-currency aggregation", () => {
    expect(() => add(money("1", "AUD")!, money("1", "USD")!)).toThrow(CurrencyMismatchError);
  });

  it("uses round-half-away-from-zero integer division", () => {
    expect(roundDiv(5n, 2n)).toBe(3n);
    expect(roundDiv(-5n, 2n)).toBe(-3n);
    expect(ratioBps(money("1", "AUD")!, money("4", "AUD")!)).toBe(2500n);
    expect(ratioBps(money("1", "AUD")!, money("0", "AUD")!)).toBeNull();
  });

  it("does not coerce large values through unsafe JS numbers", () => {
    const huge = 9_007_199_254_740_993n;
    expect(toSafeNumber(huge)).toBeNull();
    expect(toSafeNumber(38_000_000n)).toBe(38_000_000);
  });
});
