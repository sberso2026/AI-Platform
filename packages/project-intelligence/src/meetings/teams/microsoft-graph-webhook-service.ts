import { createHash, randomUUID } from "node:crypto";

import { MeetingIntelligenceError } from "../errors";
import {
  awaitList,
  awaitMutation,
  awaitSingle,
  type MeetingSupabaseClient,
} from "../supabase-types";
import { throwTeamsError } from "./capability-contract";
import { extractOnlineMeetingIdFromGraphResource } from "./microsoft-graph-client";
import { hashClientState, type MicrosoftGraphConfig } from "./microsoft-graph-token-service";
import { checksumPayload } from "./microsoft-graph-subscription-service";

export type GraphChangeNotification = {
  subscriptionId?: string;
  clientState?: string;
  resource?: string;
  changeType?: string;
  tenantId?: string;
  resourceData?: { id?: string };
  id?: string;
};

export type DurableProviderEvent = {
  id: string;
  providerEventId: string;
  processingStatus: string;
  duplicate: boolean;
  meetingSessionId: string | null;
  providerMeetingId: string | null;
};

function eventKey(n: GraphChangeNotification): string {
  return [
    n.subscriptionId ?? "",
    n.resource ?? "",
    n.changeType ?? "",
    n.resourceData?.id ?? "",
    n.id ?? "",
  ].join("|");
}

export class MicrosoftGraphWebhookService {
  constructor(
    private readonly db: MeetingSupabaseClient,
    private readonly config: MicrosoftGraphConfig,
  ) {}

  validationHandshake(url: URL): string | null {
    return url.searchParams.get("validationToken");
  }

  assertClientState(clientState: string | undefined): void {
    if (!clientState || clientState !== this.config.webhookSecret) {
      throwTeamsError("teams_webhook_validation_failed", "Graph webhook clientState invalid");
    }
  }

  async persistNotifications(input: {
    tenantId: string;
    workspaceId?: string | null;
    providerConnectionId: string | null;
    notifications: GraphChangeNotification[];
    correlationId: string;
  }): Promise<DurableProviderEvent[]> {
    const results: DurableProviderEvent[] = [];
    for (const n of input.notifications) {
      this.assertClientState(n.clientState);

      if (n.tenantId && n.tenantId !== this.config.tenantId && this.config.mode === "live") {
        throwTeamsError("teams_tenant_mismatch", "Graph notification tenant mismatch");
      }

      const providerEventId = eventKey(n) || randomUUID();
      const { data: existingRows, error: existingError } = await awaitList(
        this.db
          .from("project_intelligence_meeting_provider_events")
          .select("*")
          .eq("provider", "microsoft_teams")
          .eq("provider_event_id", providerEventId)
          .limit(1),
      );
      if (existingError) {
        throw new MeetingIntelligenceError(
          "meeting_validation_failed",
          `Unable to read provider events: ${existingError.message}`,
          500,
        );
      }
      const existing = existingRows?.[0];
      if (existing) {
        results.push({
          id: String(existing.id),
          providerEventId,
          processingStatus: "deduplicated",
          duplicate: true,
          meetingSessionId:
            existing.meeting_session_id == null ? null : String(existing.meeting_session_id),
          providerMeetingId: extractOnlineMeetingIdFromGraphResource(String(n.resource ?? "")),
        });
        continue;
      }

      const providerMeetingId =
        extractOnlineMeetingIdFromGraphResource(String(n.resource ?? "")) ??
        (n.resourceData?.id ? String(n.resourceData.id) : null);

      let meetingSessionId: string | null = null;
      if (providerMeetingId) {
        const { data: mappingRows, error: mappingError } = await awaitList(
          this.db
            .from("project_intelligence_meeting_provider_mappings")
            .select("*")
            .eq("tenant_id", input.tenantId)
            .eq("provider_meeting_id", providerMeetingId)
            .in("mapping_status", ["mapped", "verified"])
            .limit(1),
        );
        if (mappingError) {
          throw new MeetingIntelligenceError(
            "meeting_validation_failed",
            `Unable to resolve provider mapping: ${mappingError.message}`,
            500,
          );
        }
        const mapping = mappingRows?.[0];
        if (mapping) {
          meetingSessionId = String(mapping.meeting_session_id);
        }
      }

      const payload = {
        subscriptionId: n.subscriptionId ?? null,
        resource: n.resource ?? null,
        changeType: n.changeType ?? null,
        tenantId: n.tenantId ?? null,
        resourceData: n.resourceData ?? null,
      };

      try {
        const { data: inserted, error: insertError } = await awaitSingle(
          this.db
            .from("project_intelligence_meeting_provider_events")
            .insert({
              tenant_id: input.tenantId,
              workspace_id: input.workspaceId ?? null,
              provider_connection_id: input.providerConnectionId,
              meeting_session_id: meetingSessionId,
              provider: "microsoft_teams",
              provider_event_id: providerEventId,
              subscription_id: n.subscriptionId ?? null,
              resource: n.resource ?? null,
              change_type: n.changeType ?? null,
              provider_timestamp: null,
              payload_checksum: checksumPayload(payload),
              processing_status: "queued",
              attempt_count: 0,
              correlation_id: input.correlationId,
              payload,
            })
            .select("*")
            .single(),
        );
        if (insertError || !inserted) {
          const message = insertError?.message ?? "no row";
          if (message.toLowerCase().includes("duplicate") || insertError?.code === "23505") {
            throwTeamsError("teams_webhook_replay_detected", "Duplicate Graph provider event");
          }
          throw new MeetingIntelligenceError(
            "meeting_validation_failed",
            `Unable to persist provider event: ${message}`,
            500,
          );
        }

        if (n.subscriptionId) {
          await awaitMutation(
            this.db
              .from("project_intelligence_meeting_graph_subscriptions")
              .update({
                last_notification_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("graph_subscription_id", n.subscriptionId),
          );
        }

        results.push({
          id: String(inserted.id),
          providerEventId,
          processingStatus: "queued",
          duplicate: false,
          meetingSessionId,
          providerMeetingId,
        });
      } catch (error) {
        if (error instanceof MeetingIntelligenceError) throw error;
        const message = error instanceof Error ? error.message : String(error);
        if (message.toLowerCase().includes("duplicate") || message.includes("23505")) {
          throwTeamsError("teams_webhook_replay_detected", "Duplicate Graph provider event");
        }
        throw error;
      }
    }
    return results;
  }

  verifySubscriptionClientStateHash(storedHash: string): boolean {
    return storedHash === hashClientState(this.config.webhookSecret);
  }
}

export function redactSecretsFromText(text: string, secrets: string[]): string {
  let out = text;
  for (const secret of secrets) {
    if (!secret) continue;
    out = out.split(secret).join("[REDACTED]");
  }
  return out;
}

export function containsSecretExposure(haystack: string, secrets: string[]): boolean {
  return secrets.some((s) => Boolean(s) && haystack.includes(s));
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
