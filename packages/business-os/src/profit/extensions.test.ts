import { describe, expect, it } from "vitest";
import { WORK_OPERATIONS_PROFIT_CONTRACT, workOperationsProfitStatus } from "./extensions";

describe("BOS-7 Work & Operations profit contract", () => {
  it("allows actual operational cost to feed profit with operations_fact attribution", () => {
    expect(WORK_OPERATIONS_PROFIT_CONTRACT.implemented).toBe(true);
    expect(WORK_OPERATIONS_PROFIT_CONTRACT.inputs).toEqual(
      expect.arrayContaining(["actual_labour_cost", "subcontractor_cost", "delivery_cost"]),
    );
    expect(WORK_OPERATIONS_PROFIT_CONTRACT.note).toMatch(/no arbitrary allocation/i);
    expect(workOperationsProfitStatus()).toEqual({
      available: true,
      reason: "operations_fact_attribution",
      contract: "work_operations",
    });
  });
});
