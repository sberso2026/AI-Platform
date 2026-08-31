"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hostedGet } from "@/lib/inspection-intelligence/hosted-client";
import { InspectionEngineerEntry } from "@/components/engineering/inspection-ai-engineer";
import type {
  CommandCentreAttentionItem,
  CommandCentreMetricCard,
  InspectionCommandCentreView,
} from "@rtb/inspection-intelligence";

function CardList({ card }: { card: CommandCentreMetricCard }) {
  return (
    <section
      className="rounded border border-slate-200 p-4"
      data-testid={`command-centre-card-${card.id}`}
      data-provenance-table={card.provenance.table}
      data-ai-derived="false"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-slate-500">{card.label}</h2>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
          {card.hint ? <p className="mt-1 text-xs text-slate-500">{card.hint}</p> : null}
          <p className="mt-2 text-[11px] text-slate-400" data-testid={`command-centre-provenance-${card.id}`}>
            Source: {card.provenance.table}
            {card.provenance.indicatorId ? ` · ${card.provenance.indicatorId}` : ""}
          </p>
        </div>
        <Link className="text-cyan-700 hover:underline" href={card.href}>
          Open
        </Link>
      </div>
      {card.items.length > 0 ? (
        <ul className="mt-3 divide-y text-sm">
          {card.items.slice(0, 6).map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2">
              <div>
                <p className="font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">
                  {[item.status, item.summary].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Link className="text-cyan-700 hover:underline" href={item.href}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No recorded rows.</p>
      )}
    </section>
  );
}

export function InspectionCommandCentre() {
  const [view, setView] = useState<InspectionCommandCentreView>();
  const [error, setError] = useState<string>();
  const [clientMs, setClientMs] = useState<number>();

  useEffect(() => {
    const started = performance.now();
    hostedGet<InspectionCommandCentreView>("command_centre")
      .then((data) => {
        setView(data);
        setClientMs(Math.round(performance.now() - started));
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load command centre"));
  }, []);

  if (!view && !error) {
    return <p className="text-slate-600" role="status">Loading Inspection Command Centre…</p>;
  }
  if (!view) {
    return <p className="text-red-700" role="alert">{error}</p>;
  }

  const queueCards = view.cards.filter((card) =>
    ["inspections_planned", "inspections_in_progress", "inspections_recently_completed"].includes(card.id),
  );
  const metricCards = view.cards.filter((card) =>
    [
      "open_defects",
      "unverified_defects",
      "outstanding_corrective_actions",
      "inspections_awaiting_verification",
      "condition_rating_distribution",
      "evidence_completeness",
    ].includes(card.id),
  );
  const activityCards = view.cards.filter((card) =>
    ["recent_inspection_activity", "recent_reports", "targets_requiring_attention"].includes(card.id),
  );

  return (
    <div className="space-y-6" data-testid="inspection-command-centre" data-ai-metrics="false">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Inspection Command Centre</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Recorded inspection state from hosted inspection plans, sessions, defects, evidence, condition
            ratings, corrective actions, and reports. Missing values stay unknown — they are not scored as
            healthy, risky, or remaining life.
          </p>
        </div>
        {view.canWrite ? (
          <Link
            className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-4 py-2 text-white"
            href="/engineering/apps/inspection-intelligence/plans/new"
          >
            New plan
          </Link>
        ) : (
          <p className="text-sm text-slate-500">You can view inspections. Creating records requires write access.</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <InspectionEngineerEntry commandCentre />
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/engineer">
          AI Inspection Engineer
        </Link>
        {clientMs !== undefined ? (
          <p className="text-xs text-slate-400" data-testid="inspection-command-centre-latency">
            Loaded in {clientMs} ms
            {view.profile?.totalMs !== undefined ? ` · server composition ${view.profile.totalMs} ms` : ""}
          </p>
        ) : null}
      </div>
      <nav className="flex flex-wrap gap-3 text-sm" aria-label="Inspection operational surfaces">
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/plans">Plans</Link>
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/sessions">Sessions</Link>
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/defects">Defects</Link>
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/evidence">Evidence</Link>
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/condition">Condition</Link>
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/actions">Corrective actions</Link>
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/review">Review</Link>
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/history">History</Link>
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/reports">Reports</Link>
        <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/engineer">AI Inspection Engineer</Link>
      </nav>
      <p className="text-xs text-slate-500" data-testid="command-centre-ai-boundary">
        AI Inspection Engineer may explain these recorded counts. It is advisory and is not a source of Command
        Centre metrics.
      </p>
      <div className="grid gap-4 md:grid-cols-3">{queueCards.map((card) => <CardList key={card.id} card={card} />)}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((card) => (
          <CardList key={card.id} card={card} />
        ))}
      </div>
      <section className="rounded border border-slate-200 p-4" data-testid="command-centre-attention">
        <h2 className="text-lg font-semibold text-slate-900">Recorded follow-up</h2>
        <p className="mt-1 text-sm text-slate-500">
          Items below are hosted records in an unfinished operational state. They are not a fabricated priority
          or probability.
        </p>
        {view.attentionItems.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No recorded follow-up items.</p>
        ) : (
          <ul className="mt-3 divide-y text-sm">
            {view.attentionItems.map((item: CommandCentreAttentionItem) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-slate-800">{item.explanation}</p>
                  <p className="text-xs text-slate-500">
                    {item.reasonCode} · {item.provenance.table}
                  </p>
                </div>
                <Link className="text-cyan-700 hover:underline" href={item.href}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {activityCards.map((card) => (
          <CardList key={card.id} card={card} />
        ))}
      </div>
      <ul className="text-xs text-slate-500">
        {view.limitations.map((limitation) => (
          <li key={limitation}>{limitation}</li>
        ))}
      </ul>
    </div>
  );
}
