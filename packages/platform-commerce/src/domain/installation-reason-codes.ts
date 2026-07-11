/** Installation workflow error codes */
export const InstallationErrorCode = {
  INVALID_INSTALLATION_TRANSITION: "invalid_installation_transition",
  ACTIVE_DEPENDENCIES_EXIST: "active_dependencies_exist",
  DEPENDENCY_MISSING: "dependency_missing",
  DEPENDENCY_VERSION_INCOMPATIBLE: "dependency_version_incompatible",
  PARENT_OS_NOT_INSTALLED: "parent_os_not_installed",
  LICENCE_MISSING: "licence_missing",
  SUBSCRIPTION_INACTIVE: "subscription_inactive",
  WORKSPACE_LIMIT_EXCEEDED: "workspace_limit_exceeded",
  SEAT_LIMIT_EXCEEDED: "seat_limit_exceeded",
  INSTALLATION_CONFLICT: "installation_conflict",
  INSTALLATION_NOT_ACTIVE: "installation_not_active",
  INSTALLATION_NOT_FOUND: "installation_not_found",
  PROVISIONING_FAILED: "provisioning_failed",
  PERMISSION_DENIED: "installation_permission_denied",
} as const;

export type InstallationErrorCode = (typeof InstallationErrorCode)[keyof typeof InstallationErrorCode];
