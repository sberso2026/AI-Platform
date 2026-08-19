import type { PolicyEvaluationResult } from "@rtb/types";
import type {
  AgentRegistryPort,
  PolicyPort,
  WorkforceApproval,
  WorkforceAuditEntry,
  WorkforceHandoff,
  WorkforceInstallation,
  WorkforceMemoryEntry,
  WorkforceRun,
  WorkforceSettings,
  WorkforceStore,
  WorkforceTask,
} from "./ports";

const DEFAULT_SETTINGS: WorkforceSettings = {
  maxHandoffs: 2,
  maxToolCalls: 8,
  maxRuntimeMs: 30_000,
  maxTokens: 4_000,
  staleContextHours: 24,
};

function scoped<T extends { tenantId: string; workspaceId: string }>(
  rows: T[],
  scope: { tenantId: string; workspaceId: string },
): T[] {
  return rows.filter((row) => row.tenantId === scope.tenantId && row.workspaceId === scope.workspaceId);
}

export function createMemoryWorkforceStore(): WorkforceStore {
  const installations: WorkforceInstallation[] = [];
  const tasks: WorkforceTask[] = [];
  const runs: WorkforceRun[] = [];
  const approvals: WorkforceApproval[] = [];
  const handoffs: WorkforceHandoff[] = [];
  const settings = new Map<string, WorkforceSettings>();
  const audit: Array<WorkforceAuditEntry & { tenantId: string }> = [];
  const memories: WorkforceMemoryEntry[] = [];
  const key = (scope: { tenantId: string; workspaceId: string }) => `${scope.tenantId}:${scope.workspaceId}`;

  return {
    async listInstallations(scope) {
      return scoped(installations, scope);
    },
    async getInstallation(scope, id) {
      return scoped(installations, scope).find((row) => row.id === id) ?? null;
    },
    async getInstallationBySlug(scope, slug) {
      return scoped(installations, scope).find((row) => row.catalogSlug === slug) ?? null;
    },
    async upsertInstallation(row) {
      const idx = installations.findIndex((item) => item.id === row.id);
      if (idx >= 0) installations[idx] = row;
      else installations.push(row);
      return row;
    },
    async listTasks(scope) {
      return scoped(tasks, scope);
    },
    async getTask(scope, id) {
      return scoped(tasks, scope).find((row) => row.id === id) ?? null;
    },
    async upsertTask(row) {
      const idx = tasks.findIndex((item) => item.id === row.id);
      if (idx >= 0) tasks[idx] = row;
      else tasks.push(row);
      return row;
    },
    async listRuns(scope) {
      return scoped(runs, scope);
    },
    async getRun(scope, id) {
      return scoped(runs, scope).find((row) => row.id === id) ?? null;
    },
    async upsertRun(row) {
      const idx = runs.findIndex((item) => item.id === row.id);
      if (idx >= 0) runs[idx] = row;
      else runs.push(row);
      return row;
    },
    async listApprovals(scope) {
      return scoped(approvals, scope);
    },
    async getApproval(scope, id) {
      return scoped(approvals, scope).find((row) => row.id === id) ?? null;
    },
    async upsertApproval(row) {
      const idx = approvals.findIndex((item) => item.id === row.id);
      if (idx >= 0) approvals[idx] = row;
      else approvals.push(row);
      return row;
    },
    async listHandoffs(scope, runId) {
      return scoped(handoffs, scope).filter((row) => (runId ? row.runId === runId : true));
    },
    async upsertHandoff(row) {
      const idx = handoffs.findIndex((item) => item.id === row.id);
      if (idx >= 0) handoffs[idx] = row;
      else handoffs.push(row);
      return row;
    },
    async getSettings(scope) {
      return settings.get(key(scope)) ?? { ...DEFAULT_SETTINGS };
    },
    async upsertSettings(scope, next) {
      settings.set(key(scope), next);
      return next;
    },
    async appendAudit(scope, entry) {
      audit.push({ ...entry, tenantId: scope.tenantId });
    },
    async listAudit(scope) {
      return audit.filter((row) => row.tenantId === scope.tenantId && row.workspaceId === scope.workspaceId);
    },
    async storeMemory(entry) {
      memories.push(entry);
      return entry;
    },
    async retrieveMemory(tenantId, scopeRefId) {
      return memories.filter((row) => row.tenantId === tenantId && row.scopeRefId === scopeRefId);
    },
  };
}

export function createMemoryAgentRegistry(): AgentRegistryPort {
  const agents = new Map<string, { id: string; slug: string; isActive: boolean; tenantId: string }>();
  const idFor = (tenantId: string, slug: string) => `kernel-agent:${tenantId}:${slug}`;
  return {
    async upsertCatalogAgent(input) {
      const id = agents.get(`${input.tenantId}:${input.slug}`)?.id ?? idFor(input.tenantId, input.slug);
      const row = { id, slug: input.slug, isActive: input.isActive, tenantId: input.tenantId };
      agents.set(`${input.tenantId}:${input.slug}`, row);
      agents.set(id, row);
      return { id, slug: input.slug, isActive: input.isActive };
    },
    async getAgentBySlug(tenantId, slug) {
      const row = agents.get(`${tenantId}:${slug}`);
      return row ? { id: row.id, slug: row.slug, isActive: row.isActive } : null;
    },
    async setAgentActive(tenantId, agentId, isActive) {
      const row = [...agents.values()].find((item) => item.id === agentId && item.tenantId === tenantId);
      if (!row) throw new Error("Agent not found");
      row.isActive = isActive;
    },
  };
}

export function allowPolicyPort(): PolicyPort {
  return {
    async evaluate(): Promise<PolicyEvaluationResult> {
      return {
        allowed: true,
        requiresReview: false,
        requiresApproval: false,
        actions: ["allow"],
        violations: [],
        evaluationIds: ["memory-allow"],
      };
    },
  };
}

export function denyPolicyPort(): PolicyPort {
  return {
    async evaluate(): Promise<PolicyEvaluationResult> {
      return {
        allowed: false,
        requiresReview: false,
        requiresApproval: false,
        actions: ["deny"],
        violations: ["policy_denied"],
        evaluationIds: ["memory-deny"],
      };
    },
  };
}
