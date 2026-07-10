import type { SupabaseClient } from "@rtb/database";
import type {
  CommercialSubscription,
  CommercialSubscriptionEvent,
  CreateSubscriptionInput,
  SubscriptionStatus,
  TransitionSubscriptionInput,
} from "@rtb/types";
import { BaseRepository } from "./base-repository";

function normalizeStatus(status: SubscriptionStatus): SubscriptionStatus {
  return status === "trial" ? "trialing" : status;
}

export class SubscriptionRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listByTenant(tenantId: string): Promise<CommercialSubscription[]> {
    const { data, error } = await this.supabase
      .from("commercial_subscriptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) this.fail("list subscriptions", error);
    return this.mapRows<CommercialSubscription>(data).map((s) => ({
      ...s,
      status: normalizeStatus(s.status),
    }));
  }

  async getById(tenantId: string, id: string): Promise<CommercialSubscription | null> {
    const { data, error } = await this.supabase
      .from("commercial_subscriptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) this.fail("get subscription", error);
    const row = this.mapMaybeRow<CommercialSubscription>(data);
    return row ? { ...row, status: normalizeStatus(row.status) } : null;
  }

  async findActiveByProduct(
    tenantId: string,
    productId: string
  ): Promise<CommercialSubscription | null> {
    const { data, error } = await this.supabase
      .from("commercial_subscriptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("product_id", productId)
      .in("status", ["trialing", "trial", "active", "grace_period", "scheduled_cancellation"])
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) this.fail("find active subscription", error);
    const row = this.mapMaybeRow<CommercialSubscription>(data);
    return row ? { ...row, status: normalizeStatus(row.status) } : null;
  }

  async create(input: CreateSubscriptionInput): Promise<CommercialSubscription> {
    const status = normalizeStatus(input.status ?? "draft");
    const { data, error } = await this.supabase
      .from("commercial_subscriptions")
      .insert({
        tenant_id: input.tenantId,
        product_id: input.productId,
        plan_id: input.planId ?? null,
        workspace_id: input.workspaceId ?? null,
        status,
        quantity: input.quantity ?? 1,
        created_by: input.createdBy ?? null,
        plan_snapshot_json: input.metadata ?? {},
      })
      .select("*")
      .single();
    if (error) this.fail("create subscription", error);
    return { ...this.mapRow<CommercialSubscription>(data), status };
  }

  async transition(
    input: TransitionSubscriptionInput,
    patch: Record<string, unknown> = {}
  ): Promise<CommercialSubscription> {
    const targetStatus = normalizeStatus(input.targetStatus);
    const { data, error } = await this.supabase
      .from("commercial_subscriptions")
      .update({
        status: targetStatus,
        updated_by: input.actorUserId ?? null,
        ...patch,
      })
      .eq("tenant_id", input.tenantId)
      .eq("id", input.subscriptionId)
      .select("*")
      .single();
    if (error) this.fail("transition subscription", error);
    return { ...this.mapRow<CommercialSubscription>(data), status: targetStatus };
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: SubscriptionStatus,
    updatedBy?: string
  ): Promise<CommercialSubscription> {
    return this.transition({
      tenantId,
      subscriptionId: id,
      targetStatus: status,
      actorUserId: updatedBy,
    });
  }

  async listTrialingPastEnd(now: string, limit: number): Promise<CommercialSubscription[]> {
    const { data, error } = await this.supabase
      .from("commercial_subscriptions")
      .select("*")
      .in("status", ["trialing", "trial"])
      .is("deleted_at", null)
      .or(`trial_end.lte.${now},trial_ends_at.lte.${now}`)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) this.fail("list trialing past end", error);
    return this.mapRows<CommercialSubscription>(data)
      .map((s) => ({ ...s, status: normalizeStatus(s.status) }))
      .filter((s) => {
        const end = s.trial_end ?? s.trial_ends_at;
        return Boolean(end && end <= now);
      });
  }

  async listScheduledCancellationsDue(
    now: string,
    limit: number
  ): Promise<CommercialSubscription[]> {
    const { data, error } = await this.supabase
      .from("commercial_subscriptions")
      .select("*")
      .eq("status", "scheduled_cancellation")
      .is("deleted_at", null)
      .lte("cancellation_effective_at", now)
      .order("cancellation_effective_at", { ascending: true })
      .limit(limit);
    if (error) this.fail("list scheduled cancellations due", error);
    return this.mapRows<CommercialSubscription>(data).map((s) => ({
      ...s,
      status: normalizeStatus(s.status),
    }));
  }

  async listGracePeriodExpired(now: string, limit: number): Promise<CommercialSubscription[]> {
    const { data, error } = await this.supabase
      .from("commercial_subscriptions")
      .select("*")
      .eq("status", "grace_period")
      .is("deleted_at", null)
      .lte("grace_period_end", now)
      .order("grace_period_end", { ascending: true })
      .limit(limit);
    if (error) this.fail("list grace period expired", error);
    return this.mapRows<CommercialSubscription>(data).map((s) => ({
      ...s,
      status: normalizeStatus(s.status),
    }));
  }

  async listExpiringSubscriptions(
    withinDays: number,
    limit: number
  ): Promise<CommercialSubscription[]> {
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + withinDays);
    const nowIso = now.toISOString();
    const deadlineIso = deadline.toISOString();

    const { data, error } = await this.supabase
      .from("commercial_subscriptions")
      .select("*")
      .is("deleted_at", null)
      .in("status", ["trialing", "trial", "active", "scheduled_cancellation"])
      .or(
        [
          `and(status.in.(trialing,trial),trial_end.gte.${nowIso},trial_end.lte.${deadlineIso})`,
          `and(status.in.(trialing,trial),trial_ends_at.gte.${nowIso},trial_ends_at.lte.${deadlineIso})`,
          `and(status.eq.active,current_period_end.gte.${nowIso},current_period_end.lte.${deadlineIso})`,
        ].join(",")
      )
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) this.fail("list expiring subscriptions", error);
    return this.mapRows<CommercialSubscription>(data).map((s) => ({
      ...s,
      status: normalizeStatus(s.status),
    }));
  }

  async recordEvent(
    tenantId: string,
    subscriptionId: string,
    eventType: string,
    fromStatus: string | null,
    toStatus: string | null,
    payload: Record<string, unknown>,
    options?: {
      actorUserId?: string;
      actorType?: string;
      source?: string;
      reason?: string;
      correlationId?: string;
      idempotencyKey?: string;
      workspaceId?: string;
      effectiveAt?: string;
    }
  ): Promise<void> {
    const { error } = await this.supabase.from("commercial_subscription_events").insert({
      tenant_id: tenantId,
      subscription_id: subscriptionId,
      workspace_id: options?.workspaceId ?? null,
      event_type: eventType,
      from_status: fromStatus,
      to_status: toStatus,
      previous_status: fromStatus,
      new_status: toStatus,
      payload,
      event_payload: payload,
      actor_user_id: options?.actorUserId ?? null,
      actor_type: options?.actorType ?? "user",
      source: options?.source ?? "system",
      reason: options?.reason ?? null,
      correlation_id: options?.correlationId ?? null,
      idempotency_key: options?.idempotencyKey ?? null,
      effective_at: options?.effectiveAt ?? new Date().toISOString(),
    });
    if (error) this.fail("record subscription event", error);
  }

  async listEventsByTenant(tenantId: string, limit = 100): Promise<CommercialSubscriptionEvent[]> {
    const { data, error } = await this.supabase
      .from("commercial_subscription_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) this.fail("list subscription events", error);
    return this.mapRows<CommercialSubscriptionEvent>(data);
  }
}
