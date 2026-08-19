import type { WorkOperationsProfitContract } from "@rtb/types";

export const WORK_OPERATIONS_PROFIT_CONTRACT: WorkOperationsProfitContract = {
  capability: "work_operations",
  implemented: false,
  inputs: [
    "actual_labour_cost",
    "subcontractor_cost",
    "project_job_progress",
    "utilization",
    "rework",
    "delivery_cost",
  ],
  note: "BOS-6 extension point only. Do not fabricate Operations costs before BOS-7.",
};

export function workOperationsProfitStatus() {
  return {
    available: false as const,
    reason: "work_operations_not_implemented" as const,
    contract: WORK_OPERATIONS_PROFIT_CONTRACT.capability,
  };
}
