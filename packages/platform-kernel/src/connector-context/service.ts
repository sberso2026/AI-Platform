import type { SupabaseClient } from "@rtb/database";
import { assemblePlatformConnectorContext, emptyConnectorContextRead } from "./assemble";
import type {
  PlatformConnectorContextRead,
  PlatformConnectorInstallationLite,
  PlatformConnectorStagingLite,
} from "./types";

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name) as ReturnType<SupabaseClient["from"]>;
}

/**
 * Provider-neutral, credential-stripped connector context read.
 * Reuses existing canonical connector installation/staging tables.
 * Does not sync, write, or hold connector credentials.
 */
export class PlatformConnectorContextService {
  constructor(private readonly supabase: SupabaseClient) {}

  writeExternal(): never {
    throw new Error("connector_write_forbidden");
  }

  async readStagedContext(scope: {
    tenantId: string;
    workspaceId: string;
    userId?: string;
  }): Promise<PlatformConnectorContextRead> {
    if (!scope.workspaceId) return { ...emptyConnectorContextRead(), availability: "unavailable" };
    try {
      const [{ data: installationRows, error: installationError }, { data: stagingRows, error: stagingError }] =
        await Promise.all([
          table(this.supabase, "business_os_connector_installations")
            .select("id, tenant_id, workspace_id, health, effective_mode, provenance")
            .eq("tenant_id", scope.tenantId)
            .eq("workspace_id", scope.workspaceId),
          table(this.supabase, "business_os_connector_staging")
            .select(
              "id, tenant_id, workspace_id, connector_id, installation_id, provider, external_source_id, data_class, retrieved_at, source_updated_at, freshness, mapping_version, payload, match_status, canonical_entity_type, canonical_entity_id, suppressed, provenance",
            )
            .eq("tenant_id", scope.tenantId)
            .eq("workspace_id", scope.workspaceId),
        ]);
      if (installationError) throw new Error(installationError.message);
      if (stagingError) throw new Error(stagingError.message);
      const installations: PlatformConnectorInstallationLite[] = ((installationRows ?? []) as Record<string, unknown>[]).map(
        (row) => ({
          id: String(row.id),
          tenantId: String(row.tenant_id),
          workspaceId: String(row.workspace_id),
          health: String(row.health ?? ""),
          effectiveMode: String(row.effective_mode ?? "fixture"),
          provenance: (row.provenance as Record<string, unknown>) ?? {},
        }),
      );
      const staging: PlatformConnectorStagingLite[] = ((stagingRows ?? []) as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        tenantId: String(row.tenant_id),
        workspaceId: String(row.workspace_id),
        connectorId: String(row.connector_id),
        installationId: String(row.installation_id),
        provider: String(row.provider ?? row.connector_id),
        externalSourceId: String(row.external_source_id),
        dataClass: String(row.data_class ?? ""),
        retrievedAt: String(row.retrieved_at ?? ""),
        sourceUpdatedAt: (row.source_updated_at as string | null) ?? null,
        freshness: String(row.freshness ?? ""),
        mappingVersion: String(row.mapping_version ?? ""),
        payload: (row.payload as Record<string, unknown>) ?? {},
        matchStatus: String(row.match_status ?? "unmatched"),
        canonicalEntityType: (row.canonical_entity_type as string | null) ?? null,
        canonicalEntityId: (row.canonical_entity_id as string | null) ?? null,
        suppressed: Boolean(row.suppressed),
        provenance: (row.provenance as Record<string, unknown>) ?? {},
      }));
      return assemblePlatformConnectorContext({ scope, installations, staging });
    } catch {
      return emptyConnectorContextRead();
    }
  }
}
