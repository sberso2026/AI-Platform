import type { PlatformKernel } from "@rtb/platform-kernel";
import type { PolicyEvaluationResult } from "@rtb/types";
import type { PolicyPort } from "./ports";

const CLOSED: PolicyEvaluationResult = {
  allowed: false,
  requiresReview: false,
  requiresApproval: false,
  actions: ["deny"],
  violations: ["policy_engine_unavailable"],
  evaluationIds: [],
};

export function kernelPolicyPort(kernel: PlatformKernel): PolicyPort {
  return {
    async evaluate(input) {
      try {
        return await kernel.intelligence.policies.evaluate({
          tenantId: input.tenantId,
          intent: input.intent,
          operatingSystem: input.operatingSystem,
          agentId: input.agentId,
          toolId: input.toolId,
          simulation: input.simulation ?? false,
        });
      } catch {
        return CLOSED;
      }
    },
  };
}
