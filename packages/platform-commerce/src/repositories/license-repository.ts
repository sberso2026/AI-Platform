import type { SupabaseClient } from "@rtb/database";
import type { CommercialLicense, LicenseStatus } from "@rtb/types";
import { BaseRepository } from "./base-repository";

export class LicenseRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listByTenant(tenantId: string): Promise<CommercialLicense[]> {
    const { data, error } = await this.supabase
      .from("commercial_licenses")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) this.fail("list licenses", error);
    return this.mapRows<CommercialLicense>(data);
  }

  async listByProduct(tenantId: string, productId: string): Promise<CommercialLicense[]> {
    const { data, error } = await this.supabase
      .from("commercial_licenses")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("product_id", productId)
      .is("deleted_at", null);
    if (error) this.fail("list product licenses", error);
    return this.mapRows<CommercialLicense>(data);
  }

  async create(input: {
    tenantId: string;
    productId?: string;
    applicationKey?: string;
    subscriptionId?: string;
    licenseType?: string;
    featureKey?: string;
    maxSeats?: number;
    workspaceId?: string;
    createdBy?: string;
  }): Promise<CommercialLicense> {
    const { data, error } = await this.supabase
      .from("commercial_licenses")
      .insert({
        tenant_id: input.tenantId,
        product_id: input.productId ?? null,
        application_key: input.applicationKey ?? null,
        feature_key: input.featureKey ?? null,
        workspace_id: input.workspaceId ?? null,
        subscription_id: input.subscriptionId ?? null,
        license_type: input.licenseType ?? "product",
        status: "active",
        max_seats: input.maxSeats ?? null,
        activated_at: new Date().toISOString(),
        issued_at: new Date().toISOString(),
        valid_from: new Date().toISOString(),
        created_by: input.createdBy ?? null,
        issued_by: input.createdBy ?? null,
      })
      .select("*")
      .single();
    if (error) this.fail("create license", error);
    return this.mapRow<CommercialLicense>(data);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: LicenseStatus
  ): Promise<CommercialLicense> {
    const { data, error } = await this.supabase
      .from("commercial_licenses")
      .update({ status })
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select("*")
      .single();
    if (error) this.fail("update license status", error);
    return this.mapRow<CommercialLicense>(data);
  }

  async listDueForExpiry(now: string, limit: number): Promise<CommercialLicense[]> {
    const { data, error } = await this.supabase
      .from("commercial_licenses")
      .select("*")
      .in("status", ["active", "expiring_soon"])
      .is("deleted_at", null)
      .not("valid_until", "is", null)
      .lte("valid_until", now)
      .order("valid_until", { ascending: true })
      .limit(limit);
    if (error) this.fail("list licences due for expiry", error);
    return this.mapRows<CommercialLicense>(data);
  }

  async listExpiringWithin(withinDays: number, limit: number): Promise<CommercialLicense[]> {
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + withinDays);
    const nowIso = now.toISOString();
    const deadlineIso = deadline.toISOString();

    const { data, error } = await this.supabase
      .from("commercial_licenses")
      .select("*")
      .in("status", ["active", "expiring_soon"])
      .is("deleted_at", null)
      .not("valid_until", "is", null)
      .gte("valid_until", nowIso)
      .lte("valid_until", deadlineIso)
      .order("valid_until", { ascending: true })
      .limit(limit);
    if (error) this.fail("list expiring licences", error);
    return this.mapRows<CommercialLicense>(data);
  }

  async transitionToExpired(tenantId: string, id: string): Promise<CommercialLicense | null> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("commercial_licenses")
      .update({
        status: "expired",
        deactivated_at: now,
      })
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .in("status", ["active", "expiring_soon"])
      .select("*")
      .maybeSingle();
    if (error) this.fail("transition licence to expired", error);
    return this.mapMaybeRow<CommercialLicense>(data);
  }
}
