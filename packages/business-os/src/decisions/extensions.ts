import type { DecisionActionIntelligenceContract, BusinessRiskContract } from "@rtb/types";

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

export const BUSINESS_RISK_CONTRACT: BusinessRiskContract = {
  capability: "business_risk",
  implemented: false,
  inputs: ["decision_outcomes", "operational_signals", "financial_signals"],
  note: "BOS-8 extension boundary only. Do not start BOS-9 Business Risk.",
};

export function businessRiskStatus() {
  return {
    available: false as const,
    reason: "business_risk_not_implemented" as const,
    contract: BUSINESS_RISK_CONTRACT.capability,
  };
}
