import { createHash, randomUUID } from "node:crypto";

import { MeetingIntelligenceError } from "../errors";
import {
  awaitList,
  awaitMutation,
  awaitSingle,
  type MeetingSupabaseClient,
} from "../supabase-types";
import { throwTeamsError } from "./capability-contract";
import type { MicrosoftGraphClientPort } from "./microsoft-graph-client";
import { hashClientState, type MicrosoftGraphConfig } from "./microsoft-graph-token-service";

export type GraphSubscriptionRow = {
  id: string;
  tenantId: string;
  providerConnectionId: string;
  graphSubscriptionId: string;
  resource: string;
  status: string;
  expirationAt: string;
};

function mapSub(row: Record<string, unknown>): GraphSubscriptionRow {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    providerConnectionId: String(row.provider_connection_id),
    graphSubscriptionId: String(row.graph_subscription_id),
    resource: String(row.resource),
    status: String(row.status),
    expirationAt: String(row.expiration_at),
  };
}

export class MicrosoftGraphSubscriptionService {
  constructor(
    private readonly db: MeetingSupabaseClient,
    private readonly graph: MicrosoftGraphClientPort,
    private readonly config: MicrosoftGraphConfig,
  ) {}

  async createSubscription(input: {
    tenantId: string;
    workspaceId?: string | null;
    providerConnectionId: string;
    resource: string;
    correlationId: string;
  }): Promise<GraphSubscriptionRow> {
    const { data: existingRows, error: existingError } = await awaitList(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .select("*")
        .eq("provider_connection_id", input.providerConnectionId)
        .eq("resource", input.resource)
        .in("status", ["requested", "active", "renewal_due", "renewing"])
        .limit(1),
    );
    if (existingError) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to read Graph subscriptions: ${existingError.message}`,
        500,
      );
    }
    const existing = existingRows?.[0];
    if (existing) {
      return mapSub(existing);
    }

    const notificationUrl =
      this.config.notificationUrl ??
      "https://localhost/api/webhooks/microsoft-graph/project-intelligence-meetings";
    const expiration = new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString();
    let created;
    try {
      created = await this.graph.createSubscription({
        resource: input.resource,
        changeType: "created,updated",
        notificationUrl,
        lifecycleNotificationUrl: this.config.lifecycleNotificationUrl,
        clientState: this.config.webhookSecret,
        expirationDateTime: expiration,
        correlationId: input.correlationId,
      });
    } catch {
      throwTeamsError("teams_subscription_failed", "Failed to create Graph subscription");
    }

    const { data: inserted, error: insertError } = await awaitSingle(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .insert({
          tenant_id: input.tenantId,
          workspace_id: input.workspaceId ?? null,
          provider_connection_id: input.providerConnectionId,
          graph_subscription_id: created.id,
          resource: input.resource,
          notification_url: notificationUrl,
          lifecycle_notification_url: this.config.lifecycleNotificationUrl,
          client_state_hash: hashClientState(this.config.webhookSecret),
          status: "active",
          expiration_at: created.expirationDateTime,
          metadata: { correlationId: input.correlationId },
        })
        .select("*")
        .single(),
    );
    if (insertError || !inserted) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to insert Graph subscription: ${insertError?.message ?? "no row"}`,
        500,
      );
    }
    return mapSub(inserted);
  }

  async renewSubscription(rowId: string, correlationId: string): Promise<GraphSubscriptionRow> {
    const { data: current, error: currentError } = await awaitSingle(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .select("*")
        .eq("id", rowId)
        .single(),
    );
    if (currentError || !current) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to read Graph subscription: ${currentError?.message ?? "no row"}`,
        500,
      );
    }
    const expiration = new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString();
    await awaitMutation(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .update({ status: "renewing", updated_at: new Date().toISOString() })
        .eq("id", rowId),
    );
    try {
      const renewed = await this.graph.renewSubscription(
        String(current.graph_subscription_id),
        expiration,
        correlationId,
      );
      const { data: updated, error: updateError } = await awaitSingle(
        this.db
          .from("project_intelligence_meeting_graph_subscriptions")
          .update({
            status: "active",
            expiration_at: renewed.expirationDateTime,
            last_renewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", rowId)
          .select("*")
          .single(),
      );
      if (updateError || !updated) {
        throw new Error(updateError?.message ?? "no row");
      }
      return mapSub(updated);
    } catch {
      await awaitMutation(
        this.db
          .from("project_intelligence_meeting_graph_subscriptions")
          .update({
            status: "failed",
            last_error_code: "teams_subscription_failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", rowId),
      );
      throwTeamsError("teams_subscription_failed", "Failed to renew Graph subscription");
    }
  }

  async markRenewalDue(): Promise<number> {
    const soon = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    const { data: rows, error } = await awaitList(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .select("id")
        .eq("status", "active")
        .lt("expiration_at", soon),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to mark renewals due: ${error.message}`,
        500,
      );
    }
    for (const row of rows ?? []) {
      await awaitMutation(
        this.db
          .from("project_intelligence_meeting_graph_subscriptions")
          .update({ status: "renewal_due", updated_at: new Date().toISOString() })
          .eq("id", String(row.id)),
      );
    }
    return (rows ?? []).length;
  }

  async disableSubscription(rowId: string): Promise<void> {
    const { data: current, error: currentError } = await awaitSingle(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .select("*")
        .eq("id", rowId)
        .single(),
    );
    if (currentError || !current) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to read Graph subscription: ${currentError?.message ?? "no row"}`,
        500,
      );
    }
    const graphId = String(current.graph_subscription_id);
    try {
      await this.graph.deleteSubscription(graphId, randomUUID());
    } catch {
      /* best effort */
    }
    await awaitMutation(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .update({
          status: "revoked",
          updated_at: new Date().toISOString(),
        })
        .eq("id", rowId),
    );
  }

  async handleLifecycleNotification(input: {
    subscriptionId: string;
    lifecycleEvent: string;
    correlationId: string;
  }): Promise<void> {
    const { data: rows, error } = await awaitList(
      this.db
        .from("project_intelligence_meeting_graph_subscriptions")
        .select("*")
        .eq("graph_subscription_id", input.subscriptionId)
        .limit(1),
    );
    if (error) {
      throw new MeetingIntelligenceError(
        "meeting_validation_failed",
        `Unable to handle lifecycle notification: ${error.message}`,
        500,
      );
    }
    const row = rows?.[0];
    if (!row) return;
    if (input.lifecycleEvent === "subscriptionRemoved" || input.lifecycleEvent === "missed") {
      await awaitMutation(
        this.db
          .from("project_intelligence_meeting_graph_subscriptions")
          .update({
            status: input.lifecycleEvent === "subscriptionRemoved" ? "deleted" : "failed",
            last_error_code:
              input.lifecycleEvent === "subscriptionRemoved"
                ? "teams_subscription_expired"
                : "teams_subscription_failed",
            updated_at: new Date().toISOString(),
            metadata: {
              ...(typeof row.metadata === "object" && row.metadata ? row.metadata : {}),
              lifecycle: input.lifecycleEvent,
              correlationId: input.correlationId,
            },
          })
          .eq("id", String(row.id)),
      );
    }
  }
}

export function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
