import type { Permission } from "@rtb/types";

/**
 * Connector-context consumption for Project Intelligence / Engineering.
 * Does not require Business OS product entitlement or business resource RBAC.
 */
export function canReadPlatformConnectorContext(
  permissions: readonly Pick<Permission, "resource" | "action">[],
): boolean {
  return permissions.some((permission) => {
    if (permission.resource === "tenant" && permission.action === "admin") return true;
    if (permission.resource === "engineering" && (permission.action === "read" || permission.action === "admin")) {
      return true;
    }
    if (
      permission.resource === "project_intelligence" &&
      (permission.action === "read" || permission.action === "admin")
    ) {
      return true;
    }
    return false;
  });
}
