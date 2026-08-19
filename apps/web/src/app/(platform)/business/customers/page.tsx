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
import { AlertTriangle, Users } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type {
  AiDailyBriefNarrative,
  BusinessCustomer,
  BusinessCustomerConcentration,
  BusinessCustomerHealth,
  MoneyJson,
} from "@rtb/types";

type ListRow = {
  customer: BusinessCustomer;
  status: string;
  relationshipOwner: string | null;
  revenueMinor: string | null;
  currency: string | null;
  health: BusinessCustomerHealth | null;
  outstanding: MoneyJson | null;
  overdue: MoneyJson | null;
  openOpportunities: number;
  freshness: string;
};

type CustomerSummary = {
  customers: BusinessCustomer[];
  listRows: ListRow[];
  concentration: BusinessCustomerConcentration;
  metrics: {
    activeCustomers: number;
    newCustomers: number;
    customersAtRisk: number;
    customerRevenueMinor: string | null;
    overdueCustomerReceivablesMinor: string | null;
    customerHealthCoverageBps: number | null;
    currency: string | null;
  };
  containsDemoData: boolean;
  disclaimer?: string;
  narrative?: AiDailyBriefNarrative | null;
  renewal?: { available: false; reason: string };
  expansion?: { available: false; reason: string };
};

function moneyLabel(value: MoneyJson | null | undefined, fallback = "Unknown"): string {
  if (!value || value.minor === "") return fallback;
  const scale = value.scale ?? 2;
  const denom = 10 ** scale;
  const major = Number(value.minor) / denom;
  if (!Number.isFinite(major)) return fallback;
  return `${value.currency} ${major.toLocaleString(undefined, { minimumFractionDigits: scale, maximumFractionDigits: scale })}`;
}

function minorLabel(minor: string | null | undefined, currency: string | null, fallback = "Unknown"): string {
  if (minor === null || minor === undefined || !currency) return fallback;
  return moneyLabel({ minor, currency, scale: 2 }, fallback);
}

function bpsLabel(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "Unknown";
  return `${(Number(value) / 100).toFixed(2)}%`;
}

export default function CustomerIntelligencePage() {
  const [data, setData] = useState<CustomerSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signals, setSignals] = useState<Array<{ id: string; title: string; severity: string; summary: string; type?: string }>>([]);
  const [recs, setRecs] = useState<Array<{ id: string; title: string; rationaleSummary: string; confidence: string }>>([]);

  const load = useCallback(async () => {
    const [summary, command] = await Promise.all([
      parseApiJsonResponse<CustomerSummary>(await fetch("/api/business/customers")),
      parseApiJsonResponse<{
        signals: Array<{ id: string; title: string; severity: string; summary: string; type?: string }>;
        recommendations: Array<{ id: string; title: string; rationaleSummary: string; confidence: string }>;
      }>(await fetch("/api/business/command")),
    ]);
    if (!summary.ok) {
      setError(summary.errorMessage ?? "Access denied");
      setData(null);
      return;
    }
    setError(null);
    setData(summary.data);
    setSignals((command.data?.signals ?? []).filter((s) => (s.type ?? "").startsWith("customer.")));
    setRecs(
      (command.data?.recommendations ?? []).filter((r) =>
        /customer|retention|concentration|relationship owner|payment delay/i.test(r.title),
      ),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedDemo() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/customers/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to load demo fixtures");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  async function explain() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse<CustomerSummary>(await fetch("/api/business/customers?narrative=true"));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Explain unavailable");
      else setData(parsed.data);
    } finally {
      setBusy(false);
    }
  }

  const metrics = data?.metrics;
  const concentration = data?.concentration;

  return (
    <>
      <Header
        title="Customer Intelligence"
        description="Trusted Customer 360 from commercial, financial, and relationship evidence — not a CRM, credit bureau, or outreach tool"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="bos-customers-shell">
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}
        {data?.containsDemoData && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Demo customer fixtures are loaded. These records are not live accounts and must not be used for outreach or credit decisions.
          </div>
        )}

        <section className="mb-8" data-testid="bos-customers-summary">
          <SectionHeader title="Customer summary" description="Evidence-backed counts. Unknown stays unknown." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Active customers" value={String(metrics?.activeCustomers ?? 0)} tone="blue" />
            <MetricCard
              label="Customer revenue"
              value={minorLabel(metrics?.customerRevenueMinor ?? null, metrics?.currency ?? null)}
              tone="green"
            />
            <MetricCard label="Customers at risk" value={String(metrics?.customersAtRisk ?? 0)} tone="amber" />
            <MetricCard label="Top customer concentration" value={bpsLabel(concentration?.topCustomerShareBps)} tone="amber" />
            <MetricCard
              label="Overdue customer receivables"
              value={minorLabel(metrics?.overdueCustomerReceivablesMinor ?? null, metrics?.currency ?? null)}
              tone="red"
            />
            <MetricCard label="Health coverage" value={bpsLabel(metrics?.customerHealthCoverageBps)} tone="slate" />
          </div>
          <p className="mt-3 text-sm text-slate-600">{data?.disclaimer}</p>
        </section>

        <section className="mb-8" data-testid="bos-customers-list">
          <SectionHeader title="Customers" description="Only evidence-backed fields are shown. Health is not a credit rating." />
          <div className="mt-4 space-y-3">
            {(data?.listRows ?? []).map((row) => (
              <Card key={row.customer.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">
                    <Link href={`/business/customers/${row.customer.id}`} className="hover:underline">
                      {row.customer.organisationName}
                    </Link>
                  </CardTitle>
                  <StatusChip value={row.status} />
                </CardHeader>
                <CardContent className="space-y-1 p-4 pt-0 text-sm text-slate-600">
                  <p>Owner: {row.relationshipOwner ?? "Unknown"}</p>
                  <p>Revenue: {minorLabel(row.revenueMinor, row.currency)}</p>
                  <p>
                    Health: {row.health?.status ?? "unknown"}
                    {row.health?.score !== null && row.health?.score !== undefined ? ` (${row.health.score})` : ""} — not a credit rating
                  </p>
                  <p>
                    Outstanding / overdue: {moneyLabel(row.outstanding)} / {moneyLabel(row.overdue)}
                  </p>
                  <p>Open opportunities: {row.openOpportunities}</p>
                  <p>Freshness: {row.freshness}</p>
                  {row.customer.isDemo && <Badge variant="secondary">Demo</Badge>}
                </CardContent>
              </Card>
            ))}
            {(data?.listRows ?? []).length === 0 && (
              <EmptyState
                title="No customers"
                description="Convert a won opportunity or load demo fixtures."
                icon={<Users className="h-5 w-5" />}
              />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-customers-attention">
          <SectionHeader title="Attention" description="Signals and recommendations reuse Owner Command primitives. Advisory only." />
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
              <EmptyState title="No customer attention items" description="Signals appear when evidence crosses a configured threshold." />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-customers-quality">
          <SectionHeader title="Data quality" description="Missing attribution and unknown health stay unknown." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Card>
              <CardContent className="p-4 text-sm text-slate-600">
                <p>Concentration: {concentration?.unknownReasons.join(", ") || "Comparable revenue available"}</p>
                <p>Period: {concentration?.periodEnd ?? "Unknown"}</p>
                <p>Currency: {concentration?.currency ?? "Unknown"}</p>
                <p>Renewal intelligence: {data?.renewal?.reason ?? "renewal_intelligence_not_implemented"}</p>
                <p>Account expansion: {data?.expansion?.reason ?? "account_expansion_not_implemented"}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled={busy} onClick={() => void seedDemo()}>
            Load demo fixtures
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void explain()}>
            Explain with AI Director
          </Button>
        </div>
        {data?.narrative?.text && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">{data.narrative.text}</p>
        )}
      </PageMain>
    </>
  );
}
