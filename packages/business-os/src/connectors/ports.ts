import type { BosConnectorHealth, BosConnectorId, BosConnectorMode } from "@rtb/types";

export type ConnectorActor = { userId: string; actorType: "human" | "agent"; agentId?: string };

export type ConnectorInstallation = {
  id: string;
  tenantId: string;
  workspaceId: string;
  connectorId: BosConnectorId;
  version: string;
  requestedMode: BosConnectorMode;
  effectiveMode: BosConnectorMode;
  health: BosConnectorHealth;
  writeClassification: "read_only";
  secretId: string | null;
  dataClasses: string[];
  mappingVersion: string;
  cursor: string | null;
  lastSuccessfulSyncAt: string | null;
  lastSyncAt: string | null;
  recordsProcessed: number;
  recordsRejected: number;
  conflicts: number;
  rateLimitState: "ok" | "limited" | "backoff";
  errorCategory: string | null;
  errorMessage: string | null;
  revokedAt: string | null;
  configuredBy: string;
  provenance: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ConnectorSyncRun = {
  id: string;
  installationId: string;
  tenantId: string;
  workspaceId: string;
  connectorId: BosConnectorId;
  status: "started" | "completed" | "partial" | "failed" | "cancelled";
  recordsProcessed: number;
  recordsRejected: number;
  conflicts: number;
  duplicates: number;
  checkpoint: string | null;
  idempotencyKey: string;
  errorCategory: string | null;
  cancelled: boolean;
  startedAt: string;
  completedAt: string | null;
  provenance: Record<string, unknown>;
};

export type ConnectorStagingRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  connectorId: BosConnectorId;
  installationId: string;
  syncRunId: string;
  provider: string;
  externalSourceId: string;
  dataClass: string;
  retrievedAt: string;
  sourceUpdatedAt: string | null;
  mappingVersion: string;
  freshness: string;
  payload: Record<string, unknown>;
  matchStatus: "unmatched" | "duplicate" | "conflict" | "mapped";
  conflictReason: string | null;
  canonicalEntityType: string | null;
  canonicalEntityId: string | null;
  becomesCanonical: false;
  suppressed: boolean;
  provenance: Record<string, unknown>;
};

export type ConnectorImportBatch = {
  id: string;
  tenantId: string;
  workspaceId: string;
  filename: string;
  entityType: string;
  status: "previewed" | "committed" | "rejected";
  rowCount: number;
  validCount: number;
  rejectedCount: number;
  duplicates: number;
  conflicts: number;
  mapping: Record<string, string>;
  mappingVersion: string;
  contentHash: string;
  committedAt: string | null;
  provenance: Record<string, unknown>;
};

export interface ConnectorStore {
  listInstallations(scope: { tenantId: string; workspaceId: string }): Promise<ConnectorInstallation[]>;
  getInstallation(scope: { tenantId: string; workspaceId: string }, id: string): Promise<ConnectorInstallation | null>;
  getInstallationByConnector(
    scope: { tenantId: string; workspaceId: string },
    connectorId: BosConnectorId,
  ): Promise<ConnectorInstallation | null>;
  upsertInstallation(row: ConnectorInstallation): Promise<ConnectorInstallation>;
  listRuns(scope: { tenantId: string; workspaceId: string }): Promise<ConnectorSyncRun[]>;
  getRunByIdempotency(scope: { tenantId: string; workspaceId: string }, key: string): Promise<ConnectorSyncRun | null>;
  upsertRun(row: ConnectorSyncRun): Promise<ConnectorSyncRun>;
  listStaging(scope: { tenantId: string; workspaceId: string }): Promise<ConnectorStagingRecord[]>;
  upsertStaging(row: ConnectorStagingRecord): Promise<ConnectorStagingRecord>;
  listImports(scope: { tenantId: string; workspaceId: string }): Promise<ConnectorImportBatch[]>;
  getImport(scope: { tenantId: string; workspaceId: string }, id: string): Promise<ConnectorImportBatch | null>;
  upsertImport(row: ConnectorImportBatch): Promise<ConnectorImportBatch>;
}
