import {
  requireProjectIntelligenceAccess,
  requireProjectIntelligenceAdmin,
  requireProjectIntelligenceMigrationAccess,
  type AccessContext,
} from "@rtb/project-intelligence/server";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";

function hasPermission(
  context: CommerceHandlerContext,
  resource: string,
  action: string,
): boolean {
  return context.ctx.permissions.some(
    (permission) => permission.resource === resource && permission.action === action,
  );
}

export function projectIntelligenceAccessContext(
  context: CommerceHandlerContext,
): AccessContext {
  const engineeringAdmin =
    context.ctx.roleSlug === "owner" ||
    hasPermission(context, "engineering", "admin");
  const migrationPermission =
    engineeringAdmin ||
    hasPermission(context, "project_intelligence", "migration");

  return {
    tenantId: context.ctx.tenantId,
    workspaceId: context.ctx.workspaceId,
    principalId: context.ctx.userId,
    tenantActive: true,
    workspaceAssigned: Boolean(context.ctx.workspaceId),
    subscriptionActive: context.decision.allowed,
    licenceActive: context.decision.allowed,
    engineeringOsInstalled: context.decision.allowed,
    applicationInstalled: context.decision.allowed,
    seatAssigned: context.decision.seatAssigned ?? !context.decision.seatRequired,
    roleAssigned: Boolean(context.ctx.roleSlug),
    featureEnabled: context.decision.allowed,
    permissions: [
      "read",
      ...(engineeringAdmin ? ["admin" as const] : []),
      ...(migrationPermission ? ["migration" as const] : []),
    ],
  };
}

export function requireProjectIntelligenceRead(context: CommerceHandlerContext): void {
  requireProjectIntelligenceAccess(projectIntelligenceAccessContext(context));
}

export function requireProjectIntelligenceAdminAccess(context: CommerceHandlerContext): void {
  requireProjectIntelligenceAdmin(projectIntelligenceAccessContext(context));
}

export function requireProjectIntelligenceMigration(context: CommerceHandlerContext): void {
  requireProjectIntelligenceMigrationAccess(projectIntelligenceAccessContext(context));
}
