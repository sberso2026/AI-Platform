"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  MetricCard,
  SectionHeader,
  cn,
} from "@rtb/ui";
import { ScheduleCommandCentreCard, type ScheduleIntelligenceView } from "./project-schedule-intelligence";
import {
  CostCommandCentreCard,
  ProgressCommandCentreCard,
  type CostProgressView,
} from "./project-cost-progress-intelligence";
import {
  ChangeCommandCentreCard,
  RiskCommandCentreCard,
  type RiskChangeView,
} from "./project-risk-change-intelligence";
import {
  ActionCommandCentreCard,
  DecisionCommandCentreCard,
  QueryCommandCentreCard,
  type QueryDecisionView,
} from "./project-query-decision-intelligence";
import { ForecastCommandCentreCard, type ForecastView } from "./project-forecast-intelligence";
import { AnalystCommandCentreEntry } from "./project-ai-analyst";
import { PiLoadingSkeleton } from "./pi-page-chrome";
import { PI_BASE_PATH, withPiProjectQuery } from "./pi-project-context";
import { attentionIssueTitle, freshnessLabel, relativeAge, sourceOpenHref, sourceSystemLabel } from "./pi-ux";

type HealthState = "green" | "amber" | "red" | "unknown";
type OverallHealth = "GREEN" | "AMBER" | "RED" | "UNKNOWN";
type Availability = "ok" | "no_data" | "unavailable" | "forbidden" | "stale" | "error";

type EvidenceRef = {
  sourceDomain: string;
  entityType: string;
  entityId: string;
  sourceTimestamp?: string;
  sourceVersion?: string;
  storesCanonicalCopy: false;
};

type HealthDimension = {
  dimension: string;
  state: HealthState;
  reasonCodes: string[];
  evidenceReferences: EvidenceRef[];
  source: string;
  evaluatedAt: string;
  dataFreshness?: string;
  limitations: string[];
};

type AttentionItem = {
  id: string;
  severity: "red" | "amber" | "info";
  reasonCode: string;
  explanation: string;
  sourceReference: EvidenceRef;
};

type SectionProjection = {
  availability: Availability;
  title: string;
  summary: string;
  posture?: string;
  counts: Record<string, number>;
  evidenceReferences: EvidenceRef[];
  limitations: string[];
  freshness?: string;
};

type CommandCentreView = {
  project: {
    projectId: string;
    tenantId: string;
    workspaceId: string;
    projectCode: string;
    projectName: string;
    phase: string;
    status: string;
  };
  overallHealth: OverallHealth;
  healthDimensions: HealthDimension[];
  attentionItems: AttentionItem[];
  schedule: SectionProjection;
  cost: SectionProjection;
  progress: SectionProjection;
  risk: SectionProjection;
  quality: SectionProjection;
  change: SectionProjection;
  decisionsActions: SectionProjection;
  forecast: SectionProjection;
  knowledge: SectionProjection;
  scheduleIntelligence: ScheduleIntelligenceView;
  costProgressIntelligence: CostProgressView;
  riskChangeIntelligence: RiskChangeView;
  queryDecisionIntelligence: QueryDecisionView;
  forecastIntelligence: ForecastView;
  limitations: string[];
  evidenceReferences: EvidenceRef[];
  generatedAt: string;
};

type ListedProject = {
  id: string;
  project_code: string;
  project_name: string;
  project_phase: string;
  status: string;
  workspace_id?: string;
};

const OVERALL_STYLE: Record<OverallHealth, string> = {
  GREEN: "border-emerald-300 bg-emerald-50 text-emerald-950",
  AMBER: "border-amber-300 bg-amber-50 text-amber-950",
  RED: "border-red-300 bg-red-50 text-red-950",
  UNKNOWN: "border-dashed border-slate-400 bg-slate-100 text-slate-800",
};

const STATE_STYLE: Record<HealthState, string> = {
  green: "border-emerald-300 bg-emerald-50 text-emerald-900",
  amber: "border-amber-300 bg-amber-50 text-amber-900",
  red: "border-red-300 bg-red-50 text-red-900",
  unknown: "border-dashed border-slate-400 bg-slate-100 text-slate-700",
};

const OVERALL_TONE: Record<OverallHealth, "green" | "amber" | "red" | "slate"> = {
  GREEN: "green",
  AMBER: "amber",
  RED: "red",
  UNKNOWN: "slate",
};

const HEALTH_LABELS: Record<string, string> = {
  schedule: "Schedule",
  cost: "Cost",
  progress: "Progress",
  quality: "Engineering",
  risk: "Risk",
  change: "Change",
  decisions_actions: "Decisions",
};

type ChangeWindow = 1 | 7 | 30;

type ChangeItem = {
  id: string;
  title: string;
  detail: string;
  asOf?: string;
};

type AnalystBriefAnswer = {
  answer: string;
  claims: Array<{ kind: string; text: string }>;
  citations: Array<{ label: string; entityType: string; entityId: string; sourceDomain: string }>;
  limitations: string[];
};

function withinWindow(timestamp: string | undefined, generatedAt: string, days: ChangeWindow): boolean {
  const origin = Date.parse(timestamp || generatedAt);
  if (!Number.isFinite(origin)) return true;
  return Date.now() - origin <= days * 86400000;
}

function composeWhatChanged(view: CommandCentreView, days: ChangeWindow): ChangeItem[] {
  const items: ChangeItem[] = [];
  const scheduleTrend = view.scheduleIntelligence.trend;
  if (scheduleTrend.available && withinWindow(view.scheduleIntelligence.dataQuality.asOf, view.generatedAt, days)) {
    items.push({
      id: "schedule-trend",
      title: "Schedule movement",
      detail: scheduleTrend.explanation,
      asOf: view.scheduleIntelligence.dataQuality.asOf,
    });
  }
  if (
    view.cost.availability === "ok" &&
    withinWindow(view.cost.freshness, view.generatedAt, days)
  ) {
    items.push({
      id: "cost-signal",
      title: "Forecast or cost signal",
      detail: view.cost.summary,
      asOf: view.cost.freshness,
    });
  }
  const query = view.queryDecisionIntelligence.query.portfolio;
  if (query.overdueCount > 0) {
    items.push({
      id: "tq-overdue",
      title: "Technical queries overdue",
      detail: `${query.overdueCount} overdue of ${query.openCount} open TQs.`,
    });
  }
  const decisions = view.queryDecisionIntelligence.decision.portfolio;
  if (decisions.recentlyDecidedCount > 0) {
    items.push({
      id: "decisions-recent",
      title: "Decisions closed or opened",
      detail: `${decisions.recentlyDecidedCount} recent decision updates; ${decisions.overdueCount} overdue.`,
    });
  }
  const actions = view.queryDecisionIntelligence.action.portfolio;
  if (actions.overdueCount > 0) {
    items.push({
      id: "actions-overdue",
      title: "New overdue actions",
      detail: `${actions.overdueCount} overdue of ${actions.openCount} open actions.`,
    });
  }
  if (view.risk.availability === "ok") {
    items.push({
      id: "risk-signal",
      title: "Risk register signal",
      detail: view.risk.summary,
      asOf: view.risk.freshness,
    });
  }
  if (view.knowledge.availability === "ok" && (view.knowledge.counts.open ?? 0) > 0) {
    items.push({
      id: "findings-open",
      title: "Open findings",
      detail: view.knowledge.summary,
      asOf: view.knowledge.freshness,
    });
  }
  if (view.forecast.availability === "ok") {
    items.push({
      id: "forecast-signal",
      title: "Forecast movement",
      detail: view.forecast.summary,
      asOf: view.forecast.freshness,
    });
  }
  return items.filter((item) => withinWindow(item.asOf, view.generatedAt, days)).slice(0, 8);
}

function HealthBadge({
  value,
  testId,
}: {
  value: OverallHealth | HealthState;
  testId: string;
}) {
  const label = String(value).toUpperCase();
  const style =
    value === "GREEN" || value === "green"
      ? STATE_STYLE.green
      : value === "AMBER" || value === "amber"
        ? STATE_STYLE.amber
        : value === "RED" || value === "red"
          ? STATE_STYLE.red
          : STATE_STYLE.unknown;
  return (
    <span
      data-testid={testId}
      className={cn("inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold", style)}
    >
      {label}
    </span>
  );
}

function SectionCard({
  section,
  testId,
}: {
  section: SectionProjection;
  testId: string;
}) {
  const unavailable =
    section.availability === "error" ||
    section.availability === "unavailable" ||
    section.availability === "forbidden";
  return (
    <Card data-testid={testId} data-availability={section.availability}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{section.title}</CardTitle>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {section.availability.replace("_", " ")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {unavailable ? (
          <EmptyState
            title={`${section.title} unavailable`}
            description={section.summary}
            data-testid={`${testId}-unavailable`}
          />
        ) : section.availability === "no_data" ? (
          <EmptyState title={section.title} description={section.summary} data-testid={`${testId}-empty`} />
        ) : (
          <div className="space-y-2 text-sm text-slate-700">
            <p>{section.summary}</p>
            {section.posture ? <p>Posture: {section.posture}</p> : null}
            {section.freshness ? <p className="text-xs text-slate-500">Freshness: {section.freshness}</p> : null}
            {section.limitations.length > 0 ? (
              <p className="text-xs text-slate-500">Limitations: {section.limitations.join(", ")}</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectCommandCentre() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("projectId") ?? "";
  const [projects, setProjects] = useState<ListedProject[]>([]);
  const [view, setView] = useState<CommandCentreView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [changeWindow, setChangeWindow] = useState<ChangeWindow>(7);
  const [brief, setBrief] = useState<AnalystBriefAnswer | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/engineering/projects")
      .then(async (response) => {
        const body = (await response.json()) as { data?: ListedProject[]; error?: { message?: string } };
        if (!response.ok) throw new Error(body.error?.message ?? "Unable to list projects");
        if (!cancelled) setProjects(Array.isArray(body.data) ? body.data : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to list projects");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadCentre = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/engineering/project-intelligence/projects/${encodeURIComponent(projectId)}/command-centre`,
      );
      const body = (await response.json()) as { data?: CommandCentreView; error?: { message?: string } };
      if (!response.ok) {
        throw new Error(body.error?.message ?? `Command Centre request failed (${response.status})`);
      }
      setView(body.data ?? null);
    } catch (err) {
      setView(null);
      setError(err instanceof Error ? err.message : "Command Centre unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setView(null);
      setBrief(null);
      return;
    }
    void loadCentre(selectedId);
  }, [selectedId, loadCentre]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setBriefLoading(true);
    setBriefError(null);
    fetch(`/api/engineering/project-intelligence/projects/${encodeURIComponent(selectedId)}/analyst`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: "Summarise the project for the steering meeting." }),
    })
      .then(async (response) => {
        const body = (await response.json()) as { data?: AnalystBriefAnswer; error?: { message?: string } };
        if (!response.ok) throw new Error(body.error?.message ?? "Brief unavailable");
        if (!cancelled) setBrief(body.data ?? null);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setBrief(null);
          setBriefError(err instanceof Error ? err.message : "Brief unavailable");
        }
      })
      .finally(() => {
        if (!cancelled) setBriefLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId),
    [projects, selectedId],
  );

  return (
    <div data-testid="project-intelligence-command-centre" className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block max-w-md text-sm text-slate-700">
          Project
          <select
            data-testid="command-centre-project-select"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            value={selectedId}
            onChange={(event) => {
              const next = event.target.value;
              const params = new URLSearchParams(searchParams.toString());
              if (next) params.set("projectId", next);
              else params.delete("projectId");
              const query = params.toString();
              router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
            }}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_code} — {project.project_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!selectedId ? (
        <EmptyState
          title="Select a project"
          description="Project Intelligence Overview assembles health, attention, change, and evidence-grounded brief for one selected project. All Projects is available only as a portfolio choice."
          data-testid="command-centre-project-empty"
        />
      ) : null}

      {loading ? <PiLoadingSkeleton label="Loading project intelligence…" /> : null}
      {error ? (
        <EmptyState title="Overview unavailable" description={error} data-testid="command-centre-error" />
      ) : null}

      {view ? (
        <>
          <section data-testid="command-centre-project-header">
            <SectionHeader
              title={`${view.project.projectCode} — ${view.project.projectName}`}
              description={`Phase ${view.project.phase} · ${view.project.status}`}
            />
          </section>

          <section data-testid="command-centre-overall-health">
            <Card className={cn("border-2", OVERALL_STYLE[view.overallHealth])}>
              <CardHeader>
                <CardTitle>Project health</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <HealthBadge value={view.overallHealth} testId={`overall-health-${view.overallHealth}`} />
                <MetricCard
                  label="Overall"
                  value={view.overallHealth === "UNKNOWN" ? "Unknown" : view.overallHealth}
                  tone={OVERALL_TONE[view.overallHealth]}
                />
                <p className="text-sm text-slate-600">
                  Green / Amber / Red / Unknown from published evidence only. Unknown is not assumed healthy.
                </p>
              </CardContent>
            </Card>
          </section>

          <section data-testid="command-centre-health-dimensions">
            <SectionHeader
              title="Health by area"
              description="Schedule, cost, engineering, risk, change, and decisions from existing evidence."
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {view.healthDimensions.map((dimension) => (
                <details
                  key={dimension.dimension}
                  data-testid={`health-dimension-${dimension.dimension}`}
                  className={cn("rounded-lg border p-4", STATE_STYLE[dimension.state])}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-2 font-medium">
                    <span>{HEALTH_LABELS[dimension.dimension] ?? dimension.dimension.replace("_", " ")}</span>
                    <HealthBadge
                      value={dimension.state}
                      testId={`health-state-${dimension.dimension}-${dimension.state}`}
                    />
                  </summary>
                  <div className="mt-3 space-y-1 text-xs text-slate-700">
                    <p>
                      {dimension.reasonCodes.length
                        ? dimension.reasonCodes.map(attentionIssueTitle).join("; ")
                        : "No additional published reason."}
                    </p>
                    <p>Evidence count: {dimension.evidenceReferences.length}</p>
                    <p>
                      {freshnessLabel(undefined, dimension.dataFreshness) ??
                        sourceSystemLabel(dimension.source) ??
                        "Source freshness not published."}
                    </p>
                    <p>Limitations: {dimension.limitations.join(", ") || "none stated"}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section data-testid="command-centre-attention">
            <SectionHeader
              title="Attention required"
              description="Exception-first signals. Impact is shown only when published evidence supports it."
            />
            {view.attentionItems.length === 0 ? (
              <EmptyState
                title="No attention items"
                description="No overdue decisions, high risks, or published exceptions for this project."
              />
            ) : (
              <ul className="space-y-2">
                {view.attentionItems.map((item) => (
                  <li
                    key={item.id}
                    data-testid={`attention-item-${item.reasonCode}`}
                    className={cn(
                      "rounded-md border px-4 py-3 text-sm",
                      item.severity === "red"
                        ? "border-red-200 bg-red-50"
                        : item.severity === "amber"
                          ? "border-amber-200 bg-amber-50"
                          : "border-slate-200 bg-slate-50",
                    )}
                  >
                    <p className="font-medium text-slate-900">
                      {item.severity.toUpperCase()} · {attentionIssueTitle(item.reasonCode)}
                    </p>
                    <p className="mt-1 text-slate-700">{item.explanation}</p>
                    <dl className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="font-medium text-slate-700">Why it matters</dt>
                        <dd>{item.explanation}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-700">Owner</dt>
                        <dd>Not published</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-700">Due / age</dt>
                        <dd>
                          {item.sourceReference.sourceTimestamp
                            ? relativeAge(item.sourceReference.sourceTimestamp)
                            : "Not published"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-700">Potential impact</dt>
                        <dd>Not published — no speculative values.</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-700">Evidence</dt>
                        <dd>1 linked source</dd>
                      </div>
                    </dl>
                    <Link
                      href={sourceOpenHref(item.sourceReference, view.project.projectId)}
                      className="mt-2 inline-block text-xs font-medium text-cyan-800 hover:underline"
                    >
                      Open source
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section data-testid="pi-what-changed">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHeader
                title="What changed"
                description="Material published deltas, not a raw activity log."
              />
              <div className="flex gap-2" data-testid="pi-change-window">
                {([1, 7, 30] as const).map((days) => (
                  <button
                    key={days}
                    type="button"
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm",
                      changeWindow === days
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-800",
                    )}
                    onClick={() => setChangeWindow(days)}
                  >
                    {days === 1 ? "Today" : `${days} days`}
                  </button>
                ))}
              </div>
            </div>
            {composeWhatChanged(view, changeWindow).length === 0 ? (
              <EmptyState
                title="No material change in this period"
                description="Published schedule, cost, risk, TQ, decision, or finding deltas were not available for the selected window."
              />
            ) : (
              <ul className="mt-3 space-y-2">
                {composeWhatChanged(view, changeWindow).map((item) => (
                  <li key={item.id} className="rounded-md border border-slate-200 px-4 py-3 text-sm">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-slate-700">{item.detail}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={withPiProjectQuery(`${PI_BASE_PATH}/reports`, view.project.projectId)}
              className="mt-3 inline-block text-sm font-medium text-cyan-800 hover:underline"
              data-testid="pi-view-all-activity"
            >
              View all activity
            </Link>
          </section>

          <section data-testid="pi-project-brief">
            <SectionHeader
              title="AI project brief"
              description="Advisory management summary. Every material claim should be evidence-linked. No autonomous approval."
            />
            {briefLoading ? <PiLoadingSkeleton label="Preparing management brief…" /> : null}
            {briefError ? (
              <EmptyState
                title="Brief limitation"
                description={`${briefError} Evidence is insufficient for a stronger statement.`}
                data-testid="pi-project-brief-error"
              />
            ) : null}
            {brief ? (
              <Card>
                <CardContent className="space-y-3 pt-6 text-sm text-slate-800">
                  <p data-testid="pi-project-brief-text">{brief.answer}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Evidence</p>
                  {brief.citations.length === 0 ? (
                    <p className="text-slate-600">Evidence is insufficient to cite additional sources.</p>
                  ) : (
                    <ul className="space-y-1 text-slate-700" data-testid="pi-project-brief-citations">
                      {brief.citations.map((cite) => (
                        <li key={`${cite.entityType}:${cite.entityId}`}>{cite.label}</li>
                      ))}
                    </ul>
                  )}
                  {brief.limitations.length ? (
                    <p className="text-xs text-slate-500">Limitations: {brief.limitations.join("; ")}</p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </section>

          <AnalystCommandCentreEntry projectId={view.project.projectId} />

          <div className="grid gap-4 lg:grid-cols-2">
            <ScheduleCommandCentreCard view={view.scheduleIntelligence} projectId={view.project.projectId} />
            <CostCommandCentreCard view={view.costProgressIntelligence.cost} projectId={view.project.projectId} />
            <ProgressCommandCentreCard
              view={view.costProgressIntelligence.progress}
              projectId={view.project.projectId}
            />
            {view.costProgressIntelligence.consistency.available ? (
              <Card data-testid="command-centre-cost-progress-consistency">
                <CardHeader className="pb-2">
                  <CardTitle>Cost vs Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{view.costProgressIntelligence.consistency.explanation}</p>
                </CardContent>
              </Card>
            ) : null}
            <RiskCommandCentreCard view={view.riskChangeIntelligence.risk} projectId={view.project.projectId} />
            <SectionCard section={view.quality} testId="command-centre-section-quality" />
            <ChangeCommandCentreCard view={view.riskChangeIntelligence.change} projectId={view.project.projectId} />
            <QueryCommandCentreCard
              view={view.queryDecisionIntelligence.query}
              projectId={view.project.projectId}
            />
            <DecisionCommandCentreCard
              view={view.queryDecisionIntelligence.decision}
              projectId={view.project.projectId}
            />
            <ActionCommandCentreCard
              view={view.queryDecisionIntelligence.action}
              projectId={view.project.projectId}
            />
            <SectionCard section={view.decisionsActions} testId="command-centre-section-decisions-actions" />
            <ForecastCommandCentreCard view={view.forecastIntelligence} projectId={view.project.projectId} />
            <SectionCard section={view.knowledge} testId="command-centre-section-knowledge" />
          </div>

          {view.limitations.length > 0 ? (
            <p className="text-xs text-slate-500" data-testid="command-centre-limitations">
              Limitations: {view.limitations.join(", ")}
            </p>
          ) : null}
        </>
      ) : null}

      {selectedProject && !view && !loading && !error ? (
        <p className="text-sm text-slate-600">No Command Centre payload for this project.</p>
      ) : null}
    </div>
  );
}
