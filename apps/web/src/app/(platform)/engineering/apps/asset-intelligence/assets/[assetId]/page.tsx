"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AskEngineeringAI,
  AssetContextHeader,
  ContextTabs,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";

type SurfaceBlock = {
  surface: string;
  present: boolean;
  data: unknown;
  error?: string;
};

const TABS = (assetId: string) =>
  [
    { href: `#overview`, label: "Overview" },
    { href: `#condition`, label: "Condition" },
    { href: `/engineering/apps/inspection-intelligence?assetId=${assetId}`, label: "Inspections" },
    { href: `/engineering/apps/inspection-intelligence/defects?assetId=${assetId}`, label: "Defects" },
    { href: `/engineering/documents?assetId=${assetId}`, label: "Documents" },
    { href: `/engineering/risks?assetId=${assetId}`, label: "Risks" },
    { href: `#history`, label: "History" },
    { href: `/engineering/apps/digital-twin?assetId=${assetId}`, label: "Twin" },
    { href: `#maintenance`, label: "Recommendations" },
  ] as const;

const SURFACE_ORDER = [
  ["condition", "Condition", "Recorded condition assessments"],
  ["criticality", "Criticality", "Recorded criticality"],
  ["reliability", "Reliability", "Advisory reliability context"],
  ["failure", "Failure", "Recorded failure events"],
  ["trend_degradation", "Recent condition changes", "Trend and degradation where recorded"],
  ["lifecycle", "Lifecycle", "Recorded lifecycle state"],
  ["risk", "Risk signals", "Advisory risk signals from recorded evidence"],
  ["maintenance", "Maintenance recommendations", "Advisory recommendations"],
  ["priority", "Priority context", "Advisory priority context"],
  ["fusion", "Multi-source fusion", "Composed recorded sources"],
  ["predictive_governance", "Predictive governance", "Governance only — no remaining-life or PoF"],
  ["health", "Health composition", "Composed health from recorded evidence"],
  ["condition_history", "History", "Condition history"],
  ["failure_taxonomy", "Failure taxonomy", "Recorded taxonomy"],
] as const;

function summarize(data: unknown): string {
  if (data == null) return "—";
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (Array.isArray(data)) return `${data.length} recorded item${data.length === 1 ? "" : "s"}`;
  if (typeof data === "object") {
    const rec = data as Record<string, unknown>;
    for (const key of ["summary", "status", "rating", "condition", "label", "title"]) {
      if (typeof rec[key] === "string" && rec[key]) return rec[key] as string;
    }
    return "Recorded data available";
  }
  return "Recorded data available";
}

export default function AssetIntelligenceAssetDetailPage() {
  const params = useParams<{ assetId: string }>();
  const assetId = params.assetId;
  const [surfaces, setSurfaces] = useState<Record<string, SurfaceBlock> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!assetId) return;
    let cancelled = false;
    Promise.all([
      fetch(`/api/engineering/asset-intelligence/asset-snapshot?assetId=${encodeURIComponent(assetId)}`),
      fetch(`/api/engineering/assets/${encodeURIComponent(assetId)}`),
    ])
      .then(async ([snapRes, assetRes]) => {
        if (!snapRes.ok) throw new Error(`snapshot_${snapRes.status}`);
        const json = await snapRes.json();
        const assetJson = assetRes.ok ? await assetRes.json() : null;
        if (!cancelled) {
          setSurfaces(json.data?.surfaces ?? null);
          setAsset(assetJson?.data ?? null);
        }
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
  }, [assetId]);

  return (
    <section data-testid="asset-intelligence-asset-detail" aria-labelledby="ai-asset-title">
      <p className="text-sm">
        <Link href="/engineering/apps/asset-intelligence/assets" className="underline-offset-2 hover:underline">
          ← Assets
        </Link>
      </p>
      <h1 id="ai-asset-title" className="mt-2 text-2xl font-semibold text-slate-900">
        Asset 360
      </h1>
      <p className="mt-1 font-mono text-xs text-slate-500" data-testid="ai-asset-id">
        {assetId}
      </p>
      <AssetContextHeader
        assetId={assetId}
        tag={asset?.asset_tag as string | undefined}
        name={asset?.asset_name as string | undefined}
        projectId={(asset?.project_id as string | undefined) ?? null}
        status={asset?.status as string | undefined}
      />
      <ContextTabs links={TABS(assetId)} ariaLabel="Asset 360" />

      {loading ? <div className="mt-6"><OperationalSkeleton /></div> : null}
      {error ? (
        <div className="mt-6">
          <OperationalError message={error} />
        </div>
      ) : null}

      <div id="overview" className="mt-6">
        <AskEngineeringAI
          objectType="asset"
          objectId={assetId}
          projectId={(asset?.project_id as string | undefined) ?? null}
          q="Explain this asset from recorded inspection and condition evidence."
        />
      </div>

      <ul className="mt-6 space-y-3" data-testid="ai-operational-surfaces">
        {SURFACE_ORDER.map(([key, label, purpose]) => {
          const block = surfaces?.[key];
          return (
            <li
              key={key}
              id={key === "condition_history" ? "history" : key}
              data-testid={`ai-surface-${key}`}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">{label}</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">{purpose}</p>
              {!block ? (
                <p className="mt-2 text-sm text-slate-500">—</p>
              ) : block.error ? (
                <p className="mt-2 text-sm text-amber-800">Read error: {block.error}</p>
              ) : block.present ? (
                <p className="mt-2 text-sm text-slate-800">{summarize(block.data)}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-600" data-testid={`ai-surface-${key}-empty`}>
                  No recorded {label.toLowerCase()} for this asset yet.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
