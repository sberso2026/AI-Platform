import type { EngineeringPermission } from "@rtb/types";
import { ENGINEERING_PERMISSIONS } from "@rtb/types";

/** Map Engineering OS fine-grained permissions to platform RBAC resources/actions */
export const ENGINEERING_PERMISSION_MAP: Record<
  EngineeringPermission,
  { resource: string; action: string }
> = {
  "engineering.view": { resource: "engineering", action: "read" },
  "engineering.admin": { resource: "engineering", action: "admin" },
  "engineering.project.create": { resource: "engineering", action: "execute" },
  "engineering.project.update": { resource: "engineering", action: "execute" },
  "engineering.project.delete": { resource: "engineering", action: "admin" },
  "engineering.asset.create": { resource: "engineering", action: "execute" },
  "engineering.asset.update": { resource: "engineering", action: "execute" },
  "engineering.asset.delete": { resource: "engineering", action: "admin" },
  "engineering.document.upload": { resource: "engineering", action: "execute" },
  "engineering.document.review": { resource: "engineering", action: "execute" },
  "engineering.ai.use": { resource: "engineering", action: "execute" },
  "engineering.report.create": { resource: "engineering", action: "execute" },
  "engineering.application.install": { resource: "engineering", action: "admin" },
  "engineering.settings.manage": { resource: "engineering", action: "admin" },
};

export function hasEngineeringPermission(
  hasPlatformPermission: (resource: string, action: string) => boolean,
  permission: EngineeringPermission
): boolean {
  const mapped = ENGINEERING_PERMISSION_MAP[permission];
  if (!mapped) return false;
  if (hasPlatformPermission("engineering", "admin")) return true;
  return hasPlatformPermission(mapped.resource, mapped.action);
}

/** Matches SQL `has_permission('engineering', 'admin', tenant_id)`: owner, admin, or engineering.admin. */
export type EngineeringAdminPrincipal = {
  roleSlug?: string | null;
  permissions?: ReadonlyArray<{ resource: string; action: string }> | null;
};

export function hasEngineeringAdminAuthority(principal: EngineeringAdminPrincipal): boolean {
  const slug = principal.roleSlug?.trim() ?? "";
  if (slug === "owner" || slug === "admin") return true;
  return (principal.permissions ?? []).some(
    (permission) => permission.resource === "engineering" && permission.action === "admin",
  );
}

export const SHAREPOINT_INDEX_JOB_TYPE = "engineering.m365.sharepoint.sync";

type ScopedEngineeringAdminPrincipal = EngineeringAdminPrincipal & {
  userId?: string | null;
  tenantIds?: readonly string[] | null;
  workspaceIds?: readonly string[] | null;
};

/** Authenticated JWT insert predicate for engineering_m365_connections. Service-role bypass is not modeled. */
export function canInsertEngineeringM365Connection(
  principal: ScopedEngineeringAdminPrincipal,
  row: { tenantId: string; workspaceId: string },
): boolean {
  if (!principal.userId?.trim()) return false;
  if (!(principal.tenantIds ?? []).includes(row.tenantId)) return false;
  if (!(principal.workspaceIds ?? []).includes(row.workspaceId)) return false;
  return hasEngineeringAdminAuthority(principal);
}

/**
 * Authenticated JWT insert predicate for SharePoint index jobs on background_jobs.
 * Matches background_jobs_engineering_m365_sync_insert. Service-role bypass is not modeled.
 */
export function canInsertSharePointIndexJob(
  principal: ScopedEngineeringAdminPrincipal,
  row: { tenantId: string; workspaceId?: string | null; jobType: string },
): boolean {
  if (row.jobType !== SHAREPOINT_INDEX_JOB_TYPE) return false;
  if (!row.workspaceId?.trim()) return false;
  return canInsertEngineeringM365Connection(principal, {
    tenantId: row.tenantId,
    workspaceId: row.workspaceId,
  });
}

export { ENGINEERING_PERMISSIONS };
