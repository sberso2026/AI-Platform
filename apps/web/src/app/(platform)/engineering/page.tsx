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
import { EosAiCore } from "@/components/layout/eos-ai-core";
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
            className="eos-state-danger mb-4 rounded-xl border px-4 py-3 text-[1rem]"
            data-testid="command-center-error"
            role="alert"
          >
            <p>{COMMAND_CENTER_USER_ERROR}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex h-11 items-center rounded-md bg-[color:var(--eos-danger)] px-3 text-sm font-medium text-[color:var(--eos-bg-primary)] hover:opacity-90"
                data-testid="command-center-retry"
                onClick={() => setReloadToken((value) => value + 1)}
              >
                Retry
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center rounded-md border border-[color:var(--eos-border)] bg-[color:var(--eos-panel)] px-3 text-sm font-medium text-[color:var(--eos-text-primary)] hover:border-[color:var(--eos-border-active)]"
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

        <section aria-label="Platform and project health" className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]" data-testid="command-center-health">
          <Card variant="health">
            <CardHeader className="pb-2">
              <CardTitle>Platform / project health</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <StatusChip
                status={snapshot.dashboard.status === "failed" ? "critical" : healthOk ? "complete" : "pending"}
                value={snapshot.dashboard.status === "loading" ? "pending" : healthOk ? "operational" : "check"}
              />
              <p className="text-[1rem] text-[color:var(--eos-text-secondary)]">
                {snapshot.dashboard.status === "loading"
                  ? "Loading platform health…"
                  : snapshot.dashboard.status === "failed"
                    ? "Platform health unavailable"
                    : healthOk
                      ? "System Healthy"
                      : "Platform health requires review"}
              </p>
            </CardContent>
          </Card>
          <Card variant="ai">
            <CardContent className="flex h-full items-center p-6">
              <EosAiCore
                status={snapshot.dashboard.status === "failed" ? "degraded" : "online"}
                projectLabel={projectId ? "Active project context" : "Workspace context"}
              />
            </CardContent>
          </Card>
        </section>

        <section aria-label="Attention required" className="mb-6" data-testid="command-center-attention">
          <SectionHeader
            title="Attention required"
            description="Published exceptions only. Missing data is shown as unavailable, not as zero."
          />
          {snapshot.dashboard.status === "loading" ? (
            <div className="eos-shimmer h-16 rounded-xl" data-testid="command-center-attention-loading" />
          ) : hasFailure ? (
            <Card variant="alert">
              <CardContent className="space-y-2 pt-6 text-[1rem]">
                {failures.map((item) => (
                  <p key={item.dataset}>
                    {item.label} unavailable. Some signals could not be loaded.
                  </p>
                ))}
              </CardContent>
            </Card>
          ) : !healthOk ? (
            <Card variant="alert">
              <CardContent className="pt-6 text-[1rem]">Platform health requires review from published signals.</CardContent>
            </Card>
          ) : (
            <EmptyState
              title="No attention items"
              description="No unpublished exceptions were returned for the current workspace or project filter."
            />
          )}
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

        <section aria-label="Module launcher" className="mb-8" data-testid="engineering-module-launcher-summary">
          <SectionHeader
            title="Certified modules"
            description="Entitled Engineering OS V1 modules — federation and live solver execution remain distinct"
          />
          <div className="mt-3 flex flex-wrap gap-3 text-[0.9375rem]">
            {[
              ["/engineering/modules", "Open module launcher"],
              ["/engineering/apps/project-intelligence", "Project Intelligence"],
              ["/engineering/apps/inspection-intelligence", "Inspection Intelligence"],
              ["/engineering/apps/asset-intelligence", "Asset Intelligence"],
              ["/engineering/apps/project-controls", "Project Controls"],
              ["/engineering/apps/digital-twin", "Digital Twin"],
              ["/engineering/apps/model-interoperability", "Engineering Models"],
              ["/engineering/ai", "Engineering AI"],
              ["/engineering/search", "Search"],
              ["/engineering/health", "OS health"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="eos-shell-link">
                {label}
              </Link>
            ))}
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
      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--eos-accent)]"
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
    <Card variant="intelligence">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-3">
        <CardTitle>{title}</CardTitle>
        <Link
          href={href}
          className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--eos-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--eos-accent)]"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3.5 p-6 pt-0">
        {dataset.status === "loading" && (
          <p className="text-sm text-[color:var(--eos-text-secondary)]" data-testid="command-center-panel-loading">
            Loading…
          </p>
        )}
        {dataset.status === "failed" && (
          <p className="text-sm text-[color:var(--eos-danger)]" data-testid="command-center-panel-failed">
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
