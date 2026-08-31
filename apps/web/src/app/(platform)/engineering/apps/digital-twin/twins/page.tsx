"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TwinIdentity = {
  twinId?: string;
  id?: string;
  canonicalEntityType?: string;
  canonicalEntityId?: string;
};

export default function DigitalTwinTwinsPage() {
  const [twins, setTwins] = useState<TwinIdentity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/engineering/digital-twin/workspace-snapshot")
      .then(async (r) => {
        if (!r.ok) throw new Error(`snapshot_${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!cancelled) {
          const list = json.data?.identities?.data ?? [];
          setTwins(Array.isArray(list) ? list : []);
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
    <section data-testid="digital-twin-twins" aria-labelledby="dt-twins-title">
      <h1 id="dt-twins-title" className="text-2xl font-semibold text-slate-900">
        Twins
      </h1>
      <p className="mt-2 text-slate-600">Open a twin to inspect identity, state, history, and bindings.</p>
      {loading ? <p className="mt-6 text-sm text-slate-500">Loading…</p> : null}
      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && twins.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600" data-testid="dt-twins-empty">
          No twins registered. Truthful empty state.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {twins.map((twin) => {
            const id = String(twin.twinId ?? twin.id ?? "");
            return (
              <li key={id}>
                <Link
                  className="block rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50"
                  href={`/engineering/apps/digital-twin/twins/${id}`}
                >
                  <span className="font-mono text-sm">{id}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    Linked record: {String(twin.canonicalEntityType ?? "—")}{" "}
                    {String(twin.canonicalEntityId ?? "")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
