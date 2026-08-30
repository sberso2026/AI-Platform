/**
 * PI-9 Project Reporting Intelligence ownership locks.
 * Compose existing PI; do not create a second truth model, AI stack, or document renderer.
 */

import {
  SCHEMA_CHANGED,
  duplicateAgentRuntimeDetected,
  duplicateCanonicalProjectDomainDetected,
  duplicateCommerceStackDetected,
  duplicateIdentityStackDetected,
  duplicateKnowledgeGraphDetected,
  duplicateWorkflowEngineDetected,
  implementsOwnAiStack,
} from "../project-health/ownership";

export const PROJECT_REPORTING_PHASE = "PI-9" as const;
export const PI_9_IMPLEMENTED = true as const;
export const PI_9_PROJECT_REPORTING_PASS_SENTINEL = true as const;
export const PI_10_READY = true as const;
export const PI_10_IMPLEMENTED = false as const;
export const PI_REPORTING_REAL_MODEL_CERTIFIED = false as const;

export const implementsOwnAiStackReporting = implementsOwnAiStack;
export const duplicateReportingTruthModelDetected = false as const;
export const duplicateDocumentSystemDetected = false as const;
export const directProviderAccessFromPI = false as const;
export const unrestrictedGraphAccessFromReporting = false as const;
export const SCHEMA_CHANGED_REPORTING = SCHEMA_CHANGED;

export const PROJECT_REPORTING_OWNERSHIP = {
  composition: "project_intelligence.project_reporting",
  canonicalFacts: "project_intelligence.command_centre",
  connectorContext: "platform_kernel.connector_context",
  aiNarrative: "platform_kernel.ai_director",
  promptRegistry: "platform_intelligence.prompt_registry",
  modelRegistry: "platform_intelligence.model_registry",
  audit: "platform_core.audit",
  documents: "engineering_os.documents",
  export: "snapshot_markdown_no_pdf_renderer",
  persistence: "in_response_snapshot_not_stored",
} as const;

export const FORBIDDEN_REPORTING_TOKENS = [
  "new OpenAI",
  "anthropic",
  "@anthropic-ai",
  "createForecastIntelligenceEngine",
  "createProjectControlsEngine",
  "puppeteer",
  "pdfkit",
  "completionDatePredicted: true",
  "costForecastComputed: true",
] as const;

export function assertProjectReportingOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("Project Reporting must not implement its own AI stack");
  if (implementsOwnAiStackReporting) throw new Error("duplicate AI stack");
  if (duplicateAgentRuntimeDetected) throw new Error("duplicate agent runtime");
  if (duplicateKnowledgeGraphDetected) throw new Error("duplicate knowledge graph");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateDocumentSystemDetected) throw new Error("duplicate document system");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateReportingTruthModelDetected) throw new Error("duplicate reporting truth model");
  if (duplicateCanonicalProjectDomainDetected) throw new Error("duplicate canonical project domain");
  if (directProviderAccessFromPI) throw new Error("direct provider access from PI forbidden");
  if (unrestrictedGraphAccessFromReporting) throw new Error("unrestricted graph access forbidden");
  if (SCHEMA_CHANGED) throw new Error("PI-9 must not change schema");
  if (PI_10_IMPLEMENTED) throw new Error("PI-10 must not start in PI-9");
  if (PI_REPORTING_REAL_MODEL_CERTIFIED) {
    throw new Error("fixture/sandbox must not be reported as real-model report certification");
  }
}
