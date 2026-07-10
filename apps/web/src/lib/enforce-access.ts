import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/kernel";
import {
  PermissionService,
  canAccessPlatformRoute,
  resolveNavTier,
} from "@rtb/platform-core";

export async function enforcePlatformAccess(pathname: string) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  const allowed = canAccessPlatformRoute(pathname, {
    roleSlug: ctx.roleSlug,
    tier: resolveNavTier(ctx.roleSlug),
  });

  if (!allowed) redirect("/engineering");
}
