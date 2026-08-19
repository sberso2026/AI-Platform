import type { ConnectorsHardeningContract } from "@rtb/types";

export const CONNECTORS_HARDENING_CONTRACT: ConnectorsHardeningContract = {
  capability: "connectors_hardening",
  implemented: true,
  reuses: [
    "platform_intelligence_secret_management",
    "platform_kernel_event_bus",
    "platform_kernel_jobs",
    "platform_intelligence_policy_engine",
    "platform_kernel_workflow_engine",
    "platform_kernel_audit",
    "platform_kernel_knowledge_graph",
    "platform_kernel_memory",
    "platform_kernel_agent_registry",
    "platform_kernel_ai_director",
  ],
  implementsOwnAiStack: false,
  duplicateIntegrationStackDetected: false,
  duplicateAgentRuntimeDetected: false,
  duplicateKnowledgeGraphDetected: false,
  ExternalWritesDisabled: true,
  NoVendorHardDependency: true,
  ReadFirst: true,
  agentRegistryMismatchBlocksExecution: true,
  suppressedIdentityReconstructionBlocked: true,
  crossTenantConnectorAccess: false,
  directAgentProviderAccess: false,
  unrestrictedExternalProxy: false,
  note: "BOS-12 Connectors and Hardening. Optional read-first adapters over Platform secrets, jobs, events, policy, audit, graph, memory, and agent registry. Not a second integration, AI, agent, or graph stack. Fixtures are never live.",
};

export function connectorsHardeningStatus() {
  return {
    available: true as const,
    reason: "connectors_hardening_implemented" as const,
    contract: CONNECTORS_HARDENING_CONTRACT.capability,
    implemented: true as const,
    optional: true as const,
    requiredForBusinessOs: false as const,
  };
}

/** BOS-12 extension boundary only. Do not start a post-BOS-12 phase. */
export const BOS_13_BOUNDARY_NOTE =
  "BOS-12 extension boundary only. Do not start a post-BOS-12 phase." as const;
