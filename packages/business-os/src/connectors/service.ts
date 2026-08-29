import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import { BUSINESS_OS_EVENT_TYPES, type BosConnectorId, type BosConnectorMode } from "@rtb/types";
import type { OwnerCommandScope } from "../owner-command/service";
import { BOS_CONNECTOR_ADAPTERS } from "./adapters";
import { BOS_CONNECTOR_CATALOG, connectorContract } from "./catalog";
import { previewCsv } from "./csv";
import { CONNECTORS_HARDENING_CONTRACT } from "./extensions";
import type {
  ConnectorActor,
  ConnectorImportBatch,
  ConnectorInstallation,
  ConnectorStagingRecord,
  ConnectorStore,
  ConnectorSyncRun,
} from "./ports";
import { assertNoInlineSecrets, assertConnectorUrl, redactSecrets } from "./security";
import { BusinessConnectorRepository } from "./repository";
import { XeroProviderClient } from "./xero-client";
import { resolveXeroSecrets } from "./xero-secrets";
import { xeroSafeTelemetry } from "./xero-telemetry";
import { Microsoft365ProviderClient } from "./m365-client";
import { resolveMs365Secrets } from "./m365-secrets";
import { m365SafeTelemetry } from "./m365-telemetry";
import { MS365_ALLOWED_GRAPH_SCOPES, ms365ConnectionState } from "./m365-policy";
import { HubSpotProviderClient } from "./hubspot-client";
import { resolveHubSpotSecrets } from "./hubspot-secrets";
import { hubspotSafeTelemetry } from "./hubspot-telemetry";
import { HUBSPOT_ALLOWED_OAUTH_SCOPES, hubspotConnectionState } from "./hubspot-policy";
import {
  assertSuppressedIdentityBlocked,
  redactSuppressedPayload,
  reconstructableSuppressedIdentityLeak,
} from "./suppression";

export const BOS_12_PERFORMANCE_BOUNDS = {
  dashboardMs: 250,
  graphContextMs: 250,
  agentContextMs: 250,
  connectorSyncMs: 250,
  searchMs: 250,
  diagnosticsMs: 250,
  maxImportRows: 10_000,
  maxPages: 10,
  maxRetries: 3,
  maxGraphDepth: 2,
} as const;

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

function assertHuman(actor: ConnectorActor): void {
  if (actor.actorType !== "human") throw new Error("self_registration_forbidden");
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function sleepMs(_ms: number): void {
  // Deterministic bounded retry placeholder; adapters are in-process fixtures.
}

export type BosConnectorsOptions = {
  store?: ConnectorStore;
};

export class BosConnectorsService {
  readonly store: ConnectorStore;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    options: BosConnectorsOptions = {},
  ) {
    this.store = options.store ?? new BusinessConnectorRepository(supabase);
  }

  contract() {
    return CONNECTORS_HARDENING_CONTRACT;
  }

  status() {
    return {
      implemented: true as const,
      implementsOwnAiStack: false as const,
      duplicateIntegrationStackDetected: false as const,
      duplicateAgentRuntimeDetected: false as const,
      duplicateKnowledgeGraphDetected: false as const,
      ExternalWritesDisabled: true as const,
      NoVendorHardDependency: true as const,
      ReadFirst: true as const,
      agentRegistryMismatchBlocksExecution: true as const,
      suppressedIdentityReconstructionBlocked: true as const,
      crossTenantConnectorAccess: false as const,
      directAgentProviderAccess: false as const,
      unrestrictedExternalProxy: false as const,
      optional: true as const,
      requiredForBusinessOs: false as const,
    };
  }

  catalog() {
    return BOS_CONNECTOR_CATALOG.map((row) => ({
      ...row,
      live: false as const,
      fixtureDefault: true as const,
      writeLabel: "READ ONLY" as const,
    }));
  }

  writeExternal(): never {
    throw new Error("connector_write_forbidden");
  }

  proxyArbitraryUrl(): never {
    throw new Error("unrestricted_external_proxy_forbidden");
  }

  callProviderFromAgent(): never {
    throw new Error("direct_provider_access_forbidden");
  }

  assertConnectorUrl(connectorId: BosConnectorId, url: string) {
    return assertConnectorUrl(connectorId, url);
  }

  async overview(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const [installations, runs, imports, diagnostics] = await Promise.all([
      this.store.listInstallations(scope),
      this.store.listRuns(scope),
      this.store.listImports(scope),
      this.diagnostics(scope),
    ]);
    return {
      contract: this.contract(),
      catalog: this.catalog(),
      installations: installations.map((row) => this.publicInstallation(row)),
      runs: runs.map((row) => redactSecrets(row)),
      imports: imports.map((row) => redactSecrets(row)),
      diagnostics,
      usableWithoutConnectors: true as const,
      writeLabel: "READ ONLY" as const,
    };
  }

  async configure(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: {
      connectorId: BosConnectorId;
      secretId?: string | null;
      mode?: BosConnectorMode;
      expectedProviderOrgId?: string | null;
    },
    actor: ConnectorActor,
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor);
    assertNoInlineSecrets(input as unknown as Record<string, unknown>);
    const contract = connectorContract(input.connectorId);
    const existing = await this.store.getInstallationByConnector(scope, input.connectorId);
    if (existing && existing.health === "revoked") {
      // reconfigure after revoke creates a new installation
    }
    const requestedMode = input.mode ?? contract.defaultMode;
    const hasSecret = Boolean(input.secretId);
    const expectedProviderOrgId =
      typeof input.expectedProviderOrgId === "string" && input.expectedProviderOrgId.trim()
        ? input.expectedProviderOrgId.trim()
        : ((existing?.provenance.expectedProviderOrgId as string | undefined) ?? "");
    const xeroLive = input.connectorId === "xero" && requestedMode === "live";
    const m365Live = input.connectorId === "microsoft_365" && requestedMode === "live";
    const hubspotLive = input.connectorId === "hubspot" && requestedMode === "live";
    const boundLive = (xeroLive || m365Live || hubspotLive) && hasSecret && Boolean(expectedProviderOrgId);
    const effectiveMode: BosConnectorMode = xeroLive || m365Live || hubspotLive
      ? "live"
      : requestedMode === "live" && hasSecret
        ? "live"
        : requestedMode === "live"
          ? "fixture"
          : requestedMode;
    const health =
      (xeroLive || m365Live || hubspotLive) && !boundLive
        ? ("unavailable" as const)
        : requestedMode === "live" && !hasSecret
          ? ("unavailable" as const)
          : ("configured" as const);
    const row: ConnectorInstallation = {
      id: existing?.id ?? newId("bos12-install"),
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      connectorId: input.connectorId,
      version: contract.version,
      requestedMode,
      effectiveMode,
      health,
      writeClassification: "read_only",
      secretId: input.secretId ?? existing?.secretId ?? null,
      dataClasses: [...contract.dataClasses],
      mappingVersion: contract.mappingVersion,
      cursor: existing?.cursor ?? null,
      lastSuccessfulSyncAt: existing?.lastSuccessfulSyncAt ?? null,
      lastSyncAt: existing?.lastSyncAt ?? null,
      recordsProcessed: existing?.recordsProcessed ?? 0,
      recordsRejected: existing?.recordsRejected ?? 0,
      conflicts: existing?.conflicts ?? 0,
      rateLimitState: "ok",
      errorCategory:
        health === "unavailable"
          ? (xeroLive || m365Live || hubspotLive) && hasSecret && !expectedProviderOrgId
            ? xeroLive
              ? "xero_org_unbound"
              : m365Live
                ? "m365_tenant_unbound"
                : "hubspot_portal_unbound"
            : "live_credentials_unavailable"
          : null,
      errorMessage:
        health === "unavailable"
          ? xeroLive
            ? "LIVE Xero requested without complete secret_id and expected provider org binding; fixture data will not be returned as live"
            : m365Live
              ? "LIVE Microsoft 365 requested without complete secret_id and expected directory binding; fixture data will not be returned as live"
              : hubspotLive
                ? "LIVE HubSpot requested without complete secret_id and expected portal binding; fixture data will not be returned as live"
              : "LIVE requested but no platform secret_id is present; fixture/sandbox remains the honest mode"
          : null,
      revokedAt: null,
      configuredBy: actor.userId,
      provenance: {
        contract: contract.version,
        secretRefOnly: true,
        live: effectiveMode === "live" && hasSecret,
        expectedProviderOrgId: expectedProviderOrgId || null,
        providerOrgId: (existing?.provenance.providerOrgId as string | null | undefined) ?? null,
      },
      createdAt: existing?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
    await this.store.upsertInstallation(row);
    await this.auditSafe(scope, "configure", "business_os_connector_installation", row.id, {
      connectorId: row.connectorId,
      effectiveMode: row.effectiveMode,
      secretIdPresent: Boolean(row.secretId),
      expectedProviderOrgId: expectedProviderOrgId || null,
    });
    await this.emit(scope, "business_os.connectors.configured", {
      installationId: row.id,
      connectorId: row.connectorId,
      effectiveMode: row.effectiveMode,
    });
    return this.publicInstallation(row);
  }

  async revoke(raw: { tenantId: string; workspaceId?: string; userId: string }, id: string, actor: ConnectorActor) {
    const scope = requireWorkspace(raw);
    assertHuman(actor);
    const installation = await this.requireInstallation(scope, id);
    const next: ConnectorInstallation = {
      ...installation,
      health: "revoked",
      secretId: null,
      revokedAt: nowIso(),
      updatedAt: nowIso(),
      errorCategory: "revoked",
      errorMessage: "Connector revoked; secret reference cleared",
      provenance: {
        ...installation.provenance,
        disconnectedAt: nowIso(),
        providerRevocation:
          installation.connectorId === "xero"
            ? await this.attemptXeroProviderRevocation(installation)
            : installation.connectorId === "microsoft_365"
              ? await this.attemptMs365ProviderRevocation(installation)
              : installation.connectorId === "hubspot"
                ? await this.attemptHubSpotProviderRevocation(installation)
                : "not_applicable",
      },
    };
    await this.store.upsertInstallation(next);
    await this.auditSafe(scope, "revoke", "business_os_connector_installation", next.id, {
      connectorId: next.connectorId,
    });
    await this.emit(scope, "business_os.connectors.revoked", {
      installationId: next.id,
      connectorId: next.connectorId,
    });
    return this.publicInstallation(next);
  }

  async sync(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { installationId: string; simulate?: "timeout" | "rate_limit" | "partial"; cancel?: boolean },
    actor: ConnectorActor,
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor);
    const installation = await this.requireInstallation(scope, input.installationId);
    if (installation.health === "revoked") throw new Error("connector_revoked");
    const contract = connectorContract(installation.connectorId);
    const idempotencyKey = `${installation.id}:${installation.cursor ?? "start"}:${installation.mappingVersion}`;
    const prior = await this.store.getRunByIdempotency(scope, idempotencyKey);
    if (prior && (prior.status === "completed" || prior.status === "partial") && !input.simulate) {
      return prior;
    }
    if (input.cancel) {
      const cancelled = await this.store.upsertRun({
        id: newId("bos12-run"),
        installationId: installation.id,
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        connectorId: installation.connectorId,
        status: "cancelled",
        recordsProcessed: 0,
        recordsRejected: 0,
        conflicts: 0,
        duplicates: 0,
        checkpoint: installation.cursor,
        idempotencyKey,
        errorCategory: "cancelled",
        cancelled: true,
        startedAt: nowIso(),
        completedAt: nowIso(),
        provenance: { idempotent: true },
      });
      return cancelled;
    }

    const run: ConnectorSyncRun = {
      id: newId("bos12-run"),
      installationId: installation.id,
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      connectorId: installation.connectorId,
      status: "started",
      recordsProcessed: 0,
      recordsRejected: 0,
      conflicts: 0,
      duplicates: 0,
      checkpoint: installation.cursor,
      idempotencyKey,
      errorCategory: null,
      cancelled: false,
      startedAt: nowIso(),
      completedAt: null,
      provenance: { mappingVersion: installation.mappingVersion, mode: installation.effectiveMode },
    };
    await this.store.upsertRun(run);
    await this.emit(scope, "business_os.connectors.sync_started", {
      runId: run.id,
      connectorId: installation.connectorId,
    });

    const adapter = BOS_CONNECTOR_ADAPTERS[installation.connectorId];
    let pages = 0;
    let cursor = installation.cursor;
    let processed = 0;
    let rejected = 0;
    let conflicts = 0;
    let duplicates = 0;
    let timedOut = false;
    let rateLimited = false;
    let partial = false;
    const existingStaging = await this.store.listStaging(scope);

    while (pages < Math.min(contract.rateLimit.maxPages, BOS_12_PERFORMANCE_BOUNDS.maxPages)) {
      pages += 1;
      let attempt = 0;
      let page = await adapter.readPage({
        cursor,
        secretId: installation.secretId,
        mode: installation.effectiveMode,
        simulate: input.simulate,
        tenantId: installation.tenantId,
        workspaceId: installation.workspaceId,
        installationId: installation.id,
        expectedProviderOrgId: (installation.provenance.expectedProviderOrgId as string | null | undefined) ?? null,
      });
      while (page.timedOut && attempt < contract.retryPolicy.maxAttempts) {
        attempt += 1;
        sleepMs(contract.retryPolicy.backoffMs[Math.min(attempt - 1, contract.retryPolicy.backoffMs.length - 1)] ?? 50);
        page = await adapter.readPage({
          cursor,
          secretId: installation.secretId,
          mode: installation.effectiveMode,
          simulate: input.simulate,
          tenantId: installation.tenantId,
          workspaceId: installation.workspaceId,
          installationId: installation.id,
          expectedProviderOrgId: (installation.provenance.expectedProviderOrgId as string | null | undefined) ?? null,
        });
      }
      if (page.timedOut) {
        timedOut = true;
        break;
      }
      if (page.rateLimited) {
        rateLimited = true;
        break;
      }
      if (page.errorCategory && page.records.length === 0) {
        timedOut = page.errorCategory === "xero_timeout" || page.errorCategory === "m365_timeout" || page.errorCategory === "hubspot_timeout";
        rateLimited = page.errorCategory === "xero_rate_limited" || page.errorCategory === "m365_rate_limited" || page.errorCategory === "hubspot_rate_limited";
        partial = true;
        run.errorCategory = page.errorCategory;
        break;
      }
      if (page.partial) partial = true;
      for (const record of page.records) {
        const suppressed = Boolean(record.suppressed);
        const payload = redactSuppressedPayload({ ...record.payload, suppressed }, suppressed);
        if (reconstructableSuppressedIdentityLeak(payload)) {
          rejected += 1;
          continue;
        }
        const duplicate = existingStaging.some(
          (row) =>
            row.connectorId === installation.connectorId && row.externalSourceId === record.externalSourceId,
        );
        const conflict = Boolean(
          (record.payload as { canonicalId?: string }).canonicalId &&
            (record.payload as { canonicalId?: string }).canonicalId !== record.externalSourceId,
        );
        if (duplicate) duplicates += 1;
        if (conflict) conflicts += 1;
        const staged: ConnectorStagingRecord = {
          id: newId("bos12-stage"),
          tenantId: scope.tenantId,
          workspaceId: scope.workspaceId,
          connectorId: installation.connectorId,
          installationId: installation.id,
          syncRunId: run.id,
          provider: contract.provider,
          externalSourceId: record.externalSourceId,
          dataClass: record.dataClass,
          retrievedAt: nowIso(),
          sourceUpdatedAt: record.sourceUpdatedAt,
          mappingVersion: installation.mappingVersion,
          freshness: nowIso(),
          payload,
          matchStatus: duplicate ? "duplicate" : conflict ? "conflict" : "unmatched",
          conflictReason: conflict ? "external record does not overwrite canonical BOS ownership" : null,
          canonicalEntityType: null,
          canonicalEntityId: null,
          becomesCanonical: false,
          suppressed,
          provenance: {
            provider: contract.provider,
            runId: run.id,
            mappingVersion: installation.mappingVersion,
            live: installation.effectiveMode === "live",
            fixture: installation.effectiveMode !== "live",
          },
        };
        assertSuppressedIdentityBlocked(staged);
        await this.store.upsertStaging(staged);
        existingStaging.push(staged);
        processed += 1;
      }
      cursor = page.nextCursor;
      if (!cursor) break;
    }

    const status: ConnectorSyncRun["status"] = timedOut || (Boolean(run.errorCategory) && processed === 0 && !rateLimited)
      ? "failed"
      : rateLimited || partial
        ? "partial"
        : "completed";
    const errorCategory = timedOut
      ? "timeout"
      : rateLimited
        ? "rate_limited"
        : run.errorCategory && processed === 0
          ? run.errorCategory
          : null;
    const completed: ConnectorSyncRun = {
      ...run,
      status,
      recordsProcessed: processed,
      recordsRejected: rejected,
      conflicts,
      duplicates,
      checkpoint: cursor,
      errorCategory,
      completedAt: nowIso(),
    };
    await this.store.upsertRun(completed);
    const nextHealth =
      status === "failed" ? "unavailable" : status === "partial" ? "degraded" : "healthy";
    await this.store.upsertInstallation({
      ...installation,
      health: nextHealth,
      cursor: cursor ?? installation.cursor,
      lastSyncAt: nowIso(),
      lastSuccessfulSyncAt: status === "completed" || status === "partial" ? nowIso() : installation.lastSuccessfulSyncAt,
      recordsProcessed: processed,
      recordsRejected: rejected,
      conflicts,
      rateLimitState: rateLimited ? "limited" : "ok",
      errorCategory,
      errorMessage: errorCategory,
      updatedAt: nowIso(),
      provenance: {
        ...installation.provenance,
        live: installation.effectiveMode === "live",
        fixture: installation.effectiveMode !== "live",
        providerOrgId:
          installation.effectiveMode === "live" && status !== "failed"
            ? ((installation.provenance.expectedProviderOrgId as string | null | undefined) ??
              (installation.provenance.providerOrgId as string | null | undefined) ??
              null)
            : (installation.provenance.providerOrgId as string | null | undefined) ?? null,
      },
    });
    const event =
      status === "failed" ? "business_os.connectors.sync_failed" : "business_os.connectors.sync_completed";
    await this.emit(scope, event, {
      runId: completed.id,
      connectorId: installation.connectorId,
      status,
      recordsProcessed: processed,
    });
    await this.auditSafe(scope, "sync", "business_os_connector_sync_run", completed.id, {
      connectorId: installation.connectorId,
      status,
      recordsProcessed: processed,
    });
    return completed;
  }

  async previewImport(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { filename: string; content: string; entityType: string; mapping?: Record<string, string> },
    actor: ConnectorActor,
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor);
    const preview = previewCsv(input);
    const batch: ConnectorImportBatch = {
      id: newId("bos12-import"),
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      filename: preview.filename,
      entityType: preview.entityType,
      status: "previewed",
      rowCount: preview.rows.length,
      validCount: preview.validCount,
      rejectedCount: preview.rejectedCount,
      duplicates: preview.duplicates,
      conflicts: preview.conflicts,
      mapping: preview.mapping,
      mappingVersion: preview.mappingVersion,
      contentHash: preview.contentHash,
      committedAt: null,
      provenance: { preview: true, fixture: true },
    };
    await this.store.upsertImport(batch);
    await this.auditSafe(scope, "import_preview", "business_os_connector_import_batch", batch.id, {
      filename: batch.filename,
      entityType: batch.entityType,
    });
    return { batch, preview: { ...preview, rows: preview.displayRows } };
  }

  async commitImport(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { batchId: string; content: string },
    actor: ConnectorActor,
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor);
    const batch = await this.store.getImport(scope, input.batchId);
    if (!batch) throw new Error("import batch not found");
    if (batch.status === "committed") return batch;
    const preview = previewCsv({
      filename: batch.filename,
      content: input.content,
      entityType: batch.entityType,
      mapping: batch.mapping,
    });
    if (preview.contentHash !== batch.contentHash) throw new Error("import_validation_failed");
    if (preview.issues.some((issue) => issue.code === "formula_injection_forbidden")) {
      throw new Error("formula_injection_forbidden");
    }
    const csvInstall =
      (await this.store.getInstallationByConnector(scope, "csv_excel")) ??
      (await this.configure(scope, { connectorId: "csv_excel", mode: "fixture" }, actor));
    const installation = await this.requireInstallation(scope, csvInstall.id);
    const run = await this.store.upsertRun({
      id: newId("bos12-run"),
      installationId: installation.id,
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      connectorId: "csv_excel",
      status: "completed",
      recordsProcessed: preview.validCount,
      recordsRejected: preview.rejectedCount,
      conflicts: preview.conflicts,
      duplicates: preview.duplicates,
      checkpoint: batch.id,
      idempotencyKey: `${scope.tenantId}:${scope.workspaceId}:${batch.contentHash}:${batch.mappingVersion}`,
      errorCategory: null,
      cancelled: false,
      startedAt: nowIso(),
      completedAt: nowIso(),
      provenance: { import: true },
    });
    for (const row of preview.rows) {
      const suppressed = Boolean(row.suppressed === "true" || row.suppressed === "1");
      const payload = redactSuppressedPayload({ ...row, suppressed }, suppressed);
      assertSuppressedIdentityBlocked(payload);
      await this.store.upsertStaging({
        id: newId("bos12-stage"),
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        connectorId: "csv_excel",
        installationId: installation.id,
        syncRunId: run.id,
        provider: "file_import",
        externalSourceId: row.external_id || row.name,
        dataClass: batch.entityType,
        retrievedAt: nowIso(),
        sourceUpdatedAt: null,
        mappingVersion: batch.mappingVersion,
        freshness: nowIso(),
        payload,
        matchStatus: "unmatched",
        conflictReason: null,
        canonicalEntityType: batch.entityType,
        canonicalEntityId: null,
        becomesCanonical: false,
        suppressed,
        provenance: { batchId: batch.id, mappingVersion: batch.mappingVersion, fixture: true },
      });
    }
    const committed: ConnectorImportBatch = {
      ...batch,
      status: "committed",
      committedAt: nowIso(),
    };
    await this.store.upsertImport(committed);
    await this.emit(scope, "business_os.connectors.import_committed", {
      batchId: committed.id,
      entityType: committed.entityType,
    });
    await this.auditSafe(scope, "import_commit", "business_os_connector_import_batch", committed.id, {
      entityType: committed.entityType,
      rowCount: committed.rowCount,
    });
    return committed;
  }

  async updateMapping(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { installationId: string; mappingVersion: string },
    actor: ConnectorActor,
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor);
    const installation = await this.requireInstallation(scope, input.installationId);
    if (!input.mappingVersion?.trim()) throw new Error("import_validation_failed");
    const next = { ...installation, mappingVersion: input.mappingVersion.trim(), updatedAt: nowIso() };
    await this.store.upsertInstallation(next);
    await this.emit(scope, "business_os.connectors.mapping_updated", {
      installationId: next.id,
      mappingVersion: next.mappingVersion,
    });
    await this.auditSafe(scope, "mapping_update", "business_os_connector_installation", next.id, {
      mappingVersion: next.mappingVersion,
    });
    return this.publicInstallation(next);
  }

  async diagnostics(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const installations = await this.store.listInstallations(scope);
    const staging = await this.store.listStaging(scope);
    const leak = staging.some((row) => reconstructableSuppressedIdentityLeak(row));
    return {
      findings: [
        ...installations
          .filter((row) => row.health === "unavailable" || row.health === "degraded")
          .map((row) => ({
            code: row.health === "unavailable" ? "connector_unavailable" : "connector_degraded",
            severity: row.health === "unavailable" ? ("warning" as const) : ("watch" as const),
            message: `${row.connectorId} is ${row.health}`,
            repaired: false as const,
          })),
        ...(leak
          ? [
              {
                code: "suppressed_identity_reconstruction",
                severity: "critical" as const,
                message: "Suppressed identity leaked into connector staging",
                repaired: false as const,
              },
            ]
          : []),
      ],
      installations: installations.map((row) => ({
        connectorId: row.connectorId,
        health: row.health,
        effectiveMode: row.effectiveMode,
        lastSuccessfulSyncAt: row.lastSuccessfulSyncAt,
        recordsProcessed: row.recordsProcessed,
        recordsRejected: row.recordsRejected,
        conflicts: row.conflicts,
        rateLimitState: row.rateLimitState,
        errorCategory: row.errorCategory,
        writeLabel: "READ ONLY" as const,
        liveLabel: row.effectiveMode === "live" ? ("LIVE" as const) : ("FIXTURE/SANDBOX" as const),
      })),
      usableWithoutConnectors: true as const,
    };
  }

  async assertAgentContextGates(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const staging = await this.store.listStaging(scope);
    if (staging.length === 0) return { applied: false as const };
    const installations = await this.store.listInstallations(scope);
    for (const row of staging) {
      if (row.tenantId !== scope.tenantId) throw new Error("cross_tenant_connector_forbidden");
      if (row.workspaceId !== scope.workspaceId) throw new Error("cross_workspace_graph_forbidden");
      if (!row.provenance || !row.provider || !row.syncRunId) throw new Error("provenance_required");
      const installation = installations.find((item) => item.id === row.installationId);
      if (!installation || installation.health === "revoked" || installation.health === "unavailable") {
        throw new Error("connector_unhealthy");
      }
      const contract = connectorContract(row.connectorId);
      if (contract.freshnessPolicyHours > 0 && row.freshness) {
        const age = (Date.now() - Date.parse(row.freshness)) / 3_600_000;
        if (Number.isFinite(age) && age > contract.freshnessPolicyHours) throw new Error("freshness_policy_failed");
      }
      assertSuppressedIdentityBlocked(row);
    }
    return { applied: true as const };
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }, actor?: ConnectorActor) {
    const scope = requireWorkspace(raw);
    const human: ConnectorActor = actor ?? { userId: scope.userId, actorType: "human" };
    const configured = [];
    for (const id of ["xero", "microsoft_365", "hubspot", "csv_excel"] as const) {
      const installation = await this.configure(scope, { connectorId: id, mode: "fixture" }, human);
      if (id !== "csv_excel") {
        await this.sync(scope, { installationId: installation.id }, human);
      }
      configured.push(installation);
    }
    return { created: true, isDemo: true as const, fixture: true as const, live: false as const, configured };
  }

  private publicInstallation(row: ConnectorInstallation) {
    const connectionState =
      row.connectorId === "microsoft_365"
        ? ms365ConnectionState({
            health: row.health,
            effectiveMode: row.effectiveMode,
            secretId: row.secretId,
            errorCategory: row.errorCategory,
          })
        : row.connectorId === "hubspot"
          ? hubspotConnectionState({
              health: row.health,
              effectiveMode: row.effectiveMode,
              secretId: row.secretId,
              errorCategory: row.errorCategory,
            })
          : null;
    return redactSecrets({
      ...row,
      secretId: row.secretId ? "secret_ref" : null,
      writeLabel: "READ ONLY" as const,
      modeLabel:
        row.health === "revoked"
          ? ("REVOKED" as const)
          : row.health === "degraded"
            ? ("DEGRADED" as const)
            : row.effectiveMode === "live" && row.health === "unavailable"
              ? ("LIVE_UNAVAILABLE" as const)
              : row.effectiveMode === "live"
                ? ("LIVE" as const)
                : ("FIXTURE/SANDBOX" as const),
      connectionState,
      organisation:
        row.connectorId === "microsoft_365" || row.connectorId === "hubspot"
          ? ((row.provenance.expectedProviderOrgId as string | null | undefined) ?? null)
          : undefined,
      permissions:
        row.connectorId === "microsoft_365"
          ? [...MS365_ALLOWED_GRAPH_SCOPES]
          : row.connectorId === "hubspot"
            ? [...HUBSPOT_ALLOWED_OAUTH_SCOPES]
            : undefined,
      disconnectAvailable:
        (row.connectorId === "microsoft_365" || row.connectorId === "hubspot") && row.health !== "revoked",
    });
  }

  private async requireInstallation(scope: OwnerCommandScope, id: string) {
    const installation = await this.store.getInstallation(scope, id);
    if (!installation) throw new Error("connector installation not found");
    if (installation.tenantId !== scope.tenantId) throw new Error("cross_tenant_connector_forbidden");
    if (installation.workspaceId !== scope.workspaceId) throw new Error("cross_workspace_graph_forbidden");
    return installation;
  }

  private async attemptXeroProviderRevocation(
    installation: ConnectorInstallation,
  ): Promise<"submitted" | "unavailable" | "local_only"> {
    if (!installation.secretId) return "local_only";
    try {
      const secrets = resolveXeroSecrets(installation.secretId);
      const expected =
        (installation.provenance.expectedProviderOrgId as string | undefined) ?? secrets.tenantId;
      const client = new XeroProviderClient({
        fetch: globalThis.fetch.bind(globalThis),
        secrets,
        expectedProviderOrgId: expected,
      });
      const result = await client.revokeAuthorization();
      return result.providerRevocation;
    } catch {
      return "local_only";
    }
  }

  private async attemptMs365ProviderRevocation(
    installation: ConnectorInstallation,
  ): Promise<"submitted" | "unavailable" | "local_only"> {
    if (!installation.secretId) return "local_only";
    try {
      const secrets = resolveMs365Secrets(installation.secretId);
      const expected =
        (installation.provenance.expectedProviderOrgId as string | undefined) ?? secrets.tenantId;
      const client = new Microsoft365ProviderClient({
        fetch: globalThis.fetch.bind(globalThis),
        secrets,
        expectedProviderOrgId: expected,
      });
      const result = await client.revokeAuthorization();
      return result.providerRevocation;
    } catch {
      return "local_only";
    }
  }

  private async attemptHubSpotProviderRevocation(
    installation: ConnectorInstallation,
  ): Promise<"submitted" | "unavailable" | "local_only"> {
    if (!installation.secretId) return "local_only";
    try {
      const secrets = resolveHubSpotSecrets(installation.secretId);
      const expected =
        (installation.provenance.expectedProviderOrgId as string | undefined) ?? secrets.portalId;
      const client = new HubSpotProviderClient({
        fetch: globalThis.fetch.bind(globalThis),
        secrets,
        expectedProviderOrgId: expected,
      });
      const result = await client.revokeAuthorization();
      return result.providerRevocation;
    } catch {
      return "local_only";
    }
  }

  private safeConnectorMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    return redactSecrets(hubspotSafeTelemetry(m365SafeTelemetry(xeroSafeTelemetry(metadata))));
  }

  private async emit(
    scope: OwnerCommandScope,
    eventType: (typeof BUSINESS_OS_EVENT_TYPES)[number],
    payload: Record<string, unknown>,
  ) {
    try {
      await this.kernel.eventBus.publish({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        eventType,
        source: "business-os",
        payload: this.safeConnectorMetadata(payload),
      });
    } catch {
      // Connector events must not take Business OS down.
    }
  }

  private async auditSafe(
    scope: OwnerCommandScope,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, unknown>,
  ) {
    try {
      await this.audit.log({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        action,
        resourceType,
        resourceId,
        metadata: this.safeConnectorMetadata(metadata),
      });
    } catch {
      // Audit persistence must not fail-close connector management.
    }
  }
}
