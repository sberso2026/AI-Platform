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
import { AlertTriangle, Wrench } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type { AiDailyBriefNarrative, BusinessWorkCapacityFact, BusinessWorkHealthStatus } from "@rtb/types";

type WorkRow = {
  id: string;
  reference: string;
  name: string;
  customerName?: string | null;
  owner?: string | null;
  status: string;
  progress?: { progressBps: string | null };
  plannedFinish?: string | null;
  budgetCostMinor?: string | null;
  actualCostMinor?: string | null;
  currency: string;
  health: BusinessWorkHealthStatus;
  freshness: string;
};

type OperationsSummary = {
  activeWorkCount: number;
  overdueWorkCount: number;
  blockedWorkCount: number;
  atRiskWorkCount: number;
  costProgressVarianceCount: number;
  capacityUtilizationBps: number | null;
  overcommittedCapacityCount: number;
  operationalDataCoverageBps: number | null;
  containsDemoData: boolean;
  disclaimer?: string;
  narrative?: AiDailyBriefNarrative | null;
};

function bpsLabel(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "Unknown";
  return `${(Number(value) / 100).toFixed(2)}%`;
}

function minorLabel(minor: string | null | undefined, currency: string, fallback = "Unknown"): string {
  if (minor === null || minor === undefined) return fallback;
  const major = Number(minor) / 100;
  if (!Number.isFinite(major)) return fallback;
  return `${currency} ${major.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function WorkOperationsPage() {
  const [summary, setSummary] = useState<OperationsSummary | null>(null);
  const [work, setWork] = useState<WorkRow[]>([]);
  const [capacity, setCapacity] = useState<BusinessWorkCapacityFact[]>([]);
  const [signals, setSignals] = useState<Array<{ id: string; title: string; severity: string; summary: string; type?: string }>>([]);
  const [recs, setRecs] = useState<Array<{ id: string; title: string; rationaleSummary: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [summaryRes, workRes, capacityRes, command] = await Promise.all([
      parseApiJsonResponse<OperationsSummary>(await fetch("/api/business/operations")),
      parseApiJsonResponse<{ work: WorkRow[] }>(await fetch("/api/business/operations/work")),
      parseApiJsonResponse<BusinessWorkCapacityFact[]>(await fetch("/api/business/operations/capacity")),
      parseApiJsonResponse<{
        signals: Array<{ id: string; title: string; severity: string; summary: string; type?: string }>;
        recommendations: Array<{ id: string; title: string; rationaleSummary: string }>;
      }>(await fetch("/api/business/command")),
    ]);
    if (!summaryRes.ok || !summaryRes.data) {
      setError(summaryRes.errorMessage ?? "Access denied");
      setSummary(null);
      return;
    }
    setError(null);
    setSummary(summaryRes.data);
    setWork(workRes.data?.work ?? []);
    setCapacity(Array.isArray(capacityRes.data) ? capacityRes.data : []);
    setSignals((command.data?.signals ?? []).filter((s) => (s.type ?? "").startsWith("operations.")));
    setRecs((command.data?.recommendations ?? []).filter((r) => /work|capacity|cost variance|blocked|progress evidence|delivery risk/i.test(r.title)));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedDemo() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/operations/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to load demo fixtures");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  async function explain() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse<OperationsSummary>(await fetch("/api/business/operations?narrative=true"));
      if (!parsed.ok || !parsed.data) setError(parsed.errorMessage ?? "Explain unavailable");
      else setSummary(parsed.data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header
        title="Work & Operations"
        description="Business execution context for jobs, milestones, cost, and capacity — not a scheduler, payroll system, or Engineering OS"
        showEngineeringChrome={false}
      />
      <PageMain data-testid="bos-operations-shell">
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}
        {summary?.containsDemoData && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Demo operations fixtures are loaded. Progress and capacity are never invented. No autonomous resource allocation.
          </div>
        )}

        <section className="mb-8" data-testid="bos-operations-summary">
          <SectionHeader title="Operations summary" description="Active, overdue, blocked, at-risk work, capacity, and cost/progress exceptions." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Active work" value={String(summary?.activeWorkCount ?? 0)} tone="blue" />
            <MetricCard label="Overdue" value={String(summary?.overdueWorkCount ?? 0)} tone="red" />
            <MetricCard label="Blocked" value={String(summary?.blockedWorkCount ?? 0)} tone="amber" />
            <MetricCard label="Work at risk" value={String(summary?.atRiskWorkCount ?? 0)} tone="amber" />
            <MetricCard label="Capacity utilization" value={bpsLabel(summary?.capacityUtilizationBps)} tone="slate" />
            <MetricCard label="Cost/progress exceptions" value={String(summary?.costProgressVarianceCount ?? 0)} tone="red" />
          </div>
          <p className="mt-3 text-sm text-slate-600">{summary?.disclaimer}</p>
        </section>

        <section className="mb-8" data-testid="bos-operations-work">
          <SectionHeader title="Work" description="Reference, customer, owner, status, progress, finish, cost/budget, health, and freshness." />
          <div className="mt-4 space-y-3">
            {work.length === 0 && (
              <EmptyState icon={<Wrench className="h-8 w-8" />} title="No work records" description="Ingest work/jobs or load demo fixtures." />
            )}
            {work.map((row) => (
              <Card key={row.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <div>
                    <CardTitle className="text-sm">
                      <Link href={`/business/operations/${row.id}`} className="text-blue-700 hover:underline">
                        {row.reference} · {row.name}
                      </Link>
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      {row.customerName ?? "No customer"} · {row.owner ?? "No owner"}
                    </p>
                  </div>
                  <StatusChip label={row.health} />
                </CardHeader>
                <CardContent className="space-y-1 p-4 pt-0 text-sm text-slate-600">
                  <p>Status: {row.status} · Progress: {bpsLabel(row.progress?.progressBps)}</p>
                  <p>Finish: {row.plannedFinish ?? "Unknown"} · Budget: {minorLabel(row.budgetCostMinor, row.currency)} · Actual: {minorLabel(row.actualCostMinor, row.currency)}</p>
                  <p>Freshness: {row.freshness}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-operations-capacity">
          <SectionHeader title="Capacity" description="Lightweight sourced hours only. Missing evidence stays unknown." />
          <div className="mt-4 space-y-3">
            {capacity.length === 0 && <p className="text-sm text-slate-600">No capacity facts.</p>}
            {capacity.map((row) => (
              <Card key={row.id}>
                <CardContent className="p-4 text-sm text-slate-600">
                  <p>
                    {row.dimensionName} ({row.dimensionType}) · {row.capacityStatus}
                  </p>
                  <p>
                    Available: {row.availableHoursMinor ?? "Unknown"} · Committed: {row.committedHoursMinor ?? "Unknown"} ·
                    Utilization: {bpsLabel(row.utilizationBps)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-operations-attention">
          <SectionHeader title="Attention" description="Reuses Owner Command signals and advisory recommendations. No autonomous reassignment." />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Signals</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                {signals.length === 0 && <p>No open operations signals.</p>}
                {signals.map((s) => (
                  <p key={s.id}>
                    <Badge>{s.severity}</Badge> {s.title}
                  </p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                {recs.length === 0 && <p>No operations recommendations.</p>}
                {recs.map((r) => (
                  <p key={r.id}>{r.title}</p>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-8" data-testid="bos-operations-data-quality">
          <SectionHeader title="Data quality" description="Missing progress, cost, or capacity evidence is shown as unknown." />
          <p className="mt-3 text-sm text-slate-600">
            Operational coverage: {bpsLabel(summary?.operationalDataCoverageBps)}. Overcommitted capacity facts:{" "}
            {summary?.overcommittedCapacityCount ?? 0}.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={busy} onClick={() => void seedDemo()}>
            Load demo fixtures
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => void explain()}>
            Explain with AI Director
          </Button>
          {summary?.narrative?.text && (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <AlertTriangle className="h-4 w-4" /> {summary.narrative.text}
            </p>
          )}
        </div>
      </PageMain>
    </>
  );
}
