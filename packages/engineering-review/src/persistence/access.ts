import { failClosed } from "../errors";

export type ReviewAccessPermission = {
  resource: string;
  action: string;
};

/**
 * Simulated JWT / RLS principal. Hosted tests would bind this to auth.uid()
 * memberships; the in-memory adapter enforces the same predicates.
 */
export type ReviewAccessPrincipal = {
  userId: string;
  tenantIds: readonly string[];
  workspaceIds: readonly string[];
  permissions: readonly ReviewAccessPermission[];
  roleSlug?: string;
  /** Service-role analogue. Triggers / ownership guards still apply. */
  bypassRls?: boolean;
};

export function canSelectReviewRow(
  principal: ReviewAccessPrincipal,
  tenantId: string,
  workspaceId: string,
): boolean {
  if (principal.bypassRls) return true;
  if (!principal.userId?.trim()) return false;
  if (!principal.tenantIds.includes(tenantId)) return false;
  if (!principal.workspaceIds.includes(workspaceId)) return false;
  return true;
}

export function hasEngineeringAction(
  principal: ReviewAccessPrincipal,
  tenantId: string,
  action: "execute" | "admin",
): boolean {
  if (principal.bypassRls) return true;
  if (
    (principal.roleSlug === "owner" || principal.roleSlug === "admin") &&
    principal.tenantIds.includes(tenantId)
  ) {
    return true;
  }
  return principal.permissions.some(
    (permission) =>
      permission.resource === "engineering" &&
      (permission.action === action || permission.action === "admin"),
  ) && principal.tenantIds.includes(tenantId);
}

export function assertSelect(
  principal: ReviewAccessPrincipal,
  tenantId: string,
  workspaceId: string,
): void {
  if (!canSelectReviewRow(principal, tenantId, workspaceId)) {
    failClosed("rls_denied", "Authenticated review access requires tenant and workspace membership", {
      tenantId,
      workspaceId,
      userId: principal.userId,
    });
  }
}

export function assertInsert(
  principal: ReviewAccessPrincipal,
  tenantId: string,
  workspaceId: string,
): void {
  assertSelect(principal, tenantId, workspaceId);
  if (!hasEngineeringAction(principal, tenantId, "execute")) {
    failClosed("rls_insert_denied", "Review insert requires engineering execute in the tenant", {
      tenantId,
      userId: principal.userId,
    });
  }
}

export function assertUpdate(
  principal: ReviewAccessPrincipal,
  tenantId: string,
  workspaceId: string,
): void {
  assertSelect(principal, tenantId, workspaceId);
  if (!hasEngineeringAction(principal, tenantId, "execute")) {
    failClosed("rls_update_denied", "Review update requires engineering execute in the tenant", {
      tenantId,
      userId: principal.userId,
    });
  }
}

export function assertDelete(
  principal: ReviewAccessPrincipal,
  tenantId: string,
  workspaceId: string,
): void {
  assertSelect(principal, tenantId, workspaceId);
  if (!hasEngineeringAction(principal, tenantId, "admin")) {
    failClosed("rls_delete_denied", "Review delete requires engineering admin in the tenant", {
      tenantId,
      userId: principal.userId,
    });
  }
}

export function serviceRolePrincipal(userId = "service-role"): ReviewAccessPrincipal {
  return {
    userId,
    tenantIds: [],
    workspaceIds: [],
    permissions: [],
    bypassRls: true,
  };
}
