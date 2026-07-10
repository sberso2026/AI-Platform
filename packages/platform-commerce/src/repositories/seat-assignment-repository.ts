import type { SupabaseClient } from "@rtb/database";
import type { CommercialSeatAssignment } from "@rtb/types";
import { BaseRepository } from "./base-repository";

export class SeatAssignmentRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async getActiveAssignment(
    tenantId: string,
    seatPoolId: string,
    userId: string
  ): Promise<CommercialSeatAssignment | null> {
    const { data, error } = await this.supabase
      .from("commercial_seat_assignments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("seat_pool_id", seatPoolId)
      .eq("user_id", userId)
      .eq("status", "active")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) this.fail("get seat assignment", error);
    return this.mapMaybeRow<CommercialSeatAssignment>(data);
  }

  async listByPool(tenantId: string, seatPoolId: string): Promise<CommercialSeatAssignment[]> {
    const { data, error } = await this.supabase
      .from("commercial_seat_assignments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("seat_pool_id", seatPoolId)
      .eq("status", "active")
      .is("deleted_at", null);
    if (error) this.fail("list seat assignments", error);
    return this.mapRows<CommercialSeatAssignment>(data);
  }

  async listByUser(tenantId: string, userId: string): Promise<CommercialSeatAssignment[]> {
    const { data, error } = await this.supabase
      .from("commercial_seat_assignments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .eq("status", "active")
      .is("deleted_at", null);
    if (error) this.fail("list user seat assignments", error);
    return this.mapRows<CommercialSeatAssignment>(data);
  }

  async assign(input: {
    tenantId: string;
    seatPoolId: string;
    userId: string;
    workspaceId?: string;
    subscriptionId?: string;
    createdBy?: string;
  }): Promise<CommercialSeatAssignment> {
    const { data, error } = await this.supabase
      .from("commercial_seat_assignments")
      .insert({
        tenant_id: input.tenantId,
        seat_pool_id: input.seatPoolId,
        user_id: input.userId,
        workspace_id: input.workspaceId ?? null,
        subscription_id: input.subscriptionId ?? null,
        status: "active",
        created_by: input.createdBy ?? null,
      })
      .select("*")
      .single();
    if (error) this.fail("assign seat", error);
    return this.mapRow<CommercialSeatAssignment>(data);
  }

  async remove(
    tenantId: string,
    assignmentId: string,
    removedBy?: string
  ): Promise<CommercialSeatAssignment> {
    const { data, error } = await this.supabase
      .from("commercial_seat_assignments")
      .update({
        status: "removed",
        removed_at: new Date().toISOString(),
        updated_by: removedBy ?? null,
      })
      .eq("tenant_id", tenantId)
      .eq("id", assignmentId)
      .select("*")
      .single();
    if (error) this.fail("remove seat assignment", error);
    return this.mapRow<CommercialSeatAssignment>(data);
  }
}
