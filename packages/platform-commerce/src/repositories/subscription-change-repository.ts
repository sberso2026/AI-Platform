import type { SupabaseClient } from "@rtb/database";
import type { CommercialSubscriptionChange } from "@rtb/types";
import { BaseRepository } from "./base-repository";

export class SubscriptionChangeRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async getById(tenantId: string, id: string): Promise<CommercialSubscriptionChange | null> {
    const { data, error } = await this.supabase
      .from("commercial_subscription_changes")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();
    if (error) this.fail("get subscription change", error);
    return this.mapMaybeRow<CommercialSubscriptionChange>(data);
  }

  async getPending(tenantId: string, subscriptionId: string): Promise<CommercialSubscriptionChange | null> {
    const { data, error } = await this.supabase
      .from("commercial_subscription_changes")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("subscription_id", subscriptionId)
      .in("status", ["pending", "scheduled"])
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) this.fail("get pending subscription change", error);
    return this.mapMaybeRow<CommercialSubscriptionChange>(data);
  }

  async create(input: {
    tenantId: string;
    subscriptionId: string;
    currentPlanId?: string;
    targetPlanId: string;
    changeType: CommercialSubscriptionChange["change_type"];
    effectiveAt: string;
    requestedBy?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  }): Promise<CommercialSubscriptionChange> {
    const { data, error } = await this.supabase
      .from("commercial_subscription_changes")
      .insert({
        tenant_id: input.tenantId,
        subscription_id: input.subscriptionId,
        current_plan_id: input.currentPlanId ?? null,
        target_plan_id: input.targetPlanId,
        change_type: input.changeType,
        status: "pending",
        requested_by: input.requestedBy ?? null,
        effective_at: input.effectiveAt,
        reason: input.reason ?? null,
        metadata: input.metadata ?? {},
      })
      .select("*")
      .single();
    if (error) this.fail("create subscription change", error);
    return this.mapRow<CommercialSubscriptionChange>(data);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: CommercialSubscriptionChange["status"],
    patch: Record<string, unknown> = {}
  ): Promise<CommercialSubscriptionChange> {
    const { data, error } = await this.supabase
      .from("commercial_subscription_changes")
      .update({ status, ...patch })
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select("*")
      .single();
    if (error) this.fail("update subscription change", error);
    return this.mapRow<CommercialSubscriptionChange>(data);
  }

  async listScheduledDue(before: string): Promise<CommercialSubscriptionChange[]> {
    const { data, error } = await this.supabase
      .from("commercial_subscription_changes")
      .select("*")
      .eq("status", "scheduled")
      .lte("effective_at", before);
    if (error) this.fail("list scheduled changes", error);
    return this.mapRows<CommercialSubscriptionChange>(data);
  }
}
