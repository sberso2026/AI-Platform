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
  if (permission === "business_os.view") {
    return (
      hasPlatformPermission(permissions, "business", "read") ||
      hasPlatformPermission(permissions, "business", "execute") ||
      hasPlatformPermission(permissions, "business", "admin")
    );
  }
  if (permission === "business_os.manage") {
    return (
      hasPlatformPermission(permissions, "business", "execute") ||
      hasPlatformPermission(permissions, "business", "admin")
    );
  }
  return hasPlatformPermission(permissions, mapped.resource, mapped.action);
}

export { BUSINESS_PERMISSIONS };
