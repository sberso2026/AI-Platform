import type { SupabaseClient } from "@rtb/database";
import type { PlatformContext, PlatformUser, Tenant, Workspace } from "@rtb/types";
import { PermissionService } from "./permissions";

export class AuthService {
  private readonly permissions: PermissionService;

  constructor(private readonly supabase: SupabaseClient) {
    this.permissions = new PermissionService(supabase);
  }

  async getSession(): Promise<Awaited<ReturnType<SupabaseClient["auth"]["getSession"]>>["data"]["session"]> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw new Error(`Session error: ${error.message}`);
    return session;
  }

  async getCurrentUser(): Promise<PlatformUser | null> {
    const session = await this.getSession();
    if (!session?.user) return null;

    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name ?? undefined,
      avatar_url: data.avatar_url ?? undefined,
      status: data.status as PlatformUser["status"],
      metadata: (data.metadata as PlatformUser["metadata"]) ?? {},
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  async getPlatformContext(
    tenantId: string,
    workspaceId?: string
  ): Promise<PlatformContext | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data: tenant, error: tenantError } = await this.supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .single();

    if (tenantError || !tenant) return null;

    let workspace: Workspace;
    if (workspaceId) {
      const { data: ws, error: wsError } = await this.supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .eq("tenant_id", tenantId)
        .single();

      if (wsError || !ws) return null;
      workspace = mapWorkspace(ws);
    } else {
      const { data: workspaces } = await this.supabase
        .from("workspaces")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .order("created_at")
        .limit(1);

      if (!workspaces?.length) return null;
      workspace = mapWorkspace(workspaces[0]);
    }

    const permissions = await this.permissions.getUserPermissions(user.id, tenantId);

    return {
      user,
      tenant: mapTenant(tenant),
      workspace,
      permissions,
      operating_systems: ["platform"],
    };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new Error(`Sign out failed: ${error.message}`);
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
