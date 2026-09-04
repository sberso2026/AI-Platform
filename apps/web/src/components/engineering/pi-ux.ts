import { PI_BASE_PATH, withPiProjectQuery } from "./pi-project-context";

export type PiEvidenceRef = {
  sourceDomain: string;
  entityType: string;
  entityId: string;
  sourceTimestamp?: string;
};

export const ATTENTION_ISSUE_LABELS: Record<string, string> = {
  schedule_milestone_missed: "Overdue or missed schedule milestone",
  schedule_milestone_at_risk: "Schedule milestone at risk",
  cost_posture_over: "Cost exposure above published tolerance",
  cost_posture_attention_required: "Cost posture requires attention",
  progress_trend_declining: "Progress trend declining",
  open_critical_or_high_score_risk: "Open high or critical risk",
  open_elevated_risk: "Open elevated risk",
  open_critical_issue: "Open critical issue",
  open_high_issue: "Open high-priority issue",
  open_critical_finding: "Unresolved critical finding",
  open_quality_finding: "Unresolved finding",
  change_status_pending: "Unapproved or pending change",
  high_impact_change_pending: "Pending change exposure",
  overdue_open_action: "Overdue action",
  open_action: "Open action",
  open_decision: "Open decision",
  blocked_decision: "Blocked or overdue decision",
  overall_health_unknown: "Missing required evidence for project health",
  stale_external_context: "Stale connected source evidence",
};

export function attentionIssueTitle(reasonCode: string): string {
  return ATTENTION_ISSUE_LABELS[reasonCode] ?? reasonCode.replace(/_/g, " ");
}

export function sourceOpenHref(ref: PiEvidenceRef, projectId?: string | null): string {
  const type = ref.entityType.toLowerCase();
  if (type.includes("schedule") || type.includes("milestone")) {
    return withPiProjectQuery(`${PI_BASE_PATH}/schedule`, projectId);
  }
  if (type.includes("cost") || type.includes("progress") || type.includes("forecast")) {
    return withPiProjectQuery(`${PI_BASE_PATH}/cost-progress`, projectId);
  }
  if (type.includes("risk") || type.includes("change") || type.includes("issue")) {
    return withPiProjectQuery(`${PI_BASE_PATH}/risk-change`, projectId);
  }
  if (type.includes("decision") || type.includes("action")) {
    return withPiProjectQuery(`${PI_BASE_PATH}/decisions`, projectId);
  }
  if (type.includes("quer") || type.includes("tq") || type.includes("rfi")) {
    return withPiProjectQuery(`${PI_BASE_PATH}/queries-decisions`, projectId);
  }
  if (type.includes("document")) {
    return withPiProjectQuery(`${PI_BASE_PATH}/documents`, projectId);
  }
  if (type.includes("meeting")) {
    return withPiProjectQuery(`${PI_BASE_PATH}/meetings`, projectId);
  }
  if (type.includes("finding")) {
    return withPiProjectQuery(`${PI_BASE_PATH}/findings`, projectId);
  }
  return withPiProjectQuery(PI_BASE_PATH, projectId);
}

export function sourceSystemLabel(source?: string): string | null {
  if (!source) return null;
  const normalized = source.toLowerCase();
  if (normalized.includes("primavera") || normalized === "p6") return "Primavera P6";
  if (normalized.includes("ms_project") || normalized.includes("microsoft project")) return "Microsoft Project";
  if (normalized.includes("project_controls")) return "Project Controls";
  if (normalized.includes("engineering_core")) return "Engineering Core";
  if (normalized.includes("aconex")) return "Aconex";
  if (normalized.includes("sharepoint")) return "SharePoint";
  if (normalized.includes("sap") || normalized.includes("erp")) return "Connected cost system";
  return null;
}

export function freshnessLabel(timestamp?: string | null, freshness?: string | null): string | null {
  if (freshness === "STALE") return "Updated: stale";
  if (freshness === "CURRENT" && timestamp) {
    return `Updated ${relativeAge(timestamp)}`;
  }
  if (timestamp) return `Updated ${relativeAge(timestamp)}`;
  return null;
}

export function relativeAge(timestamp: string): string {
  const then = Date.parse(timestamp);
  if (!Number.isFinite(then)) return "at an unknown time";
  const delta = Date.now() - then;
  const minutes = Math.round(delta / 60000);
  if (Math.abs(minutes) < 60) return `${Math.max(1, Math.abs(minutes))}m ago`;
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 48) return `${Math.abs(hours)}h ago`;
  const days = Math.round(hours / 24);
  return `${Math.abs(days)}d ago`;
}

export function documentReadinessLabel(status: string, readiness: string): string {
  if (readiness === "ready" || status === "ready" || status === "ready_with_warnings") return "AI-ready";
  if (status === "failed" || status === "error") return "Failed";
  if (status === "unregistered") return "Not processed";
  return "Partial";
}

export function humanizeToken(value: string): string {
  return value
    .replace(/[:._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function evidenceDisplayLabel(ref: {
  sourceDomain: string;
  entityType: string;
  label?: string;
  sourceTimestamp?: string;
}): string {
  if (ref.label?.trim()) return ref.label.trim();
  const source = sourceSystemLabel(ref.sourceDomain) ?? humanizeToken(ref.sourceDomain);
  const type = humanizeToken(ref.entityType);
  const asOf = ref.sourceTimestamp ? ` · ${relativeAge(ref.sourceTimestamp)}` : "";
  return `${source} · ${type}${asOf}`;
}

const MEETING_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  open: "Open",
  in_review: "In review",
  review_required: "Follow-up required",
  actions_open: "Actions open",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function meetingStatusLabel(status: string): string {
  return MEETING_STATUS_LABELS[status] ?? humanizeToken(status);
}

const FINDING_STATUS_LABELS: Record<string, string> = {
  candidate: "Identified",
  triage_pending: "Needs triage",
  under_review: "Under review",
  changes_requested: "Changes requested",
  accepted: "Accepted",
  conversion_proposed: "Ready for conversion",
  reopened: "Reopened",
  resolved: "Resolved",
  rejected: "Closed",
};

export function findingStatusLabel(status: string): string {
  return FINDING_STATUS_LABELS[status] ?? humanizeToken(status);
}
