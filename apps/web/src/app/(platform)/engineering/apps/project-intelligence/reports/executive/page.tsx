"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type WidgetMetric = {
  widgetId: string;
  label: string;
  value: number | string;
  unit?: string;
  drillDownPath: string;
  owner: string;
  citations?: { source: string; refId: string; excerpt?: string }[];
};

type DashboardSnapshot = {
  liveAggregation: boolean;
  duplicateStorage: boolean;
  generatedAt: string;
  widgets: WidgetMetric[];
};

type SummaryDraft = {
  status: string;
  narrative: string;
  citations: { source: string; refId: string }[];
  humanReviewRequired: boolean;
  mayPublishWithoutHuman: boolean;
  traceId: string;
};

export default function ExecutiveIntelligenceDashboardPage() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<SummaryDraft | null>(null);
  const [published, setPublished] = useState<string>();
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/engineering/project-intelligence/reports/executive-dashboard")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load dashboard");
        setSnapshot(payload.data);
        setError(undefined);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generateSummary() {
    setBusy(true);
    setPublished(undefined);
    try {
      const response = await fetch(
        "/api/engineering/project-intelligence/reports/executive-dashboard",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "generate_summary" }),
        },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Unable to generate summary");
      setDraft(payload.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  async function publishSummary() {
    if (!draft) return;
    setBusy(true);
    try {
      const response = await fetch(
        "/api/engineering/project-intelligence/reports/executive-dashboard",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "publish_summary", draft }),
        },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Unable to publish summary");
      setPublished(payload.data.narrative);
      setDraft(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section data-testid="executive-intelligence-dashboard-loading">
        <div data-testid="reporting-intelligence-ready">
          <h2 className="text-2xl font-semibold text-slate-900">Executive Intelligence Dashboard</h2>
          <p className="mt-4 text-slate-600" role="status">
            Loading live aggregation…
          </p>
        </div>
      </section>
    );
  }

  if (error && !snapshot) {
    return (
      <section data-testid="executive-intelligence-dashboard-error">
        <div data-testid="reporting-intelligence-ready">
          <h2 className="text-2xl font-semibold text-slate-900">Executive Intelligence Dashboard</h2>
          <p className="mt-4 text-red-700" role="alert">
            {error}
          </p>
          <button
            type="button"
            className="mt-4 rounded-md border border-slate-300 px-3 py-2 text-sm"
            onClick={load}
            data-testid="executive-dashboard-retry"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="executive-intelligence-dashboard-ready">
      <div data-testid="reporting-intelligence-ready">
        <p className="text-sm font-medium text-cyan-700">Reporting Intelligence</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Executive Intelligence Dashboard</h2>
        <p className="mt-2 max-w-3xl text-slate-600">
          Live aggregation from Document Intelligence, Meeting Intelligence, Findings Intelligence,
          and Engineering Core. No duplicate ownership. Drill down preserves originating feature
          context. AI executive summaries require human review before publish.
        </p>
        <p
          className="mt-2 text-sm font-medium text-slate-700"
          data-testid="executive-dashboard-scope"
        >
          Scope: All Projects (workspace) — not project-specific. Counts include the full tenant /
          workspace footprint (demo and unscoped records may appear).
        </p>
        {snapshot ? (
          <p className="mt-2 text-xs text-slate-500" data-testid="executive-dashboard-live-flag">
            liveAggregation={String(snapshot.liveAggregation)} · duplicateStorage=
            {String(snapshot.duplicateStorage)} · generatedAt={snapshot.generatedAt}
          </p>
        ) : null}

        <div
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          data-testid="executive-dashboard-widgets"
        >
          {(snapshot?.widgets ?? []).map((widget) => (
            <article
              key={widget.widgetId}
              className="rounded-lg border border-slate-200 p-4"
              data-testid={`executive-widget-${widget.widgetId}`}
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">{widget.owner}</p>
              <h3 className="mt-1 font-medium text-slate-900">{widget.label}</h3>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {widget.value}
                {widget.unit ? (
                  <span className="ml-1 text-sm font-normal text-slate-500">{widget.unit}</span>
                ) : null}
              </p>
              <Link
                className="mt-3 inline-block text-sm text-cyan-700 hover:underline"
                href={widget.drillDownPath}
                data-testid={`executive-widget-drilldown-${widget.widgetId}`}
              >
                Open source
              </Link>
            </article>
          ))}
        </div>

        <div
          className="mt-10 rounded-lg border border-slate-200 p-5"
          data-testid="executive-ai-summary-panel"
        >
          <h3 className="text-lg font-semibold text-slate-900">AI Executive Summary</h3>
          <p className="mt-1 text-sm text-slate-600">
            Generated through Platform AI Runtime. Human review is required before publishing.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
              disabled={busy}
              onClick={() => void generateSummary()}
              data-testid="executive-summary-generate"
            >
              Generate draft
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 disabled:opacity-50"
              disabled={busy || !draft}
              onClick={() => void publishSummary()}
              data-testid="executive-summary-publish"
            >
              Publish after review
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              onClick={load}
              data-testid="executive-dashboard-refresh"
            >
              Refresh live metrics
            </button>
          </div>
          {draft ? (
            <div className="mt-4" data-testid="executive-summary-draft">
              <p className="text-sm font-medium text-amber-800">
                Draft · humanReviewRequired={String(draft.humanReviewRequired)} ·
                mayPublishWithoutHuman={String(draft.mayPublishWithoutHuman)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{draft.narrative}</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-500">
                {draft.citations.map((c) => (
                  <li key={`${c.source}-${c.refId}`}>
                    {c.source}:{c.refId}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {published ? (
            <p className="mt-4 text-sm text-emerald-800" data-testid="executive-summary-published">
              Published: {published}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 text-sm">
          <Link
            className="text-cyan-700 hover:underline"
            href="/engineering/apps/project-intelligence/reports"
          >
            Back to Reporting Intelligence
          </Link>
        </div>
      </div>
    </section>
  );
}
