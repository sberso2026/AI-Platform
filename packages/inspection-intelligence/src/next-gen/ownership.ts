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
export const AUTONOMOUS_INSPECTION_APPROVAL_ENABLED = autonomousInspectionApprovalEnabled;
export const AUTONOMOUS_CONDITION_CERTIFICATION_ENABLED = autonomousConditionRatingCertificationEnabled;
export const AUTONOMOUS_REMEDIATION_APPROVAL_ENABLED = autonomousRemediationApprovalEnabled;
export const DUPLICATE_FINDING_MODEL_DETECTED = false as const;
export const DUPLICATE_ACTION_MODEL_DETECTED = false as const;
export const DUPLICATE_CONDITION_MODEL_DETECTED = false as const;
export const DUPLICATE_FILE_MODEL_DETECTED = false as const;
export const DUPLICATE_ENGINEERING_TRUTH_MODEL_DETECTED = duplicateEngineeringTruthModelDetected;
export const DATABASE_POLICY_CHANGED = false as const;
export const externalWritesEnabled = false as const;
export const SCHEMA_CHANGED = false as const;
export const II_COMMAND_CENTRE_IMPLEMENTED = true as const;
export const II_AI_INSPECTION_ENGINEER_IMPLEMENTED = true as const;
export const II_HOSTED_PERSISTENCE_WIRED = true as const;
export const duplicatePersistenceModelDetected = false as const;
/** Hosted persistence of existing inspection_* tables is wired. */
export const II_1_READY = true as const;
export const II_1_IMPLEMENTED = true as const;
/** Planning and execution operational surfaces over hosted records. */
export const II_2_READY = true as const;
export const II_2_IMPLEMENTED = true as const;
/** Defect, condition, recommendation, CA, and evidence operational surfaces. */
export const II_3_READY = true as const;
export const II_3_IMPLEMENTED = true as const;
/** Inspection History and governed reporting over canonical inspection_* records. */
export const II_4_READY = true as const;
export const II_4_IMPLEMENTED = true as const;
/** AI Inspection Engineer — governed advisory assistant over Platform AI. */
export const II_5_READY = true as const;
export const II_5_IMPLEMENTED = true as const;
/** Inspection Command Centre composition over existing inspection_* records. */
export const II_6_READY = true as const;
export const II_6_IMPLEMENTED = true as const;
/** II-6P shared-platform latency classification and request-scoped reuse. */
export const II_6P_IMPLEMENTED = true as const;
/** II-6R runtime topology + query-plan closure. */
export const II_6R_IMPLEMENTED = true as const;
export const PLATFORM_SHARED_BEHAVIOR_CHANGED = true as const;
export const DUPLICATE_COMMAND_CENTRE_MODEL_DETECTED = false as const;
/** Classified from live profiles in II-6/II-6P. Updated after measurement. */
export const II_OPERATIONAL_WRITE_GA_PERFORMANCE_ACCEPTABLE = false as const;
export const II_HISTORY_GA_PERFORMANCE_ACCEPTABLE = false as const;
export const II_TARGET_HISTORY_GA_PERFORMANCE_ACCEPTABLE = false as const;
export const II_REPORT_GA_PERFORMANCE_ACCEPTABLE = false as const;
export const II_COMMAND_CENTRE_GA_PERFORMANCE_ACCEPTABLE = false as const;
export const II_PERFORMANCE_GA_BLOCKER_OPEN = true as const;
export const II_RELEASE_CANDIDATE_READY = false as const;
export const II_LATENCY_CLASSIFICATION = "MIXED" as const;
export const II_PERFORMANCE_ROOT_CAUSE_ESTABLISHED = true as const;
export const II_PERFORMANCE_OPTIMIZATION_PASS = true as const;
export const DUPLICATE_HISTORY_MODEL_DETECTED = false as const;
export const DUPLICATE_REPORTING_TRUTH_MODEL_DETECTED = false as const;
export const DUPLICATE_ASSET_TRUTH_MODEL_DETECTED = false as const;
export const DIRECT_PROVIDER_ACCESS_FROM_II = directProviderAccessFromInspectionIntelligence;
export const EXTERNAL_WRITES_ENABLED = externalWritesEnabled;

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
  if (SCHEMA_CHANGED) throw new Error("II-0/II-1 must not change inspection truth-model schema");
  if (DUPLICATE_COMMAND_CENTRE_MODEL_DETECTED) throw new Error("duplicate command centre model");
  if (duplicatePersistenceModelDetected) throw new Error("duplicate persistence model");
  if (!II_COMMAND_CENTRE_IMPLEMENTED) throw new Error("Inspection Command Centre must be implemented in II-6");
  if (!II_HOSTED_PERSISTENCE_WIRED) throw new Error("hosted persistence must be wired in II-1");
}
