import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { classifyWorkMateriality, WORKFLOW_CONTRACTS } from "./catalog";
import { aggregateEngineeringDay, explainCapture, futureAssuranceConditions, kernelWorkEventEnvelope, WORK_CONTEXT_PRIVACY, WORK_CONTEXT_RECON } from "./compose";
import { evaluateCaptureEligibility } from "./eligibility";
import type { WorkContextStore } from "./memory-store";
import { SupabaseWorkContextStore } from "./supabase-store";
import { normalizeEngineeringWorkEvent } from "./normalizer";
import {
  DEFAULT_CAPTURE_POLICY,
  WORK_CONTEXT_AI_BOUNDARY,
  WORK_EVENT_TYPES,
  type ConfirmationState,
  type EngineeringWorkEvent,
  type ManagedEngineeringRepository,
  type RepositoryScope,
  type SourceWorkflowSignal,
} from "./types";

export const CALLER_SUPPLIED_WORK_AUTHORITY_KEYS = ["tenantId", "workspaceId", "aal", "permissions"] as const;

const SCOPE_RANK: Record<RepositoryScope, number> = { PROJECT: 1, WORKSPACE: 2, TENANT: 3 };

export type WorkEventBusPort = {
  publish(event: {
    tenantId: string;
    workspaceId?: string;
    eventType: string;
    source?: string;
    payload?: Record<string, unknown>;
  }): Promise<unknown>;
};

function newId() {
  return crypto.randomUUID();
}

export class EngineeringWorkContextService {
  private readonly store: WorkContextStore;

  constructor(
    private readonly supabase: SupabaseClient,
    store?: WorkContextStore,
    private readonly eventBus?: WorkEventBusPort,
  ) {
    this.store = store ?? new SupabaseWorkContextStore(supabase);
  }

  catalog() {
    return {
      defaultCapturePolicy: DEFAULT_CAPTURE_POLICY,
      eventTypes: WORK_EVENT_TYPES,
      workflowContracts: WORKFLOW_CONTRACTS,
      privacy: WORK_CONTEXT_PRIVACY,
      recon: WORK_CONTEXT_RECON,
      aiBoundary: WORK_CONTEXT_AI_BOUNDARY,
      futureAssuranceConditions: futureAssuranceConditions(),
      newEventBusCreated: false,
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    for (const key of CALLER_SUPPLIED_WORK_AUTHORITY_KEYS) {
      if (key in body && body[key] != null && body[key] !== "") {
        return "caller_supplied_authority_rejected";
      }
    }
    return null;
  }

  async listRepositories(commerce: CommerceExecutionContext, tenantId: string, projectId?: string | null) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return (await this.store.listRepositories(workspaceId, projectId)).filter((row) => row.tenantId === tenantId);
  }

  async saveRepository(
    commerce: CommerceExecutionContext,
    tenantId: string,
    row: ManagedEngineeringRepository,
    options?: { actorProjectId?: string | null },
  ) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (row.tenantId !== tenantId || row.workspaceId !== workspaceId) throw new Error("workspace_mismatch");
    const existing = await this.store.getRepository(row.id);
    if (existing && SCOPE_RANK[row.scope] > SCOPE_RANK[existing.scope]) {
      throw new Error("repository_scope_broadening_denied");
    }
    if (options?.actorProjectId && row.scope !== "PROJECT") {
      throw new Error("repository_scope_broadening_denied");
    }
    if (row.scope === "PROJECT" && !row.projectId) throw new Error("project_scope_requires_project");
    const saved = await this.store.saveRepository({
      ...row,
      capturePolicy: row.capturePolicy === "MANAGED" ? "MANAGED" : "DENY",
      updatedAt: new Date().toISOString(),
    });
    return saved;
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (!projectId) throw new Error("project_required");
    return (await this.store.listEvents(workspaceId, projectId)).filter((row) => row.tenantId === tenantId);
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.store.getEvent(id);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) return null;
    return row;
  }

  async ingest(commerce: CommerceExecutionContext, tenantId: string, signal: SourceWorkflowSignal) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (!signal.projectId) throw new Error("project_required");
    const repositories = (await this.store.listRepositories(workspaceId, signal.projectId)).filter((row) => row.tenantId === tenantId);
    const normalized = normalizeEngineeringWorkEvent({
      tenantId,
      workspaceId,
      repositories,
      signal,
    });
    if (!normalized.captured) {
      return { captured: false as const, decision: normalized.decision, reason: normalized.reason, event: null };
    }
    const duplicate = await this.store.findEventBySource({
      tenantId,
      workspaceId,
      sourceSystem: normalized.event.sourceSystem,
      sourceEventId: normalized.event.sourceEventId,
    });
    if (duplicate) {
      return { captured: true as const, decision: "CAPTURED", reason: "idempotent_source_event", event: duplicate, duplicate: true };
    }
    const persisted: EngineeringWorkEvent = {
      ...normalized.event,
      id: newId(),
      publishedToEventBus: false,
    };
    let publishedToEventBus = false;
    if (this.eventBus) {
      try {
        await this.eventBus.publish(kernelWorkEventEnvelope(persisted));
        publishedToEventBus = true;
      } catch {
        publishedToEventBus = false;
      }
    }
    const saved = await this.store.saveEvent({ ...persisted, publishedToEventBus });
    return { captured: true as const, decision: "CAPTURED" as const, reason: normalized.reason, event: saved, duplicate: false };
  }

  private async loadScopedEvent(tenantId: string, workspaceId: string, id: string) {
    const row = await this.store.getEvent(id);
    if (!row || row.tenantId !== tenantId || row.workspaceId !== workspaceId) return null;
    return row;
  }

  async confirmCandidate(commerce: CommerceExecutionContext, tenantId: string, id: string, state: ConfirmationState) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.loadScopedEvent(tenantId, workspaceId, id);
    if (!row) return null;
    if (row.confirmationState !== "CANDIDATE") throw new Error("confirmation_not_required");
    if (state !== "CONFIRMED" && state !== "REJECTED") throw new Error("invalid_confirmation");
    return this.store.saveEvent({
      ...row,
      confirmationState: state,
      provenance: { ...row.provenance, confirmedAt: new Date().toISOString(), auditKind: "manual_event_confirmation" },
    });
  }

  async rebindProject(commerce: CommerceExecutionContext, tenantId: string, id: string, projectId: string) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row = await this.loadScopedEvent(tenantId, workspaceId, id);
    if (!row) return null;
    if (!projectId) throw new Error("project_required");
    return this.store.saveEvent({
      ...row,
      projectId,
      provenance: { ...row.provenance, previousProjectId: row.projectId, auditKind: "manual_project_binding" },
    });
  }

  async dayView(commerce: CommerceExecutionContext, tenantId: string, projectId: string, sinceIso: string, actorId?: string | null) {
    const events = await this.list(commerce, tenantId, projectId);
    return aggregateEngineeringDay(events, sinceIso, actorId);
  }

  async recordMaterialEvent(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      eventType: EngineeringWorkEvent["eventType"];
      projectId: string;
      sourceObjectType: string;
      sourceObjectId: string;
      sourceEventId: string;
      actorId?: string | null;
      systemId?: string | null;
      lifecycleStage?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (!input.projectId) throw new Error("project_required");
    const now = new Date().toISOString();
    const persisted: EngineeringWorkEvent = {
      id: newId(),
      tenantId,
      workspaceId,
      projectId: input.projectId,
      eventType: input.eventType,
      sourceSystem: "engineering-os",
      sourceObjectType: input.sourceObjectType,
      sourceObjectId: input.sourceObjectId,
      sourceEventId: input.sourceEventId,
      informationRefId: null,
      disciplineId: null,
      systemId: input.systemId ?? null,
      assetId: null,
      deliverableId: null,
      lifecycleStage: input.lifecycleStage ?? null,
      actorId: input.actorId ?? null,
      occurredAt: now,
      recordedAt: now,
      managedRepositoryId: null,
      materiality: classifyWorkMateriality(input.eventType),
      confirmationState: "NOT_REQUIRED",
      captureReason: "EOS-generated material engineering work event. Not employee activity telemetry.",
      provenance: { sourceSystem: "engineering-os", sourceEventType: input.eventType, auditKind: "work_generator" },
      publishedToEventBus: false,
    };
    let publishedToEventBus = false;
    if (this.eventBus) {
      try {
        await this.eventBus.publish(kernelWorkEventEnvelope(persisted));
        publishedToEventBus = true;
      } catch {
        publishedToEventBus = false;
      }
    }
    return this.store.saveEvent({ ...persisted, publishedToEventBus });
  }

  explain(event: EngineeringWorkEvent) {
    return explainCapture(event.captureReason);
  }

  previewEligibility(signal: SourceWorkflowSignal, repositories: ManagedEngineeringRepository[]) {
    return evaluateCaptureEligibility({ signal, repositories });
  }
}
