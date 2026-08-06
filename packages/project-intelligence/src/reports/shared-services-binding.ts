/**
 * Reporting Intelligence shared Engineering Services binding.
 * Keep off the server barrel if it pulls Engineering OS named exports under tsx.
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

export const REPORTING_INTELLIGENCE_SHARED_SERVICES = [
  "reporting",
  "audit",
  "ai_context",
  "activity",
  "engineering_timelines",
  "approvals",
  "document_references",
  "notification",
] as const satisfies readonly EngineeringSharedServiceId[];

export function assertReportingIntelligenceSharedServices(): void {
  const facade = createEngineeringSharedServicesFacade();
  for (const id of REPORTING_INTELLIGENCE_SHARED_SERVICES) {
    if (!ENGINEERING_SHARED_SERVICE_IDS.includes(id)) {
      throw new Error(`Unknown shared service: ${id}`);
    }
    if (!facade.has(id)) {
      throw new Error(`Reporting Intelligence missing shared service ${id}`);
    }
  }
  const ai = createEngineeringAiFramework();
  ai.assertSharedStackOnly(`${PROJECT_INTELLIGENCE_MODULE_KEY}.reporting_intelligence`, false);
  for (const cap of ["citations", "human_approval", "cost_controls", "prompt_registry"] as const) {
    if (!ENGINEERING_AI_CAPABILITY_IDS.includes(cap)) {
      throw new Error(`Unknown AI capability: ${cap}`);
    }
  }
  assertProjectIntelligenceAiRuntime();
}
