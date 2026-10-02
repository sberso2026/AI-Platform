/**
 * EOS-A11E Change Impact, Option Study & Construction Engineering Workbench.
 * Composes canonical A4 Change / Impact, A5 Optimization, Decision Intelligence,
 * A8 Digital Thread, A11A–A11D. Does not create a competing change identity.
 */

export const CHANGE_WORKBENCH_RECON = {
  changeIntelligence: "REUSE",
  impactIntelligence: "EXTEND",
  decisionIntelligence: "REUSE",
  optimizationIntelligence: "REUSE",
  systems: "REUSE",
  interfaces: "REUSE",
  requirements: "REUSE",
  assumptions: "REUSE",
  informationIntelligence: "REUSE",
  informationRequirements: "REUSE",
  analysis: "REUSE",
  deliverables: "REUSE",
  lifecycle: "REUSE",
  engineeringReview: "REUSE",
  preIssueReview: "REUSE",
  digitalThread: "COMPOSE",
  workGenerator: "REUSE",
  artifactAutomation: "REUSE",
  toolOrchestration: "REUSE",
  engineeringWorkEvent: "EXTEND",
  actionWorkflow: "REUSE",
  rfiTq: "COMPOSE",
  constructionManagement: "OUT_OF_SCOPE",
  newChangeDomain: "NO",
  newOptimizationEngine: "NO",
  newDecisionDomain: "NO",
  newReviewEngine: "NO",
  newGraphStore: "NO",
  newEventBus: "NO",
  newDms: "NO",
} as const;

export const CHANGE_WORKBENCH_AI_BOUNDARY = {
  maySummarizeChange: true,
  mayExplainRelationPaths: true,
  mayDraftImpactNarrative: true,
  maySuggestPotentialQuestions: true,
  mayDraftRfiResponseText: true,
  maySummarizeOptionEvidence: true,
  mayProposeUnlinkedSemanticCandidates: true,
  mayConfirmImpact: false,
  mayApproveFieldChange: false,
  mayChooseOption: false,
  mayApproveRfiResponse: false,
  mayDetermineSafety: false,
  mayDetermineCodeCompliance: false,
  mayApproveChange: false,
  mayIssueCorrespondence: false,
  autonomousChangeApproval: false,
  autonomousFieldChangeApproval: false,
  worksWithoutApprovedModel: true,
} as const;

export const CHANGE_WORKBENCH_PRIVACY = {
  binaryDuplication: "NO" as const,
  artifactBinaryStorageRisk: "HIGH" as const,
  newContentBase64Column: false,
  newChangeDomainCreated: false,
  newOptimizationEngineCreated: false,
  newDecisionDomainCreated: false,
  newReviewEngineCreated: false,
  newGraphStoreCreated: false,
  newEventBusCreated: false,
  newDmsCreated: false,
  realConnectorsImplemented: false,
  realSolverExecutionImplemented: false,
  employeeProductivityScoring: "PROHIBITED" as const,
  malwareFailClosed: true,
  semanticAiReview: "unavailable" as const,
};

export const IMPACT_ASSESSMENT_STATES = [
  "DRAFT",
  "ANALYSING",
  "REVIEW_REQUIRED",
  "IN_REVIEW",
  "CONFIRMED",
  "SUPERSEDED",
  "CANCELLED",
] as const;
export type ImpactAssessmentStatus = (typeof IMPACT_ASSESSMENT_STATES)[number];

export const FORBIDDEN_IMPACT_ASSESSMENT_STATES = ["APPROVED_DESIGN", "SAFE", "IFC_READY"] as const;

export const IMPACT_DISPOSITIONS = [
  "POTENTIAL_IMPACT",
  "CONFIRMED_IMPACT",
  "NOT_IMPACTED",
  "NEEDS_INVESTIGATION",
  "DEFERRED",
] as const;
export type ImpactDisposition = (typeof IMPACT_DISPOSITIONS)[number];

export const IMPACT_CATEGORIES = [
  "INFORMATION",
  "REQUIREMENT",
  "ASSUMPTION",
  "INTERFACE",
  "ANALYSIS",
  "CALCULATION",
  "DRAWING",
  "SPECIFICATION",
  "MODEL",
  "DECISION",
  "DELIVERABLE",
  "CONFIGURATION",
  "CONSTRUCTION",
  "COMMISSIONING",
  "HANDOVER",
  "COST_INPUT",
  "SCHEDULE_INPUT",
  "REVIEW",
  "WORK_PLAN",
  "CHANGE",
  "SYSTEM",
  "ASSET",
  "QUERY",
] as const;
export type ImpactCategory = (typeof IMPACT_CATEGORIES)[number];

export const IMPACT_DISCOVERY_COMPLETENESS = ["COMPLETE", "PARTIAL", "FAILED"] as const;
export type ImpactDiscoveryCompleteness = (typeof IMPACT_DISCOVERY_COMPLETENESS)[number];

export const IMPACT_TRAVERSAL_STATUS = ["COMPLETE", "PARTIAL_TRAVERSAL", "FAILED"] as const;
export type ImpactTraversalStatus = (typeof IMPACT_TRAVERSAL_STATUS)[number];

export const IMPACT_STALENESS = ["CURRENT", "POTENTIALLY_STALE", "STALE", "RERUN_REQUIRED"] as const;
export type ImpactStaleness = (typeof IMPACT_STALENESS)[number];

export const IMPACT_WORKFLOWS = [
  "CHANGE_IMPACT",
  "OPTION_STUDY",
  "CONSTRUCTION_RFI",
  "FIELD_CHANGE",
  "COMMISSIONING",
  "HANDOVER",
  "CONCEPT_PFS",
  "FEED_CHANGE",
  "DETAILED_DESIGN_CHANGE",
] as const;
export type ImpactWorkflow = (typeof IMPACT_WORKFLOWS)[number];

export const IMPACT_CONFIDENCE_CATEGORIES = ["DETERMINISTIC_RELATION", "UNLINKED_SEMANTIC_CANDIDATE"] as const;
export type ImpactConfidenceCategory = (typeof IMPACT_CONFIDENCE_CATEGORIES)[number];

export const A11E_WORK_EVENTS = [
  "IMPACT_ASSESSMENT_STARTED",
  "IMPACT_ASSESSMENT_COMPLETED",
  "IMPACT_CONFIRMED",
  "OPTION_STUDY_CREATED",
  "RFI_ENGINEERING_RESPONSE_PREPARED",
  "FIELD_CHANGE_ASSESSED",
] as const;

export const FUTURE_A11E_ASSURANCE_CONDITIONS = [
  "IMPACT_ASSESSMENT_INCOMPLETE",
  "CONFIRMED_IMPACT_WITHOUT_ACTION",
  "CHANGE_WITH_STALE_REVIEW",
  "RFI_RESPONSE_MISSING_GOVERNING_SOURCE",
  "OPTION_STUDY_MISSING_EVIDENCE",
] as const;

export const SUGGESTED_ACTION_CODES = [
  "REFRESH_WORK_PLAN",
  "REGENERATE_WORK_PLAN",
  "RUN_IMPACT_ASSESSMENT",
  "REQUEST_INFORMATION",
  "RE_RUN_ANALYSIS",
  "PREPARE_ANALYSIS",
  "REVISE_CALCULATION",
  "REVISE_DRAWING",
  "UPDATE_SPECIFICATION",
  "REVIEW_DECISION",
  "RECORD_DECISION",
  "UPDATE_INTERFACE",
  "CREATE_REVIEW_PACKAGE",
  "PREPARE_CONSTRUCTION_RESPONSE",
  "REVIEW_DELIVERABLE",
  "UPDATE_HANDOVER_PACKAGE",
  "GENERATE_IMPACT_REPORT",
  "GENERATE_OPTION_STUDY",
  "RUN_PRE_ISSUE_REVIEW",
  "COMPARE_OPTIONS",
] as const;
export type SuggestedActionCode = (typeof SUGGESTED_ACTION_CODES)[number];

export type ImpactRelationStep = {
  objectType: string;
  objectId: string;
  relationship?: string;
  depth: number;
};

export type PotentialImpactCandidate = {
  id: string;
  objectType: string;
  objectId: string;
  objectCode: string | null;
  title: string | null;
  category: ImpactCategory;
  discipline: string | null;
  systemId: string | null;
  currentState: string | null;
  relationPath: ImpactRelationStep[];
  reason: string;
  traversalDepth: number;
  sourceEvidence: string;
  disposition: ImpactDisposition;
  autoConfirmed: false;
  confidenceCategory: ImpactConfidenceCategory;
  evidenceFingerprint: string;
  rationale: string | null;
  projectId: string;
};

export type SuggestedEngineeringAction = {
  code: SuggestedActionCode;
  label: string;
  candidateId: string | null;
  completed: false;
  reason: string;
};

export type EngineeringImpactPack = {
  kind: "ENGINEERING_IMPACT_PACK";
  binaryContentCopied: false;
  source: { objectType: string; objectId: string; projectId: string };
  assessmentId: string;
  references: Array<{ objectType: string; objectId: string; role: string }>;
  relationPaths: ImpactRelationStep[][];
};

export type OptionCriterion = {
  key: string;
  label: string;
  direction: "MINIMIZE" | "MAXIMIZE";
  unit: string | null;
  weight: number;
  weightSource: "HUMAN_ENTERED";
  role?: "OBJECTIVE" | "MANDATORY_CONSTRAINT";
  applicability?: "REQUIRED" | "REPORT_ONLY" | "OPTIONAL" | "NOT_APPLICABLE";
};

export type OptionAlternative = {
  id: string;
  code: string;
  name: string;
  description: string;
  metrics: Array<{ metric_key: string; value: number; unit: string | null }>;
  assumptions: string[];
  evidence: string[];
  unknowns: string[];
  constructability: string | null;
  operability: string | null;
  costInputAvailable: boolean;
  scheduleInputAvailable: boolean;
  safetyFeasible?: boolean;
  carbonInputAvailable?: boolean;
};

export type OptionStudyComposition = {
  id: string;
  title: string;
  criteria: OptionCriterion[];
  options: OptionAlternative[];
  pareto: Array<{ alternativeId: string; status: string }>;
  automaticWinner: false;
  selectedOptionId: string | null;
  humanDecisionRequired: true;
  humanDecisionRecorded: boolean;
  decisionId: string | null;
  optimizationReused: true;
  decisionIntelligenceReused: true;
  weightsVisible: true;
  criteriaVisible: true;
  missingEvidence: string[];
};

export type ConstructionWorkbenchContext = {
  queryId: string;
  queryType: "RFI" | "TQ" | "FIELD_CONDITION" | "FIELD_CHANGE" | "VENDOR_QUERY" | "COMMISSIONING_QUERY";
  summary: string;
  projectId: string;
  systemId: string | null;
  location: string | null;
  assembled: Array<{ objectType: string; objectId: string; title: string | null; role: string }>;
  missingInformation: string[];
  staleInformation: string[];
  requiredEngineeringInput: string[];
  workPlanType: "RFI_TQ_RESPONSE";
  humanDecisionRequired: true;
  technicalSolutionChosen: false;
};

export type ImpactDiscoveryPerformance = {
  traversalDurationMs: number;
  policyEvaluationDurationMs: number;
  candidateCount: number;
  nodesTraversed: number;
  relationsTraversed: number;
  optionStudyPreparationMs: number | null;
  constructionResponsePreparationMs: number | null;
};

export type EngineeringImpactAssessment = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  sourceObjectType: string;
  sourceObjectId: string;
  sourceChangeId: string | null;
  workflow: ImpactWorkflow;
  policyCode: string;
  policyVersion: string;
  status: ImpactAssessmentStatus;
  completeness: ImpactDiscoveryCompleteness;
  traversalStatus: ImpactTraversalStatus;
  staleness: ImpactStaleness;
  sourceFingerprint: string;
  graphFingerprint: string;
  snapshot: {
    sourceTitle: string | null;
    candidates: PotentialImpactCandidate[];
    actions: SuggestedEngineeringAction[];
    pack: EngineeringImpactPack;
    optionStudy: OptionStudyComposition | null;
    construction: ConstructionWorkbenchContext | null;
    disciplines: string[];
    systems: Array<{ objectId: string; title: string | null }>;
    performance: ImpactDiscoveryPerformance;
    humanReviewRequired: true;
    relatedIsNotAffected: true;
    potentialIsNotConfirmed: true;
    automaticImpactConfirmation: false;
    automaticOptionWinner: false;
    automaticCostAcceptance: false;
    automaticConstructabilityAcceptance: false;
    automaticCarbonAcceptance: false;
    valueImpacts: Array<{
      dimension: "TECHNICAL" | "QUANTITY" | "COST" | "CONSTRUCTABILITY" | "SCHEDULE" | "CARBON";
      status: "POTENTIAL";
      quantified: false;
      autoConfirmed: false;
      objectType: string;
      objectId: string;
      reason: string;
    }>;
    semanticCandidatesDistinguished: true;
    binaryDuplication: "NO";
  };
  supersedesAssessmentId: string | null;
  viewProjectMismatch: boolean;
  createdAt: string;
  createdBy: string | null;
};
