"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import {
  useEngineeringProjectFilter,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import {
  AskEngineeringAI,
  OperationalError,
  OperationalMetricCard,
  OperationalPageIntro,
  OperationalSkeleton,
  ProvenanceLink,
  WorkQueue,
  type OperationalRow,
} from "@/components/engineering/operational";

type DashboardPayload = {
  openActionsCount?: number;
  pendingDecisionsCount?: number;
  openRisksCount?: number;
  openTechnicalQueriesCount?: number;
  openIssuesCount?: number;
  attention?: {
    openActions?: OperationalRow[];
    pendingDecisions?: OperationalRow[];
    highRisks?: OperationalRow[];
    openRisks?: OperationalRow[];
    openTqs?: OperationalRow[];
    projects?: OperationalRow[];
  };
  activeProjects?: OperationalRow[];
};

const SURFACES = [
  {
    id: "progress",
    name: "Progress",
    href: "/engineering/projects",
    summary: "Descriptive progress from recorded project status and activity.",
    limitation: null as string | null,
  },
  {
    id: "schedule",
    name: "Schedule",
    href: "/engineering/timeline",
    summary: "Descriptive schedule intelligence from available project data.",
    limitation: "Native CPM calculation is not available.",
  },
  {
    id: "cost",
    name: "Cost / progress",
    href: "/engineering/reports",
    summary: "Descriptive cost intelligence from available project data.",
    limitation: "Authoritative cost control / ledger posting is not available.",
  },
  {
    id: "change",
    name: "Change",
    href: "/engineering/issues",
    summary: "Change signals from recorded issues and findings.",
    limitation: null,
  },
  {
    id: "forecast",
    name: "Forecast",
    href: "/engineering/apps/project-intelligence/reports",
    summary: "Advisory trajectory from composed contributors where certified.",
    limitation: null,
  },
  {
    id: "risk-opportunity",
    name: "Risk / opportunity",
    href: "/engineering/risks",
    summary: "Advisory risk signals from the engineering risk register.",
    limitation: null,
  },
  {
    id: "decision",
    name: "Decision support",
    href: "/engineering/decisions",
    summary: "Options and recommendations. Humans own decisions.",
    limitation: null,
  },
  {
    id: "scenario",
    name: "Scenario",
    href: "/engineering/apps/project-controls/release",
    summary: "Exploratory comparisons. No auto-execution.",
    limitation: null,
  },
  {
    id: "assurance",
    name: "Assurance",
    href: "/engineering/apps/project-controls/release",
    summary: "Advisory posture and known limitations.",
    limitation: null,
  },
] as const;

export default function ProjectControlsOverviewPage() {
  const projectId = useEngineeringProjectFilter();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(withProjectQuery("/api/engineering/dashboard", projectId))
      .then((r) => parseApiJsonResponse<DashboardPayload>(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setError(parsed.errorMessage ?? "Failed to load project controls");
          return;
        }
        setDashboard(parsed.data);
        setError(null);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load project controls"),
      )
      .finally(() => setLoading(false));
  }, [projectId]);

  const attention = dashboard?.attention ?? {};

  return (
    <section data-testid="project-controls-ready" aria-labelledby="pc-overview-title">
      <div data-testid="project-controls-v1-ready">
        <h1 id="pc-overview-title" className="text-2xl font-semibold text-slate-900">
          Project Controls
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Version <span data-testid="project-controls-ga-version">1.0.0</span>
        </p>
        <OperationalPageIntro
          purpose="Progress, schedule, cost, change, forecast, and decision support from recorded project data."
        />
        <ProvenanceLink
          href="/engineering/apps/project-controls/release"
          label="About this insight · Methodology · Governance"
        />
        <div className="mt-3">
          <AskEngineeringAI
            projectId={projectId}
            q="Summarize project controls status from recorded evidence."
          />
        </div>

        {loading ? <div className="mt-6"><OperationalSkeleton /></div> : null}
        {error ? (
          <div className="mt-6">
            <OperationalError message={error} />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OperationalMetricCard
            label="Open risks"
            value={dashboard?.openRisksCount ?? 0}
            href="/engineering/risks"
          />
          <OperationalMetricCard
            label="Open TQs"
            value={dashboard?.openTechnicalQueriesCount ?? 0}
            href="/engineering/technical-queries"
          />
          <OperationalMetricCard
            label="Outstanding actions"
            value={dashboard?.openActionsCount ?? 0}
            href="/engineering/actions"
          />
          <OperationalMetricCard
            label="Pending decisions"
            value={dashboard?.pendingDecisionsCount ?? 0}
            href="/engineering/decisions"
          />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <WorkQueue
            title="Risk / opportunity"
            href="/engineering/risks"
            rows={attention.highRisks ?? attention.openRisks ?? []}
            labelKeys={["title", "risk_title"]}
            statusKey="status"
            emptyTitle="No recorded risks"
            emptyDescription="Risk signals appear here from the engineering register."
          />
          <WorkQueue
            title="Decision support"
            href="/engineering/decisions"
            rows={attention.pendingDecisions ?? []}
            labelKeys={["title", "decision_title"]}
            statusKey="approval_status"
            emptyTitle="No pending decisions"
            emptyDescription="Decisions awaiting attention appear here."
          />
        </div>

        <ul
          className="mt-8 grid gap-3 sm:grid-cols-2"
          data-testid="project-controls-v1-surfaces"
          aria-label="Project Controls workspace"
        >
          {SURFACES.map((surface) => (
            <li
              key={surface.id}
              className="rounded-md border border-slate-200 bg-white p-4"
              data-testid={`project-controls-surface-${surface.id}`}
            >
              <p className="text-sm font-medium text-slate-900">{surface.name}</p>
              <p className="mt-1 text-sm text-slate-600">{surface.summary}</p>
              {surface.limitation ? (
                <p className="mt-2 text-xs text-slate-500">{surface.limitation}</p>
              ) : null}
              <Link
                href={surface.href}
                className="mt-3 inline-block text-sm font-medium underline-offset-2 hover:underline"
              >
                Open {surface.name.toLowerCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
