/**
 * Bounded Command Centre composition over already-loaded canonical inspection rows.
 * Reuses II-3 deterministic intelligence. Does not invent health, risk, or remaining life.
 */
import { computeDeterministicIntelligence } from "../domain/deterministic-intelligence";
import type {
  CommandCentreAttentionItem,
  CommandCentreListItem,
  CommandCentreMetricCard,
  CommandCentreProvenance,
  InspectionCommandCentreView,
} from "./types";

const PLAN_ACTIVE_STATUSES = new Set(["planned", "scheduled", "assigned"]);
const SESSION_IN_PROGRESS_STATUSES = new Set(["assigned", "started", "paused"]);
const SESSION_RECENT_STATUSES = new Set([
  "completed",
  "submitted",
  "reviewed",
  "approved",
  "verified",
  "closed",
]);
const CLOSED_DEFECT = new Set(["closed", "cancelled"]);

const BASE = "/engineering/apps/inspection-intelligence";
const LIST_CAP = 20;
const ID_CAP = 20;

export type CommandCentreComposeInput = {
  plans: Array<Record<string, unknown>>;
  sessions: Array<Record<string, unknown>>;
  evidence: Array<Record<string, unknown>>;
  defects: Array<Record<string, unknown>>;
  correctiveActions: Array<Record<string, unknown>>;
  verifications: Array<Record<string, unknown>>;
  conditionRatings: Array<Record<string, unknown>>;
  reports: Array<Record<string, unknown>>;
  generatedAt?: string;
  canWrite?: boolean;
};

function rowId(row: Record<string, unknown>): string {
  return String(row.id ?? row.rating_id ?? "");
}

function rowTitle(row: Record<string, unknown>, fallback: string): string {
  return String(row.title ?? row.report_key ?? row.status ?? fallback);
}

function provenance(table: string, ids: readonly string[], indicatorId?: string, field?: string): CommandCentreProvenance {
  return {
    table,
    indicatorId,
    field,
    provenanceIds: ids.slice(0, ID_CAP),
    storesCanonicalCopy: false,
    aiDerived: false,
  };
}

function asTargets(value: unknown): Array<{ kind?: string; canonicalId?: string; snapshot?: { label?: string } }> {
  return Array.isArray(value) ? (value as Array<{ kind?: string; canonicalId?: string; snapshot?: { label?: string } }>) : [];
}

function targetSummary(row: Record<string, unknown>): string | undefined {
  const targets = asTargets(row.targets);
  if (!targets.length) return undefined;
  return targets
    .map((target) => target.snapshot?.label || target.kind || "Unset target")
    .join(" · ");
}

function sessionHref(id: string): string {
  return `${BASE}/sessions/${id}`;
}

function planHref(id: string): string {
  return `${BASE}/plans/${id}`;
}

function listItems(
  rows: Array<Record<string, unknown>>,
  hrefFor: (row: Record<string, unknown>) => string,
  fallbackTitle: string,
): CommandCentreListItem[] {
  return rows.slice(0, LIST_CAP).map((row) => ({
    id: rowId(row),
    title: rowTitle(row, fallbackTitle),
    status: row.status ? String(row.status) : undefined,
    href: hrefFor(row),
    at: String(row.updated_at ?? row.generated_at ?? row.recorded_at ?? ""),
    summary: targetSummary(row),
  }));
}

export function composeInspectionCommandCentre(input: CommandCentreComposeInput): InspectionCommandCentreView {
  const intelligence = computeDeterministicIntelligence({
    defects: input.defects,
    correctiveActions: input.correctiveActions,
    verifications: input.verifications,
    sessions: input.sessions,
    evidence: input.evidence,
    conditionRatings: input.conditionRatings,
  });

  const planned = input.plans.filter((row) => PLAN_ACTIVE_STATUSES.has(String(row.status)));
  const inProgress = input.sessions.filter((row) => SESSION_IN_PROGRESS_STATUSES.has(String(row.status)));
  const recentlyCompleted = input.sessions
    .filter((row) => SESSION_RECENT_STATUSES.has(String(row.status)))
    .slice(0, LIST_CAP);
  const recentActivity = [...input.sessions]
    .sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? "")))
    .slice(0, LIST_CAP);
  const recentReports = [...input.reports]
    .sort((a, b) => String(b.generated_at ?? "").localeCompare(String(a.generated_at ?? "")))
    .slice(0, LIST_CAP);

  const openDefects = input.defects.filter((row) => row.status && !CLOSED_DEFECT.has(String(row.status)));
  const ratingEntries = Object.entries(intelligence.conditionRatingDistribution.counts);

  const cards: CommandCentreMetricCard[] = [
    {
      id: "inspections_planned",
      label: "Inspections planned",
      value: String(planned.length),
      href: `${BASE}/plans`,
      provenance: provenance("inspection_plans", planned.map(rowId), undefined, "status"),
      items: listItems(planned, (row) => planHref(rowId(row)), "Plan"),
    },
    {
      id: "inspections_in_progress",
      label: "Inspections in progress",
      value: String(inProgress.length),
      href: `${BASE}/sessions`,
      provenance: provenance("inspection_sessions", inProgress.map(rowId), undefined, "status"),
      items: listItems(inProgress, (row) => sessionHref(rowId(row)), "Session"),
    },
    {
      id: "inspections_recently_completed",
      label: "Recently completed inspections",
      value: String(recentlyCompleted.length),
      href: `${BASE}/history`,
      provenance: provenance("inspection_sessions", recentlyCompleted.map(rowId), undefined, "status"),
      items: listItems(recentlyCompleted, (row) => sessionHref(rowId(row)), "Session"),
    },
    {
      id: "open_defects",
      label: "Open defects",
      value: String(intelligence.openDefectCount.value),
      hint: intelligence.openDefectCount.unknownStatus
        ? `${intelligence.openDefectCount.unknownStatus} unknown status`
        : undefined,
      href: `${BASE}/defects`,
      provenance: provenance(
        "inspection_defects",
        intelligence.openDefectCount.provenanceIds,
        "open_defect_count",
        "status",
      ),
      items: listItems(openDefects, (row) => `${BASE}/defects/${rowId(row)}`, "Defect"),
    },
    {
      id: "unverified_defects",
      label: "Unverified defects",
      value: String(intelligence.unverifiedDefects.value),
      href: `${BASE}/defects`,
      provenance: provenance(
        "inspection_defects",
        intelligence.unverifiedDefects.provenanceIds,
        "unverified_defects",
      ),
      items: intelligence.unverifiedDefects.provenanceIds.slice(0, LIST_CAP).map((id) => ({
        id,
        title: "Unverified defect",
        href: `${BASE}/defects/${id}`,
      })),
    },
    {
      id: "outstanding_corrective_actions",
      label: "Outstanding inspection corrective actions",
      value: String(intelligence.outstandingCorrectiveActions.value),
      hint: intelligence.outstandingCorrectiveActions.note,
      href: `${BASE}/actions`,
      provenance: provenance(
        "inspection_corrective_actions",
        intelligence.outstandingCorrectiveActions.provenanceIds,
        "outstanding_corrective_actions",
        "status",
      ),
      items: listItems(
        input.correctiveActions.filter((row) => intelligence.outstandingCorrectiveActions.provenanceIds.includes(rowId(row))),
        (row) => `${BASE}/actions`,
        "Corrective action",
      ),
    },
    {
      id: "inspections_awaiting_verification",
      label: "Inspections awaiting verification",
      value: String(intelligence.inspectionsAwaitingVerification.pendingVerifications),
      hint: `${intelligence.inspectionsAwaitingVerification.sessions} session(s)`,
      href: `${BASE}/review`,
      provenance: provenance(
        "inspection_verifications",
        intelligence.inspectionsAwaitingVerification.verificationIds,
        "inspections_awaiting_verification",
        "status",
      ),
      items: intelligence.inspectionsAwaitingVerification.sessionIds.slice(0, LIST_CAP).map((id) => ({
        id,
        title: "Session awaiting verification",
        href: sessionHref(id),
      })),
    },
    {
      id: "condition_rating_distribution",
      label: "Recorded condition-rating distribution",
      value: String(intelligence.conditionRatingDistribution.recordedRatings),
      hint:
        ratingEntries.length > 0
          ? ratingEntries.map(([key, count]) => `${key}: ${count}`).join(" · ")
          : intelligence.conditionRatingDistribution.note,
      href: `${BASE}/condition`,
      provenance: provenance(
        "inspection_condition_ratings",
        input.conditionRatings.map(rowId),
        "condition_rating_distribution",
      ),
      items: listItems(input.conditionRatings, (row) => `${BASE}/condition`, "Condition rating"),
    },
    {
      id: "evidence_completeness",
      label: "Evidence completeness",
      value: `${intelligence.evidenceCompleteness.withoutRegisteredEvidence} / ${intelligence.evidenceCompleteness.inProgressSessions}`,
      hint: intelligence.evidenceCompleteness.note,
      href: `${BASE}/evidence`,
      provenance: provenance(
        "inspection_evidence",
        intelligence.evidenceCompleteness.withoutEvidenceSessionIds,
        "evidence_completeness",
      ),
      items: intelligence.evidenceCompleteness.withoutEvidenceSessionIds.slice(0, LIST_CAP).map((id) => ({
        id,
        title: "In-progress session without registered evidence",
        href: sessionHref(id),
      })),
    },
    {
      id: "recent_inspection_activity",
      label: "Recent inspection activity",
      value: String(recentActivity.length),
      href: `${BASE}/history`,
      provenance: provenance("inspection_sessions", recentActivity.map(rowId), undefined, "updated_at"),
      items: listItems(recentActivity, (row) => sessionHref(rowId(row)), "Session"),
    },
    {
      id: "recent_reports",
      label: "Recent reports",
      value: String(recentReports.length),
      href: `${BASE}/reports`,
      provenance: provenance("inspection_reporting_outputs", recentReports.map(rowId)),
      items: listItems(recentReports, (row) => `${BASE}/reports/${rowId(row)}`, "Report"),
    },
  ];

  const attentionItems: CommandCentreAttentionItem[] = [];
  const seen = new Set<string>();
  const push = (item: CommandCentreAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    attentionItems.push(item);
  };

  for (const sessionId of intelligence.evidenceCompleteness.withoutEvidenceSessionIds.slice(0, LIST_CAP)) {
    push({
      id: `no_evidence:${sessionId}`,
      reasonCode: "in_progress_without_registered_evidence",
      explanation: "An in-progress session has no registered evidence row. That is unset, not a failed result.",
      href: sessionHref(sessionId),
      provenance: provenance("inspection_evidence", [sessionId], "evidence_completeness"),
    });
  }

  for (const sessionId of intelligence.conditionRatingDistribution.unratedSessionIds.filter((id) =>
    inProgress.some((row) => rowId(row) === id),
  ).slice(0, LIST_CAP)) {
    push({
      id: `unrated:${sessionId}`,
      reasonCode: "in_progress_session_unrated",
      explanation: "An in-progress session has no recorded condition rating. Unrated remains unrated.",
      href: `${BASE}/condition`,
      provenance: provenance("inspection_condition_ratings", [sessionId], "condition_rating_distribution"),
    });
  }

  for (const row of input.verifications.filter((item) => item.status === "pending").slice(0, LIST_CAP)) {
    const verificationId = rowId(row);
    const sessionId = row.session_id ? String(row.session_id) : undefined;
    push({
      id: `verification:${verificationId}`,
      reasonCode: "pending_verification",
      explanation: "A verification row is recorded as pending.",
      href: sessionId ? sessionHref(sessionId) : `${BASE}/review`,
      provenance: provenance("inspection_verifications", [verificationId], "inspections_awaiting_verification"),
    });
  }

  for (const defect of openDefects.slice(0, LIST_CAP)) {
    push({
      id: `open_defect:${rowId(defect)}`,
      reasonCode: "open_inspection_defect",
      explanation: "An inspection defect is recorded in a non-closed status.",
      href: `${BASE}/defects/${rowId(defect)}`,
      provenance: provenance("inspection_defects", [rowId(defect)], "open_defect_count"),
    });
  }

  const targetKeys = new Map<string, { kind: string; canonicalId: string; label: string; sessionId: string }>();
  const attentionSessionIds = new Set([
    ...intelligence.evidenceCompleteness.withoutEvidenceSessionIds,
    ...intelligence.inspectionsAwaitingVerification.sessionIds,
    ...openDefects.map((row) => String(row.session_id ?? "")),
  ]);
  for (const session of input.sessions) {
    if (!attentionSessionIds.has(rowId(session))) continue;
    for (const target of asTargets(session.targets)) {
      if (!target.kind || !target.canonicalId) continue;
      const key = `${target.kind}:${target.canonicalId}`;
      if (targetKeys.has(key)) continue;
      targetKeys.set(key, {
        kind: target.kind,
        canonicalId: target.canonicalId,
        label: target.snapshot?.label || `${target.kind} ${target.canonicalId}`,
        sessionId: rowId(session),
      });
    }
  }

  const targetItems: CommandCentreListItem[] = [...targetKeys.values()].slice(0, LIST_CAP).map((target) => ({
    id: `${target.kind}:${target.canonicalId}`,
    title: target.label,
    href: `${BASE}/history/targets/${encodeURIComponent(target.kind)}/${encodeURIComponent(target.canonicalId)}`,
    summary: "Recorded operational follow-up from hosted inspection state",
  }));

  cards.push({
    id: "targets_requiring_attention",
    label: "Inspection targets requiring attention",
    value: String(targetItems.length),
    hint: "Derived from recorded defects, pending verification, or unset evidence — not a risk score.",
    href: `${BASE}/history`,
    provenance: provenance(
      "inspection_sessions",
      [...attentionSessionIds].filter(Boolean).slice(0, ID_CAP),
    ),
    items: targetItems,
  });

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    storesCanonicalCopy: false,
    aiMetricsIncluded: false,
    healthScore: null,
    riskProbability: null,
    remainingLife: null,
    canWrite: Boolean(input.canWrite),
    cards,
    attentionItems,
    limitations: [
      "Counts are from hosted inspection_* records the caller can already read.",
      "Missing values stay unknown. They are not scored as healthy or pass.",
      "AI Inspection Engineer may explain these counts. It is not a source of these metrics.",
      "Inspection corrective actions are process records, not Engineering Core actions.",
    ],
  };
}
