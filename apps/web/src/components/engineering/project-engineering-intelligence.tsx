"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, EmptyState, SectionHeader } from "@rtb/ui";
import { PiErrorState, PiLoadingSkeleton } from "./pi-page-chrome";
import { PI_BASE_PATH, withPiProjectQuery } from "./pi-project-context";
import { documentReadinessLabel } from "./pi-ux";

type CommandCentreLite = {
  project: { projectId: string; projectCode: string; projectName: string };
  queryDecisionIntelligence: {
    query: {
      availability: string;
      health: { headline: string };
      portfolio: {
        openCount: number;
        overdueCount: number;
        highPriorityCount: number;
      };
      attentionItems: Array<{ id: string; severity: string; explanation: string }>;
    };
    action: {
      availability: string;
      health: { headline: string };
      portfolio: { openCount: number; overdueCount: number };
    };
    decision: {
      availability: string;
      health: { headline: string };
      portfolio: { openCount: number; overdueCount: number; recentlyDecidedCount: number };
    };
  };
  quality: { availability: string; summary: string; counts: Record<string, number> };
  knowledge: { availability: string; summary: string; counts: Record<string, number> };
  limitations: string[];
};

type DocumentRow = {
  engineeringDocumentId: string;
  documentNumber: string | null;
  title: string | null;
  revision: string | null;
  processingStatus: string;
  readiness: string;
  findingsCount: number;
  processedAt: string | null;
  engineeringProjectId?: string | null;
};

type MeetingRow = {
  id: string;
  title: string;
  engineering_project_id: string | null;
  status: string;
  scheduled_start_at: string | null;
};

export function ProjectEngineeringIntelligenceView() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";
  const [centre, setCentre] = useState<CommandCentreLite | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [meetings, setMeetings] = useState<MeetingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setCentre(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/engineering/project-intelligence/projects/${encodeURIComponent(projectId)}/command-centre`).then(
        async (response) => {
          const body = await response.json();
          if (!response.ok) throw new Error(body.error?.message ?? "Engineering intelligence unavailable");
          return body.data as CommandCentreLite;
        },
      ),
      fetch("/api/engineering/project-intelligence/documents").then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Documents unavailable");
        return (body.data ?? []) as DocumentRow[];
      }),
      fetch("/api/engineering/project-intelligence/meetings").then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message ?? "Meetings unavailable");
        return (body.data ?? []) as MeetingRow[];
      }),
    ])
      .then(([nextCentre, nextDocuments, nextMeetings]) => {
        if (cancelled) return;
        setCentre(nextCentre);
        setDocuments(nextDocuments);
        setMeetings(nextMeetings);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Engineering intelligence unavailable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const projectDocuments = useMemo(
    () =>
      documents.filter(
        (doc) => !doc.engineeringProjectId || !projectId || doc.engineeringProjectId === projectId,
      ),
    [documents, projectId],
  );
  const projectMeetings = useMemo(
    () => meetings.filter((meeting) => !projectId || meeting.engineering_project_id === projectId),
    [meetings, projectId],
  );

  if (!projectId) {
    return (
      <EmptyState
        title="Select a project"
        description="Engineering Intelligence requires a selected project. All Projects is a portfolio choice only."
        data-testid="engineering-intelligence-project-empty"
      />
    );
  }
  if (loading) return <PiLoadingSkeleton label="Loading engineering intelligence…" />;
  if (error) return <PiErrorState title="Engineering intelligence unavailable" description={error} />;
  if (!centre) {
    return (
      <EmptyState
        title="No engineering intelligence"
        description="No published engineering evidence is available for the selected project."
      />
    );
  }

  const query = centre.queryDecisionIntelligence.query;
  const failedDocs = projectDocuments.filter(
    (doc) => doc.processingStatus === "failed" || doc.processingStatus === "error",
  );
  const partialDocs = projectDocuments.filter((doc) => documentReadinessLabel(doc.processingStatus, doc.readiness) === "Partial");

  return (
    <div className="space-y-8" data-testid="project-intelligence-engineering">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overdue TQs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{query.portfolio.overdueCount}</p>
            <p className="mt-1 text-sm text-slate-600">
              {query.portfolio.highPriorityCount} high priority · {query.portfolio.openCount} open
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Engineering actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {centre.queryDecisionIntelligence.action.portfolio.overdueCount}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              overdue of {centre.queryDecisionIntelligence.action.portfolio.openCount} open
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{centre.knowledge.summary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {centre.queryDecisionIntelligence.decision.portfolio.recentlyDecidedCount}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {centre.queryDecisionIntelligence.decision.portfolio.overdueCount} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {query.availability === "no_data" ? (
        <EmptyState
          title="No technical query evidence"
          description="Connect or capture TQs in the project register to enable TQ intelligence."
        />
      ) : (
        <section>
          <SectionHeader title="Technical queries needing attention" />
          {query.attentionItems.length === 0 ? (
            <p className="text-sm text-slate-600">No overdue or high-priority TQs in published evidence.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {query.attentionItems.slice(0, 8).map((item) => (
                <li key={item.id} className="rounded-md border border-slate-200 px-4 py-3 text-sm">
                  <p className="font-medium text-slate-900">{item.severity.toUpperCase()}</p>
                  <p className="mt-1 text-slate-700">{item.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <div className="flex items-end justify-between gap-3">
          <SectionHeader
            title="Document intelligence"
            description="What changed in project documents. Not a duplicate document register."
          />
          <Link
            href={withPiProjectQuery(`${PI_BASE_PATH}/documents`, projectId)}
            className="text-sm font-medium text-cyan-800 hover:underline"
          >
            Open documents
          </Link>
        </div>
        {projectDocuments.length === 0 ? (
          <EmptyState
            title="No project documents are available in the selected project."
            description="Engineering Core remains the document register. Import or connect documents to enable document intelligence."
          />
        ) : (
          <p className="mt-2 text-sm text-slate-700">
            {projectDocuments.length} documents · {partialDocs.length} partial · {failedDocs.length} failed ·{" "}
            {projectDocuments.reduce((sum, doc) => sum + doc.findingsCount, 0)} findings
          </p>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <SectionHeader title="Meeting intelligence" description="Commitments and follow-up, not manual capture as the primary value." />
          <Link
            href={withPiProjectQuery(`${PI_BASE_PATH}/meetings`, projectId)}
            className="text-sm font-medium text-cyan-800 hover:underline"
          >
            Open meetings
          </Link>
        </div>
        {projectMeetings.length === 0 ? (
          <EmptyState
            title="No meetings have been captured or connected yet."
            description="Manual meeting entry remains available as a fallback."
            action={
              <Link
                href={withPiProjectQuery(`${PI_BASE_PATH}/meetings/new`, projectId)}
                className="text-sm font-medium text-cyan-800 hover:underline"
              >
                New meeting
              </Link>
            }
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {projectMeetings.slice(0, 6).map((meeting) => (
              <li key={meeting.id} className="rounded-md border border-slate-200 px-4 py-3 text-sm">
                <Link
                  href={`${PI_BASE_PATH}/meetings/${meeting.id}`}
                  className="font-medium text-cyan-800 hover:underline"
                >
                  {meeting.title}
                </Link>
                <p className="mt-1 text-slate-600">{meeting.status}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href={withPiProjectQuery(`${PI_BASE_PATH}/findings`, projectId)} className="text-cyan-800 hover:underline">
          Findings
        </Link>
        <Link href={withPiProjectQuery(`${PI_BASE_PATH}/queries-decisions`, projectId)} className="text-cyan-800 hover:underline">
          Queries
        </Link>
        <Link href={withPiProjectQuery(`${PI_BASE_PATH}/decisions`, projectId)} className="text-cyan-800 hover:underline">
          Decisions
        </Link>
      </div>
    </div>
  );
}
