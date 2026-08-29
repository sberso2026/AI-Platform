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

export const COST_PROGRESS_INTELLIGENCE_PHASE = "PI-3" as const;
export const COST_PROGRESS_INTELLIGENCE_IMPLEMENTED = true as const;
export const PI_AI_REQUIRED = false as const;
export const PI_COST_MUTATION_ENABLED = false as const;
export const PI_PROGRESS_MUTATION_ENABLED = false as const;
export const duplicateCostEngineDetected = false as const;
export const duplicateProgressEngineDetected = false as const;
export const duplicateEarnedValueEngineDetected = false as const;
export const PI_4_RISK_CHANGE_INTELLIGENCE_IMPLEMENTED = false as const;

export const COST_PROGRESS_INTELLIGENCE_OWNERSHIP = {
  canonicalCostStates: "project_controls",
  canonicalProgressAssessments: "project_controls",
  costInterpretation: "project_intelligence",
  progressInterpretation: "project_intelligence",
  costLedger: "not_implemented_in_pi",
  costForecastEngine: "not_implemented_in_pi",
  earnedValueEngine: "not_implemented_in_pi",
  progressCalculationEngine: "not_implemented_in_pi",
  physicalProgressEngine: "not_implemented_in_pi",
  budgetMutation: "forbidden",
  forecastMutation: "forbidden",
} as const;

export const FORBIDDEN_COST_PROGRESS_ENGINE_TOKENS = [
  "createCostIntelligenceEngine",
  "createProgressIntelligenceEngine",
  "createForecastIntelligenceEngine",
  "earnedValueComputed: true",
  "physicalPercentCompleteCertified: true",
  "computeCPI",
  "computeSPI",
  "BCWS",
  "BCWP",
  "ACWP",
] as const;

export function assertCostProgressIntelligenceOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("Cost & Progress Intelligence must not implement its own AI stack");
  if (duplicateProjectControlsEngineDetected) throw new Error("duplicate project controls engine");
  if (duplicateCostEngineDetected) throw new Error("duplicate cost engine");
  if (duplicateProgressEngineDetected) throw new Error("duplicate progress engine");
  if (duplicateEarnedValueEngineDetected) throw new Error("duplicate earned-value engine");
  if (duplicateCanonicalProjectDomainDetected) throw new Error("duplicate canonical project domain");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (SCHEMA_CHANGED) throw new Error("PI-3 must not change schema");
  if (PI_CANONICAL_MUTATION_BYPASS) throw new Error("canonical mutation bypass forbidden");
  if (PI_COST_MUTATION_ENABLED) throw new Error("cost mutation forbidden");
  if (PI_PROGRESS_MUTATION_ENABLED) throw new Error("progress mutation forbidden");
  if (PI_AI_REQUIRED) throw new Error("Cost & Progress Intelligence must function with AI disabled");
  if (PI_4_RISK_CHANGE_INTELLIGENCE_IMPLEMENTED) throw new Error("PI-4 must not start in PI-3");
}
