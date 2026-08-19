"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { AlertTriangle, PieChart } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type {
  AiDailyBriefNarrative,
  BusinessProfitConcentration,
  BusinessProfitCoverage,
  BusinessProfitLeakageSignal,
  BusinessProfitRankRow,
  BusinessProfitSummary,
  BusinessProfitTrend,
  MoneyJson,
} from "@rtb/types";

type ProfitPageData = BusinessProfitSummary & {
  narrative?: AiDailyBriefNarrative | null;
  trends?: BusinessProfitTrend[];
};

const RANK_VIEWS = [
  { id: "customer", label: "Customers" },
  { id: "segment", label: "Segments" },
  { id: "opportunity", label: "Opportunities" },
  { id: "other", label: "Other" },
] as const;

function moneyLabel(value: MoneyJson | null | undefined, fallback = "Unknown"): string {
  if (!value || value.minor === "") return fallback;
  const scale = value.scale ?? 2;
  const denom = 10 ** scale;
  const major = Number(value.minor) / denom;
  if (!Number.isFinite(major)) return fallback;
  return `${value.currency} ${major.toLocaleString(undefined, { minimumFractionDigits: scale, maximumFractionDigits: scale })}`;
}

function bpsLabel(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "Unknown";
  return `${(Number(value) / 100).toFixed(2)}%`;
}

export default function ProfitIntelligencePage() {
  const [data, setData] = useState<ProfitPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<(typeof RANK_VIEWS)[number]["id"]>("customer");
  const [signals, setSignals] = useState<Array<{ id: string; title: string; severity: string; summary: string; type?: string }>>([]);
  const [recs, setRecs] = useState<Array<{ id: string; title: string; rationaleSummary: string; confidence: string }>>([]);

  const load = useCallback(async () => {
    const [summary, trends, command] = await Promise.all([
      parseApiJsonResponse<ProfitPageData>(await fetch("/api/business/profit")),
      parseApiJsonResponse<BusinessProfitTrend[]>(await fetch("/api/business/profit/trends")),
      parseApiJsonResponse<{
        signals: Array<{ id: string; title: string; severity: string; summary: string; type?: string }>;
        recommendations: Array<{ id: string; title: string; rationaleSummary: string; confidence: string }>;
      }>(await fetch("/api/business/command")),
    ]);
    if (!summary.ok || !summary.data) {
      setError(summary.errorMessage ?? "Access denied");
      setData(null);
      return;
    }
    setError(null);
    setData({ ...summary.data, trends: trends.ok && trends.data ? trends.data : [] });
    setSignals((command.data?.signals ?? []).filter((s) => (s.type ?? "").startsWith("profit.")));
    setRecs(
      (command.data?.recommendations ?? []).filter((r) =>
        /profit|margin|contribution|cost attribution|cost capture|reprice|concentration/i.test(r.title),
      ),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedDemo() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/profit/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to load demo fixtures");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  async function explain() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse<ProfitPageData>(await fetch("/api/business/profit?narrative=true"));
      if (!parsed.ok || !parsed.data) setError(parsed.errorMessage ?? "Explain unavailable");
      else {
        const next = parsed.data;
        setData((current) => ({ ...next, trends: current?.trends ?? [] }));
      }
    } finally {
      setBusy(false);
    }
  }

  const ranking = useMemo(() => {
    const rows = data?.ranking ?? [];
    if (view === "other") {
      return rows.filter((row) => !["customer", "segment", "opportunity"].includes(row.dimensionType));
    }
    return rows.filter((row) => row.dimensionType === view);
  }, [data?.ranking, view]);

  const coverage: BusinessProfitCoverage | undefined = data?.coverage;
  const concentration: BusinessProfitConcentration | undefined = data?.concentration;
  const leakage: BusinessProfitLeakageSignal[] = data?.leakage ?? [];

  return (
    <>
      <Header
        title="Profit Intelligence"
        description="Evidence-backed contribution and margin by business dimension — not a general ledger, cost-accounting subsystem, or Profit Command optimizer"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="bos-profit-shell">
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}
        {data?.containsDemoData && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Demo profit fixtures are loaded. Proposed values are not realized profit. Unknown profitability is not shown as zero.
          </div>
        )}

        <section className="mb-8" data-testid="bos-profit-summary">
          <SectionHeader
            title="Profit summary"
            description="Contribution requires known revenue and direct cost. Allocated cost is never invented."
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Contribution" value={moneyLabel(data?.contribution ?? null)} tone="green" />
            <MetricCard label="Contribution margin" value={bpsLabel(data?.contributionMarginBps)} tone="blue" />
            <MetricCard label="Known cost coverage" value={bpsLabel(coverage?.coverageBps)} tone="slate" />
            <MetricCard label="Negative-contribution items" value={String(data?.negativeContributionCount ?? 0)} tone="red" />
            <MetricCard label="Low-margin items" value={String(data?.lowMarginCount ?? 0)} tone="amber" />
            <MetricCard label="Top 5 profit concentration" value={bpsLabel(concentration?.top5ShareBps)} tone="amber" />
          </div>
          <p className="mt-3 text-sm text-slate-600">{data?.disclaimer}</p>
          <p className="mt-1 text-sm text-slate-600">
            Work & Operations labour/delivery cost: {data?.workOperations?.reason ?? "work_operations_not_implemented"}
          </p>
        </section>

        <section className="mb-8" data-testid="bos-profit-ranking">
          <SectionHeader
            title="Profitability ranking"
            description="Revenue, cost, contribution, and margin are shown separately. High revenue does not imply high profit."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {RANK_VIEWS.map((tab) => (
              <Button key={tab.id} size="sm" variant={view === tab.id ? "default" : "outline"} onClick={() => setView(tab.id)}>
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {ranking.map((row: BusinessProfitRankRow) => (
              <Card key={row.factId}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">{row.dimensionName}</CardTitle>
                  <StatusChip value={row.classification} />
                </CardHeader>
                <CardContent className="space-y-1 p-4 pt-0 text-sm text-slate-600">
                  <p>Revenue: {moneyLabel(row.revenue)}</p>
                  <p>Direct cost: {moneyLabel(row.directCost)}</p>
                  <p>Contribution: {moneyLabel(row.contribution)}</p>
                  <p>Margin: {bpsLabel(row.contributionMarginBps)}</p>
                  <p>Attribution: {row.attributionMethod}</p>
                  <p>Value state: {row.valueState} — proposed is not realized</p>
                  <p>Evidence: {row.evidenceQuality.join(", ") || "Known components"}</p>
                  {row.rankingUnknownReason && <p>Ranking: {row.rankingUnknownReason}</p>}
                </CardContent>
              </Card>
            ))}
            {ranking.length === 0 && (
              <EmptyState
                title="No ranking for this view"
                description="Unsupported profitability is not shown as zero."
                icon={<PieChart className="h-5 w-5" />}
              />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-profit-leakage">
          <SectionHeader title="Profit leakage" description="Deterministic, evidence-backed rules only. Overdue receivables are not treated as profit leakage." />
          <div className="mt-4 space-y-3">
            {leakage.map((row) => (
              <Card key={`${row.ruleId}-${row.title}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">{row.title}</CardTitle>
                  <StatusChip value={row.severity} />
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">
                  <p>{row.summary}</p>
                  <p>Rule: {row.ruleId}</p>
                </CardContent>
              </Card>
            ))}
            {leakage.length === 0 && (
              <EmptyState title="No leakage signals" description="Leakage appears only when sourced evidence supports a published rule." />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-profit-trends">
          <SectionHeader title="Trends" description="Comparable periods and currencies only." />
          <div className="mt-4 space-y-3">
            {(data?.trends ?? []).map((trend) => (
              <Card key={`${trend.dimensionType}:${trend.dimensionRef}`}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">{trend.dimensionName}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">
                  {trend.comparable ? (
                    trend.points.map((point) => (
                      <p key={point.periodEnd}>
                        {point.periodEnd}: {moneyLabel(point.contribution)} / {bpsLabel(point.contributionMarginBps)}
                      </p>
                    ))
                  ) : (
                    <p>Unknown — {trend.unknownReasons.join(", ") || "not comparable"}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {(data?.trends ?? []).length === 0 && (
              <EmptyState title="No comparable trends" description="Trends require at least two realized periods in one currency." />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-profit-coverage">
          <SectionHeader title="Data coverage" description="Revenue without known cost stays unknown. Attribution method is always exposed." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Card>
              <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                <p>Revenue with known cost: {moneyLabel(coverage?.revenueWithKnownCost ?? null)}</p>
                <p>Revenue without known cost: {moneyLabel(coverage?.revenueWithoutKnownCost ?? null)}</p>
                <p>Stale facts: {coverage?.staleFactCount ?? 0}</p>
                <p>Attribution methods: {JSON.stringify(coverage?.attributionMethods ?? {})}</p>
                <p>Unknown reasons: {coverage?.unknownReasons.join(", ") || "None"}</p>
                <p>Proposed facts kept separate: {data?.proposedCount ?? 0}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-8" data-testid="bos-profit-attention">
          <SectionHeader title="Attention" description="Signals and recommendations reuse Owner Command. Advisory only — no autonomous repricing or customer action." />
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
              <EmptyState title="No profit attention items" description="Attention items appear when deterministic leakage or concentration rules fire." />
            )}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled={busy} onClick={() => void seedDemo()}>
            Load demo fixtures
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void explain()}>
            Explain with AI Director
          </Button>
          {data?.containsDemoData && <Badge variant="secondary">Demo</Badge>}
        </div>
        {data?.narrative?.text && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">{data.narrative.text}</p>
        )}
      </PageMain>
    </>
  );
}
