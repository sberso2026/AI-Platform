import type { SupabaseClient } from "@rtb/database";
import { createSupabaseAuthMailAdapter, deliverActivationMail, type AuthMailAdapter } from "./auth-mail-adapter";
import { invitationStatusFromAuth } from "./invite-auth-error";
import {
  IdentityProvisioningError,
  assertActivationResendAllowed,
  buildInviteUserMetadata,
  classifyIdentityFailure,
  deriveOnboardingState,
} from "./identity-onboarding";

/** Canonical owner path: /signup creates the tenant. Members join by admin invite email.
 * Locked for EOS external pilot — do not add a parallel RTB_ADMIN_PROVISIONED owner path. */
export const CANONICAL_TENANT_ONBOARDING_MODEL = "SELF_SERVICE" as const;

export const PILOT_INVITE_ROLE_SLUGS = ["admin", "member", "viewer"] as const;
export type PilotInviteRoleSlug = (typeof PILOT_INVITE_ROLE_SLUGS)[number];

export function isPilotInviteRoleSlug(value: string): value is PilotInviteRoleSlug {
  return (PILOT_INVITE_ROLE_SLUGS as readonly string[]).includes(value);
}

export function assertCanAssignInviteRole(currentSlug: string): void {
  if (currentSlug === "owner") {
    throw new Error("Owner tenant role cannot be changed with the invite role selector");
  }
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
  /** HTTPS origin + /reset-password so activation uses the custom-domain recovery page. */
  redirectTo?: string;
  /** Rejected on the canonical path. Temporary passwords are not used for external onboarding. */
  breakGlass?: boolean;
}

export interface InviteMemberResult {
  userId: string;
  email: string;
  roleSlug: PilotInviteRoleSlug;
  workspaceId: string;
  created: boolean;
  delivery: "activation_sent" | "activation_delivery_failed" | "existing_user";
  onboardingState: "pending_activation" | "active" | "activation_delivery_failed" | "suspended";
  applicationAccess: "not_assigned";
}

export class MembershipAdminService {
  constructor(
    private readonly admin: SupabaseClient,
    private readonly mailer?: AuthMailAdapter,
  ) {}

  private mailAdapter(): AuthMailAdapter {
    return this.mailer ?? createSupabaseAuthMailAdapter(this.admin);
  }

  async listMembers(tenantId: string) {
    const { data: rawMemberships, error } = await this.admin
      .from("tenant_memberships")
      .select("id, user_id, status, invited_at, joined_at, roles(slug, name)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const memberships = (rawMemberships ?? []) as Array<{
      id: string;
      user_id: string;
      status: string;
      invited_at: string | null;
      joined_at: string | null;
      roles: { slug?: string; name?: string } | { slug?: string; name?: string }[] | null;
    }>;
    const userIds = memberships.map((row) => row.user_id);
    const { data: profiles, error: profileError } = userIds.length
      ? await this.admin.from("profiles").select("id, email, full_name").in("id", userIds)
      : { data: [], error: null };
    if (profileError) throw new Error(profileError.message);
    const profileMap = new Map((profiles ?? []).map((row) => [row.id as string, row]));

    const { data: rawWorkspaceRows, error: workspaceError } = await this.admin
      .from("workspace_memberships")
      .select("user_id, workspace_id, workspaces!inner(id, name, slug, tenant_id)")
      .eq("workspaces.tenant_id", tenantId);
    if (workspaceError) throw new Error(workspaceError.message);
    const workspacesByUser = new Map<string, Array<{ id: string; name?: string; slug?: string }>>();
    for (const row of (rawWorkspaceRows ?? []) as Array<{
      user_id: string;
      workspaces: { id: string; name?: string; slug?: string } | { id: string }[] | null;
    }>) {
      const joined = row.workspaces as { id: string; name?: string; slug?: string } | { id: string }[] | null;
      const workspace = Array.isArray(joined) ? joined[0] : joined;
      if (!workspace?.id) continue;
      const list = workspacesByUser.get(row.user_id as string) ?? [];
      list.push(workspace);
      workspacesByUser.set(row.user_id as string, list);
    }

    return await Promise.all(
      (memberships ?? []).map(async (row) => {
      const role = row.roles as { slug?: string; name?: string } | { slug?: string; name?: string }[] | null;
      const slug = (Array.isArray(role) ? role[0]?.slug : role?.slug) ?? "member";
      const name = (Array.isArray(role) ? role[0]?.name : role?.name) ?? slug;
      const profile = profileMap.get(row.user_id as string);
      let emailConfirmed = false;
      let invited = Boolean(row.invited_at);
      let activationDelivery: string | null = null;
      let activationSentAt: string | null = null;
      const authUser = await this.admin.auth.admin.getUserById(row.user_id);
      if (!authUser.error && authUser.data.user) {
        emailConfirmed = Boolean(authUser.data.user.email_confirmed_at);
        invited = invited || Boolean(authUser.data.user.invited_at);
        const meta = (authUser.data.user.user_metadata ?? {}) as Record<string, unknown>;
        activationDelivery = typeof meta.activation_delivery === "string" ? meta.activation_delivery : null;
        activationSentAt = typeof meta.activation_sent_at === "string" ? meta.activation_sent_at : null;
      }
      const onboardingState = deriveOnboardingState({
        emailConfirmed,
        membershipStatus: row.status,
        activationDelivery,
      });
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
        emailConfirmed,
        invitationStatus: invitationStatusFromAuth({ emailConfirmed, invited }),
        onboardingState,
        activationStatus: onboardingState,
        activationSentAt,
      };
    }),
    );
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
    if (input.breakGlass) {
      throw new IdentityProvisioningError(
        "identity_failed",
        "Temporary passwords are not used for canonical onboarding.",
        422,
      );
    }
    const email = input.email.trim().toLowerCase();
    if (!email.includes("@")) {
      throw new IdentityProvisioningError("invalid_recipient", "Valid email required", 422);
    }
    if (input.roleSlug.trim().toLowerCase() === "owner") {
      throw new IdentityProvisioningError("invalid_recipient", "Owner cannot be assigned through invite", 422);
    }
    const roleSlug = mapPilotInviteRole(input.roleSlug);
    const role = await this.requireRole(input.tenantId, roleSlug);
    await this.requireWorkspace(input.tenantId, input.workspaceId);

    const metadata = buildInviteUserMetadata({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      roleSlug,
      invitedBy: input.invitedBy,
    });

    const existing = await this.findAuthUserByEmail(email);
    let userId: string;
    let created = false;

    if (existing) {
      const memberships = await this.listTenantMembershipsForUser(existing.id);
      const inThisTenant = memberships.some((row) => row.tenant_id === input.tenantId);
      const inOtherTenant = memberships.some((row) => row.tenant_id !== input.tenantId);
      if (inOtherTenant && !inThisTenant) {
        throw new IdentityProvisioningError(
          "identity_exists",
          "An Auth user with this email already exists on another tenant. Do not create a duplicate or cross-link.",
          409,
          { userId: existing.id },
        );
      }
      userId = existing.id;
      created = false;
    } else {
      const createdUser = await this.admin.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: metadata,
        app_metadata: metadata,
      });
      if (createdUser.error || !createdUser.data.user?.id) {
        const duplicate = await this.findAuthUserByEmail(email);
        if (duplicate?.id) {
          userId = duplicate.id;
          created = false;
        } else {
          throw classifyIdentityFailure(createdUser.error ?? new Error("Failed to create Auth user"));
        }
      } else {
        userId = createdUser.data.user.id;
        created = true;
      }
    }

    await this.attachMembership({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      userId,
      roleId: role.id as string,
    });

    let delivery: InviteMemberResult["delivery"] = created ? "activation_delivery_failed" : "existing_user";
    if (!existing?.emailConfirmed) {
      delivery = await this.tryDeliverActivation(userId, email, input.redirectTo);
    } else {
      delivery = "existing_user";
    }

    const onboardingState =
      existing?.emailConfirmed
        ? "active"
        : delivery === "activation_sent"
          ? "pending_activation"
          : "activation_delivery_failed";

    const result: InviteMemberResult = {
      userId,
      email,
      roleSlug,
      workspaceId: input.workspaceId,
      created,
      delivery,
      onboardingState,
      applicationAccess: "not_assigned",
    };

    if (delivery === "activation_delivery_failed") {
      throw new IdentityProvisioningError(
        "activation_delivery_failed",
        "Pending Auth identity was kept, but the activation email could not be delivered. Use Resend activation after SMTP is ready.",
        502,
        { ...result },
      );
    }

    return result;
  }

  async resendActivation(input: { tenantId: string; userId: string; redirectTo?: string; actorUserId: string }) {
    const authUser = await this.admin.auth.admin.getUserById(input.userId);
    if (authUser.error || !authUser.data.user) {
      throw new IdentityProvisioningError("identity_failed", "Auth user not found", 404);
    }
    const user = authUser.data.user;
    if (user.email_confirmed_at) {
      throw new IdentityProvisioningError("identity_exists", "This account is already activated.", 409, {
        userId: input.userId,
      });
    }
    const memberships = await this.listTenantMembershipsForUser(input.userId);
    if (!memberships.some((row) => row.tenant_id === input.tenantId)) {
      throw new IdentityProvisioningError("unauthorized", "User is not a member of this tenant", 403);
    }
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    assertActivationResendAllowed(typeof meta.activation_sent_at === "string" ? meta.activation_sent_at : null);
    const email = (user.email ?? "").toLowerCase();
    const delivery = await this.tryDeliverActivation(input.userId, email, input.redirectTo);
    if (delivery !== "activation_sent") {
      throw new IdentityProvisioningError(
        "activation_delivery_failed",
        "Pending Auth identity was kept, but the activation email could not be delivered. Use Resend activation after SMTP is ready.",
        502,
        { userId: input.userId },
      );
    }
    return { userId: input.userId, email, delivery, onboardingState: "pending_activation" as const };
  }

  async assignRole(input: { tenantId: string; userId: string; roleSlug: string; workspaceId?: string }) {
    const { data: membership, error: currentError } = await this.admin
      .from("tenant_memberships")
      .select("role_id")
      .eq("tenant_id", input.tenantId)
      .eq("user_id", input.userId)
      .maybeSingle();
    if (currentError) throw new Error(currentError.message);
    if (!membership?.role_id) throw new Error("Tenant membership not found");
    const { data: currentRoleRow, error: roleLookupError } = await this.admin
      .from("roles")
      .select("slug")
      .eq("id", membership.role_id)
      .maybeSingle();
    if (roleLookupError) throw new Error(roleLookupError.message);
    assertCanAssignInviteRole(String(currentRoleRow?.slug ?? ""));
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

  /**
   * Remove tenant + workspace memberships for one tenant only.
   * Does not delete auth.users or profiles.
   */
  async removeTenantAccess(input: { tenantId: string; userId: string }) {
    const memberships = await this.listTenantMembershipsForUser(input.userId);
    if (!memberships.some((row) => row.tenant_id === input.tenantId)) {
      return { userId: input.userId, tenantId: input.tenantId, removed: false as const };
    }
    const { data: workspaces, error: workspaceError } = await this.admin
      .from("workspaces")
      .select("id")
      .eq("tenant_id", input.tenantId);
    if (workspaceError) throw new Error(workspaceError.message);
    const workspaceIds = (workspaces ?? []).map((row) => row.id as string);
    if (workspaceIds.length) {
      const { error: wsMembershipError } = await this.admin
        .from("workspace_memberships")
        .delete()
        .eq("user_id", input.userId)
        .in("workspace_id", workspaceIds);
      if (wsMembershipError) throw new Error(wsMembershipError.message);
    }
    const { error: tenantError } = await this.admin
      .from("tenant_memberships")
      .delete()
      .eq("tenant_id", input.tenantId)
      .eq("user_id", input.userId);
    if (tenantError) throw new Error(tenantError.message);
    return { userId: input.userId, tenantId: input.tenantId, removed: true as const };
  }

  private async findAuthUserByEmail(email: string): Promise<{
    id: string;
    emailConfirmed: boolean;
    metadata: Record<string, unknown>;
  } | null> {
    for (let page = 1; page <= 20; page++) {
      const listed = await this.admin.auth.admin.listUsers({ page, perPage: 200 });
      if (listed.error) throw new Error(listed.error.message);
      const users = listed.data.users ?? [];
      const hit = users.find((user) => (user.email ?? "").toLowerCase() === email);
      if (hit?.id) {
        return {
          id: hit.id,
          emailConfirmed: Boolean(hit.email_confirmed_at),
          metadata: (hit.user_metadata ?? {}) as Record<string, unknown>,
        };
      }
      if (users.length < 200) break;
    }
    return null;
  }

  private async findUserIdByEmail(email: string): Promise<string | null> {
    return (await this.findAuthUserByEmail(email))?.id ?? null;
  }

  private async listTenantMembershipsForUser(userId: string): Promise<Array<{ tenant_id: string }>> {
    const { data, error } = await this.admin
      .from("tenant_memberships")
      .select("tenant_id")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{ tenant_id: string }>;
  }

  private async tryDeliverActivation(
    userId: string,
    email: string,
    redirectTo?: string,
  ): Promise<"activation_sent" | "activation_delivery_failed"> {
    const authUser = await this.admin.auth.admin.getUserById(userId);
    const currentMeta = ((authUser.data.user?.user_metadata ?? {}) as Record<string, unknown>) ?? {};
    try {
      await deliverActivationMail(this.mailAdapter(), {
        email,
        redirectTo: redirectTo ?? "",
        template: "activation",
      });
      await this.admin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...currentMeta,
          activation_delivery: "sent",
          activation_sent_at: new Date().toISOString(),
        },
      });
      return "activation_sent";
    } catch {
      await this.admin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...currentMeta,
          activation_delivery: "failed",
        },
      });
      return "activation_delivery_failed";
    }
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

  async createWorkspace(input: { tenantId: string; name: string; slug?: string }) {
    const slugBase =
      input.slug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) ||
      input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) ||
      "workspace";
    const slug = `${slugBase}-${Date.now().toString(36).slice(-6)}`;
    const { data, error } = await this.admin
      .from("workspaces")
      .insert({
        tenant_id: input.tenantId,
        name: input.name.trim() || slug,
        slug,
        type: "project",
        status: "active",
      })
      .select("id, name, slug")
      .single();
    if (error || !data?.id) throw new Error(error?.message ?? "Failed to create workspace");
    return data;
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
}
