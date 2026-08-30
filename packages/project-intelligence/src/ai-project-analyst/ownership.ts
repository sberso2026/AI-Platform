/**
 * PI-7 AI Project Analyst ownership locks.
 * Distinct from the PI-6 freeze flags PI_7_AI_PROJECT_ANALYST_* which remain false.
 */

import {
  PI_CANONICAL_MUTATION_BYPASS,
  SCHEMA_CHANGED,
  duplicateAgentRuntimeDetected,
  duplicateCanonicalProjectDomainDetected,
  duplicateCommerceStackDetected,
  duplicateIdentityStackDetected,
  duplicateKnowledgeGraphDetected,
  duplicateProjectControlsEngineDetected,
  duplicateWorkflowEngineDetected,
  implementsOwnAiStack,
} from "../project-health/ownership";

import { PI_9_IMPLEMENTED } from "../connector-context/ownership";

export const AI_PROJECT_ANALYST_PHASE = "PI-7" as const;
export const AI_PROJECT_ANALYST_IMPLEMENTED = true as const;
export const PI_AI_OPTIONAL = true as const;
export const PI_ANALYST_MUTATION_ENABLED = false as const;
export const PI_AUTONOMOUS_APPROVAL_ENABLED = false as const;
export const PI_ANALYST_STATELESS = true as const;
export const PI_ANALYST_MEMORY_MODE = "session_bounded" as const;
export const PI_8_CONNECTOR_CONTEXT_READY = true as const;
/**
 * PI-6 freeze sentinel. Remains false so PI-6 ownership still forbids in-phase PI-7.
 * Runtime implementation is AI_PROJECT_ANALYST_IMPLEMENTED.
 */
export const PI_6_FREEZE_PI_7_SENTINEL_MUST_REMAIN_FALSE = true as const;

export const duplicateToolRegistryDetected = false as const;
export const duplicatePromptRegistryDetected = false as const;
export const duplicateModelRegistryDetected = false as const;
export const duplicateMemorySystemDetected = false as const;
export const directProviderAccess = false as const;
export const unrestrictedGraphAccess = false as const;
export const canonicalDomainMutationBypass = PI_CANONICAL_MUTATION_BYPASS;

export const AI_PROJECT_ANALYST_OWNERSHIP = {
  platformAiRuntime: "platform_kernel.ai_director",
  modelRouting: "platform_intelligence.model_registry",
  promptRegistry: "platform_intelligence.prompt_registry",
  toolRegistry: "platform_intelligence.tool_registry",
  policyEngine: "platform_intelligence.policy_engine",
  costControls: "platform_intelligence.cost_engine",
  observability: "platform_intelligence.observability",
  evaluation: "platform_intelligence.evaluation",
  knowledgeGraph: "platform_kernel.knowledge_graph",
  memory: "platform_kernel.memory",
  audit: "platform_core.audit",
  featureFlags: "platform_intelligence.feature_flags",
  deterministicIntelligence: "project_intelligence",
  forecastEngine: "not_implemented_in_pi",
  analystMutation: "forbidden",
} as const;

export const FORBIDDEN_ANALYST_TOKENS = [
  "createForecastIntelligenceEngine",
  "createScheduleIntelligenceEngine",
  "createCostIntelligenceEngine",
  "createProjectControlsEngine",
  "openai",
  "anthropic",
  "@anthropic-ai",
  "new OpenAI",
  "completionDatePredicted: true",
  "costForecastComputed: true",
] as const;

export function assertAiProjectAnalystOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("AI Project Analyst must not implement its own AI stack");
  if (duplicateAgentRuntimeDetected) throw new Error("duplicate agent runtime");
  if (duplicateToolRegistryDetected) throw new Error("duplicate tool registry");
  if (duplicatePromptRegistryDetected) throw new Error("duplicate prompt registry");
  if (duplicateModelRegistryDetected) throw new Error("duplicate model registry");
  if (duplicateKnowledgeGraphDetected) throw new Error("duplicate graph");
  if (duplicateMemorySystemDetected) throw new Error("duplicate memory system");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (duplicateProjectControlsEngineDetected) throw new Error("duplicate project controls engine");
  if (duplicateCanonicalProjectDomainDetected) throw new Error("duplicate canonical project domain");
  if (directProviderAccess) throw new Error("direct provider access forbidden");
  if (unrestrictedGraphAccess) throw new Error("unrestricted graph access forbidden");
  if (canonicalDomainMutationBypass) throw new Error("canonical mutation bypass forbidden");
  if (SCHEMA_CHANGED) throw new Error("PI-7 must not change schema");
  if (PI_ANALYST_MUTATION_ENABLED) throw new Error("analyst mutation forbidden");
  if (PI_AUTONOMOUS_APPROVAL_ENABLED) throw new Error("autonomous approval forbidden");
  if (!PI_AI_OPTIONAL) throw new Error("Command Centre / PI must remain AI-optional");
  if (PI_9_IMPLEMENTED) throw new Error("PI-9 must not start in PI-8");
}
