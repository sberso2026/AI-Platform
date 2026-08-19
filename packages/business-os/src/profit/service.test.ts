import { describe, expect, it } from "vitest";
import { createBusinessOS } from "../business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";

describe("BOS-6 profit service guards", () => {
  it("forbids autonomous repricing and customer termination", () => {
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(() => bos.profitIntelligence.repriceAutonomously()).toThrow("autonomous_reprice_forbidden");
    expect(() => bos.profitIntelligence.terminateCustomer()).toThrow("autonomous_customer_action_forbidden");
    expect(bos.profitIntelligence.workOperations().available).toBe(true);
  });
});
