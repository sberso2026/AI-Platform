import type { AiWorkforceContract } from "@rtb/types";

export const AI_WORKFORCE_CONTRACT: AiWorkforceContract = {
  capability: "ai_workforce",
  implemented: true,
  reuses: [
    "platform_kernel_agent_registry",
    "platform_kernel_ai_director",
    "platform_intelligence_policy_engine",
    "platform_intelligence_tool_registry",
    "platform_kernel_workflow_engine",
    "platform_kernel_event_bus",
    "platform_kernel_memory",
    "platform_kernel_knowledge_graph",
  ],
  implementsOwnAiStack: false,
  duplicateAgentRuntimeDetected: false,
  autonomousApprovalEnabled: false,
  directProviderAccess: false,
  unrestrictedGraphAccess: false,
  canonicalDomainMutationBypass: false,
  crossTenantAgentAccess: false,
  note: "BOS-11 AI Workforce. Orchestration and governance over Platform Kernel Agent Registry, AI Director, Policy Engine, Tool Registry, Workflow, Event Bus, Memory, and the BOS-10 Business Context Graph. Not a second AI or agent stack.",
};

export function aiWorkforceStatus() {
  return {
    available: true as const,
    reason: "ai_workforce_implemented" as const,
    contract: AI_WORKFORCE_CONTRACT.capability,
    implemented: true as const,
  };
}

/** BOS-11 extension boundary only. Do not start BOS-12. */
export const BOS_12_BOUNDARY_NOTE = "BOS-11 extension boundary only. Do not start BOS-12." as const;
