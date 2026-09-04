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
import { evidenceDisplayLabel } from "./pi-ux";
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
  storesCanonicalCopy: false;
};

type AttentionItem = {
  id: string;
  severity: "red" | "amber" | "info";
  reasonCode: string;
  explanation: string;
  evidenceReference: EvidenceRef;
  asOf?: string;
};

type DataQuality = {
  asOf?: string;
  freshness: Freshness;
  missing: string[];
  limitations: string[];
  source: "engineering_core";
};

export type QueryDecisionView = {
  query: {
    availability: Availability;
    health: { classification: OverallHealth; headline: string; reasonCodes: string[] };
    attentionItems: AttentionItem[];
    portfolio: {
      openCount: number;
      overdueCount: number;
      unassignedCount: number;
      highPriorityCount: number;
      staleCount: number;
      resolvedOrClosedCount: number;
      numericalScoreImplemented: false;
    };
    dataQuality: DataQuality;
    evidenceReferences: EvidenceRef[];
    canonicalModel: "engineering_technical_queries";
    rfiModel: "not_first_class_represented_through_technical_queries";
  };
  decision: {
    availability: Availability;
    health: { classification: OverallHealth; headline: string; reasonCodes: string[] };
    attentionItems: AttentionItem[];
    portfolio: {
      openCount: number;
      overdueCount: number;
      unassignedCount: number;
      agingCount: number;
      recentlyDecidedCount: number;
      numericalScoreImplemented: false;
    };
    dataQuality: DataQuality;
    evidenceReferences: EvidenceRef[];
  };
  action: {
    availability: Availability;
    health: { classification: OverallHealth; headline: string; reasonCodes: string[] };
    attentionItems: AttentionItem[];
    portfolio: {
      openCount: number;
      overdueCount: number;
      unassignedCount: number;
      highPriorityCount: number;
      originatingFromRiskCount: number;
      originatingFromQueryCount: number;
      originatingFromDecisionCount: number;
      originatingFromChangeCount: number;
      recentlyCompletedCount: number;
      numericalScoreImplemented: false;
    };
    dataQuality: DataQuality;
    evidenceReferences: EvidenceRef[];
  };
  linkedSignals: Array<{
    id: string;
    reasonCode: string;
    explanation: string;
    fromEvidence: EvidenceRef;
    toEvidence: EvidenceRef;
  }>;
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

function stateTestId(prefix: string, freshness: Freshness, availability: Availability): string {
  if (availability === "error" || availability === "unavailable" || availability === "forbidden") {
    return `${prefix}-unavailable`;
  }
  if (availability === "no_data" || freshness === "UNKNOWN") return `${prefix}-unknown`;
  if (freshness === "STALE") return `${prefix}-stale`;
  return `${prefix}-summary`;
}

function AttentionList({
  items,
  testIdPrefix,
}: {
  items: AttentionItem[];
  testIdPrefix: string;
}) {
  if (items.length === 0) {
    return <p className="mt-1 text-sm text-slate-600">No attention items.</p>;
  }
  return (
    <ul className="mt-2 space-y-2" data-testid={`${testIdPrefix}-attention`}>
      {items.map((item) => (
        <li
          key={item.id}
          data-testid={`${testIdPrefix}-attention-${item.reasonCode}`}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        >
          <p className="font-medium">
            {item.severity.toUpperCase()} · {item.reasonCode}
          </p>
          <p className="text-slate-700">{item.explanation}</p>
        </li>
      ))}
    </ul>
  );
}

function CommandCard({
  title,
  sectionTestId,
  unavailableTestId,
  healthTestId,
  view,
  projectId,
  summary,
}: {
  title: string;
  sectionTestId: string;
  unavailableTestId: string;
  healthTestId: string;
  view: QueryDecisionView["query"] | QueryDecisionView["decision"] | QueryDecisionView["action"];
  projectId: string;
  summary: string;
}) {
  const unavailable =
    view.availability === "error" ||
    view.availability === "unavailable" ||
    view.availability === "forbidden";
  return (
    <Card data-testid={sectionTestId} data-availability={view.availability}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          <Link
            href={`/engineering/apps/project-intelligence/queries-decisions?projectId=${encodeURIComponent(projectId)}`}
            className="text-xs font-medium text-cyan-700 hover:underline"
          >
            Open Queries & Decisions
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {unavailable ? (
          <EmptyState title={`${title} unavailable`} description={view.health.headline} data-testid={unavailableTestId} />
        ) : (
          <div
            className="space-y-3"
            data-testid={stateTestId(
              sectionTestId.replace("command-centre-section-", "command-centre-"),
              view.dataQuality.freshness,
              view.availability,
            )}
          >
            <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.health.classification])}>
              <p className="text-xs font-semibold" data-testid={healthTestId}>
                {view.health.classification}
              </p>
              <p className="text-sm">{view.health.headline}</p>
              <p className="text-xs opacity-80">Freshness: {view.dataQuality.freshness}</p>
            </div>
            <p className="text-sm text-slate-700">{summary}</p>
            <AttentionList items={view.attentionItems.slice(0, 4)} testIdPrefix={sectionTestId.replace("-section", "")} />
            {view.dataQuality.limitations.length > 0 ? (
              <p className="text-xs text-slate-500">Limitations: {view.dataQuality.limitations.join(", ")}</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function QueryCommandCentreCard({
  view,
  projectId,
}: {
  view: QueryDecisionView["query"];
  projectId: string;
}) {
  return (
    <CommandCard
      title="Queries / RFIs"
      sectionTestId="command-centre-section-queries"
      unavailableTestId="command-centre-queries-unavailable"
      healthTestId="command-centre-queries-health"
      view={view}
      projectId={projectId}
      summary={`Open ${view.portfolio.openCount} · overdue ${view.portfolio.overdueCount} · high priority ${view.portfolio.highPriorityCount} · unassigned ${view.portfolio.unassignedCount}`}
    />
  );
}

export function DecisionCommandCentreCard({
  view,
  projectId,
}: {
  view: QueryDecisionView["decision"];
  projectId: string;
}) {
  return (
    <CommandCard
      title="Decisions"
      sectionTestId="command-centre-section-decisions"
      unavailableTestId="command-centre-decisions-unavailable"
      healthTestId="command-centre-decisions-health"
      view={view}
      projectId={projectId}
      summary={`Open ${view.portfolio.openCount} · overdue ${view.portfolio.overdueCount} · aging ${view.portfolio.agingCount} · unassigned ${view.portfolio.unassignedCount}`}
    />
  );
}

export function ActionCommandCentreCard({
  view,
  projectId,
}: {
  view: QueryDecisionView["action"];
  projectId: string;
}) {
  return (
    <CommandCard
      title="Actions"
      sectionTestId="command-centre-section-actions"
      unavailableTestId="command-centre-actions-unavailable"
      healthTestId="command-centre-actions-health"
      view={view}
      projectId={projectId}
      summary={`Open ${view.portfolio.openCount} · overdue ${view.portfolio.overdueCount} · unowned ${view.portfolio.unassignedCount} · high priority ${view.portfolio.highPriorityCount}`}
    />
  );
}

export function ProjectQueryDecisionIntelligenceView() {
  const { projectId: selectedId, selectedProject } = usePiProjectContext();
  const resource = usePiJson<QueryDecisionView>(
    "decisions",
    selectedId
      ? `/api/engineering/project-intelligence/projects/${encodeURIComponent(selectedId)}/queries-decisions`
      : null,
  );
  const view = resource.data;
  const loading = resource.status === "loading";
  const error = resource.status === "error";

  return (
    <div data-testid="project-intelligence-queries-decisions" className="space-y-8">
      <PiPageProjectSelect testId="queries-decisions-project-select" />

      {!selectedId ? (
        <EmptyState
          title="Select a project"
          description="Query & Decision Intelligence interprets canonical Engineering OS technical queries, decisions, and actions. RFIs are not a separate register."
          data-testid="queries-decisions-project-empty"
        />
      ) : null}

      {loading ? <PiLoadingSkeleton label="Loading Query & Decision Intelligence…" /> : null}
      {error ? (
        <PiUnavailablePanel
          title={PI_UNAVAILABLE.decisions}
          dataset="decisions"
          requestId={resource.requestId}
          onRetry={() => void resource.reload()}
          testId="queries-decisions-error"
        />
      ) : null}

      {view ? (
        <>
          <SectionHeader
            title="Query, decision, and action interpretation"
            description={`Generated ${view.generatedAt}${selectedProject ? ` · ${selectedProject.project_code}` : ""}`}
          />
          <Card data-testid="queries-decisions-rfi-model">
            <CardHeader>
              <CardTitle>Technical Queries / RFIs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                data-testid={stateTestId("queries-decisions-query", view.query.dataQuality.freshness, view.query.availability)}
              >
                <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.query.health.classification])}>
                  <p className="text-xs font-semibold">{view.query.health.classification}</p>
                  <p className="text-sm">{view.query.health.headline}</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  Open {view.query.portfolio.openCount} · overdue {view.query.portfolio.overdueCount} · high priority{" "}
                  {view.query.portfolio.highPriorityCount} · unassigned {view.query.portfolio.unassignedCount} · stale{" "}
                  {view.query.portfolio.staleCount}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Canonical TQ model: {view.query.canonicalModel}. RFI model: {view.query.rfiModel}. RFIs are not a
                  first-class Engineering OS register.
                </p>
              </div>
            </CardContent>
          </Card>
          <div data-testid="queries-decisions-query-attention">
            <SectionHeader title="Query attention" />
            <AttentionList items={view.query.attentionItems} testIdPrefix="queries-decisions-query" />
          </div>
          <Card data-testid="queries-decisions-decision-summary">
            <CardHeader>
              <CardTitle>Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                data-testid={stateTestId(
                  "queries-decisions-decision",
                  view.decision.dataQuality.freshness,
                  view.decision.availability,
                )}
              >
                <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.decision.health.classification])}>
                  <p className="text-xs font-semibold">{view.decision.health.classification}</p>
                  <p className="text-sm">{view.decision.health.headline}</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  Open {view.decision.portfolio.openCount} · overdue {view.decision.portfolio.overdueCount} · unassigned{" "}
                  {view.decision.portfolio.unassignedCount} · aging {view.decision.portfolio.agingCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <div data-testid="queries-decisions-decision-attention">
            <SectionHeader title="Decision attention" />
            <AttentionList items={view.decision.attentionItems} testIdPrefix="queries-decisions-decision" />
          </div>
          <Card data-testid="queries-decisions-action-summary">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                data-testid={stateTestId(
                  "queries-decisions-action",
                  view.action.dataQuality.freshness,
                  view.action.availability,
                )}
              >
                <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.action.health.classification])}>
                  <p className="text-xs font-semibold">{view.action.health.classification}</p>
                  <p className="text-sm">{view.action.health.headline}</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  Open {view.action.portfolio.openCount} · overdue {view.action.portfolio.overdueCount} · unowned{" "}
                  {view.action.portfolio.unassignedCount} · high priority {view.action.portfolio.highPriorityCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <div data-testid="queries-decisions-action-attention">
            <SectionHeader title="Action attention" />
            <AttentionList items={view.action.attentionItems} testIdPrefix="queries-decisions-action" />
          </div>
          <Card data-testid="queries-decisions-linked-signals">
            <CardHeader>
              <CardTitle>Explicit linked signals</CardTitle>
            </CardHeader>
            <CardContent>
              {view.linkedSignals.length === 0 ? (
                <p className="text-sm text-slate-600">No explicit originating-object links.</p>
              ) : (
                <ul className="space-y-2">
                  {view.linkedSignals.map((signal) => (
                    <li
                      key={signal.id}
                      data-testid={`queries-decisions-linked-${signal.reasonCode}`}
                      className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                    >
                      <p className="font-medium">{signal.reasonCode}</p>
                      <p className="text-slate-700">{signal.explanation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card data-testid="queries-decisions-quality">
            <CardHeader>
              <CardTitle>Data quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>
                Query freshness {view.query.dataQuality.freshness}
                {view.query.dataQuality.asOf ? ` · as of ${view.query.dataQuality.asOf}` : ""}
              </p>
              <p>
                Decision freshness {view.decision.dataQuality.freshness}
                {view.decision.dataQuality.asOf ? ` · as of ${view.decision.dataQuality.asOf}` : ""}
              </p>
              <p>
                Action freshness {view.action.dataQuality.freshness}
                {view.action.dataQuality.asOf ? ` · as of ${view.action.dataQuality.asOf}` : ""}
              </p>
            </CardContent>
          </Card>
          <Card data-testid="queries-decisions-evidence">
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs text-slate-600">
                {[...view.query.evidenceReferences, ...view.decision.evidenceReferences, ...view.action.evidenceReferences].map(
                  (ref) => (
                    <li
                      key={`${ref.entityType}:${ref.entityId}`}
                      data-testid={`queries-decisions-evidence-${ref.entityId}`}
                    >
                      {evidenceDisplayLabel(ref)}
                    </li>
                  ),
                )}
              </ul>
            </CardContent>
          </Card>
          <p className="text-xs text-slate-500" data-testid="queries-decisions-limitations">
            Limitations:{" "}
            {[
              ...view.query.dataQuality.limitations,
              ...view.decision.dataQuality.limitations,
              ...view.action.dataQuality.limitations,
            ].join(", ")}
          </p>
        </>
      ) : null}
    </div>
  );
}
