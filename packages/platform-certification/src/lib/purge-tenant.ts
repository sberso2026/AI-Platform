/**
 * Aggressive tenant purge for Phase 7B fixture isolation.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

const TENANT_TABLES = [
  "commercial_workspace_product_assignments",
  "commercial_seat_assignments",
  "commercial_seats",
  "commercial_licenses",
  "commercial_installation_events",
  "commercial_application_installations",
  "commercial_installations",
  "commercial_subscriptions",
  "commercial_billing_accounts",
  "tenant_memberships",
  "workspaces",
] as const;

export async function purgeTenantById(admin: SupabaseClient, tenantId: string): Promise<void> {
  for (const table of TENANT_TABLES) {
    await admin.from(table).delete().eq("tenant_id", tenantId);
  }
  // roles may be tenant-scoped
  await admin.from("roles").delete().eq("tenant_id", tenantId);
  const { error } = await admin.from("tenants").delete().eq("id", tenantId);
  if (error) throw new Error(`tenant purge failed ${tenantId}: ${error.message}`);
}

export async function purgeTenantsBySlug(admin: SupabaseClient, slug: string): Promise<string[]> {
  const { data } = await admin.from("tenants").select("id,slug").eq("slug", slug);
  const purged: string[] = [];
  for (const row of data ?? []) {
    const { data: memberships } = await admin
      .from("tenant_memberships")
      .select("user_id")
      .eq("tenant_id", row.id);
    await purgeTenantById(admin, row.id as string);
    for (const m of memberships ?? []) {
      await admin.auth.admin.deleteUser(m.user_id as string).catch(() => undefined);
    }
    purged.push(row.slug as string);
  }
  return purged;
}
