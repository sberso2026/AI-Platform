"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AskEngineeringAI,
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

const SURFACES = [
  ["identity", "Twin identity", "Selectable twin and recorded profile"],
  ["state", "Current recorded state", "Latest governed state"],
  ["snapshot_history", "State history / snapshots", "Historical snapshots"],
  ["state_versions", "State versions", "Versioned state records"],
  ["telemetry_bindings", "Telemetry bindings", "Bound sources where recorded"],
  ["representations", "Spatial / representation", "Representation surface where available"],
  ["digital_thread", "Digital thread", "Linked engineering evidence"],
  ["spatial_references", "Spatial references", "Spatial bindings"],
  ["simulation_governance", "Simulation results", "Certified simulation results only"],
] as const;

function summarize(data: unknown): string {
  if (data == null) return "—";
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (Array.isArray(data)) return `${data.length} recorded item${data.length === 1 ? "" : "s"}`;
  if (typeof data === "object") {
    const rec = data as Record<string, unknown>;
    for (const key of ["summary", "status", "updatedAt", "last_update", "state"]) {
      if (typeof rec[key] === "string" && rec[key]) return rec[key] as string;
    }
    return "Recorded data available";
  }
  return "Recorded data available";
}

export default function DigitalTwinDetailPage() {
  const params = useParams<{ twinId: string }>();
  const twinId = params.twinId;
  const [identity, setIdentity] = useState<SurfaceBlock | null>(null);
  const [surfaces, setSurfaces] = useState<Record<string, SurfaceBlock> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!twinId) return;
    let cancelled = false;
    fetch(`/api/engineering/digital-twin/twin-snapshot?twinId=${encodeURIComponent(twinId)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`snapshot_${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        setIdentity(json.data?.identity ?? null);
        setSurfaces(json.data?.surfaces ?? null);
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
  }, [twinId]);

  const blocks: Record<string, SurfaceBlock | null | undefined> = {
    identity,
    ...(surfaces ?? {}),
  };

  const tabs = [
    { href: `#identity`, label: "Overview" },
    { href: `#state`, label: "State" },
    { href: `#telemetry_bindings`, label: "Telemetry" },
    { href: `#snapshot_history`, label: "History" },
    { href: `#digital_thread`, label: "Digital thread" },
    { href: `#representations`, label: "Representation" },
    { href: `#simulation_governance`, label: "Simulation" },
    { href: "/engineering/apps/digital-twin/release", label: "Governance" },
  ];

  return (
    <section data-testid="digital-twin-detail" aria-labelledby="dt-detail-title">
      <p className="text-sm">
        <Link href="/engineering/apps/digital-twin/twins" className="underline-offset-2 hover:underline">
          ← Twins
        </Link>
      </p>
      <h1 id="dt-detail-title" className="mt-2 text-2xl font-semibold">
        Twin
      </h1>
      <p className="mt-1 font-mono text-xs text-slate-500">{twinId}</p>
      <div className="mt-3">
        <AskEngineeringAI objectType="other" objectId={twinId} q="Summarize this twin from recorded state." />
      </div>
      <ContextTabs links={tabs} ariaLabel="Twin sections" />
      {loading ? <div className="mt-6"><OperationalSkeleton /></div> : null}
      {error ? (
        <div className="mt-6">
          <OperationalError message={error} />
        </div>
      ) : null}
      <ul className="mt-6 space-y-3" data-testid="dt-operational-surfaces">
        {SURFACES.map(([key, label, purpose]) => {
          const block = blocks[key];
          return (
            <li
              key={key}
              id={key}
              data-testid={`dt-surface-${key}`}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <h2 className="text-base font-semibold">{label}</h2>
              <p className="mt-1 text-xs text-slate-500">{purpose}</p>
              {!block ? (
                <p className="mt-2 text-sm text-slate-500">—</p>
              ) : block.error ? (
                <p className="mt-2 text-sm text-amber-800">Read error: {block.error}</p>
              ) : block.present ? (
                <p className="mt-2 text-sm text-slate-800">{summarize(block.data)}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-600" data-testid={`dt-surface-${key}-empty`}>
                  No {label.toLowerCase()} records yet.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
