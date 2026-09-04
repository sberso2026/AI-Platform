"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
import { asList, asRecord, pickString, readOperationalJson } from "@/lib/engineering/module-ops";

type TwinIdentity = Record<string, unknown>;
type SurfaceBlock = { present?: boolean; data?: unknown };

function DigitalTwinOverviewInner() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get("assetId");
  const requestedTwin = searchParams.get("twinId");
  const [twins, setTwins] = useState<TwinIdentity[]>([]);
  const [surfaces, setSurfaces] = useState<Record<string, SurfaceBlock> | null>(null);
  const [identity, setIdentity] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    readOperationalJson<{ identities?: { data?: TwinIdentity[] } }>(
      "/api/engineering/digital-twin/workspace-snapshot",
    ).then(async (snap) => {
      if (!snap.ok) {
        setError(snap.error ?? "load_failed");
        setTwins([]);
        setLoading(false);
        return;
      }
      const list = asList(snap.data?.identities?.data ?? snap.data?.identities) as TwinIdentity[];
      const scoped = assetId
        ? list.filter((twin) => pickString(asRecord(twin), ["canonicalEntityId", "assetId", "asset_id"]) === assetId)
        : list;
      setTwins(scoped);
      const twinId =
        requestedTwin ?? pickString(asRecord(scoped[0]), ["twinId", "id", "twin_id"], "");
      if (!twinId) {
        setSurfaces(null);
        setIdentity(null);
        setError(null);
        setLoading(false);
        return;
      }
      const detail = await readOperationalJson<{
        identity?: { data?: Record<string, unknown> };
        surfaces?: Record<string, SurfaceBlock>;
      }>(`/api/engineering/digital-twin/twin-snapshot?twinId=${encodeURIComponent(twinId)}`);
      if (!detail.ok) {
        setError(detail.error ?? "load_failed");
        setSurfaces(null);
        setLoading(false);
        return;
      }
      setIdentity(detail.data?.identity?.data ?? asRecord(scoped[0]));
      setSurfaces(detail.data?.surfaces ?? null);
      setError(null);
      setLoading(false);
    });
  }, [assetId, requestedTwin]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedId = pickString(identity ?? asRecord(twins[0]), ["twinId", "id", "twin_id"], "");
  const state = surfaces?.state;
  const history = surfaces?.snapshot_history;
  const representation = surfaces?.representations;
  const telemetry = surfaces?.telemetry_bindings;
  const thread = surfaces?.digital_thread;

  const latestStamp = useMemo(() => {
    const rec = asRecord(Array.isArray(state?.data) ? (state?.data as unknown[])[0] : state?.data);
    return pickString(rec, ["updatedAt", "updated_at", "recordedAt", "publishedAt"], "");
  }, [state]);

  return (
    <section data-testid="digital-twin-ready" aria-labelledby="dt-overview-title">
      <div data-testid="digital-twin-v1-ready">
        <h1 id="dt-overview-title" className="text-2xl font-semibold text-slate-900">
          Twin workspace
        </h1>
        <OperationalPageIntro
          purpose="Selected twin identity, current state, latest timestamp, bound evidence, representation, telemetry, and history."
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

        {loading ? (
          <div className="mt-6">
            <OperationalSkeleton />
          </div>
        ) : null}
        {error ? (
          <div className="mt-6">
            <OperationalError message={error} onRetry={load} />
          </div>
        ) : null}

        {!loading && twins.length === 0 ? (
          <div className="mt-6">
            <EmptyOperationalState
              title="No digital twin has been linked to this asset."
              description="Twin identity is recorded when a twin is registered against a canonical asset or project."
              testId="dt-empty-twins"
            />
          </div>
        ) : null}

        {!loading && twins.length > 0 ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4" data-testid="dt-identity-card">
                <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-slate-500">Twin identity</p>
                <p className="mt-1 font-mono text-sm text-slate-900">{selectedId || "—"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4" data-testid="dt-state-card">
                <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-slate-500">Current state</p>
                <p className="mt-1 text-sm text-slate-800">
                  {state?.present ? "Recorded state available" : "No published state yet"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-slate-500">Latest timestamp</p>
                <p className="mt-1 text-sm text-slate-800">{latestStamp || "Not recorded"}</p>
              </div>
              <OperationalMetricCard
                label="Twins in scope"
                value={twins.length}
                href="/engineering/apps/digital-twin/twins"
                testId="dt-twin-count"
              />
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <OverviewSignal label="Representation" present={Boolean(representation?.present)} href="/engineering/apps/digital-twin/representation" empty="No model or spatial representation is currently linked." />
              <OverviewSignal label="Telemetry" present={Boolean(telemetry?.present)} href="/engineering/apps/digital-twin/telemetry" empty="No telemetry bindings are recorded." />
              <OverviewSignal label="History" present={Boolean(history?.present)} href="/engineering/apps/digital-twin/history" empty="No history snapshots are recorded." />
              <OverviewSignal label="Digital thread" present={Boolean(thread?.present)} href="/engineering/apps/digital-twin/digital-thread" empty="No digital-thread links are recorded." />
            </dl>

            <h2 className="mt-8 text-lg font-semibold">Selectable twins</h2>
            <StatusTable
              testId="dt-twins-table"
              columns={[
                { key: "twin", label: "Twin identity", hrefKey: true },
                { key: "entity", label: "Linked record" },
                { key: "status", label: "Status", status: true },
              ]}
              rows={twins.slice(0, 12).map((twin) => {
                const rec = asRecord(twin);
                const id = pickString(rec, ["twinId", "id", "twin_id"]);
                return {
                  id,
                  twin: id,
                  entity: `${pickString(rec, ["canonicalEntityType", "entityType"], "—")} ${pickString(rec, ["canonicalEntityId", "assetId"], "")}`.trim(),
                  status: pickString(rec, ["status"], "recorded"),
                  href: `/engineering/apps/digital-twin/twins/${id}`,
                } satisfies OperationalRow;
              })}
              emptyTitle="No digital twin has been linked to this asset."
              emptyDescription="No twin identities are recorded in this workspace yet."
            />
          </>
        ) : null}
      </div>
    </section>
  );
}

function OverviewSignal({
  label,
  present,
  href,
  empty,
}: {
  label: string;
  present: boolean;
  href: string;
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <dt className="text-sm font-semibold text-slate-900">{label}</dt>
      <dd className="mt-1 text-sm text-slate-600">{present ? "Recorded" : empty}</dd>
      <Link href={href} className="mt-2 inline-flex min-h-11 items-center text-sm font-medium underline">
        Inspect
      </Link>
    </div>
  );
}

export default function DigitalTwinOverviewPage() {
  return (
    <Suspense fallback={<OperationalSkeleton />}>
      <DigitalTwinOverviewInner />
    </Suspense>
  );
}
