"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BRANDING, Button } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { formatTqDate, formatTqDateTime, type TqDetailPayload } from "@/lib/engineering/technical-query-ux";
import { personLabel } from "@/lib/engineering/technical-query-ux";
import { TqBackLink } from "@/components/engineering/technical-query-ui";
import "./tq-print.css";

export default function TechnicalQueryPrintPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [data, setData] = useState<TqDetailPayload | null>(null);
  const [printedAt] = useState(() => new Date().toISOString());

  useEffect(() => {
    fetch(`/api/engineering/technical-queries/${id}`)
      .then((r) => parseApiJsonResponse<TqDetailPayload>(r))
      .then((parsed) => {
        if (parsed.ok && parsed.data) setData(parsed.data);
      })
      .catch(() => undefined);
  }, [id]);

  const p = data?.presentation;
  const detailHref = `/engineering/technical-queries/${id}`;

  return (
    <div className="tq-print-root flex min-h-0 flex-1 flex-col overflow-y-auto bg-white" data-testid="tq-print">
      <style>{`@page { size: A4; margin: 16mm; }`}</style>
      <div className="tq-print-toolbar no-print sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3" data-testid="tq-print-toolbar">
        <TqBackLink href={detailHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 underline-offset-2 hover:text-slate-950 hover:underline">
          Back to {p?.tqNumber ?? "TQ"}
        </TqBackLink>
        <Button type="button" onClick={() => window.print()} data-testid="tq-print-button">
          Print
        </Button>
      </div>
      <div className="tq-print-sheet mx-auto w-full max-w-[210mm] p-8 text-slate-900">
        <header className="tq-print-branding border-b border-slate-300 pb-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">RTB Engineering & Analytics</p>
          <p className="text-lg font-semibold">{BRANDING.product} · Technical Query / RFI</p>
          <p className="text-sm text-slate-600">Configurable tenant branding · controlled engineering record</p>
        </header>
        {!p ? (
          <p className="mt-6 text-sm">Loading print view…</p>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-semibold">
              {p.tqNumber} — {p.title}
            </h1>
            <p className="mt-1 text-sm">
              Status: {p.statusLabel} · Priority: {p.priority}
              {p.classificationLabel ? ` · ${p.classificationLabel}` : ""}
            </p>
            <table className="mt-4 w-full border-collapse text-sm">
              <tbody>
                {[
                  ["Project", p.projectName ?? "—"],
                  ["Contract / package", p.contractPackage ?? "—"],
                  ["Discipline", p.disciplineName ?? "—"],
                  ["Area", p.area ?? "—"],
                  ["System", p.system ?? "—"],
                  ["Asset / equipment", p.assetLabel ?? "—"],
                  ["Classification", p.classificationLabel ?? "—"],
                  ["Date raised", formatTqDate(p.dateRaised)],
                  ["Initiator", personLabel(p.initiator, "—")],
                  ["Action By", personLabel(p.actionBy, "Unassigned")],
                  ["Response due", formatTqDate(p.due)],
                  ["Response date", formatTqDate(p.responseSubmittedAt)],
                  ["Close date", formatTqDate(p.closedAt)],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-slate-200">
                    <th className="w-48 py-1.5 text-left font-medium text-slate-600">{label}</th>
                    <td className="py-1.5">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <section className="mt-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Query / Information Required</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{p.query || "—"}</p>
            </section>
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Suggested Solution</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{p.suggestedSolution || "—"}</p>
            </section>
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">References</h2>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {(data?.references ?? []).length === 0 ? <li>None linked</li> : null}
                {(data?.references ?? []).map((ref) => (
                  <li key={`${ref.objectType}-${ref.objectId}`}>
                    {[ref.number, ref.title, ref.revision ? `Rev ${ref.revision}` : null, ref.status].filter(Boolean).join(" · ")}
                  </li>
                ))}
              </ul>
            </section>
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Client / Technical Response</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{p.clientResponse || "—"}</p>
            </section>
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Response Basis</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{p.responseBasis || "—"}</p>
            </section>
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Follow-up Actions</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{p.followUpActions || "—"}</p>
            </section>
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Closeout</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{p.closeoutComments || "—"}</p>
            </section>
            <footer className="mt-8 border-t border-slate-300 pt-3 text-xs text-slate-600">
              <p>
                Printed {formatTqDateTime(printedAt)} · {p.tqNumber} · Page <span className="tq-page-number" /> of{" "}
                <span className="tq-page-count" />
              </p>
              <p>Uncontrolled when printed</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
