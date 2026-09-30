/**
 * EOS-A10A Engineering Information Intelligence.
 * References canonical engineering objects. Does not copy them.
 * Authority is purpose-specific governed policy, not engineering approval.
 */

export const INFORMATION_AI_BOUNDARY = {
  maySuggestSources: true,
  mayExplainDifferences: true,
  maySummarizeProvenance: true,
  maySurfaceAmbiguity: true,
  maySelectAuthoritativeSource: false,
  mayOverrideConfiguredAuthority: false,
  mayApproveInformation: false,
  mayResolveTechnicalConflicts: false,
  mayDeclareCompliance: false,
  mayAuthorizeConstruction: false,
} as const;

export const INFORMATION_SOURCE_OBJECT_TYPES = [
  "document",
  "model",
  "dataset",
  "analysis_result",
  "requirement",
  "assumption",
  "decision",
  "interface",
  "configuration_baseline",
  "review_package",
  "deliverable_expectation",
  "external_reference",
] as const;
export type InformationSourceObjectType = (typeof INFORMATION_SOURCE_OBJECT_TYPES)[number];

export const INFORMATION_SOURCE_KINDS = [
  "DOCUMENT",
  "MODEL",
  "DATASET",
  "ANALYSIS_RESULT",
  "REQUIREMENT",
  "ASSUMPTION",
  "DECISION",
  "INTERFACE_INFORMATION",
  "CONFIGURATION_BASELINE",
  "REVIEW_PACKAGE",
  "DELIVERABLE",
  "EXTERNAL_REFERENCE",
] as const;
export type InformationSourceKind = (typeof INFORMATION_SOURCE_KINDS)[number];

export const INFORMATION_TYPES = [
  "DESIGN_BASIS",
  "DESIGN_CRITERIA",
  "LOAD_DATA",
  "EQUIPMENT_DATA",
  "PROCESS_DATA",
  "MATERIAL_PROPERTY",
  "CALCULATION",
  "ANALYSIS_OUTPUT",
  "DRAWING",
  "MODEL",
  "SPECIFICATION",
  "DATASHEET",
  "INTERFACE_DATA",
  "SURVEY_DATA",
  "INSPECTION_DATA",
  "TEST_DATA",
  "REQUIREMENT_INFORMATION",
  "DECISION_INFORMATION",
  "REFERENCE_INFORMATION",
] as const;
export type InformationType = (typeof INFORMATION_TYPES)[number];

export const INFORMATION_PURPOSES = [
  "FOR_DESIGN_INPUT",
  "FOR_COORDINATION",
  "FOR_ENGINEERING_REVIEW",
  "FOR_CONFIGURATION",
  "FOR_CONSTRUCTION_REFERENCE",
  "FOR_COMMISSIONING",
  "FOR_OPERATIONS_REFERENCE",
] as const;
export type InformationPurpose = (typeof INFORMATION_PURPOSES)[number];

export const INFORMATION_AUTHORITY_STATES = [
  "AUTHORITATIVE_FOR_PURPOSE",
  "ACCEPTED_REFERENCE",
  "WORKING_INFORMATION",
  "UNVERIFIED",
  "SUPERSEDED",
  "STALE",
  "CONFLICTING_AUTHORITY",
  "NOT_APPLICABLE",
  "UNKNOWN",
] as const;
export type InformationAuthorityState = (typeof INFORMATION_AUTHORITY_STATES)[number];

export const INFORMATION_FRESHNESS_STATES = [
  "CURRENT",
  "POTENTIALLY_STALE",
  "STALE",
  "SUPERSEDED",
  "UNKNOWN",
] as const;
export type InformationFreshnessState = (typeof INFORMATION_FRESHNESS_STATES)[number];

export const INFORMATION_RESOLUTION_OUTCOMES = [
  "RESOLVED",
  "NO_SOURCE",
  "NO_ELIGIBLE_SOURCE",
  "NO_AUTHORITATIVE_SOURCE",
  "AMBIGUOUS",
  "CONFLICT",
  "SOURCE_STALE",
  "SOURCE_SUPERSEDED",
  "POLICY_NOT_CONFIGURED",
] as const;
export type InformationResolutionOutcome = (typeof INFORMATION_RESOLUTION_OUTCOMES)[number];

export const INFORMATION_SCOPE_TYPES = ["PROJECT", "SYSTEM", "SUBSYSTEM", "ASSET", "DISCIPLINE", "PACKAGE", "LIFECYCLE_STAGE", "CONFIGURATION_BASELINE"] as const;
export type InformationScopeType = (typeof INFORMATION_SCOPE_TYPES)[number];

export type InformationClassification = {
  informationType: InformationType;
  discipline?: string | null;
  systemId?: string | null;
  assetId?: string | null;
  lifecycleStage?: string | null;
  engineeringPurpose: InformationPurpose;
  sourceKind: InformationSourceKind;
  configurationBaselineId?: string | null;
};

export type InformationApplicability = {
  projectId: string;
  systemId?: string | null;
  subsystemId?: string | null;
  assetId?: string | null;
  discipline?: string | null;
  packageId?: string | null;
  lifecycleStage?: string | null;
  configurationBaselineId?: string | null;
};

export type SourceDomainFacts = {
  revision?: string | null;
  revisionAuthority?: "DOCUMENT_REVISION" | "BASELINE_PINNED" | "ANALYSIS_IDENTITY" | "DECISION_SUPERSESSION" | "NONE";
  superseded?: boolean;
  supersedesSourceObjectId?: string | null;
  stale?: boolean;
  staleReasons?: string[];
  effectiveFrom?: string | null;
  effectiveUntil?: string | null;
  sourceSystem?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  toolAdapter?: string | null;
  inputFingerprint?: string | null;
  baselineId?: string | null;
  reviewId?: string | null;
  decisionId?: string | null;
};

export type EngineeringInformationRef = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  sourceObjectType: InformationSourceObjectType;
  sourceObjectId: string;
  informationType: InformationType;
  sourceKind: InformationSourceKind;
  discipline?: string | null;
  responsibleDiscipline?: string | null;
  systemId?: string | null;
  assetId?: string | null;
  lifecycleStage?: string | null;
  purpose: InformationPurpose;
  configurationBaselineId?: string | null;
  eligibility: "WORKING" | "ELIGIBLE_AUTHORITATIVE" | "ACCEPTED_REFERENCE" | "UNVERIFIED" | "NOT_APPLICABLE";
  sourceFacts: SourceDomainFacts;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InformationAuthorityPolicy = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  policyId: string;
  policyVersion: string;
  informationType: InformationType;
  purpose: InformationPurpose;
  discipline?: string | null;
  systemId?: string | null;
  lifecycleStage?: string | null;
  eligibleSourceKinds: InformationSourceKind[];
  eligibleSourceObjectTypes: InformationSourceObjectType[];
  requireAuthoritativeSource: boolean;
  createdBy?: string | null;
  createdAt: string;
};

export type InformationCandidateExplanation = {
  refId: string;
  sourceObjectType: InformationSourceObjectType;
  sourceObjectId: string;
  eligibility: EngineeringInformationRef["eligibility"];
  freshness: InformationFreshnessState;
  authorityState: InformationAuthorityState;
  considered: boolean;
  ineligibleReasons: string[];
};

export type InformationAuthorityResolution = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  informationType: InformationType;
  purpose: InformationPurpose;
  scope: InformationApplicability;
  outcome: InformationResolutionOutcome;
  authorityState: InformationAuthorityState;
  freshness: InformationFreshnessState;
  selectedRefId: string | null;
  candidateRefIds: string[];
  policyId: string | null;
  policyVersion: string | null;
  explanation: {
    whyApplies: string;
    policy: string;
    scope: string;
    revision: string;
    alternatives: string[];
    ineligible: string[];
    conflictOrAmbiguity: string | null;
    engineeringApproved: false;
  };
  candidates: InformationCandidateExplanation[];
  provenance: {
    resolvedAt: string;
    resolvedBy: string;
    sourceFacts: SourceDomainFacts | null;
  };
  metrics: {
    candidateCount: number;
    policyEvaluations: number;
    relationsTraversed: number;
    durationMs: number;
  };
  createdAt: string;
};

export type ResolveInformationInput = {
  projectId: string;
  informationType: InformationType;
  purpose: InformationPurpose;
  scope?: Partial<InformationApplicability>;
  lifecycleStage?: string | null;
  discipline?: string | null;
  systemId?: string | null;
  assetId?: string | null;
  configurationBaselineId?: string | null;
  policyVersion?: string | null;
  actorId: string;
  now?: string;
};

export const CALLER_SUPPLIED_AUTHORITY_KEYS = [
  "authoritative",
  "current",
  "approved",
  "sourcePriority",
] as const;
