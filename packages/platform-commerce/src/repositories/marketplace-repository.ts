import type { SupabaseClient } from "@rtb/database";
import type { CommercialMarketplaceProduct, CommercialPublisher } from "@rtb/types";
import { BaseRepository } from "./base-repository";

export class MarketplaceRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listPublishers(): Promise<CommercialPublisher[]> {
    const { data, error } = await this.supabase
      .from("commercial_publishers")
      .select("*")
      .is("deleted_at", null)
      .order("name");
    if (error) this.fail("list publishers", error);
    return this.mapRows<CommercialPublisher>(data);
  }

  async listPublishedProducts(): Promise<CommercialMarketplaceProduct[]> {
    const { data, error } = await this.supabase
      .from("commercial_marketplace_products")
      .select("*")
      .eq("listing_status", "published")
      .is("deleted_at", null);
    if (error) this.fail("list marketplace products", error);
    return this.mapRows<CommercialMarketplaceProduct>(data);
  }
}
