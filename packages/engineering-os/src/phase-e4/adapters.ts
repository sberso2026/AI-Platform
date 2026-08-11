/**
 * Reference / contract adapters proving framework portability.
 * Live production connectivity is NOT claimed.
 */

import type {
  EngineeringConnector,
  EngineeringConnectorCapability,
  EngineeringConnectorHealth,
  EngineeringConnectorSearchResult,
  EngineeringConnectorSyncState,
  EngineeringExternalRecord,
} from "./contracts";
import type {
  ConnectorFetchInput,
  ConnectorListInput,
  ConnectorSearchInput,
  EngineeringConnectorAdapter,
} from "./adapter";
import { defaultProposeWriteDisabled } from "./adapter";
import {
  assertSafeExternalUrl,
  sanitiseExternalText,
  sanitiseMetadata,
} from "./security";

function now() {
  return new Date().toISOString();
}

function baseMeta(
  partial: Omit<EngineeringConnector, "health" | "createdAt" | "updatedAt"> & {
    health?: EngineeringConnectorHealth;
  },
): EngineeringConnector {
  const ts = now();
  return {
    ...partial,
    health: partial.health ?? {
      state: "HEALTHY",
      checkedAt: ts,
      message: "reference adapter",
    },
    createdAt: ts,
    updatedAt: ts,
  };
}

function record(input: {
  connectorId: string;
  provider: string;
  sourceSystem: string;
  externalId: string;
  externalType: string;
  title: string;
  operation: string;
  permissionsApplied?: EngineeringExternalRecord["permissionsApplied"];
  content?: string | null;
  metadata?: Record<string, unknown>;
  updatedAt?: string | null;
  lastSyncAt?: string | null;
  deepLink?: string | null;
  revoked?: boolean;
  projectRef?: string | null;
  assetRef?: string | null;
}): EngineeringExternalRecord {
  const retrievedAt = now();
  const contentSan = sanitiseExternalText(input.content);
  const metaSan = sanitiseMetadata(input.metadata);
  return {
    externalId: input.externalId,
    externalType: input.externalType,
    sourceSystem: input.sourceSystem,
    title: input.title,
    projectRef: input.projectRef ?? null,
    assetRef: input.assetRef ?? null,
    content: contentSan.text || null,
    metadata: metaSan.metadata,
    retrievedAt,
    updatedAt: input.updatedAt ?? null,
    provenance: {
      connectorId: input.connectorId,
      provider: input.provider,
      mechanism: input.provider === "CSV" || input.provider === "Excel" || input.provider === "FileSystem"
        ? "FILE_IMPORT"
        : "CONNECTOR_READ",
      operation: input.operation,
    },
    permissionsApplied: input.permissionsApplied ?? true,
    deepLink: input.deepLink ?? null,
    freshness: {
      retrievedAt,
      sourceUpdatedAt: input.updatedAt ?? null,
      lastSyncAt: input.lastSyncAt ?? null,
    },
    sanitised: contentSan.sanitised || metaSan.sanitised,
    revoked: input.revoked ?? false,
  };
}

function searchResult(
  adapter: EngineeringConnector,
  records: EngineeringExternalRecord[],
  capabilitiesUsed: EngineeringConnectorCapability[],
  queryScope: string,
  queryMs: number,
): EngineeringConnectorSearchResult {
  // Deduplicate by sourceSystem + externalId
  const seen = new Set<string>();
  const deduped: EngineeringExternalRecord[] = [];
  for (const r of records) {
    if (r.revoked) continue;
    const key = `${r.sourceSystem}::${r.externalId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(r);
  }
  return {
    records: deduped,
    cursor: null,
    source: {
      connectorId: adapter.connectorId,
      provider: String(adapter.provider),
      sourceSystem: String(adapter.provider),
    },
    capabilitiesUsed,
    queryScope,
    retrievedAt: now(),
    timingMs: { queryMs },
  };
}

/** 1. Native/Mock — deterministic fixtures. */
export class NativeMockConnectorAdapter implements EngineeringConnectorAdapter {
  readonly metadata: EngineeringConnector;
  private readonly fixtures: EngineeringExternalRecord[];

  constructor(
    tenantId: string,
    fixtures?: EngineeringExternalRecord[],
    opts?: { status?: EngineeringConnector["status"]; health?: EngineeringConnectorHealth },
  ) {
    this.metadata = baseMeta({
      connectorId: `native-mock:${tenantId}`,
      tenantId,
      connectorType: "NATIVE_MOCK",
      provider: "NativeMock",
      displayName: "Native Mock Connector",
      version: "1.0.0-e4",
      status: opts?.status ?? "READY",
      capabilities: ["SEARCH", "FETCH", "LIST", "IDENTITY_LOOKUP"],
      authenticationMode: "NONE",
      configurationRef: null,
      credentialSecretId: null,
      maturity: "adapter_implemented",
      health: opts?.health,
      accessModel: "admin_restricted",
    });
    this.fixtures =
      fixtures ??
      [
        record({
          connectorId: this.metadata.connectorId,
          provider: "NativeMock",
          sourceSystem: "NativeMock",
          externalId: "MOCK-NOTIF-1",
          externalType: "notification",
          title: "Mock structural notification",
          operation: "seed",
          content: "Pier settlement observation",
        }),
        record({
          connectorId: this.metadata.connectorId,
          provider: "NativeMock",
          sourceSystem: "NativeMock",
          externalId: "MOCK-DOC-1",
          externalType: "document",
          title: "Mock inspection report IR-2026-41",
          operation: "seed",
        }),
      ];
  }

  async discoverCapabilities() {
    return [...this.metadata.capabilities];
  }

  async healthCheck(): Promise<EngineeringConnectorHealth> {
    return {
      state: this.metadata.status === "DISABLED" ? "UNAVAILABLE" : this.metadata.health.state,
      checkedAt: now(),
      message: this.metadata.health.message,
      latencyMs: 1,
    };
  }

  async search(input: ConnectorSearchInput): Promise<EngineeringConnectorSearchResult> {
    if (this.metadata.status === "DISABLED") {
      throw new Error("connector_disabled");
    }
    const started = Date.now();
    const q = input.query.toLowerCase();
    const matched = this.fixtures.filter(
      (r) =>
        !r.revoked &&
        (r.title.toLowerCase().includes(q) ||
          r.externalId.toLowerCase().includes(q) ||
          (r.content ?? "").toLowerCase().includes(q) ||
          q === "*" ||
          q === ""),
    );
    return searchResult(
      this.metadata,
      matched.slice(0, input.limit ?? 20),
      ["SEARCH"],
      "mock",
      Date.now() - started,
    );
  }

  async fetch(input: ConnectorFetchInput) {
    return this.fixtures.find((r) => r.externalId === input.externalId) ?? null;
  }

  async list(input: ConnectorListInput) {
    const started = Date.now();
    return searchResult(
      this.metadata,
      this.fixtures.filter((r) => !r.revoked).slice(0, input.limit ?? 50),
      ["LIST"],
      "mock-list",
      Date.now() - started,
    );
  }

  async resolveExternalIdentity(input: { tenantId: string; externalId: string }) {
    const hit = this.fixtures.find((r) => r.externalId === input.externalId);
    if (!hit) return { externalId: input.externalId, externalType: "unknown", unresolved: true };
    return {
      externalId: hit.externalId,
      externalType: hit.externalType,
      displayName: hit.title,
    };
  }

  proposeWrite(input: { tenantId: string; operation: string }) {
    return Promise.resolve(defaultProposeWriteDisabled(this, input));
  }
}

/** 2. Generic File Import — CSV/Excel/file metadata; no external service. */
export class FileImportConnectorAdapter implements EngineeringConnectorAdapter {
  readonly metadata: EngineeringConnector;
  private rows: EngineeringExternalRecord[];

  constructor(
    tenantId: string,
    imported: Array<{
      externalId: string;
      title: string;
      externalType?: string;
      content?: string;
      metadata?: Record<string, unknown>;
    }> = [],
  ) {
    this.metadata = baseMeta({
      connectorId: `file-import:${tenantId}`,
      tenantId,
      connectorType: "FILE_IMPORT",
      provider: "CSV",
      displayName: "File Import",
      version: "1.0.0-e4",
      status: "READY",
      capabilities: ["FILE_IMPORT", "SEARCH", "LIST", "FETCH", "DOCUMENT_METADATA"],
      authenticationMode: "FILE_MANUAL_IMPORT",
      configurationRef: "ref:file-import",
      credentialSecretId: null,
      maturity: "adapter_implemented",
      accessModel: "admin_restricted",
    });
    this.rows = imported.map((r) =>
      record({
        connectorId: this.metadata.connectorId,
        provider: "CSV",
        sourceSystem: "FileImport",
        externalId: r.externalId,
        externalType: r.externalType ?? "file_row",
        title: r.title,
        operation: "file_import",
        content: r.content,
        metadata: r.metadata,
        permissionsApplied: true,
      }),
    );
  }

  /** Parse simple CSV (header + rows) into external records — reference path. */
  ingestCsv(csvText: string): number {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return 0;
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const idIdx = headers.findIndex((h) => h === "id" || h === "external_id");
    const titleIdx = headers.findIndex((h) => h === "title" || h === "name");
    let count = 0;
    for (const line of lines.slice(1)) {
      const cols = line.split(",").map((c) => c.trim());
      const externalId = cols[idIdx >= 0 ? idIdx : 0] ?? `row-${count + 1}`;
      const title = cols[titleIdx >= 0 ? titleIdx : 1] ?? externalId;
      this.rows.push(
        record({
          connectorId: this.metadata.connectorId,
          provider: "CSV",
          sourceSystem: "FileImport",
          externalId,
          externalType: "file_row",
          title,
          operation: "csv_ingest",
          content: line,
        }),
      );
      count += 1;
    }
    return count;
  }

  async discoverCapabilities() {
    return [...this.metadata.capabilities];
  }

  async healthCheck(): Promise<EngineeringConnectorHealth> {
    return { state: "HEALTHY", checkedAt: now(), latencyMs: 1, message: "local file import" };
  }

  async search(input: ConnectorSearchInput) {
    const started = Date.now();
    const q = input.query.toLowerCase();
    const matched = this.rows.filter(
      (r) =>
        q === "*" ||
        r.title.toLowerCase().includes(q) ||
        r.externalId.toLowerCase().includes(q),
    );
    return searchResult(
      this.metadata,
      matched.slice(0, input.limit ?? 50),
      ["SEARCH", "FILE_IMPORT"],
      "file-import",
      Date.now() - started,
    );
  }

  async list(input: ConnectorListInput) {
    const started = Date.now();
    return searchResult(
      this.metadata,
      this.rows.slice(0, input.limit ?? 100),
      ["LIST", "FILE_IMPORT"],
      "file-import-list",
      Date.now() - started,
    );
  }

  async fetch(input: ConnectorFetchInput) {
    return this.rows.find((r) => r.externalId === input.externalId) ?? null;
  }

  proposeWrite(input: { tenantId: string; operation: string }) {
    return Promise.resolve(defaultProposeWriteDisabled(this, input));
  }
}

/** 3. Generic REST — read-only; mock-backed with SSRF URL safety. */
export class GenericRestConnectorAdapter implements EngineeringConnectorAdapter {
  readonly metadata: EngineeringConnector;
  private readonly mockRecords: EngineeringExternalRecord[];
  private readonly baseUrl: string | null;

  constructor(input: {
    tenantId: string;
    baseUrl?: string | null;
    credentialSecretId?: string | null;
    mockRecords?: EngineeringExternalRecord[];
    forceHealth?: EngineeringConnectorHealth;
  }) {
    if (input.baseUrl) {
      const safety = assertSafeExternalUrl(input.baseUrl);
      if (!safety.ok) {
        throw new Error(`unsafe_rest_url:${safety.reason}`);
      }
    }
    this.baseUrl = input.baseUrl ?? null;
    this.metadata = baseMeta({
      connectorId: `generic-rest:${input.tenantId}`,
      tenantId: input.tenantId,
      connectorType: "GENERIC_API",
      provider: "GenericREST",
      displayName: "Generic REST (read-only)",
      version: "1.0.0-e4",
      status: "READY",
      capabilities: ["SEARCH", "FETCH", "LIST"],
      authenticationMode: input.credentialSecretId ? "API_KEY" : "NONE",
      configurationRef: this.baseUrl ? `ref:url:${this.baseUrl}` : "ref:mock",
      credentialSecretId: input.credentialSecretId ?? null,
      maturity: this.baseUrl ? "adapter_implemented" : "adapter_implemented",
      health: input.forceHealth,
      accessModel: "service_account_scoped",
    });
    this.mockRecords =
      input.mockRecords ??
      [
        record({
          connectorId: this.metadata.connectorId,
          provider: "GenericREST",
          sourceSystem: "GenericREST",
          externalId: "REST-1",
          externalType: "api_record",
          title: "REST fixture record",
          operation: "mock",
        }),
      ];
  }

  async discoverCapabilities() {
    return [...this.metadata.capabilities];
  }

  async healthCheck(): Promise<EngineeringConnectorHealth> {
    if (this.metadata.health.state !== "HEALTHY") return { ...this.metadata.health, checkedAt: now() };
    return { state: "HEALTHY", checkedAt: now(), latencyMs: 2, message: "mock-backed REST" };
  }

  async search(input: ConnectorSearchInput) {
    // Live HTTP not performed in E4 reference — mock-backed only.
    const started = Date.now();
    const q = input.query.toLowerCase();
    const matched = this.mockRecords.filter(
      (r) => q === "*" || r.title.toLowerCase().includes(q) || r.externalId.toLowerCase().includes(q),
    );
    const result = searchResult(
      this.metadata,
      matched.slice(0, input.limit ?? 20),
      ["SEARCH"],
      "generic-rest-mock",
      Date.now() - started,
    );
    result.limitations = [
      "Generic REST live HTTP is not certified in E4; mock-backed read path used.",
    ];
    return result;
  }

  async fetch(input: ConnectorFetchInput) {
    return this.mockRecords.find((r) => r.externalId === input.externalId) ?? null;
  }

  async list(input: ConnectorListInput) {
    const started = Date.now();
    return searchResult(
      this.metadata,
      this.mockRecords.slice(0, input.limit ?? 50),
      ["LIST"],
      "generic-rest-list",
      Date.now() - started,
    );
  }

  proposeWrite(input: { tenantId: string; operation: string }) {
    return Promise.resolve(defaultProposeWriteDisabled(this, input));
  }
}

function contractOnlyAdapter(
  meta: ReturnType<typeof baseMeta>,
  message: string,
): EngineeringConnectorAdapter {
  return {
    metadata: meta,
    async discoverCapabilities() {
      return [...meta.capabilities];
    },
    async healthCheck() {
      return {
        state: "UNAVAILABLE",
        checkedAt: now(),
        message,
      };
    },
    async search() {
      throw new Error("live_connection_not_certified");
    },
    proposeWrite(input) {
      return Promise.resolve(
        defaultProposeWriteDisabled(
          { metadata: meta } as EngineeringConnectorAdapter,
          input,
        ),
      );
    },
  };
}

/** 4. Microsoft 365 family — contract + fixture/mock; no live credentials required. */
export class Microsoft365ConnectorAdapter implements EngineeringConnectorAdapter {
  readonly metadata: EngineeringConnector;
  private readonly mock: NativeMockConnectorAdapter;

  constructor(tenantId: string, opts?: { live?: boolean }) {
    this.metadata = baseMeta({
      connectorId: `m365:${tenantId}`,
      tenantId,
      connectorType: "DOCUMENT_REPOSITORY",
      provider: "Microsoft365",
      displayName: "Microsoft 365 / SharePoint",
      version: "1.0.0-e4",
      status: opts?.live ? "NOT_CONFIGURED" : "READY",
      capabilities: ["SEARCH", "FETCH", "DOCUMENT_METADATA", "DOCUMENT_CONTENT", "COLLABORATION"],
      authenticationMode: "OAUTH2",
      configurationRef: "ref:m365",
      credentialSecretId: "secret:m365-oauth", // reference id only
      maturity: opts?.live ? "contract_only" : "adapter_implemented",
      accessModel: "source_delegated",
    });
    this.mock = new NativeMockConnectorAdapter(tenantId, [
      record({
        connectorId: this.metadata.connectorId,
        provider: "SharePoint",
        sourceSystem: "SharePoint",
        externalId: "SP-DOC-100",
        externalType: "document",
        title: "SharePoint Inspection Report IR-2026-41",
        operation: "fixture",
        deepLink: "https://contoso.sharepoint.com/sites/eng/IR-2026-41",
        permissionsApplied: true,
      }),
    ]);
  }

  async discoverCapabilities() {
    return [...this.metadata.capabilities];
  }

  async healthCheck() {
    if (this.metadata.maturity === "contract_only") {
      return {
        state: "UNAVAILABLE" as const,
        checkedAt: now(),
        message: "M365 live connection not certified; fixture path available",
      };
    }
    return { state: "HEALTHY" as const, checkedAt: now(), latencyMs: 1, message: "fixture" };
  }

  async search(input: ConnectorSearchInput) {
    const result = await this.mock.search(input);
    return {
      ...result,
      source: {
        connectorId: this.metadata.connectorId,
        provider: "Microsoft365",
        sourceSystem: "SharePoint",
      },
      capabilitiesUsed: ["SEARCH", "DOCUMENT_METADATA"] as EngineeringConnectorCapability[],
      limitations: ["Microsoft 365 live Graph connectivity not certified in E4; fixture used."],
    };
  }

  async fetch(input: ConnectorFetchInput) {
    return this.mock.fetch(input);
  }

  async fetchDocumentContent(input: ConnectorFetchInput) {
    const doc = await this.fetch(input);
    return doc?.content ?? doc?.title ?? null;
  }

  proposeWrite(input: { tenantId: string; operation: string }) {
    return Promise.resolve(defaultProposeWriteDisabled(this, input));
  }
}

/** 5. Microsoft Fabric — query/read contract; no hard dependency. */
export function createMicrosoftFabricConnectorContract(
  tenantId: string,
): EngineeringConnectorAdapter {
  return contractOnlyAdapter(
    baseMeta({
      connectorId: `fabric:${tenantId}`,
      tenantId,
      connectorType: "DATA_PLATFORM",
      provider: "MicrosoftFabric",
      displayName: "Microsoft Fabric",
      version: "1.0.0-e4",
      status: "NOT_CONFIGURED",
      capabilities: ["DATA_QUERY", "SEARCH", "LIST"],
      authenticationMode: "OAUTH2",
      configurationRef: "ref:fabric",
      credentialSecretId: "secret:fabric",
      maturity: "contract_only",
      accessModel: "service_account_scoped",
    }),
    "Fabric live connection not certified in E4",
  );
}

/** Fabric fixture adapter for tests (still not live-certified). */
export class MicrosoftFabricFixtureAdapter implements EngineeringConnectorAdapter {
  readonly metadata: EngineeringConnector;
  constructor(tenantId: string) {
    this.metadata = baseMeta({
      connectorId: `fabric-fixture:${tenantId}`,
      tenantId,
      connectorType: "DATA_PLATFORM",
      provider: "MicrosoftFabric",
      displayName: "Microsoft Fabric (fixture)",
      version: "1.0.0-e4",
      status: "READY",
      capabilities: ["DATA_QUERY", "SEARCH"],
      authenticationMode: "NONE",
      configurationRef: "ref:fabric-fixture",
      credentialSecretId: null,
      maturity: "adapter_implemented",
      accessModel: "admin_restricted",
    });
  }
  async discoverCapabilities() {
    return [...this.metadata.capabilities];
  }
  async healthCheck() {
    return { state: "HEALTHY" as const, checkedAt: now(), latencyMs: 1 };
  }
  async queryDataset(input: { tenantId: string; query: string; limit?: number }) {
    const started = Date.now();
    return searchResult(
      this.metadata,
      [
        record({
          connectorId: this.metadata.connectorId,
          provider: "MicrosoftFabric",
          sourceSystem: "MicrosoftFabric",
          externalId: "FABRIC-ROW-1",
          externalType: "dataset_row",
          title: `Fabric row matching ${input.query}`,
          operation: "queryDataset",
          lastSyncAt: now(),
        }),
      ].slice(0, input.limit ?? 10),
      ["DATA_QUERY"],
      "fabric-fixture",
      Date.now() - started,
    );
  }
  async search(input: ConnectorSearchInput) {
    return this.queryDataset({
      tenantId: input.tenantId,
      query: input.query,
      limit: input.limit,
    });
  }
  proposeWrite(input: { tenantId: string; operation: string }) {
    return Promise.resolve(defaultProposeWriteDisabled(this, input));
  }
}

/** 6. SAP EAM/PM — asset/FLOC/notification/work-order read interfaces; mock OK. */
export class SapEamConnectorAdapter implements EngineeringConnectorAdapter {
  readonly metadata: EngineeringConnector;
  private readonly records: EngineeringExternalRecord[];

  constructor(tenantId: string, opts?: { unavailable?: boolean }) {
    this.metadata = baseMeta({
      connectorId: `sap-eam:${tenantId}`,
      tenantId,
      connectorType: "EAM_CMMS",
      provider: "SAP",
      displayName: "SAP EAM/PM",
      version: "1.0.0-e4",
      status: opts?.unavailable ? "ERROR" : "READY",
      capabilities: [
        "SEARCH",
        "FETCH",
        "ASSET_MASTER",
        "MAINTENANCE_HISTORY",
        "WORK_ORDER_READ",
        "IDENTITY_LOOKUP",
      ],
      authenticationMode: "CLIENT_CREDENTIALS",
      configurationRef: "ref:sap",
      credentialSecretId: "secret:sap-client",
      maturity: "adapter_implemented",
      health: opts?.unavailable
        ? { state: "UNAVAILABLE", checkedAt: now(), message: "SAP unavailable" }
        : undefined,
      accessModel: "service_account_scoped",
    });
    this.records = [
      record({
        connectorId: this.metadata.connectorId,
        provider: "SAP",
        sourceSystem: "SAP",
        externalId: "48192",
        externalType: "notification",
        title: "SAP Notification 48192",
        operation: "fixture",
        assetRef: "FLOC-PIER-3",
        updatedAt: "2026-08-10T00:00:00Z",
        lastSyncAt: "2026-08-10T12:00:00Z",
      }),
      record({
        connectorId: this.metadata.connectorId,
        provider: "SAP",
        sourceSystem: "SAP",
        externalId: "FLOC-PIER-3",
        externalType: "floc",
        title: "Functional location Pier 3",
        operation: "fixture",
      }),
      record({
        connectorId: this.metadata.connectorId,
        provider: "SAP",
        sourceSystem: "SAP",
        externalId: "WO-9001",
        externalType: "work_order",
        title: "Work order WO-9001",
        operation: "fixture",
      }),
    ];
  }

  async discoverCapabilities() {
    return [...this.metadata.capabilities];
  }

  async healthCheck() {
    if (this.metadata.status === "ERROR") {
      return {
        state: "UNAVAILABLE" as const,
        checkedAt: now(),
        message: "SAP unavailable",
      };
    }
    return { state: "HEALTHY" as const, checkedAt: now(), latencyMs: 3 };
  }

  private ensureReady() {
    if (this.metadata.status === "ERROR" || this.metadata.status === "DISABLED") {
      throw new Error("connector_unavailable");
    }
  }

  async search(input: ConnectorSearchInput) {
    this.ensureReady();
    const started = Date.now();
    const q = input.query.toLowerCase();
    const matched = this.records.filter(
      (r) =>
        q === "*" ||
        r.title.toLowerCase().includes(q) ||
        r.externalId.toLowerCase().includes(q),
    );
    return searchResult(
      this.metadata,
      matched.slice(0, input.limit ?? 20),
      ["SEARCH"],
      "sap-fixture",
      Date.now() - started,
    );
  }

  async fetch(input: ConnectorFetchInput) {
    this.ensureReady();
    return this.records.find((r) => r.externalId === input.externalId) ?? null;
  }

  async fetchAssetMaster(input: ConnectorFetchInput) {
    this.ensureReady();
    const hit = await this.fetch(input);
    return hit?.externalType === "floc" || hit?.externalType === "asset" ? hit : null;
  }

  async fetchMaintenanceHistory(input: ConnectorFetchInput) {
    this.ensureReady();
    return this.records.filter(
      (r) =>
        r.externalType === "notification" &&
        (r.assetRef === input.externalId || r.externalId === input.externalId),
    );
  }

  async fetchWorkOrders(input: ConnectorFetchInput) {
    this.ensureReady();
    return this.records.filter((r) => r.externalType === "work_order");
  }

  async resolveExternalIdentity(input: { tenantId: string; externalId: string }) {
    const hit = this.records.find((r) => r.externalId === input.externalId);
    if (!hit) return { externalId: input.externalId, externalType: "unknown", unresolved: true };
    return {
      externalId: hit.externalId,
      externalType: hit.externalType,
      displayName: hit.title,
    };
  }

  async syncIncremental(input: { tenantId: string; cursor?: string | null }) {
    this.ensureReady();
    const started = Date.now();
    const result = searchResult(
      this.metadata,
      this.records,
      ["SEARCH"],
      "sap-sync",
      Date.now() - started,
    );
    const syncState: EngineeringConnectorSyncState = {
      connectorId: this.metadata.connectorId,
      tenantId: input.tenantId,
      lastCursor: input.cursor ?? "sap-cursor-1",
      lastSuccessfulSync: now(),
      lastAttempt: now(),
      recordsProcessed: this.records.length,
      recordsFailed: 0,
      status: "SUCCESS",
      freshness: now(),
    };
    return { result, syncState };
  }

  proposeWrite(input: { tenantId: string; operation: string }) {
    return Promise.resolve(defaultProposeWriteDisabled(this, input));
  }
}

export { record as createExternalRecordFixture };
