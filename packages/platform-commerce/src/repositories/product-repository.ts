import type { SupabaseClient } from "@rtb/database";
import type { CommercialProduct, ProductLifecycleStatus } from "@rtb/types";
import { BaseRepository } from "./base-repository";

export class ProductRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listCatalog(options?: {
    lifecycleStatus?: ProductLifecycleStatus[];
    marketplaceOnly?: boolean;
  }): Promise<CommercialProduct[]> {
    let query = this.supabase
      .from("commercial_products")
      .select("*")
      .is("deleted_at", null)
      .is("tenant_id", null)
      .order("name");

    if (options?.lifecycleStatus?.length) {
      query = query.in("lifecycle_status", options.lifecycleStatus);
    }
    if (options?.marketplaceOnly) {
      query = query.eq("marketplace_visible", true);
    }

    const { data, error } = await query;
    if (error) this.fail("list catalog products", error);
    return this.mapRows<CommercialProduct>(data);
  }

  async getBySlug(slug: string): Promise<CommercialProduct | null> {
    const { data, error } = await this.supabase
      .from("commercial_products")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .is("tenant_id", null)
      .maybeSingle();
    if (error) this.fail("get product by slug", error);
    return this.mapMaybeRow<CommercialProduct>(data);
  }

  async getById(id: string): Promise<CommercialProduct | null> {
    const { data, error } = await this.supabase
      .from("commercial_products")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) this.fail("get product by id", error);
    return this.mapMaybeRow<CommercialProduct>(data);
  }
}
