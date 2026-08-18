import { describe, expect, it } from "vitest";
import type { BusinessFinanceSnapshot } from "@rtb/types";
import { forecastCash } from "./forecast";

function snapshot(partial: Partial<BusinessFinanceSnapshot>): BusinessFinanceSnapshot {
  return {
    id: "snap",
    tenantId: "t",
    workspaceId: "w",
    periodId: "p",
    currency: "AUD",
    scale: 2,
    revenueMinor: "1000",
    costOfSalesMinor: "400",
    operatingExpensesMinor: "300",
    cashMinor: "5000",
    accountsReceivableMinor: null,
    accountsPayableMinor: null,
    budgetRevenueMinor: null,
    budgetExpensesMinor: null,
    budgetProfitMinor: null,
    sourceType: "demo",
    provenance: {},
    syncedAt: "2026-07-02T09:00:00.000Z",
    isDemo: true,
    createdAt: "2026-07-02T09:00:00.000Z",
    updatedAt: "2026-07-02T09:00:00.000Z",
    ...partial,
  };
}

describe("forecastCash", () => {
  it("returns unknown when cash is missing", () => {
    const result = forecastCash(snapshot({ cashMinor: null }), { periodStart: "2026-06-01", periodEnd: "2026-06-30" });
    expect(result.unknownReason).toBe("cash_unknown");
    expect(result.points).toEqual([]);
    expect(result.assumptions.length).toBeGreaterThan(0);
  });

  it("keeps observed cash and marks net movement unknown when inputs are incomplete", () => {
    const result = forecastCash(
      snapshot({ cashMinor: "5000", revenueMinor: null }),
      { periodStart: "2026-06-01", periodEnd: "2026-06-30" },
    );
    expect(result.unknownReason).toBe("net_movement_unknown");
    expect(result.points[0]?.kind).toBe("observed");
    expect(result.points[0]?.cash?.minor).toBe("5000");
  });

  it("projects integer cash using scaled net movement", () => {
    const result = forecastCash(snapshot({}), { periodStart: "2026-06-01", periodEnd: "2026-06-30" });
    expect(result.unknownReason).toBeUndefined();
    expect(result.points[0]?.kind).toBe("observed");
    expect(result.points[1]?.kind).toBe("forecast");
    expect(result.points[1]?.cash?.minor).toBe("5300");
  });
});
