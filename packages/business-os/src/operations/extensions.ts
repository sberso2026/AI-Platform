import type {
  DecisionActionIntelligenceContract,
  EngineeringProjectLinkContract,
  WorkOperationsProfitContract,
} from "@rtb/types";
import {
  DECISION_ACTION_INTELLIGENCE_CONTRACT,
  decisionActionIntelligenceStatus,
} from "../decisions/extensions";

export const WORK_OPERATIONS_PROFIT_CONTRACT: WorkOperationsProfitContract = {
  capability: "work_operations",
  implemented: true,
  inputs: [
    "actual_labour_cost",
    "subcontractor_cost",
    "project_job_progress",
    "utilization",
    "delivery_cost",
  ],
  note:
    "BOS-7 actual operational cost facts may feed Profit Intelligence as operations_fact. Budget and forecast remain non-realized. No arbitrary allocation.",
};

export function workOperationsProfitStatus() {
  return {
    available: true as const,
    reason: "operations_fact_attribution" as const,
    contract: WORK_OPERATIONS_PROFIT_CONTRACT.capability,
  };
}

export const ENGINEERING_PROJECT_LINK_CONTRACT: EngineeringProjectLinkContract = {
  capability: "engineering_project_link",
  implemented: true,
  mode: "stable_reference",
  writesEngineeringOs: false,
  readsEngineeringTables: false,
  note:
    "Stores linked_engineering_project_id and linked_engineering_project_ref only. Engineering OS remains authoritative for engineering execution. No ad hoc engineering table queries or writes.",
};

export { DECISION_ACTION_INTELLIGENCE_CONTRACT, decisionActionIntelligenceStatus };
export type { DecisionActionIntelligenceContract };
