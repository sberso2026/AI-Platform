import { describe, it, expect } from "vitest";
import { reconcileGrowthCreditLedger } from "@rtb/platform-commerce";

describe("Gate C — Growth credit ledger reconciliation", () => {
  it("reconciles available balance from immutable transactions", () => {
    const summary = reconcileGrowthCreditLedger([
      { transaction_type: "earned", amount: 1000 },
      { transaction_type: "adjusted", amount: 50 },
      { transaction_type: "released", amount: 100 },
      { transaction_type: "redeemed", amount: 150 },
      { transaction_type: "reserved", amount: 200 },
      { transaction_type: "expired", amount: 25 },
      { transaction_type: "reversed", amount: 10 },
    ]);
    expect(summary.availableBalance).toBe(1000 + 50 + 100 - 150 - 200 - 25 - 10);
    expect(summary.reservedBalance).toBe(200);
    expect(summary.lifetimeEarned).toBe(1000);
    expect(summary.lifetimeRedeemed).toBe(150);
  });
});
