import type { BusinessPermission } from "@rtb/types";
import { BUSINESS_PERMISSIONS } from "@rtb/types";
import type { Permission } from "@rtb/types";

/** Map BOS permissions onto platform RBAC resources/actions. */
export const BUSINESS_PERMISSION_MAP: Record<
  BusinessPermission,
  { resource: "business"; action: "read" | "execute" | "admin" }
> = {
  "business_os.view": { resource: "business", action: "read" },
  "business_os.manage": { resource: "business", action: "execute" },
  "business_os.admin": { resource: "business", action: "admin" },
  "business_os.owner_command.view": { resource: "business", action: "read" },
  "business_os.owner_command.manage": { resource: "business", action: "execute" },
  "business_os.financial_intelligence.view": { resource: "business", action: "read" },
  "business_os.financial_intelligence.manage": { resource: "business", action: "execute" },
  "business_os.growth_intelligence.view": { resource: "business", action: "read" },
  "business_os.growth_intelligence.manage": { resource: "business", action: "execute" },
};

function hasPlatformPermission(
  permissions: Permission[],
  resource: string,
  action: string,
): boolean {
  return permissions.some(
    (p) =>
      (p.resource === resource && (p.action === action || p.action === "admin")) ||
      (p.resource === "tenant" && p.action === "admin") ||
      (p.resource === "business" && p.action === "admin"),
  );
}

export function hasBusinessPermission(
  permissions: Permission[],
  permission: BusinessPermission,
): boolean {
  if (hasPlatformPermission(permissions, "business", "admin")) return true;
  if (hasPlatformPermission(permissions, "tenant", "admin")) return true;
  const mapped = BUSINESS_PERMISSION_MAP[permission];
  if (!mapped) return false;
  if (
    permission === "business_os.view" ||
    permission === "business_os.owner_command.view" ||
    permission === "business_os.financial_intelligence.view" ||
    permission === "business_os.growth_intelligence.view"
  ) {
    return (
      hasPlatformPermission(permissions, "business", "read") ||
      hasPlatformPermission(permissions, "business", "execute") ||
      hasPlatformPermission(permissions, "business", "admin")
    );
  }
  if (
    permission === "business_os.manage" ||
    permission === "business_os.owner_command.manage" ||
    permission === "business_os.financial_intelligence.manage" ||
    permission === "business_os.growth_intelligence.manage"
  ) {
    return (
      hasPlatformPermission(permissions, "business", "execute") ||
      hasPlatformPermission(permissions, "business", "admin")
    );
  }
  return hasPlatformPermission(permissions, mapped.resource, mapped.action);
}

export type { BusinessPermission };
export { BUSINESS_PERMISSIONS };
