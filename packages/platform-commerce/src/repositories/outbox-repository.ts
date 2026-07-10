import type { SupabaseClient } from "@rtb/database";
import { BaseRepository } from "./base-repository";

export interface CommercialOutboxEvent {
  id: string;
  tenant_id: string | null;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  correlation_id: string | null;
  idempotency_key: string | null;
  status: "pending" | "processing" | "processed" | "failed" | "dead_letter";
  retry_count: number;
  last_error: string | null;
  available_at: string;
  processed_at: string | null;
  created_at: string;
}

export class OutboxRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async enqueue(input: {
    tenantId?: string;
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    payload: Record<string, unknown>;
    correlationId?: string;
    idempotencyKey?: string;
  }): Promise<void> {
    const { error } = await this.supabase.from("commercial_outbox_events").insert({
      tenant_id: input.tenantId ?? null,
      aggregate_type: input.aggregateType,
      aggregate_id: input.aggregateId,
      event_type: input.eventType,
      payload: input.payload,
      correlation_id: input.correlationId ?? null,
      idempotency_key: input.idempotencyKey ?? null,
      status: "pending",
    });
    if (error) this.fail("enqueue outbox event", error);
  }

  async claimPending(limit: number): Promise<CommercialOutboxEvent[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("commercial_outbox_events")
      .select("*")
      .eq("status", "pending")
      .lte("available_at", now)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) this.fail("claim pending outbox events", error);

    const claimed: CommercialOutboxEvent[] = [];
    for (const row of this.mapRows<CommercialOutboxEvent>(data)) {
      const locked = await this.markProcessing(row.id);
      if (locked) claimed.push(locked);
    }
    return claimed;
  }

  async markProcessing(id: string): Promise<CommercialOutboxEvent | null> {
    const { data, error } = await this.supabase
      .from("commercial_outbox_events")
      .update({ status: "processing" })
      .eq("id", id)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();
    if (error) this.fail("mark outbox processing", error);
    return this.mapMaybeRow<CommercialOutboxEvent>(data);
  }

  async markProcessed(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("commercial_outbox_events")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", id)
      .eq("status", "processing");
    if (error) this.fail("mark outbox processed", error);
  }

  async markFailed(id: string, errorMessage: string, retryCount: number): Promise<void> {
    const backoffMs = Math.min(60_000, 1_000 * 2 ** Math.max(0, retryCount - 1));
    const availableAt = new Date(Date.now() + backoffMs).toISOString();
    const { error } = await this.supabase
      .from("commercial_outbox_events")
      .update({
        status: "pending",
        retry_count: retryCount,
        last_error: errorMessage,
        available_at: availableAt,
      })
      .eq("id", id)
      .eq("status", "processing");
    if (error) this.fail("mark outbox failed", error);
  }

  async moveToDeadLetter(id: string, errorMessage: string): Promise<void> {
    const { error } = await this.supabase
      .from("commercial_outbox_events")
      .update({
        status: "dead_letter",
        last_error: errorMessage,
        processed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .in("status", ["processing", "pending", "failed"]);
    if (error) this.fail("move outbox to dead letter", error);
  }

  async listByTenant(
    tenantId: string,
    options?: { aggregateType?: string; eventTypePrefix?: string; limit?: number }
  ): Promise<CommercialOutboxEvent[]> {
    let query = this.supabase
      .from("commercial_outbox_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(options?.limit ?? 100);

    if (options?.aggregateType) {
      query = query.eq("aggregate_type", options.aggregateType);
    }
    if (options?.eventTypePrefix) {
      query = query.like("event_type", `${options.eventTypePrefix}%`);
    }

    const { data, error } = await query;
    if (error) this.fail("list outbox events by tenant", error);
    return this.mapRows<CommercialOutboxEvent>(data);
  }
}
