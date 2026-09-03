/**
 * Technical Query / RFI workflow — presentation and transitions on the canonical TQ entity.
 * Extra fields live in metadata when no dedicated column exists.
 */

export const TECHNICAL_QUERY_WORKFLOW_STATUSES = [
  "draft",
  "awaiting_response",
  "response_submitted",
  "under_review",
  "clarification_required",
  "accepted",
  "closed",
  "cancelled",
  "superseded",
] as const;

export type TechnicalQueryWorkflowStatus = (typeof TECHNICAL_QUERY_WORKFLOW_STATUSES)[number];

export const TECHNICAL_QUERY_CLASSIFICATIONS = [
  { value: "technical_clarification", label: "Technical Clarification" },
  { value: "drawing_clarification", label: "Drawing Clarification" },
  { value: "specification_clarification", label: "Specification Clarification" },
  { value: "scope_clarification", label: "Scope Clarification" },
  { value: "dimension_clarification", label: "Dimension Clarification" },
  { value: "information_request", label: "Information Request" },
  { value: "proposed_alternative", label: "Proposed Alternative" },
  { value: "design_change", label: "Design Change" },
  { value: "site_construction_query", label: "Site / Construction Query" },
  { value: "vendor_query", label: "Vendor Query" },
  { value: "interface_query", label: "Interface Query" },
  { value: "non_conformance_related", label: "Non-Conformance Related" },
  { value: "other", label: "Other" },
] as const;

export const TECHNICAL_QUERY_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Normal" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRawUuid(value: unknown): boolean {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

export function displayPersonName(input: {
  fullName?: string | null;
  email?: string | null;
  fallback?: string | null;
}): string {
  const name = input.fullName?.trim();
  if (name && !isRawUuid(name)) return name;
  const email = input.email?.trim();
  if (email && email.includes("@")) return email.split("@")[0] ?? "Unknown person";
  if (input.fallback && !isRawUuid(input.fallback)) return input.fallback;
  return "Unknown person";
}

export function displayPriority(value: string | null | undefined): string {
  const normalized = (value ?? "medium").toLowerCase();
  if (normalized === "medium" || normalized === "normal") return "Normal";
  if (normalized === "low") return "Low";
  if (normalized === "high") return "High";
  if (normalized === "critical") return "Critical";
  return "Normal";
}

export function persistPriority(value: string | null | undefined): string {
  const normalized = (value ?? "medium").toLowerCase();
  if (normalized === "normal") return "medium";
  if (normalized === "low" || normalized === "high" || normalized === "critical" || normalized === "medium") {
    return normalized;
  }
  return "medium";
}

export function displayWorkflowStatus(status: string | null | undefined): string {
  switch (normalizeWorkflowStatus(status)) {
    case "draft":
      return "Draft";
    case "awaiting_response":
      return "Awaiting Response";
    case "response_submitted":
      return "Response Submitted";
    case "under_review":
      return "Under Review";
    case "clarification_required":
      return "Clarification Required";
    case "accepted":
      return "Accepted";
    case "closed":
      return "Closed";
    case "cancelled":
      return "Cancelled";
    case "superseded":
      return "Superseded";
    default:
      return "Awaiting Response";
  }
}

export function normalizeWorkflowStatus(status: string | null | undefined): TechnicalQueryWorkflowStatus {
  const normalized = (status ?? "awaiting_response").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "draft") return "draft";
  if (normalized === "open" || normalized === "awaiting_response" || normalized === "submitted") return "awaiting_response";
  if (normalized === "responded" || normalized === "answered" || normalized === "response" || normalized === "response_submitted") {
    return "response_submitted";
  }
  if (normalized === "under_review" || normalized === "review") return "under_review";
  if (normalized === "clarification_required" || normalized === "clarification") return "clarification_required";
  if (normalized === "accepted") return "accepted";
  if (normalized === "closed" || normalized === "close") return "closed";
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled";
  if (normalized === "superseded") return "superseded";
  return "awaiting_response";
}

export function persistWorkflowStatus(status: string | null | undefined): string {
  return normalizeWorkflowStatus(status);
}

export type TechnicalQueryNextAction = {
  currentStatus: string;
  actionRequired: string;
  due: string | null;
  nextStep: string;
};

export function describeTechnicalQueryNextAction(input: {
  status?: string | null;
  initiatorName?: string | null;
  actionByName?: string | null;
  due?: string | null;
  assigned?: boolean;
}): TechnicalQueryNextAction {
  const status = normalizeWorkflowStatus(input.status);
  const actionBy = input.assigned ? (input.actionByName || "the assigned responder") : "Unassigned";
  const initiator = input.initiatorName || "the initiator";
  const due = input.due ?? null;
  if (status === "draft") {
    return {
      currentStatus: displayWorkflowStatus(status),
      actionRequired: `${initiator} to submit this technical query`,
      due,
      nextStep: "After submission, Action By receives the query for a technical response.",
    };
  }
  if (status === "awaiting_response" || status === "clarification_required") {
    return {
      currentStatus: displayWorkflowStatus(status),
      actionRequired: input.assigned
        ? `${actionBy} to provide technical response`
        : "Nobody is currently assigned to respond to this TQ.",
      due,
      nextStep: `Response will return to ${initiator} for review.`,
    };
  }
  if (status === "response_submitted" || status === "under_review") {
    return {
      currentStatus: displayWorkflowStatus(status),
      actionRequired: `${initiator} to review the technical response`,
      due,
      nextStep: "Accept the response to proceed to closeout, or request clarification.",
    };
  }
  if (status === "accepted") {
    return {
      currentStatus: displayWorkflowStatus(status),
      actionRequired: `${initiator} to complete closeout`,
      due,
      nextStep: "Confirm evidence, linked actions, and close the technical query.",
    };
  }
  return {
    currentStatus: displayWorkflowStatus(status),
    actionRequired: "No action required",
    due,
    nextStep: "This technical query is complete.",
  };
}

export function metadataRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function readTqMetadataString(metadata: unknown, key: string): string | null {
  const value = metadataRecord(metadata)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function daysOpen(createdAt?: string | null, closedAt?: string | null): number | null {
  if (!createdAt) return null;
  const start = new Date(createdAt).getTime();
  const end = closedAt ? new Date(closedAt).getTime() : Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

export function isOverdue(status: string | null | undefined, due?: string | null): boolean {
  const workflow = normalizeWorkflowStatus(status);
  if (!due || workflow === "closed" || workflow === "cancelled" || workflow === "superseded") return false;
  return new Date(`${due}T23:59:59`).getTime() < Date.now();
}

export type TechnicalQueryPerson = {
  id: string;
  name: string;
  role?: string | null;
  company?: string | null;
  discipline?: string | null;
};

export type TechnicalQueryReference = {
  objectType: string;
  objectId: string;
  relationship: string;
  number?: string | null;
  title?: string | null;
  revision?: string | null;
  status?: string | null;
  source?: string | null;
};

export type TechnicalQueryPresentation = {
  tqNumber: string;
  title: string;
  query: string;
  suggestedSolution: string | null;
  reason: string | null;
  clientResponse: string | null;
  responseBasis: string | null;
  qualifications: string | null;
  followUpActions: string | null;
  closeoutComments: string | null;
  status: TechnicalQueryWorkflowStatus;
  statusLabel: string;
  priority: string;
  priorityValue: string;
  classification: string | null;
  classificationLabel: string | null;
  area: string | null;
  system: string | null;
  subsystem: string | null;
  workPackage: string | null;
  contractPackage: string | null;
  originatingCompany: string | null;
  respondingCompany: string | null;
  externalReference: string | null;
  projectName: string | null;
  disciplineName: string | null;
  assetLabel: string | null;
  initiator: TechnicalQueryPerson | null;
  actionBy: TechnicalQueryPerson | null;
  reviewer: TechnicalQueryPerson | null;
  approver: TechnicalQueryPerson | null;
  watchers: TechnicalQueryPerson[];
  due: string | null;
  dateRaised: string | null;
  responseSubmittedAt: string | null;
  acceptedAt: string | null;
  closedAt: string | null;
  ageDays: number | null;
  overdue: boolean;
  lastActivity: string | null;
  assigned: boolean;
  queryLocked: boolean;
  nextAction: TechnicalQueryNextAction;
};

function metadataString(metadata: Record<string, unknown>, key: string): string | null {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function classificationLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const found = TECHNICAL_QUERY_CLASSIFICATIONS.find((item) => item.value === value);
  if (found) return found.label;
  return value.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function presentTechnicalQuery(input: {
  row: Record<string, unknown>;
  people?: Map<string, TechnicalQueryPerson>;
  projectName?: string | null;
  disciplineName?: string | null;
  assetLabel?: string | null;
}): TechnicalQueryPresentation {
  const row = input.row;
  const metadata = metadataRecord(row.metadata);
  const people = input.people ?? new Map<string, TechnicalQueryPerson>();
  const initiatorId = typeof row.requester_id === "string" ? row.requester_id : null;
  const actionById =
    (typeof row.assigned_to === "string" && row.assigned_to) ||
    (typeof row.responder_id === "string" && row.responder_id) ||
    null;
  const reviewerId = metadataString(metadata, "reviewer_user_id");
  const approverId = metadataString(metadata, "approver_user_id");
  const watcherIds = Array.isArray(metadata.watchers)
    ? metadata.watchers.filter((id): id is string => typeof id === "string")
    : [];
  const status = normalizeWorkflowStatus(typeof row.status === "string" ? row.status : null);
  const due =
    (typeof row.response_due === "string" && row.response_due) ||
    (typeof row.due_date === "string" && row.due_date) ||
    null;
  const initiator = initiatorId ? people.get(initiatorId) ?? null : null;
  const actionBy = actionById ? people.get(actionById) ?? null : null;
  const assigned = Boolean(actionById);
  return {
    tqNumber: String(row.tq_number ?? ""),
    title: String(row.title ?? row.question ?? "Untitled technical query"),
    query: String(row.question ?? ""),
    suggestedSolution: metadataString(metadata, "suggested_solution"),
    reason: typeof row.description === "string" ? row.description : metadataString(metadata, "reason"),
    clientResponse: typeof row.response === "string" && row.response.trim() ? row.response : null,
    responseBasis: metadataString(metadata, "response_basis"),
    qualifications: metadataString(metadata, "qualifications"),
    followUpActions: metadataString(metadata, "follow_up_actions"),
    closeoutComments: metadataString(metadata, "closeout_comments"),
    status,
    statusLabel: displayWorkflowStatus(status),
    priority: displayPriority(typeof row.priority === "string" ? row.priority : null),
    priorityValue: persistPriority(typeof row.priority === "string" ? row.priority : null),
    classification: metadataString(metadata, "classification"),
    classificationLabel: classificationLabel(metadataString(metadata, "classification")),
    area: metadataString(metadata, "area"),
    system: metadataString(metadata, "system"),
    subsystem: metadataString(metadata, "subsystem"),
    workPackage: metadataString(metadata, "work_package"),
    contractPackage: metadataString(metadata, "contract_package"),
    originatingCompany: metadataString(metadata, "originating_company"),
    respondingCompany: metadataString(metadata, "responding_company"),
    externalReference: metadataString(metadata, "external_reference"),
    projectName: input.projectName ?? null,
    disciplineName: input.disciplineName ?? null,
    assetLabel: input.assetLabel ?? null,
    initiator,
    actionBy,
    reviewer: reviewerId ? people.get(reviewerId) ?? null : null,
    approver: approverId ? people.get(approverId) ?? null : null,
    watchers: watcherIds.map((id) => people.get(id)).filter((person): person is TechnicalQueryPerson => Boolean(person)),
    due,
    dateRaised: typeof row.created_at === "string" ? row.created_at : null,
    responseSubmittedAt: metadataString(metadata, "response_submitted_at"),
    acceptedAt: metadataString(metadata, "accepted_at"),
    closedAt: typeof row.closed_date === "string" ? row.closed_date : metadataString(metadata, "closed_at"),
    ageDays: daysOpen(typeof row.created_at === "string" ? row.created_at : null, typeof row.closed_date === "string" ? row.closed_date : null),
    overdue: isOverdue(status, due),
    lastActivity: typeof row.updated_at === "string" ? row.updated_at : null,
    assigned,
    queryLocked: status !== "draft",
    nextAction: describeTechnicalQueryNextAction({
      status,
      initiatorName: initiator?.name,
      actionByName: actionBy?.name,
      due,
      assigned,
    }),
  };
}

export function personDisplayLine(person: TechnicalQueryPerson | null | undefined, unassigned = "Unassigned"): string {
  if (!person) return unassigned;
  const extras = [person.role, person.company, person.discipline].filter(Boolean);
  return extras.length ? `${person.name} — ${extras.join(" · ")}` : person.name;
}

export const TQ_RESPONSE_TERMINOLOGY = {
  responseSection: "Client / Technical Response",
  responseField: "Technical Response",
} as const;

export function isClosedWorkflow(status: string | null | undefined): boolean {
  const workflow = normalizeWorkflowStatus(status);
  return workflow === "closed" || workflow === "cancelled" || workflow === "superseded";
}

export function matchesRegisterView(
  row: Record<string, unknown>,
  view: string | null | undefined,
  actorUserId?: string | null,
): boolean {
  const status = normalizeWorkflowStatus(typeof row.status === "string" ? row.status : null);
  const due =
    (typeof row.response_due === "string" && row.response_due) ||
    (typeof row.due_date === "string" && row.due_date) ||
    null;
  const assignedTo = typeof row.assigned_to === "string" ? row.assigned_to : null;
  switch (view) {
    case "mine":
    case "my_actions":
      return Boolean(actorUserId && assignedTo === actorUserId && !isClosedWorkflow(status));
    case "awaiting":
    case "awaiting_response":
      return status === "awaiting_response" || status === "clarification_required";
    case "overdue":
      return isOverdue(status, due);
    case "closed":
      return isClosedWorkflow(status) || status === "accepted";
    default:
      return true;
  }
}
