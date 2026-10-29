import type {
  ConnectorAuditEvent,
  EngineeringConnectorSyncState,
  EngineeringExternalConnection,
  EngineeringExternalObjectRef,
  EngineeringExternalProjectBinding,
  ConnectorTelemetry,
} from "./types";

export type EngineeringConnectorStore = {
  listConnections(workspaceId: string): Promise<EngineeringExternalConnection[]>;
  getConnection(id: string): Promise<EngineeringExternalConnection | null>;
  saveConnection(row: EngineeringExternalConnection): Promise<EngineeringExternalConnection>;
  listBindings(workspaceId: string): Promise<EngineeringExternalProjectBinding[]>;
  saveBinding(row: EngineeringExternalProjectBinding): Promise<EngineeringExternalProjectBinding>;
  getSyncState(connectionId: string): Promise<EngineeringConnectorSyncState | null>;
  saveSyncState(row: EngineeringConnectorSyncState): Promise<EngineeringConnectorSyncState>;
  listObjects(workspaceId: string, projectId?: string | null): Promise<EngineeringExternalObjectRef[]>;
  findObject(input: { workspaceId: string; connectionId: string; objectType: string; objectId: string }): Promise<EngineeringExternalObjectRef | null>;
  saveObject(row: EngineeringExternalObjectRef): Promise<EngineeringExternalObjectRef>;
  saveAudit(row: ConnectorAuditEvent): Promise<ConnectorAuditEvent>;
};

export function emptyTelemetry(): ConnectorTelemetry {
  return { apiRequestDurationMs: [], syncDurationMs: [], itemsProcessed: 0, errors: 0, throttles: 0, retries: 0 };
}

export function createMemoryEngineeringConnectorStore(): EngineeringConnectorStore {
  const connections = new Map<string, EngineeringExternalConnection>();
  const bindings = new Map<string, EngineeringExternalProjectBinding>();
  const sync = new Map<string, EngineeringConnectorSyncState>();
  const objects = new Map<string, EngineeringExternalObjectRef>();
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
    async listBindings(workspaceId) {
      return [...bindings.values()].filter((row) => row.workspaceId === workspaceId);
    },
    async saveBinding(row) {
      bindings.set(row.id, row);
      return row;
    },
    async getSyncState(connectionId) {
      return sync.get(connectionId) ?? null;
    },
    async saveSyncState(row) {
      sync.set(row.connectionId, row);
      return row;
    },
    async listObjects(workspaceId, projectId) {
      return [...objects.values()].filter((row) => row.workspaceId === workspaceId && (!projectId || row.projectId === projectId));
    },
    async findObject(input) {
      return (
        [...objects.values()].find(
          (row) =>
            row.workspaceId === input.workspaceId &&
            row.connectionId === input.connectionId &&
            row.objectType === input.objectType &&
            row.objectId === input.objectId,
        ) ?? null
      );
    },
    async saveObject(row) {
      objects.set(row.id, row);
      return row;
    },
    async saveAudit(row) {
      audit.set(row.id, row);
      return row;
    },
  };
}
