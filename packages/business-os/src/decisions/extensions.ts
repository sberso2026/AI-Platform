import type { DecisionActionIntelligenceContract } from "@rtb/types";
import { BUSINESS_RISK_CONTRACT, businessRiskStatus } from "../risk/extensions";

export const DECISION_ACTION_INTELLIGENCE_CONTRACT: DecisionActionIntelligenceContract = {
  capability: "decision_action",
  implemented: true,
  inputs: [
    "owner_decisions",
    "owner_actions",
    "signals",
    "recommendations",
    "finance_evidence_refs",
    "growth_evidence_refs",
    "revenue_evidence_refs",
    "customer_evidence_refs",
    "profit_evidence_refs",
    "operations_evidence_refs",
  ],
  reuses: [
    "business_os_signals",
    "business_os_recommendations",
    "business_os_decisions",
    "business_os_actions",
  ],
  advisoryOnly: true,
  noAutonomousApproval: true,
  note: "Evidence-backed Decision Intelligence over existing BOS-1 Decision/Action primitives. Human approval only. No second task system.",
};

export function decisionActionIntelligenceStatus() {
  return {
    available: true as const,
    reason: "decision_action_implemented" as const,
    contract: DECISION_ACTION_INTELLIGENCE_CONTRACT.capability,
  };
}

export { BUSINESS_RISK_CONTRACT, businessRiskStatus };
