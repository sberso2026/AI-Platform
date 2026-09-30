"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { EngineeringBreadcrumb } from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";

type WorkEvent = {
  id: string;
  eventType: string;
  sourceSystem: string;
  sourceObjectType: string;
  sourceObjectId: string;
  disciplineId?: string | null;
  systemId?: string | null;
  lifecycleStage?: string | null;
  occurredAt: string;
  materiality: string;
  confirmationState: string;
  captureReason: string;
  actorId?: string | null;
};

type DayView = {
  sourcesRevised: number;
  analysesExecuted: number;
  reviewsCompleted: number;
  decisionsRecorded: number;
  productivityScore: null;
};

const VIEWS = ["Changed", "My Work", "Waiting", "Completed", "By Discipline", "By System", "By Lifecycle Stage"] as const;

export function WorkWorkspace() {
  const projectId = useResolvedEngineeringProjectId();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Changed");
  const [rows, setRows] = useState<WorkEvent[]>([]);
  const [day, setDay] = useState<DayView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/engineering/work?action=list&projectId=${encodeURIComponent(projectId)}`)
      .then((response) => parseApiJsonResponse<WorkEvent[]>(response))
      .then((json) => {
        if (json.errorMessage) setError(json.errorMessage);
        setRows(Array.isArray(json.data) ? json.data : []);
      })
      .catch((err: Error) => setError(err.message));
    fetch(`/api/engineering/work?action=day&projectId=${encodeURIComponent(projectId)}`)
      .then((response) => parseApiJsonResponse<DayView>(response))
      .then((json) => {
        if (json.errorMessage) setError(json.errorMessage);
        setDay(json.data);
      })
      .catch((err: Error) => setError(err.message));
  }, [projectId]);

  const filtered = useMemo(() => {
    if (view === "Changed") return rows.filter((row) => ["SOURCE_REVISED", "SOURCE_PUBLISHED", "INTERFACE_INFORMATION_CHANGED", "CONFIGURATION_CHANGED"].includes(row.eventType));
    if (view === "Waiting") return rows.filter((row) => ["DOCUMENT_REVIEW_REQUESTED", "RFI_CREATED", "ACTION_CREATED"].includes(row.eventType));
    if (view === "Completed") return rows.filter((row) => ["DOCUMENT_REVIEW_COMPLETED", "ACTION_COMPLETED", "RFI_CLOSED", "DECISION_RECORDED", "DRAWING_ISSUED", "DELIVERABLE_ISSUED", "CALCULATION_PUBLISHED"].includes(row.eventType));
    if (view === "By Discipline") return [...rows].sort((a, b) => String(a.disciplineId ?? "").localeCompare(String(b.disciplineId ?? "")));
    if (view === "By System") return [...rows].sort((a, b) => String(a.systemId ?? "").localeCompare(String(b.systemId ?? "")));
    if (view === "By Lifecycle Stage") return [...rows].sort((a, b) => String(a.lifecycleStage ?? "").localeCompare(String(b.lifecycleStage ?? "")));
    return rows;
  }, [rows, view]);

  return (
    <>
      <Header title="Engineering Work" description="Material engineering workflow events from managed repositories. Not employee activity or productivity scoring." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <EngineeringBreadcrumb items={[{ label: "Engineering", href: "/engineering" }, { label: "Work" }]} />
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        {day && (
          <section className="mt-4 rounded border p-4 text-sm" aria-label="Engineering day summary">
            <p>
              Since yesterday: {day.sourcesRevised} sources revised · {day.analysesExecuted} analysis executed · {day.reviewsCompleted} reviews completed · {day.decisionsRecorded} decisions recorded.
            </p>
            <p className="mt-1 text-muted-foreground">This is an engineering-state summary, not an employee productivity score.</p>
          </section>
        )}
        <div className="mt-4">
          <label className="text-sm">
            View
            <select className="eos-select mt-1 block" value={view} onChange={(event) => setView(event.target.value as (typeof VIEWS)[number])} aria-label="Work view">
              {VIEWS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <ul className="mt-4 space-y-2">
          {filtered.map((row) => (
            <li key={row.id} className="rounded border p-3 text-sm">
              <Link className="font-medium underline-offset-2 hover:underline" href={`/engineering/work/${row.id}`}>
                {row.eventType} · {row.sourceObjectType}:{row.sourceObjectId}
              </Link>
              <p className="mt-1">
                {row.materiality}
                {row.disciplineId ? ` · ${row.disciplineId}` : ""}
                {row.confirmationState === "CANDIDATE" ? " · candidate pending confirmation" : ""}
                {` · ${row.occurredAt}`}
              </p>
              <p className="mt-1 text-muted-foreground">{row.captureReason}</p>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
