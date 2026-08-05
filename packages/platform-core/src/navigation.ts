import type { NavItem } from "@rtb/types";

/** Preferred display order for sidebar groups (Batch 2.07) */
export const NAV_GROUP_ORDER = [
  "engineering",
  "engineering_registers",
  "engineering_admin",
  "reference_os",
  "platform",
  "platform_advanced",
  "intelligence",
  "platform_intelligence",
  "kernel",
  "administration",
  "operations",
] as const;

/** Phase 4 System Administration — tenant-facing customer administration portal */
export const PLATFORM_NAVIGATION: NavItem[] = [
  {
    id: "platform-home",
    label: "Home",
    icon: "Home",
    href: "/platform/home",
    group: "platform",
    audience: "viewer",
  },
  {
    id: "installed-products",
    label: "Installed Products",
    icon: "Boxes",
    href: "/system/products",
    group: "platform",
    audience: "admin",
  },
  {
    id: "subscription-billing",
    label: "Subscription & Billing",
    icon: "CreditCard",
    href: "/system/subscription-billing",
    group: "platform",
    audience: "admin",
  },
  {
    id: "licenses-seats",
    label: "Licences & Seats",
    icon: "KeyRound",
    href: "/system/licenses-seats",
    group: "platform",
    audience: "admin",
  },
  {
    id: "usage",
    label: "Usage",
    icon: "BarChart3",
    href: "/system/usage",
    group: "platform",
    audience: "admin",
  },
  {
    id: "growth-credits",
    label: "Growth Credits",
    icon: "Sparkles",
    href: "/system/growth-credits",
    group: "platform",
    audience: "admin",
  },
  {
    id: "workspaces",
    label: "Workspaces",
    icon: "FolderKanban",
    href: "/workspaces",
    group: "platform",
    audience: "admin",
  },
  {
    id: "users-permissions",
    label: "Users & Permissions",
    icon: "Users",
    href: "/platform/users-permissions",
    group: "platform",
    audience: "manager",
    permissions: [{ resource: "user", action: "read" }],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: "Puzzle",
    href: "/platform/integrations",
    group: "platform",
    audience: "admin",
  },
  {
    id: "platform-health",
    label: "System Health",
    icon: "Activity",
    href: "/platform/health",
    group: "platform",
    audience: "manager",
  },
  {
    id: "platform-audit",
    label: "Audit Logs",
    icon: "ScrollText",
    href: "/platform/audit",
    group: "platform",
    audience: "manager",
    permissions: [{ resource: "audit", action: "read" }],
  },
  {
    id: "platform-settings",
    label: "Settings",
    icon: "Settings",
    href: "/platform/settings",
    group: "platform",
    audience: "admin",
    permissions: [{ resource: "settings", action: "read" }],
  },
];

/** Legacy platform routes — remain reachable but hidden from sidebar */
export const LEGACY_PLATFORM_NAVIGATION: NavItem[] = [
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: "RefreshCw",
    href: "/system/subscriptions",
    group: "platform",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "licenses",
    label: "Licences",
    icon: "KeyRound",
    href: "/system/licenses",
    group: "platform",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "seats",
    label: "Seats",
    icon: "Users",
    href: "/system/seats",
    group: "platform",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "billing",
    label: "Billing",
    icon: "CreditCard",
    href: "/system/billing",
    group: "platform",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "Store",
    href: "/system/marketplace",
    group: "platform",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "commerce-analytics",
    label: "Analytics",
    icon: "LineChart",
    href: "/system/analytics",
    group: "platform",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "customers",
    label: "Customers",
    icon: "Building2",
    href: "/system/customers",
    group: "platform",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "commerce-audit",
    label: "Commerce Audit",
    icon: "ScrollText",
    href: "/system/commerce-audit",
    group: "platform",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "command-centre",
    label: "System Monitor",
    icon: "Terminal",
    href: "/command-centre",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "dashboard",
    label: "System Health Overview",
    icon: "LayoutDashboard",
    href: "/dashboard",
    group: "platform",
    sidebarHidden: true,
    audience: "admin",
  },
];

export const ADVANCED_SIDEBAR_NAVIGATION: NavItem[] = [
  {
    id: "platform-advanced",
    label: "Advanced Platform Tools",
    icon: "Wrench",
    href: "/platform/advanced",
    group: "platform_advanced",
    audience: "admin",
  },
];

export const KERNEL_NAVIGATION: NavItem[] = [
  {
    id: "ai-director",
    label: "AI Director",
    icon: "Brain",
    href: "/platform/ai-director",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "agents",
    label: "Agents",
    icon: "Bot",
    href: "/platform/agents",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "agent-runs",
    label: "Agent Runs",
    icon: "Activity",
    href: "/platform/agent-runs",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "events",
    label: "Events",
    icon: "Zap",
    href: "/platform/events",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "jobs",
    label: "Background Jobs",
    icon: "Clock",
    href: "/platform/jobs",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "workflows",
    label: "Workflows",
    icon: "GitBranch",
    href: "/platform/workflows",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "knowledge",
    label: "Knowledge Graph",
    icon: "Network",
    href: "/platform/knowledge",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "memory",
    label: "AI Memory",
    icon: "Database",
    href: "/platform/memory",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "twins",
    label: "Digital Twins",
    icon: "Layers",
    href: "/platform/twins",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "api-gateway",
    label: "API Gateway",
    icon: "Key",
    href: "/platform/api-gateway",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "notifications-kernel",
    label: "Notifications",
    icon: "Bell",
    href: "/platform/notifications",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "telemetry",
    label: "Telemetry",
    icon: "Radio",
    href: "/platform/telemetry",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "plugin-registry",
    label: "Plugin Registry",
    icon: "Puzzle",
    href: "/platform/plugins",
    group: "kernel",
    sidebarHidden: true,
    audience: "admin",
  },
];

export const INTELLIGENCE_NAVIGATION: NavItem[] = [
  {
    id: "capabilities",
    label: "Capabilities",
    icon: "Sparkles",
    href: "/platform/capabilities",
    group: "platform_intelligence",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "tools",
    label: "Tool Registry",
    icon: "Wrench",
    href: "/platform/tools",
    group: "platform_intelligence",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "models",
    label: "Model Registry",
    icon: "Cpu",
    href: "/platform/models",
    group: "platform_intelligence",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "prompts",
    label: "Prompt Registry",
    icon: "FileText",
    href: "/platform/prompts",
    group: "platform_intelligence",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "policies",
    label: "Policy Engine",
    icon: "ShieldCheck",
    href: "/platform/policies",
    group: "platform_intelligence",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "costs",
    label: "Cost Engine",
    icon: "DollarSign",
    href: "/platform/costs",
    group: "platform_intelligence",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "observability",
    label: "Observability",
    icon: "LineChart",
    href: "/platform/observability",
    group: "platform_intelligence",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "feature-flags",
    label: "Feature Flags",
    icon: "ToggleLeft",
    href: "/platform/features",
    group: "platform_intelligence",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "secrets",
    label: "Secrets",
    icon: "Lock",
    href: "/platform/secrets",
    group: "platform_intelligence",
    sidebarHidden: true,
    audience: "admin",
  },
  {
    id: "evaluations",
    label: "Evaluations",
    icon: "ClipboardCheck",
    href: "/platform/evaluations",
    group: "platform_intelligence",
    sidebarHidden: true,
    audience: "admin",
  },
];

export const ENGINEERING_NAVIGATION: NavItem[] = [
  {
    id: "eng-dashboard",
    label: "Engineering Command Center",
    icon: "LayoutDashboard",
    href: "/engineering",
    group: "engineering",
    audience: "viewer",
  },
  {
    id: "eng-projects",
    label: "Projects",
    icon: "FolderKanban",
    href: "/engineering/projects",
    group: "engineering",
    audience: "viewer",
  },
  {
    id: "eng-assets",
    label: "Assets",
    icon: "Boxes",
    href: "/engineering/assets",
    group: "engineering",
    audience: "viewer",
  },
  {
    id: "eng-documents",
    label: "Documents",
    icon: "FileText",
    href: "/engineering/documents",
    group: "engineering",
    audience: "viewer",
  },
  {
    id: "eng-ai",
    label: "AI Workspace",
    icon: "Brain",
    href: "/engineering/ai",
    group: "engineering",
    audience: "engineer",
  },
  {
    id: "eng-search",
    label: "Search",
    icon: "Search",
    href: "/engineering/search",
    group: "engineering",
    audience: "viewer",
  },
  {
    id: "eng-reports",
    label: "Reports",
    icon: "ClipboardList",
    href: "/engineering/reports",
    group: "engineering",
    audience: "engineer",
  },
  {
    id: "eng-decisions",
    label: "Decisions",
    icon: "Scale",
    href: "/engineering/decisions",
    group: "engineering_registers",
    audience: "viewer",
  },
  {
    id: "eng-actions",
    label: "Actions",
    icon: "CheckSquare",
    href: "/engineering/actions",
    group: "engineering_registers",
    audience: "viewer",
  },
  {
    id: "eng-risks",
    label: "Risks",
    icon: "AlertTriangle",
    href: "/engineering/risks",
    group: "engineering_registers",
    audience: "viewer",
  },
  {
    id: "eng-issues",
    label: "Issues",
    icon: "CircleAlert",
    href: "/engineering/issues",
    group: "engineering_registers",
    audience: "viewer",
  },
  {
    id: "eng-tqs",
    label: "Technical Queries",
    icon: "MessageSquare",
    href: "/engineering/technical-queries",
    group: "engineering_registers",
    audience: "viewer",
  },
  {
    id: "eng-lessons",
    label: "Lessons Learned",
    icon: "BookOpen",
    href: "/engineering/lessons",
    group: "engineering_registers",
    audience: "viewer",
  },
  {
    id: "eng-timeline",
    label: "Timeline",
    icon: "History",
    href: "/engineering/timeline",
    group: "engineering_registers",
    audience: "viewer",
  },
  {
    id: "eng-activity",
    label: "Activity",
    icon: "Activity",
    href: "/engineering/activity",
    group: "engineering_registers",
    audience: "viewer",
  },
  {
    id: "eng-disciplines",
    label: "Disciplines",
    icon: "Layers",
    href: "/engineering/disciplines",
    group: "engineering_admin",
    audience: "manager",
    permissions: [{ resource: "engineering", action: "admin" }],
  },
  {
    id: "eng-companies",
    label: "Companies",
    icon: "Building2",
    href: "/engineering/companies",
    group: "engineering_admin",
    audience: "manager",
    permissions: [{ resource: "engineering", action: "admin" }],
  },
  {
    id: "eng-settings",
    label: "Engineering Settings",
    icon: "Settings",
    href: "/engineering/settings",
    group: "engineering_admin",
    audience: "manager",
    permissions: [{ resource: "engineering", action: "admin" }],
  },
  {
    id: "eng-health",
    label: "Health Check",
    icon: "Radio",
    href: "/engineering/health",
    group: "engineering_admin",
    audience: "manager",
    permissions: [{ resource: "engineering", action: "admin" }],
  },
  {
    id: "eng-test-runner",
    label: "Test Runner",
    icon: "ClipboardCheck",
    href: "/engineering/test-runner",
    group: "engineering_admin",
    audience: "manager",
    permissions: [{ resource: "engineering", action: "admin" }],
  },
];

export const ADMIN_NAVIGATION: NavItem[] = [
  {
    id: "plugins",
    label: "Plugins",
    icon: "Puzzle",
    href: "/plugins",
    group: "administration",
    sidebarHidden: true,
    audience: "admin",
    permissions: [{ resource: "plugin", action: "read" }],
  },
  {
    id: "users",
    label: "Users",
    icon: "Users",
    href: "/users",
    group: "administration",
    sidebarHidden: true,
    audience: "admin",
    permissions: [{ resource: "user", action: "read" }],
  },
  {
    id: "roles",
    label: "Roles",
    icon: "Shield",
    href: "/roles",
    group: "administration",
    sidebarHidden: true,
    audience: "admin",
    permissions: [{ resource: "role", action: "read" }],
  },
  {
    id: "audit",
    label: "Audit Log",
    icon: "ScrollText",
    href: "/audit",
    group: "administration",
    sidebarHidden: true,
    audience: "manager",
    permissions: [{ resource: "audit", action: "read" }],
  },
  {
    id: "settings",
    label: "Platform Settings",
    icon: "Settings",
    href: "/settings",
    group: "administration",
    sidebarHidden: true,
    audience: "admin",
    permissions: [{ resource: "settings", action: "read" }],
  },
];

/** Certification-only Reference OS nav — gated by activeOperatingSystemIds */
export const REFERENCE_OS_NAVIGATION: NavItem[] = [
  {
    id: "reference-os-home",
    label: "Reference Home",
    icon: "Box",
    href: "/reference-os",
    group: "reference_os",
    audience: "viewer",
  },
];

/** All registered routes — engineering-first ordering */
export const FULL_NAVIGATION: NavItem[] = [
  ...ENGINEERING_NAVIGATION,
  ...REFERENCE_OS_NAVIGATION,
  ...PLATFORM_NAVIGATION,
  ...ADVANCED_SIDEBAR_NAVIGATION,
  ...LEGACY_PLATFORM_NAVIGATION,
  ...INTELLIGENCE_NAVIGATION,
  ...KERNEL_NAVIGATION,
  ...ADMIN_NAVIGATION,
];

/** Items linked from Advanced Platform Tools hub */
export const ADVANCED_PLATFORM_NAVIGATION: NavItem[] = [
  ...KERNEL_NAVIGATION,
  ...INTELLIGENCE_NAVIGATION,
  ...LEGACY_PLATFORM_NAVIGATION,
  ...ADMIN_NAVIGATION.filter((item) => item.sidebarHidden),
];

export function filterNavigation(
  items: NavItem[],
  hasPermission: (resource: string, action: string) => boolean
): NavItem[] {
  return items.filter((item) => {
    if (!item.permissions?.length) return true;
    return item.permissions.every((p) => hasPermission(p.resource, p.action));
  });
}

export function groupNavigation(items: NavItem[]): Record<string, NavItem[]> {
  const groups = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const group = item.group ?? "platform";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  const ordered: Record<string, NavItem[]> = {};
  for (const key of NAV_GROUP_ORDER) {
    if (groups[key]?.length) ordered[key] = groups[key];
  }
  for (const [key, value] of Object.entries(groups)) {
    if (!ordered[key]) ordered[key] = value;
  }
  return ordered;
}

export const NAV_GROUP_LABELS: Record<string, string> = {
  engineering: "Engineering OS",
  engineering_registers: "Engineering Registers",
  engineering_admin: "Engineering Administration",
  reference_os: "Reference OS",
  platform: "System Administration",
  platform_advanced: "Advanced Platform Tools",
  intelligence: "Intelligence",
  platform_intelligence: "Platform Intelligence",
  kernel: "Platform Kernel",
  operations: "Operations",
  administration: "Administration",
};

/**
 * Sidebar sections for Batch 2.08 — collapsible groups.
 * Platform internals are excluded from platform_admin (Batch 2.12).
 */
export interface SidebarSection {
  id: string;
  label: string;
  /** Underlying nav group keys included in this section */
  groups: readonly string[];
  defaultExpanded: boolean;
  /** Section only rendered for platform admins when true */
  adminOnly?: boolean;
}

export const SIDEBAR_SECTIONS: readonly SidebarSection[] = [
  {
    id: "engineering",
    label: "Engineering OS",
    groups: ["engineering"],
    defaultExpanded: true,
  },
  {
    id: "engineering_registers",
    label: "Engineering Registers",
    groups: ["engineering_registers"],
    defaultExpanded: true,
  },
  {
    id: "engineering_admin",
    label: "Engineering Administration",
    groups: ["engineering_admin"],
    defaultExpanded: false,
  },
  {
    id: "reference_os",
    label: "Reference OS",
    groups: ["reference_os"],
    defaultExpanded: true,
  },
  {
    id: "platform_admin",
    label: "System Administration",
    groups: ["platform"],
    defaultExpanded: false,
  },
  {
    id: "platform_advanced",
    label: "Advanced Platform Tools",
    groups: ["platform_advanced"],
    defaultExpanded: false,
    adminOnly: true,
  },
] as const;

export const SIDEBAR_GROUP_STATE_KEY = "rtb.sidebar.groupState";
export const SIDEBAR_SCROLL_KEY = "rtb.sidebar.scrollTop";
export const SIDEBAR_COLLAPSED_KEY = "rtb.sidebar.collapsed";

export function getDefaultSidebarGroupState(): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  for (const section of SIDEBAR_SECTIONS) {
    state[section.id] = section.defaultExpanded;
  }
  return state;
}

/** Merge stored group expand state with defaults (unknown keys ignored). */
export function parseSidebarGroupState(
  raw: string | null | undefined
): Record<string, boolean> {
  const defaults = getDefaultSidebarGroupState();
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const next = { ...defaults };
    for (const section of SIDEBAR_SECTIONS) {
      if (typeof parsed[section.id] === "boolean") {
        next[section.id] = parsed[section.id] as boolean;
      }
    }
    return next;
  } catch {
    return defaults;
  }
}

/** Collect ordered nav items for a sidebar section from a grouped map. */
export function itemsForSidebarSection(
  section: SidebarSection,
  grouped: Record<string, NavItem[]>
): NavItem[] {
  const items: NavItem[] = [];
  for (const key of section.groups) {
    const list = grouped[key];
    if (list?.length) items.push(...list);
  }
  return items;
}

