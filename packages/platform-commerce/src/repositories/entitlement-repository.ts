import type { SupabaseClient } from "@rtb/database";
import type { CommercialEntitlementOverride, CommercialPlanEntitlement } from "@rtb/types";
import { BaseRepository } from "./base-repository";

export class PlanEntitlementRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listByPlan(planId: string): Promise<CommercialPlanEntitlement[]> {
    const { data, error } = await this.supabase
      .from("commercial_plan_entitlements")
      .select("*")
      .eq("plan_id", planId)
      .is("deleted_at", null);
    if (error) this.fail("list plan entitlements", error);
    return this.mapRows<CommercialPlanEntitlement>(data);
  }
}

export class EntitlementOverrideRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listActive(tenantId: string): Promise<CommercialEntitlementOverride[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("commercial_entitlement_overrides")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("revoked_at", null)
      .lte("valid_from", now)
      .or(`valid_until.is.null,valid_until.gte.${now}`);
    if (error) this.fail("list entitlement overrides", error);
    return this.mapRows<CommercialEntitlementOverride>(data);
  }
}

export class ProductApplicationRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async getProductBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from("commercial_products")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) this.fail("get product by slug", error);
    return data;
  }

  async listApplications(productId: string) {
    const { data, error } = await this.supabase
      .from("commercial_product_applications")
      .select("*")
      .eq("product_id", productId)
      .is("deleted_at", null);
    if (error) this.fail("list product applications", error);
    return data ?? [];
  }

  async getApplicationByKey(applicationKey: string) {
    const { data, error } = await this.supabase
      .from("commercial_product_applications")
      .select("*")
      .eq("application_key", applicationKey)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) this.fail("get application by key", error);
    return data;
  }

  async ensureApplications(
    productId: string,
    applications: Array<{ applicationKey: string; name: string }>,
  ): Promise<{ ensured: string[]; alreadyPresent: string[]; failed: string[] }> {
    const ensured: string[] = [];
    const alreadyPresent: string[] = [];
    const failed: string[] = [];

    for (const application of applications) {
      const existing = await this.getApplicationByKey(application.applicationKey);
      if (existing) {
        alreadyPresent.push(application.applicationKey);
        continue;
      }
      const { error } = await this.supabase.from("commercial_product_applications").upsert(
        {
          product_id: productId,
          application_key: application.applicationKey,
          name: application.name,
        },
        { onConflict: "product_id,application_key" },
      );
      if (error) {
        failed.push(application.applicationKey);
        continue;
      }
      ensured.push(application.applicationKey);
    }

    return { ensured, alreadyPresent, failed };
  }
}
