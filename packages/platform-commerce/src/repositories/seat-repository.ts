import type { SupabaseClient } from "@rtb/database";
import type { CommercialSeatPool } from "@rtb/types";
import { BaseRepository } from "./base-repository";

export class SeatRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listByTenant(tenantId: string): Promise<CommercialSeatPool[]> {
    const { data, error } = await this.supabase
      .from("commercial_seats")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null);
    if (error) this.fail("list seat pools", error);
    return this.mapRows<CommercialSeatPool>(data);
  }

  async getByProduct(tenantId: string, productId: string): Promise<CommercialSeatPool | null> {
    const { data, error } = await this.supabase
      .from("commercial_seats")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("product_id", productId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) this.fail("get seat pool", error);
    return this.mapMaybeRow<CommercialSeatPool>(data);
  }

  async upsertPool(input: {
    tenantId: string;
    productId: string;
    subscriptionId?: string;
    totalSeats: number;
    assignedSeats?: number;
    createdBy?: string;
  }): Promise<CommercialSeatPool> {
    const existing = await this.getByProduct(input.tenantId, input.productId);
    if (existing) {
      const { data, error } = await this.supabase
        .from("commercial_seats")
        .update({
          total_seats: input.totalSeats,
          assigned_seats: input.assignedSeats ?? existing.assigned_seats,
          subscription_id: input.subscriptionId ?? existing.subscription_id,
          updated_by: input.createdBy ?? null,
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) this.fail("update seat pool", error);
      return this.mapRow<CommercialSeatPool>(data);
    }

    const { data, error } = await this.supabase
      .from("commercial_seats")
      .insert({
        tenant_id: input.tenantId,
        product_id: input.productId,
        subscription_id: input.subscriptionId ?? null,
        total_seats: input.totalSeats,
        assigned_seats: input.assignedSeats ?? 0,
        created_by: input.createdBy ?? null,
      })
      .select("*")
      .single();
    if (error) this.fail("create seat pool", error);
    return this.mapRow<CommercialSeatPool>(data);
  }
}
