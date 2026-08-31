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
  StatusTable,
  type OperationalRow,
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
              Last snapshot
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {twins.length > 0 ? "Recorded identities in this workspace" : "No twins recorded"}
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold">Selectable twins</h2>
        {!loading && twins.length === 0 ? (
            <EmptyOperationalState
              title="No models connected"
              description="No twin identities are recorded in this workspace yet. That is normal before a twin is registered. Technical certification remains under Governance."
              testId="dt-empty-twins"
            />
        ) : null}
        {!loading && twins.length > 0 ? (
          <StatusTable
            testId="dt-twins-table"
            columns={[
              { key: "twin", label: "Twin / asset identity", hrefKey: true },
              { key: "entity", label: "Linked record" },
              { key: "status", label: "Current state", status: true },
              { key: "source", label: "Source system" },
            ]}
            rows={twins.slice(0, 12).map((twin) => {
              const id = String(twin.twinId ?? twin.id ?? "");
              return {
                id,
                twin: id,
                entity: `${String(twin.canonicalEntityType ?? "—")} ${String(twin.canonicalEntityId ?? "")}`.trim(),
                status: String(twin.status ?? "recorded"),
                source: "recorded",
                href: `/engineering/apps/digital-twin/twins/${id}`,
              } satisfies OperationalRow;
            })}
            emptyTitle="No models connected"
            emptyDescription="No twin identities are recorded in this workspace yet."
          />
        ) : null}

        <p className="mt-6 text-xs text-slate-500" data-testid="dt-unavailable-count">
          Unavailable capabilities documented on Governance ({unavailable.length} entries).
        </p>
      </div>
    </section>
  );
}
