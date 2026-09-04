"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MetricCard,
  SectionHeader,
  StatusChip,
  TimelineRow,
  ActivityRow,
  EmptyState,
} from "@rtb/ui";
import {
  FolderKanban,
  ClipboardCheck,
  AlertTriangle,
  MessageSquare,
  CheckSquare,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Gavel,
  Clock,
  Sparkles,
  FileText,
  Zap,
} from "lucide-react";
import { useEngineeringProjectFilter } from "@/hooks/use-engineering-project-filter";
import {
  COMMAND_CENTER_USER_ERROR,
  emptyDatasetLoad,
  failedDatasets,
  kpiDisplayValue,
  kpiState,
  loadCommandCenter,
  snapshotHasFailure,
  type CommandCenterSnapshot,
  type DatasetLoad,
} from "@/lib/engineering/load-command-center";

type Trend = "up" | "down" | "flat";

function timelineIcon(eventType?: string) {
  const t = (eventType ?? "").toLowerCase();
  if (t.includes("decision") || t.includes("approv")) return <Gavel className="h-5 w-5" />;
  if (t.includes("risk")) return <AlertTriangle className="h-5 w-5" />;
  if (t.includes("query") || t.includes("tq")) return <MessageSquare className="h-5 w-5" />;
  if (t.includes("action")) return <CheckSquare className="h-5 w-5" />;
  if (t.includes("document")) return <FileText className="h-5 w-5" />;
  return <Clock className="h-5 w-5" />;
}

function activityIcon(activityType?: string) {
  const t = (activityType ?? "").toLowerCase();
  if (t.includes("ai")) return <Sparkles className="h-5 w-5" />;
  if (t.includes("risk")) return <AlertTriangle className="h-5 w-5" />;
  if (t.includes("decision")) return <Gavel className="h-5 w-5" />;
  return <Zap className="h-5 w-5" />;
}

const INITIAL_SNAPSHOT: CommandCenterSnapshot = {
  dashboard: emptyDatasetLoad(),
  timeline: emptyDatasetLoad(),
  activity: emptyDatasetLoad(),
  decisions: emptyDatasetLoad(),
  risks: emptyDatasetLoad(),
};

export default function EngineeringCommandCenterPage() {
  const projectId = useEngineeringProjectFilter();
  const [snapshot, setSnapshot] = useState<CommandCenterSnapshot>(INITIAL_SNAPSHOT);
  const [reloadToken, setReloadToken] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSnapshot(INITIAL_SNAPSHOT);
    setShowDetails(false);
    loadCommandCenter(fetch, projectId)
      .then((next) => {
        if (!cancelled) setSnapshot(next);
      })
      .catch(() => {
        if (cancelled) return;
        setSnapshot({
          dashboard: {
            status: "failed",
            data: null,
            errorCode: "COMMAND_CENTER_DATA_ERROR",
            errorMessage: COMMAND_CENTER_USER_ERROR,
            requestId: null,
          },
          timeline: emptyDatasetLoad("failed"),
          activity: emptyDatasetLoad("failed"),
          decisions: emptyDatasetLoad("failed"),
          risks: emptyDatasetLoad("failed"),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, reloadToken]);

  const data = snapshot.dashboard.data;
  const health = (data?.platformHealth as Record<string, string>) ?? {};
  const healthOk = Object.values(health).every((v) => v === "operational" || !v);
  const aiRuns =
    snapshot.dashboard.status === "loaded"
      ? ((data?.recentAiRuns as Record<string, unknown>[]) ?? []).slice(0, 5)
      : [];
  const failures = failedDatasets(snapshot);
  const hasFailure = snapshotHasFailure(snapshot);
  const projectCount = (data?.activeProjects as unknown[] | undefined)?.length;
  const reviewCount =
    (data?.reviewRequiredCount as number | undefined) ??
    (data?.pendingDecisionsCount as number | undefined);
  const riskCount = data?.openRisksCount as number | undefined;
  const tqCount = data?.openTechnicalQueriesCount as number | undefined;
  const actionCount = data?.openActionsCount as number | undefined;

  return (
    <>
      <Header
        title="Engineering OS"
        description="Product home for projects, assets, certified modules, health, and Engineering AI"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-os-v1-ready"
      >
        <span data-testid="engineering-os-product-ready" className="sr-only">
          Engineering OS product ready
        </span>
        <div data-testid="engineering-command-center" className="contents">
        {hasFailure && (
          <div
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[0.9375rem] text-red-900"
            data-testid="command-center-error"
            role="alert"
          >
            <p>{COMMAND_CENTER_USER_ERROR}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-md bg-red-900 px-3 text-sm font-medium text-white hover:bg-red-800"
                data-testid="command-center-retry"
                onClick={() => setReloadToken((value) => value + 1)}
              >
                Retry
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-md border border-red-300 bg-white px-3 text-sm font-medium text-red-900 hover:bg-red-100"
                data-testid="command-center-show-details"
                onClick={() => setShowDetails((value) => !value)}
              >
                {showDetails ? "Hide details" : "Show details"}
              </button>
            </div>
            {showDetails && (
              <ul className="mt-3 space-y-1 text-sm" data-testid="command-center-error-details">
                {failures.map((item) => (
                  <li key={item.dataset}>
                    {item.label}
                    {item.requestId ? ` · request ${item.requestId}` : ""}
                    {item.errorCode && item.errorCode !== "NON_JSON_RESPONSE" ? ` · ${item.errorCode}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <section aria-label="Module launcher" className="mb-8" data-testid="engineering-module-launcher-summary">
          <SectionHeader
            title="Certified modules"
            description="Entitled Engineering OS V1 modules — federation and live solver execution remain distinct"
          />
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link
              href="/engineering/modules"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            >
              Open module launcher
            </Link>
            <Link
              href="/engineering/apps/project-intelligence"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            >
              Project Intelligence
            </Link>
            <Link
              href="/engineering/apps/inspection-intelligence"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            >
              Inspection Intelligence
            </Link>
            <Link
              href="/engineering/apps/asset-intelligence"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            >
              Asset Intelligence
            </Link>
            <Link
              href="/engineering/apps/project-controls"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            >
              Project Controls
            </Link>
            <Link
              href="/engineering/apps/digital-twin"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            >
              Digital Twin
            </Link>
            <Link
              href="/engineering/apps/model-interoperability"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            >
              Engineering Models
            </Link>
            <Link
              href="/engineering/ai"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            >
              Engineering AI
            </Link>
            <Link
              href="/engineering/search"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            >
              Search
            </Link>
            <Link
              href="/engineering/health"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-800 hover:border-slate-400"
            >
              OS health
            </Link>
          </div>
        </section>

        <section aria-label="Engineering KPIs" className="mb-8">
          <SectionHeader
            title="Engineering KPIs"
            description="Live signal across projects, engineering reviews, risks, and action registers"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 lg:gap-5">
            <KpiLink href="/engineering/projects" testId="command-center-kpi-projects" state={kpiState(snapshot.dashboard, projectCount ?? 0)}>
              <MetricCard
                label="Engineering Projects"
                value={kpiDisplayValue(snapshot.dashboard, projectCount)}
                icon={<FolderKanban className="h-6 w-6" />}
                tone="blue"
                trendLabel="this week"
                trendIcon={<TrendGlyph trend="flat" />}
              />
            </KpiLink>
            <KpiLink href="/engineering/decisions" testId="command-center-kpi-reviews" state={kpiState(snapshot.dashboard, reviewCount ?? 0)}>
              <MetricCard
                label="Engineering Reviews Pending"
                value={kpiDisplayValue(snapshot.dashboard, reviewCount)}
                icon={<ClipboardCheck className="h-6 w-6" />}
                tone="amber"
                trendLabel="today"
                trendIcon={<TrendGlyph trend="up" />}
              />
            </KpiLink>
            <KpiLink href="/engineering/risks" testId="command-center-kpi-risks" state={kpiState(snapshot.dashboard, riskCount ?? 0)}>
              <MetricCard
                label="Critical Risk Assessments"
                value={kpiDisplayValue(snapshot.dashboard, riskCount)}
                icon={<AlertTriangle className="h-6 w-6" />}
                tone="red"
                trendLabel="this week"
                trendIcon={<TrendGlyph trend="down" />}
              />
            </KpiLink>
            <KpiLink href="/engineering/technical-queries" testId="command-center-kpi-tqs" state={kpiState(snapshot.dashboard, tqCount ?? 0)}>
              <MetricCard
                label="Open Technical Queries"
                value={kpiDisplayValue(snapshot.dashboard, tqCount)}
                icon={<MessageSquare className="h-6 w-6" />}
                tone="blue"
                trendLabel="today"
                trendIcon={<TrendGlyph trend="flat" />}
              />
            </KpiLink>
            <KpiLink href="/engineering/actions" testId="command-center-kpi-actions" state={kpiState(snapshot.dashboard, actionCount ?? 0)}>
              <MetricCard
                label="Action Register — Critical"
                value={kpiDisplayValue(snapshot.dashboard, actionCount)}
                icon={<CheckSquare className="h-6 w-6" />}
                tone="amber"
                trendLabel="this week"
                trendIcon={<TrendGlyph trend="up" />}
              />
            </KpiLink>
            <KpiLink href="/engineering/health" testId="command-center-kpi-health" state={snapshot.dashboard.status === "failed" ? "failed" : snapshot.dashboard.status === "loading" ? "loading" : "loaded-value"}>
              <MetricCard
                label="Platform Health"
                value={kpiDisplayValue(snapshot.dashboard, snapshot.dashboard.status === "loaded" ? (healthOk ? "OK" : "Check") : undefined)}
                icon={<Activity className="h-6 w-6" />}
                tone={snapshot.dashboard.status === "failed" ? "red" : healthOk ? "green" : "red"}
                trendLabel="today"
                trendIcon={<TrendGlyph trend="flat" />}
                secondary
              />
            </KpiLink>
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Panel
            title="Engineering Decisions"
            href="/engineering/decisions"
            emptyTitle="No engineering decisions yet"
            emptyDescription="Engineering decisions requiring review will appear here."
            dataset={snapshot.decisions}
            items={snapshot.decisions.data?.slice(0, 5) ?? []}
            render={(d) => (
              <ActivityRow
                title={`${(d.decision_number as string) ?? ""} — ${(d.title as string) ?? ""}`.replace(/^ — /, "")}
                subtitle="Engineering Decision"
                icon={<Gavel className="h-5 w-5" />}
                chip={<StatusChip value={(d.approval_status as string) ?? "pending"} />}
              />
            )}
          />
          <Panel
            title="Risk Assessments"
            href="/engineering/risks"
            emptyTitle="No open risk assessments"
            emptyDescription="Critical and scored engineering risks will appear here."
            dataset={snapshot.risks}
            items={snapshot.risks.data?.slice(0, 5) ?? []}
            render={(r) => {
              const score = Number(r.score ?? 0);
              const severity =
                score >= 15 ? "critical" : score >= 10 ? "high" : score >= 5 ? "medium" : "low";
              return (
                <ActivityRow
                  title={`${(r.risk_number as string) ?? ""} — ${(r.title as string) ?? ""}`.replace(/^ — /, "")}
                  subtitle={`Risk Assessment · score ${String(r.score ?? "—")}`}
                  icon={<AlertTriangle className="h-5 w-5" />}
                  chip={<StatusChip status={severity} />}
                />
              );
            }}
          />
          <Panel
            title="Engineering Timeline"
            href="/engineering/timeline"
            emptyTitle="No timeline events yet"
            emptyDescription="Engineering events across decisions, risks, and technical queries will appear here."
            dataset={snapshot.timeline}
            items={snapshot.timeline.data?.slice(0, 6) ?? []}
            render={(e) => (
              <TimelineRow
                title={(e.title as string) ?? "Timeline event"}
                eventType={(e.event_type as string) ?? undefined}
                occurredAt={(e.occurred_at as string) ?? (e.created_at as string) ?? null}
                icon={timelineIcon(e.event_type as string | undefined)}
                entity={e.linked_entity_label ? String(e.linked_entity_label) : undefined}
              />
            )}
          />
          <Panel
            title="AI Recommendations"
            href="/engineering/ai"
            emptyTitle="No active AI recommendations"
            emptyDescription="Engineering AI Director will surface recommendations from risks, technical queries, documents, and project activity."
            emptyAction={
              <Link
                href="/engineering/ai"
                className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-[0.9375rem] font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                data-testid="ai-empty-cta"
              >
                Open AI Workspace
              </Link>
            }
            emptyIcon={<Sparkles className="h-5 w-5" />}
            dataset={snapshot.dashboard}
            items={aiRuns}
            render={(run) => (
              <ActivityRow
                title={(run.intent as string) ?? (run.status as string) ?? "AI recommendation"}
                subtitle="Engineering AI Director"
                icon={<Sparkles className="h-5 w-5" />}
                chip={
                  <StatusChip
                    value={
                      run.requires_review
                        ? "ai-review-required"
                        : String(run.status ?? "complete")
                    }
                  />
                }
              />
            )}
          />
        </div>

        <section className="mt-8" aria-label="Recent Engineering Activity">
          <Panel
            title="Recent Engineering Activity"
            href="/engineering/activity"
            emptyTitle="No recent activity"
            emptyDescription="Project and register activity will appear here as engineering work progresses."
            dataset={snapshot.activity}
            items={snapshot.activity.data?.slice(0, 6) ?? []}
            render={(e) => (
              <ActivityRow
                title={(e.title as string) ?? "Activity"}
                subtitle={[
                  e.activity_type ? String(e.activity_type) : null,
                  e.created_at
                    ? new Date(String(e.created_at)).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                icon={activityIcon(e.activity_type as string | undefined)}
                chip={
                  e.status ? <StatusChip value={String(e.status)} /> : undefined
                }
              />
            )}
          />
        </section>
        </div>
      </main>
    </>
  );
}

function TrendGlyph({ trend }: { trend: Trend }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  return <Icon className="h-3.5 w-3.5" aria-hidden />;
}

function KpiLink({
  href,
  children,
  testId,
  state,
}: {
  href: string;
  children: React.ReactNode;
  testId: string;
  state: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      data-testid={testId}
      data-state={state}
    >
      {children}
    </Link>
  );
}

function Panel({
  title,
  href,
  emptyTitle,
  emptyDescription,
  emptyAction,
  emptyIcon,
  dataset,
  items,
  render,
}: {
  title: string;
  href: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  dataset: DatasetLoad<unknown>;
  items: Record<string, unknown>[];
  render: (item: Record<string, unknown>) => React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-3">
        <CardTitle className="text-[1.0625rem] font-semibold text-slate-900">{title}</CardTitle>
        <Link
          href={href}
          className="text-[0.8125rem] font-semibold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3.5 p-6 pt-0">
        {dataset.status === "loading" && (
          <p className="text-sm text-slate-500" data-testid="command-center-panel-loading">
            Loading…
          </p>
        )}
        {dataset.status === "failed" && (
          <p className="text-sm text-red-800" data-testid="command-center-panel-failed">
            This dataset could not be loaded.
          </p>
        )}
        {dataset.status === "loaded" && items.length === 0 && (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
            icon={emptyIcon}
          />
        )}
        {dataset.status === "loaded" &&
          items.map((item, i) => (
            <div key={(item.id as string) ?? i}>{render(item)}</div>
          ))}
      </CardContent>
    </Card>
  );
}
