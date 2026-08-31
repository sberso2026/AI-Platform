"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AssetRow = {
  id: string;
  asset_tag?: string;
  asset_name?: string;
};

export default function AssetIntelligenceAssetsPage() {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/engineering/assets")
      .then(async (r) => {
        if (!r.ok) throw new Error(`assets_${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!cancelled) setAssets(Array.isArray(json.data) ? json.data : []);
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
    <section data-testid="asset-intelligence-assets" aria-labelledby="ai-assets-title">
      <h1 id="ai-assets-title" className="text-2xl font-semibold text-slate-900">
        Assets
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Select an asset to open GA intelligence surfaces against hosted persistence.
      </p>
      {loading ? <p className="mt-6 text-sm text-slate-500">Loading…</p> : null}
      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && assets.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600" data-testid="ai-assets-empty">
          No assets available. Truthful empty state.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {assets.map((asset) => (
            <li key={asset.id}>
              <Link
                className="block rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50"
                href={`/engineering/apps/asset-intelligence/assets/${asset.id}`}
              >
                <span className="font-medium">{asset.asset_tag ?? asset.id}</span>
                <span className="ml-2 text-sm text-slate-500">{asset.asset_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
