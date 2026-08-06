/**
 * Live executive dashboard aggregation contract — no persistent duplicate store.
 */
import {
  EXECUTIVE_DASHBOARD_WIDGETS,
  type ExecutiveDashboardWidgetId,
  assertNoDuplicateWidgetStorage,
} from "./executive-widgets";

export type ExecutiveDashboardMetric = {
  widgetId: ExecutiveDashboardWidgetId;
  label: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "flat" | "unknown";
  citations?: readonly { source: string; refId: string; excerpt?: string }[];
  drillDownPath: string;
  owner: string;
};

export type ExecutiveDashboardSnapshot = {
  kind: "reporting_intelligence.executive_dashboard";
  featureKey: "reporting_intelligence";
  tenantId: string;
  workspaceId: string;
  generatedAt: string;
  liveAggregation: true;
  duplicateStorage: false;
  widgets: readonly ExecutiveDashboardMetric[];
  enabledWidgetIds: readonly ExecutiveDashboardWidgetId[];
};

export type ExecutiveDashboardSourceCounts = {
  activeProjects: number;
  highRiskAssets: number;
  openFindings: number;
  convertedFindings: number;
  openRisks: number;
  openIssues: number;
  openActions: number;
  openTechnicalQueries: number;
  lessons: number;
  meetingSessions: number;
  documentsReady: number;
  documentsProcessing: number;
  approvalQueue: number;
  evidenceCoverageRatio: number;
  auditEventsRecent: number;
  timelineEventsRecent: number;
};

export function buildExecutiveDashboardSnapshot(input: {
  tenantId: string;
  workspaceId: string;
  counts: ExecutiveDashboardSourceCounts;
  enabledWidgetIds?: readonly ExecutiveDashboardWidgetId[];
  now?: string;
}): ExecutiveDashboardSnapshot {
  if (!input.tenantId.trim() || !input.workspaceId.trim()) {
    throw new Error("Executive dashboard requires tenant and workspace scope");
  }
  assertNoDuplicateWidgetStorage();
  const enabled = new Set(
    input.enabledWidgetIds ?? EXECUTIVE_DASHBOARD_WIDGETS.map((w) => w.id),
  );

  const byId = Object.fromEntries(EXECUTIVE_DASHBOARD_WIDGETS.map((w) => [w.id, w])) as Record<
    ExecutiveDashboardWidgetId,
    (typeof EXECUTIVE_DASHBOARD_WIDGETS)[number]
  >;

  const metric = (
    id: ExecutiveDashboardWidgetId,
    label: string,
    value: number | string,
    extras?: Partial<ExecutiveDashboardMetric>,
  ): ExecutiveDashboardMetric => ({
    widgetId: id,
    label,
    value,
    drillDownPath: byId[id].drillDownPath,
    owner: byId[id].owner,
    ...extras,
  });

  const all: ExecutiveDashboardMetric[] = [
    metric("project_health", "Active projects", input.counts.activeProjects, {
      citations: [{ source: "engineering_core", refId: "projects.active" }],
    }),
    metric("open_findings", "Open findings", input.counts.openFindings, {
      citations: [{ source: "findings_intelligence", refId: "findings.open" }],
    }),
    metric("converted_findings", "Converted findings", input.counts.convertedFindings, {
      citations: [{ source: "findings_intelligence", refId: "findings.converted" }],
    }),
    metric("risks", "Open risks", input.counts.openRisks),
    metric("issues", "Open issues", input.counts.openIssues),
    metric("actions", "Open actions", input.counts.openActions),
    metric("technical_queries", "Open technical queries", input.counts.openTechnicalQueries),
    metric("lessons_learned", "Lessons", input.counts.lessons),
    metric("meeting_activity", "Meeting sessions", input.counts.meetingSessions, {
      citations: [{ source: "meeting_intelligence", refId: "meetings.sessions" }],
    }),
    metric(
      "document_processing_status",
      "Documents ready / processing",
      `${input.counts.documentsReady} / ${input.counts.documentsProcessing}`,
      { citations: [{ source: "document_intelligence", refId: "documents.status" }] },
    ),
    metric("ai_executive_summary", "AI summary", "draft_requires_human_review", {
      unit: "status",
    }),
    metric("approval_queue", "Pending approvals", input.counts.approvalQueue),
    metric("kpi_trends", "High-risk assets", input.counts.highRiskAssets, { trend: "unknown" }),
    metric("timeline", "Recent timeline events", input.counts.timelineEventsRecent),
    metric(
      "evidence_coverage",
      "Evidence coverage",
      Math.round(input.counts.evidenceCoverageRatio * 100),
      { unit: "percent" },
    ),
    metric("audit_activity", "Recent audit events", input.counts.auditEventsRecent),
  ];

  return {
    kind: "reporting_intelligence.executive_dashboard",
    featureKey: "reporting_intelligence",
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    generatedAt: input.now ?? new Date().toISOString(),
    liveAggregation: true,
    duplicateStorage: false,
    enabledWidgetIds: [...enabled],
    widgets: all.filter((w) => enabled.has(w.widgetId)),
  };
}
