import type { AnalystCitation } from "../ai-project-analyst/types";

export const CONNECTOR_FRESHNESS_STATES = ["current", "stale", "unknown"] as const;
export type ConnectorFreshnessState = (typeof CONNECTOR_FRESHNESS_STATES)[number];

export const CONNECTOR_BINDING_STATES = ["project_bound", "unbound"] as const;
export type ConnectorBindingState = (typeof CONNECTOR_BINDING_STATES)[number];

export const CONNECTOR_CANONICALITY = "EXTERNAL_CONTEXT" as const;
export type ConnectorCanonicality = typeof CONNECTOR_CANONICALITY;

export const CONNECTOR_CONTEXT_AVAILABILITY = [
  "ok",
  "unavailable",
  "forbidden",
  "error",
  "degraded",
] as const;
export type ConnectorContextAvailability = (typeof CONNECTOR_CONTEXT_AVAILABILITY)[number];

export const MAX_CONNECTOR_CONTEXT_ITEMS = 12;
export const MAX_CONNECTOR_EXCERPT_CHARS = 400;

/**
 * Provider-neutral record accepted from the Platform connector read path.
 * Callers must already have stripped credentials.
 */
export type ConnectorContextRecord = {
  tenantId: string;
  workspaceId: string;
  connectorId: string;
  connectionId: string;
  sourceSystem: string;
  externalResourceId: string;
  resourceType: string;
  title?: string;
  excerpt?: string;
  payload: Record<string, unknown>;
  sourceTimestamp: string | null;
  retrievedAt: string;
  freshnessPolicyHours?: number;
  provenance: Record<string, unknown>;
  permissionScope: string;
  suppressed?: boolean;
  canonicalEntityType?: string | null;
  canonicalEntityId?: string | null;
  liveMode?: boolean;
};

export type ConnectorContextItem = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  binding: ConnectorBindingState;
  sourceSystem: string;
  connectorId: string;
  connectionId: string;
  externalResourceId: string;
  resourceType: string;
  title: string;
  excerpt: string;
  structuredFacts: Readonly<Record<string, string>>;
  sourceTimestamp: string | null;
  retrievedAt: string;
  freshness: ConnectorFreshnessState;
  provenance: string;
  permissionScope: string;
  canonicality: ConnectorCanonicality;
  confidence?: number;
  truncated: boolean;
  containsInjection: boolean;
  citation: AnalystCitation;
};

export type CanonicalExternalConflict = {
  topic: "schedule" | "health" | "change" | "risk" | "generic";
  canonicalText: string;
  externalText: string;
  item: ConnectorContextItem;
};

export type ConnectorContextPack = {
  availability: ConnectorContextAvailability;
  items: readonly ConnectorContextItem[];
  unboundExcludedCount: number;
  otherProjectExcludedCount: number;
  crossTenantExcludedCount: number;
  conflicts: readonly CanonicalExternalConflict[];
  liveExecution: boolean;
  degraded: boolean;
  skippedReason?: string;
  truncated: boolean;
  readOnly: true;
  externalWritesEnabled: false;
  canonicality: ConnectorCanonicality;
};

export type ConnectorCanonicalSnapshot = {
  health: string;
  scheduleState: string;
  scheduleAvailability: string;
};

export const EMPTY_CONNECTOR_CONTEXT_PACK: ConnectorContextPack = {
  availability: "unavailable",
  items: [],
  unboundExcludedCount: 0,
  otherProjectExcludedCount: 0,
  crossTenantExcludedCount: 0,
  conflicts: [],
  liveExecution: false,
  degraded: false,
  truncated: false,
  readOnly: true,
  externalWritesEnabled: false,
  canonicality: CONNECTOR_CANONICALITY,
};
