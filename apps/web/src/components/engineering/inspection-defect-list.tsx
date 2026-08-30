"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hostedGet, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

function severityOf(row: InspectionRow): string {
  const taxonomy = row.taxonomy && typeof row.taxonomy === "object" ? (row.taxonomy as { severity?: string }) : {};
  return taxonomy.severity ?? "unknown";
}

export function InspectionDefectList() {
  const [rows, setRows] = useState<InspectionRow[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hostedGet<InspectionRow[]>("defects")
      .then(setRows)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load defects"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-600" role="status">Loading defects…</p>;
  if (error) return <p className="text-red-700" role="alert">{error}</p>;

  return (
    <section data-testid="inspection-defects-ready">
      <p className="text-sm font-medium text-cyan-700">Defect Intelligence</p>
      <h1 id="ii-defects-title" className="mt-1 text-2xl font-semibold text-slate-900">
        Inspection defects
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Canonical inspection-process defects. These are not Project Intelligence findings, Engineering Core
        actions, or asset-register defects.
      </p>
      {rows.length === 0 ? (
        <p className="mt-6 text-slate-500">No inspection defects recorded yet. Record one from a session.</p>
      ) : (
        <ul className="mt-6 divide-y rounded border border-slate-200">
          {rows.map((row) => (
            <li key={String(row.id)} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{String(row.title)}</p>
                <p className="text-sm text-slate-500">
                  {String(row.status)} · severity {severityOf(row)}
                </p>
              </div>
              <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/inspection-intelligence/defects/${row.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
