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
    description: "Documents, meetings, findings, reporting, knowledge search, and reasoning",
    version: "1.0.0",
    operatingSystemId: OS_ID,
    status: "registered",
    enabled: true,
    workspaceVisibility: "assigned",
    permissions: [
      { resource: "engineering", action: "read" },
      { resource: "ai_agent", action: "execute" },
    ],
    searchProviders: [
      "project_intelligence.documents",
      "project_intelligence.meetings",
      "project_intelligence.findings",
      "project_intelligence.reports",
      "project_intelligence.knowledge",
      "project_intelligence.reasoning",
    ],
    aiCapabilities: [
      "project_intelligence.grounded_answers",
      "project_intelligence.meeting_minutes",
      "project_intelligence.findings_synthesis",
      "project_intelligence.reporting",
      "project_intelligence.knowledge_retrieval",
      "project_intelligence.reasoning_assistant",
    ],
    eventHandlers: [
      "project_intelligence.document.*",
      "project_intelligence.meeting.*",
      "project_intelligence.findings.*",
      "project_intelligence.reporting.*",
      "project_intelligence.knowledge.*",
      "project_intelligence.reasoning.*",
    ],
    routes: [
      {
        path: "/engineering/apps/project-intelligence",
        title: "Project Intelligence",
        component: "ProjectIntelligenceHome",
      },
      {
        path: "/engineering/apps/project-intelligence/documents",
        title: "Document Intelligence",
        component: "DocumentIntelligenceHome",
      },
      {
        path: "/engineering/apps/project-intelligence/meetings",
        title: "Meeting Intelligence",
        component: "MeetingIntelligenceHome",
      },
      {
        path: "/engineering/apps/project-intelligence/findings",
        title: "Findings Intelligence",
        component: "FindingsIntelligenceHome",
      },
      {
        path: "/engineering/apps/project-intelligence/reports",
        title: "Reporting Intelligence",
        component: "ReportingIntelligenceHome",
      },
      {
        path: "/engineering/apps/project-intelligence/knowledge",
        title: "Knowledge Intelligence",
        component: "KnowledgeIntelligenceHome",
      },
      {
        path: "/engineering/apps/project-intelligence/reasoning",
        title: "Engineering Reasoning Assistant",
        component: "EngineeringReasoningAssistantHome",
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
      {
        id: "pi-feature-documents",
        label: "Document Intelligence",
        path: "/engineering/apps/project-intelligence/documents",
        icon: "FileText",
        group: "engineering",
        order: 21,
      },
      {
        id: "pi-feature-meetings",
        label: "Meeting Intelligence",
        path: "/engineering/apps/project-intelligence/meetings",
        icon: "Users",
        group: "engineering",
        order: 22,
      },
      {
        id: "pi-feature-findings",
        label: "Findings Intelligence",
        path: "/engineering/apps/project-intelligence/findings",
        icon: "SearchCheck",
        group: "engineering",
        order: 23,
      },
      {
        id: "pi-feature-reports",
        label: "Reporting Intelligence",
        path: "/engineering/apps/project-intelligence/reports",
        icon: "ClipboardList",
        group: "engineering",
        order: 24,
      },
      {
        id: "pi-feature-knowledge",
        label: "Knowledge Intelligence",
        path: "/engineering/apps/project-intelligence/knowledge",
        icon: "Network",
        group: "engineering",
        order: 25,
      },
      {
        id: "pi-feature-reasoning",
        label: "Reasoning Assistant",
        path: "/engineering/apps/project-intelligence/reasoning",
        icon: "Sparkles",
        group: "engineering",
        order: 26,
      },
    ],
    features: [
      {
        id: "document_intelligence",
        name: "Document Intelligence",
        description: "Ingestion, retrieval, grounded answers, and document review",
        version: "1.0.0",
        capabilities: [
          { id: "document.intelligence.read" },
          { id: "document.intelligence.write" },
          { id: "document.intelligence.query" },
        ],
      },
      {
        id: "meeting_intelligence",
        name: "Meeting Intelligence",
        description: "Meeting capture, minutes, review, and provider integrations",
        version: "1.0.0",
        capabilities: [
          { id: "meeting.intelligence.read" },
          { id: "meeting.intelligence.write" },
        ],
      },
      {
        id: "findings_intelligence",
        name: "Findings Intelligence",
        description: "Cross-document and meeting findings consolidation",
        version: "1.0.0",
        capabilities: [
          { id: "findings.intelligence.read" },
          { id: "findings.intelligence.write" },
        ],
      },
      {
        id: "reporting_intelligence",
        name: "Reporting Intelligence",
        description: "Module reports over shared Engineering reporting services",
        version: "1.0.0",
        capabilities: [
          { id: "reporting.intelligence.read" },
          { id: "reporting.intelligence.write" },
        ],
      },
      {
        id: "knowledge_intelligence",
        name: "Knowledge Intelligence",
        description: "Unified knowledge graph and hybrid intelligence search",
        version: "1.0.0",
        capabilities: [
          { id: "knowledge.intelligence.read" },
          { id: "knowledge.intelligence.write" },
        ],
      },
      {
        id: "engineering_reasoning_assistant",
        name: "Engineering Reasoning Assistant",
        description: "Deterministic grounded reasoning with citations and abstention",
        version: "1.0.0",
        capabilities: [
          { id: "reasoning.assistant.read" },
          { id: "reasoning.assistant.execute" },
        ],
      },
    ],
  },
  {
    id: "inspection_intelligence",
    moduleKey: "inspection_intelligence",
    commerceApplicationKey: "inspection_intelligence",
    name: "Inspection Intelligence",
    description:
      "Reusable Engineering OS inspection engine — Phase 9K Inspection Intelligence V1.0 GA",
    version: "1.0.0",
    operatingSystemId: OS_ID,
    status: "registered",
    enabled: true,
    workspaceVisibility: "assigned",
    routes: [
      {
        path: "/engineering/apps/inspection-intelligence",
        title: "Inspection Intelligence",
        component: "InspectionIntelligenceHome",
      },
      {
        path: "/engineering/apps/inspection-intelligence/templates",
        title: "Inspection Templates",
        component: "InspectionTemplates",
      },
      {
        path: "/engineering/apps/inspection-intelligence/plans",
        title: "Inspection Plans",
        component: "InspectionPlans",
      },
      {
        path: "/engineering/apps/inspection-intelligence/sessions",
        title: "Inspection Sessions",
        component: "InspectionSessions",
      },
      {
        path: "/engineering/apps/inspection-intelligence/workflows",
        title: "Inspection Workflows",
        component: "InspectionWorkflows",
      },
      {
        path: "/engineering/apps/inspection-intelligence/assignments",
        title: "Inspection Assignments",
        component: "InspectionAssignments",
      },
      {
        path: "/engineering/apps/inspection-intelligence/my-work",
        title: "My Work",
        component: "InspectionMyWork",
      },
      {
        path: "/engineering/apps/inspection-intelligence/field",
        title: "Field Capture",
        component: "InspectionField",
      },
      {
        path: "/engineering/apps/inspection-intelligence/sync",
        title: "Sync Status",
        component: "InspectionSync",
      },
      {
        path: "/engineering/apps/inspection-intelligence/condition",
        title: "Condition Rating",
        component: "InspectionCondition",
      },
      {
        path: "/engineering/apps/inspection-intelligence/predictive",
        title: "Predictive Signals",
        component: "InspectionPredictive",
      },
      {
        path: "/engineering/apps/inspection-intelligence/vision",
        title: "AI Vision Review",
        component: "InspectionVision",
      },
      {
        path: "/engineering/apps/inspection-intelligence/release",
        title: "Module Release",
        component: "InspectionRelease",
      },
      {
        path: "/engineering/apps/inspection-intelligence/review",
        title: "Inspection Review",
        component: "InspectionReview",
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
    searchProviders: ["inspection_intelligence.sessions"],
    aiCapabilities: ["inspection_intelligence.assist"],
    eventHandlers: ["inspection_intelligence.*", "engineering.workflow.*"],
    features: [
      {
        id: "inspection_planning",
        name: "Inspection Planning",
        description: "Templates and plans bound to Inspection Targets",
        version: "1.0.0",
        capabilities: [{ id: "inspection.read" }, { id: "inspection.write" }],
      },
      {
        id: "inspection_sessions",
        name: "Inspection Sessions",
        description: "Durable session execution with state machine",
        version: "1.0.0",
        capabilities: [{ id: "inspection.read" }, { id: "inspection.write" }],
      },
      {
        id: "inspection_operational_workflows",
        name: "Inspection Operational Workflows",
        description: "Desktop/web workflows via Engineering Workflow SDK",
        version: "1.0.0",
        capabilities: [
          { id: "inspection.write" },
          { id: "inspection.review" },
          { id: "inspection.approve" },
          { id: "inspection.admin" },
        ],
      },
      {
        id: "inspection_mobile_field",
        name: "Inspection Mobile Field",
        description: "Tablet/phone capture via Engineering Mobile SDK",
        version: "1.0.0",
        capabilities: [{ id: "inspection.write" }, { id: "inspection.review" }],
      },
      {
        id: "inspection_offline_sync",
        name: "Inspection Offline Sync",
        description: "Offline packages, queues, sync coordinator, and mobile reporting",
        version: "1.0.0",
        capabilities: [{ id: "inspection.write" }, { id: "inspection.read" }],
      },
      {
        id: "inspection_condition_rating",
        name: "Inspection Condition Rating",
        description: "Governed condition grades, aggregation, and predictive signal review",
        version: "1.0.0",
        capabilities: [{ id: "inspection.write" }, { id: "inspection.review" }, { id: "inspection.approve" }],
      },
      {
        id: "inspection_module_release",
        name: "Inspection Module Release",
        description: "Public contracts, registries, manifest and release closure",
        version: "1.0.0",
        capabilities: [{ id: "inspection.admin" }, { id: "inspection.report" }],
      },
      {
        id: "inspection_ai_vision",
        name: "Inspection AI Vision",
        description: "Advisory vision evidence analysis with human validation",
        version: "1.0.0",
        capabilities: [{ id: "inspection.review" }, { id: "inspection.write" }],
      },
      {
        id: "inspection_review_approval",
        name: "Inspection Review",
        description: "Human review and approval workflow",
        version: "1.0.0",
        capabilities: [{ id: "inspection.review" }, { id: "inspection.approve" }],
      },
    ],
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
    version: "0.9.0-ga-readiness",
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
  description: m.description ?? "",
  version: m.version,
  status: m.status,
  enabled: Boolean(m.enabled),
  required_capabilities: [] as string[],
  required_permissions: (m.permissions ?? []).map((p) => `${p.resource}.${p.action}`),
  routes: (m.routes ?? []).map((r) => r.path),
}));
