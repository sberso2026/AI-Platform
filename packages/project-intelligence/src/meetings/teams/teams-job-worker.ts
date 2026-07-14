import { randomUUID } from "node:crypto";

import { MeetingIntelligenceError } from "../errors";
import {
  asRecord,
  awaitList,
  awaitMutation,
  type MeetingSupabaseClient,
} from "../supabase-types";
import { extractOnlineMeetingIdFromGraphResource } from "./microsoft-graph-client";
import { MicrosoftGraphSubscriptionService } from "./microsoft-graph-subscription-service";
import { TeamsProviderConnectionService } from "./teams-provider-connection-service";

export type TeamsJobWorkerOptions = {
  batchSize?: number;
};

/**
 * Teams-specific durable work: renew Graph subscriptions and process queued provider events.
 * Does not bypass the certified processing / human-review pipeline.
 */
export class TeamsJobWorker {
  private readonly batchSize: number;

  constructor(
    private readonly db: MeetingSupabaseClient,
    options: TeamsJobWorkerOptions = {},
  ) {
    this.batchSize = options.batchSize ?? 25;
  }

  async renewDueSubscriptions(correlationId = randomUUID()): Promise<{
    markedDue: number;
    renewed: number;
    failed: number;
  }> {
    const connections = new TeamsProviderConnectionService(this.db);
    let config;
    let graph;
    try {
      ({ config, graph } = connections.resolveRuntime());
    } catch {
      return { markedDue: 0, renewed: 0, failed: 0 };
    }

    const subs = new MicrosoftGraphSubscriptionService(this.db, graph, config);
    const markedDue = await subs.markRenewalDue();

    const { data: dueRows, error } = await awaitList(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .select("id")
        .eq("status", "renewal_due")
        .limit(this.batchSize),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to list renewal-due subscriptions: ${error.message}`,
        500,
      );
    }

    let renewed = 0;
    let failed = 0;
    for (const row of dueRows ?? []) {
      try {
        await subs.renewSubscription(String(row.id), correlationId);
        renewed += 1;
      } catch {
        failed += 1;
      }
    }
    return { markedDue, renewed, failed };
  }

  async processProviderEvents(correlationId = randomUUID()): Promise<{
    claimed: number;
    completed: number;
    failed: number;
  }> {
    const { data: queued, error } = await awaitList(
      this.db
        .from("project_intelligence_meeting_provider_events")
        .select("*")
        .eq("provider", "microsoft_teams")
        .eq("processing_status", "queued")
        .order("received_at", { ascending: true })
        .limit(this.batchSize),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to claim provider events: ${error.message}`,
        500,
      );
    }

    let completed = 0;
    let failed = 0;
    for (const row of queued ?? []) {
      const id = String(row.id);
      try {
        await awaitMutation(
          this.db
            .from("project_intelligence_meeting_provider_events")
            .update({
              processing_status: "processing",
              attempt_count: Number(row.attempt_count ?? 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("processing_status", "queued"),
        );
        await this.handleProviderEvent(row, correlationId);
        await awaitMutation(
          this.db
            .from("project_intelligence_meeting_provider_events")
            .update({
              processing_status: "completed",
              updated_at: new Date().toISOString(),
              last_error_code: null,
            })
            .eq("id", id),
        );
        completed += 1;
      } catch (reason) {
        failed += 1;
        const code =
          reason instanceof MeetingIntelligenceError
            ? reason.code
            : (reason as { code?: string }).code ?? "processing_failed";
        const attempts = Number(row.attempt_count ?? 0) + 1;
        await awaitMutation(
          this.db
            .from("project_intelligence_meeting_provider_events")
            .update({
              processing_status: attempts >= 5 ? "dead_letter" : "failed",
              last_error_code: String(code),
              updated_at: new Date().toISOString(),
            })
            .eq("id", id),
        );
      }
    }
    return { claimed: (queued ?? []).length, completed, failed };
  }

  async processBatch(correlationId = randomUUID()): Promise<{
    renewals: { markedDue: number; renewed: number; failed: number };
    events: { claimed: number; completed: number; failed: number };
  }> {
    const renewals = await this.renewDueSubscriptions(correlationId);
    const events = await this.processProviderEvents(correlationId);
    return { renewals, events };
  }

  private async handleProviderEvent(
    row: Record<string, unknown>,
    correlationId: string,
  ): Promise<void> {
    const payload = asRecord(row.payload);
    const resource = String(row.resource ?? payload.resource ?? "");
    const changeType = String(row.change_type ?? payload.changeType ?? "");
    const providerMeetingId =
      extractOnlineMeetingIdFromGraphResource(resource) ??
      (payload.resourceData && typeof payload.resourceData === "object"
        ? String((payload.resourceData as { id?: string }).id ?? "") || null
        : null);

    let meetingSessionId =
      row.meeting_session_id == null ? null : String(row.meeting_session_id);

    if (!meetingSessionId && providerMeetingId) {
      const { data: mappings, error } = await awaitList(
        this.db
          .from("project_intelligence_meeting_provider_mappings")
          .select("*")
          .eq("tenant_id", String(row.tenant_id))
          .eq("provider_meeting_id", providerMeetingId)
          .in("mapping_status", ["mapped", "verified"])
          .limit(1),
      );
      if (error) {
        throw new MeetingIntelligenceError(
          "meeting_validation_failed",
          `Unable to resolve mapping for provider event: ${error.message}`,
          500,
        );
      }
      const mapping = mappings?.[0];
      if (mapping) {
        meetingSessionId = String(mapping.meeting_session_id);
        await awaitMutation(
          this.db
            .from("project_intelligence_meeting_provider_events")
            .update({
              meeting_session_id: meetingSessionId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", String(row.id)),
        );
        await awaitMutation(
          this.db
            .from("project_intelligence_meeting_provider_mappings")
            .update({
              last_sync_at: new Date().toISOString(),
              last_sync_status: "ok",
              updated_at: new Date().toISOString(),
            })
            .eq("id", String(mapping.id)),
        );
      }
    }

    if (!meetingSessionId) {
      // Unmapped notifications remain durable but complete without session mutation.
      return;
    }

    const { data: sessions, error: sessionError } = await awaitList(
      this.db
        .from("project_intelligence_meeting_sessions")
        .select("id,tenant_id,workspace_id,status")
        .eq("id", meetingSessionId)
        .limit(1),
    );
    if (sessionError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to load meeting for provider event: ${sessionError.message}`,
        500,
      );
    }
    const session = sessions?.[0];
    if (!session) return;

    const looksLikeEnd =
      /ended|deleted|removed/i.test(changeType) || /ended/i.test(resource);

    await awaitMutation(
      this.db.from("project_intelligence_meeting_events").insert({
        tenant_id: session.tenant_id,
        workspace_id: session.workspace_id,
        meeting_session_id: meetingSessionId,
        event_type: looksLikeEnd ? "teams.meeting_end_detected" : "teams.provider_event_processed",
        actor_type: "system",
        correlation_id: String(row.correlation_id ?? correlationId),
        payload: {
          providerEventId: row.provider_event_id,
          changeType,
          providerMeetingId,
          resource,
        },
      }),
    );
  }
}
