/**
 * Phase 8C — Document Intelligence binds to shared Engineering Services.
 * Feature-specific intelligence services remain local; shared infra must not be forked.
 */
import {
  ENGINEERING_SHARED_SERVICE_IDS,
  createEngineeringSharedServicesFacade,
  type EngineeringSharedServiceId,
} from "@rtb/engineering-os";
import { assertProjectIntelligenceAiRuntime } from "../ai/shared-runtime";

export const DOCUMENT_INTELLIGENCE_SHARED_SERVICES = [
  "document_references",
  "attachments",
  "version_history",
  "engineering_timelines",
  "comments",
  "approvals",
  "audit",
  "reporting",
  "ai_context",
  "activity",
  "notification",
] as const satisfies readonly EngineeringSharedServiceId[];

/** Tables Document Intelligence may write (intelligence derivatives only). */
export const DOCUMENT_INTELLIGENCE_OWNED_TABLE_PREFIX = "project_intelligence_document_";

/** Engineering Core tables DI must not write directly. */
export const FORBIDDEN_DIRECT_CORE_WRITES = [
  "engineering_projects",
  "engineering_assets",
  "engineering_documents",
  "engineering_decisions",
  "engineering_actions",
  "engineering_risks",
  "engineering_issues",
  "engineering_technical_queries",
] as const;

export function assertDocumentIntelligenceSharedServices(): void {
  const facade = createEngineeringSharedServicesFacade();
  for (const id of DOCUMENT_INTELLIGENCE_SHARED_SERVICES) {
    if (!ENGINEERING_SHARED_SERVICE_IDS.includes(id)) {
      throw new Error(`Unknown shared service: ${id}`);
    }
    if (!facade.has(id)) {
      throw new Error(`Document Intelligence missing shared service ${id}`);
    }
  }
  assertProjectIntelligenceAiRuntime();
}

export function assertNoPrivateAuditOrNotificationStack(flags: {
  implementsPrivateAudit: boolean;
  implementsPrivateNotification: boolean;
}): void {
  if (flags.implementsPrivateAudit) {
    throw new Error("Document Intelligence must consume shared audit — private audit forbidden");
  }
  if (flags.implementsPrivateNotification) {
    throw new Error(
      "Document Intelligence must consume shared notification — private notification forbidden",
    );
  }
}
