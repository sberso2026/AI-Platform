import { describe, expect, it } from "vitest";
import { computeCustomerHealth, CUSTOMER_HEALTH_DISCLAIMER } from "./health";
import { computePaymentBehaviour } from "./payment";
import type { BusinessCustomer, BusinessCustomerFinancialFact } from "@rtb/types";

function customer(partial: Partial<BusinessCustomer> = {}): BusinessCustomer {
  return {
    id: "c1",
    tenantId: "t",
    workspaceId: "w",
    organisationName: "Quiet Workshop Pty",
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

describe("BOS-5 customer health", () => {
  it("stays unknown when fewer than three components have evidence", () => {
    const result = computeCustomerHealth({
      customer: customer({ updatedAt: "" }),
      facts: [],
      payment: computePaymentBehaviour([]),
      opportunities: [],
      engagements: [],
    });
    expect(result.status).toBe("unknown");
    expect(result.score).toBeNull();
    expect(result.version).toBe("customer_health.v1");
    expect(result.missingComponents.length).toBeGreaterThanOrEqual(3);
  });

  it("does not fabricate profitability when revenue has no cost", () => {
    const facts = [
      fact({ id: "current", revenueMinor: "25000000", periodEnd: "2026-09-30" }),
      fact({ id: "previous", revenueMinor: "20000000", periodEnd: "2026-06-30" }),
    ];
    const result = computeCustomerHealth({
      customer: customer(),
      facts,
      payment: computePaymentBehaviour(facts),
      opportunities: [],
      engagements: [],
      concentrationShareBps: "1000",
    });
    const contribution = result.components.find((c) => c.id === "contribution");
    expect(contribution?.status).toBe("unknown");
    expect(contribution?.evidence).toMatch(/profitability remains unknown/i);
    expect(result.disclaimer).toBe(CUSTOMER_HEALTH_DISCLAIMER);
    expect(result.disclaimer).toMatch(/not a credit rating/i);
    expect(result.disclaimer).not.toMatch(/churn probability model/i);
  });
});
