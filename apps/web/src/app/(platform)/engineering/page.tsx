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

export default function EngineeringCommandCenterPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [timeline, setTimeline] = useState<Record<string, unknown>[]>([]);
  const [activity, setActivity] = useState<Record<string, unknown>[]>([]);
  const [decisions, setDecisions] = useState<Record<string, unknown>[]>([]);
  const [risks, setRisks] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/engineering/dashboard").then((r) => r.json()),
      fetch("/api/engineering/timeline").then((r) => r.json()),
      fetch("/api/engineering/activity").then((r) => r.json()),
      fetch("/api/engineering/decisions").then((r) => r.json()),
      fetch("/api/engineering/risks").then((r) => r.json()),
    ])
      .then(([dash, tl, act, dec, rsk]) => {
        if (dash.error) setError(String(dash.error));
        else setData(dash.data);
        setTimeline(Array.isArray(tl.data) ? tl.data.slice(0, 6) : []);
        setActivity(Array.isArray(act.data) ? act.data.slice(0, 6) : []);
        setDecisions(Array.isArray(dec.data) ? dec.data.slice(0, 5) : []);
        setRisks(Array.isArray(rsk.data) ? rsk.data.slice(0, 5) : []);
      })
      .catch((e) => setError(e.message));
  }, []);

  const health = (data?.platformHealth as Record<string, string>) ?? {};
  const healthOk = Object.values(health).every((v) => v === "operational" || !v);
  const aiRuns = ((data?.recentAiRuns as Record<string, unknown>[]) ?? []).slice(0, 5);

  return (
    <>
      <Header
        title="Engineering Command Center"
        description="Operations overview for engineering projects, decisions, risks, and technical queries"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-command-center"
      >
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}

        <section aria-label="Engineering KPIs" className="mb-8">
          <SectionHeader
            title="Engineering KPIs"
            description="Live signal across projects, engineering reviews, risks, and action registers"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 lg:gap-5">
            <KpiLink href="/engineering/projects">
              <MetricCard
                label="Engineering Projects"
                value={(data?.activeProjects as unknown[])?.length ?? 0}
                icon={<FolderKanban className="h-6 w-6" />}
                tone="blue"
                trendLabel="this week"
                trendIcon={<TrendGlyph trend="flat" />}
              />
            </KpiLink>
            <KpiLink href="/engineering/decisions">
              <MetricCard
                label="Engineering Reviews Pending"
                value={
                  (data?.reviewRequiredCount as number) ??
                  (data?.pendingDecisionsCount as number) ??
                  0
                }
                icon={<ClipboardCheck className="h-6 w-6" />}
                tone="amber"
                trendLabel="today"
                trendIcon={<TrendGlyph trend="up" />}
              />
            </KpiLink>
            <KpiLink href="/engineering/risks">
              <MetricCard
                label="Critical Risk Assessments"
                value={(data?.openRisksCount as number) ?? 0}
                icon={<AlertTriangle className="h-6 w-6" />}
                tone="red"
                trendLabel="this week"
                trendIcon={<TrendGlyph trend="down" />}
              />
            </KpiLink>
            <KpiLink href="/engineering/technical-queries">
              <MetricCard
                label="Open Technical Queries"
                value={(data?.openTechnicalQueriesCount as number) ?? 0}
                icon={<MessageSquare className="h-6 w-6" />}
                tone="blue"
                trendLabel="today"
                trendIcon={<TrendGlyph trend="flat" />}
              />
            </KpiLink>
            <KpiLink href="/engineering/actions">
              <MetricCard
                label="Action Register — Critical"
                value={(data?.openActionsCount as number) ?? 0}
                icon={<CheckSquare className="h-6 w-6" />}
                tone="amber"
                trendLabel="this week"
                trendIcon={<TrendGlyph trend="up" />}
              />
            </KpiLink>
            <KpiLink href="/engineering/health">
              <MetricCard
                label="Platform Health"
                value={healthOk ? "OK" : "Check"}
                icon={<Activity className="h-6 w-6" />}
                tone={healthOk ? "green" : "red"}
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
            items={decisions}
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
            items={risks}
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
            items={timeline}
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
            items={activity}
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
      </main>
    </>
  );
}

function TrendGlyph({ trend }: { trend: Trend }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  return <Icon className="h-3.5 w-3.5" aria-hidden />;
}

function KpiLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
  items,
  render,
}: {
  title: string;
  href: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
  emptyIcon?: React.ReactNode;
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
        {items.length === 0 && (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
            icon={emptyIcon}
          />
        )}
        {items.map((item, i) => (
          <div key={(item.id as string) ?? i}>{render(item)}</div>
        ))}
      </CardContent>
    </Card>
  );
}
