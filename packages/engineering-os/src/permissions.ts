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

export { ENGINEERING_PERMISSIONS };
