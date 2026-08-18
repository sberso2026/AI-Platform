import type {
  BusinessEvidenceRef,
  BusinessGrowthScoreComponent,
  BusinessRevenueBidEvaluation,
  BusinessRevenueBidRecommendation,
  BusinessRevenueCommunicationDraft,
  BusinessRevenueEngagementPlan,
  BusinessRevenuePricingScenario,
  BusinessRevenueProposal,
  BusinessRevenueProposalRequirement,
} from "@rtb/types";

function str(value: unknown): string {
  return String(value ?? "");
}

function opt(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function bool(value: unknown, fallback = false): boolean {
  if (value === null || value === undefined) return fallback;
  return Boolean(value);
}

function refs(value: unknown): BusinessEvidenceRef[] {
  return Array.isArray(value) ? (value as BusinessEvidenceRef[]) : [];
}

export function mapEngagement(row: Record<string, unknown>): BusinessRevenueEngagementPlan {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    opportunityId: str(row.opportunity_id),
    objective: str(row.objective),
    stakeholderSummary: opt(row.stakeholder_summary),
    valueProposition: opt(row.value_proposition),
    keyNeeds: opt(row.key_needs),
    proposedApproach: opt(row.proposed_approach),
    nextAction: opt(row.next_action),
    owner: opt(row.owner),
    dueAt: opt(row.due_at),
    status: row.status as BusinessRevenueEngagementPlan["status"],
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapDraft(row: Record<string, unknown>): BusinessRevenueCommunicationDraft {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    opportunityId: str(row.opportunity_id),
    engagementPlanId: opt(row.engagement_plan_id),
    type: row.type as BusinessRevenueCommunicationDraft["type"],
    recipientContext: opt(row.recipient_context),
    subject: str(row.subject),
    body: str(row.body),
    purpose: str(row.purpose),
    evidenceRefs: refs(row.evidence_refs),
    generatedBy: row.generated_by as BusinessRevenueCommunicationDraft["generatedBy"],
    approvalStatus: row.approval_status as BusinessRevenueCommunicationDraft["approvalStatus"],
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapProposal(row: Record<string, unknown>): BusinessRevenueProposal {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    opportunityId: str(row.opportunity_id),
    proposalNumber: str(row.proposal_number),
    title: str(row.title),
    version: Number(row.version ?? 1),
    status: row.status as BusinessRevenueProposal["status"],
    scopeSummary: opt(row.scope_summary),
    customerRequirements: opt(row.customer_requirements),
    assumptions: opt(row.assumptions),
    exclusions: opt(row.exclusions),
    deliverables: opt(row.deliverables),
    commercialTermsSummary: opt(row.commercial_terms_summary),
    proposedPriceMinor: opt(row.proposed_price_minor),
    estimatedCostMinor: opt(row.estimated_cost_minor),
    currency: str(row.currency).trim(),
    scale: Number(row.scale ?? 2),
    targetMarginBps: opt(row.target_margin_bps),
    owner: opt(row.owner),
    approvalDecisionId: opt(row.approval_decision_id),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    evidenceRefs: refs(row.evidence_refs),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapRequirement(row: Record<string, unknown>): BusinessRevenueProposalRequirement {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    proposalId: str(row.proposal_id),
    requirement: str(row.requirement),
    sourceReference: opt(row.source_reference),
    mandatory: bool(row.mandatory, true),
    response: opt(row.response),
    status: row.status as BusinessRevenueProposalRequirement["status"],
    complianceStatus: row.compliance_status as BusinessRevenueProposalRequirement["complianceStatus"],
    evidenceRefs: refs(row.evidence_refs),
    generatedBy: row.generated_by as BusinessRevenueProposalRequirement["generatedBy"],
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapPricing(row: Record<string, unknown>): BusinessRevenuePricingScenario {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    opportunityId: str(row.opportunity_id),
    proposalId: opt(row.proposal_id),
    scenarioName: str(row.scenario_name),
    assumptions: opt(row.assumptions),
    revenueMinor: opt(row.revenue_minor),
    estimatedDirectCostMinor: opt(row.estimated_direct_cost_minor),
    allocatedCostMinor: opt(row.allocated_cost_minor),
    discountBps: opt(row.discount_bps),
    riskAllowanceMinor: opt(row.risk_allowance_minor),
    grossProfitMinor: opt(row.gross_profit_minor),
    grossMarginBps: opt(row.gross_margin_bps),
    currency: str(row.currency).trim(),
    scale: Number(row.scale ?? 2),
    exceptionDecisionId: opt(row.exception_decision_id),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapBid(row: Record<string, unknown>): BusinessRevenueBidEvaluation {
  return {
    id: str(row.id),
    tenantId: str(row.tenant_id),
    workspaceId: str(row.workspace_id),
    opportunityId: str(row.opportunity_id),
    recommendation: row.recommendation as BusinessRevenueBidRecommendation,
    components: Array.isArray(row.components) ? (row.components as BusinessGrowthScoreComponent[]) : [],
    missingInputs: Array.isArray(row.missing_inputs) ? (row.missing_inputs as string[]) : [],
    version: "bid_nobid.v1",
    decisionId: opt(row.decision_id),
    sourceType: str(row.source_type),
    sourceRef: opt(row.source_ref),
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    disclaimer: str(row.disclaimer),
    isDemo: bool(row.is_demo),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}
