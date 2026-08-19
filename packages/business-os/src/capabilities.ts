import type {
  BusinessCapabilityDefinition,
  BusinessCapabilityId,
} from "@rtb/types";
import { BUSINESS_CAPABILITY_IDS } from "@rtb/types";

const LABELS: Record<BusinessCapabilityId, { name: string; description: string }> = {
  owner_command: {
    name: "Owner Command Centre",
    description:
      "Owner-facing command centre: health, KPIs, signals, recommendations, decisions, actions, and daily brief",
  },
  financial_intelligence: {
    name: "Financial Intelligence",
    description:
      "Vendor-neutral financial management intelligence feeding Owner Command Centre (not a statutory ledger)",
  },
  growth_intelligence: {
    name: "Growth Intelligence",
    description:
      "Vendor-neutral lead, opportunity, and pipeline intelligence feeding Owner Command Centre (not outreach or CRM execution)",
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
    description:
      "Supervised commercial preparation: engagement plans, proposal/pricing intelligence, and bid/no-bid support (not external send or autonomous approval)",
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
    description:
      "Vendor-neutral Customer 360: conversion, health, concentration, and retention risk signals (not a CRM, credit bureau, or outreach tool)",
  },
  profit_intelligence: {
    name: "Profit Intelligence",
    description:
      "Vendor-neutral profitability intelligence: contribution, margin, leakage, and coverage feeding Owner Command Centre (not a ledger or cost-accounting subsystem)",
  },
  work_operations: {
    name: "Work & Operations",
    description:
      "Vendor-neutral work/job operational intelligence: milestones, cost/capacity facts, and delivery risk feeding Owner Command Centre (not a scheduler, payroll, or Engineering OS)",
  },
  decision_action: {
    name: "Decision & Action Intelligence",
    description:
      "Evidence-backed decision intelligence over existing Decision/Action primitives (not a second task system or autonomous approver)",
  },
  business_risk: {
    name: "Business Risk",
    description:
      "Evidence-backed business risk intelligence: assessment, controls, treatments, obligations, and residual risk feeding Owner Command Centre (not legal advice, certification, or a GRC suite)",
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
    implemented:
      id === "owner_command" ||
      id === "financial_intelligence" ||
      id === "growth_intelligence" ||
      id === "revenue_execution" ||
      id === "customer_intelligence" ||
      id === "profit_intelligence" ||
      id === "work_operations" ||
      id === "decision_action" ||
      id === "business_risk",
    activationStatus:
      id === "owner_command" ||
      id === "financial_intelligence" ||
      id === "growth_intelligence" ||
      id === "revenue_execution" ||
      id === "customer_intelligence" ||
      id === "profit_intelligence" ||
      id === "work_operations" ||
      id === "decision_action" ||
      id === "business_risk"
        ? "preview"
        : "registered",
  }));

export class BusinessCapabilityRegistry {
  list(): BusinessCapabilityDefinition[] {
    return BUSINESS_CAPABILITY_DEFINITIONS.map((c) => ({ ...c }));
  }

  get(id: BusinessCapabilityId): BusinessCapabilityDefinition | undefined {
    return this.list().find((c) => c.id === id);
  }

  isImplemented(id: BusinessCapabilityId): boolean {
    return (
      id === "owner_command" ||
      id === "financial_intelligence" ||
      id === "growth_intelligence" ||
      id === "revenue_execution" ||
      id === "customer_intelligence" ||
      id === "profit_intelligence" ||
      id === "work_operations" ||
      id === "decision_action" ||
      id === "business_risk"
    );
  }

  ids(): readonly BusinessCapabilityId[] {
    return BUSINESS_CAPABILITY_IDS;
  }
}

export const defaultBusinessCapabilityRegistry = new BusinessCapabilityRegistry();
