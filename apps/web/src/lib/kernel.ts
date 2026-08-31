import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createPlatformKernel } from "@rtb/platform-kernel";
import { createEngineeringOS } from "@rtb/engineering-os";
import { createBusinessOS } from "@rtb/business-os";
import { createPlatformCommerce } from "@rtb/platform-commerce";
import { NAV_TIER_RANK, permissionsFromRole, resolveNavTier } from "@rtb/platform-core";
import type { NavTier } from "@rtb/types";
import type { Permission } from "@rtb/types";
import type { TenantSettings } from "@rtb/types";

export async function getKernel() {
  const supabase = await createClient();
  return { supabase, kernel: createPlatformKernel(supabase) };
}

export interface AuthContextProfile {
  getUserMs: number;
  membershipsMs: number;
  workspaceTenantMs: number;
  permissionsMs: number;
  totalMs: number;
  permissionSource: "membership_join";
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
  business: ReturnType<typeof createBusinessOS>;
  commerce: ReturnType<typeof createPlatformCommerce>;
  authProfile?: AuthContextProfile;
}

type MembershipRoleJoin = {
  slug: string;
  permissions?: Permission[] | null;
};

type MembershipRow = {
  tenant_id: string;
  role_id: string;
  roles: MembershipRoleJoin | MembershipRoleJoin[] | null;
};

function roleRecord(roles: MembershipRow["roles"]): MembershipRoleJoin | null {
  if (!roles) return null;
  return Array.isArray(roles) ? (roles[0] ?? null) : roles;
}

function resolveMembershipRole(
  memberships: MembershipRow[]
): { tenantId: string; roleId: string; roleSlug: string; permissions: Permission[] } | null {
  if (!memberships.length) return null;

  let bestTier: NavTier = "viewer";
  let best: MembershipRow | null = null;
  let ownerMembership: MembershipRow | null = null;

  for (const row of memberships) {
    const slug = roleRecord(row.roles)?.slug ?? "member";
    if (slug === "owner") ownerMembership = row;
    const tier = resolveNavTier(slug);
    if (!best || NAV_TIER_RANK[tier] >= NAV_TIER_RANK[bestTier]) {
      bestTier = tier;
      best = row;
    }
  }

  const chosen = ownerMembership ?? best;
  if (!chosen) return null;

  const record = roleRecord(chosen.roles);
  const roleSlug = record?.slug ?? "member";

  return {
    tenantId: chosen.tenant_id,
    roleId: chosen.role_id,
    roleSlug,
    permissions: permissionsFromRole(roleSlug, record?.permissions),
  };
}

async function loadAuthContext(): Promise<AuthContext | null> {
  const started = Date.now();
  const supabase = await createClient();
  const afterClient = Date.now();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const afterUser = Date.now();
  if (!user) return null;

  const { data: memberships } = await supabase
    .from("tenant_memberships")
    .select("tenant_id, role_id, roles(slug, permissions)")
    .eq("user_id", user.id)
    .eq("status", "active");
  const afterMemberships = Date.now();

  const membership = resolveMembershipRole((memberships ?? []) as MembershipRow[]);
  if (!membership) return null;

  const [{ data: workspaceMemberships }, { data: tenant }] = await Promise.all([
    supabase
      .from("workspace_memberships")
      .select("workspace_id, workspaces!inner(id, slug, status, tenant_id)")
      .eq("user_id", user.id)
      .eq("workspaces.tenant_id", membership.tenantId)
      .eq("workspaces.status", "active"),
    supabase.from("tenants").select("settings").eq("id", membership.tenantId).single(),
  ]);
  const afterWorkspaceTenant = Date.now();

  // Prefer deterministic slug order so multi-workspace tenants resolve stably
  // (for example PI cert workspace A before workspace B).
  const workspace = [...(workspaceMemberships ?? [])]
    .map((row) => {
      const joined = row.workspaces as
        | { id: string; slug: string }
        | { id: string; slug: string }[]
        | null;
      return Array.isArray(joined) ? joined[0] : joined;
    })
    .filter((row): row is { id: string; slug: string } => Boolean(row?.id))
    .sort((a, b) => a.slug.localeCompare(b.slug))[0];

  const kernel = createPlatformKernel(supabase);
  const engineering = createEngineeringOS(supabase, kernel);
  const business = createBusinessOS(supabase, kernel);
  const commerce = createPlatformCommerce(supabase);
  const settings = (tenant?.settings ?? {}) as TenantSettings;

  return {
    userId: user.id,
    tenantId: membership.tenantId,
    workspaceId: workspace?.id as string | undefined,
    roleSlug: membership.roleSlug,
    permissions: membership.permissions,
    showAdvancedPlatformTools: settings.showAdvancedPlatformTools === true,
    supabase,
    kernel,
    engineering,
    business,
    commerce,
    authProfile: {
      getUserMs: afterUser - afterClient,
      membershipsMs: afterMemberships - afterUser,
      workspaceTenantMs: afterWorkspaceTenant - afterMemberships,
      permissionsMs: 0,
      totalMs: Date.now() - started,
      permissionSource: "membership_join",
    },
  };
}

/**
 * Request-scoped auth reconstruction. React `cache` dedupes within one Next.js
 * request only. It does not cache authorization across requests.
 */
export const getAuthContext = cache(loadAuthContext);
