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

export const SCHEDULE_INTELLIGENCE_PHASE = "PI-2" as const;
export const SCHEDULE_INTELLIGENCE_IMPLEMENTED = true as const;
export const PI_AI_REQUIRED = false as const;
export const PI_SCHEDULE_MUTATION_ENABLED = false as const;
export const duplicateScheduleEngineDetected = false as const;
export const PI_3_COST_PROGRESS_INTELLIGENCE_IMPLEMENTED = false as const;

export const SCHEDULE_INTELLIGENCE_OWNERSHIP = {
  canonicalScheduleAssessments: "project_controls",
  scheduleInterpretation: "project_intelligence",
  cpmEngine: "not_implemented_in_pi",
  floatEngine: "not_implemented_in_pi",
  baselineMutation: "forbidden",
  scheduleForecastEngine: "project_controls",
  earnedScheduleEngine: "not_implemented_in_pi",
} as const;

export const FORBIDDEN_SCHEDULE_ENGINE_TOKENS = [
  "createScheduleIntelligenceEngine",
  "criticalPathComputed: true",
  "floatComputed: true",
  "forwardBackwardPass",
  "earnedSchedule",
] as const;

export function assertScheduleIntelligenceOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("Schedule Intelligence must not implement its own AI stack");
  if (duplicateProjectControlsEngineDetected) throw new Error("duplicate project controls engine");
  if (duplicateScheduleEngineDetected) throw new Error("duplicate schedule engine");
  if (duplicateCanonicalProjectDomainDetected) throw new Error("duplicate canonical project domain");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (SCHEMA_CHANGED) throw new Error("PI-2 must not change schema");
  if (PI_CANONICAL_MUTATION_BYPASS) throw new Error("canonical mutation bypass forbidden");
  if (PI_SCHEDULE_MUTATION_ENABLED) throw new Error("schedule mutation forbidden");
  if (PI_AI_REQUIRED) throw new Error("Schedule Intelligence must function with AI disabled");
  if (PI_3_COST_PROGRESS_INTELLIGENCE_IMPLEMENTED) throw new Error("PI-3 must not start in PI-2");
}
