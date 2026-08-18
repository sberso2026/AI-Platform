import type {
  BusinessCapabilityDefinition,
  BusinessCapabilityId,
} from "@rtb/types";
import { BUSINESS_CAPABILITY_IDS } from "@rtb/types";

const LABELS: Record<BusinessCapabilityId, { name: string; description: string }> = {
  owner_command: {
    name: "Owner Command Centre",
    description: "Owner-facing command centre for business operations (not implemented)",
  },
  financial_intelligence: {
    name: "Financial Intelligence",
    description: "Financial intelligence and advisory surfaces (not implemented)",
  },
  growth_intelligence: {
    name: "Growth Intelligence",
    description: "Growth and pipeline intelligence (not implemented)",
  },
  market_intelligence: {
    name: "Market Intelligence",
    description: "B2B market and competitive intelligence (not implemented)",
  },
  lead_generation: {
    name: "Lead Generation",
    description: "Lead generation workflows (not implemented)",
  },
  lead_enrichment: {
    name: "Lead Enrichment",
    description: "Lead enrichment workflows (not implemented)",
  },
  lead_scoring: {
    name: "Lead Scoring",
    description: "Lead scoring models (not implemented)",
  },
  opportunity_intelligence: {
    name: "Opportunity Intelligence",
    description: "Opportunity analysis (not implemented)",
  },
  revenue_execution: {
    name: "Revenue Execution",
    description: "Revenue execution workflows (not implemented)",
  },
  proposal_intelligence: {
    name: "Proposal Intelligence",
    description: "Proposal drafting and review (not implemented)",
  },
  pricing_intelligence: {
    name: "Pricing Intelligence",
    description: "Pricing advisory (not implemented)",
  },
  customer_intelligence: {
    name: "Customer Intelligence",
    description: "Customer intelligence (not implemented)",
  },
  profit_intelligence: {
    name: "Profit Intelligence",
    description: "Profitability intelligence (not implemented)",
  },
  work_operations: {
    name: "Work & Operations",
    description: "Work and operations (not implemented)",
  },
  decision_action: {
    name: "Decision & Action Intelligence",
    description: "Business decisions and actions (not implemented)",
  },
  business_risk: {
    name: "Business Risk",
    description: "Business risk register (not implemented)",
  },
  business_context: {
    name: "Business Context Graph",
    description: "Business context graph namespace (not implemented)",
  },
  ai_workforce: {
    name: "AI Workforce",
    description: "Governed business agents (not implemented)",
  },
};

export const BUSINESS_CAPABILITY_DEFINITIONS: BusinessCapabilityDefinition[] =
  BUSINESS_CAPABILITY_IDS.map((id) => ({
    id,
    name: LABELS[id].name,
    description: LABELS[id].description,
    implemented: false,
    activationStatus: "registered",
  }));

export class BusinessCapabilityRegistry {
  list(): BusinessCapabilityDefinition[] {
    return BUSINESS_CAPABILITY_DEFINITIONS.map((c) => ({ ...c }));
  }

  get(id: BusinessCapabilityId): BusinessCapabilityDefinition | undefined {
    return this.list().find((c) => c.id === id);
  }

  isImplemented(_id: BusinessCapabilityId): boolean {
    return false;
  }

  ids(): readonly BusinessCapabilityId[] {
    return BUSINESS_CAPABILITY_IDS;
  }
}

export const defaultBusinessCapabilityRegistry = new BusinessCapabilityRegistry();
