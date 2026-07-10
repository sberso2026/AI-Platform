import type { SupabaseClient } from "@rtb/database";
import type { CommercialPlan, CommercialPlanPrice } from "@rtb/types";
import { BaseRepository } from "./base-repository";

export class PlanRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listByProduct(productId: string): Promise<CommercialPlan[]> {
    const { data, error } = await this.supabase
      .from("commercial_plans")
      .select("*")
      .eq("product_id", productId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("name");
    if (error) this.fail("list plans", error);
    return this.mapRows<CommercialPlan>(data);
  }

  async listPrices(planId: string): Promise<CommercialPlanPrice[]> {
    const { data, error } = await this.supabase
      .from("commercial_plan_prices")
      .select("*")
      .eq("plan_id", planId)
      .eq("is_active", true)
      .is("deleted_at", null);
    if (error) this.fail("list plan prices", error);
    return this.mapRows<CommercialPlanPrice>(data);
  }
}
