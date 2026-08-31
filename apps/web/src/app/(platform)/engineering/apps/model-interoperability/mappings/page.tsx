"use client";

import { useEffect, useState } from "react";

export default function EngineeringModelMappingsPage() {
  const [mappings, setMappings] = useState<unknown[]>([]);
  const [impacts, setImpacts] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/engineering/model-interoperability/workspace-snapshot")
      .then(async (r) => {
        if (!r.ok) throw new Error(`snapshot_${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        setMappings(
          Array.isArray(json.data?.surfaces?.mappings?.data) ? json.data.surfaces.mappings.data : [],
        );
        setImpacts(
          Array.isArray(json.data?.surfaces?.change_impacts?.data)
            ? json.data.surfaces.change_impacts.data
            : [],
        );
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
    <section data-testid="emi-mappings-page" aria-labelledby="emi-mappings-title">
      <h1 id="emi-mappings-title" className="text-2xl font-semibold">
        Mappings & bindings
      </h1>
      <p className="mt-2 text-slate-600">
        Governed element mappings and change-impact records.
      </p>
      {loading ? <p className="mt-6 text-sm text-slate-500">Loading…</p> : null}
      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <h2 className="mt-6 text-lg font-semibold">Mappings ({mappings.length})</h2>
      {mappings.length === 0 && !loading ? (
        <p className="mt-2 text-sm text-slate-600" data-testid="emi-mappings-empty">
          No mappings. Truthful empty state.
        </p>
      ) : (
        <pre className="mt-2 max-h-64 overflow-auto rounded bg-slate-50 p-3 text-xs">
          {JSON.stringify(mappings, null, 2)}
        </pre>
      )}
      <h2 className="mt-6 text-lg font-semibold">Change impacts ({impacts.length})</h2>
      <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-50 p-3 text-xs">
        {JSON.stringify(impacts, null, 2)}
      </pre>
    </section>
  );
}
