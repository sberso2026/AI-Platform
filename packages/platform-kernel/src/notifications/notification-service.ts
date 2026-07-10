import type { Json, SupabaseClient } from "@rtb/database";
import type { Notification, NotificationType } from "@rtb/types";
import type { EventBusService } from "../event-bus";

export class NotificationService {
  constructor(
    private readonly supabase: SupabaseClient,
    eventBus?: EventBusService
  ) {
    if (eventBus) {
      eventBus.registerSubscriber({
        eventType: "review.required",
        handle: async (event) => this.fromEvent(event, "review.required", "Review Required", "An item requires your review"),
      });
      eventBus.registerSubscriber({
        eventType: "agent.run.completed",
        handle: async (event) => this.fromEvent(event, "agent.completed", "Agent Completed", "An AI agent run has completed"),
      });
      eventBus.registerSubscriber({
        eventType: "workflow.failed",
        handle: async (event) => this.fromEvent(event, "workflow.failed", "Workflow Failed", "A workflow has failed"),
      });
    }
  }

  async create(input: {
    tenantId: string;
    userId: string;
    type: NotificationType | string;
    title: string;
    body?: string;
    priority?: Notification["priority"];
    linkTarget?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    const { data, error } = await this.supabase
      .from("notifications")
      .insert({
        tenant_id: input.tenantId,
        user_id: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        priority: input.priority ?? "normal",
        link_target: input.linkTarget ?? null,
        metadata: (input.metadata ?? {}) as Json,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create notification: ${error?.message}`);

    await this.supabase.from("notification_deliveries").insert({
      notification_id: data.id,
      channel: "in_app",
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    return mapNotification(data);
  }

  async listForUser(userId: string, unreadOnly = false): Promise<Notification[]> {
    let query = this.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (unreadOnly) query = query.eq("is_read", false);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list notifications: ${error.message}`);
    return (data ?? []).map(mapNotification);
  }

  async markRead(notificationId: string): Promise<void> {
    await this.supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId);
  }

  private async fromEvent(
    event: { tenant_id: string; payload: Record<string, unknown> },
    type: string,
    title: string,
    body: string
  ) {
    const userId = event.payload.user_id as string | undefined;
    if (!userId) return;

    await this.create({
      tenantId: event.tenant_id,
      userId,
      type,
      title,
      body,
      linkTarget: event.payload.run_id
        ? `/platform/agent-runs?id=${event.payload.run_id}`
        : undefined,
      metadata: event.payload,
    });
  }
}

function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    user_id: row.user_id as string,
    type: row.type as string,
    title: row.title as string,
    body: row.body as string | undefined,
    priority: row.priority as Notification["priority"],
    link_target: row.link_target as string | undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    is_read: row.is_read as boolean,
    read_at: row.read_at as string | undefined,
    created_at: row.created_at as string,
  };
}
