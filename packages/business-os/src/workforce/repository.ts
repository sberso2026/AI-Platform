import type { SupabaseClient } from "@rtb/database";
import type {
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

function table(supabase: SupabaseClient, name: string) {
  return supabase.from(name) as ReturnType<SupabaseClient["from"]>;
}

function nowIso() {
  return new Date().toISOString();
}

const DEFAULT_SETTINGS: WorkforceSettings = {
  maxHandoffs: 2,
  maxToolCalls: 8,
  maxRuntimeMs: 30_000,
  maxTokens: 4_000,
  staleContextHours: 24,
};

function mapInstallation(row: Record<string, unknown>): WorkforceInstallation {
  const budget = (row.budget as Record<string, unknown>) ?? {};
  const limits = (row.limits as Record<string, unknown>) ?? {};
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    catalogSlug: String(row.catalog_slug),
    kernelAgentId: (row.kernel_agent_id as string | null) ?? null,
    status: row.status as WorkforceInstallation["status"],
    authority: row.authority as WorkforceInstallation["authority"],
    os: "business",
    moduleCapability: String(row.module_capability ?? "ai_workforce"),
    permissions: (row.permissions as string[]) ?? [],
    toolAllowlist: (row.tool_allowlist as string[]) ?? [],
    contextScope: (row.context_scope as string[]) ?? [],
    promptPolicy: (row.prompt_policy as Record<string, unknown>) ?? {},
    modelPolicy: (row.model_policy as Record<string, unknown>) ?? {},
    budget: {
      maxTokens: Number(budget.maxTokens ?? limits.maxTokens ?? 4000),
      maxToolCalls: Number(budget.maxToolCalls ?? limits.maxToolCalls ?? 8),
      maxRuntimeMs: Number(budget.maxRuntimeMs ?? limits.maxRuntimeMs ?? 30_000),
      maxHandoffs: Number(budget.maxHandoffs ?? limits.maxHandoffs ?? 2),
    },
    config: (row.config as Record<string, unknown>) ?? {},
    installedBy: String(row.installed_by ?? ""),
    enabledAt: (row.enabled_at as string | null) ?? null,
    suspendedAt: (row.suspended_at as string | null) ?? null,
    revokedAt: (row.revoked_at as string | null) ?? null,
    provenance: (row.provenance as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at ?? nowIso()),
    updatedAt: String(row.updated_at ?? nowIso()),
  };
}

export class BusinessWorkforceRepository implements WorkforceStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async listInstallations(scope: { tenantId: string; workspaceId: string }) {
    try {
      const { data } = await table(this.supabase, "business_os_workforce_installations")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId);
      return ((data ?? []) as Record<string, unknown>[]).map(mapInstallation);
    } catch {
      return [];
    }
  }

  async getInstallation(scope: { tenantId: string; workspaceId: string }, id: string) {
    const rows = await this.listInstallations(scope);
    return rows.find((row) => row.id === id) ?? null;
  }

  async getInstallationBySlug(scope: { tenantId: string; workspaceId: string }, slug: string) {
    const rows = await this.listInstallations(scope);
    return rows.find((row) => row.catalogSlug === slug) ?? null;
  }

  async upsertInstallation(row: WorkforceInstallation) {
    await table(this.supabase, "business_os_workforce_installations").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      catalog_slug: row.catalogSlug,
      kernel_agent_id: row.kernelAgentId,
      status: row.status,
      authority: row.authority,
      os: row.os,
      module_capability: row.moduleCapability,
      permissions: row.permissions,
      tool_allowlist: row.toolAllowlist,
      context_scope: row.contextScope,
      prompt_policy: row.promptPolicy,
      model_policy: row.modelPolicy,
      budget: row.budget,
      limits: row.budget,
      config: row.config,
      installed_by: row.installedBy || null,
      enabled_at: row.enabledAt,
      suspended_at: row.suspendedAt,
      revoked_at: row.revokedAt,
      provenance: row.provenance,
      updated_at: row.updatedAt,
    } as never);
    return row;
  }

  async listTasks(scope: { tenantId: string; workspaceId: string }) {
    try {
      const { data } = await table(this.supabase, "business_os_workforce_tasks")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId);
      return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        tenantId: String(row.tenant_id),
        workspaceId: String(row.workspace_id),
        installationId: String(row.installation_id),
        requestedBy: String(row.requested_by ?? ""),
        intent: String(row.intent ?? ""),
        entityType: (row.entity_type as string | null) ?? null,
        entityId: (row.entity_id as string | null) ?? null,
        state: row.state as WorkforceTask["state"],
        policyDecision: (row.policy_decision as Record<string, unknown> | null) ?? null,
        provenance: (row.provenance as Record<string, unknown>) ?? {},
        createdAt: String(row.created_at ?? nowIso()),
        updatedAt: String(row.updated_at ?? nowIso()),
      }));
    } catch {
      return [];
    }
  }

  async getTask(scope: { tenantId: string; workspaceId: string }, id: string) {
    return (await this.listTasks(scope)).find((row) => row.id === id) ?? null;
  }

  async upsertTask(row: WorkforceTask) {
    await table(this.supabase, "business_os_workforce_tasks").upsert({
      id: row.id,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      installation_id: row.installationId,
      requested_by: row.requestedBy || null,
      intent: row.intent,
      entity_type: row.entityType,
      entity_id: row.entityId,
      state: row.state,
      policy_decision: row.policyDecision,
      provenance: row.provenance,
      updated_at: row.updatedAt,
    } as never);
    return row;
  }

  async listRuns(scope: { tenantId: string; workspaceId: string }) {
    try {
      const { data } = await table(this.supabase, "business_os_workforce_runs")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId);
      return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        taskId: String(row.task_id),
        tenantId: String(row.tenant_id),
        workspaceId: String(row.workspace_id),
        installationId: String(row.installation_id),
        kernelRunId: (row.kernel_run_id as string | null) ?? null,
        state: row.state as WorkforceRun["state"],
        authority: row.authority as WorkforceRun["authority"],
        toolCalls: (row.tool_calls as WorkforceRun["toolCalls"]) ?? [],
        contextRefs: (row.context_refs as string[]) ?? [],
        explanation: (row.explanation as WorkforceRun["explanation"]) ?? {
          evidence: [],
          derivedRecommendation: "",
          assumption: [],
          missingEvidence: [],
          chainOfThoughtExposed: false as const,
        },
        budgetUsed: (row.budget_used as WorkforceRun["budgetUsed"]) ?? {
          tokens: 0,
          toolCalls: 0,
          runtimeMs: 0,
          handoffs: 0,
        },
        visitedAgents: (row.visited_agents as string[]) ?? [],
        startedAt: String(row.started_at ?? nowIso()),
        completedAt: (row.completed_at as string | null) ?? null,
        failureCode: (row.failure_code as string | null) ?? null,
        blockedReason: (row.blocked_reason as string | null) ?? null,
        draft: (row.draft as Record<string, unknown> | null) ?? null,
        provenance: (row.provenance as Record<string, unknown>) ?? {},
      }));
    } catch {
      return [];
    }
  }

  async getRun(scope: { tenantId: string; workspaceId: string }, id: string) {
    return (await this.listRuns(scope)).find((row) => row.id === id) ?? null;
  }

  async upsertRun(row: WorkforceRun) {
    await table(this.supabase, "business_os_workforce_runs").upsert({
      id: row.id,
      task_id: row.taskId,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      installation_id: row.installationId,
      kernel_run_id: row.kernelRunId,
      state: row.state,
      authority: row.authority,
      tool_calls: row.toolCalls,
      context_refs: row.contextRefs,
      explanation: row.explanation,
      budget_used: row.budgetUsed,
      visited_agents: row.visitedAgents,
      started_at: row.startedAt,
      completed_at: row.completedAt,
      failure_code: row.failureCode,
      blocked_reason: row.blockedReason,
      draft: row.draft,
      provenance: row.provenance,
    } as never);
    return row;
  }

  async listApprovals(scope: { tenantId: string; workspaceId: string }) {
    try {
      const { data } = await table(this.supabase, "business_os_workforce_approvals")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId);
      return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        runId: String(row.run_id),
        tenantId: String(row.tenant_id),
        workspaceId: String(row.workspace_id),
        requestedBy: String(row.requested_by ?? ""),
        decidedBy: (row.decided_by as string | null) ?? null,
        decision: row.decision as WorkforceApproval["decision"],
        decidedAt: (row.decided_at as string | null) ?? null,
        reason: (row.reason as string | null) ?? null,
        provenance: (row.provenance as Record<string, unknown>) ?? {},
      }));
    } catch {
      return [];
    }
  }

  async getApproval(scope: { tenantId: string; workspaceId: string }, id: string) {
    return (await this.listApprovals(scope)).find((row) => row.id === id) ?? null;
  }

  async upsertApproval(row: WorkforceApproval) {
    await table(this.supabase, "business_os_workforce_approvals").upsert({
      id: row.id,
      run_id: row.runId,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      requested_by: row.requestedBy || null,
      decided_by: row.decidedBy,
      decision: row.decision,
      decided_at: row.decidedAt,
      reason: row.reason,
      provenance: row.provenance,
    } as never);
    return row;
  }

  async listHandoffs(scope: { tenantId: string; workspaceId: string }, runId?: string) {
    try {
      let query = table(this.supabase, "business_os_workforce_handoffs")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId);
      if (runId) query = query.eq("run_id", runId);
      const { data } = await query;
      return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        runId: String(row.run_id),
        fromInstallationId: String(row.from_installation_id),
        toCatalogSlug: String(row.to_catalog_slug),
        tenantId: String(row.tenant_id),
        workspaceId: String(row.workspace_id),
        trimmedPermissions: (row.trimmed_permissions as string[]) ?? [],
        trimmedTools: (row.trimmed_tools as string[]) ?? [],
        trimmedAuthority: row.trimmed_authority as WorkforceHandoff["trimmedAuthority"],
        status: row.status as WorkforceHandoff["status"],
        provenance: (row.provenance as Record<string, unknown>) ?? {},
      }));
    } catch {
      return [];
    }
  }

  async upsertHandoff(row: WorkforceHandoff) {
    await table(this.supabase, "business_os_workforce_handoffs").upsert({
      id: row.id,
      run_id: row.runId,
      from_installation_id: row.fromInstallationId,
      to_catalog_slug: row.toCatalogSlug,
      tenant_id: row.tenantId,
      workspace_id: row.workspaceId,
      trimmed_permissions: row.trimmedPermissions,
      trimmed_tools: row.trimmedTools,
      trimmed_authority: row.trimmedAuthority,
      status: row.status,
      provenance: row.provenance,
    } as never);
    return row;
  }

  async getSettings(scope: { tenantId: string; workspaceId: string }) {
    try {
      const { data, error } = await table(this.supabase, "business_os_workforce_settings")
        .select("*")
        .eq("tenant_id", scope.tenantId)
        .eq("workspace_id", scope.workspaceId)
        .maybeSingle();
      if (error || !data) return { ...DEFAULT_SETTINGS };
      const row = data as Record<string, unknown>;
      return {
        maxHandoffs: Number(row.max_handoffs ?? 2),
        maxToolCalls: Number(row.max_tool_calls ?? 8),
        maxRuntimeMs: Number(row.max_runtime_ms ?? 30_000),
        maxTokens: Number(row.max_tokens ?? 4_000),
        staleContextHours: Number(row.stale_context_hours ?? 24),
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  async upsertSettings(scope: { tenantId: string; workspaceId: string }, settings: WorkforceSettings) {
    await table(this.supabase, "business_os_workforce_settings").upsert({
      tenant_id: scope.tenantId,
      workspace_id: scope.workspaceId,
      max_handoffs: settings.maxHandoffs,
      max_tool_calls: settings.maxToolCalls,
      max_runtime_ms: settings.maxRuntimeMs,
      max_tokens: settings.maxTokens,
      stale_context_hours: settings.staleContextHours,
      provenance: { operational: true },
    } as never);
    return settings;
  }

  async appendAudit() {
    // Canonical audit is written via AuditService in the workforce service.
  }

  async listAudit(): Promise<WorkforceAuditEntry[]> {
    return [];
  }

  async storeMemory(entry: WorkforceMemoryEntry) {
    return entry;
  }

  async retrieveMemory(): Promise<WorkforceMemoryEntry[]> {
    return [];
  }
}
