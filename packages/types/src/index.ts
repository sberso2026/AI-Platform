/**
 * RTB AI OS — Shared Platform Types
 * Domain-driven type definitions used across all platform services and operating systems.
 */

// ─── Tenant & Organization ───────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  settings: TenantSettings;
  created_at: string;
  updated_at: string;
}

export type TenantStatus = "active" | "suspended" | "archived";

export interface TenantSettings {
  timezone?: string;
  locale?: string;
  branding?: TenantBranding;
  /** When true, owners/admins see Advanced Platform Tools in the sidebar (Batch 2.12) */
  showAdvancedPlatformTools?: boolean;
}

export interface TenantBranding {
  logo_url?: string;
  primary_color?: string;
  company_name?: string;
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export interface Workspace {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  type: WorkspaceType;
  status: WorkspaceStatus;
  settings: WorkspaceSettings;
  created_at: string;
  updated_at: string;
}

export type WorkspaceType = "default" | "project" | "department" | "sandbox";
export type WorkspaceStatus = "active" | "archived";

export interface WorkspaceSettings {
  default_operating_system?: OperatingSystemId;
  features?: Record<string, boolean>;
}

// ─── User & Identity ─────────────────────────────────────────────────────────

export interface PlatformUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  status: UserStatus;
  metadata: UserMetadata;
  created_at: string;
  updated_at: string;
}

export type UserStatus = "active" | "invited" | "suspended" | "deactivated";

export interface UserMetadata {
  job_title?: string;
  department?: string;
  phone?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  locale?: string;
  notifications_enabled?: boolean;
}

// ─── Roles & Permissions ───────────────────────────────────────────────────────

export interface Role {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: Permission[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  resource: PlatformResource;
  action: PlatformAction;
  scope?: PermissionScope;
}

export type PlatformResource =
  | "tenant"
  | "workspace"
  | "user"
  | "role"
  | "plugin"
  | "audit"
  | "settings"
  | "command_centre"
  | "ai_agent"
  | "workflow"
  | "knowledge"
  | "digital_twin"
  | "analytics"
  | "simulation"
  | "automation"
  | "engineering"
  | "commerce";

export type PlatformAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "execute"
  | "approve"
  | "admin"
  | "manage_subscriptions"
  | "manage_licences"
  | "manage_seats"
  | "manage_trials"
  | "manage_billing"
  | "manage_overrides"
  | "manage_products"
  | "manage_marketplace";

export type PermissionScope = "own" | "workspace" | "tenant" | "platform";

export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role_id: string;
  status: MembershipStatus;
  invited_at?: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
}

export type MembershipStatus = "pending" | "active" | "suspended";

export interface WorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role_id: string;
  created_at: string;
  updated_at: string;
}

// ─── Operating Systems ───────────────────────────────────────────────────────

export type OperatingSystemId =
  | "platform"
  | "business"
  | "engineering"
  | "industrial"
  | "fleet"
  | "infrastructure"
  | "smart-building"
  | "smart-city"
  | "autonomous";

export interface OperatingSystem {
  id: OperatingSystemId;
  name: string;
  description: string;
  icon: string;
  status: "available" | "installed" | "coming_soon";
  version?: string;
  required_permissions?: Permission[];
}

// ─── Plugin Framework ────────────────────────────────────────────────────────

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  operating_system?: OperatingSystemId;
  entry_point: string;
  permissions: Permission[];
  routes?: PluginRoute[];
  navigation?: PluginNavItem[];
  settings_schema?: Record<string, unknown>;
}

export interface PluginRoute {
  path: string;
  component: string;
  title: string;
  permissions?: Permission[];
}

export interface PluginNavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  group?: string;
  order?: number;
  permissions?: Permission[];
}

export interface InstalledPlugin {
  id: string;
  tenant_id: string;
  manifest: PluginManifest;
  status: PluginStatus;
  config: Record<string, unknown>;
  installed_at: string;
  updated_at: string;
}

export type PluginStatus = "active" | "disabled" | "error";

// ─── Audit ───────────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "approve"
  | "reject"
  | "execute"
  | "export"
  | "import";

// ─── AI Command Centre ───────────────────────────────────────────────────────

export interface CommandCentreSession {
  id: string;
  tenant_id: string;
  workspace_id: string;
  user_id: string;
  title?: string;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export type SessionStatus = "active" | "archived";

export interface CommandCentreMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  metadata?: MessageMetadata;
  created_at: string;
}

export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface MessageMetadata {
  model?: string;
  tokens?: number;
  tool_calls?: ToolCall[];
  citations?: Citation[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface Citation {
  source_id: string;
  title: string;
  excerpt: string;
  score?: number;
}

// ─── Platform Navigation ─────────────────────────────────────────────────────

/** Minimum role tier required to see a nav item in the sidebar (Batch 2.12) */
export type NavTier = "viewer" | "engineer" | "manager" | "admin";

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  group?: NavGroup;
  badge?: string;
  permissions?: Permission[];
  children?: NavItem[];
  /** Minimum tier to show in sidebar; defaults to engineer for engineering groups */
  audience?: NavTier;
  /** Route exists but is omitted from sidebar (advanced/legacy routes) */
  sidebarHidden?: boolean;
}

export type NavGroup =
  | "platform"
  | "platform_advanced"
  | "intelligence"
  | "platform_intelligence"
  | "engineering"
  | "engineering_registers"
  | "engineering_admin"
  | "reference_os"
  | "kernel"
  | "operations"
  | "administration";

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiMeta {
  page?: number;
  per_page?: number;
  total?: number;
  has_more?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: Required<Pick<ApiMeta, "page" | "per_page" | "total" | "has_more">>;
}

// ─── Session Context ─────────────────────────────────────────────────────────

export interface PlatformContext {
  user: PlatformUser;
  tenant: Tenant;
  workspace: Workspace;
  permissions: Permission[];
  operating_systems: OperatingSystemId[];
}

export * from "./kernel";
export * from "./intelligence";
export * from "./engineering";
export * from "./engineering-registers";
export * from "./engineering-api-contracts";
export * from "./engineering-event-contracts";
export * from "./engineering-domain";
export * from "./engineering-modules";
export * from "./project-intelligence-integration";
export * from "./commerce";
export * from "./os-runtime";
