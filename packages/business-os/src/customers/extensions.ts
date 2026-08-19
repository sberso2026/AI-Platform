import type {
  CustomerAccountExpansionContract,
  CustomerRenewalIntelligenceContract,
} from "@rtb/types";

export const CUSTOMER_RENEWAL_INTELLIGENCE_CONTRACT: CustomerRenewalIntelligenceContract = {
  capability: "renewal_intelligence",
  implemented: false,
  inputs: [
    "contract_end_date",
    "recurring_revenue",
    "health",
    "usage_or_service_evidence",
    "payment_behaviour",
    "relationship_activity",
  ],
  note: "BOS-5 extension point only. Do not predict or execute renewals.",
};

export const CUSTOMER_ACCOUNT_EXPANSION_CONTRACT: CustomerAccountExpansionContract = {
  capability: "account_expansion",
  implemented: false,
  inputs: [
    "current_services",
    "customer_needs",
    "open_opportunities",
    "historical_purchases",
    "customer_health",
    "profitability",
  ],
  note: "BOS-5 extension point only. Do not automate cross-sell or upsell.",
};

export function renewalIntelligenceStatus() {
  return {
    available: false as const,
    reason: "renewal_intelligence_not_implemented" as const,
    contract: CUSTOMER_RENEWAL_INTELLIGENCE_CONTRACT.capability,
  };
}

export function accountExpansionStatus() {
  return {
    available: false as const,
    reason: "account_expansion_not_implemented" as const,
    contract: CUSTOMER_ACCOUNT_EXPANSION_CONTRACT.capability,
  };
}
