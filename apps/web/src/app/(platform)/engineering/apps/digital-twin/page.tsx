"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AskEngineeringAI,
  EmptyOperationalState,
  OperationalError,
  OperationalMetricCard,
  OperationalPageIntro,
  OperationalSkeleton,
} from "@/components/engineering/operational";

type TwinIdentity = {
  twinId?: string;
  id?: string;
  canonicalEntityType?: string;
  canonicalEntityId?: string;
  status?: string;
};

export default function DigitalTwinOverviewPage() {
  const [twins, setTwins] = useState<TwinIdentity[]>([]);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();
    fetch("/api/engineering/digital-twin/workspace-snapshot")
      .then(async (r) => {
        if (!r.ok) throw new Error(`snapshot_${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        const list = (json.data?.identities?.data ?? []) as TwinIdentity[];
        setTwins(Array.isArray(list) ? list : []);
        setUnavailable(Array.isArray(json.data?.unavailable) ? json.data.unavailable : []);
        console.info(`[eos-ux-1] digital-twin wall_ms=${Math.round(performance.now() - started)}`);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "load_failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section data-testid="digital-twin-ready" aria-labelledby="dt-overview-title">
      <div data-testid="digital-twin-v1-ready">
        <h1 id="dt-overview-title" className="text-2xl font-semibold text-slate-900">
          Digital Twin
        </h1>
        <OperationalPageIntro
          purpose="Select a twin to review recorded state, last update, telemetry bindings, and digital thread."
          primaryAction={
            <Link
              href="/engineering/apps/digital-twin/twins"
              className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
            >
              Browse twins
            </Link>
          }
        />
        <AskEngineeringAI q="Summarize recorded twin state in this workspace." />

        {loading ? <div className="mt-6"><OperationalSkeleton /></div> : null}
        {error ? (
          <div className="mt-6">
            <OperationalError message={error} />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <OperationalMetricCard
            label="Twins"
            value={twins.length}
            href="/engineering/apps/digital-twin/twins"
            testId="dt-twin-count"
          />
          <OperationalMetricCard
            label="With recorded identity"
            value={twins.filter((t) => t.status).length}
            href="/engineering/apps/digital-twin/twins"
          />
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-slate-500">
              Boundaries
            </p>
            <p className="mt-1 text-xs text-slate-600">
              No actuation, control, predictive twin, or native solver. Unavailable capabilities are
              listed under Governance ({unavailable.length} entries).
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold">Selectable twins</h2>
        {twins.length === 0 && !loading ? (
          <>
            <EmptyOperationalState
              title="No twins in this workspace yet"
              description="Twin identities appear here when recorded. This empty state is truthful."
              testId="dt-empty-twins"
            />
          </>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {twins.slice(0, 12).map((twin) => {
              const id = String(twin.twinId ?? twin.id ?? "");
              return (
                <li key={id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium">{id.slice(0, 12)}…</p>
                    <p className="text-xs text-slate-500">
                      Linked record: {String(twin.canonicalEntityType ?? "—")}{" "}
                      {String(twin.canonicalEntityId ?? "")}
                    </p>
                  </div>
                  <Link
                    href={`/engineering/apps/digital-twin/twins/${id}`}
                    className="text-sm font-medium underline-offset-2 hover:underline"
                  >
                    Open twin
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-6 text-xs text-slate-500" data-testid="dt-unavailable-count">
          Unavailable capabilities documented on Governance ({unavailable.length} entries).
        </p>
      </div>
    </section>
  );
}
