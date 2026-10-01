import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import type { JobService } from "@rtb/platform-kernel";
import { assertEngineeringService } from "../../commerce/service-guard";
import { workspaceScopeId } from "../../commerce/workspace-scope";
import type { EngineeringWorkContextService } from "../../work-context/service";
import type { EngineeringInformationService } from "../../information-intelligence/service";
import type { EngineeringWorkGeneratorService } from "../../work-generator/service";
import type { EngineeringChangeWorkbenchService } from "../../change-workbench/service";
import type { EngineeringDeliverableService } from "../../deliverable-intelligence/service";
import { SPACE_GASS_CATALOG_ENTRY } from "../../external-tools/catalog";
import { classifyExternalChange, engineerFacingLabel, refToInformationRef, refToWorkSignal, scheduleDoesNotCompleteDeliverable, vendorObjectToRef } from "./compose";
import { isOlderThanKnown } from "./identity";
import { finalizeBatch, recordPoisonObject } from "../core/sync";
import { assertConnectorCapability } from "../core/capability";
import { createMemoryEngineeringConnectorStore, emptyTelemetry, type EngineeringConnectorStore } from "./memory-store";
import { MockVendorPort, VendorPortFailure, type VendorPort } from "./ports";
import { assertNoSecretMaterialOnRecord, backoff, isGovernedExternalWebUrl, rejectArbitraryUrlFetch, rejectCallerEngineeringConnectorClaims, rejectPersonalIngestion } from "./security";
import { SupabaseEngineeringConnectorStore } from "./supabase-store";
import { CANONICAL_CONNECTOR_CERTIFICATION_MATRIX, DEFAULT_CONNECTOR_WRITE_POLICY } from "../core/types";
import {
  CONNECTOR_CERTIFICATION_MATRIX,
  ENGINEERING_CONNECTOR_AI_BOUNDARY,
  ENGINEERING_CONNECTOR_PRIVACY,
  ENGINEERING_CONNECTOR_RECON,
  EXTERNAL_JOB_TYPE,
  type ConnectorWritePolicy,
  type EngineeringExternalConnection,
  type EngineeringExternalProjectBinding,
} from "./types";

export type EngineeringConnectorDeps = {
  store?: EngineeringConnectorStore;
  work: EngineeringWorkContextService;
  information: EngineeringInformationService;
  workGenerator?: EngineeringWorkGeneratorService;
  changeWorkbench?: EngineeringChangeWorkbenchService;
  deliverables?: EngineeringDeliverableService;
  ports?: Map<string, VendorPort>;
  jobs?: JobService;
};

function newId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

export class EngineeringExternalConnectorService {
  private readonly store: EngineeringConnectorStore;
  readonly telemetry = emptyTelemetry();
  private readonly ports: Map<string, VendorPort>;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly deps: EngineeringConnectorDeps,
  ) {
    this.store = deps.store ?? new SupabaseEngineeringConnectorStore(supabase);
    this.ports = deps.ports ?? new Map();
  }

  catalog() {
    return {
      recon: ENGINEERING_CONNECTOR_RECON,
      privacy: ENGINEERING_CONNECTOR_PRIVACY,
      aiBoundary: ENGINEERING_CONNECTOR_AI_BOUNDARY,
      jobType: EXTERNAL_JOB_TYPE,
      defaultCapturePolicy: "DENY",
      defaultWritePolicy: DEFAULT_CONNECTOR_WRITE_POLICY,
      matrix: CONNECTOR_CERTIFICATION_MATRIX,
      canonicalMatrix: CANONICAL_CONNECTOR_CERTIFICATION_MATRIX,
      liveEdms: "NOT_TESTED",
      liveBim: "NOT_TESTED",
      livePlanning: "NOT_TESTED",
      aconexAdapter: "CONTRACT_ONLY",
      newContentBase64Usage: false,
      binaryDuplication: "NO",
      geometryEngineCreated: false,
      spaceGassGuiAutomation: false,
      a7c: "DEFERRED_EXTERNAL_DEPENDENCY",
      specialistTools: [SPACE_GASS_CATALOG_ENTRY.toolCode, "ETABS", "SAP2000", "STAAD", "PLAXIS", "CAESAR_II", "ETAP", "HYSYS"],
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    return rejectCallerEngineeringConnectorClaims(body) ?? rejectArbitraryUrlFetch(body.url ?? body.href ?? body.fetchUrl);
  }

  registerPort(connectionId: string, port: VendorPort) {
    this.ports.set(connectionId, port);
  }

  async listConnections(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return (await this.store.listConnections(workspaceId)).filter((row) => row.tenantId === tenantId);
  }

  async saveConnection(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: Partial<EngineeringExternalConnection> & Pick<EngineeringExternalConnection, "displayName" | "category" | "vendor" | "credentialSecretId">,
  ) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row: EngineeringExternalConnection = {
      id: input.id ?? newId(),
      tenantId,
      workspaceId,
      displayName: input.displayName,
      category: input.category,
      vendor: input.vendor,
      credentialSecretId: input.credentialSecretId,
      authMode: input.authMode ?? "OAUTH",
      writePolicy: input.writePolicy ?? "READ_ONLY",
      status: input.status ?? "CONFIGURED",
      enabled: input.enabled ?? true,
      createdBy: commerce.actorUserId ?? null,
      createdAt: input.createdAt ?? now(),
      updatedAt: now(),
    };
    assertNoSecretMaterialOnRecord(row as unknown as Record<string, unknown>);
    const saved = await this.store.saveConnection(row);
    await this.audit(tenantId, workspaceId, "connection_registration", "external_connection", saved.id, commerce.actorUserId);
    return saved;
  }

  async bindProject(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      connectionId: string;
      eosProjectId: string;
      externalAccountId: string;
      externalProjectId: string;
      externalScope?: string | null;
      confirmRebind?: boolean;
      repository: {
        id: string;
        displayName: string;
        repositoryType: "ENGINEERING_EDMS" | "ENGINEERING_APPLICATION" | "OTHER_APPROVED_ENTERPRISE_SOURCE";
      };
    },
  ) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connection = await this.requireConnection(tenantId, workspaceId, input.connectionId);
    const existingBindings = (await this.store.listBindings(workspaceId)).filter(
      (row) => row.connectionId === connection.id && row.eosProjectId === input.eosProjectId && row.tenantId === tenantId,
    );
    const conflict = existingBindings.find((row) => row.externalProjectId !== input.externalProjectId);
    if (conflict && !input.confirmRebind) {
      throw new Error("PROJECT_REBIND_CONFIRMATION_REQUIRED");
    }
    if (conflict && input.confirmRebind) {
      for (const previous of existingBindings.filter((row) => row.enabled)) {
        await this.store.saveBinding({ ...previous, enabled: false });
      }
      await this.audit(tenantId, workspaceId, "project_rebind", "external_project_binding", conflict.id, commerce.actorUserId, {
        previousExternalProjectId: conflict.externalProjectId,
        nextExternalProjectId: input.externalProjectId,
        historicalObjectsReassigned: false,
      });
    }
    const repository = await this.deps.work.saveRepository(commerce, tenantId, {
      id: input.repository.id,
      tenantId,
      workspaceId,
      projectId: input.eosProjectId,
      scope: "PROJECT",
      repositoryType: input.repository.repositoryType,
      externalRepositoryId: input.externalProjectId,
      displayName: input.repository.displayName,
      approvedRoot: input.externalScope ?? null,
      connectionId: connection.id,
      enabled: true,
      capturePolicy: "MANAGED",
      createdBy: commerce.actorUserId ?? null,
      createdAt: now(),
      updatedAt: now(),
    });
    const binding = await this.store.saveBinding({
      id: newId(),
      connectionId: connection.id,
      tenantId,
      workspaceId,
      eosProjectId: input.eosProjectId,
      externalAccountId: input.externalAccountId,
      externalProjectId: input.externalProjectId,
      externalScope: input.externalScope ?? null,
      repositoryId: repository.id,
      enabled: true,
    });
    await this.audit(tenantId, workspaceId, "project_binding", "external_project_binding", binding.id, commerce.actorUserId, {
      eosProjectId: binding.eosProjectId,
      externalProjectId: binding.externalProjectId,
    });
    return { binding, repository };
  }

  async setWritePolicy(commerce: CommerceExecutionContext, tenantId: string, connectionId: string, writePolicy: ConnectorWritePolicy) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connection = await this.requireConnection(tenantId, workspaceId, connectionId);
    const saved = await this.store.saveConnection({ ...connection, writePolicy, updatedAt: now() });
    await this.audit(tenantId, workspaceId, "write_policy_change", "external_connection", saved.id, commerce.actorUserId, { writePolicy });
    return saved;
  }

  async disableConnection(commerce: CommerceExecutionContext, tenantId: string, connectionId: string) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connection = await this.requireConnection(tenantId, workspaceId, connectionId);
    const saved = await this.store.saveConnection({ ...connection, enabled: false, status: "DISABLED", updatedAt: now() });
    const objects = await this.store.listObjects(workspaceId);
    for (const row of objects.filter((item) => item.connectionId === connectionId && item.availability === "ACTIVE")) {
      await this.store.saveObject({ ...row, availability: "DISABLED", recordedAt: now() });
    }
    await this.audit(tenantId, workspaceId, "connector_disable", "external_connection", connectionId, commerce.actorUserId);
    return saved;
  }

  async enqueueSync(commerce: CommerceExecutionContext, tenantId: string, connectionId: string) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    await this.audit(tenantId, workspaceId, "manual_resync", "external_connection", connectionId, commerce.actorUserId);
    if (this.deps.jobs) {
      const job = await this.deps.jobs.create({
        tenantId,
        workspaceId,
        jobType: EXTERNAL_JOB_TYPE,
        payload: { tenantId, workspaceId, connectionId, actorUserId: commerce.actorUserId },
        createdBy: commerce.actorUserId ?? undefined,
      });
      return { queued: true, jobId: job.id };
    }
    const result = await this.runSync(commerce, tenantId, connectionId);
    return { queued: false, result };
  }

  async runSync(commerce: CommerceExecutionContext, tenantId: string, connectionId: string) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connection = await this.requireConnection(tenantId, workspaceId, connectionId);
    const started = Date.now();
    if (!connection.enabled) {
      return { skipped: true as const, reason: "connector_disabled", itemsChanged: 0 };
    }
    const port = this.ports.get(connectionId);
    if (!port) {
      return { skipped: true as const, reason: "LIVE_CONNECTION_NOT_TESTED", itemsChanged: 0, live: "NOT_TESTED" as const };
    }
    const bindings = (await this.store.listBindings(workspaceId)).filter((row) => row.connectionId === connectionId && row.enabled && row.tenantId === tenantId);
    let itemsScanned = 0;
    let itemsChanged = 0;
    const poison: import("../core/sync").PoisonObjectFailure[] = [];
    const previous = await this.store.getSyncState(connectionId);
    try {
      for (const binding of bindings) {
        const page = await port.list({ externalProjectId: binding.externalProjectId, cursor: previous?.cursor ?? null });
        itemsScanned += page.items.length;
        for (const object of page.items) {
          if (object.externalProjectId !== binding.externalProjectId) continue;
          try {
            if (!object.objectId) throw new Error("malformed_external_object");
            const applied = await this.applyObject(commerce, tenantId, connection, binding, object);
            if (applied.changed) itemsChanged += 1;
          } catch (error) {
            if (error instanceof VendorPortFailure) throw error;
            recordPoisonObject(poison, object.objectId || "unknown", error instanceof Error ? error.message : "object_failed", object.objectType);
          }
        }
      }
      const batch = finalizeBatch({ processed: itemsScanned, changed: itemsChanged, poison });
      const state = await this.store.saveSyncState({
        id: previous?.id ?? newId(),
        connectionId,
        tenantId,
        workspaceId,
        status: batch.status,
        cursor: batch.checkpointAllowed ? `cursor:${itemsScanned}` : previous?.cursor ?? null,
        lastSuccessfulSyncAt: batch.status === "READY" ? now() : previous?.lastSuccessfulSyncAt ?? null,
        lastAttemptedSyncAt: now(),
        lastError: poison.length ? `poison:${poison.map((row) => row.objectId).join(",")}` : null,
        itemsScanned,
        itemsChanged,
        throttleCount: previous?.throttleCount ?? 0,
        retryCount: 0,
        durationMs: Date.now() - started,
        syncMode: "BOUNDED_POLL",
      });
      this.telemetry.syncDurationMs.push(state.durationMs);
      this.telemetry.itemsProcessed += itemsChanged;
      await this.store.saveConnection({ ...connection, status: batch.status, updatedAt: now() });
      return { skipped: false as const, itemsScanned, itemsChanged, durationMs: state.durationMs, poison, checkpointAllowed: batch.checkpointAllowed };
    } catch (error) {
      this.telemetry.errors += 1;
      const status = error instanceof VendorPortFailure && error.failure.kind === "THROTTLE" ? "RATE_LIMITED" : "DEGRADED";
      if (status === "RATE_LIMITED") this.telemetry.throttles += 1;
      this.telemetry.retries += 1;
      await this.store.saveSyncState({
        id: previous?.id ?? newId(),
        connectionId,
        tenantId,
        workspaceId,
        status,
        cursor: previous?.cursor ?? null,
        lastSuccessfulSyncAt: previous?.lastSuccessfulSyncAt ?? null,
        lastAttemptedSyncAt: now(),
        lastError: error instanceof Error ? error.message : "sync_failed",
        itemsScanned,
        itemsChanged,
        throttleCount: (previous?.throttleCount ?? 0) + (status === "RATE_LIMITED" ? 1 : 0),
        retryCount: (previous?.retryCount ?? 0) + 1,
        durationMs: Date.now() - started,
        syncMode: "BOUNDED_POLL",
      });
      await this.store.saveConnection({ ...connection, status, updatedAt: now() });
      if (status === "RATE_LIMITED") {
        return { skipped: false as const, itemsScanned, itemsChanged, rateLimited: true, retryAfterMs: backoff((previous?.retryCount ?? 0) + 1) };
      }
      throw error;
    }
  }

  async listObjects(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connectionById = new Map((await this.store.listConnections(workspaceId)).map((row) => [row.id, row]));
    return (await this.store.listObjects(workspaceId, projectId))
      .filter((row) => row.tenantId === tenantId && row.projectId === projectId)
      .map((row) => ({
        ...row,
        presentation: engineerFacingLabel(row, connectionById.get(row.connectionId)?.vendor ?? "OTHER"),
      }));
  }

  async openExternalSource(commerce: CommerceExecutionContext, tenantId: string, objectRefId: string, callerUrl?: unknown) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const rejected = rejectArbitraryUrlFetch(callerUrl);
    if (rejected) throw new Error(rejected);
    const objects = await this.store.listObjects(workspaceId);
    const row = objects.find((item) => item.id === objectRefId);
    if (!row || row.tenantId !== tenantId) throw new Error("not_found");
    if (!isGovernedExternalWebUrl(row.webUrl)) throw new Error("ARBITRARY_URL_FETCH_PROHIBITED");
    return { ok: true as const, href: row.webUrl, title: row.displayName, connectorImplemented: true, engineeringLanguage: true };
  }

  async publishEngineeringResponse(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      objectRefId: string;
      preparedEtag: string | null;
      humanConfirmed: boolean;
      writeAction: ConnectorWritePolicy;
      aiIssued?: boolean;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (input.aiIssued) throw new Error("AI_EXTERNAL_ENGINEERING_ISSUE_PROHIBITED");
    if (!input.humanConfirmed) throw new Error("HUMAN_WRITE_CONFIRMATION_REQUIRED");
    const objects = await this.store.listObjects(workspaceId);
    const row = objects.find((item) => item.id === input.objectRefId);
    if (!row || row.tenantId !== tenantId) throw new Error("not_found");
    const connection = await this.requireConnection(tenantId, workspaceId, row.connectionId);
    if (connection.writePolicy === "READ_ONLY") throw new Error("ARBITRARY_EXTERNAL_WRITE_PROHIBITED");
    if (connection.writePolicy !== input.writeAction) throw new Error("ARBITRARY_EXTERNAL_WRITE_PROHIBITED");
    assertConnectorCapability({
      vendor: connection.vendor,
      capability: input.writeAction === "PUBLISH_DOCUMENT" ? "PUBLISH_DOCUMENT" : "UPDATE_RFI_RESPONSE",
      writePolicy: connection.writePolicy,
    });
    const port = this.ports.get(connection.id);
    if (!port) throw new Error("LIVE_CONNECTION_NOT_TESTED");
    const current = await port.get({ externalProjectId: row.externalProjectId, objectType: row.objectType, objectId: row.objectId });
    if (!current) throw new Error("external_object_not_found");
    if ((current.etag ?? null) !== (input.preparedEtag ?? null)) throw new Error("EXTERNAL_STATE_CHANGED");
    const updated = await port.update({
      externalProjectId: row.externalProjectId,
      objectType: row.objectType,
      objectId: row.objectId,
      etag: input.preparedEtag,
      body: { vendorStatus: "Responded", engineeringIssued: false },
    });
    await this.audit(tenantId, workspaceId, "external_publication", "external_object", row.id, commerce.actorUserId, {
      writeAction: input.writeAction,
      humanConfirmed: true,
      issued: false,
    });
    return { ok: true as const, issued: false, closed: false, etag: updated.etag };
  }

  async health(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connections = (await this.store.listConnections(workspaceId)).filter((row) => row.tenantId === tenantId);
    const sync = [];
    for (const connection of connections) {
      sync.push({ connection, state: await this.store.getSyncState(connection.id) });
    }
    return {
      connections: sync,
      matrix: CONNECTOR_CERTIFICATION_MATRIX,
      canonicalMatrix: CANONICAL_CONNECTOR_CERTIFICATION_MATRIX,
      secretsOnRows: false,
      certificationIsNotHealth: true,
    };
  }

  scheduleContext(percentComplete: number | null, deliverableReviewIncomplete: boolean) {
    return scheduleDoesNotCompleteDeliverable(percentComplete, deliverableReviewIncomplete);
  }

  rejectPersonal(kind: "email" | "cloud_drive") {
    return rejectPersonalIngestion(kind);
  }

  private async applyObject(
    commerce: CommerceExecutionContext,
    tenantId: string,
    connection: EngineeringExternalConnection,
    binding: EngineeringExternalProjectBinding,
    object: import("./types").VendorExternalObject,
  ) {
    const workspaceId = binding.workspaceId;
    if (object.externalProjectId !== binding.externalProjectId) return { changed: false };
    const previous = await this.store.findObject({
      workspaceId,
      connectionId: connection.id,
      objectType: object.objectType,
      objectId: object.objectId,
    });
    if (previous && isOlderThanKnown(object.occurredAt, previous.occurredAt)) {
      return { changed: false, outOfOrder: true };
    }
    const next = vendorObjectToRef({ tenantId, workspaceId, connection, binding, object, previous });
    const change = classifyExternalChange(previous, next);
    let informationRefId = previous?.informationRefId ?? null;
    if (change && next.availability === "ACTIVE" && next.objectType !== "SCHEDULE_ACTIVITY" && next.objectType !== "MILESTONE") {
      const info = refToInformationRef({ ...next, informationRefId });
      const savedInfo = await this.deps.information.registerFromConnector(commerce, tenantId, info);
      informationRefId = savedInfo.id;
    }
    const saved = await this.store.saveObject({ ...next, informationRefId });
    if (change) {
      await this.deps.work.ingestFromConnector(commerce, tenantId, refToWorkSignal(saved, change));
    }
    if (change && (saved.objectType === "RFI" || saved.objectType === "TQ") && this.deps.workGenerator) {
      try {
        await this.deps.workGenerator.generatePlan(commerce, tenantId, {
          projectId: saved.projectId,
          workType: "RFI_TQ_RESPONSE",
          lifecycleStage: "CONSTRUCTION",
          relatedObjectType: "technical_query",
          relatedObjectId: saved.objectNumber ?? saved.objectId,
          systemId: typeof saved.metadata.systemId === "string" ? saved.metadata.systemId : undefined,
        });
      } catch {
        /* Connector sync uses repository admin scope. Work Plan creation requires work.write. */
      }
    }
    if (change && (saved.objectType === "FIELD_CHANGE" || saved.objectType === "ISSUE") && this.deps.changeWorkbench) {
      try {
        await this.deps.changeWorkbench.assess(commerce, tenantId, {
          sourceObjectType: "technical_query",
          sourceObjectId: saved.objectNumber ?? saved.objectId,
          projectId: saved.projectId,
          workflow: saved.objectType === "FIELD_CHANGE" ? "FIELD_CHANGE" : "CONSTRUCTION_RFI",
          constructionQuery: {
            id: saved.objectNumber ?? saved.objectId,
            type: saved.objectType === "FIELD_CHANGE" ? "FIELD_CHANGE" : "RFI",
            summary: String(saved.metadata.summary ?? saved.displayName),
          },
        });
      } catch {
        /* Impact assessment requires work.write. */
      }
    }
    return { changed: Boolean(change) || !previous || previous.fingerprint !== saved.fingerprint };
  }

  private async requireConnection(tenantId: string, workspaceId: string, connectionId: string) {
    const connection = await this.store.getConnection(connectionId);
    if (!connection || connection.tenantId !== tenantId || connection.workspaceId !== workspaceId) {
      throw new Error("connection_scope_denied");
    }
    return connection;
  }

  private async audit(tenantId: string, workspaceId: string, action: string, targetType: string, targetId: string, actorId: string | null | undefined, metadata: Record<string, unknown> = {}) {
    await this.store.saveAudit({
      id: newId(),
      tenantId,
      workspaceId,
      action,
      actorId: actorId ?? null,
      targetType,
      targetId,
      metadata,
      createdAt: now(),
    });
  }
}

export function createTestEngineeringConnectorService(input: {
  work: EngineeringWorkContextService;
  information: EngineeringInformationService;
  store?: EngineeringConnectorStore;
  workGenerator?: EngineeringWorkGeneratorService;
  changeWorkbench?: EngineeringChangeWorkbenchService;
  ports?: Map<string, VendorPort>;
}) {
  return new EngineeringExternalConnectorService({ from() { return this; } } as never, {
    work: input.work,
    information: input.information,
    store: input.store ?? createMemoryEngineeringConnectorStore(),
    workGenerator: input.workGenerator,
    changeWorkbench: input.changeWorkbench,
    ports: input.ports,
  });
}
