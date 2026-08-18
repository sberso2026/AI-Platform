import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import type {
  AiDailyBriefNarrative,
  BusinessHealthSnapshot,
  BusinessKpi,
  BusinessKpiCategory,
  BusinessRevenueDraftIngestInput,
  BusinessRevenueEngagementIngestInput,
  BusinessRevenuePricingIngestInput,
  BusinessRevenueProposalIngestInput,
  BusinessRevenueRequirementIngestInput,
} from "@rtb/types";
import { BUSINESS_OS_EVENT_TYPES } from "@rtb/types";
import { computeBusinessHealth } from "../owner-command/health";
import type { OwnerCommandService, OwnerCommandScope } from "../owner-command/service";
import { GrowthIntelligenceService } from "../growth/service";
import { parseMinor, toSafeNumber, utcDateDiffDays } from "../finance/money";
import { BUSINESS_DEVELOPMENT_AGENT_PASSPORT, assertAgentAction } from "./agent";
import { evaluateBidNoBid } from "./bid";
import {
  REVENUE_DEMO_DRAFTS,
  REVENUE_DEMO_ENGAGEMENTS,
  REVENUE_DEMO_FIXTURE,
  REVENUE_DEMO_PRICING,
  REVENUE_DEMO_PROPOSALS,
  REVENUE_DEMO_REQUIREMENTS,
} from "./demo";
import { applyPricingGuardrails } from "./guardrails";
import { evaluatePricing } from "./pricing";
import { RevenueRepository } from "./repository";
import { detectRevenueSignals } from "./signals";

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

function integerMetric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  return toSafeNumber(BigInt(value));
}

const REVENUE_KPI_META: Record<
  string,
  { name: string; category: BusinessKpiCategory; unit: string; direction: BusinessKpi["direction"] }
> = {
  qualified_opportunities: {
    name: "Qualified opportunities",
    category: "pipeline",
    unit: "count",
    direction: "higher_is_better",
  },
  proposal_ready_opportunities: {
    name: "Proposal-ready opportunities",
    category: "pipeline",
    unit: "count",
    direction: "higher_is_better",
  },
  proposals_in_progress: {
    name: "Proposals in progress",
    category: "revenue",
    unit: "count",
    direction: "higher_is_better",
  },
  proposal_turnaround_time: {
    name: "Proposal turnaround (days)",
    category: "operations",
    unit: "days",
    direction: "lower_is_better",
  },
  opportunities_without_next_action: {
    name: "Opportunities without next action",
    category: "pipeline",
    unit: "count",
    direction: "lower_is_better",
  },
  bid_decisions_pending: {
    name: "Bid decisions pending",
    category: "revenue",
    unit: "count",
    direction: "lower_is_better",
  },
  average_proposed_margin: {
    name: "Average proposed margin",
    category: "margin",
    unit: "bps",
    direction: "higher_is_better",
  },
  pricing_guardrail_breaches: {
    name: "Pricing guardrail breaches",
    category: "margin",
    unit: "count",
    direction: "lower_is_better",
  },
};

export class RevenueExecutionService {
  readonly repository: RevenueRepository;
  readonly agentPassport = BUSINESS_DEVELOPMENT_AGENT_PASSPORT;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    private readonly ownerCommand: OwnerCommandService,
    private readonly growthIntelligence: GrowthIntelligenceService,
  ) {
    this.repository = new RevenueRepository(supabase);
  }

  private async emit(
    scope: OwnerCommandScope,
    eventType: (typeof BUSINESS_OS_EVENT_TYPES)[number],
    payload: Record<string, unknown>,
  ) {
    try {
      await this.kernel.eventBus.publish({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        eventType,
        source: "business-os",
        payload,
      });
    } catch {
      // Event persistence must not fail-close the mutation.
    }
  }

  sendExternally(): never {
    assertAgentAction("send");
    throw new Error("external_send_forbidden");
  }

  submitProposalExternally(): never {
    throw new Error("external_submit_forbidden");
  }

  async upsertEngagement(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessRevenueEngagementIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    const result = await this.repository.upsertEngagement(scope, input, scope.userId);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: result.created ? "create" : "update",
      resourceType: "business_os_revenue_engagement",
      resourceId: result.plan.id,
      metadata: { status: result.plan.status, idempotent: !result.created },
    });
    if (result.created) await this.emit(scope, "business_os.revenue.engagement_created", { id: result.plan.id });
    await this.publishToOwnerCommand(scope);
    return result;
  }

  async upsertDraft(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessRevenueDraftIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    const result = await this.repository.upsertDraft(scope, input, scope.userId);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: result.created ? "create" : "update",
      resourceType: "business_os_revenue_draft",
      resourceId: result.draft.id,
      metadata: { type: result.draft.type, generatedBy: result.draft.generatedBy },
    });
    await this.emit(scope, "business_os.revenue.draft_prepared", { id: result.draft.id, type: result.draft.type });
    return result;
  }

  async upsertProposal(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessRevenueProposalIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    const result = await this.repository.upsertProposal(scope, input, scope.userId);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: result.created ? "create" : "update",
      resourceType: "business_os_revenue_proposal",
      resourceId: result.proposal.id,
      metadata: { status: result.proposal.status, version: result.proposal.version },
    });
    await this.emit(
      scope,
      result.created ? "business_os.revenue.proposal_created" : "business_os.revenue.proposal_updated",
      { id: result.proposal.id, status: result.proposal.status, version: result.proposal.version },
    );
    if (result.proposal.status === "ready_to_send" || result.proposal.status === "approved") {
      await this.emit(scope, "business_os.revenue.proposal_ready", { id: result.proposal.id });
    }
    await this.publishToOwnerCommand(scope);
    return result;
  }

  async upsertRequirement(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessRevenueRequirementIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    const result = await this.repository.upsertRequirement(scope, input, scope.userId);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: result.created ? "create" : "update",
      resourceType: "business_os_revenue_requirement",
      resourceId: result.requirement.id,
      metadata: { complianceStatus: result.requirement.complianceStatus },
    });
    return result;
  }

  async upsertPricing(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessRevenuePricingIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    const result = await this.repository.upsertPricing(scope, input, scope.userId);
    const evaluation = applyPricingGuardrails(
      evaluatePricing({
        revenueMinor: input.revenueMinor,
        estimatedDirectCostMinor: input.estimatedDirectCostMinor,
        allocatedCostMinor: input.allocatedCostMinor,
        discountBps: input.discountBps,
        riskAllowanceMinor: input.riskAllowanceMinor,
        currency: input.currency,
        scale: input.scale,
      }),
      await this.repository.loadSettings(scope),
    );
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: result.created ? "create" : "update",
      resourceType: "business_os_revenue_pricing",
      resourceId: result.scenario.id,
      metadata: { scenarioName: result.scenario.scenarioName, requiresApproval: evaluation.requiresApproval },
    });
    await this.emit(scope, "business_os.revenue.pricing_evaluated", {
      id: result.scenario.id,
      requiresApproval: evaluation.requiresApproval,
    });
    if (evaluation.requiresApproval) {
      await this.emit(scope, "business_os.revenue.pricing_exception", { id: result.scenario.id });
    }
    await this.publishToOwnerCommand(scope);
    return { ...result, evaluation };
  }

  async evaluatePricingPreview(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessRevenuePricingIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    return applyPricingGuardrails(evaluatePricing(input), await this.repository.loadSettings(scope));
  }

  async evaluateBid(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    opportunityId: string,
    persist = true,
  ) {
    const scope = requireWorkspace(raw);
    const opp = await this.growthIntelligence.opportunities(scope);
    const match = opp.opportunities.find((row) => row.id === opportunityId);
    const row = match ?? null;
    const sourced = row
      ? evaluateBidNoBid({
          strategicFit: row.strategicFit,
          opportunityScore: row.score,
          estimatedValueMinor: row.estimatedValueMinor,
          currency: row.currency,
          expectedMarginBps: row.expectedMarginBps,
          deliveryCapability: row.deliveryCapability,
          expectedCloseDate: row.expectedCloseDate,
          relationshipStrength: row.relationshipStrength,
          commercialRisk: row.commercialRisk,
          evidenceQuality: row.description ? "medium" : "low",
        })
      : evaluateBidNoBid({});
    if (!persist || !row) return { evaluation: sourced, record: null };
    const saved = await this.repository.upsertBid(
      scope,
      opportunityId,
      sourced,
      { sourceType: "derived", sourceRef: `bid:${opportunityId}`, isDemo: row.isDemo },
      scope.userId,
    );
    return { evaluation: sourced, record: saved.evaluation };
  }

  async requestBidDecision(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    opportunityId: string,
  ) {
    const scope = requireWorkspace(raw);
    const { evaluation, record } = await this.evaluateBid(scope, opportunityId, true);
    const decision = await this.ownerCommand.createDecision(scope, {
      statement: `Bid/no-bid for opportunity ${opportunityId}: advisory ${evaluation.recommendation}`,
      context: evaluation.disclaimer,
    });
    if (record) await this.repository.attachBidDecision(scope, record.id, decision.id);
    await this.emit(scope, "business_os.revenue.bid_decision_requested", {
      opportunityId,
      decisionId: decision.id,
      recommendation: evaluation.recommendation,
    });
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "create",
      resourceType: "business_os_decision",
      resourceId: decision.id,
      metadata: { kind: "bid_nobid", opportunityId },
    });
    return { evaluation, decision };
  }

  async completeBidDecision(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    decisionId: string,
    status: "approved" | "rejected" | "deferred",
    rationale?: string,
  ) {
    const scope = requireWorkspace(raw);
    const decision = await this.ownerCommand.updateDecision(scope, decisionId, {
      status,
      decision: status === "approved" ? "approve" : status === "rejected" ? "reject" : "defer",
      rationale,
    });
    await this.emit(scope, "business_os.revenue.bid_decision_completed", { decisionId, status });
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "update",
      resourceType: "business_os_decision",
      resourceId: decision.id,
      metadata: { kind: "bid_nobid", status },
    });
    return decision;
  }

  async approveProposal(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    proposalId: string,
    status: "approved" | "rejected",
    rationale?: string,
  ) {
    const scope = requireWorkspace(raw);
    const proposals = await this.repository.listProposals(scope);
    const proposal = proposals.find((row) => row.id === proposalId);
    if (!proposal) throw new Error("Proposal not found");
    const decision = await this.ownerCommand.createDecision(scope, {
      statement: `Proposal ${proposal.proposalNumber} v${proposal.version} ${status}`,
      context: rationale,
    });
    const updatedDecision = await this.ownerCommand.updateDecision(scope, decision.id, {
      status,
      decision: status === "approved" ? "approve" : "reject",
      rationale,
    });
    const nextStatus = status === "approved" ? "approved" : "withdrawn";
    const updated = await this.repository.updateProposalStatus(scope, proposalId, nextStatus, updatedDecision.id);
    if (status === "approved") await this.emit(scope, "business_os.revenue.proposal_ready", { id: updated.id });
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "update",
      resourceType: "business_os_revenue_proposal",
      resourceId: updated.id,
      metadata: { approval: status, decisionId: updatedDecision.id },
    });
    await this.publishToOwnerCommand(scope);
    return { proposal: updated, decision: updatedDecision };
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    await this.growthIntelligence.seedDemo(scope);
    await this.repository.upsertSettings(scope, { createdBy: scope.userId, isDemo: true, currency: "AUD", scale: 2 });

    const resolveOpp = async (token: string) => {
      const ref = token.startsWith("lookup:") ? token.slice(7) : token;
      const row = await this.repository.findOpportunityBySourceRef(scope, ref);
      if (!row?.id) throw new Error(`Demo opportunity not found: ${ref}`);
      return String(row.id);
    };

    const engagements = [];
    for (const item of REVENUE_DEMO_ENGAGEMENTS) {
      engagements.push(
        await this.upsertEngagement(scope, { ...item, opportunityId: await resolveOpp(item.opportunityId) }),
      );
    }
    const drafts = [];
    for (const item of REVENUE_DEMO_DRAFTS) {
      drafts.push(await this.upsertDraft(scope, { ...item, opportunityId: await resolveOpp(item.opportunityId) }));
    }
    const proposals = [];
    for (const item of REVENUE_DEMO_PROPOSALS) {
      proposals.push(await this.upsertProposal(scope, { ...item, opportunityId: await resolveOpp(item.opportunityId) }));
    }
    const byRef = new Map(proposals.map((p) => [p.proposal.sourceRef, p.proposal.id]));
    const requirements = [];
    for (const item of REVENUE_DEMO_REQUIREMENTS) {
      const proposalId = item.proposalId.startsWith("lookup:")
        ? byRef.get(item.proposalId.slice(7))
        : item.proposalId;
      if (!proposalId) throw new Error("Demo proposal not found for requirement");
      requirements.push(await this.upsertRequirement(scope, { ...item, proposalId }));
    }
    const pricing = [];
    for (const item of REVENUE_DEMO_PRICING) {
      const proposalId = item.proposalId?.startsWith("lookup:")
        ? byRef.get(item.proposalId.slice(7))
        : item.proposalId;
      pricing.push(
        await this.upsertPricing(scope, {
          ...item,
          opportunityId: await resolveOpp(item.opportunityId),
          proposalId: proposalId ?? null,
        }),
      );
    }
    const northbound = await this.repository.findOpportunityBySourceRef(scope, "bos-3-demo-opp-northbound");
    if (northbound?.id) await this.evaluateBid(scope, String(northbound.id), true);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "create",
      resourceType: "business_os_revenue_demo",
      resourceId: REVENUE_DEMO_FIXTURE,
      metadata: { fixture: REVENUE_DEMO_FIXTURE },
    });
    return { engagements, drafts, proposals, requirements, pricing, isDemo: true as const };
  }

  async summary(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const bundle = await this.bundle(scope);
    const kpis = (await this.ownerCommand.repository.listKpis(scope)).filter((k) => k.provenance?.domain === "revenue");
    return {
      ...bundle,
      agent: this.agentPassport,
      health: computeBusinessHealth(kpis),
      containsDemoData:
        bundle.engagements.some((e) => e.isDemo) ||
        bundle.proposals.some((p) => p.isDemo) ||
        bundle.opportunities.some((o) => o.isDemo),
      disclaimer:
        "Revenue Execution prepares internal commercial artefacts. It does not send messages, submit proposals, or approve itself.",
    };
  }

  async prepare(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    kind: "research" | "engagement" | "draft" | "proposal" | "missing",
    opportunityId: string,
  ) {
    const scope = requireWorkspace(raw);
    assertAgentAction("prepare");
    if (this.agentPassport.killSwitch.disabled) throw new Error("agent_disabled");
    const opportunities = await this.growthIntelligence.opportunities(scope);
    const opportunity = opportunities.opportunities.find((row) => row.id === opportunityId);
    if (!opportunity) throw new Error("Opportunity not found");
    const lead = await this.repository.loadLeadForOpportunity(scope, opportunityId);
    if (kind !== "research" && kind !== "missing" && lead && (lead.suppressed === true || lead.deleted_at)) {
      throw new Error("lead_suppressed");
    }
    const evidence = {
      kind: "business_os.revenue.evidence",
      opportunity,
      leadSuppressed: Boolean(lead?.suppressed),
      contactPresent: Boolean(lead && (lead.contact_name || lead.business_email)),
      agent: this.agentPassport,
      instructions: [
        "Use only structured evidence.",
        "Do not invent companies, contacts, emails, pricing, certifications, or staff.",
        "Do not send messages or submit proposals.",
        "Do not mark requirements satisfied.",
      ],
    };
    const narrative = await this.runDirector(scope, kind, evidence);
    if (kind === "engagement") {
      return this.upsertEngagement(scope, {
        opportunityId,
        objective: `Prepare supervised commercial work for ${opportunity.name}`,
        stakeholderSummary: opportunity.description ?? "Organisation context from Growth Intelligence.",
        nextAction: opportunity.nextAction ?? "Human review of engagement plan",
        owner: opportunity.owner,
        sourceType: "derived",
        sourceRef: `bda-engagement:${opportunityId}`,
        provenance: { generatedBy: narrative.unavailableReason ? "deterministic_rule" : "platform_ai_director" },
      });
    }
    if (kind === "draft") {
      return this.upsertDraft(scope, {
        opportunityId,
        type: "internal_note",
        subject: `Internal brief — ${opportunity.name}`,
        body:
          narrative.text ||
          `Internal research brief for ${opportunity.name}. Missing: ${opportunity.scoreDetail.missingInputs.join(", ") || "none listed"}. Do not send.`,
        purpose: "Internal research / outreach draft preparation. Not an external message.",
        generatedBy: narrative.unavailableReason ? "deterministic_rule" : "platform_ai_director",
        sourceType: "derived",
        sourceRef: `bda-draft:${opportunityId}`,
        evidenceRefs: [
          {
            sourceType: "growth_opportunity",
            sourceRef: opportunity.id,
            title: opportunity.name,
            excerpt: opportunity.description ?? opportunity.stage,
          },
        ],
        provenance: { narrativeUnavailable: narrative.unavailableReason ?? null },
      });
    }
    if (kind === "proposal") {
      return this.upsertProposal(scope, {
        opportunityId,
        proposalNumber: `BOS4-${opportunityId.slice(0, 8)}`,
        title: `${opportunity.name} — internal proposal draft`,
        status: "draft",
        scopeSummary: opportunity.description ?? "Drafted from supplied opportunity evidence.",
        assumptions: "No invented qualifications, staff, or certifications.",
        exclusions: "External submission is out of scope for BOS-4.",
        currency: opportunity.currency,
        scale: opportunity.scale,
        proposedPriceMinor: opportunity.estimatedValueMinor,
        sourceType: "derived",
        sourceRef: `bda-proposal:${opportunityId}`,
        provenance: { generatedBy: narrative.unavailableReason ? "deterministic_rule" : "platform_ai_director" },
        isDemo: opportunity.isDemo,
      });
    }
    return {
      kind,
      opportunityId,
      missing: opportunity.scoreDetail.missingInputs,
      contactPresent: Boolean(lead && (lead.contact_name || lead.business_email)),
      narrative,
      agent: this.agentPassport,
    };
  }

  async explain(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<AiDailyBriefNarrative> {
    const scope = requireWorkspace(raw);
    const summary = await this.summary(scope);
    return this.runDirector(scope, "explain", {
      kind: "business_os.revenue.evidence",
      proposalCount: summary.proposals.length,
      engagementCount: summary.engagements.length,
      pendingApprovals: summary.metrics.pendingApprovals,
      pricingAlerts: summary.metrics.pricingAlerts,
      containsDemoData: summary.containsDemoData,
      instructions: [
        "Summarise structured revenue execution for an owner.",
        "Do not invent prices, approvals, or contacts.",
        "Do not recommend sending messages.",
      ],
    });
  }

  private async runDirector(
    scope: OwnerCommandScope,
    kind: string,
    evidence: Record<string, unknown>,
  ): Promise<AiDailyBriefNarrative> {
    try {
      const policy = await this.kernel.intelligence.policies.evaluate({
        tenantId: scope.tenantId,
        operatingSystem: "business",
        intent: "revenue_execution.prepare",
        simulation: false,
      });
      if (policy.allowed === false) {
        return {
          text: "",
          generatedAt: new Date().toISOString(),
          generatedBy: "platform_ai_director",
          evidenceRefs: [],
          advisory: true,
          unavailableReason: "policy_denied",
        };
      }
      const agents = (await this.kernel.aiDirector.listAgents(scope.tenantId).catch(() => [])) as Array<{
        id: string;
        slug?: string;
      }>;
      const registered = agents.find((agent) => agent.slug === this.agentPassport.id);
      const response = await this.kernel.aiDirector.run({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        agentId: registered?.id,
        message: `Prepare internal ${kind} using only the structured revenue evidence. Do not send or approve.`,
        context: { evidence, agentPassport: this.agentPassport },
      });
      const text = response.message?.trim() ?? "";
      if (!text) {
        return {
          text: "",
          generatedAt: new Date().toISOString(),
          generatedBy: "platform_ai_director",
          evidenceRefs: [],
          advisory: true,
          unavailableReason: "empty_ai_response",
        };
      }
      return {
        text,
        generatedAt: new Date().toISOString(),
        generatedBy: "platform_ai_director",
        modelProvenance:
          [response.run.model_provider, response.run.model_name].filter(Boolean).join("/") || "platform-ai-director",
        evidenceRefs: [],
        advisory: true,
      };
    } catch {
      return {
        text: "",
        generatedAt: new Date().toISOString(),
        generatedBy: "platform_ai_director",
        evidenceRefs: [],
        advisory: true,
        unavailableReason: "ai_director_unavailable",
      };
    }
  }

  private async bundle(scope: OwnerCommandScope) {
    const opportunities = (await this.growthIntelligence.opportunities(scope)).opportunities;
    const [engagements, drafts, proposals, requirements, pricing, bids] = await Promise.all([
      this.repository.listEngagements(scope),
      this.repository.listDrafts(scope),
      this.repository.listProposals(scope),
      this.repository.listRequirements(scope),
      this.repository.listPricing(scope),
      this.repository.listBids(scope),
    ]);
    const guardrails = await this.repository.loadSettings(scope);
    const evaluations = pricing.map((row) =>
      applyPricingGuardrails(
        evaluatePricing({
          revenueMinor: row.revenueMinor,
          estimatedDirectCostMinor: row.estimatedDirectCostMinor,
          allocatedCostMinor: row.allocatedCostMinor,
          discountBps: row.discountBps,
          riskAllowanceMinor: row.riskAllowanceMinor,
          currency: row.currency,
          scale: row.scale,
        }),
        guardrails,
      ),
    );
    const qualified = opportunities.filter(
      (o) =>
        o.stage === "qualified" ||
        o.stage === "discovery" ||
        o.stage === "proposal_ready" ||
        o.stage === "proposal",
    );
    const inProgress = proposals.filter(
      (p) => p.status !== "superseded" && p.status !== "withdrawn" && p.status !== "ready_to_send",
    );
    const proposalReady = opportunities.filter((o) => o.stage === "proposal_ready").length;
    const pendingApprovals =
      proposals.filter((p) => p.status === "approval_required").length +
      evaluations.filter((e) => e.requiresApproval).length +
      bids.filter((b) => !b.decisionId).length;
    const knownMargins = evaluations.map((e) => parseMinor(e.grossMarginBps)).filter((v): v is bigint => v !== null);
    const avgMargin =
      knownMargins.length === 0
        ? null
        : knownMargins.reduce((a, b) => a + b, 0n) / BigInt(knownMargins.length);
    const turnaroundSamples = proposals
      .filter((p) => p.status === "approved" || p.status === "ready_to_send")
      .map((p) => utcDateDiffDays(p.createdAt.slice(0, 10), p.updatedAt.slice(0, 10)));
    const turnaround =
      turnaroundSamples.length === 0
        ? null
        : Math.round(turnaroundSamples.reduce((a, b) => a + b, 0) / turnaroundSamples.length);
    return {
      opportunities: qualified,
      engagements,
      drafts,
      proposals,
      requirements,
      pricing,
      bids,
      evaluations,
      metrics: {
        qualifiedOpportunities: qualified.length,
        proposalReadyOpportunities: proposalReady,
        proposalsInProgress: inProgress.length,
        pendingApprovals,
        pricingAlerts: evaluations.filter((e) => e.violations.length > 0).length,
        opportunitiesWithoutNextAction: qualified.filter((o) => !o.nextAction).length,
        bidDecisionsPending: bids.filter((b) => !b.decisionId).length,
        averageProposedMarginBps: avgMargin === null ? null : avgMargin.toString(),
        proposalTurnaroundDays: turnaround,
        pricingGuardrailBreaches: evaluations.filter((e) => e.requiresApproval).length,
      },
    };
  }

  private async publishToOwnerCommand(scope: OwnerCommandScope) {
    const bundle = await this.bundle(scope);
    const values: Record<string, number | null> = {
      qualified_opportunities: bundle.metrics.qualifiedOpportunities,
      proposal_ready_opportunities: bundle.metrics.proposalReadyOpportunities,
      proposals_in_progress: bundle.metrics.proposalsInProgress,
      proposal_turnaround_time: bundle.metrics.proposalTurnaroundDays,
      opportunities_without_next_action: bundle.metrics.opportunitiesWithoutNextAction,
      bid_decisions_pending: bundle.metrics.bidDecisionsPending,
      average_proposed_margin: integerMetric(bundle.metrics.averageProposedMarginBps),
      pricing_guardrail_breaches: bundle.metrics.pricingGuardrailBreaches,
    };
    const demo =
      bundle.engagements.some((e) => e.isDemo) ||
      bundle.proposals.some((p) => p.isDemo) ||
      bundle.opportunities.some((o) => o.isDemo);
    for (const [key, meta] of Object.entries(REVENUE_KPI_META)) {
      await this.ownerCommand.upsertKpi(scope, {
        key,
        name: meta.name,
        category: meta.category,
        unit: meta.unit,
        direction: meta.direction,
        value: values[key] ?? null,
        measuredAt: new Date().toISOString(),
        sourceType: demo ? "demo" : "derived",
        provenance: { domain: "revenue", live: false, agentAuthorityMax: "A2" },
        isDemo: demo,
      });
    }
    const detected = detectRevenueSignals({
      opportunities: bundle.opportunities,
      engagements: bundle.engagements,
      proposals: bundle.proposals,
      requirements: bundle.requirements,
      evaluations: bundle.evaluations,
      bids: bundle.bids,
    });
    const existing = await this.ownerCommand.repository.listSignals(scope);
    const recs = await this.ownerCommand.repository.listRecommendations(scope);
    for (const draft of detected.signals) {
      if (existing.some((s) => s.type === draft.type && s.status === "open")) continue;
      const created = await this.ownerCommand.repository.insertSignal(scope, {
        type: draft.type,
        severity: draft.severity,
        title: draft.title,
        summary: draft.summary,
        sourceType: demo ? "demo" : "derived",
        evidence: draft.evidence,
        provenance: draft.provenance,
        detectedAt: new Date().toISOString(),
        status: "open",
        businessImpact: draft.businessImpact,
        isDemo: demo,
        createdBy: scope.userId,
      });
      await this.emit(scope, "business_os.signal.created", { id: created.id, type: created.type });
    }
    for (const draft of detected.recommendations) {
      if (recs.some((r) => r.title === draft.title && r.status === "proposed")) continue;
      await this.ownerCommand.repository.insertRecommendation(scope, {
        title: draft.title,
        recommendationText: draft.recommendationText,
        rationaleSummary: draft.rationaleSummary,
        expectedImpact: draft.expectedImpact,
        confidence: draft.confidence,
        evidenceRefs: [],
        status: "proposed",
        generatedBy: "deterministic_rule",
        isDemo: demo,
        createdBy: scope.userId,
      });
    }
  }

  revenueHealthContribution(kpis: BusinessKpi[]): BusinessHealthSnapshot {
    return computeBusinessHealth(kpis.filter((k) => k.provenance?.domain === "revenue"));
  }
}
