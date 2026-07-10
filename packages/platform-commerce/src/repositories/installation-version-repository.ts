import type { SupabaseClient } from "@rtb/database";
import { BaseRepository } from "./base-repository";

export class InstallationVersionRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async bumpTenant(tenantId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc("bump_commercial_installation_version", {
      p_tenant_id: tenantId,
    });
    if (error) this.fail("bump installation version", error);
    return Number(data ?? 1);
  }

  async getTenantVersion(tenantId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("commercial_installation_versions")
      .select("version")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error) this.fail("get installation version", error);
    return Number(data?.version ?? 0);
  }
}
