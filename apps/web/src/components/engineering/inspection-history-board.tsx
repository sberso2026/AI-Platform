"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { hostedGet, planTargetSummary, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

type HistoryLanding = {
  rows: Array<{
    sessionId: string;
    planId?: string;
    planTitle?: string;
    inspectionType?: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    createdAt?: string;
    targets: InspectionRow[];
    provenance: { sessionId: string };
  }>;
  profile?: { totalMs: number };
};

type HistoryIntel = {
  inspectionsCompletedOverPeriod: { value: number; periodUnknown: number };
  inspectionsAwaitingVerification: { pendingVerifications: number; sessions: number };
  outstandingCorrectiveActions: { value: number };
  evidenceCompleteness: { withoutRegisteredEvidence: number; sessionsConsidered: number; note: string };
  openDefectsOverTime: { unknownStatus: number; undated: number };
};

export function InspectionHistoryBoard() {
  const [data, setData] = useState<HistoryLanding>();
  const [intel, setIntel] = useState<HistoryIntel>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  async function load(params: Record<string, string> = {}) {
    setLoading(true);
    setError(undefined);
    try {
      const [history, nextIntel] = await Promise.all([
        hostedGet<HistoryLanding>("history", params),
        hostedGet<HistoryIntel>("history_intelligence", params),
      ]);
      setData(history);
      setIntel(nextIntel);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load inspection history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params: Record<string, string> = {};
    for (const key of ["targetKind", "targetCanonicalId", "planId", "from", "to", "inspectionType"]) {
      const value = String(form.get(key) ?? "").trim();
      if (!value) continue;
      if (key === "from" || key === "to") {
        const parsed = new Date(value);
        params[key] = Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
      } else {
        params[key] = value;
      }
    }
    load(params).catch(() => undefined);
  }

  return (
    <section data-testid="inspection-history-ready">
      <p className="text-sm font-medium text-cyan-700">Inspection History</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">Inspection history</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Chronological projection over hosted inspection sessions. This is not Asset Intelligence, Twin, or
        Project Intelligence history. Inspector/actor is UNKNOWN unless a canonical assignment records it.
      </p>
      <form className="mt-4 grid gap-2 md:grid-cols-3" onSubmit={apply}>
        <select name="targetKind" className="rounded border px-3 py-2">
          <option value="">Any target kind</option>
          {["project", "asset", "location"].map((kind) => (
            <option key={kind} value={kind}>{kind}</option>
          ))}
        </select>
        <input name="targetCanonicalId" className="rounded border px-3 py-2" placeholder="Target canonical id" />
        <input name="inspectionType" className="rounded border px-3 py-2" placeholder="Inspection type (pack id)" />
        <input name="from" type="datetime-local" className="rounded border px-3 py-2" />
        <input name="to" type="datetime-local" className="rounded border px-3 py-2" />
        <button className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white">Apply filters</button>
      </form>
      {intel ? (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4" data-testid="inspection-history-intelligence">
          <div className="rounded border p-3">
            <dt className="text-slate-500">Completed in filter</dt>
            <dd className="text-xl font-semibold">{intel.inspectionsCompletedOverPeriod.value}</dd>
          </div>
          <div className="rounded border p-3">
            <dt className="text-slate-500">Pending verifications</dt>
            <dd className="text-xl font-semibold">{intel.inspectionsAwaitingVerification.pendingVerifications}</dd>
          </div>
          <div className="rounded border p-3">
            <dt className="text-slate-500">Outstanding CAs</dt>
            <dd className="text-xl font-semibold">{intel.outstandingCorrectiveActions.value}</dd>
          </div>
          <div className="rounded border p-3">
            <dt className="text-slate-500">Sessions without evidence</dt>
            <dd className="text-xl font-semibold">{intel.evidenceCompleteness.withoutRegisteredEvidence}</dd>
          </div>
        </dl>
      ) : null}
      {error ? <p className="mt-4 text-red-700" role="alert">{error}</p> : null}
      {loading ? <p className="mt-4 text-slate-600" role="status">Loading history…</p> : null}
      {!loading && data ? (
        <ul className="mt-6 divide-y rounded border">
          {data.rows.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No inspection sessions match these filters.</li>
          ) : (
            data.rows.map((row) => {
              const target = row.targets[0];
              const kind = target ? String(target.kind ?? "") : "";
              const canonicalId = target ? String(target.canonicalId ?? "") : "";
              return (
                <li key={row.sessionId} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{row.planTitle ?? row.sessionId.slice(0, 8)}</p>
                    <p className="text-slate-500">
                      {row.status} · {planTargetSummary({ targets: row.targets })} · {row.startedAt ?? row.createdAt ?? "timestamp unknown"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/inspection-intelligence/sessions/${row.sessionId}`}>
                      Session
                    </Link>
                    {kind && canonicalId ? (
                      <Link
                        className="text-cyan-700 hover:underline"
                        href={`/engineering/apps/inspection-intelligence/history/targets/${encodeURIComponent(kind)}/${encodeURIComponent(canonicalId)}`}
                      >
                        Target history
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
      {data?.profile ? <p className="mt-2 text-xs text-slate-400">Loaded in {data.profile.totalMs} ms</p> : null}
    </section>
  );
}
