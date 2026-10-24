"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EngineeringBreadcrumb } from "@/components/engineering/operational";
import { EngineeringProjectContextBar } from "@/components/engineering/project-context-bar";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type InfoRef = {
  id: string;
  sourceObjectType: string;
  sourceObjectId: string;
  informationType: string;
  sourceKind: string;
  projectId: string;
  workspaceId: string;
  discipline?: string | null;
  responsibleDiscipline?: string | null;
  systemId?: string | null;
  assetId?: string | null;
  lifecycleStage?: string | null;
  purpose: string;
  eligibility: string;
  configurationBaselineId?: string | null;
  sourceFacts?: Record<string, unknown>;
  createdBy?: string | null;
  createdAt: string;
};

export default function InformationDetailPage() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<InfoRef | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/engineering/information?action=detail&id=${encodeURIComponent(params.id)}`)
      .then((response) => parseApiJsonResponse<InfoRef>(response))
      .then((json) => {
        if (!json.ok || !json.data) {
          setRow(null);
          setError(json.errorMessage ?? "Failed to load information reference");
          return;
        }
        setRow(json.data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  return (
    <>
      <Header title="Information detail" description="Canonical source reference, authority context, and provenance." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <EngineeringBreadcrumb items={[{ label: "Information", href: "/engineering/information" }, { label: params.id }]} />
        <EngineeringProjectContextBar />
        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        {row && (
          <dl className="mt-4 grid gap-2 text-sm md:grid-cols-2">
            <dt>Canonical source</dt><dd>{row.sourceObjectType}:{row.sourceObjectId}</dd>
            <dt>Information type</dt><dd>{row.informationType}</dd>
            <dt>Source kind</dt><dd>{row.sourceKind}</dd>
            <dt>Project</dt><dd>{row.projectId}</dd>
            <dt>Discipline</dt><dd>{row.responsibleDiscipline ?? row.discipline ?? "—"}</dd>
            <dt>System / asset</dt><dd>{row.systemId ?? "—"} / {row.assetId ?? "—"}</dd>
            <dt>Lifecycle</dt><dd>{row.lifecycleStage ?? "—"}</dd>
            <dt>Purpose</dt><dd>{row.purpose}</dd>
            <dt>Eligibility</dt><dd>{row.eligibility}</dd>
            <dt>Revision</dt><dd>{String(row.sourceFacts?.revision ?? "source-domain")}</dd>
            <dt>Baseline</dt><dd>{row.configurationBaselineId ?? String(row.sourceFacts?.baselineId ?? "—")}</dd>
            <dt>Superseded</dt><dd>{String(row.sourceFacts?.superseded ?? false)}</dd>
            <dt>Stale</dt><dd>{String(row.sourceFacts?.stale ?? false)}</dd>
            <dt>Provenance</dt><dd>{row.createdBy ?? "—"} · {row.createdAt}</dd>
          </dl>
        )}
        <p className="mt-4 text-sm text-muted-foreground">Digital Thread, Review, and Decision links remain on the canonical source. This page does not copy source content.</p>
      </main>
    </>
  );
}
