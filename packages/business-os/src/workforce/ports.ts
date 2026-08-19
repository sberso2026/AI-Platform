import type {
  BusinessWorkforceApprovalDecision,
  BusinessWorkforceAuthorityClass,
  BusinessWorkforceInstallStatus,
  BusinessWorkforceRunState,
} from "@rtb/types";
import type { PolicyEvaluationResult } from "@rtb/types";

export type WorkforceActor = {
  userId: string;
  actorType: "human" | "agent";
  agentId?: string;
};

export type WorkforceInstallation = {
  id: string;
  tenantId: string;
  workspaceId: string;
  catalogSlug: string;
  kernelAgentId: string | null;
  status: BusinessWorkforceInstallStatus;
  authority: BusinessWorkforceAuthorityClass;
  os: "business";
  moduleCapability: string;
  permissions: string[];
  toolAllowlist: string[];
  contextScope: string[];
  promptPolicy: Record<string, unknown>;
  modelPolicy: Record<string, unknown>;
  budget: { maxTokens: number; maxToolCalls: number; maxRuntimeMs: number; maxHandoffs: number };
  config: Record<string, unknown>;
  installedBy: string;
  enabledAt: string | null;
  suspendedAt: string | null;
  revokedAt: string | null;
  provenance: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type WorkforceTask = {
  id: string;
  tenantId: string;
  workspaceId: string;
  installationId: string;
  requestedBy: string;
  intent: string;
  entityType: string | null;
  entityId: string | null;
  state: BusinessWorkforceRunState;
  policyDecision: Record<string, unknown> | null;
  provenance: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type WorkforceRun = {
  id: string;
  taskId: string;
  tenantId: string;
  workspaceId: string;
  installationId: string;
  kernelRunId: string | null;
  state: BusinessWorkforceRunState;
  authority: BusinessWorkforceAuthorityClass;
  toolCalls: Array<{ toolId: string; at: string; result: string }>;
  contextRefs: string[];
  explanation: {
    evidence: Array<{ sourceRef: string; provenance: Record<string, unknown>; freshness: string | null }>;
    derivedRecommendation: string;
    assumption: string[];
    missingEvidence: string[];
    chainOfThoughtExposed: false;
  };
  budgetUsed: { tokens: number; toolCalls: number; runtimeMs: number; handoffs: number };
  visitedAgents: string[];
  startedAt: string;
  completedAt: string | null;
  failureCode: string | null;
  blockedReason: string | null;
  draft: Record<string, unknown> | null;
  provenance: Record<string, unknown>;
};

export type WorkforceApproval = {
  id: string;
  runId: string;
  tenantId: string;
  workspaceId: string;
  requestedBy: string;
  decidedBy: string | null;
  decision: BusinessWorkforceApprovalDecision;
  decidedAt: string | null;
  reason: string | null;
  provenance: Record<string, unknown>;
};

export type WorkforceHandoff = {
  id: string;
  runId: string;
  fromInstallationId: string;
  toCatalogSlug: string;
  tenantId: string;
  workspaceId: string;
  trimmedPermissions: string[];
  trimmedTools: string[];
  trimmedAuthority: BusinessWorkforceAuthorityClass;
  status: "requested" | "accepted" | "rejected";
  provenance: Record<string, unknown>;
};

export type WorkforceSettings = {
  maxHandoffs: number;
  maxToolCalls: number;
  maxRuntimeMs: number;
  maxTokens: number;
  staleContextHours: number;
};

export type WorkforceAuditEntry = {
  at: string;
  action: string;
  actorId: string;
  agentId: string | null;
  workspaceId: string;
  taskId: string | null;
  runId: string | null;
  policyDecision: string | null;
  authority: string | null;
  sourceRefs: string[];
  toolRefs: string[];
};

export type WorkforceMemoryEntry = {
  id: string;
  tenantId: string;
  scopeKey: "agent";
  scopeRefId: string;
  content: string;
  classification: "general";
  authoritative: false;
  generated: true;
};

export interface WorkforceStore {
  listInstallations(scope: { tenantId: string; workspaceId: string }): Promise<WorkforceInstallation[]>;
  getInstallation(scope: { tenantId: string; workspaceId: string }, id: string): Promise<WorkforceInstallation | null>;
  getInstallationBySlug(
    scope: { tenantId: string; workspaceId: string },
    slug: string,
  ): Promise<WorkforceInstallation | null>;
  upsertInstallation(row: WorkforceInstallation): Promise<WorkforceInstallation>;
  listTasks(scope: { tenantId: string; workspaceId: string }): Promise<WorkforceTask[]>;
  getTask(scope: { tenantId: string; workspaceId: string }, id: string): Promise<WorkforceTask | null>;
  upsertTask(row: WorkforceTask): Promise<WorkforceTask>;
  listRuns(scope: { tenantId: string; workspaceId: string }): Promise<WorkforceRun[]>;
  getRun(scope: { tenantId: string; workspaceId: string }, id: string): Promise<WorkforceRun | null>;
  upsertRun(row: WorkforceRun): Promise<WorkforceRun>;
  listApprovals(scope: { tenantId: string; workspaceId: string }): Promise<WorkforceApproval[]>;
  getApproval(scope: { tenantId: string; workspaceId: string }, id: string): Promise<WorkforceApproval | null>;
  upsertApproval(row: WorkforceApproval): Promise<WorkforceApproval>;
  listHandoffs(scope: { tenantId: string; workspaceId: string }, runId?: string): Promise<WorkforceHandoff[]>;
  upsertHandoff(row: WorkforceHandoff): Promise<WorkforceHandoff>;
  getSettings(scope: { tenantId: string; workspaceId: string }): Promise<WorkforceSettings>;
  upsertSettings(scope: { tenantId: string; workspaceId: string }, settings: WorkforceSettings): Promise<WorkforceSettings>;
  appendAudit(scope: { tenantId: string; workspaceId: string }, entry: WorkforceAuditEntry): Promise<void>;
  listAudit(scope: { tenantId: string; workspaceId: string }): Promise<WorkforceAuditEntry[]>;
  storeMemory(entry: WorkforceMemoryEntry): Promise<WorkforceMemoryEntry>;
  retrieveMemory(tenantId: string, scopeRefId: string): Promise<WorkforceMemoryEntry[]>;
}

export interface AgentRegistryPort {
  upsertCatalogAgent(input: {
    tenantId: string;
    slug: string;
    name: string;
    description: string;
    capabilities: string[];
    metadata: Record<string, unknown>;
    isActive: boolean;
    requiresReview: boolean;
    systemPrompt: string;
  }): Promise<{ id: string; slug: string; isActive: boolean }>;
  getAgentBySlug(tenantId: string, slug: string): Promise<{ id: string; slug: string; isActive: boolean } | null>;
  setAgentActive(tenantId: string, agentId: string, isActive: boolean): Promise<void>;
}

export interface PolicyPort {
  evaluate(input: {
    tenantId: string;
    intent: string;
    operatingSystem: "business";
    agentId?: string;
    toolId?: string;
    simulation?: boolean;
  }): Promise<PolicyEvaluationResult>;
}
