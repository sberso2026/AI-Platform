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

export const QUERY_DECISION_INTELLIGENCE_PHASE = "PI-5" as const;
/** PI-5 implementation state. Distinct from the PI-4 phase-ownership freeze flag. */
export const QUERY_DECISION_INTELLIGENCE_IMPLEMENTED = true as const;
/**
 * Implementation state must not be overloaded as phase ownership/freeze permission.
 * Freeze: PI_5_RFI_TQ_DECISION_INTELLIGENCE_IMPLEMENTED in PI-4 (remains false).
 * Implementation: QUERY_DECISION_INTELLIGENCE_IMPLEMENTED (true after PI-5).
 */
export const PI_5_IMPLEMENTATION_FLAG_SEMANTICS_RECONCILED = true as const;
export const PI_AI_REQUIRED = false as const;
export const PI_QUERY_MUTATION_ENABLED = false as const;
export const PI_DECISION_MUTATION_ENABLED = false as const;
export const PI_ACTION_MUTATION_ENABLED = false as const;
export const duplicateQueryDomainDetected = false as const;
export const duplicateRfiDomainDetected = false as const;
export const duplicateDecisionDomainDetected = false as const;
export const duplicateActionDomainDetected = false as const;
export const duplicateAiStackDetected = implementsOwnAiStack;
export const duplicateGraphDetected = duplicateKnowledgeGraphDetected;
export const PI_6_FORECASTING_IMPLEMENTED = false as const;
export const PI_6_FORECASTING_READY = true as const;

export const QUERY_DECISION_INTELLIGENCE_OWNERSHIP = {
  canonicalTechnicalQueries: "engineering_os",
  canonicalRfi: "not_first_class_canonical_entity",
  canonicalDecisions: "engineering_os",
  canonicalActions: "engineering_os",
  queryInterpretation: "project_intelligence",
  decisionInterpretation: "project_intelligence",
  actionInterpretation: "project_intelligence",
  queryStorage: "not_implemented_in_pi",
  rfiStorage: "not_implemented_in_pi",
  decisionStorage: "not_implemented_in_pi",
  actionStorage: "not_implemented_in_pi",
  tqResponseWorkflow: "not_implemented_in_pi",
  decisionApprovalWorkflow: "not_implemented_in_pi",
  actionCompletionWorkflow: "not_implemented_in_pi",
  contractualCommunicationEngine: "not_implemented_in_pi",
} as const;

export const FORBIDDEN_QUERY_DECISION_ENGINE_TOKENS = [
  "createChangeIntelligenceEngine",
  "autonomous technical response",
  "autonomous decision approval",
  "autonomous action closure",
] as const;

export function assertQueryDecisionIntelligenceOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("Query & Decision Intelligence must not implement its own AI stack");
  if (duplicateAiStackDetected) throw new Error("duplicate AI stack");
  if (duplicateGraphDetected) throw new Error("duplicate graph");
  if (duplicateQueryDomainDetected) throw new Error("duplicate query domain");
  if (duplicateRfiDomainDetected) throw new Error("duplicate RFI domain");
  if (duplicateDecisionDomainDetected) throw new Error("duplicate decision domain");
  if (duplicateActionDomainDetected) throw new Error("duplicate action domain");
  if (duplicateCanonicalProjectDomainDetected) throw new Error("duplicate canonical project domain");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateProjectControlsEngineDetected) throw new Error("duplicate project controls engine");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (SCHEMA_CHANGED) throw new Error("PI-5 must not change schema");
  if (PI_CANONICAL_MUTATION_BYPASS) throw new Error("canonical mutation bypass forbidden");
  if (PI_QUERY_MUTATION_ENABLED) throw new Error("query mutation forbidden");
  if (PI_DECISION_MUTATION_ENABLED) throw new Error("decision mutation forbidden");
  if (PI_ACTION_MUTATION_ENABLED) throw new Error("action mutation forbidden");
  if (PI_AI_REQUIRED) throw new Error("Query & Decision Intelligence must function with AI disabled");
  if (PI_6_FORECASTING_IMPLEMENTED) throw new Error("PI-6 must not start in PI-5");
}
