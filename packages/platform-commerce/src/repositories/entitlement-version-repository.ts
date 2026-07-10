import type { SupabaseClient } from "@rtb/database";
import { BaseRepository } from "./base-repository";

/** Reads/writes commercial_entitlement_versions (types regenerated after migration). */
export class EntitlementVersionRepository extends BaseRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async bumpTenant(tenantId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc(
      "bump_commercial_entitlement_version" as never,
      { p_tenant_id: tenantId } as never
    );

    if (error) {
      this.fail("bump entitlement version", error);
    }

    return Number(data ?? 0);
  }

  async getTenantVersion(tenantId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("commercial_entitlement_versions" as never)
      .select("version")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) {
      this.fail("read entitlement version", error);
    }

    const row = this.mapMaybeRow<{ version: number }>(data);
    return row?.version ?? 0;
  }
}
