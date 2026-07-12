/**
 * Project Intelligence ↔ Engineering OS Core integration contract (Batch 2.06)
 *
 * Project Intelligence is a separate existing app. It MUST use Engineering Core
 * registers — never duplicate decisions, actions, risks, issues, TQs, or lessons.
 */

import type { EngineeringApiEndpoint } from "./engineering-api-contracts";
import type { EngineeringEventType } from "./engineering-event-contracts";

export const PROJECT_INTELLIGENCE_APP_KEY = "project_intelligence" as const;

/** Maps Project Intelligence project identity to Engineering Core project */
export interface ProjectIntelligenceProjectMapping {
  /** Engineering Core canonical project ID */
  engineering_project_id: string;
  /** External Project Intelligence app project ID */
  project_intelligence_project_id: string;
  /** Engineering project code (e.g. PRJ-001) */
  engineering_project_code: string;
  /** Sync metadata */
  metadata?: {
    last_sync_at?: string;
    sync_status?: "idle" | "syncing" | "error";
    sync_error?: string;
  };
}

/**
 * Registers owned by Engineering Core — Project Intelligence reads/writes via API only.
 * Do NOT create parallel tables in Project Intelligence for these entities.
 */
export const ENGINEERING_CORE_OWNED_REGISTERS = [
  "decisions",
  "actions",
  "risks",
  "issues",
  "technical_queries",
  "lessons_learned",
] as const;

export type EngineeringCoreOwnedRegister = (typeof ENGINEERING_CORE_OWNED_REGISTERS)[number];

/** Stable API routes Project Intelligence must call */
export const PROJECT_INTELLIGENCE_REGISTER_APIS: Record<EngineeringCoreOwnedRegister, string> = {
  decisions: "/api/engineering/decisions",
  actions: "/api/engineering/actions",
  risks: "/api/engineering/risks",
  issues: "/api/engineering/issues",
  technical_queries: "/api/engineering/technical-queries",
  lessons_learned: "/api/engineering/lessons",
};

/** Shared context APIs */
export const PROJECT_INTELLIGENCE_CONTEXT_APIS = {
  projects: "/api/engineering/projects",
  timeline: "/api/engineering/timeline",
  activity: "/api/engineering/activity",
  search: "/api/engineering/search",
  health: "/api/engineering/health",
} as const;

/** Knowledge Graph relationships Project Intelligence may create (via Engineering Core links) */
export const PROJECT_INTELLIGENCE_KG_RELATIONSHIPS = [
  "contains",
  "references",
  "supports",
  "mitigates",
  "creates",
  "derived_from",
] as const;

/** Workflow hooks — Project Intelligence triggers via Engineering Core, not duplicate workflows */
export const PROJECT_INTELLIGENCE_WORKFLOW_HOOKS = {
  decision_approval: "engineering-decision-approval",
  risk_review: "engineering-risk-review",
  tq_response: "engineering-tq-workflow",
  action_closeout: "engineering-action-closeout",
  issue_investigation: "engineering-issue-investigation",
} as const;

/** Events Project Intelligence should subscribe to */
export const PROJECT_INTELLIGENCE_SUBSCRIBE_EVENTS: EngineeringEventType[] = [
  "engineering.project.created",
  "engineering.project.updated",
  "engineering.decision.created",
  "engineering.decision.approved",
  "engineering.action.created",
  "engineering.action.closed",
  "engineering.risk.created",
  "engineering.issue.created",
  "engineering.technical_query.created",
  "engineering.lesson.created",
  "project_intelligence.sync.requested",
  "project_intelligence.sync.completed",
];

/** Events Project Intelligence may publish */
export const PROJECT_INTELLIGENCE_PUBLISH_EVENTS: EngineeringEventType[] = [
  "project_intelligence.sync.requested",
  "project_intelligence.sync.completed",
  "project_intelligence.mapping.discovered",
  "project_intelligence.mapping.approved",
  "project_intelligence.mapping.rejected",
  "project_intelligence.mapping.conflict_detected",
  "project_intelligence.mapping.deferred",
  "project_intelligence.migration.completed",
];

export interface ProjectIntelligenceIntegrationClient {
  /** Resolve Engineering project from PI project ID */
  resolveProjectMapping(
    projectIntelligenceProjectId: string
  ): Promise<ProjectIntelligenceProjectMapping | null>;

  /** List decisions for an engineering project — never duplicate register */
  listDecisions(engineeringProjectId: string): Promise<unknown[]>;
  listActions(engineeringProjectId: string): Promise<unknown[]>;
  listRisks(engineeringProjectId: string): Promise<unknown[]>;
  listIssues(engineeringProjectId: string): Promise<unknown[]>;
  listTechnicalQueries(engineeringProjectId: string): Promise<unknown[]>;
  listLessons(engineeringProjectId: string): Promise<unknown[]>;

  /** Request sync — publishes project_intelligence.sync.requested */
  requestSync(input: {
    engineeringProjectId: string;
    projectIntelligenceProjectId?: string;
    scope: EngineeringCoreOwnedRegister[];
  }): Promise<void>;
}

export const PROJECT_INTELLIGENCE_INTEGRATION_RULES = {
  doNotDuplicateRegisters: true,
  useEngineeringCoreApis: true,
  decisionsRequireHumanApproval: true,
  canonicalProjectSource: "engineering_projects",
  mappingStorageRecommendation:
    "Store mapping in Project Intelligence app DB referencing engineering_project_id",
} as const;

export type ProjectIntelligenceApiSurface = Pick<
  EngineeringApiEndpoint,
  "method" | "path" | "description"
>;
