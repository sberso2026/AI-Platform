import { describe, expect, it } from "vitest";
import { CUSTOMER_DEMO_CONTACTS, CUSTOMER_DEMO_CUSTOMERS, CUSTOMER_DEMO_FACTS } from "./demo";

describe("BOS-5 customer ingestion contract", () => {
  it("uses source_type + source_ref as the natural idempotency key", () => {
    const keys = CUSTOMER_DEMO_CUSTOMERS.map((row) => `${row.sourceType}|${row.sourceRef}`);
    expect(new Set(keys).size).toBe(keys.length);
    const first = CUSTOMER_DEMO_CUSTOMERS[0];
    expect(`${first.sourceType}|${first.sourceRef}`).toBe("demo|bos-5-demo-customer-northbound");
  });

  it("allows a customer with no contact and does not require cost for revenue facts", () => {
    const quiet = CUSTOMER_DEMO_CUSTOMERS.find((row) => row.sourceRef === "bos-5-demo-customer-quiet");
    expect(quiet).toBeDefined();
    expect(CUSTOMER_DEMO_CONTACTS.some((row) => row.customerSourceRef === quiet?.sourceRef)).toBe(false);
    const harbour = CUSTOMER_DEMO_FACTS.find((row) => row.sourceRef === "bos-5-demo-fact-harbour");
    expect(harbour?.revenueMinor).toBe("25000000");
    expect(harbour?.directCostMinor).toBeUndefined();
  });

  it("keeps fact money as integer minor-unit strings", () => {
    for (const fact of CUSTOMER_DEMO_FACTS) {
      if (fact.revenueMinor != null) expect(String(fact.revenueMinor)).toMatch(/^-?\d+$/);
      if (fact.directCostMinor != null) expect(String(fact.directCostMinor)).toMatch(/^-?\d+$/);
    }
  });
});
