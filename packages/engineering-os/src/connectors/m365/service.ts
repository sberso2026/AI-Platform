import type { SupabaseClient } from "@rtb/database";
import type { CommerceExecutionContext } from "@rtb/types";
import type { JobService } from "@rtb/platform-kernel";
import { assertEngineeringService, assertEngineeringTenantScope } from "../../commerce/service-guard";
import { workspaceScopeId } from "../../commerce/workspace-scope";
import { assertOfficePackage } from "../../artifact-automation/validate";
import { sanitizeArtifactFileName } from "../../artifact-automation/filename";
import type { EngineeringWorkContextService } from "../../work-context/service";
import type { EngineeringInformationService } from "../../information-intelligence/service";
import type { ManagedEngineeringRepository } from "../../work-context/types";
import { classifyGraphChange, graphItemToSource, sourceToInformationRef, sourceToWorkSignal, toSearchHit } from "./compose";
import { GraphPortFailure, MockGraphPort, type GraphPort } from "./graph";
import { isOlderThanKnown, microsoftSourceIdentity } from "./identity";
import { connectorBackoff, classifyConnectorFailure } from "../core/security";
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
import {
  evaluateSharePointLiveReadiness,
  SHAREPOINT_PILOT_MODE,
  sharePointPilotWriteEnabled,
  type SharePointLiveReadinessResult,
} from "./live-readiness";
import {
  assertTrustedMicrosoftIdentity,
  DEFAULT_M365_CONNECTION_MODE,
  ENTERPRISE_MANAGED_MODE_STATUS,
  mapGraphFailureToSetupState,
  parseSharePointSiteUrl,
  rtbMicrosoftAppConfig,
  safeOnboardingTelemetry,
  userFacingSetupMessage,
  userHealthForSetup,
  type DiscoveredLibrary,
  type M365SetupState,
  type RtbMicrosoftAppConfig,
  type TrustedMicrosoftIdentity,
  type UserHealthState,
} from "./onboarding";
import { SETUP_AGENT_ID, setupAgentNextAction } from "./setup-agent";
import type { MicrosoftOAuthCallbackStage } from "./oauth";

export type M365ConnectorDeps = {
  store?: M365Store;
  work: EngineeringWorkContextService;
  information: EngineeringInformationService;
  graph?: GraphPort;
  secrets?: ConnectorSecretsPort;
  jobs?: JobService;
  /** Fixture-only governed publication. Profile A pilot write remains disabled. */
  pilotWriteEnabled?: boolean;
  onboardingApp?: RtbMicrosoftAppConfig;
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
      pilotMode: SHAREPOINT_PILOT_MODE,
      writeEnabled: false,
      microsoftOptional: true,
      defaultConnectionMode: DEFAULT_M365_CONNECTION_MODE,
      enterpriseManagedMode: ENTERPRISE_MANAGED_MODE_STATUS,
      sitesReadAllRequired: false,
      filesReadAllRequired: false,
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
    assertNoSecretMaterialOnRecord(input as unknown as Record<string, unknown>);
    const rejectedUrl = rejectArbitraryUrlFetch((input as unknown as Record<string, unknown>).url ?? (input as unknown as Record<string, unknown>).graphUrl ?? (input as unknown as Record<string, unknown>).href);
    if (rejectedUrl) throw new Error(rejectedUrl);
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
      publicationEnabled: Boolean(this.pilotWriteEnabled() && input.publicationEnabled),
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

  private onboardingApp(): RtbMicrosoftAppConfig {
    return this.deps.onboardingApp ?? rtbMicrosoftAppConfig();
  }

  async onboardingDashboard(commerce: CommerceExecutionContext, tenantId: string, projectId?: string | null) {
    assertEngineeringTenantScope(commerce, tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connections = (await this.store.listConnections(workspaceId)).filter((row) => row.tenantId === tenantId);
    const connection = connections.find((row) => row.enabled) ?? connections[0] ?? null;
    const repos = (await this.deps.work.listRepositoriesForConnector(commerce, tenantId, projectId ?? null))
      .filter((row) => row.repositoryType === "SHAREPOINT_LIBRARY" && (!connection || row.connectionId === connection.id));
    const scopes = connection ? await this.store.listScopes(workspaceId) : [];
    const setupState = this.deriveSetupState(connection, repos, scopes);
    const sync = repos[0] ? await this.store.getSyncState(repos[0].id) : null;
    const sites = [];
    for (const repo of repos) {
      const scope = scopes.find((row) => row.repositoryId === repo.id);
      sites.push({
        repositoryId: repo.id,
        displayName: repo.displayName,
        webUrl: null as string | null,
        libraryName: repo.displayName,
        projectId: repo.projectId,
        enabled: repo.enabled,
        capturePolicy: repo.capturePolicy,
      });
      void scope;
    }
    const agent = setupAgentNextAction(setupState);
    return {
      microsoftOptional: true as const,
      connectionMode: DEFAULT_M365_CONNECTION_MODE,
      rtbMultitenantAppConfigured: this.onboardingApp().configured,
      setupState,
      userHealth: userHealthForSetup(setupState),
      message: userFacingSetupMessage(setupState),
      organisationName: connection?.displayName ?? null,
      permissionMode: "Sites.Selected",
      readOnly: true as const,
      writeEnabled: false as const,
      connectionId: connection?.id ?? null,
      connectionEnabled: connection?.enabled ?? false,
      sites,
      lastSuccessfulSyncAt: sync?.lastSuccessfulSyncAt ?? null,
      lastAttemptedSyncAt: sync?.lastAttemptedSyncAt ?? null,
      lastError: sync?.lastError ?? null,
      agent: { id: SETUP_AGENT_ID, command: agent.command, message: agent.message },
      liveMicrosoftProof: "DEFERRED_EXTERNAL_CONFIGURATION",
    };
  }

  async completeMicrosoftSignIn(
    commerce: CommerceExecutionContext,
    tenantId: string,
    identity: TrustedMicrosoftIdentity,
    onStage?: (stage: MicrosoftOAuthCallbackStage) => void,
  ) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    onStage?.("MICROSOFT_IDENTITY_VALIDATION");
    assertTrustedMicrosoftIdentity(identity);
    if (identity.consentRequired && !identity.adminConsentGranted) {
      return { setupState: "ADMIN_CONSENT_REQUIRED" as const, connection: null, message: userFacingSetupMessage("ADMIN_CONSENT_REQUIRED") };
    }
    const app = this.onboardingApp();
    if (!app.configured) throw new Error("RTB_APP_NOT_CONFIGURED");
    const existing = (await this.store.listConnections(workspaceId)).filter((row) => row.tenantId === tenantId);
    const prior = existing.find((row) => row.microsoftTenantId === identity.microsoftTenantId) ?? existing[0];
    onStage?.("CONNECTION_PERSISTENCE");
    const saved = await this.saveConnection(commerce, tenantId, {
      id: prior?.id,
      displayName: identity.organisationName?.trim() || "Microsoft 365",
      microsoftTenantId: identity.microsoftTenantId,
      applicationId: app.applicationId,
      credentialSecretId: app.credentialSecretId,
      authMode: "CLIENT_SECRET",
      status: "CONFIGURED",
      enabled: true,
      createdAt: prior?.createdAt,
    });
    onStage?.("POST_CONNECTION_SETUP");
    await this.audit(tenantId, workspaceId, "microsoft_onboarding_connected", "m365_connection", saved.id, commerce.actorUserId, safeOnboardingTelemetry({
      provider: "microsoft",
      authorizationStage: "tenant_connected",
      connectionMode: DEFAULT_M365_CONNECTION_MODE,
    }));
    return {
      setupState: "CONNECTED_NO_SITE" as const,
      connectionId: saved.id,
      organisationName: saved.displayName,
      message: userFacingSetupMessage("CONNECTED_NO_SITE"),
    };
  }

  async resolveApprovedSite(commerce: CommerceExecutionContext, tenantId: string, siteUrl: string) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const parsed = parseSharePointSiteUrl(siteUrl);
    const connections = (await this.store.listConnections(workspaceId)).filter((row) => row.tenantId === tenantId && row.enabled);
    const connection = connections[0];
    if (!connection) throw new Error("connection_missing");
    try {
      const site = await this.graph.resolveSite({ connection, hostname: parsed.hostname, path: parsed.path });
      const libraries = (await this.graph.listLibraries({ connection, siteId: site.siteId })).filter((row) => row.driveType !== "personal");
      await this.audit(tenantId, workspaceId, "microsoft_site_resolved", "sharepoint_site", site.siteId, commerce.actorUserId, safeOnboardingTelemetry({
        hostname: parsed.hostname,
        authorizationStage: "site_validated",
      }));
      return {
        setupState: libraries.length ? "LIBRARY_SELECTION_REQUIRED" as const : "SITE_CONNECTED" as const,
        site: { displayName: site.displayName, webUrl: site.webUrl, hostname: site.hostname, path: site.path, siteId: site.siteId },
        libraries: libraries.map((row) => ({ name: row.name, driveId: row.driveId, driveType: row.driveType })),
        message: userFacingSetupMessage("LIBRARY_SELECTION_REQUIRED"),
      };
    } catch (error) {
      const state = mapGraphFailureToSetupState(error instanceof Error ? error.message : "site_failed", error instanceof GraphPortFailure ? error.failure.kind : undefined);
      if (state === "SITE_PERMISSION_REQUIRED") {
        return { setupState: state, site: null, libraries: [] as DiscoveredLibrary[], message: userFacingSetupMessage(state) };
      }
      if (error instanceof GraphPortFailure && error.failure.kind === "NOT_FOUND") throw new Error("UNAPPROVED_SITE");
      throw error instanceof Error ? error : new Error("CONNECTION_ERROR");
    }
  }

  async selectApprovedLibrary(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: { siteUrl: string; libraryName?: string; driveId?: string; projectId?: string | null; displayName?: string },
  ) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const resolved = await this.resolveApprovedSite(commerce, tenantId, input.siteUrl);
    if (resolved.setupState === "SITE_PERMISSION_REQUIRED" || !resolved.site) {
      return { setupState: "SITE_PERMISSION_REQUIRED" as const, message: userFacingSetupMessage("SITE_PERMISSION_REQUIRED") };
    }
    const library = resolved.libraries.find((row) => row.driveId === input.driveId || row.name === input.libraryName);
    if (!library) throw new Error("library_unavailable");
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connections = (await this.store.listConnections(workspaceId)).filter((row) => row.tenantId === tenantId);
    const connection = connections.find((row) => row.enabled) ?? connections[0];
    if (!connection) throw new Error("connection_missing");
    const projectId = input.projectId?.trim() || null;
    const registered = await this.registerSharePointRepository(commerce, tenantId, {
      connectionId: connection.id,
      externalSiteId: resolved.site.siteId,
      externalDriveId: library.driveId,
      contentAccessPolicy: "METADATA_ONLY",
      publicationEnabled: false,
      repository: {
        id: newId(),
        projectId,
        scope: projectId ? "PROJECT" : "WORKSPACE",
        repositoryType: "SHAREPOINT_LIBRARY",
        externalRepositoryId: library.driveId,
        displayName: input.displayName?.trim() || library.name,
        approvedRoot: "/",
        connectionId: connection.id,
        enabled: true,
        capturePolicy: "MANAGED",
        createdBy: commerce.actorUserId ?? null,
        createdAt: now(),
        updatedAt: now(),
      },
    });
    await this.store.saveConnection({ ...connection, status: "READY", updatedAt: now() });
    return {
      setupState: "READY" as const,
      repositoryId: registered.repository.id,
      libraryName: library.name,
      projectId: registered.repository.projectId,
      message: userFacingSetupMessage("READY"),
    };
  }

  async userHealthCheck(commerce: CommerceExecutionContext, tenantId: string, repositoryId?: string | null) {
    assertEngineeringTenantScope(commerce, tenantId);
    const dashboard = await this.onboardingDashboard(commerce, tenantId);
    if (!dashboard.connectionId) {
      return { userHealth: "DISCONNECTED" as UserHealthState, setupState: dashboard.setupState, message: dashboard.message, diagnostics: { writeEnabled: false } };
    }
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connection = await this.requireConnection(tenantId, workspaceId, dashboard.connectionId);
    let auth: { ok: boolean; status: string; message: string };
    try {
      auth = await this.graph.testConnection(connection);
    } catch (error) {
      auth = { ok: false, status: "AUTHENTICATION_REQUIRED", message: error instanceof Error ? error.message : "auth_failed" };
    }
    const repos = (await this.deps.work.listRepositoriesForConnector(commerce, tenantId)).filter((row) => row.connectionId === connection.id && row.enabled);
    const repo = repositoryId ? repos.find((row) => row.id === repositoryId) : repos[0];
    const scope = repo ? await this.store.getScopeByRepository(repo.id) : null;
    let metadataRead = false;
    let setupState: M365SetupState = dashboard.setupState;
    if (!auth.ok) {
      setupState = mapGraphFailureToSetupState(auth.message, "AUTH");
    } else if (scope && repo) {
      try {
        await this.graph.listChildren({ connection, siteId: scope.externalSiteId, driveId: scope.externalDriveId, pageSize: 1 });
        metadataRead = true;
        setupState = "READY";
      } catch (error) {
        setupState = mapGraphFailureToSetupState(error instanceof Error ? error.message : "health_failed", error instanceof GraphPortFailure ? error.failure.kind : undefined);
      }
    }
    const userHealth = userHealthForSetup(setupState);
    return {
      userHealth,
      setupState,
      message: userFacingSetupMessage(setupState),
      diagnostics: {
        microsoftAuthentication: auth.ok,
        approvedTenant: Boolean(connection.microsoftTenantId),
        approvedSite: Boolean(scope?.externalSiteId),
        approvedLibrary: Boolean(scope?.externalDriveId),
        readOnlyPolicy: true,
        writeEnabled: false,
        repositoryAllowlist: Boolean(repo?.enabled && repo.capturePolicy === "MANAGED"),
        metadataRead,
        permissionMode: "Sites.Selected",
      },
    };
  }

  async disconnectConnection(commerce: CommerceExecutionContext, tenantId: string, connectionId: string) {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connection = await this.requireConnection(tenantId, workspaceId, connectionId);
    const saved = await this.store.saveConnection({ ...connection, enabled: false, status: "BLOCKED", updatedAt: now() });
    const repos = (await this.deps.work.listRepositoriesForConnector(commerce, tenantId)).filter((row) => row.connectionId === connectionId);
    for (const repo of repos) {
      await this.disableRepository(commerce, tenantId, repo.id);
    }
    await this.audit(tenantId, workspaceId, "microsoft_disconnected", "m365_connection", connectionId, commerce.actorUserId, safeOnboardingTelemetry({
      authorizationStage: "connection_removed",
      historicalProvenancePreserved: true,
    }));
    return { setupState: "NOT_CONNECTED" as const, connectionId: saved.id, historicalProvenancePreserved: true, message: userFacingSetupMessage("NOT_CONNECTED") };
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
      const authDenied = status === "AUTHENTICATION_REQUIRED";
      const retryAfter = error instanceof GraphPortFailure ? error.failure.retryAfterMs ?? connectorBackoff(existing.retryCount) : connectorBackoff(existing.retryCount);
      await this.store.saveSyncState({
        ...existing,
        status,
        lastAttemptedSyncAt: now(),
        lastError: error instanceof Error ? error.message : "sync_failed",
        retryCount: authDenied ? existing.retryCount : existing.retryCount + 1,
        nextRetryAt: authDenied ? null : new Date(Date.now() + retryAfter).toISOString(),
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
    if (!this.pilotWriteEnabled()) throw new Error("sharepoint_pilot_write_disabled");
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
      writeEnabled: false,
      pilotMode: SHAREPOINT_PILOT_MODE,
    };
  }

  async liveReadReadiness(
    commerce: CommerceExecutionContext,
    tenantId: string,
    repositoryId?: string | null,
    callerBody?: Record<string, unknown> | null,
  ): Promise<SharePointLiveReadinessResult> {
    assertEngineeringService(commerce, "work.repository.write", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const connections = (await this.store.listConnections(workspaceId)).filter((row) => row.tenantId === tenantId);
    const connection = connections[0] ?? null;
    const repos = await this.deps.work.listRepositoriesForConnector(commerce, tenantId);
    const repository = repositoryId ? repos.find((row) => row.id === repositoryId) : repos[0];
    const scope = repository ? await this.store.getScopeByRepository(repository.id) : null;
    let graphTest: { ok: boolean; status: string; message: string } | null = null;
    if (connection?.credentialSecretId) {
      try {
        graphTest = await this.graph.testConnection(connection);
      } catch (error) {
        graphTest = { ok: false, status: this.statusFromError(error), message: error instanceof Error ? error.message : "test_failed" };
      }
    }
    const secretValuePresent = connection
      ? Boolean(connection.credentialSecretId) && (this.deps.secrets ? Boolean(await this.deps.secrets.getSecretValue(connection.credentialSecretId)) : null)
      : null;
    return evaluateSharePointLiveReadiness({
      connection,
      scope,
      repositoryEnabled: repository?.enabled,
      repositoryAllowlisted: Boolean(repository?.enabled && repository.capturePolicy === "MANAGED"),
      secretValuePresent,
      graphTest,
      callerBody,
    });
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

  private deriveSetupState(
    connection: M365Connection | null,
    repos: Array<{ enabled: boolean; capturePolicy: string; connectionId: string | null }>,
    scopes: SharePointScope[],
  ): M365SetupState {
    if (!connection) return "NOT_CONNECTED";
    if (!connection.enabled) return "NOT_CONNECTED";
    if (connection.status === "AUTHENTICATION_REQUIRED") return "AUTH_EXPIRED";
    if (connection.status === "BLOCKED") return "PERMISSION_REVOKED";
    const managed = repos.filter((row) => row.enabled && row.capturePolicy === "MANAGED");
    if (managed.length && scopes.some((row) => managed.some((repo) => repo.connectionId === connection.id))) {
      return "READY";
    }
    return "CONNECTED_NO_SITE";
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

  private pilotWriteEnabled() {
    return this.deps.pilotWriteEnabled === true || sharePointPilotWriteEnabled();
  }

  private statusFromError(error: unknown): ConnectorStatus {
    if (error instanceof GraphPortFailure) {
      return classifyConnectorFailure(error.failure.kind);
    }
    return "DEGRADED";
  }
}

export function createTestM365ConnectorService(input: {
  work: EngineeringWorkContextService;
  information: EngineeringInformationService;
  store?: M365Store;
  graph?: GraphPort;
  secrets?: ConnectorSecretsPort;
  pilotWriteEnabled?: boolean;
  onboardingApp?: RtbMicrosoftAppConfig;
}) {
  return new EngineeringM365ConnectorService({ from() { return this; } } as never, {
    work: input.work,
    information: input.information,
    store: input.store ?? createMemoryM365Store(),
    graph: input.graph ?? new MockGraphPort(),
    secrets: input.secrets,
    pilotWriteEnabled: input.pilotWriteEnabled,
    onboardingApp: input.onboardingApp,
  });
}
