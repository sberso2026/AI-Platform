import { z } from "zod";
import type { Json, SupabaseClient } from "@rtb/database";
import type { EventSubscriber, PlatformEvent } from "@rtb/types";

const eventPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  eventType: z.string().min(1),
  source: z.string().default("platform"),
  payload: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
  correlationId: z.string().uuid().optional(),
  causationId: z.string().uuid().optional(),
});

export type PublishEventInput = {
  tenantId: string;
  workspaceId?: string;
  eventType: string;
  source?: string;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
};

export class EventBusService {
  private subscribers: EventSubscriber[] = [];

  constructor(private readonly supabase: SupabaseClient) {}

  registerSubscriber(subscriber: EventSubscriber): void {
    this.subscribers.push(subscriber);
  }

  async publish(input: PublishEventInput): Promise<PlatformEvent> {
    const validated = eventPayloadSchema.parse(input);

    const { data: event, error } = await this.supabase
      .from("events")
      .insert({
        tenant_id: validated.tenantId,
        workspace_id: validated.workspaceId ?? null,
        event_type: validated.eventType,
        source: validated.source,
        payload: validated.payload as Json,
        metadata: validated.metadata as Json,
        correlation_id: validated.correlationId ?? null,
        causation_id: validated.causationId ?? null,
        status: "published",
      })
      .select()
      .single();

    if (error || !event) throw new Error(`Failed to publish event: ${error?.message}`);

    const mapped = mapEvent(event);
    await this.dispatch(mapped);
    return mapped;
  }

  async dispatch(event: PlatformEvent): Promise<void> {
    const matching = this.subscribers.filter((s) => s.eventType === event.event_type);

    const { data: subscriptions } = await this.supabase
      .from("event_subscriptions")
      .select("*")
      .eq("tenant_id", event.tenant_id)
      .eq("event_type", event.event_type)
      .eq("is_active", true);

    for (const subscriber of matching) {
      await this.attemptDispatch(event, null, async () => subscriber.handle(event));
    }

    for (const sub of subscriptions ?? []) {
      const subRow = sub as Record<string, unknown>;
      await this.attemptDispatch(event, subRow.id as string, async () => {
        if (subRow.subscriber_type === "notification") {
          // Handled by notification subscriber registered externally
        }
      });
    }
  }

  async replay(tenantId: string, eventIds: string[]): Promise<PlatformEvent[]> {
    const { data, error } = await this.supabase
      .from("events")
      .select("*")
      .eq("tenant_id", tenantId)
      .in("id", eventIds);

    if (error) throw new Error(`Failed to replay events: ${error.message}`);

    const events = (data ?? []).map(mapEvent);
    for (const event of events) {
      await this.dispatch(event);
    }
    return events;
  }

  async list(tenantId: string, limit = 50): Promise<PlatformEvent[]> {
    const { data, error } = await this.supabase
      .from("events")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list events: ${error.message}`);
    return (data ?? []).map(mapEvent);
  }

  private async attemptDispatch(
    event: PlatformEvent,
    subscriptionId: string | null,
    handler: () => Promise<void>
  ): Promise<void> {
    try {
      await handler();
      await this.supabase.from("event_dispatch_attempts").insert({
        event_id: event.id,
        subscription_id: subscriptionId,
        status: "success",
        attempt_number: 1,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Dispatch failed";
      await this.supabase.from("event_dispatch_attempts").insert({
        event_id: event.id,
        subscription_id: subscriptionId,
        status: "failed",
        attempt_number: 1,
        error_message: errorMessage,
      });
    }
  }
}

function mapEvent(row: Record<string, unknown>): PlatformEvent {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    workspace_id: row.workspace_id as string | undefined,
    event_type: row.event_type as string,
    source: row.source as string,
    payload: (row.payload as Record<string, unknown>) ?? {},
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    correlation_id: row.correlation_id as string | undefined,
    causation_id: row.causation_id as string | undefined,
    status: row.status as PlatformEvent["status"],
    created_at: row.created_at as string,
  };
}
