"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BRANDING, Button } from "@rtb/ui";
import { asRecordArray, parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { TqQueryHtml } from "@/components/engineering/tq-query-html";
import {
  formatTqDate,
  projectTqRegisterRow,
  tqDetailPanels,
} from "@/lib/engineering/tq-register-presentation";
import "./tq-print.css";

export default function TechnicalQueryPrintPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [query, setQuery] = useState<Record<string, unknown> | null>(null);
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [disciplineNames, setDisciplineNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/engineering/projects")
      .then((response) => parseApiJsonResponse(response))
      .then((parsed) => {
        if (!parsed.ok) return;
        const names: Record<string, string> = {};
        for (const row of asRecordArray(parsed.data)) {
          const idValue = String(row.id ?? "");
          if (idValue) names[idValue] = String(row.project_name ?? row.name ?? "Project");
        }
        setProjectNames(names);
      })
      .catch(() => undefined);
    fetch("/api/engineering/disciplines")
      .then((response) => parseApiJsonResponse(response))
      .then((parsed) => {
        if (!parsed.ok) return;
        const names: Record<string, string> = {};
        for (const row of asRecordArray(parsed.data)) {
          const idValue = String(row.id ?? "");
          if (idValue) names[idValue] = String(row.name ?? "Discipline");
        }
        setDisciplineNames(names);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/engineering/technical-queries/${id}`)
      .then((response) => parseApiJsonResponse<{ query: Record<string, unknown> }>(response))
      .then((parsed) => {
        if (parsed.ok && parsed.data?.query) setQuery(parsed.data.query);
      })
      .catch(() => undefined);
  }, [id]);

  const row = useMemo(
    () =>
      query
        ? projectTqRegisterRow(query, { currentUserId: null, projectNames, disciplineNames })
        : null,
    [query, projectNames, disciplineNames],
  );
  const panels = query ? tqDetailPanels(query) : null;

  return (
    <div className="tq-print-root flex min-h-0 flex-1 flex-col overflow-y-auto bg-white" data-testid="tq-print">
      <style>{`@page { size: A4; margin: 16mm; }`}</style>
      <div
        className="tq-print-toolbar no-print sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3"
        data-testid="tq-print-toolbar"
      >
        <Link
          href={`/engineering/technical-queries/${id}`}
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        >
          Back to {row?.tqNumber ?? "TQ"}
        </Link>
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
        {!row || !panels ? (
          <p className="mt-6 text-sm">Loading print view…</p>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-semibold">
              {row.tqNumber} — {row.title}
            </h1>
            <p className="mt-1 text-sm">
              Status: {row.statusLabel} · Priority: {row.priorityLabel}
            </p>
            <table className="mt-4 w-full border-collapse text-sm">
              <tbody>
                {[
                  ["Project", row.projectLabel],
                  ["Discipline", row.disciplineLabel],
                  ["Initiator", row.initiatorLabel],
                  ["Action By", row.actionByLabel],
                  ["Response due", row.dueLabel],
                  ["Last activity", row.lastActivityLabel],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-slate-200">
                    <th className="w-48 py-1.5 text-left font-medium text-slate-600">{label}</th>
                    <td className="py-1.5">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <section className="mt-5 tq-print-query" data-testid="tq-print-query">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Query / Information Required</h2>
              <TqQueryHtml html={panels.query} tqId={id} className="mt-1" testId="tq-print-query-content" />
            </section>
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Suggested Solution</h2>
              <TqQueryHtml html={panels.suggestedSolution} tqId={id} className="mt-1" />
            </section>
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Client / Technical Response</h2>
              <TqQueryHtml html={panels.response} tqId={id} className="mt-1" />
            </section>
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Response Basis</h2>
              <TqQueryHtml html={panels.responseBasis} tqId={id} className="mt-1" />
            </section>
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Closeout</h2>
              <TqQueryHtml html={panels.closeout} tqId={id} className="mt-1" />
            </section>
            <p className="mt-8 text-xs text-slate-500">Printed {formatTqDate(new Date().toISOString())}</p>
          </>
        )}
      </div>
    </div>
  );
}
