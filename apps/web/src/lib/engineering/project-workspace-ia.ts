/**
 * EOS Pilot UI-1 — Project Workspace information architecture.
 * Grouped navigation; every core capability ≤3 interactions from Overview.
 */

export type ProjectWorkspaceDisposition =
  | "PROJECT_WORKSPACE"
  | "GLOBAL_ENGINEERING_NAVIGATION"
  | "ADMIN_GOVERNANCE"
  | "TRUST_RELEASE_STATUS"
  | "BACKGROUND_SYSTEM_BEHAVIOR";

export type ProjectWorkspaceNavItem = {
  id: string;
  slug: string;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
  /** Existing global route when bridging (optional). */
  bridgeHref?: (projectId: string) => string;
  objectType?: string;
  core: boolean;
};

export type ProjectWorkspaceNavGroup = {
  id: string;
  label: string;
  items: ProjectWorkspaceNavItem[];
};

export const PROJECT_WORKSPACE_NAV_GROUPS: ProjectWorkspaceNavGroup[] = [
  {
    id: "project",
    label: "PROJECT",
    items: [
      {
        id: "overview",
        slug: "",
        label: "Overview",
        emptyTitle: "Project overview",
        emptyDescription: "Engineering control centre for this project.",
        core: true,
      },
      {
        id: "setup",
        slug: "setup",
        label: "Project Setup",
        emptyTitle: "Project setup incomplete",
        emptyDescription:
          "Configure project profile, jurisdiction, standards, lifecycle, and roles.",
        core: true,
      },
      {
        id: "lifecycle",
        slug: "lifecycle",
        label: "Lifecycle & Gates",
        emptyTitle: "No lifecycle assigned",
        emptyDescription:
          "Assign a lifecycle template and evaluate stage gates from this workspace.",
        bridgeHref: (id) => `/engineering/lifecycle?projectId=${id}`,
        core: true,
      },
    ],
  },
  {
    id: "definition",
    label: "ENGINEERING DEFINITION",
    items: [
      {
        id: "requirements",
        slug: "requirements",
        label: "Requirements",
        emptyTitle: "No requirements recorded",
        emptyDescription:
          "Create the first project requirement or import an approved requirements set.",
        objectType: "Requirement",
        bridgeHref: (id) => `/engineering/requirements?projectId=${id}`,
        core: true,
      },
      {
        id: "engineering-basis",
        slug: "engineering-basis",
        label: "Engineering Basis",
        emptyTitle: "No engineering basis recorded",
        emptyDescription: "Create the project engineering basis and link jurisdiction/standards.",
        objectType: "EngineeringBasis",
        core: true,
      },
      {
        id: "assumptions",
        slug: "assumptions",
        label: "Assumptions",
        emptyTitle: "No assumptions recorded",
        emptyDescription: "Record open assumptions with owner, verification, and affected objects.",
        objectType: "Assumption",
        core: true,
      },
      {
        id: "systems",
        slug: "systems",
        label: "Systems & Interfaces",
        emptyTitle: "No systems recorded",
        emptyDescription: "Define system hierarchy and interfaces in project context.",
        objectType: "System",
        bridgeHref: (id) => `/engineering/systems?projectId=${id}`,
        core: true,
      },
    ],
  },
  {
    id: "execution",
    label: "ENGINEERING EXECUTION",
    items: [
      {
        id: "calculations",
        slug: "calculations",
        label: "Calculations",
        emptyTitle: "No calculations recorded",
        emptyDescription: "Create calculation records with qualification status and evidence.",
        objectType: "Calculation",
        bridgeHref: (id) => `/engineering/analysis?projectId=${id}`,
        core: true,
      },
      {
        id: "decisions",
        slug: "decisions",
        label: "Decisions",
        emptyTitle: "No decisions recorded",
        emptyDescription: "Record decision cases with options, criteria, and human authority.",
        objectType: "Decision",
        bridgeHref: (id) => `/engineering/decisions?projectId=${id}`,
        core: true,
      },
      {
        id: "optimization",
        slug: "optimization",
        label: "Optimization",
        emptyTitle: "No optimization studies",
        emptyDescription: "Define bounded optimization problems. External solvers remain NOT_QUALIFIED.",
        objectType: "OptimizationRun",
        bridgeHref: (id) => `/engineering/optimization?projectId=${id}`,
        core: true,
      },
      {
        id: "changes",
        slug: "changes",
        label: "Changes & Impact",
        emptyTitle: "No changes recorded",
        emptyDescription: "Raise engineering changes and review impact analysis.",
        objectType: "Change",
        bridgeHref: (id) => `/engineering/changes?projectId=${id}`,
        core: true,
      },
      {
        id: "technical-queries",
        slug: "technical-queries",
        label: "Technical Queries",
        emptyTitle: "No technical queries",
        emptyDescription: "Technical queries for this project will appear here.",
        bridgeHref: (id) => `/engineering/technical-queries?projectId=${id}`,
        core: true,
      },
      {
        id: "risks",
        slug: "risks",
        label: "Risks",
        emptyTitle: "No risks recorded",
        emptyDescription: "Risks for this project will appear here when entered in the register.",
        bridgeHref: (id) => `/engineering/risks?projectId=${id}`,
        core: true,
      },
    ],
  },
  {
    id: "delivery",
    label: "DELIVERY",
    items: [
      {
        id: "deliverables",
        slug: "deliverables",
        label: "Deliverables",
        emptyTitle: "No deliverables recorded",
        emptyDescription:
          "A deliverable is a governed engineering output — not merely a document.",
        objectType: "Deliverable",
        bridgeHref: (id) => `/engineering/deliverables?projectId=${id}`,
        core: true,
      },
      {
        id: "documents",
        slug: "documents",
        label: "Documents",
        emptyTitle: "No documents linked",
        emptyDescription: "Upload or link documents as evidence for governed objects.",
        bridgeHref: (id) => `/engineering/documents?projectId=${id}`,
        core: true,
      },
      {
        id: "models",
        slug: "models",
        label: "Models",
        emptyTitle: "No models linked",
        emptyDescription: "Link models to systems, calculations, and deliverables.",
        bridgeHref: (id) =>
          `/engineering/apps/model-interoperability/models?projectId=${id}`,
        core: true,
      },
      {
        id: "reviews",
        slug: "reviews",
        label: "Reviews",
        emptyTitle: "No reviews recorded",
        emptyDescription: "Create engineering reviews. AI must not approve reviews.",
        objectType: "Review",
        core: true,
      },
      {
        id: "actions",
        slug: "actions",
        label: "Actions",
        emptyTitle: "No outstanding actions",
        emptyDescription: "Actions linked to engineering objects and gate conditions.",
        bridgeHref: (id) => `/engineering/actions?projectId=${id}`,
        core: true,
      },
    ],
  },
  {
    id: "intelligence",
    label: "INTELLIGENCE",
    items: [
      {
        id: "digital-thread",
        slug: "digital-thread",
        label: "Digital Thread",
        emptyTitle: "No digital thread relationships",
        emptyDescription:
          "Explore canonical relationships. Vector search is not the source of record.",
        bridgeHref: (id) => `/engineering/thread?projectId=${id}`,
        core: true,
      },
      {
        id: "knowledge",
        slug: "knowledge",
        label: "Knowledge",
        emptyTitle: "No knowledge sources indexed",
        emptyDescription: "Search knowledge with provenance, conflict, and abstention indicators.",
        bridgeHref: (id) =>
          `/engineering/apps/project-intelligence/knowledge?projectId=${id}`,
        core: true,
      },
      {
        id: "impact-analysis",
        slug: "impact-analysis",
        label: "Impact Analysis",
        emptyTitle: "No impact analyses",
        emptyDescription: "Select a change to view affected objects and staleness.",
        objectType: "Impact",
        core: true,
      },
      {
        id: "engineering-ai",
        slug: "engineering-ai",
        label: "Engineering AI",
        emptyTitle: "Engineering Reasoning Assistant",
        emptyDescription:
          "Ask with evidence, inferences, and human authority. AI is not the decision authority.",
        bridgeHref: (id) =>
          `/engineering/ask?projectId=${id}&objectType=project&objectId=${id}`,
        core: true,
      },
    ],
  },
  {
    id: "project-to-asset",
    label: "PROJECT TO ASSET",
    items: [
      {
        id: "assets",
        slug: "assets",
        label: "Assets",
        emptyTitle: "No assets linked",
        emptyDescription: "Map project outputs to assets for handover continuity.",
        objectType: "Asset",
        bridgeHref: (id) => `/engineering/assets?projectId=${id}`,
        core: true,
      },
      {
        id: "inspections",
        slug: "inspections",
        label: "Inspections",
        emptyTitle: "No inspections",
        emptyDescription: "Inspection continuity from project into asset operations.",
        objectType: "Inspection",
        bridgeHref: (id) =>
          `/engineering/apps/inspection-intelligence?projectId=${id}`,
        core: true,
      },
      {
        id: "handover",
        slug: "handover",
        label: "Handover & Readiness",
        emptyTitle: "Handover not started",
        emptyDescription: "Review handover package, readiness, and outstanding items.",
        core: true,
      },
      {
        id: "configuration-history",
        slug: "configuration-history",
        label: "Configuration History",
        emptyTitle: "No configuration history",
        emptyDescription: "Design vs as-built and modification history for this project.",
        bridgeHref: (id) => `/engineering/configuration?projectId=${id}`,
        core: true,
      },
    ],
  },
  {
    id: "governance",
    label: "GOVERNANCE",
    items: [
      {
        id: "evidence",
        slug: "evidence",
        label: "Evidence & Provenance",
        emptyTitle: "No evidence records",
        emptyDescription: "Inspect provenance, revisions, and supporting evidence.",
        objectType: "Evidence",
        core: true,
      },
      {
        id: "qualification",
        slug: "qualification",
        label: "Qualification",
        emptyTitle: "Qualification context",
        emptyDescription:
          "D1 remains QUALIFIED_BOUNDED. Non-D1 and external solvers remain NOT_QUALIFIED / NO.",
        core: true,
      },
      {
        id: "audit",
        slug: "audit",
        label: "Audit / Events",
        emptyTitle: "No audit events",
        emptyDescription: "Object created, revised, gated, decided, and handover events.",
        bridgeHref: (id) => `/engineering/activity?projectId=${id}`,
        core: true,
      },
      {
        id: "integrations",
        slug: "integrations",
        label: "Integrations & Solvers",
        emptyTitle: "Integration status",
        emptyDescription:
          "Connector and solver status. CONNECTED does not mean QUALIFIED. Externals remain NOT_SUPPORTED unless evidenced.",
        core: false,
      },
      {
        id: "trust",
        slug: "trust",
        label: "Trust / Release Status",
        emptyTitle: "EOS trust & release",
        emptyDescription: "Version, activation, supported/unsupported capabilities, limitations.",
        core: false,
      },
      {
        id: "migration",
        slug: "migration",
        label: "Migration Status",
        emptyTitle: "Migration status",
        emptyDescription:
          "LEGACY_PRODUCTION_MIGRATION=NOT_SUPPORTED_INITIAL_RELEASE. Pilot coexistence only.",
        core: false,
      },
      {
        id: "reports",
        slug: "reports",
        label: "Reports",
        emptyTitle: "No reports",
        emptyDescription: "Project reports and exports.",
        bridgeHref: (id) => `/engineering/reports?projectId=${id}`,
        core: false,
      },
    ],
  },
];

export function findWorkspaceNavItem(slug: string): ProjectWorkspaceNavItem | undefined {
  const normalized = slug.replace(/^\//, "").replace(/\/$/, "");
  for (const group of PROJECT_WORKSPACE_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.slug === normalized || item.id === normalized) return item;
    }
  }
  return undefined;
}

export function workspaceHref(projectId: string, slug: string): string {
  if (!slug) return `/engineering/projects/${projectId}`;
  return `/engineering/projects/${projectId}/${slug}`;
}

export function allCoreWorkspaceItems(): ProjectWorkspaceNavItem[] {
  return PROJECT_WORKSPACE_NAV_GROUPS.flatMap((g) => g.items.filter((i) => i.core));
}

/** EOS 3 phase → UI disposition (100% coverage of completed program phases). */
export const EOS3_PHASE_UI_DISPOSITIONS: Array<{
  phase: string;
  capability: string;
  disposition: ProjectWorkspaceDisposition;
  workspaceSlug?: string;
}> = [
  {
    phase: "EOS-3.0",
    capability: "Foundation / compatibility / generation identity",
    disposition: "TRUST_RELEASE_STATUS",
    workspaceSlug: "trust",
  },
  {
    phase: "EOS-3.1",
    capability: "API context / entitlement / enrollment",
    disposition: "BACKGROUND_SYSTEM_BEHAVIOR",
  },
  {
    phase: "EOS-3.2",
    capability: "Canonical engineering objects + digital thread",
    disposition: "PROJECT_WORKSPACE",
    workspaceSlug: "digital-thread",
  },
  {
    phase: "EOS-3.3",
    capability: "Knowledge / retrieval",
    disposition: "PROJECT_WORKSPACE",
    workspaceSlug: "knowledge",
  },
  {
    phase: "EOS-3.4",
    capability: "Decision + optimization intelligence",
    disposition: "PROJECT_WORKSPACE",
    workspaceSlug: "decisions",
  },
  {
    phase: "EOS-3.5",
    capability: "Workflow + governed events",
    disposition: "PROJECT_WORKSPACE",
    workspaceSlug: "lifecycle",
  },
  {
    phase: "EOS-3.6",
    capability: "Integration connectors + solver framework",
    disposition: "PROJECT_WORKSPACE",
    workspaceSlug: "integrations",
  },
  {
    phase: "EOS-3.7",
    capability: "Engineering reasoning assistant",
    disposition: "PROJECT_WORKSPACE",
    workspaceSlug: "engineering-ai",
  },
  {
    phase: "EOS-3.8",
    capability: "Project-to-asset / handover",
    disposition: "PROJECT_WORKSPACE",
    workspaceSlug: "handover",
  },
  {
    phase: "EOS-3.9",
    capability: "Migration / coexistence",
    disposition: "ADMIN_GOVERNANCE",
    workspaceSlug: "migration",
  },
  {
    phase: "EOS-3.10",
    capability: "Integrated validation",
    disposition: "BACKGROUND_SYSTEM_BEHAVIOR",
  },
  {
    phase: "EOS-3.11",
    capability: "Security / RLS / isolation",
    disposition: "BACKGROUND_SYSTEM_BEHAVIOR",
  },
  {
    phase: "EOS-3.12",
    capability: "Release governance packaging",
    disposition: "TRUST_RELEASE_STATUS",
    workspaceSlug: "trust",
  },
  {
    phase: "EOS-3.12A",
    capability: "Release evidence / fingerprints",
    disposition: "TRUST_RELEASE_STATUS",
    workspaceSlug: "trust",
  },
  {
    phase: "EOS-3.13",
    capability: "GA activation controls",
    disposition: "ADMIN_GOVERNANCE",
    workspaceSlug: "trust",
  },
  {
    phase: "EOS-3.13R",
    capability: "Human GA authorization",
    disposition: "ADMIN_GOVERNANCE",
    workspaceSlug: "trust",
  },
  {
    phase: "EOS-3.13R-C",
    capability: "Post-activation assurance / access matrix",
    disposition: "BACKGROUND_SYSTEM_BEHAVIOR",
  },
  {
    phase: "EOS-3.14",
    capability: "Program closeout",
    disposition: "TRUST_RELEASE_STATUS",
    workspaceSlug: "trust",
  },
  {
    phase: "EOS-3-MAINT-0",
    capability: "Maintenance governance",
    disposition: "ADMIN_GOVERNANCE",
    workspaceSlug: "trust",
  },
];

export const DEFAULT_PILOT_LIFECYCLE = [
  { key: "P0", label: "P0 Opportunity", kind: "phase" as const },
  { key: "G0", label: "G0 Opportunity Validated", kind: "gate" as const },
  { key: "P1", label: "P1 Concept Definition", kind: "phase" as const },
  { key: "G1", label: "G1 Concept Basis Approved", kind: "gate" as const },
  { key: "P2", label: "P2 Options Development", kind: "phase" as const },
  { key: "G2", label: "G2 Options Screened", kind: "gate" as const },
  { key: "P3", label: "P3 Concept Select", kind: "phase" as const },
  { key: "G3", label: "G3 Concept Selected", kind: "gate" as const },
  { key: "P4", label: "P4 Definition / Pre-FEED", kind: "phase" as const },
  { key: "G4", label: "G4 Ready for FEED", kind: "gate" as const },
  { key: "P5", label: "P5 FEED", kind: "phase" as const },
  { key: "G5", label: "G5 FEED Complete", kind: "gate" as const },
  { key: "P6", label: "P6 Detailed Engineering Readiness", kind: "phase" as const },
  { key: "G6", label: "G6 Ready for Detailed Engineering", kind: "gate" as const },
];

export type GateResult = "PASS" | "PASS_WITH_CONDITIONS" | "HOLD" | "RECYCLE" | "STOP";
