"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CommandPanel,
  EmptyState,
  ProjectHealthIndicator,
  ProjectSelectCommandSurface,
  cn,
  type HealthLevel,
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
import { PiLoadingSkeleton, PiUnavailablePanel } from "./pi-page-chrome";
import { PI_BASE_PATH, PiPageProjectSelect, usePiProjectContext, withPiProjectQuery } from "./pi-project-context";
import { fetchPiJson, PiLoadError, PI_UNAVAILABLE } from "@/lib/project-intelligence/pi-api";
import { usePiJson } from "@/lib/project-intelligence/use-pi-json";
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

const STATE_STYLE: Record<HealthState, string> = {
  green: "eos-state-success",
  amber: "eos-state-warning",
  red: "eos-state-danger",
  unknown: "eos-state-unknown border-dashed",
};

function overallToHealth(value: OverallHealth): HealthLevel {
  if (value === "GREEN") return "HEALTHY";
  if (value === "AMBER") return "ATTENTION";
  if (value === "RED") return "CRITICAL";
  return "UNKNOWN";
}

function attentionSeverity(severity: AttentionItem["severity"]): "CRITICAL" | "HIGH" | "MEDIUM" | "INFO" {
  if (severity === "red") return "CRITICAL";
  if (severity === "amber") return "HIGH";
  return "MEDIUM";
}

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
  const { projectId: selectedId, selectedProject } = usePiProjectContext();
  const resource = usePiJson<CommandCentreView>(
    "overview",
    selectedId
      ? `/api/engineering/project-intelligence/projects/${encodeURIComponent(selectedId)}/command-centre`
      : null,
  );
  const view = resource.data;
  const loading = resource.status === "loading";
  const error = resource.status === "error";
  const [changeWindow, setChangeWindow] = useState<ChangeWindow>(7);
  const [brief, setBrief] = useState<AnalystBriefAnswer | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [briefRequestId, setBriefRequestId] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setBrief(null);
      setBriefError(null);
      setBriefRequestId(null);
      return;
    }
    let cancelled = false;
    setBriefLoading(true);
    setBriefError(null);
    fetchPiJson<AnalystBriefAnswer>(
      `/api/engineering/project-intelligence/projects/${encodeURIComponent(selectedId)}/analyst`,
      "analyst",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: "Summarise the project for the steering meeting." }),
      },
    )
      .then((data) => {
        if (!cancelled) setBrief(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setBrief(null);
          setBriefError(err instanceof PiLoadError ? err.message : PI_UNAVAILABLE.analyst);
          setBriefRequestId(err instanceof PiLoadError ? err.requestId : null);
        }
      })
      .finally(() => {
        if (!cancelled) setBriefLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const healthLevel = view ? overallToHealth(view.overallHealth) : "UNKNOWN";
  const changed = view ? composeWhatChanged(view, changeWindow) : [];

  return (
    <div data-testid="project-intelligence-command-centre" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PiPageProjectSelect testId="command-centre-project-select" />
      </div>

      {!selectedId ? (
        <ProjectSelectCommandSurface testId="command-centre-project-empty" />
      ) : null}

      {loading ? <PiLoadingSkeleton label="Loading project intelligence…" /> : null}
      {error ? (
        <PiUnavailablePanel
          title={PI_UNAVAILABLE.overview}
          dataset="overview"
          requestId={resource.requestId}
          onRetry={() => void resource.reload()}
          testId="command-centre-error"
        />
      ) : null}

      {view ? (
        <>
          <section data-testid="command-centre-project-header">
            <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[color:var(--eos-accent)]">
              Project / status / last evidence
            </p>
            <h2 className="mt-1 text-[2.125rem] font-semibold tracking-tight text-[color:var(--eos-text-primary)]">
              {view.project.projectCode} — {view.project.projectName}
            </h2>
            <p className="mt-2 text-[1rem] text-[color:var(--eos-text-secondary)]">
              Phase {view.project.phase} · {view.project.status}
              {view.generatedAt ? ` · evidence ${view.generatedAt}` : ""}
            </p>
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]">
            <section data-testid="command-centre-overall-health">
              <CommandPanel title="Project health" accent={healthLevel === "CRITICAL" ? "danger" : healthLevel === "ATTENTION" ? "warning" : "success"}>
                <HealthBadge value={view.overallHealth} testId={`overall-health-${view.overallHealth}`} />
                <div className="mt-4">
                  <ProjectHealthIndicator
                    level={healthLevel}
                    domains={view.healthDimensions.map((dimension) => ({
                      label: HEALTH_LABELS[dimension.dimension] ?? dimension.dimension.replace(/_/g, " "),
                      state: dimension.state,
                    }))}
                  />
                </div>
                <p className="mt-3 text-[0.9375rem] text-[color:var(--eos-text-secondary)]">
                  Published evidence only. Unknown is not assumed healthy.
                </p>
              </CommandPanel>
            </section>

            <section data-testid="pi-what-changed">
              <CommandPanel
                title="What changed"
                accent="cyan"
                action={
                  <div className="flex gap-2" data-testid="pi-change-window">
                    {([1, 7, 30] as const).map((days) => (
                      <button
                        key={days}
                        type="button"
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-sm",
                          changeWindow === days
                            ? "border-[color:var(--eos-border-active)] bg-[color:var(--eos-accent-soft)] text-[color:var(--eos-text-primary)]"
                            : "eos-shell-link",
                        )}
                        onClick={() => setChangeWindow(days)}
                      >
                        {days === 1 ? "Today" : `${days} days`}
                      </button>
                    ))}
                  </div>
                }
              >
                {changed.length === 0 ? (
                  <EmptyState
                    title="No material change in this period"
                    description="Published schedule, cost, risk, TQ, decision, or finding deltas were not available for the selected window."
                  />
                ) : (
                  <ul className="space-y-2">
                    {changed.map((item) => (
                      <li key={item.id} className="border-b border-[color:var(--eos-border)] py-2 last:border-0">
                        <p className="font-medium text-[color:var(--eos-text-primary)]">{item.title}</p>
                        <p className="mt-1 text-[0.9375rem] text-[color:var(--eos-text-secondary)]">{item.detail}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href={withPiProjectQuery(`${PI_BASE_PATH}/reports`, view.project.projectId)}
                  className="mt-3 inline-block text-sm font-medium text-[color:var(--eos-accent)] hover:underline"
                  data-testid="pi-view-all-activity"
                >
                  View all activity
                </Link>
              </CommandPanel>
            </section>

            <section data-testid="command-centre-attention">
              <CommandPanel title="Attention required" accent="warning">
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
                          "border-b border-[color:var(--eos-border)] py-2 last:border-0",
                          item.severity === "red"
                            ? "eos-state-danger"
                            : item.severity === "amber"
                              ? "eos-state-warning"
                              : "eos-state-unknown",
                        )}
                      >
                        <p className="text-[0.75rem] font-semibold tracking-[0.1em] text-[color:var(--eos-warning)]">
                          {attentionSeverity(item.severity)}
                        </p>
                        <p className="mt-0.5 font-medium text-[color:var(--eos-text-primary)]">
                          {attentionIssueTitle(item.reasonCode)}
                        </p>
                        <p className="mt-1 text-[0.9375rem] text-[color:var(--eos-text-secondary)]">{item.explanation}</p>
                        <dl className="mt-2 grid gap-1 text-[0.8125rem] text-[color:var(--eos-text-secondary)] sm:grid-cols-2">
                          <div>
                            <dt className="font-medium">Why it matters</dt>
                            <dd>{item.explanation}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Owner</dt>
                            <dd>Not published</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Due / age</dt>
                            <dd>
                              {item.sourceReference.sourceTimestamp
                                ? relativeAge(item.sourceReference.sourceTimestamp)
                                : "Not published"}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium">Potential impact</dt>
                            <dd>Not published — no speculative values.</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Evidence</dt>
                            <dd>1 linked source</dd>
                          </div>
                        </dl>
                        <Link
                          href={sourceOpenHref(item.sourceReference, view.project.projectId)}
                          className="mt-2 inline-block text-[0.8125rem] font-medium text-[color:var(--eos-accent)] hover:underline"
                        >
                          Open source
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CommandPanel>
            </section>
          </div>

          <section data-testid="command-centre-health-dimensions">
            <CommandPanel title="Health by area" meta="Schedule, cost, engineering, risk, change, and decisions from existing evidence.">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {view.healthDimensions.map((dimension) => (
                  <details
                    key={dimension.dimension}
                    data-testid={`health-dimension-${dimension.dimension}`}
                    className={cn("rounded-lg border border-[color:var(--eos-border)] p-4", STATE_STYLE[dimension.state])}
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-2 font-medium">
                      <span>{HEALTH_LABELS[dimension.dimension] ?? dimension.dimension.replace(/_/g, " ")}</span>
                      <HealthBadge
                        value={dimension.state}
                        testId={`health-state-${dimension.dimension}-${dimension.state}`}
                      />
                    </summary>
                    <div className="mt-3 space-y-1 text-[0.8125rem] text-[color:var(--eos-text-secondary)]">
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
            </CommandPanel>
          </section>

          <section data-testid="pi-project-brief">
            <CommandPanel
              title="AI project brief"
              accent="ai"
              meta="Evidence-grounded summary. Advisory only. No autonomous approval."
              action={
                <Link
                  href={withPiProjectQuery(`${PI_BASE_PATH}/analyst`, view.project.projectId)}
                  className="text-[0.9375rem] font-medium text-[color:var(--eos-ai)] hover:underline"
                >
                  Ask Project Intelligence
                </Link>
              }
            >
              {briefLoading ? <PiLoadingSkeleton label="Preparing management brief…" /> : null}
              {briefError ? (
                <PiUnavailablePanel
                  title={PI_UNAVAILABLE.analyst}
                  dataset="analyst"
                  requestId={briefRequestId}
                  testId="pi-project-brief-error"
                />
              ) : null}
              {brief ? (
                <div className="space-y-4">
                  <p
                    className="text-[1.25rem] leading-relaxed text-[color:var(--eos-text-primary)]"
                    data-testid="pi-project-brief-text"
                  >
                    {brief.answer}
                  </p>
                  {brief.claims.some((claim) => claim.kind === "DETERMINISTIC_INTERPRETATION" || claim.kind === "AI_SUMMARY") ? (
                    <div>
                      <p className="text-[0.8125rem] font-semibold tracking-[0.12em] text-[color:var(--eos-text-secondary)]">
                        Why it matters
                      </p>
                      <ul className="mt-2 space-y-1 text-[1rem] text-[color:var(--eos-text-secondary)]">
                        {brief.claims
                          .filter((claim) => claim.kind === "DETERMINISTIC_INTERPRETATION" || claim.kind === "AI_SUMMARY")
                          .map((claim, index) => (
                            <li key={`brief-why-${index}`}>{claim.text}</li>
                          ))}
                      </ul>
                    </div>
                  ) : null}
                  <p className="text-[0.8125rem] font-semibold tracking-[0.12em] text-[color:var(--eos-text-secondary)]">
                    Evidence · {brief.citations.length} linked records
                  </p>
                  {brief.citations.length === 0 ? (
                    <p className="text-[color:var(--eos-text-secondary)]">Evidence is insufficient to cite additional sources.</p>
                  ) : (
                    <ul className="space-y-1 text-[color:var(--eos-text-secondary)]" data-testid="pi-project-brief-citations">
                      {brief.citations.map((cite) => (
                        <li key={`${cite.entityType}:${cite.entityId}`}>{cite.label}</li>
                      ))}
                    </ul>
                  )}
                  {brief.limitations.length ? (
                    <p className="text-[0.8125rem] text-[color:var(--eos-text-secondary)]">
                      Limitations: {brief.limitations.join("; ")}
                    </p>
                  ) : null}
                  <Link
                    href={withPiProjectQuery(`${PI_BASE_PATH}/analyst`, view.project.projectId)}
                    className="eos-shell-link inline-flex"
                  >
                    View evidence
                  </Link>
                </div>
              ) : null}
            </CommandPanel>
          </section>

          <AnalystCommandCentreEntry projectId={view.project.projectId} />

          <div className="grid gap-4 lg:grid-cols-2">
            <RiskCommandCentreCard view={view.riskChangeIntelligence.risk} projectId={view.project.projectId} />
            <DecisionCommandCentreCard
              view={view.queryDecisionIntelligence.decision}
              projectId={view.project.projectId}
            />
            <ScheduleCommandCentreCard view={view.scheduleIntelligence} projectId={view.project.projectId} />
            <CostCommandCentreCard view={view.costProgressIntelligence.cost} projectId={view.project.projectId} />
            <ChangeCommandCentreCard view={view.riskChangeIntelligence.change} projectId={view.project.projectId} />
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
                  <p className="text-sm text-[color:var(--eos-text-secondary)]">
                    {view.costProgressIntelligence.consistency.explanation}
                  </p>
                </CardContent>
              </Card>
            ) : null}
            <SectionCard section={view.quality} testId="command-centre-section-quality" />
            <QueryCommandCentreCard
              view={view.queryDecisionIntelligence.query}
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
            <p className="text-[0.8125rem] text-[color:var(--eos-text-secondary)]" data-testid="command-centre-limitations">
              Limitations: {view.limitations.join(", ")}
            </p>
          ) : null}
        </>
      ) : null}

      {selectedProject && !view && !loading && !error ? (
        <p className="text-sm text-[color:var(--eos-text-secondary)]">No Command Centre payload for this project.</p>
      ) : null}
    </div>
  );
}
