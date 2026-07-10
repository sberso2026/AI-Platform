import type { SupabaseClient } from "@rtb/database";
import type { CommercialBillingAccount, CommercialInvoice } from "@rtb/types";
import { BaseRepository } from "./base-repository";

export class BillingRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async listAccounts(tenantId: string): Promise<CommercialBillingAccount[]> {
    const { data, error } = await this.supabase
      .from("commercial_billing_accounts")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null);
    if (error) this.fail("list billing accounts", error);
    return this.mapRows<CommercialBillingAccount>(data);
  }

  async listInvoices(tenantId: string): Promise<CommercialInvoice[]> {
    const { data, error } = await this.supabase
      .from("commercial_invoices")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) this.fail("list invoices", error);
    return this.mapRows<CommercialInvoice>(data);
  }
}
