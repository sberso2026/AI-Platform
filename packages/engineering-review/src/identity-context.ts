import { evaluateReviewIdentityPolicy, resolveReviewIdentityPolicy, type ReviewIdentityClaims } from "./identity-policy";

export const CANONICAL_CONTEXT_TENANT_COOKIE = "rtb_active_tenant_id";
export const CANONICAL_CONTEXT_WORKSPACE_COOKIE = "rtb_active_workspace_id";
export const CANONICAL_CONTEXT_TENANT_HEADER = "x-rtb-tenant-id";
export const CANONICAL_CONTEXT_WORKSPACE_HEADER = "x-rtb-workspace-id";
export const CANONICAL_CONTEXT_TENANT_HEADER_COMPAT = "x-tenant-id";
export const CANONICAL_CONTEXT_WORKSPACE_HEADER_COMPAT = "x-workspace-id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isCanonicalUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

export function normalizeCanonicalUuid(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return UUID_RE.test(trimmed) ? trimmed.toLowerCase() : null;
}

export type CanonicalWorkspace = {
  workspaceId: string;
  slug: string;
  status?: string;
};

export type CanonicalMembership = {
  tenantId: string;
  tenantSlug: string;
  roleSlug: string;
  settings: Record<string, unknown> | null;
  workspaces: CanonicalWorkspace[];
};

export type CanonicalContextRequest = {
  tenantId?: string | null;
  workspaceId?: string | null;
};

export type CanonicalContextSource = "explicit" | "unique_review_identity" | "unique_membership";

export type CanonicalContextDeniedReason =
  | "no_membership"
  | "context_required"
  | "not_member"
  | "workspace_unauthorized"
  | "workspace_not_in_tenant"
  | "workspace_required"
  | "invalid_identifier";

export type CanonicalContextDecision =
  | {
      ok: true;
      tenantId: string;
      workspaceId: string;
      roleSlug: string;
      tenantSlug: string;
      settings: Record<string, unknown> | null;
      source: CanonicalContextSource;
    }
  | {
      ok: false;
      reason: CanonicalContextDeniedReason;
    };

export function hasExplicitReviewIdentitySettings(
  settings: Record<string, unknown> | null | undefined,
): boolean {
  if (!settings || typeof settings !== "object") return false;
  const review = settings.engineeringReview;
  if (!review || typeof review !== "object") return false;
  const rec = review as Record<string, unknown>;
  return typeof rec.requireMfa === "boolean" || typeof rec.requireEnterpriseSso === "boolean";
}

export function readRequestedCanonicalContext(input: {
  tenantHeader?: string | null;
  workspaceHeader?: string | null;
  tenantHeaderCompat?: string | null;
  workspaceHeaderCompat?: string | null;
  tenantCookie?: string | null;
  workspaceCookie?: string | null;
}): { ok: true; tenantId: string | null; workspaceId: string | null } | { ok: false; reason: "invalid_identifier" } {
  const tenantRaw = firstNonEmpty(input.tenantHeader, input.tenantHeaderCompat, input.tenantCookie);
  const workspaceRaw = firstNonEmpty(input.workspaceHeader, input.workspaceHeaderCompat, input.workspaceCookie);
  const tenant = parseOptionalUuid(tenantRaw);
  if (!tenant.ok) return tenant;
  const workspace = parseOptionalUuid(workspaceRaw);
  if (!workspace.ok) return workspace;
  return { ok: true, tenantId: tenant.value, workspaceId: workspace.value };
}

export function resolveCanonicalActorContext(input: {
  memberships: CanonicalMembership[];
  requested?: CanonicalContextRequest | null;
  requestedWorkspaceOwnership?: { workspaceId: string; tenantId: string } | null;
}): CanonicalContextDecision {
  const memberships = normalizeMemberships(input.memberships);
  if (memberships.length === 0) return { ok: false, reason: "no_membership" };

  const requestedTenant = parseOptionalUuid(input.requested?.tenantId);
  if (!requestedTenant.ok) return requestedTenant;
  const requestedWorkspace = parseOptionalUuid(input.requested?.workspaceId);
  if (!requestedWorkspace.ok) return requestedWorkspace;

  if (requestedTenant.value) {
    const membership = memberships.find((row) => row.tenantId === requestedTenant.value);
    if (!membership) return { ok: false, reason: "not_member" };
    return selectWorkspace(membership, requestedWorkspace.value, input.requestedWorkspaceOwnership, "explicit");
  }

  if (requestedWorkspace.value) {
    const owner = memberships.find((row) =>
      row.workspaces.some((workspace) => workspace.workspaceId === requestedWorkspace.value),
    );
    if (owner) {
      return selectWorkspace(owner, requestedWorkspace.value, input.requestedWorkspaceOwnership, "explicit");
    }
    const lookup = input.requestedWorkspaceOwnership;
    if (lookup && lookup.workspaceId === requestedWorkspace.value) {
      return { ok: false, reason: "workspace_unauthorized" };
    }
    return { ok: false, reason: "workspace_not_in_tenant" };
  }

  const reviewTenants = uniqueByTenant(memberships.filter((row) => hasExplicitReviewIdentitySettings(row.settings)));
  if (reviewTenants.length === 1) {
    return selectWorkspace(reviewTenants[0]!, null, input.requestedWorkspaceOwnership, "unique_review_identity");
  }
  if (reviewTenants.length > 1) return { ok: false, reason: "context_required" };

  const uniqueTenants = uniqueByTenant(memberships);
  if (uniqueTenants.length === 1) {
    return selectWorkspace(uniqueTenants[0]!, null, input.requestedWorkspaceOwnership, "unique_membership");
  }
  return { ok: false, reason: "context_required" };
}

export function evaluateCanonicalReviewAccess(input: {
  memberships: CanonicalMembership[];
  requested?: CanonicalContextRequest | null;
  requestedWorkspaceOwnership?: { workspaceId: string; tenantId: string } | null;
  claims: ReviewIdentityClaims;
  env?: NodeJS.ProcessEnv;
}):
  | {
      allowed: true;
      tenantId: string;
      workspaceId: string;
      roleSlug: string;
      source: CanonicalContextSource;
      identityReason: string;
    }
  | { allowed: false; reason: CanonicalContextDeniedReason | "mfa_required" | "enterprise_sso_required" | "assurance_unknown_fail_closed" } {
  const context = resolveCanonicalActorContext(input);
  if (!context.ok) return { allowed: false, reason: context.reason };
  const policy = resolveReviewIdentityPolicy(context.settings, input.env);
  const identity = evaluateReviewIdentityPolicy(policy, input.claims);
  if (!identity.allowed) return { allowed: false, reason: identity.reason };
  return {
    allowed: true,
    tenantId: context.tenantId,
    workspaceId: context.workspaceId,
    roleSlug: context.roleSlug,
    source: context.source,
    identityReason: identity.reason,
  };
}

function firstNonEmpty(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function parseOptionalUuid(
  raw: string | null | undefined,
): { ok: true; value: string | null } | { ok: false; reason: "invalid_identifier" } {
  if (raw == null || !String(raw).trim()) return { ok: true, value: null };
  const normalized = normalizeCanonicalUuid(raw);
  if (!normalized) return { ok: false, reason: "invalid_identifier" };
  return { ok: true, value: normalized };
}

function normalizeMemberships(rows: CanonicalMembership[]): CanonicalMembership[] {
  return rows
    .filter((row) => isCanonicalUuid(row.tenantId))
    .map((row) => ({
      ...row,
      tenantId: row.tenantId.toLowerCase(),
      tenantSlug: row.tenantSlug || row.tenantId,
      roleSlug: row.roleSlug || "member",
      workspaces: row.workspaces
        .filter((workspace) => isCanonicalUuid(workspace.workspaceId) && workspace.status !== "inactive")
        .map((workspace) => ({
          ...workspace,
          workspaceId: workspace.workspaceId.toLowerCase(),
          slug: workspace.slug || workspace.workspaceId,
        })),
    }));
}

function uniqueByTenant(rows: CanonicalMembership[]): CanonicalMembership[] {
  const seen = new Map<string, CanonicalMembership>();
  for (const row of rows) {
    if (!seen.has(row.tenantId)) seen.set(row.tenantId, row);
  }
  return [...seen.values()];
}

function selectWorkspace(
  membership: CanonicalMembership,
  requestedWorkspaceId: string | null,
  ownership: { workspaceId: string; tenantId: string } | null | undefined,
  source: CanonicalContextSource,
): CanonicalContextDecision {
  const ordered = [...membership.workspaces].sort((a, b) => a.slug.localeCompare(b.slug));
  if (requestedWorkspaceId) {
    const authorized = ordered.find((workspace) => workspace.workspaceId === requestedWorkspaceId);
    if (authorized) {
      return {
        ok: true,
        tenantId: membership.tenantId,
        workspaceId: authorized.workspaceId,
        roleSlug: membership.roleSlug,
        tenantSlug: membership.tenantSlug,
        settings: membership.settings,
        source,
      };
    }
    if (ownership?.workspaceId === requestedWorkspaceId && ownership.tenantId !== membership.tenantId) {
      return { ok: false, reason: "workspace_not_in_tenant" };
    }
    return { ok: false, reason: "workspace_unauthorized" };
  }
  const selected = ordered[0];
  if (!selected) return { ok: false, reason: "workspace_required" };
  return {
    ok: true,
    tenantId: membership.tenantId,
    workspaceId: selected.workspaceId,
    roleSlug: membership.roleSlug,
    tenantSlug: membership.tenantSlug,
    settings: membership.settings,
    source,
  };
}
