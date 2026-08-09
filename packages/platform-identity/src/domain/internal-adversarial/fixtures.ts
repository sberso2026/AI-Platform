/**
 * Tenant A/B adversarial fixtures for internal negative testing.
 * No production customer data.
 */
export type AdversarialRole =
  | "owner"
  | "manager"
  | "engineer"
  | "viewer"
  | "disabled"
  | "revoked"
  | "unauthenticated";

export type AdversarialPrincipal = {
  principalId: string;
  tenantId: string;
  role: AdversarialRole;
  active: boolean;
};

export type AdversarialResource = {
  resourceId: string;
  tenantId: string;
  workspaceId: string;
  surface:
    | "users"
    | "projects"
    | "assets"
    | "files"
    | "project_intelligence"
    | "inspection_intelligence"
    | "asset_intelligence"
    | "project_controls"
    | "digital_twin"
    | "engineering_model_interop"
    | "security_assurance"
    | "enterprise_identity"
    | "search"
    | "ai_context"
    | "events"
    | "execution_host";
};

export type AdversarialFixtureBundle = {
  tenantA: { tenantId: string; workspaceId: string };
  tenantB: { tenantId: string; workspaceId: string };
  principals: AdversarialPrincipal[];
  resources: AdversarialResource[];
};

export function buildTenantAbAdversarialFixtures(): AdversarialFixtureBundle {
  const tenantA = { tenantId: "tenant-a", workspaceId: "ws-a-1" };
  const tenantB = { tenantId: "tenant-b", workspaceId: "ws-b-1" };

  const principals: AdversarialPrincipal[] = [
    { principalId: "a-owner", tenantId: tenantA.tenantId, role: "owner", active: true },
    { principalId: "a-manager", tenantId: tenantA.tenantId, role: "manager", active: true },
    { principalId: "a-engineer", tenantId: tenantA.tenantId, role: "engineer", active: true },
    { principalId: "a-viewer", tenantId: tenantA.tenantId, role: "viewer", active: true },
    { principalId: "a-disabled", tenantId: tenantA.tenantId, role: "disabled", active: false },
    { principalId: "a-revoked", tenantId: tenantA.tenantId, role: "revoked", active: false },
    { principalId: "b-owner", tenantId: tenantB.tenantId, role: "owner", active: true },
    { principalId: "b-engineer", tenantId: tenantB.tenantId, role: "engineer", active: true },
    { principalId: "anon", tenantId: "", role: "unauthenticated", active: false },
  ];

  const surfaces: AdversarialResource["surface"][] = [
    "users",
    "projects",
    "assets",
    "files",
    "project_intelligence",
    "inspection_intelligence",
    "asset_intelligence",
    "project_controls",
    "digital_twin",
    "engineering_model_interop",
    "security_assurance",
    "enterprise_identity",
    "search",
    "ai_context",
    "events",
    "execution_host",
  ];

  const resources: AdversarialResource[] = surfaces.flatMap((surface) => [
    {
      resourceId: `${surface}-a-1`,
      tenantId: tenantA.tenantId,
      workspaceId: tenantA.workspaceId,
      surface,
    },
    {
      resourceId: `${surface}-b-1`,
      tenantId: tenantB.tenantId,
      workspaceId: tenantB.workspaceId,
      surface,
    },
  ]);

  return { tenantA, tenantB, principals, resources };
}

/** Fail-closed object authorization used by the adversarial regression suite. */
export function authorizeResourceAccess(
  principal: AdversarialPrincipal,
  resource: AdversarialResource,
): { allowed: boolean; reason: string } {
  if (principal.role === "unauthenticated" || !principal.active) {
    return { allowed: false, reason: "unauthenticated_or_inactive" };
  }
  if (principal.tenantId !== resource.tenantId) {
    return { allowed: false, reason: "cross_tenant_denied" };
  }
  if (principal.role === "viewer" && resource.surface === "security_assurance") {
    return { allowed: false, reason: "viewer_cannot_access_internal_assurance" };
  }
  if (principal.role === "viewer" && resource.surface === "execution_host") {
    return { allowed: false, reason: "viewer_cannot_invoke_execution_host" };
  }
  return { allowed: true, reason: "same_tenant_role_permitted" };
}
