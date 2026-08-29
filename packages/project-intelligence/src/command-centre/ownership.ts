/**
 * PI-1 Command Centre ownership locks. Consume published outputs; do not rebuild engines.
 */

import {
  PI_CANONICAL_MUTATION_BYPASS,
  SCHEMA_CHANGED,
  duplicateCanonicalProjectDomainDetected,
  duplicateCommerceStackDetected,
  duplicateIdentityStackDetected,
  duplicateProjectControlsEngineDetected,
  duplicateWorkflowEngineDetected,
  implementsOwnAiStack,
} from "../project-health/ownership";

export const COMMAND_CENTRE_PHASE = "PI-1" as const;
export const COMMAND_CENTRE_GA_DECLARED = false as const;
export const PI_AI_REQUIRED = false as const;
export const PI_2_SCHEDULE_INTELLIGENCE_IMPLEMENTED = false as const;
export const PI_2_SCHEDULE_INTELLIGENCE_READY = false as const;

export const COMMAND_CENTRE_OWNERSHIP = {
  canonicalProjectDomain: "engineering_os_shared_project_domain",
  projectControlsPublishedOutputs: "project_controls",
  knowledgeFindings: "project_intelligence",
  commandCentreComposition: "project_intelligence",
  scheduleVarianceEngine: "project_controls",
  costForecastEngine: "project_controls",
  earnedValueEngine: "not_implemented_anywhere_in_pi",
  progressEngine: "project_controls",
  changeForecastEngine: "project_controls",
  criticalPathEngine: "not_implemented_anywhere_in_pi",
} as const;

export const duplicateAiStackDetected = implementsOwnAiStack;
export const duplicateGraphDetected = false as const;

export function assertCommandCentreOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("Command Centre must not implement its own AI stack");
  if (duplicateAiStackDetected) throw new Error("duplicate AI stack");
  if (duplicateGraphDetected) throw new Error("duplicate graph");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (duplicateProjectControlsEngineDetected) throw new Error("duplicate project controls engine");
  if (duplicateCanonicalProjectDomainDetected) throw new Error("duplicate canonical project domain");
  if (SCHEMA_CHANGED) throw new Error("PI-1 must not change schema");
  if (PI_CANONICAL_MUTATION_BYPASS) throw new Error("canonical mutation bypass forbidden");
  if (COMMAND_CENTRE_GA_DECLARED) throw new Error("Command Centre GA must not be declared in PI-1");
  if (PI_AI_REQUIRED) throw new Error("Command Centre must function with AI disabled");
  if (PI_2_SCHEDULE_INTELLIGENCE_IMPLEMENTED) throw new Error("PI-2 must not start in PI-1");
}

export const FORBIDDEN_PROJECT_CONTROLS_ENGINE_IMPORTS = [
  "createScheduleIntelligenceEngine",
  "createCostIntelligenceEngine",
  "createProgressIntelligenceEngine",
  "createChangeIntelligenceEngine",
  "createForecastIntelligenceEngine",
  "createProjectControlsEngine",
] as const;
