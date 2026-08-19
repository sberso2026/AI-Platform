import { describe, expect, it } from "vitest";
import { detectCustomerSignals } from "./signals";
import { computeCustomerHealth } from "./health";
import { computePaymentBehaviour } from "./payment";
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
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

function fact(partial: Partial<BusinessCustomerFinancialFact> & { id: string; customerId: string }): BusinessCustomerFinancialFact {
  return {
    tenantId: "t",
    workspaceId: "w",
    periodStart: "2026-07-01",
    periodEnd: "2026-09-30",
    revenueMinor: "150000000",
    directCostMinor: "120000000",
    grossContributionMinor: "30000000",
    receivableOutstandingMinor: "1000",
    receivableOverdueMinor: "400",
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

describe("BOS-5 customer signals", () => {
  it("emits retention_risk_signal language and never predicted_churn_probability", () => {
    const customers = [customer({ id: "metro", organisationName: "Metro Interchange Authority", relationshipOwner: null })];
    const facts = [fact({ id: "m", customerId: "metro" })];
    const payment = computePaymentBehaviour(facts);
    const health = computeCustomerHealth({
      customer: customers[0],
      facts,
      payment,
      opportunities: [],
      engagements: [],
      concentrationShareBps: "10000",
    });
    const detected = detectCustomerSignals({
      customers,
      healthById: new Map([["metro", health]]),
      paymentById: new Map([["metro", payment]]),
      opportunitiesById: new Map(),
      concentration: computeConcentration(customers, facts),
    });
    const blob = JSON.stringify(detected);
    expect(blob).toContain("retention_risk_signal");
    expect(blob).not.toContain("predicted_churn_probability");
    expect(detected.signals.some((s) => s.ruleId === "customer.concentration_high.v1")).toBe(true);
    expect(detected.signals.some((s) => s.ruleId === "customer.missing_relationship_owner.v1")).toBe(true);
    expect(detected.recommendations.some((r) => r.type === "customer.prepare_retention_review")).toBe(
      health.status === "at_risk" || health.status === "critical",
    );
  });
});
