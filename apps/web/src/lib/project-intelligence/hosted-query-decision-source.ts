import {
  type CommandCentreAvailability,
  type CommandCentreScope,
  type ActionSourceSlice,
  type CanonicalActionRef,
  type CanonicalDecisionRef,
  type CanonicalQueryRef,
  type DecisionSourceSlice,
  type QueryDecisionIntelligencePort,
  type QueryDecisionSourceSnapshot,
  type QuerySourceSlice,
  completenessFromPageSize,
  REGISTER_LIST_PAGE_LIMIT,
} from "@rtb/project-intelligence";
import type { CommerceExecutionContext } from "@rtb/types";
import type { AuthContext } from "@/lib/kernel";

const CLOSED_STATUSES = new Set([
  "closed",
  "complete",
  "completed",
  "cancelled",
  "canceled",
  "archived",
  "resolved",
  "rejected",
  "approved",
  "answered",
  "mitigated",
  "done",
]);

function classifyFailure(error: unknown): CommandCentreAvailability {
  const message = error instanceof Error ? error.message : String(error);
  if (/permission|rls|forbidden|not authorized|jwt/i.test(message)) return "forbidden";
  return "error";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function inWorkspace(row: unknown, workspaceId: string): boolean {
  const data = asRecord(row);
  const rowWorkspace = data.workspace_id;
  if (!rowWorkspace) return true;
  return String(rowWorkspace) === workspaceId;
}

function openFrom(status: string): boolean {
  return !CLOSED_STATUSES.has(status.toLowerCase());
}

function mapQuery(row: unknown): CanonicalQueryRef {
  const data = asRecord(row);
  const status = String(data.status ?? "open");
  return {
    id: String(data.id),
    number: data.tq_number === undefined || data.tq_number === null ? undefined : String(data.tq_number),
    title: data.title === undefined || data.title === null ? undefined : String(data.title),
    status,
    open: openFrom(status),
    priority: data.priority === undefined || data.priority === null ? undefined : String(data.priority),
    ownerId: data.owner_id === undefined || data.owner_id === null ? undefined : String(data.owner_id),
    assignedTo: data.assigned_to === undefined || data.assigned_to === null ? undefined : String(data.assigned_to),
    raisedBy: data.created_by === undefined || data.created_by === null ? undefined : String(data.created_by),
    requesterId: data.requester_id === undefined || data.requester_id === null ? undefined : String(data.requester_id),
    responderId: data.responder_id === undefined || data.responder_id === null ? undefined : String(data.responder_id),
    dueAt: data.due_date === undefined || data.due_date === null ? undefined : String(data.due_date),
    responseDue: data.response_due === undefined || data.response_due === null ? undefined : String(data.response_due),
    createdAt: data.created_at === undefined || data.created_at === null ? undefined : String(data.created_at),
    closedAt: data.closed_date === undefined || data.closed_date === null ? undefined : String(data.closed_date),
    updatedAt: data.updated_at === undefined || data.updated_at === null ? undefined : String(data.updated_at),
    disciplineId: data.discipline_id === undefined || data.discipline_id === null ? undefined : String(data.discipline_id),
    storesCanonicalCopy: false,
  };
}

function mapDecision(row: unknown): CanonicalDecisionRef {
  const data = asRecord(row);
  const status = String(data.status ?? "draft");
  return {
    id: String(data.id),
    number: data.decision_number === undefined || data.decision_number === null ? undefined : String(data.decision_number),
    title: data.title === undefined || data.title === null ? undefined : String(data.title),
    status,
    open: openFrom(status),
    priority: data.priority === undefined || data.priority === null ? undefined : String(data.priority),
    ownerId: data.owner_id === undefined || data.owner_id === null ? undefined : String(data.owner_id),
    assignedTo: data.assigned_to === undefined || data.assigned_to === null ? undefined : String(data.assigned_to),
    raisedBy: data.created_by === undefined || data.created_by === null ? undefined : String(data.created_by),
    approvalStatus:
      data.approval_status === undefined || data.approval_status === null ? undefined : String(data.approval_status),
    reviewStatus: data.review_status === undefined || data.review_status === null ? undefined : String(data.review_status),
    dueAt: data.due_date === undefined || data.due_date === null ? undefined : String(data.due_date),
    createdAt: data.created_at === undefined || data.created_at === null ? undefined : String(data.created_at),
    decisionDate: data.decision_date === undefined || data.decision_date === null ? undefined : String(data.decision_date),
    closedAt: data.closed_date === undefined || data.closed_date === null ? undefined : String(data.closed_date),
    updatedAt: data.updated_at === undefined || data.updated_at === null ? undefined : String(data.updated_at),
    storesCanonicalCopy: false,
  };
}

function mapAction(row: unknown): CanonicalActionRef {
  const data = asRecord(row);
  const status = String(data.status ?? "open");
  return {
    id: String(data.id),
    number: data.action_number === undefined || data.action_number === null ? undefined : String(data.action_number),
    title: data.title === undefined || data.title === null ? undefined : String(data.title),
    status,
    open: openFrom(status),
    priority: data.priority === undefined || data.priority === null ? undefined : String(data.priority),
    ownerId: data.owner_id === undefined || data.owner_id === null ? undefined : String(data.owner_id),
    assignedTo: data.assigned_to === undefined || data.assigned_to === null ? undefined : String(data.assigned_to),
    dueAt: data.due_date === undefined || data.due_date === null ? undefined : String(data.due_date),
    createdAt: data.created_at === undefined || data.created_at === null ? undefined : String(data.created_at),
    closedAt: data.closed_date === undefined || data.closed_date === null ? undefined : String(data.closed_date),
    updatedAt: data.updated_at === undefined || data.updated_at === null ? undefined : String(data.updated_at),
    originatingObjectType:
      data.originating_object_type === undefined || data.originating_object_type === null
        ? undefined
        : String(data.originating_object_type),
    originatingObjectId:
      data.originating_object_id === undefined || data.originating_object_id === null
        ? undefined
        : String(data.originating_object_id),
    storesCanonicalCopy: false,
  };
}

export class HostedQueryDecisionIntelligenceSource implements QueryDecisionIntelligencePort {
  readonly sourceDomain = "engineering_core" as const;
  readonly mutatesCanonicalState = false as const;
  readonly storesQueryRegister = false as const;
  readonly storesDecisionRegister = false as const;
  readonly storesActionRegister = false as const;
  readonly mutatesQuery = false as const;
  readonly mutatesDecision = false as const;
  readonly mutatesAction = false as const;

  constructor(
    private readonly ctx: AuthContext,
    private readonly commerce: CommerceExecutionContext,
  ) {}

  async load(scope: CommandCentreScope): Promise<QueryDecisionSourceSnapshot> {
    const [query, decision, action] = await Promise.all([
      this.loadQueries(scope),
      this.loadDecisions(scope),
      this.loadActions(scope),
    ]);
    return { query, decision, action };
  }

  private async loadQueries(scope: CommandCentreScope): Promise<QuerySourceSlice> {
    try {
      const rows = (
        await this.ctx.engineering.technicalQueries.list(this.commerce, scope.tenantId, scope.projectId)
      ).filter((row) => inWorkspace(row, scope.workspaceId));
      const items = rows.map(mapQuery);
      return {
        availability: "ok",
        bound: true,
        completeness: completenessFromPageSize(items.length, REGISTER_LIST_PAGE_LIMIT),
        items,
        sourceTimestamp: items[0]?.updatedAt,
      };
    } catch (error) {
      return { availability: classifyFailure(error), bound: false, items: [] };
    }
  }

  private async loadDecisions(scope: CommandCentreScope): Promise<DecisionSourceSlice> {
    try {
      const rows = (await this.ctx.engineering.decisions.list(this.commerce, scope.tenantId, scope.projectId)).filter(
        (row) => inWorkspace(row, scope.workspaceId),
      );
      const items = rows.map(mapDecision);
      return {
        availability: "ok",
        bound: true,
        completeness: completenessFromPageSize(items.length, REGISTER_LIST_PAGE_LIMIT),
        items,
        sourceTimestamp: items[0]?.updatedAt,
      };
    } catch (error) {
      return { availability: classifyFailure(error), bound: false, items: [] };
    }
  }

  private async loadActions(scope: CommandCentreScope): Promise<ActionSourceSlice> {
    try {
      const rows = (await this.ctx.engineering.actions.list(this.commerce, scope.tenantId, scope.projectId)).filter(
        (row) => inWorkspace(row, scope.workspaceId),
      );
      const items = rows.map(mapAction);
      return {
        availability: "ok",
        bound: true,
        completeness: completenessFromPageSize(items.length, REGISTER_LIST_PAGE_LIMIT),
        items,
        sourceTimestamp: items[0]?.updatedAt,
      };
    } catch (error) {
      return { availability: classifyFailure(error), bound: false, items: [] };
    }
  }
}
