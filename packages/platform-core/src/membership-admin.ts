import type { SupabaseClient } from "@rtb/database";

function randomTemporaryPassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `Eos1rc-${token}`;
}

export const PILOT_INVITE_ROLE_SLUGS = ["admin", "member", "viewer"] as const;
export type PilotInviteRoleSlug = (typeof PILOT_INVITE_ROLE_SLUGS)[number];

export function isPilotInviteRoleSlug(value: string): value is PilotInviteRoleSlug {
  return (PILOT_INVITE_ROLE_SLUGS as readonly string[]).includes(value);
}

export function mapPilotInviteRole(input: string): PilotInviteRoleSlug {
  const normalized = input.trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (normalized === "admin" || normalized === "project-manager" || normalized === "manager") {
    return "admin";
  }
  if (normalized === "viewer" || normalized === "reviewer" || normalized === "licensed-reviewer") {
    return "viewer";
  }
  return "member";
}

export interface InviteMemberInput {
  tenantId: string;
  workspaceId: string;
  email: string;
  roleSlug: string;
  invitedBy: string;
}

export interface InviteMemberResult {
  userId: string;
  email: string;
  roleSlug: PilotInviteRoleSlug;
  workspaceId: string;
  created: boolean;
  delivery: "invite_email" | "temporary_password" | "existing_user";
  temporaryPassword?: string;
}

export class MembershipAdminService {
  constructor(private readonly admin: SupabaseClient) {}

  async listMembers(tenantId: string) {
    const { data: memberships, error } = await this.admin
      .from("tenant_memberships")
      .select("id, user_id, status, invited_at, joined_at, roles(slug, name)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const userIds = (memberships ?? []).map((row) => row.user_id as string);
    const { data: profiles, error: profileError } = userIds.length
      ? await this.admin.from("profiles").select("id, email, full_name").in("id", userIds)
      : { data: [], error: null };
    if (profileError) throw new Error(profileError.message);
    const profileMap = new Map((profiles ?? []).map((row) => [row.id as string, row]));

    const { data: workspaceRows, error: workspaceError } = await this.admin
      .from("workspace_memberships")
      .select("user_id, workspace_id, workspaces!inner(id, name, slug, tenant_id)")
      .eq("workspaces.tenant_id", tenantId);
    if (workspaceError) throw new Error(workspaceError.message);
    const workspacesByUser = new Map<string, Array<{ id: string; name?: string; slug?: string }>>();
    for (const row of workspaceRows ?? []) {
      const joined = row.workspaces as { id: string; name?: string; slug?: string } | { id: string }[] | null;
      const workspace = Array.isArray(joined) ? joined[0] : joined;
      if (!workspace?.id) continue;
      const list = workspacesByUser.get(row.user_id as string) ?? [];
      list.push(workspace);
      workspacesByUser.set(row.user_id as string, list);
    }

    return (memberships ?? []).map((row) => {
      const role = row.roles as { slug?: string; name?: string } | { slug?: string; name?: string }[] | null;
      const slug = (Array.isArray(role) ? role[0]?.slug : role?.slug) ?? "member";
      const name = (Array.isArray(role) ? role[0]?.name : role?.name) ?? slug;
      const profile = profileMap.get(row.user_id as string);
      return {
        membershipId: row.id,
        userId: row.user_id,
        email: profile?.email ?? null,
        fullName: profile?.full_name ?? null,
        status: row.status,
        roleSlug: slug,
        roleName: name,
        invitedAt: row.invited_at,
        joinedAt: row.joined_at,
        workspaces: workspacesByUser.get(row.user_id as string) ?? [],
      };
    });
  }

  async listAssignableRoles(tenantId: string) {
    const { data, error } = await this.admin
      .from("roles")
      .select("id, name, slug, description, is_system")
      .eq("tenant_id", tenantId)
      .in("slug", [...PILOT_INVITE_ROLE_SLUGS]);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      assignable: true,
    }));
  }

  async invite(input: InviteMemberInput): Promise<InviteMemberResult> {
    const email = input.email.trim().toLowerCase();
    if (!email.includes("@")) throw new Error("Valid email required");
    const roleSlug = mapPilotInviteRole(input.roleSlug);
    const role = await this.requireRole(input.tenantId, roleSlug);
    await this.requireWorkspace(input.tenantId, input.workspaceId);

    const metadata = {
      invited_tenant_id: input.tenantId,
      invited_role_slug: roleSlug,
      invited_workspace_id: input.workspaceId,
      invited_by: input.invitedBy,
    };

    const existingId = await this.findUserIdByEmail(email);
    let userId = existingId;
    let created = false;
    let delivery: InviteMemberResult["delivery"] = "existing_user";
    let temporaryPassword: string | undefined;

    if (!userId) {
      const invited = await this.admin.auth.admin.inviteUserByEmail(email, { data: metadata });
      if (!invited.error && invited.data.user?.id) {
        userId = invited.data.user.id;
        created = true;
        delivery = "invite_email";
      } else {
        temporaryPassword = randomTemporaryPassword();
        const createdUser = await this.admin.auth.admin.createUser({
          email,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: metadata,
        });
        if (createdUser.error || !createdUser.data.user?.id) {
          throw new Error(createdUser.error?.message ?? invited.error?.message ?? "Failed to create invited user");
        }
        userId = createdUser.data.user.id;
        created = true;
        delivery = "temporary_password";
      }
    }

    await this.attachMembership({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      userId,
      roleId: role.id as string,
    });
    await this.dropStraySignupTenant(userId, input.tenantId);

    return { userId, email, roleSlug, workspaceId: input.workspaceId, created, delivery, temporaryPassword };
  }

  async assignRole(input: { tenantId: string; userId: string; roleSlug: string; workspaceId?: string }) {
    const roleSlug = mapPilotInviteRole(input.roleSlug);
    const role = await this.requireRole(input.tenantId, roleSlug);
    const { error } = await this.admin
      .from("tenant_memberships")
      .update({ role_id: role.id, status: "active" })
      .eq("tenant_id", input.tenantId)
      .eq("user_id", input.userId);
    if (error) throw new Error(error.message);
    if (input.workspaceId) {
      await this.attachWorkspace(input.workspaceId, input.userId, role.id as string);
    }
    return { userId: input.userId, roleSlug };
  }

  async assignWorkspace(input: { tenantId: string; userId: string; workspaceId: string }) {
    await this.requireWorkspace(input.tenantId, input.workspaceId);
    const { data, error } = await this.admin
      .from("tenant_memberships")
      .select("role_id")
      .eq("tenant_id", input.tenantId)
      .eq("user_id", input.userId)
      .maybeSingle();
    if (error || !data?.role_id) throw new Error("Tenant membership not found");
    await this.attachWorkspace(input.workspaceId, input.userId, data.role_id as string);
    return { userId: input.userId, workspaceId: input.workspaceId };
  }

  private async findUserIdByEmail(email: string): Promise<string | null> {
    const listed = await this.admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listed.error) throw new Error(listed.error.message);
    return listed.data.users.find((user) => (user.email ?? "").toLowerCase() === email)?.id ?? null;
  }

  private async requireRole(tenantId: string, slug: PilotInviteRoleSlug) {
    const { data, error } = await this.admin
      .from("roles")
      .select("id, slug")
      .eq("tenant_id", tenantId)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data?.id) throw new Error(`Role ${slug} not found for tenant`);
    return data;
  }

  private async requireWorkspace(tenantId: string, workspaceId: string) {
    const { data, error } = await this.admin
      .from("workspaces")
      .select("id")
      .eq("id", workspaceId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error || !data?.id) throw new Error("Workspace not found for tenant");
  }

  private async attachMembership(input: { tenantId: string; workspaceId: string; userId: string; roleId: string }) {
    const { error } = await this.admin.from("tenant_memberships").upsert(
      {
        tenant_id: input.tenantId,
        user_id: input.userId,
        role_id: input.roleId,
        status: "active",
        invited_at: new Date().toISOString(),
        joined_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,user_id" },
    );
    if (error) throw new Error(error.message);
    await this.attachWorkspace(input.workspaceId, input.userId, input.roleId);
  }

  private async attachWorkspace(workspaceId: string, userId: string, roleId: string) {
    const { error } = await this.admin.from("workspace_memberships").upsert(
      { workspace_id: workspaceId, user_id: userId, role_id: roleId },
      { onConflict: "workspace_id,user_id" },
    );
    if (error) throw new Error(error.message);
  }

  private async dropStraySignupTenant(userId: string, keepTenantId: string) {
    const { data: memberships, error } = await this.admin
      .from("tenant_memberships")
      .select("tenant_id")
      .eq("user_id", userId);
    if (error) return;
    for (const row of memberships ?? []) {
      const tenantId = row.tenant_id as string;
      if (tenantId === keepTenantId) continue;
      const { data: tenant } = await this.admin
        .from("tenants")
        .select("id, settings, created_at")
        .eq("id", tenantId)
        .maybeSingle();
      const settings = (tenant?.settings ?? {}) as { created_via?: string; owner_user_id?: string };
      if (settings.created_via !== "signup" || settings.owner_user_id !== userId) continue;
      const createdAt = tenant?.created_at ? Date.parse(String(tenant.created_at)) : 0;
      if (createdAt && Date.now() - createdAt > 10 * 60 * 1000) continue;
      const { data: others } = await this.admin.from("tenant_memberships").select("user_id").eq("tenant_id", tenantId);
      if ((others ?? []).length > 1) continue;
      await this.admin.from("tenant_memberships").delete().eq("tenant_id", tenantId);
      await this.admin.from("tenants").delete().eq("id", tenantId);
    }
  }
}
