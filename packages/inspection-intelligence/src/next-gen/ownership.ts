/**
 * II-0 canonical ownership freeze. Does not create new truth models.
 */
export const INSPECTION_INTELLIGENCE_II_0_PHASE = "II-0" as const;

export const implementsOwnAiStack = false as const;
export const duplicateAgentRuntimeDetected = false as const;
export const duplicateKnowledgeGraphDetected = false as const;
export const duplicateIntegrationStackDetected = false as const;
export const duplicateWorkflowEngineDetected = false as const;
export const duplicateIdentityStackDetected = false as const;
export const duplicateCommerceStackDetected = false as const;
export const duplicateEngineeringTruthModelDetected = false as const;
export const directProviderAccessFromInspectionIntelligence = false as const;
export const autonomousInspectionApprovalEnabled = false as const;
export const autonomousConditionRatingCertificationEnabled = false as const;
export const autonomousRemediationApprovalEnabled = false as const;
export const externalWritesEnabled = false as const;
export const SCHEMA_CHANGED = false as const;
export const II_COMMAND_CENTRE_IMPLEMENTED = false as const;
export const II_AI_INSPECTION_ENGINEER_IMPLEMENTED = false as const;
export const II_HOSTED_PERSISTENCE_WIRED = false as const;
/** Hosted persistence of existing inspection_* tables is the II-1 objective. */
export const II_1_READY = true as const;

export const INSPECTION_INTELLIGENCE_PLATFORM_OWNERSHIP = {
  project: "engineering_os_shared_project_domain",
  asset: "engineering_os_shared_domain",
  location: "engineering_os_shared_spatial_domain",
  company: "engineering_os_shared_domain",
  user: "platform_identity",
  document: "engineering_os_shared_domain",
  coreAction: "engineering_core",
  coreRisk: "engineering_core",
  coreDecision: "engineering_core",
  files: "platform_files",
  audit: "platform_core.audit",
  identity: "platform_identity",
  commerce: "platform_commerce",
  knowledgeGraph: "platform_intelligence.knowledge_graph",
} as const;

export const INSPECTION_INTELLIGENCE_OWNED_RECORDS = {
  plansTemplates: "inspection_intelligence",
  sessions: "inspection_intelligence",
  observations: "inspection_intelligence",
  measurements: "inspection_intelligence",
  inspectionEvidence: "inspection_intelligence",
  inspectionDefects: "inspection_intelligence",
  inspectionRecommendations: "inspection_intelligence",
  correctiveActionProcessState: "inspection_intelligence",
  conditionAssessments: "inspection_intelligence",
  verificationCloseOut: "inspection_intelligence",
  inspectionReportingPreparation: "inspection_intelligence",
} as const;

export const INSPECTION_COUPLING_BOUNDARY = "inspection_target" as const;

export const INSPECTION_INTELLIGENCE_MUST_NOT_OWN = [
  "projects",
  "assets",
  "documents",
  "users",
  "risks",
  "actions",
  "decisions",
  "project_intelligence_findings",
  "knowledge_records",
] as const;

export function assertInspectionIntelligenceOwnershipLocks(): void {
  if (implementsOwnAiStack) throw new Error("implementsOwnAiStack must be false");
  if (duplicateAgentRuntimeDetected) throw new Error("duplicate agent runtime");
  if (duplicateKnowledgeGraphDetected) throw new Error("duplicate knowledge graph");
  if (duplicateIntegrationStackDetected) throw new Error("duplicate integration stack");
  if (duplicateWorkflowEngineDetected) throw new Error("duplicate workflow engine");
  if (duplicateIdentityStackDetected) throw new Error("duplicate identity stack");
  if (duplicateCommerceStackDetected) throw new Error("duplicate commerce stack");
  if (duplicateEngineeringTruthModelDetected) throw new Error("duplicate engineering truth model");
  if (directProviderAccessFromInspectionIntelligence) {
    throw new Error("direct provider access from Inspection Intelligence forbidden");
  }
  if (autonomousInspectionApprovalEnabled) throw new Error("autonomous inspection approval forbidden");
  if (autonomousConditionRatingCertificationEnabled) {
    throw new Error("autonomous condition-rating certification forbidden");
  }
  if (autonomousRemediationApprovalEnabled) throw new Error("autonomous remediation approval forbidden");
  if (externalWritesEnabled) throw new Error("external writes forbidden");
  if (SCHEMA_CHANGED) throw new Error("II-0 must not change schema");
  if (II_COMMAND_CENTRE_IMPLEMENTED) throw new Error("Inspection Command Centre must not start in II-0");
  if (II_AI_INSPECTION_ENGINEER_IMPLEMENTED) throw new Error("AI Inspection Engineer must not start in II-0");
  if (II_HOSTED_PERSISTENCE_WIRED) throw new Error("hosted persistence must not start in II-0");
}
