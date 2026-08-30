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

export const RISK_CHANGE_INTELLIGENCE_PHASE = "PI-4" as const;
export const RISK_CHANGE_INTELLIGENCE_IMPLEMENTED = true as const;
export const PI_AI_REQUIRED = false as const;
export const PI_RISK_MUTATION_ENABLED = false as const;
export const PI_CHANGE_MUTATION_ENABLED = false as const;
export const duplicateRiskDomainDetected = false as const;
export const duplicateChangeEngineDetected = false as const;
export const duplicateProjectControlsEngineDetectedInPi4 = duplicateProjectControlsEngineDetected;
export const duplicateCanonicalProjectDomainDetectedInPi4 = duplicateCanonicalProjectDomainDetected;
export const duplicateAiStackDetected = implementsOwnAiStack;
export const duplicateGraphDetected = duplicateKnowledgeGraphDetected;
/**
 * Phase-ownership freeze, not PI-5 implementation state.
 * Must remain false so PI-4 locks reject in-phase PI-5 work.
 * PI-5 implementation is QUERY_DECISION_INTELLIGENCE_IMPLEMENTED.
 */
export const PI_5_RFI_TQ_DECISION_INTELLIGENCE_IMPLEMENTED = false as const;
export const PI_5_RFI_TQ_DECISION_INTELLIGENCE_READY = true as const;

export const RISK_CHANGE_INTELLIGENCE_OWNERSHIP = {
  canonicalRiskRegister: "engineering_os",
  canonicalChangeAssessments: "project_controls",
  riskInterpretation: "project_intelligence",
  changeInterpretation: "project_intelligence",
  riskRegisterStorage: "not_implemented_in_pi",
  riskMutationEngine: "not_implemented_in_pi",
  independentRiskScoring: "not_implemented_in_pi",
  changeApprovalEngine: "not_implemented_in_pi",
  changeImpactCalculationEngine: "not_implemented_in_pi",
  costScheduleRecalculation: "not_implemented_in_pi",
  riskMutation: "forbidden",
  changeMutation: "forbidden",
} as const;

export const FORBIDDEN_RISK_CHANGE_ENGINE_TOKENS = [
  "createChangeIntelligenceEngine",
  "createRiskOpportunityEngine",
  "createCostIntelligenceEngine",
  "createScheduleIntelligenceEngine",
  "createForecastIntelligenceEngine",
  "probability * consequence",
  "autonomous risk approval",
  "autonomous change approval",
] as const;

export function assertRiskChangeIntelligenceOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("Risk & Change Intelligence must not implement its own AI stack");
  if (duplicateAiStackDetected) throw new Error("duplicate AI stack");
  if (duplicateGraphDetected) throw new Error("duplicate graph");
  if (duplicateProjectControlsEngineDetected) throw new Error("duplicate project controls engine");
  if (duplicateChangeEngineDetected) throw new Error("duplicate change engine");
  if (duplicateRiskDomainDetected) throw new Error("duplicate risk domain");
  if (duplicateCanonicalProjectDomainDetected) throw new Error("duplicate canonical project domain");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (SCHEMA_CHANGED) throw new Error("PI-4 must not change schema");
  if (PI_CANONICAL_MUTATION_BYPASS) throw new Error("canonical mutation bypass forbidden");
  if (PI_RISK_MUTATION_ENABLED) throw new Error("risk mutation forbidden");
  if (PI_CHANGE_MUTATION_ENABLED) throw new Error("change mutation forbidden");
  if (PI_AI_REQUIRED) throw new Error("Risk & Change Intelligence must function with AI disabled");
  if (PI_5_RFI_TQ_DECISION_INTELLIGENCE_IMPLEMENTED) throw new Error("PI-5 must not start in PI-4");
}
