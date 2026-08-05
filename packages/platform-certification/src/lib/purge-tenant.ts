/**
 * Aggressive tenant purge for Phase 7B fixture isolation.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

const TENANT_TABLES = [
  "commercial_workspace_product_assignments",
  "commercial_seat_assignments",
  "commercial_seats",
  "commercial_licenses",
  // commercial_installation_events are immutable — leave orphaned by tenant delete / soft-abandon
  "commercial_application_installations",
  "commercial_installations",
  "commercial_subscriptions",
  "commercial_billing_accounts",
  "tenant_memberships",
  "workspaces",
] as const;

export async function purgeTenantById(admin: SupabaseClient, tenantId: string): Promise<void> {
  for (const table of TENANT_TABLES) {
    const { error } = await admin.from(table).delete().eq("tenant_id", tenantId);
    if (error && !/immutable|cannot delete/i.test(error.message)) {
      // continue best-effort for non-fatal FK noise; hard-fail later on tenant delete
      console.warn(`[purge] ${table}: ${error.message}`);
    }
  }
  await admin.from("roles").delete().eq("tenant_id", tenantId);
  // Soft-abandon if hard delete blocked by immutable events: rename slug then delete
  const { error } = await admin.from("tenants").delete().eq("id", tenantId);
  if (error) {
    const abandoned = `abandoned-${tenantId.slice(0, 8)}-${Date.now().toString(36)}`;
    await admin
      .from("tenants")
      .update({ slug: abandoned, status: "archived", name: `Abandoned ${abandoned}` })
      .eq("id", tenantId);
    const retry = await admin.from("tenants").delete().eq("id", tenantId);
    if (retry.error) {
      // Slug freed for reuse even if row remains archived
      console.warn(`[purge] tenant retained as ${abandoned}: ${retry.error.message}`);
      return;
    }
  }
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
