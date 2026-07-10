import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { PermissionService, resolveNavTier } from "@rtb/platform-core";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const permissionService = new PermissionService(ctx.supabase);

  return NextResponse.json({
    data: {
      roleSlug: ctx.roleSlug,
      tier: resolveNavTier(ctx.roleSlug),
      showAdvancedPlatformTools: ctx.showAdvancedPlatformTools,
      permissions: ctx.permissions,
    },
  });
}
