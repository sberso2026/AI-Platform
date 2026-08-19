import { describe, expect, it } from "vitest";
import {
  CUSTOMER_ACCOUNT_EXPANSION_CONTRACT,
  CUSTOMER_RENEWAL_INTELLIGENCE_CONTRACT,
  accountExpansionStatus,
  renewalIntelligenceStatus,
} from "./extensions";

describe("BOS-5 renewal and expansion extension points", () => {
  it("exposes contracts without implementing prediction or execution", () => {
    expect(CUSTOMER_RENEWAL_INTELLIGENCE_CONTRACT.implemented).toBe(false);
    expect(CUSTOMER_ACCOUNT_EXPANSION_CONTRACT.implemented).toBe(false);
    expect(renewalIntelligenceStatus()).toEqual({
      available: false,
      reason: "renewal_intelligence_not_implemented",
      contract: "renewal_intelligence",
    });
    expect(accountExpansionStatus()).toEqual({
      available: false,
      reason: "account_expansion_not_implemented",
      contract: "account_expansion",
    });
  });
});
