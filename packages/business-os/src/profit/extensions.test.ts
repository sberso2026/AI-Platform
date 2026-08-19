import { describe, expect, it } from "vitest";
import { WORK_OPERATIONS_PROFIT_CONTRACT, workOperationsProfitStatus } from "./extensions";

describe("BOS-6 Work & Operations extension contract", () => {
  it("exposes a not-implemented operations profit contract without fabricating costs", () => {
    expect(WORK_OPERATIONS_PROFIT_CONTRACT.implemented).toBe(false);
    expect(WORK_OPERATIONS_PROFIT_CONTRACT.inputs).toEqual(
      expect.arrayContaining(["actual_labour_cost", "subcontractor_cost", "delivery_cost"]),
    );
    expect(workOperationsProfitStatus()).toEqual({
      available: false,
      reason: "work_operations_not_implemented",
      contract: "work_operations",
    });
  });
});
