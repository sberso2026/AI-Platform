"use client";

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
      return;
    }
    void loadCentre(selectedId);
  }, [selectedId, loadCentre]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId),
    [projects, selectedId],
  );

  return (
    <div data-testid="project-intelligence-command-centre" className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block max-w-md text-sm text-slate-700">
          Canonical project
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
          title="Select a canonical project"
          description="Command Centre assembles Project Health and published Engineering OS / Project Controls / knowledge evidence for one selected project."
          data-testid="command-centre-project-empty"
        />
      ) : null}

      {loading ? <p className="text-sm text-slate-600">Loading Command Centre…</p> : null}
      {error ? (
        <EmptyState title="Command Centre unavailable" description={error} data-testid="command-centre-error" />
      ) : null}

      {view ? (
        <>
          <section data-testid="command-centre-project-header">
            <SectionHeader
              title={`${view.project.projectCode} — ${view.project.projectName}`}
              description={`Phase ${view.project.phase} · ${view.project.status} · generated ${view.generatedAt}`}
            />
          </section>

          <section data-testid="command-centre-overall-health">
            <Card className={cn("border-2", OVERALL_STYLE[view.overallHealth])}>
              <CardHeader>
                <CardTitle>Overall Project Health</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <HealthBadge value={view.overallHealth} testId={`overall-health-${view.overallHealth}`} />
                <MetricCard
                  label="Classification"
                  value={view.overallHealth}
                  tone={OVERALL_TONE[view.overallHealth]}
                />
                <p className="text-sm text-slate-600">
                  Deterministic GREEN / AMBER / RED / UNKNOWN. No 0–100 score.
                </p>
              </CardContent>
            </Card>
          </section>

          <section data-testid="command-centre-health-dimensions">
            <SectionHeader title="Health Dimensions" description="Inspect reason, evidence, freshness, and limitations." />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {view.healthDimensions.map((dimension) => (
                <details
                  key={dimension.dimension}
                  data-testid={`health-dimension-${dimension.dimension}`}
                  className={cn("rounded-lg border p-4", STATE_STYLE[dimension.state])}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-2 font-medium">
                    <span className="capitalize">{dimension.dimension.replace("_", " ")}</span>
                    <HealthBadge
                      value={dimension.state}
                      testId={`health-state-${dimension.dimension}-${dimension.state}`}
                    />
                  </summary>
                  <div className="mt-3 space-y-1 text-xs text-slate-700">
                    <p>Reason: {dimension.reasonCodes.join(", ") || "none"}</p>
                    <p>
                      Evidence:{" "}
                      {dimension.evidenceReferences.length
                        ? dimension.evidenceReferences.map((ref) => `${ref.entityType}:${ref.entityId}`).join(", ")
                        : "none"}
                    </p>
                    <p>Freshness: {dimension.dataFreshness ?? "unknown"}</p>
                    <p>Limitations: {dimension.limitations.join(", ") || "none"}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section data-testid="command-centre-attention">
            <SectionHeader title="Needs Attention" />
            {view.attentionItems.length === 0 ? (
              <EmptyState title="No attention items" description="No RED/AMBER evidence or useful data gaps." />
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
                      {item.severity.toUpperCase()} · {item.reasonCode}
                    </p>
                    <p className="mt-1 text-slate-700">{item.explanation}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.sourceReference.sourceDomain}:{item.sourceReference.entityType}:
                      {item.sourceReference.entityId}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

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
