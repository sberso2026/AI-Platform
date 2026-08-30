import {
  commandCentreForbidden,
  commandCentreNotFound,
  emptyBound,
  unbound,
  completenessFromPageSize,
  REGISTER_LIST_PAGE_LIMIT,
  type CanonicalAssetRef,
  type CanonicalDocumentRef,
  type CanonicalRegisterItemRef,
  type CommandCentreCoreLoad,
  type CommandCentreCorePort,
  type CommandCentreScope,
  type ProjectCoreSnapshot,
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function mapRegister(entityType: string, row: unknown): CanonicalRegisterItemRef {
  const data = asRecord(row);
  const status = String(data.status ?? "open");
  const metadata = asRecord(data.metadata);
  const matrixId =
    metadata.matrix_id === undefined && metadata.matrixId === undefined
      ? undefined
      : String(metadata.matrix_id ?? metadata.matrixId);
  return {
    id: String(data.id),
    entityType,
    status,
    priority: data.priority === undefined || data.priority === null ? undefined : String(data.priority),
    score: typeof data.score === "number" ? data.score : undefined,
    open: !CLOSED_STATUSES.has(status.toLowerCase()),
    dueAt: data.due_date === undefined || data.due_date === null ? undefined : String(data.due_date),
    sourceTimestamp: String(data.updated_at ?? data.created_at ?? ""),
    ownerId: data.owner_id === undefined || data.owner_id === null ? undefined : String(data.owner_id),
    assignedTo: data.assigned_to === undefined || data.assigned_to === null ? undefined : String(data.assigned_to),
    category: data.category === undefined || data.category === null ? undefined : String(data.category),
    probability: typeof data.probability === "number" ? data.probability : undefined,
    consequence: typeof data.consequence === "number" ? data.consequence : undefined,
    residualScore: typeof data.residual_score === "number" ? data.residual_score : undefined,
    originatingObjectType:
      data.originating_object_type === undefined || data.originating_object_type === null
        ? undefined
        : String(data.originating_object_type),
    originatingObjectId:
      data.originating_object_id === undefined || data.originating_object_id === null
        ? undefined
        : String(data.originating_object_id),
    matrixId,
    createdAt: data.created_at === undefined || data.created_at === null ? undefined : String(data.created_at),
    closedAt: data.closed_date === undefined || data.closed_date === null ? undefined : String(data.closed_date),
    number: String(
      data.tq_number ?? data.decision_number ?? data.action_number ?? data.risk_number ?? data.issue_number ?? "",
    ) || undefined,
    approvalStatus:
      data.approval_status === undefined || data.approval_status === null ? undefined : String(data.approval_status),
    reviewStatus:
      data.review_status === undefined || data.review_status === null ? undefined : String(data.review_status),
    decisionDate:
      data.decision_date === undefined || data.decision_date === null ? undefined : String(data.decision_date),
    requesterId:
      data.requester_id === undefined || data.requester_id === null ? undefined : String(data.requester_id),
    responderId:
      data.responder_id === undefined || data.responder_id === null ? undefined : String(data.responder_id),
    responseDue:
      data.response_due === undefined || data.response_due === null ? undefined : String(data.response_due),
    disciplineId:
      data.discipline_id === undefined || data.discipline_id === null ? undefined : String(data.discipline_id),
    raisedBy: data.created_by === undefined || data.created_by === null ? undefined : String(data.created_by),
    storesCanonicalCopy: false,
  };
}

function inWorkspace(row: unknown, workspaceId: string): boolean {
  const data = asRecord(row);
  const rowWorkspace = data.workspace_id;
  if (!rowWorkspace) return true;
  return String(rowWorkspace) === workspaceId;
}

async function loadBoundRegister(
  load: () => Promise<unknown[]>,
  entityType: string,
  workspaceId: string,
): Promise<ProjectCoreSnapshot["risks"]> {
  try {
    const rows = (await load()).filter((row) => inWorkspace(row, workspaceId));
    const items = rows.map((row) => mapRegister(entityType, row));
    const sourceTimestamp = items[0]?.sourceTimestamp;
    return { bound: true, items, sourceTimestamp, completeness: completenessFromPageSize(items.length, REGISTER_LIST_PAGE_LIMIT) };
  } catch {
    return unbound();
  }
}

export class HostedProjectCoreSource implements CommandCentreCorePort {
  readonly sourceDomain = "engineering_core" as const;
  readonly mutatesCanonicalState = false as const;

  constructor(
    private readonly ctx: AuthContext,
    private readonly commerce: CommerceExecutionContext,
  ) {}

  async load(scope: CommandCentreScope): Promise<CommandCentreCoreLoad> {
    let project;
    try {
      project = await this.ctx.engineering.projects.get(this.commerce, scope.tenantId, scope.projectId);
    } catch (error) {
      throw error;
    }
    if (!project) {
      throw commandCentreNotFound(scope.projectId);
    }
    if (project.tenant_id !== scope.tenantId) {
      throw commandCentreForbidden(scope.projectId, "cross_tenant");
    }
    if (project.workspace_id && project.workspace_id !== scope.workspaceId) {
      throw commandCentreForbidden(scope.projectId, "cross_workspace");
    }

    const [risks, issues, decisions, actions, technicalQueries, documents, assets] = await Promise.all([
      loadBoundRegister(
        () => this.ctx.engineering.risks.list(this.commerce, scope.tenantId, scope.projectId),
        "risk",
        scope.workspaceId,
      ),
      loadBoundRegister(
        () => this.ctx.engineering.issues.list(this.commerce, scope.tenantId, scope.projectId),
        "issue",
        scope.workspaceId,
      ),
      loadBoundRegister(
        () => this.ctx.engineering.decisions.list(this.commerce, scope.tenantId, scope.projectId),
        "decision",
        scope.workspaceId,
      ),
      loadBoundRegister(
        () => this.ctx.engineering.actions.list(this.commerce, scope.tenantId, scope.projectId),
        "action",
        scope.workspaceId,
      ),
      loadBoundRegister(
        () => this.ctx.engineering.technicalQueries.list(this.commerce, scope.tenantId, scope.projectId),
        "technical_query",
        scope.workspaceId,
      ),
      this.loadDocuments(scope),
      this.loadAssets(scope),
    ]);

    const snapshot: ProjectCoreSnapshot = {
      project: {
        projectId: project.id,
        tenantId: project.tenant_id,
        workspaceId: project.workspace_id ?? scope.workspaceId,
        projectCode: project.project_code,
        projectName: project.project_name,
        phase: project.project_phase,
        status: project.status,
        storesCanonicalCopy: false,
      },
      risks,
      issues,
      decisions,
      actions,
      technicalQueries,
      documents,
      assets,
    };

    return {
      identity: {
        projectId: project.id,
        tenantId: project.tenant_id,
        workspaceId: project.workspace_id ?? scope.workspaceId,
        projectCode: project.project_code,
        projectName: project.project_name,
        phase: project.project_phase,
        status: project.status,
        storesCanonicalCopy: false,
      },
      snapshot,
    };
  }

  private async loadDocuments(scope: CommandCentreScope) {
    try {
      const rows = await this.ctx.engineering.documents.list(this.commerce, scope.tenantId, scope.projectId);
      const items: CanonicalDocumentRef[] = rows.map((row) => ({
        id: row.id,
        entityType: "document" as const,
        sourceTimestamp: row.updated_at,
        storesCanonicalCopy: false as const,
      }));
      return items.length ? { bound: true as const, items, sourceTimestamp: items[0]?.sourceTimestamp } : emptyBound<CanonicalDocumentRef>();
    } catch {
      return unbound<CanonicalDocumentRef>();
    }
  }

  private async loadAssets(scope: CommandCentreScope) {
    try {
      const rows = await this.ctx.engineering.assets.list(this.commerce, scope.tenantId, scope.projectId);
      const items: CanonicalAssetRef[] = rows.map((row) => ({
        id: row.id,
        entityType: "asset" as const,
        sourceTimestamp: row.updated_at,
        storesCanonicalCopy: false as const,
      }));
      return items.length ? { bound: true as const, items, sourceTimestamp: items[0]?.sourceTimestamp } : emptyBound<CanonicalAssetRef>();
    } catch {
      return unbound<CanonicalAssetRef>();
    }
  }
}
