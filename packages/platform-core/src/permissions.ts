import type { Permission, PlatformAction, PlatformResource } from "@rtb/types";
import type { SupabaseClient } from "@rtb/database";

export function permissionsFromRole(
  slug: string | null | undefined,
  permissions: Permission[] | null | undefined,
): Permission[] {
  if (slug === "owner") {
    return [{ resource: "tenant" as PlatformResource, action: "admin" as PlatformAction }];
  }
  return permissions ?? [];
}

export class PermissionService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getUserPermissions(userId: string, tenantId: string): Promise<Permission[]> {
    const { data: membership, error: membershipError } = await this.supabase
      .from("tenant_memberships")
      .select("role_id")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .single();

    if (membershipError || !membership) return [];

    const { data: role, error: roleError } = await this.supabase
      .from("roles")
      .select("permissions, slug")
      .eq("id", membership.role_id)
      .single();

    if (roleError || !role) return [];

    return permissionsFromRole(role.slug, role.permissions as unknown as Permission[]);
  }

  hasPermission(
    permissions: Permission[],
    resource: PlatformResource,
    action: PlatformAction
  ): boolean {
    return permissions.some(
      (p) =>
        (p.resource === resource && (p.action === action || p.action === "admin")) ||
        (p.resource === resource && action === "read" && p.action === "read")
    );
  }

  async checkPermission(
    userId: string,
    tenantId: string,
    resource: PlatformResource,
    action: PlatformAction
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, tenantId);
    return this.hasPermission(permissions, resource, action);
  }
}
