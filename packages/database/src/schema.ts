/**
 * Database table name constants and schema documentation.
 * Generated types live in ./types.ts (regenerate via `pnpm db:types`).
 */

export const TABLES = {
  TENANTS: "tenants",
  WORKSPACES: "workspaces",
  PROFILES: "profiles",
  ROLES: "roles",
  TENANT_MEMBERSHIPS: "tenant_memberships",
  WORKSPACE_MEMBERSHIPS: "workspace_memberships",
  INSTALLED_PLUGINS: "installed_plugins",
  AUDIT_EVENTS: "audit_events",
  COMMAND_CENTRE_SESSIONS: "command_centre_sessions",
  COMMAND_CENTRE_MESSAGES: "command_centre_messages",
  PLATFORM_SETTINGS: "platform_settings",
} as const;

export const RLS_POLICIES = {
  TENANT_ISOLATION: "tenant_isolation",
  WORKSPACE_ACCESS: "workspace_access",
  OWN_PROFILE: "own_profile",
} as const;
