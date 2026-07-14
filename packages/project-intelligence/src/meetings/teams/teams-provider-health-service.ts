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
  type TeamsCapabilityMap,
} from "./capability-contract";
import {
  readMicrosoftGraphConfig,
  MicrosoftGraphTokenService,
} from "./microsoft-graph-token-service";
import { TeamsProviderConnectionService } from "./teams-provider-connection-service";

export type TeamsHealthStatus =
  | "healthy"
  | "warning"
  | "degraded"
  | "failed"
  | "revoked"
  | "unconfigured";

export type TeamsHealthCheck = {
  key: string;
  passed: boolean;
  detail?: string;
};

export type TeamsProviderHealthResult = {
  provider: "microsoft_teams";
  connectionId: string | null;
  status: TeamsHealthStatus;
  checks: TeamsHealthCheck[];
  latencyMs: number | null;
  errorCode: string | null;
  certifiedCapabilities: TeamsCapabilityMap;
  graphMode: "live" | "fixture" | "unconfigured";
  correlationId: string;
  checkedAt: string;
};

/**
 * Customer-visible Teams provider health — no secrets, tokens, or raw Graph payloads.
 */
export class TeamsProviderHealthService {
  constructor(
    private readonly db: MeetingSupabaseClient,
    private readonly connections = new TeamsProviderConnectionService(db),
  ) {}

  async check(input: {
    tenantId: string;
    connectionId?: string | null;
    correlationId?: string;
  }): Promise<TeamsProviderHealthResult> {
    const correlationId = input.correlationId ?? randomUUID();
    const started = Date.now();
    const checks: TeamsHealthCheck[] = [];
    let status: TeamsHealthStatus = "healthy";
    let errorCode: string | null = null;

    const connection = input.connectionId
      ? await this.getConnectionById(input.tenantId, input.connectionId)
      : await this.connections.getForTenant(input.tenantId);

    if (!connection) {
      return {
        provider: "microsoft_teams",
        connectionId: null,
        status: "unconfigured",
        checks: [{ key: "provider_connection", passed: false, detail: "missing" }],
        latencyMs: Date.now() - started,
        errorCode: "teams_provider_not_configured",
        certifiedCapabilities: {
          ...CERTIFIED_TEAMS_CAPABILITY_SUBSET,
          meeting_url_validation: "unconfigured",
          meeting_discovery: "unconfigured",
          session_mapping: "unconfigured",
          webhook_events: "unconfigured",
          participant_metadata: "unconfigured",
          transcript_retrieval: "unconfigured",
          meeting_end_detection: "unconfigured",
          subscription_renewal: "unconfigured",
        },
        graphMode: "unconfigured",
        correlationId,
        checkedAt: new Date().toISOString(),
      };
    }

    if (connection.status === "revoked") {
      status = "revoked";
      checks.push({ key: "provider_connection", passed: false, detail: "revoked" });
      errorCode = "teams_provider_not_configured";
    } else {
      checks.push({ key: "provider_connection", passed: true, detail: connection.status });
    }

    checks.push({
      key: "tenant_id",
      passed: Boolean(connection.providerTenantId),
      detail: connection.providerTenantId ? "present" : "missing",
    });

    const config = readMicrosoftGraphConfig();
    const graphMode = config?.mode ?? "unconfigured";
    checks.push({
      key: "graph_config",
      passed: Boolean(config),
      detail: graphMode,
    });
    if (!config) {
      status = status === "revoked" ? status : "unconfigured";
      errorCode = errorCode ?? "teams_provider_not_configured";
    }

    let tokenHealth: ReturnType<MicrosoftGraphTokenService["health"]> | null = null;
    if (config && status !== "revoked") {
      const tokenService = new MicrosoftGraphTokenService(config);
      try {
        await tokenService.getAccessToken(correlationId);
        tokenHealth = tokenService.health();
        checks.push({ key: "token_acquisition", passed: true, detail: config.mode });
        checks.push({
          key: "rate_limit_circuit",
          passed: !tokenHealth.circuitOpen,
          detail: tokenHealth.circuitOpen ? "open" : "closed",
        });
        if (tokenHealth.circuitOpen) {
          status = "degraded";
          errorCode = errorCode ?? "teams_rate_limited";
        }
      } catch (error) {
        const code = (error as { code?: string }).code ?? "teams_provider_auth_failed";
        checks.push({ key: "token_acquisition", passed: false, detail: String(code) });
        status = code === "teams_rate_limited" ? "degraded" : "failed";
        errorCode = String(code);
      }
    }

    checks.push({
      key: "consent_status",
      passed: connection.consentStatus === "granted",
      detail: connection.consentStatus,
    });
    if (connection.consentStatus !== "granted" && status === "healthy") {
      status = "warning";
      errorCode = errorCode ?? "teams_provider_consent_required";
    }

    checks.push({
      key: "webhook_endpoint",
      passed: Boolean(config?.notificationUrl) || config?.mode === "fixture",
      detail: config?.notificationUrl ? "configured" : config?.mode === "fixture" ? "fixture" : "missing",
    });
    checks.push({
      key: "lifecycle_endpoint",
      passed: Boolean(config?.lifecycleNotificationUrl) || config?.mode === "fixture",
      detail: config?.lifecycleNotificationUrl
        ? "configured"
        : config?.mode === "fixture"
          ? "fixture"
          : "missing",
    });

    const { data: subs, error: subError } = await awaitList(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .select("*")
        .eq("provider_connection_id", connection.id)
        .in("status", ["active", "renewal_due", "renewing", "failed", "expired"]),
    );
    if (subError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to read subscription health: ${subError.message}`,
        500,
      );
    }
    const activeSubs = (subs ?? []).filter((s) =>
      ["active", "renewal_due", "renewing"].includes(String(s.status)),
    );
    const failedSubs = (subs ?? []).filter((s) =>
      ["failed", "expired"].includes(String(s.status)),
    );
    const soon = Date.now() + 6 * 60 * 60 * 1000;
    const expiring = activeSubs.filter((s) => new Date(String(s.expiration_at)).getTime() < soon);

    checks.push({
      key: "subscription_state",
      passed: failedSubs.length === 0,
      detail: `active=${activeSubs.length};failed=${failedSubs.length}`,
    });
    checks.push({
      key: "subscription_expiry",
      passed: expiring.length === 0,
      detail: expiring.length ? `renewal_due=${expiring.length}` : "ok",
    });
    if (failedSubs.length && status === "healthy") {
      status = "degraded";
      errorCode = errorCode ?? "teams_subscription_failed";
    } else if (expiring.length && (status === "healthy" || status === "warning")) {
      status = "warning";
    }

    const { data: recentEvents } = await awaitList(
      this.db
        .from("project_intelligence_meeting_provider_events")
        .select("id,received_at,processing_status")
        .eq("provider_connection_id", connection.id)
        .order("received_at", { ascending: false })
        .limit(1),
    );
    checks.push({
      key: "latest_notification",
      passed: true,
      detail: recentEvents?.[0]
        ? `status=${String(recentEvents[0].processing_status)}`
        : "none",
    });

    const { data: recentMappings } = await awaitList(
      this.db
        .from("project_intelligence_meeting_provider_mappings")
        .select("id,last_sync_at,last_sync_status")
        .eq("provider_connection_id", connection.id)
        .order("last_sync_at", { ascending: false })
        .limit(1),
    );
    checks.push({
      key: "latest_successful_sync",
      passed: !recentMappings?.[0] || String(recentMappings[0].last_sync_status) === "ok",
      detail: recentMappings?.[0]
        ? String(recentMappings[0].last_sync_status ?? "unknown")
        : "none",
    });

    const caps = connection.certifiedCapabilities ?? CERTIFIED_TEAMS_CAPABILITY_SUBSET;
    checks.push({
      key: "certified_capabilities",
      passed: caps.meeting_url_validation === "certified",
      detail: "subset",
    });
    checks.push({
      key: "meeting_discovery",
      passed: caps.meeting_discovery === "certified",
    });
    checks.push({
      key: "participant_mapping",
      passed: caps.participant_metadata === "certified",
    });
    checks.push({
      key: "transcript_capability",
      passed: caps.transcript_retrieval === "certified",
      detail: "post_meeting",
    });
    checks.push({
      key: "last_error_code",
      passed: !errorCode,
      detail: errorCode ?? "none",
    });

    const latencyMs = Date.now() - started;
    const checkedAt = new Date().toISOString();

    const { error: insertError } = await awaitSingle(
      this.db
        .from("project_intelligence_meeting_provider_health")
        .insert({
          tenant_id: input.tenantId,
          provider_connection_id: connection.id,
          checked_at: checkedAt,
          status,
          checks: Object.fromEntries(checks.map((c) => [c.key, c])),
          latency_ms: latencyMs,
          error_code: errorCode,
          correlation_id: correlationId,
        })
        .select("id")
        .single(),
    );
    if (insertError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to persist provider health: ${insertError.message}`,
        500,
      );
    }

    await awaitMutation(
      this.db
        .from("project_intelligence_meeting_provider_connections")
        .update({
          last_health_check_at: checkedAt,
          last_health_status: status,
          last_error_code: errorCode,
          status:
            status === "revoked"
              ? "revoked"
              : status === "failed"
                ? "failed"
                : status === "degraded" || status === "warning"
                  ? "degraded"
                  : status === "unconfigured"
                    ? "unconfigured"
                    : "healthy",
          updated_at: checkedAt,
        })
        .eq("id", connection.id)
        .eq("tenant_id", input.tenantId),
    );

    return {
      provider: "microsoft_teams",
      connectionId: connection.id,
      status,
      checks,
      latencyMs,
      errorCode,
      certifiedCapabilities: caps,
      graphMode: graphMode === "unconfigured" ? "unconfigured" : graphMode,
      correlationId,
      checkedAt,
    };
  }

  private async getConnectionById(tenantId: string, connectionId: string) {
    const { data, error } = await awaitList(
      this.db
        .from("project_intelligence_meeting_provider_connections")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("id", connectionId)
        .eq("provider", "microsoft_teams")
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
    if (!row) return null;
    return {
      id: String(row.id),
      tenantId: String(row.tenant_id),
      workspaceId: row.workspace_id == null ? null : String(row.workspace_id),
      provider: "microsoft_teams" as const,
      providerTenantId: String(row.provider_tenant_id),
      status: String(row.status),
      consentStatus: String(row.consent_status),
      certifiedCapabilities: (row.certified_capabilities ??
        CERTIFIED_TEAMS_CAPABILITY_SUBSET) as TeamsCapabilityMap,
      authMode: String(row.auth_mode),
    };
  }
}
