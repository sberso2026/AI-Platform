import type { ReviewFindingCategory } from "@rtb/engineering-review";
import type { ArtifactType } from "../artifact-automation/types";
import type { GeneratorWorkType } from "../work-generator/types";
import type { LifecycleStage } from "../lifecycle-intelligence/types";

export const PRE_ISSUE_REVIEW_RECON = {
  engineeringReviewPackage: "REUSE",
  engineeringReviewRun: "REUSE",
  engineeringReviewFinding: "REUSE",
  engineeringReviewEvidence: "REUSE",
  engineeringReviewDisposition: "REUSE",
  era1Detectors: "REUSE",
  reviewAi: "REUSE",
  a8cAssuranceConditions: "COMPOSE",
  a8dAssuranceGovernance: "COMPOSE",
  a11aWorkPlans: "COMPOSE",
  a11bArtifacts: "COMPOSE",
  a11cReturnedArtifacts: "COMPOSE",
  informationIntelligence: "COMPOSE",
  informationRequirements: "COMPOSE",
  requirements: "COMPOSE",
  assumptions: "COMPOSE",
  interfaces: "COMPOSE",
  decisions: "COMPOSE",
  analysis: "COMPOSE",
  configuration: "COMPOSE",
  deliverables: "COMPOSE",
  digitalThread: "COMPOSE",
  engineeringWorkEvent: "EXTEND",
  duplicateReviewEngine: "NO",
  cadSemanticReview: "CONTRACT_ONLY",
} as const;

export const PRE_ISSUE_REVIEW_TARGETS = [
  "CALCULATION_WORKBOOK",
  "DESIGN_REPORT",
  "SPECIFICATION",
  "OPTION_STUDY",
  "OPTION_STUDY_PRESENTATION",
  "RFI_RESPONSE",
  "TQ_RESPONSE",
  "TECHNICAL_MEMORANDUM",
  "QUANTITY_SCHEDULE",
  "REVIEW_PACKAGE",
] as const;
export type PreIssueReviewTarget = (typeof PRE_ISSUE_REVIEW_TARGETS)[number];

export const PRE_ISSUE_CHECK_TYPES = [
  "CURRENT_INFORMATION_CHECK",
  "REVISION_AUTHORITY_CHECK",
  "INFORMATION_REQUIREMENT_CHECK",
  "REQUIREMENT_TRACEABILITY_CHECK",
  "ASSUMPTION_EVIDENCE_CHECK",
  "INTERFACE_STATUS_CHECK",
  "ANALYSIS_STALENESS_CHECK",
  "CONFIGURATION_CONTEXT_CHECK",
  "DELIVERABLE_EVIDENCE_CHECK",
  "ARTIFACT_PROVENANCE_CHECK",
  "WORK_PLAN_FINGERPRINT_CHECK",
  "SOURCE_SUPERSESSION_CHECK",
  "XLSX_STRUCTURE_CHECK",
  "GOVERNED_FORMULA_CHECK",
  "DOCX_STRUCTURE_CHECK",
  "PPTX_CONTEXT_CHECK",
  "RFI_TQ_CHECK",
  "CROSS_ARTIFACT_REVISION_CHECK",
  "COST_EVIDENCE_CHECK",
  "CONSTRUCTABILITY_EVIDENCE_CHECK",
  "CARBON_EVIDENCE_CHECK",
  "QUANTITY_PROVENANCE_CHECK",
  "CALCULATION_STALENESS_CHECK",
  "STRUCTURAL_DESIGN_BASIS_CHECK",
  "CALCULATION_FINGERPRINT_CHECK",
] as const;
export type PreIssueCheckType = (typeof PRE_ISSUE_CHECK_TYPES)[number];

export const PRE_ISSUE_CONDITION_CODES = [
  "STALE_SOURCE_REFERENCE",
  "REQUIRED_INFORMATION_EVIDENCE_MISSING",
  "REQUIRED_INFORMATION_STALE",
  "REQUIRED_INFORMATION_UNACCEPTED",
  "REQUIREMENT_TRACEABILITY_INCOMPLETE",
  "UNSUPPORTED_ASSUMPTION",
  "OPEN_REQUIRED_INTERFACE",
  "UNACCEPTED_INTERFACE_INFORMATION",
  "STALE_ANALYSIS_REFERENCE",
  "CONFIGURATION_CONTEXT_MISMATCH",
  "DELIVERABLE_EVIDENCE_MISSING",
  "ARTIFACT_PROVENANCE_MISSING",
  "WORK_PLAN_FINGERPRINT_CHANGED",
  "SOURCE_SUPERSEDED",
  "GOVERNED_FORMULA_REMOVED",
  "GOVERNED_FORMULA_CHANGED",
  "REQUIRED_SHEET_MISSING",
  "SOURCE_REGISTER_MISSING",
  "UNIT_METADATA_MISSING",
  "DOCX_STRUCTURE_GAP",
  "PPTX_CONTEXT_GAP",
  "AUTOMATIC_WINNER_PROHIBITED",
  "RFI_TQ_DRAFT_CONTEXT_INCOMPLETE",
  "CROSS_ARTIFACT_REVISION_INCONSISTENCY",
  "POSSIBLE_CROSS_DOCUMENT_INCONSISTENCY",
  "POSSIBLE_DESIGN_BASIS_CONFLICT",
  "POSSIBLE_UNSUPPORTED_ASSUMPTION",
  "POSSIBLE_MISSING_INFORMATION",
  "REQUIRED_COST_EVIDENCE_MISSING",
  "REQUIRED_CONSTRUCTABILITY_EVIDENCE_MISSING",
  "REQUIRED_CARBON_EVIDENCE_MISSING",
  "QUANTITY_PROVENANCE_MISSING",
  "QUANTITY_SOURCE_REVISION_MISSING",
  "QUANTITY_UNIT_MISSING",
  "QUANTITY_DERIVATION_INCOMPLETE",
  "QUANTITY_ASSUMPTION_UNIDENTIFIED",
  "QUANTITY_MATURITY_INCOMPATIBLE",
  "QUANTITY_AI_EXTRACTION_UNVERIFIED",
  "QUANTITY_GOVERNING_SOURCE_STALE",
  "COST_PRESENTED_WITHOUT_APPROVED_RATE",
  "CARBON_PRESENTED_WITHOUT_APPROVED_FACTOR",
  "ARTIFACT_MTO_SOURCE_CHANGED",
  "ARTIFACT_GENERATED_FROM_SUPERSEDED_MTO",
  "STALE_CALCULATION_REFERENCE",
  "CALCULATION_INPUT_FINGERPRINT_MISMATCH",
  "UNVERIFIED_CALCULATION",
  "DESIGN_BASIS_INCOMPLETE",
  "MISSING_GOVERNING_STANDARD",
  "MTO_INCONSISTENT_WITH_CALCULATION",
  "REPORT_BOUND_TO_STALE_CALCULATION",
  "CALCULATION_SOURCE_MISSING",
] as const;
export type PreIssueConditionCode = (typeof PRE_ISSUE_CONDITION_CODES)[number];

export const PRE_ISSUE_MATERIALITY = [
  "REQUIRES_ATTENTION",
  "INFORMATION_GAP",
  "STALE_CONTEXT",
  "TRACEABILITY_GAP",
  "REVIEW_CANDIDATE",
] as const;
export type PreIssueMateriality = (typeof PRE_ISSUE_MATERIALITY)[number];

export const PRE_ISSUE_RESULT_STATES = [
  "NO_BLOCKING_CONDITIONS_IDENTIFIED",
  "ATTENTION_REQUIRED",
  "CONTEXT_STALE",
  "REVIEW_INCOMPLETE",
  "REVIEW_FAILED",
] as const;
export type PreIssueResultState = (typeof PRE_ISSUE_RESULT_STATES)[number];

export const PRE_ISSUE_STALENESS = ["CURRENT", "POTENTIALLY_STALE", "STALE", "RERUN_REQUIRED"] as const;
export type PreIssueStaleness = (typeof PRE_ISSUE_STALENESS)[number];

export const PRE_ISSUE_ORIGIN = ["DETERMINISTIC", "AI_CANDIDATE", "ERA1_DETECTOR"] as const;
export type PreIssueOrigin = (typeof PRE_ISSUE_ORIGIN)[number];

export const FORBIDDEN_PRE_ISSUE_VERDICTS = [
  "DESIGN_APPROVED",
  "DESIGN_CORRECT",
  "DESIGN_INCORRECT",
  "SAFE",
  "UNSAFE",
  "SAFE_TO_BUILD",
  "CODE_COMPLIANT",
  "NON_COMPLIANT",
  "APPROVED",
  "REJECTED",
  "IFC_READY",
] as const;

export const PRE_ISSUE_AI_BOUNDARY = {
  mayCompareText: true,
  mayIdentifyPotentialInconsistency: true,
  maySummarizeDifferences: true,
  maySuggestWhereCheckerShouldLook: true,
  mayApproveDesign: false,
  mayRejectDesign: false,
  mayCertifyCalculation: false,
  mayDeclareCodeCompliance: false,
  mayDetermineStructuralSafety: false,
  maySelectDesignOption: false,
  mayModifyGovernedFormula: false,
  mayCreateFormalFindingAutomatically: false,
  autonomousApproval: false,
} as const;

export const PRE_ISSUE_PRIVACY = {
  localRecursiveScan: "PROHIBITED",
  personalFilesOutsideEos: true,
  unmanagedFilesCannotEnterReview: true,
  binaryDuplication: "NO" as const,
  artifactBinaryStorageRisk: "HIGH" as const,
  newReviewEngineCreated: false,
  newEventBusCreated: false,
  newGraphStoreCreated: false,
  newDmsCreated: false,
  realSolverExecution: false,
} as const;

export const PRE_ISSUE_POLICY_CODE = "EOS-PRE-ISSUE-REVIEW";
export const PRE_ISSUE_POLICY_VERSION = "1.0.0";
export const MAX_REVIEW_EXTRACT_BYTES = 15 * 1024 * 1024;

export type PreIssueCheckSpec = {
  checkType: PreIssueCheckType;
  required: boolean;
  aiAssisted: false;
  humanReviewRequired: true;
};

export type PreIssueReviewPolicy = {
  code: typeof PRE_ISSUE_POLICY_CODE;
  version: typeof PRE_ISSUE_POLICY_VERSION;
  applicableWorkTypes: readonly GeneratorWorkType[];
  applicableArtifactTypes: readonly ArtifactType[];
  applicableLifecycleStages: readonly LifecycleStage[] | readonly ["ANY"];
  disciplines: readonly string[] | readonly ["ANY"];
  checks: readonly PreIssueCheckSpec[];
  semanticAiPermitted: true;
  semanticAiRequired: false;
  humanReviewRequired: true;
  automaticFindingPromotion: false;
  automaticApproval: false;
};

export type ReviewInputRef = {
  objectType: string;
  objectId: string;
  title?: string | null;
  revision?: string | null;
  hash?: string | null;
  authorityOutcome?: string | null;
  freshness?: string | null;
};

export type PreIssueReviewSnapshot = {
  workPlanId: string;
  workPlanFingerprint: string;
  workType: GeneratorWorkType;
  lifecycleStage: string;
  discipline: string | null;
  projectId: string;
  targetArtifactId: string;
  targetArtifactHash: string;
  targetLineageKind: "GENERATED_DRAFT" | "RETURNED_FROM_ENGINEER";
  targetArtifactType: string;
  artifactIds: string[];
  artifactHashes: Array<{ id: string; sha256: string; lineageKind: string }>;
  information: ReviewInputRef[];
  informationRequirements: ReviewInputRef[];
  gaps: Array<{ kind: string; title: string }>;
  requirements: ReviewInputRef[];
  assumptions: ReviewInputRef[];
  interfaces: ReviewInputRef[];
  decisions: ReviewInputRef[];
  analyses: ReviewInputRef[];
  configuration: { baselineId?: string | null; fingerprint: string };
  deliverables: ReviewInputRef[];
  policyCode: string;
  policyVersion: string;
  binaryContentCopied: false;
};

export type PreIssueEvidence = {
  artifactId?: string | null;
  sourceId?: string | null;
  location?: string | null;
  statement: string;
};

export type PreIssueAction = {
  code:
    | "OPEN_ARTIFACT"
    | "OPEN_GOVERNING_SOURCE"
    | "OPEN_REQUIREMENT"
    | "OPEN_ASSUMPTION"
    | "OPEN_INTERFACE"
    | "OPEN_ANALYSIS"
    | "OPEN_DECISION"
    | "REFRESH_WORK_CONTEXT"
    | "REQUEST_INFORMATION"
    | "CREATE_REVIEW_PACKAGE"
    | "DISPOSITION"
    | "RERUN_REVIEW";
  label: string;
  href?: string | null;
  objectId?: string | null;
};

export type PreIssueCondition = {
  id: string;
  findingId: string;
  checkType: PreIssueCheckType | "SEMANTIC_AI_REVIEW" | "ERA1_DETECTOR";
  code: PreIssueConditionCode;
  title: string;
  explanation: string;
  materiality: PreIssueMateriality;
  origin: PreIssueOrigin;
  category: ReviewFindingCategory;
  status: "candidate";
  engineeringVerdict: null;
  evidence: PreIssueEvidence[];
  actions: PreIssueAction[];
  modelProvider?: string | null;
  modelId?: string | null;
  promptVersion?: string | null;
};

export type PreIssuePerformance = {
  deterministicDurationMs: number;
  extractionDurationMs: number;
  semanticAiDurationMs: number;
  sourcesEvaluated: number;
  checksEvaluated: number;
  digitalThreadTraversals: number;
};

export type PreIssueReviewRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPlanId: string;
  reviewPackageId: string;
  reviewRunId: string;
  policyCode: string;
  policyVersion: string;
  snapshot: PreIssueReviewSnapshot;
  targetArtifactId: string;
  targetArtifactHash: string;
  targetLineageKind: "GENERATED_DRAFT" | "RETURNED_FROM_ENGINEER";
  reviewingGeneratedDraft: boolean;
  resultState: PreIssueResultState;
  staleness: PreIssueStaleness;
  deterministicReview: "available";
  semanticAiReview: "available" | "unavailable";
  conditions: PreIssueCondition[];
  passedChecks: Array<{ checkType: PreIssueCheckType; title: string }>;
  notEvaluated: Array<{ checkType: PreIssueCheckType; reason: string }>;
  engineeringApproved: false;
  designApproved: false;
  codeCompliant: false;
  ifcReady: false;
  automaticFindings: false;
  binaryDuplication: "NO";
  performance: PreIssuePerformance;
  createdAt: string;
  createdBy: string | null;
};

export type PreIssueRerunComparison = {
  previousReviewId: string;
  resolved: string[];
  unchanged: string[];
  added: string[];
  noLongerApplicable: string[];
  governingContextChanged: boolean;
};
