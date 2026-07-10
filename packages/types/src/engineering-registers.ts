/**
 * Engineering Intelligence Registers — shared object types (Batch 2.05)
 */

export type EngineeringObjectType =
  | "decision"
  | "action"
  | "risk"
  | "issue"
  | "technical_query"
  | "lesson"
  | "project"
  | "asset"
  | "document";

export type EngineeringObjectPriority = "low" | "medium" | "high" | "critical";

export interface EngineeringObjectBase {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  title: string;
  description?: string;
  status: string;
  priority: EngineeringObjectPriority | string;
  discipline_id?: string;
  project_id?: string;
  asset_id?: string;
  company_id?: string;
  owner_id?: string;
  created_by?: string;
  assigned_to?: string;
  due_date?: string;
  closed_date?: string;
  workflow_instance_id?: string;
  knowledge_node_id?: string;
  digital_twin_id?: string;
  ai_context: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EngineeringDecision extends EngineeringObjectBase {
  decision_number: string;
  decision_type?: string;
  category?: string;
  recommendation?: string;
  rationale?: string;
  alternatives: unknown[];
  consequences?: string;
  confidence?: number;
  review_status: string;
  approval_status: string;
  approved_by?: string;
  decision_date?: string;
}

export interface EngineeringAction extends EngineeringObjectBase {
  action_number: string;
  originating_object_type?: string;
  originating_object_id?: string;
  completion_date?: string;
}

export interface EngineeringRisk extends EngineeringObjectBase {
  risk_number: string;
  category?: string;
  probability: number;
  consequence: number;
  score: number;
  residual_probability?: number;
  residual_consequence?: number;
  residual_score?: number;
  mitigation?: string;
  controls: unknown[];
}

export interface EngineeringIssue extends EngineeringObjectBase {
  issue_number: string;
  issue_type?: string;
  category?: string;
  impact?: string;
  investigation?: string;
  resolution?: string;
  discovered_by?: string;
}

export interface EngineeringTechnicalQuery extends EngineeringObjectBase {
  tq_number: string;
  question: string;
  requester_id?: string;
  responder_id?: string;
  response?: string;
  response_due?: string;
  document_id?: string;
}

export interface EngineeringLesson extends EngineeringObjectBase {
  lesson_number: string;
  lesson: string;
  recommendation?: string;
  root_cause?: string;
  category?: string;
  lesson_references: unknown[];
}

export interface EngineeringTimelineEvent {
  id: string;
  tenant_id: string;
  event_type: string;
  object_type: string;
  object_id?: string;
  project_id?: string;
  asset_id?: string;
  title: string;
  summary?: string;
  actor_id?: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
}

export interface EngineeringActivityEvent {
  id: string;
  tenant_id: string;
  activity_type: string;
  object_type?: string;
  object_id?: string;
  project_id?: string;
  title: string;
  body?: string;
  actor_id?: string;
  severity: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const ENGINEERING_REGISTER_OBJECT_TYPES: EngineeringObjectType[] = [
  "decision",
  "action",
  "risk",
  "issue",
  "technical_query",
  "lesson",
];

export const REGISTER_KG_NODE_TYPES: Record<string, string> = {
  decision: "engineering_decision",
  action: "engineering_action",
  risk: "engineering_risk",
  issue: "engineering_issue",
  technical_query: "engineering_technical_query",
  lesson: "engineering_lesson",
};
