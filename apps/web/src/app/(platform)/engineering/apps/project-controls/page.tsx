"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import {
  useEngineeringProjectFilter,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import {
  AskEngineeringAI,
  EmptyOperationalState,
  OperationalError,
  OperationalPageIntro,
  OperationalSkeleton,
  WorkQueue,
  type OperationalRow,
} from "@/components/engineering/operational";

type DashboardPayload = {
  openActionsCount?: number;
  attention?: {
    openActions?: OperationalRow[];
    openIssues?: OperationalRow[];
  };
  activeProjects?: OperationalRow[];
};

export default function ProjectControlsOverviewPage() {
  const projectId = useEngineeringProjectFilter();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch(withProjectQuery("/api/engineering/dashboard", projectId))
      .then((r) => parseApiJsonResponse<DashboardPayload>(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setError(parsed.errorMessage ?? "Failed to load project controls");
          setDashboard(null);
          return;
        }
        setDashboard(parsed.data);
        setError(null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load project controls"))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const actions = dashboard?.attention?.openActions ?? [];
  const issues = dashboard?.attention?.openIssues ?? [];

  return (
    <section data-testid="project-controls-ready" aria-labelledby="pc-overview-title">
      <div data-testid="project-controls-v1-ready">
        <h1 id="pc-overview-title" className="text-2xl font-semibold text-slate-900">
          Project Controls
        </h1>
        <OperationalPageIntro
          purpose="Published progress, schedule, cost, change, productivity, and forecast evidence for the selected project."
        />
        <AskEngineeringAI
          projectId={projectId}
          q="What published project controls evidence needs attention?"
        />

        {loading ? (
          <div className="mt-6">
            <OperationalSkeleton />
          </div>
        ) : null}
        {error ? (
          <div className="mt-6">
            <OperationalError message={error} onRetry={load} />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-2" data-testid="pc-attention">
          <WorkQueue
            title="Attention required"
            href="/engineering/actions"
            rows={actions}
            labelKeys={["title", "action_title"]}
            statusKey="status"
            emptyTitle="Nothing currently requires action from published controls."
            emptyDescription="Outstanding actions owned by Project Controls appear here when published."
          />
          <WorkQueue
            title="Change signals"
            href="/engineering/apps/project-controls/change"
            rows={issues}
            labelKeys={["title", "issue_title"]}
            statusKey="status"
            emptyTitle="No published change evidence is available."
            emptyDescription="Change intelligence is descriptive. It is not contractual authority."
          />
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ControlsCard
            title="Progress"
            href="/engineering/apps/project-controls/progress"
            body="Descriptive progress from published project status. Not earned value."
          />
          <ControlsCard
            title="Schedule"
            href="/engineering/apps/project-controls/schedule"
            body="Descriptive schedule signals from available project data. Native CPM is not available."
          />
          <ControlsCard
            title="Cost"
            href="/engineering/apps/project-controls/cost"
            body="Descriptive cost signals. This is not a budget ledger."
          />
          <ControlsCard
            title="Forecast"
            href="/engineering/apps/project-controls/forecast"
            body="Advisory trajectory where published. Not predictive scheduling."
            advisory
          />
          <ControlsCard
            title="Productivity"
            href="/engineering/apps/project-controls/productivity"
            body="Descriptive productivity signals. Not workforce management."
          />
          <ControlsCard
            title="Assurance"
            href="/engineering/apps/project-controls/assurance"
            body="Advisory assurance posture and known limitations."
            advisory
          />
        </section>

        {!loading && !projectId ? (
          <div className="mt-8">
            <EmptyOperationalState
              title="Select a project to inspect published controls."
              description="Use the project selector in the command header. All-projects scope shows workspace attention only."
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ControlsCard({
  title,
  href,
  body,
  advisory,
}: {
  title: string;
  href: string;
  body: string;
  advisory?: boolean;
}) {
  return (
    <Link href={href} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {advisory ? (
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-amber-800">Advisory</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </Link>
  );
}
