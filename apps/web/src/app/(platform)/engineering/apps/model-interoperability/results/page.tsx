"use client";

import { useEffect, useState } from "react";

export default function EngineeringModelResultsPage() {
  const [results, setResults] = useState<unknown[]>([]);
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
        if (!cancelled) {
          setResults(
            Array.isArray(json.data?.surfaces?.results?.data) ? json.data.surfaces.results.data : [],
          );
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
  }, []);

  return (
    <section data-testid="emi-results-page" aria-labelledby="emi-results-title">
      <h1 id="emi-results-title" className="text-2xl font-semibold">
        Results
      </h1>
      <p className="mt-2 text-slate-600">
        Existing external result references only — not RTB-certified live solver output.
      </p>
      {loading ? <p className="mt-6 text-sm text-slate-500">Loading…</p> : null}
      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {results.length === 0 && !loading ? (
        <p className="mt-6 text-sm text-slate-600" data-testid="emi-results-empty">
          No result references. Truthful empty state.
        </p>
      ) : (
        <pre className="mt-6 max-h-96 overflow-auto rounded bg-slate-50 p-3 text-xs">
          {JSON.stringify(results, null, 2)}
        </pre>
      )}
    </section>
  );
}
