import {
  canReadPlatformConnectorContext,
} from "@rtb/platform-kernel";
import {
  EMPTY_CONNECTOR_CONTEXT_PACK,
  loadConnectorContext,
  type ConnectorContextPack,
  type ConnectorContextRecord,
  type ConnectorContextSource,
  connectorWriteForbidden,
} from "@rtb/project-intelligence";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";

function mapStagedRecord(row: {
  tenantId: string;
  workspaceId: string;
  connectorId: string;
  connectionId: string;
  provider: string;
  externalSourceId: string;
  dataClass: string;
  retrievedAt: string;
  sourceUpdatedAt: string | null;
  payload: Record<string, unknown>;
  provenance: Record<string, unknown>;
  canonicalEntityType: string | null;
  canonicalEntityId: string | null;
  freshnessPolicyHours: number;
  live: boolean;
}): ConnectorContextRecord {
  return {
    tenantId: row.tenantId,
    workspaceId: row.workspaceId,
    connectorId: row.connectorId,
    connectionId: row.connectionId,
    sourceSystem: row.provider || row.connectorId,
    externalResourceId: row.externalSourceId,
    resourceType: row.dataClass,
    payload: row.payload,
    sourceTimestamp: row.sourceUpdatedAt,
    retrievedAt: row.retrievedAt,
    freshnessPolicyHours: row.freshnessPolicyHours,
    provenance: row.provenance,
    permissionScope: "platform.connector_context.read",
    canonicalEntityType: row.canonicalEntityType,
    canonicalEntityId: row.canonicalEntityId,
    liveMode: row.live,
  };
}

export class HostedConnectorContextSource implements ConnectorContextSource {
  constructor(private readonly context: CommerceHandlerContext) {}

  async read(scope: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    principalId: string;
  }) {
    const ctx = this.context.ctx;
    if (scope.tenantId !== ctx.tenantId) {
      return { availability: "forbidden" as const, records: [], liveExecution: false, skippedReason: "cross_tenant" };
    }
    if (!ctx.workspaceId || scope.workspaceId !== ctx.workspaceId) {
      return {
        availability: "forbidden" as const,
        records: [],
        liveExecution: false,
        skippedReason: "cross_workspace",
      };
    }
    if (!canReadPlatformConnectorContext(ctx.permissions)) {
      return {
        availability: "forbidden" as const,
        records: [],
        liveExecution: false,
        skippedReason: "connector_permission_denied",
      };
    }
    const staged = await ctx.kernel.connectorContext.readStagedContext({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
    });
    return {
      availability: staged.availability,
      records: staged.records.map(mapStagedRecord),
      liveExecution: staged.liveExecution,
      skippedReason: staged.availability === "error" ? "connector_unavailable" : undefined,
    };
  }

  writeExternal(): never {
    return connectorWriteForbidden();
  }
}

export async function loadHostedConnectorContext(
  context: CommerceHandlerContext,
  projectId: string,
  canonical: { health: string; scheduleState: string; scheduleAvailability: string },
): Promise<ConnectorContextPack> {
  if (!context.ctx.workspaceId) {
    return {
      ...EMPTY_CONNECTOR_CONTEXT_PACK,
      availability: "unavailable",
      skippedReason: "workspace_not_assigned",
    };
  }
  const source = new HostedConnectorContextSource(context);
  return loadConnectorContext(
    source,
    {
      tenantId: context.ctx.tenantId,
      workspaceId: context.ctx.workspaceId,
      projectId,
      principalId: context.ctx.userId,
    },
    canonical,
  );
}
