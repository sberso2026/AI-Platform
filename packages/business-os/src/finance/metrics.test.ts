import { describe, expect, it } from "vitest";
import type { BusinessFinanceReceivableSnapshot, BusinessFinanceSnapshot } from "@rtb/types";
import { computeFinanceMetrics, revenueGrowthBps } from "./metrics";
import { detectFinanceSignals } from "./signals";

function snapshot(partial: Partial<BusinessFinanceSnapshot> & Pick<BusinessFinanceSnapshot, "revenueMinor">): BusinessFinanceSnapshot {
  return {
    id: "snap",
    tenantId: "t",
    workspaceId: "w",
    periodId: "p",
    currency: "AUD",
    scale: 2,
    costOfSalesMinor: "0",
    operatingExpensesMinor: "0",
    cashMinor: null,
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

const period = { periodStart: "2026-06-01", periodEnd: "2026-06-30" };

describe("computeFinanceMetrics", () => {
  it("computes profit and margin deterministically", () => {
    const metrics = computeFinanceMetrics(
      snapshot({ revenueMinor: "38000000", costOfSalesMinor: "34808000", operatingExpensesMinor: "14000000" }),
      null,
      period,
    );
    expect(metrics.grossProfit?.minor).toBe("3192000");
    expect(metrics.grossMarginBps).toBe("840");
    expect(metrics.operatingProfit?.minor).toBe("-10808000");
  });

  it("returns unknown margins when revenue is zero", () => {
    const metrics = computeFinanceMetrics(
      snapshot({ revenueMinor: "0", costOfSalesMinor: "100", operatingExpensesMinor: "50" }),
      null,
      period,
    );
    expect(metrics.grossProfit?.minor).toBe("-100");
    expect(metrics.grossMarginBps).toBeNull();
    expect(metrics.unknownReasons).toContain("gross_margin_undefined_zero_revenue");
  });

  it("keeps missing values unknown and supports negatives", () => {
    const metrics = computeFinanceMetrics(
      snapshot({ revenueMinor: "-1000", costOfSalesMinor: null, cashMinor: "5" }),
      null,
      period,
    );
    expect(metrics.grossProfit).toBeNull();
    expect(metrics.cashRunwayMonthHundredths).toBeNull();
    expect(metrics.unknownReasons.length).toBeGreaterThan(0);
  });

  it("computes budget variance percent only when the budget denominator is valid", () => {
    const ok = computeFinanceMetrics(
      snapshot({ revenueMinor: "80", budgetRevenueMinor: "100", costOfSalesMinor: "0", operatingExpensesMinor: "0" }),
      null,
      period,
    );
    expect(ok.budgetRevenueVariance?.minor).toBe("-20");
    expect(ok.budgetRevenueVarianceBps).toBe("-2000");
    const zeroBudget = computeFinanceMetrics(
      snapshot({ revenueMinor: "80", budgetRevenueMinor: "0", costOfSalesMinor: "0", operatingExpensesMinor: "0" }),
      null,
      period,
    );
    expect(zeroBudget.budgetRevenueVarianceBps).toBeNull();
  });

  it("computes receivables ageing and 100% overdue", () => {
    const recv: BusinessFinanceReceivableSnapshot = {
      id: "r",
      tenantId: "t",
      workspaceId: "w",
      periodId: "p",
      currency: "AUD",
      scale: 2,
      outstandingMinor: "1000",
      overdueMinor: "1000",
      ageingCurrentMinor: "0",
      ageing130Minor: "200",
      ageing3160Minor: "200",
      ageing6190Minor: "200",
      ageing90PlusMinor: "400",
      sourceType: "demo",
      provenance: {},
      syncedAt: "2026-07-02T09:00:00.000Z",
      isDemo: true,
      createdAt: "2026-07-02T09:00:00.000Z",
      updatedAt: "2026-07-02T09:00:00.000Z",
    };
    const metrics = computeFinanceMetrics(snapshot({ revenueMinor: "1" }), recv, period);
    expect(metrics.receivablesOverdueBps).toBe("10000");
    expect(metrics.ageing.days90Plus?.minor).toBe("400");
  });

  it("treats no receivables as unknown overdue percentage", () => {
    const metrics = computeFinanceMetrics(snapshot({ revenueMinor: "1" }), null, period);
    expect(metrics.receivablesOutstanding).toBeNull();
    expect(metrics.receivablesOverdueBps).toBeNull();
  });

  it("computes cash runway in month-hundredths from period operating expenses", () => {
    const metrics = computeFinanceMetrics(
      snapshot({
        revenueMinor: "1",
        cashMinor: "9000",
        operatingExpensesMinor: "3000",
        costOfSalesMinor: "0",
      }),
      null,
      period,
    );
    expect(metrics.cashRunwayMonthHundredths).toBe("300");
  });

  it("does not fabricate cash runway without a positive burn basis", () => {
    const none = computeFinanceMetrics(snapshot({ revenueMinor: "1", cashMinor: "100", operatingExpensesMinor: null }), null, period);
    expect(none.cashRunwayMonthHundredths).toBeNull();
    const zeroBurn = computeFinanceMetrics(
      snapshot({ revenueMinor: "1", cashMinor: "100", operatingExpensesMinor: "0", costOfSalesMinor: "0" }),
      null,
      period,
    );
    expect(zeroBurn.cashRunwayMonthHundredths).toBeNull();
  });
});

describe("revenueGrowthBps", () => {
  it("returns unknown on currency mismatch", () => {
    const current = snapshot({ revenueMinor: "100", currency: "AUD" });
    const previous = snapshot({ revenueMinor: "80", currency: "USD", id: "prev" });
    expect(revenueGrowthBps(current, previous)).toBeNull();
  });
});

describe("detectFinanceSignals", () => {
  it("emits overdue and margin rules with evidence and rule ids", () => {
    const current = snapshot({
      revenueMinor: "38000000",
      costOfSalesMinor: "34808000",
      operatingExpensesMinor: "14000000",
      cashMinor: "9500000",
      budgetRevenueMinor: "43000000",
    });
    const previous = snapshot({
      id: "prev",
      revenueMinor: "42000000",
      costOfSalesMinor: "25200000",
      operatingExpensesMinor: "12600000",
      cashMinor: "18000000",
      budgetRevenueMinor: "40000000",
    });
    const recv: BusinessFinanceReceivableSnapshot = {
      id: "r",
      tenantId: "t",
      workspaceId: "w",
      periodId: "p",
      currency: "AUD",
      scale: 2,
      outstandingMinor: "12000000",
      overdueMinor: "8500000",
      ageingCurrentMinor: "3500000",
      ageing130Minor: "1500000",
      ageing3160Minor: "2500000",
      ageing6190Minor: "2500000",
      ageing90PlusMinor: "2000000",
      sourceType: "demo",
      provenance: {},
      syncedAt: "2026-07-02T09:00:00.000Z",
      isDemo: true,
      createdAt: "2026-07-02T09:00:00.000Z",
      updatedAt: "2026-07-02T09:00:00.000Z",
    };
    const metrics = computeFinanceMetrics(current, recv, period);
    const previousMetrics = computeFinanceMetrics(previous, null, { periodStart: "2026-05-01", periodEnd: "2026-05-31" });
    const { signals, recommendations } = detectFinanceSignals({ current, previous, metrics, previousMetrics });
    expect(signals.some((s) => s.ruleId === "finance.overdue_receivables_above_threshold.v1")).toBe(true);
    expect(signals.some((s) => s.ruleId === "finance.gross_margin_below_target.v1")).toBe(true);
    expect(signals.every((s) => s.evidence.length > 0)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
  });
});
