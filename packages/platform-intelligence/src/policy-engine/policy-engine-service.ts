import type { Json, SupabaseClient } from "@rtb/database";
import type {
  PolicyActionType,
  PolicyConditionType,
  PolicyEvaluationContext,
  PolicyEvaluationResult,
} from "@rtb/types";

export class PolicyEngineService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listPolicies(tenantId: string) {
    const { data, error } = await this.supabase
      .from("policies")
      .select("*, policy_conditions(*), policy_actions(*)")
      .or(`tenant_id.eq.${tenantId},and(tenant_id.is.null,is_platform.eq.true)`)
      .eq("status", "active")
      .order("priority");
    if (error) throw new Error(`Failed to list policies: ${error.message}`);
    return data ?? [];
  }

  async evaluate(context: PolicyEvaluationContext): Promise<PolicyEvaluationResult> {
    const policies = await this.listPolicies(context.tenantId);
    const actions: PolicyActionType[] = [];
    const violations: string[] = [];
    const evaluationIds: string[] = [];
    let allowed = true;
    let requiresReview = false;
    let requiresApproval = false;

    for (const policy of policies as Record<string, unknown>[]) {
      const conditions = (policy.policy_conditions as Record<string, unknown>[]) ?? [];
      const policyActions = (policy.policy_actions as Record<string, unknown>[]) ?? [];
      const matches = conditions.every((c) => this.matchCondition(c, context));

      if (!matches) continue;

      for (const action of policyActions) {
        const actionType = action.action_type as PolicyActionType;
        actions.push(actionType);

        switch (actionType) {
          case "deny":
            allowed = false;
            violations.push(`Policy ${policy.policy_key as string}: denied`);
            break;
          case "require_review":
            requiresReview = true;
            break;
          case "require_approval":
            requiresApproval = true;
            requiresReview = true;
            break;
          case "allow":
            break;
          default:
            break;
        }
      }

      const result = allowed
        ? requiresApproval
          ? "approval"
          : requiresReview
            ? "review"
            : "allow"
        : "deny";

      const { data: evalRow } = await this.supabase
        .from("policy_evaluations")
        .insert({
          tenant_id: context.tenantId,
          policy_id: policy.id as string,
          context_type: "agent_run",
          result,
          actions: actions as unknown as Json,
          simulation: context.simulation ?? false,
        })
        .select("id")
        .single();

      if (evalRow) evaluationIds.push(evalRow.id as string);

      if (!allowed) {
        await this.supabase.from("policy_violations").insert({
          tenant_id: context.tenantId,
          policy_id: policy.id as string,
          evaluation_id: evalRow?.id ?? null,
          context_type: "agent_run",
          severity: "high",
          message: violations[violations.length - 1],
        });
      }
    }

    // Hard-coded safety: engineering scope always requires review
    if (context.intent === "engineering" || context.operatingSystem === "engineering") {
      requiresReview = true;
      if (!actions.includes("require_review")) actions.push("require_review");
    }

    if (context.confidence !== undefined && context.confidence < 0.7) {
      requiresReview = true;
    }

    return { allowed, requiresReview, requiresApproval, actions, violations, evaluationIds };
  }

  private matchCondition(condition: Record<string, unknown>, context: PolicyEvaluationContext): boolean {
    const type = condition.condition_type as PolicyConditionType;
    const value = (condition.value as Record<string, unknown>) ?? {};

    switch (type) {
      case "confidence_threshold":
        return context.confidence !== undefined && context.confidence < Number(value.threshold ?? 0.7);
      case "risk_level": {
        const levels = (value.levels as string[]) ?? [];
        return context.riskLevel ? levels.includes(context.riskLevel) : false;
      }
      case "operating_system_scope":
        return context.operatingSystem === value.scope || context.intent === String(value.scope);
      case "model_provider_allowed": {
        const allowed = (value.providers as string[]) ?? [];
        return context.modelProvider ? !allowed.includes(context.modelProvider) : false;
      }
      case "human_review_required":
        return true;
      default:
        return false;
    }
  }

  async simulate(context: PolicyEvaluationContext): Promise<PolicyEvaluationResult> {
    return this.evaluate({ ...context, simulation: true });
  }
}
