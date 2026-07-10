/**
 * RTB AI Platform — Platform Intelligence Control Layer Types (Batch 1.75)
 */

export type ToolRiskLevel = "low" | "medium" | "high" | "critical";
export type ToolStatus = "draft" | "active" | "deprecated" | "disabled";
export type PolicyActionType =
  | "allow"
  | "deny"
  | "require_review"
  | "require_approval"
  | "redact"
  | "escalate"
  | "log_only";
export type PolicyConditionType =
  | "confidence_threshold"
  | "risk_level"
  | "role_required"
  | "tenant_setting"
  | "model_provider_allowed"
  | "tool_permission_required"
  | "human_review_required"
  | "data_classification"
  | "operating_system_scope"
  | "workflow_state";
export type PromptStatus =
  | "draft"
  | "review"
  | "approved"
  | "active"
  | "deprecated"
  | "archived";
export type CostEventType =
  | "model_call"
  | "tool_call"
  | "background_job"
  | "document_processing"
  | "embedding_generation"
  | "telemetry_processing"
  | "report_generation";
export type EvalDimension =
  | "factual_accuracy"
  | "evidence_alignment"
  | "citation_quality"
  | "completeness"
  | "safety"
  | "policy_compliance"
  | "reasoning_quality"
  | "format_compliance"
  | "tool_use_correctness";

export interface PolicyEvaluationContext {
  tenantId: string;
  intent?: string;
  confidence?: number;
  riskLevel?: ToolRiskLevel;
  operatingSystem?: string;
  modelProvider?: string;
  toolId?: string;
  agentId?: string;
  workflowState?: string;
  dataClassification?: string;
  simulation?: boolean;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  requiresReview: boolean;
  requiresApproval: boolean;
  actions: PolicyActionType[];
  violations: string[];
  evaluationIds: string[];
}

export interface ModelRouteResolution {
  modelKey: string;
  modelId: string;
  providerType: string;
  providerId: string;
  costInputPer1k: number;
  costOutputPer1k: number;
}

export interface TraceContext {
  tenantId: string;
  name: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface CostEventInput {
  tenantId: string;
  workspaceId?: string;
  eventType: CostEventType;
  amount: number;
  quantity?: number;
  unit?: string;
  metadata?: Record<string, unknown>;
  sourceType?: string;
  sourceId?: string;
  userId?: string;
  allocations?: { dimension: string; dimensionId?: string; amount: number }[];
}

export interface FeatureEvaluationInput {
  tenantId: string;
  featureKey: string;
  userId?: string;
  environment?: string;
}

export interface SecretAccessInput {
  tenantId: string;
  secretId: string;
  accessorId?: string;
  accessType: "read" | "rotate" | "revoke";
}
