/**
 * RTB AI OS — Platform Kernel Types (Phase 1.5)
 */

// ─── AI Director ─────────────────────────────────────────────────────────────

export type AgentRunStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "review_required"
  | "cancelled";

export type ModelProviderType =
  | "mock"
  | "openai"
  | "anthropic"
  | "gemini"
  | "azure_openai"
  | "local";

export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  agent_type: string;
  system_prompt?: string;
  capabilities: unknown[];
  requires_review: boolean;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AgentRun {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  agent_id: string;
  user_id?: string;
  session_id?: string;
  status: AgentRunStatus;
  intent?: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  confidence?: number;
  evidence_refs: EvidenceRef[];
  requires_review: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  review_status?: "pending" | "approved" | "rejected";
  error_message?: string;
  model_provider?: string;
  model_name?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EvidenceRef {
  source_id: string;
  source_type: string;
  title: string;
  excerpt?: string;
  score?: number;
}

export interface AgentRunRequest {
  tenantId: string;
  workspaceId?: string;
  userId: string;
  agentId?: string;
  sessionId?: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface AgentRunResponse {
  run: AgentRun;
  message: string;
  requiresReview: boolean;
}

export interface ModelAdapter {
  readonly providerType: ModelProviderType;
  complete(params: {
    model: string;
    messages: { role: string; content: string }[];
    tools?: unknown[];
  }): Promise<{
    content: string;
    confidence: number;
    evidenceRefs?: EvidenceRef[];
    toolCalls?: unknown[];
  }>;
}

export interface IntentClassifier {
  classify(message: string, context?: Record<string, unknown>): Promise<string>;
}

// ─── Event Bus ───────────────────────────────────────────────────────────────

export type PlatformEventType =
  | "tenant.created"
  | "workspace.created"
  | "plugin.installed"
  | "document.uploaded"
  | "agent.run.started"
  | "agent.run.completed"
  | "review.required"
  | "decision.created"
  | "risk.created"
  | "workflow.started"
  | "workflow.completed";

export interface PlatformEvent {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  event_type: string;
  source: string;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  correlation_id?: string;
  causation_id?: string;
  status: "published" | "dispatched" | "failed";
  created_at: string;
}

export interface EventSubscriber {
  eventType: string;
  handle(event: PlatformEvent): Promise<void>;
}

// ─── Background Jobs ─────────────────────────────────────────────────────────

export type JobType =
  | "document.index"
  | "embedding.generate"
  | "ai.agent.run"
  | "notification.send"
  | "report.generate"
  | "telemetry.process"
  | "workflow.advance";

export type JobStatus =
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface BackgroundJob {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  job_type: string;
  status: JobStatus;
  priority: number;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  scheduled_for?: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface JobHandler {
  jobType: JobType;
  handle(job: BackgroundJob): Promise<Record<string, unknown>>;
}

// ─── Workflow ──────────────────────────────────────────────────────────────────

export type WorkflowStepType =
  | "action"
  | "approval"
  | "human_review"
  | "condition"
  | "notification"
  | "agent"
  | "delay";

export interface WorkflowDefinition {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowInstance {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  definition_id: string;
  version_id: string;
  status: "running" | "completed" | "failed" | "cancelled" | "waiting_review";
  current_step_key?: string;
  context: Record<string, unknown>;
  started_by?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// ─── Knowledge Graph ─────────────────────────────────────────────────────────

export interface KnowledgeNode {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  node_type: string;
  title: string;
  content: Record<string, unknown>;
  source_ref?: string;
  metadata: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeEdge {
  id: string;
  tenant_id: string;
  from_node_id: string;
  to_node_id: string;
  edge_type: string;
  weight?: number;
  metadata: Record<string, unknown>;
  created_by?: string;
  created_at: string;
}

export interface EvidenceItem {
  id: string;
  tenant_id: string;
  node_id?: string;
  source_type: string;
  source_id: string;
  excerpt?: string;
  score?: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── AI Memory ───────────────────────────────────────────────────────────────

export type MemoryScopeKey =
  | "conversation"
  | "agent"
  | "project"
  | "workspace"
  | "tenant"
  | "operating_system";

export type MemoryClassification = "general" | "sensitive" | "confidential" | "public";

export interface AIMemory {
  id: string;
  tenant_id: string;
  scope_key: MemoryScopeKey;
  scope_ref_id: string;
  content: string;
  classification: MemoryClassification;
  metadata: Record<string, unknown>;
  created_by?: string;
  expires_at?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

// ─── Digital Twin ────────────────────────────────────────────────────────────

export interface DigitalTwin {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  twin_type: string;
  name: string;
  external_id?: string;
  status: "active" | "inactive" | "maintenance" | "decommissioned";
  metadata: Record<string, unknown>;
  knowledge_node_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ─── API Gateway ─────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType =
  | "review.required"
  | "agent.completed"
  | "workflow.failed"
  | "task.assigned"
  | "plugin.installed"
  | "system.warning";

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string;
  priority: "low" | "normal" | "high" | "urgent";
  link_target?: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// ─── Telemetry ─────────────────────────────────────────────────────────────────

export interface Sensor {
  id: string;
  tenant_id: string;
  name: string;
  sensor_type: string;
  digital_twin_id?: string;
  location?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Plugin Lifecycle ────────────────────────────────────────────────────────

export interface PluginRecord {
  id: string;
  plugin_id: string;
  name: string;
  description?: string;
  author: string;
  operating_system?: string;
  is_official: boolean;
  created_at: string;
  updated_at: string;
}

export interface PluginInstallation {
  id: string;
  tenant_id: string;
  plugin_id: string;
  plugin_version_id: string;
  status: "installed" | "enabled" | "disabled" | "error" | "uninstalled";
  config: Record<string, unknown>;
  installed_by?: string;
  installed_at: string;
  updated_at: string;
}
