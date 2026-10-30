/**
 * EOS-3 UX Foundation — Engineering-language project workspace IA.
 * Ordinary engineer labels; architecture terms stay internal.
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
  /** When true, item is advanced/admin — not primary engineer workflow. */
  advanced?: boolean;
};

export type ProjectWorkspaceNavGroup = {
  id: string;
  label: string;
  items: ProjectWorkspaceNavItem[];
  /** Advanced / More groups are collapsed by default in the shell. */
  advanced?: boolean;
};

/** Engineer-facing project navigation (approved UX foundation). */
export const PROJECT_WORKSPACE_NAV_GROUPS: ProjectWorkspaceNavGroup[] = [
  {
    id: "work",
    label: "Work",
    items: [
      {
        id: "overview",
        slug: "",
        label: "Overview",
        emptyTitle: "Project overview",
        emptyDescription: "Active work packages and engineering status for this project.",
        core: true,
      },
      {
        id: "guided",
        slug: "guided",
        label: "Guided Engineering",
        emptyTitle: "Guided Engineering",
        emptyDescription:
          "Describe the project; EOS prepares the initial engineering state for review.",
        core: true,
      },
      {
        id: "work-packages",
        slug: "work-packages",
        label: "Work Packages",
        emptyTitle: "No work packages yet",
        emptyDescription:
          "Create a work package to bound engineering execution beneath this project.",
        objectType: "WorkPackage",
        core: true,
      },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    items: [
      {
        id: "scope-design-basis",
        slug: "scope-design-basis",
        label: "Scope & Design Basis",
        emptyTitle: "No confirmed requirements",
        emptyDescription:
          "Requirements, engineering basis, and assumptions for this project.",
        objectType: "Requirement",
        bridgeHref: (id) => `/engineering/requirements?projectId=${id}`,
        core: true,
      },
      {
        id: "engineering-design",
        slug: "engineering-design",
        label: "Engineering Design",
        emptyTitle: "No design outputs recorded",
        emptyDescription:
          "Calculations, models, drawings, specifications, and design notes for active design work.",
        objectType: "Calculation",
        bridgeHref: (id) => `/engineering/analysis?projectId=${id}`,
        core: true,
      },
      {
        id: "interfaces",
        slug: "interfaces",
        label: "Interfaces & Coordination",
        emptyTitle: "No interfaces recorded",
        emptyDescription: "System interfaces and discipline coordination for this project.",
        objectType: "System",
        bridgeHref: (id) => `/engineering/systems?projectId=${id}`,
        core: true,
      },
      {
        id: "changes-decisions",
        slug: "changes-decisions",
        label: "Changes & Decisions",
        emptyTitle: "No confirmed decisions",
        emptyDescription: "Engineering changes and decisions requiring attention or authority.",
        objectType: "Decision",
        bridgeHref: (id) => `/engineering/decisions?projectId=${id}`,
        core: true,
      },
      {
        id: "reviews",
        slug: "reviews",
        label: "Reviews & Approvals",
        emptyTitle: "No reviews recorded",
        emptyDescription: "Engineering reviews and approvals. AI must not approve reviews.",
        objectType: "Review",
        core: true,
      },
    ],
  },
  {
    id: "information",
    label: "Information",
    items: [
      {
        id: "deliverables",
        slug: "deliverables",
        label: "Deliverables & Records",
        emptyTitle: "No deliverables recorded",
        emptyDescription:
          "Governed engineering outputs, documents, and project reports.",
        objectType: "Deliverable",
        bridgeHref: (id) => `/engineering/deliverables?projectId=${id}`,
        core: true,
      },
      {
        id: "assets",
        slug: "assets",
        label: "Assets & Systems",
        emptyTitle: "No assets linked",
        emptyDescription:
          "Facility, area, system, and equipment context for what this project’s work packages affect.",
        objectType: "Asset",
        bridgeHref: (id) => `/engineering/assets?projectId=${id}`,
        core: true,
      },
      {
        id: "engineering-reference",
        slug: "engineering-reference",
        label: "Engineering Reference",
        emptyTitle: "No reference sources indexed",
        emptyDescription: "Standards, knowledge, and reference material with provenance.",
        bridgeHref: (id) =>
          `/engineering/apps/project-intelligence/knowledge?projectId=${id}`,
        core: true,
      },
      {
        id: "dependencies",
        slug: "dependencies",
        label: "Dependencies",
        emptyTitle: "No dependencies recorded",
        emptyDescription:
          "Upstream and downstream engineering relationships for objects in this project.",
        core: true,
      },
    ],
  },
  {
    id: "execution",
    label: "Execution",
    items: [
      {
        id: "handover",
        slug: "handover",
        label: "Site & Handover",
        emptyTitle: "Handover not started",
        emptyDescription: "Review handover package, readiness, and outstanding items.",
        core: true,
      },
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    advanced: true,
    items: [
      {
        id: "setup",
        slug: "setup",
        label: "Project Setup",
        emptyTitle: "Project setup incomplete",
        emptyDescription:
          "Configure project profile, jurisdiction, standards, lifecycle, and roles.",
        core: false,
        advanced: true,
      },
      {
        id: "lifecycle",
        slug: "lifecycle",
        label: "Lifecycle & Gates",
        emptyTitle: "No lifecycle assigned",
        emptyDescription:
          "Assign a lifecycle template and evaluate stage gates from this workspace.",
        bridgeHref: (id) => `/engineering/lifecycle?projectId=${id}`,
        core: false,
        advanced: true,
      },
      {
        id: "technical-queries",
        slug: "technical-queries",
        label: "Technical Queries",
        emptyTitle: "No technical queries",
        emptyDescription: "Technical queries for this project will appear here.",
        bridgeHref: (id) => `/engineering/technical-queries?projectId=${id}`,
        core: false,
        advanced: true,
      },
      {
        id: "risks",
        slug: "risks",
        label: "Risks",
        emptyTitle: "No risks recorded",
        emptyDescription: "Risks for this project will appear here when entered in the register.",
        bridgeHref: (id) => `/engineering/risks?projectId=${id}`,
        core: false,
        advanced: true,
      },
      {
        id: "actions",
        slug: "actions",
        label: "Actions",
        emptyTitle: "No outstanding actions",
        emptyDescription: "Actions linked to engineering objects and gate conditions.",
        bridgeHref: (id) => `/engineering/actions?projectId=${id}`,
        core: false,
        advanced: true,
      },
      {
        id: "optimization",
        slug: "optimization",
        label: "Optimization",
        emptyTitle: "No optimization studies",
        emptyDescription:
          "Define bounded optimization problems. External solvers remain NOT_QUALIFIED.",
        objectType: "OptimizationRun",
        bridgeHref: (id) => `/engineering/optimization?projectId=${id}`,
        core: false,
        advanced: true,
      },
      {
        id: "digital-thread",
        slug: "digital-thread",
        label: "Dependencies — Full view",
        emptyTitle: "No dependency relationships",
        emptyDescription:
          "Full relationship view. Prefer Dependencies for routine engineering work.",
        bridgeHref: (id) => `/engineering/thread?projectId=${id}`,
        core: false,
        advanced: true,
      },
      {
        id: "impact-analysis",
        slug: "impact-analysis",
        label: "Impact Analysis",
        emptyTitle: "No impact analyses",
        emptyDescription: "Select a change to view affected objects.",
        objectType: "Impact",
        core: false,
        advanced: true,
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
        core: false,
        advanced: true,
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
        core: false,
        advanced: true,
      },
      {
        id: "configuration-history",
        slug: "configuration-history",
        label: "Configuration History",
        emptyTitle: "No configuration history",
        emptyDescription: "Design vs as-built and modification history for this project.",
        bridgeHref: (id) => `/engineering/configuration?projectId=${id}`,
        core: false,
        advanced: true,
      },
      {
        id: "evidence",
        slug: "evidence",
        label: "Evidence",
        emptyTitle: "No evidence records",
        emptyDescription: "Inspect supporting evidence and revisions.",
        objectType: "Evidence",
        core: false,
        advanced: true,
      },
      {
        id: "qualification",
        slug: "qualification",
        label: "Qualification",
        emptyTitle: "Qualification context",
        emptyDescription:
          "D1 remains QUALIFIED_BOUNDED. Non-D1 and external solvers remain NOT_QUALIFIED / NO.",
        core: false,
        advanced: true,
      },
      {
        id: "audit",
        slug: "audit",
        label: "Audit / Events",
        emptyTitle: "No audit events",
        emptyDescription: "Object created, revised, gated, decided, and handover events.",
        bridgeHref: (id) => `/engineering/activity?projectId=${id}`,
        core: false,
        advanced: true,
      },
      {
        id: "integrations",
        slug: "integrations",
        label: "Integrations & Solvers",
        emptyTitle: "Integration status",
        emptyDescription:
          "Connector and solver status. CONNECTED does not mean QUALIFIED.",
        core: false,
        advanced: true,
      },
      {
        id: "trust",
        slug: "trust",
        label: "Trust / Release Status",
        emptyTitle: "EOS trust & release",
        emptyDescription: "Version, activation, supported/unsupported capabilities, limitations.",
        core: false,
        advanced: true,
      },
      {
        id: "migration",
        slug: "migration",
        label: "Migration Status",
        emptyTitle: "Migration status",
        emptyDescription:
          "LEGACY_PRODUCTION_MIGRATION=NOT_SUPPORTED_INITIAL_RELEASE. Pilot coexistence only.",
        core: false,
        advanced: true,
      },
    ],
  },
];

/** Legacy slug aliases → current engineer-facing slug (route compatibility). */
export const WORKSPACE_SLUG_ALIASES: Record<string, string> = {
  requirements: "scope-design-basis",
  "engineering-basis": "scope-design-basis",
  assumptions: "scope-design-basis",
  calculations: "engineering-design",
  models: "engineering-design",
  documents: "deliverables",
  reports: "deliverables",
  decisions: "changes-decisions",
  changes: "changes-decisions",
  systems: "interfaces",
  knowledge: "engineering-reference",
  "project-to-asset": "assets",
};

/** Hub branch labels for the central engineering hub (navigation/summary only). */
export const ENGINEERING_HUB_BRANCHES = [
  { id: "scope-design-basis", label: "Scope & Design Basis", slug: "scope-design-basis" },
  { id: "engineering-design", label: "Engineering Design", slug: "engineering-design" },
  { id: "work-packages", label: "Work Packages", slug: "work-packages" },
  { id: "interfaces", label: "Interfaces & Coordination", slug: "interfaces" },
  { id: "changes-decisions", label: "Changes & Decisions", slug: "changes-decisions" },
  { id: "reviews", label: "Reviews & Approvals", slug: "reviews" },
  { id: "deliverables", label: "Deliverables & Records", slug: "deliverables" },
  { id: "assets", label: "Assets & Systems", slug: "assets" },
  { id: "handover", label: "Site & Handover", slug: "handover" },
  { id: "engineering-reference", label: "Engineering Reference", slug: "engineering-reference" },
] as const;

/** IT/architecture terms that must not appear in primary engineer-facing labels. */
export const FORBIDDEN_ENGINEER_FACING_TERMS = [
  "Relationship Graph",
  "Context Resolution",
  "Staleness Propagation",
  "Decision Intelligence",
  "Workflow Automation",
  "Canonical Engineering State",
  "Ontology",
  "Data Fabric",
  "Provenance Engine",
] as const;

export function resolveWorkspaceSlug(slug: string): string {
  const normalized = slug.replace(/^\//, "").replace(/\/$/, "");
  return WORKSPACE_SLUG_ALIASES[normalized] ?? normalized;
}

export function findWorkspaceNavItem(slug: string): ProjectWorkspaceNavItem | undefined {
  const resolved = resolveWorkspaceSlug(slug);
  for (const group of PROJECT_WORKSPACE_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.slug === resolved || item.id === resolved || item.slug === slug || item.id === slug) {
        return item;
      }
    }
  }
  return undefined;
}

export function workspaceHref(projectId: string, slug: string): string {
  const resolved = resolveWorkspaceSlug(slug);
  if (!resolved) return `/engineering/projects/${projectId}`;
  return `/engineering/projects/${projectId}/${resolved}`;
}

export function allCoreWorkspaceItems(): ProjectWorkspaceNavItem[] {
  return PROJECT_WORKSPACE_NAV_GROUPS.flatMap((g) => g.items.filter((i) => i.core));
}

export function primaryEngineerNavLabels(): string[] {
  return PROJECT_WORKSPACE_NAV_GROUPS.filter((g) => !g.advanced).flatMap((g) =>
    g.items.filter((i) => !i.advanced).map((i) => i.label),
  );
}

export function countForbiddenTermsInPrimaryNav(): number {
  const labels = primaryEngineerNavLabels().join(" | ");
  return FORBIDDEN_ENGINEER_FACING_TERMS.filter((term) => labels.includes(term)).length;
}

/** Engineer-friendly empty-state copy for proposed vs confirmed objects. */
export function proposedConfirmedEmptyCopy(
  objectLabel: string,
  confirmedCount: number,
  proposedCount: number,
): { title: string; description: string } {
  if (confirmedCount === 0 && proposedCount > 0) {
    return {
      title: `No confirmed ${objectLabel}`,
      description: `${proposedCount} proposed ${objectLabel} awaiting review`,
    };
  }
  if (confirmedCount === 0 && proposedCount === 0) {
    return {
      title: `No ${objectLabel} recorded`,
      description: `Create or confirm the first ${objectLabel.replace(/s$/, "")} for this project.`,
    };
  }
  return {
    title: objectLabel,
    description: `${confirmedCount} confirmed · ${proposedCount} proposed`,
  };
}

/** Compact engineer-facing governance label (hides raw policy strings by default). */
export function engineerFacingGovernedLabel(governedState: string): {
  label: string;
  detail: string;
} {
  const raw = governedState.trim();
  const upper = raw.toUpperCase();
  if (
    upper.includes("PROPOSE") ||
    upper.includes("PENDING") ||
    upper.includes("PROPOSED") ||
    upper === "DRAFT"
  ) {
    return { label: "Needs confirmation", detail: raw };
  }
  if (upper.includes("CONFIRMED") || upper.includes("APPROVED") || upper === "ACTIVE") {
    return { label: "Confirmed", detail: raw };
  }
  if (upper.includes("REJECT") || upper.includes("SUPERSEDED")) {
    return { label: "Not current", detail: raw };
  }
  return { label: "Recorded", detail: raw };
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
    workspaceSlug: "dependencies",
  },
  {
    phase: "EOS-3.3",
    capability: "Knowledge / retrieval",
    disposition: "PROJECT_WORKSPACE",
    workspaceSlug: "engineering-reference",
  },
  {
    phase: "EOS-3.4",
    capability: "Decision + optimization intelligence",
    disposition: "PROJECT_WORKSPACE",
    workspaceSlug: "changes-decisions",
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
    disposition: "ADMIN_GOVERNANCE",
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
