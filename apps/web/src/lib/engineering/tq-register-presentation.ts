import {
  tqQueryImageCount,
  tqQueryLooksLikeHtml,
  tqQueryPlainText,
  tqQueryRegisterSummary,
  tqQuerySafeTitle,
} from "@rtb/engineering-os/browser";
import type { StatusChipStatus } from "@rtb/ui";

export const TQ_REGISTER_VIEWS = [
  { id: "all", label: "All" },
  { id: "my_actions", label: "My Actions" },
  { id: "awaiting_response", label: "Awaiting Response" },
  { id: "overdue", label: "Overdue" },
  { id: "closed", label: "Closed" },
] as const;

export type TqRegisterViewId = (typeof TQ_REGISTER_VIEWS)[number]["id"];

export type TqRegisterRow = {
  id: string;
  href: string;
  tqNumber: string;
  title: string;
  querySummary: string;
  fullTitle: string;
  projectLabel: string;
  disciplineLabel: string;
  statusKey: string;
  statusLabel: string;
  statusChip: StatusChipStatus;
  initiatorLabel: string;
  actionByLabel: string;
  dueLabel: string;
  ageLabel: string;
  priorityLabel: string;
  priorityChip: StatusChipStatus;
  lastActivityLabel: string;
  overdue: boolean;
  isDraft: boolean;
  isOwnedDraft: boolean;
  imageCount: number;
  attachmentCount: number;
  searchText: string;
  projectId: string;
  disciplineId: string;
  initiatorId: string;
  actionById: string;
  priority: string;
  status: string;
  dueSort: string;
  updatedSort: string;
};

const CLOSED = new Set(["closed", "accepted"]);
const AWAITING = new Set(["open", "awaiting_response", "awaiting-response"]);
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
const API_PATH_RE = /\/api\/engineering\//i;
const HTML_LEAK_RE = /<\/?[a-z][\s\S]*>|class\s*=|data-document-id/i;

export function asMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function stringField(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function formatTqDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatTqDateTime(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ageDays(createdAt: string): number | null {
  if (!createdAt) return null;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return null;
  return Math.max(0, Math.floor((Date.now() - created) / 86_400_000));
}

export function isTqOverdue(row: Record<string, unknown>, now = new Date()): boolean {
  const status = stringField(row, "status").toLowerCase();
  if (CLOSED.has(status)) return false;
  const due = stringField(row, "response_due", "due_date");
  if (!due) return false;
  const dueDate = new Date(due);
  if (Number.isNaN(dueDate.getTime())) return false;
  const endOfDue = new Date(dueDate);
  endOfDue.setHours(23, 59, 59, 999);
  return endOfDue.getTime() < now.getTime();
}

export function tqStatusPresentation(
  status: string,
  overdue: boolean,
): { key: string; label: string; chip: StatusChipStatus } {
  const key = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (overdue && key !== "closed" && key !== "accepted") {
    return { key: "overdue", label: "Overdue", chip: "overdue" };
  }
  switch (key) {
    case "draft":
      return { key, label: "Draft", chip: "pending" };
    case "open":
    case "awaiting_response":
      return { key: "awaiting_response", label: "Awaiting Response", chip: "open" };
    case "response_submitted":
      return { key, label: "Response Submitted", chip: "pending" };
    case "clarification_required":
    case "under_review":
      return { key: "clarification_required", label: "Clarification Required", chip: "high" };
    case "accepted":
      return { key, label: "Accepted", chip: "approved" };
    case "closed":
      return { key, label: "Closed", chip: "closed" };
    default:
      return { key: key || "unknown", label: status.trim() || "—", chip: "neutral" };
  }
}

export function tqPriorityPresentation(priority: string): { label: string; chip: StatusChipStatus } {
  const key = priority.trim().toLowerCase();
  if (key === "critical") return { label: "Critical", chip: "critical" };
  if (key === "high") return { label: "High", chip: "high" };
  if (key === "low") return { label: "Low", chip: "low" };
  if (key === "medium" || key === "normal") return { label: "Normal", chip: "medium" };
  return { label: priority.trim() || "—", chip: "neutral" };
}

export function tqPersonLabel(id: string, currentUserId: string | null, empty: string): string {
  if (!id) return empty;
  if (currentUserId && id === currentUserId) return "You";
  if (empty === "Unassigned") return "Assigned";
  if (empty === "Participant") return "Participant";
  return "—";
}

export function tqNextAction(status: string, overdue: boolean): string {
  const key = status.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (key === "draft") return "Edit and submit this technical query";
  if (overdue) return "Overdue — response still required";
  if (key === "closed" || key === "accepted") return "No further action";
  if (key === "response_submitted") return "Review the technical response";
  if (key === "clarification_required") return "Clarification required";
  return "Technical response required";
}

export function projectTqRegisterRow(
  row: Record<string, unknown>,
  ctx: {
    currentUserId: string | null;
    projectNames: Record<string, string>;
    disciplineNames: Record<string, string>;
  },
): TqRegisterRow {
  const id = stringField(row, "id");
  const question = stringField(row, "question");
  const title = tqQuerySafeTitle(stringField(row, "title"), question);
  const querySummary = tqQueryRegisterSummary(question || stringField(row, "description"));
  const status = stringField(row, "status") || "open";
  const overdue = isTqOverdue(row);
  const statusView = tqStatusPresentation(status, overdue);
  const priority = stringField(row, "priority") || "medium";
  const priorityView = tqPriorityPresentation(priority);
  const projectId = stringField(row, "project_id");
  const disciplineId = stringField(row, "discipline_id");
  const initiatorId = stringField(row, "requester_id", "created_by");
  const actionById = stringField(row, "assigned_to", "responder_id");
  const due = stringField(row, "response_due", "due_date");
  const createdAt = stringField(row, "created_at");
  const updatedAt = stringField(row, "updated_at", "created_at");
  const age = ageDays(createdAt);
  const isDraft = status.toLowerCase() === "draft";
  const imageCount = tqQueryImageCount(question);
  const attachmentCount = stringField(row, "document_id") ? 1 : 0;

  return {
    id,
    href: `/engineering/technical-queries/${id}`,
    tqNumber: stringField(row, "tq_number") || "TQ",
    title,
    querySummary,
    fullTitle: title,
    projectLabel: (projectId && ctx.projectNames[projectId]) || "—",
    disciplineLabel: (disciplineId && ctx.disciplineNames[disciplineId]) || "—",
    statusKey: statusView.key,
    statusLabel: statusView.label,
    statusChip: statusView.chip,
    initiatorLabel: tqPersonLabel(initiatorId, ctx.currentUserId, "—"),
    actionByLabel: tqPersonLabel(actionById, ctx.currentUserId, "Unassigned"),
    dueLabel: formatTqDate(due),
    ageLabel: age == null ? "—" : `${age}d`,
    priorityLabel: priorityView.label,
    priorityChip: priorityView.chip,
    lastActivityLabel: formatTqDate(updatedAt),
    overdue,
    isDraft,
    isOwnedDraft: isDraft && Boolean(ctx.currentUserId && initiatorId === ctx.currentUserId),
    imageCount,
    attachmentCount,
    searchText: [stringField(row, "tq_number"), title, querySummary].join(" ").toLowerCase(),
    projectId,
    disciplineId,
    initiatorId,
    actionById,
    priority: priority.toLowerCase(),
    status: status.toLowerCase(),
    dueSort: due,
    updatedSort: updatedAt,
  };
}

export function rowMatchesView(row: TqRegisterRow, view: TqRegisterViewId, currentUserId: string | null): boolean {
  if (view === "all") return true;
  if (view === "closed") return row.status === "closed" || row.status === "accepted";
  if (view === "overdue") return row.overdue;
  if (view === "awaiting_response") return AWAITING.has(row.status) && !row.overdue;
  if (view === "my_actions") {
    if (!currentUserId) return false;
    if (row.status === "closed" || row.status === "accepted") return false;
    return row.actionById === currentUserId || row.initiatorId === currentUserId;
  }
  return true;
}

export function tqSignalCounts(rows: TqRegisterRow[], currentUserId: string | null) {
  return {
    open: rows.filter((row) => row.status !== "closed" && row.status !== "accepted").length,
    awaiting: rows.filter((row) => AWAITING.has(row.status)).length,
    overdue: rows.filter((row) => row.overdue).length,
    high: rows.filter(
      (row) => (row.priority === "high" || row.priority === "critical") && row.status !== "closed",
    ).length,
    mine: rows.filter(
      (row) =>
        currentUserId &&
        row.status !== "closed" &&
        row.status !== "accepted" &&
        (row.actionById === currentUserId || row.initiatorId === currentUserId),
    ).length,
  };
}

export function tqVisibleLeakCount(text: string): { html: number; uuid: number; api: number } {
  return {
    html: HTML_LEAK_RE.test(text) || tqQueryLooksLikeHtml(text) ? 1 : 0,
    uuid: UUID_RE.test(text) ? 1 : 0,
    api: API_PATH_RE.test(text) ? 1 : 0,
  };
}

export function tqRegisterVisibleText(row: TqRegisterRow): string {
  return [
    row.tqNumber,
    row.title,
    row.querySummary,
    row.projectLabel,
    row.disciplineLabel,
    row.statusLabel,
    row.initiatorLabel,
    row.actionByLabel,
    row.dueLabel,
    row.ageLabel,
    row.priorityLabel,
    row.lastActivityLabel,
    row.imageCount ? `${row.imageCount} image` : "",
    row.attachmentCount ? `${row.attachmentCount} attachment` : "",
  ].join(" ");
}

export function tqDetailPanels(row: Record<string, unknown>) {
  const metadata = asMetadata(row.metadata);
  const question = stringField(row, "question");
  return {
    query: question,
    suggestedSolution: stringField(metadata, "suggested_solution") || stringField(row, "description"),
    response: stringField(row, "response") || stringField(metadata, "response"),
    responseBasis: stringField(metadata, "response_basis"),
    closeout: stringField(metadata, "closeout_comments") || stringField(metadata, "closeout"),
    queryPlain: tqQueryPlainText(question),
  };
}
