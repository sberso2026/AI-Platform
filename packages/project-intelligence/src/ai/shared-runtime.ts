/**
 * Phase 8B — Project Intelligence consumes Platform AI Runtime via
 * Engineering Intelligence Framework. No independent AI stack.
 */
import {
  createEngineeringAiFramework,
  ENGINEERING_AI_CAPABILITY_IDS,
  type EngineeringAiCapabilityId,
} from "@rtb/engineering-os";
import { PROJECT_INTELLIGENCE_MODULE_KEY } from "../features/registry";

export const PROJECT_INTELLIGENCE_AI_CONSUMPTION = {
  moduleKey: PROJECT_INTELLIGENCE_MODULE_KEY,
  implementsOwnAiStack: false as const,
  platformRuntime: "rtb-ai-platform",
  engineeringFramework: "engineering-os-ai-framework",
  /** Cert-safe local adapters implement Engineering AI ports; they are not a private stack. */
  localFallbackPorts: ["deterministic-meeting-ai", "evidence-bound-summaries"] as const,
  capabilities: [
    "knowledge_retrieval",
    "evidence_grounding",
    "citations",
    "human_approval",
    "cost_controls",
    "prompt_registry",
    "capability_registry",
  ] as const satisfies readonly EngineeringAiCapabilityId[],
};

export function assertProjectIntelligenceAiRuntime(): void {
  const ai = createEngineeringAiFramework();
  ai.assertSharedStackOnly(
    PROJECT_INTELLIGENCE_MODULE_KEY,
    PROJECT_INTELLIGENCE_AI_CONSUMPTION.implementsOwnAiStack,
  );
  for (const cap of PROJECT_INTELLIGENCE_AI_CONSUMPTION.capabilities) {
    if (!ENGINEERING_AI_CAPABILITY_IDS.includes(cap)) {
      throw new Error(`Unknown Engineering AI capability: ${cap}`);
    }
  }
}
