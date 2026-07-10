import type { SupabaseClient } from "@rtb/database";
import type { Tenant, Workspace } from "@rtb/types";

export class TenantService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getTenantsForUser(userId: string): Promise<Tenant[]> {
    const { data: memberships, error: membershipError } = await this.supabase
      .from("tenant_memberships")
      .select("tenant_id")
      .eq("user_id", userId)
      .eq("status", "active");

    if (membershipError) throw new Error(`Failed to fetch memberships: ${membershipError.message}`);
    if (!memberships?.length) return [];

    const tenantIds = memberships.map((m) => m.tenant_id);

    const { data: tenants, error: tenantError } = await this.supabase
      .from("tenants")
      .select("*")
      .in("id", tenantIds);

    if (tenantError) throw new Error(`Failed to fetch tenants: ${tenantError.message}`);
    return (tenants ?? []).map(mapTenant);
  }

  async getWorkspaces(tenantId: string): Promise<Workspace[]> {
    const { data, error } = await this.supabase
      .from("workspaces")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .order("name");

    if (error) throw new Error(`Failed to fetch workspaces: ${error.message}`);
    return (data ?? []).map(mapWorkspace);
  }

  async createTenant(name: string, slug: string, ownerId: string): Promise<Tenant> {
    const { data: tenant, error: tenantError } = await this.supabase
      .from("tenants")
      .insert({ name, slug })
      .select()
      .single();

    if (tenantError) throw new Error(`Failed to create tenant: ${tenantError.message}`);

    const { data: ownerRole } = await this.supabase
      .from("roles")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("slug", "owner")
      .single();

    if (ownerRole) {
      await this.supabase.from("tenant_memberships").insert({
        tenant_id: tenant.id,
        user_id: ownerId,
        role_id: ownerRole.id,
        status: "active",
        joined_at: new Date().toISOString(),
      });
    }

    return mapTenant(tenant);
  }
}

function mapTenant(row: Record<string, unknown>): Tenant {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    status: row.status as Tenant["status"],
    settings: (row.settings as Tenant["settings"]) ?? {},
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapWorkspace(row: Record<string, unknown>): Workspace {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string | undefined,
    type: row.type as Workspace["type"],
    status: row.status as Workspace["status"],
    settings: (row.settings as Workspace["settings"]) ?? {},
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
