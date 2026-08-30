"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { hostedGet, hostedIntent, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

type ReportType = { reportKey: string; title: string };

export function InspectionReportList() {
  const [rows, setRows] = useState<InspectionRow[]>([]);
  const [sessions, setSessions] = useState<InspectionRow[]>([]);
  const [types, setTypes] = useState<ReportType[]>([]);
  const [pdfAvailable, setPdfAvailable] = useState(false);
  const [canWrite, setCanWrite] = useState(true);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function load() {
    const [reports, nextSessions, catalog, caps] = await Promise.all([
      hostedGet<InspectionRow[]>("reports"),
      hostedGet<InspectionRow[]>("sessions"),
      hostedGet<{ types: ReportType[]; pdfAvailable: boolean }>("report_types"),
      hostedGet<{ canWrite: boolean }>("capabilities").catch(() => ({ canWrite: true })),
    ]);
    setRows(reports);
    setSessions(nextSessions);
    setTypes(catalog.types);
    setPdfAvailable(catalog.pdfAvailable);
    setCanWrite(caps.canWrite !== false);
  }

  useEffect(() => {
    load().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load reports"));
  }, []);

  return (
    <section data-testid="inspection-reports-ready">
      <p className="text-sm font-medium text-cyan-700">Inspection Reporting</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">Governed reports</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Deterministic snapshots stored in inspection_reporting_outputs. No AI narrative. PDF export is unavailable.
      </p>
      <p className="mt-1 text-xs text-slate-500">PDF available: {pdfAvailable ? "true" : "false"}</p>
      {error ? <p className="mt-3 text-red-700" role="alert">{error}</p> : null}
      <form
        className="mt-4 max-w-xl space-y-2 rounded border p-4"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const sessionId = String(data.get("sessionId") ?? "");
          const reportKey = String(data.get("reportKey") ?? "");
          if (!sessionId || !reportKey) return;
          setBusy(true);
          setError(undefined);
          hostedIntent<InspectionRow>("compose_report", { sessionId, reportKey })
            .then(() => load())
            .catch((reason) => setError(reason instanceof Error ? reason.message : "Compose failed"))
            .finally(() => setBusy(false));
        }}
      >
        <h2 className="font-semibold">Compose deterministic snapshot</h2>
        <select name="sessionId" className="w-full rounded border px-3 py-2" required>
          <option value="">Select session</option>
          {sessions.map((row) => (
            <option key={String(row.id)} value={String(row.id)}>
              {String(row.status)} · {String(row.id).slice(0, 8)}
            </option>
          ))}
        </select>
        <select name="reportKey" className="w-full rounded border px-3 py-2" required>
          {types.map((type) => (
            <option key={type.reportKey} value={type.reportKey}>{type.title}</option>
          ))}
        </select>
        <button
          className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          disabled={busy || !canWrite}
          data-testid="inspection-report-compose"
        >
          Generate snapshot
        </button>
        {!canWrite ? <p className="text-xs text-slate-500">Compose is write-gated. Reports stay draft until reviewed, approved, then published.</p> : null}
      </form>
      {rows.length === 0 ? (
        <p className="mt-6 text-slate-500">No reporting outputs yet.</p>
      ) : (
        <ul className="mt-6 divide-y rounded border">
          {rows.map((row) => {
            const payload = row.payload && typeof row.payload === "object" ? (row.payload as { title?: string; authority?: { state?: string } }) : {};
            return (
              <li key={String(row.id)} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{payload.title ?? String(row.report_key)}</p>
                  <p className="text-slate-500">
                    {String(row.kind)} · {payload.authority?.state ?? "unknown"} · {String(row.generated_at ?? "")}
                  </p>
                </div>
                <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/inspection-intelligence/reports/${row.id}`}>
                  Open
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
