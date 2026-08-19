import { describe, expect, it } from "vitest";
import { computePaymentBehaviour, contributionFromFact } from "./payment";
import type { BusinessCustomerFinancialFact } from "@rtb/types";

function fact(partial: Partial<BusinessCustomerFinancialFact> & { id: string }): BusinessCustomerFinancialFact {
  return {
    tenantId: "t",
    workspaceId: "w",
    customerId: "c1",
    periodStart: "2026-07-01",
    periodEnd: "2026-09-30",
    revenueMinor: null,
    directCostMinor: null,
    grossContributionMinor: null,
    receivableOutstandingMinor: null,
    receivableOverdueMinor: null,
    ageingCurrentMinor: null,
    ageing130Minor: null,
    ageing3160Minor: null,
    ageing6190Minor: null,
    ageing90PlusMinor: null,
    currency: "AUD",
    scale: 2,
    sourceType: "demo",
    provenance: {},
    isDemo: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...partial,
  };
}

describe("BOS-5 payment behaviour", () => {
  it("keeps profitability unknown when revenue exists without cost", () => {
    const row = fact({ id: "harbour", revenueMinor: "25000000", receivableOutstandingMinor: "12000000", receivableOverdueMinor: "6000000" });
    expect(contributionFromFact(row)).toBeNull();
    expect(row.grossContributionMinor).toBeNull();
  });

  it("computes overdue ratio from exact minor units", () => {
    const behaviour = computePaymentBehaviour([
      fact({
        id: "northbound",
        receivableOutstandingMinor: "9000000",
        receivableOverdueMinor: "400000",
      }),
    ]);
    expect(behaviour.overdueRatioBps).toBe("444");
    expect(behaviour.outstanding?.minor).toBe("9000000");
    expect(behaviour.disclaimer).toMatch(/not a credit score/i);
  });

  it("computes average payment delay only when due and paid dates exist", () => {
    const withoutDates = computePaymentBehaviour([
      fact({ id: "no-dates", receivableOutstandingMinor: "100", receivableOverdueMinor: "0" }),
    ]);
    expect(withoutDates.averagePaymentDelayDays).toBeNull();
    expect(withoutDates.unknownReasons).toContain("payment_delay_requires_due_and_paid_dates");

    const withDates = computePaymentBehaviour([
      fact({
        id: "paid",
        dueDate: "2026-08-01",
        paidDate: "2026-08-10",
        receivableOutstandingMinor: "100",
        receivableOverdueMinor: "0",
      }),
    ]);
    expect(withDates.averagePaymentDelayDays).toBe(9);
  });

  it("returns unknown payment behaviour when no facts exist", () => {
    const behaviour = computePaymentBehaviour([]);
    expect(behaviour.outstanding).toBeNull();
    expect(behaviour.unknownReasons).toContain("no_financial_facts");
  });
});
