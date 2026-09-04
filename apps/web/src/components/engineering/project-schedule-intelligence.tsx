"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  SectionHeader,
  cn,
} from "@rtb/ui";
import { attentionIssueTitle, evidenceDisplayLabel, sourceSystemLabel } from "./pi-ux";
import { PiPageProjectSelect, usePiProjectContext } from "./pi-project-context";
import { PiLoadingSkeleton, PiUnavailablePanel } from "./pi-page-chrome";
import { PI_UNAVAILABLE } from "@/lib/project-intelligence/pi-api";
import { usePiJson } from "@/lib/project-intelligence/use-pi-json";

type OverallHealth = "GREEN" | "AMBER" | "RED" | "UNKNOWN";
type Availability = "ok" | "no_data" | "unavailable" | "forbidden" | "stale" | "error";
type Freshness = "CURRENT" | "STALE" | "UNKNOWN" | "UNAVAILABLE";

type EvidenceRef = {
  sourceDomain: string;
  entityType: string;
  entityId: string;
  sourceTimestamp?: string;
  sourceVersion?: string;
  storesCanonicalCopy: false;
};

export type ScheduleIntelligenceView = {
  projectId: string;
  availability: Availability;
  health: {
    classification: OverallHealth;
    posture?: string;
    headline: string;
    reasonCodes: string[];
  };
  attentionItems: Array<{
    id: string;
    severity: "red" | "amber" | "info";
    reasonCode: string;
    explanation: string;
    evidenceReference: EvidenceRef;
    asOf?: string;
  }>;
  milestones: Array<{
    milestoneId: string;
    title: string;
    baselineDate?: string;
    currentOrForecastDate?: string;
    publishedStatus?: string;
    publishedVarianceDays?: number;
    criticalityPublished: false;
    evidenceReference: EvidenceRef;
    relatedContext: Array<{ entityType: string; entityId: string; linkKind: string }>;
  }>;
  trend:
    | { available: false; explanation: string }
    | {
        available: true;
        fromPosture?: string;
        toPosture?: string;
        healthChange: string;
        publishedDeltaChangeDays?: number;
        lateMilestoneCountChange?: number;
        explanation: string;
      };
  dataQuality: {
    asOf?: string;
    source: "project_controls";
    freshness: Freshness;
    completeness?: string;
    missing: string[];
    limitations: string[];
  };
  forecast: {
    declaredCurrentDate?: string;
    declaredBaselineDate?: string;
    publishedVarianceDays?: number;
    computedCompletionPublished: false;
    summary: string;
  };
  evidenceReferences: EvidenceRef[];
  generatedAt: string;
};

type ListedProject = {
  id: string;
  project_code: string;
  project_name: string;
};

const HEALTH_STYLE: Record<OverallHealth, string> = {
  GREEN: "border-emerald-300 bg-emerald-50 text-emerald-950",
  AMBER: "border-amber-300 bg-amber-50 text-amber-950",
  RED: "border-red-300 bg-red-50 text-red-950",
  UNKNOWN: "border-dashed border-slate-400 bg-slate-100 text-slate-800",
};

function freshnessTestId(prefix: string, freshness: Freshness, availability: Availability): string | undefined {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return `${prefix}-unavailable`;
  }
  if (availability === "no_data" || freshness === "UNKNOWN") return `${prefix}-unknown`;
  if (freshness === "STALE") return `${prefix}-stale`;
  return undefined;
}

export function ScheduleIntelligenceSummary({
  view,
  compact,
  testIdPrefix,
}: {
  view: ScheduleIntelligenceView;
  compact?: boolean;
  testIdPrefix: string;
}) {
  const unavailable =
    view.availability === "error" ||
    view.availability === "unavailable" ||
    view.availability === "forbidden";
  const unknown = view.availability === "no_data" || view.health.classification === "UNKNOWN";
  const keyMilestones = compact ? view.milestones.slice(0, 3) : view.milestones;
  const attention = compact ? view.attentionItems.slice(0, 4) : view.attentionItems;
  const stateTestId = freshnessTestId(testIdPrefix, view.dataQuality.freshness, view.availability);

  if (unavailable) {
    return (
      <EmptyState
        title="Schedule unavailable"
        description={view.health.headline}
        data-testid={`${testIdPrefix}-unavailable`}
      />
    );
  }

  return (
    <div className="space-y-4" data-testid={stateTestId ?? `${testIdPrefix}-summary`}>
      <div className={cn("rounded-md border px-4 py-3", HEALTH_STYLE[view.health.classification])}>
        <p className="text-xs font-semibold uppercase tracking-wide" data-testid={`${testIdPrefix}-health`}>
          {view.health.classification}
        </p>
        <p className="mt-1 text-sm" data-testid={`${testIdPrefix}-headline`}>
          {view.health.headline}
        </p>
        <p className="mt-1 text-xs opacity-80">
          Freshness: {view.dataQuality.freshness}
          {view.dataQuality.asOf ? ` · as of ${view.dataQuality.asOf}` : ""}
        </p>
      </div>

      {unknown && view.availability === "no_data" ? (
        <EmptyState
          title="Connect or import schedule data to enable Schedule Intelligence."
          description="Schedule Intelligence requires connected or imported schedule data from the system of record. Project Intelligence does not replace Primavera or Microsoft Project."
          data-testid={`${testIdPrefix}-empty`}
        />
      ) : null}

      <div data-testid={`${testIdPrefix}-forecast`}>
        <p className="text-sm text-slate-700">{view.forecast.summary}</p>
      </div>

      <div data-testid={`${testIdPrefix}-milestones`}>
        <p className="text-sm font-medium text-slate-900">Key milestones</p>
        {keyMilestones.length === 0 ? (
          <p className="mt-1 text-sm text-slate-600">No published milestone evidence.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {keyMilestones.map((milestone) => (
              <li key={milestone.milestoneId} data-testid={`${testIdPrefix}-milestone-${milestone.milestoneId}`}>
                <span className="font-medium">{milestone.title}</span>
                {milestone.publishedStatus ? ` · ${milestone.publishedStatus}` : ""}
                {milestone.currentOrForecastDate ? ` · ${milestone.currentOrForecastDate}` : ""}
                {typeof milestone.publishedVarianceDays === "number"
                  ? ` · published delta ${milestone.publishedVarianceDays}d`
                  : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div data-testid={`${testIdPrefix}-attention`}>
        <p className="text-sm font-medium text-slate-900">Needs attention</p>
        {attention.length === 0 ? (
          <p className="mt-1 text-sm text-slate-600">No schedule attention items.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {attention.map((item) => (
              <li
                key={item.id}
                data-testid={`${testIdPrefix}-attention-${item.reasonCode}`}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <p className="font-medium">
                  {item.severity.toUpperCase()} · {attentionIssueTitle(item.reasonCode)}
                </p>
                <p className="text-slate-700">{item.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!compact ? (
        <>
          <div data-testid={`${testIdPrefix}-trend`}>
            <p className="text-sm font-medium text-slate-900">Trend</p>
            <p className="mt-1 text-sm text-slate-700">{view.trend.explanation}</p>
          </div>
          <div data-testid={`${testIdPrefix}-quality`}>
            <p className="text-sm font-medium text-slate-900">Data quality</p>
            <p className="mt-1 text-sm text-slate-700">
              Source {sourceSystemLabel(view.dataQuality.source) ?? "connected schedule system"}
              {view.dataQuality.completeness ? ` · completeness ${view.dataQuality.completeness}` : ""}
            </p>
            {view.dataQuality.missing.length > 0 ? (
              <p className="text-xs text-slate-500">Missing: {view.dataQuality.missing.join(", ")}</p>
            ) : null}
          </div>
          <div data-testid={`${testIdPrefix}-evidence`}>
            <p className="text-sm font-medium text-slate-900">Evidence</p>
            <ul className="mt-1 space-y-1 text-xs text-slate-600">
              {view.evidenceReferences.map((ref) => (
                <li key={`${ref.entityType}:${ref.entityId}`}>
                  {evidenceDisplayLabel(ref)}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {view.dataQuality.limitations.length > 0 ? (
        <p className="text-xs text-slate-500" data-testid={`${testIdPrefix}-limitations`}>
          Limitations: {view.dataQuality.limitations.join(", ")}
        </p>
      ) : null}

      {compact && view.evidenceReferences.length > 0 ? (
        <p className="text-xs text-slate-500" data-testid={`${testIdPrefix}-evidence`}>
          Evidence:{" "}
          {view.evidenceReferences
            .slice(0, 4)
            .map((ref) => evidenceDisplayLabel(ref))
            .join(", ")}
        </p>
      ) : null}
    </div>
  );
}

export function ScheduleCommandCentreCard({
  view,
  projectId,
}: {
  view: ScheduleIntelligenceView;
  projectId: string;
}) {
  return (
    <Card data-testid="command-centre-section-schedule" data-availability={view.availability}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Schedule</CardTitle>
          <Link
            href={`/engineering/apps/project-intelligence/schedule?projectId=${encodeURIComponent(projectId)}`}
            className="text-xs font-medium text-cyan-700 hover:underline"
            data-testid="command-centre-schedule-open"
          >
            Open Schedule Intelligence
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScheduleIntelligenceSummary view={view} compact testIdPrefix="command-centre-schedule" />
      </CardContent>
    </Card>
  );
}

export function ProjectScheduleIntelligenceView() {
  const { projectId: selectedId, selectedProject } = usePiProjectContext();
  const resource = usePiJson<ScheduleIntelligenceView>(
    "schedule",
    selectedId
      ? `/api/engineering/project-intelligence/projects/${encodeURIComponent(selectedId)}/schedule`
      : null,
  );

  return (
    <div data-testid="project-intelligence-schedule" className="space-y-8">
      <PiPageProjectSelect testId="schedule-intelligence-project-select" />

      {!selectedId ? (
        <EmptyState
          title="Select a project"
          description="Schedule Intelligence interprets published Project Controls schedule assessments for one selected project."
          data-testid="schedule-intelligence-project-empty"
        />
      ) : null}

      {resource.status === "loading" ? <PiLoadingSkeleton label="Loading Schedule Intelligence…" /> : null}
      {resource.status === "error" ? (
        <PiUnavailablePanel
          title={PI_UNAVAILABLE.schedule}
          dataset="schedule"
          requestId={resource.requestId}
          onRetry={() => void resource.reload()}
          testId="schedule-intelligence-error"
        />
      ) : null}

      {resource.status === "loaded" && resource.data ? (
        <>
          <SectionHeader
            title="Published schedule interpretation"
            description={`Generated ${resource.data.generatedAt}${selectedProject ? ` · ${selectedProject.project_code}` : ""}`}
          />
          <ScheduleIntelligenceSummary view={resource.data} testIdPrefix="schedule-intelligence" />
        </>
      ) : null}
    </div>
  );
}
