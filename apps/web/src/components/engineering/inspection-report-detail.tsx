"use client";

import { useEffect, useState } from "react";
import { nextReportAuthorityStates, type ReportAuthorityState } from "@rtb/inspection-intelligence/browser";
import { hostedGet, hostedIntent, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

export function InspectionReportDetail({ outputId }: { outputId: string }) {
  const [row, setRow] = useState<InspectionRow>();
  const [markdown, setMarkdown] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [canWrite, setCanWrite] = useState(true);
  const [approve, setApprove] = useState(false);

  async function load() {
    const [data, exportPayload, caps] = await Promise.all([
      hostedGet<InspectionRow>("report", { id: outputId }),
      hostedGet<{ markdown: string; pdfAvailable: boolean }>("report_export", { id: outputId }),
      hostedGet<{ canWrite: boolean; action: string }>("capabilities").catch(() => ({ canWrite: true, action: "inspection.write" })),
    ]);
    setRow(data);
    setMarkdown(exportPayload.markdown);
    setCanWrite(caps.canWrite !== false);
    setApprove(caps.action === "inspection.approve");
  }

  useEffect(() => {
    load().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load report"));
  }, [outputId]);

  if (!row && !error) return <p className="text-slate-600" role="status">Loading report…</p>;
  if (!row) return <p className="text-red-700" role="alert">{error}</p>;

  const payload = row.payload && typeof row.payload === "object" ? (row.payload as Record<string, unknown>) : {};
  const authority = payload.authority && typeof payload.authority === "object"
    ? (payload.authority as { state?: ReportAuthorityState; actorUserId?: string; at?: string })
    : {};
  const state = (authority.state ?? "draft") as ReportAuthorityState;
  const next = nextReportAuthorityStates(state);

  return (
    <section data-testid="inspection-report-detail">
      <p className="text-sm font-medium text-cyan-700">Inspection Reporting</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">{String(payload.title ?? row.report_key)}</h1>
      <p className="mt-2 text-slate-600">
        Authority {state} · actor {authority.actorUserId ?? "unknown"} · {String(row.generated_at ?? authority.at ?? "")}
      </p>
      <p className="text-sm text-slate-500">Deterministic snapshot only. Not auto-published. PDF unavailable.</p>
      {error ? <p className="mt-3 text-red-700" role="alert">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {next.map((to) => {
          const needsApprove = to === "approved" || to === "published";
          return (
            <button
              key={to}
              type="button"
              className="min-h-11 rounded-md border px-3 py-2 text-sm disabled:opacity-60"
              disabled={!canWrite || Boolean(busy) || (needsApprove && !approve)}
              onClick={async () => {
                setBusy(true);
                setError(undefined);
                try {
                  await hostedIntent("transition_report", { outputId, to });
                  await load();
                } catch (reason) {
                  setError(reason instanceof Error ? reason.message : "Authority transition failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {to}
            </button>
          );
        })}
        {markdown ? (
          <a
            className="min-h-11 rounded-md border px-3 py-2 text-sm"
            href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`}
            download={`${outputId}.md`}
          >
            Export Markdown
          </a>
        ) : null}
      </div>
      <pre className="mt-6 overflow-auto rounded border bg-slate-50 p-4 text-xs" data-testid="inspection-report-snapshot">
        {JSON.stringify(payload.sections ?? payload, null, 2)}
      </pre>
    </section>
  );
}
