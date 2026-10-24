import {
  CANONICAL_CONTEXT_TENANT_COOKIE,
  CANONICAL_CONTEXT_TENANT_HEADER,
  CANONICAL_CONTEXT_TENANT_HEADER_COMPAT,
  CANONICAL_CONTEXT_WORKSPACE_COOKIE,
  CANONICAL_CONTEXT_WORKSPACE_HEADER,
  CANONICAL_CONTEXT_WORKSPACE_HEADER_COMPAT,
  readRequestedCanonicalContext,
  resolveCanonicalActorContext,
  type CanonicalMembership,
  type CanonicalContextDecision,
} from "@rtb/engineering-review/identity";

type FilterBuilder = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }> & {
  eq: (column: string, value: string) => FilterBuilder;
  maybeSingle: () => PromiseLike<{ data: { id?: string; tenant_id?: string } | null; error: { message: string } | null }>;
};

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => FilterBuilder;
  };
};

export function boundActorContextClient(value: unknown): SupabaseLike {
  return value as SupabaseLike;
}

export {
  CANONICAL_CONTEXT_TENANT_COOKIE,
  CANONICAL_CONTEXT_WORKSPACE_COOKIE,
};

export function canonicalContextCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure,
  };
}

export function requestedContextFromStores(input: {
  header: (name: string) => string | null | undefined;
  cookie: (name: string) => string | null | undefined;
}) {
  return readRequestedCanonicalContext({
    tenantHeader: input.header(CANONICAL_CONTEXT_TENANT_HEADER),
    workspaceHeader: input.header(CANONICAL_CONTEXT_WORKSPACE_HEADER),
    tenantHeaderCompat: input.header(CANONICAL_CONTEXT_TENANT_HEADER_COMPAT),
    workspaceHeaderCompat: input.header(CANONICAL_CONTEXT_WORKSPACE_HEADER_COMPAT),
    tenantCookie: input.cookie(CANONICAL_CONTEXT_TENANT_COOKIE),
    workspaceCookie: input.cookie(CANONICAL_CONTEXT_WORKSPACE_COOKIE),
  });
}

export async function loadCanonicalMemberships(
  supabase: SupabaseLike,
  userId: string,
): Promise<CanonicalMembership[]> {
  const [{ data: tenantRows }, { data: workspaceRows }] = await Promise.all([
    supabase
      .from("tenant_memberships")
      .select("tenant_id, status, roles(slug), tenants(id, slug, settings)")
      .eq("user_id", userId)
      .eq("status", "active"),
    supabase
      .from("workspace_memberships")
      .select("workspace_id, workspaces!inner(id, slug, status, tenant_id)")
      .eq("user_id", userId)
      .eq("workspaces.status", "active"),
  ]);

  const workspacesByTenant = new Map<string, CanonicalMembership["workspaces"]>();
  for (const row of workspaceRows ?? []) {
    const record = row as {
      workspace_id?: string;
      workspaces?:
        | { id?: string; slug?: string; status?: string; tenant_id?: string }
        | { id?: string; slug?: string; status?: string; tenant_id?: string }[]
        | null;
    };
    const joined = Array.isArray(record.workspaces) ? record.workspaces[0] : record.workspaces;
    const tenantId = String(joined?.tenant_id ?? "");
    const workspaceId = String(joined?.id ?? record.workspace_id ?? "");
    if (!tenantId || !workspaceId) continue;
    const list = workspacesByTenant.get(tenantId) ?? [];
    list.push({
      workspaceId,
      slug: String(joined?.slug ?? workspaceId),
      status: String(joined?.status ?? "active"),
    });
    workspacesByTenant.set(tenantId, list);
  }

  const memberships: CanonicalMembership[] = [];
  for (const row of tenantRows ?? []) {
    const record = row as {
      tenant_id?: string;
      roles?: { slug?: string } | { slug?: string }[] | null;
      tenants?:
        | { id?: string; slug?: string; settings?: Record<string, unknown> | null }
        | { id?: string; slug?: string; settings?: Record<string, unknown> | null }[]
        | null;
    };
    const tenant = Array.isArray(record.tenants) ? record.tenants[0] : record.tenants;
    const role = Array.isArray(record.roles) ? record.roles[0] : record.roles;
    const tenantId = String(tenant?.id ?? record.tenant_id ?? "");
    if (!tenantId) continue;
    memberships.push({
      tenantId,
      tenantSlug: String(tenant?.slug ?? tenantId),
      roleSlug: String(role?.slug ?? "member"),
      settings: (tenant?.settings as Record<string, unknown> | null) ?? null,
      workspaces: workspacesByTenant.get(tenantId) ?? [],
    });
  }
  return memberships;
}

export async function lookupWorkspaceOwnership(
  supabase: SupabaseLike,
  workspaceId: string | null,
): Promise<{ workspaceId: string; tenantId: string } | null> {
  if (!workspaceId) return null;
  const { data } = await supabase.from("workspaces").select("id, tenant_id").eq("id", workspaceId).maybeSingle();
  if (!data?.id || !data.tenant_id) return null;
  return { workspaceId: String(data.id), tenantId: String(data.tenant_id) };
}

export async function resolveRequestActorContext(input: {
  supabase: SupabaseLike;
  userId: string;
  header: (name: string) => string | null | undefined;
  cookie: (name: string) => string | null | undefined;
}): Promise<CanonicalContextDecision> {
  const requested = requestedContextFromStores(input);
  if (!requested.ok) return requested;
  const [memberships, ownership] = await Promise.all([
    loadCanonicalMemberships(input.supabase, input.userId),
    lookupWorkspaceOwnership(input.supabase, requested.workspaceId),
  ]);
  return resolveCanonicalActorContext({
    memberships,
    requested,
    requestedWorkspaceOwnership: ownership,
  });
}
