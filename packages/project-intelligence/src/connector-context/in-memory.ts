import { connectorWriteForbidden, type ConnectorContextSource } from "./ports";
import type { ConnectorContextRecord } from "./types";

export class InMemoryConnectorContextSource implements ConnectorContextSource {
  constructor(
    private readonly records: readonly ConnectorContextRecord[] = [],
    private readonly options: {
      availability?: "ok" | "unavailable" | "forbidden" | "error" | "degraded";
      liveExecution?: boolean;
      skippedReason?: string;
    } = {},
  ) {}

  async read() {
    return {
      availability: this.options.availability ?? "ok",
      records: this.records,
      liveExecution: this.options.liveExecution ?? false,
      skippedReason: this.options.skippedReason,
    };
  }

  writeExternal(): never {
    return connectorWriteForbidden();
  }
}

export function sampleConnectorRecord(
  overrides: Partial<ConnectorContextRecord> & Pick<ConnectorContextRecord, "externalResourceId">,
): ConnectorContextRecord {
  return {
    tenantId: "tenant",
    workspaceId: "workspace",
    connectorId: "microsoft_365",
    connectionId: "conn-1",
    sourceSystem: "microsoft_365",
    resourceType: "calendar_event",
    payload: { subject: "Coordination meeting", canonical: false },
    sourceTimestamp: "2026-08-30T00:00:00.000Z",
    retrievedAt: "2026-08-30T00:00:00.000Z",
    freshnessPolicyHours: 12,
    provenance: { projectId: "p1", fixture: true, live: false },
    permissionScope: "business_os.connectors.view",
    ...overrides,
  };
}
