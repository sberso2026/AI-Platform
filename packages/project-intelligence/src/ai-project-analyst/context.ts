import { ANALYST_KNOWN_LIMITATIONS, AI_PROJECT_ANALYST_CAPABILITY } from "./capability";
import type { ProjectCommandCentreView } from "../command-centre/types";
import { citationFromEvidence, sectionCitation } from "./tools";
import type { AnalystCitation, AnalystContext, AnalystSectionContext } from "./types";

const BASE = "/engineering/apps/project-intelligence";

function fromSection(
  id: string,
  availability: string,
  state: string,
  summary: string,
  source: string,
  path: string,
  asOf: string | undefined,
  limitations: readonly string[],
  evidence: readonly AnalystCitation[],
  counts?: Readonly<Record<string, number>>,
): AnalystSectionContext {
  return {
    id,
    state,
    availability,
    asOf,
    source,
    summary,
    limitations,
    evidence,
    counts,
    navigationPath: path,
  };
}

export function assembleAnalystContext(view: ProjectCommandCentreView): AnalystContext {
  const asOf = view.generatedAt;
  const projectPath = `${BASE}?projectId=${encodeURIComponent(view.project.projectId)}`;
  const q = view.queryDecisionIntelligence;
  const forecast = view.forecastIntelligence;
  const schedule = view.scheduleIntelligence;
  const costProgress = view.costProgressIntelligence;
  const riskChange = view.riskChangeIntelligence;

  const attention = view.attentionItems.map((item) => ({
    severity: item.severity,
    reasonCode: item.reasonCode,
    explanation: item.explanation,
    citation: citationFromEvidence(item.sourceReference, item.reasonCode),
  }));

  const linkedSignals = (q.linkedSignals ?? []).map((signal) => ({
    explanation: signal.explanation,
    from: citationFromEvidence(signal.fromEvidence),
    to: citationFromEvidence(signal.toEvidence),
  }));

  const freshness: Record<string, string> = {
    health: asOf,
    schedule: schedule.dataQuality.freshness,
    cost: costProgress.cost.dataQuality.freshness,
    progress: costProgress.progress.dataQuality.freshness,
    risk: riskChange.risk.dataQuality.freshness,
    change: riskChange.change.dataQuality.freshness,
    queries: q.query.dataQuality.freshness,
    decisions: q.decision.dataQuality.freshness,
    actions: q.action.dataQuality.freshness,
    forecast: forecast.dataQuality.freshness,
  };

  return {
    capability: AI_PROJECT_ANALYST_CAPABILITY,
    generatedAt: asOf,
    project: {
      projectId: view.project.projectId,
      tenantId: view.project.tenantId,
      workspaceId: view.project.workspaceId,
      projectCode: view.project.projectCode,
      projectName: view.project.projectName,
      phase: view.project.phase,
      status: view.project.status,
    },
    health: fromSection(
      "health",
      "ok",
      view.overallHealth,
      `Overall Project Health is ${view.overallHealth}.`,
      "project_intelligence.project_health",
      projectPath,
      asOf,
      view.limitations,
      view.evidenceReferences.map((ref) => citationFromEvidence(ref)),
    ),
    schedule: fromSection(
      "schedule",
      schedule.availability,
      schedule.health.classification,
      schedule.health.headline,
      "project_controls.schedule",
      `${BASE}/schedule?projectId=${encodeURIComponent(view.project.projectId)}`,
      schedule.dataQuality.asOf ?? asOf,
      schedule.dataQuality.limitations,
      schedule.evidenceReferences.map((ref) => citationFromEvidence(ref)),
    ),
    cost: fromSection(
      "cost",
      costProgress.cost.availability,
      costProgress.cost.health.classification,
      costProgress.cost.health.headline,
      "project_controls.cost",
      `${BASE}/cost-progress?projectId=${encodeURIComponent(view.project.projectId)}`,
      costProgress.cost.dataQuality.asOf ?? asOf,
      costProgress.cost.dataQuality.limitations,
      costProgress.cost.evidenceReferences.map((ref) => citationFromEvidence(ref)),
    ),
    progress: fromSection(
      "progress",
      costProgress.progress.availability,
      costProgress.progress.health.classification,
      costProgress.progress.health.headline,
      "project_controls.progress",
      `${BASE}/cost-progress?projectId=${encodeURIComponent(view.project.projectId)}`,
      costProgress.progress.dataQuality.asOf ?? asOf,
      costProgress.progress.dataQuality.limitations,
      costProgress.progress.evidenceReferences.map((ref) => citationFromEvidence(ref)),
    ),
    risk: fromSection(
      "risk",
      riskChange.risk.availability,
      riskChange.risk.health.classification,
      riskChange.risk.health.headline,
      "engineering_core.risk",
      `${BASE}/risk-change?projectId=${encodeURIComponent(view.project.projectId)}`,
      riskChange.risk.dataQuality.asOf ?? asOf,
      riskChange.risk.dataQuality.limitations,
      riskChange.risk.evidenceReferences.map((ref) => citationFromEvidence(ref)),
      { open: riskChange.risk.portfolio.openCount, high: riskChange.risk.portfolio.criticalHighCount },
    ),
    change: fromSection(
      "change",
      riskChange.change.availability,
      riskChange.change.health.classification,
      riskChange.change.health.headline,
      "project_controls.change",
      `${BASE}/risk-change?projectId=${encodeURIComponent(view.project.projectId)}`,
      riskChange.change.dataQuality.asOf ?? asOf,
      riskChange.change.dataQuality.limitations,
      riskChange.change.evidenceReferences.map((ref) => citationFromEvidence(ref)),
    ),
    queries: fromSection(
      "queries",
      q.query.availability,
      q.query.health.classification,
      q.query.health.headline,
      "engineering_core.technical_query",
      `${BASE}/queries-decisions?projectId=${encodeURIComponent(view.project.projectId)}`,
      q.query.dataQuality.asOf ?? asOf,
      [...q.query.dataQuality.limitations, "RFI is represented through the technical query model"],
      q.query.evidenceReferences.map((ref) => citationFromEvidence(ref)),
      { open: q.query.portfolio.openCount, overdue: q.query.portfolio.overdueCount },
    ),
    decisions: fromSection(
      "decisions",
      q.decision.availability,
      q.decision.health.classification,
      q.decision.health.headline,
      "engineering_core.decision",
      `${BASE}/queries-decisions?projectId=${encodeURIComponent(view.project.projectId)}`,
      q.decision.dataQuality.asOf ?? asOf,
      q.decision.dataQuality.limitations,
      q.decision.evidenceReferences.map((ref) => citationFromEvidence(ref)),
      { open: q.decision.portfolio.openCount, overdue: q.decision.portfolio.overdueCount },
    ),
    actions: fromSection(
      "actions",
      q.action.availability,
      q.action.health.classification,
      q.action.health.headline,
      "engineering_core.action",
      `${BASE}/queries-decisions?projectId=${encodeURIComponent(view.project.projectId)}`,
      q.action.dataQuality.asOf ?? asOf,
      q.action.dataQuality.limitations,
      q.action.evidenceReferences.map((ref) => citationFromEvidence(ref)),
      { open: q.action.portfolio.openCount, overdue: q.action.portfolio.overdueCount },
    ),
    forecast: fromSection(
      "forecast",
      forecast.availability,
      forecast.health.classification,
      forecast.health.headline,
      "project_controls.forecast",
      `${BASE}/forecasting?projectId=${encodeURIComponent(view.project.projectId)}`,
      forecast.dataQuality.asOf ?? asOf,
      [
        ...forecast.dataQuality.limitations,
        forecast.unsupported.limitation,
        "forecast is qualitative only",
        "no completion date forecast is invented by Project Intelligence",
        "no monetary cost forecast is invented by Project Intelligence",
        "no probability forecast is invented by Project Intelligence",
      ],
      forecast.evidenceReferences.map((ref) => citationFromEvidence(ref)),
    ),
    knowledge: fromSection(
      "knowledge",
      view.knowledge.availability,
      view.knowledge.availability,
      view.knowledge.summary,
      "project_intelligence.knowledge",
      `${BASE}/knowledge?projectId=${encodeURIComponent(view.project.projectId)}`,
      view.knowledge.freshness ?? asOf,
      view.knowledge.limitations,
      view.knowledge.evidenceReferences.map((ref) => citationFromEvidence(ref)),
    ),
    attention,
    limitations: [...view.limitations, ...ANALYST_KNOWN_LIMITATIONS],
    freshness,
    linkedSignals,
    readOnly: true,
    mutationEnabled: false,
  };
}

export function unknownOrUnavailable(section: AnalystSectionContext): boolean {
  const state = section.state.toUpperCase();
  return (
    state === "UNKNOWN" ||
    section.availability === "no_data" ||
    section.availability === "unavailable" ||
    section.availability === "forbidden" ||
    section.availability === "error" ||
    section.availability === "stale"
  );
}

export { sectionCitation };
