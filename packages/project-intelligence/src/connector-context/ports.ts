import type { ConnectorContextRecord } from "./types";

export type ConnectorContextReadScope = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  principalId: string;
};

export type ConnectorContextSourceResult = {
  availability: "ok" | "unavailable" | "forbidden" | "error" | "degraded";
  records: readonly ConnectorContextRecord[];
  liveExecution: boolean;
  skippedReason?: string;
};

export interface ConnectorContextSource {
  read(scope: ConnectorContextReadScope): Promise<ConnectorContextSourceResult>;
  writeExternal(): never;
}

export function connectorWriteForbidden(): never {
  throw new Error("connector_write_forbidden");
}
