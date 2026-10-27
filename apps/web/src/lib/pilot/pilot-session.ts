import { createClient } from "@/lib/supabase/server";

type RoleRow = { slug?: string } | { slug?: string }[] | null;

function roleSlug(value: RoleRow): string {
  const role = Array.isArray(value) ? value[0] : value;
  return role?.slug ?? "member";
}

/** Session context for pilot admin routes. Does not load engineering calculation modules. */
export async function getPilotSession() {
  const supabase = await createClient();
  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;
  if (!user) return null;
  const membershipResult = await supabase
    .from("tenant_memberships")
    .select("tenant_id, roles(slug)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);
  const membership = membershipResult.data?.[0] as { tenant_id?: string; roles?: RoleRow } | undefined;
  if (!membership?.tenant_id) return null;
  const workspaceResult = await supabase
    .from("workspaces")
    .select("id")
    .eq("tenant_id", membership.tenant_id)
    .limit(1);
  const workspace = workspaceResult.data?.[0] as { id?: string } | undefined;
  return {
    userId: user.id,
    tenantId: membership.tenant_id,
    workspaceId: workspace?.id,
    roleSlug: roleSlug(membership.roles ?? null),
    supabase,
  };
}
