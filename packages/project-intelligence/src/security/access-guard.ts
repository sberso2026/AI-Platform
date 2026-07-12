import { ProjectIntelligenceError, type ProjectIntelligenceErrorCode } from "../domain/errors";

export type ProjectIntelligencePermission = "read" | "admin" | "migration";
export interface AccessContext {
  tenantId?: string;
  workspaceId?: string;
  principalId?: string;
  tenantActive?: boolean;
  workspaceAssigned?: boolean;
  subscriptionActive?: boolean;
  licenceActive?: boolean;
  engineeringOsInstalled?: boolean;
  applicationInstalled?: boolean;
  seatAssigned?: boolean;
  roleAssigned?: boolean;
  featureEnabled?: boolean;
  permissions: readonly ProjectIntelligencePermission[];
}
export interface AccessDecision {
  allowed: boolean;
  code?: ProjectIntelligenceAccessReasonCode;
  message?: string;
}

export type ProjectIntelligenceAccessReasonCode =
  | "unauthorized"
  | "workspace_not_assigned"
  | "subscription_inactive"
  | "licence_suspended"
  | "engineering_os_not_installed"
  | "application_not_installed"
  | "seat_not_assigned"
  | "role_not_assigned"
  | "permission_denied"
  | "feature_disabled"
  | ProjectIntelligenceErrorCode;

function denied(code: ProjectIntelligenceAccessReasonCode, message: string): AccessDecision {
  return { allowed: false, code, message };
}

/**
 * Evaluates the complete Project Intelligence dependency chain. Every stage
 * must be explicitly confirmed by the caller; an unknown stage is denied.
 */
export function evaluateProjectIntelligenceAccess(
  context: AccessContext,
  required: ProjectIntelligencePermission = "read",
): AccessDecision {
  if (!context.principalId || !context.tenantId || context.tenantActive !== true) {
    return denied("unauthorized", "An active tenant-scoped principal is required");
  }
  if (!context.workspaceId || context.workspaceAssigned !== true) {
    return denied("workspace_not_assigned", "An assigned workspace is required");
  }
  if (context.subscriptionActive !== true) {
    return denied("subscription_inactive", "An active subscription is required");
  }
  if (context.licenceActive !== true) {
    return denied("licence_suspended", "An active licence is required");
  }
  if (context.engineeringOsInstalled !== true) {
    return denied("engineering_os_not_installed", "Engineering OS must be installed");
  }
  if (context.applicationInstalled !== true) {
    return denied("application_not_installed", "Project Intelligence must be installed");
  }
  if (context.seatAssigned !== true) {
    return denied("seat_not_assigned", "A Project Intelligence seat is required");
  }
  if (context.roleAssigned !== true) {
    return denied("role_not_assigned", "A Project Intelligence role is required");
  }
  if (context.featureEnabled !== true) {
    return denied("feature_disabled", "The requested Project Intelligence feature is unavailable");
  }
  if (!context.permissions.includes("read")) {
    return denied("permission_denied", "Project Intelligence read access is required");
  }
  if (required === "admin" && !context.permissions.includes("admin")) {
    return denied("project_intelligence_admin_required", "Project Intelligence admin access is required");
  }
  if (required === "migration" && !context.permissions.includes("migration")) {
    return denied("project_intelligence_migration_access_denied", "Project Intelligence migration access is required");
  }
  return { allowed: true };
}

export const evaluateAccess = evaluateProjectIntelligenceAccess;

function requireAccess(context: AccessContext, required: ProjectIntelligencePermission): void {
  const decision = evaluateProjectIntelligenceAccess(context, required);
  if (!decision.allowed) {
    throw new ProjectIntelligenceError("project_intelligence_access_denied", decision.message!, 403, {
      reasonCode: decision.code,
      required,
    });
  }
}

export const requireProjectIntelligenceAccess = (context: AccessContext): void => requireAccess(context, "read");
export const requireProjectIntelligenceAdmin = (context: AccessContext): void => requireAccess(context, "admin");
export const requireProjectIntelligenceMigrationAccess = (context: AccessContext): void => requireAccess(context, "migration");
