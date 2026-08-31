"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button, Input, StatusChip } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import {
  persistEngineeringProjectFilter,
  useEngineeringProjectFilter,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import { buildAskHref } from "@/hooks/use-engineering-context";
import { withProjectHref } from "@/lib/engineering/enterprise-ux";
import { useExperiencePerf } from "@/hooks/use-experience-perf";
import { useEngineeringCapabilities } from "@/hooks/use-engineering-capabilities";
import {
  AskEngineeringAI,
  AttentionSummary,
  OperationalError,
  OperationalMetricCard,
  OperationalPageIntro,
  OperationalSkeleton,
  WorkQueue,
  type OperationalRow,
} from "@/components/engineering/operational";

type DashboardPayload = {
  activeProjects?: OperationalRow[];
  highRiskAssets?: OperationalRow[];
  recentDocuments?: OperationalRow[];
  recentAiRuns?: OperationalRow[];
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
  meta?: { scopeLabel?: string; projectId?: string | null };
};

/**
 * Engineering Command Centre — work-first operational entry.
 * Composes the existing dashboard service only (no extra client N+1).
 */
export default function EngineeringHomePage() {
  useExperiencePerf("home");
  const router = useRouter();
  const projectId = useEngineeringProjectFilter();
  const capabilities = useEngineeringCapabilities();
  const [askDraft, setAskDraft] = useState("");
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
          setError(parsed.errorMessage ?? "Failed to load Command Centre");
          setDashboard(null);
          return;
        }
        setDashboard(parsed.data);
        setError(null);
        if (typeof window !== "undefined") {
          window.setTimeout(() => {
            console.info(
              `[eos-ux-1] command-centre wall_ms=${Math.round(performance.now() - started)}`,
            );
          }, 0);
        }
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load Command Centre"),
      )
      .finally(() => setLoading(false));
  }, [projectId]);

  const askEnabled = capabilities.visiblePrimaryNavIds.includes("eng-ask");
  const documentsEnabled = capabilities.entitledApplicationKeys.includes("documents");
  const assetsEnabled =
    capabilities.entitledApplicationKeys.includes("asset_intelligence") ||
    capabilities.visiblePrimaryNavIds.includes("eng-assets");
  const actionsEnabled = capabilities.entitledApplicationKeys.includes("project_controls");
  const scopeLabel = projectId ? "Selected project" : "All projects (workspace)";
  const attention = dashboard?.attention ?? {};
  const openActions = attention.openActions ?? [];
  const overdueActions = attention.overdueActions ?? [];
  const pendingDecisions = attention.pendingDecisions ?? [];
  const highRisks = attention.highRisks ?? attention.openRisks ?? [];
  const openTqs = attention.openTqs ?? [];
  const projects = attention.projects ?? dashboard?.activeProjects ?? [];
  const documents = dashboard?.recentDocuments ?? [];
  const highRiskAssets = dashboard?.highRiskAssets ?? [];
  const reviews = dashboard?.reviewRequiredCount ?? 0;

  function submitAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!askEnabled) return;
    router.push(
      buildAskHref({
        projectId,
        q: askDraft.trim() || "What needs my attention?",
      }),
    );
  }

  const attentionItems = [
    { id: "reviews", label: "Pending reviews", count: reviews, href: withProjectHref("/engineering/apps/project-intelligence/documents/review", projectId) },
    { id: "risks", label: "Open risks", count: dashboard?.openRisksCount ?? 0, href: withProjectHref("/engineering/risks", projectId) },
    { id: "tqs", label: "Open TQs", count: dashboard?.openTechnicalQueriesCount ?? 0, href: withProjectHref("/engineering/technical-queries", projectId) },
    { id: "actions", label: "Open actions", count: dashboard?.openActionsCount ?? 0, href: withProjectHref("/engineering/actions", projectId) },
    { id: "decisions", label: "Pending decisions", count: dashboard?.pendingDecisionsCount ?? 0, href: withProjectHref("/engineering/decisions", projectId) },
    { id: "overdue", label: "Overdue actions", count: overdueActions.length, href: withProjectHref("/engineering/actions", projectId) },
  ].filter((item) => {
    if (item.id === "actions" || item.id === "overdue") return actionsEnabled;
    return true;
  });

  return (
    <>
      <Header
        title="Command Centre"
        description="What needs attention, what changed, and what to do next"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-os-v1-ready"
      >
        <div data-testid="engineering-os-shell" className="contents">
          <div data-testid="engineering-os-product-ready" className="contents">
            <div data-testid="engineering-command-center" className="contents">
              <div data-testid="engineering-home" className="contents">
          <OperationalPageIntro
            purpose="Exceptions, my work, and recent change — cards open authorized records."
            primaryAction={
              askEnabled ? (
                <AskEngineeringAI projectId={projectId} q="What needs my attention?" />
              ) : null
            }
          />

          {error ? <OperationalError message={error} retryHref="/engineering" /> : null}
          {loading ? <OperationalSkeleton label="Loading Command Centre…" /> : null}

          {askEnabled ? (
          <section className="mb-8" data-testid="home-ask">
            <form onSubmit={submitAsk} className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={askDraft}
                onChange={(e) => setAskDraft(e.target.value)}
                placeholder="Ask Engineering AI…"
                className="text-base sm:flex-1"
                data-testid="home-ask-input"
              />
              <Button type="submit" data-testid="home-ask-submit">
                Ask Engineering AI
              </Button>
            </form>
          </section>
          ) : null}

          {!loading ? (
          <>
          <section className="mb-6" data-testid="home-current-context">
            <p className="text-sm text-slate-700" data-testid="command-center-scope">
              Scope: {scopeLabel}
            </p>
          </section>

          <section className="mb-8" data-testid="home-attention">
            <AttentionSummary items={attentionItems} />
          </section>

          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OperationalMetricCard
              label="Open risks"
              value={dashboard?.openRisksCount ?? 0}
              href={withProjectHref("/engineering/risks", projectId)}
              tone={(dashboard?.openRisksCount ?? 0) > 0 ? "attention" : "neutral"}
              testId="cc-metric-risks"
            />
            <OperationalMetricCard
              label="Open TQs"
              value={dashboard?.openTechnicalQueriesCount ?? 0}
              href={withProjectHref("/engineering/technical-queries", projectId)}
              tone={(dashboard?.openTechnicalQueriesCount ?? 0) > 0 ? "attention" : "neutral"}
              testId="cc-metric-tqs"
            />
            {actionsEnabled ? (
            <OperationalMetricCard
              label="Open actions"
              value={dashboard?.openActionsCount ?? 0}
              href={withProjectHref("/engineering/actions", projectId)}
              testId="cc-metric-actions"
            />
            ) : null}
            <OperationalMetricCard
              label="Pending decisions"
              value={dashboard?.pendingDecisionsCount ?? 0}
              href={withProjectHref("/engineering/decisions", projectId)}
              testId="cc-metric-decisions"
            />
          </section>

          <section className="mb-8 grid gap-4 lg:grid-cols-2" data-testid="home-my-work">
            {actionsEnabled ? (
            <WorkQueue
              title="My work — actions"
              href={withProjectHref("/engineering/actions", projectId)}
              rows={overdueActions.length ? overdueActions : openActions}
              labelKeys={["title", "action_title", "summary"]}
              statusKey="status"
              emptyTitle="No open actions"
              emptyDescription="Nothing is assigned yet. Outstanding actions appear here when recorded for this workspace."
              testId="cc-queue-actions"
            />
            ) : null}
            <WorkQueue
              title="Technical queries"
              href={withProjectHref("/engineering/technical-queries", projectId)}
              rows={openTqs}
              labelKeys={["title", "query_number", "subject", "tq_number"]}
              statusKey="status"
              emptyTitle="No open technical queries"
              emptyDescription="No TQs are open in this scope. That is normal when none have been raised."
              testId="cc-queue-tqs"
            />
            <WorkQueue
              title="Critical / high risks"
              href={withProjectHref("/engineering/risks", projectId)}
              rows={highRisks}
              labelKeys={["title", "risk_title"]}
              statusKey="status"
              emptyTitle="No open risks"
              emptyDescription="No high-severity risks are recorded in this scope."
              testId="cc-queue-risks"
            />
            <WorkQueue
              title="Decisions awaiting attention"
              href={withProjectHref("/engineering/decisions", projectId)}
              rows={pendingDecisions}
              labelKeys={["title", "decision_title"]}
              statusKey="approval_status"
              emptyTitle="No pending decisions"
              emptyDescription="No decisions currently require review."
              testId="cc-queue-decisions"
            />
          </section>

          <section className="mb-8 grid gap-4 lg:grid-cols-2" data-testid="home-recent">
            <WorkQueue
              title="Projects"
              href="/engineering/projects"
              rows={projects}
              labelKeys={["project_name", "project_code"]}
              statusKey="status"
              emptyTitle="No projects yet"
              emptyDescription="No engineering projects exist in this workspace yet. Create a project to start work."
              testId="cc-queue-projects"
              itemHref={(row) => `/engineering/projects/${row.id}`}
            />
            {documentsEnabled ? (
            <WorkQueue
              title="Recent documents"
              href={withProjectHref("/engineering/documents", projectId)}
              rows={documents}
              labelKeys={["title", "document_number"]}
              statusKey="status"
              emptyTitle="No recent documents"
              emptyDescription="No documents are recorded in this scope yet."
              testId="cc-queue-documents"
              itemHref={(row) => `/engineering/documents/${row.id}`}
            />
            ) : null}
            {assetsEnabled ? (
            <WorkQueue
              title="Assets requiring attention"
              href={withProjectHref("/engineering/apps/asset-intelligence", projectId)}
              rows={highRiskAssets}
              labelKeys={["asset_tag", "asset_name"]}
              statusKey="criticality"
              emptyTitle="No high-criticality assets"
              emptyDescription="Assets with recorded high or critical criticality appear here."
              testId="cc-queue-assets"
              itemHref={(row) => `/engineering/assets/${row.id}`}
            />
            ) : null}
          </section>

          {projects.length > 0 ? (
            <section className="mb-8" data-testid="home-project-status">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Project status</h3>
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {projects.slice(0, 6).map((row) => {
                  const id = String(row.id ?? "");
                  return (
                    <li key={id}>
                      <Link
                        href={`/engineering/projects/${id}`}
                        className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-slate-50"
                        onClick={() => persistEngineeringProjectFilter(id)}
                      >
                        <span>
                          {String(row.project_code ?? "")} — {String(row.project_name ?? id)}
                        </span>
                        <StatusChip value={String(row.status ?? "")} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {askEnabled ? (
          <section data-testid="home-suggestions">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Suggested next steps</h3>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "attention", label: "What needs my attention?", q: "What needs my attention?" },
                  { id: "changes", label: "What changed?", q: "What changed recently?" },
                  { id: "risks", label: "Summarise critical risks", q: "Summarize critical engineering risks." },
                  { id: "tqs", label: "Show overdue TQs", q: "Show overdue technical queries." },
                ] as const
              ).map((s) => (
                  <Link
                    key={s.id}
                    href={buildAskHref({ projectId, q: s.q })}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:border-slate-400"
                    data-testid={`home-suggestion-${s.id}`}
                  >
                    {s.label}
                  </Link>
              ))}
            </div>
          </section>
          ) : null}
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
