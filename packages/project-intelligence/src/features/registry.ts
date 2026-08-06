/**
 * Phase 8B — Project Intelligence feature registry.
 * Features register under Engineering OS module project_intelligence.
 */
import type { FeatureManifest, RouteRegistration, NavigationRegistration } from "@rtb/types";

export type ProjectIntelligenceFeatureId =
  | "document_intelligence"
  | "meeting_intelligence"
  | "findings_intelligence"
  | "reporting_intelligence";

export const PROJECT_INTELLIGENCE_MODULE_KEY = "project_intelligence" as const;

export interface ProjectIntelligenceFeatureRegistration extends FeatureManifest {
  id: ProjectIntelligenceFeatureId;
  moduleKey: typeof PROJECT_INTELLIGENCE_MODULE_KEY;
  routes: RouteRegistration[];
  navigation: NavigationRegistration[];
  sharedServices: string[];
  sharedAiCapabilities: string[];
  /** Must remain false — PI consumes Engineering AI framework. */
  implementsOwnAiStack: false;
}

export const PROJECT_INTELLIGENCE_FEATURES: ProjectIntelligenceFeatureRegistration[] = [
  {
    id: "document_intelligence",
    moduleKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    name: "Document Intelligence",
    description: "Ingestion, retrieval, grounded answers, and document review",
    version: "0.1.0",
    capabilities: [
      { id: "document.intelligence.read" },
      { id: "document.intelligence.write" },
      { id: "document.intelligence.query" },
    ],
    routes: [
      {
        path: "/engineering/apps/project-intelligence/documents",
        title: "Document Intelligence",
        component: "DocumentIntelligenceHome",
      },
    ],
    navigation: [
      {
        id: "pi-feature-documents",
        label: "Document Intelligence",
        path: "/engineering/apps/project-intelligence/documents",
        icon: "FileText",
        group: "engineering",
        order: 1,
      },
    ],
    sharedServices: [
      "document_references",
      "version_history",
      "attachments",
      "engineering_timelines",
      "comments",
      "approvals",
      "audit",
      "reporting",
      "ai_context",
      "activity",
      "notification",
    ],
    sharedAiCapabilities: ["knowledge_retrieval", "evidence_grounding", "citations", "cost_controls"],
    implementsOwnAiStack: false,
  },
  {
    id: "meeting_intelligence",
    moduleKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    name: "Meeting Intelligence",
    description: "Meeting capture, minutes, review, and provider integrations",
    version: "0.1.0",
    capabilities: [
      { id: "meeting.intelligence.read" },
      { id: "meeting.intelligence.write" },
    ],
    routes: [
      {
        path: "/engineering/apps/project-intelligence/meetings",
        title: "Meeting Intelligence",
        component: "MeetingIntelligenceHome",
      },
    ],
    navigation: [
      {
        id: "pi-feature-meetings",
        label: "Meeting Intelligence",
        path: "/engineering/apps/project-intelligence/meetings",
        icon: "Users",
        group: "engineering",
        order: 2,
      },
    ],
    sharedServices: [
      "engineering_timelines",
      "activity",
      "attachments",
      "comments",
      "approvals",
      "version_history",
      "audit",
      "notification",
      "document_references",
      "ai_context",
      "reporting",
    ],
    sharedAiCapabilities: ["evidence_grounding", "citations", "human_approval", "prompt_registry"],
    implementsOwnAiStack: false,
  },
  {
    id: "findings_intelligence",
    moduleKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    name: "Findings Intelligence",
    description: "Cross-document and meeting findings consolidation",
    version: "0.1.0",
    capabilities: [
      { id: "findings.intelligence.read" },
      { id: "findings.intelligence.write" },
    ],
    routes: [
      {
        path: "/engineering/apps/project-intelligence/findings",
        title: "Findings Intelligence",
        component: "FindingsIntelligenceHome",
      },
    ],
    navigation: [
      {
        id: "pi-feature-findings",
        label: "Findings Intelligence",
        path: "/engineering/apps/project-intelligence/findings",
        icon: "SearchCheck",
        group: "engineering",
        order: 3,
      },
    ],
    sharedServices: [
      "activity",
      "engineering_timelines",
      "comments",
      "approvals",
      "attachments",
      "document_references",
      "version_history",
      "audit",
      "notification",
      "ai_context",
      "reporting",
    ],
    sharedAiCapabilities: [
      "evidence_grounding",
      "citations",
      "capability_registry",
      "human_approval",
      "prompt_registry",
    ],
    implementsOwnAiStack: false,
  },
  {
    id: "reporting_intelligence",
    moduleKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    name: "Reporting Intelligence",
    description: "Module reports over shared Engineering reporting services",
    version: "0.1.0",
    capabilities: [
      { id: "reporting.intelligence.read" },
      { id: "reporting.intelligence.write" },
    ],
    routes: [
      {
        path: "/engineering/apps/project-intelligence/reports",
        title: "Reporting Intelligence",
        component: "ReportingIntelligenceHome",
      },
      {
        path: "/engineering/apps/project-intelligence/reports/executive",
        title: "Executive Intelligence Dashboard",
        component: "ExecutiveIntelligenceDashboard",
      },
    ],
    navigation: [
      {
        id: "pi-feature-reports",
        label: "Reporting Intelligence",
        path: "/engineering/apps/project-intelligence/reports",
        icon: "ClipboardList",
        group: "engineering",
        order: 4,
      },
    ],
    sharedServices: [
      "reporting",
      "audit",
      "ai_context",
      "activity",
      "engineering_timelines",
      "approvals",
      "document_references",
      "notification",
    ],
    sharedAiCapabilities: ["citations", "human_approval", "cost_controls", "prompt_registry"],
    implementsOwnAiStack: false,
  },
];

export function listProjectIntelligenceFeatures(): ProjectIntelligenceFeatureRegistration[] {
  return PROJECT_INTELLIGENCE_FEATURES;
}

export function getProjectIntelligenceFeature(
  id: ProjectIntelligenceFeatureId,
): ProjectIntelligenceFeatureRegistration | undefined {
  return PROJECT_INTELLIGENCE_FEATURES.find((f) => f.id === id);
}

export function toFeatureManifests(): FeatureManifest[] {
  return PROJECT_INTELLIGENCE_FEATURES.map(
    ({ routes: _r, navigation: _n, sharedServices: _s, sharedAiCapabilities: _a, implementsOwnAiStack: _i, moduleKey: _m, ...feature }) =>
      feature,
  );
}
