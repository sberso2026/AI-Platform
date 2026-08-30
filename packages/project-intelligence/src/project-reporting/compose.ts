import { commandCentreForbidden } from "../command-centre/errors";
import type { CommandCentreSectionProjection, ProjectCommandCentreView } from "../command-centre/types";
import { conflictClaimText } from "../connector-context/conflicts";
import { describeConnectorItem } from "../connector-context/service";
import { EMPTY_CONNECTOR_CONTEXT_PACK, type ConnectorContextPack } from "../connector-context/types";
import { ANALYST_KNOWN_LIMITATIONS } from "../ai-project-analyst/capability";
import { requireProjectIntelligenceAccess, type AccessContext } from "../security/access-guard";
import { composeManagementAttention } from "./attention";
import { assertProjectReportingOwnershipLocks } from "./ownership";
import {
  REPORT_SECTIONS_BY_TYPE,
  type ProjectReportEvidence,
  type ProjectReportSection,
  type ProjectReportSectionId,
  type ProjectReportSnapshot,
  type ProjectReportSourceClassification,
  type ProjectReportType,
} from "./types";

export type AssembleProjectReportInput = {
  view: ProjectCommandCentreView;
  connectorContext?: ConnectorContextPack;
  reportType: ProjectReportType;
  context: AccessContext;
  requestedProjectId: string;
  generatedAt?: string;
};

function freeze<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function evidenceOf(
  refs: readonly ProjectReportEvidence[] | readonly { sourceDomain: string; entityType: string; entityId: string; sourceTimestamp?: string }[],
): ProjectReportEvidence[] {
  return refs.map((ref) => ({
    sourceDomain: ref.sourceDomain as ProjectReportEvidence["sourceDomain"],
    entityType: ref.entityType,
    entityId: ref.entityId,
    sourceTimestamp: ref.sourceTimestamp,
    storesCanonicalCopy: false as const,
  }));
}

function unknownState(state: string, availability: string): boolean {
  const value = `${state} ${availability}`.toUpperCase();
  return (
    value.includes("UNKNOWN") ||
    availability === "no_data" ||
    availability === "unavailable" ||
    availability === "error" ||
    availability === "forbidden"
  );
}

function preserveUnknownBody(label: string, state: string, availability: string, headline: string): string {
  if (unknownState(state, availability)) {
    return `${label} status: UNKNOWN (${availability}). ${headline} UNKNOWN is not assumed healthy.`;
  }
  return `${label}: ${headline} (${state}, ${availability}).`;
}

function section(
  id: ProjectReportSectionId,
  title: string,
  sourceClassification: ProjectReportSourceClassification,
  state: string,
  availability: string,
  body: string,
  evidence: readonly ProjectReportEvidence[],
  limitations: readonly string[],
  freshness?: string,
): ProjectReportSection {
  const unknownPreserved = unknownState(state, availability);
  return {
    id,
    title,
    sourceClassification,
    state,
    availability,
    freshness,
    body: unknownPreserved ? preserveUnknownBody(title, state, availability, body) : body,
    evidence,
    limitations,
    unknownPreserved,
  };
}

function fromCc(
  id: ProjectReportSectionId,
  title: string,
  cc: CommandCentreSectionProjection,
  classification: string,
  extraLimitations: readonly string[] = [],
): ProjectReportSection {
  return section(
    id,
    title,
    "CANONICAL_PI",
    classification,
    cc.availability,
    cc.summary,
    evidenceOf(cc.evidenceReferences),
    [...cc.limitations, ...extraLimitations],
    cc.freshness,
  );
}

function buildAllSections(
  view: ProjectCommandCentreView,
  connector: ConnectorContextPack,
  generatedAt: string,
): ProjectReportSection[] {
  const schedule = view.scheduleIntelligence;
  const costProgress = view.costProgressIntelligence;
  const riskChange = view.riskChangeIntelligence;
  const queries = view.queryDecisionIntelligence;
  const forecast = view.forecastIntelligence;

  const executiveBody =
    view.overallHealth === "UNKNOWN"
      ? `${view.project.projectCode} ${view.project.projectName}. Overall project health: UNKNOWN. UNKNOWN is not assumed on track.`
      : `${view.project.projectCode} ${view.project.projectName}. Overall project health: ${view.overallHealth}.`;

  const attentionPreview = view.attentionItems
    .slice(0, 3)
    .map((item) => `${item.severity.toUpperCase()} · ${item.reasonCode}`)
    .join("; ");

  const executive = section(
    "executive_summary",
    "Executive Summary",
    "DETERMINISTIC_INTERPRETATION",
    view.overallHealth,
    "ok",
    `${executiveBody}${attentionPreview ? ` Management attention: ${attentionPreview}.` : " No RED/AMBER attention items are currently published."} Point-in-time snapshot at ${generatedAt}.`,
    evidenceOf(view.evidenceReferences.slice(0, 6)),
    view.limitations.slice(0, 6),
    generatedAt,
  );

  const health = section(
    "overall_health",
    "Overall Project Health",
    "CANONICAL_PI",
    view.overallHealth,
    "ok",
    `Overall project health classification is ${view.overallHealth}. Numerical scoring is not implemented.`,
    evidenceOf(view.healthDimensions.flatMap((dimension) => dimension.evidenceReferences).slice(0, 8)),
    view.healthDimensions.flatMap((dimension) => dimension.limitations).slice(0, 8),
    generatedAt,
  );

  const rfiLimitations = [
    ...queries.query.dataQuality.limitations,
    "RFI is represented through the technical query model",
  ];

  const externalLimitations = [
    ...(connector.degraded ? ["Connector context retrieval is degraded. Canonical Project Intelligence remains available."] : []),
    ...(connector.availability === "forbidden" ? ["Connector context was not retrieved because connector authorization was denied."] : []),
    ...(connector.availability === "error" || connector.availability === "unavailable"
      ? ["External context is unavailable. Canonical Project Intelligence remains available."]
      : []),
    ...connector.conflicts.map((conflict) => conflictClaimText(conflict)),
  ];

  const externalAvailabilityLabel =
    connector.degraded || connector.availability === "error" || connector.availability === "unavailable"
      ? "unavailable/degraded"
      : connector.availability;

  const externalBody = connector.items.length
    ? connector.items.map((item) => describeConnectorItem(item)).join(" ")
    : `External context availability: ${externalAvailabilityLabel}. No project-bound EXTERNAL_CONTEXT items were included.`;

  const external = section(
    "external_context",
    "External Context",
    "EXTERNAL_CONTEXT",
    connector.availability,
    connector.availability,
    `${externalBody} External context remains EXTERNAL_CONTEXT and does not override canonical project truth.`,
    connector.items.slice(0, 8).map((item) => ({
      sourceDomain: "project_intelligence" as const,
      entityType: item.resourceType,
      entityId: item.externalResourceId,
      sourceTimestamp: item.sourceTimestamp ?? undefined,
      storesCanonicalCopy: false as const,
      label: item.title,
    })),
    externalLimitations,
    connector.items[0]?.freshness,
  );

  const attentionItems = composeManagementAttention(view, connector);
  const attention = section(
    "management_attention",
    "Management Attention",
    "DETERMINISTIC_INTERPRETATION",
    attentionItems.length ? attentionItems[0]!.severity : "info",
    "ok",
    attentionItems.length
      ? attentionItems.map((item) => `${item.kind}: ${item.explanation}`).join(" ")
      : "No supported management-attention items are currently published.",
    attentionItems.flatMap((item) => item.evidence).slice(0, 8),
    [],
    generatedAt,
  );

  const qualityLimitations = [
    ...view.limitations,
    ...ANALYST_KNOWN_LIMITATIONS.slice(0, 4),
    "Project reports are advisory snapshots and do not persist a second project truth model.",
    connector.liveExecution ? "Connector live execution was flagged." : "Connector context is fixture/sandbox unless live execution is separately certified.",
  ];

  const quality = section(
    "data_quality",
    "Data Quality / Limitations",
    "LIMITATION",
    "recorded",
    "ok",
    qualityLimitations.join(" "),
    evidenceOf(view.evidenceReferences.slice(0, 4)),
    qualityLimitations,
    generatedAt,
  );

  return [
    executive,
    health,
    fromCc("schedule", "Schedule", view.schedule, schedule.health.classification, schedule.dataQuality.limitations),
    fromCc("cost", "Cost", view.cost, costProgress.cost.health.classification, costProgress.cost.dataQuality.limitations),
    fromCc("progress", "Progress", view.progress, costProgress.progress.health.classification, costProgress.progress.dataQuality.limitations),
    fromCc("risks", "Risks", view.risk, riskChange.risk.health.classification, riskChange.risk.dataQuality.limitations),
    fromCc("changes", "Changes", view.change, riskChange.change.health.classification, riskChange.change.dataQuality.limitations),
    section(
      "rfi_tq",
      "RFI / TQ",
      "CANONICAL_PI",
      queries.query.health.classification,
      queries.query.availability,
      `${queries.query.health.headline} RFI is represented through the technical query model.`,
      evidenceOf(queries.query.evidenceReferences),
      rfiLimitations,
      queries.query.dataQuality.freshness,
    ),
    section(
      "decisions",
      "Decisions",
      "CANONICAL_PI",
      queries.decision.health.classification,
      queries.decision.availability,
      queries.decision.health.headline,
      evidenceOf(queries.decision.evidenceReferences),
      queries.decision.dataQuality.limitations,
      queries.decision.dataQuality.freshness,
    ),
    section(
      "actions",
      "Actions",
      "CANONICAL_PI",
      queries.action.health.classification,
      queries.action.availability,
      queries.action.health.headline,
      evidenceOf(queries.action.evidenceReferences),
      queries.action.dataQuality.limitations,
      queries.action.dataQuality.freshness,
    ),
    fromCc("forecast", "Forecast", view.forecast, forecast.health.classification, forecast.dataQuality.limitations),
    external,
    attention,
    quality,
  ];
}

export function assembleProjectReport(input: AssembleProjectReportInput): ProjectReportSnapshot {
  assertProjectReportingOwnershipLocks();
  requireProjectIntelligenceAccess(input.context);
  const view = input.view;
  if (view.project.tenantId !== input.context.tenantId) {
    throw commandCentreForbidden(view.project.projectId, "cross_tenant");
  }
  if (view.project.workspaceId !== input.context.workspaceId) {
    throw commandCentreForbidden(view.project.projectId, "cross_workspace");
  }
  if (view.project.projectId !== input.requestedProjectId) {
    throw commandCentreForbidden(input.requestedProjectId, "cross_project");
  }

  const generatedAt = input.generatedAt ?? view.generatedAt;
  const connector = input.connectorContext ?? EMPTY_CONNECTOR_CONTEXT_PACK;
  const wanted = new Set(REPORT_SECTIONS_BY_TYPE[input.reportType]);
  const sections = freeze(buildAllSections(view, connector, generatedAt).filter((row) => wanted.has(row.id)));
  const managementAttention = freeze(composeManagementAttention(view, connector));
  const evidence = freeze(
    sections.flatMap((row) => row.evidence).filter((ref, index, all) => {
      const key = `${ref.sourceDomain}:${ref.entityType}:${ref.entityId}`;
      return all.findIndex((item) => `${item.sourceDomain}:${item.entityType}:${item.entityId}` === key) === index;
    }),
  );

  return freeze({
    kind: "project_intelligence.project_report",
    snapshotId: `pi-report:${view.project.projectId}:${input.reportType}:${generatedAt}`,
    reportType: input.reportType,
    generatedAt,
    projectId: view.project.projectId,
    tenantId: view.project.tenantId,
    workspaceId: view.project.workspaceId,
    projectCode: view.project.projectCode,
    projectName: view.project.projectName,
    overallHealth: view.overallHealth,
    sections,
    managementAttention,
    connectorContext: {
      availability: connector.availability,
      freshnessStates: connector.items.map((item) => item.freshness),
      retrievedAt: connector.items[0]?.retrievedAt,
      liveExecution: connector.liveExecution,
      degraded: connector.degraded,
      conflictCount: connector.conflicts.length,
      canonicality: "EXTERNAL_CONTEXT",
    },
    narrative: {
      kind: "AI_SUMMARY",
      available: false,
      skippedReason: "not_attached",
    },
    limitations: freeze([
      ...view.limitations,
      ...sections.flatMap((row) => row.limitations),
    ].filter((item, index, all) => all.indexOf(item) === index).slice(0, 16)),
    evidence,
    persisted: false,
    readOnly: true,
    advisory: true,
    canonicalMutation: false,
    externalWritesEnabled: false,
    autonomousApprovalEnabled: false,
    aiOptional: true,
    duplicateReportingTruthModel: false,
  });
}

export function reportProjectMismatch(report: ProjectReportSnapshot, projectId: string): boolean {
  return report.projectId !== projectId;
}
