"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  MetricCard,
  SectionHeader,
  StatusChip,
} from "@rtb/ui";
import { AlertTriangle, Landmark } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type { AiDailyBriefNarrative, BusinessFinanceMetrics, MoneyJson } from "@rtb/types";

type FinanceSummary = {
  currentPeriod: { id: string; periodStart: string; periodEnd: string; currency: string; sourceType: string; syncedAt: string; isDemo: boolean } | null;
  snapshot: Record<string, unknown> | null;
  receivables: Record<string, unknown> | null;
  metrics: BusinessFinanceMetrics | null;
  forecast: {
    points: Array<{ offsetMonths: number; kind: string; cash: MoneyJson | null }>;
    assumptions: string[];
    unknownReason?: string;
  } | null;
  health: { overallStatus: string; score: number | null; contributingKpiCount: number; unknownCount: number };
  completeness: { knownFieldCount: number; trackedFieldCount: number; missingFieldCount: number; receivablesPresent: boolean };
  containsDemoData: boolean;
  disclaimer?: string;
  narrative?: AiDailyBriefNarrative | null;
};

type FinanceTrend = {
  unknownReason?: string;
  points: Array<{
    periodStart: string;
    periodEnd: string;
    currency: string;
    revenueMinor: string | null;
    grossProfit: MoneyJson | null;
    grossMarginBps: string | null;
    cashMinor: string | null;
  }>;
};

function moneyLabel(value: MoneyJson | null | undefined, fallback = "Unknown"): string {
  if (!value || value.minor === "") return fallback;
  const scale = value.scale ?? 2;
  const denom = 10 ** scale;
  const major = Number(value.minor) / denom;
  if (!Number.isFinite(major)) return fallback;
  return `${value.currency} ${major.toLocaleString(undefined, { minimumFractionDigits: scale, maximumFractionDigits: scale })}`;
}

function snapshotMoney(
  snapshot: Record<string, unknown> | null | undefined,
  key: string,
  metrics: BusinessFinanceMetrics | null | undefined,
): MoneyJson | null {
  const minor = snapshot?.[key];
  if (!metrics || minor === null || minor === undefined || minor === "") return null;
  return { minor: String(minor), currency: metrics.currency, scale: metrics.scale };
}

function bpsLabel(value: string | null | undefined): string {
  if (value === null || value === undefined) return "Unknown";
  return `${(Number(value) / 100).toFixed(2)}%`;
}

export default function FinancialIntelligencePage() {
  const [data, setData] = useState<FinanceSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signals, setSignals] = useState<Array<{ id: string; title: string; severity: string; summary: string; isDemo?: boolean }>>([]);
  const [recs, setRecs] = useState<Array<{ id: string; title: string; rationaleSummary: string; confidence: string }>>([]);
  const [trends, setTrends] = useState<FinanceTrend | null>(null);

  const load = useCallback(async () => {
    const [summary, command, trend] = await Promise.all([
      parseApiJsonResponse<FinanceSummary>(await fetch("/api/business/finance")),
      parseApiJsonResponse<{
        signals: Array<{ id: string; title: string; severity: string; summary: string; isDemo?: boolean; type?: string }>;
        recommendations: Array<{ id: string; title: string; rationaleSummary: string; confidence: string }>;
      }>(await fetch("/api/business/command")),
      parseApiJsonResponse<FinanceTrend>(await fetch("/api/business/finance/trends")),
    ]);
    if (!summary.ok) {
      setError(summary.errorMessage ?? "Access denied");
      setData(null);
      return;
    }
    setError(null);
    setData(summary.data);
    setTrends(trend.ok ? trend.data : null);
    const financeSignals = (command.data?.signals ?? []).filter((s) => (s.type ?? "").startsWith("finance."));
    setSignals(financeSignals);
    setRecs((command.data?.recommendations ?? []).filter((r) => /receivable|margin|expense|cash|budget|revenue/i.test(r.title)));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedDemo() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/finance/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to load demo fixtures");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  async function explain() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse<FinanceSummary>(
        await fetch("/api/business/finance?narrative=true"),
      );
      if (!parsed.ok) setError(parsed.errorMessage ?? "Explain unavailable");
      else setData(parsed.data);
    } finally {
      setBusy(false);
    }
  }

  const metrics = data?.metrics;
  const runway =
    metrics?.cashRunwayMonthHundredths == null
      ? "Unknown"
      : `${(Number(metrics.cashRunwayMonthHundredths) / 100).toFixed(2)} months`;

  return (
    <>
      <Header
        title="Financial Intelligence"
        description="Management view of ingested snapshots — not a statutory ledger"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="bos-finance-shell">
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}
        {data?.containsDemoData && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Demo finance fixtures are loaded. These values are not connected to live accounting systems.
          </div>
        )}

        <section className="mb-8" data-testid="bos-finance-summary">
          <SectionHeader title="Financial summary" description="Deterministic metrics from the latest ingested period." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Revenue" value={moneyLabel(snapshotMoney(data?.snapshot, "revenueMinor", metrics))} tone="blue" />
            <MetricCard label="Gross profit" value={moneyLabel(metrics?.grossProfit)} tone="green" />
            <MetricCard label="Gross margin" value={bpsLabel(metrics?.grossMarginBps)} tone="green" />
            <MetricCard label="Operating profit" value={moneyLabel(metrics?.operatingProfit)} tone="blue" />
            <MetricCard label="Cash" value={moneyLabel(snapshotMoney(data?.snapshot, "cashMinor", metrics))} tone="slate" />
            <MetricCard label="Receivables outstanding" value={moneyLabel(metrics?.receivablesOutstanding)} tone="amber" />
          </div>
          <p className="mt-3 text-sm text-slate-600">{metrics?.disclaimer ?? data?.disclaimer}</p>
        </section>

        <section className="mb-8" data-testid="bos-finance-trend">
          <SectionHeader title="Trend" description="Period comparisons for ingested snapshots in a single currency." />
          <Card className="mt-4">
            <CardContent className="space-y-2 p-4 text-sm text-slate-700">
              {trends?.unknownReason && <p>Trend unknown: {trends.unknownReason.replaceAll("_", " ")}</p>}
              {(trends?.points ?? []).map((point) => (
                <p key={`${point.periodStart}-${point.periodEnd}`}>
                  {point.periodStart} → {point.periodEnd}: revenue{" "}
                  {moneyLabel(
                    point.revenueMinor
                      ? { minor: point.revenueMinor, currency: point.currency, scale: metrics?.scale ?? 2 }
                      : null,
                  )}
                  ; gross profit {moneyLabel(point.grossProfit)}; gross margin {bpsLabel(point.grossMarginBps)}; cash{" "}
                  {moneyLabel(
                    point.cashMinor
                      ? { minor: point.cashMinor, currency: point.currency, scale: metrics?.scale ?? 2 }
                      : null,
                  )}
                </p>
              ))}
              {(trends?.points ?? []).length === 0 && !trends?.unknownReason && <p>Unknown — no comparable periods.</p>}
            </CardContent>
          </Card>
        </section>

        <section className="mb-8" data-testid="bos-finance-cash">
          <SectionHeader title="Cash" description="Observed cash, deterministic forecast, and runway only when burn evidence exists." />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Runway</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm text-slate-600">
                <p>{runway}</p>
                {(metrics?.unknownReasons ?? []).filter((r) => r.startsWith("cash_runway")).map((r) => (
                  <p key={r}>{r.replaceAll("_", " ")}</p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Forecast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0 text-sm text-slate-600">
                {data?.forecast?.unknownReason && <p>Forecast unknown: {data.forecast.unknownReason}</p>}
                {(data?.forecast?.points ?? []).map((p) => (
                  <p key={p.offsetMonths}>
                    {p.kind === "observed" ? "Observed" : `+${p.offsetMonths} month forecast`}: {moneyLabel(p.cash)}
                  </p>
                ))}
                <p className="text-xs text-slate-500">{(data?.forecast?.assumptions ?? []).slice(0, 3).join(" ")}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-8" data-testid="bos-finance-receivables">
          <SectionHeader title="Receivables" description="Ageing is a management rollup, not an invoicing subsystem." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="Outstanding" value={moneyLabel(metrics?.receivablesOutstanding)} />
            <MetricCard label="Overdue" value={moneyLabel(metrics?.receivablesOverdue)} tone="amber" />
            <MetricCard label="Overdue share" value={bpsLabel(metrics?.receivablesOverdueBps)} tone="amber" />
          </div>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-5">
            <p>Current: {moneyLabel(metrics?.ageing?.current)}</p>
            <p>1–30: {moneyLabel(metrics?.ageing?.days1to30)}</p>
            <p>31–60: {moneyLabel(metrics?.ageing?.days31to60)}</p>
            <p>61–90: {moneyLabel(metrics?.ageing?.days61to90)}</p>
            <p>90+: {moneyLabel(metrics?.ageing?.days90Plus)}</p>
          </div>
        </section>

        <section className="mb-8" data-testid="bos-finance-budget">
          <SectionHeader title="Budget vs actual" description="Shown only where budget figures were ingested." />
          <Card className="mt-4">
            <CardContent className="space-y-2 p-4 text-sm text-slate-700">
              <p>Revenue variance: {moneyLabel(metrics?.budgetRevenueVariance)} ({bpsLabel(metrics?.budgetRevenueVarianceBps)})</p>
              <p>Expense variance: {moneyLabel(metrics?.budgetExpenseVariance)}</p>
              <p>Profit variance: {moneyLabel(metrics?.budgetProfitVariance)}</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8" data-testid="bos-finance-attention">
          <SectionHeader title="Financial attention" description="Signals and recommendations reuse Owner Command primitives." />
          <div className="mt-4 space-y-3">
            {signals.map((signal) => (
              <Card key={signal.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {signal.title}
                  </CardTitle>
                  <StatusChip value={signal.severity} />
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">
                  <p>{signal.summary}</p>
                  {signal.isDemo && <Badge variant="secondary">Demo</Badge>}
                </CardContent>
              </Card>
            ))}
            {recs.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">{rec.title}</p>
                  <p>{rec.rationaleSummary}</p>
                  <p>Confidence: {rec.confidence}</p>
                </CardContent>
              </Card>
            ))}
            {signals.length === 0 && recs.length === 0 && (
              <EmptyState title="No finance attention" description="Ingest a snapshot or load demo fixtures." icon={<Landmark className="h-5 w-5" />} />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-finance-quality">
          <SectionHeader title="Data quality" description="Unknown values stay unknown. No FX conversion." />
          <Card className="mt-4">
            <CardContent className="space-y-2 p-4 text-sm text-slate-700">
              <p>Source: {data?.currentPeriod?.sourceType ?? "Unknown"}</p>
              <p>Last sync: {data?.currentPeriod?.syncedAt ?? "Unknown"}</p>
              <p>Currency: {data?.currentPeriod?.currency ?? "Unknown"}</p>
              <p>
                Completeness: {data?.completeness.knownFieldCount ?? 0}/{data?.completeness.trackedFieldCount ?? 8} snapshot fields
                {data?.completeness.receivablesPresent ? "; receivables present" : "; receivables missing"}
              </p>
              <p>Missing fields: {data?.completeness.missingFieldCount ?? "Unknown"}</p>
              <p>Finance health contribution: {data?.health.overallStatus ?? "unknown"} (not a second Business Health score)</p>
              {(metrics?.unknownReasons ?? []).slice(0, 6).map((reason) => (
                <p key={reason}>Unknown: {reason.replaceAll("_", " ")}</p>
              ))}
            </CardContent>
          </Card>
        </section>

        {data?.narrative && !data.narrative.unavailableReason && (
          <p className="mb-6 text-sm text-slate-700">{data.narrative.text}</p>
        )}
        {data?.narrative?.unavailableReason && (
          <p className="mb-6 text-sm text-slate-600">
            AI explanation unavailable ({data.narrative.unavailableReason}). Deterministic metrics remain in effect.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled={busy} onClick={() => void seedDemo()}>
            Load finance demo fixtures
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => void explain()}>
            Explain with AI Director
          </Button>
          <Link href="/business" className="text-sm font-semibold text-blue-700 hover:underline">
            Back to Owner Command
          </Link>
        </div>
      </PageMain>
    </>
  );
}
