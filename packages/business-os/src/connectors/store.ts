import type { BosConnectorId } from "@rtb/types";
import type {
  ConnectorImportBatch,
  ConnectorInstallation,
  ConnectorStagingRecord,
  ConnectorStore,
  ConnectorSyncRun,
} from "./ports";

function scoped<T extends { tenantId: string; workspaceId: string }>(
  rows: T[],
  scope: { tenantId: string; workspaceId: string },
): T[] {
  return rows.filter((row) => row.tenantId === scope.tenantId && row.workspaceId === scope.workspaceId);
}

export function createMemoryConnectorStore(): ConnectorStore {
  const installations: ConnectorInstallation[] = [];
  const runs: ConnectorSyncRun[] = [];
  const staging: ConnectorStagingRecord[] = [];
  const imports: ConnectorImportBatch[] = [];

  return {
    async listInstallations(scope) {
      return scoped(installations, scope);
    },
    async getInstallation(scope, id) {
      return scoped(installations, scope).find((row) => row.id === id) ?? null;
    },
    async getInstallationByConnector(scope, connectorId: BosConnectorId) {
      return (
        scoped(installations, scope).find(
          (row) => row.connectorId === connectorId && row.health !== "revoked",
        ) ??
        scoped(installations, scope).find((row) => row.connectorId === connectorId) ??
        null
      );
    },
    async upsertInstallation(row) {
      const idx = installations.findIndex((item) => item.id === row.id);
      if (idx >= 0) installations[idx] = row;
      else installations.push(row);
      return row;
    },
    async listRuns(scope) {
      return scoped(runs, scope);
    },
    async getRunByIdempotency(scope, key) {
      return scoped(runs, scope).find((row) => row.idempotencyKey === key) ?? null;
    },
    async upsertRun(row) {
      const idx = runs.findIndex((item) => item.id === row.id);
      if (idx >= 0) runs[idx] = row;
      else runs.push(row);
      return row;
    },
    async listStaging(scope) {
      return scoped(staging, scope);
    },
    async upsertStaging(row) {
      const idx = staging.findIndex((item) => item.id === row.id);
      if (idx >= 0) staging[idx] = row;
      else staging.push(row);
      return row;
    },
    async listImports(scope) {
      return scoped(imports, scope);
    },
    async getImport(scope, id) {
      return scoped(imports, scope).find((row) => row.id === id) ?? null;
    },
    async upsertImport(row) {
      const idx = imports.findIndex((item) => item.id === row.id);
      if (idx >= 0) imports[idx] = row;
      else imports.push(row);
      return row;
    },
  };
}
