import { describe, expect, it } from "vitest";
import { computeCustomerHealth } from "./health";
import { computePaymentBehaviour } from "./payment";
import { computeConcentration } from "./concentration";
import type { BusinessCustomer, BusinessCustomerFinancialFact, BusinessGrowthOpportunity } from "@rtb/types";

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

function fact(partial: Partial<BusinessCustomerFinancialFact> & { id: string; customerId: string }): BusinessCustomerFinancialFact {
  return {
    tenantId: "t",
    workspaceId: "w",
    periodStart: "2026-07-01",
    periodEnd: "2026-09-30",
    revenueMinor: "80000000",
    directCostMinor: "62000000",
    grossContributionMinor: "18000000",
    receivableOutstandingMinor: "9000000",
    receivableOverdueMinor: "400000",
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

function opportunity(name: string): BusinessGrowthOpportunity {
  return {
    id: name,
    tenantId: "t",
    workspaceId: "w",
    name,
    stage: "qualified",
    estimatedValueMinor: "80000000",
    currency: "AUD",
    scale: 2,
    probabilityBps: "4000",
    expectedCloseDate: null,
    expectedMarginBps: null,
    sourceType: "demo",
    score: 40,
    scoreVersion: "opportunity_score.v1",
    scoreDetail: {
      total: 40,
      components: [],
      missingInputs: [],
      version: "opportunity_score.v1",
      method: "deterministic_opportunity_score_v1",
      disclaimer: "",
    },
    provenance: {},
    suppressed: false,
    isDemo: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  };
}

describe("BOS-5 Customer 360 aggregation", () => {
  it("combines linked opportunity history with attributed money rather than duplicating a giant table", () => {
    const customers = [customer({ id: "north", organisationName: "Northbound Civils" })];
    const facts = [fact({ id: "n", customerId: "north" })];
    const payment = computePaymentBehaviour(facts);
    const health = computeCustomerHealth({
      customer: customers[0],
      facts,
      payment,
      opportunities: [opportunity("Northbound bridge inspection")],
      engagements: [],
      concentrationShareBps: computeConcentration(customers, facts).topCustomerShareBps,
    });
    expect(health.version).toBe("customer_health.v1");
    expect(payment.outstanding?.minor).toBe("9000000");
    expect(facts[0].grossContributionMinor).toBe("18000000");
    expect(health.components.some((c) => c.id === "pipeline" && c.evidence.includes("open opportunity"))).toBe(true);
  });
});
