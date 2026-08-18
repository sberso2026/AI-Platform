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
import { AlertTriangle, Briefcase, CheckSquare, Gavel, Lightbulb, Sparkles } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type {
  AiDailyBriefNarrative,
  BusinessAction,
  BusinessDecision,
  BusinessHealthSnapshot,
  BusinessKpi,
  BusinessKpiStatus,
  BusinessRecommendation,
  BusinessSignal,
  DeterministicDailyBrief,
} from "@rtb/types";

type CommandSnapshot = {
  scope: { tenantId: string; workspaceId: string; userId: string };
  kpis: BusinessKpi[];
  signals: BusinessSignal[];
  recommendations: BusinessRecommendation[];
  decisions: BusinessDecision[];
  actions: { overdue: BusinessAction[]; blocked: BusinessAction[]; dueSoon: BusinessAction[] };
  health: BusinessHealthSnapshot;
  brief: DeterministicDailyBrief;
  freshness: string | null;
  containsDemoData: boolean;
  disclaimer: string;
};

function toneForStatus(status: BusinessKpiStatus): "green" | "blue" | "amber" | "red" | "slate" {
  if (status === "healthy") return "green";
  if (status === "watch") return "blue";
  if (status === "warning") return "amber";
  if (status === "critical") return "red";
  return "slate";
}

function formatKpiValue(kpi: BusinessKpi): string {
  if (kpi.value === null || kpi.status === "unknown") return "Unknown";
  if (kpi.unit === "AUD") return `$${kpi.value.toLocaleString()}`;
  if (kpi.unit === "%") return `${kpi.value}%`;
  if (kpi.unit === "ratio") return `${kpi.value}x`;
  return `${kpi.value} ${kpi.unit}`;
}

function formatFreshness(value: string | null): string {
  if (!value) return "Unknown";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "Unknown";
  return dt.toLocaleString();
}

export default function OwnerCommandCentrePage() {
  const [data, setData] = useState<CommandSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<AiDailyBriefNarrative | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const parsed = await parseApiJsonResponse<CommandSnapshot>(await fetch("/api/business/command"));
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Access denied");
      setData(null);
      return;
    }
    setError(null);
    setData(parsed.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedDemo() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to load demo fixtures");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  async function enhanceBrief() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse<{
        deterministic: DeterministicDailyBrief;
        narrative: AiDailyBriefNarrative | null;
      }>(await fetch("/api/business/brief?narrative=true"));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Brief unavailable");
      else setNarrative(parsed.data?.narrative ?? null);
    } finally {
      setBusy(false);
    }
  }

  async function patch(path: string, body: Record<string, unknown>) {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(
        await fetch(path, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      if (!parsed.ok) setError(parsed.errorMessage ?? "Update failed");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  const health = data?.health;
  const actions = [
    ...(data?.actions.overdue ?? []),
    ...(data?.actions.dueSoon ?? []),
    ...(data?.actions.blocked ?? []),
  ];

  return (
    <>
      <Header
        title="Owner Command Centre"
        description="Today — exceptions, health, and owner decisions"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="business-os-shell">
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}

        {data?.containsDemoData && (
          <div
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            data-testid="bos-demo-banner"
          >
            Demo fixtures are loaded. These values are not connected live business data.
          </div>
        )}

        <section className="mb-8" data-testid="bos-header">
          <SectionHeader
            title="Business OS"
            description="Owner-centric command centre. Unknown data stays unknown. Advisory only."
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Workspace" value={data?.scope.workspaceId.slice(0, 8) ?? "Unknown"} />
            <Fact label="Data freshness" value={formatFreshness(data?.freshness ?? null)} />
            <Fact label="Business Health" value={health?.overallStatus ?? "unknown"} />
            <Fact
              label="Health score"
              value={
                health?.score === null || health?.score === undefined
                  ? "Unknown — insufficient KPI coverage"
                  : String(health.score)
              }
            />
          </div>
          <p className="mt-3 text-sm text-slate-600">{health?.disclaimer ?? data?.disclaimer}</p>
        </section>

        <section className="mb-8" data-testid="bos-kpis">
          <SectionHeader
            title="Key metrics"
            description="Only configured KPIs are shown. Missing values display as Unknown."
          />
          {(data?.kpis.length ?? 0) === 0 ? (
            <EmptyState
              className="mt-4"
              title="No KPIs yet"
              description="Load marked demo fixtures for development, or wait until live KPIs are configured in a later phase."
              icon={<Briefcase className="h-5 w-5" />}
            />
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {data!.kpis.map((kpi) => (
                <MetricCard
                  key={kpi.id}
                  label={kpi.name}
                  value={formatKpiValue(kpi)}
                  tone={toneForStatus(kpi.status)}
                  trendLabel={kpi.isDemo ? "Demo" : kpi.status}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-8" data-testid="bos-signals">
          <SectionHeader
            title="Attention required"
            description="Open signals ranked by severity, then business impact, then recency."
          />
          <div className="mt-4 space-y-3">
            {(data?.signals ?? []).map((signal) => (
              <Card key={signal.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      {signal.title}
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-600">{signal.summary}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusChip value={signal.severity} />
                    {signal.isDemo && <Badge variant="secondary">Demo</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0 text-sm text-slate-600">
                  <p>
                    Evidence:{" "}
                    {signal.evidence.length
                      ? signal.evidence.map((e) => e.title).join(", ")
                      : "None recorded"}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void patch("/api/business/signals", { id: signal.id, status: "acknowledged" })}
                  >
                    Acknowledge
                  </Button>
                </CardContent>
              </Card>
            ))}
            {(data?.signals.length ?? 0) === 0 && (
              <EmptyState title="No open signals" description="Nothing requires attention in this workspace." />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-recommendations">
          <SectionHeader
            title="Recommendations"
            description="Advisory only. Evidence and confidence are shown; no hidden chain-of-thought."
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(data?.recommendations ?? []).map((rec) => (
              <Card key={rec.id}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Lightbulb className="h-4 w-4" />
                    {rec.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0 text-sm text-slate-600">
                  <p>{rec.recommendationText}</p>
                  <p>
                    <span className="font-medium text-slate-800">Rationale:</span> {rec.rationaleSummary}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">Expected impact:</span>{" "}
                    {rec.expectedImpact ?? "Unknown"}
                  </p>
                  <p>
                    Confidence: {rec.confidence}. Evidence:{" "}
                    {rec.evidenceRefs.length ? rec.evidenceRefs.map((e) => e.title).join(", ") : "None recorded"}
                  </p>
                  {rec.status === "proposed" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void patch("/api/business/recommendations", { id: rec.id, status: "accepted" })
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          void patch("/api/business/recommendations", { id: rec.id, status: "rejected" })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-decisions">
          <SectionHeader title="Decisions" description="Pending and recent owner decisions. No autonomous approval." />
          <div className="mt-4 space-y-3">
            {(data?.decisions ?? []).map((decision) => (
              <Card key={decision.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Gavel className="h-4 w-4" />
                    {decision.statement}
                  </CardTitle>
                  <StatusChip value={decision.status} />
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0 text-sm text-slate-600">
                  <p>{decision.context ?? "No additional context."}</p>
                  {decision.status === "pending" && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void patch("/api/business/decisions", { id: decision.id, status: "approved" })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          void patch("/api/business/decisions", { id: decision.id, status: "deferred" })
                        }
                      >
                        Defer
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {(data?.decisions.length ?? 0) === 0 && (
              <EmptyState title="No decisions" description="Owner decisions will appear here." />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-actions">
          <SectionHeader title="Actions" description="Overdue, due soon, and blocked internal workflow records only." />
          <div className="mt-4 space-y-3">
            {actions.map((action) => (
              <Card key={action.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckSquare className="h-4 w-4" />
                    {action.title}
                  </CardTitle>
                  <StatusChip value={action.status} />
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0 text-sm text-slate-600">
                  <p>
                    Due {action.dueDate ?? "Unknown"} · Priority {action.priority}
                    {action.isDemo ? " · Demo" : ""}
                  </p>
                  {action.status !== "completed" && action.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void patch("/api/business/actions", {
                          id: action.id,
                          status: "completed",
                          completionEvidence: { note: "Marked complete in Owner Command Centre" },
                        })
                      }
                    >
                      Complete
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {actions.length === 0 && (
              <EmptyState title="No due or blocked actions" description="Internal action records will appear here." />
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-brief">
          <SectionHeader
            title="Daily Business Brief"
            description="Deterministic summary from BOS records. AI narrative is optional and uses Platform AI Director only."
          />
          <Card className="mt-4">
            <CardContent className="space-y-3 p-4 text-sm text-slate-700">
              <p>
                Health: {data?.brief.health.overallStatus ?? "unknown"}
                {data?.brief.health.score === null || data?.brief.health.score === undefined
                  ? " (score unknown)"
                  : ` (score ${data.brief.health.score})`}
                . Known KPIs: {data?.brief.health.contributingKpiCount ?? 0}. Unknown:{" "}
                {data?.brief.health.unknownCount ?? 0}.
              </p>
              <p>
                Critical/warning signals:{" "}
                {data?.brief.criticalSignals.length
                  ? data.brief.criticalSignals.map((s) => s.title).join("; ")
                  : "None"}
              </p>
              <p>
                Major KPI attention:{" "}
                {data?.brief.majorKpiChanges.length
                  ? data.brief.majorKpiChanges.map((k) => `${k.name} (${k.status})`).join("; ")
                  : "None"}
              </p>
              <p>
                Pending decisions:{" "}
                {data?.brief.pendingDecisions.length
                  ? data.brief.pendingDecisions.map((d) => d.statement).join("; ")
                  : "None"}
              </p>
              <p>
                Overdue or blocked actions:{" "}
                {data?.brief.overdueOrBlockedActions.length
                  ? data.brief.overdueOrBlockedActions.map((a) => a.title).join("; ")
                  : "None"}
              </p>
              {data?.brief.containsDemoData && <p>This brief includes demo fixtures.</p>}
              {narrative && !narrative.unavailableReason && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-1 flex items-center gap-2 font-medium text-slate-900">
                    <Sparkles className="h-4 w-4" />
                    AI narrative (advisory)
                  </p>
                  <p>{narrative.text}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {narrative.generatedAt} · {narrative.modelProvenance ?? "platform-ai-director"}
                  </p>
                </div>
              )}
              {narrative?.unavailableReason && (
                <p className="text-slate-600">
                  AI narrative unavailable ({narrative.unavailableReason}). Deterministic brief remains in effect.
                </p>
              )}
              <Button size="sm" variant="outline" disabled={busy} onClick={() => void enhanceBrief()}>
                Enhance with AI Director
              </Button>
            </CardContent>
          </Card>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled={busy} onClick={() => void seedDemo()}>
            Load demo fixtures
          </Button>
          <Link href="/business/settings" className="text-sm font-semibold text-blue-700 hover:underline">
            Open Business OS settings
          </Link>
        </div>
      </PageMain>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-sm text-slate-900">{value}</div>
    </div>
  );
}
