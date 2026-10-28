import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { boundActorContextClient, resolveRequestActorContext } from "@/lib/identity/canonical-context";

/** Session context for pilot admin routes. Authority is the active workspace membership. */
export async function getPilotSession() {
  const supabase = await createClient();
  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;
  if (!user) return null;
  const headerStore = await headers();
  const cookieStore = await cookies();
  const resolved = await resolveRequestActorContext({
    supabase: boundActorContextClient(supabase),
    userId: user.id,
    header: (name) => headerStore.get(name),
    cookie: (name) => cookieStore.get(name)?.value,
  });
  if (!resolved.ok) return null;
  return {
    userId: user.id,
    tenantId: resolved.tenantId,
    workspaceId: resolved.workspaceId,
    roleSlug: resolved.roleSlug,
    supabase,
  };
}
