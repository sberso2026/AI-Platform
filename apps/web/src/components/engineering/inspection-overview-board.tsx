"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hostedGet, planTargetSummary, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

type Overview = {
  planned: InspectionRow[];
  inProgress: InspectionRow[];
  recentlyCompleted: InspectionRow[];
  sessionsWithoutRegisteredEvidence: string[];
  canWrite?: boolean;
};

function RowList({
  title,
  empty,
  rows,
  hrefFor,
}: {
  title: string;
  empty: string;
  rows: InspectionRow[];
  hrefFor: (row: InspectionRow) => string;
}) {
  return (
    <section className="rounded border border-slate-200 p-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y">
          {rows.map((row) => (
            <li key={String(row.id)} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">{String(row.title ?? row.status)}</p>
                <p className="text-slate-500">
                  {String(row.status)} · {planTargetSummary(row)}
                </p>
              </div>
              <Link className="text-cyan-700 hover:underline" href={hrefFor(row)}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function InspectionOverviewBoard() {
  const [overview, setOverview] = useState<Overview>();
  const [error, setError] = useState<string>();
  const [startedAt, setStartedAt] = useState<number>();

  useEffect(() => {
    const started = performance.now();
    hostedGet<Overview>("overview")
      .then((data) => {
        setOverview(data);
        setStartedAt(Math.round(performance.now() - started));
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load inspections"));
  }, []);

  if (!overview && !error) {
    return <p className="text-slate-600" role="status">Loading inspections…</p>;
  }
  if (!overview) {
    return <p className="text-red-700" role="alert">{error}</p>;
  }

  return (
    <div className="space-y-6" data-testid="inspection-operational-overview">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Inspection Intelligence</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Plan inspections, run sessions, and record observations, measurements, and evidence
            against canonical project, asset, and location targets.
          </p>
        </div>
        {overview.canWrite === false ? (
          <p className="text-sm text-slate-500">You can view inspections. Creating or changing records requires write access.</p>
        ) : (
          <Link
            className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-4 py-2 text-white"
            href="/engineering/apps/inspection-intelligence/plans/new"
          >
            New plan
          </Link>
        )}
      </div>
      {startedAt !== undefined ? (
        <p className="text-xs text-slate-400" data-testid="inspection-overview-latency">
          Loaded in {startedAt} ms
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <RowList
          title="Planned"
          empty="No planned inspections."
          rows={overview.planned}
          hrefFor={(row) => `/engineering/apps/inspection-intelligence/plans/${row.id}`}
        />
        <RowList
          title="In progress"
          empty="No sessions in progress."
          rows={overview.inProgress}
          hrefFor={(row) => `/engineering/apps/inspection-intelligence/sessions/${row.id}`}
        />
        <RowList
          title="Recently completed"
          empty="No completed sessions yet."
          rows={overview.recentlyCompleted}
          hrefFor={(row) => `/engineering/apps/inspection-intelligence/sessions/${row.id}`}
        />
      </div>
      {overview.sessionsWithoutRegisteredEvidence.length > 0 ? (
        <p className="text-sm text-slate-600">
          {overview.sessionsWithoutRegisteredEvidence.length} in-progress session
          {overview.sessionsWithoutRegisteredEvidence.length === 1 ? "" : "s"} have no registered
          evidence yet. That is unset, not a failed result.
        </p>
      ) : null}
    </div>
  );
}
