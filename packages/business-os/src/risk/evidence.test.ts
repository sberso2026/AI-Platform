import { describe, expect, it } from "vitest";
import { financialExposure } from "./exposure";

describe("BOS-9 cross-domain evidence reuse", () => {
  it("stores domain snapshots as refs and keeps unknown exposure unknown", () => {
    const missing = financialExposure([{ currency: "AUD" }]);
    expect(missing.known).toBe(false);
    expect(missing.reason).toBe("missing_financial_exposure");
    const known = financialExposure([
      { amountMinor: "15000000", currency: "AUD" },
      { amountMinor: "2000000", currency: "AUD" },
    ]);
    expect(known.known).toBe(true);
    expect(known.high).toBe(true);
    expect(known.currency).toBe("AUD");
    expect(known.amountMinor).toBe("17000000");
  });
});
