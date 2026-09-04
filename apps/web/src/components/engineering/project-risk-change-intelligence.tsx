"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CommandPanel,
  EmptyState,
  ProjectSelectCommandSurface,
  SectionHeader,
  SeverityDistribution,
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
  canonicalRiskId?: string;
  asOf?: string;
};

type DataQuality = {
  asOf?: string;
  publishedAt?: string;
  freshness: Freshness;
  missing: string[];
  limitations: string[];
};

export type RiskChangeView = {
  risk: {
    availability: Availability;
    health: { classification: OverallHealth; headline: string; reasonCodes: string[] };
    attentionItems: AttentionItem[];
    portfolio: {
      openCount: number;
      criticalHighCount: number;
      overdueMitigationCount: number;
      unownedCount: number;
      staleReviewCount: number;
      numericalScoreImplemented: false;
    };
    matrix: { compatible: boolean; silentlyNormalized: false; limitation?: string };
    dataQuality: DataQuality & { source: "engineering_core" };
    evidenceReferences: EvidenceRef[];
    trend: "unavailable";
  };
  change: {
    availability: Availability;
    health: {
      classification: OverallHealth;
      statusContext?: string;
      headline: string;
      reasonCodes: string[];
    };
    attentionItems: AttentionItem[];
    portfolio: {
      openPendingCount: number;
      highImpactCount: number;
      scheduleImpactIndicationCount: number;
      costImpactIndicationCount: number;
      staleAssessmentCount: number;
      monetaryImpactsSummed: false;
      exposureInvented: false;
    };
    implications: {
      schedule?: string;
      cost?: string;
      forecastPublished: false;
      monetaryAmountPublished: false;
      scheduleDaysPublished: false;
      summary: string;
    };
    dataQuality: DataQuality & { source: "project_controls" };
    evidenceReferences: EvidenceRef[];
  };
  linkedSignals: Array<{
    id: string;
    reasonCode: string;
    explanation: string;
    riskEvidence: EvidenceRef;
    changeOrActionEvidence: EvidenceRef;
  }>;
  qualityBoundary: { inspectionIntegrated: false; explanation: string };
  unsupportedImpacts: {
    monetaryAmount: "unavailable";
    scheduleDays: "unavailable";
    forecastImplication: "unavailable";
    redPosture: "unavailable";
    limitation: string;
  };
  generatedAt: string;
};

type ListedProject = {
  id: string;
  project_code: string;
  project_name: string;
};

const HEALTH_STYLE: Record<OverallHealth, string> = {
  GREEN: "eos-state-success border border-[color:var(--eos-success)] px-3 py-2",
  AMBER: "eos-state-warning border border-[color:var(--eos-warning)] px-3 py-2",
  RED: "eos-state-danger border border-[color:var(--eos-danger)] px-3 py-2",
  UNKNOWN: "eos-state-unknown border border-dashed border-[color:var(--eos-border)] px-3 py-2",
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

export function RiskCommandCentreCard({
  view,
  projectId,
}: {
  view: RiskChangeView["risk"];
  projectId: string;
}) {
  const unavailable =
    view.availability === "error" ||
    view.availability === "unavailable" ||
    view.availability === "forbidden";
  return (
    <Card data-testid="command-centre-section-risk" data-availability={view.availability}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Risk</CardTitle>
          <Link
            href={`/engineering/apps/project-intelligence/risk-change?projectId=${encodeURIComponent(projectId)}`}
            className="text-xs font-medium text-cyan-700 hover:underline"
          >
            Open Risk & Change
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {unavailable ? (
          <EmptyState
            title="Risk unavailable"
            description={view.health.headline}
            data-testid="command-centre-risk-unavailable"
          />
        ) : (
          <div
            className="space-y-3"
            data-testid={stateTestId("command-centre-risk", view.dataQuality.freshness, view.availability)}
          >
            <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.health.classification])}>
              <p className="text-xs font-semibold" data-testid="command-centre-risk-health">
                {view.health.classification}
              </p>
              <p className="text-sm">{view.health.headline}</p>
              <p className="text-xs opacity-80">Freshness: {view.dataQuality.freshness}</p>
            </div>
            <p className="text-sm text-slate-700">
              Open {view.portfolio.openCount} · critical/high {view.portfolio.criticalHighCount} · overdue{" "}
              {view.portfolio.overdueMitigationCount} · unowned {view.portfolio.unownedCount} · stale{" "}
              {view.portfolio.staleReviewCount}
            </p>
            <AttentionList items={view.attentionItems.slice(0, 4)} testIdPrefix="command-centre-risk" />
            {view.dataQuality.limitations.length > 0 ? (
              <p className="text-xs text-slate-500">Limitations: {view.dataQuality.limitations.join(", ")}</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ChangeCommandCentreCard({
  view,
  projectId,
}: {
  view: RiskChangeView["change"];
  projectId: string;
}) {
  const unavailable =
    view.availability === "error" ||
    view.availability === "unavailable" ||
    view.availability === "forbidden";
  return (
    <Card data-testid="command-centre-section-change" data-availability={view.availability}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Change</CardTitle>
          <Link
            href={`/engineering/apps/project-intelligence/risk-change?projectId=${encodeURIComponent(projectId)}`}
            className="text-xs font-medium text-cyan-700 hover:underline"
          >
            Open Risk & Change
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {unavailable ? (
          <EmptyState
            title="Change unavailable"
            description={view.health.headline}
            data-testid="command-centre-change-unavailable"
          />
        ) : (
          <div
            className="space-y-3"
            data-testid={stateTestId("command-centre-change", view.dataQuality.freshness, view.availability)}
          >
            <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.health.classification])}>
              <p className="text-xs font-semibold" data-testid="command-centre-change-health">
                {view.health.classification}
              </p>
              <p className="text-sm">{view.health.headline}</p>
              <p className="text-xs opacity-80">Freshness: {view.dataQuality.freshness}</p>
            </div>
            <p className="text-sm text-slate-700">{view.implications.summary}</p>
            <AttentionList items={view.attentionItems.slice(0, 4)} testIdPrefix="command-centre-change" />
            {view.dataQuality.limitations.length > 0 ? (
              <p className="text-xs text-slate-500">Limitations: {view.dataQuality.limitations.join(", ")}</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectRiskChangeIntelligenceView() {
  const { projectId: selectedId, selectedProject } = usePiProjectContext();
  const resource = usePiJson<RiskChangeView>(
    "risk-change",
    selectedId
      ? `/api/engineering/project-intelligence/projects/${encodeURIComponent(selectedId)}/risk-change`
      : null,
  );
  const view = resource.data;
  const loading = resource.status === "loading";
  const error = resource.status === "error";

  return (
    <div data-testid="project-intelligence-risk-change" className="space-y-8">
      <PiPageProjectSelect testId="risk-change-project-select" />

      {!selectedId ? (
        <ProjectSelectCommandSurface
          title="RISK INTELLIGENCE"
          description="Select a project to activate risk and change signals."
          testId="risk-change-project-empty"
        />
      ) : null}

      {loading ? <PiLoadingSkeleton label="Loading Risk & Change Intelligence…" /> : null}
      {error ? (
        <PiUnavailablePanel
          title={PI_UNAVAILABLE["risk-change"]}
          dataset="risk-change"
          requestId={resource.requestId}
          onRetry={() => void resource.reload()}
          testId="risk-change-error"
        />
      ) : null}

      {view ? (
        <>
          <SectionHeader
            title="Risk and change interpretation"
            description={`Generated ${view.generatedAt}${selectedProject ? ` · ${selectedProject.project_code}` : ""}`}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <CommandPanel title="Risk summary" accent="danger" testId="risk-change-risk-summary">
                <div
                  className="space-y-3"
                  data-testid={stateTestId("risk-change-risk", view.risk.dataQuality.freshness, view.risk.availability)}
                >
                  <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.risk.health.classification])}>
                    <p className="text-xs font-semibold">{view.risk.health.classification}</p>
                    <p className="text-sm">{view.risk.health.headline}</p>
                  </div>
                  <p className="text-sm text-[color:var(--eos-text-secondary)]">
                    Open {view.risk.portfolio.openCount} · critical/high {view.risk.portfolio.criticalHighCount} ·
                    overdue {view.risk.portfolio.overdueMitigationCount} · unowned {view.risk.portfolio.unownedCount} ·
                    stale {view.risk.portfolio.staleReviewCount}
                  </p>
                  <SeverityDistribution
                    items={[
                      { label: "Critical / high", value: view.risk.portfolio.criticalHighCount, tone: "danger" },
                      { label: "Open", value: view.risk.portfolio.openCount, tone: "warning" },
                      { label: "Overdue mitigation", value: view.risk.portfolio.overdueMitigationCount, tone: "warning" },
                      { label: "Unowned", value: view.risk.portfolio.unownedCount, tone: "cyan" },
                      { label: "Stale review", value: view.risk.portfolio.staleReviewCount, tone: "cyan" },
                    ]}
                  />
                  <p className="text-xs text-[color:var(--eos-text-secondary)]">
                    {view.risk.matrix.compatible
                      ? "Likelihood/consequence matrix is compatible, but item coordinates are not published."
                      : "Risk matrix coordinates are not published."}{" "}
                    Trend arrows are not shown because historical comparison is unavailable.
                  </p>
                </div>
            </CommandPanel>
            <CommandPanel title="Change summary" accent="warning" testId="risk-change-change-summary">
                <div
                  className="space-y-3"
                  data-testid={stateTestId(
                    "risk-change-change",
                    view.change.dataQuality.freshness,
                    view.change.availability,
                  )}
                >
                  <div className={cn("rounded-md border px-3 py-2", HEALTH_STYLE[view.change.health.classification])}>
                    <p className="text-xs font-semibold">{view.change.health.classification}</p>
                    <p className="text-sm">{view.change.health.headline}</p>
                  </div>
                  <p className="text-sm text-slate-700">{view.change.implications.summary}</p>
                </div>
            </CommandPanel>
          </div>
          <div data-testid="risk-change-top-risks">
            <SectionHeader title="Top risks" />
            <AttentionList
              items={view.risk.attentionItems.filter(
                (item) => item.reasonCode === "open_critical_risk" || item.reasonCode === "open_high_risk",
              )}
              testIdPrefix="risk-change-top-risks"
            />
          </div>
          <div data-testid="risk-change-risk-attention">
            <SectionHeader title="Risk attention" />
            <AttentionList items={view.risk.attentionItems} testIdPrefix="risk-change-risk" />
          </div>
          <div data-testid="risk-change-change-attention">
            <SectionHeader title="Change attention" />
            <AttentionList items={view.change.attentionItems} testIdPrefix="risk-change-change" />
          </div>
          <Card data-testid="risk-change-linked-signals">
            <CardHeader>
              <CardTitle>Risk/change linked signals</CardTitle>
            </CardHeader>
            <CardContent>
              {view.linkedSignals.length === 0 ? (
                <p className="text-sm text-slate-600">No explicit canonical risk/change links.</p>
              ) : (
                <ul className="space-y-2">
                  {view.linkedSignals.map((signal) => (
                    <li key={signal.id} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                      <p className="font-medium">{signal.reasonCode}</p>
                      <p className="text-slate-700">{signal.explanation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card data-testid="risk-change-quality-boundary">
            <CardHeader>
              <CardTitle>Quality boundary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{view.qualityBoundary.explanation}</p>
            </CardContent>
          </Card>
          <Card data-testid="risk-change-quality">
            <CardHeader>
              <CardTitle>Data quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>
                Risk freshness {view.risk.dataQuality.freshness}
                {view.risk.dataQuality.asOf ? ` · as of ${view.risk.dataQuality.asOf}` : ""}
              </p>
              <p>
                Change freshness {view.change.dataQuality.freshness}
                {view.change.dataQuality.asOf ? ` · as of ${view.change.dataQuality.asOf}` : ""}
              </p>
              <p data-testid="risk-change-unsupported-impacts">
                Unsupported impacts: {view.unsupportedImpacts.limitation}
              </p>
            </CardContent>
          </Card>
          <Card data-testid="risk-change-evidence">
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs text-slate-600">
                {[...view.risk.evidenceReferences, ...view.change.evidenceReferences].map((ref) => (
                  <li key={`${ref.entityType}:${ref.entityId}`} data-testid={`risk-change-evidence-${ref.entityId}`}>
                    {evidenceDisplayLabel(ref)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <p className="text-xs text-slate-500" data-testid="risk-change-limitations">
            Limitations: {[...view.risk.dataQuality.limitations, ...view.change.dataQuality.limitations].join(", ")}
          </p>
        </>
      ) : null}
    </div>
  );
}
