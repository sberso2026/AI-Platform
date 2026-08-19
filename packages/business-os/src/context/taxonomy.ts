import {
  BUSINESS_CONTEXT_RELATIONSHIP_TYPES,
  type BusinessContextNodeType,
  type BusinessContextRelationshipType,
} from "@rtb/types";

export const RELATIONSHIP_ENDPOINTS: Record<
  BusinessContextRelationshipType,
  { from: BusinessContextNodeType; to: BusinessContextNodeType }
> = {
  CUSTOMER_HAS_OPPORTUNITY: { from: "customer", to: "opportunity" },
  CUSTOMER_HAS_CONTACT: { from: "customer", to: "contact" },
  CUSTOMER_HAS_WORK: { from: "customer", to: "work" },
  CUSTOMER_IN_SEGMENT: { from: "customer", to: "market_segment" },
  CUSTOMER_LINKED_TO_FINANCIAL_FACT: { from: "customer", to: "financial_fact" },
  LEAD_CONVERTED_TO_CUSTOMER: { from: "lead", to: "customer" },
  OPPORTUNITY_HAS_PROPOSAL: { from: "opportunity", to: "proposal" },
  OPPORTUNITY_CONVERTED_TO_CUSTOMER: { from: "opportunity", to: "customer" },
  WORK_LINKED_TO_PROFIT_FACT: { from: "work", to: "profit_fact" },
  WORK_LINKED_TO_OPERATIONAL_COST: { from: "work", to: "financial_fact" },
  WORK_LINKED_TO_ENGINEERING_PROJECT_REFERENCE: { from: "work", to: "engineering_project_reference" },
  PROFIT_FACT_ATTRIBUTED_TO_CUSTOMER: { from: "profit_fact", to: "customer" },
  PROFIT_FACT_ATTRIBUTED_TO_WORK: { from: "profit_fact", to: "work" },
  RISK_AFFECTS_CUSTOMER: { from: "risk", to: "customer" },
  RISK_AFFECTS_WORK: { from: "risk", to: "work" },
  RISK_CONTROLLED_BY: { from: "risk", to: "control" },
  RISK_REQUIRES_DECISION: { from: "risk", to: "decision" },
  RISK_HAS_OBLIGATION: { from: "risk", to: "obligation" },
  DECISION_HAS_OPTION: { from: "decision", to: "evidence" },
  DECISION_CREATES_ACTION: { from: "decision", to: "action" },
  DECISION_HAS_EVIDENCE: { from: "decision", to: "evidence" },
  DECISION_AFFECTS_CUSTOMER: { from: "decision", to: "customer" },
  DECISION_AFFECTS_WORK: { from: "decision", to: "work" },
  DECISION_AFFECTS_RISK: { from: "decision", to: "risk" },
  SIGNAL_TRIGGERED_RECOMMENDATION: { from: "signal", to: "recommendation" },
  SIGNAL_AFFECTS_CUSTOMER: { from: "signal", to: "customer" },
  RECOMMENDATION_INFORMS_DECISION: { from: "recommendation", to: "decision" },
  ACTION_MITIGATES_RISK: { from: "action", to: "risk" },
  ACTION_LINKED_TO_WORK: { from: "action", to: "work" },
};

export const CUSTOMER_CONTEXT_ALLOWLIST: readonly BusinessContextRelationshipType[] = [
  "CUSTOMER_HAS_OPPORTUNITY",
  "CUSTOMER_HAS_CONTACT",
  "CUSTOMER_HAS_WORK",
  "CUSTOMER_IN_SEGMENT",
  "CUSTOMER_LINKED_TO_FINANCIAL_FACT",
  "LEAD_CONVERTED_TO_CUSTOMER",
  "OPPORTUNITY_HAS_PROPOSAL",
  "OPPORTUNITY_CONVERTED_TO_CUSTOMER",
  "PROFIT_FACT_ATTRIBUTED_TO_CUSTOMER",
  "RISK_AFFECTS_CUSTOMER",
  "DECISION_AFFECTS_CUSTOMER",
  "SIGNAL_AFFECTS_CUSTOMER",
  "DECISION_CREATES_ACTION",
  "RISK_REQUIRES_DECISION",
];

export const WORK_CONTEXT_ALLOWLIST: readonly BusinessContextRelationshipType[] = [
  "CUSTOMER_HAS_WORK",
  "OPPORTUNITY_HAS_PROPOSAL",
  "WORK_LINKED_TO_PROFIT_FACT",
  "WORK_LINKED_TO_OPERATIONAL_COST",
  "WORK_LINKED_TO_ENGINEERING_PROJECT_REFERENCE",
  "PROFIT_FACT_ATTRIBUTED_TO_WORK",
  "RISK_AFFECTS_WORK",
  "DECISION_AFFECTS_WORK",
  "ACTION_LINKED_TO_WORK",
  "DECISION_CREATES_ACTION",
];

export const DECISION_CONTEXT_ALLOWLIST: readonly BusinessContextRelationshipType[] = [
  "SIGNAL_TRIGGERED_RECOMMENDATION",
  "RECOMMENDATION_INFORMS_DECISION",
  "DECISION_HAS_EVIDENCE",
  "DECISION_HAS_OPTION",
  "DECISION_AFFECTS_CUSTOMER",
  "DECISION_AFFECTS_WORK",
  "DECISION_AFFECTS_RISK",
  "DECISION_CREATES_ACTION",
  "RISK_REQUIRES_DECISION",
  "ACTION_MITIGATES_RISK",
];

export const RISK_CONTEXT_ALLOWLIST: readonly BusinessContextRelationshipType[] = [
  "RISK_AFFECTS_CUSTOMER",
  "RISK_AFFECTS_WORK",
  "RISK_CONTROLLED_BY",
  "RISK_REQUIRES_DECISION",
  "RISK_HAS_OBLIGATION",
  "ACTION_MITIGATES_RISK",
  "DECISION_AFFECTS_RISK",
  "DECISION_HAS_EVIDENCE",
];

export const PROFIT_CONTEXT_ALLOWLIST: readonly BusinessContextRelationshipType[] = [
  "PROFIT_FACT_ATTRIBUTED_TO_CUSTOMER",
  "PROFIT_FACT_ATTRIBUTED_TO_WORK",
  "WORK_LINKED_TO_PROFIT_FACT",
  "CUSTOMER_LINKED_TO_FINANCIAL_FACT",
];

export function assertRelationshipType(value: string): BusinessContextRelationshipType {
  if (!(BUSINESS_CONTEXT_RELATIONSHIP_TYPES as readonly string[]).includes(value)) {
    throw new Error("invalid_relationship_type");
  }
  if (value === "RELATED_TO") throw new Error("vague_relationship_forbidden");
  return value as BusinessContextRelationshipType;
}

export function assertRelationshipEndpoints(
  type: BusinessContextRelationshipType,
  from: BusinessContextNodeType,
  to: BusinessContextNodeType,
): void {
  const expected = RELATIONSHIP_ENDPOINTS[type];
  if (expected.from !== from || expected.to !== to) {
    throw new Error("relationship_endpoint_mismatch");
  }
}

export const TAXONOMY = {
  types: BUSINESS_CONTEXT_RELATIONSHIP_TYPES,
  endpoints: RELATIONSHIP_ENDPOINTS,
} as const;
