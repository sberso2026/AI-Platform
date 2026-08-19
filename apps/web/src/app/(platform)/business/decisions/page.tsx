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
import { Gavel } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type QueueItem = {
  id: string;
  statement: string;
  question: string;
  domain: string;
  priority: { priority: string; version: string; missingInputs: string[] };
  ownerLabel?: string | null;
  dueAt?: string | null;
  originatingSignalId?: string | null;
  evidenceCompletenessBps: string | null;
  status: string;
  isDemo: boolean;
};

type OutcomeRow = {
  id: string;
  decisionId: string;
  status: string;
  expectedOutcome?: string | null;
  actualOutcome?: string | null;
  varianceState: string;
  varianceValue?: string | null;
  measurementDate?: string | null;
};

type LessonRow = {
  id: string;
  decisionId: string;
  lessonText: string;
  status: string;
  draftSource: string;
};

type Summary = {
  pendingDecisions: number;
  overdueDecisions: number;
  criticalDecisions: number;
  decisionsWithoutEvidence: number;
  overdueActions: number;
  blockedActions: number;
  containsDemoData: boolean;
  disclaimer?: string;
};

function completeness(value: string | null | undefined): string {
  if (value === null || value === undefined) return "Unknown";
  return `${(Number(value) / 100).toFixed(0)}%`;
}

export default function DecisionIntelligencePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [summaryRes, queueRes, outcomesRes, lessonsRes] = await Promise.all([
      parseApiJsonResponse<Summary>(await fetch("/api/business/decisions/summary")),
      parseApiJsonResponse<QueueItem[]>(await fetch("/api/business/decisions/queue")),
      parseApiJsonResponse<OutcomeRow[]>(await fetch("/api/business/decisions/outcomes")),
      parseApiJsonResponse<LessonRow[]>(await fetch("/api/business/decisions/lessons")),
    ]);
    if (!summaryRes.ok || !summaryRes.data) {
      setError(summaryRes.errorMessage ?? "Access denied");
      setSummary(null);
      return;
    }
    setError(null);
    setSummary(summaryRes.data);
    setQueue(Array.isArray(queueRes.data) ? queueRes.data : []);
    setOutcomes(Array.isArray(outcomesRes.data) ? outcomesRes.data : []);
    setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedDemo() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/decisions/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to load demo fixtures");
      else await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header
        title="Decision Intelligence"
        description="Evidence-backed options, impact, and outcomes over existing Decision/Action records — not a second task system. No autonomous approval."
        showEngineeringChrome={false}
      />
      <PageMain data-testid="bos-decisions-shell">
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}
        {summary?.containsDemoData && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Demo decision fixtures are loaded. AI proposals are labelled. Final approval remains human.
          </div>
        )}

        <section className="mb-8" data-testid="bos-decisions-summary">
          <SectionHeader title="Decision & action summary" description="Pending, overdue, evidence gaps, and blocked actions from BOS records." />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Pending" value={String(summary?.pendingDecisions ?? 0)} tone="blue" />
            <MetricCard label="Overdue" value={String(summary?.overdueDecisions ?? 0)} tone="red" />
            <MetricCard label="Critical" value={String(summary?.criticalDecisions ?? 0)} tone="red" />
            <MetricCard label="Missing evidence" value={String(summary?.decisionsWithoutEvidence ?? 0)} tone="amber" />
            <MetricCard label="Overdue actions" value={String(summary?.overdueActions ?? 0)} tone="amber" />
            <MetricCard label="Blocked actions" value={String(summary?.blockedActions ?? 0)} tone="amber" />
          </div>
          <p className="mt-3 text-sm text-slate-600">{summary?.disclaimer}</p>
          <Button className="mt-3" variant="secondary" disabled={busy} onClick={() => void seedDemo()}>
            Load demo fixtures
          </Button>
        </section>

        <section className="mb-8" data-testid="bos-decisions-queue">
          <SectionHeader title="Decision queue" description="Question, domain, priority, owner, due date, originating signal, evidence completeness, and status." />
          <div className="mt-4 space-y-3">
            {queue.length === 0 && (
              <EmptyState icon={<Gavel className="h-8 w-8" />} title="No decisions" description="Create a decision in Owner Command or load demo fixtures." />
            )}
            {queue.map((row) => (
              <Card key={row.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <div>
                    <CardTitle className="text-sm">
                      <Link href={`/business/decisions/${row.id}`} className="text-blue-700 hover:underline">
                        {row.question}
                      </Link>
                    </CardTitle>
                    <p className="text-xs text-slate-500">{row.statement}</p>
                  </div>
                  <StatusChip value={row.priority.priority} />
                </CardHeader>
                <CardContent className="space-y-1 p-4 pt-0 text-sm text-slate-600">
                  <p>
                    Domain: {row.domain} · Owner: {row.ownerLabel ?? "Unassigned"} · Status: {row.status}
                  </p>
                  <p>
                    Due: {row.dueAt ? row.dueAt.slice(0, 10) : "Unknown"} · Evidence: {completeness(row.evidenceCompletenessBps)}
                    {row.originatingSignalId ? " · Originating signal linked" : " · No originating signal"}
                    {row.isDemo ? " · Demo" : ""}
                  </p>
                  <p className="text-xs text-slate-500">Priority {row.priority.version} · missing: {row.priority.missingInputs.join(", ") || "none"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-decisions-outcomes">
          <SectionHeader title="Outcomes" description="Expected vs actual results. Incomparable metrics stay unknown." />
          <div className="mt-4 space-y-3">
            {outcomes.length === 0 && <EmptyState title="No outcomes" description="Record expected and actual outcomes after implementation." />}
            {outcomes.map((row) => (
              <Card key={row.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">
                    <Link href={`/business/decisions/${row.decisionId}`} className="text-blue-700 hover:underline">
                      {row.expectedOutcome ?? "Outcome"}
                    </Link>
                  </CardTitle>
                  <StatusChip value={row.status} />
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">
                  <p>Actual: {row.actualOutcome ?? "Unknown"}</p>
                  <p>
                    Variance: {row.varianceState === "computed" ? row.varianceValue : "unknown"} · Measured:{" "}
                    {row.measurementDate ?? "Unknown"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-decisions-memory">
          <SectionHeader title="Decision memory" description="Point-in-time lessons. AI drafts require human acceptance before organisational knowledge." />
          <div className="mt-4 space-y-3">
            {lessons.length === 0 && <EmptyState title="No lessons" description="Lessons appear after outcomes are reviewed." />}
            {lessons.map((row) => (
              <Card key={row.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                  <CardTitle className="text-sm">
                    <Link href={`/business/decisions/${row.decisionId}`} className="text-blue-700 hover:underline">
                      {row.lessonText}
                    </Link>
                  </CardTitle>
                  <StatusChip value={row.status} />
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-slate-600">
                  <p>
                    Source: {row.draftSource}
                    {row.status === "accepted" ? " · Organisational knowledge" : " · Not organisational knowledge"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </PageMain>
    </>
  );
}
