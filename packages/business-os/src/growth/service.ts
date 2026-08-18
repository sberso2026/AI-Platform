import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import type {
  AiDailyBriefNarrative,
  BusinessGrowthLeadIngestInput,
  BusinessGrowthMarketIngestInput,
  BusinessGrowthOpportunityIngestInput,
  BusinessGrowthQualificationStatus,
  BusinessHealthSnapshot,
  BusinessKpi,
  BusinessKpiCategory,
} from "@rtb/types";
import { BUSINESS_GROWTH_DEFAULT_THRESHOLDS, BUSINESS_OS_EVENT_TYPES } from "@rtb/types";
import { computeBusinessHealth } from "../owner-command/health";
import type { OwnerCommandService, OwnerCommandScope } from "../owner-command/service";
import { toSafeNumber } from "../finance/money";
import { GrowthRepository } from "./repository";
import { computePipelineMetrics, qualificationRateBps } from "./pipeline";
import { detectGrowthSignals } from "./signals";
import { scoreLead } from "./lead-score";
import { scoreOpportunity } from "./opportunity-score";
import {
  GROWTH_DEMO_LEADS,
  GROWTH_DEMO_MARKET,
  GROWTH_DEMO_OPPORTUNITIES,
  GROWTH_DEMO_PROFILE,
  GROWTH_DEMO_REVENUE_TARGET_MINOR,
} from "./demo";

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

function integerMetric(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  return toSafeNumber(BigInt(value));
}

const GROWTH_KPI_META: Record<
  string,
  { name: string; category: BusinessKpiCategory; unit: string; direction: BusinessKpi["direction"] }
> = {
  new_leads: { name: "New leads", category: "pipeline", unit: "count", direction: "higher_is_better" },
  qualified_leads: { name: "Qualified leads", category: "pipeline", unit: "count", direction: "higher_is_better" },
  lead_qualification_rate: {
    name: "Lead qualification rate",
    category: "pipeline",
    unit: "bps",
    direction: "higher_is_better",
  },
  total_pipeline: { name: "Total pipeline", category: "pipeline", unit: "minor", direction: "higher_is_better" },
  qualified_pipeline: { name: "Qualified pipeline", category: "pipeline", unit: "minor", direction: "higher_is_better" },
  weighted_pipeline: { name: "Weighted pipeline", category: "pipeline", unit: "minor", direction: "higher_is_better" },
  pipeline_coverage: { name: "Pipeline coverage", category: "pipeline", unit: "bps", direction: "higher_is_better" },
  opportunities_won: { name: "Opportunities won", category: "pipeline", unit: "count", direction: "higher_is_better" },
  opportunities_lost: { name: "Opportunities lost", category: "pipeline", unit: "count", direction: "lower_is_better" },
  win_rate: { name: "Win rate", category: "pipeline", unit: "bps", direction: "higher_is_better" },
};

export class GrowthIntelligenceService {
  readonly repository: GrowthRepository;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    private readonly ownerCommand: OwnerCommandService,
  ) {
    this.repository = new GrowthRepository(supabase);
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
      // Persistence of events must not fail closed the growth mutation.
    }
  }

  async ingestLead(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessGrowthLeadIngestInput) {
    const scope = requireWorkspace(raw);
    const result = await this.repository.ingestLead(scope, input, scope.userId);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: result.created ? "create" : "update",
      resourceType: "business_os_growth_lead",
      resourceId: result.lead.id,
      metadata: { sourceType: input.sourceType, sourceRef: input.sourceRef ?? null, idempotent: !result.created },
    });
    await this.emit(scope, result.created ? "business_os.growth.lead_created" : "business_os.growth.metrics_updated", {
      id: result.lead.id,
      created: result.created,
    });
    if (result.lead.qualificationStatus === "qualified") {
      await this.emit(scope, "business_os.growth.lead_qualified", { id: result.lead.id });
    }
    if (result.lead.qualificationStatus === "converted") {
      await this.emit(scope, "business_os.growth.lead_converted", { id: result.lead.id });
    }
    await this.publishToOwnerCommand(scope);
    return result;
  }

  async qualifyLead(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    leadId: string,
    status: BusinessGrowthQualificationStatus,
  ) {
    const scope = requireWorkspace(raw);
    const lead = await this.repository.qualifyLead(scope, leadId, status, scope.userId);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "update",
      resourceType: "business_os_growth_lead",
      resourceId: lead.id,
      metadata: { qualificationStatus: status },
    });
    if (status === "qualified") await this.emit(scope, "business_os.growth.lead_qualified", { id: lead.id });
    if (status === "converted") await this.emit(scope, "business_os.growth.lead_converted", { id: lead.id });
    await this.publishToOwnerCommand(scope);
    return lead;
  }

  async ingestOpportunity(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessGrowthOpportunityIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    const previous = input.sourceRef
      ? (await this.repository.listOpportunities(scope)).find(
          (o) => o.sourceType === input.sourceType && o.sourceRef === input.sourceRef,
        )
      : undefined;
    const result = await this.repository.ingestOpportunity(scope, input, scope.userId);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: result.created ? "create" : "update",
      resourceType: "business_os_growth_opportunity",
      resourceId: result.opportunity.id,
      metadata: {
        stage: result.opportunity.stage,
        currency: result.opportunity.currency,
        idempotent: !result.created,
      },
    });
    if (result.created) {
      await this.emit(scope, "business_os.growth.opportunity_created", { id: result.opportunity.id });
    } else {
      await this.emit(scope, "business_os.growth.opportunity_updated", {
        id: result.opportunity.id,
        stage: result.opportunity.stage,
      });
    }
    if (result.opportunity.stage === "won" && previous?.stage !== "won") {
      await this.emit(scope, "business_os.growth.opportunity_won", { id: result.opportunity.id });
    }
    if (result.opportunity.stage === "lost" && previous?.stage !== "lost") {
      await this.emit(scope, "business_os.growth.opportunity_lost", { id: result.opportunity.id });
    }
    await this.publishToOwnerCommand(scope);
    return result;
  }

  async ingestMarket(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessGrowthMarketIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    const result = await this.repository.ingestMarket(scope, input, scope.userId);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: result.created ? "create" : "update",
      resourceType: "business_os_growth_market_segment",
      resourceId: result.segment.id,
      metadata: { sourceType: input.sourceType, idempotent: !result.created },
    });
    return result;
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    await this.repository.upsertSettings(scope, {
      targetProfile: GROWTH_DEMO_PROFILE,
      revenueTargetMinor: GROWTH_DEMO_REVENUE_TARGET_MINOR,
      revenueTargetCurrency: "AUD",
      createdBy: scope.userId,
      isDemo: true,
    });
    const leads = [];
    for (const lead of GROWTH_DEMO_LEADS) leads.push(await this.ingestLead(scope, lead));
    const opportunities = [];
    for (const opp of GROWTH_DEMO_OPPORTUNITIES) opportunities.push(await this.ingestOpportunity(scope, opp));
    const market = [];
    for (const segment of GROWTH_DEMO_MARKET) market.push(await this.ingestMarket(scope, segment));
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "create",
      resourceType: "business_os_growth_demo",
      resourceId: "bos-3-growth-intelligence",
      metadata: { fixture: "bos-3-growth-intelligence" },
    });
    return { leads, opportunities, market, isDemo: true as const };
  }

  async summary(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const bundle = await this.bundle(scope);
    const growthKpis = (await this.ownerCommand.repository.listKpis(scope)).filter(
      (k) => k.provenance?.domain === "growth",
    );
    return {
      leads: bundle.leads,
      opportunities: bundle.opportunities,
      market: bundle.market,
      pipeline: bundle.pipeline,
      health: computeBusinessHealth(growthKpis),
      completeness: bundle.completeness,
      containsDemoData: bundle.leads.some((l) => l.isDemo) || bundle.opportunities.some((o) => o.isDemo),
      disclaimer: bundle.pipeline.disclaimer,
    };
  }

  async leads(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const leads = await this.repository.listLeads(scope);
    return {
      leads: [...leads].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)),
    };
  }

  async scoreLeadPreview(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessGrowthLeadIngestInput,
  ) {
    const scope = requireWorkspace(raw);
    const settings = await this.repository.loadSettings(scope);
    return scoreLead(input, this.repository.targetProfileFromSettings(settings));
  }

  async scoreOpportunityPreview(input: BusinessGrowthOpportunityIngestInput) {
    return scoreOpportunity(input);
  }

  async opportunities(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    return { opportunities: await this.repository.listOpportunities(requireWorkspace(raw)) };
  }

  async pipeline(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const bundle = await this.bundle(requireWorkspace(raw));
    return bundle.pipeline;
  }

  async market(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    return { segments: await this.repository.listMarket(requireWorkspace(raw)) };
  }

  async explain(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<AiDailyBriefNarrative> {
    const scope = requireWorkspace(raw);
    const summary = await this.summary(scope);
    const evidence = {
      kind: "business_os.growth.evidence",
      pipeline: summary.pipeline,
      leadCount: summary.leads.length,
      opportunityCount: summary.opportunities.length,
      completeness: summary.completeness,
      containsDemoData: summary.containsDemoData,
      instructions: [
        "Use only the structured growth evidence.",
        "Do not calculate new scores or invent companies, emails, or contacts.",
        "Do not recommend outreach, proposals, or CRM writes.",
        "If a value is unknown, say it is unknown.",
        "Do not expose chain-of-thought.",
      ],
    };
    try {
      const policy = await this.kernel.intelligence.policies.evaluate({
        tenantId: scope.tenantId,
        operatingSystem: "business",
        intent: "growth_intelligence.explain",
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
      const response = await this.kernel.aiDirector.run({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        message:
          "Summarise the structured growth intelligence for an owner. Do not invent companies, contacts, or scores. Do not expose chain-of-thought.",
        context: { evidence },
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

  growthHealthContribution(kpis: BusinessKpi[]): BusinessHealthSnapshot {
    return computeBusinessHealth(kpis);
  }

  private async bundle(scope: OwnerCommandScope) {
    const [leads, opportunities, market, settings] = await Promise.all([
      this.repository.listLeads(scope),
      this.repository.listOpportunities(scope),
      this.repository.listMarket(scope),
      this.repository.loadSettings(scope),
    ]);
    const pipeline = computePipelineMetrics(opportunities, {
      revenueTargetMinor: settings?.revenue_target_minor as string | null | undefined,
      currency: settings?.revenue_target_currency as string | null | undefined,
      scale: Number(settings?.revenue_target_scale ?? 2),
    });
    const knownLeadFields = leads.reduce((sum, lead) => {
      const fields = [lead.industry, lead.geography, lead.website ?? lead.domain, lead.companySizeBand, lead.services];
      return sum + fields.filter(Boolean).length;
    }, 0);
    return {
      leads,
      opportunities,
      market,
      pipeline,
      completeness: {
        leadCount: leads.length,
        opportunityCount: opportunities.length,
        marketCount: market.length,
        knownOrganisationFieldCount: knownLeadFields,
        personalContactCount: leads.filter((l) => l.contactName || l.businessEmail).length,
      },
    };
  }

  private async publishToOwnerCommand(scope: OwnerCommandScope) {
    const bundle = await this.bundle(scope);
    const qualifiedLeads = bundle.leads.filter(
      (l) => l.qualificationStatus === "qualified" || l.qualificationStatus === "converted",
    );
    const values: Record<string, number | null> = {
      new_leads: bundle.leads.length,
      qualified_leads: qualifiedLeads.length,
      lead_qualification_rate: integerMetric(qualificationRateBps(qualifiedLeads.length, bundle.leads.length)),
      total_pipeline: integerMetric(bundle.pipeline.totalPipeline?.minor),
      qualified_pipeline: integerMetric(bundle.pipeline.qualifiedPipeline?.minor),
      weighted_pipeline: integerMetric(bundle.pipeline.weightedPipeline?.minor),
      pipeline_coverage: integerMetric(bundle.pipeline.pipelineCoverageBps),
      opportunities_won: bundle.pipeline.wonCount,
      opportunities_lost: bundle.pipeline.lostCount,
      win_rate: integerMetric(bundle.pipeline.winRateBps),
    };
    const t = BUSINESS_GROWTH_DEFAULT_THRESHOLDS;
    const extras: Record<string, { target?: number; warning?: number; critical?: number }> = {
      pipeline_coverage: {
        target: 10_000,
        warning: t.pipelineCoverageWarningBps,
        critical: t.pipelineCoverageCriticalBps,
      },
      win_rate: { target: 4000, warning: t.winRateWarningBps, critical: 1500 },
      qualified_leads: { warning: t.qualifiedLeadWarningCount, critical: 0 },
    };

    const currency = bundle.pipeline.currency;
    const scale = bundle.pipeline.scale;
    for (const [key, meta] of Object.entries(GROWTH_KPI_META)) {
      await this.ownerCommand.upsertKpi(scope, {
        key,
        name: meta.name,
        category: meta.category,
        unit: meta.unit,
        direction: meta.direction,
        value: values[key] ?? null,
        target: extras[key]?.target ?? null,
        warningThreshold: extras[key]?.warning ?? null,
        criticalThreshold: extras[key]?.critical ?? null,
        measuredAt: new Date().toISOString(),
        sourceType: bundle.leads.some((l) => l.isDemo) || bundle.opportunities.some((o) => o.isDemo) ? "demo" : "derived",
        provenance: {
          domain: "growth",
          currency,
          scale,
          live: false,
          scoreIsNotWinProbability: true,
        },
        isDemo: bundle.leads.some((l) => l.isDemo) || bundle.opportunities.some((o) => o.isDemo),
      });
    }

    await this.emit(scope, "business_os.growth.metrics_updated", {
      leadCount: bundle.leads.length,
      opportunityCount: bundle.opportunities.length,
    });

    const detected = detectGrowthSignals({
      leads: bundle.leads,
      opportunities: bundle.opportunities,
      pipeline: bundle.pipeline,
    });
    const existing = await this.ownerCommand.repository.listSignals(scope);
    const recs = await this.ownerCommand.repository.listRecommendations(scope);
    const demo = bundle.leads.some((l) => l.isDemo) || bundle.opportunities.some((o) => o.isDemo);

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
      await this.emit(scope, "business_os.growth.signal_detected", { id: created.id, ruleId: draft.ruleId });
    }

    for (const draft of detected.recommendations) {
      if (recs.some((r) => r.title === draft.title && r.status === "proposed")) continue;
      const signal = (await this.ownerCommand.repository.listSignals(scope)).find(
        (s) => s.type === draft.type && s.status === "open",
      );
      const created = await this.ownerCommand.repository.insertRecommendation(scope, {
        signalId: signal?.id ?? null,
        title: draft.title,
        recommendationText: draft.recommendationText,
        rationaleSummary: draft.rationaleSummary,
        expectedImpact: draft.expectedImpact,
        confidence: draft.confidence,
        evidenceRefs: signal?.evidence ?? [],
        status: "proposed",
        generatedBy: "deterministic_rule",
        isDemo: demo,
        createdBy: scope.userId,
      });
      await this.emit(scope, "business_os.recommendation.created", { id: created.id });
    }
  }
}
