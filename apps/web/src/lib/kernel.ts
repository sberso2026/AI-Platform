import { createClient } from "@/lib/supabase/server";
import { createPlatformKernel } from "@rtb/platform-kernel";
import { createEngineeringOS } from "@rtb/engineering-os";
import { createPlatformCommerce } from "@rtb/platform-commerce";
import { PermissionService, NAV_TIER_RANK, resolveNavTier } from "@rtb/platform-core";
import type { NavTier } from "@rtb/types";
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

function resolveMembershipRole(
  memberships: Array<{ tenant_id: string; role_id: string; roles: { slug: string } | { slug: string }[] | null }>
): { tenantId: string; roleId: string; roleSlug: string } | null {
  if (!memberships.length) return null;

  let bestTier: NavTier = "viewer";
  let best: (typeof memberships)[number] | null = null;
  let ownerMembership: (typeof memberships)[number] | null = null;

  for (const row of memberships) {
    const role = row.roles;
    const slug = (Array.isArray(role) ? role[0]?.slug : role?.slug) ?? "member";
    if (slug === "owner") ownerMembership = row;
    const tier = resolveNavTier(slug);
    if (!best || NAV_TIER_RANK[tier] >= NAV_TIER_RANK[bestTier]) {
      bestTier = tier;
      best = row;
    }
  }

  const chosen = ownerMembership ?? best;
  if (!chosen) return null;

  const role = chosen.roles;
  const roleSlug = (Array.isArray(role) ? role[0]?.slug : role?.slug) ?? "member";

  return {
    tenantId: chosen.tenant_id as string,
    roleId: chosen.role_id as string,
    roleSlug,
  };
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: memberships } = await supabase
    .from("tenant_memberships")
    .select("tenant_id, role_id, roles(slug)")
    .eq("user_id", user.id)
    .eq("status", "active");

  const membership = resolveMembershipRole(memberships ?? []);
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
  const engineering = createEngineeringOS(supabase, kernel, {
    documentBodyRetriever: {
      retrieve: async (query) => {
        const { createDocumentBodyRetrievalProbe } = await import(
          "@/lib/engineering/document-body-retrieval"
        );
        return createDocumentBodyRetrievalProbe().retrieve!(query);
      },
    },
  });
  const commerce = createPlatformCommerce(supabase);
  const permissionService = new PermissionService(supabase);
  const permissions = await permissionService.getUserPermissions(
    user.id,
    membership.tenantId
  );

  const settings = (tenant?.settings ?? {}) as TenantSettings;

  return {
    userId: user.id,
    tenantId: membership.tenantId,
    workspaceId: workspace?.id as string | undefined,
    roleSlug: membership.roleSlug,
    permissions,
    showAdvancedPlatformTools: settings.showAdvancedPlatformTools === true,
    supabase,
    kernel,
    engineering,
    commerce,
  };
}
