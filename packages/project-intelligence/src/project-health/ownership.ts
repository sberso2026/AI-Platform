/**
 * PI-0 ownership locks. Must remain false / freeze-compatible.
 */

export const PROJECT_HEALTH_FOUNDATION_ID = "project_health_foundation" as const;
export const PROJECT_HEALTH_FOUNDATION_PHASE = "PI-0" as const;

export const implementsOwnAiStack = false as const;
export const duplicateAgentRuntimeDetected = false as const;
export const duplicateKnowledgeGraphDetected = false as const;
export const duplicateWorkflowEngineDetected = false as const;
export const duplicateCommerceStackDetected = false as const;
export const duplicateIdentityStackDetected = false as const;
export const duplicateProjectControlsEngineDetected = false as const;
export const duplicateCanonicalProjectDomainDetected = false as const;
export const SCHEMA_CHANGED = false as const;
export const PROJECT_HEALTH_NUMERICAL_SCORE_IMPLEMENTED = false as const;
export const PROJECT_HEALTH_PERSISTED = false as const;
export const PI_CANONICAL_MUTATION_BYPASS = false as const;

export const PROJECT_HEALTH_OWNERSHIP = {
  canonicalProjectDomain: "engineering_os_shared_project_domain",
  canonicalRegisters: "engineering_core",
  scheduleCostProgressChangeForecast: "project_controls",
  documentMeetingFindingsKnowledgeReasoning: "project_intelligence",
  projectHealthProjections: "project_intelligence",
  operationalAppHealth: "project_intelligence.ops",
} as const;

export function assertProjectHealthOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("implementsOwnAiStack must be false");
  if (duplicateAgentRuntimeDetected) throw new Error("duplicate agent runtime");
  if (duplicateKnowledgeGraphDetected) throw new Error("duplicate knowledge graph");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (duplicateProjectControlsEngineDetected) throw new Error("duplicate project controls engine");
  if (duplicateCanonicalProjectDomainDetected) throw new Error("duplicate canonical project domain");
  if (SCHEMA_CHANGED) throw new Error("PI-0 must not change schema");
  if (PROJECT_HEALTH_NUMERICAL_SCORE_IMPLEMENTED) throw new Error("numerical score forbidden in PI-0");
  if (PROJECT_HEALTH_PERSISTED) throw new Error("persisted health snapshots forbidden in PI-0");
  if (PI_CANONICAL_MUTATION_BYPASS) throw new Error("canonical mutation bypass forbidden");
}
