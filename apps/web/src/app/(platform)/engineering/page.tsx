"use client";

import { useEffect, useMemo, useState } from "react";
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
import { EngineeringHubRadial } from "@/components/engineering/home/engineering-hub-radial";
import {
  HomeAttentionColumn,
  type AttentionCard,
} from "@/components/engineering/home/home-attention-column";
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

/**
 * Approved three-zone Engineering Home (UX-1B golden functional reference).
 * Attention | Central Hub | Projects/Activity — canonical dashboard only.
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
    let cancelled = false;
    setLoading(true);
    fetch(withProjectQuery("/api/engineering/dashboard", projectId), {
      cache: "no-store",
    })
      .then((r) => parseApiJsonResponse<DashboardPayload>(r))
      .then((parsed) => {
        if (cancelled) return;
        if (!parsed.ok || !parsed.data) {
          setError(parsed.errorMessage ?? "Failed to load Home");
          setDashboard(null);
          return;
        }
        setDashboard(parsed.data);
        setError(null);
        if (typeof window !== "undefined") {
          console.info(`[eos-ux-1b] home wall_ms=${Math.round(performance.now() - started)}`);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load Home");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const actionsEnabled = capabilities.entitledApplicationKeys.includes("project_controls");
  const attention = dashboard?.attention ?? {};
  const projects = attention.projects ?? dashboard?.activeProjects ?? [];
  const hubProjectId = projectId || (projects[0] ? String(projects[0].id) : "");

  const needsActionCount =
    (dashboard?.openActionsCount ?? 0) + (dashboard?.openTechnicalQueriesCount ?? 0);
  /** Deterministic only — no fabricated change queue when dashboard omits it. */
  const changedCount = 0;
  const reviewCount = dashboard?.reviewRequiredCount ?? 0;
  const decisionCount = dashboard?.pendingDecisionsCount ?? 0;
  const atRiskCount = dashboard?.openRisksCount ?? 0;
  const waitingOthers =
    (dashboard?.openTechnicalQueriesCount ?? 0) + (dashboard?.openIssuesCount ?? 0);

  const attentionCards: AttentionCard[] = useMemo(
    () => [
      {
        id: "needs-action",
        label: "Needs Action",
        count: actionsEnabled ? needsActionCount : needsActionCount,
        href: "/engineering/my?cat=needs-action",
        tone: needsActionCount > 0 ? "urgent" : "neutral",
      },
      {
        id: "changed",
        label: "Changed",
        count: changedCount,
        href: withProjectHref("/engineering/changes", projectId),
        tone: "neutral",
      },
      {
        id: "reviews",
        label: "Reviews Awaiting You",
        count: reviewCount,
        href: "/review?filter=assigned",
        tone: reviewCount > 0 ? "warning" : "neutral",
      },
      {
        id: "decisions",
        label: "Decision Required",
        count: decisionCount,
        href: withProjectHref("/engineering/decisions", projectId),
        tone: decisionCount > 0 ? "warning" : "neutral",
      },
      {
        id: "waiting-others",
        label: "Waiting on Others",
        count: waitingOthers,
        href: "/engineering/my?cat=waiting-for-others",
        tone: "neutral",
      },
      {
        id: "at-risk",
        label: "At Risk",
        count: atRiskCount,
        href: withProjectHref("/engineering/risks", projectId),
        tone: atRiskCount > 0 ? "urgent" : "neutral",
      },
      {
        id: "completed",
        label: "Completed Recently",
        count: 0,
        href: "/engineering/my?cat=recently-completed",
        tone: "complete",
      },
    ],
    [
      actionsEnabled,
      needsActionCount,
      changedCount,
      reviewCount,
      decisionCount,
      waitingOthers,
      atRiskCount,
      projectId,
    ],
  );

  return (
    <>
      <Header
        title="Home"
        description="What needs attention, what changed, and what to do next"
      />
      <main
        className="page-main eos-engineering-work-surface flex-1 overflow-y-auto px-4 pb-8 pt-3 sm:px-6 lg:px-8"
        data-testid="engineering-os-v1-ready"
        data-eos-home="approved-engineering-1b"
        data-eos-light-work-surface="yes"
      >
        <div data-testid="engineering-approved-home" className="space-y-4">
          {error ? <OperationalError message={error} retryHref="/engineering" /> : null}
          {loading ? <OperationalSkeleton label="Loading engineering Home…" /> : null}

          {!loading ? (
            <div
              className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_280px]"
              data-testid="home-three-zone-layout"
            >
              <HomeAttentionColumn cards={attentionCards} />

              <section
                className="rounded-lg border border-slate-200 bg-[#f7fafc] p-4 shadow-sm"
                data-testid="home-hub-zone"
                aria-labelledby="home-hub-heading"
              >
                <div className="mb-2 text-center">
                  <h2
                    id="home-hub-heading"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Engineering Hub
                  </h2>
                  <p className="text-xs text-slate-600">
                    Enter project engineering work from the branches below.
                  </p>
                </div>
                {!hubProjectId ? (
                  <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
                    <p>Select or open a project to activate the Engineering Hub.</p>
                    <Link
                      href="/engineering/projects"
                      className="mt-3 inline-flex min-h-10 items-center rounded-md bg-[color:var(--eos-navy,#0b1f3a)] px-4 text-sm font-medium text-white"
                      data-testid="home-open-projects"
                    >
                      Open Projects
                    </Link>
                    <ul className="sr-only" data-testid="home-hub-branches-pending">
                      {ENGINEERING_HUB_BRANCHES.map((b) => (
                        <li key={b.id}>{b.label}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <EngineeringHubRadial projectId={hubProjectId} />
                )}
              </section>

              <aside
                className="space-y-4"
                data-testid="home-right-column"
                aria-label="Projects and activity"
              >
                <section
                  className="rounded-md border border-slate-200 bg-white p-3 shadow-sm"
                  data-testid="home-my-projects"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      My Projects
                    </h2>
                    <Link
                      href="/engineering/projects"
                      className="text-[11px] text-slate-600 underline-offset-2 hover:underline"
                    >
                      All
                    </Link>
                  </div>
                  {projects.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No engineering projects in this workspace yet.
                    </p>
                  ) : (
                    <ul className="space-y-2" role="list">
                      {projects.slice(0, 6).map((row) => {
                        const id = String(row.id ?? "");
                        return (
                          <li key={id}>
                            <Link
                              href={`/engineering/projects/${id}`}
                              className="block rounded-md border border-slate-200 px-2 py-2 hover:border-[color:var(--eos-gold,#c4a35a)]"
                              data-testid={`home-project-${id}`}
                              onClick={() => persistEngineeringProjectFilter(id)}
                            >
                              <span className="block text-sm font-semibold text-slate-900">
                                {String(row.project_code ?? "")}{" "}
                                {String(row.project_name ?? id)}
                              </span>
                              <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                                <span>{String(row.site ?? row.facility ?? "—")}</span>
                                <StatusChip value={String(row.status ?? "")} />
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section
                  className="rounded-md border border-slate-200 bg-white p-3 shadow-sm"
                  data-testid="home-recent-activity"
                >
                  <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Recent Activity
                  </h2>
                  {projects.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No recent engineering activity in current scope.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100" role="list">
                      {projects.slice(0, 6).map((row) => {
                        const id = String(row.id ?? "");
                        return (
                          <li key={`act-${id}`}>
                            <Link
                              href={`/engineering/projects/${id}`}
                              className="flex min-h-10 flex-col justify-center py-2 text-xs hover:bg-slate-50"
                              data-testid={`home-activity-${id}`}
                              onClick={() => persistEngineeringProjectFilter(id)}
                            >
                              <span className="font-medium text-slate-900">
                                Project workspace active — {String(row.project_code ?? id)}
                              </span>
                              <span className="text-slate-500">
                                {String(row.updated_at ?? row.status ?? "Open project")}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </aside>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
