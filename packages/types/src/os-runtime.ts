/**
 * RTB AI Platform OS runtime contracts (Phase 7A).
 * Lifecycle aligns with commerce ProductInstallationStatus — do not invent a competing machine.
 */

import type { ProductInstallationStatus } from "./commerce";

/** Minimal permission shape (avoids circular import with index.ts). */
export interface OsManifestPermission {
  resource: string;
  action: string;
  scope?: string;
}

export type OsCatalogStatus = "available" | "coming_soon";

/** Installation lifecycle surfaced to OS runtime (maps from commerce). */
export type OperatingSystemLifecycleStatus =
  | "available"
  | "installing"
  | "active"
  | "suspended"
  | "upgrade_pending"
  | "rollback_pending"
  | "uninstall_pending"
  | "uninstalled"
  | "failed";

export interface CapabilityRegistration {
  id: string;
  description?: string;
}

export interface RouteRegistration {
  path: string;
  title: string;
  component?: string;
}

export interface NavigationRegistration {
  id: string;
  label: string;
  path: string;
  icon?: string;
  group?: string;
  order?: number;
}

export interface EventRegistration {
  type: string;
  description?: string;
}

export interface KnowledgeRegistration {
  namespace: string;
  description?: string;
}

export interface AgentRegistration {
  id: string;
  name: string;
  description?: string;
  certificationOnly?: boolean;
}

export interface FeatureManifest {
  id: string;
  name: string;
  description?: string;
  version: string;
  capabilities?: CapabilityRegistration[];
}

/**
 * Commerce / legacy installable unit under an OS.
 * Prefer ModuleManifest for Engineering OS product language (Phase 8A).
 */
export interface ApplicationManifest {
  id: string;
  name: string;
  description?: string;
  version: string;
  operatingSystemId: string;
  features?: FeatureManifest[];
  routes?: RouteRegistration[];
  navigation?: NavigationRegistration[];
  capabilities?: CapabilityRegistration[];
  agents?: AgentRegistration[];
}

/**
 * Engineering OS Module (Phase 8A).
 * Modules install under an Operating System. Commerce may still use application_key.
 */
export interface ModuleManifest extends ApplicationManifest {
  /** Stable module key (maps to commerce application_key when installed). */
  moduleKey: string;
  /** Permissions required to use the module */
  permissions?: OsManifestPermission[];
  /** Workspace visibility rules */
  workspaceVisibility?: "all" | "assigned" | "none";
  /** Search provider ids contributed by this module */
  searchProviders?: string[];
  /** AI capability ids contributed by this module */
  aiCapabilities?: string[];
  /** Event handler type prefixes (namespaced) */
  eventHandlers?: string[];
  /** When false, module is registered but not commercially enabled */
  enabled?: boolean;
  status?: "registered" | "preview" | "ga" | "deprecated";
}

export interface OperatingSystemManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  /** When true, package exists only for certification (e.g. reference-os). */
  certificationOnly?: boolean;
  catalogStatus?: OsCatalogStatus;
  permissions?: OsManifestPermission[];
  /** @deprecated Prefer modules for Engineering OS; retained for commerce/compat. */
  applications?: ApplicationManifest[];
  /** Phase 8A canonical installable units under this OS */
  modules?: ModuleManifest[];
  routes?: RouteRegistration[];
  navigation?: NavigationRegistration[];
  capabilities?: CapabilityRegistration[];
  events?: EventRegistration[];
  knowledge?: KnowledgeRegistration[];
  agents?: AgentRegistration[];
}

export interface InstallationContext {
  tenantId: string;
  installationId: string;
  productKey: string;
  operatingSystemId: string;
  status: OperatingSystemLifecycleStatus;
  workspaceIds: string[];
}

export interface EntitlementContext {
  tenantId: string;
  userId: string;
  operatingSystemId: string;
  /** @deprecated Prefer moduleKeys */
  applicationKeys: string[];
  /** Phase 8A module keys (same values as commerce application_key when bridged) */
  moduleKeys?: string[];
  featureKeys: string[];
  seatRole?: string;
}

export interface WorkspaceAssignment {
  workspaceId: string;
  operatingSystemId: string;
  installationId: string;
}

const INSTALLING: ReadonlySet<string> = new Set([
  "requested",
  "awaiting_entitlement",
  "awaiting_approval",
  "queued",
  "provisioning",
  "validating",
  "installing",
]);

/**
 * Map commerce installation status to OS runtime lifecycle view.
 */
export function mapCommerceStatusToOsLifecycle(
  status: ProductInstallationStatus | string | null | undefined,
): OperatingSystemLifecycleStatus {
  if (!status || status === "not_installed") return "available";
  if (INSTALLING.has(status)) return "installing";
  if (status === "active" || status === "degraded") return "active";
  if (status === "suspended") return "suspended";
  if (status === "upgrade_pending" || status === "upgrading") return "upgrade_pending";
  if (status === "rollback_pending" || status === "rolling_back") return "rollback_pending";
  if (status === "uninstall_pending" || status === "uninstalling") return "uninstall_pending";
  if (status === "uninstalled") return "uninstalled";
  if (status === "failed") return "failed";
  return "failed";
}

export function isOsNavigationVisible(lifecycle: OperatingSystemLifecycleStatus): boolean {
  return lifecycle === "active";
}

export function activeOperatingSystemIds(
  installations: Array<{ operatingSystemId: string; status: string }>,
): string[] {
  const ids = new Set<string>();
  for (const row of installations) {
    if (mapCommerceStatusToOsLifecycle(row.status) === "active") {
      ids.add(row.operatingSystemId);
    }
  }
  return [...ids];
}

export function resolveOsModules(manifest: OperatingSystemManifest): ModuleManifest[] {
  if (manifest.modules?.length) return manifest.modules;
  return (manifest.applications ?? []).map((app) => ({
    ...app,
    moduleKey: app.id,
  }));
}

export function moduleKeyOf(module: ModuleManifest): string {
  return module.moduleKey;
}

/** Engineering OS product key conventionally used in commerce. */
export const ENGINEERING_OS_PRODUCT_KEY = "engineering-os";

export const REFERENCE_OS_ID = "reference-os" as const;

export type RuntimeOperatingSystemId = string;
