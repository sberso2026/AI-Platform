import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import type {
  AiDailyBriefNarrative,
  BusinessFinanceForecast,
  BusinessFinanceIngestInput,
  BusinessFinanceMetrics,
  BusinessHealthSnapshot,
  BusinessKpi,
  BusinessKpiCategory,
} from "@rtb/types";
import { BUSINESS_FINANCE_DEFAULT_THRESHOLDS, BUSINESS_OS_EVENT_TYPES } from "@rtb/types";
import { computeBusinessHealth } from "../owner-command/health";
import type { OwnerCommandService, OwnerCommandScope } from "../owner-command/service";
import { FinanceRepository } from "./repository";
import { computeFinanceMetrics, revenueGrowthBps } from "./metrics";
import { forecastCash } from "./forecast";
import { detectFinanceSignals } from "./signals";
import { FINANCE_DEMO_PERIODS } from "./demo";
import { toSafeNumber } from "./money";

function integerMetric(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  return toSafeNumber(BigInt(value));
}

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

const FINANCE_KPI_META: Record<
  string,
  { name: string; category: BusinessKpiCategory; unit: string; direction: BusinessKpi["direction"] }
> = {
  revenue: { name: "Revenue", category: "revenue", unit: "minor", direction: "higher_is_better" },
  revenue_growth: { name: "Revenue growth", category: "revenue", unit: "bps", direction: "higher_is_better" },
  cash_position: { name: "Cash position", category: "cash", unit: "minor", direction: "higher_is_better" },
  gross_margin: { name: "Gross margin", category: "margin", unit: "bps", direction: "higher_is_better" },
  operating_margin: { name: "Operating margin", category: "margin", unit: "bps", direction: "higher_is_better" },
  overdue_receivables: {
    name: "Overdue receivables",
    category: "receivables",
    unit: "minor",
    direction: "lower_is_better",
  },
  budget_variance: { name: "Budget variance", category: "operations", unit: "bps", direction: "higher_is_better" },
  cash_runway: { name: "Cash runway", category: "cash", unit: "month_hundredths", direction: "higher_is_better" },
};

export class FinancialIntelligenceService {
  readonly repository: FinanceRepository;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    private readonly ownerCommand: OwnerCommandService,
  ) {
    this.repository = new FinanceRepository(supabase);
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
      // Persistence of events must not fail closed the finance mutation.
    }
  }

  async ingest(raw: { tenantId: string; workspaceId?: string; userId: string }, input: BusinessFinanceIngestInput) {
    const scope = requireWorkspace(raw);
    const result = await this.repository.ingest(scope, input, scope.userId);
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: result.created ? "create" : "update",
      resourceType: "business_os_finance_snapshot",
      resourceId: result.snapshot.id,
      metadata: {
        periodId: result.period.id,
        sourceType: input.sourceType,
        currency: result.period.currency,
        idempotent: !result.created,
      },
    });
    await this.emit(scope, "business_os.finance.snapshot_ingested", {
      periodId: result.period.id,
      snapshotId: result.snapshot.id,
      created: result.created,
    });
    await this.publishToOwnerCommand(scope);
    return result;
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const ingested = [];
    for (const period of FINANCE_DEMO_PERIODS) {
      ingested.push(await this.ingest(scope, period));
    }
    await this.audit.log({
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      userId: scope.userId,
      action: "create",
      resourceType: "business_os_finance_demo",
      resourceId: "bos-2-financial-intelligence",
      metadata: { fixture: "bos-2-financial-intelligence", periods: FINANCE_DEMO_PERIODS.length },
    });
    return { ingested, isDemo: true as const };
  }

  async summary(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const { current, previous, currentPeriod, receivables, metrics, previousMetrics, forecast, completeness } =
      await this.bundle(scope);
    const financeKpis = (await this.ownerCommand.repository.listKpis(scope)).filter(
      (k) => k.provenance?.domain === "finance",
    );
    const health = this.financeHealthContribution(financeKpis);
    return {
      currentPeriod,
      previousPeriod: previous ? { id: previous.periodId } : null,
      snapshot: current,
      receivables,
      metrics,
      previousMetrics,
      forecast,
      health,
      completeness,
      containsDemoData: Boolean(current?.isDemo || currentPeriod?.isDemo),
      disclaimer: metrics?.disclaimer,
    };
  }

  async periods(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    return this.repository.listPeriods(requireWorkspace(raw));
  }

  async receivables(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const bundle = await this.bundle(scope);
    return {
      current: bundle.receivables,
      metrics: bundle.metrics
        ? {
            outstanding: bundle.metrics.receivablesOutstanding,
            overdue: bundle.metrics.receivablesOverdue,
            overdueBps: bundle.metrics.receivablesOverdueBps,
            ageing: bundle.metrics.ageing,
          }
        : null,
    };
  }

  async trends(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const periods = await this.repository.listPeriods(scope);
    const snapshots = await this.repository.listSnapshots(scope);
    const recvs = await this.repository.listReceivables(scope);
    const byPeriod = new Map(snapshots.map((s) => [s.periodId, s]));
    const recvByPeriod = new Map(recvs.map((r) => [r.periodId, r]));
    const ordered = [...periods].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
    if (ordered.some((p, i) => i > 0 && p.currency !== ordered[0].currency)) {
      return { points: [], unknownReason: "currency_mismatch" as const };
    }
    return {
      points: ordered.map((period) => {
        const snapshot = byPeriod.get(period.id) ?? null;
        const metrics = snapshot
          ? computeFinanceMetrics(snapshot, recvByPeriod.get(period.id) ?? null, period)
          : null;
        return {
          periodId: period.id,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          currency: period.currency,
          revenueMinor: snapshot?.revenueMinor ?? null,
          grossProfit: metrics?.grossProfit ?? null,
          grossMarginBps: metrics?.grossMarginBps ?? null,
          operatingProfit: metrics?.operatingProfit ?? null,
          cashMinor: snapshot?.cashMinor ?? null,
        };
      }),
    };
  }

  async forecast(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<BusinessFinanceForecast> {
    const bundle = await this.bundle(requireWorkspace(raw));
    return bundle.forecast;
  }

  async health(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<BusinessHealthSnapshot> {
    const scope = requireWorkspace(raw);
    const kpis = (await this.ownerCommand.repository.listKpis(scope)).filter(
      (k) => k.provenance?.domain === "finance",
    );
    return this.financeHealthContribution(kpis);
  }

  async explain(raw: { tenantId: string; workspaceId?: string; userId: string }): Promise<AiDailyBriefNarrative> {
    const scope = requireWorkspace(raw);
    const summary = await this.summary(scope);
    const evidence = {
      kind: "business_os.finance.evidence",
      metrics: summary.metrics,
      forecast: summary.forecast,
      completeness: summary.completeness,
      containsDemoData: summary.containsDemoData,
      instructions: [
        "Use only the structured finance evidence.",
        "Do not calculate new financial figures.",
        "Do not invent transactions, causes, or missing amounts.",
        "Do not propose journals, payments, or accounting entries.",
        "If a value is unknown, say it is unknown.",
        "Do not expose chain-of-thought.",
      ],
    };
    try {
      const policy = await this.kernel.intelligence.policies.evaluate({
        tenantId: scope.tenantId,
        operatingSystem: "business",
        intent: "financial_intelligence.explain",
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
          "Summarise the structured financial intelligence for an owner. Do not calculate new numbers or invent causes. Do not expose chain-of-thought.",
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

  financeHealthContribution(kpis: BusinessKpi[]): BusinessHealthSnapshot {
    return computeBusinessHealth(kpis);
  }

  private async bundle(scope: OwnerCommandScope) {
    const periods = await this.repository.listPeriods(scope);
    const snapshots = await this.repository.listSnapshots(scope);
    const recvs = await this.repository.listReceivables(scope);
    const ordered = [...periods].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
    const currentPeriod = ordered[0] ?? null;
    const previousPeriod = ordered[1] ?? null;
    const current = currentPeriod ? snapshots.find((s) => s.periodId === currentPeriod.id) ?? null : null;
    const previous = previousPeriod ? snapshots.find((s) => s.periodId === previousPeriod.id) ?? null : null;
    const receivables = currentPeriod ? recvs.find((r) => r.periodId === currentPeriod.id) ?? null : null;
    const metrics =
      current && currentPeriod ? computeFinanceMetrics(current, receivables, currentPeriod) : null;
    const previousRecv = previousPeriod ? recvs.find((r) => r.periodId === previousPeriod.id) ?? null : null;
    const previousMetrics =
      previous && previousPeriod ? computeFinanceMetrics(previous, previousRecv, previousPeriod) : null;
    const forecast = forecastCash(current, currentPeriod);
    const completeness = this.completeness(current, receivables);
    return {
      currentPeriod,
      previousPeriod,
      current,
      previous,
      receivables,
      metrics,
      previousMetrics,
      forecast,
      completeness,
    };
  }

  private completeness(
    snapshot: {
      revenueMinor: string | null;
      costOfSalesMinor: string | null;
      operatingExpensesMinor: string | null;
      cashMinor: string | null;
      accountsReceivableMinor: string | null;
      accountsPayableMinor: string | null;
      budgetRevenueMinor: string | null;
      budgetExpensesMinor: string | null;
    } | null,
    receivables: unknown,
  ) {
    const fields = snapshot
      ? [
          snapshot.revenueMinor,
          snapshot.costOfSalesMinor,
          snapshot.operatingExpensesMinor,
          snapshot.cashMinor,
          snapshot.accountsReceivableMinor,
          snapshot.accountsPayableMinor,
          snapshot.budgetRevenueMinor,
          snapshot.budgetExpensesMinor,
        ]
      : [];
    const known = fields.filter((v) => v !== null).length;
    return {
      knownFieldCount: known,
      trackedFieldCount: 8,
      receivablesPresent: Boolean(receivables),
      missingFieldCount: snapshot ? 8 - known : 8,
    };
  }

  private async publishToOwnerCommand(scope: OwnerCommandScope) {
    const bundle = await this.bundle(scope);
    if (!bundle.current || !bundle.metrics || !bundle.currentPeriod) return;

    const growth = revenueGrowthBps(bundle.current, bundle.previous);
    const values: Record<string, number | null> = {
      revenue: integerMetric(bundle.current.revenueMinor),
      revenue_growth: growth === null ? null : toSafeNumber(growth),
      cash_position: integerMetric(bundle.current.cashMinor),
      gross_margin: integerMetric(bundle.metrics.grossMarginBps),
      operating_margin: integerMetric(bundle.metrics.operatingMarginBps),
      overdue_receivables: integerMetric(bundle.metrics.receivablesOverdue?.minor),
      budget_variance: integerMetric(bundle.metrics.budgetRevenueVarianceBps),
      cash_runway: integerMetric(bundle.metrics.cashRunwayMonthHundredths),
    };

    const t = BUSINESS_FINANCE_DEFAULT_THRESHOLDS;
    const extras: Record<string, { target?: number; warning?: number; critical?: number }> = {
      gross_margin: { target: 1800, warning: t.grossMarginWarningBps, critical: t.grossMarginCriticalBps },
      operating_margin: {
        target: 1000,
        warning: t.operatingMarginWarningBps,
        critical: t.operatingMarginCriticalBps,
      },
      cash_runway: {
        target: 900,
        warning: t.cashRunwayWarningMonthHundredths,
        critical: t.cashRunwayCriticalMonthHundredths,
      },
    };

    for (const [key, meta] of Object.entries(FINANCE_KPI_META)) {
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
        measuredAt: bundle.current.syncedAt,
        sourceType: bundle.current.isDemo ? "demo" : "derived",
        sourceRef: bundle.current.id,
        provenance: {
          domain: "finance",
          currency: bundle.current.currency,
          scale: bundle.current.scale,
          periodId: bundle.current.periodId,
          live: false,
        },
        isDemo: bundle.current.isDemo,
      });
    }

    await this.emit(scope, "business_os.finance.metrics_updated", {
      snapshotId: bundle.current.id,
      periodId: bundle.current.periodId,
    });

    const detected = detectFinanceSignals({
      current: bundle.current,
      previous: bundle.previous,
      metrics: bundle.metrics,
      previousMetrics: bundle.previousMetrics,
    });
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
        sourceType: bundle.current.isDemo ? "demo" : "derived",
        sourceRef: bundle.current.id,
        evidence: draft.evidence,
        provenance: draft.provenance,
        detectedAt: bundle.current.syncedAt,
        status: "open",
        businessImpact: draft.businessImpact,
        isDemo: bundle.current.isDemo,
        createdBy: scope.userId,
      });
      await this.emit(scope, "business_os.signal.created", { id: created.id, type: created.type });
      await this.emit(scope, "business_os.finance.signal_detected", {
        id: created.id,
        ruleId: draft.ruleId,
      });
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
        isDemo: bundle.current.isDemo,
        createdBy: scope.userId,
      });
      await this.emit(scope, "business_os.recommendation.created", { id: created.id });
    }
  }
}
