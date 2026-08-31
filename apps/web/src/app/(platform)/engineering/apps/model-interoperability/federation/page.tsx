"use client";

import { useEffect, useState } from "react";

export default function EngineeringModelFederationPage() {
  const [spacegass, setSpacegass] = useState<unknown>(null);
  const [etabs, setEtabs] = useState<unknown>(null);
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
        setSpacegass(json.data?.surfaces?.spacegass?.data ?? null);
        setEtabs(json.data?.surfaces?.etabs?.data ?? null);
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
    <section data-testid="emi-federation-page" aria-labelledby="emi-federation-title">
      <h1 id="emi-federation-title" className="text-2xl font-semibold">
        Federation
      </h1>
      <p className="mt-2 text-slate-600">
        Provider status and qualification posture. Live SPACE GASS / ETABS execution is NOT
        CERTIFIED.
      </p>
      {loading ? <p className="mt-6 text-sm text-slate-500">Loading…</p> : null}
      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <h2 className="mt-6 text-lg font-semibold">SPACE GASS</h2>
      <pre className="mt-2 max-h-64 overflow-auto rounded bg-slate-50 p-3 text-xs" data-testid="emi-spacegass-status">
        {JSON.stringify(spacegass, null, 2)}
      </pre>
      <h2 className="mt-6 text-lg font-semibold">ETABS</h2>
      <pre className="mt-2 max-h-64 overflow-auto rounded bg-slate-50 p-3 text-xs" data-testid="emi-etabs-status">
        {JSON.stringify(etabs, null, 2)}
      </pre>
      <p className="mt-6 text-sm text-slate-600">
        No live solver execution is offered from this surface.
      </p>
    </section>
  );
}
