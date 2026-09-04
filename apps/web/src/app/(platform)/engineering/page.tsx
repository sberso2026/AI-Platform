"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { EosAiCore } from "@/components/layout/eos-ai-core";
import {
  ActivityRow,
  AttentionQueue,
  CommandPageTitle,
  CommandPanel,
  EmptyState,
  LiveSignal,
  ProjectHealthIndicator,
  StatusChip,
  TimelineRow,
  type HealthLevel,
} from "@rtb/ui";
import {
  AlertTriangle,
  CheckSquare,
  Clock,
  FileText,
  Gavel,
  MessageSquare,
  Sparkles,
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

  const healthLevel: HealthLevel =
    snapshot.dashboard.status === "loading"
      ? "UNKNOWN"
      : snapshot.dashboard.status === "failed"
        ? "CRITICAL"
        : healthOk
          ? "HEALTHY"
          : "ATTENTION";

  const attentionItems = useMemo(() => {
    const items: Array<{
      id: string;
      severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
      title: string;
      due?: string;
      testId?: string;
    }> = [];
    if (hasFailure) {
      for (const item of failures) {
        items.push({
          id: `fail-${item.dataset}`,
          severity: "CRITICAL",
          title: `${item.label} unavailable`,
        });
      }
    }
    if (snapshot.dashboard.status === "loaded" && !healthOk) {
      items.push({
        id: "health-review",
        severity: "HIGH",
        title: "Platform health requires review",
      });
    }
    if (snapshot.risks.status === "loaded") {
      for (const risk of (snapshot.risks.data ?? []).slice(0, 4)) {
        const score = Number(risk.score ?? 0);
        const severity: "CRITICAL" | "HIGH" | "MEDIUM" =
          score >= 15 ? "CRITICAL" : score >= 10 ? "HIGH" : "MEDIUM";
        items.push({
          id: String(risk.id ?? risk.risk_number ?? items.length),
          severity,
          title: `${(risk.risk_number as string) ?? ""} ${(risk.title as string) ?? "Risk"}`.trim(),
        });
      }
    }
    if (snapshot.decisions.status === "loaded") {
      for (const decision of (snapshot.decisions.data ?? []).slice(0, 3)) {
        items.push({
          id: String(decision.id ?? decision.decision_number ?? items.length),
          severity: "MEDIUM",
          title: `${(decision.decision_number as string) ?? ""} ${(decision.title as string) ?? "Decision"}`.trim(),
        });
      }
    }
    return items.slice(0, 7);
  }, [failures, hasFailure, healthOk, snapshot.dashboard.status, snapshot.decisions, snapshot.risks]);

  return (
    <>
      <Header
        title="Engineering Command Center"
        description="Workspace, project, and intelligence status"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-os-v1-ready"
      >
        <span data-testid="engineering-os-product-ready" className="sr-only">
          Engineering OS product ready
        </span>
        <div data-testid="engineering-command-center" className="eos-command-canvas space-y-5">
          <CommandPageTitle
            eyebrow="Engineering OS"
            title="Engineering Command Center"
            description="Live operational surface for published engineering health, attention, and change. Missing data is unavailable, not zero."
          />

        {hasFailure && (
          <div
            className="eos-state-danger mb-1 rounded-xl border px-4 py-3 text-[1rem]"
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

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)_minmax(18rem,1fr)]">
          <CommandPanel title="Project health" accent="success" testId="command-center-health">
            <ProjectHealthIndicator
              level={healthLevel}
              domains={Object.keys(health).slice(0, 5).map((key) => ({
                label: key.replace(/_/g, " "),
                state: health[key] === "operational" ? "green" : "unknown",
              }))}
            />
          </CommandPanel>
          <CommandPanel title="Engineering Intelligence Core" accent="ai">
            <EosAiCore
              size="lg"
              status={snapshot.dashboard.status === "failed" ? "degraded" : "online"}
              projectLabel={projectId || undefined}
              evidenceAvailable={snapshot.dashboard.status === "loaded"}
              systemHealthy={snapshot.dashboard.status === "loaded" ? healthOk : undefined}
            />
          </CommandPanel>
          <CommandPanel title="Attention required" accent="warning" testId="command-center-attention">
            {snapshot.dashboard.status === "loading" ? (
              <div className="eos-shimmer h-16 rounded-xl" data-testid="command-center-attention-loading" />
            ) : (
              <AttentionQueue
                items={attentionItems}
                emptyTitle="No attention items"
                emptyDescription="No published exceptions for the current workspace or project filter."
                viewAllHref="/engineering/risks"
              />
            )}
          </CommandPanel>
        </div>

        <CommandPanel title="Live engineering signals" meta="Published register counts only. Trends shown only when historical comparison exists.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link href="/engineering/technical-queries" className="block">
              <LiveSignal
                label="Open TQs"
                value={kpiDisplayValue(snapshot.dashboard, tqCount)}
                testId="command-center-kpi-tqs"
                state={kpiState(snapshot.dashboard, tqCount ?? 0)}
              />
            </Link>
            <Link href="/engineering/risks" className="block">
              <LiveSignal
                label="Critical risks"
                value={kpiDisplayValue(snapshot.dashboard, riskCount)}
                testId="command-center-kpi-risks"
                state={kpiState(snapshot.dashboard, riskCount ?? 0)}
              />
            </Link>
            <Link href="/engineering/actions" className="block">
              <LiveSignal
                label="Actions"
                value={kpiDisplayValue(snapshot.dashboard, actionCount)}
                testId="command-center-kpi-actions"
                state={kpiState(snapshot.dashboard, actionCount ?? 0)}
              />
            </Link>
            <Link href="/engineering/decisions" className="block">
              <LiveSignal
                label="Reviews"
                value={kpiDisplayValue(snapshot.dashboard, reviewCount)}
                testId="command-center-kpi-reviews"
                state={kpiState(snapshot.dashboard, reviewCount ?? 0)}
              />
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link href="/engineering/projects" className="block">
              <LiveSignal
                label="Projects"
                value={kpiDisplayValue(snapshot.dashboard, projectCount)}
                testId="command-center-kpi-projects"
                state={kpiState(snapshot.dashboard, projectCount ?? 0)}
              />
            </Link>
            <Link href="/engineering/health" className="block">
              <LiveSignal
                label="Platform health"
                value={kpiDisplayValue(
                  snapshot.dashboard,
                  snapshot.dashboard.status === "loaded" ? (healthOk ? "OK" : "Check") : undefined,
                )}
                testId="command-center-kpi-health"
                state={
                  snapshot.dashboard.status === "failed"
                    ? "failed"
                    : snapshot.dashboard.status === "loading"
                      ? "loading"
                      : "loaded-value"
                }
              />
            </Link>
          </div>
        </CommandPanel>

        <section aria-label="Module launcher" data-testid="engineering-module-launcher-summary">
          <CommandPanel title="Engineering systems" meta="Open certified modules without leaving command context" accent="cyan">
            <div className="flex flex-wrap gap-2 text-[0.9375rem]">
              {[
                ["/engineering/modules", "Systems matrix"],
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
          </CommandPanel>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            title="Recent decisions"
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
            title="Risk assessments"
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
            title="Engineering timeline"
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
            title="Intelligence activity"
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

        <section aria-label="Recent Engineering Activity">
          <Panel
            title="Recent engineering activity"
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
    <CommandPanel
      title={title}
      accent="cyan"
      action={
        <Link
          href={href}
          className="text-[0.8125rem] font-semibold text-[color:var(--eos-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--eos-accent)]"
        >
          View all
        </Link>
      }
    >
      <div className="space-y-3.5">
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
      </div>
    </CommandPanel>
  );
}
