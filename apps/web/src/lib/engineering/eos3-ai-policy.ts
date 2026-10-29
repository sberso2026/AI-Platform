/**
 * EOS 3.7 AI policy engine — fail closed.
 * AI_REASONING != ENGINEERING_AUTHORITY
 */

export const EOS3_AI_POLICY_VERSION = "1.0.0" as const;
export const EOS3_AI_DECISION_AUTHORITY = false as const;
export const EOS3_AI_OPTIMIZATION_SELECTION_AUTHORITY = false as const;
export const EOS3_AI_DOES_NOT_INHERIT_D1_QUALIFICATION = true as const;

export const EOS3_AI_TASK_CLASSES = [
  "LOOKUP",
  "TRACE",
  "COMPARE",
  "SUMMARIZE",
  "ANALYZE",
  "RECOMMEND",
  "CALCULATION_REQUEST",
  "OPTIMIZATION_REQUEST",
  "SOLVER_REQUEST",
  "REVIEW_ASSIST",
  "CHANGE_IMPACT_ASSIST",
  "DECISION_SUPPORT",
] as const;

export type Eos3AiTaskClass = (typeof EOS3_AI_TASK_CLASSES)[number];

/** APPROVE is intentionally absent from AI task classes. */
export type AiTaskAuthority = "AI_ALLOWED" | "HUMAN_CHECKPOINT_REQUIRED" | "HUMAN_ONLY";

export type ToolSideEffect = "READ_ONLY" | "DRAFT_WRITE" | "GOVERNED_WRITE" | "HUMAN_ONLY_ACTION";

export type PolicyCaller = {
  authenticated: boolean;
  userId: string | null;
  role: string;
  tenantId: string | null;
  workspaceId: string | null;
  projectId: string | null;
  eos3Entitled: boolean;
  eos3Enrolled: boolean;
  productionEnvironment?: boolean;
  /** AI never impersonates a privileged service account. */
  actingAsAi: boolean;
};

export type PolicyDecision = {
  allowed: boolean;
  reason: string;
  authority: AiTaskAuthority;
  humanCheckpointRequired: boolean;
  policyVersion: typeof EOS3_AI_POLICY_VERSION;
};

export const TASK_AUTHORITY: Record<Eos3AiTaskClass, AiTaskAuthority> = {
  LOOKUP: "AI_ALLOWED",
  TRACE: "AI_ALLOWED",
  COMPARE: "AI_ALLOWED",
  SUMMARIZE: "AI_ALLOWED",
  ANALYZE: "AI_ALLOWED",
  RECOMMEND: "AI_ALLOWED",
  CALCULATION_REQUEST: "HUMAN_CHECKPOINT_REQUIRED",
  OPTIMIZATION_REQUEST: "HUMAN_CHECKPOINT_REQUIRED",
  SOLVER_REQUEST: "HUMAN_CHECKPOINT_REQUIRED",
  REVIEW_ASSIST: "AI_ALLOWED",
  CHANGE_IMPACT_ASSIST: "AI_ALLOWED",
  DECISION_SUPPORT: "AI_ALLOWED",
};

export const HUMAN_ONLY_ACTIONS = [
  "finalize_decision",
  "approve_deliverable",
  "release_deliverable",
  "release_ifc",
  "accept_interface",
  "finalize_materiality",
  "freeze_baseline",
  "change_solver_qualification",
  "qualify_calculation",
  "regulatory_certification",
] as const;

export type HumanOnlyAction = (typeof HUMAN_ONLY_ACTIONS)[number];

export function classifyTask(userRequest: string): Eos3AiTaskClass {
  const q = userRequest.toLowerCase();
  if (/approve|release ifc|finalize decision|freeze baseline|qualify/.test(q)) {
    // Still classify as nearest assist class; authority handled separately.
    if (/decision/.test(q)) return "DECISION_SUPPORT";
    if (/deliverable|ifc|release|approve/.test(q)) return "REVIEW_ASSIST";
    if (/solver|qualify/.test(q)) return "SOLVER_REQUEST";
  }
  // Multi-intent engineering reasoning: prefer decision/change assist over narrow request types.
  if (/decision option|recommend|draft (review )?work item|compare decision/.test(q)) {
    return "DECISION_SUPPORT";
  }
  if (/affected interface|change impact|trace current revision/.test(q)) {
    return "CHANGE_IMPACT_ASSIST";
  }
  if (/\boptimiz(e|ation request|ation problem)\b/.test(q) && !/optimization results?/.test(q)) {
    return "OPTIMIZATION_REQUEST";
  }
  if (/\bsolver\b/.test(q) && /request|submit|run/.test(q)) return "SOLVER_REQUEST";
  if (/calculat/.test(q) && /request|run|perform/.test(q)) return "CALCULATION_REQUEST";
  if (/impact|change/.test(q)) return "CHANGE_IMPACT_ASSIST";
  if (/decision|option|tradeoff|recommend/.test(q)) return "DECISION_SUPPORT";
  if (/review/.test(q)) return "REVIEW_ASSIST";
  if (/compare|diff/.test(q)) return "COMPARE";
  if (/trace|depend|govern|assumpt|interface/.test(q)) return "TRACE";
  if (/summar/.test(q)) return "SUMMARIZE";
  if (/analy/.test(q)) return "ANALYZE";
  return "LOOKUP";
}

export function detectAuthorityAttack(userRequest: string): HumanOnlyAction | null {
  const q = userRequest.toLowerCase();
  if (/\brelease\b.*\bifc\b|\bissue\b.*\bifc\b/.test(q)) return "release_ifc";
  if (/\bapprove\b/.test(q) && (/\bdeliverable\b/.test(q) || /\bthis\b/.test(q))) return "approve_deliverable";
  if (/\brelease\b.*\bdeliverable\b/.test(q)) return "release_deliverable";
  if (/\baccept\b.*\binterface\b/.test(q)) return "accept_interface";
  if (/\bfinalize\b.*\bdecision\b|\bfinal\s+engineering\s+decision\b|\bmake\b.*\bfinal\s+decision\b/.test(q)) {
    return "finalize_decision";
  }
  if (/\bfreeze\b.*\bbaseline\b/.test(q)) return "freeze_baseline";
  if (
    /\bqualify\b.*\b(solver|calculation)\b|\bdeclare\b.*\bsolver\b.*\bqualified\b|\bmark\b.*\b(calculation|solver)\b.*\bqualified\b/.test(
      q,
    )
  ) {
    return "change_solver_qualification";
  }
  if (/materialit/.test(q) && /finali|decid|accept/.test(q)) return "finalize_materiality";
  return null;
}

export function evaluateAiPolicy(input: {
  caller: PolicyCaller;
  taskClass: Eos3AiTaskClass;
  sideEffect: ToolSideEffect;
  toolId?: string | null;
  targetTenantId: string;
  targetWorkspaceId: string;
  dataClassification?: string;
  toolQualificationState?: string | null;
  requestedHumanOnlyAction?: HumanOnlyAction | null;
}): PolicyDecision {
  const fail = (reason: string, authority: AiTaskAuthority = "HUMAN_ONLY"): PolicyDecision => ({
    allowed: false,
    reason,
    authority,
    humanCheckpointRequired: true,
    policyVersion: EOS3_AI_POLICY_VERSION,
  });

  if (!input.caller.authenticated) return fail("unauthenticated");
  if (input.caller.productionEnvironment) return fail("production_denied");
  if (!input.caller.eos3Entitled || !input.caller.eos3Enrolled) return fail("not_entitled");
  if (!input.caller.tenantId || !input.caller.workspaceId) return fail("missing_scope");
  if (input.caller.tenantId !== input.targetTenantId) return fail("tenant_mismatch");
  if (input.caller.workspaceId !== input.targetWorkspaceId) return fail("workspace_mismatch");

  if (input.requestedHumanOnlyAction) {
    return fail(`human_only:${input.requestedHumanOnlyAction}`, "HUMAN_ONLY");
  }

  if (input.sideEffect === "HUMAN_ONLY_ACTION") {
    return fail("human_only_action", "HUMAN_ONLY");
  }

  const taskAuth = TASK_AUTHORITY[input.taskClass];
  if (taskAuth === "HUMAN_ONLY") return fail("task_human_only", "HUMAN_ONLY");

  if (input.sideEffect === "GOVERNED_WRITE") {
    if (!input.caller.actingAsAi) {
      // human-authorized governed write via AI assist still needs checkpoint
    }
    if (input.caller.role === "viewer") return fail("insufficient_role_governed_write");
    return {
      allowed: false,
      reason: "governed_write_requires_human_checkpoint",
      authority: "HUMAN_CHECKPOINT_REQUIRED",
      humanCheckpointRequired: true,
      policyVersion: EOS3_AI_POLICY_VERSION,
    };
  }

  if (input.sideEffect === "DRAFT_WRITE") {
    return {
      allowed: true,
      reason: "draft_write_allowed",
      authority: taskAuth === "AI_ALLOWED" ? "AI_ALLOWED" : "HUMAN_CHECKPOINT_REQUIRED",
      humanCheckpointRequired: taskAuth !== "AI_ALLOWED",
      policyVersion: EOS3_AI_POLICY_VERSION,
    };
  }

  // READ_ONLY
  if (taskAuth === "HUMAN_CHECKPOINT_REQUIRED" && /SOLVER|OPTIMIZATION|CALCULATION/.test(input.taskClass)) {
    // preparing request is AI_ALLOWED read/draft; execution gated elsewhere
  }

  return {
    allowed: true,
    reason: "policy_allow_read",
    authority: taskAuth,
    humanCheckpointRequired: taskAuth === "HUMAN_CHECKPOINT_REQUIRED",
    policyVersion: EOS3_AI_POLICY_VERSION,
  };
}

/** Fail closed default when policy inputs incomplete. */
export function failClosedDefault(): PolicyDecision {
  return {
    allowed: false,
    reason: "fail_closed_incomplete_policy_context",
    authority: "HUMAN_ONLY",
    humanCheckpointRequired: true,
    policyVersion: EOS3_AI_POLICY_VERSION,
  };
}
