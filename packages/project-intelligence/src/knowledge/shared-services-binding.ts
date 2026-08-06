/**
 * Phase 8G — Knowledge Intelligence shared Engineering Services binding.
 * Keep off the server barrel if Eng OS named exports break tsx preflight.
 */
import {
  ENGINEERING_AI_CAPABILITY_IDS,
  ENGINEERING_SHARED_SERVICE_IDS,
  createEngineeringAiFramework,
  createEngineeringSharedServicesFacade,
  type EngineeringSharedServiceId,
} from "@rtb/engineering-os";
import { assertProjectIntelligenceAiRuntime } from "../ai/shared-runtime";
import { PROJECT_INTELLIGENCE_MODULE_KEY } from "../features/registry";

export const KNOWLEDGE_INTELLIGENCE_SHARED_SERVICES = [
  "document_references",
  "engineering_timelines",
  "ai_context",
  "audit",
  "reporting",
  "activity",
  "approvals",
] as const satisfies readonly EngineeringSharedServiceId[];

export function assertKnowledgeIntelligenceSharedServices(): void {
  const facade = createEngineeringSharedServicesFacade();
  for (const id of KNOWLEDGE_INTELLIGENCE_SHARED_SERVICES) {
    if (!ENGINEERING_SHARED_SERVICE_IDS.includes(id)) {
      throw new Error(`Unknown shared service: ${id}`);
    }
    if (!facade.has(id)) {
      throw new Error(`Knowledge Intelligence missing shared service ${id}`);
    }
  }
  const ai = createEngineeringAiFramework();
  ai.assertSharedStackOnly(`${PROJECT_INTELLIGENCE_MODULE_KEY}.knowledge_intelligence`, false);
  for (const cap of [
    "knowledge_retrieval",
    "evidence_grounding",
    "citations",
    "prompt_registry",
  ] as const) {
    if (!ENGINEERING_AI_CAPABILITY_IDS.includes(cap)) {
      throw new Error(`Unknown AI capability: ${cap}`);
    }
  }
  assertProjectIntelligenceAiRuntime();
}
