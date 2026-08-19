import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import type {
  AiDailyBriefNarrative,
  BusinessKpi,
  BusinessKpiCategory,
  BusinessProfitAttributionMethod,
  BusinessProfitCustomerView,
  BusinessProfitDimensionType,
  BusinessProfitFact,
  BusinessProfitFactIngestInput,
  BusinessProfitLeakageSignal,
  BusinessProfitRankRow,
  BusinessProfitSummary,
  BusinessProfitValueState,
} from "@rtb/types";
import {
  BUSINESS_OS_EVENT_TYPES,
  BUSINESS_PROFIT_ATTRIBUTION_METHODS,
  BUSINESS_PROFIT_DEFAULT_THRESHOLDS,
  BUSINESS_PROFIT_DIMENSION_TYPES,
  BUSINESS_PROFIT_KPI_KEYS,
  BUSINESS_PROFIT_VALUE_STATES,
} from "@rtb/types";
import { computeBusinessHealth } from "../owner-command/health";
import type { OwnerCommandService, OwnerCommandScope } from "../owner-command/service";
import { CustomerIntelligenceService } from "../customers/service";
import { computePaymentBehaviour } from "../customers/payment";
import { toSafeNumber } from "../finance/money";
import { classifyProfit } from "./classification";
import { PROFIT_DEMO_FACTS, PROFIT_DEMO_FIXTURE } from "./demo";
import { workOperationsProfitStatus } from "./extensions";
import { detectProfitLeakage } from "./leakage";
import {
  computeFactMetrics,
  isRealizedState,
} from "./metrics";
import {
  computeProfitConcentration,
  computeProfitCoverage,
  computeProfitTrends,
  rankProfitFacts,
  realizedFacts,
  type ProfitRankBy,
} from "./ranking";
import { asJson, minorCol, ProfitIntelligenceRepository } from "./repository";

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

function integerMetric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  return toSafeNumber(BigInt(value));
}

const PROFIT_KPI_META: Record<
  (typeof BUSINESS_PROFIT_KPI_KEYS)[number],
  { name: string; category: BusinessKpiCategory; unit: string; direction: BusinessKpi["direction"] }
> = {
  total_contribution: {
    name: "Total contribution",
    category: "margin",
    unit: "minor",
    direction: "higher_is_better",
  },
  contribution_margin: {
    name: "Contribution margin",
    category: "margin",
    unit: "bps",
    direction: "higher_is_better",
  },
  negative_contribution_count: {
    name: "Negative contribution count",
    category: "margin",
    unit: "count",
    direction: "lower_is_better",
  },
  low_margin_customer_count: {
    name: "Low-margin customer count",
    category: "margin",
    unit: "count",
    direction: "lower_is_better",
  },
  top_customer_profit_share: {
    name: "Top customer profit share",
    category: "margin",
    unit: "bps",
    direction: "lower_is_better",
  },
  top5_profit_concentration: {
    name: "Top 5 profit concentration",
    category: "margin",
    unit: "bps",
    direction: "lower_is_better",
  },
  profit_data_coverage: {
    name: "Profit data coverage",
    category: "operations",
    unit: "bps",
    direction: "higher_is_better",
  },
  margin_deterioration_count: {
    name: "Margin deterioration count",
    category: "margin",
    unit: "count",
    direction: "lower_is_better",
  },
};

const DISCLAIMER =
  "Profit Intelligence uses sourced revenue and direct cost only. Missing cost leaves profitability unknown. Allocated cost is never invented. Proposed values are not realized profit. Advisory only — no autonomous repricing or customer action.";

export class ProfitIntelligenceService {
  readonly repository: ProfitIntelligenceRepository;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    private readonly ownerCommand: OwnerCommandService,
    private readonly customerIntelligence: CustomerIntelligenceService,
  ) {
    this.repository = new ProfitIntelligenceRepository(supabase);
  }

  repriceAutonomously(): never {
    throw new Error("autonomous_reprice_forbidden");
  }

  terminateCustomer(): never {
    throw new Error("autonomous_customer_action_forbidden");
  }

  workOperations() {
    return workOperationsProfitStatus();
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

  async ingestFact(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: BusinessProfitFactIngestInput & { contributionMinor?: string | number | null },
  ) {
    const scope = requireWorkspace(raw);
    if (!input.periodStart || !input.periodEnd) throw new Error("invalid_period");
    if (input.periodEnd < input.periodStart) throw new Error("invalid_period");
    if (!input.dimensionName?.trim()) throw new Error("dimension_name_required");
    if (!BUSINESS_PROFIT_DIMENSION_TYPES.includes(input.dimensionType)) {
      throw new Error("invalid_profit_dimension");
    }
    if (!input.sourceType) throw new Error("invalid_source_type");
    const currency = input.currency.trim().toUpperCase();
    if (currency.length !== 3) throw new Error("currency_required");
    const scale = input.scale ?? 2;
    if (!Number.isInteger(scale) || scale < 0 || scale > 6) throw new Error("invalid_scale");
    const valueState: BusinessProfitValueState = input.valueState ?? "actual";
    if (!BUSINESS_PROFIT_VALUE_STATES.includes(valueState)) throw new Error("invalid_value_state");
    const attributionMethod: BusinessProfitAttributionMethod = input.attributionMethod ?? "unknown";
    if (!BUSINESS_PROFIT_ATTRIBUTION_METHODS.includes(attributionMethod)) {
      throw new Error("invalid_attribution_method");
    }

    const revenueMinor = minorCol(input.revenueMinor ?? null);
    const directCostMinor = minorCol(input.directCostMinor ?? null);
    const allocatedCostMinor = minorCol(input.allocatedCostMinor ?? null);
    const preview = computeFactMetrics({
      id: "preview",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      dimensionType: input.dimensionType,
      dimensionId: input.dimensionId ?? null,
      dimensionRef: input.dimensionRef ?? null,
      dimensionName: input.dimensionName.trim(),
      revenueMinor,
      directCostMinor,
      allocatedCostMinor,
      contributionMinor: null,
      profitAfterAllocatedMinor: null,
      currency,
      scale,
      valueState,
      attributionMethod,
      attributionConfidence: input.attributionConfidence ?? "unknown",
      sourceType: input.sourceType,
      sourceRef: input.sourceRef ?? null,
      sourceTimestamp: input.sourceTimestamp ?? null,
      provenance: {},
      isDemo: input.isDemo ?? false,
      createdAt: "",
      updatedAt: "",
    });
    const contributionMinor = preview.contribution?.minor ?? null;
    const profitAfterAllocatedMinor = preview.profitAfterAllocated?.minor ?? null;
    void input.contributionMinor;

    const existing =
      input.sourceRef != null && input.sourceRef !== ""
        ? await this.repository.getFactBySourceRef(scope, input.sourceType, input.sourceRef)
        : null;

    const payload = {
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      dimension_type: input.dimensionType,
      dimension_id: input.dimensionId ?? null,
      dimension_ref: input.dimensionRef ?? null,
      dimension_name: input.dimensionName.trim(),
      revenue_minor: revenueMinor,
      direct_cost_minor: directCostMinor,
      allocated_cost_minor: allocatedCostMinor,
      contribution_minor: contributionMinor,
      profit_after_allocated_minor: profitAfterAllocatedMinor,
      currency,
      scale,
      value_state: valueState,
      attribution_method: attributionMethod,
      attribution_confidence: input.attributionConfidence ?? "unknown",
      source_type: input.sourceType,
      source_ref: input.sourceRef ?? null,
      source_timestamp: input.sourceTimestamp ?? null,
      provenance: asJson({
        ...(input.provenance ?? {}),
        domain: "profit",
        attributionMethod,
        valueState,
        contributionComputed: true,
        allocatedInvented: false,
      }),
      is_demo: input.isDemo ?? false,
      created_by: scope.userId,
    };

    const fact = existing
      ? await this.repository.updateFact(scope, existing.id, payload)
      : await this.repository.insertFact(payload);

    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: existing ? "update" : "create",
      resourceType: "business_os_profit_fact",
      resourceId: fact.id,
      metadata: {
        attributionMethod,
        valueState,
        idempotent: Boolean(existing),
        contributionKnown: contributionMinor != null,
      },
    });
    await this.emit(scope, "business_os.profit.fact_ingested", {
      id: fact.id,
      sourceType: input.sourceType,
      sourceRef: input.sourceRef ?? null,
      attributionMethod,
      idempotent: Boolean(existing),
    });
    await this.publishToOwnerCommand(scope);
    return { fact, created: !existing };
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    await this.customerIntelligence.seedDemo(scope);
    const customers = await this.customerIntelligence.repository.listCustomers(scope);
    const customerFacts = await this.customerIntelligence.repository.listFacts(scope);
    const derived: BusinessProfitFact[] = [];
    for (const fact of customerFacts) {
      const customer = customers.find((row) => row.id === fact.customerId);
      if (!customer) continue;
      const ingested = await this.ingestFact(scope, {
        periodStart: fact.periodStart,
        periodEnd: fact.periodEnd,
        dimensionType: "customer",
        dimensionId: customer.id,
        dimensionRef: customer.sourceRef ? `customer:${customer.sourceRef}` : `customer:${customer.id}`,
        dimensionName: customer.organisationName,
        revenueMinor: fact.revenueMinor,
        directCostMinor: fact.directCostMinor,
        allocatedCostMinor: null,
        currency: fact.currency,
        scale: fact.scale,
        valueState: "actual",
        attributionMethod: "customer_fact",
        attributionConfidence: fact.directCostMinor == null ? "low" : "high",
        sourceType: "customer_financial_fact",
        sourceRef: `derived:customer-fact:${fact.sourceRef ?? fact.id}`,
        sourceTimestamp: fact.updatedAt,
        isDemo: true,
        provenance: {
          fixture: PROFIT_DEMO_FIXTURE,
          source: "customer_intelligence",
          customerFactId: fact.id,
        },
      });
      derived.push(ingested.fact);
    }
    const extras: BusinessProfitFact[] = [];
    for (const item of PROFIT_DEMO_FACTS) {
      extras.push((await this.ingestFact(scope, item)).fact);
    }
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "create",
      resourceType: "business_os_profit_demo",
      resourceId: PROFIT_DEMO_FIXTURE,
      metadata: { fixture: PROFIT_DEMO_FIXTURE, derived: derived.length, extras: extras.length },
    });
    return this.summary(scope);
  }

  async facts(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    return this.repository.listFacts(scope);
  }

  async ranking(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    opts?: { dimensionType?: BusinessProfitDimensionType; by?: ProfitRankBy },
  ): Promise<BusinessProfitRankRow[]> {
    const scope = requireWorkspace(raw);
    const facts = realizedFacts(await this.repository.listFacts(scope)).filter((fact) =>
      opts?.dimensionType ? fact.dimensionType === opts.dimensionType : true,
    );
    return rankProfitFacts(facts, opts?.by ?? "contribution");
  }

  async leakage(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<BusinessProfitLeakageSignal[]> {
    const scope = requireWorkspace(raw);
    const facts = await this.repository.listFacts(scope);
    const concentration = computeProfitConcentration(facts);
    const thresholds = await this.repository.getSettings(scope);
    return detectProfitLeakage({ facts, concentration, thresholds }).signals.map((row) => ({
      ruleId: row.ruleId,
      type: row.type,
      severity: row.severity,
      title: row.title,
      summary: row.summary,
      evidence: row.evidence,
      provenance: row.provenance,
    }));
  }

  async coverage(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    return computeProfitCoverage(await this.repository.listFacts(scope));
  }

  async trends(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    return computeProfitTrends(await this.repository.listFacts(scope));
  }

  async customerProfitability(
    raw: { tenantId: string; workspaceId?: string; userId: string },
  ): Promise<BusinessProfitCustomerView[]> {
    const scope = requireWorkspace(raw);
    const [profitFacts, customers, financialFacts] = await Promise.all([
      this.repository.listFacts(scope),
      this.customerIntelligence.repository.listCustomers(scope),
      this.customerIntelligence.repository.listFacts(scope),
    ]);
    const realized = realizedFacts(profitFacts).filter((fact) => fact.dimensionType === "customer");
    return customers.map((customer) => {
      const fact =
        realized
          .filter((row) => row.dimensionId === customer.id)
          .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0] ?? null;
      const customerFacts = financialFacts.filter((row) => row.customerId === customer.id);
      const latestFinancial = [...customerFacts].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0];
      const metrics = fact
        ? computeFactMetrics(fact)
        : latestFinancial
          ? computeFactMetrics({
              id: latestFinancial.id,
              tenantId: customer.tenantId,
              workspaceId: customer.workspaceId,
              periodStart: latestFinancial.periodStart,
              periodEnd: latestFinancial.periodEnd,
              dimensionType: "customer",
              dimensionId: customer.id,
              dimensionName: customer.organisationName,
              revenueMinor: latestFinancial.revenueMinor,
              directCostMinor: latestFinancial.directCostMinor,
              allocatedCostMinor: null,
              contributionMinor: null,
              profitAfterAllocatedMinor: null,
              currency: latestFinancial.currency,
              scale: latestFinancial.scale,
              valueState: "actual",
              attributionMethod: "customer_fact",
              attributionConfidence: latestFinancial.directCostMinor == null ? "low" : "high",
              sourceType: latestFinancial.sourceType,
              provenance: { source: "customer_intelligence" },
              isDemo: latestFinancial.isDemo,
              createdAt: latestFinancial.createdAt,
              updatedAt: latestFinancial.updatedAt,
            })
          : null;
      const classified = fact ? classifyProfit(fact) : { classification: "unknown" as const };
      const payment = computePaymentBehaviour(customerFacts);
      const unknownReasons = [
        ...(metrics?.unknownReasons ?? (latestFinancial ? [] : ["no_customer_profit_evidence"])),
        "payment_behaviour_excluded_from_profit",
      ];
      return {
        customerId: customer.id,
        organisationName: customer.organisationName,
        revenue: metrics?.revenue ?? null,
        contribution: metrics?.contribution ?? null,
        contributionMarginBps: metrics?.contributionMarginBps ?? null,
        classification: metrics?.contribution ? classified.classification : "unknown",
        paymentOverdueRatioBps: payment.overdueRatioBps,
        healthStatus: customer.customerStatus,
        unknownReasons,
      };
    });
  }

  async summary(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<
    BusinessProfitSummary & { kpis: BusinessKpi[]; health: ReturnType<typeof computeBusinessHealth> }
  > {
    const scope = requireWorkspace(raw);
    const facts = await this.repository.listFacts(scope);
    const realized = realizedFacts(facts);
    const comparable = realized.filter((fact) => fact.currency === realized[0]?.currency && fact.scale === realized[0]?.scale);
    const mixed = new Set(realized.map((row) => row.currency.toUpperCase())).size > 1;
    const coverage = computeProfitCoverage(facts);
    const concentration = computeProfitConcentration(facts);
    const ranking = rankProfitFacts(comparable, "contribution");
    const leakage = await this.leakage(scope);
    const known = mixed ? [] : comparable.filter((fact) => computeFactMetrics(fact).contribution);
    let contributionSum: bigint | null = mixed ? null : 0n;
    let revenueKnown: bigint | null = mixed ? null : 0n;
    if (!mixed) {
      for (const fact of known) {
        const metrics = computeFactMetrics(fact);
        if (metrics.contribution) contributionSum = (contributionSum ?? 0n) + BigInt(metrics.contribution.minor);
        if (metrics.revenue && metrics.contribution) revenueKnown = (revenueKnown ?? 0n) + BigInt(metrics.revenue.minor);
      }
    }
    const contribution =
      contributionSum == null || known.length === 0
        ? null
        : {
            minor: contributionSum.toString(),
            currency: comparable[0]?.currency ?? "AUD",
            scale: comparable[0]?.scale ?? 2,
          };
    const contributionMarginBps =
      contributionSum == null || revenueKnown == null || revenueKnown === 0n
        ? null
        : ((contributionSum * 10000n) / revenueKnown).toString();
    const kpis = (await this.ownerCommand.repository.listKpis(scope)).filter((k) => k.provenance?.domain === "profit");
    return {
      contribution,
      contributionMarginBps,
      coverage,
      negativeContributionCount: known.filter((fact) => BigInt(computeFactMetrics(fact).contribution?.minor ?? "0") < 0n)
        .length,
      lowMarginCount: ranking.filter((row) => row.classification === "low_margin").length,
      concentration,
      ranking,
      leakage,
      proposedCount: facts.filter((fact) => fact.valueState === "proposed").length,
      workOperations: workOperationsProfitStatus(),
      containsDemoData: facts.some((fact) => fact.isDemo),
      disclaimer: DISCLAIMER,
      generatedAt: new Date().toISOString(),
      kpis,
      health: computeBusinessHealth(kpis),
    };
  }

  async explain(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<AiDailyBriefNarrative> {
    const scope = requireWorkspace(raw);
    const summary = await this.summary(scope);
    try {
      const policy = await this.kernel.intelligence.policies.evaluate({
        tenantId: scope.tenantId,
        operatingSystem: "business",
        intent: "profit_intelligence.explain",
        simulation: false,
      });
      if (policy.allowed === false) {
        return emptyNarrative("policy_denied");
      }
      const response = await this.kernel.aiDirector.run({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        message:
          "Explain deterministic profit intelligence for an owner. Do not calculate new profit, invent costs, or allocate overhead. Do not reprice or terminate customers. Proposed values are not realized.",
        context: {
          evidence: {
            kind: "business_os.profit.evidence",
            contributionKnown: summary.contribution != null,
            negativeContributionCount: summary.negativeContributionCount,
            leakageRuleIds: summary.leakage.map((row) => row.ruleId),
            coverageBps: summary.coverage.coverageBps,
            proposedCount: summary.proposedCount,
            workOperationsImplemented: false,
            instructions: [
              "Use only structured evidence.",
              "Do not invent costs or allocate overhead.",
              "Do not present proposed margin as realized profit.",
              "Unknown profitability stays unknown.",
              "Do not recommend autonomous repricing or customer termination.",
            ],
          },
        },
      });
      const text = response.message?.trim() ?? "";
      if (!text) return emptyNarrative("empty_ai_response");
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
      return emptyNarrative("ai_director_unavailable");
    }
  }

  async updateSettings(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    thresholds: Record<string, unknown>,
  ) {
    const scope = requireWorkspace(raw);
    await this.repository.upsertSettings(scope, thresholds, scope.userId);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "update",
      resourceType: "business_os_profit_settings",
      resourceId: scope.workspaceId,
      metadata: { thresholds },
    });
    await this.emit(scope, "business_os.profit.classification_updated", { thresholds });
    await this.publishToOwnerCommand(scope);
    return this.repository.getSettings(scope);
  }

  private async publishToOwnerCommand(scope: OwnerCommandScope) {
    const facts = await this.repository.listFacts(scope);
    const realized = realizedFacts(facts);
    const mixed = new Set(realized.map((row) => row.currency.toUpperCase())).size > 1;
    const comparable = mixed
      ? []
      : realized.filter((fact) => fact.currency === realized[0]?.currency && fact.scale === realized[0]?.scale);
    const coverage = computeProfitCoverage(facts);
    const concentration = computeProfitConcentration(facts);
    const ranking = rankProfitFacts(comparable, "contribution");
    const thresholds = await this.repository.getSettings(scope);
    const detected = detectProfitLeakage({ facts, concentration, thresholds });
    const isDemo = facts.some((fact) => fact.isDemo);
    const known = comparable.filter((fact) => computeFactMetrics(fact).contribution);
    let contributionSum = 0n;
    let revenueKnown = 0n;
    let negativeCount = 0;
    let lowMarginCustomers = 0;
    for (const fact of known) {
      const metrics = computeFactMetrics(fact);
      if (metrics.contribution) contributionSum += BigInt(metrics.contribution.minor);
      if (metrics.revenue) revenueKnown += BigInt(metrics.revenue.minor);
      if (metrics.contribution && BigInt(metrics.contribution.minor) < 0n) negativeCount += 1;
    }
    for (const row of ranking) {
      if (row.dimensionType === "customer" && row.classification === "low_margin") lowMarginCustomers += 1;
    }
    const contributionMargin = revenueKnown > 0n ? (contributionSum * 10000n) / revenueKnown : null;
    const customerShares = concentration.shares.filter((row) => row.dimensionType === "customer");
    const topCustomerShare = customerShares[0]?.shareBps ?? null;
    const deteriorationCount = detected.signals.filter((row) => row.ruleId === "profit.margin_deterioration.v1").length;
    const values: Record<(typeof BUSINESS_PROFIT_KPI_KEYS)[number], number | null> = {
      total_contribution: mixed || known.length === 0 ? null : integerMetric(contributionSum.toString()),
      contribution_margin: mixed ? null : integerMetric(contributionMargin?.toString() ?? null),
      negative_contribution_count: mixed ? null : negativeCount,
      low_margin_customer_count: mixed ? null : lowMarginCustomers,
      top_customer_profit_share: integerMetric(topCustomerShare),
      top5_profit_concentration: integerMetric(concentration.top5ShareBps),
      profit_data_coverage: integerMetric(coverage.coverageBps),
      margin_deterioration_count: mixed ? null : deteriorationCount,
    };
    const extras: Record<string, { warning?: number; critical?: number }> = {
      negative_contribution_count: { warning: 1, critical: 3 },
      low_margin_customer_count: { warning: 1, critical: 3 },
      top_customer_profit_share: {
        warning: BUSINESS_PROFIT_DEFAULT_THRESHOLDS.concentrationTop1WarningBps,
        critical: 7000,
      },
      top5_profit_concentration: {
        warning: BUSINESS_PROFIT_DEFAULT_THRESHOLDS.concentrationTop5WarningBps,
        critical: 9500,
      },
      profit_data_coverage: { warning: 7000, critical: 4000 },
      margin_deterioration_count: { warning: 1, critical: 3 },
    };

    for (const key of BUSINESS_PROFIT_KPI_KEYS) {
      const meta = PROFIT_KPI_META[key];
      await this.ownerCommand.upsertKpi(scope, {
        key,
        name: meta.name,
        category: meta.category,
        unit: meta.unit,
        direction: meta.direction,
        value: values[key] ?? null,
        warningThreshold: extras[key]?.warning ?? null,
        criticalThreshold: extras[key]?.critical ?? null,
        measuredAt: new Date().toISOString(),
        sourceType: isDemo ? "demo" : "derived",
        sourceRef: "profit_intelligence",
        provenance: {
          domain: "profit",
          live: false,
          mixedCurrency: mixed,
        },
        isDemo,
      });
    }

    const existing = await this.ownerCommand.repository.listSignals(scope);
    const recs = await this.ownerCommand.repository.listRecommendations(scope);
    for (const draft of detected.signals) {
      const already = existing.some((s) => s.type === draft.type && s.status === "open");
      if (already) continue;
      const created = await this.ownerCommand.repository.insertSignal(scope, {
        type: draft.type,
        severity: draft.severity,
        title: draft.title,
        summary: draft.summary,
        sourceType: isDemo ? "demo" : "derived",
        sourceRef: "profit_intelligence",
        evidence: draft.evidence,
        provenance: draft.provenance,
        detectedAt: new Date().toISOString(),
        status: "open",
        businessImpact: draft.businessImpact,
        isDemo,
        createdBy: scope.userId,
      });
      await this.emit(scope, "business_os.signal.created", { id: created.id, type: created.type });
      await this.emit(scope, "business_os.profit.leakage_detected", { id: created.id, ruleId: draft.ruleId });
    }
    for (const draft of detected.recommendations) {
      const already = recs.some((r) => r.title === draft.title && r.status === "proposed");
      if (already) continue;
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
        isDemo,
        createdBy: scope.userId,
      });
      await this.emit(scope, "business_os.recommendation.created", { id: created.id });
    }
    await this.emit(scope, "business_os.profit.metrics_updated", { factCount: facts.length });
    await this.emit(scope, "business_os.profit.classification_updated", { version: "profit_classification.v1" });
  }
}

function emptyNarrative(reason: string): AiDailyBriefNarrative {
  return {
    text: "",
    generatedAt: new Date().toISOString(),
    generatedBy: "platform_ai_director",
    evidenceRefs: [],
    advisory: true,
    unavailableReason: reason,
  };
}
