"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hostedGet, planTargetSummary, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

export function InspectionSessionList() {
  const [sessions, setSessions] = useState<InspectionRow[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState<number>();

  useEffect(() => {
    const started = performance.now();
    hostedGet<InspectionRow[]>("sessions")
      .then((rows) => {
        setSessions(rows);
        setLatency(Math.round(performance.now() - started));
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load sessions"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-600" role="status">Loading sessions…</p>;
  if (error) return <p className="text-red-700" role="alert">{error}</p>;

  return (
    <section data-testid="inspection-sessions-ready">
      <p className="text-sm font-medium text-cyan-700">Inspection Execution</p>
      <h1 id="ii-sessions-title" className="mt-1 text-2xl font-semibold text-slate-900">
        Sessions
      </h1>
      <p className="mt-2 text-slate-600">Resume in-progress work or open a completed session as read-only.</p>
      {latency !== undefined ? <p className="mt-2 text-xs text-slate-400">Loaded in {latency} ms</p> : null}
      {sessions.length === 0 ? (
        <p className="mt-6 text-slate-500">
          No sessions yet.{" "}
          <Link className="text-cyan-700 hover:underline" href="/engineering/apps/inspection-intelligence/plans">
            Start from a plan
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 divide-y rounded border border-slate-200">
          {sessions.map((session) => (
            <li key={String(session.id)} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{String(session.status)}</p>
                <p className="text-sm text-slate-500">{planTargetSummary(session)}</p>
              </div>
              <Link
                className="text-cyan-700 hover:underline"
                href={`/engineering/apps/inspection-intelligence/sessions/${session.id}`}
              >
                {["assigned", "started", "paused"].includes(String(session.status)) ? "Resume" : "Open"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
