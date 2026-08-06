/**
 * Reporting Intelligence — Executive Dashboard widget catalogue.
 * Live aggregation only; no duplicate ownership of Core or feature stores.
 */
export const EXECUTIVE_DASHBOARD_WIDGET_IDS = [
  "project_health",
  "open_findings",
  "converted_findings",
  "risks",
  "issues",
  "actions",
  "technical_queries",
  "lessons_learned",
  "meeting_activity",
  "document_processing_status",
  "ai_executive_summary",
  "approval_queue",
  "kpi_trends",
  "timeline",
  "evidence_coverage",
  "audit_activity",
] as const;

export type ExecutiveDashboardWidgetId = (typeof EXECUTIVE_DASHBOARD_WIDGET_IDS)[number];

export type ExecutiveDashboardWidgetOwner =
  | "engineering_core"
  | "document_intelligence"
  | "meeting_intelligence"
  | "findings_intelligence"
  | "reporting_intelligence"
  | "shared_engineering_services";

export type ExecutiveDashboardWidgetDefinition = {
  id: ExecutiveDashboardWidgetId;
  title: string;
  owner: ExecutiveDashboardWidgetOwner;
  drillDownPath: string;
  description: string;
  storesOwnCopy: false;
};

export const EXECUTIVE_DASHBOARD_WIDGETS: readonly ExecutiveDashboardWidgetDefinition[] = [
  {
    id: "project_health",
    title: "Project Health",
    owner: "engineering_core",
    drillDownPath: "/engineering",
    description: "Active projects and high-criticality assets from Engineering Core",
    storesOwnCopy: false,
  },
  {
    id: "open_findings",
    title: "Open Findings",
    owner: "findings_intelligence",
    drillDownPath: "/engineering/apps/project-intelligence/findings",
    description: "Open intelligence findings awaiting disposition",
    storesOwnCopy: false,
  },
  {
    id: "converted_findings",
    title: "Converted Findings",
    owner: "findings_intelligence",
    drillDownPath: "/engineering/apps/project-intelligence/findings",
    description: "Findings converted to Core registers after human approval",
    storesOwnCopy: false,
  },
  {
    id: "risks",
    title: "Risks",
    owner: "engineering_core",
    drillDownPath: "/engineering/risks",
    description: "Open risks from Engineering Core",
    storesOwnCopy: false,
  },
  {
    id: "issues",
    title: "Issues",
    owner: "engineering_core",
    drillDownPath: "/engineering/issues",
    description: "Open issues from Engineering Core",
    storesOwnCopy: false,
  },
  {
    id: "actions",
    title: "Actions",
    owner: "engineering_core",
    drillDownPath: "/engineering/actions",
    description: "Open actions from Engineering Core",
    storesOwnCopy: false,
  },
  {
    id: "technical_queries",
    title: "Technical Queries",
    owner: "engineering_core",
    drillDownPath: "/engineering/technical-queries",
    description: "Open technical queries from Engineering Core",
    storesOwnCopy: false,
  },
  {
    id: "lessons_learned",
    title: "Lessons Learned",
    owner: "engineering_core",
    drillDownPath: "/engineering/lessons",
    description: "Lessons from Engineering Core",
    storesOwnCopy: false,
  },
  {
    id: "meeting_activity",
    title: "Meeting Activity",
    owner: "meeting_intelligence",
    drillDownPath: "/engineering/apps/project-intelligence/meetings",
    description: "Meeting sessions and processing activity",
    storesOwnCopy: false,
  },
  {
    id: "document_processing_status",
    title: "Document Processing Status",
    owner: "document_intelligence",
    drillDownPath: "/engineering/apps/project-intelligence/documents",
    description: "Document ingestion and processing readiness",
    storesOwnCopy: false,
  },
  {
    id: "ai_executive_summary",
    title: "AI Executive Summary",
    owner: "reporting_intelligence",
    drillDownPath: "/engineering/apps/project-intelligence/reports/executive",
    description: "Platform AI Runtime draft; human review required before publish",
    storesOwnCopy: false,
  },
  {
    id: "approval_queue",
    title: "Approval Queue",
    owner: "shared_engineering_services",
    drillDownPath: "/engineering/apps/project-intelligence/documents/review",
    description: "Pending human approvals across intelligence features",
    storesOwnCopy: false,
  },
  {
    id: "kpi_trends",
    title: "KPI Trends",
    owner: "reporting_intelligence",
    drillDownPath: "/engineering/apps/project-intelligence/reports/executive",
    description: "Live KPI deltas derived from source systems",
    storesOwnCopy: false,
  },
  {
    id: "timeline",
    title: "Timeline",
    owner: "shared_engineering_services",
    drillDownPath: "/engineering",
    description: "Shared Engineering timeline activity",
    storesOwnCopy: false,
  },
  {
    id: "evidence_coverage",
    title: "Evidence Coverage",
    owner: "document_intelligence",
    drillDownPath: "/engineering/apps/project-intelligence/documents",
    description: "Citation and evidence coverage across intelligence answers",
    storesOwnCopy: false,
  },
  {
    id: "audit_activity",
    title: "Audit Activity",
    owner: "shared_engineering_services",
    drillDownPath: "/engineering/apps/project-intelligence/health",
    description: "Recent audit events via shared audit service",
    storesOwnCopy: false,
  },
] as const;

export function assertNoDuplicateWidgetStorage(
  widgets: readonly ExecutiveDashboardWidgetDefinition[] = EXECUTIVE_DASHBOARD_WIDGETS,
): void {
  for (const widget of widgets) {
    if (widget.storesOwnCopy !== false) {
      throw new Error(`Executive widget ${widget.id} must not store a duplicate copy`);
    }
  }
  if (widgets.length !== EXECUTIVE_DASHBOARD_WIDGET_IDS.length) {
    throw new Error("Executive dashboard widget catalogue incomplete");
  }
}
