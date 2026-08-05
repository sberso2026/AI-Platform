/**
 * Phase 8D — Meeting Intelligence binds to shared Engineering Services.
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

export const MEETING_INTELLIGENCE_SHARED_SERVICES = [
  "engineering_timelines",
  "activity",
  "attachments",
  "comments",
  "approvals",
  "version_history",
  "audit",
  "notification",
  "document_references",
  "ai_context",
  "reporting",
] as const satisfies readonly EngineeringSharedServiceId[];

export function assertMeetingIntelligenceSharedServices(): void {
  const facade = createEngineeringSharedServicesFacade();
  for (const id of MEETING_INTELLIGENCE_SHARED_SERVICES) {
    if (!ENGINEERING_SHARED_SERVICE_IDS.includes(id)) {
      throw new Error(`Unknown shared service: ${id}`);
    }
    if (!facade.has(id)) {
      throw new Error(`Meeting Intelligence missing shared service ${id}`);
    }
  }
  const ai = createEngineeringAiFramework();
  ai.assertSharedStackOnly(`${PROJECT_INTELLIGENCE_MODULE_KEY}.meeting_intelligence`, false);
  for (const cap of ["evidence_grounding", "citations", "human_approval", "prompt_registry"] as const) {
    if (!ENGINEERING_AI_CAPABILITY_IDS.includes(cap)) {
      throw new Error(`Unknown AI capability: ${cap}`);
    }
  }
  assertProjectIntelligenceAiRuntime();
}

export function assertNoMeetingPrivateInfrastructure(flags: {
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
