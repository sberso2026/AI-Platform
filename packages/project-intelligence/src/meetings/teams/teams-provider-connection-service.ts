import { randomUUID } from "node:crypto";

import { MeetingIntelligenceError } from "../errors";
import {
  awaitList,
  awaitMutation,
  awaitSingle,
  type MeetingSupabaseClient,
} from "../supabase-types";
import {
  CERTIFIED_TEAMS_CAPABILITY_SUBSET,
  overallTeamsProviderStatus,
  throwTeamsError,
  type TeamsCapabilityMap,
} from "./capability-contract";
import type { MicrosoftGraphClientPort } from "./microsoft-graph-client";
import {
  readMicrosoftGraphConfig,
  type MicrosoftGraphConfig,
  MicrosoftGraphTokenService,
} from "./microsoft-graph-token-service";
import { createMicrosoftGraphClient } from "./microsoft-graph-client";
import { MicrosoftGraphSubscriptionService } from "./microsoft-graph-subscription-service";

export type ProviderConnection = {
  id: string;
  tenantId: string;
  workspaceId: string | null;
  provider: "microsoft_teams";
  providerTenantId: string;
  status: string;
  consentStatus: string;
  certifiedCapabilities: TeamsCapabilityMap;
  authMode: string;
};

function mapConn(row: Record<string, unknown>): ProviderConnection {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: row.workspace_id == null ? null : String(row.workspace_id),
    provider: "microsoft_teams",
    providerTenantId: String(row.provider_tenant_id),
    status: String(row.status),
    consentStatus: String(row.consent_status),
    certifiedCapabilities: (row.certified_capabilities ?? {}) as TeamsCapabilityMap,
    authMode: String(row.auth_mode),
  };
}

export class TeamsProviderConnectionService {
  constructor(private readonly db: MeetingSupabaseClient) {}

  resolveRuntime(): {
    config: MicrosoftGraphConfig;
    tokenService: MicrosoftGraphTokenService;
    graph: MicrosoftGraphClientPort;
  } {
    const config = readMicrosoftGraphConfig();
    if (!config) {
      throwTeamsError("teams_provider_not_configured", "Microsoft Teams provider is not configured");
    }
    const tokenService = new MicrosoftGraphTokenService(config);
    const graph = createMicrosoftGraphClient(config, tokenService);
    return { config, tokenService, graph };
  }

  async configure(input: {
    tenantId: string;
    workspaceId?: string | null;
    actorUserId: string;
    displayName?: string;
    correlationId?: string;
  }): Promise<ProviderConnection> {
    const { config, tokenService } = this.resolveRuntime();
    const correlationId = input.correlationId ?? randomUUID();
    try {
      await tokenService.getAccessToken(correlationId);
    } catch {
      throwTeamsError("teams_provider_auth_failed", "Microsoft Graph token acquisition failed");
    }

    const capabilities = { ...CERTIFIED_TEAMS_CAPABILITY_SUBSET };
    const { data: existingRows, error: existingError } = await awaitList(
      this.db
        .from("project_intelligence_meeting_provider_connections")
        .select("*")
        .eq("tenant_id", input.tenantId)
        .eq("provider", "microsoft_teams")
        .eq("provider_tenant_id", config.tenantId)
        .is("revoked_at", null)
        .limit(1),
    );
    if (existingError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to read provider connection: ${existingError.message}`,
        500,
      );
    }
    const existing = existingRows?.[0];

    if (existing) {
      const { data: updated, error: updateError } = await awaitSingle(
        this.db
          .from("project_intelligence_meeting_provider_connections")
          .update({
            workspace_id: input.workspaceId ?? null,
            status: "healthy",
            auth_mode: config.mode === "fixture" ? "fixture" : "client_credentials",
            consent_status: "granted",
            consented_by: input.actorUserId,
            consented_at: new Date().toISOString(),
            configured_capabilities: capabilities,
            certified_capabilities: capabilities,
            last_health_check_at: new Date().toISOString(),
            last_health_status: "healthy",
            last_error_code: null,
            display_name: input.displayName ?? "Microsoft Teams",
            updated_at: new Date().toISOString(),
            metadata: { correlationId, graphMode: config.mode },
          })
          .eq("id", String(existing.id))
          .select("*")
          .single(),
      );
      if (updateError || !updated) {
        throw new MeetingIntelligenceError(
          "meeting_validation_failed",
          `Unable to update provider connection: ${updateError?.message ?? "no row"}`,
          500,
        );
      }
      return mapConn(updated);
    }

    const { data: inserted, error: insertError } = await awaitSingle(
      this.db
        .from("project_intelligence_meeting_provider_connections")
        .insert({
          tenant_id: input.tenantId,
          workspace_id: input.workspaceId ?? null,
          provider: "microsoft_teams",
          provider_tenant_id: config.tenantId,
          display_name: input.displayName ?? "Microsoft Teams",
          status: "healthy",
          auth_mode: config.mode === "fixture" ? "fixture" : "client_credentials",
          credential_reference: "env:MICROSOFT_CLIENT_SECRET",
          configured_capabilities: capabilities,
          certified_capabilities: capabilities,
          consent_status: "granted",
          consented_by: input.actorUserId,
          consented_at: new Date().toISOString(),
          last_health_check_at: new Date().toISOString(),
          last_health_status: "healthy",
          created_by: input.actorUserId,
          metadata: { correlationId, graphMode: config.mode },
        })
        .select("*")
        .single(),
    );
    if (insertError || !inserted) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to insert provider connection: ${insertError?.message ?? "no row"}`,
        500,
      );
    }
    return mapConn(inserted);
  }

  async revoke(connectionId: string, tenantId: string): Promise<ProviderConnection> {
    const { data: updated, error: updateError } = await awaitSingle(
      this.db
        .from("project_intelligence_meeting_provider_connections")
        .update({
          status: "revoked",
          consent_status: "revoked",
          revoked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", connectionId)
        .eq("tenant_id", tenantId)
        .select("*")
        .single(),
    );
    if (updateError || !updated) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to revoke provider connection: ${updateError?.message ?? "no row"}`,
        500,
      );
    }

    const { graph, config } = this.resolveRuntime();
    const subs = new MicrosoftGraphSubscriptionService(this.db, graph, config);
    const { data: active, error: activeError } = await awaitList(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .select("id")
        .eq("provider_connection_id", connectionId)
        .in("status", ["active", "renewal_due", "renewing", "requested"]),
    );
    if (activeError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to list subscriptions for revoke: ${activeError.message}`,
        500,
      );
    }
    for (const row of active ?? []) {
      await subs.disableSubscription(String(row.id));
    }
    return mapConn(updated);
  }

  async getForTenant(tenantId: string): Promise<ProviderConnection | null> {
    const { data, error } = await awaitList(
      this.db
        .from("project_intelligence_meeting_provider_connections")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("provider", "microsoft_teams")
        .is("revoked_at", null)
        .order("created_at", { ascending: false })
        .limit(1),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to read provider connection: ${error.message}`,
        500,
      );
    }
    const row = data?.[0];
    return row ? mapConn(row) : null;
  }

  statusReport(connection: ProviderConnection | null) {
    const capabilities = connection?.certifiedCapabilities ?? {
      ...CERTIFIED_TEAMS_CAPABILITY_SUBSET,
      meeting_url_validation: "unconfigured" as const,
      meeting_discovery: "unconfigured" as const,
      session_mapping: "unconfigured" as const,
      webhook_events: "unconfigured" as const,
      participant_metadata: "unconfigured" as const,
      transcript_retrieval: "unconfigured" as const,
      meeting_end_detection: "unconfigured" as const,
      subscription_renewal: "unconfigured" as const,
    };
    return {
      provider: "microsoft_teams" as const,
      status: connection ? overallTeamsProviderStatus(capabilities) : ("unavailable" as const),
      capabilities,
      connectionStatus: connection?.status ?? "unconfigured",
      consentStatus: connection?.consentStatus ?? "unknown",
    };
  }
}
