"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { StatusChip } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import {
  persistEngineeringProjectFilter,
  useEngineeringProjectFilter,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import { withProjectHref } from "@/lib/engineering/enterprise-ux";
import { useExperiencePerf } from "@/hooks/use-experience-perf";
import { useEngineeringCapabilities } from "@/hooks/use-engineering-capabilities";
import {
  OperationalError,
  OperationalSkeleton,
  type OperationalRow,
} from "@/components/engineering/operational";
import { ENGINEERING_HUB_BRANCHES } from "@/lib/engineering/project-workspace-ia";

type DashboardPayload = {
  activeProjects?: OperationalRow[];
  recentDocuments?: OperationalRow[];
  reviewRequiredCount?: number;
  openActionsCount?: number;
  pendingDecisionsCount?: number;
  openRisksCount?: number;
  openIssuesCount?: number;
  openTechnicalQueriesCount?: number;
  attention?: {
    openActions?: OperationalRow[];
    overdueActions?: OperationalRow[];
    pendingDecisions?: OperationalRow[];
    openRisks?: OperationalRow[];
    highRisks?: OperationalRow[];
    openTqs?: OperationalRow[];
    openIssues?: OperationalRow[];
    projects?: OperationalRow[];
  };
};

function labelOf(row: OperationalRow, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return String(row.id ?? "Item");
}

/**
 * Approved Engineering Home — default authenticated EOS experience.
 * Answers: What needs attention? What changed? What next? Which projects?
 * Canonical dashboard API only — no fake engineering state.
 */
export default function EngineeringHomePage() {
  useExperiencePerf("home");
  const projectId = useEngineeringProjectFilter();
  const capabilities = useEngineeringCapabilities();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const started = performance.now();
    setLoading(true);
    fetch(withProjectQuery("/api/engineering/dashboard", projectId))
      .then((r) => parseApiJsonResponse<DashboardPayload>(r))
      .then((parsed) => {
        if (!parsed.ok || !parsed.data) {
          setError(parsed.errorMessage ?? "Failed to load Home");
          setDashboard(null);
          return;
        }
        setDashboard(parsed.data);
        setError(null);
        if (typeof window !== "undefined") {
          console.info(`[eos-ux-1a] home wall_ms=${Math.round(performance.now() - started)}`);
        }
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load Home"),
      )
      .finally(() => setLoading(false));
  }, [projectId]);

  const actionsEnabled = capabilities.entitledApplicationKeys.includes("project_controls");
  const askEnabled = capabilities.visiblePrimaryNavIds.includes("eng-ask");
  const attention = dashboard?.attention ?? {};
  const openActions = attention.openActions ?? [];
  const overdueActions = attention.overdueActions ?? [];
  const pendingDecisions = attention.pendingDecisions ?? [];
  const openTqs = attention.openTqs ?? [];
  const highRisks = attention.highRisks ?? attention.openRisks ?? [];
  const projects = attention.projects ?? dashboard?.activeProjects ?? [];
  const needsActionRows = [
    ...(actionsEnabled ? (overdueActions.length ? overdueActions : openActions) : []),
    ...openTqs,
  ].slice(0, 8);
  const hubProjectId = projectId || (projects[0] ? String(projects[0].id) : "");

  return (
    <>
      <Header
        title="Home"
        description="What needs attention, what changed, and what to do next"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-6 lg:px-8"
        data-testid="engineering-os-v1-ready"
        data-eos-home="approved-engineering"
      >
        <div data-testid="engineering-os-shell" className="contents">
          <div data-testid="engineering-os-product-ready" className="contents">
            <div data-testid="engineering-home" className="contents">
              <div data-testid="engineering-approved-home" className="space-y-6">
                <section
                  className="rounded-md border border-slate-200 bg-white p-4"
                  data-testid="home-intro"
                >
                  <h2 className="text-lg font-semibold text-slate-900">Engineering workspace</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Start from real project and work-package state — not platform or AI status.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/engineering/projects"
                      className="inline-flex min-h-10 items-center rounded-md bg-[color:var(--eos-navy,#0b1f3a)] px-4 text-sm font-medium text-white"
                      data-testid="home-open-projects"
                    >
                      Open Projects
                    </Link>
                    <Link
                      href="/engineering/my"
                      className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-800"
                      data-testid="home-open-my-work"
                    >
                      My Work
                    </Link>
                    {askEnabled ? (
                      <Link
                        href="/engineering/ask"
                        className="inline-flex min-h-10 items-center rounded-md border border-slate-300 px-4 text-sm text-slate-700"
                        data-testid="home-open-ai"
                      >
                        AI
                      </Link>
                    ) : null}
                  </div>
                </section>

                {error ? <OperationalError message={error} retryHref="/engineering" /> : null}
                {loading ? <OperationalSkeleton label="Loading engineering Home…" /> : null}

                {!loading ? (
                  <>
                    <section
                      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                      data-testid="home-attention-summary"
                    >
                      <Metric
                        label="Needs action"
                        value={String(
                          (dashboard?.openActionsCount ?? 0) +
                            (dashboard?.openTechnicalQueriesCount ?? 0),
                        )}
                        href="/engineering/my"
                      />
                      <Metric
                        label="Reviews awaiting you"
                        value={String(dashboard?.reviewRequiredCount ?? 0)}
                        href="/review"
                      />
                      <Metric
                        label="Decisions required"
                        value={String(dashboard?.pendingDecisionsCount ?? 0)}
                        href={withProjectHref("/engineering/decisions", projectId)}
                      />
                      <Metric
                        label="At risk"
                        value={String(dashboard?.openRisksCount ?? 0)}
                        href={withProjectHref("/engineering/risks", projectId)}
                      />
                    </section>

                    <div className="grid gap-4 lg:grid-cols-2" data-testid="home-approved-ia">
                      <QueueCard
                        testId="home-needs-action"
                        title="Needs Action"
                        href="/engineering/my"
                        rows={needsActionRows}
                        keys={["title", "action_title", "query_number", "subject", "summary"]}
                        empty="No assigned actions or queries in current scope."
                      />
                      <QueueCard
                        testId="home-changed"
                        title="Changed"
                        href={withProjectHref("/engineering/changes", projectId)}
                        rows={[]}
                        keys={["title"]}
                        empty="No deterministic change queue items in current dashboard scope."
                      />
                      <QueueCard
                        testId="home-reviews"
                        title="Reviews Awaiting You"
                        href="/review"
                        rows={[]}
                        keys={["title"]}
                        empty={
                          (dashboard?.reviewRequiredCount ?? 0) > 0
                            ? `${dashboard?.reviewRequiredCount} review(s) recorded — open Reviews.`
                            : "No reviews awaiting you in current scope."
                        }
                        countHint={dashboard?.reviewRequiredCount}
                      />
                      <QueueCard
                        testId="home-decisions"
                        title="Decisions Required"
                        href={withProjectHref("/engineering/decisions", projectId)}
                        rows={pendingDecisions}
                        keys={["title", "decision_title", "question"]}
                        empty="No decisions currently require attention."
                      />
                      <QueueCard
                        testId="home-waiting-others"
                        title="Waiting on Others"
                        href="/engineering/my"
                        rows={[]}
                        keys={["title"]}
                        empty="No waiting-on-others items in current deterministic queues."
                      />
                      <QueueCard
                        testId="home-at-risk"
                        title="At Risk"
                        href={withProjectHref("/engineering/risks", projectId)}
                        rows={highRisks}
                        keys={["title", "risk_title"]}
                        empty="No high-severity risks recorded in this scope."
                      />
                      <QueueCard
                        testId="home-recently-completed"
                        title="Recently Completed"
                        href="/engineering/my"
                        rows={[]}
                        keys={["title"]}
                        empty="Recently completed items appear when completion data is available."
                      />
                      <QueueCard
                        testId="home-my-projects"
                        title="My Projects"
                        href="/engineering/projects"
                        rows={projects}
                        keys={["project_name", "project_code"]}
                        empty="No engineering projects in this workspace yet."
                        itemHref={(row) => `/engineering/projects/${row.id}`}
                        onItemClick={(id) => persistEngineeringProjectFilter(id)}
                      />
                    </div>

                    <section
                      className="rounded-md border border-slate-200 bg-white p-4"
                      data-testid="home-engineering-hub"
                    >
                      <h2 className="text-base font-semibold text-slate-900">Engineering hub</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Navigation into project capabilities. Select a project first when none is in
                        context.
                      </p>
                      {!hubProjectId ? (
                        <p className="mt-3 text-sm text-slate-500">
                          <Link href="/engineering/projects" className="underline-offset-2 hover:underline">
                            Open Projects
                          </Link>{" "}
                          to enter a project workspace.
                        </p>
                      ) : (
                        <ul
                          className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
                          data-testid="home-hub-branches"
                        >
                          {ENGINEERING_HUB_BRANCHES.map((b) => (
                            <li key={b.id}>
                              <Link
                                href={`/engineering/projects/${hubProjectId}/${b.slug}`}
                                className="flex min-h-11 items-center rounded-md border border-slate-200 px-3 text-sm text-slate-800 hover:border-[color:var(--eos-gold,#c4a35a)]"
                                data-testid={`home-hub-${b.id}`}
                                onClick={() => persistEngineeringProjectFilter(hubProjectId)}
                              >
                                {b.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    {projects.length > 0 ? (
                      <section
                        className="rounded-md border border-slate-200 bg-white p-4"
                        data-testid="home-recent-activity"
                      >
                        <h3 className="mb-3 text-sm font-semibold text-slate-900">
                          Recent engineering activity
                        </h3>
                        <ul className="divide-y divide-slate-100">
                          {projects.slice(0, 6).map((row) => {
                            const id = String(row.id ?? "");
                            return (
                              <li key={id}>
                                <Link
                                  href={`/engineering/projects/${id}`}
                                  className="flex min-h-11 items-center justify-between gap-3 px-1 py-2 text-sm hover:bg-slate-50"
                                  onClick={() => persistEngineeringProjectFilter(id)}
                                >
                                  <span className="text-slate-800">
                                    {String(row.project_code ?? "")} —{" "}
                                    {String(row.project_name ?? id)}
                                  </span>
                                  <StatusChip value={String(row.status ?? "")} />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    ) : null}

                    <p className="text-[11px] text-slate-500">
                      Legacy workbench and command surfaces remain under Advanced routes only — not
                      required for day-to-day engineering.
                      {actionsEnabled ? null : null}
                    </p>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Metric({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-slate-200 bg-white px-3 py-3 hover:border-slate-400"
    >
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </Link>
  );
}

function QueueCard({
  title,
  href,
  rows,
  keys,
  empty,
  testId,
  itemHref,
  onItemClick,
  countHint,
}: {
  title: string;
  href: string;
  rows: OperationalRow[];
  keys: string[];
  empty: string;
  testId: string;
  itemHref?: (row: OperationalRow) => string;
  onItemClick?: (id: string) => void;
  countHint?: number;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-3" data-testid={testId}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          {title}
          {typeof countHint === "number" && countHint > 0 ? (
            <span className="ml-2 rounded border border-amber-300 bg-amber-50 px-1.5 text-[11px] text-amber-900">
              {countHint}
            </span>
          ) : null}
        </h3>
        <Link href={href} className="text-xs text-slate-600 underline-offset-2 hover:underline">
          Open
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {rows.slice(0, 5).map((row) => {
            const id = String(row.id ?? labelOf(row, keys));
            const dest = itemHref?.(row) ?? href;
            return (
              <li key={id}>
                <Link
                  href={dest}
                  className="block rounded px-1 py-1 text-sm text-slate-800 hover:bg-slate-50"
                  onClick={() => onItemClick?.(id)}
                >
                  {labelOf(row, keys)}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
