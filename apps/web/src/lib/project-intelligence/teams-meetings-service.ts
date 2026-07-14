import { randomUUID } from "node:crypto";
import {
  ManualMeetingService,
  TeamsProviderConnectionService,
  TeamsProviderHealthService,
  TeamsMeetingMappingService,
  TeamsParticipantMappingService,
  MicrosoftTeamsTranscriptAdapter,
  MicrosoftGraphWebhookService,
  MicrosoftGraphSubscriptionService,
  ProjectIntelligenceTeamsJobWorker,
  allMeetingProviderCapabilityReports,
  meetingProviderCapabilityReport,
  readMicrosoftGraphConfig,
  redactMicrosoftTenantId,
  CERTIFIED_TEAMS_CAPABILITY_SUBSET,
  MeetingIntelligenceError,
  type GraphChangeNotification,
} from "@rtb/project-intelligence/server";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { createServiceClient } from "@/lib/supabase/service";

function requireWorkspace(context: CommerceHandlerContext): string {
  if (!context.ctx.workspaceId) {
    throw new MeetingIntelligenceError("meeting_access_denied", "Workspace is required", 403);
  }
  return context.ctx.workspaceId;
}

function actor(context: CommerceHandlerContext) {
  return {
    tenantId: context.ctx.tenantId,
    workspaceId: requireWorkspace(context),
    userId: context.ctx.userId,
    correlationId: context.correlationId,
  };
}

function client() {
  return createServiceClient() as unknown as ConstructorParameters<
    typeof TeamsProviderConnectionService
  >[0];
}

function publicConnection(connection: {
  id: string;
  tenantId: string;
  workspaceId: string | null;
  provider: "microsoft_teams";
  providerTenantId: string;
  status: string;
  consentStatus: string;
  certifiedCapabilities: Record<string, string>;
  authMode: string;
} | null) {
  if (!connection) return null;
  return {
    id: connection.id,
    workspaceId: connection.workspaceId,
    provider: connection.provider,
    providerTenantIdRedacted: redactMicrosoftTenantId(connection.providerTenantId),
    status: connection.status,
    consentStatus: connection.consentStatus,
    certifiedCapabilities: connection.certifiedCapabilities,
    authMode: connection.authMode,
  };
}

export async function listMeetingProviders(context: CommerceHandlerContext) {
  void actor(context);
  return allMeetingProviderCapabilityReports();
}

export async function getMicrosoftTeamsProvider(context: CommerceHandlerContext) {
  const a = actor(context);
  const connections = new TeamsProviderConnectionService(client());
  const connection = await connections.getForTenant(a.tenantId);
  const status = connections.statusReport(connection);
  const capability = meetingProviderCapabilityReport("microsoft_teams");
  const config = readMicrosoftGraphConfig();
  return {
    ...status,
    capability,
    transcriptMode: capability.transcriptSupport ? "post_meeting" : "unsupported",
    graphMode: config?.mode ?? "unconfigured",
    connection: publicConnection(connection),
    limitations: capability.limitations,
    botJoin: "unsupported" as const,
    recordingAccess: "unsupported" as const,
  };
}

export async function configureMicrosoftTeamsProvider(context: CommerceHandlerContext) {
  const a = actor(context);
  const connections = new TeamsProviderConnectionService(client());
  const connection = await connections.configure({
    tenantId: a.tenantId,
    workspaceId: a.workspaceId,
    actorUserId: a.userId,
    correlationId: a.correlationId,
  });
  return {
    connection: publicConnection(connection),
    status: connections.statusReport(connection),
  };
}

export async function revokeMicrosoftTeamsProvider(context: CommerceHandlerContext) {
  const a = actor(context);
  const connections = new TeamsProviderConnectionService(client());
  const existing = await connections.getForTenant(a.tenantId);
  if (!existing) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "Microsoft Teams provider is not configured",
      422,
      { teamsCode: "teams_provider_not_configured" },
    );
  }
  const revoked = await connections.revoke(existing.id, a.tenantId);
  return {
    connection: publicConnection(revoked),
    status: connections.statusReport(null),
  };
}

export async function testMicrosoftTeamsProvider(context: CommerceHandlerContext) {
  const a = actor(context);
  return new TeamsProviderHealthService(client()).check({
    tenantId: a.tenantId,
    correlationId: a.correlationId,
  });
}

export async function getMicrosoftTeamsProviderHealth(context: CommerceHandlerContext) {
  return testMicrosoftTeamsProvider(context);
}

export async function mapMicrosoftTeamsMeeting(
  context: CommerceHandlerContext,
  meetingId: string,
  body: { teamsJoinUrl?: string; providerMeetingId?: string },
) {
  const a = actor(context);
  await new ManualMeetingService(client()).getMeeting(a, meetingId);

  const connections = new TeamsProviderConnectionService(client());
  const connection = await connections.getForTenant(a.tenantId);
  if (!connection) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "Microsoft Teams provider is not configured",
      422,
      { teamsCode: "teams_provider_not_configured" },
    );
  }
  if (connection.consentStatus !== "granted") {
    throw new MeetingIntelligenceError(
      "meeting_access_denied",
      "Microsoft Teams provider consent is required",
      403,
      { teamsCode: "teams_provider_consent_required" },
    );
  }

  const { graph } = connections.resolveRuntime();
  const mapping = await new TeamsMeetingMappingService(client(), graph).mapMeeting({
    tenantId: a.tenantId,
    workspaceId: a.workspaceId,
    meetingSessionId: meetingId,
    providerConnectionId: connection.id,
    providerTenantId: connection.providerTenantId,
    teamsJoinUrl: body.teamsJoinUrl,
    providerMeetingId: body.providerMeetingId,
    correlationId: a.correlationId ?? randomUUID(),
  });
  return mapping;
}

export async function syncMicrosoftTeamsMeeting(
  context: CommerceHandlerContext,
  meetingId: string,
) {
  const a = actor(context);
  const meeting = await new ManualMeetingService(client()).getMeeting(a, meetingId);
  const connections = new TeamsProviderConnectionService(client());
  const connection = await connections.getForTenant(a.tenantId);
  if (!connection) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "Microsoft Teams provider is not configured",
      422,
      { teamsCode: "teams_provider_not_configured" },
    );
  }

  const { graph } = connections.resolveRuntime();
  const mappingService = new TeamsMeetingMappingService(client(), graph);
  const mapping = await mappingService.getByMeeting(meetingId);
  if (!mapping) {
    throw new MeetingIntelligenceError(
      "meeting_validation_failed",
      "Teams meeting is not mapped",
      422,
      { teamsCode: "teams_meeting_not_found" },
    );
  }

  const participants = await new TeamsParticipantMappingService(client(), graph).syncParticipants({
    tenantId: a.tenantId,
    workspaceId: a.workspaceId,
    meetingSessionId: meetingId,
    engineeringProjectId: meeting.engineering_project_id,
    providerMeetingId: mapping.providerMeetingId,
    correlationId: a.correlationId ?? randomUUID(),
  });

  let transcript: Awaited<
    ReturnType<MicrosoftTeamsTranscriptAdapter["ingestPostMeetingTranscript"]>
  > | null = null;
  const consentSatisfied = meeting.consent_status === "granted";
  if (consentSatisfied && connection.certifiedCapabilities.transcript_retrieval === "certified") {
    transcript = await new MicrosoftTeamsTranscriptAdapter(client(), graph).ingestPostMeetingTranscript({
      actor: a,
      meetingId,
      providerMeetingId: mapping.providerMeetingId,
      correlationId: a.correlationId ?? randomUUID(),
      consentSatisfied: true,
    });
  }

  return {
    mapping,
    participants,
    transcript,
    transcriptMode: transcript?.transcriptMode ?? (consentSatisfied ? "post_meeting" : "unsupported"),
    transcriptSkippedReason: consentSatisfied
      ? null
      : "consent_not_granted",
  };
}

export async function getMicrosoftTeamsMeetingStatus(
  context: CommerceHandlerContext,
  meetingId: string,
) {
  const a = actor(context);
  await new ManualMeetingService(client()).getMeeting(a, meetingId);
  const connections = new TeamsProviderConnectionService(client());
  const connection = await connections.getForTenant(a.tenantId);
  let mapping = null;
  const config = readMicrosoftGraphConfig();
  if (config) {
    const { graph } = connections.resolveRuntime();
    mapping = await new TeamsMeetingMappingService(client(), graph).getByMeeting(meetingId);
  }
  const capability = meetingProviderCapabilityReport("microsoft_teams");
  return {
    provider: "microsoft_teams" as const,
    mapping,
    connection: publicConnection(connection),
    status: connections.statusReport(connection),
    transcriptMode: capability.transcriptSupport ? "post_meeting" : "unsupported",
    botJoin: "unsupported" as const,
    recordingAccess: "unsupported" as const,
    capabilities: connection?.certifiedCapabilities ?? {
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
  };
}

export async function handleMicrosoftGraphWebhook(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const correlationId =
    request.headers.get("x-correlation-id") ?? randomUUID();
  const config = readMicrosoftGraphConfig();
  if (!config) {
    return Response.json(
      {
        error: {
          code: "teams_provider_not_configured",
          message: "Microsoft Teams provider is not configured",
          requestId: correlationId,
        },
      },
      { status: 422 },
    );
  }

  const db = client();
  const webhooks = new MicrosoftGraphWebhookService(db, config);
  const validationToken = webhooks.validationHandshake(url);
  if (validationToken) {
    return new Response(validationToken, {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }

  if (request.method === "GET") {
    return Response.json(
      {
        error: {
          code: "teams_webhook_validation_failed",
          message: "validationToken required for GET",
          requestId: correlationId,
        },
      },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const notifications = Array.isArray((body as { value?: unknown }).value)
    ? ((body as { value: GraphChangeNotification[] }).value)
    : Array.isArray(body)
      ? (body as GraphChangeNotification[])
      : [];

  if (!notifications.length) {
    return Response.json({ data: { events: [], correlationId } });
  }

  const firstSub = notifications[0]?.subscriptionId;
  let tenantId: string | null = null;
  let providerConnectionId: string | null = null;
  let workspaceId: string | null = null;

  if (firstSub) {
    const subResult = await (db
      .from("project_intelligence_meeting_graph_subscriptions")
      .select("tenant_id,workspace_id,provider_connection_id")
      .eq("graph_subscription_id", firstSub)
      .limit(1) as unknown as Promise<{ data: Record<string, unknown>[] | null }>);
    const row = subResult.data?.[0];
    if (row) {
      tenantId = String(row.tenant_id);
      providerConnectionId = String(row.provider_connection_id);
      workspaceId = row.workspace_id == null ? null : String(row.workspace_id);
    }
  }

  if (!tenantId) {
    const connResult = await (db
      .from("project_intelligence_meeting_provider_connections")
      .select("*")
      .eq("provider", "microsoft_teams")
      .eq("provider_tenant_id", config.tenantId)
      .is("revoked_at", null)
      .limit(1) as unknown as Promise<{ data: Record<string, unknown>[] | null }>);
    const conn = connResult.data?.[0];
    if (conn) {
      tenantId = String(conn.tenant_id);
      providerConnectionId = String(conn.id);
      workspaceId = conn.workspace_id == null ? null : String(conn.workspace_id);
    } else {
      return Response.json(
        {
          error: {
            code: "teams_provider_not_configured",
            message: "No provider connection for Graph notification",
            requestId: correlationId,
          },
        },
        { status: 422 },
      );
    }
  }

  try {
    const events = await webhooks.persistNotifications({
      tenantId,
      workspaceId,
      providerConnectionId,
      notifications,
      correlationId,
    });
    return Response.json({ data: { events, correlationId } });
  } catch (error) {
    if (error instanceof MeetingIntelligenceError) {
      return Response.json(
        {
          error: {
            code: (error.details?.teamsCode as string | undefined) ?? error.code,
            message: error.message,
            requestId: correlationId,
            details: error.details,
          },
        },
        { status: error.statusCode },
      );
    }
    throw error;
  }
}

export async function handleMicrosoftGraphLifecycleWebhook(
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const correlationId =
    request.headers.get("x-correlation-id") ?? randomUUID();
  const config = readMicrosoftGraphConfig();
  if (!config) {
    return Response.json(
      {
        error: {
          code: "teams_provider_not_configured",
          message: "Microsoft Teams provider is not configured",
          requestId: correlationId,
        },
      },
      { status: 422 },
    );
  }

  const db = client();
  const webhooks = new MicrosoftGraphWebhookService(db, config);
  const validationToken = webhooks.validationHandshake(url);
  if (validationToken) {
    return new Response(validationToken, {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  }

  const body = await request.json().catch(() => ({}));
  const notifications = Array.isArray((body as { value?: unknown }).value)
    ? ((body as { value: Array<{ subscriptionId?: string; lifecycleEvent?: string; clientState?: string }> }).value)
    : [];

  const { graph } = new TeamsProviderConnectionService(db).resolveRuntime();
  const subs = new MicrosoftGraphSubscriptionService(db, graph, config);

  for (const n of notifications) {
    webhooks.assertClientState(n.clientState);
    if (n.subscriptionId && n.lifecycleEvent) {
      await subs.handleLifecycleNotification({
        subscriptionId: n.subscriptionId,
        lifecycleEvent: n.lifecycleEvent,
        correlationId,
      });
    }
  }

  return Response.json({ data: { processed: notifications.length, correlationId } });
}

export async function runTeamsWorkerOnce(options?: {
  batchSize?: number;
  correlationId?: string;
}) {
  const worker = new ProjectIntelligenceTeamsJobWorker(client(), {
    batchSize: options?.batchSize,
  });
  const correlationId = (options?.correlationId ?? randomUUID()) as ReturnType<typeof randomUUID>;
  const result = await worker.processBatch(correlationId);
  return result;
}

