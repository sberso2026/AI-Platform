import {
  PI_CANONICAL_MUTATION_BYPASS,
  SCHEMA_CHANGED,
  duplicateCanonicalProjectDomainDetected,
  duplicateCommerceStackDetected,
  duplicateIdentityStackDetected,
  duplicateKnowledgeGraphDetected,
  duplicateProjectControlsEngineDetected,
  duplicateWorkflowEngineDetected,
  implementsOwnAiStack,
} from "../project-health/ownership";

export const FORECAST_INTELLIGENCE_PHASE = "PI-6" as const;
/**
 * PI-6 implementation state. Distinct from the PI-5 freeze flag
 * PI_6_FORECASTING_IMPLEMENTED, which remains false so PI-5 locks reject
 * in-phase PI-6 work. Implementation must not be overloaded as freeze permission.
 */
export const FORECAST_INTELLIGENCE_IMPLEMENTED = true as const;
export const PI_AI_REQUIRED = false as const;
export const PI_FORECAST_MUTATION_ENABLED = false as const;
export const PI_PREDICTIVE_MODEL_IMPLEMENTED = false as const;
/** Canonical Project Controls forecast lists are exhaustive (no register .limit(50)). */
export const PI_HOSTED_LIST_COMPLETENESS_MODEL =
  "register_page_limit_unknown;forecast_lists_exhaustive" as const;
export const PI_50_RECORD_LIMIT_AFFECTS_FORECASTING = false as const;
export const duplicateForecastEngineDetected = false as const;
export const duplicateMonteCarloEngineDetected = false as const;
export const duplicateScenarioGeneratorDetected = false as const;
export const duplicateAiStackDetected = implementsOwnAiStack;
export const duplicateGraphDetected = duplicateKnowledgeGraphDetected;
/** Phase-ownership freeze. Not PI-7 implementation state. */
export const PI_7_AI_PROJECT_ANALYST_IMPLEMENTED = false as const;
export const PI_7_AI_PROJECT_ANALYST_READY = false as const;

export const FORECAST_INTELLIGENCE_OWNERSHIP = {
  canonicalForecastAssessments: "project_controls",
  forecastInterpretation: "project_intelligence",
  forecastEngine: "not_implemented_in_pi",
  scheduleForecastEngine: "not_implemented_in_pi",
  costForecastEngine: "not_implemented_in_pi",
  progressForecastEngine: "not_implemented_in_pi",
  completionForecastEngine: "not_implemented_in_pi",
  monteCarloEngine: "not_implemented_in_pi",
  earnedValueForecasting: "not_implemented_in_pi",
  scenarioGenerator: "not_implemented_in_pi",
  predictiveModel: "not_implemented_in_pi",
  forecastMutation: "forbidden",
} as const;

export const FORBIDDEN_FORECAST_ENGINE_TOKENS = [
  "createForecastIntelligenceEngine",
  "createScheduleIntelligenceEngine",
  "createCostIntelligenceEngine",
  "createProgressIntelligenceEngine",
  "createProjectControlsEngine",
  "Monte Carlo",
  "time-series forecasting",
  "completionDatePredicted: true",
  "costForecastComputed: true",
] as const;

export function assertForecastIntelligenceOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("Forecast Intelligence must not implement its own AI stack");
  if (duplicateAiStackDetected) throw new Error("duplicate AI stack");
  if (duplicateGraphDetected) throw new Error("duplicate graph");
  if (duplicateForecastEngineDetected) throw new Error("duplicate forecast engine");
  if (duplicateMonteCarloEngineDetected) throw new Error("duplicate Monte Carlo engine");
  if (duplicateScenarioGeneratorDetected) throw new Error("duplicate scenario generator");
  if (PI_PREDICTIVE_MODEL_IMPLEMENTED) throw new Error("predictive model forbidden in PI-6");
  if (duplicateProjectControlsEngineDetected) throw new Error("duplicate project controls engine");
  if (duplicateCanonicalProjectDomainDetected) throw new Error("duplicate canonical project domain");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (SCHEMA_CHANGED) throw new Error("PI-6 must not change schema");
  if (PI_CANONICAL_MUTATION_BYPASS) throw new Error("canonical mutation bypass forbidden");
  if (PI_FORECAST_MUTATION_ENABLED) throw new Error("forecast mutation forbidden");
  if (PI_AI_REQUIRED) throw new Error("Forecast Intelligence must function with AI disabled");
  if (PI_7_AI_PROJECT_ANALYST_IMPLEMENTED) throw new Error("PI-7 must not start in PI-6");
}
