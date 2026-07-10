import { createClient } from "@/lib/supabase/server";
import { createPlatformKernel } from "@rtb/platform-kernel";
import { createEngineeringOS } from "@rtb/engineering-os";
import { createPlatformCommerce } from "@rtb/platform-commerce";
import { PermissionService } from "@rtb/platform-core";
import type { Permission } from "@rtb/types";
import type { TenantSettings } from "@rtb/types";

export async function getKernel() {
  const supabase = await createClient();
  return { supabase, kernel: createPlatformKernel(supabase) };
}

export interface AuthContext {
  userId: string;
  tenantId: string;
  workspaceId: string | undefined;
  roleSlug: string;
  permissions: Permission[];
  showAdvancedPlatformTools: boolean;
  supabase: Awaited<ReturnType<typeof createClient>>;
  kernel: ReturnType<typeof createPlatformKernel>;
  engineering: ReturnType<typeof createEngineeringOS>;
  commerce: ReturnType<typeof createPlatformCommerce>;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("tenant_memberships")
    .select("tenant_id, role_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!membership) return null;

  const [{ data: workspace }, { data: role }, { data: tenant }] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id")
      .eq("tenant_id", membership.tenant_id)
      .eq("status", "active")
      .limit(1)
      .single(),
    supabase.from("roles").select("slug").eq("id", membership.role_id).single(),
    supabase.from("tenants").select("settings").eq("id", membership.tenant_id).single(),
  ]);

  const kernel = createPlatformKernel(supabase);
  const engineering = createEngineeringOS(supabase, kernel);
  const commerce = createPlatformCommerce(supabase);
  const permissionService = new PermissionService(supabase);
  const permissions = await permissionService.getUserPermissions(
    user.id,
    membership.tenant_id
  );

  const settings = (tenant?.settings ?? {}) as TenantSettings;

  return {
    userId: user.id,
    tenantId: membership.tenant_id as string,
    workspaceId: workspace?.id as string | undefined,
    roleSlug: (role?.slug as string) ?? "member",
    permissions,
    showAdvancedPlatformTools: settings.showAdvancedPlatformTools === true,
    supabase,
    kernel,
    engineering,
    commerce,
  };
}
