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
import { DollarSign } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type {
  AiDailyBriefNarrative,
  BusinessGrowthOpportunity,
  BusinessRevenueAgentPassport,
  BusinessRevenueBidEvaluation,
  BusinessRevenueCommunicationDraft,
  BusinessRevenueEngagementPlan,
  BusinessRevenuePricingEvaluation,
  BusinessRevenueProposal,
  BusinessRevenueProposalRequirement,
  MoneyJson,
} from "@rtb/types";

type RevenueSummary = {
  opportunities: BusinessGrowthOpportunity[];
  engagements: BusinessRevenueEngagementPlan[];
  drafts: BusinessRevenueCommunicationDraft[];
  proposals: BusinessRevenueProposal[];
  requirements: BusinessRevenueProposalRequirement[];
  bids: BusinessRevenueBidEvaluation[];
  evaluations: BusinessRevenuePricingEvaluation[];
  metrics: {
    qualifiedOpportunities: number;
    proposalReadyOpportunities: number;
    proposalsInProgress: number;
    pendingApprovals: number;
    pricingAlerts: number;
  };
  agent: BusinessRevenueAgentPassport;
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

export default function RevenueExecutionPage() {
  const [data, setData] = useState<RevenueSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signals, setSignals] = useState<Array<{ id: string; title: string; severity: string; summary: string }>>([]);
  const [recs, setRecs] = useState<Array<{ id: string; title: string; rationaleSummary: string; confidence: string }>>([]);

  const load = useCallback(async () => {
    const [summary, command] = await Promise.all([
      parseApiJsonResponse<RevenueSummary>(await fetch("/api/business/revenue")),
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
    setSignals((command.data?.signals ?? []).filter((s) => (s.type ?? "").startsWith("revenue.")));
    setRecs(
      (command.data?.recommendations ?? []).filter((r) =>
        /engagement|proposal|pricing|bid|discount|requirement|next action/i.test(r.title),
      ),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedDemo() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/revenue/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to load demo fixtures");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  async function explain() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse<RevenueSummary>(await fetch("/api/business/revenue?narrative=true"));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Explain unavailable");
      else setData(parsed.data);
    } finally {
      setBusy(false);
    }
  }

  const metrics = data?.metrics;

  return (
    <>
      <Header
        title="Revenue Execution"
        description="Supervised commercial preparation — not send, submit, or autonomous approval"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="bos-revenue-shell">
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}
        {data?.containsDemoData && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Demo revenue fixtures are loaded. Drafts stay internal and must not be sent or submitted.
          </div>
        )}

        <section className="mb-8" data-testid="bos-revenue-summary">
          <SectionHeader title="Revenue execution summary" description="Deterministic counts from Growth opportunities and prepared commercial records." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Qualified opportunities" value={String(metrics?.qualifiedOpportunities ?? 0)} tone="blue" />
            <MetricCard label="Proposals in progress" value={String(metrics?.proposalsInProgress ?? 0)} tone="slate" />
            <MetricCard label="Proposal-ready" value={String(metrics?.proposalReadyOpportunities ?? 0)} tone="green" />
            <MetricCard label="Pending approvals" value={String(metrics?.pendingApprovals ?? 0)} tone="amber" />
            <MetricCard label="Pricing alerts" value={String(metrics?.pricingAlerts ?? 0)} tone="red" />
          </div>
          <p className="mt-3 text-sm text-slate-600">{data?.disclaimer}</p>
        </section>

        <section className="mb-8" data-testid="bos-revenue-workbench">
          <SectionHeader title="Opportunity workbench" description="Qualified Growth opportunities needing commercial preparation." />
          <div className="mt-4 space-y-3">
            {(data?.opportunities ?? []).map((opp) => (
              <Card key={opp.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">{opp.name}</CardTitle>
                  <StatusChip value={opp.stage} />
                </CardHeader>
                <CardContent className="space-y-1 p-4 pt-0 text-sm text-slate-600">
                  <p>Owner: {opp.owner ?? "Unassigned"}</p>
                  <p>Next action: {opp.nextAction ?? "None recorded"}</p>
                  <p>Score: {opp.score ?? "Unknown"} ({opp.scoreVersion}) — not a win probability</p>
                  {opp.isDemo && <Badge variant="secondary">Demo</Badge>}
                </CardContent>
              </Card>
            ))}
            {(data?.opportunities ?? []).length === 0 && (
              <EmptyState title="No qualified opportunities" description="Qualify a Growth opportunity or load demo fixtures." icon={<DollarSign className="h-5 w-5" />} />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-revenue-engagement">
          <SectionHeader title="Engagement" description="Plans, follow-ups, and internal communication drafts. Nothing is sent." />
          <div className="mt-4 space-y-3">
            {(data?.engagements ?? []).map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">{plan.objective}</CardTitle>
                  <StatusChip value={plan.status} />
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">
                  <p>Next action: {plan.nextAction ?? "None"} · Owner: {plan.owner ?? "Unassigned"}</p>
                </CardContent>
              </Card>
            ))}
            {(data?.drafts ?? []).map((draft) => (
              <Card key={draft.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">{draft.subject}</CardTitle>
                  <StatusChip value={draft.approvalStatus} />
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">
                  <p>{draft.type} · {draft.generatedBy} · internal only</p>
                  <p>{draft.purpose}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-revenue-proposals">
          <SectionHeader title="Proposals" description="Versioned internal drafts. Ready-to-send is not an external submission." />
          <div className="mt-4 space-y-3">
            {(data?.proposals ?? []).map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">{proposal.title}</CardTitle>
                  <StatusChip value={proposal.status} />
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">
                  <p>
                    {proposal.proposalNumber} v{proposal.version} · evidence {proposal.evidenceRefs.length}
                  </p>
                  <p>
                    Price: {proposal.proposedPriceMinor ?? "Unknown"} {proposal.currency} minor · target margin{" "}
                    {bpsLabel(proposal.targetMarginBps)}
                  </p>
                </CardContent>
              </Card>
            ))}
            {(data?.requirements ?? []).map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4 text-sm text-slate-600">
                  <p>
                    {req.mandatory ? "Mandatory" : "Optional"}: {req.requirement}
                  </p>
                  <p>Compliance: {req.complianceStatus} · evidence {req.evidenceRefs.length}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-revenue-pricing">
          <SectionHeader title="Pricing" description="Exact integer arithmetic. Guardrail breaches need a human decision." />
          <div className="mt-4 space-y-3">
            {(data?.evaluations ?? []).map((evaluation, index) => (
              <Card key={`${evaluation.version}-${index}`}>
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  <p>Revenue: {moneyLabel(evaluation.revenue)}</p>
                  <p>Gross profit: {moneyLabel(evaluation.grossProfit)} · margin {bpsLabel(evaluation.grossMarginBps)}</p>
                  <p>Approval required: {evaluation.requiresApproval ? "Yes" : "No"}</p>
                  {evaluation.violations.map((v) => (
                    <p key={v.ruleId}>{v.ruleId}: {v.message}</p>
                  ))}
                  {evaluation.unknownReasons.length > 0 && <p>Unknown: {evaluation.unknownReasons.join(", ")}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-revenue-attention">
          <SectionHeader title="Attention" description="Revenue signals and advisory recommendations from BOS-1 primitives." />
          <div className="mt-4 space-y-3">
            {signals.map((signal) => (
              <Card key={signal.id}>
                <CardContent className="p-4 text-sm">
                  <p className="font-medium">{signal.title}</p>
                  <p className="text-slate-600">{signal.summary}</p>
                </CardContent>
              </Card>
            ))}
            {recs.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-4 text-sm">
                  <p className="font-medium">{rec.title}</p>
                  <p className="text-slate-600">{rec.rationaleSummary} ({rec.confidence})</p>
                </CardContent>
              </Card>
            ))}
            {signals.length === 0 && recs.length === 0 && (
              <EmptyState title="No revenue attention" description="Load demo fixtures or prepare a proposal." icon={<DollarSign className="h-5 w-5" />} />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-revenue-agent">
          <SectionHeader title="AI Business Development Agent" description="Platform AI Director. Authority A0–A2 only. Kill switch and passport are inspectable." />
          <Card>
            <CardContent className="space-y-1 p-4 text-sm text-slate-600">
              <p>Role: {data?.agent.role ?? "AI Business Development Agent"}</p>
              <p>Authority max: {data?.agent.authorityMax ?? "A2"}</p>
              <p>Prohibited: {(data?.agent.prohibitedActions ?? []).join(", ")}</p>
              <p>AI stack: Platform AI Director only · implementsOwnAiStack = false</p>
              {data?.narrative?.text && <p className="pt-2">{data.narrative.text}</p>}
              {data?.narrative?.unavailableReason && <p>AI unavailable: {data.narrative.unavailableReason}</p>}
            </CardContent>
          </Card>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled={busy} onClick={() => void seedDemo()}>
            Load demo fixtures
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
