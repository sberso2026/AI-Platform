import type { Json, SupabaseClient } from "@rtb/database";
import type {
  BusinessRevenueBidEvaluation,
  BusinessRevenueCommunicationDraft,
  BusinessRevenueDraftIngestInput,
  BusinessRevenueEngagementIngestInput,
  BusinessRevenueEngagementPlan,
  BusinessRevenueGuardrails,
  BusinessRevenuePricingIngestInput,
  BusinessRevenuePricingScenario,
  BusinessRevenueProposal,
  BusinessRevenueProposalIngestInput,
  BusinessRevenueProposalRequirement,
  BusinessRevenueRequirementIngestInput,
} from "@rtb/types";
import {
  BUSINESS_REVENUE_APPROVAL_STATUSES,
  BUSINESS_REVENUE_COMMUNICATION_TYPES,
  BUSINESS_REVENUE_COMPLIANCE_STATUSES,
  BUSINESS_REVENUE_ENGAGEMENT_STATUSES,
  BUSINESS_REVENUE_PROPOSAL_STATUSES,
  PRICING_GUARDRAIL_VERSION,
} from "@rtb/types";
import { parseMinor } from "../finance/money";
import { applyPricingGuardrails, defaultGuardrails } from "./guardrails";
import { mapBid, mapDraft, mapEngagement, mapPricing, mapProposal, mapRequirement } from "./mappers";
import { evaluatePricing } from "./pricing";
import { assertRequirementCompliance } from "./requirements";
import type { BidNoBidResult } from "./bid";

type Scope = { tenantId: string; workspaceId: string };

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name as never);
}

function requireRow<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error) throw new Error(`${label}: ${error.message}`);
  if (!data) throw new Error(`${label}: not found`);
  return data;
}

function minorCol(value: unknown): string | null {
  const parsed = parseMinor(value ?? null);
  return parsed === null ? null : parsed.toString();
}

function parseBps(value: unknown, label: string): number | null {
  const parsed = parseMinor(value ?? null);
  if (parsed === null) return null;
  if (parsed < -10_000n || parsed > 10_000n) throw new Error(`invalid_${label}`);
  return Number(parsed);
}

function include<T>(allowed: readonly T[], value: unknown, fallback: T, label: string): T {
  if (value === undefined || value === null || value === "") return fallback;
  if ((allowed as readonly unknown[]).includes(value)) return value as T;
  throw new Error(`invalid_${label}`);
}

export class RevenueRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listEngagements(scope: Scope): Promise<BusinessRevenueEngagementPlan[]> {
    const { data, error } = await table(this.supabase, "business_os_revenue_engagement_plans")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list engagement plans: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapEngagement);
  }

  async listDrafts(scope: Scope): Promise<BusinessRevenueCommunicationDraft[]> {
    const { data, error } = await table(this.supabase, "business_os_revenue_communication_drafts")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list drafts: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapDraft);
  }

  async listProposals(scope: Scope): Promise<BusinessRevenueProposal[]> {
    const { data, error } = await table(this.supabase, "business_os_revenue_proposals")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list proposals: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapProposal);
  }

  async listRequirements(scope: Scope, proposalId?: string): Promise<BusinessRevenueProposalRequirement[]> {
    let query = table(this.supabase, "business_os_revenue_proposal_requirements")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId);
    if (proposalId) query = query.eq("proposal_id", proposalId);
    const { data, error } = await query.order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list requirements: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapRequirement);
  }

  async listPricing(scope: Scope): Promise<BusinessRevenuePricingScenario[]> {
    const { data, error } = await table(this.supabase, "business_os_revenue_pricing_scenarios")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list pricing scenarios: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapPricing);
  }

  async listBids(scope: Scope): Promise<BusinessRevenueBidEvaluation[]> {
    const { data, error } = await table(this.supabase, "business_os_revenue_bid_evaluations")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(`Failed to list bid evaluations: ${error.message}`);
    return ((data ?? []) as Record<string, unknown>[]).map(mapBid);
  }

  async loadOpportunityRow(scope: Scope, opportunityId: string): Promise<Record<string, unknown>> {
    const { data, error } = await table(this.supabase, "business_os_growth_opportunities")
      .select("*")
      .eq("id", opportunityId)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    return requireRow(data as Record<string, unknown> | null, error, "Opportunity");
  }

  async loadLeadForOpportunity(scope: Scope, opportunityId: string): Promise<Record<string, unknown> | null> {
    const opp = await this.loadOpportunityRow(scope, opportunityId);
    const leadId = opp.lead_id ? String(opp.lead_id) : "";
    if (!leadId) return null;
    const { data, error } = await table(this.supabase, "business_os_growth_leads")
      .select("*")
      .eq("id", leadId)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load lead: ${error.message}`);
    return (data as Record<string, unknown> | null) ?? null;
  }

  async findOpportunityBySourceRef(scope: Scope, sourceRef: string) {
    const { data, error } = await table(this.supabase, "business_os_growth_opportunities")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .eq("source_ref", sourceRef)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(`Failed to find opportunity: ${error.message}`);
    return data as Record<string, unknown> | null;
  }

  async loadSettings(scope: Scope): Promise<BusinessRevenueGuardrails> {
    const { data, error } = await table(this.supabase, "business_os_revenue_settings")
      .select("*")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    if (error) throw new Error(`Failed to load revenue settings: ${error.message}`);
    if (!data) return defaultGuardrails();
    const row = data as Record<string, unknown>;
    return {
      minTargetMarginBps: Number(row.min_target_margin_bps ?? 2000),
      maxDiscountBpsWithoutApproval: Number(row.max_discount_bps_without_approval ?? 1000),
      minAbsoluteContributionMinor: String(row.min_absolute_contribution_minor ?? "0"),
      currency: row.currency ? String(row.currency) : null,
      scale: Number(row.scale ?? 2),
      version: PRICING_GUARDRAIL_VERSION,
    };
  }

  async upsertSettings(
    scope: Scope,
    input: Partial<BusinessRevenueGuardrails> & { createdBy?: string; isDemo?: boolean },
  ): Promise<BusinessRevenueGuardrails> {
    const existing = await table(this.supabase, "business_os_revenue_settings")
      .select("id")
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .maybeSingle();
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      min_target_margin_bps: input.minTargetMarginBps ?? 2000,
      max_discount_bps_without_approval: input.maxDiscountBpsWithoutApproval ?? 1000,
      min_absolute_contribution_minor: input.minAbsoluteContributionMinor ?? "0",
      currency: input.currency ?? null,
      scale: input.scale ?? 2,
      guardrail_version: PRICING_GUARDRAIL_VERSION,
      provenance: { domain: "revenue" } as Json,
      is_demo: input.isDemo ?? false,
      created_by: input.createdBy ?? null,
    };
    const query = existing.data
      ? table(this.supabase, "business_os_revenue_settings")
          .update(payload as never)
          .eq("id", (existing.data as { id: string }).id)
          .select("*")
          .single()
      : table(this.supabase, "business_os_revenue_settings").insert(payload as never).select("*").single();
    const { error } = await query;
    if (error) throw new Error(`Failed to save revenue settings: ${error.message}`);
    return this.loadSettings(scope);
  }

  async upsertEngagement(
    scope: Scope,
    input: BusinessRevenueEngagementIngestInput,
    createdBy?: string,
  ): Promise<{ plan: BusinessRevenueEngagementPlan; created: boolean }> {
    if (!input.objective?.trim()) throw new Error("objective_required");
    if (!input.opportunityId) throw new Error("opportunity_id_required");
    await this.loadOpportunityRow(scope, input.opportunityId);
    const existing = input.sourceRef
      ? (await this.listEngagements(scope)).find(
          (row) => row.sourceType === input.sourceType && row.sourceRef === input.sourceRef,
        )
      : undefined;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      opportunity_id: input.opportunityId,
      objective: input.objective.trim(),
      stakeholder_summary: input.stakeholderSummary ?? null,
      value_proposition: input.valueProposition ?? null,
      key_needs: input.keyNeeds ?? null,
      proposed_approach: input.proposedApproach ?? null,
      next_action: input.nextAction ?? null,
      owner: input.owner ?? null,
      due_at: input.dueAt ?? null,
      status: include(BUSINESS_REVENUE_ENGAGEMENT_STATUSES, input.status, "draft", "engagement_status"),
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      provenance: { domain: "revenue", ...(input.provenance ?? {}) } as Json,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };
    if (existing) {
      const { data, error } = await table(this.supabase, "business_os_revenue_engagement_plans")
        .update(payload as never)
        .eq("id", existing.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      return { plan: mapEngagement(requireRow(data as Record<string, unknown> | null, error, "Engagement update")), created: false };
    }
    const { data, error } = await table(this.supabase, "business_os_revenue_engagement_plans")
      .insert(payload as never)
      .select("*")
      .single();
    return { plan: mapEngagement(requireRow(data as Record<string, unknown> | null, error, "Engagement insert")), created: true };
  }

  async upsertDraft(
    scope: Scope,
    input: BusinessRevenueDraftIngestInput,
    createdBy?: string,
  ): Promise<{ draft: BusinessRevenueCommunicationDraft; created: boolean }> {
    if (!input.subject?.trim() || !input.body?.trim()) throw new Error("draft_content_required");
    const lead = await this.loadLeadForOpportunity(scope, input.opportunityId);
    if (lead && (lead.suppressed === true || lead.deleted_at)) throw new Error("lead_suppressed");
    const existing = input.sourceRef
      ? (await this.listDrafts(scope)).find((row) => row.sourceType === input.sourceType && row.sourceRef === input.sourceRef)
      : undefined;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      opportunity_id: input.opportunityId,
      engagement_plan_id: input.engagementPlanId ?? null,
      type: include(BUSINESS_REVENUE_COMMUNICATION_TYPES, input.type, "internal_note", "draft_type"),
      recipient_context: input.recipientContext ?? null,
      subject: input.subject.trim(),
      body: input.body,
      purpose: input.purpose,
      evidence_refs: (input.evidenceRefs ?? []) as unknown as Json,
      generated_by: input.generatedBy ?? "user",
      approval_status: include(BUSINESS_REVENUE_APPROVAL_STATUSES, input.approvalStatus, "draft", "approval_status"),
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      provenance: { domain: "revenue", externalSend: false, ...(input.provenance ?? {}) } as Json,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };
    if (existing) {
      const { data, error } = await table(this.supabase, "business_os_revenue_communication_drafts")
        .update(payload as never)
        .eq("id", existing.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      return { draft: mapDraft(requireRow(data as Record<string, unknown> | null, error, "Draft update")), created: false };
    }
    const { data, error } = await table(this.supabase, "business_os_revenue_communication_drafts")
      .insert(payload as never)
      .select("*")
      .single();
    return { draft: mapDraft(requireRow(data as Record<string, unknown> | null, error, "Draft insert")), created: true };
  }

  async upsertProposal(
    scope: Scope,
    input: BusinessRevenueProposalIngestInput,
    createdBy?: string,
  ): Promise<{ proposal: BusinessRevenueProposal; created: boolean }> {
    if (!input.title?.trim()) throw new Error("proposal_title_required");
    if (!input.proposalNumber?.trim()) throw new Error("proposal_number_required");
    await this.loadOpportunityRow(scope, input.opportunityId);
    const existing = input.sourceRef
      ? (await this.listProposals(scope)).find((row) => row.sourceType === input.sourceType && row.sourceRef === input.sourceRef)
      : undefined;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      opportunity_id: input.opportunityId,
      proposal_number: input.proposalNumber.trim(),
      title: input.title.trim(),
      version: input.version ?? existing?.version ?? 1,
      status: include(BUSINESS_REVENUE_PROPOSAL_STATUSES, input.status, "draft", "proposal_status"),
      scope_summary: input.scopeSummary ?? null,
      customer_requirements: input.customerRequirements ?? null,
      assumptions: input.assumptions ?? null,
      exclusions: input.exclusions ?? null,
      deliverables: input.deliverables ?? null,
      commercial_terms_summary: input.commercialTermsSummary ?? null,
      proposed_price_minor: minorCol(input.proposedPriceMinor),
      estimated_cost_minor: minorCol(input.estimatedCostMinor),
      currency: input.currency.toUpperCase(),
      scale: input.scale ?? 2,
      target_margin_bps: parseBps(input.targetMarginBps, "target_margin_bps"),
      owner: input.owner ?? null,
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      evidence_refs: (input.evidenceRefs ?? []) as unknown as Json,
      provenance: { domain: "revenue", ...(input.provenance ?? {}) } as Json,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };
    if (existing) {
      const { data, error } = await table(this.supabase, "business_os_revenue_proposals")
        .update(payload as never)
        .eq("id", existing.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      return { proposal: mapProposal(requireRow(data as Record<string, unknown> | null, error, "Proposal update")), created: false };
    }
    const { data, error } = await table(this.supabase, "business_os_revenue_proposals")
      .insert(payload as never)
      .select("*")
      .single();
    return { proposal: mapProposal(requireRow(data as Record<string, unknown> | null, error, "Proposal insert")), created: true };
  }

  async updateProposalStatus(
    scope: Scope,
    proposalId: string,
    status: BusinessRevenueProposal["status"],
    approvalDecisionId?: string | null,
  ): Promise<BusinessRevenueProposal> {
    include(BUSINESS_REVENUE_PROPOSAL_STATUSES, status, "draft", "proposal_status");
    const { data, error } = await table(this.supabase, "business_os_revenue_proposals")
      .update({ status, approval_decision_id: approvalDecisionId ?? null } as never)
      .eq("id", proposalId)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapProposal(requireRow(data as Record<string, unknown> | null, error, "Proposal status"));
  }

  async upsertRequirement(
    scope: Scope,
    input: BusinessRevenueRequirementIngestInput,
    createdBy?: string,
  ): Promise<{ requirement: BusinessRevenueProposalRequirement; created: boolean }> {
    if (!input.requirement?.trim()) throw new Error("requirement_text_required");
    assertRequirementCompliance(input.complianceStatus ?? "unknown", input.evidenceRefs, input.generatedBy);
    const existing = input.sourceRef
      ? (await this.listRequirements(scope)).find((row) => row.sourceType === input.sourceType && row.sourceRef === input.sourceRef)
      : undefined;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      proposal_id: input.proposalId,
      requirement: input.requirement.trim(),
      source_reference: input.sourceReference ?? null,
      mandatory: input.mandatory ?? true,
      response: input.response ?? null,
      status: input.status ?? "open",
      compliance_status: include(
        BUSINESS_REVENUE_COMPLIANCE_STATUSES,
        input.complianceStatus,
        "unknown",
        "compliance_status",
      ),
      evidence_refs: (input.evidenceRefs ?? []) as unknown as Json,
      generated_by: input.generatedBy ?? "user",
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      provenance: { domain: "revenue", ...(input.provenance ?? {}) } as Json,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };
    if (existing) {
      const { data, error } = await table(this.supabase, "business_os_revenue_proposal_requirements")
        .update(payload as never)
        .eq("id", existing.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      return {
        requirement: mapRequirement(requireRow(data as Record<string, unknown> | null, error, "Requirement update")),
        created: false,
      };
    }
    const { data, error } = await table(this.supabase, "business_os_revenue_proposal_requirements")
      .insert(payload as never)
      .select("*")
      .single();
    return {
      requirement: mapRequirement(requireRow(data as Record<string, unknown> | null, error, "Requirement insert")),
      created: true,
    };
  }

  async upsertPricing(
    scope: Scope,
    input: BusinessRevenuePricingIngestInput,
    createdBy?: string,
  ): Promise<{ scenario: BusinessRevenuePricingScenario; created: boolean }> {
    if (!input.scenarioName?.trim()) throw new Error("scenario_name_required");
    const guardrails = await this.loadSettings(scope);
    const evaluated = applyPricingGuardrails(
      evaluatePricing({
        revenueMinor: input.revenueMinor,
        estimatedDirectCostMinor: input.estimatedDirectCostMinor,
        allocatedCostMinor: input.allocatedCostMinor,
        discountBps: input.discountBps,
        riskAllowanceMinor: input.riskAllowanceMinor,
        currency: input.currency,
        scale: input.scale,
      }),
      guardrails,
    );
    const existing = input.sourceRef
      ? (await this.listPricing(scope)).find((row) => row.sourceType === input.sourceType && row.sourceRef === input.sourceRef)
      : undefined;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      opportunity_id: input.opportunityId,
      proposal_id: input.proposalId ?? null,
      scenario_name: input.scenarioName.trim(),
      assumptions: input.assumptions ?? null,
      revenue_minor: minorCol(input.revenueMinor),
      estimated_direct_cost_minor: minorCol(input.estimatedDirectCostMinor),
      allocated_cost_minor: minorCol(input.allocatedCostMinor),
      discount_bps: parseBps(input.discountBps, "discount_bps"),
      risk_allowance_minor: minorCol(input.riskAllowanceMinor),
      gross_profit_minor: evaluated.grossProfit?.minor ?? null,
      gross_margin_bps: evaluated.grossMarginBps === null ? null : Number(evaluated.grossMarginBps),
      currency: input.currency.toUpperCase(),
      scale: input.scale ?? 2,
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      provenance: {
        domain: "revenue",
        evaluation: evaluated,
        ...(input.provenance ?? {}),
      } as unknown as Json,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };
    if (existing) {
      const { data, error } = await table(this.supabase, "business_os_revenue_pricing_scenarios")
        .update(payload as never)
        .eq("id", existing.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      return { scenario: mapPricing(requireRow(data as Record<string, unknown> | null, error, "Pricing update")), created: false };
    }
    const { data, error } = await table(this.supabase, "business_os_revenue_pricing_scenarios")
      .insert(payload as never)
      .select("*")
      .single();
    return { scenario: mapPricing(requireRow(data as Record<string, unknown> | null, error, "Pricing insert")), created: true };
  }

  async upsertBid(
    scope: Scope,
    opportunityId: string,
    result: BidNoBidResult,
    input: { sourceType: string; sourceRef?: string; isDemo?: boolean; decisionId?: string | null },
    createdBy?: string,
  ): Promise<{ evaluation: BusinessRevenueBidEvaluation; created: boolean }> {
    const existing = input.sourceRef
      ? (await this.listBids(scope)).find((row) => row.sourceType === input.sourceType && row.sourceRef === input.sourceRef)
      : undefined;
    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      opportunity_id: opportunityId,
      recommendation: result.recommendation,
      components: result.components as unknown as Json,
      missing_inputs: result.missingInputs as unknown as Json,
      version: result.version,
      decision_id: input.decisionId ?? existing?.decisionId ?? null,
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      provenance: { domain: "revenue", total: result.total, method: result.method } as Json,
      disclaimer: result.disclaimer,
      is_demo: input.isDemo ?? false,
      created_by: createdBy ?? null,
    };
    if (existing) {
      const { data, error } = await table(this.supabase, "business_os_revenue_bid_evaluations")
        .update(payload as never)
        .eq("id", existing.id)
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .select("*")
        .single();
      return { evaluation: mapBid(requireRow(data as Record<string, unknown> | null, error, "Bid update")), created: false };
    }
    const { data, error } = await table(this.supabase, "business_os_revenue_bid_evaluations")
      .insert(payload as never)
      .select("*")
      .single();
    return { evaluation: mapBid(requireRow(data as Record<string, unknown> | null, error, "Bid insert")), created: true };
  }

  async attachBidDecision(scope: Scope, evaluationId: string, decisionId: string): Promise<BusinessRevenueBidEvaluation> {
    const { data, error } = await table(this.supabase, "business_os_revenue_bid_evaluations")
      .update({ decision_id: decisionId } as never)
      .eq("id", evaluationId)
      .eq("tenant_id", scope.tenantId)
      .eq("workspace_id", scope.workspaceId)
      .select("*")
      .single();
    return mapBid(requireRow(data as Record<string, unknown> | null, error, "Bid decision"));
  }
}
