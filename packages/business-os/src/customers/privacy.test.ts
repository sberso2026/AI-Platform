import { describe, expect, it } from "vitest";
import { CUSTOMER_DEMO_CONTACTS } from "./demo";

describe("BOS-5 privacy / suppression", () => {
  it("keeps suppressed contacts organisation-linked and without outreach fields", () => {
    const suppressed = CUSTOMER_DEMO_CONTACTS.find((row) => row.sourceRef === "bos-5-demo-contact-suppressed");
    expect(suppressed?.suppressed).toBe(true);
    expect(suppressed?.businessEmail).toBeUndefined();
    expect(suppressed?.businessPhone).toBeUndefined();
    expect(JSON.stringify(CUSTOMER_DEMO_CONTACTS)).not.toMatch(/date of birth|passport|credit score/i);
  });
});
