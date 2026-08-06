/**
 * Phase 8E — Findings Intelligence binds to shared Engineering Services.
 * Keep this module off the server barrel (tsx + Engineering OS named-export constraint).
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

export const FINDINGS_INTELLIGENCE_SHARED_SERVICES = [
  "activity",
  "engineering_timelines",
  "comments",
  "approvals",
  "attachments",
  "document_references",
  "version_history",
  "audit",
  "notification",
  "ai_context",
  "reporting",
] as const satisfies readonly EngineeringSharedServiceId[];

export function assertFindingsIntelligenceSharedServices(): void {
  const facade = createEngineeringSharedServicesFacade();
  for (const id of FINDINGS_INTELLIGENCE_SHARED_SERVICES) {
    if (!ENGINEERING_SHARED_SERVICE_IDS.includes(id)) {
      throw new Error(`Unknown shared service: ${id}`);
    }
    if (!facade.has(id)) {
      throw new Error(`Findings Intelligence missing shared service ${id}`);
    }
  }
  const ai = createEngineeringAiFramework();
  ai.assertSharedStackOnly(`${PROJECT_INTELLIGENCE_MODULE_KEY}.findings_intelligence`, false);
  for (const cap of ["evidence_grounding", "citations", "capability_registry", "human_approval"] as const) {
    if (!ENGINEERING_AI_CAPABILITY_IDS.includes(cap)) {
      throw new Error(`Unknown AI capability: ${cap}`);
    }
  }
  assertProjectIntelligenceAiRuntime();
}

export function assertNoFindingsPrivateInfrastructure(flags: {
  implementsPrivateAudit: boolean;
  implementsPrivateNotification: boolean;
  implementsPrivateAiRuntime: boolean;
  implementsPrivateApprovalEngine: boolean;
}): void {
  if (flags.implementsPrivateAudit) throw new Error("Private audit forbidden");
  if (flags.implementsPrivateNotification) throw new Error("Private notification forbidden");
  if (flags.implementsPrivateAiRuntime) throw new Error("Private AI runtime forbidden");
  if (flags.implementsPrivateApprovalEngine) throw new Error("Private approval engine forbidden");
}
