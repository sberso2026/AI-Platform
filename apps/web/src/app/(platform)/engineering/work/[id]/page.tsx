"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EngineeringBreadcrumb } from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type WorkEvent = {
  id: string;
  eventType: string;
  projectId: string;
  sourceSystem: string;
  sourceObjectType: string;
  sourceObjectId: string;
  informationRefId?: string | null;
  disciplineId?: string | null;
  systemId?: string | null;
  occurredAt: string;
  recordedAt: string;
  materiality: string;
  confirmationState: string;
  captureReason: string;
  provenance?: Record<string, unknown>;
};

export default function WorkDetailPage() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<WorkEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/engineering/work?action=detail&id=${encodeURIComponent(params.id)}`)
      .then((response) => parseApiJsonResponse<WorkEvent>(response))
      .then((json) => {
        if (json.errorMessage) setError(json.errorMessage);
        else setRow(json.data);
      })
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  return (
    <>
      <Header title="Work event" description="Material engineering workflow event. Not surveillance telemetry." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringBreadcrumb items={[{ label: "Work", href: "/engineering/work" }, { label: params.id }]} />
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        {row && (
          <dl className="mt-4 grid gap-2 text-sm md:grid-cols-2">
            <dt>Event type</dt><dd>{row.eventType}</dd>
            <dt>Project</dt><dd>{row.projectId}</dd>
            <dt>Source</dt><dd>{row.sourceSystem} · {row.sourceObjectType}:{row.sourceObjectId}</dd>
            <dt>Information ref</dt><dd>{row.informationRefId ?? "—"}</dd>
            <dt>Discipline / system</dt><dd>{row.disciplineId ?? "—"} / {row.systemId ?? "—"}</dd>
            <dt>Occurred</dt><dd>{row.occurredAt}</dd>
            <dt>Recorded</dt><dd>{row.recordedAt}</dd>
            <dt>Materiality</dt><dd>{row.materiality}</dd>
            <dt>Confirmation</dt><dd>{row.confirmationState}</dd>
            <dt>Capture reason</dt><dd>{row.captureReason}</dd>
            <dt>Provenance</dt><dd>{String(row.provenance?.sourceEventType ?? row.sourceSystem)}</dd>
          </dl>
        )}
        <p className="mt-4 text-sm text-muted-foreground">Related Digital Thread objects remain governed engineering links. Potential impacts are candidates until reviewed. This page does not show keystrokes, idle time, or productivity scores.</p>
      </main>
    </>
  );
}
