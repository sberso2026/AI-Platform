import type {
  ConnectorAuditEvent,
  ConnectorSyncState,
  ConnectorTelemetry,
  ExternalSourceRef,
  M365Connection,
  SharePointScope,
} from "./types";

export type M365Store = {
  listConnections(workspaceId: string): Promise<M365Connection[]>;
  getConnection(id: string): Promise<M365Connection | null>;
  saveConnection(row: M365Connection): Promise<M365Connection>;
  listScopes(workspaceId: string): Promise<SharePointScope[]>;
  getScopeByRepository(repositoryId: string): Promise<SharePointScope | null>;
  saveScope(row: SharePointScope): Promise<SharePointScope>;
  getSyncState(repositoryId: string): Promise<ConnectorSyncState | null>;
  saveSyncState(row: ConnectorSyncState): Promise<ConnectorSyncState>;
  listSources(workspaceId: string, projectId?: string | null): Promise<ExternalSourceRef[]>;
  getSource(id: string): Promise<ExternalSourceRef | null>;
  findSourceByItem(input: { workspaceId: string; driveId: string; itemId: string }): Promise<ExternalSourceRef | null>;
  saveSource(row: ExternalSourceRef): Promise<ExternalSourceRef>;
  saveAudit(row: ConnectorAuditEvent): Promise<ConnectorAuditEvent>;
  listAudit(workspaceId: string): Promise<ConnectorAuditEvent[]>;
};

export function emptyTelemetry(): ConnectorTelemetry {
  return {
    apiRequestDurationMs: [],
    syncDurationMs: [],
    itemsProcessed: 0,
    errors: 0,
    throttles: 0,
    retries: 0,
  };
}

export function createMemoryM365Store(): M365Store {
  const connections = new Map<string, M365Connection>();
  const scopes = new Map<string, SharePointScope>();
  const sync = new Map<string, ConnectorSyncState>();
  const sources = new Map<string, ExternalSourceRef>();
  const audit = new Map<string, ConnectorAuditEvent>();
  return {
    async listConnections(workspaceId) {
      return [...connections.values()].filter((row) => row.workspaceId === workspaceId);
    },
    async getConnection(id) {
      return connections.get(id) ?? null;
    },
    async saveConnection(row) {
      connections.set(row.id, row);
      return row;
    },
    async listScopes(workspaceId) {
      return [...scopes.values()].filter((row) => row.workspaceId === workspaceId);
    },
    async getScopeByRepository(repositoryId) {
      return [...scopes.values()].find((row) => row.repositoryId === repositoryId) ?? null;
    },
    async saveScope(row) {
      scopes.set(row.id, row);
      return row;
    },
    async getSyncState(repositoryId) {
      return sync.get(repositoryId) ?? null;
    },
    async saveSyncState(row) {
      sync.set(row.repositoryId, row);
      return row;
    },
    async listSources(workspaceId, projectId) {
      return [...sources.values()].filter((row) => {
        if (row.workspaceId !== workspaceId) return false;
        if (!projectId) return true;
        return row.projectId === projectId;
      });
    },
    async getSource(id) {
      return sources.get(id) ?? null;
    },
    async findSourceByItem(input) {
      return (
        [...sources.values()].find(
          (row) => row.workspaceId === input.workspaceId && row.driveId === input.driveId && row.itemId === input.itemId,
        ) ?? null
      );
    },
    async saveSource(row) {
      sources.set(row.id, row);
      return row;
    },
    async saveAudit(row) {
      audit.set(row.id, row);
      return row;
    },
    async listAudit(workspaceId) {
      return [...audit.values()].filter((row) => row.workspaceId === workspaceId);
    },
  };
}
