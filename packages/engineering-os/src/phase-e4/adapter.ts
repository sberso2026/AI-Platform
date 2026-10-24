/**
 * EngineeringConnectorAdapter — vendor adapter boundary.
 * Adapters own transport only; never leak raw SDK responses beyond this boundary.
 */

import type {
  EngineeringConnector,
  EngineeringConnectorCapability,
  EngineeringConnectorHealth,
  EngineeringConnectorSearchResult,
  EngineeringConnectorSyncState,
  EngineeringExternalRecord,
  EngineeringExternalWriteProposal,
} from "./contracts";
import { createDisabledWriteProposal } from "./contracts";

export type ConnectorSearchInput = {
  tenantId: string;
  workspaceId?: string | null;
  query: string;
  limit?: number;
  cursor?: string | null;
  capabilitiesNeeded?: EngineeringConnectorCapability[];
};

export type ConnectorFetchInput = {
  tenantId: string;
  externalId: string;
  externalType?: string;
};

export type ConnectorListInput = {
  tenantId: string;
  limit?: number;
  cursor?: string | null;
};

export type ConnectorIdentityLookupInput = {
  tenantId: string;
  externalId: string;
  externalType?: string;
};

export interface EngineeringConnectorAdapter {
  readonly metadata: EngineeringConnector;
  discoverCapabilities(): Promise<EngineeringConnectorCapability[]>;
  healthCheck(): Promise<EngineeringConnectorHealth>;
  search?(input: ConnectorSearchInput): Promise<EngineeringConnectorSearchResult>;
  fetch?(input: ConnectorFetchInput): Promise<EngineeringExternalRecord | null>;
  list?(input: ConnectorListInput): Promise<EngineeringConnectorSearchResult>;
  getMetadata?(input: ConnectorFetchInput): Promise<Record<string, unknown> | null>;
  syncIncremental?(input: {
    tenantId: string;
    cursor?: string | null;
  }): Promise<{
    result: EngineeringConnectorSearchResult;
    syncState: EngineeringConnectorSyncState;
  }>;
  resolveExternalIdentity?(
    input: ConnectorIdentityLookupInput,
  ): Promise<{
    externalId: string;
    externalType: string;
    displayName?: string;
    unresolved?: boolean;
  } | null>;
  /** Optional capability methods — only when advertised. */
  fetchDocumentContent?(input: ConnectorFetchInput): Promise<string | null>;
  fetchEmailThread?(input: ConnectorFetchInput): Promise<EngineeringExternalRecord | null>;
  fetchAssetMaster?(input: ConnectorFetchInput): Promise<EngineeringExternalRecord | null>;
  fetchMaintenanceHistory?(input: ConnectorFetchInput): Promise<EngineeringExternalRecord[]>;
  fetchWorkOrders?(input: ConnectorFetchInput): Promise<EngineeringExternalRecord[]>;
  queryDataset?(input: {
    tenantId: string;
    query: string;
    limit?: number;
  }): Promise<EngineeringConnectorSearchResult>;
  /**
   * Writes are disabled in E4 — default returns DISABLED_IN_E4 proposal.
   */
  proposeWrite?(input: {
    tenantId: string;
    operation: string;
  }): Promise<EngineeringExternalWriteProposal>;
}

export function defaultProposeWriteDisabled(
  adapter: EngineeringConnectorAdapter,
  input: { tenantId: string; operation: string },
): EngineeringExternalWriteProposal {
  return createDisabledWriteProposal({
    tenantId: input.tenantId,
    connectorId: adapter.metadata.connectorId,
    operation: input.operation,
  });
}

export function assertCapability(
  adapter: EngineeringConnectorAdapter,
  capability: EngineeringConnectorCapability,
): void {
  if (!adapter.metadata.capabilities.includes(capability)) {
    throw new Error(`capability_not_implemented:${capability}`);
  }
}
