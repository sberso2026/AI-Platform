/**
 * EOS 3.7 bounded AI orchestration — no unrestricted recursive agents.
 * AI_ORCHESTRATION != AUTONOMOUS_RELEASE
 */

import { buildEos3Provenance } from "../commerce/eos3-provenance";
import {
  classifyTask,
  detectAuthorityAttack,
  evaluateAiPolicy,
  failClosedDefault,
  type Eos3AiTaskClass,
  type PolicyCaller,
  type PolicyDecision,
  EOS3_AI_POLICY_VERSION,
} from "./eos3-ai-policy";
import { EOS3_AI_TOOL_REGISTRY, getTool, type Eos3AiTool } from "./eos3-ai-tools";

export type OrchestrationStatus =
  | "PLANNED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "ABORTED_BUDGET"
  | "ABORTED_LOOP"
  | "DENIED"
  | "AWAITING_HUMAN";

export type OrchestrationStep = {
  stepId: string;
  toolId: string;
  status: "pending" | "ok" | "failed" | "denied" | "timeout" | "skipped";
  sideEffect: string;
  outputSummary: string | null;
  evidenceClass: "FACT" | "INFERENCE" | "ASSUMPTION" | "RECOMMENDATION" | "RESULT" | "HUMAN_DECISION" | null;
  error: string | null;
};

export type Eos3OrchestrationPlan = {
  taskId: string;
  userRequest: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  taskClass: Eos3AiTaskClass;
  plannedSteps: OrchestrationStep[];
  requiredTools: string[];
  authorityRequired: string;
  evidenceRequirements: string[];
  executionLimits: ExecutionBudget;
  humanCheckpoints: string[];
  status: OrchestrationStatus;
  policy: PolicyDecision;
  provenance: Record<string, unknown>;
  modelIdentity: {
    provider: string;
    model: string;
    version: string;
    policyVersion: string;
  };
  usage: UsageAttribution;
  audit: Array<{ action: string; at: string; detail: Record<string, unknown> }>;
  reasoningEvidence: {
    evidenceSelected: string[];
    assumptions: string[];
    optionsCompared: string[];
    recommendationRationale: string | null;
    toolOutputs: string[];
    uncertainty: string[];
    /** Private chain-of-thought is never stored. */
    chainOfThoughtStored: false;
  };
};

export type ExecutionBudget = {
  maxSteps: number;
  maxToolCalls: number;
  timeoutMs: number;
  maxModelCalls: number;
  maxRetries: number;
  tokenBudget: number;
};

export type UsageAttribution = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  userId: string | null;
  taskId: string;
  toolCalls: number;
  modelCalls: number;
  tokenUsage: number;
  solverJobs: number;
  durationMs: number;
  retries: number;
};

export type BoundedAgent = {
  agentId: string;
  purpose: string;
  toolAllowlist: string[];
  dataScope: "workspace";
  authorityCeiling: "AI_ALLOWED" | "HUMAN_CHECKPOINT_REQUIRED";
  executionLimits: ExecutionBudget;
};

export const EOS3_BOUNDED_AGENTS: BoundedAgent[] = [
  {
    agentId: "agent.retrieval",
    purpose: "Retrieve and ground evidence",
    toolAllowlist: ["tool.retrieve.canonical", "tool.knowledge.retrieve", "tool.audit.provenance"],
    dataScope: "workspace",
    authorityCeiling: "AI_ALLOWED",
    executionLimits: { maxSteps: 6, maxToolCalls: 8, timeoutMs: 15_000, maxModelCalls: 2, maxRetries: 1, tokenBudget: 8_000 },
  },
  {
    agentId: "agent.change_impact",
    purpose: "Trace change impacts",
    toolAllowlist: ["tool.graph.trace", "tool.retrieve.canonical", "tool.workflow.draft_work_item"],
    dataScope: "workspace",
    authorityCeiling: "AI_ALLOWED",
    executionLimits: { maxSteps: 8, maxToolCalls: 10, timeoutMs: 20_000, maxModelCalls: 2, maxRetries: 1, tokenBudget: 10_000 },
  },
  {
    agentId: "agent.decision_support",
    purpose: "Prepare decision recommendations",
    toolAllowlist: ["tool.decision.support", "tool.retrieve.canonical", "tool.graph.trace"],
    dataScope: "workspace",
    authorityCeiling: "AI_ALLOWED",
    executionLimits: { maxSteps: 8, maxToolCalls: 10, timeoutMs: 20_000, maxModelCalls: 3, maxRetries: 1, tokenBudget: 12_000 },
  },
  {
    agentId: "agent.optimization",
    purpose: "Draft optimization requests",
    toolAllowlist: ["tool.optimization.request", "tool.retrieve.canonical"],
    dataScope: "workspace",
    authorityCeiling: "HUMAN_CHECKPOINT_REQUIRED",
    executionLimits: { maxSteps: 5, maxToolCalls: 6, timeoutMs: 15_000, maxModelCalls: 2, maxRetries: 1, tokenBudget: 8_000 },
  },
  {
    agentId: "agent.review_prep",
    purpose: "Prepare review materials and draft work items",
    toolAllowlist: ["tool.workflow.draft_work_item", "tool.retrieve.canonical", "tool.graph.trace"],
    dataScope: "workspace",
    authorityCeiling: "AI_ALLOWED",
    executionLimits: { maxSteps: 6, maxToolCalls: 8, timeoutMs: 15_000, maxModelCalls: 2, maxRetries: 1, tokenBudget: 8_000 },
  },
];

export const DEFAULT_BUDGET: ExecutionBudget = {
  maxSteps: 12,
  maxToolCalls: 16,
  timeoutMs: 30_000,
  maxModelCalls: 4,
  maxRetries: 2,
  tokenBudget: 20_000,
};

function id(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}

export function agentMayDelegate(agent: BoundedAgent, toolId: string): boolean {
  return agent.toolAllowlist.includes(toolId);
}

/** Agents cannot delegate authority they do not possess. */
export function assertAuthorityNonDelegation(
  agent: BoundedAgent,
  tool: Eos3AiTool,
): { ok: boolean; reason?: string } {
  if (!agent.toolAllowlist.includes(tool.toolId)) {
    return { ok: false, reason: "tool_not_on_allowlist" };
  }
  if (tool.authorityRequirement === "HUMAN_ONLY") {
    return { ok: false, reason: "cannot_delegate_human_only" };
  }
  if (
    tool.authorityRequirement === "HUMAN_CHECKPOINT_REQUIRED" &&
    agent.authorityCeiling === "AI_ALLOWED"
  ) {
    return { ok: false, reason: "authority_ceiling_exceeded" };
  }
  return { ok: true };
}

export function createOrchestrationPlan(input: {
  userRequest: string;
  caller: PolicyCaller;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  budget?: Partial<ExecutionBudget>;
}): Eos3OrchestrationPlan {
  const taskClass = classifyTask(input.userRequest);
  const attack = detectAuthorityAttack(input.userRequest);
  const primaryTool =
    taskClass === "DECISION_SUPPORT"
      ? "tool.decision.support"
      : taskClass === "CHANGE_IMPACT_ASSIST"
        ? "tool.graph.trace"
        : taskClass === "SOLVER_REQUEST"
          ? "tool.solver.prepare"
          : taskClass === "OPTIMIZATION_REQUEST"
            ? "tool.optimization.request"
            : taskClass === "REVIEW_ASSIST"
              ? "tool.workflow.draft_work_item"
              : "tool.retrieve.canonical";

  const tool = getTool(primaryTool);
  const policy =
    !tool
      ? failClosedDefault()
      : evaluateAiPolicy({
          caller: input.caller,
          taskClass,
          sideEffect: attack ? "HUMAN_ONLY_ACTION" : tool.sideEffect,
          toolId: tool.toolId,
          targetTenantId: input.tenantId,
          targetWorkspaceId: input.workspaceId,
          requestedHumanOnlyAction: attack,
        });

  const limits: ExecutionBudget = { ...DEFAULT_BUDGET, ...input.budget };
  const taskId = id();
  const steps: OrchestrationStep[] = [
    {
      stepId: id(),
      toolId: "tool.retrieve.canonical",
      status: "pending",
      sideEffect: "READ_ONLY",
      outputSummary: null,
      evidenceClass: null,
      error: null,
    },
    {
      stepId: id(),
      toolId: "tool.graph.trace",
      status: "pending",
      sideEffect: "READ_ONLY",
      outputSummary: null,
      evidenceClass: null,
      error: null,
    },
  ];
  const req = input.userRequest.toLowerCase();
  if (
    taskClass === "DECISION_SUPPORT" ||
    taskClass === "RECOMMEND" ||
    /recommend|decision option|compare decision/.test(req)
  ) {
    steps.push({
      stepId: id(),
      toolId: "tool.decision.support",
      status: "pending",
      sideEffect: "DRAFT_WRITE",
      outputSummary: null,
      evidenceClass: null,
      error: null,
    });
  }
  if (
    taskClass === "CHANGE_IMPACT_ASSIST" ||
    taskClass === "REVIEW_ASSIST" ||
    taskClass === "DECISION_SUPPORT" ||
    /draft (review )?work item|create a draft/.test(req)
  ) {
    steps.push({
      stepId: id(),
      toolId: "tool.workflow.draft_work_item",
      status: "pending",
      sideEffect: "DRAFT_WRITE",
      outputSummary: null,
      evidenceClass: null,
      error: null,
    });
  }

  const humanCheckpoints: string[] = [];
  if (policy.humanCheckpointRequired || attack) {
    humanCheckpoints.push(attack ?? "governed_action");
  }

  return {
    taskId,
    userRequest: input.userRequest,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    taskClass,
    plannedSteps: steps,
    requiredTools: [...new Set(steps.map((s) => s.toolId))],
    authorityRequired: policy.authority,
    evidenceRequirements: ["canonical_revision", "provenance", "evidence_class"],
    executionLimits: limits,
    humanCheckpoints,
    status: policy.allowed ? "PLANNED" : "DENIED",
    policy,
    provenance: buildEos3Provenance({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectId: null,
      revisionId: null,
      source: "eos3.ai.orchestration",
      actorId: input.caller.userId,
      authority: input.caller.actingAsAi ? "ai_assisted" : input.caller.role,
      method: "createOrchestrationPlan",
      toolOrModel: "eos3-reasoning-assistant",
      evidenceClassification: "INFERENCE",
      qualificationState: null,
    }),
    modelIdentity: {
      provider: "eos3-synthetic",
      model: "engineering-reasoning-assistant",
      version: "3.7.0-development",
      policyVersion: EOS3_AI_POLICY_VERSION,
    },
    usage: {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      userId: input.caller.userId,
      taskId,
      toolCalls: 0,
      modelCalls: 0,
      tokenUsage: 0,
      solverJobs: 0,
      durationMs: 0,
      retries: 0,
    },
    audit: [
      {
        action: "plan_created",
        at: now(),
        detail: { taskClass, policy: policy.reason, attack },
      },
    ],
    reasoningEvidence: {
      evidenceSelected: [],
      assumptions: [],
      optionsCompared: [],
      recommendationRationale: null,
      toolOutputs: [],
      uncertainty: [],
      chainOfThoughtStored: false,
    },
  };
}

export type ToolExecutor = (toolId: string, plan: Eos3OrchestrationPlan) => {
  ok: boolean;
  summary: string;
  evidenceClass?: OrchestrationStep["evidenceClass"];
  error?: string;
  timeout?: boolean;
};

export function runOrchestration(
  plan: Eos3OrchestrationPlan,
  executor: ToolExecutor,
  opts?: { forceExtraSteps?: number },
): Eos3OrchestrationPlan {
  if (plan.status === "DENIED") return plan;
  const t0 = performance.now();
  plan.status = "RUNNING";
  plan.usage.modelCalls += 1;
  const seen = new Set<string>();
  let stepsRun = 0;

  const steps = [...plan.plannedSteps];
  if (opts?.forceExtraSteps) {
    for (let i = 0; i < opts.forceExtraSteps; i += 1) {
      steps.push({
        stepId: id(),
        toolId: "tool.retrieve.canonical",
        status: "pending",
        sideEffect: "READ_ONLY",
        outputSummary: null,
        evidenceClass: null,
        error: null,
      });
    }
  }

  for (const step of steps) {
    if (stepsRun >= plan.executionLimits.maxSteps || plan.usage.toolCalls >= plan.executionLimits.maxToolCalls) {
      plan.status = "ABORTED_BUDGET";
      plan.audit.push({ action: "aborted_budget", at: now(), detail: { stepsRun } });
      break;
    }
    const cycleKey = `${step.toolId}:${step.outputSummary ?? "pending"}`;
    if (seen.has(cycleKey) && step.toolId === "tool.retrieve.canonical" && stepsRun > 2) {
      plan.status = "ABORTED_LOOP";
      plan.audit.push({ action: "aborted_loop", at: now(), detail: { cycleKey } });
      break;
    }
    seen.add(step.toolId);

    const tool = getTool(step.toolId);
    if (!tool) {
      step.status = "failed";
      step.error = "unknown_tool";
      plan.status = "FAILED";
      break;
    }
    if (tool.sideEffect === "HUMAN_ONLY_ACTION") {
      step.status = "denied";
      step.error = "human_only_action";
      plan.humanCheckpoints.push(tool.toolId);
      continue;
    }

    const result = executor(step.toolId, plan);
    plan.usage.toolCalls += 1;
    stepsRun += 1;
    if (result.timeout) {
      step.status = "timeout";
      step.error = result.error ?? "timeout";
      plan.reasoningEvidence.uncertainty.push(`tool_timeout:${step.toolId}`);
      // partial — do not fabricate
      continue;
    }
    if (!result.ok) {
      step.status = "failed";
      step.error = result.error ?? "tool_failed";
      plan.reasoningEvidence.uncertainty.push(`tool_failed:${step.toolId}`);
      // failed tool must not become successful evidence
      continue;
    }
    step.status = "ok";
    step.outputSummary = result.summary;
    step.evidenceClass = result.evidenceClass ?? "FACT";
    plan.reasoningEvidence.toolOutputs.push(result.summary);
    if (result.evidenceClass === "FACT" || result.evidenceClass === "RESULT") {
      plan.reasoningEvidence.evidenceSelected.push(result.summary);
    }
  }

  plan.plannedSteps = steps.slice(0, Math.max(plan.plannedSteps.length, stepsRun));
  plan.usage.durationMs = performance.now() - t0;
  plan.usage.tokenUsage += 250 * plan.usage.toolCalls;

  if (plan.status === "RUNNING") {
    plan.status = plan.humanCheckpoints.length ? "AWAITING_HUMAN" : "COMPLETED";
  }
  if (plan.plannedSteps.some((s) => s.status === "failed") && plan.status === "COMPLETED") {
    plan.status = "COMPLETED"; // partial completion with failures exposed
  }
  plan.audit.push({
    action: "orchestration_finished",
    at: now(),
    detail: { status: plan.status, toolCalls: plan.usage.toolCalls },
  });
  return plan;
}

export function retryToolCall(
  plan: Eos3OrchestrationPlan,
  stepId: string,
  executor: ToolExecutor,
): Eos3OrchestrationPlan {
  const step = plan.plannedSteps.find((s) => s.stepId === stepId);
  if (!step) return plan;
  if (plan.usage.retries >= plan.executionLimits.maxRetries) {
    plan.audit.push({ action: "retry_denied", at: now(), detail: { stepId } });
    return plan;
  }
  if (step.sideEffect !== "READ_ONLY" && step.status === "ok") {
    // do not duplicate side effects
    plan.audit.push({ action: "retry_suppressed_side_effect", at: now(), detail: { stepId } });
    return plan;
  }
  plan.usage.retries += 1;
  const result = executor(step.toolId, plan);
  plan.usage.toolCalls += 1;
  step.status = result.ok ? "ok" : "failed";
  step.outputSummary = result.summary;
  step.error = result.error ?? null;
  return plan;
}

export { EOS3_AI_TOOL_REGISTRY };
