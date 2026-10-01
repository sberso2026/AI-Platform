import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import type { JobService } from "@rtb/platform-kernel";
import { assertEngineeringService } from "../../commerce/service-guard";
import { workspaceScopeId } from "../../commerce/workspace-scope";
import { assertOfficePackage } from "../../artifact-automation/validate";
import { sanitizeArtifactFileName } from "../../artifact-automation/filename";
import type { EngineeringWorkContextService } from "../../work-context/service";
import type { EngineeringInformationService } from "../../information-intelligence/service";
import type { ManagedEngineeringRepository } from "../../work-context/types";
import { classifyGraphChange, graphItemToSource, sourceToInformationRef, sourceToWorkSignal, toSearchHit } from "./compose";
import { GraphPortFailure, MockGraphPort, type GraphPort } from "./graph";
import { isOlderThanKnown, microsoftSourceIdentity } from "./identity";
import { createMemoryM365Store, emptyTelemetry, type M365Store } from "./memory-store";
import { SupabaseM365Store } from "./supabase-store";
import {
  assertContentSize,
  assertNoSecretMaterialOnRecord,
  hasPathTraversal,
  isGovernedSharePointWebUrl,
  isPersonalOneDriveItem,
  itemWithinApprovedRoot,
  rejectArbitraryUrlFetch,
  rejectCallerConnectorClaims,
} from "./security";
import {
  CAD_BIM_METADATA_ONLY,
  DEFAULT_PAGE_SIZE,
  INDEXABLE_ENGINEERING_TYPES,
  M365_AI_BOUNDARY,
  M365_CONNECTOR_PRIVACY,
  M365_CONNECTOR_RECON,
  M365_JOB_TYPE,
  MAX_CONTENT_BYTES,
  MICROSOFT_PERMISSION_MODEL,
  type ConnectorSecretsPort,
  type ConnectorStatus,
  type ConnectorSyncState,
  type ConnectorTelemetry,
  type ContentAccessPolicy,
  type ExternalSourceRef,
  type GraphDriveItem,
  type M365Connection,
  type SharePointScope,
} from "./types";

export type M365ConnectorDeps = {
  store?: M365Store;
  work: EngineeringWorkContextService;
  information: EngineeringInformationService;
  graph?: GraphPort;
  secrets?: ConnectorSecretsPort;
  jobs?: JobService;
};

function newId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

export class EngineeringM365ConnectorService {
  private readonly store: M365Store;
  readonly graph: GraphPort;
  readonly telemetry: ConnectorTelemetry = emptyTelemetry();

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly deps: M365ConnectorDeps,
  ) {
    this.store = deps.store ?? new SupabaseM365Store(supabase);
    this.graph = deps.graph ?? new MockGraphPort();
  }

  catalog() {
    return {
      recon: M365_CONNECTOR_RECON,
      privacy: M365_CONNECTOR_PRIVACY,
      aiBoundary: M365_AI_BOUNDARY,
      permissionModel: MICROSOFT_PERMISSION_MODEL,
      jobType: M365_JOB_TYPE,
      defaultCapturePolicy: "DENY",
      allowlistedRepositoriesOnly: true,
      personalOneDriveAccess: "NO",
      personalEmailAccess: "NO",
      teamsConnector: "CONTRACT_ONLY",
      outlookProjectMailbox: "CONTRACT_ONLY",
      contentAccessPolicies: ["METADATA_ONLY", "ON_DEMAND_CONTENT", "INDEX_APPROVED_TYPES"],
      defaultContentAccessPolicy: "METADATA_ONLY",
      indexableTypes: INDEXABLE_ENGINEERING_TYPES,
      cadBim: CAD_BIM_METADATA_ONLY,
      webhookChangeNotification: "DEFERRED",
      newContentBase64Usage: false,
      connectorBinaryDuplication: false,
      liveSharePointConnection: "NOT_TESTED",
      smeIndependent: true,
    };
  }

  rejectCallerClaims(body: Record<string, unknown>) {
    return rejectCallerConnectorClaims(body) ?? rejectArbitraryUrlFetch(body.url ?? body.href ?? body.fetchUrl);
  }

  async listConnections(commerce: CommerceExecutionContext, tenantId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return (await this.store.listConnections(workspaceId)).filter((row) => row.tenantId === tenantId);
  }

  async saveConnection(commerce: CommerceExecutionContext, tenantId: string, input: Partial<M365Connection> & Pick<M365Connection, "displayName" | "microsoftTenantId" | "applicationId" | "credentialSecretId">) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const row: M365Connection = {
      id: input.id ?? newId(),
      tenantId,
      workspaceId,
      displayName: input.displayName,
      microsoftTenantId: input.microsoftTenantId,
      applicationId: input.applicationId,
      credentialSecretId: input.credentialSecretId,
      authMode: input.authMode ?? "CLIENT_SECRET",
      status: input.status ?? "CONFIGURED",
      enabled: input.enabled ?? true,
      createdBy: commerce.actorUserId ?? null,
      createdAt: input.createdAt ?? now(),
      updatedAt: now(),
    };
    assertNoSecretMaterialOnRecord(row as unknown as Record<string, unknown>);
    const saved = await this.store.saveConnection(row);
    await this.audit(tenantId, workspaceId, "connection_registration", "m365_connection", saved.id, commerce.actorUserId);
    return saved;
  }

  async registerSharePointRepository(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      repository: Omit<ManagedEngineeringRepository, "tenantId" | "workspaceId">;
      connectionId: string;
      externalSiteId: string;
      externalDriveId: string;
      approvedRootItemId?: string | null;
      contentAccessPolicy?: ContentAccessPolicy;
      publicationEnabled?: boolean;
    },
  ) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connection = await this.requireConnection(tenantId, workspaceId, input.connectionId);
    if (input.repository.repositoryType !== "SHAREPOINT_LIBRARY") throw new Error("repository_type_must_be_sharepoint_library");
    if (!input.repository.projectId && input.repository.scope === "PROJECT") throw new Error("project_scope_requires_project");
    const savedRepo = await this.deps.work.saveRepository(commerce, tenantId, {
      ...input.repository,
      tenantId,
      workspaceId,
      connectionId: connection.id,
      capturePolicy: input.repository.capturePolicy === "MANAGED" ? "MANAGED" : "DENY",
    });
    const scope = await this.store.saveScope({
      id: newId(),
      repositoryId: savedRepo.id,
      tenantId,
      workspaceId,
      connectionId: connection.id,
      externalSiteId: input.externalSiteId,
      externalDriveId: input.externalDriveId,
      approvedRootItemId: input.approvedRootItemId ?? null,
      contentAccessPolicy: input.contentAccessPolicy ?? "METADATA_ONLY",
      publicationEnabled: Boolean(input.publicationEnabled),
    });
    await this.audit(tenantId, workspaceId, "repository_registration", "managed_repository", savedRepo.id, commerce.actorUserId, {
      projectId: savedRepo.projectId,
      siteId: scope.externalSiteId,
      driveId: scope.externalDriveId,
      approvedRootItemId: scope.approvedRootItemId,
      contentAccessPolicy: scope.contentAccessPolicy,
    });
    return { repository: savedRepo, scope };
  }

  async disableRepository(commerce: CommerceExecutionContext, tenantId: string, repositoryId: string) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const repos = await this.deps.work.listRepositoriesForConnector(commerce, tenantId);
    const row = repos.find((item) => item.id === repositoryId);
    if (!row) throw new Error("not_found");
    const saved = await this.deps.work.saveRepository(commerce, tenantId, { ...row, enabled: false, capturePolicy: "DENY", updatedAt: now() });
    const sources = await this.store.listSources(workspaceId, row.projectId);
    for (const source of sources.filter((item) => item.repositoryId === repositoryId && item.availability === "ACTIVE")) {
      await this.store.saveSource({ ...source, availability: "DISABLED", recordedAt: now() });
    }
    await this.audit(tenantId, workspaceId, "repository_disable", "managed_repository", repositoryId, commerce.actorUserId);
    return saved;
  }

  async testConnection(commerce: CommerceExecutionContext, tenantId: string, connectionId: string) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connection = await this.requireConnection(tenantId, workspaceId, connectionId);
    const started = Date.now();
    try {
      const result = await this.graph.testConnection(connection);
      this.telemetry.apiRequestDurationMs.push(Date.now() - started);
      const status = (result.ok ? "READY" : result.status) as ConnectorStatus;
      await this.store.saveConnection({ ...connection, status, updatedAt: now() });
      return { ...result, status, secretsExposed: false };
    } catch (error) {
      this.telemetry.errors += 1;
      const status = this.statusFromError(error);
      await this.store.saveConnection({ ...connection, status, updatedAt: now() });
      return { ok: false, status, message: error instanceof Error ? error.message : "test_failed", secretsExposed: false };
    }
  }

  async enqueueSync(commerce: CommerceExecutionContext, tenantId: string, repositoryId: string, mode: "initial" | "delta" | "resync" = "delta") {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    await this.audit(tenantId, workspaceId, "manual_resync", "managed_repository", repositoryId, commerce.actorUserId, { mode });
    if (this.deps.jobs) {
      const job = await this.deps.jobs.create({
        tenantId,
        workspaceId,
        jobType: M365_JOB_TYPE,
        payload: { tenantId, workspaceId, repositoryId, mode, actorUserId: commerce.actorUserId },
        createdBy: commerce.actorUserId ?? undefined,
      });
      return { queued: true, jobId: job.id };
    }
    const result = await this.runSync(commerce, tenantId, repositoryId, mode);
    return { queued: false, result };
  }

  async runSync(commerce: CommerceExecutionContext, tenantId: string, repositoryId: string, mode: "initial" | "delta" | "resync" = "delta") {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const repos = await this.deps.work.listRepositoriesForConnector(commerce, tenantId);
    const repository = repos.find((row) => row.id === repositoryId);
    if (!repository || repository.tenantId !== tenantId) throw new Error("not_found");
    if (!repository.enabled || repository.capturePolicy !== "MANAGED") {
      return { skipped: true, reason: "repository_disabled", ingested: 0 };
    }
    const scope = await this.store.getScopeByRepository(repositoryId);
    if (!scope) return { skipped: true, reason: "scope_missing", ingested: 0 };
    const connection = await this.requireConnection(tenantId, workspaceId, scope.connectionId);
    if (!connection.enabled) return { skipped: true, reason: "connection_disabled", ingested: 0 };
    const existing = (await this.store.getSyncState(repositoryId)) ?? {
      id: newId(),
      repositoryId,
      tenantId,
      workspaceId,
      status: "SYNCING" as ConnectorStatus,
      deltaToken: null,
      lastSuccessfulSyncAt: null,
      lastAttemptedSyncAt: now(),
      lastError: null,
      itemsScanned: 0,
      itemsChanged: 0,
      throttleCount: 0,
      retryCount: 0,
      nextRetryAt: null,
      resyncRequired: false,
      durationMs: 0,
    };
    const started = Date.now();
    await this.store.saveSyncState({ ...existing, status: "SYNCING", lastAttemptedSyncAt: now() });
    try {
      const useDelta = mode !== "initial" && mode !== "resync" && existing.deltaToken && !existing.resyncRequired;
      const pages = await this.enumerate(connection, scope, useDelta ? existing.deltaToken : null);
      let changed = 0;
      const seen = new Set<string>();
      for (const item of pages.items) {
        if (item.folder) continue;
        if (isPersonalOneDriveItem(item)) continue;
        if (hasPathTraversal(item.pathWithinRoot ?? item.name)) continue;
        if (item.siteId !== scope.externalSiteId || item.driveId !== scope.externalDriveId) continue;
        const approvedRoot = repository.approvedRoot;
        if (approvedRoot && !itemWithinApprovedRoot(item.pathWithinRoot ?? `/${item.name}`, approvedRoot) && item.deleted !== true) {
          const previousOut = await this.store.findSourceByItem({ workspaceId, driveId: item.driveId, itemId: item.id });
          if (previousOut && previousOut.availability === "ACTIVE") {
            await this.applyItem(commerce, tenantId, repository, connection, scope, { ...item, deleted: true }, "MOVED_OUTSIDE_SCOPE");
            changed += 1;
          }
          continue;
        }
        seen.add(item.id);
        const applied = await this.applyItem(commerce, tenantId, repository, connection, scope, item, item.deleted ? "DELETED" : "ACTIVE");
        if (applied) changed += 1;
      }
      if (mode === "initial" || mode === "resync") {
        const known = await this.store.listSources(workspaceId, repository.projectId);
        for (const source of known.filter((row) => row.repositoryId === repositoryId && row.availability === "ACTIVE" && !seen.has(row.itemId))) {
          await this.store.saveSource({ ...source, availability: "UNAVAILABLE", recordedAt: now() });
        }
      }
      const durationMs = Date.now() - started;
      this.telemetry.syncDurationMs.push(durationMs);
      this.telemetry.itemsProcessed += pages.items.length;
      const ready: ConnectorSyncState = {
        ...existing,
        status: "READY",
        deltaToken: pages.deltaLink ?? existing.deltaToken,
        lastSuccessfulSyncAt: now(),
        lastAttemptedSyncAt: now(),
        lastError: null,
        itemsScanned: pages.items.length,
        itemsChanged: changed,
        resyncRequired: false,
        durationMs,
      };
      await this.store.saveSyncState(ready);
      await this.store.saveConnection({ ...connection, status: "READY", updatedAt: now() });
      return { skipped: false, ingested: changed, scanned: pages.items.length, durationMs, status: "READY" as const };
    } catch (error) {
      const status = this.statusFromError(error);
      if (status === "RATE_LIMITED") this.telemetry.throttles += 1;
      this.telemetry.errors += 1;
      const retryAfter = error instanceof GraphPortFailure ? error.failure.retryAfterMs ?? backoff(existing.retryCount) : backoff(existing.retryCount);
      await this.store.saveSyncState({
        ...existing,
        status,
        lastAttemptedSyncAt: now(),
        lastError: error instanceof Error ? error.message : "sync_failed",
        retryCount: existing.retryCount + 1,
        nextRetryAt: new Date(Date.now() + retryAfter).toISOString(),
        resyncRequired: status === "RESYNC_REQUIRED",
        durationMs: Date.now() - started,
      });
      if (status === "AUTHENTICATION_REQUIRED") {
        await this.store.saveConnection({ ...connection, status, updatedAt: now() });
      }
      return { skipped: false, ingested: 0, scanned: 0, durationMs: Date.now() - started, status, error: error instanceof Error ? error.message : "sync_failed" };
    }
  }

  async openManagedSource(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { sourceId?: string | null; informationRefId?: string | null; projectId?: string | null; url?: unknown },
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (rejectArbitraryUrlFetch(input.url)) return { ok: false as const, reason: "ARBITRARY_URL_FETCH_PROHIBITED" as const, privateUrlExposed: false };
    const sources = await this.store.listSources(workspaceId, input.projectId);
    const source = input.sourceId
      ? sources.find((row) => row.id === input.sourceId)
      : sources.find((row) => row.informationRefId === input.informationRefId);
    if (!source || source.tenantId !== tenantId) return { ok: false as const, reason: "SOURCE_NOT_FOUND" as const, privateUrlExposed: false };
    if (input.projectId && source.projectId !== input.projectId) {
      return { ok: false as const, reason: "PROJECT_ISOLATION" as const, privateUrlExposed: false };
    }
    const repos = await this.deps.work.listRepositories(commerce, tenantId, source.projectId);
    const repository = repos.find((row) => row.id === source.repositoryId);
    if (!repository || !repository.enabled) return { ok: false as const, reason: "REPOSITORY_UNAVAILABLE" as const, privateUrlExposed: false };
    const href = isGovernedSharePointWebUrl(source.webUrl) ? source.webUrl : "/engineering/information";
    return {
      ok: true as const,
      title: source.displayName,
      provider: "SharePoint",
      href,
      connectorImplemented: true,
      privateUrlExposed: false,
      availability: source.availability,
    };
  }

  async publishArtifact(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      repositoryId: string;
      fileName: string;
      content: Buffer;
      contentType: string;
      artifactId?: string | null;
      callerPath?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "work.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    if (input.callerPath) throw new Error("caller_supplied_sharepoint_path_rejected");
    assertContentSize(input.content);
    const repos = await this.deps.work.listRepositoriesForConnector(commerce, tenantId);
    const repository = repos.find((row) => row.id === input.repositoryId);
    if (!repository || repository.tenantId !== tenantId || !repository.enabled) throw new Error("repository_unavailable");
    const scope = await this.store.getScopeByRepository(repository.id);
    if (!scope || !scope.publicationEnabled) throw new Error("publication_not_enabled");
    const connection = await this.requireConnection(tenantId, workspaceId, scope.connectionId);
    const fileName = sanitizeArtifactFileName(input.fileName);
    const uploaded = await this.graph.upload({
      connection,
      driveId: scope.externalDriveId,
      parentId: scope.approvedRootItemId ?? "root",
      fileName,
      content: input.content,
      contentType: input.contentType,
    });
    const source = await this.applyItem(commerce, tenantId, repository, connection, scope, uploaded, "ACTIVE");
    await this.audit(tenantId, workspaceId, "artifact_publish", "external_source", source?.id ?? uploaded.id, commerce.actorUserId, {
      artifactId: input.artifactId,
      engineeringApproved: false,
    });
    return {
      ok: true as const,
      source,
      identity: microsoftSourceIdentity(uploaded),
      engineeringApproved: false,
      authoritative: false,
    };
  }

  async retrieveTemplateBinary(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { sourceId: string; expectedFormat: "XLSX" | "DOCX" | "PPTX" },
  ) {
    assertEngineeringService(commerce, "work.get", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const source = await this.store.getSource(input.sourceId);
    if (!source || source.tenantId !== tenantId || source.workspaceId !== workspaceId) {
      return { ok: false as const, reason: "TEMPLATE_UNAVAILABLE" as const, bytes: null };
    }
    const scope = await this.store.getScopeByRepository(source.repositoryId);
    if (!scope) return { ok: false as const, reason: "TEMPLATE_UNAVAILABLE" as const, bytes: null };
    const connection = await this.requireConnection(tenantId, workspaceId, scope.connectionId);
    if (scope.contentAccessPolicy === "METADATA_ONLY") {
      return { ok: false as const, reason: "TEMPLATE_UNAVAILABLE" as const, bytes: null };
    }
    try {
      const bytes = await this.graph.download({ connection, driveId: source.driveId, itemId: source.itemId });
      assertContentSize(bytes);
      assertOfficePackage(bytes, input.expectedFormat);
      return { ok: true as const, bytes, source, storedInPostgres: false };
    } catch {
      return { ok: false as const, reason: "TEMPLATE_UNAVAILABLE" as const, bytes: null };
    }
  }

  async registerTemplateSource(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { sourceId: string },
  ) {
    assertEngineeringService(commerce, "artifact.template.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const source = await this.store.getSource(input.sourceId);
    if (!source || source.tenantId !== tenantId || source.workspaceId !== workspaceId) throw new Error("not_found");
    await this.audit(tenantId, workspaceId, "template_source_registration", "external_source", source.id, commerce.actorUserId);
    return { ok: true as const, sourceId: source.id, binaryStoredInPostgres: false };
  }

  async searchManagedSources(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "search.query", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const sources = (await this.store.listSources(workspaceId, projectId)).filter((row) => row.tenantId === tenantId);
    return sources.map(toSearchHit);
  }

  async health(commerce: CommerceExecutionContext, tenantId: string, repositoryId?: string | null) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connections = (await this.store.listConnections(workspaceId)).filter((row) => row.tenantId === tenantId);
    const sync = repositoryId ? await this.store.getSyncState(repositoryId) : null;
    return {
      connections: connections.map((row) => ({
        id: row.id,
        displayName: row.displayName,
        status: row.status,
        enabled: row.enabled,
        microsoftTenantId: row.microsoftTenantId,
        credentialSecretIdPresent: Boolean(row.credentialSecretId),
        secretValuePresent: false,
      })),
      sync,
      telemetry: this.telemetry,
      maxContentBytes: MAX_CONTENT_BYTES,
    };
  }

  async listSources(commerce: CommerceExecutionContext, tenantId: string, projectId: string) {
    assertEngineeringService(commerce, "work.list", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    return (await this.store.listSources(workspaceId, projectId)).filter((row) => row.tenantId === tenantId);
  }

  private async enumerate(connection: M365Connection, scope: SharePointScope, deltaToken: string | null) {
    const items: GraphDriveItem[] = [];
    let skip: string | null = null;
    let deltaLink: string | null = deltaToken;
    if (deltaToken) {
      const page = await this.graph.delta({
        connection,
        siteId: scope.externalSiteId,
        driveId: scope.externalDriveId,
        rootItemId: scope.approvedRootItemId,
        deltaToken,
      });
      items.push(...page.items);
      return { items, deltaLink: page.deltaLink ?? deltaToken };
    }
    do {
      const page = await this.graph.listChildren({
        connection,
        siteId: scope.externalSiteId,
        driveId: scope.externalDriveId,
        rootItemId: scope.approvedRootItemId,
        skipToken: skip,
        pageSize: DEFAULT_PAGE_SIZE,
      });
      items.push(...page.items);
      skip = page.nextLink ?? null;
    } while (skip);
    const delta = await this.graph.delta({
      connection,
      siteId: scope.externalSiteId,
      driveId: scope.externalDriveId,
      rootItemId: scope.approvedRootItemId,
    });
    deltaLink = delta.deltaLink ?? null;
    return { items, deltaLink };
  }

  private async applyItem(
    commerce: CommerceExecutionContext,
    tenantId: string,
    repository: ManagedEngineeringRepository,
    connection: M365Connection,
    scope: SharePointScope,
    item: GraphDriveItem,
    availability: ExternalSourceRef["availability"],
  ) {
    const workspaceId = repository.workspaceId;
    const previous = await this.store.findSourceByItem({ workspaceId, driveId: item.driveId, itemId: item.id });
    const occurredAt = item.lastModifiedAt ?? now();
    if (previous && isOlderThanKnown(occurredAt, previous.occurredAt) && availability === "ACTIVE") {
      return null;
    }
    const next = graphItemToSource({
      tenantId,
      workspaceId,
      projectId: repository.projectId ?? "",
      repositoryId: repository.id,
      connection,
      scope,
      item,
      previous,
      availability,
    });
    const change = classifyGraphChange(previous, next);
    let informationRefId = previous?.informationRefId ?? null;
    if (change && availability === "ACTIVE") {
      const info = sourceToInformationRef({ ...next, informationRefId });
      const savedInfo = await this.deps.information.registerFromConnector(commerce, tenantId, info);
      informationRefId = savedInfo.id;
    }
    const saved = await this.store.saveSource({ ...next, informationRefId });
    if (change) {
      await this.deps.work.ingestFromConnector(commerce, tenantId, sourceToWorkSignal(saved, change === "FILE_MOVED" && previous?.displayName !== next.displayName && previous?.pathWithinRoot === next.pathWithinRoot ? "FILE_REVISED" : change));
    }
    return saved;
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

  private statusFromError(error: unknown): ConnectorStatus {
    if (error instanceof GraphPortFailure) {
      if (error.failure.kind === "AUTH") return "AUTHENTICATION_REQUIRED";
      if (error.failure.kind === "THROTTLE") return "RATE_LIMITED";
      if (error.failure.kind === "RESYNC") return "RESYNC_REQUIRED";
      if (error.failure.kind === "NETWORK") return "DEGRADED";
    }
    return "DEGRADED";
  }
}

function backoff(retryCount: number) {
  return Math.min(60_000, 400 * 2 ** Math.min(retryCount, 6));
}

export function createTestM365ConnectorService(input: {
  work: EngineeringWorkContextService;
  information: EngineeringInformationService;
  store?: M365Store;
  graph?: GraphPort;
}) {
  return new EngineeringM365ConnectorService({ from() { return this; } } as never, {
    work: input.work,
    information: input.information,
    store: input.store ?? createMemoryM365Store(),
    graph: input.graph ?? new MockGraphPort(),
  });
}
