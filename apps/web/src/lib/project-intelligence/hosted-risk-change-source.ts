import {
  type CommandCentreAvailability,
  type CommandCentreScope,
  type ChangeSourceSlice,
  type CanonicalRiskActionRef,
  type CanonicalRiskRef,
  type PublishedChangeEvidenceRef,
  type PublishedChangeStateRef,
  type RiskChangeIntelligencePort,
  type RiskChangeSourceSnapshot,
  type RiskSourceSlice,
  asChangeImpactContext,
  asChangeStatusContext,
  completenessFromPageSize,
  REGISTER_LIST_PAGE_LIMIT,
} from "@rtb/project-intelligence";
import { createProjectControlsRepository } from "@rtb/project-controls";
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

function mapRisk(row: unknown): CanonicalRiskRef {
  const data = asRecord(row);
  const metadata = asRecord(data.metadata);
  const status = String(data.status ?? "open");
  const mitigation = data.mitigation;
  const controls = Array.isArray(data.controls) ? data.controls : [];
  return {
    id: String(data.id),
    riskNumber: data.risk_number === undefined || data.risk_number === null ? undefined : String(data.risk_number),
    title: data.title === undefined || data.title === null ? undefined : String(data.title),
    status,
    open: !CLOSED_STATUSES.has(status.toLowerCase()),
    priority: data.priority === undefined || data.priority === null ? undefined : String(data.priority),
    score: typeof data.score === "number" ? data.score : undefined,
    probability: typeof data.probability === "number" ? data.probability : undefined,
    consequence: typeof data.consequence === "number" ? data.consequence : undefined,
    residualScore: typeof data.residual_score === "number" ? data.residual_score : undefined,
    category: data.category === undefined || data.category === null ? undefined : String(data.category),
    ownerId: data.owner_id === undefined || data.owner_id === null ? undefined : String(data.owner_id),
    assignedTo: data.assigned_to === undefined || data.assigned_to === null ? undefined : String(data.assigned_to),
    dueAt: data.due_date === undefined || data.due_date === null ? undefined : String(data.due_date),
    mitigationPresent: Boolean(mitigation) || controls.length > 0,
    createdAt: data.created_at === undefined || data.created_at === null ? undefined : String(data.created_at),
    updatedAt: data.updated_at === undefined || data.updated_at === null ? undefined : String(data.updated_at),
    matrixId:
      metadata.matrix_id === undefined && metadata.matrixId === undefined
        ? undefined
        : String(metadata.matrix_id ?? metadata.matrixId),
    matrixScale: "probability_1_5_consequence_1_5",
    storesCanonicalCopy: false,
  };
}

function mapAction(row: unknown): CanonicalRiskActionRef {
  const data = asRecord(row);
  const status = String(data.status ?? "open");
  return {
    id: String(data.id),
    open: !CLOSED_STATUSES.has(status.toLowerCase()),
    dueAt: data.due_date === undefined || data.due_date === null ? undefined : String(data.due_date),
    originatingObjectType:
      data.originating_object_type === undefined || data.originating_object_type === null
        ? undefined
        : String(data.originating_object_type),
    originatingObjectId:
      data.originating_object_id === undefined || data.originating_object_id === null
        ? undefined
        : String(data.originating_object_id),
    updatedAt: data.updated_at === undefined || data.updated_at === null ? undefined : String(data.updated_at),
    storesCanonicalCopy: false,
  };
}

function mapChangeState(row: {
  stateId: string;
  projectId: string;
  status: string;
  abstained: boolean;
  changeClass?: string;
  changeStatusContext?: string;
  impact?: {
    scope?: string;
    schedule?: string;
    cost?: string;
    risk?: string;
    quality?: string;
    procurement?: string;
  };
  confidence?: {
    dataSufficiency?: string;
    confidenceClass?: string;
    evidenceCount?: number;
    usableEvidenceCount?: number;
  };
  assessedAt: string;
  publishedAt?: string;
  recordedAt: string;
  reviewedAt?: string;
  version: number;
}): PublishedChangeStateRef {
  return {
    stateId: row.stateId,
    projectId: row.projectId,
    published: row.status === "published",
    abstained: row.abstained,
    statusContext: asChangeStatusContext(row.changeStatusContext),
    changeClass: row.changeClass,
    impact: row.impact
      ? {
          scope: asChangeImpactContext(row.impact.scope),
          schedule: asChangeImpactContext(row.impact.schedule),
          cost: asChangeImpactContext(row.impact.cost),
          risk: asChangeImpactContext(row.impact.risk),
          quality: asChangeImpactContext(row.impact.quality),
          procurement: asChangeImpactContext(row.impact.procurement),
        }
      : undefined,
    dataSufficiency: row.confidence?.dataSufficiency,
    confidenceClass: row.confidence?.confidenceClass,
    evidenceCount: row.confidence?.evidenceCount,
    usableEvidenceCount: row.confidence?.usableEvidenceCount,
    assessedAt: row.assessedAt,
    publishedAt: row.publishedAt,
    recordedAt: row.recordedAt,
    reviewedAt: row.reviewedAt,
    version: row.version,
    storesCanonicalCopy: false,
  };
}

function mapChangeEvidence(row: {
  evidenceId: string;
  changeStateId: string;
  kind: string;
  sourceType: string;
  sourceRef: string;
  sourceKey: string;
  observedAt?: string;
  recordedAt: string;
  revoked?: boolean;
}): PublishedChangeEvidenceRef {
  return {
    evidenceId: row.evidenceId,
    changeStateId: row.changeStateId,
    kind: row.kind,
    sourceType: row.sourceType,
    sourceRef: row.sourceRef,
    sourceKey: row.sourceKey,
    observedAt: row.observedAt,
    recordedAt: row.recordedAt,
    revoked: Boolean(row.revoked),
    storesCanonicalCopy: false,
  };
}

function emptyRisk(availability: CommandCentreAvailability): RiskSourceSlice {
  return { availability, bound: false, items: [], actions: [] };
}

function emptyChange(availability: CommandCentreAvailability): ChangeSourceSlice {
  return { availability, latest: null, history: [], evidence: [] };
}

export class HostedRiskChangeIntelligenceSource implements RiskChangeIntelligencePort {
  readonly sourceDomain = "engineering_core_and_project_controls" as const;
  readonly mutatesCanonicalState = false as const;
  readonly invokesControlsEngine = false as const;
  readonly storesRiskRegister = false as const;
  readonly mutatesRisk = false as const;
  readonly mutatesChange = false as const;
  readonly computesChangeImpact = false as const;
  readonly computesIndependentRiskScore = false as const;

  constructor(
    private readonly ctx: AuthContext,
    private readonly commerce: CommerceExecutionContext,
  ) {}

  async load(scope: CommandCentreScope): Promise<RiskChangeSourceSnapshot> {
    const [risk, change] = await Promise.all([this.loadRisk(scope), this.loadChange(scope)]);
    return { risk, change };
  }

  private async loadRisk(scope: CommandCentreScope): Promise<RiskSourceSlice> {
    let items: CanonicalRiskRef[];
    try {
      const rows = (
        await this.ctx.engineering.risks.list(this.commerce, scope.tenantId, scope.projectId, 50, { aggregate: true })
      ).filter(
        (row) => inWorkspace(row, scope.workspaceId),
      );
      items = rows.map(mapRisk);
    } catch (error) {
      return emptyRisk(classifyFailure(error));
    }

    let actions: CanonicalRiskActionRef[] = [];
    try {
      const rows = (
        await this.ctx.engineering.actions.list(this.commerce, scope.tenantId, scope.projectId, 50, {
          aggregate: true,
        })
      ).filter(
        (row) => inWorkspace(row, scope.workspaceId),
      );
      actions = rows.map(mapAction);
    } catch {
      actions = [];
    }

    return {
      availability: "ok",
      bound: true,
      completeness: completenessFromPageSize(items.length, REGISTER_LIST_PAGE_LIMIT),
      items,
      actions,
      sourceTimestamp: items[0]?.updatedAt,
    };
  }

  private async loadChange(scope: CommandCentreScope): Promise<ChangeSourceSlice> {
    const repository = createProjectControlsRepository({
      adapter: "postgres",
      supabase: this.ctx.supabase,
      nodeEnv: "production",
    });
    let published: PublishedChangeStateRef[];
    try {
      const rows = await repository.listChangeStates(scope.tenantId, scope.workspaceId, scope.projectId);
      published = rows
        .filter((row) => row.status === "published")
        .sort(
          (a, b) => Date.parse(b.publishedAt ?? b.recordedAt) - Date.parse(a.publishedAt ?? a.recordedAt),
        )
        .map(mapChangeState);
    } catch (error) {
      return emptyChange(classifyFailure(error));
    }

    if (!published.length) return emptyChange("no_data");
    const pending = published.find((row) => row.statusContext === "pending");
    const latest = pending ?? published[0];
    let evidence: PublishedChangeEvidenceRef[] = [];
    try {
      const rows = await repository.listChangeEvidence(scope.tenantId, scope.workspaceId, latest.stateId);
      evidence = rows.map(mapChangeEvidence);
    } catch {
      evidence = [];
    }
    return { availability: "ok", latest, history: published, evidence };
  }
}
