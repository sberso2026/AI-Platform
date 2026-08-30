export type PlatformConnectorInstallationLite = {
  id: string;
  tenantId: string;
  workspaceId: string;
  health: string;
  effectiveMode: string;
  provenance?: Record<string, unknown>;
};

export type PlatformConnectorStagingLite = {
  id: string;
  tenantId: string;
  workspaceId: string;
  connectorId: string;
  installationId: string;
  provider: string;
  externalSourceId: string;
  dataClass: string;
  retrievedAt: string;
  sourceUpdatedAt: string | null;
  freshness: string;
  mappingVersion: string;
  payload: Record<string, unknown>;
  matchStatus: string;
  canonicalEntityType: string | null;
  canonicalEntityId: string | null;
  suppressed: boolean;
  provenance: Record<string, unknown>;
};

export type PlatformConnectorContextRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  connectorId: string;
  connectionId: string;
  provider: string;
  externalSourceId: string;
  dataClass: string;
  retrievedAt: string;
  sourceUpdatedAt: string | null;
  freshness: string;
  mappingVersion: string;
  payload: Record<string, unknown>;
  matchStatus: string;
  canonicalEntityType: string | null;
  canonicalEntityId: string | null;
  becomesCanonical: false;
  suppressed: boolean;
  provenance: Record<string, unknown>;
  installationHealth: string;
  installationMode: string;
  live: boolean;
  fixture: boolean;
  freshnessPolicyHours: number;
  writeClassification: "read_only";
};

export type PlatformConnectorContextRead = {
  availability: "ok" | "unavailable" | "error";
  records: PlatformConnectorContextRecord[];
  liveExecution: boolean;
  usableWithoutConnectors: true;
  writeLabel: "READ ONLY";
  secretIdPresent: false;
};

export const PLATFORM_CONNECTOR_CONTEXT_OWNERSHIP = {
  readContract: "platform_kernel.connector_context",
  connectorTables: "existing_canonical_connector_staging",
  credentials: "platform_intelligence.secret_management",
  writes: "forbidden_on_platform_read_path",
} as const;
