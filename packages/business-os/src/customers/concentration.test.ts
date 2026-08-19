import { describe, expect, it } from "vitest";
import { computeConcentration } from "./concentration";
import type { BusinessCustomer, BusinessCustomerFinancialFact } from "@rtb/types";

function customer(partial: Partial<BusinessCustomer> & { id: string; organisationName: string }): BusinessCustomer {
  return {
    tenantId: "t",
    workspaceId: "w",
    externalIds: {},
    customerStatus: "active",
    sourceType: "demo",
    provenance: {},
    isDemo: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...partial,
  };
}

function fact(
  partial: Partial<BusinessCustomerFinancialFact> & { id: string; customerId: string; revenueMinor: string; currency: string },
): BusinessCustomerFinancialFact {
  return {
    tenantId: "t",
    workspaceId: "w",
    periodStart: "2026-07-01",
    periodEnd: "2026-09-30",
    directCostMinor: null,
    grossContributionMinor: null,
    receivableOutstandingMinor: null,
    receivableOverdueMinor: null,
    ageingCurrentMinor: null,
    ageing130Minor: null,
    ageing3160Minor: null,
    ageing6190Minor: null,
    ageing90PlusMinor: null,
    scale: 2,
    sourceType: "demo",
    provenance: {},
    isDemo: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...partial,
  };
}

describe("BOS-5 customer concentration", () => {
  it("computes top 1/3/5 shares from comparable attributed revenue", () => {
    const customers = [
      customer({ id: "metro", organisationName: "Metro" }),
      customer({ id: "north", organisationName: "Northbound" }),
      customer({ id: "harbour", organisationName: "Harbour" }),
    ];
    const result = computeConcentration(customers, [
      fact({ id: "m", customerId: "metro", revenueMinor: "150000000", currency: "AUD" }),
      fact({ id: "n", customerId: "north", revenueMinor: "80000000", currency: "AUD" }),
      fact({ id: "h", customerId: "harbour", revenueMinor: "25000000", currency: "AUD" }),
    ]);
    expect(result.currency).toBe("AUD");
    expect(result.totalRevenue?.minor).toBe("255000000");
    expect(result.topCustomerShareBps).toBe("5882");
    expect(Number(result.top3ShareBps)).toBeGreaterThanOrEqual(9999);
    expect(Number(result.top5ShareBps)).toBeGreaterThanOrEqual(9999);
  });

  it("returns unknown when currencies differ in the same period", () => {
    const customers = [customer({ id: "a", organisationName: "A" }), customer({ id: "b", organisationName: "B" })];
    const result = computeConcentration(customers, [
      fact({ id: "a", customerId: "a", revenueMinor: "100", currency: "AUD" }),
      fact({ id: "b", customerId: "b", revenueMinor: "100", currency: "USD" }),
    ]);
    expect(result.topCustomerShareBps).toBeNull();
    expect(result.unknownReasons).toContain("currency_mismatch");
  });

  it("reports 100% concentration when all revenue is in one account", () => {
    const customers = [customer({ id: "only", organisationName: "Only" })];
    const result = computeConcentration(customers, [
      fact({ id: "only", customerId: "only", revenueMinor: "1000000", currency: "AUD" }),
    ]);
    expect(result.topCustomerShareBps).toBe("10000");
  });
});
