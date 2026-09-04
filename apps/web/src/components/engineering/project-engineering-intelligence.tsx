"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CommandPanel, EmptyState, EvidenceChain, LiveSignal, ProjectSelectCommandSurface, SectionHeader } from "@rtb/ui";
import { PiLoadingSkeleton, PiUnavailablePanel } from "./pi-page-chrome";
import { PI_BASE_PATH, withPiProjectQuery } from "./pi-project-context";
import { documentReadinessLabel } from "./pi-ux";
import { PI_UNAVAILABLE } from "@/lib/project-intelligence/pi-api";
import { usePiJson } from "@/lib/project-intelligence/use-pi-json";

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
  const centreResource = usePiJson<CommandCentreLite>(
    "engineering",
    projectId
      ? `/api/engineering/project-intelligence/projects/${encodeURIComponent(projectId)}/command-centre`
      : null,
  );
  const documentsResource = usePiJson<DocumentRow[]>(
    "engineering",
    projectId ? "/api/engineering/project-intelligence/documents" : null,
  );
  const meetingsResource = usePiJson<MeetingRow[]>(
    "engineering",
    projectId ? "/api/engineering/project-intelligence/meetings" : null,
  );
  const centre = centreResource.data;
  const documentsFailed = documentsResource.status === "error";
  const meetingsFailed = meetingsResource.status === "error";
  const documents = documentsFailed ? [] : (documentsResource.data ?? []);
  const meetings = meetingsFailed ? [] : (meetingsResource.data ?? []);
  const loading = [centreResource, documentsResource, meetingsResource].some((item) => item.status === "loading");
  const centreFailed = centreResource.status === "error";

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
      <ProjectSelectCommandSurface
        title="ENGINEERING INTELLIGENCE"
        description="Select a project to activate technical operations."
        testId="engineering-intelligence-project-empty"
      />
    );
  }
  if (loading) return <PiLoadingSkeleton label="Loading engineering intelligence…" />;
  if (centreFailed) {
    return (
      <PiUnavailablePanel
        title={PI_UNAVAILABLE.engineering}
        dataset="engineering"
        requestId={centreResource.requestId}
        onRetry={() => void centreResource.reload()}
        testId="pi-error-state"
      />
    );
  }
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
    <div className="space-y-6" data-testid="project-intelligence-engineering">
      <CommandPanel title="Evidence chain" accent="cyan" meta="Counts from published records. Links are shown only where canonical relationships exist.">
        <EvidenceChain
          nodes={[
            { label: "Documents", value: String(projectDocuments.length), href: withPiProjectQuery(`${PI_BASE_PATH}/documents`, projectId) },
            { label: "Findings", value: String(centre.knowledge.counts.open ?? projectDocuments.reduce((sum, doc) => sum + doc.findingsCount, 0)), href: withPiProjectQuery(`${PI_BASE_PATH}/findings`, projectId) },
            { label: "Technical queries", value: String(query.portfolio.openCount), href: withPiProjectQuery(`${PI_BASE_PATH}/queries-decisions`, projectId) },
            { label: "Decisions", value: String(centre.queryDecisionIntelligence.decision.portfolio.openCount), href: withPiProjectQuery(`${PI_BASE_PATH}/decisions`, projectId) },
            { label: "Actions", value: String(centre.queryDecisionIntelligence.action.portfolio.openCount) },
          ]}
        />
      </CommandPanel>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <LiveSignal label="Overdue TQs" value={String(query.portfolio.overdueCount)} />
        <LiveSignal label="Actions overdue" value={String(centre.queryDecisionIntelligence.action.portfolio.overdueCount)} />
        <LiveSignal label="Findings" value={String(centre.knowledge.counts.open ?? "—")} />
        <LiveSignal label="Recent decisions" value={String(centre.queryDecisionIntelligence.decision.portfolio.recentlyDecidedCount)} />
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
        {documentsFailed ? (
          <PiUnavailablePanel
            title="Document intelligence is temporarily unavailable."
            dataset="engineering"
            requestId={documentsResource.requestId}
            onRetry={() => void documentsResource.reload()}
          />
        ) : projectDocuments.length === 0 ? (
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
        {meetingsFailed ? (
          <PiUnavailablePanel
            title="Meeting intelligence is temporarily unavailable."
            dataset="engineering"
            requestId={meetingsResource.requestId}
            onRetry={() => void meetingsResource.reload()}
          />
        ) : projectMeetings.length === 0 ? (
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
