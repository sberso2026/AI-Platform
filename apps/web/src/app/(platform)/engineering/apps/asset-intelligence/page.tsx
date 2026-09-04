"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AskEngineeringAI,
  EmptyOperationalState,
  OperationalError,
  OperationalMetricCard,
  OperationalPageIntro,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { asList, asRecord, pickString, readOperationalJson } from "@/lib/engineering/module-ops";
import {
  useEngineeringProjectFilter,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";

type AssetRow = {
  id: string;
  asset_tag?: string;
  asset_name?: string;
  project_id?: string | null;
  status?: string;
  criticality?: string;
};

type InspectionWorkflow = {
  sessions?: unknown[];
  evidence?: unknown[];
  defects?: unknown[];
};

export default function AssetIntelligenceOverviewPage() {
  const projectId = useEngineeringProjectFilter();
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [inspections, setInspections] = useState<InspectionWorkflow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      readOperationalJson<AssetRow[]>(withProjectQuery("/api/engineering/assets", projectId)),
      readOperationalJson<InspectionWorkflow>("/api/engineering/inspection-intelligence/workflow"),
    ]).then(([assetsRes, inspRes]) => {
      if (!assetsRes.ok) {
        setError(assetsRes.error ?? "load_failed");
        setAssets([]);
      } else {
        setAssets(Array.isArray(assetsRes.data) ? assetsRes.data : []);
        setError(null);
      }
      setInspections(inspRes.ok ? inspRes.data : null);
      setLoading(false);
    });
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const attention = assets.filter(
    (a) => a.criticality === "high" || a.criticality === "critical" || a.status === "attention",
  );
  const sessions = asList(inspections?.sessions);
  const evidence = asList(inspections?.evidence);

  const deterioratingNote = useMemo(() => {
    return "Deterioration is shown only when a degradation assessment has been published for an asset.";
  }, []);

  return (
    <section data-testid="asset-intelligence-ready" aria-labelledby="ai-overview-title">
      <div data-testid="asset-intelligence-v1-ready">
        <h1 id="ai-overview-title" className="text-2xl font-semibold text-slate-900">
          Asset overview
        </h1>
        <OperationalPageIntro
          purpose="Which assets require attention, what condition changed, what is deteriorating, and what needs engineering review."
          primaryAction={
            <Link
              href="/engineering/apps/asset-intelligence/assets"
              className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
            >
              Open asset register
            </Link>
          }
        />
        <AskEngineeringAI q="Which assets require attention from recorded evidence?" />

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

        {!loading && !error ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <OperationalMetricCard
              label="Assets in scope"
              value={assets.length}
              href="/engineering/apps/asset-intelligence/assets"
              testId="ai-asset-count"
            />
            <OperationalMetricCard
              label="Attention required"
              value={attention.length}
              href="/engineering/apps/asset-intelligence/criticality"
              tone={attention.length > 0 ? "attention" : "neutral"}
              testId="ai-attention-count"
            />
            {sessions.length > 0 ? (
              <OperationalMetricCard
                label="Recent inspections"
                value={sessions.length}
                href="/engineering/apps/inspection-intelligence/sessions"
              />
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-slate-500">
                  Recent inspections
                </p>
                <p className="mt-1 text-sm text-slate-600">No inspection evidence has been published for this asset.</p>
              </div>
            )}
          </div>
        ) : null}

        <section className="mt-8" data-testid="ai-attention-panel">
          <h2 className="text-lg font-semibold text-slate-900">Attention required</h2>
          {assets.length === 0 && !loading ? (
            <div className="mt-3">
              <EmptyOperationalState
                title="No assets in this workspace yet"
                description="Create assets under Work → Assets, then return here."
                testId="ai-empty-assets"
              />
            </div>
          ) : attention.length === 0 && !loading ? (
            <p className="mt-3 text-sm text-slate-600">
              No recorded assets currently carry high or critical criticality in this scope.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {attention.slice(0, 12).map((asset) => (
                <li key={asset.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{asset.asset_tag ?? asset.id.slice(0, 8)}</p>
                    <p className="text-xs text-slate-500">
                      {asset.asset_name ?? "Untitled asset"} · {asset.criticality ?? asset.status}
                    </p>
                  </div>
                  <Link
                    href={`/engineering/apps/asset-intelligence/assets/${asset.id}`}
                    className="text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
                  >
                    Inspect
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4" data-testid="ai-condition-panel">
            <h2 className="text-base font-semibold">Condition</h2>
            <p className="mt-2 text-sm text-slate-600">
              No condition evidence has been published for this asset unless an assessment exists on
              the asset record. Open an asset to inspect hosted condition.
            </p>
            <Link
              href="/engineering/apps/asset-intelligence/condition"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium underline"
            >
              Open condition
            </Link>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4" data-testid="ai-degradation-panel">
            <h2 className="text-base font-semibold">Deteriorating assets</h2>
            <p className="mt-2 text-sm text-slate-600">{deterioratingNote}</p>
            <Link
              href="/engineering/apps/asset-intelligence/degradation"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium underline"
            >
              Open degradation
            </Link>
          </div>
        </section>

        <section className="mt-8" data-testid="ai-evidence-panel">
          <h2 className="text-lg font-semibold text-slate-900">Recent inspection evidence</h2>
          {evidence.length === 0 ? (
            <div className="mt-3">
              <EmptyOperationalState
                title="No inspection or condition evidence is available for the selected asset."
                description="Evidence appears here from Inspection Intelligence when observations have been published."
                testId="ai-empty-evidence"
              />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {evidence.slice(0, 8).map((item, index) => {
                const rec = asRecord(item);
                const id = pickString(rec, ["id", "evidence_id"], String(index));
                return (
                  <li key={id} className="px-4 py-3 text-sm">
                    {pickString(rec, ["title", "summary", "filename", "id"], "Recorded evidence")}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
