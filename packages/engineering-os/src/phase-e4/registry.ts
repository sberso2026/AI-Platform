/**
 * Engineering Connector Registry — tenant-scoped adapter lifecycle & health.
 * Does not expose internals to normal engineers.
 */

import type {
  EngineeringConnector,
  EngineeringConnectorCapability,
  EngineeringConnectorHealth,
  EngineeringConnectorStatus,
  EngineeringConnectorSyncState,
} from "./contracts";
import type { EngineeringConnectorAdapter } from "./adapter";
import { assertNoPlaintextSecrets } from "./security";

export type ConnectorAdminViewStatus =
  | "Connected"
  | "Needs attention"
  | "Disconnected"
  | "Disabled";

export function toAdminViewStatus(
  connector: EngineeringConnector,
): ConnectorAdminViewStatus {
  if (connector.status === "DISABLED") return "Disabled";
  if (connector.status === "READY" && connector.health.state === "HEALTHY") {
    return "Connected";
  }
  if (
    connector.status === "ERROR" ||
    connector.health.state === "AUTH_ERROR" ||
    connector.health.state === "UNAVAILABLE" ||
    connector.health.state === "RATE_LIMITED"
  ) {
    return "Needs attention";
  }
  if (connector.status === "NOT_CONFIGURED" || connector.status === "CONFIGURED") {
    return "Disconnected";
  }
  if (connector.health.state === "DEGRADED" || connector.health.state === "STALE") {
    return "Needs attention";
  }
  return "Disconnected";
}

export class EngineeringConnectorRegistry {
  private adapters = new Map<string, EngineeringConnectorAdapter>();
  private syncStates = new Map<string, EngineeringConnectorSyncState>();

  register(adapter: EngineeringConnectorAdapter): void {
    if (adapter.metadata.configurationRef) {
      // configurationRef must not embed plaintext secrets
      assertNoPlaintextSecrets({
        configurationRef: adapter.metadata.configurationRef,
        credentialSecretId: adapter.metadata.credentialSecretId ?? "",
      });
    }
    this.adapters.set(adapter.metadata.connectorId, adapter);
  }

  unregister(connectorId: string, tenantId: string): boolean {
    const a = this.adapters.get(connectorId);
    if (!a || a.metadata.tenantId !== tenantId) return false;
    this.adapters.delete(connectorId);
    this.syncStates.delete(connectorId);
    return true;
  }

  get(connectorId: string, tenantId: string): EngineeringConnectorAdapter | null {
    const a = this.adapters.get(connectorId);
    if (!a || a.metadata.tenantId !== tenantId) return null;
    return a;
  }

  list(tenantId: string, workspaceId?: string | null): EngineeringConnector[] {
    return [...this.adapters.values()]
      .filter((a) => {
        if (a.metadata.tenantId !== tenantId) return false;
        if (
          workspaceId != null &&
          a.metadata.workspaceId != null &&
          a.metadata.workspaceId !== workspaceId
        ) {
          return false;
        }
        return true;
      })
      .map((a) => a.metadata);
  }

  listAdminViews(tenantId: string) {
    return this.list(tenantId).map((c) => ({
      connectorId: c.connectorId,
      displayName: c.displayName,
      connectorType: c.connectorType,
      provider: c.provider,
      status: toAdminViewStatus(c),
      health: c.health.state,
      capabilities: c.capabilities,
      lastSync: c.lastSync ?? null,
      maturity: c.maturity,
      version: c.version,
    }));
  }

  setStatus(connectorId: string, tenantId: string, status: EngineeringConnectorStatus) {
    const a = this.get(connectorId, tenantId);
    if (!a) throw new Error("connector_not_found");
    (a.metadata as { status: EngineeringConnectorStatus }).status = status;
    a.metadata.updatedAt = new Date().toISOString();
  }

  async testConnection(connectorId: string, tenantId: string): Promise<EngineeringConnectorHealth> {
    const a = this.get(connectorId, tenantId);
    if (!a) throw new Error("connector_not_found");
    const health = await a.healthCheck();
    a.metadata.health = health;
    a.metadata.updatedAt = new Date().toISOString();
    if (health.state === "HEALTHY") {
      a.metadata.lastSuccessfulOperation = health.checkedAt;
    }
    return health;
  }

  /**
   * Select eligible connectors for a query — never query every connector.
   * Filters: tenant, READY/DEGRADED, not DISABLED, capability match, healthy-ish.
   */
  selectForQuery(input: {
    tenantId: string;
    workspaceId?: string | null;
    capabilitiesNeeded?: EngineeringConnectorCapability[];
    limit?: number;
  }): EngineeringConnectorAdapter[] {
    const needed = input.capabilitiesNeeded?.length
      ? input.capabilitiesNeeded
      : (["SEARCH"] as EngineeringConnectorCapability[]);
    const out: EngineeringConnectorAdapter[] = [];
    for (const a of this.adapters.values()) {
      if (a.metadata.tenantId !== input.tenantId) continue;
      if (a.metadata.status === "DISABLED" || a.metadata.status === "NOT_CONFIGURED") continue;
      if (a.metadata.status === "ERROR") continue;
      if (
        a.metadata.health.state === "UNAVAILABLE" ||
        a.metadata.health.state === "AUTH_ERROR" ||
        a.metadata.health.state === "RATE_LIMITED"
      ) {
        continue;
      }
      const hasCap = needed.some((c) => a.metadata.capabilities.includes(c));
      if (!hasCap) continue;
      if (!a.search && !a.queryDataset) continue;
      out.push(a);
      if (out.length >= (input.limit ?? 4)) break;
    }
    return out;
  }

  setSyncState(state: EngineeringConnectorSyncState) {
    if (this.get(state.connectorId, state.tenantId) == null) {
      throw new Error("connector_not_found");
    }
    this.syncStates.set(state.connectorId, state);
  }

  getSyncState(connectorId: string, tenantId: string): EngineeringConnectorSyncState | null {
    const a = this.get(connectorId, tenantId);
    if (!a) return null;
    return this.syncStates.get(connectorId) ?? null;
  }
}
