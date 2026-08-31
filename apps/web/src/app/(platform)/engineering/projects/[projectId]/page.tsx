"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { persistEngineeringProjectFilter } from "@/hooks/use-engineering-project-filter";
import {
  AskEngineeringAI,
  ContextTabs,
  OperationalError,
  OperationalMetricCard,
  OperationalSkeleton,
  ProjectContextHeader,
  WorkQueue,
  recordLabel,
  type OperationalRow,
} from "@/components/engineering/operational";

type ProjectPayload = {
  project: Record<string, unknown>;
  assets: Record<string, unknown>[];
  documents: Record<string, unknown>[];
};

type DashboardPayload = {
  openActionsCount?: number;
  pendingDecisionsCount?: number;
  openRisksCount?: number;
  openTechnicalQueriesCount?: number;
  openIssuesCount?: number;
  recentDocuments?: OperationalRow[];
  attention?: {
    openActions?: OperationalRow[];
    pendingDecisions?: OperationalRow[];
    highRisks?: OperationalRow[];
    openRisks?: OperationalRow[];
    openTqs?: OperationalRow[];
  };
};

const WORKSPACE_TABS = (projectId: string) =>
  [
    { href: `/engineering/projects/${projectId}`, label: "Overview", exact: true },
    { href: `/engineering/documents?projectId=${projectId}`, label: "Documents" },
    { href: `/engineering/apps/inspection-intelligence?projectId=${projectId}`, label: "Inspections" },
    { href: `/engineering/apps/model-interoperability/models?projectId=${projectId}`, label: "Models" },
    { href: `/engineering/risks?projectId=${projectId}`, label: "Risks" },
    { href: `/engineering/technical-queries?projectId=${projectId}`, label: "Technical Queries" },
    { href: `/engineering/decisions?projectId=${projectId}`, label: "Decisions" },
    { href: `/engineering/actions?projectId=${projectId}`, label: "Actions" },
    { href: `/engineering/reports?projectId=${projectId}`, label: "Reports" },
    { href: `/engineering/apps/project-intelligence?projectId=${projectId}`, label: "Intelligence" },
    { href: `/engineering/ask?projectId=${projectId}&objectType=project&objectId=${projectId}`, label: "AI" },
  ] as const;

export default function EngineeringProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [data, setData] = useState<ProjectPayload | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    persistEngineeringProjectFilter(projectId);
    const started = performance.now();
    Promise.all([
      fetch(`/api/engineering/projects/${projectId}`).then((r) =>
        parseApiJsonResponse<ProjectPayload>(r),
      ),
      fetch(`/api/engineering/dashboard?projectId=${encodeURIComponent(projectId)}`).then((r) =>
        parseApiJsonResponse<DashboardPayload>(r),
      ),
    ])
      .then(([projectParsed, dashParsed]) => {
        if (!projectParsed.ok || !projectParsed.data) {
          setError(projectParsed.errorMessage ?? "Failed to load project");
          return;
        }
        setData(projectParsed.data);
        if (dashParsed.ok && dashParsed.data) setDashboard(dashParsed.data);
        if (typeof window !== "undefined") {
          console.info(
            `[eos-ux-1] project-workspace wall_ms=${Math.round(performance.now() - started)}`,
          );
        }
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load project"),
      );
  }, [projectId]);

  const project = data?.project;
  const tabs = useMemo(() => WORKSPACE_TABS(projectId), [projectId]);
  const attention = dashboard?.attention ?? {};

  return (
    <>
      <Header
        title={
          project
            ? `${project.project_code as string} — ${project.project_name as string}`
            : "Project"
        }
        description="Project workspace — status, unresolved work, and next actions"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {error ? <OperationalError message={error} retryHref={`/engineering/projects/${projectId}`} /> : null}
        {!project && !error ? <OperationalSkeleton label="Loading project workspace…" /> : null}
        {project ? (
          <div data-testid="project-workspace">
            <ProjectContextHeader
              code={project.project_code as string}
              name={project.project_name as string}
              status={project.status as string}
              phase={project.project_phase as string}
              projectId={projectId}
            />
            <ContextTabs links={tabs} ariaLabel="Project workspace" />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <OperationalMetricCard
                label="Critical / open risks"
                value={dashboard?.openRisksCount ?? 0}
                href={`/engineering/risks?projectId=${projectId}`}
                tone={(dashboard?.openRisksCount ?? 0) > 0 ? "attention" : "neutral"}
              />
              <OperationalMetricCard
                label="Open TQs"
                value={dashboard?.openTechnicalQueriesCount ?? 0}
                href={`/engineering/technical-queries?projectId=${projectId}`}
              />
              <OperationalMetricCard
                label="Outstanding actions"
                value={dashboard?.openActionsCount ?? 0}
                href={`/engineering/actions?projectId=${projectId}`}
              />
              <OperationalMetricCard
                label="Decisions awaiting attention"
                value={dashboard?.pendingDecisionsCount ?? 0}
                href={`/engineering/decisions?projectId=${projectId}`}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="Code" value={project.project_code as string} />
                  <Row label="Phase" value={project.project_phase as string} />
                  <Row label="Status" value={project.status as string} />
                  <Row label="Site" value={project.site_name as string} />
                  <Row label="Location" value={project.location as string} />
                  <Row label="Client" value={project.client_name as string} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recorded evidence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="Assets" value={String(data?.assets.length ?? 0)} />
                  <Row label="Documents" value={String(data?.documents.length ?? 0)} />
                  <Row
                    label="Unresolved issues"
                    value={String(dashboard?.openIssuesCount ?? 0)}
                  />
                  <p className="pt-2">
                    <Link
                      href={`/engineering/apps/project-controls?projectId=${projectId}`}
                      className="text-sm font-medium underline-offset-2 hover:underline"
                    >
                      Open Project Controls
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <WorkQueue
                title="Critical risks"
                href={`/engineering/risks?projectId=${projectId}`}
                rows={attention.highRisks ?? attention.openRisks ?? []}
                labelKeys={["title", "risk_title"]}
                statusKey="status"
                emptyTitle="No recorded risks"
                emptyDescription="Risks for this project will appear here when entered in the register."
              />
              <WorkQueue
                title="Open technical queries"
                href={`/engineering/technical-queries?projectId=${projectId}`}
                rows={attention.openTqs ?? []}
                labelKeys={["title", "query_number", "subject"]}
                statusKey="status"
                emptyTitle="No open TQs"
                emptyDescription="Technical queries for this project will appear here."
              />
              <WorkQueue
                title="Outstanding actions"
                href={`/engineering/actions?projectId=${projectId}`}
                rows={attention.openActions ?? []}
                labelKeys={["title", "action_title", "summary"]}
                statusKey="status"
                emptyTitle="No outstanding actions"
                emptyDescription="Actions for this project will appear here."
              />
              <WorkQueue
                title="Decisions awaiting attention"
                href={`/engineering/decisions?projectId=${projectId}`}
                rows={attention.pendingDecisions ?? []}
                labelKeys={["title", "decision_title"]}
                statusKey="approval_status"
                emptyTitle="No pending decisions"
                emptyDescription="Decisions requiring review will appear here."
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Documents</h3>
                  <Link
                    href={`/engineering/documents?projectId=${projectId}`}
                    className="text-xs font-medium underline-offset-2 hover:underline"
                  >
                    View all
                  </Link>
                </div>
                {(data?.documents.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate-600">No documents linked to this project.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {(data?.documents ?? []).slice(0, 8).map((doc) => (
                      <li key={String(doc.id)}>
                        <Link
                          href={`/engineering/documents/${doc.id}`}
                          className="hover:underline"
                        >
                          {recordLabel(doc, ["title", "document_number"])}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Assets</h3>
                  <Link
                    href="/engineering/assets"
                    className="text-xs font-medium underline-offset-2 hover:underline"
                  >
                    View all
                  </Link>
                </div>
                {(data?.assets.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate-600">No assets linked to this project.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {(data?.assets ?? []).slice(0, 8).map((asset) => (
                      <li key={String(asset.id)}>
                        <Link
                          href={`/engineering/assets/${asset.id}`}
                          className="hover:underline"
                        >
                          {recordLabel(asset, ["asset_tag", "asset_name"])}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="mt-6">
              <AskEngineeringAI
                label="Ask Engineering AI about this project"
                projectId={projectId}
                objectType="project"
                objectId={projectId}
                q="What changed on this project?"
              />
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}
