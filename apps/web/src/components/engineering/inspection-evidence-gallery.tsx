"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hostedGet, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

export function InspectionEvidenceGallery() {
  const [rows, setRows] = useState<InspectionRow[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hostedGet<InspectionRow[]>("evidence")
      .then(setRows)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load evidence"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section data-testid="inspection-evidence-ready">
        <Header />
        <p className="mt-6 text-slate-600" role="status">Loading evidence…</p>
      </section>
    );
  }
  if (error) return <p className="text-red-700" role="alert">{error}</p>;
  if (rows.length === 0) {
    return (
      <section data-testid="inspection-evidence-ready">
        <Header />
        <p className="mt-6 text-slate-500">No evidence metadata registered yet.</p>
      </section>
    );
  }

  return (
    <section data-testid="inspection-evidence-ready">
      <Header />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => {
          const provenance = row.provenance && typeof row.provenance === "object"
            ? (row.provenance as { capturedAt?: string; capturedByPersonId?: string; source?: string })
            : {};
          return (
            <li key={String(row.id)} className="rounded border border-slate-200 p-4 text-sm">
              <p className="font-medium text-slate-900">{String(row.kind)}</p>
              <p className="mt-1 text-slate-600 break-all">{String(row.file_id ?? row.content_hash ?? "metadata only")}</p>
              <p className="mt-2 text-xs text-slate-500">
                hash {String(row.hash_algorithm ?? "sha256")} · v{String(row.version ?? 1)} ·
                {provenance.source ?? "human"} · {provenance.capturedAt ?? String(row.created_at ?? "")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Session{" "}
                <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/inspection-intelligence/sessions/${row.session_id}`}>
                  {String(row.session_id).slice(0, 8)}
                </Link>
                {row.observation_id ? ` · observation ${String(row.observation_id).slice(0, 8)}` : ""}
              </p>
              <p className="mt-2 text-xs text-slate-500">Not auto-approved. File bytes remain in Platform Files.</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Header() {
  return (
    <>
      <p className="text-sm font-medium text-cyan-700">Evidence Intelligence</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">Evidence</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Metadata and Platform Files pointers. Inspection Intelligence does not store a second copy and does not
        run computer vision here.
      </p>
    </>
  );
}
