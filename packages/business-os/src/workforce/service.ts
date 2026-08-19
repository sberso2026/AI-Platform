import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import {
  BUSINESS_OS_EVENT_TYPES,
  BUSINESS_WORKFORCE_AUTHORITY_CLASSES,
  BUSINESS_WORKFORCE_FORBIDDEN_TOOLS,
  BUSINESS_WORKFORCE_READ_TOOLS,
  type BusinessWorkforceAuthorityClass,
} from "@rtb/types";
import type { OwnerCommandScope } from "../owner-command/service";
import type { BusinessContextGraphService } from "../context/service";
import {
  authorityIsAdvisory,
  authorityRequiresApproval,
  BUSINESS_WORKFORCE_CATALOG,
  catalogEntry,
  minAuthority,
} from "./catalog";
import { AI_WORKFORCE_CONTRACT } from "./extensions";
import { kernelPolicyPort } from "./policy";
import type {
  AgentRegistryPort,
  PolicyPort,
  WorkforceActor,
  WorkforceInstallation,
  WorkforceRun,
  WorkforceStore,
} from "./ports";
import { kernelAgentRegistry } from "./registry";
import { BusinessWorkforceRepository } from "./repository";
import { createMemoryAgentRegistry, createMemoryWorkforceStore } from "./store";
import { assertToolAllowlisted, isForbiddenTool, isReadTool, trimToolAllowlist } from "./tools";
import { diagnoseWorkforce } from "./diagnostics";
import { demoWorkforceSeed } from "./demo";
import type { BosConnectorsService } from "../connectors/service";

function requireWorkspace(scope: { tenantId: string; workspaceId?: string; userId: string }): OwnerCommandScope {
  if (!scope.workspaceId) throw new Error("workspace_not_assigned");
  return { tenantId: scope.tenantId, workspaceId: scope.workspaceId, userId: scope.userId };
}

function assertHuman(actor: WorkforceActor, code: string): void {
  if (actor.actorType !== "human") throw new Error(code);
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export type AiWorkforceOptions = {
  store?: WorkforceStore;
  registry?: AgentRegistryPort;
  policy?: PolicyPort;
  now?: () => Date;
  connectors?: BosConnectorsService;
};

export class AiWorkforceService {
  readonly store: WorkforceStore;
  private readonly registry: AgentRegistryPort;
  private readonly policy: PolicyPort;
  private readonly now: () => Date;
  private readonly connectors: BosConnectorsService | null;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel: PlatformKernel,
    private readonly audit: AuditService,
    private readonly context: BusinessContextGraphService,
    options: AiWorkforceOptions = {},
  ) {
    this.store = options.store ?? new BusinessWorkforceRepository(supabase);
    this.registry = options.registry ?? kernelAgentRegistry(kernel.aiDirector);
    this.policy = options.policy ?? kernelPolicyPort(kernel);
    this.now = options.now ?? (() => new Date());
    this.connectors = options.connectors ?? null;
  }

  contract() {
    return AI_WORKFORCE_CONTRACT;
  }

  status() {
    return {
      available: true as const,
      implemented: true as const,
      implementsOwnAiStack: false as const,
      duplicateAgentRuntimeDetected: false as const,
      autonomousApprovalEnabled: false as const,
      directProviderAccess: false as const,
      unrestrictedGraphAccess: false as const,
      canonicalDomainMutationBypass: false as const,
      crossTenantAgentAccess: false as const,
    };
  }

  catalog() {
    return BUSINESS_WORKFORCE_CATALOG.map((row) => ({ ...row, os: "business" as const }));
  }

  executeArbitrary(): never {
    throw new Error("unrestricted_agent_execution_forbidden");
  }

  callModelProvider(): never {
    throw new Error("direct_provider_access_forbidden");
  }

  mutateCanonicalRecord(): never {
    throw new Error("canonical_domain_mutation_forbidden");
  }

  mutateEngineeringRecord(): never {
    throw new Error("engineering_os_internal_projection_forbidden");
  }

  selfRegister(): never {
    throw new Error("self_registration_forbidden");
  }

  selfEnable(): never {
    throw new Error("self_enable_forbidden");
  }

  selfApprove(): never {
    throw new Error("self_approval_forbidden");
  }

  autonomousApprove(): never {
    throw new Error("autonomous_approval_forbidden");
  }

  unrestrictedGraph(): never {
    return this.context.executeRawGraphQuery();
  }

  async overview(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const [installations, runs, approvals, diagnostics] = await Promise.all([
      this.store.listInstallations(scope),
      this.store.listRuns(scope),
      this.store.listApprovals(scope),
      this.diagnostics(scope),
    ]);
    return {
      contract: this.contract(),
      catalog: this.catalog(),
      installations,
      runs,
      pendingApprovals: approvals.filter((row) => row.decision === "pending"),
      diagnostics,
      advisoryDefault: true,
      autonomousApprovalEnabled: false,
    };
  }

  async listAgents(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const installations = await this.store.listInstallations(scope);
    return {
      catalog: this.catalog(),
      installations,
    };
  }

  async agentDetail(raw: { tenantId: string; workspaceId?: string; userId: string }, id: string) {
    const scope = requireWorkspace(raw);
    const installation = await this.store.getInstallation(scope, id);
    if (!installation) throw new Error("agent installation not found");
    const definition = catalogEntry(installation.catalogSlug);
    return { installation, definition, advisory: definition?.advisory ?? true };
  }

  async install(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { slug: string; config?: Record<string, unknown> },
    actor: WorkforceActor,
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor, "self_registration_forbidden");
    const definition = catalogEntry(input.slug);
    if (!definition) throw new Error("self_registration_forbidden");
    const existing = await this.store.getInstallationBySlug(scope, definition.slug);
    if (existing && existing.status !== "revoked") return existing;

    let kernelAgentId: string | null = null;
    try {
      const registered = await this.registry.upsertCatalogAgent({
        tenantId: scope.tenantId,
        slug: definition.slug,
        name: definition.name,
        description: definition.description,
        capabilities: [definition.moduleCapability, "business"],
        metadata: {
          os: "business",
          authority: definition.authority,
          workforce: true,
          catalog: true,
        },
        isActive: false,
        requiresReview: true,
        systemPrompt:
          "Use only structured BOS-10 context. Graph adjacency is not causation. Do not expose chain-of-thought. Advisory unless separately approved.",
      });
      kernelAgentId = registered.id;
    } catch {
      kernelAgentId = null;
    }

    const row: WorkforceInstallation = {
      id: existing?.id ?? newId("bos11-install"),
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      catalogSlug: definition.slug,
      kernelAgentId,
      status: "installed",
      authority: definition.authority,
      os: "business",
      moduleCapability: definition.moduleCapability,
      permissions: [...definition.permissions],
      toolAllowlist: [...definition.toolAllowlist],
      contextScope: [...definition.contextScope],
      promptPolicy: { registry: "platform_prompt_registry", noDirectProvider: true },
      modelPolicy: { registry: "platform_model_registry", noDirectProvider: true },
      budget: {
        maxTokens: definition.maxTokens,
        maxToolCalls: definition.maxToolCalls,
        maxRuntimeMs: definition.maxRuntimeMs,
        maxHandoffs: definition.maxHandoffs,
      },
      config: input.config ?? {},
      installedBy: actor.userId,
      enabledAt: null,
      suspendedAt: null,
      revokedAt: null,
      provenance: { catalog: definition.slug, kernelAgentId },
      createdAt: existing?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };
    await this.store.upsertInstallation(row);
    await this.auditSafe(scope, "install", "business_os_workforce_installation", row.id, {
      slug: row.catalogSlug,
      authority: row.authority,
    });
    await this.emit(scope, "business_os.ai_workforce.agent_installed", {
      installationId: row.id,
      slug: row.catalogSlug,
    });
    return row;
  }

  async configure(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    input: { config?: Record<string, unknown>; authority?: BusinessWorkforceAuthorityClass },
    actor: WorkforceActor,
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor, "self_registration_forbidden");
    const installation = await this.requireInstallation(scope, id);
    if (installation.status === "revoked") throw new Error("agent_not_enabled");
    const definition = catalogEntry(installation.catalogSlug);
    if (!definition) throw new Error("self_registration_forbidden");
    if (input.authority && input.authority !== definition.authority) {
      const rank: Record<BusinessWorkforceAuthorityClass, number> = {
        observe: 0,
        recommend: 1,
        prepare: 2,
        request_execution: 3,
        execute_with_approval: 4,
      };
      if (rank[input.authority] > rank[definition.authority]) throw new Error("invalid_authority");
    }
    const next = {
      ...installation,
      config: { ...installation.config, ...(input.config ?? {}) },
      authority: input.authority ?? installation.authority,
      updatedAt: nowIso(),
    };
    await this.store.upsertInstallation(next);
    await this.auditSafe(scope, "configure", "business_os_workforce_installation", next.id, {
      authority: next.authority,
    });
    return next;
  }

  async enable(raw: { tenantId: string; workspaceId?: string; userId: string }, id: string, actor: WorkforceActor) {
    const scope = requireWorkspace(raw);
    assertHuman(actor, "self_enable_forbidden");
    const installation = await this.requireInstallation(scope, id);
    if (installation.status === "revoked") throw new Error("agent_not_enabled");
    if (installation.kernelAgentId) {
      try {
        await this.registry.setAgentActive(scope.tenantId, installation.kernelAgentId, true);
      } catch {
        // registry mismatch is reported in diagnostics; do not silently invent a second runtime
      }
    }
    const next = { ...installation, status: "enabled" as const, enabledAt: nowIso(), suspendedAt: null, updatedAt: nowIso() };
    await this.store.upsertInstallation(next);
    await this.auditSafe(scope, "enable", "business_os_workforce_installation", next.id, { status: "enabled" });
    await this.emit(scope, "business_os.ai_workforce.agent_enabled", { installationId: next.id });
    return next;
  }

  async suspend(raw: { tenantId: string; workspaceId?: string; userId: string }, id: string, actor: WorkforceActor) {
    return this.setStatus(raw, id, actor, "suspended");
  }

  async revoke(raw: { tenantId: string; workspaceId?: string; userId: string }, id: string, actor: WorkforceActor) {
    return this.setStatus(raw, id, actor, "revoked");
  }

  async requestTask(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: {
      installationId: string;
      intent: string;
      entityType?: string;
      entityId?: string;
      toolId?: string;
    },
    actor: WorkforceActor,
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor, "self_registration_forbidden");
    const installation = await this.requireInstallation(scope, input.installationId);
    if (installation.status !== "enabled") throw new Error("agent_not_enabled");
    this.assertScope(scope, installation);
    await this.assertExecutionGates(scope, installation);

    const policy = await this.policy.evaluate({
      tenantId: scope.tenantId,
      intent: "business_os.ai_workforce.task",
      operatingSystem: "business",
      agentId: installation.kernelAgentId ?? installation.id,
      simulation: false,
    });
    if (!policy.allowed) throw new Error("policy_rejected");

    const task = await this.store.upsertTask({
      id: newId("bos11-task"),
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      installationId: installation.id,
      requestedBy: actor.userId,
      intent: input.intent,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      state: "requested",
      policyDecision: { allowed: policy.allowed, violations: policy.violations, requiresApproval: policy.requiresApproval },
      provenance: { actor: actor.userId },
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    await this.emit(scope, "business_os.ai_workforce.task_requested", { taskId: task.id, installationId: installation.id });
    await this.auditSafe(scope, "task_requested", "business_os_workforce_task", task.id, {
      installationId: installation.id,
      intent: input.intent,
    });

    const run = await this.store.upsertRun({
      id: newId("bos11-run"),
      taskId: task.id,
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      installationId: installation.id,
      kernelRunId: null,
      state: "requested",
      authority: installation.authority,
      toolCalls: [],
      contextRefs: [],
      explanation: {
        evidence: [],
        derivedRecommendation: "",
        assumption: [],
        missingEvidence: [],
        chainOfThoughtExposed: false,
      },
      budgetUsed: { tokens: 0, toolCalls: 0, runtimeMs: 0, handoffs: 0 },
      visitedAgents: [installation.catalogSlug],
      startedAt: nowIso(),
      completedAt: null,
      failureCode: null,
      blockedReason: null,
      draft: null,
      provenance: { chain: ["agent_registry", "ai_director", "policy", "context", "tool", "approval", "execution", "audit"] },
    });
    await this.emit(scope, "business_os.ai_workforce.run_started", { runId: run.id, taskId: task.id });

    return this.advanceRun(scope, task.id, run.id, input.toolId, actor);
  }

  async listTasks(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    return this.store.listTasks(requireWorkspace(raw));
  }

  async listRuns(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    return this.store.listRuns(requireWorkspace(raw));
  }

  async runDetail(raw: { tenantId: string; workspaceId?: string; userId: string }, id: string) {
    const scope = requireWorkspace(raw);
    const run = await this.store.getRun(scope, id);
    if (!run) throw new Error("workforce run not found");
    const task = await this.store.getTask(scope, run.taskId);
    const approvals = (await this.store.listApprovals(scope)).filter((row) => row.runId === run.id);
    const handoffs = await this.store.listHandoffs(scope, run.id);
    return { run, task, approvals, handoffs };
  }

  async listApprovals(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    return this.store.listApprovals(requireWorkspace(raw));
  }

  async decideApproval(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { approvalId: string; decision: "approved" | "rejected"; reason?: string },
    actor: WorkforceActor,
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor, "self_approval_forbidden");
    const approval = await this.store.getApproval(scope, input.approvalId);
    if (!approval) throw new Error("workforce approval not found");
    if (approval.decision !== "pending") throw new Error("invalid_approval_status");
    if (approval.requestedBy === actor.userId) throw new Error("self_approval_forbidden");
    if (actor.agentId) throw new Error("self_approval_forbidden");
    const runForGate = await this.store.getRun(scope, approval.runId);
    if (!runForGate) throw new Error("workforce run not found");
    const installationForGate = await this.requireInstallation(scope, runForGate.installationId);
    await this.assertExecutionGates(scope, installationForGate);

    const decided = {
      ...approval,
      decision: input.decision,
      decidedBy: actor.userId,
      decidedAt: nowIso(),
      reason: input.reason ?? null,
    };
    await this.store.upsertApproval(decided);
    await this.auditSafe(scope, input.decision === "approved" ? "approve" : "reject", "business_os_workforce_approval", decided.id, {
      runId: decided.runId,
      decision: decided.decision,
    });

    const run = await this.store.getRun(scope, approval.runId);
    if (!run) throw new Error("workforce run not found");
    if (input.decision === "rejected") {
      const failed = await this.finish(scope, run, "cancelled", null, "approval_rejected");
      return { approval: decided, run: failed };
    }
    const approved = await this.store.upsertRun({ ...run, state: "approved" });
    const executed = await this.executeApproved(scope, approved);
    return { approval: decided, run: executed };
  }

  async requestHandoff(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    input: { runId: string; toSlug: string },
    actor: WorkforceActor,
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor, "self_registration_forbidden");
    const run = await this.store.getRun(scope, input.runId);
    if (!run) throw new Error("workforce run not found");
    const from = await this.requireInstallation(scope, run.installationId);
    const targetDef = catalogEntry(input.toSlug);
    if (!targetDef) throw new Error("self_registration_forbidden");
    if (run.visitedAgents.includes(input.toSlug)) throw new Error("handoff_limit_exceeded");
    await this.assertExecutionGates(scope, from);
    const settings = await this.store.getSettings(scope);
    const maxHandoffs = Math.min(from.budget.maxHandoffs, settings.maxHandoffs, targetDef.maxHandoffs);
    if (run.budgetUsed.handoffs >= maxHandoffs) throw new Error("handoff_limit_exceeded");

    const policy = await this.policy.evaluate({
      tenantId: scope.tenantId,
      intent: "business_os.ai_workforce.handoff",
      operatingSystem: "business",
      agentId: from.kernelAgentId ?? from.id,
      simulation: false,
    });
    if (!policy.allowed) throw new Error("policy_rejected");

    const target = await this.store.getInstallationBySlug(scope, input.toSlug);
    if (!target || target.status !== "enabled") throw new Error("agent_not_enabled");
    const trimmedAuthority = minAuthority(from.authority, target.authority);
    const trimmedTools = trimToolAllowlist(from.toolAllowlist, target.toolAllowlist);
    const trimmedPermissions = from.permissions.filter((p) => target.permissions.includes(p));
    const handoff = await this.store.upsertHandoff({
      id: newId("bos11-handoff"),
      runId: run.id,
      fromInstallationId: from.id,
      toCatalogSlug: input.toSlug,
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      trimmedPermissions,
      trimmedTools,
      trimmedAuthority,
      status: "requested",
      provenance: { policy: policy.evaluationIds, actor: actor.userId },
    });
    await this.store.upsertRun({
      ...run,
      budgetUsed: { ...run.budgetUsed, handoffs: run.budgetUsed.handoffs + 1 },
      visitedAgents: [...run.visitedAgents, input.toSlug],
    });
    await this.emit(scope, "business_os.ai_workforce.handoff_requested", {
      runId: run.id,
      from: from.catalogSlug,
      to: input.toSlug,
    });
    await this.auditSafe(scope, "handoff", "business_os_workforce_handoff", handoff.id, {
      from: from.catalogSlug,
      to: input.toSlug,
      trimmedAuthority,
    });
    return handoff;
  }

  async diagnostics(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    const scope = requireWorkspace(raw);
    const [installations, runs, approvals, settings] = await Promise.all([
      this.store.listInstallations(scope),
      this.store.listRuns(scope),
      this.store.listApprovals(scope),
      this.store.getSettings(scope),
    ]);
    const registry: Array<{ slug: string; id: string; isActive: boolean }> = [];
    for (const installation of installations) {
      try {
        const agent = await this.registry.getAgentBySlug(scope.tenantId, installation.catalogSlug);
        if (agent) registry.push(agent);
      } catch {
        // mismatch recorded below
      }
    }
    const graphDiag = await this.context.diagnostics(scope).catch(() => ({ findings: [], quality: { unresolvedRefs: 0 } }));
    return diagnoseWorkforce({
      catalog: BUSINESS_WORKFORCE_CATALOG,
      installations,
      runs,
      approvals,
      settings,
      registry,
      graphFindings: graphDiag.findings as Array<{ code: string; repaired: false }>,
    });
  }

  async seedDemo(raw: { tenantId: string; workspaceId?: string; userId: string }, actor?: WorkforceActor) {
    const scope = requireWorkspace(raw);
    const human: WorkforceActor = actor ?? { userId: scope.userId, actorType: "human" };
    await this.context.seedDemo(scope);
    return demoWorkforceSeed(this, scope, human);
  }

  async listAudit(raw: { tenantId: string; workspaceId?: string; userId: string }) {
    return this.store.listAudit(requireWorkspace(raw));
  }

  private async setStatus(
    raw: { tenantId: string; workspaceId?: string; userId: string },
    id: string,
    actor: WorkforceActor,
    status: "suspended" | "revoked",
  ) {
    const scope = requireWorkspace(raw);
    assertHuman(actor, status === "suspended" ? "self_enable_forbidden" : "self_registration_forbidden");
    const installation = await this.requireInstallation(scope, id);
    if (installation.kernelAgentId) {
      try {
        await this.registry.setAgentActive(scope.tenantId, installation.kernelAgentId, false);
      } catch {
        // diagnostics report mismatch
      }
    }
    const next = {
      ...installation,
      status,
      suspendedAt: status === "suspended" ? nowIso() : installation.suspendedAt,
      revokedAt: status === "revoked" ? nowIso() : installation.revokedAt,
      updatedAt: nowIso(),
    };
    await this.store.upsertInstallation(next);
    const event =
      status === "suspended"
        ? "business_os.ai_workforce.agent_suspended"
        : "business_os.ai_workforce.agent_revoked";
    await this.auditSafe(scope, status, "business_os_workforce_installation", next.id, { status });
    await this.emit(scope, event, { installationId: next.id });
    return next;
  }

  private async advanceRun(
    scope: OwnerCommandScope,
    taskId: string,
    runId: string,
    toolId: string | undefined,
    actor: WorkforceActor,
  ) {
    let task = await this.store.getTask(scope, taskId);
    let run = await this.store.getRun(scope, runId);
    if (!task || !run) throw new Error("workforce run not found");
    const installation = await this.requireInstallation(scope, run.installationId);

    task = await this.store.upsertTask({ ...task, state: "policy_check", updatedAt: nowIso() });
    run = await this.store.upsertRun({ ...run, state: "policy_check" });
    await this.auditSafe(scope, "policy_check", "business_os_workforce_run", run.id, {
      allowed: true,
      authority: installation.authority,
    });

    const entityType = task.entityType ?? "customer";
    const entityId = task.entityId ?? "bos10-customer-abc";
    if (!installation.contextScope.includes(entityType)) {
      return this.block(scope, task, run, "unrestricted_graph_access");
    }
    const settings = await this.store.getSettings(scope);
    const agentContext = await this.context.agentContext(scope, {
      entityType,
      entityId,
      staleAfterHours: settings.staleContextHours,
    });
    if (agentContext.state !== "ok" || !agentContext.assembly) {
      const code = agentContext.state === "needs_human_review" ? "needs_human_review" : "insufficient_evidence";
      return this.block(scope, task, run, code, agentContext.reasons);
    }
    task = await this.store.upsertTask({ ...task, state: "context_assembled", updatedAt: nowIso() });
    run = await this.store.upsertRun({
      ...run,
      state: "context_assembled",
      contextRefs: [
        agentContext.assembly.entity?.canonicalRef ?? "",
        ...agentContext.assembly.neighbours.flatMap((row) => row.sourceRefs),
      ].filter(Boolean),
      explanation: {
        evidence: agentContext.assembly.neighbours.map((row) => ({
          sourceRef: row.evidence.sourceEntityRef,
          provenance: row.evidence.provenance,
          freshness: row.freshness,
        })),
        derivedRecommendation: "",
        assumption: ["Graph adjacency is not causation."],
        missingEvidence: agentContext.reasons,
        chainOfThoughtExposed: false,
      },
    });

    const selectedTool = toolId ?? "bos.context.entity";
    try {
      assertToolAllowlisted(selectedTool, installation.toolAllowlist);
    } catch (error) {
      const code = error instanceof Error ? error.message : "tool_not_allowlisted";
      return { task, run: await this.fail(scope, task, run, code), approval: null };
    }

    task = await this.store.upsertTask({ ...task, state: "planned", updatedAt: nowIso() });
    run = await this.store.upsertRun({ ...run, state: "planned" });

    if (authorityRequiresApproval(installation.authority) || !isReadTool(selectedTool)) {
      const approval = await this.store.upsertApproval({
        id: newId("bos11-approval"),
        runId: run.id,
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        requestedBy: actor.userId,
        decidedBy: null,
        decision: "pending",
        decidedAt: null,
        reason: null,
        provenance: { authority: installation.authority },
      });
      task = await this.store.upsertTask({ ...task, state: "awaiting_approval", updatedAt: nowIso() });
      run = await this.store.upsertRun({ ...run, state: "awaiting_approval" });
      await this.emit(scope, "business_os.ai_workforce.approval_requested", {
        runId: run.id,
        approvalId: approval.id,
      });
      await this.auditSafe(scope, "approval_requested", "business_os_workforce_approval", approval.id, {
        runId: run.id,
      });
      return { task, run, approval };
    }

    return { task, run: await this.executeApproved(scope, run, selectedTool), approval: null };
  }

  private async executeApproved(scope: OwnerCommandScope, run: WorkforceRun, toolId = "bos.context.entity") {
    const installation = await this.requireInstallation(scope, run.installationId);
    await this.assertExecutionGates(scope, installation);
    const task = await this.store.getTask(scope, run.taskId);
    if (!task) throw new Error("workforce task not found");
    const settings = await this.store.getSettings(scope);
    if (run.budgetUsed.toolCalls >= Math.min(installation.budget.maxToolCalls, settings.maxToolCalls)) {
      return this.fail(scope, task, run, "budget_exceeded");
    }
    const runtimeMs = this.now().getTime() - Date.parse(run.startedAt);
    if (runtimeMs > Math.min(installation.budget.maxRuntimeMs, settings.maxRuntimeMs)) {
      return this.fail(scope, task, run, "budget_exceeded");
    }

    await this.store.upsertTask({ ...task, state: "executing", updatedAt: nowIso() });
    let current = await this.store.upsertRun({ ...run, state: "executing" });
    await this.emit(scope, "business_os.ai_workforce.execution_started", { runId: current.id });

    const entityType = task.entityType ?? "customer";
    const entityId = task.entityId ?? "bos10-customer-abc";
    const result = await this.invokeReadTool(scope, toolId, entityType, entityId, installation);
    current = await this.store.upsertRun({
      ...current,
      toolCalls: [...current.toolCalls, { toolId, at: nowIso(), result: "ok" }],
      budgetUsed: {
        ...current.budgetUsed,
        toolCalls: current.budgetUsed.toolCalls + 1,
        tokens: current.budgetUsed.tokens + 32,
        runtimeMs,
      },
      draft:
        installation.authority === "prepare"
          ? { kind: "run_local_draft", advisory: true, notCanonical: true, payload: result }
          : current.draft,
      explanation: {
        ...current.explanation,
        derivedRecommendation: authorityIsAdvisory(installation.authority)
          ? "Advisory recommendation based on structured evidence only."
          : "Execution requested; canonical writes remain unauthorized in BOS-12.",
      },
    });

    try {
      await this.kernel.memory.store({
        tenantId: scope.tenantId,
        scopeKey: "agent",
        scopeRefId: `${scope.workspaceId}:${installation.id}`,
        content: current.explanation.derivedRecommendation,
        classification: "general",
        createdBy: scope.userId,
      });
    } catch {
      await this.store.storeMemory({
        id: newId("bos11-mem"),
        tenantId: scope.tenantId,
        scopeKey: "agent",
        scopeRefId: `${scope.workspaceId}:${installation.id}`,
        content: current.explanation.derivedRecommendation,
        classification: "general",
        authoritative: false,
        generated: true,
      });
    }

    return this.finish(scope, current, "completed");
  }

  private async invokeReadTool(
    scope: OwnerCommandScope,
    toolId: string,
    entityType: string,
    entityId: string,
    installation: WorkforceInstallation,
  ) {
    if (isForbiddenTool(toolId)) throw new Error("forbidden_tool");
    if (!isReadTool(toolId)) throw new Error("canonical_domain_mutation_forbidden");
    assertToolAllowlisted(toolId, installation.toolAllowlist);
    if (toolId === "bos.context.search") return this.context.search(scope, entityId);
    if (toolId === "bos.context.neighbourhood") {
      return this.context.neighbourhood(scope, { entityType, entityId });
    }
    if (toolId === "bos.context.explain") {
      return this.context.explain(scope, { entityType: entityType as never, entityId });
    }
    return this.context.entityContext(scope, { entityType: entityType as never, entityId });
  }

  private async finish(
    scope: OwnerCommandScope,
    run: WorkforceRun,
    state: "completed" | "failed" | "cancelled",
    failureCode?: string | null,
    blockedReason?: string | null,
  ) {
    const task = await this.store.getTask(scope, run.taskId);
    if (task) await this.store.upsertTask({ ...task, state, updatedAt: nowIso() });
    const next = await this.store.upsertRun({
      ...run,
      state,
      failureCode: failureCode ?? run.failureCode,
      blockedReason: blockedReason ?? run.blockedReason,
      completedAt: nowIso(),
    });
    const event =
      state === "completed"
        ? "business_os.ai_workforce.run_completed"
        : state === "failed"
          ? "business_os.ai_workforce.run_failed"
          : "business_os.ai_workforce.run_failed";
    await this.emit(scope, event, { runId: next.id, state, failureCode });
    await this.auditSafe(scope, state, "business_os_workforce_run", next.id, { state, failureCode, blockedReason });
    return next;
  }

  private async fail(
    scope: OwnerCommandScope,
    task: { id: string },
    run: WorkforceRun,
    code: string,
  ) {
    await this.store.upsertTask({
      ...(await this.store.getTask(scope, task.id))!,
      state: "failed",
      updatedAt: nowIso(),
    });
    return this.finish(scope, { ...run, failureCode: code }, "failed", code);
  }

  private async block(
    scope: OwnerCommandScope,
    task: { id: string },
    run: WorkforceRun,
    code: string,
    reasons?: string[],
  ) {
    const currentTask = await this.store.getTask(scope, task.id);
    if (currentTask) await this.store.upsertTask({ ...currentTask, state: "blocked", updatedAt: nowIso() });
    const next = await this.store.upsertRun({
      ...run,
      state: "blocked",
      blockedReason: code,
      failureCode: code,
      completedAt: nowIso(),
      explanation: {
        ...run.explanation,
        missingEvidence: reasons ?? run.explanation.missingEvidence,
      },
    });
    await this.emit(scope, "business_os.ai_workforce.run_blocked", { runId: next.id, code });
    await this.auditSafe(scope, "blocked", "business_os_workforce_run", next.id, { code, reasons });
    return { task: currentTask, run: next, approval: null };
  }

  private async assertExecutionGates(scope: OwnerCommandScope, installation: WorkforceInstallation) {
    let registered: { slug: string; id: string; isActive: boolean } | null = null;
    try {
      registered = await this.registry.getAgentBySlug(scope.tenantId, installation.catalogSlug);
    } catch {
      registered = null;
    }
    if (
      !registered ||
      !installation.kernelAgentId ||
      registered.id !== installation.kernelAgentId
    ) {
      throw new Error("agent_registry_mismatch");
    }
    if (this.connectors) {
      await this.connectors.assertAgentContextGates(scope);
    }
  }

  private async requireInstallation(scope: OwnerCommandScope, id: string) {
    const installation = await this.store.getInstallation(scope, id);
    if (!installation) throw new Error("agent installation not found");
    this.assertScope(scope, installation);
    if (!(BUSINESS_WORKFORCE_AUTHORITY_CLASSES as readonly string[]).includes(installation.authority)) {
      throw new Error("invalid_authority");
    }
    return installation;
  }

  private assertScope(scope: OwnerCommandScope, row: { tenantId: string; workspaceId: string }) {
    if (row.tenantId !== scope.tenantId) throw new Error("cross_tenant_agent_forbidden");
    if (row.workspaceId !== scope.workspaceId) throw new Error("cross_workspace_graph_forbidden");
  }

  private async emit(
    scope: OwnerCommandScope,
    eventType: (typeof BUSINESS_OS_EVENT_TYPES)[number],
    payload: Record<string, unknown>,
  ) {
    try {
      await this.kernel.eventBus.publish({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        eventType,
        source: "business-os",
        payload,
      });
    } catch {
      // fail-open
    }
  }

  private async auditSafe(
    scope: OwnerCommandScope,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, unknown>,
  ) {
    try {
      await this.audit.log({
        tenantId: scope.tenantId,
        workspaceId: scope.workspaceId,
        userId: scope.userId,
        action,
        resourceType,
        resourceId,
        metadata,
      });
    } catch {
      // fail-open
    }
    try {
      await this.store.appendAudit(scope, {
        at: nowIso(),
        action,
        actorId: scope.userId,
        agentId: typeof metadata.installationId === "string" ? metadata.installationId : null,
        workspaceId: scope.workspaceId,
        taskId: typeof metadata.taskId === "string" ? metadata.taskId : null,
        runId: typeof metadata.runId === "string" ? metadata.runId : null,
        policyDecision: typeof metadata.allowed === "boolean" ? String(metadata.allowed) : null,
        authority: typeof metadata.authority === "string" ? metadata.authority : null,
        sourceRefs: [],
        toolRefs: typeof metadata.toolId === "string" ? [metadata.toolId] : [],
      });
    } catch {
      // fail-open
    }
  }
}

export function createTestWorkforceGraphAndStore() {
  return {
    store: createMemoryWorkforceStore(),
    registry: createMemoryAgentRegistry(),
  };
}

export { BUSINESS_WORKFORCE_READ_TOOLS, BUSINESS_WORKFORCE_FORBIDDEN_TOOLS };
