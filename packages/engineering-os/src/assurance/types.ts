/**
 * EOS-A8C Engineering Traceability & Assurance Intelligence.
 * Assurance Conditions are deterministic governance/traceability states.
 * They are not defects, non-compliances, design errors, safety failures, or approvals.
 */

export const ASSURANCE_JOB_TYPE = "engineering.assurance.evaluate" as const;

export const ASSURANCE_CONDITION_STATUSES = [
  "OPEN",
  "ACKNOWLEDGED",
  "UNDER_REVIEW",
  "RESOLVED",
  "ACCEPTED_WITH_JUSTIFICATION",
  "NOT_APPLICABLE",
  "SUPERSEDED",
] as const;
export type AssuranceConditionStatus = (typeof ASSURANCE_CONDITION_STATUSES)[number];

export const OPEN_ASSURANCE_STATUSES: readonly AssuranceConditionStatus[] = [
  "OPEN",
  "ACKNOWLEDGED",
  "UNDER_REVIEW",
];

export const ASSURANCE_CONDITION_TYPES = [
  "TRACEABILITY_GAP",
  "MISSING_ALLOCATION",
  "MISSING_SUPPORTING_EVIDENCE",
  "MISSING_REQUIRED_REVIEW",
  "STALE_EVIDENCE_REFERENCE",
  "SUPERSEDED_EVIDENCE_REFERENCE",
  "INCOMPLETE_INTERFACE_INFORMATION",
  "CROSS_DISCIPLINE_INFORMATION_GAP",
  "UNRESOLVED_DEPENDENCY",
  "UNRESOLVED_CHANGE_IMPACT_CANDIDATE",
  "MISSING_CONFIGURATION_PROVENANCE",
  "MISSING_REQUIRED_ASSUMPTION_CONTEXT",
  "ANALYSIS_RESULT_NOT_REVIEWED",
  "ANALYSIS_RESULT_NOT_ACCEPTED",
  "REQUIREMENT_VERIFICATION_INCOMPLETE",
] as const;
export type AssuranceConditionType = (typeof ASSURANCE_CONDITION_TYPES)[number];

export const ASSURANCE_DOMAINS = [
  "REQUIREMENT",
  "DECISION",
  "ASSUMPTION",
  "INTERFACE",
  "ANALYSIS",
  "CHANGE",
  "CONFIGURATION",
  "REVIEW",
  "OPTIMIZATION",
  "CROSS_DISCIPLINE",
] as const;
export type AssuranceDomain = (typeof ASSURANCE_DOMAINS)[number];

export const ASSURANCE_MATERIALITY = ["UNASSESSED", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type AssuranceMateriality = (typeof ASSURANCE_MATERIALITY)[number];

export const ASSURANCE_DISPOSITIONS = [
  "ACCEPT",
  "NOT_APPLICABLE",
  "DEFER",
  "CREATE_REVIEW",
  "CREATE_ISSUE",
  "RESOLVED_BY_ENGINEERING_CHANGE",
] as const;
export type AssuranceDisposition = (typeof ASSURANCE_DISPOSITIONS)[number];

export const ASSURANCE_RESOLUTION_SOURCES = [
  "CANONICAL_STATE_CHANGED",
  "HUMAN_DISPOSITION",
  "SUPERSEDED_BY_RULE",
  "RULE_DISABLED",
] as const;
export type AssuranceResolutionSource = (typeof ASSURANCE_RESOLUTION_SOURCES)[number];

export const TRACEABILITY_MATURITY_STATES = [
  "DRAFT",
  "WORKING",
  "REVIEWED",
  "VERIFIED",
  "APPROVED",
  "ISSUED",
  "SUPERSEDED",
  "NOT_APPLICABLE",
] as const;
export type TraceabilityMaturityState = (typeof TRACEABILITY_MATURITY_STATES)[number];

export type AssuranceEvidenceStep = {
  objectType: string;
  objectId: string;
  objectCode?: string | null;
  relationship?: string | null;
  note?: string | null;
};

export type AssuranceRelatedObject = {
  objectType: string;
  objectId: string;
  objectCode?: string | null;
  role: string;
};

export type AssurancePriorityFactors = {
  materiality: AssuranceMateriality;
  objectCriticality: AssuranceMateriality | "UNASSESSED";
  overdue: boolean;
  requiredByAt?: string | null;
  ageDays: number;
};

export type EngineeringAssuranceCondition = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId?: string | null;
  fingerprint: string;
  ruleId: string;
  ruleVersion: string;
  conditionCode: string;
  conditionType: AssuranceConditionType;
  assuranceDomain: AssuranceDomain;
  rootObjectType: string;
  rootObjectId: string;
  relatedObjectType?: string | null;
  relatedObjectId?: string | null;
  discipline?: string | null;
  lifecycleStage?: string | null;
  status: AssuranceConditionStatus;
  materiality: AssuranceMateriality;
  detectedAt: string;
  lastEvaluatedAt: string;
  resolvedAt?: string | null;
  resolutionSource?: AssuranceResolutionSource | null;
  explanation: string;
  wouldResolveIf: string;
  evidencePath: AssuranceEvidenceStep[];
  digitalThreadPath: string;
  relatedObjects: AssuranceRelatedObject[];
  priorityFactors: AssurancePriorityFactors;
  requiredByAt?: string | null;
  ownerId?: string | null;
  disposition?: AssuranceDisposition | null;
  dispositionBy?: string | null;
  dispositionAt?: string | null;
  dispositionRationale?: string | null;
  reviewPackageId?: string | null;
  issueId?: string | null;
  automaticDefect: false;
  automaticCompliance: false;
  automaticConfirmedImpact: false;
};

export type AssuranceDetection = Omit<
  EngineeringAssuranceCondition,
  | "id"
  | "status"
  | "detectedAt"
  | "lastEvaluatedAt"
  | "resolvedAt"
  | "resolutionSource"
  | "ownerId"
  | "disposition"
  | "dispositionBy"
  | "dispositionAt"
  | "dispositionRationale"
  | "reviewPackageId"
  | "issueId"
  | "automaticDefect"
  | "automaticCompliance"
  | "automaticConfirmedImpact"
> & {
  contextKey?: string | null;
};

export type AssuranceRule = {
  ruleId: string;
  ruleVersion: string;
  name: string;
  description: string;
  conditionType: AssuranceConditionType;
  assuranceDomain: AssuranceDomain;
  applicableObjectTypes: readonly string[];
  applicableDisciplines?: readonly string[];
  applicableMaturity: readonly TraceabilityMaturityState[];
  enabled: true;
};

export type InterfaceInformationFact = {
  interfaceId: string;
  informationKey: string;
  status: string;
  sourceDiscipline?: string | null;
  receivingDiscipline?: string | null;
  description?: string | null;
};

export type AssuranceEvaluationInput = {
  tenantId: string;
  workspaceId: string;
  graph: import("../digital-thread/types").ThreadGraphInput;
  interfaceInformation?: readonly InterfaceInformationFact[];
  now?: string;
  enabledRuleIds?: readonly string[];
  objectFilter?: { objectType: string; objectId: string };
  ruleFilter?: string;
  graphTruncated?: boolean;
  linkCount?: number;
  linkLimit?: number;
};

export const ASSURANCE_COMPLETENESS = ["COMPLETE", "PARTIAL", "FAILED"] as const;
export type AssuranceCompleteness = (typeof ASSURANCE_COMPLETENESS)[number];

export type AssuranceEvaluationRun = {
  id?: string;
  tenantId: string;
  workspaceId: string;
  startedAt: string;
  completedAt: string;
  triggeredBy?: string | null;
  completeness: AssuranceCompleteness;
  truncated: boolean;
  linkCount: number;
  linkLimit: number;
  objectsEvaluated: number;
  rulesEvaluated: number;
  conditionsDetected: number;
  conditionsResolved: number;
  conditionsCreated: number;
  remainingScopeUnknown: boolean;
  rulesetFingerprint: string;
  failureReason?: string | null;
  reason?: string | null;
};

export type AssuranceReviewCitation = {
  id: string;
  tenantId: string;
  workspaceId: string;
  conditionId: string;
  reviewPackageId: string;
  createdBy?: string | null;
  createdAt: string;
};

export type AssuranceReviewFindingRef = {
  id: string;
  reviewPackageId: string;
  title: string;
  status: string;
  ownedBy: "engineering-review";
};

export type AssuranceRuleSetting = {
  id?: string;
  tenantId: string;
  workspaceId: string;
  ruleId: string;
  ruleVersion: string;
  enabled: boolean;
  configuredBy?: string | null;
  configuredAt: string;
};

export type EffectiveAssuranceRule = {
  ruleId: string;
  ruleVersion: string;
  name: string;
  description: string;
  assuranceDomain: AssuranceDomain;
  conditionType: AssuranceConditionType;
  applicableObjectTypes: readonly string[];
  applicableMaturity: readonly string[];
  catalogDefaultEnabled: true;
  overrideEnabled: boolean | null;
  effectiveEnabled: boolean;
};

export type AssuranceSummary = {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byDiscipline: Record<string, number>;
  byMateriality: Record<string, number>;
  byObjectType: Record<string, number>;
  byRule: Record<string, number>;
  universalAssuranceScore: false;
  engineeringQualityScore: false;
  digitalThreadHealthScore: false;
};

export const AI_ASSURANCE_BOUNDARY = {
  maySummarizeConditions: true,
  mayExplainRetrievedEvidence: true,
  mayGroupRelatedConditions: true,
  mayDraftReviewOrIssueTextForHuman: true,
  mayNavigateDigitalThread: true,
  mayCreateAuthoritativeConditions: false,
  mayChangeMaterialityAutonomously: false,
  mayResolveConditions: false,
  mayAcceptRisk: false,
  mayApproveEngineering: false,
  mayDeclareCompliance: false,
  mayDeclareDesignSafe: false,
  mayConfirmChangeImpact: false,
} as const;

export const ASSURANCE_AUTHORITY = {
  humanEngineeringJudgmentRemainsAuthoritative: true,
  conditionsAreNotDefects: true,
  conditionsAreNotReviewFindings: true,
  conditionsAreNotIssues: true,
  platformKgIsNotAssuranceAuthority: true,
} as const;
