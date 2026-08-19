"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import {
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
import { ShieldAlert } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type Summary = {
  openHighRisks: number;
  extremeResidualRisks: number;
  outsideTolerance: number;
  overdueReviews: number;
  ineffectiveControls: number;
  untestedControls: number;
  overdueObligations: number;
  risksWithoutOwner: number;
  treatmentActionsOverdue: number;
  containsDemoData: boolean;
  disclaimer: string;
};

type RegisterRow = {
  risk: {
    id: string;
    reference: string;
    title: string;
    category: string;
    ownerLabel?: string | null;
    status: string;
    reviewAt?: string | null;
    isDemo: boolean;
  };
  inherentLevel: string;
  residualLevel: string;
  toleranceStatus: string;
  treatmentStrategy?: string | null;
  evidenceFreshness: string;
  priority: { priority: string; version: string; missingInputs: string[] };
};

type Intelligence = {
  summary: Summary;
  register: RegisterRow[];
  signals: Array<{ id: string; title: string; severity: string; summary: string }>;
  recommendations: Array<{ id: string; title: string; recommendationText: string }>;
  missingEvidence: string[];
  disclaimer: string;
};

type Control = { id: string; name: string; status: string; effectiveness: string };
type Obligation = { id: string; title: string; status: string; dueAt?: string | null };

export default function BusinessRiskPage() {
  const [intel, setIntel] = useState<Intelligence | null>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [intelRes, controlsRes, obligationsRes] = await Promise.all([
      parseApiJsonResponse<Intelligence>(await fetch("/api/business/risk/intelligence")),
      parseApiJsonResponse<Control[]>(await fetch("/api/business/risk/controls")),
      parseApiJsonResponse<Obligation[]>(await fetch("/api/business/risk/obligations")),
    ]);
    if (!intelRes.ok) {
      setError(intelRes.errorMessage ?? "Access denied");
      setIntel(null);
      return;
    }
    setError(null);
    setIntel(intelRes.data);
    setControls(controlsRes.ok && controlsRes.data ? controlsRes.data : []);
    setObligations(obligationsRes.ok && obligationsRes.data ? obligationsRes.data : []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedDemo() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/risk/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to load demo fixtures");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  const summary = intel?.summary;

  return (
    <>
      <Header title="Business Risk" />
      <PageMain>
        {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
        <p className="mb-6 text-sm text-slate-600">
          Evidence-backed operational risk intelligence. Residual risk does not improve merely because a control exists.
          No autonomous risk acceptance. Not legal advice or statutory compliance certification.
        </p>
        <div className="mb-6">
          <Button disabled={busy} onClick={() => void seedDemo()}>
            Load risk demo fixtures
          </Button>
        </div>

        <section className="mb-8" data-testid="bos-risk-summary">
          <SectionHeader title="Risk summary" description="Open high/extreme risks, tolerance breaches, overdue reviews, and control/obligation attention." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Open high/extreme" value={String(summary?.openHighRisks ?? 0)} tone="red" />
            <MetricCard label="Extreme residual" value={String(summary?.extremeResidualRisks ?? 0)} tone="red" />
            <MetricCard label="Outside tolerance" value={String(summary?.outsideTolerance ?? 0)} tone="amber" />
            <MetricCard label="Overdue reviews" value={String(summary?.overdueReviews ?? 0)} tone="amber" />
            <MetricCard label="Ineffective controls" value={String(summary?.ineffectiveControls ?? 0)} tone="amber" />
            <MetricCard label="Overdue obligations" value={String(summary?.overdueObligations ?? 0)} tone="amber" />
          </div>
        </section>

        <section className="mb-8" data-testid="bos-risk-register">
          <SectionHeader title="Risk register" description="Canonical risks with inherent/residual levels, tolerance, and evidence freshness." />
          <div className="mt-4 space-y-3">
            {(intel?.register.length ?? 0) === 0 && (
              <EmptyState title="No risks" description="Create a risk or load demo fixtures. This is not a passive register only — assessments drive residual risk." />
            )}
            {(intel?.register ?? []).map((row) => (
              <Card key={row.risk.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ShieldAlert className="h-4 w-4" />
                    <Link href={`/business/risk/${row.risk.id}`} className="text-blue-700 hover:underline">
                      {row.risk.reference} {row.risk.title}
                    </Link>
                  </CardTitle>
                  <StatusChip value={row.residualLevel} />
                </CardHeader>
                <CardContent className="space-y-1 p-4 pt-0 text-sm text-slate-600">
                  <p>
                    Category: {row.risk.category} · Owner: {row.risk.ownerLabel ?? "Unassigned"} · Status: {row.risk.status}
                  </p>
                  <p>
                    Inherent: {row.inherentLevel} · Residual: {row.residualLevel} · Tolerance: {row.toleranceStatus} ·
                    Treatment: {row.treatmentStrategy ?? "none"}
                  </p>
                  <p>
                    Review: {row.risk.reviewAt ? row.risk.reviewAt.slice(0, 10) : "Unknown"} · Evidence: {row.evidenceFreshness}
                    {row.risk.isDemo ? " · Demo" : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    Priority {row.priority.priority} ({row.priority.version}) · missing: {row.priority.missingInputs.join(", ") || "none"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-risk-controls">
          <SectionHeader title="Controls" description="Effectiveness requires evidence. Untested controls do not reduce residual risk." />
          <div className="mt-4 space-y-3">
            {controls.length === 0 && <EmptyState title="No controls" description="Link evidenced controls before expecting residual reduction." />}
            {controls.map((control) => (
              <Card key={control.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">{control.name}</CardTitle>
                  <StatusChip value={control.effectiveness} />
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">Status: {control.status}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-risk-obligations">
          <SectionHeader title="Obligations" description="Compliant requires evidence and authorized confirmation. Not statutory certification." />
          <div className="mt-4 space-y-3">
            {obligations.length === 0 && <EmptyState title="No obligations" description="Track due/overdue obligations without claiming legal compliance." />}
            {obligations.map((obligation) => (
              <Card key={obligation.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">{obligation.title}</CardTitle>
                  <StatusChip value={obligation.status} />
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">
                  Due: {obligation.dueAt ? obligation.dueAt.slice(0, 10) : "Unknown"}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-risk-attention">
          <SectionHeader title="Attention" description="Reuses BOS-1 signals and advisory recommendations." />
          <div className="mt-4 space-y-3">
            {(intel?.signals.length ?? 0) === 0 && (intel?.recommendations.length ?? 0) === 0 && (
              <EmptyState title="No risk attention" description="Signals appear when residual risk, controls, or obligations breach rules." />
            )}
            {(intel?.signals ?? []).map((signal) => (
              <Card key={signal.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">{signal.title}</CardTitle>
                  <StatusChip value={signal.severity} />
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">{signal.summary}</CardContent>
              </Card>
            ))}
            {(intel?.recommendations ?? []).map((rec) => (
              <Card key={rec.id}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">{rec.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">{rec.recommendationText}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-risk-data-quality">
          <SectionHeader title="Data quality" description="Missing, untested, or stale evidence. Unknown stays unknown." />
          <p className="mt-3 text-sm text-slate-600">
            Missing inputs: {(intel?.missingEvidence ?? []).join(", ") || "none reported"}
          </p>
          <p className="mt-2 text-xs text-slate-500">{intel?.disclaimer}</p>
        </section>
      </PageMain>
    </>
  );
}
