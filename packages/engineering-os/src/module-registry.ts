/**
 * Phase 8A — Engineering OS module registry.
 * All modules register here; none may bypass Engineering OS.
 */
import type {
  EngineeringModuleRegistration,
  EngineeringModuleRegistrySnapshot,
  ModuleManifest,
  OperatingSystemManifest,
} from "@rtb/types";
import {
  ENGINEERING_INITIAL_MODULE_KEYS,
  assertModuleDoesNotBypassEngineeringOs,
  toModuleManifest,
} from "@rtb/types";

const OS_ID = "engineering" as const;

export const ENGINEERING_MODULE_REGISTRATIONS: EngineeringModuleRegistration[] = [
  {
    id: "project_intelligence",
    moduleKey: "project_intelligence",
    commerceApplicationKey: "project_intelligence",
    name: "Project Intelligence",
    description: "Documents, meetings, findings, and project decision support",
    version: "0.1.0",
    operatingSystemId: OS_ID,
    status: "registered",
    enabled: true,
    workspaceVisibility: "assigned",
    routes: [
      {
        path: "/engineering/apps/project-intelligence",
        title: "Project Intelligence",
        component: "ProjectIntelligenceHome",
      },
    ],
    navigation: [
      {
        id: "module-project-intelligence",
        label: "Project Intelligence",
        path: "/engineering/apps/project-intelligence",
        icon: "Brain",
        group: "engineering",
        order: 20,
      },
    ],
    permissions: [
      { resource: "engineering", action: "read" },
      { resource: "ai_agent", action: "execute" },
    ],
    searchProviders: ["project_intelligence.documents", "project_intelligence.meetings"],
    aiCapabilities: [
      "project_intelligence.grounded_answers",
      "project_intelligence.meeting_minutes",
    ],
    eventHandlers: [
      "project_intelligence.document.*",
      "project_intelligence.meeting.*",
    ],
    features: [
      { id: "documents", name: "Documents", version: "0.1.0" },
      { id: "meetings", name: "Meetings", version: "0.1.0" },
      { id: "findings", name: "Findings", version: "0.1.0" },
      { id: "reports", name: "Reports", version: "0.1.0" },
    ],
  },
  {
    id: "inspection_intelligence",
    moduleKey: "inspection_intelligence",
    commerceApplicationKey: "inspection_intelligence",
    name: "Inspection Intelligence",
    description: "Inspection planning and findings management",
    version: "0.0.0",
    operatingSystemId: OS_ID,
    status: "coming_soon",
    enabled: false,
    workspaceVisibility: "assigned",
    routes: [
      {
        path: "/engineering/apps/inspection-intelligence",
        title: "Inspection Intelligence",
        component: "InspectionIntelligenceHome",
      },
    ],
    navigation: [
      {
        id: "module-inspection-intelligence",
        label: "Inspection Intelligence",
        path: "/engineering/apps/inspection-intelligence",
        icon: "ClipboardCheck",
        group: "engineering",
        order: 21,
      },
    ],
    permissions: [{ resource: "engineering", action: "read" }],
    searchProviders: ["inspection_intelligence.findings"],
    aiCapabilities: ["inspection_intelligence.assist"],
    eventHandlers: ["inspection_intelligence.*"],
  },
  {
    id: "project_controls",
    moduleKey: "project_controls",
    commerceApplicationKey: "project_controls",
    name: "Project Controls",
    description: "Cost, schedule, and progress controls",
    version: "0.0.0",
    operatingSystemId: OS_ID,
    status: "coming_soon",
    enabled: false,
    workspaceVisibility: "assigned",
    routes: [
      {
        path: "/engineering/apps/project-controls",
        title: "Project Controls",
        component: "ProjectControlsHome",
      },
    ],
    navigation: [
      {
        id: "module-project-controls",
        label: "Project Controls",
        path: "/engineering/apps/project-controls",
        icon: "BarChart3",
        group: "engineering",
        order: 22,
      },
    ],
    permissions: [{ resource: "engineering", action: "read" }],
    searchProviders: ["project_controls.progress"],
    aiCapabilities: ["project_controls.forecast"],
    eventHandlers: ["project_controls.*"],
  },
  {
    id: "digital_twin",
    moduleKey: "digital_twin",
    commerceApplicationKey: "digital_twin",
    name: "Digital Twin",
    description: "Digital twin context for assets and locations",
    version: "0.0.0",
    operatingSystemId: OS_ID,
    status: "coming_soon",
    enabled: false,
    workspaceVisibility: "assigned",
    routes: [
      {
        path: "/engineering/apps/digital-twin",
        title: "Digital Twin",
        component: "DigitalTwinHome",
      },
    ],
    navigation: [
      {
        id: "module-digital-twin",
        label: "Digital Twin",
        path: "/engineering/apps/digital-twin",
        icon: "Box",
        group: "engineering",
        order: 23,
      },
    ],
    permissions: [
      { resource: "engineering", action: "read" },
      { resource: "digital_twin", action: "execute" },
    ],
    searchProviders: ["digital_twin.assets"],
    aiCapabilities: ["digital_twin.context"],
    eventHandlers: ["digital_twin.*"],
  },
];

export class EngineeringModuleRegistry {
  private readonly byKey = new Map<string, EngineeringModuleRegistration>();

  constructor(seed: EngineeringModuleRegistration[] = ENGINEERING_MODULE_REGISTRATIONS) {
    for (const mod of seed) {
      this.register(mod);
    }
  }

  register(registration: EngineeringModuleRegistration): void {
    assertModuleDoesNotBypassEngineeringOs(registration);
    if (this.byKey.has(registration.moduleKey)) {
      throw new Error(`Duplicate module registration: ${registration.moduleKey}`);
    }
    this.byKey.set(registration.moduleKey, registration);
  }

  get(moduleKey: string): EngineeringModuleRegistration | undefined {
    return this.byKey.get(moduleKey);
  }

  list(): EngineeringModuleRegistration[] {
    return [...this.byKey.values()];
  }

  listInitial(): EngineeringModuleRegistration[] {
    return this.list().filter((m) =>
      (ENGINEERING_INITIAL_MODULE_KEYS as string[]).includes(m.moduleKey),
    );
  }

  toManifests(): ModuleManifest[] {
    return this.list().map(toModuleManifest);
  }

  snapshot(): EngineeringModuleRegistrySnapshot {
    return {
      operatingSystemId: OS_ID,
      modules: this.list(),
      registeredAt: new Date().toISOString(),
    };
  }

  /** Bridge module keys to commerce application_key values. */
  commerceKeys(): string[] {
    return this.list().map((m) => m.commerceApplicationKey);
  }
}

export const defaultEngineeringModuleRegistry = new EngineeringModuleRegistry();

export function buildEngineeringOsManifest(
  registry: EngineeringModuleRegistry = defaultEngineeringModuleRegistry,
): OperatingSystemManifest {
  const modules = registry.toManifests();
  return {
    id: OS_ID,
    name: "Engineering OS",
    description:
      "First commercial Operating System on RTB AI Platform — shared engineering foundation and module host",
    version: "0.3.0",
    author: "RTB Engineering",
    certificationOnly: false,
    catalogStatus: "available",
    permissions: [
      { resource: "engineering", action: "admin" },
      { resource: "engineering", action: "read" },
      { resource: "engineering", action: "execute" },
      { resource: "ai_agent", action: "execute" },
      { resource: "knowledge", action: "execute" },
      { resource: "digital_twin", action: "execute" },
    ],
    routes: [
      { path: "/engineering", title: "Engineering Dashboard", component: "EngineeringDashboard" },
      { path: "/engineering/modules", title: "Module Launcher", component: "EngineeringModuleLauncher" },
      { path: "/engineering/projects", title: "Projects", component: "EngineeringProjects" },
      { path: "/engineering/assets", title: "Assets", component: "EngineeringAssets" },
      { path: "/engineering/documents", title: "Documents", component: "EngineeringDocuments" },
      { path: "/engineering/search", title: "Search", component: "EngineeringSearch" },
      { path: "/engineering/ai", title: "AI Workspace", component: "EngineeringAI" },
      { path: "/engineering/reports", title: "Reports", component: "EngineeringReports" },
      { path: "/engineering/settings", title: "Settings", component: "EngineeringSettings" },
      ...modules.flatMap((m) => m.routes ?? []),
    ],
    navigation: [
      {
        id: "eng-dashboard",
        label: "Dashboard",
        icon: "LayoutDashboard",
        path: "/engineering",
        group: "engineering",
        order: 1,
      },
      {
        id: "eng-modules",
        label: "Modules",
        icon: "Boxes",
        path: "/engineering/modules",
        group: "engineering",
        order: 2,
      },
      {
        id: "eng-projects",
        label: "Projects",
        icon: "FolderKanban",
        path: "/engineering/projects",
        group: "engineering",
        order: 3,
      },
      {
        id: "eng-search",
        label: "Search",
        icon: "Search",
        path: "/engineering/search",
        group: "engineering",
        order: 4,
      },
      {
        id: "eng-ai",
        label: "AI Workspace",
        icon: "Brain",
        path: "/engineering/ai",
        group: "engineering",
        order: 5,
      },
      ...modules.flatMap((m) => m.navigation ?? []),
    ],
    modules,
    // Commerce/compat mirror
    applications: modules.map(({ moduleKey: _mk, enabled: _e, status: _s, permissions: _p, workspaceVisibility: _w, searchProviders: _sp, aiCapabilities: _ai, eventHandlers: _eh, ...app }) => app),
    capabilities: [
      { id: "engineering_os", description: "Core Engineering Operating System" },
      { id: "engineering_module_host", description: "Host registered Engineering modules" },
      { id: "engineering_shared_domain", description: "Shared engineering domain model" },
      { id: "engineering_ai_framework", description: "Shared Engineering AI framework" },
    ],
    events: [
      { type: "engineering.module.registered", description: "Module registered with Engineering OS" },
      { type: "engineering.module.enabled", description: "Module enabled for tenant" },
      { type: "engineering.module.disabled", description: "Module disabled for tenant" },
    ],
    knowledge: [{ namespace: "engineering", description: "Engineering OS knowledge namespace" }],
  };
}

/** @deprecated Use ENGINEERING_MODULE_REGISTRATIONS / EngineeringModuleRegistry */
export const ENGINEERING_APPLICATIONS = ENGINEERING_MODULE_REGISTRATIONS.map((m) => ({
  app_key: m.commerceApplicationKey,
  name: m.name,
  description: m.description,
  version: m.version,
  status: m.status,
  enabled: Boolean(m.enabled),
  required_capabilities: [] as string[],
  required_permissions: (m.permissions ?? []).map((p) => `${p.resource}.${p.action}`),
  routes: (m.routes ?? []).map((r) => r.path),
}));
