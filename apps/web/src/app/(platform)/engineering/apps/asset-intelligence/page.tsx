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

type AssetRow = {
  id: string;
  asset_tag?: string;
  asset_name?: string;
  project_id?: string | null;
  status?: string;
  criticality?: string;
};

export default function AssetIntelligenceOverviewPage() {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();
    (async () => {
      try {
        const [assetsRes, healthRes] = await Promise.all([
          fetch("/api/engineering/assets"),
          fetch("/api/engineering/asset-intelligence/health"),
        ]);
        if (!assetsRes.ok) throw new Error(`assets_${assetsRes.status}`);
        const assetsJson = await assetsRes.json();
        const healthJson = healthRes.ok ? await healthRes.json() : null;
        if (!cancelled) {
          setAssets(Array.isArray(assetsJson.data) ? assetsJson.data : []);
          setHealth(healthJson?.data ?? null);
          setError(null);
          console.info(`[eos-ux-1] asset-intelligence wall_ms=${Math.round(performance.now() - started)}`);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "load_failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const attention = assets.filter(
    (a) => a.criticality === "high" || a.criticality === "critical" || a.status === "attention",
  );

  return (
    <section data-testid="asset-intelligence-ready" aria-labelledby="ai-overview-title">
      <div data-testid="asset-intelligence-v1-ready">
        <h1 id="ai-overview-title" className="text-2xl font-semibold text-slate-900">
          Asset overview
        </h1>
        <OperationalPageIntro
          purpose="Assets requiring attention, recent condition, inspections, and risk signals from recorded data."
          primaryAction={
            <Link
              href="/engineering/apps/asset-intelligence/assets"
              className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
            >
              Open asset register
            </Link>
          }
        />
        <p className="mt-1 text-xs text-slate-500">
          Version <span data-testid="asset-intelligence-ga-version">1.0.0</span>
        </p>
        <AskEngineeringAI q="Summarize assets requiring attention from recorded evidence." />

        {loading ? <OperationalSkeleton /> : null}
        {error ? (
          <div className="mt-6">
            <OperationalError message={`Unable to load operational context: ${error}`} />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <OperationalMetricCard
            label="Assets in scope"
            value={assets.length}
            href="/engineering/apps/asset-intelligence/assets"
            testId="ai-asset-count"
          />
          <OperationalMetricCard
            label="Requiring attention"
            value={attention.length}
            href="/engineering/apps/asset-intelligence/assets"
            tone={attention.length > 0 ? "attention" : "neutral"}
          />
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-slate-500">
              Persistence
            </p>
            <p className="mt-1 text-sm font-medium" data-testid="ai-persistence-status">
              {health ? String((health as { status?: string }).status ?? "ready") : "—"}
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Assets requiring attention</h2>
        {assets.length === 0 && !loading ? (
          <div className="mt-3">
            <EmptyOperationalState
              title="No assets in this workspace yet"
              description="Create assets under Work → Assets, then return here. Intelligence stays empty until assessments exist."
              testId="ai-empty-assets"
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {(attention.length ? attention : assets).slice(0, 12).map((asset) => (
              <li key={asset.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {asset.asset_tag ?? asset.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-slate-500">{asset.asset_name ?? "Untitled asset"}</p>
                </div>
                <Link
                  href={`/engineering/apps/asset-intelligence/assets/${asset.id}`}
                  className="text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
                >
                  Open asset 360
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
