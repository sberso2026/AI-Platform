import type { NavItem, NavTier, Permission } from "@rtb/types";

export const NAV_TIER_RANK: Record<NavTier, number> = {
  viewer: 0,
  engineer: 1,
  manager: 2,
  admin: 3,
};

export const SHOW_ADVANCED_PLATFORM_TOOLS_KEY = "showAdvancedPlatformTools";

/** Legacy route — redirects to Installed Products */
export const LEGACY_OPERATING_SYSTEMS_ROUTE = "/operating-systems";

/** Simplified System Administration routes */
export const PLATFORM_ADMIN_ROUTES = [
  "/system/products",
  "/system/subscriptions",
  "/system/licenses",
  "/system/licenses-seats",
  "/system/seats",
  "/system/usage",
  "/system/billing",
  "/system/subscription-billing",
  "/system/marketplace",
  "/system/growth-credits",
  "/system/analytics",
  "/system/customers",
  "/system/commerce-audit",
  LEGACY_OPERATING_SYSTEMS_ROUTE,
  "/workspaces",
  "/platform/users-permissions",
  "/platform/integrations",
  "/platform/health",
  "/platform/audit",
  "/platform/settings",
] as const;

/** Owner-only commerce administration routes */
export const OWNER_COMMERCE_ROUTES = [
  "/system/billing",
  "/system/subscription-billing",
  "/system/growth-credits",
  "/system/analytics",
] as const;

/** Manager-tier platform admin routes */
export const PLATFORM_MANAGER_ROUTES = [
  "/platform/users-permissions",
  "/platform/health",
  "/platform/audit",
] as const;

export const ADVANCED_PLATFORM_HUB_ROUTE = "/platform/advanced";

/** Internal platform routes that require admin + advanced access */
export const ADVANCED_INTERNAL_ROUTES = [
  "/platform/ai-director",
  "/platform/agents",
  "/platform/agent-runs",
  "/platform/tools",
  "/platform/capabilities",
  "/platform/policies",
  "/platform/prompts",
  "/platform/models",
  "/platform/costs",
  "/platform/observability",
  "/platform/features",
  "/platform/secrets",
  "/platform/evaluations",
  "/platform/events",
  "/platform/jobs",
  "/platform/workflows",
  "/platform/knowledge",
  "/platform/memory",
  "/platform/twins",
  "/platform/api-gateway",
  "/platform/notifications",
  "/platform/telemetry",
  "/platform/plugins",
  "/command-centre",
  "/dashboard",
  "/plugins",
  "/users",
  "/roles",
  "/audit",
  "/settings",
] as const;

export interface AdvancedToolCategory {
  id: string;
  label: string;
  description: string;
  items: NavItem[];
}

export interface SidebarNavContext {
  roleSlug: string;
  tier: NavTier;
  permissions: Permission[];
  showAdvancedInSidebar: boolean;
  hasPermission: (resource: string, action: string) => boolean;
}

export function resolveNavTier(roleSlug: string): NavTier {
  if (roleSlug === "owner" || roleSlug === "admin") return "admin";
  if (roleSlug === "engineering_manager" || roleSlug === "manager") return "manager";
  if (roleSlug === "viewer") return "viewer";
  return "engineer";
}

export function hasMinimumNavTier(userTier: NavTier, required: NavTier): boolean {
  return NAV_TIER_RANK[userTier] >= NAV_TIER_RANK[required];
}

export function isPlatformAdmin(roleSlug: string): boolean {
  return resolveNavTier(roleSlug) === "admin";
}

export function defaultNavAudience(item: NavItem): NavTier {
  if (item.audience) return item.audience;
  const group = item.group ?? "platform";
  if (group === "engineering" || group === "engineering_registers") return "viewer";
  if (group === "engineering_admin") return "manager";
  if (group === "platform" || group === "platform_advanced") return "admin";
  return "admin";
}

export function isOwnerOnlyCommerceRoute(pathname: string): boolean {
  return OWNER_COMMERCE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function canSeeNavItem(item: NavItem, context: SidebarNavContext): boolean {
  if (item.sidebarHidden) return false;

  if (
    (item.id === "billing" ||
      item.id === "growth-credits" ||
      item.id === "commerce-analytics" ||
      item.id === "subscription-billing") &&
    context.roleSlug !== "owner"
  ) {
    return false;
  }

  const requiredTier = defaultNavAudience(item);
  if (!hasMinimumNavTier(context.tier, requiredTier)) return false;

  if (item.group === "platform_advanced" && !context.showAdvancedInSidebar) {
    return false;
  }

  if (item.permissions?.length) {
    if (hasMinimumNavTier(context.tier, "admin")) return true;
    return item.permissions.every((p) =>
      context.hasPermission(p.resource, p.action)
    );
  }

  return true;
}

export function filterSidebarNavigation(
  items: NavItem[],
  context: SidebarNavContext
): NavItem[] {
  return items.filter((item) => canSeeNavItem(item, context));
}

export function requiresAdvancedPlatformAccess(pathname: string): boolean {
  if (pathname === ADVANCED_PLATFORM_HUB_ROUTE) return true;
  return ADVANCED_INTERNAL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function canAccessPlatformRoute(
  pathname: string,
  context: Pick<SidebarNavContext, "tier" | "roleSlug">
): boolean {
  if (isOwnerOnlyCommerceRoute(pathname) && context.roleSlug !== "owner") {
    return false;
  }

  if (
    pathname === "/system/products" ||
    pathname.startsWith("/system/products/")
  ) {
    return hasMinimumNavTier(context.tier, "admin");
  }

  if (
    pathname === "/system/licenses-seats" ||
    pathname === "/system/usage" ||
    pathname === "/system/subscriptions" ||
    pathname === "/system/licenses" ||
    pathname === "/system/seats" ||
    pathname === "/system/marketplace" ||
    pathname === "/system/customers" ||
    pathname.startsWith("/system/licenses-seats/") ||
    pathname.startsWith("/system/usage/") ||
    pathname.startsWith("/system/subscriptions/") ||
    pathname.startsWith("/system/licenses/") ||
    pathname.startsWith("/system/seats/") ||
    pathname.startsWith("/system/marketplace/") ||
    pathname.startsWith("/system/customers/")
  ) {
    return hasMinimumNavTier(context.tier, "admin");
  }

  if (!pathname.startsWith("/platform/") && !ADVANCED_INTERNAL_ROUTES.includes(pathname as (typeof ADVANCED_INTERNAL_ROUTES)[number])) {
    if (
      pathname === LEGACY_OPERATING_SYSTEMS_ROUTE ||
      pathname === "/workspaces"
    ) {
      return hasMinimumNavTier(context.tier, "admin");
    }
    return true;
  }

  if (pathname === ADVANCED_PLATFORM_HUB_ROUTE || requiresAdvancedPlatformAccess(pathname)) {
    return hasMinimumNavTier(context.tier, "admin");
  }

  if (
    PLATFORM_MANAGER_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    return hasMinimumNavTier(context.tier, "manager");
  }

  if (
    pathname === "/platform/integrations" ||
    pathname === "/platform/settings" ||
    pathname.startsWith("/platform/integrations/") ||
    pathname.startsWith("/platform/settings/")
  ) {
    return hasMinimumNavTier(context.tier, "admin");
  }

  if (pathname === LEGACY_OPERATING_SYSTEMS_ROUTE || pathname === "/workspaces") {
    return hasMinimumNavTier(context.tier, "admin");
  }

  return true;
}

export function buildAdvancedToolCategories(items: NavItem[]): AdvancedToolCategory[] {
  const byId = new Map(items.map((item) => [item.id, item]));

  const pick = (...ids: string[]) =>
    ids.map((id) => byId.get(id)).filter((item): item is NavItem => Boolean(item));

  return [
    {
      id: "ai_runtime",
      label: "AI Runtime",
      description: "Agent orchestration, models, prompts, and execution.",
      items: pick(
        "ai-director",
        "agents",
        "agent-runs",
        "tools",
        "capabilities",
        "models",
        "prompts"
      ),
    },
    {
      id: "governance",
      label: "Governance",
      description: "Policies, costs, secrets, evaluations, and feature controls.",
      items: pick("policies", "costs", "secrets", "evaluations", "feature-flags"),
    },
    {
      id: "automation",
      label: "Automation",
      description: "Workflows, background jobs, and event processing.",
      items: pick("workflows", "jobs", "events"),
    },
    {
      id: "data_knowledge",
      label: "Data & Knowledge",
      description: "Knowledge graph, memory, and digital twins.",
      items: pick("knowledge", "memory", "twins"),
    },
    {
      id: "integrations",
      label: "Integrations",
      description: "Gateways, notifications, telemetry, and plugins.",
      items: pick("api-gateway", "notifications-kernel", "telemetry", "plugin-registry"),
    },
    {
      id: "monitoring",
      label: "Monitoring",
      description: "Observability and platform telemetry.",
      items: pick("observability"),
    },
    {
      id: "developer_tools",
      label: "Developer Tools",
      description: "Legacy admin routes and internal platform monitors.",
      items: pick("command-centre", "dashboard", "plugins", "users", "roles", "audit", "settings"),
    },
  ].filter((category) => category.items.length > 0);
}

export function shouldIncludePlatformSearchResults(context: SidebarNavContext): boolean {
  return hasMinimumNavTier(context.tier, "admin") && context.showAdvancedInSidebar;
}
