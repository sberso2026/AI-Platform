/**
 * Engineering OS event contracts (Batch 2.06)
 * Published via Platform Kernel Event Bus.
 */

export const ENGINEERING_EVENT_SOURCE = "engineering-os" as const;

/** Core Engineering OS lifecycle events */
export type EngineeringCoreEventType =
  | "engineering.project.created"
  | "engineering.project.updated"
  | "engineering.asset.created"
  | "engineering.document.uploaded"
  | "engineering.decision.created"
  | "engineering.decision.approved"
  | "engineering.action.created"
  | "engineering.action.closed"
  | "engineering.risk.created"
  | "engineering.risk.updated"
  | "engineering.issue.created"
  | "engineering.technical_query.created"
  | "engineering.technical_query.answered"
  | "engineering.lesson.created"
  | "engineering.ai.run.completed"
  | "engineering.demo.seeded"
  | "engineering.demo.reset";

/** Project Intelligence sync events (external app ↔ Engineering Core) */
export type ProjectIntelligenceEventType =
  | "project_intelligence.sync.requested"
  | "project_intelligence.sync.completed";

export type EngineeringEventType = EngineeringCoreEventType | ProjectIntelligenceEventType;

export const ENGINEERING_CORE_EVENT_TYPES: EngineeringCoreEventType[] = [
  "engineering.project.created",
  "engineering.project.updated",
  "engineering.asset.created",
  "engineering.document.uploaded",
  "engineering.decision.created",
  "engineering.decision.approved",
  "engineering.action.created",
  "engineering.action.closed",
  "engineering.risk.created",
  "engineering.issue.created",
  "engineering.technical_query.created",
  "engineering.lesson.created",
];

export const PROJECT_INTELLIGENCE_EVENT_TYPES: ProjectIntelligenceEventType[] = [
  "project_intelligence.sync.requested",
  "project_intelligence.sync.completed",
];

export interface EngineeringEventEnvelope<T extends EngineeringEventType = EngineeringEventType> {
  eventType: T;
  tenantId: string;
  workspaceId?: string;
  source: typeof ENGINEERING_EVENT_SOURCE | "project-intelligence";
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface EngineeringProjectCreatedPayload {
  project_id: string;
  project_code: string;
  project_name?: string;
}

export interface EngineeringProjectUpdatedPayload {
  project_id: string;
  project_code?: string;
  changes?: string[];
}

export interface EngineeringDecisionCreatedPayload {
  object_type: "decision";
  object_id: string;
  title: string;
  decision_number?: string;
  approval_status: "pending";
}

export interface EngineeringDecisionApprovedPayload {
  object_type: "decision";
  object_id: string;
  title: string;
  approved_by: string;
}

export interface EngineeringActionCreatedPayload {
  object_type: "action";
  object_id: string;
  title: string;
  action_number?: string;
}

export interface EngineeringActionClosedPayload {
  object_type: "action";
  object_id: string;
  title: string;
  completion_date?: string;
}

export interface EngineeringRiskCreatedPayload {
  object_type: "risk";
  object_id: string;
  title: string;
  score?: number;
}

export interface EngineeringIssueCreatedPayload {
  object_type: "issue";
  object_id: string;
  title: string;
}

export interface EngineeringTechnicalQueryCreatedPayload {
  object_type: "technical_query";
  object_id: string;
  tq_number?: string;
  question?: string;
}

export interface EngineeringLessonCreatedPayload {
  object_type: "lesson";
  object_id: string;
  title: string;
  lesson_number?: string;
}

export interface ProjectIntelligenceSyncRequestedPayload {
  engineering_project_id: string;
  project_intelligence_project_id?: string;
  sync_scope: ("decisions" | "actions" | "risks" | "issues" | "technical_queries" | "lessons")[];
  requested_by?: string;
}

export interface ProjectIntelligenceSyncCompletedPayload {
  engineering_project_id: string;
  project_intelligence_project_id?: string;
  records_synced: Record<string, number>;
  completed_at: string;
}

export type EngineeringEventPayloadMap = {
  "engineering.project.created": EngineeringProjectCreatedPayload;
  "engineering.project.updated": EngineeringProjectUpdatedPayload;
  "engineering.decision.created": EngineeringDecisionCreatedPayload;
  "engineering.decision.approved": EngineeringDecisionApprovedPayload;
  "engineering.action.created": EngineeringActionCreatedPayload;
  "engineering.action.closed": EngineeringActionClosedPayload;
  "engineering.risk.created": EngineeringRiskCreatedPayload;
  "engineering.issue.created": EngineeringIssueCreatedPayload;
  "engineering.technical_query.created": EngineeringTechnicalQueryCreatedPayload;
  "engineering.lesson.created": EngineeringLessonCreatedPayload;
  "project_intelligence.sync.requested": ProjectIntelligenceSyncRequestedPayload;
  "project_intelligence.sync.completed": ProjectIntelligenceSyncCompletedPayload;
};

export function isEngineeringEventType(value: string): value is EngineeringEventType {
  return (
    ENGINEERING_CORE_EVENT_TYPES.includes(value as EngineeringCoreEventType) ||
    PROJECT_INTELLIGENCE_EVENT_TYPES.includes(value as ProjectIntelligenceEventType)
  );
}
