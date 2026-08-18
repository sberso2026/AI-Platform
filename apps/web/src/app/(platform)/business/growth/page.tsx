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
import { AlertTriangle, Network } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type {
  AiDailyBriefNarrative,
  BusinessGrowthLead,
  BusinessGrowthMarketSegment,
  BusinessGrowthOpportunity,
  BusinessGrowthPipelineMetrics,
  MoneyJson,
} from "@rtb/types";

type GrowthSummary = {
  leads: BusinessGrowthLead[];
  opportunities: BusinessGrowthOpportunity[];
  market: BusinessGrowthMarketSegment[];
  pipeline: BusinessGrowthPipelineMetrics;
  health: { overallStatus: string; score: number | null; contributingKpiCount: number; unknownCount: number };
  completeness: {
    leadCount: number;
    opportunityCount: number;
    marketCount: number;
    knownOrganisationFieldCount: number;
    personalContactCount: number;
  };
  containsDemoData: boolean;
  disclaimer?: string;
  narrative?: AiDailyBriefNarrative | null;
};

function moneyLabel(value: MoneyJson | null | undefined, fallback = "Unknown"): string {
  if (!value || value.minor === "") return fallback;
  const scale = value.scale ?? 2;
  const denom = 10 ** scale;
  const major = Number(value.minor) / denom;
  if (!Number.isFinite(major)) return fallback;
  return `${value.currency} ${major.toLocaleString(undefined, { minimumFractionDigits: scale, maximumFractionDigits: scale })}`;
}

function bpsLabel(value: string | null | undefined): string {
  if (value === null || value === undefined) return "Unknown";
  return `${(Number(value) / 100).toFixed(2)}%`;
}

export default function GrowthIntelligencePage() {
  const [data, setData] = useState<GrowthSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signals, setSignals] = useState<Array<{ id: string; title: string; severity: string; summary: string; isDemo?: boolean }>>([]);
  const [recs, setRecs] = useState<Array<{ id: string; title: string; rationaleSummary: string; confidence: string }>>([]);

  const load = useCallback(async () => {
    const [summary, command] = await Promise.all([
      parseApiJsonResponse<GrowthSummary>(await fetch("/api/business/growth")),
      parseApiJsonResponse<{
        signals: Array<{ id: string; title: string; severity: string; summary: string; isDemo?: boolean; type?: string }>;
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
    setSignals((command.data?.signals ?? []).filter((s) => (s.type ?? "").startsWith("growth.")));
    setRecs(
      (command.data?.recommendations ?? []).filter((r) =>
        /lead|pipeline|opportunit|owner|coverage|diversify|next action/i.test(r.title),
      ),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedDemo() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/growth/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to load demo fixtures");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  async function explain() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse<GrowthSummary>(await fetch("/api/business/growth?narrative=true"));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Explain unavailable");
      else setData(parsed.data);
    } finally {
      setBusy(false);
    }
  }

  const pipeline = data?.pipeline;
  const qualifiedLeads = (data?.leads ?? []).filter(
    (l) => l.qualificationStatus === "qualified" || l.qualificationStatus === "converted",
  );

  return (
    <>
      <Header
        title="Growth Intelligence"
        description="Find and qualify potential revenue — not outreach, proposals, or a CRM"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="bos-growth-shell">
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}
        {data?.containsDemoData && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Demo growth fixtures are loaded. These records are not live prospects and must not be used for outreach.
          </div>
        )}

        <section className="mb-8" data-testid="bos-growth-summary">
          <SectionHeader title="Growth summary" description="Deterministic counts and pipeline from ingested records." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Leads" value={String(data?.leads.length ?? 0)} tone="blue" />
            <MetricCard label="Qualified leads" value={String(qualifiedLeads.length)} tone="green" />
            <MetricCard label="Total pipeline" value={moneyLabel(pipeline?.totalPipeline)} tone="blue" />
            <MetricCard label="Qualified pipeline" value={moneyLabel(pipeline?.qualifiedPipeline)} tone="green" />
            <MetricCard label="Weighted pipeline" value={moneyLabel(pipeline?.weightedPipeline)} tone="slate" />
            <MetricCard label="Pipeline coverage" value={bpsLabel(pipeline?.pipelineCoverageBps)} tone="amber" />
          </div>
          <p className="mt-3 text-sm text-slate-600">{pipeline?.disclaimer ?? data?.disclaimer}</p>
        </section>

        <section className="mb-8" data-testid="bos-growth-leads">
          <SectionHeader title="Leads" description="Organisation-first. Personal contact is optional and never required." />
          <div className="mt-4 space-y-3">
            {(data?.leads ?? [])
              .slice()
              .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
              .map((lead) => (
                <Card key={lead.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                    <CardTitle className="text-sm">{lead.organisationName}</CardTitle>
                    <StatusChip value={lead.qualificationStatus} />
                  </CardHeader>
                  <CardContent className="space-y-1 p-4 pt-0 text-sm text-slate-600">
                    <p>Fit score: {lead.score ?? "Unknown"} ({lead.scoreVersion})</p>
                    <p>Source: {lead.sourceType}{lead.sourceRef ? ` · ${lead.sourceRef}` : ""}</p>
                    <p>Owner: {lead.owner ?? "Unassigned"}</p>
                    <p>Missing: {lead.scoreDetail.missingInputs.length ? lead.scoreDetail.missingInputs.join(", ") : "None listed"}</p>
                    <p>Evidence: {lead.scoreDetail.components.filter((c) => c.score !== null).map((c) => c.id).join(", ") || "Unknown"}</p>
                    {!lead.contactName && !lead.businessEmail && <p>No personal contact on this lead.</p>}
                    {lead.isDemo && <Badge variant="secondary">Demo</Badge>}
                  </CardContent>
                </Card>
              ))}
            {(data?.leads ?? []).length === 0 && (
              <EmptyState title="No leads" description="Ingest a lead or load demo fixtures." icon={<Network className="h-5 w-5" />} />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-growth-opportunities">
          <SectionHeader title="Opportunities" description="Score is a ranking, not a statistical win probability." />
          <div className="mt-4 space-y-3">
            {(data?.opportunities ?? []).map((opp) => (
              <Card key={opp.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">{opp.name}</CardTitle>
                  <StatusChip value={opp.stage} />
                </CardHeader>
                <CardContent className="space-y-1 p-4 pt-0 text-sm text-slate-600">
                  <p>
                    Value:{" "}
                    {moneyLabel(
                      opp.estimatedValueMinor
                        ? { minor: opp.estimatedValueMinor, currency: opp.currency, scale: opp.scale }
                        : null,
                    )}
                  </p>
                  <p>Score: {opp.score ?? "Unknown"} ({opp.scoreVersion}) — not win probability</p>
                  <p>Supplied probability: {bpsLabel(opp.probabilityBps)}</p>
                  <p>Expected close: {opp.expectedCloseDate ?? "Unknown"}</p>
                  <p>Next action: {opp.nextAction ?? "Unknown"}</p>
                  <p>Owner: {opp.owner ?? "Unassigned"}</p>
                  {opp.isDemo && <Badge variant="secondary">Demo</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-growth-attention">
          <SectionHeader title="Growth attention" description="Signals and recommendations reuse Owner Command primitives." />
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
              <EmptyState title="No growth attention" description="Ingest records or load demo fixtures." icon={<Network className="h-5 w-5" />} />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-growth-market">
          <SectionHeader title="Market context" description="Lightweight target segments only. Not a full market-intelligence platform." />
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            {(data?.market ?? []).map((segment) => (
              <Card key={segment.id}>
                <CardContent className="p-4">
                  <p className="font-medium">{segment.segmentName}</p>
                  <p>
                    {segment.industry ?? "Unknown industry"} · {segment.geography ?? "Unknown geography"} ·{" "}
                    {segment.attractiveness}
                  </p>
                  <p>{segment.targetCustomerProfile ?? "No target profile"}</p>
                </CardContent>
              </Card>
            ))}
            {(data?.market ?? []).length === 0 && <p>Unknown — no market context ingested.</p>}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-growth-quality">
          <SectionHeader title="Data quality" description="Unknown stays unknown. No cross-currency pipeline totals." />
          <Card className="mt-4">
            <CardContent className="space-y-2 p-4 text-sm text-slate-700">
              <p>Leads: {data?.completeness.leadCount ?? 0}</p>
              <p>Opportunities: {data?.completeness.opportunityCount ?? 0}</p>
              <p>Market segments: {data?.completeness.marketCount ?? 0}</p>
              <p>Personal contact records: {data?.completeness.personalContactCount ?? 0} (optional)</p>
              <p>Currency: {pipeline?.currency ?? "Unknown"}</p>
              {(pipeline?.unknownReasons ?? []).slice(0, 8).map((reason) => (
                <p key={reason}>Unknown: {reason.replaceAll("_", " ")}</p>
              ))}
              <p>Growth health contribution: {data?.health.overallStatus ?? "unknown"} (not a second Business Health score)</p>
            </CardContent>
          </Card>
        </section>

        {data?.narrative && !data.narrative.unavailableReason && (
          <p className="mb-6 text-sm text-slate-700">{data.narrative.text}</p>
        )}
        {data?.narrative?.unavailableReason && (
          <p className="mb-6 text-sm text-slate-600">
            AI explanation unavailable ({data.narrative.unavailableReason}). Deterministic scores remain in effect.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled={busy} onClick={() => void seedDemo()}>
            Load growth demo fixtures
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
