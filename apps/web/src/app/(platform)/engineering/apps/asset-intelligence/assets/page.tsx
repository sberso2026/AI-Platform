"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  EmptyOperationalState,
  OperationalError,
  OperationalPageIntro,
  OperationalSkeleton,
  StatusTable,
  type OperationalRow,
} from "@/components/engineering/operational";
import { readOperationalJson } from "@/lib/engineering/module-ops";
import { useEngineeringProjectFilter, withProjectQuery } from "@/hooks/use-engineering-project-filter";

type AssetRow = {
  id: string;
  asset_tag?: string;
  asset_name?: string;
  status?: string;
  criticality?: string;
};

export default function AssetIntelligenceAssetsPage() {
  const projectId = useEngineeringProjectFilter();
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    readOperationalJson<AssetRow[]>(withProjectQuery("/api/engineering/assets", projectId)).then(
      (res) => {
        if (!res.ok) {
          setError(res.error ?? "load_failed");
          setAssets([]);
        } else {
          setAssets(Array.isArray(res.data) ? res.data : []);
          setError(null);
        }
        setLoading(false);
      },
    );
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const rows: OperationalRow[] = assets.map((asset) => ({
    id: asset.id,
    asset: asset.asset_tag ?? asset.id.slice(0, 8),
    name: asset.asset_name ?? "Untitled asset",
    criticality: asset.criticality ?? "—",
    status: asset.status ?? "recorded",
    href: `/engineering/apps/asset-intelligence/assets/${asset.id}`,
  }));

  return (
    <section data-testid="asset-intelligence-assets" aria-labelledby="ai-assets-title">
      <h1 id="ai-assets-title" className="text-2xl font-semibold text-slate-900">
        Assets
      </h1>
      <OperationalPageIntro
        purpose="Canonical assets from the Engineering Shared Asset Domain. Intelligence is composed against these identities."
        primaryAction={
          <Link
            href="/engineering/assets/new"
            className="inline-flex min-h-11 items-center rounded-md border border-slate-200 px-3 text-sm hover:border-slate-400"
          >
            Register an asset
          </Link>
        }
      />
      {loading ? <OperationalSkeleton /> : null}
      {error ? <OperationalError message={error} onRetry={load} /> : null}
      {!loading && assets.length === 0 ? (
        <EmptyOperationalState
          title="No assets in this workspace yet"
          description="Register an asset, then return here to inspect condition and evidence."
          testId="ai-assets-empty"
        />
      ) : (
        <StatusTable
          testId="ai-assets-table"
          columns={[
            { key: "asset", label: "Asset", hrefKey: true },
            { key: "name", label: "Name" },
            { key: "criticality", label: "Criticality" },
            { key: "status", label: "Status", status: true },
          ]}
          rows={rows}
          emptyTitle="No assets in this workspace yet"
          emptyDescription="Register an asset under Work → Assets."
        />
      )}
    </section>
  );
}
