"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AskEngineeringAI,
  EmptyOperationalState,
  OperationalError,
  OperationalPageIntro,
  OperationalSkeleton,
  StatusTable,
  type OperationalRow,
} from "@/components/engineering/operational";
import { asRecord, pickString, readOperationalJson } from "@/lib/engineering/module-ops";
import { useEngineeringProjectFilter, withProjectQuery } from "@/hooks/use-engineering-project-filter";

type AssetRow = {
  id: string;
  asset_tag?: string;
  asset_name?: string;
  project_id?: string | null;
  status?: string;
  criticality?: string;
};

type SnapshotSurface = { present?: boolean; data?: unknown; error?: string };

export function AssetIntelligenceSurfacePage(props: {
  title: string;
  purpose: string;
  testId: string;
  emptyTitle: string;
  emptyDescription: string;
  advisoryLabel?: string;
  surfaceKey: string;
  hash: string;
}) {
  return (
    <Suspense fallback={<OperationalSkeleton />}>
      <AssetIntelligenceSurfacePageInner {...props} />
    </Suspense>
  );
}

function AssetIntelligenceSurfacePageInner({
  title,
  purpose,
  testId,
  emptyTitle,
  emptyDescription,
  advisoryLabel,
  surfaceKey,
  hash,
}: {
  title: string;
  purpose: string;
  testId: string;
  emptyTitle: string;
  emptyDescription: string;
  advisoryLabel?: string;
  surfaceKey: string;
  hash: string;
}) {
  const projectId = useEngineeringProjectFilter();
  const searchParams = useSearchParams();
  const selectedAssetId = searchParams.get("assetId");
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [present, setPresent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    readOperationalJson<AssetRow[]>(withProjectQuery("/api/engineering/assets", projectId)).then(
      async (assetsRes) => {
        if (!assetsRes.ok) {
          setError(assetsRes.error ?? "load_failed");
          setAssets([]);
          setLoading(false);
          return;
        }
        const list = Array.isArray(assetsRes.data) ? assetsRes.data : [];
        setAssets(list);
        const assetId = selectedAssetId ?? list[0]?.id;
        if (!assetId) {
          setRecord(null);
          setPresent(false);
          setLoading(false);
          return;
        }
        const surface = await readOperationalJson<{ surfaces?: Record<string, SnapshotSurface> }>(
          `/api/engineering/asset-intelligence/asset-snapshot?assetId=${encodeURIComponent(assetId)}`,
        );
        if (surface.status === 404) {
          setRecord(null);
          setPresent(false);
          setLoading(false);
          return;
        }
        if (!surface.ok) {
          setError(surface.error ?? "load_failed");
          setPresent(false);
          setLoading(false);
          return;
        }
        const block = surface.data?.surfaces?.[surfaceKey];
        setRecord(block?.data ? asRecord(block.data) : null);
        setPresent(Boolean(block?.present));
        setLoading(false);
      },
    );
  }, [projectId, selectedAssetId, surfaceKey]);

  useEffect(() => {
    load();
  }, [load]);

  const rows: OperationalRow[] = assets.map((asset) => ({
    id: asset.id,
    asset: asset.asset_tag ?? asset.id.slice(0, 8),
    name: asset.asset_name ?? "Untitled asset",
    status: asset.status ?? "recorded",
    criticality: asset.criticality ?? "—",
    href: `/engineering/apps/asset-intelligence/assets/${asset.id}#${hash}`,
  }));

  return (
    <section data-testid={testId} aria-labelledby={`${testId}-title`}>
      <h1 id={`${testId}-title`} className="text-2xl font-semibold text-slate-900">
        {title}
      </h1>
      {advisoryLabel ? (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-800">{advisoryLabel}</p>
      ) : null}
      <OperationalPageIntro purpose={purpose} />
      <AskEngineeringAI q={`Summarize ${title.toLowerCase()} from recorded evidence.`} />
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
      {!loading && assets.length === 0 ? (
        <div className="mt-6">
          <EmptyOperationalState
            title="No assets in this workspace yet"
            description="Register assets under Work → Assets. Intelligence stays empty until assessments exist."
            action={
              <Link href="/engineering/assets/new" className="text-sm font-medium underline">
                Register an asset
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6">
          <StatusTable
            columns={[
              { key: "asset", label: "Asset", hrefKey: true },
              { key: "name", label: "Name" },
              { key: "criticality", label: "Criticality" },
              { key: "status", label: "Status", status: true },
            ]}
            rows={rows}
            emptyTitle="No assets in this workspace yet"
            emptyDescription="Register assets under Work → Assets."
          />
        </div>
      )}
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4" data-testid={`${testId}-detail`}>
        <h2 className="text-base font-semibold text-slate-900">Selected asset</h2>
        {!loading && !present ? (
          <p className="mt-2 text-sm text-slate-600">{emptyTitle}</p>
        ) : present ? (
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {Object.entries(record ?? {})
              .filter(([key]) => !/certified|implemented|flag/i.test(key))
              .slice(0, 8)
              .map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">{key}</dt>
                  <dd className="text-slate-800">{pickString({ value }, ["value"], String(value))}</dd>
                </div>
              ))}
          </dl>
        ) : null}
        <p className="mt-3 text-xs text-slate-500">{emptyDescription}</p>
      </div>
    </section>
  );
}
