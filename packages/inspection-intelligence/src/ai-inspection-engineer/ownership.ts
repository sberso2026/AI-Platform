/**
 * II-5 AI Inspection Engineer ownership. Advisory overlay on Platform AI.
 * Does not create an II-specific AI stack, provider client, or schema.
 */
import {
  SCHEMA_CHANGED,
  duplicateAgentRuntimeDetected,
  duplicateKnowledgeGraphDetected,
  implementsOwnAiStack,
  directProviderAccessFromInspectionIntelligence,
  autonomousInspectionApprovalEnabled,
  autonomousConditionRatingCertificationEnabled,
  autonomousRemediationApprovalEnabled,
  externalWritesEnabled,
  II_COMMAND_CENTRE_IMPLEMENTED,
} from "../next-gen/ownership";

export const AI_INSPECTION_ENGINEER_PHASE = "II-5" as const;
export const AI_INSPECTION_ENGINEER_IMPLEMENTED = true as const;
export const AI_INSPECTION_ENGINEER_EXTERNAL_WRITES = false as const;
export const AI_INSPECTION_ENGINEER_AUTONOMOUS_APPROVAL = false as const;
export const AI_INSPECTION_ENGINEER_AUTONOMOUS_CERTIFICATION = false as const;
export const AI_INSPECTION_ENGINEER_AUTONOMOUS_REMEDIATION = false as const;
export const IMPLEMENTS_OWN_AI_STACK = implementsOwnAiStack;
export const DUPLICATE_AGENT_RUNTIME_DETECTED = duplicateAgentRuntimeDetected;
export const DUPLICATE_KNOWLEDGE_GRAPH_DETECTED = duplicateKnowledgeGraphDetected;
export const DUPLICATE_PROMPT_REGISTRY_DETECTED = false as const;
export const DUPLICATE_MODEL_REGISTRY_DETECTED = false as const;
export const DUPLICATE_TOOL_REGISTRY_DETECTED = false as const;
export const DUPLICATE_MEMORY_STACK_DETECTED = false as const;
export const UNRESTRICTED_GRAPH_ACCESS = false as const;
export const CROSS_TENANT_AI_ACCESS = false as const;

export const AI_INSPECTION_ENGINEER_OWNERSHIP = {
  platformAiRuntime: "platform_kernel.ai_director",
  modelRouting: "platform_intelligence.model_registry",
  promptRegistry: "platform_intelligence.prompt_registry",
  toolRegistry: "platform_intelligence.tool_registry",
  policyEngine: "platform_intelligence.policy_engine",
  costControls: "platform_intelligence.cost_engine",
  observability: "platform_intelligence.observability",
  knowledgeGraph: "platform_intelligence.knowledge_graph",
  memory: "platform_kernel.memory",
  audit: "platform_core.audit",
  deterministicIntelligence: "inspection_intelligence",
  mutation: "forbidden",
} as const;

export const FORBIDDEN_ENGINEER_TOKENS = [
  "openai",
  "anthropic",
  "@anthropic-ai",
  "new OpenAI",
  "createServiceClient",
  "remainingLife",
  "failureProbability",
] as const;

export function assertAiInspectionEngineerOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("AI Inspection Engineer must not implement its own AI stack");
  if (duplicateAgentRuntimeDetected) throw new Error("duplicate agent runtime");
  if (DUPLICATE_PROMPT_REGISTRY_DETECTED) throw new Error("duplicate prompt registry");
  if (DUPLICATE_MODEL_REGISTRY_DETECTED) throw new Error("duplicate model registry");
  if (DUPLICATE_TOOL_REGISTRY_DETECTED) throw new Error("duplicate tool registry");
  if (duplicateKnowledgeGraphDetected) throw new Error("duplicate knowledge graph");
  if (DUPLICATE_MEMORY_STACK_DETECTED) throw new Error("duplicate memory stack");
  if (directProviderAccessFromInspectionIntelligence) throw new Error("direct provider access from II forbidden");
  if (UNRESTRICTED_GRAPH_ACCESS) throw new Error("unrestricted graph access forbidden");
  if (CROSS_TENANT_AI_ACCESS) throw new Error("cross-tenant AI access forbidden");
  if (AI_INSPECTION_ENGINEER_EXTERNAL_WRITES) throw new Error("engineer external writes forbidden");
  if (AI_INSPECTION_ENGINEER_AUTONOMOUS_APPROVAL) throw new Error("engineer autonomous approval forbidden");
  if (AI_INSPECTION_ENGINEER_AUTONOMOUS_CERTIFICATION) throw new Error("engineer autonomous certification forbidden");
  if (AI_INSPECTION_ENGINEER_AUTONOMOUS_REMEDIATION) throw new Error("engineer autonomous remediation forbidden");
  if (autonomousInspectionApprovalEnabled) throw new Error("autonomous inspection approval forbidden");
  if (autonomousConditionRatingCertificationEnabled) throw new Error("autonomous condition certification forbidden");
  if (autonomousRemediationApprovalEnabled) throw new Error("autonomous remediation approval forbidden");
  if (externalWritesEnabled) throw new Error("external writes forbidden");
  if (SCHEMA_CHANGED) throw new Error("II-5 must not change schema");
  if (II_COMMAND_CENTRE_IMPLEMENTED) throw new Error("Inspection Command Centre must not start in II-5");
}
